import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { ButtonLoader } from "../../../widgets/layout/loader";
import { HiArrowLeft } from "react-icons/hi2";

const BBPSPage4 = ({ onNext, onBack, formData, setFormData }) => {
  const [billNumber, setBillNumber] = useState(
    formData.billDetails?.billDetails?.billNumber || formData.billNumber || "",
  );
  const [amount, setAmount] = useState(formData.billDetails?.billDetails?.billAmount || formData.amount || "");
  const [isLoading, setIsLoading] = useState(false);

  // Update bill number and amount when billDetails change
  useEffect(() => {
    if (formData.billDetails?.billDetails) {
      setBillNumber(formData.billDetails.billDetails.billNumber || "");
      setAmount(formData.billDetails.billDetails.billAmount || "");
    }
  }, [formData.billDetails]);

  const handleProceed = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setIsLoading(true);
    setFormData((prev) => ({
      ...prev,
      billNumber: billNumber,
      amount: amount,
    }));
    setTimeout(() => {
      setIsLoading(false);
      onNext({ billNumber: billNumber, amount: amount });
    }, 300);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <button
          type="button"
          aria-label="Back"
          onClick={onBack}
          className="flex items-center justify-center w-10 h-10 border border-gray-300 rounded-full bg-white hover:bg-gray-50 transition"
        >
          <HiArrowLeft className="text-2xl text-[#1B1717] opacity-80" />
        </button>
        <div className="flex-1">
          <div className="text-[24px] font-['Gilroy-Medium'] text-[#1B1717]">
            Bharat Connect Service
          </div>
          <div className="text-[16px] font-['Gilroy-Regular'] text-[#1B1717] text-opacity-80">
            Making Connections Easier for Everyone
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="space-y-6">
          {/* Bill Number */}
          <div>
            <label className="block text-[14px] font-['Gilroy-Medium'] mb-2">
              Bill Number
            </label>
            <input
              type="text"
              value={billNumber}
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-[#1B1717] text-opacity-80 bg-gray-50"
            />
            <p className="text-[12px] text-gray-500 mt-1">
              Bill Number Is Automatically Filled And Cannot Be Edited
            </p>
          </div>

          {/* Amount To Pay */}
          <div>
            <label className="block text-[14px] font-['Gilroy-Medium'] mb-2">
              Amount To Pay *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[20px] font-['Gilroy-Medium'] text-[#1B1717]">
                ₹
              </span>
                    <input
                      type="number"
                      placeholder="Enter Amount"
                      value={amount}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || (!isNaN(val) && parseFloat(val) >= 0)) {
                          setAmount(val);
                        }
                      }}
                      disabled={formData.billerInfo?.billerPaymentExactness === "Exact"}
                      min="0"
                      step="0.01"
                      className="w-full pl-9 px-4 py-4 border border-dashed border-[#1B1717] border-opacity-30 rounded-lg text-[20px] font-['Gilroy-Medium'] focus:outline-none focus:border-[#039155] transition disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={onBack}
              className="flex-1 h-[48px] border border-gray-300 rounded-lg font-['Gilroy-Medium'] hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleProceed}
              disabled={!amount || parseFloat(amount) <= 0 || isLoading}
              className="flex-1 h-[48px] bg-[#039155] hover:bg-[#027a46] disabled:bg-[#039155]/50 disabled:cursor-not-allowed text-white rounded-lg font-['Gilroy-Medium'] flex items-center justify-center gap-2 transition"
            >
              {isLoading ? (
                <>
                  <ButtonLoader color="#FFFFFF" size={20} thickness={3} />
                  <span>Processing...</span>
                </>
              ) : (
                "Proceed"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

BBPSPage4.propTypes = {
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
};

export default BBPSPage4;
