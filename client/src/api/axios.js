import axios from 'axios';
import { toast } from 'sonner';
import { clearAuthStorage } from '../utils/authSession';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
const REFRESH_PATH = '/auth/refresh-token';
const SKIP_REFRESH_PATHS = [
  '/auth/login',
  '/auth/register',
  REFRESH_PATH,
  '/auth/request-email-otp',
  '/auth/verify-email-otp',
  '/auth/firebase-phone-login',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
];

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

const getRequestPath = (url = '') => {
  if (!url) return '';
  try {
    return new URL(url, BASE_URL).pathname.replace('/api/v1', '');
  } catch {
    return url;
  }
};

const shouldSkipRefresh = (url) => {
  const path = getRequestPath(url);
  return SKIP_REFRESH_PATHS.some(item => path.startsWith(item));
};

const getLoginRedirectPath = () => {
  const path = window.location.pathname;
  const staffPaths = ['/admin', '/doctor', '/nurse', '/receptionist', '/lab', '/dashboard'];
  return staffPaths.some(item => path.startsWith(item)) ? '/admin' : '/login';
};

const shouldRedirectAfterSessionExpiry = () => {
  const path = window.location.pathname;
  const publicRoutes = ['/login', '/register', '/staff-login', '/forgot-password', '/admin'];
  const privateRoutes = ['/patient', '/dashboard', '/admin/', '/doctor', '/nurse', '/receptionist', '/lab'];
  return !publicRoutes.includes(path) && privateRoutes.some(item => path.startsWith(item));
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
    if (status === 401 && !originalRequest._retry && !shouldSkipRefresh(originalRequest.url)) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const res = await axios.post(`${BASE_URL}${REFRESH_PATH}`, null, {
          withCredentials: true,
        });
        const newToken = res.data?.data?.accessToken || res.data?.accessToken;
        if (!newToken) throw new Error('No token in refresh response');

        localStorage.setItem('token', newToken);
        localStorage.removeItem('refreshToken');
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        const shouldRedirect = shouldRedirectAfterSessionExpiry();
        clearAuthStorage();
        if (shouldRedirect) {
          toast.error('Sessiyanız bitib. Yenidən daxil olun.');
          window.location.href = getLoginRedirectPath();
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (status === 500) {
      toast.error('Server xətası. Bir az sonra yenidən cəhd edin.');
    }

    return Promise.reject(error);
  }
);

export default api;
