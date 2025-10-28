import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children, role }) => {
  const token = useSelector(state => state?.auth?.token);
  const user = useSelector(state => state?.auth?.user);
  const userRole = user?.userRole;
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!userRole) return;
    
    const roleRedirectPaths = {
      1: '/superAdminDashboard/home',
      2: '/adminDashboard/home',
      3: '/masterDistributerDashboard/home',
      4: '/distributerDashboard/home',
      5: '/retailerDashboard/home',
      6: '/employeeDashboard/home',
    };
    const getRoleValue = role => {
      const roles = {
        'super-admin': 1,
        'admin': 2,
        'master-distributer': 3,
        'distributer': 4,
        'retailer': 5,
        'employee': 6,
      };
      return roles[role];
    };

    const requiredRoleValue = getRoleValue(role);
    
    // Only redirect if user has a role and it doesn't match the required role
    if (userRole && userRole !== requiredRoleValue && userRole in roleRedirectPaths) {
      navigate(roleRedirectPaths[userRole]);
    }
  }, [userRole, role, navigate]);
  if (!token && !user) {
    return <Navigate to='/auth/login' />;
  }
  const getRoleValue = role => {
    const roles = {
      'super-admin': 1,
      'admin': 2,
      'master-distributer': 3,
      'distributer': 4,
      'retailer': 5,
      'employee': 6
    };
    return roles[role];
  };

  if (userRole === getRoleValue(role)) {
    return children;
  }

  return <Navigate to='/auth/login' />;
};

export default ProtectedRoute;
