import axios from "axios";
import api from "../../utils/axiosInstance";
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
  VERIFY_FORGET_PASSWORD_FAILURE,
  VERIFY_FORGET_PASSWORD_SUCCESS,
  FORGET_PASSWORD_SUCCESS,
  FORGET_PASSWORD_FAILURE,
  VERIFY_MPIN_SUCCESS,
  VERIFY_MPIN_FAILURE,
  SET_MPIN_SUCCESS,
  SET_MPIN_FAILURE,
  LOGOUT_SUCCESS,
  LOGOUT_FAILURE,
  FORGET_MPIN_SUCCESS,
  FORGET_MPIN_FAILURE,
  VERIFY_MPIN_OTP_SUCCESS,
  VERIFY_MPIN_OTP_FAILURE,
  GET_NOTIFICATIONS_SUCCESS,
  GET_NOTIFICATIONS_FAILURE,
  MARK_NOTIFICATION_READ_SUCCESS,
  MARK_NOTIFICATION_READ_FAILURE,
  MARK_NOTIFICATION_READ_SUCCESS_COMPANY,
  GET_NOTIFICATIONS_SUCCESS_COMPANY,
  GET_NOTIFICATIONS_FAILURE_COMPANY,
} from "../actionType/loginActionType";
import { API_ROUTE } from "../../data/env";
import { LOADING_START, LOADING_END } from "../actionType/loadingActionType";

const commonError = "Something went wrong!";

// Helper function to check if error is token expiration
const isTokenExpiredError = (error) => {
  const message = error?.response?.data?.message || error?.message || "";
  const status = error?.response?.data?.status || error?.response?.status;
  const httpStatus = error?.response?.status;
  return (
    (status === "BAD_REQUEST" || httpStatus === 401) &&
    (message.toLowerCase().includes("token has expired") ||
      message.toLowerCase().includes("data token has expired") ||
      message.toLowerCase().includes("unauthorized") ||
      message.toLowerCase().includes("jwt expired") ||
      httpStatus === 401)
  );
};

// Helper function to check if error is access token expiration (JWT expired)
const isAccessTokenExpiredError = (error) => {
  const httpStatus = error?.response?.status;
  const message = error?.response?.data?.message || error?.message || "";
  return (
    httpStatus === 401 &&
    (message.toLowerCase().includes("jwt expired") ||
      message.toLowerCase().includes("token expired") ||
      message.toLowerCase().includes("unauthorized") ||
      !message) // If 401 without specific message, assume token expired
  );
};

