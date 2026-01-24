import React, { useEffect } from "react";
import { useCompany } from "../../../context/CompanyContext";
import { useSelector } from "react-redux";
import { ButtonLoader } from "../../../widgets/layout/loader.jsx";

const VerifyMPINView = ({
  mpin,
  onMpinChange,
  onMpinKeyDown,
  onMpinPaste,
  onSubmit,
  mpinInputRefs,
}) => {
  const { company } = useCompany();
  const isLoading = useSelector((state) => state?.loading?.isLoading);

  useEffect(() => {
    if (mpinInputRefs.current[0]) {
      mpinInputRefs.current[0].focus();
    }
  }, []);

  return (
    <div className="flex-1 flex items-center justify-center bg-white px-4 sm:px-8 md:px-10 lg:px-16 xl:px-20 py-6 sm:py-10 overflow-y-auto">
      <div className="w-full max-w-[534px] mx-auto">
        <div className="flex justify-center mb-6">
          <img
            src={company?.logo || "/img/gmaxepay.png"}
            className="h-14 sm:h-16 md:h-20 object-contain"
            alt="Logo"
          />
        </div>

        <h1 className="text-1B1717 text-[36px] font-semibold text-center mb-4">
          Enter MPIN
        </h1>
        <p className="text-1B1717 opacity-70 text-center text-[24px] mb-10">
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
              onKeyDown={(e) => onMpinKeyDown(e, index, mpinInputRefs)}
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

        <button
          onClick={!isLoading ? onSubmit : undefined}
          disabled={isLoading}
          className="w-full lg:w-[534px] mx-auto text-white text-[24px] font-medium mt-10 rounded-xl h-12 sm:h-12 md:h-14 lg:h-[60px] flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          style={{ backgroundColor: company?.primaryColor || "#039155" }}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <ButtonLoader color="#ffffff" />
              <span className="text-white">Loading...</span>
            </span>
          ) : (
            "Verify MPIN"
          )}
        </button>
      </div>
    </div>
  );
};

export default VerifyMPINView;
