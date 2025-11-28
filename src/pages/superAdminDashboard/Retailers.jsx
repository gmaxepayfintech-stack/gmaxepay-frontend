import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FaSearch, FaUpload } from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { X } from "lucide-react";
import * as XLSX from "xlsx";
import { useList as useListAction, kycData as kycDataAction, kycStatusData } from "../../redux/action/whiteLabelAction";

const Retailers = ({ embedded = false, tableData: propTableData = [] }) => {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]); // Default to today's date
  const [selectedKycData, setSelectedKycData] = useState(null);
  const [showKycModal, setShowKycModal] = useState(false);
  const [rowLockStatus, setRowLockStatus] = useState({}); // Track lock status per row ID
  const [lastClickedRowId, setLastClickedRowId] = useState(null);
  const kycModalRef = useRef(null);

  // Get data from Redux when search is active, otherwise use prop data
  const responseForTable = useSelector((state) => state?.whitelabel?.whitelabelList?.whitelabelList || []);
  
  // Get KYC details from Redux state
  const kycRetrieved = useSelector((state) => state?.whitelabel?.kycDetails?.data || null);
  
  // Get lockCheck from Redux state
  const lockCheck = useSelector((state) => state?.whitelabel?.kycStatusClick);
  console.log("lockCheck in Retailers:", lockCheck);
  
  // Update row lock status when lockCheck changes for the last clicked row
  useEffect(() => {
    if (lastClickedRowId !== null && lockCheck !== undefined) {
      const isLocked = lockCheck?.kycStatusClick?.isLocked;
      console.log("Updating lock status for row:", lastClickedRowId, "isLocked:", isLocked);
      setRowLockStatus(prev => ({
        ...prev,
        [lastClickedRowId]: isLocked
      }));
    }
  }, [lockCheck, lastClickedRowId]);

  // Use Redux data if search is active, otherwise use prop data
  const allTableData = debouncedSearchTerm.trim()
    ? (Array.isArray(responseForTable) && responseForTable.length > 0 ? responseForTable : [])
    : (Array.isArray(propTableData) && propTableData.length > 0 ? propTableData : []);

  // Get total count from Redux state (if available) or use current data length
  const totalCountFromRedux = useSelector((state) => {
    const response = state?.whitelabel?.whitelabelList;
    return response?.totalCount || response?.total || 0;
  });

  // Use Redux total count if available and search is active, otherwise use current data length
  const totalCount = (debouncedSearchTerm.trim() && totalCountFromRedux > 0)
    ? totalCountFromRedux
    : allTableData.length;

  // Calculate total pages based on total count (5 records per page)
  // If there's at least 1 record, show at least 1 page, otherwise show 0
  const totalPages = totalCount > 0 ? Math.ceil(totalCount / 5) : 0;

  // Slice data to show only 5 records per page
  const startIndex = (currentPage - 1) * 5;
  const endIndex = startIndex + 5;
  const tableData = allTableData.slice(startIndex, endIndex);

  // Debounce search term to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch data from API when search term changes
  useEffect(() => {
    if (debouncedSearchTerm.trim()) {
      const payload = {
        query: {
          userRole: 5, // Retailer role
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

  // Update selectedKycData when Redux state changes
  useEffect(() => {
    if (kycRetrieved && showKycModal) {
      setSelectedKycData(kycRetrieved);
    }
  }, [kycRetrieved, showKycModal]);

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
    if (!allTableData || allTableData.length === 0) {
      alert("No data available to export");
      return;
    }

    const excelData = allTableData.map((row) => ({
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
    XLSX.utils.book_append_sheet(workbook, worksheet, "Retailers Data");

    // Generate Excel file and download
    const fileName = `Retailers_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
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
          <>
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4">
              <h2 className="text-xl sm:text-2xl font-normal text-gray-800">
                Retailers
              </h2>

              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-end gap-3">
                <div className="flex flex-col xs:flex-row gap-3">
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => {
                      setFromDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-3 pr-3 py-3 border border-gray-300 rounded-lg w-full xs:w-32 text-sm focus:ring-green-500 focus:border-green-500 text-center cursor-pointer"
                  />

                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => {
                      setToDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    min={fromDate || undefined}
                    className="pl-3 pr-3 py-3 border border-gray-300 rounded-lg w-full xs:w-32 text-sm focus:ring-green-500 focus:border-green-500 text-center cursor-pointer"
                  />
                </div>

                <div className="relative w-full sm:w-48">
                  <input
                    type="text"
                    placeholder="Search by Mobile No or Name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-4 pr-10 py-3 border border-gray-300 rounded-xl w-full text-sm focus:ring-green-500 focus:border-green-500"
                  />
                  <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                </div>

                <button
                  onClick={handleExportToExcel}
                  className="flex items-center justify-center gap-2 bg-[#039155] text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 shadow-md text-sm sm:text-base"
                >
                  Export <FaUpload className="text-xs" />
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 mb-4 overflow-x-auto rounded-xl bg-white [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <table className="min-w-[1200px] sm:min-w-full divide-y">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                      ID
                    </th>
                    <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                      Date
                    </th>
                    <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                      User ID
                    </th>
                    <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                      Name
                    </th>
                    <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                      User Role
                    </th>
                    <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                      Mobile No
                    </th>
                    <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                      Email Id
                    </th>
                    <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                      Parent Name
                    </th>
                    <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                      Parent Role
                    </th>
                    <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                      Company
                    </th>
                    <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                      KYC Status
                    </th>
                    <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                      KYC Steps
                    </th>
                    <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                      Main Wallet
                    </th>
                    <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                      AEPS Wallet
                    </th>
                    <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                      Status
                    </th>
                    <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                      KYC Details
                    </th>
                    <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y font-normal divide-gray-100">
                  {!tableData || tableData.length === 0 ? (
                    <tr>
                      <td colSpan={17} className="py-12 text-center">
                        <p className="text-gray-500 text-lg font-medium">No data available</p>
                      </td>
                    </tr>
                  ) : (
                    tableData.map((row, index) => (
                      <tr
                        key={row.id || index}
                        className={`text-sm ${index % 2 === 0 ? "bg-green-50" : "bg-white"}`}
                      >
                        <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                          {safeString(row.id, "N/A")}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                          {formatDate(row.date)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                          {safeString(row.userId, "N/A")}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                          {safeString(row.name, "N/A")}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                          {safeString(row.userRole, "N/A")}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                          {safeString(row.mobileNo, "N/A")}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                          {safeString(row.email, "N/A")}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                          {safeString(row.parentName, "N/A")}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                          {safeString(row.parentRole, "N/A")}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                          {safeString(row.company, "N/A")}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-[11px]">
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
                        <td className="px-4 py-4 whitespace-nowrap text-[11px] text-center">
                          {safeString(row.kycSteps, "0")}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-[11px] text-center">
                          {getWalletValue(row.wallet, "mainWallet")}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-[11px] text-center">
                          {getWalletValue(row.wallet, "apesWallet")}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                          <span
                            className={`px-3 py-1 rounded-lg text-white text-xs font-medium ${row.status?.toLowerCase() === "active"
                                ? "bg-green-600"
                                : "bg-red-600"
                              }`}
                          >
                            {safeString(row.status, "Active")}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                          <button
                            onClick={() => {
                              const userId = row.id || row.originalItem?.id;
                              if (userId) {
                                dispatch(kycDataAction(userId));
                                setShowKycModal(true);
                              }
                            }}
                            className="px-3 py-1 border border-black text-green-600 rounded-lg hover:bg-green-50 text-xs font-medium transition-colors"
                          >
                            KYC Details
                          </button>
                        </td>
                        {/* Action - Toggle Button */}
                        <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                          {(() => {
                            const userId = row.id || row.originalItem?.id;
                            // Get lock status for this specific row
                            // If lockCheck is false, toggle should be false (OFF)
                            // Default to false (unlocked/off) if not set
                            const rowLocked = rowLockStatus[userId] !== undefined ? rowLockStatus[userId] : false;
                            console.log("Row ID:", userId, "Lock Status:", rowLocked);
                            
                            return (
                              <button
                                onClick={() => {
                                  if (userId) {
                                    console.log("Toggle clicked for row ID:", userId);
                                    // Set the last clicked row ID
                                    setLastClickedRowId(userId);
                                    // Dispatch kycStatusData with the row ID
                                    dispatch(kycStatusData(userId));
                                    console.log("Dispatched kycStatusData with ID:", userId);
                                  }
                                }}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                                  // If lockCheck is false, show as false (gray/off)
                                  // If lockCheck is true, show as true (green/on)
                                  rowLocked === false
                                    ? "bg-gray-300"
                                    : "bg-green-600"
                                }`}
                                role="switch"
                                aria-checked={rowLocked !== false}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    rowLocked === false
                                      ? "translate-x-1"
                                      : "translate-x-6"
                                  }`}
                                />
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

            {/* Pagination */}
            <div className="flex justify-center items-center mt-auto pt-6 pb-4 space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1 || totalPages === 0}
                className={`p-2 border border-gray-300 rounded-lg ${currentPage === 1 || totalPages === 0
                    ? "text-gray-400 cursor-not-allowed bg-gray-100"
                    : "text-gray-500 hover:bg-gray-100"
                  }`}
              >
                <IoIosArrowBack />
              </button>
              {totalPages > 0 ? (
                Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium ${page === currentPage
                        ? "bg-green-600 text-white"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                      }`}
                  >
                    {page}
                  </button>
                ))
              ) : (
                <span className="w-8 h-8 rounded-lg text-sm font-medium flex items-center justify-center text-gray-500">
                  0
                </span>
              )}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`p-2 border border-gray-300 rounded-lg ${currentPage === totalPages || totalPages === 0
                    ? "text-gray-400 cursor-not-allowed bg-gray-100"
                    : "text-gray-500 hover:bg-gray-100"
                  }`}
              >
                <IoIosArrowForward />
              </button>
            </div>
          </>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 flex flex-col min-h-[calc(100vh-300px)]">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-normal text-gray-800">
              Retailers
            </h2>

            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-end gap-3">
              <div className="flex flex-col xs:flex-row gap-3">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-3 pr-3 py-3 border border-gray-300 rounded-lg w-full xs:w-32 text-sm focus:ring-green-500 focus:border-green-500 text-center cursor-pointer"
                />

                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  min={fromDate || undefined}
                  className="pl-3 pr-3 py-3 border border-gray-300 rounded-lg w-full xs:w-32 text-sm focus:ring-green-500 focus:border-green-500 text-center cursor-pointer"
                />
              </div>

              <div className="relative w-full sm:w-48">
                <input
                  type="text"
                  placeholder="Search by Mobile No or Name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-4 pr-10 py-3 border border-gray-300 rounded-xl w-full text-sm focus:ring-green-500 focus:border-green-500"
                />
                <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
              </div>

              <button
                onClick={handleExportToExcel}
                className="flex items-center justify-center gap-2 bg-[#039155] text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 shadow-md text-sm sm:text-base"
              >
                Export <FaUpload className="text-xs" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 mb-4 overflow-x-auto rounded-xl bg-white [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <table className="min-w-[1200px] sm:min-w-full divide-y">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    ID
                  </th>
                  <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Date
                  </th>
                  <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    User ID
                  </th>
                  <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Name
                  </th>
                  <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    User Role
                  </th>
                  <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Mobile No
                  </th>
                  <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Email Id
                  </th>
                  <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Parent Name
                  </th>
                  <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Parent Role
                  </th>
                  <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Company
                  </th>
                  <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    KYC Status
                  </th>
                  <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    KYC Steps
                  </th>
                  <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Main Wallet
                  </th>
                  <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    AEPS Wallet
                  </th>
                  <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Status
                  </th>
                    <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                      KYC Details
                    </th>
                    <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                      Action
                    </th>
                  </tr>
              </thead>

              <tbody className="bg-white divide-y font-normal divide-gray-100">
                {!tableData || tableData.length === 0 ? (
                  <tr>
                    <td colSpan={17} className="py-12 text-center">
                      <p className="text-gray-500 text-lg font-medium">No data available</p>
                    </td>
                  </tr>
                ) : (
                  tableData.map((row, index) => (
                    <tr
                      key={row.id || index}
                      className={`text-sm ${index % 2 === 0 ? "bg-green-50" : "bg-white"}`}
                    >
                      <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                        {safeString(row.id, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                        {formatDate(row.date)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                        {safeString(row.userId, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                        {safeString(row.name, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                        {safeString(row.userRole, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                        {safeString(row.mobileNo, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                        {safeString(row.email, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                        {safeString(row.parentName, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                        {safeString(row.parentRole, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                        {safeString(row.company, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[11px]">
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
                      <td className="px-4 py-4 whitespace-nowrap text-[11px] text-center">
                        {safeString(row.kycSteps, "0")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[11px] text-center">
                        {getWalletValue(row.wallet, "mainWallet")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[11px] text-center">
                        {getWalletValue(row.wallet, "apesWallet")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                        <span
                          className={`px-3 py-1 rounded-lg text-white text-xs font-medium ${row.status?.toLowerCase() === "active"
                              ? "bg-green-600"
                              : "bg-red-600"
                            }`}
                        >
                          {safeString(row.status, "Active")}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                        <button
                          onClick={() => {
                            const userId = row.id || row.originalItem?.id;
                            if (userId) {
                              dispatch(kycDataAction(userId));
                              setShowKycModal(true);
                            }
                          }}
                          className="px-3 py-1 border border-black text-green-600 rounded-lg hover:bg-green-50 text-xs font-medium transition-colors"
                        >
                          KYC Details
                        </button>
                      </td>
                      {/* Action - Toggle Button */}
                      <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                        {(() => {
                          const userId = row.id || row.originalItem?.id;
                          // Get lock status for this specific row
                          // If lockCheck is false, toggle should be false (OFF)
                          // Default to false (unlocked/off) if not set
                          const rowLocked = rowLockStatus[userId] !== undefined ? rowLockStatus[userId] : false;
                          console.log("Row ID:", userId, "Lock Status:", rowLocked);
                          
                          return (
                            <button
                              onClick={() => {
                                if (userId) {
                                  console.log("Toggle clicked for row ID:", userId);
                                  // Set the last clicked row ID
                                  setLastClickedRowId(userId);
                                  // Dispatch kycStatusData with the row ID
                                  dispatch(kycStatusData(userId));
                                  console.log("Dispatched kycStatusData with ID:", userId);
                                }
                              }}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                                // If lockCheck is false, show as false (gray/off)
                                // If lockCheck is true, show as true (green/on)
                                rowLocked === false
                                  ? "bg-gray-300"
                                  : "bg-green-600"
                              }`}
                              role="switch"
                              aria-checked={rowLocked !== false}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  rowLocked === false
                                    ? "translate-x-1"
                                    : "translate-x-6"
                                }`}
                              />
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

          {/* Pagination */}
          <div className="flex justify-center items-center mt-auto pt-6 pb-4 space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1 || totalPages === 0}
              className={`p-2 border border-gray-300 rounded-lg ${currentPage === 1 || totalPages === 0
                  ? "text-gray-400 cursor-not-allowed bg-gray-100"
                  : "text-gray-500 hover:bg-gray-100"
                }`}
            >
              <IoIosArrowBack />
            </button>
            {totalPages > 0 ? (
              Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium ${page === currentPage
                      ? "bg-green-600 text-white"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                    }`}
                >
                  {page}
                </button>
              ))
            ) : (
              <span className="w-8 h-8 rounded-lg text-sm font-medium flex items-center justify-center text-gray-500">
                0
              </span>
            )}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`p-2 border border-gray-300 rounded-lg ${currentPage === totalPages || totalPages === 0
                  ? "text-gray-400 cursor-not-allowed bg-gray-100"
                  : "text-gray-500 hover:bg-gray-100"
                }`}
            >
              <IoIosArrowForward />
            </button>
          </div>
        </div>
      )}

      {/* KYC Details Modal */}
      {showKycModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            ref={kycModalRef}
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">KYC Details</h2>
              <button
                onClick={() => {
                  setShowKycModal(false);
                  setSelectedKycData(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {selectedKycData ? (
                <div className="space-y-6">
                  {/* KYC Status */}
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <span className="text-sm font-medium text-gray-600">KYC Status:</span>
                    <span className={`px-3 py-1 rounded-lg text-xs font-medium ${selectedKycData.kycStatus === "FULL_KYC"
                      ? "bg-green-100 text-green-700"
                      : selectedKycData.kycStatus === "NO_KYC"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                      }`}>
                      {selectedKycData.kycStatus || "N/A"}
                    </span>
                  </div>

                  {/* KYC Steps */}
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <span className="text-sm font-medium text-gray-600">KYC Steps:</span>
                    <span className="text-sm text-gray-800">{selectedKycData.completedSteps || selectedKycData.kycSteps || 0} / {selectedKycData.totalSteps || 7}</span>
                  </div>

                  {/* User Details */}
                  {selectedKycData.userDetails && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">User Details</h3>
                      <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">User ID:</span>
                          <span className="text-sm text-gray-800 font-medium">{selectedKycData.userDetails.userId || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Name:</span>
                          <span className="text-sm text-gray-800 font-medium">{selectedKycData.userDetails.name || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Mobile No:</span>
                          <span className="text-sm text-gray-800 font-medium">{selectedKycData.userDetails.mobileNo || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Email:</span>
                          <span className="text-sm text-gray-800 font-medium">{selectedKycData.userDetails.email || "N/A"}</span>
                        </div>
                        {selectedKycData.userDetails.profileImage && (
                          <div className="mt-2">
                            <span className="text-sm text-gray-600">Profile Image:</span>
                            <img src={selectedKycData.userDetails.profileImage} alt="Profile" className="mt-2 w-24 h-24 object-cover rounded-lg" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Verification Details */}
                  {selectedKycData.userDetails && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Verification Details</h3>
                      <div className="space-y-3">
                        {/* Mobile Verify */}
                        <div className="flex items-center justify-between py-2 px-4 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-700">Mobile Verification</span>
                          <span className={`px-3 py-1 rounded-lg text-xs font-medium ${selectedKycData.userDetails.mobileVerify
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                            }`}>
                            {selectedKycData.userDetails.mobileVerify ? "Verified" : "Not Verified"}
                          </span>
                        </div>

                        {/* Email Verify */}
                        <div className="flex items-center justify-between py-2 px-4 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-700">Email Verification</span>
                          <span className={`px-3 py-1 rounded-lg text-xs font-medium ${selectedKycData.userDetails.emailVerify
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                            }`}>
                            {selectedKycData.userDetails.emailVerify ? "Verified" : "Not Verified"}
                          </span>
                        </div>

                        {/* Aadhar Verify */}
                        <div className="flex items-center justify-between py-2 px-4 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-700">Aadhar Verification</span>
                          <span className={`px-3 py-1 rounded-lg text-xs font-medium ${selectedKycData.userDetails.aadharVerify
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                            }`}>
                            {selectedKycData.userDetails.aadharVerify ? "Verified" : "Not Verified"}
                          </span>
                        </div>

                        {/* PAN Verify */}
                        <div className="flex items-center justify-between py-2 px-4 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-700">PAN Verification</span>
                          <span className={`px-3 py-1 rounded-lg text-xs font-medium ${selectedKycData.userDetails.panVerify
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                            }`}>
                            {selectedKycData.userDetails.panVerify ? "Verified" : "Not Verified"}
                          </span>
                        </div>

                        {/* Shop Details Verify */}
                        <div className="flex items-center justify-between py-2 px-4 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-700">Shop Details Verification</span>
                          <span className={`px-3 py-1 rounded-lg text-xs font-medium ${selectedKycData.userDetails.shopDetailsVerify
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                            }`}>
                            {selectedKycData.userDetails.shopDetailsVerify ? "Verified" : "Not Verified"}
                          </span>
                        </div>

                        {/* Image Verify */}
                        <div className="flex items-center justify-between py-2 px-4 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-700">Image Verification</span>
                          <span className={`px-3 py-1 rounded-lg text-xs font-medium ${selectedKycData.userDetails.imageVerify
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                            }`}>
                            {selectedKycData.userDetails.imageVerify ? "Verified" : "Not Verified"}
                          </span>
                        </div>

                        {/* Profile Image with Shop Verify */}
                        <div className="flex items-center justify-between py-2 px-4 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-700">Profile Image with Shop Verification</span>
                          <span className={`px-3 py-1 rounded-lg text-xs font-medium ${selectedKycData.userDetails.profileImageWithShopVerify
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                            }`}>
                            {selectedKycData.userDetails.profileImageWithShopVerify ? "Verified" : "Not Verified"}
                          </span>
                        </div>

                        {/* Bank Details Verify */}
                        <div className="flex items-center justify-between py-2 px-4 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-700">Bank Details Verification</span>
                          <span className={`px-3 py-1 rounded-lg text-xs font-medium ${selectedKycData.userDetails.bankDetailsVerify
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                            }`}>
                            {selectedKycData.userDetails.bankDetailsVerify ? "Verified" : "Not Verified"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Outlet Details */}
                  {selectedKycData.outletDetails && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Outlet Details</h3>
                      <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Shop Name:</span>
                          <span className="text-sm text-gray-800 font-medium">{selectedKycData.outletDetails.shopName || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Shop Address:</span>
                          <span className="text-sm text-gray-800 font-medium text-right max-w-[60%]">{selectedKycData.outletDetails.shopAddress || "N/A"}</span>
                        </div>
                        {selectedKycData.outletDetails.gstNo && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">GST No:</span>
                            <span className="text-sm text-gray-800 font-medium">{selectedKycData.outletDetails.gstNo}</span>
                          </div>
                        )}
                        {selectedKycData.outletDetails.shopImage && (
                          <div className="mt-2">
                            <span className="text-sm text-gray-600">Shop Image:</span>
                            <img src={selectedKycData.outletDetails.shopImage} alt="Shop" className="mt-2 w-24 h-24 object-cover rounded-lg" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Bank Details */}
                  {selectedKycData.customerBankDetails && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Bank Details</h3>
                      <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Account Number:</span>
                          <span className="text-sm text-gray-800 font-medium">{selectedKycData.customerBankDetails.accountNumber || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">IFSC:</span>
                          <span className="text-sm text-gray-800 font-medium">{selectedKycData.customerBankDetails.ifsc || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Bank Name:</span>
                          <span className="text-sm text-gray-800 font-medium">{selectedKycData.customerBankDetails.bankName || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Beneficiary Name:</span>
                          <span className="text-sm text-gray-800 font-medium">{selectedKycData.customerBankDetails.beneficiaryName || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Aadhaar Document */}
                  {selectedKycData.aadhaarDoc && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Aadhaar Document</h3>
                      <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Name:</span>
                          <span className="text-sm text-gray-800 font-medium">{selectedKycData.aadhaarDoc.name || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">UID:</span>
                          <span className="text-sm text-gray-800 font-medium">{selectedKycData.aadhaarDoc.uid || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">DOB:</span>
                          <span className="text-sm text-gray-800 font-medium">{selectedKycData.aadhaarDoc.dob || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Status:</span>
                          <span className={`px-3 py-1 rounded-lg text-xs font-medium ${selectedKycData.aadhaarDoc.status === "Success"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                            }`}>
                            {selectedKycData.aadhaarDoc.status || "N/A"}
                          </span>
                        </div>
                        {selectedKycData.userDetails?.aadharFrontImage && (
                          <div className="mt-2">
                            <span className="text-sm text-gray-600">Aadhaar Front:</span>
                            <img src={selectedKycData.userDetails.aadharFrontImage} alt="Aadhaar Front" className="mt-2 w-32 h-20 object-cover rounded-lg" />
                          </div>
                        )}
                        {selectedKycData.userDetails?.aadharBackImage && (
                          <div className="mt-2">
                            <span className="text-sm text-gray-600">Aadhaar Back:</span>
                            <img src={selectedKycData.userDetails.aadharBackImage} alt="Aadhaar Back" className="mt-2 w-32 h-20 object-cover rounded-lg" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* PAN Document */}
                  {selectedKycData.panDoc && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">PAN Document</h3>
                      <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">PAN Number:</span>
                          <span className="text-sm text-gray-800 font-medium">{selectedKycData.panDoc.panNumber || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">PAN Name:</span>
                          <span className="text-sm text-gray-800 font-medium">{selectedKycData.panDoc.panName || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">DOB:</span>
                          <span className="text-sm text-gray-800 font-medium">{selectedKycData.panDoc.panDob || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Status:</span>
                          <span className={`px-3 py-1 rounded-lg text-xs font-medium ${selectedKycData.panDoc.status === "Success"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                            }`}>
                            {selectedKycData.panDoc.status || "N/A"}
                          </span>
                        </div>
                        {selectedKycData.userDetails?.panCardFrontImage && (
                          <div className="mt-2">
                            <span className="text-sm text-gray-600">PAN Front:</span>
                            <img src={selectedKycData.userDetails.panCardFrontImage} alt="PAN Front" className="mt-2 w-32 h-20 object-cover rounded-lg" />
                          </div>
                        )}
                        {selectedKycData.userDetails?.panCardBackImage && (
                          <div className="mt-2">
                            <span className="text-sm text-gray-600">PAN Back:</span>
                            <img src={selectedKycData.userDetails.panCardBackImage} alt="PAN Back" className="mt-2 w-32 h-20 object-cover rounded-lg" />
                          </div>
                        )}
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
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowKycModal(false);
                  setSelectedKycData(null);
                }}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Retailers;
