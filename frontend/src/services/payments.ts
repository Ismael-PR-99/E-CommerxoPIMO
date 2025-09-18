import axios from 'axios';

// Tipos para el servicio de pagos
export interface CheckoutRequest {
  orderId: number;
}

export interface CheckoutResponse {
  client_secret: string;
  payment_intent_id: string;
  amount_cents: number;
  currency: string;
}

export interface PaymentStatusResponse {
  paymentIntentId: string;
  status: string;
  amountCents: number;
  currency: string;
  createdAt: string;
  processedAt?: string;
}

// Instancia de axios para pagos
const paymentsApi = axios.create({
  // Nota: VITE_API_URL debe apuntar a `${backend}/api` para que esta URL resuelva a `/api/payments`
  baseURL: `${import.meta.env.VITE_API_URL}/payments`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token JWT
paymentsApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejo de errores
paymentsApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Payment API Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      // Token expirado, limpiar y redirigir a login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Servicio de pagos
export const paymentsService = {
  /**
   * Crear un checkout/PaymentIntent para una orden
   */
  async createCheckout(orderId: number, idempotencyKey?: string): Promise<CheckoutResponse> {
    const headers: Record<string, string> = {};
    
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }

    const response = await paymentsApi.post<CheckoutResponse>(
      '/checkout',
      { orderId },
      { headers }
    );
    
    return response.data;
  },

  /**
   * Obtener el estado de un pago por PaymentIntent ID
   */
  async getPaymentStatus(paymentIntentId: string): Promise<PaymentStatusResponse> {
    const response = await paymentsApi.get<PaymentStatusResponse>(
      `/status/${paymentIntentId}`
    );
    
    return response.data;
  },

  /**
   * Verificar la salud del servicio de webhooks
   */
  async checkWebhookHealth(): Promise<string> {
    const response = await paymentsApi.get<string>('/webhooks/health');
    return response.data;
  },
};

// Utilidades para manejo de errores de pago
export class PaymentError extends Error {
  constructor(
    message: string,
    public code?: string,
    public type?: 'validation' | 'payment' | 'network' | 'auth'
  ) {
    super(message);
    this.name = 'PaymentError';
  }
}

// Helper para convertir errores de axios a PaymentError
export const handlePaymentError = (error: any): PaymentError => {
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return new PaymentError(
          data.message || 'Datos de pago inválidos',
          'VALIDATION_ERROR',
          'validation'
        );
      case 401:
        return new PaymentError(
          'No autorizado. Por favor inicia sesión nuevamente.',
          'UNAUTHORIZED',
          'auth'
        );
      case 404:
        return new PaymentError(
          'Orden no encontrada',
          'ORDER_NOT_FOUND',
          'validation'
        );
      case 500:
        return new PaymentError(
          'Error interno del servidor. Inténtalo nuevamente.',
          'INTERNAL_ERROR',
          'payment'
        );
      default:
        return new PaymentError(
          data.message || 'Error procesando el pago',
          'UNKNOWN_ERROR',
          'payment'
        );
    }
  }
  
  if (error.request) {
    return new PaymentError(
      'Error de conexión. Verifica tu conexión a internet.',
      'NETWORK_ERROR',
      'network'
    );
  }
  
  return new PaymentError(
    error.message || 'Error inesperado',
    'UNKNOWN_ERROR',
    'payment'
  );
};

// Helper para formatear montos
export const formatAmount = (amountCents: number, currency: string = 'EUR'): string => {
  const amount = amountCents / 100;
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// Helper para generar idempotency key única
export const generateIdempotencyKey = (orderId: number): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  return `checkout_${orderId}_${timestamp}_${random}`;
};