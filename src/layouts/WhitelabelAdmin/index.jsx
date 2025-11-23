import { Routes, Route } from "react-router-dom";
import AdminDashboardHome from "../../pages/adminWhiteLabelDashboard/adminDashboardHome";
import WhiteLabelDashboardLayout from "../adminDashboard/whiteLabelDashboardLayout";

const WhitelabelAdmin = () => {
    return (
        <WhiteLabelDashboardLayout>
            <Routes>
                <Route path="/" element={<AdminDashboardHome />} />
                <Route path="/home" element={<AdminDashboardHome />} />
            </Routes>
        </WhiteLabelDashboardLayout>
    );
};

export default WhitelabelAdmin;


