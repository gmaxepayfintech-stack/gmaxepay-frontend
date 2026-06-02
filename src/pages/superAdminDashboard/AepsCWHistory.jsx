import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  Share,
  User,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { HiArrowLeft } from "react-icons/hi2";
import TransactioDetails from "./TransactioDetails";
import {
  getAepsCwHistory,
  getAepsTransactionDetails,
  hitAepsCwReconciliation,
} from "../../redux/action/aepsAction";
import { ButtonLoader } from "../../widgets/layout/loader";
import { getAeps2CwHistory } from "../../redux/action/aepsTwoAction";
import { getAeps2TransactionDetails } from "../../redux/action/aepsAction";
import * as XLSX from "xlsx";
import { useNotification } from "../../context/NotificationContext";

const AepsCWHistory = ({ onBack = null, type = "aeps1-cw-history" }) => {
  const dispatch = useDispatch();
  const { showNotification } = useNotification();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [selectedTransactionData, setSelectedTransactionData] = useState(null);
  const [isLoadingTransactionDetails, setIsLoadingTransactionDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isReloading, setIsReloading] = useState(false);
  const [reconcilingId, setReconcilingId] = useState(null);
  const [reconcileTracker, setReconcileTracker] = useState({});


  // Determine whether this is AEPS2 history based on type
  const isAeps2 =
    type === "aeps2-cw-history" ||
    type === "aeps2-ms-history" ||
    type === "aeps2-be-history";

  // Get data from Redux (AEPS1 or AEPS2 based on type)
  const aeps1HistoryResponse = useSelector(
    (state) => state?.aeps?.aepsCwHistory,
  );
  const aeps2HistoryResponse = useSelector(
    (state) => state?.aepsTwo?.aeps2CwHistory,
  );
  const aepsHistoryResponse = isAeps2
    ? aeps2HistoryResponse
    : aeps1HistoryResponse;
  const apiData = Array.isArray(aepsHistoryResponse?.data)
    ? aepsHistoryResponse.data
    : aepsHistoryResponse?.data?.docs || [];
  const paginator = aepsHistoryResponse?.paginator || aepsHistoryResponse?.data?.paginator || {};
  const totalCount = aepsHistoryResponse?.total ?? aepsHistoryResponse?.data?.total ?? paginator?.itemCount ?? 0;
  const isLoading = useSelector((state) => state?.loading?.isLoading || false);
  const transactionDetailsResponse = useSelector(
    (state) => state?.aeps?.transactionDetails,
  );
  const reconciliationResponse = useSelector(
    (state) => state?.aeps?.aepsCwReconciliation,
  );

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
          .replace(/\//g, "-");
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
      const aadhaar = item.consumerAadhaarNumber || item.adhaarNumber || item.aadhaarLastFour || item.aadharNumber || item.aadhaarNumber || item.customerNumber || item.consumerNumber || "N/A";

      // --- Commissions (Super Admin shows all) ---
      const saComm = item.superadminComm || 0;
      const saCommTDS = item.superadminCommTDS || 0;
      const wlComm = item.whitelabelComm || 0;
      const mdComm = item.masterDistributorCom || 0;
      const distComm = item.distributorCom || 0;
      const retComm = item.retailerCom || 0;

      // --- Wallet Balances ---
      const rawOpening = isAeps2 ? item.openingAeps2Wallet : item.openingWallet;
      const formattedOpening = rawOpening !== undefined && rawOpening !== null ? `₹${Number(rawOpening).toFixed(2)}` : "₹0.00";

      const rawClosing = isAeps2 ? item.closingAeps2Wallet : item.closingWallet;
      const formattedClosing = rawClosing !== undefined && rawClosing !== null ? `₹${Number(rawClosing).toFixed(2)}` : "₹0.00";

      const formattedComm = `₹${Number(saComm).toFixed(2)}`;
      const formattedTDS = `₹${Number(saCommTDS).toFixed(2)}`;

      return {
        id: item.id,
        refId: item.refId || item.addedBy || "N/A",
        name: userName,
        userRole: (() => {
          const role = item.userRole ?? userDetails.userRole;
          const r = role?.toString();
          if (r === "5") return "Retailer";
          if (r === "4") return "Distributor";
          if (r === "3") return "Master Distributor";
          if (r === "2") return "White Label";
          if (r === "1") return "Super Admin";
          return role ? `Role ${role}` : "N/A";
        })(),
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
        commDisplay: `SA: ₹${saComm} | WL: ₹${wlComm} | MD: ₹${mdComm} | DT: ₹${distComm} | RT: ₹${retComm}`,
        profileImage: userDetails.profileImage || null,
        companyLogo: item.companyLogo || null,
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

  // Determine AEPS transaction type (CW, MS, BE) based on view type
  const transactionType = (() => {
    if (type === "aeps1-ms-history" || type === "aeps2-ms-history") return "MS";
    if (type === "aeps1-be-history" || type === "aeps2-be-history") return "BE";
    return "CW"; // default
  })();

  // Fetch data from API
  useEffect(() => {
    // Only make API call if both dates are selected OR both are null
    // Don't call if only one date is selected
    const bothDatesSelected = fromDate && toDate;
    const bothDatesNull = !fromDate && !toDate;

    if (!bothDatesSelected && !bothDatesNull) {
      return;
    }

    const query = isAeps2 ? { transactionType: transactionType } : { transactionType };

    // Add date filters only if both dates are selected
    if (fromDate && toDate) {
      // Format date as YYYY/MM/DD (input is YYYY-MM-DD, convert to YYYY/MM/DD)
      query.startDate = fromDate.replace(/-/g, "/");
      query.endDate = toDate.replace(/-/g, "/");
    }

    const payload = {
      query,
      customSearch: {},
      options: {
        page: currentPage,
        paginate: itemsPerPage,
        sort: { createdAt: -1 },
      },
    };

    if (isAeps2) {
      dispatch(getAeps2CwHistory(payload));
    } else {
      dispatch(getAepsCwHistory(payload));
    }
  }, [
    dispatch,
    fromDate,
    toDate,
    transactionType,
    isAeps2,
    currentPage,
    itemsPerPage,
  ]);

  // Reset isReloading when loading completes
  useEffect(() => {
    if (!isLoading && isReloading) {
      setIsReloading(false);
    }
  }, [isLoading, isReloading]);



  // Reconcile a transaction (only for aeps1-cw-history)
  const handleReconcile = async (transaction) => {
    const merchantRefId = transaction?.originalItem?.merchantReferenceId || transaction?.refID;
    if (!merchantRefId || merchantRefId === "N/A" || reconcilingId) return;

    const transactionId = transaction.id;
    const now = Date.now();
    const lastClickTime = reconcileTracker[transactionId]?.clickTime || 0;
    const fiveMinutes = 5 * 60 * 1000;

    // Don't allow click if still in cooldown
    if (now - lastClickTime < fiveMinutes) return;

    setReconcilingId(transactionId);

    // Update click time
    setReconcileTracker(prev => ({
      ...prev,
      [transactionId]: { ...prev[transactionId], clickTime: now }
    }));

    try {
      const result = await dispatch(hitAepsCwReconciliation({ merchant_reference_id: merchantRefId }));
      if (result?.status === "SUCCESS") {
        showNotification({
          type: "success",
          message: result?.message || "Reconciliation successful!",
          isCritical: true,
        });

        // Mark as success
        setReconcileTracker(prev => ({
          ...prev,
          [transactionId]: { ...prev[transactionId], isSuccess: true }
        }));
      } else {
        showNotification({
          type: "error",
          message: result?.message || "Reconciliation failed.",
          isCritical: true,
        });
      }
    } catch (error) {
      showNotification({
        type: "error",
        message: "An error occurred during reconciliation.",
        isCritical: true,
      });
    } finally {
      setReconcilingId(null);
    }
  };

  // Transform API data
  const transactions = apiData.length > 0 ? transformApiData(apiData) : [];

  const statusFilters = ["All", "Success", "Pending", "Failed"];

  // Filter transactions based on status and search query (CLIENT-SIDE)
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesStatus =
      statusFilter === "All" ||
      transaction.status.toLowerCase() === statusFilter.toLowerCase();

    const searchLower = debouncedSearchQuery.trim().toLowerCase();
    const matchesSearch =
      !searchLower ||
      String(transaction.name).toLowerCase().includes(searchLower) ||
      String(transaction.mobileNo).toLowerCase().includes(searchLower) ||
      String(transaction.taxId).toLowerCase().includes(searchLower) ||
      String(transaction.refID).toLowerCase().includes(searchLower);

    return matchesStatus && matchesSearch;
  });

  // SERVER-SIDE Pagination
  const totalPages = paginator.pageCount || Math.ceil(totalCount / itemsPerPage) || 1;
  const paginatedTransactions = filteredTransactions;
  const apiCurrentPage = paginator.currentPage || currentPage;
  const filteredCount = totalCount;

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, debouncedSearchQuery, itemsPerPage]);

  // Export to Excel function
  const handleExportToExcel = async () => {
    if (totalCount === 0) {
      showNotification("No data available to export", "error");
      return;
    }

    const query = isAeps2 ? { transactionType: transactionType } : { transactionType };

    if (fromDate && toDate) {
      query.startDate = fromDate.replace(/-/g, "/");
      query.endDate = toDate.replace(/-/g, "/");
    }

    const customSearch = debouncedSearchQuery.trim()
      ? getSearchField(debouncedSearchQuery)
      : {};

    const payload = {
      query,
      customSearch,
      options: {
        page: 1,
        paginate: Math.max(totalCount, 100000), // No limit (fetch all records)
        sort: { createdAt: -1 },
      },
    };

    let exportData = [];
    try {
      let result;
      const customDispatch = (action) => {
        if (action?.type === "LOADING_START" || action?.type === "LOADING_END") {
          dispatch(action);
        }
      };

      if (isAeps2) {
        result = await getAeps2CwHistory(payload)(customDispatch);
      } else {
        result = await getAepsCwHistory(payload)(customDispatch);
      }

      const rawDocs = result?.data || [];
      const docs = Array.isArray(rawDocs) ? rawDocs : rawDocs.docs || [];
      exportData = transformApiData(docs);
    } catch (error) {
      console.error("Error fetching export data:", error);
      exportData = filteredTransactions;
    }

    if (exportData.length === 0) {
      showNotification("No data available to export", "error");
      return;
    }

    const excelData = exportData.map((row, index) => {
      const baseData = {
        "SR No": index + 1,
        "Name": row.name,
        "User Role": row.userRole,
        "Mobile": row.mobileNo,
        "Consumer Number": row.consumerNumber,
        "Company Name": row.companyName,
        "Bank Name": row.bankName,
        ...(isAeps2 ? { "Service Type": row.serviceType } : {}),
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
    XLSX.utils.book_append_sheet(workbook, worksheet, "AEPS_History");

    const fileName = `${type.toUpperCase()}_Export_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // Watch for transaction details to be loaded
  useEffect(() => {
    if (selectedTransactionId && isLoadingTransactionDetails) {
      // Check if loading has completed (isLoading becomes false)
      if (!isLoading) {
        // Wait a small delay to ensure state is updated
        const timer = setTimeout(() => {
          setIsLoadingTransactionDetails(false);
          setShowTransactionDetails(true);
        }, 100);

        return () => clearTimeout(timer);
      }
    }
  }, [selectedTransactionId, isLoading, isLoadingTransactionDetails]);

  // Handle profile click - hit API for both AEPS1 and AEPS2
  const handleProfileClick = (transaction) => {
    if (!transaction) return;

    const transactionId = transaction.id;
    if (!transactionId || isLoadingTransactionDetails) return;

    setIsLoadingTransactionDetails(true);
    setSelectedTransactionId(transactionId);

    if (isAeps2) {
      dispatch(getAeps2TransactionDetails(transactionId));
    } else {
      dispatch(getAepsTransactionDetails(transactionId));
    }
  };

  // Watch for transaction details to be loaded (both AEPS1 & AEPS2 now via API)
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

  // If TransactionDetails should be shown, render it
  if (showTransactionDetails) {
    if (!transactionDetailsResponse) return null;

    return (
      <TransactioDetails
        transactionId={selectedTransactionId}
        transactionData={transactionDetailsResponse}
        isAeps2={isAeps2}
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
                {type.toUpperCase()}
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

                const query = isAeps2
                  ? { transactionType: transactionType }
                  : { transactionType };

                const payload = {
                  query,
                  customSearch: {},
                  options: {
                    page: 1,
                    paginate: itemsPerPage,
                    sort: { createdAt: -1 },
                  },
                };

                if (isAeps2) {
                  dispatch(getAeps2CwHistory(payload));
                } else {
                  dispatch(getAepsCwHistory(payload));
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
              placeholder="Search By Name, Mobile, Transaction ID, Reference ID"
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
            <thead className="bg-[#FFFFFF] border-b border-gray-200">
              <tr>
                <th className="px-4 sm:px-5 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                  SR No
                </th>
                {type === "aeps1-cw-history" && (
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                    Action
                  </th>
                )}
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                  Profile
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
                  Aadhaar Number
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                  Company Name
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                  Company Logo
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                  Bank Name
                </th>
                {isAeps2 && (
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
              </tr>
            </thead>
            {!isLoading && (
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedTransactions.length > 0 ? (
                  paginatedTransactions.map((transaction, index) => {
                    const currentPosition =
                      (apiCurrentPage - 1) * itemsPerPage + index + 1;
                    const reverseSrNo = filteredCount - currentPosition + 1;
                    const srNo = String(reverseSrNo).padStart(2, "0");

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

                        {type === "aeps1-cw-history" && (
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            {(() => {
                              const transTracker = reconcileTracker[transaction.id] || {};
                              const isCooldownActive = transTracker.clickTime && (Date.now() - transTracker.clickTime < 5 * 60 * 1000);
                              const isSuccess = transTracker.isSuccess;

                              return (
                                <button
                                  onClick={() => handleReconcile(transaction)}
                                  disabled={!!reconcilingId || isCooldownActive}
                                  title={`Check Status: ${transaction?.originalItem?.merchantReferenceId || transaction?.refID || "N/A"}`}
                                  className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-['Gilroy-Medium'] rounded-lg transition shadow-sm whitespace-nowrap ${(reconcilingId === transaction.id || isCooldownActive)
                                    ? "bg-gray-400 text-white cursor-not-allowed"
                                    : "bg-[#039155] text-white hover:bg-green-700"
                                    }`}
                                >
                                  {reconcilingId === transaction.id ? "..." : "CheckStatus"}
                                </button>
                              );
                            })()}
                          </td>
                        )}

                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleProfileClick(transaction)}
                            className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
                          >
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                              {transaction.profileImage ? (
                                <>
                                  <img
                                    src={transaction.profileImage}
                                    alt={transaction.name || "Profile"}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                      if (e.target.nextElementSibling) {
                                        e.target.nextElementSibling.style.display =
                                          "flex";
                                      }
                                    }}
                                  />
                                  <div className="w-full h-full hidden items-center justify-center">
                                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                                  </div>
                                </>
                              ) : (
                                <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                              )}
                            </div>
                          </button>
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
                            {transaction.consumerNumber}
                          </span>
                        </td>

                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#121216]">
                            {transaction.companyName}
                          </span>
                        </td>

                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
                            {transaction.companyLogo ? (
                              <img
                                src={transaction.companyLogo}
                                alt={transaction.companyName}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            ) : (
                              <User className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                            )}
                          </div>
                        </td>

                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#121216]">
                            {transaction.bankName}
                          </span>
                        </td>

                        {isAeps2 && (
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
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={isAeps2 ? 22 : type === "aeps1-cw-history" ? 22 : 21} className="px-4 sm:px-6 py-8 text-center">
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
            disabled={currentPage === totalPages}
            className="p-1.5 sm:p-2 rounded-lg border border-gray-300 bg-white text-[#1B1717] hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

AepsCWHistory.propTypes = {
  onBack: PropTypes.func,
  type: PropTypes.string,
};

export default AepsCWHistory;
