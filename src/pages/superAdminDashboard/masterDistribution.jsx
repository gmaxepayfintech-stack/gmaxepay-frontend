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
  FaHistory,
} from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { User, X, ZoomIn } from "lucide-react";
import * as XLSX from "xlsx";
import {
  useList as useListAction,
  kycData as kycDataAction,
  kycStatusCheck,
  kycUnlock,
  kycRevert,
  rescendOnboarding,
  deActiveOnboarding,
} from "../../redux/action/whiteLabelAction";
import { ButtonLoader } from "../../widgets/layout/loader";
import ProfileDetails from "./ProfileDetails";
import {
  getAdminProfileDetails,
  setSelectedUserRole,
} from "../../redux/action/userProfileAction";

const MasterDistribution = ({
  embedded = false,
  tableData: propTableData = [],
  isLoading = false,
  serverTotalPages = 0,
  onPageChange = null,
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
  const [kycDataRefreshKey, setKycDataRefreshKey] = useState(0);
  const [isKycModalLoading, setIsKycModalLoading] = useState(false);
  const [showRevertConfirm, setShowRevertConfirm] = useState(false);
  const [revertPayload, setRevertPayload] = useState(null);
  const [isReverting, setIsReverting] = useState(false);
  const kycModalRef = useRef(null);
  const [showProfileDetails, setShowProfileDetails] = useState(false);

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
  const kycRetrieved = kycDetailsState?.data || null;

  // Get kycStatusCheck success state to refresh table after update
  const kycStatusCheckResponse = useSelector(
    (state) => state?.whitelabel?.kycStatusCheck,
  );

  // Get kycUnlock success state to refresh table after unlock
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
    : totalCount > 0 ? Math.ceil(totalCount / 6) : 0;

  // When embedded, show all rows (already server-paginated); otherwise slice locally
  const tableData = embedded
    ? allTableData
    : allTableData.slice((currentPage - 1) * 6, currentPage * 6);

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
        userRole: 3, // Master Distributor role
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
  }, [debouncedSearchTerm, debouncedFromDate, debouncedToDate, currentPage, dispatch]);

  // Export to Excel function
  const handleExportToExcel = () => {
    if (!allTableData || allTableData.length === 0) {
      alert("No data available to export");
      return;
    }

    const excelData = allTableData.map((row) => ({
      ID: row.id || "N/A",
      Date: row.date || "N/A",
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
      "AEPS1 Wallet": row.aeps1Wallet || "0",
      "AEPS2 Wallet": row.aeps2Wallet || "0",
      // "Remaining Days": row.remainingDays || "0",
      Status: row.status || "Active",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Master Distributor Data",
    );
    const fileName = `Master_Distributor_Export_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

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
          userRole: 3, // Master Distributor role
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
          userRole: 3, // Master Distributor role
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
              Master Distributor
            </h2>

            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-end gap-3">
              <div className="flex flex-col xs:flex-row gap-3">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="pl-3 pr-3 py-3 border border-gray-300 rounded-lg w-full xs:w-32 text-sm focus:ring-green-500 focus:border-green-500 text-center cursor-pointer"
                />

                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
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
            <table className="min-w-[720px] sm:min-w-full divide-y">
              <thead className="bg-white text-center">
                <tr>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    ID
                  </th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    User
                  </th>

                  <th className="px-3 py-4 font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    User ID
                  </th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Name
                  </th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    User Role
                  </th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Mobile No
                  </th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Email Id
                  </th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Parent Name
                  </th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Parent Role
                  </th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Company Name
                  </th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    KYC Status
                  </th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    KYC Steps
                  </th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Main Wallet
                  </th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    AEPS1 Wallet
                  </th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    AEPS2 Wallet
                  </th>
                  {/* <th className="px-3 py-4 font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Remaining Days
                  </th> */}
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    KYC Details
                  </th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Action
                  </th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Lock Status
                  </th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Onboarding
                  </th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Token Expire
                  </th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y font-normal text-center divide-gray-100">
                {isLoading ? (
                  <TableBodyLoader colSpan={13} />
                ) : !tableData || tableData.length === 0 ? (
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
                      className={`text-sm ${index % 2 === 0 ? "bg-green-50" : "bg-white"
                        }`}
                    >
                      {/* ID */}
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px]">
                        {row.id || "N/A"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] text-center">
                        <button
                          onClick={() => {
                            const userId = row.id || row.originalItem?.id;
                            if (userId) {
                              // Set role code for ProfileDetails badge
                              const roleFromRow =
                                row.userRole ||
                                row.originalItem?.userRole ||
                                "MD"; // Master Distributor
                              dispatch(setSelectedUserRole(roleFromRow));

                              // Use only admin profile details API (same as CreateWhiteLabel)
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
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px]">
                        {row.userId || row.userAgentCode || "N/A"}
                      </td>
                      {/* Name */}
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px]">
                        {row.name || row.userName || "N/A"}
                      </td>
                      {/* User Role */}
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px]">
                        {row.userRole || "N/A"}
                      </td>
                      {/* Mobile No */}
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px]">
                        {row.mobileNo ||
                          row.mobile ||
                          row.mobileNumber ||
                          "N/A"}
                      </td>
                      {/* Email Id */}
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px]">
                        {row.emailId || row.email || "N/A"}
                      </td>
                      {/* Parent Name */}
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px]">
                        {row.parentName || "N/A"}
                      </td>
                      {/* Parent Role */}
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px]">
                        {row.parentRole || "N/A"}
                      </td>
                      {/* Company Name */}
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px]">
                        {row.companyName || "N/A"}
                      </td>
                      {/* KYC Status */}
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px]">
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
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] text-center">
                        {row.kycSteps || "0"}
                      </td>
                      {/* Main Wallet */}
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] text-center">
                        {row.mainWallet || "0"}
                      </td>
                      {/* AEPS1 Wallet */}
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] text-center">
                        {row.aeps1Wallet || "0"}
                      </td>
                      {/* AEPS2 Wallet */}
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] text-center">
                        {row.aeps2Wallet || "0"}
                      </td>
                      {/* Remaining Days */}
                      {/* <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] text-center">
                        {row.remainingDays || "0"}
                      </td> */}
                      {/* Status */}
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px]">
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
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px]">
                        <button
                          onClick={() => {
                            const userId = row.id || row.originalItem?.id;
                            if (userId) {
                              setSelectedUserId(userId);
                              setIsKycModalLoading(true);
                              dispatch(kycDataAction(userId));
                              setShowKycModal(true);
                            }
                          }}
                          className="px-3 py-1 border border-green-500 text-green-600 rounded-lg hover:bg-green-50 text-xs font-[Gilroy-Medium] transition-colors"
                        >
                          KYC Details
                        </button>
                      </td>
                      {/* Action - Toggle Button */}
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px]">
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
                                    title: isActive ? "Deactivate Master Distributor?" : "Activate Master Distributor?",
                                    message: `Are you sure you want to ${isActive ? "deactivate" : "activate"} this master distributor account? This will affect their ability to manage distribution networks.`,
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
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px]">
                        {(() => {
                          const userId = row.id || row.originalItem?.id;
                          const isLocked =
                            row.lock === true || row.lock === "true";
                          return (
                            <button
                              onClick={() => {
                                // Only trigger API when button is in "Locked" state
                                if (userId && isLocked) {
                                  setConfirmModal({
                                    show: true,
                                    title: "Enable Master Distributor Access?",
                                    message: "Are you sure you want to enable access for this account? This will unlock their dashboard and services.",
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
                                    message: "Are you sure you want to resend the onboarding invitation to this master distributor?",
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
                                    title: "Request Deactivation?",
                                    message: "Are you sure you want to request deactivation for this master distributor? This will initiate the account closure process.",
                                    type: "warning",
                                    confirmText: "Yes, Send Request",
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
                      {/* Date */}
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px]">
                        {row.date || "N/A"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination - Fixed at bottom */}
          {totalPages > 0 && (
            <div className="flex justify-center items-center mt-auto pt-6 pb-4 space-x-2">
              <button
                onClick={() => {
                  const newPage = Math.max(1, currentPage - 1);
                  setCurrentPage(newPage);
                  if (embedded && onPageChange) onPageChange(newPage);
                }}
                disabled={currentPage === 1}
                className={`p-2 border border-gray-300 rounded-lg ${currentPage === 1
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-500 hover:bg-gray-100"
                  }`}
              >
                <IoIosArrowBack />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => {
                      setCurrentPage(page);
                      if (embedded && onPageChange) onPageChange(page);
                    }}
                    className={`w-8 h-8 rounded-lg text-sm font-[Gilroy-Medium] ${page === currentPage
                      ? "bg-green-600 text-white"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                      }`}
                  >
                    {page}
                  </button>
                ),
              )}
              <button
                onClick={() => {
                  const newPage = Math.min(totalPages, currentPage + 1);
                  setCurrentPage(newPage);
                  if (embedded && onPageChange) onPageChange(newPage);
                }}
                disabled={currentPage === totalPages}
                className={`p-2 border border-gray-300 rounded-lg ${currentPage === totalPages
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-500 hover:bg-gray-100"
                  }`}
              >
                <IoIosArrowForward />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-normal text-gray-800">
              Master Distributor
            </h2>

            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-end gap-3">
              <div className="flex flex-col xs:flex-row gap-3">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="pl-3 pr-3 py-3 border border-gray-300 rounded-lg w-full xs:w-32 text-sm focus:ring-green-500 focus:border-green-500 text-center cursor-pointer"
                />

                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
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
          <div className="mb-4 overflow-x-auto rounded-3xl bg-white [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <table className="min-w-[720px] sm:min-w-full divide-y">
              <thead className="bg-white">
                <tr>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    ID
                  </th>
                  <th className=" py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    User
                  </th>

                  <th className="px-3 py-4 font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    User ID
                  </th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Name
                  </th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    User Role
                  </th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Mobile No
                  </th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Email Id
                  </th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Parent Name
                  </th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Parent Role
                  </th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Company Name
                  </th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    KYC Status
                  </th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    KYC Steps
                  </th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Main Wallet
                  </th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    AEPS1 Wallet
                  </th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    AEPS2 Wallet
                  </th>
                  {/* <th className="px-3 py-4 font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Remaining Days
                  </th> */}
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    KYC Details
                  </th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Action
                  </th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Lock Status
                  </th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Onboarding
                  </th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Token Expire
                  </th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y font-normal text-center divide-gray-100">
                {isLoading ? (
                  <TableBodyLoader colSpan={23} />
                ) : !tableData || tableData.length === 0 ? (
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
                      className={`text-sm ${index % 2 === 0 ? "bg-green-50" : "bg-white"
                        }`}
                    >
                      {/* ID */}
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px]">
                        {row.id || "N/A"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] font-[Gilroy-Regular] text-center">
                        <button
                          onClick={() => {
                            const userId = row.id || row.originalItem?.id;
                            if (userId) {
                              // Use only admin profile details API (same as CreateWhiteLabel)
                              const original = row.originalItem || {};
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
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] font-[Gilroy-Regular]">
                        {row.userId || row.userAgentCode || "N/A"}
                      </td>
                      {/* Name */}
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] font-[Gilroy-Regular]">
                        {row.name || row.userName || "N/A"}
                      </td>
                      {/* User Role */}
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] font-[Gilroy-Regular]">
                        {row.userRole || "N/A"}
                      </td>
                      {/* Mobile No */}
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] font-[Gilroy-Regular]">
                        {row.mobileNo ||
                          row.mobile ||
                          row.mobileNumber ||
                          "N/A"}
                      </td>
                      {/* Email Id */}
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] font-[Gilroy-Regular]">
                        {row.emailId || row.email || "N/A"}
                      </td>
                      {/* Parent Name */}
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] font-[Gilroy-Regular]">
                        {row.parentName || "N/A"}
                      </td>
                      {/* Parent Role */}
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] font-[Gilroy-Regular]">
                        {row.parentRole || "N/A"}
                      </td>
                      {/* Company Name */}
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] font-[Gilroy-Regular]">
                        {row.companyName || "N/A"}
                      </td>
                      {/* KYC Status */}
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] font-[Gilroy-Medium]">
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
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-center font-[Gilroy-Regular]">
                        {row.kycSteps || "0"}
                      </td>
                      {/* Main Wallet */}
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-center font-[Gilroy-Regular]">
                        {row.mainWallet || "0"}
                      </td>
                      {/* AEPS1 Wallet */}
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] font-[Gilroy-Regular] text-center">
                        {row.aeps1Wallet || "0"}
                      </td>
                      {/* AEPS2 Wallet */}
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] font-[Gilroy-Regular] text-center">
                        {row.aeps2Wallet || "0"}
                      </td>
                      {/* Remaining Days */}
                      {/* <td className="px-4 py-4 whitespace-nowrap text-[14px] font-[Gilroy-Regular] text-center">
                        {row.remainingDays || "0"}
                      </td> */}
                      {/* Status */}
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] font-[Gilroy-Medium]">
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
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] font-[Gilroy-Medium]">
                        <button
                          onClick={() => {
                            const userId = row.id || row.originalItem?.id;
                            if (userId) {
                              setSelectedUserId(userId);
                              setIsKycModalLoading(true);
                              dispatch(kycDataAction(userId));
                              setShowKycModal(true);
                            }
                          }}
                          className="px-3 py-1 border border-green-500 text-green-600 rounded-lg hover:bg-green-50 text-xs font-[Gilroy-Medium] transition-colors"
                        >
                          KYC Details
                        </button>
                      </td>
                      {/* Action - Toggle Button */}
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] font-[Gilroy-Medium]">
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
                                    title: isActive ? "Deactivate Master Distributor?" : "Activate Master Distributor?",
                                    message: `Are you sure you want to ${isActive ? "deactivate" : "activate"} this master distributor account? This will affect their ability to manage distribution networks.`,
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
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] font-[Gilroy-Medium]">
                        {(() => {
                          const userId = row.id || row.originalItem?.id;
                          const isLocked =
                            row.lock === true || row.lock === "true";
                          return (
                            <button
                              onClick={() => {
                                if (userId && isLocked) {
                                  setConfirmModal({
                                    show: true,
                                    title: "Enable Master Distributor Access?",
                                    message: "Are you sure you want to enable access for this account? This will unlock their dashboard and services.",
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
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] font-[Gilroy-Medium]">
                        {(() => {
                          const userId = row.id || row.originalItem?.id;
                          return (
                            <button
                              onClick={() => {
                                if (userId) {
                                  setConfirmModal({
                                    show: true,
                                    title: "Resend Onboarding?",
                                    message: "Are you sure you want to resend the onboarding invitation to this master distributor?",
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
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] font-[Gilroy-Medium]">
                        {(() => {
                          const userId = row.id || row.originalItem?.id;
                          return (
                            <button
                              onClick={() => {
                                if (userId) {
                                  setConfirmModal({
                                    show: true,
                                    title: "Request Deactivation?",
                                    message: "Are you sure you want to request deactivation for this master distributor? This will initiate the account closure process.",
                                    type: "warning",
                                    confirmText: "Yes, Send Request",
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
                      {/* Date */}
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] font-[Gilroy-Regular]">
                        {row.date || "N/A"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination - Fixed at bottom */}
          {totalPages > 0 && (
            <div className="flex justify-center items-center mt-auto pt-6 pb-4 space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`p-2 border border-gray-300 rounded-lg ${currentPage === 1
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-500 hover:bg-gray-100"
                  }`}
              >
                <IoIosArrowBack />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
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
              )}
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className={`p-2 border border-gray-300 rounded-lg ${currentPage === totalPages
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-500 hover:bg-gray-100"
                  }`}
              >
                <IoIosArrowForward />
              </button>
            </div>
          )}
        </div>
      )}

      {/* KYC Details Modal */}
      {showKycModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div
            ref={kycModalRef}
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
                <div className="flex flex-col items-center justify-center py-12">
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
                                  if (selectedUserId) {
                                    setRevertPayload({ aadhar: "true", step: "Aadhar" });
                                    setShowRevertConfirm(true);
                                  }
                                }}
                                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-[Gilroy-Medium] flex items-center gap-2 border border-red-100"
                              >
                                <FaTimesCircle />
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
                                  if (selectedUserId) {
                                    setRevertPayload({ pan: "true", step: "PAN" });
                                    setShowRevertConfirm(true);
                                  }
                                }}
                                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-[Gilroy-Medium] flex items-center gap-2 border border-red-100"
                              >
                                <FaTimesCircle />
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
                                  if (selectedUserId) {
                                    setRevertPayload({ shopImage: "true", step: "Outlet Details" });
                                    setShowRevertConfirm(true);
                                  }
                                }}
                                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-[Gilroy-Medium] flex items-center gap-2 border border-red-100"
                              >
                                <FaTimesCircle />
                                Revert Outlet Details
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
                                  if (selectedUserId) {
                                    setRevertPayload({ bankVerification: "true", step: "Bank Details" });
                                    setShowRevertConfirm(true);
                                  }
                                }}
                                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-[Gilroy-Medium] flex items-center gap-2 border border-red-100"
                              >
                                <FaTimesCircle />
                                Revert Bank Details
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

                          {/* Bank Details Verify */}
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

      {/* Unified Confirmation Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] animate-fadeIn p-4 overflow-y-auto">
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_70px_-10px_rgba(0,0,0,0.3)] w-full max-w-md mx-4 overflow-hidden animate-slideUp border border-white/20"
          >
            <div className="p-8 sm:p-10 text-center">
              {/* Icon Container with Dynamic Gradient & Glow */}
              <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 transform -rotate-3 transition-transform hover:rotate-0 duration-300 shadow-2xl ${
                confirmModal.type === 'danger' ? 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-200 ring-8 ring-red-50' :
                confirmModal.type === 'success' ? 'bg-gradient-to-br from-emerald-500 to-green-600 shadow-emerald-200 ring-8 ring-emerald-50' :
                confirmModal.type === 'warning' ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-200 ring-8 ring-amber-50' :
                'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-200 ring-8 ring-blue-50'
              }`}>
                {confirmModal.type === 'danger' ? <FaTimesCircle className="text-5xl text-white drop-shadow-lg" /> :
                 confirmModal.type === 'success' ? <FaCheckCircle className="text-5xl text-white drop-shadow-lg" /> :
                 confirmModal.type === 'warning' ? <FaTimesCircle className="text-5xl text-white drop-shadow-lg" /> :
                 <FaUser className="text-5xl text-white drop-shadow-lg" />}
              </div>

              <h3 className="text-3xl font-[Gilroy-Bold] text-slate-900 mb-4 tracking-tight">
                {confirmModal.title}
              </h3>
              
              <p className="text-slate-600 mb-10 font-[Gilroy-Medium] leading-relaxed px-2 text-lg">
                {confirmModal.message}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setConfirmModal({ ...confirmModal, show: false })}
                  disabled={confirmModal.isProcessing}
                  className="flex-1 px-8 py-4 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-100 transition-all font-[Gilroy-Semibold] disabled:opacity-50 border border-slate-200 active:scale-95"
                >
                  {confirmModal.cancelText}
                </button>
                <button
                  onClick={confirmModal.onConfirm}
                  disabled={confirmModal.isProcessing}
                  className={`flex-1 px-8 py-4 text-white rounded-2xl transition-all font-[Gilroy-Semibold] disabled:opacity-50 flex items-center justify-center shadow-[0_10px_20px_-5px] active:scale-95 ${
                    confirmModal.type === 'danger' ? 'bg-gradient-to-r from-red-600 to-rose-600 shadow-red-300 hover:from-red-700 hover:to-rose-700' :
                    confirmModal.type === 'success' ? 'bg-gradient-to-r from-emerald-600 to-green-600 shadow-emerald-300 hover:from-emerald-700 hover:to-green-700' :
                    confirmModal.type === 'warning' ? 'bg-gradient-to-r from-amber-600 to-orange-600 shadow-amber-300 hover:from-amber-700 hover:to-orange-700' :
                    'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-300 hover:from-blue-700 hover:to-indigo-700'
                  }`}
                >
                  {confirmModal.isProcessing ? (
                    <ButtonLoader size={24} color="#ffffff" />
                  ) : (
                    confirmModal.confirmText
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revert Confirmation Modal - Exact Match to UI Mockup */}
      {showRevertConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[110] animate-fadeIn p-4 overflow-y-auto">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[2.5rem] shadow-[0_25px_80px_-15px_rgba(0,0,0,0.3)] w-full max-w-lg relative overflow-hidden animate-slideUp"
          >
            {/* Close Button */}
            <button
              onClick={() => {
                setShowRevertConfirm(false);
                setRevertPayload(null);
              }}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="p-10 sm:p-12 text-center">
              {/* Header Icon Composition */}
              <div className="relative w-32 h-32 mx-auto mb-8">
                <div className="absolute inset-0 bg-rose-50 rounded-full scale-110 opacity-50 animate-pulse"></div>
                <div className="relative w-full h-full bg-rose-50 rounded-full flex items-center justify-center">
                  <div className="relative">
                    <FaIdCard className="text-rose-500/80 text-5xl" />
                    <div className="absolute -bottom-1 -right-1 bg-rose-600 rounded-full w-8 h-8 flex items-center justify-center border-4 border-rose-50 shadow-lg">
                      <FaHistory className="text-white text-[10px] transform -scale-x-100" />
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="text-4xl font-[Gilroy-Bold] text-slate-900 mb-4 tracking-tight">
                Revert {revertPayload?.step}?
              </h3>

              {/* Decorative Divider */}
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="h-[2px] w-12 bg-gradient-to-r from-transparent to-rose-200"></div>
                <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                <div className="h-[2px] w-12 bg-gradient-to-l from-transparent to-rose-200"></div>
              </div>

              <p className="text-slate-600 mb-8 font-[Gilroy-Medium] leading-relaxed px-4 text-lg">
                Are you sure you want to revert this document? This will notify the user to re-upload their {revertPayload?.step} document for verification.
              </p>

              {/* Important Alert Box */}
              <div className="bg-[#FFF9F5] border border-[#FFE4D6] rounded-[1.5rem] p-5 mb-10 flex gap-4 text-left items-start">
                <div className="bg-orange-100 p-2 rounded-full mt-0.5">
                  <div className="w-6 h-6 border-2 border-orange-500 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">!</div>
                </div>
                <div>
                  <span className="text-[#B45309] font-[Gilroy-Bold] text-lg block mb-0.5">Important:</span>
                  <p className="text-[#D97706] font-[Gilroy-Medium]">
                    The user will be required to upload their {revertPayload?.step} document again.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-5">
                <button
                  onClick={() => {
                    setShowRevertConfirm(false);
                    setRevertPayload(null);
                  }}
                  disabled={isReverting}
                  className="flex-1 px-8 py-5 bg-white text-slate-600 rounded-2xl hover:bg-slate-50 transition-all font-[Gilroy-Bold] disabled:opacity-50 border-2 border-slate-100 flex items-center justify-center gap-2 active:scale-95"
                >
                  <X className="w-5 h-5" />
                  No, Cancel
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
                  className="flex-1 px-8 py-5 bg-gradient-to-r from-[#F43F5E] to-[#E11D48] text-white rounded-2xl hover:brightness-110 transition-all font-[Gilroy-Bold] disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-rose-200 active:scale-95"
                >
                  {isReverting ? (
                    <ButtonLoader size={24} color="#ffffff" />
                  ) : (
                    <>
                      <FaHistory className="w-5 h-5 transform -scale-x-100" />
                      Yes, Revert
                    </>
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
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MasterDistribution;
