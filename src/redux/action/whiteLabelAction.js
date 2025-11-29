import axios from "axios";
import secureLocalStorage from "react-secure-storage";
import {
  WHITELABEL_CREATE_SUCCESS,
  WHITELABEL_CREATE_FAILURE,
  GET_PINCODE_BY_CITY_SUCCESS,
  GET_PINCODE_BY_CITY_FAILURE,
  GET_CITY_BY_PINCODE_FAILURE,
  GET_CITY_BY_PINCODE_SUCCESS,
  GET_IP_CHECK_SUCCESS,
  GET_IP_CHECK_FAILURE,
  GET_PANDATA_FETCH_SUCCESS,
  GET_PANDATA_FETCH_FAILURE,
  GET_WHITELABEL_LIST_SUCCESS,
  GET_WHITELABEL_LIST_FAILURE,
  FETCH_KYC_DETAILS_SUCCESS,
  FETCH_KYC_DETAILS_FAILURE,
  GET_KYCSTATUS_SUCCESS,
  GET_KYCSTATUS_FAILURE,
  UPDATE_KYCSTATUS_SUCCESS,
  UPDATE_KYCSTATUS_FAILURE,
  KYC_LOCK_STATUS_SUCCESS,
  KYC_LOCK_STATUS_FAILURE,
  REVERT_KYC_DETAILS_SUCCESS,
  REVERT_KYC_DETAILS_FAILURE,
  RESEND_ONBOARDING_LINK_SUCCESS,
  RESEND_ONBOARDING_LINK_FAILURE,
  DEACTIVATE_ONBOARDING_LINK_SUCCESS,
  DEACTIVATE_ONBOARDING_LINK_FAILURE,
} from "../actionType/whiteLabelAction";
import { API_ROUTE } from "../../data/env";
import { LOADING_START, LOADING_END } from "../actionType/loadingActionType";

const commonError = "Something went wrong!";

