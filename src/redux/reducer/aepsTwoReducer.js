import { AEPSTWO_STATUS_CHECK_SUCCESS } from "../actionType/aepsTwoActionType";

const initialState = {
  loading: false,
  error: null,
  success: null,
  message: null,
  aepsStatus: null,
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

    default:
      return state;
  }
};

export default aepsTwoReducer;
