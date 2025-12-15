import { Routes, Route } from "react-router-dom";
import DistributorLayout from "./DistributorLayout";
import DistDashboard from "../../pages/DistributorDashboard/DistDashboard";
const DistributorDashboard = () => {
  return (
    <DistributorLayout>
      <Routes>
        <Route path="/" element={<DistDashboard />} />
        <Route path="/home" element={<DistDashboard />} />
      </Routes>
    </DistributorLayout>
  );
};

export default DistributorDashboard;
