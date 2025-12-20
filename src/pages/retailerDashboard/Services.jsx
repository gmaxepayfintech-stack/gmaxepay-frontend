import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import MobileIcon from "../../../public/img/MobileIcon.svg";
import PropTypes from "prop-types";
import { aepsStatusCheck } from "../../redux/action/aepsAction";
import AEPSAccessConfirm from "./AEPSAccessConfirm";


const DEFAULT_DESCRIPTION =
    "You Can Now Recharge Your Mobile Phones And DTH Services in India, You Can Recharge With Any Operator And Also Have Access To The Latest Offers That";

const servicesData = [
    { id: "mobile-dth", title: "Mobile & DTH Recharge", status: "available" },
    { id: "Aeps", title: "AEPS", status: "available" },
    { id: "dmt-1", title: "DMT-1", status: "available" },
    { id: "dmt-2", title: "DMT-2", status: "available" },
    { id: "micro-atm", title: "Micro ATM", status: "available" },
    { id: "cms-1", title: "CMS-1", status: "available" },
    { id: "cms-2", title: "CMS-2", status: "available" },
    { id: "bbps", title: "BBPS", status: "available" },
    { id: "unified-dmt", title: "Unified DMT", status: "available" },
    { id: "dmt", title: "DMT", status: "available" },
    { id: "dmt-11", title: "DMT-1", status: "available" },
    { id: "pan-card", title: "Pan Card Creation", status: "subscribed" },
    { id: "aeps-cash-deposit", title: "AEPS Cash Deposit", status: "subscribed" },
    { id: "indo-nepal-dmt", title: "Indo-Nepal DMT", status: "subscribed" },
    { id: "toto-play", title: "Tata Play Connection", status: "subscribed" },
].map((s) => ({ ...s, description: DEFAULT_DESCRIPTION }));

const ServiceCard = ({ title, description, onClick }) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className="bg-[#FFFFFF] rounded-xl shadow-sm border border-gray-100 px-6 py-4 min-h-[182px] relative text-left hover:shadow-md transition"
        >
            <div className="flex gap-3">
                <div className="w-[60px] h-[60px] rounded-full bg-[#DBEAFE] flex items-center justify-center shrink-0">
                    <img src={MobileIcon} alt="MobileIcon" className="w-[32px] h-[32px]" />
                </div>
                <div className="min-w-0 flex flex-col justify-center">
                    <div className="text-[18px] font-['Gilroy-Medium'] text-[#1B1717] capitalize">
                        {title}
                    </div>
                    <div className="mt-[12px] text-[12.5px] text-[#000000] font-['Gilroy-Regular'] leading-relaxed line-clamp-4 capitalize">
                        {description}
                    </div>
                </div>
            </div>
        </button>
    );
};

ServiceCard.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    onClick: PropTypes.func,
};

