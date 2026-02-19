import axios from "axios";
import secureLocalStorage from "react-secure-storage";
import {
  GET_PROFILE_START,
  GET_PROFILE_SUCCESS,
  GET_PROFILE_FAILURE,
  GET_PROFILE_UNAUTHORIZED,
  ADMIN_ROLES_PERMISSION_SUCCESS,
  ADMIN_ROLES_PERMISSION_FAILURE,
  UPDATE_ROLES_PERMISSION_SUCESS,
  UPDATE_ROLES_PERMISSION_FAILURE,
  ADD_BANK_DETAILS_SUCCESS,
  ADD_BANK_DETAILS_FAILURE,
  ADD_BANK_COMPANY_SUCCESS,
  ADD_BANK_COMPANY_FAILURE,
  ADD_BANK_ADMIN_SUCCESS,
  ADD_BANK_ADMIN_FAILURE,
  GET_ADMIN_DETAILS_SUCCESS,
  GET_ADMIN_DETAILS_FAILURE,
  GET_ADMIN_PROFILE_SUCCESS,
  GET_ADMIN_PROFILE_FAILURE,
  DELETE_BANK_ADMIN_FAILURE,
  DELETE_BANK_ADMIN_SUCCESS,
  DELETE_BANK_COMPANY_FAILURE,
  DELETE_BANK_COMPANY_SUCCESS,
  DELETE_BANK_USER_FAILURE,
  DELETE_BANK_USER_SUCCESS,
  SET_SELECTED_USER_ROLE,
  UPDATE_BANK_USER_SUCCESS,
  UPDATE_BANK_USER_FAILURE,
} from "../actionType/userProfileActionType";
import { API_ROUTE } from "../../data/env";
import { LOADING_START, LOADING_END } from "../actionType/loadingActionType";
import { logout } from "./authAction";

const commonError = "Something went wrong!";

