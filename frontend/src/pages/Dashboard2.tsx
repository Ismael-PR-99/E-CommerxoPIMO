import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';

const Dashboard = () => {
  const { products, orders } = useStore();
  
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    totalValue: 0
  });

  useEffect(() => {
    if (products.length > 0) {
      const lowStock = products.filter(p => p.stock <= 10);
      const outOfStock = products.filter(p => p.stock === 0);
      const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

      setStats({
        totalProducts: products.length,
        lowStockProducts: lowStock.length,
        outOfStockProducts: outOfStock.length,
        totalValue
      });
    }
  }, [products]);

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Total Productos</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalProducts}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Stock Bajo</h3>
          <p className="text-3xl font-bold text-yellow-600">{stats.lowStockProducts}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Agotados</h3>
          <p className="text-3xl font-bold text-red-600">{stats.outOfStockProducts}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Valor Total</h3>
          <p className="text-3xl font-bold text-green-600">${stats.totalValue.toFixed(2)}</p>
        </div>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Products */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Productos con Stock Bajo</h3>
          <div className="space-y-3">
            {products
              .filter(p => p.stock <= 10)
              .slice(0, 5)
              .map(product => (
                <div key={product.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.sku}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-sm ${
                    product.stock === 0 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    Stock: {product.stock}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Órdenes Recientes</h3>
          <div className="space-y-3">
            {recentOrders.map(order => (
              <div key={order.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">#{order.id} - {order.customerName}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${order.total.toFixed(2)}</p>
                  <span className={`px-2 py-1 rounded text-xs ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
