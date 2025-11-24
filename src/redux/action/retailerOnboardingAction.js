import axios from "axios";
import { API_ROUTE } from "../../data/env";

import { RETAILER_ONBOARDING_REFERAL_CODE_FAILURE, RETAILER_ONBOARDING_REFERAL_CODE_SUCCESS, RETAILER_ONBOARDING_SEND__OTP_FAILURE, RETAILER_ONBOARDING_SEND__OTP_SUCCESS, RETAILER_OTP_SUBMIT_FAILURE, RETAILER_OTP_SUBMIT_SUCCESS, RETAILER_RESEND_EMAIL_OTP_FAILURE, RETAILER_RESEND_EMAIL_OTP_SUCCESS, RETAILER_SEND_EMAIL_OTP_FAILURE, RETAILER_SEND_EMAIL_OTP_SUCCESS, RETAILER_SUBMIT_EMAIL_SUCCESS, RETAILER_SUBMIT_EMAIL_FAILURE, RETAILER_POST_SHOP_DETAILS_SUCCESS, RETAILER_POST_SHOP_DETAILS_FAILURE, RETAILER_AADHAAR_CONNECTION_SUCCESS, RETAILER_AADHAAR_CONNECTION_FAILURE, RETAILER_DOWNLOAD_AADHAAR_SUCCESS, RETAILER_DOWNLOAD_AADHAAR_FAILURE, RETAILER_UPLOAD_AADHAAR_SUCCESS, RETAILER_UPLOAD_AADHAAR_FAILURE, RETAILER_PAN_CONNECTION_SUCCESS, RETAILER_PAN_CONNECTION_FAILURE, RETAILER_DOWNLOAD_PAN_SUCCESS, RETAILER_DOWNLOAD_PAN_FAILURE, RETAILER_UPLOAD_PAN_SUCCESS, RETAILER_UPLOAD_PAN_FAILURE, RETAILER_POST_BANK_DETAILS_SUCCESS, RETAILER_POST_BANK_DETAILS_FAILURE, RETAILER_POST_PROFILE_SUCCESS, RETAILER_POST_PROFILE_FAILURE, RETAILER_GET_PENDING_SUCCESS, RETAILER_GET_PENDING_FAILURE } from "../actionType/retailerOnboardingActionType";
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
    }
};

export const emailOtpResponse = (values, companyData, token) => async (dispatch) => {
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
        console.log("emailOtpResponse - Request body:", JSON.stringify(values, null, 2));
        console.log("emailOtpResponse - Headers:", headers);

        const response = await axios.post(
            `${API_ROUTE}/api/v1/user/onboarding/sendEmailOtp`,
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
    }
};

