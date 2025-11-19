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
    <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center p-4">

      {/* CARD CONTAINER */}
      <div
        className="
          w-full 
          xxs:w-[320px]
          sm:w-[400px]
          md:w-[500px]    
          lg:w-[550px]    
          bg-white 
          rounded-xl 
          shadow-md 
          p-4 sm:p-6 md:p-10
          xxs:ml-4
        "
      >
        {/* RESTORED HEADER */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
            Complete Your KYC
          </h2>
          <p className="text-gray-600 text-sm sm:text-base md:text-lg mt-2">
            Secure your account by completing verification
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={(e) => e.preventDefault()}>

          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-900 mb-3">
            Email Verification
          </h3>

          <p className="text-gray-600 text-sm sm:text-base md:text-lg text-center mb-10">
            Enter your Email address to receive the OTP
          </p>

          {/* EMAIL FIELD */}
          <div className="mb-8">
            <label
              className="
                block 
                text-base 
                font-medium 
                text-gray-800 
                mb-2
                md:text-2xl
              "
            >
              Email ID
            </label>

            <div className="flex">
              <div className="relative flex-grow">
                <img
                  src="/img/Emailicon.png"
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 opacity-60"
                />
                <div className="absolute left-11 top-1/2 -translate-y-1/2 w-px h-6 bg-gray-300" />

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your Email"
                  className="
                    w-full 
                    h-[55px]
                    md:h-[65px]
                    border 
                    border-gray-300 
                    rounded-l-lg 
                    pl-14 pr-4
                    text-base 
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
                  px-6
                  text-base 
                  md:text-xl
                  font-medium
                  h-[55px]
                  md:h-[65px]
                  hover:bg-green-700 
                  transition
                  ${
                    verifuSuccess === "SUCCESS" && successCooldown > 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : ""
                  }
                `}
              >
                {verifuSuccess === "SUCCESS"
                  ? successCooldown > 0
                    ? `Resend in ${successCooldown}s`
                    : "Resend OTP"
                  : "Verify"}
              </button>
            </div>
          </div>

          {/* OTP FIELD */}
          <div className="mb-8">
            <label
              className="
                block 
                text-base 
                font-medium 
                text-gray-800 
                mb-2
                md:text-2xl
              "
            >
              Enter OTP
            </label>

            <div className="relative">
              <img
                src="/img/DeviceMobileCamera.png"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 opacity-60"
              />
              <div className="absolute left-11 top-1/2 -translate-y-1/2 w-px h-6 bg-gray-300" />

              <input
                type="text"
                name="emailOtp"
                value={formData.emailOtp}
                onChange={handleChange}
                placeholder="Enter Email OTP"
                className="
                  w-full 
                  h-[55px]
                  md:h-[65px]
                  border 
                  border-gray-300 
                  rounded-lg 
                  pl-14 pr-4
                  text-base 
                  md:text-xl
                  outline-none
                  focus:border-[#1B1717]
                "
              />
            </div>

            {emailVerifyStatus !== "SUCCESS" && emailVerifyMessage && (
              <p className="text-red-500 mt-2 text-sm">{emailVerifyMessage}</p>
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
              py-4 
              md:py-5
              rounded-lg 
              text-lg 
              md:text-2xl
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
