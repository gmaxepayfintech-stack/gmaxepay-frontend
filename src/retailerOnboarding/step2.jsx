import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useCompany } from "../context/CompanyContext";
import { emailOtpResponse } from "../redux/action/retailerOnboardingAction";

function Step2({ formData, setFormData, onNext }) {
  const dispatch = useDispatch();
  const { company } = useCompany();
  const companyFromRedux = useSelector((state) => state?.company?.company);
  const companyData = companyFromRedux || company;
  const [successCooldown, setSuccessCooldown] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((d) => ({ ...d, [name]: value }));
  };

  const sendEmailOtp = async () => {
    if (!formData.email) {
      return;
    }

    // Prepare request body with email
    const requestBody = {
      email: formData.email || "kamalesh.k.kulal@gmail.com",
    };

    console.log("Sending Email OTP:", requestBody);
    console.log("Using companyData:", companyData);

    // Dispatch the emailOtpResponse action (same pattern as step1's mobileOtpResponse)
    try {
      dispatch(emailOtpResponse(requestBody, companyData));
      setFormData((d) => ({ ...d, emailOtpSent: true }));
    } catch (error) {
      console.error("Error sending Email OTP:", error);
    }
  };

  const handleResendOtp = () => {
    // Resend uses the same function as send
    sendEmailOtp();
  };

  const submitEmailOtp = () => {
    // For now, just proceed to next step
    // OTP verification can be added later if needed
    if (!formData.emailOtp) {
      onNext();
      return;
    }
    onNext();
  };

  // Get email OTP response status from Redux (retailerOnboarding state)
  // The payload structure is: { emailSendEmailOtpResponse, Success, status, message }
  const emailOtpStatus = useSelector(
    (state) => state?.retailerOnboarding?.emailSendEmailOtpResponse?.status || state?.retailerOnboarding?.status
  );

  const verifuSuccess = emailOtpStatus === "SUCCESS" ? "SUCCESS" : null;

  const emailVerifyStatus = null; // Can be added later for OTP verification
  const emailVerifyMessage = null; // Can be added later for error messages

  useEffect(() => {
    if (verifuSuccess === "SUCCESS") {
      setSuccessCooldown(30); // Set countdown to 30 seconds like step1
    }
  }, [verifuSuccess]);

  useEffect(() => {
    if (successCooldown > 0) {
      const interval = setInterval(() => setSuccessCooldown((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [successCooldown]);

  useEffect(() => {
    if (emailVerifyStatus === "SUCCESS") {
      onNext();
    }
  }, [emailVerifyStatus]);

  // If FailureOTP indicates failure, navigate to Welcome component
  // Only navigate if this is a fresh error from an actual email OTP submission (not a stale one from previous attempts)
  useEffect(() => {
    // Check if FailureOTP is "FAILURE" or "Invalid referral code"
    const isFailure = FailureOTP === "FAILURE" || FailureOTP === "Invalid referral code" || errorMessage === "Invalid referral code" || errorMessage === "FAILURE";
    
    // Only handle if:
    // 1. Component is mounted
    // 2. We haven't handled this error yet
    // 3. Email OTP was actually sent in this component instance (to avoid redirecting on stale errors)
    if (isFailure && !failureHandled.current && componentMounted.current && emailOtpSentRef.current) {
      failureHandled.current = true;
      
      try {
        localStorage.removeItem("step1Completed");
        localStorage.removeItem("referralCodeCompleted");
      } catch (e) {
        console.error("Error clearing localStorage:", e);
      }
      
      // Log the full failure response
      console.log("Email OTP submission FAILURE - Full API Response Details:", {
        errorReducer: {
          status: FailureOTP,
          error: errorPayload,
          message: errorMessage,
        },
        retailerOnboardingReducer: {
          status: retailerOnboardingFailure,
          error: retailerOnboardingError,
        },
      });
      
      console.log("Failure detected - Navigating to Welcome component");
      
      // Navigate to Welcome component
      navigate("/setup", { replace: true });
    }
    // Reset when status changes away from failure conditions
    if (!isFailure) {
      failureHandled.current = false;
    }
  }, [FailureOTP, errorPayload, errorMessage, retailerOnboardingFailure, retailerOnboardingError, navigate]);

  const handleVerifyOrResend = () => {
    if (verifuSuccess === "SUCCESS") {
      if (successCooldown === 0) handleResendOtp();
    } else {
      sendEmailOtp();
    }
  };

  return (
    <div className="w-full h-screen bg-gray-50 flex items-center justify-center p-2 sm:p-3 md:p-4 overflow-hidden">
      {/* CARD CONTAINER */}
      <div
        className="
          w-full 
          max-w-[95%]
          sm:w-[400px]
          md:w-[500px]    
          lg:w-[550px]    
          bg-white 
          rounded-xl 
          shadow-md 
          p-3 sm:p-5 md:p-6
          mx-auto
        "
      >
        <div className="mb-2 sm:mb-3 text-center">
          <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900">
            Complete Your KYC
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm md:text-base mt-1">
            Secure your account by completing verification
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={(e) => e.preventDefault()}>

          <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-center text-gray-900 mb-2">
            Email Verification
          </h3>

          <p className="text-gray-600 text-xs sm:text-sm md:text-base text-center mb-3 sm:mb-4">
            Enter your Email address to receive the OTP
          </p>

          {/* EMAIL FIELD */}
          <div className="mb-3 sm:mb-4">
            <label
              className="
                block 
                text-xs
                sm:text-sm 
                font-medium 
                text-gray-800 
                mb-1
                sm:mb-2
                md:text-lg
              "
            >
              Email ID
            </label>

            <div className="flex">
              <div className="relative flex-grow">
                <img
                  src="/img/Emailicon.png"
                  alt="Email"
                  className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 sm:w-5 opacity-60"
                />
                <div className="absolute left-9 sm:left-11 top-1/2 -translate-y-1/2 w-px h-5 sm:h-6 bg-gray-300" />

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your Email"
                  className="
                    w-full 
                    h-12
                    sm:h-[60px]
                    md:h-[70px]
                    border 
                    border-gray-300 
                    rounded-l-lg
                    rounded-r-none
                    pl-10
                    sm:pl-14 
                    pr-3
                    sm:pr-4
                    text-sm
                    sm:text-base 
                    md:text-xl
                    outline-none
                    focus:border-[#1B1717]
                  "
                />
              </div>

              <button
                type="button"
                onClick={handleVerifyOrResend}
                disabled={verifuSuccess === "SUCCESS" && successCooldown > 0}
                className={`
                  bg-[#039155] 
                  text-white 
                  rounded-r-lg
                  px-3
                  sm:px-4
                  md:px-6
                  text-xs
                  sm:text-sm
                  md:text-base
                  lg:text-xl
                  font-medium
                  h-12
                  sm:h-[60px]
                  md:h-[70px]
                  hover:bg-green-700 
                  transition
                  whitespace-nowrap
                  flex-shrink-0
                  ${verifuSuccess === "SUCCESS" && successCooldown > 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : ""
                  }
                `}
              >
                {verifuSuccess === "SUCCESS"
                  ? successCooldown > 0
                    ? `Resend (${successCooldown}s)`
                    : "Resend OTP"
                  : "Verify"}
              </button>
            </div>
          </div>

          {/* OTP FIELD */}
          <div className="mb-3 sm:mb-4">
            <label
              className="
                block 
                text-xs
                sm:text-sm 
                font-medium 
                text-gray-800 
                mb-1
                sm:mb-2
                md:text-lg
              "
            >
              Enter OTP
            </label>

            <div className="relative">
              <img
                src="/img/DeviceMobileCamera.png"
                alt="OTP"
                className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 sm:w-5 opacity-60"
              />
              <div className="absolute left-9 sm:left-11 top-1/2 -translate-y-1/2 w-px h-5 sm:h-6 bg-gray-300" />

              <input
                type="text"
                name="emailOtp"
                value={formData.emailOtp}
                onChange={handleChange}
                placeholder="Enter Email OTP"
                className="
                  w-full 
                  h-12
                  sm:h-[60px]
                  md:h-[70px]
                  border 
                  border-gray-300 
                  rounded-lg 
                  pl-10
                  sm:pl-14 
                  pr-3
                  sm:pr-4
                  text-sm
                  sm:text-base 
                  md:text-xl
                  outline-none
                  focus:border-[#1B1717]
                "
              />
            </div>

            {emailVerifyStatus !== "SUCCESS" && emailVerifyMessage && (
              <p className="text-red-500 mt-1 sm:mt-2 text-xs sm:text-sm">{emailVerifyMessage}</p>
            )}
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="button"
            onClick={submitEmailOtp}
            className="
              w-full 
              bg-[#039255] 
              text-white 
              py-2.5
              sm:py-3
              md:py-3.5
              rounded-lg 
              text-sm
              sm:text-base
              md:text-lg
              font-semibold 
              hover:bg-green-700
              transition
              shadow-md
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
