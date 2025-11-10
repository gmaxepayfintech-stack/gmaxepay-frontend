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

// Helper function to check if error is token expiration
const isTokenExpiredError = (error) => {
  const message = error?.response?.data?.message || error?.message || "";
  const status = error?.response?.data?.status || error?.response?.status;
  return (
    status === "BAD_REQUEST" &&
    (message.toLowerCase().includes("token has expired") ||
      message.toLowerCase().includes("data token has expired"))
  );
};

export const loginStatus = (credentials, companyId) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const response = await axios.post(
      `${API_ROUTE}/api/v1/auth/login`,
      credentials,
      {
        headers: {
          "Content-Type": "application/json",
          "x-company-id": companyId,
        },
      }
    );

    const data = response?.data;
    const token = data?.data?.token;
    const { status, loginResponse } = data ?? {};

    // Handle numeric status codes (like 429) or string status
    if (status === "SUCCESS" || status === 200) {
      // Store login token separately (not JWT) - this is used for subsequent steps
      // Only store JWT token after 2FA verification completes
      if (token) {
        secureLocalStorage.setItem("loginToken", token);
      }

      dispatch({
        type: LOGIN_SUCCESS,
        payload: data,
        loginResponse,
        status,
      });
    } else {
      // Check for token expiration
      if (status === "BAD_REQUEST" && data?.message?.toLowerCase().includes("token has expired")) {
        secureLocalStorage.removeItem("loginToken");
        secureLocalStorage.removeItem("userToken");
        dispatch({
          type: LOGIN_FAILURE,
          payload: {
            message: data?.message || "Data token has expired! Please request a new one.",
            isTokenExpired: true,
          },
        });
      } else {
        // Handle error responses with status codes or error messages
        const errorMessage = data?.message || (status && status !== "SUCCESS" && status !== 200 ? `Error: ${status}` : commonError);
        dispatch({
          type: LOGIN_FAILURE,
          payload: errorMessage,
        });
      }
    }
  } catch (error) {
    // Check for token expiration error
    if (isTokenExpiredError(error)) {
      secureLocalStorage.removeItem("loginToken");
      secureLocalStorage.removeItem("userToken");
      dispatch({
        type: LOGIN_FAILURE,
        payload: {
          message: error?.response?.data?.message || "Data token has expired! Please request a new one.",
          isTokenExpired: true,
        },
      });
    } else {
      // Handle HTTP errors (like 429, 400, 500, etc.)
      const errorMessage = error?.response?.data?.message || error?.message || commonError;
      dispatch({
        type: LOGIN_FAILURE,
        payload: errorMessage,
      });
    }
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const verificationStatus = (credentials, companyId) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  // Use loginToken (from step 1) for OTP verification, not JWT token
  const authToken = secureLocalStorage.getItem("loginToken");

  try {
    const response = await axios.post(
      `${API_ROUTE}/api/v1/auth/verify-mobile-otp`,
      credentials,
      {
        headers: {
          "Content-Type": "application/json",
          token: `${authToken}`,
          "x-company-id": companyId,
        },
      }
    );

    const data = response?.data;
    const { status, verificationcode } = data ?? {};

    // Handle numeric status codes (like 429) or string status
    if (status === "SUCCESS" || status === 200) {
      // Update login token if new one is provided (for subsequent steps)
      // Don't store JWT here - JWT is only stored after 2FA verification
      const token = data?.data?.token || data?.token;
      if (token) {
        secureLocalStorage.setItem("loginToken", token);
      }

      dispatch({
        type: VERIFICATION_OTP_SUCCESS,
        payload: data,
        verificationcode,
        status,
      });
    } else {
      // Check for token expiration
      if (status === "BAD_REQUEST" && data?.message?.toLowerCase().includes("token has expired")) {
        secureLocalStorage.removeItem("loginToken");
        secureLocalStorage.removeItem("userToken");
        dispatch({
          type: VERIFICATION_OTP_FAILURE,
          payload: {
            message: data?.message || "Data token has expired! Please request a new one.",
            isTokenExpired: true,
          },
        });
      } else {
        // Handle error responses with status codes or error messages
        const errorMessage = data?.message || (status && status !== "SUCCESS" && status !== 200 ? `Error: ${status}` : commonError);
        dispatch({
          type: VERIFICATION_OTP_FAILURE,
          payload: errorMessage,
        });
      }
    }
  } catch (error) {
    // Check for token expiration error
    if (isTokenExpiredError(error)) {
      secureLocalStorage.removeItem("loginToken");
      secureLocalStorage.removeItem("userToken");
      dispatch({
        type: VERIFICATION_OTP_FAILURE,
        payload: {
          message: error?.response?.data?.message || "Data token has expired! Please request a new one.",
          isTokenExpired: true,
        },
      });
    } else {
      // Handle HTTP errors (like 429, 400, 500, etc.)
      const errorMessage = error?.response?.data?.message || error?.message || commonError;
      dispatch({
        type: VERIFICATION_OTP_FAILURE,
        payload: errorMessage,
      });
    }
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const authOtp = (payload, companyId) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  // Use loginToken (from step 1) for 2FA verification, not JWT token
  const authToken = secureLocalStorage.getItem("loginToken");

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
          "x-company-id": companyId,
        },
      }
    );

    const data = response?.data;
    const { status, twoFactorAuth } = data ?? {};

    // Handle numeric status codes (like 429) or string status
    if (status === "SUCCESS" || status === 200) {
      // This is the final step - store JWT token (accessToken) after 2FA verification
      // Remove login token as it's no longer needed
      const accessToken = data?.data?.accessToken || data?.accessToken;
      const token = data?.data?.token || data?.token;
      
      if (accessToken) {
        // Store JWT token - this is the final authentication token
        secureLocalStorage.setItem("userToken", accessToken);
        // Remove login token as it's no longer needed
        secureLocalStorage.removeItem("loginToken");
      } else if (token) {
        // Fallback: if accessToken not available, use token
        secureLocalStorage.setItem("userToken", token);
        secureLocalStorage.removeItem("loginToken");
      }

      dispatch({
        type: TWOFACTOR_AUTH_SUCCESS,
        payload: data,
        twoFactorAuth,
        status,
      });
    } else {
      // Check for token expiration
      if (status === "BAD_REQUEST" && data?.message?.toLowerCase().includes("token has expired")) {
        secureLocalStorage.removeItem("loginToken");
        secureLocalStorage.removeItem("userToken");
        dispatch({
          type: TWOFACTOR_AUTH_FAILURE,
          payload: {
            message: data?.message || "Data token has expired! Please request a new one.",
            isTokenExpired: true,
          },
        });
      } else {
        // Handle error responses with status codes or error messages
        const errorMessage = data?.message || (status && status !== "SUCCESS" && status !== 200 ? `Error: ${status}` : commonError);
        dispatch({
          type: TWOFACTOR_AUTH_FAILURE,
          payload: errorMessage,
        });
      }
    }
  } catch (error) {
    // Check for token expiration error
    if (isTokenExpiredError(error)) {
      secureLocalStorage.removeItem("loginToken");
      secureLocalStorage.removeItem("userToken");
      dispatch({
        type: TWOFACTOR_AUTH_FAILURE,
        payload: {
          message: error?.response?.data?.message || "Data token has expired! Please request a new one.",
          isTokenExpired: true,
        },
      });
    } else {
      // Handle HTTP errors (like 429, 400, 500, etc.)
      const errorMessage = error?.response?.data?.message || error?.message || commonError;
      dispatch({
        type: TWOFACTOR_AUTH_FAILURE,
        payload: errorMessage,
      });
    }
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const rescendOtp = (companyId) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  // Use loginToken (from step 1) for resend OTP, not JWT token
  const authToken = secureLocalStorage.getItem("loginToken");

  try {
    const response = await axios.post(
      `${API_ROUTE}/api/v1/auth/resend-otp`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          token: `${authToken}`,
          "x-company-id": companyId,
        },
      }
    );

    const data = response?.data;
    const { status, resendStatus } = data ?? {};

    if (status === "SUCCESS") {
      // Update login token if new one is provided
      if (data?.token) {
        secureLocalStorage.setItem("loginToken", data.token);
      }

      dispatch({
        type: RESECEND_OTP_SUCCESS,
        payload: data,
        resendStatus,
        status,
      });
    } else {
      // Check for token expiration
      if (status === "BAD_REQUEST" && data?.message?.toLowerCase().includes("token has expired")) {
        secureLocalStorage.removeItem("loginToken");
        secureLocalStorage.removeItem("userToken");
        dispatch({
          type: RESECEND_OTP_FAILURE,
          payload: {
            message: data?.message || "Data token has expired! Please request a new one.",
            isTokenExpired: true,
          },
        });
      } else {
        dispatch({
          type: RESECEND_OTP_FAILURE,
          payload: data?.message ?? commonError,
        });
      }
    }
  } catch (error) {
    // Check for token expiration error
    if (isTokenExpiredError(error)) {
      secureLocalStorage.removeItem("loginToken");
      secureLocalStorage.removeItem("userToken");
      dispatch({
        type: RESECEND_OTP_FAILURE,
        payload: {
          message: error?.response?.data?.message || "Data token has expired! Please request a new one.",
          isTokenExpired: true,
        },
      });
    } else {
      dispatch({
        type: RESECEND_OTP_FAILURE,
        payload: error?.response?.data?.message ?? error.message,
      });
    }
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const resetPassword = (credentials, companyId) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  // Use loginToken (from step 1) for reset password, not JWT token
  const authToken = secureLocalStorage.getItem("loginToken");

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
          "x-company-id": companyId,
        },
      }
    );

    const data = response?.data;
    const { status } = data ?? {};

    if (status === "SUCCESS") {
      // After password reset, check if we get JWT token or continue with login token
      const accessToken = data?.data?.accessToken || data?.accessToken;
      const token = data?.data?.token || data?.token;
      
      // If accessToken (JWT) is provided, store it and remove login token
      // Otherwise, update login token for next steps
      if (accessToken) {
        secureLocalStorage.setItem("userToken", accessToken);
        secureLocalStorage.removeItem("loginToken");
      } else if (token) {
        secureLocalStorage.setItem("loginToken", token);
      }

      dispatch({
        type: RESET_PASSWORD_SUCCESS,
        payload: data,
        status,
      });
    } else {
      // Check for token expiration
      if (status === "BAD_REQUEST" && data?.message?.toLowerCase().includes("token has expired")) {
        secureLocalStorage.removeItem("loginToken");
        secureLocalStorage.removeItem("userToken");
        dispatch({
          type: RESET_PASSWORD_FAILURE,
          payload: {
            message: data?.message || "Data token has expired! Please request a new one.",
            isTokenExpired: true,
          },
        });
      } else {
        dispatch({
          type: RESET_PASSWORD_FAILURE,
          payload: data?.message ?? commonError,
        });
      }
    }
  } catch (error) {
    // Check for token expiration error
    if (isTokenExpiredError(error)) {
      secureLocalStorage.removeItem("loginToken");
      secureLocalStorage.removeItem("userToken");
      dispatch({
        type: RESET_PASSWORD_FAILURE,
        payload: {
          message: error?.response?.data?.message || "Data token has expired! Please request a new one.",
          isTokenExpired: true,
        },
      });
    } else {
      dispatch({
        type: RESET_PASSWORD_FAILURE,
        payload: error?.response?.data?.message ?? error.message,
      });
    }
  } finally {
    dispatch({ type: LOADING_END });
  }
};