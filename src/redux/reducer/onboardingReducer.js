import {
  CLEAR_ONBOARDING,
  MOBILE_OTP_SENT_SUCCESS,
  SMS_RESEND_OTP_SUCCESS,
  UPDATE_ONBOARDING_STEP,
  SMS_VERIFY_OTP_SUCCESS,
  EMAIL_OTP_SENT_SUCCESS,
  EMAIL_RESCEND_OTP_SUCCESS,
  EMAIL_VERIFY_OTP_SUCCESS,
  AADHAAR_CONNECTION_SUCCESS,
  DOWNLOAD_AADHAAR_SUCCESS,
  UPLOAD_AADHAAR_SUCCESS,
  UPLOAD_AADHAAR_FAILURE,
  PAN_CONNECTION_SUCCESS,
  PAN_CONNECTION_FAILURE,
  DOWNLOAD_PAN_SUCCESS,
  DOWNLOAD_PAN_FAILURE,
  UPLOAD_PAN_SUCCESS,
  UPLOAD_PAN_FAILURE,
  POST_BANK_DETAILS_SUCCESS,
  POST_BANK_DETAILS_FAILURE,
  POST_PROFILE_START,
  POST_PROFILE_SUCCESS,
  POST_PROFILE_FAILURE,
  POST_SHOP_DETAILS_START,
  POST_SHOP_DETAILS_SUCCESS,
  POST_SHOP_DETAILS_FAILURE,
} from "../actionType/onboardingActionType";
import { fetchOnboarding, postProfile } from "../action/onboardingAction";

const initialState = {
  loading: false,
  error: null,
  userId: null,
  name: null,
  steps: [],
  pending: [],
  isOnboardingCompleted: false,
  currentStep: 1,
  otpStatus: null,
  success: null,
  message: null,
  rescendResponse: null,
  postProfileLoading: false,
  postProfileError: null,
  postProfileSuccess: false,
  postProfileMessage: "",
  postShopDetailsLoading: false,
  postShopDetailsError: null,
  postShopDetailsSuccess: false,
  postShopDetailsMessage: "",
  verifySmsVerify: null,
  emailOtpSent: null,
  emailrescendOtp: null,
  emailOtpVerify: null,
  aadhaarVerify: null,
  downloadResponse: null,
  uploadAadhaarResponse: null,
  uploadAadhaarError: null,
  panVerify: null,
  downloadPanResponse: null,
  uploadPanResponse: null,
  uploadPanError: null,
  bankDetailsResponse: null,
  bankDetailsError: null,
  bankDetailsStatus: null,
};

