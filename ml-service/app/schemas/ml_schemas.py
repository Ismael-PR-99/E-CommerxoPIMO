
"""
Esquemas Pydantic para validaci�n y serializaci�n de datos del microservicio ML
Incluye request/response models, validaci�n empresarial y documentaci�n autom�tica
"""
from datetime import datetime
from typing import Dict, List, Optional, Union, Any
from enum import Enum
from pydantic import BaseModel, Field, validator, root_validator
import re

# Base Models
class BaseResponse(BaseModel):
    """Modelo base para todas las respuestas"""
    success: bool = True
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    message: Optional[str] = None

class ErrorResponse(BaseResponse):
    """Modelo para respuestas de error"""
    success: bool = False
    error_code: str
    error_details: Optional[Dict[str, Any]] = None

# Enums
class SentimentType(str, Enum):
    POSITIVE = "positive"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"
    MIXED = "mixed"

class AnomalyType(str, Enum):
    FRAUD = "fraud"
    OUTLIER = "outlier"
    BEHAVIORAL = "behavioral"
    INVENTORY = "inventory"
    PRICE = "price"
    PATTERN = "pattern"

class PricingStrategy(str, Enum):
    PENETRATION = "penetration"
    SKIMMING = "skimming"
    COMPETITIVE = "competitive"
    DYNAMIC = "dynamic"
    VALUE_BASED = "value_based"

class RecommendationAlgorithm(str, Enum):
    COLLABORATIVE = "collaborative"
    CONTENT = "content"
    HYBRID = "hybrid"
    NEURAL = "neural"

# Stock Prediction Schemas
class StockPredictionRequest(BaseModel):
    """Request para predicci�n de stock"""
    product_id: int = Field(..., gt=0, description="ID del producto")
    days_ahead: int = Field(30, ge=1, le=365, description="D�as a predecir")
    include_confidence_intervals: bool = Field(True, description="Incluir intervalos de confianza")

    class Config:
        schema_extra = {
            "example": {
                "product_id": 123,
                "days_ahead": 30,
                "include_confidence_intervals": True
            }
        }

class StockPredictionBatchRequest(BaseModel):
    """Request para predicci�n de stock en lote"""
    product_ids: List[int] = Field(..., min_items=1, max_items=100)
    days_ahead: int = Field(30, ge=1, le=365)

    @validator('product_ids')
    def validate_product_ids(cls, v):
        if not all(pid > 0 for pid in v):
            raise ValueError('Todos los product_ids deben ser positivos')
        return v

class ConfidenceInterval(BaseModel):
    """Intervalo de confianza"""
    lower_bound: float
    upper_bound: float
    confidence_level: float = Field(ge=0, le=1)

class StockPredictionResponse(BaseResponse):
    """Respuesta de predicci�n de stock"""
    product_id: int
    predictions: List[float]
    dates: List[str]
    confidence_intervals: Optional[List[ConfidenceInterval]] = None
    model_accuracy: float = Field(ge=0, le=1)
    trend_analysis: Dict[str, Any]
    risk_factors: List[str]

# Recommendation Schemas
class RecommendationRequest(BaseModel):
    """Request para recomendaciones de usuario"""
    user_id: int = Field(..., gt=0)
    num_recommendations: int = Field(10, ge=1, le=50)
    algorithm: RecommendationAlgorithm = RecommendationAlgorithm.HYBRID
    include_explanation: bool = True

    class Config:
        schema_extra = {
            "example": {
                "user_id": 456,
                "num_recommendations": 10,
                "algorithm": "hybrid",
                "include_explanation": True
            }
        }

class SimilarProductsRequest(BaseModel):
    """Request para productos similares"""
    product_id: int = Field(..., gt=0)
    num_similar: int = Field(10, ge=1, le=50)
    similarity_threshold: float = Field(0.5, ge=0, le=1)

class ProductRecommendation(BaseModel):
    """Recomendaci�n individual de producto"""
    product_id: int
    score: float = Field(ge=0, le=1)
    reason: str
    category: Optional[str] = None
    price: Optional[float] = Field(None, ge=0)
    confidence: float = Field(ge=0, le=1)

