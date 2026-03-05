import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileIcon from "../../../public/img/MobileIcon.svg";
import PropTypes from "prop-types";
import BBPSServices from "./services/BBPSServices";
import { motion, AnimatePresence } from "framer-motion";

const DEFAULT_DESCRIPTION =
  "You Can Now Recharge Your Mobile Phones And DTH Services in India, You Can Recharge With Any Operator And Also Have Access To The Latest Offers That";

const servicesData = [
  {
    id: "mobile-dth",
    title: "Recharge",
    status: "available",
    logo: "/img/MobileRecharge.svg",
  },
  {
    id: "Express Mobile Recharge",
    title: "Express Mobile Recharge",
    status: "available",
    logo: "/img/MobileRecharge.svg",
  },
  { id: "Aeps-1", title: "AEPS-1", status: "available", logo: "/img/AEPS.svg" },
  { id: "Aeps-2", title: "AEPS-2", status: "available", logo: "/img/AEPS.svg" },
  { id: "BBPS", title: "BBPS", status: "available", logo: "/img/BBPS.svg" },
  {
    id: "dth-recharge",
    title: "DTH Recharge",
    status: "available",
    logo: "/img/DTH1.svg",
  },
  {
    id: "Express DTH",
    title: "Express DTH Recharge",
    status: "available",
    logo: "/img/DTH1.svg",
  },
  { id: "dmt-1", title: "DMT-1", status: "available", logo: "/img/DMT.svg" },
  { id: "dmt-2", title: "DMT-2", status: "available", logo: "/img/DMT.svg" },
  {
    id: "micro-atm",
    title: "Micro ATM",
    status: "available",
    logo: "/img/MATM.svg",
  },
  {
    id: "pan",
    title: "PAN",
    status: "available",
    logo: "/img/PanCorrection.svg",
  },
  // {
  //   id: "Express PAN",
  //   title: "Express PAN",
  //   status: "available",
  //   logo: "/img/PanCorrection.svg",
  // },
  { id: "cms-1", title: "CMS-1", status: "available", logo: "/img/CMS.svg" },
  { id: "cms-2", title: "CMS-2", status: "available", logo: "/img/CMS.svg" },
  {
    id: "unified-dmt",
    title: "Unified DMT",
    status: "available",
    logo: "/img/DMT.svg",
  },
  { id: "dmt", title: "DMT", status: "available", logo: "/img/DMT.svg" },
  { id: "dmt-11", title: "DMT-1", status: "available", logo: "/img/DMT.svg" },
  {
    id: "pan",
    title: "Pan Card Creation",
    status: "subscribed",
    logo: "/img/PanCorrection.svg",
  },
  {
    id: "aeps-cash-deposit",
    title: "AEPS Cash Deposit",
    status: "subscribed",
    logo: "/img/AEPS.svg",
  },
  // {
  //   id: "indo-nepal-dmt",
  //   title: "Indo-Nepal DMT",
  //   status: "subscribed",
  //   logo: "/img/DMT.svg",
  // },
  {
    id: "dth-recharge",
    title: "Tata Play Connection",
    status: "subscribed",
    logo: "/img/TataPlay.svg",
  },
].map((s) => ({ ...s, description: DEFAULT_DESCRIPTION }));

