import { Routes, Route } from "react-router-dom";
import DashboardLayout from "../DashboardLayout";
import SuperAdmin from "../../pages/superAdminDashboard/SuperAdmin";
import Members from "../../pages/superAdminDashboard/Members";
import CreateWhiteLabel from "../../pages/CreateWhiteLabel"
import Rolemanagement from "../../pages/superAdminDashboard/Rolemanagement"
import SchemeMaster from "../../pages/superAdminDashboard/SchemeMaster"

const SuperAdminDashboard = () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<SuperAdmin />} />
        <Route path="/home" element={<SuperAdmin />} />
        <Route path="/members" element={<Members />} />
        <Route path="/members/add" element={<CreateWhiteLabel />} />
        <Route path="/members/list" element={<Members />} />
        <Route path="/members/rolemanagement" element={<Rolemanagement />} />
        <Route path="resources/roleupgraderequest" element={<SchemeMaster />} />
      </Routes>
    </DashboardLayout>
  );
};

export default SuperAdminDashboard;
