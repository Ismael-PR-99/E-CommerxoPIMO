"""
API endpoints para recomendaciones ML
Sistema avanzado de recomendaciones con múltiples algoritmos y cache inteligente
"""
from fastapi import APIRouter, Depends, HTTPException, Query, Path, Body
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any, Tuple
import logging
import traceback
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer

from app.db.session import get_db
from app.schemas.ml_schemas import (
    RecommendationRequest,
    RecommendationResponse,
    RecommendationItem,
    ProductMetadata,
    RecommendationType,
    ErrorResponse
)
from app.cache import cache_manager, get_cached_recommendations, cache_recommendations
from app.models.recommendation_engine import RecommendationEngine

# Configurar logging
logger = logging.getLogger(__name__)
router = APIRouter(
    prefix="/recommendations", 
    tags=["🎯 Recomendaciones ML"],
    responses={
        500: {
            "description": "Error interno del servidor",
            "model": ErrorResponse,
            "content": {
                "application/json": {
                    "example": {
                        "success": False,
                        "timestamp": "2024-01-15T10:30:00Z",
                        "message": "Error interno en el motor de recomendaciones",
                        "error_code": "RECOMMENDATION_ENGINE_ERROR",
                        "error_details": {
                            "algorithm": "collaborative_filtering",
                            "stage": "similarity_calculation"
                        }
                    }
                }
            }
        }
    }
)

# Inicializar motor de recomendaciones
recommendation_engine = RecommendationEngine()

async def get_user_purchase_history(user_id: int, db: Session) -> pd.DataFrame:
    """
    Obtener historial de compras del usuario
    """
    try:
        query = text("""
            SELECT 
                oi.product_id,
                oi.quantity,
                oi.price,
                o.created_at,
                p.name as product_name,
                p.category_id,
                p.price as current_price
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            JOIN products p ON oi.product_id = p.id
            WHERE o.user_id = :user_id 
            AND o.status IN ('COMPLETED', 'DELIVERED')
            AND p.active = true
            ORDER BY o.created_at DESC
        """)
        
        result = db.execute(query, {"user_id": user_id}).fetchall()
        
        if result:
            return pd.DataFrame([{
                'product_id': row.product_id,
                'quantity': row.quantity,
                'price': float(row.price),
                'order_date': row.created_at,
                'product_name': row.product_name,
                'category_id': row.category_id,
                'current_price': float(row.current_price)
            } for row in result])
        else:
            return pd.DataFrame()
            
    except Exception as e:
        logger.error(f"Error fetching user purchase history for {user_id}: {e}")
        return pd.DataFrame()

async def get_similar_products(product_id: int, db: Session, limit: int = 50) -> pd.DataFrame:
    """
    Obtener productos similares basados en categoría y características
    """
    try:
        query = text("""
            SELECT 
                p1.id as product_id,
                p1.name,
                p1.price,
                p1.category_id,
                p1.stock_quantity,
                p1.description,
                AVG(pr.rating) as avg_rating,
                COUNT(pr.id) as review_count
            FROM products p1
            LEFT JOIN product_reviews pr ON p1.id = pr.product_id
            WHERE p1.category_id = (
                SELECT category_id FROM products WHERE id = :product_id
            )
            AND p1.id != :product_id
            AND p1.active = true
            AND p1.stock_quantity > 0
            GROUP BY p1.id, p1.name, p1.price, p1.category_id, p1.stock_quantity, p1.description
            ORDER BY avg_rating DESC NULLS LAST, review_count DESC
            LIMIT :limit
        """)
        
        result = db.execute(query, {"product_id": product_id, "limit": limit}).fetchall()
        
        if result:
            return pd.DataFrame([{
                'product_id': row.product_id,
                'name': row.name,
                'price': float(row.price),
                'category_id': row.category_id,
                'stock_quantity': row.stock_quantity,
                'description': row.description or '',
                'avg_rating': float(row.avg_rating) if row.avg_rating else 0.0,
                'review_count': row.review_count
            } for row in result])
        else:
            return pd.DataFrame()
            
    except Exception as e:
        logger.error(f"Error fetching similar products for {product_id}: {e}")
        return pd.DataFrame()