class RecommendationResponse(BaseResponse):
    """Respuesta de recomendaciones"""
    user_id: Optional[int] = None
    product_id: Optional[int] = None
    recommendations: List[ProductRecommendation]
    algorithm_used: str
    diversification_score: float = Field(ge=0, le=1)
    explanation: str

# Price Optimization Schemas
class PriceOptimizationRequest(BaseModel):
    """Request para optimizaci�n de precios"""
    product_id: int = Field(..., gt=0)
    current_price: float = Field(..., gt=0)
    strategy: PricingStrategy = PricingStrategy.DYNAMIC
    constraints: Optional[Dict[str, float]] = None

    @validator('constraints')
    def validate_constraints(cls, v):
        if v:
            if 'min_price' in v and 'max_price' in v:
                if v['min_price'] >= v['max_price']:
                    raise ValueError('min_price debe ser menor que max_price')
        return v

    class Config:
        schema_extra = {
            "example": {
                "product_id": 789,
                "current_price": 99.99,
                "strategy": "dynamic",
                "constraints": {
                    "min_price": 80.0,
                    "max_price": 120.0
                }
            }
        }

class PriceBatchOptimizationRequest(BaseModel):
    """Request para optimizaci�n de precios en lote"""
    products: List[Dict[str, Any]] = Field(..., min_items=1, max_items=100)
    strategy: PricingStrategy = PricingStrategy.DYNAMIC

class PriceOptimizationResponse(BaseResponse):
    """Respuesta de optimizaci�n de precios"""
    product_id: int
    current_price: float
    optimal_price: float
    price_change_percent: float
    expected_revenue: float
    expected_profit: float
    demand_elasticity: float
    confidence_score: float = Field(ge=0, le=1)
    strategy_used: str
    reasoning: str
    market_conditions: Dict[str, Any]

# Anomaly Detection Schemas
class AnomalyDetectionRequest(BaseModel):
    """Request para detecci�n de anomal�as"""
    data: List[Dict[str, Any]] = Field(..., min_items=1)
    entity_type: str = Field(..., regex="^(transaction|user|product|inventory)$")
    detection_methods: Optional[List[str]] = None
    sensitivity: float = Field(0.5, ge=0, le=1)

class UserAnomalyRequest(BaseModel):
    """Request para anomal�as de usuario"""
    user_id: int = Field(..., gt=0)
    time_window_days: int = Field(30, ge=1, le=365)
    include_patterns: bool = True

class AnomalyResult(BaseModel):
    """Resultado de anomal�a detectada"""
    entity_id: Union[int, str]
    entity_type: str
    anomaly_type: AnomalyType
    severity: str = Field(..., regex="^(low|medium|high|critical)$")
    anomaly_score: float = Field(ge=0, le=1)
    confidence: float = Field(ge=0, le=1)
    description: str
    anomalous_features: Dict[str, float]
    detection_method: str
    recommendations: List[str]

class AnomalyDetectionResponse(BaseResponse):
    """Respuesta de detecci�n de anomal�as"""
    total_entities_analyzed: int
    anomalies_detected: int
    anomaly_rate: float = Field(ge=0, le=1)
    anomalies: List[AnomalyResult]
    patterns_detected: Optional[List[Dict[str, Any]]] = None

# Sentiment Analysis Schemas
class SentimentAnalysisRequest(BaseModel):
    """Request para an�lisis de sentimientos"""
    text: str = Field(..., min_length=1, max_length=10000)
    model_type: str = Field("ensemble", regex="^(bert|lstm|traditional|ensemble|vader)$")
    include_emotions: bool = True
    language: Optional[str] = Field(None, regex="^(en|es|auto)$")

    @validator('text')
    def validate_text(cls, v):
        # Remove excessive whitespace
        v = re.sub(r'\s+', ' ', v.strip())
        if not v:
            raise ValueError('Text cannot be empty after cleaning')
        return v

