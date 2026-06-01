import axios from "axios";
import secureLocalStorage from "react-secure-storage";
import { API_ROUTE } from "../../data/env";
import { clearAllStorage, isTokenExpiredError } from "../../utils/clearStorage";

import { LOADING_START, LOADING_END } from "../actionType/loadingActionType";
import { WALLET_ALS_SUCCESS, WALLET_ALS_FAILURE, WALLET_BALANCE_SUCCESS, WALLET_BALANCE_FAILURE, COMPANY_WALLET_BALANCE_SUCCESS, COMPANY_WALLET_BALANCE_FAILURE, USER_WALLET_BALANCE_SUCCESS, USER_WALLET_BALANCE_FAILURE, EKYC_HUB_BALANCE_SUCCESS, EKYC_HUB_BALANCE_FAILURE, INSPAY_WALLET_BALANCE_SUCCESS, INSPAY_WALLET_BALANCE_FAILURE, BBPS_WALLET_BALANCE_SUCCESS, BBPS_WALLET_BALANCE_FAILURE, DASHBOARD_STATISTICS_SUCCESS, DASHBOARD_STATISTICS_FAILURE, USER_DASHBOARD_STATISTICS_SUCCESS, USER_DASHBOARD_STATISTICS_FAILURE, UPLOAD_FEVICON_SUCCESS, UPLOAD_FEVICON_FAILURE, WALLET_HISTORY_COMPANY_SUCCESS, WALLET_HISTORY_COMPANY_FAILURE, WALLET_HISTORY_ADMIN_SUCCESS, WALLET_HISTORY_ADMIN_FAILURE, WALLET_HISTORY_USER_SUCCESS, WALLET_HISTORY_USER_FAILURE, SURCHARGES_HISTORY_SUCCESS, SURCHARGES_HISTORY_FAILURE, SURCHARGES_EMPLOYEE_HISTORY_SUCCESS, SURCHARGES_EMPLOYEE_HISTORY_FAILURE, GET_COMPANY_SETTING_IMAGES_SUCCESS, GET_COMPANY_SETTING_IMAGES_FAILURE, DELETE_COMPANY_SETTING_SLIDER_SUCCESS, DELETE_COMPANY_SETTING_SLIDER_FAILURE, ADMIN_GST_HISTORY_SUCCESS, ADMIN_GST_HISTORY_FAILURE, EMPLOYEE_GST_HISTORY_SUCCESS, EMPLOYEE_GST_HISTORY_FAILURE, BBPS_HISTORY_SUCCESS, BBPS_HISTORY_FAILURE, BBPS_EMPLOYEE_HISTORY_SUCCESS, BBPS_EMPLOYEE_HISTORY_FAILURE, BBPS_COMPANY_HISTORY_SUCCESS, BBPS_COMPANY_HISTORY_FAILURE, BBPS_USER_HISTORY_SUCCESS, BBPS_USER_HISTORY_FAILURE, A1_TOPUP_WALLET_SUCCESS, A1_TOPUP_WALLET_FAILURE, PAYNIDI_WALLET_BALANCE_SUCCESS, PAYNIDI_WALLET_BALANCE_FAILURE, WALLET_HISTORY_EMPLOYEE_SUCCESS, WALLET_HISTORY_EMPLOYEE_FAILURE, EMPLOYEE_WALLET_ALS_SUCCESS, EMPLOYEE_WALLET_ALS_FAILURE, EMPLOYEE_WALLET_BALANCE_SUCCESS, EMPLOYEE_WALLET_BALANCE_FAILURE, EMPLOYEE_COMPANY_WALLET_BALANCE_SUCCESS, EMPLOYEE_COMPANY_WALLET_BALANCE_FAILURE, EMPLOYEE_USER_WALLET_BALANCE_SUCCESS, EMPLOYEE_USER_WALLET_BALANCE_FAILURE, EMPLOYEE_EKYC_HUB_BALANCE_SUCCESS, EMPLOYEE_EKYC_HUB_BALANCE_FAILURE, EMPLOYEE_INSPAY_WALLET_BALANCE_SUCCESS, EMPLOYEE_INSPAY_WALLET_BALANCE_FAILURE, EMPLOYEE_BBPS_WALLET_BALANCE_SUCCESS, EMPLOYEE_BBPS_WALLET_BALANCE_FAILURE, EMPLOYEE_A1_TOPUP_WALLET_SUCCESS, EMPLOYEE_A1_TOPUP_WALLET_FAILURE, EMPLOYEE_PAYNIDI_WALLET_BALANCE_SUCCESS, EMPLOYEE_PAYNIDI_WALLET_BALANCE_FAILURE, EMPLOYEE_DASHBOARD_STATISTICS_SUCCESS, EMPLOYEE_DASHBOARD_STATISTICS_FAILURE } from "../actionType/walletActionType";

