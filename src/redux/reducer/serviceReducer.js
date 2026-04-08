import {
  SERVICE_LIST_SUCCESS,
  SERVICE_LIST_FAILURE,
  SERVICE_CREATE_SUCCESS,
  SERVICE_CREATE_FAILURE,
  SERVICE_UPDATE_SUCCESS,
  SERVICE_UPDATE_FAILURE,
  EMPLOYEE_SERVICE_LIST_SUCCESS,
  EMPLOYEE_SERVICE_LIST_FAILURE,
  EMPLOYEE_SERVICE_CREATE_SUCCESS,
  EMPLOYEE_SERVICE_CREATE_FAILURE,
  EMPLOYEE_SERVICE_UPDATE_SUCCESS,
  EMPLOYEE_SERVICE_UPDATE_FAILURE,
} from "../actionType/serviceActionType";

const initialState = {
  serviceList: null, // holds data + paginator
  loading: false,
  success: null,
  message: null,
  error: null,
};

const serviceReducer = (state = initialState, action) => {
  switch (action.type) {
    /* =======================
       LIST SERVICES
    ======================= */
    case SERVICE_LIST_SUCCESS:
      return {
        ...state,
        serviceList: action.payload,
        loading: false,
        success: action.payload?.status,
        message: action.payload?.message,
        error: null,
      };
    case EMPLOYEE_SERVICE_LIST_SUCCESS:
      return {
        ...state,
        serviceList: action.payload,
        loading: false,
        success: action.payload?.status,
        message: action.payload?.message,
        error: null,
      };

    case SERVICE_LIST_FAILURE:
      return {
        ...state,
        loading: false,
        success: false,
        error: action.payload,
      };
    case EMPLOYEE_SERVICE_LIST_FAILURE:
      return {
        ...state,
        loading: false,
        success: false,
        error: action.payload,
      };

    /* =======================
       CREATE SERVICE
    ======================= */
    case SERVICE_CREATE_SUCCESS:
      return {
        ...state,
        loading: false,
        success: action.payload?.status,
        message: action.payload?.message,
        error: null,
      };
    case EMPLOYEE_SERVICE_CREATE_SUCCESS:
      return {
        ...state,
        loading: false,
        success: action.payload?.status,
        message: action.payload?.message,
        error: null,
      };

    case SERVICE_CREATE_FAILURE:
      return {
        ...state,
        loading: false,
        success: false,
        error: action.payload,
      };
    case EMPLOYEE_SERVICE_CREATE_FAILURE:
      return {
        ...state,
        loading: false,
        success: false,
        error: action.payload,
      };

    /* =======================
       UPDATE SERVICE
    ======================= */
    case SERVICE_UPDATE_SUCCESS:
      return {
        ...state,
        loading: false,
        success: action.payload?.status,
        message: action.payload?.message,
        error: null,
      };
    case EMPLOYEE_SERVICE_UPDATE_SUCCESS:
      return {
        ...state,
        loading: false,
        success: action.payload?.status,
        message: action.payload?.message,
        error: null,
      };

    case SERVICE_UPDATE_FAILURE:
      return {
        ...state,
        loading: false,
        success: false,
        error: action.payload,
      };
    case EMPLOYEE_SERVICE_UPDATE_FAILURE:
      return {
        ...state,
        loading: false,
        success: false,
        error: action.payload,
      };

    default:
      return state;
  }
};

export default serviceReducer;
