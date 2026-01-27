import { useState } from "react";
import { HiOutlineArrowNarrowLeft } from "react-icons/hi";
import PropTypes from "prop-types";
import { ButtonLoader } from "../../../../widgets/layout/loader";

const BBPSPage2 = ({ onNext, onBack, formData, setFormData }) => {
  const [billerName, setBillerName] = useState(formData.billerName || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleProceed = () => {
    if (!billerName.trim()) return;
    setIsLoading(true);
    setFormData((prev) => ({ ...prev, billerName: billerName.trim() }));
    setTimeout(() => {
      setIsLoading(false);
      onNext({ billerName: billerName.trim() });
    }, 300);
  };

  const selectedCategoryName =
    formData.category?.name || formData.category || "Selected Category";

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
          <HiOutlineArrowNarrowLeft className="text-2xl text-[#1B1717] opacity-80" />
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
          {/* Category Info */}
          <div className="flex justify-between items-start pb-4 border-b border-gray-200">
            <div>
              <div className="text-[18px] font-['Gilroy-Medium'] text-[#1B1717]">
                {selectedCategoryName}
              </div>
              <div className="text-[14px] text-gray-500 mt-1">
                Category Selected
              </div>
            </div>
            <span className="text-[12px] bg-[#039155] text-white px-3 py-1 rounded-full font-['Gilroy-Medium']">
              Service
            </span>
          </div>

          {/* Biller Name Input */}
          <div>
            <label className="block text-[14px] font-['Gilroy-Medium'] mb-2">
              Biller Name *
            </label>
            <input
              type="text"
              value={billerName}
              onChange={(e) => {
                const val = e.target.value;
                // Keep only alphabets, numbers, spaces, and common special characters
                if (/^[A-Za-z0-9\s\-&.,()]*$/.test(val)) {
                  setBillerName(val);
                }
              }}
              placeholder="Enter Biller Name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#039155] transition"
            />
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
              disabled={!billerName.trim() || isLoading}
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

BBPSPage2.propTypes = {
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
};

export default BBPSPage2;
