import {
  GET_CITY_BY_PINCODE_FAILURE,
  GET_IP_CHECK_FAILURE,
  GET_PANDATA_FETCH_FAILURE,
  GET_PINCODE_BY_CITY_FAILURE,
  WHITELABEL_CREATE_FAILURE,
} from "../actionType/whiteLabelAction";

const initialState = {
  loading: false,
  error: null,
  message: null,
};

const errorReducer = (state = initialState, action) => {
  switch (action.type) {
    case WHITELABEL_CREATE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        message: action.payload,
      };
    case GET_IP_CHECK_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        message: action.payload,
      };

    case GET_CITY_BY_PINCODE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        message: action.payload,
      };

    case GET_PINCODE_BY_CITY_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        message: action?.payload,
      };

    case GET_PANDATA_FETCH_FAILURE:
      console.log("actions", action.payload);

      return {
        ...state,
        loading: false,
        error: action.payload?.errorData?.data
,
        message: action?.payload?.data,
      };

    default:
      return state;
  }
};

export default errorReducer;
