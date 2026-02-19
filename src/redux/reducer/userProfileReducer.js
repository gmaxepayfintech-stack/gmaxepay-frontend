import {
  GET_PROFILE_START,
  GET_PROFILE_SUCCESS,
  GET_PROFILE_FAILURE,
  GET_PROFILE_UNAUTHORIZED,
  CLEAR_PROFILE,
  ADMIN_ROLES_PERMISSION_SUCCESS,
  UPDATE_ROLES_PERMISSION_SUCESS,
  ADD_BANK_DETAILS_SUCCESS,
  ADD_BANK_COMPANY_SUCCESS,
  ADD_BANK_ADMIN_SUCCESS,
  GET_ADMIN_DETAILS_SUCCESS,
  GET_ADMIN_PROFILE_SUCCESS,
  DELETE_BANK_USER_SUCCESS,
  DELETE_BANK_USER_FAILURE,
  DELETE_BANK_COMPANY_SUCCESS,
  DELETE_BANK_COMPANY_FAILURE,
  DELETE_BANK_ADMIN_SUCCESS,
  DELETE_BANK_ADMIN_FAILURE,
  SET_SELECTED_USER_ROLE,
  UPDATE_BANK_USER_SUCCESS,
} from "../actionType/userProfileActionType";

const initialState = {
  loading: false,
  error: null,
  unauthorized: false,
  profile: null,
  userId: null,
  mobileNo: null,
  email: null,
  name: null,
  profileImage: null,
  success: null,
  message: null,
  adminRolesPermission: null,
  updateRoles: null,
  bankDetailsResponse: null,
  bankCompanyResponse: null,
  bankAdminResponse: null,
  adminDetailsResponse: null,
  adminProfileResponse: null,
  selectedUserRole: null,
  bankUpdateResponse: null,
};

const userProfileReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_PROFILE_START:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case GET_PROFILE_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        profile: action.payload,
        userId: action.payload?.userId || null,
        mobileNo: action.payload?.mobileNo || null,
        email: action.payload?.email || null,
        name:
          action.payload?.name ||
          action.payload?.userName ||
          action.payload?.fullName ||
          null,
        profileImage: action.payload?.profileImage || null,
      };

    case GET_PROFILE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        unauthorized: false,
        profile: null,
      };

    case GET_PROFILE_UNAUTHORIZED:
      return {
        ...state,
        loading: false,
        error: action.payload,
        unauthorized: true,
        profile: null,
        userId: null,
        mobileNo: null,
        email: null,
        name: null,
        profileImage: null,
      };

    case ADMIN_ROLES_PERMISSION_SUCCESS:
      return {
        ...state,
        adminRolesPermission: action.payload,
        loading: false,
        error: null,
        success: action.payload.status,
        message: action.payload.message,
      };

    case UPDATE_ROLES_PERMISSION_SUCESS:
      return {
        ...state,
        updateRoles: action.payload,
        success: action.payload.status,
        message: action.payload.message,
      };

    case CLEAR_PROFILE:
      return {
        ...initialState,
      };
    case ADD_BANK_DETAILS_SUCCESS:
      return {
        ...state,
        loading: false,
        success: action?.payload?.status,
        message: action?.payload?.message,
        bankDetailsResponse: action?.payload,
        error: null,
      };
    case ADD_BANK_COMPANY_SUCCESS:
      return {
        ...state,
        loading: false,
        success: action?.payload?.status,
        message: action?.payload?.message,
        error: null,
        bankCompanyResponse: action?.payload,
      };
    case ADD_BANK_ADMIN_SUCCESS:
      return {
        ...state,
        loading: fasle,
        success: action?.payload?.status,
        message: action?.payload?.message,
        error: null,
        bankAdminResponse: action?.payload,
      };
    // COMPANY BANK DELETE
    case DELETE_BANK_COMPANY_SUCCESS:
      return {
        ...state,
        adminProfileResponse: {
          ...state.adminProfileResponse,
          bankDetails: state.adminProfileResponse?.bankDetails?.filter(
            (bank) => bank.id !== action.payload,
          ),
        },
        error: null,
        success: true,
      };

    case DELETE_BANK_COMPANY_FAILURE:
      return {
        ...state,
        error: action.payload,
      };
    // USER BANK DELETE
    case DELETE_BANK_USER_SUCCESS:
      return {
        ...state,
        profile: {
          ...state.profile,
          bankDetails: state.profile?.bankDetails?.filter(
            (bank) => bank.id !== action.payload,
          ),
        },
        error: null,
        success: true,
      };

    case DELETE_BANK_USER_FAILURE:
      return {
        ...state,
        error: action.payload,
      };
    // ADMIN BANK DELETE
    case DELETE_BANK_ADMIN_SUCCESS:
      return {
        ...state,
        adminProfileResponse: {
          ...state.adminProfileResponse,
          bankDetails: state.adminProfileResponse?.bankDetails?.filter(
            (bank) => bank.id !== action.payload,
          ),
        },
        error: null,
        success: true,
      };

    case DELETE_BANK_ADMIN_FAILURE:
      return {
        ...state,
        error: action.payload,
      };

    case GET_ADMIN_DETAILS_SUCCESS:
      return {
        ...state,
        loading: false,
        success: action?.payload?.status,
        message: action?.payload?.message,
        error: null,
        adminDetailsResponse: action?.payload,
      };
    case GET_ADMIN_PROFILE_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        success: action?.payload?.status,
        message: action?.payload?.message,
        adminProfileResponse: action?.payload,
      };
    case SET_SELECTED_USER_ROLE:
      return {
        ...state,
        selectedUserRole: action.payload ?? null,
      };
      case UPDATE_BANK_USER_SUCCESS:
        return{
          ...state,
          loading: false,
          success: action?.payload?.status,
          message: action?.payload?.message,
          error: null,
          bankUpdateResponse: action?.payload,
        }
    default:
      return state;
  }
};

export default userProfileReducer;
