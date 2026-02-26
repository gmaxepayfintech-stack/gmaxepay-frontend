import { Routes, Route } from "react-router-dom";
import MasterDistLayout from "./MasterDistLayout";
import MasterDistDashboard from "../../pages/MasterDistributorDashboard/MasterDistDashboard";
import Members from "../../pages/MasterDistributorDashboard/Members/Members";
import Rolemanagement from "../../pages/MasterDistributorDashboard/Members/Rolemanagement";
import CreateWhiteLabel from "../../pages/MasterDistributorDashboard/CreateWhiteLabel";
import SchemeMaster from "../../pages/MasterDistributorDashboard/Resources/SchemeMaster";
import Subscription from "../../pages/MasterDistributorDashboard/Resources/Subscription";
import BusinessReport from "../../pages/MasterDistributorDashboard/Reports/BusinessReport";
import UserPerformance from "../../pages/MasterDistributorDashboard/Reports/UserPerformance";
import EarningReport from "../../pages/MasterDistributorDashboard/Reports/EarningReport";
import TaxHistory from "../../pages/MasterDistributorDashboard/taxHistoryMD/TaxHistory";
import WalletLoad from "../../pages/MasterDistributorDashboard/fundManagement/WalletLoad";
import FundRequest from "../../pages/MasterDistributorDashboard/fundManagement/FundRequest";
import NWoverview from "../../pages/MasterDistributorDashboard/Reports/NW-Overview";
import BBPSServices from "../../pages/DistributorDashboard/services/BBPSServices";
import MasterDistributerProfile from "../../pages/MasterDistributorDashboard/masterDistributerProfile";
import ContactSupport from "../../pages/MasterDistributorDashboard/ContactSupport";
const MasterDistributor = () => {
  return (
    <MasterDistLayout>
      <Routes>
        <Route index element={<MasterDistDashboard />} />
        <Route path="home" element={<MasterDistDashboard />} />
        <Route path="profile" element={<MasterDistributerProfile />} />
        <Route path="members" element={<Members />} />
        <Route path="members/user" element={<CreateWhiteLabel />} />
        <Route path="members/list" element={<Members />} />
        <Route path="members/rolemanagement" element={<Rolemanagement />} />
        <Route path="resources/schemamaster" element={<SchemeMaster />} />
        <Route path="resources/subscription" element={<Subscription />} />
        <Route path="fund-management/wallet-load" element={<WalletLoad />} />
        <Route path="fund-management/fund-request" element={<FundRequest />} />
        <Route path="reports/business" element={<BusinessReport />} />
        <Route path="reports/user-performance" element={<UserPerformance />} />
        <Route path="reports/earning" element={<EarningReport />} />
        <Route path="services/bbps-services" element={<BBPSServices />} />
        <Route path="reports/nw-overview" element={<NWoverview />} />
        <Route path="tax-history" element={<TaxHistory />} />
        <Route path="contact-support" element={<ContactSupport />} />
      </Routes>
    </MasterDistLayout>
  );
};

export default MasterDistributor;
