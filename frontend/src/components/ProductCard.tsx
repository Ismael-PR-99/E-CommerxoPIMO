import React from 'react';
import { fmtCurrency } from '../utils/format';
import { type ProductResponse } from '../services/products';
import { useCart } from '../context/CartContext';
import { Product } from '../types';

interface ProductCardProps {
  product: ProductResponse;
  showActions?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  showActions = true 
}) => {
  const { addToCart, isInCart, getItemQuantity } = useCart();
  
  const handleAddToCart = () => {
    if (product.active && product.stock > 0) {
      // Convertir ProductResponse a Product type que espera el cart
      const productForCart: Product = {
        id: product.id,
        name: product.name,
        price: product.price,
        description: product.description,
        category: product.category,
        stock: product.stock,
        sku: product.sku,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      };
      addToCart(productForCart);
    }
  };

  const getStockStatus = () => {
    if (product.stock === 0) return { text: 'Sin stock', color: 'text-red-500' };
    if (product.stock <= 10) return { text: `Stock: ${product.stock}`, color: 'text-yellow-500' };
    return { text: `Stock: ${product.stock}`, color: 'text-green-500' };
  };

  const stockStatus = getStockStatus();
  const inCart = isInCart(product.id);
  const cartQuantity = getItemQuantity(product.id);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 mt-1">SKU: {product.sku}</p>
          <p className="text-sm text-indigo-600 font-medium">{product.category}</p>
        </div>
        <div className="text-right ml-4">
          <p className="text-xl font-bold text-gray-900">
            {fmtCurrency(product.price)}
          </p>
          <p className={`text-sm font-medium ${stockStatus.color}`}>
            {stockStatus.text}
          </p>
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
        {product.description}
      </p>

      {showActions && (
        <div className="flex justify-between items-center">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            product.active 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {product.active ? 'Disponible' : 'No disponible'}
          </span>
          
          <button
            onClick={handleAddToCart}
            disabled={!product.active || product.stock === 0}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              !product.active || product.stock === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : inCart
                  ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
            }`}
          >
            {product.stock === 0 
              ? 'Sin stock' 
              : !product.active 
                ? 'No disponible'
                : inCart
                  ? `En carrito (${cartQuantity})`
                  : 'Añadir al carrito'
            }
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductCard;