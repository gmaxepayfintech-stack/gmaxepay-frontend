import { useState } from "react";
import { HiOutlineArrowNarrowLeft } from "react-icons/hi";
import { Download } from "lucide-react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

const BBPSPage5 = ({ onBack, formData, setFormData }) => {
  const navigate = useNavigate();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handlePayNow = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmPayment = () => {
    setShowConfirmModal(false);
    // Navigate to success or handle payment
    // For now, we'll show success state
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
        <div className="space-y-8">
          {/* BILL DETAILS CARD */}
          <div className="bg-white border border-gray-200 rounded-[16px] p-6 shadow-sm space-y-4">
            <p className="text-[20px] font-['Gilroy-SemiBold'] text-[#1B1717] mb-3">
              Bill Details
            </p>

            <div className="flex justify-between text-[14px] font-['Gilroy-Medium'] text-[#1B1717]">
              <span>Bill Number : {formData.billNumber || "1233210"}</span>
            </div>

            <div className="grid grid-cols-3 gap-y-8">
              <div>
                <p className="font-['Gilroy-Medium'] text-[#1B1717]">
                  Customer Name
                </p>
                <p className="font-['Gilroy-SemiBold'] text-[16px] text-[#1B1717] text-opacity-80">
                  {formData.mobileNumber || "Shrinivas"}
                </p>
              </div>

              <div>
                <p className="font-['Gilroy-Medium'] text-[#1B1717]">
                  Service Provider
                </p>
                <p className="font-['Gilroy-SemiBold'] text-[16px] text-[#1B1717] text-opacity-80">
                  {selectedCategoryName}
                </p>
              </div>

              <div>
                <p className="font-['Gilroy-Medium'] text-[#1B1717]">
                  Bill Period
                </p>
                <p className="font-['Gilroy-SemiBold'] text-[16px] text-[#1B1717] text-opacity-80">
                  Monthly
                </p>
              </div>

              <div>
                <p className="font-['Gilroy-Medium'] text-[#1B1717]">Due Date</p>
                <p className="font-['Gilroy-SemiBold'] text-[16px] text-[#1B1717] text-opacity-80">
                  2026-01-18
                </p>
              </div>

              <div>
                <p className="font-['Gilroy-Medium'] text-[#1B1717]">
                  Amount Due
                </p>
                <p className="font-['Gilroy-SemiBold'] text-[16px] text-[#1B1717] text-opacity-80">
                  ₹{formData.amount || "0"}
                </p>
              </div>
            </div>
          </div>

          {/* PAYMENT CARD */}
          <div className="bg-white border border-gray-200 rounded-[16px] p-6 shadow-sm space-y-6">
            <p className="text-[20px] font-['Gilroy-SemiBold'] text-[#1B1717] mb-3">
              Payment
            </p>

            <div className="flex items-center gap-2 text-[20px] font-['Gilroy-Medium'] text-[#1B1717]">
              <span className="w-1 p-1 h-1 bg-[#FFFFFF] border border-[#039155] border-[5px] rounded-full"></span>
              Main Wallet
            </div>

            <div className="flex gap-4">
              <button
                onClick={onBack}
                className="flex-1 h-[48px] border border-gray-300 rounded-lg font-['Gilroy-Medium'] hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={handlePayNow}
                className="flex-1 h-[48px] bg-[#039155] hover:bg-[#027a46] text-white rounded-lg font-['Gilroy-Medium']"
              >
                Pay Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Payment Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl w-[90%] max-w-[520px] p-8 relative">
            {/* Header */}
            <h2 className="text-[24px] font-['Gilroy-Medium'] text-center">
              Confirm Payment Method
            </h2>
            <p className="text-center text-[16px] font-['Gilroy-Regular'] text-[#1B1717] text-opacity-80 mt-1">
              Review Your Payment Details
            </p>

            {/* Title */}
            <p className="text-center text-[18px] text-[#1B1717] font-['Gilroy-Medium'] mt-6">
              Confirm {selectedCategoryName} Bill Payment
            </p>

            {/* Amount */}
            <div className="border border-dashed border-gray-300 rounded-lg py-6 mt-4 text-center">
              <span className="text-[28px] font-['Gilroy-SemiBold']">
                ₹ {formData.amount || "0"}
              </span>
            </div>

            {/* Details */}
            <div className="mt-6 space-y-3 text-[14px]">
              <div className="flex justify-between">
                <span className="text-gray-500">Customer Name</span>
                <span className="font-['Gilroy-Medium']">
                  {formData.mobileNumber || "Srinivas"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Payment Date</span>
                <span className="font-['Gilroy-Medium']">
                  {new Date().toLocaleDateString("en-GB")}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Bill Number</span>
                <span className="font-['Gilroy-Medium']">
                  {formData.billNumber || "1232021"}
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 h-[48px] border border-gray-300 rounded-lg font-['Gilroy-Medium']"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmPayment}
                className="flex-1 h-[48px] bg-[#039155] hover:bg-[#027a46] text-white rounded-lg font-['Gilroy-Medium']"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

BBPSPage5.propTypes = {
  onBack: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
};

export default BBPSPage5;
