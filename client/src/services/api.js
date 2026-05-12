import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api/v1' : 'http://localhost:5000/api/v1');

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============ CLIENTS ============
export const clientAPI = {
  getAll: (params) => api.get('/clients', { params }),
  getById: (id) => api.get(`/clients/${id}`),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`),
};

// ============ VEHICLES ============
export const vehicleAPI = {
  getAll: (params) => api.get('/vehicles', { params }),
  getById: (id) => api.get(`/vehicles/${id}`),
  create: (data) => api.post('/vehicles', data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  delete: (id) => api.delete(`/vehicles/${id}`),
};

// ============ POLICIES ============
export const policyAPI = {
  getAll: (params) => api.get('/policies', { params }),
  getById: (id) => api.get(`/policies/${id}`),
  getExpiring: (days) => api.get('/policies/expiring', { params: { days } }),
  create: (data) => api.post('/policies', data),
  update: (id, data) => api.put(`/policies/${id}`, data),
  delete: (id) => api.delete(`/policies/${id}`),
};

// ============ DASHBOARD ============
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getRenewals: () => api.get('/dashboard/renewals'),
  getMonthlyReport: (year) => api.get('/dashboard/reports/monthly', { params: { year } }),
  getCompanyReport: () => api.get('/dashboard/reports/companies'),
  getAgentReport: () => api.get('/dashboard/reports/agents'),
  getRenewalStatus: () => api.get('/dashboard/reports/renewal-status'),
};

export default api;
