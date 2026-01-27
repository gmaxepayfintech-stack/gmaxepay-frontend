import api from '../../utils/axiosInstance';
import { API_ROUTE } from '../../data/env';
import secureLocalStorage from 'react-secure-storage';
import {
  BBPS_GET_ALL_CATEGORIES_START,
  BBPS_GET_ALL_CATEGORIES_SUCCESS,
  BBPS_GET_ALL_CATEGORIES_FAILURE,
  BBPS_CREATE_CATEGORY_START,
  BBPS_CREATE_CATEGORY_SUCCESS,
  BBPS_CREATE_CATEGORY_FAILURE,
  BBPS_UPDATE_CATEGORY_START,
  BBPS_UPDATE_CATEGORY_SUCCESS,
  BBPS_UPDATE_CATEGORY_FAILURE,
  BBPS_SEARCH_CATEGORIES_START,
  BBPS_SEARCH_CATEGORIES_SUCCESS,
  BBPS_SEARCH_CATEGORIES_FAILURE,
  BBPS_GET_ALL_BILLERS_START,
  BBPS_GET_ALL_BILLERS_SUCCESS,
  BBPS_GET_ALL_BILLERS_FAILURE,
  BBPS_SEARCH_BILLERS_START,
  BBPS_SEARCH_BILLERS_SUCCESS,
  BBPS_SEARCH_BILLERS_FAILURE,
  BBPS_GET_CATEGORIES_FOR_DROPDOWN_START,
  BBPS_GET_CATEGORIES_FOR_DROPDOWN_SUCCESS,
  BBPS_GET_CATEGORIES_FOR_DROPDOWN_FAILURE,
  BBPS_GET_ALL_PAYMENT_INFO_START,
  BBPS_GET_ALL_PAYMENT_INFO_SUCCESS,
  BBPS_GET_ALL_PAYMENT_INFO_FAILURE,
  BBPS_SEARCH_PAYMENT_INFO_START,
  BBPS_SEARCH_PAYMENT_INFO_SUCCESS,
  BBPS_SEARCH_PAYMENT_INFO_FAILURE,
  BBPS_CREATE_PAYMENT_INFO_START,
  BBPS_CREATE_PAYMENT_INFO_SUCCESS,
  BBPS_CREATE_PAYMENT_INFO_FAILURE,
  BBPS_UPDATE_PAYMENT_INFO_START,
  BBPS_UPDATE_PAYMENT_INFO_SUCCESS,
  BBPS_UPDATE_PAYMENT_INFO_FAILURE,
  BBPS_CREATE_BILLER_START,
  BBPS_CREATE_BILLER_SUCCESS,
  BBPS_CREATE_BILLER_FAILURE,
  BBPS_UPDATE_BILLER_START,
  BBPS_UPDATE_BILLER_SUCCESS,
  BBPS_UPDATE_BILLER_FAILURE,
  BBPS_USER_GET_ALL_CATEGORIES_START,
  BBPS_USER_GET_ALL_CATEGORIES_SUCCESS,
  BBPS_USER_GET_ALL_CATEGORIES_FAILURE,
  BBPS_USER_GET_BILLERS_BY_CATEGORY_START,
  BBPS_USER_GET_BILLERS_BY_CATEGORY_SUCCESS,
  BBPS_USER_GET_BILLERS_BY_CATEGORY_FAILURE,
  BBPS_USER_GET_BILLER_INFO_START,
  BBPS_USER_GET_BILLER_INFO_SUCCESS,
  BBPS_USER_GET_BILLER_INFO_FAILURE,
  BBPS_USER_FETCH_BILL_START,
  BBPS_USER_FETCH_BILL_SUCCESS,
  BBPS_USER_FETCH_BILL_FAILURE,
  BBPS_USER_PAY_BILL_START,
  BBPS_USER_PAY_BILL_SUCCESS,
  BBPS_USER_PAY_BILL_FAILURE,
} from '../actionType/bbpsActionType';
import { LOADING_START, LOADING_END } from '../actionType/loadingActionType';

