import { useState } from "react";
import { useDispatch } from "react-redux";
import { HiOutlineArrowNarrowLeft } from "react-icons/hi";
import { Search, ChevronRight } from "lucide-react";
import PropTypes from "prop-types";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { dthPay, dthPlanFetch, dthCustomerInfo } from "../../../redux/action/rechargeAction";
import { ButtonLoader } from "../../../widgets/layout/loader";

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

// Operator to opcode mapping
const getOperatorOpcode = (operatorName) => {
  const name = operatorName?.toUpperCase() || "";
  if (name.includes("AIRTEL")) return "ATV";
  if (name.includes("SUN")) return "STV";
  if (name.includes("DISH")) return "DTV";
  if (name.includes("TATA")) return "TTV";
  if (name.includes("VIDEOCON") || name.includes("D2H")) return "VTV";
  return "";
};

// Get operator logo from selectDTHOperators
const getOperatorLogo = (operatorName) => {
  if (!operatorName) return "";
  
  // Normalize operator names for better matching (remove common words)
  const normalizeName = (name) => {
    return name.toLowerCase()
      .replace(/\s*dth\s*/gi, "")
      .replace(/\s*direct\s*/gi, "")
      .replace(/\s*play\s*/gi, "")
      .trim();
  };
  
  const normalizedInput = normalizeName(operatorName);
  
  const operator = selectDTHOperators.find((op) => {
    const normalizedOpName = normalizeName(op.name);
    // Check if normalized names match or if either contains the other
    return normalizedOpName === normalizedInput ||
           normalizedOpName.includes(normalizedInput) ||
           normalizedInput.includes(normalizedOpName) ||
           op.name.toLowerCase().includes(operatorName.toLowerCase()) ||
           operatorName.toLowerCase().includes(op.name.toLowerCase());
  });
  
  return operator?.logo || "";
};

const selectDTHOperators = [
  {
    id: 1, name: "Airtel DTH", logo: "/img/Airtel.svg"
  },
  { id: 2, name: "Dish TV", logo: "/img/DishTV.svg" },
  { id: 3, name: "Tata Play", logo: "/img/TataPlay.svg" },
  { id: 4, name: "Sun DTH", logo: "/img/Sundirect.svg" },
  { id: 5, name: "Videocon", logo: "/img/D2H.svg" },
];

const InlineSearchSelect = ({ options, value, onChange, inputClassName = "" }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = options.find((o) => o.value === value);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="relative">
      {/* Input = Select */}
      <input
        value={open ? query : selected?.label || ""}
        placeholder="Select Language"
        onFocus={() => setOpen(true)}
        onBlur={() => {
          // Delay to allow option click to fire first
          setTimeout(() => setOpen(false), 200);
        }}
        onChange={(e) => setQuery(e.target.value)}
        className={`w-full border text-[#1B1717] text-opacity-80 border-[0.5px] rounded-xl focus:outline-none text-[#1B1717] pl-12 pr-4 py-3 ${inputClassName}`}
      />

      {/* Dropdown */}
      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-[#1B1717]/20 rounded-lg shadow-lg max-h-40 overflow-auto">
          {filtered.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setQuery("");
                setOpen(false);
              }}
              className={`px-3 py-2 cursor-pointer text-xs ${opt.value === value
                ? "bg-[#039155] text-white"
                : "hover:bg-gray-100"
                }`}
            >
              {opt.label}
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="px-3 py-2 text-xs text-gray-400">No results</div>
          )}
        </div>
      )}
    </div>
  );
};

