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

const REMOTE_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Same-origin proxy avoids CORS when dev server port !== backend allowed origin
    return '/backend-api';
  }
  return REMOTE_API_URL.replace(/\/$/, '');
};

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

const storeAuthCredentials = (response: JsonValue) => {
  if (typeof window === 'undefined') return null;

  const payload =
    response && typeof response === 'object' && 'data' in response
      ? (response as JsonRecord).data
      : response;
  const record =
    payload && typeof payload === 'object' ? (payload as JsonRecord) : null;
  const token =
    (record?.accessToken as string | undefined) ||
    (record?.token as string | undefined);
  const user = record?.user;

  if (token) {
    localStorage.setItem('writeflow_token', String(token));
  }
  if (user) {
    localStorage.setItem('writeflow_user', JSON.stringify(user));
  }

  return { token, user };
};

export const apiClient = async (
  path: string,
  options: RequestInit = {},
  serverToken?: string
): Promise<JsonValue> => {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${path}`;
  const isClient = typeof window !== 'undefined';
  const token =
    serverToken ??
    (isClient
      ? localStorage.getItem('writeflow_token') || localStorage.getItem('accessToken')
      : null);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let response: Response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch {
    throw new ApiError(
      'Could not reach the server. Check your connection and try again.',
      0
    );
  }

  const data = await readJsonSafe(response);

  if (!response.ok) {
    const message =
      (data && typeof data === 'object' && 'message' in data && data.message) ||
      response.statusText ||
      'Request failed';
    const friendlyMessage =
      response.status === 401
        ? 'Your session expired. Please sign out and sign in again.'
        : String(message);
    throw new ApiError(friendlyMessage, response.status, data ?? undefined);
  }

  return data as JsonValue;
};

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await apiClient('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    const { user } = storeAuthCredentials(response) ?? {};
    return user ?? null;
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('writeflow_token');
      localStorage.removeItem('writeflow_user');
    }
  },

  register: async ({ name, email, password }: { name: string; email: string; password: string }) => {
    const response = await apiClient('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    storeAuthCredentials(response);
    return response;
  },
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
    apiClient(`/api/documents${buildQueryString(params)}`),
  createDocument: (body: Record<string, JsonValue>) =>
    apiClient('/api/documents', { method: 'POST', body: JSON.stringify(body) }),
  updateDocument: (id: string, body: Record<string, JsonValue>) =>
    apiClient(`/api/documents/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteDocument: (id: string) => apiClient(`/api/documents/${id}`, { method: 'DELETE' }),
};

export const ailogsApi = {
  getLogs: (params: Record<string, JsonValue> = {}) =>
    apiClient(`/api/ai/history${buildQueryString(params)}`),
};

export const usersApi = {
  getMe: (token?: string) => apiClient('/api/users/me', {}, token),
  updateMe: (body: Record<string, JsonValue>, token?: string) =>
    apiClient(
      '/api/users/me',
      {
        method: 'PATCH',
        body: JSON.stringify(body),
      },
      token
    ),
  getAllUsers: (params: Record<string, JsonValue> = {}) =>
    apiClient(`/api/users${buildQueryString(params)}`),
  toggleStatus: (userId: string) =>
    apiClient(`/api/users/${userId}/toggle-status`, {
      method: 'PATCH',
    }),
  changeRole: (userId: string, role: string) =>
    apiClient(`/api/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),
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
  getUser: (userId: string) => apiClient(`/api/users/${userId}`),
  updateUserProfile: (userId: string, body: Record<string, JsonValue>) =>
    apiClient(`/api/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  updateUserRole: (userId: string, role: string) =>
    apiClient(`/api/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),
  toggleUserStatus: (userId: string) =>
    apiClient(`/api/users/${userId}/toggle-status`, {
      method: 'PATCH',
    }),
  deleteUser: (userId: string) =>
    apiClient(`/api/users/${userId}`, { method: 'DELETE' }),
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

export const reviewsApi = {
  getByItem: (itemId: string, params: Record<string, JsonValue> = {}) =>
    apiClient(`/api/reviews/item/${itemId}${buildQueryString(params)}`),
  create: (body: object) =>
    apiClient('/api/reviews', { method: 'POST', body: JSON.stringify(body) }),
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
  getHistory: (params: Record<string, JsonValue> = {}) =>
    apiClient(`/api/ai/history${buildQueryString(params)}`),
};