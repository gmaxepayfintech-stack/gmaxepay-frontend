import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, useRef } from "react";
import { useCompany } from "../context/CompanyContext";
import { mobileOtpResponse, otpSubmitResponse } from "../redux/action/retailerOnboardingAction";
import secureLocalStorage from "react-secure-storage";
import { useNotification } from "../context/NotificationContext";
import { HiOutlineArrowNarrowLeft } from "react-icons/hi";

function Step1({ formData, setFormData, onNext, onBack, referralCode: propReferralCode }) {
  const dispatch = useDispatch();
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

  // Get referCode helper
  const getReferCode = () => {
    if (propReferralCode) return propReferralCode.toUpperCase();
    try {
      const stored = localStorage.getItem("referralCodeFromUrl");
      if (stored) return stored.toUpperCase();
    } catch (e) {
      console.error("Error reading referCode:", e);
    }
    return null;
  };

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
      } else {
        console.warn("No response data found in OTPSubmitResponseData:", OTPSubmitResponseData);
      }

      // Mark step 1 as completed
      try {
        setFormData((d) => ({ ...d, otpVerified: true }));
      } catch (e) {
        console.error("Error marking step1 as completed:", e);
      }

      // Show success notification
      showNotification({
        type: "success",
        message: OTPSubmitResponseData?.message || "Mobile verification successful",
      });

      // Redirect to KYC index page using window.location.href
      setTimeout(() => {
        const referCode = getReferCode();
        if (referCode) {
          window.location.href = `/unity/${referCode}`;
        } else {
          window.location.href = `/unity`;
        }
      }, 500);
    }
    // Reset when status changes away from SUCCESS
    if (otpSubmitStatus !== "SUCCESS") {
      successHandled.current = false;
    }
  }, [otpSubmitStatus, OTPSubmitResponseData, setFormData, showNotification]);
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

      // Redirect to KYC index page using window.location.href
      setTimeout(() => {
        const referCode = getReferCode();
        if (referCode) {
          window.location.href = `/unity/${referCode}`;
        } else {
          window.location.href = `/unity`;
        }
      }, 200);
    }
  }, [OTPResponseStatus, OTPResponseData, setFormData, showNotification]);

  // Start countdown when OTP is sent successfully
  useEffect(() => {
    if (OTPResponseStatus === "SUCCESS" && OTPResponseData?.status !== "verified") {
      setResendCountdown(180); // 3 minutes (180 seconds)
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
    <div className="w-full h-full flex justify-center items-center bg-gray-50 p-2 sm:p-3 md:p-4 lg:p-4 xl:p-5 overflow-hidden pt-2 sm:pt-0 md:pt-1 lg:pt-1 xl:pt-2">
      <div className="w-full max-w-[98%] sm:max-w-[480px] md:max-w-[520px] lg:max-w-[580px] xl:max-w-[600px] 2xl:max-w-[700px] bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg p-3 sm:p-4 md:p-5 lg:p-5 xl:p-6 mx-auto">
        {/* Title with Back Button */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-1 sm:mb-1.5 md:mb-2 lg:mb-2 xl:mb-3 relative">
          {/* Back Button */}
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 xl:w-10 xl:h-10 border border-gray-400 rounded-full cursor-pointer hover:bg-gray-50 transition-colors flex-shrink-0 bg-transparent p-0 absolute left-0"
              aria-label="Back to Steps"
            >
              <HiOutlineArrowNarrowLeft className="text-base sm:text-lg md:text-xl lg:text-xl xl:text-xl text-[#1B1717] opacity-80" />
            </button>
          )}
          <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-2xl font-semibold text-center text-gray-800">
            Mobile Verification
          </h3>
        </div>

        <p className="text-gray-600 text-xs sm:text-xs md:text-sm lg:text-base xl:text-base text-center mb-2.5 sm:mb-3 md:mb-3.5 lg:mb-3 xl:mb-4">
          Enter your mobile number to receive OTP
        </p>

        {/* PHONE INPUT */}
        <div className="mb-2.5 sm:mb-3 md:mb-3.5 lg:mb-3 xl:mb-4">
          <label htmlFor="phone" className="block text-xs sm:text-xs md:text-sm lg:text-base xl:text-base font-medium text-gray-800 mb-1 sm:mb-1 md:mb-1.5 lg:mb-1.5 xl:mb-2">
            Mobile Number
          </label>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <div className="relative flex-grow">
              <img
                src="/img/PhoneCall2.png"
                alt="Phone"
                className="absolute left-2.5 sm:left-3 md:left-4 lg:left-5 xl:left-5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 opacity-60 z-10"
              />
              <div
                className={`absolute left-8 sm:left-9 md:left-10 lg:left-[50px] xl:left-[54px] top-1/2 -translate-y-1/2 h-3.5 sm:h-4 md:h-5 lg:h-7 xl:h-7 w-px transition ${formData.phone ? "bg-[#1B1717]" : "bg-gray-300"
                  }`}
              />
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formik.values.phone}
                onChange={handleChange}
                placeholder="Enter your number"
                className={`w-full h-10 sm:h-10 md:h-11 lg:h-14 xl:h-14 border-2 border-gray-300 sm:border-r-0 rounded-lg sm:rounded-l-lg sm:rounded-r-none ${formik.errors.phone ? "border-red-500" : "border-gray-300"
                  } pl-9 sm:pl-10 md:pl-12 lg:pl-14 xl:pl-18 pr-2.5 sm:pr-3 md:pr-3 lg:pr-4 xl:pr-5 text-sm sm:text-sm md:text-sm lg:text-base xl:text-base outline-none focus:border-gray-400 sm:focus:border-r-0 transition`}
              />
            </div>

            <button
              type="button"
              onClick={sendOtp}
              disabled={resendCountdown > 0}
              className={`px-2.5 sm:px-3 md:px-3 lg:px-4 xl:px-5 rounded-lg sm:rounded-r-lg sm:rounded-l-none sm:border-l-0 border-gray-300 text-xs sm:text-xs md:text-xs lg:text-sm xl:text-sm font-semibold transition h-10 sm:h-10 md:h-11 lg:h-14 xl:h-14 flex-shrink-0 whitespace-nowrap shadow-md ${OTPResponseStatus === "SUCCESS"
                ? "w-full sm:w-[90px] md:w-[100px] lg:w-[110px] xl:w-[120px]"
                : "w-full sm:w-[80px] md:w-[90px] lg:w-[100px] xl:w-[110px]"
                } ${resendCountdown > 0
                  ? "bg-gray-400 border-gray-400 text-white cursor-not-allowed"
                  : "bg-[#039155] text-white border-gray-300 hover:bg-green-700 hover:border-gray-400"
                }`}
            >
              {OTPResponseStatus === "SUCCESS" && resendCountdown > 0
                ? `Resend (${Math.floor(resendCountdown / 60)}:${String(resendCountdown % 60).padStart(2, '0')})`
                : OTPResponseStatus === "SUCCESS"
                  ? "Resend"
                  : "Verify"}
            </button>
          </div>

          {formik.errors.phone && (
            <p className="text-red-500 text-xs sm:text-xs md:text-xs lg:text-sm xl:text-sm mt-1 sm:mt-1 md:mt-1.5 lg:mt-2 xl:mt-2.5">{formik.errors.phone}</p>
          )}
        </div>

        {/* OTP INPUT */}
        <div className="mb-2.5 sm:mb-3 md:mb-3.5 lg:mb-3 xl:mb-4">
          <label htmlFor="otp" className="block text-xs sm:text-xs md:text-sm lg:text-base xl:text-base font-medium text-gray-800 mb-1 sm:mb-1 md:mb-1.5 lg:mb-1.5 xl:mb-2">
            Enter OTP
          </label>

          <div className="relative">
            <img
              src="/img/DeviceMobileCamera.png"
              alt="OTP"
              className="absolute left-2.5 sm:left-3 md:left-4 lg:left-5 xl:left-5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 opacity-60 z-10"
            />
            <div
              className={`absolute left-8 sm:left-9 md:left-10 lg:left-[50px] xl:left-[54px] top-1/2 -translate-y-1/2 h-3.5 sm:h-4 md:h-5 lg:h-7 xl:h-7 w-px transition ${formData.phone ? "bg-[#1B1717]" : "bg-gray-300"
                }`}
            />
            <input
              id="otp"
              type="text"
              name="otp"
              value={formik.values.otp}
              onChange={handleChange}
              onBlur={(e) => {
                // Don't validate on blur, just handle the blur event
                formik.handleBlur(e);
              }}
              placeholder="Enter Mobile OTP"
              className={`w-full h-10 sm:h-10 md:h-11 lg:h-14 xl:h-14 border-2 ${formik.errors.otp && formik.touched.otp ? "border-red-500" : "border-gray-300"
                } rounded-lg pl-9 sm:pl-10 md:pl-12 lg:pl-14 xl:pl-18 pr-2.5 sm:pr-3 md:pr-3 lg:pr-4 xl:pr-5 text-sm sm:text-sm md:text-sm lg:text-base xl:text-base outline-none focus:border-gray-400 transition`}
            />
          </div>

          {formik.errors.otp && formik.touched.otp && (
            <p className="text-red-500 text-xs sm:text-xs md:text-xs lg:text-sm xl:text-sm mt-1 sm:mt-1 md:mt-1.5 lg:mt-2 xl:mt-2.5">{formik.errors.otp}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="button"
          onClick={formik.handleSubmit}
          className="w-full bg-[#039155] text-white py-2 sm:py-2 md:py-2.5 lg:py-3 xl:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-sm md:text-sm lg:text-base xl:text-base hover:bg-green-700 transition shadow-lg mt-2.5 sm:mt-3 md:mt-3.5 lg:mt-3 xl:mt-4 h-10 sm:h-11 md:h-12 lg:h-14 xl:h-14"
        >
          Submit
        </button>
      </div>
    </div>
  );
}

export default Step1;
