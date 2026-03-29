import os
import numpy as np
import pandas as pd
import librosa
import joblib
import tensorflow as tf
import yt_dlp
from datetime import datetime, timezone
from app.core.config import settings
from app.models.history import PredictionHistory
from tensorflow.keras.models import Model
from tensorflow.keras.layers import (Input, Dense, Dropout, Concatenate,
                                            BatchNormalization, Activation)
from tensorflow.keras.regularizers import l2


class AIService:
    def __init__(self):
        base_path = os.path.join(os.path.dirname(__file__), "../ml_assets")
        print(f"Loading AI Models from {base_path}...")

        # Load processors first — needed to infer input dimensions
        self.meta_proc_nn  = joblib.load(os.path.join(base_path, "meta_preprocessor.joblib"))
        self.audio_proc_nn = joblib.load(os.path.join(base_path, "audio_preprocessor.joblib"))
        self.gbm_model     = joblib.load(os.path.join(base_path, "gbm_meta_model.joblib"))

        # Dummy rows to probe output dimensions of each preprocessor
        dummy_meta = self.meta_proc_nn.transform(pd.DataFrame([{
            'Subscribers Count': 0, 'Number of Uploads': 0, 'Duration (seconds)': 0,
            'Title_Length': 0, 'Desc_Length': 0, 'Tag_Count': 0,
            'Video_Age_Days': 1, 'Channel_Age_Days': 1, 'Channel_Avg_Views': 0.0,
            'Weekday': 'Monday', 'Licensed Content': 0
        }]))
        dummy_audio = self.audio_proc_nn.transform(pd.DataFrame([{
            'Tempo': 0, 'ZCR_Mean': 0, 'ZCR_Var': 0,
            'Spectral_Centroid_Mean': 0, 'Spectral_Centroid_Var': 0,
            'RMSE_Mean': 0, 'RMSE_Var': 0,
            **{f'MFCC_{i}_Mean': 0 for i in range(1, 14)},
            **{f'MFCC_{i}_Var':  0 for i in range(1, 14)}
        }]))

        # Build architecture then load weights
        self.nn_model = self._build_dnn(dummy_meta.shape[1], dummy_audio.shape[1])
        self.nn_model.load_weights(os.path.join(base_path, "musicular_dnn.weights.h5"))

        print("All AI Models & Processors Loaded Successfully.")

    def _save_to_history(self, db, user_id, result, meta, video_id, model_type, input_type):
        if user_id == 1:
            return
        try:
            db_obj = PredictionHistory(
                user_id=user_id,
                title=meta.get('title', 'Unknown'),
                video_id=video_id,
                input_type=input_type,
                predicted_views=int(result['predicted_views']),
                confidence_score=float(result['confidence_score']),
                model_used=model_type,
                input_data=result['input_features']
            )
            db.add(db_obj)
            db.commit()
            print(f"Saved history for User {user_id}")
        except Exception as e:
            print(f"Failed to save history: {e}")
            db.rollback()

    def _detect_key(self, y, sr):
        """
        Krumhansl-Schmuckler key-finding algorithm.
        Correlates the mean chroma vector against major and minor tonal profiles
        for all 12 pitch classes and returns the best matching key as a string
        e.g. 'A Minor' or 'C# Major'.
        """
        major_profile = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09,
                                   2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
        minor_profile = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53,
                                   2.54, 4.75, 3.98, 2.69, 3.34, 3.17])
        key_names = ['C', 'C#', 'D', 'D#', 'E', 'F',
                     'F#', 'G', 'G#', 'A', 'A#', 'B']
        try:
            chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
            chroma_mean = np.mean(chroma, axis=1)
            best_key, best_corr = 'C Major', -np.inf
            for i in range(12):
                rotated = np.roll(chroma_mean, -i)
                maj_corr = np.corrcoef(rotated, major_profile)[0, 1]
                min_corr = np.corrcoef(rotated, minor_profile)[0, 1]
                if maj_corr > best_corr:
                    best_corr, best_key = maj_corr, f"{key_names[i]} Major"
                if min_corr > best_corr:
                    best_corr, best_key = min_corr, f"{key_names[i]} Minor"
            return best_key
        except Exception:
            return 'Unknown'

    def _extract_audio_features(self, file_path):
        y, sr = librosa.load(file_path, duration=30)
        onset_env = librosa.onset.onset_strength(y=y, sr=sr)
        tempo = librosa.feature.tempo(onset_envelope=onset_env, sr=sr)[0]
        zcr = librosa.feature.zero_crossing_rate(y)
        cent = librosa.feature.spectral_centroid(y=y, sr=sr)
        rmse = librosa.feature.rms(y=y)
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        mfcc_features = {}
        for i in range(1, 14):
            mfcc_features[f'MFCC_{i}_Mean'] = np.mean(mfccs[i - 1])
            mfcc_features[f'MFCC_{i}_Var'] = np.var(mfccs[i - 1])
        features = {
            'Tempo': tempo,
            'ZCR_Mean': np.mean(zcr), 'ZCR_Var': np.var(zcr),
            'Spectral_Centroid_Mean': np.mean(cent), 'Spectral_Centroid_Var': np.var(cent),
            'RMSE_Mean': np.mean(rmse), 'RMSE_Var': np.var(rmse),
            **mfcc_features
        }
        audio_key = self._detect_key(y, sr)
        return features, audio_key

    # shared age calculator

    def _compute_ages(self, upload_date):
        if upload_date:
            now = (datetime.now(timezone.utc)
                   if upload_date.tzinfo else datetime.now())
            video_age = max(1, (now - upload_date).days)
        else:
            video_age = 30          # new upload — simulate 30-day-old video

        channel_age = 730           # fallback: 2 years
        return video_age, channel_age

    # core prediction
    def predict_from_features(self, audio_path, meta_data,
                              video_id="unknown", model_type="neural_network"):
        try:
            print(f"Processing: {meta_data.get('title')} | Model: {model_type}")

            audio_feats, audio_key = self._extract_audio_features(audio_path)

            # shared feature prep
            title_len    = len(str(meta_data.get('title', '')))
            desc_len     = len(str(meta_data.get('description', '')))
            tags         = meta_data.get('tags', [])
            tag_count    = (len(tags) if isinstance(tags, list)
                            else str(tags).count(',') + 1)
            subs_count   = float(meta_data.get('subs') or 0)
            uploads_count = float(meta_data.get('uploads') or 0)
            duration_val = float(meta_data.get('duration') or 0)
            video_age, channel_age = self._compute_ages(meta_data.get('upload_date'))

            # gbm path
            if model_type == "gbm":

                df_gbm = pd.DataFrame([{
                    'Subscribers Count':  subs_count,
                    'Number of Uploads':  uploads_count,
                    'Duration (seconds)': duration_val,
                    'Title_Length':       title_len,
                    'Desc_Length':        desc_len,
                    'Tag_Count':          tag_count,
                    'Video_Age_Days':     float(video_age),
                    'Channel_Age_Days':   float(channel_age),
                    'Channel_Avg_Views':  0.0,   # unknown at inference time
                    'Licensed Content':   0,
                    'Weekday_Enc':        0,      # default Monday
                }])

                # GBM was trained on raw values — no scaler needed
                log_pred = self.gbm_model.predict(df_gbm)[0]
                predicted_views = int(np.expm1(log_pred))

            # dnn path
            else:

                df_meta = pd.DataFrame([{
                    'Subscribers Count':  subs_count,
                    'Number of Uploads':  uploads_count,
                    'Duration (seconds)': duration_val,
                    'Title_Length':       title_len,
                    'Desc_Length':        desc_len,
                    'Tag_Count':          tag_count,
                    'Video_Age_Days':     float(video_age),
                    'Channel_Age_Days':   float(channel_age),
                    'Channel_Avg_Views':  0.0,   # unknown at inference time
                    'Weekday':            'Monday',
                    'Licensed Content':   0,
                }])

                df_audio = pd.DataFrame([audio_feats])

                X_meta  = self.meta_proc_nn.transform(df_meta)
                X_audio = self.audio_proc_nn.transform(df_audio)

                log_pred = self.nn_model.predict([X_meta, X_audio])
                predicted_views = int(np.expm1(log_pred[0][0]))

            predicted_views = max(0, predicted_views)
            confidence = 0.70 + (0.15 if predicted_views > 50000 else 0.0)
            clean_audio_feats = {k: float(v) for k, v in audio_feats.items()}

            return {
                "status": "success",
                "video_id": video_id,
                "title": meta_data.get('title'),
                "predicted_views": predicted_views,
                "confidence_score": min(confidence, 0.98),  # kept for DB history
                "audio_key": audio_key,
                "input_features": {
                    "subscriber_count": subs_count,
                    "duration": duration_val,
                    "audio_key": audio_key,   # stored in JSON column for history
                    **clean_audio_feats
                }
            }

        except Exception as e:
            print(f"Prediction Logic Error: {str(e)}")
            raise e
        finally:
            if os.path.exists(audio_path):
                try:
                    os.remove(audio_path)
                except:
                    pass

    async def predict_upload(self, file, meta, db, user_id, model_type="neural_network"):
        file_path = f"temp_{file.filename}"
        with open(file_path, "wb") as f:
            f.write(await file.read())
        try:
            real_duration = librosa.get_duration(path=file_path)
        except:
            real_duration = 220

        full_meta = {
            "title":       meta.get('title') or "Uploaded Song Track",
            "description": meta.get('description') or "Uploaded for prediction",
            "tags":        meta.get('tags') or [],
            "duration":    real_duration,
            "subs":        meta.get('subs'),
            "uploads":     meta.get('uploads'),
            "weekday":     meta.get('weekday'),
            "upload_date": None
        }

        result = self.predict_from_features(
            file_path, full_meta,
            video_id=f"upload_{file.filename}",
            model_type=model_type
        )
        self._save_to_history(db, user_id, result, full_meta,
                              f"upload_{file.filename}", model_type, "UPLOAD")
        return result

    def predict_url(self, url, db, user_id, model_type="neural_network"):
        print(f"Fetching URL: {url}")
        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': 'temp_%(id)s.%(ext)s',
            'source_address': '0.0.0.0',
            'force_ipv4': True,
            'postprocessors': [{'key': 'FFmpegExtractAudio',
                                'preferredcodec': 'mp3',
                                'preferredquality': '192'}],
            'quiet': True, 'no_warnings': True
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            filename = ydl.prepare_filename(info).rsplit('.', 1)[0] + '.mp3'

            upload_date_str = info.get('upload_date')
            date_obj = None
            if upload_date_str:
                date_obj = datetime.strptime(upload_date_str, '%Y%m%d')

            meta = {
                "title":       info.get('title', 'Unknown Title'),
                "description": info.get('description', ''),
                "tags":        info.get('tags', []),
                "subs":        info.get('channel_follower_count') or 0,
                "uploads":     500,
                "duration":    info.get('duration') or 0,
                "weekday":     "Monday",
                "licensed":    False,
                "upload_date": date_obj
            }
            
            result = self.predict_from_features(
                filename, meta,
                video_id=info.get('id', 'unknown'),
                model_type=model_type
            )
            self._save_to_history(db, user_id, result, meta,
                                  info.get('id'), model_type, "URL")
            return result

    def _build_dnn(self, meta_input_dim, audio_input_dim):
        input_meta = Input(shape=(meta_input_dim,), name='Meta_Input')
        wide = Dense(128, kernel_regularizer=l2(0.001))(input_meta)
        wide = BatchNormalization()(wide)
        wide = Activation('relu')(wide)
        wide = Dropout(0.3)(wide)
        wide = Dense(64, kernel_regularizer=l2(0.001))(wide)
        wide = BatchNormalization()(wide)
        wide = Activation('relu')(wide)

        input_audio = Input(shape=(audio_input_dim,), name='Audio_Input')
        deep = Dense(64, kernel_regularizer=l2(0.001))(input_audio)
        deep = BatchNormalization()(deep)
        deep = Activation('relu')(deep)
        deep = Dropout(0.5)(deep)

        combined = Concatenate()([wide, deep])
        z = Dense(32, activation='relu')(combined)
        z = Dropout(0.2)(z)
        output = Dense(1, activation='linear', name='Prediction')(z)

        return Model(inputs=[input_meta, input_audio], outputs=output)