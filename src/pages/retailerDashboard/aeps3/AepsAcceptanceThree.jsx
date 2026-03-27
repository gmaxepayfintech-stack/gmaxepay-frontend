import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Mobile from "../../../../public/img/Mobile.svg";
import Daily2FA from "../../../../public/img/DailyF2A.svg";
import Biometric from "../../../../public/img/Biometric.svg";
import IdentityVerificationThree from "./IdentityVerificationThree";
import BiometricVerificationThree from "./BiometricVerificationThree";
import FAVerificationThree from "./FAVerificationThree";
import AEPSAccessConfirmThree from "./AEPSAccessConfirmThree";
import { aepsThreeStatusCheck, aepsThreeOtp, aepsThreeOnboarding } from "../../../redux/action/aepsThreeAction";
import { ButtonLoader } from "../../../widgets/layout/loader";
import { HiArrowLeft } from "react-icons/hi2";
import { useNotification } from "../../../context/NotificationContext";

const AepsAcceptanceThree = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showNotification } = useNotification();
  const [accepted, setAccepted] = useState(true);
  const [showIdentityVerification, setShowIdentityVerification] =
    useState(false);
  const [showBiometricVerification, setShowBiometricVerification] =
    useState(false);
  const [showFAVerification, setShowFAVerification] = useState(false);
  const [showAccessConfirm, setShowAccessConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const onBack = () => navigate("/retailerDashboard/services/aeps3/onboarding");

  const handleAcceptAndContinue = async () => {
    setIsLoading(true);
    try {
      // First call AEPS onboarding for AEPS-2
      const onboardResp = await dispatch(aepsThreeOnboarding());
      console.log("aepsThreeOnboarding response:", onboardResp);

      // If onboarding succeeded, check status first
      if (onboardResp?.status === "SUCCESS") {
        showNotification({
          type: "success",
          message: onboardResp?.message || "AEPS onboarding completed successfully",
          isCritical: true,
        });

        // Check status to determine next step
        const statusResponse = await dispatch(aepsThreeStatusCheck());
        console.log(
          "aepsThreeStatusCheck response after onboarding:",
          statusResponse,
        );

        if (statusResponse?.status === "SUCCESS") {
          const statusData = statusResponse?.aepsStatus;

          if (statusData) {
            const { isOtpVerified, isEkycCompleted } = statusData;

            // If OTP is pending, send OTP first
            if (!isOtpVerified) {
              // Send OTP for AEPS-3
              const otpResp = await dispatch(aepsThreeOtp());
              console.log("aepsThreeOtp response:", otpResp);

              if (otpResp?.status === "SUCCESS") {
                showNotification({
                  type: "success",
                  message: otpResp?.message || "OTP sent successfully",
                  isCritical: true,
                });
                // Navigate to identity verification
                setShowIdentityVerification(true);
              } else {
                showNotification({
                  type: "error",
                  message: otpResp?.message || "Failed to send OTP",
                  isCritical: true,
                });
              }
            }
            // If OTP is completed, check next step
            else if (isOtpVerified) {
              // Check if biometric is next
              if (!isEkycCompleted) {
                // Navigate to biometric verification
                setShowBiometricVerification(true);
              }
              // Check if all completed
              else if (isEkycCompleted) {
                // All steps completed, show access confirm
                setShowAccessConfirm(true);
              }
            }
          }
        } else {
          showNotification({
            type: "error",
            message: statusResponse?.message || "Failed to check AEPS status",
            isCritical: true,
          });
        }
      } else {
        showNotification({
          type: "error",
          message: onboardResp?.message || "AEPS onboarding failed",
          isCritical: true,
        });
      }
    } catch (error) {
      console.error("AEPS-2 onboarding/otp error:", error);
      showNotification({
        type: "error",
        message: error?.message || "Something went wrong during AEPS onboarding",
        isCritical: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const terms = useMemo(
    () => [
      {
        title: "Acceptance Of Terms",
        body: 'By Clicking "I Agree" Below, You Confirm That You Are An Authorized Representative Of The Merchant Entity And Have The Legal Authority To Bind The Entity To These Terms.',
      },
      {
        title: "Biometric Data & Consent",
        body: "You Acknowledge That AEPS Transactions Require The Capture Of Customer Biometric Data.",
      },
      {
        title: "Daily 2FA Requirement",
        body: "Two-Factor Authentication (Biometric) Is Strictly Required Once Every 24 Hours To Maintain Active Agent Status.",
      },
    ],
    [],
  );

  // Conditional rendering based on current step
  if (showAccessConfirm) {
    return <AEPSAccessConfirmThree />;
  }
  if (showFAVerification) {
    return <FAVerificationThree />;
  }
  if (showBiometricVerification) {
    return <BiometricVerificationThree />;
  }
  if (showIdentityVerification) {
    return (
      <IdentityVerificationThree
        onBack={() => setShowIdentityVerification(false)}
      />
    );
  }
  // Default: show AepsAcceptance

  return (
    <div className="w-full py-4 px-1">
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center w-10 h-10 border border-gray-400 rounded-full mr-4 cursor-pointer hover:bg-gray-50 transition"
          aria-label="Go back"
        >
          <HiArrowLeft className="text-2xl text-[#1B1717] opacity-80" />
        </button>

        <div className="flex-1">
          <div className="text-[24px]  font-['Gilroy-Medium'] text-[#1B1717]">
            AEPS Onboarding
          </div>
          <div className="mt-[10px] text-[16px] text-[#000000] font-['Gilroy-Regular']">
            Please Review The Aadhaar Enabled Payment System Terms Carefully
            Before Proceeding To KYC Verification
          </div>
        </div>
      </div>

      {/* Confirmation cards */}
      <div className="mb-6 bg-[#FFFFFF] rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="text-[18px] font-['Gilroy-Medium'] text-[#1B1717] mb-3">
          Confirmation
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: "Mobile OTP",
              desc: "Otp Verification Via Your Registered Mobile Number",
              icon: (
                <img
                  src={Mobile}
                  alt=""
                  className="w-6 h-6 text-[#FFFFFF]"
                  aria-hidden="true"
                />
              ),
            },
            {
              title: "Bio Metric Auth",
              desc: "The Capture Of Customer Biometric Data",
              icon: (
                <img
                  src={Biometric}
                  alt="Biometric"
                  className="w-6 h-6 text-[#FFFFFF]"
                  aria-hidden="true"
                />
              ),
            },
            {
              title: "Daily 2FA",
              desc: "2FA Authentication Reset For Every 24 Hours",
              icon: (
                <img
                  src={Daily2FA}
                  alt=""
                  className="w-6 h-6 text-[#FFFFFF]"
                  aria-hidden="true"
                />
              ),
            },
          ].map((c) => (
            <div
              key={c.title}
              className="bg-[#FFFFFF] rounded-xl border border-[#1B1717] border-opacity-80 px-5 py-4 min-h-[96px]"
            >
              <div className="w-10 h-10 rounded-full bg-[#039155] flex items-center justify-center">
                {c.icon}
              </div>
              <div className="mt-3 text-[16px] font-['Gilroy-SemiBold'] text-[#1B1717]">
                {c.title}
              </div>
              <div className="mt-1 text-[12px] text-[#1B1717] font-['Gilroy-Regular']">
                {c.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Terms */}
      <div className="bg-[#FFFFFF] rounded-2xl p-6 mb-6">
        <div className="text-[18px] font-['Gilroy-Medium'] text-[#1B1717]">
          Terms And Condition
        </div>

        <div className="mt-3 text-[16px] text-[#1B1717] font-['Gilroy-Regular']">
          <span className="font-['Gilroy-Medium'] text-[#1B1717]">
            Last Updated:
          </span>{" "}
          October 24, 2023
        </div>

        <div className=" text-[14px] text-[#1B1717] font-['Gilroy-Regular'] leading-relaxed">
          Welcome To The FinTech Portal AEPS Module. By Accessing Or Using Our
          Aadhaar Enabled Payment System ("AEPS"), You Agree To Be Bound By
          These Terms Of Service And Our Privacy Policy.
        </div>

        <div className="mt-4 space-y-[28px]">
          {terms.map((t, idx) => (
            <div key={t.title}>
              <div className="text-[16px] font-['Gilroy-Medium'] text-[#1B1717]">
                {idx + 1}. {t.title}
              </div>
              <div className="mt-1 text-[14px] text-[#1B1717] font-['Gilroy-Regular'] leading-relaxed">
                {t.body}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom acceptance bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-1 w-4 h-4 accent-[#039155]"
          />
          <div>
            <div className="text-[16px] font-['Gilroy-Medium'] text-[#1B1717]">
              I Accept Terms And Condition
            </div>
            <div className="mt-1 text-[14px] text-[#1B1717] font-['Gilroy-Medium'] leading-relaxed">
              I Have Read And Agree To The Terms Of Service, Including The
              Biometric Data Usage Policy And Fraud Prevention Guidelines
            </div>
          </div>
        </label>

        <button
          type="button"
          disabled={!accepted || isLoading}
          onClick={handleAcceptAndContinue}
          className="flex items-center justify-between bg-[#039155] hover:bg-[#027A47] disabled:bg-[#039155]/50 disabled:cursor-not-allowed text-white rounded-lg px-6 py-2 text-[14px] font-['Gilroy-Medium'] transition md:w-[260px] sm:w-[260px]"
        >
          <span className="text-[16px] font-['Gilroy-SemiBold'] text-[#FFFFFF]">
            {isLoading ? "Processing..." : "Accept And Continue"}
          </span>
          <span className="inline-flex items-center justify-center w-8 h-8 ml-auto">
            {isLoading ? (
              <ButtonLoader color="#FFFFFF" size={20} thickness={3} />
            ) : (
              <svg
                width="22"
                height="22"
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
            )}
          </span>
        </button>
      </div>
    </div>
  );
};

export default AepsAcceptanceThree;
