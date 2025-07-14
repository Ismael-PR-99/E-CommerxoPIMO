import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import ProductsPage from './pages/Products'
import OrdersPage from './pages/Orders'
import InventoryPage from './pages/Inventory'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import NotFoundPage from './pages/NotFound'

function App() {
  const { isAuthenticated } = useAuth()
  
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />} />
      <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" replace />} />
      
      {/* Rutas protegidas */}
      <Route 
        path="/" 
        element={isAuthenticated ? <Layout /> : <Navigate to="/login" replace />}
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="inventory" element={<InventoryPage />} />
      </Route>
      
      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
