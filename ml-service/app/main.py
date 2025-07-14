from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import predictions, recommendations
from app.core.config import settings
from app.cache import cache_manager
import asyncio

app = FastAPI(
    title="E-CommerxoPIMO ML Service",
    description="Servicio de Machine Learning para predicción de inventario y recomendaciones",
    version="1.0.0"
)

# Configuración CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, settings.BACKEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Inicializar cache al arrancar la aplicación"""
    await cache_manager.initialize_redis()

# Incluir routers
app.include_router(predictions.router, prefix="/predictions", tags=["predictions"])
app.include_router(recommendations.router, prefix="/recommendations", tags=["recommendations"])

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ML Service", "cache": "enabled"}

@app.get("/")
async def root():
    return {"message": "E-CommerxoPIMO ML Service API", "docs": "/docs"}
