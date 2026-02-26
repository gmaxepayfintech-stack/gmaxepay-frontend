import axios from "axios";
import secureLocalStorage from "react-secure-storage";
import { API_ROUTE } from "../../data/env";
import { clearAllStorage, isTokenExpiredError } from "../../utils/clearStorage";

import { LOADING_START, LOADING_END } from "../actionType/loadingActionType";
import { HELP_CONTACT_SUPPORT_FAILURE, HELP_CONTACT_SUPPORT_SUCCESS } from "../actionType/helpActionType";

const commonError = "Something went wrong!";

export const helpinformationCompany = (payload) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");
        const token = typeof authToken === 'string' ? authToken : String(authToken || '');

        const response = await axios.post(
            `${API_ROUTE}/company/companyDetails/support-contacts`,
            payload,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const { data: helpinfo, status, message } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: HELP_CONTACT_SUPPORT_SUCCESS,
                payload: { helpinfo, status, message },
            });
            return { helpinfo, status, message };
        } else {
            dispatch({
                type: HELP_CONTACT_SUPPORT_FAILURE,
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
            type: HELP_CONTACT_SUPPORT_FAILURE,
            payload: errorMessage,
        });
        throw error;
    } finally {
        dispatch({ type: LOADING_END });
    }
};





