export interface User {
    id: string;
    email: string;
    fullName: string;
    role: 'ADMIN' | 'USER';
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    categoryId: string;
    stockQuantity: number;
    minStockLevel: number;
    sku: string;
    createdAt: string;
    updatedAt: string;
}

export interface Category {
    id: string;
    name: string;
    description?: string;
    parentId?: string;
}

export interface Order {
    id: string;
    userId: string;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
    totalAmount: number;
    items: OrderItem[];
    createdAt: string;
    updatedAt: string;
}

export interface OrderItem {
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    priceAtTime: number;
}

export interface StockPrediction {
    id: string;
    productId: string;
    predictedDemand: number;
    confidenceLevel: number;
    predictionDate: string;
}

export interface DashboardMetrics {
    totalProducts: number;
    lowStockProducts: number;
    totalOrders: number;
    totalRevenue: number;
    monthlyStats: {
        month: string;
        orders: number;
        revenue: number;
    }[];
}
