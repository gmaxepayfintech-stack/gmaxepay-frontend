function Step1({ formData, setFormData, onNext }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((d) => ({ ...d, [name]: value }));
  };

  const sendOtp = () => {
    setFormData((d) => ({ ...d, otpSent: true }));
  };

  const verifyOtp = () => {
    setFormData((d) => ({ ...d, otpVerified: true }));
  };

  return (
    <div className="flex justify-center items-center bg-gray-50 ">
      <div className="bg-white p-8 gap-4 w-full ">
        {/* Title */}
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
              {/* Mobile Icon */}
              <img
                src="/img/PhoneCall2.png"
                alt="Mobile"
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition ${
                  formData.phone ? "opacity-100" : "opacity-50"
                }`}
              />

              {/* Vertical Line */}
              <div
                className={`absolute left-11 top-1/2 -translate-y-1/2 h-6 w-px transition ${
                  formData.phone ? "bg-[#1B1717]" : "bg-gray-300"
                }`}
              />
              {/* Input */}
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter Your Number"
                className="w-full border border-[#1B1717] border-x-[#039155] border-opacity-80 h-[60px] rounded-l-lg py-2 pl-14 pr-3 text-sm outline-none "
              />
            </div>

            {/* Button */}
            <button
              type="button"
              onClick={sendOtp}
              className="bg-[#039155] text-white px-6 rounded-r-lg text-sm font-medium hover:bg-green-700 transition"
            >
              {formData.otpSent ? "Resend OTP" : "Verify"}
            </button>
          </div>
        </div>

        {/* OTP Section */}
        <div className="mb-6">
          <label className="block text-[20px] font-medium text-[#1B1717] mb-2">
            Enter OTP
          </label>

          <div className="relative">
            {/* OTP Icon */}
            <img
              src="/img/DeviceMobileCamera.png"
              alt="OTP"
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition fill-current ${
                formData.otp ? "opacity-100" : "opacity-50"
              }`}
            />

            {/* Vertical Line */}
            <div
              className={`absolute left-11 top-1/2 -translate-y-1/2 h-6 w-px transition ${
                formData.otp ? "bg-[#1B1717]" : "bg-[#1B1717] bg-opacity-10"
              }`}
            />

            <input
              type="text"
              name="otp"
              value={formData.otp}
              onChange={handleChange}
              placeholder="Enter Mobile OTP"
              className="w-full border border-gray-300 rounded-lg py-2 h-[60px] pl-14 pr-3 text-sm outline-none focus:ring-1 focus:ring-[#1B1717] border-opacity-80"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={onNext}
          disabled={!formData.otpVerified}
          className={`w-[534px] py-2 rounded-lg text-white text-[24px] font-medium h-[60px] transition ${
            formData.otpVerified
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-[#039155] hover:bg-green-700"
          }`}
        >
          Submit
        </button>
      </div>
    </div>
  );
}

export default Step1;
