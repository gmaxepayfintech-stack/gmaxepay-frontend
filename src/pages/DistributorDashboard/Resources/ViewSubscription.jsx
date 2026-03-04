import React, { useState } from "react";
import PropTypes from "prop-types";
import { HiArrowLeft } from "react-icons/hi2";
import { ChevronDown, ChevronUp } from "lucide-react";

const ViewSubscription = ({ subscription = null, onBack }) => {
  // Section-level expand/collapse by operatorType (supports dynamic sections)
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSectionExpand = (key) => {
    setExpandedSections((prev) => {
      const isCurrentlyOpen = prev[key];
      // Accordion behavior: only one section open at a time, dynamic keys
      const resetState = Object.keys(prev).reduce(
        (acc, sectionKey) => ({ ...acc, [sectionKey]: false }),
        {},
      );
      return { ...resetState, [key]: !isCurrentlyOpen };
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

  // Group commissions by operatorType (dynamic sections)
  const commissions = subscription.originalData?.commissions || [];
  const groupedByType = commissions.reduce((acc, item) => {
    const type = item.operatorType || "OTHER";
    if (!acc[type]) acc[type] = [];
    acc[type].push(item);
    return acc;
  }, {});

  // Combined Mobile + DTH section (handles both "Recharge" and "RECHARGE", "DTH")
  const mobileDthCommissions = [
    ...(groupedByType["RECHARGE"] || []),
    ...(groupedByType["Recharge"] || []),
    ...(groupedByType["DTH"] || []),
  ].sort((a, b) => {
    // RECHARGE/Recharge operators first, then DTH
    const order = { RECHARGE: 0, Recharge: 0, DTH: 1 };
    const aOrder = order[a.operatorType] ?? 99;
    const bOrder = order[b.operatorType] ?? 99;
    if (aOrder !== bOrder) return aOrder - bOrder;
    // Within same type, sort by operator name
    return (a.operatorName || "").localeCompare(b.operatorName || "");
  });

  // All other types (including AEPS1, AEPS2, AEPS, BANK VERIFICATION, BBPS, etc.) get their own separate sections
  const dynamicSectionTypes = Object.keys(groupedByType).filter(
    (type) => !["RECHARGE", "Recharge", "DTH"].includes(type),
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
                      className="text-[14px] font-[Gilroy-Medium] text-[#121216] text-center"
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
                    // Determine badge text based on combination of commType and amtType
                    const commType = (comm.commType || "").toLowerCase();
                    const amtType = (comm.amtType || "").toLowerCase();

                    let badgeText = "";
                    if (commType === "com" && amtType === "fix") {
                      badgeText = "Commission/Flat";
                    } else if (commType === "com" && amtType === "per") {
                      badgeText = "Commission/Percentage";
                    } else if (commType === "sur" && amtType === "fix") {
                      badgeText = "Surcharge/Flat";
                    } else if (commType === "sur" && amtType === "per") {
                      badgeText = "Surcharge/Percentage";
                    } else {
                      // Fallback for any other combination
                      const commTypeDisplay = commType === "com" ? "Commission" :
                        commType === "sur" ? "Surcharge" :
                          (comm.commType || "").toUpperCase();
                      const amtTypeDisplay = amtType === "fix" ? "Flat" :
                        amtType === "per" ? "Percentage" :
                          (comm.amtType || "").toUpperCase();
                      badgeText = `${commTypeDisplay}/${amtTypeDisplay}`;
                    }

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
                          <div className="flex items-center justify-center gap-2 text-xs">
                            <div className="flex items-center justify-center text-[#121216] font-[Gilroy-Medium]">
                              {comm.commAmt}
                            </div>
                            <div className="flex items-center justify-center">
                              <span className="inline-flex px-2 py-1 rounded-md text-[10px] font-[Gilroy-Medium] bg-[#E8FFF4] text-[#039155] uppercase tracking-wide whitespace-nowrap">
                                {badgeText}
                              </span>
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
        <div className="flex items-center gap-3 sm:gap-4">
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
            <span className="text-sm sm:text-base font-[Gilroy-Regular] text-[#1B1717]">
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
            {/* Mobile And DTH Recharge Commissions Section */}
            {renderCommissionSection(
              "Mobile And DTH Recharge",
              mobileDthCommissions,
              "mobileDth",
            )}

            {/* Dynamic sections for all other operator types (AEPS1, AEPS2, AEPS, BANK VERIFICATION, BBPS, etc.) - each gets its own section */}
            {dynamicSectionTypes.map((type) =>
              renderCommissionSection(
                `${type} Commissions`,
                groupedByType[type] || [],
                type.toLowerCase().replace(/\s+/g, "_"),
              ),
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
