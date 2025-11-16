import axios from "axios";
import secureLocalStorage from "react-secure-storage";
import {
  GET_PROFILE_START,
  GET_PROFILE_SUCCESS,
  GET_PROFILE_FAILURE,
  GET_PROFILE_UNAUTHORIZED,
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
      }
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

      // Clear any auth tokens on unauthorized
      secureLocalStorage.removeItem("userToken");
      secureLocalStorage.removeItem("loginToken");

      dispatch(logout());

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

      // Clear tokens from storage
      secureLocalStorage.removeItem("userToken");
      secureLocalStorage.removeItem("loginToken");

      // Dispatch logout to clear auth state
      dispatch(logout());

      // Dispatch unauthorized action
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