export const emailRescendOTP = (values, companyData, token) => async (dispatch) => {
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
        console.log("emailRescendOTP - Request body:", JSON.stringify(values, null, 2));
        console.log("emailRescendOTP - Headers:", headers);

        const response = await axios.post(
            `${API_ROUTE}/api/v1/user/onboarding/sendEmailOtp`,
            values,
            {
                headers,
            }
        );

        const { data: emailReSendOtp, Success, status, message } = response?.data ?? {};

        if (status === "SUCCESS") {
            dispatch({
                type: RETAILER_RESEND_EMAIL_OTP_SUCCESS,
                payload: { emailReSendOtp, Success, status, message },
            });
            // Also update the emailSendEmailOtpResponse to maintain consistency with UI
            dispatch({
                type: RETAILER_SEND_EMAIL_OTP_SUCCESS,
                payload: { emailSendEmailOtpResponse: emailReSendOtp, Success, status, message },
            });
        } else {
            dispatch({
                type: RETAILER_RESEND_EMAIL_OTP_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
        }
    } catch (error) {
        dispatch({
            type: RETAILER_RESEND_EMAIL_OTP_FAILURE,
            payload: error.response ? error.response.data.message : error.message,
        });
    }
};

export const submitEmail = (values, companyData, token) => async (dispatch) => {
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
        console.log("submitEmail - Request body:", JSON.stringify(values, null, 2));
        console.log("submitEmail - Headers:", headers);

        const response = await axios.post(
            `${API_ROUTE}/api/v1/user/onboarding/verifyEmailOtp`,
            values,
            {
                headers,
            }
        );

        const { data: emailSubmitEmailOtpResponse, Success, status, message } = response?.data ?? {};

        if (status === "SUCCESS") {
            dispatch({
                type: RETAILER_SUBMIT_EMAIL_SUCCESS,
                payload: { emailSubmitEmailOtpResponse, Success, status, message },
            });
        } else {
            dispatch({
                type: RETAILER_SUBMIT_EMAIL_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
        }
    } catch (error) {
        dispatch({
            type: RETAILER_SUBMIT_EMAIL_FAILURE,
            payload: error.response ? error.response.data.message : error.message,
        });
    }
};

// Helper function to convert dataURL to File
const dataURLtoFile = (dataUrl, filename) => {
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
};

export const postShopDetails = (values, companyData, token) => async (dispatch) => {
    try {
        const headers = {
            "Content-Type": "multipart/form-data",
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

        // Convert shopImage dataURL to File if it exists
        const formData = new FormData();
        
        // Always append required fields (API requires these)
        formData.append("shopName", values.shopName || "");
        
        if (values.shopImage) {
            const shopImageFile = dataURLtoFile(values.shopImage, "shop-photo.jpg");
            formData.append("shopImage", shopImageFile);
        }
        
        // Always append ipAddress (required by API)
        formData.append("ipAddress", values.ipAddress || "");
        
        // Always append longitude (required by API)
        formData.append("longitude", values.longitude !== null && values.longitude !== undefined ? values.longitude.toString() : "");
        
        // Always append latitude (required by API) - use "0" as default if null
        const latitude = values.latitude !== null && values.latitude !== undefined ? values.latitude.toString() : "0";
        formData.append("latitude", latitude);

        // Log the request body and headers
        console.log("postShopDetails - FormData values:", {
            shopName: values.shopName,
            ipAddress: values.ipAddress,
            longitude: values.longitude,
            latitude: values.latitude,
            shopImage: values.shopImage ? "present" : "missing"
        });
        console.log("postShopDetails - Headers:", headers);

        const response = await axios.post(
            `${API_ROUTE}/api/v1/user/onboarding/postShopDetails`,
            formData,
            {
                headers,
            }
        );

        const { data: shopDetailsResponse, Success, status, message } = response?.data ?? {};

        if (status === "SUCCESS") {
            dispatch({
                type: RETAILER_POST_SHOP_DETAILS_SUCCESS,
                payload: { shopDetailsResponse, Success, status, message },
            });
        } else {
            dispatch({
                type: RETAILER_POST_SHOP_DETAILS_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
        }
    } catch (error) {
        dispatch({
            type: RETAILER_POST_SHOP_DETAILS_FAILURE,
            payload: error.response ? error.response.data.message : error.message,
        });
    }
};

// Aadhaar Connection Action
export const connectAadhaarVerification = (redirect_url, companyData, token) => async (dispatch) => {
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

        if (token) {
            headers["token"] = token;
        }

        const response = await axios.post(
            `${API_ROUTE}/api/v1/user/onboarding/connectAadhaarVerification`,
            { redirect_url },
            { headers }
        );

        const { status, data, message } = response?.data ?? {};

        if (status === "SUCCESS") {
            dispatch({
                type: RETAILER_AADHAAR_CONNECTION_SUCCESS,
                payload: { data, status, message },
            });
        } else {
            dispatch({
                type: RETAILER_AADHAAR_CONNECTION_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: message || response?.data?.message || commonError,
                },
            });
        }
    } catch (error) {
        const errorResponse = error?.response?.data;
        if (errorResponse?.status === "SUCCESS" && errorResponse?.data?.isDownload === true) {
            dispatch({
                type: RETAILER_AADHAAR_CONNECTION_SUCCESS,
                payload: { data: errorResponse.data, status: errorResponse.status, message: errorResponse.message },
            });
        } else {
            dispatch({
                type: RETAILER_AADHAAR_CONNECTION_FAILURE,
                payload: error.response ? error.response.data.message : error.message,
            });
        }
    } finally {
        dispatch({ type: LOADING_END });
    }
};

// Download Aadhaar Document Action
export const downloadAadhaarDocument = (companyData, token) => async (dispatch) => {
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

        if (token) {
            headers["token"] = token;
        }

        const response = await axios.post(
            `${API_ROUTE}/api/v1/user/onboarding/getDigilockerDocuments`,
            { document_type: "AADHAAR" },
            { headers }
        );

        const { status, message } = response?.data ?? {};

        if (status === "SUCCESS") {
            dispatch({
                type: RETAILER_DOWNLOAD_AADHAAR_SUCCESS,
                payload: { status, message },
            });
        } else {
            dispatch({
                type: RETAILER_DOWNLOAD_AADHAAR_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message || commonError,
                },
            });
        }
    } catch (error) {
        dispatch({
            type: RETAILER_DOWNLOAD_AADHAAR_FAILURE,
            payload: error.response ? error.response.data.message : error.message,
        });
    } finally {
        dispatch({ type: LOADING_END });
    }
};

// Upload Aadhaar Documents Action
export const uploadAadhaarDocuments = (frontImage, backImage, companyData, token) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const formData = new FormData();
        formData.append("front_photo", frontImage);
        formData.append("back_photo", backImage);

        const headers = {
            "Content-Type": "multipart/form-data",
        };

        if (companyData?.companyId || companyData?._id || companyData?.id) {
            headers["x-company-id"] = companyData?.companyId || companyData?._id || companyData?.id;
        }

        if (companyData?.domain || companyData?.companyDomain) {
            headers["x-company-domain"] = companyData?.domain || companyData?.companyDomain;
        }

        if (token) {
            headers["token"] = token;
        }

        const response = await axios.post(
            `${API_ROUTE}/api/v1/user/onboarding/uploadAadhaarDocuments`,
            formData,
            { headers }
        );

        const { status, message } = response?.data ?? {};

        if (status === "SUCCESS") {
            dispatch({
                type: RETAILER_UPLOAD_AADHAAR_SUCCESS,
                payload: { status, message },
            });
        } else {
            dispatch({
                type: RETAILER_UPLOAD_AADHAAR_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message || commonError,
                },
            });
        }
    } catch (error) {
        dispatch({
            type: RETAILER_UPLOAD_AADHAAR_FAILURE,
            payload: error.response ? error.response.data.message : error.message,
        });
    } finally {
        dispatch({ type: LOADING_END });
    }
};

