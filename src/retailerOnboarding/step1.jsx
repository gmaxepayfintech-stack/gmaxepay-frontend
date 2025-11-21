import { useFormik } from "formik";
import * as Yup from "yup";

function Step1({ formData, setFormData, onNext }) {
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
    await formik.setFieldTouched("phone", true, true);
    const errors = await formik.validateForm();

    if (errors.phone) {
      formik.setErrors({ phone: errors.phone });
      return;
    }

    console.log(`Sending OTP to: ${formik.values.phone}`);
  };

  return (
    <div
      className="
    w-full 
    h-full 
    flex 
    justify-center 
    items-center 
    p-2
    sm:p-3
    md:p-4
    overflow-hidden
  "
    >
      <div
        className="
        w-full 
        max-w-[95%]
        sm:w-[400px]
        md:w-[600px] 
        lg:w-[700px]
        bg-white 
        rounded-xl 
        shadow-md 
        p-3
        sm:p-5
        md:p-6
        lg:p-8
        mx-auto
      "
      >

        <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-800 text-center mb-2 sm:mb-3">
          Mobile Verification
        </h3>

        <p className="text-gray-600 text-xs sm:text-sm md:text-base text-center mb-3 sm:mb-4 md:mb-5">
          Enter your mobile number to receive OTP
        </p>

        {/* PHONE INPUT */}
        <div className="mb-3 sm:mb-4 md:mb-5">
          <label className="block text-xs sm:text-sm md:text-base font-medium text-gray-800 mb-1 sm:mb-2">
            Mobile Number
          </label>

          <div className="flex">
            <div className="relative flex-grow">
              <img
                src="/img/PhoneCall2.png"
                alt="Phone"
                className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 sm:w-5 opacity-60"
              />
              <div
                className={`absolute left-9 sm:left-11 top-1/2 -translate-y-1/2 h-5 sm:h-6 w-px transition ${formData.phone ? "bg-[#1B1717]" : "bg-gray-300"
                  }`}
              />
              <input
                type="tel"
                name="phone"
                value={formik.values.phone}
                onChange={handleChange}
                placeholder="Enter your number"
                className={`w-full h-12 sm:h-14 md:h-16 border ${formik.errors.phone ? "border-red-500" : "border-gray-300"
                  } rounded-l-lg pl-10 sm:pl-14 pr-3 sm:pr-4 text-sm sm:text-base outline-none`}
              />
            </div>

            <button
              type="button"
              onClick={sendOtp}
              className="bg-[#039155] text-white px-3 sm:px-4 md:px-6 rounded-r-lg text-xs sm:text-sm md:text-base font-medium hover:bg-green-700 transition h-12 sm:h-14 md:h-16 flex-shrink-0 whitespace-nowrap"
            >
              Verify
            </button>
          </div>

          {formik.errors.phone && (
            <p className="text-red-500 text-xs mt-1">{formik.errors.phone}</p>
          )}
        </div>

        {/* OTP INPUT */}
        <div className="mb-3 sm:mb-4 md:mb-5">
          <label className="block text-xs sm:text-sm md:text-base font-medium text-gray-800 mb-1 sm:mb-2">
            Enter OTP
          </label>

          <div className="relative">
            <img
              src="/img/DeviceMobileCamera.png"
              alt="OTP"
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 sm:w-5 opacity-60"
            />
            <div
              className={`absolute left-9 sm:left-11 top-1/2 -translate-y-1/2 h-5 sm:h-6 w-px transition ${formData.phone ? "bg-[#1B1717]" : "bg-gray-300"
                }`}
            />

            <input
              type="text"
              name="otp"
              value={formik.values.otp}
              onChange={handleChange}
              placeholder="Enter Mobile OTP"
              className={`w-full h-12 sm:h-14 md:h-16 border ${formik.errors.otp ? "border-red-500" : "border-gray-300"
                } rounded-lg pl-10 sm:pl-14 pr-3 sm:pr-4 text-sm sm:text-base outline-none`}
            />
          </div>

          {formik.errors.otp && (
            <p className="text-red-500 text-xs mt-1">{formik.errors.otp}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="button"
          onClick={formik.handleSubmit}
          className="w-full bg-[#039155] text-white py-2.5 sm:py-3 md:py-3.5 rounded-lg font-semibold text-sm sm:text-base md:text-lg hover:bg-green-700 transition shadow-md"
        >
          Submit
        </button>
      </div>
    </div>
  );
}

export default Step1;
