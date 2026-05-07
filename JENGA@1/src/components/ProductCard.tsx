import { Link } from 'react-router-dom';
import { MapPin, Phone, AlertTriangle } from 'lucide-react';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  showSellerInfo?: boolean;
  isDashboard?: boolean;
}

export default function ProductCard({ product, showSellerInfo = true, isDashboard = false }: ProductCardProps) {
  const isLowStock = product.stockQuantity <= 5;

  return (
    <div className="card group hover:shadow-md transition-shadow">
      <Link to={`/product/${product.id}`}>
        <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-sm">No Image</span>
            </div>
          )}
          {isLowStock && !isDashboard && (
            <span className="absolute top-2 right-2 bg-accent-red text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Low Stock
            </span>
          )}
        </div>
      </Link>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-1">{product.title}</h3>
          <span className="text-jenga-700 font-bold text-sm whitespace-nowrap ml-2">
            KES {product.price.toLocaleString()}
          </span>
        </div>

        {product.category && (
          <p className="text-xs text-gray-500 mb-2">{product.category.name}</p>
        )}

        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{product.description || 'No description'}</p>

        {isDashboard && (
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${
                isLowStock
                  ? 'bg-accent-red/10 text-accent-red'
                  : 'bg-accent-green/10 text-accent-green'
              }`}
            >
              {product.stockQuantity} in stock
            </span>
            {isLowStock && (
              <span className="text-xs text-accent-red font-medium flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Restock needed
              </span>
            )}
          </div>
        )}

        {showSellerInfo && product.seller && (
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="h-3 w-3" />
              <span>{product.seller.fullName}</span>
            </div>
            {product.whatsappLink && (
              <a
                href={product.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-xs text-accent-green hover:text-green-700 font-medium"
              >
                <Phone className="h-3 w-3" />
                WhatsApp
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
