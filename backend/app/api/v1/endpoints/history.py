from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from app.api import deps
from app.models.history import PredictionHistory
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

# Schema matching the model
class HistoryResponse(BaseModel):
    id: int
    title: Optional[str]
    video_id: Optional[str]
    input_type: str
    predicted_views: float
    confidence_score: float
    model_used: Optional[str]
    created_at: datetime
    input_data: Optional[Dict[str, Any]] = None # acoustic features
    
    class Config:
        from_attributes = True

@router.get("/", response_model=List[HistoryResponse])
def get_user_history(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    return db.query(PredictionHistory)\
             .filter(PredictionHistory.user_id == current_user.id)\
             .order_by(PredictionHistory.created_at.desc())\
             .limit(20)\
             .all()