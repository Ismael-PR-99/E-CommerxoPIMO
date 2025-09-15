
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
    """Modelo base para todas las respueclass StockPredictionResponse(BaseResponse):
    """Respuesta de predicción de stock"""
    model_config = ConfigDict(protected_namespaces=())class SentimentAnalclass BatchSentimentRequest(BaseModel):class SentimentAnalysisResponse(BaseResponse):
    """Respuesta de análisis de sentimientos"""
    model_config = ConfigDict(protected_namespaces=())
    
    sentiment_result: SentimentResult
    model_used: str """Request para análisis de sentimientos en lote"""
    model_config = ConfigDict(protected_namespaces=())
    
    texts: List[str] = Field(..., min_items=1, max_items=1000)
    model_type: str = Field("ensemble", pattern="^(bert|lstm|traditional|ensemble|vader)$")Request(BaseModel):
    """Request para análisis de sentimientos"""
    model_config = ConfigDict(protected_namespaces=())
    
    text: str = Field(..., min_length=1, max_length=10000)
    model_type: str = Field("ensemble", pattern="^(bert|lstm|traditional|ensemble|vader)$")  
    product_id: int
    predictions: List[float]
    dates: List[str]
    confidence_intervals: Optional[List[ConfidenceInterval]] = None
    model_accuracy: float = Field(ge=0, le=1) la API"""
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "success": True,
                "timestamp": "2024-01-15T10:30:00Z",
                "message": "Operación cclass DateRangeParams(BaseModclass FilterParams(BaseModel):
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

        return valuesámetros de rango de fechas"""
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

    @model_validator(mode='before')
    @classmethod
    def validate_date_range(cls, values):
        start = values.get('start_date')
        end = values.get('end_date')

        if start and end and start >= end:
            raise ValueError('start_date must be before end_date')

        return valuesosamente"
            }
        }
    )
    
    success: bool = Field(
        default=True,
        description="Indica si la operación fue exitosa"
    )
    timestamp: datetime = Field(
        default_factory=datetime.utcnow,
        description="Momento de la respuesta en formato ISO"
    )
    message: Optional[str] = Field(
        default=None,
        description="Mensaje descriptivo adicional"
    )

class ErrorResponse(BaseResponse):
    """Modelo para respuestas de error con detalles completos"""
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "success": False,
                "timestamp": "2024-01-15T10:30:00Z",
                "message": "Error en el procesamiento",
                "error_code": "VALIDATION_ERROR",
                "error_details": {
                    "field": "product_id",
                    "issue": "Valor debe ser mayor a 0"
                }
            }
        }
    )
    
    success: bool = False
    error_code: str = Field(
        description="Código único del error para identificación"
    )
    error_details: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Detalles adicionales del error"
    )

# === ENUMS ===

class PredictionType(str, Enum):
    """Tipos de predicción ML disponibles"""
    STOCK = "stock"
    DEMAND = "demand" 
    PRICE = "price"
    SALES = "sales"

class RecommendationType(str, Enum):
    """Algoritmos de recomendación disponibles"""
    COLLABORATIVE = "collaborative"  # Filtrado colaborativo
    CONTENT_BASED = "content"        # Basado en contenido
    HYBRID = "hybrid"                # Combinación de algoritmos
    TRENDING = "trending"            # Productos populares

class SentimentType(str, Enum):
    """Tipos de sentimiento"""
    POSITIVE = "positive"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"

class TimeHorizon(str, Enum):
    """Horizontes temporales para predicciones"""
    DAILY = "1d"      # 1 día
    WEEKLY = "7d"     # 7 días  
    MONTHLY = "30d"   # 30 días
    QUARTERLY = "90d" # 90 días

# === MODELOS DE PREDICCIONES ===

class PredictionRequest(BaseModel):
    """Request para predicciones de stock/demanda"""
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
    
    product_id: int = Field(
        ..., 
        ge=1, 
        description="ID del producto para predicción"
    )
    prediction_type: PredictionType = Field(
        default=PredictionType.STOCK,
        description="Tipo de predicción a realizar"
    )
    horizon_days: int = Field(
        default=30,
        ge=1,
        le=365,
        description="Días hacia el futuro para la predicción (1-365)"
    )
    include_confidence: bool = Field(
        default=True,
        description="Incluir intervalos de confianza en la respuesta"
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
    """Request para recomendaciones de productos"""
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "user_id": 456,
                "product_id": 123,
                "recommendation_type": "hybrid",
                "max_results": 10,
                "min_score": 0.3,
                "exclude_owned": True,
                "include_metadata": True
            }
        }
    )
    
    user_id: Optional[int] = Field(
        default=None,
        ge=1,
        description="ID del usuario (opcional para recomendaciones anónimas)"
    )
    product_id: Optional[int] = Field(
        default=None,
        ge=1,
        description="ID del producto base para recomendaciones similares"
    )
    recommendation_type: RecommendationType = Field(
        default=RecommendationType.HYBRID,
        description="Tipo de algoritmo de recomendación"
    )
    max_results: int = Field(
        default=10,
        ge=1,
        le=100,
        description="Número máximo de recomendaciones (1-100)"
    )
    min_score: float = Field(
        default=0.1,
        ge=0.0,
        le=1.0,
        description="Score mínimo para incluir recomendación (0.0-1.0)"
    )
    exclude_owned: bool = Field(
        default=True,
        description="Excluir productos ya comprados por el usuario"
    )
    include_metadata: bool = Field(
        default=True,
        description="Incluir metadatos del producto en la respuesta"
    )

    @validator('user_id', 'product_id')
    def at_least_one_id(cls, v, values):
        if not v and not values.get('user_id') and not values.get('product_id'):
            raise ValueError('Se requiere al menos user_id o product_id')
        return v

class ProductMetadata(BaseModel):
    """Metadatos de producto para recomendaciones"""
    name: str = Field(description="Nombre del producto")
    price: float = Field(description="Precio actual")
    category: str = Field(description="Categoría del producto")
    brand: Optional[str] = Field(default=None, description="Marca")
    stock_level: int = Field(description="Nivel de stock actual")
    avg_rating: Optional[float] = Field(default=None, description="Calificación promedio")

class RecommendationItem(BaseModel):
    """Item individual de recomendación"""
    product_id: int = Field(description="ID del producto recomendado")
    score: float = Field(
        ge=0.0,
        le=1.0,
        description="Score de relevancia (0.0-1.0)"
    )
    rank: int = Field(
        ge=1,
        description="Posición en el ranking de recomendaciones"
    )
    reasoning: Optional[str] = Field(
        default=None,
        description="Explicación de por qué se recomienda"
    )
    metadata: Optional[ProductMetadata] = Field(
        default=None,
        description="Metadatos del producto"
    )

class RecommendationResponse(BaseResponse):
    """Respuesta de recomendaciones completa"""
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "success": True,
                "timestamp": "2025-09-15T23:30:00Z",
                "user_id": 456,
                "product_id": 123,
                "recommendation_type": "hybrid",
                "recommendations": [
                    {
                        "product_id": 789,
                        "score": 0.92,
                        "rank": 1,
                        "reasoning": "Usuarios similares también compraron este producto",
                        "metadata": {
                            "name": "Producto Recomendado",
                            "price": 29.99,
                            "category": "Electronics",
                            "stock_level": 50,
                            "avg_rating": 4.5
                        }
                    }
                ],
                "algorithm_used": "collaborative_filtering_v2",
                "total_considered": 1500,
                "cache_hit": True
            }
        }
    )
    
    user_id: Optional[int] = Field(description="ID del usuario")
    product_id: Optional[int] = Field(description="ID del producto base")
    recommendation_type: RecommendationType = Field(description="Tipo de recomendación")
    recommendations: List[RecommendationItem] = Field(description="Lista de recomendaciones")
    algorithm_used: str = Field(description="Algoritmo utilizado")
    total_considered: int = Field(description="Total de productos considerados")
    cache_hit: bool = Field(
        default=False,
        description="Si la respuesta vino del cache"
    )

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

class ModelPerformanceResponse(BaseResponse):
    """Respuesta de métricas de modelos"""
    models: List[ModelMetrics] = Field(description="Lista de métricas por modelo")
    total_models: int = Field(description="Total de modelos evaluados")

# === MODELOS DE CACHE ===

class CacheStatus(BaseModel):
    """Estado del cache"""
    redis_connected: bool = Field(description="Si Redis está conectado")
    total_keys: int = Field(description="Total de claves en cache")
    memory_usage: str = Field(description="Uso de memoria")
    hit_rate: float = Field(description="Tasa de aciertos del cache")

class CacheInvalidationRequest(BaseModel):
    """Request para invalidar cache"""
    pattern: str = Field(
        description="Patrón de claves a invalidar (ej: 'pred:*', 'rec:user:123:*')"
    )
    
    @validator('pattern')
    def validate_pattern(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('El patrón no puede estar vacío')
        return v.strip()

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
    entity_type: str = Field(..., pattern="^(transaction|user|product|inventory)$")
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
    severity: str = Field(..., pattern="^(low|medium|high|critical)$")
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

class BatchSentimentRequest(BaseModel):
    """Request para an�lisis de sentimientos en lote"""
    texts: List[str] = Field(..., min_items=1, max_items=1000)
    model_type: str = Field("ensemble", pattern="^(bert|lstm|traditional|ensemble|vader)$")

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
    status: str = Field(..., pattern="^(healthy|degraded|unhealthy)$")
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
    model_config = ConfigDict(protected_namespaces=())
    
    model_type: str = Field(..., pattern="^(stock_predictor|recommender|price_optimizer|anomaly_detector|sentiment_analyzer)$")
    training_data_path: Optional[str] = None
    hyperparameters: Optional[Dict[str, Any]] = None
    validation_split: float = Field(0.2, ge=0.1, le=0.5)

class ModelTrainingResponse(BaseResponse):
    """Respuesta de entrenamiento de modelos"""
    model_config = ConfigDict(protected_namespaces=())
    
    model_type: str
    training_id: str
    status: str = Field(..., pattern="^(started|in_progress|completed|failed)$")
    training_metrics: Optional[Dict[str, float]] = None
    estimated_completion_time: Optional[datetime] = None

class ModelStatusRequest(BaseModel):
    """Request para estado de modelo"""
    model_config = ConfigDict(protected_namespaces=())
    
    model_type: str = Field(..., pattern="^(stock_predictor|recommender|price_optimizer|anomaly_detector|sentiment_analyzer)$")

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
    url: str = Field(..., pattern=r'^https?://.+')
    events: List[str] = Field(..., min_items=1)
    secret_key: Optional[str] = None
    retry_attempts: int = Field(3, ge=1, le=10)
    timeout_seconds: int = Field(30, ge=5, le=300)

class NotificationRequest(BaseModel):
    """Request para notificaci�n"""
    event_type: str
    entity_id: Union[int, str]
    data: Dict[str, Any]
    priority: str = Field("normal", pattern="^(low|normal|high|critical)$")

class NotificationResponse(BaseResponse):
    """Respuesta de notificaci�n"""
    notification_id: str
    status: str = Field(..., pattern="^(sent|failed|queued)$")
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
