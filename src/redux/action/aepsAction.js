import axios from "axios";
import secureLocalStorage from "react-secure-storage";
import { API_ROUTE } from "../../data/env";

import { LOADING_START, LOADING_END } from "../actionType/loadingActionType";
import { AEPS_RESCEND_OTP_FAILURE, AEPS_RESCEND_OTP_SUCCESS, AEPS_STATUS_CHECK_FAILURE, AEPS_STATUS_CHECK_SUCCESS, AEPS_SUBMIT_OTP_FAILURE, AEPS_SUBMIT_OTP_SUCCESS, AEPS_TERMS_CONDITION_OTP_FAILURE, AEPS_TERMS_CONDITION_OTP_SUCCESS, AEPS_ONBOARDING_BIOMETRIC_VERIFICATION_SUCCESS, AEPS_ONBOARDING_BIOMETRIC_VERIFICATION_FAILURE, AEPS_ONBOARDING_FA_VERIFICATION_SUCCESS, AEPS_ONBOARDING_FA_VERIFICATION_FAILURE, AEPS_CW_HISTORY_SUCCESS, AEPS_CW_HISTORY_FAILURE, AEPS_BANK_LIST_SUCCESS, AEPS_BANK_LIST_FAILURE, AEPS_WITHDRAWAL_SUCCESS, AEPS_WITHDRAWAL_FAILURE, AEPS_TRANSACTION_DETAILS_SUCCESS, AEPS_TRANSACTION_DETAILS_FAILURE, AEPS_BANK_OTP_SUCCESS, AEPS_BANK_OTP_FAILURE, AEPS_BANK_OTP_SUBMIT_SUCCESS, AEPS_BANK_KYC_SUCCESS, AEPS_BANK_KYC_FAILURE, AEPS_CW_HISTORY_COMPANY_SUCCESS, AEPS_CW_HISTORY_COMPANY_FAILURE, AEPS_RESENT_BANK_LIST_SUCCESS, AEPS_RESENT_BANK_LIST_FAILURE } from "../actionType/aepsActionType";

const commonError = "Something went wrong!";

export const aepsTermsConditionOtp = () => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");

        const response = await axios.post(
            `${API_ROUTE}/api/v1/useraeps1/onboarding`,
            {},
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const { data: aepsOtp, status, message } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: AEPS_TERMS_CONDITION_OTP_SUCCESS,
                payload: { aepsOtp, status, message },
            });
            return { aepsOtp, status, message };
        } else {
            dispatch({
                type: AEPS_TERMS_CONDITION_OTP_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
            return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
        }
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: AEPS_TERMS_CONDITION_OTP_FAILURE,
            payload: errorMessage,
        });
        throw error;
    } finally {
        dispatch({ type: LOADING_END });
    }
};

export const aepsStatusCheck = () => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");
        const apiUrl = `${API_ROUTE}/api/v1/user/aeps1/onboarding-status`;

        const response = await axios.post(
            apiUrl,
            {},
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );


        const { data: aepsStatus, status, message } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: AEPS_STATUS_CHECK_SUCCESS,
                payload: { aepsStatus, status, message },
            });
            return { aepsStatus, status, message };
        } else {
            dispatch({
                type: AEPS_STATUS_CHECK_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
            return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
        }
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: AEPS_STATUS_CHECK_FAILURE,
            payload: errorMessage,
        });
        throw error;
    } finally {
        dispatch({ type: LOADING_END });
    }
};

export const aepsRescendOTP = () => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");

        const response = await axios.post(
            `${API_ROUTE}/api/v1/user/aeps1/resend-otp`,
            {},
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const { data: rescendOtp, status, message } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: AEPS_RESCEND_OTP_SUCCESS,
                payload: { rescendOtp, status, message },
            });
            return { rescendOtp, status, message };
        } else {
            dispatch({
                type: AEPS_RESCEND_OTP_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
            return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
        }
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: AEPS_RESCEND_OTP_FAILURE,
            payload: errorMessage,
        });
        throw error;
    } finally {
        dispatch({ type: LOADING_END });
    }
};

