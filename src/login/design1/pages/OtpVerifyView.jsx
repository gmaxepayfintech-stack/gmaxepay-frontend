import React, { useEffect } from "react";
import { useCompany } from "../../../context/CompanyContext";
import { useSelector } from "react-redux";
import { ButtonLoader } from "../../../widgets/layout/loader.jsx";

const OtpVerifyView = ({
  otp,
  otpTimer,
  onOtpChange,
  onOtpKeyDown,
  onOtpPaste,
  onSubmit,
  onResend,
  submittedPhone,
  otpInputRefs,
}) => {
  const { company } = useCompany();
  const isLoading = useSelector((state) => state?.loading?.isLoading);

  useEffect(() => {
    if (otpInputRefs.current[0]) {
      otpInputRefs.current[0].focus();
    }
  }, []);

  const formatTimer = (t) => {
    const minutes = Math.floor(t / 60);
    const seconds = t % 60;
    if (t >= 60) {
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${seconds}s`;
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-white px-4 sm:px-8 md:px-10 lg:px-16 xl:px-20 py-6 sm:py-10 overflow-y-auto">
      <div className="w-full max-w-sm sm:max-w-[534px] mx-auto">
        <div className="flex justify-center mb-6">
          <img
            src={company?.logo || "/img/gmaxepay.png"}
            className="h-14 sm:h-16 md:h-20 object-contain"
            alt="Logo"
          />
        </div>

        <h1 className="text-1B1717 text-2xl sm:text-3xl md:text-[36px] font-[Gilroy-Semibold] text-center mb-2 sm:mb-4">
          Enter Verification Code
        </h1>
        <p className="text-1B1717 opacity-70 text-center text-lg sm:text-xl md:text-[24px] mb-2 sm:mb-4">
          We've sent a 6-digit code to
        </p>
        <p className="text-gray-900 font-md text-center mb-8 sm:mb-10 text-lg sm:text-xl md:text-[24px]">
          +91 {submittedPhone}
        </p>

        <div className="flex gap-2 sm:gap-4 md:gap-6 mb-8 justify-center">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(ref) => (otpInputRefs.current[index] = ref)}
              maxLength="1"
              value={digit}
              onChange={(e) => onOtpChange(e.target.value, index, otpInputRefs)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && index === 5) {
                  onSubmit();
                }
                onOtpKeyDown(e, index, otpInputRefs);
              }}
              onPaste={index === 0 ? (e) => onOtpPaste(e, otpInputRefs) : undefined}
              className="w-[40px] h-[40px] sm:w-[50px] sm:h-[50px] border rounded-lg text-center text-lg sm:text-xl font-normal outline-none focus:border-green-700 transition"
              style={{
                border: digit
                  ? "1.5px solid #1B1717"
                  : "1.5px solid rgba(27,23,23,0.4)",
              }}
            />
          ))}
        </div>

        <p className="text-sm sm:text-lg md:text-[24px] text-gray-500 text-center mb-1">
          Didn't receive code?
        </p>
        <button
          disabled={otpTimer !== 0}
          onClick={onResend}
          className={`text-sm sm:text-base md:text-[18px] font-[Gilroy-Semibold] w-full text-center mt-4 sm:mt-6 transition-colors ${otpTimer === 0 ? "text-1B1717" : "text-1B171717 opacity-70"
            }`}
        >
          {otpTimer === 0 ? "Resend Now" : `Resend in ${formatTimer(otpTimer)}`}
        </button>

        <button
          onClick={!isLoading ? onSubmit : undefined}
          disabled={isLoading}
          className="w-full lg:w-[534px] mx-auto text-white text-xl sm:text-2xl md:text-[24px] font-[Gilroy-Medium] mt-8 sm:mt-10 rounded-xl h-12 sm:h-12 md:h-14 lg:h-[60px] flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed transition hover:opacity-90 active:scale-[0.98]"
          style={{ backgroundColor: company?.primaryColor || "#039155" }}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <ButtonLoader color="#ffffff" />
              <span className="text-white">Loading...</span>
            </span>
          ) : (
            "Submit"
          )}
        </button>
      </div>
    </div>
  );
};

export default OtpVerifyView;