const commonError = 'Something went wrong!';

// Get all categories
export const getAllBBPSCategories = (companyId, page = 1, paginate = 6) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: BBPS_GET_ALL_CATEGORIES_START });

  try {
    const token = secureLocalStorage.getItem('userToken');
    const payload = {
      query: {},
      customSearch: {},
      options: {
        page,
        paginate,
        sort: { createdAt: -1 },
      },
    };

    const response = await api.post(
      `${API_ROUTE}/api/v1/admin/bbps/categories/all`,
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
        type: BBPS_GET_ALL_CATEGORIES_SUCCESS,
        payload: {
          data: data?.data || [],
          total: data?.total || 0,
          currentPage: data?.paginator?.currentPage || page,
          totalPages: data?.paginator?.pageCount || 1,
        },
      });
    } else {
      const errorMessage = data?.message || commonError;
      dispatch({
        type: BBPS_GET_ALL_CATEGORIES_FAILURE,
        payload: errorMessage,
      });
    }
  } catch (error) {
    const errorMessage =
      error?.response?.data?.message || error?.message || commonError;
    dispatch({
      type: BBPS_GET_ALL_CATEGORIES_FAILURE,
      payload: errorMessage,
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// Search categories
export const searchBBPSCategories = (companyId, searchQuery, page = 1, paginate = 6) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: BBPS_SEARCH_CATEGORIES_START });

  try {
    const token = secureLocalStorage.getItem('userToken');
    const payload = {
      query: {},
      customSearch: searchQuery ? { name: searchQuery } : {},
      options: {
        page,
        paginate,
        sort: { createdAt: -1 },
      },
    };

    const response = await api.post(
      `${API_ROUTE}/api/v1/admin/bbps/categories/all`,
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
        type: BBPS_SEARCH_CATEGORIES_SUCCESS,
        payload: {
          data: data?.data || [],
          total: data?.total || 0,
          currentPage: data?.paginator?.currentPage || page,
          totalPages: data?.paginator?.pageCount || 1,
        },
      });
    } else {
      const errorMessage = data?.message || commonError;
      dispatch({
        type: BBPS_SEARCH_CATEGORIES_FAILURE,
        payload: errorMessage,
      });
    }
  } catch (error) {
    const errorMessage =
      error?.response?.data?.message || error?.message || commonError;
    dispatch({
      type: BBPS_SEARCH_CATEGORIES_FAILURE,
      payload: errorMessage,
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// Create category
export const createBBPSCategory = (companyId, categoryData) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: BBPS_CREATE_CATEGORY_START });

  try {
    const token = secureLocalStorage.getItem('userToken');
    const payload = {
      name: categoryData.category,
      custConvFee: parseFloat(categoryData.convFee) || 0,
      flatFee: parseFloat(categoryData.flatFee) || 0,
      percentFee: parseFloat(categoryData.percentFee) || 0,
      gstRate: parseFloat(categoryData.gstRate) || 0,
      isCCF1Category: categoryData.ccfi || false,
    };

    const response = await api.post(
      `${API_ROUTE}/api/v1/admin/bbps/categories`,
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
        type: BBPS_CREATE_CATEGORY_SUCCESS,
        payload: data,
      });
      // Refresh categories list after successful creation
      dispatch(getAllBBPSCategories(companyId));
    } else {
      const errorMessage = data?.message || commonError;
      dispatch({
        type: BBPS_CREATE_CATEGORY_FAILURE,
        payload: errorMessage,
      });
    }
  } catch (error) {
    const errorMessage =
      error?.response?.data?.message || error?.message || commonError;
    dispatch({
      type: BBPS_CREATE_CATEGORY_FAILURE,
      payload: errorMessage,
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// Update category
export const updateBBPSCategory = (companyId, categoryId, categoryData) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: BBPS_UPDATE_CATEGORY_START });

  try {
    const token = secureLocalStorage.getItem('userToken');
    const payload = {
      name: categoryData.category,
      isActive: categoryData.active !== undefined ? categoryData.active : true,
      custConvFee: parseFloat(categoryData.convFee) || 0,
      flatFee: parseFloat(categoryData.flatFee) || 0,
      isCCF1Category: categoryData.ccfi || false,
      percentFee: parseFloat(categoryData.percentFee) || 0,
      gstRate: parseFloat(categoryData.gstRate) || 0,
      isDeleted: categoryData.deleted !== undefined ? categoryData.deleted : false,
    };

    const response = await api.put(
      `${API_ROUTE}/api/v1/admin/bbps/categories/${categoryId}`,
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
        type: BBPS_UPDATE_CATEGORY_SUCCESS,
        payload: data,
      });
    } else {
      const errorMessage = data?.message || commonError;
      dispatch({
        type: BBPS_UPDATE_CATEGORY_FAILURE,
        payload: errorMessage,
      });
    }
  } catch (error) {
    const errorMessage =
      error?.response?.data?.message || error?.message || commonError;
    dispatch({
      type: BBPS_UPDATE_CATEGORY_FAILURE,
      payload: errorMessage,
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// Get categories for dropdown (used in BillerSettings)
export const getCategoriesForDropdown = (companyId) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: BBPS_GET_CATEGORIES_FOR_DROPDOWN_START });

  try {
    const token = secureLocalStorage.getItem('userToken');
    const payload = {
      query: {},
      customSearch: {},
      options: {
        page: 1,
        paginate: 100, // Get all categories for dropdown
        sort: { createdAt: -1 },
      },
    };

    const response = await api.post(
      `${API_ROUTE}/api/v1/admin/bbps/categories/all`,
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
        type: BBPS_GET_CATEGORIES_FOR_DROPDOWN_SUCCESS,
        payload: Array.isArray(data?.data) ? data.data : [],
      });
    } else {
      const errorMessage = data?.message || commonError;
      dispatch({
        type: BBPS_GET_CATEGORIES_FOR_DROPDOWN_FAILURE,
        payload: errorMessage,
      });
    }
  } catch (error) {
    const errorMessage =
      error?.response?.data?.message || error?.message || commonError;
    dispatch({
      type: BBPS_GET_CATEGORIES_FOR_DROPDOWN_FAILURE,
      payload: errorMessage,
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// Get all billers (operators)
export const getAllBBPSBillers = (companyId, categoryName = null, page = 1, paginate = 6) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: BBPS_GET_ALL_BILLERS_START });

  try {
    const token = secureLocalStorage.getItem('userToken');
    const payload = {
      query: categoryName ? { operatorService: categoryName } : {},
      customSearch: {},
      options: {
        page,
        paginate,
        sort: { createdAt: -1 },
      },
    };

    const response = await api.post(
      `${API_ROUTE}/api/v1/admin/bbps/operators/list`,
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
        type: BBPS_GET_ALL_BILLERS_SUCCESS,
        payload: {
          data: data?.data || [],
          total: data?.total || 0,
          currentPage: data?.paginator?.currentPage || page,
          totalPages: data?.paginator?.pageCount || 1,
        },
      });
    } else {
      const errorMessage = data?.message || commonError;
      dispatch({
        type: BBPS_GET_ALL_BILLERS_FAILURE,
        payload: errorMessage,
      });
    }
  } catch (error) {
    const errorMessage =
      error?.response?.data?.message || error?.message || commonError;
    dispatch({
      type: BBPS_GET_ALL_BILLERS_FAILURE,
      payload: errorMessage,
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// Search billers
export const searchBBPSBillers = (companyId, searchQuery, categoryName = null, page = 1, paginate = 6) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: BBPS_SEARCH_BILLERS_START });

  try {
    const token = secureLocalStorage.getItem('userToken');
    const payload = {
      query: categoryName ? { operatorService: categoryName } : {},
      customSearch: searchQuery ? { name: searchQuery } : {},
      options: {
        page,
        paginate,
        sort: { createdAt: -1 },
      },
    };

    const response = await api.post(
      `${API_ROUTE}/api/v1/admin/bbps/operators/list`,
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
        type: BBPS_SEARCH_BILLERS_SUCCESS,
        payload: {
          data: data?.data || [],
          total: data?.total || 0,
          currentPage: data?.paginator?.currentPage || page,
          totalPages: data?.paginator?.pageCount || 1,
        },
      });
    } else {
      const errorMessage = data?.message || commonError;
      dispatch({
        type: BBPS_SEARCH_BILLERS_FAILURE,
        payload: errorMessage,
      });
    }
  } catch (error) {
    const errorMessage =
      error?.response?.data?.message || error?.message || commonError;
    dispatch({
      type: BBPS_SEARCH_BILLERS_FAILURE,
      payload: errorMessage,
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// Get all payment info
export const getAllBBPSPaymentInfo = (companyId, page = 1, paginate = 6) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: BBPS_GET_ALL_PAYMENT_INFO_START });

  try {
    const token = secureLocalStorage.getItem('userToken');
    const payload = {
      query: {},
      customSearch: {},
      options: {
        page,
        paginate,
        sort: { createdAt: -1 },
      },
    };

    const response = await api.post(
      `${API_ROUTE}/api/v1/admin/bbps/payment-info/all`,
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
        type: BBPS_GET_ALL_PAYMENT_INFO_SUCCESS,
        payload: {
          data: data?.data || [],
          total: data?.total || 0,
          currentPage: data?.paginator?.currentPage || page,
          totalPages: data?.paginator?.pageCount || 1,
        },
      });
    } else {
      const errorMessage = data?.message || commonError;
      dispatch({
        type: BBPS_GET_ALL_PAYMENT_INFO_FAILURE,
        payload: errorMessage,
      });
    }
  } catch (error) {
    const errorMessage =
      error?.response?.data?.message || error?.message || commonError;
    dispatch({
      type: BBPS_GET_ALL_PAYMENT_INFO_FAILURE,
      payload: errorMessage,
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// Search payment info by initiatingChannel
export const searchBBPSPaymentInfo = (companyId, initiatingChannel, page = 1, paginate = 6) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: BBPS_SEARCH_PAYMENT_INFO_START });

  try {
    const token = secureLocalStorage.getItem('userToken');
    const payload = {
      query: {},
      customSearch: initiatingChannel ? { initiatingChannel } : {},
      options: {
        page,
        paginate,
        sort: { createdAt: -1 },
      },
    };

    const response = await api.post(
      `${API_ROUTE}/api/v1/admin/bbps/payment-info/all`,
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
        type: BBPS_SEARCH_PAYMENT_INFO_SUCCESS,
        payload: {
          data: data?.data || [],
          total: data?.total || 0,
          currentPage: data?.paginator?.currentPage || page,
          totalPages: data?.paginator?.pageCount || 1,
        },
      });
    } else {
      const errorMessage = data?.message || commonError;
      dispatch({
        type: BBPS_SEARCH_PAYMENT_INFO_FAILURE,
        payload: errorMessage,
      });
    }
  } catch (error) {
    const errorMessage =
      error?.response?.data?.message || error?.message || commonError;
    dispatch({
      type: BBPS_SEARCH_PAYMENT_INFO_FAILURE,
      payload: errorMessage,
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// Create payment info
export const createBBPSPaymentInfo = (companyId, paymentData) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: BBPS_CREATE_PAYMENT_INFO_START });

  try {
    const token = secureLocalStorage.getItem('userToken');
    
    // Parse JSON strings if they are strings, otherwise use as is
    let paymentMethod = paymentData.paymentMethod;
    let paymentInfo = paymentData.paymentInfo;
    
    if (typeof paymentMethod === 'string') {
      try {
        paymentMethod = JSON.parse(paymentMethod);
      } catch (e) {
        // If parsing fails, use as string
      }
    }
    
    if (typeof paymentInfo === 'string') {
      try {
        paymentInfo = JSON.parse(paymentInfo);
      } catch (e) {
        // If parsing fails, use as string
      }
    }

    const payload = {
      initiatingChannel: paymentData.initiatingChannel || paymentData.initChannel,
      paymentMethod: paymentMethod,
      paymentInfo: paymentInfo,
    };

    const response = await api.post(
      `${API_ROUTE}/api/v1/admin/bbps/payment-info`,
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
        type: BBPS_CREATE_PAYMENT_INFO_SUCCESS,
        payload: data,
      });
    } else {
      const errorMessage = data?.message || commonError;
      dispatch({
        type: BBPS_CREATE_PAYMENT_INFO_FAILURE,
        payload: errorMessage,
      });
    }
  } catch (error) {
    const errorMessage =
      error?.response?.data?.message || error?.message || commonError;
    dispatch({
      type: BBPS_CREATE_PAYMENT_INFO_FAILURE,
      payload: errorMessage,
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// Update payment info
export const updateBBPSPaymentInfo = (companyId, paymentInfoId, paymentData) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: BBPS_UPDATE_PAYMENT_INFO_START });

  try {
    const token = secureLocalStorage.getItem('userToken');
    
    // Parse JSON strings if they are strings, otherwise use as is
    let paymentMethod = paymentData.paymentMethod;
    let paymentInfo = paymentData.paymentInfo;
    
    if (typeof paymentMethod === 'string') {
      try {
        paymentMethod = JSON.parse(paymentMethod);
      } catch (e) {
        // If parsing fails, use as string
      }
    }
    
    if (typeof paymentInfo === 'string') {
      try {
        paymentInfo = JSON.parse(paymentInfo);
      } catch (e) {
        // If parsing fails, use as string
      }
    }

    const payload = {
      initiatingChannel: paymentData.initiatingChannel || paymentData.initChannel,
      paymentMethod: paymentMethod,
      paymentInfo: paymentInfo,
    };

    const response = await api.put(
      `${API_ROUTE}/api/v1/admin/bbps/payment-info/${paymentInfoId}`,
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
        type: BBPS_UPDATE_PAYMENT_INFO_SUCCESS,
        payload: data,
      });
    } else {
      const errorMessage = data?.message || commonError;
      dispatch({
        type: BBPS_UPDATE_PAYMENT_INFO_FAILURE,
        payload: errorMessage,
      });
    }
  } catch (error) {
    const errorMessage =
      error?.response?.data?.message || error?.message || commonError;
    dispatch({
      type: BBPS_UPDATE_PAYMENT_INFO_FAILURE,
      payload: errorMessage,
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// Create biller/operator
export const createBBPSBiller = (companyId, billerData) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: BBPS_CREATE_BILLER_START });

  try {
    const token = secureLocalStorage.getItem('userToken');
    
    // Find category ID by name
    const categoryId = billerData.categoryId || null;
    
    const payload = {
      name: billerData.name || billerData.billerName,
      billerId: billerData.billerId,
      categoryId: categoryId,
      initiatingChannel: billerData.initiatingChannel || billerData.initChannel,
    };

    const response = await api.post(
      `${API_ROUTE}/api/v1/admin/bbps/operators`,
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
        type: BBPS_CREATE_BILLER_SUCCESS,
        payload: data,
      });
    } else {
      const errorMessage = data?.message || commonError;
      dispatch({
        type: BBPS_CREATE_BILLER_FAILURE,
        payload: errorMessage,
      });
    }
  } catch (error) {
    const errorMessage =
      error?.response?.data?.message || error?.message || commonError;
    dispatch({
      type: BBPS_CREATE_BILLER_FAILURE,
      payload: errorMessage,
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// Update biller/operator
export const updateBBPSBiller = (companyId, billerId, billerData) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: BBPS_UPDATE_BILLER_START });

  try {
    const token = secureLocalStorage.getItem('userToken');
    
    const payload = {
      name: billerData.name || billerData.billerName,
      billerId: billerData.billerId,
      categoryId: billerData.categoryId,
      isActive: billerData.isActive !== undefined ? billerData.isActive : true,
      isDeleted: billerData.isDeleted !== undefined ? billerData.isDeleted : false,
      initiatingChannel: billerData.initiatingChannel || billerData.initChannel,
    };

    const response = await api.put(
      `${API_ROUTE}/api/v1/admin/bbps/operators/${billerId}`,
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
        type: BBPS_UPDATE_BILLER_SUCCESS,
        payload: data,
      });
    } else {
      const errorMessage = data?.message || commonError;
      dispatch({
        type: BBPS_UPDATE_BILLER_FAILURE,
        payload: errorMessage,
      });
    }
  } catch (error) {
    const errorMessage =
      error?.response?.data?.message || error?.message || commonError;
    dispatch({
      type: BBPS_UPDATE_BILLER_FAILURE,
      payload: errorMessage,
    });
  } finally {
    dispatch({ type: LOADING_END });
  }
};

