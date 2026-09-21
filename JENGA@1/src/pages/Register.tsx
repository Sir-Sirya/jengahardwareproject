import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { productApi, categoryApi } from '../services/api';
import ProductCard from '../components/ProductCard';
import { Search, SlidersHorizontal, Loader2, ChevronRight, ChevronDown, X } from 'lucide-react';
import type { Product, Category } from '../types';

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest';

export default function ProductDiscovery() {
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [hierarchy, setHierarchy] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>('featured');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedParents, setExpandedParents] = useState<Set<number>>(new Set());
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Fetch category hierarchy once
  useEffect(() => {
    const fetchHierarchy = async () => {
      try {
        const res = await categoryApi.getHierarchy();
        setHierarchy(res.data);
      } catch {
        try {
          const res = await categoryApi.getAll();
          setHierarchy(res.data);
        } catch {
          // silently fail
        }
      }
    };
    fetchHierarchy();
  }, []);

  // Fetch products based on categorySlug or selected category
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const sortParam = sort === 'featured' ? undefined : sort;
        let res;
        if (selectedCategoryId) {
          res = await productApi.getByCategory(selectedCategoryId, sortParam);
        } else if (categorySlug) {
          const flat = flattenHierarchy(hierarchy);
          const match = flat.find((c) => c.slug === categorySlug);
          if (match) {
            setSelectedCategoryId(match.id);
            setSelectedCategoryName(match.name);
            res = await productApi.getByCategory(match.id, sortParam);
          } else {
            res = await productApi.getPublicProducts(sortParam);
          }
        } else {
          res = await productApi.getPublicProducts(sortParam);
        }
        setProducts(res.data);
      } catch {
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategoryId, categorySlug, hierarchy, sort]);

  const handleSelectCategory = useCallback((cat: Category) => {
    setSelectedCategoryId(cat.id);
    setSelectedCategoryName(cat.name);
    setMobileFiltersOpen(false);
  }, []);

  const handleClearCategory = useCallback(() => {
    setSelectedCategoryId(null);
    setSelectedCategoryName(null);
  }, []);

  const toggleParent = useCallback((parentId: number) => {
    setExpandedParents((prev) => {
      const next = new Set(prev);
      if (next.has(parentId)) next.delete(parentId);
      else next.add(parentId);
      return next;
    });
  }, []);

  const filtered = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
  );

  // Recursively render category tree nodes
  const renderTree = (cats: Category[], depth = 0) => {
    return cats.map((cat) => {
      const hasChildren = cat.children && cat.children.length > 0;
      const isExpanded = expandedParents.has(cat.id);
      const isSelected = selectedCategoryId === cat.id;
      const paddingLeft = depth * 16 + 12;

      return (
        <div key={cat.id}>
          <div
            className={`flex items-center gap-1 py-1.5 pr-2 rounded-md cursor-pointer transition-colors ${
              isSelected ? 'bg-jenga-50 text-jenga-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
            }`}
            style={{ paddingLeft }}
            onClick={() => {
              if (hasChildren) toggleParent(cat.id);
              handleSelectCategory(cat);
            }}
          >
            {hasChildren ? (
              <span 
                className="text-gray-400 p-0.5 hover:text-gray-600" 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  toggleParent(cat.id); 
                }}
              >
                {isExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
              </span>
            ) : (
              <span className="w-3.5" />
            )}
            <span className="text-sm truncate">{cat.name}</span>
          </div>
          {hasChildren && isExpanded && renderTree(cat.children!, depth + 1)}
        </div>
      );
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
          <p className="text-sm text-gray-500">
            {selectedCategoryName
              ? `Browsing: ${selectedCategoryName}`
              : 'Discover hardware from trusted Gikomba vendors'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Mobile filter toggle */}
          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="md:hidden flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 hover:bg-gray-50 transition"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search hardware, timber, steel..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="input-field text-sm py-2 pr-8"
          >
            <option value="featured">Sort: Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newest First</option>
          </select>
        </div>
      </div>

      {/* Active filter chip */}
      {selectedCategoryName && (
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-jenga-50 text-jenga-700 text-sm font-medium border border-jenga-200">
            {selectedCategoryName}
            <button onClick={handleClearCategory} className="hover:text-jenga-900 ml-1">
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        </div>
      )}

      <div className="flex gap-8">
        {/* Category Sidebar - Desktop */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-24">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Categories</h3>
            <div
              className={`flex items-center gap-1 py-1.5 px-3 rounded-md cursor-pointer transition-colors ${
                selectedCategoryId === null ? 'bg-jenga-50 text-jenga-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={handleClearCategory}
            >
              <span className="w-3.5" />
              <span className="text-sm">All Categories</span>
            </div>
            <div className="mt-1 space-y-0.5">
              {renderTree(hierarchy)}
            </div>
          </div>
        </aside>

        {/* Mobile filters overlay */}
        {mobileFiltersOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-white p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
              <button 
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1 text-gray-500 hover:text-gray-800 rounded-md"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div
              className={`flex items-center gap-1 py-2 px-3 rounded-md cursor-pointer ${
                selectedCategoryId === null ? 'bg-jenga-50 text-jenga-700 font-medium' : 'text-gray-700'
              }`}
              onClick={() => { handleClearCategory(); setMobileFiltersOpen(false); }}
            >
              <span className="w-3.5" />
              <span className="text-sm">All Categories</span>
            </div>
            <div className="mt-1 space-y-0.5">
              {renderTree(hierarchy)}
            </div>
          </div>
        )}

        {/* Products grid */}
        <main className="flex-1 min-w-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 text-jenga-600 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-100 p-8">
              <SlidersHorizontal className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-100 p-8">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No products found matching your search.</p>
              <p className="text-sm text-gray-400 mt-1">Try clearing filters or checking common hardware terms.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4 font-medium">
                {filtered.length} product{filtered.length !== 1 ? 's' : ''} available
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((product: Product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function flattenHierarchy(cats: Category[]): Category[] {
  const result: Category[] = [];
  for (const cat of cats) {
    result.push(cat);
    if (cat.children) {
      result.push(...flattenHierarchy(cat.children));
    }
  }
  return result;
}