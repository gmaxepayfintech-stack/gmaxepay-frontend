import axios from "axios";
import { API_ROUTE } from "../../data/env";

import { RETAILER_ONBOARDING_REFERAL_CODE_FAILURE, RETAILER_ONBOARDING_REFERAL_CODE_SUCCESS, RETAILER_ONBOARDING_SEND__OTP_FAILURE, RETAILER_ONBOARDING_SEND__OTP_SUCCESS, RETAILER_OTP_SUBMIT_FAILURE, RETAILER_OTP_SUBMIT_SUCCESS, RETAILER_SEND_EMAIL_OTP_FAILURE, RETAILER_SEND_EMAIL_OTP_SUCCESS } from "../actionType/retailerOnboardingActionType";
import { LOADING_START, LOADING_END } from "../actionType/loadingActionType";

const commonError = "Something went wrong!";

export const referalCodeCheck = (values, companyData) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const headers = {
            "Content-Type": "application/json",
        };

        if (companyData?.companyId || companyData?._id || companyData?.id) {
            headers["x-company-id"] = companyData?.companyId || companyData?._id || companyData?.id;
        }

        if (companyData?.domain || companyData?.companyDomain) {
            headers["x-company-domain"] = companyData?.domain || companyData?.companyDomain;
        }

        const response = await axios.post(
            `${API_ROUTE}/api/v1/user/onboarding/postReferCode`,
            values,
            {
                headers,
            }
        );

        const { data: retailerOnboarding, Success, status, message } = response?.data ?? {};

        if (status === "SUCCESS") {
            // Store success response in localStorage including the referral code
            try {
                const dataToStore = {
                    retailerOnboarding,
                    referCode: values?.referCode || null, // Store the referral code
                    Success,
                    status,
                    message,
                    timestamp: new Date().toISOString(),
                };
                console.log("Storing referral code in localStorage:", dataToStore);
                localStorage.setItem("referralCodeCompleted", JSON.stringify(dataToStore));
                console.log("Successfully stored referral code:", values?.referCode);
            } catch (storageError) {
                console.error("Error storing referral code response in localStorage:", storageError);
            }

            dispatch({
                type: RETAILER_ONBOARDING_REFERAL_CODE_SUCCESS,
                payload: { retailerOnboarding, Success, status, message },
            });
        } else {
            dispatch({
                type: RETAILER_ONBOARDING_REFERAL_CODE_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
        }
    } catch (error) {
        dispatch({
            type: RETAILER_ONBOARDING_REFERAL_CODE_FAILURE,
            payload: error.response ? error.response.data.message : error.message,
        });
    } finally {
        dispatch({ type: LOADING_END });
    }
};

export const mobileOtpResponse = (values, companyData) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const headers = {
            "Content-Type": "application/json",
        };

        if (companyData?.companyId || companyData?._id || companyData?.id) {
            headers["x-company-id"] = companyData?.companyId || companyData?._id || companyData?.id;
        }

        if (companyData?.domain || companyData?.companyDomain) {
            headers["x-company-domain"] = companyData?.domain || companyData?.companyDomain;
        }

        // Log the request body to verify referCode is included
        console.log("mobileOtpResponse - Request body:", JSON.stringify(values, null, 2));
        console.log("mobileOtpResponse - Headers:", headers);

        const response = await axios.post(
            `${API_ROUTE}/api/v1/user/onboarding/sendSmsOtp`,
            values,
            {
                headers,
            }
        );

        const { data: OTPResponse, Success, status, message } = response?.data ?? {};

        if (status === "SUCCESS") {
            dispatch({
                type: RETAILER_ONBOARDING_SEND__OTP_SUCCESS,
                payload: { OTPResponse, Success, status, message },
            });
        } else {
            dispatch({
                type: RETAILER_ONBOARDING_SEND__OTP_FAILURE,
                payload: {
                    onBoarding: response?.data,
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
        }
    } catch (error) {
        dispatch({
            type: RETAILER_ONBOARDING_SEND__OTP_FAILURE,
            payload: error.response ? error.response.data.message : error.message,
        });
    } finally {
        dispatch({ type: LOADING_END });
    }
};

export const otpSubmitResponse = (values, companyData, token) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const headers = {
            "Content-Type": "application/json",
        };

        if (companyData?.companyId || companyData?._id || companyData?.id) {
            headers["x-company-id"] = companyData?.companyId || companyData?._id || companyData?.id;
        }

        if (companyData?.domain || companyData?.companyDomain) {
            headers["x-company-domain"] = companyData?.domain || companyData?.companyDomain;
        }

        // Add token to headers if provided
        if (token) {
            headers["token"] = token;
        }

        // Log the request body and headers
        console.log("otpSubmitResponse - Request body:", JSON.stringify(values, null, 2));
        console.log("otpSubmitResponse - Headers:", headers);

        const response = await axios.post(
            `${API_ROUTE}/api/v1/user/onboarding/verifySmsOtp`,
            values,
            {
                headers,
            }
        );

        const { data: OTPResponse, Success, status, message } = response?.data ?? {};

        if (status === "SUCCESS") {
            dispatch({
                type: RETAILER_OTP_SUBMIT_SUCCESS,
                payload: { OTPResponse, Success, status, message },
            });
        } else {
            dispatch({
                type: RETAILER_OTP_SUBMIT_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
        }
    } catch (error) {
        dispatch({
            type: RETAILER_OTP_SUBMIT_FAILURE,
            payload: error.response ? error.response.data.message : error.message,
        });
    } finally {
        dispatch({ type: LOADING_END });
    }
};

export const emailOtpResponse = (values, companyData, token) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const headers = {
            "Content-Type": "application/json",
        };

        if (companyData?.companyId || companyData?._id || companyData?.id) {
            headers["x-company-id"] = companyData?.companyId || companyData?._id || companyData?.id;
        }

        if (companyData?.domain || companyData?.companyDomain) {
            headers["x-company-domain"] = companyData?.domain || companyData?.companyDomain;
        }

        // Add token to headers if provided
        if (token) {
            headers["token"] = token;
        }

        // Log the request body and headers
        console.log("otpSubmitResponse - Request body:", JSON.stringify(values, null, 2));
        console.log("otpSubmitResponse - Headers:", headers);

        const response = await axios.post(
            `${API_ROUTE}/api/v1/user/onboarding/verifySmsOtp`,
            values,
            {
                headers,
            }
        );

        const { data: emailSendEmailOtpResponse, Success, status, message } = response?.data ?? {};

        if (status === "SUCCESS") {
            dispatch({
                type: RETAILER_SEND_EMAIL_OTP_SUCCESS,
                payload: { emailSendEmailOtpResponse, Success, status, message },
            });
        } else {
            dispatch({
                type: RETAILER_SEND_EMAIL_OTP_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
        }
    } catch (error) {
        dispatch({
            type: RETAILER_SEND_EMAIL_OTP_FAILURE,
            payload: error.response ? error.response.data.message : error.message,
        });
    } finally {
        dispatch({ type: LOADING_END });
    }
};




