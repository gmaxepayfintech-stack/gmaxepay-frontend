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
  SET_SELECTED_USER_ROLE,
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
        name: action.payload?.name || action.payload?.userName || action.payload?.fullName || null,
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
      }
    case ADD_BANK_COMPANY_SUCCESS:
      return {
        ...state,
        loading: false,
        success: action?.payload?.status,
        message: action?.payload?.message,
        error: null,
        bankCompanyResponse: action?.payload,
      }
    case ADD_BANK_ADMIN_SUCCESS:
      return {
        ...state,
        loading: fasle,
        success: action?.payload?.status,
        message: action?.payload?.message,
        error: null,
        bankAdminResponse: action?.payload,
      }
    case GET_ADMIN_DETAILS_SUCCESS:
      return {
        ...state,
        loading: false,
        success: action?.payload?.status,
        message: action?.payload?.message,
        error: null,
        adminDetailsResponse: action?.payload,
      }
      case GET_ADMIN_PROFILE_SUCCESS:
        return{
          ...state,
          loading: false,
          error: null,
          success: action?.payload?.status,
          message: action?.payload?.message,
          adminProfileResponse: action?.payload,
        }
    case SET_SELECTED_USER_ROLE:
      return {
        ...state,
        selectedUserRole: action.payload ?? null,
      };
    default:
      return state;
  }
};

export default userProfileReducer;

