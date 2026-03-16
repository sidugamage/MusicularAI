from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.session import Base

class PredictionHistory(Base):
    __tablename__ = "prediction_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    video_id = Column(String, nullable=True)
    title = Column(String, nullable=True)
    input_type = Column(String)
    predicted_views = Column(Integer)    
    confidence_score = Column(Float)

    model_used = Column(String)
    input_data = Column(JSON)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    owner = relationship("User", back_populates="history")