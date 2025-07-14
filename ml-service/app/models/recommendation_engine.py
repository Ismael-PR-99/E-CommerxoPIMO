import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

class RecommendationEngine:
    def __init__(self):
        self.user_item_matrix = None
        self.item_features = None
        self.tfidf_vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        
    def prepare_user_item_matrix(self, orders_data: List[Dict[str, Any]]) -> None:
        """Prepara la matriz usuario-item para filtrado colaborativo."""
        try:
            df = pd.DataFrame(orders_data)
            
            # Crear matriz usuario-item
            self.user_item_matrix = df.pivot_table(
                index='user_id',
                columns='product_id',
                values='quantity',
                fill_value=0
            )
            
            logger.info(f"Matriz usuario-item creada: {self.user_item_matrix.shape}")
            
        except Exception as e:
            logger.error(f"Error al preparar matriz usuario-item: {str(e)}")
            raise
    
    def prepare_content_features(self, products_data: List[Dict[str, Any]]) -> None:
        """Prepara las características de contenido para filtrado basado en contenido."""
        try:
            df = pd.DataFrame(products_data)
            
            # Combinar nombre y descripción para análisis de texto
            df['combined_features'] = df['name'].astype(str) + ' ' + df['description'].astype(str)
            
            # Crear matriz TF-IDF
            tfidf_matrix = self.tfidf_vectorizer.fit_transform(df['combined_features'])
            
            self.item_features = {
                'tfidf_matrix': tfidf_matrix,
                'product_ids': df['id'].tolist(),
                'categories': df['category_id'].tolist()
            }
            
            logger.info(f"Características de contenido preparadas para {len(df)} productos")
            
        except Exception as e:
            logger.error(f"Error al preparar características de contenido: {str(e)}")
            raise
    
    def get_collaborative_recommendations(
        self, 
        user_id: str, 
        num_recommendations: int = 10
    ) -> List[Dict[str, Any]]:
        """Genera recomendaciones usando filtrado colaborativo."""
        try:
            if self.user_item_matrix is None:
                raise ValueError("Matriz usuario-item no preparada")
            
            if user_id not in self.user_item_matrix.index:
                return self._get_popular_items(num_recommendations)
            
            # Calcular similitud entre usuarios
            user_similarity = cosine_similarity(self.user_item_matrix)
            user_similarity_df = pd.DataFrame(
                user_similarity,
                index=self.user_item_matrix.index,
                columns=self.user_item_matrix.index
            )
            
            # Encontrar usuarios similares
            similar_users = user_similarity_df[user_id].sort_values(ascending=False)[1:11]
            
            # Obtener productos no comprados por el usuario
            user_items = self.user_item_matrix.loc[user_id]
            unrated_items = user_items[user_items == 0].index
            
            # Calcular puntuaciones de recomendación
            recommendations = []
            for item in unrated_items:
                score = 0
                similarity_sum = 0
                
                for similar_user, similarity in similar_users.items():
                    if self.user_item_matrix.loc[similar_user, item] > 0:
                        score += similarity * self.user_item_matrix.loc[similar_user, item]
                        similarity_sum += similarity
                
                if similarity_sum > 0:
                    score = score / similarity_sum
                    recommendations.append({
                        'product_id': item,
                        'score': float(score),
                        'reason': 'Usuarios similares también compraron este producto'
                    })
            
            # Ordenar por puntuación y devolver top N
            recommendations.sort(key=lambda x: x['score'], reverse=True)
            return recommendations[:num_recommendations]
            
        except Exception as e:
            logger.error(f"Error en recomendaciones colaborativas: {str(e)}")
            return self._get_popular_items(num_recommendations)
    
    def get_content_based_recommendations(
        self, 
        product_id: str, 
        num_recommendations: int = 10
    ) -> List[Dict[str, Any]]:
        """Genera recomendaciones basadas en contenido."""
        try:
            if self.item_features is None:
                raise ValueError("Características de contenido no preparadas")
            
            product_ids = self.item_features['product_ids']
            if product_id not in product_ids:
                return []
            
            # Encontrar índice del producto
            product_index = product_ids.index(product_id)
            
            # Calcular similitud de contenido
            content_similarity = cosine_similarity(self.item_features['tfidf_matrix'])
            
            # Obtener productos similares
            similar_items = list(enumerate(content_similarity[product_index]))
            similar_items.sort(key=lambda x: x[1], reverse=True)
            
            recommendations = []
            for i, (idx, score) in enumerate(similar_items[1:num_recommendations+1]):
                recommendations.append({
                    'product_id': product_ids[idx],
                    'score': float(score),
                    'reason': 'Producto similar al que estás viendo'
                })
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error en recomendaciones basadas en contenido: {str(e)}")
            return []
    
    def get_hybrid_recommendations(
        self, 
        user_id: str, 
        current_product_id: str = None,
        num_recommendations: int = 10
    ) -> List[Dict[str, Any]]:
        """Combina recomendaciones colaborativas y basadas en contenido."""
        try:
            collaborative_recs = self.get_collaborative_recommendations(user_id, num_recommendations)
            content_recs = []
            
            if current_product_id:
                content_recs = self.get_content_based_recommendations(
                    current_product_id, 
                    num_recommendations
                )
            
            # Combinar y ponderar recomendaciones
            combined_recs = {}
            
            # Peso para recomendaciones colaborativas
            for rec in collaborative_recs:
                product_id = rec['product_id']
                combined_recs[product_id] = {
                    'product_id': product_id,
                    'score': rec['score'] * 0.7,  # 70% peso colaborativo
                    'reason': rec['reason']
                }
            
            # Peso para recomendaciones de contenido
            for rec in content_recs:
                product_id = rec['product_id']
                if product_id in combined_recs:
                    combined_recs[product_id]['score'] += rec['score'] * 0.3
                    combined_recs[product_id]['reason'] += f" y {rec['reason']}"
                else:
                    combined_recs[product_id] = {
                        'product_id': product_id,
                        'score': rec['score'] * 0.3,  # 30% peso contenido
                        'reason': rec['reason']
                    }
            
            # Convertir a lista y ordenar
            final_recs = list(combined_recs.values())
            final_recs.sort(key=lambda x: x['score'], reverse=True)
            
            return final_recs[:num_recommendations]
            
        except Exception as e:
            logger.error(f"Error en recomendaciones híbridas: {str(e)}")
            return []
    
    def _get_popular_items(self, num_recommendations: int) -> List[Dict[str, Any]]:
        """Devuelve productos populares como fallback."""
        if self.user_item_matrix is None:
            return []
        
        # Calcular popularidad por suma de cantidades
        popularity = self.user_item_matrix.sum(axis=0).sort_values(ascending=False)
        
        recommendations = []
        for i, (product_id, score) in enumerate(popularity.head(num_recommendations).items()):
            recommendations.append({
                'product_id': product_id,
                'score': float(score),
                'reason': 'Producto popular entre todos los usuarios'
            })
        
        return recommendations
