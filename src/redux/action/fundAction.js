import axios from "axios";
import secureLocalStorage from "react-secure-storage";
import { API_ROUTE } from "../../data/env";
import { clearAllStorage, isTokenExpiredError } from "../../utils/clearStorage";

import { LOADING_START, LOADING_END } from "../actionType/loadingActionType";
import { ADMIN_APPROVE_FAILURE, ADMIN_APPROVE_SUCCESS, ADMIN_REQUEST_SUCCESS, COMPANY_APPROVE_REQUEST_FAILURE, COMPANY_APPROVE_REQUEST_SUCCESS, COMPANY_BANK_LIST_FAILURE, COMPANY_BANK_LIST_SUCCESS, COMPANY_FUND_LOAD_FAILURE, COMPANY_FUND_LOAD_SUCCESS, COMPANY_GET_ALL_REQUEST_FAILURE, COMPANY_GET_ALL_REQUEST_SUCCESS, DISTRIBUTOR_FUND_APPROVE_FAILURE, DISTRIBUTOR_FUND_APPROVE_SUCCESS, DISTRIBUTOR_FUND_GET_ALL_BANKS_FAILURE, DISTRIBUTOR_FUND_GET_ALL_BANKS_SUCCESS, DISTRIBUTOR_FUND_LOAD_FAILURE, DISTRIBUTOR_FUND_LOAD_SUCCESS, DISTRIBUTOR_FUND_REQUEST_FAILURE, DISTRIBUTOR_FUND_REQUEST_SUCCESS, EMPLOYEE_APPROVE_FAILURE, EMPLOYEE_APPROVE_SUCCESS, EMPLOYEE_REQUEST_FAILURE, EMPLOYEE_REQUEST_SUCCESS, MASTER_DISTRIBUTOR_FUND_APPROVE_FAILURE, MASTER_DISTRIBUTOR_FUND_APPROVE_SUCCESS, MASTER_DISTRIBUTOR_FUND_GET_ALL_BANKS_FAILURE, MASTER_DISTRIBUTOR_FUND_GET_ALL_BANKS_SUCCESS, MASTER_DISTRIBUTOR_FUND_LOAD_FAILURE, MASTER_DISTRIBUTOR_FUND_LOAD_SUCCESS, MASTER_DISTRIBUTOR_FUND_REQUEST_FAILURE, MASTER_DISTRIBUTOR_FUND_REQUEST_SUCCESS, PAN_SERVICE_REQUEST_FAILURE, PAN_SERVICE_REQUEST_SUCCESS, RETAILER_FUND_GET_ALL_BANKS_FAILURE, RETAILER_FUND_GET_ALL_BANKS_SUCCESS, RETAILER_FUND_LOAD_FAILURE, RETAILER_FUND_LOAD_SUCCESS, ADMIN_CREDIT_DEBIT_SUCCESS, ADMIN_CREDIT_DEBIT_FAILURE, EMPLOYEE_CREDIT_DEBIT_SUCCESS, EMPLOYEE_CREDIT_DEBIT_FAILURE } from "../actionType/fundActionType";

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

