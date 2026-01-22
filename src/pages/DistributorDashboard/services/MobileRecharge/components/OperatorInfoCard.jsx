import PropTypes from "prop-types";
import { getOperatorLogo } from "../utils";

const OperatorInfoCard = ({
  selectedOperator,
  mobileNumber,
  setShowOperatorModal,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-center gap-4">
        {/* Operator Logo */}
        <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
          {getOperatorLogo(selectedOperator.name) ? (
            <img
              src={getOperatorLogo(selectedOperator.name)}
              alt={selectedOperator.name}
              className="w-12 h-12"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-lg">
              {selectedOperator.name.charAt(0)}
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="text-[18px] font-['Gilroy-Medium'] text-[#1B1717]">
            {mobileNumber}
          </div>
          <div className="text-[14px] font-['Gilroy-Regular'] text-[#1B1717] text-opacity-80 mt-1 flex items-center gap-[12px]">
            <span>{selectedOperator.name}</span>
            <span className="text-[#039155] text-[40px] leading-none inline-flex items-center justify-center">
              •
            </span>
            <span>{selectedOperator.circle}</span>
            <button
              type="button"
              onClick={() => setShowOperatorModal(true)}
              className="text-[#039155] text-[14px] underline font-['Gilroy-Medium'] hover:underline"
            >
              Change
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

OperatorInfoCard.propTypes = {
  selectedOperator: PropTypes.object.isRequired,
  mobileNumber: PropTypes.string.isRequired,
  setShowOperatorModal: PropTypes.func.isRequired,
};

export default OperatorInfoCard;
