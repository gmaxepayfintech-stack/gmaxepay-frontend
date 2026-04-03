import { AEPS_RESCEND_OTP_SUCCESS, AEPS_STATUS_CHECK_SUCCESS, AEPS_SUBMIT_OTP_SUCCESS, AEPS_TERMS_CONDITION_OTP_SUCCESS, AEPS_ONBOARDING_BIOMETRIC_VERIFICATION_SUCCESS, AEPS_ONBOARDING_FA_VERIFICATION_SUCCESS, AEPS_CW_HISTORY_SUCCESS, AEPS_CW_HISTORY_FAILURE, AEPS_CW_HISTORY_EMPLOYEE_SUCCESS, AEPS_BANK_LIST_SUCCESS, AEPS_WITHDRAWAL_SUCCESS, AEPS_TRANSACTION_DETAILS_SUCCESS, AEPS_TRANSACTION_DETAILS_FAILURE, AEPS_TRANSACTION_DETAILS_EMPLOYEE_SUCCESS, AEPS_BANK_OTP_SUCCESS, AEPS_BANK_OTP_SUBMIT_SUCCESS, AEPS_BANK_KYC_SUCCESS, AEPS_CW_HISTORY_COMPANY_SUCCESS, AEPS_RESENT_BANK_LIST_SUCCESS, AEPS_CW_HISTORY_USER_SUCCESS, AEPS_TRANSACTION_DETAILS_COMPANY_SUCCESS, AEPS_TRANSACTION_DETAILS_USER_SUCCESS } from "../actionType/aepsActionType";

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
    transactionDetailsError: null,
    bankOtp: null,
    bankSubmit: null,
    bankKyc: null,
    aepsCwHistoryCompany: null,
    resentBankList: null,
    aepsCwHistoryUser: null,
    transactionDetailsCompany: null,
    transactionDetailsCompanyError: null,
    transactionDetailsUser: null,
    transactionDetailsUserError: null,
    aepsCwHistoryEmployee: null,
    aepsCwHistoryEmployeeError: null,
    transactionDetailsEmployee: null,
    transactionDetailsEmployeeError: null,
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

        case AEPS_CW_HISTORY_EMPLOYEE_SUCCESS:
            return {
                ...state,
                aepsCwHistoryEmployee: action?.payload,
                aepsCwHistoryEmployeeError: null,
                loading: false,
                error: null,
                success: action?.payload?.status,
                message: action?.payload?.message,
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
        case AEPS_TRANSACTION_DETAILS_COMPANY_SUCCESS:
            return {
                ...state,
                transactionDetailsCompany: action?.payload,
                transactionDetailsCompanyError: null,
                loading: false,
                error: null,
                success: action?.payload?.status,
                message: action?.payload?.message,
            }
        case AEPS_TRANSACTION_DETAILS_USER_SUCCESS:
            return {
                ...state,
                transactionDetailsUser: action?.payload,
                transactionDetailsUserError: null,
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
        case AEPS_TRANSACTION_DETAILS_EMPLOYEE_SUCCESS:
            return {
                ...state,
                transactionDetailsEmployee: action?.payload,
                transactionDetailsEmployeeError: null,
                loading: false,
                error: null,
                success: action?.payload?.status,
                message: action?.payload?.message,
            }
        case AEPS_BANK_OTP_SUCCESS:
            return {
                ...state,
                bankOtp: action?.payload,
                loading: false,
                error: null,
                success: action?.payload?.status,
                message: action?.payload?.message,
            }
        case AEPS_BANK_OTP_SUBMIT_SUCCESS:
            return {
                ...state,
                bankSubmit: action?.payload,
                loading: false,
                error: null,
                success: action?.payload?.status,
                message: action?.payload?.message,
            }
        case AEPS_BANK_KYC_SUCCESS:
            return {
                ...state,
                bankKyc: action?.payload,
                loading: false,
                error: null,
                success: action?.payload?.status,
                message: action?.payload?.message,
            }
        case AEPS_CW_HISTORY_COMPANY_SUCCESS:
            return {
                ...state,
                aepsCwHistoryCompany: action?.payload,
                error: null,
                loading: false,
                error: null,
                success: action?.payload?.status,
                message: action?.payload?.message,
            }
        case AEPS_RESENT_BANK_LIST_SUCCESS:
            return{
                ...state,
                error: null,
                loading:false,
                success: action?.payload?.status,
                message: action?.payload?.message,
                resentBankList: action?.payload,
            }
            case AEPS_CW_HISTORY_USER_SUCCESS:
                return{
                    ...state,
                    aepsCwHistoryUser: action?.payload,
                    error: null,
                    loading: false,
                    success: action?.payload?.status,
                    message: action?.payload?.message,
                }
        default:
            return state;
    }
};
export default aepsReducer;
