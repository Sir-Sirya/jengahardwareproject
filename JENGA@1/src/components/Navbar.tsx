import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { categoryApi } from '../services/api';
import NotificationBell from './NotificationBell';
import {
  Hammer,
  Search,
  ChevronDown,
  Heart,
  X,
  Menu,
  Store,
  Info,
  Phone,
  User,
  ShieldCheck,
  Package
} from 'lucide-react';
import type { Category, Product } from '../types';

// The 9 agreed main parent categories
export const AGREED_MAIN_CATEGORIES: { id: number; name: string; slug: string }[] = [
  { id: 1, name: 'Paints & Painting Supplies', slug: 'paints-painting' },
  { id: 2, name: 'Gate Accessories', slug: 'gate-accessories' },
  { id: 3, name: 'Doors & Frames', slug: 'doors-frames' },
  { id: 4, name: 'Ceramics & Sanitaryware', slug: 'ceramics-sanitaryware' },
  { id: 5, name: 'Timber & Boards', slug: 'timber-boards' },
  { id: 6, name: 'Aluminium, Glass & Windows', slug: 'aluminium-glass' },
  { id: 7, name: 'Ceilings & Gypsum', slug: 'ceilings-gypsum' },
  { id: 8, name: 'Professional Workshop Services', slug: 'professional-services' },
  { id: 9, name: 'Cement & Construction Chemicals', slug: 'cement-chemicals' },
];

