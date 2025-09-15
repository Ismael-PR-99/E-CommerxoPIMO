"""
Fixtures y configuración para tests de pytest
Incluye mocking de Redis, PostgreSQL y configuraciones de test
"""

import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch
import json
import os
from datetime import datetime, timedelta
from typing import Generator, AsyncGenerator

# Importaciones para FastAPI testing
from fastapi.testclient import TestClient
from httpx import AsyncClient
import redis.asyncio as redis
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Importar aplicación y dependencias
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.main import app
from app.database import get_db, Base
from app.cache import get_redis
from app.config import settings


# ==================== CONFIGURACIÓN DE TEST ====================

@pytest.fixture(scope="session")
def event_loop():
    """Crear event loop para toda la sesión de tests"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


# ==================== DATABASE FIXTURES ====================

@pytest.fixture(scope="session")
def test_db_engine():
    """Crear engine de base de datos para tests (SQLite en memoria)"""
    SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, 
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )
    Base.metadata.create_all(bind=engine)
    yield engine
    # Cleanup
    os.remove("./test.db") if os.path.exists("./test.db") else None


@pytest.fixture
def db_session(test_db_engine):
    """Crear sesión de base de datos para cada test"""
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_db_engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.rollback()
        session.close()


@pytest.fixture
def mock_db_dependency(db_session):
    """Mock de la dependencia get_db"""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    yield
    app.dependency_overrides.clear()


# ==================== REDIS FIXTURES ====================

@pytest.fixture
def mock_redis_client():
    """Mock de cliente Redis con comportamiento asíncrono"""
    mock_client = AsyncMock(spec=redis.Redis)
    
    # Configurar métodos comunes de Redis
    mock_client.ping.return_value = True
    mock_client.get.return_value = None
    mock_client.set.return_value = True
    mock_client.setex.return_value = True
    mock_client.delete.return_value = 1
    mock_client.exists.return_value = False
    mock_client.expire.return_value = True
    mock_client.ttl.return_value = -1
    
    # Mock para operaciones de hash
    mock_client.hget.return_value = None
    mock_client.hset.return_value = 1
    mock_client.hgetall.return_value = {}
    mock_client.hdel.return_value = 1
    
    # Mock para operaciones de listas
    mock_client.lpush.return_value = 1
    mock_client.rpush.return_value = 1
    mock_client.lpop.return_value = None
    mock_client.rpop.return_value = None
    mock_client.lrange.return_value = []
    
    return mock_client


@pytest.fixture
def mock_redis_dependency(mock_redis_client):
    """Mock de la dependencia get_redis"""
    async def override_get_redis():
        return mock_redis_client
    
    app.dependency_overrides[get_redis] = override_get_redis
    yield mock_redis_client
    app.dependency_overrides.clear()


@pytest.fixture
def redis_with_data(mock_redis_client):
    """Redis mock con datos de prueba precargados"""
    # Datos de cache para predicciones
    prediction_cache = {
        "product_1_prediction": json.dumps({
            "product_id": 1,
            "predicted_demand": 150,
            "confidence": 0.85,
            "prediction_date": datetime.now().isoformat(),
            "cached": True
        }),
        "product_2_prediction": json.dumps({
            "product_id": 2,
            "predicted_demand": 200,
            "confidence": 0.90,
            "prediction_date": datetime.now().isoformat(),
            "cached": True
        })
    }
    
    # Datos de cache para recomendaciones
    recommendation_cache = {
        "user_123_recommendations": json.dumps({
            "user_id": 123,
            "recommendations": [
                {"product_id": 5, "score": 0.92, "reason": "Frequently bought together"},
                {"product_id": 8, "score": 0.88, "reason": "Similar preferences"}
            ],
            "generated_at": datetime.now().isoformat(),
            "cached": True
        })
    }
    
    # Configurar respuestas del mock
    def mock_get(key):
        all_cache = {**prediction_cache, **recommendation_cache}
        return all_cache.get(key)
    
    mock_redis_client.get.side_effect = mock_get
    
    return mock_redis_client


# ==================== HTTP CLIENT FIXTURES ====================

@pytest.fixture
def client():
    """Cliente de test síncrono para FastAPI"""
    return TestClient(app)


@pytest.fixture
async def async_client():
    """Cliente de test asíncrono para FastAPI"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client