const ServiceCard = ({ title, description, onClick, logo, status }) => {
  // Show logo if status is "available", otherwise show MobileIcon
  const iconSrc = status === "available" && logo ? logo : MobileIcon;

  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-[#FFFFFF] rounded-2xl shadow-sm px-6 py-4 min-h-[182px] relative text-left hover:shadow-md transition"
    >
      <div className="flex gap-3">
        <div className="w-[60px] h-[60px] rounded-full bg-[#DBEAFE] flex items-center justify-center shrink-0">
          <img
            src={iconSrc}
            alt={status === "available" && logo ? title : "Service Icon"}
            className=""
          />
        </div>
        <div className="min-w-0 flex flex-col justify-center">
          <div className="text-lg font-['Gilroy-Medium'] text-[#1B1717] capitalize">
            {title}
          </div>
          <div className="mt-[10px] text-xs text-[#1B1717] font-['Gilroy-Regular'] leading-relaxed line-clamp-4 capitalize">
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
  logo: PropTypes.string,
  status: PropTypes.string,
};

const Services = () => {
  const [activeTab, setActiveTab] = useState("Available");
  const [showBBPSServices, setShowBBPSServices] = useState(false);
  const [showAepsPopup, setShowAepsPopup] = useState(false);
  const navigate = useNavigate();

  // Note: Status check only happens when AEPS card is clicked, not mount

  const filtered = useMemo(() => {
    const key = activeTab.toLowerCase();
    return servicesData.filter((s) => s.status === key);
  }, [activeTab]);

  // Handle AEPS-1 card click - show animated popup
  const handleAepsClick = () => {
    setShowAepsPopup(true);
  };

  // Handle BBPS card click - show BBPS services component
  const handleBBPSClick = () => {
    navigate("/distributerDashboard/services/bbps-services");
    setShowBBPSServices(true);
  };

  // Handle AEPS-2 card click - navigate to services/aeps2/onboarding route
  const handleAepsTwoClick = () => {
    navigate("/distributerDashboard/services/aeps2/onboarding");
  };

  // Handle Recharge card click - navigate to recharge route
  const handleMobileRechargeClick = () => {
    navigate("/distributerDashboard/services/recharge");
  };

  const handleDTHRechargeClick = () => {
    navigate("/distributerDashboard/services/dth-recharge");
  };

  // Handle PAN card click - navigate to pan-service route
  const handlePANClick = () => {
    navigate("/distributerDashboard/services/pan-service");
  };

  // If BBPS services should be shown, render that component
  if (showBBPSServices) {
    return <BBPSServices onBack={() => setShowBBPSServices(false)} />;
  }

  return (
    <div className="w-full py-4 px-3">
      {/* Header */}
      <div className="mb-[44px]">
        <div className="text-2xl font-['Gilroy-Medium'] text-[#1B1717]">
          Make Your Wallet Grow
        </div>
        <div className="mt-[12px] text-[16px]  text-[#1B1717] font-['Gilroy-Regular'] leading-relaxed w-[1083px]">
          Do You Know? By Upgrading Your Membership To A Premium Scheme, You Can
          Earn Attractive Commissions On Various Services. To Know More About
          Your Current Scheme And Upgrade
        </div>

        {/* Tabs */}
        <div className="mt-[28px] inline-flex items-center gap-4 bg-[#FFFFFF] rounded-2xl border border-[#1B1717] border-opacity-50 p-2">
          <button
            type="button"
            onClick={() => setActiveTab("Available")}
            className={`px-6 py-3 rounded-lg text-[14px] font-['Gilroy-Medium'] transition ${activeTab === "Available"
              ? "bg-[#039155] text-white shadow-sm font-[Gilroy-Semibold]"
              : "text-gray-700 hover:bg-gray-50"
              }`}
          >
            Available
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("Subscribed")}
            className={`px-6 py-3 rounded-lg text-[14px] font-['Gilroy-Medium'] transition ${activeTab === "Subscribed"
              ? "bg-[#039155] text-white shadow-sm font-[Gilroy-Semibold]"
              : "text-[#1B1717] hover:bg-gray-50"
              }`}
          >
            Subscribed
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="mb-6">
        <div className="text-2xl font-['Gilroy-Medium'] text-[#1B1717]">
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
            logo={s.logo}
            status={s.status}
            onClick={() => {
              if (s.id === "mobile-dth") {
                handleMobileRechargeClick();
              } else if (s.id === "Express Mobile Recharge") {
                navigate("/distributerDashboard/services/express-recharge");
              } else if (s.id === "Aeps-1") {
                handleAepsClick();
              } else if (s.id === "Aeps-2") {
                handleAepsTwoClick();
              } else if (s.id === "BBPS" || s.id === "bbps") {
                handleBBPSClick();
              } else if (s.id === "dth-recharge") {
                handleDTHRechargeClick();
              } else if (s.id === "Express DTH") {
                navigate("/distributerDashboard/services/express-dth-recharge");
              } else if (s.id === "pan") {
                handlePANClick();
              } else if (s.id === "Express PAN") {
                navigate("/distributerDashboard/services/express-pan-service");
              }
            }}
          />
        ))}
      </div>

      {/* AEPS-1 Unavailable Popup */}
      <AnimatePresence>
        {showAepsPopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white rounded-[24px] w-full max-w-[360px] overflow-hidden shadow-2xl relative"
            >
              <div className="p-8 text-center pt-10">
                <button
                  onClick={() => setShowAepsPopup(false)}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                </button>

                <div className="w-[84px] h-[84px] bg-[#DBEAFE] rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border-[6px] border-white">
                  <img src="/img/AEPS.svg" alt="AEPS" className="w-[42px] h-[42px]" />
                </div>

                <h3 className="text-[22px] font-['Gilroy-SemiBold'] text-[#1B1717] mb-[10px]">
                  Service Unavailable
                </h3>

                <p className="text-[#64748B] font-['Gilroy-Medium'] text-[15px] leading-[1.6] mb-8 px-2">
                  Thank you for your interest! We appreciate your engagement. This service is currently unavailable, we will notify you once it is live.
                </p>

                <button
                  onClick={() => setShowAepsPopup(false)}
                  className="w-full py-[14px] px-6 bg-[#039155] hover:bg-[#027a48] text-white rounded-xl font-['Gilroy-SemiBold'] text-[16px] transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  Okay, Got it
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Services;