export default function Navbar() {
  const { isAuthenticated, isSeller, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>(AGREED_MAIN_CATEGORIES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showWatchlist, setShowWatchlist] = useState(false);
  const [watchlist, setWatchlist] = useState<Product[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  const watchlistRef = useRef<HTMLDivElement>(null);
  const categoryMenuRef = useRef<HTMLDivElement>(null);

  const isBuyer = user?.role === 'BUYER';

  const loadWatchlist = () => {
    if (user) {
      const stored = localStorage.getItem(`jenga_watchlist_${user.id}`);
      if (stored) {
        try {
          setWatchlist(JSON.parse(stored));
        } catch {
          setWatchlist([]);
        }
      } else {
        setWatchlist([]);
      }
    } else {
      setWatchlist([]);
    }
  };

  useEffect(() => {
    loadWatchlist();
    window.addEventListener('watchlistUpdated', loadWatchlist);
    return () => window.removeEventListener('watchlistUpdated', loadWatchlist);
  }, [user]);

  // Fetch categories and match strictly to the 9 agreed parent IDs
  useEffect(() => {
    categoryApi
      .getAll()
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          const matched = AGREED_MAIN_CATEGORIES.map((def) => {
            const found = res.data.find((c: any) => Number(c.id) === def.id);
            return found ? { ...def, name: found.name, slug: found.slug } : def;
          });
          setCategories(matched);
        }
      })
      .catch(() => {
        setCategories(AGREED_MAIN_CATEGORIES);
      });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set('search', searchTerm.trim());
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    navigate(`/marketplace?${params.toString()}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const removeFromWatchlist = (e: React.MouseEvent, productId: number) => {
    e.stopPropagation();
    if (!user) return;
    const updated = watchlist.filter((p) => p.id !== productId);
    localStorage.setItem(`jenga_watchlist_${user.id}`, JSON.stringify(updated));
    setWatchlist(updated);
    window.dispatchEvent(new Event('watchlistUpdated'));
  };

  return (
    <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      {/* 1. Top Utility Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex justify-between items-center text-xs text-gray-600 border-b border-gray-100">
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <span>
              Hi, <strong className="text-gray-900">{user?.fullName}</strong>! (
              <button onClick={handleLogout} className="text-jenga-700 hover:underline ml-1">
                Logout
              </button>
              )
            </span>
          ) : (
            <span>
              Hi!{' '}
              <Link to="/login" className="text-jenga-700 font-semibold hover:underline">
                Sign In
              </Link>{' '}
              or{' '}
              <Link to="/register" className="text-jenga-700 font-semibold hover:underline">
                Register
              </Link>
            </span>
          )}
          <Link to="/about" className="hidden sm:inline hover:text-jenga-700">
            About Us
          </Link>
          <Link to="/contact" className="hidden sm:inline hover:text-jenga-700">
            Contact Us
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Buyer Profile Button */}
          {isAuthenticated && (
            <Link
              to="/profile"
              className="flex items-center gap-1.5 hover:text-jenga-700 font-semibold text-gray-700 transition"
            >
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>Buyer Profile</span>
            </Link>
          )}

          {/* Role-Sensitive Seller Navigation: hidden for BUYER */}
          {isSeller ? (
            <Link to="/dashboard" className="hover:text-jenga-700 font-semibold text-accent-orange">
              Seller Dashboard
            </Link>
          ) : (
            !isBuyer && (
              <Link to={isAuthenticated ? '/dashboard' : '/login'} className="hover:text-jenga-700 font-medium">
                Sell on Jenga
              </Link>
            )
          )}

          {/* Admin Portal Link */}
          {isAdmin && (
            <Link to="/admin" className="hover:text-jenga-700 font-semibold text-jenga-700 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </Link>
          )}

          {/* Watchlist */}
          <div className="relative" ref={watchlistRef}>
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  alert('Please sign in to view your Watchlist.');
                  navigate('/login');
                  return;
                }
                setShowWatchlist(!showWatchlist);
              }}
              className="flex items-center gap-1 hover:text-jenga-700 font-medium py-1"
            >
              <span>Watchlist</span>
              {watchlist.length > 0 && (
                <span className="bg-jenga-700 text-white rounded-full text-[10px] px-1.5 py-0.2 font-bold">
                  {watchlist.length}
                </span>
              )}
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {showWatchlist && isAuthenticated && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-2">
                  <span className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600" /> My Watchlist ({watchlist.length})
                  </span>
                  <button onClick={() => setShowWatchlist(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {watchlist.length === 0 ? (
                  <p className="text-gray-500 text-xs py-6 text-center">
                    No items in watchlist. Click the heart on any product to track deals.
                  </p>
                ) : (
                  <div className="max-h-72 overflow-y-auto space-y-2">
                    {watchlist.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setShowWatchlist(false);
                          navigate(`/product/${item.id}`);
                        }}
                        className="flex items-center justify-between gap-3 p-2 hover:bg-gray-50 rounded-xl cursor-pointer border border-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={item.imageUrl || '/placeholder.png'}
                            alt={item.title}
                            className="w-10 h-10 object-cover rounded-lg border border-gray-200 shrink-0"
                          />
                          <div className="truncate">
                            <p className="font-semibold text-gray-900 text-xs truncate">{item.title}</p>
                            <p className="text-jenga-700 font-bold text-xs">
                              KES {Number(item.price).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => removeFromWatchlist(e, item.id)}
                          className="text-gray-400 hover:text-rose-600 p-1"
                          title="Remove item"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {isAuthenticated && <NotificationBell />}
        </div>
      </div>

      {/* 2. Main Search Bar Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0 text-jenga-700 font-extrabold text-xl tracking-tight">
          <div className="w-10 h-10 rounded-xl bg-jenga-700 text-white flex items-center justify-center font-black text-xl shadow-md">
            <Hammer className="h-5 w-5" />
          </div>
          <span className="hidden sm:inline">
            Jenga <span className="text-accent-orange">MarketPlace</span>
          </span>
        </Link>

        {/* Categories Menu */}
        <div className="relative hidden md:block" ref={categoryMenuRef}>
          <button
            type="button"
            onClick={() => setShowCategoryMenu(!showCategoryMenu)}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-jenga-700 py-2"
          >
            <span>All Categories</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {showCategoryMenu && (
            <div className="absolute left-0 mt-2 w-72 bg-white border border-gray-200 rounded-2xl shadow-2xl p-2 z-50">
              <div className="px-3 py-2 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Shop by Categories
              </div>
              <div className="py-1">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setShowCategoryMenu(false);
                      navigate(`/marketplace?category=${cat.id}`);
                    }}
                    className="w-full text-left text-xs font-semibold text-gray-700 hover:text-jenga-700 hover:bg-jenga-50 px-3 py-2 rounded-lg transition-colors truncate block"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl flex items-center">
          <div className="flex-1 flex items-center border-2 border-jenga-800 rounded-l-full px-3 py-1.5 bg-white shadow-inner">
            <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search timber, steel doors, tiles, glass & windows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs sm:text-sm text-gray-900 outline-none bg-transparent"
            />
            <div className="h-4 w-[1px] bg-gray-300 mx-2 hidden sm:block"></div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs text-gray-600 bg-transparent outline-none cursor-pointer pr-2 hidden sm:block max-w-[160px] truncate"
            >
              <option value="all">All Categories</option>
              {categories.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="bg-jenga-700 hover:bg-jenga-800 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-r-full shadow transition-colors"
          >
            Search
          </button>
        </form>

        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* 3. Horizontal Categories Strip */}
      <nav className="border-t border-gray-100 hidden md:block bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-6 overflow-x-auto py-2 text-xs font-semibold text-gray-700">
          <Link to="/marketplace" className="hover:text-jenga-700 shrink-0">
            All Products
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/marketplace?category=${cat.id}`}
              className="hover:text-jenga-700 shrink-0 whitespace-nowrap"
            >
              {cat.name}
            </Link>
          ))}
          <Link to="/marketplace?sort=price-asc" className="text-accent-orange font-bold hover:underline shrink-0">
            Special Deals
          </Link>
        </div>
      </nav>

      {/* 4. Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-2">
          {isAuthenticated && (
            <Link
              to="/profile"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setMobileOpen(false)}
            >
              <User className="inline h-4 w-4 mr-2 text-blue-600" />
              Buyer Profile
            </Link>
          )}

          {isSeller && (
            <Link
              to="/dashboard"
              className="block px-3 py-2 rounded-md text-base font-medium text-accent-orange hover:bg-gray-50"
              onClick={() => setMobileOpen(false)}
            >
              <Package className="inline h-4 w-4 mr-2 text-accent-orange" />
              Seller Dashboard
            </Link>
          )}

          {!isAuthenticated && (
            <Link
              to="/login"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setMobileOpen(false)}
            >
              <Store className="inline h-4 w-4 mr-2 text-jenga-700" />
              Sell on Jenga
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              className="block px-3 py-2 rounded-md text-base font-medium text-jenga-700 hover:bg-gray-50"
              onClick={() => setMobileOpen(false)}
            >
              <ShieldCheck className="inline h-4 w-4 mr-2 text-jenga-700" />
              Admin Portal
            </Link>
          )}

          <Link
            to="/marketplace"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
            onClick={() => setMobileOpen(false)}
          >
            <Store className="inline h-4 w-4 mr-2 text-jenga-700" />
            Marketplace
          </Link>
          <Link
            to="/about"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
            onClick={() => setMobileOpen(false)}
          >
            <Info className="inline h-4 w-4 mr-2 text-jenga-700" />
            About Us
          </Link>
          <Link
            to="/contact"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
            onClick={() => setMobileOpen(false)}
          >
            <Phone className="inline h-4 w-4 mr-2 text-jenga-700" />
            Contact Us
          </Link>
        </div>
      )}
    </header>
  );
}