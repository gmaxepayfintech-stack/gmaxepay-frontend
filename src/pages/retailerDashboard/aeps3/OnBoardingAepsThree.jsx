import AepsAcceptanceThree from "./AepsAcceptanceThree";
import IdentityVerificationThree from "./IdentityVerificationThree";
import BiometricVerificationThree from "./BiometricVerificationThree";
import FAVerificationThree from "./FAVerificationThree";
import SelectserviceThree from "./SelectserviceThree";
import AEPSAccessConfirmThree from "./AEPSAccessConfirmThree";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { aepsThreeStatusCheck } from "../../../redux/action/aepsThreeAction";
import { useNotification } from "../../../context/NotificationContext";

const OnBoardingAepsThree = () => {
  const dispatch = useDispatch();
  const { showNotification } = useNotification();
  const aepsStatus = useSelector((state) => state.aeps?.aepsStatus);
  const [showAcceptance, setShowAcceptance] = useState(false);
  const [currentStep, setCurrentStep] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Call aepsThreeStatusCheck on component mount and determine step
  useEffect(() => {
    const checkStatus = async () => {
      try {
        setIsLoading(true);
        const response = await dispatch(aepsThreeStatusCheck());
        //console.log("aepsThreeStatusCheck response in OnBoardingAeps:", response);

        if (response && response.status !== "SUCCESS") {
          showNotification({
            type: "error",
            message: response.message || "Failed to check AEPS status",
            isCritical: true,
          });
        }

        // Get status data from response or Redux state
        const statusData = response?.aepsStatus || aepsStatus?.aepsStatus;

        if (statusData) {
          const {
            aepsOnboarding,
            ekycOtp,
            ekycBiometric,
            daily2FAAuthentication,
          } = statusData;

          console.log("Current AEPS-2 onboarding statuses:", {
            aepsOnboarding,
            ekycOtp,
            ekycBiometric,
            daily2FAAuthentication,
          });

          // Step 1: If aepsOnboarding is pending or not completed, show initial onboarding screen
          if (
            aepsOnboarding?.status?.toLowerCase() === "pending" ||
            (typeof aepsOnboarding?.isCompleted === "boolean" &&
              aepsOnboarding.isCompleted === false)
          ) {
            setCurrentStep(null); // Show initial onboarding screen
            return;
          }

          // Step 2: ekycOtp pending or not completed => show identity verification (OTP entry)
          if (
            ekycOtp?.status?.toLowerCase() === "pending" ||
            ekycOtp?.status?.toLowerCase() !== "completed" ||
            (typeof ekycOtp?.isCompleted === "boolean" &&
              ekycOtp.isCompleted === false)
          ) {
            setCurrentStep("identityVerification");
            return;
          }

          // Step 3: ekycBiometric pending or not completed => show biometric verification
          if (
            ekycBiometric?.status?.toLowerCase() === "pending" ||
            ekycBiometric?.status?.toLowerCase() !== "completed" ||
            (typeof ekycBiometric?.isCompleted === "boolean" &&
              ekycBiometric.isCompleted === false)
          ) {
            setCurrentStep("biometricVerification");
            return;
          }

          // Step 4: daily2FAAuthentication pending or not completed => show 2FA verification
          if (
            daily2FAAuthentication?.status?.toLowerCase() === "pending" ||
            daily2FAAuthentication?.status?.toLowerCase() !== "completed" ||
            (typeof daily2FAAuthentication?.isCompleted === "boolean" &&
              daily2FAAuthentication.isCompleted === false)
          ) {
            setCurrentStep("faVerification");
            return;
          }

          // All completed - show access confirm
          setCurrentStep("aepsAccessConfirm");
        } else {
          setCurrentStep(null); // No status data, show initial screen
        }
      } catch (error) {
        console.error("aepsThreeStatusCheck error in OnBoardingAeps:", error);
        showNotification({
          type: "error",
          message: error?.message || "Failed to check AEPS status",
          isCritical: true,
        });
        setCurrentStep(null); // On error, show initial screen
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();
  }, [dispatch]);

  // Also update step when Redux state changes (in case status is updated elsewhere)
  useEffect(() => {
    if (aepsStatus?.aepsStatus && !isLoading) {
      const statusData = aepsStatus.aepsStatus;
      const { aepsOnboarding, ekycOtp, ekycBiometric, daily2FAAuthentication } =
        statusData;

      // Step 1: If aepsOnboarding is pending or not completed
      if (
        aepsOnboarding?.status?.toLowerCase() === "pending" ||
        (typeof aepsOnboarding?.isCompleted === "boolean" &&
          aepsOnboarding.isCompleted === false)
      ) {
        setCurrentStep(null);
        return;
      }

      // Step 2: ekycOtp pending or not completed
      if (
        ekycOtp?.status?.toLowerCase() === "pending" ||
        ekycOtp?.status?.toLowerCase() !== "completed" ||
        (typeof ekycOtp?.isCompleted === "boolean" &&
          ekycOtp.isCompleted === false)
      ) {
        setCurrentStep("identityVerification");
        return;
      }

      // Step 3: ekycBiometric pending or not completed
      if (
        ekycBiometric?.status?.toLowerCase() === "pending" ||
        ekycBiometric?.status?.toLowerCase() !== "completed" ||
        (typeof ekycBiometric?.isCompleted === "boolean" &&
          ekycBiometric.isCompleted === false)
      ) {
        setCurrentStep("biometricVerification");
        return;
      }

      // Step 4: daily2FAAuthentication pending or not completed
      if (
        daily2FAAuthentication?.status?.toLowerCase() === "pending" ||
        daily2FAAuthentication?.status?.toLowerCase() !== "completed" ||
        (typeof daily2FAAuthentication?.isCompleted === "boolean" &&
          daily2FAAuthentication.isCompleted === false)
      ) {
        setCurrentStep("faVerification");
        return;
      }

      // All completed
      setCurrentStep("aepsAccessConfirm");
    }
  }, [aepsStatus, isLoading]);

  // Show loading state while checking status
  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#039155]"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Conditional rendering based on status - all components render under this route
  if (currentStep === "aepsAccessConfirm") {
    return <AEPSAccessConfirmThree />;
  }
  if (currentStep === "identityVerification") {
    return <IdentityVerificationThree onBack={() => setShowAcceptance(false)} />;
  }
  if (currentStep === "biometricVerification") {
    return <BiometricVerificationThree />;
  }
  if (currentStep === "faVerification") {
    return <FAVerificationThree />;
  }
  if (currentStep === "selectService") {
    return <SelectserviceThree />;
  }
  // Show AepsAcceptance only when button is clicked
  if (showAcceptance) {
    return <AepsAcceptanceThree />;
  }
  return (
    <div className="w-full py-4 px-1">
      {/* Page header */}
      <div className="mb-6">
        <div className="text-[24px] sm:text-[22px] font-['Gilroy-Medium'] text-[#1B1717]">
          AEPS Onboarding
        </div>
        <div className="mt-2 text-[16px]  text-[#000000] font-['Gilroy-Regular']">
          Please Review The Aadhaar Enabled Payment System Terms Carefully
          Before Proceeding To KYC Verification
        </div>
      </div>

      {/* Center card */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-gray-100 shadow-sm px-6 py-10 sm:px-10 sm:py-12">
        <div className="max-full mx-auto text-center">
          {/* pill */}
          <div className="inline-flex items-center gap-[30px] bg-[#E5FFF4] rounded-full px-5 py-2">
            <span className="w-2 h-2 rounded-full bg-[#039155]" />
            <span className="text-[15px] text-[#000000] font-['Gilroy-Medium']">
              Onboarding Process
            </span>
          </div>

          <div className="mt-6 text-[24px] sm:text-[24px] font-['Gilroy-Medium'] text-[#1B1717]">
            Unlock Your AEPS Capabilities
          </div>

          <div className="mt-3 text-[16px] text-[#1B1717] font-['Gilroy-Regular'] leading-relaxed">
            Join The Network Of Secure, Instant Transactions. You Are Just A Few
            Steps Away From Enabling Aadhaar Payments For Your Customers
          </div>

          <button
            type="button"
            onClick={() => setShowAcceptance(true)}
            className="mt-8 flex items-center justify-between bg-[#039155] hover:bg-[#027A47] text-white rounded-lg px-6 py-3 text-[18px] font-['Gilroy-SemiBold'] transition w-full max-w-[420px] mx-auto"
          >
            <span>Start Your AEPS Onboarding Process</span>
            <span className="inline-flex items-center justify-center w-8 h-8">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M5 12h12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M13 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnBoardingAepsThree;
