import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { paymentsService, handlePaymentError, formatAmount, type PaymentStatusResponse } from '../services/payments';

const ThankYou: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const orderId = searchParams.get('orderId');
  const paymentIntentId = searchParams.get('paymentIntentId');
  
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!orderId || !paymentIntentId) {
      setError('Información de pago incompleta');
      setLoading(false);
      return;
    }

    const checkPaymentStatus = async () => {
      try {
        setLoading(true);
        const status = await paymentsService.getPaymentStatus(paymentIntentId);
        setPaymentStatus(status);
      } catch (err) {
        const paymentError = handlePaymentError(err);
        setError(paymentError.message);
        console.error('Error consultando estado de pago:', paymentError);
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [orderId, paymentIntentId]);

  // Determinar el estado del pago
  const getPaymentStatusInfo = () => {
    if (!paymentStatus) return null;

    switch (paymentStatus.status) {
      case 'SUCCEEDED':
        return {
          type: 'success' as const,
          title: '¡Pago completado!',
          message: 'Tu pago se ha procesado exitosamente.',
          icon: (
            <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
      case 'PROCESSING':
        return {
          type: 'info' as const,
          title: 'Pago en proceso',
          message: 'Tu pago está siendo procesado. Te notificaremos cuando esté completo.',
          icon: (
            <svg className="w-16 h-16 text-blue-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
      case 'REQUIRES_ACTION':
        return {
          type: 'warning' as const,
          title: 'Acción requerida',
          message: 'Tu pago requiere verificación adicional. Revisa tu email o contacto bancario.',
          icon: (
            <svg className="w-16 h-16 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          )
        };
      case 'FAILED':
      case 'CANCELED':
        return {
          type: 'error' as const,
          title: 'Pago no completado',
          message: 'No se pudo procesar tu pago. Puedes intentar nuevamente.',
          icon: (
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )
        };
      default:
        return {
          type: 'info' as const,
          title: 'Estado del pago',
          message: `Estado actual: ${paymentStatus.status}`,
          icon: (
            <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
    }
  };

  const statusInfo = getPaymentStatusInfo();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-center text-gray-600">Verificando estado del pago...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error consultando pago</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/orders')}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
          >
            Ver mis órdenes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Card principal */}
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          {statusInfo?.icon}
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {statusInfo?.title}
          </h1>
          
          <p className="text-gray-600 mb-6">
            {statusInfo?.message}
          </p>

          {/* Información del pago */}
          {paymentStatus && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Orden:</span>
                  <p className="font-semibold">#{orderId}</p>
                </div>
                <div>
                  <span className="text-gray-500">Monto:</span>
                  <p className="font-semibold">
                    {formatAmount(paymentStatus.amountCents, paymentStatus.currency)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Estado:</span>
                  <p className="font-semibold">
                    <StatusBadge status={paymentStatus.status} />
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Fecha:</span>
                  <p className="font-semibold">
                    {new Date(paymentStatus.createdAt).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
              
              {/* ID de transacción */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <span className="text-gray-500 text-xs">ID de transacción:</span>
                <p className="font-mono text-xs text-gray-600 break-all">
                  {paymentStatus.paymentIntentId}
                </p>
              </div>
            </div>
          )}

          {/* Acciones según el estado */}
          <div className="space-y-3">
            {statusInfo?.type === 'success' && (
              <>
                <button
                  onClick={() => navigate('/orders')}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition duration-200 font-medium"
                >
                  Ver mis órdenes
                </button>
                <button
                  onClick={() => navigate('/store')}
                  className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-300 transition duration-200 font-medium"
                >
                  Continuar comprando
                </button>
              </>
            )}

            {statusInfo?.type === 'error' && (
              <>
                <button
                  onClick={() => navigate(`/checkout?orderId=${orderId}`)}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition duration-200 font-medium"
                >
                  Intentar pago nuevamente
                </button>
                <button
                  onClick={() => navigate('/orders')}
                  className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-300 transition duration-200 font-medium"
                >
                  Ver mis órdenes
                </button>
              </>
            )}

            {(statusInfo?.type === 'info' || statusInfo?.type === 'warning') && (
              <>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition duration-200 font-medium"
                >
                  Actualizar estado
                </button>
                <button
                  onClick={() => navigate('/orders')}
                  className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-300 transition duration-200 font-medium"
                >
                  Ver mis órdenes
                </button>
              </>
            )}
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>¿Tienes alguna pregunta sobre tu pago?</p>
          <a 
            href="mailto:soporte@ecommercepimo.com" 
            className="text-blue-600 hover:text-blue-700"
          >
            Contacta con soporte
          </a>
        </div>
      </div>
    </div>
  );
};

// Componente para mostrar badge de estado
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCEEDED':
        return 'bg-green-100 text-green-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'REQUIRES_ACTION':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
      case 'CANCELED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'SUCCEEDED':
        return 'Completado';
      case 'PROCESSING':
        return 'Procesando';
      case 'REQUIRES_ACTION':
        return 'Requiere acción';
      case 'FAILED':
        return 'Fallido';
      case 'CANCELED':
        return 'Cancelado';
      default:
        return status;
    }
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>
      {getStatusText(status)}
    </span>
  );
};

export default ThankYou;