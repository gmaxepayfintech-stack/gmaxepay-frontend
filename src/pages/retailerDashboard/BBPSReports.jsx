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
import { useNotification } from "../../context/NotificationContext";
import { bbpsUsersHistory } from "../../redux/action/walletAction";
import * as XLSX from "xlsx";

const BBPSReports = ({ onBack, type }) => {
    const dispatch = useDispatch();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const { showNotification } = useNotification();
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Helper function to determine search field based on input pattern
  const getSearchField = (query) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return {};

    // Check if it's a mobile number (10-12 digits)
    if (/^\d{10,12}$/.test(trimmedQuery)) {
      return { mobileNumber: trimmedQuery };
    }

    return { transactionId: trimmedQuery };
  };
    const [isReloading, setIsReloading] = useState(false);

    // Get BBPS history from Redux
    const walletHistoryResponse = useSelector(
        (state) => state?.wallet?.bbpsUserHistory?.data
    );
    const apiData = walletHistoryResponse || [];
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
                const datePart = date
                    .toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                    })
                    .replace(/\//g, "-");

                const timePart = date.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                });

                formattedDate = `${datePart} | ${timePart}`;
            }

            // Format amounts with currency symbol
            const formattedAmount = item.amount ? `₹${item.amount}` : "₹0";
            const formattedComm = item.comm ? `₹${item.comm}` : "₹0";

            return {
                id: item.id,
                transactionId: item.transactionId || "N/A",
                agentId: item.agentId || "N/A",
                operator: item.operator || "N/A",
                billerName: item.billerName || "N/A",
                billNumber: item.billNumber || "N/A",
                mobileNumber: item.mobileNumber || "N/A",
                amount: formattedAmount,
                comm: formattedComm,
                paymentStatus: item.paymentStatus || "N/A",
                createdAt: formattedDate,
                userName: item.user?.name || item.userDetails?.name || "N/A",
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
        if (statusFilter !== "All") {
            query.paymentStatus = statusFilter;
        }

        // Add date filters only if both dates are selected
        if (fromDate && toDate) {
            query.startDate = fromDate.replace(/-/g, "/");
            query.endDate = toDate.replace(/-/g, "/");
        }

        if (debouncedSearchQuery.trim()) {
            const searchFields = getSearchField(debouncedSearchQuery);
            Object.assign(query, searchFields);
        }

        const payload = {
            query: query,
            options: {
                page: currentPage,
                paginate: itemsPerPage,
                sort: {
                    createdAt: -1
                }
            },
            customSearch: {}
        };

        dispatch(bbpsUsersHistory(payload)).then((res) => {
            if (res?.status === "SUCCESS") {
                showNotification("BBPS history fetched successfully", "success");
            } else {
                showNotification(res?.message || "Failed to fetch BBPS history", "error");
            }
        });
    }, [dispatch, fromDate, toDate, debouncedSearchQuery, statusFilter, showNotification, currentPage, itemsPerPage]);

    // Reset isReloading when loading completes
    useEffect(() => {
        if (!isLoading && isReloading) {
            setIsReloading(false);
        }
    }, [isLoading, isReloading]);

    // Transform API data
    const transactions = apiData.length > 0 ? transformApiData(apiData) : [];

    // Filter transactions based on status and search query (CLIENT-SIDE)
    const filteredTransactions = transactions.filter((transaction) => {
        const searchLower = debouncedSearchQuery.toLowerCase();
        const matchesSearch =
            !debouncedSearchQuery ||
            transaction.transactionId.toLowerCase().includes(searchLower) ||
            transaction.mobileNumber.toLowerCase().includes(searchLower) ||
            transaction.userName.toLowerCase().includes(searchLower);

        return matchesSearch;
    });

    // SERVER-SIDE Pagination - use paginator from API response
    const bbpsResponse = useSelector((state) => state?.wallet?.bbpsUserHistory);
    const totalCount = bbpsResponse?.total || 0;
    const paginator = bbpsResponse?.paginator || {};
    const totalPages = paginator.pageCount || Math.ceil((bbpsResponse?.total || filteredTransactions.length) / itemsPerPage) || 1;
    const paginatedTransactions = filteredTransactions;

    // Reset to page 1 when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, debouncedSearchQuery, itemsPerPage]);

      const handleExportToExcel = async () => {
    if (totalCount === 0) {
      showNotification("No data available to export", "error");
      return;
    }

    const query = {};
    if (fromDate && toDate) {
      query.startDate = fromDate.replace(/-/g, "/");
      query.endDate = toDate.replace(/-/g, "/");
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

      const result = await bbpsUsersHistory(payload)(customDispatch);
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
        statusFilter === "All" || transaction.paymentStatus === statusFilter;
      return matchesStatus;
    });

    if (filteredExport.length === 0) {
      showNotification("No data matches the selected filters for export", "error");
      return;
    }

    const stripRupee = (val) => {
      if (val === undefined || val === null) return "";
      const str = String(val).replace(/₹/g, "").trim();
      const num = Number(str);
      return isNaN(num) ? str : num;
    };

    const excelData = filteredExport.map((row, index) => ({
            "Id": row.id,
            "Transaction ID": row.transactionId,
            "User": row.userName,
            "Operator": row.operator,
            "Biller Name": row.billerName,
            "Bill Number": row.billNumber,
            "Mobile No": row.mobileNumber,
            "Amount": stripRupee(row.amount),
            "Comm": row.comm,
            "Status": row.paymentStatus,
            "Date": row.createdAt,
        }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "BBPS_History");

    const fileName = `Export_Export_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };;

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
                                BBPS HISTORY
                            </h1>
                            <p className="text-xs sm:text-sm md:text-base text-[#1B1717] font-['Gilroy-Regular']">
                                Manage And Track All Your BBPS Transactions
                            </p>
                        </div>
                    </div>

                    {/* Status Filter Buttons and Reload Button */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        {["All", "Success", "Pending", "Failed"].map((status) => (
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
                                setSearchQuery("");
                                setStatusFilter("All");
                                setIsReloading(true);

                                const payload = {
                                    query: {},
                                    options: {
                                        page: 1,
                                        paginate: itemsPerPage,
                                        sort: {
                                            createdAt: -1
                                        }
                                    },
                                    customSearch: {}
                                };

                                dispatch(bbpsUsersHistory(payload)).then((res) => {
                                    if (res?.status === "SUCCESS") {
                                        showNotification("BBPS history refreshed successfully", "success");
                                    } else {
                                        showNotification(res?.message || "Failed to refresh BBPS history", "error");
                                    }
                                });
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
                            placeholder="Search By Transaction ID, Mobile Number, Name"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border-[0.5px] border-[#1B1717]/80 rounded-lg focus:outline-none text-sm sm:text-base"
                        />
                    </div>

                    {/* From Date */}
                    <div className="relative flex-1 md:flex-1 lg:flex-initial lg:w-auto">
                        <label className="block text-xs sm:text-sm text-[#1B1717]/80 mb-1 ml-1 font-[Gilroy-Medium]">
                            From Date
                        </label>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="w-full px-4 py-2.5 sm:py-3 border-[0.5px] border-[#1B1717]/80 rounded-lg focus:outline-none text-sm sm:text-base"
                        />
                    </div>

                    {/* To Date */}
                    <div className="relative flex-1 md:flex-1 lg:flex-initial lg:w-auto">
                        <label className="block text-xs sm:text-sm text-[#1B1717]/80 mb-1 ml-1 font-[Gilroy-Medium]">
                            To Date
                        </label>
                        <input
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
            <div className="bg-white rounded-xl sm:rounded-3xl shadow-sm mt-6 overflow-hidden">
                <div className="w-full overflow-x-auto overscroll-x-contain">
                    <table className="w-full border-collapse min-w-full">
                        <thead className="bg-[#FFFFFF] border-b border-gray-200 text-center">
                            <tr>
                                <th className="px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                                    Id
                                </th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs text-left sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                                    Transaction ID
                                </th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs text-left sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                                    User
                                </th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs text-left sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                                    Operator
                                </th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs text-left sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                                    Biller Name
                                </th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs text-left sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                                    Bill Number
                                </th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs text-left sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                                    Mobile No
                                </th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                                    Amount
                                </th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                                    Comm
                                </th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                                    Status
                                </th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                                    Date
                                </th>
                            </tr>
                        </thead>
                        {!isLoading && (
                            <tbody className="bg-white divide-y divide-gray-200 text-center">
                                {paginatedTransactions.length > 0 ? (
                                    paginatedTransactions.map((transaction, index) => {
                                        return (
                                            <tr
                                                key={transaction.id}
                                                className={`transition-colors ${index % 2 === 0
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
                                                        {transaction.transactionId}
                                                    </span>
                                                </td>

                                                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-left">
                                                    <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#121216]">
                                                        {transaction.userName}
                                                    </span>
                                                </td>

                                                <td className="px-4 sm:px-6 py-3 sm:py-4 text-left">
                                                    <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#121216] truncate max-w-[150px]" title={transaction.operator}>
                                                        {transaction.operator}
                                                    </span>
                                                </td>

                                                <td className="px-4 sm:px-6 py-3 sm:py-4 text-left">
                                                    <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#121216] truncate max-w-[150px]" title={transaction.billerName}>
                                                        {transaction.billerName}
                                                    </span>
                                                </td>

                                                <td className="px-4 sm:px-6 py-3 sm:py-4 text-left">
                                                    <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#121216]">
                                                        {transaction.billNumber}
                                                    </span>
                                                </td>

                                                <td className="px-4 sm:px-6 py-3 sm:py-4 text-left">
                                                    <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#121216]">
                                                        {transaction.mobileNumber}
                                                    </span>
                                                </td>

                                                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                                    <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#121216] font-[Gilroy-Medium]">
                                                        {transaction.amount}
                                                    </span>
                                                </td>

                                                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                                    <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#121216]">
                                                        {transaction.comm}
                                                    </span>
                                                </td>

                                                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-[Gilroy-Medium] ${transaction.paymentStatus === "Success"
                                                        ? "bg-green-100 text-green-700"
                                                        : transaction.paymentStatus === "Pending"
                                                            ? "bg-yellow-100 text-yellow-700"
                                                            : "bg-red-100 text-red-700"
                                                        }`}>
                                                        {transaction.paymentStatus}
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
                                        <td colSpan={11} className="px-4 sm:px-6 py-8 text-center">
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
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-4 sm:mt-6 pb-1 flex-shrink-0">
                    <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1 || isLoading}
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
                                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-[Gilroy-Medium] transition text-sm sm:text-base ${currentPage === pageNum
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
                        disabled={currentPage === totalPages || isLoading || totalPages === 0}
                        className="p-1.5 sm:p-2 rounded-lg border border-gray-300 bg-white text-[#1B1717] hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                </div>
            )}
        </div>
    );
};

BBPSReports.propTypes = {
    onBack: PropTypes.func,
    type: PropTypes.string,
};

export default BBPSReports;