export const ipCheckStatus = (values) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.post(
      `${API_ROUTE}/api/v1/admin/company/ip-check`,
      values,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: ipResponse, status, success, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: GET_IP_CHECK_SUCCESS,
        payload: { ipResponse, success, message },
      });
    } else {
      dispatch({
        type: GET_IP_CHECK_FAILURE,
        payload: response?.data?.message ?? commonError,
      });
    }
  } catch (error) {
    dispatch({
      type: GET_IP_CHECK_FAILURE,
      payload: error.response ? error.response.data.message : error.message,
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const getCityByPincode = (values) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.post(
      `${API_ROUTE}/api/v1/admin/company/get-city-by-pincode`,
      values,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: citybyPincode, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: GET_CITY_BY_PINCODE_SUCCESS,
        payload: { citybyPincode, status, message },
      });
    } else {
      dispatch({
        type: GET_CITY_BY_PINCODE_FAILURE,
        payload: response?.data?.message ?? commonError,
      });
    }
  } catch (error) {
    dispatch({
      type: GET_CITY_BY_PINCODE_FAILURE,
      payload: error.response ? error.response.data.message : error.message,
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const getPincodeByCity = (values) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.post(
      `${API_ROUTE}/api/v1/admin/company/get-pincode-by-city`,
      values,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: pincodeByCity, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: GET_PINCODE_BY_CITY_SUCCESS,
        payload: { pincodeByCity, status, message },
      });
    } else {
      dispatch({
        type: GET_PINCODE_BY_CITY_FAILURE,
        payload: response?.data?.message ?? commonError,
      });
    }
  } catch (error) {
    dispatch({
      type: GET_PINCODE_BY_CITY_FAILURE,
      payload: error.response ? error.response.data.message : error.message,
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const panDataFetch = (values) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.post(
      `${API_ROUTE}/api/v1/admin/company/pan-verification`,
      values,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: panData, message } = response?.data ?? {};
    const status = response?.data?.data?.status;

    if (status === "Success") {
      dispatch({
        type: GET_PANDATA_FETCH_SUCCESS,
        payload: { panData, message, status }, // 👈 include status here
      });
    } else if (status === "Failure") {
      dispatch({
        type: GET_PANDATA_FETCH_FAILURE,
        payload: { message, status, errorData: response?.data },
      });
    }
  } catch (error) {
    dispatch({
      type: GET_PANDATA_FETCH_FAILURE,
      payload: {
        message: error.response ? error.response.data.message : error.message,
        status: "Error", // 👈 optional but useful
      },
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};


export const createWhiteLabel = (formData) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.post(
      `${API_ROUTE}/api/v1/admin/company/create-company`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    console.log("response for ip api", response?.data);

    const { data: createResponse, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: WHITELABEL_CREATE_SUCCESS,
        payload: { createResponse, status, message },
      });
    } else {
      dispatch({
        type: WHITELABEL_CREATE_FAILURE,
        payload: response?.data?.message ?? commonError,
      });
    }
  } catch (error) {
    dispatch({
      type: WHITELABEL_CREATE_FAILURE,
      payload: error.response ? error.response.data.message : error.message,
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const useList = (values) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.post(
      `${API_ROUTE}/api/v1/admin/users/list`,
      values,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: whitelabelList, message, status } = response?.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: GET_WHITELABEL_LIST_SUCCESS,
        payload: { whitelabelList, message, status },
      });
    } else {
      dispatch({
        type: GET_WHITELABEL_LIST_FAILURE,
        payload: { message, status, errorData: response?.data },
      });
    }
  } catch (error) {
    dispatch({
      type: GET_WHITELABEL_LIST_FAILURE,
      payload: {
        message: error.response ? error.response.data.message : error.message,
        status: "Error",
      },
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const kycData = (id) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.post(
      `${API_ROUTE}/api/v1/admin/users/${id}/kyc/complete`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data, message, status } = response?.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: FETCH_KYC_DETAILS_SUCCESS,
        payload: { data, message, status },
      });
    } else {
      dispatch({
        type: FETCH_KYC_DETAILS_FAILURE,
        payload: { message, status, errorData: response?.data },
      });
    }
  } catch (error) {
    dispatch({
      type: FETCH_KYC_DETAILS_FAILURE,
      payload: {
        message: error.response ? error.response.data.message : error.message,
        status: "Error",
      },
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const kycStatusData = (id) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.post(
      `${API_ROUTE}/api/v1/admin/users/${id}`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: kycStatusClick, message, status } = response?.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: GET_KYCSTATUS_SUCCESS,
        payload: { kycStatusClick, message, status },
      });
    } else {
      dispatch({
        type: GET_KYCSTATUS_FAILURE,
        payload: { message, status, errorData: response?.data },
      });
    }
  } catch (error) {
    dispatch({
      type: GET_KYCSTATUS_FAILURE,
      payload: {
        message: error.response ? error.response.data.message : error.message,
        status: "Error",
      },
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const kycStatusCheck = (id, body = {}) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.put(
      `${API_ROUTE}/api/v1/admin/users/${id}`,
      body,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: kycStatusCheck, message, status } = response?.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: UPDATE_KYCSTATUS_SUCCESS,
        payload: { kycStatusCheck, message, status },
      });
    } else {
      dispatch({
        type: UPDATE_KYCSTATUS_FAILURE,
        payload: { message, status, errorData: response?.data },
      });
    }
  } catch (error) {
    dispatch({
      type: UPDATE_KYCSTATUS_FAILURE,
      payload: {
        message: error.response ? error.response.data.message : error.message,
        status: "Error",
      },
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};


export const kycUnlock = (id) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.post(
      `${API_ROUTE}/api/v1/admin/users/${id}/unlock`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: kycUnlock, message, status } = response?.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: KYC_LOCK_STATUS_SUCCESS,
        payload: { kycUnlock, message, status },
      });
    } else {
      dispatch({
        type: KYC_LOCK_STATUS_FAILURE,
        payload: { message, status, errorData: response?.data },
      });
    }
  } catch (error) {
    dispatch({
      type: KYC_LOCK_STATUS_FAILURE,
      payload: {
        message: error.response ? error.response.data.message : error.message,
        status: "Error",
      },
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const kycRevert = (id, body = {}) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.post(
      `${API_ROUTE}/api/v1/admin/users/${id}/kyc/revert`,
      body,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: kycRevert, message, status } = response?.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: REVERT_KYC_DETAILS_SUCCESS,
        payload: { kycRevert, message, status },
      });
    } else {
      dispatch({
        type: REVERT_KYC_DETAILS_FAILURE,
        payload: { message, status, errorData: response?.data },
      });
    }
  } catch (error) {
    dispatch({
      type: REVERT_KYC_DETAILS_FAILURE,
      payload: {
        message: error.response ? error.response.data.message : error.message,
        status: "Error",
      },
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const rescendOnboarding = (id) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.post(
      `${API_ROUTE}/api/v1/admin/company/${id}/resend-onboarding-link`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: resendOnboardingLink, message, status } = response?.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: RESEND_ONBOARDING_LINK_SUCCESS,
        payload: { resendOnboardingLink, message, status },
      });
    } else {
      dispatch({
        type: RESEND_ONBOARDING_LINK_FAILURE,
        payload: { message, status, errorData: response?.data },
      });
    }
  } catch (error) {
    dispatch({
      type: RESEND_ONBOARDING_LINK_FAILURE,
      payload: {
        message: error.response ? error.response.data.message : error.message,
        status: "Error",
      },
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const deActiveOnboarding = (id) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.post(
      `${API_ROUTE}/api/v1/admin/company/${authToken}/deactivate-onboarding-link`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: deactivateOnboardingLink, message, status } = response?.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: DEACTIVATE_ONBOARDING_LINK_SUCCESS,
        payload: { deactivateOnboardingLink, message, status },
      });
    } else {
      dispatch({
        type: DEACTIVATE_ONBOARDING_LINK_FAILURE,
        payload: { message, status, errorData: response?.data },
      });
    }
  } catch (error) {
    dispatch({
      type: DEACTIVATE_ONBOARDING_LINK_FAILURE,
      payload: {
        message: error.response ? error.response.data.message : error.message,
        status: "Error",
      },
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};
