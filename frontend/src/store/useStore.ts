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

// Datos de ejemplo - Productos de Charcutería y Aceites
const sampleProducts: Product[] = [
  {
    id: 1,
    name: "Carne Mechada Ibérica",
    description: "Deliciosa carne mechada de cerdo ibérico, curada artesanalmente con especias tradicionales",
    price: 24.99,
    stock: 15,
    sku: "CM-IBE-3225",
    category: "Charcutería"
  },
  {
    id: 2,
    name: "Chicharrón de Cádiz",
    description: "Auténtico chicharrón gaditano, cortado en lonchas finas, ideal para tapas",
    price: 18.99,
    stock: 25,
    sku: "CHI-CAD-3225",
    category: "Charcutería"
  },
  {
    id: 3,
    name: "Jamón Cocido Extra Premium",
    description: "Jamón cocido extra de primera calidad, 500g en lonchas finas perfectas",
    price: 12.99,
    stock: 40,
    sku: "JAM-COC-500G",
    category: "Jamones"
  },
  {
    id: 4,
    name: "Pechuga de Pavo Asada",
    description: "Pechuga de pavo asada, 400g de peso, ideal para bocadillos y platos ligeros",
    price: 15.99,
    stock: 30,
    sku: "PEC-PAV-400G",
    category: "Jamones"
  },
  {
    id: 5,
    name: "Chorizo Ibérico de Bellota",
    description: "Chorizo ibérico de bellota curado en bodegas tradicionales de Extremadura",
    price: 32.99,
    stock: 12,
    sku: "CHO-IBE-BELL",
    category: "Charcutería"
  },
  {
    id: 6,
    name: "Lomo Embuchado Ibérico",
    description: "Lomo embuchado ibérico de bellota, curado al natural durante 4 meses",
    price: 45.99,
    stock: 8,
    sku: "LOM-EMB-IBE",
    category: "Charcutería"
  },
  {
    id: 7,
    name: "Salchichón Ibérico Extra",
    description: "Salchichón ibérico extra curado, elaborado con las mejores carnes seleccionadas",
    price: 28.99,
    stock: 18,
    sku: "SAL-IBE-EXT",
    category: "Charcutería"
  },
  {
    id: 8,
    name: "Morcilla de Burgos",
    description: "Auténtica morcilla de Burgos, elaborada con arroz y especias tradicionales",
    price: 12.99,
    stock: 22,
    sku: "MOR-BUR-001",
    category: "Charcutería"
  },
  {
    id: 9,
    name: "Aceite de Oliva Virgen Extra Picual",
    description: "Aceite de oliva virgen extra variedad Picual, primera extracción en frío - 500ml",
    price: 19.99,
    stock: 50,
    sku: "AOL-PIC-500",
    category: "Aceites"
  },
  {
    id: 10,
    name: "Aceite de Oliva Virgen Extra Arbequina",
    description: "Aceite de oliva virgen extra variedad Arbequina, sabor suave y afrutado - 750ml",
    price: 24.99,
    stock: 35,
    sku: "AOL-ARB-750",
    category: "Aceites"
  },
  {
    id: 11,
    name: "Aceite de Oliva Ecológico Premium",
    description: "Aceite de oliva ecológico premium, certificado orgánico - 1 litro",
    price: 34.99,
    stock: 20,
    sku: "AOL-ECO-1L",
    category: "Aceites"
  },
  {
    id: 12,
    name: "Aceite de Oliva con Romero",
    description: "Aceite de oliva virgen extra aromatizado con romero natural - 250ml",
    price: 16.99,
    stock: 28,
    sku: "AOL-ROM-250",
    category: "Aceites"
  }
];

const sampleOrders: Order[] = [
  {
    id: 1,
    customerName: "María José Ruiz",
    total: 43.98,
    status: 'delivered',
    date: '2024-01-15T10:30:00Z',
    items: [
      { id: 1, name: "Carne Mechada Ibérica", quantity: 1, price: 24.99 },
      { id: 2, name: "Chicharrón de Cádiz", quantity: 1, price: 18.99 }
    ]
  },
  {
    id: 2,
    customerName: "Antonio García",
    total: 57.98,
    status: 'processing',
    date: '2024-01-16T14:20:00Z',
    items: [
      { id: 3, name: "Jamón Cocido Extra Premium", quantity: 2, price: 12.99 },
      { id: 4, name: "Chorizo Ibérico de Bellota", quantity: 1, price: 32.99 }
    ]
  },
  {
    id: 3,
    customerName: "Carmen López",
    total: 91.97,
    status: 'shipped',
    date: '2024-01-17T09:15:00Z',
    items: [
      { id: 5, name: "Lomo Embuchado Ibérico", quantity: 1, price: 45.99 },
      { id: 1, name: "Carne Mechada Ibérica", quantity: 1, price: 24.99 },
      { id: 2, name: "Chicharrón de Cádiz", quantity: 1, price: 18.99 }
    ]
  },
  {
    id: 4,
    customerName: "Francisco Moreno",
    total: 25.98,
    status: 'pending',
    date: '2024-01-18T16:45:00Z',
    items: [
      { id: 3, name: "Jamón Cocido Extra Premium", quantity: 2, price: 12.99 }
    ]
  },
  {
    id: 5,
    customerName: "Isabel Fernández",
    total: 78.98,
    status: 'delivered',
    date: '2024-01-19T11:20:00Z',
    items: [
      { id: 4, name: "Chorizo Ibérico de Bellota", quantity: 1, price: 32.99 },
      { id: 5, name: "Lomo Embuchado Ibérico", quantity: 1, price: 45.99 }
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
