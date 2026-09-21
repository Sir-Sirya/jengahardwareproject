import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productApi, businessProfileApi } from '../services/api';
import ProductCard from '../components/ProductCard';
import {
  Plus,
  Package,
  TrendingUp,
  AlertTriangle,
  Loader2,
  ArrowRight,
  Edit3,
} from 'lucide-react';
import type { Product, BusinessProfile } from '../types';

export default function SellerDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, lowStock: 0, leads: 0 });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsRes, profileRes] = await Promise.allSettled([
          productApi.getSellerProducts(),
          businessProfileApi.getMine(),
        ]);

        let prods: Product[] = [];
        let prof: BusinessProfile | null = null;

        if (productsRes.status === 'fulfilled') {
          prods = productsRes.value.data;
          setProducts(prods);
        }
        if (profileRes.status === 'fulfilled') {
          prof = profileRes.value.data;
          setProfile(prof);
        }

        setStats({
          total: prods.length,
          lowStock: prods.filter((p) => p.stockQuantity <= (prof?.lowStockThreshold || 5)).length,
          leads: 0, // Will be populated when lead API is ready
        });
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await productApi.delete(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setStats((s) => ({ ...s, total: s.total - 1 }));
    } catch {
      alert('Failed to delete product.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="text-sm text-gray-500">
            {profile?.businessName || 'Your Business'} — {profile?.location?.clusterName || 'Gikomba'}
          </p>
        </div>
        <Link to="/product/new" className="btn-primary inline-flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-10 h-10 bg-jenga-100 text-jenga-700 rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Low Stock Alerts</p>
              <p className="text-2xl font-bold text-accent-red">{stats.lowStock}</p>
            </div>
            <div className="w-10 h-10 bg-accent-red/10 text-accent-red rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">New Leads</p>
              <p className="text-2xl font-bold text-accent-orange">{stats.leads}</p>
            </div>
            <div className="w-10 h-10 bg-accent-orange/10 text-accent-orange rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Inventory */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">My Inventory</h2>
          <span className="text-sm text-gray-500">Low stock threshold: {profile?.lowStockThreshold || 5} units</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 text-jenga-600 animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 px-6">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-medium text-gray-900 mb-1">No products yet</h3>
            <p className="text-sm text-gray-500 mb-4">
              Start building your digital storefront by adding your first product.
            </p>
            <Link to="/product/new" className="btn-primary inline-flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </Link>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product.id} className="relative group">
                  <ProductCard product={product} isDashboard showSellerInfo={false} />
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      to={`/product/edit/${product.id}`}
                      className="p-2 bg-white rounded-lg shadow-sm text-gray-600 hover:text-jenga-700 border border-gray-100"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 bg-white rounded-lg shadow-sm text-gray-600 hover:text-accent-red border border-gray-100"
                    >
                      <AlertTriangle className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="mt-8 grid sm:grid-cols-2 gap-4">
        <Link
          to="/notifications"
          className="flex items-center justify-between bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:border-jenga-200 transition-colors"
        >
          <div>
            <h3 className="font-medium text-gray-900">Notifications</h3>
            <p className="text-sm text-gray-500">View low stock and lead alerts</p>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400" />
        </Link>
        <div className="flex items-center justify-between bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div>
            <h3 className="font-medium text-gray-900">Storefront Link</h3>
            <p className="text-sm text-gray-500">Share your vendor profile</p>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/marketplace?seller=${profile?.userId}`);
            }}
            className="text-sm text-jenga-600 font-medium hover:text-jenga-700"
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  );
}
