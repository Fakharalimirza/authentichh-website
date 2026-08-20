/**
 * @fileoverview Admin authentication context — manages login state, token persistence, and auto-logout.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../utils/api';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setToken(null);
    setUser(null);
    navigate('/admin/login');
  }, [navigate]);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    adminApi.get('/me')
      .then(r => setUser(r.data))
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await adminApi.post('/login', { email, password });
    localStorage.setItem('adminToken', res.data.token);
    localStorage.setItem('adminUser', JSON.stringify(res.data.user));
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  return (
    <AdminAuthContext.Provider value={{ user, token, isAuthenticated: !!token && !!user, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

/** Returns admin auth context — must be used within <AdminAuthProvider>. */
export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