const commonError = "Something went wrong!";

export const getAlsWallet = () => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");

        const response = await axios.post(
            `${API_ROUTE}/api/v1/admin/wallet/alsWallet`,
            {},
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const { data, status, message } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: WALLET_ALS_SUCCESS,
                payload: { data, status, message },
            });
            return { data, status, message };
        } else {
            dispatch({
                type: WALLET_ALS_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
            return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
        }
    } catch (error) {
        // Check if token expired
        if (isTokenExpiredError(error)) {
            clearAllStorage();
        }

        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: WALLET_ALS_FAILURE,
            payload: {
                status: "FAILURE",
                message: errorMessage,
            },
        });
        return {
            status: "FAILURE",
            message: errorMessage,
        };
    } finally {
        dispatch({ type: LOADING_END });
    }
};

export const getWalletBalance = () => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");

        const response = await axios.post(
            `${API_ROUTE}/api/v1/admin/wallet/balance`,
            {},
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const { data, status, message } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: WALLET_BALANCE_SUCCESS,
                payload: { data, status, message },
            });
            return { data, status, message };
        } else {
            dispatch({
                type: WALLET_BALANCE_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
            return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
        }
    } catch (error) {
        // Check if token expired
        if (isTokenExpiredError(error)) {
            clearAllStorage();
        }

        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: WALLET_BALANCE_FAILURE,
            payload: {
                status: "FAILURE",
                message: errorMessage,
            },
        });
        return {
            status: "FAILURE",
            message: errorMessage,
        };
    } finally {
        dispatch({ type: LOADING_END });
    }
};

export const getCompanyWalletBalance = () => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");
        const token = typeof authToken === 'string' ? authToken : String(authToken || '');

        const response = await axios.post(
            `${API_ROUTE}/api/v1/company/wallet/balance`,
            {},
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const { data, status, message } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: COMPANY_WALLET_BALANCE_SUCCESS,
                payload: { data, status, message },
            });
            return { data, status, message };
        } else {
            dispatch({
                type: COMPANY_WALLET_BALANCE_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
            return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
        }
    } catch (error) {
        // Check if token expired
        if (isTokenExpiredError(error)) {
            clearAllStorage();
        }

        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: COMPANY_WALLET_BALANCE_FAILURE,
            payload: {
                status: "FAILURE",
                message: errorMessage,
            },
        });
        return {
            status: "FAILURE",
            message: errorMessage,
        };
    } finally {
        dispatch({ type: LOADING_END });
    }
};

export const getUserWalletBalance = () => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");
        const response = await axios.post(
            `${API_ROUTE}/api/v1/user/wallet/balance`,
            {},
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const { data, status, message } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: USER_WALLET_BALANCE_SUCCESS,
                payload: { data, status, message },
            });
            return { data, status, message };
        } else {
            dispatch({
                type: USER_WALLET_BALANCE_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
            return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
        }
    } catch (error) {
        // Check if token expired
        if (isTokenExpiredError(error)) {
            clearAllStorage();
        }

        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: USER_WALLET_BALANCE_FAILURE,
            payload: {
                status: "FAILURE",
                message: errorMessage,
            },
        });
        return {
            status: "FAILURE",
            message: errorMessage,
        };
    } finally {
        dispatch({ type: LOADING_END });
    }
};

export const getEkycHubBalance = () => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");

        const response = await axios.post(
            `${API_ROUTE}/api/v1/admin/ekyc-hub/balance`,
            {},
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const { data, status, message } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: EKYC_HUB_BALANCE_SUCCESS,
                payload: { data, status, message },
            });
            return { data, status, message };
        } else {
            dispatch({
                type: EKYC_HUB_BALANCE_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
            return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
        }
    } catch (error) {
        // Check if token expired
        if (isTokenExpiredError(error)) {
            clearAllStorage();
        }

        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: EKYC_HUB_BALANCE_FAILURE,
            payload: {
                status: "FAILURE",
                message: errorMessage,
            },
        });
        return {
            status: "FAILURE",
            message: errorMessage,
        };
    } finally {
        dispatch({ type: LOADING_END });
    }
};

