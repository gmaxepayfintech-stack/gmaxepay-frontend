import React, { useEffect, useState } from "react";
import Baground2 from "../../public/img/Baground2.png";
import Baground1 from "../../public/img/background.jpg";
import { useCompany } from "../context/CompanyContext";
import { useLocation } from "react-router-dom";
import Auth2Factor from "./Auth2Factor";

const Require2FA = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAuth2FA, setShowAuth2FA] = useState(false); // ✅ Toggle screen
  const { company } = useCompany();
  const { state } = useLocation();

  const qrdata = state?.qrCode;

  const images = company?.sliderImages?.length
    ? company.sliderImages.map((img) => img.image)
    : [Baground1, Baground2];

  useEffect(() => {
    const interval = setInterval(
      () => setCurrentIndex((prev) => (prev + 1) % images.length),
      4000
    );
    return () => clearInterval(interval);
  }, [images.length]);

  // ✅ If user clicked Next, show Auth2Factor instead of current UI
  if (showAuth2FA) return <Auth2Factor />;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white overflow-hidden">
      {/* LEFT IMAGE SLIDER */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {images.map((src, index) => (
          <img
            key={index}
            src={src}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1200ms] ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/40 via-green-800/30 to-transparent"></div>
      </div>

      {/* RIGHT SIDE UI */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 sm:px-10 md:px-16 py-10">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-[28px] font-semibold mb-6 text-[#1B1717]">
            2-Factor Authentication
          </h1>

          <div className="flex justify-center mb-4">
            {qrdata ? (
              <img
                src={qrdata}
                alt="QR Code"
                className="w-[180px] h-[180px] object-contain"
              />
            ) : (
              <div className="w-[180px] h-[180px] bg-gray-200 flex items-center justify-center rounded-lg text-gray-600">
                QR Not Generated
              </div>
            )}
          </div>

          <p className="text-lg text-1B1717 font-medium mb-8">
            {qrdata ? "Scan Here" : "Waiting for QR Code..."}
          </p>

          <button
            disabled={!qrdata}
            onClick={() => setShowAuth2FA(true)} // ✅ No navigation!
            className={`w-full h-12 rounded-lg text-white text-lg font-medium ${
              !qrdata ? "opacity-50 cursor-not-allowed" : ""
            }`}
            style={{ backgroundColor: company?.primaryColor || "#039155" }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Require2FA;
