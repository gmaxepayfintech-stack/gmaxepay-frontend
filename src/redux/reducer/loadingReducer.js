import { LOADING_START, LOADING_END } from '../actionType/loadingActionType';

const initialState = {
  isLoading: false
};

const loadingReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOADING_START:
      return { ...state, isLoading: true };
    case LOADING_END:
      return { ...state, isLoading: false };
    default:
      return state;
  }
};

export default loadingReducer;
