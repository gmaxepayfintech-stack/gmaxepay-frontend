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

    if (status === "SUCCESS") {
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
      dispatch({
        type: LOGIN_FAILURE,
        payload: data?.message ?? commonError,
      });
    }
  } catch (error) {
    dispatch({
      type: LOGIN_FAILURE,
      payload: error?.response?.data?.message ?? error.message,
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

    if (status === "SUCCESS") {
      if (data?.token) {
        secureLocalStorage.setItem("userToken", data.token);
      }

      dispatch({
        type: VERIFICATION_OTP_SUCCESS,
        payload: data,
        verificationcode,
        status,
      });
    } else {
      dispatch({
        type: VERIFICATION_OTP_FAILURE,
        payload: data?.message ?? commonError,
      });
    }
  } catch (error) {
    dispatch({
      type: VERIFICATION_OTP_FAILURE,
      payload: error?.response?.data?.message ?? error.message,
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const authOtp = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  const authToken = secureLocalStorage.getItem("userToken");

  try {
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
    console.log("data", data);

    const { status, twoFactorAuth } = data ?? {};

    if (status === "SUCCESS") {
      if (data?.token) {
        secureLocalStorage.setItem("userToken", data.token);
      }

      dispatch({
        type: TWOFACTOR_AUTH_SUCCESS,
        payload: data,
        twoFactorAuth,
        status,
      });
    } else {
      dispatch({
        type: TWOFACTOR_AUTH_FAILURE,
        payload: data?.message ?? commonError,
      });
    }
  } catch (error) {
    dispatch({
      type: TWOFACTOR_AUTH_FAILURE,
      payload: error?.response?.data?.message ?? error.message,
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
