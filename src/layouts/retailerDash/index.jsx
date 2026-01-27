import { Routes, Route } from "react-router-dom";
import RetailerDashLayout from "./retailerDashLayout";
import RetailerDashboard from "../../pages/retailerDashboard/RetailerDashboard";
import Services from "../../pages/retailerDashboard/Services";
import OnBoardingAeps from "../../pages/retailerDashboard/aeps/onBoardingAeps";
import OnBoardingAepsTwo from "../../pages/retailerDashboard/aeps2/onBoardingAepsTwo";
import SelectserviceTwo from "../../pages/retailerDashboard/aeps2/SelectserviceTwo";
import WalletLoad from "../../pages/retailerDashboard/fundManagement/WalletLoad";
import MobileRecharge from "../../pages/retailerDashboard/services/MobileRecharge";
import DTHRecharge from "../../pages/retailerDashboard/services/DTHRecharge";
import OnBoardingBBPS from "../../pages/retailerDashboard/bbps/onBoardingBBPS";
import BusinessReport from "../../pages/retailerDashboard/Reports/BusinessReport";
import EarningReport from "../../pages/retailerDashboard/Reports/EarningReport";
import UserPerformance from "../../pages/retailerDashboard/Reports/UserPerformance";
import TaxHistory from "../../pages/retailerDashboard/TaxHistory";
import BBPSServices from "../../pages/retailerDashboard/services/BBPSServices";

const RetailerDash = () => {
  return (
    <RetailerDashLayout>
      <Routes>
        <Route path="/" element={<RetailerDashboard />} />
        <Route path="/home" element={<RetailerDashboard />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/recharge" element={<MobileRecharge />} />
        <Route path="/onboarding-aeps" element={<OnBoardingAeps />} />
        <Route path="/services/aeps1/onboarding" element={<OnBoardingAeps />} />
        <Route
          path="/services/aeps2/onboarding"
          element={<OnBoardingAepsTwo />}
        />
        <Route path="/services/dth-recharge" element={<DTHRecharge />} />
        {/* <Route
          path="/services/bbps"
          element={<OnBoardingBBPS />}
        /> */}
        <Route path="/services/bbps-services" element={<BBPSServices />} />

        <Route
          path="/services/aeps2/select-service"
          element={<SelectserviceTwo />}
        />
        <Route path="/fund-management/wallet-load" element={<WalletLoad />} />
        <Route path="/reports/business" element={<BusinessReport />} />
        <Route path="/reports/earning" element={<EarningReport />} />
        <Route path="/reports/user-performance" element={<UserPerformance />} />
        <Route path="/tax-history" element={<TaxHistory />} />
      </Routes>
    </RetailerDashLayout>
  );
};

export default RetailerDash;
