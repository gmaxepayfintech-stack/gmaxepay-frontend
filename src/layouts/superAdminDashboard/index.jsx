import { Routes, Route } from "react-router-dom";
import DashboardLayout from "../DashboardLayout";
import SuperAdmin from "../../pages/superAdminDashboard/SuperAdmin";
import Members from "../../pages/superAdminDashboard/Members";
import CreateWhiteLabel from "../../pages/CreateWhiteLabel"

const SuperAdminDashboard = () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<SuperAdmin />} />
        <Route path="/home" element={<SuperAdmin />} />
        <Route path="/members" element={<Members />} />
        <Route path="/members/add" element={<CreateWhiteLabel />} />
        <Route path="/members/list" element={<Members />} />
      </Routes>
    </DashboardLayout>
  );
};

export default SuperAdminDashboard;
