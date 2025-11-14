import {
  CLEAR_ONBOARDING,
  MOBILE_OTP_SENT_SUCCESS,
  SMS_RESEND_OTP_SUCCESS,
  UPDATE_ONBOARDING_STEP,
} from "../actionType/onboardingActionType";
import { fetchOnboarding } from "../action/onboardingAction";

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
  success:null,
  message:null,
  rescendResponse: null,
};

const onboardingReducer = (state = initialState, action) => {
  switch (action.type) {
    case fetchOnboarding.pending.type:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case fetchOnboarding.fulfilled.type:
      const data = action.payload;
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
      };

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

    default:
      return state;
  }
};

export default onboardingReducer;
