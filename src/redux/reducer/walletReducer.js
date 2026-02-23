import { WALLET_ALS_SUCCESS, WALLET_ALS_FAILURE, WALLET_BALANCE_SUCCESS, WALLET_BALANCE_FAILURE, COMPANY_WALLET_BALANCE_SUCCESS, COMPANY_WALLET_BALANCE_FAILURE, USER_WALLET_BALANCE_SUCCESS, USER_WALLET_BALANCE_FAILURE, EKYC_HUB_BALANCE_SUCCESS, EKYC_HUB_BALANCE_FAILURE, INSPAY_WALLET_BALANCE_SUCCESS, INSPAY_WALLET_BALANCE_FAILURE, BBPS_WALLET_BALANCE_SUCCESS, BBPS_WALLET_BALANCE_FAILURE, DASHBOARD_STATISTICS_SUCCESS, DASHBOARD_STATISTICS_FAILURE, USER_DASHBOARD_STATISTICS_SUCCESS, USER_DASHBOARD_STATISTICS_FAILURE, UPLOAD_FEVICON_SUCCESS, WALLET_HISTORY_COMPANY_SUCCESS, WALLET_HISTORY_ADMIN_SUCCESS, WALLET_HISTORY_USER_SUCCESS, SURCHARGES_HISTORY_SUCCESS, UPDATE_BANK_DETAILS_SUCCESS, GET_COMPANY_SETTING_IMAGES_SUCCESS } from "../actionType/walletActionType";

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
    dashboardStatistics: null,
    dashboardStatisticsError: null,
    userDashboardStatistics: null,
    userDashboardStatisticsError: null,
    success: null,
    message: null,
    uploadFevicon: null,
    uploadFeviconError: null,
    walletHistoryCompany: null,
    walletHistoryCompanyError: null,
    walletHistoryAdmin: null,
    walletHistoryAdminError: null,
    walletHistoryUser: null,
    walletHistoryUserError: null,
    surchargesHistory: null,
    surchargesHistoryError: null,
    bankUpdateResponseUser: null,
    bankUpdateResponseUserError: null,
    companySettingImagesError: null,
    companySettingImages: null,
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

        case DASHBOARD_STATISTICS_SUCCESS:
            return {
                ...state,
                dashboardStatistics: action?.payload,
                dashboardStatisticsError: null,
                loading: false,
                error: null,
                success: action?.payload?.status,
                message: action?.payload?.message,
            };

        case DASHBOARD_STATISTICS_FAILURE:
            return {
                ...state,
                dashboardStatistics: null,
                dashboardStatisticsError: action?.payload,
                loading: false,
                error: action?.payload?.message || action?.payload,
                success: null,
                message: action?.payload?.message || action?.payload,
            };

        case USER_DASHBOARD_STATISTICS_SUCCESS:
            return {
                ...state,
                userDashboardStatistics: action?.payload,
                userDashboardStatisticsError: null,
                loading: false,
                error: null,
                success: action?.payload?.status,
                message: action?.payload?.message,
            };

        case USER_DASHBOARD_STATISTICS_FAILURE:
            return {
                ...state,
                userDashboardStatistics: null,
                userDashboardStatisticsError: action?.payload,
                loading: false,
                error: action?.payload?.message || action?.payload,
                success: null,
                message: action?.payload?.message || action?.payload,
            };
        case UPLOAD_FEVICON_SUCCESS:
            return {
                ...state,
                uploadFevicon: action?.payload,
                uploadFeviconError: null,
                loading: false,
                error: null,
                success: action?.payload?.status,
                message: action?.payload?.message,
            }
        case WALLET_HISTORY_COMPANY_SUCCESS:
            return {
                ...state,
                walletHistoryCompany: action?.payload,
                walletHistoryCompanyError: null,
                loading: false,
                error: null,
                success: action?.payload?.status,
                message: action?.payload?.message,
            }
        case WALLET_HISTORY_ADMIN_SUCCESS:
            return {
                ...state,
                walletHistoryAdmin: action?.payload,
                walletHistoryAdminError: null,
                loading: false,
                error: null,
                success: action?.payload?.status,
                message: action?.payload?.message,
            }
        case WALLET_HISTORY_USER_SUCCESS:
            return {
                ...state,
                walletHistoryUser: action?.payload,
                walletHistoryUserError: null,
                loading: false,
                error: null,
                success: action?.payload?.status,
                message: action?.payload?.message,
            }
        case SURCHARGES_HISTORY_SUCCESS:
            return {
                ...state,
                surchargesHistory: action?.payload,
                surchargesHistoryError: null,
                loading: false,
                error: null,
                success: action?.payload?.status,
                message: action?.payload?.message,
            }

        case UPDATE_BANK_DETAILS_SUCCESS:
            return {
                ...state,
                bankUpdateResponseUser: action?.payload,
                updateBankDetailsError: null,
                loading: false,
                error: null,
                success: action?.payload?.status,
                message: action?.payload?.message,
            }
            case GET_COMPANY_SETTING_IMAGES_SUCCESS:
                return{
                    ...state,
                    companySettingImages: action?.payload,
                    companySettingImagesError: null,
                    loading: false,
                    error: null,
                    success: action?.payload?.status,
                    message: action?.payload?.message,
                }

        default:
            return state;
    }
};

export default walletReducer;
