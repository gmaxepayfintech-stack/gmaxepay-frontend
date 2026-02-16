import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOnboarding,
  updateOnboardingStep,
} from "../../redux/action/onboardingAction";
import Step1 from "../step1";
import Step2 from "../step2";
import Step3 from "../step3";
import Step4 from "../step4";
import Step5 from "../step5";
import Step6 from "../step6";
import Step7 from "../step7";

// Step key mapping
const STEP_KEY_MAP = {
  mobileVerification: 1,
  emailVerification: 2,
  aadharVerification: 3,
  panVerification: 4,
  shopDetails: 5,
  bankVerification: 6,
  profile: 7,
};

function OnboardingById() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const onboardingState = useSelector((state) => state.onboarding);
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    // Step 1
    phone: "",
    otp: "",
    otpSent: false,
    otpVerified: false,
    // Step 2
    email: "",
    emailOtp: "",
    emailOtpSent: false,
    emailOtpVerified: false,
    // Step 3
    aadhaarDocFetched: false,
    // Step 4
    panDocFetched: false,
    digilockerLinked: false,
    // Step 5
    shopName: "",
    shopPhotoDataUrl: "",
    // Step 6
    bankAccountNumber: "",
    ifscCode: "",
    // Step 7
    profilePhotoDataUrl: "",
    // Completed
    completed: false,
  });

  useEffect(() => {
    const tokenFromQuery = searchParams.get("token");
    const token = tokenFromQuery || id;
    if (token) {
      try {
        localStorage.setItem("onboardingToken", token);
        // Fetch onboarding data from API
        dispatch(fetchOnboarding(token));
      } catch (_) {}
    }
  }, [id, searchParams, dispatch]);

  // Update current step from Redux state when onboarding data is fetched
  useEffect(() => {
    if (
      onboardingState.currentStep &&
      onboardingState.currentStep !== currentStep
    ) {
      setCurrentStep(onboardingState.currentStep);
      dispatch(updateOnboardingStep(onboardingState.currentStep));
    }
  }, [onboardingState.currentStep, currentStep, dispatch]);

  const next = () => {
    const newStep = Math.min(7, currentStep + 1);
    setCurrentStep(newStep);
    dispatch(updateOnboardingStep(newStep));
  };

  const back = () => {
    const newStep = Math.max(1, currentStep - 1);
    setCurrentStep(newStep);
    dispatch(updateOnboardingStep(newStep));
  };

  // Function to refresh onboarding steps after completion
  const refreshOnboardingSteps = () => {
    const tokenFromQuery = searchParams.get("token");
    const token =
      tokenFromQuery || id || localStorage.getItem("onboardingToken");
    if (token) {
      dispatch(fetchOnboarding(token));
    }
  };

  // Helper function to check if a step is done based on API data
  const isStepDone = (stepNumber) => {
    if (!onboardingState.steps || onboardingState.steps.length === 0) {
      return false;
    }
    const stepKeys = Object.keys(STEP_KEY_MAP);
    const stepKey = stepKeys[stepNumber - 1];
    const stepData = onboardingState.steps.find((s) => s.key === stepKey);
    return stepData?.done || false;
  };

  // Get step icon based on API data
  const getStepIcon = (stepNumber, stepKey) => {
    switch (stepKey) {
      case "mobileVerification":
        return "/img/green-mobile.png";
      case "emailVerification":
        if (isStepDone(2)) {
          return "/img/completedMail.png";
        }
        return currentStep === 2 ? "/img/Envelope.png" : "/img/Email.png";
      case "aadharVerification":
        if (isStepDone(3)) {
          return "/img/AadhaarCompleted.png";
        }
        return "/img/aadhar.png";
      case "panVerification":
        if (isStepDone(4)) {
          return "/img/PanCompleted.png";
        }
        return "/img/PanCard.png";
      case "shopDetails":
        if (isStepDone(5)) {
          return "/img/completedShopDetails.png";
        }
        return "/img/ShopDetails.png";
      case "bankVerification":
        if (isStepDone(6)) {
          return "/img/completedBankVerification.png";
        }
        return "/img/BankDetails.png";
      case "profile":
        return "/img/Profile.png";
      default:
        return "/img/ShopDetails.png";
    }
  };

  if (onboardingState.loading) {
    return (
      <div
        className="min-h-screen bg-gray-50 flex items-center justify-center"
        style={{ fontFamily: "Gilroy-Medium, sans-serif" }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p
            className="text-gray-600"
            style={{ fontFamily: "Gilroy-Medium, sans-serif" }}
          >
            Loading onboarding data...
          </p>
        </div>
      </div>
    );
  }

  // Function to determine error type and get appropriate message
  const getErrorInfo = (errorMessage) => {
    const error = errorMessage?.toLowerCase() || "";

    if (
      error.includes("access") ||
      error.includes("permission") ||
      error.includes("unauthorized")
    ) {
      return {
        icon: "/img/caution.png",
        title: "Access Denied",
        message: "Sorry, you don't have access to this onboarding link.",
        description:
          "Please contact support or check if you have the correct permissions.",
        iconColor: "text-red-600",
      };
    }

    if (
      error.includes("expired") ||
      error.includes("invalid") ||
      error.includes("expire")
    ) {
      return {
        icon: "/img/linkExpired.png",
        title: "Link Expired",
        message: "This onboarding link has expired or is invalid.",
        description:
          "Please request a new onboarding link from your administrator.",
        iconColor: "text-orange-600",
      };
    }

    if (error.includes("not found") || error.includes("404")) {
      return {
        icon: "/img/pageNotFound.png",
        title: "Not Found",
        message: "The requested onboarding session could not be found.",
        description:
          "Please verify the link or contact support for assistance.",
        iconColor: "text-gray-600",
      };
    }

    // Default error
    return {
      icon: "/img/networkError.png",
      title: "Something Went Wrong",
      message:
        errorMessage || "An error occurred while loading your onboarding data.",
      description:
        "Please refresh the page or contact support if the issue persists.",
      iconColor: "text-red-600",
    };
  };

  // Show error state
  if (onboardingState.error) {
    const errorInfo = getErrorInfo(onboardingState.error);

    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ fontFamily: "Gilroy-Medium, sans-serif" }}
      >
        <div className="w-full max-w-4xl text-center">
          <div className="flex justify-center">
            <img
              src={errorInfo.icon}
              alt="Error"
              className="w-48 h-48 opacity-70"
            />
          </div>
          <h2
            className={`text-4xl font-semibold mt-6 mb-6 ${errorInfo.iconColor} break-words`}
            style={{ fontFamily: "Gilroy-Medium, sans-serif" }}
          >
            {errorInfo.title}
          </h2>
          <p
            className="text-gray-700 text-2xl mb-4 font-[Gilroy-Medium] break-words"
            style={{ fontFamily: "Gilroy-Medium, sans-serif" }}
          >
            {errorInfo.message}
          </p>
          <p
            className="text-gray-600 text-lg mb-8 break-words"
            style={{ fontFamily: "Gilroy-Medium, sans-serif" }}
          >
            {errorInfo.description}
          </p>
        </div>
      </div>
    );
  }

  const isCompleted =
    formData.completed || onboardingState.isOnboardingCompleted;

  // If onboarding is completed, show only the completion message
  if (isCompleted) {
    return (
      <div
        className="min-h-screen bg-gray-50 flex items-center justify-center"
        style={{ fontFamily: "Gilroy-Medium, sans-serif" }}
      >
        <div className="w-full max-w-2xl bg-white border border-gray-100 rounded-2xl p-8 shadow-sm text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-[#1B1717] mb-2">
            KYC completed
          </h2>
          <p className="text-gray-600 text-lg">
            Thank you! Your onboarding is complete.
          </p>
          {formData.digilockerLinked && (
            <div className="mt-4 inline-flex items-center gap-1 text-green-600 text-sm">
              <DigiLockerIcon small /> DigiLocker linked
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center py-1">
      <div
        className="   w-[1450px]"
        style={{ fontFamily: "Gilroy-Medium, sans-serif" }}
      >
        {/* Header and description */}
        <div className="p-8">
          <h1 className="text-2xl font-[gilroy-semibold] mb-2 text-center text-[#1B1717]">
            Complete Your KYC
          </h1>
          <p className="text-sm sm:text-base text-[#1B1717] mb-6 text-center font-[gilroy-medium]">
            Secure Your Account And Unlock All Features By Completing Our Quick
            Verification Process.
          </p>

          {/* Steps card */}
          <div className="rounded-xl p-6 bg-white border  ">
            <div className="flex items-center gap-4 mb-3">
              <img
                src="/img/KYC.png"
                alt="Status"
                className="w-[50px] h-[50px] mt-4"
              />
              <h2 className="text-xl font-[gilroy-semibold] mt[-12px] text-[#1B1717]">
                Complete Your KYC
              </h2>
              {onboardingState.name && (
                <p className="text-sm font-[gilroy-medium] text-[#1B1717]/80 mt-1">
                  Welcome, {onboardingState.name}
                </p>
              )}
            </div>
            <p className="text-lg font-[gilroy-medium] text-[#1B1717] mt-[-24px] ml-16">
              Onboarding Token Captured. Please Complete The Steps Below.
            </p>
            <div className="text-[#1B1717] w-[1265px] mt-4 ml-16">
              <h3 className="text-base  font-[gilroy-medium]">
                Steps To Complete
              </h3>
              <div className="flex items-center gap-4 mt-4  pb-2 justify-center">
                {onboardingState.steps && onboardingState.steps.length > 0 ? (
                  onboardingState.steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isDone = step.done || false;
                    const isActive = currentStep === stepNumber;
                    const isLast = stepNumber === onboardingState.steps.length;

                    return (
                      <StepBadge
                        key={step.key}
                        icon={getStepIcon(stepNumber, step.key)}
                        label={step.label}
                        active={isActive}
                        done={isDone}
                        connectingLine={!isLast}
                        lineActive={isDone}
                      />
                    );
                  })
                ) : (
                  <>
                    <StepBadge
                      icon="/img/green-mobile.png"
                      label="Mobile OTP"
                      active={currentStep === 1}
                      done={formData.otpVerified}
                      connectingLine={true}
                      lineActive={formData.otpVerified}
                    />
                    <StepBadge
                      icon={
                        formData.emailOtpVerified
                          ? "/img/completedMail.png"
                          : currentStep === 2
                            ? "/img/Envelope.png"
                            : "/img/Email.png"
                      }
                      label="Email OTP"
                      active={currentStep === 2}
                      done={formData.emailOtpVerified}
                      connectingLine={true}
                      lineActive={formData.emailOtpVerified}
                    />
                    <StepBadge
                      icon={
                        formData.aadhaarDocFetched
                          ? "/img/AadhaarCompleted.png"
                          : "/img/aadhar.png"
                      }
                      label="Aadhar Card"
                      active={currentStep === 3}
                      done={formData.aadhaarDocFetched}
                      connectingLine={true}
                      lineActive={formData.aadhaarDocFetched}
                    />
                    <StepBadge
                      icon={
                        formData.panDocFetched
                          ? "/img/PanCompleted.png"
                          : "/img/PanCard.png"
                      }
                      label="Pan Card"
                      active={currentStep === 4}
                      done={formData.panDocFetched}
                      connectingLine={true}
                      lineActive={formData.panDocFetched}
                    />
                    <StepBadge
                      icon={
                        formData.shopName && formData.shopPhotoDataUrl
                          ? "/img/completedShopDetails.png"
                          : "/img/ShopDetails.png"
                      }
                      label="Shop Details"
                      active={currentStep === 5}
                      done={formData.shopName && formData.shopPhotoDataUrl}
                      connectingLine={true}
                      lineActive={
                        formData.shopName && formData.shopPhotoDataUrl
                      }
                    />
                    <StepBadge
                      icon={
                        formData.bankAccountNumber && formData.ifscCode
                          ? "/img/completedBankVerification.png"
                          : "/img/BankDetails.png"
                      }
                      label="Bank Details"
                      active={currentStep === 6}
                      done={formData.bankAccountNumber && formData.ifscCode}
                      connectingLine={true}
                      lineActive={
                        formData.bankAccountNumber && formData.ifscCode
                      }
                    />
                    <StepBadge
                      icon="/img/Profile.png"
                      label="Profile Photo"
                      active={currentStep === 7}
                      done={formData.profilePhotoDataUrl}
                      connectingLine={false}
                      lineActive={false}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Centered step content card */}
        <div className="w-full flex justify-center mb-6">
          <div className="w-full max-w-2xl bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
            {currentStep === 1 && (
              <Step1
                formData={formData}
                setFormData={setFormData}
                onNext={next}
                onRefreshSteps={refreshOnboardingSteps}
              />
            )}

            {currentStep === 2 && (
              <Step2
                formData={formData}
                setFormData={setFormData}
                onNext={next}
                onRefreshSteps={refreshOnboardingSteps}
              />
            )}

            {currentStep === 3 && (
              <Step3
                formData={formData}
                setFormData={setFormData}
                onNext={next}
                onRefreshSteps={refreshOnboardingSteps}
              />
            )}

            {currentStep === 4 && (
              <Step4
                formData={formData}
                setFormData={setFormData}
                onNext={next}
                onRefreshSteps={refreshOnboardingSteps}
              />
            )}

            {currentStep === 5 && (
              <Step5
                formData={formData}
                setFormData={setFormData}
                onNext={next}
                onRefreshSteps={refreshOnboardingSteps}
              />
            )}

            {currentStep === 6 && (
              <Step6
                formData={formData}
                setFormData={setFormData}
                onNext={next}
                onRefreshSteps={refreshOnboardingSteps}
              />
            )}

            {currentStep === 7 && (
              <Step7
                formData={formData}
                setFormData={setFormData}
                onComplete={() =>
                  setFormData((d) => ({ ...d, completed: true }))
                }
                onRefreshSteps={refreshOnboardingSteps}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepBadge({ icon, label, active, done, connectingLine, lineActive }) {
  const getStatusColor = () => {
    if (
      done ||
      (active &&
        (icon.includes("Envelope") ||
          icon.includes("green-mobile") ||
          icon.includes("completedMail") ||
          icon.includes("AadhaarCompleted") ||
          icon.includes("PanCompleted") ||
          icon.includes("completedShopDetails") ||
          icon.includes("completedBankVerification")))
    )
      return "text-[#039155]";
    if (active) return "text-[#039155] ";
    return "text-gray-500";
  };

  const getLineColor = () => {
    if (
      lineActive ||
      (active &&
        (icon.includes("Envelope") ||
          icon.includes("green-mobile") ||
          icon.includes("completedMail") ||
          icon.includes("AadhaarCompleted") ||
          icon.includes("PanCompleted") ||
          icon.includes("completedShopDetails") ||
          icon.includes("completedBankVerification")))
    )
      return "bg-[#039155]";
    return "bg-[#EAEAEA]";
  };

  const isGreenIcon =
    icon.includes("Envelope") ||
    icon.includes("green-mobile") ||
    icon.includes("completedMail") ||
    icon.includes("AadhaarCompleted") ||
    icon.includes("PanCompleted") ||
    icon.includes("completedShopDetails") ||
    icon.includes("completedBankVerification");

  return (
    <>
      <div
        className={"flex flex-col items-center  " + getStatusColor()}
        style={{ fontFamily: "Gilroy-Medium, sans-serif" }}
      >
        <div className="relative">
          <div
            className={`w-[50px] h-[50px] rounded-full flex items-center justify-center ${
              done
                ? "bg-[#039155] border border-[#039155]"
                : active
                  ? "bg-[#039155] border border-green-200"
                  : "bg-white border border-gray-200"
            }`}
          >
            <img
              src={icon}
              alt={label}
              className={`w-[#32px] h-[#32px] ${
                done || (active && isGreenIcon)
                  ? "opacity-100"
                  : active
                    ? "opacity-100"
                    : "opacity-100"
              }`}
            />
          </div>
        </div>
        <span
          className={`text-[12px] w-[73px] h-[17px] text-center font-gilroy mt-2 ${
            done || (active && isGreenIcon)
              ? "text-green-600"
              : active
                ? "text-green-600"
                : "text-[#1B1717] opacity-80"
          }`}
          style={{ fontFamily: "Gilroy-Medium, sans-serif" }}
        >
          {label}
        </span>
      </div>
      {connectingLine && (
        <div
          className={`flex-1 h-[5px] w-[71px] mx-3 rounded-xl mt-2 ${getLineColor()}`}
        />
      )}
    </>
  );
}

function DigiLockerIcon({ small }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={small ? "w-4 h-4" : "w-5 h-5"}
    >
      <path d="M6 8a6 6 0 1112 0v2h1a1 1 0 011 1v9a1 1 0 01-1 1H5a1 1 0 01-1-1v-9a1 1 0 011-1h1V8zm2 2h8V8a4 4 0 10-8 0v2z" />
    </svg>
  );
}

export default OnboardingById;
