import {
  AEPSTWO_ONBOARDING_SUCCESS,
  AEPSTWO_SEND_OTP_SUCCESS,
  AEPSTWO_STATUS_CHECK_SUCCESS,
} from "../actionType/aepsTwoActionType";

const initialState = {
  loading: false,
  error: null,
  success: null,
  message: null,
  aepsStatus: null,
  onBoarding: null,
};

const aepsTwoReducer = (state = initialState, action) => {
  switch (action.type) {
    case AEPSTWO_STATUS_CHECK_SUCCESS:
      return {
        ...state,
        aepsStatus: action?.payload,
        loading: false,
        error: null,
        success: action?.payload?.status,
        message: action?.payload?.message,
      };

    case AEPSTWO_ONBOARDING_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        onBoarding: action?.payload,
        success: action?.payload?.status,
        message: action?.payload?.message,
      };

    case AEPSTWO_SEND_OTP_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        otpStatus: action?.payload,
        success: action?.payload?.status,
        message: action?.payload?.message,
      };

    default:
      return state;
  }
};

export default aepsTwoReducer;
