import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { API_ROUTE } from '../data/env';
import secureLocalStorage from 'react-secure-storage';

// Global state for token refresh management
let isRefreshing = false;
let refreshPromise = null;
let lastRefreshTime = null;
const REFRESH_DEBOUNCE_MS = 1788000; // 29.8 minutes (1788 seconds) - prevent multiple refreshes within 29.8 minutes

// Helper function to check if token needs refresh (at 4.8 minutes = 288 seconds)
export const shouldRefreshToken = (token) => {
  if (!token) return false;
  
  try {
    const decoded = jwtDecode(token);
    const now = Date.now() / 1000; // Current time in seconds
    const expiresIn = decoded.exp - now; // Time until expiry in seconds
    
    // Refresh if token expires in less than 288 seconds (4.8 minutes)
    // Since access token is valid for 5 minutes, refresh at 4.8 minutes
    // Refresh token is valid for 25 minutes, total session is 30 minutes
    return expiresIn < 288;
  } catch (e) {
    // If decoding fails, assume token is invalid
    return false;
  }
};

// Function to refresh access token (shared across entire app)
export const refreshAccessTokenSync = async (companyId) => {
  // If already refreshing, return the existing promise
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  // Debounce: If refreshed recently, don't refresh again
  const now = Date.now();
  if (lastRefreshTime && (now - lastRefreshTime) < REFRESH_DEBOUNCE_MS) {
    // Return the token that was refreshed recently
    const currentToken = secureLocalStorage.getItem('userToken');
    return currentToken;
  }

  // Set refreshing flag
  isRefreshing = true;
  lastRefreshTime = now;

  // Create refresh promise
  refreshPromise = (async () => {
    try {
      const refreshToken = secureLocalStorage.getItem("refreshToken");

      if (!refreshToken) {
        secureLocalStorage.removeItem("userToken");
        secureLocalStorage.removeItem("refreshToken");
        secureLocalStorage.removeItem("userData");
        throw new Error('No refresh token available');
      }

      // Use companyId from parameter (don't store it)
      const finalCompanyId = companyId || '';

      const response = await axios.post(
        `${API_ROUTE}/api/v1/auth/refresh-token`,
        { refreshToken },
        {
          headers: {
            "Content-Type": "application/json",
            "x-company-id": finalCompanyId,
          },
        }
      );

      const data = response?.data;
      const { status } = data ?? {};

      if (status === "SUCCESS" || status === 200) {
        const accessToken = data?.data?.accessToken || data?.accessToken;
        const newRefreshToken = data?.data?.refreshToken || data?.refreshToken;
        const token = data?.data?.token || data?.token;
        const userData = data?.data?.user || data?.user;

        if (accessToken) {
          secureLocalStorage.setItem("userToken", accessToken);
        } else if (token) {
          secureLocalStorage.setItem("userToken", token);
        }

        if (newRefreshToken) {
          secureLocalStorage.setItem("refreshToken", newRefreshToken);
        }

        if (userData) {
          secureLocalStorage.setItem("userData", JSON.stringify(userData));
        }

        const newToken = accessToken || token;
        return newToken;
      } else {
        // Refresh token is invalid or expired
        secureLocalStorage.removeItem("userToken");
        secureLocalStorage.removeItem("refreshToken");
        secureLocalStorage.removeItem("userData");
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      // Refresh token is invalid or expired
      secureLocalStorage.removeItem("userToken");
      secureLocalStorage.removeItem("refreshToken");
      secureLocalStorage.removeItem("userData");
      throw error;
    } finally {
      // Reset refreshing state after a short delay to allow all requests to complete
      setTimeout(() => {
        isRefreshing = false;
        refreshPromise = null;
      }, 1000);
    }
  })();

  try {
    const newToken = await refreshPromise;
    return newToken;
  } catch (error) {
    throw error;
  }
};

// Reset refresh state (for testing or manual reset)
export const resetRefreshState = () => {
  isRefreshing = false;
  refreshPromise = null;
  lastRefreshTime = null;
};

