import { FIND_MOBILE_OPERATOR_SUCCESS } from "../actionType/rechargeActionType";

const initialState = {
    loading: false,
    error: null,
    aepsOtp: null,
    success: null,
    message: null,
    mobileOperator: null,
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

        default:
            return state;
    }
};
export default rechargeReducer;
