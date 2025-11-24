import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCompany } from "../context/CompanyContext";
import { mobileOtpResponse, otpSubmitResponse } from "../redux/action/retailerOnboardingAction";
import secureLocalStorage from "react-secure-storage";
import { useNotification } from "../context/NotificationContext";

function Step1({ formData, setFormData, onNext, referralCode: propReferralCode }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { company } = useCompany();
  const { showNotification } = useNotification();
  const companyFromRedux = useSelector((state) => state?.company?.company);
  const companyData = companyFromRedux || company;
  const retailerOnboardingState = useSelector((state) => state?.retailerOnboarding);
  const validationSchema = Yup.object({
    phone: Yup.string()
      .matches(/^[6-9]\d{9}$/, "Enter valid 10-digit mobile number")
      .required("Mobile number is required"),
    otp: Yup.string()
      .matches(/^\d{4,6}$/, "Enter valid OTP")
      .required("OTP is required"),
  });

  const formik = useFormik({
    initialValues: {
      phone: formData.phone || "",
      otp: formData.otp || "",
    },
    validationSchema,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: async (values, { setFieldTouched, setFieldError }) => {
      // Validate OTP only on submit
      const otpErrors = await formik.validateField("otp");
      if (otpErrors) {
        setFieldTouched("otp", true);
        if (!values.otp) {
          setFieldError("otp", "OTP is required");
        }
      }
      // Check if OTP is empty
      if (!formik.values.otp || formik.values.otp.trim() === "") {
        setFieldTouched("otp", true);
        setFieldError("otp", "OTP is required");
        return;
      }

      // Prepare request body with OTP
      const requestBody = {
        otp: formik.values.otp,
      };

      // Get UserTokenToken from Redux state
      const token = UserTokenToken;

      console.log("Submitting OTP:", requestBody);
      console.log("Using token:", token);

      if (!token) {
        console.error("Token is missing. Cannot submit OTP.");
        setFieldError("otp", "Token is missing. Please try again.");
        return;
      }

      try {
        // Mark that OTP has been submitted
        otpSubmittedRef.current = true;
        // Dispatch the otpSubmitResponse action
        const result = await dispatch(otpSubmitResponse(requestBody, companyData, token));

      } catch (error) {
        console.error("Error submitting OTP:", error);
        // On error, proceed to next step
        console.log("OTP submission error, proceeding to next step");
        try {
          localStorage.setItem("step1Completed", "true");
          setFormData((d) => ({ ...d, otpVerified: true }));
        } catch (e) {
          console.error("Error marking step1 as completed:", e);
        }
        onNext();
      }
    },
  });

  const otpSubmitStatus = useSelector((state) => state?.retailerOnboarding?.OTPSubmitResponse?.status);
  const OTPSubmitResponseData = useSelector((state) => state?.retailerOnboarding?.OTPSubmitResponse);
  const FailureOTP = useSelector((state) => state?.error?.onBoarding?.onBoarding?.status);
  const retailerOnboardingFailure = useSelector((state) => state?.retailerOnboarding?.status);
  const errorPayload = useSelector((state) => state?.error?.error);
  const errorMessage = useSelector((state) => state?.error?.message);
  const retailerOnboardingError = useSelector((state) => state?.retailerOnboarding?.error);

  // Use refs to track if we've already handled success/failure to prevent multiple calls
  const successHandled = useRef(false);
  const failureHandled = useRef(false);
  const componentMounted = useRef(false);
  const otpSubmittedRef = useRef(false);

  // Reset refs on mount to allow fresh error detection
  useEffect(() => {
    componentMounted.current = true;
    failureHandled.current = false;
    successHandled.current = false;
    otpSubmittedRef.current = false;
    return () => {
      componentMounted.current = false;
    };
  }, []);

  // Handle OTP submit success - stores data from /api/v1/user/onboarding/verifySmsOtp
  useEffect(() => {
    if (otpSubmitStatus === "SUCCESS" && !successHandled.current && OTPSubmitResponseData) {
      successHandled.current = true;
      
      // Get the data object from response
      // Response structure from action: { OTPResponse: { userToken: "...", steps: [...], pending: [...] }, Success, status, message }
      // So we need to access OTPResponse property, not data
      const responseData = OTPSubmitResponseData?.OTPResponse || OTPSubmitResponseData?.data || OTPSubmitResponseData;
      
      console.log("Response data from verifySmsOtp:", responseData);
      if (responseData) {
        // Store userToken as onboardingToken
        if (responseData.userToken) {
          try {
            secureLocalStorage.setItem("onboardingToken", responseData.userToken);
            console.log("Stored onboardingToken from verifySmsOtp successfully:", responseData.userToken);
          } catch (e) {
            console.error("Error storing onboardingToken from verifySmsOtp:", e);
          }
        } else {
          console.warn("No userToken found in verifySmsOtp response:", responseData);
        }

        // Store steps array in secureStorage as pendingStatus
        if (responseData.steps && Array.isArray(responseData.steps)) {
          try {
            const stepsJson = JSON.stringify(responseData.steps);
            console.log("Storing steps in pendingStatus from verifySmsOtp:", stepsJson);
            secureLocalStorage.setItem("pendingStatus", stepsJson);
            
            // Verify storage worked
            const stored = secureLocalStorage.getItem("pendingStatus");
            if (stored) {
              console.log("Steps stored successfully in pendingStatus from verifySmsOtp");
              console.log("Verified stored data:", stored);
            } else {
              console.error("Failed to verify steps storage from verifySmsOtp");
            }
          } catch (e) {
            console.error("Error storing steps from verifySmsOtp:", e);
          }
        } else {
          console.warn("No steps array found in verifySmsOtp response:", responseData);
        }
      } else {
        console.warn("No response data found in OTPSubmitResponseData:", OTPSubmitResponseData);
      }

      // Mark step 1 as completed and proceed
      try {
        setFormData((d) => ({ ...d, otpVerified: true }));
      } catch (e) {
        console.error("Error marking step1 as completed:", e);
      }
      onNext();
    }
    // Reset when status changes away from SUCCESS
    if (otpSubmitStatus !== "SUCCESS") {
      successHandled.current = false;
    }
  }, [otpSubmitStatus, OTPSubmitResponseData, setFormData, onNext]);
  useEffect(() => {
    const isFailure = FailureOTP === "FAILURE" || FailureOTP === "Invalid referral code" || errorMessage === "Invalid referral code" || errorMessage === "FAILURE";

    if (isFailure && !failureHandled.current && componentMounted.current && otpSubmittedRef.current) {
      failureHandled.current = true;

      try {
        localStorage.removeItem("step1Completed");
        localStorage.removeItem("referralCodeCompleted");
      } catch (e) {
        console.error("Error clearing localStorage:", e);
      }

      // Log the full failure response
    }
    // Reset when status changes away from failure conditions
    if (!isFailure) {
      failureHandled.current = false;
    }
  }, [FailureOTP, errorPayload, errorMessage, retailerOnboardingFailure, retailerOnboardingError, otpSubmitStatus]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    formik.setFieldValue(name, value);
    setFormData((d) => ({ ...d, [name]: value }));
    
    // Clear OTP error when user starts typing (only for OTP field)
    if (name === "otp" && formik.errors.otp) {
      formik.setFieldError("otp", undefined);
    }
  };

  const sendOtp = async () => {
    await formik.setFieldTouched("phone", true, true);
    const errors = await formik.validateForm();

    if (errors.phone) {
      formik.setErrors({ phone: errors.phone });
      return;
    }

    // Get referral code from prop, localStorage, or Redux state (in that order)
    let referCode = null;

    // First priority: prop from parent component
    if (propReferralCode && typeof propReferralCode === 'string' && propReferralCode.trim() !== "") {
      referCode = propReferralCode.trim();
      console.log("Using referral code from prop:", referCode);
    } else {
      // Second priority: localStorage (from URL)
      try {
        const storedFromUrl = localStorage.getItem("referralCodeFromUrl");
        if (storedFromUrl) {
          referCode = storedFromUrl.trim();
          console.log("Retrieved referCode from localStorage (URL):", referCode);
        }
      } catch (e) {
        console.error("Error reading referral code from localStorage:", e);
      }

      // Third priority: localStorage (from form submission)
      if (!referCode) {
        try {
          const storedReferral = localStorage.getItem("referralCodeCompleted");
          if (storedReferral) {
            const parsed = JSON.parse(storedReferral);
            console.log("Full localStorage data:", parsed);
            referCode = parsed?.referCode || null;
            console.log("Retrieved referCode from localStorage:", referCode);
          }
        } catch (e) {
          console.error("Error reading referral code from localStorage:", e);
        }
      }

      // Fourth priority: Redux state
      if (!referCode) {
        referCode = retailerOnboardingState?.referalResponse?.referCode || null;
        console.log("Retrieved referCode from Redux:", referCode);
      }
    }

    const requestBody = {
      mobileNo: formik.values.phone,
    };

    // Always add referral code if it exists and is not empty
    if (referCode && typeof referCode === 'string' && referCode.trim() !== "") {
      requestBody.referCode = referCode.trim().toUpperCase();
      console.log("Adding referCode to request:", requestBody.referCode);
    } else {
      console.warn("referCode is missing or invalid:", referCode);
    }

    // Dispatch the action
    try {
      dispatch(mobileOtpResponse(requestBody, companyData));
      setFormData((d) => ({ ...d, otpSent: true }));
    } catch (error) {
      console.error("Error sending OTP:", error);
    }
  };

  const UserTokenToken = useSelector((state) => state?.retailerOnboarding?.OTPResponse?.OTPResponse?.userToken);
  const OTPResponseStatus = useSelector((state) => state?.retailerOnboarding?.OTPResponse?.status);
  const OTPResponseData = useSelector((state) => state?.retailerOnboarding?.OTPResponse?.OTPResponse);

  // Countdown timer state for resend OTP
  const [resendCountdown, setResendCountdown] = useState(0);

  // Check if mobile is already verified - handles response from /api/v1/user/onboarding/sendSmsOtp
  useEffect(() => {
    // Check if response is successful and has verified status
    // Response structure: { status: "SUCCESS", message: "...", data: { status: "verified", ... } }
    const isVerified = OTPResponseStatus === "SUCCESS" && 
                      (OTPResponseData?.status === "verified" || OTPResponseData?.data?.status === "verified");
    
    if (isVerified) {
      // Get the data object - it might be directly in OTPResponseData or in OTPResponseData.data
      const verifiedData = OTPResponseData?.data || OTPResponseData;
      
      if (!verifiedData) {
        console.warn("No verified data found in response");
        return;
      }
      
      // Show success notification
      const responseMessage = OTPResponseData?.message || OTPResponseData?.data?.message || "Mobile already verified";
      showNotification({
        type: "success",
        message: responseMessage,
      });

      // Store userToken as onboardingToken
      if (verifiedData.userToken) {
        try {
          secureLocalStorage.setItem("onboardingToken", verifiedData.userToken);
          console.log("Stored onboardingToken successfully");
        } catch (e) {
          console.error("Error storing onboardingToken:", e);
        }
      }

      // Store steps array in secureStorage as pendingStatus (from /api/v1/user/onboarding/sendSmsOtp response)
      if (verifiedData.steps && Array.isArray(verifiedData.steps)) {
        try {
          const stepsJson = JSON.stringify(verifiedData.steps);
          console.log("Storing steps in pendingStatus:", stepsJson);
          secureLocalStorage.setItem("pendingStatus", stepsJson);
          
          // Verify storage worked
          const stored = secureLocalStorage.getItem("pendingStatus");
          if (stored) {
            console.log("Steps stored successfully in pendingStatus");
            console.log("Verified stored data:", stored);
          } else {
            console.error("Failed to verify steps storage");
          }
        } catch (e) {
          console.error("Error storing steps:", e);
        }
      } else {
        console.warn("No steps array found in verifiedData:", verifiedData);
      }

      // Update formData with verified status
      setFormData((prev) => ({
        ...prev,
        phone: verifiedData.mobileNo || prev.phone,
        otpVerified: verifiedData.mobileVerify || false,
        emailOtpVerified: verifiedData.emailVerify || false,
        aadhaarDocFetched: verifiedData.aadharVerify || false,
        panDocFetched: verifiedData.panVerify || false,
        bankAccountNumber: verifiedData.bankVerify ? prev.bankAccountNumber : "",
        ifscCode: verifiedData.bankVerify ? prev.ifscCode : "",
        completed: verifiedData.allCompleted || false,
        userRole: verifiedData.userRole || prev.userRole,
      }));

      // If all completed, mark as completed
      if (verifiedData.allCompleted) {
        setFormData((prev) => ({ ...prev, completed: true }));
      }

      // Navigate to onboarding index page after storing
      // Use setTimeout to ensure storage is complete before navigation
      setTimeout(() => {
        // Get current path
        const currentPath = window.location.pathname;
        const referCode = formData.referralCode;
        
        // Navigate to show steps - if we have a referral code, use it in the URL
        if (referCode && currentPath.includes('/unity')) {
          // Already on unity route with referral code, just trigger parent update
          // The parent component will detect the storage change and update
          window.location.reload();
        } else if (referCode) {
          // Navigate to unity route with referral code
          navigate(`/unity/${referCode}`);
        } else {
          // Navigate to unity route without referral code
          navigate('/unity');
        }
      }, 200);
    }
  }, [OTPResponseStatus, OTPResponseData, setFormData, showNotification, navigate, formData.referralCode]);

  // Start countdown when OTP is sent successfully
  useEffect(() => {
    if (OTPResponseStatus === "SUCCESS" && OTPResponseData?.status !== "verified") {
      setResendCountdown(30);
    }
  }, [OTPResponseStatus, OTPResponseData]);

  // Countdown timer effect
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Note: Failure handling is now managed by the parent component
  // If there's a failure, the parent will handle navigation/error display

  return (
    <div
      className="
    w-full 
    h-full 
    flex 
    justify-center 
    items-center 
    p-2
    sm:p-4
    md:p-5
    lg:p-6
    overflow-hidden
  "
    >
      <div
        className="
        w-full 
        max-w-[99%]
        sm:max-w-[500px]
        md:max-w-[450px] 
        lg:max-w-[500px]
        xl:max-w-[550px]
        bg-white 
        rounded-xl 
        shadow-md 
        p-4
        sm:p-6
        md:p-6
        lg:p-7
        mx-auto
      "
      >

        <h3 className="text-lg sm:text-xl md:text-xl lg:text-2xl font-semibold text-gray-800 text-center mb-3 sm:mb-4 md:mb-4">
          Mobile Verification
        </h3>

        <p className="text-gray-600 text-sm sm:text-base md:text-base text-center mb-4 sm:mb-5 md:mb-5">
          Enter your mobile number to receive OTP
        </p>

        {/* PHONE INPUT */}
        <div className="mb-4 sm:mb-5 md:mb-5">
          <label className="block text-sm sm:text-base md:text-base font-medium text-gray-800 mb-2 sm:mb-3">
            Mobile Number
          </label>

          <div className="flex">
            <div className="relative flex-grow">
              <img
                src="/img/PhoneCall2.png"
                alt="Phone"
                className="absolute left-4 sm:left-5 md:left-4 top-1/2 -translate-y-1/2 w-5 sm:w-6 md:w-5 opacity-60 z-10"
              />
              <div
                className={`absolute left-12 sm:left-14 md:left-12 top-1/2 -translate-y-1/2 h-5 sm:h-6 md:h-5 w-px transition ${formData.phone ? "bg-[#1B1717]" : "bg-gray-300"
                  }`}
              />
              <input
                type="tel"
                name="phone"
                value={formik.values.phone}
                onChange={handleChange}
                placeholder="Enter your number"
                className={`w-full h-12 sm:h-14 md:h-12 lg:h-14 border-2 border-r-0 ${formik.errors.phone ? "border-red-500" : "border-[#1B1717]"
                  } rounded-l-xl rounded-r-none pl-12 sm:pl-16 md:pl-12 pr-4 sm:pr-5 md:pr-4 text-base sm:text-lg md:text-base outline-none focus:border-[#1B1717] focus:border-r-0 transition`}
              />
            </div>

            <button
              type="button"
              onClick={sendOtp}
              disabled={resendCountdown > 0}
              className={`px-2 sm:px-4 md:px-4 lg:px-5 rounded-r-xl rounded-l-none border-2 border-l-0 text-xs sm:text-sm md:text-sm lg:text-base font-semibold transition h-12 sm:h-14 md:h-12 lg:h-14 flex-shrink-0 whitespace-nowrap shadow-md ${OTPResponseStatus === "SUCCESS"
                ? "w-[95px] sm:w-[100px] md:w-[95px] lg:w-[100px]"
                : "w-[90px] sm:w-[95px] md:w-[90px] lg:w-[95px]"
                } ${resendCountdown > 0
                  ? "bg-gray-400 border-gray-400 text-white cursor-not-allowed"
                  : "bg-[#039155] text-white border-[#1B1717] hover:bg-green-700 hover:border-[#1B1717]"
                }`}
            >
              {OTPResponseStatus === "SUCCESS" && resendCountdown > 0
                ? `Resend (${resendCountdown}s)`
                : OTPResponseStatus === "SUCCESS"
                  ? "Resend"
                  : "Verify"}
            </button>
          </div>

          {formik.errors.phone && (
            <p className="text-red-500 text-sm sm:text-base mt-2">{formik.errors.phone}</p>
          )}
        </div>

        {/* OTP INPUT */}
        <div className="mb-4 sm:mb-5 md:mb-5">
          <label className="block text-sm sm:text-base md:text-base font-medium text-gray-800 mb-2 sm:mb-3">
            Enter OTP
          </label>

          <div className="relative">
            <img
              src="/img/DeviceMobileCamera.png"
              alt="OTP"
              className="absolute left-4 sm:left-5 md:left-4 top-1/2 -translate-y-1/2 w-5 sm:w-6 md:w-5 opacity-60 z-10"
            />
            <div
              className={`absolute left-12 sm:left-14 md:left-12 top-1/2 -translate-y-1/2 h-5 sm:h-6 md:h-5 w-px transition ${formData.phone ? "bg-[#1B1717]" : "bg-gray-300"
                }`}
            />

            <input
              type="text"
              name="otp"
              value={formik.values.otp}
              onChange={handleChange}
              onBlur={(e) => {
                // Don't validate on blur, just handle the blur event
                formik.handleBlur(e);
              }}
              placeholder="Enter Mobile OTP"
              className={`w-full h-12 sm:h-14 md:h-12 lg:h-14 border-2 ${formik.errors.otp && formik.touched.otp ? "border-red-500" : "border-[#1B1717]"
                } rounded-xl pl-12 sm:pl-16 md:pl-12 pr-4 sm:pr-5 md:pr-4 text-base sm:text-lg md:text-base outline-none focus:border-[#1B1717] transition`}
            />
          </div>

          {formik.errors.otp && formik.touched.otp && (
            <p className="text-red-500 text-sm sm:text-base mt-2">{formik.errors.otp}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="button"
          onClick={formik.handleSubmit}
          className="w-full bg-[#039155] text-white py-3 sm:py-3.5 md:py-3 lg:py-3.5 rounded-xl font-semibold text-base sm:text-lg md:text-base lg:text-lg hover:bg-green-700 transition shadow-lg mt-4 sm:mt-5 md:mt-5"
        >
          Submit
        </button>
      </div>
    </div>
  );
}

export default Step1;
