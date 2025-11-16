import React, { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import secureLocalStorage from 'react-secure-storage';

const ProtectedRoute = ({ children, role }) => {
  // Prefer secure storage values, fallback to redux
  const reduxToken = useSelector(state => state?.auth?.token);
  const reduxUser = useSelector(state => state?.auth?.user);

  const { token, user, userRole } = useMemo(() => {
    try {
      const storageToken = secureLocalStorage.getItem('userToken');
      const storageUserRaw = secureLocalStorage.getItem('userData');
      const storageUser = storageUserRaw
        ? (typeof storageUserRaw === 'string' ? JSON.parse(storageUserRaw) : storageUserRaw)
        : null;
      const roleFromStorage = storageUser?.userRole;
      return {
        token: storageToken || reduxToken,
        user: storageUser ? { user: storageUser } : reduxUser,
        userRole: roleFromStorage ?? (reduxUser?.user?.userRole),
      };
    } catch (e) {
      return {
        token: reduxToken,
        user: reduxUser,
        userRole: reduxUser?.user?.userRole,
      };
    }
  }, [reduxToken, reduxUser]);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!userRole) return;
    
    const roleRedirectPaths = {
      1: '/superDashboard/home',
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
