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
    (state) => state?.onboarding?.otpStatus?.status
  );

  useEffect(() => {
    if (verifySuccess === "SUCCESS") {
      setSuccessCooldown(180);
    }
  }, [verifySuccess]);

  const FormSuccess = useSelector(
    (state) => state?.onboarding?.verifySmsVerify?.status
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
    <div className="flex justify-center items-center bg-gray-50 min-h-screen px-4 sm:px-6 py-4 sm:py-8">
      <div className="bg-white p-4 sm:p-6 md:p-8 gap-4 w-full max-w-2xl">
        <h3 className="text-center text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">
          Mobile Verification
        </h3>
        <p className="text-center text-sm sm:text-base text-[#1B1717] mt-3 sm:mt-4 mb-4 sm:mb-6">
          Enter Your Mobile Number To Receive OTP
        </p>

        {/* Mobile Number Section */}
        <div className="mb-4 sm:mb-5">
          <label htmlFor="phone" className="block text-base sm:text-lg md:text-[20px] font-medium text-[#1B1717] mb-2">
            Mobile Number
          </label>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <div className="relative flex-1">
              <img
                src="/img/PhoneCall2.png"
                alt="Mobile"
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 transition ${
                  formData.phone ? "opacity-100" : "opacity-50"
                }`}
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
                className="w-full border border-[#1B1717] border-opacity-80 h-[50px] sm:h-[60px] rounded-lg sm:rounded-l-lg sm:rounded-r-none py-2 pl-11 sm:pl-14 pr-3 text-sm outline-none"
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
              className={`w-full sm:w-40 px-4 sm:px-6 rounded-lg sm:rounded-r-lg sm:rounded-l-none text-xs sm:text-sm font-medium transition h-[50px] sm:h-[60px]
    ${
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
            <p className="text-red-500 text-xs sm:text-sm mt-1">{formik.errors.phone}</p>
          )}
        </div>

        {/* OTP Section */}
        <div className="mb-4 sm:mb-6">
          <label htmlFor="otp" className="block text-base sm:text-lg md:text-[20px] font-medium text-[#1B1717] mb-2">
            Enter OTP
          </label>

          <div className="relative">
            <img
              src="/img/DeviceMobileCamera.png"
              alt="OTP"
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 transition ${
                formData.otp ? "opacity-100" : "opacity-50"
              }`}
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
              className="w-full border border-[#1B1717] border-opacity-80 h-[50px] sm:h-[60px] rounded-lg py-2 pl-11 sm:pl-14 pr-3 text-sm outline-none"
            />
          </div>

          {formik.errors.otp && (
            <p className="text-red-500 text-xs sm:text-sm mt-1">{formik.errors.otp}</p>
          )}
        </div>

        <button
          type="button"
          onClick={formik.handleSubmit}
          className="w-full sm:w-auto sm:min-w-[300px] md:min-w-[534px] py-2 rounded-lg text-white text-base sm:text-lg md:text-[24px] font-medium h-[50px] sm:h-[60px] transition bg-[#039155] hover:bg-green-700"
        >
          Submit
        </button>
      </div>
    </div>
  );
}

export default Step1;
