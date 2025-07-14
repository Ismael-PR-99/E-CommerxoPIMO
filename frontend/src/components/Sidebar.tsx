import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const navItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: (
        <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
        </svg>
      ),
    },
    {
      name: 'Productos',
      path: '/products',
      icon: (
        <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      name: 'Órdenes',
      path: '/orders',
      icon: (
        <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      name: 'Inventario',
      path: '/inventory',
      icon: (
        <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
    },
    {
      name: 'Clientes',
      path: '/customers',
      icon: (
        <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
    },
    {
      name: 'Análisis',
      path: '/analytics',
      icon: (
        <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  const adminItems = [
    {
      name: 'Panel Admin',
      path: '/admin',
      icon: (
        <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      name: 'Gestión Productos',
      path: '/admin/products',
      icon: (
        <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="glass-card" style={{
      width: '256px',
      height: '100vh',
      position: 'sticky',
      top: 0,
      padding: '24px 0'
    }}>
      <div style={{ padding: '0 24px', marginBottom: '32px' }}>
        <div style={{
          fontSize: '20px',
          fontWeight: '700',
          background: 'linear-gradient(to right, #3b82f6, #9333ea)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          E-CommerxoPIMO
        </div>
      </div>

      <nav>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {navItems.map((item) => (
            <li key={item.path} style={{ marginBottom: '4px' }}>
              <NavLink
                to={item.path}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 24px',
                  color: isActive ? '#3b82f6' : '#64748b',
                  backgroundColor: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: isActive ? '500' : '400',
                  transition: 'all 0.3s ease',
                  borderRight: isActive ? '3px solid #3b82f6' : '3px solid transparent'
                })}
              >
                {item.icon}
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Separador de Administración */}
        <div style={{
          margin: '24px 24px 16px 24px',
          paddingTop: '16px',
          borderTop: '1px solid rgba(148, 163, 184, 0.2)'
        }}>
          <div style={{
            fontSize: '12px',
            fontWeight: '600',
            color: '#94a3b8',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Administración
          </div>
        </div>

        {/* Elementos de Admin */}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {adminItems.map((item) => (
            <li key={item.path} style={{ marginBottom: '4px' }}>
              <NavLink
                to={item.path}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 24px',
                  color: isActive ? '#dc2626' : '#64748b',
                  backgroundColor: isActive ? 'rgba(220, 38, 38, 0.1)' : 'transparent',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: isActive ? '500' : '400',
                  transition: 'all 0.3s ease',
                  borderRight: isActive ? '3px solid #dc2626' : '3px solid transparent'
                })}
              >
                {item.icon}
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
