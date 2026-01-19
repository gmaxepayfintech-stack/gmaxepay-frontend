import { Routes, Route } from "react-router-dom";
import RetailerDashLayout from "./retailerDashLayout";
import RetailerDashboard from "../../pages/retailerDashboard/RetailerDashboard";
import Services from "../../pages/retailerDashboard/Services";
import OnBoardingAeps from "../../pages/retailerDashboard/aeps/onBoardingAeps";
import OnBoardingAepsTwo from "../../pages/retailerDashboard/aeps2/onBoardingAepsTwo";
import SelectserviceTwo from "../../pages/retailerDashboard/aeps2/SelectserviceTwo";
import WalletLoad from "../../pages/retailerDashboard/fundManagement/WalletLoad";
import FundRequest from "../../pages/retailerDashboard/fundManagement/FundRequest";
import MobileRecharge from "../../pages/retailerDashboard/services/MobileRecharge";
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
                <Route path="/services/aeps2/onboarding" element={<OnBoardingAepsTwo />} />
                <Route path="/services/aeps2/select-service" element={<SelectserviceTwo />} />
                <Route path="/fund-management/wallet-load" element={<WalletLoad />} />
                <Route path="/fund-management/fund-request" element={<FundRequest />} />
            </Routes>
        </RetailerDashLayout>
    );
};

export default RetailerDash;
