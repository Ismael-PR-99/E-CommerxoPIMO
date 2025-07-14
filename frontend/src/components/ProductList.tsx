import { useState } from 'react';
import { useStore } from '../store/useStore.ts';
import type { Product } from '../types';

const ProductList = () => {
    const { products } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');

    const filteredProducts = products.filter((product: Product) => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-4">
            <div className="flex gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Buscar productos..."
                    className="flex-1 p-2 border rounded-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                    className="p-2 border rounded-lg"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                >
                    <option value="">Todas las categorías</option>
                    {/* Aquí irían las opciones de categorías */}
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product: Product) => (
                    <div
                        key={product.id}
                        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-semibold">{product.name}</h3>
                                <p className="text-sm text-gray-600 mt-1">SKU: {product.sku}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold">${product.price.toFixed(2)}</p>
                                <p className={`text-sm ${
                                    product.stock <= 10
                                        ? 'text-red-500'
                                        : 'text-green-500'
                                }`}>
                                    Stock: {product.stock}
                                </p>
                            </div>
                        </div>

                        <p className="text-gray-600 mt-2 line-clamp-2">{product.description}</p>

                        {/* showActions && (
                            <div className="mt-4 flex justify-end gap-2">
                                <button
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                >
                                    Ver detalles
                                </button>
                            </div>
                        ) */}
                    </div>
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                    No se encontraron productos
                </div>
            )}
        </div>
    );
};

export default ProductList;
