import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  Download,
  Share,
  User,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { HiArrowLeft } from "react-icons/hi2";
import { ButtonLoader } from "../../widgets/layout/loader";
import TransactioDetails from "./TransactioDetails";
import { getAepsCwHistory } from "../../redux/action/aepsAction";
import { getAeps2CwHistory } from "../../redux/action/aepsTwoAction";

const AepsCWHistory = ({ onBack, apiType = "aeps1", transactionType = "CW" }) => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isReloading, setIsReloading] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);

  // Determine whether this is AEPS2 history based on apiType
  const isAeps2 = apiType === "aeps2";

  // Get data from Redux (AEPS1 or AEPS2 based on apiType)
  const aeps1HistoryResponse = useSelector(
    (state) => state?.aeps?.aepsCwHistory,
  );
  const aeps2HistoryResponse = useSelector(
    (state) => state?.aepsTwo?.aeps2CwHistory,
  );
  const aepsHistoryResponse = isAeps2
    ? aeps2HistoryResponse
    : aeps1HistoryResponse;
  const apiData = aepsHistoryResponse?.data || [];
  const paginator = aepsHistoryResponse?.paginator || {};
  const totalCount = aepsHistoryResponse?.total || 0;
  const isLoading = useSelector((state) => state?.loading?.isLoading || false);

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
        formattedDate = date
          .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
          })
          .replaceAll("/", "-");
      }

      // Determine if this is AEPS 2 response structure
      const isAeps2 = apiType === "aeps2";

      // Format amount with currency symbol - handle both AEPS 1 and AEPS 2
      const amountValue = isAeps2 
        ? (item.transactionAmount || 0)
        : (item.amount || 0);
      const formattedAmount = `₹${amountValue}`;

      // Map status from API to display format - handle both structures
      const getStatusDisplay = (status, transactionStatus) => {
        // For AEPS 2, prefer transactionStatus field
        if (isAeps2 && transactionStatus) {
          const statusStr = String(transactionStatus).toLowerCase();
          if (statusStr === "successful" || statusStr === "success") return "Success";
          if (statusStr === "failed" || statusStr === "failure") return "Failed";
          return "Pending";
        }
        
        // For AEPS 1 or fallback, use status field
        if (status !== undefined && status !== null) {
          if (typeof status === "boolean") {
            return status ? "Success" : "Failed";
          }
          const statusStr = String(status);
          const statusUpper = statusStr.toUpperCase();
          if (statusUpper === "SUCCESS" || statusUpper === "TRUE") return "Success";
          if (statusUpper === "FAILED" || statusUpper === "FAILURE" || statusUpper === "FALSE") return "Failed";
        }
        return "Pending";
      };

      // Map capture type to display format
      const getViaDisplay = (captureType, device) => {
        // For AEPS 2, device might indicate capture type
        if (isAeps2 && device) {
          const deviceStr = String(device).toUpperCase();
          if (deviceStr.includes("FINGER") || deviceStr.includes("MANTRA") || deviceStr.includes("STARTEK")) {
            return "FINGER";
          }
          if (deviceStr.includes("IRIS")) return "IRIS";
        }
        
        if (!captureType) return "APP";
        const typeStr = String(captureType);
        const typeUpper = typeStr.toUpperCase();
        if (typeUpper === "FINGER") return "FINGER";
        if (typeUpper === "IRIS") return "IRIS";
        return typeStr;
      };

      // Map user role number to text
      const getUserRoleDisplay = (userRole) => {
        if (typeof userRole === "number") {
          if (userRole === 5) return "Retailer";
          if (userRole === 4) return "Distributor";
          return `Role ${userRole}`;
        }
        // If it's already a string, return as is
        return userRole || "N/A";
      };

      // Extract user details from item
      const userDetails = item.userDetails || {};

      // Extract bank name - handle both AEPS 1 and AEPS 2 structures
      const bankName = isAeps2
        ? (item.responsePayload?.result?.bankName ||
           item.responsePayload?.data?.bankName ||
           item.bankName ||
           item.bankIin ||
           "N/A")
        : (item.responsePayload?.data?.bankName ||
           item.bankName ||
           item.bankiin ||
           "N/A");

      // Prefer consumerNumber as a readable identifier, then fall back
      const userName = isAeps2
        ? (item.mobileNumber ||
           userDetails.name ||
           item.name ||
           item.userName ||
           `User ${item.refId || item.addedBy || index + 1}`)
        : (item.consumerNumber ||
           item.requestPayload?.consumerNumber ||
           userDetails.name ||
           item.name ||
           item.userName ||
           `User ${item.refId || item.addedBy || index + 1}`);

      const userRoleValue =
        userDetails.userRole !== undefined
          ? userDetails.userRole
          : item.userRole !== undefined
            ? item.userRole
            : null;

      const profileImage = userDetails.profileImage || null;

      // Mobile number - handle both structures
      const mobileNo = isAeps2
        ? (item.mobileNumber ||
           item.requestPayload?.mobileNumber ||
           userDetails.mobileNo ||
           item.mobileNo ||
           item.mobile ||
           "N/A")
        : (item.consumerNumber ||
           item.requestPayload?.mobile ||
           item.requestPayload?.consumerNumber ||
           userDetails.mobileNo ||
           item.mobileNo ||
           item.mobile ||
           "N/A");

      // Consumer/Aadhaar number - handle both structures
      const consumerNumber = isAeps2
        ? (item.consumerAadhaarNumber ||
           item.requestPayload?.adhaarNumber ||
           item.requestPayload?.consumerAadhaarNumber ||
           "N/A")
        : (item.consumerNumber ||
           item.requestPayload?.consumerNumber ||
           item.consumerAadhaarNumber ||
           item.requestPayload?.consumerAadhaarNumber ||
           item.requestPayload?.aadhaarNo ||
           "N/A");

      // Extract merchant login ID - handle both structures
      const merchantLoginId = isAeps2
        ? (item.merchantLoginId ||
           item.requestPayload?.merchantLoginId ||
           item.merchantTransactionId ||
           "N/A")
        : (item.requestPayload?.merchantLoginId ||
           item.merchantTransactionId ||
           "N/A");

      // Extract bank RRN - handle both structures
      const bankRRN = isAeps2
        ? (item.bankRRN ||
           item.responsePayload?.result?.bankRRN ||
           item.responsePayload?.data?.bankRRN ||
           "N/A")
        : (item.bankRRN ||
           item.responsePayload?.data?.bankRRN ||
           "N/A");

      return {
        id: item.id,
        refId: item.refId || item.addedBy || "N/A",
        name: userName,
        userRole: getUserRoleDisplay(userRoleValue),
        profileImage: profileImage,
        mobileNo: mobileNo,
        consumerNumber: consumerNumber,
        companyName: item.companyName || "N/A",
        companyLogo: item.companyLogo || null,
        bankName: bankName,
        taxId: item.transactionId || item.partnerTxnid || "N/A",
        refID: item.refId || item.addedBy || "N/A",
        bankRRN: bankRRN,
        amount: formattedAmount,
        via: getViaDisplay(item.captureType, item.device),
        status: getStatusDisplay(item.status, item.transactionStatus),
        createdAt: formattedDate,
        originalItem: item, // Store full item for details
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
    // Use transactionType for both AEPS 1 and AEPS 2
    query.transactionType = transactionType;

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
      query,
      customSearch,
      options: {
        page: currentPage,
        paginate: 10,
        sort: { createdAt: -1 },
      },
    };

    if (isAeps2) {
      dispatch(getAeps2CwHistory(payload));
    } else {
      dispatch(getAepsCwHistory(payload));
    }
  }, [dispatch, currentPage, debouncedSearchQuery, fromDate, toDate, apiType, transactionType]);

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
  const itemsPerPage = paginator.perPage || 10;
  // Since API handles pagination, we use the filtered transactions directly
  const paginatedTransactions = filteredTransactions;
  // Use pagination info from API response
  const totalPages = paginator.pageCount || 1;
  const apiCurrentPage = paginator.currentPage || currentPage;

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  // Transform API response to match TransactioDetails expected format
  const transformTransactionData = (apiItem) => {
    if (!apiItem) return null;

    // Handle both AEPS 1 and AEPS 2 response structures
    const isAeps2 = apiType === "aeps2";

    // Extract bank name - handle both structures
    const bankName = isAeps2
      ? apiItem.responsePayload?.result?.bankName ||
        apiItem.responsePayload?.data?.bankName ||
        apiItem.bankName ||
        apiItem.bankIin ||
        "N/A"
      : apiItem.responsePayload?.data?.bankName ||
        apiItem.bankName ||
        apiItem.bankiin ||
        "N/A";

    // Extract aadhar number - handle both structures
    const aadharNumber = isAeps2
      ? apiItem.consumerAadhaarNumber ||
        apiItem.requestPayload?.adhaarNumber ||
        null
      : apiItem.consumerAadhaarNumber ||
        apiItem.requestPayload?.consumerAadhaarNumber ||
        apiItem.requestPayload?.aadhaarNo ||
        null;

    // Calculate commission (credit field) - AEPS 2 might not have commission fields
    const commission = apiItem.credit || 0;

    // Extract user details from API response
    const userDetails = apiItem.userDetails || {};

    // Extract amount - handle both structures
    const amount = isAeps2
      ? apiItem.transactionAmount || 0
      : apiItem.amount || 0;

    // Extract mobile number - handle both structures
    const mobileNo = isAeps2
      ? apiItem.mobileNumber ||
        apiItem.requestPayload?.mobileNumber ||
        userDetails.mobileNo ||
        "N/A"
      : apiItem.consumerNumber ||
        apiItem.requestPayload?.mobile ||
        apiItem.requestPayload?.consumerNumber ||
        userDetails.mobileNo ||
        "N/A";

    // Extract user name/identifier
    const userName = isAeps2
      ? apiItem.mobileNumber ||
        userDetails.name ||
        apiItem.name ||
        `User ${apiItem.refId || apiItem.addedBy || "N/A"}`
      : apiItem.consumerNumber ||
        userDetails.name ||
        apiItem.name ||
        `User ${apiItem.refId || apiItem.addedBy || "N/A"}`;

    return {
      transaction: {
        superadminComm: apiItem.superadminComm,
        superadminCommTDS: apiItem.superadminCommTDS,
        whitelabelComm: apiItem.whitelabelComm,
        whitelabelCommTDS: apiItem.whitelabelCommTDS,
        masterDistributorCom: apiItem.masterDistributorCom,
        masterDistributorComTDS: apiItem.masterDistributorComTDS,
        distributorCom: apiItem.distributorCom,
        distributorComTDS: apiItem.distributorComTDS,
        retailerCom: apiItem.retailerCom,
        retailerComTDS: apiItem.retailerComTDS,
      },
      userDetails: {
        name: userName,
        userRole: userDetails.userRole || apiItem.userRole || null,
        userId: apiItem.refId?.toString() || apiItem.addedBy?.toString() || "N/A",
        mobileNo: mobileNo,
      },
      reportingUserDetails: {
        companyName: apiItem.companyName || apiItem.merchantLoginId || apiItem.operator || "N/A",
        parentName: "N/A",
        parentRole: null,
        parentUserId: apiItem.companyId?.toString() || "N/A",
      },
      transactionDetails: {
        bankName: bankName,
        aadharNumber: aadharNumber,
        amount: amount,
        commission: commission,
      },
    };
  };

  // Handle view button click
  const handleViewClick = (transaction) => {
    const originalItem = transaction.originalItem;
    if (originalItem) {
      const transformedData = transformTransactionData(originalItem);
      setSelectedTransaction(transformedData);
      setShowTransactionDetails(true);
    }
  };

  // If showing transaction details, render TransactioDetails
  if (showTransactionDetails && selectedTransaction) {
    return (
      <TransactioDetails
        transactionData={selectedTransaction}
        onBack={() => {
          setShowTransactionDetails(false);
          setSelectedTransaction(null);
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

                // Build query - use transactionType for both AEPS 1 and AEPS 2
                const query = {};
                query.transactionType = transactionType;

                const customSearch = debouncedSearchQuery.trim()
                  ? getSearchField(debouncedSearchQuery)
                  : {};

                const payload = {
                  query,
                  customSearch,
                  options: {
                    page: currentPage,
                    paginate: 10,
                    sort: { createdAt: -1 },
                  },
                };

                // Dispatch the appropriate API call based on apiType
                if (apiType === "aeps2") {
                  dispatch(getAeps2CwHistory(payload));
                } else {
                  dispatch(getAepsCwHistory(payload));
                }
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
              placeholder="Search By Reference,ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border-[0.5px] border-[#1B1717]/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] focus:border-[#039155] text-sm sm:text-base"
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
            <thead className="bg-[#FFFFFF] border-b border-gray-200">
              <tr>
                <th className="px-4 sm:px-5 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                  SR No
                </th>
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
                  Consumer Number
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
                  VIA
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                  Status
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                  Created At
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                  TDS & Comm
                </th>
              </tr>
            </thead>
            {!isLoading && (
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedTransactions.length > 0 ? (
                  paginatedTransactions.map((transaction, index) => {
                    const currentPosition =
                      (apiCurrentPage - 1) * itemsPerPage + index + 1;
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
                            {srNo}
                          </span>
                        </td>

                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
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
                          <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#121216] font-medium">
                            {transaction.amount}
                          </span>
                        </td>

                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#121216]">
                            {transaction.via}
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
                    <td colSpan={16} className="px-4 sm:px-6 py-8 text-center">
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
      {isLoading ? (
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
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-medium transition text-sm sm:text-base ${
                  currentPage === page
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
      )}
    </div>
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
