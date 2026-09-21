import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import type { User } from '../types';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      const res = await authApi.login(cleanEmail, cleanPassword);
      const { token, user } = res.data as { token: string; user: User };

      if (!token) {
        throw new Error('Authentication failed: No token received from server.');
      }

      // Explicitly set both storage keys so Axios interceptors always find the fresh token
      localStorage.setItem('jenga_token', token);
      localStorage.setItem('token', token);
      if (user) {
        localStorage.setItem('jenga_user', JSON.stringify(user));
      }

      // Update AuthContext state
      login(token, user);

      // Redirect seller to marketplace or dashboard
      navigate('/marketplace');
    } catch (err: unknown) {
      const apiError = err as {
        response?: { data?: { error?: string; message?: string } | string };
        message?: string;
      };

      let message = 'Login failed. Please verify your credentials.';
      if (typeof apiError.response?.data === 'string') {
        message = apiError.response.data;
      } else if (apiError.response?.data?.message) {
        message = apiError.response.data.message;
      } else if (apiError.response?.data?.error) {
        message = apiError.response.data.error;
      } else if (apiError.message) {
        message = apiError.message;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-sm text-gray-500 mt-1">Sign in to your Jenga P2P account</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-accent-red/10 border border-accent-red/20 text-accent-red rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="label-text">Email</label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="seller@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="label-text">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-jenga-600 font-medium hover:text-jenga-700">
              Get Started
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}