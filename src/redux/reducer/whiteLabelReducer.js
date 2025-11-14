import {
  WHITELABEL_CREATE_SUCCESS,
  GET_PINCODE_BY_CITY_SUCCESS,
  GET_CITY_BY_PINCODE_SUCCESS,
  GET_IP_CHECK_SUCCESS,
  GET_PANDATA_FETCH_SUCCESS,
} from "../actionType/whiteLabelAction";

const initialState = {
  loading: false,
  error: null,
  profileImage: null,
  citybyPincode: null,
  Success: null,
  message: null,
  pincodeByCity: null,
  panData:null,
  createResponse:null,
};

const whiteLabelReducer = (state = initialState, action) => {
  switch (action.type) {
    case WHITELABEL_CREATE_SUCCESS:
      return {
        ...state,
        loading: false,
        error: action.payload,
        createResponse: action.payload,
         Success: action.payload.status,
        message: action.payload.message,
      };
    case GET_IP_CHECK_SUCCESS:
      return {
        ...state,
        loading: false,
        error: action.payload,
        ipResponse: action.payload,
         Success: action.payload.status,
        message: action.payload.message,
      };

    case GET_CITY_BY_PINCODE_SUCCESS:
      console.log(action.payload);

      return {
        ...state,
        loading: false,
        error: action.payload,
        citybyPincode: action.payload,
        Success: action.payload.status,
        message: action.payload.message,
      };
      
    case GET_PINCODE_BY_CITY_SUCCESS:
      return {
        ...state,
        loading: false,
        error: action.payload,
        pincodeByCity: action?.payload,
        success: action?.payload?.status,
        message: action?.payload?.message,
      };

    case GET_PANDATA_FETCH_SUCCESS:
      return {
        ...state,
        loading: false,
        panData: action?.payload,
        success: action?.payload?.status,
        message: action?.payload?.message,
      };

    default:
      return state;
  }
};

export default whiteLabelReducer;
