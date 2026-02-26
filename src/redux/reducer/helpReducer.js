import { HELP_CONTACT_SUPPORT_SUCCESS } from "../actionType/helpActionType";

const initialState = {
    loading: false,
    error: null,
    message: null,
    success: null,
    helpinfo: null,
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
        default:
            return state;
    }
};

export default helpReducer;
