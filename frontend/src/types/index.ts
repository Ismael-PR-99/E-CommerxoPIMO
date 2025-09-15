// User types
export interface User {
  id: number;
  email: string;
  name: string;
  fullName?: string;
  role: 'ADMIN' | 'USER';
}

// Product types
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  categoryId?: string;
  stock: number;
  stockQuantity?: number;
  minStockLevel?: number;
  sku: string;
  // Ya no necesitamos imageUrl porque usamos SimpleProductImage
  // que funciona directamente con el nombre del producto
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Category types
export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
}

// Order types
export interface Order {
  id: number;
  customerName: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  date: string;
  userId?: string;
  items: Array<{
    id: number;
    name: string;
    quantity: number;
    price: number;
  }>;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  priceAtTime: number;
}

// ML types
export interface StockPrediction {
  id: string;
  productId: string;
  predictedDemand: number;
  confidenceLevel: number;
  predictionDate: string;
  periodStart: string;
  periodEnd: string;
}

// Dashboard types
export interface DashboardMetrics {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  lowStockProducts: number;
  pendingOrders: number;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
