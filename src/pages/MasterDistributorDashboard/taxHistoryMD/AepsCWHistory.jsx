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
import { ButtonLoader } from "../../../widgets/layout/loader";
import TransactioDetails from "./TransactioDetails";
import { getAeps2CwHistoryUsers, getAeps2TransactionDetailsUsers } from "../../../redux/action/aepsTwoAction";
import { getAepsCwHistoryUser, getAepsTransactionDetails } from "../../../redux/action/aepsAction";
import * as XLSX from "xlsx";


const AepsCWHistory = ({ onBack, apiType = "aeps1", transactionType = "CW" }) => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPageState, setItemsPerPageState] = useState(10);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isReloading, setIsReloading] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [isLoadingTransactionDetails, setIsLoadingTransactionDetails] = useState(false);
  const [selectedTransactionData, setSelectedTransactionData] = useState(null);

  // Determine which Redux state to use based on apiType
  const aepsCwHistoryResponse = useSelector((state) => {
    if (apiType === "aeps2") {
      return state?.aepsTwo?.aeps2CwHistoryUsers;
    }
    return state?.aeps?.aepsCwHistoryUser;
  });
  const apiData = aepsCwHistoryResponse?.data || [];
  const paginator = aepsCwHistoryResponse?.paginator || {};
  const isLoading = useSelector((state) => state?.loading?.isLoading || false);

  // Selector for fetching transaction details from Redux
  const transactionDetailsData = useSelector((state) => {
    if (apiType === "aeps2") {
      return state?.aepsTwo?.aeps2CwHistoryTransactionDetails;
    }
    return state?.aeps?.transactionDetails;
  });

  // Transform API response data to table format
  const transformApiData = (dataArray) => {
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      return [];
    }

    return dataArray.map((item, index) => {
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
          .replaceAll("/", "-");
        const timePart = date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
        formattedDate = `${datePart} | ${timePart}`;
      }

      // Determine if this is AEPS 1 response structure from reports
      const isAeps1New = !!item.transactionStatus;

      // --- Amount ---
      const amountValue = isAeps1New ? (item.transactionAmount || 0) : (item.amount || 0);
      let formattedAmount = `₹${amountValue}`;

      const txnType = item.transactionType || transactionType;
      if (txnType === "BE" || txnType === "MS") {
        formattedAmount = "₹0";
      }

      // --- Status ---
      const getStatusDisplay = (statusVal) => {
        if (!statusVal) return "Pending";
        const s = String(statusVal).toUpperCase();
        if (s === "SUCCESS" || s === "SUCCESSFUL" || s === "TRUE") return "Success";
        if (s === "FAILED" || s === "FAILURE" || s === "FALSE" || s === "ERROR" || s === "ERR") return "Failed";
        return "Pending";
      };

      const statusValue = isAeps1New ? item.transactionStatus : item.status;

      // --- VIA / Capture Type ---
      const getViaDisplay = (peripheral, device, captureType) => {
        const val = peripheral || device || captureType || "APP";
        const valUpper = String(val).toUpperCase();
        if (valUpper.includes("FINGER")) return "FINGER";
        if (valUpper.includes("IRIS")) return "IRIS";
        return valUpper;
      };

      // --- User Details ---
      const userDetails = item.userDetails || {};
      const userName = item.name || userDetails.name || "N/A";
      const mobileNo = item.mobileNumber || item.mobileNo || userDetails.mobileNo || "N/A";
      const aadhaar = item.aadhaarLastFour || item.consumerNumber || "N/A";

      // --- Master Distributor Commission ---
      const mdComm = item.masterDistributorCom || 0;
      const mdTDS = item.masterDistributorComTDS || 0;

      // --- Wallet Balances ---
      const rawOpening = apiType === "aeps2" ? item.openingAeps2Wallet : item.openingWallet;
      const formattedOpening = rawOpening !== undefined && rawOpening !== null ? `₹${Number(rawOpening).toFixed(2)}` : "₹0.00";

      const rawClosing = apiType === "aeps2" ? item.closingAeps2Wallet : item.closingWallet;
      const formattedClosing = rawClosing !== undefined && rawClosing !== null ? `₹${Number(rawClosing).toFixed(2)}` : "₹0.00";

      const formattedComm = `₹${Number(mdComm).toFixed(2)}`;
      const formattedTDS = `₹${Number(mdTDS).toFixed(2)}`;

      return {
        id: item.id,
        refId: item.refId || item.addedBy || "N/A",
        name: userName,
        userRole:
          item.userRole === 5 ? "Retailer" :
          item.userRole === 4 ? "Distributor" :
          item.userRole === 3 ? "Master Distributor" :
          item.userRole === 2 ? "White Label" :
          item.userRole === 1 ? "Super Admin" : `Role ${item.userRole || "N/A"}`,
        mobileNo: mobileNo,
        consumerNumber: aadhaar,
        companyId: item.companyId ?? "N/A",
        companyName: item.companyName || item.operator || "N/A",
        merchantLoginId: item.merchantLoginId || item.subMerchantCode || "N/A",
        bankName: item.bankName || "N/A",
        taxId: item.transactionId || "N/A",
        refID: item.merchantReferenceId || item.refId || "N/A",
        bankRRN: item.bankRRN || "N/A",
        amount: formattedAmount,
        openingBal: formattedOpening,
        closingBal: formattedClosing,
        commission: formattedComm,
        tds: formattedTDS,
        via: getViaDisplay(item.peripheral, item.device, item.captureType),
        status: getStatusDisplay(statusValue),
        createdAt: formattedDate,
        mdCommDisplay: `Comm: ₹${mdComm} | TDS: ₹${mdTDS}`,
        responseMessage: item.message || item.responseMessage || "N/A",
        serviceType: item.serviceType || "N/A",
        originalItem: item,
      };
    });
  };

  // Function to determine search field based on input pattern
  const getSearchField = (searchValue) => {
    const trimmedValue = searchValue.trim();
    if (!trimmedValue) return null;

    // Check if it starts with "CW" (FP Transaction ID pattern)
    if (/^CW/i.test(trimmedValue)) {
      return { fpTransactionId: trimmedValue };
    }

    // Check if it's a 10-digit phone number
    if (/^\d{10}$/.test(trimmedValue)) {
      return { mobileNo: trimmedValue };
    }

    // Check if it's 11-20 digits (Bank RRN pattern)
    if (/^\d{11,20}$/.test(trimmedValue)) {
      return { bankRRN: trimmedValue };
    }

    // Check if it's all letters and spaces with no numbers (Name pattern)
    // Must be checked before transaction ID to avoid false matches
    if (/^[A-Za-z\s]+$/.test(trimmedValue)) {
      return { name: trimmedValue };
    }

    // Check if it matches transaction ID pattern (3-4 capital letters at start, then alphanumeric with numbers)
    // Pattern: 3-4 capital letters at start, followed by alphanumeric that includes numbers
    // Example: ZPAY2512191006CEEFB5 (ZPAY = 4 caps, then has numbers)
    if (/^[A-Z]{3,4}[A-Za-z0-9]*\d+[A-Za-z0-9]*$/.test(trimmedValue)) {
      return { transactionId: trimmedValue };
    }

    // Default: if pattern doesn't match, try as transactionId
    return { transactionId: trimmedValue };
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
    // Don't call if only one date is selected
    const bothDatesSelected = fromDate && toDate;
    const bothDatesNull = !fromDate && !toDate;

    if (!bothDatesSelected && !bothDatesNull) {
      return;
    }

    // Build query based on API type
    const query = {};
    if (apiType === "aeps1") {
      // For AEPS 1, use transactionType
      query.transactionType = transactionType;
    } else if (apiType === "aeps2") {
      // For AEPS 2, use transactionType
      query.transactionType = transactionType;
    }

    // Add date filters only if both dates are selected
    if (fromDate && toDate) {
      // Format date as YYYY/MM/DD (input is YYYY-MM-DD, convert to YYYY/MM/DD)
      query.startDate = fromDate.replaceAll("-", "/");
      query.endDate = toDate.replaceAll("-", "/");
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
        paginate: itemsPerPageState,
        sort: { createdAt: -1 },
      },
    };

    // Dispatch the appropriate API call based on apiType
    if (apiType === "aeps2") {
      dispatch(getAeps2CwHistoryUsers(payload));
    } else {
      dispatch(getAepsCwHistoryUser(payload));
    }
  }, [dispatch, currentPage, debouncedSearchQuery, fromDate, toDate, apiType, transactionType, itemsPerPageState]);

  // Reset isReloading when loading completes
  useEffect(() => {
    if (!isLoading && isReloading) {
      setIsReloading(false);
    }
  }, [isLoading, isReloading]);

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
  const itemsPerPage = paginator.perPage || itemsPerPageState;
  // Since API handles pagination, we use the filtered transactions directly
  const paginatedTransactions = filteredTransactions;
  // Use pagination info from API response
  const totalPages = paginator.pageCount || 1;
  const apiCurrentPage = paginator.currentPage || currentPage;

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, itemsPerPageState]);

  const handleExportToExcel = () => {
    if (!filteredTransactions || filteredTransactions.length === 0) {
      alert("No data available to export");
      return;
    }

    const excelData = filteredTransactions.map((row) => {
      const baseData = {
        "Name": row.name,
        "User Role": row.userRole,
        "Mobile No": row.mobileNo,
        "Company Id": row.companyId,
        "Company Name": row.companyName,
        "Merchant Id": row.merchantLoginId,
        "Bank Name": row.bankName,
        ...(apiType === "aeps2" ? { "Service Type": row.serviceType } : {}),
        "Tax ID": row.taxId,
        "Bank RRN": row.bankRRN,
        "Amount": row.amount,
        "Commission": row.commission,
        "TDS": row.tds,
        "Opening Bal": row.openingBal,
        "Closing Bal": row.closingBal,
        "VIA": row.via,
        "Status": row.status,
        "Created At": row.createdAt,
        "Response Message": row.responseMessage,
      };
      return baseData;
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "AEPS_CW_History");

    // Dynamic filename based on API type and transaction type
    const prefix = apiType === "aeps2" ? "AEPS2" : "AEPS1";
    const fileName = `${prefix}_${transactionType}_History_Export_${new Date().toISOString().split("T")[0]}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  };

  // Watch for transaction details to be loaded
  useEffect(() => {
    if (selectedTransactionId && isLoadingTransactionDetails) {
      if (!isLoading) {
        const timer = setTimeout(() => {
          setIsLoadingTransactionDetails(false);
          setShowTransactionDetails(true);
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [selectedTransactionId, isLoading, isLoadingTransactionDetails]);

  // Handle view button click - use local data for AEPS1, hit API for AEPS2
  const handleViewClick = (transaction) => {
    if (!transaction) return;

    if (apiType === "aeps2") {
      // AEPS2 still needs to fetch details from API
      const transactionId = transaction.id;
      if (!transactionId || isLoadingTransactionDetails) return;
      setIsLoadingTransactionDetails(true);
      setSelectedTransactionId(transactionId);
      dispatch(getAeps2TransactionDetailsUsers(transactionId));
    } else {
      // AEPS1 uses local data (no API hit)
      if (!transaction.originalItem) return;
      const detailsData = {
        data: transaction.originalItem
      };
      setSelectedTransactionData(detailsData);
      setShowTransactionDetails(true);
    }
  };

  // Watch for AEPS2 transaction details to be loaded
  useEffect(() => {
    if (apiType === "aeps2" && selectedTransactionId && isLoadingTransactionDetails) {
      if (!isLoading) {
        const timer = setTimeout(() => {
          setIsLoadingTransactionDetails(false);
          setShowTransactionDetails(true);
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [selectedTransactionId, isLoading, isLoadingTransactionDetails, apiType]);

  // Show loading overlay when fetching details (only for AEPS2)
  if (isLoadingTransactionDetails && selectedTransactionId) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] p-3 sm:p-4 md:p-6 text-[#1B1717] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <ButtonLoader color="#039155" size={40} thickness={4} />
          <p className="text-base sm:text-lg font-['Gilroy-Medium'] text-[#1B1717]">
            Loading transaction details...
          </p>
        </div>
      </div>
    );
  }

  // If showing transaction details, render TransactioDetails
  if (showTransactionDetails) {
    const detailsToDisplay = apiType === "aeps2" ? transactionDetailsData : selectedTransactionData;

    if (!detailsToDisplay) return null;

    return (
      <TransactioDetails
        transactionData={detailsToDisplay}
        isAeps2={apiType === "aeps2"}
        onBack={() => {
          setShowTransactionDetails(false);
          setSelectedTransactionId(null);
          setSelectedTransactionData(null);
          setIsLoadingTransactionDetails(false);
        }}
      />
    );
  }

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
                {apiType === "aeps2" ? "AEPS 2" : "AEPS 1"} {transactionType === "CW" ? "CW" : transactionType === "MS" ? "MS" : "BE"} History
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-[#1B1717] font-['Gilroy-Regular']">
                Manage And Track All Your Transactions
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

                const query = {};
                if (apiType === "aeps1") {
                  // For AEPS 1, use transactionType
                  query.transactionType = transactionType;
                } else if (apiType === "aeps2") {
                  // For AEPS 2, use transactionType
                  query.transactionType = transactionType;
                }

                const customSearch = debouncedSearchQuery.trim()
                  ? getSearchField(debouncedSearchQuery)
                  : {};

                const payload = {
                  query,
                  customSearch,
                  options: {
                    page: currentPage,
                    paginate: itemsPerPageState,
                    sort: { createdAt: -1 },
                  },
                };

                // Dispatch the appropriate API call based on apiType
                if (apiType === "aeps2") {
                  dispatch(getAeps2CwHistoryUsers(payload));
                } else {
                  dispatch(getAepsCwHistoryUser(payload));
                }
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
              placeholder="Search By Reference,ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border-[0.5px] border-[#1B1717]/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] focus:border-[#039155] text-sm sm:text-base"
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
              className="w-full px-4 py-2.5 sm:py-3 border-[0.5px] border-[#1B1717]/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] focus:border-[#039155] text-sm sm:text-base"
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
                value={itemsPerPageState}
                onChange={(e) => {
                  setItemsPerPageState(Number(e.target.value));
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
            <thead className="bg-[#FFFFFF] border-b border-gray-200">
              <tr>
                <th className="px-4 sm:px-5 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                  SR No
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                  Name
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                  User Role
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                  Mobile
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                  Company Id
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                  Company Name
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                  Merchant Id
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                  Bank Name
                </th>
                {apiType === "aeps2" && (
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                    Service Type
                  </th>
                )}
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                  Tax ID
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                  Bank RRN
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                  Amount
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                  Comissions
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                  TDS
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                  Opening Bal
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                  Closing Bal
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                  VIA
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                  Status
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                  Created At
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                  Response Message
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                  Action
                </th>
              </tr>
            </thead>
            {!isLoading && (
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedTransactions.length > 0 ? (
                  paginatedTransactions.map((transaction, index) => {
                    // Show API 'id' if present; otherwise fall back to simple ascending SR no
                    const fallbackSrNo =
                      (apiCurrentPage - 1) * itemsPerPage + index + 1;
                    const srNo = transaction.id ?? fallbackSrNo;

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
                            {srNo}
                          </span>
                        </td>

                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#121216]">
                            {transaction.name}
                          </span>
                        </td>

                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#121216]">
                            {transaction.userRole}
                          </span>
                        </td>

                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#121216]">
                            {transaction.mobileNo}
                          </span>
                        </td>

                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#121216]">
                            {transaction.companyId}
                          </span>
                        </td>

                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#121216]">
                            {transaction.companyName}
                          </span>
                        </td>

                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#121216]">
                            {transaction.merchantLoginId}
                          </span>
                        </td>

                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#121216]">
                            {transaction.bankName}
                          </span>
                        </td>

                        {apiType === "aeps2" && (
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#121216]">
                              {transaction.serviceType}
                            </span>
                          </td>
                        )}

                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#121216]">
                            {transaction.taxId}
                          </span>
                        </td>

                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#121216]">
                            {transaction.bankRRN}
                          </span>
                        </td>

                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#121216] font-[Gilroy-Medium]">
                            {transaction.amount}
                          </span>
                        </td>

                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#121216] font-[Gilroy-Medium]">
                            {transaction.commission}
                          </span>
                        </td>

                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#121216] font-[Gilroy-Medium]">
                            {transaction.tds}
                          </span>
                        </td>

                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#121216]">
                            {transaction.openingBal}
                          </span>
                        </td>

                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#121216]">
                            {transaction.closingBal}
                          </span>
                        </td>

                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#121216]">
                            {transaction.via}
                          </span>
                        </td>

                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-[Gilroy-Medium] ${transaction.status === "Success"
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
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#121216]">
                            {transaction.responseMessage}
                          </span>
                        </td>

                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleViewClick(transaction)}
                            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[#039155] text-white text-xs sm:text-sm font-['Gilroy-Medium'] rounded-lg hover:bg-green-700 transition shadow-sm whitespace-nowrap"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={apiType === "aeps2" ? 21 : 20} className="px-4 sm:px-6 py-8 text-center">
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

      {/* Loading / Pagination (unchanged) */}
      {
        isLoading ? (
          <div className="flex items-center justify-center gap-3 mt-4 sm:mt-6 pb-2 flex-shrink-0">
            <ButtonLoader color="#039155" size={24} thickness={3} />
            <p className="text-sm sm:text-base font-['Gilroy-Medium'] text-[#1B1717]">
              Loading...
            </p>
          </div>
        ) : (
          totalPages > 0 && (
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-4 sm:mt-6 pb-1 flex-shrink-0">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-1.5 sm:p-2 rounded-lg border border-gray-300 bg-white text-[#1B1717] hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-[Gilroy-Medium] transition text-sm sm:text-base ${currentPage === page
                    ? "bg-[#039155] text-white"
                    : "bg-white border border-gray-300 text-[#1B1717] hover:bg-gray-50"
                    }`}
                >
                  {page}
                </button>
              ))}

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
        )
      }
    </div >
  );
};

AepsCWHistory.propTypes = {
  onBack: PropTypes.func,
  apiType: PropTypes.string,
  transactionType: PropTypes.string,
};

AepsCWHistory.defaultProps = {
  onBack: null,
  apiType: "aeps1",
  transactionType: "CW",
};

export default AepsCWHistory;
