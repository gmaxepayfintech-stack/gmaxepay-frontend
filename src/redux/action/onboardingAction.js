import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_ROUTE, BASE_URL } from "../../data/env";
import {
  CLEAR_ONBOARDING,
  UPDATE_ONBOARDING_STEP,
  MOBILE_OTP_SENT_SUCCESS,
  MOBILE_OTP_SENT_FAILURE,
  SMS_RESEND_OTP_SUCCESS,
  SMS_RESEND_OTP_FAILURE,
  SMS_VERIFY_OTP_SUCCESS,
  SMS_VERIFY_OTP_FAILURE,
  EMAIL_OTP_SENT_SUCCESS,
  EMAIL_OTP_SENT_FAILURE,
  EMAIL_RESCEND_OTP_SUCCESS,
  EMAIL_RESCEND_OTP_FAILURE,
  EMAIL_VERIFY_OTP_SUCCESS,
  EMAIL_VERIFY_OTP_FAILURE,
  AADHAAR_CONNECTION_SUCCESS,
  AADHAAR_CONNECTION_FAILURE,
  DOWNLOAD_AADHAAR_SUCCESS,
  DOWNLOAD_AADHAAR_FAILURE,
  UPLOAD_AADHAAR_SUCCESS,
  UPLOAD_AADHAAR_FAILURE,
  PAN_CONNECTION_SUCCESS,
  PAN_CONNECTION_FAILURE,
  DOWNLOAD_PAN_SUCCESS,
  DOWNLOAD_PAN_FAILURE,
  UPLOAD_PAN_SUCCESS,
  UPLOAD_PAN_FAILURE,
  POST_BANK_DETAILS_SUCCESS,
  POST_BANK_DETAILS_FAILURE,
  POST_PROFILE_START,
  POST_PROFILE_SUCCESS,
  POST_PROFILE_FAILURE,
  POST_SHOP_DETAILS_START,
  POST_SHOP_DETAILS_SUCCESS,
  POST_SHOP_DETAILS_FAILURE,
} from "../actionType/onboardingActionType";
import { LOADING_END, LOADING_START } from "../actionType/loadingActionType";
const commonError = "Something went Wrong";
// Async thunk for fetching onboarding data
export const fetchOnboarding = createAsyncThunk(
  "onboarding/fetchOnboarding",
  async (token, { rejectWithValue }) => {
    try {
      let domain = window.location.hostname;
      if (domain === "localhost") {
        domain = "app.gmaxepay.in";
      }
      const response = await axios.post(
        `${API_ROUTE}/api/v1/company/onboarding/${token}`,
        {},
        {
          headers: {
            "x-company-domain": domain,
          },
        }
      );

      if (response.data.status === "SUCCESS") {
        return response.data.data;
      } else {
        return rejectWithValue(
          response.data.message || "Failed to fetch onboarding data"
        );
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch onboarding data"
      );
    }
  }
);

// Regular action creators
export const clearOnboarding = () => ({
  type: CLEAR_ONBOARDING,
});

export const updateOnboardingStep = (stepNumber) => ({
  type: UPDATE_ONBOARDING_STEP,
  payload: stepNumber,
});

