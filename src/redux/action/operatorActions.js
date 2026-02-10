import axios from "axios";
import secureLocalStorage from "react-secure-storage";
import { API_ROUTE } from "../../data/env";

import {
  OPERATOR_LIST_SUCCESS,
  OPERATOR_LIST_FAILURE,
  OPERATOR_CREATE_SUCCESS,
  OPERATOR_CREATE_FAILURE,
  OPERATOR_UPDATE_SUCCESS,
  OPERATOR_UPDATE_FAILURE,
  ADMIN_UPGRADE_LIST_SUCCESS,
  ADMIN_UPGRADE_LIST_FAILURE,
} from "../actionType/operatorActionType";

import { LOADING_START, LOADING_END } from "../actionType/loadingActionType";

const commonError = "Something went wrong!";

/* =======================
   LIST OPERATORS
======================= */
export const listOperators =
  (search = "", page = 1, type = "all") =>
  async (dispatch) => {
    dispatch({ type: LOADING_START });

    try {
      const authToken = secureLocalStorage.getItem("userToken");

      const payload = {
        query: type !== "all" ? { operatortype: type } : {},
        customSearch: search
          ? {
              operatorname: search,
              operatorcode: search,
            }
          : {},
        options: {
          page,
          paginate: 10,
          sort: { createdAt: -1 },
        },
      };

      const response = await axios.post(
        `${API_ROUTE}/api/v1/admin/operators/list`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      const { data: operators, status, message } = response?.data ?? {};

      if (status === "SUCCESS") {
        dispatch({
          type: OPERATOR_LIST_SUCCESS,
          payload: { operators, status, message },
        });
        return { operators, status, message };
      } else {
        dispatch({
          type: OPERATOR_LIST_FAILURE,
          payload: {
            status: status || "FAILURE",
            message: message || commonError,
          },
        });
        return { status, message };
      }
    } catch (error) {
      dispatch({
        type: OPERATOR_LIST_FAILURE,
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

/* =======================
   CREATE OPERATOR
======================= */
export const createOperator = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const authToken = secureLocalStorage.getItem("userToken");

    const response = await axios.post(
      `${API_ROUTE}/api/v1/admin/operators`,
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
        type: OPERATOR_CREATE_SUCCESS,
        payload: { status, message },
      });

      dispatch(listOperators()); // refresh list
      return { status, message };
    } else {
      dispatch({
        type: OPERATOR_CREATE_FAILURE,
        payload: {
          status: status || "FAILURE",
          message: message || commonError,
        },
      });
      return { status, message };
    }
  } catch (error) {
    dispatch({
      type: OPERATOR_CREATE_FAILURE,
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

/* =======================
   UPDATE OPERATOR
======================= */
export const updateOperator = (id, payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const authToken = secureLocalStorage.getItem("userToken");

    const response = await axios.put(
      `${API_ROUTE}/api/v1/admin/operators/${id}`,
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
        type: OPERATOR_UPDATE_SUCCESS,
        payload: { status, message },
      });

      dispatch(listOperators());
      return { status, message };
    } else {
      dispatch({
        type: OPERATOR_UPDATE_FAILURE,
        payload: {
          status: status || "FAILURE",
          message: message || commonError,
        },
      });
      return { status, message };
    }
  } catch (error) {
    dispatch({
      type: OPERATOR_UPDATE_FAILURE,
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

// Alias for backward compatibility
export const adminUpgradeList = updateOperator;


export const getAllAdminSlabVisibility = (companyId) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: ADMIN_UPGRADE_LIST_SUCCESS });

  try {
    const token = secureLocalStorage.getItem('userToken');    
    if (!token) {
      throw new Error('Authentication token not found');
    }

    if (!companyId) {
      throw new Error('Company ID is required');
    }

    const response = await axios.post(
      `${API_ROUTE}/api/v1/admin/slabs/visibility/${companyId}`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          'x-company-id': companyId,
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = response?.data;
    const { status } = data ?? {};

    if (status === 'SUCCESS' || status === 200) {
      dispatch({
        type: ADMIN_UPGRADE_LIST_SUCCESS,
        payload: {
          data: data?.data || [],
          status: data?.status,
          message: data?.message || 'Slab visibility retrieved successfully',
        },
      });
      dispatch({ type: LOADING_END });
      return {
        success: true,
        data: data?.data || [],
        message: data?.message || 'Slab visibility retrieved successfully',
      };
    } else {
      dispatch({
        type: ADMIN_UPGRADE_LIST_FAILURE,
        payload: data?.message || commonError,
      });
      dispatch({ type: LOADING_END });
      return {
        success: false,
        message: data?.message || commonError,
      };
    }
  } catch (error) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      commonError;
    
    dispatch({
      type: ADMIN_UPGRADE_LIST_FAILURE,
      payload: errorMessage,
    });
    dispatch({ type: LOADING_END });
    return {
      success: false,
      message: errorMessage,
    };
  }
};
