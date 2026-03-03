import React, { useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import secureLocalStorage from 'react-secure-storage';
import { shouldRefreshToken, refreshAccessTokenSync } from './utils/tokenRefreshManager';
import { useCompany } from './context/CompanyContext';

const ProtectedRoute = ({ children, role }) => {
  const navigate = useNavigate();
  const { company, loading: companyLoading } = useCompany();
  const refreshIntervalRef = useRef(null);

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

  // Set up interval to check token expiration every 30 seconds
  useEffect(() => {
    if (!token) {
      // Clear interval if no token
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      return;
    }

    // Wait for CompanyContext to finish loading before attempting token refresh
    if (companyLoading) {
      // Company is still loading, don't attempt refresh yet
      return;
    }

    // Function to refresh token if needed (uses shared manager to prevent duplicates)
    const checkAndRefreshToken = async () => {
      const currentToken = secureLocalStorage.getItem('userToken');
      const refreshToken = secureLocalStorage.getItem('refreshToken');
      
      if (!currentToken || !refreshToken) {
        return;
      }

      // Wait for company to be available before refreshing
      if (!company || !company.companyId) {
        console.warn('Company context not loaded yet, skipping token refresh');
        return;
      }

      // Check if token needs refresh (at 4.8 minutes before 5-minute expiry)
      // The shared refreshAccessTokenSync function handles deduplication
      if (shouldRefreshToken(currentToken)) {
        try {
          // Get companyId from company context (not stored)
          const companyId = company.companyId;
          
          if (!companyId) {
            console.warn('CompanyId is not available, skipping token refresh');
            return;
          }
          
          // Use shared refresh manager - it prevents multiple simultaneous calls
          await refreshAccessTokenSync(companyId);
        } catch (error) {
          console.error('Failed to refresh token:', error);
        }
      }
    };

    // Initial check (only after company is loaded)
    checkAndRefreshToken();

    // Set up interval to check every 30 seconds (less frequent since shared manager handles deduplication)
    refreshIntervalRef.current = setInterval(() => {
      checkAndRefreshToken();
    }, 30000); // Check every 30 seconds

    // Cleanup on unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [token, company, companyLoading]);
  
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
