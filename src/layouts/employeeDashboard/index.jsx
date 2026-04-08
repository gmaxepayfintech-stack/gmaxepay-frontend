import { Routes, Route, Navigate } from "react-router-dom";
import EmployeeLayout from "./EmployeeLayout";
import EmployeeDash from "../../pages/employeeDashboard/EmployeeDash";
import CreateWhiteLabel from "../../pages/employeeDashboard/members/CreateWhiteLabel";
import Members from "../../pages/employeeDashboard/members/Members";
import Rolemanagement from "../../pages/employeeDashboard/members/Rolemanagement";
import ServiceSetting from "../../pages/employeeDashboard/apiOperator/serviceSetting";
import OperatorSetting from "../../pages/employeeDashboard/apiOperator/operatorSetting";
import PayoutSetting from "../../pages/employeeDashboard/apiOperator/payoutSettings";
import BBPSSettings from "../../pages/employeeDashboard/apiOperator/BBPSSettings";
import SchemeMaster from "../../pages/employeeDashboard/resources/SchemeMaster";
import TaxHistory from "../../pages/employeeDashboard/taxHistory/TaxHistory";
import FundRequest from "../../pages/employeeDashboard/fundManagement/FundRequest";
import EmployeeProfile from "../../pages/employeeDashboard/EmployeeProfile";


const EmployeeDashboard = () => {
    return (
        <EmployeeLayout>
            <Routes>
                <Route path="/" element={<EmployeeDash />} />
                <Route path="/home" element={<EmployeeDash />} />
                <Route path="/profile" element={<EmployeeProfile />} />
                <Route path="/members/user" element={<CreateWhiteLabel />} />
                <Route path="/members/list" element={<Members />} />
                <Route path="/members/rolemanagement" element={<Rolemanagement />} />
                <Route path="/bbps-settings/list" element={<BBPSSettings />} />
                <Route
                    path="/api-operator/service-settings"
                    element={<ServiceSetting />}
                />
                <Route
                    path="/api-operator/operator-settings"
                    element={<OperatorSetting />}
                />
                <Route
                    path="/api-operator/payout-settings"
                    element={<PayoutSetting />}
                />
                <Route path="/resources/schemamaster" element={<SchemeMaster />} />
                <Route path="/txn-history" element={<TaxHistory />} />
                <Route path="/fund-management/fund-request" element={<FundRequest />} />


            </Routes>

        </EmployeeLayout>
    );
};

export default EmployeeDashboard;

