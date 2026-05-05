import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  FaSearch,
  FaUpload,
} from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { User } from "lucide-react";
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
import KycModal from "./KycModal";

const MasterDistribution = ({
  embedded = false,
  tableData: propTableData = [],
  isLoading: propIsLoading = false,
}) => {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
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

  // Get data from Redux when search is active, otherwise use prop data
  const responseForTable = useSelector(
    (state) => state?.whitelabel?.whitelabelList?.whitelabelList || [],
  );

  // Get KYC details from Redux state - WATCH the entire kycDetails object to detect changes
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

  // Calculate total pages based on total count (10 records per page)
  // If there's at least 1 record, show at least 1 page, otherwise show 0
  const totalPages = totalCount > 0 ? Math.ceil(totalCount / 10) : 0;

  // Slice data to show only 10 records per page
  const startIndex = (currentPage - 1) * 10;
  const endIndex = startIndex + 10;
  const tableData = allTableData.slice(startIndex, endIndex);

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

  // Fetch data from API when search term changes - DISABLED for demo
  useEffect(() => {
    if (debouncedSearchTerm.trim()) {
      const payload = {
        query: {
          userRole: 3, // Master Distributor role
        },
        options: {
          sort: { id: -1 },
          page: currentPage,
          paginate: 10,
        },
        customSearch: {
          mobileNo: debouncedSearchTerm.trim(),
          name: debouncedSearchTerm.trim(),
        },
      };

      dispatch(employeeUseList(payload));
    }
  }, [debouncedSearchTerm, currentPage, dispatch]);

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
      // Refresh table data by dispatching useListAction again
      const payload = {
        query: {
          userRole: 3, // Master Distributor role
        },
        options: {
          sort: { id: -1 },
          page: currentPage,
          paginate: 10,
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
  }, [kycStatusCheckResponse, debouncedSearchTerm, currentPage, dispatch]);

  // Refresh table when kycUnlock succeeds
  useEffect(() => {
    if (kycLockStatusResponse?.status === "SUCCESS") {
      // Refresh table data by dispatching useListAction again
      const payload = {
        query: {
          userRole: 3, // Master Distributor role
        },
        options: {
          sort: { id: -1 },
          page: currentPage,
          paginate: 10,
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
      setIsReverting(false);
      setShowRevertConfirm(false);
      setRevertPayload(null);
      // Clear current data to force re-render
      setSelectedKycData(null);
      // Small delay to ensure backend has processed the revert
      const timer = setTimeout(() => {
        // Force update by incrementing refresh key
        setKycDataRefreshKey((prev) => prev + 1);
        // Refresh KYC data after revert
        dispatch(employeeKycData(selectedUserId));
      }, 500);

      return () => clearTimeout(timer);
    } else if (kycRevertResponse?.status === "ERROR" || kycRevertResponse?.status === "FAILED") {
      setIsReverting(false);
      setShowRevertConfirm(false);
      setRevertPayload(null);
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
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setCurrentPage(1); // Reset to first page when date changes
                  }}
                  className="pl-3 pr-3 py-3 border border-gray-300 rounded-lg w-full xs:w-32 text-sm focus:ring-green-500 focus:border-green-500 text-center cursor-pointer"
                />

                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setCurrentPage(1); // Reset to first page when date changes
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
                              dispatch(employeeGetAdminProfileDetails(userId));

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
                              setIsKycModalLoading(true);
                              dispatch(employeeKycData(userId));

                              // Small delay to allow Redux state update then show modal
                              setTimeout(() => {
                                setIsKycModalLoading(false);
                                setShowKycModal(true);
                                setActiveTab("overview");
                                setZoomedImage(null);
                              }, 500);
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
                                  // Dispatch unlock action with the row ID
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
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px]">
                        {(() => {
                          const userId = row.id || row.originalItem?.id;
                          return (
                            <button
                              onClick={() => {
                                if (userId) {
                                  dispatch(employeeRescendOnboarding(userId));
                                  alert(`Onboarding re-sent to ${row.userName || row.name || "user"}`);
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
                                  dispatch(employeeDeActiveOnboarding(userId));
                                  alert(`Deactivation request sent for ${row.userName || row.name || "user"}`);
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
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setCurrentPage(1); // Reset to first page when date changes
                  }}
                  className="pl-3 pr-3 py-3 border border-gray-300 rounded-lg w-full xs:w-32 text-sm focus:ring-green-500 focus:border-green-500 text-center cursor-pointer"
                />

                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setCurrentPage(1); // Reset to first page when date changes
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
                              // const original = row.originalItem || {};
                              // dispatch(getAdminProfileDetails(userId));

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
                              // dispatch(kycDataAction(userId));
                              
                              // Mock loading delay
                              setTimeout(() => {
                                setIsKycModalLoading(false);
                                setSelectedKycData(DUMMY_KYC_DETAILS);
                                setActiveTab("overview");
                                setZoomedImage(null);
                                setShowKycModal(true);
                              }, 800);
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
                                  /*
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
                                  */
                                  alert(`Account status updated for ${row.userName || row.name || "user"}`);
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
                                // Only trigger API when button is in "Locked" state
                                if (userId && isLocked) {
                                  // Dispatch unlock action with the row ID
                                  // dispatch(kycUnlock(userId));
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
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] font-[Gilroy-Medium]">
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
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] font-[Gilroy-Medium]">
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

      {/* Standardized KYC Modal Component */}
      <KycModal
        isOpen={showKycModal}
        onClose={() => {
          setShowKycModal(false);
          setSelectedUserId(null);
          setSelectedKycData(null);
        }}
        kycData={selectedKycData}
        isLoading={isKycModalLoading}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        zoomedImage={zoomedImage}
        setZoomedImage={setZoomedImage}
        selectedUserId={selectedUserId}
        revertAction={employeeKycRevert}
        kycDataAction={employeeKycData}
        kycDataRefreshKey={kycDataRefreshKey}
        setKycDataRefreshKey={setKycDataRefreshKey}
      />
    </div>
  );
};

export default MasterDistribution;
