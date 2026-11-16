import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('medblock_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauth
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      // localStorage.removeItem('medblock_token');
    }
    return Promise.reject(error);
  }
);

// API Service functions
export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  getAllUsers: () => api.get('/auth/users'),
};

export const recordService = {
  uploadFile: (formData) => api.post('/records/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  calculateHash: (data) => {
    if (data instanceof FormData) {
      return api.post('/records/hash', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.post('/records/hash', data);
  },
  registerRecord: (data) => api.post('/records/register', data),
  getAllRecords: () => api.get('/records'),
  getRecordById: (id) => api.get(`/records/${id}`),
  verifyRecord: (formDataOrJson) => {
    if (formDataOrJson instanceof FormData) {
      return api.post('/records/verify', formDataOrJson, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.post('/records/verify', formDataOrJson);
  },
  getVerificationHistory: () => api.get('/records/verification-history'),
  getDownloadUrl: (recordId) => `${API_BASE_URL}/records/download/${recordId}`
};

export const providerService = {
  getProviders: () => api.get('/providers'),
  authorizeProvider: (data) => api.post('/providers/authorize', data),
  revokeProvider: (data) => api.post('/providers/revoke', data),
};

export const demoService = {
  getSamples: () => api.get('/demo/samples'),
  simulateTamper: (data) => api.post('/demo/tamper-compare', data),
};

export default api;
