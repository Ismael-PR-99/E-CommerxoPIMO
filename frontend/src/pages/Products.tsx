import { useState } from 'react';
import ProductList from '../components/ProductList';
import AdminPanel from '../components/AdminPanel';

const Products = () => {
  const [activeTab, setActiveTab] = useState<'list' | 'admin'>('list');

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Productos</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded ${
              activeTab === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Lista de Productos
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-4 py-2 rounded ${
              activeTab === 'admin'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Administrar
          </button>
        </div>
      </div>

      {activeTab === 'list' ? <ProductList /> : <AdminPanel />}
    </div>
  );
};

export default Products;
