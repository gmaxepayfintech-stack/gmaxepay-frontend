import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import {
  emailSmsOtp,
  emailResendOtp,
  emailOtpVerify,
} from "../redux/action/onboardingAction";

function Step2({ formData, setFormData, onNext }) {
  const dispatch = useDispatch();
  const [successCooldown, setSuccessCooldown] = useState(18);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((d) => ({ ...d, [name]: value }));
  };

  const sendEmailOtp = () => {
    if (!formData.email) {
      return;
    }
    const value = { email: formData.email };
    const token = localStorage.getItem("onboardingToken");

    dispatch(emailSmsOtp(value, token)).then((res) => {
      if (res?.status === 200 || res?.success === true) {
        setFormData((d) => ({ ...d, emailOtpSent: true }));
      }
    });
  };

  const handleResendOtp = () => {
    if (!formData.email) {
      return;
    }
    const value = { email: formData.email };
    const token = localStorage.getItem("onboardingToken");

    dispatch(emailResendOtp(value, token)).then((res) => {
      if (res?.status === 200 || res?.success === true) {
        setSuccessCooldown(18);
      }
    });
  };

  const submitEmailOtp = () => {
    if (!formData.emailOtp) {
      onNext();
      return;
    }

    const token = localStorage.getItem("onboardingToken");
    dispatch(emailOtpVerify({ otp: formData.emailOtp }, token));
  };

  const verifuSuccess = useSelector(
    (state) => state?.onboarding?.emailOtpSent?.status
  );

  const emailVerifyStatus = useSelector(
    (state) => state?.onboarding?.emailOtpVerify?.status
  );

  const emailVerifyMessage = useSelector(
    (state) =>
      state?.onboarding?.emailOtpVerify?.message ||
      state?.onboarding?.message ||
      state?.error?.message
  );

  useEffect(() => {
    if (verifuSuccess === "SUCCESS") {
      setSuccessCooldown(18);
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
