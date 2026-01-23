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
  VERIFY_FORGET_PASSWORD_SUCCESS,
  VERIFY_FORGET_PASSWORD_FAILURE,
  FORGET_PASSWORD_SUCCESS,
  FORGET_PASSWORD_FAILURE,
} from "../actionType/loginActionType";

const initialState = {
  loading: false,
  error: null,
  loginResponse: null,
  Success: null,
  message: null,
  verificationcode: null,
  verificationError: null,
  twoFactorAuth: null,
  twoFactorAuthError: null,
  resendStatus: null,
  resetPasswordResponse: null,
  resetPasswordError: null,
  currentStep: 1,
  forgetPasswordResponse: null,
  forgetPasswordError: null,
  verifyForgetPasswordResponse: null,
  verifyForgetPasswordError: null,
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
        message: action?.payload?.message,
      };

    case LOGIN_FAILURE:
      return {
        ...state,
        loading: false,
        error:
          typeof action.payload === "object" ? action.payload : action.payload,
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
      const verificationErrorPayload =
        typeof action.payload === "object" ? action.payload : action.payload;
      return {
        ...state,
        loading: false,
        verificationError: verificationErrorPayload,
        verificationcode: verificationErrorPayload
          ? {
            status: "FAILURE",
            message:
              typeof verificationErrorPayload === "object"
                ? verificationErrorPayload.message
                : verificationErrorPayload,
          }
          : null,
        Success: null,
      };

    case TWOFACTOR_AUTH_SUCCESS:
      return {
        ...state,
        loading: true,
        twoFactorAuth: action.payload,
        Success: action.payload,
        error: null,
        twoFactorAuthError: null,
      };

    case TWOFACTOR_AUTH_FAILURE:
      return {
        ...state,
        loading: false,
        twoFactorAuthError:
          typeof action.payload === "object" ? action.payload : action.payload,
        twoFactorAuth: null,
        error: null,
      };

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

    case VERIFY_FORGET_PASSWORD_SUCCESS:
      return {
        ...state,
        loading: false,
        verifyForgetPasswordResponse: action.payload,
        verifyForgetPasswordError: null,
      };
    case VERIFY_FORGET_PASSWORD_FAILURE:
      return {
        ...state,
        loading: false,
        error: typeof action.payload === "object" ? action.payload : action.payload,
        Success: null,
      };
    case FORGET_PASSWORD_SUCCESS:
      return {
        ...state,
        loading: false,
        forgetPasswordResponse: action.payload,
        forgetPasswordError: null,
      };
    case FORGET_PASSWORD_FAILURE:
      return {
        ...state,
        loading: false,
        forgetPasswordError: typeof action.payload === "object" ? action.payload : action.payload,
        forgetPasswordResponse: null,
      };
    default:
      return state;
  }
};

export default loginReducer;
