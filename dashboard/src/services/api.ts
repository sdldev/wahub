import axios from 'axios';
import { navigateTo } from '@/lib/navigation';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const apiKey = localStorage.getItem('apiKey');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (apiKey) {
      config.headers['x-api-key'] = apiKey;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('apiKey');
      navigateTo('/login');
    }
    return Promise.reject(error);
  }
);

export default api;
