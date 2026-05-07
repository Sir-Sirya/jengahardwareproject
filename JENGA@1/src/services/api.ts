import axios, { AxiosError } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jenga_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jenga_token');
      localStorage.removeItem('jenga_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  signup: (data: Record<string, unknown>) =>
    api.post('/auth/signup', data),
};

export const productApi = {
  getPublicProducts: (sort?: string) => api.get('/products/public', { params: sort ? { sort } : undefined }),
  getByCategory: (categoryId: number, sort?: string) => api.get(`/products/public/category/${categoryId}`, { params: sort ? { sort } : undefined }),
  getById: (id: number) => api.get(`/products/public/${id}`),
  getSellerProducts: () => api.get('/products/seller/my-products'),
  create: (data: Record<string, unknown>) => api.post('/products', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/products/${id}`, data),
  delete: (id: number) => api.delete(`/products/${id}`),
};

export const categoryApi = {
  getAll: () => api.get('/categories'),
  getHierarchy: () => api.get('/categories/hierarchy'),
};

export const notificationApi = {
  getMine: () => api.get('/notifications'),
  markRead: (id: number) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

export const leadApi = {
  create: (productId: number) => api.post('/leads', { productId }),
  getMine: () => api.get('/leads'),
};

export const businessProfileApi = {
  getMine: () => api.get('/business-profiles/me'),
  update: (data: Record<string, unknown>) => api.put('/business-profiles/me', data),
};

export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  getProducts: () => api.get('/admin/products'),
  getLeads: () => api.get('/admin/leads'),
};
