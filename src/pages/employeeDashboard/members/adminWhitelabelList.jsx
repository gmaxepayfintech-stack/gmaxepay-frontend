import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Search,
  Wallet,
} from "lucide-react";
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
import ProfileDetails from "./ProfileDetails";
import {
  employeeGetAdminProfileDetails,
  setSelectedUserRole,
} from "../../../redux/action/userProfileAction";
import { employeeCreditDebit } from "../../../redux/action/fundAction";
import { useNotification } from "../../../context/NotificationContext";
import { ButtonLoader } from "../../../widgets/layout/loader";
import KycModal from "./KycModal";

const AdminWhitelabelList = ({
  embedded = false,
  tableData: propTableData = [],
}) => {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [showKycModal, setShowKycModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [kycDataRefreshKey, setKycDataRefreshKey] = useState(0);
  const [showProfileDetails, setShowProfileDetails] = useState(false);

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

  const { success: notifySuccess, error: notifyError } = useNotification();

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

  // Use API data or prop data
  const allTableData = debouncedSearchTerm.trim() && responseForTable.length > 0
    ? responseForTable
    : propTableData;

  // Get total count from Redux state (if available) or use current data length
  const totalCountFromRedux = useSelector((state) => {
    const response = state?.whitelabel?.whitelabelList;
    // Check if API response includes total count or pagination info
    return response?.totalCount || response?.total || 0;
  });

  const totalCount =
    debouncedSearchTerm.trim() && totalCountFromRedux > 0
      ? totalCountFromRedux
      : allTableData.length;

  // Calculate total pages based on total count (10 records per page)
  const totalPages = Math.ceil(totalCount / 10) || 1;

  // Slice data to show only 10 records per page
  // Note: API should already be paginated, but we ensure client-side pagination as well
  const startIndex = (currentPage - 1) * 10;
  const endIndex = startIndex + 10;
  const tableData = allTableData.slice(startIndex, endIndex);

  // Debounce search term to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const payload = {
      query: {
        userRole: 2, // Whitelabel role
        kycStatus: "pending", // Onboarding process
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
  }, [debouncedSearchTerm, currentPage, dispatch]);

  // Refresh table when kycStatusCheck succeeds
  useEffect(() => {
    if (kycStatusCheckResponse?.status === "SUCCESS") {
      const payload = {
        query: {
          userRole: 2, // Whitelabel role
          kycStatus: "pending",
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
      const payload = {
        query: {
          userRole: 2, // Whitelabel role
          kycStatus: "pending",
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
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>

          {/* Select KYC Dropdown */}
          <select
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] bg-white cursor-pointer"
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
              className="px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] bg-white w-full sm:w-auto cursor-pointer"
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* To Date */}
          <div className="relative">
            <input
              type="date"
              className="px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] bg-white w-full sm:w-auto cursor-pointer"
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

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

      {/* KYC Modal */}
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
                  Fund Adjust
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
                          // dispatch(getCompanyAdmin(userId));

                          // Additionally fetch admin profile details (slab visibility, etc.)
                          // dispatch(employeeGetAdminProfileDetails(userId));

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
                            setShowKycModal(true);
                          }
                        }}
                        className="px-3 py-1 border border-[#039155] text-[#039155] rounded-lg hover:bg-green-50 text-xs font-[Gilroy-Medium] transition-colors"
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
                  <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Medium] text-[#121216] text-[14px]">
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
                  <td className="py-3 px-4 text-xs font-[Gilroy-Regular] text-[#121216] whitespace-nowrap">
                    {row.date || "N/A"}
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
                    Fund Adjust
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
                            // dispatch(getCompanyAdmin(userId));

                            // Additionally fetch admin profile details (slab visibility, etc.)
                            // dispatch(employeeGetAdminProfileDetails(userId));

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
                            setShowKycModal(true);
                          }
                        }}
                        className="px-3 py-1 border border-[#039155] text-[#039155] rounded-lg hover:bg-green-50 text-xs font-[Gilroy-Medium] transition-colors"
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
                              isLocked ? "Click to enable access for this account" : "Account access is enabled"
                            }
                          >
                            {isLocked ? "Enable Access" : "Access Enabled"}
                          </button>
                        );
                      })()}
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
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
              onClick={() => setCurrentPage(page)}
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
          onClick={() =>
            setCurrentPage((prev) => Math.min(totalPages, prev + 1))
          }
          disabled={currentPage === totalPages || totalPages === 0}
          className={`p-2 rounded-lg border transition ${currentPage === totalPages || totalPages === 0
            ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
            : "bg-white border-gray-300 text-[#1B1717] hover:bg-gray-50"
            }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
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
        onRevertSuccess={() => {
          setKycDataRefreshKey(prev => prev + 1);
          // Refresh list to update status in table
          const userRole = 2;
          const payload = {
            query: { userRole, kycStatus: "pending" },
            options: { sort: { id: -1 }, page: currentPage, paginate: 10 },
          };
          dispatch(employeeUseList(payload));
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

export default AdminWhitelabelList;
