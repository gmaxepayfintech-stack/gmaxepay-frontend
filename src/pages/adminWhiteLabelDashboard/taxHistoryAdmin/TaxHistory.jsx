import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, Fingerprint } from "lucide-react";
import AepsCWHistory from "./AepsCWHistory";
import { motion } from "framer-motion";

const TaxHistory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("Banking");
  const [currentPage, setCurrentPage] = useState(1);
  // const containerRef = useRef(null);
  // const tabRefs = useRef([]);
  // const [indicator, setIndicator] = useState({ width: 0, left: 0 });

  // Check if we're viewing a specific history (from URL search params)
  // This will automatically update when location.search changes
  const searchParams = new URLSearchParams(location.search);
  const viewHistory = searchParams.get("view");
  const showAepsCWHistory = viewHistory === "aeps-cw-history";

  // Debug: Log when view parameter changes
  useEffect(() => {
    if (viewHistory) {
      console.log("View history parameter:", viewHistory);
    }
  }, [viewHistory, location.search]);

  const tabs = [
    "Banking",
    "Utility Payment",
    "E-Governance",
    "Insurance",
    "Travel",
    "Verification History",
  ];

  const transactionCards = [
    {
      id: 1,
      title: "AEPS CW History",
      subtitle: "Cash Withdrawal",
      available: true,
    },
    {
      id: 2,
      title: "AePS MS History",
      subtitle: "Mini Statement",
      available: true,
    },
    {
      id: 3,
      title: "AePS BE History",
      subtitle: "Balance Enquiry",
      available: true,
    },
    {
      id: 4,
      title: "DMT",
      subtitle: "Direct Money Transfer",
      available: true,
    },
    {
      id: 5,
      title: "CMS",
      subtitle: "Cash Withdrawal",
      available: true,
    },
    {
      id: 6,
      title: "F-CMS",
      subtitle: "Cash Withdrawal",
      available: true,
    },
    {
      id: 7,
      title: "F-CMS",
      subtitle: "Cash Withdrawal",
      available: true,
    },
    {
      id: 8,
      title: "F-CMS",
      subtitle: "Cash Withdrawal",
      available: true,
    },
    {
      id: 9,
      title: "F-CMS",
      subtitle: "Cash Withdrawal",
      available: true,
    },
  ];

  // useEffect(() => {
  //   const activeIndex = tabs.indexOf(activeTab);
  //   const activeEl = tabRefs.current[activeIndex];
  //   const containerEl = containerRef.current;

  //   if (activeEl && containerEl) {
  //     const tabRect = activeEl.getBoundingClientRect();
  //     const containerRect = containerEl.getBoundingClientRect();

  //     setIndicator({
  //       width: tabRect.width,
  //       left: tabRect.left - containerRect.left,
  //     });
  //   }
  // }, [activeTab, tabs]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.ceil(transactionCards.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const paginatedCards = transactionCards.slice(startIndex, endIndex);

  // If AepsCWHistory should be shown, render it
  if (showAepsCWHistory) {
    return (
      <AepsCWHistory onBack={() => navigate("/adminDashboard/txn-history")} />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-1 sm:p-2 md:p-3 text-[#1B1717]">
      {/* Header Section */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-xl md:text-2xl text-[#1B1717] mb-1 sm:mb-2 font-[gilroy-medium]">
          Transaction History
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-[#1B1717]/80 font-[gilroy-regular]">
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
              font-[gilroy-semibold] whitespace-nowrap
              ${
                activeTab === tab
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
              key={card.id}
              className="bg-white border border-[#1B1717]/80 rounded-3xl shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col"
            >
              {/* Green Header Bar */}
              <div className="border-b-[0.5px] border-[#1B1717]/30 px-3 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between rounded-t">
                <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-[35px] md:h-[35px] rounded-full bg-[#039155] border border-[#039155]/50 flex items-center justify-center flex-shrink-0">
                  <Fingerprint className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-[20px] md:h-[20px] text-white" />
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5 rounded-full bg-white border border-[#039155]/50 px-1.5 py-0.5 sm:px-2 sm:py-1">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-[8px] md:h-[8px] rounded-full bg-[#039155]" />
                  <span className="text-[#039155] text-[9px] sm:text-[11px] font-[gilroy-semibold] whitespace-nowrap">
                    Active
                  </span>
                </div>
              </div>

              {/* White Body */}
              <div className="p-3 sm:p-4 md:p-5 flex-grow flex flex-col">
                <div className="mb-3 sm:mb-4 flex-grow">
                  <h3 className="font-[gilroy-semibold] sm:text-lg md:text-xl text-[#1B1717] mb-1.5 sm:mb-2">
                    {card.title}
                  </h3>

                  {/* FIRST subtitle */}
                  <p className="text-xs sm:text-sm text-[#1B1717]/80 font-[gilroy-regullar] mb-2 sm:mb-4">
                    {card.subtitle}
                  </p>

                  <div className="flex items-center justify-between gap-2">
                    {/* SECOND subtitle */}
                    <p className="text-sm sm:text-base font-[gilroy-semibold] text-[#1B1717] truncate">
                      {card.subtitle}
                    </p>

                    {card.available && (
                      <span className="text-xs sm:text-sm text-[#039155] font-[gilroy-medium] whitespace-nowrap flex-shrink-0">
                        Available
                      </span>
                    )}
                  </div>
                </div>

                {/* View History Button */}
                <button
                  onClick={() => {
                    if (card.title === "AEPS CW History") {
                      navigate(
                        "/adminDashboard/txn-history?view=aeps-cw-history",
                      );
                    }
                  }}
                  className="w-full bg-[#039155] text-white py-2 sm:py-2.5 md:py-3 rounded-xl font-[gilroy-semibold] hover:bg-green-700 transition text-xs sm:text-sm md:text-base mt-auto"
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
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-md font-[gilroy-regular] transition text-sm sm:text-base ${
                currentPage === page
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
