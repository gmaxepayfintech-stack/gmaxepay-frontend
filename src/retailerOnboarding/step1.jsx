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
    // Only validate the 'phone' field
    await formik.setFieldTouched("phone", true, true);
    const errors = await formik.validateForm();

    if (errors.phone) {
      // Set only the phone error for display
      formik.setErrors({ phone: errors.phone });
      return;
    }

    // --- Add OTP sending logic here (e.g., API call) ---
    console.log(`Sending OTP to: ${formik.values.phone}`);
  };

  return (
    <div className="w-full px-2 xxs:px-2 xs:px-2 sm:px-3 md:px-6 relative">
      {/* Title */}
      <div className="text-center mb-8 sm:mb-10 md:mb-12">
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
          Complete Your KYC
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-gray-600 mt-2">
          Secure your account by completing verification
        </p>
      </div>

      {/* Form Container */}
      <div className="w-full mx-auto rounded-lg bg-white shadow-sm p-6 sm:p-8 md:p-10">
        <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-5 sm:mb-7 md:mb-8 font-semibold text-gray-800 text-center">
          Mobile Verification
        </h3>

        <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-10 md:mb-12 text-center">
          Enter your mobile number to receive OTP
        </p>

        {/* PHONE INPUT GROUP */}
        <div className="mb-7 sm:mb-8 md:mb-10">
          <label className="block text-base sm:text-lg md:text-xl font-medium text-gray-800 mb-3 sm:mb-4">
            Mobile Number
          </label>

          <div className="flex gap-0">
            {/* Input Container */}
            <div className="relative flex-grow">
              <img
                src="/img/PhoneCall2.png"
                alt="Phone Icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 sm:w-6 h-5 sm:h-6 opacity-60"
              />

              <input
                type="tel"
                name="phone"
                value={formik.values.phone}
                onChange={handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter your number"
                className={`
                  w-full h-14 sm:h-16 md:h-20
                  border ${
                    formik.errors.phone && formik.touched.phone
                      ? "border-red-500"
                      : "border-gray-300"
                  }
                  rounded-l-lg
                  pl-14 sm:pl-16 pr-4 
                  text-base sm:text-lg md:text-xl 
                  outline-none focus:ring-2 focus:ring-[#039155]
                `}
                aria-invalid={
                  formik.errors.phone && formik.touched.phone ? "true" : "false"
                }
              />
            </div>

            {/* Verify/Send OTP Button */}
            <button
              type="button"
              onClick={sendOtp}
              className="
                bg-[#039155] text-white 
                px-5 sm:px-6 md:px-8 
                rounded-r-lg 
                text-sm sm:text-base md:text-lg font-medium 
                hover:bg-green-700 transition 
                h-14 sm:h-16 md:h-20
                flex-shrink-0
              "
            >
              Verify
            </button>
          </div>

          {formik.errors.phone && formik.touched.phone && (
            <p className="text-red-500 text-xs mt-1" role="alert">
              {formik.errors.phone} 
            </p>
          )}
        </div>

        {/* OTP INPUT GROUP */}
        <div className="mb-9 sm:mb-10 md:mb-12">
          <label className="block text-base sm:text-lg md:text-xl font-medium text-gray-800 mb-3 sm:mb-4">
            Enter OTP
          </label>

          <div className="relative">
            <img
              src="/img/DeviceMobileCamera.png"
              alt="OTP Icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 sm:w-6 h-5 sm:h-6 opacity-60"
            />

            <input
              type="text"
              name="otp"
              value={formik.values.otp}
              onChange={handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter Mobile OTP"
              className={`
                w-full h-14 sm:h-16 md:h-20
                border ${
                  formik.errors.otp && formik.touched.otp
                    ? "border-red-500"
                    : "border-gray-300"
                }
                rounded-lg 
                pl-14 sm:pl-16 pr-4 
                text-base sm:text-lg md:text-xl 
                outline-none focus:ring-2 focus:ring-[#039155]
              `}
              aria-invalid={
                formik.errors.otp && formik.touched.otp ? "true" : "false"
              }
            />
          </div>

          {formik.errors.otp && formik.touched.otp && (
            <p className="text-red-500 text-xs mt-1" role="alert">
              {formik.errors.otp}
            </p>
          )}
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="button"
          onClick={formik.handleSubmit}
          className="
            w-full 
            bg-[#039155] text-white 
            py-4 sm:py-5 md:py-6 lg:py-7
            rounded-lg 
            font-semibold 
            text-lg sm:text-xl md:text-2xl 
            hover:bg-green-700 transition
          "
        >
          Submit
        </button>
      </div>
    </div>
  );
}

export default Step1;
