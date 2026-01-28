import {
  DEACTIVATE_ONBOARDING_LINK_FAILURE,
  FETCH_KYC_DETAILS_FAILURE,
  GET_CITY_BY_PINCODE_FAILURE,
  GET_IP_CHECK_FAILURE,
  GET_PANDATA_FETCH_FAILURE,
  GET_PINCODE_BY_CITY_FAILURE,
  RESEND_ONBOARDING_LINK_FAILURE,
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
import { RETAILER_ONBOARDING_REFERAL_CODE_FAILURE, RETAILER_ONBOARDING_SEND__OTP_FAILURE, RETAILER_OTP_SUBMIT_FAILURE, RETAILER_RESEND_EMAIL_OTP_FAILURE, RETAILER_SEND_EMAIL_OTP_FAILURE, RETAILER_SUBMIT_EMAIL_FAILURE, RETAILER_POST_SHOP_DETAILS_FAILURE, RETAILER_AADHAAR_CONNECTION_FAILURE, RETAILER_DOWNLOAD_AADHAAR_FAILURE, RETAILER_UPLOAD_AADHAAR_FAILURE, RETAILER_PAN_CONNECTION_FAILURE, RETAILER_DOWNLOAD_PAN_FAILURE, RETAILER_UPLOAD_PAN_FAILURE, RETAILER_POST_BANK_DETAILS_FAILURE } from "../actionType/retailerOnboardingActionType";
import { AEPS_BANK_KYC_FAILURE, AEPS_BANK_LIST_FAILURE, AEPS_BANK_OTP_FAILURE, AEPS_BANK_OTP_SUBMIT_FAILURE, AEPS_ONBOARDING_BIOMETRIC_VERIFICATION_FAILURE, AEPS_ONBOARDING_FA_VERIFICATION_FAILURE, AEPS_RESCEND_OTP_FAILURE, AEPS_STATUS_CHECK_FAILURE, AEPS_SUBMIT_OTP_FAILURE, AEPS_TERMS_CONDITION_OTP_FAILURE } from "../actionType/aepsActionType";
import { PAYOUT_BANK_LIST_FAILURE, PAYOUT_TRANSACTION_FAILURE } from "../actionType/payOutType";
import { AEPSTWO_BALANCE_ENQUIRY_FAILURE, AEPSTWO_BANKLIST_FAILURE, AEPSTWO_BIOMETRIC_VERIFICATION_FAILURE, AEPSTWO_CASH_WITHDRAWL_FAILURE, AEPSTWO_MINI_STATEMENT_FAILURE, AEPSTWO_ONBOARDING_FAILURE, AEPSTWO_RESEND_OTP_FAILURE, AEPSTWO_SEND_OTP_FAILURE, AEPSTWO_STATUS_CHECK_FAILURE, AEPSTWO_SUBMIT_OTP_FAILURE, AEPSTWO_TWO_FA_VERIFICATION_FAILURE } from "../actionType/aepsTwoActionType";
import { FIND_MOBILE_OPERATOR_FAILURE, FIND_MOBILE_RECHARGE_PLAN_FAILURE, PAY_RECHARGE_FAILURE } from "../actionType/rechargeActionType";
import { PAN_SERVICE_REQUEST_FAILURE, RETAILER_FUND_GET_ALL_BANKS_FAILURE, RETAILER_FUND_LOAD_FAILURE } from "../actionType/fundActionType";

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
    case RETAILER_POST_SHOP_DETAILS_FAILURE:
    case RETAILER_AADHAAR_CONNECTION_FAILURE:
    case RETAILER_DOWNLOAD_AADHAAR_FAILURE:
    case RETAILER_UPLOAD_AADHAAR_FAILURE:
    case RETAILER_PAN_CONNECTION_FAILURE:
    case RETAILER_DOWNLOAD_PAN_FAILURE:
    case RETAILER_UPLOAD_PAN_FAILURE:
    case RETAILER_POST_BANK_DETAILS_FAILURE:
    case RESEND_ONBOARDING_LINK_FAILURE:
    case DEACTIVATE_ONBOARDING_LINK_FAILURE:
    case AEPSTWO_CASH_WITHDRAWL_FAILURE:
    case AEPSTWO_BALANCE_ENQUIRY_FAILURE:
    case AEPSTWO_MINI_STATEMENT_FAILURE:
    case FIND_MOBILE_OPERATOR_FAILURE:
    case FIND_MOBILE_RECHARGE_PLAN_FAILURE:
    case FETCH_KYC_DETAILS_FAILURE:
    case AEPSTWO_BANKLIST_FAILURE:
    case RETAILER_FUND_GET_ALL_BANKS_FAILURE:
    case RETAILER_FUND_LOAD_FAILURE:
    case PAN_SERVICE_REQUEST_FAILURE:

      console.log("actionssssssssssssss", action?.payload);

      return {
        ...state,
        loading: false,
        error: action?.payload,
        status: action?.payload?.status,
        message: action?.payload?.message,
        onBoarding: action?.payload,
      };
    case AEPS_STATUS_CHECK_FAILURE:
    case AEPS_TERMS_CONDITION_OTP_FAILURE:
    case SMS_VERIFY_OTP_FAILURE:
    case AEPS_BANK_LIST_FAILURE:
    case AEPS_ONBOARDING_FA_VERIFICATION_FAILURE:
    case EMAIL_OTP_SENT_FAILURE:
    case AEPS_ONBOARDING_BIOMETRIC_VERIFICATION_FAILURE:
    case MOBILE_OTP_SENT_FAILURE:
    case AEPS_RESCEND_OTP_FAILURE:
    case AEPS_SUBMIT_OTP_FAILURE:
    case PAYOUT_BANK_LIST_FAILURE:
    case PAYOUT_TRANSACTION_FAILURE:
    case AEPSTWO_STATUS_CHECK_FAILURE:
    case AEPSTWO_ONBOARDING_FAILURE:
    case AEPSTWO_BIOMETRIC_VERIFICATION_FAILURE:
    case AEPSTWO_SUBMIT_OTP_FAILURE:
    case AEPSTWO_SEND_OTP_FAILURE:
    case AEPSTWO_RESEND_OTP_FAILURE:
    case AEPSTWO_TWO_FA_VERIFICATION_FAILURE:
    case AEPS_BANK_OTP_FAILURE:
    case AEPS_BANK_OTP_SUBMIT_FAILURE:
    case AEPS_BANK_KYC_FAILURE:
    case PAY_RECHARGE_FAILURE:
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