class BatchSentimentRequest(BaseModel):
    """Request para an�lisis de sentimientos en lote"""
    texts: List[str] = Field(..., min_items=1, max_items=1000)
    model_type: str = Field("ensemble", regex="^(bert|lstm|traditional|ensemble|vader)$")

    @validator('texts')
    def validate_texts(cls, v):
        cleaned_texts = []
        for text in v:
            cleaned = re.sub(r'\s+', ' ', text.strip())
            if cleaned:
                cleaned_texts.append(cleaned)
        if not cleaned_texts:
            raise ValueError('At least one valid text is required')
        return cleaned_texts

class ProductSentimentRequest(BaseModel):
    """Request para an�lisis de sentimientos de producto"""
    product_id: int = Field(..., gt=0)
    reviews: List[str] = Field(..., min_items=1)
    include_aspects: bool = True

class SentimentResult(BaseModel):
    """Resultado de an�lisis de sentimiento"""
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
    """Respuesta de an�lisis de sentimientos"""
    sentiment_result: SentimentResult
    model_used: str
    processing_time_ms: Optional[float] = None

class BatchSentimentResponse(BaseResponse):
    """Respuesta de an�lisis de sentimientos en lote"""
    total_texts: int
    results: List[SentimentResult]
    summary: Dict[str, Any]
    processing_time_ms: float

# Comprehensive Analysis Schemas
class ProductInsightsRequest(BaseModel):
    """Request para insights comprehensivos de producto"""
    product_id: int = Field(..., gt=0)
    days_back: int = Field(90, ge=7, le=365)
    include_predictions: bool = True
    include_recommendations: bool = True
    include_sentiment: bool = True
    include_pricing: bool = True

class UserProfileRequest(BaseModel):
    """Request para an�lisis de perfil de usuario"""
    user_id: int = Field(..., gt=0)
    include_recommendations: bool = True
    include_anomalies: bool = True
    include_patterns: bool = True

class ProductInsightsResponse(BaseResponse):
    """Respuesta de insights de producto"""
    product_id: int
    analysis_period_days: int
    stock_insights: Optional[Dict[str, Any]] = None
    pricing_insights: Optional[Dict[str, Any]] = None
    sentiment_insights: Optional[Dict[str, Any]] = None
    recommendation_insights: Optional[Dict[str, Any]] = None
    risk_assessment: Dict[str, Any]
    action_recommendations: List[str]

class UserProfileResponse(BaseResponse):
    """Respuesta de an�lisis de perfil de usuario"""
    user_id: int
    profile_summary: Dict[str, Any]
    behavioral_insights: Dict[str, Any]
    recommendations: Optional[List[ProductRecommendation]] = None
    anomalies: Optional[List[AnomalyResult]] = None
    risk_score: float = Field(ge=0, le=1)
    engagement_score: float = Field(ge=0, le=1)

# Health and Metrics Schemas
class HealthCheckResponse(BaseResponse):
    """Respuesta de health check"""
    status: str = Field(..., regex="^(healthy|degraded|unhealthy)$")
    models_status: Dict[str, bool]
    database_connected: bool
    redis_connected: bool
    memory_usage_mb: Optional[float] = None
    uptime_seconds: Optional[float] = None

class MetricsResponse(BaseResponse):
    """Respuesta de m�tricas"""
    total_requests: int = Field(ge=0)
    successful_requests: int = Field(ge=0)
    error_rate: float = Field(ge=0, le=1)
    average_response_time_ms: float = Field(ge=0)
    cache_hit_ratio: float = Field(ge=0, le=1)
    models_performance: Dict[str, Dict[str, float]]
    resource_usage: Dict[str, float]

# Training and Model Management Schemas
class ModelTrainingRequest(BaseModel):
    """Request para entrenamiento de modelos"""
    model_type: str = Field(..., regex="^(stock_predictor|recommender|price_optimizer|anomaly_detector|sentiment_analyzer)$")
    training_data_path: Optional[str] = None
    hyperparameters: Optional[Dict[str, Any]] = None
    validation_split: float = Field(0.2, ge=0.1, le=0.5)

class ModelTrainingResponse(BaseResponse):
    """Respuesta de entrenamiento de modelos"""
    model_type: str
    training_id: str
    status: str = Field(..., regex="^(started|in_progress|completed|failed)$")
    training_metrics: Optional[Dict[str, float]] = None
    estimated_completion_time: Optional[datetime] = None

