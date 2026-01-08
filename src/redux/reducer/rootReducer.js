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
<<<<<<< HEAD
import walletReducer from './walletReducer';
=======
import payoutReducer from './payoutReducer';
>>>>>>> 1f2c45761ebbd387f9a3be3b999a017fe20a3719

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
    error:errorReducer,
    wallet: walletReducer
});

export default rootReducer;