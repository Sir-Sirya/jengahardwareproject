import axios, { AxiosError } from 'axios';
import type { 
  BusinessProfile, 
  Product, 
  PromoCode, 
  StoreSettings, 
  BuyerProfileData, 
  SavedAddress,
  AdminOrder
} from '../types';

/**
 * Dynamic API Base URL configuration:
 * 1. Checks for an explicit environment override via VITE_API_BASE_URL.
 * 2. When hosted over public tunnels (e.g. VS Code Dev Tunnels or ngrok), setting
 *    a relative base URL ('/api') enables the Vite development server reverse proxy
 *    to forward requests directly to the local backend without triggering cross-origin
 *    or localhost loopback resolution failures on remote client browsers.
 * 3. Falls back to direct local port 8080 access for isolated local execution.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

/**
 * Request Interceptor:
 * Automatically extracts the stored JWT authentication token from localStorage
 * and injects it into the HTTP Authorization header using the Bearer scheme.
 */
api.interceptors.request.use(
  (config) => {
    // Check both potential token storage keys for resilient session continuity
    const token = localStorage.getItem('jenga_token') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token.trim()}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor:
 * Global error handling for unauthorized requests and session expiration.
 * Clears cached tokens and redirects to /login on 401/403 status codes,
 * while safely ignoring PROFILE_INCOMPLETE errors for new vendor onboardings.
 */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const responseData = error.response?.data as { error?: string } | undefined;
    const isProfileIncomplete = responseData?.error === 'PROFILE_INCOMPLETE';

    if (error.response?.status === 401 || (error.response?.status === 403 && !isProfileIncomplete)) {
      localStorage.removeItem('jenga_token');
      localStorage.removeItem('token');
      localStorage.removeItem('jenga_user');
      
      // Avoid infinite redirects if the 401 occurs directly on the login view
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

/* ==========================================================================
   AUTHENTICATION & REGISTRATION ENDPOINTS
   ========================================================================== */
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email: email.trim().toLowerCase(), password }),

  signup: (data: Record<string, unknown>) =>
    api.post('/auth/signup', data),
};

/* ==========================================================================
   CATALOG & PRODUCT MANAGEMENT ENDPOINTS
   ========================================================================== */
