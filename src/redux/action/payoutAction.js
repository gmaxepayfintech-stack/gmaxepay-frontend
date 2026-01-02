import axios from "axios";
import secureLocalStorage from "react-secure-storage";
import { API_ROUTE } from "../../data/env";

import { LOADING_START, LOADING_END } from "../actionType/loadingActionType";
import { PAYOUT_BANK_LIST_SUCCESS, PAYOUT_BANK_LIST_FAILURE } from "../actionType/payOutType";
const commonError = "Something went wrong!";



export const payoutBankList = (values) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");

        const response = await axios.post(
            `${API_ROUTE}/api/v1/user/payout/bank-list`,
            { values },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const { data: payoutBankList, status, message } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: PAYOUT_BANK_LIST_SUCCESS,
                payload: { data: payoutBankList, status, message },
            });
            return { data: payoutBankList, status, message };
        } else {
            dispatch({
                type: PAYOUT_BANK_LIST_FAILURE,
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
            type: PAYOUT_BANK_LIST_FAILURE,
            payload: {
                status: "FAILURE",
                message: errorMessage,
            },
        });
        return {
            status: "FAILURE",
            message: errorMessage,
        };
    } finally {
        dispatch({ type: LOADING_END });
    }
};


