import { Routes, Route } from "react-router-dom";
import AdminDashboardHome from "../../pages/adminWhiteLabelDashboard/adminDashboardHome";
import AdminWhitelabelList from "../../pages/superAdminDashboard/adminWhitelabelList";
import WhiteLabelDashboardLayout from "../adminDashboard/whiteLabelDashboardLayout";
import RoleUpgradeWhiteLabel from "../../pages/adminWhiteLabelDashboard/RoleUpgradeWhiteLabel";
import CreateCompanyUser from "../../pages/adminWhiteLabelDashboard/createCompanyUser";

const WhitelabelAdmin = () => {
    return (
        <WhiteLabelDashboardLayout>
            <Routes>
                <Route path="/" element={<AdminDashboardHome />} />
                <Route path="/home" element={<AdminDashboardHome />} />
                <Route path="/members/roleUpgrade" element={<RoleUpgradeWhiteLabel />} />
                <Route path="/members/companyUser" element={<CreateCompanyUser />} />
                <Route path="/onboarding" element={<AdminWhitelabelList />} />
            </Routes>
        </WhiteLabelDashboardLayout>
    );
};

export default WhitelabelAdmin;


