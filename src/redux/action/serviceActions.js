import axios from "axios";
import secureLocalStorage from "react-secure-storage";
import { API_ROUTE } from "../../data/env";

import { LOADING_START, LOADING_END } from "../actionType/loadingActionType";
import {
  SERVICE_LIST_SUCCESS,
  SERVICE_LIST_FAILURE,
  SERVICE_CREATE_SUCCESS,
  SERVICE_CREATE_FAILURE,
  SERVICE_UPDATE_SUCCESS,
  SERVICE_UPDATE_FAILURE,
  EMPLOYEE_SERVICE_LIST_SUCCESS,
  EMPLOYEE_SERVICE_LIST_FAILURE,
  EMPLOYEE_SERVICE_CREATE_SUCCESS,
  EMPLOYEE_SERVICE_CREATE_FAILURE,
  EMPLOYEE_SERVICE_UPDATE_SUCCESS,
  EMPLOYEE_SERVICE_UPDATE_FAILURE,
} from "../actionType/serviceActionType";

const commonError = "Something went wrong!";

// 🔹 LIST SERVICES
export const listServices = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const token = secureLocalStorage.getItem("userToken");

    const response = await axios.post(
      `${API_ROUTE}/api/v1/admin/services/list`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (response?.data?.status === "SUCCESS") {
      dispatch({
        type: SERVICE_LIST_SUCCESS,
        payload: response.data, // ✅ FULL RESPONSE
      });
      return response.data;
    }

    dispatch({
      type: SERVICE_LIST_FAILURE,
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: SERVICE_LIST_FAILURE,
      payload: error.response?.data || error.message,
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// 🔹 CREATE SERVICE
export const createService = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const token = secureLocalStorage.getItem("userToken");

    const response = await axios.post(
      `${API_ROUTE}/api/v1/admin/services`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const { status, message } = response.data || {};

    if (status === "SUCCESS") {
      dispatch({
        type: SERVICE_CREATE_SUCCESS,
        payload: { status, message },
      });
      return { status, message };
    }

    dispatch({
      type: SERVICE_CREATE_FAILURE,
      payload: message || commonError,
    });
  } catch (error) {
    dispatch({
      type: SERVICE_CREATE_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// 🔹 UPDATE SERVICE
export const updateService = (id, payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const token = secureLocalStorage.getItem("userToken");

    const response = await axios.put(
      `${API_ROUTE}/api/v1/admin/services/${id}`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const { status, message } = response.data || {};

    if (status === "SUCCESS") {
      dispatch({
        type: SERVICE_UPDATE_SUCCESS,
        payload: { status, message },
      });
      return { status, message };
    }

    dispatch({
      type: SERVICE_UPDATE_FAILURE,
      payload: message || commonError,
    });
  } catch (error) {
    dispatch({
      type: SERVICE_UPDATE_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

/* =======================
   LIST EMPLOYEE SERVICES
======================= */
export const listEmployeeServices = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const token = secureLocalStorage.getItem("userToken");

    const response = await axios.post(
      `${API_ROUTE}/api/v1/employee/services/list`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const { status, message } = response.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: EMPLOYEE_SERVICE_LIST_SUCCESS,
        payload: response.data,
      });
      return response.data;
    }

    dispatch({
      type: EMPLOYEE_SERVICE_LIST_FAILURE,
      payload: message || commonError,
    });
  } catch (error) {
    dispatch({
      type: EMPLOYEE_SERVICE_LIST_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

/* =======================
   CREATE EMPLOYEE SERVICE
======================= */
export const createEmployeeService = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const token = secureLocalStorage.getItem("userToken");

    const response = await axios.post(
      `${API_ROUTE}/api/v1/employee/services`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const { status, message } = response.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: EMPLOYEE_SERVICE_CREATE_SUCCESS,
        payload: { status, message },
      });
      return { status, message };
    }

    dispatch({
      type: EMPLOYEE_SERVICE_CREATE_FAILURE,
      payload: message || commonError,
    });
  } catch (error) {
    dispatch({
      type: EMPLOYEE_SERVICE_CREATE_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

/* =======================
   UPDATE EMPLOYEE SERVICE
======================= */
export const updateEmployeeService = (id, payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const token = secureLocalStorage.getItem("userToken");

    const response = await axios.put(
      `${API_ROUTE}/api/v1/employee/services/${id}`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const { status, message } = response.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: EMPLOYEE_SERVICE_UPDATE_SUCCESS,
        payload: { status, message },
      });
      return { status, message };
    }

    dispatch({
      type: EMPLOYEE_SERVICE_UPDATE_FAILURE,
      payload: message || commonError,
    });
  } catch (error) {
    dispatch({
      type: EMPLOYEE_SERVICE_UPDATE_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

