import { WALLET_ALS_SUCCESS, WALLET_ALS_FAILURE } from "../actionType/walletActionType";

const initialState = {
    loading: false,
    error: null,
    alsWallet: null,
    alsWalletError: null,
    success: null,
    message: null,
};

const walletReducer = (state = initialState, action) => {
    switch (action.type) {
        case WALLET_ALS_SUCCESS:
            return {
                ...state,
                alsWallet: action?.payload,
                alsWalletError: null,
                loading: false,
                error: null,
                success: action?.payload?.status,
                message: action?.payload?.message,
            };

        case WALLET_ALS_FAILURE:
            return {
                ...state,
                alsWallet: null,
                alsWalletError: action?.payload,
                loading: false,
                error: action?.payload?.message || action?.payload,
                success: null,
                message: action?.payload?.message || action?.payload,
            };

        default:
            return state;
    }
};

export default walletReducer;
