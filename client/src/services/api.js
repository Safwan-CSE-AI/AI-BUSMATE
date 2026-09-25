import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000,
});

// Automatically inject JWT Bearer token into headers if stored
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('busmate_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Optional: clear token if 401 occurs on authenticated endpoints
      // localStorage.removeItem('busmate_token');
    }
    return Promise.reject(error);
  }
);

export default api;
