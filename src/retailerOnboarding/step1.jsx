import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, useRef } from "react";
import { useCompany } from "../context/CompanyContext";
import { mobileOtpResponse, otpSubmitResponse } from "../redux/action/retailerOnboardingAction";
import Welcome from "../pages/welcome";

function Step1({ formData, setFormData, onNext }) {
  const dispatch = useDispatch();
  const { company } = useCompany();
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
    onSubmit: async () => {
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
        formik.setFieldError("otp", "Token is missing. Please try again.");
        return;
      }

      try {
        // Mark that OTP has been submitted
        otpSubmittedRef.current = true;
        // Dispatch the otpSubmitResponse action
        const result = await dispatch(otpSubmitResponse(requestBody, companyData, token));

        // Check the result or wait for state update
        // The useEffect will handle the failure case, but we can also check here
        console.log("OTP submit result:", result);
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
  const FailureOTP = useSelector((state) => state?.error?.onBoarding?.onBoarding?.status);
  console.log("FailureOTP", FailureOTP);
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

  useEffect(() => {
    if (otpSubmitStatus === "SUCCESS" && !successHandled.current) {
      successHandled.current = true;
      // Mark step 1 as completed and proceed
      try {
        localStorage.setItem("step1Completed", "true");
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
  }, [otpSubmitStatus, setFormData, onNext]);
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
      console.log("OTP submission FAILURE - Full API Response Details:", {
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

      console.log("Failure detected - Showing Welcome component");
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
  };

  const sendOtp = async () => {
    await formik.setFieldTouched("phone", true, true);
    const errors = await formik.validateForm();

    if (errors.phone) {
      formik.setErrors({ phone: errors.phone });
      return;
    }

    // Get referral code from localStorage and Redux state
    let referCode = null;

    // First, try to get from localStorage
    try {
      const storedReferral = localStorage.getItem("referralCodeCompleted");
      if (storedReferral) {
        const parsed = JSON.parse(storedReferral);
        console.log("Full localStorage data:", parsed);
        referCode = parsed?.referCode || null;
        console.log("Retrieved referCode from localStorage:", referCode);
      } else {
        console.log("No referralCodeCompleted found in localStorage");
      }
    } catch (e) {
      console.error("Error reading referral code from localStorage:", e);
    }

    if (!referCode) {
      referCode = retailerOnboardingState?.referalResponse?.referCode || null;
      console.log("Retrieved referCode from Redux:", referCode);
    }

    const requestBody = {
      mobileNo: formik.values.phone,
    };

    // Always add referral code if it exists and is not empty
    if (referCode && typeof referCode === 'string' && referCode.trim() !== "") {
      requestBody.referCode = referCode.trim();
      console.log("Adding referCode to request:", requestBody.referCode);
    } else {
      console.warn("referCode is missing or invalid:", referCode);
    }

    console.log("Final request body being sent:", JSON.stringify(requestBody, null, 2));
    console.log(`Sending OTP to: ${formik.values.phone} with referCode: ${referCode}`);

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

  // Countdown timer state for resend OTP
  const [resendCountdown, setResendCountdown] = useState(0);

  // Start countdown when OTP is sent successfully
  useEffect(() => {
    if (OTPResponseStatus === "SUCCESS") {
      setResendCountdown(30);
    }
  }, [OTPResponseStatus]);

  // Countdown timer effect
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // If FailureOTP is "FAILURE" or "Invalid referral code", show Welcome component instead of Step1 form
  // Only show if OTP was actually submitted (to avoid showing on stale errors)
  const isFailure = FailureOTP === "FAILURE" || FailureOTP === "Invalid referral code" || errorMessage === "Invalid referral code" || errorMessage === "FAILURE";
  if (isFailure) {
    return <Welcome />;
  }

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
        md:max-w-[650px] 
        lg:max-w-[750px]
        xl:max-w-[850px]
        bg-white 
        rounded-xl 
        shadow-md 
        p-4
        sm:p-6
        md:p-8
        lg:p-10
        mx-auto
      "
      >

        <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-gray-800 text-center mb-3 sm:mb-4 md:mb-5">
          Mobile Verification
        </h3>

        <p className="text-gray-600 text-sm sm:text-base md:text-lg text-center mb-4 sm:mb-5 md:mb-6">
          Enter your mobile number to receive OTP
        </p>

        {/* PHONE INPUT */}
        <div className="mb-4 sm:mb-5 md:mb-6">
          <label className="block text-sm sm:text-base md:text-lg font-medium text-gray-800 mb-2 sm:mb-3">
            Mobile Number
          </label>

          <div className="flex">
            <div className="relative flex-grow">
              <img
                src="/img/PhoneCall2.png"
                alt="Phone"
                className="absolute left-4 sm:left-5 md:left-6 top-1/2 -translate-y-1/2 w-5 sm:w-6 md:w-7 opacity-60 z-10"
              />
              <div
                className={`absolute left-12 sm:left-14 md:left-16 top-1/2 -translate-y-1/2 h-6 sm:h-7 md:h-8 w-px transition ${formData.phone ? "bg-[#1B1717]" : "bg-gray-300"
                  }`}
              />
              <input
                type="tel"
                name="phone"
                value={formik.values.phone}
                onChange={handleChange}
                placeholder="Enter your number"
                className={`w-full h-14 sm:h-16 md:h-18 lg:h-20 border-2 border-r-0 ${formik.errors.phone ? "border-red-500" : "border-[#1B1717]"
                  } rounded-l-xl rounded-r-none pl-14 sm:pl-16 md:pl-20 pr-4 sm:pr-5 md:pr-6 text-base sm:text-lg md:text-xl outline-none focus:border-[#1B1717] focus:border-r-0 transition`}
              />
            </div>

            <button
              type="button"
              onClick={sendOtp}
              disabled={resendCountdown > 0}
              className={`px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 rounded-r-xl rounded-l-none border-2 border-l-0 text-xs sm:text-sm md:text-base lg:text-lg font-semibold transition h-14 sm:h-16 md:h-[72px] lg:h-20 flex-shrink-0 whitespace-nowrap shadow-md ${OTPResponseStatus === "SUCCESS"
                ? "w-[95px] sm:w-[100px] md:w-[110px] lg:w-[120px]"
                : "w-[90px] sm:w-[95px] md:w-[100px] lg:w-[110px]"
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
        <div className="mb-4 sm:mb-5 md:mb-6">
          <label className="block text-sm sm:text-base md:text-lg font-medium text-gray-800 mb-2 sm:mb-3">
            Enter OTP
          </label>

          <div className="relative">
            <img
              src="/img/DeviceMobileCamera.png"
              alt="OTP"
              className="absolute left-4 sm:left-5 md:left-6 top-1/2 -translate-y-1/2 w-5 sm:w-6 md:w-7 opacity-60 z-10"
            />
            <div
              className={`absolute left-12 sm:left-14 md:left-16 top-1/2 -translate-y-1/2 h-6 sm:h-7 md:h-8 w-px transition ${formData.phone ? "bg-[#1B1717]" : "bg-gray-300"
                }`}
            />

            <input
              type="text"
              name="otp"
              value={formik.values.otp}
              onChange={handleChange}
              placeholder="Enter Mobile OTP"
              className={`w-full h-14 sm:h-16 md:h-[72px] lg:h-20 border-2 ${formik.errors.otp ? "border-red-500" : "border-[#1B1717]"
                } rounded-xl pl-14 sm:pl-16 md:pl-20 pr-4 sm:pr-5 md:pr-6 text-base sm:text-lg md:text-xl outline-none focus:border-[#1B1717] transition`}
            />
          </div>

          {formik.errors.otp && (
            <p className="text-red-500 text-sm sm:text-base mt-2">{formik.errors.otp}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="button"
          onClick={formik.handleSubmit}
          className="w-full bg-[#039155] text-white py-3.5 sm:py-4 md:py-4 lg:py-5 rounded-xl font-semibold text-base sm:text-lg md:text-xl lg:text-2xl hover:bg-green-700 transition shadow-lg mt-4 sm:mt-5 md:mt-6"
        >
          Submit
        </button>
      </div>
    </div>
  );
}

export default Step1;
