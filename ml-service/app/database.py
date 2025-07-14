
"""
Configuración de base de datos empresarial con SQLAlchemy
Incluye modelos específicos para ML, cache de conexiones y optimizaciones
"""
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, Boolean, JSON, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool
from datetime import datetime
from typing import Generator
import redis
import json
from .config import settings

# SQLAlchemy setup con optimizaciones empresariales
engine = create_engine(
    settings.database_url,
    poolclass=QueuePool,
    pool_size=settings.database_pool_size,
    max_overflow=settings.database_max_overflow,
    pool_pre_ping=True,
    pool_recycle=3600,  # Reciclar conexiones cada hora
    echo=settings.debug
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Redis connection pool
redis_pool = redis.ConnectionPool.from_url(
    settings.redis_url,
    max_connections=settings.redis_max_connections,
    retry_on_timeout=True
)
redis_client = redis.Redis(connection_pool=redis_pool, decode_responses=True)

# ============================================================================
# MODELOS DE BASE DE DATOS ESPECÍFICOS PARA ML
# ============================================================================

class MLPrediction(Base):
    """Cache de predicciones ML para optimizar consultas"""
    __tablename__ = "ml_predictions"

    id = Column(Integer, primary_key=True, index=True)
    model_type = Column(String(50), nullable=False, index=True)  # stock, demand, price
    product_id = Column(Integer, nullable=False, index=True)
    prediction_data = Column(JSON, nullable=False)
    confidence_score = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    expires_at = Column(DateTime, nullable=False, index=True)

    __table_args__ = (
        Index('idx_prediction_lookup', 'model_type', 'product_id', 'created_at'),
    )

class UserEmbedding(Base):
    """Representaciones vectoriales de usuarios para recomendaciones"""
    __tablename__ = "user_embeddings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, unique=True, index=True)
    embedding_vector = Column(JSON, nullable=False)  # Array de features
    cluster_id = Column(Integer, nullable=True, index=True)
    last_updated = Column(DateTime, default=datetime.utcnow)
    model_version = Column(String(20), nullable=False)

class ProductFeatures(Base):
    """Características extraídas de productos para ML"""
    __tablename__ = "product_features"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, nullable=False, unique=True, index=True)
    feature_vector = Column(JSON, nullable=False)
    category_embedding = Column(JSON, nullable=True)
    price_features = Column(JSON, nullable=True)
    popularity_score = Column(Float, default=0.0)
    last_updated = Column(DateTime, default=datetime.utcnow)

class ModelPerformance(Base):
    """Métricas de rendimiento de modelos ML"""
    __tablename__ = "model_performance"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(100), nullable=False, index=True)
    model_version = Column(String(20), nullable=False)
    metric_name = Column(String(50), nullable=False)  # accuracy, precision, recall, etc.
    metric_value = Column(Float, nullable=False)
    evaluation_date = Column(DateTime, default=datetime.utcnow, index=True)
    dataset_size = Column(Integer, nullable=False)
    notes = Column(Text, nullable=True)

class TrainingLog(Base):
    """Logs de entrenamiento de modelos"""
    __tablename__ = "training_logs"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(100), nullable=False, index=True)
    training_start = Column(DateTime, nullable=False)
    training_end = Column(DateTime, nullable=True)
    status = Column(String(20), nullable=False)  # running, completed, failed
    parameters = Column(JSON, nullable=True)
    metrics = Column(JSON, nullable=True)
    error_message = Column(Text, nullable=True)
    data_size = Column(Integer, nullable=True)

class AnomalyScore(Base):
    """Puntuaciones de anomalías detectadas"""
    __tablename__ = "anomaly_scores"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True, index=True)
    transaction_id = Column(Integer, nullable=True, index=True)
    anomaly_type = Column(String(50), nullable=False, index=True)
    score = Column(Float, nullable=False)
    threshold = Column(Float, nullable=False)
    is_anomaly = Column(Boolean, nullable=False, index=True)
    features_used = Column(JSON, nullable=True)
    detected_at = Column(DateTime, default=datetime.utcnow, index=True)

    __table_args__ = (
        Index('idx_anomaly_detection', 'anomaly_type', 'is_anomaly', 'detected_at'),
    )

# ============================================================================
# FUNCIONES DE CONEXIÓN Y CACHE
# ============================================================================

def get_db() -> Generator[Session, None, None]:
    """Dependency para obtener sesión de base de datos"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_redis() -> redis.Redis:
    """Obtener cliente Redis"""
    return redis_client

class CacheManager:
    """Gestor inteligente de cache con Redis"""

    @staticmethod
    def get(key: str):
        """Obtener valor del cache"""
        try:
            value = redis_client.get(key)
            return json.loads(value) if value else None
        except (redis.RedisError, json.JSONDecodeError):
            return None

    @staticmethod
    def set(key: str, value, ttl: int = 3600):
        """Guardar valor en cache con TTL"""
        try:
            redis_client.setex(key, ttl, json.dumps(value, default=str))
            return True
        except (redis.RedisError, TypeError):
            return False

    @staticmethod
    def delete(key: str):
        """Eliminar clave del cache"""
        try:
            return redis_client.delete(key)
        except redis.RedisError:
            return False

    @staticmethod
    def invalidate_pattern(pattern: str):
        """Invalidar claves que coincidan con el patrón"""
        try:
            keys = redis_client.keys(pattern)
            if keys:
                return redis_client.delete(*keys)
            return 0
        except redis.RedisError:
            return 0

# Inicializar tablas
def init_db():
    """Crear todas las tablas en la base de datos"""
    Base.metadata.create_all(bind=engine)

# Health check functions
def check_db_health() -> bool:
    """Verificar salud de la base de datos"""
    try:
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        return True
    except Exception:
        return False

def check_redis_health() -> bool:
    """Verificar salud de Redis"""
    try:
        redis_client.ping()
        return True
    except Exception:
        return False
