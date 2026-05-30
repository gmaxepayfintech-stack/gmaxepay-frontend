import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Calendar,
  Search,
  Upload,
  User,
  X,
  ChevronLeft,
  ChevronRight,
  Wallet
} from "lucide-react";
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
import { employeeCreditDebit } from "../../../redux/action/fundAction";
import { useNotification } from "../../../context/NotificationContext";
import KycModal from "./KycModal";
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


const Distribution = ({
  embedded = false,
  tableData: propTableData = [],
  isLoading: propIsLoading = false,
}) => {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [showKycModal, setShowKycModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [kycDataRefreshKey, setKycDataRefreshKey] = useState(0);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [showProfileDetails, setShowProfileDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const { showNotification, success: notifySuccess, error: notifyError } = useNotification();
  
  // Fund Adjust Modal State
  const [fundModal, setFundModal] = useState({
    show: false,
    userId: null,
    userName: "",
    amount: "",
    action: "CREDIT",
    walletType: "mainWallet",
    remarks: "",
    isSubmitting: false,
  });

  // Handle Fund Adjust submission
  const handleFundAdjustSubmit = async () => {
    const { userId, amount, action, walletType, remarks } = fundModal;
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      notifyError({ message: "Please enter a valid amount greater than 0", isCritical: true });
      return;
    }
    if (!remarks.trim()) {
      notifyError({ message: "Remarks are required", isCritical: true });
      return;
    }
    setFundModal((prev) => ({ ...prev, isSubmitting: true }));
    try {
      const result = await dispatch(employeeCreditDebit({
        userId: Number(userId),
        amount: Number(amount),
        action,
        walletType,
        remarks: remarks.trim(),
      }));
      if (result?.status === "SUCCESS") {
        notifySuccess({ message: result.message || `Fund ${action === 'CREDIT' ? 'credited' : 'debited'} successfully!`, isCritical: true });
        setFundModal({ show: false, userId: null, userName: "", amount: "", action: "CREDIT", walletType: "mainWallet", remarks: "", isSubmitting: false });
      } else {
        notifyError({ message: result?.message || "Fund adjustment failed. Please try again.", isCritical: true });
        setFundModal((prev) => ({ ...prev, isSubmitting: false }));
      }
    } catch {
      notifyError({ message: "An unexpected error occurred.", isCritical: true });
      setFundModal((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

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
      if (debouncedSearchTerm.trim()) {
        const payload = {
          query: { userRole: 4 },
          options: { sort: { id: -1 }, page: currentPage, paginate: 5 },
          customSearch: {
            mobileNo: debouncedSearchTerm.trim(),
            name: debouncedSearchTerm.trim(),
          },
        };
        dispatch(employeeUseList(payload));
      } else {
         const payload = {
          query: { userRole: 4 },
          options: { sort: { id: -1 }, page: currentPage, paginate: 5 },
        };
        dispatch(employeeUseList(payload));
      }
    } else if (employeeAepsStatusResponse?.status === "FAILURE" || employeeAepsStatusResponse?.status === "Error") {
      showNotification({
        message: employeeAepsStatusResponse?.message || "Failed to update AEPS status",
        type: "error",
        isCritical: true
      });
    }
  }, [employeeAepsStatusResponse, showNotification, dispatch, currentPage, debouncedSearchTerm]);



  // Get Redux data for search
  const reduxTableData = useSelector(
    (state) => state?.whitelabel?.whitelabelList?.whitelabelList || [],
  );

  // Use API data or prop data
  const allTableData = debouncedSearchTerm.trim() && reduxTableData.length > 0 
    ? reduxTableData 
    : propTableData;
  const isLoading = propIsLoading;

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

  // Debounce search term to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch data from API when debouncedSearchTerm or currentPage changes
  useEffect(() => {
    if (debouncedSearchTerm.trim()) {
      const payload = {
        query: {
          userRole: 4, // Distributor role
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
      "AEPS1 Wallet": row.aeps1Wallet || "0",
      "AEPS2 Wallet": row.aeps2Wallet || "0",
      // "Remaining Days": row.remainingDays || "N/A",
      Status: row.status || "Active",
      Approved: row.approved ? "Yes" : "No",
    }));

    // Create a new workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Distributor Data");

    // Generate Excel file and download
    const fileName = `Distributor_Export_${new Date().toISOString().split("T")[0]}.xlsx`;
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
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4">
            <h2 className="text-xl sm:text-2xl font-normal text-gray-800">
              Distributor
            </h2>

            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-end gap-3">
              <div className="flex flex-row gap-3">
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
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-4 pr-10 py-3 border border-gray-300 rounded-xl w-full text-sm focus:ring-[#039155] focus:border-[#039155]"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>

              <button
                onClick={handleExportToExcel}
                className="flex items-center justify-center gap-2 bg-[#039155] text-white px-4 py-3 rounded-lg font-[Gilroy-Medium] hover:bg-green-700 shadow-md text-sm sm:text-base"
              >
                Export <Upload className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="mb-4 overflow-x-auto rounded-3xl bg-white [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <table className="min-w-[720px] sm:min-w-full divide-y">
              <thead className="bg-white text-center">
                <tr>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-sm text-[#1B1717] tracking-wider whitespace-nowrap">
                    ID
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    User
                  </th>

                  <th className="px-3 py-4  font-[Gilroy-Medium] text-sm text-[#1B1717] tracking-wider whitespace-nowrap">
                    User ID
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-sm text-[#1B1717] tracking-wider whitespace-nowrap">
                    Name
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-sm text-[#1B1717] tracking-wider whitespace-nowrap">
                    User Role
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-sm text-[#1B1717] tracking-wider whitespace-nowrap">
                    Mobile No
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-sm text-[#1B1717] tracking-wider whitespace-nowrap">
                    Email Id
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-sm text-[#1B1717] tracking-wider whitespace-nowrap">
                    Parent Name
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-sm text-[#1B1717] tracking-wider whitespace-nowrap">
                    Parent Role
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-sm text-[#1B1717] tracking-wider whitespace-nowrap">
                    Company Name
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-sm text-[#1B1717] tracking-wider whitespace-nowrap">
                    KYC Status
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-sm text-[#1B1717] tracking-wider whitespace-nowrap">
                    KYC Steps
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-sm text-[#1B1717] tracking-wider whitespace-nowrap">
                    Main Wallet
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-sm text-[#1B1717] tracking-wider whitespace-nowrap">
                    AEPS 1 Status
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-sm text-[#1B1717] tracking-wider whitespace-nowrap">
                    AEPS1 Wallet
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-sm text-[#1B1717] tracking-wider whitespace-nowrap">
                    AEPS2 Wallet
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-sm text-[#1B1717] tracking-wider whitespace-nowrap">
                    Fund Adjust
                  </th>
                  {/* <th className="px-3 py-4  font-[Gilroy-Medium] text-sm text-[#1B1717] tracking-wider whitespace-nowrap">
                    Remaining Days
                  </th> */}
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-sm text-[#1B1717] tracking-wider whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-sm text-[#1B1717] tracking-wider whitespace-nowrap">
                    KYC Details
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-sm text-[#1B1717] tracking-wider whitespace-nowrap">
                    Action
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-sm text-[#1B1717] tracking-wider whitespace-nowrap">
                    Lock Status
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-sm text-[#1B1717] tracking-wider whitespace-nowrap">
                    Onboarding
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-sm text-[#1B1717] tracking-wider whitespace-nowrap">
                    Token Expire
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-sm text-[#1B1717] tracking-wider whitespace-nowrap">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y font-normal text-center divide-gray-100">
                {isLoading ? (
                  <TableBodyLoader colSpan={14} />
                ) : !tableData || tableData.length === 0 ? (
                  <tr>
                    <td colSpan={22} className="py-12 text-center">
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
                                "D"; // Distributor
                              // dispatch(setSelectedUserRole(roleFromRow));

                              // dispatch(employeeGetAdminProfileDetails(userId));

                              setShowProfileDetails(true);
                            }
                          }}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors cursor-pointer"
                        >
                          <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                        </button>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px]">
                        {row.userId || row.userAgentCode || "N/A"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px]">
                        {row.name || row.userName || "N/A"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px]">
                        {row.userRole || "N/A"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px]">
                        {row.mobileNo ||
                          row.mobile ||
                          row.mobileNumber ||
                          "N/A"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px]">
                        {row.emailId || row.email || "N/A"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px]">
                        {row.parentName || "N/A"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px]">
                        {row.parentRole || "N/A"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px]">
                        {row.companyName || "N/A"}
                      </td>
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
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] text-center">
                        {row.kycSteps || "0"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] text-center">
                        {row.mainWallet || "0"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] text-center">
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
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] text-center">
                        {row.aeps1Wallet || "0"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] text-center">
                        {row.aeps2Wallet || "0"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px]">
                        <button
                          onClick={() => setFundModal({
                            show: true,
                            userId: row.id || row.originalItem?.id,
                            userName: row.name || row.userName || "User",
                            amount: "",
                            action: "CREDIT",
                            walletType: "mainWallet",
                            remarks: "Manual balance adjustment by Employee on behalf of Company",
                            isSubmitting: false,
                          })}
                          className="flex items-center gap-1.5 bg-[#039155] hover:bg-green-700 text-white px-3 py-1.5 rounded-lg font-[Gilroy-Medium] text-xs transition-all active:scale-95 shadow-sm"
                        >
                          <Wallet className="w-3.5 h-3.5" />
                          <span>Fund Adjust</span>
                        </button>
                      </td>
                      {/* <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] text-center">
                        {row.remainingDays || "N/A"}
                      </td> */}
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Medium] text-[14px]">
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
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Medium] text-[14px]">
                        <button
                          onClick={() => {
                            const userId = row.id || row.originalItem?.id;
                            if (userId) {
                              setSelectedUserId(userId);
                              setShowKycModal(true);
                            }
                          }}
                          className="px-3 py-1 border border-[#039155] text-[#039155] rounded-lg hover:bg-green-50 text-xs font-[Gilroy-Medium]"
                        >
                          KYC Details
                        </button>
                      </td>
                      {/* Action - Toggle Button */}
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Medium] text-[14px]">
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
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Medium] text-[14px]">
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
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px]">
                        {row.date || "N/A"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center mt-6 space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`p-2 border border-gray-300 rounded-lg transition ${currentPage === 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-500 hover:bg-gray-100"
                }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg text-sm font-[Gilroy-Medium] transition ${page === currentPage
                  ? "bg-[#039155] text-white shadow-md"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
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
              className={`p-2 border border-gray-300 rounded-lg transition ${currentPage === totalPages
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-500 hover:bg-gray-100"
                }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-normal text-gray-800">
              Distributor
            </h2>

            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-end gap-3">
              <div className="flex flex-row gap-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="From Date"
                    className="pl-3 pr-8 py-3 border border-gray-300 rounded-lg w-full xs:w-32 text-sm focus:ring-[#039155] focus:border-[#039155] text-center"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="To Date"
                    className="pl-3 pr-8 py-3 border border-gray-300 rounded-lg w-full xs:w-32 text-sm focus:ring-[#039155] focus:border-[#039155] text-center"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
              </div>

              <div className="relative w-full sm:w-48">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-4 pr-10 py-3 border border-gray-300 rounded-xl w-full text-sm focus:ring-[#039155] focus:border-[#039155]"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>

              <button
                onClick={handleExportToExcel}
                className="flex items-center justify-center gap-2 bg-[#039155] text-white px-4 py-3 rounded-lg font-[Gilroy-Medium] hover:bg-green-700 shadow-md text-sm sm:text-base"
              >
                Export <Upload className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="mb-4 overflow-x-auto rounded-xl bg-white [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <table className="min-w-[720px] sm:min-w-full divide-y">
              <thead className="bg-white text-center">
                <tr>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-sm text-[#1B1717] tracking-wider whitespace-nowrap">
                    ID
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-sm text-[#1B1717] tracking-wider whitespace-nowrap">
                    User
                  </th>

                  <th className="px-3 py-4  font-[Gilroy-Medium] text-sm text-[#1B1717] tracking-wider whitespace-nowrap">
                    User ID
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-sm text-[#1B1717] tracking-wider whitespace-nowrap">
                    Name
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-sm text-[#1B1717] tracking-wider whitespace-nowrap">
                    User Role
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-sm text-[#1B1717] tracking-wider whitespace-nowrap">
                    Mobile No
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-sm text-[#1B1717] tracking-wider whitespace-nowrap">
                    Email Id
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-sm text-[#1B1717] tracking-wider whitespace-nowrap">
                    Parent Name
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-sm text-[#1B1717] tracking-wider whitespace-nowrap">
                    Parent Role
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-sm text-[#1B1717] tracking-wider whitespace-nowrap">
                    Company Name
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-sm text-[#1B1717] tracking-wider whitespace-nowrap">
                    KYC Status
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-sm text-[#1B1717] tracking-wider whitespace-nowrap">
                    KYC Steps
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-sm text-[#1B1717] tracking-wider whitespace-nowrap">
                    Main Wallet
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-sm text-[#1B1717] tracking-wider whitespace-nowrap">
                    AEPS1 Wallet
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-sm text-[#1B1717] tracking-wider whitespace-nowrap">
                    AEPS2 Wallet
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-sm text-[#1B1717] tracking-wider whitespace-nowrap">
                    Fund Adjust
                  </th>
                  {/* <th className="px-3 py-4  font-[Gilroy-Medium] text-sm text-[#1B1717] tracking-wider whitespace-nowrap">
                    Remaining Days
                  </th> */}
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-sm text-[#1B1717] tracking-wider whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-sm text-[#1B1717] tracking-wider whitespace-nowrap">
                    KYC Details
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-sm text-[#1B1717] tracking-wider whitespace-nowrap">
                    Action
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-sm text-[#1B1717] tracking-wider whitespace-nowrap">
                    Lock Status
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-sm text-[#1B1717] tracking-wider whitespace-nowrap">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y font-normal text-center divide-gray-100">
                {!tableData || tableData.length === 0 ? (
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
                      key={index}
                      className={`text-sm ${index % 2 === 0 ? "bg-green-50" : "bg-white"}`}
                    >
                      {/* ID */}
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px]">
                        {row.id || "N/A"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] font-[Gilroy-Medium] text-center">
                        <button
                          onClick={() => {
                            const userId = row.id || row.originalItem?.id;
                            if (userId) {
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
                      {/* Mobile */}
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] font-[Gilroy-Regular]">
                        {row.mobileNo ||
                          row.mobile ||
                          row.mobileNumber ||
                          "N/A"}
                      </td>
                      {/* Email */}
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
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] font-[Gilroy-Regular] text-center">
                        {row.kycSteps || "0"}
                      </td>
                      {/* Main Wallet */}
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] font-[Gilroy-Regular] text-center">
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
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px]">
                        <button
                          onClick={() => setFundModal({
                            show: true,
                            userId: row.id || row.originalItem?.id,
                            userName: row.name || row.userName || "User",
                            amount: "",
                            action: "CREDIT",
                            walletType: "mainWallet",
                            remarks: "Manual balance adjustment by Employee on behalf of Company",
                            isSubmitting: false,
                          })}
                          className="flex items-center gap-1.5 bg-[#039155] hover:bg-green-700 text-white px-3 py-1.5 rounded-lg font-[Gilroy-Medium] text-xs transition-all active:scale-95 shadow-sm"
                        >
                          <Wallet className="w-3.5 h-3.5" />
                          <span>Fund Adjust</span>
                        </button>
                      </td>
                      {/* Remaining Days */}
                      {/* <td className="px-4 py-4 whitespace-nowrap text-[14px] font-[Gilroy-Regular] text-center">
                        {row.remainingDays || "N/A"}
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
                              setShowKycModal(true);
                            }
                          }}
                          className="px-3 py-1 border border-[#039155] text-[#039155] rounded-lg hover:bg-green-50 text-xs font-[Gilroy-Medium]"
                        >
                          KYC Details
                        </button>
                      </td>
                      {/* Action - Toggle Button */}
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Medium] text-[14px]">
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
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Medium] text-[14px]">
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

          {/* Pagination */}
          <div className="flex justify-center items-center mt-6 space-x-2 pb-8">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`p-2 border border-gray-300 rounded-lg transition ${currentPage === 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-500 hover:bg-gray-100"
                }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg text-sm font-[Gilroy-Medium] transition ${page === currentPage
                  ? "bg-[#039155] text-white shadow-md"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
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
              className={`p-2 border border-gray-300 rounded-lg transition ${currentPage === totalPages
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-500 hover:bg-gray-100"
                }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Fund Adjust Modal */}
      {fundModal.show && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white w-full max-w-[440px] rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#039155] to-green-700 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-[Gilroy-Semibold] text-lg">Fund Adjustment</h2>
                  <p className="text-green-100 text-xs font-[Gilroy-Medium]">{fundModal.userName}</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">

              {/* Wallet Type Dropdown */}
              <div>
                <label className="block text-sm font-[Gilroy-Semibold] text-[#1B1717] mb-1.5">Wallet Type</label>
                <select
                  value={fundModal.walletType}
                  onChange={(e) => setFundModal((prev) => ({ ...prev, walletType: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm font-[Gilroy-Medium] focus:outline-none focus:ring-2 focus:ring-[#039155] focus:border-transparent bg-white appearance-none cursor-pointer"
                >
                  <option value="mainWallet">Main Wallet</option>
                  <option value="apes1Wallet">AEPS Wallet 1</option>
                  <option value="apes2Wallet">AEPS Wallet 2</option>
                </select>
              </div>

              {/* Action Dropdown */}
              <div>
                <label className="block text-sm font-[Gilroy-Semibold] text-[#1B1717] mb-1.5">Action</label>
                <select
                  value={fundModal.action}
                  onChange={(e) => setFundModal((prev) => ({ ...prev, action: e.target.value }))}
                  className={`w-full border rounded-xl px-4 py-3 text-sm font-[Gilroy-Semibold] focus:outline-none focus:ring-2 focus:border-transparent bg-white appearance-none cursor-pointer ${
                    fundModal.action === "CREDIT"
                      ? "border-green-400 text-green-700 focus:ring-green-500"
                      : "border-red-400 text-red-600 focus:ring-red-500"
                  }`}
                >
                  <option value="CREDIT">▲ CREDIT</option>
                  <option value="DEBIT">▼ DEBIT</option>
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-[Gilroy-Semibold] text-[#1B1717] mb-1.5">Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  placeholder="Enter amount"
                  value={fundModal.amount}
                  onChange={(e) => setFundModal((prev) => ({ ...prev, amount: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm font-[Gilroy-Medium] focus:outline-none focus:ring-2 focus:ring-[#039155] focus:border-transparent"
                />
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-sm font-[Gilroy-Semibold] text-[#1B1717] mb-1.5">Remarks</label>
                <textarea
                  placeholder="Enter remarks..."
                  rows={3}
                  value={fundModal.remarks}
                  onChange={(e) => setFundModal((prev) => ({ ...prev, remarks: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm font-[Gilroy-Medium] focus:outline-none focus:ring-2 focus:ring-[#039155] focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setFundModal({ show: false, userId: null, userName: "", amount: "", action: "CREDIT", walletType: "mainWallet", remarks: "", isSubmitting: false })}
                disabled={fundModal.isSubmitting}
                className="flex-1 border border-gray-300 text-gray-600 font-[Gilroy-Semibold] rounded-xl py-3 text-sm hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleFundAdjustSubmit}
                disabled={fundModal.isSubmitting}
                className={`flex-1 text-white font-[Gilroy-Semibold] rounded-xl py-3 text-sm transition flex items-center justify-center gap-2 disabled:opacity-60 ${
                  fundModal.action === "CREDIT" ? "bg-[#039155] hover:bg-green-700" : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {fundModal.isSubmitting ? <ButtonLoader size={18} color="white" /> : null}
                {fundModal.action === "CREDIT" ? "Confirm Credit" : "Confirm Debit"}
              </button>
            </div>
          </div>
        </div>
      )}

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

      {showProfileDetails && (
        <ProfileDetails
          isOpen={showProfileDetails}
          onClose={() => setShowProfileDetails(false)}
          userId={selectedUserId}
        />
      )}
    </div>
  );
};

export default Distribution;
