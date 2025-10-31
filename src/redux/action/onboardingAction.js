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

