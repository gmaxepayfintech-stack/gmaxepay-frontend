import { useState } from "react";
import { HiOutlineArrowNarrowLeft } from "react-icons/hi";
import { Search, ChevronRight } from "lucide-react";
import PropTypes from "prop-types";
import Select from "react-select";

// Sample recent recharge data
const recentDTHRecharges = [
  {
    id: 1,
    operator: "Dish TV",
    operatorType: "Dish TV ",
    mobileNumber: "9740418524",
    lastRecharge: "Last Recharge ₹26 On 26 Dec 2025",
    logo: "",
  },
  {
    id: 2,
    operator: "Tata Play",
    operatorType: "Tata Play",
    mobileNumber: "9740418524",
    lastRecharge: "Last Recharge ₹26 On 26 Dec 2025",
    logo: "",
  },
  {
    id: 3,
    operator: "Sun Direct",
    operatorType: "Sun Direct",
    mobileNumber: "9740418524",
    lastRecharge: "Last Recharge ₹26 On 26 Dec 2025",
    logo: "",
  },
  {
    id: 4,
    operator: "Videocon",
    operatorType: "Videocon D2H",
    mobileNumber: "9740418524",
    lastRecharge: "Last Recharge ₹26 On 26 Dec 2025",
    logo: "",
  },
];

const selectDTHOperators = [
  { id: 1, name: "Airtel DTH", logo: "" },
  { id: 2, name: "Dish TV", logo: "" },
  { id: 3, name: "Tata Play", logo: "" },
  { id: 4, name: "Sun DTH", logo: "" },
  { id: 5, name: "Videocon", logo: "" },
];

