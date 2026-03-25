import axios from "axios";
import secureLocalStorage from "react-secure-storage";
import { API_ROUTE } from "../../data/env";

import { LOADING_START, LOADING_END } from "../actionType/loadingActionType";
import { CMS_PROCESS_STATUS_FAILURE, CMS_PROCESS_STATUS_SUCCESS, DTH_RECHARGE_FAILURE, DTH_RECHARGE_PLAN_FETCH_FAILURE, DTH_RECHARGE_PLAN_FETCH_SUCCESS, DTH_RECHARGE_SUCCESS, FIND_DTH_OPERATOR_INFO_FAILURE, FIND_DTH_OPERATOR_INFO_SUCCESS, FIND_MOBILE_OPERATOR_FAILURE, FIND_MOBILE_OPERATOR_SUCCESS, FIND_MOBILE_RECHARGE_OFFERS_FAILURE, FIND_MOBILE_RECHARGE_OFFERS_SUCCESS, FIND_MOBILE_RECHARGE_PLAN_FAILURE, FIND_MOBILE_RECHARGE_PLAN_SUCCESS, PAY_RECHARGE_FAILURE, PAY_RECHARGE_SUCCESS, RECENT_HISTORY_FAILURE, RECENT_HISTORY_SUCCESS } from "../actionType/rechargeActionType";

const commonError = "Something went wrong!";

export const rechargefindOperator = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/recharge1/find-mobile-operator`,
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
      `${API_ROUTE}/api/v1/user/recharge1/find-recharge-plan`,
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
      `${API_ROUTE}/api/v1/user/recharge1/recharge-offer`,
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
      `${API_ROUTE}/api/v1/user/recharge1/pay`,
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
      `${API_ROUTE}/api/v1/user/dth1/customer-info`,
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
      `${API_ROUTE}/api/v1/user/dth1/plan-fetch`,
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
      `${API_ROUTE}/api/v1/user/dth1/recharge`,
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

export const recentHistory = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/recharge1/recent-history`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: recentHistory, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: RECENT_HISTORY_SUCCESS,
        payload: { recentHistory, status, message },
      });
      return { recentHistory, status, message };
    } else {
      dispatch({
        type: RECENT_HISTORY_FAILURE,
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
      type: RECENT_HISTORY_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const rechargeAOnefindOperator = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/recharge2/find-mobile-operator`,
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

export const rechargeAOnefindPlan = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/recharge2/find-recharge-plan`,
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

export const rechargeAOnefindOffers = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/recharge2/recharge-offer`,
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

export const rechargeAOnePay = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/recharge2/pay`,
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

export const recentAOneHistory = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/recharge2/recent-history`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: recentHistory, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: RECENT_HISTORY_SUCCESS,
        payload: { recentHistory, status, message },
      });
      return { recentHistory, status, message };
    } else {
      dispatch({
        type: RECENT_HISTORY_FAILURE,
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
      type: RECENT_HISTORY_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const dthAOneCustomerInfo = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/dth2/customer-info`,
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

export const dthAOnePlanFetch = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/dth2/plan-fetch`,
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

export const dthAOnePay = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/dth2/recharge`,
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

export const cmsProcessStatus = () => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/cms/initiate`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: cmsProcessStatus, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: CMS_PROCESS_STATUS_SUCCESS,
        payload: { cmsProcessStatus, status, message },
      });
      return { cmsProcessStatus, status, message };
    } else {
      dispatch({
        type: CMS_PROCESS_STATUS_FAILURE,
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
      type: CMS_PROCESS_STATUS_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};