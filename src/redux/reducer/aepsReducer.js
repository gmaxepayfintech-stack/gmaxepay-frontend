import { AEPS_TERMS_CONDITION_OTP_SUCCESS } from "../actionType/aepsActionType";
  
  const initialState = {
    loading: false,
    error: null,
    aepsOtp: null,
    success:null,
    message:null,
    
  };
  
  const aepsReducer = (state = initialState, action) => {
    switch (action.type) {
     
     
      case AEPS_TERMS_CONDITION_OTP_SUCCESS:
        return {
          ...state,
          aepsOtp: action.payload,
          loading: false,
          error: null,
          success:action.payload.status,
          message:action.payload.message,
        }; 
   
  
      default:
        return state;
    }
  };
  
  export default aepsReducer;
  
  