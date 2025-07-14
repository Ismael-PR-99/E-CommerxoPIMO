import React from 'react';
import { useCartStore } from '../store';
import type { Product } from '../types';
import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/api';

export const ShoppingCart: React.FC = () => {
    const { items, removeItem, clearCart } = useCartStore();
    
    const { data: products } = useQuery<Product[]>({
        queryKey: ['products'],
        queryFn: productService.getAll
    });

    const getProduct = (productId: string) => {
        return products?.find(p => p.id.toString() === productId);
    };

    const calculateTotal = () => {
        return items.reduce((total, item) => {
            const product = getProduct(item.productId);
            return total + (product?.price || 0) * item.quantity;
        }, 0);
    };

    if (!products) return null;

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-6">Carrito de Compras</h2>

            {items.length === 0 ? (
                <p className="text-gray-500">El carrito está vacío</p>
            ) : (
                <>
                    <div className="space-y-4">
                        {items.map((item) => {
                            const product = getProduct(item.productId);
                            if (!product) return null;

                            return (
                                <div
                                    key={item.productId}
                                    className="flex items-center justify-between border-b pb-4"
                                >
                                    <div>
                                        <h3 className="font-medium">{product.name}</h3>
                                        <p className="text-sm text-gray-500">
                                            Cantidad: {item.quantity}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Precio unitario: ${product.price.toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <p className="font-medium">
                                            ${(product.price * item.quantity).toFixed(2)}
                                        </p>
                                        <button
                                            onClick={() => removeItem(item.productId)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-6 pt-4 border-t">
                        <div className="flex justify-between items-center mb-4">
                            <span className="font-medium">Total:</span>
                            <span className="text-xl font-bold">
                                ${calculateTotal().toFixed(2)}
                            </span>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => clearCart()}
                                className="px-4 py-2 text-red-600 border border-red-600 rounded hover:bg-red-50"
                            >
                                Vaciar carrito
                            </button>
                            <button
                                onClick={() => {/* Implementar checkout */}}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Proceder al pago
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
