import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedAuthRoute = ({ children }) => {
  const token = useSelector(state => state?.auth?.token);
  const user = useSelector(state => state?.auth?.user);
  const userRole = user?.userRole;

  // If user is already logged in, redirect to appropriate dashboard
  if (token && user) {
    const rolePaths = {
      1: '/dashboard/home',
      2: '/adminDashboard/home',
      3: '/masterDistributerDashboard/home',
      4: '/distributerDashboard/home',
      5: '/retailerDashboard/home',
      6: '/employeeDashboard/home',
    };
    
    const defaultPath = '/dashboard/home';
    const redirectPath = rolePaths[userRole] || defaultPath;
    
    return <Navigate to={redirectPath} replace />;
  }

  // If user is not logged in, show auth pages
  return children;
};

export default ProtectedAuthRoute;
