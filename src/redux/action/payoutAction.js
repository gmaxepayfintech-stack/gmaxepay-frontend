import axios from "axios";
import secureLocalStorage from "react-secure-storage";
import { API_ROUTE } from "../../data/env";

import { LOADING_START, LOADING_END } from "../actionType/loadingActionType";
import {
  PAYOUT_BANK_LIST_SUCCESS,
  PAYOUT_BANK_LIST_FAILURE,
  PAYOUT_TRANSACTION_SUCCESS,
  PAYOUT_TRANSACTION_FAILURE,
  COMPANY_PAYOUT_BANK_LIST_SUCCESS,
  COMPANY_PAYOUT_BANK_LIST_FAILURE,
  COMPANY_PAYOUT_TRANSACTION_SUCCESS,
  COMPANY_PAYOUT_TRANSACTION_FAILURE,
  PAYOUT_HISTORY_SUCCESS,
  PAYOUT_HISTORY_FAILURE,
  PAYOUT_HISTORY_COMPANY_FAILURE,
  PAYOUT_HISTORY_USER_SUCCESS,
  PAYOUT_HISTORY_USER_FAILURE,
} from "../actionType/payOutType";
const commonError = "Something went wrong!";

export const payoutBankList = (values) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/payout/bank-list`,
      { values },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

    const { data: payoutBankList, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: PAYOUT_BANK_LIST_SUCCESS,
        payload: { data: payoutBankList, status, message },
      });
      return { data: payoutBankList, status, message };
    } else {
      dispatch({
        type: PAYOUT_BANK_LIST_FAILURE,
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
      type: PAYOUT_BANK_LIST_FAILURE,
      payload: {
        status: "FAILURE",
        message: errorMessage,
      },
    });
    return {
      status: "FAILURE",
      message: errorMessage,
    };
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const payoutTransaction = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");
    console.log("payload", payload);
    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/payout`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

    const { data: payoutTransaction, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: PAYOUT_TRANSACTION_SUCCESS,
        payload: { data: payoutTransaction, status, message },
      });
      return { data: payoutTransaction, status, message };
    } else {
      dispatch({
        type: PAYOUT_TRANSACTION_FAILURE,
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
      type: PAYOUT_TRANSACTION_FAILURE,
      payload: {
        status: "FAILURE",
        message: errorMessage,
      },
    });
    return {
      status: "FAILURE",
      message: errorMessage,
    };
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const payoutCompanyBankList = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");
    console.log("payload", payload);
    const response = await axios.post(
      `${API_ROUTE}/api/v1/company/payout/bank-list`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

    const {
      data: payoutCompanyBankList,
      status,
      message,
    } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: COMPANY_PAYOUT_BANK_LIST_SUCCESS,
        payload: { data: payoutCompanyBankList, status, message },
      });
      return { data: payoutCompanyBankList, status, message };
    } else {
      dispatch({
        type: COMPANY_PAYOUT_BANK_LIST_FAILURE,
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
      type: COMPANY_PAYOUT_BANK_LIST_FAILURE,
      payload: {
        status: "FAILURE",
        message: errorMessage,
      },
    });
    return {
      status: "FAILURE",
      message: errorMessage,
    };
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const payoutCompanyTransaction = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");
    console.log("payload", payload);
    const response = await axios.post(
      `${API_ROUTE}/api/v1/company/payout`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

    const {
      data: payoutCompanyTransaction,
      status,
      message,
    } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: COMPANY_PAYOUT_TRANSACTION_SUCCESS,
        payload: { data: payoutCompanyTransaction, status, message },
      });
      return { data: payoutCompanyTransaction, status, message };
    } else {
      dispatch({
        type: COMPANY_PAYOUT_TRANSACTION_FAILURE,
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
      type: COMPANY_PAYOUT_TRANSACTION_FAILURE,
      payload: {
        status: "FAILURE",
        message: errorMessage,
      },
    });
    return {
      status: "FAILURE",
      message: errorMessage,
    };
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const getPayoutHistory = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");

    const requestPayload = {
      query: payload?.query || {},
      customSearch: payload?.customSearch || {},
      options: {
        page: payload?.options?.page || 1,
        paginate: payload?.options?.paginate || 10,
        sort: payload?.options?.sort || { id: 1 },
      },
    };

    const response = await axios.post(
      `${API_ROUTE}/api/v1/admin/payout/history`,
      requestPayload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

    const {
      data: payoutHistory,
      status,
      message,
      total,
      count,
      paginator,
    } = response?.data ?? {};

    if (status === "SUCCESS") {
      const dispatchPayload = {
        data: payoutHistory,
        status,
        message,
        total: total || payoutHistory?.length || 0,
        count,
        paginator: paginator || {
          currentPage: requestPayload.options.page,
          perPage: requestPayload.options.paginate,
          pageCount: Math.ceil(
            (payoutHistory?.length || 0) / requestPayload.options.paginate,
          ),
        },
      };

      dispatch({
        type: PAYOUT_HISTORY_SUCCESS,
        payload: dispatchPayload,
      });
      return dispatchPayload;
    } else {
      dispatch({
        type: PAYOUT_HISTORY_FAILURE,
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
      type: PAYOUT_HISTORY_FAILURE,
      payload: {
        status: "FAILURE",
        message: errorMessage,
      },
    });
    return {
      status: "FAILURE",
      message: errorMessage,
    };
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// ✅ COMPANY PAYOUT HISTORY
export const getPayoutHistoryCompany = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");

    const requestPayload = {
      query: payload?.query || {},
      customSearch: payload?.customSearch || {},
      options: {
        page: payload?.options?.page || 1,
        paginate: payload?.options?.paginate || 10,
        sort: payload?.options?.sort || { id: 1 },
      },
    };

    const response = await axios.post(
      `${API_ROUTE}/api/v1/company/payout/history`,
      requestPayload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

    const {
      data: payoutHistoryCompany,
      status,
      message,
      total,
      count,
      paginator,
    } = response?.data ?? {};

    if (status === "SUCCESS") {
      const dispatchPayload = {
        data: payoutHistoryCompany,
        status,
        message,
        total: total || payoutHistoryCompany?.length || 0,
        count,
        paginator: paginator || {
          currentPage: requestPayload.options.page,
          perPage: requestPayload.options.paginate,
          pageCount: Math.ceil(
            (payoutHistoryCompany?.length || 0) /
              requestPayload.options.paginate,
          ),
        },
      };

      dispatch({
        type: PAYOUT_HISTORY_COMPANY_SUCCESS,
        payload: dispatchPayload,
      });
      return dispatchPayload;
    } else {
      dispatch({
        type: PAYOUT_HISTORY_COMPANY_FAILURE,
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
      type: PAYOUT_HISTORY_COMPANY_FAILURE,
      payload: {
        status: "FAILURE",
        message: errorMessage,
      },
    });
    return {
      status: "FAILURE",
      message: errorMessage,
    };
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// ✅ USER PAYOUT HISTORY
export const getPayoutHistoryUser = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");

    const requestPayload = {
      query: payload?.query || {},
      customSearch: payload?.customSearch || {},
      options: {
        page: payload?.options?.page || 1,
        paginate: payload?.options?.paginate || 10,
        sort: payload?.options?.sort || { id: 1 },
      },
    };

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/payout/history`,
      requestPayload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

    const {
      data: payoutHistoryUser,
      status,
      message,
      total,
      count,
      paginator,
    } = response?.data ?? {};

    if (status === "SUCCESS") {
      const dispatchPayload = {
        data: payoutHistoryUser,
        status,
        message,
        total: total || payoutHistoryUser?.length || 0,
        count,
        paginator: paginator || {
          currentPage: requestPayload.options.page,
          perPage: requestPayload.options.paginate,
          pageCount: Math.ceil(
            (payoutHistoryUser?.length || 0) / requestPayload.options.paginate,
          ),
        },
      };

      dispatch({
        type: PAYOUT_HISTORY_USER_SUCCESS,
        payload: dispatchPayload,
      });
      return dispatchPayload;
    } else {
      dispatch({
        type: PAYOUT_HISTORY_USER_FAILURE,
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
      type: PAYOUT_HISTORY_USER_FAILURE,
      payload: {
        status: "FAILURE",
        message: errorMessage,
      },
    });
    return {
      status: "FAILURE",
      message: errorMessage,
    };
  } finally {
    dispatch({ type: LOADING_END });
  }
};