export const getInspayWalletBalance = () => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");

        const response = await axios.post(
            `${API_ROUTE}/api/v1/admin/wallet/inspayWallet`,
            {},
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const { data, status, message } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: INSPAY_WALLET_BALANCE_SUCCESS,
                payload: { data, status, message },
            });
            return { data, status, message };
        } else {
            dispatch({
                type: INSPAY_WALLET_BALANCE_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
            return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
        }
    } catch (error) {
        // Check if token expired
        if (isTokenExpiredError(error)) {
            clearAllStorage();
        }

        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: INSPAY_WALLET_BALANCE_FAILURE,
            payload: {
                status: "FAILURE",
                message: errorMessage,
            },
        });
        return {
            status: "FAILURE",
            message: errorMessage,
        };
    } finally {
        dispatch({ type: LOADING_END });
    }
};

export const getBbpsWalletBalance = () => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");

        const response = await axios.post(
            `${API_ROUTE}/api/v1/admin/wallet/bbpsWallet`,
            {},
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const { data, status, message } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: BBPS_WALLET_BALANCE_SUCCESS,
                payload: { data, status, message },
            });
            return { data, status, message };
        } else {
            dispatch({
                type: BBPS_WALLET_BALANCE_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
            return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
        }
    } catch (error) {
        // Check if token expired
        if (isTokenExpiredError(error)) {
            clearAllStorage();
        }

        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: BBPS_WALLET_BALANCE_FAILURE,
            payload: {
                status: "FAILURE",
                message: errorMessage,
            },
        });
        return {
            status: "FAILURE",
            message: errorMessage,
        };
    } finally {
        dispatch({ type: LOADING_END });
    }
};

export const getA1TopupWallet = () => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");

        const response = await axios.post(
            `${API_ROUTE}/api/v1/admin/wallet/a1TopupWallet`,
            {},
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const { data, status, message } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: A1_TOPUP_WALLET_SUCCESS,
                payload: { data, status, message },
            });
            return { data, status, message };
        } else {
            dispatch({
                type: A1_TOPUP_WALLET_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
            return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
        }
    } catch (error) {
        // Check if token expired
        if (isTokenExpiredError(error)) {
            clearAllStorage();
        }

        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: A1_TOPUP_WALLET_FAILURE,
            payload: {
                status: "FAILURE",
                message: errorMessage,
            },
        });
        return {
            status: "FAILURE",
            message: errorMessage,
        };
    } finally {
        dispatch({ type: LOADING_END });
    }
};

export const getPaynidiWalletBalance = () => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");

        const response = await axios.post(
            `${API_ROUTE}/api/v1/admin/wallet/paynidiWallet`,
            {},
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const { data, status, message } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: PAYNIDI_WALLET_BALANCE_SUCCESS,
                payload: { data, status, message },
            });
            return { data, status, message };
        } else {
            dispatch({
                type: PAYNIDI_WALLET_BALANCE_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
            return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
        }
    } catch (error) {
        // Check if token expired
        if (isTokenExpiredError(error)) {
            clearAllStorage();
        }

        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: PAYNIDI_WALLET_BALANCE_FAILURE,
            payload: {
                status: "FAILURE",
                message: errorMessage,
            },
        });
        return {
            status: "FAILURE",
            message: errorMessage,
        };
    } finally {
        dispatch({ type: LOADING_END });
    }
};

// Admin dashboard statistics (used on SuperAdmin dashboard)
export const getDashboardStatistics = (payload) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");

        const response = await axios.post(
            `${API_ROUTE}/api/v1/admin/dashboard/statistics`,
            payload,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const { data, status, message } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: DASHBOARD_STATISTICS_SUCCESS,
                payload: { data, status, message },
            });
            return { data, status, message };
        } else {
            dispatch({
                type: DASHBOARD_STATISTICS_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
            return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
        }
    } catch (error) {
        if (isTokenExpiredError(error)) {
            clearAllStorage();
        }

        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: DASHBOARD_STATISTICS_FAILURE,
            payload: {
                status: "FAILURE",
                message: errorMessage,
            },
        });
        return {
            status: "FAILURE",
            message: errorMessage,
        };
    } finally {
        dispatch({ type: LOADING_END });
    }
};

export const getCompanyDashboardStatistics = (payload) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");
        const response = await axios.post(
            `${API_ROUTE}/api/v1/company/dashboard/statistics`,
            payload,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const { data, status, message } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: DASHBOARD_STATISTICS_SUCCESS,
                payload: { data, status, message },
            });
            return { data, status, message };
        } else {
            dispatch({
                type: DASHBOARD_STATISTICS_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
            return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
        }
    } catch (error) {
        if (isTokenExpiredError(error)) {
            clearAllStorage();
        }

        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: DASHBOARD_STATISTICS_FAILURE,
            payload: {
                status: "FAILURE",
                message: errorMessage,
            },
        });
        return {
            status: "FAILURE",
            message: errorMessage,
        };
    } finally {
        dispatch({ type: LOADING_END });
    }
};

