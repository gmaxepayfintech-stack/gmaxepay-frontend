import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileIcon from "../../../public/img/MobileIcon.svg";
import PropTypes from "prop-types";
import { aepsStatusCheck } from "../../redux/action/aepsAction";
import DTHRecharge from "./services/DTHRecharge";

const DEFAULT_DESCRIPTION =
  "You Can Now Recharge Your Mobile Phones And DTH Services in India, You Can Recharge With Any Operator And Also Have Access To The Latest Offers That";

const servicesData = [
  {
    id: "mobile-dth",
    title: "Recharge",
    status: "available",
    logo: "/img/MobileRecharge.svg",
  },
  { id: "Aeps", title: "AEPS", status: "available", logo: "/img/AEPS.svg" },
  { id: "BBPS", title: "BBPS", status: "available", logo: "/img/BBPS.svg" },
  {
    id: "dth-recharge",
    title: "DTH Recharge",
    status: "available",
    logo: "/img/DTH1.svg",
  },
  { id: "dmt-1", title: "DMT-1", status: "available", logo: "/img/DMT.svg" },
  { id: "dmt-2", title: "DMT-2", status: "available", logo: "/img/DMT.svg" },
  {
    id: "pan",
    title: "PAN",
    status: "available",
    logo: "/img/PanCorrection.svg",
  },
  {
    id: "micro-atm",
    title: "Micro ATM",
    status: "available",
    logo: "/img/MATM.svg",
  },
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
    id: "aeps-cash-deposit",
    title: "AEPS Cash Deposit",
    status: "subscribed",
    logo: "/img/AEPS.svg",
  },
  { id: "indo-nepal-dmt", title: "Indo-Nepal DMT", status: "subscribed" },
  { id: "toto-play", title: "Tata Play Connection", status: "subscribed" },
].map((s) => ({ ...s, description: DEFAULT_DESCRIPTION }));

const ServiceCard = ({ title, description, onClick, logo, status }) => {
  // Show logo if status is "available", otherwise show MobileIcon
  const iconSrc = status === "available" && logo ? logo : MobileIcon;

  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-[#FFFFFF] rounded-2xl shadow-sm  px-6 py-4 min-h-[182px] relative text-left hover:shadow-md transition"
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
          <div className="text-[18px] font-['Gilroy-Medium'] text-[#1B1717] capitalize">
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
  const [showDTHRecharge, setShowDTHRecharge] = useState(false);

  const navigate = useNavigate();

  // Note: Status check only happens when AEPS card is clicked, not mount

  const filtered = useMemo(() => {
    const key = activeTab.toLowerCase();
    return servicesData.filter((s) => s.status === key);
  }, [activeTab]);

  // Handle AEPS card click - always navigate to onboarding-aeps route
  // The OnBoardingAeps component will handle all status checks and component rendering
  const handleAepsClick = () => {
    // Always navigate to onboarding-aeps - let that component handle everything
    navigate("/retailerDashboard/onboarding-aeps");
  };
  const handleBbpsClick = () => {
    navigate("/distributerDashboard/services/bbps-services");
  };

  const handleMobileRechargeClick = () => {
    navigate("/retailerDashboard/services/recharge");
  };

  const handleDTHRechargeClick = () => {
    setShowDTHRecharge(true);
  };

  if (showDTHRecharge) {
    return <DTHRecharge onBack={() => setShowDTHRecharge(false)} />;
  }

  // Handle PAN card click - navigate to pan-service route
  const handlePANClick = () => {
    navigate("/distributerDashboard/services/pan-service");
  };

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
            className={`px-6 py-3 rounded-lg text-[14px] font-['Gilroy-Medium'] transition ${
              activeTab === "Available"
                ? "bg-[#039155] text-white shadow-sm font-[gilroy-semibold]"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            Available
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("Subscribed")}
            className={`px-6 py-3 rounded-lg text-[14px] font-['Gilroy-Medium'] transition ${
              activeTab === "Subscribed"
                ? "bg-[#039155] text-white shadow-sm font-[gilroy-semibold]"
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
              } else if (s.id === "Aeps") {
                handleAepsClick();
              } else if (s.id === "BBPS") {
                handleBbpsClick();
              } else if (s.id === "dth-recharge") {
                handleDTHRechargeClick();
              } else if (s.id === "pan") {
                handlePANClick();
              }
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Services;