async def get_user_item_matrix(db: Session) -> pd.DataFrame:
    """
    Crear matriz usuario-item para filtrado colaborativo
    """
    try:
        query = text("""
            SELECT 
                o.user_id,
                oi.product_id,
                SUM(oi.quantity) as total_quantity,
                COUNT(*) as purchase_count,
                AVG(oi.price) as avg_price
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            WHERE o.status IN ('COMPLETED', 'DELIVERED')
            AND o.created_at >= :start_date
            GROUP BY o.user_id, oi.product_id
            HAVING COUNT(*) >= 1
        """)
        
        # Últimos 6 meses para la matriz
        start_date = datetime.utcnow() - timedelta(days=180)
        result = db.execute(query, {"start_date": start_date}).fetchall()
        
        if result:
            df = pd.DataFrame([{
                'user_id': row.user_id,
                'product_id': row.product_id,
                'rating': min(5.0, row.total_quantity)  # Convertir cantidad a rating
            } for row in result])
            
            # Crear matriz pivotada
            user_item_matrix = df.pivot_table(
                index='user_id',
                columns='product_id',
                values='rating',
                fill_value=0
            )
            
            return user_item_matrix
        else:
            return pd.DataFrame()
            
    except Exception as e:
        logger.error(f"Error creating user-item matrix: {e}")
        return pd.DataFrame()

async def get_trending_products(db: Session, days: int = 7, limit: int = 20) -> List[Dict]:
    """
    Obtener productos trending basados en ventas recientes
    """
    try:
        query = text("""
            SELECT 
                oi.product_id,
                p.name,
                p.price,
                p.category_id,
                p.stock_quantity,
                SUM(oi.quantity) as total_sold,
                COUNT(DISTINCT o.user_id) as unique_buyers,
                AVG(pr.rating) as avg_rating
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            JOIN products p ON oi.product_id = p.id
            LEFT JOIN product_reviews pr ON p.id = pr.product_id
            WHERE o.created_at >= :start_date
            AND o.status IN ('COMPLETED', 'DELIVERED')
            AND p.active = true
            AND p.stock_quantity > 0
            GROUP BY oi.product_id, p.name, p.price, p.category_id, p.stock_quantity
            ORDER BY total_sold DESC, unique_buyers DESC
            LIMIT :limit
        """)
        
        start_date = datetime.utcnow() - timedelta(days=days)
        result = db.execute(query, {"start_date": start_date, "limit": limit}).fetchall()
        
        if result:
            return [{
                'product_id': row.product_id,
                'name': row.name,
                'price': float(row.price),
                'category_id': row.category_id,
                'stock_quantity': row.stock_quantity,
                'total_sold': row.total_sold,
                'unique_buyers': row.unique_buyers,
                'avg_rating': float(row.avg_rating) if row.avg_rating else 0.0,
                'score': row.total_sold * 0.7 + row.unique_buyers * 0.3
            } for row in result]
        else:
            return []
            
    except Exception as e:
        logger.error(f"Error fetching trending products: {e}")
        return []

