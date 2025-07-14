from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.models.recommendation_engine import RecommendationEngine
from app.schemas.recommendation import RecommendationRequest, RecommendationResponse
from app.core.security import get_current_user
from app.db.session import get_db
from sqlalchemy.orm import Session

router = APIRouter()
recommendation_engine = RecommendationEngine()

@router.post("/user/{user_id}", response_model=List[RecommendationResponse])
async def get_user_recommendations(
    user_id: str,
    request: RecommendationRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtiene recomendaciones personalizadas para un usuario
    """
    try:
        # Obtener datos de órdenes para entrenar el modelo
        orders_data = await get_user_orders_data(db)
        products_data = await get_products_data(db)
        
        # Preparar matrices si no están listas
        if recommendation_engine.user_item_matrix is None:
            recommendation_engine.prepare_user_item_matrix(orders_data)
        
        if recommendation_engine.item_features is None:
            recommendation_engine.prepare_content_features(products_data)
        
        # Generar recomendaciones híbridas
        recommendations = recommendation_engine.get_hybrid_recommendations(
            user_id=user_id,
            current_product_id=request.current_product_id,
            num_recommendations=request.num_recommendations
        )
        
        # Enriquecer con información del producto
        enriched_recommendations = []
        for rec in recommendations:
            product_info = await get_product_info(rec['product_id'], db)
            if product_info:
                enriched_recommendations.append(RecommendationResponse(
                    product_id=rec['product_id'],
                    score=rec['score'],
                    reason=rec['reason'],
                    product_name=product_info['name'],
                    product_price=product_info['price'],
                    confidence_level=min(rec['score'], 1.0)
                ))
        
        return enriched_recommendations
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al generar recomendaciones: {str(e)}"
        )

@router.post("/similar/{product_id}", response_model=List[RecommendationResponse])
async def get_similar_products(
    product_id: str,
    request: RecommendationRequest,
    db: Session = Depends(get_db)
):
    """
    Obtiene productos similares basados en contenido
    """
    try:
        products_data = await get_products_data(db)
        
        if recommendation_engine.item_features is None:
            recommendation_engine.prepare_content_features(products_data)
        
        recommendations = recommendation_engine.get_content_based_recommendations(
            product_id=product_id,
            num_recommendations=request.num_recommendations
        )
        
        enriched_recommendations = []
        for rec in recommendations:
            product_info = await get_product_info(rec['product_id'], db)
            if product_info:
                enriched_recommendations.append(RecommendationResponse(
                    product_id=rec['product_id'],
                    score=rec['score'],
                    reason=rec['reason'],
                    product_name=product_info['name'],
                    product_price=product_info['price'],
                    confidence_level=min(rec['score'], 1.0)
                ))
        
        return enriched_recommendations
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener productos similares: {str(e)}"
        )

@router.get("/popular", response_model=List[RecommendationResponse])
async def get_popular_products(
    num_recommendations: int = 10,
    db: Session = Depends(get_db)
):
    """
    Obtiene productos populares
    """
    try:
        orders_data = await get_user_orders_data(db)
        
        if recommendation_engine.user_item_matrix is None:
            recommendation_engine.prepare_user_item_matrix(orders_data)
        
        recommendations = recommendation_engine._get_popular_items(num_recommendations)
        
        enriched_recommendations = []
        for rec in recommendations:
            product_info = await get_product_info(rec['product_id'], db)
            if product_info:
                enriched_recommendations.append(RecommendationResponse(
                    product_id=rec['product_id'],
                    score=rec['score'],
                    reason=rec['reason'],
                    product_name=product_info['name'],
                    product_price=product_info['price'],
                    confidence_level=min(rec['score'] / 100, 1.0)  # Normalizar
                ))
        
        return enriched_recommendations
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener productos populares: {str(e)}"
        )

@router.post("/retrain")
async def retrain_models(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Reentrena los modelos de recomendación
    """
    try:
        orders_data = await get_user_orders_data(db)
        products_data = await get_products_data(db)
        
        recommendation_engine.prepare_user_item_matrix(orders_data)
        recommendation_engine.prepare_content_features(products_data)
        
        return {"message": "Modelos reentrenados exitosamente"}
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al reentrenar modelos: {str(e)}"
        )

async def get_user_orders_data(db: Session) -> List[dict]:
    """Obtiene datos de órdenes para el entrenamiento"""
    # Implementar consulta a la base de datos
    pass

async def get_products_data(db: Session) -> List[dict]:
    """Obtiene datos de productos para el entrenamiento"""
    # Implementar consulta a la base de datos
    pass

async def get_product_info(product_id: str, db: Session) -> dict:
    """Obtiene información básica de un producto"""
    # Implementar consulta a la base de datos
    pass
