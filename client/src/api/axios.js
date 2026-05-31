import axios from 'axios';
import { toast } from 'sonner';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// ── Request interceptor — attach token ──────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — handle errors + refresh token ────────
let isRefreshing = false;
let refreshQueue = [];

const processQueue = (error, token = null) => {
  refreshQueue.forEach(({ resolve, reject }) => error ? reject(error) : resolve(token));
  refreshQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Aborted / canceled
    if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED' || axios.isCancel(error)) {
      return Promise.reject(error);
    }

    // Network error
    if (!error.response) {
      const url = error.config?.url || '';
      const silentRoutes = ['/notifications', '/dashboard/stats', '/analytics', '/doctors', '/site-doctors', '/departments', '/services', '/blog', '/appointments', '/ehr/patient-results'];
      if (!silentRoutes.some(r => url.includes(r))) {
        toast.error('Server ilə əlaqə qurulmadı. Backend işləyirmi?');
      }
      return Promise.reject(error);
    }

    const { status } = error.response;
    const originalRequest = error.config;

    // ── 401 → try refresh token ──────────────────────────────────
    if (status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            refreshQueue.push({ resolve, reject });
          }).then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          }).catch(err => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const res = await axios.post(`${BASE_URL}/auth/refresh-token`, {}, {
            headers: { Authorization: `Bearer ${refreshToken}` },
            withCredentials: true,
          });
          const newToken = res.data?.data?.accessToken || res.data?.accessToken;
          if (!newToken) throw new Error('No token in refresh response');

          localStorage.setItem('token', newToken);
          api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.dispatchEvent(new Event('storage'));
          const publicRoutes = ['/login', '/register', '/staff-login'];
          if (!publicRoutes.includes(window.location.pathname)) {
            toast.error('Sessiyanız bitib. Yenidən daxil olun.');
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // No refresh token — just clear and redirect
        const hadToken = !!localStorage.getItem('token');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('storage'));
        const publicRoutes = ['/login', '/register', '/staff-login'];
        if (hadToken && !publicRoutes.includes(window.location.pathname)) {
          toast.error('Sessiyanız bitib. Yenidən daxil olun.');
          window.location.href = '/login';
        }
      }
    }

    if (status === 500) {
      toast.error('Server xətası. Bir az sonra yenidən cəhd edin.');
    }

    return Promise.reject(error);
  }
);

export default api;
