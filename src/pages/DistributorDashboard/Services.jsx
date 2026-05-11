import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
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
  { id: "Aeps-3", title: "AEPS-3", status: "available", logo: "/img/AEPS.svg" },
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
  const [showAepsSelectionPopup, setShowAepsSelectionPopup] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { aepsActivationStatus } = useSelector((state) => state.whiteLabel);

  useEffect(() => {
    dispatch(checkAepsActivation());
  }, [dispatch]);

  const filtered = useMemo(() => {
    const key = activeTab.toLowerCase();
    return servicesData.filter((s) => s.status === key);
  }, [activeTab]);

  const handleAepsClick = () => {
    if (aepsActivationStatus?.aepsType === "AEPS1" && aepsActivationStatus?.isActive) {
      navigate("/distributerDashboard/services/aeps1/onboarding");
    } else {
      setShowAepsPopup(true);
    }
  };
  const handleAepsThreeClick = () => {
    if (aepsActivationStatus?.aepsType === "AEPS3" && aepsActivationStatus?.isActive) {
      navigate("/distributerDashboard/services/aeps3/onboarding");
    } else {
      setShowAepsPopup(true);
    }
  };
  // Handle BBPS card click - show BBPS services component
  const handleBBPSClick = () => {
    navigate("/distributerDashboard/services/bbps-services");
    setShowBBPSServices(true);
  };

  // Handle AEPS-2 card click - navigate to services/aeps2/onboarding route
  const handleAepsTwoClick = () => {
    if (aepsActivationStatus?.aepsType === "AEPS2" && aepsActivationStatus?.isActive) {
      navigate("/distributerDashboard/services/aeps2/onboarding");
    } else {
      setShowAepsPopup(true);
    }
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

  const handleCMSServiceClick = () => {
    navigate("/distributerDashboard/services/cms");
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
                setShowAepsSelectionPopup(true);
              } else if (s.id === "Aeps-3") {
                handleAepsThreeClick();
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
              } else if (s.id === "cms-1") {
                handleCMSServiceClick();
              }
            }}
          />
        ))}
      </div>

      {/* Service Unavailable Popup */}
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
                  This AEPS service is currently not active for your account. Please use the active AEPS provider or contact support.
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
      {/* AEPS Selection Modal */}
      <AnimatePresence>
        {showAepsSelectionPopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white rounded-[24px] w-full max-w-[400px] overflow-hidden shadow-2xl relative"
            >
              <div className="p-8 text-center">
                <button
                  onClick={() => setShowAepsSelectionPopup(false)}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                </button>

                <div className="w-[84px] h-[84px] bg-[#DBEAFE] rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border-[6px] border-white">
                  <img src="/img/AEPS.svg" alt="AEPS" className="w-[42px] h-[42px]" />
                </div>

                <h3 className="text-[22px] font-['Gilroy-SemiBold'] text-[#1B1717] mb-[10px]">
                  Select AEPS Service
                </h3>

                <p className="text-[#64748B] font-['Gilroy-Medium'] text-[15px] leading-[1.6] mb-8">
                  Please choose the AEPS service you would like to proceed with.
                </p>

                <div className="flex flex-col gap-4 w-full">
                  <button
                    onClick={() => {
                      handleAepsClick();
                      setShowAepsSelectionPopup(false);
                    }}
                    className="w-full group relative overflow-hidden py-[18px] px-6 bg-[#039155] text-white rounded-2xl font-['Gilroy-SemiBold'] text-[17px] transition-all shadow-md hover:shadow-xl transform hover:-translate-y-1 active:scale-[0.98]"
                  >
                    <div className="relative z-10 flex items-center justify-center gap-3">
                      <span>ICICI AEPS</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  </button>

                  <button
                    onClick={() => {
                      handleAepsTwoClick();
                      setShowAepsSelectionPopup(false);
                    }}
                    className="w-full group relative py-[18px] px-6 bg-white border-2 border-[#039155] text-[#039155] hover:bg-[#F0FDF4] rounded-2xl font-['Gilroy-SemiBold'] text-[17px] transition-all shadow-sm hover:shadow-lg transform hover:-translate-y-1 active:scale-[0.98]"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <span>NSDL AEPS</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Services;