const RecentRechargeCard = ({ recharge }) => {
  const operatorLogo = getOperatorLogo(recharge.operator) || recharge.logo;
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 hover:shadow-sm transition cursor-pointer">
      <div className="flex items-start gap-3">
        {/* Operator Logo */}
        <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
          {operatorLogo ? (
            <img
              src={operatorLogo}
              alt={recharge.operator}
              className="w-12 h-12 object-contain"
            />
          ) : (
            <div className="w-12 h-12 flex items-center justify-center text-white font-bold text-sm">
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
      className={`bg-white w-full py-4 hover:shadow-sm transition cursor-pointer ${!isLast ? "border-b border-[#1B1717]/30" : ""
        }`}
    >
      <div className="flex  gap-4">
        <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
          {operator.logo ? (
            <img
              src={operator.logo}
              alt={operator.name}
              className="w-12 h-12 object-contain"
            />
          ) : (
            <div className="w-12 h-12 flex items-center justify-center text-white font-bold text-sm">
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



const transactionDetails = {
  transactionId: "TXN" + Date.now(),
  bConnectId: "BC" + Math.floor(Math.random() * 100000000),
  dateTime: new Date().toLocaleString(),
};

// Validation schema
const validationSchema = Yup.object().shape({
  dthNumber: Yup.string()
    .required("Subscriber ID or Mobile Number is required")
    .matches(/^\d+$/, "Only digits are allowed")
    .min(8, "Must be at least 8 digits")
    .max(15, "Must be at most 15 digits"),
});

const DTHRecharge = ({ onBack }) => {
  const dispatch = useDispatch();
  const [step, setStep] = useState("operator"); // operator → input → plans
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [opcode, setOpcode] = useState("");
  const [inputType, setInputType] = useState("subscriber"); // subscriber | mobile
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Packs");
  const [activeLanguagePack, setActiveLanguagePack] = useState("");
  const [language, setLanguage] = useState("");
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [isLoadingContinue, setIsLoadingContinue] = useState(false);
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [dthPlans, setDthPlans] = useState(null);
  const [filteredSuggestPlans, setFilteredSuggestPlans] = useState([]);
  const [paymentResponse, setPaymentResponse] = useState(null);


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

  // Transform API response to UI format
  const transformPlansFromAPI = (apiData) => {
    // The API response structure is: data.data.Combo
    const comboArray = apiData?.data?.data?.Combo || apiData?.data?.Combo;
    
    if (!comboArray || !Array.isArray(comboArray)) {
      return [];
    }

    const allPlans = [];
    let planId = 1;

    comboArray.forEach((combo) => {
      const languageName = combo.Language || "";
      
      combo.Details?.forEach((detail) => {
        detail.PricingList?.forEach((pricing) => {
          // Extract channel count
          const channelsMatch = detail.Channels?.match(/(\d+)/);
          const channels = channelsMatch ? parseInt(channelsMatch[1]) : 0;
          
          // Extract paid channels
          const paidMatch = detail.PaidChannels?.match(/(\d+)/);
          const paidChannels = paidMatch ? parseInt(paidMatch[1]) : 0;
          
          // Extract HD channels
          const hdMatch = detail.HdChannels?.match(/(\d+)/);
          const hdChannels = hdMatch ? parseInt(hdMatch[1]) : 0;
          const hasHD = detail.HdChannels && !detail.HdChannels.includes("No HD");
          
          // Calculate free channels (approximate)
          const freeChannels = channels - paidChannels;

          // Create features array from available data
          const features = [];
          
          // Add channels information
          if (detail.Channels) {
            features.push(`Total Channels: ${detail.Channels}`);
          }
          
          // Add paid channels information
          if (detail.PaidChannels) {
            features.push(detail.PaidChannels);
          }
          
          // Add HD channels information (include "No HD Channels" too)
          if (detail.HdChannels) {
            features.push(detail.HdChannels);
          }
          
          // Add language content
          if (languageName) {
            features.push(`${languageName} Language Pack`);
          }
          
          // Add last update information
          if (detail.last_update) {
            features.push(`Last Updated: ${detail.last_update}`);
          }

          // Normalize validity format (API returns "1 Months", but we want "1 Month" for consistency)
          const normalizeValidity = (monthStr) => {
            if (!monthStr) return "1 Month";
            // Convert "1 Months" to "1 Month", keep others as "X Months"
            const normalized = monthStr.trim();
            if (normalized.toLowerCase() === "1 months" || normalized.toLowerCase() === "1 month") {
              return "1 Month";
            }
            // Keep other formats as is (e.g., "3 Months", "6 Months")
            return normalized;
          };

          allPlans.push({
            id: planId++,
            price: `₹${pricing.Amount}`,
            validity: normalizeValidity(pricing.Month) || "1 Month",
            channels: channels,
            bouquet: detail.PlanName || "",
            paidChannels: paidChannels,
            freeChannels: freeChannels > 0 ? freeChannels : 0,
            hdChannels: hasHD ? hdChannels : 0,
            language: languageName,
            planName: detail.PlanName,
            features: features.length > 0 ? features : ["Premium DTH Channels"],
            originalData: {
              ...detail,
              pricing: pricing,
              language: languageName,
            },
          });
        });
      });
    });

    return allPlans;
  };

  // Filter plans based on active filter and search
  const getFilteredPlans = () => {
    if (!dthPlans || filteredSuggestPlans.length === 0) {
      return [];
    }

    let filtered = [...filteredSuggestPlans];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (plan) =>
          plan.price.toLowerCase().includes(query) ||
          plan.validity.toLowerCase().includes(query) ||
          plan.bouquet.toLowerCase().includes(query) ||
          plan.planName?.toLowerCase().includes(query)
      );
    }

    // Filter by active filter
    if (activeFilter !== "All Packs") {
      filtered = filtered.filter((plan) => {
        const planValidity = plan.validity.toLowerCase();
        const filterValidity = activeFilter.toLowerCase();
        return planValidity.includes(filterValidity);
      });
    }

    // Filter by language if selected
    if (language) {
      filtered = filtered.filter((plan) => plan.language === language);
    }

    // Filter by active language pack if selected
    if (activeLanguagePack && activeLanguagePack !== "Kannada Telugu Starter") {
      filtered = filtered.filter((plan) =>
        plan.bouquet.toLowerCase().includes(activeLanguagePack.toLowerCase())
      );
    }

    return filtered;
  };

  const displayPlans = getFilteredPlans();

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
                onClick={async () => {
                  setIsLoadingPayment(true);
                  try {
                    if (!selectedPlan || !opcode || !inputValue) {
                      console.error("Missing required data for payment");
                      return;
                    }

                    // Extract amount from price (remove ₹ and any spaces)
                    const amount = selectedPlan.price.replace(/[₹\s]/g, "");

                    const paymentPayload = {
                      dth_number: inputValue,
                      opcode: opcode,
                      amount: amount,
                    };

                    const paymentResponse = await dispatch(
                      dthPay(paymentPayload)
                    );

                    if (
                      paymentResponse?.status === "SUCCESS" &&
                      paymentResponse?.data
                    ) {
                      setPaymentResponse(paymentResponse);
                      setShowPayment(false);
                      setStep("success");
                    } else {
                      console.error("Payment failed:", paymentResponse);
                      // You might want to show an error message here
                    }
                  } catch (error) {
                    console.error("Error processing payment:", error);
                    // You might want to show an error message here
                  } finally {
                    setIsLoadingPayment(false);
                  }
                }}
                disabled={isLoadingPayment}
                className={`flex-1 h-[48px] bg-[#039155] hover:bg-[#027A47] text-white rounded-xl text-lg font-['Gilroy-semibold'] transition flex items-center justify-center ${
                  isLoadingPayment
                    ? "cursor-wait opacity-100"
                    : ""
                }`}
              >
                {isLoadingPayment ? (
                  <>
                    <ButtonLoader color="#FFFFFF" size={20} />
                    <span className="ml-2">Processing...</span>
                  </>
                ) : (
                  "Confirm Payment"
                )}
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
          <div className="relative bg-white rounded-3xl w-[618px] max-w-[95vw] max-h-[90vh] px-4 py-3 z-10 overflow-y-auto">
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
              {/* Plan Name */}
              <li className="flex items-center">
                <span className="flex gap-2">
                  <span className="text-[16px] text-[#1B1717]/80 relative top-[1px]">
                    •
                  </span>
                  <p>Plan Name: {selectedPlan.planName || selectedPlan.bouquet}</p>
                </span>
              </li>
              
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
              {(() => {
                // Get features from plan or reconstruct from originalData
                let featuresToShow = selectedPlan.features || [];
                
                // If no features, try to get from originalData
                if (featuresToShow.length === 0 && selectedPlan.originalData) {
                  const detail = selectedPlan.originalData;
                  featuresToShow = [];
                  
                  if (detail.Channels) {
                    featuresToShow.push(`Total Channels: ${detail.Channels}`);
                  }
                  if (detail.PaidChannels) {
                    featuresToShow.push(detail.PaidChannels);
                  }
                  if (detail.HdChannels) {
                    featuresToShow.push(detail.HdChannels);
                  }
                  if (selectedPlan.language) {
                    featuresToShow.push(`${selectedPlan.language} Language Pack`);
                  }
                  if (detail.last_update) {
                    featuresToShow.push(`Last Updated: ${detail.last_update}`);
                  }
                }
                
                // Fallback if still no features
                if (featuresToShow.length === 0) {
                  featuresToShow = ["Premium DTH Channels"];
                }
                
                return featuresToShow.map((item, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="text-[16px] text-[#1B1717]/80 relative top-[1px]">
                      •
                    </span>
                    <span>{item}</span>
                  </li>
                ));
              })()}
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
                      const operatorOpcode = getOperatorOpcode(op.name);
                      setSelectedOperator(op);
                      setOpcode(operatorOpcode);
                      setStep("input");
                    }}
                    className="w-full text-left"
                  >
                    <OperatorCard
                      operator={op}
                      isLast={index === selectDTHOperators.length - 1}
                      onSelect={() => { }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div
            className={`${step === "input" ? "bg-white rounded-3xl  px-4 py-4" : ""
              } lg:flex-[1.6] w-full lg:w-auto self-start`}
          >
            {step === "input" && (
              <>
                <div className="text-[18px] flex items-center space-x-[18px] font-['Gilroy-semibold'] text-[#1B1717] mb-4 ">
                  <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                    {selectedOperator.logo ? (
                      <img
                        src={selectedOperator.logo}
                        alt={selectedOperator.name}
                        className="w-12 h-12 object-contain"
                      />
                    ) : (
                      <div className="w-12 h-12 flex items-center justify-center text-white font-bold text-sm">
                        {selectedOperator.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="">{selectedOperator.name}</div>
                </div>

                <Formik
                  initialValues={{ dthNumber: "" }}
                  validationSchema={validationSchema}
                  onSubmit={async (values, { setSubmitting }) => {
                    setIsLoadingContinue(true);
                    try {
                      // Call dthCustomerInfo API
                      const customerPayload = {
                        dth_number: values.dthNumber,
                        opcode: opcode,
                      };

                      const customerResponse = await dispatch(
                        dthCustomerInfo(customerPayload)
                      );

                      if (
                        customerResponse?.status === "SUCCESS" &&
                        customerResponse?.dthOperatorInfo
                      ) {
                        setCustomerInfo(customerResponse.dthOperatorInfo);
                        setInputValue(values.dthNumber);

                        // Call dthPlanFetch API with same payload
                        const planResponse = await dispatch(
                          dthPlanFetch(customerPayload)
                        );

                        if (
                          planResponse?.status === "SUCCESS" &&
                          planResponse?.dthRechargePlan
                        ) {
                          setDthPlans(planResponse.dthRechargePlan);
                          const transformedPlans = transformPlansFromAPI(
                            planResponse.dthRechargePlan
                          );
                          setFilteredSuggestPlans(transformedPlans);
                          
                          // Extract unique languages from API response
                          // The API response structure is: data.data.Combo
                          const comboArray = planResponse.dthRechargePlan?.data?.data?.Combo || 
                                           planResponse.dthRechargePlan?.data?.Combo;
                          if (comboArray && Array.isArray(comboArray)) {
                            const languages = comboArray.map(
                              (combo) => combo.Language
                            ).filter(Boolean);
                            setAvailableLanguages(languages);
                            // Don't set initial language - let user select
                          }
                          
                          setStep("confirm");
                        } else {
                          console.error(
                            "Failed to fetch plans:",
                            planResponse
                          );
                          // Still proceed to confirm step even if plans fail
                          setStep("confirm");
                        }
                      } else {
                        console.error(
                          "Failed to fetch customer info:",
                          customerResponse
                        );
                        // You might want to show an error message here
                      }
                    } catch (error) {
                      console.error("Error in form submission:", error);
                      // You might want to show an error message here
                    } finally {
                      setIsLoadingContinue(false);
                      setSubmitting(false);
                    }
                  }}
                >
                  {({ values, errors, touched, handleChange, handleBlur }) => (
                    <Form className="space-y-4">
                      {/* Subscriber ID or Mobile Number Input */}
                      <div>
                        <label
                          htmlFor="dthNumber"
                          className="block text-[14px] font-['Gilroy-Medium'] text-[#121216] mb-2"
                        >
                          Subscriber ID Or Mobile Number
                        </label>
                        <Field name="dthNumber">
                          {({ field }) => (
                            <input
                              {...field}
                              type="text"
                              value={field.value}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, ""); // only digits
                                if (value.length <= 15) {
                                  field.onChange({
                                    target: { name: "dthNumber", value },
                                  });
                                }
                              }}
                              onBlur={handleBlur}
                              placeholder="Enter Subscriber ID or Mobile Number"
                              className={`w-full px-4 py-4 border-[0.5px] border-[#1B1717]/80 rounded-lg focus:outline-none text-[#1B1717]/80 font-['Gilroy-Medium'] text-xs ${
                                errors.dthNumber && touched.dthNumber
                                  ? "border-red-500"
                                  : ""
                              }`}
                            />
                          )}
                        </Field>
                        {errors.dthNumber && touched.dthNumber && (
                          <div className="text-red-500 text-xs mt-1">
                            {errors.dthNumber}
                          </div>
                        )}
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
                          type="submit"
                          disabled={isLoadingContinue}
                          className={`flex-1 h-[48px] bg-[#039155] hover:bg-[#027A47] text-white rounded-xl text-lg font-['Gilroy-semibold'] transition flex items-center justify-center ${
                            isLoadingContinue
                              ? "cursor-wait opacity-100"
                              : ""
                          }`}
                        >
                          {isLoadingContinue ? (
                            <>
                              <ButtonLoader color="#FFFFFF" size={20} />
                              <span className="ml-2">Processing...</span>
                            </>
                          ) : (
                            "Continue"
                          )}
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
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

                  {/* Language Dropdown */}
                  <div className="relative font-['Gilroy-Medium']">
                    <Search className="absolute left-4 top-1/2 text-[#1B1717] text-opacity-50 -translate-y-1/2 w-5 h-5 z-10 pointer-events-none" />
                    <InlineSearchSelect
                      options={(availableLanguages.length > 0 
                        ? availableLanguages.map(lang => ({ value: lang, label: lang }))
                        : languageOptions
                      )}
                      value={language}
                      onChange={(value) => {
                        setLanguage(value);
                        setActiveLanguagePack(""); // Reset language pack when language changes
                      }}
                    />
                  </div>
                </div>

                {/* Language Packs - Show unique plan names from API based on selected language */}
                {(() => {
                  // Get plans filtered by selected language
                  const languageFilteredPlans = language 
                    ? filteredSuggestPlans.filter((plan) => plan.language === language)
                    : [];
                  
                  // Get unique bouquets from language-filtered plans
                  const availablePacks = [
                    ...new Set(languageFilteredPlans.map((plan) => plan.bouquet))
                  ];

                  return availablePacks.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {availablePacks.slice(0, 6).map((pack) => (
                        <button
                          key={pack}
                          type="button"
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
                  ) : null;
                })()}

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
                        ${isActive
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
                  {displayPlans.length > 0 ? (
                    displayPlans.map((plan) => (
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
                    ))
                  ) : (
                    <div className="text-center py-8 text-[#1B1717]/80">
                      No plans found. Please try different filters.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === "review" && selectedPlan && (
            <>
              {/* Operator Card */}
              <div className="bg-white rounded-3xl p-4 space-y-4 mb-4">
                <div className="flex gap-4">
                  <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                    {selectedOperator.logo ? (
                      <img
                        src={selectedOperator.logo}
                        alt={selectedOperator.name}
                        className="w-12 h-12 object-contain"
                      />
                    ) : (
                      <div className="w-12 h-12 flex items-center justify-center text-white font-bold text-sm">
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
                    {selectedPlan.features && selectedPlan.features.length > 0 ? (
                      selectedPlan.features.map((item, index) => (
                        <li key={index} className="flex gap-2">
                          <span className="text-[16px] relative top-[1px]">
                            •
                          </span>
                          {item}
                        </li>
                      ))
                    ) : (
                      <li className="flex gap-2">
                        <span className="text-[16px] relative top-[1px]">
                          •
                        </span>
                        Premium DTH Channels
                      </li>
                    )}
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
                    {paymentResponse?.data?.apiResponse?.amount 
                      ? `₹${paymentResponse.data.apiResponse.amount}` 
                      : selectedPlan?.price || "N/A"}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 mb-20">
                  <div>
                    <div className="text-[#121216] font-['Gilroy-Medium'] text-xs">
                      Transaction ID
                    </div>
                    <div className="font-['Gilroy-Medium'] text-[#1B1717] text-sm">
                      {paymentResponse?.data?.apiResponse?.txid || "N/A"}
                    </div>
                  </div>

                  <div>
                    <div className="text-[#121216] font-['Gilroy-Medium'] text-xs">
                      {paymentResponse?.data?.apiResponse?.number?.length === 10
                        ? "Mobile Number"
                        : "Subscriber ID"}
                    </div>
                    <div className="font-['Gilroy-Medium'] text-sm">
                      {paymentResponse?.data?.apiResponse?.number || inputValue}
                    </div>
                  </div>

                  <div>
                    <div className="text-[#121216] font-['Gilroy-Medium'] text-xs">
                      Operator
                    </div>
                    <div className="font-['Gilroy-Medium']">
                      {selectedOperator?.name || "N/A"}
                    </div>
                  </div>

                  <div>
                    <div className="text-[#121216] font-['Gilroy-Medium'] text-xs">
                      Validity
                    </div>
                    <div className="font-['Gilroy-Medium']">
                      {selectedPlan?.validity || "N/A"}
                    </div>
                  </div>

                  <div>
                    <div className="text-[#121216] font-['Gilroy-Medium'] text-xs">
                      Bouquet
                    </div>
                    <div className="font-['Gilroy-Medium']">
                      {selectedPlan?.bouquet || "N/A"}
                    </div>
                  </div>

                  <div>
                    <div className="text-[#121216] font-['Gilroy-Medium'] text-xs">
                      Channels
                    </div>
                    <div className="font-['Gilroy-Medium']">
                      {selectedPlan?.channels || "N/A"}
                    </div>
                  </div>

                  <div>
                    <div className="text-[#121216] font-['Gilroy-Medium'] text-xs">
                      Order ID
                    </div>
                    <div className="font-['Gilroy-Medium']">
                      {paymentResponse?.data?.orderid || "N/A"}
                    </div>
                  </div>

                  <div>
                    <div className="text-[#1B1717]/80 text-[11px]">Date</div>
                    <div className="font-['Gilroy-Medium']">
                      {new Date().toLocaleString()}
                    </div>
                  </div>
                </div>


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