const Services = () => {
    const [activeTab, setActiveTab] = useState("Available");
    const [showAepsConfirm, setShowAepsConfirm] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Get aepsStatus from Redux
    const aepsStatus = useSelector(
        (state) => state.aepsReducer?.aepsStatus
    );

    /* -------------------------------------------
        CHECK IF ALL STATUS IS COMPLETED
    --------------------------------------------*/
    const checkIfAllStatusCompleted = (statusData) => {
        if (!statusData) {
            return false;
        }

        // Check all required steps are completed based on response structure
        const aepsOnboarding = statusData?.aepsOnboarding;
        const validateAgentOtp = statusData?.validateAgentOtp;
        const bioMetricVerification = statusData?.bioMetricVerification;
        const daily2FAAuthentication = statusData?.daily2FAAuthentication;

        // Check if all four steps are completed
        const isAepsOnboardingCompleted = 
            aepsOnboarding?.status?.toLowerCase() === "completed" && 
            aepsOnboarding?.isCompleted === true;

        const isValidateAgentOtpCompleted = 
            validateAgentOtp?.status?.toLowerCase() === "completed" && 
            validateAgentOtp?.isCompleted === true;

        const isBioMetricVerificationCompleted = 
            bioMetricVerification?.status?.toLowerCase() === "completed" && 
            bioMetricVerification?.isCompleted === true;

        const isDaily2FAAuthenticationCompleted = 
            daily2FAAuthentication?.status?.toLowerCase() === "completed" && 
            daily2FAAuthentication?.isCompleted === true;

        const allCompleted = 
            isAepsOnboardingCompleted &&
            isValidateAgentOtpCompleted &&
            isBioMetricVerificationCompleted &&
            isDaily2FAAuthenticationCompleted;

        return allCompleted;
    };

    // Check status on component mount
    useEffect(() => {
        dispatch(aepsStatusCheck()).then((response) => {
            console.log("aepsStatusCheck response in Services:", response);
            
            // Check if all status is completed
            const aepsStatusData = response?.data || response?.aepsStatus?.data || response?.aepsStatus;
            const isAllCompleted = checkIfAllStatusCompleted(aepsStatusData);
            
            if (isAllCompleted) {
                console.log("✅ All AEPS status completed, showing confirm page");
                setShowAepsConfirm(true);
            }
        }).catch((error) => {
            console.error("aepsStatusCheck error in Services:", error);
        });
    }, [dispatch]);

    // Also check from Redux state when it updates
    useEffect(() => {
        if (aepsStatus?.status === "SUCCESS" && aepsStatus?.message) {
            const aepsStatusData = aepsStatus?.aepsStatus?.data || aepsStatus?.data || aepsStatus?.aepsStatus;
            const isAllCompleted = checkIfAllStatusCompleted(aepsStatusData);
            
            if (isAllCompleted && !showAepsConfirm) {
                console.log("✅ All AEPS status completed from Redux, showing confirm page");
                setShowAepsConfirm(true);
            }
        }
    }, [aepsStatus, showAepsConfirm]);

    const filtered = useMemo(() => {
        const key = activeTab.toLowerCase();
        return servicesData.filter((s) => s.status === key);
    }, [activeTab]);

    // Handle AEPS card click - check status and process steps accordingly
    const handleAepsClick = async () => {
        try {
            // Call status check to get current status
            const response = await dispatch(aepsStatusCheck());
            console.log("aepsStatusCheck response in Services:", response);
            
            // Extract status data from response
            const aepsStatusData = response?.data || response?.aepsStatus?.data || response?.aepsStatus;
            
            // Check if all status is completed
            const isAllCompleted = checkIfAllStatusCompleted(aepsStatusData);
            
            if (isAllCompleted) {
                // Show confirm page if all completed
                console.log("✅ All AEPS status completed, showing confirm page");
                setShowAepsConfirm(true);
            } else {
                // Determine which step needs to be completed
                const aepsOnboarding = aepsStatusData?.aepsOnboarding;
                const validateAgentOtp = aepsStatusData?.validateAgentOtp;
                const bioMetricVerification = aepsStatusData?.bioMetricVerification;
                const daily2FAAuthentication = aepsStatusData?.daily2FAAuthentication;

                console.log("🔍 Current AEPS onboarding status:", {
                    aepsOnboarding: aepsOnboarding?.status,
                    validateAgentOtp: validateAgentOtp?.status,
                    bioMetricVerification: bioMetricVerification?.status,
                    daily2FAAuthentication: daily2FAAuthentication?.status
                });

                // Navigate to onboarding-aeps route
                // The OnBoardingAeps component will automatically determine which step to show
                console.log("📋 Navigating to onboarding flow to process next step");
                navigate("/retailerDashboard/onboarding-aeps");
            }
        } catch (error) {
            console.error("❌ aepsStatusCheck error in Services:", error);
            // Still navigate even on error, let OnBoardingAeps handle it
            navigate("/retailerDashboard/onboarding-aeps");
        }
    };

    // Show AEPSAccessConfirm if all status is completed
    if (showAepsConfirm) {
        return <AEPSAccessConfirm />;
    }

    return (
        <div className="w-full">
            {/* Header */}
            <div className="mb-[44px]">
                <div className="text-[24px] font-['Gilroy-Medium'	] text-[#1B1717]">
                    Make Your Wallet Grow
                </div>
                <div className="mt-[12px] text-[16px]  text-[#000000] font-['Gilroy-Regular'] leading-relaxed w-[1083px]">
                    Do You Know? By Upgrading Your Membership To A Premium Scheme, You Can
                    Earn Attractive Commissions On Various Services. To Know More About
                    Your Current Scheme And Upgrade
                </div>

                {/* Tabs */}
                <div className="mt-[28px] inline-flex items-center gap-4 bg-[#FFFFFF] rounded-3xl border border-[#1B1717] border-opacity-50 p-2">
                    <button
                        type="button"
                        onClick={() => setActiveTab("Available")}
                        className={`px-6 py-3 rounded-xl text-[14px] font-['Gilroy-Medium'] transition ${activeTab === "Available"
                                ? "bg-[#039155] text-white shadow-sm"
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                    >
                        Available
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("Subscribed")}
                        className={`px-6 py-3 rounded-xl text-[14px] font-['Gilroy-Medium'] transition ${activeTab === "Subscribed"
                                ? "bg-[#039155] text-white shadow-sm"
                                : "text-[#1B1717] hover:bg-gray-50"
                            }`}
                    >
                        Subscribed
                    </button>
                </div>
            </div>

            {/* Title */}
            <div className="mb-[20px]">
                <div className="text-[24px] font-['Gilroy-Medium'] text-[#1B1717]">
                    Services
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-[32px] gap-6">
                {filtered.map((s) => (
                    <ServiceCard
                        key={s.id}
                        title={s.title}
                        description={s.description}
                        onClick={() => {
                            if (s.id === "Aeps") {
                                handleAepsClick();
                            }
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default Services;