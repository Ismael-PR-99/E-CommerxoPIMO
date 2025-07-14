
"""
Servicio principal de ML que orquesta todos los modelos y algoritmos
Maneja caching, validación, orchestration y patrones empresariales
"""
import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union
from dataclasses import asdict
import numpy as np
import pandas as pd

# FastAPI and async
from fastapi import HTTPException
import aioredis
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func

# Internal imports
from ..database import get_async_session
from ..models.stock_predictor import StockPredictor, PredictionResult
from ..models.recommender import HybridRecommender, RecommendationResult
from ..models.price_optimizer import DynamicPriceOptimizer, PriceOptimizationResult
from ..models.anomaly_detector import AdvancedAnomalyDetector, AnomalyResult
from ..models.sentiment_analyzer import AdvancedSentimentAnalyzer, SentimentResult
from ..schemas.ml_schemas import *
from ..config import settings

class MLOrchestrationService:
    """Servicio principal de orquestación de ML"""

    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.redis_client = None
        self.cache_ttl = 3600  # 1 hora

        # ML Models
        self.stock_predictor = None
        self.recommender = None
        self.price_optimizer = None
        self.anomaly_detector = None
        self.sentiment_analyzer = None

        # Performance metrics
        self.metrics = {
            'predictions_made': 0,
            'recommendations_generated': 0,
            'anomalies_detected': 0,
            'cache_hits': 0,
            'cache_misses': 0
        }

    async def initialize(self):
        """Inicializar servicio y conexiones"""

        # Initialize Redis
        try:
            self.redis_client = aioredis.from_url(
                f"redis://{settings.redis_host}:{settings.redis_port}",
                decode_responses=True
            )
            await self.redis_client.ping()
            self.logger.info("Conexión a Redis establecida")
        except Exception as e:
            self.logger.warning(f"Redis no disponible: {e}")
            self.redis_client = None

        # Initialize ML models
        await self._initialize_ml_models()

        self.logger.info("MLOrchestrationService inicializado exitosamente")

    async def _initialize_ml_models(self):
        """Inicializar modelos de ML"""

        try:
            # Stock Predictor
            self.stock_predictor = StockPredictor()

            # Recommender
            self.recommender = HybridRecommender()

            # Price Optimizer
            self.price_optimizer = DynamicPriceOptimizer()

            # Anomaly Detector
            self.anomaly_detector = AdvancedAnomalyDetector()

            # Sentiment Analyzer
            self.sentiment_analyzer = AdvancedSentimentAnalyzer()

            self.logger.info("Modelos ML inicializados")

        except Exception as e:
            self.logger.error(f"Error inicializando modelos ML: {e}")
            raise

    async def _get_cache_key(self, prefix: str, **kwargs) -> str:
        """Generar clave de cache"""

        key_parts = [prefix]
        for k, v in sorted(kwargs.items()):
            if isinstance(v, (dict, list)):
                v = json.dumps(v, sort_keys=True)
            key_parts.append(f"{k}:{v}")

        return ":".join(key_parts)

    async def _get_from_cache(self, cache_key: str) -> Optional[Dict]:
        """Obtener datos del cache"""

        if not self.redis_client:
            return None

        try:
            cached_data = await self.redis_client.get(cache_key)
            if cached_data:
                self.metrics['cache_hits'] += 1
                return json.loads(cached_data)
        except Exception as e:
            self.logger.error(f"Error obteniendo cache: {e}")

        self.metrics['cache_misses'] += 1
        return None

    async def _set_cache(self, cache_key: str, data: Dict, ttl: int = None):
        """Guardar datos en cache"""

        if not self.redis_client:
            return

        try:
            ttl = ttl or self.cache_ttl
            await self.redis_client.setex(
                cache_key, 
                ttl, 
                json.dumps(data, default=str)
            )
        except Exception as e:
            self.logger.error(f"Error guardando cache: {e}")

    # Stock Prediction Services
    async def predict_stock_demand(self, 
                                 product_id: int,
                                 days_ahead: int = 30,
                                 include_confidence_intervals: bool = True) -> PredictionResult:
        """Predecir demanda de stock para un producto"""

        cache_key = await self._get_cache_key(
            "stock_prediction",
            product_id=product_id,
            days_ahead=days_ahead
        )

        # Check cache
        cached_result = await self._get_from_cache(cache_key)
        if cached_result:
            return PredictionResult(**cached_result)

        try:
            # Obtener datos históricos
            historical_data = await self._get_historical_stock_data(product_id)

            if historical_data.empty:
                raise HTTPException(
                    status_code=404,
                    detail=f"No hay datos históricos para producto {product_id}"
                )

            # Hacer predicción
            result = self.stock_predictor.predict_demand(
                product_id=product_id,
                historical_data=historical_data,
                forecast_periods=days_ahead,
                confidence_intervals=include_confidence_intervals
            )

            # Cache result
            await self._set_cache(cache_key, asdict(result))

            self.metrics['predictions_made'] += 1
            return result

        except Exception as e:
            self.logger.error(f"Error en predicción de stock: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    async def predict_stock_batch(self, 
                                product_ids: List[int],
                                days_ahead: int = 30) -> List[PredictionResult]:
        """Predicción de stock en lote"""

        tasks = []
        for product_id in product_ids:
            task = self.predict_stock_demand(product_id, days_ahead)
            tasks.append(task)

        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Filter out exceptions
        valid_results = [r for r in results if isinstance(r, PredictionResult)]
        return valid_results

    # Recommendation Services
    async def get_user_recommendations(self,
                                     user_id: int,
                                     num_recommendations: int = 10,
                                     algorithm: str = 'hybrid') -> RecommendationResult:
        """Obtener recomendaciones para usuario"""

        cache_key = await self._get_cache_key(
            "user_recommendations",
            user_id=user_id,
            num_recommendations=num_recommendations,
            algorithm=algorithm
        )

        cached_result = await self._get_from_cache(cache_key)
        if cached_result:
            return RecommendationResult(**cached_result)

        try:
            # Obtener datos de usuario e interacciones
            user_data = await self._get_user_interaction_data(user_id)

            # Generar recomendaciones
            result = self.recommender.get_user_recommendations(
                user_id=user_id,
                top_k=num_recommendations,
                algorithm=algorithm
            )

            # Cache result
            await self._set_cache(cache_key, asdict(result), ttl=1800)  # 30 min

            self.metrics['recommendations_generated'] += 1
            return result

        except Exception as e:
            self.logger.error(f"Error en recomendaciones: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    async def get_similar_products(self,
                                 product_id: int,
                                 num_similar: int = 10) -> RecommendationResult:
        """Obtener productos similares"""

        cache_key = await self._get_cache_key(
            "similar_products",
            product_id=product_id,
            num_similar=num_similar
        )

        cached_result = await self._get_from_cache(cache_key)
        if cached_result:
            return RecommendationResult(**cached_result)

        try:
            result = self.recommender.get_similar_products(
                product_id=product_id,
                top_k=num_similar
            )

            await self._set_cache(cache_key, asdict(result))
            return result

        except Exception as e:
            self.logger.error(f"Error en productos similares: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    # Price Optimization Services
    async def optimize_product_price(self,
                                   product_id: int,
                                   current_price: float,
                                   strategy: str = 'dynamic') -> PriceOptimizationResult:
        """Optimizar precio de producto"""

        cache_key = await self._get_cache_key(
            "price_optimization",
            product_id=product_id,
            current_price=current_price,
            strategy=strategy
        )

        cached_result = await self._get_from_cache(cache_key)
        if cached_result:
            return PriceOptimizationResult(**cached_result)

        try:
            # Obtener características del producto
            product_features = await self._get_product_features(product_id)

            # Optimizar precio
            result = self.price_optimizer.optimize_price(
                product_id=product_id,
                current_price=current_price,
                product_features=product_features,
                strategy=strategy
            )

            await self._set_cache(cache_key, asdict(result), ttl=7200)  # 2 hours
            return result

        except Exception as e:
            self.logger.error(f"Error en optimización de precios: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    async def optimize_prices_batch(self,
                                  products_data: List[Dict]) -> List[PriceOptimizationResult]:
        """Optimización de precios en lote"""

        try:
            results = self.price_optimizer.batch_optimize_prices(products_data)
            return results

        except Exception as e:
            self.logger.error(f"Error en optimización batch: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    # Anomaly Detection Services
    async def detect_transaction_anomalies(self,
                                         transactions_data: List[Dict]) -> List[AnomalyResult]:
        """Detectar anomalías en transacciones"""

        try:
            # Convertir a DataFrame
            df = pd.DataFrame(transactions_data)

            # Detectar anomalías
            results = self.anomaly_detector.detect_anomalies(
                data=df,
                entity_type='transaction'
            )

            self.metrics['anomalies_detected'] += len(results)
            return results

        except Exception as e:
            self.logger.error(f"Error en detección de anomalías: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    async def detect_user_behavior_anomalies(self,
                                           user_id: int,
                                           time_window_days: int = 30) -> List[AnomalyResult]:
        """Detectar anomalías en comportamiento de usuario"""

        try:
            # Obtener datos de comportamiento
            user_behavior_data = await self._get_user_behavior_data(user_id, time_window_days)

            if user_behavior_data.empty:
                return []

            results = self.anomaly_detector.detect_anomalies(
                data=user_behavior_data,
                entity_type='user'
            )

            return results

        except Exception as e:
            self.logger.error(f"Error en anomalías de usuario: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    # Sentiment Analysis Services
    async def analyze_product_sentiment(self,
                                      product_id: int,
                                      reviews_text: List[str]) -> Dict[str, Any]:
        """Analizar sentimientos de reseñas de producto"""

        cache_key = await self._get_cache_key(
            "product_sentiment",
            product_id=product_id,
            reviews_hash=hash(tuple(reviews_text))
        )

        cached_result = await self._get_from_cache(cache_key)
        if cached_result:
            return cached_result

        try:
            # Analizar sentimientos
            sentiment_results = self.sentiment_analyzer.batch_analyze(reviews_text)

            # Generar resumen
            summary = self.sentiment_analyzer.get_sentiment_summary(sentiment_results)

            result = {
                'product_id': product_id,
                'total_reviews': len(reviews_text),
                'sentiment_summary': summary,
                'detailed_results': [asdict(r) for r in sentiment_results]
            }

            await self._set_cache(cache_key, result)
            return result

        except Exception as e:
            self.logger.error(f"Error en análisis de sentimientos: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    async def analyze_text_sentiment(self,
                                   text: str,
                                   model_type: str = "ensemble") -> SentimentResult:
        """Analizar sentimiento de texto individual"""

        try:
            result = self.sentiment_analyzer.analyze_sentiment(text, model_type)
            return result

        except Exception as e:
            self.logger.error(f"Error en análisis de texto: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    # Comprehensive Analysis Services
    async def get_product_insights(self,
                                 product_id: int,
                                 days_back: int = 90) -> Dict[str, Any]:
        """Obtener insights comprehensivos de producto"""

        cache_key = await self._get_cache_key(
            "product_insights",
            product_id=product_id,
            days_back=days_back
        )

        cached_result = await self._get_from_cache(cache_key)
        if cached_result:
            return cached_result

        try:
            # Ejecutar análisis en paralelo
            tasks = [
                self.predict_stock_demand(product_id, 30),
                self.get_similar_products(product_id, 5),
                self._get_product_price_optimization(product_id),
                self._get_product_reviews_sentiment(product_id, days_back)
            ]

            results = await asyncio.gather(*tasks, return_exceptions=True)

            insights = {
                'product_id': product_id,
                'analysis_date': datetime.utcnow().isoformat(),
                'stock_prediction': results[0] if not isinstance(results[0], Exception) else None,
                'similar_products': results[1] if not isinstance(results[1], Exception) else None,
                'price_optimization': results[2] if not isinstance(results[2], Exception) else None,
                'sentiment_analysis': results[3] if not isinstance(results[3], Exception) else None
            }

            await self._set_cache(cache_key, insights, ttl=7200)
            return insights

        except Exception as e:
            self.logger.error(f"Error en insights de producto: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    async def get_user_profile_analysis(self,
                                      user_id: int) -> Dict[str, Any]:
        """Análisis comprehensivo de perfil de usuario"""

        try:
            tasks = [
                self.get_user_recommendations(user_id, 10),
                self.detect_user_behavior_anomalies(user_id, 30),
                self._get_user_purchase_patterns(user_id),
                self._get_user_sentiment_profile(user_id)
            ]

            results = await asyncio.gather(*tasks, return_exceptions=True)

            profile_analysis = {
                'user_id': user_id,
                'analysis_date': datetime.utcnow().isoformat(),
                'recommendations': results[0] if not isinstance(results[0], Exception) else None,
                'behavior_anomalies': results[1] if not isinstance(results[1], Exception) else [],
                'purchase_patterns': results[2] if not isinstance(results[2], Exception) else None,
                'sentiment_profile': results[3] if not isinstance(results[3], Exception) else None
            }

            return profile_analysis

        except Exception as e:
            self.logger.error(f"Error en análisis de usuario: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    # Data Retrieval Methods
    async def _get_historical_stock_data(self, product_id: int) -> pd.DataFrame:
        """Obtener datos históricos de stock"""

        async with get_async_session() as session:
            # Placeholder query - adjust based on your schema
            query = select("*").where("product_id = :product_id")
            result = await session.execute(query, {"product_id": product_id})

            # Convert to DataFrame
            data = result.fetchall()
            if data:
                return pd.DataFrame(data)
            return pd.DataFrame()

    async def _get_user_interaction_data(self, user_id: int) -> pd.DataFrame:
        """Obtener datos de interacción de usuario"""

        # Placeholder - implement based on your schema
        return pd.DataFrame()

    async def _get_product_features(self, product_id: int) -> Dict[str, Any]:
        """Obtener características de producto"""

        # Placeholder - implement based on your schema
        return {
            'cost': 50.0,
            'category': 'electronics',
            'brand': 'generic'
        }

    async def _get_user_behavior_data(self, user_id: int, days_back: int) -> pd.DataFrame:
        """Obtener datos de comportamiento de usuario"""

        # Placeholder - implement based on your schema
        return pd.DataFrame()

    async def _get_product_price_optimization(self, product_id: int) -> Optional[Dict]:
        """Obtener optimización de precio para producto"""

        try:
            current_price = 100.0  # Placeholder - get from database
            result = await self.optimize_product_price(product_id, current_price)
            return asdict(result)
        except:
            return None

    async def _get_product_reviews_sentiment(self, product_id: int, days_back: int) -> Optional[Dict]:
        """Obtener análisis de sentimientos de reseñas"""

        try:
            # Placeholder - get reviews from database
            reviews = ["Great product!", "Poor quality", "Average experience"]
            result = await self.analyze_product_sentiment(product_id, reviews)
            return result
        except:
            return None

    async def _get_user_purchase_patterns(self, user_id: int) -> Optional[Dict]:
        """Obtener patrones de compra de usuario"""

        # Placeholder - implement based on your schema
        return {
            'avg_order_value': 75.5,
            'purchase_frequency': 'monthly',
            'preferred_categories': ['electronics', 'books']
        }

    async def _get_user_sentiment_profile(self, user_id: int) -> Optional[Dict]:
        """Obtener perfil de sentimientos de usuario"""

        # Placeholder - implement based on your schema
        return {
            'overall_satisfaction': 'positive',
            'review_sentiment_avg': 0.7,
            'complaint_frequency': 'low'
        }

    # Health and Metrics
    async def get_service_health(self) -> Dict[str, Any]:
        """Obtener estado de salud del servicio"""

        health_status = {
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'models_loaded': {
                'stock_predictor': self.stock_predictor is not None,
                'recommender': self.recommender is not None,
                'price_optimizer': self.price_optimizer is not None,
                'anomaly_detector': self.anomaly_detector is not None,
                'sentiment_analyzer': self.sentiment_analyzer is not None
            },
            'redis_connected': self.redis_client is not None,
            'performance_metrics': self.metrics.copy()
        }

        return health_status

    async def get_performance_metrics(self) -> Dict[str, Any]:
        """Obtener métricas de performance"""

        return {
            'timestamp': datetime.utcnow().isoformat(),
            'metrics': self.metrics.copy(),
            'cache_hit_ratio': (
                self.metrics['cache_hits'] / 
                (self.metrics['cache_hits'] + self.metrics['cache_misses'])
                if (self.metrics['cache_hits'] + self.metrics['cache_misses']) > 0 
                else 0
            )
        }

# Singleton instance
ml_service = MLOrchestrationService()