export const getUserProfile = () => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: GET_PROFILE_START });

  const authToken = secureLocalStorage.getItem("userToken");

  try {
    if (!authToken) {
      dispatch({
        type: GET_PROFILE_FAILURE,
        payload: "Authentication token is missing. Please login again.",
      });
      dispatch({ type: LOADING_END });
      return;
    }

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/userDetails/getProfile`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

    const data = response?.data;
    const { status } = data ?? {};

    if (status === "SUCCESS" || status === 200) {
      dispatch({
        type: GET_PROFILE_SUCCESS,
        payload: data?.data || {},
      });
    } else if (status === "UNAUTHORIZED") {
      const errorMessage =
        data?.message || "Invalid token. Please login again.";

      // Clear all auth tokens and cached auth data on unauthorized
      try {
        secureLocalStorage.removeItem("userToken");
        secureLocalStorage.removeItem("loginToken");
        secureLocalStorage.removeItem("refreshToken");
        secureLocalStorage.removeItem("userData");
        secureLocalStorage.removeItem("permissions");
        secureLocalStorage.removeItem("onboardingSteps");
        secureLocalStorage.removeItem("onboardingToken");
        secureLocalStorage.removeItem("companyId");
        secureLocalStorage.removeItem("selectedCompany");
        // Also clear any auth-related items from regular localStorage
        localStorage.removeItem("auth");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } catch (e) {
        // ignore storage errors
      }

      // Clear auth state in Redux
      dispatch(logout());

      // Mark profile as unauthorized so UI can redirect once
      dispatch({
        type: GET_PROFILE_UNAUTHORIZED,
        payload: errorMessage,
      });
    } else {
      const errorMessage = data?.message || commonError;
      dispatch({
        type: GET_PROFILE_FAILURE,
        payload: errorMessage,
      });
    }
  } catch (error) {
    if (
      error?.response?.status === 401 ||
      error?.response?.data?.status === "UNAUTHORIZED"
    ) {
      const errorMessage =
        error?.response?.data?.message || "Invalid token. Please login again.";

      // Clear all tokens and cached auth data from storage
      try {
        secureLocalStorage.removeItem("userToken");
        secureLocalStorage.removeItem("loginToken");
        secureLocalStorage.removeItem("refreshToken");
        secureLocalStorage.removeItem("userData");
        secureLocalStorage.removeItem("permissions");
        secureLocalStorage.removeItem("onboardingSteps");
        secureLocalStorage.removeItem("onboardingToken");
        secureLocalStorage.removeItem("companyId");
        secureLocalStorage.removeItem("selectedCompany");
        localStorage.removeItem("auth");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } catch (e) {
        // ignore storage errors
      }

      // Dispatch logout to clear auth state
      dispatch(logout());

      // Dispatch unauthorized action so UI can redirect once
      dispatch({
        type: GET_PROFILE_UNAUTHORIZED,
        payload: errorMessage,
      });
    } else {
      const errorMessage =
        error?.response?.data?.message || error?.message || commonError;
      dispatch({
        type: GET_PROFILE_FAILURE,
        payload: errorMessage,
      });
    }
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// Simple action to store currently selected user's role for ProfileDetails
export const setSelectedUserRole = (role) => ({
  type: SET_SELECTED_USER_ROLE,
  payload: role,
});

export const getPermission = (id) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.get(
      `${API_ROUTE}/api/v1/admin/rolesAndPermissions/roles/${id}/permissions`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

    const {
      data: adminRolesPermission,
      message,
      status,
    } = response?.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: ADMIN_ROLES_PERMISSION_SUCCESS,
        payload: { adminRolesPermission, message, status },
      });
    } else {
      dispatch({
        type: ADMIN_ROLES_PERMISSION_FAILURE,
        payload: { message, status, errorData: response?.data },
      });
    }
  } catch (error) {
    dispatch({
      type: ADMIN_ROLES_PERMISSION_FAILURE,
      payload: {
        message: error.response ? error.response.data.message : error.message,
        status: "Error",
      },
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const updateRolesPermission = (body) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.put(
      `${API_ROUTE}/api/v1/admin/rolesAndPermissions/roles/permissions`,
      body,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

    const { data: updateRoles, message, status } = response?.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: UPDATE_ROLES_PERMISSION_SUCESS,
        payload: { updateRoles, message, status },
      });
    } else {
      dispatch({
        type: UPDATE_ROLES_PERMISSION_FAILURE,
        payload: { message, status, errorData: response?.data },
      });
    }
  } catch (error) {
    dispatch({
      type: UPDATE_ROLES_PERMISSION_FAILURE,
      payload: {
        message: error.response ? error.response.data.message : error.message,
        status: "Error",
      },
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const addBankDetails = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/bank/add`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

    const { data: bankDetailsResponse, message, status } = response?.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: ADD_BANK_DETAILS_SUCCESS,
        payload: { bankDetailsResponse, message, status },
      });
    } else {
      dispatch({
        type: ADD_BANK_DETAILS_FAILURE,
        payload: { message, status, errorData: response?.data },
      });
    }
  } catch (error) {
    dispatch({
      type: ADD_BANK_DETAILS_FAILURE,
      payload: {
        message: error.response ? error.response.data.message : error.message,
        status: "Error",
      },
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const addBankCompanyDetails = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.post(
      `${API_ROUTE}/api/v1/company/bank/add`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

    const { data: bankCompanyResponse, message, status } = response?.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: ADD_BANK_COMPANY_SUCCESS,
        payload: { bankCompanyResponse, message, status },
      });
    } else {
      dispatch({
        type: ADD_BANK_COMPANY_FAILURE,
        payload: { message, status, errorData: response?.data },
      });
    }
  } catch (error) {
    dispatch({
      type: ADD_BANK_COMPANY_FAILURE,
      payload: {
        message: error.response ? error.response.data.message : error.message,
        status: "Error",
      },
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const addBankAdminDetails = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.post(
      `${API_ROUTE}/api/v1/admin/bank/addBank`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

    const { data: bankAdminResponse, message, status } = response?.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: ADD_BANK_ADMIN_SUCCESS,
        payload: { bankAdminResponse, message, status },
      });
    } else {
      dispatch({
        type: ADD_BANK_ADMIN_FAILURE,
        payload: { message, status, errorData: response?.data },
      });
    }
  } catch (error) {
    dispatch({
      type: ADD_BANK_ADMIN_FAILURE,
      payload: {
        message: error.response ? error.response.data.message : error.message,
        status: "Error",
      },
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const getAdminDetails = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.post(
      `${API_ROUTE}/api/v1/admin/users/getProfile`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

    const {
      data: adminDetailsResponse,
      message,
      status,
    } = response?.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: GET_ADMIN_DETAILS_SUCCESS,
        payload: { adminDetailsResponse, message, status },
      });
    } else {
      dispatch({
        type: GET_ADMIN_DETAILS_FAILURE,
        payload: { message, status, errorData: response?.data },
      });
    }
  } catch (error) {
    dispatch({
      type: GET_ADMIN_DETAILS_FAILURE,
      payload: {
        message: error.response ? error.response.data.message : error.message,
        status: "Error",
      },
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const getAdminProfileDetails = (id) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.post(
      `${API_ROUTE}/api/v1/admin/users/profile/${id}`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

    const {
      data: adminProfileResponse,
      message,
      status,
    } = response?.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: GET_ADMIN_PROFILE_SUCCESS,
        payload: { adminProfileResponse, message, status },
      });
    } else {
      dispatch({
        type: GET_ADMIN_PROFILE_FAILURE,
        payload: { message, status, errorData: response?.data },
      });
    }
  } catch (error) {
    dispatch({
      type: GET_ADMIN_PROFILE_FAILURE,
      payload: {
        message: error.response ? error.response.data.message : error.message,
        status: "Error",
      },
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const deleteUserBank = (bankId) => async (dispatch) => {
  try {
    const token = secureLocalStorage.getItem("userToken");

    const res = await axios.post(
      `${API_ROUTE}/api/v1/user/bank/delete/${bankId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );

    if (res.data?.status === "SUCCESS") {
      dispatch({
        type: DELETE_BANK_USER_SUCCESS,
        payload: bankId,
      });
    } else {
      dispatch({
        type: DELETE_BANK_USER_FAILURE,
        payload: res.data?.message || "Delete failed",
      });
    }
  } catch (error) {
    dispatch({
      type: DELETE_BANK_USER_FAILURE,
      payload: error.message,
    });
  }
};

export const deleteCompanyBank = (bankId) => async (dispatch) => {
  try {
    const token = secureLocalStorage.getItem("userToken");

    const res = await axios.post(
      `${API_ROUTE}/api/v1/company/bank/delete/${bankId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );

    if (res.data?.status === "SUCCESS") {
      dispatch({
        type: DELETE_BANK_COMPANY_SUCCESS,
        payload: bankId,
      });
    } else {
      dispatch({
        type: DELETE_BANK_COMPANY_FAILURE,
        payload: res.data?.message || "Delete failed",
      });
    }
  } catch (error) {
    dispatch({
      type: DELETE_BANK_COMPANY_FAILURE,
      payload: error.message,
    });
  }
};

export const deleteAdminBank = (bankId) => async (dispatch) => {
  try {
    const token = secureLocalStorage.getItem("userToken");

    const res = await axios.post(
      `${API_ROUTE}/api/v1/admin/bank/delete/${bankId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );

    if (res.data?.status === "SUCCESS") {
      dispatch({
        type: DELETE_BANK_ADMIN_SUCCESS,
        payload: bankId,
      });
    } else {
      dispatch({
        type: DELETE_BANK_ADMIN_FAILURE,
        payload: res.data?.message || "Delete failed",
      });
    }
  } catch (error) {
    dispatch({
      type: DELETE_BANK_ADMIN_FAILURE,
      payload: error.message,
    });
  }
};

export const updateBankDetails = (payload, id) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.put(
      `${API_ROUTE}api/v1/user/bank/update/${id}`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

    const { data: bankUpdateResponse, message, status } = response?.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: UPDATE_BANK_USER_SUCCESS,
        payload: { bankUpdateResponse, message, status },
      });
    } else {
      dispatch({
        type: UPDATE_BANK_USER_FAILURE,
        payload: { message, status, errorData: response?.data },
      });
    }
  } catch (error) {
    dispatch({
      type: UPDATE_BANK_USER_FAILURE,
      payload: {
        message: error.response ? error.response.data.message : error.message,
        status: "Error",
      },
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};