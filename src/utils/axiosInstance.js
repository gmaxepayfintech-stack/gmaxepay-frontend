import axios from 'axios';
import { API_ROUTE } from '../data/env';
import secureLocalStorage from 'react-secure-storage';
import { shouldRefreshToken, refreshAccessTokenSync } from './tokenRefreshManager';
import { clearAllStorage, isTokenExpiredError } from './clearStorage';
import { getGlobalNotificationHandler } from '../context/NotificationContext';

const api = axios.create({
  baseURL: API_ROUTE,
  headers: {
    'Content-Type': 'application/json',
  },
});


let isLoggingOut = false;
let failedQueue = [];

// ================= LOGGING FUNCTION =================
const logRequest = (config) => {
  const requestLog = {
    timestamp: new Date().toISOString(),
    method: config.method?.toUpperCase() || 'UNKNOWN',
    url: `${config.baseURL || ''}${config.url || ''}`,
    endpoint: config.url || '',
    headers: {
      ...config.headers,
      token: config.headers?.token ? `${config.headers.token.substring(0, 10)}...` : 'No token',
    },
    params: config.params || {},
    data: config.data || null,
    skipAuth: config?.skipAuth || false,
  };
};

const logSuccessResponse = (response) => {
  const responseLog = {
    timestamp: new Date().toISOString(),
    status: response.status,
    statusText: response.statusText,
    method: response.config?.method?.toUpperCase() || 'UNKNOWN',
    url: `${response.config?.baseURL || ''}${response.config?.url || ''}`,
    endpoint: response.config?.url || '',
    data: response.data || null,
    headers: response.headers || {},
  };

};

const logErrorResponse = (error) => {
  const originalRequest = error.config || {};
  const isRefreshCall = originalRequest?.url?.includes('/auth/refresh-token');
  const isLogoutCall = originalRequest?.url?.includes('/auth/logout');

  const errorLog = {
    timestamp: new Date().toISOString(),
    status: error?.response?.status || 'NO_RESPONSE',
    statusText: error?.response?.statusText || 'Network Error',
    method: originalRequest?.method?.toUpperCase() || 'UNKNOWN',
    url: `${originalRequest?.baseURL || ''}${originalRequest?.url || ''}`,
    endpoint: originalRequest?.url || '',
    errorMessage: error?.response?.data?.message || error?.message || 'Unknown error',
    errorData: error?.response?.data || null,
    headers: error?.response?.headers || {},
    isRefreshCall,
    isLogoutCall,
  };

};

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// ================= REQUEST INTERCEPTOR =================
api.interceptors.request.use(
  async config => {
    // ================= LOG REQUEST (ALWAYS) =================
    logRequest(config);

    const skipAuth = config?.skipAuth;
    if (skipAuth) return config;

    let companyId = config.headers?.['x-company-id'] || '';
    let token = secureLocalStorage.getItem('userToken');

    // Proactive token refresh
    if (token && shouldRefreshToken(token)) {
      if (companyId) {
        try {
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
            clearAllStorage();

            // Show notification
            const notificationHandler = getGlobalNotificationHandler();
            if (notificationHandler) {
              notificationHandler.showNotification({
                message: 'Token refresh failed. Please login again.',
                type: 'error',
                isCritical: true,
                duration: 5000,
              });
            }

            // Navigate to login page immediately (no re-renders)
            window.location.replace('/auth/login');
          }

          return Promise.reject(err);
        }
      }
    }

    if (token) {
      config.headers['token'] = token;
    }

    return config;
  },
  error => {
    console.error('❌ Request Error:', {
      timestamp: new Date().toISOString(),
      error: error?.message || 'Unknown request error',
      config: error?.config || null,
    });
    return Promise.reject(error);
  }
);

