import { useState } from "react";
import { HiOutlineArrowNarrowLeft } from "react-icons/hi";
import PropTypes from "prop-types";

// Sample recent recharge data
const recentRecharges = [
    {
        id: 1,
        operator: "Jio",
        operatorType: "Jio Prepaid",
        mobileNumber: "1140418824",
        lastRecharge: "Last Recharge 12h On 26-Dec-2025",
        logo: "/img/jio-logo.svg" // You may need to add operator logos
    },
    {
        id: 2,
        operator: "Airtel",
        operatorType: "Airtel Prepaid",
        mobileNumber: "930418824",
        lastRecharge: "Last Recharge 1d On 25-Dec-2025",
        logo: "/img/airtel-logo.svg"
    },
    {
        id: 3,
        operator: "BSNL",
        operatorType: "BSNL Prepaid",
        mobileNumber: "740418824",
        lastRecharge: "Last Recharge 2d On 24-Dec-2025",
        logo: "/img/bsnl-logo.svg"
    },
    {
        id: 4,
        operator: "VI",
        operatorType: "VI Prepaid",
        mobileNumber: "840418824",
        lastRecharge: "Last Recharge 3d On 23-Dec-2025",
        logo: "/img/vi-logo.svg"
    },
    {
        id: 5,
        operator: "Jio",
        operatorType: "Jio Prepaid",
        mobileNumber: "140418824",
        lastRecharge: "Last Recharge 5d On 21-Dec-2025",
        logo: "/img/jio-logo.svg"
    }
];

const RecentRechargeCard = ({ recharge }) => {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 hover:shadow-sm transition cursor-pointer">
            <div className="flex items-start gap-3">
                {/* Operator Logo */}
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    {recharge.logo ? (
                        <img src={recharge.logo} alt={recharge.operator} className="w-10 h-10 rounded-full" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                            {recharge.operator.charAt(0)}
                        </div>
                    )}
                </div>
                
                {/* Operator Details */}
                <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-['Gilroy-Medium'] text-[#1B1717]">
                        {recharge.operatorType}
                    </div>
                    <div className="text-[14px] font-['Gilroy-Medium'] text-[#1B1717] mt-1">
                        {recharge.mobileNumber}
                    </div>
                    <div className="text-[12px] font-['Gilroy-Regular'] text-gray-500 mt-1">
                        {recharge.lastRecharge}
                    </div>
                </div>
            </div>
        </div>
    );
};

RecentRechargeCard.propTypes = {
    recharge: PropTypes.object.isRequired,
};

const MobileRecharge = ({ onBack }) => {
    const [mobileNumber, setMobileNumber] = useState("");

    const handleProceed = () => {
        if (!mobileNumber || mobileNumber.length !== 10) {
            return;
        }
        // Handle proceed logic - navigate to next step or process recharge
        console.log("Proceeding with mobile number:", mobileNumber);
    };

    const handleCancel = () => {
        setMobileNumber("");
    };

    const handleRecentRechargeClick = (recharge) => {
        setMobileNumber(recharge.mobileNumber);
    };

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex items-start gap-3 mb-6">
                {onBack && (
                    <button
                        type="button"
                        aria-label="Back"
                        onClick={onBack}
                        className="flex items-center justify-center w-10 h-10 border border-gray-400 rounded-full mr-2 bg-white hover:bg-gray-50 transition"
                    >
                        <HiOutlineArrowNarrowLeft className="text-2xl text-[#1B1717] opacity-80" />
                    </button>
                )}
                <div className="flex-1">
                    <div className="text-[24px] font-['Gilroy-Medium'] text-[#1B1717]">
                        Mobile Recharge
                    </div>
                    <div className="mt-[10px] text-[16px] text-[#000000] font-['Gilroy-Regular']">
                        Making Connections Easier For Everyone
                    </div>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">
                {/* Left Side - Information */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 lg:flex-[1.6] w-full lg:w-auto self-start">
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
                                disabled={mobileNumber?.length !== 10}
                                className="flex-1 h-[48px] bg-[#039155] hover:bg-[#027A47] text-white rounded-lg font-['Gilroy-Medium'] transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Proceed
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Side - Recent Recharge */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 lg:flex-[1]">
                    <div className="text-[20px] font-['Gilroy-Medium'] text-[#1B1717] mb-6">
                        Recent Recharge
                    </div>

                    <div className="max-h-[600px] overflow-y-auto">
                        {recentRecharges.map((recharge) => (
                            <button
                                key={recharge.id}
                                type="button"
                                onClick={() => handleRecentRechargeClick(recharge)}
                                className="w-full text-left"
                            >
                                <RecentRechargeCard recharge={recharge} />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

MobileRecharge.propTypes = {
    onBack: PropTypes.func,
};

export default MobileRecharge;


