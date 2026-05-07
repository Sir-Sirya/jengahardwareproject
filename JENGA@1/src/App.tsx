import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDiscovery from './pages/ProductDiscovery';
import ProductDetail from './pages/ProductDetail';
import SellerDashboard from './pages/SellerDashboard';
import AddEditProduct from './pages/AddEditProduct';
import Notifications from './pages/Notifications';
import AdminDashboard from './pages/AdminDashboard';

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-gray-600 mb-6">Page not found</p>
        <a href="/" className="text-jenga-600 hover:text-jenga-700 font-medium">
          Go back home
        </a>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/marketplace" element={<ProductDiscovery />} />
        <Route path="/marketplace/:categorySlug" element={<ProductDiscovery />} />
        <Route path="/product/:id" element={<ProductDetail />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<SellerDashboard />} />
          <Route path="/product/new" element={<AddEditProduct />} />
          <Route path="/product/edit/:id" element={<AddEditProduct />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
