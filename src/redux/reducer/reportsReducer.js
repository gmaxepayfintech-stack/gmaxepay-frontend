import { ADMIN_TXN_REPORT_SUCCESS, COMPANY_TXN_REPORT_SUCCESS, USER_TXN_REPORT_SUCCESS } from "../actionType/reportsActionType";

const initialState = {
    loading: false,
    error: null,
    payoutBankList: null,
    message: null,
    success: null,
    adminTransaction: null,
    companyTransaction: null,
    userTransaction: null,
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
            case COMPANY_TXN_REPORT_SUCCESS:
                return{
                    ...state,
                    error: action?.payload?.error,
                    companyTransaction: action?.payload,
                    status: action?.payload?.status,
                    message: action?.payload?.message,
                }
                case USER_TXN_REPORT_SUCCESS:
                    return{
                        ...state,
                        error: action?.payload?.error,
                        userTransaction: action?.payload,
                        status: action?.payload?.status,
                        message: action?.payload?.message,
                    }
        default:
            return state;
    }
};

export default reportsReducer;

