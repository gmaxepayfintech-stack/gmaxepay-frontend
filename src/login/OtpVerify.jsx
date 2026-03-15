import React, { useState, useEffect, useRef } from "react";
import { useCompany } from "../context/CompanyContext";
import { useLocation, useNavigate } from "react-router-dom";
import { verificationStatus } from "../redux/action/loginAction";
import { useDispatch, useSelector } from "react-redux";

const Baground2 = "/img/Baground2.png";
const Baground1 = "/img/background.jpg";

const OtpVerify = () => {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [timer, setTimer] = useState(180);
  const [currentIndex, setCurrentIndex] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();
  const mobileNo =
    location.state?.mobileNo || localStorage.getItem("otpMobile") || "";

  const inputRefs = useRef([]);
  const { company } = useCompany();
  const dispatch = useDispatch();

  const images = company?.sliderImages?.length
    ? company.sliderImages.map((img) => img.image)
    : [Baground1, Baground2];

  // Image Slider
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
    if (e.key === "Enter" && index === 5) {
      handleSubmit();
    }
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
        state: { mobileNo },
      });
    }
  }, [verificationStatusdata, navigate, mobileNo]);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white overflow-hidden">
      {/* LEFT IMAGE SLIDER */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {images.map((src, index) => (
          <img
            key={index}
            src={src}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1200ms] ${index === currentIndex ? "opacity-100" : "opacity-0"
              }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/40 via-green-800/30 to-transparent"></div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 flex items-center justify-center bg-white px-4 sm:px-8 md:px-10 lg:px-16 xl:px-20 py-6 sm:py-10 overflow-y-auto">
        <div className="w-full max-w-sm sm:max-w-md mx-auto">
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
            We’ve sent a 6-digit code to
          </p>
          <p className="text-gray-900 font-md text-center mb-8 sm:mb-10 text-lg sm:text-xl md:text-[24px]">
            +91 {mobileNo}
          </p>

          <div className="flex gap-2 sm:gap-4 md:gap-6 mb-8 justify-center">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-[40px] h-[40px] sm:w-[45px] sm:h-[45px] md:w-[50px] md:h-[50px] border rounded-lg text-center text-lg sm:text-xl font-normal outline-none focus:border-green-700 transition"
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
            disabled={timer !== 0}
            onClick={() => setTimer(30)}
            className={`text-sm sm:text-base md:text-[18px] font-[Gilroy-Semibold] w-full text-center mt-4 sm:mt-6 transition-colors ${timer === 0 ? "text-1B1717" : "text-1B171717 opacity-70"
              }`}
          >
            {timer === 0 ? "Resend Now" : `Resend in ${formatTimer(timer)}`}
          </button>

          <button
            onClick={handleSubmit}
            className="w-full text-white text-xl sm:text-2xl md:text-[28px] font-[Gilroy-Medium] mt-8 sm:mt-10 rounded-xl h-12 sm:h-14 flex items-center justify-center transition hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: company?.primaryColor || "#039155" }}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtpVerify;
