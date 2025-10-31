function Step1({ formData, setFormData, onNext }) {
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(d => ({ ...d, [name]: value }));
  };

  const sendOtp = () => {
    setFormData(d => ({ ...d, otpSent: true }));
  };

  const verifyOtp = () => {
    setFormData(d => ({ ...d, otpVerified: true }));
  };

  return (
    <form className="space-y-6" onSubmit={e => e.preventDefault()}>
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-2">Mobile Verification</h3>
        <p className="text-sm text-gray-600 mb-4">Enter Your Mobile Number To Receive OTP.</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Mobile Number</label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <img src="/img/PhoneCall2.png" alt="Mobile" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-50" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter Your Number"
                  className="w-full border rounded-lg px-3 py-2 pl-10 outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <button type="button" onClick={sendOtp} className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium">
                {formData.otpSent ? 'Resend OTP' : 'Verify'}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Enter OTP</label>
            <div className="relative">
              <img src="/img/DeviceMobileCamera.png" alt="OTP" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-50" />
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                placeholder="Enter Mobile OTP"
                className="w-full border rounded-lg px-3 py-2 pl-10 outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={verifyOtp} className={"px-6 py-2 rounded-lg font-medium mr-2 "+(formData.otpVerified?"bg-green-600 text-white":"border border-gray-300")}>
              {formData.otpVerified?"Verified ✓":"Verify"}
            </button>
            <button type="button" onClick={onNext} className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium" disabled={!formData.otpVerified}>
              Submit
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

export default Step1;

