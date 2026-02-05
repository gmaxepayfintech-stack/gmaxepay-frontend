import { useFormik } from "formik";
import * as Yup from "yup";
import {
  MobileOTPResponse,
  resendOTPResponse,
  verifySmsOtp,
} from "../redux/action/onboardingAction";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";

function Step1({ formData, setFormData, onNext, onRefreshSteps }) {
  const dispatch = useDispatch();

  const [timer, setTimer] = useState(0);
  const [successCooldown, setSuccessCooldown] = useState(180);

  const validationSchema = Yup.object({
    phone: Yup.string()
      .matches(/^[6-9]\d{9}$/, "Enter valid 10-digit mobile number")
      .required("Mobile number is required"),

    otp: Yup.string()
      .matches(/^\d{4,6}$/, "Enter valid OTP")
      .required("OTP is required"),
  });

  const submitOtp = () => {
    const token = localStorage.getItem("onboardingToken");

    dispatch(verifySmsOtp({ otp: formik.values.otp }, token));
  };

  const formik = useFormik({
    initialValues: {
      phone: formData.phone || "",
      otp: formData.otp || "",
    },
    validationSchema,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: submitOtp,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    formik.setFieldValue(name, value);
    setFormData((d) => ({ ...d, [name]: value }));
  };

  const sendOtp = async () => {
    const errors = await formik.validateForm();
    if (errors.phone) {
      formik.setErrors(errors);
      return;
    }

    const token = localStorage.getItem("onboardingToken");
    dispatch(MobileOTPResponse({ mobileNo: formik.values.phone }, token));

    setFormData((d) => ({ ...d, otpSent: true }));
    setTimer(30);
  };

  const resendOtp = () => {
    const token = localStorage.getItem("onboardingToken");
    dispatch(resendOTPResponse({ mobileNo: formik.values.phone }, token));
    setTimer(30);
  };

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const verifySuccess = useSelector(
    (state) => state?.onboarding?.otpStatus?.status,
  );

  useEffect(() => {
    if (verifySuccess === "SUCCESS") {
      setSuccessCooldown(180);
    }
  }, [verifySuccess]);

  const FormSuccess = useSelector(
    (state) => state?.onboarding?.verifySmsVerify?.status,
  );

  useEffect(() => {
    if (FormSuccess === "SUCCESS") {
      // Refresh steps after successful completion
      if (onRefreshSteps) {
        onRefreshSteps();
      }
      onNext();
    }
  }, [FormSuccess, onRefreshSteps]);

  useEffect(() => {
    if (successCooldown > 0) {
      const interval = setInterval(() => {
        setSuccessCooldown((t) => t - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [successCooldown]);

  return (
    <div className="w-full h-full flex justify-center items-center  p-1 sm:p-2 md:p-2 lg:p-3 xl:p-4 overflow-hidden ">
      <div className="w-full max-w-[98%] sm:max-w-[480px] md:max-w-[520px] lg:max-w-[580px] xl:max-w-[600px] 2xl:max-w-[700px] mx-auto">
        <h3 className="text-base sm:text-lg  font-[gilroy-semibold] text-center text-[#1B1717]">
          Mobile Verification
        </h3>
        <p className="text-[#1B1717]/80 font-[gilroy-medium] text-xs sm:text-xs md:text-sm text-center mb-2.5 sm:mb-3 md:mb-3.5 lg:mb-3 xl:mb-4 mt-2">
          Enter Your Mobile Number To Receive OTP
        </p>

        {/* Mobile Number Section */}
        <div className="mb-3 md:mb-4">
          <label
            htmlFor="phone"
            className="block text-xs md:text-lg font-[gilroy-semibold] text-[#1B1717] mb-2"
          >
            Mobile Number
          </label>

          <div className="flex flex-row gap-0">
            <div className="relative flex-grow">
              <img
                src="/img/PhoneCall2.png"
                alt="Mobile"
                className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-[#1B1717]/70 z-10"
              />

              <div
                className={`absolute left-10 sm:left-11 top-1/2 -translate-y-1/2 h-5 sm:h-6 w-px transition ${
                  formData.phone ? "bg-[#1B1717]" : "bg-gray-300"
                }`}
              />

              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter Your Number"
                className={`w-full h-10 md:h-11 lg:h-14 border-[0.5px] border-r-0 font-[gilroy-medium]
                  ${formik.errors.phone ? "border-red-500" : "border-[#1B1717]/80"}
                  rounded-l-lg
                  pl-10 md:pl-12 lg:pl-14
                  pr-3
                  text-sm md:text-base
                  outline-none
                  focus:border-[#1B1717]/80
                  transition
                `}
              />
            </div>

            {/* VERIFY / RESEND BUTTON */}
            <button
              type="button"
              onClick={
                verifySuccess === "SUCCESS"
                  ? successCooldown === 0
                    ? resendOtp
                    : null
                  : sendOtp
              }
              disabled={verifySuccess === "SUCCESS" && successCooldown > 0}
              className={`h-10 md:h-11 lg:h-14
        px-5 md:px-8
        border-[0.5px]
        border-l-0
        ${formik.errors.phone ? "border-red-500" : "border-[#039155]"}
        rounded-r-lg
        font-[gilroy-semibold]
        text-xs md:text-sm
        whitespace-nowrap
        shadow-md
        transition
        flex-shrink-0    ${
          verifySuccess === "SUCCESS" && successCooldown > 0
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-[#039155] text-white hover:bg-green-700"
        }
  `}
            >
              {verifySuccess === "SUCCESS"
                ? successCooldown > 0
                  ? `Resend OTP in (${successCooldown}s)`
                  : "Resend OTP"
                : "Verify"}
            </button>
          </div>

          {formik.errors.phone && (
            <p className="text-red-500 text-xs sm:text-sm mt-1">
              {formik.errors.phone}
            </p>
          )}
        </div>

        {/* OTP Section */}
        <div className="mb-3 md:mb-4">
          <label
            htmlFor="otp"
            className="block text-xs md:text-lg font-[gilroy-semibold] text-[#1B1717] mb-2"
          >
            Enter OTP
          </label>

          <div className="relative">
            <img
              src="/img/DeviceMobileCamera.png"
              alt="OTP"
              className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-[#1B1717]/70 z-10"
            />

            <div
              className={`absolute left-10 sm:left-11 top-1/2 -translate-y-1/2 h-5 sm:h-6 w-px ${
                formData.otp ? "bg-[#1B1717]" : "bg-gray-300"
              }`}
            />

            <input
              id="otp"
              type="text"
              name="otp"
              value={formData.otp}
              onChange={handleChange}
              placeholder="Enter Mobile OTP"
              className={`w-full h-10 md:h-11 lg:h-14 border-[0.5px]
        font-[gilroy-medium]
        ${
          formik.errors.otp && formik.touched.otp
            ? "border-red-500"
            : "border-[#1B1717]/80"
        }
        rounded-lg
        pl-10 md:pl-12 lg:pl-14
        pr-3
        text-sm md:text-base
        outline-none
        focus:border-[#1B1717]/80
        transition
      `}
            />
          </div>

          {formik.errors.otp && (
            <p className="text-red-500 text-xs sm:text-sm mt-1">
              {formik.errors.otp}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={formik.handleSubmit}
          className="
    w-full
    h-10 md:h-11 lg:h-14
    bg-[#039155]
    text-white
    rounded-lg md:rounded-xl
    font-[gilroy-semibold]
    text-sm md:text-base
    hover:bg-green-700
    transition
    shadow-lg
    mt-7
    flex
    items-center
    justify-center
  "
        >
          Submit
        </button>
      </div>
    </div>
  );
}

export default Step1;
