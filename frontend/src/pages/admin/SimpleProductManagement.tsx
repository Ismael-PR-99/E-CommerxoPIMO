import React, { useState } from 'react';
import { useStore } from '../../store/useStore';

const SimpleProductManagement: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

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
      sku: formData.sku || `SKU-${Date.now()}`,
      imageUrl: 'https://via.placeholder.com/200x200?text=' + encodeURIComponent(formData.name)
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
      padding: '24px', 
      maxWidth: '1400px', 
      margin: '0 auto',
      minHeight: '100vh'
    }}>
      {/* Header mejorado */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '32px', 
          color: '#1f2937', 
          margin: '0 0 8px 0', 
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          🏪 Gestión de Productos
        </h1>
        <p style={{ color: '#6b7280', fontSize: '16px', margin: 0 }}>
          Administra el inventario de tu tienda
        </p>
      </div>

      {/* Estadísticas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '28px', color: '#3B82F6' }}>
            {products.length}
          </h3>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Total Productos</p>
        </div>
        <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '28px', color: '#EF4444' }}>
            {products.filter(p => p.stock <= 10).length}
          </h3>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Stock Bajo</p>
        </div>
        <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '28px', color: '#10B981' }}>
            ${products.reduce((sum, p) => sum + (p.price * p.stock), 0).toLocaleString()}
          </h3>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Valor Inventario</p>
        </div>
      </div>

      {/* Controles */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            padding: '12px 24px',
            background: showAddForm ? '#6B7280' : '#10B981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}
        >
          {showAddForm ? '❌ Cancelar' : '➕ Nuevo Producto'}
        </button>

        <input
          type="text"
          placeholder="🔍 Buscar productos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            minWidth: '250px',
            padding: '12px 16px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            transition: 'border-color 0.3s ease'
          }}
        />
      </div>

      {/* Formulario */}
      {showAddForm && (
        <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#333' }}>
            {editingProduct ? '✏️ Editar Producto' : '➕ Agregar Nuevo Producto'}
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                Nombre del Producto *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  transition: 'border-color 0.3s ease'
                }}
                placeholder="Ej: iPhone 15 Pro Max"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                Precio ($) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                placeholder="999.99"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                Stock *
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                placeholder="50"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                Categoría
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                <option value="">Seleccionar categoría</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                minHeight: '100px',
                resize: 'vertical'
              }}
              placeholder="Descripción detallada del producto..."
            />
          </div>

          <div style={{ marginTop: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
              SKU (Opcional)
            </label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px'
              }}
              placeholder="SKU único del producto"
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button
              onClick={handleSubmit}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #10B981, #059669)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
            >
              {editingProduct ? '💾 Actualizar' : '➕ Agregar'}
            </button>
            <button
              onClick={resetForm}
              style={{
                padding: '12px 24px',
                background: '#6B7280',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              ❌ Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de productos */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '20px'
      }}>
        {filteredProducts.map(product => (
          <div 
            key={product.id} 
            className="glass-card" 
            style={{
              padding: '24px',
              border: product.stock <= 10 ? '2px solid #EF444450' : '2px solid #e5e7eb',
              borderRadius: '12px',
              background: '#ffffff',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              transition: 'all 0.3s ease',
              position: 'relative',
              cursor: 'pointer'
            }}
          >
            {product.stock <= 10 && (
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)'
              }}>
                ⚠️ Stock Bajo
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ 
                margin: '0 0 8px 0', 
                fontSize: '18px', 
                color: '#1F2937',
                fontWeight: '600'
              }}>
                {product.name}
              </h3>
              <p style={{ 
                margin: '0 0 12px 0', 
                fontSize: '14px', 
                color: '#6B7280',
                lineHeight: '1.5'
              }}>
                {product.description}
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
                <div style={{ 
                  padding: '8px 12px', 
                  background: '#F3F4F6', 
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span style={{ color: '#059669', fontWeight: '600' }}>💰</span>
                  <span style={{ fontWeight: '600', color: '#1F2937' }}>
                    ${product.price.toFixed(2)}
                  </span>
                </div>
                
                <div style={{ 
                  padding: '8px 12px', 
                  background: product.stock <= 10 ? '#FEF2F2' : '#F0FDF4', 
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span style={{ color: product.stock <= 10 ? '#EF4444' : '#059669', fontWeight: '600' }}>📦</span>
                  <span style={{ 
                    fontWeight: '600', 
                    color: product.stock <= 10 ? '#EF4444' : '#059669'
                  }}>
                    {product.stock} unidades
                  </span>
                </div>

                <div style={{ 
                  padding: '8px 12px', 
                  background: '#F3F4F6', 
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  gridColumn: '1 / -1'
                }}>
                  <span style={{ color: '#8B5CF6' }}>🏷️</span>
                  <span style={{ fontSize: '13px', color: '#6B7280' }}>
                    {product.category || 'Sin categoría'}
                  </span>
                  {product.sku && (
                    <>
                      <span style={{ margin: '0 4px', color: '#D1D5DB' }}>•</span>
                      <span style={{ fontSize: '13px', color: '#6B7280' }}>
                        SKU: {product.sku}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button
                onClick={() => handleEdit(product)}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
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
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                🗑️ Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="glass-card" style={{ padding: '60px 40px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#6B7280' }}>
            No se encontraron productos
          </h3>
          <p style={{ margin: 0, color: '#9CA3AF' }}>
            {searchTerm 
              ? 'Intenta ajustar el término de búsqueda'
              : 'Comienza agregando tu primer producto a la tienda'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default SimpleProductManagement;
