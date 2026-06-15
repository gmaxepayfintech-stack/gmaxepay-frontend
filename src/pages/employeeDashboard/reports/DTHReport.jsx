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
import { rechargeReportsEmployee } from "../../../redux/action/reportAction";
import { ButtonLoader } from "../../../widgets/layout/loader";
import * as XLSX from "xlsx";

const DTHReport = ({ onBack }) => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isReloading, setIsReloading] = useState(false);

  // Get data from Redux — employee-specific state key
  const rechargeReportResponse = useSelector(
    (state) => state?.reports?.employeeTransaction,
  );
  
  // Safely extract the array data regardless of nesting level
  let apiData = [];
  if (rechargeReportResponse?.data) {
    if (Array.isArray(rechargeReportResponse.data)) {
      apiData = rechargeReportResponse.data;
    } else if (rechargeReportResponse.data.data && Array.isArray(rechargeReportResponse.data.data)) {
      apiData = rechargeReportResponse.data.data;
    } else if (rechargeReportResponse.data.data?.data && Array.isArray(rechargeReportResponse.data.data.data)) {
      apiData = rechargeReportResponse.data.data.data;
    }
  } else if (Array.isArray(rechargeReportResponse)) {
    apiData = rechargeReportResponse;
  }

  const paginator = rechargeReportResponse?.paginator || {};
  const totalCount = rechargeReportResponse?.total || 0;

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

    // Check if it's a DTH number (10-12 digits) or mobile number (10 digits)
    if (/^\d{10,12}$/.test(trimmedQuery)) {
      // API expects dthNumber for DTH service
      return { dthNumber: trimmedQuery };
    }

    // Check if it's a name (letters, spaces, dots)
    if (/^[A-Za-z\s.]+$/.test(trimmedQuery)) {
      return { name: trimmedQuery };
    }

    // Otherwise treat as transactionId (alphanumeric)
    if (trimmedQuery) {
      return { transactionId: trimmedQuery };
    }

    // No search
    return {};
  };

  // Fetch DTH recharge reports
  useEffect(() => {
    const bothDatesSelected = fromDate && toDate;
    const bothDatesNull = !fromDate && !toDate;
    if (!bothDatesSelected && !bothDatesNull) return;

    const query = { serviceType: "DTH1Recharge" };
    if (fromDate && toDate) {
      query.startDate = fromDate;
      query.endDate = toDate;
    }
    const customSearch = debouncedSearchQuery.trim()
      ? getSearchField(debouncedSearchQuery)
      : {};
    const payload = {
      query,
      customSearch,
      options: { page: currentPage, paginate: itemsPerPage, sort: { id: -1 } },
    };
    dispatch(rechargeReportsEmployee(payload));
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
        id: item.id || `dth-${index}`,
        transactionId: item.transactionId || item.orderid || "N/A",
        orderId: item.orderid || "N/A",
        name: item.user?.name || "N/A",
        userId: item.user?.userId || "N/A",
        mobileNo:
          item.dthNumber || item.mobileNumber || item.user?.mobileNo || "N/A",
        operator: operator,
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

  // SERVER-SIDE Pagination
  const totalPages = paginator.pageCount || Math.ceil(totalCount / itemsPerPage) || 1;
  const paginatedTransactions = filteredTransactions;
  const apiCurrentPage = currentPage;

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, debouncedSearchQuery, itemsPerPage]);

  // Export to Excel function
    const handleExportToExcel = async () => {
    if (totalCount === 0) {
      alert("No data available to export");
      return;
    }

    const query = {
      serviceType: "DTH1Recharge",
    };
    if (fromDate && toDate) {
      query.startDate = fromDate;
      query.endDate = toDate;
    }
    const customSearch = debouncedSearchQuery.trim() ? getSearchField(debouncedSearchQuery) : {};

    const payload = {
      query,
      customSearch,
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

      const result = await rechargeReportsEmployee(payload)(customDispatch);
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
      "SR No": String(index + 1).padStart(2, "0"),
      "Transaction ID": row.transactionId,
      "Order ID": row.orderId,
      "Name": row.name,
      "User ID": row.userId,
      "DTH Number": row.mobileNo,
      "Operator": row.operator,
      "Opcode": row.opcode,
      "Circle": row.circle,
      "Amount": stripRupee(row.amount),
      "DR Amount": stripRupee(row.drAmount),
      "Commission": stripRupee(row.commission),
      "Status": row.status,
      "TXID": row.txid,
      "OPID": row.opid,
      "API Message": row.apiMessage,
      "Date": formatDate(row.date),
      "Updated Date": row.updatedDate ? formatDate(row.updatedDate) : "N/A",
      "Updated Time": row.updatedDate ? formatTime(row.updatedDate) : "N/A",
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
                const customSearch = debouncedSearchQuery.trim()
                  ? getSearchField(debouncedSearchQuery)
                  : {};

                const payload = {
                  query,
                  customSearch,
                  options: {
                    page: 1,
                    paginate: itemsPerPage,
                    sort: { id: -1 },
                  },
                };

                dispatch(rechargeReportsEmployee(payload));
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
                      Order ID
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                      Name
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                      User ID
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                      DTH Number
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-left font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                      Operator
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                      Opcode
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                      Circle
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                      Amount
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                      DR Amount
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                      Commission
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                      Status
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm  font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                      TXID
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-left font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                      OPID
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-left font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                      API Message
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                      Date
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                      Updated Date
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                      Updated Time
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedTransactions.length === 0 ? (
                    <tr>
                      <td colSpan="19" className="px-4 py-8 text-center text-sm sm:text-base font-['Gilroy-Medium'] text-gray-500">
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
                        <td className="px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]/80 text-left whitespace-nowrap">
                          {transaction.orderId}
                        </td>
                        <td className="px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]/80 text-left max-w-[160px] truncate whitespace-nowrap overflow-hidden text-ellipsis">
                          {transaction.name}
                        </td>
                        <td className="px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]/80 text-center whitespace-nowrap">
                          {transaction.userId}
                        </td>
                        <td className="px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]/80 text-left whitespace-nowrap">
                          {transaction.mobileNo}
                        </td>
                        <td className="px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]/80 text-left whitespace-nowrap">
                          {transaction.operator}
                        </td>
                        <td className="px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]/80 text-center whitespace-nowrap">
                          {transaction.opcode}
                        </td>
                        <td className="px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]/80 text-center whitespace-nowrap">
                          {transaction.circle}
                        </td>
                        <td className="px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]/80 text-center whitespace-nowrap">
                          ₹{Number(transaction.amount || 0).toFixed(2)}
                        </td>
                        <td className="px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]/80 text-center whitespace-nowrap">
                          ₹{Number(transaction.drAmount || 0).toFixed(2)}
                        </td>
                        <td className="px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]/80 text-center whitespace-nowrap">
                          ₹{Number(transaction.commission || 0).toFixed(2)}
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
                        <td className="px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]/80 text-left max-w-[160px] truncate whitespace-nowrap overflow-hidden text-ellipsis">
                          {transaction.txid}
                        </td>
                        <td className="px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]/80 text-left max-w-[160px] truncate whitespace-nowrap overflow-hidden text-ellipsis">
                          {transaction.opid}
                        </td>
                        <td className="px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]/80 text-left max-w-[160px] truncate whitespace-nowrap overflow-hidden text-ellipsis">
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

DTHReport.propTypes = {
  onBack: PropTypes.func,
};

DTHReport.defaultProps = {
  onBack: null,
};

export default DTHReport;
