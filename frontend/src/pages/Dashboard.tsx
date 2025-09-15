import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

const Dashboard: React.FC = () => {
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

  const StatCard = ({ value, subtitle, icon, colorClass }: {
    value: string | number;
    subtitle: string;
    icon: React.ReactNode;
    colorClass: string;
  }) => (
    <Card className="hover:shadow-xl transition-shadow cursor-pointer">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-3xl font-semibold tabular-nums text-gray-900 mb-1">
            {value}
          </p>
          <p className="text-xs text-gray-500">
            {subtitle}
          </p>
        </div>
        <span className={`ml-auto opacity-60 text-2xl ${colorClass}`}>
          {icon}
        </span>
      </div>
    </Card>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
          Dashboard - Chacinas Ibéricas
        </h1>
        <p className="text-gray-600">
          Gestión de productos ibéricos de calidad premium
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <StatCard
          value={stats.totalProducts}
          subtitle="En inventario"
          colorClass="text-green-600"
          icon="📦"
        />
        
        <StatCard
          value={stats.lowStockProducts}
          subtitle="≤ 10 unidades"
          colorClass="text-amber-600"
          icon="⚠️"
        />

        <StatCard
          value={stats.outOfStockProducts}
          subtitle="Agotados"
          colorClass="text-red-600"
          icon="❌"
        />

        <StatCard
          value={`$${stats.totalValue.toLocaleString()}`}
          subtitle="Inventario"
          colorClass="text-blue-600"
          icon="💰"
        />
      </div>

      {/* Recent Orders */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Órdenes Recientes
        </h2>
        
        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Estado</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">#{order.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{order.customerName}</td>
                    <td className="px-6 py-4">
                      <Badge variant={
                        order.status === 'delivered' ? 'success' :
                        order.status === 'processing' ? 'info' :
                        order.status === 'shipped' ? 'neutral' : 'warning'
                      }>
                        {order.status === 'delivered' ? 'Entregado' :
                         order.status === 'pending' ? 'Pendiente' : 
                         order.status === 'processing' ? 'Procesando' : 'Enviado'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right tabular-nums text-sm text-gray-900">
                      ${order.total.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p>No hay órdenes recientes</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
