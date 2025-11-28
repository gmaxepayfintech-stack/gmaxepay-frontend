import {
  WHITELABEL_CREATE_SUCCESS,
  GET_PINCODE_BY_CITY_SUCCESS,
  GET_CITY_BY_PINCODE_SUCCESS,
  GET_IP_CHECK_SUCCESS,
  GET_PANDATA_FETCH_SUCCESS,
  GET_WHITELABEL_LIST_SUCCESS,
  FETCH_KYC_DETAILS_SUCCESS,
  GET_KYCSTATUS_SUCCESS,
  UPDATE_KYCSTATUS_SUCCESS,

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
  whitelabelList: null,
  kycDetails:null,
  kycStatusClick:null,
  kycStatusCheck:null,
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

    case GET_WHITELABEL_LIST_SUCCESS:
      return{
        ...state,
        loading: false,
        whitelabelList: action.payload,
        Success: action.payload.status,
        message: action.payload.message,
      }
    case FETCH_KYC_DETAILS_SUCCESS:
      return{
        ...state,
        loading: false,
        kycDetails: action.payload,
        Success: action.payload.status,
        message: action.payload.message,
      }

    case GET_KYCSTATUS_SUCCESS:
      return{
        ...state,
        loading: false,
        kycStatusClick: action.payload,
        Success: action.payload.status,
        message: action.payload.message,
      }

    case UPDATE_KYCSTATUS_SUCCESS:
      return{
        ...state,
        loading: false,
        kycStatusClick: action.payload,
        Success: action.payload.status,
        message: action.payload.message,
      } 
      case UPDATE_KYCSTATUS_SUCCESS:
        return{
          ...state,
          loading: false,
          error: action.payload,
          message: action.payload.message,
          Success: action.payload.status,
          kycStatusCheck: action.payload,
        }
    default:
      return state;
  }
};

export default whiteLabelReducer;
