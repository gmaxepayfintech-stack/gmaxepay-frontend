import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useCompany } from "../context/CompanyContext";
import {
  emailOtpResponse,
  emailRescendOTP,
  submitEmail,
} from "../redux/action/retailerOnboardingAction";
import secureLocalStorage from "react-secure-storage";
import { useNotification } from "../context/NotificationContext";
import { HiArrowLeft } from "react-icons/hi2";

function Step2({ formData, setFormData, onNext, onBack, onShowSteps }) {
  const dispatch = useDispatch();
  const { referCode: urlReferralCode } = useParams();
  const { company } = useCompany();
  const { showNotification } = useNotification();
  const companyFromRedux = useSelector((state) => state?.company?.company);
  const companyData = companyFromRedux || company;
  const [successCooldown, setSuccessCooldown] = useState(0);

  // Ref to track if email OTP has been sent
  const emailOtpSentRef = useRef(false);

  // Get referCode from URL or localStorage
  const getReferCode = () => {
    if (urlReferralCode) return urlReferralCode.toUpperCase();
    try {
      const stored = localStorage.getItem("referralCodeFromUrl");
      if (stored) return stored.toUpperCase();
    } catch (e) {
      console.error("Error reading referCode:", e);
    }
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // For OTP field, only allow numbers and max 6 digits
    if (name === "emailOtp") {
      // Remove any non-numeric characters
      const numericValue = value.replace(/\D/g, "");
      // Limit to 6 digits
      const limitedValue = numericValue.slice(0, 6);
      setFormData((d) => ({ ...d, [name]: limitedValue }));
    } else {
      setFormData((d) => ({ ...d, [name]: value }));
    }
  };

  const sendEmailOtp = async () => {
    // Validate email before sending
    if (!formData.email || !formData.email.trim()) {
      console.error("Email is required");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      console.error("Invalid email format");
      return;
    }

    // Get token from secureLocalStorage
    const token = secureLocalStorage.getItem("onboardingToken");

    // Prepare request body with email
    const requestBody = {
      email: formData.email.trim(),
    };

    // Mark that email OTP has been sent
    emailOtpSentRef.current = true;

    try {
      dispatch(emailOtpResponse(requestBody, companyData, token));
      setFormData((d) => ({ ...d, emailOtpSent: true }));
    } catch (error) {
      console.error("Error sending Email OTP:", error);
    }
  };

  const handleResendOtp = async () => {
    if (!formData.email || !formData.email.trim()) {
      console.error("Email is required");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      console.error("Invalid email format");
      return;
    }

    // Get token from secureLocalStorage
    const token = secureLocalStorage.getItem("onboardingToken");

    // Prepare request body with email
    const requestBody = {
      email: formData.email.trim(),
    };

    // console.log("Resending Email OTP:", requestBody);
    // console.log("Using companyData:", companyData);
    // console.log("Using token from secureLocalStorage:", token);

    // Dispatch the emailRescendOTP action (calls sendEmailOtp endpoint)
    try {
      dispatch(emailRescendOTP(requestBody, companyData, token));
      // Reset countdown will be handled by useEffect when status becomes SUCCESS
    } catch (error) {
      console.error("Error resending Email OTP:", error);
    }
  };

  const submitEmailOtp = async () => {
    if (!formData.emailOtp || !formData.emailOtp.trim()) {
      console.error("OTP is required");
      return;
    }

    // Validate OTP is 6 digits
    if (formData.emailOtp.length !== 6) {
      console.error("OTP must be 6 digits");
      return;
    }

    // Get token from secureLocalStorage
    const token = secureLocalStorage.getItem("onboardingToken");

    // Prepare request body with OTP
    const requestBody = {
      otp: formData.emailOtp.trim(),
    };

    // console.log("Submitting Email OTP:", requestBody);
    // console.log("Using companyData:", companyData);
    // console.log("Using token from secureLocalStorage:", token);

    // Dispatch the submitEmail action (calls verifyEmailOtp endpoint)
    try {
      dispatch(submitEmail(requestBody, companyData, token));
    } catch (error) {
      console.error("Error submitting Email OTP:", error);
    }
  };

  const emailOtpStatus = useSelector(
    (state) => state?.retailerOnboarding?.emailSendEmailOtpResponse?.status,
  );

  const verifuSuccess = emailOtpStatus === "SUCCESS" ? "SUCCESS" : null;

  // Get email OTP submit status from Redux
  // Check specifically for submit response, not resend
  const emailSubmitStatus = useSelector(
    (state) => state?.retailerOnboarding?.emailSubmitEmailOtpResponse?.status,
  );

  const emailSubmitMessage = useSelector(
    (state) => state?.retailerOnboarding?.emailSubmitEmailOtpResponse?.message,
  );

  // Get the full submit response data
  const emailSubmitResponse = useSelector(
    (state) => state?.retailerOnboarding?.emailSubmitEmailOtpResponse,
  );

  // Also get resend status for cooldown
  const emailResendStatus = useSelector(
    (state) => state?.retailerOnboarding?.emailReSendOtp?.status,
  );

  useEffect(() => {
    if (verifuSuccess === "SUCCESS") {
      setSuccessCooldown(180); // Set countdown to 3 minutes (180 seconds)
    }
  }, [verifuSuccess]);

  // Also trigger cooldown when resend is successful
  useEffect(() => {
    if (emailResendStatus === "SUCCESS") {
      setSuccessCooldown(180); // Set countdown to 3 minutes (180 seconds) on resend
    }
  }, [emailResendStatus]);

  useEffect(() => {
    if (successCooldown > 0) {
      const interval = setInterval(
        () => setSuccessCooldown((t) => t - 1),
        1000,
      );
      return () => clearInterval(interval);
    }
  }, [successCooldown]);

  // Use ref to prevent multiple navigations
  const emailSubmitHandled = useRef(false);

  useEffect(() => {
    if (
      emailSubmitStatus === "SUCCESS" &&
      emailSubmitResponse &&
      !emailSubmitHandled.current
    ) {
      emailSubmitHandled.current = true;

      // Get the data object from response
      // Response structure from action: { emailSubmitEmailOtpResponse: { steps: [...], pending: [...], userToken: "..." }, status, message }
      const responseData =
        emailSubmitResponse?.emailSubmitEmailOtpResponse ||
        emailSubmitResponse?.data ||
        emailSubmitResponse;

      //console.log("Email verification submit response data:", responseData);

      if (responseData) {
        // Store userToken as onboardingToken if provided
        if (responseData.userToken) {
          try {
            secureLocalStorage.setItem(
              "onboardingToken",
              responseData.userToken,
            );
            // console.log(
            //   "Stored onboardingToken from email verification successfully:",
            //   responseData.userToken,
            // );
          } catch (e) {
            console.error(
              "Error storing onboardingToken from email verification:",
              e,
            );
          }
        } else {
          console.warn(
            "No userToken found in email verification response:",
            responseData,
          );
        }
      } else {
        console.warn(
          "No response data found in emailSubmitResponse:",
          emailSubmitResponse,
        );
      }

      // Show success notification
      showNotification({
        type: "success",
        message:
          emailSubmitMessage ||
          emailSubmitResponse?.message ||
          "Email verified successfully",
      });

      // Update formData
      setFormData((d) => ({ ...d, emailOtpVerified: true }));

      // Show steps page instead of redirecting
      if (onShowSteps) {
        setTimeout(() => {
          onShowSteps();
        }, 500);
      }
    }

    // Reset when status changes away from SUCCESS
    if (emailSubmitStatus !== "SUCCESS") {
      emailSubmitHandled.current = false;
    }
  }, [
    emailSubmitStatus,
    emailSubmitResponse,
    emailSubmitMessage,
    showNotification,
    setFormData,
    onShowSteps,
  ]);

  // Format countdown timer to show minutes and seconds
  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleVerifyOrResend = () => {
    if (verifuSuccess === "SUCCESS") {
      if (successCooldown === 0) handleResendOtp();
    } else {
      sendEmailOtp();
    }
  };
  return (
    <div className="w-full h-full flex justify-center items-center bg-gray-50 p-2 sm:p-3 md:p-4 lg:p-4 xl:p-5 overflow-hidden pt-2 sm:pt-0 md:pt-1 lg:pt-1 xl:pt-2">
      <div className="w-full max-w-[98%] sm:max-w-[480px] md:max-w-[520px] lg:max-w-[580px] xl:max-w-[600px] 2xl:max-w-[700px] bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg p-3 sm:p-4 md:p-5 lg:p-5 xl:p-6 mx-auto">
        <form onSubmit={(e) => e.preventDefault()}>
          {/* TITLE */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-1 sm:mb-1.5 md:mb-2 lg:mb-2 xl:mb-3 relative">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 border border-gray-400 rounded-full hover:bg-gray-50 transition absolute left-0"
              >
                <HiArrowLeft className="text-base sm:text-lg md:text-xl text-[#1B1717] opacity-80" />
              </button>
            )}
            <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-[gilroy-semibold] text-center text-[#1B1717]">
              Email Verification
            </h3>
          </div>

          <p className="text-[#1B1717] font-[gilroy-regular] text-xs sm:text-xs md:text-sm lg:text-base text-center mb-3">
            Enter your Email address to receive the OTP
          </p>

          {/* EMAIL INPUT + VERIFY */}
          <div className="mb-3 md:mb-4">
            <label className="block text-xs md:text-sm font-[gilroy-semibold] text-[#1B1717] mb-2">
              Email ID
            </label>

            <div className="flex flex-row gap-0">
              {/* INPUT */}
              <div className="relative flex-grow">
                <img
                  src="/img/Emailicon.png"
                  alt="Email"
                  className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-[#1B1717]/70 z-10"
                />

                <div
                  className={`absolute left-9 md:left-11 top-1/2 -translate-y-1/2 h-4 md:h-5 w-px transition ${
                    formData.email ? "bg-[#1B1717]" : "bg-gray-300"
                  }`}
                />

                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  placeholder="Enter your Email"
                  className={`w-full h-10 md:h-11 lg:h-14
                  border-[0.5px] border-r-0
                  ${
                    emailSubmitMessage
                      ? "border-red-500"
                      : "border-[#1B1717]/80"
                  }
                  rounded-l-lg
                  pl-10 md:pl-12 lg:pl-14
                  pr-3
                  text-sm md:text-base
                  outline-none
                  focus:border-[#1B1717]/80
                  transition
                `}
                />
              </div>

              {/* VERIFY / RESEND */}
              <button
                type="button"
                onClick={handleVerifyOrResend}
                disabled={verifuSuccess === "SUCCESS" && successCooldown > 0}
                className={`h-10 md:h-11 lg:h-14
                px-3 md:px-4
                border-[0.5px] border-l-0
                ${emailSubmitMessage ? "border-red-500" : "border-[#039155]"}
                rounded-r-lg
                font-[gilroy-semibold]
                text-xs md:text-sm
                whitespace-nowrap
                shadow-md
                transition
                flex-shrink-0
                ${
                  verifuSuccess === "SUCCESS"
                    ? "w-[90px] md:w-[100px] lg:w-[110px]"
                    : "w-[80px] md:w-[90px] lg:w-[100px]"
                }
                ${
                  verifuSuccess === "SUCCESS" && successCooldown > 0
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-[#039155] text-white hover:bg-green-700"
                }
              `}
              >
                {verifuSuccess === "SUCCESS"
                  ? successCooldown > 0
                    ? `Resend (${formatCountdown(successCooldown)})`
                    : "Resend"
                  : "Verify"}
              </button>
            </div>
          </div>

          {/* EMAIL OTP */}
          <div className="mb-3 md:mb-4">
            <label className="block text-xs md:text-sm font-[gilroy-semibold] text-[#1B1717] mb-2">
              Enter OTP
            </label>

            <div className="relative">
              <img
                src="/img/DeviceMobileCamera.png"
                alt="OTP"
                className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-[#1B1717]/70 z-10"
              />

              <div
                className={`absolute left-9 md:left-11 top-1/2 -translate-y-1/2 h-4 md:h-5 w-px transition ${
                  formData.emailOtp ? "bg-[#1B1717]" : "bg-gray-300"
                }`}
              />

              <input
                id="emailOtp"
                type="text"
                name="emailOtp"
                value={formData.emailOtp || ""}
                onChange={handleChange}
                placeholder="Enter Email OTP"
                className={`w-full h-10 md:h-11 lg:h-14
                border-[0.5px]
                ${emailSubmitMessage ? "border-red-500" : "border-[#1B1717]/80"}
                rounded-lg
                pl-10 md:pl-12 lg:pl-14
                pr-3
                text-sm md:text-base
                outline-none
                focus:border-[#1B1717]/80
                transition
              `}
              />
            </div>

            {emailSubmitMessage && (
              <p className="text-red-500 text-xs md:text-sm mt-1.5">
                {emailSubmitMessage}
              </p>
            )}
          </div>

          {/* SUBMIT */}
          <button
            type="button"
            onClick={submitEmailOtp}
            className="w-full h-10 md:h-11 lg:h-14
            bg-[#039155]
            text-white
            rounded-lg md:rounded-xl
            font-[gilroy-semibold]
            text-sm md:text-base
            hover:bg-green-700
            transition
            shadow-lg
            mt-3
            flex items-center justify-center
          "
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default Step2;
