import {
    ADMIN_TXN_REPORT_SUCCESS,
    COMPANY_TXN_REPORT_SUCCESS,
    EMPLOYEE_PAN_REPORT_SUCCESS,
    EMPLOYEE_TXN_REPORT_SUCCESS,
    USER_TXN_REPORT_SUCCESS,
    CHECK_MOBILE_RECHARGE2_STATUS_SUCCESS,
    CHECK_MOBILE_RECHARGE2_STATUS_FAILURE,
    CHECK_DTH2_STATUS_SUCCESS,
    CHECK_DTH2_STATUS_FAILURE
} from "../actionType/reportsActionType";

const initialState = {
    loading: false,
    error: null,
    payoutBankList: null,
    message: null,
    success: null,
    adminTransaction: null,
    companyTransaction: null,
    userTransaction: null,
    employeeTransaction: null,
    employeePanReport: null,
    mobileRecharge2Status: null,
    dth2Status: null,
};

const reportsReducer = (state = initialState, action) => {
    switch (action.type) {
        case ADMIN_TXN_REPORT_SUCCESS:
            return {
                ...state,
                error: action?.payload?.error,
                adminTransaction: action?.payload,
                status: action?.payload?.status,
                message: action?.payload?.message,
            }

        case EMPLOYEE_PAN_REPORT_SUCCESS:
            return {
                ...state,
                error: action?.payload?.error,
                employeePanReport: action?.payload,
                status: action?.payload?.status,
                message: action?.payload?.message,
            }
        case COMPANY_TXN_REPORT_SUCCESS:
            return {
                ...state,
                error: action?.payload?.error,
                companyTransaction: action?.payload,
                status: action?.payload?.status,
                message: action?.payload?.message,
            }
        case USER_TXN_REPORT_SUCCESS:
            return {
                ...state,
                error: action?.payload?.error,
                userTransaction: action?.payload,
                status: action?.payload?.status,
                message: action?.payload?.message,
            }
        case EMPLOYEE_TXN_REPORT_SUCCESS:
            return {
                ...state,
                error: action?.payload?.error,
                employeeTransaction: action?.payload,
                status: action?.payload?.status,
                message: action?.payload?.message,
            }
        case CHECK_MOBILE_RECHARGE2_STATUS_SUCCESS:
            return {
                ...state,
                mobileRecharge2Status: action?.payload,
                status: action?.payload?.status,
                message: action?.payload?.message,
            }
        case CHECK_MOBILE_RECHARGE2_STATUS_FAILURE:
            return {
                ...state,
                mobileRecharge2Status: null,
                status: "FAILURE",
                message: action?.payload?.message,
            }
        case CHECK_DTH2_STATUS_SUCCESS:
            return {
                ...state,
                dth2Status: action?.payload,
                status: action?.payload?.status,
                message: action?.payload?.message,
            }
        case CHECK_DTH2_STATUS_FAILURE:
            return {
                ...state,
                dth2Status: null,
                status: "FAILURE",
                message: action?.payload?.message,
            }
        default:
            return state;
    }
};

export default reportsReducer;