class ModelStatusRequest(BaseModel):
    """Request para estado de modelo"""
    model_type: str = Field(..., regex="^(stock_predictor|recommender|price_optimizer|anomaly_detector|sentiment_analyzer)$")

class ModelStatusResponse(BaseResponse):
    """Respuesta de estado de modelo"""
    model_type: str
    is_loaded: bool
    last_trained: Optional[datetime] = None
    accuracy_metrics: Optional[Dict[str, float]] = None
    version: str
    size_mb: Optional[float] = None

# Validation Helpers
class PaginationParams(BaseModel):
    """Par�metros de paginaci�n"""
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size

class DateRangeParams(BaseModel):
    """Par�metros de rango de fechas"""
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

    @root_validator
    def validate_date_range(cls, values):
        start = values.get('start_date')
        end = values.get('end_date')

        if start and end and start >= end:
            raise ValueError('start_date must be before end_date')

        return values

class FilterParams(BaseModel):
    """Par�metros de filtrado"""
    category: Optional[str] = None
    price_min: Optional[float] = Field(None, ge=0)
    price_max: Optional[float] = Field(None, ge=0)
    rating_min: Optional[float] = Field(None, ge=0, le=5)

    @root_validator
    def validate_price_range(cls, values):
        price_min = values.get('price_min')
        price_max = values.get('price_max')

        if price_min and price_max and price_min >= price_max:
            raise ValueError('price_min must be less than price_max')

        return values

# Webhook and Notification Schemas
class WebhookConfig(BaseModel):
    """Configuraci�n de webhook"""
    url: str = Field(..., regex=r'^https?://.+')
    events: List[str] = Field(..., min_items=1)
    secret_key: Optional[str] = None
    retry_attempts: int = Field(3, ge=1, le=10)
    timeout_seconds: int = Field(30, ge=5, le=300)

class NotificationRequest(BaseModel):
    """Request para notificaci�n"""
    event_type: str
    entity_id: Union[int, str]
    data: Dict[str, Any]
    priority: str = Field("normal", regex="^(low|normal|high|critical)$")

class NotificationResponse(BaseResponse):
    """Respuesta de notificaci�n"""
    notification_id: str
    status: str = Field(..., regex="^(sent|failed|queued)$")
    delivery_attempts: int = Field(ge=0)

# Export all schemas for easy importing
__all__ = [
    # Base
    'BaseResponse', 'ErrorResponse',

    # Enums
    'SentimentType', 'AnomalyType', 'PricingStrategy', 'RecommendationAlgorithm',

    # Stock Prediction
    'StockPredictionRequest', 'StockPredictionBatchRequest', 'StockPredictionResponse',
    'ConfidenceInterval',

    # Recommendations
    'RecommendationRequest', 'SimilarProductsRequest', 'RecommendationResponse',
    'ProductRecommendation',

    # Price Optimization
    'PriceOptimizationRequest', 'PriceBatchOptimizationRequest', 'PriceOptimizationResponse',

    # Anomaly Detection
    'AnomalyDetectionRequest', 'UserAnomalyRequest', 'AnomalyDetectionResponse',
    'AnomalyResult',

    # Sentiment Analysis
    'SentimentAnalysisRequest', 'BatchSentimentRequest', 'ProductSentimentRequest',
    'SentimentAnalysisResponse', 'BatchSentimentResponse', 'SentimentResult',

    # Comprehensive Analysis
    'ProductInsightsRequest', 'UserProfileRequest', 'ProductInsightsResponse',
    'UserProfileResponse',

    # Health and Metrics
    'HealthCheckResponse', 'MetricsResponse',

    # Model Management
    'ModelTrainingRequest', 'ModelTrainingResponse', 'ModelStatusRequest',
    'ModelStatusResponse',

    # Helpers
    'PaginationParams', 'DateRangeParams', 'FilterParams',

    # Webhooks
    'WebhookConfig', 'NotificationRequest', 'NotificationResponse'
]
