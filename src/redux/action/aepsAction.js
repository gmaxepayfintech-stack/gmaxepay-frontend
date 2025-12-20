import axios from "axios";
import secureLocalStorage from "react-secure-storage";
import { API_ROUTE } from "../../data/env";

import { LOADING_START, LOADING_END } from "../actionType/loadingActionType";
import { AEPS_RESCEND_OTP_FAILURE, AEPS_RESCEND_OTP_SUCCESS, AEPS_STATUS_CHECK_FAILURE, AEPS_STATUS_CHECK_SUCCESS, AEPS_SUBMIT_OTP_FAILURE, AEPS_SUBMIT_OTP_SUCCESS, AEPS_TERMS_CONDITION_OTP_FAILURE, AEPS_TERMS_CONDITION_OTP_SUCCESS, AEPS_ONBOARDING_BIOMETRIC_VERIFICATION_SUCCESS, AEPS_ONBOARDING_BIOMETRIC_VERIFICATION_FAILURE, AEPS_ONBOARDING_FA_VERIFICATION_SUCCESS, AEPS_ONBOARDING_FA_VERIFICATION_FAILURE, AEPS_CW_HISTORY_SUCCESS, AEPS_CW_HISTORY_FAILURE } from "../actionType/aepsActionType";

const commonError = "Something went wrong!";

export const aepsTermsConditionOtp = () => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");

      const response = await axios.post(
        `${API_ROUTE}/api/v1/user/aeps/onboarding`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
  
      const { data: aepsOtp, status, message } = response?.data ?? {};
      if (status === "SUCCESS") {
        dispatch({
          type: AEPS_TERMS_CONDITION_OTP_SUCCESS,
          payload: { aepsOtp, status, message },
        });
        return { aepsOtp, status, message };
      } else {
        dispatch({
          type: AEPS_TERMS_CONDITION_OTP_FAILURE,
          payload: {
            status: response?.data?.status ?? "FAILURE",
            message: response?.data?.message ?? commonError,
          },
        });
        return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
      }
    } catch (error) {
      const errorMessage = error.response ? error.response.data.message : error.message;
      dispatch({
        type: AEPS_TERMS_CONDITION_OTP_FAILURE,
        payload: errorMessage,
      });
      throw error;
    } finally {
      dispatch({ type: LOADING_END });
    }
  };

  export const aepsStatusCheck = () => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");

      const response = await axios.post(
        `${API_ROUTE}/api/v1/user/aeps/onboarding-status`,
       {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
  
      const { data: aepsStatus, status, message } = response?.data ?? {};
      if (status === "SUCCESS") {
        dispatch({
          type: AEPS_STATUS_CHECK_SUCCESS,
          payload: { aepsStatus, status, message },
        });
        return { aepsStatus, status, message };
      } else {
        dispatch({
          type: AEPS_STATUS_CHECK_FAILURE,
          payload: {
            status: response?.data?.status ?? "FAILURE",
            message: response?.data?.message ?? commonError,
          },
        });
        return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
      }
    } catch (error) {
      const errorMessage = error.response ? error.response.data.message : error.message;
      dispatch({
        type: AEPS_STATUS_CHECK_FAILURE,
        payload: errorMessage,
      });
      throw error;
    } finally {
      dispatch({ type: LOADING_END });
    }
};

export const aepsSubmitOTP = (values) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");

        const response = await axios.post(
            `${API_ROUTE}/api/v1/user/aeps/validate-otp`,
            values, // Send values directly, not wrapped in {values}
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const { data: submitOtp, status, message } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: AEPS_SUBMIT_OTP_SUCCESS,
                payload: { submitOtp, status, message },
            });
            return { submitOtp, status, message };
        } else {
            dispatch({
                type: AEPS_SUBMIT_OTP_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
            return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
        }
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: AEPS_SUBMIT_OTP_FAILURE,
            payload: errorMessage,
        });
        throw error;
    } finally {
        dispatch({ type: LOADING_END });
    }
};

export const aepsOnboardingBiometricVerification = (data) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");

        const response = await axios.post(
            `${API_ROUTE}/api/v1/user/aeps/bio-metric-verification`,
            data,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const { data: aepsBiometricstatus, status, message } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: AEPS_ONBOARDING_BIOMETRIC_VERIFICATION_SUCCESS,
                payload: { aepsBiometricstatus, status, message },
            });
            return { aepsBiometricstatus, status, message };
        } else {
            dispatch({
                type: AEPS_ONBOARDING_BIOMETRIC_VERIFICATION_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
            return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
        }
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: AEPS_ONBOARDING_BIOMETRIC_VERIFICATION_FAILURE,
            payload: {
                status: "FAILURE",
                message: errorMessage,
            },
        });
        throw error;
    } finally {
        dispatch({ type: LOADING_END });
    }
};

