from fastapi import APIRouter, UploadFile, File, Form, Depends
from sqlalchemy.orm import Session
from typing import Optional
from app.api import deps
from app.schemas.predict import PredictURLRequest, PredictionResponse
from app.services.ai_service import AIService

router = APIRouter()
ai_service = AIService()

# url prediction
@router.post("/url", response_model=PredictionResponse)
def predict_by_url(
    request: PredictURLRequest,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_optional_user)
):
    user_id = current_user.id if current_user else None

    return ai_service.predict_url(
        request.youtube_url, 
        db, 
        user_id, 
        model_type=request.model_type
    )

# file upload prediction
@router.post("/file", response_model=PredictionResponse)
async def predict_by_file(
    file: UploadFile = File(...),
    subscribers: int = Form(...),
    uploads: int = Form(...),
    weekday: str = Form("Monday"),
    model_type: str = Form("neural_network"),
    title: Optional[str] = Form(""),
    description: Optional[str] = Form(""),
    tags: Optional[str] = Form(""),
    
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_optional_user)
):
    user_id = current_user.id if current_user else None

    meta = {
        "subs": subscribers,
        "uploads": uploads,
        "weekday": weekday,
        "title": title,
        "description": description,
        "tags": tags
    }
    
    return await ai_service.predict_upload(
        file, 
        meta, 
        db, 
        user_id, 
        model_type=model_type
    )