import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import MobileIcon from "../../../public/img/MobileIcon.svg";
import PropTypes from "prop-types";
import { aepsStatusCheck } from "../../redux/action/aepsAction";
import BBPSServices from "./services/BBPSServices";
import MobileRecharge from "./services/MobileRecharge";


const DEFAULT_DESCRIPTION =
    "You Can Now Recharge Your Mobile Phones And DTH Services in India, You Can Recharge With Any Operator And Also Have Access To The Latest Offers That";

const servicesData = [
    { id: "mobile-dth", title: "Mobile & DTH Recharge", status: "available" },
    { id: "Aeps", title: "AEPS", status: "available" },
    { id: "BBPS", title: "BBPS", status: "available" },
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
    const [showBBPSServices, setShowBBPSServices] = useState(false);
    const [showMobileRecharge, setShowMobileRecharge] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Note: Status check only happens when AEPS card is clicked, not mount

    const filtered = useMemo(() => {
        const key = activeTab.toLowerCase();
        return servicesData.filter((s) => s.status === key);
    }, [activeTab]);

    // Handle AEPS card click - always navigate to onboarding-aeps route
    // The OnBoardingAeps component will handle all status checks and component rendering
    const handleAepsClick = () => {
        console.log("🖱️ AEPS card clicked, navigating to onboarding-aeps");
        // Always navigate to onboarding-aeps - let that component handle everything
        navigate("/retailerDashboard/onboarding-aeps");
    };

    // Handle BBPS card click - show BBPS services component
    const handleBBPSClick = () => {
        setShowBBPSServices(true);
    };

    // Handle Mobile & DTH card click - show Mobile Recharge component
    const handleMobileRechargeClick = () => {
        setShowMobileRecharge(true);
    };

    // If Mobile Recharge should be shown, render that component
    if (showMobileRecharge) {
        return <MobileRecharge onBack={() => setShowMobileRecharge(false)} />;
    }

    // If BBPS services should be shown, render that component
    if (showBBPSServices) {
        return <BBPSServices onBack={() => setShowBBPSServices(false)} />;
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
                            if (s.id === "mobile-dth") {
                                handleMobileRechargeClick();
                            } else if (s.id === "Aeps") {
                                handleAepsClick();
                            } else if (s.id === "BBPS" || s.id === "bbps") {
                                handleBBPSClick();
                            }
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default Services;