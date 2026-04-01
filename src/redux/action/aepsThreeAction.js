import axios from "axios";
import secureLocalStorage from "react-secure-storage";
import { API_ROUTE } from "../../data/env";
import { getLocationAndIP } from "../../util/getLocationAndIP";

import { LOADING_START, LOADING_END } from "../actionType/loadingActionType";
import {
  AEPSTHREE_BALANCE_ENQUIRY_FAILURE,
  AEPSTHREE_BALANCE_ENQUIRY_SUCCESS,
  AEPSTHREE_BANKLIST_FAILURE,
  AEPSTHREE_BANKLIST_SUCCESS,
  AEPSTHREE_BIOMETRIC_VERIFICATION_FAILURE,
  AEPSTHREE_BIOMETRIC_VERIFICATION_SUCCESS,
  AEPSTHREE_CASH_WITHDRAWL_FAILURE,
  AEPSTHREE_CASH_WITHDRAWL_SUCCESS,
  AEPSTHREE_CW_HISTORY_COMPANY_FAILURE,
  AEPSTHREE_CW_HISTORY_COMPANY_SUCCESS,
  AEPSTHREE_CW_HISTORY_FAILURE,
  AEPSTHREE_CW_HISTORY_SUCCESS,
  AEPSTHREE_CW_HISTORY_TRANSACTION_DETAILS_FAILURE,
  AEPSTHREE_CW_HISTORY_TRANSACTION_DETAILS_SUCCESS,
  AEPSTHREE_CW_HISTORY_USERS_FAILURE,
  AEPSTHREE_CW_HISTORY_USERS_SUCCESS,
  AEPSTHREE_MINI_STATEMENT_FAILURE,
  AEPSTHREE_MINI_STATEMENT_SUCCESS,
  AEPSTHREE_ONBOARDING_FAILURE,
  AEPSTHREE_ONBOARDING_SUCCESS,
  AEPSTHREE_RESEND_OTP_FAILURE,
  AEPSTHREE_RESEND_OTP_SUCCESS,
  AEPSTHREE_RESENT_BANK_LIST_FAILURE,
  AEPSTHREE_RESENT_BANK_LIST_SUCCESS,
  AEPSTHREE_SEND_OTP_FAILURE,
  AEPSTHREE_SEND_OTP_SUCCESS,
  AEPSTHREE_STATUS_CHECK_FAILURE,
  AEPSTHREE_STATUS_CHECK_SUCCESS,
  AEPSTHREE_SUBMIT_OTP_FAILURE,
  AEPSTHREE_SUBMIT_OTP_SUCCESS,
  AEPSTHREE_TWO_FA_VERIFICATION_FAILURE,
  AEPSTHREE_TWO_FA_VERIFICATION_SUCCESS,
} from "../actionType/aepsThreeActionType";

const commonError = "Something went wrong!";

