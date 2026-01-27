import { Routes, Route } from "react-router-dom";
import DashboardLayout from "../DashboardLayout";
import SuperAdmin from "../../pages/superAdminDashboard/SuperAdmin";
import Members from "../../pages/superAdminDashboard/Members";
import CreateWhiteLabel from "../../pages/CreateWhiteLabel";
import Rolemanagement from "../../pages/superAdminDashboard/Rolemanagement";
import SchemeMaster from "../../pages/superAdminDashboard/SchemeMaster";
import RoleUpgrade from "../../pages/superAdminDashboard/RoleUpgrade";
import TaxHistory from "../../pages/superAdminDashboard/TaxHistory";
import BusinessReport from "../../pages/superAdminDashboard/BusinessReport";
import UserPerformance from "../../pages/superAdminDashboard/UserPerformance";
import EarningReport from "../../pages/superAdminDashboard/EarningReport";
import BBPSSettings from "../../pages/superAdminDashboard/BBPSSettings";
// import WalletLoad from "../../pages/superAdminDashboard/fundManagement/WalletLoad";
import FundRequest from "../../pages/superAdminDashboard/fundManagement/FundRequest";
import NWoverview from "../../pages/superAdminDashboard/NW-Overview";

const SuperAdminDashboard = () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<SuperAdmin />} />
        <Route path="/home" element={<SuperAdmin />} />
        <Route path="/members" element={<Members />} />
        <Route path="/members/user" element={<CreateWhiteLabel />} />
        <Route path="/members/list" element={<Members />} />
        <Route path="/members/rolemanagement" element={<Rolemanagement />} />
        <Route path="/resources/schemamaster" element={<SchemeMaster />} />
        <Route path="/resources/roleupgraderequest" element={<RoleUpgrade />} />
        <Route path="/txn-history" element={<TaxHistory />} />
        <Route path="/reports/business" element={<BusinessReport />} />
        <Route path="/reports/user-performance" element={<UserPerformance />} />
        <Route path="/reports/earning" element={<EarningReport />} />
        {/* <Route path="/fund-management/wallet-load" element={<WalletLoad />} /> */}
        <Route path="/fund-management/fund-request" element={<FundRequest />} />
        <Route path="/reports/nw-overview" element={<NWoverview />} />

        <Route path="/bbps-settings/list" element={<BBPSSettings />} />
      </Routes>
    </DashboardLayout>
  );
};

export default SuperAdminDashboard;
