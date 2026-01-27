import React, { useState, useRef } from "react";

const WalletLoad = () => {
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [payDate, setPayDate] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [remarks, setRemarks] = useState("");
  const [selectedBank, setSelectedBank] = useState("kotak1");
  const [paySlipFile, setPaySlipFile] = useState(null);
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileError, setFileError] = useState("");

  const banks = [
    {
      id: "kotak1",
      name: "Kotak Mahindra Bank",
      logo: "/img/kotak-logo.png",
      accountNumber: "0261124422233",
      ifscCode: "KKBK002254",
    },
    {
      id: "yes",
      name: "Yes Bank",
      logo: "/img/yes-bank-logo.png",
      accountNumber: "0261124422233",
      ifscCode: "KKBK002254",
    },
    {
      id: "axis",
      name: "Axis Bank",
      logo: "/img/axis-bank-logo.png",
      accountNumber: "0261124422233",
      ifscCode: "KKBK002254",
    },
    {
      id: "sbi",
      name: "State Bank Of India",
      logo: "/img/sbi-logo.png",
      accountNumber: "0261124422233",
      ifscCode: "KKBK002254",
    },
    {
      id: "kotak2",
      name: "Kotak Mahindra Bank",
      logo: "/img/kotak-logo.png",
      accountNumber: "0261124422233",
      ifscCode: "KKBK002254",
    },
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB

    if (file.size > maxSize) {
      setFileError("File size must be below 5 MB");
      setPaySlipFile(null);
      setPreviewUrl(null);
      return;
    }

    setFileError("");
    setPaySlipFile(file);

    // Preview for images
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5 MB");
        return;
      }
      setPaySlipFile(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Wallet Load Submission:", {
      amount,
      paymentMode,
      payDate,
      referenceNumber,
      remarks,
      selectedBank,
      paySlipFile,
    });
    // Add your submission logic here
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6 lg:gap-8">
          {/* Left Container: Wallet Load */}
          <div className="bg-white rounded-3xl shadow-sm p-[18px] sm:p-[18px] lg:p-[18px]">
            <h2 className="text-[24px] font-['Gilroy-Medium'] text-[#1B1717] mb-4">
              Wallet Load
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* GRID START */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Amount */}
                <div>
                  <label
                    htmlFor="amount"
                    className="block text-[14px] leading-[1.2] font-['Gilroy-Medium'] mb-[8px] text-[#1B1717]"
                  >
                    Amount<span className=" text-red-400 ml-[2px]">*</span>
                  </label>

                  <input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter Amount"
                    required
                    min="0"
                    inputMode="numeric"
                    className="w-full px-4 h-[43px]  border-[#1B1717] border-[0.5px] focus:outline-none border-opacity-50 rounded-lg"
                  />
                </div>

                {/* Payment Mode */}
                <div>
                  <label
                    htmlFor="paymentMode"
                    className="block mb-[8px] text-[14px] font-['Gilroy-Medium'] text-[#1B1717]"
                  >
                    Payment Mode{" "}
                    <span className="text-red-400 text-[12px]">*</span>
                  </label>
                  <select
                    id="paymentMode"
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    required
                    className="w-full px-4 h-[43px] border border-[#1B1717] border-opacity-50 focus:outline-none rounded-lg"
                  >
                    <option value="">Select</option>
                    <option value="UPI">UPI</option>
                    <option value="NEFT">NEFT</option>
                    <option value="RTGS">RTGS</option>
                    <option value="IMPS">IMPS</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                  </select>
                </div>

                {/* Pay Date */}
                <div>
                  <label
                    htmlFor="payDate"
                    className="block text-[14px] mb-[8px] font-['Gilroy-Medium'] text-[#1B1717]"
                  >
                    Pay Date <span className="text-red-400 text-[12px]">*</span>
                  </label>
                  <input
                    id="payDate"
                    type="date"
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                    required
                    className="w-full px-4 h-[43px] border border-[#1B1717] focus:outline-none border-opacity-50 rounded-lg"
                  />
                </div>

                {/* Reference / UTR */}
                <div>
                  <label
                    htmlFor="referenceNumber"
                    className="block text-[14px] mb-[8px] font-['Gilroy-Medium'] text-[#1B1717]"
                  >
                    Reference / UTR Number
                  </label>
                  <input
                    id="referenceNumber"
                    type="text"
                    maxLength={25}
                    minLength={10}
                    pattern="[A-Za-z0-9]+"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="Enter Reference Number"
                    className="w-full px-4 h-[43px] focus:outline-none border border-[#1B1717] border-opacity-50 rounded-lg"
                  />
                </div>
              </div>

              {/* Pay Slip */}
              <div>
                <label className="block text-[14px]   font-['Gilroy-Medium'] text-[#1B1717] mb-2">
                  Pay Slip
                </label>
                <div
                  onDrop={handleFileDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className="border-2 border-dashed border-[#1B1717] h-[159px] border-opacity-50 rounded-lg p-6 text-center cursor-pointer transition-colors flex items-center justify-center"
                >
                  <input
                    id="paySlip"
                    ref={fileInputRef}
                    type="file"
                    accept=".svg,.png,.jpg,.jpeg,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {/* If file selected show preview */}
                  {paySlipFile ? (
                    <div className="flex flex-col items-center gap-2">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Pay Slip Preview"
                          className="max-h-[120px] object-contain"
                        />
                      ) : (
                        <p className="text-sm text-[#1B1717]">
                          📄 {paySlipFile.name}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <svg
                        className="w-12 h-12 text-[#1B1717] text-opacity-50"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="text-[14px] font-['Gilroy-Medium'] text-[#1B1717]">
                        Click To Upload Or Drag And Drop
                      </p>
                      <p className="text-[12px] font-['Gilroy-Medium'] text-[#1B1717] text-opacity-60">
                        SVG, PNG, JPG Or PDF (Max 5 MB)
                      </p>
                    </div>
                  )}
                </div>
                {paySlipFile && (
                  <p className="text-[12px] font-['Gilroy-Medium'] text-[#1B1717] mt-2">
                    {paySlipFile.name}
                  </p>
                )}
                {/* Error message */}
                {fileError && (
                  <p className="text-red-500 text-sm mt-2">{fileError}</p>
                )}
              </div>

              {/* Remarks */}
              <div>
                <label
                  htmlFor="remarks"
                  className="block   text-[14px] font-['Gilroy-Medium'] text-[#1B1717] mb-2"
                >
                  Remarks
                </label>
                <textarea
                  id="remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Write Remarks"
                  rows={4}
                  className="w-full px-4 h-[142px] py-3 border border-[#1B1717] border-opacity-50 rounded-lg focus:outline-none text-[14px] font-['Gilroy-Medium'] resize-none"
                />
              </div>
            </form>
          </div>

          {/* Right Container: Admin Accounts */}
          <div className="bg-white rounded-3xl shadow-sm p-[18px] sm:p-[18px] lg:p-[18px] flex flex-col">
            <div className="mb-4">
              <h2 className="text-[24px] font-['Gilroy-Medium'] text-[#1B1717] mb-2">
                Admin Accounts
              </h2>
              <p className="text-[14px] font-['Gilroy-Medium'] text-[#1B1717] text-opacity-80">
                Select A Bank To View Details To Transfer
              </p>
            </div>

            <div className="space-y-[16px] flex-1 overflow-y-auto pr-2 mb-6">
              {banks.map((bank) => (
                <div
                  key={bank.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedBank(bank.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedBank(bank.id);
                    }
                  }}
                  className={`p-3 border-[0.5px] rounded-2xl cursor-pointer transition-all ${
                    selectedBank === bank.id
                      ? "border-[#039155] bg-green-50"
                      : "border-[#1B1717] border-opacity-80 bg-white"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Bank Logo */}
                    <div className="w-10 h-10 flex items-center justify-center shrink-0">
                      <img
                        src={bank.logo}
                        alt={bank.name}
                        className="w-8 h-8 object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>

                    {/* Bank Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-[2px]">
                        <p className="text-[13px] font-medium text-gray-900 leading-tight">
                          Bank Name: {bank.name}
                        </p>

                        {selectedBank === bank.id && (
                          <div className="w-[20px] h-[20px] rounded-full bg-[#039155] flex items-center justify-center shrink-0">
                            <div className="w-[6px] h-[6px] rounded-full bg-white" />
                          </div>
                        )}
                      </div>

                      <p className="text-[11px] font-['Gilroy-Medium'] text-gray-600 leading-tight">
                        Account Number:{" "}
                        <span className="text-[#1B1717]">
                          {bank.accountNumber}
                        </span>
                      </p>

                      <p className="text-[11px] font-['Gilroy-Medium'] text-gray-600 leading-tight">
                        IFSC Code:{" "}
                        <span className="text-[#1B1717]">{bank.ifscCode}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <div className="mt-auto pt-4 ">
              <button
                type="submit"
                onClick={handleSubmit}
                className="w-full px-6 py-3 text-[18px] rounded-lg bg-[#039155] text-[#FFFFFF] font-['Gilroy-SemiBold'] hover:bg-[#027a47] transition shadow-sm"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletLoad;
