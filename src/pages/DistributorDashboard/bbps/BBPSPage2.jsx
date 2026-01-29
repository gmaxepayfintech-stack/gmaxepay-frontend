import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { getUserBBPSBillersByCategory, getUserBBPSBillerInfo } from "../../../redux/action/bbpsAction";
import { ButtonLoader } from "../../../widgets/layout/loader";
import { HiArrowLeft } from "react-icons/hi2";

const BBPSPage2 = ({ onNext, onBack, formData, setFormData }) => {
  const dispatch = useDispatch();
  const { userBillers, userBillersLoading } = useSelector((state) => state.bbps);
  
  const [selectedBiller, setSelectedBiller] = useState(formData.biller || null);
  const [billerSearchQuery, setBillerSearchQuery] = useState("");
  const [isBillerDropdownOpen, setIsBillerDropdownOpen] = useState(false);
  const billerDropdownRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  const selectedCategoryName =
    formData.category?.name || formData.category || "Selected Category";

  // Fetch billers when category is selected
  useEffect(() => {
    if (formData.category?.name) {
      dispatch(getUserBBPSBillersByCategory(formData.category.name, billerSearchQuery, 1, 6));
    }
  }, [dispatch, formData.category, billerSearchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (billerDropdownRef.current && !billerDropdownRef.current.contains(event.target)) {
        setIsBillerDropdownOpen(false);
      }
    };

    if (isBillerDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isBillerDropdownOpen]);

  const handleBillerSelect = async (biller) => {
    setSelectedBiller(biller);
    setIsBillerDropdownOpen(false);
    // Fetch biller info
    if (biller.billerId) {
      await dispatch(getUserBBPSBillerInfo(biller.billerId));
    }
  };

  const handleProceed = () => {
    if (!selectedBiller) return;
    setIsLoading(true);
    setFormData((prev) => ({ ...prev, biller: selectedBiller, billerName: selectedBiller.name }));
    setTimeout(() => {
      setIsLoading(false);
      onNext({ biller: selectedBiller, billerName: selectedBiller.name });
    }, 300);
  };

  return (
    <div className="w-full py-4 px-1">
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
            <div className="relative" ref={billerDropdownRef}>
              <input
                type="text"
                value={billerSearchQuery}
                onChange={(e) => {
                  setBillerSearchQuery(e.target.value);
                  setIsBillerDropdownOpen(true);
                }}
                onFocus={() => setIsBillerDropdownOpen(true)}
                placeholder="Search or select biller"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#039155] transition"
              />
              {isBillerDropdownOpen && userBillers.length > 0 && (
                <div className="absolute w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg z-10 max-h-60 overflow-y-auto">
                  {userBillersLoading ? (
                    <div className="px-4 py-2 text-center">
                      <ButtonLoader color="#039155" size={16} thickness={2} />
                    </div>
                  ) : (
                    userBillers
                      .filter((biller) =>
                        biller.name?.toLowerCase().includes(billerSearchQuery.toLowerCase())
                      )
                      .map((biller) => (
                        <div
                          key={biller.id}
                          onClick={() => handleBillerSelect(biller)}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-[14px] font-['Gilroy-Medium'] text-[#1B1717]"
                        >
                          {biller.name} ({biller.billerId})
                        </div>
                      ))
                  )}
                </div>
              )}
            </div>
            {selectedBiller && (
              <p className="text-xs text-gray-500 mt-1">
                Selected: {selectedBiller.name}
              </p>
            )}
            {!formData.category && (
              <p className="text-xs text-red-500 mt-1">
                Please select a category first
              </p>
            )}
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
              disabled={!selectedBiller || isLoading || !formData.category}
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
