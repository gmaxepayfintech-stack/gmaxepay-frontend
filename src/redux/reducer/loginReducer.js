import {
  LOGIN_SUCCESS,
  VERIFICATION_OTP_SUCCESS,
} from "../actionType/loginActionType";

const initialState = {
  loading: false,
  error: null,
  loginResponse: null,
  Success: null,
  verificationcode: null,
  currentStep: 1,
};

const loginReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_SUCCESS:
      return {
        ...state,
        loading: true,
        loginResponse: action.payload,
        Success: action.payload.status,
        error: null,
      };

    case VERIFICATION_OTP_SUCCESS:
      return {
        ...state,
        loading: true,
        verificationcode: action.payload,
        Success: action.payload,
        error: null,
      };

    default:
      return state;
  }
};

export default loginReducer;
