# Configuración para test performance con Locust
from locust import HttpUser, task, between
import random
import json


class MLServiceUser(HttpUser):
    wait_time = between(1, 3)
    
    def on_start(self):
        """Setup inicial para cada usuario"""
        self.products = list(range(1, 101))  # IDs de productos 1-100
        self.users = list(range(1, 51))      # IDs de usuarios 1-50
    
    @task(3)
    def get_predictions(self):
        """Test endpoint de predicciones"""
        product_id = random.choice(self.products)
        
        payload = {
            "product_id": product_id,
            "prediction_type": "stock",
            "horizon_days": 30,
            "include_confidence": True,
            "include_metadata": True
        }
        
        with self.client.post(
            "/api/v1/predictions/generate",
            json=payload,
            catch_response=True
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Prediction failed: {response.status_code}")
    
    @task(2)
    def get_recommendations(self):
        """Test endpoint de recomendaciones"""
        user_id = random.choice(self.users)
        
        payload = {
            "user_id": user_id,
            "recommendation_type": "hybrid",
            "max_results": 10,
            "include_metadata": True
        }
        
        with self.client.post(
            "/api/v1/recommendations/generate", 
            json=payload,
            catch_response=True
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Recommendation failed: {response.status_code}")
    
    @task(1)
    def get_trending(self):
        """Test endpoint de trending"""
        with self.client.get(
            "/api/v1/recommendations/trending?max_results=20",
            catch_response=True
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Trending failed: {response.status_code}")
    
    @task(1)
    def health_check(self):
        """Test health check"""
        with self.client.get("/health", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Health check failed: {response.status_code}")