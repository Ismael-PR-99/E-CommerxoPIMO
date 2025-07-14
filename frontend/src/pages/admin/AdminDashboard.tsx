import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';

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
      className="glass-card"
      onClick={onClick}
      style={{
        padding: '24px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        border: `2px solid ${color}20`,
        background: `linear-gradient(135deg, ${color}08, ${color}04)`
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '14px', color: '#666', margin: '0 0 8px 0' }}>{title}</p>
          <h3 style={{ fontSize: '28px', color: '#333', margin: '0 0 4px 0', fontWeight: '700' }}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </h3>
          <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>{subtitle}</p>
        </div>
        <div style={{
          fontSize: '32px',
          color: color,
          opacity: 0.7
        }}>
          {icon}
        </div>
      </div>
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
      className="glass-card"
      onClick={onClick}
      style={{
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        border: `1px solid ${color}30`
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          fontSize: '24px',
          color: color,
          background: `${color}20`,
          padding: '12px',
          borderRadius: '8px'
        }}>
          {icon}
        </div>
        <div>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#333' }}>{title}</h4>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>{description}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', color: '#333', margin: '0 0 8px 0', fontWeight: '700' }}>
          🏪 Panel de Administración
        </h1>
        <p style={{ color: '#666', fontSize: '16px', margin: 0 }}>
          Gestiona tu tienda, productos y órdenes desde aquí
        </p>
      </div>

      {/* Estadísticas Principales */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
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
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', color: '#333', margin: '0 0 16px 0' }}>🚨 Alertas</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {stats.lowStockAlerts > 0 && (
              <div className="glass-card" style={{
                padding: '16px',
                border: '2px solid #EF444420',
                background: 'linear-gradient(135deg, #EF444408, #EF444404)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '24px' }}>⚠️</span>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', color: '#EF4444' }}>Stock Bajo</h4>
                    <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                      {stats.lowStockAlerts} productos necesitan reposición
                    </p>
                  </div>
                </div>
              </div>
            )}
            {stats.pendingOrders > 0 && (
              <div className="glass-card" style={{
                padding: '16px',
                border: '2px solid #F59E0B20',
                background: 'linear-gradient(135deg, #F59E0B08, #F59E0B04)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '24px' }}>⏰</span>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', color: '#F59E0B' }}>Órdenes Pendientes</h4>
                    <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                      {stats.pendingOrders} órdenes esperan procesamiento
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Acciones Rápidas */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', color: '#333', margin: '0 0 16px 0' }}>⚡ Acciones Rápidas</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
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
      <div className="glass-card" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '20px', color: '#333', margin: '0 0 16px 0' }}>📋 Actividad Reciente</h2>
        <div style={{ display: 'grid', gap: '12px' }}>
          {orders.slice(0, 5).map((order, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px',
              background: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '16px' }}>
                  {order.status === 'pending' ? '⏳' : 
                   order.status === 'processing' ? '🔄' : 
                   order.status === 'delivered' ? '✅' : '📦'}
                </span>
                <div>
                  <p style={{ margin: '0 0 2px 0', fontWeight: '500', fontSize: '14px' }}>
                    Orden #{order.id}
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                    Cliente - {order.status}
                  </p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: '0 0 2px 0', fontWeight: '500', fontSize: '14px' }}>
                  ${order.total.toFixed(2)}
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                  {order.date}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
