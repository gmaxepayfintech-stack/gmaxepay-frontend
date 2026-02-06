import {
  SERVICE_LIST_SUCCESS,
  SERVICE_LIST_FAILURE,
  SERVICE_CREATE_SUCCESS,
  SERVICE_CREATE_FAILURE,
  SERVICE_UPDATE_SUCCESS,
  SERVICE_UPDATE_FAILURE,
} from "../actionType/serviceActionType";

const initialState = {
  serviceList: [],
  success: null,
  message: null,
  error: null,
  updateResponse: null, // ✅ added
};

const serviceReducer = (state = initialState, action) => {
  switch (action.type) {
    case SERVICE_LIST_SUCCESS:
      return {
        ...state,
        serviceList: action.payload?.services || [],
        success: action.payload?.status || true,
        message: action.payload?.message || null,
        error: null,
      };

    case SERVICE_CREATE_SUCCESS:
      return {
        ...state,
        success: action.payload?.status || true,
        message: action.payload?.message || "Service created successfully",
        error: null,
      };

    case SERVICE_UPDATE_SUCCESS:
      return {
        ...state,
        updateResponse: action.payload,
        success: true,
        message: action.payload?.message || "Service updated successfully",
        error: null,
      };

    case SERVICE_LIST_FAILURE:
    case SERVICE_CREATE_FAILURE:
    case SERVICE_UPDATE_FAILURE:
      return {
        ...state,
        error: action.payload,
        success: false,
        message:
          action.payload?.message || action.payload || "Something went wrong",
      };

    default:
      return state;
  }
};

export default serviceReducer;
