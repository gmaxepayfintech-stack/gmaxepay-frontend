import api from '../../utils/axiosInstance';
import { API_ROUTE } from '../../data/env';
import secureLocalStorage from 'react-secure-storage';
import {
  SUBSCRIPTION_GET_LIST_START,
  SUBSCRIPTION_GET_LIST_SUCCESS,
  SUBSCRIPTION_GET_LIST_FAILURE,
  SUBSCRIPTION_UPGRADE_START,
  SUBSCRIPTION_UPGRADE_SUCCESS,
  SUBSCRIPTION_UPGRADE_FAILURE,
  SUBSCRIPTION_USER_UPGRADE_FAILURE,
  SUBSCRIPTION_USER_UPGRADE_SUCCESS,
  SUBSCRIPTION_USER_UPGRADE_START,
} from '../actionType/subscriptionActionType';
import { LOADING_START, LOADING_END } from '../actionType/loadingActionType';

const commonError = 'Something went wrong!';

// Get subscription list
export const getSubscriptionList = (companyId, query = {}, customSearch = {}, options = { page: 1, paginate: 10, sort: {} }) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: SUBSCRIPTION_GET_LIST_START });

  try {
    const token = secureLocalStorage.getItem('userToken');
    
    if (!token) {
      console.error('No token found');
      throw new Error('Authentication token not found');
    }

    if (!companyId) {
      console.error('No company ID provided');
      throw new Error('Company ID is required');
    }
    
    const payload = {
      query,
      customSearch,
      options,
    };

    const response = await api.post(
      `${API_ROUTE}/api/v1/company/subscription/list`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-company-id': companyId,
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = response?.data;
    const { status } = data ?? {};

    if (status === 'SUCCESS' || status === 200) {
      dispatch({
        type: SUBSCRIPTION_GET_LIST_SUCCESS,
        payload: {
          data: data?.data || [],
          status: data?.status,
          message: data?.message || 'Subscriptions retrieved successfully',
        },
      });
      dispatch({ type: LOADING_END });
      
      return {
        success: true,
        data: data?.data || [],
        message: data?.message || 'Subscriptions retrieved successfully',
      };
    } else {
      dispatch({
        type: SUBSCRIPTION_GET_LIST_FAILURE,
        payload: data?.message || commonError,
      });
      dispatch({ type: LOADING_END });
      return {
        success: false,
        message: data?.message || commonError,
      };
    }
  } catch (error) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      commonError;
    
    console.error('Subscription list fetch error:', errorMessage);
    
    dispatch({
      type: SUBSCRIPTION_GET_LIST_FAILURE,
      payload: errorMessage,
    });
    dispatch({ type: LOADING_END });
    
    return {
      success: false,
      message: errorMessage,
    };
  }
};

export const getUserSubscriptionList = (userId, query = {}, customSearch = {}, options = { page: 1, paginate: 10, sort: {} }) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: SUBSCRIPTION_GET_LIST_START });

  try {
    const token = secureLocalStorage.getItem('userToken');
    if (!token) {
      console.error('No token found');
      throw new Error('Authentication token not found');
    }
    if (!userId) {
      console.error('No user ID provided');
      throw new Error('User ID is required');
    }

    const payload = {
      query,
      customSearch,
      options,
    };
    const response = await api.post(`${API_ROUTE}/api/v1/user/subscription/list`, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const data = response?.data;
    const { status } = data ?? {};
    if (status === 'SUCCESS' || status === 200) {
      dispatch({
        type: SUBSCRIPTION_GET_LIST_SUCCESS,
        payload: {
          data: data?.data || [],
          status: data?.status,
          message: data?.message || 'User subscriptions retrieved successfully',
        },
      });
      dispatch({ type: LOADING_END });
      return {
        success: true,
        data: data?.data || [],
        message: data?.message || 'User subscriptions retrieved successfully',
      };
    } else {
      dispatch({
        type: SUBSCRIPTION_GET_LIST_FAILURE,
        payload: data?.message || commonError,
      });
      dispatch({ type: LOADING_END });
      return {
        success: false,
        message: data?.message || commonError,
      };
    }
  } catch (error) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      commonError;
    
    console.error('User subscription list fetch error:', errorMessage);
    
    dispatch({
      type: SUBSCRIPTION_GET_LIST_FAILURE,
      payload: errorMessage,
    });
    dispatch({ type: LOADING_END });
    return {
      success: false,
      message: errorMessage,
    };
  }
};

