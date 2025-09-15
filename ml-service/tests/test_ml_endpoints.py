"""
Tests unitarios para el servicio ML usando pytest
Incluye mocking de Redis, PostgreSQL y endpoints FastAPI
"""

import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi.testclient import TestClient
from httpx import AsyncClient
import json
from datetime import datetime, timedelta

# Importar la aplicación FastAPI
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

from app.main import app
from app.database import get_db
from app.cache import get_redis
from app.models.recommendation_engine import RecommendationEngine
from app.models.stock_predictor import StockPredictor


class TestMLServiceHealth:
    """Tests para endpoints de health check"""
    
    def setup_method(self):
        """Configuración para cada test"""
        self.client = TestClient(app)

    def test_health_check_success(self):
        """Test health check básico exitoso"""
        response = self.client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "ml-service"
        assert "timestamp" in data

    @patch('app.cache.get_redis')
    @patch('app.database.get_db')
    def test_health_check_detailed_success(self, mock_db, mock_redis):
        """Test health check detallado con dependencias"""
        # Mock Redis connection
        mock_redis_client = AsyncMock()
        mock_redis_client.ping.return_value = True
        mock_redis.return_value = mock_redis_client
        
        # Mock Database connection
        mock_db_session = MagicMock()
        mock_db.return_value = mock_db_session
        
        response = self.client.get("/health/detailed")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["dependencies"]["redis"] == "connected"
        assert data["dependencies"]["database"] == "connected"

    @patch('app.cache.get_redis')
    def test_health_check_redis_failure(self, mock_redis):
        """Test health check cuando Redis falla"""
        # Mock Redis connection failure
        mock_redis_client = AsyncMock()
        mock_redis_client.ping.side_effect = Exception("Redis connection failed")
        mock_redis.return_value = mock_redis_client
        
        response = self.client.get("/health/detailed")
        
        assert response.status_code == 503
        data = response.json()
        assert data["status"] == "unhealthy"
        assert data["dependencies"]["redis"] == "disconnected"


