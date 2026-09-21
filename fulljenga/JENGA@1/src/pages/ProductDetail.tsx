import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  MapPin,
  Phone,
  MessageCircle,
  AlertTriangle,
  Share2,
  Loader2,
  Package,
} from 'lucide-react';
import type { Product } from '../types';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await productApi.getById(Number(id));
        setProduct(res.data);
      } catch {
        setError('Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const isLowStock = product && product.stockQuantity <= 5;

  const generateWhatsAppLink = (product: Product) => {
    const phone = product.whatsappLink?.replace(/\D/g, '') || '';
    const text = encodeURIComponent(
      `Hi, I'm interested in "${product.title}" listed on Jenga P2P for KES ${product.price.toLocaleString()}. Is it still available?`
    );
    return `https://wa.me/${phone}?text=${text}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-jenga-600 animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500">{error || 'Product not found.'}</p>
        <Link to="/marketplace" className="btn-primary mt-4 inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to="/marketplace"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Marketplace
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm">
          <div className="aspect-[4/3] bg-gray-100">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Package className="h-16 w-16" />
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            {product.category && (
              <span className="text-xs font-medium text-jenga-700 bg-jenga-50 px-2 py-1 rounded-full">
                {product.category.name}
              </span>
            )}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">{product.title}</h1>
            <p className="text-3xl font-bold text-jenga-700 mt-2">
              KES {product.price.toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-full ${
                isLowStock
                  ? 'bg-accent-red/10 text-accent-red'
                  : 'bg-accent-green/10 text-accent-green'
              }`}
            >
              <Package className="h-4 w-4" />
              {product.stockQuantity} in stock
            </span>
            {isLowStock && (
              <span className="inline-flex items-center gap-1 text-sm font-medium text-accent-red">
                <AlertTriangle className="h-4 w-4" />
                Low stock — act fast
              </span>
            )}
          </div>

          <p className="text-gray-600 leading-relaxed">
            {product.description || 'No description provided.'}
          </p>

          {/* P2P Actions */}
          <div className="border-t border-gray-100 pt-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Connect with Seller</h3>
            {product.seller && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4 text-gray-400" />
                Sold by <span className="font-medium text-gray-900">{product.seller.fullName}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {product.whatsappLink && (
                <a
                  href={generateWhatsAppLink(product)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-accent-green text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-600 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp Seller
                </a>
              )}
              <a
                href={`tel:${product.seller?.phoneNumber || ''}`}
                className="inline-flex items-center gap-2 btn-secondary"
              >
                <Phone className="h-4 w-4" />
                Call
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                }}
                className="inline-flex items-center gap-2 btn-secondary"
              >
                <Share2 className="h-4 w-4" />
                Copy Link
              </button>
            </div>
          </div>

          {!isAuthenticated && (
            <div className="bg-jenga-50 border border-jenga-100 rounded-lg p-4 text-sm text-jenga-800">
              <Link to="/login" className="font-semibold underline">
                Sign in
              </Link>{' '}
              to track this lead and receive updates.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
