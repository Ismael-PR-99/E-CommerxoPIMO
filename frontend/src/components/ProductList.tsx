import { useState, useEffect } from 'react';
import productService, { type ProductResponse, type ProductPageResponse } from '../services/products';
import ProductCard from './ProductCard';

const ProductList = () => {
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // Fetch productos del backend
    const fetchProducts = async (page: number = 0) => {
        try {
            setLoading(true);
            setError(null);
            
            const filters = {
                ...(selectedCategory && { category: selectedCategory }),
                ...(searchTerm && { search: searchTerm }),
            };

            const response: ProductPageResponse = await productService.getProducts(
                page,
                12, // 12 productos por página
                'name,asc',
                Object.keys(filters).length > 0 ? filters : undefined
            );

            setProducts(response.content);
            setTotalPages(response.totalPages);
            setTotalElements(response.totalElements);
            setCurrentPage(response.number);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar productos');
        } finally {
            setLoading(false);
        }
    };

    // Cargar productos al montar el componente
    useEffect(() => {
        fetchProducts(0);
    }, []);

    // Recargar cuando cambien los filtros
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchProducts(0);
        }, 300); // Debounce de 300ms

        return () => clearTimeout(timeoutId);
    }, [searchTerm, selectedCategory]);

    // Cambiar página
    const handlePageChange = (newPage: number) => {
        fetchProducts(newPage);
    };

    // Obtener categorías únicas de los productos
    const categories = [...new Set(products.map(product => product.category))];

    // Estados de loading y error
    if (loading && products.length === 0) {
        return (
            <div className="space-y-4">
                <div className="flex gap-4 mb-6">
                    <div className="flex-1 h-10 bg-gray-200 animate-pulse rounded-lg"></div>
                    <div className="w-48 h-10 bg-gray-200 animate-pulse rounded-lg"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white rounded-lg shadow-md p-6">
                            <div className="h-6 bg-gray-200 animate-pulse rounded mb-2"></div>
                            <div className="h-4 bg-gray-200 animate-pulse rounded mb-4"></div>
                            <div className="h-20 bg-gray-200 animate-pulse rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-500 py-8">
                <p>Error: {error}</p>
                <button 
                    onClick={() => fetchProducts(currentPage)}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Filtros y búsqueda */}
            <div className="flex gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Buscar productos..."
                    className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                    className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                >
                    <option value="">Todas las categorías</option>
                    {categories.map((category) => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>
            </div>

            {/* Información de resultados */}
            <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-600">
                    {loading ? 'Cargando...' : `${totalElements} productos encontrados`}
                </p>
                {totalPages > 1 && (
                    <p className="text-sm text-gray-600">
                        Página {currentPage + 1} de {totalPages}
                    </p>
                )}
            </div>

            {/* Grid de productos usando ProductCard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product: ProductResponse) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        showActions={true}
                    />
                ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                        className="px-3 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        Anterior
                    </button>
                    
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        const pageNumber = Math.max(0, currentPage - 2) + i;
                        if (pageNumber >= totalPages) return null;
                        
                        return (
                            <button
                                key={pageNumber}
                                onClick={() => handlePageChange(pageNumber)}
                                className={`px-3 py-2 border rounded ${
                                    pageNumber === currentPage
                                        ? 'bg-blue-500 text-white'
                                        : 'hover:bg-gray-50'
                                }`}
                            >
                                {pageNumber + 1}
                            </button>
                        );
                    })}
                    
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages - 1}
                        className="px-3 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        Siguiente
                    </button>
                </div>
            )}

            {/* Mensaje cuando no hay productos */}
            {products.length === 0 && !loading && (
                <div className="text-center text-gray-500 py-8">
                    No se encontraron productos
                </div>
            )}
        </div>
    );
};

export default ProductList;
