import axios from "axios";
import secureLocalStorage from "react-secure-storage";
import {
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  VERIFICATION_OTP_SUCCESS,
  VERIFICATION_OTP_FAILURE,
  TWOFACTOR_AUTH_SUCCESS,
  TWOFACTOR_AUTH_FAILURE,
  RESECEND_OTP_SUCCESS,
  RESECEND_OTP_FAILURE,
  RESET_PASSWORD_SUCCESS,
  RESET_PASSWORD_FAILURE,
} from "../actionType/loginActionType";
import { API_ROUTE } from "../../data/env";
import { LOADING_START, LOADING_END } from "../actionType/loadingActionType";

const commonError = "Something went wrong!";

export const loginStatus = (credentials) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const response = await axios.post(
      `${API_ROUTE}/api/v1/auth/login`,
      credentials
    );

    const data = response?.data;
    const token = data?.data?.token;
    const { status, loginResponse } = data ?? {};

    // Handle numeric status codes (like 429) or string status
    if (status === "SUCCESS" || status === 200) {
      if (token) {
        secureLocalStorage.setItem("userToken", token);
      }

      dispatch({
        type: LOGIN_SUCCESS,
        payload: data,
        loginResponse,
        status,
      });
    } else {
      // Handle error responses with status codes or error messages
      const errorMessage = data?.message || (status && status !== "SUCCESS" && status !== 200 ? `Error: ${status}` : commonError);
      dispatch({
        type: LOGIN_FAILURE,
        payload: errorMessage,
      });
    }
  } catch (error) {
    // Handle HTTP errors (like 429, 400, 500, etc.)
    const errorMessage = error?.response?.data?.message || error?.message || commonError;
    dispatch({
      type: LOGIN_FAILURE,
      payload: errorMessage,
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const verificationStatus = (credentials) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  const authToken = secureLocalStorage.getItem("userToken");

  try {
    const response = await axios.post(
      `${API_ROUTE}/api/v1/auth/verify-mobile-otp`,
      credentials,
      {
        headers: {
          "Content-Type": "application/json",
          token: `${authToken}`,
        },
      }
    );

    const data = response?.data;
    const { status, verificationcode } = data ?? {};

    // Handle numeric status codes (like 429) or string status
    if (status === "SUCCESS" || status === 200) {
      // Store token from response - check multiple possible locations
      // Based on API response structure: data.data.token or data.token
      const token = data?.data?.token || data?.token || data?.accessToken || data?.data?.accessToken;
      if (token) {
        secureLocalStorage.setItem("userToken", token);
      }

      dispatch({
        type: VERIFICATION_OTP_SUCCESS,
        payload: data,
        verificationcode,
        status,
      });
    } else {
      // Handle error responses with status codes or error messages
      const errorMessage = data?.message || (status && status !== "SUCCESS" && status !== 200 ? `Error: ${status}` : commonError);
      dispatch({
        type: VERIFICATION_OTP_FAILURE,
        payload: errorMessage,
      });
    }
  } catch (error) {
    // Handle HTTP errors (like 429, 400, 500, etc.)
    const errorMessage = error?.response?.data?.message || error?.message || commonError;
    dispatch({
      type: VERIFICATION_OTP_FAILURE,
      payload: errorMessage,
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const authOtp = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  const authToken = secureLocalStorage.getItem("userToken");

  try {
    // Ensure payload has the otp field
    if (!payload.otp) {
      dispatch({
        type: TWOFACTOR_AUTH_FAILURE,
        payload: "2FA code is missing in request",
      });
      return;
    }

    // Check if token exists
    if (!authToken) {
      dispatch({
        type: TWOFACTOR_AUTH_FAILURE,
        payload: "Authentication token is missing. Please try logging in again.",
      });
      return;
    }
    
    const response = await axios.post(
      `${API_ROUTE}/api/v1/auth/handle-2fa`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          token: `${authToken}`,
        },
      }
    );

    const data = response?.data;
    const { status, twoFactorAuth } = data ?? {};

    // Handle numeric status codes (like 429) or string status
    if (status === "SUCCESS" || status === 200) {
      // Store accessToken if available (from data.data.accessToken or data.accessToken)
      const accessToken = data?.data?.accessToken || data?.accessToken;
      const token = data?.data?.token || data?.token;
      
      if (accessToken) {
        secureLocalStorage.setItem("userToken", accessToken);
      } else if (token) {
        secureLocalStorage.setItem("userToken", token);
      }

      dispatch({
        type: TWOFACTOR_AUTH_SUCCESS,
        payload: data,
        twoFactorAuth,
        status,
      });
    } else {
      // Handle error responses with status codes or error messages
      const errorMessage = data?.message || (status && status !== "SUCCESS" && status !== 200 ? `Error: ${status}` : commonError);
      dispatch({
        type: TWOFACTOR_AUTH_FAILURE,
        payload: errorMessage,
      });
    }
  } catch (error) {
    // Handle HTTP errors (like 429, 400, 500, etc.)
    const errorMessage = error?.response?.data?.message || error?.message || commonError;
    dispatch({
      type: TWOFACTOR_AUTH_FAILURE,
      payload: errorMessage,
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const rescendOtp = () => async (dispatch) => {
  dispatch({ type: LOADING_START });

  const authToken = secureLocalStorage.getItem("userToken");

  try {
    const response = await axios.post(
      `${API_ROUTE}/api/v1/auth/resend-otp`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          token: `${authToken}`,
        },
      }
    );

    const data = response?.data;
    const { status, resendStatus } = data ?? {};

    if (status === "SUCCESS") {
      if (data?.token) {
        secureLocalStorage.setItem("userToken", data.token);
      }

      dispatch({
        type: RESECEND_OTP_SUCCESS,
        payload: data,
        resendStatus,
        status,
      });
    } else {
      dispatch({
        type: RESECEND_OTP_FAILURE,
        payload: data?.message ?? commonError,
      });
    }
  } catch (error) {
    dispatch({
      type: RESECEND_OTP_FAILURE,
      payload: error?.response?.data?.message ?? error.message,
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const resetPassword = (credentials) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  const authToken = secureLocalStorage.getItem("userToken");

  try {
    if (!authToken) {
      dispatch({
        type: RESET_PASSWORD_FAILURE,
        payload: "Authentication token is missing. Please try again.",
      });
      return;
    }

    const response = await axios.post(
      `${API_ROUTE}/api/v1/auth/reset-password`,
      credentials,
      {
        headers: {
          "Content-Type": "application/json",
          token: `${authToken}`,
        },
      }
    );

    const data = response?.data;
    const { status } = data ?? {};

    if (status === "SUCCESS") {
      const token = data?.data?.token || data?.token || data?.accessToken || data?.data?.accessToken;
      if (token) {
        secureLocalStorage.setItem("userToken", token);
      }

      dispatch({
        type: RESET_PASSWORD_SUCCESS,
        payload: data,
        status,
      });
    } else {
      dispatch({
        type: RESET_PASSWORD_FAILURE,
        payload: data?.message ?? commonError,
      });
    }
  } catch (error) {
    dispatch({
      type: RESET_PASSWORD_FAILURE,
      payload: error?.response?.data?.message ?? error.message,
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};
