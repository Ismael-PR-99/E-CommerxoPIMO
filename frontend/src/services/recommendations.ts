// services/recommendations.ts - API para recomendaciones ML

import productService, { type ProductResponse } from './products';

// Tipos para recomendaciones
export interface RecommendationItem {
  productId: number;
  score: number;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
  description?: string;
  category?: string;
  stock?: number;
}

export interface RecommendationWithProduct extends RecommendationItem {
  product: Product;
}

const API_BASE_URL = 'http://localhost:8080/api';

// Obtener token JWT del localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Headers con autorización
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

/**
 * Obtener recomendaciones del usuario desde el backend
 * El backend ya resuelve los IDs del ML service a ProductResponse[]
 */
export const getMyRecommendations = async (): Promise<ProductResponse[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/recommendations/my`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      console.warn('Fallo /recommendations/my, usando fallback');
      return getFallbackRecommendations();
    }

    const products: ProductResponse[] = await response.json();
    return products;
  } catch (error) {
    console.error('Error getting my recommendations:', error);
    return getFallbackRecommendations();
  }
};

/**
 * Fallback: si el ML service o backend no devuelve datos, usar productos recientes
 */
export const getFallbackRecommendations = async (): Promise<ProductResponse[]> => {
  try {
    const page = await productService.getProducts(0, 8, 'createdAt,desc');
    return page.content ?? [];
  } catch (e) {
    console.error('Error obteniendo fallback recommendations', e);
    return [];
  }
};