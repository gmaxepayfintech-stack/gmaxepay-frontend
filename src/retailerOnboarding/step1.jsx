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
    min-h-screen 
    flex 
    justify-center 
    items-center 
    bg-gray-50
    p-2
    xxs:p-2
  "
    >
      <div
        className="
        w-full 
        xxs:w-[320px] 
        sm:w-[400px]
        md:w-[600px] 
        lg:w-[700px]
         bg-white 
        rounded-xl 
        shadow-md 
        p-4 
        sm:p-6 
        md:p-10
      "
      >
        {/* Title */}
        <div className="mb-8 ">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 text-center">
            Complete Your KYC
          </h2>
          <p className="text-gray-600 text-sm sm:text-base md:text-lg text-center mt-2 mb-6">
            Secure your account by completing verification
          </p>
        </div>

        <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-800 text-center mb-6">
          Mobile Verification
        </h3>

        <p className="text-gray-600 text-sm sm:text-base md:text-lg text-center mb-8">
          Enter your mobile number to receive OTP
        </p>

        {/* PHONE INPUT */}
        <div className="mb-8">
          <label className="block text-base font-medium xxs:font-normal text-gray-800 mb-2">
            Mobile Number
          </label>

          <div className="flex">
            <div className="relative flex-grow">
              <img
                src="/img/PhoneCall2.png"
                alt="Phone"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 opacity-60"
              />
              <div
                className={`absolute left-11 top-1/2 -translate-y-1/2 h-6 w-px transition ${
                  formData.phone ? "bg-[#1B1717]" : "bg-gray-300"
                }`}
              />
              <input
                type="tel"
                name="phone"
                value={formik.values.phone}
                onChange={handleChange}
                placeholder="Enter your number"
                className={`w-full h-14 border ${
                  formik.errors.phone ? "border-red-500" : "border-gray-300"
                } rounded-l-lg pl-14 pr-4 text-base outline-none`}
              />
            </div>

            <button
              type="button"
              onClick={sendOtp}
              className="bg-[#039155] text-white px-5 rounded-r-lg text-base font-medium hover:bg-green-700 transition h-14"
            >
              Verify
            </button>
          </div>

          {formik.errors.phone && (
            <p className="text-red-500 text-xs mt-1">{formik.errors.phone}</p>
          )}
        </div>

        {/* OTP INPUT */}
        <div className="mb-8">
          <label className="block text-base font-medium text-gray-800 mb-2">
            Enter OTP
          </label>

          <div className="relative">
            <img
              src="/img/DeviceMobileCamera.png"
              alt="OTP"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 opacity-60"
            />
            <div
              className={`absolute left-11 top-1/2 -translate-y-1/2 h-6 w-px transition ${
                formData.phone ? "bg-[#1B1717]" : "bg-gray-300"
              }`}
            />

            <input
              type="text"
              name="otp"
              value={formik.values.otp}
              onChange={handleChange}
              placeholder="Enter Mobile OTP"
              className={`w-full h-14 border ${
                formik.errors.otp ? "border-red-500" : "border-gray-300"
              } rounded-lg pl-14 pr-4 text-base outline-none`}
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
          className="w-full bg-[#039155] text-white py-4 rounded-lg font-semibold text-lg hover:bg-green-700 transition"
        >
          Submit
        </button>
      </div>
    </div>
  );
}

export default Step1;
