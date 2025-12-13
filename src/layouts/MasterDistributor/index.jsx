import { Routes, Route } from "react-router-dom";
import MasterDistLayout from "./MasterDistLayout";
import MasterDistDashboard from "../../pages/MasterDistributorDashboard/MasterDistDashboard";


const MasterDistributor = () => {
  return (
    <MasterDistLayout>
      <Routes>
        <Route path="/" element={<MasterDistDashboard />} />
        <Route path="/home" element={<MasterDistDashboard />} />
      </Routes>
    </MasterDistLayout>
  );
};

export default MasterDistributor;
