import { RETAILER_ONBOARDING_REFERAL_CODE_SUCCESS, RETAILER_ONBOARDING_SEND__OTP_SUCCESS, RETAILER_OTP_SUBMIT_SUCCESS, RETAILER_OTP_SUBMIT_FAILURE, RETAILER_SEND_EMAIL_OTP_SUCCESS } from "../actionType/retailerOnboardingActionType";

// Restore state from localStorage if available
const getInitialState = () => {
    try {
        const storedReferral = localStorage.getItem("referralCodeCompleted");
        if (storedReferral) {
            const parsed = JSON.parse(storedReferral);
            if (parsed?.status === "SUCCESS") {
                return {
                    loading: false,
                    error: null,
                    referalResponse: {
                        retailerOnboarding: parsed.retailerOnboarding,
                        Success: parsed.Success,
                        status: parsed.status,
                        message: parsed.message,
                    },
                    Success: parsed.status,
                    status: parsed.status,
                    message: parsed.message,
                    currentStep: 1,
                    OTPResponse:null,
                    OTPSubmitResponse:null,
                    emailSendEmailOtpResponse:null,
                };
            }
        }
    } catch (e) {
        console.error("Error restoring referral code state from localStorage:", e);
    }

    return {
        loading: false,
        error: null,
        referalResponse: null,
        currentStep: 1,
        OTPResponse: null,
        OTPSubmitResponse: null,
    };
};

const initialState = getInitialState();

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

        case RETAILER_ONBOARDING_SEND__OTP_SUCCESS:
            return {
                ...state,
                error: true,
                OTPResponse: action.payload,
                Success: action.payload.status,
                status: action.payload.status,
                message: action.payload.message,
            };

        case RETAILER_OTP_SUBMIT_SUCCESS:
            return {
                ...state,
                error: null,
                OTPSubmitResponse: action.payload,
                Success: action.payload.status,
                status: action.payload.status,
                message: action.payload.message,
            };
        case RETAILER_OTP_SUBMIT_FAILURE:
            return {
                ...state,
                error: action.payload,
                OTPSubmitResponse: null,
                Success: "FAILURE",
                status: "FAILURE",
                message: typeof action.payload === "string" ? action.payload : action.payload?.message || "Failed to verify OTP",
            };
        case RETAILER_SEND_EMAIL_OTP_SUCCESS:
            return {
                ...state,
                error: true,
                emailSendEmailOtpResponse: action.payload,
                Success: action.payload.status,
                status: action.payload.status,
                message: action.payload.message,
            };
        default:
            return state;
    }
};

export default retailerOnboardingReducer;
