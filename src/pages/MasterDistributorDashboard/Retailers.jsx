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
import {
  kycData as kycDataAction,
  kycStatusData,
  kycStatusCheck,
  kycUnlock,
  kycRevert,
  rescendOnboarding,
  deActiveOnboarding,
  getUserMDDetails,
} from "../../redux/action/whiteLabelAction";
import { ButtonLoader } from "../../widgets/layout/loader";
import ProfileDetails from "./ProfileDetails";
import { roleDataMasterDistributorUser } from "../../redux/action/roleAction";
import { getUserMDDetails } from "../../redux/action/whiteLabelAction";

const Retailers = ({
  embedded = false,
  tableData: propTableData = [],
}) => {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState(
    () => new Date().toISOString().split("T")[0],
  ); // Default to today's date
  const [selectedKycData, setSelectedKycData] = useState(null);
  const [showKycModal, setShowKycModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [zoomedImage, setZoomedImage] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [kycDataRefreshKey, setKycDataRefreshKey] = useState(0);
  const [rowLockStatus, setRowLockStatus] = useState({}); // Track lock status per row ID
  const [lastClickedRowId, setLastClickedRowId] = useState(null);
  const [isKycModalLoading, setIsKycModalLoading] = useState(false);
  const kycModalRef = useRef(null);
  const [showProfileDetails, setShowProfileDetails] = useState(false);

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

  // Get data from Redux (Master Distributor role-based list - flat array)
  const responseForTable = useSelector((state) => {
    const roleData = state?.roles?.roleDataMD?.roleDataMD;
    return Array.isArray(roleData) ? roleData : [];
  });

  // Log full API response for debugging
  const roleDataResponse = useSelector((state) => state?.roles?.roleDataMD || null);
  useEffect(() => {
    console.log("MD Retailers - roleDataMasterDistributorUser payload:", roleDataResponse);
    console.log("MD Retailers - table rows from Redux:", responseForTable);
  }, [roleDataResponse, responseForTable]);

  // Get KYC details from Redux state - watch the entire kycDetails object to detect changes
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

  // Table loading state from roles reducer
  const isTableLoading = useSelector(
    (state) => state?.roles?.isLoading || false,
  );

  // Use Redux data if available, otherwise use prop data
  const allTableData =
    Array.isArray(responseForTable) && responseForTable.length > 0
      ? responseForTable
      : Array.isArray(propTableData) && propTableData.length > 0
        ? propTableData
        : [];

  // Get total count from Redux state (flat array length)
  const totalCountFromRedux = useSelector((state) => {
    const roleData = state?.roles?.roleDataMD?.roleDataMD;
    return Array.isArray(roleData) ? roleData.length : 0;
  });

  const totalCount =
    totalCountFromRedux > 0 ? totalCountFromRedux : allTableData.length;

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

  // Fetch data from API on initial load and when search term or page changes
  useEffect(() => {
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

    dispatch(roleDataMasterDistributorUser(payload));
  }, [debouncedSearchTerm, currentPage, dispatch]);

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
    if (
      kycRevertResponse?.status === "SUCCESS" &&
      selectedUserId &&
      showKycModal
    ) {
      // Clear current data to force re-render
      setSelectedKycData(null);
      // Small delay to ensure backend has processed the revert
      const timer = setTimeout(() => {
        // Force update by incrementing refresh key
        setKycDataRefreshKey((prev) => prev + 1);
        // Refresh KYC data after revert
        dispatch(kycDataAction(selectedUserId));
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [kycRevertResponse, selectedUserId, showKycModal, dispatch]);

  // Handle click outside modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (kycModalRef.current && !kycModalRef.current.contains(event.target)) {
        setShowKycModal(false);
        setSelectedKycData(null);
        setSelectedUserId(null);
        setActiveTab("overview");
        setZoomedImage(null);
      }
    };

    if (showKycModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showKycModal]);

  // Refresh table when kycStatusCheck succeeds
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
          customSearch: debouncedSearchTerm.trim()
            ? {
                mobileNo: debouncedSearchTerm.trim(),
                name: debouncedSearchTerm.trim(),
              }
            : {},
        };
        dispatch(roleDataMasterDistributorUser(payload));
      }
    }
  }, [kycStatusCheckResponse, debouncedSearchTerm, currentPage, dispatch]);

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
      "Main Wallet": row.wallet?.mainWallet || "0",
      "AEPS Wallet": row.wallet?.apes1Wallet || "0",
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
  const getWalletValue = (wallet, type = "mainWallet") => {
    if (!wallet) return "0";
    if (typeof wallet === "object" && wallet !== null) {
      const value =
        wallet[type] ??
        wallet.mainWallet ??
        wallet.apes1Wallet ??
        wallet.apes2Wallet ??
        "0";
      return String(value);
    }
    return String(wallet);
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
                className="flex items-center justify-center gap-2 bg-[#039155] text-white px-4 py-3 rounded-lg font-[gilroy-medium] hover:bg-green-700 shadow-md text-sm sm:text-base"
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
                  <th className="px-3 py-4  font-[gilroy-medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    ID
                  </th>
                  <th className="px-3 py-4 ml-8  font-[gilroy-medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    User
                  </th>
                  <th className="px-3 py-4  font-[gilroy-medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    User ID
                  </th>
                  <th className="px-3 py-4  font-[gilroy-medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Name
                  </th>
                  <th className="px-3 py-4  font-[gilroy-medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    User Role
                  </th>
                  <th className="px-3 py-4  font-[gilroy-medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Mobile No
                  </th>
                  <th className="px-3 py-4  font-[gilroy-medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Email Id
                  </th>
                  <th className="px-3 py-4  font-[gilroy-medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Parent Name
                  </th>
                  <th className="px-3 py-4  font-[gilroy-medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Parent Role
                  </th>
                  <th className="px-3 py-4  font-[gilroy-medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Company
                  </th>
                  <th className="px-3 py-4  font-[gilroy-medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    KYC Status
                  </th>
                  <th className="px-3 py-4  font-[gilroy-medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    KYC Steps
                  </th>
                  <th className="px-3 py-4  font-[gilroy-medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Main Wallet
                  </th>
                  <th className="px-3 py-4  font-[gilroy-medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    AEPS Wallet
                  </th>
                  <th className="px-3 py-4  font-[gilroy-medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-3 py-4  font-[gilroy-medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    KYC Details
                  </th>
                  <th className="px-3 py-4  font-[gilroy-medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Action
                  </th>
                  <th className="px-3 py-4  font-[gilroy-medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Lock Status
                  </th>
                  <th className="px-3 py-4  font-[gilroy-medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Onboarding
                  </th>
                  <th className="px-3 py-4  font-[gilroy-medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Token Expire
                  </th>
                  <th className="px-3 py-4  font-[gilroy-medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y font-normal text-center divide-gray-100">
                {isTableLoading ? (
                  <TableBodyLoader colSpan={13} />
                ) : !tableData || tableData.length === 0 ? (
                  <tr>
                    <td colSpan={20} className="py-12 text-center">
                      <p className="text-gray-500 text-lg font-[gilroy-medium]">
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
                      <td className="px-4 py-4 whitespace-nowrap text-[11px] text-[#121216] font-[gilroy-regular]">
                        {safeString(row.id, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[11px] ">
                        <button
                          onClick={() => {
                            const userId = row.id || row.originalItem?.id;
                            if (userId) {
                              dispatch(getUserMDDetails(userId));
                              setShowProfileDetails(true);
                            }
                          }}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors cursor-pointer"
                        >
                          <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                        </button>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap text-[11px] text-[#121216] font-[gilroy-regular]">
                        {safeString(row.userId, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[11px] text-[#121216] font-[gilroy-regular]">
                        {safeString(row.name, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[11px] text-[#121216] font-[gilroy-regular]">
                        {safeString(row.userRole, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[11px] text-[#121216] font-[gilroy-regular]">
                        {safeString(row.mobileNo, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[11px] text-[#121216] font-[gilroy-regular]">
                        {safeString(row.email, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[11px] text-[#121216] font-[gilroy-regular]">
                        {safeString(row.parentName, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[11px] text-[#121216] font-[gilroy-regular]">
                        {safeString(row.parentRole, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[11px] text-[#121216] font-[gilroy-regular]">
                        {safeString(row.company, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[11px] text-[#121216] font-[gilroy-regular]">
                        {(() => {
                          const status = row.kycStatus?.toLowerCase();
                          let className =
                            "px-2 py-1 rounded text-xs font-[gilroy-medium] ";
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
                      <td className="px-4 py-4 whitespace-nowrap text-[11px] text-[#121216] font-[gilroy-regular] text-center">
                        {safeString(row.kycSteps, "0")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[11px] text-[#121216] font-[gilroy-regular] text-center">
                        {getWalletValue(row.wallet, "mainWallet")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[11px] text-[#121216] font-[gilroy-regular] text-center">
                        {getWalletValue(row.wallet, "apes1Wallet")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[11px] text-[#121216] font-[gilroy-regular]">
                        <span
                          className={`px-3 py-1 rounded-lg text-white text-xs font-[gilroy-medium] ${
                            row.status?.toLowerCase() === "active"
                              ? "bg-green-600"
                              : "bg-red-600"
                          }`}
                        >
                          {safeString(row.status, "Active")}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[11px] text-[#121216] font-[gilroy-regular]">
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
                          className="px-3 py-1 border border-black text-green-600 rounded-lg hover:bg-green-50 text-xs font-[gilroy-medium] transition-colors"
                        >
                          KYC Details
                        </button>
                      </td>
                      {/* Action - Toggle Button */}
                      <td className="px-4 py-4 whitespace-nowrap text-[11px] text-[#121216] font-[gilroy-regular]">
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
                                      kycStatusCheck(userId, {
                                        isActive: "false",
                                      }),
                                    );
                                  } else {
                                    // Toggling from inactive to active (ON)
                                    dispatch(
                                      kycStatusCheck(userId, {
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
                                      customSearch: debouncedSearchTerm.trim()
                                        ? {
                                            mobileNo: debouncedSearchTerm.trim(),
                                            name: debouncedSearchTerm.trim(),
                                          }
                                        : {},
                                    };
                                    dispatch(roleDataMasterDistributorUser(payload));
                                  }, 500);
                                }
                              }}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-offset-1 ${
                                isActive ? "bg-green-600" : "bg-gray-300"
                              }`}
                              role="switch"
                              aria-checked={isActive}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  isActive ? "translate-x-6" : "translate-x-1"
                                }`}
                              />
                            </button>
                          );
                        })()}
                      </td>
                      {/* Lock Status - Colored Button */}
                      <td className="px-4 py-4 whitespace-nowrap text-[11px] text-[#121216] font-[gilroy-regular]">
                        {(() => {
                          const userId = row.id || row.originalItem?.id;
                          // Check multiple possible formats for lock status
                          const lockValue =
                            row?.originalItem?.lock ||
                            row.isLocked ||
                            row.lockStatus;
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
                                  dispatch(kycUnlock(userId));

                                  // Refresh table data after dispatching
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
                                      customSearch: debouncedSearchTerm.trim()
                                        ? {
                                            mobileNo: debouncedSearchTerm.trim(),
                                            name: debouncedSearchTerm.trim(),
                                          }
                                        : {},
                                    };
                                    dispatch(roleDataMasterDistributorUser(payload));
                                  }, 500);
                                }
                              }}
                              disabled={!isLocked}
                              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                                isLocked
                                  ? "bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                                  : "bg-green-500 text-white cursor-not-allowed opacity-75"
                              }`}
                              title={
                                isLocked
                                  ? "Click to unlock"
                                  : "Already unlocked"
                              }
                            >
                              {isLocked ? "Locked" : "Unlocked"}
                            </button>
                          );
                        })()}
                      </td>
                      {/* Onboarding - Re-send Button */}
                      <td className="px-4 py-4 whitespace-nowrap text-[11px] text-[#121216] font-[gilroy-regular]">
                        {(() => {
                          const userId = row.id || row.originalItem?.id;
                          return (
                            <button
                              onClick={() => {
                                if (userId) {
                                  dispatch(rescendOnboarding(userId));
                                }
                              }}
                              className="px-3 py-1 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 text-xs font-[gilroy-medium] transition-colors"
                            >
                              Re-send
                            </button>
                          );
                        })()}
                      </td>
                      {/* Deactivation - Send Button */}
                      <td className="px-4 py-4 whitespace-nowrap text-[11px] text-[#121216] font-[gilroy-regular]">
                        {(() => {
                          const userId = row.id || row.originalItem?.id;
                          return (
                            <button
                              onClick={() => {
                                if (userId) {
                                  dispatch(deActiveOnboarding(userId));
                                }
                              }}
                              className="px-3 py-1 border border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 text-xs font-[gilroy-medium] transition-colors"
                            >
                              Send
                            </button>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[11px] text-[#121216] font-[gilroy-regular]">
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
              className={`p-2 border border-gray-300 rounded-lg ${
                currentPage === 1 || totalPages === 0
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
                    className={`w-8 h-8 rounded-lg text-sm font-[gilroy-medium] ${
                      page === currentPage
                        ? "bg-green-600 text-white"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )
            ) : (
              <span className="w-8 h-8 rounded-lg text-sm font-[gilroy-medium] flex items-center justify-center text-gray-500">
                0
              </span>
            )}
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages || totalPages === 0}
              className={`p-2 border border-gray-300 rounded-lg ${
                currentPage === totalPages || totalPages === 0
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
                className="flex items-center justify-center gap-2 bg-[#039155] text-white px-4 py-3 rounded-lg font-[gilroy-medium] hover:bg-green-700 shadow-md text-sm sm:text-base"
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
                  <th className="px-3 py-4  font-[gilroy-medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    ID
                  </th>
                  <th className="px-3 py-4  font-[gilroy-medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    User
                  </th>

                  <th className="px-3 py-4  font-[gilroy-medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    User ID
                  </th>
                  <th className="px-3 py-4  font-[gilroy-medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Name
                  </th>
                  <th className="px-3 py-4  font-[gilroy-medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    User Role
                  </th>
                  <th className="px-3 py-4  font-[gilroy-medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Mobile No
                  </th>
                  <th className="px-3 py-4  font-[gilroy-medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Email Id
                  </th>
                  <th className="px-3 py-4  font-[gilroy-medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Parent Name
                  </th>
                  <th className="px-3 py-4  font-[gilroy-medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Parent Role
                  </th>
                  <th className="px-3 py-4  font-[gilroy-medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Company
                  </th>
                  <th className="px-3 py-4  font-[gilroy-medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    KYC Status
                  </th>
                  <th className="px-3 py-4  font-[gilroy-medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    KYC Steps
                  </th>
                  <th className="px-3 py-4  font-[gilroy-medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Main Wallet
                  </th>
                  <th className="px-3 py-4  font-[gilroy-medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    AEPS Wallet
                  </th>
                  <th className="px-3 py-4  font-[gilroy-medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-3 py-4  font-[gilroy-medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    KYC Details
                  </th>
                  <th className="px-3 py-4  font-[gilroy-medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Action
                  </th>
                  <th className="px-3 py-4  font-[gilroy-medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Lock Status
                  </th>
                  <th className="px-3 py-4  font-[gilroy-medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Onboarding
                  </th>
                  <th className="px-3 py-4  font-[gilroy-medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Token Expire
                  </th>
                  <th className="px-3 py-4  font-[gilroy-medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y font-normal text-center divide-gray-100">
                {isTableLoading ? (
                  <TableBodyLoader colSpan={13} />
                ) : !tableData || tableData.length === 0 ? (
                  <tr>
                    <td colSpan={20} className="py-12 text-center">
                      <p className="text-gray-500 text-lg font-[gilroy-medium]">
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
                      <td className="px-4 py-4 whitespace-nowrap text-[11px] text-[#121216] font-[gilroy-regular]">
                        {safeString(row.id, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[11px] text-center">
                        <button
                          onClick={() => {
                            const userId = row.id || row.originalItem?.id;
                            if (userId) {
                              dispatch(getUserMDDetails(userId));
                              setShowProfileDetails(true);
                            }
                          }}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors cursor-pointer"
                        >
                          <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                        </button>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap text-[11px] text-[#121216] font-[gilroy-regular]">
                        {safeString(row.userId, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[11px] text-[#121216] font-[gilroy-regular]">
                        {safeString(row.name, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[11px] text-[#121216] font-[gilroy-regular]">
                        {safeString(row.userRole, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[11px] text-[#121216] font-[gilroy-regular]">
                        {safeString(row.mobileNo, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[11px] text-[#121216] font-[gilroy-regular]">
                        {safeString(row.email, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[11px] text-[#121216] font-[gilroy-regular]">
                        {safeString(row.parentName, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[11px] text-[#121216] font-[gilroy-regular]">
                        {safeString(row.parentRole, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[11px] text-[#121216] font-[gilroy-regular]">
                        {safeString(row.company, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[11px] text-[#121216] font-[gilroy-regular]">
                        {(() => {
                          const status = row.kycStatus?.toLowerCase();
                          let className =
                            "px-2 py-1 rounded text-xs font-[gilroy-medium] ";
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
                      <td className="px-4 py-4 whitespace-nowrap text-[11px] text-[#121216] font-[gilroy-regular] text-center">
                        {safeString(row.kycSteps, "0")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[11px] text-[#121216] font-[gilroy-regular] text-center">
                        {getWalletValue(row.wallet, "mainWallet")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[11px] text-[#121216] font-[gilroy-regular] text-center">
                        {getWalletValue(row.wallet, "apes1Wallet")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[11px] text-[#121216] font-[gilroy-regular]">
                        <span
                          className={`px-3 py-1 rounded-lg text-white text-xs font-[gilroy-medium] ${
                            row.status?.toLowerCase() === "active"
                              ? "bg-green-600"
                              : "bg-red-600"
                          }`}
                        >
                          {safeString(row.status, "Active")}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[11px] text-[#121216] font-[gilroy-regular]">
                        <button
                          onClick={() => {
                            const userId = row.id || row.originalItem?.id;
                            if (userId) {
                              setSelectedUserId(userId);
                              dispatch(kycDataAction(userId));
                              setShowKycModal(true);
                            }
                          }}
                          className="px-3 py-1 border border-black text-green-600 rounded-lg hover:bg-green-50 text-xs font-[gilroy-medium] transition-colors"
                        >
                          KYC Details
                        </button>
                      </td>
                      {/* Action - Toggle Button */}
                      <td className="px-4 py-4 whitespace-nowrap text-[11px] text-[#121216] font-[gilroy-regular]">
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
                                      kycStatusCheck(userId, {
                                        isActive: "false",
                                      }),
                                    );
                                  } else {
                                    // Toggling from inactive to active (ON)
                                    dispatch(
                                      kycStatusCheck(userId, {
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
                                      customSearch: debouncedSearchTerm.trim()
                                        ? {
                                            mobileNo: debouncedSearchTerm.trim(),
                                            name: debouncedSearchTerm.trim(),
                                          }
                                        : {},
                                    };
                                    dispatch(roleDataMasterDistributorUser(payload));
                                  }, 500);
                                }
                              }}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-offset-1 ${
                                isActive ? "bg-green-600" : "bg-gray-300"
                              }`}
                              role="switch"
                              aria-checked={isActive}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  isActive ? "translate-x-6" : "translate-x-1"
                                }`}
                              />
                            </button>
                          );
                        })()}
                      </td>
                      {/* Lock Status - Colored Button */}
                      <td className="px-4 py-4 whitespace-nowrap text-[11px] text-[#121216] font-[gilroy-regular]">
                        {(() => {
                          const userId = row.id || row.originalItem?.id;
                          // Check multiple possible formats for lock status
                          const lockValue =
                            row?.originalItem?.lock ||
                            row.isLocked ||
                            row.lockStatus;
                          console.log("Lock value check:", {
                            lockValue,
                            rowLock: row?.lock,
                            originalItemLock: row?.originalItem?.lock,
                            isLocked: row?.isLocked,
                            lockStatus: row?.lockStatus,
                          });
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
                                  dispatch(kycUnlock(userId));

                                  // Refresh table data after dispatching
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
                                      customSearch: debouncedSearchTerm.trim()
                                        ? {
                                            mobileNo: debouncedSearchTerm.trim(),
                                            name: debouncedSearchTerm.trim(),
                                          }
                                        : {},
                                    };
                                    dispatch(roleDataMasterDistributorUser(payload));
                                  }, 500);
                                }
                              }}
                              disabled={!isLocked}
                              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                                isLocked
                                  ? "bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                                  : "bg-green-500 text-white cursor-not-allowed opacity-75"
                              }`}
                              title={
                                isLocked
                                  ? "Click to unlock"
                                  : "Already unlocked"
                              }
                            >
                              {isLocked ? "Locked" : "Unlocked"}
                            </button>
                          );
                        })()}
                      </td>
                      {/* Onboarding - Re-send Button */}
                      <td className="px-4 py-4 whitespace-nowrap text-[11px] text-[#121216] font-[gilroy-regular]">
                        {(() => {
                          const userId = row.id || row.originalItem?.id;
                          return (
                            <button
                              onClick={() => {
                                if (userId) {
                                  dispatch(rescendOnboarding(userId));
                                }
                              }}
                              className="px-3 py-1 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 text-xs font-[gilroy-medium] transition-colors"
                            >
                              Re-send
                            </button>
                          );
                        })()}
                      </td>
                      {/* Deactivation - Send Button */}
                      <td className="px-4 py-4 whitespace-nowrap text-[11px] text-[#121216] font-[gilroy-regular]">
                        {(() => {
                          const userId = row.id || row.originalItem?.id;
                          return (
                            <button
                              onClick={() => {
                                if (userId) {
                                  dispatch(deActiveOnboarding(userId));
                                }
                              }}
                              className="px-3 py-1 border border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 text-xs font-[gilroy-medium] transition-colors"
                            >
                              Send
                            </button>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[11px] text-[#121216] font-[gilroy-regular]">
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
              className={`p-2 border border-gray-300 rounded-lg ${
                currentPage === 1 || totalPages === 0
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
                    className={`w-8 h-8 rounded-lg text-sm font-[gilroy-medium] ${
                      page === currentPage
                        ? "bg-green-600 text-white"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )
            ) : (
              <span className="w-8 h-8 rounded-lg text-sm font-[gilroy-medium] flex items-center justify-center text-gray-500">
                0
              </span>
            )}
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages || totalPages === 0}
              className={`p-2 border border-gray-300 rounded-lg ${
                currentPage === totalPages || totalPages === 0
                  ? "text-gray-400 cursor-not-allowed bg-gray-100"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <IoIosArrowForward />
            </button>
          </div>
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
                  <h2 className="text-xl font-semibold text-gray-800">
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
                  className={`px-4 py-3 text-sm font-[gilroy-medium] transition-colors relative ${
                    activeTab === "overview"
                      ? "text-green-600 border-b-2 border-green-600"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Overview
                </button>

                <button
                  onClick={() => setActiveTab("aadhar")}
                  className={`px-4 py-3 text-sm font-[gilroy-medium] transition-colors relative ${
                    activeTab === "aadhar"
                      ? "text-green-600 border-b-2 border-green-600"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Aadhar Document
                </button>
                <button
                  onClick={() => setActiveTab("pan")}
                  className={`px-4 py-3 text-sm font-[gilroy-medium] transition-colors relative ${
                    activeTab === "pan"
                      ? "text-green-600 border-b-2 border-green-600"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  PAN Document
                </button>
                <button
                  onClick={() => setActiveTab("details")}
                  className={`px-4 py-3 text-sm font-[gilroy-medium] transition-colors relative ${
                    activeTab === "details"
                      ? "text-green-600 border-b-2 border-green-600"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Outlet Details
                </button>
                <button
                  onClick={() => setActiveTab("bankDetails")}
                  className={`px-4 py-3 text-sm font-[gilroy-medium] transition-colors relative ${
                    activeTab === "bankDetails"
                      ? "text-green-600 border-b-2 border-green-600"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Bank Details
                </button>
                <button
                  onClick={() => setActiveTab("verification")}
                  className={`px-4 py-3 text-sm font-[gilroy-medium] transition-colors relative ${
                    activeTab === "verification"
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
                          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <FaIdCard className="text-green-600" />
                            KYC Status
                          </h3>
                          <span
                            className={`px-4 py-2 rounded-full text-sm font-semibold ${
                              selectedKycData.kycStatus === "FULL_KYC"
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
                            <span className="text-sm font-[gilroy-medium] text-gray-700">
                              Progress
                            </span>
                            <span className="text-sm font-semibold text-gray-800">
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
                          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <FaUser className="text-green-600" />
                            User Details
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">
                                User ID
                              </span>
                              <span className="text-sm font-[gilroy-medium] text-gray-800">
                                {selectedKycData.userDetails.userId || "N/A"}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">
                                Name
                              </span>
                              <span className="text-sm font-[gilroy-medium] text-gray-800">
                                {selectedKycData.userDetails.name || "N/A"}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">
                                Mobile No
                              </span>
                              <span className="text-sm font-[gilroy-medium] text-gray-800">
                                {selectedKycData.userDetails.mobileNo || "N/A"}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">
                                Email
                              </span>
                              <span className="text-sm font-[gilroy-medium] text-gray-800">
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
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                              <FaIdCard className="text-blue-600" />
                              Aadhaar Document
                            </h3>
                            {selectedUserId && (
                              <button
                                onClick={() => {
                                  if (selectedUserId) {
                                    dispatch(
                                      kycRevert(selectedUserId, {
                                        aadhar: "true",
                                      }),
                                    );
                                  }
                                }}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-[gilroy-medium]"
                              >
                                Revert
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">
                                Name
                              </span>
                              <span className="text-sm font-[gilroy-medium] text-gray-800">
                                {selectedKycData.aadhaarDoc.name || "N/A"}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">
                                UID
                              </span>
                              <span className="text-sm font-[gilroy-medium] text-gray-800">
                                {selectedKycData.aadhaarDoc.uid || "N/A"}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">
                                DOB
                              </span>
                              <span className="text-sm font-[gilroy-medium] text-gray-800">
                                {selectedKycData.aadhaarDoc.dob || "N/A"}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">
                                Status
                              </span>
                              <span
                                className={`px-3 py-1 rounded-lg text-xs font-semibold inline-block w-fit ${
                                  selectedKycData.aadhaarDoc.status ===
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
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                              <FaIdCard className="text-purple-600" />
                              PAN Document
                            </h3>
                            {selectedUserId && (
                              <button
                                onClick={() => {
                                  if (selectedUserId) {
                                    dispatch(
                                      kycRevert(selectedUserId, {
                                        pan: "true",
                                      }),
                                    );
                                  }
                                }}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-[gilroy-medium]"
                              >
                                Revert
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">
                                PAN Number
                              </span>
                              <span className="text-sm font-[gilroy-medium] text-gray-800">
                                {selectedKycData.panDoc.panNumber || "N/A"}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">
                                PAN Name
                              </span>
                              <span className="text-sm font-[gilroy-medium] text-gray-800">
                                {selectedKycData.panDoc.panName || "N/A"}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">
                                DOB
                              </span>
                              <span className="text-sm font-[gilroy-medium] text-gray-800">
                                {selectedKycData.panDoc.panDob || "N/A"}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">
                                Status
                              </span>
                              <span
                                className={`px-3 py-1 rounded-lg text-xs font-semibold inline-block w-fit ${
                                  selectedKycData.panDoc.status === "Success"
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
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                              <FaBuilding className="text-orange-600" />
                              Outlet Details
                            </h3>
                            {selectedUserId && (
                              <button
                                onClick={() => {
                                  if (selectedUserId) {
                                    dispatch(
                                      kycRevert(selectedUserId, {
                                        shopImage: "true",
                                      }),
                                    );
                                  }
                                }}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-[gilroy-medium]"
                              >
                                Revert
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">
                                Shop Name
                              </span>
                              <span className="text-sm font-[gilroy-medium] text-gray-800">
                                {selectedKycData.outletDetails.shopName ||
                                  "N/A"}
                              </span>
                            </div>
                            {selectedKycData.outletDetails.gstNo && (
                              <div className="flex flex-col">
                                <span className="text-xs text-gray-500 mb-1">
                                  GST No
                                </span>
                                <span className="text-sm font-[gilroy-medium] text-gray-800">
                                  {selectedKycData.outletDetails.gstNo}
                                </span>
                              </div>
                            )}
                            <div className="flex flex-col md:col-span-2">
                              <span className="text-xs text-gray-500 mb-1">
                                Shop Address
                              </span>
                              <span className="text-sm font-[gilroy-medium] text-gray-800">
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
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                              <FaUniversity className="text-indigo-600" />
                              Bank Details
                            </h3>
                            {selectedUserId && (
                              <button
                                onClick={() => {
                                  if (selectedUserId) {
                                    dispatch(
                                      kycRevert(selectedUserId, {
                                        bankVerification: "true",
                                      }),
                                    );
                                  }
                                }}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-[gilroy-medium]"
                              >
                                Revert
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">
                                Account Number
                              </span>
                              <span className="text-sm font-[gilroy-medium] text-gray-800">
                                {selectedKycData.customerBankDetails
                                  .accountNumber || "N/A"}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">
                                IFSC
                              </span>
                              <span className="text-sm font-[gilroy-medium] text-gray-800">
                                {selectedKycData.customerBankDetails.ifsc ||
                                  "N/A"}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">
                                Bank Name
                              </span>
                              <span className="text-sm font-[gilroy-medium] text-gray-800">
                                {selectedKycData.customerBankDetails.bankName ||
                                  "N/A"}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">
                                Beneficiary Name
                              </span>
                              <span className="text-sm font-[gilroy-medium] text-gray-800">
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
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <FaCheckCircle className="text-green-600" />
                          Verification Status
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Mobile Verify */}
                          <div
                            className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                              selectedKycData.userDetails.mobileVerify
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
                              <span className="text-sm font-[gilroy-medium] text-gray-700">
                                Mobile
                              </span>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                selectedKycData.userDetails.mobileVerify
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
                            className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                              selectedKycData.userDetails.emailVerify
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
                              <span className="text-sm font-[gilroy-medium] text-gray-700">
                                Email
                              </span>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                selectedKycData.userDetails.emailVerify
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
                            className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                              selectedKycData.userDetails.aadharVerify
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
                              <span className="text-sm font-[gilroy-medium] text-gray-700">
                                Aadhar
                              </span>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                selectedKycData.userDetails.aadharVerify
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
                            className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                              selectedKycData.userDetails.panVerify
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
                              <span className="text-sm font-[gilroy-medium] text-gray-700">
                                PAN
                              </span>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                selectedKycData.userDetails.panVerify
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
                            className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                              selectedKycData.userDetails.shopDetailsVerify
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
                              <span className="text-sm font-[gilroy-medium] text-gray-700">
                                Shop Details
                              </span>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                selectedKycData.userDetails.shopDetailsVerify
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
                            className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                              selectedKycData.userDetails.imageVerify
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
                              <span className="text-sm font-[gilroy-medium] text-gray-700">
                                Image
                              </span>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                selectedKycData.userDetails.imageVerify
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
                            className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                              selectedKycData.userDetails
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
                              <span className="text-sm font-[gilroy-medium] text-gray-700">
                                Profile with Shop
                              </span>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                selectedKycData.userDetails
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
                            className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                              selectedKycData.userDetails.bankDetailsVerify
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
                              <span className="text-sm font-[gilroy-medium] text-gray-700">
                                Bank Details
                              </span>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                selectedKycData.userDetails.bankDetailsVerify
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
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-[gilroy-medium] shadow-md hover:shadow-lg"
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
