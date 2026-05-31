const raw = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
export const API_URL  = raw;
export const BASE_URL = raw.replace('/api/v1', '');
export const BASE     = BASE_URL;
