import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { businessProfileApi, productApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  BadgeCheck,
  Package,
  CheckCircle2,
  Power,
  Edit2,
  Trash2,
  AlertCircle,
  Building2,
  MapPin,
  Phone,
  Plus,
  Copy,
  Check,
  Share2,
  CreditCard,
  FileText,
  ShieldCheck,
  Layers,
  Settings,
  Loader2,
} from 'lucide-react';
import type { Product, BusinessProfile } from '../types';

export default function SellerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [hasProfile, setHasProfile] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'inventory' | 'profile_preview'>('inventory');
  const [copiedId, setCopiedId] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [profileRes, productsRes] = await Promise.allSettled([
        businessProfileApi.getMine(),
        productApi.getSellerProducts(),
      ]);

      if (
        profileRes.status === 'fulfilled' &&
        profileRes.value?.data &&
        profileRes.value.data.businessName
      ) {
        setProfile(profileRes.value.data);
        setHasProfile(true);
      } else {
        setHasProfile(false);
      }

      if (productsRes.status === 'fulfilled' && productsRes.value?.data) {
        setProducts(productsRes.value.data || []);
      }
    } catch {
      setHasProfile(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (productId: number) => {
    try {
      const res = await productApi.toggleStatus(productId);
      // Support both property conventions returned from backend
      const updatedStatus = res.data.isActive ?? (res.data as any).active;

      // Immediately update local state so changes persist in view
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? { ...p, isActive: updatedStatus, active: updatedStatus }
            : p
        )
      );
    } catch (err) {
      console.error('Failed to toggle product status:', err);
      alert('Could not update status. Please try again.');
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!window.confirm('Are you sure you want to remove this listing?')) {
      return;
    }
    try {
      await productApi.delete(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      console.error('Failed to delete product:', err);
      alert('Could not delete product.');
    }
  };

  const sellerCodeString = `JNG-${profile?.id ? String(profile.id).padStart(4, '0') : 'SELLER'}-${user?.id || '01'}`;

  const copySellerCode = () => {
    navigator.clipboard.writeText(sellerCodeString);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex">
      {/* 1. Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200 p-5 hidden md:flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-blue-500/20">
              J
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base leading-tight">Jenga Portal</h2>
              <span className="text-xs text-slate-500 font-medium">Merchant Center</span>
            </div>
          </div>

          <nav className="space-y-1.5 pt-2">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                activeTab === 'inventory'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Package className="w-4 h-4 text-blue-600" />
              Inventory & Products
            </button>

            <button
              onClick={() => setActiveTab('profile_preview')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                activeTab === 'profile_preview'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-4 h-4 text-blue-600" />
              Business Overview
            </button>

            <button
              onClick={() => navigate('/business-profile')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-slate-600 hover:bg-slate-100 transition-all"
            >
              <Settings className="w-4 h-4 text-slate-500" />
              Edit Profile & M-Pesa
            </button>
          </nav>
        </div>

        {/* User Footer */}
        <div className="pt-4 border-t border-slate-200">
          <div className="flex items-center gap-3 px-1">
            <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-semibold">
              {user?.fullName?.charAt(0) || 'S'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-900 truncate">{user?.fullName || 'Seller Admin'}</p>
              <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-8">
        {/* Mandatory Profile Warning Banner */}
        {!hasProfile && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-amber-900 text-sm md:text-base">
                  Corporate Profile Setup Mandatory
                </h3>
                <p className="text-xs md:text-sm text-amber-700 mt-0.5">
                  Register your company details and Safaricom M-Pesa setup before publishing product listings.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/business-profile')}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs md:text-sm font-semibold rounded-xl whitespace-nowrap shadow transition-all"
            >
              Complete Profile Now
            </button>
          </div>
        )}

        {/* Dark Hero Merchant Card */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-8 shadow-xl shadow-slate-900/10 mb-8">
          <div className="absolute right-0 top-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 shadow-md">
                  <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-2xl font-extrabold text-blue-400">
                    {profile?.businessName ? profile.businessName.charAt(0).toUpperCase() : 'J'}
                  </div>
                </div>
                {profile?.isVerified && (
                  <span className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1 rounded-full ring-2 ring-slate-900 shadow">
                    <BadgeCheck className="w-4 h-4" />
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    {profile?.businessName || user?.fullName || 'Hardware Merchant'}
                  </h1>
                  {profile?.isVerified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified Online
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                      Standard Merchant
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-300">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {profile?.headOfficeAddress || 'Nairobi, Kenya'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {profile?.phoneNumber || profile?.contactNumber || user?.phoneNumber || '+254 700 000 000'}
                  </span>
                </div>

                {/* Seller Code Badge */}
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-slate-300">
                  <span>Merchant ID: {sellerCodeString}</span>
                  <button
                    onClick={copySellerCode}
                    className="p-1 hover:text-white transition-colors text-slate-400"
                    title="Copy seller identifier"
                  >
                    {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => {
                  if (!hasProfile) {
                    alert('Please complete your Business Profile first!');
                    navigate('/business-profile');
                  } else {
                    navigate('/product/new');
                  }
                }}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/30 transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            </div>
          </div>
        </div>

        {/* 3. Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Listed Units</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{products.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <Layers className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Completed Orders</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">{profile?.completedOrders || 0}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Merchant Tier</p>
              <p className="text-base font-bold text-slate-900 mt-1">
                {profile?.isVerified ? 'Verified Enterprise' : 'Active Merchant'}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${profile?.isVerified ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
              <BadgeCheck className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* 4. Tab Selector */}
        <div className="flex border-b border-slate-200 mb-6 gap-6">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'inventory'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            Hardware Inventory ({products.length})
          </button>

          <button
            onClick={() => setActiveTab('profile_preview')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'profile_preview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Business Details & Paybill
          </button>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-2" />
            <span className="text-xs text-slate-500">Loading merchant records...</span>
          </div>
        ) : activeTab === 'inventory' ? (
          /* Tab Content A: Products CRUD */
          <div>
            {products.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No materials listed yet</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Add cement, steel doors, timber, roofing, or electrical supplies to start receiving leads.
                </p>
                <button
                  onClick={() => {
                    if (!hasProfile) {
                      alert('Please complete your Business Profile first!');
                      navigate('/business-profile');
                    } else {
                      navigate('/product/new');
                    }
                  }}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow transition-all"
                >
                  + Create First Listing
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {products.map((product: any) => {
                  // Resilient check across both naming conventions
                  const isProductActive = Boolean(product.isActive ?? product.active ?? false);

                  // Normalize image URLs (supports local path or full web URLs)
                  const imageSrc = product.imageUrl
                    ? product.imageUrl.startsWith('http') || product.imageUrl.startsWith('/')
                      ? product.imageUrl
                      : `/${product.imageUrl}`
                    : null;

                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div>
                        {/* Media Header with Error Fallback */}
                        <div className="relative aspect-video w-full bg-slate-100 overflow-hidden flex items-center justify-center">
                          {imageSrc ? (
                            <img
                              src={imageSrc}
                              alt={product.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                              <Package className="w-8 h-8" />
                              <span className="text-[11px] mt-1">No Image Preview</span>
                            </div>
                          )}

                          {/* Top Status Chip */}
                          <div className="absolute top-2.5 right-2.5">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                                isProductActive
                                  ? 'bg-emerald-500 text-white shadow'
                                  : 'bg-slate-700 text-slate-200'
                              }`}
                            >
                              {isProductActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>

                          {product.videoUrl && (
                            <div className="absolute bottom-2.5 left-2.5 bg-slate-900/80 backdrop-blur-md text-white px-2 py-0.5 rounded-md text-[10px] font-semibold">
                              30s Video
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <div className="flex items-baseline justify-between gap-2">
                            <h3 className="font-bold text-slate-900 text-sm truncate flex-1" title={product.title}>
                              {product.title}
                            </h3>

                            {/* Stock Availability Indicator (Replaced numeric count) */}
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                                isProductActive
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {isProductActive ? 'Stock Available' : 'Out of Stock'}
                            </span>
                          </div>

                          <p className="text-base font-extrabold text-blue-600 mt-1.5">
                            KES {Number(product.price).toLocaleString()}
                          </p>

                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                            {product.description || 'No detailed description provided.'}
                          </p>
                        </div>
                      </div>

                      {/* CRUD Controls */}
                      <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(product.id)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-colors ${
                            isProductActive
                              ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                              : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                          {isProductActive ? 'Mark Inactive' : 'Set Active'}
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => navigate(`/product/edit/${product.id}`)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-white rounded-lg transition-all"
                            title="Edit product listing"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-white rounded-lg transition-all"
                            title="Delete listing"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Tab Content B: Business Details Accordion Cards */
          <div className="space-y-4">
            {/* Corporate & Physical Office */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Corporate & Physical Office</h3>
                    <p className="text-xs text-slate-500">Official registered trading establishment</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/business-profile')}
                  className="text-xs text-blue-600 font-bold hover:underline"
                >
                  Edit
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Registered Name</span>
                  <p className="text-slate-900 font-bold mt-0.5">{profile?.businessName || '—'}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Head Office Location</span>
                  <p className="text-slate-900 font-bold mt-0.5">{profile?.headOfficeAddress || '—'}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Company Status</span>
                  <p className="text-slate-900 font-bold mt-0.5">{profile?.companyStatus || 'Active'}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Registration Date</span>
                  <p className="text-slate-900 font-bold mt-0.5">{profile?.registrationDate || '—'}</p>
                </div>
              </div>
            </div>

            {/* Safaricom M-Pesa Setup */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Safaricom M-Pesa Settlement</h3>
                    <p className="text-xs text-slate-500">Customer direct purchase terminal</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/business-profile')}
                  className="text-xs text-blue-600 font-bold hover:underline"
                >
                  Configure
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Payment Option Mode</span>
                  <p className="text-emerald-700 font-bold mt-0.5">
                    {profile?.mpesaPaymentType || 'BUY_GOODS_TILL'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Till / Paybill Number</span>
                  <p className="text-slate-900 font-bold mt-0.5">
                    {profile?.mpesaTillNumber || profile?.mpesaPaybillNumber || '—'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Account / Mobile Line</span>
                  <p className="text-slate-900 font-bold mt-0.5">
                    {profile?.mpesaAccountNumber || profile?.mpesaNumber || '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Socials & Contact */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Social Channels & Direct Contact</h3>
                    <p className="text-xs text-slate-500">Instant buyer messaging</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/business-profile')}
                  className="text-xs text-blue-600 font-bold hover:underline"
                >
                  Update
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-4 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">WhatsApp Link</span>
                  <p className="text-slate-900 font-semibold truncate mt-0.5">{profile?.whatsappNumber || '—'}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Instagram</span>
                  <p className="text-slate-900 font-semibold truncate mt-0.5">{profile?.instagramUrl || '—'}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">TikTok</span>
                  <p className="text-slate-900 font-semibold truncate mt-0.5">{profile?.tiktokUrl || '—'}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Direct Line</span>
                  <p className="text-slate-900 font-semibold truncate mt-0.5">{profile?.contactNumber || '—'}</p>
                </div>
              </div>
            </div>

            {/* Mission & Achievements */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Mission, Vision & Track Record</h3>
                    <p className="text-xs text-slate-500">Public profile story for commercial buyers</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/business-profile')}
                  className="text-xs text-blue-600 font-bold hover:underline"
                >
                  Edit Story
                </button>
              </div>

              <div className="pt-4 space-y-3 text-xs text-slate-600">
                <div>
                  <span className="font-bold text-slate-900">Company Overview:</span>
                  <p className="mt-0.5 text-slate-700 leading-relaxed">
                    {profile?.companyOverview || 'No corporate story added yet.'}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="font-bold text-slate-900">Mission:</span>
                    <p className="mt-0.5 text-slate-700 leading-relaxed">{profile?.mission || '—'}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900">Vision:</span>
                    <p className="mt-0.5 text-slate-700 leading-relaxed">{profile?.vision || '—'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}