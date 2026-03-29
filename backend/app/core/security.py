from fastapi import Header, HTTPException, status, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from typing import Optional

async def get_current_user(x_api_key: str = Header(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.api_key == x_api_key).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid API Key")
    return user

async def get_optional_user(
    x_api_key: Optional[str] = Header(None), 
    db: Session = Depends(get_db)
):
    if not x_api_key:
        return None

    return db.query(User).filter(User.api_key == x_api_key).first()
