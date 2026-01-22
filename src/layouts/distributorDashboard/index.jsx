import { Routes, Route } from "react-router-dom";
import DistributorLayout from "./DistributorLayout";
import DistDashboard from "../../pages/DistributorDashboard/DistDashboard";
import OnBoardingAeps from "../../pages/DistributorDashboard/aeps/onBoardingAeps";
import WalletLoad from "../../pages/DistributorDashboard/fundManagement/WalletLoad";
import FundRequest from "../../pages/DistributorDashboard/fundManagement/FundRequest";

import BusinessReport from "../../pages/DistributorDashboard/Reports/BusinessReport";
import UserPerformance from "../../pages/DistributorDashboard/Reports/UserPerformance";
import EarningReport from "../../pages/DistributorDashboard/Reports/EarningReport";
import NWoverview from "../../pages/DistributorDashboard/Reports/NW-Overview";
import TaxHistory from "../../pages/DistributorDashboard/TaxHistory";
import Services from "../../pages/DistributorDashboard/Services";

const DistributorDashboard = () => {
  return (
    <DistributorLayout>
      <Routes>
        <Route path="/" element={<DistDashboard />} />
        <Route path="/home" element={<DistDashboard />} />
        <Route path="/aeps" element={<OnBoardingAeps />} />
        <Route path="/services" element={<Services />} />
        <Route path="/fund-manage/wallet-load" element={<WalletLoad />} />
        <Route path="/fund-manage/fund-request" element={<FundRequest />} />
        {/* <Route path="/resources/schemamaster" element={<SchemeMaster />} />
        <Route path="/resources/roleupgraderequest" element={<RoleUpgrade />} /> */}
        <Route path="/reports/business" element={<BusinessReport />} />
        <Route path="/reports/user-performance" element={<UserPerformance />} />
        <Route path="/reports/earning" element={<EarningReport />} />
        <Route path="/reports/nw-overview" element={<NWoverview />} />
        <Route path="/tax-history" element={<TaxHistory />} />
        {/* <Route path="/members" element={<Members />} />
        <Route path="/members/user" element={<CreateWhiteLabel />} />
        <Route path="/members/list" element={<Members />} />
        <Route path="/members/rolemanagement" element={<Rolemanagement />} /> */}
      </Routes>
    </DistributorLayout>
  );
};

export default DistributorDashboard;
