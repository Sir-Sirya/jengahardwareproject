import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Hammer, Search, Shield, TrendingUp, Store, ArrowRight } from 'lucide-react';

export default function Home() {
  const { isAuthenticated, isSeller } = useAuth();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-jenga-700 to-jenga-900 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Buy & Sell Hardware. Directly.
            </h1>
            <p className="text-lg md:text-xl text-jenga-100 mb-8">
              Jenga P2P connects buyers with Gikomba vendors directly. No middlemen.
              No hidden taxes. Just pure hardware marketplace.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/marketplace" className="inline-flex items-center gap-2 bg-white text-jenga-800 px-6 py-3 rounded-lg font-semibold hover:bg-jenga-50 transition-colors">
                <Search className="h-5 w-5" />
                Browse Marketplace
              </Link>
              {!isAuthenticated && (
                <Link to="/register" className="inline-flex items-center gap-2 bg-accent-orange text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors">
                  <Store className="h-5 w-5" />
                  Start Selling
                </Link>
              )}
              {isAuthenticated && isSeller && (
                <Link to="/dashboard" className="inline-flex items-center gap-2 bg-accent-orange text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors">
                  <TrendingUp className="h-5 w-5" />
                  My Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
            Why Jenga P2P?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl bg-gray-50">
              <div className="w-12 h-12 bg-jenga-100 text-jenga-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Hammer className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Direct P2P Connection</h3>
              <p className="text-sm text-gray-600">
                Connect with sellers via WhatsApp and M-Pesa. No platform commissions, no order tracing.
              </p>
            </div>
            <div className="text-center p-6 rounded-xl bg-gray-50">
              <div className="w-12 h-12 bg-accent-green/10 text-accent-green rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Secure & Simple</h3>
              <p className="text-sm text-gray-600">
                Verified vendor profiles, encrypted data, and an interface anyone can use in minutes.
              </p>
            </div>
            <div className="text-center p-6 rounded-xl bg-gray-50">
              <div className="w-12 h-12 bg-accent-orange/10 text-accent-orange rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Grow Your Reach</h3>
              <p className="text-sm text-gray-600">
                Your own digital storefront with SEO-friendly listings. Go beyond Gikomba borders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-jenga-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Post Your Product</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Vendors add items with price, stock level, and a WhatsApp link. We track inventory automatically.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-jenga-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Buyers Discover</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Buyers browse by category, see real-time stock, and connect directly with the seller.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-jenga-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Settle P2P</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Payment and delivery arranged directly between buyer and seller via M-Pesa and WhatsApp.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <h4 className="font-semibold text-gray-900 mb-4">For Vendors</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-jenga-600" />
                  Automatic low-stock alerts via dashboard
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-jenga-600" />
                  Your own online storefront URL
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-jenga-600" />
                  Zero platform commission on sales
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-jenga-600" />
                  Built-in lead tracking for business analytics
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