const onboardingReducer = (state = initialState, action) => {
  switch (action.type) {
    case fetchOnboarding.pending.type:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case fetchOnboarding.fulfilled.type: {
      // action.payload now contains the full API response object { status, message, data }
      const responsePayload = action.payload || {};
      const data = responsePayload.data || responsePayload;
      const apiMessage = responsePayload.message || null;
      const stepKeyMap = {
        mobileVerification: 1,
        emailVerification: 2,
        aadharVerification: 3,
        panVerification: 4,
        shopDetails: 5,
        bankVerification: 6,
        profile: 7,
      };

      let currentStep = 1;
      if (data.pending && data.pending.length > 0) {
        const firstPendingKey = data.pending[0];
        currentStep = stepKeyMap[firstPendingKey] || 1;
      } else if (data.isOnboardingCompleted) {
        // If completed, show last step
        currentStep = 7;
      } else {
        // Find first incomplete step
        const incompleteStep = data.steps?.find((step) => !step.done);
        if (incompleteStep) {
          currentStep = stepKeyMap[incompleteStep.key] || 1;
        }
      }

      return {
        ...state,
        loading: false,
        error: null,
        userId: data.userId || null,
        name: data.name || null,
        steps: data.steps || [],
        pending: data.pending || [],
        isOnboardingCompleted: data.isOnboardingCompleted || false,
        currentStep: currentStep,
        // capture any API message sent with the onboarding response
        message: apiMessage,
      };
    }

    case fetchOnboarding.rejected.type:
      return {
        ...state,
        loading: false,
        error: action.payload || "Failed to fetch onboarding data",
      };

    case UPDATE_ONBOARDING_STEP:
      return {
        ...state,
        currentStep: action.payload,
      };

    case POST_PROFILE_START:
      return {
        ...state,
        postProfileLoading: true,
        postProfileError: null,
        postProfileSuccess: false,
        postProfileMessage: "",
      };

    case POST_PROFILE_SUCCESS:
      return {
        ...state,
        postProfileLoading: false,
        postProfileError: null,
        postProfileSuccess: true,
        postProfileMessage: action.payload?.message || "Profile photo uploaded successfully.",
      };

    case POST_PROFILE_FAILURE:
      return {
        ...state,
        postProfileLoading: false,
        postProfileError: action.payload?.message || action.payload || "Failed to post profile",
        postProfileSuccess: false,
        postProfileMessage: "",
      };

    case POST_SHOP_DETAILS_START:
      return {
        ...state,
        postShopDetailsLoading: true,
        postShopDetailsError: null,
        postShopDetailsSuccess: false,
        postShopDetailsMessage: "",
      };

    case POST_SHOP_DETAILS_SUCCESS:
      return {
        ...state,
        postShopDetailsLoading: false,
        postShopDetailsError: null,
        postShopDetailsSuccess: true,
        postShopDetailsMessage: action.payload?.message || "Shop details uploaded successfully.",
      };

    case POST_SHOP_DETAILS_FAILURE:
      return {
        ...state,
        postShopDetailsLoading: false,
        postShopDetailsError: action.payload?.message || action.payload || "Failed to post shop details",
        postShopDetailsSuccess: false,
        postShopDetailsMessage: "",
      };

    case CLEAR_ONBOARDING:
      return initialState;

    case MOBILE_OTP_SENT_SUCCESS:
      //console.log("otpstatus", action.payload);

      return {
        ...state,
        error: null,
        otpStatus: action?.payload,
        success: action?.payload.status,
        message: action?.payload?.message,
      };

    case SMS_RESEND_OTP_SUCCESS:
      //console.log("resend", action.payload);

      return {
        ...state,
        error: null,
        rescendResponse: action?.payload,
        success: action?.payload?.status,
        message: action?.payload?.message,
      };

    case SMS_VERIFY_OTP_SUCCESS:
      return {
        ...state,
        verifySmsVerify: action?.payload,
        success: action?.payload?.status,
        message: action?.payload?.message,
      };

    case EMAIL_OTP_SENT_SUCCESS:
      //console.log("Email", action?.payload);

      return {
        ...state,
        emailOtpSent: action?.payload,
        success: action?.payload?.status,
        message: action?.payload?.message,
      };

    case EMAIL_RESCEND_OTP_SUCCESS:
      return {
        ...state,
        emailrescendOtp: action.payload,
        success: action.payload.status,
        message: action.payload.message,
      };

    case EMAIL_VERIFY_OTP_SUCCESS:
      return {
        ...state,
        success: action.payload.status,
        message: action.payload.message,
        emailOtpVerify: action?.payload,
      };

    case AADHAAR_CONNECTION_SUCCESS:
      return {
        ...state,
        aadhaarVerify: action?.payload,
        success: action.payload.status,
        message: action.payload.message,
      };

    case DOWNLOAD_AADHAAR_SUCCESS:
      return{
        ...state,
        success: action.payload.status,
        message: action.payload.message,
        downloadResponse: action?.payload,
      }

    case UPLOAD_AADHAAR_SUCCESS:
      return {
        ...state,
        success: action.payload.status,
        message: action.payload.message,
        uploadAadhaarResponse: action?.payload,
        uploadAadhaarError: null,
      };

    case UPLOAD_AADHAAR_FAILURE:
      return {
        ...state,
        success: action.payload?.status || "FAILURE",
        message: action.payload?.message || action.payload,
        uploadAadhaarError: action.payload,
        uploadAadhaarResponse: null,
      };

    case PAN_CONNECTION_SUCCESS:
      return {
        ...state,
        panVerify: action?.payload,
        success: action.payload.status,
        message: action.payload.message,
      };

    case PAN_CONNECTION_FAILURE:
      return {
        ...state,
        success: action.payload?.status || "FAILURE",
        message: action.payload?.message || action.payload,
      };

    case DOWNLOAD_PAN_SUCCESS:
      return {
        ...state,
        success: action.payload.status,
        message: action.payload.message,
        downloadPanResponse: action?.payload,
      };

    case DOWNLOAD_PAN_FAILURE:
      return {
        ...state,
        success: action.payload?.status || "FAILURE",
        message: action.payload?.message || action.payload,
      };

    case UPLOAD_PAN_SUCCESS:
      return {
        ...state,
        success: action.payload.status,
        message: action.payload.message,
        uploadPanResponse: action?.payload,
        uploadPanError: null,
      };

    case UPLOAD_PAN_FAILURE:
      return {
        ...state,
        success: action.payload?.status || "FAILURE",
        message: action.payload?.message || action.payload,
        uploadPanError: action.payload,
        uploadPanResponse: null,
      };

    case POST_BANK_DETAILS_SUCCESS:
      return {
        ...state,
        success: action.payload.status,
        message: action.payload.message,
        bankDetailsResponse: action.payload.bankDetailsResponse,
        bankDetailsStatus: "SUCCESS",
        bankDetailsError: null,
      };

    case POST_BANK_DETAILS_FAILURE:
      return {
        ...state,
        success: action.payload?.status || "FAILURE",
        message: action.payload?.message || action.payload,
        bankDetailsError: action.payload,
        bankDetailsStatus: "FAILURE",
        bankDetailsResponse: null,
      };

    default:
      return state;
  }
};

export default onboardingReducer;
