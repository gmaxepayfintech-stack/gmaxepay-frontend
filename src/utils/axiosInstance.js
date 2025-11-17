import axios from 'axios';
import { API_ROUTE } from '../data/env';
import secureLocalStorage from 'react-secure-storage';
import { store } from '../redux/store';
import { shouldRefreshToken, refreshAccessTokenSync } from './tokenRefreshManager';

const api = axios.create({
  baseURL: API_ROUTE,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isLoggingOut = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// Request interceptor - check and refresh token proactively
api.interceptors.request.use(
  async config => {
    // Skip auth for certain endpoints
    const skipAuth = config?.skipAuth;
    if (skipAuth) return config;

    // Get companyId from config header (not stored)
    let companyId = config.headers?.['x-company-id'] || '';

    // Get token from secure storage
    let token = secureLocalStorage.getItem('userToken');

    // If token exists and needs refresh, refresh it proactively
    // But only if we have companyId (either from headers or can be retrieved)
    if (token && shouldRefreshToken(token)) {
      // If companyId is not in headers, skip proactive refresh
      // The refresh will happen in ProtectedRoute after company context loads
      // or when handling 401 errors where companyId should be available
      if (!companyId) {
        // Skip proactive refresh if no companyId - will be handled by ProtectedRoute
        // or retried when 401 error occurs
      } else {
        try {
          // Use shared refresh manager - it handles deduplication internally
          const newToken = await refreshAccessTokenSync(companyId);
          
          if (newToken) {
            token = newToken;
            processQueue(null, newToken);
          } else {
            throw new Error('Token refresh failed');
          }
        } catch (err) {
          console.error('🔁 Token pre-refresh failed:', err.message);
          processQueue(err, null);
          
          if (!isLoggingOut) {
            isLoggingOut = true;
            secureLocalStorage.removeItem("userToken");
            secureLocalStorage.removeItem("refreshToken");
            secureLocalStorage.removeItem("userData");
            // Dispatch logout action if needed
            if (store && store.dispatch) {
              const { logout } = require('../redux/action/authAction');
              store.dispatch(logout());
            }
          }
          return Promise.reject(err);
        }
      }
    }

    // Add token to request headers
    if (token) {
      config.headers['token'] = token;
    }

    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor - handle 401 errors and refresh token
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    const isRefreshCall = originalRequest?.url?.includes('/auth/refresh-token');
    const isLogoutCall = originalRequest?.url?.includes('/auth/logout');

    // Don't retry refresh or logout calls
    if ((isRefreshCall || isLogoutCall) && !originalRequest._retry) {
      if (!isLoggingOut) {
        isLoggingOut = true;
        secureLocalStorage.removeItem("userToken");
        secureLocalStorage.removeItem("refreshToken");
        secureLocalStorage.removeItem("userData");
        
        if (store && store.dispatch) {
          const { logout } = require('../redux/action/authAction');
          store.dispatch(logout());
        }
      }
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized - token expired
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isRefreshCall &&
      !isLogoutCall &&
      !isLoggingOut
    ) {
      originalRequest._retry = true;

      try {
        const companyId = originalRequest.headers?.['x-company-id'] || '';
        
        // Use shared refresh manager - it handles deduplication internally
        const newToken = await refreshAccessTokenSync(companyId);

        if (!newToken) {
          throw new Error('No access token returned');
        }

        processQueue(null, newToken);
        originalRequest.headers['token'] = newToken;

        return api(originalRequest);
      } catch (err) {
        console.error('❌ Refresh token failed:', err.response?.data || err.message);
        processQueue(err, null);

        if (!isLoggingOut) {
          isLoggingOut = true;
          secureLocalStorage.removeItem("userToken");
          secureLocalStorage.removeItem("refreshToken");
          secureLocalStorage.removeItem("userData");
          
          if (store && store.dispatch) {
            const { logout } = require('../redux/action/authAction');
            store.dispatch(logout());
          }
        }

        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