async def collaborative_filtering_recommendations(
    user_id: int, 
    user_item_matrix: pd.DataFrame, 
    max_results: int = 10
) -> List[Tuple[int, float]]:
    """
    Generar recomendaciones usando filtrado colaborativo
    """
    try:
        if user_item_matrix.empty or user_id not in user_item_matrix.index:
            return []
        
        # Calcular similitud entre usuarios
        user_similarity = cosine_similarity(user_item_matrix)
        user_similarity_df = pd.DataFrame(
            user_similarity,
            index=user_item_matrix.index,
            columns=user_item_matrix.index
        )
        
        # Obtener usuarios similares
        similar_users = user_similarity_df[user_id].sort_values(ascending=False)[1:11]  # Top 10 similares
        
        # Obtener productos que no ha comprado el usuario
        user_products = set(user_item_matrix.columns[user_item_matrix.loc[user_id] > 0])
        
        # Calcular scores para productos no comprados
        product_scores = {}
        
        for similar_user_id, similarity_score in similar_users.items():
            if similarity_score > 0.1:  # Umbral mínimo de similitud
                similar_user_products = user_item_matrix.loc[similar_user_id]
                
                for product_id, rating in similar_user_products.items():
                    if rating > 0 and product_id not in user_products:
                        if product_id not in product_scores:
                            product_scores[product_id] = 0
                        product_scores[product_id] += similarity_score * rating
        
        # Ordenar y retornar top recomendaciones
        sorted_products = sorted(product_scores.items(), key=lambda x: x[1], reverse=True)
        return sorted_products[:max_results]
        
    except Exception as e:
        logger.error(f"Error in collaborative filtering: {e}")
        return []

async def content_based_recommendations(
    product_id: int,
    similar_products: pd.DataFrame,
    max_results: int = 10
) -> List[Tuple[int, float]]:
    """
    Generar recomendaciones basadas en contenido
    """
    try:
        if similar_products.empty:
            return []
        
        # Si hay descripciones, usar TF-IDF
        if 'description' in similar_products.columns and not similar_products['description'].isna().all():
            descriptions = similar_products['description'].fillna('')
            
            if len(descriptions) > 1:
                tfidf = TfidfVectorizer(stop_words='english', max_features=100)
                tfidf_matrix = tfidf.fit_transform(descriptions)
                
                # Calcular similitud (usar primera descripción como referencia)
                cosine_similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix).flatten()
                
                # Combinar con rating y review count
                scores = []
                for i, (_, product) in enumerate(similar_products.iterrows()):
                    content_score = cosine_similarities[i] if i < len(cosine_similarities) else 0
                    rating_score = product['avg_rating'] / 5.0 if product['avg_rating'] > 0 else 0.5
                    popularity_score = min(1.0, product['review_count'] / 10.0)
                    
                    final_score = (content_score * 0.4 + rating_score * 0.4 + popularity_score * 0.2)
                    scores.append((product['product_id'], final_score))
                
                return sorted(scores, key=lambda x: x[1], reverse=True)[:max_results]
        
        # Fallback: ordenar por rating y popularidad
        recommendations = []
        for _, product in similar_products.iterrows():
            rating_score = product['avg_rating'] / 5.0 if product['avg_rating'] > 0 else 0.5
            popularity_score = min(1.0, product['review_count'] / 10.0)
            final_score = rating_score * 0.7 + popularity_score * 0.3
            
            recommendations.append((product['product_id'], final_score))
        
        return sorted(recommendations, key=lambda x: x[1], reverse=True)[:max_results]
        
    except Exception as e:
        logger.error(f"Error in content-based recommendations: {e}")
        return []

async def get_product_metadata(product_ids: List[int], db: Session) -> Dict[int, ProductMetadata]:
    """
    Obtener metadatos de productos para recomendaciones
    """
    try:
        if not product_ids:
            return {}
        
        query = text("""
            SELECT 
                p.id,
                p.name,
                p.price,
                c.name as category_name,
                p.stock_quantity,
                AVG(pr.rating) as avg_rating,
                COUNT(pr.id) as review_count
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN product_reviews pr ON p.id = pr.product_id
            WHERE p.id = ANY(:product_ids)
            AND p.active = true
            GROUP BY p.id, p.name, p.price, c.name, p.stock_quantity
        """)
        
        result = db.execute(query, {"product_ids": product_ids}).fetchall()
        
        metadata = {}
        for row in result:
            metadata[row.id] = ProductMetadata(
                name=row.name,
                price=float(row.price),
                category=row.category_name or "Sin categoría",
                stock_level=row.stock_quantity,
                avg_rating=float(row.avg_rating) if row.avg_rating else None
            )
        
        return metadata
        
    except Exception as e:
        logger.error(f"Error fetching product metadata: {e}")
        return {}

