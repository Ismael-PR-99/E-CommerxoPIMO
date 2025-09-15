"""
Sistema de cache Redis unificado para ML Service
Configuración centralizada con TTL configurable y claves deterministas
"""
import asyncio
import json
import pickle
import hashlib
from typing import Dict, Any, Optional, Union, List
from datetime import datetime, timedelta
import redis.asyncio as redis
import os
import logging

logger = logging.getLogger(__name__)

class MLCacheManager:
    """Gestor de cache Redis para ML con TTL configurables y claves deterministas"""
    
    def __init__(self):
        self.redis_client: Optional[redis.Redis] = None
        self.is_connected = False
        
        # TTL configurables por tipo de dato
        self.ttl_config = {
            'predictions': int(os.getenv('CACHE_TTL_PREDICTIONS', '300')),  # 5 min
            'recommendations': int(os.getenv('CACHE_TTL_RECOMMENDATIONS', '600')),  # 10 min
            'analytics': int(os.getenv('CACHE_TTL_ANALYTICS', '1800')),  # 30 min
            'models': int(os.getenv('CACHE_TTL_MODELS', '3600')),  # 1 hora
            'default': int(os.getenv('CACHE_TTL_DEFAULT', '300'))  # 5 min
        }
        
        # Prefijos para claves deterministas
        self.key_prefixes = {
            'prediction': 'pred',
            'recommendation': 'rec', 
            'analytics': 'analytics',
            'model': 'model',
            'user': 'user',
            'product': 'product'
        }

    async def initialize(self, redis_url: str = None):
        """Inicializar conexión Redis"""
        if redis_url is None:
            redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
        
        try:
            self.redis_client = redis.from_url(
                redis_url,
                encoding="utf-8",
                decode_responses=False,  # Usaremos pickle para objetos complejos
                socket_connect_timeout=5,
                socket_timeout=5,
                retry_on_timeout=True,
                max_connections=20
            )
            
            # Test de conexión
            await self.redis_client.ping()
            self.is_connected = True
            logger.info("✅ Redis cache initialized successfully")
            
        except Exception as e:
            logger.warning(f"⚠️ Redis not available, cache disabled: {e}")
            self.is_connected = False

    def _generate_cache_key(self, data_type: str, **kwargs) -> str:
        """
        Generar clave determinista para cache
        
        Examples:
            pred:123:stock:30d
            rec:user:456:hybrid:10
            analytics:product:789:sales:2025-09-15
        """
        prefix = self.key_prefixes.get(data_type, data_type)
        
        # Ordenar kwargs para consistencia
        sorted_params = sorted(kwargs.items())
        param_str = ':'.join(f"{k}:{v}" for k, v in sorted_params if v is not None)
        
        if param_str:
            return f"{prefix}:{param_str}"
        else:
            return prefix

    def _get_ttl(self, data_type: str) -> int:
        """Obtener TTL según el tipo de dato"""
        return self.ttl_config.get(data_type, self.ttl_config['default'])

    async def get(self, data_type: str, **kwargs) -> Optional[Any]:
        """
        Obtener valor del cache
        
        Args:
            data_type: Tipo de dato ('predictions', 'recommendations', etc.)
            **kwargs: Parámetros para generar la clave
            
        Returns:
            Datos deserializados o None si no existe
        """
        if not self.is_connected:
            return None
            
        try:
            cache_key = self._generate_cache_key(data_type, **kwargs)
            cached_data = await self.redis_client.get(cache_key)
            
            if cached_data:
                # Intentar deserializar con pickle primero, luego JSON
                try:
                    return pickle.loads(cached_data)
                except (pickle.PickleError, TypeError):
                    try:
                        return json.loads(cached_data.decode('utf-8'))
                    except (json.JSONDecodeError, UnicodeDecodeError):
                        logger.warning(f"Failed to deserialize cached data for key: {cache_key}")
                        return None
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting cache for {data_type}: {e}")
            return None

    async def set(self, data_type: str, data: Any, ttl_override: int = None, **kwargs) -> bool:
        """
        Guardar valor en cache
        
        Args:
            data_type: Tipo de dato
            data: Datos a cachear
            ttl_override: TTL específico (opcional)
            **kwargs: Parámetros para generar la clave
            
        Returns:
            True si se guardó exitosamente
        """
        if not self.is_connected:
            return False
            
        try:
            cache_key = self._generate_cache_key(data_type, **kwargs)
            ttl = ttl_override or self._get_ttl(data_type)
            
            # Serializar con pickle para objetos complejos
            try:
                serialized_data = pickle.dumps(data)
            except (pickle.PickleError, TypeError):
                # Fallback a JSON para tipos básicos
                serialized_data = json.dumps(data, default=str).encode('utf-8')
            
            await self.redis_client.setex(cache_key, ttl, serialized_data)
            logger.debug(f"Cached data for {cache_key} with TTL {ttl}s")
            return True
            
        except Exception as e:
            logger.error(f"Error setting cache for {data_type}: {e}")
            return False

    async def delete(self, data_type: str, **kwargs) -> bool:
        """Eliminar entrada específica del cache"""
        if not self.is_connected:
            return False
            
        try:
            cache_key = self._generate_cache_key(data_type, **kwargs)
            deleted = await self.redis_client.delete(cache_key)
            return deleted > 0
            
        except Exception as e:
            logger.error(f"Error deleting cache for {data_type}: {e}")
            return False

    async def invalidate_pattern(self, pattern: str) -> int:
        """
        Invalidar múltiples claves por patrón
        
        Args:
            pattern: Patrón de Redis (ej: 'pred:123:*', 'rec:user:456:*')
            
        Returns:
            Número de claves eliminadas
        """
        if not self.is_connected:
            return 0
            
        try:
            keys = await self.redis_client.keys(pattern)
            if keys:
                deleted = await self.redis_client.delete(*keys)
                logger.info(f"Invalidated {deleted} cache entries matching pattern: {pattern}")
                return deleted
            return 0
            
        except Exception as e:
            logger.error(f"Error invalidating cache pattern {pattern}: {e}")
            return 0

    async def invalidate_product(self, product_id: int) -> int:
        """Invalidar todo el cache relacionado con un producto"""
        patterns = [
            f"pred:product_id:{product_id}:*",
            f"rec:product_id:{product_id}:*",
            f"analytics:product:{product_id}:*"
        ]
        
        total_deleted = 0
        for pattern in patterns:
            total_deleted += await self.invalidate_pattern(pattern)
        
        return total_deleted

    async def invalidate_user(self, user_id: int) -> int:
        """Invalidar todo el cache relacionado con un usuario"""
        patterns = [
            f"rec:user_id:{user_id}:*",
            f"analytics:user:{user_id}:*"
        ]
        
        total_deleted = 0
        for pattern in patterns:
            total_deleted += await self.invalidate_pattern(pattern)
        
        return total_deleted

    async def get_cache_stats(self) -> Dict[str, Any]:
        """Obtener estadísticas del cache"""
        if not self.is_connected:
            return {
                "connected": False,
                "total_keys": 0,
                "memory_usage": "0B",
                "hit_rate": 0.0
            }
            
        try:
            info = await self.redis_client.info()
            keyspace_info = await self.redis_client.info('keyspace')
            
            # Extraer número de claves de la base de datos 0
            total_keys = 0
            if 'db0' in keyspace_info:
                db_info = keyspace_info['db0']
                if 'keys' in db_info:
                    total_keys = db_info['keys']
            
            return {
                "connected": True,
                "total_keys": total_keys,
                "memory_usage": info.get('used_memory_human', '0B'),
                "hit_rate": round(
                    info.get('keyspace_hits', 0) / 
                    max(info.get('keyspace_hits', 0) + info.get('keyspace_misses', 0), 1) * 100, 
                    2
                )
            }
            
        except Exception as e:
            logger.error(f"Error getting cache stats: {e}")
            return {
                "connected": False,
                "error": str(e)
            }

    async def health_check(self) -> bool:
        """Verificar salud de la conexión Redis"""
        if not self.is_connected:
            return False
            
        try:
            await self.redis_client.ping()
            return True
        except Exception:
            self.is_connected = False
            return False

    async def close(self):
        """Cerrar conexión Redis"""
        if self.redis_client:
            await self.redis_client.close()
            self.is_connected = False

