import { useEffect, useState } from 'react';
import { adminApi } from '../services/api';
import { Users, Package, ShoppingCart, Tag, Store, Bell, Loader2 } from 'lucide-react';
import type { User, Product, ProductLead } from '../types';

interface Stats {
  totalUsers: number;
  totalProducts: number;
  totalLeads: number;
  totalCategories: number;
  totalBusinessProfiles: number;
  totalNotifications: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [leads, setLeads] = useState<ProductLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, usersRes, productsRes, leadsRes] = await Promise.all([
          adminApi.getStats(),
          adminApi.getUsers(),
          adminApi.getProducts(),
          adminApi.getLeads(),
        ]);
        setStats(statsRes.data);
        setUsers(usersRes.data);
        setProducts(productsRes.data);
        setLeads(leadsRes.data);
      } catch (err: unknown) {
        const message = (err as { response?: { data?: { message?: string } }; message?: string }).response?.data?.message || 'Failed to load admin data.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-jenga-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-accent-red">{error}</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Users', value: stats?.totalUsers ?? 0, icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'Products', value: stats?.totalProducts ?? 0, icon: Package, color: 'bg-green-50 text-green-600' },
    { label: 'Leads', value: stats?.totalLeads ?? 0, icon: ShoppingCart, color: 'bg-orange-50 text-orange-600' },
    { label: 'Categories', value: stats?.totalCategories ?? 0, icon: Tag, color: 'bg-purple-50 text-purple-600' },
    { label: 'Business Profiles', value: stats?.totalBusinessProfiles ?? 0, icon: Store, color: 'bg-teal-50 text-teal-600' },
    { label: 'Notifications', value: stats?.totalNotifications ?? 0, icon: Bell, color: 'bg-pink-50 text-pink-600' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center mb-3`}>
              <card.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.slice(0, 5).map((u) => (
                  <tr key={u.id}>
                    <td className="px-4 py-3 text-gray-900">{u.fullName}</td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        u.role === 'ADMIN'
                          ? 'bg-red-50 text-red-600'
                          : u.role === 'SELLER'
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Recent Products</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Title</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Price</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.slice(0, 5).map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 text-gray-900">{p.title}</td>
                    <td className="px-4 py-3 text-gray-500">KES {p.price.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-500">{p.stockQuantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-2">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Recent Leads</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">ID</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Buyer ID</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Product ID</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leads.slice(0, 5).map((l) => (
                  <tr key={l.id}>
                    <td className="px-4 py-3 text-gray-900">#{l.id}</td>
                    <td className="px-4 py-3 text-gray-500">{l.buyerId}</td>
                    <td className="px-4 py-3 text-gray-500">{l.productId}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        l.status === 'SETTLED'
                          ? 'bg-green-50 text-green-600'
                          : l.status === 'PENDING'
                          ? 'bg-yellow-50 text-yellow-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{new Date(l.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {leads.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-gray-400">No leads yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
