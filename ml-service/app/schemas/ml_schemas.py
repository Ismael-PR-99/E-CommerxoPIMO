"""
Esquemas Pydantic simplificados para ML Service
"""
from datetime import datetime
from typing import Dict, List, Optional, Any
from enum import Enum
from pydantic import BaseModel, Field, ConfigDict

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

class RecommendationType(str, Enum):
    """Tipos de recomendación"""
    PRODUCT = "product"
    USER = "user"
    CATEGORY = "category"
    SIMILAR = "similar"

class SentimentType(str, Enum):
    """Tipos de sentimiento"""
    POSITIVE = "positive"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"

# === MODELOS BASE ===

class BaseResponse(BaseModel):
    """Modelo base para todas las respuestas de la API"""
    model_config = ConfigDict(from_attributes=True)
    
    success: bool = Field(description="Indica si la operación fue exitosa")
    timestamp: datetime = Field(default_factory=datetime.now, description="Timestamp de la respuesta")
    message: Optional[str] = Field(default=None, description="Mensaje descriptivo de la respuesta")

class ErrorResponse(BaseModel):
    """Respuesta de error"""
    model_config = ConfigDict(from_attributes=True)
    
    success: bool = Field(default=False, description="Indica si la operación fue exitosa")
    timestamp: datetime = Field(default_factory=datetime.now, description="Timestamp de la respuesta")
    error: str = Field(description="Mensaje de error")
    error_code: Optional[str] = Field(default=None, description="Código de error")
    details: Optional[Dict[str, Any]] = Field(default=None, description="Detalles adicionales del error")

# === MODELOS DE PREDICCIONES ===

class PredictionRequest(BaseModel):
    """Request base para predicciones"""
    product_id: int = Field(description="ID del producto a predecir", gt=0)
    prediction_type: PredictionType = Field(description="Tipo de predicción solicitada")
    horizon_days: int = Field(description="Días hacia el futuro para la predicción", gt=0, le=365)
    include_confidence: bool = Field(default=True, description="Incluir intervalos de confianza")
    include_factors: bool = Field(default=False, description="Incluir factores de influencia")

class PredictionValue(BaseModel):
    """Valor individual de predicción"""
    date: datetime = Field(description="Fecha de la predicción")
    value: float = Field(description="Valor predicho")
    confidence_lower: Optional[float] = Field(default=None, description="Límite inferior del intervalo de confianza")
    confidence_upper: Optional[float] = Field(default=None, description="Límite superior del intervalo de confianza")

class PredictionResponse(BaseResponse):
    """Respuesta de predicción completa"""
    model_config = ConfigDict(protected_namespaces=())
    
    product_id: int = Field(description="ID del producto")
    prediction_type: PredictionType = Field(description="Tipo de predicción")
    horizon_days: int = Field(description="Horizonte temporal")
    predictions: List[PredictionValue] = Field(description="Lista de predicciones")
    model_version: str = Field(description="Versión del modelo utilizado")
    accuracy_score: Optional[float] = Field(default=None, description="Score de precisión del modelo (0-1)")
    influence_factors: Optional[Dict[str, float]] = Field(default=None, description="Factores que influyen en la predicción")
    cache_hit: bool = Field(default=False, description="Si la respuesta vino del cache")

# === MODELOS DE RECOMENDACIONES ===

class RecommendationRequest(BaseModel):
    """Request para obtener recomendaciones de productos"""
    user_id: int = Field(description="ID del usuario", gt=0)
    algorithm: RecommendationAlgorithm = Field(default=RecommendationAlgorithm.HYBRID, description="Algoritmo de recomendación a utilizar")
    num_recommendations: int = Field(default=10, description="Número de recomendaciones a devolver", ge=1, le=100)
    category_filter: Optional[str] = Field(default=None, description="Filtrar por categoría específica")
    price_range: Optional[Dict[str, float]] = Field(default=None, description="Rango de precios {min: float, max: float}")
    include_explanations: bool = Field(default=True, description="Incluir explicaciones de por qué se recomienda")
    exclude_purchased: bool = Field(default=True, description="Excluir productos ya comprados por el usuario")

class RecommendationItem(BaseModel):
    """Item individual de recomendación"""
    product_id: int = Field(description="ID del producto recomendado")
    score: float = Field(description="Score de recomendación (0-1)", ge=0, le=1)
    reason: Optional[str] = Field(default=None, description="Razón de la recomendación")
    confidence: float = Field(description="Confianza en la recomendación", ge=0, le=1)
    category: Optional[str] = Field(default=None, description="Categoría del producto")
    estimated_rating: Optional[float] = Field(default=None, description="Rating estimado del usuario para este producto")

class ProductMetadata(BaseModel):
    """Metadatos de producto para recomendaciones"""
    product_id: int = Field(description="ID del producto")
    name: str = Field(description="Nombre del producto")
    category: str = Field(description="Categoría del producto")
    price: float = Field(description="Precio del producto")
    rating: Optional[float] = Field(default=None, description="Rating promedio del producto")
    description: Optional[str] = Field(default=None, description="Descripción del producto")
    features: Optional[Dict[str, Any]] = Field(default=None, description="Características adicionales")

class RecommendationResponse(BaseResponse):
    """Respuesta de recomendaciones"""
    user_id: int = Field(description="ID del usuario")
    algorithm_used: RecommendationAlgorithm = Field(description="Algoritmo utilizado")
    recommendations: List[RecommendationItem] = Field(description="Lista de recomendaciones")
    total_found: int = Field(description="Total de recomendaciones encontradas")
    cache_hit: bool = Field(default=False, description="Si vino del cache")

# === MODELOS DE SENTIMENT ANALYSIS ===

class SentimentAnalysisRequest(BaseModel):
    """Request para análisis de sentimientos"""
    model_config = ConfigDict(protected_namespaces=())
    
    text: str = Field(..., min_length=1, max_length=10000)
    model_type: str = Field("ensemble", pattern="^(bert|lstm|traditional|ensemble|vader)$")
    include_emotions: bool = True
    language: Optional[str] = Field(None, pattern="^(en|es|auto)$")

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