// ================= RESPONSE INTERCEPTOR =================
api.interceptors.response.use(
  response => {
    // ================= LOG SUCCESS RESPONSE =================
    logSuccessResponse(response);

    // Handle case where API returns 2xx but with UNAUTHORIZED status in body
    if (response.data?.status === 'UNAUTHORIZED' && !isLoggingOut) {
      const isLoginPage = window.location.pathname.includes('/auth/login');
      if (!isLoginPage) {
        isLoggingOut = true;
        const errorMessage = response.data?.message || 'Session expired. Please login again.';

        const notificationHandler = getGlobalNotificationHandler();
        if (notificationHandler) {
          notificationHandler.showNotification({
            message: errorMessage,
            type: 'error',
            isCritical: true,
            duration: 3000,
          });
        }

        clearAllStorage();
        window.location.href = window.location.origin + '/auth/login';
      }
    }

    return response;
  },
  async error => {
    const originalRequest = error.config;
    const isRefreshCall = originalRequest?.url?.includes('/auth/refresh-token');
    const isLogoutCall = originalRequest?.url?.includes('/auth/logout');

    // ================= LOG ERROR RESPONSE (ALWAYS) =================
    logErrorResponse(error);

    // Handle 401 Unauthorized or UNAUTHORIZED status in response
    // ANY 401 error (including refresh-token failures) should logout and navigate
    const isUnauthorized =
      error.response?.status === 401 ||
      error.response?.data?.status === 'UNAUTHORIZED';

    // Safety check: Don't redirect if we're already on the login page to avoid loops
    const isLoginPage = window.location.pathname.includes('/auth/login');

    if (isUnauthorized && !isLoggingOut && !isLoginPage) {
      // Prevent multiple logout attempts
      isLoggingOut = true;

      // Get the actual error message from API response
      const errorMessage =
        error.response?.data?.message ||
        'Token has been invalidated. Please login again.';

      console.error('🔒 Token invalidated - logging out user');

      // Clear all storage and logout (synchronous, no re-renders)
      clearAllStorage();

      // Show notification (non-blocking)
      const notificationHandler = getGlobalNotificationHandler();
      if (notificationHandler) {
        notificationHandler.showNotification({
          message: errorMessage,
          type: 'error',
          isCritical: true,
          duration: 3000,
        });
      }

      // Navigate immediately - use absolute origin to avoid relative path issues
      window.location.href = window.location.origin + '/auth/login';

      return Promise.reject(error);
    }

    // ================= HANDLE 403 =================
    if (error.response?.status === 403 && !isLoggingOut) {
      const isLoginPage = window.location.pathname.includes('/auth/login');
      if (isTokenExpiredError(error) && !isLoginPage) {
        isLoggingOut = true;
        clearAllStorage();

        const errorMessage = error.response?.data?.message || 'Token expired. Please login again.';

        // Show notification
        const notificationHandler = getGlobalNotificationHandler();
        if (notificationHandler) {
          notificationHandler.showNotification({
            message: errorMessage,
            type: 'error',
            isCritical: true,
            duration: 5000,
          });
        }

        // Navigate to login page immediately using absolute URL
        window.location.href = window.location.origin + '/auth/login';
      }
    }

    return Promise.reject(error);
  }
);

// ================= ADD LOGGING TO DEFAULT AXIOS INSTANCE =================
// This ensures all API calls (even those using axios directly) are logged
axios.interceptors.request.use(
  config => {
    logRequest(config);
    return config;
  },
  error => {
    logErrorResponse(error);
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  response => {
    logSuccessResponse(response);
    return response;
  },
  error => {
    logErrorResponse(error);

    // Handle 401 Unauthorized for default axios instance as well
    const isUnauthorized =
      error.response?.status === 401 ||
      error.response?.data?.status === 'UNAUTHORIZED';

    const isLoginPage = window.location.pathname.includes('/auth/login');

    if (isUnauthorized && !isLoggingOut && !isLoginPage) {
      isLoggingOut = true;

      // Get the actual error message from API response
      const errorMessage =
        error.response?.data?.message ||
        'Token has been invalidated. Please login again.';

      console.error('🔒 Token invalidated - logging out user (default axios)');

      // Clear all storage and logout
      clearAllStorage();

      // Show notification
      const notificationHandler = getGlobalNotificationHandler();
      if (notificationHandler) {
        notificationHandler.showNotification({
          message: errorMessage,
          type: 'error',
          isCritical: true,
          duration: 5000,
        });
      }

      // Navigate to login page immediately using absolute URL
      window.location.href = window.location.origin + '/auth/login';
    }

    return Promise.reject(error);
  }
);

export default api;
