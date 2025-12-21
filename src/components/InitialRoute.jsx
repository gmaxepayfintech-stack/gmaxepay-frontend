import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import secureLocalStorage from "react-secure-storage";
import { getUserProfile } from "../redux/action/userProfileAction";
import { getHomePageComponent } from "../util/domainToHomePage";
import { loginSuccess } from "../redux/action/authAction";

const InitialRoute = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const hasInitialized = useRef(false);
  const hasRedirected = useRef(false);
  const hasStartedProfileCheck = useRef(false);
  const { unauthorized, profile, loading } = useSelector((state) => state.userProfile);

  useEffect(() => {
    // Prevent multiple initializations
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initializeApp = () => {
      // Check for home page component first
      const currentDomain = window.location.hostname;
      const HomePageComponent = getHomePageComponent(currentDomain);
      
      if (HomePageComponent) {
        // Home page component exists, render it (no redirect needed)
        return;
      }

      // Check if JWT token and userData exist in secureLocalStorage
      const jwtToken = secureLocalStorage.getItem("userToken");
      const userData = secureLocalStorage.getItem("userData");
      const loginToken = secureLocalStorage.getItem("loginToken");

      // If both userToken and userData exist, navigate directly to dashboard based on role
      // Don't redirect if loginToken exists (user is in the middle of login flow)
      if (jwtToken && userData && !loginToken) {
        try {
          const parsedUserData = typeof userData === 'string' ? JSON.parse(userData) : userData;
          const userRole = parsedUserData?.userRole;
          
          // Dispatch loginSuccess to update Redux state
          dispatch(
            loginSuccess({
              token: jwtToken,
              user: parsedUserData,
            })
          );
          
          const rolePaths = {
            1: "/superDashboard/home",
            2: "/adminDashboard/home",
            3: "/masterDistributerDashboard/home",
            4: "/distributerDashboard/home",
            5: "/retailerDashboard/home",
            6: "/employeeDashboard/home",
          };
          
          if (!hasRedirected.current) {
            const currentPath = location.pathname;
            const defaultPath = rolePaths[userRole] || "/superDashboard/home";
            
            // Check if user is already on a valid dashboard route for their role
            const isValidDashboardRoute = 
              (currentPath.startsWith(`/superDashboard`) && userRole === 1) ||
              (currentPath.startsWith(`/adminDashboard`) && userRole === 2) ||
              (currentPath.startsWith(`/masterDistributerDashboard`) && userRole === 3) ||
              (currentPath.startsWith(`/distributerDashboard`) && userRole === 4) ||
              (currentPath.startsWith(`/retailerDashboard`) && userRole === 5) ||
              (currentPath.startsWith(`/employeeDashboard`) && userRole === 6);
            
            // Only redirect if on root path "/" 
            // If already on a valid dashboard route, don't redirect - let it render
            if (currentPath === "/") {
              hasRedirected.current = true;
              navigate(defaultPath, { replace: true });
            }
            // If already on valid route, don't redirect - allow route to render normally
          }
          return;
        } catch (e) {
          // If parsing fails, continue with profile check
          console.error("Error parsing userData:", e);
          // Remove invalid data
          secureLocalStorage.removeItem("userData");
          secureLocalStorage.removeItem("userToken");
        }
      }

      // Don't interfere if we're on the login page and loginToken exists (user is in login flow)
      if (window.location.pathname === "/auth/login" && loginToken) {
        return;
      }

      // If no JWT token exists, redirect to login (unless loginToken exists and we're in login flow)
      if (!jwtToken) {
        // If loginToken exists, user is in login flow - don't redirect
        if (loginToken) {
          // User is in the middle of login flow, don't interfere
          return;
        }
        // No tokens at all, redirect to login
        if (!hasRedirected.current) {
          hasRedirected.current = true;
          navigate("/auth/login", { replace: true });
        }
        return;
      }

      // JWT token exists but no userData, validate it by fetching user profile
      // This will automatically handle unauthorized/expired tokens
      hasStartedProfileCheck.current = true;
      dispatch(getUserProfile());
    };

    initializeApp();
  }, [dispatch, navigate, location.pathname]);

  // Handle redirect based on profile validation result
  useEffect(() => {
    // Don't redirect if already redirected or if we have a home page component
    if (hasRedirected.current) return;

    // Don't interfere if we're already on the login page
    if (window.location.pathname === "/auth/login") {
      return;
    }

    const currentDomain = window.location.hostname;
    const HomePageComponent = getHomePageComponent(currentDomain);
    
    if (HomePageComponent) {
      // Home page component exists, don't redirect
      return;
    }

    // Only check redirect after we've started the profile check
    // This prevents immediate redirect when loading is initially false
    if (!hasStartedProfileCheck.current) return;

    // Wait for profile check to complete (loading must be false)
    if (!loading) {
      if (unauthorized) {
        // Token is expired or invalid, redirect to login
        if (!hasRedirected.current) {
          hasRedirected.current = true;
          navigate("/auth/login", { replace: true });
        }
      } else if (profile) {
        // Token is valid and profile loaded, redirect to dashboard based on role
        if (!hasRedirected.current) {
          const userRole = profile?.userRole;
          const rolePaths = {
            1: "/superDashboard/home",
            2: "/adminDashboard/home",
            3: "/masterDistributerDashboard/home",
            4: "/distributerDashboard/home",
            5: "/retailerDashboard/home",
            6: "/employeeDashboard/home",
          };
          const currentPath = location.pathname;
          const defaultPath = rolePaths[userRole] || "/superDashboard/home";
          
          // Check if user is already on a valid dashboard route for their role
          const isValidDashboardRoute = 
            (currentPath.startsWith(`/superDashboard`) && userRole === 1) ||
            (currentPath.startsWith(`/adminDashboard`) && userRole === 2) ||
            (currentPath.startsWith(`/masterDistributerDashboard`) && userRole === 3) ||
            (currentPath.startsWith(`/distributerDashboard`) && userRole === 4) ||
            (currentPath.startsWith(`/retailerDashboard`) && userRole === 5) ||
            (currentPath.startsWith(`/employeeDashboard`) && userRole === 6);
          
          // Only redirect if on root path "/"
          // If already on a valid dashboard route, don't redirect - let it render
          if (currentPath === "/") {
            hasRedirected.current = true;
            navigate(defaultPath, { replace: true });
          }
          // If already on valid route, don't redirect - allow route to render normally
        }
      } else {
        // No profile and not unauthorized - token might be invalid or error occurred
        // Redirect to login as a safety measure
        if (!hasRedirected.current) {
          hasRedirected.current = true;
          navigate("/auth/login", { replace: true });
        }
      }
    }
  }, [unauthorized, profile, loading, navigate, location.pathname]);

  // Check for home page component - render it if it exists
  const currentDomain = window.location.hostname;
  const HomePageComponent = getHomePageComponent(currentDomain);

  if (HomePageComponent) {
    return <HomePageComponent />;
  }

  // Show loading state while checking token
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F5F7F8]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#039155]"></div>
      </div>
    );
  }

  // Return null while redirecting (navigation will happen via useEffect)
  return null;
};

export default InitialRoute;


