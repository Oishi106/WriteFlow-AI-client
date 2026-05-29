import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken });
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);

        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(originalRequest);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        if (typeof window !== 'undefined') window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// ─── Auth API ──────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh-token', { refreshToken }),
  getMe: () => api.get('/auth/me'),
};

// ─── Users API ─────────────────────────────────────────────────────────────────
export const usersApi = {
  getMyProfile: () => api.get('/users/me'),
  updateMyProfile: (data: Partial<{ name: string; bio: string; avatar: string }>) =>
    api.patch('/users/me', data),
  getAllUsers: (params?: Record<string, string | number>) =>
    api.get('/users', { params }),
  getUserById: (id: string) => api.get(`/users/${id}`),
  changeRole: (id: string, role: string) => api.patch(`/users/${id}/role`, { role }),
  toggleStatus: (id: string) => api.patch(`/users/${id}/toggle-status`),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
};

// ─── Items (Templates) API ─────────────────────────────────────────────────────
export const itemsApi = {
  getAll: (params?: Record<string, string | number>) => api.get('/items', { params }),
  getById: (id: string) => api.get(`/items/${id}`),
  getRelated: (id: string) => api.get(`/items/${id}/related`),
  create: (data: Record<string, unknown>) => api.post('/items', data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/items/${id}`, data),
  delete: (id: string) => api.delete(`/items/${id}`),
};

// ─── Reviews API ───────────────────────────────────────────────────────────────
export const reviewsApi = {
  create: (data: { rating: number; comment: string; itemId: string }) =>
    api.post('/reviews', data),
  getByItem: (itemId: string, params?: Record<string, string | number>) =>
    api.get(`/reviews/item/${itemId}`, { params }),
  getAll: (params?: Record<string, string | number>) => api.get('/reviews', { params }),
  approve: (id: string, approved: boolean) =>
    api.patch(`/reviews/${id}/approve`, { approved }),
  delete: (id: string) => api.delete(`/reviews/${id}`),
};

// ─── Bookings API ──────────────────────────────────────────────────────────────
export const bookingsApi = {
  create: (data: { itemId: string; quantity?: number; price: number }) =>
    api.post('/bookings', data),
  getAll: (params?: Record<string, string | number>) => api.get('/bookings', { params }),
  updateStatus: (id: string, status: string) => api.patch(`/bookings/${id}`, { status }),
  delete: (id: string) => api.delete(`/bookings/${id}`),
};

// ─── Dashboard API ─────────────────────────────────────────────────────────────
export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getChartData: () => api.get('/dashboard/chart-data'),
  getMyStats: () => api.get('/dashboard/my-stats'),
};

// ─── AI API ────────────────────────────────────────────────────────────────────
export const aiApi = {
  generate: (data: { topic: string; tone: string; targetAudience: string; contentType: string }) =>
    api.post('/ai/generate', data),
  rewrite: (data: { content: string; tone: string; action: string }) =>
    api.post('/ai/rewrite', data),
  chat: (data: { messages: Array<{ role: string; content: string }>; documentContext?: string }) =>
    api.post('/ai/chat', data),
  summariseReviews: (itemId?: string) =>
    api.post('/ai/review-summary', itemId ? { itemId } : {}),
  generateDescription: (data: { title: string; category: string }) =>
    api.post('/ai/generate-description', data),
  getHistory: (params?: Record<string, string | number>) =>
    api.get('/ai/history', { params }),
};
