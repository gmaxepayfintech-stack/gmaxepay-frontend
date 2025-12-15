import axios from "axios";
import { API_ROUTE} from "../../data/env";
import { LOADING_END, LOADING_START } from "../actionType/loadingActionType";
import { ROLE_DEGRADE_COMPANY_USER_FAILURE, ROLE_DEGRADE_COMPANY_USER_SUCCESS, ROLE_DEGRADE_MASTER_DISTRIBUTOR_FAILURE, ROLE_DEGRADE_MASTER_DISTRIBUTOR_SUCCESS, ROLE_UPGRADE_COMPANY_USER_SUCCESS, ROLE_UPGRADE_MASTER_DISTRIBUTOR_FAILURE, ROLE_UPGRADE_MASTER_DISTRIBUTOR_SUCCESS } from "../actionType/roleActionType";
const commonError = "Something went Wrong";
const token = secureLocalStorage.getItem("userToken");


export const roleUpgradeCompanyUser = (values) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const response = await axios.post(
            `${API_ROUTE}/api/v1/company/user/upgradeUser`,
            values,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const { data: roleComp, status, message } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: ROLE_UPGRADE_COMPANY_USER_SUCCESS,
                payload: { roleComp, status, message },
            });
        } else {
            dispatch({
                type: ROLE_DEGRADE_COMPANY_USER_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
        }
    } catch (error) {
        dispatch({
            type: ROLE_DEGRADE_COMPANY_USER_FAILURE,
            payload: error.response ? error.response.data.message : error.message,
        });
    } finally {
        dispatch({ type: LOADING_END });
    }
};

export const roleDegradeCompanyUser = (values) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const response = await axios.post(
            `${API_ROUTE}/api/v1/company/user/degradeUser`,
            values,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const { data: roleDegComp, status, message } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: ROLE_DEGRADE_COMPANY_USER_SUCCESS,
                payload: { roleDegComp, status, message },
            });
        } else {
            dispatch({
                type: ROLE_DEGRADE_COMPANY_USER_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
        }
    } catch (error) {
        dispatch({
            type: ROLE_DEGRADE_COMPANY_USER_FAILURE,
            payload: error.response ? error.response.data.message : error.message,
        });
    } finally {
        dispatch({ type: LOADING_END });
    }
};

export const roleUpgradeMasterDistributor = (values) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const response = await axios.post(
            `${API_ROUTE}/api/v1/user/userDetails/upgradeUser`,
            values,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const { data: roleMD, status, message } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: ROLE_UPGRADE_MASTER_DISTRIBUTOR_SUCCESS,
                payload: { roleMD, status, message },
            });
        } else {
            dispatch({
                type: ROLE_UPGRADE_MASTER_DISTRIBUTOR_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
        }
    } catch (error) {
        dispatch({
            type: ROLE_UPGRADE_MASTER_DISTRIBUTOR_FAILURE,
            payload: error.response ? error.response.data.message : error.message,
        });
    } finally {
        dispatch({ type: LOADING_END });
    }
};

export const roleDegradeMasterDistributor = (values) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const response = await axios.post(
            `${API_ROUTE}/api/v1/company/user/degradeUser`,
            values,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const { data: roleDegMD, status, message } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: ROLE_DEGRADE_MASTER_DISTRIBUTOR_SUCCESS,
                payload: { roleDegMD, status, message },
            });
        } else {
            dispatch({
                type: ROLE_DEGRADE_MASTER_DISTRIBUTOR_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
        }
    } catch (error) {
        dispatch({
            type: ROLE_DEGRADE_MASTER_DISTRIBUTOR_FAILURE,
            payload: error.response ? error.response.data.message : error.message,
        });
    } finally {
        dispatch({ type: LOADING_END });
    }
};