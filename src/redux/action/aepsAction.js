import axios from "axios";
import secureLocalStorage from "react-secure-storage";
import { API_ROUTE } from "../../data/env";

import { LOADING_START, LOADING_END } from "../actionType/loadingActionType";
import { AEPS_RESCEND_OTP_FAILURE, AEPS_RESCEND_OTP_SUCCESS, AEPS_STATUS_CHECK_FAILURE, AEPS_STATUS_CHECK_SUCCESS, AEPS_SUBMIT_OTP_FAILURE, AEPS_SUBMIT_OTP_SUCCESS, AEPS_TERMS_CONDITION_OTP_FAILURE, AEPS_TERMS_CONDITION_OTP_SUCCESS, AEPS_ONBOARDING_BIOMETRIC_VERIFICATION_SUCCESS, AEPS_ONBOARDING_BIOMETRIC_VERIFICATION_FAILURE, AEPS_ONBOARDING_FA_VERIFICATION_SUCCESS, AEPS_ONBOARDING_FA_VERIFICATION_FAILURE, AEPS_BANK_LIST_SUCCESS, AEPS_BANK_LIST_FAILURE, AEPS_WITHDRAWAL_SUCCESS, AEPS_WITHDRAWAL_FAILURE } from "../actionType/aepsActionType";

const commonError = "Something went wrong!";

export const aepsTermsConditionOtp = () => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");

        const response = await axios.post(
            `${API_ROUTE}/api/v1/user/aeps/onboarding`,
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
        const apiUrl = `${API_ROUTE}/api/v1/user/aeps/onboarding-status`;

        // Debug logging to verify API call is being made
        console.log("🔍 [aepsStatusCheck] Making API call to:", apiUrl);
        console.log("🔍 [aepsStatusCheck] API_ROUTE value:", API_ROUTE);
        console.log("🔍 [aepsStatusCheck] Auth token exists:", !!authToken);

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

        console.log("✅ [aepsStatusCheck] API call successful, response:", response);

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
            `${API_ROUTE}/api/v1/user/aeps/resend-otp`,
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
            `${API_ROUTE}/api/v1/user/aeps/validate-otp`,
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
            `${API_ROUTE}/api/v1/user/aeps/bio-metric-verification`,
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
            `${API_ROUTE}/api/v1/user/aeps/2fa-authentication`,
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

export const aepsBankList = (data) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");

        const response = await axios.post(
            `${API_ROUTE}/api/v1/user/bank/get-all-banks`,
            data,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const { data: bankList, status, message } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: AEPS_BANK_LIST_SUCCESS,
                payload: { bankList, status, message },
            });
            return { bankList, status, message };
        } else {
            dispatch({
                type: AEPS_BANK_LIST_FAILURE,
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

        const apiUrl = `${API_ROUTE}/api/v1/user/aeps/transaction`;
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
            dispatch({
                type: AEPS_WITHDRAWAL_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
            return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
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
        return {
            status: "FAILURE",
            message: errorMessage,
        };
    } finally {
        dispatch({ type: LOADING_END });
    }
};