const RecentRechargeCard = ({ recharge }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 hover:shadow-sm transition cursor-pointer">
      <div className="flex items-start gap-3">
        {/* Operator Logo */}
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
          {recharge.logo ? (
            <img
              src={recharge.logo}
              alt={recharge.operator}
              className="w-10 h-10 rounded-full"
            />
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

const OperatorCard = ({ operator, onSelect, isLast }) => {
  return (
    <button
      onClick={() => onSelect(operator)}
      className={`bg-white w-full py-4 hover:shadow-sm transition cursor-pointer ${
        !isLast ? "border-b border-[#1B1717]/30" : ""
      }`}
    >
      <div className="flex  gap-4">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
          {operator.logo ? (
            <img
              src={operator.logo}
              alt={operator.name}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              {operator.name.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex items-center min-w-0">
          <div className="text-[18px] font-['Gilroy-Medium'] text-[#1B1717]">
            {operator.name}
          </div>
        </div>
      </div>
    </button>
  );
};

// Sample plan data
const sugggestPlans = [
  {
    id: 1,
    price: "₹134",
    validity: "1 Month",
    channels: 244,
    bouquet: "Kannada Super Value",
    paidChannels: 89,
    freeChannels: 32,
    features: [
      "Entertainment & News Channels",
      "Access to 244 Premium Channels",
      "Regional Kannada Content",
    ],
  },
  {
    id: 2,
    price: "₹299",
    validity: "3 Months",
    channels: 268,
    bouquet: "Kannada Premium",
    paidChannels: 112,
    freeChannels: 48,
    features: [
      "Sports, Movies & News",
      "Access to 268 Premium Channels",
      "Kannada & Hindi Content",
    ],
  },
  {
    id: 3,
    price: "₹499",
    validity: "6 Months",
    channels: 310,
    bouquet: "Family Entertainment Bundle",
    paidChannels: 145,
    freeChannels: 60,
    features: [
      "Kids, Movies & Lifestyle",
      "Access to 310 Premium Channels",
      "All Regional Languages",
    ],
  },
];

const filterButtons = [
  "All Packs",
  "1 Month",
  "3 Months",
  "6 Months",
  "9 Months",
  "12 Months",
];

const languageOptions = [
  { value: "Kannada", label: "Kannada" },
  { value: "Hindi", label: "Hindi" },
  { value: "English", label: "English" },
  { value: "Tamil", label: "Tamil" },
  { value: "Telugu", label: "Telugu" },
  { value: "Malayalam", label: "Malayalam" },
];

const languagePacks = [
  "Kannada Telugu Starter",
  "Kannada Super Value",
  "Family Entertainment Bundle",
  "Kannada Premium",
  "Kannada Dhamaal HDS",
  "Kannada Hindi Dhamaal",
];

const transactionDetails = {
  transactionId: "TXN" + Date.now(),
  bConnectId: "BC" + Math.floor(Math.random() * 100000000),
  dateTime: new Date().toLocaleString(),
};

const DTHRecharge = ({ onBack }) => {
  const [step, setStep] = useState("operator"); // operator → input → plans
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [inputType, setInputType] = useState("subscriber"); // subscriber | mobile
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Packs");
  const [activeLanguagePack, setActiveLanguagePack] = useState(
    "Kannada Telugu Starter"
  );
  const [language, setLanguage] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  // const handleProceed = () => {
  //   if (!inputValue) return;

  //   // If user entered mobile number, validate length
  //   if (inputType === "mobile" && inputValue.length !== 10) return;

  //   setStep("confirm");
  // };

  // const handleCancel = () => {
  //   if (step === "confirm") {
  //     setStep("input");
  //   } else {
  //     setInputValue("");
  //   }
  // };

  const handleRecentRechargeClick = (recharge) => {
    setInputValue(recharge.mobileNumber); // works for subscriber ID or mobile
    setSelectedOperator({
      name: recharge.operator,
      circle: "Karnataka",
    });
    setStep("confirm"); // jump directly to plan selection
  };

  const isValidSubscriber = inputValue.length >= 8 && inputValue.length <= 15;
  const isMobileNumber = inputValue.length === 10;

  const filteredSuggestPlans =
    activeFilter === "All Packs"
      ? sugggestPlans
      : sugggestPlans.filter(
          (plan) => plan.validity.toLowerCase() === activeFilter.toLowerCase()
        );

  return (
    <div className="w-full">
      {/* payment details card */}
      {showPayment && selectedPlan && (
        <div
          className="fixed inset-0 bg-[#D9D9D9]/80 z-50 flex items-center justify-center"
          onClick={() => setShowPayment(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-[498px] rounded-3xl p-4 relative"
          >
            {/* Close */}

            <div className="text-center ">
              <div className="text-2xl font-['Gilroy-medium'] text-black">
                Confirm Payment Method
              </div>
              <div className="text-[16px] mt-1 mb-5 text-[#1B1717]/80 font-['Gilroy-regular'] ">
                Review Your Payment Details
              </div>
              <div className="text-lg text-[#121216] font-['Gilroy-medium'] mb-2 ">
                DTH Recharge Payment
              </div>
            </div>

            {/* Amount */}
            <div className="border-[0.5px] border-dashed border-[#1B1717]/80 rounded-lg py-4 text-center mb-4">
              <div className="text-2xl font-['Gilroy-SemiBold'] text-[#1B1717]">
                {selectedPlan.price}
              </div>
            </div>

            {/* Info */}
            <div className="space-y-2 text-sm text-[#1B1717]/80 font-['Gilroy-medium'] ">
              <div className="flex justify-between">
                <span>
                  {isMobileNumber ? "Mobile Number" : "Subscriber ID"}
                </span>
                <span className="text-sm text-[#1B1717]/80 font-['Gilroy-semibold'] ">
                  {inputValue}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Payment Date</span>
                <span className="text-sm text-[#1B1717]/80 font-['Gilroy-semibold'] ">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Validity</span>
                <span className="text-sm text-[#1B1717]/80 font-['Gilroy-semibold'] ">
                  {selectedPlan.validity}
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPayment(false)}
                className="flex-1 h-[48px] border-[0.5px] border-[#1B1717]/80 rounded-xl bg-white text-[#1B1717]/80 font-['Gilroy-Medium'] hover:bg-gray-50 transition text-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowPayment(false);
                  setStep("success");
                }}
                className="flex-1 h-[48px] bg-[#039155] hover:bg-[#027A47] text-white rounded-xl text-lg font-['Gilroy-semibold'] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* details palan card */}
      {showDetails && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Background blur */}
          <div
            className="absolute inset-0 bg-[#D9D9D9]/80"
            onClick={() => setShowDetails(false)}
          />

          {/* Modal Card */}
          <div className="relative bg-white rounded-3xl w-[618px] h-[310px] max-w-[95vw] max-h-[90vh] px-4 py-3 z-10">
            {/* Close */}
            <button
              onClick={() => setShowDetails(false)}
              className="absolute top-4 right-4 bg-[#039155] text-white rounded-lg w-6 h-6 flex items-center justify-center"
            >
              <div className="border border-white rounded-full w-4 h-4 flex items-center justify-center">
                <span className="text-[10px] leading-none">x</span>
              </div>
            </button>

            {/* Top */}

            <div className="text-lg font-['Gilroy-SemiBold'] text-black">
              {selectedPlan.price}
            </div>

            <div className="flex gap-x-52 py-3">
              <div>
                <div className="text-sm text-[#1B1717]/80 font-['Gilroy-regular']">
                  Validity
                </div>
                <div className="text-xs text-black font-['Gilroy-medium']">
                  {selectedPlan.validity}
                </div>
              </div>
              <div>
                <div className="text-sm text-[#1B1717]/80 font-['Gilroy-regular']">
                  Channels
                </div>
                <div className="text-xs text-black font-['Gilroy-medium']">
                  {selectedPlan.channels}
                </div>
              </div>
            </div>

            <div className="border-t border-[#121216]/20 my-3" />

            {/* Bouquet */}
            <div className="text-sm font-['Gilroy-Medium'] text-[#1B1717] mb-2">
              {selectedPlan.bouquet}
            </div>

            {/* Details */}
            <ul className="text-sm font-['Gilroy-regular'] text-[#1B1717]/80 space-y-2 px-2">
              {/* First special line */}
              <li className="flex items-center -py-1">
                <span className="flex gap-2">
                  <span className="text-[16px]  text-[#1B1717]/80 relative top-[1px]">
                    •
                  </span>{" "}
                  <p>Paid Channels: {selectedPlan.paidChannels}</p>
                </span>

                <span className="mx-2 text-[24px] text-[#1B1717]/80 relative top-[2px] leading-none">
                  •
                </span>

                <span>HD</span>
              </li>
              <li className="flex items-center ">
                <span className="flex gap-2">
                  <span className="text-[16px]  text-[#1B1717]/80 relative top-[1px]">
                    •
                  </span>{" "}
                  <p>Free Channels {selectedPlan.freeChannels} </p>
                </span>

                <span className="ml-1">Channels</span>
              </li>

              {/* Remaining features */}
              {selectedPlan.features.map((item, index) => (
                <li key={index} className="flex gap-2">
                  <span className="text-[16px] text-[#1B1717]/80 relative top-[1px]">
                    •
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        {onBack && (
          <button
            type="button"
            aria-label="Back"
            onClick={() => {
              if (showPayment) setShowPayment(false);
              else if (showDetails) setShowDetails(false);
              else if (step === "success") setStep("review");
              else if (step === "review") setStep("confirm");
              else if (step === "confirm") setStep("input");
              else if (step === "input") setStep("operator");
              else onBack();
            }}
            className="flex items-center justify-center w-10 h-10 border border-gray-400 rounded-full mr-2 bg-white hover:bg-gray-50 transition"
          >
            <HiOutlineArrowNarrowLeft className="text-2xl text-[#1B1717] opacity-80" />
          </button>
        )}
        <div className="flex-1 mt-[-10px]">
          <div className="text-[24px] font-['Gilroy-Medium'] text-[#1B1717]">
            Recharge DTH or TV
          </div>
          <div className="mt-[10px] text-[16px] text-[#000000] font-['Gilroy-Regular']">
            Making Connections Easier For Everyone
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Side - Information or Plans */}
        <div className="lg:flex-[1.6] w-full">
          {/* STEP 1 – OPERATOR */}
          {step === "operator" && (
            <div className="bg-white rounded-3xl px-5 py-3 lg:flex-[1]">
              <div className="text-[20px] font-['Gilroy-Medium'] text-[#1B1717]">
                Select Your DTH Operator
              </div>

              <div className="max-h-[600px] overflow-y-auto">
                {selectDTHOperators.map((op, index) => (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => {
                      setSelectedOperator(op);
                      setStep("input");
                    }}
                    className="w-full text-left"
                  >
                    <OperatorCard
                      operator={op}
                      isLast={index === selectDTHOperators.length - 1}
                      onSelect={() => {}}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div
            className={`${
              step === "input" ? "bg-white rounded-3xl  px-4 py-4" : ""
            } lg:flex-[1.6] w-full lg:w-auto self-start`}
          >
            {step === "input" && (
              <>
                <div className="text-[18px] flex items-center space-x-[18px] font-['Gilroy-semibold'] text-[#1B1717] mb-4 ">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex  items-center justify-center flex-shrink-0">
                    {selectedOperator.logo ? (
                      <img
                        src={selectedOperator.logo}
                        alt={selectedOperator.name}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                        {selectedOperator.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="">{selectedOperator.name}</div>
                </div>

                <div className="space-y-4">
                  {/* Mobile Number Input */}
                  <div>
                    <label
                      htmlFor="mobileNumber"
                      className="block text-[14px] font-['Gilroy-Medium'] text-[#121216] mb-2"
                    >
                      Subscriver ID Or Mobile Number
                    </label>
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, ""); // only digits
                        if (value.length <= 15) {
                          // allow VC numbers also
                          setInputValue(value);
                        }
                      }}
                      placeholder="Enter Subscriber ID or Mobile Number"
                      className="w-full px-4 py-4 border-[0.5px] border-[#1B1717]/80 rounded-lg focus:outline-none text-[#1B1717]/80 font-['Gilroy-Medium'] text-xs"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setStep("operator")}
                      className="flex-1 h-[48px] border-[0.5px] border-[#1B1717]/80 rounded-xl bg-white text-[#1B1717]/80 font-['Gilroy-Medium'] hover:bg-gray-50 transition text-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep("confirm")}
                      disabled={!isValidSubscriber}
                      className="flex-1 h-[48px] bg-[#039155] hover:bg-[#027A47] text-white rounded-xl text-lg font-['Gilroy-semibold'] transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {step === "confirm" && (
            <div className="space-y-4">
              <div className="bg-white rounded-3xl px-5 py-4 space-y-3">
                {/* Language */}
                <div>
                  <label className="flex items-center text-sm text-[#121216] font-['Gilroy-Medium'] mb-2 leading-none">
                    Language
                    <span className=" ml-1 mt-2 leading-none">*</span>
                  </label>

                  <Select
                    options={languageOptions}
                    placeholder="Select"
                    value={
                      languageOptions.find((o) => o.value === language) || null
                    }
                    onChange={(opt) => setLanguage(opt.value)}
                    isSearchable
                    unstyled
                    classNames={{
                      control: () =>
                        "w-full border-[0.5px] border-[#1B1717]/80 rounded-lg px-2 py-3 text-xs font-['Gilroy-Medium'] text-[#1B1717]/80 bg-white",
                      menu: () =>
                        "bg-white border border-[#1B1717]/20 rounded-lg mt-1 shadow-lg text-[#1B1717]/80 font-['Gilroy-Medium'] text-xs",
                      option: ({ isFocused, isSelected }) =>
                        `px-3 py-2 cursor-pointer ${
                          isSelected
                            ? "bg-[#039155] text-white"
                            : isFocused
                            ? "bg-gray-100"
                            : ""
                        }`,
                      placeholder: () => "text-[#1B1717]/80",
                      singleValue: () => "text-[#1B1717]",
                    }}
                  />
                </div>

                {/* Language Packs */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {languagePacks.map((pack) => (
                    <button
                      key={pack}
                      onClick={() => setActiveLanguagePack(pack)}
                      className={`px-3 py-1.5 rounded-lg text-sm truncate transition ${
                        activeLanguagePack === pack
                          ? "bg-[#039155] text-white font-['Gilroy-semibold']"
                          : "text-[#1B1717]/80 border-[0.5px] border-[#1B1717]/80 font-['Gilroy-medium']"
                      }`}
                    >
                      {pack}
                    </button>
                  ))}
                </div>

                {/* Select Plan */}
                <div className="text-lg font-['Gilroy-Medium'] text-[#1B1717] pt-3">
                  Select Plan
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1B1717]/50 w-4 h-4 " />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search For A Plan, Eg 249 Or 3 Months"
                    className="w-full pl-12 pr-4 py-3 border-[0.5px] border-[#1B1717]/80 rounded-lg focus:outline-none text-[#1B1717]/50 text-sm font-['Gilroy-medium'] "
                  />
                </div>

                {/* Filters */}
                <div className="flex justify-between">
                  {filterButtons.map((filter) => {
                    const isActive = activeFilter === filter;

                    return (
                      <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`relative pb-0.5 text-sm font-['Gilroy-Medium'] whitespace-nowrap transition
                        ${
                          isActive
                            ? "text-[#039155]"
                            : "text-[#1B1717]/80 hover:text-[#039155]"
                        }
                      `}
                      >
                        {filter}

                        <span
                          className={`absolute left-1/2 -bottom-[4px] h-[3px] bg-[#039155] rounded-full -translate-x-1/2 transition-all duration-300
                          ${isActive ? "w-1/2" : "w-0"}
                        `}
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Plans */}
                <div className="space-y-4">
                  {filteredSuggestPlans.map((plan) => (
                    <div
                      onClick={() => {
                        setSelectedPlan(plan);
                        setStep("review");
                      }}
                      key={plan.id}
                      className="bg-white border-[0.5px] border-[#1B1717]/80 rounded-3xl px-4 py-3 hover:shadow-sm transition cursor-pointer"
                    >
                      {/* Top Row */}
                      <div className="flex items-center justify-between">
                        <div className="flex gap-4">
                          <div className="text-lg font-['Gilroy-SemiBold'] text-black">
                            {plan.price}
                          </div>

                          <div className="flex items-center gap-6 text-[12px] text-[#1B1717]/70 font-['Gilroy-Medium']">
                            <div className="text-center border-l-[0.5px] border-[#1B1717]/80  ">
                              <div className="ml-4 text-[#1B1717]/80 ">
                                Validity
                              </div>
                              <div className="text-black text-xs font-['Gilroy-medium'] ml-4">
                                {plan.validity}
                              </div>
                            </div>

                            <div className="text-center">
                              <div className="text-[#1B1717]/80 ">Channels</div>
                              <div className="text-black text-xs font-['Gilroy-medium']">
                                {plan.channels}
                              </div>
                            </div>
                          </div>
                        </div>

                        <ChevronRight className="w-4 h-4 text-[#1B1717]/80" />
                      </div>

                      {/* Divider */}
                      <div className="border-t-[0.5px] border-[#1B1717]/80 my-3" />

                      {/* Bottom Row */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-['Gilroy-regular'] text-[#1B1717]/80">
                            {activeLanguagePack}
                          </div>
                          <div className="text-sm font-['Gilroy-regular'] text-[#1B1717]/80 flex items-center gap-1">
                            <span>Paid Channels: {plan.paidChannels}</span>

                            <span className="text-2xl leading-none text-[#1B1717]/80 relative top-[2px]">
                              •
                            </span>

                            <span className="text-sm font-['Gilroy-regular'] text-[#1B1717]/80">
                              HD , {plan.freeChannels} Channels
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // prevents triggering plan click
                            setSelectedPlan(plan);
                            setShowDetails(true);
                          }}
                          className="text-sm font-['Gilroy-Medium'] text-black"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === "review" && selectedPlan && (
            <>
              {/* Operator Card */}
              <div className="bg-white rounded-3xl p-4 space-y-4 mb-4">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
                    {selectedOperator.logo ? (
                      <img
                        src={selectedOperator.logo}
                        alt={selectedOperator.name}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                        {selectedOperator.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-lg font-['Gilroy-Medium'] text-black">
                      {inputValue}
                    </div>
                    <div className="text-sm text-[#1B1717]/80 font-['Gilroy-regular']">
                      {" "}
                      {selectedOperator.name}{" "}
                      <span className="text-xl leading-none text-[#1B1717]/80 relative top-[4px] ml-2">
                        {" "}
                        •{" "}
                      </span>{" "}
                      <span className="ml-0.5 text-sm text-[#1B1717]/80 font-['Gilroy-regular']">
                        {" "}
                        Karnataka{" "}
                      </span>{" "}
                    </div>
                  </div>
                </div>
              </div>

              {/* Plan Card */}
              <div className="bg-white rounded-3xl p-5 space-y-4 mt-6">
                <div className="">
                  {/* Price */}
                  <div className="text-lg font-['Gilroy-SemiBold'] text-black">
                    {selectedPlan.price}
                  </div>

                  {/* Validity + Channels + Change */}
                  <div className="flex justify-between items-center py-3">
                    <div>
                      <div className="text-sm text-[#1B1717]/80 font-['Gilroy-regular']">
                        Validity
                      </div>
                      <div className="text-xs text-black font-['Gilroy-medium']">
                        {selectedPlan.validity}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-[#1B1717]/80 font-['Gilroy-regular']">
                        Channels
                      </div>
                      <div className="text-xs text-black font-['Gilroy-medium']">
                        {selectedPlan.channels}
                      </div>
                    </div>

                    <button
                      onClick={() => setStep("confirm")}
                      className="text-sm text-[#039155] font-['Gilroy-semibold'] underline"
                    >
                      Change Plan
                    </button>
                  </div>

                  <div className="border-t border-[#121216]/20 my-3" />

                  {/* Bouquet */}
                  <div className="text-sm font-['Gilroy-Medium'] text-[#1B1717] mb-2">
                    {selectedPlan.bouquet}
                  </div>

                  {/* Details */}
                  <ul className="text-sm font-['Gilroy-regular'] text-[#1B1717]/80 space-y-2 px-2">
                    {/* Paid + HD */}
                    <li className="flex items-center">
                      <span className="flex gap-2">
                        <span className="text-[16px] relative top-[1px]">
                          •
                        </span>
                        Paid Channels: {selectedPlan.paidChannels}
                      </span>

                      <span className="mx-2 text-[24px] leading-none relative top-[2px]">
                        •
                      </span>

                      <span>HD</span>
                    </li>

                    {/* Free Channels */}
                    <li className="flex items-center">
                      <span className="flex gap-2">
                        <span className="text-[16px] relative top-[1px]">
                          •
                        </span>
                        Free Channels {selectedPlan.freeChannels}
                      </span>
                      <span className="ml-1">Channels</span>
                    </li>

                    {/* Other features */}
                    {selectedPlan.features.map((item, index) => (
                      <li key={index} className="flex gap-2">
                        <span className="text-[16px] relative top-[1px]">
                          •
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-3">
                  <button
                    onClick={() => setStep("confirm")}
                    className="flex-1 border-[0.5px] border-[#1B1717]/80 rounded-xl py-3 text-[#1B1717]/80 font-['Gilroy-Medium'] text-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setShowPayment(true)}
                    className="flex-1 bg-[#039155] hover:bg-[#027A47] text-white rounded-xl py-3 font-['Gilroy-semibold'] text-lg "
                  >
                    Proceed
                  </button>
                </div>
              </div>
            </>
          )}

          {step === "success" && selectedPlan && (
            <div className="bg-green-100 rounded-xl relative overflow-hidden max-w-md mx-auto">
              {/* Notches */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-10 bg-[#FAFAFA] rounded-b-full"></div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-10 bg-[#FAFAFA] rounded-t-full"></div>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-16 w-10 bg-[#FAFAFA] rounded-r-full"></div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 h-16 w-10 bg-[#FAFAFA] rounded-l-full"></div>

              <div className="relative z-10 pt-12 pb-12 px-12">
                {/* Success Header */}
                <div className="text-center mb-6">
                  <div className="flex justify-center mb-3">
                    <div className="w-14 h-14 rounded-full bg-[#039155] flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>

                  <h2 className="text-[20px] font-['Gilroy-SemiBold'] text-[#1B1717]">
                    Payment Successful
                  </h2>
                  <p className="text-[12px] text-[#1B1717]/80">
                    Your Payment Has Been Completed
                  </p>
                </div>

                {/* Amount */}
                <div className="border-2 border-dashed border-[#1B1717] rounded-lg p-3 text-center mb-5">
                  <div className="text-[24px] font-['Gilroy-SemiBold'] text-[#1B1717]">
                    {selectedPlan.price}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 mb-20">
                  <div>
                    <div className="text-[#121216] font-['Gilroy-Medium'] text-xs">
                      Transaction ID
                    </div>
                    <div className="font-['Gilroy-Medium'] text-[#1B1717] text-sm">
                      {transactionDetails.transactionId}
                    </div>
                  </div>

                  <div>
                    <div className="text-[#121216] font-['Gilroy-Medium'] text-xs">
                      {inputValue.length === 10
                        ? "Mobile Number"
                        : "Subscriber ID"}
                    </div>
                    <div className="font-['Gilroy-Medium'] text-sm">
                      {inputValue}
                    </div>
                  </div>

                  <div>
                    <div className="text-[#121216] font-['Gilroy-Medium'] text-xs">
                      Operator
                    </div>
                    <div className="font-['Gilroy-Medium']">
                      {selectedOperator.name}
                    </div>
                  </div>

                  <div>
                    <div className="text-[#121216] font-['Gilroy-Medium'] text-xs">
                      Validity
                    </div>
                    <div className="font-['Gilroy-Medium']">
                      {selectedPlan.validity}
                    </div>
                  </div>

                  <div>
                    <div className="text-[#121216] font-['Gilroy-Medium'] text-xs">
                      Bouquet
                    </div>
                    <div className="font-['Gilroy-Medium']">
                      {selectedPlan.bouquet}
                    </div>
                  </div>

                  <div>
                    <div className="text-[#121216] font-['Gilroy-Medium'] text-xs">
                      Channels
                    </div>
                    <div className="font-['Gilroy-Medium']">
                      {selectedPlan.channels}
                    </div>
                  </div>

                  <div>
                    <div className="text-[#121216] font-['Gilroy-Medium'] text-xs">
                      B-Connect ID
                    </div>
                    <div className="font-['Gilroy-Medium']">
                      {transactionDetails.bConnectId}
                    </div>
                  </div>

                  <div>
                    <div className="text-[#1B1717]/80 text-[11px]">Date</div>
                    <div className="font-['Gilroy-Medium']">
                      {transactionDetails.dateTime}
                    </div>
                  </div>
                </div>

                {/* Channel breakdown */}
                {/* <div className="border-t border-[#1B1717]/20 pt-3 mb-12 text-sm text-[#1B1717]/80">
                  Paid Channels: {selectedPlan.paidChannels}
                  <span className="mx-2 text-xl leading-none">•</span>
                  HD: {selectedPlan.hdChannels}
                </div> */}

                {/* Buttons */}
                <div className="absolute left-5 right-5 bottom-2 flex gap-28">
                  <button className="flex-1  border border-[#039155] rounded-lg py-2 text-sm text-[#039155] font-['Gilroy-Medium']">
                    Share
                  </button>

                  <button className="flex-1 bg-[#039155] text-white rounded-lg py-2 text-sm font-['Gilroy-semibold']">
                    Download Receipt
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side - Recent Recharge */}
        <div className="bg-white rounded-3xl px-5 py-3 lg:flex-[1]">
          <div className="text-[20px] font-['Gilroy-Medium'] text-[#1B1717] mb-6">
            Recent DTH recharge
          </div>

          <div className="max-h-[600px] overflow-y-auto">
            {recentDTHRecharges.map((recharge) => (
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

DTHRecharge.propTypes = {
  onBack: PropTypes.func,
};

export default DTHRecharge;
