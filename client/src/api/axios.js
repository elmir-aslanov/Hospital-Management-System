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
      toast.error('İnternet bağlantısını yoxlayın.');
      return Promise.reject(error);
    }

    const { status } = error.response;

    if (status === 401) {
      const hadToken = !!localStorage.getItem('token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('storage'));
      // Only redirect when the user had an active session that expired.
      // Public pages making unauthenticated requests should NOT be redirected.
      if (hadToken) {
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
