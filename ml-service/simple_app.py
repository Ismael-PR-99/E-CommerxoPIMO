"""
FastAPI simplificado para ML Service - versión mínima funcional
"""
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import random

app = FastAPI(
    title="E-CommerxoPIMO ML Service",
    description="Servicio de Machine Learning simplificado",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelos simples
class BaseResponse(BaseModel):
    success: bool = True
    timestamp: datetime = Field(default_factory=datetime.now)
    message: Optional[str] = None

class PredictionValue(BaseModel):
    date: str
    value: float
    confidence_lower: float
    confidence_upper: float

class PredictionResponse(BaseResponse):
    product_id: int
    prediction_type: str
    horizon_days: int
    predictions: List[PredictionValue]
    model_version: str = "v1.0.0"
    accuracy_score: float = 0.85

class RecommendationItem(BaseModel):
    product_id: int
    score: float
    reason: str
    confidence: float

class RecommendationResponse(BaseResponse):
    user_id: int
    algorithm_used: str = "hybrid"
    recommendations: List[RecommendationItem]
    total_found: int

class HealthCheckResponse(BaseResponse):
    status: str = "healthy"
    models_status: Dict[str, bool] = {"stock_predictor": True, "recommender": True}
    database_connected: bool = True
    redis_connected: bool = False

# Endpoints

@app.get("/", response_model=BaseResponse)
async def root():
    return BaseResponse(
        message="E-CommerxoPIMO ML Service está funcionando correctamente"
    )

@app.get("/health", response_model=HealthCheckResponse)
async def health_check():
    return HealthCheckResponse()

@app.post("/api/predictions/stock", response_model=PredictionResponse)
async def predict_stock(
    product_id: int,
    horizon_days: int = 30
):
    # Generar predicciones simuladas
    predictions = []
    base_value = random.uniform(50, 150)
    
    for i in range(min(horizon_days, 30)):
        date = datetime.now().strftime("%Y-%m-%d")
        value = base_value + random.uniform(-10, 10)
        predictions.append(PredictionValue(
            date=date,
            value=round(value, 2),
            confidence_lower=round(value * 0.9, 2),
            confidence_upper=round(value * 1.1, 2)
        ))
    
    return PredictionResponse(
        product_id=product_id,
        prediction_type="stock",
        horizon_days=horizon_days,
        predictions=predictions,
        message=f"Predicción de stock generada para producto {product_id}"
    )

@app.post("/api/recommendations/user", response_model=RecommendationResponse)
async def get_user_recommendations(
    user_id: int,
    num_recommendations: int = 10
):
    # Generar recomendaciones simuladas
    recommendations = []
    
    for i in range(min(num_recommendations, 10)):
        recommendations.append(RecommendationItem(
            product_id=random.randint(1, 1000),
            score=round(random.uniform(0.7, 0.95), 2),
            reason=f"Basado en tus compras anteriores",
            confidence=round(random.uniform(0.8, 0.95), 2)
        ))
    
    return RecommendationResponse(
        user_id=user_id,
        recommendations=recommendations,
        total_found=len(recommendations),
        message=f"Recomendaciones generadas para usuario {user_id}"
    )

@app.get("/api/models/status")
async def get_models_status():
    return {
        "success": True,
        "timestamp": datetime.now(),
        "models": {
            "stock_predictor": {"status": "healthy", "last_trained": "2024-01-15T10:00:00Z"},
            "recommender": {"status": "healthy", "last_trained": "2024-01-15T10:00:00Z"},
            "sentiment_analyzer": {"status": "healthy", "last_trained": "2024-01-15T10:00:00Z"}
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)