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
import {
  getAepsCwHistoryCompany,
} from "../../../redux/action/aepsAction";
import { ButtonLoader } from "../../../widgets/layout/loader";
import TransactioDetails from "./TransactioDetails";
import { getAeps2CwHistoryCompany } from "../../../redux/action/aepsTwoAction";
import {
  getAepsTransactionDetailsCompany,
  getAeps2TransactionDetailsCompany
} from "../../../redux/action/aepsAction";
import * as XLSX from "xlsx";
import { useNotification } from "../../../context/NotificationContext";

const AepsCWHistory = ({ onBack = null, apiType = "aeps1", transactionType = "CW" }) => {
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
  const { showNotification } = useNotification();

  const aepsCwHistoryResponse = useSelector((state) => {
    if (apiType === "aeps2") {
      return state?.aepsTwo?.aeps2CwHistoryCompany;
    }
    return state?.aeps?.aepsCwHistoryCompany;
  });
  const apiData = aepsCwHistoryResponse?.data || [];
  const paginator = aepsCwHistoryResponse?.paginator || {};
  const isLoading = useSelector((state) => state?.loading?.isLoading || false);

  const transactionDetailsData = useSelector((state) => state?.aeps?.transactionDetailsCompany);

  const isAeps2Item = (item) =>
    apiType === "aeps2" ||
    item.transactionStatus !== undefined ||
    item.mobileNumber !== undefined;

  const transformApiData = (dataArray) => {
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      return [];
    }

    return dataArray.map((item, index) => {
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

      const isAeps1New = !!item.transactionStatus;

      const amountValue = isAeps1New ? (item.transactionAmount || 0) : (item.amount || 0);
      let formattedAmount = `₹${amountValue}`;

      const txnType = item.transactionType || transactionType;
      if (txnType === "BE" || txnType === "MS") {
        formattedAmount = "₹0";
      }

      const getStatusDisplay = (statusVal) => {
        if (!statusVal) return "Pending";
        const s = String(statusVal).toUpperCase();
        if (s === "SUCCESS" || s === "SUCCESSFUL" || s === "TRUE") return "Success";
        if (s === "FAILED" || s === "FAILURE" || s === "FALSE") return "Failed";
        return "Pending";
      };

      const statusValue = isAeps1New ? item.transactionStatus : item.status;

      const getViaDisplay = (peripheral, device, captureType) => {
        const val = peripheral || device || captureType || "APP";
        const valUpper = String(val).toUpperCase();
        if (valUpper.includes("FINGER")) return "FINGER";
        if (valUpper.includes("IRIS")) return "IRIS";
        return valUpper;
      };

      const userDetails = item.userDetails || {};
      const userName = item.name || userDetails.name || "N/A";
      const mobileNo = item.mobileNumber || item.mobileNo || userDetails.mobileNo || "N/A";
      const aadhaar = item.aadhaarLastFour || item.consumerNumber || "N/A";

      const roleVal = userDetails.userRole ?? item.userRole;

      const wlComm = item.whitelabelComm || 0;
      const wlTDS = item.whitelabelCommTDS || 0;

      return {
        id: item.id,
        refId: String(item.refId || item.addedBy || "N/A"),
        name: String(userName),
        userRole:
          roleVal === 5 ? "Retailer" :
            roleVal === 4 ? "Distributor" :
              roleVal === 3 ? "Master Distributor" :
                roleVal === 2 ? "White Label" :
                  roleVal === 1 ? "Super Admin" : `Role ${roleVal ?? "N/A"}`,
        mobileNo: String(mobileNo),
        consumerNumber: String(aadhaar),
        companyId: String(item.companyId ?? "N/A"),
        companyName: String(item.companyName || item.operator || "N/A"),
        merchantLoginId: String(item.merchantLoginId || item.subMerchantCode || "N/A"),
        bankName: String(item.bankName || "N/A"),
        taxId: String(item.transactionId || "N/A"),
        refID: String(item.merchantReferenceId || item.refId || "N/A"),
        bankRRN: String(item.bankRRN || "N/A"),
        amount: formattedAmount,
        via: getViaDisplay(item.peripheral, item.device, item.captureType),
        status: getStatusDisplay(statusValue),
        createdAt: formattedDate,
        tdsAndComm: `Comm: ₹${wlComm} | TDS: ₹${wlTDS}`,
        responseMessage: String(item.message || item.responseMessage || "N/A"),
        originalItem: item,
      };
    });
  };

  const getSearchField = (searchValue) => {
    const trimmedValue = searchValue.trim();
    if (!trimmedValue) return null;

    // 1. Check if it looks like a Company ID (alphanumeric containing both letters and numbers, length < 15)
    if (/^[A-Za-z0-9\-_]+$/i.test(trimmedValue) && /[A-Za-z]/i.test(trimmedValue) && /\d/.test(trimmedValue) && trimmedValue.length < 15) {
      return { companyId: trimmedValue };
    }

    // 2. Check if it's a short number (representing Serial Number / short ID / database ID)
    if (/^\d+$/.test(trimmedValue) && trimmedValue.length < 8) {
      return { id: trimmedValue };
    }

    if (/^CW/i.test(trimmedValue)) {
      return { fpTransactionId: trimmedValue };
    }

    if (/^\d{10}$/.test(trimmedValue)) {
      return { mobileNo: trimmedValue };
    }

    if (/^\d{11,20}$/.test(trimmedValue)) {
      return { bankRRN: trimmedValue };
    }

    if (/^[A-Za-z\s]+$/.test(trimmedValue)) {
      return { name: trimmedValue };
    }

    if (/^[A-Z]{3,4}[A-Za-z0-9]*\d+[A-Za-z0-9]*$/.test(trimmedValue)) {
      return { transactionId: trimmedValue };
    }

    return { transactionId: trimmedValue };
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const bothDatesSelected = fromDate && toDate;
    const bothDatesNull = !fromDate && !toDate;

    if (!bothDatesSelected && !bothDatesNull) {
      return;
    }

    const query = {};
    if (apiType === "aeps1") {
      query.transactionType = transactionType;
    } else if (apiType === "aeps2") {
      query.transactionType = transactionType;
    }

    if (fromDate && toDate) {
      query.startDate = fromDate.replaceAll("-", "/");
      query.endDate = toDate.replaceAll("-", "/");
    }

    const payload = {
      query: query,
      customSearch: {},
      options: {
        page: 1,
        paginate: 1000,
        sort: { createdAt: -1 },
      },
    };

    if (apiType === "aeps2") {
      dispatch(getAeps2CwHistoryCompany(payload));
    } else {
      dispatch(getAepsCwHistoryCompany(payload));
    }
  }, [dispatch, fromDate, toDate, apiType, transactionType]);

  useEffect(() => {
    if (!isLoading && isReloading) {
      setIsReloading(false);
    }
  }, [isLoading, isReloading]);

  const transactions = apiData.length > 0 ? transformApiData(apiData) : [];

  const statusFilters = ["All", "Success", "Pending", "Failed"];

  // Filter transactions based on status and search query (CLIENT-SIDE)
  const filteredTransactions = transactions.filter((transaction, index) => {
    const matchesStatus =
      statusFilter === "All" ||
      transaction.status.toLowerCase() === statusFilter.toLowerCase();

    const searchLower = debouncedSearchQuery.trim().toLowerCase();

    // Calculate the serial number/id for this transaction to search by it
    const fallbackSrNo = index + 1;
    const srNo = transaction.id ? String(transaction.id) : String(fallbackSrNo);

    const matchesSearch =
      !searchLower ||
      String(srNo).toLowerCase().includes(searchLower) ||
      String(transaction.name).toLowerCase().includes(searchLower) ||
      String(transaction.mobileNo).toLowerCase().includes(searchLower) ||
      String(transaction.companyId).toLowerCase().includes(searchLower) ||
      String(transaction.companyName).toLowerCase().includes(searchLower) ||
      String(transaction.taxId).toLowerCase().includes(searchLower) ||
      (transaction.refID && String(transaction.refID).toLowerCase().includes(searchLower)) ||
      (transaction.bankRRN && String(transaction.bankRRN).toLowerCase().includes(searchLower)) ||
      String(transaction.merchantLoginId).toLowerCase().includes(searchLower);

    return matchesStatus && matchesSearch;
  });

  // CLIENT-SIDE Pagination like walletHistory and payoutHistory
  const itemsPerPage = itemsPerPageState;
  const totalCount = filteredTransactions.length;
  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;
  const apiCurrentPage = currentPage;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    endIndex,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, debouncedSearchQuery, itemsPerPageState]);

  const handleExportToExcel = () => {
    if (!filteredTransactions || filteredTransactions.length === 0) {
      if (showNotification) showNotification("No data available to export", "error");
      else alert("No data available to export");
      return;
    }

    const excelData = filteredTransactions.map((row, index) => {
      const fallbackSrNo = (apiCurrentPage - 1) * itemsPerPage + index + 1;
      const srNo = row.id ?? fallbackSrNo;

      return {
        "SR No": srNo,
        "Name": row.name,
        "User Role": row.userRole,
        "Mobile": row.mobileNo,
        "Consumer Number (Aadhaar)": row.consumerNumber,
        "Company Id": row.companyId,
        "Company Name": row.companyName,
        "Merchant Id": row.merchantLoginId,
        "Bank Name": row.bankName,
        "Tax ID": row.taxId,
        "Bank RRN": row.bankRRN,
        "Amount": row.amount,
        "VIA": row.via,
        "Status": row.status,
        "Created At": row.createdAt,
        "Response Message": row.responseMessage,
        "TDS & Comm": row.tdsAndComm,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "AEPS_History");

    const fileName = `AEPS_${transactionType}_History_Export_${new Date().toISOString().split("T")[0]}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  };

  const handleViewClick = (transaction) => {
    const databaseId = transaction.id;
    console.log("handleViewClick triggered for:", {
      transactionId: databaseId,
      apiType,
      transaction
    });

    if (!databaseId || isLoadingTransactionDetails) {
      console.warn("View click ignored: ID missing or already loading", { databaseId, isLoadingTransactionDetails });
      return;
    }

    setIsLoadingTransactionDetails(true);
    setSelectedTransactionId(databaseId);

    if (apiType === "aeps2") {
      console.log("Dispatching getAeps2TransactionDetailsCompany for ID:", databaseId);
      dispatch(getAeps2TransactionDetailsCompany(databaseId));
    } else {
      console.log("Dispatching getAepsTransactionDetailsCompany for ID:", databaseId);
      dispatch(getAepsTransactionDetailsCompany(databaseId));
    }
  };

  useEffect(() => {
    if (selectedTransactionId && isLoadingTransactionDetails) {
      if (!isLoading) {
        console.log("Transaction details loading complete for ID:", selectedTransactionId);
        const timer = setTimeout(() => {
          setIsLoadingTransactionDetails(false);
          setShowTransactionDetails(true);
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [selectedTransactionId, isLoading, isLoadingTransactionDetails]);

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

  if (showTransactionDetails) {
    if (!transactionDetailsData) {
      console.error("showTransactionDetails is true but transactionDetailsData is null");
      return null;
    }

    return (
      <TransactioDetails
        transactionData={transactionDetailsData}
        isAeps2={apiType === "aeps2"}
        onBack={() => {
          setShowTransactionDetails(false);
          setSelectedTransactionId(null);
          setIsLoadingTransactionDetails(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-2 sm:p-3 md:p-4 text-[#1B1717] flex flex-col max-w-[1600px] mx-auto">
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
                  query.transactionType = transactionType;
                } else if (apiType === "aeps2") {
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

                if (apiType === "aeps2") {
                  dispatch(getAeps2CwHistoryCompany(payload));
                } else {
                  dispatch(getAepsCwHistoryCompany(payload));
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

      <div className="p-1 mb-2 flex-shrink-0">
        <div className="flex flex-col md:flex-col lg:flex-row items-stretch lg:items-end gap-3 sm:gap-4">
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

      <div className="bg-white rounded-xl sm:rounded-3xl shadow-sm mt-6 overflow-hidden">
        <div className="w-full overflow-x-auto overscroll-x-contain">
          <table className="w-full border-collapse min-w-full">
            <thead className="bg-[#FFFFFF] border-b border-gray-200">
              <tr>
                <th className="px-4 sm:px-5 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                  SR No
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                  Name
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                  User Role
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                  Mobile
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                  Company Id
                </th>
                {/* <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                  Company Name
                </th> */}
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                  Merchant Id
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                  Bank Name
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                  Tax ID
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                  Bank RRN
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                  Amount
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                  VIA
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                  Status
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                  Created At
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                  Response Message
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-semibold'] text-[#1B1717] whitespace-nowrap">
                  Action
                </th>
              </tr>
            </thead>
            {!isLoading && (
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedTransactions.length > 0 ? (
                  paginatedTransactions.map((transaction, index) => {
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

                        {/* <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#121216]">
                            {transaction.companyName}
                          </span>
                        </td> */}

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
                    <td colSpan={17} className="px-4 sm:px-6 py-8 text-center">
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
      )}
    </div>
  );
};

AepsCWHistory.propTypes = {
  onBack: PropTypes.func,
  apiType: PropTypes.string,
  transactionType: PropTypes.string,
};

export default AepsCWHistory;
