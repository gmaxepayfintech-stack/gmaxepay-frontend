import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_ROUTE } from "../../data/env";
import {
  CLEAR_ONBOARDING,
  UPDATE_ONBOARDING_STEP,
  MOBILE_OTP_SENT_SUCCESS,
  MOBILE_OTP_SENT_FAILURE,
  SMS_RESEND_OTP_SUCCESS,
  SMS_RESEND_OTP_FAILURE
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
    console.log("response for ip api", response?.data);

    const { data: otpStatus, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: MOBILE_OTP_SENT_SUCCESS,
        payload: { otpStatus, status, message },
      });
    } else {
      dispatch({
        type: MOBILE_OTP_SENT_FAILURE,
        payload: response?.data?.message ?? commonError,
      });
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
    console.log("response for ip api", response?.data);

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




