import {
  SUBSCRIPTION_GET_LIST_START,
  SUBSCRIPTION_GET_LIST_SUCCESS,
  SUBSCRIPTION_GET_LIST_FAILURE,
} from '../actionType/subscriptionActionType';

const initialState = {
  loading: false,
  error: null,
  subscriptions: [],
  message: null,
};

const subscriptionReducer = (state = initialState, action) => {
  switch (action.type) {
    case SUBSCRIPTION_GET_LIST_START:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case SUBSCRIPTION_GET_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        subscriptions: action.payload?.data || [],
        message: action.payload?.message || null,
      };

    case SUBSCRIPTION_GET_LIST_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        subscriptions: [],
        message: null,
      };

    default:
      return state;
  }
};

export default subscriptionReducer;