# Instancia global del cache manager
cache_manager = MLCacheManager()

# Funciones de conveniencia para usar en endpoints
async def get_cached_prediction(product_id: int, prediction_type: str, horizon_days: int) -> Optional[Any]:
    """Helper para obtener predicción cacheada"""
    return await cache_manager.get(
        'predictions',
        product_id=product_id,
        prediction_type=prediction_type,
        horizon_days=horizon_days
    )

async def cache_prediction(product_id: int, prediction_type: str, horizon_days: int, data: Any) -> bool:
    """Helper para cachear predicción"""
    return await cache_manager.set(
        'predictions',
        data,
        product_id=product_id,
        prediction_type=prediction_type,
        horizon_days=horizon_days
    )

async def get_cached_recommendations(user_id: int = None, product_id: int = None, 
                                   recommendation_type: str = "hybrid", max_results: int = 10) -> Optional[Any]:
    """Helper para obtener recomendaciones cacheadas"""
    return await cache_manager.get(
        'recommendations',
        user_id=user_id,
        product_id=product_id,
        recommendation_type=recommendation_type,
        max_results=max_results
    )

async def cache_recommendations(user_id: int = None, product_id: int = None,
                              recommendation_type: str = "hybrid", max_results: int = 10, data: Any = None) -> bool:
    """Helper para cachear recomendaciones"""
    return await cache_manager.set(
        'recommendations',
        data,
        user_id=user_id,
        product_id=product_id,
        recommendation_type=recommendation_type,
        max_results=max_results
    )