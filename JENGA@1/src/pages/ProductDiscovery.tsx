import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { productApi, categoryApi } from '../services/api';
import ProductCard from '../components/ProductCard';
import {
  Search,
  SlidersHorizontal,
  Loader2,
  ChevronRight,
  ChevronDown,
  X,
  Package,
  Sparkles,
  Flame,
} from 'lucide-react';
import type { Product, Category } from '../types';
import { getMediaUrl } from '../utils/imageUrl';

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest';
type DiscoveryFeed = 'all' | 'todays-picks' | 'trending';

const MAIN_CATEGORY_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function flattenHierarchy(cats: Category[]): Category[] {
  const result: Category[] = [];
  if (!Array.isArray(cats)) return result;

  for (const cat of cats) {
    result.push(cat);
    if (cat.children && Array.isArray(cat.children) && cat.children.length > 0) {
      result.push(...flattenHierarchy(cat.children));
    }
  }
  return result;
}

export default function ProductDiscovery() {
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [hierarchy, setHierarchy] = useState<Category[]>([]);
  const [search, setSearch] = useState<string>(searchParams.get('search') || '');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>((searchParams.get('sort') as SortOption) || 'featured');
  const [feed, setFeed] = useState<DiscoveryFeed>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [expandedParents, setExpandedParents] = useState<Set<number>>(new Set());
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState<boolean>(false);

  // 1. Fetch & Build Category Hierarchy
  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        const res = await categoryApi.getAll();
        if (!isMounted) return;

        if (Array.isArray(res.data)) {
          const all: any[] = res.data;

          const getParentId = (item: any): number | null => {
            if (item.parentId !== undefined && item.parentId !== null) return Number(item.parentId);
            if (item.parent_id !== undefined && item.parent_id !== null) return Number(item.parent_id);
            if (item.parent && item.parent.id !== undefined && item.parent.id !== null) return Number(item.parent.id);
            return null;
          };

          const parents = all
            .filter((c) => MAIN_CATEGORY_IDS.includes(Number(c.id)) && getParentId(c) === null)
            .sort((a, b) => Number(a.id) - Number(b.id));

          const cleanTree: Category[] = parents.map((p) => {
            const children = all
              .filter((c) => getParentId(c) === Number(p.id))
              .sort((a, b) => Number(a.id) - Number(b.id));

            return {
              ...p,
              id: Number(p.id),
              children: children.map((ch) => ({ ...ch, id: Number(ch.id) })),
            };
          });

          setHierarchy(cleanTree);
        } else {
          setHierarchy([]);
        }
      } catch (err) {
        console.error('Failed to load category tree:', err);
      }
    };

    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Synchronize URL Search Parameters
  useEffect(() => {
    const catParam = searchParams.get('category');
    const searchParam = searchParams.get('search');

    if (searchParam !== null) {
      setSearch(searchParam);
    }

    if (catParam && catParam !== 'all') {
      const catId = Number(catParam);
      if (!isNaN(catId)) {
        setSelectedCategoryId(catId);
        setExpandedParents((prev) => new Set([...prev, catId]));
      }
    } else if (catParam === 'all') {
      setSelectedCategoryId(null);
      setSelectedCategoryName(null);
    }
  }, [searchParams]);

  // 3. Category Label Resolution
  useEffect(() => {
    if (selectedCategoryId && hierarchy.length > 0) {
      const flat = flattenHierarchy(hierarchy);
      const matched = flat.find((c) => Number(c.id) === Number(selectedCategoryId));
      if (matched) setSelectedCategoryName(matched.name);
    } else if (!selectedCategoryId) {
      setSelectedCategoryName(null);
    }
  }, [selectedCategoryId, hierarchy]);

  // 4. Fetch Products with Safety Normalization
  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      setLoading(true);
      setError('');

      try {
        const sortParam = sort === 'featured' ? undefined : sort;
        let resData: Product[] = [];

        if (feed === 'todays-picks' && !selectedCategoryId) {
          const res = await productApi.getTodaysPicks();
          resData = Array.isArray(res.data) ? res.data : [];
        } else if (feed === 'trending' && !selectedCategoryId) {
          const res = await productApi.getTrending(12);
          resData = Array.isArray(res.data) ? res.data : [];
        } else if (selectedCategoryId) {
          const selectedParent = hierarchy.find((c) => Number(c.id) === Number(selectedCategoryId));

          if (selectedParent && Array.isArray(selectedParent.children) && selectedParent.children.length > 0) {
            const res = await productApi.getByCategory(selectedCategoryId, sortParam);
            resData = Array.isArray(res.data) ? res.data : [];

            // Client-side child category query fallback if parent has no directly assigned items
            if (resData.length === 0) {
              const childQueries = await Promise.all(
                selectedParent.children.map((ch) =>
                  productApi.getByCategory(ch.id, sortParam).catch(() => ({ data: [] }))
                )
              );
              const merged = childQueries.flatMap((cq) => (Array.isArray(cq.data) ? cq.data : []));
              resData = Array.from(new Map(merged.map((p) => [p.id, p])).values());
            }
          } else {
            const res = await productApi.getByCategory(selectedCategoryId, sortParam);
            resData = Array.isArray(res.data) ? res.data : [];
          }
        } else if (categorySlug) {
          const flat = flattenHierarchy(hierarchy);
          const match = flat.find((c) => c.slug === categorySlug);
          if (match) {
            setSelectedCategoryId(match.id);
            setSelectedCategoryName(match.name);
            const res = await productApi.getByCategory(match.id, sortParam);
            resData = Array.isArray(res.data) ? res.data : [];
          } else {
            const res = await productApi.getPublicProducts(sortParam);
            resData = Array.isArray(res.data) ? res.data : [];
          }
        } else {
          const res = await productApi.getPublicProducts(sortParam);
          resData = Array.isArray(res.data) ? res.data : [];
        }

        if (isMounted) {
          // Normalize media URLs so they resolve through the Vite tunnel proxy
          const normalized = resData.map((p) => ({
            ...p,
            imageUrl: getMediaUrl(p.imageUrl),
          }));
          setProducts(normalized);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError('Failed to load products. Please try refreshing.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [selectedCategoryId, categorySlug, sort, hierarchy, feed]);

  // Handlers
  const handleSelectCategory = useCallback(
    (cat: Category) => {
      setFeed('all');
      setSelectedCategoryId(cat.id);
      setSelectedCategoryName(cat.name);
      setMobileFiltersOpen(false);

      const nextParams = new URLSearchParams(searchParams);
      nextParams.set('category', String(cat.id));
      setSearchParams(nextParams);
    },
    [searchParams, setSearchParams]
  );

  const handleClearCategory = useCallback(() => {
    setSelectedCategoryId(null);
    setSelectedCategoryName(null);

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('category');
    setSearchParams(nextParams);
  }, [searchParams, setSearchParams]);

  const toggleParent = useCallback((parentId: number) => {
    setExpandedParents((prev) => {
      const next = new Set(prev);
      if (next.has(parentId)) next.delete(parentId);
      else next.add(parentId);
      return next;
    });
  }, []);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    const nextParams = new URLSearchParams(searchParams);
    if (val.trim()) nextParams.set('search', val.trim());
    else nextParams.delete('search');
    setSearchParams(nextParams);
  };

  // Client-side text filter
  const filtered = useMemo(() => {
    if (!Array.isArray(products)) return [];
    const term = search.trim().toLowerCase();
    if (!term) return products;

    return products.filter((p) => {
      const titleMatch = p.title ? p.title.toLowerCase().includes(term) : false;
      const descMatch = p.description ? p.description.toLowerCase().includes(term) : false;
      return titleMatch || descMatch;
    });
  }, [products, search]);

  const renderTree = (cats: Category[], depth = 0) => {
    if (!Array.isArray(cats)) return null;

    return cats.map((cat) => {
      const hasChildren = Boolean(cat.children && cat.children.length > 0);
      const isExpanded = expandedParents.has(cat.id);
      const isSelected = selectedCategoryId === cat.id;
      const paddingLeft = depth * 14 + 10;

      return (
        <div key={cat.id}>
          <div
            className={`flex items-center justify-between py-2 pr-2 rounded-xl cursor-pointer transition-colors ${
              isSelected
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'text-slate-700 hover:bg-slate-50 font-medium'
            }`}
            style={{ paddingLeft }}
            onClick={() => {
              if (hasChildren) toggleParent(cat.id);
              handleSelectCategory(cat);
            }}
          >
            <span className="text-xs truncate flex-1">{cat.name}</span>

            {hasChildren && (
              <span
                className="p-1 text-slate-400 hover:text-slate-600 shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleParent(cat.id);
                }}
              >
                {isExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5 text-blue-600" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
              </span>
            )}
          </div>

          {hasChildren && isExpanded && (
            <div className="ml-1 border-l-2 border-slate-100 my-0.5 space-y-0.5">
              {renderTree(cat.children!, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Marketplace</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {selectedCategoryName
              ? `Browsing Category: ${selectedCategoryName}`
              : 'Discover hardware from trusted Gikomba vendors'}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="md:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-sm"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Categories
          </button>

          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="text-xs font-medium py-2 px-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer"
          >
            <option value="featured">Sort: Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newest First</option>
          </select>
        </div>
      </div>

      {/* Discovery Feed Pills */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => {
            setFeed('all');
            handleClearCategory();
          }}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
            feed === 'all' && !selectedCategoryId
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All Items
        </button>
        <button
          onClick={() => {
            setFeed('todays-picks');
            handleClearCategory();
          }}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
            feed === 'todays-picks'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Today's Picks (48h)
        </button>
        <button
          onClick={() => {
            setFeed('trending');
            handleClearCategory();
          }}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
            feed === 'trending'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Flame className="h-3.5 w-3.5" />
          Trending
        </button>
      </div>

      {/* Active Category Filter Tag */}
      {selectedCategoryName && (
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
            {selectedCategoryName}
            <button onClick={handleClearCategory} className="hover:text-blue-950 ml-1">
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
          <button
            onClick={handleClearCategory}
            className="text-xs text-slate-400 hover:text-slate-600 hover:underline font-medium"
          >
            Reset filter
          </button>
        </div>
      )}

      <div className="flex gap-8">
        {/* Desktop Category Sidebar */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Categories</h3>
              {selectedCategoryId !== null && (
                <button
                  onClick={handleClearCategory}
                  className="text-[11px] font-bold text-blue-600 hover:underline"
                >
                  Clear
                </button>
              )}
            </div>

            <div
              className={`flex items-center py-2 px-3 rounded-xl cursor-pointer transition-colors mb-1 ${
                selectedCategoryId === null && feed === 'all'
                  ? 'bg-blue-50 text-blue-700 font-bold'
                  : 'text-slate-700 hover:bg-slate-50 font-medium'
              }`}
              onClick={handleClearCategory}
            >
              <span className="text-xs">All Categories</span>
            </div>

            <div className="space-y-0.5 max-h-[calc(100vh-14rem)] overflow-y-auto pr-1">
              {renderTree(hierarchy)}
            </div>
          </div>
        </aside>

        {/* Mobile Filters Drawer */}
        {mobileFiltersOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-white p-5 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Categories</h3>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div
              className={`flex items-center py-2.5 px-3 rounded-xl cursor-pointer mb-2 ${
                selectedCategoryId === null ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700'
              }`}
              onClick={() => {
                handleClearCategory();
                setMobileFiltersOpen(false);
              }}
            >
              <span className="text-xs">All Categories</span>
            </div>

            <div className="space-y-1">{renderTree(hierarchy)}</div>
          </div>
        )}

        {/* Product Grid Area */}
        <main className="flex-1 min-w-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-100">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-2" />
              <span className="text-xs text-slate-400">Loading hardware inventory...</span>
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 p-8">
              <SlidersHorizontal className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-xs font-semibold text-rose-600">{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200/80 p-8">
              <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800">No products found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No products match this selection. Try choosing another category or clearing your active search.
              </p>
              {(selectedCategoryId || search || feed !== 'all') && (
                <button
                  onClick={() => {
                    handleClearCategory();
                    setSearch('');
                    setFeed('all');
                  }}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="text-xs text-slate-500 font-medium mb-4">
                Showing <strong className="text-slate-900">{filtered.length}</strong> product
                {filtered.length !== 1 ? 's' : ''}
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