import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import {
  emailSmsOtp,
  emailResendOtp,
  emailOtpVerify,
} from "../redux/action/onboardingAction";

function Step2({ formData, setFormData, onNext, onRefreshSteps }) {
  const dispatch = useDispatch();
  const [successCooldown, setSuccessCooldown] = useState(180);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((d) => ({ ...d, [name]: value }));
  };

  const sendEmailOtp = () => {
    if (!formData.email) {
      alert("Please enter a valid Email ID");
      return;
    }

    const value = {
      email: formData.email,
    };
    const token = localStorage.getItem("onboardingToken");

    dispatch(emailSmsOtp(value, token)).then((res) => {
      if (res?.status === 200 || res?.success === true) {
        setFormData((d) => ({ ...d, emailOtpSent: true }));
      }
    });
  };

  const handleResendOtp = () => {
    if (!formData.email) {
      alert("Please enter a valid Email ID");
      return;
    }

    const value = {
      email: formData.email,
    };
    const token = localStorage.getItem("onboardingToken");

    dispatch(emailResendOtp(value, token)).then((res) => {
      if (res?.status === 200 || res?.success === true) {
        setSuccessCooldown(180);
      }
    });
  };

  // Get Redux state first (before using in functions)
  const verifySuccess = useSelector(
    (state) => state?.onboarding?.emailOtpSent?.status,
  );
  //console.log("verifySuccess", verifySuccess);

  // Submit OTP verification
  const submitEmailOtp = () => {
    if (!formData.emailOtp) {
      alert("Enter OTP first");
      return;
    }

    const token = localStorage.getItem("onboardingToken");
    dispatch(emailOtpVerify({ otp: formData.emailOtp }, token));
  };

  // Handle Verify or Resend based on state
  const handleVerifyOrResend = () => {
    if (verifySuccess === "SUCCESS") {
      // Already sent, resend if countdown is 0
      if (successCooldown === 0) {
        handleResendOtp();
      }
    } else {
      // First time, send initial OTP
      sendEmailOtp();
    }
  };

  const verifyfailure = useSelector((state) => state?.error?.status);
 // console.log("verifyfailure", verifyfailure);

  const [verifyError, setVerifyError] = useState(null);
  const [emailFocused, setEmailFocused] = useState(false);
  const [otpFocused, setOtpFocused] = useState(false);
  const emailVerifyMessage = useSelector(
    (state) =>
      state?.onboarding?.emailOtpVerify?.message ||
      state?.onboarding?.message ||
      state?.error?.message,
  );

  // Handle 3-minute countdown when verification is successful
  useEffect(() => {
    if (verifySuccess === "SUCCESS") {
      setSuccessCooldown(180);
    }
  }, [verifySuccess]);

  // Countdown timer logic
  useEffect(() => {
    if (successCooldown > 0) {
      const interval = setInterval(() => {
        setSuccessCooldown((t) => t - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [successCooldown]);

  // Watch email OTP verification result and advance when verified
  const emailVerifyStatus = useSelector(
    (state) => state?.onboarding?.emailOtpVerify?.status,
  );

  //console.log("emailVerifyStatus", emailVerifyStatus);

  useEffect(() => {
    if (emailVerifyStatus === "SUCCESS") {
      setVerifyError(null);
      // Refresh steps after successful completion
      if (onRefreshSteps) {
        onRefreshSteps();
      }
      onNext();
    } else if (emailVerifyStatus && emailVerifyStatus !== "SUCCESS") {
      setVerifyError(emailVerifyMessage || "OTP verification failed");
    }
  }, [emailVerifyStatus, onRefreshSteps, onNext, emailVerifyMessage]);

  return (
    <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
      <div className="w-full h-full flex justify-center items-center p-2 sm:p-3 md:p-4 lg:p-4 xl:p-5 overflow-hidden ">
        <div className="w-full max-w-[98%] sm:max-w-[480px] md:max-w-[520px] lg:max-w-[580px] xl:max-w-[600px] 2xl:max-w-[700px]  mx-auto">
          <h3 className="text-base sm:text-lg  font-[gilroy-semibold] text-center text-[#1B1717]">
            Email Id Verification
          </h3>
          <p className="text-[#1B1717]/80 font-[gilroy-medium] text-xs sm:text-xs md:text-sm  text-center mb-4 mt-2">
            Enter Your Email to Receive OTP
          </p>

          <div className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-xs md:text-lg font-[gilroy-semibold] text-[#1B1717] mb-2">
                Email Id
              </label>
              <div className="flex flex-row gap-0">
                <div className="relative flex-grow">
                  <img
                    src="/img/Emailicon.png"
                    alt="Email"
                    className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-[#1B1717]/70 z-10"
                  />
                  <div
                    className={`absolute left-11 top-1/2 -translate-y-1/2 h-6 w-px transition ${
                      emailFocused || formData.email
                        ? "bg-[#1B1717]"
                        : "bg-gray-300"
                    }`}
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    placeholder="Enter Your Email Id"
                    className={`w-full h-10 md:h-11 lg:h-14
                  border-[0.5px] border-r-0
                  ${verifyError ? "border-red-500" : "border-[#1B1717]/80"}
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

                {/* 🔥 Verify Button → Calls API */}
                <button
                  type="button"
                  onClick={handleVerifyOrResend}
                  disabled={verifySuccess === "SUCCESS" && successCooldown > 0}
                  className={`h-10 md:h-11 lg:h-14
                px-5 md:px-8
                border-[0.5px] border-l-0
                ${verifyError ? "border-red-500" : "border-[#039155]"}
                rounded-r-lg
                font-[gilroy-semibold]
                text-xs md:text-sm
                whitespace-nowrap
                shadow-md
                transition
                flex-shrink-0
                ${
                  verifySuccess === "SUCCESS" && successCooldown > 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#039155] text-white hover:bg-green-700"
                }`}
                >
                  {verifySuccess === "SUCCESS"
                    ? successCooldown > 0
                      ? `Resend OTP in (${successCooldown}s)`
                      : "Resend OTP"
                    : "Verify"}
                </button>
              </div>
            </div>

            {/* OTP Input */}
            <div>
              <label className="block text-xs md:text-lg font-[gilroy-semibold] text-[#1B1717] mb-2">
                Enter OTP
              </label>
              <div className="relative">
                <img
                  src="/img/DeviceMobileCamera.png"
                  alt="OTP"
                  className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-[#1B1717]/70 z-10"
                />
                <div
                  className={`absolute left-11 top-1/2 -translate-y-1/2 h-6 w-px transition ${
                    otpFocused || formData.emailOtp
                      ? "bg-[#1B1717]"
                      : "bg-gray-300"
                  }`}
                />
                <input
                  type="text"
                  name="emailOtp"
                  value={formData.emailOtp}
                  onChange={handleChange}
                  onFocus={() => setOtpFocused(true)}
                  onBlur={() => setOtpFocused(false)}
                  placeholder="Enter Email OTP"
                  className={`w-full h-10 md:h-11 lg:h-14
                border-[0.5px]
                ${verifyError ? "border-red-500" : "border-[#1B1717]/80"}
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
              {verifyError && (
                <p className="text-red-500 text-sm mt-2">{verifyError}</p>
              )}
            </div>

            {/* Submit */}
            <div>
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
            mt-7
            flex items-center justify-center
          "
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

export default Step2;
