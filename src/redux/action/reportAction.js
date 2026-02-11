import axios from "axios";
import secureLocalStorage from "react-secure-storage";
import { API_ROUTE } from "../../data/env";

import { LOADING_START, LOADING_END } from "../actionType/loadingActionType";
import { DTH_RECHARGE_FAILURE, DTH_RECHARGE_PLAN_FETCH_FAILURE, DTH_RECHARGE_PLAN_FETCH_SUCCESS, DTH_RECHARGE_SUCCESS, FIND_DTH_OPERATOR_INFO_FAILURE, FIND_DTH_OPERATOR_INFO_SUCCESS, FIND_MOBILE_OPERATOR_FAILURE, FIND_MOBILE_OPERATOR_SUCCESS, FIND_MOBILE_RECHARGE_OFFERS_FAILURE, FIND_MOBILE_RECHARGE_OFFERS_SUCCESS, FIND_MOBILE_RECHARGE_PLAN_FAILURE, FIND_MOBILE_RECHARGE_PLAN_SUCCESS, PAY_RECHARGE_FAILURE, PAY_RECHARGE_SUCCESS } from "../actionType/rechargeActionType";
import { ADMIN_TXN_REPORT_FAILURE, ADMIN_TXN_REPORT_SUCCESS, COMPANY_TXN_REPORT_FAILURE, COMPANY_TXN_REPORT_SUCCESS, USER_TXN_REPORT_FAILURE, USER_TXN_REPORT_SUCCESS } from "../actionType/reportsActionType";

const commonError = "Something went wrong!";

export const rechargeReportsAdmin = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");

    const response = await axios.post(
      `${API_ROUTE}/api/v1/admin/reports/rechargeReports`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const responseData = response?.data ?? {};
    const { status, message } = responseData;
    if (status === "SUCCESS") {
      dispatch({
        type: ADMIN_TXN_REPORT_SUCCESS,
        payload: responseData,
      });
      return responseData;
    } else {
      dispatch({
        type: ADMIN_TXN_REPORT_FAILURE,
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
      type: ADMIN_TXN_REPORT_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const rechargeReportsCompany = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");

    const response = await axios.post(
      `${API_ROUTE}/api/v1/company/reports/rechargeReports`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const responseData = response?.data ?? {};
    const { status, message } = responseData;
    if (status === "SUCCESS") {
      dispatch({
        type: COMPANY_TXN_REPORT_SUCCESS,
        payload: responseData,
      });
      return responseData;
    } else {
      dispatch({
        type: COMPANY_TXN_REPORT_FAILURE,
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
      type: COMPANY_TXN_REPORT_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const rechargeReportsUser = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/recharge/getUserRechargeReports`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const responseData = response?.data ?? {};
    const { status, message } = responseData;
    if (status === "SUCCESS") {
      dispatch({
        type: USER_TXN_REPORT_SUCCESS,
        payload: responseData,
      });
      return responseData;
    } else {
      dispatch({
        type: USER_TXN_REPORT_FAILURE,
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
      type: USER_TXN_REPORT_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};
