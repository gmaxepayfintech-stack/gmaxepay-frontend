import {
  AEPSTHREE_BALANCE_ENQUIRY_SUCCESS,
  AEPSTHREE_BANKLIST_SUCCESS,
  AEPSTHREE_BIOMETRIC_VERIFICATION_SUCCESS,
  AEPSTHREE_CASH_WITHDRAWL_SUCCESS,
  AEPSTHREE_CW_HISTORY_COMPANY_SUCCESS,
  AEPSTHREE_CW_HISTORY_SUCCESS,
  AEPSTHREE_CW_HISTORY_TRANSACTION_DETAILS_SUCCESS,
  AEPSTHREE_CW_HISTORY_USERS_SUCCESS,
  AEPSTHREE_MINI_STATEMENT_SUCCESS,
  AEPSTHREE_ONBOARDING_SUCCESS,
  AEPSTHREE_RESEND_OTP_SUCCESS,
  AEPSTHREE_RESENT_BANK_LIST_SUCCESS,
  AEPSTHREE_SEND_OTP_SUCCESS,
  AEPSTHREE_STATUS_CHECK_SUCCESS,
  AEPSTHREE_SUBMIT_OTP_SUCCESS,
  AEPSTHREE_TWO_FA_VERIFICATION_SUCCESS,
} from "../actionType/aepsThreeActionType";

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
  biometricVerification: null,
  cashWithdrawl: null,
  balanceEnquiry: null,
  miniStatement: null,
  bankList: null,
  bankRecentList: null,
  aeps2CwHistory: null,
  aeps2CwHistoryCompany: null,
  aeps2CwHistoryUsers: null,
  aeps2CwHistoryTransactionDetails: null,
};

const aepsThreeReducer = (state = initialState, action) => {
  switch (action.type) {
    case AEPSTHREE_STATUS_CHECK_SUCCESS:
      return {
        ...state,
        aepsStatus: action?.payload,
        loading: false,
        error: null,
        success: action?.payload?.status,
        message: action?.payload?.message,
      };

    case AEPSTHREE_ONBOARDING_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        onBoarding: action?.payload,
        success: action?.payload?.status,
        message: action?.payload?.message,
      };

    case AEPSTHREE_SEND_OTP_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        otpStatus: action?.payload,
        success: action?.payload?.status,
        message: action?.payload?.message,
      };
    case AEPSTHREE_RESEND_OTP_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        rescendOtp: action?.payload,
        success: action?.payload?.status,
        message: action?.payload?.message,
      };

    case AEPSTHREE_SUBMIT_OTP_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        submitOtp: action?.payload,
        success: action?.payload?.status,
        message: action?.payload?.message,
      };
    case AEPSTHREE_BIOMETRIC_VERIFICATION_SUCCESS:
      return {
        ...state,
        error: null,
        loading: false,
        biometricVerification: action?.payload,
        success: action?.payload?.status,
        message: action?.payload?.message,
      }

    case AEPSTHREE_TWO_FA_VERIFICATION_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        twoFaVerification: action?.payload,
        success: action?.payload?.status,
        message: action?.payload?.message,
      }
    case AEPSTHREE_CASH_WITHDRAWL_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        cashWithdrawl: action?.payload,
        success: action?.payload?.status,
        message: action?.payload?.message,
      }
    case AEPSTHREE_BALANCE_ENQUIRY_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        balanceEnquiry: action?.payload,
        success: action?.payload?.status,
        message: action?.payload?.message,
      }
    case AEPSTHREE_MINI_STATEMENT_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        miniStatement: action?.payload,
        success: action?.payload?.status,
        message: action?.payload?.message,
      }

    case AEPSTHREE_BANKLIST_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        bankList: action?.payload,
        success: action?.payload?.status,
        message: action?.payload?.message,
      }
    case AEPSTHREE_RESENT_BANK_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        bankRecentList: action?.payload,
        success: action?.payload?.status,
        message: action?.payload?.message,
      }
    case AEPSTHREE_CW_HISTORY_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        aeps2CwHistory: action?.payload,
        success: action?.payload?.status,
        message: action?.payload?.message,
      }
    case AEPSTHREE_CW_HISTORY_COMPANY_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        aeps2CwHistoryCompany: action?.payload,
        success: action?.payload?.status,
        message: action?.payload?.message,
      }
    case AEPSTHREE_CW_HISTORY_USERS_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        aeps2CwHistoryUsers: action?.payload,
        success: action?.payload?.status,
        message: action?.payload?.message,
      }
    case AEPSTHREE_CW_HISTORY_TRANSACTION_DETAILS_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        aeps2CwHistoryTransactionDetails: action?.payload,
        success: action?.payload?.status,
        message: action?.payload?.message,
      }
    default:
      return state;
  }
};

export default aepsThreeReducer;
