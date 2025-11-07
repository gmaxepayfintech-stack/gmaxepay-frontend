import { Routes, Route } from "react-router-dom";
import DashboardLayout from "../DashboardLayout";
import SuperAdminDashboards from "../../pages/superAdminDashboard/SuperAdminDashboard";
// import Home from "./Home";
// import Reports from "./Reports";
// import Users from "./Users";

const SuperAdminDashboard = () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<SuperAdminDashboards />} />
        {/* <Route path="home" element={<Home />} />
        <Route path="reports" element={<Reports />} />
        <Route path="users" element={<Users />} /> */}
      </Routes>
    </DashboardLayout>
  );
};

export default SuperAdminDashboard;
