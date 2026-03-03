import { ADMIN_APPROVE_SUCCESS, ADMIN_REQUEST_SUCCESS, COMPANY_APPROVE_REQUEST_SUCCESS, COMPANY_BANK_LIST_SUCCESS, COMPANY_FUND_LOAD_SUCCESS, COMPANY_GET_ALL_REQUEST_SUCCESS, DISTRIBUTOR_FUND_APPROVE_SUCCESS, DISTRIBUTOR_FUND_GET_ALL_BANKS_SUCCESS, DISTRIBUTOR_FUND_LOAD_SUCCESS, DISTRIBUTOR_FUND_REQUEST_SUCCESS, MASTER_DISTRIBUTOR_FUND_APPROVE_SUCCESS, MASTER_DISTRIBUTOR_FUND_GET_ALL_BANKS_SUCCESS, MASTER_DISTRIBUTOR_FUND_LOAD_SUCCESS, MASTER_DISTRIBUTOR_FUND_REQUEST_SUCCESS, PAN_SERVICE_REQUEST_SUCCESS, RETAILER_FUND_GET_ALL_BANKS_SUCCESS, RETAILER_FUND_LOAD_SUCCESS } from "../actionType/fundActionType";

const initialState = {
    loading: false,
    error: null,
    success: null,
    message: null,
    retailerFundBanks: null,
    retailerFundLoad: null,
    mdBanklists: null,
    dBanklists: null,
    dFundload: null,
    mdFundload: null,
    dFundapprove: null,
    dFundrequest: null,
    mdFundrequest: null,
    mdFundapprove: null,
    companyBankLists: null,
    companyFundload: null,
    companyRequest: null,
    companyApprove: null,
    adminRequest: null,
    adminApprove: null,
    panServiceRequest: null,
};

const fundReducer = (state = initialState, action) => {
    switch (action.type) {

        case RETAILER_FUND_GET_ALL_BANKS_SUCCESS:
            return {
                ...state,
                loading: false,
                retailerFundBanks: action.payload,
                message: action.payload.message,
                success: action.payload,
                error: null,
            };

        case RETAILER_FUND_LOAD_SUCCESS:
            return {
                ...state,
                loading: false,
                error: null,
                message: action?.payload?.message,
                success: action?.payload?.status,
                retailerFundLoad: action?.payload,
            }
        case MASTER_DISTRIBUTOR_FUND_GET_ALL_BANKS_SUCCESS:
            return{
                ...state,
                error: null,
                loading: false,
                success:  action?.payload?.status,
                message: action?.payload?.message,
                mdBanklists: action?.payload,
            }

            case DISTRIBUTOR_FUND_GET_ALL_BANKS_SUCCESS:
                return{
                    ...state,
                    error: null,
                    loading: false,
                    success: action?.payload?.status,
                    message: action?.payload?.message,
                    dBanklists: action?.payload,
                }

            case DISTRIBUTOR_FUND_LOAD_SUCCESS:
                return{
                    ...state,
                    error: null,
                    loading: false,
                    success: action?.payload?.status,
                    message: action?.payload?.message,
                    dFundload: action?.payload,

                }
            case MASTER_DISTRIBUTOR_FUND_LOAD_SUCCESS:
                return{
                    ...state,
                    error: null,
                    success: action?.payload?.status,
                    message: action?.payload?.message,
                    mdFundload: action?.payload,
                }

            case MASTER_DISTRIBUTOR_FUND_REQUEST_SUCCESS:
                return{
                    ...state,
                    error: null,
                    loading: false,
                    success: action?.payload?.status,
                    message: action?.payload?.message,
                    mdFundrequest: action?.payload,
                }

                case MASTER_DISTRIBUTOR_FUND_APPROVE_SUCCESS:
                    return{
                        ...state,
                        error: null,
                        loading: false,
                        success: action?.payload?.status,
                        message: action?.payload?.message,
                        mdFundapprove: action?.payload,
                    }

                    case DISTRIBUTOR_FUND_REQUEST_SUCCESS:
                        return{
                            ...state,
                            error: null,
                            loading: false,
                            success: action?.payload?.status,
                            message: action?.payload?.message,
                            dFundrequest: action?.payload,
                        }
                    case DISTRIBUTOR_FUND_APPROVE_SUCCESS:
                        return{
                            ...state,
                            error: null,
                            loading: false,
                            success: action?.payload?.status,
                            message: action?.payload?.message,
                            dFundapprove: action?.payload,
                        }
                    case COMPANY_BANK_LIST_SUCCESS:
                        return{
                            ...state,
                            error: null,
                            loading: false,
                            success: action?.payload?.status,
                            message:action?.payload?.message,
                            companyBankLists: action?.payload
                        }
                    case COMPANY_FUND_LOAD_SUCCESS:
                        return{
                            ...state,
                            error: null,
                            loading: false,
                            success: action?.payload?.status,
                            message: action?.payload?.message,
                            companyFundload: action?.payload
                        }
                    case COMPANY_GET_ALL_REQUEST_SUCCESS:
                        return{
                            ...state,
                            error: null,
                            loading: false,
                            success: action?.payload?.status,
                            message: action?.payload?.message,
                            companyRequest: action?.payload,

                        }
                    case COMPANY_APPROVE_REQUEST_SUCCESS:
                        return{
                            ...state,
                            error: null,
                            loading: false,
                            success: action?.payload?.status,
                            message: action?.payload?.message,
                            companyApprove: action?.payload,
                        }
                    case ADMIN_REQUEST_SUCCESS:
                        return{
                            ...state,
                            error: null,
                            loading: false,
                            success: action?.payload?.status,
                            message: action?.payload?.message,
                            adminRequest: action?.payload,
                        }

                    case ADMIN_APPROVE_SUCCESS:
                        return{
                            ...state,
                            error: false,
                            loading: false,
                            success: action?.payload?.status,
                            message: action?.payload?.message,
                            adminApprove: action?.payload,
                        }
                    case PAN_SERVICE_REQUEST_SUCCESS:
                        return{
                            ...state,
                            error: false,
                            loading: false,
                            success: action?.payload?.status,
                            message: action?.payload?.message,
                            panServiceRequest: action?.payload,
                        }
        default:
            return state;
    }
};

export default fundReducer;
