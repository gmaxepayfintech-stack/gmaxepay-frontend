import React, { useState } from "react";
import PropTypes from "prop-types";
import { HiArrowLeft } from "react-icons/hi2";
import { ChevronDown, ChevronUp } from "lucide-react";

const ViewSubscription = ({ subscription = null, onBack }) => {
  // Section-level expand/collapse by operatorType (AEPS, Mobile+DTH, BBPS)
  const [expandedSections, setExpandedSections] = useState({
    aeps: false,
    mobileDth: false,
    bbps: false,
  });

  const toggleSectionExpand = (key) => {
    setExpandedSections((prev) => {
      const isCurrentlyOpen = prev[key];
      return {
        aeps: false,
        mobileDth: false,
        bbps: false,
        [key]: !isCurrentlyOpen,
      };
    });
  };

  if (!subscription) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] p-2 sm:p-4 md:p-6 text-[#1B1717]">
        <div className="text-center py-12">
          <p className="text-[#1B1717]/60 font-['Gilroy-Regular']">
            No subscription data found
          </p>
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-[#039155] text-white rounded-lg font-['Gilroy-Medium'] hover:bg-[#039155]/90 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Group commissions by operatorType
  const commissions = subscription.originalData?.commissions || [];
  const aepsCommissions = commissions.filter(
    (c) => c.operatorType === "AEPS",
  );
  const mobileDthCommissions = commissions
    .filter((c) => c.operatorType === "RECHARGE" || c.operatorType === "DTH")
    .sort((a, b) => {
      // RECHARGE operators first, then DTH
      const order = { RECHARGE: 0, DTH: 1 };
      const aOrder = order[a.operatorType] ?? 99;
      const bOrder = order[b.operatorType] ?? 99;
      if (aOrder !== bOrder) return aOrder - bOrder;
      // Within same type, sort by operator name
      return (a.operatorName || "").localeCompare(b.operatorName || "");
    });
  const otherCommissions = commissions.filter(
    (c) =>
      c.operatorType !== "AEPS" &&
      c.operatorType !== "RECHARGE" &&
      c.operatorType !== "DTH",
  );

  const renderCommissionSection = (title, items, sectionKey) => {
    // If nothing to show, skip section
    if (items.length === 0) return null;

    const isSectionExpanded = expandedSections[sectionKey];

    return (
      <div className="mb-4 sm:mb-6">
        {/* Section Header with toggle (arrow on right) */}
        <div
          className="flex items-center justify-between mb-4 bg-[#FFFFFF] rounded-lg p-4 sm:p-6 cursor-pointer"
          onClick={() => toggleSectionExpand(sectionKey)}
        >
          <div>
            <h2 className="text-base sm:text-lg md:text-xl font-['Gilroy-SemiBold'] text-[#1B1717] mb-1">
              {title}
            </h2>
            <p className="text-sm sm:text-base font-['Gilroy-Regular'] text-[#1B1717]">
              Commissions
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleSectionExpand(sectionKey);
            }}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-[#DADADA] text-[#121216]"
          >
            {isSectionExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Commissions Table (only visible when expanded) */}
        {isSectionExpanded && (
          <div className="mb-4 sm:mb-6">
            <div className="bg-[#FFFFFF] rounded-lg mb-3">
              <div className="overflow-x-auto">
                <div className="min-w-[800px] grid grid-cols-4 gap-4 px-4 py-3">
                  {[
                    "SI No",
                    "Operator",
                    "Services",
                    "My Deal",
                  ].map((h, i) => (
                    <div
                      key={i}
                      className="text-[14px] font-[gilroy-medium] text-[#121216] text-center"
                    >
                      {h}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl overflow-x-auto">
              <div className="min-w-[800px]">
                {items.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-[#121216]/60">
                    No commission records found.
                  </div>
                ) : (
                  items.map((comm, index) => {
                    // Format commission type display
                    const commTypeDisplay = (comm.commType || "").toLowerCase() === "com" ? "Commission" : 
                                           (comm.commType || "").toLowerCase() === "sur" ? "Surcharge" : 
                                           (comm.commType || "").toUpperCase();
                    
                    const amtTypeDisplay = (comm.amtType || "").toLowerCase() === "per" ? "Percentage" : 
                                         (comm.amtType || "").toLowerCase() === "fix" ? "Fixed" : 
                                         (comm.amtType || "").toUpperCase();

                    return (
                      <div key={comm.id || index}>
                        <div className="grid grid-cols-4 gap-4 px-4 py-3 hover:bg-gray-50 items-center">
                          {/* SI No */}
                          <div className="flex items-center justify-center text-xs text-[#121216]">
                            {index + 1}
                          </div>

                          {/* Operator */}
                          <div className="flex items-center justify-center text-xs text-[#121216]">
                            {comm.operatorName}
                          </div>

                          {/* Services */}
                          <div className="flex items-center justify-center">
                            <span className="inline-flex px-2 py-1 rounded-md text-xs bg-[#4F7EF4] text-white w-fit">
                              {comm.operatorType}
                            </span>
                          </div>

                          {/* My Deal */}
                          <div className="flex flex-col items-center gap-1 text-xs">
                            <div className="text-[#121216]">
                              {comm.commAmt}
                            </div>
                            <div className="text-[#121216]/60">
                              {commTypeDisplay}/{amtTypeDisplay}
                            </div>
                          </div>
                        </div>
                        {index < items.length - 1 && (
                          <hr className="mx-4 border-[#1B1717]/20" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-2 sm:p-4 md:p-6 text-[#1B1717]">
      {/* Header Section with Back Arrow */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <button
            onClick={onBack}
            className="flex items-center text-[#1B1717] hover:text-[#039155] transition"
          >
            <div className="rounded-full p-2.5 sm:p-3 bg-[#FFFFFF] border-[0.5px] border-[#1B1717]/80 transition">
              <HiArrowLeft className="text-2xl sm:text-3xl text-[#1B1717] opacity-80" />
            </div>
          </button>
          <div className="flex flex-col">
            <h1 className="text-[20px] sm:text-2xl md:text-2xl font-['Gilroy-Medium'] text-[#1B1717]">
              {subscription.title} - Details
            </h1>
            <span className="block mt-2 sm:mt-0 text-sm sm:text-base font-[gilroy-regular] text-[#1B1717]">
              Complete subscription information
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm">
        {/* Commissions */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm">
          <div className="rounded-2xl bg-[#FAFAFA] p-4 mb-4 sm:mb-6">
            {/* AEPS Commissions Section */}
            {renderCommissionSection("AEPS Commissions", aepsCommissions, "aeps")}

            {/* Mobile And DTH Recharge Commissions Section */}
            {renderCommissionSection(
              "Mobile And DTH Recharge",
              mobileDthCommissions,
              "mobileDth",
            )}

            {/* BBPS Commissions Section */}
            {renderCommissionSection(
              "BBPS Commissions",
              otherCommissions,
              "bbps",
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

ViewSubscription.propTypes = {
  subscription: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    originalData: PropTypes.object,
  }),
  onBack: PropTypes.func.isRequired,
};

export default ViewSubscription;
