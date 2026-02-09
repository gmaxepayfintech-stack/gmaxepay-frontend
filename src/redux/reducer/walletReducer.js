import { WALLET_ALS_SUCCESS, WALLET_ALS_FAILURE, WALLET_BALANCE_SUCCESS, WALLET_BALANCE_FAILURE, COMPANY_WALLET_BALANCE_SUCCESS, COMPANY_WALLET_BALANCE_FAILURE, USER_WALLET_BALANCE_SUCCESS, USER_WALLET_BALANCE_FAILURE, EKYC_HUB_BALANCE_SUCCESS, EKYC_HUB_BALANCE_FAILURE, INSPAY_WALLET_BALANCE_SUCCESS, INSPAY_WALLET_BALANCE_FAILURE, BBPS_WALLET_BALANCE_SUCCESS, BBPS_WALLET_BALANCE_FAILURE } from "../actionType/walletActionType";

const initialState = {
    loading: false,
    error: null,
    alsWallet: null,
    alsWalletError: null,
    walletBalance: null,
    walletBalanceError: null,
    companyWalletBalance: null,
    companyWalletBalanceError: null,
    userWalletBalance: null,
    userWalletBalanceError: null,
    ekycHubBalance: null,
    ekycHubBalanceError: null,
    inspayWalletBalance: null,
    inspayWalletBalanceError: null,
    bbpsWalletBalance: null,
    bbpsWalletBalanceError: null,
    success: null,
    message: null,
};

const walletReducer = (state = initialState, action) => {
    switch (action.type) {
        case WALLET_ALS_SUCCESS:
            return {
                ...state,
                alsWallet: action?.payload,
                alsWalletError: null,
                loading: false,
                error: null,
                success: action?.payload?.status,
                message: action?.payload?.message,
            };

        case WALLET_ALS_FAILURE:
            return {
                ...state,
                alsWallet: null,
                alsWalletError: action?.payload,
                loading: false,
                error: action?.payload?.message || action?.payload,
                success: null,
                message: action?.payload?.message || action?.payload,
            };

        case WALLET_BALANCE_SUCCESS:
            return {
                ...state,
                walletBalance: action?.payload,
                walletBalanceError: null,
                loading: false,
                error: null,
                success: action?.payload?.status,
                message: action?.payload?.message,
            };

        case WALLET_BALANCE_FAILURE:
            return {
                ...state,
                walletBalance: null,
                walletBalanceError: action?.payload,
                loading: false,
                error: action?.payload?.message || action?.payload,
                success: null,
                message: action?.payload?.message || action?.payload,
            };

        case COMPANY_WALLET_BALANCE_SUCCESS:
            return {
                ...state,
                companyWalletBalance: action?.payload,
                companyWalletBalanceError: null,
                loading: false,
                error: null,
                success: action?.payload?.status,
                message: action?.payload?.message,
            };

        case COMPANY_WALLET_BALANCE_FAILURE:
            return {
                ...state,
                companyWalletBalance: null,
                companyWalletBalanceError: action?.payload,
                loading: false,
                error: action?.payload?.message || action?.payload,
                success: null,
                message: action?.payload?.message || action?.payload,
            };

        case USER_WALLET_BALANCE_SUCCESS:
            return {
                ...state,
                userWalletBalance: action?.payload,
                userWalletBalanceError: null,
                loading: false,
                error: null,
                success: action?.payload?.status,
                message: action?.payload?.message,
            };

        case USER_WALLET_BALANCE_FAILURE:
            return {
                ...state,
                userWalletBalance: null,
                userWalletBalanceError: action?.payload,
                loading: false,
                error: action?.payload?.message || action?.payload,
                success: null,
                message: action?.payload?.message || action?.payload,
            };

        case EKYC_HUB_BALANCE_SUCCESS:
            return {
                ...state,
                ekycHubBalance: action?.payload,
                ekycHubBalanceError: null,
                loading: false,
                error: null,
                success: action?.payload?.status,
                message: action?.payload?.message,
            };

        case EKYC_HUB_BALANCE_FAILURE:
            return {
                ...state,
                ekycHubBalance: null,
                ekycHubBalanceError: action?.payload,
                loading: false,
                error: action?.payload?.message || action?.payload,
                success: null,
                message: action?.payload?.message || action?.payload,
            };

        case INSPAY_WALLET_BALANCE_SUCCESS:
            return {
                ...state,
                inspayWalletBalance: action?.payload,
                inspayWalletBalanceError: null,
                loading: false,
                error: null,
                success: action?.payload?.status,
                message: action?.payload?.message,
            };

        case INSPAY_WALLET_BALANCE_FAILURE:
            return {
                ...state,
                inspayWalletBalance: null,
                inspayWalletBalanceError: action?.payload,
                loading: false,
                error: action?.payload?.message || action?.payload,
                success: null,
                message: action?.payload?.message || action?.payload,
            };

        case BBPS_WALLET_BALANCE_SUCCESS:
            return {
                ...state,
                bbpsWalletBalance: action?.payload,
                bbpsWalletBalanceError: null,
                loading: false,
                error: null,
                success: action?.payload?.status,
                message: action?.payload?.message,
            };

        case BBPS_WALLET_BALANCE_FAILURE:
            return {
                ...state,
                bbpsWalletBalance: null,
                bbpsWalletBalanceError: action?.payload,
                loading: false,
                error: action?.payload?.message || action?.payload,
                success: null,
                message: action?.payload?.message || action?.payload,
            };

        default:
            return state;
    }
};

export default walletReducer;
