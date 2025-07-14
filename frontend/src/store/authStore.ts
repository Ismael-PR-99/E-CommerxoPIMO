import { create } from 'zustand'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'

interface User {
  id: number
  email: string
  name: string
  role: string
}

interface DecodedToken {
  sub: string
  name: string
  role: string
  exp: number
  iat: number
}

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  checkAuth: () => void
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  user: null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password })
      const { token } = response.data

      localStorage.setItem('token', token)
      
      const decoded = jwtDecode<DecodedToken>(token)
      const user: User = {
        id: parseInt(decoded.sub),
        email: decoded.sub,
        name: decoded.name,
        role: decoded.role
      }
      
      set({ 
        token, 
        user, 
        isAuthenticated: true,
        isLoading: false 
      })
    } catch (error) {
      console.error('Login error:', error)
      set({ 
        error: 'Error al iniciar sesión. Verifica tus credenciales.',
        isLoading: false 
      })
    }
  },
  
  logout: () => {
    localStorage.removeItem('token')
    set({ 
      token: null, 
      user: null, 
      isAuthenticated: false 
    })
  },
  
  checkAuth: () => {
    const token = localStorage.getItem('token')
    
    if (!token) {
      set({ isAuthenticated: false, user: null })
      return
    }
    
    try {
      const decoded = jwtDecode<DecodedToken>(token)
      
      // Verificar si el token ha expirado
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem('token')
        set({ 
          token: null,
          user: null, 
          isAuthenticated: false 
        })
        return
      }
      
      const user: User = {
        id: parseInt(decoded.sub),
        email: decoded.sub,
        name: decoded.name,
        role: decoded.role
      }
      
      set({ 
        token, 
        user, 
        isAuthenticated: true 
      })
    } catch (error) {
      console.error('Error al verificar token:', error)
      localStorage.removeItem('token')
      set({ 
        token: null,
        user: null, 
        isAuthenticated: false 
      })
    }
  },
}))
