import { Routes, Route } from "react-router-dom";
import MasterDistLayout from "./MasterDistLayout";
import MasterDistDashboard from "../../pages/MasterDistributorDashboard/MasterDistDashboard";
import Members from "../../pages/MasterDistributorDashboard/Members/Members";
import Rolemanagement from "../../pages/MasterDistributorDashboard/Members/Rolemanagement";
import CreateWhiteLabel from "../../pages/MasterDistributorDashboard/CreateWhiteLabel";
import SchemeMaster from "../../pages/MasterDistributorDashboard/Resources/SchemeMaster";
import RoleUpgrade from "../../pages/MasterDistributorDashboard/Resources/RoleUpgrade";
import BusinessReport from "../../pages/MasterDistributorDashboard/Reports/BusinessReport";
import UserPerformance from "../../pages/MasterDistributorDashboard/Reports/UserPerformance";
import EarningReport from "../../pages/MasterDistributorDashboard/Reports/EarningReport";
import TaxHistory from "../../pages/MasterDistributorDashboard/TaxHistory";
import WalletLoad from "../../pages/MasterDistributorDashboard/fundManagement/WalletLoad";
import FundRequest from "../../pages/MasterDistributorDashboard/fundManagement/FundRequest";
import NWoverview from "../../pages/MasterDistributorDashboard/Reports/NW-Overview";

const MasterDistributor = () => {
  return (
    <MasterDistLayout>
      <Routes>
        <Route path="/" element={<MasterDistDashboard />} />
        <Route path="/home" element={<MasterDistDashboard />} />
        <Route path="/members" element={<Members />} />
        <Route path="/members/user" element={<CreateWhiteLabel />} />
        <Route path="/members/list" element={<Members />} />
        <Route path="/members/rolemanagement" element={<Rolemanagement />} />
        <Route path="/resources/schemamaster" element={<SchemeMaster />} />
        <Route path="/resources/roleupgraderequest" element={<RoleUpgrade />} />
        <Route path="/fund-management/wallet-load" element={<WalletLoad />} />
        <Route path="/fund-management/fund-request" element={<FundRequest />} />
        <Route path="/reports/business" element={<BusinessReport />} />
        <Route path="/reports/user-performance" element={<UserPerformance />} />
        <Route path="/reports/earning" element={<EarningReport />} />
        <Route path="/reports/nw-overview" element={<NWoverview />} />
        <Route path="/tax-history" element={<TaxHistory />} />
      </Routes>
    </MasterDistLayout>
  );
};

export default MasterDistributor;