// User dashboard statistics (used on Retailer/Distributor dashboard)
export const getUserDashboardStatistics = (payload) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");
        const response = await axios.post(
            `${API_ROUTE}/api/v1/user/dashboard/statistics`,
            payload,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const { data, status, message } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: USER_DASHBOARD_STATISTICS_SUCCESS,
                payload: { data, status, message },
            });
            return { data, status, message };
        } else {
            dispatch({
                type: USER_DASHBOARD_STATISTICS_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
            return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
        }
    } catch (error) {
        if (isTokenExpiredError(error)) {
            clearAllStorage();
        }

        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: USER_DASHBOARD_STATISTICS_FAILURE,
            payload: {
                status: "FAILURE",
                message: errorMessage,
            },
        });
        return {
            status: "FAILURE",
            message: errorMessage,
        };
    } finally {
        dispatch({ type: LOADING_END });
    }
};


export const uploadFeviicon = (payload) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");
        const response = await axios.post(
            `${API_ROUTE}/api/v1/company/images/upload`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const { data, status, message } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: UPLOAD_FEVICON_SUCCESS,
                payload: { data, status, message },
            });
            return { data, status, message };
        } else {
            dispatch({
                type: UPLOAD_FEVICON_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
            return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
        }
    } catch (error) {
        if (isTokenExpiredError(error)) {
            clearAllStorage();
        }

        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: UPLOAD_FEVICON_FAILURE,
            payload: {
                status: "FAILURE",
                message: errorMessage,
            },
        });
        return {
            status: "FAILURE",
            message: errorMessage,
        };
    } finally {
        dispatch({ type: LOADING_END });
    }
};

export const walletHistoryCompany = (payload) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");
        const response = await axios.post(
            `${API_ROUTE}/api/v1/company/wallet/walletHistory`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const { data, status, message, total, count, paginator } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: WALLET_HISTORY_COMPANY_SUCCESS,
                payload: { data, status, message, total, count, paginator },
            });
            return { data, status, message, total, count, paginator };
        } else {
            dispatch({
                type: WALLET_HISTORY_COMPANY_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
            return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
        }
    } catch (error) {
        if (isTokenExpiredError(error)) {
            clearAllStorage();
        }

        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: WALLET_HISTORY_COMPANY_FAILURE,
            payload: {
                status: "FAILURE",
                message: errorMessage,
            },
        });
        return {
            status: "FAILURE",
            message: errorMessage,
        };
    } finally {
        dispatch({ type: LOADING_END });
    }
};

export const walletHistoryAdmin = (payload) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");
        const response = await axios.post(
            `${API_ROUTE}/api/v1/admin/wallet/walletHistory`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const { data, status, message, total, count, paginator } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: WALLET_HISTORY_ADMIN_SUCCESS,
                payload: { data, status, message, total, count, paginator },
            });
            return { data, status, message, total, count, paginator };
        } else {
            dispatch({
                type: WALLET_HISTORY_ADMIN_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
            return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
        }
    } catch (error) {
        if (isTokenExpiredError(error)) {
            clearAllStorage();
        }

        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: WALLET_HISTORY_ADMIN_FAILURE,
            payload: {
                status: "FAILURE",
                message: errorMessage,
            },
        });
        return {
            status: "FAILURE",
            message: errorMessage,
        };
    } finally {
        dispatch({ type: LOADING_END });
    }
};

export const walletHistoryEmployee = (payload) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");
        const response = await axios.post(
            `${API_ROUTE}/api/v1/employee/wallet/walletHistory`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const { data, status, message, total, count, paginator } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: WALLET_HISTORY_EMPLOYEE_SUCCESS,
                payload: { data, status, message, total, count, paginator },
            });
            return { data, status, message, total, count, paginator };
        } else {
            dispatch({
                type: WALLET_HISTORY_EMPLOYEE_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
            return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
        }
    } catch (error) {
        if (isTokenExpiredError(error)) {
            clearAllStorage();
        }

        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: WALLET_HISTORY_EMPLOYEE_FAILURE,
            payload: {
                status: "FAILURE",
                message: errorMessage,
            },
        });
        return {
            status: "FAILURE",
            message: errorMessage,
        };
    } finally {
        dispatch({ type: LOADING_END });
    }
};

