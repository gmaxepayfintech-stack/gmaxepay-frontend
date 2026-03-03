import React, { useEffect } from "react";
import { useCompany } from "../../../context/CompanyContext";
import { useSelector } from "react-redux";
import { ButtonLoader } from "../../../widgets/layout/loader.jsx";

const Auth2FAView = ({
  otp,
  onAuth2FAChange,
  onAuth2FAKeyDown,
  onAuth2FAPaste,
  onSubmit,
  auth2FAInputRefs,
}) => {
  const { company } = useCompany();
  const isLoading = useSelector((state) => state?.loading?.isLoading);

  useEffect(() => {
    if (auth2FAInputRefs.current[0]) {
      auth2FAInputRefs.current[0].focus();
    }
  }, []);

  return (
    <div className="flex-1 flex items-center justify-center bg-white px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-8 sm:py-10 md:py-8 lg:py-0 overflow-y-auto">
      <div className="w-full max-w-sm sm:max-w-md md:max-w-2xl mx-auto text-center">
        <div className="mb-6 sm:mb-8 md:mb-6 lg:mb-8 text-center">
          <div className="flex justify-center mb-4 sm:mb-6 md:mb-4">
            <img
              src={company?.logo || "/img/gmaxepay.png"}
              alt={company?.companyName || "GMAXEPAY Logo"}
              className="object-contain h-16 sm:h-20 md:h-24 lg:h-28"
              loading="eager"
              fetchpriority="high"
              decoding="async"
              onError={(e) => {
                e.target.src = "/img/gmaxepay.png";
              }}
            />
          </div>
          <h1
            className="text-gray-900 mb-2 text-3xl sm:text-4xl md:text-5xl lg:text-[38px]"
            style={{
              fontFamily: "Gilroy-SemiBold",
              fontWeight: 400,
              lineHeight: "1.1",
            }}
          >
            2-Factor Authentication
          </h1>
          <p
            className="text-gray-600 text-lg sm:text-xl md:text-2xl lg:text-2xl"
            style={{
              fontFamily: "Gilroy-Medium",
              fontWeight: 400,
              lineHeight: "1.2",
              marginTop: "12px",
            }}
          >
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        <div className="flex gap-6 sm:gap-6 mb-8 justify-center">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(ref) => (auth2FAInputRefs.current[index] = ref)}
              maxLength="1"
              value={digit}
              onChange={(e) => onAuth2FAChange(e.target.value, index)}
              onKeyDown={(e) => onAuth2FAKeyDown(e, index)}
              onPaste={index === 0 ? onAuth2FAPaste : undefined}
              className="w-[50px] h-[50px] gap-4 border rounded-lg text-center text-lg font-normal outline-none focus:border-green-700"
              style={{
                border: digit
                  ? "1.5px solid #1B1717"
                  : "1.5px solid rgba(27,23,23,0.4)",
                fontFamily: "Gilroy-Medium",
              }}
            />
          ))}
        </div>

        <div className="w-full">
          <button
            className="w-full lg:w-[534px] mx-auto text-white transition-all duration-200 flex items-center justify-center shadow-lg h-12 sm:h-12 md:h-14 lg:h-[60px] font-[Gilroy-Semibold] rounded-xl disabled:opacity-70 disabled:cursor-not-allowed"
            onClick={!isLoading ? onSubmit : undefined}
            disabled={isLoading}
            style={{
              backgroundColor: company?.primaryColor || "#039155",
              boxShadow: "0 4px 14px 0",
              fontFamily: "Gilroy-SemiBold",
              fontSize: "18px",
              lineHeight: "100%",
            }}
            onMouseEnter={(e) => {
              if (!isLoading && company?.secondaryColor) {
                e.target.style.backgroundColor = company.secondaryColor;
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading && company?.primaryColor) {
                e.target.style.backgroundColor = company.primaryColor;
              }
            }}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <ButtonLoader color="#ffffff" />
                <span className="text-white">Loading...</span>
              </span>
            ) : (
              "Verify & Continue"
            )}
          </button>
        </div>

        <p
          className="text-gray-500 text-sm mt-6"
          style={{
            fontFamily: "Gilroy-Regular",
            fontWeight: 400,
          }}
        >
          Having trouble? Make sure your authenticator app is synced
        </p>
      </div>
    </div>
  );
};

export default Auth2FAView;