// Get all categories for user (user endpoint) - sorted by name ascending
export const getUserBBPSCategories = (page = 1, paginate = 40) => async (dispatch) => {
  dispatch({ type: BBPS_USER_GET_ALL_CATEGORIES_START });

  try {
    const token = secureLocalStorage.getItem('userToken');
    const payload = {
      query: {},
      customSearch: {},
      options: {
        page,
        paginate,
        sort: { createdAt: 1 },
      },
    };

    const response = await api.post(
      `${API_ROUTE}/api/v1/user/bbps/get-all-categories`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = response?.data;
    const { status } = data ?? {};

    if (status === 'SUCCESS' || status === 200) {
      // Sort by name ascending
      const sortedData = (data?.data || []).sort((a, b) => 
        (a.name || '').localeCompare(b.name || '')
      );
      dispatch({
        type: BBPS_USER_GET_ALL_CATEGORIES_SUCCESS,
        payload: sortedData,
      });
      return { status: 'SUCCESS', data: sortedData };
    } else {
      const errorMessage = data?.message || commonError;
      dispatch({
        type: BBPS_USER_GET_ALL_CATEGORIES_FAILURE,
        payload: errorMessage,
      });
      return { status: 'FAILURE', message: errorMessage };
    }
  } catch (error) {
    const errorMessage =
      error?.response?.data?.message || error?.message || commonError;
    dispatch({
      type: BBPS_USER_GET_ALL_CATEGORIES_FAILURE,
      payload: errorMessage,
    });
    return { status: 'FAILURE', message: errorMessage };
  }
};

// Get billers by category for user
export const getUserBBPSBillersByCategory = (categoryName, searchQuery = '', page = 1, paginate = 6) => async (dispatch) => {
  dispatch({ type: BBPS_USER_GET_BILLERS_BY_CATEGORY_START });

  try {
    const token = secureLocalStorage.getItem('userToken');
    const payload = {
      query: { operatorService: categoryName },
      customSearch: searchQuery ? { name: searchQuery } : {},
      options: {
        page,
        paginate,
        sort: { createdAt: -1 },
      },
    };

    const response = await api.post(
      `${API_ROUTE}/api/v1/user/bbps/get-billerId-by-category`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = response?.data;
    const { status } = data ?? {};

    if (status === 'SUCCESS' || status === 200) {
      dispatch({
        type: BBPS_USER_GET_BILLERS_BY_CATEGORY_SUCCESS,
        payload: {
          data: data?.data || [],
          total: data?.total || 0,
          currentPage: data?.paginator?.currentPage || page,
          totalPages: data?.paginator?.pageCount || 1,
        },
      });
      return { status: 'SUCCESS', data: data?.data || [] };
    } else {
      const errorMessage = data?.message || commonError;
      dispatch({
        type: BBPS_USER_GET_BILLERS_BY_CATEGORY_FAILURE,
        payload: errorMessage,
      });
      return { status: 'FAILURE', message: errorMessage };
    }
  } catch (error) {
    const errorMessage =
      error?.response?.data?.message || error?.message || commonError;
    dispatch({
      type: BBPS_USER_GET_BILLERS_BY_CATEGORY_FAILURE,
      payload: errorMessage,
    });
    return { status: 'FAILURE', message: errorMessage };
  }
};

// Get biller info for user
export const getUserBBPSBillerInfo = (billerId) => async (dispatch) => {
  dispatch({ type: BBPS_USER_GET_BILLER_INFO_START });

  try {
    const token = secureLocalStorage.getItem('userToken');
    const payload = {
      billerId: billerId,
    };

    const response = await api.post(
      `${API_ROUTE}/api/v1/user/bbps/get-biller-info`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = response?.data;
    const { status } = data ?? {};

    if (status === 'SUCCESS' || status === 200) {
      dispatch({
        type: BBPS_USER_GET_BILLER_INFO_SUCCESS,
        payload: data?.data || {},
      });
      return { status: 'SUCCESS', data: data?.data || {} };
    } else {
      const errorMessage = data?.message || commonError;
      dispatch({
        type: BBPS_USER_GET_BILLER_INFO_FAILURE,
        payload: errorMessage,
      });
      return { status: 'FAILURE', message: errorMessage };
    }
  } catch (error) {
    const errorMessage =
      error?.response?.data?.message || error?.message || commonError;
    dispatch({
      type: BBPS_USER_GET_BILLER_INFO_FAILURE,
      payload: errorMessage,
    });
    return { status: 'FAILURE', message: errorMessage };
  }
};

// Fetch bill for user
export const getUserBBPSFetchBill = (billData) => async (dispatch) => {
  dispatch({ type: BBPS_USER_FETCH_BILL_START });

  try {
    const token = secureLocalStorage.getItem('userToken');
    const response = await api.post(
      `${API_ROUTE}/api/v1/user/bbps/fetch-bill`,
      billData,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = response?.data;
    const { status } = data ?? {};

    if (status === 'SUCCESS' || status === 200) {
      dispatch({
        type: BBPS_USER_FETCH_BILL_SUCCESS,
        payload: data?.data || {},
      });
      return { status: 'SUCCESS', data: data?.data || {} };
    } else {
      const errorMessage = data?.message || commonError;
      dispatch({
        type: BBPS_USER_FETCH_BILL_FAILURE,
        payload: errorMessage,
      });
      return { status: 'FAILURE', message: errorMessage };
    }
  } catch (error) {
    const errorMessage =
      error?.response?.data?.message || error?.message || commonError;
    dispatch({
      type: BBPS_USER_FETCH_BILL_FAILURE,
      payload: errorMessage,
    });
    return { status: 'FAILURE', message: errorMessage };
  }
};

// Pay bill for user
export const getUserBBPSPayBill = (paymentData) => async (dispatch) => {
  dispatch({ type: BBPS_USER_PAY_BILL_START });

  try {
    const token = secureLocalStorage.getItem('userToken');
    const response = await api.post(
      `${API_ROUTE}/api/v1/user/bbps/pay-bill`,
      paymentData,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = response?.data;
    const { status } = data ?? {};

    if (status === 'SUCCESS' || status === 200) {
      dispatch({
        type: BBPS_USER_PAY_BILL_SUCCESS,
        payload: data?.data || {},
      });
      return { status: 'SUCCESS', data: data?.data || {} };
    } else {
      const errorMessage = data?.message || commonError;
      dispatch({
        type: BBPS_USER_PAY_BILL_FAILURE,
        payload: errorMessage,
      });
      return { status: 'FAILURE', message: errorMessage };
    }
  } catch (error) {
    const errorMessage =
      error?.response?.data?.message || error?.message || commonError;
    dispatch({
      type: BBPS_USER_PAY_BILL_FAILURE,
      payload: errorMessage,
    });
    return { status: 'FAILURE', message: errorMessage };
  }
};
