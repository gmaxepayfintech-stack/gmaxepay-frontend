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
  GET_WHITELABEL_LIST_SUCCESS,
  GET_WHITELABEL_LIST_FAILURE,
  FETCH_KYC_DETAILS_SUCCESS,
  FETCH_KYC_DETAILS_FAILURE,
  GET_KYCSTATUS_SUCCESS,
  GET_KYCSTATUS_FAILURE,
  UPDATE_KYCSTATUS_SUCCESS,
  UPDATE_KYCSTATUS_FAILURE,
  KYC_LOCK_STATUS_SUCCESS,
  KYC_LOCK_STATUS_FAILURE,
  REVERT_KYC_DETAILS_SUCCESS,
  REVERT_KYC_DETAILS_FAILURE,
  RESEND_ONBOARDING_LINK_SUCCESS,
  RESEND_ONBOARDING_LINK_FAILURE,
  DEACTIVATE_ONBOARDING_LINK_SUCCESS,
  DEACTIVATE_ONBOARDING_LINK_FAILURE,
  GET_COMPANY_ADMIN_SUCCESS,
  GET_COMPANY_ADMIN_FAILURE,
  GET_USER_DETAILS_SUCCESS,
  GET_USER_DETAILS_FAILURE,
  GET_REPORT_TO_USER_LIST_SUCCESS,
  GET_REPORT_TO_USER_LIST_FAILURE,
  GET_MD_DETAILS_SUCCESS,
  GET_MD_DETAILS_FAILURE,
  GET_REPORT_TO_DOWNLINE_SUCCESS,
  GET_REPORT_TO_DOWNLINE_FAILURE,
  GET_USER_ADMIN_SUCCESS,
  GET_USER_ADMIN_FAILURE,
  FETCH_KYC_DETAILS_COMPANY_SUCCESS,
  FETCH_KYC_DETAILS_COMPANY_FAILURE,
  FETCH_KYC_DETAILS_USER_SUCCESS,
  FETCH_KYC_DETAILS_USER_FAILURE,
  REVERT_USER_KYC_DETAILS_SUCCESS,
  REVERT_USER_KYC_DETAILS_FAILURE,
  CREATE_EMPLOYEE_SUCCESS,
  CREATE_EMPLOYEE_FAILURE,
  RESND_LOGIN_ACCESS_SUCCESS,
  RESND_LOGIN_ACCESS_FAILURE,
  EMPLOYEE_LIST_SUCCESS,
  EMPLOYEE_LIST_FAILURE,
  EMPLOYEE_GET_WHITELABEL_LIST_FAILURE,
  EMPLOYEE_GET_WHITELABEL_LIST_SUCCESS,
  EMPLOYEE_GET_CITY_BY_PINCODE_SUCCESS,
  EMPLOYEE_GET_CITY_BY_PINCODE_FAILURE,
  EMPLOYEE_FETCH_KYC_DETAILS_FAILURE,
  EMPLOYEE_FETCH_KYC_DETAILS_SUCCESS,
  COMPANY_AEPS_STATUS_SUCCESS,
  COMPANY_AEPS_STATUS_FAILURE,
  EMPLOYEE_AEPS_STATUS_SUCCESS,
  EMPLOYEE_AEPS_STATUS_FAILURE,
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

    const { data: ipResponse, status, success, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: GET_IP_CHECK_SUCCESS,
        payload: { ipResponse, success, message },
      });
      return { status: "SUCCESS", message: message || "IP Check successful", data: ipResponse };
    } else {
      dispatch({
        type: GET_IP_CHECK_FAILURE,
        payload: response?.data?.message ?? commonError,
      });
      return { status: "FAILURE", message: response?.data?.message || commonError };
    }
  } catch (error) {
    dispatch({
      type: GET_IP_CHECK_FAILURE,
      payload: error.response ? error.response.data.message : error.message,
    });
    return { status: "FAILURE", message: error.response ? error.response.data.message : error.message };
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

    const { data: pincodeByCity, status, message } = response?.data ?? {};
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

    const { data: panData, message: outerMessage } = response?.data ?? {};
    const status = response?.data?.data?.status;
    const innerMessage = response?.data?.data?.message || response?.data?.data?.error;

    if (status === "Success") {
      dispatch({
        type: GET_PANDATA_FETCH_SUCCESS,
        payload: { panData, message: innerMessage || outerMessage, status }, // 👈 include status here
      });
      return { status: "SUCCESS", message: innerMessage || outerMessage || "PAN fetched successfully", data: panData };
    } else if (status === "Failure") {
      dispatch({
        type: GET_PANDATA_FETCH_FAILURE,
        payload: { message: innerMessage || "Failed to verify PAN", status, errorData: response?.data },
      });
      return { status: "FAILURE", message: innerMessage || "Invalid PAN Number" };
    }
    return { status: "FAILURE", message: "Unknown response status" };
  } catch (error) {
    dispatch({
      type: GET_PANDATA_FETCH_FAILURE,
      payload: {
        message: error.response ? error.response.data.message : error.message,
        status: "Error", // 👈 optional but useful
      },
    });
    return { status: "FAILURE", message: error.response ? error.response.data.message : error.message };
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
    //console.log("response for ip api", response?.data);

    const { data: createResponse, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: WHITELABEL_CREATE_SUCCESS,
        payload: { createResponse, status, message },
      });
      return { status: "SUCCESS", message: message || "Whitelabel created successfully" };
    } else {
      dispatch({
        type: WHITELABEL_CREATE_FAILURE,
        payload: response?.data?.message ?? commonError,
      });
      return { status: "FAILURE", message: response?.data?.message || commonError };
    }
  } catch (error) {
    dispatch({
      type: WHITELABEL_CREATE_FAILURE,
      payload: error.response ? error.response.data.message : error.message,
    });
    return { status: "FAILURE", message: error.response ? error.response.data.message : error.message };
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const useList = (values) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.post(
      `${API_ROUTE}/api/v1/admin/users/list`,
      values,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: whitelabelList, message, status } = response?.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: GET_WHITELABEL_LIST_SUCCESS,
        payload: { whitelabelList, message, status },
      });
    } else {
      dispatch({
        type: GET_WHITELABEL_LIST_FAILURE,
        payload: { message, status, errorData: response?.data },
      });
    }
  } catch (error) {
    dispatch({
      type: GET_WHITELABEL_LIST_FAILURE,
      payload: {
        message: error.response ? error.response.data.message : error.message,
        status: "Error",
      },
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const employeeList = (values) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.post(
      `${API_ROUTE}/api/v1/employee/user/list`,
      values,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: employeeList, message, status } = response?.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: EMPLOYEE_LIST_SUCCESS,
        payload: { employeeList, message, status },
      });
    } else {
      dispatch({
        type: EMPLOYEE_LIST_FAILURE,
        payload: { message, status, errorData: response?.data },
      });
    }
  } catch (error) {
    dispatch({
      type: EMPLOYEE_LIST_FAILURE,
      payload: {
        message: error.response ? error.response.data.message : error.message,
        status: "Error",
      },
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const kycData = (id) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.post(
      `${API_ROUTE}/api/v1/admin/users/kyc/complete/${id}`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data, message, status } = response?.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: FETCH_KYC_DETAILS_SUCCESS,
        payload: { data, message, status },
      });
    } else {
      dispatch({
        type: FETCH_KYC_DETAILS_FAILURE,
        payload: { message, status, errorData: response?.data },
      });
    }
  } catch (error) {
    dispatch({
      type: FETCH_KYC_DETAILS_FAILURE,
      payload: {
        message: error.response ? error.response.data.message : error.message,
        status: "Error",
      },
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const kycStatusData = (id) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.post(
      `${API_ROUTE}/api/v1/admin/users/${id}`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: kycStatusClick, message, status } = response?.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: GET_KYCSTATUS_SUCCESS,
        payload: { kycStatusClick, message, status },
      });
    } else {
      dispatch({
        type: GET_KYCSTATUS_FAILURE,
        payload: { message, status, errorData: response?.data },
      });
    }
  } catch (error) {
    dispatch({
      type: GET_KYCSTATUS_FAILURE,
      payload: {
        message: error.response ? error.response.data.message : error.message,
        status: "Error",
      },
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const kycStatusCheck = (id, body = {}) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.put(
      `${API_ROUTE}/api/v1/admin/users/${id}`,
      body,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: kycStatusCheck, message, status } = response?.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: UPDATE_KYCSTATUS_SUCCESS,
        payload: { kycStatusCheck, message, status },
      });
    } else {
      dispatch({
        type: UPDATE_KYCSTATUS_FAILURE,
        payload: { message, status, errorData: response?.data },
      });
    }
  } catch (error) {
    dispatch({
      type: UPDATE_KYCSTATUS_FAILURE,
      payload: {
        message: error.response ? error.response.data.message : error.message,
        status: "Error",
      },
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const kycUnlock = (id) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.post(
      `${API_ROUTE}/api/v1/admin/users/unlock/${id}`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: kycUnlock, message, status } = response?.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: KYC_LOCK_STATUS_SUCCESS,
        payload: { kycUnlock, message, status },
      });
    } else {
      dispatch({
        type: KYC_LOCK_STATUS_FAILURE,
        payload: { message, status, errorData: response?.data },
      });
    }
  } catch (error) {
    dispatch({
      type: KYC_LOCK_STATUS_FAILURE,
      payload: {
        message: error.response ? error.response.data.message : error.message,
        status: "Error",
      },
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const kycRevert = (id, body = {}) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.post(
      `${API_ROUTE}/api/v1/admin/users/kyc/revert/${id}`,
      body,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: kycRevert, message, status } = response?.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: REVERT_KYC_DETAILS_SUCCESS,
        payload: { kycRevert, message, status },
      });
    } else {
      dispatch({
        type: REVERT_KYC_DETAILS_FAILURE,
        payload: { message, status, errorData: response?.data },
      });
    }
  } catch (error) {
    dispatch({
      type: REVERT_KYC_DETAILS_FAILURE,
      payload: {
        message: error.response ? error.response.data.message : error.message,
        status: "Error",
      },
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const rescendOnboarding = (id) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.post(
      `${API_ROUTE}/api/v1/admin/company/${id}/resend-onboarding-link`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: resendOnboardingLink, message, status } = response?.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: RESEND_ONBOARDING_LINK_SUCCESS,
        payload: { resendOnboardingLink, message, status },
      });
    } else {
      dispatch({
        type: RESEND_ONBOARDING_LINK_FAILURE,
        payload: { message, status, errorData: response?.data },
      });
    }
  } catch (error) {
    dispatch({
      type: RESEND_ONBOARDING_LINK_FAILURE,
      payload: {
        message: error.response ? error.response.data.message : error.message,
        status: "Error",
      },
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const deActiveOnboarding = (id) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.post(
      `${API_ROUTE}/api/v1/admin/company/${authToken}/deactivate-onboarding-link`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: deactivateOnboardingLink, message, status } = response?.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: DEACTIVATE_ONBOARDING_LINK_SUCCESS,
        payload: { deactivateOnboardingLink, message, status },
      });
    } else {
      dispatch({
        type: DEACTIVATE_ONBOARDING_LINK_FAILURE,
        payload: { message, status, errorData: response?.data },
      });
    }
  } catch (error) {
    dispatch({
      type: DEACTIVATE_ONBOARDING_LINK_FAILURE,
      payload: {
        message: error.response ? error.response.data.message : error.message,
        status: "Error",
      },
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const getCompanyAdmin = (userId) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.post(
      `${API_ROUTE}/api/v1/company/user/profile/${userId}`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: companyAdminData, message, status } = response?.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: GET_COMPANY_ADMIN_SUCCESS,
        payload: { companyAdminData, message, status },
      });
    } else {
      dispatch({
        type: GET_COMPANY_ADMIN_FAILURE,
        payload: { message, status, errorData: response?.data },
      });
    }
  } catch (error) {
    dispatch({
      type: GET_COMPANY_ADMIN_FAILURE,
      payload: {
        message: error.response ? error.response.data.message : error.message,
        status: "Error",
      },
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const getUserDetails = () => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.post(
      `${API_ROUTE}/api/v1/company/user/getProfile`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: userDetailsData, message, status } = response?.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: GET_USER_DETAILS_SUCCESS,
        payload: { userDetailsData, message, status },
      });
      return { success: true, data: userDetailsData, message, status };
    } else {
      dispatch({
        type: GET_USER_DETAILS_FAILURE,
        payload: { message, status, errorData: response?.data },
      });
      return { success: false, message, status };
    }
  } catch (error) {
    const errorMessage = error.response ? error.response.data.message : error.message;
    dispatch({
      type: GET_USER_DETAILS_FAILURE,
      payload: {
        message: errorMessage,
        status: "Error",
      },
    });
    return { success: false, message: errorMessage, status: "Error" };
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const getMDDetails = () => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/userDetails/getUserProfile`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: mdDetails, message, status } = response?.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: GET_MD_DETAILS_SUCCESS,
        payload: { mdDetails, message, status },
      });
      return { success: true, data: mdDetails, message, status };
    } else {
      dispatch({
        type: GET_MD_DETAILS_FAILURE,
        payload: { message, status, errorData: response?.data },
      });
      return { success: false, message, status };
    }
  } catch (error) {
    const errorMessage = error.response ? error.response.data.message : error.message;
    dispatch({
      type: GET_MD_DETAILS_FAILURE,
      payload: {
        message: errorMessage,
        status: "Error",
      },
    });
    return { success: false, message: errorMessage, status: "Error" };
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const getReportToUserList = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const companyId = payload?.companyId || null;

    if (!companyId) {
      throw new Error("Company ID is required");
    }

    // Remove companyId from payload before sending
    const { companyId: _, ...requestPayload } = payload;

    const response = await axios.post(
      `${API_ROUTE}/api/v1/company/user/reportToUserList`,
      requestPayload,
      {
        headers: {
          "Content-Type": "application/json",
          "x-company-id": companyId,
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const responseData = response?.data ?? {};
    const { data: userList, message, status, totalCount, total } = responseData;

    // Handle different response structures
    const users = Array.isArray(userList)
      ? userList
      : Array.isArray(responseData?.data?.docs)
        ? responseData.data.docs
        : Array.isArray(responseData?.data?.data)
          ? responseData.data.data
          : Array.isArray(responseData?.docs)
            ? responseData.docs
            : [];

    if (status === "SUCCESS") {
      dispatch({
        type: GET_REPORT_TO_USER_LIST_SUCCESS,
        payload: {
          userList: users,
          message,
          status,
          totalCount: totalCount || total || users.length,
        },
      });
      return { success: true, data: users, message, status, totalCount: totalCount || total || users.length };
    } else {
      dispatch({
        type: GET_REPORT_TO_USER_LIST_FAILURE,
        payload: { message, status, errorData: response?.data },
      });
      return { success: false, message, status };
    }
  } catch (error) {
    const errorMessage = error.response ? error.response.data.message : error.message;
    dispatch({
      type: GET_REPORT_TO_USER_LIST_FAILURE,
      payload: {
        message: errorMessage,
        status: "Error",
      },
    });
    return { success: false, message: errorMessage, status: "Error" };
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const getReportToDownline = (payload) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const companyId = payload?.companyId || null;

    if (!companyId) {
      throw new Error("Company ID is required");
    }

    // Remove companyId from payload before sending
    const { companyId: _, ...requestPayload } = payload;

    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/userDetails/reportToUsersList`,
      requestPayload,
      {
        headers: {
          "Content-Type": "application/json",
          "x-company-id": companyId,
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const responseData = response?.data ?? {};
    const { data: reportToDownlineList, message, status, totalCount, total } = responseData;

    // Handle different response structures
    const users = Array.isArray(reportToDownlineList)
      ? reportToDownlineList
      : Array.isArray(responseData?.data?.docs)
        ? responseData.data.docs
        : Array.isArray(responseData?.data?.data)
          ? responseData.data.data
          : Array.isArray(responseData?.docs)
            ? responseData.docs
            : [];

    if (status === "SUCCESS") {
      dispatch({
        type: GET_REPORT_TO_DOWNLINE_SUCCESS,
        payload: {
          reportToDownlineList: users,
          message,
          status,
          totalCount: totalCount || total || users.length,
        },
      });
      return { success: true, data: users, message, status, totalCount: totalCount || total || users.length };
    } else {
      dispatch({
        type: GET_REPORT_TO_DOWNLINE_FAILURE,
        payload: { message, status, errorData: response?.data },
      });
      return { success: false, message, status };
    }
  } catch (error) {
    const errorMessage = error.response ? error.response.data.message : error.message;
    dispatch({
      type: GET_REPORT_TO_DOWNLINE_FAILURE,
      payload: {
        message: errorMessage,
        status: "Error",
      },
    });
    return { success: false, message: errorMessage, status: "Error" };
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const getUserMDDetails = (userId) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/userDetails/profile/${userId}`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: userAdminDetails, message, status } = response?.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: GET_USER_ADMIN_SUCCESS,
        payload: { userAdminDetails, message, status },
      });
    } else {
      dispatch({
        type: GET_USER_ADMIN_FAILURE,
        payload: { message, status, errorData: response?.data },
      });
    }
  } catch (error) {
    dispatch({
      type: GET_USER_ADMIN_FAILURE,
      payload: {
        message: error.response ? error.response.data.message : error.message,
        status: "Error",
      },
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const kycDataCompany = (id) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.post(
      `${API_ROUTE}/api/v1/company/user/kyc/complete/${id}`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data, message, status } = response?.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: FETCH_KYC_DETAILS_COMPANY_SUCCESS,
        payload: { data, message, status },
      });
    } else {
      dispatch({
        type: FETCH_KYC_DETAILS_COMPANY_FAILURE,
        payload: { message, status, errorData: response?.data },
      });
    }
  } catch (error) {
    dispatch({
      type: FETCH_KYC_DETAILS_COMPANY_FAILURE,
      payload: {
        message: error.response ? error.response.data.message : error.message,
        status: "Error",
      },
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const kycDataUser = (id) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.post(
      `${API_ROUTE}/api/v1/user/userDetails/kyc/complete/${id}`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data, message, status } = response?.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: FETCH_KYC_DETAILS_USER_SUCCESS,
        payload: { data, message, status },
      });
    } else {
      dispatch({
        type: FETCH_KYC_DETAILS_USER_FAILURE,
        payload: { message, status, errorData: response?.data },
      });
    }
  } catch (error) {
    dispatch({
      type: FETCH_KYC_DETAILS_USER_FAILURE,
      payload: {
        message: error.response ? error.response.data.message : error.message,
        status: "Error",
      },
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const kycRevertCompany = (id) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.post(
      `${API_ROUTE}/api/v1/company/user/kyc/revert/${id}`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: kycRevertUSer, message, status } = response?.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: REVERT_USER_KYC_DETAILS_SUCCESS,
        payload: { kycRevertUSer, message, status },
      });
    } else {
      dispatch({
        type: REVERT_USER_KYC_DETAILS_FAILURE,
        payload: { message, status, errorData: response?.data },
      });
    }
  } catch (error) {
    dispatch({
      type: REVERT_USER_KYC_DETAILS_FAILURE,
      payload: {
        message: error.response ? error.response.data.message : error.message,
        status: "Error",
      },
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const createEmployee = (values) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.post(
      `${API_ROUTE}/api/v1/admin/employee/create`,
      values,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: EmployeeAdd, message, status } = response?.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: CREATE_EMPLOYEE_SUCCESS,
        payload: { EmployeeAdd, message, status },
      });
    } else {
      dispatch({
        type: CREATE_EMPLOYEE_FAILURE,
        payload: { message, status, errorData: response?.data },
      });
    }
  } catch (error) {
    dispatch({
      type: CREATE_EMPLOYEE_FAILURE,
      payload: {
        message: error.response ? error.response.data.message : error.message,
        status: "Error",
      },
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const ResendEmployeeLoginAccess = (id) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.post(
      `${API_ROUTE}/api/v1/admin/employee/resend/${id}`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: resendAccess, message, status } = response?.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: RESND_LOGIN_ACCESS_SUCCESS,
        payload: { resendAccess, message, status },
      });
    } else {
      dispatch({
        type: RESND_LOGIN_ACCESS_FAILURE,
        payload: { message, status, errorData: response?.data },
      });
    }
  } catch (error) {
    dispatch({
      type: RESND_LOGIN_ACCESS_FAILURE,
      payload: {
        message: error.response ? error.response.data.message : error.message,
        status: "Error",
      },
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// =======================
// EMPLOYEE ACTIONS
// =======================

export const employeeIpCheckStatus = (values) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.post(
      `${API_ROUTE}/api/v1/employee/company/ip-check`,
      values,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: ipResponse, status, success, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: EMPLOYEE_GET_IP_CHECK_SUCCESS,
        payload: { ipResponse, success, message },
      });
      return { status: "SUCCESS", message: message || "IP Check successful", data: ipResponse };
    } else {
      dispatch({
        type: EMPLOYEE_GET_IP_CHECK_FAILURE,
        payload: response?.data?.message ?? commonError,
      });
      return { status: "FAILURE", message: response?.data?.message || commonError };
    }
  } catch (error) {
    dispatch({
      type: EMPLOYEE_GET_IP_CHECK_FAILURE,
      payload: error.response ? error.response.data.message : error.message,
    });
    return { status: "FAILURE", message: error.response ? error.response.data.message : error.message };
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const employeeGetCityByPincode = (values) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.post(
      `${API_ROUTE}/api/v1/employee/company/get-city-by-pincode`,
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
        type: EMPLOYEE_GET_CITY_BY_PINCODE_SUCCESS,
        payload: { citybyPincode, status, message },
      });
    } else {
      dispatch({
        type: EMPLOYEE_GET_CITY_BY_PINCODE_FAILURE,
        payload: response?.data?.message ?? commonError,
      });
    }
  } catch (error) {
    dispatch({
      type: EMPLOYEE_GET_CITY_BY_PINCODE_FAILURE,
      payload: error.response ? error.response.data.message : error.message,
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const employeeGetPincodeByCity = (values) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.post(
      `${API_ROUTE}/api/v1/employee/company/get-pincode-by-city`,
      values,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: pincodeByCity, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: EMPLOYEE_GET_PINCODE_BY_CITY_SUCCESS,
        payload: { pincodeByCity, status, message },
      });
    } else {
      dispatch({
        type: EMPLOYEE_GET_PINCODE_BY_CITY_FAILURE,
        payload: response?.data?.message ?? commonError,
      });
    }
  } catch (error) {
    dispatch({
      type: EMPLOYEE_GET_PINCODE_BY_CITY_FAILURE,
      payload: error.response ? error.response.data.message : error.message,
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const employeePanDataFetch = (values) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.post(
      `${API_ROUTE}/api/v1/employee/company/pan-verification`,
      values,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: panData, message: outerMessage } = response?.data ?? {};
    const status = response?.data?.data?.status;
    const innerMessage = response?.data?.data?.message || response?.data?.data?.error;

    if (status === "Success") {
      dispatch({
        type: EMPLOYEE_GET_PANDATA_FETCH_SUCCESS,
        payload: { panData, message: innerMessage || outerMessage, status },
      });
      return { status: "SUCCESS", message: innerMessage || outerMessage || "PAN fetched successfully", data: panData };
    } else if (status === "Failure") {
      dispatch({
        type: EMPLOYEE_GET_PANDATA_FETCH_FAILURE,
        payload: { message: innerMessage || "Failed to verify PAN", status, errorData: response?.data },
      });
      return { status: "FAILURE", message: innerMessage || "Invalid PAN Number" };
    }
    return { status: "FAILURE", message: "Unknown response status" };
  } catch (error) {
    dispatch({
      type: EMPLOYEE_GET_PANDATA_FETCH_FAILURE,
      payload: {
        message: error.response ? error.response.data.message : error.message,
        status: "Error",
      },
    });
    return { status: "FAILURE", message: error.response ? error.response.data.message : error.message };
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const employeeCreateWhiteLabel = (formData) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.post(
      `${API_ROUTE}/api/v1/employee/company/create-company`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: createResponse, status, message } = response?.data ?? {};
    if (status === "SUCCESS") {
      dispatch({
        type: EMPLOYEE_WHITELABEL_CREATE_SUCCESS,
        payload: { createResponse, status, message },
      });
      return { status: "SUCCESS", message: message || "Whitelabel created successfully" };
    } else {
      dispatch({
        type: EMPLOYEE_WHITELABEL_CREATE_FAILURE,
        payload: response?.data?.message ?? commonError,
      });
      return { status: "FAILURE", message: response?.data?.message || commonError };
    }
  } catch (error) {
    dispatch({
      type: EMPLOYEE_WHITELABEL_CREATE_FAILURE,
      payload: error.response ? error.response.data.message : error.message,
    });
    return { status: "FAILURE", message: error.response ? error.response.data.message : error.message };
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const employeeUseList = (values) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.post(
      `${API_ROUTE}/api/v1/employee/user/list`,
      values,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: whitelabelList, message, status } = response?.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: EMPLOYEE_GET_WHITELABEL_LIST_SUCCESS,
        payload: { whitelabelList, message, status },
      });
    } else {
      dispatch({
        type: EMPLOYEE_GET_WHITELABEL_LIST_FAILURE,
        payload: { message, status, errorData: response?.data },
      });
    }
  } catch (error) {
    dispatch({
      type: EMPLOYEE_GET_WHITELABEL_LIST_FAILURE,
      payload: {
        message: error.response ? error.response.data.message : error.message,
        status: "Error",
      },
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const employeeKycData = (id) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.post(
      `${API_ROUTE}/api/v1/employee/user/kyc/complete/${id}`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data, message, status } = response?.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: EMPLOYEE_FETCH_KYC_DETAILS_SUCCESS,
        payload: { data, message, status },
      });
    } else {
      dispatch({
        type: EMPLOYEE_FETCH_KYC_DETAILS_FAILURE,
        payload: { message, status, errorData: response?.data },
      });
    }
  } catch (error) {
    dispatch({
      type: EMPLOYEE_FETCH_KYC_DETAILS_FAILURE,
      payload: {
        message: error.response ? error.response.data.message : error.message,
        status: "Error",
      },
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const employeeKycStatusData = (id) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.post(
      `${API_ROUTE}/api/v1/employee/user/${id}`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: kycStatusClick, message, status } = response?.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: EMPLOYEE_GET_KYCSTATUS_SUCCESS,
        payload: { kycStatusClick, message, status },
      });
    } else {
      dispatch({
        type: EMPLOYEE_GET_KYCSTATUS_FAILURE,
        payload: { message, status, errorData: response?.data },
      });
    }
  } catch (error) {
    dispatch({
      type: EMPLOYEE_GET_KYCSTATUS_FAILURE,
      payload: {
        message: error.response ? error.response.data.message : error.message,
        status: "Error",
      },
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const employeeKycStatusCheck = (id, body = {}) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.put(
      `${API_ROUTE}/api/v1/employee/user/${id}`,
      body,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: kycStatusCheck, message, status } = response?.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: EMPLOYEE_UPDATE_KYCSTATUS_SUCCESS,
        payload: { kycStatusCheck, message, status },
      });
    } else {
      dispatch({
        type: EMPLOYEE_UPDATE_KYCSTATUS_FAILURE,
        payload: { message, status, errorData: response?.data },
      });
    }
  } catch (error) {
    dispatch({
      type: EMPLOYEE_UPDATE_KYCSTATUS_FAILURE,
      payload: {
        message: error.response ? error.response.data.message : error.message,
        status: "Error",
      },
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const employeeKycUnlock = (id) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.post(
      `${API_ROUTE}/api/v1/employee/user/unlock/${id}`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: kycUnlock, message, status } = response?.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: EMPLOYEE_KYC_LOCK_STATUS_SUCCESS,
        payload: { kycUnlock, message, status },
      });
    } else {
      dispatch({
        type: EMPLOYEE_KYC_LOCK_STATUS_FAILURE,
        payload: { message, status, errorData: response?.data },
      });
    }
  } catch (error) {
    dispatch({
      type: EMPLOYEE_KYC_LOCK_STATUS_FAILURE,
      payload: {
        message: error.response ? error.response.data.message : error.message,
        status: "Error",
      },
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const employeeKycRevert = (id, body = {}) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.post(
      `${API_ROUTE}/api/v1/employee/user/kyc/revert/${id}`,
      body,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: kycRevert, message, status } = response?.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: EMPLOYEE_REVERT_KYC_DETAILS_SUCCESS,
        payload: { kycRevert, message, status },
      });
    } else {
      dispatch({
        type: EMPLOYEE_REVERT_KYC_DETAILS_FAILURE,
        payload: { message, status, errorData: response?.data },
      });
    }
  } catch (error) {
    dispatch({
      type: EMPLOYEE_REVERT_KYC_DETAILS_FAILURE,
      payload: {
        message: error.response ? error.response.data.message : error.message,
        status: "Error",
      },
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const employeeRescendOnboarding = (id) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.post(
      `${API_ROUTE}/api/v1/employee/company/${id}/resend-onboarding-link`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: resendOnboardingLink, message, status } = response?.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: EMPLOYEE_RESEND_ONBOARDING_LINK_SUCCESS,
        payload: { resendOnboardingLink, message, status },
      });
    } else {
      dispatch({
        type: EMPLOYEE_RESEND_ONBOARDING_LINK_FAILURE,
        payload: { message, status, errorData: response?.data },
      });
    }
  } catch (error) {
    dispatch({
      type: EMPLOYEE_RESEND_ONBOARDING_LINK_FAILURE,
      payload: {
        message: error.response ? error.response.data.message : error.message,
        status: "Error",
      },
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const employeeDeActiveOnboarding = (id) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.post(
      `${API_ROUTE}/api/v1/employee/company/${authToken}/deactivate-onboarding-link`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: deactivateOnboardingLink, message, status } = response?.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: EMPLOYEE_DEACTIVATE_ONBOARDING_LINK_SUCCESS,
        payload: { deactivateOnboardingLink, message, status },
      });
    } else {
      dispatch({
        type: EMPLOYEE_DEACTIVATE_ONBOARDING_LINK_FAILURE,
        payload: { message, status, errorData: response?.data },
      });
    }
  } catch (error) {
    dispatch({
      type: EMPLOYEE_DEACTIVATE_ONBOARDING_LINK_FAILURE,
      payload: {
        message: error.response ? error.response.data.message : error.message,
        status: "Error",
      },
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const employeeCreateEmployee = (values) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.post(
      `${API_ROUTE}/api/v1/employee/employee/create`,
      values,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: EmployeeAdd, message, status } = response?.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: EMPLOYEE_CREATE_EMPLOYEE_SUCCESS,
        payload: { EmployeeAdd, message, status },
      });
    } else {
      dispatch({
        type: EMPLOYEE_CREATE_EMPLOYEE_FAILURE,
        payload: { message, status, errorData: response?.data },
      });
    }
  } catch (error) {
    dispatch({
      type: EMPLOYEE_CREATE_EMPLOYEE_FAILURE,
      payload: {
        message: error.response ? error.response.data.message : error.message,
        status: "Error",
      },
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const employeeResendEmployeeLoginAccess = (id) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.post(
      `${API_ROUTE}/api/v1/employee/employee/resend/${id}`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: resendAccess, message, status } = response?.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: EMPLOYEE_RESND_LOGIN_ACCESS_SUCCESS,
        payload: { resendAccess, message, status },
      });
    } else {
      dispatch({
        type: EMPLOYEE_RESND_LOGIN_ACCESS_FAILURE,
        payload: { message, status, errorData: response?.data },
      });
    }
  } catch (error) {
    dispatch({
      type: EMPLOYEE_RESND_LOGIN_ACCESS_FAILURE,
      payload: {
        message: error.response ? error.response.data.message : error.message,
        status: "Error",
      },
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const checkCompanyAepsStatus = (id) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.post(
      `${API_ROUTE}/api/v1/company/user/aeps-status/${id}`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: companyAepsStatus, message, status } = response?.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: COMPANY_AEPS_STATUS_SUCCESS,
        payload: { companyAepsStatus, message, status },
      });
    } else {
      dispatch({
        type: COMPANY_AEPS_STATUS_FAILURE,
        payload: { message, status, errorData: response?.data },
      });
    }
  } catch (error) {
    dispatch({
      type: COMPANY_AEPS_STATUS_FAILURE,
      payload: {
        message: error.response ? error.response.data.message : error.message,
        status: "Error",
      },
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

export const checkEmployeeAepsStatus = (id) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const authToken = secureLocalStorage.getItem("userToken");
    const response = await axios.post(
      `${API_ROUTE}/api/v1/employee/user/aeps-status/${id}`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const { data: employeeAepsStatus, message, status } = response?.data ?? {};

    if (status === "SUCCESS") {
      dispatch({
        type: EMPLOYEE_AEPS_STATUS_SUCCESS,
        payload: { employeeAepsStatus, message, status },
      });
    } else {
      dispatch({
        type: EMPLOYEE_AEPS_STATUS_FAILURE,
        payload: { message, status, errorData: response?.data },
      });
    }
  } catch (error) {
    dispatch({
      type: EMPLOYEE_AEPS_STATUS_FAILURE,
      payload: {
        message: error.response ? error.response.data.message : error.message,
        status: "Error",
      },
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};