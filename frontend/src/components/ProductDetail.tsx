import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/api';
import { useCartStore } from '../store';
import type { Product } from '../types';

export const ProductDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [quantity, setQuantity] = useState(1);
    const addItem = useCartStore(state => state.addItem);

    const { data: product, isLoading, error } = useQuery<Product>({
        queryKey: ['product', id],
        queryFn: () => productService.getById(id!),
        enabled: !!id
    });

    const handleAddToCart = () => {
        if (product) {
            addItem(product.id.toString(), quantity);
            // Mostrar notificación de éxito
        }
    };

    if (isLoading) return <div className="flex justify-center p-8">Cargando producto...</div>;
    if (error || !product) return <div className="text-red-500 p-4">Error al cargar el producto</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Imagen del producto */}
                <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
                    <span className="text-gray-500">Imagen del producto</span>
                </div>

                {/* Información del producto */}
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold">{product.name}</h1>
                        <p className="text-sm text-gray-500 mt-1">SKU: {product.sku}</p>
                    </div>

                    <div>
                        <p className="text-2xl font-bold text-blue-600">
                            ${product.price.toFixed(2)}
                        </p>
                    </div>

                    <div>
                        <p className="text-gray-600">{product.description}</p>
                    </div>

                    <div>
                        <p className={`text-sm ${
                            (product.stockQuantity || product.stock || 0) > (product.minStockLevel || 10)
                                ? 'text-green-600'
                                : (product.stockQuantity || product.stock || 0) > 0
                                ? 'text-yellow-600'
                                : 'text-red-600'
                        }`}>
                            {(product.stockQuantity || product.stock || 0) > 0 
                                ? `${product.stockQuantity || product.stock || 0} unidades disponibles`
                                : 'Sin stock'
                            }
                        </p>
                    </div>

                    {(product.stockQuantity || product.stock || 0) > 0 && (
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                                    Cantidad
                                </label>
                                <select
                                    id="quantity"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Number(e.target.value))}
                                    className="mt-1 block w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    {Array.from({ length: Math.min(10, product.stockQuantity || product.stock || 0) }, (_, i) => (
                                        <option key={i + 1} value={i + 1}>
                                            {i + 1}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={handleAddToCart}
                                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Agregar al carrito
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Sección de recomendaciones */}
            <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6">Productos relacionados</h2>
                {/* Aquí iría el componente de recomendaciones */}
            </div>
        </div>
    );
};
