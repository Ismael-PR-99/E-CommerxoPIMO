import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { fmtCurrency } from '../utils/format';
import { SimpleProductImage } from '../components/SimpleProductImage.tsx';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  stock: number;
}

const Store: React.FC = () => {
  const { products, updateProductStock } = useStore();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'Charcutería', 'Jamones', 'Aceites'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory && product.stock > 0;
  });

  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1, stock: product.stock }
            : item
        ));
      } else {
        alert('No hay suficiente stock disponible');
      }
    } else {
      if (product.stock > 0) {
        setCart([...cart, { id: product.id, name: product.name, price: product.price, quantity: 1, stock: product.stock }]);
      } else {
        alert('Este producto está agotado');
      }
    }
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
    } else {
      const currentProduct = products.find(p => p.id === productId);
      if (currentProduct && newQuantity <= currentProduct.stock) {
        setCart(cart.map(item =>
          item.id === productId
            ? { ...item, quantity: newQuantity, stock: currentProduct.stock }
            : item
        ));
      } else {
        alert('No hay suficiente stock disponible');
      }
    }
  };

  const getCartTotal = () => cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const getCartItemsCount = () => cart.reduce((total, item) => total + item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }
    const outOfStock = cart.find(item => {
      const currentProduct = products.find(p => p.id === item.id);
      return !currentProduct || currentProduct.stock < item.quantity;
    });
    if (outOfStock) {
      alert(`El producto "${outOfStock.name}" no tiene suficiente stock disponible. Por favor, actualiza tu carrito.`);
      return;
    }
    cart.forEach(item => updateProductStock(item.id, item.quantity));
    alert(`¡Gracias por tu compra! Total: ${fmtCurrency(getCartTotal())}\n\nEl stock ha sido actualizado automáticamente.`);
    setCart([]);
    setShowCart(false);
  };

  return (
    <div className="page-background min-h-screen">
      <header className="bg-brand-600 text-white shadow">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">🛒 E-CommerxoPIMO Store</h1>
          <button onClick={() => setShowCart(!showCart)} className="relative btn-secondary">
            🛒 Carrito ({getCartItemsCount()})
            {getCartItemsCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-brand-700 border border-brand-200 rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">
                {getCartItemsCount()}
              </span>
            )}
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="card mb-8 flex flex-wrap items-center gap-4">
          <input
            type="text"
            placeholder="🔍 Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[260px] rounded-card border border-gray-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="min-w-[200px] rounded-card border border-gray-300 px-4 py-3 bg-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'Todas las categorías' : category}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {filteredProducts.map(product => (
            <div key={product.id} className="card border border-gray-100">
              <div className="w-full h-48 rounded-card mb-4 overflow-hidden bg-gray-100">
                <SimpleProductImage productName={product.name} altText={product.name} style={{ width: '100%', height: '100%' }} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">{product.description}</p>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xl font-bold text-gray-900">{fmtCurrency(product.price)}</div>
                  <div className={product.stock <= 10 ? 'text-sm text-red-600' : 'text-sm text-green-600'}>
                    Stock: {product.stock} disponibles
                  </div>
                </div>
                <div className="bg-gray-100 px-3 py-1 rounded-full text-xs font-medium text-gray-700">{product.category}</div>
              </div>
              <button onClick={() => addToCart(product)} disabled={product.stock === 0} className="btn w-full">
                {product.stock === 0 ? '❌ Agotado' : '🛒 Agregar al Carrito'}
              </button>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="card text-center">
            <div className="text-6xl mb-2">🔍</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-1">No se encontraron productos</h3>
            <p className="text-gray-600">Intenta ajustar los filtros de búsqueda</p>
          </div>
        )}
      </div>

      {showCart && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-card p-6 w-11/12 max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">🛒 Tu Carrito</h2>
              <button onClick={() => setShowCart(false)} className="text-gray-500 hover:text-gray-700" aria-label="Cerrar">❌</button>
            </div>
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-2">🛒</div>
                <p className="text-gray-600">Tu carrito está vacío</p>
              </div>
            ) : (
              <>
                <div className="mb-4 space-y-2">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-card">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">{item.name}</h4>
                        <p className="text-xs text-gray-600">{fmtCurrency(item.price)} c/u</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="h-8 w-8 rounded bg-gray-100 hover:bg-gray-200">-</button>
                        <span className="min-w-[30px] text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={(() => {
                            const currentProduct = products.find(p => p.id === item.id);
                            return !currentProduct || item.quantity >= currentProduct.stock;
                          })()}
                          className="h-8 w-8 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                        <button onClick={() => removeFromCart(item.id)} className="ml-2 h-8 px-2 rounded bg-red-600 text-white hover:bg-red-700" aria-label="Eliminar">🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 pt-4 mt-2">
                  <div className="flex items-center justify-between text-lg font-bold mb-3">
                    <span>Total:</span>
                    <span>{fmtCurrency(getCartTotal())}</span>
                  </div>
                  <button onClick={handleCheckout} className="btn w-full">💳 Proceder al Pago</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Store;
