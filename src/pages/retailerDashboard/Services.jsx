import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileIcon from "../../../public/img/MobileIcon.svg";
import PropTypes from "prop-types";
import BBPSServices from "./services/BBPSServices";

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
  // { id: "Aeps-3", title: "AEPS-3", status: "available", logo: "/img/AEPS.svg" },
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
  const navigate = useNavigate();

  // Note: Status check only happens when AEPS card is clicked, not mount

  const filtered = useMemo(() => {
    const key = activeTab.toLowerCase();
    return servicesData.filter((s) => s.status === key);
  }, [activeTab]);

  // Handle AEPS-1 card click - navigate to AEPS-3
  const handleAepsClick = () => {
    navigate("/retailerDashboard/services/aeps3/onboarding");
  };

  // Handle BBPS card click - show BBPS services component
  const handleBBPSClick = () => {
    // console.log("🖱️ BBPS card clicked, navigating to BBPS");
    navigate("/retailerDashboard/services/bbps-services");
    setShowBBPSServices(true);
  };

  const handleAepsTwoClick = () => {
    navigate("/retailerDashboard/services/aeps2/onboarding");
  };

  const handleMobileRechargeClick = () => {
    navigate("/retailerDashboard/services/recharge");
  };

  const handleDTHRechargeClick = () => {
    navigate("/retailerDashboard/services/dth-recharge");
  };

  // Handle PAN card click - navigate to pan-service route
  const handlePANClick = () => {
    //console.log("🖱️ PAN card clicked, navigating to pan-service");
    navigate("/retailerDashboard/services/pan-service");
  };

  const handleCMSServiceClick = () => {
    navigate("/retailerDashboard/services/cms");
  };

  // If BBPS services should be shown, render that component
  if (showBBPSServices) {
    return <BBPSServices onBack={() => setShowBBPSServices(false)} />;
  }

  return (
    <div className="w-full py-4 px-3">
      {/* Header */}
      <div className="mb-[44px]">
        <div className="text-2xl font-['Gilroy-Medium'	] text-[#1B1717]">
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
                navigate("/retailerDashboard/services/express-recharge");
              } else if (s.id === "Aeps-1") {
                handleAepsClick();
              } else if (s.id === "Aeps-2") {
                handleAepsTwoClick();
              } else if (s.id === "BBPS" || s.id === "bbps") {
                handleBBPSClick();
              } else if (s.id === "dth-recharge") {
                handleDTHRechargeClick();
              } else if (s.id === "Express DTH") {
                navigate("/retailerDashboard/services/express-dth-recharge");
              } else if (s.id === "pan") {
                handlePANClick();
              } else if (s.id === "Express PAN") {
                navigate("/retailerDashboard/services/express-pan-service");
              } else if (s.id === "cms-1") {
                handleCMSServiceClick();
              }
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Services;
