from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # Base de datos
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/ecommerxo"
    
    # JWT - Unificado con backend Java
    JWT_SECRET: str = os.getenv("APP_JWT_SECRET", "")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("APP_JWT_ACCESS_EXPIRATION", "15"))  # 15 min
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("APP_JWT_REFRESH_EXPIRATION", "7"))   # 7 días
    
    # CORS - Configuración segura
    CORS_ALLOWED_ORIGINS: List[str] = os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000,http://localhost:8080").split(",")
    CORS_ALLOW_CREDENTIALS: bool = os.getenv("CORS_ALLOW_CREDENTIALS", "true").lower() == "true"
    
    # URLs legacy para compatibilidad
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
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    def validate_jwt_secret(self) -> str:
        """Validar que JWT_SECRET esté configurado"""
        if not self.JWT_SECRET:
            raise ValueError("APP_JWT_SECRET debe estar configurado. Establezca la variable de entorno.")
        if len(self.JWT_SECRET) < 32:
            raise ValueError("APP_JWT_SECRET debe tener al menos 32 caracteres para seguridad.")
        return self.JWT_SECRET
    
    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"  # Ignore extra environment variables

settings = Settings()

# Validar configuración crítica al importar
try:
    settings.validate_jwt_secret()
except ValueError as e:
    print(f"⚠️  CONFIGURACIÓN JWT: {e}")
    if settings.DEBUG:
        print("🚨 Usando JWT secret por defecto - SOLO PARA DESARROLLO")
        settings.JWT_SECRET = "default_dev_secret_key_minimum_32_chars_long_for_testing_purposes_only"
