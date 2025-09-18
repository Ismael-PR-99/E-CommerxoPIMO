import React, { createContext, useContext, useState, useEffect } from 'react';
import authService, { type User } from '../services/auth';

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Cargar datos del localStorage al inicializar
    const initializeAuth = async () => {
      try {
        const savedToken = localStorage.getItem('token');
        
        if (savedToken) {
          setToken(savedToken);
          // Intentar cargar el perfil del usuario
          try {
            const userProfile = await authService.profile();
            setUser(userProfile);
          } catch (error) {
            console.error('Error loading user profile:', error);
            // Si falla, limpiar el token inválido
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await authService.login(email, password);
      const tokenValue = (response as any).token || (response as any).accessToken;
      setToken(tokenValue || null);
      setUser(response.user);
      if (tokenValue) {
        localStorage.setItem('token', tokenValue);
      }
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    try {
      const response = await authService.register({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone
      });

      const tokenValue = (response as any).token || (response as any).accessToken;
      setToken(tokenValue);
      setUser(response.user);
      localStorage.setItem('token', tokenValue);
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const refreshProfile = async (): Promise<void> => {
    try {
      if (token) {
        const userProfile = await authService.profile();
        setUser(userProfile);
        localStorage.setItem('user', JSON.stringify(userProfile));
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
      // Si falla, hacer logout
      logout();
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    refreshProfile,
    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
