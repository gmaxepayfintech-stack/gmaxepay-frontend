import { useState } from "react";
import { useDispatch } from "react-redux";
import { HiOutlineArrowNarrowLeft } from "react-icons/hi";
import { Search, ChevronRight, X } from "lucide-react";
import PropTypes from "prop-types";
import { rechargefindOperator, rechargefindPlan, rechargefindOffers, rechargePay } from "../../../redux/action/rechargeAction";


const recentRecharges = [
  {
    id: 1,
    operator: "Jio",
    operatorType: "Jio Prepaid",
    mobileNumber: "9740418524",
    lastRecharge: "Last Recharge ₹26 On 26 Dec 2025",
    logo: "/img/Jio.svg"
  },
  {
    id: 2,
    operator: "Airtel",
    operatorType: "Airtel Prepaid",
    mobileNumber: "9740418524",
    lastRecharge: "Last Recharge ₹26 On 26 Dec 2025",
    logo: "/img/Airtel.svg"
  },
  {
    id: 3,
    operator: "BSNL",
    operatorType: "BSNL Prepaid",
    mobileNumber: "9740418524",
    lastRecharge: "Last Recharge ₹26 On 26 Dec 2025",
    logo: "/img/BSNL.svg"
  },
  {
    id: 4,
    operator: "VI",
    operatorType: "VI Prepaid",
    mobileNumber: "9740418524",
    lastRecharge: "Last Recharge ₹26 On 26 Dec 2025",
    logo: "/img/VIPrepaid.svg"
  },
  {
    id: 5,
    operator: "Airtel",
    operatorType: "Airtel Prepaid",
    mobileNumber: "9740418524",
    lastRecharge: "Last Recharge ₹26 On 26 Dec 2025",
    logo: "/img/Airtel.svg"
  }
];

