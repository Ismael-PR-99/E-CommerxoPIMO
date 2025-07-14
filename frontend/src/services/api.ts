import axios from 'axios';
import { User, Product, StockPrediction } from '../types';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

const mlApi = axios.create({
    baseURL: import.meta.env.VITE_ML_API_URL,
});

// Interceptor para agregar el token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

mlApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Servicios de autenticación
export const authService = {
    login: async (email: string, password: string) => {
        const { data } = await api.post('/auth/login', { email, password });
        return data;
    },
    register: async (userData: Partial<User>) => {
        const { data } = await api.post('/auth/register', userData);
        return data;
    },
};

// Servicios de productos
export const productService = {
    getAll: async () => {
        const { data } = await api.get<Product[]>('/products');
        return data;
    },
    getById: async (id: string) => {
        const { data } = await api.get<Product>(`/products/${id}`);
        return data;
    },
    create: async (product: Partial<Product>) => {
        const { data } = await api.post<Product>('/products', product);
        return data;
    },
    update: async (id: string, product: Partial<Product>) => {
        const { data } = await api.put<Product>(`/products/${id}`, product);
        return data;
    },
    delete: async (id: string) => {
        await api.delete(`/products/${id}`);
    },
};

// Servicios de predicción de stock
export const predictionService = {
    getPredictions: async (productId: string) => {
        const { data } = await mlApi.get<StockPrediction[]>(`/predictions/${productId}`);
        return data;
    },
    generatePrediction: async (productId: string) => {
        const { data } = await mlApi.post<StockPrediction>('/predictions/generate', {
            productId,
        });
        return data;
    },
};
