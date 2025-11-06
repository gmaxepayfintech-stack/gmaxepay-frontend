import {
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  VERIFICATION_OTP_SUCCESS,
  VERIFICATION_OTP_FAILURE,
  TWOFACTOR_AUTH_SUCCESS,
  TWOFACTOR_AUTH_FAILURE,
  RESECEND_OTP_SUCCESS,
  RESET_PASSWORD_SUCCESS,
  RESET_PASSWORD_FAILURE
} from "../actionType/loginActionType";

const initialState = {
  loading: false,
  error: null,
  loginResponse: null,
  Success: null,
  verificationcode: null,
  verificationError: null,
  twoFactorAuth:null,
  twoFactorAuthError: null,
  resendStatus:null,
  resetPasswordResponse: null,
  resetPasswordError: null,
  currentStep: 1,
};

const loginReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_SUCCESS:
      return {
        ...state,
        loading: true,
        loginResponse: action.payload,
        Success: action.payload.status,
        error: null,
      };

    case LOGIN_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        loginResponse: null,
        Success: null,
      };

    case VERIFICATION_OTP_SUCCESS:
      return {
        ...state,
        loading: true,
        verificationcode: action.payload,
        Success: action.payload,
        error: null,
        verificationError: null,
      };

    case VERIFICATION_OTP_FAILURE:
      return {
        ...state,
        loading: false,
        verificationError: action.payload,
        verificationcode: action.payload ? { status: "FAILURE", message: action.payload } : null,
        Success: null,
      };
    
    case TWOFACTOR_AUTH_SUCCESS:
      return{
        ...state,
        loading:true,
        twoFactorAuth: action.payload,
        Success: action.payload,
        error:null,
        twoFactorAuthError: null,
      }

    case TWOFACTOR_AUTH_FAILURE:
      return {
        ...state,
        loading: false,
        twoFactorAuthError: action.payload,
        twoFactorAuth: null,
        error: null,
      }
    
      case RESECEND_OTP_SUCCESS:
        return{
          ...state,
          loading: true,
          resendStatus:action.payload,
          Success:action.payload,
          error:null,
        }

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
        resetPasswordError: action.payload,
        resetPasswordResponse: null,
      };

    default:
      return state;
  }
};

export default loginReducer;
