import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Card } from '../../components/ui/Card';

interface AdminStats {
  totalProducts: number;
  totalUsers: number;
  totalOrders: number;
  monthlyRevenue: number;
  lowStockAlerts: number;
  pendingOrders: number;
}

const AdminDashboard: React.FC = () => {
  const { products, orders } = useStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats>({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    monthlyRevenue: 0,
    lowStockAlerts: 0,
    pendingOrders: 0
  });

  useEffect(() => {
    // Calcular estadísticas del admin
    const lowStockProducts = products.filter(p => p.stock <= 10);
    const pendingOrders = orders.filter(o => o.status === 'pending');
    const monthlyRevenue = orders
      .filter(o => o.status === 'delivered')
      .reduce((sum, o) => sum + o.total, 0);

    setStats({
      totalProducts: products.length,
      totalUsers: 156, // Dato simulado
      totalOrders: orders.length,
      monthlyRevenue,
      lowStockAlerts: lowStockProducts.length,
      pendingOrders: pendingOrders.length
    });
  }, [products, orders]);

  const AdminCard = ({ title, value, subtitle, icon, color, onClick }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: string;
    color: string;
    onClick?: () => void;
  }) => (
    <div 
      className={`transition-all duration-300 hover:shadow-xl ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
      onClick={onClick}
    >
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-2">{title}</p>
            <h3 className="text-3xl font-bold text-gray-900 mb-1 tabular-nums">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </h3>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>
          <div 
            className="text-3xl opacity-70"
            style={{ color: color }}
          >
            {icon}
          </div>
        </div>
      </Card>
    </div>
  );

  const QuickAction = ({ title, description, icon, color, onClick }: {
    title: string;
    description: string;
    icon: string;
    color: string;
    onClick: () => void;
  }) => (
    <div 
      className="cursor-pointer transition-all duration-300 hover:shadow-xl"
      onClick={onClick}
    >
      <Card>
        <div className="flex items-center gap-4">
          <div 
            className="text-2xl p-3 rounded-lg"
            style={{ 
              color: color,
              backgroundColor: `${color}20`
            }}
          >
            {icon}
          </div>
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-1">{title}</h4>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🥓 Panel de Administración - Chacinas Ibéricas
        </h1>
        <p className="text-gray-600 text-lg">
          Gestiona tu tienda de productos ibéricos premium
        </p>
      </div>

      {/* Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <AdminCard
          title="Total Productos"
          value={stats.totalProducts}
          subtitle="En catálogo"
          icon="📦"
          color="#3B82F6"
          onClick={() => navigate('/admin/products')}
        />
        <AdminCard
          title="Órdenes del Mes"
          value={stats.totalOrders}
          subtitle="Total procesadas"
          icon="📋"
          color="#10B981"
        />
        <AdminCard
          title="Ingresos Mensuales"
          value={`$${stats.monthlyRevenue.toLocaleString()}`}
          subtitle="Órdenes completadas"
          icon="💰"
          color="#F59E0B"
        />
        <AdminCard
          title="Usuarios Registrados"
          value={stats.totalUsers}
          subtitle="Clientes activos"
          icon="👥"
          color="#8B5CF6"
        />
      </div>

      {/* Alertas */}
      {(stats.lowStockAlerts > 0 || stats.pendingOrders > 0) && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🚨 Alertas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.lowStockAlerts > 0 && (
              <Card className="border-red-200 bg-red-50">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <h4 className="font-medium text-red-700 mb-1">Stock Bajo</h4>
                    <p className="text-sm text-gray-600">
                      {stats.lowStockAlerts} productos necesitan reposición
                    </p>
                  </div>
                </div>
              </Card>
            )}
            {stats.pendingOrders > 0 && (
              <Card className="border-amber-200 bg-amber-50">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⏰</span>
                  <div>
                    <h4 className="font-medium text-amber-700 mb-1">Órdenes Pendientes</h4>
                    <p className="text-sm text-gray-600">
                      {stats.pendingOrders} órdenes esperan procesamiento
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Acciones Rápidas */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">⚡ Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickAction
            title="Agregar Producto"
            description="Añadir nuevo producto al catálogo"
            icon="➕"
            color="#10B981"
            onClick={() => navigate('/admin/products')}
          />
          <QuickAction
            title="Gestionar Inventario"
            description="Ver y actualizar stock de productos"
            icon="📊"
            color="#3B82F6"
            onClick={() => navigate('/inventory')}
          />
          <QuickAction
            title="Procesar Órdenes"
            description="Revisar y procesar órdenes pendientes"
            icon="✅"
            color="#F59E0B"
            onClick={() => navigate('/orders')}
          />
          <QuickAction
            title="Ver Reportes"
            description="Análisis de ventas y estadísticas"
            icon="📈"
            color="#8B5CF6"
            onClick={() => navigate('/analytics')}
          />
          <QuickAction
            title="Ver Tienda Externa"
            description="Ir a la tienda pública donde compran los clientes"
            icon="🌐"
            color="#8B5CF6"
            onClick={() => window.open('/store', '_blank')}
          />
          <QuickAction
            title="Gestionar Usuarios"
            description="Administrar cuentas de clientes"
            icon="👤"
            color="#EF4444"
            onClick={() => navigate('/customers')}
          />
          <QuickAction
            title="Configuración"
            description="Ajustes de la tienda y sistema"
            icon="⚙️"
            color="#6B7280"
            onClick={() => navigate('/admin')}
          />
        </div>
      </div>

      {/* Resumen de Actividad Reciente */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">📋 Actividad Reciente</h2>
        <div className="space-y-3">
          {orders.slice(0, 5).map((order, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <span className="text-lg">
                  {order.status === 'pending' ? '⏳' : 
                   order.status === 'processing' ? '🔄' : 
                   order.status === 'delivered' ? '✅' : '📦'}
                </span>
                <div>
                  <p className="font-medium text-sm text-gray-900 mb-0.5">
                    Orden #{order.id}
                  </p>
                  <p className="text-xs text-gray-600">
                    Cliente - {order.status}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-sm text-gray-900 mb-0.5">
                  ${order.total.toFixed(2)}
                </p>
                <p className="text-xs text-gray-600">
                  {order.date}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