// PAN Connection Action
export const connectPanVerification = (redirect_url, companyData, token) => async (dispatch) => {
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

        if (token) {
            headers["token"] = token;
        }

        const response = await axios.post(
            `${API_ROUTE}/api/v1/user/onboarding/connectPanVerification`,
            { redirect_url },
            { headers }
        );

        const { status, data, message } = response?.data ?? {};

        if (status === "SUCCESS") {
            dispatch({
                type: RETAILER_PAN_CONNECTION_SUCCESS,
                payload: { data, status, message },
            });
        } else {
            dispatch({
                type: RETAILER_PAN_CONNECTION_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: message || response?.data?.message || commonError,
                },
            });
        }
    } catch (error) {
        const errorResponse = error?.response?.data;
        if (errorResponse?.status === "SUCCESS" && errorResponse?.data?.isDownload === true) {
            dispatch({
                type: RETAILER_PAN_CONNECTION_SUCCESS,
                payload: { data: errorResponse.data, status: errorResponse.status, message: errorResponse.message },
            });
        } else {
            dispatch({
                type: RETAILER_PAN_CONNECTION_FAILURE,
                payload: error.response ? error.response.data.message : error.message,
            });
        }
    } finally {
        dispatch({ type: LOADING_END });
    }
};

// Download PAN Document Action
export const downloadPanDocument = (companyData, token) => async (dispatch) => {
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

        if (token) {
            headers["token"] = token;
        }

        const response = await axios.post(
            `${API_ROUTE}/api/v1/user/onboarding/getDigilockerDocuments`,
            { document_type: "PAN" },
            { headers }
        );

        const { status, message } = response?.data ?? {};

        if (status === "SUCCESS") {
            dispatch({
                type: RETAILER_DOWNLOAD_PAN_SUCCESS,
                payload: { status, message },
            });
        } else {
            dispatch({
                type: RETAILER_DOWNLOAD_PAN_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message || commonError,
                },
            });
        }
    } catch (error) {
        dispatch({
            type: RETAILER_DOWNLOAD_PAN_FAILURE,
            payload: error.response ? error.response.data.message : error.message,
        });
    } finally {
        dispatch({ type: LOADING_END });
    }
};