export const aepsSubmitOTP = (values) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");

        const response = await axios.post(
            `${API_ROUTE}/api/v1/user/aeps1/validate-otp`,
            values, // Send values directly, not wrapped in {values}
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const { data: submitOtp, status, message } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: AEPS_SUBMIT_OTP_SUCCESS,
                payload: { submitOtp, status, message },
            });
            return { submitOtp, status, message };
        } else {
            dispatch({
                type: AEPS_SUBMIT_OTP_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
            return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
        }
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: AEPS_SUBMIT_OTP_FAILURE,
            payload: errorMessage,
        });
        throw error;
    } finally {
        dispatch({ type: LOADING_END });
    }
};

export const aepsOnboardingBiometricVerification = (data) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");

        const response = await axios.post(
            `${API_ROUTE}/api/v1/useraeps1/bio-metric-verification`,
            data,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const { data: aepsBiometricstatus, status, message } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: AEPS_ONBOARDING_BIOMETRIC_VERIFICATION_SUCCESS,
                payload: { aepsBiometricstatus, status, message },
            });
            return { aepsBiometricstatus, status, message };
        } else {
            dispatch({
                type: AEPS_ONBOARDING_BIOMETRIC_VERIFICATION_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
            return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
        }
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: AEPS_ONBOARDING_BIOMETRIC_VERIFICATION_FAILURE,
            payload: {
                status: "FAILURE",
                message: errorMessage,
            },
        });
        throw error;
    } finally {
        dispatch({ type: LOADING_END });
    }
};

export const aepsOnboardingFAVerification = (data) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");

        const response = await axios.post(
            `${API_ROUTE}/api/v1/useraeps1/2fa-authentication`,
            data,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const { data: aepsFaStatus, status, message } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: AEPS_ONBOARDING_FA_VERIFICATION_SUCCESS,
                payload: { aepsFaStatus, status, message },
            });
            return { aepsFaStatus, status, message };
        } else {
            dispatch({
                type: AEPS_ONBOARDING_FA_VERIFICATION_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
            return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
        }
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: AEPS_ONBOARDING_FA_VERIFICATION_FAILURE,
            payload: {
                status: "FAILURE",
                message: errorMessage,
            },
        });
        throw error;
    } finally {
        dispatch({ type: LOADING_END });
    }
};

export const getAepsCwHistory = (payload) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");

        const requestPayload = {
            query: {
                aepsTxnType: "CW",
                ...(payload?.query || {}),
            },
            customSearch: payload?.customSearch || {},
            options: {
                page: payload?.options?.page || 1,
                paginate: payload?.options?.paginate || 10,
                sort: payload?.options?.sort || { createdAt: -1 },
            },
        };

        const response = await axios.post(
            `${API_ROUTE}/api/v1/admin/reports/aeps1Reports`,
            requestPayload,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const { data: aepsCwHistory, status, message, total, count, paginator } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: AEPS_CW_HISTORY_SUCCESS,
                payload: { data: aepsCwHistory, status, message, total, count, paginator },
            });
            return { data: aepsCwHistory, status, message, total, count, paginator };
        } else {
            dispatch({
                type: AEPS_CW_HISTORY_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
            return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
        }
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: AEPS_CW_HISTORY_FAILURE,
            payload: {
                status: "FAILURE",
                message: errorMessage,
            },
        });
        throw error;
    } finally {
        dispatch({ type: LOADING_END });
    }
};

