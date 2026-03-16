import librosa
import numpy as np
import os
import uuid
from fastapi import UploadFile

class AudioService:
    TEMP_DIR = "temp_uploads"

    def __init__(self):
        os.makedirs(self.TEMP_DIR, exist_ok=True)

    def extract_features(self, file_path: str):
        """
        Extracts 60s of audio features (Mirroring your Colab script)
        """
        try:
            y, sr = librosa.load(file_path, duration=60, offset=30)
            
            features = {}
            # Tempo
            onset_env = librosa.onset.onset_strength(y=y, sr=sr)
            tempo = librosa.beat.tempo(onset_envelope=onset_env, sr=sr)
            features['Tempo'] = tempo[0] if isinstance(tempo, np.ndarray) else tempo

            # Spectral
            features['ZCR_Mean'] = np.mean(librosa.feature.zero_crossing_rate(y))
            features['ZCR_Var'] = np.var(librosa.feature.zero_crossing_rate(y))
            
            # Spectral Centroid (Brightness)
            cent = librosa.feature.spectral_centroid(y=y, sr=sr)
            features['Spectral_Centroid_Mean'] = np.mean(cent)
            features['Spectral_Centroid_Var'] = np.var(cent)

            # RMSE (Energy/Loudness)
            rmse = librosa.feature.rms(y=y)
            features['RMSE_Mean'] = np.mean(rmse)
            features['RMSE_Var'] = np.var(rmse)

            # 5. MFCCs (Timbre/Texture) - Extract 13
            mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
            for i in range(1, 14):
                features[f'MFCC_{i}_Mean'] = np.mean(mfccs[i-1])
                features[f'MFCC_{i}_Var'] = np.var(mfccs[i-1])
            
            return features

        except Exception as e:
            print(f"Extraction Error: {e}")
            return None

    async def save_upload(self, file: UploadFile) -> str:
        filename = f"{uuid.uuid4()}.mp3"
        path = os.path.join(self.TEMP_DIR, filename)
        with open(path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        return path