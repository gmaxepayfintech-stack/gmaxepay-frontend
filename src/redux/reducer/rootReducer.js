import { combineReducers } from '@reduxjs/toolkit';
import loadingReducer from './loadingReducer';
import authReducer from './authReducer';
import companyReducer from './companyReducer';
import onboardingReducer from './onboardingReducer';
import loginReducer from './loginReducer';
import userProfileReducer from './userProfileReducer';
import whiteLabelReducer from './whiteLabelReducer';

const rootReducer = combineReducers({
    auth: authReducer,
    loading: loadingReducer,
    company: companyReducer,
    onboarding: onboardingReducer,
    login: loginReducer,
    userProfile: userProfileReducer,
    whitelabel:whiteLabelReducer,
});

export default rootReducer;