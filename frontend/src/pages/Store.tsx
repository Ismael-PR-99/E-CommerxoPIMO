import React, { useState } from 'react';
import { useStore } from '../store/useStore';

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

  const categories = ['all', 'Electrónicos', 'Ropa', 'Hogar', 'Deportes', 'Libros', 'Juguetes'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory && product.stock > 0;
  });

  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      // Verificar que no exceda el stock actual del producto
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
        setCart([...cart, {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          stock: product.stock
        }]);
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

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }
    
    // Validar que todos los productos en el carrito tengan stock suficiente
    const outOfStock = cart.find(item => {
      const currentProduct = products.find(p => p.id === item.id);
      return !currentProduct || currentProduct.stock < item.quantity;
    });
    
    if (outOfStock) {
      alert(`El producto "${outOfStock.name}" no tiene suficiente stock disponible. Por favor, actualiza tu carrito.`);
      return;
    }
    
    // Actualizar el stock de todos los productos en el carrito
    cart.forEach(item => {
      updateProductStock(item.id, item.quantity);
    });
    
    // Aquí normalmente harías la integración con un sistema de pago
    alert(`¡Gracias por tu compra! Total: $${getCartTotal().toFixed(2)}\n\nEl stock ha sido actualizado automáticamente.`);
    setCart([]);
    setShowCart(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
    }}>
      {/* Header de la Tienda */}
      <header style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        color: 'white',
        padding: '1rem 0',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            margin: 0
          }}>
            🛒 E-CommerxoPIMO Store
          </h1>
          
          <button
            onClick={() => setShowCart(!showCart)}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              position: 'relative',
              transition: 'all 0.3s ease'
            }}
          >
            🛒 Carrito ({getCartItemsCount()})
            {getCartItemsCount() > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                background: '#ef4444',
                color: 'white',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {getCartItemsCount()}
              </span>
            )}
          </button>
          
          <button
            onClick={() => {
              console.log('Debug Store - Current products:', products);
              if (products.length > 0) {
                console.log('First product stock:', products[0].stock);
                updateProductStock(products[0].id, 1);
                console.log('After reducing 1 from first product');
              }
            }}
            style={{
              background: 'rgba(79, 70, 229, 0.2)',
              border: 'none',
              color: '#4f46e5',
              padding: '0.75rem 1.5rem',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600'
            }}
          >
            🔍 Test Stock
          </button>
        </div>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        
        {/* Barra de búsqueda y filtros */}
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '15px',
          marginBottom: '2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <input
            type="text"
            placeholder="🔍 Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              minWidth: '300px',
              padding: '1rem',
              border: '2px solid #e5e7eb',
              borderRadius: '10px',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '1rem',
              border: '2px solid #e5e7eb',
              borderRadius: '10px',
              fontSize: '1rem',
              outline: 'none',
              minWidth: '200px'
            }}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'Todas las categorías' : category}
              </option>
            ))}
          </select>
        </div>

        {/* Grid de Productos */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {filteredProducts.map(product => (
            <div
              key={product.id}
              style={{
                background: 'white',
                borderRadius: '15px',
                padding: '1.5rem',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                border: '1px solid #e5e7eb'
              }}
            >
              {/* Imagen placeholder */}
              <div style={{
                width: '100%',
                height: '200px',
                background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                borderRadius: '10px',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem'
              }}>
                📦
              </div>

              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                margin: '0 0 0.5rem 0',
                color: '#1f2937'
              }}>
                {product.name}
              </h3>

              <p style={{
                color: '#6b7280',
                fontSize: '0.9rem',
                margin: '0 0 1rem 0',
                lineHeight: '1.4'
              }}>
                {product.description}
              </p>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                <div>
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: '#1f2937'
                  }}>
                    ${product.price.toFixed(2)}
                  </div>
                  <div style={{
                    fontSize: '0.8rem',
                    color: product.stock <= 10 ? '#ef4444' : '#10b981'
                  }}>
                    Stock: {product.stock} disponibles
                  </div>
                </div>

                <div style={{
                  background: '#f3f4f6',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  {product.category}
                </div>
              </div>

              <button
                onClick={() => addToCart(product)}
                disabled={product.stock === 0}
                style={{
                  width: '100%',
                  background: product.stock === 0 
                    ? '#9ca3af' 
                    : 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '1rem',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {product.stock === 0 ? '❌ Agotado' : '🛒 Agregar al Carrito'}
              </button>
            </div>
          ))}
        </div>

        {/* Mensaje si no hay productos */}
        {filteredProducts.length === 0 && (
          <div style={{
            background: 'white',
            padding: '3rem',
            borderRadius: '15px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
            <h3 style={{ fontSize: '1.5rem', color: '#374151', marginBottom: '0.5rem' }}>
              No se encontraron productos
            </h3>
            <p style={{ color: '#6b7280' }}>
              Intenta ajustar los filtros de búsqueda
            </p>
          </div>
        )}
      </div>

      {/* Carrito Modal */}
      {showCart && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                🛒 Tu Carrito
              </h2>
              <button
                onClick={() => setShowCart(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer'
                }}
              >
                ❌
              </button>
            </div>

            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
                <p style={{ color: '#6b7280' }}>Tu carrito está vacío</p>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '1.5rem' }}>
                  {cart.map(item => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '10px',
                        marginBottom: '0.5rem'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem' }}>
                          {item.name}
                        </h4>
                        <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>
                          ${item.price.toFixed(2)} c/u
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          style={{
                            background: '#f3f4f6',
                            border: 'none',
                            borderRadius: '5px',
                            width: '30px',
                            height: '30px',
                            cursor: 'pointer'
                          }}
                        >
                          -
                        </button>
                        
                        <span style={{ minWidth: '30px', textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={(() => {
                            const currentProduct = products.find(p => p.id === item.id);
                            return !currentProduct || item.quantity >= currentProduct.stock;
                          })()}
                          style={{
                            background: (() => {
                              const currentProduct = products.find(p => p.id === item.id);
                              return (!currentProduct || item.quantity >= currentProduct.stock) ? '#d1d5db' : '#f3f4f6';
                            })(),
                            border: 'none',
                            borderRadius: '5px',
                            width: '30px',
                            height: '30px',
                            cursor: (() => {
                              const currentProduct = products.find(p => p.id === item.id);
                              return (!currentProduct || item.quantity >= currentProduct.stock) ? 'not-allowed' : 'pointer';
                            })()
                          }}
                        >
                          +
                        </button>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          style={{
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            padding: '0.25rem 0.5rem',
                            cursor: 'pointer',
                            marginLeft: '0.5rem'
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{
                  borderTop: '2px solid #e5e7eb',
                  paddingTop: '1rem',
                  marginTop: '1rem'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    marginBottom: '1rem'
                  }}>
                    <span>Total:</span>
                    <span>${getCartTotal().toFixed(2)}</span>
                  </div>

                  <button
                    onClick={handleCheckout}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '1rem',
                      borderRadius: '10px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    💳 Proceder al Pago
                  </button>
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
