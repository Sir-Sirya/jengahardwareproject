import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productApi, categoryApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AGREED_MAIN_CATEGORIES } from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import {
  Flame,
  ArrowRight,
  Loader2,
  Package,
  Shield,
  Clock,
  TrendingUp,
  Paintbrush,
  Fence,
  DoorOpen,
  Bath,
  TreePine,
  Layers,
  Sparkles,
  Wrench,
  Construction,
} from 'lucide-react';
import type { Product, Category } from '../types';
import { getMediaUrl } from '../utils/imageUrl';

export default function Home() {
  const { isAuthenticated, isSeller } = useAuth();
  const navigate = useNavigate();

  const [parentCategories, setParentCategories] = useState<Category[]>(AGREED_MAIN_CATEGORIES);
  const [deals, setDeals] = useState<Product[]>([]);
  const [trending, setTrending] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Distinct icons for the 9 agreed parent categories
  const getParentIcon = (id: number) => {
    switch (id) {
      case 1:
        return <Paintbrush className="w-8 h-8 text-indigo-600" />;
      case 2:
        return <Fence className="w-8 h-8 text-amber-600" />;
      case 3:
        return <DoorOpen className="w-8 h-8 text-blue-600" />; // Doors & Frames
      case 4:
        return <Bath className="w-8 h-8 text-teal-600" />; // Ceramics & Sanitaryware
      case 5:
        return <TreePine className="w-8 h-8 text-emerald-600" />; // Timber & Boards
      case 6:
        return <Layers className="w-8 h-8 text-cyan-600" />; // Aluminium, Glass & Windows
      case 7:
        return <Sparkles className="w-8 h-8 text-violet-600" />; // Ceilings & Gypsum
      case 8:
        return <Wrench className="w-8 h-8 text-slate-600" />; // Professional Workshop Services
      case 9:
        return <Construction className="w-8 h-8 text-orange-600" />; // Cement & Construction Chemicals
      default:
        return <Package className="w-8 h-8 text-jenga-700" />;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [catRes, dealsRes, trendingRes] = await Promise.allSettled([
          categoryApi.getAll(),
          productApi.getPublicProducts('price-asc'),
          productApi.getTrending ? productApi.getTrending(8) : productApi.getPublicProducts('newest'),
        ]);

        // Category syncing
        if (catRes.status === 'fulfilled' && Array.isArray(catRes.value.data) && catRes.value.data.length > 0) {
          const matched = AGREED_MAIN_CATEGORIES.map((def) => {
            const found = catRes.value.data.find((c: any) => Number(c.id) === def.id);
            return found ? { ...def, name: found.name, slug: found.slug } : def;
          });
          setParentCategories(matched);
        } else {
          setParentCategories(AGREED_MAIN_CATEGORIES);
        }

        // Today's Deals (lowest prices / sorted deals)
        if (dealsRes.status === 'fulfilled' && Array.isArray(dealsRes.value.data)) {
          setDeals(dealsRes.value.data.slice(0, 4));
        }

        // Trending Items
        if (trendingRes.status === 'fulfilled' && Array.isArray(trendingRes.value.data)) {
          setTrending(trendingRes.value.data.slice(0, 8));
        }
      } catch (err) {
        console.error('Failed to load home catalog data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* 1. Hero Promotional Banner */}
      <section className="bg-gradient-to-br from-jenga-700 to-jenga-900 text-white py-12 md:py-16 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-block bg-accent-orange text-white text-xs font-bold uppercase px-3 py-1 rounded-md mb-3 tracking-wider">
              Online Wholesale Hardware
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Buy & Sell Hardware. Directly.
            </h1>
            <p className="text-base sm:text-lg text-jenga-100 mt-3">
              Direct connection to certified timber, steel doors, glass & windows, cement, and electrical supplies. Pure E-commerce with zero broker cuts.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/marketplace')}
                className="bg-white text-jenga-800 px-6 py-3 rounded-xl font-bold hover:bg-jenga-50 transition-colors shadow"
              >
                Browse Marketplace
              </button>
              {!isAuthenticated && (
                <button
                  onClick={() => navigate('/register')}
                  className="bg-accent-orange text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors shadow"
                >
                  Start Selling
                </button>
              )}
              {isAuthenticated && isSeller && (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-accent-orange text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors shadow"
                >
                  Seller Dashboard
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 2. Visual Category Cards: Strictly the 9 Main Categories */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Shop by Categories</h2>
              <p className="text-xs text-gray-500">Explore verified construction and finishing supplies</p>
            </div>
            <button
              onClick={() => navigate('/marketplace')}
              className="text-xs font-bold text-jenga-700 hover:underline"
            >
              See all products →
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3">
            {parentCategories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => navigate(`/marketplace?category=${cat.id}`)}
                className="group cursor-pointer flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gray-50 border border-gray-200/80 shadow-sm flex items-center justify-center p-3 group-hover:border-jenga-600 group-hover:shadow-md transition-all">
                  {getParentIcon(cat.id)}
                </div>
                <span className="mt-2 text-xs font-bold text-gray-800 group-hover:text-jenga-700 transition-colors line-clamp-2">
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Value Props Strip */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 p-4 rounded-2xl bg-gray-50 border border-gray-100 text-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-jenga-100 text-jenga-700 rounded-lg flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs">24/7 Direct Inquiries</h4>
              <p className="text-[11px] text-gray-500">Connect directly via WhatsApp and direct line</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-green/10 text-accent-green rounded-lg flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs">Vetted Gikomba Merchants</h4>
              <p className="text-[11px] text-gray-500">Verified store profiles and direct Till/Paybill numbers</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-orange/10 text-accent-orange rounded-lg flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs">Direct Wholesale Rates</h4>
              <p className="text-[11px] text-gray-500">Real manufacturer and wholesale rates</p>
            </div>
          </div>
        </section>

        {/* 4. Today's Deals Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-accent-orange" />
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Today's Deals</h2>
            </div>
            <button
              onClick={() => navigate('/marketplace?sort=price-asc')}
              className="text-xs font-bold text-jenga-700 hover:underline flex items-center gap-1"
            >
              View all deals <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-jenga-600 animate-spin" />
            </div>
          ) : deals.length === 0 ? (
            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-8 text-center text-gray-500 text-xs">
              No product deals currently available.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {deals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* 5. Trending Hardware Section */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-gray-900 tracking-tight">Trending Hardware Listings</h2>
            <button
              onClick={() => navigate('/marketplace?sort=newest')}
              className="text-xs font-bold text-jenga-700 hover:underline flex items-center gap-1"
            >
              Explore all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-jenga-600 animate-spin" />
            </div>
          ) : trending.length === 0 ? (
            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-8 text-center text-gray-500 text-xs">
              No trending listings found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trending.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}