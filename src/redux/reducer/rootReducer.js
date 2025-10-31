import { combineReducers } from '@reduxjs/toolkit';
import loadingReducer from './loadingReducer';
import authReducer from './authReducer';
import companyReducer from './companyReducer';
import onboardingReducer from './onboardingReducer';

const rootReducer = combineReducers({
    auth: authReducer,
    loading: loadingReducer,
    company: companyReducer,
    onboarding: onboardingReducer,
});

export default rootReducer;