export const walletHistoryUsers = (payload) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");
        const response = await axios.post(
            `${API_ROUTE}/api/v1/user/wallet/walletHistory`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const { data, status, message, total, count, paginator } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: WALLET_HISTORY_USER_SUCCESS,
                payload: { data, status, message, total, count, paginator },
            });
            return { data, status, message, total, count, paginator };
        } else {
            dispatch({
                type: WALLET_HISTORY_USER_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
            return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
        }
    } catch (error) {
        if (isTokenExpiredError(error)) {
            clearAllStorage();
        }

        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: WALLET_HISTORY_USER_FAILURE,
            payload: {
                status: "FAILURE",
                message: errorMessage,
            },
        });
        return {
            status: "FAILURE",
            message: errorMessage,
        };
    } finally {
        dispatch({ type: LOADING_END });
    }
};

export const surChargesHistory = (payload) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");
        const response = await axios.post(
            `${API_ROUTE}/api/v1/admin/reports/surRecReports`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const { data, status, message, total, count, paginator } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: SURCHARGES_HISTORY_SUCCESS,
                payload: { data, status, message, total, count, paginator },
            });
            return { data, status, message, total, count, paginator };
        } else {
            dispatch({
                type: SURCHARGES_HISTORY_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
            return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
        }
    } catch (error) {
        if (isTokenExpiredError(error)) {
            clearAllStorage();
        }

        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: SURCHARGES_HISTORY_FAILURE,
            payload: {
                status: "FAILURE",
                message: errorMessage,
            },
        });
        return {
            status: "FAILURE",
            message: errorMessage,
        };
    } finally {
        dispatch({ type: LOADING_END });
    }
};

export const getCompanySettingImages = (payload) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");
        const response = await axios.post(
            `${API_ROUTE}/api/v1/company/companyDetails/images`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const { data, status, message } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: GET_COMPANY_SETTING_IMAGES_SUCCESS,
                payload: { data, status, message },
            });
            return { data, status, message };
        } else {
            dispatch({
                type: GET_COMPANY_SETTING_IMAGES_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
            return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
        }
    } catch (error) {
        if (isTokenExpiredError(error)) {
            clearAllStorage();
        }

        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: GET_COMPANY_SETTING_IMAGES_FAILURE,
            payload: {
                status: "FAILURE",
                message: errorMessage,
            },
        });
        return {
            status: "FAILURE",
            message: errorMessage,
        };
    } finally {
        dispatch({ type: LOADING_END });
    }
};

export const deleteCompanySettingSlider = (id) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");
        const response = await axios.post(
            `${API_ROUTE}/api/v1/company/companyDetails/delete/${id}`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const { data, status, message } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: DELETE_COMPANY_SETTING_SLIDER_SUCCESS,
                payload: { data, status, message },
            });
            return { data, status, message };
        } else {
            dispatch({
                type: DELETE_COMPANY_SETTING_SLIDER_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
            return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
        }
    } catch (error) {
        if (isTokenExpiredError(error)) {
            clearAllStorage();
        }

        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: DELETE_COMPANY_SETTING_SLIDER_FAILURE,
            payload: {
                status: "FAILURE",
                message: errorMessage,
            },
        });
        return {
            status: "FAILURE",
            message: errorMessage,
        };
    } finally {
        dispatch({ type: LOADING_END });
    }
};

export const adminGstHistory = (payload) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");
        const response = await axios.post(
            `${API_ROUTE}/api/v1/admin/reports/gstReports`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const { data, status, message, total, count, paginator } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: ADMIN_GST_HISTORY_SUCCESS,
                payload: { data, status, message, total, count, paginator },
            });
            return { data, status, message, total, count, paginator };
        } else {
            dispatch({
                type: ADMIN_GST_HISTORY_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
            return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
        }
    } catch (error) {
        if (isTokenExpiredError(error)) {
            clearAllStorage();
        }

        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: ADMIN_GST_HISTORY_FAILURE,
            payload: {
                status: "FAILURE",
                message: errorMessage,
            },
        });
        return {
            status: "FAILURE",
            message: errorMessage,
        };
    } finally {
        dispatch({ type: LOADING_END });
    }
};

