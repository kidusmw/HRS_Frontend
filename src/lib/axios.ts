import axios from 'axios';

// Create an Axios instance with default configuration
const api = axios.create({
  // Use environment variable for base URL or default to localhost
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  // Default headers: accept JSON responses
  headers: {
    Accept: 'application/json',
  },
});

// Request interceptor to attach Bearer token
// Before every request is sent, Automatically attach the auth token
api.interceptors.request.use(
  (config) => {
    // Get the token from local storage
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // If sending FormData, let the browser set the correct multipart boundary
    if (config.data instanceof FormData && config.headers) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
// After every response is received, handle unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data on unauthorized
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      // Optionally redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { api };
export default api;
