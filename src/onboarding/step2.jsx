import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import {
  emailSmsOtp,
  emailResendOtp,
  emailOtpVerify,
} from "../redux/action/onboardingAction";

function Step2({ formData, setFormData, onNext, onRefreshSteps }) {
  const dispatch = useDispatch();
  const [successCooldown, setSuccessCooldown] = useState(18);

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
        setSuccessCooldown(18);
      }
    });
  };

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
    if (verifuSuccess === "SUCCESS") {
      // Already sent, resend if countdown is 0
      if (successCooldown === 0) {
        handleResendOtp();
      }
    } else {
      // First time, send initial OTP
      sendEmailOtp();
    }
  };

  const verifuSuccess = useSelector(
    (state) => state?.onboarding?.emailOtpSent?.status
  );
  console.log("verifuSuccess", verifuSuccess);

  const verifyfailure = useSelector((state) => state?.error?.status);
  console.log("verifyfailure", verifyfailure);

  const [verifyError, setVerifyError] = useState(null);
  const [emailFocused, setEmailFocused] = useState(false);
  const [otpFocused, setOtpFocused] = useState(false);
  const emailVerifyMessage = useSelector(
    (state) =>
      state?.onboarding?.emailOtpVerify?.message ||
      state?.onboarding?.message ||
      state?.error?.message
  );

  // Handle 3-minute countdown when verification is successful
  useEffect(() => {
    if (verifuSuccess === "SUCCESS") {
      setSuccessCooldown(18);
    }
  }, [verifuSuccess]);

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
    (state) => state?.onboarding?.emailOtpVerify?.status
  );

  console.log("emailVerifyStatus", emailVerifyStatus);

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
  }, [emailVerifyStatus, onRefreshSteps]);

  return (
    <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
      <div className="bg-white rounded-lg p-8 max-w-3xl mx-auto">
        <h3 className="text-[20px] font-semibold mb-2 text-center">
          Email Id Verification
        </h3>
        <p className="text-[17px] text-[#1B1717] mb-6 text-center">
          Enter Your Email to Receive OTP
        </p>

        <div className="space-y-6">
          {/* Email Input */}
          <div>
            <label className="text-[18px] font-semibold mb-2">Email Id</label>
            <div className="flex items-center">
              <div className="flex-1 relative">
                <img
                  src="/img/Emailicon.png"
                  alt="Email"
                  className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition ${
                    emailFocused || formData.email
                      ? "opacity-100"
                      : "opacity-50"
                  }`}
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
                  className="w-[430px] h-[60px] border-2 border-gray-300 rounded-l-lg px-4 py-3 pl-12 outline-none focus:border-[#1B1717] focus:shadow-md transition"
                />
              </div>

              {/* 🔥 Verify Button → Calls API */}
              <button
                type="button"
                onClick={handleVerifyOrResend}
                disabled={verifuSuccess === "SUCCESS" && successCooldown > 0}
                className={`w-40 px-6 rounded-r-lg text-sm font-medium transition h-[60px] ${
                  verifuSuccess === "SUCCESS" && successCooldown > 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#039155] text-white hover:bg-green-700"
                }`}
              >
                {verifuSuccess === "SUCCESS"
                  ? successCooldown > 0
                    ? `Resend OTP in (${successCooldown}s)`
                    : "Resend OTP"
                  : "Verify"}
              </button>
            </div>
          </div>

          {/* OTP Input */}
          <div>
            <label className="text-[18px] font-semibold mb-2">Enter OTP</label>
            <div className="relative">
              <img
                src="/img/DeviceMobileCamera.png"
                alt="OTP"
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition ${
                  otpFocused || formData.emailOtp ? "opacity-100" : "opacity-50"
                }`}
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
                className="w-[534px] h-[60px] border-2 border-gray-300 rounded-lg px-4 py-3 pl-12 outline-none focus:border-[#1B1717] focus:shadow-md transition"
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
              className={`w-full bg-[#039255] text-white py-4 rounded-2xl text-xl font-medium shadow-lg `}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

export default Step2;
