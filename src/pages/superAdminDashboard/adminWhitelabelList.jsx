import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ChevronLeft, ChevronRight, Calendar, X } from "lucide-react";
import { FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import { useList as useListAction, kycData as kycDataAction } from "../../redux/action/whiteLabelAction";

const AdminWhitelabelList = ({ embedded = false, tableData: propTableData = [] }) => {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedKyc, setSelectedKyc] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedKycData, setSelectedKycData] = useState(null);
  const [showKycModal, setShowKycModal] = useState(false);
  const kycModalRef = useRef(null);

  // Get data from Redux when search is active, otherwise use prop data
  const responseForTable = useSelector((state) => state?.whitelabel?.whitelabelList?.whitelabelList || []);
  
  // Get KYC details from Redux state
  const kycDetailsFromRedux = useSelector((state) => state?.whitelabel?.kycDetails?.kycDetails || null);
  
  // Use Redux data if search is active, otherwise use prop data
  const allTableData = debouncedSearchTerm.trim()
    ? (Array.isArray(responseForTable) && responseForTable.length > 0 ? responseForTable : [])
    : (Array.isArray(propTableData) && propTableData.length > 0 ? propTableData : []);
  
  // Get total count from Redux state (if available) or use current data length
  const totalCountFromRedux = useSelector((state) => {
    const response = state?.whitelabel?.whitelabelList;
    // Check if API response includes total count or pagination info
    return response?.totalCount || response?.total || 0;
  });
  
  // Use Redux total count if available and search is active, otherwise use current data length
  const totalCount = (debouncedSearchTerm.trim() && totalCountFromRedux > 0) 
    ? totalCountFromRedux 
    : allTableData.length;
  
  // Calculate total pages based on total count (10 records per page)
  const totalPages = Math.ceil(totalCount / 10) || 1;
  
  // Slice data to show only 10 records per page
  // Note: API should already be paginated, but we ensure client-side pagination as well
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
    const payload = {
      query: {
        userRole: 2, // Whitelabel role
        kycStatus: "pending", // Onboarding process
      },
      options: {
        sort: { id: -1 },
        page: currentPage,
        paginate: 10,
      },
      customSearch: debouncedSearchTerm.trim()
        ? {
            mobileNo: debouncedSearchTerm.trim(),
            name: debouncedSearchTerm.trim(),
          }
        : {},
    };

    dispatch(useListAction(payload));
  }, [debouncedSearchTerm, currentPage, dispatch]);

  // Update selectedKycData when Redux state changes
  useEffect(() => {
    if (kycDetailsFromRedux && showKycModal) {
      setSelectedKycData(kycDetailsFromRedux);
    }
  }, [kycDetailsFromRedux, showKycModal]);

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
    <div className={`text-[#1B1717] ${embedded ? 'flex flex-col min-h-[calc(100vh-300px)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]' : 'min-h-screen p-2 sm:p-6 flex flex-col'}`}>
      {/* Header with Filters */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${embedded ? 'py-4 mb-0' : 'mb-6'}`}>
          <h1 className="text-lg sm:text-2xl lg:text-2xl font-medium text-[#1B1717]">
            Whitelabel Onboarding List
          </h1>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Bar */}
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

            {/* Select KYC Dropdown */}
            <select
              value={selectedKyc}
              onChange={(e) => setSelectedKyc(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] bg-white"
            >
              <option value="">Select KYC</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* From Date */}
            <div className="relative">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] bg-white w-full sm:w-auto"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* To Date */}
            <div className="relative">
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] bg-white w-full sm:w-auto"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className={`flex-1 overflow-x-auto ${embedded ? 'mb-4 rounded-xl bg-white' : '-mx-4 sm:mx-0'} [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]`}>
          {embedded ? (
            <table className="min-w-[720px] sm:min-w-full divide-y">
              <thead>
                <tr className="border-b bg-gray-100 border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                    ID
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                    User Agent Code
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
                    Company Name
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
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => (
                  <tr
                    key={index}
                    className={`border-b border-gray-100 ${
                      index % 2 === 0 ? "bg-white" : "bg-green-50"
                    }`}
                  >
                    <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                      {row.id || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                      {row.date || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                      {row.userId || row.userAgentCode || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                      {row.name || row.userName || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                      {row.userRole || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                      {row.mobileNo || row.mobileNumber || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                      {row.emailId || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                      {row.parentName || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                      {row.parentRole || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                      {row.companyName || "N/A"}
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
                            {row.kycStatus || "N/A"}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap text-center">
                      {row.kycSteps || "0"}
                    </td>
                    <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap text-center">
                      {row.mainWallet || "0"}
                    </td>
                    <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap text-center">
                      {row.aepsWallet || "0"}
                    </td>
                    <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-lg text-white text-xs font-medium ${
                          row.status?.toLowerCase() === "active"
                            ? "bg-green-600"
                            : "bg-red-600"
                        }`}
                      >
                        {row.status || "Active"}
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
                    <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
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
                ))}
              </tbody>
            </table>
          ) : (
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
                      Company Name
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
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, index) => (
                    <tr
                      key={index}
                      className={`border-b border-gray-100 ${
                        index % 2 === 0 ? "bg-white" : "bg-green-50"
                      }`}
                    >
                      <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                        {row.id || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                        {row.date || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                        {row.userId || row.userAgentCode || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                        {row.name || row.userName || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                        {row.userRole || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                        {row.mobileNo || row.mobileNumber || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                        {row.emailId || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                        {row.parentName || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                        {row.parentRole || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                        {row.companyName || "N/A"}
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
                              {row.kycStatus || "N/A"}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap text-center">
                        {row.kycSteps || "0"}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap text-center">
                        {row.mainWallet || "0"}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap text-center">
                        {row.aepsWallet || "0"}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-lg text-white text-xs font-medium ${
                            row.status?.toLowerCase() === "active"
                              ? "bg-green-600"
                              : "bg-red-600"
                          }`}
                        >
                          {row.status || "Active"}
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
                      <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center mt-auto pt-6 pb-4 gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || totalPages === 0}
            className={`p-2 rounded-lg border transition ${
              currentPage === 1 || totalPages === 0
                ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
                : "bg-white border-gray-300 text-[#1B1717] hover:bg-gray-50"
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {totalPages > 0 ? (
            Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-lg font-medium transition ${
                  currentPage === page
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
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className={`p-2 rounded-lg border transition ${
              currentPage === totalPages || totalPages === 0
                ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
                : "bg-white border-gray-300 text-[#1B1717] hover:bg-gray-50"
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

      {/* KYC Details Modal */}
      {showKycModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            ref={kycModalRef}
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
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
            <div className="p-6">
              {selectedKycData ? (
                <div className="space-y-4">
                  {/* KYC Status */}
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <span className="text-sm font-medium text-gray-600">KYC Status:</span>
                    <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                      selectedKycData.kycStatus === "FULL_KYC"
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
                    <span className="text-sm text-gray-800">{selectedKycData.kycSteps || 0} / 7</span>
                  </div>

                  {/* Verification Details */}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Verification Details</h3>
                    <div className="space-y-3">
                      {/* Mobile Verify */}
                      <div className="flex items-center justify-between py-2 px-4 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Mobile Verification</span>
                        <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                          selectedKycData.mobileVerify
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          {selectedKycData.mobileVerify ? "Verified" : "Not Verified"}
                        </span>
                      </div>

                      {/* Email Verify */}
                      <div className="flex items-center justify-between py-2 px-4 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Email Verification</span>
                        <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                          selectedKycData.emailVerify
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          {selectedKycData.emailVerify ? "Verified" : "Not Verified"}
                        </span>
                      </div>

                      {/* Aadhar Verify */}
                      <div className="flex items-center justify-between py-2 px-4 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Aadhar Verification</span>
                        <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                          selectedKycData.aadharVerify
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          {selectedKycData.aadharVerify ? "Verified" : "Not Verified"}
                        </span>
                      </div>

                      {/* PAN Verify */}
                      <div className="flex items-center justify-between py-2 px-4 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">PAN Verification</span>
                        <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                          selectedKycData.panVerify
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          {selectedKycData.panVerify ? "Verified" : "Not Verified"}
                        </span>
                      </div>

                      {/* Shop Details Verify */}
                      <div className="flex items-center justify-between py-2 px-4 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Shop Details Verification</span>
                        <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                          selectedKycData.shopDetailsVerify
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          {selectedKycData.shopDetailsVerify ? "Verified" : "Not Verified"}
                        </span>
                      </div>

                      {/* Image Verify */}
                      <div className="flex items-center justify-between py-2 px-4 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Image Verification</span>
                        <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                          selectedKycData.imageVerify
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          {selectedKycData.imageVerify ? "Verified" : "Not Verified"}
                        </span>
                      </div>

                      {/* Profile Image with Shop Verify */}
                      <div className="flex items-center justify-between py-2 px-4 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Profile Image with Shop Verification</span>
                        <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                          selectedKycData.profileImageWithShopVerify
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          {selectedKycData.profileImageWithShopVerify ? "Verified" : "Not Verified"}
                        </span>
                      </div>

                      {/* Bank Details Verify */}
                      <div className="flex items-center justify-between py-2 px-4 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Bank Details Verification</span>
                        <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                          selectedKycData.bankDetailsVerify
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          {selectedKycData.bankDetailsVerify ? "Verified" : "Not Verified"}
                        </span>
                      </div>
                    </div>
                  </div>
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

export default AdminWhitelabelList;
