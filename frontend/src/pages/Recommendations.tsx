import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyRecommendations } from '../services/recommendations';
import { type ProductResponse } from '../services/products';
import ProductCard from '../components/ProductCard';

const Recommendations: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/recommendations' } });
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const recs = await getMyRecommendations();
        setProducts(recs);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al obtener recomendaciones');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin h-8 w-8 rounded-full border-b-2 border-indigo-600 mr-3" />
            <span className="text-gray-600">Cargando recomendaciones...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-red-800">No se pudieron cargar las recomendaciones</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 inline-flex items-center px-3 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900">Recomendaciones para ti</h1>
            <p className="mt-1 text-sm text-gray-600">Basadas en tu actividad, aquí tienes productos que podrían interesarte.</p>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="bg-white shadow sm:rounded-lg p-6 text-center">
            <p className="text-gray-600">No hay recomendaciones disponibles por ahora. ¡Explora la tienda y vuelve más tarde!</p>
            <button
              onClick={() => navigate('/store')}
              className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Ir a la tienda
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Recommendations;
