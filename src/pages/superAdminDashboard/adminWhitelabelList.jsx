import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  X,
  ZoomIn,
  User,
  ShieldAlert,
  CheckCircle2,
  Info,
  RotateCcw,
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
  FaHistory,
} from "react-icons/fa";
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
import { ButtonLoader } from "../../widgets/layout/loader";

const AdminWhitelabelList = ({
  embedded = false,
  tableData: propTableData = [],
  serverTotalPages = 0,
  onPageChange = null,
}) => {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedKyc, setSelectedKyc] = useState("pending");
  const [fromDate, setFromDate] = useState("");
  const [debouncedFromDate, setDebouncedFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [debouncedToDate, setDebouncedToDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedKycData, setSelectedKycData] = useState(null);
  const [showKycModal, setShowKycModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [zoomedImage, setZoomedImage] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [kycDataRefreshKey, setKycDataRefreshKey] = useState(0);
  const [isKycModalLoading, setIsKycModalLoading] = useState(false);
  const [showProfileDetails, setShowProfileDetails] = useState(false);

  // Revert confirmation state
  const [showRevertConfirm, setShowRevertConfirm] = useState(false);
  const [revertPayload, setRevertPayload] = useState(null);
  const [isReverting, setIsReverting] = useState(false);

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

  // Get data from Redux when search is active, otherwise use prop data
  const responseForTable = useSelector(
    (state) => state?.whitelabel?.whitelabelList?.whitelabelList || [],
  );

  // Get KYC details from Redux state - watch the entire kycDetails object to detect changes
  const kycDetailsState = useSelector((state) => state?.whitelabel?.kycDetails);
  const kycDetailsFromRedux = kycDetailsState?.data || null;

  // Get kycStatusCheck and kycUnlock success states to refresh table after update
  const kycStatusCheckResponse = useSelector(
    (state) => state?.whitelabel?.kycStatusCheck,
  );
  const kycLockStatusResponse = useSelector(
    (state) => state?.whitelabel?.kycLockStatus,
  );

  // Get kycRevert success state to refresh KYC data after revert
  const kycRevertResponse = useSelector(
    (state) => state?.whitelabel?.kycRevert,
  );

  // Use Redux data if search is active, otherwise use prop data
  const allTableData = debouncedSearchTerm.trim()
    ? Array.isArray(responseForTable) && responseForTable.length > 0
      ? responseForTable
      : []
    : Array.isArray(propTableData) && propTableData.length > 0
      ? propTableData
      : [];

  // Get total count from Redux state (if available) or use current data length
  const totalCountFromRedux = useSelector((state) => {
    const response = state?.whitelabel?.whitelabelList;
    // Check if API response includes total count or pagination info
    return response?.totalCount || response?.total || 0;
  });

  // Use Redux total count if available and search is active, otherwise use current data length
  const totalCount =
    debouncedSearchTerm.trim() && totalCountFromRedux > 0
      ? totalCountFromRedux
      : allTableData.length;

  // When embedded, use server-provided totalPages; otherwise compute locally (6/page)
  const totalPages = embedded && serverTotalPages > 0
    ? serverTotalPages
    : Math.ceil(totalCount / 6) || 1;

  // When embedded, show all rows (already server-paginated); otherwise slice locally
  const tableData = embedded
    ? allTableData
    : allTableData.slice((currentPage - 1) * 6, currentPage * 6);

  // Debounce search term to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500); // 500ms delay

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

  // Reset pagination when KYC filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedKyc]);

  // Fetch data from API when search term or filters change
  useEffect(() => {
    // Only fetch if both dates are provided, or if both dates are empty
    const bothDatesSelected = debouncedFromDate && debouncedToDate;
    const bothDatesNull = !debouncedFromDate && !debouncedToDate;

    if (!bothDatesSelected && !bothDatesNull) {
      return;
    }

    const payload = {
      query: {
        userRole: 2, // Whitelabel role
        ...(selectedKyc && { kycStatus: selectedKyc }),
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
  }, [debouncedSearchTerm, selectedKyc, debouncedFromDate, debouncedToDate, currentPage, dispatch]);

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
          userRole: 2, // Whitelabel role
          ...(selectedKyc && { kycStatus: selectedKyc }),
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
  }, [kycStatusCheckResponse, debouncedSearchTerm, selectedKyc, debouncedFromDate, debouncedToDate, currentPage, dispatch]);

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
          userRole: 2, // Whitelabel role
          ...(selectedKyc && { kycStatus: selectedKyc }),
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
  }, [kycLockStatusResponse, debouncedSearchTerm, selectedKyc, debouncedFromDate, debouncedToDate, currentPage, dispatch]);

  // Update selectedKycData when Redux state changes
  useEffect(() => {
    if (kycDetailsFromRedux && showKycModal) {
      // Force update by creating a deep copy to ensure React detects the change
      try {
        const deepCopy = structuredClone(kycDetailsFromRedux);
        setSelectedKycData(deepCopy);
        setIsKycModalLoading(false);
      } catch (error) {
        // Fallback to shallow copy if deep copy fails
        console.warn(
          "Failed to deep clone KYC data, using shallow copy:",
          error,
        );
        setSelectedKycData({ ...kycDetailsFromRedux });
        setIsKycModalLoading(false);
      }
    } else if (kycDetailsState?.status === "ERROR" || kycDetailsState?.status === "FAILED") {
      setIsKycModalLoading(false);
    }
  }, [kycDetailsState, kycDetailsFromRedux, showKycModal, kycDataRefreshKey]);

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
      } else if (kycRevertResponse.status === "FAILED") {
        setIsReverting(false);
      }
    }
  }, [kycRevertResponse, selectedUserId, showKycModal, dispatch]);

  // Handle click outside modal - DISABLED as per user request to prevent accidental closure
  useEffect(() => {
    // Logic removed to prevent closing on outside click
    return () => {};
  }, []);

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
      className={`text-[#1B1717] ${embedded ? "flex flex-col min-h-[calc(100vh-300px)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" : "min-h-screen p-2 sm:p-6 flex flex-col"}`}
    >
      {/* Header with Filters */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${embedded ? "py-4 mb-0" : "mb-6"}`}
      >
        <h1 className="text-lg sm:text-2xl lg:text-2xl font-[Gilroy-Medium] text-[#1B1717]">
          Whitelabel Onboarding List
        </h1>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Bar */}
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
        </div>
      </div>

      {/* Table */}
      <div
        className={`flex-1 overflow-x-auto ${embedded ? "mb-4 rounded-3xl bg-white" : "-mx-4 sm:mx-0"} [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]`}
      >
        {embedded ? (
          <table className="min-w-[720px] sm:min-w-full divide-y">
            <thead className="text-center">
              <tr className="border-b bg-white border-gray-200">
                <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                  ID
                </th>
                <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                  User
                </th>
                <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                  User Agent Code
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
                  Token Expire
                </th>
                <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="text-center">
              {tableData.map((row, index) => (
                <tr
                  key={index}
                  className={`border-b border-gray-100 ${index % 2 === 0 ? "bg-white" : "bg-green-50"
                    }`}
                >
                  <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                    {row.id || "N/A"}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-[14px] font-[Gilroy-Medium] text-[#121216] text-center">
                    <button
                      onClick={() => {
                        const userId = row.id || row.originalItem?.id;
                        if (userId) {
                          // Set role code for ProfileDetails badge (Whitelabel)
                          const roleFromRow =
                            row.userRole ||
                            row.originalItem?.userRole ||
                            "WL";
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

                  <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                    {row.userId || row.userAgentCode || "N/A"}
                  </td>
                  <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                    {row.name || row.userName || "N/A"}
                  </td>
                  <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                    {row.userRole || "N/A"}
                  </td>
                  <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                    {row.mobileNo || row.mobileNumber || "N/A"}
                  </td>
                  <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                    {row.emailId || "N/A"}
                  </td>
                  <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                    {row.parentName || "N/A"}
                  </td>
                  <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                    {row.parentRole || "N/A"}
                  </td>
                  <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                    {row.companyName || "N/A"}
                  </td>
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
                  <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap text-center">
                    {row.kycSteps || "0"}
                  </td>
                  <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap text-center">
                    {row.mainWallet || "0"}
                  </td>
                  <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap text-center">
                    {row.apes1Wallet || "0"}
                  </td>
                  <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap text-center">
                    {row.apes2Wallet || "0"}
                  </td>
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
                  <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                    <button
                      onClick={() => {
                        const userId = row.id || row.originalItem?.id;
                        if (userId) {
                          setSelectedUserId(userId);
                          setIsKycModalLoading(true);
                          dispatch(kycDataAction(userId));
                          setActiveTab("overview");
                          setZoomedImage(null);
                          setShowKycModal(true);
                        }
                      }}
                      className="px-3 py-1 border border-black text-green-600 rounded-lg hover:bg-green-50 text-xs font-[Gilroy-Medium]"
                    >
                      KYC Details
                    </button>
                  </td>
                  {/* Action - Toggle Button */}
                  <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                    {(() => {
                      const userId = row.id || row.originalItem?.id;
                      const isActive = row.status?.toLowerCase() === "active";

                      return (
                          <button
                            onClick={() => {
                              if (userId) {
                                setConfirmModal({
                                  show: true,
                                  title: isActive ? "Deactivate Whitelabel?" : "Activate Whitelabel?",
                                  message: `Are you sure you want to ${isActive ? "deactivate" : "activate"} this whitelabel account? This will affect their ability to manage services.`,
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
                                title: "Enable Whitelabel Access?",
                                message: "Are you sure you want to enable access for this whitelabel account? This will unlock their dashboard and management tools.",
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
                            isLocked ? "Click to enable access for this account" : "Account access is enabled"
                          }
                        >
                          {isLocked ? "Enable Access" : "Access Enabled"}
                        </button>
                      );
                    })()}
                  </td>
                  {/* Onboarding - Re-send Button */}
                  <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Medium] text-[#121216] text-[14px]">
                    {(() => {
                      const userId = row.id || row.originalItem?.id;
                      return (
                        <button
                          onClick={() => {
                            if (userId) {
                              setConfirmModal({
                                show: true,
                                title: "Resend Onboarding?",
                                message: "Are you sure you want to resend the onboarding invitation to this whitelabel user?",
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
                  <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Medium] text-[#121216] text-[14px]">
                    {(() => {
                      const userId = row.id || row.originalItem?.id;
                      return (
                        <button
                          onClick={() => {
                            if (userId) {
                              setConfirmModal({
                                show: true,
                                title: "Send Deactivation Request?",
                                message: "Are you sure you want to send a deactivation request for this whitelabel account?",
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
                    {formatDate(row.onboardingTokenExpiresAt)}
                  </td>
                  <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                    {formatDate(row.date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full">
              <thead className="text-center">
                <tr className="border-b bg-gray-100 border-gray-200">
                  <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    ID
                  </th>
                  <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    User
                  </th>
                  <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    Date
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
                </tr>
              </thead>
              <tbody className="text-center">
                {tableData.map((row, index) => (
                  <tr
                    key={index}
                    className={`border-b border-gray-100 ${index % 2 === 0 ? "bg-white" : "bg-green-50"
                      }`}
                  >
                    <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                      {row.id || "N/A"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-[14px] font-[Gilroy-Medium] text-[#121216] text-center">
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
                    <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                      {row.date || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                      {row.userId || row.userAgentCode || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                      {row.name || row.userName || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                      {row.userRole || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                      {row.mobileNo || row.mobileNumber || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                      {row.emailId || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                      {row.parentName || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                      {row.parentRole || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                      {row.companyName || "N/A"}
                    </td>
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
                    <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap text-center">
                      {row.kycSteps || "0"}
                    </td>
                    <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap text-center">
                      {row.mainWallet || "0"}
                    </td>
                    <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap text-center">
                      {row.apes1Wallet || "0"}
                    </td>
                    <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap text-center">
                      {row.apes2Wallet || "0"}
                    </td>
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
                        className="px-3 py-1 border border-black text-green-600 rounded-lg hover:bg-green-50 text-xs font-[Gilroy-Medium]"
                      >
                        KYC Details
                      </button>
                    </td>
                    {/* Action - Toggle Button */}
                    <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                      {(() => {
                        const userId = row.id || row.originalItem?.id;
                        const isActive = row.status?.toLowerCase() === "active";

                        return (
                          <button
                            onClick={() => {
                              if (userId) {
                                setConfirmModal({
                                  show: true,
                                  title: isActive ? "Deactivate Whitelabel?" : "Activate Whitelabel?",
                                  message: `Are you sure you want to ${isActive ? "deactivate" : "activate"} this whitelabel account? This will affect their ability to manage services.`,
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
                                  title: "Enable Whitelabel Access?",
                                  message: "Are you sure you want to enable access for this whitelabel account? This will unlock their dashboard and management tools.",
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
                              isLocked ? "Click to enable access for this account" : "Account access is enabled"
                            }
                          >
                            {isLocked ? "Enable Access" : "Access Enabled"}
                          </button>
                        );
                      })()}
                    </td>
                    {/* Onboarding - Re-send Button */}
                    <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Medium] text-[#121216] text-[14px]">
                      {(() => {
                        const userId = row.id || row.originalItem?.id;
                        return (
                          <button
                            onClick={() => {
                              if (userId) {
                                setConfirmModal({
                                  show: true,
                                  title: "Resend Onboarding?",
                                  message: "Are you sure you want to resend the onboarding invitation to this whitelabel user?",
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
                    <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Medium] text-[#121216] text-[14px]">
                      {(() => {
                        const userId = row.id || row.originalItem?.id;
                        return (
                          <button
                            onClick={() => {
                              if (userId) {
                                setConfirmModal({
                                  show: true,
                                  title: "Send Deactivation Request?",
                                  message: "Are you sure you want to send a deactivation request for this whitelabel account?",
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
                      {formatDate(row.onboardingTokenExpiresAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center mt-auto pt-6 pb-4 gap-2">
        <button
          onClick={() => {
            const newPage = Math.max(1, currentPage - 1);
            setCurrentPage(newPage);
            if (embedded && onPageChange) onPageChange(newPage);
          }}
          disabled={currentPage === 1 || totalPages === 0}
          className={`p-2 rounded-lg border transition ${currentPage === 1 || totalPages === 0
            ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
            : "bg-white border-gray-300 text-[#1B1717] hover:bg-gray-50"
            }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {totalPages > 0 ? (
          Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => {
                setCurrentPage(page);
                if (embedded && onPageChange) onPageChange(page);
              }}
              className={`w-10 h-10 rounded-lg font-[Gilroy-Medium] transition ${currentPage === page
                ? "bg-[#039155] text-white"
                : "bg-white border border-gray-300 text-[#1B1717] hover:bg-gray-50"
                }`}
            >
              {page}
            </button>
          ))
        ) : (
          <span className="w-10 h-10 rounded-lg font-[Gilroy-Medium] flex items-center justify-center text-gray-500">
            0
          </span>
        )}

        <button
          onClick={() => {
            const newPage = Math.min(totalPages, currentPage + 1);
            setCurrentPage(newPage);
            if (embedded && onPageChange) onPageChange(newPage);
          }}
          disabled={currentPage === totalPages || totalPages === 0}
          className={`p-2 rounded-lg border transition ${currentPage === totalPages || totalPages === 0
            ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
            : "bg-white border-gray-300 text-[#1B1717] hover:bg-gray-50"
            }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* KYC Details Modal - Tabbed, same as CreateWhiteLabel */}
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
              {isKycModalLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <ButtonLoader color="#039155" size={40} thickness={4} />
                </div>
              ) : selectedKycData ? (
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
                                width: `${((selectedKycData.completedSteps ||
                                  selectedKycData.kycSteps ||
                                  0) /
                                  (selectedKycData.totalSteps || 7)) *
                                  100
                                  }%`,
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
                                <X className="w-3.5 h-3.5" />
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
                                <X className="w-3.5 h-3.5" />
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
                                <X className="w-3.5 h-3.5" />
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
                                <FaCheckCircle className="text-green-600 text-xl" />
                              ) : (
                                <FaTimesCircle className="text-red-600 text-xl" />
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
                                <FaCheckCircle className="text-green-600 text-xl" />
                              ) : (
                                <FaTimesCircle className="text-red-600 text-xl" />
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
                                <FaCheckCircle className="text-green-600 text-xl" />
                              ) : (
                                <FaTimesCircle className="text-red-600 text-xl" />
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
                                <FaCheckCircle className="text-green-600 text-xl" />
                              ) : (
                                <FaTimesCircle className="text-red-600 text-xl" />
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
                                <FaCheckCircle className="text-green-600 text-xl" />
                              ) : (
                                <FaTimesCircle className="text-red-600 text-xl" />
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
                                <FaCheckCircle className="text-green-600 text-xl" />
                              ) : (
                                <FaTimesCircle className="text-red-600 text-xl" />
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
                                <FaCheckCircle className="text-green-600 text-xl" />
                              ) : (
                                <FaTimesCircle className="text-red-600 text-xl" />
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

                          <div
                            className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${selectedKycData.userDetails.bankDetailsVerify
                              ? "bg-green-50 border-green-200"
                              : "bg-red-50 border-red-200"
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              {selectedKycData.userDetails.bankDetailsVerify ? (
                                <FaCheckCircle className="text-green-600 text-xl" />
                              ) : (
                                <FaTimesCircle className="text-red-600 text-xl" />
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

      {/* Unified Confirmation Modal - Professional SaaS Design */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-[2px] flex items-center justify-center z-[120] animate-fadeIn p-4 overflow-y-auto">
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[2rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] w-full max-w-sm overflow-hidden animate-slideUp border border-slate-100"
          >
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                  confirmModal.type === 'danger' ? 'bg-rose-50 text-rose-600' :
                  confirmModal.type === 'success' ? 'bg-emerald-50 text-emerald-600' :
                  'bg-indigo-50 text-indigo-600'
                }`}>
                  {confirmModal.type === 'danger' ? <ShieldAlert className="w-8 h-8" /> :
                   confirmModal.type === 'success' ? <CheckCircle2 className="w-8 h-8" /> :
                   <Info className="w-8 h-8" />}
                </div>
                <div>
                  <h3 className="text-xl font-[Gilroy-Bold] text-slate-900 tracking-tight leading-tight">
                    {confirmModal.title}
                  </h3>
                </div>
              </div>
              
              <p className="text-slate-500 mb-8 font-[Gilroy-Medium] leading-relaxed">
                {confirmModal.message}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmModal({ ...confirmModal, show: false })}
                  disabled={confirmModal.isProcessing}
                  className="flex-1 px-4 py-3 text-sm font-[Gilroy-Bold] text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all disabled:opacity-50 active:scale-95"
                >
                  {confirmModal.cancelText || 'Cancel'}
                </button>
                <button
                  onClick={confirmModal.onConfirm}
                  disabled={confirmModal.isProcessing}
                  className={`flex-1 px-4 py-3 text-sm font-[Gilroy-Bold] text-white rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center ${
                    confirmModal.type === 'danger' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200' :
                    confirmModal.type === 'success' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' :
                    'bg-slate-900 hover:bg-slate-800 shadow-slate-200'
                  }`}
                >
                  {confirmModal.isProcessing ? (
                    <ButtonLoader size={18} color="#ffffff" />
                  ) : (
                    confirmModal.confirmText || 'Confirm'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revert Confirmation Modal - Professional SaaS Design */}
      {showRevertConfirm && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-[2px] flex items-center justify-center z-[110] animate-fadeIn p-4 overflow-y-auto">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[2rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] w-full max-w-[440px] relative overflow-hidden animate-slideUp border border-slate-100"
          >
            <div className="p-10">
              <div className="flex items-start justify-between mb-8">
                <div className="w-16 h-16 bg-rose-50 rounded-[1.25rem] flex items-center justify-center text-rose-600 shadow-sm">
                  <RotateCcw className="w-8 h-8" />
                </div>
                <button
                  onClick={() => {
                    setShowRevertConfirm(false);
                    setRevertPayload(null);
                  }}
                  className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 text-slate-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-left mb-8">
                <h3 className="text-3xl font-[Gilroy-Bold] text-slate-900 mb-3 tracking-tight">
                  Revert {revertPayload?.step}?
                </h3>
                <p className="text-slate-500 font-[Gilroy-Medium] leading-relaxed text-lg">
                  This document will be marked as invalid. The user will be notified to re-upload their 
                  <span className="text-slate-900 font-bold mx-1">{revertPayload?.step}</span> 
                  document for verification.
                </p>
              </div>

              {/* Minimalist Warning Badge */}
              <div className="flex items-center gap-3 px-4 py-2.5 bg-rose-50 rounded-xl border border-rose-100 mb-10 w-fit">
                <div className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                <p className="text-[10px] font-bold text-rose-700 uppercase tracking-widest">Destructive Action</p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowRevertConfirm(false);
                    setRevertPayload(null);
                  }}
                  disabled={isReverting}
                  className="flex-1 px-8 py-4 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-100 transition-all font-[Gilroy-Bold] active:scale-95 disabled:opacity-50 border border-slate-100"
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
                  className="flex-[1.5] px-8 py-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all font-[Gilroy-Bold] shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50 flex items-center justify-center"
                >
                  {isReverting ? (
                    <ButtonLoader size={20} color="#ffffff" />
                  ) : (
                    "Confirm Revert"
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
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .animate-slideUp {
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default AdminWhitelabelList;
