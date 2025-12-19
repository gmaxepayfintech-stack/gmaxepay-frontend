import axios from "axios";
import { API_ROUTE } from "../../data/env";

import { LOADING_START, LOADING_END } from "../actionType/loadingActionType";
import { AEPS_TERMS_CONDITION_OTP_FAILURE, AEPS_TERMS_CONDITION_OTP_SUCCESS } from "../actionType/aepsActionType";

const commonError = "Something went wrong!";

export const aepsTermsConditionOtp = () => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");

      const response = await axios.post(
        `${API_ROUTE}/api/v1/user/aeps/onboarding`,
        values,
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
      } else {
        dispatch({
          type: AEPS_TERMS_CONDITION_OTP_FAILURE,
          payload: {
            status: response?.data?.status ?? "FAILURE",
            message: response?.data?.message ?? commonError,
          },
        });
      }
    } catch (error) {
      dispatch({
        type: AEPS_TERMS_CONDITION_OTP_FAILURE,
        payload: error.response ? error.response.data.message : error.message,
      });
    } finally {
      dispatch({ type: LOADING_END });
    }
  };






