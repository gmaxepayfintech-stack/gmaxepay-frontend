import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import secureLocalStorage from "react-secure-storage";
import { getLocationAndIP } from "../../util/getLocationAndIP";
import { useNotification } from "../../context/NotificationContext";
import { useCompany } from "../../context/CompanyContext";
import {
  loginStatus,
  verificationStatus,
  authOtp,
  rescendOtp,
  resetPassword,
} from "../../redux/action/loginAction";
import { loginSuccess } from "../../redux/action/authAction";
import LeftSideSlider from "./pages/LeftSideSlider";
import LoginView from "./pages/LoginView";
import ForgotPasswordView from "./pages/ForgotPasswordView";
import OtpVerifyView from "./pages/OtpVerifyView";
import VerificationCodeView from "./pages/VerificationCodeView";
import Require2FAView from "./pages/Require2FAView";
import Auth2FAView from "./pages/Auth2FAView";
import ResetPasswordView from "./pages/ResetPasswordView";

// View types
const VIEWS = {
  LOGIN: "login",
  FORGOT_PASSWORD: "forgotPassword",
  VERIFICATION_CODE: "verificationCode",
  OTP_VERIFY: "otpVerify",
  REQUIRE_2FA: "require2FA",
  AUTH_2FA: "auth2FA",
  RESET_PASSWORD: "resetPassword",
};