// Upload PAN Document Action
export const uploadPanDocument = (panImage, companyData, token) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const formData = new FormData();
        formData.append("front_photo", panImage);

        const headers = {
            "Content-Type": "multipart/form-data",
        };

        if (companyData?.companyId || companyData?._id || companyData?.id) {
            headers["x-company-id"] = companyData?.companyId || companyData?._id || companyData?.id;
        }

        if (companyData?.domain || companyData?.companyDomain) {
            headers["x-company-domain"] = companyData?.domain || companyData?.companyDomain;
        }

        if (token) {
            headers["token"] = token;
        }

        const response = await axios.post(
            `${API_ROUTE}/api/v1/user/onboarding/uploadPanDocuments`,
            formData,
            { headers }
        );

        const { status, message } = response?.data ?? {};

        if (status === "SUCCESS") {
            dispatch({
                type: RETAILER_UPLOAD_PAN_SUCCESS,
                payload: { status, message },
            });
        } else {
            dispatch({
                type: RETAILER_UPLOAD_PAN_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message || commonError,
                },
            });
        }
    } catch (error) {
        dispatch({
            type: RETAILER_UPLOAD_PAN_FAILURE,
            payload: error.response ? error.response.data.message : error.message,
        });
    } finally {
        dispatch({ type: LOADING_END });
    }
};

// Post Bank Details Action
export const postBankDetails = (values, companyData, token) => async (dispatch) => {
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

        if (token) {
            headers["token"] = token;
        }

        const response = await axios.post(
            `${API_ROUTE}/api/v1/user/onboarding/postBankDetails`,
            {
                account_number: values.account_number,
                ifsc: values.ifsc,
            },
            { headers }
        );

        const { data: bankDetailsResponse, status, message } = response?.data ?? {};

        if (status === "SUCCESS") {
            dispatch({
                type: RETAILER_POST_BANK_DETAILS_SUCCESS,
                payload: { bankDetailsResponse, status, message },
            });
        } else {
            dispatch({
                type: RETAILER_POST_BANK_DETAILS_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message || commonError,
                },
            });
        }
    } catch (error) {
        dispatch({
            type: RETAILER_POST_BANK_DETAILS_FAILURE,
            payload: {
                status: "FAILURE",
                message: error.response?.data?.message || error.message || commonError,
            },
        });
    }
};

