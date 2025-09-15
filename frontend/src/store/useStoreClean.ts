import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product, Order, User } from '../types';

// Importar imágenes
import carneMechadaImg from '../assets/images/productos/carne-mechada.png';
import chicharronCadizImg from '../assets/images/productos/chicharron-de-cadiz.png';
import jamonCocidoImg from '../assets/images/productos/Jamon-cocido.png';
import pechugaPavoImg from '../assets/images/productos/pechuga-de-pavo-asada.png';

interface Store {
  // State
  products: Product[];
  orders: Order[];
  user: User | null;
  
  // Actions
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: number, updates: Partial<Product>) => void;
  deleteProduct: (id: number) => void;
  updateProductStock: (id: number, quantity: number) => void;
  updateOrderStatus: (id: number, status: Order['status']) => void;
  setUser: (user: User) => void;
}

// Datos de ejemplo - Productos de Charcutería y Aceites  
const sampleProducts: Product[] = [
  {
    id: 1,
    name: "Carne Mechada Ibérica",
    description: "Deliciosa carne mechada de cerdo ibérico, curada artesanalmente con especias tradicionales",
    price: 24.99,
    stock: 15,
    sku: "CM-IBE-3225",
    category: "Charcutería",
    imageUrl: carneMechadaImg
  },
  {
    id: 2,
    name: "Chicharrón de Cádiz",
    description: "Auténtico chicharrón gaditano, cortado en lonchas finas, ideal para tapas",
    price: 18.99,
    stock: 25,
    sku: "CHI-CAD-3225",
    category: "Charcutería",
    imageUrl: chicharronCadizImg
  },
  {
    id: 3,
    name: "Jamón Cocido Extra Premium",
    description: "Jamón cocido extra de primera calidad, 500g en lonchas finas perfectas",
    price: 12.99,
    stock: 40,
    sku: "JAM-COC-500G",
    category: "Jamones",
    imageUrl: jamonCocidoImg
  },
  {
    id: 4,
    name: "Pechuga de Pavo Asada",
    description: "Pechuga de pavo asada, 400g de peso, ideal para bocadillos y platos ligeros",
    price: 15.99,
    stock: 30,
    sku: "PEC-PAV-400G",
    category: "Jamones",
    imageUrl: pechugaPavoImg
  }
];

console.log('🔍 DEBUGGING IMAGES:', {
  carneMechadaImg,
  chicharronCadizImg,
  jamonCocidoImg,
  pechugaPavoImg
});

// Datos de ejemplo de órdenes
const sampleOrders: Order[] = [
  {
    id: 1,
    customerName: "María García",
    total: 62.97,
    status: "processing",
    date: "2024-12-01",
    items: [
      { id: 1, name: "Carne Mechada Ibérica", quantity: 2, price: 24.99 },
      { id: 3, name: "Jamón Cocido Extra Premium", quantity: 1, price: 12.99 }
    ]
  },
  {
    id: 2,
    customerName: "Carlos López",
    total: 56.97,
    status: "shipped",
    date: "2024-11-30",
    items: [
      { id: 2, name: "Chicharrón de Cádiz", quantity: 3, price: 18.99 }
    ]
  }
];

export const useStore = create<Store>()(
  persist(
    (set) => ({
      // Initial state
      products: sampleProducts,
      orders: sampleOrders,
      user: null,

      // Actions
      addProduct: (product) => set((state) => ({
        products: [...state.products, { ...product, id: Date.now() }]
      })),

      updateProduct: (id, updates) => set((state) => ({
        products: state.products.map(product => 
          product.id === id ? { ...product, ...updates } : product
        )
      })),

      deleteProduct: (id) => set((state) => ({
        products: state.products.filter(product => product.id !== id)
      })),

      updateProductStock: (id, quantity) => set((state) => ({
        products: state.products.map(product =>
          product.id === id ? { ...product, stock: Math.max(0, product.stock - quantity) } : product
        )
      })),

      updateOrderStatus: (id, status) => set((state) => ({
        orders: state.orders.map(order =>
          order.id === id ? { ...order, status, updatedAt: new Date() } : order
        )
      })),

      setUser: (user) => set({ user })
    }),
    {
      name: 'ecommerce-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        products: state.products,
        orders: state.orders,
        user: state.user 
      })
    }
  )
);