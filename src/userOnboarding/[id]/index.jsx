import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useCompany } from "../../context/CompanyContext";
import { getPendingSteps } from "../../redux/action/retailerOnboardingAction";
import { useSelector, useDispatch } from "react-redux";
import secureLocalStorage from "react-secure-storage";

import Step1 from "../step1";
import Step2 from "../step2";
import Step3 from "../step3";
import Step4 from "../step4";
import Step5 from "../step5";
import Step6 from "../step6";
import Step7 from "../step7";

const STEP_INFO = [
  { key: "mobileVerification", label: "Mobile Verification" },
  { key: "emailVerification", label: "Email Verification" },
  { key: "aadharVerification", label: "Aadhaar Verification" },
  { key: "panVerification", label: "PAN Card Verification" },
  { key: "shopDetails", label: "Shop Information" },
  { key: "bankVerification", label: "Bank Account Details" },
  { key: "profile", label: "Profile Photo" },
];

function OnboardingRetailerById({ referralCode: propReferralCode }) {
  const { referCode: urlReferralCode } = useParams();
  const dispatch = useDispatch();
  const { company, loading: companyLoading } = useCompany();
  const companyFromRedux = useSelector((state) => state?.company?.company);
  const companyData = companyFromRedux || company;
  const primaryColor = companyData?.primaryColor || "#039155";

  // Helper to get company ID
  const getCompanyId = () => {
    return companyData?.companyId || companyData?._id || companyData?.id || null;
  };

  // Helper to get company domain
  const getCompanyDomain = () => {
    return companyData?.domain || companyData?.companyDomain || null;
  };

  // Get referral code from URL params, props, or localStorage (optional)
  const getInitialReferralCode = () => {
    if (urlReferralCode) return urlReferralCode.toUpperCase();
    if (propReferralCode) return propReferralCode;
    try {
      const stored = localStorage.getItem("referralCodeFromUrl");
      if (stored) return stored;
    } catch (e) {
      console.error("Error reading referral code from localStorage:", e);
    }
    return null;
  };

  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [showSteps, setShowSteps] = useState(true);
  const [pendingStepsData, setPendingStepsData] = useState(null);
  const [isLoadingPending, setIsLoadingPending] = useState(false);
  const [wasShowingSteps, setWasShowingSteps] = useState(true);
  const isInitialMount = useRef(true);

  // Redux state
  const getPendingResponse = useSelector((state) => state?.retailerOnboarding?.getPendingResponse);
  const getPendingError = useSelector((state) => state?.retailerOnboarding?.getPendingError);
  const mobileOtpResponse = useSelector((state) => state?.retailerOnboarding?.OTPResponse);
  const otpSubmitResponse = useSelector((state) => state?.retailerOnboarding?.OTPSubmitResponse);
  const isLoading = useSelector((state) => state?.loading?.isLoading);

  // Form data
  const [formData, setFormData] = useState({
    phone: "",
    otp: "",
    otpSent: false,
    otpVerified: false,
    email: "",
    emailOtp: "",
    emailOtpSent: false,
    emailOtpVerified: false,
    aadhaarDocFetched: false,
    panDocFetched: false,
    digilockerLinked: false,
    shopName: "",
    shopPhotoDataUrl: "",
    bankAccountNumber: "",
    ifscCode: "",
    profilePhotoDataUrl: "",
    completed: false,
    referralCode: getInitialReferralCode(),
  });

  // Check for moveAadhaar flag and navigate to step 3
  useEffect(() => {
    try {
      const moveAadhaar = localStorage.getItem("moveAadhaar");
      const aadhaarConnected = localStorage.getItem("aadhaarConnected");
      const redirectToaddhar = sessionStorage.getItem("redirectToaddhar");
      
      if (moveAadhaar === "true" || aadhaarConnected === "true" || redirectToaddhar === "true") {
        setCurrentStep(3);
        setShowSteps(false);
        if (redirectToaddhar === "true") {
          sessionStorage.removeItem("redirectToaddhar");
        }
      }
    } catch (e) {
      console.error("Error checking moveAadhaar:", e);
    }
  }, []);

  // Check for movePan flag and navigate to step 4
  useEffect(() => {
    try {
      const movePan = localStorage.getItem("movePan");
      const panConnected = localStorage.getItem("panConnected");
      const redirectToPan = sessionStorage.getItem("redirectToPan");
      
      if (movePan === "true" || panConnected === "true" || redirectToPan === "true") {
        setCurrentStep(4);
        setShowSteps(false);
        if (redirectToPan === "true") {
          sessionStorage.removeItem("redirectToPan");
        }
      }
    } catch (e) {
      console.error("Error checking movePan:", e);
    }
  }, []);

  // Call getPending on initial load if token exists and company data is loaded
  useEffect(() => {
    const fetchPendingOnMount = async () => {
      // Wait for company data to load
      if (companyLoading) return;
      
      try {
        const token = secureLocalStorage.getItem("onboardingToken");
        const companyId = getCompanyId();
        const companyDomain = getCompanyDomain();
        
        console.log("fetchPendingOnMount - companyData:", companyData);
        console.log("fetchPendingOnMount - companyId:", companyId);
        console.log("fetchPendingOnMount - companyDomain:", companyDomain);
        console.log("fetchPendingOnMount - token:", token ? "present" : "missing");
        
        if (token && companyId && companyDomain && !isLoadingPending && !getPendingResponse) {
          setIsLoadingPending(true);
          // Set a timeout to reset loading state if API takes too long (30 seconds)
          const timeoutId = setTimeout(() => {
            setIsLoadingPending(false);
          }, 30000);
          
          try {
            await dispatch(getPendingSteps(companyData, token));
          } finally {
            clearTimeout(timeoutId);
          }
        } else {
          console.warn("fetchPendingOnMount - Missing required data:", {
            token: !!token,
            companyId: !!companyId,
            companyDomain: !!companyDomain,
            isLoadingPending,
            hasResponse: !!getPendingResponse
          });
        }
      } catch (e) {
        console.error("Error fetching pending on mount:", e);
        setIsLoadingPending(false);
      }
    };

    fetchPendingOnMount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyLoading, companyData]);

  // Call getPending API after mobile verification if token exists
  useEffect(() => {
    const checkAndFetchPending = async () => {
      // Wait for company data to load
      if (companyLoading) return;
      
      try {
        const token = secureLocalStorage.getItem("onboardingToken");
        const companyId = getCompanyId();
        const companyDomain = getCompanyDomain();
        
        // Check if mobile is verified and token exists
        const isMobileVerified = 
          otpSubmitResponse?.status === "SUCCESS" ||
          mobileOtpResponse?.OTPResponse?.status === "verified" ||
          mobileOtpResponse?.OTPResponse?.data?.status === "verified" ||
          mobileOtpResponse?.status === "SUCCESS";

        console.log("checkAndFetchPending - isMobileVerified:", isMobileVerified);
        console.log("checkAndFetchPending - companyId:", companyId);
        console.log("checkAndFetchPending - companyDomain:", companyDomain);

        if (token && companyId && companyDomain && isMobileVerified && !isLoadingPending && !getPendingResponse) {
          setIsLoadingPending(true);
          // Set a timeout to reset loading state if API takes too long (30 seconds)
          const timeoutId = setTimeout(() => {
            setIsLoadingPending(false);
          }, 30000);
          
          try {
            await dispatch(getPendingSteps(companyData, token));
          } finally {
            clearTimeout(timeoutId);
          }
        } else {
          console.warn("checkAndFetchPending - Missing required data:", {
            token: !!token,
            companyId: !!companyId,
            companyDomain: !!companyDomain,
            isMobileVerified,
            isLoadingPending,
            hasResponse: !!getPendingResponse
          });
        }
      } catch (e) {
        console.error("Error checking token for getPending:", e);
        setIsLoadingPending(false);
      }
    };

    checkAndFetchPending();
  }, [mobileOtpResponse, otpSubmitResponse, dispatch, companyData, isLoadingPending, getPendingResponse, companyLoading]);

  // Handle getPending response
  useEffect(() => {
    if (getPendingResponse?.status === "SUCCESS" && getPendingResponse?.data) {
      setPendingStepsData(getPendingResponse.data);
      setIsLoadingPending(false);
      
      // Update formData based on API response
      const data = getPendingResponse.data;
      setFormData((prev) => ({
        ...prev,
        otpVerified: data.steps?.find(s => s.key === "mobileVerification")?.done || prev.otpVerified,
        emailOtpVerified: data.steps?.find(s => s.key === "emailVerification")?.done || prev.emailOtpVerified,
        aadhaarDocFetched: data.steps?.find(s => s.key === "aadharVerification")?.done || prev.aadhaarDocFetched,
        panDocFetched: data.steps?.find(s => s.key === "panVerification")?.done || prev.panDocFetched,
        completed: data.allCompleted || prev.completed,
      }));

      // Show steps if mobile or email is verified
      if (data.steps?.find(s => s.key === "mobileVerification")?.done || 
          data.steps?.find(s => s.key === "emailVerification")?.done) {
        setShowSteps(true);
      }
    } else if (getPendingError) {
      setIsLoadingPending(false);
      console.error("Error fetching pending steps:", getPendingError);
    }
    
    // Reset loading state when we have a response (success or error)
    if (getPendingResponse || getPendingError) {
      setIsLoadingPending(false);
    }
  }, [getPendingResponse, getPendingError]);

  // Handle when coming back to steps page - no reload needed
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      setWasShowingSteps(showSteps);
      return;
    }

    // Update the previous state when showSteps changes
    setWasShowingSteps(showSteps);
  }, [showSteps, wasShowingSteps]);

  const next = () => {
    const newStep = Math.min(7, currentStep + 1);
    setCurrentStep(newStep);
  };

  const handleStepNext = () => {
    next();
    setShowSteps(true);
  };

  // Check if step is done based on API response
  const isStepDone = (step) => {
    if (pendingStepsData?.steps && Array.isArray(pendingStepsData.steps)) {
      const stepData = pendingStepsData.steps.find((s) => s.key === step.key);
      return stepData?.done || false;
    }
    
    // Fallback to formData
    switch (step.key) {
      case "mobileVerification":
        return formData.otpVerified || false;
      case "emailVerification":
        return formData.emailOtpVerified || false;
      case "aadharVerification":
        return formData.aadhaarDocFetched || false;
      case "panVerification":
        return formData.panDocFetched || false;
      case "shopDetails":
        return formData.shopName && formData.shopPhotoDataUrl;
      case "bankVerification":
        return formData.bankAccountNumber && formData.ifscCode;
      case "profile":
        return formData.profilePhotoDataUrl;
      default:
        return false;
    }
  };

  // Check if step is accessible (previous steps must be completed)
  const isStepAccessible = (stepIndex) => {
    // Step 1 is always accessible
    if (stepIndex === 0) return true;
    
    // Check if all previous steps are completed
    for (let i = 0; i < stepIndex; i++) {
      const prevStep = STEP_INFO[i];
      if (!isStepDone(prevStep)) {
        return false;
      }
    }
    return true;
  };

  const isCompleted = formData.completed || pendingStepsData?.allCompleted || false;

  const getStepIcon = (key, status = "pending") => {
    if (status === "completed") {
      switch (key) {
        case "mobileVerification":
          return "/img/green-mobile.png";
        case "emailVerification":
          return "/img/completedMail.png";
        case "aadharVerification":
          return "/img/AadhaarCompleted.png";
        case "panVerification":
          return "/img/PanCompleted.png";
        case "shopDetails":
          return "/img/completedShopDetails.png";
        case "bankVerification":
          return "/img/completedBankVerification.png";
        case "profile":
          return "/img/completedProfile.png";
        default:
          return "/img/Profile.png";
      }
    }
    
    switch (key) {
      case "mobileVerification":
        return "/img/green-mobile.png";
      case "emailVerification":
        return "/img/Email.png";
      case "aadharVerification":
        return "/img/aadhar.png";
      case "panVerification":
        return "/img/PanCard.png";
      case "shopDetails":
        return "/img/ShopDetails.png";
      case "bankVerification":
        return "/img/BankDetails.png";
      case "profile":
        return "/img/Profile.png";
      default:
        return "/img/Profile.png";
    }
  };

  return (
    <>
      {/* Loading Loader for getPendingSteps API only */}
      {(isLoadingPending || isLoading) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-2xl p-6 sm:p-8 md:p-10 max-w-md mx-4 flex flex-col items-center gap-4 sm:gap-6 shadow-2xl">
            {/* Animated Spinner */}
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20">
              <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-[#039155] border-t-transparent rounded-full animate-spin"></div>
            </div>
            
            {/* Loading Message */}
            <div className="text-center">
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-1 sm:mb-2">
                Loading
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm md:text-base px-2">
                Please wait while we fetch your KYC progress...
              </p>
            </div>
          </div>
        </div>
      )}

      <div
        className={`bg-gray-50 flex justify-center px-3 md:px-0 ${
          !showSteps ? "h-screen overflow-hidden" : "min-h-screen py-4 md:py-6"
        }`}
      >
      <div
        className={`w-full max-w-[1450px] ${
          !showSteps ? "h-full flex flex-col overflow-hidden" : ""
        }`}
      >
        {/* HEADER + STEP LIST */}
        <div
          className={`px-4 py-6 md:px-8 md:py-8 rounded-xl ${
            !showSteps ? "hidden" : "mb-6"
          }`}
        >
          {!isCompleted && showSteps && !isLoadingPending && !isLoading && (
            <>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-center text-[#1B1717] mb-2 md:mb-3">
                Complete Your KYC
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-[#1B1717] text-center mb-4 sm:mb-6 md:mb-8">
                Secure your account by completing this quick verification.
              </p>

              {/* STEP LIST */}
              <div className="w-full max-w-md mx-auto mt-4 sm:mt-6 md:mt-8 space-y-2 sm:space-y-3 md:space-y-4">
                {STEP_INFO.map((step, idx) => {
                  const done = isStepDone(step);
                  const active = currentStep === idx + 1;
                  const accessible = isStepAccessible(idx);
                  
                  let iconStatus = "pending";
                  if (done) {
                    iconStatus = "completed";
                  } else if (active) {
                    iconStatus = "in-progress";
                  }

                  return (
                    <div
                      key={step.key}
                      onClick={() => {
                        // Only allow clicking if step is accessible and not already done
                        if (accessible && !done) {
                          setCurrentStep(idx + 1);
                          setShowSteps(false);
                        }
                      }}
                      className={`flex items-center gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border shadow-sm transition-all ${
                        done 
                          ? "cursor-default bg-green-50 border-green-300" 
                          : accessible
                          ? "cursor-pointer hover:shadow-md"
                          : "cursor-not-allowed opacity-50 bg-gray-100 border-gray-200"
                      } ${
                        done
                          ? "bg-green-50 border-green-300"
                          : active && accessible
                          ? "bg-white border-gray-300 ring-2 ring-offset-2"
                          : accessible
                          ? "bg-white border-gray-200"
                          : "bg-gray-100 border-gray-200"
                      }`}
                      style={active && !done && accessible ? { ringColor: primaryColor } : {}}
                    >
                      <img
                        src={getStepIcon(step.key, iconStatus)}
                        className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 flex-shrink-0"
                        alt=""
                      />

                      <div className="flex-1 min-w-0">
                        <div
                          className={`font-medium text-sm sm:text-base md:text-xl truncate ${
                            done ? "text-green-700 font-semibold" : "text-gray-800"
                          }`}
                        >
                          {step.label}
                        </div>
                        <div className={`text-xs sm:text-sm ${
                          done ? "text-green-600" : "text-gray-500"
                        }`}>
                          {done
                            ? "Completed"
                            : active
                            ? "In progress"
                            : "Pending"}
                        </div>
                      </div>

                      {done ? (
                        <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm md:text-base font-semibold shadow-md flex-shrink-0">
                          ✓
                        </div>
                      ) : (
                        <div className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 border rounded-full flex items-center justify-center text-xs sm:text-sm md:text-base flex-shrink-0 ${
                          accessible && active
                            ? `border-green-500 text-green-600 bg-green-50` 
                            : accessible
                            ? "border-gray-300 text-gray-400"
                            : "border-gray-200 text-gray-300"
                        }`}>
                          {idx + 1}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {isCompleted && (
            <div className="text-center py-8 sm:py-10 md:py-12">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-green-700 mb-2">Completed KYC</h2>
              <p className="text-gray-600 mt-2 text-sm sm:text-base md:text-lg">
                Thank you! Your onboarding is complete.
              </p>
            </div>
          )}
        </div>

        {/* STEP CARD */}
        {!showSteps && (
          <div className="flex-1 flex flex-col justify-center items-center px-1 sm:px-2 overflow-hidden">
            {/* Back Button */}
            <div className="w-full max-w-[1450px] mb-2 sm:mb-4">
              <button
                onClick={() => {
                  try {
                    localStorage.removeItem("moveAadhaar");
                    localStorage.removeItem("aadhaarConnected");
                    sessionStorage.removeItem("redirectToaddhar");
                    localStorage.removeItem("movePan");
                    localStorage.removeItem("panConnected");
                    sessionStorage.removeItem("redirectToPan");
                  } catch (e) {
                    console.error("Error clearing verification flags:", e);
                  }
                  setShowSteps(true);
                }}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition px-2 sm:px-4 py-1 sm:py-2"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span className="text-xs sm:text-sm md:text-base">Back to Steps</span>
              </button>
            </div>
            <div className="w-full h-full">
              {currentStep === 1 && (
                <Step1 
                  formData={formData} 
                  setFormData={setFormData} 
                  onNext={handleStepNext}
                  referralCode={formData.referralCode}
                />
              )}
              {currentStep === 2 && (
                <Step2 formData={formData} setFormData={setFormData} onNext={handleStepNext} />
              )}
              {currentStep === 3 && (
                <Step3 setFormData={setFormData} onNext={handleStepNext} />
              )}
              {currentStep === 4 && (
                <Step4 formData={formData} setFormData={setFormData} onNext={handleStepNext} />
              )}
              {currentStep === 5 && (
                <Step5 formData={formData} setFormData={setFormData} onNext={handleStepNext} />
              )}
              {currentStep === 6 && (
                <Step6 formData={formData} setFormData={setFormData} onNext={handleStepNext} />
              )}
              {currentStep === 7 && (
                <Step7
                  formData={formData}
                  setFormData={setFormData}
                  onComplete={() => {
                    setFormData((d) => ({ ...d, completed: true }));
                    setShowSteps(true);
                  }}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}

export default OnboardingRetailerById;
