import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

import Step1 from "../step1";
import Step2 from "../step2";
import RetailerAadhaar from "../RetailerAadhaar";
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

function OnboardingRetailerById() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  // No API fetch — simple step state
  const [currentStep, setCurrentStep] = useState(1);
  const [showSteps, setShowSteps] = useState(true);

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
  });

  const next = () => {
    const newStep = Math.min(7, currentStep + 1);
    setCurrentStep(newStep);
  };

  const handleStepNext = () => {
    next();
    setShowSteps(true);
  };

  const isStepDone = (step, idx) => {
    switch (step.key) {
      case "mobileVerification":
        return formData.otpVerified;
      case "emailVerification":
        return formData.emailOtpVerified;
      case "aadharVerification":
        return formData.aadhaarDocFetched;
      case "panVerification":
        return formData.panDocFetched;
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

  const isCompleted = formData.completed;

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

              {/* STEP LIST */}
              <div className="w-full max-w-md mx-auto mt-8 space-y-3 md:space-y-4">
                {STEP_INFO.map((step, idx) => {
                  const done = isStepDone(step, idx);
                  const active = currentStep === idx + 1;

                  return (
                    <div
                      key={step.key}
                      onClick={() => {
                        setCurrentStep(idx + 1);
                        setShowSteps(false);
                      }}
                      className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl border shadow-sm transition cursor-pointer
                        ${
                          done
                            ? "bg-green-50 border-green-200"
                            : active
                            ? "bg-white border-gray-300"
                            : "bg-white border-gray-200"
                        }
                      `}
                    >
                      <img
                        src={getStepIcon(step.key)}
                        className="w-8 h-8 md:w-10 md:h-10"
                        alt=""
                      />

                      <div className="flex-1">
                        <div
                          className={`font-medium text-[16px] md:text-xl ${
                            done ? "text-green-700" : "text-gray-800"
                          }`}
                        >
                          {step.label}
                        </div>
                        <div className="text-xs text-gray-500">
                          {done
                            ? "Completed"
                            : active
                            ? "In progress"
                            : "Pending"}
                        </div>
                      </div>

                      {done ? (
                        <div className="w-7 h-7 md:w-8 md:h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm md:text-base">
                          ✓
                        </div>
                      ) : (
                        <div className="w-7 h-7 md:w-8 md:h-8 border border-gray-300 text-gray-400 rounded-full flex items-center justify-center text-sm md:text-base">
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
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                ✓
              </div>
              <h2 className="text-xl font-semibold">KYC Completed</h2>
              <p className="text-gray-600 mt-2">
                Thank you! Your onboarding is complete.
              </p>
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
                <Step1 formData={formData} setFormData={setFormData} onNext={handleStepNext} />
              )}
              {currentStep === 2 && (
                <Step2 formData={formData} setFormData={setFormData} onNext={handleStepNext} />
              )}
              {currentStep === 3 && (
                <RetailerAadhaar setFormData={setFormData} onNext={handleStepNext} />
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
