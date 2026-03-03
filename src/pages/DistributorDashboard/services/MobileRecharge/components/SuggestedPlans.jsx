import PropTypes from "prop-types";
import { getOperatorLogo } from "../utils";

const SuggestedPlans = ({
  displaySuggestedPlans,
  setSelectedPlanForRecharge,
}) => {
  if (displaySuggestedPlans.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="text-[18px] font-['Gilroy-Medium'] text-[#1B1717] mb-4">
        Suggest Plans
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {displaySuggestedPlans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => setSelectedPlanForRecharge(plan)}
            className="bg-white border border-gray-200 rounded-lg p-4 transition cursor-pointer hover:shadow-sm"
          >
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                {getOperatorLogo(plan.operator) ? (
                  <img
                    src={getOperatorLogo(plan.operator)}
                    alt={plan.operator}
                    className="w-8 h-8"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-[Gilroy-Semibold] text-xs">
                    {plan.operator.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="text-[18px] font-['Gilroy-SemiBold'] text-[#1B1717] mb-1">
                  {plan.price}
                </div>
                <div className="font-['Gilroy-Medium'] text-[#1B1717] flex items-center gap-1">
                  <span className="text-[12px] text-opacity-80 text-[#1B1717]">
                    {plan.data}
                  </span>
                  <span className="text-[#1B1717] text-[30px] text-center w-2">
                    •
                  </span>
                  <span className="text-[14px] text-[#1B1717]">
                    {plan.validity}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

SuggestedPlans.propTypes = {
  displaySuggestedPlans: PropTypes.array.isRequired,
  setSelectedPlanForRecharge: PropTypes.func.isRequired,
};

export default SuggestedPlans;
