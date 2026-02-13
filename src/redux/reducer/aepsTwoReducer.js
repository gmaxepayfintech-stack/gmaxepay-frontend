import {
  AEPSTWO_BALANCE_ENQUIRY_SUCCESS,
  AEPSTWO_BANKLIST_SUCCESS,
  AEPSTWO_BIOMETRIC_VERIFICATION_SUCCESS,
  AEPSTWO_CASH_WITHDRAWL_SUCCESS,
  AEPSTWO_CW_HISTORY_SUCCESS,
  AEPSTWO_MINI_STATEMENT_SUCCESS,
  AEPSTWO_ONBOARDING_SUCCESS,
  AEPSTWO_RESEND_OTP_SUCCESS,
  AEPSTWO_RESENT_BANK_LIST_SUCCESS,
  AEPSTWO_SEND_OTP_SUCCESS,
  AEPSTWO_STATUS_CHECK_SUCCESS,
  AEPSTWO_SUBMIT_OTP_SUCCESS,
  AEPSTWO_TWO_FA_VERIFICATION_SUCCESS,
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
  twoFaVerification: null,
  biometricVerification:null,
  cashWithdrawl:null,
  balanceEnquiry:null,
  miniStatement: null,
  bankList:null,
  bankRecentList: null,
  aeps2CwHistory: null,
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

          case AEPSTWO_TWO_FA_VERIFICATION_SUCCESS:
            return{
              ...state,
              loading: false,
              error: null,
              twoFaVerification: action?.payload,
              success: action?.payload?.status,
              message: action?.payload?.message,
            }
          case AEPSTWO_CASH_WITHDRAWL_SUCCESS:
            return{
              ...state,
              loading: false,
              error: null,
              cashWithdrawl: action?.payload,
              success: action?.payload?.status,
              message: action?.payload?.message,
            }
          case AEPSTWO_BALANCE_ENQUIRY_SUCCESS:
            return{
              ...state,
              loading: false,
              error: null,
              balanceEnquiry: action?.payload,
              success: action?.payload?.status,
              message: action?.payload?.message,
            }
          case AEPSTWO_MINI_STATEMENT_SUCCESS:
            return{
              ...state,
              loading: false,
              error: null,
              miniStatement: action?.payload,
              success: action?.payload?.status,
              message: action?.payload?.message,
            }

        case AEPSTWO_BANKLIST_SUCCESS:
          return{
            ...state,
            loading: false,
            error: null,
            bankList: action?.payload,
            success: action?.payload?.status,
            message: action?.payload?.message,
          }
          case AEPSTWO_RESENT_BANK_LIST_SUCCESS:
            return{
              ...state,
              loading: false,
              error: null,
              bankRecentList: action?.payload,
              success: action?.payload?.status,
              message: action?.payload?.message,
            }
            case AEPSTWO_CW_HISTORY_SUCCESS:
            return{
              ...state,
              loading: false,
              error: null,
              aeps2CwHistory: action?.payload,
              success: action?.payload?.status,
              message: action?.payload?.message,
            }
    default:
      return state;
  }
};

export default aepsTwoReducer;
