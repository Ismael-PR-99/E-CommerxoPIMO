import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout.tsx'
import Dashboard from './pages/Dashboard.tsx'
import ProductsPage from './pages/Products.tsx'
import OrdersPage from './pages/Orders.tsx'
import InventoryPage from './pages/Inventory.tsx'
import CustomersPage from './pages/Customers.tsx'
import AnalyticsPage from './pages/Analytics.tsx'
import LoginPage from './pages/Login.tsx'
import RegisterPage from './pages/Register.tsx'
import NotFoundPage from './pages/NotFound.tsx'
import AdminDashboard from './pages/admin/AdminDashboard.tsx'
import SimpleProductManagement from './pages/admin/SimpleProductManagement.tsx'

function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Rutas principales - temporalmente sin autenticación para demo */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        {/* Rutas de administración */}
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="admin/products" element={<SimpleProductManagement />} />
      </Route>
      
      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
