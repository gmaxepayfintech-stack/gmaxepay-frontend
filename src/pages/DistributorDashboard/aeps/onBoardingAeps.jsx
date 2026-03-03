import AepsAcceptance from "./AepsAcceptance";
import IdentityVerification from "./identityVerification";
import BiometricVerification from "./BiometricVerification";
import BankOtp from "./BankOtp";
import BankKyc from "./BankKyc";
import FAVerification from "./FAVerification";
import Selectservice from "./Selectservice";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { aepsStatusCheck } from "../../../redux/action/aepsAction";

const OnBoardingAeps = () => {
  const dispatch = useDispatch();
  const aepsStatus = useSelector((state) => state.aeps?.aepsStatus);
  const [showAcceptance, setShowAcceptance] = useState(false);

  // Call aepsStatusCheck on component mount
  useEffect(() => {
    dispatch(aepsStatusCheck())
      .then((response) => {
        console.log("aepsStatusCheck response in OnBoardingAeps:", response);
      })
      .catch((error) => {
        console.error("aepsStatusCheck error in OnBoardingAeps:", error);
      });
  }, [dispatch]);

  // Log aepsStatus when it changes
  useEffect(() => {
    if (aepsStatus?.aepsStatus) {
      console.log("aepsStatus state in OnBoardingAeps:", aepsStatus.aepsStatus);
    }
  }, [aepsStatus]);

  // Determine which component to show based on status
  const getCurrentStep = () => {
    // aepsStatus from Redux is { aepsStatus, status, message } where aepsStatus is the data
    // Or it could be { status, message, data } from direct API response
    const statusData = aepsStatus?.aepsStatus || aepsStatus?.data;

    if (!statusData) {
      return null; // Still loading or no data
    }
    const {
      aepsOnboarding,
      ekycOtp,
      ekycBiometric,
      bankKycOtp,
      bankKycBiometric,
      aeps2FaAuthentication,
    } = statusData;

    console.log("Current onboarding statuses in OnBoardingAeps:", {
      aepsOnboarding,
      ekycOtp,
      ekycBiometric,
      bankKycOtp,
      bankKycBiometric,
      aeps2FaAuthentication,
    });

    // Check in order of flow - find the first pending step
    // If aepsOnboarding is pending, show welcome screen
    const isAepsOnboardingPending =
      aepsOnboarding?.status?.toLowerCase() === "pending" ||
      aepsOnboarding?.status?.toLowerCase() !== "success" ||
      !aepsOnboarding?.isCompleted;
    if (isAepsOnboardingPending) {
      return null; // Show welcome screen (user needs to start)
    }

    // Check for other pending steps - navigate directly to them
    const isEkycOtpPending =
      ekycOtp?.status?.toLowerCase() === "pending" ||
      ekycOtp?.status?.toLowerCase() !== "success" ||
      !ekycOtp?.isCompleted;
    if (isEkycOtpPending) {
      return "identityVerification";
    }

    const isEkycBiometricPending =
      ekycBiometric?.status?.toLowerCase() === "pending" ||
      ekycBiometric?.status?.toLowerCase() !== "success" ||
      !ekycBiometric?.isCompleted;
    if (isEkycBiometricPending) {
      return "biometricVerification";
    }

    const isBankKycOtpPending =
      bankKycOtp?.status?.toLowerCase() === "pending" ||
      bankKycOtp?.status?.toLowerCase() !== "success" ||
      !bankKycOtp?.isCompleted;
    if (isBankKycOtpPending) {
      return "bankOtp";
    }

    const isBankKycBiometricPending =
      bankKycBiometric?.status?.toLowerCase() === "pending" ||
      bankKycBiometric?.status?.toLowerCase() !== "success" ||
      !bankKycBiometric?.isCompleted;
    if (isBankKycBiometricPending) {
      return "bankKyc";
    }

    const is2FAPending =
      aeps2FaAuthentication?.status?.toLowerCase() === "pending" ||
      aeps2FaAuthentication?.status?.toLowerCase() !== "success" ||
      !aeps2FaAuthentication?.isCompleted;
    if (is2FAPending) {
      return "faVerification";
    }

    // All steps completed - show Selectservice
    return "selectService";
  };

  const currentStep = getCurrentStep();

  // Conditional rendering based on status - all components render under this route
  if (currentStep === "identityVerification") {
    return <IdentityVerification onBack={() => setShowAcceptance(false)} />;
  }
  if (currentStep === "biometricVerification") {
    return <BiometricVerification />;
  }
  if (currentStep === "bankOtp") {
    return <BankOtp />;
  }
  if (currentStep === "bankKyc") {
    return <BankKyc />;
  }
  if (currentStep === "faVerification") {
    return <FAVerification />;
  }
  if (currentStep === "selectService") {
    return <Selectservice />;
  }
  // Show AepsAcceptance only when button is clicked
  if (showAcceptance) {
    return <AepsAcceptance onBack={() => setShowAcceptance(false)} />;
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

export default OnBoardingAeps;
