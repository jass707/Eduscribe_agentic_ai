from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "EduScribe Backend"
    
    # Database
    DATABASE_URL: str = "sqlite:///./eduscribe.db"  # SQLite for development
    
    # Storage
    UPLOAD_DIR: str = "storage/uploads"
    AUDIO_DIR: str = "storage/audio"
    PROCESSED_DIR: str = "storage/processed"
    
    # AI/ML Settings
    WHISPER_MODEL_SIZE: str = "base"  # tiny, base, small, medium, large
    WHISPER_DEVICE: str = "cpu"
    WHISPER_COMPUTE_TYPE: str = "int8"
    
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    
    # LLM Settings
    GROQ_API_KEY: Optional[str] = os.getenv("GROQ_API_KEY")
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")
    LLM_MODEL: str = "llama-3.1-8b-instant"
    
    # Audio Processing
    AUDIO_SAMPLE_RATE: int = 16000
    CHUNK_DURATION: int = 20  # seconds
    
    # RAG Settings
    FAISS_TOP_K: int = 3
    IMPORTANCE_THRESHOLD: float = 0.0
    HISTORY_CHUNKS: int = 4
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Load environment variables
settings = Settings()

# Ensure directories exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.AUDIO_DIR, exist_ok=True)
os.makedirs(settings.PROCESSED_DIR, exist_ok=True)
