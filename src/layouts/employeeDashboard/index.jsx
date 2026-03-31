import { Routes, Route, Navigate } from "react-router-dom";
import EmployeeLayout from "./EmployeeLayout";
import EmployeeDash from "../../pages/employeeDashboard/EmployeeDash";

const EmployeeDashboard = () => {
    return (
        <EmployeeLayout>
            <Routes>
                <Route path="/" element={<EmployeeDash />} />
                <Route path="/home" element={<EmployeeDash />} />
            </Routes>
        </EmployeeLayout>
    );
};

export default EmployeeDashboard;

