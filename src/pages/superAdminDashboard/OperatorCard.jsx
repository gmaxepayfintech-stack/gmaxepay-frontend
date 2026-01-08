import React from 'react'
import { useState } from 'react';

const OperatorIcon = ({ icon, className = "" }) => {
    if (typeof icon === "string") {
        return (
            <img
                src={icon}
                alt="icon"
                className={`object-contain ${className}`}
            />
        );
    }

    const IconComponent = icon;
    return <IconComponent className={className} />;
};

const OperatorCard = ({ operator, onEditClick }) => {
    const [ccfi, setCcfi] = useState(operator.toggles.ccfi);
    const [active, setActive] = useState(operator.toggles.active);
    const [deleted, setDeleted] = useState(operator.toggles.deleted);

    return (
        <div className="border border-[#1B1717] border-opacity-80 border-[0.5px] rounded-xl p-4 bg-white hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <OperatorIcon
                        icon={operator.icon}
                        className="w-[35px] h-[35px]"
                    />


                    <span className="font-['Gilroy-SemiBold] text-[16px] text-[#1B1717]">{operator.name}</span>
                </div>
                <span className="text-xs bg-[#008D1E] text-center text-[#FFFFFF] px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                    <span className="w-[8px] h-[8px] bg-white text-[#FFFFFF] rounded-full"></span>
                    Active
                </span>
            </div>

            {/* Fees */}
            <div className="text-sm text-gray-600 space-y-2 mb-4 border-b border-[#1B1717] -border-y-[0.5px] border-opacity-20  pb-4">
                <div className="flex justify-between">
                    <span className="font-['Gilroy-Regular'] text[12px] text-opacity-80 text-[#1B1717]">Convo Fee</span>
                    <span className="font-['Gilroy-Medium'] text[12px] text-[#1B1717]">{operator.fees.convFee}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-['Gilroy-Regular'] text[12px] text-opacity-80 text-[#1B1717]">Flat Fee</span>
                    <span className="font-['Gilroy-Medium'] text[12px] text-[#1B1717]">{operator.fees.flatFee}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-['Gilroy-Regular'] text[12px] text-opacity-80 text-[#1B1717]">Precent Fee</span>
                    <span className="font-['Gilroy-Medium'] text[12px] text-[#1B1717]">{operator.fees.percentFee}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-['Gilroy-Regular'] text[12px] text-opacity-80 text-[#1B1717]">GST Rate</span>
                    <span className="font-['Gilroy-Medium'] text[12px] text-[#1B1717]">{operator.fees.gstRate}</span>
                </div>
            </div>

            {/* Toggles */}
            <div className="space-y-[18px] mb-4">
                {[
                    { label: "CCFI", value: ccfi, setter: setCcfi },
                    { label: "Active", value: active, setter: setActive },
                    { label: "Deleted", value: deleted, setter: setDeleted },
                ].map((item) => (
                    <div key={item.label} className="flex justify-between items-center">
                        <span className="text-[12px] text-[#1B1717] font-['Gilroy-Regular'] text-opacity-80">{item.label}</span>
                        <button
                            onClick={() => item.setter(!item.value)}
                            className={`w-[39px] h-[23px] rounded-full relative transition-all duration-200 ${item.value ? "bg-[#039155]" : "bg-gray-300"
                                }`}
                        >
                            <span
                                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200 ${item.value ? "right-0.5" : "left-0.5"
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

export default OperatorCard