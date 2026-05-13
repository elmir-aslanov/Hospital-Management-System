import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// ── Authenticated (dashboard / protected) ─────────────────────────────────
const api = axios.create({ baseURL: BASE, withCredentials: true });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Public (no auth, no redirect) ─────────────────────────────────────────
export const publicApi = axios.create({ baseURL: BASE });

export default api;
