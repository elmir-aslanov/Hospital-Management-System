import axios from 'axios';
import { toast } from 'sonner';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // Network error — only show toast if it's not a background/silent request
      const url = error.config?.url || '';
      const silentRoutes = ['/notifications', '/dashboard/stats', '/analytics'];
      const isSilent = silentRoutes.some(r => url.includes(r));
      if (!isSilent) {
        toast.error('Server ilə əlaqə qurulmadı. Backend işləyirmi?');
      }
      return Promise.reject(error);
    }

    const { status } = error.response;

    if (status === 401) {
      const hadToken = !!localStorage.getItem('token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('storage'));
      // Only redirect if the user had an active session (expired token).
      // Anonymous users hitting protected endpoints should NOT be redirected.
      const publicRoutes = ['/login', '/register', '/staff-login'];
      if (hadToken && !publicRoutes.includes(window.location.pathname)) {
        toast.error('Sessiyanız bitib. Yenidən daxil olun.');
        window.location.href = '/login';
      }
    } else if (status === 500) {
      toast.error('Server xətası. Bir az sonra yenidən cəhd edin.');
    }

    return Promise.reject(error);
  }
);

export default api;
