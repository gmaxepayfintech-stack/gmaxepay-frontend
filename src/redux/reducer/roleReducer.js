import { ROLE_DEGRADE_COMPANY_USER_SUCCESS, ROLE_DEGRADE_COMPANY_USER_FAILURE, ROLE_DEGRADE_MASTER_DISTRIBUTOR_SUCCESS, ROLE_DEGRADE_MASTER_DISTRIBUTOR_FAILURE, ROLE_UPGRADE_COMPANY_USER_SUCCESS, ROLE_UPGRADE_COMPANY_USER_FAILURE, ROLE_UPGRADE_MASTER_DISTRIBUTOR_SUCCESS, ROLE_UPGRADE_MASTER_DISTRIBUTOR_FAILURE, ROLEDATA_COMPANY_USER_SUCCESS, ROLEDATA_COMPANY_USER_FAILURE, ROLEDATA_MASTER_DISTRIBUTOR_SUCCESS, ROLEDATA_MASTER_DISTRIBUTOR_FAILURE } from "../actionType/roleActionType";

const initialState = {
    isLoading: false,
    success: null,
    message: null,
    error: null,
    roleMD: null,
    roleDegMD: null,
    roleComp: null,
    roleDegComp: null,
    roleDataComp: null,
    roleDataMD: null,
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
                ...state,
                isLoading: false,
                success: action?.payload?.status,
                message: action?.payload?.message,
                error: null,
                roleDegMD: action?.payload
            }

        case ROLE_UPGRADE_COMPANY_USER_SUCCESS:
            return {
                ...state,
                isLoading: false,
                roleComp: action?.payload,
                message: action?.payload?.message,
                success: action?.payload?.status,
                error: null,
            }

        case ROLE_DEGRADE_COMPANY_USER_SUCCESS:
            return {
                ...state,
                isLoading: false,
                roleDegComp: action?.payload,
                message: action?.payload?.message,
                success: action?.payload?.status,
                error: null,
            }
        case ROLEDATA_COMPANY_USER_SUCCESS:
            return{
                ...state,
                isLoading: false,
                roleDataComp: action?.payload,
                message: action?.payload?.message,
                success: action?.payload?.status,
                error: null,
            }
        case ROLEDATA_MASTER_DISTRIBUTOR_SUCCESS:
            return{
                ...state,
                isLoading: false,
                roleDataMD: action?.payload,
                message: action?.payload?.message,
                success: action?.payload?.status,
                error: null,
            }

        case ROLE_UPGRADE_MASTER_DISTRIBUTOR_FAILURE:
            return {
                ...state,
                isLoading: false,
                error: action?.payload?.message || action?.payload,
                message: action?.payload?.message || action?.payload,
                success: null,
            }

        case ROLE_DEGRADE_MASTER_DISTRIBUTOR_FAILURE:
            return {
                ...state,
                isLoading: false,
                error: action?.payload?.message || action?.payload,
                message: action?.payload?.message || action?.payload,
                success: null,
            }

        case ROLE_UPGRADE_COMPANY_USER_FAILURE:
            return {
                ...state,
                isLoading: false,
                error: action?.payload?.message || action?.payload,
                message: action?.payload?.message || action?.payload,
                success: null,
            }

        case ROLE_DEGRADE_COMPANY_USER_FAILURE:
            return {
                ...state,
                isLoading: false,
                error: action?.payload?.message || action?.payload,
                message: action?.payload?.message || action?.payload,
                success: null,
            }

        case ROLEDATA_COMPANY_USER_FAILURE:
            return {
                ...state,
                isLoading: false,
                error: action?.payload?.message || action?.payload,
                message: action?.payload?.message || action?.payload,
                success: null,
            }

        case ROLEDATA_MASTER_DISTRIBUTOR_FAILURE:
            return {
                ...state,
                isLoading: false,
                error: action?.payload?.message || action?.payload,
                message: action?.payload?.message || action?.payload,
                success: null,
            }

        default:
            return state;
    }

}

export default roleReducer;
