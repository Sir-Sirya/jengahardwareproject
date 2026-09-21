import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  Video,
  Image as ImageIcon,
  CheckCircle2,
  ShoppingCart,
  Plus,
  Minus
} from 'lucide-react';
import type { Product } from '../types';
import { getMediaUrl } from '../utils/imageUrl';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [activeMediaTab, setActiveMediaTab] = useState<'image' | 'video'>('image');
  const [copied, setCopied] = useState<boolean>(false);

  // Customization & Ordering State
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedVariation, setSelectedVariation] = useState<string>('Standard Spec');

  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      setError('');
      try {
        const res = await productApi.getById(Number(id));
        if (isMounted) {
          const item = res.data;
          setProduct({
            ...item,
            imageUrl: getMediaUrl(item?.imageUrl),
            videoUrl: item?.videoUrl ? getMediaUrl(item.videoUrl) : undefined
          });
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError('Failed to load product details.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const isLowStock = product && (product.stockQuantity ?? 0) <= 5;
  const isOutOfStock = !!product && (product.stockQuantity ?? 0) === 0;

  const handleBuyNow = () => {
    if (!product) return;

    if (!isAuthenticated) {
      alert('Please sign in or register to complete your order checkout.');
      navigate('/login?redirect=/checkout');
      return;
    }

    // Prepare item including selected variation specification
    const cartItem = {
      product: {
        ...product,
        title: selectedVariation !== 'Standard Spec' 
          ? `${product.title} (${selectedVariation})` 
          : product.title
      },
      quantity: quantity
    };

    // Store configured order item in localStorage for Checkout.tsx
    localStorage.setItem('jenga_cart', JSON.stringify([cartItem]));
    navigate('/checkout');
  };

  const generateWhatsAppLink = (prod: Product) => {
    const phone = prod.whatsappLink?.replace(/\D/g, '') || prod.seller?.phoneNumber?.replace(/\D/g, '') || '';
    const unitPrice = Number(prod.price || 0);
    const totalPrice = (unitPrice * quantity).toLocaleString();
    
    const text = encodeURIComponent(
      `Hi, I am interested in "${prod.title}" (${selectedVariation}, Qty: ${quantity}) listed on Jenga Marketplace for KES ${totalPrice}. Is it ready for delivery/collection in Gikomba?`
    );
    return `https://wa.me/${phone}?text=${text}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-slate-500 mb-4">{error || 'Product not found.'}</p>
        <Link 
          to="/marketplace" 
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const unitPrice = Number(product.price || 0);
  const totalItemCost = unitPrice * quantity;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Link */}
      <Link
        to="/marketplace"
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 mb-6 transition font-bold"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Marketplace
      </Link>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Media Preview Container */}
        <div className="space-y-3">
          <div className="bg-slate-900/5 rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm relative flex items-center justify-center min-h-[340px] max-h-[500px] aspect-[4/3]">
            {activeMediaTab === 'video' && product.videoUrl ? (
              <video
                src={getMediaUrl(product.videoUrl)}
                controls
                autoPlay
                playsInline
                className="w-full h-full max-h-[500px] object-contain rounded-3xl bg-black"
              />
            ) : product.imageUrl ? (
              <img
                src={getMediaUrl(product.imageUrl)}
                alt={product.title}
                className="w-full h-full max-h-[500px] object-contain transition-all duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/600x450?text=Hardware+Item';
                }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-8">
                <Package className="h-16 w-16 mb-2 stroke-1" />
                <span className="text-xs">No media preview uploaded</span>
              </div>
            )}
          </div>

          {/* Media Switcher Buttons */}
          {product.videoUrl && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveMediaTab('image')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold border transition ${
                  activeMediaTab === 'image'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <ImageIcon className="h-4 w-4" />
                Photo View
              </button>
              <button
                type="button"
                onClick={() => setActiveMediaTab('video')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold border transition ${
                  activeMediaTab === 'video'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Video className="h-4 w-4 text-red-500" />
                Video Preview
              </button>
            </div>
          )}
        </div>

        {/* Configuration, Pricing & Ordering */}
        <div className="space-y-6">
          <div>
            {product.category && (
              <span className="text-[11px] font-bold text-blue-600 uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                {product.category.name}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3 leading-tight">
              {product.title}
            </h1>
            <div className="flex items-baseline gap-3 mt-2">
              <p className="text-3xl font-black text-blue-600">
                KES {totalItemCost.toLocaleString()}
              </p>
              {quantity > 1 && (
                <span className="text-xs text-slate-400 font-semibold">
                  (KES {unitPrice.toLocaleString()} each)
                </span>
              )}
            </div>
          </div>

          {/* Inventory Availability Tag */}
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
                isOutOfStock
                  ? 'bg-slate-100 text-slate-600 border border-slate-200'
                  : isLowStock
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              <Package className="h-3.5 w-3.5" />
              {product.stockQuantity ?? 0} in stock
            </span>
            {isLowStock && !isOutOfStock && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600">
                <AlertTriangle className="h-3.5 w-3.5" />
                Fast moving stock
              </span>
            )}
          </div>

          {/* Configuration Module */}
          <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                Specification / Dimension
              </label>
              <div className="flex flex-wrap gap-2">
                {['Standard Spec', 'Custom Cut / Fit', 'Heavy Gauge Grade'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSelectedVariation(option)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition ${
                      selectedVariation === option
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                Order Quantity
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 disabled:opacity-30 transition"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 text-xs font-bold text-slate-900">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(product.stockQuantity || 1, q + 1))}
                    disabled={quantity >= (product.stockQuantity || 1)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 disabled:opacity-30 transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  Max available: {product.stockQuantity ?? 0}
                </span>
              </div>
            </div>

            {/* Direct Checkout Button */}
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-4 h-4" />
              {isOutOfStock ? 'Sold Out' : `Buy Now — KES ${totalItemCost.toLocaleString()}`}
            </button>
          </div>

          {/* Description Section */}
          <div>
            <h3 className="text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-2">
              Specifications & Details
            </h3>
            <p className="text-slate-600 leading-relaxed text-xs sm:text-sm whitespace-pre-line">
              {product.description || 'No detailed specifications provided for this product.'}
            </p>
          </div>

          {/* Gikomba Vendor Information */}
          <div className="border-t border-slate-100 pt-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Gikomba Vendor Information</h3>
            
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-700 font-bold">
                <MapPin className="h-4 w-4 text-amber-600 shrink-0" />
                <span>
                  Store: <strong>{product.seller?.fullName || 'Wagenis Universe Hardware'}</strong>
                </span>
              </div>
              <p className="text-slate-500 pl-6 font-medium">
                Market location: Near KCB Bank, Gikomba Market, Nairobi
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {(product.whatsappLink || product.seller?.phoneNumber) && (
                <a
                  href={generateWhatsAppLink(product)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-700 transition shadow-sm"
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat on WhatsApp
                </a>
              )}
              {product.seller?.phoneNumber && (
                <a
                  href={`tel:${product.seller.phoneNumber}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
                >
                  <Phone className="h-4 w-4 text-blue-600" />
                  Call Vendor
                </a>
              )}
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Copied Link
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4 text-slate-400" />
                    Share Product
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}