import React, { useEffect, useState } from "react";
import { useCompany } from "../../../context/CompanyContext";
import { useSelector } from "react-redux";
import { ButtonLoader } from "../../../widgets/layout/loader.jsx";
import ForgotMpin from "./ForgotMpin";

const VerifyMPINView = ({
  mpin,
  onMpinChange,
  onMpinKeyDown,
  onMpinPaste,
  onSubmit,
  mpinInputRefs,
  onForgotMpinSubmit,
}) => {
  const { company } = useCompany();
  const isLoading = useSelector((state) => state?.loading?.isLoading);
  const [localLoading, setLocalLoading] = useState(false);
  const [showForgotMpin, setShowForgotMpin] = useState(false);
  const loading = localLoading || isLoading;

  useEffect(() => {
    if (!showForgotMpin && mpinInputRefs.current[0]) {
      mpinInputRefs.current[0].focus();
    }
  }, [showForgotMpin]);

  const handleSubmit = () => {
    if (showForgotMpin) return;
    if (loading) return;
    setLocalLoading(true);

    Promise.resolve(onSubmit?.())
      .catch(() => {
        // Errors are handled elsewhere; we just ensure the loader hides
      })
      .finally(() => {
        setLocalLoading(false);
      });
  };

  if (showForgotMpin) {
    return (
      <ForgotMpin
        onSubmit={onForgotMpinSubmit}
        onBack={() => setShowForgotMpin(false)}
      />
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center relative bg-white px-4 sm:px-8 md:px-10 lg:px-16 xl:px-20 py-6 sm:py-10 overflow-y-auto min-h-screen">
      <div className="w-full max-w-[534px] mx-auto">
        <div className="flex justify-center mb-4 sm:mb-5 md:mb-6">
          <img
            src={company?.logo || "/img/gmaxepay.png"}
            className="h-12 sm:h-14 md:h-16 lg:h-20 xl:h-24 object-contain"
            alt="Logo"
          />
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-[Gilroy-Semibold] text-[#1B1717] text-center mb-2 sm:mb-4">
          Enter MPIN
        </h1>
        <p className="text-[#1B1717] opacity-70 font-[Gilroy-Medium] text-center sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 md:mb-10 px-2 sm:px-0">
          Please enter your MPIN to continue
        </p>

        <div className="flex gap-6 sm:gap-6 mb-8 justify-center">
          {mpin.map((digit, index) => (
            <input
              key={index}
              ref={(ref) => (mpinInputRefs.current[index] = ref)}
              type="password"
              maxLength="1"
              value={digit}
              onChange={(e) => onMpinChange(e.target.value, index, mpinInputRefs)}
              onKeyDown={(e) => {
                onMpinKeyDown(e, index, mpinInputRefs);

                if (e.key === "Enter") {
                  const isComplete = mpin.every((digit) => digit !== "");
                  if (isComplete) {
                    handleSubmit();
                  }
                }
              }}
              onPaste={index === 0 ? (e) => onMpinPaste(e, mpinInputRefs) : undefined}
              className="w-[50px] h-[50px] gap-4 border rounded-lg text-center text-lg font-normal outline-none focus:border-green-700"
              style={{
                border: digit
                  ? "1.5px solid #1B1717"
                  : "1.5px solid rgba(27,23,23,0.4)",
              }}
            />
          ))}
        </div>

        <div className="w-full flex justify-center mt-8 sm:mt-10">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full text-white transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center shadow-lg h-11 sm:h-12 md:h-14 lg:h-[60px] xl:h-[60px] font-[Gilroy-Semibold] rounded-xl relative overflow-hidden"
            style={{
              backgroundColor: company?.primaryColor || "#039155",
              boxShadow: "0 4px 14px 0 rgba(3, 145, 85, 0.3)",
            }}
            onMouseEnter={(e) => {
              if (!loading && company?.secondaryColor) {
                e.currentTarget.style.backgroundColor = company.secondaryColor;
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && company?.primaryColor) {
                e.currentTarget.style.backgroundColor = company.primaryColor;
              }
            }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <ButtonLoader color="#ffffff" />
                <span
                  style={{
                    fontFamily: "Gilroy-SemiBold",
                    fontWeight: 400,
                    fontSize: "18px",
                    lineHeight: "100%",
                    color: "white",
                  }}
                >
                  Loading...
                </span>
              </span>
            ) : (
              <span
                style={{
                  fontFamily: "Gilroy-SemiBold",
                  fontWeight: 400,
                  fontSize: "18px",
                  lineHeight: "100%",
                  color: "white",
                }}
              >
                Verify MPIN
              </span>
            )}
          </button>
        </div>

        <div className="flex justify-end mt-2">
          <button
            type="button"
            onClick={() => setShowForgotMpin(true)}
            className="text-sm sm:text-base font-['Gilroy-Medium'] text-[#000000] text-opacity-50 hover:underline"
          >
            Forgot MPIN?
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyMPINView;
