import axios from "axios";
import secureLocalStorage from "react-secure-storage";
import { API_ROUTE } from "../../data/env";

import { LOADING_START, LOADING_END } from "../actionType/loadingActionType";
import {
  AEPSTWO_BALANCE_ENQUIRY_FAILURE,
  AEPSTWO_BALANCE_ENQUIRY_SUCCESS,
  AEPSTWO_BANKLIST_FAILURE,
  AEPSTWO_BANKLIST_SUCCESS,
  AEPSTWO_BIOMETRIC_VERIFICATION_FAILURE,
  AEPSTWO_BIOMETRIC_VERIFICATION_SUCCESS,
  AEPSTWO_CASH_WITHDRAWL_FAILURE,
  AEPSTWO_CASH_WITHDRAWL_SUCCESS,
  AEPSTWO_CW_HISTORY_FAILURE,
  AEPSTWO_CW_HISTORY_SUCCESS,
  AEPSTWO_MINI_STATEMENT_FAILURE,
  AEPSTWO_MINI_STATEMENT_SUCCESS,
  AEPSTWO_ONBOARDING_FAILURE,
  AEPSTWO_ONBOARDING_SUCCESS,
  AEPSTWO_RESEND_OTP_FAILURE,
  AEPSTWO_RESEND_OTP_SUCCESS,
  AEPSTWO_RESENT_BANK_LIST_FAILURE,
  AEPSTWO_RESENT_BANK_LIST_SUCCESS,
  AEPSTWO_SEND_OTP_FAILURE,
  AEPSTWO_SEND_OTP_SUCCESS,
  AEPSTWO_STATUS_CHECK_FAILURE,
  AEPSTWO_STATUS_CHECK_SUCCESS,
  AEPSTWO_SUBMIT_OTP_FAILURE,
  AEPSTWO_SUBMIT_OTP_SUCCESS,
  AEPSTWO_TWO_FA_VERIFICATION_FAILURE,
  AEPSTWO_TWO_FA_VERIFICATION_SUCCESS,
} from "../actionType/aepsTwoActionType";
import { AEPS_RESENT_BANK_LIST_SUCCESS } from "../actionType/aepsActionType";

const commonError = "Something went wrong!";

