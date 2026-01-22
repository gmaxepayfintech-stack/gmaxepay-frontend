import { DISTRIBUTOR_FUND_GET_ALL_BANKS_SUCCESS, DISTRIBUTOR_FUND_LOAD_SUCCESS, MASTER_DISTRIBUTOR_FUND_GET_ALL_BANKS_SUCCESS, MASTER_DISTRIBUTOR_FUND_LOAD_SUCCESS, RETAILER_FUND_GET_ALL_BANKS_SUCCESS, RETAILER_FUND_LOAD_SUCCESS } from "../actionType/fundActionType";

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
        default:
            return state;
    }
};

export default fundReducer;
