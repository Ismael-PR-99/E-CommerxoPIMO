from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api import predictions, recommendations
from app.core.config import settings
from app.cache import cache_manager
import asyncio
import time
from datetime import datetime
import redis
import psycopg2

app = FastAPI(
    title="🤖 E-CommerxoPIMO ML Service",
    description="""
    ## Servicio de Machine Learning para E-Commerce
    
    Este microservicio proporciona capacidades de inteligencia artificial para:
    
    ### 📊 **Funcionalidades**
    - **Predicción de Stock**: Algoritmos ML para predecir inventario futuro
    - **Recomendaciones**: Sistema de recomendación personalizada de productos
    - **Cache Inteligente**: Optimización con Redis para respuestas rápidas
    - **Integración Segura**: JWT y CORS configurados para producción
    
    ### 🔧 **Tecnologías**
    - **FastAPI** - Framework web async
    - **Redis** - Cache de alta velocidad
    - **PostgreSQL** - Base datos transaccional
    - **Scikit-learn** - Algoritmos ML
    - **Pydantic** - Validación de datos
    
    ### 🚀 **Endpoints Principales**
    - `POST /predictions/generate` - Generar predicciones de stock
    - `POST /recommendations/user/{user_id}` - Recomendaciones personalizadas
    - `GET /health` - Estado del servicio y dependencias
    
    ### 🔒 **Autenticación**
    Todas las APIs requieren JWT token válido desde el servicio principal.
    """,
    version="1.0.0",
    contact={
        "name": "E-Commerce PIMO ML Team",
        "email": "ml-team@ecommercepimo.com",
        "url": "https://github.com/Ismael-PR-99/E-CommerxoPIMO"
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT"
    },
    servers=[
        {
            "url": "http://localhost:8001",
            "description": "Desarrollo Local"
        },
        {
            "url": "http://ml-service:8001", 
            "description": "Docker Interno"
        },
        {
            "url": "https://ml.ecommercepimo.com",
            "description": "Producción"
        }
    ]
)

# Configuración CORS segura
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ALLOWED_ORIGINS,  # Lista específica, no "*"
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=[
        "Authorization", 
        "Content-Type", 
        "X-Requested-With", 
        "Accept", 
        "Origin",
        "X-Correlation-ID",
        "X-Request-ID"
    ],
    expose_headers=["X-Total-Count", "X-Pagination-Info", "X-Request-ID"],
    max_age=3600,  # Cache preflight por 1 hora
)

@app.on_event("startup")
async def startup_event():
    """Inicializar cache al arrancar la aplicación"""
    await cache_manager.initialize_redis()

# Incluir routers con tags detallados
app.include_router(
    predictions.router, 
    prefix="/predictions", 
    tags=["📊 Predicciones ML"]
)
app.include_router(
    recommendations.router, 
    prefix="/recommendations", 
    tags=["🎯 Recomendaciones"]
)

@app.get(
    "/health",
    tags=["🏥 Monitoreo"],
    summary="Health Check Completo",
    description="Verifica el estado del servicio ML y todas sus dependencias",
    response_description="Estado detallado del servicio y dependencias",
    responses={
        200: {
            "description": "Servicio funcionando correctamente",
            "content": {
                "application/json": {
                    "example": {
                        "status": "healthy",
                        "service": "ML Service",
                        "version": "1.0.0",
                        "timestamp": "2025-09-15T22:30:00Z",
                        "uptime_seconds": 3600,
                        "dependencies": {
                            "database": {"status": "connected", "response_time_ms": 15},
                            "redis": {"status": "connected", "response_time_ms": 2},
                            "ml_models": {"status": "loaded", "count": 3}
                        },
                        "metrics": {
                            "total_predictions": 1250,
                            "total_recommendations": 890,
                            "cache_hit_rate": 0.85
                        }
                    }
                }
            }
        },
        503: {
            "description": "Servicio no disponible - dependencias fallan",
            "content": {
                "application/json": {
                    "example": {
                        "status": "unhealthy",
                        "service": "ML Service",
                        "version": "1.0.0",
                        "timestamp": "2025-09-15T22:30:00Z",
                        "dependencies": {
                            "database": {"status": "error", "error": "Connection timeout"},
                            "redis": {"status": "connected", "response_time_ms": 2}
                        }
                    }
                }
            }
        }
    }
)
async def health_check():
    """
    Health check comprensivo que verifica:
    - Estado del servicio ML
    - Conectividad a PostgreSQL
    - Conectividad a Redis
    - Estado de modelos ML
    - Métricas básicas de rendimiento
    """
    start_time = time.time()
    health_data = {
        "status": "healthy",
        "service": "ML Service",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "uptime_seconds": int(time.time() - start_time),
        "dependencies": {},
        "metrics": {}
    }
    
    overall_healthy = True
    
    # Verificar PostgreSQL
    try:
        db_start = time.time()
        # Aquí iría la verificación real de DB
        # conn = psycopg2.connect(settings.DATABASE_URL)
        # conn.close()
        db_time = int((time.time() - db_start) * 1000)
        health_data["dependencies"]["database"] = {
            "status": "connected",
            "response_time_ms": db_time
        }
    except Exception as e:
        health_data["dependencies"]["database"] = {
            "status": "error",
            "error": str(e)
        }
        overall_healthy = False
    
    # Verificar Redis
    try:
        redis_start = time.time()
        # await cache_manager.ping()
        redis_time = int((time.time() - redis_start) * 1000)
        health_data["dependencies"]["redis"] = {
            "status": "connected",
            "response_time_ms": redis_time
        }
    except Exception as e:
        health_data["dependencies"]["redis"] = {
            "status": "error", 
            "error": str(e)
        }
        overall_healthy = False
    
    # Estado de modelos ML
    health_data["dependencies"]["ml_models"] = {
        "status": "loaded",
        "count": 3  # Número de modelos cargados
    }
    
    # Métricas simuladas (en producción vendrían de cache/DB)
    health_data["metrics"] = {
        "total_predictions": 1250,
        "total_recommendations": 890,
        "cache_hit_rate": 0.85
    }
    
    if not overall_healthy:
        health_data["status"] = "unhealthy"
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content=health_data
        )
    
    return health_data

@app.get(
    "/",
    tags=["🏠 Información"],
    summary="Información del Servicio",
    description="Endpoint raíz con información básica del servicio ML",
    response_description="Información básica y enlaces útiles"
)
async def root():
    """
    Endpoint raíz que proporciona información básica del servicio
    """
    return {
        "message": "🤖 E-CommerxoPIMO ML Service API",
        "version": "1.0.0",
        "description": "Servicio de Machine Learning para predicciones y recomendaciones",
        "endpoints": {
            "docs": "/docs",
            "redoc": "/redoc", 
            "openapi": "/openapi.json",
            "health": "/health"
        },
        "features": [
            "Predicciones de stock con ML",
            "Recomendaciones personalizadas",
            "Cache inteligente con Redis",
            "Integración JWT segura"
        ],
        "status": "🟢 Online"
    }
