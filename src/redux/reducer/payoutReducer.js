import { PAYOUT_BANK_LIST_SUCCESS } from "../actionType/payOutType";
const initialState = {
    loading: false,
    error: null,
    payoutBankList: null,
    message: null,
    success: null,
};

const payoutReducer = (state = initialState, action) => {
    switch (action.type) {
        case PAYOUT_BANK_LIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: action?.payload?.message || action?.payload,
                success: action?.payload?.status,
                payoutBankList: action?.payload,
                message: action?.payload?.message || action?.payload,
            }

        default:
            return state;
    }
};

export default payoutReducer;

