import { ROLE_DEGRADE_COMPANY_USER_SUCCESS, ROLE_DEGRADE_MASTER_DISTRIBUTOR_SUCCESS, ROLE_UPGRADE_COMPANY_USER_SUCCESS, ROLE_UPGRADE_MASTER_DISTRIBUTOR_SUCCESS } from "../actionType/roleActionType";

const initialState = {
    isLoading: false,
    success: null,
    message: null,
    roleMD: null,
    roleDegMD: null,
    roleComp: null,
    roleDegComp: null,
}

const roleReducer = (state = initialState, action) => {
    switch (action.type) {
        case ROLE_UPGRADE_MASTER_DISTRIBUTOR_SUCCESS:
            return {
                isLoading: false,
                success: action?.payload?.status,
                message: action?.payload?.message,
                roleMD: action?.payload,
            }

        case ROLE_DEGRADE_MASTER_DISTRIBUTOR_SUCCESS:
            return {
                isLoading: fasle,
                success: action?.payload?.status,
                message: action?.payload?.message,
                roleDegMD: action?.payload
            }

        case ROLE_UPGRADE_COMPANY_USER_SUCCESS:
            return {
                isLoading: false,
                roleComp: action?.payload,
                message: action?.payload?.message,
                success: action?.payload?.status,
            }

        case ROLE_DEGRADE_COMPANY_USER_SUCCESS:
            return {
                isLoading: false,
                roleDegComp: action?.payload,
                message: action?.payload?.message,
                success: action?.payload?.status,
            }

        default:
            return state;
    }

}

export default roleReducer;
