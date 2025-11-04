import axios from "axios";
import secureLocalStorage from "react-secure-storage";
import { LOGIN_SUCCESS, LOGIN_FAILURE } from "../actionType/loginActionType";
import { API_ROUTE } from "../../data/env";
import { LOADING_START, LOADING_END } from "../actionType/loadingActionType";

const commonError = "Something went wrong!";

export const loginStatus = (credentials) => async (dispatch) => {
  dispatch({ type: LOADING_START });

  try {
    const response = await axios.post(
      `${API_ROUTE}/api/v1/auth/login`,
      credentials
    );
    const data = response?.data;
    console.log("ressssssssss",data);

    const {status,loginResponse } = response?.data ?? {};

    if (status === "SUCCESS") {
      if (data?.token) {
        secureLocalStorage.setItem("userToken", data.token);
      }

      dispatch({
        type: LOGIN_SUCCESS,
        payload: data,loginResponse,status,
      });
    } else {
      dispatch({
        type: LOGIN_FAILURE,
        payload: response?.data?.message ?? commonError,
      });
    }
  } catch (error) {
    dispatch({
      type: LOGIN_FAILURE,
      payload: error.response ? error.response.data.message : error.message,
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};
