import os
import numpy as np
import pandas as pd
import librosa
import joblib
import tensorflow as tf
import yt_dlp
import xgboost as xgb
from datetime import datetime, timezone
from app.core.config import settings
from app.models.history import PredictionHistory 

class AIService:
    def __init__(self):
        # Path to ml assets
        base_path = os.path.join(os.path.dirname(__file__), "../ml_assets")
        print(f"Loading AI Models from {base_path}...")
        
        try:
            # NN
            self.nn_model = tf.keras.models.load_model(os.path.join(base_path, "musicular_model.h5"))
            self.meta_proc_nn = joblib.load(os.path.join(base_path, "meta_preprocessor.joblib"))
            self.audio_proc_nn = joblib.load(os.path.join(base_path, "audio_preprocessor.joblib"))
            
            # XGBoost
            self.xgb_model = xgb.XGBRegressor()
            self.xgb_model.load_model(os.path.join(base_path, "xgboost_model.json"))
            self.meta_proc_xgb = joblib.load(os.path.join(base_path, "meta_preprocessor_xgb.joblib"))
            self.audio_proc_xgb = joblib.load(os.path.join(base_path, "audio_preprocessor_xgb.joblib"))
            
            print("All AI Models & Processors Loaded Successfully.")
        except Exception as e:
            print(f"Error loading AI models: {e}")
            print("Ensure you have all 6 files in backend/ml_assets/")

    def _save_to_history(self, db, user_id, result, meta, video_id, model_type, input_type):
        """Helper function to save prediction result to database"""
        # dont save history for guest users
        if user_id is None:
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

    def _extract_audio_features(self, file_path):
        """Extracts acoustic features using Librosa"""
        y, sr = librosa.load(file_path, duration=30)
        
        onset_env = librosa.onset.onset_strength(y=y, sr=sr)
        tempo = librosa.feature.tempo(onset_envelope=onset_env, sr=sr)[0]
        
        zcr = librosa.feature.zero_crossing_rate(y)
        cent = librosa.feature.spectral_centroid(y=y, sr=sr)
        rmse = librosa.feature.rms(y=y)
        
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        mfcc_features = {}
        for i in range(1, 14):
            mfcc_features[f'MFCC_{i}_Mean'] = np.mean(mfccs[i-1])
            mfcc_features[f'MFCC_{i}_Var'] = np.var(mfccs[i-1])

        return {
            'Tempo': tempo,
            'ZCR_Mean': np.mean(zcr), 'ZCR_Var': np.var(zcr),
            'Spectral_Centroid_Mean': np.mean(cent), 'Spectral_Centroid_Var': np.var(cent),
            'RMSE_Mean': np.mean(rmse), 'RMSE_Var': np.var(rmse),
            **mfcc_features
        }

    def predict_from_features(self, audio_path, meta_data, video_id="unknown", model_type="neural_network"):
        try:
            print(f"Processing: {meta_data.get('title')} | Model: {model_type}")
            
            audio_feats = self._extract_audio_features(audio_path)
            
            title_len = len(str(meta_data.get('title', '')))
            desc_len = len(str(meta_data.get('description', '')))
            tags = meta_data.get('tags', [])
            tag_count = len(tags) if isinstance(tags, list) else str(tags).count(',') + 1
            
            subs_count = meta_data.get('subs') or 0
            uploads_count = meta_data.get('uploads') or 0
            duration_val = meta_data.get('duration') or 0

            predicted_views = 0

            # XGBoost Path
            if model_type == "xgboost":
                # Calculate Video Age
                if meta_data.get('upload_date'):
                    upload_dt = meta_data['upload_date']
                    if upload_dt.tzinfo is None: 
                        now = datetime.now()
                    else: 
                        now = datetime.now(timezone.utc)
                    video_age = max(0, (now - upload_dt).days)
                else:
                    # Simulate Views after 30 days
                    video_age = 30 
                
                channel_age = 730 # Default to 2 years
                
                # Create DataFrame
                df_meta = pd.DataFrame([{
                    'Subscribers Count': float(subs_count),
                    'Number of Uploads': float(uploads_count),
                    'Duration (seconds)': float(duration_val),
                    'Title_Length': title_len,
                    'Desc_Length': desc_len,
                    'Tag_Count': tag_count,
                    'Weekday': 0, # Defaulting to Monday
                    'Licensed Content': 0,
                    'Video_Age_Days': float(video_age),    # Unique to XGB
                    'Channel_Age_Days': float(channel_age) # Unique to XGB
                }])
                
                df_audio = pd.DataFrame([audio_feats])
                
                # Transform using XGB processors
                X_meta = self.meta_proc_xgb.transform(df_meta)
                X_audio = self.audio_proc_xgb.transform(df_audio)
                
                # Predict
                X_full = np.concatenate([X_meta, X_audio], axis=1)
                log_pred = self.xgb_model.predict(X_full)[0]
                predicted_views = int(np.expm1(log_pred))

            # NN Path
            else:
                # Create DataFrame
                df_meta = pd.DataFrame([{
                    'Subscribers Count': float(subs_count),
                    'Number of Uploads': float(uploads_count),
                    'Duration (seconds)': float(duration_val),
                    'Title_Length': title_len,
                    'Desc_Length': desc_len,
                    'Tag_Count': tag_count,
                    'Weekday': 'Monday',
                    'Licensed Content': False
                }])
                
                df_audio = pd.DataFrame([audio_feats])
                
                # Transform using NN processors
                X_meta = self.meta_proc_nn.transform(df_meta)
                X_audio = self.audio_proc_nn.transform(df_audio)
                
                # Predict
                log_pred = self.nn_model.predict([X_meta, X_audio])
                predicted_views = int(np.expm1(log_pred[0][0]))
            
            predicted_views = max(0, predicted_views)
            
            # Confidence Score Logic (Heuristic based on magnitude)
            confidence = 0.70 + (0.15 if predicted_views > 50000 else 0.0)
            
            clean_audio_feats = {k: float(v) for k, v in audio_feats.items()}

            return {
                "status": "success",
                "video_id": video_id,
                "title": meta_data.get('title'),
                "predicted_views": predicted_views,
                "confidence_score": min(confidence, 0.98),
                "input_features": {
                    "subscriber_count": subs_count,
                    "duration": duration_val,
                    **clean_audio_feats 
                }
            }

        except Exception as e:
            print(f"Prediction Logic Error: {str(e)}")
            raise e
        finally:
            if os.path.exists(audio_path):
                try: os.remove(audio_path)
                except: pass

    async def predict_upload(self, file, meta, db, user_id, model_type="neural_network"):
        # Save temp file
        file_path = f"temp_{file.filename}"
        with open(file_path, "wb") as f:
            f.write(await file.read())
        
        # Get Duration
        try:
            real_duration = librosa.get_duration(path=file_path)
        except:
            real_duration = 220 
        
        # Prepare Metadata
        full_meta = {
            "title": meta.get('title') or "Uploaded Song Track",
            "description": meta.get('description') or "Uploaded for prediction",
            "tags": meta.get('tags') or [],
            "duration": real_duration,
            "subs": meta.get('subs'),
            "uploads": meta.get('uploads'),
            "weekday": meta.get('weekday'),
            "upload_date": None # Manual uploads are new
        }
        
        # Predict
        result = self.predict_from_features(file_path, full_meta, video_id=f"upload_{file.filename}", model_type=model_type)
        
        # Save History
        self._save_to_history(db, user_id, result, full_meta, f"upload_{file.filename}", model_type, "UPLOAD")
        
        return result

    def predict_url(self, url, db, user_id, model_type="neural_network"):
        print(f"Fetching URL: {url}")
        
        secret_cookies = "/etc/secrets/cookies.txt"
        cookies_path = "/tmp/cookies.txt"
        
        if os.path.exists(secret_cookies):
            import shutil
            shutil.copy2(secret_cookies, cookies_path)
            print("Cookies copied to /tmp/cookies.txt")
        else:
            cookies_path = None
            print("WARNING: No cookies.txt found.")

        if os.path.exists(cookies_path):
            with open(cookies_path, 'r') as f:
                content = f.read()
            print(f"Cookie file size: {len(content)} bytes")
            print(f"First line: {content.splitlines()[0]}")
            print(f"Has youtube.com entries: {'youtube.com' in content}")
        else:
            print("ERROR: Cookie file does not exist at", cookies_path)


        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': '/tmp/temp_%(id)s.%(ext)s',
            'force_ipv4': True,
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192'
            }],
            'quiet': False,
            'cookiefile': cookies_path,
            'nocheckcertificate': True,
            'extractor_args': {
                'youtube': {
                    'player_client': ['tv_embedded'],
                    'player_skip': ['webpage'],
                }
            }
        }

        # to check if cookies exists
        if not os.path.exists(cookies_path):
            print("WARNING: cookies.txt not found in ml_assets. YouTube may block this request.")
        

        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=True)
                if info is None:
                    raise Exception(
                        "YouTube blocked the request — cookies may be expired or invalid."
                    )

                filename = ydl.prepare_filename(info).rsplit('.', 1)[0] + '.mp3'
                
                upload_date_str = info.get('upload_date') 
                date_obj = None
                if upload_date_str:
                    date_obj = datetime.strptime(upload_date_str, '%Y%m%d')

                meta = {
                    "title": info.get('title', 'Unknown Title'),
                    "description": info.get('description', ''),
                    "tags": info.get('tags', []),
                    "subs": info.get('channel_follower_count') or 0,
                    "uploads": 500, 
                    "duration": info.get('duration') or 0,
                    "weekday": "Monday",
                    "licensed": False,
                    "upload_date": date_obj
                }
                
                # Predict
                result = self.predict_from_features(filename, meta, video_id=info.get('id', 'unknown'), model_type=model_type)
                
                # Save History
                self._save_to_history(db, user_id, result, meta, info.get('id'), model_type, "URL")
                
                return result

        except Exception as e:
            print(f"URL Error: {e}")
            raise Exception(f"Failed to process YouTube URL: {str(e)}")