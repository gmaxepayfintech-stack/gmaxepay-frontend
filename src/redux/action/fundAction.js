import axios from "axios";
import secureLocalStorage from "react-secure-storage";
import { API_ROUTE } from "../../data/env";

import { LOADING_START, LOADING_END } from "../actionType/loadingActionType";
import { DISTRIBUTOR_FUND_GET_ALL_BANKS_FAILURE, DISTRIBUTOR_FUND_GET_ALL_BANKS_SUCCESS, DISTRIBUTOR_FUND_LOAD_FAILURE, DISTRIBUTOR_FUND_LOAD_SUCCESS, MASTER_DISTRIBUTOR_FUND_GET_ALL_BANKS_FAILURE, MASTER_DISTRIBUTOR_FUND_GET_ALL_BANKS_SUCCESS, MASTER_DISTRIBUTOR_FUND_LOAD_FAILURE, MASTER_DISTRIBUTOR_FUND_LOAD_SUCCESS, RETAILER_FUND_GET_ALL_BANKS_FAILURE, RETAILER_FUND_GET_ALL_BANKS_SUCCESS, RETAILER_FUND_LOAD_FAILURE, RETAILER_FUND_LOAD_SUCCESS } from "../actionType/fundActionType";

const commonError = "Something went wrong!";

export const retailerGetBanks = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const token = typeof authToken === 'string' ? authToken : String(authToken || '');

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/fund/all-bank-details`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const { data: retailerFundBanks, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: RETAILER_FUND_GET_ALL_BANKS_SUCCESS,
        payload: { retailerFundBanks, status, message },
      });
      return { retailerFundBanks, status, message };
    } else {
      dispatch({
        type: RETAILER_FUND_GET_ALL_BANKS_FAILURE,
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
      type: RETAILER_FUND_GET_ALL_BANKS_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const retailerFundLoad = (formData) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const token = typeof authToken === 'string' ? authToken : String(authToken || '');

    // Determine if payload is FormData or regular object
    const isFormData = formData instanceof FormData;

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    // Only set Content-Type for JSON, let browser set it for FormData (with boundary)
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/fund/fund-transfer-request`,
      formData,
      {
        headers,
      }
    );

    const { data: retailerFundLoad, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: RETAILER_FUND_LOAD_SUCCESS,
        payload: { retailerFundLoad, status, message },
      });
      return { retailerFundLoad, status, message };
    } else {
      dispatch({
        type: RETAILER_FUND_LOAD_FAILURE,
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
      type: RETAILER_FUND_LOAD_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const distributerGetBanks = (formData) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const token = typeof authToken === 'string' ? authToken : String(authToken || '');

    // Determine if payload is FormData or regular object
    const isFormData = formData instanceof FormData;

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    // Only set Content-Type for JSON, let browser set it for FormData (with boundary)
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/fund/all-bank-details`,
      formData,
      {
        headers,
      }
    );

    const { data: dBanklists, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: DISTRIBUTOR_FUND_GET_ALL_BANKS_SUCCESS,
        payload: { dBanklists, status, message },
      });
      return { dBanklists, status, message };
    } else {
      dispatch({
        type: DISTRIBUTOR_FUND_GET_ALL_BANKS_FAILURE,
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
      type: DISTRIBUTOR_FUND_GET_ALL_BANKS_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const masterdistributerGetBanks = (formData) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const token = typeof authToken === 'string' ? authToken : String(authToken || '');

    // Determine if payload is FormData or regular object
    const isFormData = formData instanceof FormData;

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    // Only set Content-Type for JSON, let browser set it for FormData (with boundary)
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/fund/all-bank-details`,
      formData,
      {
        headers,
      }
    );

    const { data: mdBanklists, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: MASTER_DISTRIBUTOR_FUND_GET_ALL_BANKS_SUCCESS,
        payload: { mdBanklists, status, message },
      });
      return { mdBanklists, status, message };
    } else {
      dispatch({
        type: MASTER_DISTRIBUTOR_FUND_GET_ALL_BANKS_FAILURE,
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
      type: MASTER_DISTRIBUTOR_FUND_GET_ALL_BANKS_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const distributerFundLoad = (formData) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const token = typeof authToken === 'string' ? authToken : String(authToken || '');

    // Determine if payload is FormData or regular object
    const isFormData = formData instanceof FormData;

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    // Only set Content-Type for JSON, let browser set it for FormData (with boundary)
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/fund/fund-transfer-request`,
      formData,
      {
        headers,
      }
    );

    const { data: dFundload, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: DISTRIBUTOR_FUND_LOAD_SUCCESS,
        payload: { dFundload, status, message },
      });
      return { dFundload, status, message };
    } else {
      dispatch({
        type: DISTRIBUTOR_FUND_LOAD_FAILURE,
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
      type: DISTRIBUTOR_FUND_LOAD_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const masterdistributerFundLoad = (formData) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const token = typeof authToken === 'string' ? authToken : String(authToken || '');

    // Determine if payload is FormData or regular object
    const isFormData = formData instanceof FormData;

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    // Only set Content-Type for JSON, let browser set it for FormData (with boundary)
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/fund/fund-transfer-request`,
      formData,
      {
        headers,
      }
    );

    const { data: mdFundload, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: MASTER_DISTRIBUTOR_FUND_LOAD_SUCCESS,
        payload: { mdFundload, status, message },
      });
      return { mdFundload, status, message };
    } else {
      dispatch({
        type: MASTER_DISTRIBUTOR_FUND_LOAD_FAILURE,
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
      type: MASTER_DISTRIBUTOR_FUND_LOAD_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};


