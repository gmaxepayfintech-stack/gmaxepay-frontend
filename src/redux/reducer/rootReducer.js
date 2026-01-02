import { combineReducers } from '@reduxjs/toolkit';
import loadingReducer from './loadingReducer';
import authReducer from './authReducer';
import companyReducer from './companyReducer';
import onboardingReducer from './onboardingReducer';
import loginReducer from './loginReducer';
import userProfileReducer from './userProfileReducer';
import whiteLabelReducer from './whiteLabelReducer';
import errorReducer from './errorReducer';
import retailerOnboardingReducer from './retailerOnboardingReducer';
import roleReducer from './roleReducer';
import aepsReducer from './aepsReducer';
import payoutReducer from './payoutReducer';

const rootReducer = combineReducers({
    auth: authReducer,
    loading: loadingReducer,
    company: companyReducer,
    onboarding: onboardingReducer,
    login: loginReducer,
    userProfile: userProfileReducer,
    whitelabel:whiteLabelReducer,
    retailerOnboarding: retailerOnboardingReducer,
    aeps: aepsReducer,
    payout: payoutReducer,
    roles:roleReducer,
    error:errorReducer
});

export default rootReducer;