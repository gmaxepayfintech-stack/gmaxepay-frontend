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
    console.log("response for ip api", response?.data);

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
    console.log("response for ip api", response?.data);

    const {
      data: pincodeByCity,
      status,
      message,
    } = response?.data ?? {};
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
    console.log("response for ip api", response?.data);

    const {
      data: panData,
      status,
      message,
    } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: GET_PANDATA_FETCH_SUCCESS,
        payload: { panData, status, message },
      });
    } else {
      dispatch({
        type: GET_PANDATA_FETCH_FAILURE,
        payload: response?.data?.message ?? commonError,
      });
    }
  } catch (error) {
    dispatch({
      type: GET_PANDATA_FETCH_FAILURE,
      payload: error.response ? error.response.data.message : error.message,
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

    const {
      data: createResponse,
      status,
      message,
    } = response?.data ?? {};
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

