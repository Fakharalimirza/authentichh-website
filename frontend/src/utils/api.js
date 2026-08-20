/**
 * @fileoverview Axios instances for public and admin API calls.
 * Admin instance auto-attaches JWT and redirects to login on 401/403.
 */

import axios from 'axios';

/** Public API client — baseURL: /api */
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

/** Admin API client — baseURL: /api/admin, auto-attaches Bearer token */
const adminApi = axios.create({
  baseURL: '/api/admin',
  headers: { 'Content-Type': 'application/json' }
});

/** Attach admin JWT from localStorage to every admin request. */
adminApi.interceptors.request.use(config => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** On 401/403, clear credentials and redirect to admin login. */
adminApi.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export { api, adminApi };