export const aepsOnboardingFAVerification = (data) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");

        const response = await axios.post(
            `${API_ROUTE}/api/v1/user/aeps/2fa-authentication`,
            data,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const { data: aepsFaStatus, status, message } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: AEPS_ONBOARDING_FA_VERIFICATION_SUCCESS,
                payload: { aepsFaStatus, status, message },
            });
            return { aepsFaStatus, status, message };
        } else {
            dispatch({
                type: AEPS_ONBOARDING_FA_VERIFICATION_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
            return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
        }
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: AEPS_ONBOARDING_FA_VERIFICATION_FAILURE,
            payload: {
                status: "FAILURE",
                message: errorMessage,
            },
        });
        throw error;
    } finally {
      dispatch({ type: LOADING_END });
    }
};

export const fetchAepsCwHistory = (filters = {}) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");
        
        // Get userRole from secureLocalStorage
        const userData = secureLocalStorage.getItem("userData");
        let userRole = null;
        try {
            const parsedUserData = typeof userData === 'string' ? JSON.parse(userData) : userData;
            userRole = parsedUserData?.userRole;
        } catch (e) {
            console.error("Error parsing userData:", e);
        }

        const {
            searchQuery = '',
            statusFilter = 'All',
            fromDate = '',
            toDate = '',
            page = 1,
            paginate = 5
        } = filters;

        // Build query object - always include aepsTxnType: "CW" as default
        const query = {
            aepsTxnType: "CW"
        };

        // Add status filter if not 'All'
        if (statusFilter !== 'All') {
            query.status = statusFilter.toUpperCase();
        }

        // Add date range filter using createdAt field
        // Convert dates to ISO format for backend
        if (fromDate || toDate) {
            query.createdAt = {};
            if (fromDate) {
                // Convert to ISO string format (YYYY-MM-DDTHH:mm:ss.sssZ)
                const fromDateObj = new Date(fromDate);
                fromDateObj.setHours(0, 0, 0, 0);
                query.createdAt.$gte = fromDateObj.toISOString();
            }
            if (toDate) {
                // Convert to ISO string format, set to end of day
                const toDateObj = new Date(toDate);
                toDateObj.setHours(23, 59, 59, 999);
                query.createdAt.$lte = toDateObj.toISOString();
            }
        }

        // Build customSearch object for reference/ID search
        const customSearch = {};
        if (searchQuery.trim()) {
            customSearch.transactionId = searchQuery.trim();
            customSearch.mobileNo = searchQuery.trim();
            customSearch.name = searchQuery.trim();
            customSearch.merchantTransactionId = searchQuery.trim();
            customSearch.bankRRN = searchQuery.trim();
            customSearch.fpTransactionId = searchQuery.trim();
        }

        const payload = {
            query: query,
            customSearch: Object.keys(customSearch).length > 0 ? customSearch : {},
            options: {
                page: page,
                paginate: paginate,
                sort: { createdAt: -1 }
            }
        };

        // Determine API endpoint based on userRole
        let apiEndpoint = '';
        if (userRole === 1) {
            apiEndpoint = `${API_ROUTE}/api/v1/admin/reports/aeps`;
        } else if (userRole === 2) {
            apiEndpoint = `${API_ROUTE}/api/v1/company/reports/aeps`;
        } else if (userRole === 3 || userRole === 4 || userRole === 5) {
            apiEndpoint = `${API_ROUTE}/api/v1/user/aeps/transaction-history`;
        } else {
            // Default to user endpoint if role is not recognized
            apiEndpoint = `${API_ROUTE}/api/v1/user/aeps/transaction-history`;
        }

        const response = await axios.post(
            apiEndpoint,
            payload,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );
  
        const responseData = response?.data ?? {};
        const { data: aepsHistory, status, message, totalCount, total } = responseData;
        
        // Handle both response.data.data and response.data formats
        const historyData = Array.isArray(aepsHistory) ? aepsHistory : (responseData?.data?.data || responseData?.data || []);
        const count = totalCount || total || historyData?.length || 0;
        
        if (status === "SUCCESS") {
            dispatch({
                type: AEPS_CW_HISTORY_SUCCESS,
                payload: { data: historyData, status, message, totalCount: count },
            });
            return { data: historyData, status, message, totalCount: count };
        } else {
            dispatch({
                type: AEPS_CW_HISTORY_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
            return { status: response?.data?.status ?? "FAILURE", message: response?.data?.message ?? commonError };
        }
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({
            type: AEPS_CW_HISTORY_FAILURE,
            payload: errorMessage,
        });
        throw error;
    } finally {
        dispatch({ type: LOADING_END });
    }
};


