from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # Base de datos
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/ecommerxo"
    
    # JWT
    JWT_SECRET: str = "tu_clave_secreta_muy_larga_y_segura_para_desarrollo"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    FRONTEND_URL: str = "http://localhost:5173"
    BACKEND_URL: str = "http://localhost:8080"
    
    # ML Model
    MODEL_PATH: str = "models"
    BATCH_SIZE: int = 32
    TRAINING_EPOCHS: int = 10
    
    # API
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "E-CommerxoPIMO ML Service"
    
    # Debug mode
    DEBUG: bool = False
    
    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"  # Ignore extra environment variables

settings = Settings()
