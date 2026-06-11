import { createContext, useContext, useState, useEffect } from 'react';
import * as authApi from '../api/authApi';
import { clearAuthStorage, saveAccessSession } from '../utils/authSession';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  if (typeof useState !== 'function') {
    console.error('AuthProvider: React hooks unavailable');
    return children;
  }
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user,  setUser]  = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  });

  const login = (accessToken, userData) => {
    saveAccessSession(accessToken, userData);
    setToken(accessToken);
    setUser(userData);
  };

  const logout = async () => {
    try { await authApi.logout(); } catch {
      // Local session should still be cleared if server logout cannot complete.
    }
    clearAuthStorage();
    setToken(null);
    setUser(null);
  };

  // Sync state when other tabs or pages write to localStorage
  useEffect(() => {
    const sync = () => {
      const t = localStorage.getItem('token');
      setToken(t);
      try { setUser(JSON.parse(localStorage.getItem('user') || 'null')); } catch { setUser(null); }
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
