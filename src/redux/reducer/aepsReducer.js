import { AEPS_RESCEND_OTP_SUCCESS, AEPS_STATUS_CHECK_SUCCESS, AEPS_SUBMIT_OTP_SUCCESS, AEPS_TERMS_CONDITION_OTP_SUCCESS } from "../actionType/aepsActionType";

const initialState = {
    loading: false,
    error: null,
    aepsOtp: null,
    success: null,
    message: null,
    rescendOtp: null,
    aepsStatus: null,
    submitOtp: null,
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
            }

        case AEPS_RESCEND_OTP_SUCCESS:
            return {
                ...state,
                rescendOtp: action.payload,
                loading: false,
                error: null,
                success: action.payload.status,
                message: action.payload.message,
            }

        case AEPS_SUBMIT_OTP_SUCCESS:
            return {
                ...state,
                submitOtp: action.payload,
                loading: false,
                error: null,
                success: action.payload.status,
                message: action.payload.message,
            }


        default:
            return state;
    }
};

export default aepsReducer;

