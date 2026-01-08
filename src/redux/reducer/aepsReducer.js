import { AEPS_RESCEND_OTP_SUCCESS, AEPS_STATUS_CHECK_SUCCESS, AEPS_SUBMIT_OTP_SUCCESS, AEPS_TERMS_CONDITION_OTP_SUCCESS, AEPS_ONBOARDING_BIOMETRIC_VERIFICATION_SUCCESS, AEPS_ONBOARDING_FA_VERIFICATION_SUCCESS, AEPS_CW_HISTORY_SUCCESS, AEPS_CW_HISTORY_FAILURE, AEPS_BANK_LIST_SUCCESS, AEPS_WITHDRAWAL_SUCCESS, AEPS_TRANSACTION_DETAILS_SUCCESS, AEPS_TRANSACTION_DETAILS_FAILURE } from "../actionType/aepsActionType";

const initialState = {
    loading: false,
    error: null,
    aepsOtp: null,
    success: null,
    message: null,
    rescendOtp: null,
    aepsStatus: null,
    submitOtp: null,
    aepsBiometricstatus: null,
    aepsFaStatus: null,
    aepsCwHistory: null,
    aepsCwHistoryError: null,
    bankList: null,
    withdrawal: null,
    transactionDetails: null,
    transactionDetailsError: null
};

const aepsReducer = (state = initialState, action) => {
    switch (action.type) {


        case AEPS_TERMS_CONDITION_OTP_SUCCESS:
            return {
                ...state,
                aepsOtp: action.payload,
                loading: false,
                error: null,
                success: action.payload.status,
                message: action.payload.message,
            };

        case AEPS_STATUS_CHECK_SUCCESS:
            return {
                ...state,
                aepsStatus: action.payload,
                loading: false,
                error: null,
                success: action.payload.status,
                message: action.payload.message,
            }

        case AEPS_RESCEND_OTP_SUCCESS:
            return {
                ...state,
                rescendOtp: action.payload,
                loading: false,
                error: null,
                success: action.payload.status,
                message: action.payload.message,
            }

        case AEPS_SUBMIT_OTP_SUCCESS:
            return {
                ...state,
                submitOtp: action.payload,
                loading: false,
                error: null,
                success: action.payload.status,
                message: action.payload.message,
            }

        case AEPS_ONBOARDING_BIOMETRIC_VERIFICATION_SUCCESS:
            return {
                ...state,
                aepsBiometricstatus: action?.payload,
                loading: false,
                error: null,
                success: action?.payload?.status,
                message: action?.payload?.message,
            }

        case AEPS_ONBOARDING_FA_VERIFICATION_SUCCESS:
            return {
                ...state,
                aepsFaStatus: action?.payload,
                loading: false,
                error: null,
                success: action?.payload?.status,
                message: action?.payload?.message,
            }
        case AEPS_BANK_LIST_SUCCESS:
            return {
                ...state,
                error: null,
                bankList: action?.payload,
                message: action?.payload?.message,
                success: action?.payload?.status
            }
        case AEPS_WITHDRAWAL_SUCCESS:
            return {
                ...state,
                error: null,
                withdrawal: action?.payload,
                message: action?.payload?.message,
                success: action?.payload?.status
            }

        case AEPS_CW_HISTORY_SUCCESS:
            return {
                ...state,
                aepsCwHistory: action?.payload,
                aepsCwHistoryError: null,
                loading: false,
                error: null,
                success: action?.payload?.status,
                message: action?.payload?.message,
            }

        case AEPS_CW_HISTORY_FAILURE:
            return {
                ...state,
                aepsCwHistory: null,
                aepsCwHistoryError: action?.payload,
                loading: false,
                error: action?.payload?.message || action?.payload,
                success: null,
                message: action?.payload?.message || action?.payload,
            }

        case AEPS_TRANSACTION_DETAILS_SUCCESS:
            return {
                ...state,
                transactionDetails: action?.payload,
                transactionDetailsError: null,
                loading: false,
                error: null,
                success: action?.payload?.status,
                message: action?.payload?.message,
            }

        case AEPS_TRANSACTION_DETAILS_FAILURE:
            return {
                ...state,
                transactionDetails: null,
                transactionDetailsError: action?.payload,
                loading: false,
                error: action?.payload?.message || action?.payload,
                success: null,
                message: action?.payload?.message || action?.payload,
            }

        default:
            return state;
    }
};

export default aepsReducer;