export const aepsBankList = (data) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");

        const response = await axios.post(
            `${API_ROUTE}/api/v1/useraeps1/get-all-banks`,
            data,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        // API response structure: { message, data: [...], total, paginator }
        const responseData = response?.data ?? {};
        const bankList = responseData?.data ?? [];
        const message = responseData?.message ?? "All bank details retrieved successfully";
        const total = responseData?.total ?? 0;
        const paginator = responseData?.paginator ?? null;

        // If data array exists, treat as success
        if (Array.isArray(bankList) && bankList.length >= 0) {
            const payload = {
                bankList,
                status: "SUCCESS",
                message,
                total,
                paginator,
            };
            dispatch({
                type: AEPS_BANK_LIST_SUCCESS,
                payload,
            });
            return payload;
        } else {
            dispatch({
                type: AEPS_BANK_LIST_FAILURE,
                payload: {
                    status: "FAILURE",
                    message: message || commonError,
                },
            });
            return { status: "FAILURE", message: message || commonError };
        }
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: AEPS_BANK_LIST_FAILURE,
            payload: {
                status: "FAILURE",
                message: errorMessage,
            },
        });
        throw error;
    } finally {
        dispatch({ type: LOADING_END });
    }
};

export const aepsWithdrawl = (data) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    console.log("🔵 aepsWithdrawl action called with data:", {
        ...data,
        biometricData: data?.biometricData?.substring(0, 100) + "... (truncated)"
    });
    try {
        const authToken = secureLocalStorage.getItem("userToken");
        console.log("🔑 Auth token exists:", !!authToken);

        const apiUrl = `${API_ROUTE}/api/v1/useraeps1/transaction`;
        console.log("🌐 Making API call to:", apiUrl);
        console.log("📦 Request payload:", {
            ...data,
            biometricData: data?.biometricData?.substring(0, 200) + "... (truncated)"
        });
        
        const response = await axios.post(
            apiUrl,
            data,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );
        
        console.log("📥 API response received:", {
            status: response?.status,
            statusText: response?.statusText,
            data: response?.data
        });

        const { data: withdrawal, status, message } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: AEPS_WITHDRAWAL_SUCCESS,
                payload: { withdrawal, status, message },
            });
            return { withdrawal, status, message };
        } else {
            const failureData = response?.data?.data || null;
            dispatch({
                type: AEPS_WITHDRAWAL_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                    data: failureData,
                },
            });
            return { 
                status: response?.data?.status ?? "FAILURE", 
                message: response?.data?.message ?? commonError,
                data: failureData,
                withdrawal: failureData, // Also include as withdrawal for consistency
            };
        }
    } catch (error) {
        console.error("❌ aepsWithdrawl API error:", error);
        console.error("❌ Error details:", {
            message: error?.message,
            response: error?.response,
            responseData: error?.response?.data,
            status: error?.response?.status,
            statusText: error?.response?.statusText,
            request: error?.request,
        });
        
        const errorMessage = error.response ? error.response.data.message : error.message;
        console.error("❌ Error message to dispatch:", errorMessage);
        
        dispatch({
            type: AEPS_WITHDRAWAL_FAILURE,
            payload: {
                status: "FAILURE",
                message: errorMessage,
            },
        });
        
        // Return error response instead of throwing to allow component to handle it
        // Try to extract data from error response if available
        const errorData = error?.response?.data?.data || null;
        return {
            status: "FAILURE",
            message: errorMessage,
            data: errorData,
            withdrawal: errorData, // Also include as withdrawal for consistency
        };
    } finally {
        dispatch({ type: LOADING_END });
    }
};

