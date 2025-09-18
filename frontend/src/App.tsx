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
import CleanProductManagement from './pages/admin/CleanProductManagement.tsx'
import Store from './pages/Store.tsx'
import Cart from './pages/Cart.tsx'
import Checkout from './pages/Checkout.tsx'
import Payment from './pages/Payment.tsx'
import ThankYou from './pages/ThankYou.tsx'
import MyOrders from './pages/MyOrders.tsx'
import Recommendations from './pages/Recommendations.tsx'
import Home from './components/Home.tsx'
import PrivateRoute from './components/PrivateRoute.tsx'

function App() {
  return (
    <Routes>
      {/* Página inicial - redirige según autenticación y rol */}
      <Route path="/" element={<Home />} />
      
      {/* Rutas públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Tienda Externa - Protegida, usuarios normales */}
      <Route path="/store" element={
        <PrivateRoute>
          <Store />
        </PrivateRoute>
      } />
      
      {/* Rutas de pago - Protegidas */}
      <Route path="/payment" element={
        <PrivateRoute>
          <Payment />
        </PrivateRoute>
      } />
      <Route path="/checkout/:orderId" element={
        <PrivateRoute>
          <Checkout />
        </PrivateRoute>
      } />
      <Route path="/order/thank-you" element={
        <PrivateRoute>
          <ThankYou />
        </PrivateRoute>
      } />
      <Route path="/thank-you" element={
        <PrivateRoute>
          <ThankYou />
        </PrivateRoute>
      } />
      
      {/* Rutas del panel administrativo con Layout */}
      <Route path="/dashboard" element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }>
        <Route index element={<Dashboard />} />
      </Route>
      
      <Route path="/products" element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }>
        <Route index element={<ProductsPage />} />
      </Route>
      
      <Route path="/cart" element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }>
        <Route index element={<Cart />} />
      </Route>
      
      <Route path="/my-orders" element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }>
        <Route index element={<MyOrders />} />
      </Route>
      
      <Route path="/recommendations" element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }>
        <Route index element={<Recommendations />} />
      </Route>
      
      <Route path="/orders" element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }>
        <Route index element={<OrdersPage />} />
      </Route>
      
      <Route path="/inventory" element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }>
        <Route index element={<InventoryPage />} />
      </Route>
      
      <Route path="/customers" element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }>
        <Route index element={<CustomersPage />} />
      </Route>
      
      <Route path="/analytics" element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }>
        <Route index element={<AnalyticsPage />} />
      </Route>
      
      {/* Rutas de administración - Solo para admins */}
      <Route path="/admin" element={
        <PrivateRoute requireAdmin>
          <Layout />
        </PrivateRoute>
      }>
        <Route index element={<AdminDashboard />} />
      </Route>
      
      <Route path="/admin/products" element={
        <PrivateRoute requireAdmin>
          <Layout />
        </PrivateRoute>
      }>
        <Route index element={<CleanProductManagement />} />
      </Route>
      
      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
