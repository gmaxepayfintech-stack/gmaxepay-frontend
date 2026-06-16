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
import { rechargeReportsUser } from "../../redux/action/reportAction";
import * as XLSX from "xlsx";

const DthRechargeHIstory = ({ onBack }) => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isReloading, setIsReloading] = useState(false);

  // Get data from Redux (user transaction reports)
  const rechargeReportResponse = useSelector(
    (state) => state?.reports?.userTransaction,
  );
  const apiData = rechargeReportResponse?.data || [];
  const isLoading = useSelector((state) => state?.loading?.isLoading || false);
  const totalCount = rechargeReportResponse?.total || 0;

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Reset to first page on search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Helper function to determine search field based on input pattern
  const getSearchField = (searchValue) => {
    const trimmedValue = searchValue.trim();
    if (!trimmedValue) return {};
    if (/^\d{10,12}$/.test(trimmedValue)) {
      return { mobileNumber: trimmedValue };
    }
    return { transactionId: trimmedValue };
  };

  // Fetch DTH recharge reports
  useEffect(() => {
    const query = {
      // API expects serviceType: "DTHRecharge"
      serviceType: "DTH1Recharge",
    };

    // Add date filters only if both dates are selected
    if (fromDate && toDate) {
      // Format date as YYYY-MM-DD (backend will handle format)
      query.startDate = fromDate;
      query.endDate = toDate;
    }

    if (debouncedSearchQuery.trim()) {
      const searchFields = getSearchField(debouncedSearchQuery);
      Object.assign(query, searchFields);
    }

    const payload = {
      query: query,
      customSearch: {},
      options: {
        page: currentPage,
        paginate: itemsPerPage,
        sort: { id: -1 },
      },
    };

    dispatch(rechargeReportsUser(payload));
  }, [dispatch, debouncedSearchQuery, fromDate, toDate, currentPage, itemsPerPage]);

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

      // Map operator from opcode or apiResponse
      let operator = "N/A";
      if (item.apiResponse?.operatorName) {
        operator = item.apiResponse.operatorName;
      } else if (item.opcode) {
        // Map opcode to operator name if needed
        const opcodeMap = {
          TTV: "Tata Sky",
          ATV: "Airtel Digital TV",
          DTV: "Dish TV",
          STV: "Sun Direct",
          VTV: "Videocon D2H",
        };
        operator = opcodeMap[item.opcode] || item.opcode;
      }

      return {
        srNo,
        id: item.id || `dth-${index}`,
        transactionId: item.transactionId || item.orderid || "N/A",
        name: item.user?.name || "N/A",
        mobileNo:
          item.dthNumber || item.mobileNumber || item.user?.mobileNo || "N/A",
        operator: operator,
        amount: item.amount || 0,
        status: normalizedStatus,
        commission: item.retailerCom || 0,
        date: item.createdAt || new Date().toISOString(),
        formattedDateTime: (() => {
          const dateObj = new Date(item.createdAt || new Date());
          const datePart = dateObj.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" }).replaceAll("/", "-");
          const timePart = dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
          return `${datePart} | ${timePart}`;
        })(),
        userId: item.user?.userId || "N/A",
        circle: item.circle || "N/A",
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

  // SERVER-SIDE Pagination - use paginator from API response
  const paginator = rechargeReportResponse?.paginator || rechargeReportResponse?.data?.paginator || {};
  const totalPages = paginator.pageCount || Math.ceil((rechargeReportResponse?.data?.length || 0) / itemsPerPage) || 1;
  const paginatedTransactions = filteredTransactions;
  const apiCurrentPage = paginator.currentPage || currentPage;

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, debouncedSearchQuery, itemsPerPage]);

    const handleExportToExcel = async () => {
    if (totalCount === 0) {
      alert("No data available to export");
      return;
    }

    const query = {
      serviceType: "DTHRecharge",
    };
    if (fromDate && toDate) {
      query.startDate = fromDate;
      query.endDate = toDate;
    }
    if (debouncedSearchQuery.trim()) {
      const searchFields = getSearchField(debouncedSearchQuery);
      Object.assign(query, searchFields);
    }

    const payload = {
      query,
      customSearch: {},
      options: {
        page: 1,
        paginate: Math.max(totalCount, 100000),
        sort: { id: -1 },
      },
    };

    let exportData = [];
    try {
      const customDispatch = (action) => {
        if (action?.type === "LOADING_START" || action?.type === "LOADING_END") {
          dispatch(action);
        }
      };

      const result = await rechargeReportsUser(payload)(customDispatch);
      let rawDocs = [];
      if (result) {
        if (Array.isArray(result.data)) {
          rawDocs = result.data;
        } else if (result.data?.docs && Array.isArray(result.data.docs)) {
          rawDocs = result.data.docs;
        } else if (result.data?.data && Array.isArray(result.data.data)) {
          rawDocs = result.data.data;
        } else if (Array.isArray(result)) {
          rawDocs = result;
        }
      }
      exportData = transformApiData(rawDocs);
    } catch (e) {
      exportData = transactions;
    }

    // Filter transactions based on selected status (CLIENT-SIDE)
    const filteredExport = exportData.filter((transaction) => {
      const matchesStatus =
        statusFilter === "All" || transaction.status === statusFilter;
      return matchesStatus;
    });

    if (filteredExport.length === 0) {
      alert("No data matches the selected filters for export");
      return;
    }

    const stripRupee = (val) => {
      if (val === undefined || val === null) return "";
      const str = String(val).replace(/₹/g, "").trim();
      const num = Number(str);
      return isNaN(num) ? str : num;
    };

    const excelData = filteredExport.map((row, index) => ({
      "SR No": row.srNo,
      "Transaction ID": row.transactionId,
      "Name": row.name,
      "DTH Number": row.mobileNo,
      "Operator": row.operator,
      "Circle": row.circle,
      "Amount": stripRupee(row.amount),
      "Commission": stripRupee(row.commission),
      "Status": row.status,
      "Date & Time": row.formattedDateTime,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DTH_History");

    const fileName = `Export_Export_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };;

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
                DTH Recharge History
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-[#1B1717] font-['Gilroy-Regular']">
                Manage And Track All DTH Recharge Transactions
              </p>
            </div>
          </div>

          {/* Status Filter Buttons and Reload Button */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {statusFilters.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-2 sm:px-4 sm:py-3 rounded-2xl text-sm sm:text-base transition whitespace-nowrap ${statusFilter === status
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

                const query = { serviceType: "DTH1Recharge" };
                if (debouncedSearchQuery.trim()) {
                  const searchFields = getSearchField(debouncedSearchQuery);
                  Object.assign(query, searchFields);
                }

                const payload = {
                  query,
                  customSearch: {},
                  options: {
                    page: 1,
                    paginate: itemsPerPage,
                    sort: { id: -1 },
                  },
                };

                dispatch(rechargeReportsUser(payload));
              }}
              className="p-2.5 sm:p-3 rounded-2xl bg-white text-gray-700 border-[0.5px] border-[#1B1717]/80 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isReloading && isLoading}
            >
              <RefreshCw
                className={`w-4 h-4 sm:w-5 sm:h-5 text-[#1B1717]/80 transition-transform ${isReloading && isLoading ? "animate-spin" : ""
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
              placeholder="Search By Transaction ID, DTH Number"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border-[0.5px] border-[#1B1717]/80 rounded-lg focus:outline-none text-sm sm:text-base"
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
              className="w-full px-4 py-2.5 sm:py-3 border-[0.5px] border-[#1B1717]/80 rounded-lg focus:outline-none text-sm sm:text-base"
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
              className="w-full px-4 py-2.5 sm:py-3 border-[0.5px] border-[#1B1717]/80 rounded-lg focus:outline-none text-sm sm:text-base"
            />
          </div>

          {/* Records per page & Export */}
          <div className="flex items-end gap-3 w-full lg:w-auto">
            <div className="relative flex-1 md:flex-1 lg:flex-initial lg:w-auto">
              <label className="block text-xs sm:text-sm text-[#1B1717]/80 mb-1 ml-1 font-[Gilroy-Medium]">
                Show Entries
              </label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2.5 sm:py-3 border-[0.5px] border-[#1B1717]/80 rounded-lg focus:outline-none text-sm sm:text-base appearance-none bg-white font-[Gilroy-Medium] cursor-pointer"
              >
                {[10, 50, 100, 200, 500, 1000].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleExportToExcel}
              className="flex-1 lg:flex-initial flex justify-center items-center gap-2 bg-[#039155] text-white px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-lg font-[Gilroy-Medium] hover:bg-green-700 transition shadow-md whitespace-nowrap"
            >
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
                    Loading DTH recharge reports...
                  </p>
                </div>
              </div>
            );
          }
          return (
            <div className="w-full overflow-x-auto overscroll-x-contain">
              <table className="w-full border-collapse min-w-full">
                <thead className="bg-[#FFFFFF] border-b border-[#1B1717]/50 text-center">
                  <tr>
                    <th className="px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                      SR No
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                      Transaction ID
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                      Name
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                      DTH Number
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-left font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                      Operator
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                      Circle
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                      Amount
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                      Commission
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                      Status
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                      Date & Time
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedTransactions.length === 0 ? (
                    <tr>
                      <td colSpan="11" className="px-4 py-8 text-center text-sm sm:text-base font-['Gilroy-Medium'] text-gray-500">
                        No DTH recharge transactions found
                      </td>
                    </tr>
                  ) : (
                    paginatedTransactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]/80 text-center whitespace-nowrap">
                          {transaction.srNo}
                        </td>
                        <td className="px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]/80 text-center whitespace-nowrap">
                          {transaction.transactionId}
                        </td>
                        <td className="px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]/80 text-left max-w-[160px] truncate whitespace-nowrap overflow-hidden text-ellipsis">
                          {transaction.name}
                        </td>
                        <td className="px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]/80 text-left whitespace-nowrap">
                          {transaction.mobileNo}
                        </td>
                        <td className="px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]/80 text-left whitespace-nowrap">
                          {transaction.operator}
                        </td>
                        <td className="px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]/80 text-center whitespace-nowrap">
                          {transaction.circle}
                        </td>
                        <td className="px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]/80 text-center whitespace-nowrap">
                          ₹{Number.parseFloat(transaction.amount || 0).toFixed(2)}
                        </td>
                        <td className="px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]/80 text-center whitespace-nowrap">
                          ₹
                          {Number.parseFloat(transaction.commission || 0).toFixed(
                            2,
                          )}
                        </td>
                        <td className="px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]/80 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs sm:text-sm font-['Gilroy-Medium'] ${getStatusBadgeColor(
                              transaction.status,
                            )}`}
                          >
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]/80 text-center whitespace-nowrap">
                          {transaction.formattedDateTime}
                        </td>
                      </tr>
                    )))}
                </tbody>
              </table>
            </div>
          );
        })()}

        {/* Pagination */}
        <div className="flex items-center justify-center px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200">
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
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-md font-[Gilroy-Regular] transition text-sm sm:text-base ${apiCurrentPage === pageNum
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
              disabled={apiCurrentPage === totalPages || isLoading || totalPages === 0}
              className="p-2 sm:p-2.5 rounded-md border-[0.5px] border-[#121216]/54 bg-white text-[#121216] hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

DthRechargeHIstory.propTypes = {
  onBack: PropTypes.func,
};

DthRechargeHIstory.defaultProps = {
  onBack: null,
};

export default DthRechargeHIstory;
