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
import { ButtonLoader } from "../../widgets/layout/loader";
import { getPayoutHistory } from "../../redux/action/payoutAction";

const WalletHistory = ({ onBack, type }) => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isReloading, setIsReloading] = useState(false);

  // Get payout history from Redux
  const payoutHistoryResponse = useSelector(
    (state) => state?.payout?.payoutHistory,
  );
  const apiData = payoutHistoryResponse?.data || [];
  const isLoading = useSelector((state) => state?.loading?.isLoading || false);

  // Transform API response data to table format
  const transformApiData = (dataArray) => {
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      return [];
    }

    return dataArray.map((item) => {
      // Format date from API
      let formattedDate = "N/A";
      if (item.createdAt) {
        const date = new Date(item.createdAt);
        formattedDate = date
          .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
          })
          .replace(/\//g, "-");
      }

      // Format amount with currency symbol
      const formattedAmount = item.amount ? `₹${item.amount}` : "₹0";

      // Map status from API to display format
      const getStatusDisplay = (status) => {
        if (status === null || status === undefined) return "Pending";
        const statusUpper = String(status).toUpperCase();
        if (statusUpper === "SUCCESS") return "Success";
        if (statusUpper === "FAILED" || statusUpper === "FAILURE")
          return "Failed";
        return "Pending";
      };

      // Get AEPS type
      const getAepsType = (apiResponse) => {
        if (!apiResponse) return "Internal";
        if (apiResponse.aepsType === "AEPS1") return "AEPS 1";
        if (apiResponse.aepsType === "AEPS2") return "AEPS 2";
        return "Internal";
      };

      return {
        id: item.id,
        transactionID: item.transactionID || "N/A",
        refId: item.refId || "N/A",
        mobileNo: item.mobile || "N/A",
        accountNumber: item.accountNumber || "N/A",
        ifscCode: item.ifscCode || "N/A",
        bankName: item.bankName || "N/A",
        beneficiaryName: item.beneficiaryName || "N/A",
        amount: formattedAmount,
        status: getStatusDisplay(item.status),
        type: item.type || "N/A",
        walletType: item.walletType || "N/A",
        aepsType: getAepsType(item.apiResponse),
        openingBalance: item.openingBalance ? `₹${item.openingBalance}` : "N/A",
        closingBalance: item.closingBalance ? `₹${item.closingBalance}` : "N/A",
        createdAt: formattedDate,
        originalItem: item,
      };
    });
  };

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch data from API
  useEffect(() => {
    // Only make API call if both dates are selected OR both are null
    const bothDatesSelected = fromDate && toDate;
    const bothDatesNull = !fromDate && !toDate;

    if (!bothDatesSelected && !bothDatesNull) {
      return;
    }

    const query = {};

    // Add date filters only if both dates are selected
    if (fromDate && toDate) {
      query.startDate = fromDate.replace(/-/g, "/");
      query.endDate = toDate.replace(/-/g, "/");
    }

    const payload = {
      query,
      customSearch: {},
      options: {
        page: 1,
        paginate: 1000, // Get all records since API doesn't support pagination
        sort: { id: -1 },
      },
    };

    dispatch(getPayoutHistory(payload));
  }, [dispatch, fromDate, toDate]);

  // Reset isReloading when loading completes
  useEffect(() => {
    if (!isLoading && isReloading) {
      setIsReloading(false);
    }
  }, [isLoading, isReloading]);

  // Transform API data
  const transactions = apiData.length > 0 ? transformApiData(apiData) : [];

  const statusFilters = ["All", "Success", "Pending", "Failed"];

  // Filter transactions based on status and search query (CLIENT-SIDE)
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesStatus =
      statusFilter === "All" || transaction.status === statusFilter;

    // Search in multiple fields
    const searchLower = debouncedSearchQuery.toLowerCase();
    const matchesSearch =
      !debouncedSearchQuery ||
      transaction.transactionID.toLowerCase().includes(searchLower) ||
      transaction.refId.toString().includes(searchLower) ||
      transaction.mobileNo.includes(searchLower) ||
      transaction.beneficiaryName.toLowerCase().includes(searchLower);

    return matchesStatus && matchesSearch;
  });

  // CLIENT-SIDE Pagination
  const itemsPerPage = 10;
  const totalCount = filteredTransactions.length;
  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    endIndex,
  );

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, debouncedSearchQuery]);

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
                WALLET HISTORY
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-[#1B1717] font-['Gilroy-Regular']">
                Manage And Track All Your Payout Transactions
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
                setSearchQuery("");
                setIsReloading(true);

                const payload = {
                  query: {},
                  customSearch: {},
                  options: {
                    page: 1,
                    paginate: 1000,
                    sort: { id: -1 },
                  },
                };

                dispatch(getPayoutHistory(payload));
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
              placeholder="Search By Transaction ID, User ID, Mobile, Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border-[0.5px] border-[#1B1717]/80 rounded-lg focus:outline-none  text-sm sm:text-base"
            />
          </div>

          {/* From Date */}
          <div className="relative flex-1 md:flex-1 lg:flex-initial lg:w-auto">
            <label className="block text-xs sm:text-sm text-[#1B1717]/80 mb-1 ml-1 font-[gilroy-medium]">
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-4 py-2.5 sm:py-3 border-[0.5px] border-[#1B1717]/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] focus:border-[#039155] text-sm sm:text-base"
            />
          </div>

          {/* To Date */}
          <div className="relative flex-1 md:flex-1 lg:flex-initial lg:w-auto">
            <label className="block text-xs sm:text-sm text-[#1B1717]/80 mb-1 ml-1 font-[gilroy-medium]">
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-4 py-2.5 sm:py-3 border-[0.5px] border-[#1B1717]/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] focus:border-[#039155] text-sm sm:text-base"
            />
          </div>

          {/* Export */}
          <div className="flex items-end">
            <button className="w-full lg:w-auto flex items-center gap-2 bg-[#039155] text-white px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-lg font-medium hover:bg-green-700 transition shadow-md whitespace-nowrap">
              <span>Export</span>
              <Share className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="bg-white rounded-xl sm:rounded-3xl shadow-sm mt-6 overflow-hidden">
        <div className="w-full overflow-x-auto overscroll-x-contain">
          <table className="w-full border-collapse min-w-full">
            <thead className="bg-[#FFFFFF] border-b border-gray-200 text-center">
              <tr>
                <th className="px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                  SR No
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs text-left sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                  Transaction ID
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                  User ID
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                  Mobile
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs text-left sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                  Beneficiary
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs text-left sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                  Account Number
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs text-left sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                  IFSC Code
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs text-left sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                  Bank Name
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                  Amount
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                  Opening Bal
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                  Closing Bal
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                  Type
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                  AEPS Type
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                  Status
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                  Created At
                </th>
              </tr>
            </thead>
            {!isLoading && (
              <tbody className="bg-white divide-y divide-gray-200 text-center">
                {paginatedTransactions.length > 0 ? (
                  paginatedTransactions.map((transaction, index) => {
                    const currentPosition = startIndex + index + 1;
                    const reverseSrNo = totalCount - currentPosition + 1;
                    const srNo = String(reverseSrNo).padStart(2, "0");

                    return (
                      <tr
                        key={transaction.id}
                        className={`transition-colors ${
                          index % 2 === 0
                            ? "bg-[#039155]/5 hover:bg-[#E8F5ED] "
                            : "bg-white hover:bg-gray-50"
                        }`}
                      >
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#121216]">
                            {transaction.id}
                          </span>
                        </td>

                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-left">
                          <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#121216]">
                            {transaction.transactionID}
                          </span>
                        </td>

                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#121216]">
                            {transaction.refId}
                          </span>
                        </td>

                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#121216]">
                            {transaction.mobileNo}
                          </span>
                        </td>

                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-left">
                          <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#121216] truncate">
                            {transaction.beneficiaryName}
                          </span>
                        </td>

                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-left">
                          <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#121216]">
                            {transaction.accountNumber}
                          </span>
                        </td>

                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-left">
                          <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#121216]">
                            {transaction.ifscCode}
                          </span>
                        </td>

                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-left">
                          <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#121216] truncate">
                            {transaction.bankName}
                          </span>
                        </td>

                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#121216] font-medium">
                            {transaction.amount}
                          </span>
                        </td>

                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#121216]">
                            {transaction.openingBalance}
                          </span>
                        </td>

                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#121216]">
                            {transaction.closingBalance}
                          </span>
                        </td>

                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#121216] uppercase">
                            {transaction.type}
                          </span>
                        </td>

                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#121216]">
                            {transaction.aepsType}
                          </span>
                        </td>

                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                              transaction.status === "Success"
                                ? "bg-[#039155] text-white"
                                : transaction.status === "Pending"
                                  ? "bg-orange-500/80 text-white"
                                  : "bg-red-500/80 text-white"
                            }`}
                          >
                            {transaction.status}
                          </span>
                        </td>

                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#121216]">
                            {transaction.createdAt}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={15} className="px-4 sm:px-6 py-8 text-center">
                      <p className="text-sm sm:text-base font-['Gilroy-Medium'] text-gray-500">
                        No transactions found
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            )}
          </table>
        </div>
      </div>

      {/* Loading / Pagination */}
      {isLoading ? (
        <div className="flex items-center justify-center gap-3 mt-4 sm:mt-6 pb-2 flex-shrink-0">
          <ButtonLoader color="#039155" size={24} thickness={3} />
          <p className="text-sm sm:text-base font-['Gilroy-Medium'] text-[#1B1717]">
            Loading...
          </p>
        </div>
      ) : (
        totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-4 sm:mt-6 pb-1 flex-shrink-0">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-1.5 sm:p-2 rounded-lg border border-gray-300 bg-white text-[#1B1717] hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-medium transition text-sm sm:text-base ${
                    currentPage === pageNum
                      ? "bg-[#039155] text-white"
                      : "bg-white border border-gray-300 text-[#1B1717] hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="p-1.5 sm:p-2 rounded-lg border border-gray-300 bg-white text-[#1B1717] hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        )
      )}
    </div>
  );
};

WalletHistory.propTypes = {
  onBack: PropTypes.func,
  type: PropTypes.string,
};

export default WalletHistory;
