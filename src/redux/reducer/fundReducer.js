import {
    LOGIN_SUCCESS,
    LOGIN_FAILURE,
    VERIFICATION_OTP_SUCCESS,
    VERIFICATION_OTP_FAILURE,
    TWOFACTOR_AUTH_SUCCESS,
    TWOFACTOR_AUTH_FAILURE,
    RESECEND_OTP_SUCCESS,
    RESECEND_OTP_FAILURE,
    RESET_PASSWORD_SUCCESS,
    RESET_PASSWORD_FAILURE,
  } from "../actionType/loginActionType";
  
  const initialState = {
    loading: false,
    error: null,
    Success: null,
    message:null,
  };
  
  const fundReducer = (state = initialState, action) => {
    switch (action.type) {
      
      case RESECEND_OTP_SUCCESS:
        return {
          ...state,
          loading: true,
          resendStatus: action.payload,
          Success: action.payload,
          error: null,
        };
  
      case RESECEND_OTP_FAILURE:
        return {
          ...state,
          loading: false,
          error:
            typeof action.payload === "object" ? action.payload : action.payload,
          resendStatus: null,
        };
  
      case RESET_PASSWORD_SUCCESS:
        return {
          ...state,
          loading: false,
          resetPasswordResponse: action.payload,
          resetPasswordError: null,
          error: null,
        };
  
      case RESET_PASSWORD_FAILURE:
        return {
          ...state,
          loading: false,
          resetPasswordError:
            typeof action.payload === "object" ? action.payload : action.payload,
          resetPasswordResponse: null,
        };
  
      default:
        return state;
    }
  };
  
  export default fundReducer;
  