export const bbpsHistory = (payload) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");
        const response = await axios.post(
            `${API_ROUTE}/api/v1/admin/reports/bbpReports`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const { data, status, message } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: BBPS_HISTORY_SUCCESS,
                payload: { data, status, message },
            });
            return { data, status, message };
        } else {
            dispatch({
                type: BBPS_HISTORY_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
            return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
        }
    } catch (error) {
        if (isTokenExpiredError(error)) {
            clearAllStorage();
        }

        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: BBPS_HISTORY_FAILURE,
            payload: {
                status: "FAILURE",
                message: errorMessage,
            },
        });
        return {
            status: "FAILURE",
            message: errorMessage,
        };
    } finally {
        dispatch({ type: LOADING_END });
    }
};

export const bbpsCompanyHistory = (payload) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");
        const response = await axios.post(
            `${API_ROUTE}/api/v1/company/reports/bbpReports`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const { data, status, message } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: BBPS_COMPANY_HISTORY_SUCCESS,
                payload: { data, status, message },
            });
            return { data, status, message };
        } else {
            dispatch({
                type: BBPS_COMPANY_HISTORY_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
            return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
        }
    } catch (error) {
        if (isTokenExpiredError(error)) {
            clearAllStorage();
        }

        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: BBPS_COMPANY_HISTORY_FAILURE,
            payload: {
                status: "FAILURE",
                message: errorMessage,
            },
        });
        return {
            status: "FAILURE",
            message: errorMessage,
        };
    } finally {
        dispatch({ type: LOADING_END });
    }
};

export const bbpsUsersHistory = (payload) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");
        const response = await axios.post(
            `${API_ROUTE}/api/v1/user/bbps/report-history`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const { data, status, message } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: BBPS_USER_HISTORY_SUCCESS,
                payload: { data, status, message },
            });
            return { data, status, message };
        } else {
            dispatch({
                type: BBPS_USER_HISTORY_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
            return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
        }
    } catch (error) {
        if (isTokenExpiredError(error)) {
            clearAllStorage();
        }

        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: BBPS_USER_HISTORY_FAILURE,
            payload: {
                status: "FAILURE",
                message: errorMessage,
            },
        });
        return {
            status: "FAILURE",
            message: errorMessage,
        };
    } finally {
        dispatch({ type: LOADING_END });
    }
};

export const surChargesHistoryEmployee = (payload) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");
        const response = await axios.post(
            `${API_ROUTE}/api/v1/employee/reports/surRecReports`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const { data, status, message, total, count, paginator } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: SURCHARGES_EMPLOYEE_HISTORY_SUCCESS,
                payload: { data, status, message, total, count, paginator },
            });
            return { data, status, message, total, count, paginator };
        } else {
            dispatch({
                type: SURCHARGES_EMPLOYEE_HISTORY_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
            return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
        }
    } catch (error) {
        if (isTokenExpiredError(error)) {
            clearAllStorage();
        }

        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: SURCHARGES_EMPLOYEE_HISTORY_FAILURE,
            payload: {
                status: "FAILURE",
                message: errorMessage,
            },
        });
        return {
            status: "FAILURE",
            message: errorMessage,
        };
    } finally {
        dispatch({ type: LOADING_END });
    }
};

export const employeeGstHistory = (payload) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");
        const response = await axios.post(
            `${API_ROUTE}/api/v1/employee/reports/gstReports`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const { data, status, message, total, count, paginator } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: EMPLOYEE_GST_HISTORY_SUCCESS,
                payload: { data, status, message, total, count, paginator },
            });
            return { data, status, message, total, count, paginator };
        } else {
            dispatch({
                type: EMPLOYEE_GST_HISTORY_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
            return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
        }
    } catch (error) {
        if (isTokenExpiredError(error)) {
            clearAllStorage();
        }

        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: EMPLOYEE_GST_HISTORY_FAILURE,
            payload: {
                status: "FAILURE",
                message: errorMessage,
            },
        });
        return {
            status: "FAILURE",
            message: errorMessage,
        };
    } finally {
        dispatch({ type: LOADING_END });
    }
};

export const bbpsHistoryEmployee = (payload) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");
        const response = await axios.post(
            `${API_ROUTE}/api/v1/employee/reports/bbpReports`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const { data, status, message } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: BBPS_EMPLOYEE_HISTORY_SUCCESS,
                payload: { data, status, message },
            });
            return { data, status, message };
        } else {
            dispatch({
                type: BBPS_EMPLOYEE_HISTORY_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
            return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
        }
    } catch (error) {
        if (isTokenExpiredError(error)) {
            clearAllStorage();
        }

        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: BBPS_EMPLOYEE_HISTORY_FAILURE,
            payload: {
                status: "FAILURE",
                message: errorMessage,
            },
        });
        return {
            status: "FAILURE",
            message: errorMessage,
        };
    } finally {
        dispatch({ type: LOADING_END });
    }
};


