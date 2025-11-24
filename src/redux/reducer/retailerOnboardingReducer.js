import { RETAILER_ONBOARDING_REFERAL_CODE_SUCCESS, RETAILER_ONBOARDING_SEND__OTP_SUCCESS, RETAILER_OTP_SUBMIT_SUCCESS, RETAILER_OTP_SUBMIT_FAILURE, RETAILER_SEND_EMAIL_OTP_SUCCESS, RETAILER_RESEND_EMAIL_OTP_SUCCESS, RETAILER_SUBMIT_EMAIL_SUCCESS, RETAILER_POST_SHOP_DETAILS_SUCCESS, RETAILER_POST_SHOP_DETAILS_FAILURE, RETAILER_AADHAAR_CONNECTION_SUCCESS, RETAILER_AADHAAR_CONNECTION_FAILURE, RETAILER_DOWNLOAD_AADHAAR_SUCCESS, RETAILER_DOWNLOAD_AADHAAR_FAILURE, RETAILER_UPLOAD_AADHAAR_SUCCESS, RETAILER_UPLOAD_AADHAAR_FAILURE, RETAILER_PAN_CONNECTION_SUCCESS, RETAILER_PAN_CONNECTION_FAILURE, RETAILER_DOWNLOAD_PAN_SUCCESS, RETAILER_DOWNLOAD_PAN_FAILURE, RETAILER_UPLOAD_PAN_SUCCESS, RETAILER_UPLOAD_PAN_FAILURE } from "../actionType/retailerOnboardingActionType";

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
                    emailReSendOtp:null,
                    emailSubmitEmailOtpResponse:null,
                    postShopDetailsResponse:null,
                    postShopDetailsLoading:false,
                    postShopDetailsError:null,
                    postShopDetailsSuccess:false,
                    postShopDetailsMessage:"",
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
        postShopDetailsResponse:null,
        postShopDetailsLoading:false,
        postShopDetailsError:null,
        postShopDetailsSuccess:false,
        postShopDetailsMessage:"",
        // Aadhaar verification state
        aadhaarConnectionResponse: null,
        aadhaarConnectionError: null,
        downloadAadhaarResponse: null,
        downloadAadhaarError: null,
        uploadAadhaarResponse: null,
        uploadAadhaarError: null,
        // PAN verification state
        panConnectionResponse: null,
        panConnectionError: null,
        downloadPanResponse: null,
        downloadPanError: null,
        uploadPanResponse: null,
        uploadPanError: null,
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
        case RETAILER_RESEND_EMAIL_OTP_SUCCESS:
            return {
                ...state,
                error: true,
                emailReSendOtp: action.payload,
                Success: action.payload.status,
                status: action.payload.status,
                message: action.payload.message,
            };

            case RETAILER_SUBMIT_EMAIL_SUCCESS:
                return {
                    ...state,
                    error: true,
                    emailSubmitEmailOtpResponse: action.payload,
                    Success: action.payload.status,
                    status: action.payload.status,
                    message: action.payload.message,
                };

        case RETAILER_POST_SHOP_DETAILS_SUCCESS:
            return {
                ...state,
                error: null,
                postShopDetailsResponse: action.payload,
                postShopDetailsLoading: false,
                postShopDetailsError: null,
                postShopDetailsSuccess: true,
                postShopDetailsMessage: action.payload.message || "Shop details submitted successfully",
                Success: action.payload.status,
                status: action.payload.status,
                message: action.payload.message,
            };

        case RETAILER_POST_SHOP_DETAILS_FAILURE:
            return {
                ...state,
                error: action.payload,
                postShopDetailsResponse: null,
                postShopDetailsLoading: false,
                postShopDetailsError: typeof action.payload === "string" ? action.payload : action.payload?.message || "Failed to submit shop details",
                postShopDetailsSuccess: false,
                postShopDetailsMessage: typeof action.payload === "string" ? action.payload : action.payload?.message || "Failed to submit shop details",
                Success: "FAILURE",
                status: "FAILURE",
                message: typeof action.payload === "string" ? action.payload : action.payload?.message || "Failed to submit shop details",
            };

        // Aadhaar Connection Cases
        case RETAILER_AADHAAR_CONNECTION_SUCCESS:
            return {
                ...state,
                error: null,
                aadhaarConnectionResponse: action.payload,
                aadhaarConnectionError: null,
                Success: action.payload.status,
                status: action.payload.status,
                message: action.payload.message,
            };

        case RETAILER_AADHAAR_CONNECTION_FAILURE:
            return {
                ...state,
                error: action.payload,
                aadhaarConnectionResponse: null,
                aadhaarConnectionError: typeof action.payload === "string" ? action.payload : action.payload?.message || "Failed to connect Aadhaar verification",
                Success: "FAILURE",
                status: "FAILURE",
                message: typeof action.payload === "string" ? action.payload : action.payload?.message || "Failed to connect Aadhaar verification",
            };

        // Download Aadhaar Cases
        case RETAILER_DOWNLOAD_AADHAAR_SUCCESS:
            return {
                ...state,
                error: null,
                downloadAadhaarResponse: action.payload,
                downloadAadhaarError: null,
                Success: action.payload.status,
                status: action.payload.status,
                message: action.payload.message,
            };

        case RETAILER_DOWNLOAD_AADHAAR_FAILURE:
            return {
                ...state,
                error: action.payload,
                downloadAadhaarResponse: null,
                downloadAadhaarError: typeof action.payload === "string" ? action.payload : action.payload?.message || "Failed to download Aadhaar document",
                Success: "FAILURE",
                status: "FAILURE",
                message: typeof action.payload === "string" ? action.payload : action.payload?.message || "Failed to download Aadhaar document",
            };

        // Upload Aadhaar Cases
        case RETAILER_UPLOAD_AADHAAR_SUCCESS:
            return {
                ...state,
                error: null,
                uploadAadhaarResponse: action.payload,
                uploadAadhaarError: null,
                Success: action.payload.status,
                status: action.payload.status,
                message: action.payload.message,
            };

        case RETAILER_UPLOAD_AADHAAR_FAILURE:
            return {
                ...state,
                error: action.payload,
                uploadAadhaarResponse: null,
                uploadAadhaarError: typeof action.payload === "string" ? action.payload : action.payload?.message || "Failed to upload Aadhaar documents",
                Success: "FAILURE",
                status: "FAILURE",
                message: typeof action.payload === "string" ? action.payload : action.payload?.message || "Failed to upload Aadhaar documents",
            };

        // PAN Connection Cases
        case RETAILER_PAN_CONNECTION_SUCCESS:
            return {
                ...state,
                error: null,
                panConnectionResponse: action.payload,
                panConnectionError: null,
                Success: action.payload.status,
                status: action.payload.status,
                message: action.payload.message,
            };

        case RETAILER_PAN_CONNECTION_FAILURE:
            return {
                ...state,
                error: action.payload,
                panConnectionResponse: null,
                panConnectionError: typeof action.payload === "string" ? action.payload : action.payload?.message || "Failed to connect PAN verification",
                Success: "FAILURE",
                status: "FAILURE",
                message: typeof action.payload === "string" ? action.payload : action.payload?.message || "Failed to connect PAN verification",
            };

        // Download PAN Cases
        case RETAILER_DOWNLOAD_PAN_SUCCESS:
            return {
                ...state,
                error: null,
                downloadPanResponse: action.payload,
                downloadPanError: null,
                Success: action.payload.status,
                status: action.payload.status,
                message: action.payload.message,
            };

        case RETAILER_DOWNLOAD_PAN_FAILURE:
            return {
                ...state,
                error: action.payload,
                downloadPanResponse: null,
                downloadPanError: typeof action.payload === "string" ? action.payload : action.payload?.message || "Failed to download PAN document",
                Success: "FAILURE",
                status: "FAILURE",
                message: typeof action.payload === "string" ? action.payload : action.payload?.message || "Failed to download PAN document",
            };

        // Upload PAN Cases
        case RETAILER_UPLOAD_PAN_SUCCESS:
            return {
                ...state,
                error: null,
                uploadPanResponse: action.payload,
                uploadPanError: null,
                Success: action.payload.status,
                status: action.payload.status,
                message: action.payload.message,
            };

        case RETAILER_UPLOAD_PAN_FAILURE:
            return {
                ...state,
                error: action.payload,
                uploadPanResponse: null,
                uploadPanError: typeof action.payload === "string" ? action.payload : action.payload?.message || "Failed to upload PAN document",
                Success: "FAILURE",
                status: "FAILURE",
                message: typeof action.payload === "string" ? action.payload : action.payload?.message || "Failed to upload PAN document",
            };
        
        default:
            return state;
    }
};

export default retailerOnboardingReducer;
