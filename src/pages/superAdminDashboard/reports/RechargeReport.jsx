import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  Share,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { HiArrowLeft } from "react-icons/hi2";
import { rechargeReportsAdmin } from "../../../redux/action/reportAction";
import { ButtonLoader } from "../../../widgets/layout/loader";

const RechargeReport = ({ onBack }) => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isReloading, setIsReloading] = useState(false);

  // Get data from Redux
  const rechargeReportResponse = useSelector(
    (state) => state?.reports?.adminTransaction,
  );
  const apiData = rechargeReportResponse?.data || [];
  const paginator = rechargeReportResponse?.paginator || {};
  const totalCount = rechargeReportResponse?.total || 0;
  const itemsPerPage = paginator.perPage || 10;
  const isLoading = useSelector((state) => state?.loading?.isLoading || false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Reset to first page on search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Helper function to determine search field based on input pattern
  const getSearchField = (query) => {
    const trimmedQuery = query.trim();

    // Check if it's a mobile number (10 digits)
    if (/^\d{10}$/.test(trimmedQuery)) {
      // API expects mobileNumber
      return { mobileNumber: trimmedQuery };
    }

    // Otherwise treat as transactionId (alphanumeric)
    if (trimmedQuery) {
      return { transactionId: trimmedQuery };
    }

    // No search
    return {};
  };

  // Fetch recharge reports
  useEffect(() => {
    const query = {
      // API expects serviceType: "MobileRecharge"
      serviceType: "MobileRecharge",
    };

    // Add date filters only if both dates are selected
    if (fromDate && toDate) {
      // Format date as YYYY-MM-DD (backend will handle format)
      query.startDate = fromDate;
      query.endDate = toDate;
    }

    // Get the appropriate search field based on input pattern
    const customSearch = debouncedSearchQuery.trim()
      ? getSearchField(debouncedSearchQuery)
      : {};

    const payload = {
      query: query,
      customSearch: customSearch,
      options: {
        page: currentPage,
        paginate: 10,
        // As per API contract: sort by id desc
        sort: { id: -1 },
      },
    };

    dispatch(rechargeReportsAdmin(payload));
  }, [dispatch, currentPage, debouncedSearchQuery, fromDate, toDate]);

  // Reset isReloading when loading completes
  useEffect(() => {
    if (!isLoading && isReloading) {
      setIsReloading(false);
    }
  }, [isLoading, isReloading]);

  // Transform API data to table format
  const transformApiData = (dataArray) => {
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      return [];
    }

    return dataArray.map((item, index) => {
      const srNo = (currentPage - 1) * itemsPerPage + index + 1;

      // Normalize status: API returns "SUCCESS" or "FAILURE", but UI expects "Success", "Failed", "Pending"
      let normalizedStatus = "Pending";
      if (item.status) {
        const statusUpper = item.status.toUpperCase();
        if (statusUpper === "SUCCESS") {
          normalizedStatus = "Success";
        } else if (statusUpper === "FAILURE" || statusUpper === "FAILED") {
          normalizedStatus = "Failed";
        } else if (statusUpper !== "PENDING") {
          // Only update if it's not PENDING (which is already the default)
          normalizedStatus = item.status;
        }
      }

      // Get API message from apiResponse or item
      const apiMessage =
        item.apiResponse?.message ||
        item.message ||
        item.apiResponse?.opid ||
        item.opid ||
        "N/A";

      // Get DR amount from apiResponse
      const drAmount = item.apiResponse?.dr_amount || 0;

      return {
        srNo,
        id: item.id || `recharge-${index}`,
        transactionId: item.transactionId || item.orderid || "N/A",
        orderId: item.orderid || "N/A",
        name: item.user?.name || "N/A",
        userId: item.user?.userId || "N/A",
        mobileNo: item.mobileNumber || "N/A",
        operator: item.apiResponse?.operatorName || "N/A",
        opcode: item.opcode || "N/A",
        circle: item.circle || "N/A",
        amount: item.amount || 0,
        drAmount: drAmount,
        status: normalizedStatus,
        commission: item.retailerCom || 0,
        txid: item.apiResponse?.txid || item.txid || "N/A",
        opid: item.apiResponse?.opid || item.opid || "N/A",
        apiMessage: apiMessage,
        date: item.createdAt || new Date().toISOString(),
        updatedDate: item.updatedAt || null,
      };
    });
  };

  // Transform API data
  const transactions = apiData.length > 0 ? transformApiData(apiData) : [];

  const statusFilters = ["All", "Success", "Pending", "Failed"];

  // Filter transactions based on selected status (search is handled by API)
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesStatus =
      statusFilter === "All" || transaction.status === statusFilter;
    return matchesStatus;
  });

  // Pagination settings - Use API pagination data
  // Since API handles pagination, we use the filtered transactions directly
  const paginatedTransactions = filteredTransactions;
  // Use pagination info from API response
  const totalPages = paginator.pageCount || 1;
  const apiCurrentPage = paginator.currentPage || currentPage;

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "N/A";
    }
  };

  // Format time for display
  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting time:", error);
      return "N/A";
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    const statusLower = (status || "").toLowerCase();
    if (statusLower === "success" || statusLower === "completed") {
      return "bg-[#039155] text-white";
    } else if (statusLower === "pending" || statusLower === "processing") {
      return "bg-yellow-500 text-white";
    } else if (statusLower === "failed" || statusLower === "failure") {
      return "bg-red-500 text-white";
    }
    return "bg-gray-500 text-white";
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-2 sm:p-3 md:p-4 text-[#1B1717] flex flex-col max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="mb-3 sm:mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-2 sm:mb-3">
          <div className="flex items-start gap-3 sm:gap-5">
            <button
              onClick={onBack || (() => globalThis.history?.back())}
              className="flex items-center text-[#1B1717] hover:text-[#039155] transition mt-1"
            >
              <div className="rounded-full p-2 bg-[#FFFFFF] border border-[#1B1717]/80 transition">
                <HiArrowLeft className="text-xl sm:text-2xl text-[#1B1717]/80 opacity-80" />
              </div>
            </button>

            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-['Gilroy-Medium'] text-[#1B1717]">
                Mobile Recharge History
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-[#1B1717] font-['Gilroy-Regular']">
                Manage And Track All Recharge Transactions
              </p>
            </div>
          </div>

          {/* Status Filter Buttons and Reload Button */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {statusFilters.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-2 sm:px-4 sm:py-3 rounded-2xl text-sm sm:text-base transition whitespace-nowrap ${
                  statusFilter === status
                    ? "bg-[#039155] text-white shadow-md font-['gilroy-semibold']"
                    : "bg-white text-[#1B1717]/80 font-['Gilroy-Medium'] border-[0.5px] border-[#1B1717]/80 hover:bg-gray-50"
                }`}
              >
                {status}
              </button>
            ))}

            <button
              onClick={() => {
                setFromDate("");
                setToDate("");
                setIsReloading(true);

                const query = { serviceType: "MobileRecharge" };
                const customSearch = debouncedSearchQuery.trim()
                  ? getSearchField(debouncedSearchQuery)
                  : {};

                const payload = {
                  query,
                  customSearch,
                  options: {
                    page: currentPage,
                    paginate: 10,
                    sort: { id: -1 },
                  },
                };

                dispatch(rechargeReportsAdmin(payload));
              }}
              className="p-2.5 sm:p-3 rounded-2xl bg-white text-gray-700 border-[0.5px] border-[#1B1717]/80 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isReloading && isLoading}
            >
              <RefreshCw
                className={`w-4 h-4 sm:w-5 sm:h-5 text-[#1B1717]/80 transition-transform ${
                  isReloading && isLoading ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="p-1 mb-2 flex-shrink-0">
        <div className="flex flex-col md:flex-col lg:flex-row items-stretch lg:items-end gap-3 sm:gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#1B1717]/80" />
            <input
              type="text"
              placeholder="Search By Transaction ID, Mobile Number, Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border-[0.5px] border-[#1B1717]/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] focus:border-[#039155] text-sm sm:text-base"
            />
          </div>

          {/* From Date */}
          <div className="relative flex-1 md:flex-1 lg:flex-initial lg:w-auto">
            <label
              htmlFor="fromDate"
              className="block text-xs sm:text-sm text-[#1B1717]/80 mb-1 ml-1 font-[Gilroy-Medium]"
            >
              From Date
            </label>
            <input
              id="fromDate"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-4 py-2.5 sm:py-3 border-[0.5px] border-[#1B1717]/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] focus:border-[#039155] text-sm sm:text-base"
            />
          </div>

          {/* To Date */}
          <div className="relative flex-1 md:flex-1 lg:flex-initial lg:w-auto">
            <label
              htmlFor="toDate"
              className="block text-xs sm:text-sm text-[#1B1717]/80 mb-1 ml-1 font-[Gilroy-Medium]"
            >
              To Date
            </label>
            <input
              id="toDate"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-4 py-2.5 sm:py-3 border-[0.5px] border-[#1B1717]/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] focus:border-[#039155] text-sm sm:text-base"
            />
          </div>

          {/* Export */}
          <div className="flex items-end">
            <button className="w-full lg:w-auto flex items-center gap-2 bg-[#039155] text-white px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-lg font-[Gilroy-Medium] hover:bg-green-700 transition shadow-md whitespace-nowrap">
              <span>Export</span>
              <Share className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="bg-white rounded-xl sm:rounded-3xl shadow-sm mt-6 overflow-hidden flex-1">
        {(() => {
          if (isLoading && paginatedTransactions.length === 0) {
            return (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <ButtonLoader color="#039155" size={40} thickness={4} />
                  <p className="text-base sm:text-lg font-['Gilroy-Medium'] text-[#1B1717]">
                    Loading recharge reports...
                  </p>
                </div>
              </div>
            );
          }
          if (paginatedTransactions.length === 0) {
            return (
              <div className="flex items-center justify-center py-20">
                <p className="text-base sm:text-lg font-['Gilroy-Medium'] text-gray-500">
                  No recharge transactions found
                </p>
              </div>
            );
          }
          return (
            <div className="w-full overflow-x-auto overscroll-x-contain">
              <table className="w-full border-collapse min-w-full">
                <thead className="bg-[#FFFFFF] border-b border-[#1B1717]/50 text-center">
                  <tr>
                    <th className="px-4 sm:px-5 py-3 sm:py-4  text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                      SR No
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4  text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                      Transaction ID
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4  text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                      Order ID
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4  text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                      Name
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4  text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                      User ID
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4  text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                      Mobile Number
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4  text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                      Operator
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4  text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                      Opcode
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4  text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                      Circle
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4  text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                      Amount
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4  text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                      DR Amount
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4  text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                      Commission
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4  text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                      Status
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4  text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                      TXID
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                      OPID
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4  text-left text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                      API Message
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4  text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                      Date
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4  text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                      Updated Date
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4  text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                      Updated Time
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedTransactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* Default Cell Style Applied Everywhere */}
                      {/* You can reuse this class for cleaner code */}

                      <td className="px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]/80 text-center whitespace-nowrap">
                        {transaction.srNo}
                      </td>

                      <td className="px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]/80 text-left whitespace-nowrap">
                        {transaction.transactionId}
                      </td>

                      <td className="px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]/80 text-left whitespace-nowrap">
                        {transaction.orderId}
                      </td>

                      {/* Name (Truncated Properly) */}
                      <td
                        className="px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]/80 text-left max-w-[160px] truncate whitespace-nowrap overflow-hidden text-ellipsis"
                        title={transaction.name}
                      >
                        {transaction.name}
                      </td>

                      <td className="px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]/80 text-left whitespace-nowrap">
                        {transaction.userId}
                      </td>

                      <td className="px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]/80 text-center whitespace-nowrap">
                        {transaction.mobileNo}
                      </td>

                      <td className="px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]/80 text-center whitespace-nowrap">
                        {transaction.operator}
                      </td>

                      <td className="px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]/80 text-center whitespace-nowrap">
                        {transaction.opcode}
                      </td>

                      <td className="px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]/80 text-center whitespace-nowrap">
                        {transaction.circle}
                      </td>

                      {/* Amount - Right aligned */}
                      <td className="px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]/80 text-center whitespace-nowrap">
                        ₹{Number.parseFloat(transaction.amount || 0).toFixed(2)}
                      </td>

                      <td className="px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]/80 text-center whitespace-nowrap">
                        ₹
                        {Number.parseFloat(transaction.drAmount || 0).toFixed(
                          2,
                        )}
                      </td>

                      <td className="px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]/80 text-center whitespace-nowrap">
                        ₹
                        {Number.parseFloat(transaction.commission || 0).toFixed(
                          2,
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs sm:text-sm font-['Gilroy-Medium'] ${getStatusBadgeColor(
                            transaction.status,
                          )}`}
                        >
                          {transaction.status}
                        </span>
                      </td>

                      {/* TXID */}
                      <td
                        className="px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]/80 text-left max-w-[160px] truncate whitespace-nowrap overflow-hidden text-ellipsis"
                        title={transaction.txid}
                      >
                        {transaction.txid}
                      </td>

                      {/* OPID */}
                      <td
                        className="px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]/80 text-left max-w-[160px] truncate whitespace-nowrap overflow-hidden text-ellipsis"
                        title={transaction.opid}
                      >
                        {transaction.opid}
                      </td>

                      {/* API Message */}
                      <td
                        className="px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]/80 text-left max-w-[160px] truncate whitespace-nowrap overflow-hidden text-ellipsis"
                        title={transaction.apiMessage}
                      >
                        {transaction.apiMessage}
                      </td>

                      <td className="px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]/80 text-center whitespace-nowrap">
                        {formatDate(transaction.date)}
                      </td>

                      <td className="px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]/80 text-center whitespace-nowrap">
                        {transaction.updatedDate
                          ? formatDate(transaction.updatedDate)
                          : "N/A"}
                      </td>

                      <td className="px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]/80 text-center whitespace-nowrap">
                        {transaction.updatedDate
                          ? formatTime(transaction.updatedDate)
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })()}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200">
            {/* <div className="text-sm sm:text-base text-[#1B1717] font-['Gilroy-Medium']">
              {(() => {
                const start =
                  paginatedTransactions.length > 0
                    ? (apiCurrentPage - 1) * itemsPerPage + 1
                    : 0;
                const end = Math.min(apiCurrentPage * itemsPerPage, totalCount);
                return `Showing ${start} to ${end} of ${totalCount} entries`;
              })()}
            </div> */}

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={apiCurrentPage === 1 || isLoading}
                className="p-2 sm:p-2.5 rounded-md border-[0.5px] border-[#121216]/54 bg-white text-[#121216] hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (apiCurrentPage <= 3) {
                  pageNum = i + 1;
                } else if (apiCurrentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = apiCurrentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-md font-[gilroy-regular] transition text-sm sm:text-base ${
                      apiCurrentPage === pageNum
                        ? "bg-[#039155] text-white"
                        : "bg-white border-[0.5px] border-[#121216]/54 text-[#1B1717] hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={apiCurrentPage === totalPages || isLoading}
                className="p-2 sm:p-2.5 rounded-md border-[0.5px] border-[#121216]/54 bg-white text-[#121216] hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

RechargeReport.propTypes = {
  onBack: PropTypes.func,
};

RechargeReport.defaultProps = {
  onBack: null,
};

export default RechargeReport;
