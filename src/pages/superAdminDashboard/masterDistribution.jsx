import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FaSearch, FaUpload, FaEdit, FaTrash } from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { X } from "lucide-react";
import * as XLSX from "xlsx";
import { useList as useListAction, kycData as kycDataAction } from "../../redux/action/whiteLabelAction";

const MasterDistribution = ({ embedded = false, tableData: propTableData = [] }) => {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedKycData, setSelectedKycData] = useState(null);
  const [showKycModal, setShowKycModal] = useState(false);
  const kycModalRef = useRef(null);

  // Get data from Redux when search is active, otherwise use prop data
  const responseForTable = useSelector((state) => state?.whitelabel?.whitelabelList?.whitelabelList || []);

  // Get KYC details from Redux state
  const kycRetrieved = useSelector((state) => state?.whitelabel?.kycDetails?.data || null);

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

  // Calculate total pages based on total count (10 records per page)
  // If there's at least 1 record, show at least 1 page, otherwise show 0
  const totalPages = totalCount > 0 ? Math.ceil(totalCount / 10) : 0;

  // Slice data to show only 10 records per page
  const startIndex = (currentPage - 1) * 10;
  const endIndex = startIndex + 10;
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
          userRole: 3, // Master Distributor role
        },
        options: {
          sort: { id: -1 },
          page: currentPage,
          paginate: 10,
        },
        customSearch: {
          mobileNo: debouncedSearchTerm.trim(),
          name: debouncedSearchTerm.trim(),
        },
      };

      dispatch(useListAction(payload));
    }
  }, [debouncedSearchTerm, currentPage, dispatch]);

  // Export to Excel function
  const handleExportToExcel = () => {
    if (!allTableData || allTableData.length === 0) {
      alert("No data available to export");
      return;
    }

    const excelData = allTableData.map((row) => ({
      "ID": row.id || "N/A",
      "Date": row.date || "N/A",
      "User ID": row.userId || row.userAgentCode || "N/A",
      "Name": row.name || row.userName || "N/A",
      "User Role": row.userRole || "N/A",
      "Mobile No": row.mobileNo || row.mobile || row.mobileNumber || "N/A",
      "Email Id": row.emailId || row.email || "N/A",
      "Parent Name": row.parentName || "N/A",
      "Parent Role": row.parentRole || "N/A",
      "Company Name": row.companyName || "N/A",
      "KYC Status": row.kycStatus || "N/A",
      "KYC Steps": row.kycSteps || "0",
      "Main Wallet": row.mainWallet || "0",
      "AEPS Wallet": row.aepsWallet || "0",
      "Remaining Days": row.remainingDays || "0",
      "Status": row.status || "Active",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Master Distributor Data");
    const fileName = `Master_Distributor_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

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

  return (
    <div className={`text-[#1B1717] ${embedded ? '[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]' : 'min-h-screen p-4 sm:p-6'}`}>
      {embedded ? (
        <div className="flex flex-col min-h-[calc(100vh-300px)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4">
            <h2 className="text-xl sm:text-2xl font-normal text-gray-800">
              Master Distributor
            </h2>

            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-end gap-3">
              <div className="flex flex-col xs:flex-row gap-3">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setCurrentPage(1); // Reset to first page when date changes
                  }}
                  className="pl-3 pr-3 py-3 border border-gray-300 rounded-lg w-full xs:w-32 text-sm focus:ring-green-500 focus:border-green-500 text-center cursor-pointer"
                />

                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setCurrentPage(1); // Reset to first page when date changes
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
            <table className="min-w-[720px] sm:min-w-full divide-y">
              <thead className="bg-white">
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
                    Company Name
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
                    Remaining Days
                  </th>
                  <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    KYC Details
                  </th>
                  {/* <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                  Approved
                </th>
                <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                  Action
                </th> */}
                </tr>
              </thead>

              <tbody className="bg-white divide-y font-normal divide-gray-100">
                {!tableData || tableData.length === 0 ? (
                  <tr>
                    <td colSpan={18} className="py-12 text-center">
                      <p className="text-gray-500 text-lg font-medium">No data available</p>
                    </td>
                  </tr>
                ) : (
                  tableData.map((row, index) => (
                    <tr
                      key={index}
                      className={`text-sm ${index % 2 === 0 ? "bg-green-50" : "bg-white"
                        }`}
                    >
                      {/* ID */}
                      <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                        {row.id || "N/A"}
                      </td>
                      {/* Date */}
                      <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                        {row.date || "N/A"}
                      </td>
                      {/* User ID */}
                      <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                        {row.userId || row.userAgentCode || "N/A"}
                      </td>
                      {/* Name */}
                      <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                        {row.name || row.userName || "N/A"}
                      </td>
                      {/* User Role */}
                      <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                        {row.userRole || "N/A"}
                      </td>
                      {/* Mobile No */}
                      <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                        {row.mobileNo || row.mobile || row.mobileNumber || "N/A"}
                      </td>
                      {/* Email Id */}
                      <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                        {row.emailId || row.email || "N/A"}
                      </td>
                      {/* Parent Name */}
                      <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                        {row.parentName || "N/A"}
                      </td>
                      {/* Parent Role */}
                      <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                        {row.parentRole || "N/A"}
                      </td>
                      {/* Company Name */}
                      <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                        {row.companyName || "N/A"}
                      </td>
                      {/* KYC Status */}
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
                              {row.kycStatus || "N/A"}
                            </span>
                          );
                        })()}
                      </td>
                      {/* KYC Steps */}
                      <td className="px-4 py-4 whitespace-nowrap text-[11px] text-center">
                        {row.kycSteps || "0"}
                      </td>
                      {/* Main Wallet */}
                      <td className="px-4 py-4 whitespace-nowrap text-[11px] text-center">
                        {row.mainWallet || "0"}
                      </td>
                      {/* AEPS Wallet */}
                      <td className="px-4 py-4 whitespace-nowrap text-[11px] text-center">
                        {row.aepsWallet || "0"}
                      </td>
                      {/* Remaining Days */}
                      <td className="px-4 py-4 whitespace-nowrap text-[11px] text-center">
                        {row.remainingDays || "0"}
                      </td>
                      {/* Status */}
                      <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                        <span
                          className={`px-3 py-1 rounded-lg text-white text-xs font-medium ${row.status?.toLowerCase() === "active"
                              ? "bg-green-600"
                              : "bg-red-600"
                            }`}
                        >
                          {row.status || "Active"}
                        </span>
                      </td>
                      {/* KYC Details */}
                      <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                        <button
                          onClick={() => {
                            const userId = row.id || row.originalItem?.id;
                            if (userId) {
                              dispatch(kycDataAction(userId));
                              setShowKycModal(true);
                            }
                          }}
                          className="px-3 py-1 border border-green-500 text-green-600 rounded-lg hover:bg-green-50 text-xs font-medium"
                        >
                          KYC Details
                        </button>
                      </td>
                      {/* Approved */}
                      {/* <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                    <input
                      type="checkbox"
                      checked={row.approved !== undefined ? row.approved : true}
                      onChange={(e) => {
                        // Handle checkbox change if needed
                        console.log("Approved changed:", e.target.checked);
                      }}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                  </td> */}
                      {/* Action */}
                      {/* <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          console.log("Edit:", row.originalItem || row);
                        }}
                        className="text-gray-600 hover:text-green-600 transition-colors"
                      >
                        <FaEdit className="text-sm" />
                      </button>
                      <button
                        onClick={() => {
                          console.log("Delete:", row.originalItem || row);
                        }}
                        className="text-gray-600 hover:text-red-600 transition-colors"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                  </td> */}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination - Fixed at bottom */}
          {totalPages > 0 && (
            <div className="flex justify-center items-center mt-auto pt-6 pb-4 space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`p-2 border border-gray-300 rounded-lg ${currentPage === 1
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-500 hover:bg-gray-100"
                  }`}
              >
                <IoIosArrowBack />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`p-2 border border-gray-300 rounded-lg ${currentPage === totalPages
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-500 hover:bg-gray-100"
                  }`}
              >
                <IoIosArrowForward />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-normal text-gray-800">
              Master Distributor
            </h2>

            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-end gap-3">
              <div className="flex flex-col xs:flex-row gap-3">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setCurrentPage(1); // Reset to first page when date changes
                  }}
                  className="pl-3 pr-3 py-3 border border-gray-300 rounded-lg w-full xs:w-32 text-sm focus:ring-green-500 focus:border-green-500 text-center cursor-pointer"
                />

                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setCurrentPage(1); // Reset to first page when date changes
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
          <div className="mb-4 overflow-x-auto rounded-xl bg-white [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <table className="min-w-[720px] sm:min-w-full divide-y">
              <thead className="bg-white">
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
                    Company Name
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
                    Remaining Days
                  </th>
                  <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    KYC Details
                  </th>
                  <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Approved
                  </th>
                  <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y font-normal divide-gray-100">
                {!tableData || tableData.length === 0 ? (
                  <tr>
                    <td colSpan={18} className="py-12 text-center">
                      <p className="text-gray-500 text-lg font-medium">No data available</p>
                    </td>
                  </tr>
                ) : (
                  tableData.map((row, index) => (
                    <tr
                      key={index}
                      className={`text-sm ${index % 2 === 0 ? "bg-green-50" : "bg-white"
                        }`}
                    >
                      {/* ID */}
                      <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                        {row.id || "N/A"}
                      </td>
                      {/* Date */}
                      <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                        {row.date || "N/A"}
                      </td>
                      {/* User ID */}
                      <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                        {row.userId || row.userAgentCode || "N/A"}
                      </td>
                      {/* Name */}
                      <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                        {row.name || row.userName || "N/A"}
                      </td>
                      {/* User Role */}
                      <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                        {row.userRole || "N/A"}
                      </td>
                      {/* Mobile No */}
                      <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                        {row.mobileNo || row.mobile || row.mobileNumber || "N/A"}
                      </td>
                      {/* Email Id */}
                      <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                        {row.emailId || row.email || "N/A"}
                      </td>
                      {/* Parent Name */}
                      <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                        {row.parentName || "N/A"}
                      </td>
                      {/* Parent Role */}
                      <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                        {row.parentRole || "N/A"}
                      </td>
                      {/* Company Name */}
                      <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                        {row.companyName || "N/A"}
                      </td>
                      {/* KYC Status */}
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
                              {row.kycStatus || "N/A"}
                            </span>
                          );
                        })()}
                      </td>
                      {/* KYC Steps */}
                      <td className="px-4 py-4 whitespace-nowrap text-[11px] text-center">
                        {row.kycSteps || "0"}
                      </td>
                      {/* Main Wallet */}
                      <td className="px-4 py-4 whitespace-nowrap text-[11px] text-center">
                        {row.mainWallet || "0"}
                      </td>
                      {/* AEPS Wallet */}
                      <td className="px-4 py-4 whitespace-nowrap text-[11px] text-center">
                        {row.aepsWallet || "0"}
                      </td>
                      {/* Remaining Days */}
                      <td className="px-4 py-4 whitespace-nowrap text-[11px] text-center">
                        {row.remainingDays || "0"}
                      </td>
                      {/* Status */}
                      <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                        <span
                          className={`px-3 py-1 rounded-lg text-white text-xs font-medium ${row.status?.toLowerCase() === "active"
                              ? "bg-green-600"
                              : "bg-red-600"
                            }`}
                        >
                          {row.status || "Active"}
                        </span>
                      </td>
                      {/* KYC Details */}
                      <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                        <button
                          onClick={() => {
                            const userId = row.id || row.originalItem?.id;
                            if (userId) {
                              dispatch(kycDataAction(userId));
                              setShowKycModal(true);
                            }
                          }}
                          className="px-3 py-1 border border-green-500 text-green-600 rounded-lg hover:bg-green-50 text-xs font-medium"
                        >
                          KYC Details
                        </button>
                      </td>
                      {/* Approved */}
                      <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                        <input
                          type="checkbox"
                          checked={row.approved !== undefined ? row.approved : true}
                          onChange={(e) => {
                            console.log("Approved changed:", e.target.checked);
                          }}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                      </td>
                      {/* Action */}
                      <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              console.log("Edit:", row.originalItem || row);
                            }}
                            className="text-gray-600 hover:text-green-600 transition-colors"
                          >
                            <FaEdit className="text-sm" />
                          </button>
                          <button
                            onClick={() => {
                              console.log("Delete:", row.originalItem || row);
                            }}
                            className="text-gray-600 hover:text-red-600 transition-colors"
                          >
                            <FaTrash className="text-sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination - Fixed at bottom */}
          {totalPages > 0 && (
            <div className="flex justify-center items-center mt-auto pt-6 pb-4 space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`p-2 border border-gray-300 rounded-lg ${currentPage === 1
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-500 hover:bg-gray-100"
                  }`}
              >
                <IoIosArrowBack />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`p-2 border border-gray-300 rounded-lg ${currentPage === totalPages
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-500 hover:bg-gray-100"
                  }`}
              >
                <IoIosArrowForward />
              </button>
            </div>
          )}
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

export default MasterDistribution;
