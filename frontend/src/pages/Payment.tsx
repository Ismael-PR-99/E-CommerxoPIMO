import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { useCartStore } from '../store';
import { fmtCurrency } from '../utils/format';
import { createOrder } from '../services/orders';
import { paymentsService } from '../services/payments';
import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/api';
import type { Product } from '../types';

// Cargar Stripe con la publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

const Payment: React.FC = () => {
  const navigate = useNavigate();
  const { items, clearCart } = useCartStore();
  
  const [clientSecret, setClientSecret] = useState<string>('');
  const [orderId, setOrderId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [orderTotal, setOrderTotal] = useState<number>(0);

  // Obtener productos para calcular precios
  const { data: products } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: productService.getAll
  });

  const getProduct = (productId: string) => {
    return products?.find(p => p.id.toString() === productId);
  };

  // Calcular total del carrito
  useEffect(() => {
    if (items.length === 0) {
      navigate('/store');
      return;
    }

    if (products) {
      const total = items.reduce((sum, item) => {
        const product = getProduct(item.productId);
        const price = product?.price || 0;
        return sum + (price * item.quantity);
      }, 0);
      
      setOrderTotal(total);
    }
  }, [items, products, navigate]);

  // Crear orden y setup de pago
  useEffect(() => {
    const initializePayment = async () => {
      try {
        setLoading(true);
        setError('');

        if (!products || products.length === 0) {
          return; // Esperar a que se carguen los productos
        }

        // Crear la orden primero
        const orderItems = items.map(item => ({
          productId: parseInt(item.productId),
          quantity: item.quantity
        }));

        const orderResponse = await createOrder({
          orderItems: orderItems,
          shippingAddress: 'Dirección por defecto'
        });

        setOrderId(orderResponse.id);

        // Crear el payment intent
        const checkoutResponse = await paymentsService.createCheckout(orderResponse.id);
        setClientSecret(checkoutResponse.client_secret);

      } catch (err) {
        console.error('Error inicializando pago:', err);
        setError('Error al inicializar el pago. Por favor, inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    if (items.length > 0 && products) {
      initializePayment();
    }
  }, [items, products]);

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#0570de',
      colorBackground: '#ffffff',
      colorText: '#30313d',
      colorDanger: '#df1b41',
      fontFamily: 'Ideal Sans, system-ui, sans-serif',
      spacingUnit: '2px',
      borderRadius: '4px',
    },
  };

  const elementsOptions = {
    clientSecret,
    appearance,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-center text-gray-600">Preparando el pago...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-red-600 mb-4">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">Error en el pago</h3>
          <p className="text-gray-600 text-center mb-4">{error}</p>
          <button
            onClick={() => navigate('/store')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
          >
            Volver a la tienda
          </button>
        </div>
      </div>
    );
  }

  if (!clientSecret || !orderId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <p className="text-center text-gray-600">Error: No se pudo inicializar el pago</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Completar Pago</h1>
          
          {/* Resumen de la orden */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">Resumen de la orden</h3>
            <div className="space-y-2">
              {items.map((item, index) => {
                const product = getProduct(item.productId);
                const price = product?.price || 0;
                return (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.quantity}x {product?.name || `Producto #${item.productId}`}</span>
                    <span>{fmtCurrency(price * item.quantity)}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between items-center text-lg font-bold mt-4 pt-2 border-t">
              <span>Total:</span>
              <span>{fmtCurrency(orderTotal)}</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">Orden #{orderId}</p>
          </div>
        </div>

        {/* Formulario de pago */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Información de pago</h2>
          <Elements options={elementsOptions} stripe={stripePromise}>
            <PaymentForm 
              orderId={orderId} 
              onSuccess={() => {
                clearCart();
                navigate(`/order/thank-you?orderId=${orderId}`);
              }}
            />
          </Elements>
        </div>

        {/* Información de seguridad */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <div className="flex items-center justify-center mb-2">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 0h12a2 2 0 002-2v-9a2 2 0 00-2-2H6a2 2 0 00-2 2v9a2 2 0 002 2z" />
            </svg>
            Pago seguro con cifrado SSL
          </div>
          <p>Procesado por Stripe. Tus datos están protegidos.</p>
        </div>
      </div>
    </div>
  );
};

// Componente del formulario de pago
const PaymentForm: React.FC<{ 
  orderId: number; 
  onSuccess: () => void; 
}> = ({ orderId, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'error' | 'success'>('error');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setMessage('Stripe no está cargado correctamente. Recarga la página.');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // Confirmar el pago
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order/thank-you?orderId=${orderId}`,
        },
        redirect: 'if_required',
      });

      if (error) {
        if (error.type === 'card_error' || error.type === 'validation_error') {
          setMessage(error.message || 'Error en los datos de la tarjeta');
        } else {
          setMessage('Error inesperado. Inténtalo nuevamente.');
        }
        setMessageType('error');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setMessage('¡Pago exitoso! Redirigiendo...');
        setMessageType('success');
        setTimeout(() => onSuccess(), 2000);
      } else {
        setMessage('El pago está siendo procesado...');
        setMessageType('success');
        setTimeout(() => onSuccess(), 2000);
      }
    } catch (err) {
      console.error('Error confirmando pago:', err);
      setMessage('Error inesperado. Inténtalo nuevamente.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Element */}
      <div>
        <PaymentElement 
          id="payment-element"
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {/* Mensaje de estado */}
      {message && (
        <div className={`p-4 rounded-md ${
          messageType === 'error' 
            ? 'bg-red-50 border border-red-200 text-red-700' 
            : 'bg-green-50 border border-green-200 text-green-700'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {messageType === 'error' ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm">{message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Botón de pago */}
      <button
        disabled={isLoading || !stripe || !elements}
        type="submit"
        className={`w-full py-3 px-4 rounded-md font-medium transition duration-200 ${
          isLoading || !stripe || !elements
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Procesando pago...
          </div>
        ) : (
          'Completar pago'
        )}
      </button>

      {/* Información de tarjetas de prueba */}
      {import.meta.env.DEV && (
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Tarjetas de prueba:</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li><strong>Éxito:</strong> 4242 4242 4242 4242</li>
            <li><strong>Requiere 3D Secure:</strong> 4000 0025 0000 3155</li>
            <li><strong>Falla:</strong> 4000 0000 0000 9995</li>
            <li><strong>Cualquier fecha futura y CVC</strong></li>
          </ul>
        </div>
      )}
    </form>
  );
};

export default Payment;