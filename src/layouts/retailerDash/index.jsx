import { Routes, Route } from "react-router-dom";
import RetailerDashLayout from "./retailerDashLayout";
import RetailerDashboard from "../../pages/retailerDashboard/RetailerDashboard";
import Services from "../../pages/retailerDashboard/Services";
import OnBoardingAeps from "../../pages/retailerDashboard/aeps/onBoardingAeps";
import WalletLoad from "../../pages/retailerDashboard/fundManagement/WalletLoad";
import FundRequest from "../../pages/retailerDashboard/fundManagement/FundRequest";
const RetailerDash = () => {
    return (
        <RetailerDashLayout>
            <Routes>
                <Route path="/" element={<RetailerDashboard />} />
                <Route path="/home" element={<RetailerDashboard />} />
                <Route path="/services" element={<Services />} />
                <Route path="/onboarding-aeps" element={<OnBoardingAeps />} />
                <Route path="/fund-management/wallet-load" element={<WalletLoad />} />
                <Route path="/fund-management/fund-request" element={<FundRequest />} />
            </Routes>
        </RetailerDashLayout>
    );
};

export default RetailerDash;
