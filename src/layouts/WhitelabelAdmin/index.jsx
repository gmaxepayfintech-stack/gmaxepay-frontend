import { Routes, Route } from "react-router-dom";
import AdminDashboardHome from "../../pages/adminWhiteLabelDashboard/adminDashboardHome";
import AdminWhitelabelList from "../../pages/superAdminDashboard/adminWhitelabelList";
import WhiteLabelDashboardLayout from "../adminDashboard/whiteLabelDashboardLayout";
import RoleUpgradeWhiteLabel from "../../pages/adminWhiteLabelDashboard/RoleUpgradeWhiteLabel";

const WhitelabelAdmin = () => {
    return (
        <WhiteLabelDashboardLayout>
            <Routes>
                <Route path="/" element={<AdminDashboardHome />} />
                <Route path="/home" element={<AdminDashboardHome />} />
                <Route path="/resources/roleUpgradeRequest" element={<RoleUpgradeWhiteLabel />} />
                <Route path="/onboarding" element={<AdminWhitelabelList />} />
            </Routes>
        </WhiteLabelDashboardLayout>
    );
};

export default WhitelabelAdmin;


