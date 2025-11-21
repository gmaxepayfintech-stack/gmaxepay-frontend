import { RETAILER_ONBOARDING_REFERAL_CODE_SUCCESS } from "../actionType/retailerOnboardingActionType";

const initialState = {
    loading: false,
    error: null,
    referalResponse: null,
    currentStep: 1,
};

const retailerOnboardingReducer = (state = initialState, action) => {
    switch (action.type) {
        case RETAILER_ONBOARDING_REFERAL_CODE_SUCCESS:
            console.log("action.payload", action.payload);
            return {
                ...state,
                error: true,
                referalResponse: action.payload,
                Success: action.payload.status,
                status: action.payload.status,
                message: action.payload.message,
            };


        default:
            return state;
    }
};

export default retailerOnboardingReducer;
