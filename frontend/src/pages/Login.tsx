import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await login(email, password);
      // Redirigir a Home para que use la lógica de redirección por rol
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
      setError(error instanceof Error ? error.message : 'Error de autenticación');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-background">
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        <div className="glass-card" style={{
          width: '100%',
          maxWidth: '400px',
          padding: '48px 32px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{
              fontSize: '28px',
              fontWeight: '700',
              background: 'linear-gradient(to right, #3b82f6, #9333ea)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '8px'
            }}>
              E-CommerxoPIMO
            </div>
            <p style={{ color: '#64748b', fontSize: '16px' }}>
              Bienvenido de vuelta
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {error && (
              <div style={{
                padding: '12px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#dc2626',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid #d1d5db',
                  background: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '14px',
                  outline: 'none',
                  position: 'relative',
                  zIndex: 10
                }}
                placeholder="tu@email.com"
                required
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid #d1d5db',
                  background: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '14px',
                  outline: 'none',
                  position: 'relative',
                  zIndex: 10
                }}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
              style={{
                width: '100%',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {isLoading && (
                <div className="animate-spin" style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%'
                }} />
              )}
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Usuario Demo */}
          <div style={{
            marginTop: '24px',
            padding: '16px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px'
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#475569',
              marginBottom: '8px'
            }}>
              🎯 Usuario Demo
            </div>
            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>
              <strong>Email:</strong> demo@demo.com
            </div>
            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
              <strong>Contraseña:</strong> demo123
            </div>
            <div style={{ fontSize: '12px', color: '#059669' }}>
              👑 Acceso administrador - Panel completo
            </div>
          </div>

          <div style={{
            textAlign: 'center',
            marginTop: '32px',
            fontSize: '14px',
            color: '#64748b'
          }}>
            ¿No tienes cuenta?{' '}
            <Link
              to="/register"
              style={{
                color: '#3b82f6',
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              Regístrate
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