// Upgrade or Change Slab
export const upgradeOrChangeSlab = (slabId, companyId) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: SUBSCRIPTION_UPGRADE_START });

  try {
    const token = secureLocalStorage.getItem('userToken');
    
    if (!token) {
      console.error('No token found');
      throw new Error('Authentication token not found');
    }

    if (!slabId) {
      console.error('No slab ID provided');
      throw new Error('Slab ID is required');
    }

    if (!companyId) {
      console.error('No company ID provided');
      throw new Error('Company ID is required');
    }

    const response = await api.post(
      `${API_ROUTE}/api/v1/company/slabs/upradeORChangeSlab/${slabId}`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          'x-company-id': companyId,
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = response?.data;
    const { status } = data ?? {};

    if (status === 'SUCCESS' || status === 200) {
      dispatch({
        type: SUBSCRIPTION_UPGRADE_SUCCESS,
        payload: {
          status: data?.status,
          message: data?.message || 'Slab upgraded/changed successfully',
        },
      });
      dispatch({ type: LOADING_END });
      
      return {
        success: true,
        message: data?.message || 'Slab upgraded/changed successfully',
      };
    } else {
      dispatch({
        type: SUBSCRIPTION_UPGRADE_FAILURE,
        payload: data?.message || commonError,
      });
      dispatch({ type: LOADING_END });
      return {
        success: false,
        message: data?.message || commonError,
      };
    }
  } catch (error) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      commonError;
    
    console.error('Upgrade/Change slab error:', errorMessage);
    
    dispatch({
      type: SUBSCRIPTION_UPGRADE_FAILURE,
      payload: errorMessage,
    });
    dispatch({ type: LOADING_END });
    
    return {
      success: false,
      message: errorMessage,
    };
  }
};  

export const userUpgradeSubscription = (slabId, companyId) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: SUBSCRIPTION_USER_UPGRADE_START });

  try {
    const token = secureLocalStorage.getItem('userToken');
    
    if (!token) {
      console.error('No token found');
      throw new Error('Authentication token not found');
    }

    if (!slabId) {
      console.error('No slab ID provided');
      throw new Error('Slab ID is required');
    }

    if (!companyId) {
      console.error('No company ID provided');
      throw new Error('Company ID is required');
    }

    const response = await api.post(
      `${API_ROUTE}/api/v1/user/slab/upgradeOrChangeSlab/${slabId}`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          'x-company-id': companyId,
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = response?.data;
    const { status } = data ?? {};

    if (status === 'SUCCESS' || status === 200) {
      dispatch({
        type: SUBSCRIPTION_USER_UPGRADE_SUCCESS,
        payload: {
          status: data?.status,
          message: data?.message || 'Slab upgraded/changed successfully',
        },
      });
      dispatch({ type: LOADING_END });
      
      return {
        success: true,
        message: data?.message || 'Slab upgraded/changed successfully',
      };
    } else {
      dispatch({
        type: SUBSCRIPTION_USER_UPGRADE_FAILURE,
        payload: data?.message || commonError,
      });
      dispatch({ type: LOADING_END });
      return {
        success: false,
        message: data?.message || commonError,
      };
    }
  } catch (error) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      commonError;
    
    console.error('Upgrade/Change slab error:', errorMessage);
    
    dispatch({
      type: SUBSCRIPTION_UPGRADE_FAILURE,
      payload: errorMessage,
    });
    dispatch({ type: LOADING_END });
    
    return {
      success: false,
      message: errorMessage,
    };
  }
}; 