const LoginDesign1 = () => {
  const [currentView, setCurrentView] = useState(VIEWS.LOGIN);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [submittedPhone, setSubmittedPhone] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [qrData, setQrData] = useState(null);
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [otpTimer, setOtpTimer] = useState(180);
  const [verificationTimer, setVerificationTimer] = useState(180);
  const [currentIndex, setCurrentIndex] = useState(0);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { company } = useCompany();

  const otpInputRefs = useRef([]);
  const auth2FAInputRefs = useRef([]);
  const processedLoginRef = useRef(false);
  const processedVerificationRef = useRef(false);

  // Redux selectors
  const loginData = useSelector((state) => state?.login?.loginResponse);
  const loginError = useSelector((state) => state?.login?.error);
  const loginResponseData = useSelector(
    (state) => state?.login?.loginResponse?.data
  );
  const verificationResponse = useSelector(
    (state) => state?.login?.verificationcode?.data
  );
  const verificationStatusdata = useSelector(
    (state) => state?.login?.verificationcode?.status
  );
  const verificationError = useSelector(
    (state) => state?.login?.verificationError
  );
  const factresponse = useSelector(
    (state) => state?.login?.twoFactorAuth?.data?.accessToken || state?.login?.twoFactorAuth?.accessToken
  );
  const usedata = useSelector(
    (state) => state?.login?.twoFactorAuth?.data?.user || state?.login?.twoFactorAuth?.user
  );
  const factstatus = useSelector((state) => state?.login?.twoFactorAuth?.status);
  const twoFactorAuthData = useSelector((state) => state?.login?.twoFactorAuth);
  const twoFactorAuthError = useSelector((state) => state?.login?.twoFactorAuthError);
  const resetPasswordResponse = useSelector((state) => state?.login?.resetPasswordResponse);
  const resetPasswordError = useSelector((state) => state?.login?.resetPasswordError);

  // Image slider effect
  useEffect(() => {
    if (company?.sliderImages && company.sliderImages.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % company.sliderImages.length);
      }, 5000);
      return () => clearInterval(interval);
    } else {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % 2);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [company?.sliderImages]);

  // OTP Timer (only for login OTP verify, not for forgot password)
  useEffect(() => {
    if (otpTimer > 0 && currentView === VIEWS.OTP_VERIFY) {
      const interval = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [otpTimer, currentView]);

  // Verification Timer
  useEffect(() => {
    if (verificationTimer > 0 && currentView === VIEWS.VERIFICATION_CODE) {
      const interval = setInterval(
        () => setVerificationTimer((prev) => prev - 1),
        1000
      );
      return () => clearInterval(interval);
    }
  }, [verificationTimer, currentView]);

  // Handle login errors
  useEffect(() => {
    if (loginError) {
      const errorMessage = typeof loginError === 'object' ? loginError.message : loginError;
      const isTokenExpired = typeof loginError === 'object' && loginError.isTokenExpired;
      
      // If login token expired, immediately redirect to step 1
      if (isTokenExpired) {
        secureLocalStorage.removeItem("loginToken");
        secureLocalStorage.removeItem("userToken");
        setCurrentView(VIEWS.LOGIN);
        setOtp(Array(6).fill(""));
        setSubmittedPhone("");
        setPhoneNumber("");
        processedLoginRef.current = false;
      }
      
      showNotification({
        type: "error",
        message: errorMessage,
        duration: 6000,
        clearExisting: true, // Clear existing notifications for errors
      });
    }
  }, [loginError, showNotification]);

  // Handle OTP verification errors (handles both verificationError and FAILURE status)
  useEffect(() => {
    if ((currentView === VIEWS.OTP_VERIFY || currentView === VIEWS.VERIFICATION_CODE)) {
      // Check for verificationError first (from reducer)
      if (verificationError) {
        const errorMessage = typeof verificationError === 'object' ? verificationError.message : verificationError;
        const isTokenExpired = typeof verificationError === 'object' && verificationError.isTokenExpired;
        
        // If login token expired, immediately redirect to step 1
        if (isTokenExpired) {
          secureLocalStorage.removeItem("loginToken");
          secureLocalStorage.removeItem("userToken");
          setCurrentView(VIEWS.LOGIN);
          setOtp(Array(6).fill(""));
          setSubmittedPhone("");
          setPhoneNumber("");
          processedVerificationRef.current = false;
        }
        
        showNotification({
          type: "error",
          message: errorMessage,
          duration: 6000,
          clearExisting: true, // Clear existing notifications for errors
        });
      }
      // Also check for FAILURE status in verificationStatusdata
      else if (verificationStatusdata === "FAILURE") {
        const errorMessage = verificationResponse?.message || verificationResponse?.data?.message || "OTP verification failed. Please try again.";
        showNotification({
          type: "error",
          message: errorMessage,
          duration: 6000,
          clearExisting: true, // Clear existing notifications for errors
        });
      }
    }
  }, [verificationError, verificationStatusdata, verificationResponse, currentView, showNotification]);

  // Handle reset password errors
  useEffect(() => {
    if (resetPasswordError) {
      const errorMessage = typeof resetPasswordError === 'object' ? resetPasswordError.message : resetPasswordError;
      const isTokenExpired = typeof resetPasswordError === 'object' && resetPasswordError.isTokenExpired;
      
      // If login token expired, immediately redirect to step 1
      if (isTokenExpired) {
        secureLocalStorage.removeItem("loginToken");
        secureLocalStorage.removeItem("userToken");
        setCurrentView(VIEWS.LOGIN);
        setOtp(Array(6).fill(""));
        setSubmittedPhone("");
        setPhoneNumber("");
      }
      
      showNotification({
        type: "error",
        message: errorMessage,
        duration: 6000,
        clearExisting: true, // Clear existing notifications for errors
      });
    }
  }, [resetPasswordError, showNotification]);

  // Handle login response
  useEffect(() => {
    if (!loginData || processedLoginRef.current) return;

    // Check for FAILURE status or error status codes (like 429) in login response
    // The status can be in loginData.status or loginData.loginResponse?.status
    const status = loginData.status || loginData.loginResponse?.status || loginData.data?.status;
    if (status === "FAILURE" || (typeof status === "number" && status !== 200 && status !== "SUCCESS")) {
      const errorMessage = loginData?.message || loginData?.loginResponse?.message || loginData?.data?.message || "Login failed. Please try again.";
      showNotification({
        type: "error",
        message: errorMessage,
        duration: 6000,
        clearExisting: true, // Clear existing notifications for errors
      });
      processedLoginRef.current = true;
      return;
    }

    if (status === "SUCCESS" || status === 200) {
      processedLoginRef.current = true;
      const loginResponse =
        loginData?.loginResponse?.data || loginData?.data || loginResponseData || {};
      // Check for requiresPasswordReset in multiple possible locations
      const requiresPasswordReset = !!(
        loginResponse?.requiresPasswordReset || 
        loginData?.data?.requiresPasswordReset || 
        loginData?.loginResponse?.data?.requiresPasswordReset
      );
      const requiresOtp = !!loginResponse?.requiresOtpVerify;
      const requires2FA = !!loginResponse?.requires2FA;
      const requiresSetup2FA = !!loginResponse?.requiresSetup2FA;

      // Check for password reset requirement first
      if (requiresPasswordReset) {
        // Store the token from login response for password reset
        // Token can be in: loginResponse.token, loginData.data.token, or loginData.token
        const token = loginResponse?.token || loginData?.data?.token || loginData?.token || loginData?.loginResponse?.data?.token;
        if (token) {
          secureLocalStorage.setItem("loginToken", token);
        }
        setCurrentView(VIEWS.RESET_PASSWORD);
        return;
      }

      if (requiresOtp) {
        setOtp(Array(6).fill(""));
        setOtpTimer(180);
        setCurrentView(VIEWS.OTP_VERIFY);
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 100);
        return;
      }

      if (requiresSetup2FA || requires2FA) {
        const qrCode = loginResponse?.qrCode;
        if (qrCode) {
          setQrData(qrCode);
          setOtp(Array(6).fill(""));
          setCurrentView(VIEWS.REQUIRE_2FA);
        } else {
          setOtp(Array(6).fill(""));
          setCurrentView(VIEWS.AUTH_2FA);
          setTimeout(() => {
            auth2FAInputRefs.current[0]?.focus();
          }, 100);
        }
        return;
      }

      // Don't navigate here - wait for JWT token after 2FA verification
      // Only navigate if we have JWT token (which comes after 2FA)
      // For now, just proceed to next step (OTP, 2FA setup, etc.)
    }
  }, [loginData, loginResponseData, navigate, showNotification]);

  // Reset processed flag only when loginData actually changes (not on every status change)
  useEffect(() => {
    // Only reset if we're not currently on OTP_VERIFY or other intermediate views
    // This prevents the view from resetting when we're already on step 2
    if (currentView === VIEWS.LOGIN && loginData) {
      processedLoginRef.current = false;
    }
  }, [loginData, currentView]);

  // Handle OTP verification response
  useEffect(() => {
    if (verificationStatusdata === "SUCCESS" && verificationResponse && !processedVerificationRef.current) {
      processedVerificationRef.current = true;
      
      // Show success notification first (with onClose callback to navigate after notification closes)
      if (currentView === VIEWS.OTP_VERIFY || currentView === VIEWS.VERIFICATION_CODE) {
        const successMessage = verificationResponse?.message || verificationResponse?.data?.message || "OTP verified successfully!";
        
        showNotification({
          type: "success",
          message: successMessage,
          duration: 3000,
          clearExisting: false, // Don't clear existing notifications
          onClose: () => {
            // Navigate/change view only after notification closes
            if (currentView === VIEWS.OTP_VERIFY) {
              // After login OTP, check if password reset is required
              const responseData = verificationResponse?.data || verificationResponse;
              const requiresPasswordReset = responseData?.requiresPasswordReset || verificationResponse?.requiresPasswordReset;
              
              if (requiresPasswordReset) {
                setCurrentView(VIEWS.RESET_PASSWORD);
                return;
              }

              // Check if 2FA is required
              const requires2FA = responseData?.requires2FA || verificationResponse?.requires2FA;
              const requiresSetup2FA = responseData?.requiresSetup2FA || verificationResponse?.requiresSetup2FA;
              const qrCode = responseData?.qrCode || verificationResponse?.qrCode;
              
              if (requiresSetup2FA || requires2FA) {
                if (qrCode) {
                  setQrData(qrCode);
                  setOtp(Array(6).fill(""));
                  setCurrentView(VIEWS.REQUIRE_2FA);
                } else {
                  setOtp(Array(6).fill(""));
                  setCurrentView(VIEWS.AUTH_2FA);
                  setTimeout(() => {
                    auth2FAInputRefs.current[0]?.focus();
                  }, 100);
                }
              } else {
                // Check if we have JWT token (accessToken) - only navigate if JWT exists
                const jwtToken = secureLocalStorage.getItem("userToken");
                if (jwtToken) {
                  const rolePaths = {
                    1: "/superDashboard/home",
                    2: "/adminDashBoard/home",
                    3: "/masterDistributerDashboard/home",
                    4: "/distributerDashboard/home",
                    5: "/retailerDashboard/home",
                    6: "/employeeDashboard/home",
                  };
                  const userRole = responseData?.userRole || verificationResponse?.userRole;
                  navigate(rolePaths[userRole] || "/superDashboard/home");
                }
                // If no JWT token, stay on current view (might need 2FA)
              }
            } else if (currentView === VIEWS.VERIFICATION_CODE) {
              // After forgot password OTP, check if password reset is required
              const responseData = verificationResponse?.data || verificationResponse;
              const requiresPasswordReset = responseData?.requiresPasswordReset || verificationResponse?.requiresPasswordReset;
              
              if (requiresPasswordReset) {
                setCurrentView(VIEWS.RESET_PASSWORD);
                return;
              }
              
              // Check if 2FA is needed
              const requires2FA = responseData?.requires2FA || verificationResponse?.requires2FA;
              const requiresSetup2FA = responseData?.requiresSetup2FA || verificationResponse?.requiresSetup2FA;
              const qrCode = responseData?.qrCode || verificationResponse?.qrCode;
              
              if (requiresSetup2FA || requires2FA) {
                if (qrCode) {
                  setQrData(qrCode);
                  setOtp(Array(6).fill(""));
                  setCurrentView(VIEWS.REQUIRE_2FA);
                } else {
                  setOtp(Array(6).fill(""));
                  setCurrentView(VIEWS.AUTH_2FA);
                  setTimeout(() => {
                    auth2FAInputRefs.current[0]?.focus();
                  }, 100);
                }
              }
            }
          },
        });
      }
    }
  }, [verificationStatusdata, verificationResponse, currentView, navigate, showNotification]);

  // Reset processed verification flag when view changes
  useEffect(() => {
    if (currentView === VIEWS.OTP_VERIFY || currentView === VIEWS.VERIFICATION_CODE) {
      processedVerificationRef.current = false;
    }
  }, [currentView]);

  // Reset processed flag when verification status changes
  useEffect(() => {
    if (verificationStatusdata !== "SUCCESS") {
      processedVerificationRef.current = false;
    }
  }, [verificationStatusdata]);

  // Handle 2FA response
  useEffect(() => {
    if (factstatus === "SUCCESS" && factresponse) {
      // Get user data from response - check multiple possible locations
      const userDataFromResponse = usedata || twoFactorAuthData?.data?.user || twoFactorAuthData?.user;
      
      // Get the success message from the response
      const successMessage = twoFactorAuthData?.message || twoFactorAuthData?.data?.message || "2FA setup successful!";
      
      // Check if token already exists in secure storage (from authOtp action)
      const existingToken = secureLocalStorage.getItem("userToken");
      const existingUserData = secureLocalStorage.getItem("userData");
      
      // If token exists, redirect immediately based on role
      if (existingToken) {
        let userRole;
        
        // Try to get role from stored userData first
        if (existingUserData) {
          try {
            const parsedUserData = JSON.parse(existingUserData);
            userRole = parsedUserData?.userRole;
          } catch (e) {
            // If parsing fails, try to get from response
            userRole = userDataFromResponse?.userRole;
          }
        } else {
          // If no stored userData, get from response
          userRole = userDataFromResponse?.userRole;
        }
        
        // If still no role, try to get from twoFactorAuthData
        if (!userRole) {
          userRole = twoFactorAuthData?.data?.user?.userRole || twoFactorAuthData?.user?.userRole;
        }
        
        const rolePaths = {
          1: "/superDashboard/home",
          2: "/adminDashBoard/home",
          3: "/masterDistributerDashboard/home",
          4: "/distributerDashboard/home",
          5: "/retailerDashboard/home",
          6: "/employeeDashboard/home",
        };
        
        // Dispatch loginSuccess with user data
        dispatch(
          loginSuccess({
            token: factresponse || existingToken,
            user: userDataFromResponse || (existingUserData ? JSON.parse(existingUserData) : null),
          })
        );
        
        // Navigate based on role
        navigate(rolePaths[userRole] || "/superDashboard/home");
        return;
      }
      
      // If no token yet, show notification and wait for token to be stored
      if (userDataFromResponse) {
        showNotification({
          type: "success",
          message: successMessage,
          duration: 3000,
          clearExisting: false, // Don't clear existing notifications
          onClose: () => {
            // Navigate only after notification closes
            // JWT token should be stored in secureLocalStorage by authOtp action
            const jwtToken = secureLocalStorage.getItem("userToken");
            const storedUserData = secureLocalStorage.getItem("userData");
            
            if (jwtToken) {
              dispatch(
                loginSuccess({
                  token: factresponse || jwtToken,
                  user: userDataFromResponse || (storedUserData ? JSON.parse(storedUserData) : null),
                })
              );
              
              // Get role from userData
              const userRole = userDataFromResponse?.userRole || (storedUserData ? JSON.parse(storedUserData)?.userRole : null);
              
              const rolePaths = {
                1: "/superDashboard/home",
                2: "/adminDashBoard/home",
                3: "/masterDistributerDashboard/home",
                4: "/distributerDashboard/home",
                5: "/retailerDashboard/home",
                6: "/employeeDashboard/home",
              };
              
              navigate(rolePaths[userRole] || "/superDashboard/home");
            }
          },
        });
      }
    }
  }, [factstatus, factresponse, usedata, twoFactorAuthData, dispatch, navigate, showNotification]);

  // Handle 2FA errors
  useEffect(() => {
    if (twoFactorAuthError && (currentView === VIEWS.AUTH_2FA || currentView === VIEWS.REQUIRE_2FA)) {
      const errorMessage = typeof twoFactorAuthError === 'object' ? twoFactorAuthError.message : twoFactorAuthError;
      const isTokenExpired = typeof twoFactorAuthError === 'object' && twoFactorAuthError.isTokenExpired;
      
      // If login token expired, immediately redirect to step 1
      if (isTokenExpired) {
        secureLocalStorage.removeItem("loginToken");
        secureLocalStorage.removeItem("userToken");
        setCurrentView(VIEWS.LOGIN);
        setOtp(Array(6).fill(""));
        setSubmittedPhone("");
        setPhoneNumber("");
        setQrData(null);
      }
      
      showNotification({
        type: "error",
        message: errorMessage,
        duration: 6000,
        clearExisting: true, // Clear existing notifications for errors
      });
    }
  }, [twoFactorAuthError, currentView, showNotification]);

  // Handle reset password response
  useEffect(() => {
    if (resetPasswordResponse?.status === "SUCCESS") {
      const successMessage = resetPasswordResponse?.message || "Password reset successful!";
      
      // Show notification first (with onClose callback to navigate after notification closes)
      showNotification({
        type: "success",
        message: successMessage,
        duration: 3000,
        clearExisting: false, // Don't clear existing notifications
        onClose: () => {
          // Navigate only after notification closes
          // Check if we have JWT token (after password reset might get JWT or continue with login token)
          const jwtToken = secureLocalStorage.getItem("userToken");
          const responseData = resetPasswordResponse?.data || resetPasswordResponse;
          const userRole = responseData?.userRole;
          
          if (jwtToken && userRole) {
            // JWT token exists, navigate to dashboard
            const rolePaths = {
              1: "/superDashboard/home",
              2: "/adminDashBoard/home",
              3: "/masterDistributerDashboard/home",
              4: "/distributerDashboard/home",
              5: "/retailerDashboard/home",
              6: "/employeeDashboard/home",
            };
            navigate(rolePaths[userRole] || "/superDashboard/home");
          } else if (userRole) {
            // User role exists but no JWT - might need 2FA, stay on current view
            // Check if 2FA is required
            const requires2FA = responseData?.requires2FA || resetPasswordResponse?.requires2FA;
            const requiresSetup2FA = responseData?.requiresSetup2FA || resetPasswordResponse?.requiresSetup2FA;
            const qrCode = responseData?.qrCode || resetPasswordResponse?.qrCode;
            
            if (requiresSetup2FA || requires2FA) {
              if (qrCode) {
                setQrData(qrCode);
                setOtp(Array(6).fill(""));
                setCurrentView(VIEWS.REQUIRE_2FA);
              } else {
                setOtp(Array(6).fill(""));
                setCurrentView(VIEWS.AUTH_2FA);
                setTimeout(() => {
                  auth2FAInputRefs.current[0]?.focus();
                }, 100);
              }
            } else {
              // No 2FA required but no JWT - go back to login
              setCurrentView(VIEWS.LOGIN);
            }
          } else {
            setCurrentView(VIEWS.LOGIN);
          }
        },
      });
    }
  }, [resetPasswordResponse, navigate, showNotification]);

  // Login form submission
  const handleLoginSubmit = async (values, { setSubmitting }) => {
    try {
      const locationIPData = await getLocationAndIP();

      if (
        !locationIPData.location.latitude ||
        !locationIPData.location.longitude
      ) {
        showNotification({
          type: "warning",
          message: "Please allow location to proceed with login.",
          duration: 6000,
        });
      }

      const payload = {
        mobileNo: values.phoneNumber,
        password: values.password,
        latitude: locationIPData.location.latitude || "",
        longitude: locationIPData.location.longitude || "",
        userType: "1",
      };
      setSubmittedPhone(values.phoneNumber);

      const companyId = company?._id || company?.id || company?.companyId;
      dispatch(loginStatus(payload, companyId));
    } catch (error) {
      showNotification({
        type: "error",
        message: error.response?.data?.message || "Login failed. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Forgot password submission
  const handleForgotPasswordSubmit = (values) => {
    setPhoneNumber(values.phoneNumber);
    setOtp(Array(6).fill(""));
    setCurrentView(VIEWS.VERIFICATION_CODE);
    setVerificationTimer(180);
    setTimeout(() => {
      otpInputRefs.current[0]?.focus();
    }, 100);
  };

  // OTP input handlers
  const handleOtpChange = (value, index, refs) => {
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) refs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e, index, refs) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  // Handle paste for OTP - split 6-digit code across boxes
  const handleOtpPaste = (e, refs) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const digits = pastedData.replace(/\D/g, "").slice(0, 6);
    
    if (digits.length > 0) {
      const newOtp = Array(6).fill("");
      for (let i = 0; i < digits.length && i < 6; i++) {
        newOtp[i] = digits[i];
      }
      setOtp(newOtp);
      
      const focusIndex = Math.min(digits.length, 5);
      setTimeout(() => {
        refs.current[focusIndex]?.focus();
      }, 0);
    }
  };

  // OTP submit
  const handleOtpSubmit = () => {
    const finalOtp = otp.join("");
    if (finalOtp.length !== 6) {
      showNotification({
        type: "error",
        message: "Please enter a valid 6-digit OTP",
      });
      return;
    }
    const companyId = company?._id || company?.id || company?.companyId;
    dispatch(verificationStatus({ otp: finalOtp }, companyId));
  };

  // Resend OTP
  const handleResendOtp = () => {
    const companyId = company?._id || company?.id || company?.companyId;
    dispatch(rescendOtp(companyId));
    setOtpTimer(180);
    setOtp(Array(6).fill(""));
  };

  // Resend Verification Code
  const handleResendVerification = () => {
    setVerificationTimer(180);
    setOtp(Array(6).fill(""));
  };

  // 2FA OTP handlers
  const handleAuth2FAChange = (value, index) => {
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) auth2FAInputRefs.current[index + 1]?.focus();
    }
  };

  const handleAuth2FAKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      auth2FAInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste for 2FA - split 6-digit code across boxes
  const handleAuth2FAPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const digits = pastedData.replace(/\D/g, "").slice(0, 6);
    
    if (digits.length > 0) {
      const newOtp = Array(6).fill("");
      for (let i = 0; i < digits.length && i < 6; i++) {
        newOtp[i] = digits[i];
      }
      setOtp(newOtp);
      
      const focusIndex = Math.min(digits.length, 5);
      setTimeout(() => {
        auth2FAInputRefs.current[focusIndex]?.focus();
      }, 0);
    }
  };

  // 2FA OTP submit
  const handleAuth2FASubmit = () => {
    const finalOtp = otp.join("");
    if (finalOtp.length !== 6) {
      showNotification({
        type: "error",
        message: "Enter full 6-digit OTP",
      });
      return;
    }
    const companyId = company?._id || company?.id || company?.companyId;
    dispatch(authOtp({ otp: finalOtp }, companyId));
  };

  // Reset password submission
  const handleResetPasswordSubmit = async (values, { setSubmitting }) => {
    try {
      const payload = {
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      };
      const companyId = company?._id || company?.id || company?.companyId;
      dispatch(resetPassword(payload, companyId));
    } catch (error) {
      showNotification({
        type: "error",
        message: error.response?.data?.message || "Password reset failed. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Main render
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white overflow-hidden">
      <LeftSideSlider
        company={company}
        currentSlide={currentSlide}
        setCurrentSlide={setCurrentSlide}
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
      />

      {currentView === VIEWS.LOGIN && (
        <LoginView
          onSubmit={handleLoginSubmit}
          onForgotPassword={() => {
            setOtp(Array(6).fill(""));
            setCurrentView(VIEWS.FORGOT_PASSWORD);
          }}
        />
      )}

      {currentView === VIEWS.FORGOT_PASSWORD && (
        <ForgotPasswordView
          onSubmit={handleForgotPasswordSubmit}
          onBack={() => {
            setOtp(Array(6).fill(""));
            setCurrentView(VIEWS.LOGIN);
          }}
        />
      )}

      {currentView === VIEWS.OTP_VERIFY && (
        <OtpVerifyView
          otp={otp}
          setOtp={setOtp}
          otpTimer={otpTimer}
          onOtpChange={handleOtpChange}
          onOtpKeyDown={handleOtpKeyDown}
          onOtpPaste={handleOtpPaste}
          onSubmit={handleOtpSubmit}
          onResend={handleResendOtp}
          submittedPhone={submittedPhone}
          otpInputRefs={otpInputRefs}
        />
      )}

      {currentView === VIEWS.VERIFICATION_CODE && (
        <VerificationCodeView
          otp={otp}
          setOtp={setOtp}
          verificationTimer={verificationTimer}
          onOtpChange={handleOtpChange}
          onOtpKeyDown={handleOtpKeyDown}
          onOtpPaste={handleOtpPaste}
          onSubmit={handleOtpSubmit}
          onResend={handleResendVerification}
          phoneNumber={phoneNumber}
          otpInputRefs={otpInputRefs}
        />
      )}

      {currentView === VIEWS.REQUIRE_2FA && (
        <Require2FAView
          qrData={qrData}
          onNext={() => {
            setOtp(Array(6).fill(""));
            setCurrentView(VIEWS.AUTH_2FA);
            setTimeout(() => {
              auth2FAInputRefs.current[0]?.focus();
            }, 100);
          }}
        />
      )}

      {currentView === VIEWS.AUTH_2FA && (
        <Auth2FAView
          otp={otp}
          onAuth2FAChange={handleAuth2FAChange}
          onAuth2FAKeyDown={handleAuth2FAKeyDown}
          onAuth2FAPaste={handleAuth2FAPaste}
          onSubmit={handleAuth2FASubmit}
          auth2FAInputRefs={auth2FAInputRefs}
        />
      )}

      {currentView === VIEWS.RESET_PASSWORD && (
        <ResetPasswordView onSubmit={handleResetPasswordSubmit} />
      )}
    </div>
  );
};

export default LoginDesign1;
