import {
  SLAB_CREATE_START,
  SLAB_CREATE_SUCCESS,
  SLAB_CREATE_FAILURE,
  SLAB_UPDATE_START,
  SLAB_UPDATE_SUCCESS,
  SLAB_UPDATE_FAILURE,
  SLAB_GET_LIST_START,
  SLAB_GET_LIST_SUCCESS,
  SLAB_GET_LIST_FAILURE,
  SLAB_GET_COMM_SUCCESS,
  SLAB_GET_COMM_FAILURE,
  SLAB_UPDATE_COMM_START,
  SLAB_UPDATE_COMM_SUCCESS,
  SLAB_UPDATE_COMM_FAILURE,
  SLAB_ASSIGN_START,
  SLAB_ASSIGN_SUCCESS,
  SLAB_ASSIGN_FAILURE,
  SLAB_GET_VISIBILITY_START,
  SLAB_GET_VISIBILITY_SUCCESS,
  SLAB_GET_VISIBILITY_FAILURE,
  SLAB_GET_USERLIST_SUCCESS,
  SLAB_GET_USERLIST_START,
  SLAB_GET_USERLIST_FAILURE,
} from '../actionType/slabActionType';

const initialState = {
  loading: false,
  error: null,
  slabs: [],
  total: 0,
  paginator: {
    itemCount: 0,
    perPage: 6,
    pageCount: 1,
    currentPage: 1,
  },
  createSlabSuccess: false,
  createSlabError: null,
  createSlabMessage: null,
  updateSlabSuccess: false,
  updateSlabError: null,
  updateSlabMessage: null,
  // Slab commission list state
  commError: null,
  commData: [],
  commTotal: 0,
  // Single commission update state
  updateCommLoading: false,
  updateCommError: null,
  updateCommSuccess: false,
  // Assign slab state
  assignSlabLoading: false,
  assignSlabError: null,
  assignSlabSuccess: false,
  assignSlabMessage: null,
  // Slab visibility state
  visibilityLoading: false,
  visibilityError: null,
  visibilityData: [],
  visibilitySuccess: false,
  // User slab list state (for getMDSlabList)
  userList: [],
  userListTotal: 0,
  userListPaginator: {
    itemCount: 0,
    perPage: 6,
    pageCount: 1,
    currentPage: 1,
  },
};

const slabReducer = (state = initialState, action) => {
  switch (action.type) {
    case SLAB_CREATE_START:
      return {
        ...state,
        loading: true,
        createSlabSuccess: false,
        createSlabError: null,
        createSlabMessage: null,
      };

    case SLAB_CREATE_SUCCESS:
      return {
        ...state,
        loading: false,
        createSlabSuccess: true,
        createSlabError: null,
        createSlabMessage: action.payload?.message || 'Slab created successfully',
      };

    case SLAB_CREATE_FAILURE:
      return {
        ...state,
        loading: false,
        createSlabSuccess: false,
        createSlabError: action.payload,
        createSlabMessage: null,
      };

    case SLAB_UPDATE_START:
      return {
        ...state,
        loading: true,
        updateSlabSuccess: false,
        updateSlabError: null,
        updateSlabMessage: null,
      };

    case SLAB_UPDATE_SUCCESS:
      return {
        ...state,
        loading: false,
        updateSlabSuccess: true,
        updateSlabError: null,
        updateSlabMessage: action.payload?.message || 'Slab updated successfully',
      };

    case SLAB_UPDATE_FAILURE:
      return {
        ...state,
        loading: false,
        updateSlabSuccess: false,
        updateSlabError: action.payload,
        updateSlabMessage: null,
      };

    case SLAB_GET_LIST_START:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case SLAB_GET_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        slabs: action.payload?.data || [],
        total: action.payload?.total || 0,
        paginator: action.payload?.paginator || {
          itemCount: 0,
          perPage: 6,
          pageCount: 1,
          currentPage: 1,
        },
      };

    case SLAB_GET_LIST_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        slabs: [],
        total: 0,
      };

    case SLAB_GET_COMM_SUCCESS:
      return {
        ...state,
        commError: null,
        commData: action.payload?.data || [],
        commTotal: action.payload?.total || 0,
      };

    case SLAB_GET_COMM_FAILURE:
      return {
        ...state,
        commError: action.payload,
        commData: [],
        commTotal: 0,
      };

    case SLAB_UPDATE_COMM_START:
      return {
        ...state,
        updateCommLoading: true,
        updateCommError: null,
        updateCommSuccess: false,
      };

    case SLAB_UPDATE_COMM_SUCCESS:
      return {
        ...state,
        updateCommLoading: false,
        updateCommError: null,
        updateCommSuccess: true,
      };

    case SLAB_UPDATE_COMM_FAILURE:
      return {
        ...state,
        updateCommLoading: false,
        updateCommError: action.payload,
        updateCommSuccess: false,
      };

    case SLAB_ASSIGN_START:
      return {
        ...state,
        assignSlabLoading: true,
        assignSlabError: null,
        assignSlabSuccess: false,
        assignSlabMessage: null,
      };

    case SLAB_ASSIGN_SUCCESS:
      return {
        ...state,
        assignSlabLoading: false,
        assignSlabError: null,
        assignSlabSuccess: true,
        assignSlabMessage: action.payload?.message || 'Slab assigned successfully',
      };

    case SLAB_ASSIGN_FAILURE:
      return {
        ...state,
        assignSlabLoading: false,
        assignSlabError: action.payload,
        assignSlabSuccess: false,
        assignSlabMessage: null,
      };

    case SLAB_GET_VISIBILITY_START:
      return {
        ...state,
        visibilityLoading: true,
        visibilityError: null,
        visibilitySuccess: false,
        visibilityData: [],
      };

    case SLAB_GET_VISIBILITY_SUCCESS:
      return {
        ...state,
        visibilityLoading: false,
        visibilityError: null,
        visibilitySuccess: true,
        visibilityData: action.payload?.data || [],
      };

    case SLAB_GET_VISIBILITY_FAILURE:
      return {
        ...state,
        visibilityLoading: false,
        visibilityError: action.payload,
        visibilitySuccess: false,
        visibilityData: [],
      };

    case SLAB_GET_USERLIST_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        userList: action.payload?.data || [],
        userListTotal: action.payload?.total || 0,
        userListPaginator: action.payload?.paginator || {
          itemCount: 0,
          perPage: 6,
          pageCount: 1,
          currentPage: 1,
        }
      }

    case SLAB_GET_USERLIST_START:
      return {
        ...state,
        assignSlabLoading: true,
        assignSlabError: null,
        assignSlabSuccess: false,
        assignSlabMessage: null,
      }
    case SLAB_GET_USERLIST_FAILURE:
      return{
        ...state,
        assignSlabLoading: false,
        assignSlabError: action.payload,
        assignSlabSuccess: false,
        assignSlabMessage: null,
      }
    default:
      return state;
  }
};

export default slabReducer;
