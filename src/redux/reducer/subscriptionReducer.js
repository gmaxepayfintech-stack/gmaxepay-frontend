import {
  SUBSCRIPTION_GET_LIST_START,
  SUBSCRIPTION_GET_LIST_SUCCESS,
  SUBSCRIPTION_GET_LIST_FAILURE,
  SUBSCRIPTION_UPGRADE_START,
  SUBSCRIPTION_UPGRADE_SUCCESS,
  SUBSCRIPTION_UPGRADE_FAILURE,
  SUBSCRIPTION_USER_UPGRADE_SUCCESS,
  SUBSCRIPTION_USER_UPGRADE_FAILURE,
} from '../actionType/subscriptionActionType';

const initialState = {
  loading: false,
  error: null,
  subscriptions: [],
  message: null,
  upgradeLoading: false,
  upgradeSuccess: false,
  upgradeError: null,
  upgradeMessage: null,
  userUpgradeMessage: null,
  userUpgradeSuccess: false,
  userUpgradeError: null,
};

const subscriptionReducer = (state = initialState, action) => {
  switch (action.type) {
    case SUBSCRIPTION_GET_LIST_START:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case SUBSCRIPTION_GET_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        subscriptions: action.payload?.data || [],
        message: action.payload?.message || null,
      };

    case SUBSCRIPTION_GET_LIST_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        subscriptions: [],
        message: null,
      };

    case SUBSCRIPTION_UPGRADE_START:
      return {
        ...state,
        upgradeLoading: true,
        upgradeError: null,
        upgradeSuccess: false,
        upgradeMessage: null,
      };

    case SUBSCRIPTION_UPGRADE_SUCCESS:
      return {
        ...state,
        upgradeLoading: false,
        upgradeError: null,
        upgradeSuccess: true,
        upgradeMessage: action.payload?.message || null,
      };

    case SUBSCRIPTION_UPGRADE_FAILURE:
      return {
        ...state,
        upgradeLoading: false,
        upgradeError: action.payload,
        upgradeSuccess: false,
        upgradeMessage: null,
      };

    case SUBSCRIPTION_USER_UPGRADE_SUCCESS:
      return {
        ...state,
        userUpgradeLoading: false,
        userUpgradeError: null,
        userUpgradeSuccess: true,
        userUpgradeMessage: action.payload?.message || null,
      };

    case SUBSCRIPTION_USER_UPGRADE_FAILURE:
      return {
        ...state,
        userUpgradeLoading: false,
        userUpgradeError: action.payload,
        userUpgradeSuccess: false,
        userUpgradeMessage: null,
      };
    default:
      return state;
  }
};

export default subscriptionReducer;
