import React, { useState, useEffect, useRef } from "react";
import Baground2 from "../../public/img/Baground2.png";
import Baground1 from "../../public/img/background.jpg";
import { useCompany } from "../context/CompanyContext";
import {  useNavigate } from "react-router-dom";
import { verificationStatus } from "../redux/action/loginAction";
import { useDispatch, useSelector } from "react-redux";

const VerificationCode = ({phoneNumber }) => {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [timer, setTimer] = useState(180);
  const [currentIndex, setCurrentIndex] = useState(0);

  const navigate = useNavigate();
 const mobileNo = phoneNumber || "";
  const inputRefs = useRef([]);
  const { company } = useCompany();
  const dispatch = useDispatch();

  const images = company?.sliderImages?.length
    ? company.sliderImages.map((img) => img.image)
    : [Baground1, Baground2];

  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  // Timer Countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (value, index) => {
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = () => {
    const finalOtp = otp.join("");

    if (finalOtp.length !== 6) {
      alert("Please enter a valid 6-digit OTP");
      return;
    }

    // console.log("OTP Submitted:", finalOtp);

    dispatch(
      verificationStatus({
        otp: finalOtp,
      })
    );
  };

  const formatTimer = (t) => {
    const minutes = Math.floor(t / 60);
    const seconds = t % 60;

    if (t > 60) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const verificationResponse = useSelector(
    (state) => state?.login?.verificationcode?.data
  );

  const verificationStatusdata = useSelector(
    (state) => state?.login?.verificationcode?.status
  );

  useEffect(() => {
    console.log("verification response", verificationResponse);
  }, [verificationResponse]);

  useEffect(() => {
    if (verificationStatusdata === "SUCCESS") {
      navigate("/require/2fa", {
        state: verificationResponse, 
      });
    }
  }, [verificationResponse, navigate, mobileNo]);

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

      {/* RIGHT SIDE */}
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
            We’ve sent a 6-digit code to
          </p>
          <p className="text-gray-900 font-md text-center mb-10 text-[24px] ">
            +91 {mobileNo}
          </p>

          <div className="flex gap-6 sm:gap-6 mb-8 justify-center">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
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
            disabled={timer !== 0}
            onClick={() => setTimer(30)}
            className={`text-sm font-semibold w-full text-center text-[18px] mt-6 ${
              timer === 0 ? "text-1B1717" : "text-1B171717 opacity-70"
            }`}
          >
            {timer === 0 ? "Resend Now" : `Resend in ${formatTimer(timer)}`}
          </button>

          <button
            onClick={handleSubmit}
            className="w-[500px] text-white text-[28px] font-medium mt-10 rounded-xl h-12 sm:h-14 -ml-12 flex items-center justify-center"
            style={{ backgroundColor: company?.primaryColor || "#039155" }}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationCode;


