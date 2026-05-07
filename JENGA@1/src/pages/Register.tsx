import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import { Eye, EyeOff, UserPlus, Store, User as UserIcon } from 'lucide-react';
import type { User } from '../types';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [role, setRole] = useState<'BUYER' | 'SELLER'>('BUYER');
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    businessName: '',
    mpesaNumber: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...form,
        role,
      };
      const res = await authApi.signup(payload);
      const { token, user } = res.data as { token: string; user: User };
      login(token, user);
      navigate('/');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: string }; message?: string }).response?.data || 'Registration failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Get Started</h1>
            <p className="text-sm text-gray-500 mt-1">Join the Jenga P2P marketplace</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-accent-red/10 border border-accent-red/20 text-accent-red rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setRole('BUYER')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors flex items-center justify-center gap-2 ${
                role === 'BUYER'
                  ? 'bg-jenga-600 text-white border-jenga-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <UserIcon className="h-4 w-4" />
              I'm a Buyer
            </button>
            <button
              type="button"
              onClick={() => setRole('SELLER')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors flex items-center justify-center gap-2 ${
                role === 'SELLER'
                  ? 'bg-jenga-600 text-white border-jenga-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Store className="h-4 w-4" />
              I'm a Seller
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="label-text">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={form.fullName}
                onChange={handleChange}
                className="input-field"
                placeholder="John Doe"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="label-text">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="phoneNumber" className="label-text">Phone Number</label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  required
                  value={form.phoneNumber}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="+254712345678"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="label-text">Password</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={form.password}
                  onChange={handleChange}
                  className="input-field pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {role === 'SELLER' && (
              <>
                <div>
                  <label htmlFor="businessName" className="label-text">Business Name</label>
                  <input
                    id="businessName"
                    name="businessName"
                    type="text"
                    required
                    value={form.businessName}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Doe Hardware Ltd"
                  />
                </div>
                <div>
                  <label htmlFor="mpesaNumber" className="label-text">M-Pesa Number</label>
                  <input
                    id="mpesaNumber"
                    name="mpesaNumber"
                    type="tel"
                    required
                    value={form.mpesaNumber}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="+254712345678"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Create Account
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-jenga-600 font-medium hover:text-jenga-700">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
