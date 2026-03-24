import {
  COMPANY_PAYOUT_BANK_LIST_SUCCESS,
  COMPANY_PAYOUT_TRANSACTION_SUCCESS,
  PAYOUT_BANK_LIST_SUCCESS,
  PAYOUT_TRANSACTION_SUCCESS,
  PAYOUT_HISTORY_SUCCESS,
  PAYOUT_HISTORY_FAILURE,
  PAYOUT_HISTORY_USER_FAILURE,
  PAYOUT_HISTORY_USER_SUCCESS,
  PAYOUT_HISTORY_COMPANY_FAILURE,
  PAYOUT_HISTORY_COMPANY_SUCCESS,
  PAYOUT_SETTING_LIST_SUCCESS,
  PAYOUT_SETTING_LIST_FAILURE,
  PAYOUT_SETTING_CREATE_SUCCESS,
  PAYOUT_SETTING_CREATE_FAILURE,
  PAYOUT_SETTING_SWITCH_SUCCESS,
  PAYOUT_SETTING_SWITCH_FAILURE,
} from "../actionType/payOutType";
const initialState = {
  loading: false,
  error: null,
  payoutBankList: null,
  message: null,
  success: null,
  payoutTransaction: null,
  payoutBankList: null,
  payoutCompanyBankList: null,
  payoutCompanyTransaction: null,
  payoutHistory: null,
  payoutSettingList: null,
};

const payoutReducer = (state = initialState, action) => {
  switch (action.type) {
    case PAYOUT_BANK_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        error: action?.payload?.message || action?.payload,
        success: action?.payload?.status,
        payoutBankList: action?.payload,
        message: action?.payload?.message || action?.payload,
      };
    case PAYOUT_TRANSACTION_SUCCESS:
      return {
        ...state,
        error: action?.payload?.error,
        payoutTransaction: action?.payload,
        status: action?.payload?.status,
        message: action?.payload?.message,
      };
    case COMPANY_PAYOUT_BANK_LIST_SUCCESS:
      return {
        ...state,
        error: action?.payload?.error,
        payoutCompanyBankList: action?.payload,
        status: action?.payload?.status,
        message: action?.payload?.message,
      };
    case COMPANY_PAYOUT_TRANSACTION_SUCCESS:
      return {
        ...state,
        error: action?.payload?.error,
        payoutCompanyTransaction: action?.payload,
        status: action?.payload?.status,
        message: action?.payload?.message,
      };
    // ✅ ADMIN PAYOUT HISTORY
    case PAYOUT_HISTORY_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        payoutHistory: action?.payload,
        status: action?.payload?.status,
        message: action?.payload?.message,
      };
    
    case PAYOUT_HISTORY_FAILURE:
      return {
        ...state,
        loading: false,
        error: action?.payload?.message,
        payoutHistory: null,
        status: action?.payload?.status,
        message: action?.payload?.message,
      };
    
    // ✅ COMPANY PAYOUT HISTORY
    case PAYOUT_HISTORY_COMPANY_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        payoutHistoryCompany: action?.payload,
        status: action?.payload?.status,
        message: action?.payload?.message,
      };
    
    case PAYOUT_HISTORY_COMPANY_FAILURE:
      return {
        ...state,
        loading: false,
        error: action?.payload?.message,
        payoutHistoryCompany: null,
        status: action?.payload?.status,
        message: action?.payload?.message,
      };
    
    // ✅ USER PAYOUT HISTORY
    case PAYOUT_HISTORY_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        payoutHistoryUser: action?.payload,
        status: action?.payload?.status,
        message: action?.payload?.message,
      };
    
    case PAYOUT_HISTORY_USER_FAILURE:
      return {
        ...state,
        loading: false,
        error: action?.payload?.message,
        payoutHistoryUser: null,
        status: action?.payload?.status,
        message: action?.payload?.message,
      };
    // ✅ PAYOUT SETTING LIST
    case PAYOUT_SETTING_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        payoutSettingList: action?.payload,
      };
    case PAYOUT_SETTING_LIST_FAILURE:
      return {
        ...state,
        loading: false,
        error: action?.payload?.message,
        payoutSettingList: null,
      };

    // ✅ PAYOUT SETTING CREATE
    case PAYOUT_SETTING_CREATE_SUCCESS:
      return { ...state, loading: false, error: null, message: action?.payload?.message };
    case PAYOUT_SETTING_CREATE_FAILURE:
      return { ...state, loading: false, error: action?.payload };

    // ✅ PAYOUT SWITCH STATUS
    case PAYOUT_SETTING_SWITCH_SUCCESS:
      return { ...state, loading: false, error: null, message: action?.payload?.message };
    case PAYOUT_SETTING_SWITCH_FAILURE:
      return { ...state, loading: false, error: action?.payload };

    default:
      return state;
  }
};

export default payoutReducer;
