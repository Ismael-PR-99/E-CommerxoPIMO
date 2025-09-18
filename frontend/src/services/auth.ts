interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

interface LoginResponse {
  accessToken: string; // backend devuelve accessToken
  refreshToken?: string;
  token?: string; // compatibilidad si componente espera token
  user: {
    id: number;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    role?: string;
  };
}

interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

class AuthService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Realiza login de usuario
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Login failed: ${response.status}`);
    }

    const data: LoginResponse = await response.json();
    // Normalizar para componentes que usan token
    if (!data.token && data.accessToken) {
      (data as any).token = data.accessToken;
    }
    return data;
  }

  /**
   * Registra nuevo usuario
   */
  async register(userData: RegisterRequest): Promise<LoginResponse> {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Registration failed: ${response.status}`);
    }

    const data: LoginResponse = await response.json();
    if (!data.token && data.accessToken) {
      (data as any).token = data.accessToken;
    }
    return data;
  }

  /**
   * Obtiene perfil del usuario autenticado
   */
  async profile(): Promise<User> {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${this.baseURL}/auth/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token inválido, limpiar localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        throw new Error('Session expired');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Profile fetch failed: ${response.status}`);
    }

  const data: User = await response.json();
  return data;
  }

  /**
   * Verifica si el token es válido
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/auth/validate`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Instancia singleton
const authService = new AuthService();

export default authService;
export type { LoginRequest, RegisterRequest, LoginResponse, User };