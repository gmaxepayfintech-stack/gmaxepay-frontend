import {
  OPERATOR_LIST_SUCCESS,
  OPERATOR_LIST_FAILURE,
  OPERATOR_CREATE_SUCCESS,
  OPERATOR_CREATE_FAILURE,
  OPERATOR_UPDATE_SUCCESS,
  OPERATOR_UPDATE_FAILURE,
  ADMIN_UPGRADE_LIST_SUCCESS,
  EMPLOYEE_OPERATOR_LIST_SUCCESS,
  EMPLOYEE_OPERATOR_LIST_FAILURE,
  EMPLOYEE_OPERATOR_CREATE_SUCCESS,
  EMPLOYEE_OPERATOR_CREATE_FAILURE,
  EMPLOYEE_OPERATOR_UPDATE_SUCCESS,
  EMPLOYEE_OPERATOR_UPDATE_FAILURE,
  EMPLOYEE_ADMIN_UPGRADE_LIST_SUCCESS,
  EMPLOYEE_ADMIN_UPGRADE_LIST_FAILURE,
} from "../actionType/operatorActionType";

const initialState = {
  loading: false,
  error: null,
  success: null,
  message: null,

  operatorList: null, // full paginated response
  adminList: [],
  commTotal: null,
};

const operatorReducer = (state = initialState, action) => {
  switch (action.type) {
    case OPERATOR_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        success: action?.payload?.status,
        message: action?.payload?.message,
        operatorList: action?.payload,
      };
    case EMPLOYEE_OPERATOR_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        success: action?.payload?.status,
        message: action?.payload?.message,
        operatorList: action?.payload,
      };

    case OPERATOR_LIST_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        success: false,
      };
    case EMPLOYEE_OPERATOR_LIST_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        success: false,
      };

    case OPERATOR_CREATE_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        success: action?.payload?.status,
        message: action?.payload?.message,
      };
    case EMPLOYEE_OPERATOR_CREATE_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        success: action?.payload?.status,
        message: action?.payload?.message,
      };

    case OPERATOR_CREATE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        success: false,
      };
    case EMPLOYEE_OPERATOR_CREATE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        success: false,
      };

    case OPERATOR_UPDATE_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        success: action?.payload?.status,
        message: action?.payload?.message,
      };
    case EMPLOYEE_OPERATOR_UPDATE_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        success: action?.payload?.status,
        message: action?.payload?.message,
      };

    case OPERATOR_UPDATE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        success: false,
      };
    case EMPLOYEE_OPERATOR_UPDATE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        success: false,
      };

    case ADMIN_UPGRADE_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        success: action?.payload?.status,
        message: action?.payload?.message,
        adminList: action?.payload?.data || [],
        commTotal: action?.payload?.total || 0,
      };
    case EMPLOYEE_ADMIN_UPGRADE_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        success: action?.payload?.status,
        message: action?.payload?.message,
        adminList: action?.payload?.data || [],
        commTotal: action?.payload?.total || 0,
      };

    default:
      return state;
  }
};

export default operatorReducer;
