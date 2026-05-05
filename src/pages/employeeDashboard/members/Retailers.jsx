import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  FaSearch,
  FaUpload,
  FaCheckCircle,
  FaTimesCircle,
  FaUser,
  FaIdCard,
  FaBuilding,
  FaUniversity,
  FaExpand,
} from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { User, X, ZoomIn } from "lucide-react";
import * as XLSX from "xlsx";
import { ButtonLoader } from "../../../widgets/layout/loader";
import {
  employeeUseList,
  employeeKycData,
  employeeKycStatusData,
  employeeKycStatusCheck,
  employeeKycUnlock,
  employeeKycRevert,
  employeeRescendOnboarding,
  employeeDeActiveOnboarding,
} from "../../../redux/action/whiteLabelAction";
import {
  employeeGetAdminProfileDetails,
  setSelectedUserRole,
} from "../../../redux/action/userProfileAction";
import ProfileDetails from "./ProfileDetails";
import { checkEmployeeAepsStatus } from "../../../redux/action/whiteLabelAction";
import { useNotification } from "../../../context/NotificationContext";
import KycModal from "./KycModal";

const Retailers = ({
  embedded = false,
  tableData: propTableData = [],
  isLoading: propIsLoading = false,
}) => {
  const dispatch = useDispatch();
  const { success: notifySuccess, error: notifyError, showNotification } = useNotification();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState(
    () => new Date().toISOString().split("T")[0],
  ); // Default to today's date
  const [showKycModal, setShowKycModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [kycDataRefreshKey, setKycDataRefreshKey] = useState(0);
  const [rowLockStatus, setRowLockStatus] = useState({}); // Track lock status per row ID
  const [lastClickedRowId, setLastClickedRowId] = useState(null);
  const kycModalRef = useRef(null);
  const [showProfileDetails, setShowProfileDetails] = useState(false);

  // Revert confirmation state
  const [showRevertConfirm, setShowRevertConfirm] = useState(false);
  const [revertPayload, setRevertPayload] = useState(null);
  const [isReverting, setIsReverting] = useState(false);

  // Loader component for table body
  const TableBodyLoader = ({ colSpan }) => (
    <tr>
      <td colSpan={colSpan} className="relative h-[100px] ">
        <div className="flex flex-col items-center ">
          <ButtonLoader size={28} thickness={3} />
        </div>
      </td>
    </tr>
  );

  // Get kycStatusCheck success state to refresh table after update
  const kycStatusCheckResponse = useSelector(
    (state) => state?.whitelabel?.kycStatusCheck,
  );

  // Get kycRevert success state to refresh KYC data after revert
  const kycRevertResponse = useSelector(
    (state) => state?.whitelabel?.kycRevert,
  );

  // Get kycLockStatus success state to refresh table after unlock
  const kycLockStatusResponse = useSelector(
    (state) => state?.whitelabel?.kycLockStatus,
  );

  // Get AEPS status check response
  const employeeAepsStatus = useSelector(
    (state) => state?.whitelabel?.employeeAepsStatus,
  );

  useEffect(() => {
    if (employeeAepsStatus?.status === "SUCCESS") {
      showNotification({
        message: employeeAepsStatus.message || "AEPS status updated successfully",
        type: "success",
        isCritical: true
      });
      // Refresh table data
      if (debouncedSearchTerm.trim()) {
        const payload = {
          query: {
            userRole: 5, // Retailer role
          },
          options: {
            sort: { id: -1 },
            page: currentPage,
            paginate: 5,
          },
          customSearch: {
            mobileNo: debouncedSearchTerm.trim(),
            name: debouncedSearchTerm.trim(),
          },
        };
        dispatch(employeeUseList(payload));
      }
    } else if (employeeAepsStatus?.status === "FAILURE" || employeeAepsStatus?.status === "Error") {
      showNotification({
        message: employeeAepsStatus.message || "Failed to check AEPS status",
        type: "error",
        isCritical: true
      });
    }
  }, [employeeAepsStatus, debouncedSearchTerm, currentPage, dispatch, showNotification]);

  // Get data from Redux when search is active, otherwise use prop data
  const responseForTable = useSelector(
    (state) => state?.whitelabel?.whitelabelList?.whitelabelList || [],
  );

  // Get KYC details from Redux state - WATCH the entire kycDetails object to detect changes
  const kycDetailsState = useSelector((state) => state?.whitelabel?.kycDetails);
  

  const kycRetrieved = kycDetailsState?.data || null;

  // Get lockCheck from Redux state
  const lockCheck = useSelector((state) => state?.whitelabel?.kycStatusClick);

  // Update row lock status when lockCheck changes for the last clicked row
  useEffect(() => {
    if (lastClickedRowId !== null && lockCheck !== undefined) {
      const isLocked = lockCheck?.kycStatusClick?.isLocked;
      setRowLockStatus((prev) => ({
        ...prev,
        [lastClickedRowId]: isLocked,
      }));
    }
  }, [lockCheck, lastClickedRowId]);

  // Use API data or prop data
  const allTableData = debouncedSearchTerm.trim() && responseForTable.length > 0 
    ? responseForTable 
    : propTableData;
  const isLoading = propIsLoading;

  // Get total count from Redux state (if available) or use current data length
  const totalCountFromRedux = useSelector((state) => {
    const response = state?.whitelabel?.whitelabelList;
    return response?.totalCount || response?.total || 0;
  });

  // Use Redux total count if available and search is active, otherwise use current data length
  const totalCount =
    debouncedSearchTerm.trim() && totalCountFromRedux > 0
      ? totalCountFromRedux
      : allTableData.length;

  // Calculate total pages based on total count (5 records per page)
  // If there's at least 1 record, show at least 1 page, otherwise show 0
  const totalPages = totalCount > 0 ? Math.ceil(totalCount / 5) : 0;

  // Slice data to show only 5 records per page
  const startIndex = (currentPage - 1) * 5;
  const endIndex = startIndex + 5;
  const tableData = allTableData.slice(startIndex, endIndex);

  // Debounce search term to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch data from API when search term changes - DISABLED for demo
  useEffect(() => {
    if (debouncedSearchTerm.trim()) {
      const payload = {
        query: {
          userRole: 5, // Retailer role
        },
        options: {
          sort: { id: -1 },
          page: currentPage,
          paginate: 5,
        },
        customSearch: {
          mobileNo: debouncedSearchTerm.trim(),
          name: debouncedSearchTerm.trim(),
        },
      };

      dispatch(employeeUseList(payload));
    }
  }, [debouncedSearchTerm, currentPage, dispatch]);


  // Refresh table when kycStatusCheck succeeds - MOCKED for demo
  useEffect(() => {
    if (kycStatusCheckResponse?.status === "SUCCESS") {
      // Refresh table data by dispatching useList again
      if (debouncedSearchTerm.trim()) {
        const payload = {
          query: {
            userRole: 5, // Retailer role
          },
          options: {
            sort: { id: -1 },
            page: currentPage,
            paginate: 5,
          },
          customSearch: {
            mobileNo: debouncedSearchTerm.trim(),
            name: debouncedSearchTerm.trim(),
          },
        };
        dispatch(employeeUseList(payload));
      }
    }
  }, [kycStatusCheckResponse, debouncedSearchTerm, currentPage, dispatch]);

  // Refresh table when kycUnlock succeeds
  useEffect(() => {
    if (kycLockStatusResponse?.status === "SUCCESS") {
      const payload = {
        query: {
          userRole: 5, // Retailer role
        },
        options: {
          sort: { id: -1 },
          page: currentPage,
          paginate: 5,
        },
        customSearch: debouncedSearchTerm.trim()
          ? {
            mobileNo: debouncedSearchTerm.trim(),
            name: debouncedSearchTerm.trim(),
          }
          : {},
      };
      dispatch(employeeUseList(payload));
    }
  }, [kycLockStatusResponse, debouncedSearchTerm, currentPage, dispatch]);

  // Export to Excel function
  const handleExportToExcel = () => {
    if (!allTableData || allTableData.length === 0) {
      alert("No data available to export");
      return;
    }

    const excelData = allTableData.map((row) => ({
      ID: row.id || "N/A",
      Date: row.date || "N/A",
      "User ID": row.userId || "N/A",
      Name: row.name || "N/A",
      "User Role": row.userRole || "N/A",
      "Mobile No": row.mobileNo || "N/A",
      "Email Id": row.email || "N/A",
      "Parent Name": row.parentName || "N/A",
      "Parent Role": row.parentRole || "N/A",
      "Company Name": row.company || "N/A",
      "KYC Status": row.kycStatus || "N/A",
      "KYC Steps": row.kycSteps || "0",
      "Main Wallet": getWalletValue(row, "mainWallet"),
      "AEPS1 Wallet": getWalletValue(row, "apes1Wallet"),
      "AEPS2 Wallet": getWalletValue(row, "apes2Wallet"),
      Status: row.status || "Active",
    }));

    // Create a new workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Retailers Data");

    // Generate Excel file and download
    const fileName = `Retailers_Export_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // Helper function to get wallet value
  const getWalletValue = (row, type = "mainWallet") => {
    if (!row) return "0";

    // Define aliases for the types to handle aeps/apes typos and variations
    const aliases = {
      mainWallet: ["mainWallet", "main_wallet", "walletBalance", "balance"],
      apes1Wallet: [
        "apes1Wallet",
        "aeps1Wallet",
        "aeps1_wallet",
        "apes1_wallet",
        "apesWallet1",
        "aepsWallet1",
      ],
      apes2Wallet: [
        "apes2Wallet",
        "aeps2Wallet",
        "aeps2_wallet",
        "apes2_wallet",
        "apesWallet2",
        "aepsWallet2",
      ],
    };

    const possibleKeys = aliases[type] || [type];

    // Priority Check:
    // 1. Check top level of row
    for (const key of possibleKeys) {
      if (row[key] !== undefined && row[key] !== null) return String(row[key]);
    }

    // 2. Check nested wallet object
    const walletObj = row.wallet || row.wallets || row.walletDetails;
    if (walletObj && typeof walletObj === "object") {
      for (const key of possibleKeys) {
        if (walletObj[key] !== undefined && walletObj[key] !== null)
          return String(walletObj[key]);
      }
    }

    // 3. Check originalItem
    if (row.originalItem) {
      // 3.1 Check originalItem top level
      for (const key of possibleKeys) {
        if (
          row.originalItem[key] !== undefined &&
          row.originalItem[key] !== null
        )
          return String(row.originalItem[key]);
      }
      // 3.2 Check originalItem nested wallet
      const origWalletObj =
        row.originalItem.wallet ||
        row.originalItem.wallets ||
        row.originalItem.walletDetails;
      if (origWalletObj && typeof origWalletObj === "object") {
        for (const key of possibleKeys) {
          if (
            origWalletObj[key] !== undefined &&
            origWalletObj[key] !== null
          )
            return String(origWalletObj[key]);
        }
      }
    }

    return "0";
  };

  // Helper function to safely convert any value to string
  const safeString = (value, fallback = "N/A") => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === "object") {
      try {
        return JSON.stringify(value);
      } catch {
        return fallback;
      }
    }
    return String(value);
  };

  // Format date from API
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB").replaceAll("/", "-");
    } catch {
      return "N/A";
    }
  };

  if (showProfileDetails) {
    return <ProfileDetails onBack={() => setShowProfileDetails(false)} />;
  }

  return (
    <div
      className={`text-[#1B1717] ${embedded ? "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" : "min-h-screen p-4 sm:p-6"}`}
    >
      {embedded ? (
        <div className="flex flex-col min-h-[calc(100vh-300px)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4">
            <h2 className="text-xl sm:text-2xl font-normal text-gray-800">
              Retailers
            </h2>

            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-end gap-3">
              <div className="flex flex-col xs:flex-row gap-3">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-3 pr-3 py-3 border border-gray-300 rounded-lg w-full xs:w-32 text-sm focus:ring-green-500 focus:border-green-500 text-center cursor-pointer"
                />

                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  min={fromDate || undefined}
                  className="pl-3 pr-3 py-3 border border-gray-300 rounded-lg w-full xs:w-32 text-sm focus:ring-green-500 focus:border-green-500 text-center cursor-pointer"
                />
              </div>

              <div className="relative w-full sm:w-48">
                <input
                  type="text"
                  placeholder="Search by Mobile No or Name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-4 pr-10 py-3 border border-gray-300 rounded-xl w-full text-sm focus:ring-green-500 focus:border-green-500"
                />
                <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
              </div>

              <button
                onClick={handleExportToExcel}
                className="flex items-center justify-center gap-2 bg-[#039155] text-white px-4 py-3 rounded-lg font-[Gilroy-Medium] hover:bg-green-700 shadow-md text-sm sm:text-base"
              >
                Export <FaUpload className="text-xs" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 mb-4 overflow-x-auto rounded-3xl bg-white [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <table className="min-w-[1200px] sm:min-w-full divide-y">
              <thead className="bg-white text-center">
                <tr>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    ID
                  </th>
                  <th className="px-3 py-4 ml-8  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    User
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    User ID
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Name
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    User Role
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Mobile No
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Email Id
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Parent Name
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Parent Role
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Company
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    KYC Status
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    KYC Steps
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Main Wallet
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    AEPS 1 Status
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    AEPS1 Wallet
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    AEPS2 Wallet
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    KYC Details
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Action
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Lock Status
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Onboarding
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Token Expire
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y font-normal text-center divide-gray-100">
                {isLoading ? (
                  <TableBodyLoader colSpan={14} />
                ) : !tableData || tableData.length === 0 ? (
                  <tr>
                    <td colSpan={21} className="py-12 text-center">
                      <p className="text-gray-500 text-lg font-[Gilroy-Medium]">
                        No data available
                      </p>
                    </td>
                  </tr>
                ) : (
                  tableData.map((row, index) => (
                    <tr
                      key={row.id || index}
                      className={`text-sm ${index % 2 === 0 ? "bg-green-50" : "bg-white"}`}
                    >
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {safeString(row.id, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] ">
                        <button
                          onClick={() => {
                            const userId = row.id || row.originalItem?.id;
                            if (userId) {
                              // Set role code for ProfileDetails badge
                              const roleFromRow =
                                row.userRole ||
                                row.originalItem?.userRole ||
                                "R"; // Retailer
                              dispatch(setSelectedUserRole(roleFromRow));

                              // Use only admin profile details API (same as CreateWhiteLabel)
                              dispatch(employeeGetAdminProfileDetails(userId));

                              setShowProfileDetails(true);
                            }
                          }}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors cursor-pointer"
                        >
                          <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                        </button>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {safeString(row.userId, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {safeString(row.name, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {safeString(row.userRole, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {safeString(row.mobileNo, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {safeString(row.email, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {safeString(row.parentName, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {safeString(row.parentRole, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {safeString(row.company, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {(() => {
                          const status = row.kycStatus?.toLowerCase();
                          let className =
                            "px-2 py-1 rounded text-xs font-[Gilroy-Medium] ";
                          if (status === "completed" || status === "full_kyc") {
                            className += "bg-green-100 text-green-700";
                          } else if (status === "pending") {
                            className += "bg-yellow-100 text-yellow-700";
                          } else {
                            className += "bg-red-100 text-red-700";
                          }
                          return (
                            <span className={className}>
                              {safeString(row.kycStatus, "N/A")}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular] text-center">
                        {safeString(row.kycSteps, "0")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular] text-center">
                        {getWalletValue(row, "mainWallet")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] font-[Gilroy-Regular] text-center">
                        {(() => {
                          const userId = row.id || row.originalItem?.id;
                          return (
                            <button
                              onClick={() => {
                                if (userId) {
                                  dispatch(checkEmployeeAepsStatus(userId));
                                }
                              }}
                              disabled={row.aepsOnboardingStatus === true}
                              className={`px-3 py-1 border border-indigo-500 text-indigo-600 rounded-lg text-xs font-[Gilroy-Medium] transition-colors ${
                                row.aepsOnboardingStatus === true
                                  ? "opacity-50 cursor-not-allowed bg-gray-100 border-gray-300 text-gray-400"
                                  : "hover:bg-indigo-50"
                              }`}
                            >
                              Check Status
                            </button>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular] text-center">
                        {getWalletValue(row, "apes1Wallet")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular] text-center">
                        {getWalletValue(row, "apes2Wallet")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        <span
                          className={`px-3 py-1 rounded-lg text-white text-xs font-[Gilroy-Medium] ${row.status?.toLowerCase() === "active"
                            ? "bg-green-600"
                            : "bg-red-600"
                            }`}
                        >
                          {safeString(row.status, "Active")}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        <button
                          onClick={() => {
                            const userId = row.id || row.originalItem?.id;
                            if (userId) {
                              setSelectedUserId(userId);
                              setShowKycModal(true);
                            }
                          }}
                          className="px-3 py-1 border border-[#039155] text-[#039155] rounded-lg hover:bg-green-50 text-xs font-[Gilroy-Medium] transition-colors"
                        >
                          KYC Details
                        </button>
                      </td>
                      {/* Action - Toggle Button */}
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {(() => {
                          const userId = row.id || row.originalItem?.id;
                          const isActive =
                            row.status?.toLowerCase() === "active";

                          return (
                            <button
                              onClick={() => {
                                if (userId) {
                                  // Handle both cases: active → inactive and inactive → active
                                  if (isActive) {
                                    // Toggling from active to inactive (OFF)
                                    dispatch(
                                      employeeKycStatusCheck(userId, {
                                        isActive: "false",
                                      }),
                                    );
                                  } else {
                                    // Toggling from inactive to active (ON)
                                    dispatch(
                                      employeeKycStatusCheck(userId, {
                                        isActive: "true",
                                      }),
                                    );
                                  }

                                  // Immediately refresh table data after dispatching
                                  setTimeout(() => {
                                    const payload = {
                                      query: {
                                        userRole: 5, // Retailer role
                                      },
                                      options: {
                                        sort: { id: -1 },
                                        page: currentPage,
                                        paginate: 5,
                                      },
                                      customSearch: {
                                        mobileNo: debouncedSearchTerm.trim(),
                                        name: debouncedSearchTerm.trim(),
                                      },
                                    };
                                    dispatch(employeeUseList(payload));
                                  }, 500);
                                }
                              }}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-offset-1 ${isActive ? "bg-green-600" : "bg-gray-300"
                                }`}
                              role="switch"
                              aria-checked={isActive}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? "translate-x-6" : "translate-x-1"
                                  }`}
                              />
                            </button>
                          );
                        })()}
                      </td>
                      {/* Lock Status - Colored Button */}
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {(() => {
                          const userId = row.id || row.originalItem?.id;
                          // Check multiple possible formats for lock status
                          // Priority: row.lock (direct property) > originalItem.lock > isLocked > lockStatus
                          const lockValue =
                            row?.lock !== undefined && row?.lock !== null
                              ? row.lock
                              : row?.originalItem?.lock !== undefined && row?.originalItem?.lock !== null
                                ? row.originalItem.lock
                                : row?.isLocked !== undefined && row?.isLocked !== null
                                  ? row.isLocked
                                  : row?.lockStatus;
                          // More robust check for lock status
                          const isLocked =
                            lockValue !== undefined &&
                            lockValue !== null &&
                            (lockValue === true ||
                              lockValue === "true" ||
                              lockValue === 1 ||
                              String(lockValue).toLowerCase() === "true");

                          return (
                            <button
                              onClick={() => {
                                // Only trigger API when button is in "Locked" state
                                if (userId && isLocked) {
                                  // Dispatch unlock action with the row ID
                                  // The useEffect hook will automatically refresh the table
                                  // when kycLockStatusResponse status becomes "SUCCESS"
                                  dispatch(employeeKycUnlock(userId));
                                }
                              }}
                              disabled={!isLocked}
                              className={`px-4 py-2 rounded-lg text-xs font-[Gilroy-Semibold] transition-colors ${isLocked
                                ? "bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                                : "bg-green-500 text-white cursor-not-allowed opacity-75"
                                }`}
                              title={
                                isLocked
                                  ? "Click to enable access for this account"
                                  : "Account access is enabled"
                              }
                            >
                              {isLocked ? "Enable Access" : "Access Enabled"}
                            </button>
                          );
                        })()}
                      </td>
                      {/* Onboarding - Re-send Button */}
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {(() => {
                          const userId = row.id || row.originalItem?.id;
                          return (
                            <button
                              onClick={() => {
                                if (userId) {
                                  dispatch(employeeRescendOnboarding(userId));
                                }
                              }}
                              className="px-3 py-1 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 text-xs font-[Gilroy-Medium] transition-colors"
                            >
                              Re-send
                            </button>
                          );
                        })()}
                      </td>
                      {/* Deactivation - Send Button */}
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {(() => {
                          const userId = row.id || row.originalItem?.id;
                          return (
                            <button
                              onClick={() => {
                                if (userId) {
                                  dispatch(employeeDeActiveOnboarding(userId));
                                }
                              }}
                              className="px-3 py-1 border border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 text-xs font-[Gilroy-Medium] transition-colors"
                            >
                              Send
                            </button>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {formatDate(row.date)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center mt-auto pt-6 pb-4 space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1 || totalPages === 0}
              className={`p-2 border border-gray-300 rounded-lg ${currentPage === 1 || totalPages === 0
                ? "text-gray-400 cursor-not-allowed bg-gray-100"
                : "text-gray-500 hover:bg-gray-100"
                }`}
            >
              <IoIosArrowBack />
            </button>
            {totalPages > 0 ? (
              Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-sm font-[Gilroy-Medium] ${page === currentPage
                      ? "bg-green-600 text-white"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                      }`}
                  >
                    {page}
                  </button>
                ),
              )
            ) : (
              <span className="w-8 h-8 rounded-lg text-sm font-[Gilroy-Medium] flex items-center justify-center text-gray-500">
                0
              </span>
            )}
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages || totalPages === 0}
              className={`p-2 border border-gray-300 rounded-lg ${currentPage === totalPages || totalPages === 0
                ? "text-gray-400 cursor-not-allowed bg-gray-100"
                : "text-gray-500 hover:bg-gray-100"
                }`}
            >
              <IoIosArrowForward />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 flex flex-col min-h-[calc(100vh-300px)]">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-normal text-gray-800">
              Retailers
            </h2>

            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-end gap-3">
              <div className="flex flex-col xs:flex-row gap-3">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-3 pr-3 py-3 border border-gray-300 rounded-lg w-full xs:w-32 text-sm focus:ring-green-500 focus:border-green-500 text-center cursor-pointer"
                />

                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  min={fromDate || undefined}
                  className="pl-3 pr-3 py-3 border border-gray-300 rounded-lg w-full xs:w-32 text-sm focus:ring-green-500 focus:border-green-500 text-center cursor-pointer"
                />
              </div>

              <div className="relative w-full sm:w-48">
                <input
                  type="text"
                  placeholder="Search by Mobile No or Name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-4 pr-10 py-3 border border-gray-300 rounded-xl w-full text-sm focus:ring-green-500 focus:border-green-500"
                />
                <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
              </div>

              <button
                onClick={handleExportToExcel}
                className="flex items-center justify-center gap-2 bg-[#039155] text-white px-4 py-3 rounded-lg font-[Gilroy-Medium] hover:bg-green-700 shadow-md text-sm sm:text-base"
              >
                Export <FaUpload className="text-xs" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 mb-4 overflow-x-auto rounded-xl bg-white [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <table className="min-w-[1200px] sm:min-w-full divide-y">
              <thead className="bg-gray-100 text-center">
                <tr>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    ID
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    User
                  </th>

                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    User ID
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Name
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    User Role
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Mobile No
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Email Id
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Parent Name
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Parent Role
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Company
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    KYC Status
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    KYC Steps
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Main Wallet
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    AEPS 1 Status
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    AEPS1 Wallet
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    AEPS2 Wallet
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    KYC Details
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Action
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Lock Status
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Onboarding
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Token Expire
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y font-normal text-center divide-gray-100">
                {isLoading ? (
                  <TableBodyLoader colSpan={14} />
                ) : !tableData || tableData.length === 0 ? (
                  <tr>
                    <td colSpan={21} className="py-12 text-center">
                      <p className="text-gray-500 text-lg font-[Gilroy-Medium]">
                        No data available
                      </p>
                    </td>
                  </tr>
                ) : (
                  tableData.map((row, index) => (
                    <tr
                      key={row.id || index}
                      className={`text-sm ${index % 2 === 0 ? "bg-green-50" : "bg-white"}`}
                    >
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {safeString(row.id, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-center">
                        <button
                          onClick={() => {
                            const userId = row.id || row.originalItem?.id;
                            if (userId) {
                              // Use only admin profile details API (same as CreateWhiteLabel)
                              const original = row.originalItem || {};
                              dispatch(employeeGetAdminProfileDetails(userId));

                              setShowProfileDetails(true);
                            }
                          }}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors cursor-pointer"
                        >
                          <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                        </button>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {safeString(row.userId, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {safeString(row.name, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {safeString(row.userRole, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {safeString(row.mobileNo, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {safeString(row.email, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {safeString(row.parentName, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {safeString(row.parentRole, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {safeString(row.company, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {(() => {
                          const status = row.kycStatus?.toLowerCase();
                          let className =
                            "px-2 py-1 rounded text-xs font-[Gilroy-Medium] ";
                          if (status === "completed" || status === "full_kyc") {
                            className += "bg-green-100 text-green-700";
                          } else if (status === "pending") {
                            className += "bg-yellow-100 text-yellow-700";
                          } else {
                            className += "bg-red-100 text-red-700";
                          }
                          return (
                            <span className={className}>
                              {safeString(row.kycStatus, "N/A")}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular] text-center">
                        {safeString(row.kycSteps, "0")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular] text-center">
                        {getWalletValue(row.wallet, "mainWallet")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] font-[Gilroy-Regular] text-center">
                        {(() => {
                          const userId = row.id || row.originalItem?.id;
                          return (
                            <button
                              onClick={() => {
                                if (userId) {
                                  dispatch(checkEmployeeAepsStatus(userId));
                                }
                              }}
                              disabled={row.aepsOnboardingStatus === true}
                              className={`px-3 py-1 border border-indigo-500 text-indigo-600 rounded-lg text-xs font-[Gilroy-Medium] transition-colors ${
                                row.aepsOnboardingStatus === true
                                  ? "opacity-50 cursor-not-allowed bg-gray-100 border-gray-300 text-gray-400"
                                  : "hover:bg-indigo-50"
                              }`}
                            >
                              Check Status
                            </button>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular] text-center">
                        {getWalletValue(row.wallet, "apes1Wallet")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular] text-center">
                        {getWalletValue(row.wallet, "apes2Wallet")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        <span
                          className={`px-3 py-1 rounded-lg text-white text-xs font-[Gilroy-Medium] ${row.status?.toLowerCase() === "active"
                            ? "bg-green-600"
                            : "bg-red-600"
                            }`}
                        >
                          {safeString(row.status, "Active")}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        <button
                          onClick={() => {
                            const userId = row.id || row.originalItem?.id;
                            if (userId) {
                              setSelectedUserId(userId);
                              dispatch(employeeKycData(userId));
                              setShowKycModal(true);
                            }
                          }}
                          className="px-3 py-1 border border-black text-green-600 rounded-lg hover:bg-green-50 text-xs font-[Gilroy-Medium] transition-colors"
                        >
                          KYC Details
                        </button>
                      </td>
                      {/* Action - Toggle Button */}
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {(() => {
                          const userId = row.id || row.originalItem?.id;
                          const isActive =
                            row.status?.toLowerCase() === "active";

                          return (
                            <button
                              onClick={() => {
                                if (userId) {
                                  // Handle both cases: active → inactive and inactive → active
                                  /*
                                  if (isActive) {
                                    // Toggling from active to inactive (OFF)
                                    dispatch(
                                      employeeKycStatusCheck(userId, {
                                        isActive: "false",
                                      }),
                                    );
                                  } else {
                                    // Toggling from inactive to active (ON)
                                    dispatch(
                                      employeeKycStatusCheck(userId, {
                                        isActive: "true",
                                      }),
                                    );
                                  }
                                  */
                                  alert(`Account status updated for ${row.name || "user"}`);
                                }
                              }}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-offset-1 ${isActive ? "bg-green-600" : "bg-gray-300"
                                }`}
                              role="switch"
                              aria-checked={isActive}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? "translate-x-6" : "translate-x-1"
                                  }`}
                              />
                            </button>
                          );
                        })()}
                      </td>
                      {/* Lock Status - Colored Button */}
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {(() => {
                          const userId = row.id || row.originalItem?.id;
                          // Check multiple possible formats for lock status
                          // Priority: row.lock (direct property) > originalItem.lock > isLocked > lockStatus
                          const lockValue =
                            row?.lock !== undefined && row?.lock !== null
                              ? row.lock
                              : row?.originalItem?.lock !== undefined && row?.originalItem?.lock !== null
                                ? row.originalItem.lock
                                : row?.isLocked !== undefined && row?.isLocked !== null
                                  ? row.isLocked
                                  : row?.lockStatus;
                          // More robust check for lock status
                          const isLocked =
                            lockValue !== undefined &&
                            lockValue !== null &&
                            (lockValue === true ||
                              lockValue === "true" ||
                              lockValue === 1 ||
                              String(lockValue).toLowerCase() === "true");

                          return (
                            <button
                              onClick={() => {
                                // Only trigger API when button is in "Locked" state
                                if (userId && isLocked) {
                                  // Dispatch unlock action with the row ID - MOCKED
                                  dispatch(employeeKycUnlock(userId));
                                  alert("Account access has been enabled successfully.");
                                }
                              }}
                              disabled={!isLocked}
                              className={`px-4 py-2 rounded-lg text-xs font-[Gilroy-Semibold] transition-colors ${isLocked
                                ? "bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                                : "bg-green-500 text-white cursor-not-allowed opacity-75"
                                }`}
                              title={
                                isLocked
                                  ? "Click to enable access for this account"
                                  : "Account access is enabled"
                              }
                            >
                              {isLocked ? "Enable Access" : "Access Enabled"}
                            </button>
                          );
                        })()}
                      </td>
                      {/* Onboarding - Re-send Button */}
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {(() => {
                          const userId = row.id || row.originalItem?.id;
                          return (
                            <button
                              onClick={() => {
                                if (userId) {
                                  dispatch(employeeRescendOnboarding(userId));
                                }
                              }}
                              className="px-3 py-1 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 text-xs font-[Gilroy-Medium] transition-colors"
                            >
                              Re-send
                            </button>
                          );
                        })()}
                      </td>
                      {/* Deactivation - Send Button */}
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {(() => {
                          const userId = row.id || row.originalItem?.id;
                          return (
                            <button
                              onClick={() => {
                                if (userId) {
                                  dispatch(employeeDeActiveOnboarding(userId));
                                }
                              }}
                              className="px-3 py-1 border border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 text-xs font-[Gilroy-Medium] transition-colors"
                            >
                              Send
                            </button>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {formatDate(row.date)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center mt-auto pt-6 pb-4 space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1 || totalPages === 0}
              className={`p-2 border border-gray-300 rounded-lg ${currentPage === 1 || totalPages === 0
                ? "text-gray-400 cursor-not-allowed bg-gray-100"
                : "text-gray-500 hover:bg-gray-100"
                }`}
            >
              <IoIosArrowBack />
            </button>
            {totalPages > 0 ? (
              Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-sm font-[Gilroy-Medium] ${page === currentPage
                      ? "bg-green-600 text-white"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                      }`}
                  >
                    {page}
                  </button>
                ),
              )
            ) : (
              <span className="w-8 h-8 rounded-lg text-sm font-[Gilroy-Medium] flex items-center justify-center text-gray-500">
                0
              </span>
            )}
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages || totalPages === 0}
              className={`p-2 border border-gray-300 rounded-lg ${currentPage === totalPages || totalPages === 0
                ? "text-gray-400 cursor-not-allowed bg-gray-100"
                : "text-gray-500 hover:bg-gray-100"
                }`}
            >
              <IoIosArrowForward />
            </button>
          </div>
        </div>
      )}

      {/* Standardized KYC Modal */}
      <KycModal
        isOpen={showKycModal}
        onClose={() => {
          setShowKycModal(false);
          setSelectedUserId(null);
        }}
        userId={selectedUserId}
        refreshKey={kycDataRefreshKey}
        onRevertSuccess={() => {
          setKycDataRefreshKey((prev) => prev + 1);
          // Refresh table data if needed
          if (debouncedSearchTerm.trim()) {
            const payload = {
              query: { userRole: 5 },
              options: { sort: { id: -1 }, page: currentPage, paginate: 5 },
              customSearch: {
                mobileNo: debouncedSearchTerm.trim(),
                name: debouncedSearchTerm.trim(),
              },
            };
            dispatch(employeeUseList(payload));
          }
        }}
      />

      {/* Add CSS animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Retailers;
