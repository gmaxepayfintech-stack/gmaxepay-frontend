import { useState } from "react";
import { HiOutlineArrowNarrowLeft } from "react-icons/hi";
import { Search, ChevronRight } from "lucide-react";
import PropTypes from "prop-types";

// Sample recent recharge data
const recentRecharges = [
  {
    id: 1,
    operator: "Jio",
    operatorType: "Jio Prepaid",
    mobileNumber: "9740418524",
    lastRecharge: "Last Recharge ₹26 On 26 Dec 2025",
    logo: "/img/jio-logo.svg"
  },
  {
    id: 2,
    operator: "Airtel",
    operatorType: "Airtel Prepaid",
    mobileNumber: "9740418524",
    lastRecharge: "Last Recharge ₹26 On 26 Dec 2025",
    logo: "/img/airtel-logo.svg"
  },
  {
    id: 3,
    operator: "BSNL",
    operatorType: "BSNL Prepaid",
    mobileNumber: "9740418524",
    lastRecharge: "Last Recharge ₹26 On 26 Dec 2025",
    logo: "/img/bsnl-logo.svg"
  },
  {
    id: 4,
    operator: "VI",
    operatorType: "VI Prepaid",
    mobileNumber: "9740418524",
    lastRecharge: "Last Recharge ₹26 On 26 Dec 2025",
    logo: "/img/vi-logo.svg"
  },
  {
    id: 5,
    operator: "Airtel",
    operatorType: "Airtel Prepaid",
    mobileNumber: "9740418524",
    lastRecharge: "Last Recharge ₹26 On 26 Dec 2025",
    logo: "/img/jio-logo.svg" // Note: Image shows Jio logo but Airtel text
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

// Sample plan data
const suggestedPlans = [
  {
    id: 1,
    price: "₹22",
    operator: "Airtel",
    lastRecharge: "Last Recharge On 08 Jan 26",
    data: "1.0 GB/Pack",
    validity: "1 Day"
  },
  {
    id: 2,
    price: "₹22",
    operator: "Airtel",
    lastRecharge: "Last Recharge On 08 Jan 26",
    data: "1.0 GB/Pack",
    validity: "1 Day"
  }
];

const detailedPlans = [
  {
    id: 1,
    price: "₹22",
    validity: "28 Days",
    data: "1.0 GB/Day",
    calls: "Unlimited",
    validityExtra: "Unlimited 5G + 2GB/Day"
  },
  {
    id: 2,
    price: "₹22",
    validity: "28 Days",
    data: "1.0 GB/Day",
    calls: "Unlimited",
    validityExtra: "Unlimited 5G + 2GB/Day"
  }
];

const filterButtons = ["28 Days Validity", "1 GB Data", "2 GB Data", "Unlimited Data 5G"];
const categoryTabs = ["Recommended Packs", "Popular", "Top Data Packs", "Maxx Data", "Monthly Packs", "Cricket"];

const MobileRecharge = ({ onBack }) => {
  const [mobileNumber, setMobileNumber] = useState("");
  const [step, setStep] = useState("input"); // "input" or "plans"
  const [selectedOperator, setSelectedOperator] = useState({ name: "Airtel", circle: "Karnataka" });
  const [activeFilter, setActiveFilter] = useState("28 Days Validity");
  const [activeCategory, setActiveCategory] = useState("Recommended Packs");
  const [searchQuery, setSearchQuery] = useState("");

  const handleProceed = () => {
    if (!mobileNumber || mobileNumber.length !== 10) {
      return;
    }
    // Move to plan selection step
    setStep("plans");
  };

  const handleCancel = () => {
    if (step === "plans") {
      setStep("input");
    } else {
      setMobileNumber("");
    }
  };

  const handleRecentRechargeClick = (recharge) => {
    setMobileNumber(recharge.mobileNumber);
    // Auto-detect operator from recharge data
    setSelectedOperator({ name: recharge.operator, circle: "Karnataka" });
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
        <div className="flex-1 mt-[-10px]">
          <div className="text-[24px] font-['Gilroy-Medium'] text-[#1B1717]">
            {step === "plans" ? "Select Mobile Recharge" : "Mobile Recharge"}
          </div>
          <div className="mt-[10px] text-[16px] text-[#000000] font-['Gilroy-Regular']">
            Making Connections Easier For Everyone
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Side - Information or Plans */}
        <div className={`${step === "input" ? "bg-white rounded-xl border border-gray-200 p-6" : ""} lg:flex-[1.6] w-full lg:w-auto self-start`}>
          {step === "input" ? (
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
                    disabled={mobileNumber?.length !== 10}
                    className="flex-1 h-[48px] bg-[#039155] hover:bg-[#027A47] text-white rounded-lg font-['Gilroy-Medium'] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Proceed
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              {/* Mobile Number and Operator Info - Separate Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-4">
                  {/* Operator Logo */}
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-lg">
                      {selectedOperator.name.charAt(0)}
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="text-[18px] font-['Gilroy-Medium'] text-[#1B1717]">
                      {mobileNumber}
                    </div>
                    <div className="text-[14px] font-['Gilroy-Regular'] text-[#1B1717] text-opacity-80 mt-1 flex items-center gap-[12px]">
                      <span>{selectedOperator.name}</span>
                      <span className="text-[#039155] text-[40px] leading-none inline-flex items-center justify-center">•</span>
                      <span>{selectedOperator.circle}</span>
                      <button
                        type="button"
                        onClick={() => setStep("input")}
                        className="text-[#039155] text-[14px] underline font-['Gilroy-Medium'] hover:underline"
                      >
                        Change
                      </button>
                    </div>
                  </div>


                </div>
              </div>

              {/* Suggested Plans - Separate Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="text-[18px] font-['Gilroy-Medium'] text-[#1B1717] mb-4">
                  Suggest Plans
                </div>
                <div className="flex items-stretch gap-4">
                  {suggestedPlans.map((plan, index) => (
                    <div key={plan.id} className="contents">
                      <div className="flex-1 p-4 transition cursor-pointer rounded-lg">
                        <div className="flex items-start gap-2">
                          <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                            {plan.operator.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <div className="text-[18px] font-['Gilroy-SemiBold'] text-[#1B1717] mb-1">
                              {plan.price}
                            </div>
                            <div className="text-[18px] font-['Gilroy-Regular'] text-[#1B1717] text-opacity-80 mb-1">
                              {plan.lastRecharge}
                            </div>
                            <div className="text-[12px] font-['Gilroy-Medium'] text-[#1B1717] flex items-center gap-1">
                              <span>{plan.data}</span>
                              <span className="text-[#1B1717] p-0 text-center w-5 h-5 inline-flex items-center justify-center">•</span>
                              <span>{plan.validity}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {index < suggestedPlans.length - 1 && (
                        <div className="w-px bg-gray-300"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Search, Filters, Categories and Plans - Single Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search For A Plan, Eg 249 Or 28 Days"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-[#1B1717]"
                  />
                </div>

                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-2">
                  {filterButtons.map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setActiveFilter(filter)}
                      className={`px-4 py-2 rounded-lg text-[14px] font-['Gilroy-Medium'] transition ${activeFilter === filter
                        ? "bg-[#039155] text-white"
                        : "bg-gray-100 text-[#1B1717] hover:bg-gray-200"
                        }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                {/* Category Tabs */}
                <div className="flex gap-4 overflow-x-auto pb-2 border-b border-gray-200">
                  {categoryTabs.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setActiveCategory(category)}
                      className={`text-[14px] font-['Gilroy-Medium'] whitespace-nowrap pb-2 transition relative ${activeCategory === category
                        ? "text-[#039155]"
                        : "text-gray-600 hover:text-[#1B1717]"
                        }`}
                    >
                      {category}
                      {activeCategory === category && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#039155]" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Detailed Plan Cards */}
                <div className="space-y-4">
                  {detailedPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-sm transition cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="text-[20px] font-['Gilroy-SemiBold'] text-[#1B1717] mb-2">
                          {plan.price}
                        </div>
                        <div className="space-y-1 text-[14px] font-['Gilroy-Regular'] text-gray-600">
                          <div>Validity: {plan.validity}</div>
                          <div>Data: {plan.data}</div>
                          <div>Calls: {plan.calls}</div>
                          <div>{plan.validityExtra}</div>
                        </div>
                      </div>
                      <ChevronRight className="text-gray-400 w-6 h-6" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
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


