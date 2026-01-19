import PropTypes from "prop-types";
import { ButtonLoader } from "../../../../../widgets/layout/loader";

const InformationForm = ({ mobileNumber, setMobileNumber, handleCancel, handleProceed, isLoadingProceed }) => {
  return (
    <>
      <div className="text-[20px] font-['Gilroy-Medium'] text-[#1B1717] mb-6">
        Information
      </div>

      <div className="space-y-4">
        {/* Mobile Number Input */}
        <div>
          <label htmlFor="mobileNumber" className="block text-[14px] font-['Gilroy-Medium'] text-[#1B1717] mb-2">
            Mobile Number *
          </label>
          <input
            id="mobileNumber"
            type="text"
            value={mobileNumber}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, ""); // Only numbers
              if (value.length <= 10) {
                setMobileNumber(value);
              }
            }}
            placeholder="Mobile Number"
            maxLength={10}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-[#1B1717]"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 h-[48px] border border-gray-300 rounded-lg bg-white text-[#1B1717] font-['Gilroy-Medium'] hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleProceed}
            disabled={mobileNumber?.length !== 10 || isLoadingProceed}
            className="flex-1 h-[48px] bg-[#039155] hover:bg-[#027A47] text-white rounded-lg font-['Gilroy-Medium'] transition disabled:opacity-80 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoadingProceed ? <ButtonLoader /> : "Proceed"}
          </button>
        </div>
      </div>
    </>
  );
};

InformationForm.propTypes = {
  mobileNumber: PropTypes.string.isRequired,
  setMobileNumber: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  handleProceed: PropTypes.func.isRequired,
  isLoadingProceed: PropTypes.bool.isRequired,
};

export default InformationForm;

