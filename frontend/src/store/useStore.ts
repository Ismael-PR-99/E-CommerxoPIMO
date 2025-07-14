import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product, Order, User } from '../types';

interface Store {
  // State
  products: Product[];
  orders: Order[];
  user: User | null;
  
  // Actions
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: number) => void;
  updateProductStock: (id: number, quantity: number) => void;
  updateOrderStatus: (id: number, status: Order['status']) => void;
  setUser: (user: User) => void;
}

// Datos de ejemplo
const sampleProducts: Product[] = [
  {
    id: 1,
    name: "Laptop Dell XPS 13",
    description: "Laptop ultraligera con procesador Intel i7 y 16GB RAM",
    price: 1299.99,
    stock: 15,
    sku: "DELL-XPS13-001",
    category: "Laptops",
    imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=200&fit=crop"
  },
  {
    id: 2,
    name: "iPhone 14 Pro",
    description: "Smartphone Apple con cámara avanzada y chip A16",
    price: 999.99,
    stock: 8,
    sku: "APPLE-IP14P-001",
    category: "Smartphones",
    imageUrl: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=200&fit=crop"
  },
  {
    id: 3,
    name: "Monitor Samsung 27\"",
    description: "Monitor 4K UHD con panel IPS y 144Hz",
    price: 399.99,
    stock: 22,
    sku: "SAM-MON27-001",
    category: "Monitores",
    imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=200&fit=crop"
  },
  {
    id: 4,
    name: "Teclado Mecánico RGB",
    description: "Teclado gaming con switches Cherry MX Blue",
    price: 129.99,
    stock: 45,
    sku: "MECH-KB-RGB-001",
    category: "Accesorios",
    imageUrl: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=300&h=200&fit=crop"
  },
  {
    id: 5,
    name: "Auriculares Sony WH-1000XM4",
    description: "Auriculares inalámbricos con cancelación de ruido",
    price: 299.99,
    stock: 3,
    sku: "SONY-WH1000-001",
    category: "Audio",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop"
  }
];

const sampleOrders: Order[] = [
  {
    id: 1,
    customerName: "Juan Pérez",
    total: 1429.98,
    status: 'delivered',
    date: '2024-01-15T10:30:00Z',
    items: [
      { id: 1, name: "Laptop Dell XPS 13", quantity: 1, price: 1299.99 },
      { id: 4, name: "Teclado Mecánico RGB", quantity: 1, price: 129.99 }
    ]
  },
  {
    id: 2,
    customerName: "María García",
    total: 999.99,
    status: 'processing',
    date: '2024-01-16T14:20:00Z',
    items: [
      { id: 2, name: "iPhone 14 Pro", quantity: 1, price: 999.99 }
    ]
  },
  {
    id: 3,
    customerName: "Carlos López",
    total: 729.98,
    status: 'shipped',
    date: '2024-01-17T09:15:00Z',
    items: [
      { id: 3, name: "Monitor Samsung 27\"", quantity: 1, price: 399.99 },
      { id: 5, name: "Auriculares Sony WH-1000XM4", quantity: 1, price: 299.99 }
    ]
  },
  {
    id: 4,
    customerName: "Ana Martínez",
    total: 129.99,
    status: 'pending',
    date: '2024-01-18T16:45:00Z',
    items: [
      { id: 4, name: "Teclado Mecánico RGB", quantity: 1, price: 129.99 }
    ]
  }
];

const sampleUser: User = {
  id: 1,
  name: "Administrador",
  email: "admin@ecommerxo.com",
  role: "ADMIN"
};

export const useStore = create<Store>()(
  persist(
    (set) => ({
      // Initial state
      products: sampleProducts,
      orders: sampleOrders,
      user: sampleUser,
      
      // Actions
      addProduct: (product: Product) =>
        set((state) => ({
          products: [...state.products, product]
        })),
        
      updateProduct: (updatedProduct: Product) =>
        set((state) => ({
          products: state.products.map((product) =>
            product.id === updatedProduct.id ? updatedProduct : product
          )
        })),
        
      deleteProduct: (id: number) =>
        set((state) => ({
          products: state.products.filter((product) => product.id !== id)
        })),
        
      updateProductStock: (id: number, quantity: number) => {
        console.log(`🔄 Attempting to update stock for product ID: ${id}, reducing by: ${quantity}`);
        set((state) => {
          const productBefore = state.products.find(p => p.id === id);
          console.log(`📦 Product before update:`, productBefore);
          
          const updatedProducts = state.products.map((product) =>
            product.id === id 
              ? { ...product, stock: Math.max(0, product.stock - quantity) }
              : product
          );
          
          const productAfter = updatedProducts.find(p => p.id === id);
          console.log(`📦 Product after update:`, productAfter);
          console.log(`✅ Stock update completed`);
          
          return { products: updatedProducts };
        });
      },
        
      updateOrderStatus: (id: number, status: Order['status']) =>
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === id ? { ...order, status } : order
          )
        })),
        
      setUser: (user: User) =>
        set(() => ({
          user
        }))
    }),
    {
      name: 'ecommerce-storage', // nombre único para localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        products: state.products,
        orders: state.orders 
      }), // solo persistir products y orders, no user
    }
  )
);
