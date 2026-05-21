import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import * as XLSX from "xlsx";
import { RefreshCw } from 'lucide-react';
import { ButtonLoader } from '../../../widgets/layout/loader.jsx';
import { companyApproveRequest, companyGetAllRequest } from '../../../redux/action/fundAction';

const FundRequest = () => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [fundRequests, setFundRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const [approvalRemarks, setApprovalRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const debounceTimerRef = useRef(null);
  const isFetchingRef = useRef(false);
  const itemsPerPage = 10;

  const fetchFundRequests = useCallback(async () => {
    if (isFetchingRef.current) {
      return;
    }
    
    try {
      isFetchingRef.current = true;
      setLoading(true);
      
      const customSearch = {};
      if (searchTerm.trim()) {
        customSearch.referenceNo = searchTerm.trim();
        customSearch.transactionId = searchTerm.trim();
        customSearch.name = searchTerm.trim();
        customSearch.mobileNo = searchTerm.trim();
      }

      const query = {};
      if (fromDate) {
        query.startDate = fromDate;
      }
      if (toDate) {
        query.endDate = toDate;
      }

      const payload = {
        query: query,
        customSearch: Object.keys(customSearch).length > 0 ? customSearch : {},
        options: {
          page: currentPage,
          paginate: itemsPerPage,
          sort: { createdAt: -1 }
        }
      };

      const result = await dispatch(companyGetAllRequest(payload));
      
      if (result?.status === "SUCCESS" && result?.companyRequest) {
        const dataArray = Array.isArray(result.companyRequest) 
          ? result.companyRequest 
          : result.companyRequest?.data || [];
        setFundRequests(dataArray);
        const calculatedPages = Math.ceil(dataArray.length / itemsPerPage) || 1;
        setTotalPages(result.companyRequest?.totalPages || calculatedPages);
        setTotalRecords(result.companyRequest?.totalRecords || dataArray.length);
      }
    } catch (error) {
      console.error("Failed to fetch fund requests:", error);
    } finally {
      setLoading(false);
      setIsReloading(false);
      isFetchingRef.current = false;
    }
  }, [dispatch, searchTerm, fromDate, toDate, currentPage, itemsPerPage]);

  useEffect(() => {
    if (!loading && isReloading) {
      setIsReloading(false);
    }
  }, [loading, isReloading]);

  useEffect(() => {
    fetchFundRequests();
  }, [currentPage, fromDate, toDate]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      return;
    }
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      if (currentPage === 1) {
        fetchFundRequests();
      } else {
        setCurrentPage(1); 
      }
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm]);

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailsPanel(true);
    setApprovalRemarks("");
  };

  const handleClosePanel = () => {
    setShowDetailsPanel(false);
    setSelectedRequest(null);
    setApprovalRemarks("");
  };

  const handleApprove = async () => {
    if (!selectedRequest?.id) {
      return;
    }
    
    try {
      setSubmitting(true);
      const payload = {
        fundRequestId: selectedRequest.id.toString(),
        action: "APPROVED",
        approvalRemarks: approvalRemarks || ""
      };

      const result = await dispatch(companyApproveRequest(payload));
      
      if (result?.status === "SUCCESS") {
        handleClosePanel();
        fetchFundRequests();
      }
    } catch (error) {
      console.error("Failed to approve fund request:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = () => {
    if (fundRequests.length === 0) {
      return;
    }

    const formatDate = (dateString) => {
      if (!dateString) return "";
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { 
          day: '2-digit', 
          month: '2-digit', 
          year: '2-digit' 
        });
      } catch {
        return dateString;
      }
    };

    const exportData = fundRequests.map((item, index) => ({
      "SR No": index + 1,
      "Created At": formatDate(item.createdAt),
      "Request By": item.requester?.name || "",
      "Deposit Bank Name": item.bank?.bankName || "",
      "Deposit Bank Account": item.bank?.accountNumber || "",
      "Ref Number": item.referenceNo || "",
      "Txn Id": item.transactionId || "",
      "Amount": item.amount || "",
      "Payment Mode": item.paymentMode || "",
      "Approved": item.status === "APPROVED" ? "Yes" : "No",
      "Status": item.status || "PENDING",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Fund Requests");

    XLSX.writeFile(workbook, "Fund_Request_List.xlsx");
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-2 lg:p-2">
      <h1 className="text-[24px] font-['Gilroy-Medium'] mb-[20px]  text-[#1B1717]">
        Fund Request
      </h1>
      <div className="w-full mx-auto">
        <div className="mb-[28px] w-full">
          <div className="block sm:hidden">
            <div className="relative w-full mb-4">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#1B1717]/80 z-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search By Transaction ID, User ID, Mobile, Name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border-[0.5px] border-[#1B1717]/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] focus:border-[#039155] text-sm sm:text-base"
              />
            </div>
            <div className="flex gap-3 mb-4">
              <div className="relative flex-1">
                <label className="block text-xs sm:text-sm text-[#1B1717]/80 mb-1 ml-1 font-[Gilroy-Medium]">
                  From Date
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-4 py-2.5 sm:py-3 border-[0.5px] border-[#1B1717]/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] focus:border-[#039155] text-sm sm:text-base"
                />
              </div>
              <div className="relative flex-1">
                <label className="block text-xs sm:text-sm text-[#1B1717]/80 mb-1 ml-1 font-[Gilroy-Medium]">
                  To Date
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-4 py-2.5 sm:py-3 border-[0.5px] border-[#1B1717]/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] focus:border-[#039155] text-sm sm:text-base"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleExport}
                className="flex-1 flex items-center justify-center gap-2 bg-[#039155] text-white px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-lg font-[Gilroy-Medium] hover:bg-green-700 transition shadow-md"
              >
                <span>Export</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </button>
              <button
                onClick={() => {
                  setFromDate("");
                  setToDate("");
                  setSearchTerm("");
                  setIsReloading(true);
                  fetchFundRequests();
                }}
                className="p-2.5 sm:p-3 rounded-2xl bg-white text-gray-700 border-[0.5px] border-[#1B1717]/80 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isReloading && loading}
              >
                <RefreshCw
                  className={`w-4 h-4 sm:w-5 sm:h-5 text-[#1B1717]/80 transition-transform ${
                    isReloading && loading ? "animate-spin" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="hidden sm:flex items-end gap-3 sm:gap-4">
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#1B1717]/80 z-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search By Transaction ID, User ID, Mobile, Name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border-[0.5px] border-[#1B1717]/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] focus:border-[#039155] text-sm sm:text-base"
              />
            </div>

            <div className="relative flex-1 md:flex-1 lg:flex-initial lg:w-auto">
              <label className="block text-xs sm:text-sm text-[#1B1717]/80 mb-1 ml-1 font-[Gilroy-Medium]">
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-4 py-2.5 sm:py-3 border-[0.5px] border-[#1B1717]/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] focus:border-[#039155] text-sm sm:text-base"
              />
            </div>

            <div className="relative flex-1 md:flex-1 lg:flex-initial lg:w-auto">
              <label className="block text-xs sm:text-sm text-[#1B1717]/80 mb-1 ml-1 font-[Gilroy-Medium]">
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-4 py-2.5 sm:py-3 border-[0.5px] border-[#1B1717]/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] focus:border-[#039155] text-sm sm:text-base"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleExport}
                className="w-full lg:w-auto flex items-center gap-2 bg-[#039155] text-white px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-lg font-[Gilroy-Medium] hover:bg-green-700 transition shadow-md whitespace-nowrap"
              >
                <span>Export</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setFromDate("");
                  setToDate("");
                  setSearchTerm("");
                  setIsReloading(true);
                  fetchFundRequests();
                }}
                className="p-2.5 sm:p-3 rounded-2xl bg-white text-gray-700 border-[0.5px] border-[#1B1717]/80 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isReloading && loading}
              >
                <RefreshCw
                  className={`w-4 h-4 sm:w-5 sm:h-5 text-[#1B1717]/80 transition-transform ${
                    isReloading && loading ? "animate-spin" : ""
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm overflow-hidden mt-4 sm:mt-[40px] md:mt-[40px] lg:mt-4">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] rounded-3xl">
              <thead>
                <tr className="bg-[#FFFFFF] border-b border-gray-200">
                  {[
                    "SR No",
                    "Request By",
                    "Deposit Bank Name",
                    "Deposit Bank Account",
                    "Ref Number",
                    "Txn Id",
                    "Amount",
                    "Payment Mode",
                    "Status",
                    "Created At",
                    "Action",
                  ].map((title) => (
                    <th
                      key={title}
                      className="px-2 sm:px-3 md:px-4 py-3 text-left text-[12px] sm:text-[13px] md:text-[14px] font-['Gilroy-SemiBold'] text-[#1B1717] whitespace-nowrap"
                    >
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>

              {!loading && (
                <tbody className='text-[12px] sm:text-[12px]'>
                  {fundRequests.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-4 py-8 text-center text-[14px] text-[#1B1717]">
                        No fund requests found
                      </td>
                    </tr>
                  ) : (
                  fundRequests.map((item, index) => {
                    const isApproved = item.status === "APPROVED";
                    const fundRequestId = item.id;
                    
                    const formatDate = (dateString) => {
                      if (!dateString) return "";
                      try {
                        const date = new Date(dateString);
                        return date.toLocaleDateString('en-GB', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          year: '2-digit' 
                        });
                      } catch {
                        return dateString;
                      }
                    };
                    
                    return (
                      <tr
                        key={fundRequestId || index}
                        className={`border-b border-gray-100 ${index % 2 === 0 ? "bg-white" : "bg-green-50 font-['Gilroy-Regular']"
                          }`}
                      >
                        <td className="px-2 sm:px-3 md:px-4 py-3 text-[#1B1717] whitespace-nowrap">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="px-2 sm:px-3 md:px-4 py-3 text-[#1B1717] whitespace-nowrap">
                          <span className="truncate block max-w-[120px] sm:max-w-[150px] md:max-w-none">
                            {item.requester?.name || ""}
                          </span>
                        </td>
                        <td className="px-2 sm:px-3 md:px-4 py-3 text-[#1B1717] whitespace-nowrap">
                          <span className="truncate block max-w-[100px] sm:max-w-[130px] md:max-w-none">
                            {item.bank?.bankName || ""}
                          </span>
                        </td>
                        <td className="px-2 sm:px-3 md:px-4 py-3 text-[#1B1717] whitespace-nowrap">
                          <span className="truncate block max-w-[100px] sm:max-w-[130px] md:max-w-none">
                            {item.bank?.accountNumber || ""}
                          </span>
                        </td>
                        <td className="px-2 sm:px-3 md:px-4 py-3 text-[#1B1717] whitespace-nowrap">
                          <span className="truncate block max-w-[80px] sm:max-w-[100px] md:max-w-none">
                            {item.referenceNo || ""}
                          </span>
                        </td>
                        <td className="px-2 sm:px-3 md:px-4 py-3 text-[#1B1717] whitespace-nowrap">
                          <span className="truncate block max-w-[100px] sm:max-w-[130px] md:max-w-none">
                            {item.transactionId || ""}
                          </span>
                        </td>
                        <td className="px-2 sm:px-3 md:px-4 py-3 text-[#1B1717] whitespace-nowrap">
                          {item.amount ? `₹${item.amount}` : ""}
                        </td>
                        <td className="px-2 sm:px-3 md:px-4 py-3 text-[#1B1717] whitespace-nowrap">
                          {item.paymentMode || "-"}
                        </td>
                        <td className="px-2 sm:px-3 md:px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 sm:px-3 py-1 text-[10px] sm:text-[12px] md:text-[12px] font-['Gilroy-Medium'] rounded-full text-white ${
                            item.status === "APPROVED" || isApproved
                              ? "bg-[#039155]"
                              : item.status === "REJECTED"
                              ? "bg-red-500"
                              : "bg-yellow-500"
                          }`}>
                            {item.status || "PENDING"}
                          </span>
                        </td>
                        <td className="px-2 sm:px-3 md:px-4 py-3 text-[#1B1717] whitespace-nowrap">
                          {formatDate(item.createdAt)}
                        </td>
                        <td className="px-2 sm:px-3 md:px-4 py-3 whitespace-nowrap">
                          <button
                            onClick={() => handleViewDetails(item)}
                            className="px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 bg-[#039155] text-white rounded-lg text-[10px] sm:text-[12px] md:text-[12px] font-['Gilroy-Medium'] hover:bg-[#027a47] transition-colors flex items-center justify-center gap-1.5 sm:gap-2"
                          >
                            <img 
                              src="/img/Eye.svg" 
                              alt="View" 
                              className="w-3 h-3 sm:w-4 sm:h-4"
                            />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                  )}
                </tbody>
              )}
            </table>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 mt-4 sm:mt-6 pb-2 flex-shrink-0">
            <ButtonLoader color="#039155" size={24} thickness={3} />
            <p className="text-sm sm:text-base font-['Gilroy-Medium'] text-[#1B1717]">
              Loading...
            </p>
          </div>
        ) : (
          totalPages > 0 && (
            <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg transition ${
              currentPage === 1
                ? "text-gray-300 cursor-not-allowed"
                : "text-[#1B1717] hover:bg-gray-100"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {totalPages > 0 && [...Array(totalPages)].map((_, index) => {
            const page = index + 1;
            if (
              page === 1 ||
              page === totalPages ||
              (page >= currentPage - 1 && page <= currentPage + 1)
            ) {
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 rounded-lg text-[12px] font-['Gilroy-Medium'] transition ${currentPage === page
                    ? "bg-[#039155] text-white"
                    : "text-[#1B1717] hover:bg-gray-100"
                    }`}
                >
                  {page}
                </button>
              );
            } else if (page === currentPage - 2 || page === currentPage + 2) {
              return <span key={page} className="px-2">...</span>;
            }
            return null;
          })}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg transition ${
              currentPage === totalPages
                ? "text-gray-300 cursor-not-allowed"
                : "text-[#1B1717] hover:bg-gray-100"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
            </div>
          )
        )}
      </div>

      {submitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50"></div>
      )}

      {showDetailsPanel && selectedRequest && (
        <div className="fixed inset-0 z-40 flex">
          <div 
            className="flex-1 bg-black bg-opacity-50"
            onClick={handleClosePanel}
          ></div>
          
          <div className="w-full md:w-[500px] lg:w-[600px] bg-white shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200">
              <div className="relative px-6 py-6">
                <button
                  onClick={handleClosePanel}
                  className="absolute right-6 top-6 p-2 hover:bg-gray-100 rounded-lg transition-colors z-10"
                >
                  <svg
                    className="w-5 h-5 text-[#1B1717]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <div className="text-center">
                  <h2 className="text-[24px] font-['Gilroy-SemiBold'] text-[#1B1717] mb-[10px]">
                    Fund Request Details
                  </h2>
                  <div className="w-20 h-0.5 bg-[#039155] mx-auto"></div>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-[16px] font-['Gilroy-SemiBold'] text-[#1B1717] mb-4">
                  Transaction Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="p-3">
                      <p className="text-[12px] text-gray-500 mb-1">Transaction ID</p>
                      <p className="text-[14px] font-['Gilroy-Medium'] text-[#1B1717]">
                        {selectedRequest.transactionId || "-"}
                      </p>
                    </div>
                    <div className="p-3">
                      <p className="text-[12px] text-gray-500 mb-1">Amount</p>
                      <p className="text-[14px] font-['Gilroy-Medium'] text-[#1B1717]">
                        {selectedRequest.amount ? `₹${selectedRequest.amount}` : "-"}
                      </p>
                    </div>
                    <div className="p-3">
                      <p className="text-[12px] text-gray-500 mb-1">Status</p>
                      <span className={`inline-block px-3 py-1 text-[12px] font-['Gilroy-Medium'] rounded-full text-white ${
                        selectedRequest.status === "APPROVED"
                          ? "bg-[#039155]"
                          : selectedRequest.status === "REJECTED"
                          ? "bg-red-500"
                          : "bg-yellow-500"
                      }`}>
                        {selectedRequest.status || "PENDING"}
                      </span>
                    </div>
                    {selectedRequest.remarks && (
                      <div className="p-3">
                        <p className="text-[12px] text-gray-500 mb-1">Remarks</p>
                        <p className="text-[14px] font-['Gilroy-Medium'] text-[#1B1717]">
                          {selectedRequest.remarks}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="p-3">
                      <p className="text-[12px] text-gray-500 mb-1">Reference Number</p>
                      <p className="text-[14px] font-['Gilroy-Medium'] text-[#1B1717]">
                        {selectedRequest.referenceNo || "-"}
                      </p>
                    </div>
                    <div className="p-3">
                      <p className="text-[12px] text-gray-500 mb-1">Payment Mode</p>
                      <p className="text-[14px] font-['Gilroy-Medium'] text-[#1B1717]">
                        {selectedRequest.paymentMode || "-"}
                      </p>
                    </div>
                    <div className="p-3">
                      <p className="text-[12px] text-gray-500 mb-1">Transaction Date</p>
                      <p className="text-[14px] font-['Gilroy-Medium'] text-[#1B1717]">
                        {selectedRequest.transactionDate 
                          ? new Date(selectedRequest.transactionDate).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-[16px] font-['Gilroy-SemiBold'] text-[#1B1717] mb-4">
                  Requester Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="p-3">
                      <p className="text-[12px] text-gray-500 mb-1">Name</p>
                      <p className="text-[14px] font-['Gilroy-Medium'] text-[#1B1717]">
                        {selectedRequest.requester?.name || "-"}
                      </p>
                    </div>
                    <div className="p-3">
                      <p className="text-[12px] text-gray-500 mb-1">Email</p>
                      <p className="text-[14px] font-['Gilroy-Medium'] text-[#1B1717]">
                        {selectedRequest.requester?.email || "-"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="p-3">
                      <p className="text-[12px] text-gray-500 mb-1">Mobile</p>
                      <p className="text-[14px] font-['Gilroy-Medium'] text-[#1B1717]">
                        {selectedRequest.requester?.mobileNo || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-[16px] font-['Gilroy-SemiBold'] text-[#1B1717] mb-4">
                  Bank Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="p-3">
                      <p className="text-[12px] text-gray-500 mb-1">Bank Name</p>
                      <p className="text-[14px] font-['Gilroy-Medium'] text-[#1B1717]">
                        {selectedRequest.bank?.bankName || "-"}
                      </p>
                    </div>
                    <div className="p-3">
                      <p className="text-[12px] text-gray-500 mb-1">IFSC</p>
                      <p className="text-[14px] font-['Gilroy-Medium'] text-[#1B1717]">
                        {selectedRequest.bank?.ifsc || "-"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="p-3">
                      <p className="text-[12px] text-gray-500 mb-1">Account Number</p>
                      <p className="text-[14px] font-['Gilroy-Medium'] text-[#1B1717]">
                        {selectedRequest.bank?.accountNumber || "-"}
                      </p>
                    </div>
                    <div className="p-3">
                      <p className="text-[12px] text-gray-500 mb-1">Beneficiary Name</p>
                      <p className="text-[14px] font-['Gilroy-Medium'] text-[#1B1717]">
                        {selectedRequest.bank?.beneficiaryName || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedRequest.paySlip && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-[16px] font-['Gilroy-SemiBold'] text-[#1B1717] mb-3">
                    Payslip
                  </h3>
                  <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                    <img
                      src={selectedRequest.paySlip}
                      alt="Payslip"
                      className="w-full h-auto rounded-lg"
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23f3f4f6' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239ca3af' font-family='sans-serif' font-size='16'%3EImage not available%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                </div>
              )}

              {selectedRequest.approvalRemarks && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-[16px] font-['Gilroy-SemiBold'] text-[#1B1717] mb-3">
                    Approval Remarks
                  </h3>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-[14px] font-['Gilroy-Medium'] text-[#1B1717] whitespace-pre-wrap">
                      {selectedRequest.approvalRemarks}
                    </p>
                  </div>
                </div>
              )}

              {selectedRequest.status === "PENDING" && (
                <div className="border-t border-gray-200 pt-4">
                  <label className="block mb-2">
                    <span className="text-[14px] font-['Gilroy-Medium'] text-[#1B1717]">
                      Approval Remarks <span className="text-gray-400 text-[12px]">(Optional)</span>
                    </span>
                  </label>
                  <textarea
                    value={approvalRemarks}
                    onChange={(e) => setApprovalRemarks(e.target.value)}
                    placeholder="Enter approval remarks (optional)"
                    rows={3}
                    className="w-full px-3 py-2 border border-[#1B1717]/50 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#039155] focus:border-transparent resize-none"
                  />
                </div>
              )}

              {selectedRequest.status === "PENDING" && (
                <div className="border-t border-gray-200 pt-4">
                  <button
                    onClick={handleApprove}
                    disabled={submitting}
                    className="w-full px-6 py-3 bg-[#039155] text-white rounded-lg text-[14px] font-['Gilroy-Medium'] hover:bg-[#027a47] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <ButtonLoader color="#ffffff" size={16} thickness={2} />
                        Processing...
                      </>
                    ) : (
                      "Approve Request"
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FundRequest;
