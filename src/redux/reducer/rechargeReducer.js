import { DTH_RECHARGE_PLAN_FETCH_SUCCESS, DTH_RECHARGE_SUCCESS, FIND_DTH_OPERATOR_INFO_SUCCESS, FIND_MOBILE_OPERATOR_SUCCESS, FIND_MOBILE_RECHARGE_OFFERS_SUCCESS, FIND_MOBILE_RECHARGE_PLAN_SUCCESS, PAY_RECHARGE_SUCCESS, RECENT_HISTORY_SUCCESS } from "../actionType/rechargeActionType";

const initialState = {
    loading: false,
    error: null,
    aepsOtp: null,
    success: null,
    message: null,
    mobileOperator: null,
    mobileRechargePlan: null,
    mobileRechargeOffers: null,
    mobileRechargePay: null,
    recentHistory: null,
};

const rechargeReducer = (state = initialState, action) => {
    switch (action.type) {
        case FIND_MOBILE_OPERATOR_SUCCESS:
            return {
                ...state,
                mobileOperator: action?.payload,
                loading: false,
                error: null,
                success: action?.payload?.status,
                message: action?.payload?.message,
            }
        case FIND_MOBILE_RECHARGE_PLAN_SUCCESS:
            return {
                ...state,
                mobileRechargePlan: action?.payload,
                loading: false,
                error: null,
                success: action?.payload?.status,
                message: action?.payload?.message,
            };
        case FIND_MOBILE_RECHARGE_OFFERS_SUCCESS:
            return {
                ...state,
                mobileRechargeOffers: action?.payload,
                loading: false,
                error: null,
                success: action?.payload?.status,
                message: action?.payload?.message,
            };
        case PAY_RECHARGE_SUCCESS:
            return {
                ...state,
                loading: false,
                error: null,
                success: action?.payload?.status,
                message: action?.payload?.message,
                mobileRechargePay: action?.payload,
            }
        case FIND_DTH_OPERATOR_INFO_SUCCESS:
            return {
                ...state,
                error: null,
                success: action?.payload?.success,
                message: action?.payload?.message,
                dthOperatorInfo: action?.payload,
            }
        case DTH_RECHARGE_PLAN_FETCH_SUCCESS:
            return {
                ...state,
                error: null,
                message: action?.payload?.message,
                success: action.payload?.status,
                dthRechargePlan: action.payload,
            }
        case DTH_RECHARGE_SUCCESS:
            return {
                ...state,
                error: null,
                message: action?.payload?.message,
                success: action?.payload?.status,
                dthRecharge: action?.payload,
            }
        case RECENT_HISTORY_SUCCESS:
            return {
                ...state,
                error: null,
                message: action?.payload?.message,
                success: action?.payload?.status,
                recentHistory: action?.payload,
            }
        default:
            return state;
    }
};
export default rechargeReducer;
