import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Track if we're currently refreshing to avoid multiple refresh calls
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// Handle 401 responses — try refresh token first, then logout
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip auth pages and retry loops
    const isAuthEndpoint = originalRequest.url?.includes('/auth/');
    if (error.response?.status !== 401 || isAuthEndpoint || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Try refreshing the token
    const refreshToken = sessionStorage.getItem('refreshToken');
    if (!refreshToken) {
      // No refresh token — force logout
      forceLogout();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue this request until refresh completes
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(token => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return API(originalRequest);
      });
    }

    isRefreshing = true;
    originalRequest._retry = true;

    try {
      const res = await axios.post('/api/auth/refresh', { refreshToken });
      const newToken = res.data.data.token;
      const newRefreshToken = res.data.data.refreshToken;

      sessionStorage.setItem('token', newToken);
      sessionStorage.setItem('refreshToken', newRefreshToken);

      API.defaults.headers.common.Authorization = `Bearer ${newToken}`;
      originalRequest.headers.Authorization = `Bearer ${newToken}`;

      processQueue(null, newToken);
      return API(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      forceLogout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

function forceLogout() {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('refreshToken');
  sessionStorage.removeItem('user');
  const isAuthPage = ['/login', '/register', '/forgot-password', '/'].includes(window.location.pathname);
  if (!isAuthPage) {
    window.location.href = '/login';
  }
}

export default API;
