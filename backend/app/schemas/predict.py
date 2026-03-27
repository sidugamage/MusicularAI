from pydantic import BaseModel
from typing import Optional, Dict, Any

# Input Schema for URL pred
class PredictURLRequest(BaseModel):
    youtube_url: str
    model_type: Optional[str] = "neural_network"

# Response Schema
class PredictionResponse(BaseModel):
    status: str
    video_id: str
    title: Optional[str] = "Unknown Title"
    predicted_views: int
    audio_key: Optional[str] = None
    input_features: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True
