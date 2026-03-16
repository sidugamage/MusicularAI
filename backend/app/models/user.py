from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.db.session import Base
from sqlalchemy.orm import relationship
import secrets

class User(Base):
    __tablename__ = "users"
    history = relationship("PredictionHistory", back_populates="owner")
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String) 
    api_key = Column(String, unique=True, index=True) 
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    @staticmethod
    def generate_api_key():
        return secrets.token_urlsafe(32)