import axios from "axios";
import { API_ROUTE } from "../../data/env";

import { RETAILER_ONBOARDING_REFERAL_CODE_FAILURE, RETAILER_ONBOARDING_REFERAL_CODE_SUCCESS } from "../actionType/retailerOnboardingActionType";
import { LOADING_START, LOADING_END } from "../actionType/loadingActionType";

const commonError = "Something went wrong!";

export const referalCodeCheck = (values, companyData) => async (dispatch) => {
    dispatch({ type: LOADING_START });
    try {
        const headers = {
            "Content-Type": "application/json",
        };

        // Add x-company-id header if available
        if (companyData?.companyId || companyData?._id || companyData?.id) {
            headers["x-company-id"] = companyData?.companyId || companyData?._id || companyData?.id;
        }

        // Add x-company-domain header if available
        if (companyData?.domain || companyData?.companyDomain) {
            headers["x-company-domain"] = companyData?.domain || companyData?.companyDomain;
        }

        const response = await axios.post(
            `${API_ROUTE}/api/v1/user/onboarding/postReferCode`,
            values,
            {
                headers,
            }
        );
        console.log("response", response?.data);

        const { data: retailerOnboarding, status, success, message } = response?.data ?? {};
        
        if (status === "SUCCESS") {
            // Store response in session storage
            try {
                sessionStorage.setItem("retailerOnboarding", JSON.stringify({
                    data: retailerOnboarding,
                    success,
                    message,
                    timestamp: new Date().toISOString(),
                }));
            } catch (storageError) {
                console.error("Error storing referral code response in session storage:", storageError);
            }

            dispatch({
                type: RETAILER_ONBOARDING_REFERAL_CODE_SUCCESS,
                payload: { retailerOnboarding, success, message },
            });
        } else {
            dispatch({
                type: RETAILER_ONBOARDING_REFERAL_CODE_FAILURE,
                payload: response?.data?.message ?? commonError,
            });
        }
    } catch (error) {
        dispatch({
            type: RETAILER_ONBOARDING_REFERAL_CODE_FAILURE,
            payload: error.response ? error.response.data.message : error.message,
        });
    } finally {
        dispatch({ type: LOADING_END });
    }
};






