import { LOGIN_SUCCESS, LOGOUT, RESTORE_AUTH } from '../actionType/authActionType';

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
          console.log(error);
          
        localStorage.removeItem('auth');
        return state;
      }
    default:
      return state;
  }
};

export default authReducer;

