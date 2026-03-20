import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, Fingerprint } from "lucide-react";
import AepsCWHistory from "./AepsCWHistory";
import { motion } from "framer-motion";
import RechargeReport from "./reports/RechargeReport";
import PanReport from "./reports/PanReport";
import DTHReport from "./reports/DTHReport";
import PayoutHistory from "./payoutHistory";
import WalletHistory from "./walletHistroy";
import SurCharges from "./SurCharges";
import GSTHistory from "./GSTHistory";
import BBPSReport from "./BBPSReport";
import PanReportTwo from "./reports/PanReportTwo";
import RechargeReportTwo from "./reports/RechargeReportTwo";
import DTHReportTwo from "./reports/DTHReportTwo";
import CMSHistory from "./CMSHistory";
import MATMReport from "./reports/MATMReport";

const TaxHistory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("Banking");
  const [currentPage, setCurrentPage] = useState(1);
  // Check if we're viewing a specific history (from URL search params)
  const searchParams = new URLSearchParams(location.search);
  const viewHistory = searchParams.get("view");
  const showAepsHistory =
    viewHistory === "aeps-cw-history" ||
    viewHistory === "aeps-ms-history" ||
    viewHistory === "aeps-be-history" ||
    viewHistory === "aeps2-cw-history" ||
    viewHistory === "aeps2-ms-history" ||
    viewHistory === "aeps2-be-history";
  const showPayoutHistory = viewHistory === "payout-history";
  const showCmsHistory = viewHistory === "cms-history";
  const showWalletHistory = viewHistory === "wallet-history";
  const showRechargeHistory = viewHistory === "recharge-history";
  const showDthHistory = viewHistory === "dth-history";
  const showPanServiceHistory = viewHistory === "pan-service-history";
  const showRechargeHistoryTwo = viewHistory === "recharge-history-two";
  const showDthHistoryTwo = viewHistory === "dth-history-two";
  const showPanServiceHistoryTwo = viewHistory === "pan-service-history-two";
  const showSurCharges = viewHistory === "surcharges";
  const showGstHistory = viewHistory === "gst-history";
  const showBbpsHistory = viewHistory === "bbps-history";
  const showMATMHistory = viewHistory === "matm-history";
  const tabs = [
    "Banking",
    "Utility Payment",
    "E-Governance",
    "Insurance",
    "Finance",
    "Verification History",
  ];

  // Each card is tagged with a category matching one of the tabs,
  // so we can segregate the cards per tab.
  const transactionCards = [
    // Banking
    // {
    //   id: 1,
    //   title: "AEPS 1 CW History",
    //   subtitle: "Cash History",
    //   available: true,
    //   viewKey: "aeps-cw-history",
    //   category: "Banking",
    // },
    {
      id: 2,
      title: "AEPS 2 CW History",
      subtitle: "Cash History",
      available: true,
      viewKey: "aeps2-cw-history",
      category: "Banking",
    },
    // {
    //   id: 3,
    //   title: "AEPS 1 MS History",
    //   subtitle: "Mini Statement",
    //   available: true,
    //   viewKey: "aeps-ms-history",
    //   category: "Banking",
    // },
    {
      id: 4,
      title: "AEPS 2 MS History",
      subtitle: "Mini Statement",
      available: true,
      viewKey: "aeps2-ms-history",
      category: "Banking",
    },
    {
      id: 5,
      title: "MATM History",
      subtitle: "MATM History",
      available: true,
      viewKey: "matm-history",
      category: "Banking",
    },
    // {
    //   id: 5,
    //   title: "AEPS 1 BE History",
    //   subtitle: "AEPS 1 BE History",
    //   available: true,
    //   viewKey: "aeps-be-history",
    //   category: "Banking",
    // },
    {
      id: 6,
      title: "AEPS 2 BE History",
      subtitle: "AEPS 2 BE History",
      available: true,
      viewKey: "aeps2-be-history",
      category: "Banking",
    },
    {
      id: 7,
      title: "Payout History",
      subtitle: "Payout History",
      available: true,
      viewKey: "payout-history",
      category: "Banking",
    },
    {
      id: 7,
      title: "CMS History",
      subtitle: "CMS History",
      available: true,
      viewKey: "cms-history",
      category: "Banking",
    },
    {
      id: 8,
      title: "Wallet History",
      subtitle: "Wallet History",
      available: true,
      viewKey: "wallet-history",
      category: "Finance",
    },
    {
      id: 9,
      title: "SurCharges",
      subtitle: "SurCharges",
      available: true,
      viewKey: "surcharges",
      category: "Finance",
    },
    {
      id: 10,
      title: "GST",
      subtitle: "Gst Enquiry",
      available: true,
      viewKey: "gst-history",
      category: "Finance",
    },
    // {
    //   id: 8,
    //   title: "CMS",
    //   subtitle: "Cash History",
    //   available: true,
    //   category: "Banking",
    // },
    // {
    //   id: 9,
    //   title: "F-CMS",
    //   subtitle: "Cash Histroy",
    //   available: true,
    //   category: "Banking",
    // },
    // {
    //   id: 10,
    //   title: "F-CMS",
    //   subtitle: "Cash History",
    //   available: true,
    //   category: "Banking",
    // },
    // {
    //   id: 11,
    //   title: "F-CMS",
    //   subtitle: "Cash History",
    //   available: true,
    //   category: "Banking",
    // },
    // {
    //   id: 12,
    //   title: "F-CMS",
    //   subtitle: "Cash History",
    //   available: true,
    //   category: "Banking",
    // },

    // Utility Payment
    // {
    //   id: 13,
    //   title: "Electricity Bill History",
    //   subtitle: "Electricity Payments",
    //   available: true,
    //   category: "Utility Payment",
    // },
    // {
    //   id: 14,
    //   title: "Water Bill History",
    //   subtitle: "Water Bill Payments",
    //   available: true,
    //   category: "Utility Payment",
    // },
    // {
    //   id: 15,
    //   title: "Gas Bill History",
    //   subtitle: "Gas Utility Payments",
    //   available: true,
    //   category: "Utility Payment",
    // },
    // {
    //   id: 16,
    //   title: "Broadband History",
    //   subtitle: "Internet & Broadband",
    //   available: true,
    //   category: "Utility Payment",
    // },
    {
      id: 29,
      title: "Mobile Recharge History",
      subtitle: "Prepaid & Postpaid",
      available: true,
      viewKey: "recharge-history",
      category: "Utility Payment",
    },
    {
      id: 30,
      title: "Express Recharge History",
      subtitle: "Prepaid & Postpaid",
      available: true,
      viewKey: "recharge-history-two",
      category: "Utility Payment",
    },
    {
      id: 31,
      title: "DTH Recharge History",
      subtitle: "DTH Payments",
      available: true,
      viewKey: "dth-history",
      category: "Utility Payment",
    },
    {
      id: 32,
      title: "Express DTH Recharge History",
      subtitle: "DTH Payments",
      available: true,
      viewKey: "dth-history-two",
      category: "Utility Payment",
    },
    {
      id: 33,
      title: "BBPS History",
      subtitle: "BBPS Payments",
      available: true,
      viewKey: "bbps-history",
      category: "Utility Payment",
    },

    // E-Governance
    {
      id: 17,
      title: "PAN Service History",
      subtitle: "PAN Applications & Updates",
      available: true,
      viewKey: "pan-service-history",
      category: "E-Governance",
    },
    // {
    //   id: 32,
    //   title: "PAN Service -2 History",
    //   subtitle: "PAN Applications & Updates",
    //   available: true,
    //   viewKey: "pan-service-history-two",
    //   category: "E-Governance",
    // },
    // {
    //   id: 18,
    //   title: "Aadhaar KYC History",
    //   subtitle: "Aadhaar e-KYC",
    //   available: true,
    //   category: "E-Governance",
    // },
    // {
    //   id: 19,
    //   title: "GST Payment History",
    //   subtitle: "GST & Tax Payments",
    //   available: true,
    //   category: "E-Governance",
    // },

    // Insurance

    // {
    //   id: 20,
    //   title: "Life Insurance History",
    //   subtitle: "Life Policy Payments",
    //   available: true,
    //   category: "Insurance",
    // },
    // {
    //   id: 21,
    //   title: "Health Insurance History",
    //   subtitle: "Health Policy Payments",
    //   available: true,
    //   category: "Insurance",
    // },
    // {
    //   id: 22,
    //   title: "Vehicle Insurance History",
    //   subtitle: "Motor Policy Payments",
    //   available: true,
    //   category: "Insurance",
    // },

  ];

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const ITEMS_PER_PAGE = 6;

  // Filter cards based on the active tab/category
  const filteredCards = transactionCards.filter(
    (card) => card.category === activeTab,
  );

  const totalPages = Math.ceil(filteredCards.length / ITEMS_PER_PAGE) || 1;

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const paginatedCards = filteredCards.slice(startIndex, endIndex);

  // If a specific history should be shown, render the matching report
  if (showAepsHistory) {
    return (
      <AepsCWHistory
        type={viewHistory} // optional: pass which AEPS history
        onBack={() => navigate("/superDashboard/txn-history")}
      />
    );
  }

  if (showPayoutHistory) {
    return (
      <PayoutHistory
        type={viewHistory}
        onBack={() => navigate("/superDashboard/txn-history")}
      />
    );
  }

  if (showCmsHistory) {
    return (
      <CMSHistory
        onBack={() => navigate("/superDashboard/txn-history")}
      />
    );
  }

  if (showWalletHistory) {
    return (
      <WalletHistory
        type={viewHistory}
        onBack={() => navigate("/superDashboard/txn-history")}
      />
    );
  }

  if (showRechargeHistory) {
    return (
      <RechargeReport onBack={() => navigate("/superDashboard/txn-history")} />
    );
  }

  if (showDthHistory) {
    return <DTHReport />;
  }

  if (showPanServiceHistory) {
    return <PanReport />;
  }

  if (showRechargeHistoryTwo) {
    return (
      <RechargeReportTwo onBack={() => navigate("/superDashboard/txn-history")} />
    );
  }

  if (showDthHistoryTwo) {
    return <DTHReportTwo />;
  }

  if (showPanServiceHistoryTwo) {
    return <PanReportTwo />;
  }

  if (showSurCharges) {
    return (
      <SurCharges
        onBack={() => navigate("/superDashboard/txn-history")}
      />
    );
  }

  if (showGstHistory) {
    return (
      <GSTHistory
        onBack={() => navigate("/superDashboard/txn-history")}
      />
    );
  }

  if (showBbpsHistory) {
    return (
      <BBPSReport
        onBack={() => navigate("/superDashboard/txn-history")}
      />
    );
  }

  if (showMATMHistory) {
    return (
      <MATMReport
        onBack={() => navigate("/superDashboard/txn-history")}
      />
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-1 sm:p-2 md:p-3 text-[#1B1717]">
      {/* Header Section */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-xl md:text-2xl text-[#1B1717] mb-1 sm:mb-2 font-[Gilroy-Medium]">
          Transaction History
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-[#1B1717]/80 font-[Gilroy-Regular]">
          Manage And Track All Your Transactions
        </p>
      </div>
      {/* Navigation Tabs */}

      <div className="mb-4 sm:mb-6 bg-white p-1.5 sm:p-2 rounded-3xl overflow-x-auto">
        <div className="relative flex gap-2 px-2 py-1 sm:gap-3 md:gap-4 lg:gap-6 min-w-max sm:min-w-0">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="relative flex-auto flex justify-evenly"
            >
              {/* This span defines the size */}
              <span className="relative px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2.5 rounded-[16px]">
                {/* Moving background */}
                {activeTab === tab && (
                  <motion.span
                    layoutId="active-pill"
                    className="absolute inset-0 rounded-[16px] bg-[#039155]"
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 35,
                    }}
                  />
                )}

                {/* Text */}
                <span
                  className={`relative z-10 text-xs sm:text-sm md:text-base
              font-[Gilroy-Semibold] whitespace-nowrap
              ${activeTab === tab
                      ? "text-white"
                      : "text-[#1B1717] hover:text-[#039155]"
                    }`}
                >
                  {tab}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
      {/* Transaction Cards Grid */}
      <div className="bg-[#FFFFFF] p-1.5 sm:p-5 rounded-3xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
          {paginatedCards.map((card) => (
            <div
              key={card.viewKey || card.id}
              className="bg-white border border-[#1B1717]/80 rounded-3xl shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col"
            >
              {/* Green Header Bar */}
              <div className="border-b-[0.5px] border-[#1B1717]/30 px-3 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between rounded-t">
                <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-[35px] md:h-[35px] rounded-full bg-[#039155] border border-[#039155]/50 flex items-center justify-center flex-shrink-0">
                  <Fingerprint className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-[20px] md:h-[20px] text-white" />
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5 rounded-full bg-white border border-[#039155]/50 px-1.5 py-0.5 sm:px-2 sm:py-1">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-[8px] md:h-[8px] rounded-full bg-[#039155]" />
                  <span className="text-[#039155] text-[9px] sm:text-[12px] font-[Gilroy-Semibold] whitespace-nowrap">
                    Active
                  </span>
                </div>
              </div>

              {/* White Body */}
              <div className="p-3 sm:p-4 md:p-5 flex-grow flex flex-col">
                <div className="mb-3 sm:mb-4 flex-grow">
                  <h3 className="font-[Gilroy-Semibold] sm:text-lg md:text-xl text-[#1B1717] mb-1.5 sm:mb-2">
                    {card.title}
                  </h3>

                  {/* FIRST subtitle */}
                  <p className="text-xs sm:text-sm text-[#1B1717]/80 font-[Gilroy-Regullar] mb-2 sm:mb-4">
                    History
                  </p>

                  <div className="flex items-center justify-between gap-2">
                    {/* SECOND subtitle */}
                    <p className="text-sm sm:text-base font-[Gilroy-Semibold] text-[#1B1717] truncate">
                      {card.subtitle}
                    </p>

                    {card.available && (
                      <span className="text-xs sm:text-sm text-[#039155] font-[Gilroy-Medium] whitespace-nowrap flex-shrink-0">
                        Available
                      </span>
                    )}
                  </div>
                </div>

                {/* View History Button */}
                <button
                  onClick={() => {
                    if (card.viewKey) {
                      navigate(
                        `/superDashboard/txn-history?view=${card.viewKey}`,
                      );
                    }
                  }}
                  className="w-full bg-[#039155] text-white py-2 rounded-xl font-[Gilroy-Semibold]"
                >
                  View History
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            className="p-2 sm:p-2.5 rounded-md border-[0.5px] border-[#121216]/54 bg-white text-[#121216] hover:bg-gray-50 transition"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-md font-[Gilroy-Regular] transition text-sm sm:text-base ${currentPage === page
                ? "bg-[#039155] text-white"
                : "bg-white border-[0.5px] border-[#121216]/54 text-[#1B1717] hover:bg-gray-50"
                }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            className="p-2 sm:p-2.5 rounded-md border-[0.5px] border-[#121216]/54 bg-white text-[#121216] hover:bg-gray-50 transition"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaxHistory;
