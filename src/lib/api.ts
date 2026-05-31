type JsonValue = string | number | boolean | null | { [key: string]: JsonValue } | JsonValue[];
type JsonRecord = Record<string, JsonValue>;

export class ApiError extends Error {
  status: number;
  details?: JsonValue;

  constructor(message: string, status: number, details?: JsonValue) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const buildQueryString = (params?: Record<string, JsonValue>) => {
  if (!params) return '';
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

const readJsonSafe = async (response: Response) => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as JsonValue;
  } catch {
    return text as JsonValue;
  }
};

export const apiClient = async (
  path: string,
  options: RequestInit = {},
  serverToken?: string
): Promise<JsonValue> => {
  const baseUrl = API_BASE_URL.replace(/\/$/, '');
  const url = `${baseUrl}${path}`;
  const isClient = typeof window !== 'undefined';
  const token = serverToken ?? (isClient ? localStorage.getItem('writeflow_token') : null);

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(url, { ...options, headers });
  const data = await readJsonSafe(response);

  if (!response.ok) {
    const message =
      (data && typeof data === 'object' && 'message' in data && data.message) ||
      response.statusText ||
      'Request failed';
    throw new ApiError(String(message), response.status, data ?? undefined);
  }

  return data as JsonValue;
};

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await apiClient('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    const payload =
      response && typeof response === 'object' && 'data' in response
        ? (response as JsonRecord).data
        : response;
    const token =
      payload && typeof payload === 'object' && 'token' in payload
        ? (payload as JsonRecord).token
        : undefined;
    const user =
      payload && typeof payload === 'object' && 'user' in payload
        ? (payload as JsonRecord).user
        : undefined;

    if (typeof window !== 'undefined' && token && user) {
      localStorage.setItem('writeflow_token', String(token));
      localStorage.setItem('writeflow_user', JSON.stringify(user));
    }

    return user ?? null;
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('writeflow_token');
      localStorage.removeItem('writeflow_user');
    }
  },
  
  // ─── 💡 ফিক্সড রেজিস্ট্রেশন মেথড (অবজেক্ট আকারে ডাটা রিসিভ করবে) ───
  register: ({ name, email, password }: { name: string; email: string; password: string }) =>
    apiClient('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),
};

export const itemsApi = {
  getItems: (params: Record<string, JsonValue> = {}) =>
    apiClient(`/api/items${buildQueryString(params)}`),
  getItemById: (id: string) => apiClient(`/api/items/${id}`),
};

export const bookingsApi = {
  create: (body: object) =>
    apiClient('/api/bookings', { method: 'POST', body: JSON.stringify(body) }),
};

export const documentsApi = {
  getDocuments: (params: Record<string, JsonValue> = {}) =>
    apiClient(`/api/documents${buildQueryString(params)}`,
      {
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      }
    ),
  createDocument: (body: Record<string, JsonValue>) =>
    apiClient('/api/documents', { method: 'POST', body: JSON.stringify(body) }),
  updateDocument: (id: string, body: Record<string, JsonValue>) =>
    apiClient(`/api/documents/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteDocument: (id: string) => apiClient(`/api/documents/${id}`, { method: 'DELETE' }),
};

export const ailogsApi = {
  getLogs: (params: object = {}) =>
    apiClient(`/api/ailogs?${new URLSearchParams(params as any).toString()}`),
};

// ─── 💡 ড্যাশবোর্ডের জন্য এপিআই অবজেক্ট ───
export const dashboardApi = {
  getMyStats: (token?: string) => apiClient('/api/dashboard/my-stats', {}, token),
};

export const adminApi = {
  getStats: (token?: string) => apiClient('/api/dashboard/stats', {}, token),
  getChartData: (token?: string) => apiClient('/api/dashboard/chart-data', {}, token),
  getUsers: (params: Record<string, JsonValue> = {}) =>
    apiClient(`/api/users${buildQueryString(params)}`),
  banUser: (userId: string, banned: boolean) =>
    apiClient('/api/users/ban', {
      method: 'PATCH',
      body: JSON.stringify({ userId, banned }),
    }),
  updateUserRole: (userId: string, role: string) =>
    apiClient('/api/users/role', {
      method: 'PATCH',
      body: JSON.stringify({ userId, role }),
    }),
  getItems: () => apiClient('/api/items'),
  createItem: (body: Record<string, JsonValue>) =>
    apiClient('/api/items', { method: 'POST', body: JSON.stringify(body) }),
  updateItem: (id: string, body: Record<string, JsonValue>) =>
    apiClient(`/api/items/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteItem: (id: string) => apiClient(`/api/items/${id}`, { method: 'DELETE' }),
  getReviews: () => apiClient('/api/reviews'),
  approveReview: (id: string) => apiClient(`/api/reviews/${id}/approve`, { method: 'PATCH' }),
  deleteReview: (id: string) =>
    apiClient(`/api/reviews/${id}`, { method: 'DELETE' }),
  getSettings: () => apiClient('/api/admin/settings'),
  saveSettings: (body: object) =>
    apiClient('/api/admin/settings', { method: 'POST', body: JSON.stringify(body) }),
};

export const newsletterApi = {
  subscribe: (email: string) =>
    apiClient('/api/newsletter', { method: 'POST', body: JSON.stringify({ email }) }),
};

export const aiApi = {
  generateContent: (body: Record<string, JsonValue>) =>
    apiClient('/api/ai/generate-description', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  rewriteContent: (body: Record<string, JsonValue>) =>
    apiClient('/api/ai/rewrite', { method: 'POST', body: JSON.stringify(body) }),
  chat: (body: Record<string, JsonValue>) =>
    apiClient('/api/ai/chat', { method: 'POST', body: JSON.stringify(body) }),
  summariseReviews: (itemId: string) =>
    apiClient('/api/ai/review-summary', {
      method: 'POST',
      body: JSON.stringify({ itemId }),
    }),
};