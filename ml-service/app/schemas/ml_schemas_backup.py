"""
Esquemas Pydantic unificados para ML Service
Incluye modelos de request/response para predicciones y recomendaciones con ejemplos completos
"""
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Union, Any
from enum import Enum
from pydantic import BaseModel, Field, validator, ConfigDict, model_validator
import re

# === MODELOS BASE ===

class BaseResponse(BaseModel):
    """Modelo base para todas las respuestas de la API"""
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "success": True,
                "timestamp": "2024-01-15T10:30:00Z",
                "message": "Operación completada exitosamente"
            }
        }
    )
    
    success: bool = Field(description="Indica si la operación fue exitosa")
    timestamp: datetime = Field(default_factory=datetime.now, description="Timestamp de la respuesta")
    message: Optional[str] = Field(default=None, description="Mensaje descriptivo de la respuesta")

# === ENUMS ===

class PredictionType(str, Enum):
    """Tipos de predicción disponibles"""
    STOCK = "stock"
    DEMAND = "demand"
    PRICE = "price"
    SALES = "sales"
    TRENDS = "trends"

class RecommendationAlgorithm(str, Enum):
    """Algoritmos de recomendación disponibles"""
    COLLABORATIVE = "collaborative"
    CONTENT_BASED = "content_based"
    HYBRID = "hybrid"
    POPULARITY = "popularity"
    MATRIX_FACTORIZATION = "matrix_factorization"

class SentimentType(str, Enum):
    """Tipos de sentimiento"""
    POSITIVE = "positive"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"

# === MODELOS DE PREDICCIONES ===

class PredictionRequest(BaseModel):
    """Request base para predicciones"""
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "product_id": 123,
                "prediction_type": "stock",
                "horizon_days": 30,
                "include_confidence": True,
                "include_factors": False
            }
        }
    )
    
    product_id: int = Field(description="ID del producto a predecir", gt=0)
    prediction_type: PredictionType = Field(description="Tipo de predicción solicitada")
    horizon_days: int = Field(
        description="Días hacia el futuro para la predicción",
        gt=0,
        le=365
    )
    include_confidence: bool = Field(
        default=True,
        description="Incluir intervalos de confianza en la predicción"
    )
    include_factors: bool = Field(
        default=False,
        description="Incluir factores que influyen en la predicción"
    )

class PredictionValue(BaseModel):
    """Valor individual de predicción"""
    date: datetime = Field(description="Fecha de la predicción")
    value: float = Field(description="Valor predicho")
    confidence_lower: Optional[float] = Field(
        default=None,
        description="Límite inferior del intervalo de confianza"
    )
    confidence_upper: Optional[float] = Field(
        default=None,
        description="Límite superior del intervalo de confianza"
    )

class PredictionResponse(BaseResponse):
    """Respuesta de predicción completa"""
    model_config = ConfigDict(
        protected_namespaces=(),
        json_schema_extra={
            "example": {
                "success": True,
                "timestamp": "2025-09-15T23:30:00Z",
                "product_id": 123,
                "prediction_type": "stock",
                "horizon_days": 30,
                "predictions": [
                    {
                        "date": "2025-09-16T00:00:00Z",
                        "value": 85.5,
                        "confidence_lower": 78.2,
                        "confidence_upper": 92.8
                    }
                ],
                "model_version": "v1.2.0",
                "accuracy_score": 0.85,
                "cache_hit": False
            }
        }
    )
    
    product_id: int = Field(description="ID del producto")
    prediction_type: PredictionType = Field(description="Tipo de predicción")
    horizon_days: int = Field(description="Horizonte temporal")
    predictions: List[PredictionValue] = Field(description="Lista de predicciones")
    model_version: str = Field(description="Versión del modelo utilizado")
    accuracy_score: Optional[float] = Field(
        default=None,
        description="Score de precisión del modelo (0-1)"
    )
    influence_factors: Optional[Dict[str, float]] = Field(
        default=None,
        description="Factores que influyen en la predicción"
    )
    cache_hit: bool = Field(
        default=False,
        description="Si la respuesta vino del cache"
    )

# === MODELOS DE RECOMENDACIONES ===

class RecommendationRequest(BaseModel):
    """Request para obtener recomendaciones de productos"""
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "user_id": 456,
                "algorithm": "hybrid",
                "num_recommendations": 10,
                "category_filter": "electronics",
                "price_range": {"min": 50.0, "max": 500.0},
                "include_explanations": True,
                "exclude_purchased": True
            }
        }
    )
    
    user_id: int = Field(description="ID del usuario", gt=0)
    algorithm: RecommendationAlgorithm = Field(
        default=RecommendationAlgorithm.HYBRID,
        description="Algoritmo de recomendación a utilizar"
    )
    num_recommendations: int = Field(
        default=10,
        description="Número de recomendaciones a devolver",
        ge=1,
        le=100
    )
    category_filter: Optional[str] = Field(
        default=None,
        description="Filtrar por categoría específica"
    )
    price_range: Optional[Dict[str, float]] = Field(
        default=None,
        description="Rango de precios {min: float, max: float}"
    )
    include_explanations: bool = Field(
        default=True,
        description="Incluir explicaciones de por qué se recomienda"
    )
    exclude_purchased: bool = Field(
        default=True,
        description="Excluir productos ya comprados por el usuario"
    )

class RecommendationItem(BaseModel):
    """Item individual de recomendación"""
    product_id: int = Field(description="ID del producto recomendado")
    score: float = Field(
        description="Score de recomendación (0-1)",
        ge=0,
        le=1
    )
    reason: Optional[str] = Field(
        default=None,
        description="Razón de la recomendación"
    )
    confidence: float = Field(
        description="Confianza en la recomendación",
        ge=0,
        le=1
    )
    category: Optional[str] = Field(default=None, description="Categoría del producto")
    estimated_rating: Optional[float] = Field(
        default=None,
        description="Rating estimado del usuario para este producto"
    )

