import { COMPANY_PAYOUT_BANK_LIST_SUCCESS, PAYOUT_BANK_LIST_SUCCESS, PAYOUT_TRANSACTION_SUCCESS } from "../actionType/payOutType";
const initialState = {
    loading: false,
    error: null,
    payoutBankList: null,
    message: null,
    success: null,
    payoutTransaction:null,
    payoutBankList: null,
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
        case PAYOUT_TRANSACTION_SUCCESS:
            return{
                ...state,
                error:action?.payload?.error,
                payoutTransaction: action?.payload,
                status: action?.payload?.status,
                message: action?.payload?.message,
            }
        case COMPANY_PAYOUT_BANK_LIST_SUCCESS:
            return{
                ...state,
                error: action?.payload?.error,
                payoutBankList: action?.payload,
                status: action?.payload?.status,
                message: action?.payload?.message,
            }

        default:
            return state;
    }
};

export default payoutReducer;

