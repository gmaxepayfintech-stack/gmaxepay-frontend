import axios from "axios";
import secureLocalStorage from "react-secure-storage";
import { API_ROUTE } from "../../data/env";
import { clearAllStorage, isTokenExpiredError } from "../../utils/clearStorage";

import { LOADING_START, LOADING_END } from "../actionType/loadingActionType";
import { ADD_SUPPORT_EMAIL_FAILURE, ADD_SUPPORT_EMAIL_SUCCESS, ADD_SUPPORT_PHONE_FAILURE, ADD_SUPPORT_PHONE_SUCCESS, HELP_CONTACT_SUPPORT_FAILURE, HELP_CONTACT_SUPPORT_SUCCESS, REMOVE_CONTACT_NUMBER_FAILURE, REMOVE_CONTACT_NUMBER_SUCCESS } from "../actionType/helpActionType";

const commonError = "Something went wrong!";

export const helpinformationCompany = (payload) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");
        const token = typeof authToken === 'string' ? authToken : String(authToken || '');

        const response = await axios.post(
            `${API_ROUTE}/api/v1/company/companyDetails/support-contacts`,
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

export const deleteSupportCompany = (payload) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");
        const token = typeof authToken === 'string' ? authToken : String(authToken || '');

        const response = await axios.post(
            `${API_ROUTE}/api/v1/company/companyDetails/support-phone/remove`,
            payload,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const { data: deleteContactInfo, status, message } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: REMOVE_CONTACT_NUMBER_SUCCESS,
                payload: { deleteContactInfo, status, message },
            });
            return { deleteContactInfo, status, message };
        } else {
            dispatch({
                type: REMOVE_CONTACT_NUMBER_FAILURE,
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
            type: REMOVE_CONTACT_NUMBER_FAILURE,
            payload: errorMessage,
        });
        throw error;
    } finally {
        dispatch({ type: LOADING_END });
    }
};

export const addSupportPhoneCompany = (payload) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");
        const token = typeof authToken === 'string' ? authToken : String(authToken || '');

        const response = await axios.post(
            `${API_ROUTE}/api/v1/company/companyDetails/support-phone/add`,
            payload,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const { data: addContactInfo, status, message } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: ADD_SUPPORT_PHONE_SUCCESS,
                payload: { addContactInfo, status, message },
            });
            return { addContactInfo, status, message };
        } else {
            dispatch({
                type: ADD_SUPPORT_PHONE_FAILURE,
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
            type: ADD_SUPPORT_PHONE_FAILURE,
            payload: errorMessage,
        });
        throw error;
    } finally {
        dispatch({ type: LOADING_END });
    }
};

export const addSupportEmailCompany = (payload) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const authToken = secureLocalStorage.getItem("userToken");
        const token = typeof authToken === 'string' ? authToken : String(authToken || '');

        const response = await axios.post(
            `${API_ROUTE}/api/v1/company/companyDetails/support-email`,
            payload,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const { data: addEmailInfo, status, message } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: ADD_SUPPORT_EMAIL_SUCCESS,
                payload: { addEmailInfo, status, message },
            });
            return { addEmailInfo, status, message };
        } else {
            dispatch({
                type: ADD_SUPPORT_EMAIL_FAILURE,
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
            type: ADD_SUPPORT_EMAIL_FAILURE,
            payload: errorMessage,
        });
        throw error;
    } finally {
        dispatch({ type: LOADING_END });
    }
};

