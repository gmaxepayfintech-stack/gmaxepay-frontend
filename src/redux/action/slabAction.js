import api from '../../utils/axiosInstance';
import { API_ROUTE } from '../../data/env';
import secureLocalStorage from 'react-secure-storage';
import {
  SLAB_CREATE_START,
  SLAB_CREATE_SUCCESS,
  SLAB_CREATE_FAILURE,
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
} from '../actionType/slabActionType';
import { LOADING_START, LOADING_END } from '../actionType/loadingActionType';

const commonError = 'Something went wrong!';

// Create slab
export const createSlab = (slabData, companyId) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: SLAB_CREATE_START });

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
      slabName: slabData.schemeName || slabData.slabName || '',
      schemaMode: (slabData.schemeMode || slabData.schemaMode || 'global').toLowerCase(),
      schemaType: (slabData.schemeType || slabData.schemaType || 'free').toLowerCase(),
    };

    console.log('Creating slab with payload:', payload);
    console.log('API Route:', `${API_ROUTE}/api/v1/admin/slabs`);
    console.log('Company ID:', companyId);

    const response = await api.post(
      `${API_ROUTE}/api/v1/admin/slabs`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-company-id': companyId,
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log('API Response:', response);
    const data = response?.data;
    const { status } = data ?? {};
    console.log('Response status:', status);

    if (status === 'SUCCESS' || status === 200) {
      dispatch({
        type: SLAB_CREATE_SUCCESS,
        payload: {
          data: data?.data || null,
          status: data?.status,
          message: data?.message || 'Slab created successfully',
        },
      });
      dispatch({ type: LOADING_END });
      
      // Refresh the list after creating (with default page 1 and paginate 6)
      dispatch(getSlabList(companyId, 1, 6));
      
      return {
        success: true,
        data: data?.data,
        message: data?.message || 'Slab created successfully',
      };
    } else {
      dispatch({
        type: SLAB_CREATE_FAILURE,
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
    
    dispatch({
      type: SLAB_CREATE_FAILURE,
      payload: errorMessage,
    });
    dispatch({ type: LOADING_END });
    return {
      success: false,
      message: errorMessage,
    };
  }
};

// Get slab list
export const getSlabList = (companyId, page = 1, paginate = 6) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: SLAB_GET_LIST_START });

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
      `${API_ROUTE}/api/v1/admin/slabs/list`,
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
        type: SLAB_GET_LIST_SUCCESS,
        payload: {
          data: data?.data || [],
          total: data?.total || 0,
          paginator: data?.paginator || {},
          status: data?.status,
          message: data?.message || 'Slabs retrieved successfully',
        },
      });
      dispatch({ type: LOADING_END });
      return {
        success: true,
        data: data?.data || [],
        total: data?.total || 0,
        paginator: data?.paginator || {},
      };
    } else {
      dispatch({
        type: SLAB_GET_LIST_FAILURE,
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
    
    dispatch({
      type: SLAB_GET_LIST_FAILURE,
      payload: errorMessage,
    });
    dispatch({ type: LOADING_END });
    return {
      success: false,
      message: errorMessage,
    };
  }
};

// Get slab commission (slabcomm) list for a given slab
export const getSlabCommissionList = (companyId, slabId, page = 1, paginate = 1) => async (dispatch) => {
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

    if (!slabId) {
      console.error('No slab ID provided');
      throw new Error('Slab ID is required');
    }

    const payload = {
      query: {},
      customSearch: {},
      options: {
        page,
        paginate,
        sort: { createdAt: -1 },
      },
    };

    const url = `${API_ROUTE}/api/v1/admin/slabs/slabcomm/${slabId}`;
    console.log('Fetching slab commission list:', { url, payload, companyId });

    const response = await api.post(
      url,
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
        type: SLAB_GET_COMM_SUCCESS,
        payload: {
          data: data?.data || [],
          total: data?.total || 0,
          status: data?.status,
          message: data?.message || 'Slab commission retrieved successfully',
        },
      });

      return {
        success: true,
        data: data?.data || [],
        total: data?.total || 0,
        message: data?.message || 'Slab commission retrieved successfully',
      };
    } else {
      dispatch({
        type: SLAB_GET_COMM_FAILURE,
        payload: data?.message || commonError,
      });
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

    dispatch({
      type: SLAB_GET_COMM_FAILURE,
      payload: errorMessage,
    });

    return {
      success: false,
      message: errorMessage,
    };
  }
};

