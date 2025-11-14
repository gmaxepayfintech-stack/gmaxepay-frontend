import { useFormik } from "formik";
import * as Yup from "yup";
import {
  MobileOTPResponse,
  resendOTPResponse,
} from "../redux/action/onboardingAction";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";

function Step1({ formData, setFormData, onNext }) {
  const dispatch = useDispatch();
  const [timer, setTimer] = useState(0);

  const validationSchema = Yup.object({
    phone: Yup.string()
      .matches(/^[6-9]\d{9}$/, "Enter valid 10-digit mobile number")
      .required("Mobile number is required"),

    otp: Yup.string()
      .matches(/^\d{4,6}$/, "Enter valid OTP")
      .required("OTP is required"),
  });

  const formik = useFormik({
    initialValues: {
      phone: formData.phone || "",
      otp: formData.otp || "",
    },
    validationSchema,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: () => onNext(),
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

  const invalidNumber = useSelector((state)=>state)
  console.log("invalidNumber",invalidNumber);
  

  return (
    <div className="flex justify-center items-center bg-gray-50">
      <div className="bg-white p-8 gap-4 w-full">
        <h3 className="text-center text-[24px] font-semibold text-gray-800">
          Mobile Verification
        </h3>
        <p className="text-center text-[16px] text-[#1B1717] mt-4 mb-6">
          Enter Your Mobile Number To Receive OTP
        </p>

        {/* Mobile Number Section */}
        <div className="mb-5">
          <label className="block text-[20px] font-medium text-[#1B1717] mb-2">
            Mobile Number
          </label>

          <div className="flex">
            <div className="relative flex-1">
              <img
                src="/img/PhoneCall2.png"
                alt="Mobile"
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition ${
                  formData.phone ? "opacity-100" : "opacity-50"
                }`}
              />

              <div
                className={`absolute left-11 top-1/2 -translate-y-1/2 h-6 w-px transition ${
                  formData.phone ? "bg-[#1B1717]" : "bg-gray-300"
                }`}
              />

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter Your Number"
                className="w-full border border-[#1B1717] border-opacity-80 h-[60px] rounded-l-lg py-2 pl-14 pr-3 text-sm outline-none"
              />
            </div>

            {/* VERIFY / RESEND BUTTON */}
            <button
              type="button"
              onClick={formData.otpSent ? resendOtp : sendOtp}
              disabled={timer > 0}
              className={`px-6 rounded-r-lg text-sm font-medium transition h-[60px]
                ${
                  timer > 0
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-[#039155] text-white hover:bg-green-700"
                }`}
            >
              {timer > 0
                ? `Resend OTP (${timer}s)`
                : formData.otpSent
                ? "Resend OTP"
                : "Verify"}
            </button>
          </div>

          {formik.errors.phone && (
            <p className="text-red-500 text-sm mt-1">{formik.errors.phone}</p>
          )}
        </div>

        {/* OTP Section */}
        <div className="mb-6">
          <label className="block text-[20px] font-medium text-[#1B1717] mb-2">
            Enter OTP
          </label>

          <div className="relative">
            <img
              src="/img/DeviceMobileCamera.png"
              alt="OTP"
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition ${
                formData.otp ? "opacity-100" : "opacity-50"
              }`}
            />

            <div
              className={`absolute left-11 top-1/2 -translate-y-1/2 h-6 w-px ${
                formData.otp ? "bg-[#1B1717]" : "bg-gray-300"
              }`}
            />

            <input
              type="text"
              name="otp"
              value={formData.otp}
              onChange={handleChange}
              placeholder="Enter Mobile OTP"
              className="w-full border border-[#1B1717] border-opacity-80 h-[60px] rounded-lg py-2 pl-14 pr-3 text-sm outline-none"
            />
          </div>

          {formik.errors.otp && (
            <p className="text-red-500 text-sm mt-1">{formik.errors.otp}</p>
          )}
        </div>

        <button
          type="button"
          onClick={formik.handleSubmit}
          className="w-[534px] py-2 rounded-lg text-white text-[24px] font-medium h-[60px] transition bg-[#039155] hover:bg-green-700"
        >
          Submit
        </button>
      </div>
    </div>
  );
}

export default Step1;
