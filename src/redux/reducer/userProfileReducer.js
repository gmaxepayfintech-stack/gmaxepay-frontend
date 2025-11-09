import {
  GET_PROFILE_START,
  GET_PROFILE_SUCCESS,
  GET_PROFILE_FAILURE,
  GET_PROFILE_UNAUTHORIZED,
  CLEAR_PROFILE,
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

    case CLEAR_PROFILE:
      return {
        ...initialState,
      };

    default:
      return state;
  }
};

export default userProfileReducer;

