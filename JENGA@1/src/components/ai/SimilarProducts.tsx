import React, { useEffect, useState } from 'react';
import { ProductDto } from '../../types/ai';
import { fetchSimilarProducts } from '../../services/aiService';

interface Props {
  productId: number;
}

export const SimilarProducts: React.FC<Props> = ({ productId }) => {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchSimilarProducts(productId, 4)
      .then((data) => {
        if (isMounted) {
          setProducts(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [productId]);

  if (loading) {
    return (
      <div className="py-6 text-gray-500 text-sm animate-pulse">
        Finding smart product recommendations...
      </div>
    );
  }

  if (!products.length) return null;

  return (
    <section className="mt-12 pt-8 border-t border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">Similar & Complementary Products</h3>
        <span className="text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full font-medium">
          AI-Matched
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((item) => (
          <div
            key={item.id}
            className="group flex flex-col justify-between border border-gray-100 rounded-xl p-3 bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <div>
              <div className="h-36 w-full bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
                <img
                  src={item.imageUrl || '/placeholder.png'}
                  alt={item.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <span className="text-[11px] text-gray-400 mt-2 block uppercase tracking-wider">
                {item.categoryName || 'Hardware'}
              </span>
              <h4 className="font-semibold text-sm text-gray-800 line-clamp-2 mt-1">
                {item.title}
              </h4>
            </div>

            <div className="mt-3 pt-2 border-t border-gray-50 flex items-center justify-between">
              <p className="text-sm font-extrabold text-blue-600">
                KES {item.price.toLocaleString()}
              </p>
              <a
                href={`/products/${item.id}`}
                className="text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-md transition-colors"
              >
                View
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};