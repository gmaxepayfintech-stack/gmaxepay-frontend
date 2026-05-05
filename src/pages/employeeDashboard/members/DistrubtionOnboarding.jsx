import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  User,
  Search,
  Upload,
} from "lucide-react";
import * as XLSX from "xlsx";
import {
  employeeUseList,
  employeeKycData,
  employeeKycStatusCheck,
  employeeKycUnlock,
  employeeKycRevert,
  employeeRescendOnboarding,
  employeeDeActiveOnboarding,
} from "../../../redux/action/whiteLabelAction";
import ProfileDetails from "./ProfileDetails";
import {
  employeeGetAdminProfileDetails,
  setSelectedUserRole,
} from "../../../redux/action/userProfileAction";
import { checkEmployeeAepsStatus } from "../../../redux/action/whiteLabelAction";
import { useNotification } from "../../../context/NotificationContext";
import { ButtonLoader } from "../../../widgets/layout/loader";
const DistrubtionOnboarding = ({
  embedded = false,
  tableData: propTableData = [],
}) => {
  const dispatch = useDispatch();
  const { showNotification } = useNotification();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedKyc, setSelectedKyc] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedKycData, setSelectedKycData] = useState(null);
  const [showKycModal, setShowKycModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [kycDataRefreshKey, setKycDataRefreshKey] = useState(0);
  const [showProfileDetails, setShowProfileDetails] = useState(false);

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

  const employeeAepsStatusResponse = useSelector(
    (state) => state?.whitelabel?.employeeAepsStatus
  );

  // Refresh table when AEPS status check succeeds
  useEffect(() => {
    if (employeeAepsStatusResponse?.status === "SUCCESS") {
      showNotification({
        message: employeeAepsStatusResponse?.message || "AEPS Status updated successfully",
        type: "success",
        isCritical: true
      });
      
      const bothDatesSelected = fromDate && toDate;
      const bothDatesNull = !fromDate && !toDate;
      if (!bothDatesSelected && !bothDatesNull) {
        return;
      }
      
      const payload = {
        query: {
          userRole: 4, // Distributor role
          ...(selectedKyc ? { kycStatus: selectedKyc } : { kycStatus: "pending" }),
          ...(bothDatesSelected ? { startDate: fromDate.replace(/-/g, "/"), endDate: toDate.replace(/-/g, "/") } : {}),
        },
        options: { sort: { id: -1 }, page: currentPage, paginate: 10 },
        customSearch: {},
      };
      dispatch(employeeUseList(payload));
    } else if (employeeAepsStatusResponse?.status === "FAILURE" || employeeAepsStatusResponse?.status === "Error") {
      showNotification({
        message: employeeAepsStatusResponse?.message || "Failed to update AEPS status",
        type: "error",
        isCritical: true
      });
    }
  }, [employeeAepsStatusResponse, showNotification, dispatch, currentPage, selectedKyc, fromDate, toDate]);

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
  const totalPages = Math.ceil(totalCount / 10) || 1;

  // Slice data to show only 10 records per page
  const startIndex = (currentPage - 1) * 10;
  const endIndex = startIndex + 10;
  const tableData = allTableData.slice(startIndex, endIndex);




  // Export to Excel function
  const handleExportToExcel = () => {
    if (!allTableData || allTableData.length === 0) {
      alert("No data available to export");
      return;
    }

    // Prepare data for Excel export
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
                    className="px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] bg-white w-full sm:w-auto"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* To Date */}
                <div className="relative">
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] bg-white w-full sm:w-auto"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Export Button */}
                <button
                  onClick={handleExportToExcel}
                  className="flex items-center justify-center gap-2 bg-[#039155] text-white px-4 py-3 rounded-lg font-[Gilroy-Medium] hover:bg-green-700 shadow-md text-sm sm:text-base"
                >
                  Export <Upload className="text-xs" />
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
                                // Additionally fetch admin profile details (slab visibility, etc.)
                                dispatch(employeeGetAdminProfileDetails(userId));

                                setShowProfileDetails(true);
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
                                dispatch(employeeKycData(userId));
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
                                    if (isActive) {
                                      dispatch(
                                        employeeKycStatusCheck(userId, {
                                          isActive: "false",
                                        }),
                                      );
                                    } else {
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
                        <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Medium] text-[14px]">
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
                        <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Medium] text-[14px]">
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
                        <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                          {row.date || "N/A"}
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
                  className="px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] bg-white w-full sm:w-auto"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* To Date */}
              <div className="relative">
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] bg-white w-full sm:w-auto"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
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
                              // dispatch(kycDataAction(userId));
                              setSelectedKycData({
                                kycStatus: row.kycStatus || "Pending",
                                kycSteps: row.kycSteps || "3",
                                userDetails: {
                                  userId: row.userId,
                                  name: row.name,
                                  mobileNo: row.mobileNo,
                                  email: row.emailId
                                }
                              });
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
                      {/* Action */}
                      <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              console.log("Edit:", row.originalItem || row);
                            }}
                            className="text-gray-600 hover:text-green-600 transition-colors"
                          >
                            <FaEdit className="text-sm" />
                          </button>
                          <button
                            onClick={() => {
                              console.log("Delete:", row.originalItem || row);
                            }}
                            className="text-gray-600 hover:text-red-600 transition-colors"
                          >
                            <FaTrash className="text-sm" />
                          </button>
                        </div>
                      </td>
                      {/* Date */}
                      <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                        {row.date || "N/A"}
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

export default DistrubtionOnboarding;
