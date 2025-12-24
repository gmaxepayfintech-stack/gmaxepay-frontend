import { Routes, Route } from "react-router-dom";
import DistributorLayout from "./DistributorLayout";
import DistDashboard from "../../pages/DistributorDashboard/DistDashboard";
import OnBoardingAeps from "../../pages/DistributorDashboard/aeps/onBoardingAeps";
const DistributorDashboard = () => {
  return (
    <DistributorLayout>
      <Routes>
        <Route path="/" element={<DistDashboard />} />
        <Route path="/home" element={<DistDashboard />} />
        <Route path="/aeps" element={<OnBoardingAeps />} />
      </Routes>
    </DistributorLayout>
  );
};

export default DistributorDashboard;
