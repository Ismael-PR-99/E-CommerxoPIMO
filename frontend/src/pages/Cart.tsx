import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/orders';
import { fmtCurrency } from '../utils/format';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { items, totalItems, totalAmount, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Si el carrito está vacío
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="mx-auto h-16 w-16 bg-gray-300 rounded-full flex items-center justify-center mb-4">
              🛒
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h2>
            <p className="text-gray-600 mb-8">¡Agrega algunos productos para comenzar!</p>
            <button
              onClick={() => navigate('/products')}
              className="btn"
            >
              Ver Productos
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Manejar cambio de cantidad
  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  // Proceder al pago
  const handleCheckout = async () => {
    if (!user) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    if (!shippingAddress.trim()) {
      setError('Por favor ingresa una dirección de envío');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Preparar datos de la orden
      const orderData = {
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.product.price,
          subtotal: item.subtotal
        })),
        shippingAddress: shippingAddress.trim()
      };

      // Crear orden en el backend
      const order = await createOrder(orderData);
      
      // Limpiar carrito después de crear la orden
      clearCart();
      
      // Navegar a checkout con el ID de la orden
      navigate(`/checkout/${order.id}`, { 
        state: { 
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount
        }
      });
    } catch (error: any) {
      console.error('Error creating order:', error);
      setError(error.message || 'Error al crear la orden. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Carrito de Compras</h1>
          <p className="text-gray-600 mt-2">{totalItems} {totalItems === 1 ? 'artículo' : 'artículos'}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de productos */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Productos</h2>
                  <button
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Vaciar carrito
                  </button>
                </div>

                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item.productId} className="flex items-center space-x-4 border-b pb-6 last:border-b-0">
                      {/* Imagen del producto */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.product.imageUrl || '/api/placeholder/100/100'}
                          alt={item.product.name}
                          className="h-20 w-20 rounded-lg object-cover"
                        />
                      </div>

                      {/* Información del producto */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {item.product.description}
                        </p>
                        <p className="text-lg font-bold text-brand-600 mt-2">
                          {fmtCurrency(item.product.price)}
                        </p>
                      </div>

                      {/* Controles de cantidad */}
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                          className="p-1 rounded-full hover:bg-gray-100 transition-colors w-8 h-8 flex items-center justify-center"
                        >
                          -
                        </button>
                        
                        <span className="text-lg font-medium text-gray-900 min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        
                        <button
                          onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                          className="p-1 rounded-full hover:bg-gray-100 transition-colors w-8 h-8 flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>

                      {/* Subtotal y eliminar */}
                      <div className="flex flex-col items-end space-y-2">
                        <p className="text-lg font-bold text-gray-900">
                          {fmtCurrency(item.subtotal)}
                        </p>
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="text-red-600 hover:text-red-800 p-1 text-sm"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Resumen del pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Resumen del Pedido</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({totalItems} {totalItems === 1 ? 'artículo' : 'artículos'})</span>
                  <span>{fmtCurrency(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span>Gratis</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>{fmtCurrency(totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Dirección de envío */}
              <div className="mb-6">
                <label htmlFor="shippingAddress" className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección de envío *
                </label>
                <textarea
                  id="shippingAddress"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Ingresa tu dirección completa..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  rows={3}
                  required
                />
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Botón de checkout */}
              <button
                onClick={handleCheckout}
                disabled={loading || !shippingAddress.trim()}
                className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors ${
                  loading || !shippingAddress.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'btn'
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <span>Proceder al Pago</span>
                    <span>→</span>
                  </>
                )}
              </button>

              {!user && (
                <p className="text-sm text-gray-600 mt-4 text-center">
                  <span>¿No tienes cuenta? </span>
                  <button
                    onClick={() => navigate('/register')}
                    className="text-brand-600 hover:text-brand-800 font-medium"
                  >
                    Registrarse
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;