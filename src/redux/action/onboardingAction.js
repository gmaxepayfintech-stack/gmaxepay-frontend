import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_ROUTE } from "../../data/env";
import {
  CLEAR_ONBOARDING,
  UPDATE_ONBOARDING_STEP,
  MOBILE_OTP_SENT_SUCCESS,
  MOBILE_OTP_SENT_FAILURE,
  SMS_RESEND_OTP_SUCCESS,
  SMS_RESEND_OTP_FAILURE,
  SMS_VERIFY_OTP_SUCCESS,
  SMS_VERIFY_OTP_FAILURE,
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

export const MobileOTPResponse  = (values, token) => async (dispatch) => {
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
    } else {
      dispatch({
        type: MOBILE_OTP_SENT_FAILURE,
 payload: {
      status: response?.data?.status ?? "FAILURE",
      message: response?.data?.message ?? commonError,
    },
      });
    }
  } catch (error) {
    dispatch({
      type: MOBILE_OTP_SENT_FAILURE,
      payload: error.response ? error.response.data.message  : error.message,
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const resendOTPResponse  = (values, token) => async (dispatch) => {
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
    } else {
      dispatch({
        type: SMS_RESEND_OTP_FAILURE,
        payload: response?.data?.message ?? commonError,
      });
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

export const verifySmsOtp  = (values, token) => async (dispatch) => {
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
    } else {
      dispatch({
        type: SMS_VERIFY_OTP_FAILURE,
        payload: response?.data?.message ?? commonError,
      });
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



// Helper function to convert data URL to File
const dataURLtoFile = (dataUrl, filename) => {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

// Async thunk for posting profile photo (combined liveness + shop)
export const postProfile = createAsyncThunk(
  'onboarding/postProfile',
  async ({ token, photoDataUrl }, { rejectWithValue }) => {
    try {
      if (!photoDataUrl) {
        return rejectWithValue('Profile image is required');
      }

      const photoFile = dataURLtoFile(photoDataUrl, 'profile-liveness.jpg');
      const formData = new FormData();
      formData.append('photo', photoFile);

      // Force headers requested by backend
      const origin = 'http://localhost:5173';
      const domain = 'localhost';

      const response = await axios.post(
        `${API_ROUTE}/api/v1/company/onboarding/${token}/postProfile`,
        formData,
        {
          headers: {
            Origin: origin,
            'x-company-domain': domain,
          },
        }
      );

      if (response.data.status === 'SUCCESS' || response.data.flag === true) {
        return response.data;
      } else {
        return rejectWithValue(response.data.message || 'Failed to post profile');
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Failed to post profile'
      );
    }
  }
);

