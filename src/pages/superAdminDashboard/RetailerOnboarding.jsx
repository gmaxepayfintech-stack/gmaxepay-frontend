import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  ChevronLeft, 
  ChevronRight, 
  User, 
  X, 
  ZoomIn, 
  ShieldAlert, 
  CheckCircle2, 
  Info, 
  RotateCcw 
} from "lucide-react";
import {
  FaSearch,
  FaCheckCircle,
  FaTimesCircle,
  FaUser,
  FaIdCard,
  FaBuilding,
  FaUniversity,
  FaExpand,
  FaUpload,
  FaHistory,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import {
  useList as useListAction,
  kycData as kycDataAction,
  kycStatusCheck,
  kycUnlock,
  kycRevert,
  rescendOnboarding,
  deActiveOnboarding,
  getCompanyAdmin,
} from "../../redux/action/whiteLabelAction";
import ProfileDetails from "./ProfileDetails";
import {
  getAdminProfileDetails,
  setSelectedUserRole,
} from "../../redux/action/userProfileAction";
import { checkAdminAepsStatus } from "../../redux/action/whiteLabelAction";
import { useNotification } from "../../context/NotificationContext";
import { ButtonLoader } from "../../widgets/layout/loader";

const RetailerOnboarding = ({
  embedded = false,
  tableData: propTableData = [],
}) => {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [debouncedFromDate, setDebouncedFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [debouncedToDate, setDebouncedToDate] = useState("");
  const [selectedKycData, setSelectedKycData] = useState(null);
  const [showKycModal, setShowKycModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [zoomedImage, setZoomedImage] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showRevertConfirm, setShowRevertConfirm] = useState(false);
  const [revertPayload, setRevertPayload] = useState(null);
  const [isReverting, setIsReverting] = useState(false);
  const [kycDataRefreshKey, setKycDataRefreshKey] = useState(0);
  const [showProfileDetails, setShowProfileDetails] = useState(false);
  const [isKycModalLoading, setIsKycModalLoading] = useState(false);

  const kycModalRef = useRef(null);
  const revertConfirmRef = useRef(null);

  // Unified Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: "",
    message: "",
    type: "danger", // danger, success, warning, info
    onConfirm: null,
    confirmText: "Confirm",
    cancelText: "Cancel",
    isProcessing: false,
  });

  const { showNotification } = useNotification();
  const adminAepsStatusResponse = useSelector(
    (state) => state?.whitelabel?.adminAepsStatus
  );

  // Refresh table when AEPS status check succeeds
  useEffect(() => {
    if (adminAepsStatusResponse?.status === "SUCCESS") {
      showNotification({
        message: adminAepsStatusResponse?.message || "AEPS Status updated successfully",
        type: "success",
        isCritical: true
      });
      
      const bothDatesSelected = debouncedFromDate && debouncedToDate;
      const bothDatesNull = !debouncedFromDate && !debouncedToDate;
      if (!bothDatesSelected && !bothDatesNull) {
        return;
      }
      
      const payload = {
        query: {
          userRole: 5, // Retailer role
          kycStatus: "pending",
          ...(bothDatesSelected ? { startDate: debouncedFromDate.replace(/-/g, "/"), endDate: debouncedToDate.replace(/-/g, "/") } : {}),
        },
        options: { sort: { id: -1 }, page: currentPage, paginate: 6 },
        customSearch: debouncedSearchTerm.trim() ? {
          mobileNo: debouncedSearchTerm.trim(),
          name: debouncedSearchTerm.trim(),
        } : {},
      };
      dispatch(useListAction(payload));
    } else if (adminAepsStatusResponse?.status === "FAILURE" || adminAepsStatusResponse?.status === "Error") {
      showNotification({
        message: adminAepsStatusResponse?.message || "Failed to update AEPS status",
        type: "error",
        isCritical: true
      });
    }
  }, [adminAepsStatusResponse, showNotification, dispatch, currentPage, debouncedSearchTerm, debouncedFromDate, debouncedToDate]);

  // Get KYC details from Redux state - watch the entire kycDetails object to detect changes
  const kycDetailsState = useSelector((state) => state?.whitelabel?.kycDetails);
  const kycRetrieved = kycDetailsState?.data || null;

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

  // Use prop data from API - no dummy data
  const allTableData =
    Array.isArray(propTableData) && propTableData.length > 0
      ? propTableData
      : [];

  // Get total count from Redux state (if available) or use current data length
  const totalCountFromRedux = useSelector((state) => {
    const response = state?.whitelabel?.whitelabelList;
    return response?.totalCount || response?.total || 0;
  });

  // Use Redux total count if available, otherwise use current data length
  const totalCount =
    totalCountFromRedux > 0 ? totalCountFromRedux : allTableData.length;

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Debounce date filters to prevent API calls while user is typing/shifting date segments
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFromDate(fromDate);
      setDebouncedToDate(toDate);
      setCurrentPage(1);
    }, 1500); // 1.5 seconds delay

    return () => clearTimeout(timer);
  }, [fromDate, toDate]);

  // Fetch data from API when search term or dates change
  useEffect(() => {
    // Only fetch if both dates are provided, or if both dates are empty
    const bothDatesSelected = debouncedFromDate && debouncedToDate;
    const bothDatesNull = !debouncedFromDate && !debouncedToDate;

    if (!bothDatesSelected && !bothDatesNull) {
      return;
    }

    if (debouncedSearchTerm.trim() || bothDatesSelected) {
      const payload = {
        query: {
          userRole: 5, // Retailer role
          kycStatus: "pending",
          ...(debouncedFromDate && debouncedToDate ? { startDate: debouncedFromDate.replace(/-/g, "/"), endDate: debouncedToDate.replace(/-/g, "/") } : {}),
        },
        options: {
          sort: { id: -1 },
          page: currentPage,
          paginate: 6,
        },
        customSearch: {
          ...(debouncedSearchTerm.trim() ? { mobileNo: debouncedSearchTerm.trim(), name: debouncedSearchTerm.trim() } : {}),
        },
      };
      dispatch(useListAction(payload));
    }
  }, [debouncedSearchTerm, debouncedFromDate, debouncedToDate, currentPage, dispatch]);

  // Use Redux data when search is active, otherwise use prop data
  const reduxTableData = useSelector(
    (state) => state?.whitelabel?.whitelabelList?.whitelabelList || [],
  );
  const finalTableData = debouncedSearchTerm.trim()
    ? reduxTableData
    : allTableData;
  const finalTotalCount =
    debouncedSearchTerm.trim() && totalCountFromRedux > 0
      ? totalCountFromRedux
      : finalTableData.length;
  const finalTotalPages =
    finalTotalCount > 0 ? Math.ceil(finalTotalCount / 5) : 0;
  const finalStartIndex = (currentPage - 1) * 5;
  const finalEndIndex = finalStartIndex + 5;
  const displayTableData = finalTableData.slice(finalStartIndex, finalEndIndex);

  // Update selectedKycData when Redux state changes
  useEffect(() => {
    if (kycRetrieved && showKycModal) {
      // Force update by creating a deep copy to ensure React detects the change
      try {
        const deepCopy = structuredClone(kycRetrieved);
        setSelectedKycData(deepCopy);
        setIsKycModalLoading(false);
      } catch (error) {
        // Fallback to shallow copy if deep copy fails
        console.warn(
          "Failed to deep clone KYC data, using shallow copy:",
          error,
        );
        setSelectedKycData({ ...kycRetrieved });
        setIsKycModalLoading(false);
      }
    }
  }, [kycDetailsState, kycRetrieved, showKycModal, kycDataRefreshKey]);

  // Refresh KYC data when revert succeeds
  useEffect(() => {
    if (kycRevertResponse) {
      if (kycRevertResponse.status === "SUCCESS") {
        setIsReverting(false);
        setShowRevertConfirm(false);
        setRevertPayload(null);

        if (selectedUserId && showKycModal) {
          // Clear current data to force re-render
          setSelectedKycData(null);
          // Small delay to ensure backend has processed the revert
          const timer = setTimeout(() => {
            // Force update by incrementing refresh key
            setKycDataRefreshKey((prev) => prev + 1);
            // Set loading for data refresh
            setIsKycModalLoading(true);
            // Refresh KYC data after revert
            dispatch(kycDataAction(selectedUserId));
          }, 500);

          return () => clearTimeout(timer);
        }
      } else if (
        kycRevertResponse.status === "FAILED" ||
        kycRevertResponse.status === "ERROR" ||
        kycRevertResponse.status === "FAILURE" ||
        kycRevertResponse.status === "Error"
      ) {
        setIsReverting(false);
      }
    }
  }, [kycRevertResponse, selectedUserId, showKycModal, dispatch]);

  // Refresh table when kycStatusCheck succeeds
  useEffect(() => {
    if (kycStatusCheckResponse?.status === "SUCCESS") {
      // Only fetch if both dates are provided, or if both dates are empty
      const bothDatesSelected = debouncedFromDate && debouncedToDate;
      const bothDatesNull = !debouncedFromDate && !debouncedToDate;

      if (!bothDatesSelected && !bothDatesNull) {
        return;
      }

      // Refresh table data by dispatching useList again
      if (debouncedSearchTerm.trim() || bothDatesSelected || bothDatesNull) {
        const payload = {
          query: {
            userRole: 5, // Retailer role
            kycStatus: "pending",
            ...(debouncedFromDate && debouncedToDate ? { startDate: debouncedFromDate.replace(/-/g, "/"), endDate: debouncedToDate.replace(/-/g, "/") } : {}),
          },
          options: {
            sort: { id: -1 },
            page: currentPage,
            paginate: 6,
          },
          customSearch: {
             ...(debouncedSearchTerm.trim() ? { mobileNo: debouncedSearchTerm.trim(), name: debouncedSearchTerm.trim() } : {}),
          },
        };
        dispatch(useListAction(payload));
      }
    }
  }, [kycStatusCheckResponse, debouncedSearchTerm, debouncedFromDate, debouncedToDate, currentPage, dispatch]);

  // Refresh table when kycUnlock succeeds
  useEffect(() => {
    if (kycLockStatusResponse?.status === "SUCCESS") {
      // Only fetch if both dates are provided, or if both dates are empty
      const bothDatesSelected = debouncedFromDate && debouncedToDate;
      const bothDatesNull = !debouncedFromDate && !debouncedToDate;

      if (!bothDatesSelected && !bothDatesNull) {
        return;
      }

      const payload = {
        query: {
          userRole: 5, // Retailer role
          kycStatus: "pending",
          ...(debouncedFromDate && debouncedToDate ? { startDate: debouncedFromDate.replace(/-/g, "/"), endDate: debouncedToDate.replace(/-/g, "/") } : {}),
        },
        options: {
          sort: { id: -1 },
          page: currentPage,
          paginate: 6,
        },
        customSearch: debouncedSearchTerm.trim()
          ? {
            mobileNo: debouncedSearchTerm.trim(),
            name: debouncedSearchTerm.trim(),
          }
          : {},
      };
      dispatch(useListAction(payload));
    }
  }, [kycLockStatusResponse, debouncedSearchTerm, debouncedFromDate, debouncedToDate, currentPage, dispatch]);

  // Handle click outside modal - DISABLED as per user request to prevent accidental closure
  useEffect(() => {
    // Logic removed to prevent closing on outside click
    return () => {};
  }, []);

  // Export to Excel function
  const handleExportToExcel = () => {
    if (!finalTableData || finalTableData.length === 0) {
      alert("No data available to export");
      return;
    }

    // Prepare data for Excel export
    const excelData = finalTableData.map((row) => ({
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
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Retailer Onboarding Data",
    );

    // Generate Excel file and download
    const fileName = `Retailer_Onboarding_Export_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // Helper function to get wallet value
  const getWalletValue = (row, type = "mainWallet") => {
    if (!row) return "0";

    // Define aliases for the types to handle aeps/apes typos and variations
    const aliases = {
      mainWallet: ["mainWallet", "main_wallet"],
      apes1Wallet: [
        "apes1Wallet",
        "aeps1Wallet",
        "aeps1_wallet",
        "apes1_wallet",
      ],
      apes2Wallet: [
        "apes2Wallet",
        "aeps2Wallet",
        "aeps2_wallet",
        "apes2_wallet",
      ],
    };

    const possibleKeys = aliases[type] || [type];

    // Priority Check:
    // 1. Check top level of row
    for (const key of possibleKeys) {
      if (row[key] !== undefined && row[key] !== null) return String(row[key]);
    }

    // 2. Check nested wallet object
    if (row.wallet && typeof row.wallet === "object") {
      for (const key of possibleKeys) {
        if (row.wallet[key] !== undefined && row.wallet[key] !== null)
          return String(row.wallet[key]);
      }
    }

    // 3. Check originalItem
    if (row.originalItem) {
      // 3.1 Check originalItem top level
      for (const key of possibleKeys) {
        if (row.originalItem[key] !== undefined && row.originalItem[key] !== null)
          return String(row.originalItem[key]);
      }
      // 3.2 Check originalItem nested wallet
      if (
        row.originalItem.wallet &&
        typeof row.originalItem.wallet === "object"
      ) {
        for (const key of possibleKeys) {
          if (
            row.originalItem.wallet[key] !== undefined &&
            row.originalItem.wallet[key] !== null
          )
            return String(row.originalItem.wallet[key]);
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
    if (!dateString || dateString === "N/A") return "N/A";

    try {
      const date = new Date(dateString);

      // Check if the date is valid
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("en-GB").replaceAll("/", "-");
      }

      // If invalid, try parsing common formats like DD-MM-YYYY or DD/MM/YYYY
      if (typeof dateString === "string") {
        const parts = dateString.split(/[-/]/);
        if (parts.length === 3) {
          // If it's DD-MM-YYYY, convert to YYYY-MM-DD for reliable parsing
          if (parts[0].length === 2 && parts[2].length === 4) {
            const reorderedDate = new Date(
              `${parts[2]}-${parts[1]}-${parts[0]}`,
            );
            if (!isNaN(reorderedDate.getTime())) {
              return reorderedDate
                .toLocaleDateString("en-GB")
                .replaceAll("/", "-");
            }
          }
        }
        // If it already looks like a formatted date but new Date() failed, return as is
        return dateString;
      }

      return "N/A";
    } catch (error) {
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
          <div
            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${embedded ? "py-4 mb-0" : "mb-6"}`}
          >
            <h1 className="text-lg sm:text-2xl lg:text-2xl font-[Gilroy-Medium] text-[#1B1717]">
              Retailer Onboarding List
            </h1>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* From Date */}
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] bg-white w-full sm:w-auto cursor-pointer"
              />

              {/* To Date */}
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                min={fromDate || undefined}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] bg-white w-full sm:w-auto cursor-pointer"
              />

              {/* Search Input */}
              <div className="relative w-full sm:w-48">
                <input
                  type="text"
                  placeholder="Search by Mobile No or Name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-4 pr-10 py-2 w-full text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] bg-white"
                />
                <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
              </div>

              {/* Export Button */}
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
            <table className="min-w-[720px] sm:min-w-full divide-y">
              <thead className="bg-white text-center">
                <tr>
                  <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    ID
                  </th>

                  <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    User
                  </th>

                  <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    User ID
                  </th>
                  <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    Name
                  </th>
                  <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    User Role
                  </th>
                  <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    Mobile No
                  </th>
                  <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    Email Id
                  </th>
                  <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    Parent Name
                  </th>
                  <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    Parent Role
                  </th>
                  <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    Company
                  </th>
                  <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    KYC Status
                  </th>
                  <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    KYC Steps
                  </th>
                  <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    Main Wallet
                  </th>
                  <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    AEPS 1 Status
                  </th>
                  <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    AEPS1 Wallet
                  </th>
                  <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    AEPS2 Wallet
                  </th>
                  <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    Status
                  </th>
                  <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    KYC Details
                  </th>
                  <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    Action
                  </th>
                  <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    Lock Status
                  </th>
                  <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    Onboarding
                  </th>
                  <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    Deactivation
                  </th>
                  <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    Token Expire
                  </th>
                  <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody className="text-center">
                {!displayTableData || displayTableData.length === 0 ? (
                  <tr>
                    <td colSpan={21} className="py-12 text-center">
                      <p className="text-gray-500 text-lg font-[Gilroy-Medium]">
                        No data available
                      </p>
                    </td>
                  </tr>
                ) : (
                  displayTableData.map((row, index) => (
                    <tr
                      key={row.id || index}
                      className={`border-b border-gray-100 ${index % 2 === 0 ? "bg-white" : "bg-green-50"}`}
                    >
                      <td className="py-3 px-4 text-xs text-[#121216] font-[Gilroy-Regular] whitespace-nowrap">
                        {safeString(row.id, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] text-center">
                        <button
                          onClick={() => {
                            const userId = row.id || row.originalItem?.id;
                            if (userId) {
                              // Set role code for ProfileDetails badge (Retailer)
                              const roleFromRow =
                                row.userRole ||
                                row.originalItem?.userRole ||
                                "R";
                              dispatch(setSelectedUserRole(roleFromRow));

                              // Fetch core company admin details
                              dispatch(getCompanyAdmin(userId));

                              // Additionally fetch admin profile details (slab visibility, etc.)
                              dispatch(getAdminProfileDetails(userId));

                              setShowProfileDetails(true);
                            }
                          }}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors cursor-pointer"
                        >
                          <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                        </button>
                      </td>

                      <td className="py-3 px-4 text-xs text-[#121216] font-[Gilroy-Regular] whitespace-nowrap">
                        {safeString(row.userId, "N/A")}
                      </td>
                      <td className="py-3 px-4 text-xs text-[#121216] font-[Gilroy-Regular] whitespace-nowrap">
                        {safeString(row.name, "N/A")}
                      </td>
                      <td className="py-3 px-4 text-xs text-[#121216] font-[Gilroy-Regular] whitespace-nowrap">
                        {safeString(row.userRole, "N/A")}
                      </td>
                      <td className="py-3 px-4 text-xs text-[#121216] font-[Gilroy-Regular] whitespace-nowrap">
                        {safeString(row.mobileNo, "N/A")}
                      </td>
                      <td className="py-3 px-4 text-xs text-[#121216] font-[Gilroy-Regular] whitespace-nowrap">
                        {safeString(row.email, "N/A")}
                      </td>
                      <td className="py-3 px-4 text-xs text-[#121216] font-[Gilroy-Regular] whitespace-nowrap">
                        {safeString(row.parentName, "N/A")}
                      </td>
                      <td className="py-3 px-4 text-xs text-[#121216] font-[Gilroy-Regular] whitespace-nowrap">
                        {safeString(row.parentRole, "N/A")}
                      </td>
                      <td className="py-3 px-4 text-xs text-[#121216] font-[Gilroy-Regular] whitespace-nowrap">
                        {safeString(row.company, "N/A")}
                      </td>
                      <td className="py-3 px-4 text-xs text-[#121216] font-[Gilroy-Regular] whitespace-nowrap">
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
                      <td className="py-3 px-4 text-xs text-[#121216] font-[Gilroy-Regular] whitespace-nowrap text-center">
                        {safeString(row.kycSteps, "0")}
                      </td>
                      <td className="py-3 px-4 text-xs text-[#121216] font-[Gilroy-Regular] whitespace-nowrap text-center">
                        {getWalletValue(row, "mainWallet")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] text-center">
                        {(() => {
                          const userId = row.id || row.originalItem?.id;
                          return (
                            <button
                              onClick={() => {
                                if (userId) {
                                  dispatch(checkAdminAepsStatus(userId));
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
                      <td className="py-3 px-4 text-xs text-[#121216] font-[Gilroy-Regular] whitespace-nowrap text-center">
                        {getWalletValue(row, "apes1Wallet")}
                      </td>
                      <td className="py-3 px-4 text-xs text-[#121216] font-[Gilroy-Regular] whitespace-nowrap text-center">
                        {getWalletValue(row, "apes2Wallet")}
                      </td>
                      <td className="py-3 px-4 text-xs text-[#121216] font-[Gilroy-Regular] whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-lg text-white text-xs font-[Gilroy-Medium] ${row.status?.toLowerCase() === "active"
                            ? "bg-green-600"
                            : "bg-red-600"
                            }`}
                        >
                          {safeString(row.status, "Active")}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-[#121216] font-[Gilroy-Regular] whitespace-nowrap">
                        <button
                          onClick={() => {
                            const userId = row.id || row.originalItem?.id;
                            if (userId) {
                              setSelectedUserId(userId);
                              dispatch(kycDataAction(userId));
                              setShowKycModal(true);
                            }
                          }}
                          className="px-3 py-1 border border-black text-green-600 rounded-lg hover:bg-green-50 text-xs font-[Gilroy-Medium]"
                        >
                          KYC Details
                        </button>
                      </td>
                      {/* Action - Toggle Button */}
                      <td className="py-3 px-4 text-xs text-[#121216] font-[Gilroy-Regular] whitespace-nowrap">
                        {(() => {
                          const userId = row.id || row.originalItem?.id;
                          const isActive =
                            row.status?.toLowerCase() === "active";

                          return (
                            <button
                              onClick={() => {
                                if (userId) {
                                  setConfirmModal({
                                    show: true,
                                    title: isActive ? "Deactivate User?" : "Activate User?",
                                    message: `Are you sure you want to ${isActive ? "deactivate" : "activate"} this user? This will affect their ability to access the platform.`,
                                    type: isActive ? "danger" : "success",
                                    confirmText: isActive ? "Yes, Deactivate" : "Yes, Activate",
                                    onConfirm: () => {
                                      dispatch(kycStatusCheck(userId, { isActive: isActive ? "false" : "true" }));
                                      
                                      // Refresh handling logic is already in useEffect for kycStatusCheckResponse
                                      // But we need to close the modal after a short delay or on response
                                      setConfirmModal(prev => ({ ...prev, isProcessing: true }));
                                      setTimeout(() => {
                                        setConfirmModal({ show: false, isProcessing: false });
                                      }, 800);
                                    }
                                  });
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
                      <td className="py-3 px-4 text-xs text-[#121216] font-[Gilroy-Regular] whitespace-nowrap">
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
                                if (userId && isLocked) {
                                  setConfirmModal({
                                    show: true,
                                    title: "Enable Account Access?",
                                    message: "Are you sure you want to enable access for this account? This will unlock the user's dashboard and services.",
                                    type: "success",
                                    confirmText: "Yes, Enable Access",
                                    onConfirm: () => {
                                      dispatch(kycUnlock(userId));
                                      setConfirmModal(prev => ({ ...prev, isProcessing: true }));
                                      setTimeout(() => {
                                        setConfirmModal({ show: false, isProcessing: false });
                                      }, 800);
                                    }
                                  });
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
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px]">
                        {(() => {
                          const userId = row.id || row.originalItem?.id;
                          return (
                            <button
                              onClick={() => {
                                if (userId) {
                                  setConfirmModal({
                                    show: true,
                                    title: "Resend Onboarding?",
                                    message: "Are you sure you want to resend the onboarding invitation to this user?",
                                    type: "info",
                                    confirmText: "Yes, Resend",
                                    onConfirm: () => {
                                      dispatch(rescendOnboarding(userId));
                                      setConfirmModal(prev => ({ ...prev, isProcessing: true }));
                                      setTimeout(() => {
                                        setConfirmModal({ show: false, isProcessing: false });
                                      }, 800);
                                    }
                                  });
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
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px]">
                        {(() => {
                          const userId = row.id || row.originalItem?.id;
                          return (
                            <button
                              onClick={() => {
                                if (userId) {
                                  setConfirmModal({
                                    show: true,
                                    title: "Send Deactivation Request?",
                                    message: "Are you sure you want to send a deactivation request for this user?",
                                    type: "warning",
                                    confirmText: "Yes, Send",
                                    onConfirm: () => {
                                      dispatch(deActiveOnboarding(userId));
                                      setConfirmModal(prev => ({ ...prev, isProcessing: true }));
                                      setTimeout(() => {
                                        setConfirmModal({ show: false, isProcessing: false });
                                      }, 800);
                                    }
                                  });
                                }
                              }}
                              className="px-3 py-1 border border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 text-xs font-[Gilroy-Medium] transition-colors"
                            >
                              Send
                            </button>
                          );
                        })()}
                      </td>
                      <td className="py-3 px-4 text-xs text-[#121216] font-[Gilroy-Regular] whitespace-nowrap">
                        {formatDate(row.onboardingTokenExpiresAt)}
                      </td>
                      <td className="py-3 px-4 text-xs text-[#121216] font-[Gilroy-Regular] whitespace-nowrap">
                        {formatDate(row.date)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center mt-auto pt-6 pb-4">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1 || finalTotalPages === 0}
              className={`p-2 rounded-lg border border-gray-300 transition ${currentPage === 1 || finalTotalPages === 0
                ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
                : "bg-whixs text-[#121216] font-[Gilroy-Regular] hover:bg-gray-50"
                }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {finalTotalPages > 0 ? (
              Array.from({ length: finalTotalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg font-[Gilroy-Medium] transition ${page === currentPage
                      ? "bg-[#039155] text-white"
                      : "bg-white border border-gray-300 text-[#1B1717] hover:bg-gray-50"
                      }`}
                  >
                    {page}
                  </button>
                ),
              )
            ) : (
              <span className="w-10 h-10 rounded-lg font-[Gilroy-Medium] flex items-center justify-center text-gray-500">
                0
              </span>
            )}
            <button
              onClick={() =>
                setCurrentPage(Math.min(finalTotalPages, currentPage + 1))
              }
              disabled={
                currentPage === finalTotalPages || finalTotalPages === 0
              }
              className={`p-2 rounded-lg border border-gray-300 transition ${currentPage === finalTotalPages || finalTotalPages === 0
                ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
                : "bg-white text-[#1B1717] hover:bg-gray-50"
                }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 flex flex-col min-h-[calc(100vh-300px)]">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-lg sm:text-2xl lg:text-2xl font-[Gilroy-Medium] text-[#1B1717]">
              Retailer Onboarding List
            </h1>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* From Date */}
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] bg-white w-full sm:w-auto cursor-pointer"
              />

              {/* To Date */}
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                min={fromDate || undefined}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] bg-white w-full sm:w-auto cursor-pointer"
              />

              {/* Search Input */}
              <div className="relative w-full sm:w-48">
                <input
                  type="text"
                  placeholder="Search by Mobile No or Name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-4 pr-10 py-2 w-full text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] bg-white"
                />
                <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
              </div>

              {/* Export Button */}
              <button
                onClick={handleExportToExcel}
                className="flex items-center justify-center gap-2 bg-[#039155] text-white px-4 py-2 rounded-lg font-[Gilroy-Medium] hover:bg-green-700 shadow-md text-sm"
              >
                Export
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 mb-4 overflow-x-auto rounded-3xl bg-white [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <table className="min-w-[720px] sm:min-w-full divide-y">
              <thead className="bg-white text-center">
                <tr>
                  <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    ID
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    User
                  </th>

                  <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    User ID
                  </th>
                  <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    Name
                  </th>
                  <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    User Role
                  </th>
                  <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    Mobile No
                  </th>
                  <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    Email Id
                  </th>
                  <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    Parent Name
                  </th>
                  <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    Parent Role
                  </th>
                  <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    Company
                  </th>
                  <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    KYC Status
                  </th>
                  <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    KYC Steps
                  </th>
                  <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    Main Wallet
                  </th>
                  <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    AEPS 1 Status
                  </th>
                  <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    AEPS1 Wallet
                  </th>
                  <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    AEPS2 Wallet
                  </th>
                  <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    Status
                  </th>
                  <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    KYC Details
                  </th>
                  <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    Action
                  </th>
                  <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    Lock Status
                  </th>
                  <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    Onboarding
                  </th>
                  <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    Deactivation
                  </th>
                  <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    Token Expire
                  </th>
                  <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {!displayTableData || displayTableData.length === 0 ? (
                  <tr>
                    <td colSpan={21} className="py-12 text-center">
                      <p className="text-gray-500 text-lg font-[Gilroy-Medium]">
                        No data available
                      </p>
                    </td>
                  </tr>
                ) : (
                  displayTableData.map((row, index) => (
                    <tr
                      key={row.id || index}
                      className={`border-b border-gray-100 ${index % 2 === 0 ? "bg-white" : "bg-green-50"}`}
                    >
                      <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                        {safeString(row.id, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] text-center">
                        <button
                          onClick={() => {
                            const userId = row.id || row.originalItem?.id;
                            if (userId) {
                              // Fetch core company admin details
                              dispatch(getCompanyAdmin(userId));

                              // Additionally fetch admin profile details (slab visibility, etc.)
                              dispatch(getAdminProfileDetails(userId));

                              setShowProfileDetails(true);
                            }
                          }}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors cursor-pointer"
                        >
                          <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                        </button>
                      </td>

                      <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                        {safeString(row.userId, "N/A")}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                        {safeString(row.name, "N/A")}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                        {safeString(row.userRole, "N/A")}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                        {safeString(row.mobileNo, "N/A")}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                        {safeString(row.email, "N/A")}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                        {safeString(row.parentName, "N/A")}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                        {safeString(row.parentRole, "N/A")}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                        {safeString(row.company, "N/A")}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
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
                      <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap text-center">
                        {safeString(row.kycSteps, "0")}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap text-center">
                        {getWalletValue(row.wallet, "mainWallet")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] text-center">
                        {(() => {
                          const userId = row.id || row.originalItem?.id;
                          return (
                            <button
                              onClick={() => {
                                if (userId) {
                                  dispatch(checkAdminAepsStatus(userId));
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
                      <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap text-center">
                        {getWalletValue(row.wallet, "apes1Wallet")}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap text-center">
                        {getWalletValue(row.wallet, "apes2Wallet")}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-lg text-white text-xs font-[Gilroy-Medium] ${row.status?.toLowerCase() === "active"
                            ? "bg-green-600"
                            : "bg-red-600"
                            }`}
                        >
                          {safeString(row.status, "Active")}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                        <button
                          onClick={() => {
                            const userId = row.id || row.originalItem?.id;
                            if (userId) {
                              dispatch(kycDataAction(userId));
                              setShowKycModal(true);
                            }
                          }}
                          className="px-3 py-1 border border-black text-green-600 rounded-lg hover:bg-green-50 text-xs font-[Gilroy-Medium]"
                        >
                          KYC Details
                        </button>
                      </td>
                      {/* Action - Toggle Button */}
                      <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                        {(() => {
                          const userId = row.id || row.originalItem?.id;
                          const isActive =
                            row.status?.toLowerCase() === "active";

                          return (
                            <button
                              onClick={() => {
                                if (userId) {
                                  setConfirmModal({
                                    show: true,
                                    title: isActive ? "Deactivate User?" : "Activate User?",
                                    message: `Are you sure you want to ${isActive ? "deactivate" : "activate"} this user? This will affect their ability to access the platform.`,
                                    type: isActive ? "danger" : "success",
                                    confirmText: isActive ? "Yes, Deactivate" : "Yes, Activate",
                                    onConfirm: () => {
                                      dispatch(kycStatusCheck(userId, { isActive: isActive ? "false" : "true" }));
                                      setConfirmModal(prev => ({ ...prev, isProcessing: true }));
                                      setTimeout(() => {
                                        setConfirmModal({ show: false, isProcessing: false });
                                      }, 800);
                                    }
                                  });
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
                      <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                        {(() => {
                          const userId = row.id || row.originalItem?.id;
                          const lockValue =
                            row?.lock !== undefined && row?.lock !== null
                              ? row.lock
                              : row?.originalItem?.lock !== undefined && row?.originalItem?.lock !== null
                                ? row.originalItem.lock
                                : row?.isLocked !== undefined && row?.isLocked !== null
                                  ? row.isLocked
                                  : row?.lockStatus;
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
                                if (userId && isLocked) {
                                  setConfirmModal({
                                    show: true,
                                    title: "Enable Account Access?",
                                    message: "Are you sure you want to enable access for this account? This will unlock the user's dashboard and services.",
                                    type: "success",
                                    confirmText: "Yes, Enable Access",
                                    onConfirm: () => {
                                      dispatch(kycUnlock(userId));
                                      setConfirmModal(prev => ({ ...prev, isProcessing: true }));
                                      setTimeout(() => {
                                        setConfirmModal({ show: false, isProcessing: false });
                                      }, 800);
                                    }
                                  });
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
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px]">
                        {(() => {
                          const userId = row.id || row.originalItem?.id;
                          return (
                            <button
                              onClick={() => {
                                if (userId) {
                                  setConfirmModal({
                                    show: true,
                                    title: "Resend Onboarding?",
                                    message: "Are you sure you want to resend the onboarding invitation to this user?",
                                    type: "info",
                                    confirmText: "Yes, Resend",
                                    onConfirm: () => {
                                      dispatch(rescendOnboarding(userId));
                                      setConfirmModal(prev => ({ ...prev, isProcessing: true }));
                                      setTimeout(() => {
                                        setConfirmModal({ show: false, isProcessing: false });
                                      }, 800);
                                    }
                                  });
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
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px]">
                        {(() => {
                          const userId = row.id || row.originalItem?.id;
                          return (
                            <button
                              onClick={() => {
                                if (userId) {
                                  setConfirmModal({
                                    show: true,
                                    title: "Send Deactivation Request?",
                                    message: "Are you sure you want to send a deactivation request for this user?",
                                    type: "warning",
                                    confirmText: "Yes, Send",
                                    onConfirm: () => {
                                      dispatch(deActiveOnboarding(userId));
                                      setConfirmModal(prev => ({ ...prev, isProcessing: true }));
                                      setTimeout(() => {
                                        setConfirmModal({ show: false, isProcessing: false });
                                      }, 800);
                                    }
                                  });
                                }
                              }}
                              className="px-3 py-1 border border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 text-xs font-[Gilroy-Medium] transition-colors"
                            >
                              Send
                            </button>
                          );
                        })()}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                        {formatDate(row.onboardingTokenExpiresAt)}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                        {formatDate(row.date)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center mt-auto pt-6 pb-4">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1 || finalTotalPages === 0}
              className={`p-2 rounded-lg border border-gray-300 transition ${currentPage === 1 || finalTotalPages === 0
                ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
                : "bg-white text-[#1B1717] hover:bg-gray-50"
                }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {finalTotalPages > 0 ? (
              Array.from({ length: finalTotalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg font-[Gilroy-Medium] transition ${page === currentPage
                      ? "bg-[#039155] text-white"
                      : "bg-white border border-gray-300 text-[#1B1717] hover:bg-gray-50"
                      }`}
                  >
                    {page}
                  </button>
                ),
              )
            ) : (
              <span className="w-10 h-10 rounded-lg font-[Gilroy-Medium] flex items-center justify-center text-gray-500">
                0
              </span>
            )}
            <button
              onClick={() =>
                setCurrentPage(Math.min(finalTotalPages, currentPage + 1))
              }
              disabled={
                currentPage === finalTotalPages || finalTotalPages === 0
              }
              className={`p-2 rounded-lg border border-gray-300 transition ${currentPage === finalTotalPages || finalTotalPages === 0
                ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
                : "bg-white text-[#1B1717] hover:bg-gray-50"
                }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* KYC Details Modal */}
      {showKycModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div
            ref={kycModalRef}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden animate-slideUp [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <FaIdCard className="text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-[Gilroy-Semibold] text-gray-800">
                    KYC Details
                  </h2>
                  {selectedKycData?.userDetails?.name && (
                    <p className="text-sm text-gray-500">
                      {selectedKycData.userDetails.name}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  setShowKycModal(false);
                  setSelectedKycData(null);
                  setSelectedUserId(null);
                  setActiveTab("overview");
                  setZoomedImage(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors hover:bg-gray-100 rounded-full p-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Tab Navigation */}
            {selectedKycData && (
              <div className="flex border-b border-gray-200 bg-gray-50 px-6">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`px-4 py-3 text-sm font-[Gilroy-Medium] transition-colors relative ${activeTab === "overview"
                    ? "text-green-600 border-b-2 border-green-600"
                    : "text-gray-600 hover:text-gray-800"
                    }`}
                >
                  Overview
                </button>

                <button
                  onClick={() => setActiveTab("aadhar")}
                  className={`px-4 py-3 text-sm font-[Gilroy-Medium] transition-colors relative ${activeTab === "aadhar"
                    ? "text-green-600 border-b-2 border-green-600"
                    : "text-gray-600 hover:text-gray-800"
                    }`}
                >
                  Aadhar Document
                </button>
                <button
                  onClick={() => setActiveTab("pan")}
                  className={`px-4 py-3 text-sm font-[Gilroy-Medium] transition-colors relative ${activeTab === "pan"
                    ? "text-green-600 border-b-2 border-green-600"
                    : "text-gray-600 hover:text-gray-800"
                    }`}
                >
                  PAN Document
                </button>
                <button
                  onClick={() => setActiveTab("details")}
                  className={`px-4 py-3 text-sm font-[Gilroy-Medium] transition-colors relative ${activeTab === "details"
                    ? "text-green-600 border-b-2 border-green-600"
                    : "text-gray-600 hover:text-gray-800"
                    }`}
                >
                  Outlet Details
                </button>
                <button
                  onClick={() => setActiveTab("bankDetails")}
                  className={`px-4 py-3 text-sm font-[Gilroy-Medium] transition-colors relative ${activeTab === "bankDetails"
                    ? "text-green-600 border-b-2 border-green-600"
                    : "text-gray-600 hover:text-gray-800"
                    }`}
                >
                  Bank Details
                </button>
                <button
                  onClick={() => setActiveTab("verification")}
                  className={`px-4 py-3 text-sm font-[Gilroy-Medium] transition-colors relative ${activeTab === "verification"
                    ? "text-green-600 border-b-2 border-green-600"
                    : "text-gray-600 hover:text-gray-800"
                    }`}
                >
                  Verification
                </button>
              </div>
            )}

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-250px)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {selectedKycData ? (
                <div className="space-y-6 animate-fadeIn">
                  {/* Overview Tab */}
                  {activeTab === "overview" && (
                    <div className="space-y-6">
                      {/* KYC Status Card */}
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-100">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-[Gilroy-Semibold] text-gray-800 flex items-center gap-2">
                            <FaIdCard className="text-green-600" />
                            KYC Status
                          </h3>
                          <span
                            className={`px-4 py-2 rounded-full text-sm font-[Gilroy-Semibold] ${selectedKycData.kycStatus === "FULL_KYC"
                              ? "bg-green-100 text-green-700"
                              : selectedKycData.kycStatus === "NO_KYC"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                              }`}
                          >
                            {selectedKycData.kycStatus || "N/A"}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-[Gilroy-Medium] text-gray-700">
                              Progress
                            </span>
                            <span className="text-sm font-[Gilroy-Semibold] text-gray-800">
                              {selectedKycData.completedSteps ||
                                selectedKycData.kycSteps ||
                                0}{" "}
                              / {selectedKycData.totalSteps || 7} Steps
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500 ease-out"
                              style={{
                                width: `${((selectedKycData.completedSteps || selectedKycData.kycSteps || 0) / (selectedKycData.totalSteps || 7)) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* User Details Card */}
                      {selectedKycData.userDetails && (
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                          <h3 className="text-lg font-[Gilroy-Semibold] text-gray-800 mb-4 flex items-center gap-2">
                            <FaUser className="text-green-600" />
                            User Details
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">
                                User ID
                              </span>
                              <span className="text-sm font-[Gilroy-Medium] text-gray-800">
                                {selectedKycData.userDetails.userId || "N/A"}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">
                                Name
                              </span>
                              <span className="text-sm font-[Gilroy-Medium] text-gray-800">
                                {selectedKycData.userDetails.name || "N/A"}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">
                                Mobile No
                              </span>
                              <span className="text-sm font-[Gilroy-Medium] text-gray-800">
                                {selectedKycData.userDetails.mobileNo || "N/A"}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">
                                Email
                              </span>
                              <span className="text-sm font-[Gilroy-Medium] text-gray-800">
                                {selectedKycData.userDetails.email || "N/A"}
                              </span>
                            </div>
                          </div>
                          {selectedKycData.userDetails.profileImage && (
                            <div className="mt-4">
                              <span className="text-xs text-gray-500 mb-2 block">
                                Profile Image
                              </span>
                              <div className="relative group">
                                <img
                                  src={selectedKycData.userDetails.profileImage}
                                  alt="Profile"
                                  className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:border-green-500 transition-colors"
                                  onClick={() =>
                                    setZoomedImage(
                                      selectedKycData.userDetails.profileImage,
                                    )
                                  }
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg flex items-center justify-center transition-opacity">
                                  <FaExpand className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Aadhar Document Tab */}
                  {activeTab === "aadhar" && (
                    <div className="space-y-6">
                      {selectedKycData.aadhaarDoc ? (
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-[Gilroy-Semibold] text-gray-800 flex items-center gap-2">
                              <FaIdCard className="text-blue-600" />
                              Aadhaar Document
                            </h3>
                            {selectedUserId && (
                              <button
                                onClick={() => {
                                  setRevertPayload({ aadhar: "true", step: "Aadhar" });
                                  setShowRevertConfirm(true);
                                }}
                                className="px-4 py-1.5 border-2 border-red-100 text-red-600 bg-white rounded-xl hover:bg-red-50 hover:border-red-200 transition-all text-xs font-[Gilroy-Semibold] flex items-center gap-2 shadow-sm"
                              >
                                <X className="w-3.5 h-3.5" />
                                Revert Aadhar
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">
                                Name
                              </span>
                              <span className="text-sm font-[Gilroy-Medium] text-gray-800">
                                {selectedKycData.aadhaarDoc.name || "N/A"}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">
                                UID
                              </span>
                              <span className="text-sm font-[Gilroy-Medium] text-gray-800">
                                {selectedKycData.aadhaarDoc.uid || "N/A"}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">
                                DOB
                              </span>
                              <span className="text-sm font-[Gilroy-Medium] text-gray-800">
                                {selectedKycData.aadhaarDoc.dob || "N/A"}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">
                                Status
                              </span>
                              <span
                                className={`px-3 py-1 rounded-lg text-xs font-[Gilroy-Semibold] inline-block w-fit ${selectedKycData.aadhaarDoc.status ===
                                  "Success"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                                  }`}
                              >
                                {selectedKycData.aadhaarDoc.status || "N/A"}
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedKycData.userDetails?.aadharFrontImage && (
                              <div>
                                <span className="text-xs text-gray-500 mb-2 block">
                                  Aadhaar Front
                                </span>
                                <div className="relative group">
                                  <img
                                    src={
                                      selectedKycData.userDetails
                                        .aadharFrontImage
                                    }
                                    alt="Aadhaar Front"
                                    className="w-full h-48 object-contain rounded-lg border-2 border-gray-200 cursor-pointer hover:border-green-500 transition-colors"
                                    onClick={() =>
                                      setZoomedImage(
                                        selectedKycData.userDetails
                                          .aadharFrontImage,
                                      )
                                    }
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg flex items-center justify-center transition-opacity">
                                    <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8" />
                                  </div>
                                </div>
                              </div>
                            )}
                            {selectedKycData.userDetails?.aadharBackImage && (
                              <div>
                                <span className="text-xs text-gray-500 mb-2 block">
                                  Aadhaar Back
                                </span>
                                <div className="relative group">
                                  <img
                                    src={
                                      selectedKycData.userDetails
                                        .aadharBackImage
                                    }
                                    alt="Aadhaar Back"
                                    className="w-full h-48 object-contain rounded-lg border-2 border-gray-200 cursor-pointer hover:border-green-500 transition-colors"
                                    onClick={() =>
                                      setZoomedImage(
                                        selectedKycData.userDetails
                                          .aadharBackImage,
                                      )
                                    }
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg flex items-center justify-center transition-opacity">
                                    <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8" />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>No Aadhaar Document available</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* PAN Document Tab */}
                  {activeTab === "pan" && (
                    <div className="space-y-6">
                      {selectedKycData.panDoc ? (
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-[Gilroy-Semibold] text-gray-800 flex items-center gap-2">
                              <FaIdCard className="text-purple-600" />
                              PAN Document
                            </h3>
                            {selectedUserId && (
                              <button
                                onClick={() => {
                                  setRevertPayload({ pan: "true", step: "PAN" });
                                  setShowRevertConfirm(true);
                                }}
                                className="px-4 py-1.5 border-2 border-red-100 text-red-600 bg-white rounded-xl hover:bg-red-50 hover:border-red-200 transition-all text-xs font-[Gilroy-Semibold] flex items-center gap-2 shadow-sm"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                Revert PAN
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">
                                PAN Number
                              </span>
                              <span className="text-sm font-[Gilroy-Medium] text-gray-800">
                                {selectedKycData.panDoc.panNumber || "N/A"}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">
                                PAN Name
                              </span>
                              <span className="text-sm font-[Gilroy-Medium] text-gray-800">
                                {selectedKycData.panDoc.panName || "N/A"}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">
                                DOB
                              </span>
                              <span className="text-sm font-[Gilroy-Medium] text-gray-800">
                                {selectedKycData.panDoc.panDob || "N/A"}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">
                                Status
                              </span>
                              <span
                                className={`px-3 py-1 rounded-lg text-xs font-[Gilroy-Semibold] inline-block w-fit ${selectedKycData.panDoc.status === "Success"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                                  }`}
                              >
                                {selectedKycData.panDoc.status || "N/A"}
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedKycData.userDetails?.panCardFrontImage && (
                              <div>
                                <span className="text-xs text-gray-500 mb-2 block">
                                  PAN Front
                                </span>
                                <div className="relative group">
                                  <img
                                    src={
                                      selectedKycData.userDetails
                                        .panCardFrontImage
                                    }
                                    alt="PAN Front"
                                    className="w-full h-48 object-contain rounded-lg border-2 border-gray-200 cursor-pointer hover:border-green-500 transition-colors"
                                    onClick={() =>
                                      setZoomedImage(
                                        selectedKycData.userDetails
                                          .panCardFrontImage,
                                      )
                                    }
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg flex items-center justify-center transition-opacity">
                                    <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8" />
                                  </div>
                                </div>
                              </div>
                            )}
                            {selectedKycData.userDetails?.panCardBackImage && (
                              <div>
                                <span className="text-xs text-gray-500 mb-2 block">
                                  PAN Back
                                </span>
                                <div className="relative group">
                                  <img
                                    src={
                                      selectedKycData.userDetails
                                        .panCardBackImage
                                    }
                                    alt="PAN Back"
                                    className="w-full h-48 object-contain rounded-lg border-2 border-gray-200 cursor-pointer hover:border-green-500 transition-colors"
                                    onClick={() =>
                                      setZoomedImage(
                                        selectedKycData.userDetails
                                          .panCardBackImage,
                                      )
                                    }
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg flex items-center justify-center transition-opacity">
                                    <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8" />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>No PAN Document available</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Additional Details Tab */}
                  {activeTab === "details" && (
                    <div className="space-y-6">
                      {/* Outlet Details */}
                      {selectedKycData.outletDetails && (
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-[Gilroy-Semibold] text-gray-800 flex items-center gap-2">
                              <FaBuilding className="text-orange-600" />
                              Outlet Details
                            </h3>
                            {selectedUserId && (
                              <button
                                onClick={() => {
                                  setRevertPayload({ shopImage: "true", step: "Outlet" });
                                  setShowRevertConfirm(true);
                                }}
                                className="px-4 py-1.5 border-2 border-red-100 text-red-600 bg-white rounded-xl hover:bg-red-50 hover:border-red-200 transition-all text-xs font-[Gilroy-Semibold] flex items-center gap-2 shadow-sm"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                Revert Outlet
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">
                                Shop Name
                              </span>
                              <span className="text-sm font-[Gilroy-Medium] text-gray-800">
                                {selectedKycData.outletDetails.shopName ||
                                  "N/A"}
                              </span>
                            </div>
                            {selectedKycData.outletDetails.gstNo && (
                              <div className="flex flex-col">
                                <span className="text-xs text-gray-500 mb-1">
                                  GST No
                                </span>
                                <span className="text-sm font-[Gilroy-Medium] text-gray-800">
                                  {selectedKycData.outletDetails.gstNo}
                                </span>
                              </div>
                            )}
                            <div className="flex flex-col md:col-span-2">
                              <span className="text-xs text-gray-500 mb-1">
                                Shop Address
                              </span>
                              <span className="text-sm font-[Gilroy-Medium] text-gray-800">
                                {selectedKycData.outletDetails.shopAddress ||
                                  "N/A"}
                              </span>
                            </div>
                            {selectedKycData.outletDetails.shopImage && (
                              <div className="md:col-span-2">
                                <span className="text-xs text-gray-500 mb-2 block">
                                  Shop Image
                                </span>
                                <div className="relative group">
                                  <img
                                    src={
                                      selectedKycData.outletDetails.shopImage
                                    }
                                    alt="Shop"
                                    className="w-full max-w-md h-64 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:border-green-500 transition-colors"
                                    onClick={() =>
                                      setZoomedImage(
                                        selectedKycData.outletDetails.shopImage,
                                      )
                                    }
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg flex items-center justify-center transition-opacity">
                                    <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8" />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bank Details Tab */}
                  {activeTab === "bankDetails" && (
                    <div className="space-y-6">
                      {selectedKycData.customerBankDetails ? (
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-[Gilroy-Semibold] text-gray-800 flex items-center gap-2">
                              <FaUniversity className="text-indigo-600" />
                              Bank Details
                            </h3>
                            {selectedUserId && (
                              <button
                                onClick={() => {
                                  setRevertPayload({ bankVerification: "true", step: "Bank Details" });
                                  setShowRevertConfirm(true);
                                }}
                                className="px-4 py-1.5 border-2 border-red-100 text-red-600 bg-white rounded-xl hover:bg-red-50 hover:border-red-200 transition-all text-xs font-[Gilroy-Semibold] flex items-center gap-2 shadow-sm"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                Revert Bank
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">
                                Account Number
                              </span>
                              <span className="text-sm font-[Gilroy-Medium] text-gray-800">
                                {selectedKycData.customerBankDetails
                                  .accountNumber || "N/A"}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">
                                IFSC
                              </span>
                              <span className="text-sm font-[Gilroy-Medium] text-gray-800">
                                {selectedKycData.customerBankDetails.ifsc ||
                                  "N/A"}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">
                                Bank Name
                              </span>
                              <span className="text-sm font-[Gilroy-Medium] text-gray-800">
                                {selectedKycData.customerBankDetails.bankName ||
                                  "N/A"}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">
                                Beneficiary Name
                              </span>
                              <span className="text-sm font-[Gilroy-Medium] text-gray-800">
                                {selectedKycData.customerBankDetails
                                  .beneficiaryName || "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>No Bank Details available</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Verification Tab */}
                  {activeTab === "verification" &&
                    selectedKycData.userDetails && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-[Gilroy-Semibold] text-gray-800 mb-4 flex items-center gap-2">
                          <FaCheckCircle className="text-green-600" />
                          Verification Status
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Mobile Verify */}
                          <div
                            className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${selectedKycData.userDetails.mobileVerify
                              ? "bg-green-50 border-green-200"
                              : "bg-red-50 border-red-200"
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              {selectedKycData.userDetails.mobileVerify ? (
                                <CheckCircle2 className="text-green-600 w-5 h-5" />
                              ) : (
                                <ShieldAlert className="text-red-600 w-5 h-5" />
                              )}
                              <span className="text-sm font-[Gilroy-Medium] text-gray-700">
                                Mobile
                              </span>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-[Gilroy-Semibold] ${selectedKycData.userDetails.mobileVerify
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                                }`}
                            >
                              {selectedKycData.userDetails.mobileVerify
                                ? "Verified"
                                : "Pending"}
                            </span>
                          </div>

                          {/* Email Verify */}
                          <div
                            className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${selectedKycData.userDetails.emailVerify
                              ? "bg-green-50 border-green-200"
                              : "bg-red-50 border-red-200"
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              {selectedKycData.userDetails.emailVerify ? (
                                <CheckCircle2 className="text-green-600 w-5 h-5" />
                              ) : (
                                <ShieldAlert className="text-red-600 w-5 h-5" />
                              )}
                              <span className="text-sm font-[Gilroy-Medium] text-gray-700">
                                Email
                              </span>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-[Gilroy-Semibold] ${selectedKycData.userDetails.emailVerify
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                                }`}
                            >
                              {selectedKycData.userDetails.emailVerify
                                ? "Verified"
                                : "Pending"}
                            </span>
                          </div>

                          {/* Aadhar Verify */}
                          <div
                            className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${selectedKycData.userDetails.aadharVerify
                              ? "bg-green-50 border-green-200"
                              : "bg-red-50 border-red-200"
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              {selectedKycData.userDetails.aadharVerify ? (
                                <CheckCircle2 className="text-green-600 w-5 h-5" />
                              ) : (
                                <ShieldAlert className="text-red-600 w-5 h-5" />
                              )}
                              <span className="text-sm font-[Gilroy-Medium] text-gray-700">
                                Aadhar
                              </span>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-[Gilroy-Semibold] ${selectedKycData.userDetails.aadharVerify
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                                }`}
                            >
                              {selectedKycData.userDetails.aadharVerify
                                ? "Verified"
                                : "Pending"}
                            </span>
                          </div>

                          {/* PAN Verify */}
                          <div
                            className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${selectedKycData.userDetails.panVerify
                              ? "bg-green-50 border-green-200"
                              : "bg-red-50 border-red-200"
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              {selectedKycData.userDetails.panVerify ? (
                                <CheckCircle2 className="text-green-600 w-5 h-5" />
                              ) : (
                                <ShieldAlert className="text-red-600 w-5 h-5" />
                              )}
                              <span className="text-sm font-[Gilroy-Medium] text-gray-700">
                                PAN
                              </span>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-[Gilroy-Semibold] ${selectedKycData.userDetails.panVerify
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                                }`}
                            >
                              {selectedKycData.userDetails.panVerify
                                ? "Verified"
                                : "Pending"}
                            </span>
                          </div>

                          {/* Shop Details Verify */}
                          <div
                            className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${selectedKycData.userDetails.shopDetailsVerify
                              ? "bg-green-50 border-green-200"
                              : "bg-red-50 border-red-200"
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              {selectedKycData.userDetails.shopDetailsVerify ? (
                                <CheckCircle2 className="text-green-600 w-5 h-5" />
                              ) : (
                                <ShieldAlert className="text-red-600 w-5 h-5" />
                              )}
                              <span className="text-sm font-[Gilroy-Medium] text-gray-700">
                                Shop Details
                              </span>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-[Gilroy-Semibold] ${selectedKycData.userDetails.shopDetailsVerify
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                                }`}
                            >
                              {selectedKycData.userDetails.shopDetailsVerify
                                ? "Verified"
                                : "Pending"}
                            </span>
                          </div>

                          {/* Image Verify */}
                          <div
                            className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${selectedKycData.userDetails.imageVerify
                              ? "bg-green-50 border-green-200"
                              : "bg-red-50 border-red-200"
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              {selectedKycData.userDetails.imageVerify ? (
                                <CheckCircle2 className="text-green-600 w-5 h-5" />
                              ) : (
                                <ShieldAlert className="text-red-600 w-5 h-5" />
                              )}
                              <span className="text-sm font-[Gilroy-Medium] text-gray-700">
                                Image
                              </span>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-[Gilroy-Semibold] ${selectedKycData.userDetails.imageVerify
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                                }`}
                            >
                              {selectedKycData.userDetails.imageVerify
                                ? "Verified"
                                : "Pending"}
                            </span>
                          </div>

                          {/* Profile Image with Shop Verify */}
                          <div
                            className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${selectedKycData.userDetails
                              .profileImageWithShopVerify
                              ? "bg-green-50 border-green-200"
                              : "bg-red-50 border-red-200"
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              {selectedKycData.userDetails
                                .profileImageWithShopVerify ? (
                                <CheckCircle2 className="text-green-600 w-5 h-5" />
                              ) : (
                                <ShieldAlert className="text-red-600 w-5 h-5" />
                              )}
                              <span className="text-sm font-[Gilroy-Medium] text-gray-700">
                                Profile with Shop
                              </span>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-[Gilroy-Semibold] ${selectedKycData.userDetails
                                .profileImageWithShopVerify
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                                }`}
                            >
                              {selectedKycData.userDetails
                                .profileImageWithShopVerify
                                ? "Verified"
                                : "Pending"}
                            </span>
                          </div>

                          {/* Bank Details Verify */}
                          <div
                            className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${selectedKycData.userDetails.bankDetailsVerify
                              ? "bg-green-50 border-green-200"
                              : "bg-red-50 border-red-200"
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              {selectedKycData.userDetails.bankDetailsVerify ? (
                                <CheckCircle2 className="text-green-600 w-5 h-5" />
                              ) : (
                                <ShieldAlert className="text-red-600 w-5 h-5" />
                              )}
                              <span className="text-sm font-[Gilroy-Medium] text-gray-700">
                                Bank Details
                              </span>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-[Gilroy-Semibold] ${selectedKycData.userDetails.bankDetailsVerify
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                                }`}
                            >
                              {selectedKycData.userDetails.bankDetailsVerify
                                ? "Verified"
                                : "Pending"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No KYC details available</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setShowKycModal(false);
                  setSelectedKycData(null);
                  setSelectedUserId(null);
                  setActiveTab("overview");
                  setZoomedImage(null);
                }}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-[Gilroy-Medium] shadow-md hover:shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Zoom Modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] animate-fadeIn"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative max-w-7xl max-h-[90vh] p-4">
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-2 z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={zoomedImage}
              alt="Zoomed"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Simple Professional Confirmation Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-[120] animate-fadeIn p-4 overflow-y-auto font-[Gilroy]">
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-xl w-full max-w-[400px] overflow-hidden animate-slideUp border border-slate-200"
          >
            <div className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                  confirmModal.type === 'danger' ? 'bg-red-50 text-red-600' :
                  confirmModal.type === 'success' ? 'bg-green-50 text-green-600' :
                  'bg-blue-50 text-blue-600'
                }`}>
                  {confirmModal.type === 'danger' ? <ShieldAlert className="w-6 h-6" /> :
                   confirmModal.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> :
                   <Info className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">
                    {confirmModal.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {confirmModal.message}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setConfirmModal({ ...confirmModal, show: false })}
                  disabled={confirmModal.isProcessing}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  {confirmModal.cancelText || 'Cancel'}
                </button>
                <button
                  onClick={confirmModal.onConfirm}
                  disabled={confirmModal.isProcessing}
                  className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 flex items-center gap-2 ${
                    confirmModal.type === 'danger' ? 'bg-red-600 hover:bg-red-700' :
                    confirmModal.type === 'success' ? 'bg-green-600 hover:bg-green-700' :
                    'bg-slate-900 hover:bg-slate-800'
                  }`}
                >
                  {confirmModal.isProcessing && <ButtonLoader size={14} color="#ffffff" />}
                  {confirmModal.confirmText || 'Continue'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revert Confirmation Modal */}
      {showRevertConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[110] animate-fadeIn p-4">
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 overflow-hidden animate-slideUp"
          >
            <div className="p-6">
              <div className="flex items-start gap-4 mb-2">
                <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center shrink-0 mt-0.5 border border-red-100">
                  <RotateCcw className="text-red-600 w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-[Gilroy-Semibold] text-gray-900 mb-1">
                    Revert {revertPayload?.step}?
                  </h3>
                  <p className="text-gray-500 text-sm font-[Gilroy-Medium] leading-relaxed">
                    This will notify the user to re-upload their {revertPayload?.step} document for verification.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowRevertConfirm(false);
                    setRevertPayload(null);
                  }}
                  disabled={isReverting}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-[Gilroy-Medium] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (selectedUserId && revertPayload) {
                      setIsReverting(true);
                      const { step, ...apiPayload } = revertPayload;
                      dispatch(kycRevert(selectedUserId, apiPayload));
                    }
                  }}
                  disabled={isReverting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-[Gilroy-Medium] disabled:opacity-50 flex items-center justify-center min-w-[90px] shadow-sm"
                >
                  {isReverting ? (
                    <ButtonLoader size={16} color="#ffffff" />
                  ) : (
                    "Revert"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add CSS animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default RetailerOnboarding;
