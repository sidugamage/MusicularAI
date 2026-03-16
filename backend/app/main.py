from fastapi import FastAPI
from app.db.session import engine, Base
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import predict, auth, history 

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="MusicularAI API")

origins = [
    "http://localhost:5173",  # Frontend
    "http://127.0.0.1:5173",  # Alternative localhost
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],  
)

# register routes
app.include_router(predict.router, prefix="/api/v1/predict", tags=["Prediction"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(history.router, prefix="/api/v1/history", tags=["History"])

@app.get("/")
def home():
    return {"message": "MusicularAI Backend is running."}