export const masterdistributerGetFundRequest = (formData) => async (dispatch) => {
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
      `${API_ROUTE}/api/v1/user/fund/fund-requests`,
      formData,
      {
        headers,
      }
    );

    const { data: mdFundrequest, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: MASTER_DISTRIBUTOR_FUND_REQUEST_SUCCESS,
        payload: { mdFundrequest, status, message },
      });
      return { mdFundrequest, status, message };
    } else {
      dispatch({
        type: MASTER_DISTRIBUTOR_FUND_REQUEST_FAILURE,
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
      type: MASTER_DISTRIBUTOR_FUND_REQUEST_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const masterdistributerApproveFundRequest = (formData) => async (dispatch) => {
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
      `${API_ROUTE}/api/v1/user/fund/approve-fund-request`,
      formData,
      {
        headers,
      }
    );

    const { data: mdFundapprove, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: MASTER_DISTRIBUTOR_FUND_APPROVE_SUCCESS,
        payload: { mdFundapprove, status, message },
      });
      return { mdFundapprove, status, message };
    } else {
      dispatch({
        type: MASTER_DISTRIBUTOR_FUND_APPROVE_FAILURE,
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
      type: MASTER_DISTRIBUTOR_FUND_APPROVE_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const companyGetBanks = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const token = typeof authToken === 'string' ? authToken : String(authToken || '');

    const response = await axios.post(
      `${API_ROUTE}/api/v1/company/fund/all-bank-details`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const { data: companyBankLists, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: COMPANY_BANK_LIST_SUCCESS,
        payload: { companyBankLists, status, message },
      });
      return { companyBankLists, status, message };
    } else {
      dispatch({
        type: COMPANY_BANK_LIST_FAILURE,
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
      type: COMPANY_BANK_LIST_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const companyFundLoad = (formData) => async (dispatch) => {
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
      `${API_ROUTE}/api/v1/company/fund/fund-transfer-request`,
      formData,
      {
        headers,
      }
    );

    const { data: companyFundload, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: COMPANY_FUND_LOAD_SUCCESS,
        payload: { companyFundload, status, message },
      });
      return { companyFundload, status, message };
    } else {
      dispatch({
        type: COMPANY_FUND_LOAD_FAILURE,
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
      type: COMPANY_FUND_LOAD_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const companyGetAllRequest = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const token = typeof authToken === 'string' ? authToken : String(authToken || '');

    const response = await axios.post(
      `${API_ROUTE}/api/v1/company/fund/fund-requests`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const { data: companyRequest, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: COMPANY_GET_ALL_REQUEST_SUCCESS,
        payload: { companyRequest, status, message },
      });
      return { companyRequest, status, message };
    } else {
      dispatch({
        type: COMPANY_GET_ALL_REQUEST_FAILURE,
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
      type: COMPANY_GET_ALL_REQUEST_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const companyApproveRequest = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const token = typeof authToken === 'string' ? authToken : String(authToken || '');

    const response = await axios.post(
      `${API_ROUTE}/api/v1/company/fund/approve-fund-request`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const { data: companyApprove, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: COMPANY_APPROVE_REQUEST_SUCCESS,
        payload: { companyApprove, status, message },
      });
      return { companyApprove, status, message };
    } else {
      dispatch({
        type: COMPANY_APPROVE_REQUEST_FAILURE,
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
      type: COMPANY_APPROVE_REQUEST_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const adminGetRequest = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const token = typeof authToken === 'string' ? authToken : String(authToken || '');

    const response = await axios.post(
      `${API_ROUTE}/api/v1/admin/fund/fund-requests`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const { data: adminGetRequest, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: ADMIN_REQUEST_SUCCESS,
        payload: { adminGetRequest, status, message },
      });
      return { adminGetRequest, status, message };
    } else {
      dispatch({
        type: ADMIN_REQUEST_FAILURE,
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
    // Check if token expired
    if (isTokenExpiredError(error)) {
      clearAllStorage();
    }

    const errorMessage = error.response
      ? error.response.data.message
      : error.message;
    dispatch({
      type: ADMIN_REQUEST_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const employeeGetRequest = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const token = typeof authToken === 'string' ? authToken : String(authToken || '');

    const response = await axios.post(
      `${API_ROUTE}/api/v1/employee/fund/fund-requests`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const { data: employeeGetRequest, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: EMPLOYEE_REQUEST_SUCCESS,
        payload: { employeeGetRequest, status, message },
      });
      return { employeeGetRequest, status, message };
    } else {
      dispatch({
        type: EMPLOYEE_REQUEST_FAILURE,
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
    // Check if token expired
    if (isTokenExpiredError(error)) {
      clearAllStorage();
    }

    const errorMessage = error.response
      ? error.response.data.message
      : error.message;
    dispatch({
      type: EMPLOYEE_REQUEST_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const adminApproveRequest = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const token = typeof authToken === 'string' ? authToken : String(authToken || '');

    const response = await axios.post(
      `${API_ROUTE}/api/v1/admin/fund/approve-fund-request`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const { data: adminApproveRequest, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: ADMIN_APPROVE_SUCCESS,
        payload: { adminApproveRequest, status, message },
      });
      return { adminApproveRequest, status, message };
    } else {
      dispatch({
        type: ADMIN_APPROVE_FAILURE,
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
    // Check if token expired
    if (isTokenExpiredError(error)) {
      clearAllStorage();
    }

    const errorMessage = error.response
      ? error.response.data.message
      : error.message;
    dispatch({
      type: ADMIN_APPROVE_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const employeeApproveRequest = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const token = typeof authToken === 'string' ? authToken : String(authToken || '');

    const response = await axios.post(
      `${API_ROUTE}/api/v1/employee/fund/approve-fund-request`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const { data: employeeApprove, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: EMPLOYEE_APPROVE_SUCCESS,
        payload: { employeeApprove, status, message },
      });
      return { employeeApprove, status, message };
    } else {
      dispatch({
        type: EMPLOYEE_APPROVE_FAILURE,
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
    // Check if token expired
    if (isTokenExpiredError(error)) {
      clearAllStorage();
    }

    const errorMessage = error.response
      ? error.response.data.message
      : error.message;
    dispatch({
      type: EMPLOYEE_APPROVE_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const distributerApproveRequest = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const token = typeof authToken === 'string' ? authToken : String(authToken || '');

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/fund/approve-fund-request`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const { data: dFundapprove, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: DISTRIBUTOR_FUND_APPROVE_SUCCESS,
        payload: { dFundapprove, status, message },
      });
      return { dFundapprove, status, message };
    } else {
      dispatch({
        type: DISTRIBUTOR_FUND_APPROVE_FAILURE,
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
      type: DISTRIBUTOR_FUND_APPROVE_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const distributorGetRequest = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const token = typeof authToken === 'string' ? authToken : String(authToken || '');

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/fund/fund-requests`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const { data: dFundrequest, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: DISTRIBUTOR_FUND_REQUEST_SUCCESS,
        payload: { dFundrequest, status, message },
      });
      return { dFundrequest, status, message };
    } else {
      dispatch({
        type: DISTRIBUTOR_FUND_REQUEST_FAILURE,
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
      type: DISTRIBUTOR_FUND_REQUEST_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const PanRequest = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const token = typeof authToken === 'string' ? authToken : String(authToken || '');

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/pan1/actions`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const { data: panServiceRequest, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: PAN_SERVICE_REQUEST_SUCCESS,
        payload: { panServiceRequest, status, message },
      });
      return { panServiceRequest, status, message };
    } else {
      // Also return the data object for FAILURE cases so component can access it
      dispatch({
        type: PAN_SERVICE_REQUEST_FAILURE,
        payload: {
          status: response?.data?.status ?? "FAILURE",
          message: response?.data?.message ?? commonError,
          panServiceRequest: panServiceRequest, // Include data object
        },
      });
      return {
        status: response?.data?.status ?? "FAILURE",
        message: response?.data?.message ?? commonError,
        panServiceRequest: panServiceRequest, // Include data object
      };
    }
  } catch (error) {
    const errorMessage = error.response
      ? error.response.data.message
      : error.message;
    dispatch({
      type: PAN_SERVICE_REQUEST_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const PanAOneRequest = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const token = typeof authToken === 'string' ? authToken : String(authToken || '');

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/pan2/actions`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const { data: panServiceRequest, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: PAN_SERVICE_REQUEST_SUCCESS,
        payload: { panServiceRequest, status, message },
      });
      return { panServiceRequest, status, message };
    } else {
      // Also return the data object for FAILURE cases so component can access it
      dispatch({
        type: PAN_SERVICE_REQUEST_FAILURE,
        payload: {
          status: response?.data?.status ?? "FAILURE",
          message: response?.data?.message ?? commonError,
          panServiceRequest: panServiceRequest, // Include data object
        },
      });
      return {
        status: response?.data?.status ?? "FAILURE",
        message: response?.data?.message ?? commonError,
        panServiceRequest: panServiceRequest, // Include data object
      };
    }
  } catch (error) {
    const errorMessage = error.response
      ? error.response.data.message
      : error.message;
    dispatch({
      type: PAN_SERVICE_REQUEST_FAILURE,
      payload: errorMessage,
    });
    throw error;
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const adminCreditDebit = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const token = typeof authToken === 'string' ? authToken : String(authToken || '');

    const response = await axios.post(
      `${API_ROUTE}/api/v1/admin/fund/credit-debit`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const { status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: ADMIN_CREDIT_DEBIT_SUCCESS,
        payload: { status, message },
      });
      return { status, message };
    } else {
      dispatch({
        type: ADMIN_CREDIT_DEBIT_FAILURE,
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
    if (isTokenExpiredError(error)) {
      clearAllStorage();
    }
    const errorMessage = error.response
      ? error.response.data.message
      : error.message;
    dispatch({
      type: ADMIN_CREDIT_DEBIT_FAILURE,
      payload: errorMessage,
    });
    return {
      status: "FAILURE",
      message: errorMessage || commonError,
    };
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const employeeCreditDebit = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const token = typeof authToken === 'string' ? authToken : String(authToken || '');

    const response = await axios.post(
      `${API_ROUTE}/api/v1/employee/fund/credit-debit`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const { status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: EMPLOYEE_CREDIT_DEBIT_SUCCESS,
        payload: { status, message },
      });
      return { status, message };
    } else {
      dispatch({
        type: EMPLOYEE_CREDIT_DEBIT_FAILURE,
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
    if (isTokenExpiredError(error)) {
      clearAllStorage();
    }
    const errorMessage = error.response
      ? error.response.data.message
      : error.message;
    dispatch({
      type: EMPLOYEE_CREDIT_DEBIT_FAILURE,
      payload: errorMessage,
    });
    return {
      status: "FAILURE",
      message: errorMessage || commonError,
    };
  } finally {
    dispatch({ type: LOADING_END });
  }
};