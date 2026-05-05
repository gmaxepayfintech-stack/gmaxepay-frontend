import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ChevronLeft, ChevronRight, User, Search, Upload } from "lucide-react";
import * as XLSX from "xlsx";
import { ButtonLoader } from "../../../widgets/layout/loader";

import {
  employeeUseList,
  employeeKycData,
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

const RetailerOnboarding = ({
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
  const [showKycModal, setShowKycModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [kycDataRefreshKey, setKycDataRefreshKey] = useState(0);
  const [showProfileDetails, setShowProfileDetails] = useState(false);

  // Get KYC details from Redux state
  const kycDetailsState = useSelector((state) => state?.whitelabel?.kycDetails);
  const kycRetrieved = kycDetailsState?.data || null;

  // Get response states
  const kycStatusCheckResponse = useSelector(
    (state) => state?.whitelabel?.kycStatusCheck,
  );
  const kycRevertResponse = useSelector(
    (state) => state?.whitelabel?.kycRevert,
  );
  const kycLockStatusResponse = useSelector(
    (state) => state?.whitelabel?.kycLockStatus,
  );
  const employeeAepsStatusResponse = useSelector(
    (state) => state?.whitelabel?.employeeAepsStatus
  );

  const { showNotification } = useNotification();

  // Refresh table when AEPS status check succeeds
  useEffect(() => {
    if (employeeAepsStatusResponse?.status === "SUCCESS") {
      showNotification({
        message: employeeAepsStatusResponse?.message || "AEPS Status updated successfully",
        type: "success",
        isCritical: true
      });
      refreshTable();
    } else if (employeeAepsStatusResponse?.status === "FAILURE" || employeeAepsStatusResponse?.status === "Error") {
      showNotification({
        message: employeeAepsStatusResponse?.message || "Failed to update AEPS status",
        type: "error",
        isCritical: true
      });
    }
  }, [employeeAepsStatusResponse]);

  const refreshTable = () => {
    const payload = {
      query: { userRole: 5, kycStatus: "pending" },
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
  const reduxTableData = useSelector(
    (state) => state?.whitelabel?.whitelabelList?.whitelabelList || [],
  );
  const finalTableData = debouncedSearchTerm.trim() ? reduxTableData : propTableData;
  
  const totalCountFromRedux = useSelector((state) => {
    const response = state?.whitelabel?.whitelabelList;
    return response?.totalCount || response?.total || 0;
  });

  const finalTotalCount = debouncedSearchTerm.trim() && totalCountFromRedux > 0 ? totalCountFromRedux : finalTableData.length;
  const finalTotalPages = finalTotalCount > 0 ? Math.ceil(finalTotalCount / 5) : 0;
  const displayTableData = finalTableData.slice(0, 5); // Assuming the API handles pagination for redux data

  // Export to Excel function
  const handleExportToExcel = () => {
    if (!finalTableData || finalTableData.length === 0) {
      showNotification({ message: "No data available to export", type: "error" });
      return;
    }

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

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Retailer Onboarding");
    XLSX.writeFile(workbook, `Retailer_Onboarding_${new Date().toISOString().split("T")[0]}.xlsx`);
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

  return (
    <div className={`text-[#1B1717] ${embedded ? "" : "min-h-screen p-4 sm:p-6"}`}>
      <div className={`flex flex-col ${embedded ? "min-h-[calc(100vh-300px)]" : "bg-white rounded-xl shadow-sm p-6"}`}>
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-xl sm:text-2xl font-[Gilroy-Medium] text-[#1B1717]">
            Retailer Onboarding List
          </h1>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#039155] outline-none"
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              min={fromDate}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#039155] outline-none"
            />
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search by Mobile or Name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-4 pr-10 py-2 w-full text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#039155] outline-none"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
            <button
              onClick={handleExportToExcel}
              className="flex items-center justify-center gap-2 bg-[#039155] text-white px-4 py-2 rounded-lg font-[Gilroy-Medium] hover:bg-green-700 transition-colors shadow-sm"
            >
              Export <Upload className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="flex-1 overflow-x-auto rounded-xl border border-gray-100 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <table className="w-full text-center border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["ID", "User", "User ID", "Name", "Role", "Mobile", "Email", "Parent", "Company", "KYC Status", "KYC Steps", "Wallet", "AEPS Status", "Action", "Lock Status", "Date"].map((header) => (
                  <th key={header} className="py-4 px-4 text-sm font-[Gilroy-SemiBold] text-gray-600 whitespace-nowrap uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {displayTableData.length === 0 ? (
                <tr>
                  <td colSpan={16} className="py-20 text-center text-gray-500 font-[Gilroy-Medium]">
                    No data available
                  </td>
                </tr>
              ) : (
                displayTableData.map((row, index) => (
                  <tr key={row.id || index} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-4 text-sm font-[Gilroy-Medium] text-gray-800">{safeString(row.id)}</td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => {
                          const userId = row.id || row.originalItem?.id;
                          if (userId) {
                            dispatch(setSelectedUserRole(row.userRole || "R"));
                            dispatch(employeeGetAdminProfileDetails(userId));
                            setShowProfileDetails(true);
                          }
                        }}
                        className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 hover:bg-green-100 transition-colors mx-auto"
                      >
                        <User className="w-5 h-5" />
                      </button>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">{safeString(row.userId)}</td>
                    <td className="py-4 px-4 text-sm font-[Gilroy-Medium] text-gray-800">{safeString(row.name)}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">{safeString(row.userRole)}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">{safeString(row.mobileNo)}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">{safeString(row.email)}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">{safeString(row.parentName)}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">{safeString(row.company)}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-[Gilroy-SemiBold] ${
                        row.kycStatus?.toLowerCase() === "completed" ? "bg-green-100 text-green-700" :
                        row.kycStatus?.toLowerCase() === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                      }`}>
                        {safeString(row.kycStatus)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm font-[Gilroy-Medium]">{safeString(row.kycSteps, "0")}</td>
                    <td className="py-4 px-4 text-sm font-[Gilroy-Medium] text-green-600">₹{getWalletValue(row, "mainWallet")}</td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => row.id && dispatch(checkEmployeeAepsStatus(row.id))}
                        disabled={row.aepsOnboardingStatus === true}
                        className={`px-3 py-1 rounded-lg text-xs font-[Gilroy-SemiBold] border transition-all ${
                          row.aepsOnboardingStatus === true ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed" : "border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                        }`}
                      >
                        {row.aepsOnboardingStatus === true ? "Onboarded" : "Check AEPS"}
                      </button>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => {
                          const userId = row.id || row.originalItem?.id;
                          if (userId) {
                            setSelectedUserId(userId);
                            dispatch(employeeKycData(userId));
                            setShowKycModal(true);
                          }
                        }}
                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-[Gilroy-SemiBold] hover:bg-green-700 transition-colors shadow-sm"
                      >
                        KYC Details
                      </button>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => {
                          const isLocked = row.lock === true || row.lock === "true";
                          if (row.id && isLocked) dispatch(employeeKycUnlock(row.id));
                        }}
                        className={`px-4 py-1.5 rounded-lg text-xs font-[Gilroy-SemiBold] transition-all ${
                          (row.lock === true || row.lock === "true") ? "bg-red-500 text-white hover:bg-red-600" : "bg-green-500 text-white opacity-75 cursor-not-allowed"
                        }`}
                      >
                        {(row.lock === true || row.lock === "true") ? "Enable Access" : "Access Enabled"}
                      </button>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">{formatDate(row.date)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || finalTotalPages === 0}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-1">
            {Array.from({ length: finalTotalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-lg text-sm font-[Gilroy-Medium] transition-all ${
                  page === currentPage ? "bg-[#039155] text-white shadow-md" : "hover:bg-gray-50 text-gray-600 border border-gray-200"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCurrentPage(prev => Math.min(finalTotalPages, prev + 1))}
            disabled={currentPage === finalTotalPages || finalTotalPages === 0}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Standardized KYC Modal */}
      <KycModal
        isOpen={showKycModal}
        onClose={() => {
          setShowKycModal(false);
          setSelectedUserId(null);
        }}
        userId={selectedUserId}
        refreshKey={kycDataRefreshKey}
        onRevertSuccess={() => setKycDataRefreshKey((prev) => prev + 1)}
      />
    </div>
  );
};

export default RetailerOnboarding;