// Update a single slab commission entry (role-level)
export const updateSlabCommission = (companyId, roleId, payload) => async (dispatch) => {
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

    if (!roleId) {
      console.error('No role ID provided');
      throw new Error('Role ID is required');
    }

    dispatch({ type: SLAB_UPDATE_COMM_START, payload: { roleId } });

    const url = `${API_ROUTE}/api/v1/admin/slabs/updateSlabComm/${roleId}`;
    console.log('Updating slab commission:', { url, payload, companyId });

    const response = await api.put(
      url,
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
        type: SLAB_UPDATE_COMM_SUCCESS,
        payload: {
          roleId,
          data: data?.data,
          message: data?.message || 'Slab commission updated successfully',
        },
      });

      return {
        success: true,
        data: data?.data,
        message: data?.message || 'Slab commission updated successfully',
        status: data?.status,
      };
    } else {
      const message = data?.message || commonError;
      dispatch({
        type: SLAB_UPDATE_COMM_FAILURE,
        payload: message,
      });
      return {
        success: false,
        message,
        status: data?.status,
      };
    }
  } catch (error) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      commonError;

    dispatch({
      type: SLAB_UPDATE_COMM_FAILURE,
      payload: errorMessage,
    });

    return {
      success: false,
      message: errorMessage,
    };
  }
};

// Assign slab to company admin
export const assignSlabToCompany = (slabId, companyId) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: SLAB_ASSIGN_START });

  try {
    const token = secureLocalStorage.getItem('userToken');
    
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const payload = {
      slabId: String(slabId),
      companyId: String(companyId),
    };

    const response = await api.post(
      `${API_ROUTE}/api/v1/admin/slabs/assign`,
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
        type: SLAB_ASSIGN_SUCCESS,
        payload: {
          data: data?.data,
          message: data?.message || 'Slab assigned successfully',
          status: data?.status,
        },
      });
      dispatch({ type: LOADING_END });
      return {
        success: true,
        data: data?.data,
        message: data?.message || 'Slab assigned successfully',
        status: data?.status,
      };
    } else {
      dispatch({
        type: SLAB_ASSIGN_FAILURE,
        payload: {
          message: data?.message || commonError,
          status: data?.status || 'ERROR',
        },
      });
      dispatch({ type: LOADING_END });
      return {
        success: false,
        message: data?.message || commonError,
        status: data?.status || 'ERROR',
      };
    }
  } catch (error) {
    dispatch({
      type: SLAB_ASSIGN_FAILURE,
      payload: {
        message: error.response?.data?.message || error.message || commonError,
        status: 'ERROR',
      },
    });
    dispatch({ type: LOADING_END });
    return {
      success: false,
      message: error.response?.data?.message || error.message || commonError,
      status: 'ERROR',
    };
  }
};

// ========== COMPANY SLAB ACTIONS (for adminWhiteLabelDashboard) ==========

