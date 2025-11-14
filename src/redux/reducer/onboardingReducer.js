import {
  CLEAR_ONBOARDING,
  UPDATE_ONBOARDING_STEP,
} from '../actionType/onboardingActionType';
import { fetchOnboarding, postProfile } from '../action/onboardingAction';

const initialState = {
  loading: false,
  error: null,
  userId: null,
  name: null,
  steps: [],
  pending: [],
  isOnboardingCompleted: false,
  currentStep: 1,
  postProfileLoading: false,
  postProfileError: null,
  postProfileSuccess: false,
  postProfileMessage: '',
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
      // Determine current step based on pending steps
      const stepKeyMap = {
        'mobileVerification': 1,
        'emailVerification': 2,
        'aadharVerification': 3,
        'panVerification': 4,
        'shopDetails': 5,
        'bankVerification': 6,
        'profile': 7,
      };
      
      // Find first pending step or default to 1
      let currentStep = 1;
      if (data.pending && data.pending.length > 0) {
        const firstPendingKey = data.pending[0];
        currentStep = stepKeyMap[firstPendingKey] || 1;
      } else if (data.isOnboardingCompleted) {
        // If completed, show last step
        currentStep = 7;
      } else {
        // Find first incomplete step
        const incompleteStep = data.steps?.find(step => !step.done);
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
        error: action.payload || 'Failed to fetch onboarding data',
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
        postProfileMessage: '',
      };
    
    case postProfile.fulfilled.type:
      const successMessage = action.payload?.message || 'Profile photo uploaded successfully.';
      return {
        ...state,
        postProfileLoading: false,
        postProfileError: null,
        postProfileSuccess: true,
        postProfileMessage: successMessage,
      };
    
    case postProfile.rejected.type:
      return {
        ...state,
        postProfileLoading: false,
        postProfileError: action.payload || 'Failed to post profile',
        postProfileSuccess: false,
        postProfileMessage: '',
      };
    
    case CLEAR_ONBOARDING:
      return initialState;
    
    default:
      return state;
  }
};

export default onboardingReducer;

