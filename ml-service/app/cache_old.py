import asyncio
from typing import Dict, Any, Optional
import pickle
import json
from datetime import datetime, timedelta

class CacheManager:
    def __init__(self):
        self.redis_client: Optional[Any] = None
        self.local_cache: Dict[str, Any] = {}
        self.cache_ttl = 3600  # 1 hora por defecto

    async def initialize_redis(self, redis_url: str = "redis://localhost:6379"):
        """Inicializar conexión Redis (opcional)"""
        try:
            # Importar aioredis solo si está disponible
            import aioredis
            self.redis_client = await aioredis.from_url(redis_url)
            print("✅ Redis cache initialized")
        except ImportError:
            print("⚠️ aioredis not installed, using local cache")
        except Exception as e:
            print(f"⚠️ Redis not available, using local cache: {e}")

    async def get(self, key: str) -> Optional[Any]:
        """Obtener valor del cache"""
        try:
            if self.redis_client:
                cached = await self.redis_client.get(key)
                if cached:
                    return pickle.loads(cached)
            else:
                # Usar cache local
                if key in self.local_cache:
                    data, expiry = self.local_cache[key]
                    if datetime.now() < expiry:
                        return data
                    else:
                        del self.local_cache[key]
        except Exception as e:
            print(f"Cache get error: {e}")
        return None

    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """Guardar valor en cache"""
        try:
            cache_ttl = ttl or self.cache_ttl
            if self.redis_client:
                serialized = pickle.dumps(value)
                await self.redis_client.setex(key, cache_ttl, serialized)
                return True
            else:
                # Usar cache local
                expiry = datetime.now() + timedelta(seconds=cache_ttl)
                self.local_cache[key] = (value, expiry)
                return True
        except Exception as e:
            print(f"Cache set error: {e}")
            return False

    async def delete(self, key: str) -> bool:
        """Eliminar valor del cache"""
        try:
            if self.redis_client:
                await self.redis_client.delete(key)
            else:
                if key in self.local_cache:
                    del self.local_cache[key]
            return True
        except Exception as e:
            print(f"Cache delete error: {e}")
            return False

    async def clear_pattern(self, pattern: str) -> bool:
        """Limpiar keys que coincidan con un patrón"""
        try:
            if self.redis_client:
                keys = await self.redis_client.keys(pattern)
                if keys:
                    await self.redis_client.delete(*keys)
            else:
                # Para cache local, limpiar keys que coincidan
                keys_to_delete = [k for k in self.local_cache.keys() if pattern in k]
                for key in keys_to_delete:
                    del self.local_cache[key]
            return True
        except Exception as e:
            print(f"Cache clear pattern error: {e}")
            return False

# Instancia global del cache manager
cache_manager = CacheManager()
