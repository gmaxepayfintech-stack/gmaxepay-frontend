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
  verifySmsVerify: null,
  emailOtpSent: null,
  emailrescendOtp: null,
  emailOtpVerify: null,
  aadhaarVerify: null,
  downloadResponse: null,
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

    case postProfile.pending.type:
      return {
        ...state,
        postProfileLoading: true,
        postProfileError: null,
        postProfileSuccess: false,
        postProfileMessage: "",
      };

    case postProfile.fulfilled.type: {
      const successMessage =
        action.payload?.message || "Profile photo uploaded successfully.";
      return {
        ...state,
        postProfileLoading: false,
        postProfileError: null,
        postProfileSuccess: true,
        postProfileMessage: successMessage,
      };
    }

    case postProfile.rejected.type:
      return {
        ...state,
        postProfileLoading: false,
        postProfileError: action.payload || "Failed to post profile",
        postProfileSuccess: false,
        postProfileMessage: "",
      };

    case CLEAR_ONBOARDING:
      return initialState;

    case MOBILE_OTP_SENT_SUCCESS:
      console.log("otpstatus", action.payload);

      return {
        ...state,
        error: null,
        otpStatus: action?.payload,
        success: action?.payload.status,
        message: action?.payload?.message,
      };

    case SMS_RESEND_OTP_SUCCESS:
      console.log("resend", action.payload);

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
      console.log("Email", action?.payload);

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
    default:
      return state;
  }
};

export default onboardingReducer;
