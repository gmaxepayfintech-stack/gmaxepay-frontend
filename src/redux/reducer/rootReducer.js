import { combineReducers } from "@reduxjs/toolkit";
import loadingReducer from "./loadingReducer";
import authReducer from "./authReducer";
import companyReducer from "./companyReducer";
import onboardingReducer from "./onboardingReducer";
import loginReducer from "./loginReducer";
import userProfileReducer from "./userProfileReducer";
import whiteLabelReducer from "./whiteLabelReducer";
import errorReducer from "./errorReducer";
import retailerOnboardingReducer from "./retailerOnboardingReducer";
import roleReducer from "./roleReducer";
import aepsReducer from "./aepsReducer";
import walletReducer from "./walletReducer";
import payoutReducer from "./payoutReducer";
import aepsTwoReducer from "./aepsTwoReducer";
import rechargeReducer from "./rechargeReducer";
import fundReducer from "./fundReducer";
import bbpsReducer from "./bbpsReducer";
import slabReducer from "./slabReducer";
import subscriptionReducer from "./subscriptionReducer";
import serviceReducer from "./serviceReducer";
import operatorReducer from "./operatorReducer";
import reportsReducer from "./reportsReducer";
import helpReducer from "./helpReducer";
import aepsThreeReducer from "./aepsThreeReducer";

const rootReducer = combineReducers({
  auth: authReducer,
  loading: loadingReducer,
  company: companyReducer,
  onboarding: onboardingReducer,
  login: loginReducer,
  userProfile: userProfileReducer,
  whitelabel: whiteLabelReducer,
  retailerOnboarding: retailerOnboardingReducer,
  aeps: aepsReducer,
  payout: payoutReducer,
  roles: roleReducer,
  error: errorReducer,
  wallet: walletReducer,
  aepsTwo: aepsTwoReducer,
  recharge: rechargeReducer,
  fund: fundReducer,
  bbps: bbpsReducer,
  slab: slabReducer,
  subscription: subscriptionReducer,
  services: serviceReducer,
  operators: operatorReducer,
  reports: reportsReducer,
  help: helpReducer,
  aepsThree: aepsThreeReducer,
});

export default rootReducer;
