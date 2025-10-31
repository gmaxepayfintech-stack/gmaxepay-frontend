function Step2({ formData, setFormData, onNext }) {
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(d => ({ ...d, [name]: value }));
  };

  const sendEmailOtp = () => {
    setFormData(d => ({ ...d, emailOtpSent: true }));
  };

  const verifyEmailOtp = () => {
    setFormData(d => ({ ...d, emailOtpVerified: true }));
  };

  return (
    <form className="space-y-6" onSubmit={e => e.preventDefault()}>
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-2">Email Id Verification</h3>
        <p className="text-sm text-gray-600 mb-4">Enter Your Mobile Number To Receive OTP.</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email Id</label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <img src="/img/Envelope.png" alt="Email" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-50" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter Your Email Id."
                  className="w-full border rounded-lg px-3 py-2 pl-10 outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <button type="button" onClick={sendEmailOtp} className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium">
                {formData.emailOtpSent ? 'Resend OTP' : 'Verify'}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Enter OTP</label>
            <div className="relative">
              <img src="/img/DeviceMobileCamera.png" alt="OTP" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-50" />
              <input
                type="text"
                name="emailOtp"
                value={formData.emailOtp}
                onChange={handleChange}
                placeholder="Enter Email OTP"
                className="w-full border rounded-lg px-3 py-2 pl-10 outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={verifyEmailOtp} className={"px-6 py-2 rounded-lg font-medium mr-2 "+(formData.emailOtpVerified?"bg-green-600 text-white":"border border-gray-300")}>
              {formData.emailOtpVerified?"Verified ✓":"Verify"}
            </button>
            <button type="button" onClick={onNext} className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium" disabled={!formData.emailOtpVerified}>
              Submit
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

export default Step2;

