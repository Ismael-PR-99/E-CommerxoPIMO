import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Product as StoreProduct } from '../../types';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image: string;
  featured: boolean;
  sku: string;
}

interface NewProduct {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  image: string;
  featured: boolean;
}

const ProductManagement: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const [newProduct, setNewProduct] = useState<NewProduct>({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    image: '',
    featured: false
  });

  const categories = ['Electrónicos', 'Ropa', 'Hogar', 'Deportes', 'Libros', 'Juguetes'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    const product: Product = {
      id: Date.now(),
      name: newProduct.name,
      description: newProduct.description,
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock),
      category: newProduct.category,
      image: newProduct.image || 'https://via.placeholder.com/200x200?text=Producto',
      featured: newProduct.featured,
      sku: `SKU-${Date.now()}`
    };

    addProduct(product);
    setNewProduct({
      name: '',
      description: '',
      price: '',
      stock: '',
      category: '',
      image: '',
      featured: false
    });
    setShowAddForm(false);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category,
      image: product.image,
      featured: product.featured
    });
    setShowAddForm(true);
  };

  const handleUpdateProduct = () => {
    if (!editingProduct) return;

    const updatedProduct: Product = {
      ...editingProduct,
      name: newProduct.name,
      description: newProduct.description,
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock),
      category: newProduct.category,
      image: newProduct.image,
      featured: newProduct.featured
    };

    updateProduct(updatedProduct);
    setEditingProduct(null);
    setNewProduct({
      name: '',
      description: '',
      price: '',
      stock: '',
      category: '',
      image: '',
      featured: false
    });
    setShowAddForm(false);
  };

  const ProductCard = ({ product }: { product: Product }) => (
    <div className="glass-card" style={{
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      position: 'relative',
      border: product.stock <= 10 ? '2px solid #EF444450' : '1px solid #e9ecef'
    }}>
      {product.stock <= 10 && (
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: '#EF4444',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '500'
        }}>
          Stock Bajo
        </div>
      )}
      
      <div style={{ display: 'flex', gap: '16px' }}>
        <img 
          src={product.image} 
          alt={product.name}
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '8px',
            objectFit: 'cover',
            background: '#f8f9fa'
          }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', color: '#333' }}>{product.name}</h3>
            {product.featured && (
              <span style={{
                background: '#F59E0B',
                color: 'white',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '500'
              }}>
                ⭐ Destacado
              </span>
            )}
          </div>
          <p style={{ 
            margin: '0 0 12px 0', 
            fontSize: '14px', 
            color: '#666',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            {product.description}
          </p>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', fontSize: '14px' }}>
            <span style={{ color: '#333', fontWeight: '500' }}>
              💰 ${product.price.toFixed(2)}
            </span>
            <span style={{ 
              color: product.stock <= 10 ? '#EF4444' : '#10B981',
              fontWeight: '500'
            }}>
              📦 {product.stock} unidades
            </span>
            <span style={{ color: '#666' }}>
              🏷️ {product.category}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => handleEditProduct(product)}
          style={{
            flex: 1,
            padding: '8px 16px',
            background: '#3B82F6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'background 0.2s'
          }}
        >
          ✏️ Editar
        </button>
        <button
          onClick={() => {
            if (confirm(`¿Estás seguro de eliminar "${product.name}"?`)) {
              deleteProduct(product.id);
            }
          }}
          style={{
            flex: 1,
            padding: '8px 16px',
            background: '#EF4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'background 0.2s'
          }}
        >
          🗑️ Eliminar
        </button>
      </div>
    </div>
  );

  const ProductForm = () => (
    <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
      <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#333' }}>
        {editingProduct ? '✏️ Editar Producto' : '➕ Agregar Nuevo Producto'}
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#333' }}>
            Nombre del Producto *
          </label>
          <input
            type="text"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px'
            }}
            placeholder="Ej: iPhone 15 Pro"
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#333' }}>
            Precio *
          </label>
          <input
            type="number"
            step="0.01"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px'
            }}
            placeholder="0.00"
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#333' }}>
            Stock *
          </label>
          <input
            type="number"
            value={newProduct.stock}
            onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px'
            }}
            placeholder="0"
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#333' }}>
            Categoría
          </label>
          <select
            value={newProduct.category}
            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '6px',
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
        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#333' }}>
          Descripción
        </label>
        <textarea
          value={newProduct.description}
          onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '14px',
            minHeight: '80px',
            resize: 'vertical'
          }}
          placeholder="Descripción detallada del producto"
        />
      </div>

      <div style={{ marginTop: '16px' }}>
        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#333' }}>
          URL de Imagen
        </label>
        <input
          type="url"
          value={newProduct.image}
          onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '14px'
          }}
          placeholder="https://ejemplo.com/imagen.jpg"
        />
      </div>

      <div style={{ marginTop: '16px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={newProduct.featured}
            onChange={(e) => setNewProduct({ ...newProduct, featured: e.target.checked })}
          />
          <span style={{ fontSize: '14px', color: '#333' }}>⭐ Producto destacado</span>
        </label>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
        <button
          onClick={editingProduct ? handleUpdateProduct : handleAddProduct}
          style={{
            padding: '12px 24px',
            background: '#10B981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          {editingProduct ? '💾 Actualizar Producto' : '➕ Agregar Producto'}
        </button>
        <button
          onClick={() => {
            setShowAddForm(false);
            setEditingProduct(null);
            setNewProduct({
              name: '',
              description: '',
              price: '',
              stock: '',
              category: '',
              image: '',
              featured: false
            });
          }}
          style={{
            padding: '12px 24px',
            background: '#6B7280',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          ❌ Cancelar
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', color: '#333', margin: '0 0 8px 0', fontWeight: '700' }}>
          📦 Gestión de Productos
        </h1>
        <p style={{ color: '#666', fontSize: '16px', margin: 0 }}>
          Administra el catálogo de tu tienda
        </p>
      </div>

      {/* Estadísticas rápidas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '24px', color: '#3B82F6' }}>
            {products.length}
          </h3>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Total Productos</p>
        </div>
        <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '24px', color: '#EF4444' }}>
            {products.filter(p => p.stock <= 10).length}
          </h3>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Stock Bajo</p>
        </div>
        <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '24px', color: '#F59E0B' }}>
            {products.filter(p => p.stock <= 5).length}
          </h3>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Destacados</p>
        </div>
        <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '24px', color: '#10B981' }}>
            ${products.reduce((sum, p) => sum + (p.price * p.stock), 0).toFixed(2)}
          </h3>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Valor Total Inventario</p>
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
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
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
            minWidth: '200px',
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        />

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        >
          <option value="all">Todas las categorías</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Formulario de producto */}
      {showAddForm && <ProductForm />}

      {/* Lista de productos */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
        gap: '20px'
      }}>
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#666' }}>No se encontraron productos</h3>
          <p style={{ margin: 0, color: '#888' }}>
            {searchTerm || filterCategory !== 'all' 
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Comienza agregando tu primer producto'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
