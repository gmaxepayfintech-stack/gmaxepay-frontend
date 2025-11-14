import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_ROUTE } from '../../data/env';
import {
  FETCH_ONBOARDING_START,
  FETCH_ONBOARDING_SUCCESS,
  FETCH_ONBOARDING_FAILURE,
  CLEAR_ONBOARDING,
  UPDATE_ONBOARDING_STEP,
} from '../actionType/onboardingActionType';

// Async thunk for fetching onboarding data
export const fetchOnboarding = createAsyncThunk(
  'onboarding/fetchOnboarding',
  async (token, { rejectWithValue }) => {
    try {
      let domain = window.location.hostname;
      if (domain === 'localhost') {
        domain = 'app.gmaxepay.in';
      }
      const response = await axios.post(
        `${API_ROUTE}/api/v1/company/onboarding/${token}`,
        {},
        {
          headers: {
            'x-company-domain': domain,
          },
        }
      );

      if (response.data.status === 'SUCCESS') {
        return response.data.data;
      } else {
        return rejectWithValue(response.data.message || 'Failed to fetch onboarding data');
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch onboarding data'
      );
    }
  }
);

// Regular action creators
export const clearOnboarding = () => ({
  type: CLEAR_ONBOARDING,
});

export const updateOnboardingStep = (stepNumber) => ({
  type: UPDATE_ONBOARDING_STEP,
  payload: stepNumber,
});

// Helper function to convert data URL to File
const dataURLtoFile = (dataUrl, filename) => {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

// Async thunk for posting profile photo (combined liveness + shop)
export const postProfile = createAsyncThunk(
  'onboarding/postProfile',
  async ({ token, photoDataUrl }, { rejectWithValue }) => {
    try {
      if (!photoDataUrl) {
        return rejectWithValue('Profile image is required');
      }

      const photoFile = dataURLtoFile(photoDataUrl, 'profile-liveness.jpg');
      const formData = new FormData();
      formData.append('photo', photoFile);

      // Force headers requested by backend
      const origin = 'http://localhost:5173';
      const domain = 'localhost';

      const response = await axios.post(
        `${API_ROUTE}/api/v1/company/onboarding/${token}/postProfile`,
        formData,
        {
          headers: {
            Origin: origin,
            'x-company-domain': domain,
          },
        }
      );

      if (response.data.status === 'SUCCESS' || response.data.flag === true) {
        return response.data;
      } else {
        return rejectWithValue(response.data.message || 'Failed to post profile');
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Failed to post profile'
      );
    }
  }
);