// Post Profile Action
export const postProfile = (photoDataUrl, companyData, token) => async (dispatch) => {
    try {
        if (!photoDataUrl) {
            dispatch({
                type: RETAILER_POST_PROFILE_FAILURE,
                payload: {
                    status: "FAILURE",
                    message: "Profile image is required",
                },
            });
            return;
        }

        // Convert dataURL to File
        const arr = photoDataUrl.split(",");
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        const photoFile = new File([u8arr], "photo.jpg", { type: mime });

        const formData = new FormData();
        formData.append("photo", photoFile);

        const headers = {
            "Content-Type": "multipart/form-data",
        };

        if (companyData?.companyId || companyData?._id || companyData?.id) {
            headers["x-company-id"] = companyData?.companyId || companyData?._id || companyData?.id;
        }

        if (companyData?.domain || companyData?.companyDomain) {
            headers["x-company-domain"] = companyData?.domain || companyData?.companyDomain;
        }

        if (token) {
            headers["token"] = token;
        }

        // Log the request body and headers
        console.log("postProfile - FormData values:", {
            photo: photoFile ? "present" : "missing"
        });
        console.log("postProfile - Headers:", headers);

        const response = await axios.post(
            `${API_ROUTE}/api/v1/user/onboarding/postProfile`,
            formData,
            { headers }
        );

        const { data: profileResponse, status, message } = response?.data ?? {};

        if (status === "SUCCESS") {
            dispatch({
                type: RETAILER_POST_PROFILE_SUCCESS,
                payload: { profileResponse, status, message, data: response?.data?.data },
            });
        } else {
            dispatch({
                type: RETAILER_POST_PROFILE_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message || commonError,
                },
            });
        }
    } catch (error) {
        dispatch({
            type: RETAILER_POST_PROFILE_FAILURE,
            payload: {
                status: "FAILURE",
                message: error.response?.data?.message || error.message || commonError,
            },
        });
    }
};

// Get Pending Steps Action
export const getPendingSteps = (companyData, token) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        // Validate required data
        const companyId = companyData?.companyId || companyData?._id || companyData?.id;
        const companyDomain = companyData?.domain || companyData?.companyDomain;
        if (!companyId) {
            const errorMsg = "Company ID is required. Please ensure company data is loaded.";
            console.error("getPendingSteps - Error:", errorMsg);
            dispatch({
                type: RETAILER_GET_PENDING_FAILURE,
                payload: {
                    status: "FAILURE",
                    message: errorMsg,
                },
            });
            return;
        }

        if (!companyDomain) {
            const errorMsg = "Company domain is required. Please ensure company data is loaded.";
            console.error("getPendingSteps - Error:", errorMsg);
            dispatch({
                type: RETAILER_GET_PENDING_FAILURE,
                payload: {
                    status: "FAILURE",
                    message: errorMsg,
                },
            });
            return;
        }

        if (!token) {
            const errorMsg = "Token is required. Please complete mobile verification first.";
            console.error("getPendingSteps - Error:", errorMsg);
            dispatch({
                type: RETAILER_GET_PENDING_FAILURE,
                payload: {
                    status: "FAILURE",
                    message: errorMsg,
                },
            });
            return;
        }

        const headers = {
            "Content-Type": "application/json",
            "x-company-id": companyId,
            "x-company-domain": companyDomain,
            "token": token,
        };

        const response = await axios.post(
            `${API_ROUTE}/api/v1/user/onboarding/getPending`,
            {}, // Empty body for POST request
            { headers }
        );

        const { data, status, message } = response?.data ?? {};

        if (status === "SUCCESS") {
            dispatch({
                type: RETAILER_GET_PENDING_SUCCESS,
                payload: { data, status, message },
            });
        } else {
            dispatch({
                type: RETAILER_GET_PENDING_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message || commonError,
                },
            });
        }
    } catch (error) {
        console.error("getPendingSteps - Error:", error);
        console.error("getPendingSteps - Error Response:", error.response?.data);
        dispatch({
            type: RETAILER_GET_PENDING_FAILURE,
            payload: {
                status: "FAILURE",
                message: error.response?.data?.message || error.message || commonError,
            },
        });
    } finally {
        dispatch({ type: LOADING_END });
    }
};




