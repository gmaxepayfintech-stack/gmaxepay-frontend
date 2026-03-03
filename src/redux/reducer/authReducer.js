import { LOGIN_SUCCESS, LOGOUT, RESTORE_AUTH } from '../actionType/authActionType';
import secureLocalStorage from 'react-secure-storage';

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload,
        token: action.payload?.token || action.payload?.accessToken || null,
        isAuthenticated: true,
      };
    case LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
      };
    case RESTORE_AUTH:
      try {
        // First check secureLocalStorage for userToken and userData
        const userToken = secureLocalStorage.getItem('userToken');
        const userData = secureLocalStorage.getItem('userData');
        
        if (userToken && userData) {
          try {
            const parsedUserData = typeof userData === 'string' ? JSON.parse(userData) : userData;
            // Store in same format as LOGIN_SUCCESS: { token, user }
            const authPayload = {
              token: userToken,
              user: parsedUserData,
            };
            return {
              ...state,
              user: authPayload,
              token: userToken,
              isAuthenticated: !!userToken,
            };
          } catch (parseError) {
            console.error('Error parsing userData from secureLocalStorage:', parseError);
            // Remove invalid data
            secureLocalStorage.removeItem('userData');
            secureLocalStorage.removeItem('userToken');
          }
        }
        
        // Fallback to localStorage for backward compatibility
        const storedAuth = localStorage.getItem('auth');
        if (storedAuth) {
          const authData = JSON.parse(storedAuth);
          return {
            ...state,
            user: authData.user,
            token: authData.token,
            isAuthenticated: !!authData.token,
          };
        }
        return state;
      } catch (error) {
        console.error('Error restoring auth:', error);
        localStorage.removeItem('auth');
        secureLocalStorage.removeItem('userData');
        secureLocalStorage.removeItem('userToken');
        return state;
      }
    default:
      return state;
  }
};

export default authReducer;