export const aepsTwoStatusCheck = () => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/aeps2/onboarding-status`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: aepsStatus, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: AEPSTWO_STATUS_CHECK_SUCCESS,
        payload: { aepsStatus, status, message },
      });
      return { aepsStatus, status, message };
    } else {
      dispatch({
        type: AEPSTWO_STATUS_CHECK_FAILURE,
        payload: {
          status: response?.data?.status ?? "FAILURE",
          message: response?.data?.message ?? commonError,
        },
      });
      return {
        status: response?.data?.status ?? "FAILURE",
        message: response?.data?.message ?? commonError,
      };
    }
  } catch (error) {
    const errorMessage = error.response
      ? error.response.data.message
      : error.message;
    dispatch({
      type: AEPSTWO_STATUS_CHECK_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const aepsOnboarding = () => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/aeps2/onboarding`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: onBoarding, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: AEPSTWO_ONBOARDING_SUCCESS,
        payload: { onBoarding, status, message },
      });
      return { onBoarding, status, message };
    } else {
      dispatch({
        type: AEPSTWO_ONBOARDING_FAILURE,
        payload: {
          status: response?.data?.status ?? "FAILURE",
          message: response?.data?.message ?? commonError,
        },
      });
      return {
        status: response?.data?.status ?? "FAILURE",
        message: response?.data?.message ?? commonError,
      };
    }
  } catch (error) {
    const errorMessage = error.response
      ? error.response.data.message
      : error.message;
    dispatch({
      type: AEPSTWO_ONBOARDING_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const aepsTwoOtp = () => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const apiUrl = `${API_ROUTE}/api/v1/user/aeps2/send-ekyc-otp`;

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

    const { data: otpStatus, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: AEPSTWO_SEND_OTP_SUCCESS,
        payload: { otpStatus, status, message },
      });
      return { otpStatus, status, message };
    } else {
      dispatch({
        type: AEPSTWO_SEND_OTP_FAILURE,
        payload: {
          status: response?.data?.status ?? "FAILURE",
          message: response?.data?.message ?? commonError,
        },
      });
      return {
        status: response?.data?.status ?? "FAILURE",
        message: response?.data?.message ?? commonError,
      };
    }
  } catch (error) {
    const errorMessage = error.response
      ? error.response.data.message
      : error.message;
    dispatch({
      type: AEPSTWO_SEND_OTP_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const aepsTwoRescendOTP = () => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/aeps2/send-ekyc-otp`,
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
        type: AEPSTWO_RESEND_OTP_SUCCESS,
        payload: { rescendOtp, status, message },
      });
      return { rescendOtp, status, message };
    } else {
      dispatch({
        type: AEPSTWO_RESEND_OTP_FAILURE,
        payload: {
          status: response?.data?.status ?? "FAILURE",
          message: response?.data?.message ?? commonError,
        },
      });
      return {
        status: response?.data?.status ?? "FAILURE",
        message: response?.data?.message ?? commonError,
      };
    }
  } catch (error) {
    const errorMessage = error.response
      ? error.response.data.message
      : error.message;
    dispatch({
      type: AEPSTWO_RESEND_OTP_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const aepsTwoSubmitOTP = (values) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/aeps2/validate-ekyc-otp`,
      values,
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
        type: AEPSTWO_SUBMIT_OTP_SUCCESS,
        payload: { submitOtp, status, message },
      });
      return { submitOtp, status, message };
    } else {
      dispatch({
        type: AEPSTWO_SUBMIT_OTP_FAILURE,
        payload: {
          status: response?.data?.status ?? "FAILURE",
          message: response?.data?.message ?? commonError,
        },
      });
      return {
        status: response?.data?.status ?? "FAILURE",
        message: response?.data?.message ?? commonError,
      };
    }
  } catch (error) {
    const errorMessage = error.response
      ? error.response.data.message
      : error.message;
    dispatch({
      type: AEPSTWO_SUBMIT_OTP_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const aepsTwoBiometricSubmit = (values) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/aeps2/ekyc-submit`,
      values,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: biometricVerification, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: AEPSTWO_BIOMETRIC_VERIFICATION_SUCCESS,
        payload: { biometricVerification, status, message },
      });
      return { biometricVerification, status, message };
    } else {
      dispatch({
        type: AEPSTWO_BIOMETRIC_VERIFICATION_FAILURE,
        payload: {
          status: response?.data?.status ?? "FAILURE",
          message: response?.data?.message ?? commonError,
        },
      });
      return {
        status: response?.data?.status ?? "FAILURE",
        message: response?.data?.message ?? commonError,
      };
    }
  } catch (error) {
    const errorMessage = error.response
      ? error.response.data.message
      : error.message;
    dispatch({
      type: AEPSTWO_BIOMETRIC_VERIFICATION_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const aepsTwoFAVerification = (values) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/aeps2/daily-authentication`,
      values,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: twoFaVerification, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: AEPSTWO_TWO_FA_VERIFICATION_SUCCESS,
        payload: { twoFaVerification, status, message },
      });
      return { twoFaVerification, status, message };
    } else {
      dispatch({
        type: AEPSTWO_TWO_FA_VERIFICATION_FAILURE,
        payload: {
          status: response?.data?.status ?? "FAILURE",
          message: response?.data?.message ?? commonError,
        },
      });
      return {
        status: response?.data?.status ?? "FAILURE",
        message: response?.data?.message ?? commonError,
      };
    }
  } catch (error) {
    const errorMessage = error.response
      ? error.response.data.message
      : error.message;
    dispatch({
      type: AEPSTWO_TWO_FA_VERIFICATION_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const aepsCashWithdrawl = (values) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/aeps2/cash-withdrawal`,
      values,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: cashWithdrawl, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: AEPSTWO_CASH_WITHDRAWL_SUCCESS,
        payload: { cashWithdrawl, status, message },
      });
      return { cashWithdrawl, status, message };
    } else {
      dispatch({
        type: AEPSTWO_CASH_WITHDRAWL_FAILURE,
        payload: {
          status: response?.data?.status ?? "FAILURE",
          message: response?.data?.message ?? commonError,
        },
      });
      return {
        status: response?.data?.status ?? "FAILURE",
        message: response?.data?.message ?? commonError,
      };
    }
  } catch (error) {
    const errorMessage = error.response
      ? error.response.data.message
      : error.message;
    dispatch({
      type: AEPSTWO_CASH_WITHDRAWL_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const aepsTwoBalanceEnquiry = (values) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/aeps2/balance-enquiry`,
      values,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: balanceEnquiry, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: AEPSTWO_BALANCE_ENQUIRY_SUCCESS,
        payload: { balanceEnquiry, status, message },
      });
      return { balanceEnquiry, status, message };
    } else {
      dispatch({
        type: AEPSTWO_BALANCE_ENQUIRY_FAILURE,
        payload: {
          status: response?.data?.status ?? "FAILURE",
          message: response?.data?.message ?? commonError,
        },
      });
      return {
        status: response?.data?.status ?? "FAILURE",
        message: response?.data?.message ?? commonError,
      };
    }
  } catch (error) {
    const errorMessage = error.response
      ? error.response.data.message
      : error.message;
    dispatch({
      type: AEPSTWO_BALANCE_ENQUIRY_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const aepsTwoMiniStatement = (values) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/aeps2/mini-statement`,
      values,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: miniStatement, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: AEPSTWO_MINI_STATEMENT_SUCCESS,
        payload: { miniStatement, status, message },
      });
      return { miniStatement, status, message };
    } else {
      dispatch({
        type: AEPSTWO_MINI_STATEMENT_FAILURE,
        payload: {
          status: response?.data?.status ?? "FAILURE",
          message: response?.data?.message ?? commonError,
        },
      });
      return {
        status: response?.data?.status ?? "FAILURE",
        message: response?.data?.message ?? commonError,
      };
    }
  } catch (error) {
    const errorMessage = error.response
      ? error.response.data.message
      : error.message;
    dispatch({
      type: AEPSTWO_MINI_STATEMENT_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const aepsTwoBankList = (values) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/aeps2/bank-list`,
      values,
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
        type: AEPSTWO_BANKLIST_SUCCESS,
        payload: { bankList, status, message },
      });
      return { bankList, status, message };
    } else {
      dispatch({
        type: AEPSTWO_BANKLIST_FAILURE,
        payload: {
          status: response?.data?.status ?? "FAILURE",
          message: response?.data?.message ?? commonError,
        },
      });
      return {
        status: response?.data?.status ?? "FAILURE",
        message: response?.data?.message ?? commonError,
      };
    }
  } catch (error) {
    const errorMessage = error.response
      ? error.response.data.message
      : error.message;
    dispatch({
      type: AEPSTWO_BANKLIST_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const aepsTwoRecentBankList = (values) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/aeps2/recent-banks`,
      values,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: bankRecentList, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: AEPSTWO_RESENT_BANK_LIST_SUCCESS,
        payload: { bankRecentList, status, message },
      });
      return { bankRecentList, status, message };
    } else {
      dispatch({
        type: AEPSTWO_RESENT_BANK_LIST_FAILURE,
        payload: {
          status: response?.data?.status ?? "FAILURE",
          message: response?.data?.message ?? commonError,
        },
      });
      return {
        status: response?.data?.status ?? "FAILURE",
        message: response?.data?.message ?? commonError,
      };
    }
  } catch (error) {
    const errorMessage = error.response
      ? error.response.data.message
      : error.message;
    dispatch({
      type: AEPSTWO_RESENT_BANK_LIST_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const getAeps2CwHistory = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
      const authToken = secureLocalStorage.getItem("userToken");

      const requestPayload = {
          query: payload?.query || {},
          customSearch: payload?.customSearch || {},
          options: {
              page: payload?.options?.page || 1,
              paginate: payload?.options?.paginate || 10,
              sort: payload?.options?.sort || { createdAt: -1 },
          },
      };

      const response = await axios.post(
          `${API_ROUTE}/api/v1/admin/reports/aeps2Reports`,
          requestPayload,
          {
              headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${authToken}`,
              },
          }
      );

      const { data: aeps2CwHistory, status, message, total, count, paginator } = response?.data ?? {};
      if (status === "SUCCESS") {
          dispatch({
              type: AEPSTWO_CW_HISTORY_SUCCESS,
              payload: { data: aeps2CwHistory, status, message, total, count, paginator },
          });
          return { data: aeps2CwHistory, status, message, total, count, paginator };
      } else {
          dispatch({
              type: AEPSTWO_CW_HISTORY_FAILURE,
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
          type: AEPSTWO_CW_HISTORY_FAILURE,
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