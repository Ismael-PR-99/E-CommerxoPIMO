"""
Capa unificada de base de datos para ML Service
Configuración centralizada de SQLAlchemy con optimizaciones empresariales
"""
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, Boolean, JSON, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool
from datetime import datetime
from typing import Generator, Optional
import os

# Configuración de database URL con fallback
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/ecommerxo")

# Motor SQLAlchemy con optimizaciones empresariales
engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,
    max_overflow=30,
    pool_pre_ping=True,
    pool_recycle=3600,  # Reciclar conexiones cada hora
    echo=os.getenv("DEBUG", "false").lower() == "true"
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db() -> Generator[Session, None, None]:
    """
    Dependency para obtener sesión de base de datos
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_db_session() -> Session:
    """
    Función helper para obtener sesión de DB fuera de FastAPI
    """
    return SessionLocal()

# Modelos ML específicos
class MLPrediction(Base):
    """Modelo para almacenar predicciones ML"""
    __tablename__ = "ml_predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, index=True, nullable=False)
    prediction_type = Column(String(50), nullable=False)  # 'stock', 'demand', 'price'
    prediction_value = Column(Float, nullable=False)
    confidence_score = Column(Float, nullable=True)
    horizon_days = Column(Integer, nullable=True)
    model_version = Column(String(50), nullable=True)
    features_used = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    expires_at = Column(DateTime, nullable=True, index=True)
    
    # Índices compuestos para consultas frecuentes
    __table_args__ = (
        Index('idx_product_type_created', product_id, prediction_type, created_at),
        Index('idx_expires_at', expires_at),
    )

class MLRecommendation(Base):
    """Modelo para almacenar recomendaciones ML"""
    __tablename__ = "ml_recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=True)
    product_id = Column(Integer, index=True, nullable=False)
    recommended_product_id = Column(Integer, index=True, nullable=False)
    recommendation_type = Column(String(50), nullable=False)  # 'collaborative', 'content', 'hybrid'
    score = Column(Float, nullable=False)
    rank_position = Column(Integer, nullable=False)
    algorithm_used = Column(String(100), nullable=True)
    context_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    expires_at = Column(DateTime, nullable=True, index=True)
    
    # Índices para queries de recomendación
    __table_args__ = (
        Index('idx_user_type_score', user_id, recommendation_type, score.desc()),
        Index('idx_product_type_score', product_id, recommendation_type, score.desc()),
        Index('idx_expires_at_rec', expires_at),
    )

class MLModelMetadata(Base):
    """Metadatos de modelos ML"""
    __tablename__ = "ml_model_metadata"
    
    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(100), nullable=False, index=True)
    model_version = Column(String(50), nullable=False)
    model_type = Column(String(50), nullable=False)  # 'prediction', 'recommendation', 'classification'
    accuracy_metrics = Column(JSON, nullable=True)
    training_data_hash = Column(String(64), nullable=True)
    model_parameters = Column(JSON, nullable=True)
    trained_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True, index=True)
    performance_score = Column(Float, nullable=True)
    
    # Índice para encontrar modelo activo más reciente
    __table_args__ = (
        Index('idx_name_active_trained', model_name, is_active, trained_at.desc()),
    )
