import { ADD_SUPPORT_EMAIL_SUCCESS, ADD_SUPPORT_PHONE_SUCCESS, HELP_CONTACT_SUPPORT_SUCCESS, REMOVE_CONTACT_NUMBER_SUCCESS } from "../actionType/helpActionType";

const initialState = {
    loading: false,
    error: null,
    message: null,
    success: null,
    helpinfo: null,
    deleteContactInfo: null,
    addContactInfo: null,
    addEmailInfo: null,

};

const helpReducer = (state = initialState, action) => {
    switch (action.type) {
        case HELP_CONTACT_SUPPORT_SUCCESS:
            return {
                ...state,
                error: false,
                loading: false,
                success: action?.payload?.status,
                message: action?.payload?.message,
                helpinfo: action?.payload,
            }
        case REMOVE_CONTACT_NUMBER_SUCCESS:
            return{
                ...state,
                error: false,
                loading: false,
                success: action?.payload?.status,
                message: action?.payload?.message,
                deleteContactInfo: action?.payload,
            }

            case ADD_SUPPORT_PHONE_SUCCESS:
                return{
                    ...state,
                    error: false,
                    loading: false,
                    success: action?.payload?.status,
                    message: action?.payload?.message,
                    addContactInfo: action?.payload,
                }
            case ADD_SUPPORT_EMAIL_SUCCESS:
                return{
                    ...state,
                    error: false,
                    loading: false,
                    success: action?.payload?.status,
                    message: action?.payload?.message,
                    addEmailInfo: action?.payload,
                }
        default:
            return state;
    }
};

export default helpReducer;