export const getAepsTransactionDetails = (transactionId) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");

        const response = await axios.post(
            `${API_ROUTE}/api/v1/admin/reports/aeps1/transactionDetails/${transactionId}`,
            {},
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const { data: transactionDetails, status, message } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: AEPS_TRANSACTION_DETAILS_SUCCESS,
                payload: { data: transactionDetails, status, message },
            });
            return { data: transactionDetails, status, message };
        } else {
            dispatch({
                type: AEPS_TRANSACTION_DETAILS_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
            return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
        }
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: AEPS_TRANSACTION_DETAILS_FAILURE,
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

export const aepsBankOtp = (payload = {}) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");

        const response = await axios.post(
            `${API_ROUTE}/api/v1/useraeps1/bank-kyc-send-otp`,
            payload,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const { data: bankOtp, status, message } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: AEPS_BANK_OTP_SUCCESS,
                payload: { data: bankOtp, status, message },
            });
            return { data: bankOtp, status, message };
        } else {
            dispatch({
                type: AEPS_BANK_OTP_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
            return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
        }
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: AEPS_BANK_OTP_FAILURE,
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

export const aepsSubmitBankOtp = (data) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");

        const response = await axios.post(
            `${API_ROUTE}/api/v1/useraeps1/bank-kyc-validate-otp`,
            data || {},
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const { data: bankSubmit, status, message } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: AEPS_BANK_OTP_SUBMIT_SUCCESS,
                payload: { data: bankSubmit, status, message },
            });
            return { data: bankSubmit, status, message };
        } else {
            dispatch({
                type: AEPS_BANK_OTP_SUBMIT_SUCCESS,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
            return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
        }
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: AEPS_BANK_OTP_SUBMIT_SUCCESS,
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

export const aepsSubmitBiomatric = (data) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");

        const response = await axios.post(
            `${API_ROUTE}/api/v1/useraeps1/bank-kyc-biometric-validate`,
            data || {},
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const { data: bankKyc, status, message } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: AEPS_BANK_KYC_SUCCESS,
                payload: { data: bankKyc, status, message },
            });
            return { data: bankKyc, status, message };
        } else {
            dispatch({
                type: AEPS_BANK_KYC_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
            return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
        }
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: AEPS_BANK_KYC_FAILURE,
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

export const getAepsCwHistoryCompany = (payload) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");

        const requestPayload = {
            query: {
                aepsTxnType: "CW",
                ...(payload?.query || {}),
            },
            customSearch: payload?.customSearch || {},
            options: {
                page: payload?.options?.page || 1,
                paginate: payload?.options?.paginate || 10,
                sort: payload?.options?.sort || { createdAt: -1 },
            },
        };

        const response = await axios.post(
            `${API_ROUTE}/api/v1/company/reports/aeps1Reports`,
            requestPayload,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const { data: aepsCwHistoryCompany, status, message, total, count, paginator } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: AEPS_CW_HISTORY_COMPANY_SUCCESS,
                payload: { data: aepsCwHistoryCompany, status, message, total, count, paginator },
            });
            return { data: aepsCwHistoryCompany, status, message, total, count, paginator };
        } else {
            dispatch({
                type: AEPS_CW_HISTORY_COMPANY_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
            return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
        }
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: AEPS_CW_HISTORY_COMPANY_FAILURE,
            payload: {
                status: "FAILURE",
                message: errorMessage,
            },
        });
        throw error;
    } finally {
        dispatch({ type: LOADING_END });
    }
};

export const aepsResentBankList = (data) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");

        const response = await axios.post(
            `${API_ROUTE}/api/v1/user/aeps1/recent-banks`,
            data,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const responseData = response?.data ?? {};
        const resentBankList = responseData?.data ?? [];
        const message = responseData?.message ?? "All bank details retrieved successfully";
        const total = responseData?.total ?? 0;
        const paginator = responseData?.paginator ?? null;

        // If data array exists, treat as success
        if (Array.isArray(resentBankList) && bankList.length >= 0) {
            const payload = {
                resentBankList,
                status: "SUCCESS",
                message,
                total,
                paginator,
            };
            dispatch({
                type: AEPS_RESENT_BANK_LIST_SUCCESS,
                payload,
            });
            return payload;
        } else {
            dispatch({
                type: AEPS_RESENT_BANK_LIST_FAILURE,
                payload: {
                    status: "FAILURE",
                    message: message || commonError,
                },
            });
            return { status: "FAILURE", message: message || commonError };
        }
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: AEPS_RESENT_BANK_LIST_FAILURE,
            payload: {
                status: "FAILURE",
                message: errorMessage,
            },
        });
        throw error;
    } finally {
        dispatch({ type: LOADING_END });
    }
};
