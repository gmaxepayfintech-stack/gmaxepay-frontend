import secureLocalStorage from 'react-secure-storage';
import { store } from '../redux/store';
import { logout } from '../redux/action/authAction';

/**
 * Clears all items from secureLocalStorage and dispatches logout action
 * This should be called when token expires or authentication fails
 */
export const clearAllStorage = () => {
  try {
    // Get all keys from secureLocalStorage
    // Note: react-secure-storage doesn't have a getAllKeys method,
    // so we'll remove known keys and also try to clear all possible keys
    const knownKeys = [
      'userToken',
      'refreshToken',
      'userData',
      'loginToken',
      'onboardingSteps',
      'onboardingToken',
      'companyId',
      'selectedCompany',
    ];

    // Remove all known keys
    knownKeys.forEach(key => {
      try {
        secureLocalStorage.removeItem(key);
      } catch (e) {
        console.warn(`Failed to remove ${key} from secureLocalStorage:`, e);
      }
    });

    // Also clear regular localStorage items that might be related to auth
    try {
      localStorage.removeItem('auth');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (e) {
      console.warn('Failed to clear localStorage:', e);
    }

    // Dispatch logout action to clear Redux state
    if (store && store.dispatch) {
      store.dispatch(logout());
    }

    console.log('✅ All storage cleared due to token expiration');
  } catch (error) {
    console.error('❌ Error clearing storage:', error);
  }
};

/**
 * Checks if an error indicates token expiration
 */
export const isTokenExpiredError = (error) => {
  const httpStatus = error?.response?.status;
  const message = error?.response?.data?.message || error?.message || '';
  const status = error?.response?.data?.status;

  return (
    httpStatus === 401 ||
    httpStatus === 403 ||
    status === 'UNAUTHORIZED' ||
    status === 'BAD_REQUEST' ||
    message.toLowerCase().includes('token expired') ||
    message.toLowerCase().includes('jwt expired') ||
    message.toLowerCase().includes('unauthorized') ||
    message.toLowerCase().includes('invalid token') ||
    message.toLowerCase().includes('token has expired')
  );
};
