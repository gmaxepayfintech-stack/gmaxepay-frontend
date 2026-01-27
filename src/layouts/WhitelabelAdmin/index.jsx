import { Routes, Route } from "react-router-dom";
import AdminDashboardHome from "../../pages/adminWhiteLabelDashboard/adminDashboardHome";
import AdminWhitelabelList from "../../pages/superAdminDashboard/adminWhitelabelList";
import WhiteLabelDashboardLayout from "../adminDashboard/whiteLabelDashboardLayout";
import RoleUpgradeWhiteLabel from "../../pages/adminWhiteLabelDashboard/RoleUpgradeWhiteLabel";
import CreateCompanyUser from "../../pages/adminWhiteLabelDashboard/createCompanyUser";
import WalletLoad from "../../pages/adminWhiteLabelDashboard/fundManagement/WalletLoad";
import FundRequest from "../../pages/adminWhiteLabelDashboard/fundManagement/FundRequest";
const WhitelabelAdmin = () => {
    return (
        <WhiteLabelDashboardLayout>
            <Routes>
                <Route path="/" element={<AdminDashboardHome />} />
                <Route path="/home" element={<AdminDashboardHome />} />
                <Route path="/members/roleUpgrade" element={<RoleUpgradeWhiteLabel />} />
                <Route path="/members/companyUser" element={<CreateCompanyUser />} />
                <Route path="/onboarding" element={<AdminWhitelabelList />} />
                <Route path="/fund-manage/wallet-load" element={<WalletLoad />} />
                <Route path="/fund-manage/fund-request" element={<FundRequest />} />
            </Routes>
        </WhiteLabelDashboardLayout>
    );
};

export default WhitelabelAdmin;