export const MobileOTPResponse = (values, token) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const response = await axios.post(
      `${API_ROUTE}/api/v1/company/onboarding/${token}/sendSmsOtp`,
      values,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const { data: otpStatus, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: MOBILE_OTP_SENT_SUCCESS,
        payload: { otpStatus, status, message },
      });
      return { status, message };
    } else {
      dispatch({
        type: MOBILE_OTP_SENT_FAILURE,
        payload: {
          status: response?.data?.status ?? "FAILURE",
          message: response?.data?.message ?? commonError,
        },
      });
      return { status: response?.data?.status || "FAILURE", message: response?.data?.message || commonError };
    }
  } catch (error) {
    dispatch({
      type: MOBILE_OTP_SENT_FAILURE,
      payload: error.response ? error.response.data.message : error.message,
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const resendOTPResponse = (values, token) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const response = await axios.post(
      `${API_ROUTE}/api/v1/company/onboarding/${token}/resetSmsOtp`,
      values,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const { data: rescendResponse, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: SMS_RESEND_OTP_SUCCESS,
        payload: { rescendResponse, status, message },
      });
      return { status, message };
    } else {
      dispatch({
        type: SMS_RESEND_OTP_FAILURE,
        payload: response?.data?.message ?? commonError,
      });
      return { status: "FAILURE", message: response?.data?.message ?? commonError };
    }
  } catch (error) {
    dispatch({
      type: SMS_RESEND_OTP_FAILURE,
      payload: error.response ? error.response.data.message : error.message,
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const verifySmsOtp = (values, token) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const response = await axios.post(
      `${API_ROUTE}/api/v1/company/onboarding/${token}/verifySmsOtp`,
      values,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const { data: verifySmsVerify, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: SMS_VERIFY_OTP_SUCCESS,
        payload: { verifySmsVerify, status, message },
      });
      return { status, message };
    } else {
      dispatch({
        type: SMS_VERIFY_OTP_FAILURE,
        payload: {
          status: response?.data?.status ?? "FAILURE",
          message: response?.data?.message ?? commonError,
        },
      });
      return { status: response?.data?.status || "FAILURE", message: response?.data?.message || commonError };
    }
  } catch (error) {
    dispatch({
      type: SMS_VERIFY_OTP_FAILURE,
      payload: error.response ? error.response.data.message : error.message,
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const emailSmsOtp = (values, token) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const response = await axios.post(
      `${API_ROUTE}/api/v1/company/onboarding/${token}/sendEmailOtp`,
      values,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const { data: verifySmsVerify, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: EMAIL_OTP_SENT_SUCCESS,
        payload: { verifySmsVerify, status, message },
      });
      return { status, message };
    } else {
      dispatch({
        type: EMAIL_OTP_SENT_FAILURE,
        payload: {
          status: response?.data?.status ?? "FAILURE",
          message: response?.data?.message ?? commonError,
        },
      });
      return { status: response?.data?.status || "FAILURE", message: response?.data?.message || commonError };
    }
  } catch (error) {
    dispatch({
      type: EMAIL_OTP_SENT_FAILURE,
      payload: error.response ? error.response.data.message : error.message,
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const emailResendOtp = (values, token) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const response = await axios.post(
      `${API_ROUTE}/api/v1/company/onboarding/${token}/verifySmsOtp`,
      values,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const { data: emailrescendOtp, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: EMAIL_RESCEND_OTP_SUCCESS,
        payload: { emailrescendOtp, status, message },
      });
      return { status, message };
    } else {
      dispatch({
        type: EMAIL_RESCEND_OTP_FAILURE,
        payload: {
          status: response?.data?.status ?? "FAILURE",
          message: response?.data?.message ?? commonError,
        },
      });
      return { status: response?.data?.status || "FAILURE", message: response?.data?.message || commonError };
    }
  } catch (error) {
    dispatch({
      type: EMAIL_RESCEND_OTP_FAILURE,
      payload: error.response ? error.response.data.message : error.message,
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const emailOtpVerify = (values, token) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const response = await axios.post(
      `${API_ROUTE}/api/v1/company/onboarding/${token}/verifyEmailOtp`,
      values,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const { data: verifyEmailOtp, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: EMAIL_VERIFY_OTP_SUCCESS,
        payload: { verifyEmailOtp, status, message },
      });
      return { status, message };
    } else {
      dispatch({
        type: EMAIL_VERIFY_OTP_FAILURE,
        payload: {
          status: response?.data?.status ?? "FAILURE",
          message: response?.data?.message ?? commonError,
        },
      });
      return { status: response?.data?.status || "FAILURE", message: response?.data?.message || commonError };
    }
  } catch (error) {
    dispatch({
      type: EMAIL_VERIFY_OTP_FAILURE,
      payload: error.response ? error.response.data.message : error.message,
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const aadhaarConnection = () => async (dispatch) => {
  const token = localStorage.getItem("onboardingToken");

  dispatch({ type: LOADING_START });
  try {
    const response = await axios.post(
      `${API_ROUTE}/api/v1/company/onboarding/${token}/connectAadhaarVerification`,
      {
        "redirect_url": `${BASE_URL}/onboarding/${token}`,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const { data: aadhaarVerify, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: AADHAAR_CONNECTION_SUCCESS,
        payload: { aadhaarVerify, status, message },
      });
      return { status, message };
    } else {
      dispatch({
        type: AADHAAR_CONNECTION_FAILURE,
        payload: {
          status: response?.data?.status ?? "FAILURE",
          message: response?.data?.message ?? commonError,
        },
      });
      return { status: response?.data?.status || "FAILURE", message: response?.data?.message || commonError };
    }
  } catch (error) {
    dispatch({
      type: AADHAAR_CONNECTION_FAILURE,
      payload: error.response ? error.response.data.message : error.message,
    });
    return { status: "FAILURE", message: error.response ? error.response.data.message : error.message };
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const aadhaarDownload = (value) => async (dispatch) => {
  const token = localStorage.getItem("onboardingToken");

  dispatch({ type: LOADING_START });
  try {
    const response = await axios.post(
      `${API_ROUTE}/api/v1/company/onboarding/${token}/getDigilockerDocuments`,
      value,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const { data: downloadResponse, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: DOWNLOAD_AADHAAR_SUCCESS,
        payload: { downloadResponse, status, message },
      });
      return { status, message };
    } else {
      dispatch({
        type: DOWNLOAD_AADHAAR_FAILURE,
        payload: {
          status: response?.data?.status ?? "FAILURE",
          message: response?.data?.message ?? commonError,
        },
      });
      return { status: response?.data?.status || "FAILURE", message: response?.data?.message || commonError };
    }
  } catch (error) {
    dispatch({
      type: DOWNLOAD_AADHAAR_FAILURE,
      payload: error.response ? error.response.data.message : error.message,
    });
    return { status: "FAILURE", message: error.response ? error.response.data.message : error.message };
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const uploadAadhaarDocuments = (frontImage, backImage) => async (dispatch) => {
  const token = localStorage.getItem("onboardingToken");
  dispatch({ type: LOADING_START });
  try {
    const formData = new FormData();

    if (frontImage) {
      formData.append("front_photo", frontImage);
    }
    if (backImage) {
      formData.append("back_photo", backImage);
    }

    const response = await axios.post(
      `${API_ROUTE}/api/v1/company/onboarding/${token}/uploadAadharDocuments`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const { data: uploadResponse, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: UPLOAD_AADHAAR_SUCCESS,
        payload: { uploadResponse, status, message },
      });
      return { status, message };
    } else {
      dispatch({
        type: UPLOAD_AADHAAR_FAILURE,
        payload: {
          status: response?.data?.status ?? "FAILURE",
          message: response?.data?.message ?? commonError,
        },
      });
      return { status: response?.data?.status || "FAILURE", message: response?.data?.message || commonError };
    }
  } catch (error) {
    dispatch({
      type: UPLOAD_AADHAAR_FAILURE,
      payload: error.response ? error.response.data.message : error.message,
    });
    return { status: "FAILURE", message: error.response ? error.response.data.message : error.message };
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const panConnection = () => async (dispatch) => {
  const token = localStorage.getItem("onboardingToken");
  dispatch({ type: LOADING_START });
  try {
    const response = await axios.post(
      `${API_ROUTE}/api/v1/company/onboarding/${token}/connectPanVerification`,
      {
        "redirect_url": `${BASE_URL}/onboarding/${token}`,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const { data: panVerify, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: PAN_CONNECTION_SUCCESS,
        payload: { panVerify, status, message },
      });
      return { status, message };
    } else {
      dispatch({
        type: PAN_CONNECTION_FAILURE,
        payload: {
          status: response?.data?.status ?? "FAILURE",
          message: response?.data?.message ?? commonError,
        },
      });
      return { status: response?.data?.status || "FAILURE", message: response?.data?.message || commonError };
    }
  } catch (error) {
    dispatch({
      type: PAN_CONNECTION_FAILURE,
      payload: error.response ? error.response.data.message : error.message,
    });
    return { status: "FAILURE", message: error.response ? error.response.data.message : error.message };
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const panDownload = (value) => async (dispatch) => {
  const token = localStorage.getItem("onboardingToken");
  dispatch({ type: LOADING_START });
  try {
    const response = await axios.post(
      `${API_ROUTE}/api/v1/company/onboarding/${token}/getDigilockerDocuments`,
      value,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const { data: downloadResponse, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: DOWNLOAD_PAN_SUCCESS,
        payload: { downloadResponse, status, message },
      });
      return { status, message };
    } else {
      dispatch({
        type: DOWNLOAD_PAN_FAILURE,
        payload: {
          status: response?.data?.status ?? "FAILURE",
          message: response?.data?.message ?? commonError,
        },
      });
      return { status: response?.data?.status || "FAILURE", message: response?.data?.message || commonError };
    }
  } catch (error) {
    dispatch({
      type: DOWNLOAD_PAN_FAILURE,
      payload: error.response ? error.response.data.message : error.message,
    });
    return { status: "FAILURE", message: error.response ? error.response.data.message : error.message };
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const uploadPanDocument = (panImage) => async (dispatch) => {
  const token = localStorage.getItem("onboardingToken");

  dispatch({ type: LOADING_START });
  try {
    const formData = new FormData();

    if (panImage) {
      formData.append("front_photo", panImage);
    }

    const response = await axios.post(
      `${API_ROUTE}/api/v1/company/onboarding/${token}/uploadPanDocuments`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const { data: uploadResponse, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: UPLOAD_PAN_SUCCESS,
        payload: { uploadResponse, status, message },
      });
      return { status, message };
    } else {
      dispatch({
        type: UPLOAD_PAN_FAILURE,
        payload: {
          status: response?.data?.status ?? "FAILURE",
          message: response?.data?.message ?? commonError,
        },
      });
      return { status: response?.data?.status || "FAILURE", message: response?.data?.message || commonError };
    }
  } catch (error) {
    dispatch({
      type: UPLOAD_PAN_FAILURE,
      payload: error.response ? error.response.data.message : error.message,
    });
    return { status: "FAILURE", message: error.response ? error.response.data.message : error.message };
  } finally {
    dispatch({ type: LOADING_END });
  }
};

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

// Async function for posting profile photo (combined liveness + shop)
export const postProfile = (photoDataUrl, token) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    if (!photoDataUrl) {
      dispatch({
        type: POST_PROFILE_FAILURE,
        payload: {
          status: "FAILURE",
          message: "Profile image is required",
        },
      });
      return { status: "FAILURE", message: "Profile image is required" };
    }

    const photoFile = dataURLtoFile(photoDataUrl, "profile-liveness.jpg");
    const formData = new FormData();
    formData.append("photo", photoFile);

    const response = await axios.post(
      `${API_ROUTE}/api/v1/company/onboarding/${token}/postProfile`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const { data: uploadResponse, status, message } = response?.data ?? {};
    if (status === "SUCCESS" || response.data.flag === true) {
      dispatch({
        type: POST_PROFILE_SUCCESS,
        payload: { uploadResponse, status, message: message || response.data.message },
      });
      return { status: "SUCCESS", message: message || response.data.message };
    } else {
      dispatch({
        type: POST_PROFILE_FAILURE,
        payload: {
          status: response?.data?.status ?? "FAILURE",
          message: response?.data?.message || "Failed to post profile",
        },
      });
      return { status: "FAILURE", message: response?.data?.message || "Failed to post profile" };
    }
  } catch (error) {
    dispatch({
      type: POST_PROFILE_FAILURE,
      payload: error.response ? error.response.data.message : error.message,
    });
    return { status: "FAILURE", message: error.response ? error.response.data.message : error.message };
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// Async function for posting shop details
export const postShopDetails = (shopName, shopImage, token, ipAddress, longitude, latitude) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    if (!shopName) {
      dispatch({
        type: POST_SHOP_DETAILS_FAILURE,
        payload: {
          status: "FAILURE",
          message: "Shop name is required",
        },
      });
      return;
    }
    if (!shopImage) {
      dispatch({
        type: POST_SHOP_DETAILS_FAILURE,
        payload: {
          status: "FAILURE",
          message: "Shop image is required",
        },
      });
      return;
    }

    const shopImageFile = dataURLtoFile(shopImage, "shop-photo.jpg");
    const formData = new FormData();
    formData.append("shopName", shopName);
    formData.append("shopImage", shopImageFile);
    if (ipAddress) {
      formData.append("ipAddress", ipAddress);
    }
    if (longitude) {
      formData.append("longitude", longitude.toString());
    }
    if (latitude) {
      formData.append("latitude", latitude.toString());
    }

    let domain = window.location.hostname;
    if (domain === "localhost") {
      domain = "app.gmaxepay.in";
    }

    const response = await axios.post(
      `${API_ROUTE}/api/v1/company/onboarding/${token}/postShopDetails`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const { data: uploadResponse, status, message } = response?.data ?? {};
    if (status === "SUCCESS" || response.data.flag === true) {
      dispatch({
        type: POST_SHOP_DETAILS_SUCCESS,
        payload: { uploadResponse, status, message: message || response.data.message },
      });
      return { status: "SUCCESS", message: message || response.data.message };
    } else {
      dispatch({
        type: POST_SHOP_DETAILS_FAILURE,
        payload: {
          status: response?.data?.status ?? "FAILURE",
          message: response?.data?.message || "Failed to post shop details",
        },
      });
      return { status: "FAILURE", message: response?.data?.message || "Failed to post shop details" };
    }
  } catch (error) {
    dispatch({
      type: POST_SHOP_DETAILS_FAILURE,
      payload: error.response ? error.response.data.message : error.message,
    });
    return { status: "FAILURE", message: error.response ? error.response.data.message : error.message };
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// Action for posting bank details
export const postBankDetails = (values, token) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const response = await axios.post(
      `${API_ROUTE}/api/v1/company/onboarding/${token}/postBankDetails`,
      {
        account_number: values.account_number,
        ifsc: values.ifsc,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const { data: bankDetailsResponse, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: POST_BANK_DETAILS_SUCCESS,
        payload: { bankDetailsResponse, status, message },
      });
      return { status, message };
    } else {
      dispatch({
        type: POST_BANK_DETAILS_FAILURE,
        payload: {
          status: response?.data?.status ?? "FAILURE",
          message: response?.data?.message ?? commonError,
        },
      });
      return { status: response?.data?.status || "FAILURE", message: response?.data?.message || commonError };
    }
  } catch (error) {
    dispatch({
      type: POST_BANK_DETAILS_FAILURE,
      payload: {
        status: "FAILURE",
        message: error.response?.data?.message || error.message || commonError,
      },
    });
    return { status: "FAILURE", message: error.response?.data?.message || error.message || commonError };
  } finally {
    dispatch({ type: LOADING_END });
  }
};
