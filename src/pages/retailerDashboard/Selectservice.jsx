import { useState } from "react";
import StartCapture from "../../../public/img/StartCapture.svg";

const FingerPrintIcon = "/img/FingerPrint.svg";
const IrisIcon = "/img/Iris.svg";
const EyeIcon = "/img/Eye.svg";

const Selectservice = () => {
  const [activeTab, setActiveTab] = useState("cashWithdrawal");
  const [biometricMethod, setBiometricMethod] = useState("thumb");
  const [selectedBank, setSelectedBank] = useState("yesBank");
  const [selectedAmount, setSelectedAmount] = useState("1000");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  
  const comingSoon = biometricMethod === "iris";

  const tabs = [
    { key: "cashWithdrawal", label: "Cash Withdrawal" },
    { key: "enquiry", label: "Enquiry" },
    { key: "statement", label: "Statement" },
  ];

  const recentBanks = [
    { id: "yesBank", name: "Yes Bank", logo: "YES BANK" },
    { id: "kotak1", name: "Kotak Mahindra Bank", logo: "KOTAK" },
    { id: "kotak2", name: "Kotak Mahindra Bank", logo: "KOTAK" },
    { id: "axis", name: "Axis Bank", logo: "AXIS" },
  ];


  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="text-[24px] font-['Gilroy-Medium'] text-[#1B1717]">
          Select Your Service
        </div>
      </div>

      {/* Service Tabs */}
      <div className="mb-[28px]">
        <div className="inline-flex items-center gap-[66px] bg-[#FFFFFF] rounded-3xl p-3">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-[14px] py-[10px] gap-10 rounded-xl text-[14px] font-['Gilroy-Medium'] transition ${
                  isActive
                    ? "bg-[#039155] text-[#FFFFFF]"
                    : "text-[#1B1717] text-opacity-80 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left Column: Authentication */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col h-full">
          <div className="text-[24px] font-['Gilroy-Medium'] text-[#1B1717] mb-1">
            Authentication
          </div>
          <div className="text-[16px] text-[#000000] font-['Gilroy-Regular'] mb-[12px]">
            Select Biometric Method To Proceed
          </div>

          {/* Biometric Method Selection */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Thumb Verification */}
            <button
              type="button"
              onClick={() => setBiometricMethod("thumb")}
              className={`p-8 rounded-xl border-2 transition ${
                biometricMethod === "thumb"
                  ? "bg-[#E5FFF4] border-[#039155]"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <img
                  src={FingerPrintIcon}
                  alt="Thumb Verification"
                  className="w-[32px] h-[32px]"
                />
                <div className="text-[12px] font-['Gilroy-Medium'] text-[#1B1717]">
                  Thumb Verification
                </div>
              </div>
            </button>

            {/* Iris Scan */}
            <button
              type="button"
              onClick={() => setBiometricMethod("iris")}
              className={`p-4 rounded-xl border-2 transition ${
                biometricMethod === "iris"
                  ? "bg-[#E5FFF4] border-[#039155]"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <img src={IrisIcon} alt="Iris Scan" className="w-10 h-10" />
                <div className="text-[12px] font-['Gilroy-Medium'] text-[#1B1717]">
                  Iris Scan
                </div>
              </div>
            </button>
          </div>

          {/* Connected Device Indicator */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 bg-[#039155] text-white rounded-full px-4 py-2">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-[12px] font-['Gilroy-Medium']">
                Connected Device
              </span>
            </div>
          </div>

          {/* Scanner Interface - Conditional based on biometric method */}
          <div className={`border border-gray-200 rounded-xl p-8 flex-1 flex flex-col justify-center transition relative ${
            comingSoon ? "bg-gray-50" : "bg-white"
          }`}>
            {/* Background content - blurred when comingSoon */}
            <div className={`flex flex-col items-center gap-4 ${
              comingSoon ? "opacity-80 pointer-events-none select-none blur-sm" : ""
            }`}>
              <div className="relative w-[170px] h-[170px] flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-[#E5FFF4]" />
                <div className="absolute inset-[18px] rounded-full bg-white" />
                <img
                  src={biometricMethod === "iris" ? IrisIcon : FingerPrintIcon}
                  alt={biometricMethod === "iris" ? "Iris" : "Fingerprint"}
                  className={`relative w-16 h-16 ${
                    biometricMethod === "iris" ? "" : "opacity-60"
                  }`}
                />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#039155] text-white text-[12px] font-['Gilroy-Medium'] px-3 py-1 rounded-md">
                  Ready
                </div>
              </div>

              <div className="text-[16px] font-['Gilroy-SemiBold'] text-[#1B1717]">
                {biometricMethod === "iris"
                  ? "Look Into The Scanner"
                  : "Place Finger On Scanner"}
              </div>
              <div className="text-[12px] text-[#1B1717] font-['Gilroy-Regular'] text-center">
                {biometricMethod === "iris"
                  ? "Position Your Eyes Within The Scanner's View. Keep Them Wide Open And Hold Steady Until Capture"
                  : "Please Place Your Finger Flat On The Device Sensor And Hold It Steady Until The Capture Is Complete."}
              </div>

              {/* Start Capture Button - For Fingerprint method */}
              {biometricMethod === "thumb" && (
                <button
                  type="button"
                  className="mt-4 inline-flex items-center justify-center gap-3 bg-[#039155] hover:bg-[#027A47] text-white rounded-lg px-10 py-3 text-[14px] font-['Gilroy-Medium'] transition w-full max-w-[320px]"
                >
                  <span className="inline-flex items-center justify-center w-6 h-6">
                    <img
                      src={StartCapture}
                      alt=""
                      className="w-full h-full"
                      aria-hidden="true"
                    />
                  </span>
                  Start Capture
                </button>
              )}

              {/* Start Iris Scan Button - Only for Iris method */}
              {biometricMethod === "iris" && (
                <button
                  type="button"
                  className="mt-4 inline-flex items-center justify-center gap-3 bg-[#039155] hover:bg-[#027A47] text-white rounded-lg px-10 py-3 text-[14px] font-['Gilroy-Medium'] transition w-full max-w-[320px]"
                >
                  <span className="inline-flex items-center justify-center w-6 h-6">
                    <img
                      src={EyeIcon}
                      alt=""
                      className="w-full h-full"
                      aria-hidden="true"
                    />
                  </span>
                  Start Iris Scan
                </button>
              )}
            </div>

            {/* Coming Soon overlay - clear and on top */}
            {comingSoon && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="bg-white/95 border border-gray-200 rounded-xl px-6 py-5 shadow-sm max-w-[420px] w-full">
                  <div className="text-[18px] font-['Gilroy-SemiBold'] text-[#1B1717]">
                    Iris Scan Coming Soon
                  </div>
                  <div className="mt-2 text-[14px] text-[#1B1717] font-['Gilroy-Regular']">
                    This authentication mode will be available in a future update.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Form (Cash Withdrawal / Enquiry / Statement) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-full">
          <div className="text-[20px] font-['Gilroy-Medium'] text-[#1B1717] mb-1">
            {activeTab === "cashWithdrawal"
              ? "Cash Withdrawal"
              : activeTab === "enquiry"
              ? "Enquiry"
              : "Enquiry"}
          </div>
          <div className="text-[14px] text-[#1B1717] font-['Gilroy-Regular'] mb-6">
            {activeTab === "cashWithdrawal"
              ? "Perform Cash Withdrawal Securely Using Aadhaar Authentication And Bank Selection"
              : activeTab === "enquiry"
              ? "Check Customer Bank Account Balance Securely Using Aadhaar Authentication"
              : "Check Customer Bank Account Balance Securely Using Aadhaar Authentication"}
          </div>

          {/* Recent Used Bank */}
          <div className="mb-6">
            <div className="text-[12px] font-['Gilroy-Medium'] text-[#1B1717] mb-3">
              Recent Used Bank
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {recentBanks.map((bank) => (
                <button
                  key={bank.id}
                  type="button"
                  onClick={() => setSelectedBank(bank.id)}
                  className={`flex-shrink-0 w-[120px] p-3 rounded-xl border-2 transition ${
                    selectedBank === bank.id
                      ? "bg-[#E5FFF4] border-[#039155]"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-[10px] font-['Gilroy-Medium'] text-gray-600">
                        {bank.logo}
                      </span>
                    </div>
                    <div className="text-[10px] font-['Gilroy-Medium'] text-[#1B1717] text-center">
                      {bank.name}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Select Bank Dropdown */}
          <div className="mb-6">
            <label className="block text-[12px] font-['Gilroy-Medium'] text-[#1B1717] mb-2">
              Select Bank *
            </label>
            <div className="relative">
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-[14px] font-['Gilroy-Regular'] text-[#1B1717] bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#039155] focus:border-transparent"
                defaultValue=""
              >
                <option value="">Select</option>
                <option value="yesBank">Yes Bank</option>
                <option value="kotak">Kotak Mahindra Bank</option>
                <option value="axis">Axis Bank</option>
                <option value="hdfc">HDFC Bank</option>
                <option value="icici">ICICI Bank</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M6 9l6 6 6-6"
                    stroke="#1B1717"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Input Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-[12px] font-['Gilroy-Medium'] text-[#1B1717] mb-2">
                Aadhaar Number *
              </label>
              <input
                type="text"
                placeholder="Enter Aadhar Number"
                value={aadhaarNumber}
                onChange={(e) => setAadhaarNumber(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-[14px] font-['Gilroy-Regular'] text-[#1B1717] focus:outline-none focus:ring-2 focus:ring-[#039155] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-[12px] font-['Gilroy-Medium'] text-[#1B1717] mb-2">
                Customer Mobile Number *
              </label>
              <input
                type="text"
                placeholder="Enter Your Number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-[14px] font-['Gilroy-Regular'] text-[#1B1717] focus:outline-none focus:ring-2 focus:ring-[#039155] focus:border-transparent"
              />
            </div>
          </div>

          {/* Amount To Withdrawal - Only for Cash Withdrawal */}
          {activeTab === "cashWithdrawal" && (
            <div className="mb-6">
              <label className="block text-[12px] font-['Gilroy-Medium'] text-[#1B1717] mb-2">
                Amount To Withdrawal
              </label>
              <input
                type="text"
                value={`₹ ${selectedAmount}`}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-[14px] font-['Gilroy-Medium'] text-[#1B1717] bg-gray-50 mb-3"
              />
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedAmount("500")}
                  className={`px-6 py-2 rounded-lg border-2 text-[12px] font-['Gilroy-Medium'] transition ${
                    selectedAmount === "500"
                      ? "bg-[#039155] text-white border-[#039155]"
                      : "bg-white text-[#1B1717] border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  ₹ 500
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAmount("1000")}
                  className={`px-6 py-2 rounded-lg border-2 text-[12px] font-['Gilroy-Medium'] transition ${
                    selectedAmount === "1000"
                      ? "bg-[#039155] text-white border-[#039155]"
                      : "bg-white text-[#1B1717] border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  ₹ 1,000
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAmount("2000")}
                  className={`px-6 py-2 rounded-lg border-2 text-[12px] font-['Gilroy-Medium'] transition ${
                    selectedAmount === "2000"
                      ? "bg-[#039155] text-white border-[#039155]"
                      : "bg-white text-[#1B1717] border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  ₹ 2,000
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAmount("5000")}
                  className={`px-6 py-2 rounded-lg border-2 text-[12px] font-['Gilroy-Medium'] transition ${
                    selectedAmount === "5000"
                      ? "bg-[#039155] text-white border-[#039155]"
                      : "bg-white text-[#1B1717] border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  ₹ 5,000
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAmount("10000")}
                  className={`px-6 py-2 rounded-lg border-2 text-[12px] font-['Gilroy-Medium'] transition ${
                    selectedAmount === "10000"
                      ? "bg-[#039155] text-white border-[#039155]"
                      : "bg-white text-[#1B1717] border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  ₹ 10,000
                </button>
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            type="button"
            className="w-full bg-[#039155] hover:bg-[#027A47] text-white rounded-lg px-6 py-3 text-[14px] font-['Gilroy-Medium'] transition"
          >
            {activeTab === "cashWithdrawal"
              ? "Withdrawal"
              : activeTab === "enquiry"
              ? "Check Balance"
              : "Check Statement"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Selectservice;
