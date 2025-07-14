import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar';
import Header from '../Header';

const Layout: React.FC = () => {
  return (
    <div className="page-background">
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        position: 'relative',
        zIndex: 10
      }}>
        <Sidebar />
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: '100vh'
        }}>
          <Header />
          <main style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            maxHeight: 'calc(100vh - 80px)'
          }}>
            <div className="glass-card" style={{
              padding: '32px',
              minHeight: 'auto'
            }}>
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
