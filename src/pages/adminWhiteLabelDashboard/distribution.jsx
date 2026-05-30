import React, { useState, useRef, useEffect, useMemo } from "react";
import { companyCreditDebit } from "../../redux/action/fundAction";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import {
  FaCalendarAlt,
  FaSearch,
  FaUpload,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaUser,
  FaIdCard,
  FaBuilding,
  FaUniversity,
  FaExpand,
} from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { User, X, ZoomIn, Wallet } from "lucide-react";
import * as XLSX from "xlsx";
import {
  kycDataCompany,
  kycStatusCheck,
  kycUnlock,
  rescendOnboarding,
  deActiveOnboarding,
  getCompanyAdmin,
  kycRevertCompany,
} from "../../redux/action/whiteLabelAction";
import { ButtonLoader } from "../../widgets/layout/loader";
import ProfileDetails from "./ProfileDetails";
import { roleDataCompanyUser } from "../../redux/action/roleAction";
import { checkCompanyAepsStatus } from "../../redux/action/whiteLabelAction";
import { useNotification } from "../../context/NotificationContext";
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
  isLoading = false,
  activePage,
  onPageChange,
  searchTerm: parentSearchTerm,
  setSearchTerm: parentSetSearchTerm,
  fromDate: parentFromDate,
  setFromDate: parentSetFromDate,
  toDate: parentToDate,
  setToDate: parentSetToDate,
}) => {
  const dispatch = useDispatch();
  const {
    success: notifySuccess,
    error: notifyError,
    showNotification
  } = useNotification();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedKycData, setSelectedKycData] = useState(null);
  const [showKycModal, setShowKycModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [zoomedImage, setZoomedImage] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [kycDataRefreshKey, setKycDataRefreshKey] = useState(0);
  const [isKycModalLoading, setIsKycModalLoading] = useState(false);
  const kycModalRef = useRef(null);
  const [localFromDate, setLocalFromDate] = useState("");
  const [localToDate, setLocalToDate] = useState("");
  const [localSearchTerm, setLocalSearchTerm] = useState("");

  const fromDate = embedded ? (parentFromDate ?? "") : localFromDate;
  const setFromDate = embedded ? parentSetFromDate : setLocalFromDate;
  const toDate = embedded ? (parentToDate ?? "") : localToDate;
  const setToDate = embedded ? parentSetToDate : setLocalToDate;
  const searchTerm = embedded ? (parentSearchTerm ?? "") : localSearchTerm;
  const setSearchTerm = embedded ? parentSetSearchTerm : setLocalSearchTerm;
  const [showProfileDetails, setShowProfileDetails] = useState(false);
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

  const [selectedUserRole, setSelectedUserRole] = useState(null);

  // Revert confirmation state
  const [showRevertConfirm, setShowRevertConfirm] = useState(false);
  const [revertPayload, setRevertPayload] = useState(null);
  const [isReverting, setIsReverting] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ show: false });

  // Get KYC details from Redux state - watch the entire kycDetailsCompany object to detect changes
  const kycDetailsState = useSelector((state) => state?.whitelabel?.kycDetailsCompany);
  const kycRetrieved = kycDetailsState?.data || null;

  // Get kycRevert success state to refresh KYC data after revert
  const kycRevertResponse = useSelector(
    (state) => state?.whitelabel?.kycRevertUSer,
  );

  // Get AEPS status check response
  const companyAepsStatus = useSelector(
    (state) => state?.whitelabel?.companyAepsStatus,
  );

  useEffect(() => {
    if (companyAepsStatus?.status === "SUCCESS") {
      showNotification({
        message: companyAepsStatus.message || "AEPS status updated successfully",
        type: "success",
        isCritical: true,
      });

      if (embedded) return;
      // Refresh table data
      const payload = {
        query: {
          userRole: 4, // Distributor role
        },
        options: {
          sort: { id: -1 },
          page: currentPage,
          paginate: 6,
        },
        customSearch: {},
      };
      dispatch(roleDataCompanyUser(payload));
    } else if (companyAepsStatus?.status === "FAILURE" || companyAepsStatus?.status === "Error") {
      showNotification({
        message: companyAepsStatus.message || "Failed to check AEPS status",
        type: "error",
        isCritical: true,
      });
    }
  }, [companyAepsStatus, currentPage, dispatch, showNotification, embedded]);

  // Get data from Redux when available, otherwise use prop data
  // Flatten the nested structure: data is array of companies, each with users array
  // shallowEqual prevents re-renders from the new array reference created by flatMap on every Redux action
  const responseForTable = useSelector((state) => {
    const roleData = state?.roles?.roleDataComp?.roleDataComp;
    if (!Array.isArray(roleData)) return [];
    // Flatten users from all companies
    return roleData.flatMap((company) => company?.users || []);
  }, shallowEqual);

  // Use prop data from API - no dummy data
  // Handle both nested (array of companies with users) and flat (array of users) structures
  const flattenedPropData = useMemo(() => {
    if (!Array.isArray(propTableData) || propTableData.length === 0) return [];
    // Check if data is nested (first item has 'users' property)
    if (propTableData[0]?.users && Array.isArray(propTableData[0].users)) {
      // Flatten nested structure
      return propTableData.flatMap((company) => company?.users || []);
    }
    // Already flat structure
    return propTableData;
  }, [propTableData]);

  // In embedded mode, strictly use the prop data passed from the parent.
  // Otherwise, use Redux data if available, falling back to props.
  const allTableData = useMemo(() => {
    if (embedded) {
      return flattenedPropData;
    }
    if (Array.isArray(responseForTable) && responseForTable.length > 0) {
      return responseForTable;
    }
    return flattenedPropData;
  }, [embedded, responseForTable, flattenedPropData]);

  // Get total count from Redux state (if available) or use current data length
  const totalCountFromRedux = useSelector((state) => {
    const response = state?.roles?.roleDataComp;
    return response?.totalCount || response?.total || 0;
  });

  const serverPageCount = useSelector((state) => state?.roles?.roleDataComp?.paginator?.pageCount || 0);

  // Use Redux total count if available, otherwise use current data length
  const totalCount =
    totalCountFromRedux > 0 ? totalCountFromRedux : allTableData.length;

  // Calculate total pages based on server total or local data length
  const totalPages =
    serverPageCount || (totalCount > 0 ? Math.ceil(totalCount / 6) : 1);

  // Table data mapping
  const tableData = allTableData;

  // Synchronization logic for embedded mode
  useEffect(() => {
    if (embedded && activePage !== undefined && activePage !== currentPage) {
      setCurrentPage(activePage);
    }
  }, [embedded, activePage, currentPage]);

  const handlePageChange = (newPage) => {
    if (embedded && onPageChange) {
      onPageChange(newPage);
    } else {
      setCurrentPage(newPage);
    }
  };

  // Update selectedKycData when Redux state changes
  useEffect(() => {
    if (kycRetrieved && showKycModal) {
      try {
        const deepCopy = structuredClone(kycRetrieved);
        setSelectedKycData(deepCopy);
        setIsKycModalLoading(false);
      } catch (error) {
        console.warn("Failed to deep clone KYC data, using shallow copy:", error);
        setSelectedKycData({ ...kycRetrieved });
        setIsKycModalLoading(false);
      }
    }
  }, [kycDetailsState, kycRetrieved, showKycModal]);

  // Refresh KYC data when revert succeeds
  useEffect(() => {
    if (kycRevertResponse?.status === "SUCCESS" && selectedUserId && showKycModal) {
      setIsReverting(false);
      setShowRevertConfirm(false);
      setRevertPayload(null);
      setSelectedKycData(null);
      setIsKycModalLoading(true);
      const timer = setTimeout(() => {
        dispatch(kycDataCompany(selectedUserId));
      }, 500);
      return () => clearTimeout(timer);
    } else if (kycRevertResponse?.status === "ERROR" || kycRevertResponse?.status === "FAILED") {
      setIsReverting(false);
      setShowRevertConfirm(false);
      setRevertPayload(null);
    }
  }, [kycRevertResponse, selectedUserId, showKycModal, dispatch]);

  // Fetch data from API on initial load and when page changes
  useEffect(() => {
    if (embedded) return;

    // Only fetch if both dates are provided, or if both dates are empty
    const bothDatesSelected = fromDate && toDate;
    const bothDatesNull = !fromDate && !toDate;

    if (!bothDatesSelected && !bothDatesNull) {
      return;
    }

    const timer = setTimeout(() => {
      const payload = {
        query: { 
          userRole: 4,
          ...(bothDatesSelected && {
            startDate: fromDate.replaceAll("-", "/"),
            endDate: toDate.replaceAll("-", "/"),
          }),
        },
        options: {
          sort: { createdAt: -1 },
          page: currentPage,
          paginate: 6,
        },
        customSearch: {
          ...(searchTerm.trim() && { mobileNo: searchTerm.trim(), name: searchTerm.trim() }),
        },
      };
      dispatch(roleDataCompanyUser(payload));
    }, 300);
    return () => clearTimeout(timer);
  }, [currentPage, dispatch, fromDate, toDate, searchTerm, embedded]);

  // Export to Excel function
  
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
      const result = await dispatch(companyCreditDebit({
        userId: Number(userId),
        amount: Number(amount),
        action,
        walletType,
        remarks: remarks.trim(),
      }));
      if (result?.status === "SUCCESS") {
        notifySuccess({ message: result.message || ("Fund " + (action === "CREDIT" ? "credited" : "debited") + " successfully!"), isCritical: true });
        setFundModal({ show: false, userId: null, userName: "", amount: "", action: "CREDIT", walletType: "mainWallet", remarks: "", isSubmitting: false });
        
        // Refresh table data
        const payload = {
          query: {
            userRole: 4,
            ...(debouncedFromDate && debouncedToDate ? { startDate: debouncedFromDate.replace(/\-/g, "/"), endDate: debouncedToDate.replace(/\-/g, "/") } : {}),
          },
          options: { sort: { id: -1 }, page: currentPage, paginate: 6 },
          customSearch: debouncedSearchTerm.trim() ? { mobileNo: debouncedSearchTerm.trim(), name: debouncedSearchTerm.trim() } : {},
        };
        dispatch(useListAction(payload));
      } else {
        notifyError({ message: result?.message || "Fund adjustment failed. Please try again.", isCritical: true });
        setFundModal((prev) => ({ ...prev, isSubmitting: false }));
      }
    } catch {
      notifyError({ message: "An unexpected error occurred.", isCritical: true });
      setFundModal((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

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
      "KYC Status": row.kycStatus || "N/A",
      "KYC Steps": row.kycSteps || "0",
      "Main Wallet": row.wallet?.mainWallet || "0",
      "AEPS1 Wallet": row.wallet?.apes1Wallet || "0",
      "AEPS2 Wallet": row.wallet?.apes2Wallet || "0",
      Status: row.status || "Active",
      Approved: row.approved ? "Yes" : "No",
    }));
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Distributor Data");
    const fileName = `Distributor_Export_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  if (showProfileDetails) {
    return (
      <ProfileDetails
        onBack={() => {
          setShowProfileDetails(false);
          setSelectedUserRole(null);
        }}
        userRole={selectedUserRole}
      />
    );
  }

  return (
    <div className={`text-[#1B1717] ${embedded ? "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" : "min-h-screen p-4 sm:p-6"}`}>
      {embedded ? (
        <div className="[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4">
            <h2 className="text-xl sm:text-2xl font-normal text-gray-800">Distributor</h2>
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
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-4 pr-10 py-3 border border-gray-300 rounded-xl w-full text-sm focus:ring-green-500 focus:border-green-500"
                />
                <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
              </div>
              <button onClick={handleExportToExcel} className="flex items-center justify-center gap-2 bg-[#039155] text-white px-4 py-3 rounded-lg font-[Gilroy-Medium] hover:opacity-90 shadow-md text-sm sm:text-base transition-all">
                Export <FaUpload className="text-xs" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="mb-4 overflow-x-auto rounded-3xl bg-white [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <table className="min-w-[720px] sm:min-w-full divide-y">
              <thead className="bg-white text-center">
                <tr>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-sm tracking-wider whitespace-nowrap">ID</th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-sm tracking-wider whitespace-nowrap">User</th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-sm tracking-wider whitespace-nowrap">User ID</th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-sm tracking-wider whitespace-nowrap">Name</th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-sm tracking-wider whitespace-nowrap">User Role</th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-sm tracking-wider whitespace-nowrap">Mobile No</th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-sm tracking-wider whitespace-nowrap">Email Id</th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-sm tracking-wider whitespace-nowrap">Parent Name</th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-sm tracking-wider whitespace-nowrap">Parent Role</th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-sm tracking-wider whitespace-nowrap">Company</th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-sm tracking-wider whitespace-nowrap">KYC Status</th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-sm tracking-wider whitespace-nowrap">KYC Steps</th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-sm tracking-wider whitespace-nowrap">Main Wallet</th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-sm tracking-wider whitespace-nowrap">AEPS 1 Status</th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-sm tracking-wider whitespace-nowrap">AEPS1 Wallet</th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-sm tracking-wider whitespace-nowrap">AEPS2 Wallet</th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">Fund Adjust</th>
<th className="px-3 py-4 font-[Gilroy-Medium] text-sm tracking-wider whitespace-nowrap">Status</th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-sm tracking-wider whitespace-nowrap">KYC Details</th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-sm tracking-wider whitespace-nowrap">Action</th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-sm tracking-wider whitespace-nowrap">Lock Status</th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-sm tracking-wider whitespace-nowrap">Onboarding</th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-sm tracking-wider whitespace-nowrap">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y text-center">
                {isLoading ? (
                  <TableBodyLoader colSpan={22} />
                ) : !tableData || tableData.length === 0 ? (
                  <tr><td colSpan={22} className="py-12 text-gray-500 font-[Gilroy-Medium]">No data available</td></tr>
                ) : (
                  tableData.map((row, index) => (
                    <tr key={index} className={`text-sm ${index % 2 === 0 ? "bg-green-50" : "bg-white"}`}>
                      <td className="px-4 py-4 whitespace-nowrap">{row.id || "N/A"}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <button onClick={() => { const userId = row.id || row.originalItem?.id; if (userId) { setSelectedUserRole(row.userRole || null); dispatch(getCompanyAdmin(userId)); setShowProfileDetails(true); } }} className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300">
                          <User className="w-4 h-4 text-gray-600" />
                        </button>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">{row.userId || row.userAgentCode || "N/A"}</td>
                      <td className="px-4 py-4 whitespace-nowrap">{row.name || row.userName || "N/A"}</td>
                      <td className="px-4 py-4 whitespace-nowrap">{row.userRole || "N/A"}</td>
                      <td className="px-4 py-4 whitespace-nowrap">{row.mobileNo || row.mobile || row.mobileNumber || "N/A"}</td>
                      <td className="px-4 py-4 whitespace-nowrap">{row.emailId || row.email || "N/A"}</td>
                      <td className="px-4 py-4 whitespace-nowrap">{row.parentName || "N/A"}</td>
                      <td className="px-4 py-4 whitespace-nowrap">{row.parentRole || "N/A"}</td>
                      <td className="px-4 py-4 whitespace-nowrap">{row.companyName || row.company || "N/A"}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {(() => {
                          const status = row.kycStatus?.toLowerCase();
                          let className = "px-2 py-1 rounded text-xs font-[Gilroy-Medium] ";
                          if (status === "completed" || status === "full_kyc") className += "bg-emerald-50 text-[#039155] border border-emerald-100";
                          else if (status === "pending") className += "bg-yellow-50 text-yellow-700 border border-yellow-100";
                          else className += "bg-rose-50 text-rose-700 border border-rose-100";
                          return <span className={className}>{row.kycStatus || "N/A"}</span>;
                        })()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">{row.kycSteps || "0"}</td>
                      <td className="px-4 py-4 whitespace-nowrap">{row.wallet?.mainWallet || "0"}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <button onClick={() => { const userId = row.id || row.originalItem?.id; if (userId) dispatch(checkCompanyAepsStatus(userId)); }} disabled={row.aepsOnboardingStatus === true} className={`px-3 py-1 border border-emerald-100 text-[#039155] rounded-lg text-xs font-[Gilroy-Medium] transition-all ${row.aepsOnboardingStatus === true ? "opacity-50 cursor-not-allowed bg-slate-50 text-slate-400" : "hover:bg-emerald-50"}`}>
                          Check Status
                        </button>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">{row.wallet?.apes1Wallet || "0"}</td>
                      <td className="px-4 py-4 whitespace-nowrap">{row.wallet?.apes2Wallet || "0"}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-lg text-white text-xs ${row.status?.toLowerCase() === "active" ? "bg-[#039155]" : "bg-rose-600"}`}>
                          {row.status || "Active"}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <button onClick={() => { const userId = row.id || row.originalItem?.id; if (userId) { setSelectedUserId(userId); setIsKycModalLoading(true); dispatch(kycDataCompany(userId)); setActiveTab("overview"); setZoomedImage(null); setShowKycModal(true); } }} className="px-3 py-1 border border-[#039155] text-[#039155] rounded-lg hover:bg-emerald-50 text-xs font-[Gilroy-Medium] transition-colors">
                          KYC Details
                        </button>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {(() => {
                          const userId = row.id || row.originalItem?.id;
                          const isActive = row.status?.toLowerCase() === "active";
                          return (
                            <button onClick={() => { if (userId) dispatch(kycStatusCheck(userId, { isActive: isActive ? "false" : "true" })); }} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? "bg-[#039155]" : "bg-gray-300"}`}>
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? "translate-x-6" : "translate-x-1"}`} />
                            </button>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {(() => {
                          const userId = row.id || row.originalItem?.id;
                          const lockValue = row.lock ?? row.originalItem?.lock;
                          const isLocked = lockValue === true || lockValue === "true";
                          return (
                            <button onClick={() => { if (userId && isLocked) dispatch(kycUnlock(userId)); }} disabled={!isLocked} className={`px-4 py-2 rounded-lg text-xs font-[Gilroy-Semibold] transition-all ${isLocked ? "bg-rose-600 text-white hover:bg-rose-700" : "bg-[#039155] text-white opacity-90 cursor-not-allowed"}`}>
                              {isLocked ? "Enable Access" : "Access Enabled"}
                            </button>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <button onClick={() => { const userId = row.id || row.originalItem?.id; if (userId) dispatch(rescendOnboarding(userId)); }} className="px-3 py-1 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 text-xs">Re-send</button>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">{row.date || "N/A"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="flex justify-center items-center mt-6 space-x-2">
            <button onClick={() => handlePageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="p-2 border border-gray-300 rounded-lg"><IoIosArrowBack /></button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button key={page} onClick={() => handlePageChange(page)} className={`w-8 h-8 rounded-lg text-sm transition-all ${page === currentPage ? "bg-[#039155] text-white shadow-md shadow-emerald-200" : "bg-white text-gray-700 border border-gray-200 hover:bg-emerald-50"}`}>{page}</button>
            ))}
            <button onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="p-2 border border-gray-300 rounded-lg"><IoIosArrowForward /></button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-normal text-gray-800">Distributor</h2>
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-end gap-3">
              <div className="flex flex-row gap-3">
                <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setCurrentPage(1); }} className="pl-3 pr-3 py-3 border border-gray-300 rounded-lg w-full xs:w-32 text-sm focus:ring-green-500 focus:border-green-500 text-center cursor-pointer" />
                <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setCurrentPage(1); }} min={fromDate || undefined} className="pl-3 pr-3 py-3 border border-gray-300 rounded-lg w-full xs:w-32 text-sm focus:ring-green-500 focus:border-green-500 text-center cursor-pointer" />
              </div>
              <div className="relative w-full sm:w-48">
                <input type="text" placeholder="Search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-4 pr-10 py-3 border border-gray-300 rounded-xl w-full text-sm focus:ring-green-500 focus:border-green-500" />
                <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
              </div>
              <button onClick={handleExportToExcel} className="flex items-center justify-center gap-2 bg-[#039155] text-white px-4 py-3 rounded-lg font-[Gilroy-Medium] hover:opacity-90 shadow-md text-sm sm:text-base transition-all">
                Export <FaUpload className="text-xs" />
              </button>
            </div>
          </div>
          <div className="mb-4 overflow-x-auto rounded-xl bg-white [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <table className="min-w-[720px] sm:min-w-full divide-y">
              <thead className="bg-white text-center">
                <tr>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-sm tracking-wider whitespace-nowrap">ID</th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-sm tracking-wider whitespace-nowrap">User</th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-sm tracking-wider whitespace-nowrap">User ID</th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-sm tracking-wider whitespace-nowrap">Name</th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-sm tracking-wider whitespace-nowrap">User Role</th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-sm tracking-wider whitespace-nowrap">Mobile No</th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-sm tracking-wider whitespace-nowrap">Email Id</th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-sm tracking-wider whitespace-nowrap">Parent Name</th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-sm tracking-wider whitespace-nowrap">Parent Role</th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-sm tracking-wider whitespace-nowrap">KYC Status</th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-sm tracking-wider whitespace-nowrap">KYC Steps</th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-sm tracking-wider whitespace-nowrap">Main Wallet</th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-sm tracking-wider whitespace-nowrap">AEPS 1 Status</th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-sm tracking-wider whitespace-nowrap">AEPS1 Wallet</th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-sm tracking-wider whitespace-nowrap">AEPS2 Wallet</th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-sm tracking-wider whitespace-nowrap">Status</th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-sm tracking-wider whitespace-nowrap">KYC Details</th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-sm tracking-wider whitespace-nowrap">Action</th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-sm tracking-wider whitespace-nowrap">Lock Status</th>
                  <th className="px-3 py-4 font-[Gilroy-Medium] text-sm tracking-wider whitespace-nowrap">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y text-center">
                {!tableData || tableData.length === 0 ? (
                  <tr><td colSpan={20} className="py-12 text-gray-500">No data available</td></tr>
                ) : (
                  tableData.map((row, index) => (
                    <tr key={index} className={`text-sm ${index % 2 === 0 ? "bg-green-50" : "bg-white"}`}>
                      <td className="px-4 py-4 whitespace-nowrap">{row.id || "N/A"}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <button onClick={() => { const userId = row.id || row.originalItem?.id; if (userId) { dispatch(getCompanyAdmin(userId)); setShowProfileDetails(true); } }} className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"><User className="w-4 h-4 text-gray-600" /></button>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">{row.userId || row.userAgentCode || "N/A"}</td>
                      <td className="px-4 py-4 whitespace-nowrap">{row.name || row.userName || "N/A"}</td>
                      <td className="px-4 py-4 whitespace-nowrap">{row.userRole || "N/A"}</td>
                      <td className="px-4 py-4 whitespace-nowrap">{row.mobileNo || row.mobile || row.mobileNumber || "N/A"}</td>
                      <td className="px-4 py-4 whitespace-nowrap">{row.emailId || row.email || "N/A"}</td>
                      <td className="px-4 py-4 whitespace-nowrap">{row.parentName || "N/A"}</td>
                      <td className="px-4 py-4 whitespace-nowrap">{row.parentRole || "N/A"}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {(() => {
                          const status = row.kycStatus?.toLowerCase();
                          let className = "px-2 py-1 rounded text-xs ";
                          if (status === "completed" || status === "full_kyc") className += "bg-emerald-50 text-[#039155] border border-emerald-100";
                          else if (status === "pending") className += "bg-yellow-50 text-yellow-700 border border-yellow-100";
                          else className += "bg-rose-50 text-rose-700 border border-rose-100";
                          return <span className={className}>{row.kycStatus || "N/A"}</span>;
                        })()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">{row.kycSteps || "0"}</td>
                      <td className="px-4 py-4 whitespace-nowrap">{row.wallet?.mainWallet || "0"}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <button onClick={() => { const userId = row.id || row.originalItem?.id; if (userId) dispatch(checkCompanyAepsStatus(userId)); }} disabled={row.aepsOnboardingStatus === true} className={`px-3 py-1 border border-emerald-100 text-[#039155] rounded-lg text-xs font-[Gilroy-Medium] transition-all ${row.aepsOnboardingStatus === true ? "opacity-50 cursor-not-allowed bg-slate-50 text-slate-400" : "hover:bg-emerald-50"}`}>Check Status</button>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">{row.wallet?.apes1Wallet || "0"}</td>
                      <td className="px-4 py-4 whitespace-nowrap">{row.wallet?.apes2Wallet || "0"}</td>
                      <td className="px-4 py-4 whitespace-nowrap"><span className={`px-3 py-1 rounded-lg text-white text-xs ${row.status?.toLowerCase() === "active" ? "bg-[#039155]" : "bg-rose-600"}`}>{row.status || "Active"}</span></td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <button onClick={() => { const userId = row.id || row.originalItem?.id; if (userId) { setSelectedUserId(userId); setIsKycModalLoading(true); dispatch(kycDataCompany(userId)); setActiveTab("overview"); setZoomedImage(null); setShowKycModal(true); } }} className="px-3 py-1 border border-[#039155] text-[#039155] rounded-lg hover:bg-emerald-50 text-xs transition-colors">KYC Details</button>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {(() => {
                          const userId = row.id || row.originalItem?.id;
                          const isActive = row.status?.toLowerCase() === "active";
                          return (
                            <button onClick={() => { if (userId) dispatch(kycStatusCheck(userId, { isActive: isActive ? "false" : "true" })); }} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? "bg-[#039155]" : "bg-gray-300"}`}>
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? "translate-x-6" : "translate-x-1"}`} />
                            </button>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {(() => {
                          const userId = row.id || row.originalItem?.id;
                          const lockValue = row.lock ?? row.originalItem?.lock;
                          const isLocked = lockValue === true || lockValue === "true";
                          return (
                            <button onClick={() => { if (userId && isLocked) dispatch(kycUnlock(userId)); }} disabled={!isLocked} className={`px-4 py-2 rounded-lg text-xs font-[Gilroy-Semibold] transition-all ${isLocked ? "bg-rose-600 text-white hover:bg-rose-700" : "bg-[#039155] text-white opacity-90 cursor-not-allowed"}`}>{isLocked ? "Enable Access" : "Access Enabled"}</button>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">{row.date || "N/A"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="flex justify-center items-center mt-6 space-x-2">
            <button onClick={() => handlePageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="p-2 border border-gray-300 rounded-lg"><IoIosArrowBack /></button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button key={page} onClick={() => handlePageChange(page)} className={`w-8 h-8 rounded-lg text-sm transition-all ${page === currentPage ? "bg-[#039155] text-white shadow-md shadow-emerald-200" : "bg-white text-gray-700 border border-gray-200 hover:bg-emerald-50"}`}>{page}</button>
            ))}
            <button onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="p-2 border border-gray-300 rounded-lg"><IoIosArrowForward /></button>
          </div>
        </div>
      )}

      {/* Standardized KYC Modal */}
      <KycModal
        showKycModal={showKycModal}
        setShowKycModal={setShowKycModal}
        selectedKycData={kycDetailsState}
        selectedUserId={selectedUserId}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isKycModalLoading={isKycModalLoading}
        showRevertConfirm={showRevertConfirm}
        setShowRevertConfirm={setShowRevertConfirm}
        revertPayload={revertPayload}
        setRevertPayload={setRevertPayload}
        isReverting={isReverting}
        setIsReverting={setIsReverting}
        confirmModal={confirmModal}
        setConfirmModal={setConfirmModal}
        zoomedImage={zoomedImage}
        setZoomedImage={setZoomedImage}
        dispatch={dispatch}
        kycModalRef={kycModalRef}
        revertAction={kycRevertCompany}
      />
    
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
                  <option value="aeps1Wallet">AEPS Wallet 1</option>
                  <option value="aeps2Wallet">AEPS Wallet 2</option>
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

    </div>
  );
};

export default Distribution;
