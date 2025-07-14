import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';

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

  const StatCard = ({ title, value, subtitle, icon, colorClass }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ReactNode;
    colorClass: string;
  }) => (
    <div className="glass-card" style={{
      padding: '24px',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <p style={{
            fontSize: '14px',
            fontWeight: '500',
            color: '#6b7280',
            marginBottom: '8px'
          }}>
            {title}
          </p>
          <p style={{
            fontSize: '32px',
            fontWeight: '700',
            color: colorClass,
            marginBottom: '4px'
          }}>
            {value}
          </p>
          <p style={{
            fontSize: '12px',
            color: '#9ca3af'
          }}>
            {subtitle}
          </p>
        </div>
        <div style={{
          padding: '16px',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.5), rgba(243, 244, 246, 0.5))',
          borderRadius: '16px'
        }}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{
        marginBottom: '32px'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#1f2937',
          marginBottom: '8px'
        }}>
          Dashboard
        </h1>
        <p style={{
          color: '#6b7280',
          fontSize: '16px'
        }}>
          Resumen del inventario y actividad reciente
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        <StatCard
          title="Total Productos"
          value={stats.totalProducts}
          subtitle="En inventario"
          colorClass="#059669"
          icon={
            <svg style={{ width: '24px', height: '24px', color: '#059669' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
        />
        
        <StatCard
          title="Stock Bajo"
          value={stats.lowStockProducts}
          subtitle="≤ 10 unidades"
          colorClass="#f59e0b"
          icon={
            <svg style={{ width: '24px', height: '24px', color: '#f59e0b' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          }
        />

        <StatCard
          title="Sin Stock"
          value={stats.outOfStockProducts}
          subtitle="Agotados"
          colorClass="#dc2626"
          icon={
            <svg style={{ width: '24px', height: '24px', color: '#dc2626' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          }
        />

        <StatCard
          title="Valor Total"
          value={`$${stats.totalValue.toLocaleString()}`}
          subtitle="Inventario"
          colorClass="#3b82f6"
          icon={
            <svg style={{ width: '24px', height: '24px', color: '#3b82f6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          }
        />
      </div>

      {/* Recent Orders */}
      <div className="glass-card" style={{
        padding: '32px'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: '24px'
        }}>
          Órdenes Recientes
        </h2>
        
        {recentOrders.length > 0 ? (
          <div style={{
            overflowX: 'auto'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <th style={{
                    textAlign: 'left',
                    padding: '12px 0',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#6b7280'
                  }}>
                    ID
                  </th>
                  <th style={{
                    textAlign: 'left',
                    padding: '12px 0',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#6b7280'
                  }}>
                    Cliente
                  </th>
                  <th style={{
                    textAlign: 'left',
                    padding: '12px 0',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#6b7280'
                  }}>
                    Estado
                  </th>
                  <th style={{
                    textAlign: 'right',
                    padding: '12px 0',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#6b7280'
                  }}>
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} style={{
                    borderBottom: '1px solid #f3f4f6'
                  }}>
                    <td style={{
                      padding: '16px 0',
                      fontSize: '14px',
                      color: '#1f2937'
                    }}>
                      #{order.id}
                    </td>
                    <td style={{
                      padding: '16px 0',
                      fontSize: '14px',
                      color: '#1f2937'
                    }}>
                      {order.customerName}
                    </td>
                    <td style={{
                      padding: '16px 0'
                    }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: order.status === 'delivered' ? '#dcfce7' : 
                                       order.status === 'pending' ? '#fef3c7' : '#fce7f3',
                        color: order.status === 'delivered' ? '#059669' : 
                               order.status === 'pending' ? '#f59e0b' : '#be185d'
                      }}>
                        {order.status === 'delivered' ? 'Entregado' :
                         order.status === 'pending' ? 'Pendiente' : 
                         order.status === 'processing' ? 'Procesando' : 'Enviado'}
                      </span>
                    </td>
                    <td style={{
                      textAlign: 'right',
                      padding: '16px 0',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#1f2937'
                    }}>
                      ${order.total.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#6b7280'
          }}>
            <svg style={{
              width: '48px',
              height: '48px',
              margin: '0 auto 16px',
              color: '#d1d5db'
            }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p>No hay órdenes recientes</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