export const aepsThreeStatusCheck = () => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/aeps3/onboarding-status`,
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
        type: AEPSTHREE_STATUS_CHECK_SUCCESS,
        payload: { aepsStatus, status, message },
      });
      return { aepsStatus, status, message };
    } else {
      dispatch({
        type: AEPSTHREE_STATUS_CHECK_FAILURE,
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
      type: AEPSTHREE_STATUS_CHECK_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const aepsThreeOnboarding = () => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");

    // Fetch location
    const locationInfo = await getLocationAndIP();
    const payload = {
      latitude: locationInfo?.location?.latitude ? String(locationInfo.location.latitude) : "",
      longitude: locationInfo?.location?.longitude ? String(locationInfo.location.longitude) : ""
    };

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/aeps3/initiate-onboarding`,
      payload,
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
        type: AEPSTHREE_ONBOARDING_SUCCESS,
        payload: { onBoarding, status, message },
      });
      return { onBoarding, status, message };
    } else {
      dispatch({
        type: AEPSTHREE_ONBOARDING_FAILURE,
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
      type: AEPSTHREE_ONBOARDING_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const aepsThreeOtp = () => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const apiUrl = `${API_ROUTE}/api/v1/user/aeps3/resend-otp`;

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
        type: AEPSTHREE_SEND_OTP_SUCCESS,
        payload: { otpStatus, status, message },
      });
      return { otpStatus, status, message };
    } else {
      dispatch({
        type: AEPSTHREE_SEND_OTP_FAILURE,
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
      type: AEPSTHREE_SEND_OTP_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const aepsThreeRescendOTP = () => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/aeps3/send-ekyc-otp`,
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
        type: AEPSTHREE_RESEND_OTP_SUCCESS,
        payload: { rescendOtp, status, message },
      });
      return { rescendOtp, status, message };
    } else {
      dispatch({
        type: AEPSTHREE_RESEND_OTP_FAILURE,
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
      type: AEPSTHREE_RESEND_OTP_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const aepsThreeSubmitOTP = (values) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/aeps3/verify-otp`,
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
        type: AEPSTHREE_SUBMIT_OTP_SUCCESS,
        payload: { submitOtp, status, message },
      });
      return { submitOtp, status, message };
    } else {
      dispatch({
        type: AEPSTHREE_SUBMIT_OTP_FAILURE,
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
      type: AEPSTHREE_SUBMIT_OTP_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const aepsThreeBiometricSubmit = (values) => async (dispatch, getState) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");

    // Get mobile number from redux store
    const { userProfile } = getState();
    const deviceMobile = userProfile?.profile?.mobileNo || userProfile?.mobileNo || "";

    // Fetch location
    const locationInfo = await getLocationAndIP();

    // Extract base64 Pid (support both old and potentially new key)
    const base64Pid = values.txtPidData || values.pid || "";

    // Dynamically get OS from user agent
    const getDeviceOS = () => {
      const ua = window.navigator.userAgent.toLowerCase();
      if (ua.includes("win")) return "WINDOWS";
      if (ua.includes("mac")) return "MAC";
      if (ua.includes("linux")) return "LINUX";
      if (ua.includes("android")) return "ANDROID";
      if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ios")) return "IOS";
      return "UNKNOWN";
    };

    const payload = {
      device_type: "WEB",
      device_os: getDeviceOS(),
      device_mobile: deviceMobile ? String(deviceMobile) : "",
      app_id: window.location.hostname,
      sdk_version: "1.2.0",
      device_model: "WEB_BROWSER",
      model_id: "",
      peripheral: "BIOMETRIC_FINGERPRINT",
      pid: base64Pid,
      pid_type: 1,
      latitude: locationInfo?.location?.latitude ? String(locationInfo.location.latitude) : "",
      longitude: locationInfo?.location?.longitude ? String(locationInfo.location.longitude) : ""
    };

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/aeps3/ekyc-biometric`,
      payload,
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
        type: AEPSTHREE_BIOMETRIC_VERIFICATION_SUCCESS,
        payload: { biometricVerification, status, message },
      });
      return { biometricVerification, status, message };
    } else {
      dispatch({
        type: AEPSTHREE_BIOMETRIC_VERIFICATION_FAILURE,
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
      type: AEPSTHREE_BIOMETRIC_VERIFICATION_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const aepsThreeFAVerification = (values) => async (dispatch, getState) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");

    // Get mobile number from redux store
    const { userProfile } = getState();
    const deviceMobile = userProfile?.profile?.mobileNo || userProfile?.mobileNo || "";

    // Fetch location and IP
    const locationInfo = await getLocationAndIP();

    // Support previous or new keys for base64 pid
    const base64Pid = values.txtPidData || values.pid_data || values.pid || "";

    // Dynamically get OS from user agent
    const getDeviceOS = () => {
      const ua = window.navigator.userAgent.toLowerCase();
      if (ua.includes("win")) return "WINDOWS";
      if (ua.includes("mac")) return "MAC";
      if (ua.includes("linux")) return "LINUX";
      if (ua.includes("android")) return "ANDROID";
      if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ios")) return "IOS";
      return "UNKNOWN";
    };

    const payload = {
      device_type: "WEB",
      device_os: getDeviceOS(),
      device_mobile: deviceMobile ? String(deviceMobile) : "",
      app_id: window.location.hostname,
      sdk_version: "1.2.0",
      device_model: "WEB_BROWSER",
      model_id: "",
      peripheral: "BIOMETRIC_FINGERPRINT",
      pid_data: base64Pid,
      pid_type: 1,
      latitude: locationInfo?.location?.latitude ? String(locationInfo.location.latitude) : "",
      longitude: locationInfo?.location?.longitude ? String(locationInfo.location.longitude) : ""
    };

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/aeps3/daily-authentication`,
      payload,
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
        type: AEPSTHREE_TWO_FA_VERIFICATION_SUCCESS,
        payload: { twoFaVerification, status, message },
      });
      return { twoFaVerification, status, message };
    } else {
      dispatch({
        type: AEPSTHREE_TWO_FA_VERIFICATION_FAILURE,
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
      type: AEPSTHREE_TWO_FA_VERIFICATION_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const aepsThreeCashWithdrawl = (values) => async (dispatch, getState) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");

    const { userProfile } = getState();
    const deviceMobile = userProfile?.profile?.mobileNo || userProfile?.mobileNo || "";
    const locationInfo = await getLocationAndIP();

    const getDeviceOS = () => {
      const ua = window.navigator.userAgent.toLowerCase();
      if (ua.includes("win")) return "WINDOWS";
      if (ua.includes("mac")) return "MAC";
      if (ua.includes("linux")) return "LINUX";
      if (ua.includes("android")) return "ANDROID";
      if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ios")) return "IOS";
      return "UNKNOWN";
    };

    const base64Pid = values.txtPidData || values.pid_data || values.pid || "";

    const payload = {
      aadhaar_number: values.aadhaarNumber || values.aadhaar_number || "",
      pid_data: base64Pid,
      pid_type: 1,
      amount: Number(values.transactionAmount || values.amount || 0),
      bank_iin: values.bankIIN || values.bank_iin || "",
      mobile_number: values.customerNumber || values.mobileNumber || values.mobile_number || "",
      bank_name: values.bankName || values.bank_name || "BANK LIMITED",
      device_serial: values.device_serial || "DEVICE-SN-001",
      latitude: Number(values.latitude || locationInfo?.location?.latitude || 0),
      longitude: Number(values.longitude || locationInfo?.location?.longitude || 0),
      ipAddress: values.ipAddress || locationInfo?.ipAddress || "192.168.1.1",
      device_type: "WEB",
      device_os: getDeviceOS(),
      app_id: window.location.hostname,
      sdk_version: "1.2.0",
      device_mobile: deviceMobile ? String(deviceMobile) : String(values.customerNumber || values.mobileNumber || ""),
      user_agent: window.navigator.userAgent,
      device_model: "WEB_BROWSER",
      model_id: "",
      peripheral: "BIOMETRIC_FINGERPRINT"
    };

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/aeps3/cash-withdrawal`,
      payload,
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
        type: AEPSTHREE_CASH_WITHDRAWL_SUCCESS,
        payload: { cashWithdrawl, status, message },
      });
      return { cashWithdrawl, status, message };
    } else {
      dispatch({
        type: AEPSTHREE_CASH_WITHDRAWL_FAILURE,
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
      type: AEPSTHREE_CASH_WITHDRAWL_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const aepsThreeBalanceEnquiry = (values) => async (dispatch, getState) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");

    const { userProfile } = getState();
    const deviceMobile = userProfile?.profile?.mobileNo || userProfile?.mobileNo || "";
    const locationInfo = await getLocationAndIP();

    const getDeviceOS = () => {
      const ua = window.navigator.userAgent.toLowerCase();
      if (ua.includes("win")) return "WINDOWS";
      if (ua.includes("mac")) return "MAC";
      if (ua.includes("linux")) return "LINUX";
      if (ua.includes("android")) return "ANDROID";
      if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ios")) return "IOS";
      return "UNKNOWN";
    };

    const base64Pid = values.txtPidData || values.pid_data || values.pid || "";

    const payload = {
      aadhaar_number: values.aadhaarNumber || values.aadhaar_number || "",
      pid_data: base64Pid,
      pid_type: 1,
      bank_iin: values.bankIIN || values.bank_iin || "",
      mobile_number: values.customerNumber || values.mobileNumber || values.mobile_number || "",
      bank_name: values.bankName || values.bank_name || "BANK LIMITED",
      device_serial: values.device_serial || "DEVICE-SN-001",
      latitude: Number(values.latitude || locationInfo?.location?.latitude || 0),
      longitude: Number(values.longitude || locationInfo?.location?.longitude || 0),
      ipAddress: values.ipAddress || locationInfo?.ipAddress || "192.168.1.1",
      device_type: "WEB",
      device_os: getDeviceOS(),
      app_id: window.location.hostname,
      sdk_version: "1.2.0",
      device_mobile: deviceMobile ? String(deviceMobile) : String(values.customerNumber || values.mobileNumber || ""),
      user_agent: window.navigator.userAgent,
      device_model: "WEB_BROWSER",
      model_id: "",
      peripheral: "BIOMETRIC_FINGERPRINT"
    };

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/aeps3/balance-enquiry`,
      payload,
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
        type: AEPSTHREE_BALANCE_ENQUIRY_SUCCESS,
        payload: { balanceEnquiry, status, message },
      });
      return { balanceEnquiry, status, message };
    } else {
      dispatch({
        type: AEPSTHREE_BALANCE_ENQUIRY_FAILURE,
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
      type: AEPSTHREE_BALANCE_ENQUIRY_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const aepsThreeMiniStatement = (values) => async (dispatch, getState) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");

    const { userProfile } = getState();
    const deviceMobile = userProfile?.profile?.mobileNo || userProfile?.mobileNo || "";
    const locationInfo = await getLocationAndIP();

    const getDeviceOS = () => {
      const ua = window.navigator.userAgent.toLowerCase();
      if (ua.includes("win")) return "WINDOWS";
      if (ua.includes("mac")) return "MAC";
      if (ua.includes("linux")) return "LINUX";
      if (ua.includes("android")) return "ANDROID";
      if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ios")) return "IOS";
      return "UNKNOWN";
    };

    const base64Pid = values.txtPidData || values.pid_data || values.pid || "";

    const payload = {
      aadhaar_number: values.aadhaarNumber || values.aadhaar_number || "",
      pid_data: base64Pid,
      pid_type: 1,
      bank_iin: values.bankIIN || values.bank_iin || "",
      mobile_number: values.customerNumber || values.mobileNumber || values.mobile_number || "",
      bank_name: values.bankName || values.bank_name || "BANK LIMITED",
      device_serial: values.device_serial || "DEVICE-SN-001",
      latitude: Number(values.latitude || locationInfo?.location?.latitude || 0),
      longitude: Number(values.longitude || locationInfo?.location?.longitude || 0),
      ipAddress: values.ipAddress || locationInfo?.ipAddress || "192.168.1.1",
      device_type: "WEB",
      device_os: getDeviceOS(),
      app_id: window.location.hostname,
      sdk_version: "1.2.0",
      device_mobile: deviceMobile ? String(deviceMobile) : String(values.customerNumber || values.mobileNumber || ""),
      user_agent: window.navigator.userAgent,
      device_model: "WEB_BROWSER",
      model_id: "",
      peripheral: "BIOMETRIC_FINGERPRINT"
    };

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/aeps3/mini-statement`,
      payload,
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
        type: AEPSTHREE_MINI_STATEMENT_SUCCESS,
        payload: { miniStatement, status, message },
      });
      return { miniStatement, status, message };
    } else {
      dispatch({
        type: AEPSTHREE_MINI_STATEMENT_FAILURE,
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
      type: AEPSTHREE_MINI_STATEMENT_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const aepsThreeBankList = (values) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/aeps3/bank-list`,
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
        type: AEPSTHREE_BANKLIST_SUCCESS,
        payload: { bankList, status, message },
      });
      return { bankList, status, message };
    } else {
      dispatch({
        type: AEPSTHREE_BANKLIST_FAILURE,
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
      type: AEPSTHREE_BANKLIST_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const aepsThreeRecentBankList = (values) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/aeps3/recent-banks`,
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
        type: AEPSTHREE_RESENT_BANK_LIST_SUCCESS,
        payload: { bankRecentList, status, message },
      });
      return { bankRecentList, status, message };
    } else {
      dispatch({
        type: AEPSTHREE_RESENT_BANK_LIST_FAILURE,
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
      type: AEPSTHREE_RESENT_BANK_LIST_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const getAepsThreeCwHistory = (payload) => async (dispatch) => {
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
        type: AEPSTHREE_CW_HISTORY_SUCCESS,
        payload: { data: aeps2CwHistory, status, message, total, count, paginator },
      });
      return { data: aeps2CwHistory, status, message, total, count, paginator };
    } else {
      dispatch({
        type: AEPSTHREE_CW_HISTORY_FAILURE,
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
      type: AEPSTHREE_CW_HISTORY_FAILURE,
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

export const getAepsThreeCwHistoryCompany = (payload) => async (dispatch) => {
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
      `${API_ROUTE}/api/v1/company/reports/aeps2Reports`,
      requestPayload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: aeps2CwHistoryCompany, status, message, total, count, paginator } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: AEPSTHREE_CW_HISTORY_COMPANY_SUCCESS,
        payload: { data: aeps2CwHistoryCompany, status, message, total, count, paginator },
      });
      return { data: aeps2CwHistoryCompany, status, message, total, count, paginator };
    } else {
      dispatch({
        type: AEPSTHREE_CW_HISTORY_COMPANY_FAILURE,
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
      type: AEPSTHREE_CW_HISTORY_COMPANY_FAILURE,
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

export const getAepsThreeCwHistoryUsers = (payload) => async (dispatch) => {
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
      `${API_ROUTE}/api/v1/user/aeps2/transaction-history`,
      requestPayload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: aeps2CwHistoryUsers, status, message, total, count, paginator } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: AEPSTHREE_CW_HISTORY_USERS_SUCCESS,
        payload: { data: aeps2CwHistoryUsers, status, message, total, count, paginator },
      });
      return { data: aeps2CwHistoryUsers, status, message, total, count, paginator };
    } else {
      dispatch({
        type: AEPSTHREE_CW_HISTORY_USERS_FAILURE,
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
      type: AEPSTHREE_CW_HISTORY_USERS_FAILURE,
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

export const getAepsThreeTransactionDetailsUsers = (transactionId) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/aeps2/aeps2TransactionDetailsById/${transactionId}`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: aeps2CwHistoryTransactionDetails, status, message, total, count, paginator } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: AEPSTHREE_CW_HISTORY_TRANSACTION_DETAILS_SUCCESS,
        payload: { data: aeps2CwHistoryTransactionDetails, status, message, total, count, paginator },
      });
      return { data: aeps2CwHistoryTransactionDetails, status, message, total, count, paginator };
    } else {
      dispatch({
        type: AEPSTHREE_CW_HISTORY_TRANSACTION_DETAILS_FAILURE,
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
      type: AEPSTHREE_CW_HISTORY_TRANSACTION_DETAILS_FAILURE,
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