@router.post(
    "/generate",
    response_model=RecommendationResponse,
    summary="Generar recomendaciones ML personalizadas",
    description="""
    **Sistema avanzado de recomendaciones con múltiples algoritmos de ML**
    
    Este endpoint genera recomendaciones personalizadas utilizando algoritmos de vanguardia:
    
    ### 🤖 Algoritmos disponibles:
    
    #### 🤝 **Filtrado Colaborativo**
    - Analiza comportamiento de usuarios similares
    - Utiliza matriz usuario-item con cosine similarity
    - Ideal para usuarios con historial de compras
    
    #### 📝 **Content-Based**
    - Basado en características del producto
    - TF-IDF para similitud de descripciones
    - Recomendaciones por categoría y atributos
    
    #### 🔀 **Algoritmo Híbrido**
    - Combina collaborative + content + trending
    - Pesos configurables por algoritmo
    - Mayor precisión y cobertura
    
    #### 📈 **Trending Products**
    - Productos populares en tiempo real
    - Basado en ventas y engagement reciente
    - Ideal para usuarios nuevos
    
    ### ⚡ Optimizaciones:
    - Cache Redis inteligente con TTL configurable
    - Queries de BD optimizadas con índices
    - Procesamiento asíncrono para alta concurrencia
    - Fallbacks automáticos entre algoritmos
    """,
    responses={
        200: {
            "description": "Recomendaciones generadas exitosamente",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "timestamp": "2024-01-15T10:30:00Z",
                        "user_id": 123,
                        "product_id": None,
                        "recommendation_type": "hybrid",
                        "recommendations": [
                            {
                                "product_id": 456,
                                "score": 0.89,
                                "rank": 1,
                                "reasoning": "Algoritmo híbrido: Collaborative, Trending",
                                "metadata": {
                                    "name": "Smartphone Galaxy S24",
                                    "price": 999.99,
                                    "category": "Electrónicos",
                                    "stock_level": 25,
                                    "avg_rating": 4.7
                                }
                            },
                            {
                                "product_id": 789,
                                "score": 0.76,
                                "rank": 2,
                                "reasoning": "Usuarios similares también compraron",
                                "metadata": {
                                    "name": "Auriculares Sony WH-1000XM5",
                                    "price": 299.99,
                                    "category": "Audio",
                                    "stock_level": 12,
                                    "avg_rating": 4.8
                                }
                            }
                        ],
                        "algorithm_used": "hybrid_algorithm",
                        "total_considered": 1250,
                        "cache_hit": False
                    }
                }
            }
        },
        400: {
            "description": "Parámetros de recomendación inválidos",
            "content": {
                "application/json": {
                    "example": {
                        "success": False,
                        "timestamp": "2024-01-15T10:30:00Z",
                        "message": "Parámetros inválidos para recomendaciones",
                        "error_code": "INVALID_RECOMMENDATION_PARAMS",
                        "error_details": {
                            "user_id": "Requerido para filtrado colaborativo",
                            "max_results": "Debe estar entre 1 y 100"
                        }
                    }
                }
            }
        },
        404: {
            "description": "Usuario o producto no encontrado",
            "content": {
                "application/json": {
                    "example": {
                        "success": False,
                        "timestamp": "2024-01-15T10:30:00Z",
                        "message": "Entidad no encontrada",
                        "error_code": "ENTITY_NOT_FOUND",
                        "error_details": {
                            "entity_type": "user",
                            "entity_id": 999,
                            "reason": "Usuario no existe o sin historial"
                        }
                    }
                }
            }
        }
    }
)
async def generate_recommendations(
    request: RecommendationRequest = Body(
        ...,
        description="Parámetros para generar recomendaciones personalizadas",
        example={
            "user_id": 123,
            "product_id": None,
            "recommendation_type": "hybrid",
            "max_results": 10,
            "min_score": 0.1,
            "exclude_owned": True,
            "include_metadata": True
        }
    ),
    db: Session = Depends(get_db)
):
    """
    Endpoint principal para generar recomendaciones ML personalizadas
    """
    try:
        # 1. Verificar cache primero
        cached_result = await get_cached_recommendations(
            request.user_id,
            request.product_id,
            request.recommendation_type.value,
            request.max_results
        )
        
        if cached_result:
            logger.info(f"Cache hit for recommendations {request.user_id}:{request.product_id}:{request.recommendation_type}")
            cached_result['cache_hit'] = True
            return RecommendationResponse(**cached_result)
        
        # 2. Generar recomendaciones según el tipo
        recommendations = []
        algorithm_used = ""
        total_considered = 0
        
        if request.recommendation_type == RecommendationType.TRENDING:
            # Productos trending
            trending_products = await get_trending_products(db, limit=request.max_results * 2)
            algorithm_used = "trending_products"
            total_considered = len(trending_products)
            
            for i, product in enumerate(trending_products[:request.max_results]):
                if product['score'] >= request.min_score:
                    recommendations.append((
                        product['product_id'], 
                        min(1.0, product['score'] / 100),  # Normalizar score
                        f"Trending: {product['total_sold']} ventas recientes"
                    ))
        
        elif request.recommendation_type == RecommendationType.COLLABORATIVE and request.user_id:
            # Filtrado colaborativo
            user_item_matrix = await get_user_item_matrix(db)
            collaborative_recs = await collaborative_filtering_recommendations(
                request.user_id, user_item_matrix, request.max_results
            )
            algorithm_used = "collaborative_filtering"
            total_considered = len(user_item_matrix.columns) if not user_item_matrix.empty else 0
            
            for product_id, score in collaborative_recs:
                if score >= request.min_score:
                    recommendations.append((
                        product_id, 
                        score,
                        "Usuarios similares también compraron este producto"
                    ))
        
        elif request.recommendation_type == RecommendationType.CONTENT_BASED and request.product_id:
            # Basado en contenido
            similar_products = await get_similar_products(request.product_id, db)
            content_recs = await content_based_recommendations(
                request.product_id, similar_products, request.max_results
            )
            algorithm_used = "content_based"
            total_considered = len(similar_products)
            
            for product_id, score in content_recs:
                if score >= request.min_score:
                    recommendations.append((
                        product_id,
                        score, 
                        "Similar al producto que estás viendo"
                    ))
        
        elif request.recommendation_type == RecommendationType.HYBRID:
            # Híbrido: combinar múltiples algoritmos
            all_recs = []
            
            # Trending (peso 0.3)
            trending = await get_trending_products(db, limit=20)
            for product in trending[:10]:
                score = min(1.0, product['score'] / 100) * 0.3
                all_recs.append((product['product_id'], score, "Trending"))
            
            # Collaborative si hay usuario (peso 0.4)
            if request.user_id:
                user_item_matrix = await get_user_item_matrix(db)
                collab_recs = await collaborative_filtering_recommendations(
                    request.user_id, user_item_matrix, 10
                )
                for product_id, score in collab_recs:
                    all_recs.append((product_id, score * 0.4, "Collaborative"))
            
            # Content-based si hay producto (peso 0.3)
            if request.product_id:
                similar_products = await get_similar_products(request.product_id, db)
                content_recs = await content_based_recommendations(
                    request.product_id, similar_products, 10
                )
                for product_id, score in content_recs:
                    all_recs.append((product_id, score * 0.3, "Content"))
            
            # Combinar y deduplificar
            product_scores = {}
            for product_id, score, reason in all_recs:
                if product_id not in product_scores:
                    product_scores[product_id] = {"score": 0, "reasons": []}
                product_scores[product_id]["score"] += score
                product_scores[product_id]["reasons"].append(reason)
            
            # Ordenar por score combinado
            sorted_products = sorted(
                product_scores.items(), 
                key=lambda x: x[1]["score"], 
                reverse=True
            )
            
            for product_id, data in sorted_products[:request.max_results]:
                if data["score"] >= request.min_score:
                    reasons = list(set(data["reasons"]))
                    recommendations.append((
                        product_id,
                        data["score"],
                        f"Algoritmo híbrido: {', '.join(reasons)}"
                    ))
            
            algorithm_used = "hybrid_algorithm"
            total_considered = len(product_scores)
        
        # 3. Obtener metadatos si se solicita
        metadata_dict = {}
        if request.include_metadata and recommendations:
            product_ids = [rec[0] for rec in recommendations]
            metadata_dict = await get_product_metadata(product_ids, db)
        
        # 4. Preparar respuesta
        recommendation_items = []
        for i, (product_id, score, reasoning) in enumerate(recommendations):
            item = RecommendationItem(
                product_id=product_id,
                score=round(score, 3),
                rank=i + 1,
                reasoning=reasoning,
                metadata=metadata_dict.get(product_id) if request.include_metadata else None
            )
            recommendation_items.append(item)
        
        response_data = {
            "success": True,
            "timestamp": datetime.utcnow(),
            "user_id": request.user_id,
            "product_id": request.product_id,
            "recommendation_type": request.recommendation_type,
            "recommendations": recommendation_items,
            "algorithm_used": algorithm_used,
            "total_considered": total_considered,
            "cache_hit": False
        }
        
        # 5. Cachear resultado
        await cache_recommendations(
            request.user_id,
            request.product_id,
            request.recommendation_type.value,
            request.max_results,
            response_data
        )
        
        logger.info(f"Generated {len(recommendation_items)} recommendations using {algorithm_used}")
        return RecommendationResponse(**response_data)
        
    except Exception as e:
        logger.error(f"Error generating recommendations: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generando recomendaciones: {str(e)}"
        )

