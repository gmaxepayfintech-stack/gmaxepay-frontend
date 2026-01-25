import React from "react";
import { useState, useEffect } from "react";

const OperatorIcon = ({ icon, className = "" }) => {
  if (typeof icon === "string") {
    return (
      <img src={icon} alt="icon" className={`object-contain ${className}`} />
    );
  }

  const IconComponent = icon;
  return <IconComponent className={className} />;
};

const OperatorCard = ({ operator, onEditClick, onToggleChange }) => {
  const [ccfi, setCcfi] = useState(operator.toggles.ccfi);
  const [active, setActive] = useState(operator.toggles.active);
  const [deleted, setDeleted] = useState(operator.toggles.deleted);

  // Update local state when operator prop changes
  useEffect(() => {
    setCcfi(operator.toggles.ccfi);
    setActive(operator.toggles.active);
    setDeleted(operator.toggles.deleted);
  }, [operator]);

  return (
    <div className=" border-[#1B1717] border-opacity-30 border-[0.5px] rounded-xl p-4 bg-white hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <OperatorIcon icon={operator.icon} className="w-[35px] h-[35px]" />

          <span className="font-['Gilroy-SemiBold] text-[16px] text-[#1B1717]">
            {operator.name}
          </span>
        </div>
        <span className={`text-xs text-center px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${
          active 
            ? "bg-[#008D1E] text-[#FFFFFF]" 
            : "bg-red-500 text-[#FFFFFF]"
        }`}>
          <span className={`w-[8px] h-[8px] rounded-full ${
            active ? "bg-white" : "bg-white"
          }`}></span>
          {active ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Fees */}
      <div className="text-sm text-gray-600 space-y-2 mb-4 border-b border-[#1B1717] -border-y-[0.5px] border-opacity-20  pb-4">
        <div className="flex justify-between">
          <span className="font-['Gilroy-Regular'] text[12px] text-opacity-80 text-[#1B1717]">
            Convo Fee
          </span>
          <span className="font-['Gilroy-Medium'] text[12px] text-[#1B1717]">
            {operator.fees.convFee}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-['Gilroy-Regular'] text[12px] text-opacity-80 text-[#1B1717]">
            Flat Fee
          </span>
          <span className="font-['Gilroy-Medium'] text[12px] text-[#1B1717]">
            {operator.fees.flatFee}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-['Gilroy-Regular'] text[12px] text-opacity-80 text-[#1B1717]">
            Precent Fee
          </span>
          <span className="font-['Gilroy-Medium'] text[12px] text-[#1B1717]">
            {operator.fees.percentFee}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-['Gilroy-Regular'] text[12px] text-opacity-80 text-[#1B1717]">
            GST Rate
          </span>
          <span className="font-['Gilroy-Medium'] text[12px] text-[#1B1717]">
            {operator.fees.gstRate}
          </span>
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-[18px] mb-4">
        {[
          { 
            label: "CCFI", 
            value: ccfi, 
            setter: setCcfi,
            field: "ccfi"
          },
          { 
            label: "Active", 
            value: active, 
            setter: setActive,
            field: "active"
          },
          { 
            label: "Deleted", 
            value: deleted, 
            setter: setDeleted,
            field: "deleted"
          },
        ].map((item) => (
          <div key={item.label} className="flex justify-between items-center">
            <span className="text-[12px] text-[#1B1717] font-['Gilroy-Regular'] text-opacity-80">
              {item.label}
            </span>
            <button
              onClick={() => {
                const newValue = !item.value;
                item.setter(newValue);
                // Call the toggle change handler if provided
                if (onToggleChange) {
                  onToggleChange(operator, item.field, newValue);
                }
              }}
              className={`w-[39px] h-[23px] rounded-full relative transition-all duration-200 ${
                item.value ? "bg-[#039155]" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200 ${
                  item.value ? "right-0.5" : "left-0.5"
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      {/* Action */}
      <button
        onClick={() => onEditClick && onEditClick(operator)}
        className="w-full bg-[#039155] hover:bg-[#027a41] text-[#FFFFFF] py-2.5 rounded-lg text-[18px] font-['Gilroy-SemiBold] transition-colors"
      >
        Edit Operator
      </button>
    </div>
  );
};

export default OperatorCard;