// Function to refresh access token using refresh token
export const refreshAccessToken = (companyId) => async (dispatch) => {
  const refreshToken = secureLocalStorage.getItem("refreshToken");

  if (!refreshToken) {
    // No refresh token available, user needs to login again
    secureLocalStorage.removeItem("userToken");
    secureLocalStorage.removeItem("refreshToken");
    secureLocalStorage.removeItem("userData");
    return null;
  }

  try {
    const response = await axios.post(
      `${API_ROUTE}/api/v1/auth/refresh-token`,
      { refreshToken },
      {
        headers: {
          "Content-Type": "application/json",
          "x-company-id": companyId,
        },
      }
    );

    const data = response?.data;
    const { status } = data ?? {};

    if (status === "SUCCESS" || status === 200) {
      // Get new tokens from response
      const accessToken = data?.data?.accessToken || data?.accessToken;
      const newRefreshToken = data?.data?.refreshToken || data?.refreshToken;
      const token = data?.data?.token || data?.token;
      const userData = data?.data?.user || data?.user;

      // Store new access token
      if (accessToken) {
        secureLocalStorage.setItem("userToken", accessToken);
      } else if (token) {
        secureLocalStorage.setItem("userToken", token);
      }

      // Update refresh token if new one is provided
      if (newRefreshToken) {
        secureLocalStorage.setItem("refreshToken", newRefreshToken);
      }

      // Update userData if provided
      if (userData) {
        secureLocalStorage.setItem("userData", JSON.stringify(userData));
      }

      return accessToken || token;
    } else {
      // Refresh token is invalid or expired
      secureLocalStorage.removeItem("userToken");
      secureLocalStorage.removeItem("refreshToken");
      secureLocalStorage.removeItem("userData");
      return null;
    }
  } catch (error) {
    // Refresh token is invalid or expired
    secureLocalStorage.removeItem("userToken");
    secureLocalStorage.removeItem("refreshToken");
    secureLocalStorage.removeItem("userData");
    return null;
  }
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
      if (status === "BAD_REQUEST" && data?.message?.toLowerCase().includes("token has expired! please login again")) {
        secureLocalStorage.removeItem("loginToken");
        secureLocalStorage.removeItem("userToken");
        secureLocalStorage.removeItem("refreshToken");
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
      secureLocalStorage.removeItem("refreshToken");
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
        secureLocalStorage.removeItem("refreshToken");
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
      secureLocalStorage.removeItem("refreshToken");
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
      const refreshToken = data?.data?.refreshToken || data?.refreshToken;
      const token = data?.data?.token || data?.token;
      const userData = data?.data?.user || data?.user;

      if (accessToken) {
        // Store JWT token - this is the final authentication token (expires in 5 minutes)
        secureLocalStorage.setItem("userToken", accessToken);
        // Store refresh token - valid for 25 minutes (total session 30 minutes)
        if (refreshToken) {
          secureLocalStorage.setItem("refreshToken", refreshToken);
        }
        // Store userData as JSON string if it exists
        if (userData) {
          secureLocalStorage.setItem("userData", JSON.stringify(userData));
        }
        // Remove login token as it's no longer needed
        secureLocalStorage.removeItem("loginToken");
      } else if (token) {
        // Fallback: if accessToken not available, use token
        secureLocalStorage.setItem("userToken", token);
        // Store refresh token if available
        if (refreshToken) {
          secureLocalStorage.setItem("refreshToken", refreshToken);
        }
        // Store userData as JSON string if it exists
        if (userData) {
          secureLocalStorage.setItem("userData", JSON.stringify(userData));
        }
        // Remove login token as it's no longer needed
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
        secureLocalStorage.removeItem("refreshToken");
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
    // Check for access token expiration (JWT expired) - try to refresh
    if (isAccessTokenExpiredError(error)) {
      // Try to refresh access token using refresh token
      const newAccessToken = await dispatch(refreshAccessToken(companyId));
      if (newAccessToken) {
        // Retry the original request with new token
        try {
          const retryResponse = await axios.post(
            `${API_ROUTE}/api/v1/auth/handle-2fa`,
            payload,
            {
              headers: {
                "Content-Type": "application/json",
                token: `${newAccessToken}`,
                "x-company-id": companyId,
              },
            }
          );
          const retryData = retryResponse?.data;
          const { status: retryStatus, twoFactorAuth: retryTwoFactorAuth } = retryData ?? {};
          if (retryStatus === "SUCCESS" || retryStatus === 200) {
            dispatch({
              type: TWOFACTOR_AUTH_SUCCESS,
              payload: retryData,
              twoFactorAuth: retryTwoFactorAuth,
              status: retryStatus,
            });
            return;
          }
        } catch (retryError) {
          // Retry failed, continue to error handling
        }
      }
      // Refresh failed or retry failed - clear tokens and show error
      secureLocalStorage.removeItem("loginToken");
      secureLocalStorage.removeItem("userToken");
      secureLocalStorage.removeItem("refreshToken");
      dispatch({
        type: TWOFACTOR_AUTH_FAILURE,
        payload: {
          message: "Session expired. Please login again.",
          isTokenExpired: true,
        },
      });
    } else if (isTokenExpiredError(error)) {
      // Check for login token expiration
      secureLocalStorage.removeItem("loginToken");
      secureLocalStorage.removeItem("userToken");
      secureLocalStorage.removeItem("refreshToken");
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
        secureLocalStorage.removeItem("refreshToken");
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
      secureLocalStorage.removeItem("refreshToken");
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
      const refreshToken = data?.data?.refreshToken || data?.refreshToken;
      const token = data?.data?.token || data?.token;

      // If accessToken (JWT) is provided, store it and remove login token
      // Otherwise, update login token for next steps
      if (accessToken) {
        secureLocalStorage.setItem("userToken", accessToken);
        // Store refresh token if available
        if (refreshToken) {
          secureLocalStorage.setItem("refreshToken", refreshToken);
        }
        secureLocalStorage.removeItem("loginToken");
      } else if (token) {
        secureLocalStorage.setItem("loginToken", token);
        // Store refresh token if available (even if we're using loginToken)
        if (refreshToken) {
          secureLocalStorage.setItem("refreshToken", refreshToken);
        }
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
        secureLocalStorage.removeItem("refreshToken");
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
      secureLocalStorage.removeItem("refreshToken");
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

export const sendForgetPasswordOTP = (credentials, companyId) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    // Get User-Agent from browser
    const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";

    const response = await axios.post(
      `${API_ROUTE}/api/v1/auth/send-otp-temp`,
      credentials,
      {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": userAgent,
          "x-company-id": companyId,
        },
      }
    );

    const data = response?.data;
    const { status } = data ?? {};

    if (status === "SUCCESS") {
      // After password reset, check if we get JWT token or continue with login token
      const accessToken = data?.data?.accessToken || data?.accessToken;
      const refreshToken = data?.data?.refreshToken || data?.refreshToken;
      const token = data?.data?.token || data?.token;

      // If accessToken (JWT) is provided, store it and remove login token
      // Otherwise, update login token for next steps
      if (accessToken) {
        secureLocalStorage.setItem("userToken", accessToken);
        // Store refresh token if available
        if (refreshToken) {
          secureLocalStorage.setItem("refreshToken", refreshToken);
        }
        secureLocalStorage.removeItem("loginToken");
      } else if (token) {
        secureLocalStorage.setItem("loginToken", token);
        // Store refresh token if available (even if we're using loginToken)
        if (refreshToken) {
          secureLocalStorage.setItem("refreshToken", refreshToken);
        }
      }

      dispatch({
        type: FORGET_PASSWORD_SUCCESS,
        payload: data,
        status,
      });
    } else {
      // Check for token expiration
      if (status === "BAD_REQUEST" && data?.message?.toLowerCase().includes("token has expired")) {
        secureLocalStorage.removeItem("loginToken");
        secureLocalStorage.removeItem("userToken");
        secureLocalStorage.removeItem("refreshToken");
        dispatch({
          type: RESET_PASSWORD_FAILURE,
          payload: {
            message: data?.message || "Data token has expired! Please request a new one.",
            isTokenExpired: true,
          },
        });
      } else {
        dispatch({
          type: FORGET_PASSWORD_FAILURE,
          payload: data?.message ?? commonError,
        });
      }
    }
  } catch (error) {
    // Check for token expiration error
    if (isTokenExpiredError(error)) {
      secureLocalStorage.removeItem("loginToken");
      secureLocalStorage.removeItem("userToken");
      secureLocalStorage.removeItem("refreshToken");
      dispatch({
        type: RESET_PASSWORD_FAILURE,
        payload: {
          message: error?.response?.data?.message || "Data token has expired! Please request a new one.",
          isTokenExpired: true,
        },
      });
    } else {
      dispatch({
        type: FORGET_PASSWORD_FAILURE,
        payload: error?.response?.data?.message ?? error.message,
      });
    }
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const verifyForgetPassword = (credentials, companyId) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  // Use loginToken (from step 1) for reset password, not JWT token
  const authToken = secureLocalStorage.getItem("loginToken");

  try {
    if (!authToken) {
      dispatch({
        type: VERIFY_FORGET_PASSWORD_FAILURE,
        payload: "Authentication token is missing. Please try again.",
      });
      return;
    }

    // Get User-Agent from browser
    const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";

    const response = await axios.post(
      `${API_ROUTE}/api/v1/auth/verify-otp-temp`,
      credentials,
      {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": userAgent,
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
      const refreshToken = data?.data?.refreshToken || data?.refreshToken;
      const token = data?.data?.token || data?.token;

      // If accessToken (JWT) is provided, store it and remove login token
      // Otherwise, update login token for next steps
      if (accessToken) {
        secureLocalStorage.setItem("userToken", accessToken);
        // Store refresh token if available
        if (refreshToken) {
          secureLocalStorage.setItem("refreshToken", refreshToken);
        }
        secureLocalStorage.removeItem("loginToken");
      } else if (token) {
        secureLocalStorage.setItem("loginToken", token);
        // Store refresh token if available (even if we're using loginToken)
        if (refreshToken) {
          secureLocalStorage.setItem("refreshToken", refreshToken);
        }
      }

      dispatch({
        type: VERIFY_FORGET_PASSWORD_SUCCESS,
        payload: data,
        status,
      });
    } else {
      // Check for token expiration
      if (status === "BAD_REQUEST" && data?.message?.toLowerCase().includes("token has expired")) {
        secureLocalStorage.removeItem("loginToken");
        secureLocalStorage.removeItem("userToken");
        secureLocalStorage.removeItem("refreshToken");
        dispatch({
          type: RESET_PASSWORD_FAILURE,
          payload: {
            message: data?.message || "Data token has expired! Please request a new one.",
            isTokenExpired: true,
          },
        });
      } else {
        dispatch({
          type: VERIFY_FORGET_PASSWORD_FAILURE,
          payload: data?.message ?? commonError,
        });
      }
    }
  } catch (error) {
    // Check for token expiration error
    if (isTokenExpiredError(error)) {
      secureLocalStorage.removeItem("loginToken");
      secureLocalStorage.removeItem("userToken");
      secureLocalStorage.removeItem("refreshToken");
      dispatch({
        type: RESET_PASSWORD_FAILURE,
        payload: {
          message: error?.response?.data?.message || "Data token has expired! Please request a new one.",
          isTokenExpired: true,
        },
      });
    } else {
      dispatch({
        type: VERIFY_FORGET_PASSWORD_FAILURE,
        payload: error?.response?.data?.message ?? error.message,
      });
    }
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// Verify MPIN action
export const verifyMPIN = (credentials, companyId) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  const authToken = secureLocalStorage.getItem("loginToken");

  try {
    const response = await axios.post(
      `${API_ROUTE}/api/v1/auth/verify-mpin`,
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

    if (status === "SUCCESS" || status === 200) {
      const token = data?.data?.token || data?.token;
      if (token) {
        secureLocalStorage.setItem("loginToken", token);
      }

      dispatch({
        type: VERIFY_MPIN_SUCCESS,
        payload: data,
        status,
      });
    } else {
      if (status === "BAD_REQUEST" && data?.message?.toLowerCase().includes("token has expired")) {
        secureLocalStorage.removeItem("loginToken");
        secureLocalStorage.removeItem("userToken");
        secureLocalStorage.removeItem("refreshToken");
        dispatch({
          type: VERIFY_MPIN_FAILURE,
          payload: {
            message: data?.message || "Data token has expired! Please request a new one.",
            isTokenExpired: true,
          },
        });
      } else {
        const errorMessage = data?.message || (status && status !== "SUCCESS" && status !== 200 ? `Error: ${status}` : commonError);
        dispatch({
          type: VERIFY_MPIN_FAILURE,
          payload: errorMessage,
        });
      }
    }
  } catch (error) {
    if (isTokenExpiredError(error)) {
      secureLocalStorage.removeItem("loginToken");
      secureLocalStorage.removeItem("userToken");
      secureLocalStorage.removeItem("refreshToken");
      dispatch({
        type: VERIFY_MPIN_FAILURE,
        payload: {
          message: error?.response?.data?.message || "Data token has expired! Please request a new one.",
          isTokenExpired: true,
        },
      });
    } else {
      dispatch({
        type: VERIFY_MPIN_FAILURE,
        payload: error?.response?.data?.message ?? error.message,
      });
    }
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// Set MPIN action
export const setMPIN = (credentials, companyId) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  const authToken = secureLocalStorage.getItem("loginToken");

  try {
    const response = await axios.post(
      `${API_ROUTE}/api/v1/auth/set-mpin`,
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

    if (status === "SUCCESS" || status === 200) {
      const token = data?.data?.token || data?.token;
      if (token) {
        secureLocalStorage.setItem("loginToken", token);
      }

      dispatch({
        type: SET_MPIN_SUCCESS,
        payload: data,
        status,
      });
    } else {
      if (status === "BAD_REQUEST" && data?.message?.toLowerCase().includes("token has expired")) {
        secureLocalStorage.removeItem("loginToken");
        secureLocalStorage.removeItem("userToken");
        secureLocalStorage.removeItem("refreshToken");
        dispatch({
          type: SET_MPIN_FAILURE,
          payload: {
            message: data?.message || "Data token has expired! Please request a new one.",
            isTokenExpired: true,
          },
        });
      } else {
        const errorMessage = data?.message || (status && status !== "SUCCESS" && status !== 200 ? `Error: ${status}` : commonError);
        dispatch({
          type: SET_MPIN_FAILURE,
          payload: errorMessage,
        });
      }
    }
  } catch (error) {
    if (isTokenExpiredError(error)) {
      secureLocalStorage.removeItem("loginToken");
      secureLocalStorage.removeItem("userToken");
      secureLocalStorage.removeItem("refreshToken");
      dispatch({
        type: SET_MPIN_FAILURE,
        payload: {
          message: error?.response?.data?.message || "Data token has expired! Please request a new one.",
          isTokenExpired: true,
        },
      });
    } else {
      dispatch({
        type: SET_MPIN_FAILURE,
        payload: error?.response?.data?.message ?? error.message,
      });
    }
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const logOut = (credentials, companyId) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  // Resolve auth token and company id for logout request
  const authToken =
    secureLocalStorage.getItem("userToken") ||
    secureLocalStorage.getItem("loginToken");
  const storedCompanyId = secureLocalStorage.getItem("companyId");
  const finalCompanyId = companyId || storedCompanyId || "";

  try {
    const response = await axios.post(
      `${API_ROUTE}/api/v1/auth/logout`,
      credentials,
      {
        headers: {
          "Content-Type": "application/json",
          // Backend expects JWT in Bearer format
          Authorization: authToken ? `Bearer ${authToken}` : "",
          "x-company-id": finalCompanyId,
        },
      }
    );

    const data = response?.data;
    const { status } = data ?? {};
    const message = data?.message || "";
    const normalizedMessage = message.toLowerCase();

    if (status === "SUCCESS" || status === 200) {
      // On successful logout, clear all tokens and user data
      secureLocalStorage.removeItem("loginToken");
      secureLocalStorage.removeItem("userToken");
      secureLocalStorage.removeItem("refreshToken");
      secureLocalStorage.removeItem("userData");
      secureLocalStorage.removeItem("permissions");
      secureLocalStorage.removeItem("onboardingSteps");
      secureLocalStorage.removeItem("onboardingToken");
      secureLocalStorage.removeItem("companyId");
      secureLocalStorage.removeItem("selectedCompany");
      // Also clear any auth-related items from regular localStorage
      try {
        localStorage.removeItem("auth");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } catch (e) {
        // Ignore localStorage errors
      }

      dispatch({
        type: LOGOUT_SUCCESS,
        payload: data,
        status,
      });
    } else if (
      status === "UNAUTHORIZED" ||
      status === 401 ||
      normalizedMessage.includes("token missing or invalid")
    ) {
      // Treat unauthorized / missing/invalid token as a successful logout from UI perspective
      secureLocalStorage.removeItem("loginToken");
      secureLocalStorage.removeItem("userToken");
      secureLocalStorage.removeItem("refreshToken");
      secureLocalStorage.removeItem("userData");
      secureLocalStorage.removeItem("permissions");
      secureLocalStorage.removeItem("onboardingSteps");
      secureLocalStorage.removeItem("onboardingToken");
      secureLocalStorage.removeItem("companyId");
      secureLocalStorage.removeItem("selectedCompany");
      try {
        localStorage.removeItem("auth");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } catch (e) {}

      dispatch({
        type: LOGOUT_SUCCESS,
        payload: {
          status: "SUCCESS",
          message: message || "Logged out successfully!",
          data: data?.data ?? null,
          isTokenExpired: true,
        },
      });
    } else if (
      status === "BAD_REQUEST" &&
      normalizedMessage.includes("token has expired")
    ) {
      // Token explicitly expired
      secureLocalStorage.removeItem("loginToken");
      secureLocalStorage.removeItem("userToken");
      secureLocalStorage.removeItem("refreshToken");
      secureLocalStorage.removeItem("userData");
      dispatch({
        type: LOGOUT_FAILURE,
        payload: {
          message:
            data?.message ||
            "Data token has expired! Please request a new one.",
          isTokenExpired: true,
        },
      });
    } else {
      const errorMessage =
        data?.message ||
        (status && status !== "SUCCESS" && status !== 200
          ? `Error: ${status}`
          : commonError);
      dispatch({
        type: LOGOUT_FAILURE,
        payload: errorMessage,
      });
    }
  } catch (error) {
    const errorStatus = error?.response?.status;
    const errorMessage =
      error?.response?.data?.message || error?.message || "";
    const normalizedErrorMessage = errorMessage.toLowerCase();

    if (
      errorStatus === 401 ||
      errorStatus === 403 ||
      normalizedErrorMessage.includes("token missing or invalid")
    ) {
      // Treat unauthorized / missing/invalid token during logout as success
      secureLocalStorage.removeItem("loginToken");
      secureLocalStorage.removeItem("userToken");
      secureLocalStorage.removeItem("refreshToken");
      secureLocalStorage.removeItem("userData");
      secureLocalStorage.removeItem("permissions");
      secureLocalStorage.removeItem("onboardingSteps");
      secureLocalStorage.removeItem("onboardingToken");
      secureLocalStorage.removeItem("companyId");
      secureLocalStorage.removeItem("selectedCompany");
      try {
        localStorage.removeItem("auth");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } catch (e) {}

      dispatch({
        type: LOGOUT_SUCCESS,
        payload: {
          status: "SUCCESS",
          message: errorMessage || "Logged out successfully!",
          data: null,
          isTokenExpired: true,
        },
      });
    } else if (isTokenExpiredError(error)) {
      secureLocalStorage.removeItem("loginToken");
      secureLocalStorage.removeItem("userToken");
      secureLocalStorage.removeItem("refreshToken");
      secureLocalStorage.removeItem("userData");
      dispatch({
        type: LOGOUT_FAILURE,
        payload: {
          message:
            error?.response?.data?.message ||
            "Data token has expired! Please request a new one.",
          isTokenExpired: true,
        },
      });
    } else {
      dispatch({
        type: LOGOUT_FAILURE,
        payload:
          error?.response?.data?.message ?? error.message ?? commonError,
      });
    }
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const forgotMpinOTP = (credentials, companyId) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  const authToken = secureLocalStorage.getItem("loginToken");

  try {
    const response = await axios.post(
      `${API_ROUTE}/api/v1/auth/forget-mpin-otp`,
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

    if (status === "SUCCESS" || status === 200) {
      const token = data?.data?.token || data?.token;
      if (token) {
        secureLocalStorage.setItem("loginToken", token);
      }

      dispatch({
        type: FORGET_MPIN_SUCCESS,
        payload: data,
        status,
      });
    } else {
      if (status === "BAD_REQUEST" && data?.message?.toLowerCase().includes("token has expired")) {
        secureLocalStorage.removeItem("loginToken");
        secureLocalStorage.removeItem("userToken");
        secureLocalStorage.removeItem("refreshToken");
        dispatch({
          type: FORGET_MPIN_FAILURE,
          payload: {
            message: data?.message || "Data token has expired! Please request a new one.",
            isTokenExpired: true,
          },
        });
      } else {
        const errorMessage = data?.message || (status && status !== "SUCCESS" && status !== 200 ? `Error: ${status}` : commonError);
        dispatch({
          type: FORGET_MPIN_FAILURE,
          payload: errorMessage,
        });
      }
    }
  } catch (error) {
    if (isTokenExpiredError(error)) {
      secureLocalStorage.removeItem("loginToken");
      secureLocalStorage.removeItem("userToken");
      secureLocalStorage.removeItem("refreshToken");
      dispatch({
        type: FORGET_MPIN_FAILURE,
        payload: {
          message: error?.response?.data?.message || "Data token has expired! Please request a new one.",
          isTokenExpired: true,
        },
      });
    } else {
      dispatch({
        type: FORGET_MPIN_FAILURE,
        payload: error?.response?.data?.message ?? error.message,
      });
    }
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const verifyMpinOTP = (credentials, companyId) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  const authToken = secureLocalStorage.getItem("loginToken");

  try {
    const response = await axios.post(
      `${API_ROUTE}/api/v1/auth/verify-forget-mpin-otp`,
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

    if (status === "SUCCESS" || status === 200) {
      const token = data?.data?.token || data?.token;
      if (token) {
        secureLocalStorage.setItem("loginToken", token);
      }

      dispatch({
        type: VERIFY_MPIN_OTP_SUCCESS,
        payload: data,
        status,
      });
    } else {
      if (status === "BAD_REQUEST" && data?.message?.toLowerCase().includes("token has expired")) {
        secureLocalStorage.removeItem("loginToken");
        secureLocalStorage.removeItem("userToken");
        secureLocalStorage.removeItem("refreshToken");
        dispatch({
          type: VERIFY_MPIN_OTP_FAILURE,
          payload: {
            message: data?.message || "Data token has expired! Please request a new one.",
            isTokenExpired: true,
          },
        });
      } else {
        const errorMessage = data?.message || (status && status !== "SUCCESS" && status !== 200 ? `Error: ${status}` : commonError);
        dispatch({
          type: VERIFY_MPIN_OTP_FAILURE,
          payload: errorMessage,
        });
      }
    }
  } catch (error) {
    if (isTokenExpiredError(error)) {
      secureLocalStorage.removeItem("loginToken");
      secureLocalStorage.removeItem("userToken");
      secureLocalStorage.removeItem("refreshToken");
      dispatch({
        type: VERIFY_MPIN_OTP_FAILURE,
        payload: {
          message: error?.response?.data?.message || "Data token has expired! Please request a new one.",
          isTokenExpired: true,
        },
      });
    } else {
      dispatch({
        type: VERIFY_MPIN_OTP_FAILURE,
        payload: error?.response?.data?.message ?? error.message,
      });
    }
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const notificationIconData = () => async (dispatch) => {
  dispatch({ type: LOADING_START });

  const authToken = secureLocalStorage.getItem("userToken") || secureLocalStorage.getItem("loginToken");

  try {
    const response = await api.post(
      "/api/v1/user/notification/getAll",
      {},
    );

    const { status, message, data } = response.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: GET_NOTIFICATIONS_SUCCESS,
        payload: response.data,
      });
      return response.data;
    }

    dispatch({
      type: GET_NOTIFICATIONS_FAILURE,
      payload: { status, message },
    });
  } catch (error) {
    dispatch({
      type: GET_NOTIFICATIONS_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const notificationIconMarksAsRead = () => async (dispatch) => {
  dispatch({ type: LOADING_START });

  const authToken = secureLocalStorage.getItem("userToken") || secureLocalStorage.getItem("loginToken");

  try {
    const response = await api.post(
      "/api/v1/user/notification/markAsRead",
      {},
    );

    const { status, message } = response.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: MARK_NOTIFICATION_READ_SUCCESS,
        payload: response.data,
      });
      return response.data;
    }

    dispatch({
      type: MARK_NOTIFICATION_READ_FAILURE,
      payload: { status, message },
    });
  } catch (error) {
    dispatch({
      type: MARK_NOTIFICATION_READ_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const notificationIconDataCompany = () => async (dispatch) => {
  dispatch({ type: LOADING_START });

  const authToken = secureLocalStorage.getItem("userToken") || secureLocalStorage.getItem("loginToken");

  try {
    const response = await api.post(
      "/api/v1/company/notification/getAll",
      {},
    );

    const { status, message, data } = response.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: GET_NOTIFICATIONS_SUCCESS_COMPANY,
        payload: response.data,
      });
      return response.data;
    }

    dispatch({
      type: GET_NOTIFICATIONS_FAILURE_COMPANY,
      payload: { status, message },
    });
  } catch (error) {
    dispatch({
      type: GET_NOTIFICATIONS_FAILURE_COMPANY,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const notificationIconMarksAsReadCompany = () => async (dispatch) => {
  dispatch({ type: LOADING_START });

  const authToken = secureLocalStorage.getItem("userToken") || secureLocalStorage.getItem("loginToken");

  try {
    const response = await api.post(
      "/api/v1/company/notification/markAsRead",
      {},
    );

    const { status, message } = response.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: MARK_NOTIFICATION_READ_SUCCESS_COMPANY,
        payload: response.data,
      });
      return response.data;
    }

    dispatch({
      type: MARK_NOTIFICATION_READ_FAILURE_COMPANY,
      payload: { status, message },
    });
  } catch (error) {
    dispatch({
      type: MARK_NOTIFICATION_READ_FAILURE_COMPANY,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};