export const getEmployeeAlsWallet = () => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");

        const response = await axios.post(
            `${API_ROUTE}/api/v1/employee/wallet/alsWallet`,
            {},
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const { data, status, message } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: EMPLOYEE_WALLET_ALS_SUCCESS,
                payload: { data, status, message },
            });
            return { data, status, message };
        } else {
            dispatch({
                type: EMPLOYEE_WALLET_ALS_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
            return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
        }
    } catch (error) {
        // Check if token expired
        if (isTokenExpiredError(error)) {
            clearAllStorage();
        }

        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: EMPLOYEE_WALLET_ALS_FAILURE,
            payload: {
                status: "FAILURE",
                message: errorMessage,
            },
        });
        return {
            status: "FAILURE",
            message: errorMessage,
        };
    } finally {
        dispatch({ type: LOADING_END });
    }
};

export const getEmployeeWalletBalance = () => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");

        const response = await axios.post(
            `${API_ROUTE}/api/v1/employee/wallet/balance`,
            {},
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const { data, status, message } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: EMPLOYEE_WALLET_BALANCE_SUCCESS,
                payload: { data, status, message },
            });
            return { data, status, message };
        } else {
            dispatch({
                type: EMPLOYEE_WALLET_BALANCE_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
            return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
        }
    } catch (error) {
        // Check if token expired
        if (isTokenExpiredError(error)) {
            clearAllStorage();
        }

        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: EMPLOYEE_WALLET_BALANCE_FAILURE,
            payload: {
                status: "FAILURE",
                message: errorMessage,
            },
        });
        return {
            status: "FAILURE",
            message: errorMessage,
        };
    } finally {
        dispatch({ type: LOADING_END });
    }
};

export const getEmployeeCompanyWalletBalance = () => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");
        const token = typeof authToken === 'string' ? authToken : String(authToken || '');

        const response = await axios.post(
            `${API_ROUTE}/api/v1/employee/wallet/balance`,
            {},
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const { data, status, message } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: EMPLOYEE_COMPANY_WALLET_BALANCE_SUCCESS,
                payload: { data, status, message },
            });
            return { data, status, message };
        } else {
            dispatch({
                type: EMPLOYEE_COMPANY_WALLET_BALANCE_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
            return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
        }
    } catch (error) {
        // Check if token expired
        if (isTokenExpiredError(error)) {
            clearAllStorage();
        }

        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: EMPLOYEE_COMPANY_WALLET_BALANCE_FAILURE,
            payload: {
                status: "FAILURE",
                message: errorMessage,
            },
        });
        return {
            status: "FAILURE",
            message: errorMessage,
        };
    } finally {
        dispatch({ type: LOADING_END });
    }
};

export const getEmployeeUserWalletBalance = () => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");
        const response = await axios.post(
            `${API_ROUTE}/api/v1/employee/wallet/balance`,
            {},
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const { data, status, message } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: EMPLOYEE_USER_WALLET_BALANCE_SUCCESS,
                payload: { data, status, message },
            });
            return { data, status, message };
        } else {
            dispatch({
                type: EMPLOYEE_USER_WALLET_BALANCE_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
            return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
        }
    } catch (error) {
        // Check if token expired
        if (isTokenExpiredError(error)) {
            clearAllStorage();
        }

        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: EMPLOYEE_USER_WALLET_BALANCE_FAILURE,
            payload: {
                status: "FAILURE",
                message: errorMessage,
            },
        });
        return {
            status: "FAILURE",
            message: errorMessage,
        };
    } finally {
        dispatch({ type: LOADING_END });
    }
};

export const getEmployeeEkycHubBalance = () => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");

        const response = await axios.post(
            `${API_ROUTE}/api/v1/employee/ekyc-hub/balance`,
            {},
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const { data, status, message } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: EMPLOYEE_EKYC_HUB_BALANCE_SUCCESS,
                payload: { data, status, message },
            });
            return { data, status, message };
        } else {
            dispatch({
                type: EMPLOYEE_EKYC_HUB_BALANCE_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
            return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
        }
    } catch (error) {
        // Check if token expired
        if (isTokenExpiredError(error)) {
            clearAllStorage();
        }

        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: EMPLOYEE_EKYC_HUB_BALANCE_FAILURE,
            payload: {
                status: "FAILURE",
                message: errorMessage,
            },
        });
        return {
            status: "FAILURE",
            message: errorMessage,
        };
    } finally {
        dispatch({ type: LOADING_END });
    }
};

