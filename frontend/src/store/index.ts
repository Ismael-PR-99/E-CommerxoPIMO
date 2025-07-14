import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
    user: User | null;
    token: string | null;
    setAuth: (user: User, token: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    setAuth: (user: User, token: string) => set({ user, token }),
    logout: () => set({ user: null, token: null }),
}));

interface CartState {
    items: Array<{ productId: string; quantity: number }>;
    addItem: (productId: string, quantity: number) => void;
    removeItem: (productId: string) => void;
    clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
    items: [],
    addItem: (productId: string, quantity: number) =>
        set((state) => {
            const existingItem = state.items.find((item) => item.productId === productId);
            if (existingItem) {
                return {
                    items: state.items.map((item) =>
                        item.productId === productId
                            ? { ...item, quantity: item.quantity + quantity }
                            : item
                    ),
                };
            }
            return { items: [...state.items, { productId, quantity }] };
        }),
    removeItem: (productId: string) =>
        set((state) => ({
            items: state.items.filter((item) => item.productId !== productId),
        })),
    clearCart: () => set({ items: [] }),
}));
