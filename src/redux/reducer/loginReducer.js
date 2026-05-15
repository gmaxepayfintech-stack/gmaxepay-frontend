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
  VERIFY_MPIN_SUCCESS,
  VERIFY_MPIN_FAILURE,
  SET_MPIN_SUCCESS,
  SET_MPIN_FAILURE,
  LOGOUT_SUCCESS,
  LOGOUT_FAILURE,
  FORGET_MPIN_SUCCESS,
  VERIFY_MPIN_OTP_SUCCESS,
  FORGET_MPIN_FAILURE,
  VERIFY_MPIN_OTP_FAILURE,
  GET_NOTIFICATIONS_SUCCESS,
  MARK_NOTIFICATION_READ_SUCCESS,
  MARK_NOTIFICATION_READ_SUCCESS_COMPANY,
  GET_NOTIFICATIONS_SUCCESS_COMPANY,
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
  verifyMPINResponse: null,
  verifyMPINError: null,
  setMPINResponse: null,
  setMPINError: null,
  logoutError: null,
  logoutResponse: null,
  forgotMpinResponse: null,
  verifyMpinOTPResponse: null,
  ForgetError: null,
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

    case GET_NOTIFICATIONS_SUCCESS:
      return {
        ...state,
        loading: false,
        getNotificationsResponse: action.payload,
        getNotificationsError: null,
        success: action.payload.status,
        message: action.payload.message,
      }
    case MARK_NOTIFICATION_READ_SUCCESS_COMPANY:
      return {
        ...state,
        loading: false,
        markNotificationReadResponse: action.payload,
        error: null,
        success: action.payload.status,
        message: action.payload.message,
      }
    case GET_NOTIFICATIONS_SUCCESS_COMPANY:
      return {
        ...state,
        loading: false,
        getNotificationsResponse: action.payload,
        getNotificationsError: null,
        success: action.payload.status,
        message: action.payload.message,
      }


    case MARK_NOTIFICATION_READ_SUCCESS:
      return {
        ...state,
        loading: false,
        markNotificationReadResponse: action.payload,
        error: null,
        success: action.payload.status,
        message: action.payload.message,
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
    case VERIFY_MPIN_SUCCESS:
      return {
        ...state,
        loading: false,
        verifyMPINResponse: action.payload,
        verifyMPINError: null,
        error: null,
      };
    case VERIFY_MPIN_FAILURE:
      return {
        ...state,
        loading: false,
        verifyMPINError: typeof action.payload === "object" ? action.payload : action.payload,
        verifyMPINResponse: null,
      };
    case SET_MPIN_SUCCESS:
      return {
        ...state,
        loading: false,
        setMPINResponse: action.payload,
        setMPINError: null,
        error: null,
      };
    case SET_MPIN_FAILURE:
      return {
        ...state,
        loading: false,
        setMPINError: typeof action.payload === "object" ? action.payload : action.payload,
        setMPINResponse: null,
      };
    case LOGOUT_SUCCESS:
      return {
        ...state,
        loading: false,
        logoutResponse: action.payload,
        logoutError: null,
        error: null,
      };
    case LOGOUT_FAILURE:
      return {
        ...state,
        loading: false,
        logoutError: typeof action.payload === "object" ? action.payload : action.payload,
        logoutResponse: null,
      };

    case FORGET_MPIN_SUCCESS:
      return {
        loading: false,
        error: null,
        success: action?.payload?.status,
        message: action?.payload?.message,
        forgotMpinResponse: action?.payload,
      };
    case FORGET_MPIN_FAILURE:
      return {
        loading: false,
        ForgetError: typeof action.payload === "object" ? action.payload : action.payload,

        forgotMpinResponse: null,
      };
    case VERIFY_MPIN_OTP_SUCCESS:
      return {
        loading: false,
        error: null,
        success: action?.payload?.status,
        message: action?.payload?.message,
        verifyMpinOTPResponse: action?.payload,
      };
    case VERIFY_MPIN_OTP_FAILURE:
      return {
        loading: false,
        error: typeof action.payload === "object" ? action.payload : action.payload,
        verifyMpinOTPResponse: null,
      };
    default:
      return state;
  }
};

export default loginReducer;
