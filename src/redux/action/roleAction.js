import axios from "axios";
import secureLocalStorage from "react-secure-storage";
import { API_ROUTE} from "../../data/env";
import { LOADING_END, LOADING_START } from "../actionType/loadingActionType";
import { ROLE_DEGRADE_COMPANY_USER_FAILURE, ROLE_DEGRADE_COMPANY_USER_SUCCESS, ROLE_DEGRADE_MASTER_DISTRIBUTOR_FAILURE, ROLE_DEGRADE_MASTER_DISTRIBUTOR_SUCCESS, ROLE_UPGRADE_COMPANY_USER_SUCCESS, ROLE_UPGRADE_MASTER_DISTRIBUTOR_FAILURE, ROLE_UPGRADE_MASTER_DISTRIBUTOR_SUCCESS, ROLEDATA_COMPANY_USER_FAILURE, ROLEDATA_COMPANY_USER_SUCCESS, ROLEDATA_MASTER_DISTRIBUTOR_FAILURE, ROLEDATA_MASTER_DISTRIBUTOR_SUCCESS } from "../actionType/roleActionType";
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

export const roleDataCompanyUser = (values) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        console.log('=== API Request (roleDataCompanyUser) ===');
        console.log('Request URL:', `${API_ROUTE}/api/v1/company/user/list`);
        console.log('Request Payload:', JSON.stringify(values, null, 2));
        
        const response = await axios.post(
            `${API_ROUTE}/api/v1/company/user/list`,
            values,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        console.log('=== API Response (roleDataCompanyUser) ===');
        console.log('Full response:', response);
        console.log('Response data:', response?.data);
        console.log('Response status:', response?.status);

        const { data: roleDataComp, status, message } = response?.data ?? {};
        
        console.log('Extracted values:');
        console.log('- status:', status);
        console.log('- message:', message);
        console.log('- roleDataComp:', roleDataComp);
        console.log('- roleDataComp type:', Array.isArray(roleDataComp) ? 'Array' : typeof roleDataComp);
        console.log('- roleDataComp length:', roleDataComp?.length);
        
        if (status === "SUCCESS") {
            console.log('✅ SUCCESS - Dispatching ROLEDATA_COMPANY_USER_SUCCESS');
            dispatch({
                type: ROLEDATA_COMPANY_USER_SUCCESS,
                payload: { roleDataComp, status, message },
            });
        } else {
            console.log('❌ FAILURE - Dispatching ROLEDATA_COMPANY_USER_FAILURE');
            dispatch({
                type: ROLEDATA_COMPANY_USER_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
        }
    } catch (error) {
        console.log('=== API Error (roleDataCompanyUser) ===');
        console.error('Error:', error);
        console.error('Error response:', error.response);
        console.error('Error message:', error.message);
        dispatch({
            type: ROLEDATA_COMPANY_USER_FAILURE,
            payload: error.response ? error.response.data.message : error.message,
        });
    } finally {
        dispatch({ type: LOADING_END });
    }
};

export const roleDataMasterDistributorUser = (values) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const response = await axios.post(
            `${API_ROUTE}/api/v1/user/userDetails/list`,
            values,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const { data: roleDataMD, status, message } = response?.data ?? {};
        if (status === "SUCCESS") {
            dispatch({
                type: ROLEDATA_MASTER_DISTRIBUTOR_SUCCESS,
                payload: { roleDataMD, status, message },
            });
        } else {
            dispatch({
                type: ROLEDATA_MASTER_DISTRIBUTOR_FAILURE,
                payload: {
                    status: response?.data?.status ?? "FAILURE",
                    message: response?.data?.message ?? commonError,
                },
            });
        }
    } catch (error) {
        dispatch({
            type: ROLEDATA_MASTER_DISTRIBUTOR_FAILURE,
            payload: error.response ? error.response.data.message : error.message,
        });
    } finally {
        dispatch({ type: LOADING_END });
    }
};