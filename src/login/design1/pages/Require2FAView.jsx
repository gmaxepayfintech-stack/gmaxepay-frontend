import React from "react";
import { useCompany } from "../../../context/CompanyContext";

const Require2FAView = ({ qrData, onNext }) => {
  const { company } = useCompany();

  return (
    <div className="flex-1 flex items-center justify-center bg-white px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-8 sm:py-10 md:py-8 lg:py-0 overflow-y-auto">
      <div className="w-full max-w-sm sm:max-w-md md:max-w-2xl mx-auto text-center">
        <div className="flex justify-center mb-6 sm:mb-8">
          <img
            src={company?.logo || "/img/gmaxepay.png"}
            alt={company?.companyName || "GMAXEPAY Logo"}
            className="object-contain h-16 sm:h-20 md:h-24 lg:h-28"
            loading="eager"
            onError={(e) => {
              e.target.src = "/img/gmaxepay.png";
            }}
          />
        </div>

        <h1
          className="text-gray-900 mb-4 text-3xl sm:text-4xl md:text-5xl lg:text-[38px]"
          style={{
            fontFamily: "Gilroy-SemiBold",
            fontWeight: 400,
            lineHeight: "1.1",
          }}
        >
          2-Factor Authentication
        </h1>

        <p
          className="text-gray-600 text-lg sm:text-xl md:text-2xl lg:text-2xl mb-8"
          style={{
            fontFamily: "Gilroy-Medium",
            fontWeight: 400,
            lineHeight: "1.2",
          }}
        >
          Scan the QR code with your authenticator app
        </p>

        <div className="flex justify-center mb-6">
          {qrData ? (
            <div className="p-4  rounded-2xl ">
              <img
                src={qrData}
                alt="QR Code"
                className="w-[200px] h-[200px] object-contain"
              />
            </div>
          ) : (
            <div className="w-[200px] h-[200px] bg-gray-100 flex items-center justify-center rounded-2xl border-2 border-gray-200">
              <p className="text-gray-500 text-sm">QR Not Generated</p>
            </div>
          )}
        </div>

        <p
          className="text-gray-600 text-base sm:text-lg mb-8"
          style={{
            fontFamily: "Gilroy-Medium",
            fontWeight: 400,
          }}
        >
          {qrData
            ? "Open your authenticator app and scan this QR code to set up 2FA"
            : "Waiting for QR Code..."}
        </p>

        <button
          disabled={!qrData}
          onClick={onNext}
          className={`w-full lg:w-[534px] mx-auto h-12 sm:h-12 md:h-14 lg:h-[60px] rounded-xl text-white text-lg font-[Gilroy-Semibold] transition-all duration-200 ${
            !qrData ? "opacity-50 cursor-not-allowed" : "hover:opacity-90 shadow-lg"
          }`}
          style={{
            backgroundColor: company?.primaryColor || "#039155",
            fontFamily: "Gilroy-SemiBold",
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Require2FAView;

