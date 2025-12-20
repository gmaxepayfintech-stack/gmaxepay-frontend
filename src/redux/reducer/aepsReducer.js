import { AEPS_STATUS_CHECK_SUCCESS, AEPS_TERMS_CONDITION_OTP_SUCCESS, AEPS_CW_HISTORY_SUCCESS, AEPS_CW_HISTORY_FAILURE } from "../actionType/aepsActionType";

const initialState = {
    loading: false,
    error: null,
    aepsOtp: null,
    success: null,
    message: null,
    aepsCwHistory: null,
    aepsCwHistoryTotalCount: 0,

};

const aepsReducer = (state = initialState, action) => {
    switch (action.type) {


        case AEPS_TERMS_CONDITION_OTP_SUCCESS:
            return {
                ...state,
                aepsOtp: action.payload,
                loading: false,
                error: null,
                success: action.payload.status,
                message: action.payload.message,
            };

        case AEPS_STATUS_CHECK_SUCCESS:
            return {
                ...state,
                aepsStatus: action.payload,
                loading: false,
                error: null,
                success: action.payload.status,
                message: action.payload.message,
            };

        case AEPS_CW_HISTORY_SUCCESS:
            return {
                ...state,
                aepsCwHistory: action.payload.data,
                aepsCwHistoryTotalCount: action.payload.totalCount || 0,
                loading: false,
                error: null,
                success: action.payload.status,
                message: action.payload.message,
            };

        case AEPS_CW_HISTORY_FAILURE:
            return {
                ...state,
                aepsCwHistory: null,
                aepsCwHistoryTotalCount: 0,
                loading: false,
                error: action.payload,
                success: null,
                message: action.payload?.message || action.payload,
            };

        default:
            return state;
    }
};

export default aepsReducer;

