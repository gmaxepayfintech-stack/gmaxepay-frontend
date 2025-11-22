import {
  GET_CITY_BY_PINCODE_FAILURE,
  GET_IP_CHECK_FAILURE,
  GET_PANDATA_FETCH_FAILURE,
  GET_PINCODE_BY_CITY_FAILURE,
  WHITELABEL_CREATE_FAILURE,
} from "../actionType/whiteLabelAction";
import {
  MOBILE_OTP_SENT_FAILURE,
  SMS_VERIFY_OTP_FAILURE,
  SMS_RESEND_OTP_FAILURE,
  EMAIL_OTP_SENT_FAILURE,
  EMAIL_VERIFY_OTP_FAILURE,
  EMAIL_RESCEND_OTP_FAILURE,
  AADHAAR_CONNECTION_FAILURE,
  DOWNLOAD_AADHAAR_FAILURE,
} from "../actionType/onboardingActionType";
import { RETAILER_ONBOARDING_REFERAL_CODE_FAILURE, RETAILER_ONBOARDING_SEND__OTP_FAILURE, RETAILER_OTP_SUBMIT_FAILURE, RETAILER_RESEND_EMAIL_OTP_FAILURE, RETAILER_SEND_EMAIL_OTP_FAILURE, RETAILER_SUBMIT_EMAIL_FAILURE } from "../actionType/retailerOnboardingActionType";

const initialState = {
  loading: false,
  error: null,
  message: null,
  onBoarding: null,
};

const errorReducer = (state = initialState, action) => {
  switch (action.type) {
    case WHITELABEL_CREATE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action?.payload,
        message: action?.payload,
      };
    case GET_IP_CHECK_FAILURE:
      return {
        ...state,
        loading: false,
        error: action?.payload,
        message: action?.payload,
      };

    case GET_CITY_BY_PINCODE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action?.payload,
        message: action?.payload,
      };

    case GET_PINCODE_BY_CITY_FAILURE:
    case SMS_RESEND_OTP_FAILURE:

      return {
        ...state,
        loading: false,
        error: action?.payload,
        status: action?.payload,
        message: action?.payload,
      };
    case RETAILER_ONBOARDING_SEND__OTP_FAILURE:
    case RETAILER_ONBOARDING_REFERAL_CODE_FAILURE:
    case RETAILER_RESEND_EMAIL_OTP_FAILURE:
    case RETAILER_OTP_SUBMIT_FAILURE:
    case RETAILER_SUBMIT_EMAIL_FAILURE:
    case RETAILER_RESEND_EMAIL_OTP_FAILURE:
    case RETAILER_SUBMIT_EMAIL_FAILURE:
    case RETAILER_SEND_EMAIL_OTP_FAILURE:
      console.log("actionssssssssssssss", action?.payload);

      return {
        ...state,
        loading: false,
        error: action?.payload,
        status: action?.payload?.status,
        message: action?.payload?.message,
        onBoarding: action?.payload,
      };

    case SMS_VERIFY_OTP_FAILURE:
      return {
        ...state,
        loading: false,
        error: action?.payload,
        status: action?.payload?.status,
        message: action?.payload?.message,
      };
    case EMAIL_OTP_SENT_FAILURE:
    case MOBILE_OTP_SENT_FAILURE:
      return {
        ...state,
        loading: false,
        error: action?.payload,
        status: action?.payload?.status,
        message: action?.payload?.message,
      };

    case EMAIL_VERIFY_OTP_FAILURE:
    case EMAIL_RESCEND_OTP_FAILURE:
    case AADHAAR_CONNECTION_FAILURE:
    case DOWNLOAD_AADHAAR_FAILURE:
      return {
        ...state,
        loading: false,
        error: action?.payload,
        status: action?.payload?.status,
        message: action?.payload?.message,
      };

    case GET_PANDATA_FETCH_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload?.errorData?.data,
        message: action?.payload?.data,
      };

    default:
      return state;
  }
};

export default errorReducer;