export const productApi = {
  // Public Catalog Browsing
  getPublicProducts: (sort?: string) => 
    api.get<Product[]>('/products/public', { params: { sort } }),

  getByCategory: (categoryId: number, sort?: string) => 
    api.get<Product[]>(`/products/public/category/${categoryId}`, { params: { sort } }),

  getById: (id: number) =>
    api.get<Product>(`/products/public/${id}`),

  getTodaysPicks: () => 
    api.get<Product[]>('/products/public/todays-picks'),

  getTrending: (limit = 8) => 
    api.get<Product[]>('/products/public/trending', { params: { limit } }),

  search: (query: string) =>
    api.get<Product[]>('/products/search', { params: { q: query } }),

  // Vendor / Seller Catalog Operations
  getSellerProducts: () =>
    api.get<Product[]>('/products/seller/my-products'),

  create: (data: Partial<Product> | Record<string, unknown>) =>
    api.post<Product>('/products', data),

  update: (id: number, data: Partial<Product> | Record<string, unknown>) =>
    api.put<Product>(`/products/${id}`, data),

  toggleStatus: (id: number) =>
    api.put<{ message: string; isActive: boolean }>(`/products/${id}/toggle-status`),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/products/${id}`), 
};

/* ==========================================================================
   CATEGORIES & TAXONOMY ENDPOINTS
   ========================================================================== */
export const categoryApi = {
  getAll: () =>
    api.get('/categories'),

  getHierarchy: () =>
    api.get('/categories/hierarchy'),
};

/* ==========================================================================
   CHECKOUT, ORDERS & SAFARICOM DARAJA POLLING ENDPOINTS
   ========================================================================== */
export const orderApi = {
  /**
   * Dispatches the checkout payload containing line items, delivery destination,
   * customer phone number, and a unique idempotency key to prevent double charging.
   */
  checkout: (data: any, idempotencyKey: string) =>
    api.post('/orders/checkout', data, {
      headers: { 'Idempotency-Key': idempotencyKey },
    }),

  /**
   * Polled at 3-second intervals by the checkout screen until the Safaricom
   * callback updates the payment status from PENDING to PAID or FAILED.
   */
  trackOrder: (trackingNumber: string) =>
    api.get(`/orders/track/${trackingNumber}`),
};

/* ==========================================================================
   BUYER PROFILE & ACCOUNT PERSISTENCE ENDPOINTS
   ========================================================================== */
export const buyerApi = {
  // Personal Details & Aggregated Profile
  getProfile: () => 
    api.get<BuyerProfileData>('/buyer/profile'),

  updateProfile: (data: Partial<BuyerProfileData> | Record<string, string>) => 
    api.put('/buyer/profile', data),

  // Relational Address Book
  getAddresses: () => 
    api.get<SavedAddress[]>('/buyer/addresses'),

  saveAddress: (address: Partial<SavedAddress>) => 
    api.post<SavedAddress>('/buyer/addresses', address),

  deleteAddress: (id: number) => 
    api.delete(`/buyer/addresses/${id}`),

  // Orders & Wishlists
  getMyOrders: () => 
    api.get<AdminOrder[]>('/buyer/orders'),

  getWishlist: () => 
    api.get<Product[]>('/buyer/wishlist'),

  removeFromWishlist: (productId: number) => 
    api.delete(`/buyer/wishlist/${productId}`),

  // Recommendations & Communication Settings
  getRecommendations: () => 
    api.get<Product[]>('/buyer/recommendations'),

  updatePreferences: (preferences: any) => 
    api.put('/buyer/preferences', preferences),
};

/* ==========================================================================
   ADMINISTRATOR WORKSPACE ENDPOINTS
   ========================================================================== */
export const adminApi = {
  // Metrics & Core Tables
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  getProducts: () => api.get('/admin/products'),
  getLeads: () => api.get('/admin/leads'),

  // Order Management & Invoice Updates
  getOrders: () => api.get<AdminOrder[]>('/admin/orders'),
  updateOrderStatus: (orderId: number, status: string) =>
    api.patch(`/admin/orders/${orderId}/status`, { status }),

  // User Access Control & RBAC
  updateUserRole: (userId: number, role: 'BUYER' | 'SELLER' | 'ADMIN') =>
    api.patch(`/admin/users/${userId}/role`, { role }),

  // Catalog Pruning
  deleteProduct: (productId: number) => 
    api.delete(`/admin/products/${productId}`),

  // Marketing & Discount Codes
  getPromoCodes: () => api.get<PromoCode[]>('/admin/promos'),
  createPromoCode: (promo: Partial<PromoCode>) => api.post<PromoCode>('/admin/promos', promo),
  deletePromoCode: (id: number) => api.delete(`/admin/promos/${id}`),

  // Marketplace Configuration
  getSettings: () => api.get<StoreSettings>('/admin/settings'),
  updateSettings: (settings: StoreSettings) => api.put('/admin/settings', settings),
};

/* ==========================================================================
   SUPPLEMENTARY BUSINESS PROFILE, LEADS & MEDIA UPLOADS
   ========================================================================== */
export const businessProfileApi = {
  getMine: () =>
    api.get<BusinessProfile>('/business-profiles/me'),

  getPublicByUserId: (userId: number) =>
    api.get<BusinessProfile>(`/business-profiles/public/${userId}`),

  saveOrUpdate: (data: Partial<BusinessProfile> | Record<string, unknown>) =>
    api.post<BusinessProfile>('/business-profiles/me', data),

  update: (data: Partial<BusinessProfile> | Record<string, unknown>) =>
    api.put<BusinessProfile>('/business-profiles/me', data),
};

export const leadApi = {
  create: (productId: number) =>
    api.post('/leads', { productId }),

  getMine: () =>
    api.get('/leads'),
};

export const notificationApi = {
  getMine: () =>
    api.get('/notifications'),

  markRead: (id: number) =>
    api.put(`/notifications/${id}/read`),

  markAllRead: () =>
    api.put('/notifications/read-all'),
};

export const uploadApi = {
  image: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{ url: string }>('/upload/media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  video: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{ url: string }>('/upload/media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};