const RecentRechargeCard = ({ recharge }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 hover:shadow-sm transition cursor-pointer">
      <div className="flex items-start gap-3">
        {/* Operator Logo */}
        <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
          {recharge.logo ? (
            <img src={recharge.logo} alt={recharge.operator} className="w-12 h-12" />
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

// Helper function to get operator logo path
const getOperatorLogo = (operatorName) => {
  const logoMap = {
    "Jio": "/img/Jio.svg",
    "Airtel": "/img/Airtel.svg",
    "BSNL": "/img/BSNL.svg",
    "VI": "/img/VIPrepaid.svg",
    "Vodafone": "/img/VIPrepaid.svg",
    "Idea": "/img/VIPrepaid.svg"
  };
  return logoMap[operatorName] || null;
};

const MobileRecharge = ({ onBack }) => {
  const dispatch = useDispatch();
  const [mobileNumber, setMobileNumber] = useState("");
  const [step, setStep] = useState("input"); // "input" or "plans"
  const [selectedOperator, setSelectedOperator] = useState({ name: "Airtel", circle: "Karnataka" });
  const [activeFilter, setActiveFilter] = useState(null);
  const [activeCategory, setActiveCategory] = useState("Recommended");
  const [searchQuery, setSearchQuery] = useState("");
  const [showOperatorModal, setShowOperatorModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedPlanForRecharge, setSelectedPlanForRecharge] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [rechargePlans, setRechargePlans] = useState(null);
  const [rechargeOffers, setRechargeOffers] = useState(null);

  // Get unique operators from recent recharges
  const operators = recentRecharges.reduce((acc, recharge) => {
    if (!acc.find(op => op.operator === recharge.operator)) {
      acc.push({
        operator: recharge.operator,
        operatorType: recharge.operatorType,
        logo: recharge.logo
      });
    }
    return acc;
  }, []);

  // Helper function to extract suggested plans from offers API response
  const getSuggestedPlansFromOffers = () => {
    if (!rechargeOffers?.data || !Array.isArray(rechargeOffers.data)) {
      return [];
    }

    // Get first 3 offers
    const offers = rechargeOffers.data.slice(0, 3);

    return offers.map((offer, index) => {
      const offerText = offer.offer || "";

      // Extract data from offer text - try multiple patterns
      let dataText = "N/A";
      const dataPatterns = [
        /(\d+(?:\.\d+)?\s*GB)\s+data/i,        // "2GB data", "12GB data"
        /(Unlimited\s+data)/i,                  // "Unlimited data"
        /=\s*(\d+(?:\.\d+)?\s*GB)/i,           // "=2GB", "=12GB" (from after =)
        /(\d+(?:\.\d+)?\s*GB)/i                // Just "2GB", "12GB" anywhere
      ];

      for (const pattern of dataPatterns) {
        const match = offerText.match(pattern);
        if (match) {
          dataText = match[1].trim();
          break;
        }
      }

      // Extract validity from offer text - try multiple patterns
      let validityText = "N/A";
      const validityPatterns = [
        /(\d+\s*(?:day|days|Day|Days))/i,      // "1 day", "30 days", "28 Day"
        /(\d+)\s*M\b/i,                        // "1M", "6M" (months) - word boundary
        /(\d+)\s*D\b/i,                        // "28D", "56D" (days) - word boundary
        /=\s*.*?(\d+\s*(?:day|days|Day|Days|month|Month|M|D))/i  // From after "="
      ];

      for (const pattern of validityPatterns) {
        const match = offerText.match(pattern);
        if (match) {
          let validity = match[1].trim();
          // Format validity text
          if (/\d+\s*M\b/i.test(validity) && !validity.toLowerCase().includes("month")) {
            validityText = validity.replace(/\s*M\b/i, " Month");
          } else if (/\d+\s*D\b/i.test(validity) && !validity.toLowerCase().includes("day")) {
            validityText = validity.replace(/\s*D\b/i, " Day");
          } else {
            validityText = validity;
          }
          break;
        }
      }

      return {
        id: index + 1,
        price: `₹${offer.amount}`,
        operator: selectedOperator.name,
        lastRecharge: "Last Recharge On 08 Jan 26", // You can update this with actual data if available
        data: dataText,
        validity: validityText,
        originalOffer: offer // Store original offer data for reference
      };
    });
  };

  // Get suggested plans (only show if API data is available, don't show default)
  const displaySuggestedPlans = rechargeOffers ? getSuggestedPlansFromOffers() : [];

  // Helper function to transform API plan to UI format
  const transformPlanToUIFormat = (plan, index) => {
    // Extract data from desc field - handles multiple formats (Airtel and Jio)
    let dataText = "N/A";
    
    // Pattern 1: "Data : 50GB" (Airtel format)
    const dataMatch1 = plan.desc?.match(/Data\s*:\s*([^|]+)/i);
    if (dataMatch1) {
      dataText = dataMatch1[1].trim();
    } else {
      // Pattern 2: "Unlimited data - 28GB(2GB/Day)" or "UNLIMITED DATA - 42 GB (1.5GB/Day)" (Jio format)
      const unlimitedDataMatch = plan.desc?.match(/(?:Unlimited|UNLIMITED)\s+[Dd]ata\s*[-\s]+\s*([^,|]+)/i);
      if (unlimitedDataMatch) {
        dataText = unlimitedDataMatch[1].trim();
      } else {
        // Pattern 3: "Unlimited Data (10GB High Speed Data, thereafter unlimited at 64Kbps)" (Jio format)
        const unlimitedDataParenMatch = plan.desc?.match(/Unlimited\s+Data\s*\(([^)]+)/i);
        if (unlimitedDataParenMatch) {
          dataText = unlimitedDataParenMatch[1].trim();
        } else {
          // Pattern 4: "5 GB 4G/5G Data" or standalone data amounts (Jio format)
          const standaloneDataMatch = plan.desc?.match(/(\d+(?:\s*\.\d+)?\s*(?:GB|MB|TB)(?:\s*[^,|]+)?)/i);
          if (standaloneDataMatch) {
            dataText = standaloneDataMatch[1].trim();
          } else {
            // Pattern 5: Any data amount with GB/MB/TB
            const fallbackDataMatch = plan.desc?.match(/(\d+(?:\.\d+)?\s*(?:GB|MB|TB))/i);
            if (fallbackDataMatch) {
              dataText = fallbackDataMatch[1].trim();
            }
          }
        }
      }
    }

    // Extract calls from desc field - handles multiple formats (Airtel and Jio)
    let callsText = "N/A";
    
    // Pattern 1: "Calls : Unlimited local, STD & Roaming" (Airtel format)
    const callsMatch1 = plan.desc?.match(/Calls\s*:\s*([^|]+)/i);
    if (callsMatch1) {
      callsText = callsMatch1[1].trim();
    } else {
      // Pattern 2: "Unlimited Voice" or "UNLIMITED Voice Calls" (Jio format)
      const unlimitedVoiceMatch = plan.desc?.match(/(Unlimited\s+Voice(?:\s+Calls)?|UNLIMITED\s+Voice\s+Calls)/i);
      if (unlimitedVoiceMatch) {
        callsText = unlimitedVoiceMatch[1].trim();
      } else {
        // Pattern 3: "Unlimited local, STD & Roaming" (Airtel format without "Calls :")
        const unlimitedLocalMatch = plan.desc?.match(/(Unlimited\s+local[^,|]+)/i);
        if (unlimitedLocalMatch) {
          callsText = unlimitedLocalMatch[1].trim();
        } else {
          // Pattern 4: "Voice : ..." format
          const voiceMatch = plan.desc?.match(/Voice\s*:\s*([^|]+)/i);
          if (voiceMatch) {
            callsText = voiceMatch[1].trim();
          }
        }
      }
    }

    // Extract additional benefits
    const benefitMatch = plan.desc?.match(/Additional\s+(?:Benefit|Benenifit)\s*:\s*(.+)/i);
    const validityExtra = benefitMatch ? benefitMatch[1].trim() : "";

    return {
      id: index + 1,
      price: `₹${plan.rs}`,
      validity: plan.validity || "N/A",
      data: dataText,
      calls: callsText,
      validityExtra: validityExtra,
      planName: plan.Type || "",
      desc: plan.desc || "",
      originalPlan: plan
    };
  };

  // Helper function to get all plans from all categories dynamically
  const getAllPlansFromData = (plansData) => {
    const allPlans = [];
    // Iterate through all keys in plansData to get plans from all categories
    Object.keys(plansData).forEach(key => {
      if (Array.isArray(plansData[key])) {
        allPlans.push(...plansData[key]);
      }
    });
    return allPlans;
  };

  // Map API Type values to display category names
  const getCategoryTypeMapping = () => {
    return {
      "Internet": ["Internet"],
      "DATA": ["Data Packs", "DATA"],
      "Entertainment": ["Entertainment Plans", "Entertainment"],
      "Truly Unlimited": ["FULLTT Plans", "True 5G Unlimited Plans", "Truly Unlimited"],
      "Plan Vouchers": ["Plan Vouchers", "PlanVoucher"],
      "Talktime": ["Top-up", "TOPUP", "Talktime"]
    };
  };

  // Get category tabs - only show specific allowed categories
  const getCategoryTabs = () => {
    // Allowed category tabs
    const allowedCategories = [
      "Recommended",
      "Internet",
      "DATA",
      "Entertainment",
      "Truly Unlimited",
      "Plan Vouchers",
      "Talktime"
    ];

    if (!rechargePlans?.data) {
      return ["Recommended"];
    }

    const plansData = rechargePlans.data;
    const allPlans = getAllPlansFromData(plansData);

    // Get unique plan types from API
    const uniqueTypes = [...new Set(allPlans.map(plan => plan.Type).filter(Boolean))];
    const typeMapping = getCategoryTypeMapping();
    
    // Filter to only include allowed categories that have matching plans in API
    const availableCategories = allowedCategories.filter(category => {
      if (category === "Recommended") return true;
      const mappedTypes = typeMapping[category] || [];
      return mappedTypes.some(type => uniqueTypes.includes(type));
    });

    return availableCategories;
  };

  // Helper function to get plans based on category (Type)
  const getPlansByCategory = () => {
    if (!rechargePlans?.data) {
      return [];
    }

    const plansData = rechargePlans.data;
    let selectedPlans = [];

    // If "Recommended" is selected, show all plans
    if (activeCategory === "Recommended" || !activeCategory) {
      selectedPlans = getAllPlansFromData(plansData);
    } else {
      // Filter by Type using category mapping
      const allPlans = getAllPlansFromData(plansData);
      const typeMapping = getCategoryTypeMapping();
      const mappedTypes = typeMapping[activeCategory] || [activeCategory];
      
      selectedPlans = allPlans.filter(plan => 
        mappedTypes.includes(plan.Type)
      );
    }

    return selectedPlans;
  };

  // Get filter buttons (static buttons)
  const getFilterButtons = () => {
    return ["28 Days Validity", "1 GB Data", "2 GB Data", "Unlimited Data 5G"];
  };

  // Apply filters and search
  const getFilteredPlans = () => {
    let plans = getPlansByCategory();

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      plans = plans.filter(plan => {
        const price = plan.rs?.toString() || "";
        const validity = plan.validity?.toLowerCase() || "";
        const desc = plan.desc?.toLowerCase() || "";
        const type = plan.Type?.toLowerCase() || "";
        return price.includes(query) ||
          validity.includes(query) ||
          desc.includes(query) ||
          type.includes(query);
      });
    }

    // Apply active filter by Type
    if (activeFilter) {
      plans = plans.filter(plan => plan.Type === activeFilter);
    }

    // Transform to UI format
    return plans.map((plan, index) => transformPlanToUIFormat(plan, index));
  };

  // Get filtered plans for display (only show if API data is available, don't show default)
  const displayDetailedPlans = rechargePlans ? getFilteredPlans() : [];

  const handleProceed = async () => {
    if (!mobileNumber || mobileNumber.length !== 10) {
      return;
    }
    try {
      // Call the API to find operator with mobile number
      const operatorResponse = await dispatch(rechargefindOperator({ mobileNumber }));

      // Update selectedOperator with the response data
      if (operatorResponse?.mobileOperator) {
        const operatorData = operatorResponse.mobileOperator;
        setSelectedOperator({
          name: operatorData.company || "Airtel",
          circle: operatorData.circle || "Karnataka"
        });

        // Call rechargefindPlan with the required payload
        const planPayload = {
          mobileNumber: mobileNumber,
          opCode: operatorData.company_code || "A",
          circle: operatorData.circle_code || "06"
        };

        const planResponse = await dispatch(rechargefindPlan(planPayload));

        // Check if plan API call was successful
        if (planResponse?.status !== "SUCCESS" || !planResponse?.mobileRechargePlan) {
          console.error("Failed to fetch recharge plans");
          // Don't proceed to next step if plan API fails
          return;
        }

        // Store the plans data
        const plansData = planResponse.mobileRechargePlan;
        setRechargePlans(plansData);

        // Call rechargefindOffers with the same payload
        const offersResponse = await dispatch(rechargefindOffers(planPayload));

        // Store the offers data (optional - don't block if offers fail)
        if (offersResponse?.mobileRechargeOffers) {
          const offersData = offersResponse.mobileRechargeOffers;
          setRechargeOffers(offersData);
        }

        // Move to plan selection step only if plans were successfully fetched
        setStep("plans");
      }
    } catch (error) {
      console.error("Error finding operator or plans:", error);
      // You might want to show an error message to the user here
    }
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
              {paymentSuccess && transactionDetails ? (
                /* Payment Success Screen */
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
                        ₹ {transactionDetails.amount}
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-20">
                      <div>
                        <div className="text-[#121216] font-['Gilroy-Medium'] text-xs">
                          Transaction ID
                        </div>
                        <div className="font-['Gilroy-Medium'] text-[#1B1717] text-sm">
                          {transactionDetails.transactionId || 'N/A'}
                        </div>
                      </div>

                      <div>
                        <div className="text-[#121216] font-['Gilroy-Medium'] text-xs">
                          Mobile Number
                        </div>
                        <div className="font-['Gilroy-Medium'] text-sm">
                          {mobileNumber}
                        </div>
                      </div>

                      <div>
                        <div className="text-[#121216] font-['Gilroy-Medium'] text-xs">
                          Transaction Status
                        </div>
                        <div className="font-['Gilroy-Medium'] text-[#039155]">
                          {transactionDetails.status || 'Success'}
                        </div>
                      </div>

                      <div>
                        <div className="text-[#121216] font-['Gilroy-Medium'] text-xs">
                          Validity
                        </div>
                        <div className="font-['Gilroy-Medium']">
                          {selectedPlanForRecharge?.validity || 'N/A'}
                        </div>
                      </div>

                      <div>
                        <div className="text-[#121216] font-['Gilroy-Medium'] text-xs">
                          B-Connect Transaction ID
                        </div>
                        <div className="font-['Gilroy-Medium']">
                          {transactionDetails.bConnectId || 'N/A'}
                        </div>
                      </div>

                      <div>
                        <div className="text-[#121216] font-['Gilroy-Medium'] text-xs">
                          Order ID
                        </div>
                        <div className="font-['Gilroy-Medium']">
                          {transactionDetails.orderid || 'N/A'}
                        </div>
                      </div>

                      <div>
                        <div className="text-[#1B1717]/80 text-[11px]">Date</div>
                        <div className="font-['Gilroy-Medium']">
                          {transactionDetails.dateTime || 'N/A'}
                        </div>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="absolute left-5 right-5 bottom-2 flex gap-28">
                      <button
                        type="button"
                        onClick={() => {
                          // Handle share logic
                          console.log('Sharing receipt');
                        }}
                        className="flex-1 border border-[#039155] rounded-lg py-2 text-sm text-[#039155] font-['Gilroy-Medium']"
                      >
                        Share
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          // Handle download receipt logic
                          console.log('Downloading receipt');
                        }}
                        className="flex-1 bg-[#039155] text-white rounded-lg py-2 text-sm font-['Gilroy-semibold']"
                      >
                        Download Receipt
                      </button>
                    </div>
                  </div>
                </div>
              ) : selectedPlanForRecharge ? (
                /* Plan Confirmation Card */
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
                          setShowPaymentModal(true);
                        }}
                        className="flex-1 px-4 py-3 bg-[#039155]  rounded-lg text-[18px] font-['Gilroy-Medium'] text-white hover:bg-[#027a44] transition"
                      >
                        Proceed
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Mobile Number and Operator Info - Separate Card */}
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
                          <span className="text-[#039155] text-[40px] leading-none inline-flex items-center justify-center">•</span>
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

                  {/* Suggested Plans - Separate Cards */}
                  {displaySuggestedPlans.length > 0 && (
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
                                  <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-xs">
                                    {plan.operator.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="text-[18px] font-['Gilroy-SemiBold'] text-[#1B1717] mb-1">
                                  {plan.price}
                                </div>
                                <div className="font-['Gilroy-Medium'] text-[#1B1717] flex items-center gap-1">
                                  <span className="text-[12px] text-opacity-80 text-[#1B1717]">{plan.data}</span>
                                  <span className="text-[#1B1717] text-[30px] text-center w-2">•</span>
                                  <span className="text-[14px] text-[#1B1717]">{plan.validity}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Search, Filters, Categories and Plans - Single Card */}
              {!selectedPlanForRecharge && (
                <div className="bg-white border border-gray-200  rounded-xl p-4 space-y-4">
                  {/* Search Bar */}
                  <div className="relative font-['Gilroy-Medium']">
                    <Search className="absolute left-4 top-1/2 text-[#1B1717] text-opacity-50 -translate-y-1/2  w-5 h-5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search For A Plan, Eg 249 Or 28 Days"
                      className="w-full pl-12 pr-4 py-3 border text-[#1B1717] text-opacity-80 border-[0.5px] rounded-xl focus:outline-none text-[#1B1717]"
                    />
                  </div>

                  {/* Filter Buttons */}
                  {getFilterButtons().length > 0 && (
                    <div className="flex flex-wrap gap-[17px]">
                      {getFilterButtons().map((filter) => (
                        <button
                          key={filter}
                          type="button"
                          onClick={() => {
                            // Populate search bar with filter text and make button inactive
                            setSearchQuery(filter);
                            setActiveFilter(null);
                          }}
                          className={`px-4 py-2 rounded-lg text-[14px] font-['Gilroy-Medium'] transition ${activeFilter === filter
                            ? "bg-[#039155] text-white"
                            : "bg-gray-100 text-[#1B1717] hover:bg-gray-200"
                            }`}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Category Tabs */}
                  {getCategoryTabs().length > 0 && (
                    <div className="flex gap-4 overflow-x-auto pb-2 mt-[40px] mb-[40px] font-['Gilroy-SemiBold'] border-gray-200 w-fit">
                      {getCategoryTabs().map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => {
                            // For "Recommended", always set it (don't toggle)
                            if (category === "Recommended") {
                              setActiveCategory("Recommended");
                            } else {
                              // For other categories, toggle
                              setActiveCategory(activeCategory === category ? "Recommended" : category);
                            }
                            setActiveFilter(null); // Reset filter when category changes
                          }}
                          className={`text-[14px] font-['Gilroy-Medium'] whitespace-nowrap pb-2 transition relative ${activeCategory === category
                            ? "text-[#039155]"
                            : "text-gray-600 hover:text-[#1B1717]"
                            }`}
                        >
                          {category}
                          {activeCategory === category && (
                            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-[3px] bg-[#039155]" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Detailed Plan Cards - Scrollable Container */}
                  <div className="space-y-4 gap-[18px] max-h-[600px] overflow-y-auto pr-2">
                    {displayDetailedPlans.length > 0 ? (
                      displayDetailedPlans.map((plan) => (
                        <div
                          key={plan.id}
                          onClick={() => setSelectedPlanForRecharge(plan)}
                          className="bg-white border border-[#1B1717] border-opacity-80 border-[0.5px] rounded-xl p-4 hover:shadow-sm transition cursor-pointer"
                        >
                          {/* Top Section */}
                          <div className="flex items-center justify-between pb-3 border-b border-[#1B1717] border-opacity-80 ">
                            {/* Price */}
                            <div className="text-[20px] font-['Gilroy-SemiBold'] text-[#1B1717]">
                              {plan.price}
                            </div>

                            {/* Vertical Divider */}
                            <div className="h-12 w-[1px]  mx-6 bg-[#1B1717] bg-opacity-80" />

                            {/* Validity and Data */}
                            <div className="flex-1 flex gap-6">
                              <div>
                                <div className="text-[14px] font-['Gilroy-Regular'] text-[#1B1717] text-opacity-80 mb-1">
                                  Validity
                                </div>
                                <div className="text-[12px] font-['Gilroy-Regular'] text-[#1B1717]">
                                  {plan.validity}
                                </div>
                              </div>
                              <div>
                                <div className="text-[14px] font-['Gilroy-Regular'] text-[#1B1717] text-opacity-80 mb-1">
                                  Data
                                </div>
                                <div className="text-[12px] font-['Gilroy-Regular'] text-[#1B1717]">
                                  {plan.data}
                                </div>
                              </div>
                            </div>

                            {/* Arrow Icon */}
                            <ChevronRight className="text-[#1B1717] text-opacity-80 w-5 h-5" />
                          </div>

                          {/* Bottom Section */}
                          <div className="pt-3 space-y-1">
                            <div className="text-[14px] font-['Gilroy-Regular'] text-[#1B1717] text-opacity-80">
                              Calls : {plan.calls}
                            </div>
                            <div className="text-[14px] font-['Gilroy-Regular'] text-[#1B1717] text-opacity-80 flex items-center justify-between">
                              <span>Validity : {plan.validityExtra || plan.desc || "N/A"}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedPlan(plan);
                                  setShowDetailsModal(true);
                                }}
                                className="text-[14px] font-['Gilroy-Regular'] text-[#1B1717] cursor-pointer hover:underline"
                              >
                                Details
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-[#1B1717] text-opacity-60">
                        No plans found for this category.
                      </div>
                    )}
                  </div>
                </div>
              )}
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

      {/* Select Operator Modal */}
      {showOperatorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#FFFFFF] rounded-xl w-full max-w-md mx-4 relative">
            {/* Modal Header */}
            <div className="flex items-center justify-center p-4  border-gray-200">
              <h2 className="text-[18px] font-['Gilroy-SemiBold'] text-[#1B1717]">
                Select Operator
              </h2>
              <button
                type="button"
                onClick={() => setShowOperatorModal(false)}
                className="absolute right-2 top-3 w-10 h-10 flex items-center justify-center rounded-xl bg-[#039155] hover:opacity-90 transition"
              >
                <X className="w-6 h-6 text-[#FFFFFF] rounded-full border border-[2.5px] border-[#FFFFFF] p-1" />
              </button>

            </div>

            {/* Operator List */}
            <div className="max-h-[400px] overflow-y-auto">
              {operators.map((operator, index) => (
                <div key={index}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOperator({
                        name: operator.operator,
                        circle: "Karnataka"
                      });
                      setShowOperatorModal(false);
                    }}
                    className="w-full flex items-center gap-3 p-4  transition"
                  >
                    {/* Operator Logo */}
                    <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                      {operator.logo ? (
                        <img
                          src={operator.logo}
                          alt={operator.operator}
                          className="w-12 h-12"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                          {operator.operator.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Operator Name */}
                    <div className="flex-1 text-left">
                      <div className="text-[14px] font-['Gilroy-Medium'] text-[#1B1717]">
                        {operator.operatorType}
                      </div>

                    </div>

                  </button>
                  {index < operators.length - 1 && (
                    <div className="h-[0.5px] bg-[#1B1717] bg-opacity-30 ml-[70px] mr-4" />
                  )}

                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="flex gap-[19px] p-4 border-[#1B1717] mt-[18px] border-opacity-30">
              <button
                type="button"
                onClick={() => setShowOperatorModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-[18px] font-['Gilroy-Medium'] text-[#1B1717] hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setShowOperatorModal(false)}
                className="flex-1 px-4 py-2 bg-[#039155] rounded-lg text-[18px] font-['Gilroy-Medium'] text-white hover:bg-[#027a44] transition"
              >
                Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plan Details Modal */}
      {showDetailsModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md mx-4 relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-gray-200 relative">
              <div className="text-[24px] font-['Gilroy-SemiBold'] text-[#1B1717]">
                {selectedPlan.price}
              </div>
              <button
                type="button"
                onClick={() => setShowDetailsModal(false)}
                className="absolute right-2 top-3 w-10 h-10 flex items-center justify-center rounded-xl bg-[#039155] hover:opacity-90 transition"
              >
                <X className="w-6 h-6 text-[#FFFFFF] rounded-full border border-[2.5px] border-[#FFFFFF] p-1" />
              </button>
            </div>

            {/* Summary Section */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center">
                <div>
                  <div className="text-[14px] font-['Gilroy-Regular'] text-[#1B1717] text-opacity-80 mb-1">
                    Validity
                  </div>
                  <div className="text-[14px] font-['Gilroy-Medium'] text-[#1B1717]">
                    {selectedPlan.validity}
                  </div>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <div className="text-[14px] font-['Gilroy-Regular'] text-[#1B1717] text-opacity-80 mb-1">
                    Data
                  </div>
                  <div className="text-[14px] font-['Gilroy-Medium'] text-[#1B1717]">
                    {selectedPlan.data}
                  </div>
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div className="p-4">
              <div className="text-[18px] font-['Gilroy-SemiBold'] text-[#1B1717] mb-4">
                Plan Summary
              </div>
              {selectedPlan.desc ? (
                <div className="text-[14px] font-['Gilroy-Regular'] text-[#1B1717] text-opacity-80 whitespace-pre-line">
                  {selectedPlan.desc.split('|').map((item, index) => (
                    <div key={index} className="mb-2">
                      • {item.trim()}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-[14px] font-['Gilroy-Regular'] text-[#1B1717] text-opacity-80">
                    • Calls : {selectedPlan.calls}
                  </div>
                  <div className="text-[14px] font-['Gilroy-Regular'] text-[#1B1717] text-opacity-80">
                    • Validity : {selectedPlan.validityExtra || selectedPlan.validity}
                  </div>
                  <div className="text-[14px] font-['Gilroy-Regular'] text-[#1B1717] text-opacity-80">
                    • Data : {selectedPlan.data}
                  </div>
                  <div className="text-[14px] font-['Gilroy-Regular'] text-[#1B1717] text-opacity-80">
                    • Plan Validity : {selectedPlan.validity}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Payment Method Modal */}
      {showPaymentModal && selectedPlanForRecharge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md mx-4 relative">
            {/* Modal Header */}
            <div className="p-4 text-center border-gray-200">
              <h2 className="text-[20px] font-['Gilroy-SemiBold'] text-[#1B1717] mb-1  ">
                Confirm Payment Method
              </h2>
              <p className="text-[16px] font-['Gilroy-Regular'] text-[#1B1717] text-opacity-80">
                Review Your Payment Details
              </p>
            </div>

            {/* Modal Content */}
            <div className="p-4  space-y-4">
              {/* Section Title */}
              <div className="text-[16px] mb-[16px] text-center font-['Gilroy-Medium'] text-[#1B1717]">
                Confirm Recharge Payment
              </div>

              {/* Payment Amount */}
              <div>
                <div className="border-2 border-dashed border-[#1B1717]  border-opacity-80 rounded-lg p-4 text-center">
                  <div className="text-[32px] font-['Gilroy-SemiBold'] text-[#1B1717]">
                    {selectedPlanForRecharge.price.replace('₹', '₹ ')}
                  </div>
                </div>
              </div>

              {/* Recharge Details Summary */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="text-[14px] font-['Gilroy-Regular'] text-[#1B1717] text-opacity-80">
                    Phone Number
                  </div>
                  <div className="text-[14px] font-['Gilroy-Medium'] text-[#1B1717]">
                    {mobileNumber}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-[14px] font-['Gilroy-Regular'] text-[#1B1717] text-opacity-80">
                    Payment Date
                  </div>
                  <div className="text-[14px] font-['Gilroy-Medium'] text-[#1B1717]">
                    {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-[14px] font-['Gilroy-Regular'] text-[#1B1717] text-opacity-80">
                    Validity
                  </div>
                  <div className="text-[14px] font-['Gilroy-Medium'] text-[#1B1717]">
                    {selectedPlanForRecharge.validity}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-[18px] p-4 border-gray-200">
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-[18px] font-['Gilroy-Medium'] text-[#1B1717] hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    // Prepare payment payload
                    const paymentPayload = {
                      mobileNumber: mobileNumber,
                      opcode: operatorData?.opcode || "A",
                      amount: selectedPlanForRecharge.price.replace('₹', '').trim(),
                      circle: operatorData?.circle || "06"
                    };

                    // Call rechargePay API
                    const paymentResponse = await dispatch(rechargePay(paymentPayload));

                    if (paymentResponse?.mobileRechargePay) {
                      const paymentData = paymentResponse.mobileRechargePay;
                      const apiResponse = paymentData.apiResponse || {};

                      // Format date time
                      const dateTime = new Date().toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      });

                      // Store transaction details from API response
                      setTransactionDetails({
                        transactionId: apiResponse.txid?.toString() || paymentData.orderid || 'N/A',
                        bConnectId: apiResponse.opid?.toString() || 'N/A',
                        dateTime: dateTime,
                        amount: apiResponse.amount || paymentPayload.amount,
                        orderid: paymentData.orderid || 'N/A',
                        status: apiResponse.status || 'Success',
                        dr_amount: apiResponse.dr_amount || null
                      });

                      setShowPaymentModal(false);
                      setPaymentSuccess(true);
                    } else {
                      // Handle error case
                      console.error("Payment failed:", paymentResponse);
                      // You might want to show an error message to the user here
                    }
                  } catch (error) {
                    console.error("Error processing payment:", error);
                    // You might want to show an error message to the user here
                  }
                }}
                className="flex-1 px-4 py-2 bg-[#039155] rounded-lg text-[18px] font-['Gilroy-Medium'] text-white hover:bg-[#027a44] transition"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

MobileRecharge.propTypes = {
  onBack: PropTypes.func,
};

export default MobileRecharge;
