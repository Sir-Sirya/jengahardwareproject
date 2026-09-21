import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, AlertTriangle, Video, Package } from 'lucide-react';
import type { Product } from '../types';
import { getMediaUrl } from '../utils/imageUrl';

interface ProductCardProps {
  product: Product;
  showSellerInfo?: boolean;
  isDashboard?: boolean;
}

export default function ProductCard({
  product,
  showSellerInfo = true,
  isDashboard = false,
}: ProductCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const isLowStock = (product.stockQuantity ?? 0) <= 5;

  // Resolves media URL through the tunnel-safe helper (relative path for Vite proxy)
  const resolvedImageUrl = getMediaUrl(product.imageUrl);
  const hasValidImage = Boolean(
    product.imageUrl && 
    product.imageUrl.trim() !== '' && 
    resolvedImageUrl !== '/placeholder.png'
  );

  return (
    <div className="card group hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden bg-white border border-gray-100 rounded-xl">
      <div>
        <Link to={`/product/${product.id}`} className="block relative">
          <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden flex items-center justify-center">
            {hasValidImage && !imageFailed ? (
              <>
                {/* Blurred backdrop fill for portrait mobile shots */}
                <div
                  className="absolute inset-0 bg-cover bg-center filter blur-md opacity-25 scale-110"
                  style={{ backgroundImage: `url(${resolvedImageUrl})` }}
                  aria-hidden="true"
                />

                {/* Primary Image: object-contain preserves portrait/landscape dimensions without cropping */}
                <img
                  src={resolvedImageUrl}
                  alt={product.title}
                  className="relative z-10 w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  onError={() => setImageFailed(true)}
                />
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                <Package className="h-10 w-10 mb-1 stroke-1" />
                <span className="text-xs">No preview available</span>
              </div>
            )}

            {/* Badges Overlay */}
            <div className="absolute top-2 right-2 z-20 flex flex-col gap-1 items-end">
              {isLowStock && !isDashboard && (
                <span className="bg-accent-red text-white text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 shadow-sm">
                  <AlertTriangle className="h-3 w-3" />
                  Low Stock
                </span>
              )}
            </div>

            {/* 30-Second Video Indicator Badge */}
            {product.videoUrl && (
              <span className="absolute bottom-2 left-2 z-20 bg-slate-900/80 backdrop-blur-sm text-white text-[11px] px-2 py-0.5 rounded-md font-medium flex items-center gap-1 shadow-sm">
                <Video className="h-3 w-3 text-red-400" />
                30s Video
              </span>
            )}
          </div>
        </Link>

        <div className="p-4">
          <div className="flex justify-between items-start mb-1.5">
            <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-jenga-700 transition-colors">
              {product.title}
            </h3>
            <span className="text-jenga-700 font-bold text-sm whitespace-nowrap ml-2">
              KES {Number(product.price || 0).toLocaleString()}
            </span>
          </div>

          {product.category && (
            <p className="text-xs font-medium text-gray-500 mb-2">
              {product.category.name}
            </p>
          )}

          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">
            {product.description || 'No product description provided.'}
          </p>

          {isDashboard && (
            <div className="flex items-center gap-2 mb-3">
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  isLowStock
                    ? 'bg-accent-red/10 text-accent-red'
                    : 'bg-accent-green/10 text-accent-green'
                }`}
              >
                {product.stockQuantity ?? 0} in stock
              </span>
              {isLowStock && (
                <span className="text-xs text-accent-red font-medium flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Restock needed
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {showSellerInfo && product.seller && (
        <div className="px-4 pb-3">
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              <span className="truncate max-w-[130px]">{product.seller.fullName}</span>
            </div>
            {product.whatsappLink && (
              <a
                href={product.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-xs text-accent-green hover:text-green-700 font-medium transition-colors"
              >
                <Phone className="h-3 w-3" />
                WhatsApp
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}