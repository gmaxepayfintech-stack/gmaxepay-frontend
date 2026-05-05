import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  User,
  X,
  ZoomIn,
  ShieldAlert,
  CheckCircle2,
  Info,
  RotateCcw,
} from "lucide-react";
import {
  FaUpload,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import {
  kycData as kycDataAction,
  kycStatusCheck,
  kycUnlock,
  useList as useListAction,
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
import KycModal from "./KycModal";

const DistrubtionOnboarding = ({
  embedded = false,
  tableData: propTableData = [],
}) => {
  // Format date from API
  const formatDate = (dateString) => {
    if (!dateString || dateString === "" || dateString === "null") return "N/A";

    // Handle DD-MM-YYYY or DD/MM/YYYY formats manually
    if (
      typeof dateString === "string" &&
      (dateString.includes("-") || dateString.includes("/"))
    ) {
      const parts = dateString.split(/[-/]/);
      if (parts.length === 3 && parts[0].length <= 2 && parts[2].length === 4) {
        // Already in a display format, just ensure it uses hyphens
        return parts.join("-");
      }
    }

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "N/A";
      }
      return date.toLocaleDateString("en-GB").replaceAll("/", "-");
    } catch {
      return "N/A";
    }
  };

  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedKyc, setSelectedKyc] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [debouncedFromDate, setDebouncedFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [debouncedToDate, setDebouncedToDate] = useState("");
  const [showKycModal, setShowKycModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [zoomedImage, setZoomedImage] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [kycDataRefreshKey, setKycDataRefreshKey] = useState(0);
  const [showRevertConfirm, setShowRevertConfirm] = useState(false);
  const [revertPayload, setRevertPayload] = useState(null);
  const [isReverting, setIsReverting] = useState(false);
  const [showProfileDetails, setShowProfileDetails] = useState(false);

  const kycModalRef = useRef(null);

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
          userRole: 4, // Distributor role
          ...(selectedKyc ? { kycStatus: selectedKyc } : { kycStatus: "pending" }),
          ...(bothDatesSelected ? { startDate: debouncedFromDate.replace(/-/g, "/"), endDate: debouncedToDate.replace(/-/g, "/") } : {}),
        },
        options: { sort: { id: -1 }, page: currentPage, paginate: 6 },
        customSearch: {},
      };
      dispatch(useListAction(payload));
    } else if (adminAepsStatusResponse?.status === "FAILURE" || adminAepsStatusResponse?.status === "Error") {
      showNotification({
        message: adminAepsStatusResponse?.message || "Failed to update AEPS status",
        type: "error",
        isCritical: true
      });
    }
  }, [adminAepsStatusResponse, showNotification, dispatch, currentPage, selectedKyc, debouncedFromDate, debouncedToDate]);

  // Get KYC details from Redux state - watch the entire kycDetails object to detect changes
  const kycDetailsState = useSelector((state) => state?.whitelabel?.kycDetails);
  const kycRetrieved = kycDetailsState?.data || null;

  // Get kycRevert success state to refresh KYC data after revert
  const kycRevertResponse = useSelector(
    (state) => state?.whitelabel?.kycRevert,
  );

  // Get kycStatusCheck success state to refresh table after update
  const kycStatusCheckResponse = useSelector(
    (state) => state?.whitelabel?.kycStatusCheck,
  );

  // Get kycUnlock success state to refresh table after unlock
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

  // Calculate total pages based on total count (10 records per page)
  const totalPages = Math.ceil(totalCount / 6) || 1;

  // Slice data to show only 10 records per page
  const startIndex = (currentPage - 1) * 10;
  const endIndex = startIndex + 10;
  const tableData = allTableData.slice(startIndex, endIndex);


  // Refresh KYC data when revert succeeds
  useEffect(() => {
    if (kycRevertResponse?.status === "SUCCESS") {
      setIsReverting(false);
      setShowRevertConfirm(false);
      setRevertPayload(null);

      if (selectedUserId && showKycModal) {
        // Force update by incrementing refresh key
        setKycDataRefreshKey((prev) => prev + 1);
        // Refresh KYC data after revert
        dispatch(kycDataAction(selectedUserId));
      }
    } else if (kycRevertResponse?.status === "ERROR" || kycRevertResponse?.status === "FAILED") {
      setIsReverting(false);
      setShowRevertConfirm(false);
      setRevertPayload(null);
    }
  }, [kycRevertResponse, selectedUserId, showKycModal, dispatch]);

  // Handle click outside modal - DISABLED as per user request to prevent accidental closure
  useEffect(() => {
    // Logic removed to prevent closing on outside click
    return () => {};
  }, []);

  // Debounce date filters to prevent API calls while user is typing/shifting date segments
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFromDate(fromDate);
      setDebouncedToDate(toDate);
      setCurrentPage(1);
    }, 1500); // 1.5 seconds delay

    return () => clearTimeout(timer);
  }, [fromDate, toDate]);

  // Reset pagination when KYC filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedKyc]);

  // Fetch data from API based on role
  useEffect(() => {
    // Only fetch if both dates are provided, or if both dates are empty
    const bothDatesSelected = debouncedFromDate && debouncedToDate;
    const bothDatesNull = !debouncedFromDate && !debouncedToDate;

    if (!bothDatesSelected && !bothDatesNull) {
      return;
    }

    const payload = {
      query: {
        userRole: 4, // Distributor role for onboarding
        ...(selectedKyc ? { kycStatus: selectedKyc } : { kycStatus: "pending" }),
        ...(debouncedFromDate && debouncedToDate ? { startDate: debouncedFromDate.replace(/-/g, "/"), endDate: debouncedToDate.replace(/-/g, "/") } : {}),
      },
      options: {
        sort: { id: -1 },
        page: currentPage,
        paginate: 6,
      },
      customSearch: {},
    };

    dispatch(useListAction(payload));
  }, [selectedKyc, debouncedFromDate, debouncedToDate, currentPage, dispatch]);

  // Refresh table when kycStatusCheck succeeds
  useEffect(() => {
    if (kycStatusCheckResponse?.status === "SUCCESS") {
      // Only fetch if both dates are provided, or if both dates are empty
      const bothDatesSelected = debouncedFromDate && debouncedToDate;
      const bothDatesNull = !debouncedFromDate && !debouncedToDate;

      if (!bothDatesSelected && !bothDatesNull) {
        return;
      }

      const payload = {
        query: {
          userRole: 4, // Distributor role
          ...(selectedKyc ? { kycStatus: selectedKyc } : { kycStatus: "pending" }),
          ...(debouncedFromDate && debouncedToDate ? { startDate: debouncedFromDate.replace(/-/g, "/"), endDate: debouncedToDate.replace(/-/g, "/") } : {}),
        },
        options: {
          sort: { id: -1 },
          page: currentPage,
          paginate: 6,
        },
        customSearch: {},
      };
      dispatch(useListAction(payload));
    }
  }, [kycStatusCheckResponse, selectedKyc, debouncedFromDate, debouncedToDate, currentPage, dispatch]);

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
          userRole: 4, // Distributor role
          ...(selectedKyc ? { kycStatus: selectedKyc } : { kycStatus: "pending" }),
          ...(debouncedFromDate && debouncedToDate ? { startDate: debouncedFromDate.replace(/-/g, "/"), endDate: debouncedToDate.replace(/-/g, "/") } : {}),
        },
        options: {
          sort: { id: -1 },
          page: currentPage,
          paginate: 6,
        },
        customSearch: {},
      };
      dispatch(useListAction(payload));
    }
  }, [kycLockStatusResponse, selectedKyc, debouncedFromDate, debouncedToDate, currentPage, dispatch]);

  // Export to Excel function
  const handleExportToExcel = () => {
    if (!allTableData || allTableData.length === 0) {
      alert("No data available to export");
      return;
    }

    // Prepare data for Excel export
    const excelData = allTableData.map((row) => ({
      ID: row.id || "N/A",
      Date: formatDate(row.date),
      "User ID": row.userId || row.userAgentCode || "N/A",
      Name: row.name || row.userName || "N/A",
      "User Role": row.userRole || "N/A",
      "Mobile No": row.mobileNo || row.mobile || row.mobileNumber || "N/A",
      "Email Id": row.emailId || row.email || "N/A",
      "Parent Name": row.parentName || "N/A",
      "Parent Role": row.parentRole || "N/A",
      "Company Name": row.companyName || "N/A",
      "KYC Status": row.kycStatus || "N/A",
      "KYC Steps": row.kycSteps || "0",
      "Main Wallet": row.mainWallet || "0",
      "AEPS1 Wallet": row.apes1Wallet || "0",
      "AEPS2 Wallet": row.apes2Wallet || "0",
      Status: row.status || "Active",
    }));

    // Create a new workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Distributor Onboarding Data",
    );

    // Generate Excel file and download
    const fileName = `Distributor_Onboarding_Export_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  if (showProfileDetails) {
    return <ProfileDetails onBack={() => setShowProfileDetails(false)} />;
  }

  return (
    <div
      className={`text-[#1B1717] ${embedded ? "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" : "min-h-screen p-4 sm:p-6"}`}
    >
      {embedded ? (
        <div className="[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <>
            {/* Header Section */}
            <div
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${embedded ? "py-4 mb-0" : "mb-6"}`}
            >
              <h1 className="text-lg sm:text-2xl lg:text-2xl font-[Gilroy-Medium] text-[#1B1717]">
                Distributor Onboarding List
              </h1>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Select KYC Dropdown */}
                <select
                  value={selectedKyc}
                  onChange={(e) => setSelectedKyc(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] bg-white"
                >
                  <option value="">Select KYC</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>

                {/* From Date */}
                <div className="relative">
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] bg-white w-full sm:w-auto"
                  />
                </div>

                {/* To Date */}
                <div className="relative">
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] bg-white w-full sm:w-auto"
                  />
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
              <table className="min-w-[1200px] sm:min-w-full divide-y">
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
                      Company Name
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
                  {!tableData || tableData.length === 0 ? (
                    <tr>
                      <td colSpan={20} className="py-12 text-center">
                        <p className="text-gray-500 text-lg font-[Gilroy-Medium]">
                          No data available
                        </p>
                      </td>
                    </tr>
                  ) : (
                    tableData.map((row, index) => (
                      <tr
                        key={index}
                        className={`border-b border-gray-100 ${index % 2 === 0 ? "bg-green-50" : "bg-white"
                          }`}
                      >
                        {/* ID */}
                        <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                          {row.id || "N/A"}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-[14px] font-[Gilroy-Medium] text-center">
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

                        {/* User ID */}
                        <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                          {row.userId || row.userAgentCode || "N/A"}
                        </td>
                        {/* Name */}
                        <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                          {row.name || row.userName || "N/A"}
                        </td>
                        {/* User Role */}
                        <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                          {row.userRole || "N/A"}
                        </td>
                        {/* Mobile No */}
                        <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                          {row.mobileNo ||
                            row.mobile ||
                            row.mobileNumber ||
                            "N/A"}
                        </td>
                        {/* Email Id */}
                        <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                          {row.emailId || row.email || "N/A"}
                        </td>
                        {/* Parent Name */}
                        <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                          {row.parentName || "N/A"}
                        </td>
                        {/* Parent Role */}
                        <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                          {row.parentRole || "N/A"}
                        </td>
                        {/* Company Name */}
                        <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                          {row.companyName || "N/A"}
                        </td>
                        {/* KYC Status */}
                        <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                          {(() => {
                            const status = row.kycStatus?.toLowerCase();
                            let className =
                              "px-2 py-1 rounded text-xs font-[Gilroy-Medium] ";
                            if (
                              status === "completed" ||
                              status === "full_kyc"
                            ) {
                              className += "bg-green-100 text-green-700";
                            } else if (status === "pending") {
                              className += "bg-yellow-100 text-yellow-700";
                            } else {
                              className += "bg-red-100 text-red-700";
                            }
                            return (
                              <span className={className}>
                                {row.kycStatus || "N/A"}
                              </span>
                            );
                          })()}
                        </td>
                        {/* KYC Steps */}
                        <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap text-center">
                          {row.kycSteps || "0"}
                        </td>
                        {/* Main Wallet */}
                        <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap text-center">
                          {row.mainWallet || "0"}
                        </td>
                        <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap text-center">
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
                        <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap text-center">
                          {row.apes1Wallet || "0"}
                        </td>
                        <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap text-center">
                          {row.apes2Wallet || "0"}
                        </td>
                        {/* Status */}
                        <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                          <span
                            className={`px-3 py-1 rounded-lg text-white text-xs font-[Gilroy-Medium] ${row.status?.toLowerCase() === "active"
                              ? "bg-green-600"
                              : "bg-red-600"
                              }`}
                          >
                            {row.status || "Active"}
                          </span>
                        </td>
                        {/* KYC Details */}
                        <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                          <button
                            onClick={() => {
                              const userId = row.id || row.originalItem?.id;
                              if (userId) {
                                setSelectedUserId(userId);
                                dispatch(kycDataAction(userId));
                                setActiveTab("overview");
                                setZoomedImage(null);
                                setShowKycModal(true);
                              }
                            }}
                            className="px-3 py-1 border border-green-500 text-green-600 rounded-lg hover:bg-green-50 text-xs font-[Gilroy-Medium]"
                          >
                            KYC Details
                          </button>
                        </td>
                        {/* Action - Toggle Button */}
                        <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
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
                                        title: isActive ? "Deactivate Distributor?" : "Activate Distributor?",
                                        message: `Are you sure you want to ${isActive ? "deactivate" : "activate"} this distributor account? This will affect their ability to manage retail networks.`,
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
                        <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                          {(() => {
                            const userId = row.id || row.originalItem?.id;
                            const isLocked =
                              row?.originalItem?.lock === true ||
                              row?.originalItem?.lock === "true";
                            return (
                              <button
                                onClick={() => {
                                  if (userId && isLocked) {
                                    setConfirmModal({
                                      show: true,
                                      title: "Enable Distributor Access?",
                                      message: "Are you sure you want to enable access for this distributor account? This will unlock their dashboard and services.",
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
                        <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Medium] text-[14px]">
                          {(() => {
                            const userId = row.id || row.originalItem?.id;
                            return (
                              <button
                                onClick={() => {
                                  if (userId) {
                                    setConfirmModal({
                                      show: true,
                                      title: "Resend Onboarding?",
                                      message: "Are you sure you want to resend the onboarding invitation to this distributor?",
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
                        <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Medium] text-[14px]">
                          {(() => {
                            const userId = row.id || row.originalItem?.id;
                            return (
                              <button
                                onClick={() => {
                                  if (userId) {
                                    setConfirmModal({
                                      show: true,
                                      title: "Send Deactivation Request?",
                                      message: "Are you sure you want to send a deactivation request for this distributor?",
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
                        <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                          {row.onboardingTokenExpiresAt ? new Date(row.onboardingTokenExpiresAt).toLocaleDateString("en-GB").replaceAll("/", "-") : "N/A"}
                        </td>
                        {/* Date */}
                        <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                          {formatDate(row.date)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg border border-gray-300 transition ${currentPage === 1
                  ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
                  : "bg-white text-[#121216] hover:bg-gray-50"
                  }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg font-[Gilroy-Medium] transition ${page === currentPage
                      ? "bg-[#039155] text-white"
                      : "bg-white border border-gray-300 text-[#121216] hover:bg-gray-50"
                      }`}
                  >
                    {page}
                  </button>
                ),
              )}
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg border border-gray-300 transition ${currentPage === totalPages
                  ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
                  : "bg-white text-[#121216] hover:bg-gray-50"
                  }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-lg sm:text-2xl lg:text-2xl font-[Gilroy-Medium] text-[#1B1717]">
              Distributor Onboarding List
            </h1>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Select KYC Dropdown */}
              <select
                value={selectedKyc}
                onChange={(e) => setSelectedKyc(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] bg-white"
              >
                <option value="">Select KYC</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              {/* From Date */}
              <div className="relative">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] bg-white w-full sm:w-auto"
                />
              </div>

              {/* To Date */}
              <div className="relative">
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] bg-white w-full sm:w-auto"
                />
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
            <table className="min-w-[1200px] sm:min-w-full divide-y">
              <thead className="bg-white">
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
                    Company Name
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
                {!tableData || tableData.length === 0 ? (
                  <tr>
                    <td colSpan={20} className="py-12 text-center">
                      <p className="text-gray-500 text-lg font-[Gilroy-Medium]">
                        No data available
                      </p>
                    </td>
                  </tr>
                ) : (
                  tableData.map((row, index) => (
                    <tr
                      key={index}
                      className={`border-b border-gray-100 ${index % 2 === 0 ? "bg-green-50" : "bg-white"
                        }`}
                    >
                      {/* ID */}
                      <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                        {row.id || "N/A"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] font-[Gilroy-Medium] text-center">
                        <button
                          onClick={() => {
                            const userId = row.id || row.originalItem?.id;
                            if (userId) {
                              // Set role code for ProfileDetails badge (Distributor)
                              const roleFromRow =
                                row.userRole ||
                                row.originalItem?.userRole ||
                                "D";
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

                      {/* User ID */}
                      <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                        {row.userId || row.userAgentCode || "N/A"}
                      </td>
                      {/* Name */}
                      <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                        {row.name || row.userName || "N/A"}
                      </td>
                      {/* User Role */}
                      <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                        {row.userRole || "N/A"}
                      </td>
                      {/* Mobile No */}
                      <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                        {row.mobileNo ||
                          row.mobile ||
                          row.mobileNumber ||
                          "N/A"}
                      </td>
                      {/* Email Id */}
                      <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                        {row.emailId || row.email || "N/A"}
                      </td>
                      {/* Parent Name */}
                      <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                        {row.parentName || "N/A"}
                      </td>
                      {/* Parent Role */}
                      <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                        {row.parentRole || "N/A"}
                      </td>
                      {/* Company Name */}
                      <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                        {row.companyName || "N/A"}
                      </td>
                      {/* KYC Status */}
                      <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
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
                              {row.kycStatus || "N/A"}
                            </span>
                          );
                        })()}
                      </td>
                      {/* KYC Steps */}
                      <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap text-center">
                        {row.kycSteps || "0"}
                      </td>
                      {/* Main Wallet */}
                      <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap text-center">
                        {row.mainWallet || "0"}
                      </td>
                      <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap text-center">
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
                      <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap text-center">
                        {row.apes1Wallet || "0"}
                      </td>
                      <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap text-center">
                        {row.apes2Wallet || "0"}
                      </td>
                      {/* Status */}
                      <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-lg text-white text-xs font-[Gilroy-Medium] ${row.status?.toLowerCase() === "active"
                            ? "bg-green-600"
                            : "bg-red-600"
                            }`}
                        >
                          {row.status || "Active"}
                        </span>
                      </td>
                      {/* KYC Details */}
                      <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                        <button
                          onClick={() => {
                            const userId = row.id || row.originalItem?.id;
                            if (userId) {
                              setSelectedUserId(userId);
                              dispatch(kycDataAction(userId));
                              setActiveTab("overview");
                              setZoomedImage(null);
                              setShowKycModal(true);
                            }
                          }}
                          className="px-3 py-1 border border-green-500 text-green-600 rounded-lg hover:bg-green-50 text-xs font-[Gilroy-Medium]"
                        >
                          KYC Details
                        </button>
                      </td>
                      {/* Action - Toggle Button */}
                      <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
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
                                    title: isActive ? "Deactivate Distributor?" : "Activate Distributor?",
                                    message: `Are you sure you want to ${isActive ? "deactivate" : "activate"} this distributor account? This will affect their ability to manage retail networks.`,
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
                      <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                        {(() => {
                          const userId = row.id || row.originalItem?.id;
                          const isLocked =
                            row?.originalItem?.lock === true ||
                            row?.originalItem?.lock === "true";
                          return (
                            <button
                              onClick={() => {
                                if (userId && isLocked) {
                                  setConfirmModal({
                                    show: true,
                                    title: "Enable Distributor Access?",
                                    message: "Are you sure you want to enable access for this distributor account? This will unlock their dashboard and services.",
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
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Medium] text-[14px]">
                        {(() => {
                          const userId = row.id || row.originalItem?.id;
                          return (
                            <button
                              onClick={() => {
                                if (userId) {
                                  setConfirmModal({
                                    show: true,
                                    title: "Resend Onboarding?",
                                    message: "Are you sure you want to resend the onboarding invitation to this distributor?",
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
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Medium] text-[14px]">
                        {(() => {
                          const userId = row.id || row.originalItem?.id;
                          return (
                            <button
                              onClick={() => {
                                if (userId) {
                                  setConfirmModal({
                                    show: true,
                                    title: "Send Deactivation Request?",
                                    message: "Are you sure you want to send a deactivation request for this distributor?",
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
                      <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                        {row.onboardingTokenExpiresAt ? new Date(row.onboardingTokenExpiresAt).toLocaleDateString("en-GB").replaceAll("/", "-") : "N/A"}
                      </td>
                      {/* Date */}
                      <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                        {formatDate(row.date)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg border border-gray-300 transition ${currentPage === 1
                ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
                : "bg-white text-[#121216] hover:bg-gray-50"
                }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-lg font-[Gilroy-Medium] transition ${page === currentPage
                  ? "bg-[#039155] text-white"
                  : "bg-white border border-gray-300 text-[#121216] hover:bg-gray-50"
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
              className={`p-2 rounded-lg border border-gray-300 transition ${currentPage === totalPages
                ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
                : "bg-white text-[#121216] hover:bg-gray-50"
                }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <KycModal 
        isOpen={showKycModal}
        onClose={() => {
          setShowKycModal(false);
          setSelectedUserId(null);
          setActiveTab("overview");
        }}
        kycData={kycRetrieved}
        selectedUserId={selectedUserId}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isLoading={kycDetailsState?.loading}
        kycStatus={kycDetailsState?.status}
        onVerify={(userId, step, status) => {
          setConfirmModal({
            show: true,
            title: `Confirm ${status ? "Verification" : "Rejection"}`,
            message: `Are you sure you want to ${status ? "verify" : "reject"} the ${step} for this user?`,
            type: status ? "success" : "danger",
            confirmText: status ? "Verify" : "Reject",
            onConfirm: () => {
              setConfirmModal((prev) => ({ ...prev, isProcessing: true }));
              dispatch(kycStatusCheck(userId, { [step]: status }));
              setTimeout(() => {
                setConfirmModal(prev => ({ ...prev, show: false, isProcessing: false }));
              }, 800);
            },
          });
        }}
        onRevert={(userId, step, payload) => {
          setRevertPayload({ step, ...payload });
          setShowRevertConfirm(true);
        }}
        showRevertConfirm={showRevertConfirm}
        setShowRevertConfirm={setShowRevertConfirm}
        revertPayload={revertPayload}
        setRevertPayload={setRevertPayload}
        isReverting={isReverting}
        setIsReverting={setIsReverting}
        confirmModal={confirmModal}
        setConfirmModal={setConfirmModal}
        dispatch={dispatch}
        kycModalRef={kycModalRef}
      />

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

export default DistrubtionOnboarding;
