import axios from "axios";
import secureLocalStorage from "react-secure-storage";
import { API_ROUTE } from "../../data/env";

import { LOADING_START, LOADING_END } from "../actionType/loadingActionType";
import { DTH_RECHARGE_FAILURE, DTH_RECHARGE_PLAN_FETCH_FAILURE, DTH_RECHARGE_PLAN_FETCH_SUCCESS, DTH_RECHARGE_SUCCESS, FIND_DTH_OPERATOR_INFO_FAILURE, FIND_DTH_OPERATOR_INFO_SUCCESS, FIND_MOBILE_OPERATOR_FAILURE, FIND_MOBILE_OPERATOR_SUCCESS, FIND_MOBILE_RECHARGE_OFFERS_FAILURE, FIND_MOBILE_RECHARGE_OFFERS_SUCCESS, FIND_MOBILE_RECHARGE_PLAN_FAILURE, FIND_MOBILE_RECHARGE_PLAN_SUCCESS, PAY_RECHARGE_FAILURE, PAY_RECHARGE_SUCCESS } from "../actionType/rechargeActionType";

const commonError = "Something went wrong!";

export const rechargefindOperator = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/recharge/find-mobile-operator`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: mobileOperator, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: FIND_MOBILE_OPERATOR_SUCCESS,
        payload: { mobileOperator, status, message },
      });
      return { mobileOperator, status, message };
    } else {
      dispatch({
        type: FIND_MOBILE_OPERATOR_FAILURE,
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
      type: FIND_MOBILE_OPERATOR_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};


export const rechargefindPlan = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/recharge/find-recharge-plan`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: mobileRechargePlan, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: FIND_MOBILE_RECHARGE_PLAN_SUCCESS,
        payload: { mobileRechargePlan, status, message },
      });
      return { mobileRechargePlan, status, message };
    } else {
      dispatch({
        type: FIND_MOBILE_RECHARGE_PLAN_FAILURE,
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
      type: FIND_MOBILE_RECHARGE_PLAN_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const rechargefindOffers = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/recharge/recharge-offer`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: mobileRechargeOffers, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: FIND_MOBILE_RECHARGE_OFFERS_SUCCESS,
        payload: { mobileRechargeOffers, status, message },
      });
      return { mobileRechargeOffers, status, message };
    } else {
      dispatch({
        type: FIND_MOBILE_RECHARGE_OFFERS_FAILURE,
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
      type: FIND_MOBILE_RECHARGE_OFFERS_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const rechargePay = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/recharge/pay`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: mobileRechargePay, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: PAY_RECHARGE_SUCCESS,
        payload: { mobileRechargePay, status, message },
      });
      return { mobileRechargePay, status, message };
    } else {
      dispatch({
        type: PAY_RECHARGE_FAILURE,
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
      type: PAY_RECHARGE_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const dthCustomerInfo = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/dth/customer-info`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: dthOperatorInfo, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: FIND_DTH_OPERATOR_INFO_SUCCESS,
        payload: { dthOperatorInfo, status, message },
      });
      return { dthOperatorInfo, status, message };
    } else {
      dispatch({
        type: FIND_DTH_OPERATOR_INFO_FAILURE,
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
      type: FIND_DTH_OPERATOR_INFO_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const dthPlanFetch = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/dth/plan-fetch`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: dthRechargePlan, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: DTH_RECHARGE_PLAN_FETCH_SUCCESS,
        payload: { dthRechargePlan, status, message },
      });
      return { dthRechargePlan, status, message };
    } else {
      dispatch({
        type: DTH_RECHARGE_PLAN_FETCH_FAILURE,
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
      type: DTH_RECHARGE_PLAN_FETCH_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const dthPay = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/dth/recharge`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: dthRecharge, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: DTH_RECHARGE_SUCCESS,
        payload: { dthRecharge, status, message },
      });
      return { dthRecharge, status, message };
    } else {
      dispatch({
        type: DTH_RECHARGE_FAILURE,
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
      type: DTH_RECHARGE_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};