class RecommendationResponse(BaseResponse):
    """Respuesta de recomendaciones"""
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "success": True,
                "timestamp": "2025-09-15T23:30:00Z",
                "user_id": 456,
                "algorithm_used": "hybrid",
                "recommendations": [
                    {
                        "product_id": 789,
                        "score": 0.92,
                        "reason": "Productos similares a tus compras anteriores",
                        "confidence": 0.88,
                        "category": "electronics",
                        "estimated_rating": 4.5
                    }
                ],
                "total_found": 15,
                "cache_hit": False
            }
        }
    )
    
    user_id: int = Field(description="ID del usuario")
    algorithm_used: RecommendationAlgorithm = Field(description="Algoritmo utilizado")
    recommendations: List[RecommendationItem] = Field(description="Lista de recomendaciones")
    total_found: int = Field(description="Total de recomendaciones encontradas")
    cache_hit: bool = Field(default=False, description="Si vino del cache")

# === MODELOS DE ANALYTICS ===

class ModelPerformanceRequest(BaseModel):
    """Request para métricas de rendimiento de modelos"""
    model_name: Optional[str] = Field(
        default=None,
        description="Nombre del modelo específico (opcional)"
    )
    start_date: Optional[datetime] = Field(
        default=None,
        description="Fecha de inicio para métricas"
    )
    end_date: Optional[datetime] = Field(
        default=None,
        description="Fecha de fin para métricas"
    )

class ModelMetrics(BaseModel):
    """Métricas de rendimiento de un modelo"""
    model_config = ConfigDict(protected_namespaces=())
    
    model_name: str = Field(description="Nombre del modelo")
    model_version: str = Field(description="Versión del modelo")
    accuracy: float = Field(description="Precisión del modelo")
    precision: Optional[float] = Field(default=None, description="Precisión")
    recall: Optional[float] = Field(default=None, description="Recall")
    f1_score: Optional[float] = Field(default=None, description="F1 Score")
    predictions_count: int = Field(description="Número de predicciones realizadas")
    last_trained: datetime = Field(description="Última vez entrenado")

class AnalyticsResponse(BaseResponse):
    """Respuesta de analytics y métricas"""
    metrics: List[ModelMetrics] = Field(description="Lista de métricas de modelos")
    summary: Dict[str, Any] = Field(description="Resumen de analytics")

# === MODELOS DE VALIDACIÓN ===

class DateRangeParams(BaseModel):
    """Parámetros de rango de fechas"""
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

    @model_validator(mode='before')
    @classmethod
    def validate_date_range(cls, values):
        start = values.get('start_date')
        end = values.get('end_date')

        if start and end and start >= end:
            raise ValueError('start_date must be before end_date')

        return values

class FilterParams(BaseModel):
    """Parámetros de filtrado"""
    category: Optional[str] = None
    price_min: Optional[float] = Field(None, ge=0)
    price_max: Optional[float] = Field(None, ge=0)
    rating_min: Optional[float] = Field(None, ge=0, le=5)

    @model_validator(mode='before')
    @classmethod
    def validate_price_range(cls, values):
        price_min = values.get('price_min')
        price_max = values.get('price_max')

        if price_min and price_max and price_min >= price_max:
            raise ValueError('price_min must be less than price_max')

        return values

# === MODELOS DE SENTIMENT ANALYSIS ===

class SentimentAnalysisRequest(BaseModel):
    """Request para análisis de sentimientos"""
    model_config = ConfigDict(protected_namespaces=())
    
    text: str = Field(..., min_length=1, max_length=10000)
    model_type: str = Field("ensemble", pattern="^(bert|lstm|traditional|ensemble|vader)$")
    include_emotions: bool = True
    language: Optional[str] = Field(None, pattern="^(en|es|auto)$")

    @validator('text')
    def validate_text(cls, v):
        # Remove excessive whitespace
        v = re.sub(r'\s+', ' ', v.strip())
        if not v:
            raise ValueError('Text cannot be empty after cleaning')
        return v

class SentimentResult(BaseModel):
    """Resultado de análisis de sentimiento"""
    text: str
    sentiment: SentimentType
    confidence: float = Field(ge=0, le=1)
    scores: Dict[str, float]
    emotion: Optional[str] = None
    emotion_confidence: Optional[float] = Field(None, ge=0, le=1)
    key_phrases: List[str]
    aspects: Optional[Dict[str, str]] = None
    language: str
    word_count: int = Field(ge=0)

class SentimentAnalysisResponse(BaseResponse):
    """Respuesta de análisis de sentimientos"""
    model_config = ConfigDict(protected_namespaces=())
    
    sentiment_result: SentimentResult
    model_used: str
    processing_time_ms: Optional[float] = None

# === MODELOS DE HEALTH CHECK ===

class HealthCheckResponse(BaseResponse):
    """Respuesta de health check"""
    status: str = Field(..., pattern="^(healthy|degraded|unhealthy)$")
    models_status: Dict[str, bool]
    database_connected: bool
    redis_connected: bool
    memory_usage_mb: Optional[float] = None
    uptime_seconds: Optional[float] = None

class MetricsResponse(BaseResponse):
    """Respuesta de métricas"""
    total_requests: int = Field(ge=0)
    successful_requests: int = Field(ge=0)
    error_rate: float = Field(ge=0, le=1)
    average_response_time_ms: float = Field(ge=0)
    cache_hit_ratio: float = Field(ge=0, le=1)
    models_performance: Dict[str, Dict[str, float]]
    resource_usage: Dict[str, float]