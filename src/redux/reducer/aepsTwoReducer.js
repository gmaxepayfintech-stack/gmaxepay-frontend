import {
  AEPSTWO_BIOMETRIC_VERIFICATION_SUCCESS,
  AEPSTWO_ONBOARDING_SUCCESS,
  AEPSTWO_RESEND_OTP_SUCCESS,
  AEPSTWO_SEND_OTP_SUCCESS,
  AEPSTWO_STATUS_CHECK_SUCCESS,
  AEPSTWO_SUBMIT_OTP_SUCCESS,
} from "../actionType/aepsTwoActionType";

const initialState = {
  loading: false,
  error: null,
  success: null,
  message: null,
  aepsStatus: null,
  onBoarding: null,
  rescendOtp: null,
  submitOtp: null,
  biometricVerification:null,
};

const aepsTwoReducer = (state = initialState, action) => {
  switch (action.type) {
    case AEPSTWO_STATUS_CHECK_SUCCESS:
      return {
        ...state,
        aepsStatus: action?.payload,
        loading: false,
        error: null,
        success: action?.payload?.status,
        message: action?.payload?.message,
      };

    case AEPSTWO_ONBOARDING_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        onBoarding: action?.payload,
        success: action?.payload?.status,
        message: action?.payload?.message,
      };

    case AEPSTWO_SEND_OTP_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        otpStatus: action?.payload,
        success: action?.payload?.status,
        message: action?.payload?.message,
      };
      case AEPSTWO_RESEND_OTP_SUCCESS:
        return{
            ...state,
            loading: false,
            error: null,
            rescendOtp: action?.payload,
            success: action?.payload?.status,
            message: action?.payload?.message,
        };

        case AEPSTWO_SUBMIT_OTP_SUCCESS:
            return{
                ...state,
                loading: false,
                error: null,
                submitOtp: action?.payload,
                success: action?.payload?.status,
                message: action?.payload?.message,
            };
        case AEPSTWO_BIOMETRIC_VERIFICATION_SUCCESS:
          return{
            ...state,
            error:null,
            loading:false,
            biometricVerification: action?.payload,
            success: action?.payload?.status,
            message: action?.payload?.message,
          }
    default:
      return state;
  }
};

export default aepsTwoReducer;
