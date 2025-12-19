import axios from "axios";
import secureLocalStorage from "react-secure-storage";
import { API_ROUTE } from "../../data/env";

import { LOADING_START, LOADING_END } from "../actionType/loadingActionType";
import { AEPS_STATUS_CHECK_FAILURE, AEPS_STATUS_CHECK_SUCCESS, AEPS_TERMS_CONDITION_OTP_FAILURE, AEPS_TERMS_CONDITION_OTP_SUCCESS } from "../actionType/aepsActionType";

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






