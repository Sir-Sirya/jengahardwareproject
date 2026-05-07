import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Store, LayoutDashboard, Bell, LogOut, User, Hammer, Shield } from 'lucide-react';
import { useState } from 'react';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { isAuthenticated, isSeller, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 text-jenga-700 font-bold text-xl">
              <Hammer className="h-6 w-6" />
              <span className="hidden sm:inline">Jenga P2P</span>
            </Link>
            <Link
              to="/marketplace"
              className="ml-6 text-sm font-medium text-gray-600 hover:text-jenga-600 transition-colors"
            >
              Marketplace
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <NotificationBell />
                {isSeller && (
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-jenga-600 transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-jenga-600 transition-colors"
                  >
                    <Shield className="h-4 w-4" />
                    Admin
                  </Link>
                )}
                <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                  <span className="text-sm text-gray-700">{user?.fullName}</span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-accent-red transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="btn-secondary text-sm">
                  Log In
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-2">
          <Link
            to="/marketplace"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
            onClick={() => setMobileOpen(false)}
          >
            <Store className="inline h-4 w-4 mr-2" />
            Marketplace
          </Link>
          {isAuthenticated ? (
            <>
              {isSeller && (
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => setMobileOpen(false)}
                >
                  <LayoutDashboard className="inline h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => setMobileOpen(false)}
                >
                  <Shield className="inline h-4 w-4 mr-2" />
                  Admin
                </Link>
              )}
              <Link
                to="/notifications"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setMobileOpen(false)}
              >
                <Bell className="inline h-4 w-4 mr-2" />
                Notifications
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              >
                <LogOut className="inline h-4 w-4 mr-2" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setMobileOpen(false)}
              >
                <User className="inline h-4 w-4 mr-2" />
                Log In
              </Link>
              <Link
                to="/register"
                className="block px-3 py-2 rounded-md text-base font-medium text-jenga-700 hover:bg-jenga-50"
                onClick={() => setMobileOpen(false)}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
