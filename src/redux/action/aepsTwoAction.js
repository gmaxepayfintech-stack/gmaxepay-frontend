import axios from "axios";
import secureLocalStorage from "react-secure-storage";
import { API_ROUTE } from "../../data/env";

import { LOADING_START, LOADING_END } from "../actionType/loadingActionType";
import { AEPSTWO_STATUS_CHECK_FAILURE, AEPSTWO_STATUS_CHECK_SUCCESS } from "../actionType/aepsTwoActionType";

const commonError = "Something went wrong!";

export const aepsTwoStatusCheck = () => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");

        const response = await axios.post(
            `${API_ROUTE}/api/v1/user/aeps2/onboarding-status`,
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
                type: AEPSTWO_STATUS_CHECK_SUCCESS,
                payload: { aepsStatus, status, message },
            });
            return { aepsStatus, status, message };
        } else {
            dispatch({
                type: AEPSTWO_STATUS_CHECK_FAILURE,
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
            type: AEPSTWO_STATUS_CHECK_FAILURE,
            payload: errorMessage,
        });
        throw error;
    } finally {
        dispatch({ type: LOADING_END });
    }
};

