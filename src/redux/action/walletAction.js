import axios from "axios";
import secureLocalStorage from "react-secure-storage";
import { API_ROUTE } from "../../data/env";
import { clearAllStorage, isTokenExpiredError } from "../../utils/clearStorage";

import { LOADING_START, LOADING_END } from "../actionType/loadingActionType";
import { WALLET_ALS_SUCCESS, WALLET_ALS_FAILURE, WALLET_BALANCE_SUCCESS, WALLET_BALANCE_FAILURE, COMPANY_WALLET_BALANCE_SUCCESS, COMPANY_WALLET_BALANCE_FAILURE, USER_WALLET_BALANCE_SUCCESS, USER_WALLET_BALANCE_FAILURE } from "../actionType/walletActionType";

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
        const token = typeof authToken === 'string' ? authToken : String(authToken || '');

        const response = await axios.post(
            `${API_ROUTE}/api/v1/admin/wallet/balance`,
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
        const token = typeof authToken === 'string' ? authToken : String(authToken || '');

        const response = await axios.post(
            `${API_ROUTE}/api/v1/user/wallet/balance`,
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