@pytest.fixture
def auth_headers():
    """Headers de autenticación para tests"""
    return {
        "Authorization": "Bearer test-token",
        "Content-Type": "application/json"
    }


# ==================== ML MODEL FIXTURES ====================

@pytest.fixture
def mock_stock_predictor():
    """Mock del predictor de stock"""
    with patch('app.models.stock_predictor.StockPredictor') as mock_class:
        mock_instance = MagicMock()
        mock_instance.predict_demand.return_value = {
            "predicted_demand": 150,
            "confidence": 0.85,
            "factors": ["seasonal", "trend"],
            "prediction_date": datetime.now().isoformat()
        }
        mock_instance.validate_input.return_value = True
        mock_instance.model_version = "1.0.0"
        mock_class.return_value = mock_instance
        yield mock_instance


@pytest.fixture
def mock_recommendation_engine():
    """Mock del motor de recomendaciones"""
    with patch('app.models.recommendation_engine.RecommendationEngine') as mock_class:
        mock_instance = MagicMock()
        mock_instance.get_recommendations.return_value = [
            {"product_id": 5, "score": 0.92, "reason": "Frequently bought together"},
            {"product_id": 8, "score": 0.88, "reason": "Similar preferences"},
            {"product_id": 12, "score": 0.82, "reason": "Popular in category"}
        ]
        mock_instance.get_user_preferences.return_value = {
            "categories": ["Electronics", "Books"],
            "price_range": {"min": 10, "max": 500}
        }
        mock_class.return_value = mock_instance
        yield mock_instance


# ==================== DATA FIXTURES ====================

@pytest.fixture
def sample_product_data():
    """Datos de muestra para productos"""
    return {
        "product_id": 1,
        "name": "Laptop Gaming",
        "category": "Electronics",
        "price": 1299.99,
        "stock": 50,
        "sales_history": [100, 120, 140, 130, 145],
        "created_at": datetime.now().isoformat()
    }


@pytest.fixture
def sample_user_data():
    """Datos de muestra para usuarios"""
    return {
        "user_id": 123,
        "email": "test@example.com",
        "preferences": {
            "categories": ["Electronics", "Books"],
            "price_range": {"min": 10, "max": 1000}
        },
        "purchase_history": [1, 2, 3, 4, 5],
        "created_at": datetime.now().isoformat()
    }


@pytest.fixture
def sample_prediction_request():
    """Request de muestra para predicción"""
    return {
        "product_id": 1,
        "historical_data": {
            "sales_history": [100, 120, 140, 130, 145, 160, 155, 170],
            "timeframe_days": 30,
            "seasonal_factors": True,
            "promotion_periods": [
                {"start": "2024-01-01", "end": "2024-01-07", "discount": 0.15}
            ]
        },
        "prediction_horizon": 7
    }


@pytest.fixture
def sample_recommendation_request():
    """Request de muestra para recomendaciones"""
    return {
        "user_id": 123,
        "product_history": [1, 2, 3, 4, 5],
        "max_recommendations": 5,
        "algorithm": "collaborative_filtering",
        "filters": {
            "category": "Electronics",
            "min_price": 10,
            "max_price": 1000,
            "in_stock": True
        }
    }


# ==================== ERROR SIMULATION FIXTURES ====================

@pytest.fixture
def redis_connection_error(mock_redis_client):
    """Simular error de conexión a Redis"""
    mock_redis_client.ping.side_effect = redis.ConnectionError("Redis connection failed")
    mock_redis_client.get.side_effect = redis.ConnectionError("Redis connection failed")
    mock_redis_client.set.side_effect = redis.ConnectionError("Redis connection failed")
    return mock_redis_client


