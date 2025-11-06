import React, { useEffect } from "react";
import { useCompany } from "../../../context/CompanyContext";

const VerificationCodeView = ({
  otp,
  setOtp,
  verificationTimer,
  onOtpChange,
  onOtpKeyDown,
  onOtpPaste,
  onSubmit,
  onResend,
  phoneNumber,
  otpInputRefs,
}) => {
  const { company } = useCompany();

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
      <div className="w-full max-w-sm mx-auto">
        <div className="flex justify-center mb-6">
          <img
            src={company?.logo || "/img/gmaxepay.png"}
            className="h-14 sm:h-16 md:h-20 object-contain"
            alt="Logo"
          />
        </div>

        <h1 className="text-1B1717 text-[36px] font-semibold text-center mb-4">
          Enter Verification Code
        </h1>
        <p className="text-1B1717 opacity-70 text-center text-[24px] mb-4">
          We've sent a 6-digit code to
        </p>
        <p className="text-gray-900 font-md text-center mb-10 text-[24px]">
          +91 {phoneNumber}
        </p>

        <div className="flex gap-6 sm:gap-6 mb-8 justify-center">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(ref) => (otpInputRefs.current[index] = ref)}
              maxLength="1"
              value={digit}
              onChange={(e) => onOtpChange(e.target.value, index, otpInputRefs)}
              onKeyDown={(e) => onOtpKeyDown(e, index, otpInputRefs)}
              onPaste={index === 0 ? (e) => onOtpPaste(e, otpInputRefs) : undefined}
              className="w-[50px] h-[50px] gap-4 border rounded-lg text-center text-lg font-normal outline-none focus:border-green-700"
              style={{
                border: digit
                  ? "1.5px solid #1B1717"
                  : "1.5px solid rgba(27,23,23,0.4)",
              }}
            />
          ))}
        </div>

        <p className="text-sm text-[24px] text-gray-500 text-center mb-1">
          Didn't receive code?
        </p>
        <button
          disabled={verificationTimer !== 0}
          onClick={onResend}
          className={`text-sm font-semibold w-full text-center text-[18px] mt-6 ${
            verificationTimer === 0 ? "text-1B1717" : "text-1B171717 opacity-70"
          }`}
        >
          {verificationTimer === 0
            ? "Resend Now"
            : `Resend in ${formatTimer(verificationTimer)}`}
        </button>

        <button
          onClick={onSubmit}
          className="w-[500px] text-white text-[28px] font-medium mt-10 rounded-xl h-12 sm:h-14 -ml-12 flex items-center justify-center"
          style={{ backgroundColor: company?.primaryColor || "#039155" }}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default VerificationCodeView;

