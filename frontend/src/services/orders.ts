// services/orders.ts - API para gestión de órdenes

// Tipos para órdenes
export interface OrderItem {
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderItemCreateRequest {
  productId: number;
  quantity: number;
}

export interface CreateOrderRequest {
  orderItems: OrderItemCreateRequest[];
  shippingAddress: string;
}

export interface CreateOrderResponse {
  id: number;
  orderNumber: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'PAID' | 'FAILED' | 'CANCELLED';
  paymentStatus: 'REQUIRES_ACTION' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'CANCELED' | 'REQUIRES_CAPTURE' | 'PENDING' | 'REFUNDED';
  createdAt: string;
  updatedAt: string;
  shippingAddress: string;
  paymentMethod?: string;
  shippedAt?: string;
  deliveredAt?: string;
  items: OrderItem[];
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
 * Crear una nueva orden en el backend
 */
export const createOrder = async (orderData: CreateOrderRequest): Promise<CreateOrderResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('No tienes autorización para crear órdenes. Por favor, inicia sesión.');
      }
      if (response.status === 400) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Datos de orden inválidos');
      }
      throw new Error(`Error al crear la orden: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating order:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error de conexión al crear la orden');
  }
};

/**
 * Obtener una orden por ID
 */
export const getOrder = async (orderId: number): Promise<Order> => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('No tienes autorización para ver esta orden');
      }
      if (response.status === 404) {
        throw new Error('Orden no encontrada');
      }
      throw new Error(`Error al obtener la orden: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting order:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error de conexión al obtener la orden');
  }
};

/**
 * Obtener todas las órdenes del usuario autenticado
 */
export const getMyOrders = async (): Promise<Order[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/my-orders`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('No tienes autorización para ver las órdenes');
      }
      throw new Error(`Error al obtener las órdenes: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting my orders:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error de conexión al obtener las órdenes');
  }
};

/**
 * Cancelar una orden
 */
export const cancelOrder = async (orderId: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('No tienes autorización para cancelar esta orden');
      }
      if (response.status === 404) {
        throw new Error('Orden no encontrada');
      }
      if (response.status === 400) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'No se puede cancelar esta orden');
      }
      throw new Error(`Error al cancelar la orden: ${response.status}`);
    }
  } catch (error) {
    console.error('Error cancelling order:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error de conexión al cancelar la orden');
  }
};