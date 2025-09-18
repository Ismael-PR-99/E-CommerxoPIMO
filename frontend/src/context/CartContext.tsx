import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types';

// Tipos para el carrito
export interface CartItem {
  productId: number;
  product: Product;
  quantity: number;
  subtotal: number;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: number) => boolean;
  getItemQuantity: (productId: number) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'ecommerce-cart';

// Hook para usar el contexto del carrito
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Cargar carrito desde localStorage al inicializar
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart);
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [items]);

  // Calcular totales
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const totalAmount = items.reduce((total, item) => total + item.subtotal, 0);

  // Agregar producto al carrito
  const addToCart = (product: Product, quantity = 1) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.productId === product.id);
      
      if (existingItem) {
        // Si el producto ya está en el carrito, aumentar cantidad
        return currentItems.map(item =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                subtotal: (item.quantity + quantity) * product.price
              }
            : item
        );
      } else {
        // Si es un producto nuevo, agregarlo
        const newItem: CartItem = {
          productId: product.id,
          product,
          quantity,
          subtotal: quantity * product.price
        };
        return [...currentItems, newItem];
      }
    });
  };

  // Eliminar producto del carrito completamente
  const removeFromCart = (productId: number) => {
    setItems(currentItems => 
      currentItems.filter(item => item.productId !== productId)
    );
  };

  // Actualizar cantidad de un producto
  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems(currentItems =>
      currentItems.map(item =>
        item.productId === productId
          ? {
              ...item,
              quantity,
              subtotal: quantity * item.product.price
            }
          : item
      )
    );
  };

  // Limpiar carrito
  const clearCart = () => {
    setItems([]);
  };

  // Verificar si un producto está en el carrito
  const isInCart = (productId: number) => {
    return items.some(item => item.productId === productId);
  };

  // Obtener cantidad de un producto específico
  const getItemQuantity = (productId: number) => {
    const item = items.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  };

  const value: CartContextType = {
    items,
    totalItems,
    totalAmount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    getItemQuantity
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};