import { useEffect, useRef, useState } from "react";
import Baground2 from "../../public/img/Baground2.png";
import Baground1 from "../../public/img/background.jpg";
import { useCompany } from "../context/CompanyContext";
import { authOtp } from "../redux/action/loginAction";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginSuccess } from "../redux/action/authAction";

const Auth2Factor = ({ primaryColor }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const inputsRef = useRef([]);
  const { company } = useCompany();
  const dispatch = useDispatch();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const navigate = useNavigate();
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

  const handleInputChange = (e, index) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    e.target.value = val.slice(-1);

    const newOtp = [...otp];
    newOtp[index] = e.target.value;
    setOtp(newOtp);

    if (val && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const factresponse = useSelector(
    (state) => state?.login?.twoFactorAuth?.data?.accessToken
  );
//   console.log("factresponse", factresponse);

  const usedata = useSelector(
    (state) => state?.login?.twoFactorAuth?.data?.user
  );
//   console.log("usedata", usedata);

  const factstatus = useSelector(
    (state) => state?.login?.twoFactorAuth?.status
  );
//   console.log("factstatus", factstatus);

  const handleSubmit = () => {
    const finalOtp = otp.join("");
    if (finalOtp.length !== 6) {
      alert("Enter full 6-digit OTP");
      return;
    }
    dispatch(authOtp({ otp: finalOtp }));
  };
  useEffect(() => {
  if (factstatus === "SUCCESS" && factresponse && usedata) {
    dispatch(
      loginSuccess({
        token: factresponse,
        user: usedata,
      })
    );
    navigate("/dashboard/home"); 
  }
}, [factstatus, factresponse, usedata, dispatch]);


  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white overflow-hidden">
      {/* LEFT IMAGE SLIDER */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {images.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`slide-${index}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1200ms] ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/40 via-green-800/30 to-transparent" />
      </div>

      {/* RIGHT SIDE UI */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-10 md:px-16 py-10">
        <div className="w-full max-w-sm text-center">
          <p className="text-2xl sm:text-[28px] md:text-[34px] font-semibold mb-6 text-[#1B1717]">
            2-Factor Authentication
          </p>

          <p className="text-[16px] sm:text-[18px] md:text-[20px] opacity-70 font-medium mb-6">
            We've sent a 6-digit code to
          </p>

          {/* OTP Inputs */}
          <div className="flex justify-center gap-3 sm:gap-4 md:gap-6 mb-8">
            {[...Array(6)].map((_, index) => (
              <input
                key={index}
                ref={(el) => (inputsRef.current[index] = el)}
                maxLength="1"
                onChange={(e) => handleInputChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                inputMode="numeric"
                pattern="[0-9]*"
                className="w-[42px] h-[48px] md:w-[45px] md:h-[50px] border rounded-lg text-center text-lg font-medium outline-none focus:border-green-700"
                style={{ border: "1.5px solid rgba(27,23,23,0.4)" }}
              />
            ))}
          </div>

          <button
            className="w-full md:w-[500px] md:-ml-14 h-12 rounded-lg text-white text-lg font-medium"
            onClick={() => handleSubmit()}
            style={{
              backgroundColor:
                primaryColor || company?.primaryColor || "#039155",
            }}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth2Factor;