// Create slab for company
export const createCompanySlab = (slabData, companyId) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: SLAB_CREATE_START });

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
      slabName: slabData.schemeName || slabData.slabName || '',
      schemaMode: (slabData.schemeMode || slabData.schemaMode || 'global').toLowerCase(),
      schemaType: (slabData.schemeType || slabData.schemaType || 'free').toLowerCase(),
      subscriptionAmount: slabData.subscriptionAmount || 0,
    };

    console.log('Creating company slab with payload:', payload);
    console.log('API Route:', `${API_ROUTE}/api/v1/company/slabs/create-slab`);
    console.log('Company ID:', companyId);

    const response = await api.post(
      `${API_ROUTE}/api/v1/company/slabs/create-slab`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-company-id': companyId,
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log('API Response:', response);
    const data = response?.data;
    const { status } = data ?? {};
    console.log('Response status:', status);

    if (status === 'SUCCESS' || status === 200) {
      dispatch({
        type: SLAB_CREATE_SUCCESS,
        payload: {
          data: data?.data || null,
          status: data?.status,
          message: data?.message || 'Slab created successfully',
        },
      });
      dispatch({ type: LOADING_END });
      
      // Refresh the list after creating (with default page 1 and paginate 6)
      dispatch(getCompanySlabList(companyId, 1, 6));
      
      return {
        success: true,
        data: data?.data,
        message: data?.message || 'Slab created successfully',
      };
    } else {
      dispatch({
        type: SLAB_CREATE_FAILURE,
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
    
    dispatch({
      type: SLAB_CREATE_FAILURE,
      payload: errorMessage,
    });
    dispatch({ type: LOADING_END });
    return {
      success: false,
      message: errorMessage,
    };
  }
};

// Get company slab list
export const getCompanySlabList = (companyId, page = 1, paginate = 6) => async (dispatch) => {
  dispatch({ type: LOADING_START });
  dispatch({ type: SLAB_GET_LIST_START });

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
      `${API_ROUTE}/api/v1/company/slabs/list`,
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
        type: SLAB_GET_LIST_SUCCESS,
        payload: {
          data: data?.data || [],
          total: data?.total || 0,
          paginator: data?.paginator || {},
          status: data?.status,
          message: data?.message || 'Slabs retrieved successfully',
        },
      });
      dispatch({ type: LOADING_END });
      return {
        success: true,
        data: data?.data || [],
        total: data?.total || 0,
        paginator: data?.paginator || {},
      };
    } else {
      dispatch({
        type: SLAB_GET_LIST_FAILURE,
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
    
    dispatch({
      type: SLAB_GET_LIST_FAILURE,
      payload: errorMessage,
    });
    dispatch({ type: LOADING_END });
    return {
      success: false,
      message: errorMessage,
    };
  }
};

// Get company slab commission (slabcomm) list for a given slab
export const getCompanySlabCommissionList = (companyId, slabId, page = 1, paginate = 10) => async (dispatch) => {
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

    if (!slabId) {
      console.error('No slab ID provided');
      throw new Error('Slab ID is required');
    }

    const payload = {
      query: {},
      customSearch: {},
      options: {
        page,
        paginate,
        sort: { createdAt: -1 },
      },
    };

    const url = `${API_ROUTE}/api/v1/company/slabs/slabcomm/${slabId}`;
    console.log('Fetching company slab commission list:', { url, payload, companyId });

    const response = await api.post(
      url,
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
        type: SLAB_GET_COMM_SUCCESS,
        payload: {
          data: data?.data || [],
          total: data?.total || 0,
          status: data?.status,
          message: data?.message || 'Slab commission retrieved successfully',
        },
      });

      return {
        success: true,
        data: data?.data || [],
        total: data?.total || 0,
        message: data?.message || 'Slab commission retrieved successfully',
      };
    } else {
      dispatch({
        type: SLAB_GET_COMM_FAILURE,
        payload: data?.message || commonError,
      });
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

    dispatch({
      type: SLAB_GET_COMM_FAILURE,
      payload: errorMessage,
    });

    return {
      success: false,
      message: errorMessage,
    };
  }
};

// Update a single company slab commission entry (role-level)
export const updateCompanySlabCommission = (companyId, roleId, payload) => async (dispatch) => {
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

    if (!roleId) {
      console.error('No role ID provided');
      throw new Error('Role ID is required');
    }

    dispatch({ type: SLAB_UPDATE_COMM_START, payload: { roleId } });

    const url = `${API_ROUTE}/api/v1/company/slabs/updateSlabComm/${roleId}`;
    console.log('Updating company slab commission:', { url, payload, companyId });

    const response = await api.put(
      url,
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
        type: SLAB_UPDATE_COMM_SUCCESS,
        payload: {
          roleId,
          data: data?.data,
          message: data?.message || 'Slab commission updated successfully',
        },
      });

      return {
        success: true,
        data: data?.data,
        message: data?.message || 'Slab commission updated successfully',
        status: data?.status,
      };
    } else {
      const message = data?.message || commonError;
      dispatch({
        type: SLAB_UPDATE_COMM_FAILURE,
        payload: message,
      });
      return {
        success: false,
        message,
        status: data?.status,
      };
    }
  } catch (error) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      commonError;

    dispatch({
      type: SLAB_UPDATE_COMM_FAILURE,
      payload: errorMessage,
    });

    return {
      success: false,
      message: errorMessage,
    };
  }
};
