import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';
export const API_ORIGIN = BASE_URL.replace(/\/api\/?$/, '');

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

const refreshClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

const AUTH_PATHS = ['/auth/login', '/auth/refresh', '/auth/logout'];

export function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('activeRole');
  window.dispatchEvent(new Event('auth:logout'));
}

let refreshPromise: Promise<string | null> | null = null;

async function performRefresh(): Promise<string | null> {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return null;
  const res = await refreshClient.post('/auth/refresh', { refreshToken });
  const accessToken = res.data?.accessToken as string | undefined;
  if (!accessToken) return null;
  localStorage.setItem('token', accessToken);
  if (res.data?.refreshToken) localStorage.setItem('refreshToken', res.data.refreshToken);
  return accessToken;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original: any = error?.config;
    const status = error?.response?.status;
    const url = String(original?.url || '');
    if (status !== 401 || !original || original.__retried || AUTH_PATHS.some((p) => url.includes(p))) {
      return Promise.reject(error);
    }
    original.__retried = true;
    try {
      if (!refreshPromise) {
        refreshPromise = performRefresh().finally(() => {
          refreshPromise = null;
        });
      }
      const token = await refreshPromise;
      if (!token) {
        clearSession();
        return Promise.reject(error);
      }
      original.headers = original.headers || {};
      original.headers.Authorization = `Bearer ${token}`;
      return api(original);
    } catch (refreshError) {
      clearSession();
      return Promise.reject(refreshError);
    }
  },
);

export default api;
