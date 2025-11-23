import { useState, useEffect } from "react";
import { useParams, useSearchParams, useLocation } from "react-router-dom";
import { useCompany } from "../../context/CompanyContext";
import { referalCodeCheck } from "../../redux/action/retailerOnboardingAction";
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
  const { id, referCode: urlReferralCode } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const dispatch = useDispatch();
  const { company } = useCompany();
  const companyFromRedux = useSelector((state) => state?.company?.company);
  const companyData = companyFromRedux || company;
  const primaryColor = companyData?.primaryColor || "#039155";

  // Get referral code from URL params, props, or localStorage
  const getInitialReferralCode = () => {
    // Check if we're on /unity/:referCode route
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

  // State for referral code options
  const [showReferralOptions, setShowReferralOptions] = useState(false);
  const [referralCodeInput, setReferralCodeInput] = useState("");
  const [referralError, setReferralError] = useState("");
  const [referralLoading, setReferralLoading] = useState(false);
  const [referralCodeSelected, setReferralCodeSelected] = useState(false);

  // Check if we should show referral options on mount
  useEffect(() => {
    // Show options if URL has referral code and no code is already stored
    if (urlReferralCode) {
      try {
        const stored = localStorage.getItem("referralCodeFromUrl");
        if (!stored || stored !== urlReferralCode.toUpperCase()) {
          // No stored code or different code, show options
          setShowReferralOptions(true);
        } else {
          // Already have the same code, use it and don't show options
          setFormData((prev) => ({
            ...prev,
            referralCode: stored,
          }));
          setReferralCodeSelected(true);
        }
      } catch (e) {
        setShowReferralOptions(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // No API fetch — simple step state
  const [currentStep, setCurrentStep] = useState(1);
  const [showSteps, setShowSteps] = useState(true);

  // State for onboarding status from API
  const [onboardingStatus, setOnboardingStatus] = useState(null);
  const [stepsFromStorage, setStepsFromStorage] = useState(null);

  // Check for moveAadhaar flag and navigate to step 3
  useEffect(() => {
    try {
      const moveAadhaar = localStorage.getItem("moveAadhaar");
      const aadhaarConnected = localStorage.getItem("aadhaarConnected");
      const redirectToaddhar = sessionStorage.getItem("redirectToaddhar");
      
      if (moveAadhaar === "true" || aadhaarConnected === "true" || redirectToaddhar === "true") {
        // Navigate to step 3 (Aadhaar Verification)
        setCurrentStep(3);
        setShowSteps(false);
        // Clear sessionStorage flag if it exists
        if (redirectToaddhar === "true") {
          sessionStorage.removeItem("redirectToaddhar");
        }
      }
    } catch (e) {
      console.error("Error checking moveAadhaar:", e);
    }
  }, []);

  // Load steps from secureStorage on mount
  useEffect(() => {
    try {
      const storedSteps = secureLocalStorage.getItem("pendingStatus");
      if (storedSteps) {
        const parsed = typeof storedSteps === 'string' ? JSON.parse(storedSteps) : storedSteps;
        console.log("Loaded steps from secureStorage on mount:", parsed);
        setStepsFromStorage(parsed);
      }
      
      // Also load full onboarding data for reference
      const stored = secureLocalStorage.getItem("onboardingData");
      if (stored) {
        const parsed = typeof stored === 'string' ? JSON.parse(stored) : stored;
        setOnboardingStatus(parsed);
        
        // Update formData based on stored data
        setFormData((prev) => ({
          ...prev,
          phone: parsed.mobileNo || prev.phone,
          otpVerified: parsed.mobileVerify || false,
          emailOtpVerified: parsed.emailVerify || false,
          aadhaarDocFetched: parsed.aadharVerify || false,
          panDocFetched: parsed.panVerify || false,
          completed: parsed.allCompleted || false,
        }));

        // If all completed, show steps immediately
        if (parsed.allCompleted) {
          setFormData((prev) => ({ ...prev, completed: true }));
          setShowSteps(true);
        } else if (parsed.mobileVerify || parsed.emailVerify) {
          // If mobile or email is verified, show steps
          setShowSteps(true);
        }
      }
    } catch (e) {
      console.error("Error reading onboarding data from secureStorage:", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // All form data locally
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

  // Check onboarding status from Redux state (when mobile OTP response has status "verified")
  const mobileOtpResponse = useSelector((state) => state?.retailerOnboarding?.OTPResponse);
  
  // Load steps from secureStorage when mobileOtpResponse changes (after step1.jsx stores it)
  useEffect(() => {
    // Get pending steps from secureStorage (stored by step1.jsx from /api/v1/user/onboarding/sendSmsOtp)
    try {
      const storedSteps = secureLocalStorage.getItem("pendingStatus");
      if (storedSteps) {
        const parsed = typeof storedSteps === 'string' ? JSON.parse(storedSteps) : storedSteps;
        console.log("Loaded steps from secureStorage (pendingStatus):", parsed);
        setStepsFromStorage(parsed);
      }
      
      // Also load full onboarding data for reference
      const stored = secureLocalStorage.getItem("onboardingData");
      if (stored) {
        const parsed = typeof stored === 'string' ? JSON.parse(stored) : stored;
        setOnboardingStatus(parsed);
        
        // Update formData based on stored data
        setFormData((prev) => ({
          ...prev,
          phone: parsed.mobileNo || prev.phone,
          otpVerified: parsed.mobileVerify || false,
          emailOtpVerified: parsed.emailVerify || false,
          aadhaarDocFetched: parsed.aadharVerify || false,
          panDocFetched: parsed.panVerify || false,
          completed: parsed.allCompleted || false,
        }));

        // If all completed, show steps immediately and mark as completed
        if (parsed.allCompleted) {
          setFormData((prev) => ({ ...prev, completed: true }));
          setShowSteps(true);
          setCurrentStep(1);
        } else if (parsed.mobileVerify || parsed.emailVerify) {
          // If mobile or email is verified, show steps
          setShowSteps(true);
          setCurrentStep(1);
        }
      }
    } catch (e) {
      console.error("Error reading onboarding status from secureStorage:", e);
    }
  }, [mobileOtpResponse]);

  // Update formData when onboardingStatus changes
  useEffect(() => {
    if (onboardingStatus) {
      setFormData((prev) => ({
        ...prev,
        phone: onboardingStatus.mobileNo || prev.phone,
        otpVerified: onboardingStatus.mobileVerify || false,
        emailOtpVerified: onboardingStatus.emailVerify || false,
        aadhaarDocFetched: onboardingStatus.aadharVerify || false,
        panDocFetched: onboardingStatus.panVerify || false,
        completed: onboardingStatus.allCompleted || false,
      }));
    }
  }, [onboardingStatus]);

  // Handle auto-start with URL referral code
  const handleAutoStartWithReferral = () => {
    if (urlReferralCode) {
      const code = urlReferralCode.toUpperCase();
      try {
        localStorage.setItem("referralCodeFromUrl", code);
        setFormData((prev) => ({
          ...prev,
          referralCode: code,
        }));
        setReferralCodeSelected(true);
        setShowReferralOptions(false);
      } catch (e) {
        console.error("Error storing referral code:", e);
      }
    }
  };

  // Handle manual referral code submission
  const handleReferralSubmit = async (e) => {
    e.preventDefault();
    setReferralError("");

    const trimmedCode = referralCodeInput?.trim() || "";
    if (trimmedCode.length !== 9) {
      setReferralError("Please enter a valid 9-digit referral code");
      return;
    }

    setReferralLoading(true);

    const requestBody = {
      referCode: trimmedCode.toUpperCase(),
    };

    try {
      await dispatch(referalCodeCheck(requestBody, companyData));
      const code = trimmedCode.toUpperCase();
      try {
        localStorage.setItem("referralCodeFromUrl", code);
        setFormData((prev) => ({
          ...prev,
          referralCode: code,
        }));
        setReferralCodeSelected(true);
        setShowReferralOptions(false);
      } catch (e) {
        console.error("Error storing referral code:", e);
      }
    } catch (error) {
      setReferralError("Failed to submit referral code. Please try again.");
    } finally {
      setReferralLoading(false);
    }
  };

  // Persist referral code to localStorage when it comes from props or URL
  useEffect(() => {
    const initialCode = getInitialReferralCode();
    if (initialCode) {
      try {
        localStorage.setItem("referralCodeFromUrl", initialCode);
        setFormData((prev) => ({
          ...prev,
          referralCode: initialCode,
        }));
        // If we have a code from URL, auto-select it
        if (urlReferralCode) {
          setReferralCodeSelected(true);
          setShowReferralOptions(false);
        }
      } catch (e) {
        console.error("Error storing referral code:", e);
      }
    }
  }, [propReferralCode, urlReferralCode]);

  const next = () => {
    const newStep = Math.min(7, currentStep + 1);
    setCurrentStep(newStep);
  };

  const handleStepNext = () => {
    next();
    setShowSteps(true);
  };

  const isStepDone = (step, idx) => {
    // First check steps from secureStorage (pendingStatus)
    if (stepsFromStorage && Array.isArray(stepsFromStorage)) {
      const stepData = stepsFromStorage.find((s) => s.key === step.key);
      if (stepData?.done) {
        return true;
      }
    }

    // Then check API status if available
    if (onboardingStatus?.steps) {
      const stepData = onboardingStatus.steps.find((s) => s.key === step.key);
      if (stepData?.done) {
        return true;
      }
    }

    // Fallback to formData
    switch (step.key) {
      case "mobileVerification":
        return formData.otpVerified || onboardingStatus?.mobileVerify || false;
      case "emailVerification":
        return formData.emailOtpVerified || onboardingStatus?.emailVerify || false;
      case "aadharVerification":
        return formData.aadhaarDocFetched || onboardingStatus?.aadharVerify || false;
      case "panVerification":
        return formData.panDocFetched || onboardingStatus?.panVerify || false;
      case "shopDetails":
        if (stepsFromStorage) {
          const shopStep = stepsFromStorage.find((s) => s.key === "shopDetails");
          if (shopStep?.done) return true;
        }
        if (onboardingStatus?.steps) {
          const shopStep = onboardingStatus.steps.find((s) => s.key === "shopDetails");
          if (shopStep?.done) return true;
        }
        return formData.shopName && formData.shopPhotoDataUrl;
      case "bankVerification":
        return (formData.bankAccountNumber && formData.ifscCode) || onboardingStatus?.bankVerify || false;
      case "profile":
        if (stepsFromStorage) {
          const profileStep = stepsFromStorage.find((s) => s.key === "profile");
          if (profileStep?.done) return true;
        }
        if (onboardingStatus?.steps) {
          const profileStep = onboardingStatus.steps.find((s) => s.key === "profile");
          if (profileStep?.done) return true;
        }
        return formData.profilePhotoDataUrl;
      default:
        return false;
    }
  };

  const isCompleted = formData.completed || onboardingStatus?.allCompleted || false;

  const getStepIcon = (key) => {
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
          {!isCompleted && showSteps && (
            <>
              <h1 className="text-2xl md:text-3xl font-semibold text-center text-[#1B1717]">
                Complete Your KYC
              </h1>
              <p className="text-sm text-[#1B1717] text-center mt-2 md:mt-3">
                Secure your account by completing this quick verification.
              </p>

              {/* REFERRAL CODE OPTIONS - Show before steps if URL has referral code */}
              {showReferralOptions && urlReferralCode && (
                <div className="w-full max-w-md mx-auto mt-8 mb-8 bg-white rounded-xl shadow-md p-6 sm:p-8">
                  <h2 className="text-center text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                    Welcome
                  </h2>
                  <p className="text-center text-sm sm:text-base text-gray-600 mb-6">
                    Choose an option to continue
                  </p>

                  {/* Option 1: Auto-start with referral code */}
                  <button
                    type="button"
                    onClick={handleAutoStartWithReferral}
                    className={`w-full text-white py-3 sm:py-3.5 md:py-4 rounded-lg font-semibold text-base sm:text-lg transition shadow-md mb-3 hover:bg-green-700`}
                    style={{
                      backgroundColor: primaryColor,
                    }}
                  >
                    Start KYC with Referral Code: {urlReferralCode.toUpperCase()}
                  </button>

                  {/* Option 2: Manual entry */}
                  <div className="mb-6">
                    <p className="text-center text-sm text-gray-600 mb-4">
                      New To Our Platform ? Create Your Account
                    </p>
                    <form onSubmit={handleReferralSubmit}>
                      {/* Label */}
                      <label
                        htmlFor="referral-code-input"
                        className="block text-sm sm:text-base font-medium text-gray-800 mb-2"
                      >
                        Enter Referral Code
                      </label>

                      {/* Input Field */}
                      <div className="relative mb-4">
                        <img
                          src="/img/Export.png"
                          alt="Export"
                          className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 opacity-70"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                        <div className="absolute left-9 sm:left-11 top-1/2 -translate-y-1/2 h-5 sm:h-6 w-px bg-gray-300" />
                        <input
                          id="referral-code-input"
                          type="text"
                          value={referralCodeInput}
                          onChange={(e) => {
                            setReferralCodeInput(e.target.value);
                            setReferralError("");
                          }}
                          placeholder="Enter 9 Digit Code"
                          maxLength={9}
                          className={`w-full h-12 sm:h-14 md:h-16 border rounded-lg pl-11 sm:pl-14 pr-4 text-sm sm:text-base outline-none focus:border-[#1B1717] focus:border-2 ${
                            referralError ? "border-red-500" : "border-gray-300"
                          }`}
                          style={{ focusBorderColor: primaryColor }}
                          disabled={referralLoading}
                        />
                      </div>

                      {/* Error Message */}
                      {referralError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-red-700 text-sm">{referralError}</p>
                        </div>
                      )}

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={referralLoading || !referralCodeInput.trim()}
                        className={`w-full text-white py-3 sm:py-3.5 md:py-4 rounded-lg font-semibold text-base sm:text-lg transition shadow-md mb-3 ${
                          referralLoading || !referralCodeInput.trim()
                            ? "bg-gray-400 cursor-not-allowed opacity-70"
                            : "hover:bg-green-700"
                        }`}
                        style={{
                          backgroundColor:
                            referralLoading || !referralCodeInput.trim()
                              ? undefined
                              : primaryColor,
                        }}
                      >
                        {referralLoading ? "Submitting..." : "Submit"}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* STEP LIST - Hide if showing referral options */}
              {!showReferralOptions && (
              <div className="w-full max-w-md mx-auto mt-8 space-y-3 md:space-y-4">
                {STEP_INFO.map((step, idx) => {
                  const done = isStepDone(step, idx);
                  const active = currentStep === idx + 1;

                  return (
                    <div
                      key={step.key}
                      onClick={() => {
                        if (!done) {
                        setCurrentStep(idx + 1);
                        setShowSteps(false);
                        }
                      }}
                      className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl border shadow-sm transition ${
                        done ? "cursor-default bg-green-50 border-green-300" : "cursor-pointer"
                      } ${
                          done
                          ? "bg-green-50 border-green-300"
                            : active
                            ? "bg-white border-gray-300"
                            : "bg-white border-gray-200"
                      }`}
                    >
                      <img
                        src={getStepIcon(step.key)}
                        className="w-8 h-8 md:w-10 md:h-10"
                        alt=""
                      />

                      <div className="flex-1">
                        <div
                          className={`font-medium text-[16px] md:text-xl ${
                            done ? "text-green-700 font-semibold" : "text-gray-800"
                          }`}
                        >
                          {step.label}
                        </div>
                        <div className={`text-xs ${
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
                        <div className="w-7 h-7 md:w-8 md:h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm md:text-base font-semibold shadow-md">
                          ✓
                        </div>
                      ) : (
                        <div className={`w-7 h-7 md:w-8 md:h-8 border rounded-full flex items-center justify-center text-sm md:text-base ${
                          active ? "border-green-500 text-green-600 bg-green-50" : "border-gray-300 text-gray-400"
                        }`}>
                          {idx + 1}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              )}
            </>
          )}

          {isCompleted && (
            <div className="text-center py-10">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-green-700 mb-2">Completed KYC</h2>
              <p className="text-gray-600 mt-2 text-base md:text-lg">
                Thank you! Your onboarding is complete.
              </p>
              {onboardingStatus?.mobileNo && (
                <p className="text-sm text-gray-500 mt-4">
                  Verified Mobile: {onboardingStatus.mobileNo}
                </p>
              )}
            </div>
          )}
        </div>

        {/* STEP CARD */}
        {!showSteps && (
          <div className="flex-1 flex flex-col justify-center items-center px-1 sm:px-2 overflow-hidden">
            {/* Back Button */}
            <div className="w-full max-w-[1450px] mb-4">
              <button
                onClick={() => setShowSteps(true)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition px-4 py-2"
              >
                <svg
                  className="w-5 h-5"
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
                <span className="text-sm md:text-base">Back to Steps</span>
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
  );
}

export default OnboardingRetailerById;
