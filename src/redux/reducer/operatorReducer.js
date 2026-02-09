import {
  OPERATOR_LIST_SUCCESS,
  OPERATOR_LIST_FAILURE,
  OPERATOR_CREATE_SUCCESS,
  OPERATOR_CREATE_FAILURE,
  OPERATOR_UPDATE_SUCCESS,
  OPERATOR_UPDATE_FAILURE,
  ADMIN_UPGRADE_LIST_SUCCESS,
} from "../actionType/operatorActionType";

const initialState = {
  operatorList: [],
  success: null,
  error: null,
  message: null,
  commTotal: null,
  adminList: [],
};

const operatorReducer = (state = initialState, action) => {
  switch (action.type) {
    case OPERATOR_LIST_SUCCESS:
      return {
        ...state,
        operatorList: action.payload,
        error: null,
      };

    case OPERATOR_CREATE_SUCCESS:
    case OPERATOR_UPDATE_SUCCESS:
      return {
        ...state,
        success: true,
        message: action.payload?.message,
        error: null,
      };

    case OPERATOR_LIST_FAILURE:
    case OPERATOR_CREATE_FAILURE:
    case OPERATOR_UPDATE_FAILURE:
      return {
        ...state,
        error: action.payload,
        success: false,
      };

    case ADMIN_UPGRADE_LIST_SUCCESS:
      return{
        ...state,
        loading:false,
        error: null,
        adminList: action?.payload?.data || [],
        message: action?.payload?.message,
        success: action?.payload?.status,
        commTotal: action.payload?.total || 0,
      }

    default:
      return state;
  }
};

export default operatorReducer;
