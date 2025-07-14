
"""
Configuraciones empresariales para el microservicio ML
Incluye configuraciones de base de datos, Redis, ML models y API settings
"""
from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    """Configuraciones principales del microservicio"""

    # API Configuration
    app_name: str = "ML E-Commerce Service"
    app_version: str = "1.0.0"
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    debug: bool = False

    # Database Configuration
    database_url: str = "postgresql://postgres:postgres@localhost:5432/ecommerxo_ml"
    database_pool_size: int = 20
    database_max_overflow: int = 30

    # Redis Configuration
    redis_url: str = "redis://localhost:6379/0"
    redis_max_connections: int = 20

    # Cache TTL (Time To Live) in seconds
    cache_ttl_predictions: int = 3600  # 1 hour
    cache_ttl_recommendations: int = 1800  # 30 minutes
    cache_ttl_analytics: int = 86400  # 24 hours
    cache_ttl_models: int = 604800  # 1 week

    # ML Model Settings
    model_batch_size: int = 32
    model_max_features: int = 10000
    model_random_state: int = 42

    # Stock Prediction Settings
    stock_prediction_days: int = 30
    stock_confidence_level: float = 0.95
    stock_retrain_interval: int = 86400  # 24 hours

    # Recommendation Settings
    recommendation_top_k: int = 10
    recommendation_min_similarity: float = 0.1
    recommendation_diversification: float = 0.3

    # Price Optimization Settings
    price_elasticity_window: int = 90  # days
    price_optimization_margin: float = 0.15

    # Anomaly Detection Settings
    anomaly_contamination: float = 0.1
    anomaly_threshold: float = 0.5

    # Sentiment Analysis Settings
    sentiment_model_name: str = "bert-base-uncased"
    sentiment_batch_size: int = 16
    sentiment_max_length: int = 512

    # API Rate Limiting
    rate_limit_requests: int = 1000
    rate_limit_window: int = 3600  # 1 hour

    # Celery Configuration
    celery_broker_url: str = "redis://localhost:6379/1"
    celery_result_backend: str = "redis://localhost:6379/2"

    # Monitoring
    prometheus_metrics: bool = True
    sentry_dsn: Optional[str] = None
    log_level: str = "INFO"

    # Security
    api_key_header: str = "X-API-Key"
    cors_origins: list = ["http://localhost:3000", "http://localhost:5173"]

    # External APIs
    backend_api_url: str = "http://localhost:8080"
    frontend_url: str = "http://localhost:5173"

    class Config:
        env_file = ".env"
        case_sensitive = False

# Singleton instance
settings = Settings()

# Model configurations
ML_MODEL_CONFIG = {
    "stock_predictor": {
        "arima_order": (1, 1, 1),
        "lstm_units": 64,
        "lstm_dropout": 0.2,
        "random_forest_estimators": 100,
        "xgboost_max_depth": 6
    },
    "recommender": {
        "n_factors": 100,
        "n_epochs": 20,
        "lr_all": 0.005,
        "reg_all": 0.02,
        "user_based": True,
        "item_based": True
    },
    "price_optimizer": {
        "elasticity_method": "log_log",
        "demand_smoothing": 0.1,
        "competitor_weight": 0.3,
        "seasonality_weight": 0.2
    },
    "anomaly_detector": {
        "isolation_forest": {
            "n_estimators": 100,
            "contamination": 0.1,
            "random_state": 42
        },
        "one_class_svm": {
            "kernel": "rbf",
            "gamma": "scale",
            "nu": 0.1
        }
    },
    "sentiment_analyzer": {
        "models": {
            "bert": "bert-base-uncased",
            "vader": True,
            "textblob": True
        },
        "preprocessing": {
            "lowercase": True,
            "remove_special_chars": True,
            "max_length": 512
        }
    }
}

# Cache keys
CACHE_KEYS = {
    "stock_prediction": "stock:prediction:{product_id}:{days}",
    "user_recommendations": "rec:user:{user_id}",
    "product_similarity": "rec:similar:{product_id}",
    "trending_products": "trending:products",
    "price_optimization": "price:opt:{product_id}",
    "anomaly_score": "anomaly:{user_id}:{timestamp}",
    "sentiment_analysis": "sentiment:{text_hash}",
    "model_metadata": "model:meta:{model_name}"
}

# API Response messages
API_MESSAGES = {
    "prediction_success": "Predicción generada exitosamente",
    "recommendation_success": "Recomendaciones generadas exitosamente", 
    "anomaly_detected": "Anomalía detectada en el comportamiento",
    "model_training_started": "Entrenamiento de modelo iniciado",
    "cache_hit": "Resultado obtenido desde cache",
    "cache_miss": "Resultado calculado en tiempo real"
}