export const getEmployeeInspayWalletBalance = () => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");

        const response = await axios.post(
            `${API_ROUTE}/api/v1/employee/wallet/inspayWallet`,
            {},
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const { data, status, message } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: EMPLOYEE_INSPAY_WALLET_BALANCE_SUCCESS,
                payload: { data, status, message },
            });
            return { data, status, message };
        } else {
            dispatch({
                type: EMPLOYEE_INSPAY_WALLET_BALANCE_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
            return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
        }
    } catch (error) {
        // Check if token expired
        if (isTokenExpiredError(error)) {
            clearAllStorage();
        }

        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: EMPLOYEE_INSPAY_WALLET_BALANCE_FAILURE,
            payload: {
                status: "FAILURE",
                message: errorMessage,
            },
        });
        return {
            status: "FAILURE",
            message: errorMessage,
        };
    } finally {
        dispatch({ type: LOADING_END });
    }
};

export const getEmployeeBbpsWalletBalance = () => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");

        const response = await axios.post(
            `${API_ROUTE}/api/v1/employee/wallet/bbpsWallet`,
            {},
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const { data, status, message } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: EMPLOYEE_BBPS_WALLET_BALANCE_SUCCESS,
                payload: { data, status, message },
            });
            return { data, status, message };
        } else {
            dispatch({
                type: EMPLOYEE_BBPS_WALLET_BALANCE_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
            return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
        }
    } catch (error) {
        // Check if token expired
        if (isTokenExpiredError(error)) {
            clearAllStorage();
        }

        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: EMPLOYEE_BBPS_WALLET_BALANCE_FAILURE,
            payload: {
                status: "FAILURE",
                message: errorMessage,
            },
        });
        return {
            status: "FAILURE",
            message: errorMessage,
        };
    } finally {
        dispatch({ type: LOADING_END });
    }
};

export const getEmployeeA1TopupWallet = () => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");

        const response = await axios.post(
            `${API_ROUTE}/api/v1/employee/wallet/a1TopupWallet`,
            {},
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const { data, status, message } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: EMPLOYEE_A1_TOPUP_WALLET_SUCCESS,
                payload: { data, status, message },
            });
            return { data, status, message };
        } else {
            dispatch({
                type: EMPLOYEE_A1_TOPUP_WALLET_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
            return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
        }
    } catch (error) {
        // Check if token expired
        if (isTokenExpiredError(error)) {
            clearAllStorage();
        }

        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: EMPLOYEE_A1_TOPUP_WALLET_FAILURE,
            payload: {
                status: "FAILURE",
                message: errorMessage,
            },
        });
        return {
            status: "FAILURE",
            message: errorMessage,
        };
    } finally {
        dispatch({ type: LOADING_END });
    }
};

export const getEmployeePaynidiWalletBalance = () => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");

        const response = await axios.post(
            `${API_ROUTE}/api/v1/employee/wallet/paynidiWallet`,
            {},
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const { data, status, message } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: EMPLOYEE_PAYNIDI_WALLET_BALANCE_SUCCESS,
                payload: { data, status, message },
            });
            return { data, status, message };
        } else {
            dispatch({
                type: EMPLOYEE_PAYNIDI_WALLET_BALANCE_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
            return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
        }
    } catch (error) {
        // Check if token expired
        if (isTokenExpiredError(error)) {
            clearAllStorage();
        }

        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: EMPLOYEE_PAYNIDI_WALLET_BALANCE_FAILURE,
            payload: {
                status: "FAILURE",
                message: errorMessage,
            },
        });
        return {
            status: "FAILURE",
            message: errorMessage,
        };
    } finally {
        dispatch({ type: LOADING_END });
    }
};

export const getEmployeeDashboardStatistics = (payload) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");

        const response = await axios.post(
            `${API_ROUTE}/api/v1/employee/dashboard/statistics`,
            payload,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const { data, status, message } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: EMPLOYEE_DASHBOARD_STATISTICS_SUCCESS,
                payload: { data, status, message },
            });
            return { data, status, message };
        } else {
            dispatch({
                type: EMPLOYEE_DASHBOARD_STATISTICS_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
            return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
        }
    } catch (error) {
        // Check if token expired
        if (isTokenExpiredError(error)) {
            clearAllStorage();
        }

        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: EMPLOYEE_DASHBOARD_STATISTICS_FAILURE,
            payload: {
                status: "FAILURE",
                message: errorMessage,
            },
        });
        return {
            status: "FAILURE",
            message: errorMessage,
        };
    } finally {
        dispatch({ type: LOADING_END });
    }
};