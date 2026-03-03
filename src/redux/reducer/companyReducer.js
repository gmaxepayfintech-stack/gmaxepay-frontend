import { SET_COMPANY, CLEAR_COMPANY } from '../actionType/companyActionType';

const initialState = {
  company: null,
};

const companyReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_COMPANY:
      return {
        ...state,
        company: action.payload,
      };
    case CLEAR_COMPANY:
      return {
        ...state,
        company: null,
      };
    default:
      return state;
  }
};

export default companyReducer;

