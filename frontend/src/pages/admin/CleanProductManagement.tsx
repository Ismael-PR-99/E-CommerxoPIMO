import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';

const CleanProductManagement: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Log temporal para debug
  useEffect(() => {
    console.log('🏪 Admin - Products updated:', products.length, 'products');
    products.forEach(p => console.log(`📦 ${p.name}: Stock ${p.stock}`));
  }, [products]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    sku: ''
  });

  const categories = ['Electrónicos', 'Ropa', 'Hogar', 'Deportes', 'Libros', 'Juguetes'];

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      category: '',
      sku: ''
    });
    setEditingProduct(null);
    setShowAddForm(false);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.price || !formData.stock) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    const productData = {
      id: editingProduct ? editingProduct.id : Date.now(),
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      category: formData.category,
      sku: formData.sku || `SKU-${Date.now()}`
    };

    if (editingProduct) {
      updateProduct(productData);
    } else {
      addProduct(productData);
    }

    resetForm();
  };

  const handleEdit = (product: any) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category,
      sku: product.sku || ''
    });
    setEditingProduct(product);
    setShowAddForm(true);
  };

  return (
    <div style={{
      width: '100%',
      paddingBottom: '2rem'
    }}>
      {/* Header con gradiente */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #333333 100%)',
        padding: '2rem',
        marginBottom: '2rem',
        borderRadius: '15px',
        color: 'white',
        border: '1px solid #404040'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '800',
          color: 'white',
          margin: '0 0 0.5rem 0',
          textAlign: 'center'
        }}>
          🛍️ Gestión de Productos
        </h1>
        <p style={{
          fontSize: '1.1rem',
          color: 'rgba(255, 255, 255, 0.8)',
          textAlign: 'center',
          margin: '0'
        }}>
          Administra tu inventario de manera eficiente
        </p>
      </div>

      <div style={{ width: '100%' }}>
        
        {/* Estadísticas modernas */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
            padding: '2rem',
            borderRadius: '20px',
            color: 'white',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            border: '1px solid #404040'
          }}>
            <div style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '0.5rem' }}>
              {products.length}
            </div>
            <div style={{ fontSize: '1.1rem', opacity: 0.8 }}>
              📦 Productos Totales
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #404040 0%, #1a1a1a 100%)',
            padding: '2rem',
            borderRadius: '20px',
            color: 'white',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            border: '1px solid #666666'
          }}>
            <div style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '0.5rem' }}>
              {products.filter(p => p.stock <= 10).length}
            </div>
            <div style={{ fontSize: '1.1rem', opacity: 0.8 }}>
              ⚠️ Stock Bajo
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #666666 0%, #333333 100%)',
            padding: '2rem',
            borderRadius: '20px',
            color: 'white',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            border: '1px solid #808080'
          }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '0.5rem' }}>
              ${products.reduce((sum, p) => sum + (p.price * p.stock), 0).toLocaleString()}
            </div>
            <div style={{ fontSize: '1.1rem', opacity: 0.8 }}>
              💰 Valor Total
            </div>
          </div>
        </div>

        {/* Controles mejorados */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          padding: '1.5rem',
          borderRadius: '15px',
          marginBottom: '2rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap',
          border: '1px solid #e0e0e0',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
        }}>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              background: showAddForm 
                ? 'linear-gradient(135deg, #666666 0%, #333333 100%)'
                : 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '50px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)'
            }}
          >
            {showAddForm ? '❌ Cancelar' : '➕ Nuevo Producto'}
          </button>

          <button
            onClick={() => {
              console.log('Debug - Current products:', products);
              alert(`Debug: Tienes ${products.length} productos. Ver consola para detalles.`);
            }}
            style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '50px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 5px 15px rgba(79, 70, 229, 0.3)'
            }}
          >
            🔍 Debug Stock
          </button>

          <input
            type="text"
            placeholder="🔍 Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              minWidth: '300px',
              padding: '1rem 1.5rem',
              border: 'none',
              borderRadius: '25px',
              fontSize: '1rem',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(5px)',
              outline: 'none'
            }}
          />
        </div>

        {/* Formulario moderno */}
        {showAddForm && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            padding: '2rem',
            borderRadius: '15px',
            marginBottom: '2rem',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              marginBottom: '1.5rem',
              color: '#333'
            }}>
              {editingProduct ? '✏️ Editar Producto' : '➕ Nuevo Producto'}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#555' }}>
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    border: 'none',
                    borderRadius: '15px',
                    fontSize: '1rem',
                    background: 'rgba(255, 255, 255, 0.8)',
                    outline: 'none'
                  }}
                  placeholder="Ej: iPhone 15 Pro Max"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#555' }}>
                  Precio ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    border: 'none',
                    borderRadius: '15px',
                    fontSize: '1rem',
                    background: 'rgba(255, 255, 255, 0.8)',
                    outline: 'none'
                  }}
                  placeholder="999.99"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#555' }}>
                  Stock *
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    border: 'none',
                    borderRadius: '15px',
                    fontSize: '1rem',
                    background: 'rgba(255, 255, 255, 0.8)',
                    outline: 'none'
                  }}
                  placeholder="100"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#555' }}>
                  Categoría
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    border: 'none',
                    borderRadius: '15px',
                    fontSize: '1rem',
                    background: 'rgba(255, 255, 255, 0.8)',
                    outline: 'none'
                  }}
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#555' }}>
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: 'none',
                  borderRadius: '15px',
                  fontSize: '1rem',
                  background: 'rgba(255, 255, 255, 0.8)',
                  outline: 'none',
                  minHeight: '100px',
                  resize: 'vertical'
                }}
                placeholder="Descripción del producto..."
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button
                onClick={handleSubmit}
                style={{
                  background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 2rem',
                  borderRadius: '50px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)'
                }}
              >
                {editingProduct ? '💾 Actualizar' : '➕ Agregar'}
              </button>
              <button
                onClick={resetForm}
                style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  color: '#333',
                  border: '2px solid #ddd',
                  padding: '1rem 2rem',
                  borderRadius: '50px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                ❌ Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Lista de productos moderna */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
          gap: '2rem',
          marginBottom: '3rem'
        }}>
          {filteredProducts.map(product => (
            <div
              key={product.id}
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                padding: '2rem',
                borderRadius: '15px',
                position: 'relative',
                border: product.stock <= 10 ? '2px solid #666666' : '1px solid rgba(0, 0, 0, 0.1)',
                boxShadow: product.stock <= 10 
                  ? '0 5px 15px rgba(0, 0, 0, 0.3)'
                  : '0 5px 15px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
            >
              {product.stock <= 10 && (
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'linear-gradient(135deg, #333333 0%, #1a1a1a 100%)',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '50px',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.4)',
                  border: '1px solid #666666'
                }}>
                  ⚠️ Stock Bajo
                </div>
              )}

              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{
                  fontSize: '1.4rem',
                  fontWeight: '700',
                  color: '#333',
                  margin: '0 0 0.5rem 0',
                  paddingRight: '5rem'
                }}>
                  {product.name}
                </h3>
                <p style={{
                  color: '#666',
                  fontSize: '0.95rem',
                  margin: '0',
                  lineHeight: '1.5'
                }}>
                  {product.description}
                </p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                  color: 'white',
                  padding: '1rem',
                  borderRadius: '15px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                    ${product.price.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                    💰 Precio
                  </div>
                </div>

                <div style={{
                  background: product.stock <= 10 
                    ? 'linear-gradient(135deg, #666666 0%, #333333 100%)'
                    : 'linear-gradient(135deg, #404040 0%, #1a1a1a 100%)',
                  color: 'white',
                  padding: '1rem',
                  borderRadius: '15px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                    {product.stock}
                  </div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                    📦 Stock
                  </div>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, #e5e5e5 0%, #cccccc 100%)',
                  color: '#333',
                  padding: '1rem',
                  borderRadius: '15px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1rem', fontWeight: '700' }}>
                    {product.category}
                  </div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                    🏷️ Categoría
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => handleEdit(product)}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '1rem',
                    borderRadius: '15px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => {
                    if (confirm(`¿Eliminar "${product.name}"?`)) {
                      deleteProduct(product.id);
                    }
                  }}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #666666 0%, #333333 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '1rem',
                    borderRadius: '15px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.4)'
                  }}
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            padding: '3rem 2rem',
            borderRadius: '15px',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📦</div>
            <h3 style={{ fontSize: '1.5rem', color: '#333', marginBottom: '1rem' }}>
              No se encontraron productos
            </h3>
            <p style={{ color: '#666', fontSize: '1.1rem' }}>
              {searchTerm
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Comienza agregando tu primer producto'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CleanProductManagement;