class TestStockPredictionEndpoint:
    """Tests para el endpoint de predicción de stock"""
    
    def setup_method(self):
        """Configuración para cada test"""
        self.client = TestClient(app)

    @patch('app.models.stock_predictor.StockPredictor.predict_demand')
    @patch('app.cache.get_redis')
    def test_predict_stock_success(self, mock_redis, mock_predictor):
        """Test predicción de stock exitosa"""
        # Mock Redis para cache
        mock_redis_client = AsyncMock()
        mock_redis_client.get.return_value = None  # No hay cache
        mock_redis_client.setex = AsyncMock()
        mock_redis.return_value = mock_redis_client
        
        # Mock predictor
        mock_predictor.return_value = {
            "predicted_demand": 150,
            "confidence": 0.85,
            "factors": ["seasonal", "trend"]
        }
        
        request_data = {
            "product_id": 1,
            "historical_data": {
                "sales_history": [100, 120, 140, 130, 145],
                "timeframe_days": 30
            }
        }
        
        response = self.client.post("/api/predictions/stock", json=request_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["product_id"] == 1
        assert data["predicted_demand"] == 150
        assert data["confidence"] == 0.85
        assert "prediction_date" in data

    def test_predict_stock_invalid_data(self):
        """Test predicción con datos inválidos"""
        invalid_request = {
            "product_id": -1,  # ID inválido
            "historical_data": {
                "sales_history": [],  # Historia vacía
                "timeframe_days": 0   # Timeframe inválido
            }
        }
        
        response = self.client.post("/api/predictions/stock", json=invalid_request)
        
        assert response.status_code == 422  # Validation error

    @patch('app.cache.get_redis')
    def test_predict_stock_from_cache(self, mock_redis):
        """Test predicción desde cache"""
        # Mock Redis con datos en cache
        cached_data = {
            "product_id": 1,
            "predicted_demand": 200,
            "confidence": 0.90,
            "prediction_date": datetime.now().isoformat(),
            "cached": True
        }
        
        mock_redis_client = AsyncMock()
        mock_redis_client.get.return_value = json.dumps(cached_data)
        mock_redis.return_value = mock_redis_client
        
        request_data = {
            "product_id": 1,
            "historical_data": {
                "sales_history": [100, 120, 140],
                "timeframe_days": 30
            }
        }
        
        response = self.client.post("/api/predictions/stock", json=request_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["cached"] is True
        assert data["predicted_demand"] == 200

    @patch('app.models.stock_predictor.StockPredictor.predict_demand')
    def test_predict_stock_model_error(self, mock_predictor):
        """Test cuando el modelo ML falla"""
        # Mock predictor failure
        mock_predictor.side_effect = Exception("Model loading failed")
        
        request_data = {
            "product_id": 1,
            "historical_data": {
                "sales_history": [100, 120, 140],
                "timeframe_days": 30
            }
        }
        
        response = self.client.post("/api/predictions/stock", json=request_data)
        
        assert response.status_code == 500
        data = response.json()
        assert "error" in data
        assert "Model loading failed" in data["detail"]


class TestRecommendationEndpoint:
    """Tests para el endpoint de recomendaciones"""
    
    def setup_method(self):
        """Configuración para cada test"""
        self.client = TestClient(app)

    @patch('app.models.recommendation_engine.RecommendationEngine.get_recommendations')
    @patch('app.database.get_db')
    def test_get_recommendations_success(self, mock_db, mock_recommender):
        """Test recomendaciones exitosas"""
        # Mock database session
        mock_db_session = MagicMock()
        mock_db.return_value = mock_db_session
        
        # Mock recommendation engine
        mock_recommender.return_value = [
            {
                "product_id": 5,
                "score": 0.92,
                "reason": "Frequently bought together"
            },
            {
                "product_id": 8,
                "score": 0.88,
                "reason": "Similar user preferences"
            }
        ]
        
        request_data = {
            "user_id": 123,
            "product_history": [1, 2, 3],
            "max_recommendations": 5
        }
        
        response = self.client.post("/api/recommendations/products", json=request_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["user_id"] == 123
        assert len(data["recommendations"]) == 2
        assert data["recommendations"][0]["product_id"] == 5
        assert data["recommendations"][0]["score"] == 0.92

    def test_get_recommendations_invalid_user(self):
        """Test recomendaciones con usuario inválido"""
        request_data = {
            "user_id": -1,  # Usuario inválido
            "product_history": [1, 2, 3],
            "max_recommendations": 5
        }
        
        response = self.client.post("/api/recommendations/products", json=request_data)
        
        assert response.status_code == 422

    @patch('app.models.recommendation_engine.RecommendationEngine.get_recommendations')
    def test_get_recommendations_empty_history(self, mock_recommender):
        """Test recomendaciones con historial vacío"""
        # Mock para usuario sin historial
        mock_recommender.return_value = []
        
        request_data = {
            "user_id": 999,
            "product_history": [],
            "max_recommendations": 5
        }
        
        response = self.client.post("/api/recommendations/products", json=request_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["user_id"] == 999
        assert len(data["recommendations"]) == 0
        assert data["message"] == "No recommendations available for user"


class TestAnalyticsEndpoint:
    """Tests para endpoints de analytics"""
    
    def setup_method(self):
        """Configuración para cada test"""
        self.client = TestClient(app)

    @patch('app.database.get_db')
    def test_get_category_trends_success(self, mock_db):
        """Test análisis de tendencias por categoría"""
        # Mock database query results
        mock_db_session = MagicMock()
        mock_db_session.execute.return_value.fetchall.return_value = [
            ("2024-01", 150.5, 12.3),
            ("2024-02", 165.2, 9.8),
            ("2024-03", 180.1, 9.0)
        ]
        mock_db.return_value = mock_db_session
        
        response = self.client.get("/api/analytics/trends?category=Electronics")
        
        assert response.status_code == 200
        data = response.json()
        assert data["category"] == "Electronics"
        assert len(data["trends"]) == 3
        assert data["trends"][0]["period"] == "2024-01"
        assert data["trends"][0]["sales_volume"] == 150.5

    def test_get_category_trends_invalid_category(self):
        """Test tendencias con categoría inválida"""
        response = self.client.get("/api/analytics/trends?category=")
        
        assert response.status_code == 422

    @patch('app.cache.get_redis')
    @patch('app.database.get_db')
    def test_get_sales_forecast(self, mock_db, mock_redis):
        """Test pronóstico de ventas"""
        # Mock Redis cache
        mock_redis_client = AsyncMock()
        mock_redis_client.get.return_value = None
        mock_redis_client.setex = AsyncMock()
        mock_redis.return_value = mock_redis_client
        
        # Mock database
        mock_db_session = MagicMock()
        mock_db.return_value = mock_db_session
        
        response = self.client.get("/api/analytics/forecast?product_id=1&days=30")
        
        assert response.status_code == 200
        data = response.json()
        assert data["product_id"] == 1
        assert data["forecast_days"] == 30
        assert "predictions" in data
        assert "confidence_interval" in data


@pytest.fixture
def async_client():
    """Fixture para cliente async"""
    return AsyncClient(app=app, base_url="http://test")


class TestAsyncEndpoints:
    """Tests para endpoints asíncronos"""
    
    @pytest.mark.asyncio
    async def test_async_batch_predictions(self, async_client):
        """Test predicciones en lote asíncronas"""
        request_data = {
            "predictions": [
                {
                    "product_id": 1,
                    "historical_data": {"sales_history": [100, 120]}
                },
                {
                    "product_id": 2,
                    "historical_data": {"sales_history": [80, 90]}
                }
            ]
        }
        
        with patch('app.models.stock_predictor.StockPredictor.predict_demand') as mock_pred:
            mock_pred.side_effect = [
                {"predicted_demand": 150, "confidence": 0.85},
                {"predicted_demand": 100, "confidence": 0.90}
            ]
            
            response = await async_client.post("/api/predictions/batch", json=request_data)
            
            assert response.status_code == 200
            data = response.json()
            assert len(data["results"]) == 2
            assert data["results"][0]["product_id"] == 1
            assert data["results"][1]["product_id"] == 2


class TestMLModelValidation:
    """Tests para validación de modelos ML"""
    
    def test_stock_predictor_model_validation(self):
        """Test validación del modelo de predicción"""
        with patch('app.models.stock_predictor.StockPredictor.load_model') as mock_load:
            # Test modelo cargado correctamente
            mock_load.return_value = MagicMock()
            
            predictor = StockPredictor()
            assert predictor.model is not None
            
            # Test predicción con datos válidos
            result = predictor.predict_demand(
                product_id=1,
                sales_history=[100, 120, 140],
                timeframe_days=30
            )
            assert "predicted_demand" in result
            assert "confidence" in result

    def test_recommendation_engine_validation(self):
        """Test validación del motor de recomendaciones"""
        with patch('app.models.recommendation_engine.RecommendationEngine.load_model') as mock_load:
            mock_load.return_value = MagicMock()
            
            engine = RecommendationEngine()
            assert engine.model is not None
            
            # Test recomendaciones
            recommendations = engine.get_recommendations(
                user_id=123,
                product_history=[1, 2, 3],
                max_recommendations=5
            )
            assert isinstance(recommendations, list)


class TestErrorHandling:
    """Tests para manejo de errores"""
    
    def setup_method(self):
        self.client = TestClient(app)

    def test_404_endpoint(self):
        """Test endpoint no encontrado"""
        response = self.client.get("/api/nonexistent")
        assert response.status_code == 404

    def test_method_not_allowed(self):
        """Test método no permitido"""
        response = self.client.put("/health")
        assert response.status_code == 405

    def test_invalid_json(self):
        """Test JSON inválido"""
        response = self.client.post(
            "/api/predictions/stock",
            data="invalid json",
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 422

    @patch('app.models.stock_predictor.StockPredictor.predict_demand')
    def test_internal_server_error(self, mock_predictor):
        """Test error interno del servidor"""
        mock_predictor.side_effect = Exception("Unexpected error")
        
        request_data = {
            "product_id": 1,
            "historical_data": {
                "sales_history": [100, 120, 140],
                "timeframe_days": 30
            }
        }
        
        response = self.client.post("/api/predictions/stock", json=request_data)
        assert response.status_code == 500


if __name__ == "__main__":
    pytest.main([__file__, "-v"])