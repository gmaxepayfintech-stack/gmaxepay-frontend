import PropTypes from "prop-types";
import { getOperatorLogo } from "../utils";
import { ButtonLoader } from "../../../../../widgets/layout/loader";

const PlanConfirmationCard = ({ 
  selectedOperator, 
  mobileNumber, 
  selectedPlanForRecharge, 
  setSelectedPlanForRecharge,
  setShowPaymentModal,
  isLoadingPayment
}) => {
  return (
    <div className="   ">
      {/* Operator and Number */}
      <div className="flex bg-[#FFFFFF] mb-[24px] p-4 rounded-xl items-center gap-4">
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
            <span className="text-[#039155] text-[40px] leading-none inline-flex items-center justify-center">•</span>
            <span>{selectedOperator.circle}</span>
          </div>
        </div>
      </div>
      <div className="bg-[#FFFFFF] p-3  rounded-xl">
        {/* Plan Summary */}
        <div className=" border-gray-200 pt-4">
          <div className="text-[24px] font-['Gilroy-SemiBold'] text-[#1B1717] mb-3">
            {selectedPlanForRecharge.price}
          </div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[14px] font-['Gilroy-Regular'] text-[#1B1717] text-opacity-80">
                Validity
              </div>
              <div className="text-[14px] font-['Gilroy-Medium'] text-[#1B1717]">
                {selectedPlanForRecharge.validity}
              </div>
            </div>
            <div>
              <div className="text-[14px] font-['Gilroy-Regular'] text-[#1B1717] text-opacity-80">
                Data
              </div>
              <div className="text-[14px] font-['Gilroy-Medium'] text-[#1B1717]">
                {selectedPlanForRecharge.data}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedPlanForRecharge(null)}
              className="text-[#039155] text-[14px] underline font-['Gilroy-Medium'] hover:underline"
            >
              Change Plan
            </button>
          </div>
        </div>

        {/* Plan Details */}
        <div className="border-t border-[#1B1717] border-opacity-30 pt-4 space-y-3">
          <div className="text-[14px] font-['Gilroy-Regular'] text-[#1B1717] text-opacity-80">
            Data: {selectedPlanForRecharge.data.replace('/Day', '')}
          </div>
          <div className="text-[14px] font-['Gilroy-Regular'] text-[#1B1717] text-opacity-80">
            Validity: {selectedPlanForRecharge.validity} (Valid With Active Bundle Pack)
          </div>
          <div className="text-[14px] font-['Gilroy-Regular'] text-[#1B1717] text-opacity-80">
            Added Benefit: {selectedPlanForRecharge.validityExtra}
          </div>
          <div className="text-[14px] font-['Gilroy-Regular'] text-[#1B1717] text-opacity-80">
            Calls: {selectedPlanForRecharge.calls}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-8 border-gray-200">
          <button
            type="button"
            onClick={() => setSelectedPlanForRecharge(null)}
            className="flex-1 px-4 py-3 border border-[#1B1717] border-opacity-30 rounded-lg text-[18px] font-['Gilroy-Medium'] text-[#1B1717] hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              if (!isLoadingPayment) {
                setShowPaymentModal(true);
              }
            }}
            disabled={isLoadingPayment}
            className={`flex-1 px-4 py-3 bg-[#039155] rounded-lg text-[18px] font-['Gilroy-Medium'] text-white hover:bg-[#027a44] transition flex items-center justify-center ${
              isLoadingPayment ? "cursor-wait opacity-100" : ""
            }`}
          >
            {isLoadingPayment ? (
              <>
                <ButtonLoader color="#FFFFFF" size={20} />
                <span className="ml-2">Processing</span>
              </>
            ) : "Proceed"}
          </button>
        </div>
      </div>
    </div>
  );
};

PlanConfirmationCard.propTypes = {
  selectedOperator: PropTypes.object.isRequired,
  mobileNumber: PropTypes.string.isRequired,
  selectedPlanForRecharge: PropTypes.object.isRequired,
  setSelectedPlanForRecharge: PropTypes.func.isRequired,
  setShowPaymentModal: PropTypes.func.isRequired,
  isLoadingPayment: PropTypes.bool,
};

export default PlanConfirmationCard;