@pytest.fixture
def db_connection_error(db_session):
    """Simular error de conexión a base de datos"""
    from sqlalchemy.exc import OperationalError
    db_session.execute.side_effect = OperationalError("DB connection failed", None, None)
    return db_session


@pytest.fixture
def ml_model_error(mock_stock_predictor):
    """Simular error en modelo ML"""
    mock_stock_predictor.predict_demand.side_effect = Exception("Model loading failed")
    return mock_stock_predictor


# ==================== PERFORMANCE FIXTURES ====================

@pytest.fixture
def performance_monitor():
    """Monitor de rendimiento para tests"""
    import time
    
    class PerformanceMonitor:
        def __init__(self):
            self.start_time = None
            self.end_time = None
            
        def start(self):
            self.start_time = time.time()
            
        def stop(self):
            self.end_time = time.time()
            
        @property
        def duration(self):
            if self.start_time and self.end_time:
                return self.end_time - self.start_time
            return None
            
        def assert_max_duration(self, max_seconds):
            assert self.duration <= max_seconds, f"Test took {self.duration}s, expected <= {max_seconds}s"
    
    return PerformanceMonitor()


# ==================== ENVIRONMENT FIXTURES ====================

@pytest.fixture(scope="session")
def test_settings():
    """Configuración específica para tests"""
    original_env = os.environ.copy()
    
    # Configurar variables de entorno para tests
    os.environ.update({
        "ENVIRONMENT": "test",
        "DATABASE_URL": "sqlite:///./test.db",
        "REDIS_URL": "redis://localhost:6379/1",
        "ML_MODEL_PATH": "/tmp/test_models",
        "LOG_LEVEL": "DEBUG",
        "CACHE_TTL": "60",
        "ENABLE_ML_MODELS": "true"
    })
    
    yield
    
    # Restaurar variables de entorno originales
    os.environ.clear()
    os.environ.update(original_env)


# ==================== CLEANUP FIXTURES ====================

@pytest.fixture(autouse=True)
def cleanup_test_data():
    """Cleanup automático después de cada test"""
    yield
    # Cleanup code aquí si es necesario
    pass


# ==================== PARAMETRIZE FIXTURES ====================

@pytest.fixture(params=[
    {"algorithm": "collaborative_filtering", "max_recs": 5},
    {"algorithm": "content_based", "max_recs": 3},
    {"algorithm": "hybrid", "max_recs": 10}
])
def recommendation_algorithms(request):
    """Diferentes algoritmos de recomendación para tests parametrizados"""
    return request.param


@pytest.fixture(params=[1, 7, 14, 30])
def prediction_horizons(request):
    """Diferentes horizontes de predicción para tests parametrizados"""
    return request.param


# ==================== INTEGRATION TEST FIXTURES ====================

@pytest.fixture(scope="session")
def docker_compose_setup():
    """Setup para tests de integración con Docker Compose"""
    import subprocess
    import time
    
    # Iniciar servicios de test
    subprocess.run(["docker-compose", "-f", "docker-compose.test.yml", "up", "-d"])
    time.sleep(10)  # Esperar que los servicios estén listos
    
    yield
    
    # Cleanup
    subprocess.run(["docker-compose", "-f", "docker-compose.test.yml", "down"])


if __name__ == "__main__":
    print("Fixtures for ML Service Testing")
    print("Available fixtures:")
    print("- Database: mock_db_dependency, db_session")
    print("- Redis: mock_redis_dependency, redis_with_data")
    print("- HTTP Clients: client, async_client")
    print("- ML Models: mock_stock_predictor, mock_recommendation_engine")
    print("- Data: sample_product_data, sample_user_data")
    print("- Errors: redis_connection_error, db_connection_error, ml_model_error")