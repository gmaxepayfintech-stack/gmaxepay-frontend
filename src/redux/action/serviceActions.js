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
} from "../actionType/serviceActionType";

const commonError = "Something went wrong!";

// 🔹 LIST SERVICES
export const listServices =
  (search = "", page = 1) =>
  async (dispatch) => {
    dispatch({ type: LOADING_START });

    try {
      const authToken = secureLocalStorage.getItem("userToken");

      const payload = {
        query: {},
        customSearch: search ? { serviceName: search } : {},
        options: {
          page,
          paginate: 10,
        },
      };

      const response = await axios.post(
        `${API_ROUTE}/api/v1/admin/services/list`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      const { data: services, status, message } = response?.data ?? {};

      if (status === "SUCCESS") {
        dispatch({
          type: SERVICE_LIST_SUCCESS,
          payload: { services, status, message },
        });
        return { services, status, message };
      } else {
        dispatch({
          type: SERVICE_LIST_FAILURE,
          payload: {
            status: status || "FAILURE",
            message: message || commonError,
          },
        });
        return { status, message };
      }
    } catch (error) {
      dispatch({
        type: SERVICE_LIST_FAILURE,
        payload: {
          status: "FAILURE",
          message: error.response?.data?.message || error.message,
        },
      });
      throw error;
    } finally {
      dispatch({ type: LOADING_END });
    }
  };

// 🔹 CREATE SERVICE
export const createService = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const authToken = secureLocalStorage.getItem("userToken");

    const response = await axios.post(
      `${API_ROUTE}/api/v1/admin/services`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

    const { status, message } = response?.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: SERVICE_CREATE_SUCCESS,
        payload: { status, message },
      });

      dispatch(listServices()); // refresh list
      return { status, message };
    } else {
      dispatch({
        type: SERVICE_CREATE_FAILURE,
        payload: {
          status: status || "FAILURE",
          message: message || commonError,
        },
      });
      return { status, message };
    }
  } catch (error) {
    dispatch({
      type: SERVICE_CREATE_FAILURE,
      payload: {
        status: "FAILURE",
        message: error.response?.data?.message || error.message,
      },
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// 🔹 UPDATE SERVICE
export const updateService = (serviceId, payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const token = secureLocalStorage.getItem("userToken");

    const formData = new FormData();
    Object.keys(payload).forEach((key) => {
      if (payload[key] !== undefined && payload[key] !== "") {
        formData.append(key, payload[key]);
      }
    });

    const response = await axios.put(
      `${API_ROUTE}/api/v1/admin/services/${serviceId}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      },
    );

    const { status, message } = response?.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: SERVICE_UPDATE_SUCCESS,
        payload: response.data,
      });

      // 🔁 refresh list
      dispatch(listServices());

      return { status, message };
    } else {
      dispatch({
        type: SERVICE_UPDATE_FAILURE,
        payload: {
          status: status || "FAILURE",
          message: message || commonError,
        },
      });
      return { status, message };
    }
  } catch (error) {
    dispatch({
      type: SERVICE_UPDATE_FAILURE,
      payload: {
        status: "FAILURE",
        message: error.response?.data?.message || error.message,
      },
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};