@router.get("/user/{user_id}", response_model=RecommendationResponse)
async def get_user_recommendations(
    user_id: int,
    recommendation_type: RecommendationType = Query(default=RecommendationType.HYBRID),
    max_results: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Obtener recomendaciones personalizadas para un usuario específico
    """
    request = RecommendationRequest(
        user_id=user_id,
        recommendation_type=recommendation_type,
        max_results=max_results,
        exclude_owned=True,
        include_metadata=True
    )
    
    return await generate_recommendations(request, db)

@router.get("/product/{product_id}/similar", response_model=RecommendationResponse)
async def get_similar_product_recommendations(
    product_id: int,
    max_results: int = Query(default=10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """
    Obtener productos similares a uno específico
    """
    request = RecommendationRequest(
        product_id=product_id,
        recommendation_type=RecommendationType.CONTENT_BASED,
        max_results=max_results,
        include_metadata=True
    )
    
    return await generate_recommendations(request, db)

@router.get("/trending", response_model=RecommendationResponse)
async def get_trending_recommendations(
    max_results: int = Query(default=20, ge=1, le=100),
    days: int = Query(default=7, ge=1, le=30),
    db: Session = Depends(get_db)
):
    """
    Obtener productos trending basados en ventas recientes
    """
    request = RecommendationRequest(
        recommendation_type=RecommendationType.TRENDING,
        max_results=max_results,
        include_metadata=True
    )
    
    return await generate_recommendations(request, db)

@router.delete("/cache/user/{user_id}")
async def invalidate_user_recommendations(user_id: int):
    """
    Invalidar cache de recomendaciones para un usuario específico
    """
    try:
        deleted_count = await cache_manager.invalidate_user(user_id)
        
        return {
            "success": True,
            "message": f"Cache de recomendaciones invalidado para usuario {user_id}",
            "deleted_entries": deleted_count
        }
        
    except Exception as e:
        logger.error(f"Error invalidating recommendations cache for user {user_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error invalidando cache: {str(e)}"
        )
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
