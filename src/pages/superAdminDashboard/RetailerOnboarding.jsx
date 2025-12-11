import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { FaSearch, FaCheckCircle, FaTimesCircle, FaUser, FaIdCard, FaBuilding, FaUniversity, FaExpand } from "react-icons/fa";
import * as XLSX from "xlsx";
import { useList as useListAction, kycData as kycDataAction, kycStatusCheck, kycUnlock, kycRevert, rescendOnboarding, deActiveOnboarding } from "../../redux/action/whiteLabelAction";

const RetailerOnboarding = ({ embedded = false, tableData: propTableData = [] }) => {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]); // Default to today's date
  const [selectedKycData, setSelectedKycData] = useState(null);
  const [showKycModal, setShowKycModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [zoomedImage, setZoomedImage] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [kycDataRefreshKey, setKycDataRefreshKey] = useState(0);
  const kycModalRef = useRef(null);

  // Get KYC details from Redux state - watch the entire kycDetails object to detect changes
  const kycDetailsState = useSelector((state) => state?.whitelabel?.kycDetails);
  const kycRetrieved = kycDetailsState?.data || null;

  // Get kycStatusCheck success state to refresh table after update
  const kycStatusCheckResponse = useSelector((state) => state?.whitelabel?.kycStatusCheck);

  // Get kycRevert success state to refresh KYC data after revert
  const kycRevertResponse = useSelector((state) => state?.whitelabel?.kycRevert);

  // Use prop data from API - no dummy data
  const allTableData = Array.isArray(propTableData) && propTableData.length > 0 ? propTableData : [];
  
  // Get total count from Redux state (if available) or use current data length
  const totalCountFromRedux = useSelector((state) => {
    const response = state?.whitelabel?.whitelabelList;
    return response?.totalCount || response?.total || 0;
  });
  
  // Use Redux total count if available, otherwise use current data length
  const totalCount = totalCountFromRedux > 0 ? totalCountFromRedux : allTableData.length;

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch data from API when search term or page changes
  useEffect(() => {
    if (debouncedSearchTerm.trim()) {
      const payload = {
        query: {
          userRole: 5, // Retailer role
          kycStatus: "pending",
        },
        options: {
          sort: { id: -1 },
          page: currentPage,
          paginate: 5,
        },
        customSearch: {
          mobileNo: debouncedSearchTerm.trim(),
          name: debouncedSearchTerm.trim(),
        },
      };
      dispatch(useListAction(payload));
    }
  }, [debouncedSearchTerm, currentPage, dispatch]);

  // Use Redux data when search is active, otherwise use prop data
  const reduxTableData = useSelector((state) => state?.whitelabel?.whitelabelList?.whitelabelList || []);
  const finalTableData = debouncedSearchTerm.trim() ? reduxTableData : allTableData;
  const finalTotalCount = debouncedSearchTerm.trim() && totalCountFromRedux > 0 ? totalCountFromRedux : finalTableData.length;
  const finalTotalPages = finalTotalCount > 0 ? Math.ceil(finalTotalCount / 5) : 0;
  const finalStartIndex = (currentPage - 1) * 5;
  const finalEndIndex = finalStartIndex + 5;
  const displayTableData = finalTableData.slice(finalStartIndex, finalEndIndex);

  // Update selectedKycData when Redux state changes
  useEffect(() => {
    if (kycRetrieved && showKycModal) {
      // Force update by creating a deep copy to ensure React detects the change
      try {
        const deepCopy = structuredClone(kycRetrieved);
        setSelectedKycData(deepCopy);
      } catch (error) {
        // Fallback to shallow copy if deep copy fails
        console.warn("Failed to deep clone KYC data, using shallow copy:", error);
        setSelectedKycData({ ...kycRetrieved });
      }
    }
  }, [kycDetailsState, kycRetrieved, showKycModal, kycDataRefreshKey]);

  // Refresh KYC data when revert succeeds
  useEffect(() => {
    if (kycRevertResponse?.status === "SUCCESS" && selectedUserId && showKycModal) {
      // Clear current data to force re-render
      setSelectedKycData(null);
      // Small delay to ensure backend has processed the revert
      const timer = setTimeout(() => {
        // Force update by incrementing refresh key
        setKycDataRefreshKey(prev => prev + 1);
        // Refresh KYC data after revert
        dispatch(kycDataAction(selectedUserId));
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [kycRevertResponse, selectedUserId, showKycModal, dispatch]);

  // Refresh table when kycStatusCheck succeeds
  useEffect(() => {
    if (kycStatusCheckResponse?.status === "SUCCESS") {
      // Refresh table data by dispatching useList again
      if (debouncedSearchTerm.trim()) {
        const payload = {
          query: {
            userRole: 5, // Retailer role
            kycStatus: "pending",
          },
          options: {
            sort: { id: -1 },
            page: currentPage,
            paginate: 5,
          },
          customSearch: {
            mobileNo: debouncedSearchTerm.trim(),
            name: debouncedSearchTerm.trim(),
          },
        };
        dispatch(useListAction(payload));
      }
    }
  }, [kycStatusCheckResponse, debouncedSearchTerm, currentPage, dispatch]);

  // Handle click outside modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (kycModalRef.current && !kycModalRef.current.contains(event.target)) {
        setShowKycModal(false);
        setSelectedKycData(null);
      }
    };

    if (showKycModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showKycModal]);

  // Export to Excel function
  const handleExportToExcel = () => {
    if (!finalTableData || finalTableData.length === 0) {
      alert("No data available to export");
      return;
    }

    // Prepare data for Excel export
    const excelData = finalTableData.map((row) => ({
      "ID": row.id || "N/A",
      "Date": row.date || "N/A",
      "User ID": row.userId || "N/A",
      "Name": row.name || "N/A",
      "User Role": row.userRole || "N/A",
      "Mobile No": row.mobileNo || "N/A",
      "Email Id": row.email || "N/A",
      "Parent Name": row.parentName || "N/A",
      "Parent Role": row.parentRole || "N/A",
      "Company Name": row.company || "N/A",
      "KYC Status": row.kycStatus || "N/A",
      "KYC Steps": row.kycSteps || "0",
      "Main Wallet": row.wallet?.mainWallet || "0",
      "AEPS Wallet": row.wallet?.apesWallet || "0",
      "Status": row.status || "Active",
    }));

    // Create a new workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Retailer Onboarding Data");

    // Generate Excel file and download
    const fileName = `Retailer_Onboarding_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // Helper function to get wallet value
  const getWalletValue = (wallet, type = "mainWallet") => {
    if (!wallet) return "0";
    if (typeof wallet === 'object' && wallet !== null) {
      const value = wallet[type] || wallet.mainWallet || wallet.apesWallet || "0";
      return String(value);
    }
    return String(wallet);
  };

  // Helper function to safely convert any value to string
  const safeString = (value, fallback = "N/A") => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch {
        return fallback;
      }
    }
    return String(value);
  };

  // Format date from API
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB').replaceAll('/', '-');
    } catch {
      return "N/A";
    }
  };

    return (
    <div className={`text-[#1B1717] ${embedded ? '[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]' : 'min-h-screen p-4 sm:p-6'}`}>
            {embedded ? (
        <div className="flex flex-col min-h-[calc(100vh-300px)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {/* Header Section */}
                    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${embedded ? 'py-4 mb-0' : 'mb-6'}`}>
                        <h1 className="text-lg sm:text-2xl lg:text-2xl font-medium text-[#1B1717]">
              Retailer Onboarding List
                        </h1>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            {/* From Date */}
                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] bg-white w-full sm:w-auto cursor-pointer"
                                />

                            {/* To Date */}
                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                min={fromDate || undefined}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] bg-white w-full sm:w-auto cursor-pointer"
              />

              {/* Search Input */}
              <div className="relative w-full sm:w-48">
                <input
                  type="text"
                  placeholder="Search by Mobile No or Name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-4 pr-10 py-2 w-full text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] bg-white"
                />
                <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                            </div>

              {/* Export Button */}
              <button
                onClick={handleExportToExcel}
                className="flex items-center justify-center gap-2 bg-[#039155] text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 shadow-md text-sm"
              >
                Export
              </button>
                        </div>
                    </div>

                    {/* Table */}
        <div className="flex-1 overflow-x-auto -mx-4 sm:mx-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        <div className="inline-block min-w-full align-middle">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="border-b bg-gray-100 border-gray-200">
                                        <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                    ID
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                                            Date
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                    User ID
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                    Name
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                                            User Role
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                    Mobile No
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                                            Email Id
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                                            Parent Name
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                                            Parent Role
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                    Company
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                    KYC Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                    KYC Steps
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                                            Main Wallet
                                        </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                    AEPS Wallet
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                    KYC Details
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                    Action
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                    Lock Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                    Onboarding
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                  Token Expire
                  </th>
                                    </tr>
                                </thead>

                                <tbody>
                {!displayTableData || displayTableData.length === 0 ? (
                  <tr>
                    <td colSpan={20} className="py-12 text-center">
                      <p className="text-gray-500 text-lg font-medium">No data available</p>
                    </td>
                  </tr>
                ) : (
                  displayTableData.map((row, index) => (
                    <tr
                      key={row.id || index}
                      className={`border-b border-gray-100 ${index % 2 === 0 ? "bg-white" : "bg-green-50"}`}
                                        >
                                            <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                        {safeString(row.id, "N/A")}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                        {formatDate(row.date)}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                        {safeString(row.userId, "N/A")}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                        {safeString(row.name, "N/A")}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                        {safeString(row.userRole, "N/A")}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                        {safeString(row.mobileNo, "N/A")}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                        {safeString(row.email, "N/A")}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                        {safeString(row.parentName, "N/A")}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                        {safeString(row.parentRole, "N/A")}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                        {safeString(row.company, "N/A")}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                        {(() => {
                          const status = row.kycStatus?.toLowerCase();
                          let className = "px-2 py-1 rounded text-xs font-medium ";
                          if (status === "completed" || status === "full_kyc") {
                            className += "bg-green-100 text-green-700";
                          } else if (status === "pending") {
                            className += "bg-yellow-100 text-yellow-700";
                          } else {
                            className += "bg-red-100 text-red-700";
                          }
                          return (
                            <span className={className}>
                              {safeString(row.kycStatus, "N/A")}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap text-center">
                        {safeString(row.kycSteps, "0")}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap text-center">
                        {getWalletValue(row.wallet, "mainWallet")}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap text-center">
                        {getWalletValue(row.wallet, "apesWallet")}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-lg text-white text-xs font-medium ${
                            row.status?.toLowerCase() === "active"
                              ? "bg-green-600"
                              : "bg-red-600"
                          }`}
                        >
                          {safeString(row.status, "Active")}
                        </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                        <button
                          onClick={() => {
                            const userId = row.id || row.originalItem?.id;
                            if (userId) {
                              setSelectedUserId(userId);
                              dispatch(kycDataAction(userId));
                              setShowKycModal(true);
                            }
                          }}
                          className="px-3 py-1 border border-black text-green-600 rounded-lg hover:bg-green-50 text-xs font-medium"
                        >
                          KYC Details
                        </button>
                                            </td>
                                            {/* Action - Toggle Button */}
                                            <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                                              {(() => {
                                                const userId = row.id || row.originalItem?.id;
                                                const isActive = row.status?.toLowerCase() === "active";

                                                return (
                                                  <button
                                                    onClick={() => {
                                                      if (userId) {
                                                        // Handle both cases: active → inactive and inactive → active
                                                        if (isActive) {
                                                          // Toggling from active to inactive (OFF)
                                                          dispatch(kycStatusCheck(userId, { isActive: "false" }));
                                                        } else {
                                                          // Toggling from inactive to active (ON)
                                                          dispatch(kycStatusCheck(userId, { isActive: "true" }));
                                                        }

                                                        // Immediately refresh table data after dispatching
                                                        setTimeout(() => {
                                                          const payload = {
                                                            query: {
                                                              userRole: 5, // Retailer role
                                                              kycStatus: "pending",
                                                            },
                                                            options: {
                                                              sort: { id: -1 },
                                                              page: currentPage,
                                                              paginate: 5,
                                                            },
                                                            customSearch: {
                                                              mobileNo: debouncedSearchTerm.trim(),
                                                              name: debouncedSearchTerm.trim(),
                                                            },
                                                          };
                                                          dispatch(useListAction(payload));
                                                        }, 500);
                                                      }
                                                    }}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-offset-1 ${isActive
                                                      ? "bg-green-600"
                                                      : "bg-gray-300"
                                                      }`}
                                                    role="switch"
                                                    aria-checked={isActive}
                                                  >
                                                    <span
                                                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive
                                                        ? "translate-x-6"
                                                        : "translate-x-1"
                                                        }`}
                                                    />
                                                  </button>
                                                );
                                              })()}
                                            </td>
                                            {/* Lock Status - Colored Button */}
                                            <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                                              {(() => {
                                                const userId = row.id || row.originalItem?.id;
                                                const isLocked = row?.originalItem?.lock === true || row?.originalItem?.lock === "true";
                                                console.log("Lock status check:", {userId, isLocked, rowLock: row?.lock, originalItemLock: row?.originalItem?.lock, row });
                                                return (
                                                  <button
                                                    onClick={() => {
                                                      // Only trigger API when button is in "Locked" state
                                                      if (userId && isLocked) {
                                                        // Dispatch unlock action with the row ID
                                                        dispatch(kycUnlock(userId));

                                                        // Refresh table data after dispatching
                                                        setTimeout(() => {
                                                          const payload = {
                                                            query: {
                                                              userRole: 5, // Retailer role
                                                              kycStatus: "pending",
                                                            },
                                                            options: {
                                                              sort: { id: -1 },
                                                              page: currentPage,
                                                              paginate: 5,
                                                            },
                                                            customSearch: {
                                                              mobileNo: debouncedSearchTerm.trim(),
                                                              name: debouncedSearchTerm.trim(),
                                                            },
                                                          };
                                                          dispatch(useListAction(payload));
                                                        }, 500);
                                                      }
                                                    }}
                                                    disabled={!isLocked}
                                                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                                                      isLocked
                                                        ? "bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                                                        : "bg-green-500 text-white cursor-not-allowed opacity-75"
                                                    }`}
                                                    title={isLocked ? "Click to unlock" : "Already unlocked"}
                                                  >
                                                    {isLocked ? "Locked" : "Unlocked"}
                                                  </button>
                                                );
                                              })()}
                                            </td>
                                            {/* Onboarding - Re-send Button */}
                                            <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                                              {(() => {
                                                const userId = row.id || row.originalItem?.id;
                                                return (
                                                  <button
                                                    onClick={() => {
                                                      if (userId) {
                                                        dispatch(rescendOnboarding(userId));
                                                      }
                                                    }}
                                                    className="px-3 py-1 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 text-xs font-medium transition-colors"
                                                  >
                                                    Re-send
                                                  </button>
                                                );
                                              })()}
                                            </td>
                                            {/* Deactivation - Send Button */}
                                            <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                                              {(() => {
                                                const userId = row.id || row.originalItem?.id;
                                                return (
                                                  <button
                                                    onClick={() => {
                                                      if (userId) {
                                                        dispatch(deActiveOnboarding(userId));
                                                      }
                                                    }}
                                                    className="px-3 py-1 border border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 text-xs font-medium transition-colors"
                                                  >
                                                    Send
                                                  </button>
                                                );
                                              })()}
                                            </td>
                                        </tr>
                  ))
                )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
        <div className="flex items-center justify-center mt-auto pt-6 pb-4">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1 || finalTotalPages === 0}
            className={`p-2 rounded-lg border border-gray-300 transition ${
              currentPage === 1 || finalTotalPages === 0
                ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
                : "bg-white text-[#1B1717] hover:bg-gray-50"
            }`}
          >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
          {finalTotalPages > 0 ? (
            Array.from({ length: finalTotalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-lg font-medium transition ${
                  page === currentPage
                                        ? "bg-[#039155] text-white"
                                        : "bg-white border border-gray-300 text-[#1B1717] hover:bg-gray-50"
                                    }`}
                            >
                                {page}
                            </button>
            ))
          ) : (
            <span className="w-10 h-10 rounded-lg font-medium flex items-center justify-center text-gray-500">
              0
            </span>
          )}
          <button
            onClick={() => setCurrentPage(Math.min(finalTotalPages, currentPage + 1))}
            disabled={currentPage === finalTotalPages || finalTotalPages === 0}
            className={`p-2 rounded-lg border border-gray-300 transition ${
              currentPage === finalTotalPages || finalTotalPages === 0
                ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
                : "bg-white text-[#1B1717] hover:bg-gray-50"
            }`}
          >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
        </div>
            ) : (
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 flex flex-col min-h-[calc(100vh-300px)]">
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <h1 className="text-lg sm:text-2xl lg:text-2xl font-medium text-[#1B1717]">
              Retailer Onboarding List
                        </h1>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            {/* From Date */}
                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] bg-white w-full sm:w-auto cursor-pointer"
                                />

                            {/* To Date */}
                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                min={fromDate || undefined}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] bg-white w-full sm:w-auto cursor-pointer"
              />

              {/* Search Input */}
              <div className="relative w-full sm:w-48">
                <input
                  type="text"
                  placeholder="Search by Mobile No or Name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-4 pr-10 py-2 w-full text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] bg-white"
                />
                <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                            </div>

              {/* Export Button */}
              <button
                onClick={handleExportToExcel}
                className="flex items-center justify-center gap-2 bg-[#039155] text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 shadow-md text-sm"
              >
                Export
              </button>
                        </div>
                    </div>

                    {/* Table */}
          <div className="flex-1 overflow-x-auto -mx-4 sm:mx-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        <div className="inline-block min-w-full align-middle">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="border-b bg-gray-100 border-gray-200">
                                        <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                      ID
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                                            Date
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                      User ID
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                      Name
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                                            User Role
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                      Mobile No
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                                            Email Id
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                                            Parent Name
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                                            Parent Role
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                      Company
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                      KYC Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                      KYC Steps
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                                            Main Wallet
                                        </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                      AEPS Wallet
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                      KYC Details
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                      Action
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                      Lock Status
                    </th>
                                    </tr>
                                </thead>

                                <tbody>
                  {!displayTableData || displayTableData.length === 0 ? (
                    <tr>
                      <td colSpan={20} className="py-12 text-center">
                        <p className="text-gray-500 text-lg font-medium">No data available</p>
                      </td>
                    </tr>
                  ) : (
                    displayTableData.map((row, index) => (
                      <tr
                        key={row.id || index}
                        className={`border-b border-gray-100 ${index % 2 === 0 ? "bg-white" : "bg-green-50"}`}
                                        >
                                            <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                          {safeString(row.id, "N/A")}
                        </td>
                        <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                          {formatDate(row.date)}
                        </td>
                        <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                          {safeString(row.userId, "N/A")}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                          {safeString(row.name, "N/A")}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                          {safeString(row.userRole, "N/A")}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                          {safeString(row.mobileNo, "N/A")}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                          {safeString(row.email, "N/A")}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                          {safeString(row.parentName, "N/A")}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                          {safeString(row.parentRole, "N/A")}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                          {safeString(row.company, "N/A")}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                          {(() => {
                            const status = row.kycStatus?.toLowerCase();
                            let className = "px-2 py-1 rounded text-xs font-medium ";
                            if (status === "completed" || status === "full_kyc") {
                              className += "bg-green-100 text-green-700";
                            } else if (status === "pending") {
                              className += "bg-yellow-100 text-yellow-700";
                            } else {
                              className += "bg-red-100 text-red-700";
                            }
                            return (
                              <span className={className}>
                                {safeString(row.kycStatus, "N/A")}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap text-center">
                          {safeString(row.kycSteps, "0")}
                        </td>
                        <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap text-center">
                          {getWalletValue(row.wallet, "mainWallet")}
                        </td>
                        <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap text-center">
                          {getWalletValue(row.wallet, "apesWallet")}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                          <span
                            className={`px-3 py-1 rounded-lg text-white text-xs font-medium ${
                              row.status?.toLowerCase() === "active"
                                ? "bg-green-600"
                                : "bg-red-600"
                            }`}
                          >
                            {safeString(row.status, "Active")}
                          </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                          <button
                            onClick={() => {
                              const userId = row.id || row.originalItem?.id;
                              if (userId) {
                                dispatch(kycDataAction(userId));
                                setShowKycModal(true);
                              }
                            }}
                            className="px-3 py-1 border border-black text-green-600 rounded-lg hover:bg-green-50 text-xs font-medium"
                          >
                            KYC Details
                          </button>
                                            </td>
                                            {/* Action - Toggle Button */}
                                            <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                                              {(() => {
                                                const userId = row.id || row.originalItem?.id;
                                                const isActive = row.status?.toLowerCase() === "active";

                                                return (
                                                  <button
                                                    onClick={() => {
                                                      if (userId) {
                                                        // Handle both cases: active → inactive and inactive → active
                                                        if (isActive) {
                                                          // Toggling from active to inactive (OFF)
                                                          dispatch(kycStatusCheck(userId, { isActive: "false" }));
                                                        } else {
                                                          // Toggling from inactive to active (ON)
                                                          dispatch(kycStatusCheck(userId, { isActive: "true" }));
                                                        }

                                                        // Immediately refresh table data after dispatching
                                                        setTimeout(() => {
                                                          const payload = {
                                                            query: {
                                                              userRole: 5, // Retailer role
                                                              kycStatus: "pending",
                                                            },
                                                            options: {
                                                              sort: { id: -1 },
                                                              page: currentPage,
                                                              paginate: 5,
                                                            },
                                                            customSearch: {
                                                              mobileNo: debouncedSearchTerm.trim(),
                                                              name: debouncedSearchTerm.trim(),
                                                            },
                                                          };
                                                          dispatch(useListAction(payload));
                                                        }, 500);
                                                      }
                                                    }}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-offset-1 ${isActive
                                                      ? "bg-green-600"
                                                      : "bg-gray-300"
                                                      }`}
                                                    role="switch"
                                                    aria-checked={isActive}
                                                  >
                                                    <span
                                                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive
                                                        ? "translate-x-6"
                                                        : "translate-x-1"
                                                        }`}
                                                    />
                                                  </button>
                                                );
                                              })()}
                                            </td>
                                            {/* Lock Status - Colored Button */}
                                            <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                                              {(() => {
                                                const userId = row.id || row.originalItem?.id;
                                                const isLocked = row.lock === true || row.lock === "true";
                                                return (
                                                  <button
                                                    onClick={() => {
                                                      // Only trigger API when button is in "Locked" state
                                                      if (userId && isLocked) {
                                                        // Dispatch unlock action with the row ID
                                                        dispatch(kycUnlock(userId));

                                                        // Refresh table data after dispatching
                                                        setTimeout(() => {
                                                          const payload = {
                                                            query: {
                                                              userRole: 5, // Retailer role
                                                              kycStatus: "pending",
                                                            },
                                                            options: {
                                                              sort: { id: -1 },
                                                              page: currentPage,
                                                              paginate: 5,
                                                            },
                                                            customSearch: {
                                                              mobileNo: debouncedSearchTerm.trim(),
                                                              name: debouncedSearchTerm.trim(),
                                                            },
                                                          };
                                                          dispatch(useListAction(payload));
                                                        }, 500);
                                                      }
                                                    }}
                                                    disabled={!isLocked}
                                                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                                                      isLocked
                                                        ? "bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                                                        : "bg-green-500 text-white cursor-not-allowed opacity-75"
                                                    }`}
                                                    title={isLocked ? "Click to unlock" : "Already unlocked"}
                                                  >
                                                    {isLocked ? "Locked" : "Unlocked"}
                                                  </button>
                                                );
                                              })()}
                                            </td>
                                        </tr>
                    ))
                  )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
          <div className="flex items-center justify-center mt-auto pt-6 pb-4">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1 || finalTotalPages === 0}
              className={`p-2 rounded-lg border border-gray-300 transition ${
                currentPage === 1 || finalTotalPages === 0
                  ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
                  : "bg-white text-[#1B1717] hover:bg-gray-50"
              }`}
            >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
            {finalTotalPages > 0 ? (
              Array.from({ length: finalTotalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg font-medium transition ${
                    page === currentPage
                                        ? "bg-[#039155] text-white"
                                        : "bg-white border border-gray-300 text-[#1B1717] hover:bg-gray-50"
                                    }`}
                            >
                                {page}
                            </button>
              ))
            ) : (
              <span className="w-10 h-10 rounded-lg font-medium flex items-center justify-center text-gray-500">
                0
              </span>
            )}
            <button
              onClick={() => setCurrentPage(Math.min(finalTotalPages, currentPage + 1))}
              disabled={currentPage === finalTotalPages || finalTotalPages === 0}
              className={`p-2 rounded-lg border border-gray-300 transition ${
                currentPage === finalTotalPages || finalTotalPages === 0
                  ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
                  : "bg-white text-[#1B1717] hover:bg-gray-50"
              }`}
            >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

      {/* KYC Details Modal */}
      {showKycModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div
            ref={kycModalRef}
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden animate-slideUp [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <FaIdCard className="text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">KYC Details</h2>
                  {selectedKycData?.userDetails?.name && (
                    <p className="text-sm text-gray-500">{selectedKycData.userDetails.name}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  setShowKycModal(false);
                  setSelectedKycData(null);
                  setSelectedUserId(null);
                  setActiveTab("overview");
                  setZoomedImage(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors hover:bg-gray-100 rounded-full p-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Tab Navigation */}
            {selectedKycData && (
              <div className="flex border-b border-gray-200 bg-gray-50 px-6">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`px-4 py-3 text-sm font-medium transition-colors relative ${activeTab === "overview"
                    ? "text-green-600 border-b-2 border-green-600"
                    : "text-gray-600 hover:text-gray-800"
                    }`}
                >
                  Overview
                </button>

                <button
                  onClick={() => setActiveTab("aadhar")}
                  className={`px-4 py-3 text-sm font-medium transition-colors relative ${activeTab === "aadhar"
                    ? "text-green-600 border-b-2 border-green-600"
                    : "text-gray-600 hover:text-gray-800"
                    }`}
                >
                  Aadhar Document
                </button>
                <button
                  onClick={() => setActiveTab("pan")}
                  className={`px-4 py-3 text-sm font-medium transition-colors relative ${activeTab === "pan"
                    ? "text-green-600 border-b-2 border-green-600"
                    : "text-gray-600 hover:text-gray-800"
                    }`}
                >
                  PAN Document
                </button>
                <button
                  onClick={() => setActiveTab("details")}
                  className={`px-4 py-3 text-sm font-medium transition-colors relative ${activeTab === "details"
                    ? "text-green-600 border-b-2 border-green-600"
                    : "text-gray-600 hover:text-gray-800"
                    }`}
                >
                  Outlet Details
                </button>
                <button
                  onClick={() => setActiveTab("bankDetails")}
                  className={`px-4 py-3 text-sm font-medium transition-colors relative ${activeTab === "bankDetails"
                    ? "text-green-600 border-b-2 border-green-600"
                    : "text-gray-600 hover:text-gray-800"
                    }`}
                >
                  Bank Details
                </button>
                <button
                  onClick={() => setActiveTab("verification")}
                  className={`px-4 py-3 text-sm font-medium transition-colors relative ${activeTab === "verification"
                    ? "text-green-600 border-b-2 border-green-600"
                    : "text-gray-600 hover:text-gray-800"
                    }`}
                >
                  Verification
                </button>
              </div>
            )}

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-250px)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {selectedKycData ? (
                <div className="space-y-6 animate-fadeIn">
                  {/* Overview Tab */}
                  {activeTab === "overview" && (
                    <div className="space-y-6">
                      {/* KYC Status Card */}
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-100">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <FaIdCard className="text-green-600" />
                            KYC Status
                          </h3>
                          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${selectedKycData.kycStatus === "FULL_KYC"
                            ? "bg-green-100 text-green-700"
                            : selectedKycData.kycStatus === "NO_KYC"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                            }`}>
                            {selectedKycData.kycStatus || "N/A"}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Progress</span>
                            <span className="text-sm font-semibold text-gray-800">
                              {selectedKycData.completedSteps || selectedKycData.kycSteps || 0} / {selectedKycData.totalSteps || 7} Steps
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500 ease-out"
                              style={{
                                width: `${((selectedKycData.completedSteps || selectedKycData.kycSteps || 0) / (selectedKycData.totalSteps || 7)) * 100}%`
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* User Details Card */}
                      {selectedKycData.userDetails && (
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <FaUser className="text-green-600" />
                            User Details
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">User ID</span>
                              <span className="text-sm font-medium text-gray-800">{selectedKycData.userDetails.userId || "N/A"}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">Name</span>
                              <span className="text-sm font-medium text-gray-800">{selectedKycData.userDetails.name || "N/A"}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">Mobile No</span>
                              <span className="text-sm font-medium text-gray-800">{selectedKycData.userDetails.mobileNo || "N/A"}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">Email</span>
                              <span className="text-sm font-medium text-gray-800">{selectedKycData.userDetails.email || "N/A"}</span>
                            </div>
                          </div>
                          {selectedKycData.userDetails.profileImage && (
                            <div className="mt-4">
                              <span className="text-xs text-gray-500 mb-2 block">Profile Image</span>
                              <div className="relative group">
                                <img
                                  src={selectedKycData.userDetails.profileImage}
                                  alt="Profile"
                                  className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:border-green-500 transition-colors"
                                  onClick={() => setZoomedImage(selectedKycData.userDetails.profileImage)}
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg flex items-center justify-center transition-opacity">
                                  <FaExpand className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}


                  {/* Aadhar Document Tab */}
                  {activeTab === "aadhar" && (
                    <div className="space-y-6">
                      {selectedKycData.aadhaarDoc ? (
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                              <FaIdCard className="text-blue-600" />
                              Aadhaar Document
                            </h3>
                            {selectedUserId && (
                              <button
                                onClick={() => {
                                  if (selectedUserId) {
                                    dispatch(kycRevert(selectedUserId, { aadhar: "true" }));
                                  }
                                }}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                              >
                                Revert
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">Name</span>
                              <span className="text-sm font-medium text-gray-800">{selectedKycData.aadhaarDoc.name || "N/A"}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">UID</span>
                              <span className="text-sm font-medium text-gray-800">{selectedKycData.aadhaarDoc.uid || "N/A"}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">DOB</span>
                              <span className="text-sm font-medium text-gray-800">{selectedKycData.aadhaarDoc.dob || "N/A"}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">Status</span>
                              <span className={`px-3 py-1 rounded-lg text-xs font-semibold inline-block w-fit ${selectedKycData.aadhaarDoc.status === "Success"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                                }`}>
                                {selectedKycData.aadhaarDoc.status || "N/A"}
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedKycData.userDetails?.aadharFrontImage && (
                              <div>
                                <span className="text-xs text-gray-500 mb-2 block">Aadhaar Front</span>
                                <div className="relative group">
                                  <img
                                    src={selectedKycData.userDetails.aadharFrontImage}
                                    alt="Aadhaar Front"
                                    className="w-full h-48 object-contain rounded-lg border-2 border-gray-200 cursor-pointer hover:border-green-500 transition-colors"
                                    onClick={() => setZoomedImage(selectedKycData.userDetails.aadharFrontImage)}
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg flex items-center justify-center transition-opacity">
                                    <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8" />
                                  </div>
                                </div>
                              </div>
                            )}
                            {selectedKycData.userDetails?.aadharBackImage && (
                              <div>
                                <span className="text-xs text-gray-500 mb-2 block">Aadhaar Back</span>
                                <div className="relative group">
                                  <img
                                    src={selectedKycData.userDetails.aadharBackImage}
                                    alt="Aadhaar Back"
                                    className="w-full h-48 object-contain rounded-lg border-2 border-gray-200 cursor-pointer hover:border-green-500 transition-colors"
                                    onClick={() => setZoomedImage(selectedKycData.userDetails.aadharBackImage)}
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg flex items-center justify-center transition-opacity">
                                    <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8" />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>No Aadhaar Document available</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* PAN Document Tab */}
                  {activeTab === "pan" && (
                    <div className="space-y-6">
                      {selectedKycData.panDoc ? (
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                              <FaIdCard className="text-purple-600" />
                              PAN Document
                            </h3>
                            {selectedUserId && (
                              <button
                                onClick={() => {
                                  if (selectedUserId) {
                                    dispatch(kycRevert(selectedUserId, { pan: "true" }));
                                  }
                                }}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                              >
                                Revert
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">PAN Number</span>
                              <span className="text-sm font-medium text-gray-800">{selectedKycData.panDoc.panNumber || "N/A"}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">PAN Name</span>
                              <span className="text-sm font-medium text-gray-800">{selectedKycData.panDoc.panName || "N/A"}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">DOB</span>
                              <span className="text-sm font-medium text-gray-800">{selectedKycData.panDoc.panDob || "N/A"}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">Status</span>
                              <span className={`px-3 py-1 rounded-lg text-xs font-semibold inline-block w-fit ${selectedKycData.panDoc.status === "Success"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                                }`}>
                                {selectedKycData.panDoc.status || "N/A"}
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedKycData.userDetails?.panCardFrontImage && (
                              <div>
                                <span className="text-xs text-gray-500 mb-2 block">PAN Front</span>
                                <div className="relative group">
                                  <img
                                    src={selectedKycData.userDetails.panCardFrontImage}
                                    alt="PAN Front"
                                    className="w-full h-48 object-contain rounded-lg border-2 border-gray-200 cursor-pointer hover:border-green-500 transition-colors"
                                    onClick={() => setZoomedImage(selectedKycData.userDetails.panCardFrontImage)}
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg flex items-center justify-center transition-opacity">
                                    <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8" />
                                  </div>
                                </div>
                              </div>
                            )}
                            {selectedKycData.userDetails?.panCardBackImage && (
                              <div>
                                <span className="text-xs text-gray-500 mb-2 block">PAN Back</span>
                                <div className="relative group">
                                  <img
                                    src={selectedKycData.userDetails.panCardBackImage}
                                    alt="PAN Back"
                                    className="w-full h-48 object-contain rounded-lg border-2 border-gray-200 cursor-pointer hover:border-green-500 transition-colors"
                                    onClick={() => setZoomedImage(selectedKycData.userDetails.panCardBackImage)}
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg flex items-center justify-center transition-opacity">
                                    <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8" />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>No PAN Document available</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Additional Details Tab */}
                  {activeTab === "details" && (
                    <div className="space-y-6">
                      {/* Outlet Details */}
                      {selectedKycData.outletDetails && (
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                              <FaBuilding className="text-orange-600" />
                              Outlet Details
                            </h3>
                            {selectedUserId && (
                              <button
                                onClick={() => {
                                  if (selectedUserId) {
                                    dispatch(kycRevert(selectedUserId, { shopImage: "true" }));
                                  }
                                }}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                              >
                                Revert
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">Shop Name</span>
                              <span className="text-sm font-medium text-gray-800">{selectedKycData.outletDetails.shopName || "N/A"}</span>
                            </div>
                            {selectedKycData.outletDetails.gstNo && (
                              <div className="flex flex-col">
                                <span className="text-xs text-gray-500 mb-1">GST No</span>
                                <span className="text-sm font-medium text-gray-800">{selectedKycData.outletDetails.gstNo}</span>
                              </div>
                            )}
                            <div className="flex flex-col md:col-span-2">
                              <span className="text-xs text-gray-500 mb-1">Shop Address</span>
                              <span className="text-sm font-medium text-gray-800">{selectedKycData.outletDetails.shopAddress || "N/A"}</span>
                            </div>
                            {selectedKycData.outletDetails.shopImage && (
                              <div className="md:col-span-2">
                                <span className="text-xs text-gray-500 mb-2 block">Shop Image</span>
                                <div className="relative group">
                                  <img
                                    src={selectedKycData.outletDetails.shopImage}
                                    alt="Shop"
                                    className="w-full max-w-md h-64 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:border-green-500 transition-colors"
                                    onClick={() => setZoomedImage(selectedKycData.outletDetails.shopImage)}
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg flex items-center justify-center transition-opacity">
                                    <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8" />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                  {/* Bank Details Tab */}
                  {activeTab === "bankDetails" && (
                    <div className="space-y-6">
                      {selectedKycData.customerBankDetails ? (
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                              <FaUniversity className="text-indigo-600" />
                              Bank Details
                            </h3>
                            {selectedUserId && (
                              <button
                                onClick={() => {
                                  if (selectedUserId) {
                                    dispatch(kycRevert(selectedUserId, { bankVerification: "true" }));
                                  }
                                }}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                              >
                                Revert
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">Account Number</span>
                              <span className="text-sm font-medium text-gray-800">{selectedKycData.customerBankDetails.accountNumber || "N/A"}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">IFSC</span>
                              <span className="text-sm font-medium text-gray-800">{selectedKycData.customerBankDetails.ifsc || "N/A"}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">Bank Name</span>
                              <span className="text-sm font-medium text-gray-800">{selectedKycData.customerBankDetails.bankName || "N/A"}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">Beneficiary Name</span>
                              <span className="text-sm font-medium text-gray-800">{selectedKycData.customerBankDetails.beneficiaryName || "N/A"}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>No Bank Details available</p>
                        </div>
                      )}
                    </div>
                  )}


                  {/* Verification Tab */}
                  {activeTab === "verification" && selectedKycData.userDetails && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FaCheckCircle className="text-green-600" />
                        Verification Status
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Mobile Verify */}
                        <div className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${selectedKycData.userDetails.mobileVerify
                          ? "bg-green-50 border-green-200"
                          : "bg-red-50 border-red-200"
                          }`}>
                          <div className="flex items-center gap-3">
                            {selectedKycData.userDetails.mobileVerify ? (
                              <FaCheckCircle className="text-green-600 text-xl" />
                            ) : (
                              <FaTimesCircle className="text-red-600 text-xl" />
                            )}
                            <span className="text-sm font-medium text-gray-700">Mobile</span>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${selectedKycData.userDetails.mobileVerify
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                            }`}>
                            {selectedKycData.userDetails.mobileVerify ? "Verified" : "Pending"}
                          </span>
                        </div>

                        {/* Email Verify */}
                        <div className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${selectedKycData.userDetails.emailVerify
                          ? "bg-green-50 border-green-200"
                          : "bg-red-50 border-red-200"
                          }`}>
                          <div className="flex items-center gap-3">
                            {selectedKycData.userDetails.emailVerify ? (
                              <FaCheckCircle className="text-green-600 text-xl" />
                            ) : (
                              <FaTimesCircle className="text-red-600 text-xl" />
                            )}
                            <span className="text-sm font-medium text-gray-700">Email</span>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${selectedKycData.userDetails.emailVerify
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                            }`}>
                            {selectedKycData.userDetails.emailVerify ? "Verified" : "Pending"}
                          </span>
                        </div>

                        {/* Aadhar Verify */}
                        <div className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${selectedKycData.userDetails.aadharVerify
                          ? "bg-green-50 border-green-200"
                          : "bg-red-50 border-red-200"
                          }`}>
                          <div className="flex items-center gap-3">
                            {selectedKycData.userDetails.aadharVerify ? (
                              <FaCheckCircle className="text-green-600 text-xl" />
                            ) : (
                              <FaTimesCircle className="text-red-600 text-xl" />
                            )}
                            <span className="text-sm font-medium text-gray-700">Aadhar</span>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${selectedKycData.userDetails.aadharVerify
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                            }`}>
                            {selectedKycData.userDetails.aadharVerify ? "Verified" : "Pending"}
                          </span>
                        </div>

                        {/* PAN Verify */}
                        <div className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${selectedKycData.userDetails.panVerify
                          ? "bg-green-50 border-green-200"
                          : "bg-red-50 border-red-200"
                          }`}>
                          <div className="flex items-center gap-3">
                            {selectedKycData.userDetails.panVerify ? (
                              <FaCheckCircle className="text-green-600 text-xl" />
                            ) : (
                              <FaTimesCircle className="text-red-600 text-xl" />
                            )}
                            <span className="text-sm font-medium text-gray-700">PAN</span>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${selectedKycData.userDetails.panVerify
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                            }`}>
                            {selectedKycData.userDetails.panVerify ? "Verified" : "Pending"}
                          </span>
                        </div>

                        {/* Shop Details Verify */}
                        <div className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${selectedKycData.userDetails.shopDetailsVerify
                          ? "bg-green-50 border-green-200"
                          : "bg-red-50 border-red-200"
                          }`}>
                          <div className="flex items-center gap-3">
                            {selectedKycData.userDetails.shopDetailsVerify ? (
                              <FaCheckCircle className="text-green-600 text-xl" />
                            ) : (
                              <FaTimesCircle className="text-red-600 text-xl" />
                            )}
                            <span className="text-sm font-medium text-gray-700">Shop Details</span>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${selectedKycData.userDetails.shopDetailsVerify
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                            }`}>
                            {selectedKycData.userDetails.shopDetailsVerify ? "Verified" : "Pending"}
                          </span>
                        </div>

                        {/* Image Verify */}
                        <div className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${selectedKycData.userDetails.imageVerify
                          ? "bg-green-50 border-green-200"
                          : "bg-red-50 border-red-200"
                          }`}>
                          <div className="flex items-center gap-3">
                            {selectedKycData.userDetails.imageVerify ? (
                              <FaCheckCircle className="text-green-600 text-xl" />
                            ) : (
                              <FaTimesCircle className="text-red-600 text-xl" />
                            )}
                            <span className="text-sm font-medium text-gray-700">Image</span>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${selectedKycData.userDetails.imageVerify
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                            }`}>
                            {selectedKycData.userDetails.imageVerify ? "Verified" : "Pending"}
                          </span>
                        </div>

                        {/* Profile Image with Shop Verify */}
                        <div className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${selectedKycData.userDetails.profileImageWithShopVerify
                          ? "bg-green-50 border-green-200"
                          : "bg-red-50 border-red-200"
                          }`}>
                          <div className="flex items-center gap-3">
                            {selectedKycData.userDetails.profileImageWithShopVerify ? (
                              <FaCheckCircle className="text-green-600 text-xl" />
                            ) : (
                              <FaTimesCircle className="text-red-600 text-xl" />
                            )}
                            <span className="text-sm font-medium text-gray-700">Profile with Shop</span>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${selectedKycData.userDetails.profileImageWithShopVerify
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                            }`}>
                            {selectedKycData.userDetails.profileImageWithShopVerify ? "Verified" : "Pending"}
                          </span>
                        </div>

                        {/* Bank Details Verify */}
                        <div className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${selectedKycData.userDetails.bankDetailsVerify
                          ? "bg-green-50 border-green-200"
                          : "bg-red-50 border-red-200"
                          }`}>
                          <div className="flex items-center gap-3">
                            {selectedKycData.userDetails.bankDetailsVerify ? (
                              <FaCheckCircle className="text-green-600 text-xl" />
                            ) : (
                              <FaTimesCircle className="text-red-600 text-xl" />
                            )}
                            <span className="text-sm font-medium text-gray-700">Bank Details</span>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${selectedKycData.userDetails.bankDetailsVerify
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                            }`}>
                            {selectedKycData.userDetails.bankDetailsVerify ? "Verified" : "Pending"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No KYC details available</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setShowKycModal(false);
                  setSelectedKycData(null);
                  setSelectedUserId(null);
                  setActiveTab("overview");
                  setZoomedImage(null);
                }}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium shadow-md hover:shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Zoom Modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] animate-fadeIn"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative max-w-7xl max-h-[90vh] p-4">
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-2 z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={zoomedImage}
              alt="Zoomed"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Add CSS animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
        </div>
    );
};

export default RetailerOnboarding;
