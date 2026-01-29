import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Check, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { HiArrowLeft } from "react-icons/hi2";
import { useDispatch, useSelector } from "react-redux";
import { useCompany } from "../../../context/CompanyContext";
import { useNotification } from "../../../context/NotificationContext";
import { getCompanySlabCommissionList, updateCompanySlabCommission } from "../../../redux/action/slabAction";

const EditMembership = ({ scheme = null, onBack }) => {
  const dispatch = useDispatch();
  const { company } = useCompany();
  const { success, error: showError } = useNotification();
  const companyFromRedux = useSelector((state) => state?.company?.company);
  const companyData = companyFromRedux || company;

  // Map scheme data from API format to display format
  const getSchemeMode = (schemeData) => {
    if (schemeData?.schemaMode) {
      const mode = schemeData.schemaMode.toLowerCase();
      return mode === "global" ? "Global" : mode === "private" ? "Private" : "Global";
    }
    if (schemeData?.schemeMode) {
      const mode = schemeData.schemeMode.toLowerCase();
      return mode === "global" ? "Global" : mode === "private" ? "Private" : "Global";
    }
    return "Global";
  };

  const getSchemeType = (schemeData) => {
    if (schemeData?.schemaType) {
      const type = schemeData.schemaType.toLowerCase();
      return type === "free" ? "Free" : type === "premium" ? "Premium" : "Free";
    }
    if (schemeData?.schemeType) {
      const type = schemeData.schemeType.toLowerCase();
      return type === "free" ? "Free" : type === "premium" ? "Premium" : "Free";
    }
    return "Free";
  };

  const [schemeName, setSchemeName] = useState(scheme?.name || scheme?.slabName || "");
  const [schemeMode, setSchemeMode] = useState(() => getSchemeMode(scheme));
  const [schemeType, setSchemeType] = useState(() => getSchemeType(scheme));

  // Redux state for commiss
  const { commData } = useSelector((state) => state?.slab || {});

  // Local editable commissions state and loading
  const [commissions, setCommissions] = useState([]);
  const [savingRows, setSavingRows] = useState({});
  const [commLoading, setCommLoading] = useState(false);
  // Section-level expand/collapse by operatorType (AEPS, Mobile+DTH, BBPS)
  const [expandedSections, setExpandedSections] = useState({
    aeps: false,
    mobileDth: false,
    bbps: false,
  });

  // Update scheme data when scheme prop changes
  useEffect(() => {
    if (scheme) {
      setSchemeName(scheme?.name || scheme?.slabName || "");
      setSchemeMode(getSchemeMode(scheme));
      setSchemeType(getSchemeType(scheme));
    }
  }, [scheme]);

  // Fetch commission list when component mounts or scheme changes
  useEffect(() => {
    const fetchComm = async () => {
      const companyId = getCompanyId();
      const slabId = scheme?.id || scheme?.slabId;
      if (companyId && slabId) {
        setCommLoading(true);
        try {
          await dispatch(getCompanySlabCommissionList(companyId, slabId, 1, 10));
        } finally {
          setCommLoading(false);
        }
      }
    };
    fetchComm();
  }, [dispatch, companyData, scheme]);

  // Map API commission data to local editable structure
  useEffect(() => {
    if (commData && Array.isArray(commData)) {
      const mapped = commData.map((item, index) => {
        const firstInstrument = item.instruments?.[0];
        const roles = firstInstrument?.roles || [];
        const wuRole = roles.find((r) => r.roleName === "WU") || {};
        const mdRole = roles.find((r) => r.roleName === "MD") || {};
        const diRole = roles.find((r) => r.roleName === "DI") || {};
        const reRole = roles.find((r) => r.roleName === "RE") || {};

        return {
          id: `${item.operatorId}-${index}`,
          operator: item.operatorName || "",
          operatorType: item.operatorType || "",
          myDeal: item.marginCommAmt != null ? String(item.marginCommAmt) : "",
          myDealCommType: item.marginCommType || "",
          myDealType: item.marginAmtType || "",
          // WU (Whitelabel)
          whitelabel: wuRole.commAmt != null ? String(wuRole.commAmt) : "",
          whitelabelCommType: wuRole.commType || "",
          whitelabelType: wuRole.amtType || "",
          wlRoleId: wuRole.id,
          originalWhitelabel: wuRole.commAmt != null ? String(wuRole.commAmt) : "",
          originalWhitelabelCommType: wuRole.commType || "",
          originalWhitelabelType: wuRole.amtType || "",
          // MD (Master Distributor)
          masterDistributor: mdRole.commAmt != null ? String(mdRole.commAmt) : "",
          masterDistributorCommType: mdRole.commType || "",
          masterDistributorType: mdRole.amtType || "",
          mdRoleId: mdRole.id,
          originalMasterDistributor: mdRole.commAmt != null ? String(mdRole.commAmt) : "",
          originalMasterDistributorCommType: mdRole.commType || "",
          originalMasterDistributorType: mdRole.amtType || "",
          // DI (Distributor)
          distributor: diRole.commAmt != null ? String(diRole.commAmt) : "",
          distributorCommType: diRole.commType || "",
          distributorType: diRole.amtType || "",
          diRoleId: diRole.id,
          originalDistributor: diRole.commAmt != null ? String(diRole.commAmt) : "",
          originalDistributorCommType: diRole.commType || "",
          originalDistributorType: diRole.amtType || "",
          // RE (Retailer)
          retailer: reRole.commAmt != null ? String(reRole.commAmt) : "",
          retailerCommType: reRole.commType || "",
          retailerType: reRole.amtType || "",
          reRoleId: reRole.id,
          originalRetailer: reRole.commAmt != null ? String(reRole.commAmt) : "",
          originalRetailerCommType: reRole.commType || "",
          originalRetailerType: reRole.amtType || "",
        };
      });
      setCommissions(mapped);
    }
  }, [commData]);

  const handleCommissionChange = (id, field, value) => {
    setCommissions(
      commissions.map((comm) =>
        comm.id === id ? { ...comm, [field]: value } : comm,
      ),
    );
  };

  const toggleSectionExpand = (key) => {
    setExpandedSections((prev) => {
      const isCurrentlyOpen = prev[key];
      // Accordion behavior: only one section open at a time
      return {
        aeps: false,
        mobileDth: false,
        bbps: false,
        [key]: !isCurrentlyOpen,
      };
    });
  };

  const getCompanyId = () => {
    return companyData?.companyId || companyData?._id || companyData?.id || null;
  };

  const handleSaveCommissionRow = async (commission) => {
    try {
      const companyId = getCompanyId();
      const slabId = scheme?.id || scheme?.slabId;

      if (!companyId || !slabId) {
        showError("Company or slab information missing");
        return;
      }

      const isWlChanged =
        commission.whitelabel !== commission.originalWhitelabel ||
        (commission.whitelabelCommType || "").toLowerCase() !==
          (commission.originalWhitelabelCommType || "").toLowerCase() ||
        (commission.whitelabelType || "").toLowerCase() !==
          (commission.originalWhitelabelType || "").toLowerCase();

      const isMdChanged =
        commission.masterDistributor !== commission.originalMasterDistributor ||
        (commission.masterDistributorCommType || "").toLowerCase() !==
          (commission.originalMasterDistributorCommType || "").toLowerCase() ||
        (commission.masterDistributorType || "").toLowerCase() !==
          (commission.originalMasterDistributorType || "").toLowerCase();

      const isDiChanged =
        commission.distributor !== commission.originalDistributor ||
        (commission.distributorCommType || "").toLowerCase() !==
          (commission.originalDistributorCommType || "").toLowerCase() ||
        (commission.distributorType || "").toLowerCase() !==
          (commission.originalDistributorType || "").toLowerCase();

      const isReChanged =
        commission.retailer !== commission.originalRetailer ||
        (commission.retailerCommType || "").toLowerCase() !==
          (commission.originalRetailerCommType || "").toLowerCase() ||
        (commission.retailerType || "").toLowerCase() !==
          (commission.originalRetailerType || "").toLowerCase();

      if (!isWlChanged && !isMdChanged && !isDiChanged && !isReChanged) {
        return;
      }

      setSavingRows((prev) => ({ ...prev, [commission.id]: true }));

      const requests = [];

      if (isWlChanged && commission.wlRoleId) {
        requests.push(
          dispatch(
            updateCompanySlabCommission(companyId, commission.wlRoleId, {
              commAmt: Number(commission.whitelabel) || 0,
              commType: commission.whitelabelCommType,
              amtType: commission.whitelabelType,
            }),
          ),
        );
      }

      if (isMdChanged && commission.mdRoleId) {
        requests.push(
          dispatch(
            updateCompanySlabCommission(companyId, commission.mdRoleId, {
              commAmt: Number(commission.masterDistributor) || 0,
              commType: commission.masterDistributorCommType,
              amtType: commission.masterDistributorType,
            }),
          ),
        );
      }

      if (isDiChanged && commission.diRoleId) {
        requests.push(
          dispatch(
            updateCompanySlabCommission(companyId, commission.diRoleId, {
              commAmt: Number(commission.distributor) || 0,
              commType: commission.distributorCommType,
              amtType: commission.distributorType,
            }),
          ),
        );
      }

      if (isReChanged && commission.reRoleId) {
        requests.push(
          dispatch(
            updateCompanySlabCommission(companyId, commission.reRoleId, {
              commAmt: Number(commission.retailer) || 0,
              commType: commission.retailerCommType,
              amtType: commission.retailerType,
            }),
          ),
        );
      }

      const results = await Promise.all(requests);
      const allOk = results.every((r) => r?.success);

      if (allOk) {
        const okResult = results.find((r) => r?.success);
        const statusText = okResult?.status || "SUCCESS";
        const messageText =
          okResult?.message || "Slab commission updated successfully";
        const apiMessage = `${statusText} - ${messageText}`;
        success(apiMessage);
        // refresh list to sync originals
        await dispatch(getCompanySlabCommissionList(companyId, slabId, 1, 10));
      } else {
        const firstError =
          results.find((r) => !r?.success)?.message ||
          "Failed to update slab commission";
        showError(firstError);
      }
    } catch (err) {
      showError(
        err?.message || "An error occurred while updating slab commission",
      );
    } finally {
      setSavingRows((prev) => ({ ...prev, [commission.id]: false }));
    }
  };

  // Group commissions by operatorType
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
    // If nothing to show and not loading, skip section
    if (!commLoading && items.length === 0) return null;

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
                  <div className="min-w-[1200px] grid grid-cols-8 gap-4 px-4 py-3">
                    {[
                      "Operator",
                      "Operator Type",
                      "My Deal",
                      "ENT Margin",
                      "Master Distributor",
                      "Distributor",
                      "Retailer",
                      "Actions",
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
                <div className="min-w-[1200px]">
                  {commLoading && items.length === 0 ? (
                    Array.from({ length: 6 }).map((_, index) => (
                      <div key={index}>
                        <div className="grid grid-cols-8 gap-4 px-4 py-3 animate-pulse">
                          <span className="h-3 bg-gray-200 rounded w-20" />
                          <span className="h-5 bg-gray-200 rounded w-16" />
                          <span className="h-3 bg-gray-200 rounded w-12" />
                          <span className="h-8 bg-gray-200 rounded w-full" />
                          <span className="h-8 bg-gray-200 rounded w-full" />
                          <span className="h-8 bg-gray-200 rounded w-full" />
                          <span className="h-8 bg-gray-200 rounded w-full" />
                          <div className="flex items-center justify-center">
                            <span className="h-7 w-7 bg-gray-200 rounded-full" />
                          </div>
                        </div>
                        {index < 5 && (
                          <div className="h-[1px] bg-[#EAEAEA] mx-4"></div>
                        )}
                      </div>
                    ))
                  ) : items.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-[#121216]/60">
                      No commission records found.
                    </div>
                  ) : (
                    items.map((commission, index) => {
                      const isWlChanged =
                        commission.whitelabel !== commission.originalWhitelabel ||
                        (commission.whitelabelCommType || "").toLowerCase() !==
                          (commission.originalWhitelabelCommType || "").toLowerCase() ||
                        (commission.whitelabelType || "").toLowerCase() !==
                          (commission.originalWhitelabelType || "").toLowerCase();

                      const isMdChanged =
                        commission.masterDistributor !== commission.originalMasterDistributor ||
                        (commission.masterDistributorCommType || "").toLowerCase() !==
                          (commission.originalMasterDistributorCommType || "").toLowerCase() ||
                        (commission.masterDistributorType || "").toLowerCase() !==
                          (commission.originalMasterDistributorType || "").toLowerCase();

                      const isDiChanged =
                        commission.distributor !== commission.originalDistributor ||
                        (commission.distributorCommType || "").toLowerCase() !==
                          (commission.originalDistributorCommType || "").toLowerCase() ||
                        (commission.distributorType || "").toLowerCase() !==
                          (commission.originalDistributorType || "").toLowerCase();

                      const isReChanged =
                        commission.retailer !== commission.originalRetailer ||
                        (commission.retailerCommType || "").toLowerCase() !==
                          (commission.originalRetailerCommType || "").toLowerCase() ||
                        (commission.retailerType || "").toLowerCase() !==
                          (commission.originalRetailerType || "").toLowerCase();

                      const isDirty = isWlChanged || isMdChanged || isDiChanged || isReChanged;
                      const isSaving = !!savingRows[commission.id];

                      const renderCommissionInput = (fieldPrefix, label) => {
                        const value = commission[fieldPrefix] || "";
                        const commType = commission[`${fieldPrefix}CommType`] || "";
                        const amtType = commission[`${fieldPrefix}Type`] || "";

                      return (
                            <div className="flex flex-col items-center gap-1 text-xs">
                              <div className="flex items-center justify-center gap-2">
                                <input
                                  type="text"
                                value={value}
                                  onChange={(e) =>
                                    handleCommissionChange(
                                      commission.id,
                                    fieldPrefix,
                                      e.target.value,
                                    )
                                  }
                                  className="w-28 px-3 py-1.5 border rounded-md text-xs"
                                />
                              </div>
                              <div className="flex gap-3">
                              {/* C / S group - single pill split in half */}
                              <div className="inline-flex rounded overflow-hidden border border-[#DADADA] bg-white">
                                {[
                                  { code: "C", value: "com" },
                                  { code: "S", value: "sur" },
                                ].map((opt, idx) => {
                                  const current = (commType || "").toLowerCase();
                                  const isActive = current === opt.value;
                                  return (
                                    <button
                                      key={opt.code}
                                      type="button"
                                      onClick={() =>
                                        handleCommissionChange(
                                          commission.id,
                                          `${fieldPrefix}CommType`,
                                          opt.value,
                                        )
                                      }
                                      className={`min-w-[24px] px-2 py-0.5 text-[10px] font-[gilroy-medium] uppercase ${
                                        isActive
                                          ? "bg-[#000000] text-white"
                                          : "bg-white text-[#121216]"
                                      } ${idx === 0 ? "border-r border-[#DADADA]" : ""}`}
                                    >
                                      {opt.code}
                                    </button>
                                  );
                                })}
                              </div>

                              {/* P / F group - single pill split in half */}
                              <div className="inline-flex rounded overflow-hidden border border-[#DADADA] bg-white">
                                {[
                                  { code: "P", value: "per" },
                                  { code: "F", value: "fix" },
                                ].map((opt, idx) => {
                                  const current = (amtType || "").toLowerCase();
                                  const isActive = current === opt.value;
                                  return (
                                    <button
                                      key={opt.code}
                                      type="button"
                                      onClick={() =>
                                        handleCommissionChange(
                                          commission.id,
                                          `${fieldPrefix}Type`,
                                          opt.value,
                                        )
                                      }
                                      className={`min-w-[24px] px-2 py-0.5 text-[10px] font-[gilroy-medium] uppercase ${
                                        isActive
                                          ? "bg-[#000000] text-white"
                                          : "bg-white text-[#121216]"
                                      } ${idx === 0 ? "border-r border-[#DADADA]" : ""}`}
                                    >
                                      {opt.code}
                                    </button>
                                  );
                                })}
                              </div>
                              </div>
                            </div>
                        );
                      };

                      return (
                        <div key={commission.id || index}>
                          <div className="grid grid-cols-8 gap-4 px-4 py-3 hover:bg-gray-50 items-center">
                            <div className="flex items-center justify-center text-xs text-[#121216]">
                              {commission.operator}
                            </div>

                            <div className="flex items-center justify-center">
                              <span className="inline-flex px-2 py-1 rounded-md text-xs bg-[#4F7EF4] text-white w-fit">
                                {commission.operatorType}
                              </span>
                            </div>

                            <div className="flex flex-col items-center gap-1 text-xs">
                              <div className="flex items-center gap-1.5">
                                <span>{commission.myDeal}</span>
                                {commission.myDealCommType && (
                                  <span className="inline-flex px-1.5 py-0.5 rounded-full bg-[#E8FFF4] text-[10px] font-[gilroy-medium] uppercase tracking-wide text-[#039155]">
                                    {commission.myDealCommType}
                                  </span>
                                )}
                                {commission.myDealType && (
                                  <span className="inline-flex px-1.5 py-0.5 rounded-full bg-[#EEF2FF] text-[10px] font-[gilroy-medium] uppercase tracking-wide text-[#4F7EF4]">
                                    {(commission.myDealType || "").toLowerCase() === "fix" ? "flat" : 
                                     (commission.myDealType || "").toLowerCase() === "per" ? "per" : 
                                     commission.myDealType}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Whitelabel (WU) */}
                            {renderCommissionInput("whitelabel", "Whitelabel")}

                            {/* Master Distributor (MD) */}
                            {renderCommissionInput("masterDistributor", "Master Distributor")}

                            {/* Distributor (DI) */}
                            {renderCommissionInput("distributor", "Distributor")}

                            {/* Retailer (RE) */}
                            {renderCommissionInput("retailer", "Retailer")}

                            <div className="flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => handleSaveCommissionRow(commission)}
                                disabled={!isDirty || isSaving}
                                className={`w-9 h-7 rounded border flex items-center justify-center transition ${
                                  isDirty
                                    ? "border-[#039155] bg-[#039155]/10 hover:bg-[#039155]/20"
                                    : "border-[#DADADA] bg-white cursor-default opacity-60"
                                } ${isSaving ? "cursor-wait opacity-70" : ""}`}
                              >
                                <Check
                                  className={`w-5 h-5 ${
                                    isDirty ? "text-[#039155]" : "text-[#121216]"
                                  }`}
                                />
                              </button>
                            </div>
                          </div>
                          <hr className="mx-4 border-[#1B1717]/20" />
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
    <div className="min-h-screen py-4 px-2 text-[#1B1717]">
      {/* Header Section */}
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
              Edit Membership Scheme
            </h1>
            <span className="block mt-2 sm:mt-0  text-sm sm:text-base font-[gilroy-regular] text-[#1B1717]">
              Configure Your Membership Settings And Commissions
            </span>
          </div>
        </div>
      </div>

      {/* Scheme Settings Section */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm mb-4 sm:mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
          {/* Scheme Name - Left */}
          <div>
            <label className="block text-xs sm:text-sm font-[gilroy-medium] text-[#121216] mb-2">
              Scheme Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter Scheme Name"
              value={schemeName}
              onChange={(e) => setSchemeName(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-[#1B1717]/80 rounded-lg focus:outline-none text-xs sm:text-sm text-[#1B1717]/80"
            />
          </div>

          {/* Empty column for spacing */}
          <div className="hidden md:block"></div>

          {/* Scheme Mode - Right */}
          <div>
            <label className="block text-xs sm:text-sm font-[gilroy-medium] text-[#121216] mb-2">
              Scheme Mode
            </label>
            <label className="flex items-start gap-3 px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg bg-white">
              <div className="relative mt-1 flex-shrink-0">
                <div className="w-4 h-4 rounded-full border-2 border-[#039155] bg-[#039155] flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <span className="text-xs font-[gilroy-medium] block text-[#1B1717]/80">
                  {schemeMode}
                </span>
                <p className="text-xs text-[#1B1717]/80 font-[gilroy-regular] leading-relaxed">
                  {schemeMode === "Global"
                    ? "Available To All Users Worldwide"
                    : "Restricted To Specific Users"}
                </p>
              </div>
            </label>
          </div>

          {/* Scheme Type - Right */}
          <div>
            <label className="block text-xs sm:text-sm font-[gilroy-medium] text-[#121216] mb-2">
              Scheme Type
            </label>
            <label className="flex items-start gap-3 px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg bg-white">
              <div className="relative mt-1 flex-shrink-0">
                <div className="w-4 h-4 rounded-full border-2 border-[#039155] bg-[#039155] flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <span className="text-xs font-[gilroy-medium] block text-[#1B1717]/80">
                  {schemeType}
                </span>
                <p className="text-xs text-[#1B1717]/80 font-[gilroy-regular] leading-relaxed">
                  {schemeType === "Free"
                    ? "No Cost Membership"
                    : "Restricted Access With Invitation Only"}
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* All commissions in a single outer section with grey background */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm">
        <div className="rounded-2xl bg-[#FAFAFA] p-4 mb-4 sm:mb-6 ">
          {/* AEPS Commissions Section (accordion by operatorType) */}
          {renderCommissionSection("AEPS Commissions", aepsCommissions, "aeps")}

          {/* Mobile And DTH Recharge Commissions Section (accordion by operatorType) */}
          {renderCommissionSection(
            "Mobile And DTH Recharge",
            mobileDthCommissions,
            "mobileDth",
          )}

          {/* BBPS Commissions Section (accordion by operatorType) */}
          {renderCommissionSection(
            "BBPS Commissions",
            otherCommissions,
            "bbps",
          )}
        </div>
      </div>
    </div>
  );
};

EditMembership.propTypes = {
  scheme: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    schemeId: PropTypes.string,
    created: PropTypes.string,
    members: PropTypes.string,
    tags: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        color: PropTypes.string,
      }),
    ),
  }),
  onBack: PropTypes.func.isRequired,
};

export default EditMembership;
