import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { 
  paymentsService, 
  handlePaymentError, 
  formatAmount, 
  generateIdempotencyKey,
  type CheckoutResponse 
} from '../services/payments';

// Cargar Stripe con la publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

// Componente principal de Checkout
const Checkout: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [clientSecret, setClientSecret] = useState<string>('');
  const [checkoutData, setCheckoutData] = useState<CheckoutResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Efecto para inicializar el checkout
  useEffect(() => {
    if (!orderId) {
      setError('ID de orden requerido');
      setLoading(false);
      return;
    }

    const initializeCheckout = async () => {
      try {
        setLoading(true);
        setError('');

        // Generar idempotency key para evitar duplicados
        const idempotencyKey = generateIdempotencyKey(parseInt(orderId));
        
        // Crear checkout en el backend
        const response = await paymentsService.createCheckout(
          parseInt(orderId), 
          idempotencyKey
        );
        
        setCheckoutData(response);
        setClientSecret(response.client_secret);
        
      } catch (err) {
        const paymentError = handlePaymentError(err);
        setError(paymentError.message);
        console.error('Error inicializando checkout:', paymentError);
      } finally {
        setLoading(false);
      }
    };

    initializeCheckout();
  }, [orderId]);

  // Opciones para Elements
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

  // Render de estados de carga y error
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-center text-gray-600">Preparando checkout...</p>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">Error en el checkout</h3>
          <p className="text-gray-600 text-center mb-4">{error}</p>
          <button
            onClick={() => navigate('/orders')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
          >
            Volver a órdenes
          </button>
        </div>
      </div>
    );
  }

  if (!clientSecret || !checkoutData) {
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Completar Pago</h1>
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Orden #{orderId}</span>
            <span className="font-semibold text-lg text-gray-900">
              {formatAmount(checkoutData.amount_cents, checkoutData.currency)}
            </span>
          </div>
        </div>

        {/* Formulario de pago */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <Elements options={elementsOptions} stripe={stripePromise}>
            <CheckoutForm 
              orderId={orderId!} 
              paymentIntentId={checkoutData.payment_intent_id}
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

// Componente del formulario de pago (dentro de Elements)
const CheckoutForm: React.FC<{ orderId: string; paymentIntentId: string }> = ({ 
  orderId, 
  paymentIntentId 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

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
          return_url: `${window.location.origin}/order/thank-you?orderId=${orderId}&paymentIntentId=${paymentIntentId}`,
        },
        redirect: 'if_required', // Solo redirigir si es necesario (3D Secure)
      });

      if (error) {
        // Error en el pago
        if (error.type === 'card_error' || error.type === 'validation_error') {
          setMessage(error.message || 'Error en los datos de la tarjeta');
        } else {
          setMessage('Error inesperado. Inténtalo nuevamente.');
        }
        setMessageType('error');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Pago exitoso - redirigir a página de confirmación
        navigate(`/order/thank-you?orderId=${orderId}&paymentIntentId=${paymentIntentId}`);
      } else {
        // Estado intermedio (processing, requires_action, etc.)
        setMessage('El pago está siendo procesado...');
        setMessageType('success');
        
        // Redirigir después de un momento
        setTimeout(() => {
          navigate(`/order/thank-you?orderId=${orderId}&paymentIntentId=${paymentIntentId}`);
        }, 2000);
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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Información de pago
        </label>
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

export default Checkout;