import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  FaSearch,
  FaUpload,
} from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { User, Search, ChevronLeft, ChevronRight } from "lucide-react";
import * as XLSX from "xlsx";
import { ButtonLoader } from "../../../widgets/layout/loader";
import {
  employeeUseList,
  employeeKycData,
  employeeKycUnlock,
  employeeRescendOnboarding,
  employeeDeActiveOnboarding,
  checkEmployeeAepsStatus,
} from "../../../redux/action/whiteLabelAction";
import {
  employeeGetAdminProfileDetails,
  setSelectedUserRole,
} from "../../../redux/action/userProfileAction";
import ProfileDetails from "./ProfileDetails";
import { useNotification } from "../../../context/NotificationContext";
import KycModal from "./KycModal";

const masterDistributionOnboarding = ({
  embedded = false,
  tableData: propTableData = [],
  isLoading: propIsLoading = false,
}) => {
  const dispatch = useDispatch();
  const { showNotification } = useNotification();
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

  // Get response states
  const kycStatusCheckResponse = useSelector(
    (state) => state?.whitelabel?.kycStatusCheck,
  );
  const kycLockStatusResponse = useSelector(
    (state) => state?.whitelabel?.kycLockStatus,
  );
  const employeeAepsStatus = useSelector(
    (state) => state?.whitelabel?.employeeAepsStatus,
  );

  // Refresh table when AEPS status check succeeds
  useEffect(() => {
    if (employeeAepsStatus?.status === "SUCCESS") {
      showNotification({
        message: employeeAepsStatus.message || "AEPS status updated successfully",
        type: "success",
        isCritical: true
      });
      refreshTable();
    } else if (employeeAepsStatus?.status === "FAILURE" || employeeAepsStatus?.status === "Error") {
      showNotification({
        message: employeeAepsStatus.message || "Failed to check AEPS status",
        type: "error",
        isCritical: true
      });
    }
  }, [employeeAepsStatus]);

  const refreshTable = () => {
    const payload = {
      query: { userRole: 3, kycStatus: "pending" }, // Master Distributor role
      options: { sort: { id: -1 }, page: currentPage, paginate: 5 },
      customSearch: debouncedSearchTerm.trim() ? {
        mobileNo: debouncedSearchTerm.trim(),
        name: debouncedSearchTerm.trim(),
      } : {},
    };
    dispatch(employeeUseList(payload));
  };

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch data from API when search term or page changes
  useEffect(() => {
    refreshTable();
  }, [debouncedSearchTerm, currentPage, dispatch]);

  // Refresh table when kycStatusCheck or unlock succeeds
  useEffect(() => {
    if (kycStatusCheckResponse?.status === "SUCCESS" || kycLockStatusResponse?.status === "SUCCESS") {
      refreshTable();
    }
  }, [kycStatusCheckResponse, kycLockStatusResponse]);

  // Use Redux data when search is active, otherwise use prop data
  const responseForTable = useSelector(
    (state) => state?.whitelabel?.whitelabelList?.whitelabelList || [],
  );

  const allTableData = debouncedSearchTerm.trim() && responseForTable.length > 0 
    ? responseForTable 
    : propTableData;
  const isLoading = propIsLoading;

  const totalCountFromRedux = useSelector((state) => {
    const response = state?.whitelabel?.whitelabelList;
    return response?.totalCount || response?.total || 0;
  });

  const totalCount =
    debouncedSearchTerm.trim() && totalCountFromRedux > 0
      ? totalCountFromRedux
      : allTableData.length;

  const totalPages = totalCount > 0 ? Math.ceil(totalCount / 5) : 0;

  const startIndex = (currentPage - 1) * 5;
  const endIndex = startIndex + 5;
  const tableData = allTableData.slice(startIndex, endIndex);

  // Export to Excel function
  const handleExportToExcel = () => {
    if (!allTableData || allTableData.length === 0) {
      showNotification({ message: "No data available to export", type: "error" });
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

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Master Distributor Onboarding");
    XLSX.writeFile(workbook, `MD_Onboarding_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const getWalletValue = (row, type = "mainWallet") => {
    if (!row) return "0";
    const aliases = {
      mainWallet: ["mainWallet", "main_wallet", "walletBalance", "balance"],
      apes1Wallet: ["apes1Wallet", "aeps1Wallet", "aeps1_wallet", "apes1_wallet", "apesWallet1", "aepsWallet1"],
      apes2Wallet: ["apes2Wallet", "aeps2Wallet", "aeps2_wallet", "apes2_wallet", "apesWallet2", "aepsWallet2"],
    };
    const possibleKeys = aliases[type] || [type];
    for (const key of possibleKeys) {
      if (row[key] !== undefined && row[key] !== null) return String(row[key]);
    }
    const walletObj = row.wallet || row.wallets || row.walletDetails;
    if (walletObj && typeof walletObj === "object") {
      for (const key of possibleKeys) {
        if (walletObj[key] !== undefined && walletObj[key] !== null) return String(walletObj[key]);
      }
    }
    return "0";
  };

  const safeString = (value, fallback = "N/A") => {
    if (value === null || value === undefined) return fallback;
    return String(value);
  };

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

  const tableHeaders = [
    "ID", "User", "User ID", "Name", "User Role", "Mobile No", "Email Id", "Parent Name", "Parent Role", "Company", "KYC Status", "KYC Steps", "Main Wallet", "AEPS Status", "AEPS1 Wallet", "AEPS2 Wallet", "Status", "KYC Details", "Action", "Lock Status", "Onboarding", "Date"
  ];

  return (
    <div className={`text-[#1B1717] ${embedded ? "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" : "min-h-screen p-4 sm:p-6"}`}>
      {embedded ? (
        <div className="flex flex-col min-h-[calc(100vh-300px)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4">
            <h2 className="text-xl sm:text-2xl font-normal text-gray-800">
              Master Distributor Onboarding List
            </h2>

            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-end gap-3">
              <div className="flex flex-row gap-3">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => { setFromDate(e.target.value); setCurrentPage(1); }}
                  className="pl-3 pr-3 py-3 border border-gray-300 rounded-lg w-full xs:w-32 text-sm focus:ring-green-500 focus:border-green-500 text-center cursor-pointer"
                />
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => { setToDate(e.target.value); setCurrentPage(1); }}
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
                  {tableHeaders.map(header => (
                    <th key={header} className="px-3 py-4 font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y font-normal text-center divide-gray-100">
                {isLoading ? (
                  <TableBodyLoader colSpan={tableHeaders.length} />
                ) : !tableData || tableData.length === 0 ? (
                  <tr>
                    <td colSpan={tableHeaders.length} className="py-12 text-center">
                      <p className="text-gray-500 text-lg font-[Gilroy-Medium]">No data available</p>
                    </td>
                  </tr>
                ) : (
                  tableData.map((row, index) => (
                    <tr key={row.id || index} className={`text-sm ${index % 2 === 0 ? "bg-green-50" : "bg-white"}`}>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">{safeString(row.id)}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => {
                            const userId = row.id || row.originalItem?.id;
                            if (userId) {
                              dispatch(setSelectedUserRole(row.userRole || "MD"));
                              dispatch(employeeGetAdminProfileDetails(userId));
                              setShowProfileDetails(true);
                            }
                          }}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors cursor-pointer"
                        >
                          <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                        </button>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">{safeString(row.userId)}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">{safeString(row.name)}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">{safeString(row.userRole)}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">{safeString(row.mobileNo)}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">{safeString(row.email)}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">{safeString(row.parentName)}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">{safeString(row.parentRole)}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">{safeString(row.company)}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        <span className={`px-2 py-1 rounded text-xs font-[Gilroy-Medium] ${
                          row.kycStatus?.toLowerCase() === "completed" ? "bg-green-100 text-green-700" :
                          row.kycStatus?.toLowerCase() === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                        }`}>
                          {safeString(row.kycStatus)}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular] text-center">{safeString(row.kycSteps, "0")}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular] text-center">₹{getWalletValue(row, "mainWallet")}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] font-[Gilroy-Regular] text-center">
                        <button
                          onClick={() => row.id && dispatch(checkEmployeeAepsStatus(row.id))}
                          disabled={row.aepsOnboardingStatus === true}
                          className={`px-3 py-1 border border-indigo-500 text-indigo-600 rounded-lg text-xs font-[Gilroy-Medium] transition-colors ${
                            row.aepsOnboardingStatus === true ? "opacity-50 cursor-not-allowed bg-gray-100 border-gray-300 text-gray-400" : "hover:bg-indigo-50"
                          }`}
                        >
                          {row.aepsOnboardingStatus === true ? "Onboarded" : "Check Status"}
                        </button>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular] text-center">{getWalletValue(row, "apes1Wallet")}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular] text-center">{getWalletValue(row, "apes2Wallet")}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        <span className={`px-3 py-1 rounded-lg text-white text-xs font-[Gilroy-Medium] ${row.status?.toLowerCase() === "active" ? "bg-green-600" : "bg-red-600"}`}>
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
                          className="px-3 py-1 border border-black text-green-600 rounded-lg hover:bg-green-50 text-xs font-[Gilroy-Medium] transition-colors"
                        >
                          KYC Details
                        </button>
                      </td>
                      {/* Action - Toggle Button */}
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {(() => {
                          const userId = row.id || row.originalItem?.id;
                          const isActive = row.status?.toLowerCase() === "active";
                          return (
                            <button
                              onClick={() => { if (userId) { /* status check dispatch */ } }}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-offset-1 ${isActive ? "bg-green-600" : "bg-gray-300"}`}
                              role="switch"
                              aria-checked={isActive}
                            >
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? "translate-x-6" : "translate-x-1"}`} />
                            </button>
                          );
                        })()}
                      </td>
                      {/* Lock Status - Colored Button */}
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {(() => {
                          const userId = row.id || row.originalItem?.id;
                          const isLocked = row.lock === true || row.lock === "true";
                          return (
                            <button
                              onClick={() => { if (userId && isLocked) dispatch(employeeKycUnlock(userId)); }}
                              disabled={!isLocked}
                              className={`px-4 py-2 rounded-lg text-xs font-[Gilroy-Semibold] transition-colors ${isLocked ? "bg-red-500 text-white hover:bg-red-600 cursor-pointer" : "bg-green-500 text-white cursor-not-allowed opacity-75"}`}
                            >
                              {isLocked ? "Enable Access" : "Access Enabled"}
                            </button>
                          );
                        })()}
                      </td>
                      {/* Onboarding - Re-send Button */}
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        <button
                          onClick={() => { if (row.id) dispatch(employeeRescendOnboarding(row.id)); }}
                          className="px-3 py-1 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 text-xs font-[Gilroy-Medium] transition-colors"
                        >
                          Re-send
                        </button>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">{formatDate(row.date)}</td>
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
              className={`p-2 border border-gray-300 rounded-lg ${currentPage === 1 || totalPages === 0 ? "text-gray-400 cursor-not-allowed bg-gray-100" : "text-gray-500 hover:bg-gray-100"}`}
            >
              <IoIosArrowBack />
            </button>
            {totalPages > 0 ? (
              Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-sm font-[Gilroy-Medium] ${page === currentPage ? "bg-green-600 text-white" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"}`}
                >
                  {page}
                </button>
              ))
            ) : (
              <span className="w-8 h-8 rounded-lg text-sm font-[Gilroy-Medium] flex items-center justify-center text-gray-500">0</span>
            )}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`p-2 border border-gray-300 rounded-lg ${currentPage === totalPages || totalPages === 0 ? "text-gray-400 cursor-not-allowed bg-gray-100" : "text-gray-500 hover:bg-gray-100"}`}
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
              Master Distributor Onboarding List
            </h2>

            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-end gap-3">
              <div className="flex flex-row gap-3">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => { setFromDate(e.target.value); setCurrentPage(1); }}
                  className="pl-3 pr-3 py-3 border border-gray-300 rounded-lg w-full xs:w-32 text-sm focus:ring-green-500 focus:border-green-500 text-center cursor-pointer"
                />
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => { setToDate(e.target.value); setCurrentPage(1); }}
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
                  {tableHeaders.map(header => (
                    <th key={header} className="px-3 py-4 font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y font-normal text-center divide-gray-100">
                {isLoading ? (
                  <TableBodyLoader colSpan={tableHeaders.length} />
                ) : !tableData || tableData.length === 0 ? (
                  <tr>
                    <td colSpan={tableHeaders.length} className="py-12 text-center">
                      <p className="text-gray-500 text-lg font-[Gilroy-Medium]">No data available</p>
                    </td>
                  </tr>
                ) : (
                  tableData.map((row, index) => (
                    <tr key={row.id || index} className={`text-sm ${index % 2 === 0 ? "bg-green-50" : "bg-white"}`}>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">{safeString(row.id)}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => {
                            const userId = row.id || row.originalItem?.id;
                            if (userId) {
                              dispatch(setSelectedUserRole(row.userRole || "MD"));
                              dispatch(employeeGetAdminProfileDetails(userId));
                              setShowProfileDetails(true);
                            }
                          }}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors cursor-pointer"
                        >
                          <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                        </button>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">{safeString(row.userId)}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">{safeString(row.name)}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">{safeString(row.userRole)}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">{safeString(row.mobileNo)}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">{safeString(row.email)}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">{safeString(row.parentName)}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">{safeString(row.parentRole)}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">{safeString(row.company)}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        <span className={`px-2 py-1 rounded text-xs font-[Gilroy-Medium] ${
                          row.kycStatus?.toLowerCase() === "completed" ? "bg-green-100 text-green-700" :
                          row.kycStatus?.toLowerCase() === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                        }`}>
                          {safeString(row.kycStatus)}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular] text-center">{safeString(row.kycSteps, "0")}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular] text-center">₹{getWalletValue(row, "mainWallet")}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] font-[Gilroy-Regular] text-center">
                        <button
                          onClick={() => row.id && dispatch(checkEmployeeAepsStatus(row.id))}
                          disabled={row.aepsOnboardingStatus === true}
                          className={`px-3 py-1 border border-indigo-500 text-indigo-600 rounded-lg text-xs font-[Gilroy-Medium] transition-colors ${
                            row.aepsOnboardingStatus === true ? "opacity-50 cursor-not-allowed bg-gray-100 border-gray-300 text-gray-400" : "hover:bg-indigo-50"
                          }`}
                        >
                          {row.aepsOnboardingStatus === true ? "Onboarded" : "Check Status"}
                        </button>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular] text-center">{getWalletValue(row, "apes1Wallet")}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular] text-center">{getWalletValue(row, "apes2Wallet")}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        <span className={`px-3 py-1 rounded-lg text-white text-xs font-[Gilroy-Medium] ${row.status?.toLowerCase() === "active" ? "bg-green-600" : "bg-red-600"}`}>
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
                          className="px-3 py-1 border border-black text-green-600 rounded-lg hover:bg-green-50 text-xs font-[Gilroy-Medium] transition-colors"
                        >
                          KYC Details
                        </button>
                      </td>
                      {/* Action - Toggle Button */}
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {(() => {
                          const userId = row.id || row.originalItem?.id;
                          const isActive = row.status?.toLowerCase() === "active";
                          return (
                            <button
                              onClick={() => { if (userId) { /* status check dispatch */ } }}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-offset-1 ${isActive ? "bg-green-600" : "bg-gray-300"}`}
                              role="switch"
                              aria-checked={isActive}
                            >
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? "translate-x-6" : "translate-x-1"}`} />
                            </button>
                          );
                        })()}
                      </td>
                      {/* Lock Status - Colored Button */}
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {(() => {
                          const userId = row.id || row.originalItem?.id;
                          const isLocked = row.lock === true || row.lock === "true";
                          return (
                            <button
                              onClick={() => { if (userId && isLocked) dispatch(employeeKycUnlock(userId)); }}
                              disabled={!isLocked}
                              className={`px-4 py-2 rounded-lg text-xs font-[Gilroy-Semibold] transition-colors ${isLocked ? "bg-red-500 text-white hover:bg-red-600 cursor-pointer" : "bg-green-500 text-white cursor-not-allowed opacity-75"}`}
                            >
                              {isLocked ? "Enable Access" : "Access Enabled"}
                            </button>
                          );
                        })()}
                      </td>
                      {/* Onboarding - Re-send Button */}
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        <button
                          onClick={() => { if (row.id) dispatch(employeeRescendOnboarding(row.id)); }}
                          className="px-3 py-1 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 text-xs font-[Gilroy-Medium] transition-colors"
                        >
                          Re-send
                        </button>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">{formatDate(row.date)}</td>
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
              className={`p-2 border border-gray-300 rounded-lg ${currentPage === 1 || totalPages === 0 ? "text-gray-400 cursor-not-allowed bg-gray-100" : "text-gray-500 hover:bg-gray-100"}`}
            >
              <IoIosArrowBack />
            </button>
            {totalPages > 0 ? (
              Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-sm font-[Gilroy-Medium] ${page === currentPage ? "bg-green-600 text-white" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"}`}
                >
                  {page}
                </button>
              ))
            ) : (
              <span className="w-8 h-8 rounded-lg text-sm font-[Gilroy-Medium] flex items-center justify-center text-gray-500">0</span>
            )}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`p-2 border border-gray-300 rounded-lg ${currentPage === totalPages || totalPages === 0 ? "text-gray-400 cursor-not-allowed bg-gray-100" : "text-gray-500 hover:bg-gray-100"}`}
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
          refreshTable();
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

export default masterDistributionOnboarding;
