import React, { useEffect } from "react";
import { useCompany } from "../../../context/CompanyContext";
import { useSelector } from "react-redux";
import { ButtonLoader } from "../../../widgets/layout/loader.jsx";

const SetMPINView = ({
  newMpin,
  confirmMpin,
  onNewMpinChange,
  onConfirmMpinChange,
  onNewMpinKeyDown,
  onConfirmMpinKeyDown,
  onNewMpinPaste,
  onConfirmMpinPaste,
  onSubmit,
  newMpinInputRefs,
  confirmMpinInputRefs,
}) => {
  const { company } = useCompany();
  const isLoading = useSelector((state) => state?.loading?.isLoading);

  useEffect(() => {
    if (newMpinInputRefs.current[0]) {
      newMpinInputRefs.current[0].focus();
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
          Set MPIN
        </h1>
        <p className="text-1B1717 opacity-70 text-center text-[24px] mb-10">
          Create a secure MPIN for your account
        </p>

        <div className="mb-8">
          <label className="block text-1B1717 text-[18px] font-[Gilroy-Medium] mb-3">
            New MPIN
          </label>
          <div className="flex gap-6 sm:gap-6 justify-center">
            {newMpin.map((digit, index) => (
              <input
                key={index}
                ref={(ref) => (newMpinInputRefs.current[index] = ref)}
                type="password"
                maxLength="1"
                value={digit}
                onChange={(e) => onNewMpinChange(e.target.value, index, newMpinInputRefs)}
                onKeyDown={(e) => onNewMpinKeyDown(e, index, newMpinInputRefs, confirmMpinInputRefs)}
                onPaste={index === 0 ? (e) => onNewMpinPaste(e, newMpinInputRefs) : undefined}
                className="w-[50px] h-[50px] gap-4 border rounded-lg text-center text-lg font-normal outline-none focus:border-green-700"
                style={{
                  border: digit
                    ? "1.5px solid #1B1717"
                    : "1.5px solid rgba(27,23,23,0.4)",
                }}
              />
            ))}
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-1B1717 text-[18px] font-[Gilroy-Medium] mb-3">
            Confirm MPIN
          </label>
          <div className="flex gap-6 sm:gap-6 justify-center">
            {confirmMpin.map((digit, index) => (
              <input
                key={index}
                ref={(ref) => (confirmMpinInputRefs.current[index] = ref)}
                type="password"
                maxLength="1"
                value={digit}
                onChange={(e) => onConfirmMpinChange(e.target.value, index, confirmMpinInputRefs)}
                onKeyDown={(e) => onConfirmMpinKeyDown(e, index, confirmMpinInputRefs)}
                onPaste={index === 0 ? (e) => onConfirmMpinPaste(e, confirmMpinInputRefs) : undefined}
                className="w-[50px] h-[50px] gap-4 border rounded-lg text-center text-lg font-normal outline-none focus:border-green-700"
                style={{
                  border: digit
                    ? "1.5px solid #1B1717"
                    : "1.5px solid rgba(27,23,23,0.4)",
                }}
              />
            ))}
          </div>
        </div>

        <button
          onClick={!isLoading ? onSubmit : undefined}
          disabled={isLoading}
          className="w-full lg:w-[534px] mx-auto text-white text-[24px] font-[Gilroy-Medium] mt-10 rounded-xl h-12 sm:h-12 md:h-14 lg:h-[60px] flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          style={{ backgroundColor: company?.primaryColor || "#039155" }}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <ButtonLoader color="#ffffff" />
              <span className="text-white">Loading...</span>
            </span>
          ) : (
            "Set MPIN"
          )}
        </button>
      </div>
    </div>
  );
};

export default SetMPINView;
