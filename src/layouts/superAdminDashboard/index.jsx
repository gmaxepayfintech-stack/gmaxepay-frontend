import { Routes, Route } from "react-router-dom";
import DashboardLayout from "../DashboardLayout";
import SuperAdmin from "../../pages/superAdminDashboard/SuperAdmin";
import Members from "../../pages/superAdminDashboard/Members";
import CreateWhiteLabel from "../../pages/CreateWhiteLabel";
import Rolemanagement from "../../pages/superAdminDashboard/Rolemanagement";
import SchemeMaster from "../../pages/superAdminDashboard/SchemeMaster";
import TaxHistory from "../../pages/superAdminDashboard/TaxHistory";
import BusinessReport from "../../pages/superAdminDashboard/BusinessReport";
import UserPerformance from "../../pages/superAdminDashboard/UserPerformance";
import EarningReport from "../../pages/superAdminDashboard/EarningReport";
import BBPSSettings from "../../pages/superAdminDashboard/BBPSSettings";
import FundRequest from "../../pages/superAdminDashboard/fundManagement/FundRequest";
import NWoverview from "../../pages/superAdminDashboard/NW-Overview";
import SuperAdminProfile from "../../pages/superAdminDashboard/superAdminProfile";
import ServiceSetting from "../../pages/superAdminDashboard/serviceSetting";
import OperatorSetting from "../../pages/superAdminDashboard/operatorSetting";
import ContactSupport from "../../pages/superAdminDashboard/ContactSupport";

const SuperAdminDashboard = () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<SuperAdmin />} />
        <Route path="/home" element={<SuperAdmin />} />
        <Route path="/profile" element={<SuperAdminProfile />} />
        <Route path="/members/user" element={<CreateWhiteLabel />} />
        <Route path="/members/list" element={<Members />} />
        <Route path="/members/rolemanagement" element={<Rolemanagement />} />
        <Route path="/resources/schemamaster" element={<SchemeMaster />} />
        <Route path="/txn-history" element={<TaxHistory />} />
        <Route path="/reports/business" element={<BusinessReport />} />
        <Route path="/reports/user-performance" element={<UserPerformance />} />
        <Route path="/reports/earning" element={<EarningReport />} />
        {/* <Route path="/fund-management/wallet-load" element={<WalletLoad />} /> */}
        <Route path="/fund-management/fund-request" element={<FundRequest />} />
        <Route path="/reports/nw-overview" element={<NWoverview />} />

        <Route path="/bbps-settings/list" element={<BBPSSettings />} />
        <Route
          path="/api-operator/service-settings"
          element={<ServiceSetting />}
        />
        <Route
          path="/api-operator/operator-settings"
          element={<OperatorSetting />}
        />
        <Route path="/contact-support" element={<ContactSupport />} />
      </Routes>
    </DashboardLayout>
  );
};

export default SuperAdminDashboard;
