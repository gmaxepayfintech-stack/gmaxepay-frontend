import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { HiArrowLeft } from "react-icons/hi2";
import { X } from "lucide-react";
import PropTypes from "prop-types";
import InformationForm from "./components/InformationForm";
import PaymentSuccessScreen from "./components/PaymentSuccessScreen";
import PlanConfirmationCard from "./components/PlanConfirmationCard";
import OperatorInfoCard from "./components/OperatorInfoCard";
import SuggestedPlans from "./components/SuggestedPlans";
import PlanSearchAndFilters from "./components/PlanSearchAndFilters";
import { ButtonLoader } from "../../../../widgets/layout/loader";
import { recentAOneHistory, rechargeAOnePay, rechargeAOnefindOffers, rechargeAOnefindOperator, rechargeAOnefindPlan } from "../../../../redux/action/rechargeAction";

const RecentRechargeCard = ({ recharge }) => {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 hover:shadow-sm transition cursor-pointer">
            <div className="flex items-start gap-3">
                {/* Operator Logo */}
                <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                    {recharge.logo ? (
                        <img
                            src={recharge.logo}
                            alt={recharge.operator}
                            className="w-12 h-12"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-[Gilroy-Semibold] text-sm">
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
                    {recharge.transactionId && (
                        <div className="text-[10px] text-gray-400 mt-1 truncate">
                            Txn ID: {recharge.transactionId}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

RecentRechargeCard.propTypes = {
    recharge: PropTypes.object.isRequired,
};

const AOneRecharge = ({ onBack }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { recentAOneHistory: recentHistoryData } = useSelector((state) => state.recharge);
    const [recentRecharges, setRecentRecharges] = useState([]);
    const [mobileNumber, setMobileNumber] = useState("");
    const [step, setStep] = useState("input"); // "input" or "plans"
    const [selectedOperator, setSelectedOperator] = useState({
        name: "Airtel",
        circle: "Karnataka",
    });
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
    const [isLoadingProceed, setIsLoadingProceed] = useState(false);
    const [isLoadingPayment, setIsLoadingPayment] = useState(false);
    const [operatorData, setOperatorData] = useState(null);

    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(() => {
        const fetchRecentHistory = async () => {
            const payload = {
                query: {
                    serviceType: "Mobile2Recharge",
                },
                customSearch: {},
                options: {
                    page: 1,
                    paginate: 10,
                    sort: {
                        id: -1,
                    },
                },
            };

            try {
                const response = await dispatch(recentAOneHistory(payload));
                console.log("Recent History Response:", response);
            } catch (error) {
                console.error("Error fetching recent history:", error);
            }
        };

        fetchRecentHistory();
    }, [dispatch]);

    useEffect(() => {
        const historyList = recentHistoryData?.recentHistory || [];

        if (Array.isArray(historyList) && historyList.length > 0) {
            const mappedHistory = historyList.map((item) => {
                const date = new Date(item.createdAt || Date.now());
                const formattedDate = date.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                });

                // Determine operator details based on opcode
                let logo = "";
                let operatorName = item.operator || "Unknown";

                const opcode = item.opcode || "";
                // Map common opcodes
                /* 
                   A -> Airtel
                   J -> Jio
                   B -> BSNL
                   V -> VI
                */
                if (opcode === "J" || opcode === "Jio" || opcode === "JIO" || opcode === "RC" || opcode.includes("Jio")) {
                    logo = "/img/Jio.svg";
                    operatorName = "Jio";
                } else if (opcode === "A" || opcode === "Airtel" || opcode === "AIRTEL" || opcode.includes("Airtel")) {
                    logo = "/img/Airtel.svg";
                    operatorName = "Airtel";
                } else if (opcode === "B" || opcode === "BT" || opcode === "BR" || opcode === "BSNL" || opcode === "BSNL" || opcode.includes("BSNL")) {
                    logo = "/img/BSNL.svg";
                    operatorName = "BSNL";
                } else if (opcode === "V" || opcode === "VI" || opcode === "Vi" || opcode.includes("VI") || opcode.includes("Vi")) {
                    logo = "/img/VIPrepaid.svg";
                    operatorName = "VI";
                }

                return {
                    id: item._id || item.transactionId || Math.random(),
                    operator: operatorName,
                    operatorType: `${operatorName} Prepaid`,
                    mobileNumber: item.mobileNumber || item.number || "",
                    lastRecharge: `Last Recharge ₹${item.amount} On ${formattedDate}`,
                    logo: logo,
                    transactionId: item.transactionId || ""
                };
            });
            setRecentRecharges(mappedHistory);
        }
    }, [recentHistoryData]);

    // Get unique operators from recent recharges
    const sourceRecharges = recentRecharges;
    const operators = sourceRecharges.reduce((acc, recharge) => {
        if (!acc.find((op) => op.operator === recharge.operator)) {
            acc.push({
                operator: recharge.operator,
                operatorType: recharge.operatorType,
                logo: recharge.logo,
            });
        }
        return acc;
    }, []);

    // Helper function to extract suggested plans from offers API response
    const getSuggestedPlansFromOffers = () => {
        // Handle nested data structure: offers are in rechargeOffers.data (array)
        const offersArray = rechargeOffers?.data || [];
        if (!Array.isArray(offersArray) || offersArray.length === 0) {
            return [];
        }

        // Get first 3 offers
        const offers = offersArray.slice(0, 3);

        return offers.map((offer, index) => {
            const offerText = offer.offer || "";

            // Extract data from offer text - try multiple patterns
            let dataText = "N/A";
            const dataPatterns = [
                /(\d+(?:\.\d+)?\s*GB)\s+data/i, // "2GB data", "12GB data"
                /(Unlimited\s+data)/i, // "Unlimited data"
                /=\s*(\d+(?:\.\d+)?\s*GB)/i, // "=2GB", "=12GB" (from after =)
                /(\d+(?:\.\d+)?\s*GB)/i, // Just "2GB", "12GB" anywhere
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
                /(\d+\s*(?:day|days|Day|Days))/i, // "1 day", "30 days", "28 Day"
                /(\d+)\s*M\b/i, // "1M", "6M" (months) - word boundary
                /(\d+)\s*D\b/i, // "28D", "56D" (days) - word boundary
                /=\s*.*?(\d+\s*(?:day|days|Day|Days|month|Month|M|D))/i, // From after "="
            ];

            for (const pattern of validityPatterns) {
                const match = offerText.match(pattern);
                if (match) {
                    let validity = match[1].trim();
                    // Format validity text
                    if (
                        /\d+\s*M\b/i.test(validity) &&
                        !validity.toLowerCase().includes("month")
                    ) {
                        validityText = validity.replace(/\s*M\b/i, " Month");
                    } else if (
                        /\d+\s*D\b/i.test(validity) &&
                        !validity.toLowerCase().includes("day")
                    ) {
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
                originalOffer: offer, // Store original offer data for reference
            };
        });
    };

    // Get suggested plans (only show if API data is available, don't show default)
    const displaySuggestedPlans = rechargeOffers
        ? getSuggestedPlansFromOffers()
        : [];

    // Helper function to transform API plan to UI format
    const transformPlanToUIFormat = (plan, index) => {
        // Handle offers (which have 'offer' field instead of 'desc') - Only for Airtel
        if ((plan.Type === "Offer" || plan.originalOffer) && selectedOperator?.name?.toUpperCase().includes("AIRTEL")) {
            const offer = plan.originalOffer || plan;
            const offerText = offer.offer || "";

            // Extract data from offer text - Look for patterns like "2GB/D", "2GB/day", "6GB data", "50GB data"
            let dataText = "N/A";
            const dataPatterns = [
                /(\d+(?:\.\d+)?\s*GB\/D)/i, // "2GB/D", "2.5GB/D" - prioritize this
                /(\d+(?:\.\d+)?\s*GB\/day)/i, // "2GB/day" - prioritize this
                /(\d+(?:\.\d+)?\s*GB)\s+data/i, // "6GB data", "50GB data"
                /(Unlimited\s+data)/i, // "Unlimited data"
                /=\s*(\d+(?:\.\d+)?\s*GB)/i, // "=2GB" (from after =)
                /(\d+(?:\.\d+)?\s*GB)/i, // Just "2GB", "12GB" anywhere (fallback)
            ];

            for (const pattern of dataPatterns) {
                const match = offerText.match(pattern);
                if (match && match[1]) {
                    dataText = match[1].trim();
                    break;
                }
            }


            // Extract validity from offer text - Look for "28D", "1M", "56D", "84 days", "1 month"
            let validityText = "N/A";

            // Prioritize patterns after "=" as they're more accurate
            // Find all matches after "=" and take the LAST one (most accurate)
            const afterEquals = offerText.split("=")[1];
            if (afterEquals) {
                // Match all D or M patterns after "="
                const allDMatches = afterEquals.match(/(\d+)\s*D\b/gi);
                const allMMatches = afterEquals.match(/(\d+)\s*M\b/gi);

                // Take the last match (most accurate validity)
                if (allMMatches && allMMatches.length > 0) {
                    const lastM = allMMatches[allMMatches.length - 1].trim();
                    validityText = lastM.replace(/\s*M\b/i, " Month");
                } else if (allDMatches && allDMatches.length > 0) {
                    const lastD = allDMatches[allDMatches.length - 1].trim();
                    validityText = lastD.replace(/\s*D\b/i, " Day");
                }
            }

            // If not found after "=", try other patterns
            if (validityText === "N/A") {
                const validityPatterns = [
                    /(\d+\s*(?:day|days|Day|Days))/i, // "1 day", "30 days", "84 days"
                    /(\d+\s*(?:month|months|Month|Months))/i, // "1 month", "6 months"
                    /(\d+)\s*D\b/i, // "28D", "56D", "84D" - word boundary to avoid matching "2GB/D"
                    /(\d+)\s*M\b/i, // "1M", "6M" - word boundary
                ];

                for (const pattern of validityPatterns) {
                    const match = offerText.match(pattern);
                    if (match && match[1]) {
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
            }


            // Extract calls/UL 5G information from offer text
            let callsText = "N/A";
            const callsPatterns = [
                /(UL\s*5G)/i, // "UL 5G"
                /(Get\s+UL\s*5G)/i, // "Get UL 5G"
                /(Unltd\s+calls)/i, // "Unltd calls"
                /(Unlimited\s+calls)/i, // "Unlimited calls"
                /(ULCL)/i, // "ULCL"
            ];

            for (const pattern of callsPatterns) {
                const match = offerText.match(pattern);
                if (match) {
                    callsText = match[1].trim();
                    break;
                }
            }

            return {
                id: plan.id || `offer-${index}`,
                price: plan.price || `₹${offer.amount}`,
                validity: (plan.validity && plan.validity !== "N/A") ? plan.validity : validityText,
                data: (plan.data && plan.data !== "N/A") ? plan.data : dataText,
                calls: callsText,
                validityExtra: offerText, // Full offer text
                planName: "Offer",
                desc: offerText, // Full offer text
                originalPlan: offer,
                rs: offer.amount,
            };
        }

        // Handle offers for non-Airtel operators (fallback to original logic)
        if (plan.Type === "Offer" || plan.originalOffer) {
            const offer = plan.originalOffer || plan;
            const offerText = offer.offer || "";

            // Extract data from offer text
            let dataText = "N/A";
            const dataPatterns = [
                /(\d+(?:\.\d+)?\s*GB)\s+data/i,
                /(Unlimited\s+data)/i,
                /=\s*(\d+(?:\.\d+)?\s*GB)/i,
                /(\d+(?:\.\d+)?\s*GB)/i,
            ];

            for (const pattern of dataPatterns) {
                const match = offerText.match(pattern);
                if (match) {
                    dataText = match[1].trim();
                    break;
                }
            }

            // Extract validity from offer text
            let validityText = "N/A";
            const validityPatterns = [
                /(\d+\s*(?:day|days|Day|Days))/i,
                /(\d+)\s*M\b/i,
                /(\d+)\s*D\b/i,
                /=\s*.*?(\d+\s*(?:day|days|Day|Days|month|Month|M|D))/i,
            ];

            for (const pattern of validityPatterns) {
                const match = offerText.match(pattern);
                if (match) {
                    let validity = match[1].trim();
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
                id: plan.id || `offer-${index}`,
                price: plan.price || `₹${offer.amount}`,
                validity: plan.validity || validityText,
                data: plan.data || dataText,
                calls: "N/A",
                validityExtra: offerText,
                planName: "Offer",
                desc: offerText,
                originalPlan: offer,
                rs: offer.amount,
            };
        }

        // Extract data from desc field - handles multiple formats (Airtel and Jio)
        let dataText = "N/A";

        // Helper function to clean extracted data text
        const cleanDataText = (text) => {
            if (!text) return "N/A";
            let cleaned = text.trim();

            // Stop at "thereafter" or "then" or "after" clauses
            const stopPatterns = [
                /thereafter/i,
                /\s+then\s+/i,
                /\s+after\s+/i,
                /\s+at\s+64/i,
                /\s+@\s*64/i,
            ];

            for (const pattern of stopPatterns) {
                const match = cleaned.search(pattern);
                if (match !== -1) {
                    cleaned = cleaned.substring(0, match).trim();
                }
            }

            // Stop at numbered list items (e.g., "2. Subscription")
            const numberedMatch = cleaned.match(/^(.+?)(?:\s*\d+\.\s+)/);
            if (numberedMatch) {
                cleaned = numberedMatch[1].trim();
            }

            // Stop at "Note -" or "Note:"
            const noteMatch = cleaned.match(/^(.+?)(?:\s*Note\s*[-:])/i);
            if (noteMatch) {
                cleaned = noteMatch[1].trim();
            }

            // Remove trailing periods, commas, and extra spaces
            cleaned = cleaned.replace(/[.,]\s*$/, "").trim();

            return cleaned || "N/A";
        };

        // Pattern 1: "Data : 50GB" (Airtel format)
        const dataMatch1 = plan.desc?.match(/Data\s*:\s*([^|]+)/i);
        if (dataMatch1) {
            dataText = cleanDataText(dataMatch1[1]);
        } else {
            // Pattern 2: "Unlimited data - 28GB(2GB/Day)" or "UNLIMITED DATA - 42 GB (1.5GB/Day)" (Jio format)
            const unlimitedDataMatch = plan.desc?.match(
                /(?:Unlimited|UNLIMITED)\s+[Dd]ata\s*[-\s]+\s*([^,|]+)/i,
            );
            if (unlimitedDataMatch) {
                dataText = cleanDataText(unlimitedDataMatch[1]);
            } else {
                // Pattern 3: "Unlimited Data ( 3GB 4G/5G data thereafter unlimited at 64Kbps)" (Jio format with parentheses)
                const unlimitedDataParenMatch = plan.desc?.match(
                    /Unlimited\s+Data\s*\(\s*([^)]+)/i,
                );
                if (unlimitedDataParenMatch) {
                    dataText = cleanDataText(unlimitedDataParenMatch[1]);
                } else {
                    // Pattern 4: "5 GB 4G/5G Data thereafter unlimited" (Jio standalone format)
                    const standaloneDataMatch = plan.desc?.match(
                        /(\d+(?:\s*\.\d+)?\s*(?:GB|MB|TB)(?:\s*[^,|thereafter]+)?)/i,
                    );
                    if (standaloneDataMatch) {
                        dataText = cleanDataText(standaloneDataMatch[1]);
                    } else {
                        // Pattern 5: Any data amount with GB/MB/TB (fallback)
                        const fallbackDataMatch = plan.desc?.match(
                            /(\d+(?:\.\d+)?\s*(?:GB|MB|TB))/i,
                        );
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
            const unlimitedVoiceMatch = plan.desc?.match(
                /(Unlimited\s+Voice(?:\s+Calls)?|UNLIMITED\s+Voice\s+Calls)/i,
            );
            if (unlimitedVoiceMatch) {
                callsText = unlimitedVoiceMatch[1].trim();
            } else {
                // Pattern 3: "Unlimited local, STD & Roaming" (Airtel format without "Calls :")
                const unlimitedLocalMatch = plan.desc?.match(
                    /(Unlimited\s+local[^,|]+)/i,
                );
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
        const benefitMatch = plan.desc?.match(
            /Additional\s+(?:Benefit|Benenifit)\s*:\s*(.+)/i,
        );
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
            originalPlan: plan,
        };
    };

    // Helper function to get all plans from all categories dynamically
    const getAllPlansFromData = (plansData) => {
        const allPlans = [];
        // Iterate through all keys in plansData to get plans from all categories
        Object.keys(plansData).forEach((key) => {
            if (Array.isArray(plansData[key])) {
                allPlans.push(...plansData[key]);
            }
        });
        return allPlans;
    };

    // Get operator-specific category mapping
    const getCategoryTypeMapping = () => {
        const operatorName = selectedOperator?.name?.toUpperCase() || "";

        // Jio mapping
        if (operatorName.includes("JIO") || operatorName.includes("RELIANCE")) {
            return {
                Internet: ["Internet"],
                DATA: ["Data Packs"],
                Entertainment: ["Entertainment Plans"],
                "Truly Unlimited": ["FULLTT Plans", "True 5G Unlimited Plans"],
                "Plan Vouchers": ["Plan Vouchers"],
                Talktime: ["Top-up", "TOPUP"],
                "International Roaming": ["International Roaming"],
                ISD: ["ISD"],
            };
        }

        // Airtel mapping
        if (operatorName.includes("AIRTEL")) {
            return {
                Internet: ["Internet"],
                DATA: ["Internet", "DATA"], // Internet is used for DATA in Airtel
                Entertainment: ["Entertainment"],
                "Truly Unlimited": ["Truly Unlimited"],
                "Plan Vouchers": ["Plan Vouchers"],
                Talktime: ["Talktime"],
            };
        }

        // VI/Vodafone mapping
        if (
            operatorName.includes("VI") ||
            operatorName.includes("VODAFONE") ||
            operatorName.includes("IDEA")
        ) {
            return {
                DATA: ["Data"],
                Entertainment: ["Entertainment"],
                "Truly Unlimited": ["Unlimited"],
                "Plan Vouchers": ["Plan Voucher"],
                Talktime: ["Talktime"],
                "International Roaming": ["Roaming"],
                Voice: ["Voice"],
            };
        }

        // BSNL mapping
        if (operatorName.includes("BSNL")) {
            return {
                DATA: ["Data Vouchers"],
                "Truly Unlimited": ["FULLTT"],
                "Plan Vouchers": ["Voice Vouchers"],
                Talktime: ["General TopUp"],
                ISD: ["ISD Vouchers"],
                "International Roaming": ["Other Vouchers"],
            };
        }

        // Default mapping (fallback)
        return {
            Internet: ["Internet"],
            DATA: ["Data Packs", "DATA", "Data"],
            Entertainment: ["Entertainment Plans", "Entertainment"],
            "Truly Unlimited": [
                "FULLTT Plans",
                "True 5G Unlimited Plans",
                "Truly Unlimited",
                "Unlimited",
            ],
            "Plan Vouchers": ["Plan Vouchers", "PlanVoucher", "Plan Voucher"],
            Talktime: ["Top-up", "TOPUP", "Talktime"],
        };
    };

    // Get operator-specific allowed categories
    const getAllowedCategories = () => {
        const operatorName = selectedOperator?.name?.toUpperCase() || "";

        // Jio categories
        if (operatorName.includes("JIO") || operatorName.includes("RELIANCE")) {
            return [
                "Recommended",
                "Internet",
                "DATA",
                "Entertainment",
                "Truly Unlimited",
                "Plan Vouchers",
                "Talktime",
                "International Roaming",
                "ISD",
            ];
        }

        // Airtel categories
        if (operatorName.includes("AIRTEL")) {
            return [
                "Recommended",
                "Internet",
                "DATA",
                "Entertainment",
                "Truly Unlimited",
                "Plan Vouchers",
                "Talktime",
                "Offers",
            ];
        }

        // VI/Vodafone categories
        if (
            operatorName.includes("VI") ||
            operatorName.includes("VODAFONE") ||
            operatorName.includes("IDEA")
        ) {
            return [
                "Recommended",
                "DATA",
                "Entertainment",
                "Truly Unlimited",
                "Plan Vouchers",
                "Talktime",
                "International Roaming",
                "Voice",
            ];
        }

        // BSNL categories
        if (operatorName.includes("BSNL")) {
            return [
                "Recommended",
                "DATA",
                "Truly Unlimited",
                "Plan Vouchers",
                "Talktime",
                "ISD",
                "International Roaming",
            ];
        }

        // Default categories
        return [
            "Recommended",
            "Internet",
            "DATA",
            "Entertainment",
            "Truly Unlimited",
            "Plan Vouchers",
            "Talktime",
        ];
    };

    const getActualPlansData = () => {
        if (!rechargePlans) return {};
        if (rechargePlans.data && rechargePlans.data.data) {
            return rechargePlans.data.data;
        }
        if (rechargePlans.data) {
            return rechargePlans.data;
        }
        return rechargePlans;
    };

    // Get category tabs - dynamic categories from API response
    const getCategoryTabs = () => {
        const actualPlansData = getActualPlansData();

        if (!actualPlansData || Object.keys(actualPlansData).length === 0) {
            return ["Recommended"];
        }

        const availableCategories = ["Recommended"];

        // Add keys from actualPlansData that have plans in them
        Object.keys(actualPlansData).forEach((key) => {
            if (Array.isArray(actualPlansData[key]) && actualPlansData[key].length > 0) {
                availableCategories.push(key);
            }
        });

        // Handle Offers category separately
        const offersArray = rechargeOffers?.data || [];
        if (Array.isArray(offersArray) && offersArray.length > 0) {
            availableCategories.push("Offers");
        }

        return availableCategories;
    };

    // Helper function to get plans based on category
    const getPlansByCategory = () => {
        const actualPlansData = getActualPlansData();

        if (!actualPlansData || Object.keys(actualPlansData).length === 0) {
            return [];
        }

        let selectedPlans = [];

        // If "Recommended" is selected, show all plans
        if (activeCategory === "Recommended" || !activeCategory) {
            selectedPlans = getAllPlansFromData(actualPlansData);
        } else if (activeCategory === "Offers") {
            // Handle Offers category - transform offers to plan format
            const offersData = rechargeOffers?.data || [];
            if (Array.isArray(offersData) && offersData.length > 0) {
                selectedPlans = offersData.map((offer, index) => {
                    return {
                        id: `offer-${index}`,
                        price: `₹${offer.amount}`,
                        rs: offer.amount,
                        validity: "N/A",
                        desc: offer.offer || "",
                        data: "N/A",
                        Type: "Offer",
                        originalOffer: offer,
                    };
                });
            }
        } else if (actualPlansData[activeCategory]) {
            // Get plans from the specific API category directly
            selectedPlans = actualPlansData[activeCategory] || [];
        } else {
            // Fallback: search all plans and filter by Type
            const allPlans = getAllPlansFromData(actualPlansData);
            selectedPlans = allPlans.filter((plan) => plan.Type === activeCategory);
        }

        return selectedPlans;
    };

    // Get filter buttons (static buttons)
    const getFilterButtons = () => {
        return ["28 Days Validity", "1 GB Data", "2 GB Data", "Unlimited Data 5G"];
    };

    // Map display text to filter value
    const getFilterValue = (displayText) => {
        const filterMap = {
            "28 Days Validity": "28Days",
            "1 GB Data": "1GB",
            "2 GB Data": "2GB",
            "Unlimited Data 5G": "Unlimited Data",
        };
        return filterMap[displayText] || displayText;
    };

    // Map category display name to value to send/use
    const getCategoryValue = (categoryName) => {
        const categoryMap = {
            Recommended: "", // or whatever value you want for Recommended
            Internet: "", // tell me what value to use
            DATA: "", // tell me what value to use
            Entertainment: "", // tell me what value to use
            "Truly Unlimited": "", // tell me what value to use
            "Plan Vouchers": "", // tell me what value to use
            Talktime: "", // tell me what value to use
        };
        return categoryMap[categoryName] || categoryName;
    };

    // Apply filters and search
    const getFilteredPlans = () => {
        let plans = getPlansByCategory();

        // Apply search filter
        if (searchQuery) {
            // Get the filter value (transformed) for searching, but keep display text in input
            const filterValue = getFilterValue(searchQuery);
            const query = filterValue.toLowerCase();
            plans = plans.filter((plan) => {
                const price = plan.rs?.toString() || "";
                const validity = plan.validity?.toLowerCase() || "";
                const desc = plan.desc?.toLowerCase() || "";
                const type = plan.Type?.toLowerCase() || "";
                return (
                    price.includes(query) ||
                    validity.includes(query) ||
                    desc.includes(query) ||
                    type.includes(query)
                );
            });
        }

        // Apply active filter by Type
        if (activeFilter) {
            plans = plans.filter((plan) => plan.Type === activeFilter);
        }

        // Transform to UI format
        return plans.map((plan, index) => transformPlanToUIFormat(plan, index));
    };

    // Get filtered plans for display (only show if API data is available, don't show default)
    // Include offers when "Offers" category is selected
    const displayDetailedPlans = (rechargePlans || (activeCategory === "Offers" && rechargeOffers))
        ? getFilteredPlans()
        : [];

    const handleProceed = async (number = null) => {
        const numberToUse = number || mobileNumber;
        if (!numberToUse || numberToUse.length !== 10) {
            return;
        }
        setIsLoadingProceed(true);
        try {
            // Call the API to find operator with mobile number
            const operatorResponse = await dispatch(
                rechargeAOnefindOperator({ mobileNumber: numberToUse }),
            );

            // Update selectedOperator with the response data
            if (operatorResponse?.mobileOperator) {
                const operatorDataFromResponse = operatorResponse.mobileOperator;
                // Store operator data for later use (payment)
                setOperatorData(operatorDataFromResponse);
                setSelectedOperator({
                    name: operatorDataFromResponse.company || "Airtel",
                    circle: operatorDataFromResponse.circle || "Karnataka",
                });

                // Call rechargefindPlan with the required payload
                const planPayload = {
                    mobileNumber: numberToUse,
                    opCode:
                        operatorDataFromResponse?.operatorCode ||
                        operatorDataFromResponse?.company_code,
                    circle: operatorDataFromResponse.circle_code || "06",
                };

                const planResponse = await dispatch(rechargeAOnefindPlan(planPayload));

                // Check if plan API call was successful
                if (
                    planResponse?.status !== "SUCCESS" ||
                    !planResponse?.mobileRechargePlan
                ) {
                    console.error("Failed to fetch recharge plans");
                    // Don't proceed to next step if plan API fails
                    setIsLoadingProceed(false);
                    return;
                }

                // Store the plans data
                // API response structure: { status, message, data: { status, Operator, message, data: { DATA: [...], STV: [...], ... } } }
                // Action extracts response.data.data and returns: { mobileRechargePlan: { status, Operator, message, data: { DATA: [...], STV: [...], ... }, txid }, status, message }
                const planData = planResponse.mobileRechargePlan;

                // Extract the nested data object that contains the plan categories (DATA, STV, FULLTT, etc.)
                // The plan categories are in planData.data
                const plansData = planData?.data || {};

                // console.log("📊 Plan response:", planResponse);
                // console.log("📊 Plan data:", planData);
                // console.log("📊 Plans data (nested):", plansData);
                // console.log("📊 Plan categories:", Object.keys(plansData));

                // Store with the nested data structure: { data: { DATA: [...], STV: [...], ... } }
                setRechargePlans({ data: plansData });

                // Call offers optional - don't block if offers fail
                try {
                    const offersResponse = await dispatch(rechargeAOnefindOffers(planPayload));

                    // Store the offers data
                    // API response structure: { status, message, data: { status, mobile, message, data: [...], txid } }
                    // Action extracts response.data.data and returns: { mobileRechargeOffers: { status, mobile, message, data: [...], txid }, status, message }
                    if (offersResponse?.mobileRechargeOffers) {
                        const offersData = offersResponse.mobileRechargeOffers;
                        // The offers array is in offersData.data
                        // console.log("📊 Offers response:", offersResponse);
                        // console.log("📊 Offers data:", offersData);
                        // console.log("📊 Offers array:", offersData?.data);
                        setRechargeOffers(offersData);
                    }
                } catch (offerError) {
                    console.warn("Failed to fetch offers, proceeding with plans:", offerError);
                }

                // Move to plan selection step only if plans were successfully fetched
                setStep("plans");
            }
            setIsLoadingProceed(false);
        } catch (error) {
            console.error("Error finding operator or plans:", error);
            setIsLoadingProceed(false);
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
        <div className="w-full py-4 px-1">
            {/* Header */}
            <div className="flex items-start gap-3 mb-6">
                <button
                    type="button"
                    aria-label="Back"
                    onClick={() => {
                        if (onBack) {
                            onBack();
                        } else {
                            navigate("/retailerDashboard/services");
                        }
                    }}
                    className="flex items-center justify-center w-10 h-10 border border-gray-400 rounded-full mr-2 bg-white hover:bg-gray-50 transition"
                >
                    <HiArrowLeft className="text-2xl text-[#1B1717] opacity-80" />
                </button>
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
                <div
                    className={`${step === "input" ? "bg-white rounded-xl border border-gray-200 p-6" : ""} lg:flex-[1.6] w-full lg:w-auto self-start`}
                >
                    {step === "input" ? (
                        <InformationForm
                            handleCancel={handleCancel}
                            handleProceed={(number) => {
                                setMobileNumber(number);
                                handleProceed(number);
                            }}
                            isLoadingProceed={isLoadingProceed}
                        />
                    ) : (
                        <div className="space-y-4">
                            {/* Show success screen when payment is successful and transaction details are available */}
                            {paymentSuccess && transactionDetails ? (
                                <PaymentSuccessScreen
                                    transactionDetails={transactionDetails}
                                    mobileNumber={mobileNumber}
                                    selectedPlanForRecharge={selectedPlanForRecharge}
                                    selectedOperator={selectedOperator}
                                />
                            ) : selectedPlanForRecharge ? (
                                <PlanConfirmationCard
                                    selectedOperator={selectedOperator}
                                    mobileNumber={mobileNumber}
                                    selectedPlanForRecharge={selectedPlanForRecharge}
                                    setSelectedPlanForRecharge={setSelectedPlanForRecharge}
                                    setShowPaymentModal={setShowPaymentModal}
                                    isLoadingPayment={isLoadingPayment}
                                />
                            ) : (
                                <>
                                    <OperatorInfoCard
                                        selectedOperator={selectedOperator}
                                        mobileNumber={mobileNumber}
                                        setShowOperatorModal={setShowOperatorModal}
                                    />

                                    <SuggestedPlans
                                        displaySuggestedPlans={displaySuggestedPlans}
                                        setSelectedPlanForRecharge={setSelectedPlanForRecharge}
                                    />
                                </>
                            )}

                            {/* Search, Filters, Categories and Plans - Single Card */}
                            {!selectedPlanForRecharge && (
                                <PlanSearchAndFilters
                                    searchQuery={searchQuery}
                                    setSearchQuery={setSearchQuery}
                                    activeFilter={activeFilter}
                                    setActiveFilter={setActiveFilter}
                                    activeCategory={activeCategory}
                                    setActiveCategory={setActiveCategory}
                                    getFilterButtons={getFilterButtons}
                                    getFilterValue={getFilterValue}
                                    getCategoryTabs={getCategoryTabs}
                                    displayDetailedPlans={displayDetailedPlans}
                                    setSelectedPlanForRecharge={setSelectedPlanForRecharge}
                                    setSelectedPlan={setSelectedPlan}
                                    setShowDetailsModal={setShowDetailsModal}
                                />
                            )}
                        </div>
                    )}
                </div>

                {/* Right Side - Recent Recharge */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 lg:flex-[1] h-[calc(100vh-120px)] flex flex-col">
                    <div className="text-[20px] font-['Gilroy-Medium'] text-[#1B1717] mb-6 flex-shrink-0">
                        Recent Recharge
                    </div>

                    <div className="overflow-y-auto flex-1">
                        {recentRecharges.length > 0 ? (
                            recentRecharges.map((recharge) => (
                                <button
                                    key={recharge.id}
                                    type="button"
                                    onClick={() => handleRecentRechargeClick(recharge)}
                                    className="w-full text-left"
                                >
                                    <RecentRechargeCard recharge={recharge} />
                                </button>
                            ))
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500 font-['Gilroy-Medium']">
                                No recent recharges found
                            </div>
                        )}
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
                                <X className="w-6 h-6 text-[#FFFFFF] rounded-full  border-[2.5px] border-[#FFFFFF] p-1" />
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
                                                circle: "Karnataka",
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
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-[Gilroy-Semibold] text-sm">
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
                                <X className="w-6 h-6 text-[#FFFFFF] rounded-full   border-[2.5px] border-[#FFFFFF] p-1" />
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
                                    {selectedPlan.desc.split("|").map((item, index) => (
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
                                        • Validity :{" "}
                                        {selectedPlan.validityExtra || selectedPlan.validity}
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
                                        {selectedPlanForRecharge.price.replace("₹", "₹ ")}
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
                                        {new Date()
                                            .toLocaleDateString("en-GB", {
                                                day: "2-digit",
                                                month: "2-digit",
                                                year: "numeric",
                                            })
                                            .replace(/\//g, "-")}
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
                                    setIsLoadingPayment(true);
                                    try {
                                        // Prepare payment payload
                                        const paymentPayload = {
                                            mobileNumber: mobileNumber,
                                            opcode:
                                                operatorData?.operatorCode ||
                                                operatorData?.company_code,
                                            amount: selectedPlanForRecharge.price
                                                .replace("₹", "")
                                                .trim(),
                                            circle: operatorData?.circle_code || "06",
                                        };

                                        // Call rechargePay API
                                        const paymentResponse = await dispatch(
                                            rechargeAOnePay(paymentPayload),
                                        );

                                        // Updated to match new API response structure
                                        if (
                                            (paymentResponse?.status === "SUCCESS" || paymentResponse?.status === "FAILURE") &&
                                            paymentResponse?.mobileRechargePay
                                        ) {
                                            const responseData = paymentResponse.mobileRechargePay;
                                            const apiResponse = responseData.apiResponse || {};

                                            // Format date time
                                            const dateTime = new Date().toLocaleString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                hour12: true,
                                            });

                                            // Store transaction details from API response
                                            const transactionData = {
                                                transactionId:
                                                    apiResponse.txid?.toString() ||
                                                    responseData.transactionId ||
                                                    responseData.orderid ||
                                                    "N/A",
                                                bConnectId: apiResponse.opid?.toString() || "N/A",
                                                dateTime: dateTime,
                                                amount: apiResponse.amount || paymentPayload.amount,
                                                orderid: responseData.orderid || "N/A",
                                                status: apiResponse.status || paymentResponse.status || "Failure",
                                                dr_amount: apiResponse.dr_amount || null,
                                                number: apiResponse.number || mobileNumber,
                                            };

                                            // Set states to show success/failure screen
                                            setTransactionDetails(transactionData);
                                            setShowPaymentModal(false);
                                            setPaymentSuccess(true);
                                        } else {
                                            // Handle other failure cases (no responseData from server)
                                            const dateTime = new Date().toLocaleString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                hour12: true,
                                            });
                                            const transactionData = {
                                                transactionId: "N/A",
                                                bConnectId: "N/A",
                                                dateTime: dateTime,
                                                amount: paymentPayload.amount,
                                                orderid: "N/A",
                                                status: paymentResponse?.status || "Failure",
                                                dr_amount: null,
                                                number: mobileNumber,
                                            };
                                            setTransactionDetails(transactionData);
                                            setShowPaymentModal(false);
                                            setPaymentSuccess(true);
                                        }
                                    } catch (error) {
                                        console.error("Error processing payment:", error);
                                        const dateTime = new Date().toLocaleString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: true,
                                        });
                                        const transactionData = {
                                            transactionId: "N/A",
                                            bConnectId: "N/A",
                                            dateTime: dateTime,
                                            amount: selectedPlanForRecharge.price.replace("₹", "").trim(),
                                            orderid: "N/A",
                                            status: "Failure",
                                            dr_amount: null,
                                            number: mobileNumber,
                                        };
                                        setTransactionDetails(transactionData);
                                        setShowPaymentModal(false);
                                        setPaymentSuccess(true);
                                    } finally {
                                        setIsLoadingPayment(false);
                                    }
                                }}
                                disabled={isLoadingPayment}
                                className={`flex-1 px-4 py-2 bg-[#039155] rounded-lg text-[18px] font-['Gilroy-Medium'] text-white hover:bg-[#027a44] transition flex items-center justify-center ${isLoadingPayment ? "cursor-wait opacity-100" : ""
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
        </div>
    );
};

AOneRecharge.propTypes = {
    onBack: PropTypes.func,
};

export default AOneRecharge;


