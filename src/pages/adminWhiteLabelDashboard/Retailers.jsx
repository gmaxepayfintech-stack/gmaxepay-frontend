import React, { useState, useRef, useEffect, useMemo } from "react";
import { companyCreditDebit } from "../../redux/action/fundAction";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
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
import { User, X, ZoomIn, Wallet } from "lucide-react";
import * as XLSX from "xlsx";
import {
  kycStatusData,
  kycStatusCheck,
  kycUnlock,
  rescendOnboarding,
  deActiveOnboarding,
  getCompanyAdmin,
  kycDataCompany,
  kycRevertCompany,
  checkCompanyAepsStatus,
} from "../../redux/action/whiteLabelAction";
import { ButtonLoader } from "../../widgets/layout/loader";
import ProfileDetails from "./ProfileDetails";
import { roleDataCompanyUser } from "../../redux/action/roleAction";
import { useNotification } from "../../context/NotificationContext";
import KycModal from "./KycModal";

const Retailers = ({
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
  const [currentPage, setCurrentPage] = useState(1);
  const [localFromDate, setLocalFromDate] = useState("");
  const [localToDate, setLocalToDate] = useState("");
  const [localSearchTerm, setLocalSearchTerm] = useState("");

  const fromDate = embedded ? (parentFromDate ?? "") : localFromDate;
  const setFromDate = embedded ? parentSetFromDate : setLocalFromDate;
  const toDate = embedded ? (parentToDate ?? "") : localToDate;
  const setToDate = embedded ? parentSetToDate : setLocalToDate;
  const searchTerm = embedded ? (parentSearchTerm ?? "") : localSearchTerm;
  const setSearchTerm = embedded ? parentSetSearchTerm : setLocalSearchTerm;

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedKycData, setSelectedKycData] = useState(null);
  const [showKycModal, setShowKycModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [zoomedImage, setZoomedImage] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [kycDataRefreshKey, setKycDataRefreshKey] = useState(0);
  const [rowLockStatus, setRowLockStatus] = useState({}); // Track lock status per row ID
  const [lastClickedRowId, setLastClickedRowId] = useState(null);
  const [selectedProfileData, setSelectedProfileData] = useState(null);
  const [isKycModalLoading, setIsKycModalLoading] = useState(false);
  const kycModalRef = useRef(null);

  // Revert confirmation state
  const [showRevertConfirm, setShowRevertConfirm] = useState(false);
  const [revertPayload, setRevertPayload] = useState(null);
  const [isReverting, setIsReverting] = useState(false);

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
  const {
    success: notifySuccess,
    error: notifyError,
    showNotification
  } = useNotification();
  const [debouncedFromDate, setDebouncedFromDate] = useState("");
  const [debouncedToDate, setDebouncedToDate] = useState("");

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
    (state) => state?.whitelabel?.kycRevertUSer,
  );

  // Get kycLockStatus success state to refresh table after unlock
  const kycLockStatusResponse = useSelector(
    (state) => state?.whitelabel?.kycLockStatus,
  );

  // Get AEPS status check response
  const companyAepsStatus = useSelector(
    (state) => state?.whitelabel?.companyAepsStatus,
  );

  // Get data from Redux when search is active, otherwise use prop data
  // Flatten the nested structure: data is array of companies, each with users array
  // shallowEqual prevents re-renders from the new array reference created by flatMap on every Redux action
  const responseForTable = useSelector((state) => {
    const roleData = state?.roles?.roleDataComp?.roleDataComp;
    if (!Array.isArray(roleData)) return [];
    // Flatten users from all companies
    return roleData.flatMap((company) => company?.users || []);
  }, shallowEqual);

  // Log full API response for debugging (data coming from roleDataCompanyUser)
  const roleDataResponse = useSelector((state) => state?.roles?.roleDataComp);
  useEffect(() => {
    if (roleDataResponse) {
    }
  }, [roleDataResponse]);

  // Get KYC details from Redux state - watch the entire kycDetailsCompany object to detect changes
  const kycDetailsState = useSelector((state) => state?.whitelabel?.kycDetailsCompany);
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

  // Use Redux data if search is active, otherwise use prop data
  // Handle both nested (array of companies with users) and flat (array of users) structures for prop data
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

  // Prefer Redux data if available (from API calls) and NOT embedded, otherwise fall back to prop data
  const allTableData = useMemo(() => {
    if (embedded) return flattenedPropData;
    // If we have any data in Redux, use it (even if it's empty array from a search)
    // We only want to fallback if the state itself is not an array (e.g. undefined/null)
    if (Array.isArray(responseForTable)) {
      // If a search or date filter is active, we MUST use Redux data to show results (or lack thereof)
      if (debouncedSearchTerm.trim() || debouncedFromDate || debouncedToDate) {
        return responseForTable;
      }
      // Otherwise, if we have results in Redux, use them
      if (responseForTable.length > 0) return responseForTable;
    }
    return flattenedPropData;
  }, [embedded, responseForTable, flattenedPropData, debouncedSearchTerm, debouncedFromDate, debouncedToDate]);

  // Get total count from Redux state (if available) or use current data length
  const totalCountFromRedux = useSelector((state) => {
    const response = state?.roles?.roleDataComp;
    return response?.totalCount || response?.total || 0;
  });

  const serverPageCount = useSelector((state) => state?.roles?.roleDataComp?.paginator?.pageCount || 0);

  // Use Redux total count if available, even if embedded
  const totalCount = totalCountFromRedux > 0 ? totalCountFromRedux : allTableData.length;

  // Calculate total pages based on server-side count or total Count
  const totalPages = serverPageCount || (totalCount > 0 ? Math.ceil(totalCount / 6) : 1);

  // If embedded, we have all data locally so we slice it.
  // If not embedded, the API already paginated it for us!
  // In embedded mode, the parent component handles fetching the correct page, 
  // so we don't need to slice the data locally anymore!
  const tableData = embedded ? allTableData : allTableData;

  // Synchronization logic for embedded mode
  useEffect(() => {
    if (embedded && activePage !== undefined && activePage !== currentPage) {
      setCurrentPage(activePage);
    }
  }, [embedded, activePage, currentPage]);

  // Unified page change handler
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    setCurrentPage(newPage);
    if (embedded && onPageChange) onPageChange(newPage);
  };

  // Logic to show a window of pages (e.g. 1 ... 4 5 6 ... 10)
  const getVisiblePages = () => {
    const delta = 1; // Number of pages to show around current
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    }
    return rangeWithDots;
  };

  // Helper to render pagination controls (extracted to avoid duplication)
  const renderPagination = () => {
    if (totalPages <= 1 && totalCount <= 6) return null; // Hide if only one page or no data

    const visiblePages = getVisiblePages();

    return (
      <div className="flex justify-center items-center mt-auto pt-6 pb-4 space-x-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || totalPages === 0}
          className={`p-2 border border-slate-100 rounded-xl transition-all ${
            currentPage === 1 || totalPages === 0
              ? "text-slate-300 cursor-not-allowed bg-gray-50"
              : "text-slate-500 hover:text-[#039155] hover:bg-slate-50 shadow-sm"
          }`}
          title="Previous Page"
        >
          <IoIosArrowBack className="text-xl" />
        </button>

        {visiblePages.map((page, index) => (
          <React.Fragment key={index}>
            {page === "..." ? (
              <span className="px-2 text-slate-400 font-medium">...</span>
            ) : (
              <button
                onClick={() => handlePageChange(page)}
                className={`w-10 h-10 rounded-xl text-sm font-[Gilroy-Bold] transition-all ${
                  page === currentPage
                    ? "bg-[#039155] text-white shadow-lg shadow-emerald-100"
                    : "bg-white text-slate-500 border border-slate-100 hover:bg-slate-50 hover:border-emerald-200"
                }`}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className={`p-2 border border-slate-100 rounded-xl transition-all ${
            currentPage === totalPages || totalPages === 0
              ? "text-slate-300 cursor-not-allowed bg-gray-50"
              : "text-slate-500 hover:text-[#039155] hover:bg-slate-50 shadow-sm"
          }`}
          title="Next Page"
        >
          <IoIosArrowForward className="text-xl" />
        </button>
      </div>
    );
  };

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

  // Fetch data from API on initial load and when search term or dates change
  useEffect(() => {
    if (embedded) return; // Skip API fetch if embedded to prevent overwriting Redux store

    // Only fetch if both dates are provided, or if both dates are empty
    const bothDatesSelected = debouncedFromDate && debouncedToDate;
    const bothDatesNull = !debouncedFromDate && !debouncedToDate;

    if (!bothDatesSelected && !bothDatesNull) {
      return;
    }

    const payload = {
      query: {
        userRole: 5, // Retailer role
        ...(bothDatesSelected ? { startDate: debouncedFromDate.replaceAll("-", "/"), endDate: debouncedToDate.replaceAll("-", "/") } : {}),
      },
      options: {
        sort: { createdAt: -1 },
        page: currentPage,
        paginate: 6,
      },
      customSearch: debouncedSearchTerm.trim()
        ? {
          $or: [
            { name: { $regex: debouncedSearchTerm.trim(), $options: "i" } },
            { mobileNo: { $regex: debouncedSearchTerm.trim(), $options: "i" } },
            { userId: { $regex: debouncedSearchTerm.trim(), $options: "i" } }
          ]
        }
        : {},
    };

    dispatch(roleDataCompanyUser(payload));
  }, [debouncedSearchTerm, debouncedFromDate, debouncedToDate, currentPage, embedded, dispatch]);

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
      setIsKycModalLoading(true);
      // Small delay to ensure backend has processed the revert
      const timer = setTimeout(() => {
        // Refresh KYC data after revert
        dispatch(kycDataCompany(selectedUserId));
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

  // Refresh table when kycStatusCheck succeeds
  useEffect(() => {
    if (embedded) return;
    if (kycStatusCheckResponse?.status === "SUCCESS") {
      const bothDatesSelected = debouncedFromDate && debouncedToDate;
      const bothDatesNull = !debouncedFromDate && !debouncedToDate;

      // Only proceed if both dates are selected, or if both dates are empty
      if (!bothDatesSelected && !bothDatesNull) {
        return;
      }

      const payload = {
        query: {
          userRole: 5, // Retailer role
          ...(bothDatesSelected ? { startDate: debouncedFromDate.replaceAll("-", "/"), endDate: debouncedToDate.replaceAll("-", "/") } : {}),
        },
        options: {
          sort: { createdAt: -1 },
          page: currentPage,
          paginate: 6,
        },
        customSearch: debouncedSearchTerm.trim() ? {
          $or: [
            { name: { $regex: debouncedSearchTerm.trim(), $options: "i" } },
            { mobileNo: { $regex: debouncedSearchTerm.trim(), $options: "i" } },
            { userId: { $regex: debouncedSearchTerm.trim(), $options: "i" } }
          ]
        } : {},
      };
      dispatch(roleDataCompanyUser(payload));
    }
  }, [kycStatusCheckResponse, debouncedSearchTerm, debouncedFromDate, debouncedToDate, embedded, dispatch]);

  // Refresh table and show notification when companyAepsStatus succeeds
  useEffect(() => {
    if (companyAepsStatus?.status === "SUCCESS") {
      showNotification({
        message: companyAepsStatus.message || "AEPS status updated successfully",
        type: "success",
        isCritical: true,
      });

      if (embedded) return;
      const bothDatesSelected = debouncedFromDate && debouncedToDate;
      const payload = {
        query: {
          userRole: 5, // Retailer role
          ...(bothDatesSelected ? { startDate: debouncedFromDate.replaceAll("-", "/"), endDate: debouncedToDate.replaceAll("-", "/") } : {}),
        },
        options: {
          sort: { createdAt: -1 },
          page: currentPage,
          paginate: 6,
        },
        customSearch: debouncedSearchTerm.trim()
          ? {
            $or: [
              { name: { $regex: debouncedSearchTerm.trim(), $options: "i" } },
              { mobileNo: { $regex: debouncedSearchTerm.trim(), $options: "i" } },
              { userId: { $regex: debouncedSearchTerm.trim(), $options: "i" } }
            ]
          }
          : {},
      };
      dispatch(roleDataCompanyUser(payload));
    } else if (companyAepsStatus?.status === "FAILURE" || companyAepsStatus?.status === "Error") {
      showNotification({
        message: companyAepsStatus.message || "Failed to check AEPS status",
        type: "error",
        isCritical: true,
      });
    }
  }, [companyAepsStatus, dispatch, debouncedSearchTerm, debouncedFromDate, debouncedToDate, embedded, showNotification]);

  // Refresh table when kycUnlock succeeds
  useEffect(() => {
    if (embedded) return;
    if (kycLockStatusResponse?.status === "SUCCESS") {
      const bothDatesSelected = debouncedFromDate && debouncedToDate;
      const payload = {
        query: {
          userRole: 5, // Retailer role
          ...(bothDatesSelected ? { startDate: debouncedFromDate.replaceAll("-", "/"), endDate: debouncedToDate.replaceAll("-", "/") } : {}),
        },
        options: {
          sort: { createdAt: -1 },
          page: currentPage,
          paginate: 6,
        },
        customSearch: debouncedSearchTerm.trim()
          ? {
            $or: [
              { name: { $regex: debouncedSearchTerm.trim(), $options: "i" } },
              { mobileNo: { $regex: debouncedSearchTerm.trim(), $options: "i" } },
              { userId: { $regex: debouncedSearchTerm.trim(), $options: "i" } }
            ]
          }
          : {},
      };
      dispatch(roleDataCompanyUser(payload));
    }
  }, [kycLockStatusResponse, debouncedSearchTerm, debouncedFromDate, debouncedToDate, embedded, dispatch]);

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
        notifySuccess({ message: result.message || `Fund ${action === "CREDIT" ? "credited" : "debited"} successfully!`, isCritical: true });
        setFundModal({ show: false, userId: null, userName: "", amount: "", action: "CREDIT", walletType: "mainWallet", remarks: "", isSubmitting: false });
        
        // Refresh table data
        const payload = {
          query: {
            userRole: 5,
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
      "User ID": row.userId || "N/A",
      Name: row.name || "N/A",
      "User Role": row.userRole || "N/A",
      "Mobile No": row.mobileNo || "N/A",
      "Email Id": row.email || "N/A",
      "Parent Name": row.parentName || "N/A",
      "Parent Role": row.parentRole || "N/A",
      "KYC Status": row.kycStatus || "N/A",
      "KYC Steps": row.kycSteps || "0",
      "Main Wallet": getWalletValue(row, "mainWallet"),
      "AEPS1 Wallet": getWalletValue(row, "apes1Wallet"),
      "AEPS2 Wallet": getWalletValue(row, "apes2Wallet"),
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
  const getWalletValue = (row, type = "mainWallet") => {
    if (!row) return "0";

    // Define aliases for the types to handle aeps/apes typos and variations
    const aliases = {
      mainWallet: ["mainWallet", "main_wallet", "walletBalance", "balance"],
      apes1Wallet: [
        "apes1Wallet",
        "aeps1Wallet",
        "aeps1_wallet",
        "apes1_wallet",
        "apesWallet1",
        "aepsWallet1",
      ],
      apes2Wallet: [
        "apes2Wallet",
        "aeps2Wallet",
        "aeps2_wallet",
        "apes2_wallet",
        "apesWallet2",
        "aepsWallet2",
      ],
    };

    const possibleKeys = aliases[type] || [type];

    // Priority Check:
    // 1. Check top level of row
    for (const key of possibleKeys) {
      if (row[key] !== undefined && row[key] !== null) return String(row[key]);
    }

    // 2. Check nested wallet object
    const walletObj = row.wallet || row.wallets || row.walletDetails;
    if (walletObj && typeof walletObj === "object") {
      for (const key of possibleKeys) {
        if (walletObj[key] !== undefined && walletObj[key] !== null)
          return String(walletObj[key]);
      }
    }

    // 3. Check originalItem
    if (row.originalItem) {
      // 3.1 Check originalItem top level
      for (const key of possibleKeys) {
        if (
          row.originalItem[key] !== undefined &&
          row.originalItem[key] !== null
        )
          return String(row.originalItem[key]);
      }
      // 3.2 Check originalItem nested wallet
      const origWalletObj =
        row.originalItem.wallet ||
        row.originalItem.wallets ||
        row.originalItem.walletDetails;
      if (origWalletObj && typeof origWalletObj === "object") {
        for (const key of possibleKeys) {
          if (
            origWalletObj[key] !== undefined &&
            origWalletObj[key] !== null
          )
            return String(origWalletObj[key]);
        }
      }
    }

    return "0";
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
    if (!dateString || dateString === "" || dateString === "null") return "N/A";

    // Handle DD-MM-YYYY or DD/MM/YYYY formats manually
    if (typeof dateString === "string" && (dateString.includes("-") || dateString.includes("/"))) {
      const parts = dateString.split(/[-/]/);
      if (parts.length === 3 && parts[0].length <= 2 && parts[2].length === 4) {
        // Already in a display format, just ensure it uses hyphens
        return parts.join("-");
      }
    }

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "N/A";
      }
      return date.toLocaleDateString("en-GB").replaceAll("/", "-");
    } catch {
      return "N/A";
    }
  };

  if (showProfileDetails) {
    return (
      <ProfileDetails
        onBack={() => {
          setShowProfileDetails(false);
          setSelectedProfileData(null);
        }}
        initialData={selectedProfileData}
        userRole={selectedUserRole || selectedProfileData?.userRole || null}
      />
    );
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
              <div className="flex flex-row gap-3">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-3 pr-3 py-3 border border-gray-300 rounded-lg w-full xs:w-32 text-sm focus:ring-indigo-500 focus:border-indigo-500 text-center cursor-pointer"
                />

                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  min={fromDate || undefined}
                  className="pl-3 pr-3 py-3 border border-gray-300 rounded-lg w-full xs:w-32 text-sm focus:ring-indigo-500 focus:border-indigo-500 text-center cursor-pointer"
                />
              </div>

              <div className="relative w-full sm:w-48">
                <input
                  type="text"
                  placeholder="Search by Mobile No or Name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-4 pr-10 py-3 border border-gray-300 rounded-xl w-full text-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
                <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
              </div>

              <button
                onClick={handleExportToExcel}
                className="flex items-center justify-center gap-2 bg-[#039155] text-white px-4 py-3 rounded-lg font-[Gilroy-Medium] hover:opacity-90 shadow-md text-sm sm:text-base transition-all"
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
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    ID
                  </th>
                  <th className="px-3 py-4 ml-8  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    User
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    User ID
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Name
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    User Role
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Mobile No
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Email Id
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Parent Name
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Parent Role
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Company
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    KYC Status
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    KYC Steps
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Main Wallet
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    AEPS1 Wallet
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    AEPS2 Wallet
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Status
                  </th>
<th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Fund Adjust
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    KYC Details
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Action
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Lock Status
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Onboarding
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Token Expire
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    AEPS 1 Status
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y font-normal text-center divide-gray-100">
                {isLoading ? (
                  <TableBodyLoader colSpan={23} />
                ) : !tableData || tableData.length === 0 ? (
                  <tr>
                    <td colSpan={23} className="py-12 text-center">
                      <p className="text-gray-500 text-lg font-[Gilroy-Medium]">
                        No data available
                      </p>
                    </td>
                  </tr>
                ) : (
                  tableData.map((row, index) => (
                    <tr
                      key={row.id || index}
                      className={`text-sm ${index % 2 === 0 ? "bg-slate-50/50" : "bg-white"}`}
                    >
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {safeString(row.id, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] ">
                        <button
                          onClick={() => {
                            const userId = row.id || row.originalItem?.id;
                            if (userId) {
                              // Save the clicked row so we can show basic details immediately
                              setSelectedProfileData(row);
                              setSelectedUserRole(row.userRole || null);
                              // Fetch full profile details
                              dispatch(getCompanyAdmin(userId));
                              setShowProfileDetails(true);
                            }
                          }}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors cursor-pointer"
                        >
                          <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                        </button>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {safeString(row.userId, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {safeString(row.name, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {safeString(row.userRole, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {safeString(row.mobileNo, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] text-[#121216]">
                        {safeString(row.email || row.emailId, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] text-[#121216]">
                        {safeString(row.parentName, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] text-[#121216]">
                        {safeString(row.parentRole, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] text-[#121216]">
                        {safeString(row.company || row.companyName, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {(() => {
                          const status = row.kycStatus?.toLowerCase();
                          let className =
                            "px-2 py-1 rounded text-xs font-[Gilroy-Medium] ";
                          if (status === "completed" || status === "full_kyc" || status === "verified" || row.kycSteps === 7) {
                            className += "bg-emerald-50 text-emerald-600 border border-emerald-100";
                          } else if (status === "pending") {
                            className += "bg-yellow-50 text-yellow-700 border border-yellow-100";
                          } else {
                            className += "bg-rose-50 text-rose-700 border border-rose-100";
                          }
                          return (
                            <span className={className}>
                              {status === "completed" || status === "full_kyc" || status === "verified" || row.kycSteps === 7 ? "COMPLETED" : safeString(row.kycStatus, "N/A")}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] text-[#121216] font-[Gilroy-Regular] text-center">
                        {safeString(row.kycSteps, "0")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] text-[#121216] font-[Gilroy-Regular] text-center">
                        {getWalletValue(row, "mainWallet")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] text-[#121216] font-[Gilroy-Regular] text-center">
                        {getWalletValue(row, "apes1Wallet")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] text-[#121216] font-[Gilroy-Regular] text-center">
                        {getWalletValue(row, "apes2Wallet")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        <span
                          className={`px-3 py-1 rounded-lg text-white text-xs font-[Gilroy-Medium] ${row.status?.toLowerCase() === "active"
                            ? "bg-emerald-600"
                            : "bg-rose-600"
                            }`}
                        >
                          {safeString(row.status, "Active")}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Medium]">
                        <button
                          onClick={() => setFundModal({
                            show: true,
                            userId: row.id || row.originalItem?.id,
                            userName: row.name || row.userName || "User",
                            amount: "",
                            action: "CREDIT",
                            walletType: "mainWallet",
                            remarks: "Manual balance credit transfer",
                            isSubmitting: false,
                          })}
                          className="flex items-center gap-1.5 bg-[#039155] hover:bg-green-700 text-white px-4 py-2 rounded-xl font-[Gilroy-Semibold] text-xs transition-all active:scale-95 shadow-sm"
                        >
                          <Wallet className="w-3.5 h-3.5" />
                          <span>Fund Adjust</span>
                        </button>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        <button
                          onClick={() => {
                            const userId = row.id || row.originalItem?.id;
                            if (userId) {
                              setSelectedUserId(userId);
                              setIsKycModalLoading(true);
                              dispatch(kycDataCompany(userId));
                              setShowKycModal(true);
                            }
                          }}
                          className="px-3 py-1 border border-[#039155] text-[#039155] rounded-lg hover:bg-emerald-50 text-xs font-[Gilroy-Medium] transition-colors"
                        >
                          KYC Details
                        </button>
                      </td>
                      {/* Action - Toggle Button */}
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] text-[#121216] font-[Gilroy-Regular]">
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
                                  if (!embedded) {
                                    setTimeout(() => {
                                      const bothDatesSelected = debouncedFromDate && debouncedToDate;
                                      const payload = {
                                        query: {
                                          userRole: 5, // Retailer role
                                          ...(bothDatesSelected ? { startDate: debouncedFromDate.replace(/-/g, "/"), endDate: debouncedToDate.replace(/-/g, "/") } : {}),
                                        },
                                        options: {
                                          sort: { id: -1 },
                                          page: 1,
                                          paginate: 100000,
                                        },
                                        customSearch: debouncedSearchTerm.trim()
                                          ? {
                                            mobileNo: debouncedSearchTerm.trim(),
                                            name: debouncedSearchTerm.trim(),
                                          }
                                          : {},
                                      };
                                      dispatch(roleDataCompanyUser(payload));
                                    }, 500);
                                  }
                                }
                              }}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-offset-1 ${isActive ? "bg-[#039155]" : "bg-gray-300"
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
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {(() => {
                          const userId = row.id || row.originalItem?.id;
                          // Check multiple possible formats for lock status
                          // Priority: row.lock (direct property) > originalItem.lock > isLocked > lockStatus
                          const lockValue =
                            row?.lock !== undefined && row?.lock !== null
                              ? row.lock
                              : row?.originalItem?.lock !== undefined && row?.originalItem?.lock !== null
                                ? row.originalItem.lock
                                : row?.isLocked !== undefined && row?.isLocked !== null
                                  ? row.isLocked
                                  : row?.lockStatus;
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
                                  // The useEffect hook will automatically refresh the table
                                  // when kycLockStatusResponse status becomes "SUCCESS"
                                  dispatch(kycUnlock(userId));
                                }
                              }}
                              disabled={!isLocked}
                              className={`px-4 py-2 rounded-lg text-xs font-[Gilroy-Semibold] transition-all ${isLocked
                                ? "bg-rose-600 text-white hover:bg-rose-700 cursor-pointer"
                                : "bg-[#039155] text-white cursor-not-allowed opacity-90 shadow-sm shadow-emerald-100"
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
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {(() => {
                          const userId = row.id || row.originalItem?.id;
                          return (
                            <button
                              onClick={() => {
                                if (userId) {
                                  dispatch(rescendOnboarding(userId));
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
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {(() => {
                          const userId = row.id || row.originalItem?.id;
                          return (
                            <button
                              onClick={() => {
                                if (userId) {
                                  dispatch(deActiveOnboarding(userId));
                                }
                              }}
                              className="px-3 py-1 border border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 text-xs font-[Gilroy-Medium] transition-colors"
                            >
                              Send
                            </button>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {(() => {
                          return (
                            <button
                              onClick={() => {
                                if (row.id) {
                                  dispatch(checkCompanyAepsStatus(row.id));
                                }
                              }}
                              disabled={row.aepsOnboardingStatus === true}
                              className={`px-3 py-1 border border-indigo-500 text-indigo-600 rounded-lg text-xs font-[Gilroy-Medium] transition-colors ${row.aepsOnboardingStatus === true
                                ? "opacity-50 cursor-not-allowed bg-gray-100 border-gray-300 text-gray-400"
                                : "hover:bg-indigo-50"
                                }`}
                            >
                              Check Status
                            </button>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] text-[#121216] font-[Gilroy-Regular]">
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
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1 || totalPages === 0}
              className={`p-2 border border-gray-300 rounded-lg ${currentPage === 1 || totalPages === 0
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
                    onClick={() => handlePageChange(page)}
                    className={`w-8 h-8 rounded-lg text-sm font-[Gilroy-Medium] transition-all ${page === currentPage
                      ? "bg-[#039155] text-white shadow-md shadow-emerald-200"
                      : "bg-white text-gray-700 border border-gray-200 hover:bg-emerald-50"
                      }`}
                  >
                    {page}
                  </button>
                ),
              )
            ) : (
              <span className="w-8 h-8 rounded-lg text-sm font-[Gilroy-Medium] flex items-center justify-center text-gray-500">
                0
              </span>
            )}
            <button
              onClick={() =>
                handlePageChange(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages || totalPages === 0}
              className={`p-2 border border-gray-300 rounded-lg ${currentPage === totalPages || totalPages === 0
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
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    ID
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    User
                  </th>

                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    User ID
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Name
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    User Role
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Mobile No
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Email Id
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Parent Name
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Parent Role
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Company
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    KYC Status
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    KYC Steps
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Main Wallet
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    AEPS1 Wallet
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    AEPS2 Wallet
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Status
                  </th>
<th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Fund Adjust
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    KYC Details
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Action
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Lock Status
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Onboarding
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Token Expire
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    AEPS 1 Status
                  </th>
                  <th className="px-3 py-4  font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y font-normal text-center divide-gray-100">
                {isLoading ? (
                  <TableBodyLoader colSpan={23} />
                ) : !tableData || tableData.length === 0 ? (
                  <tr>
                    <td colSpan={23} className="py-12 text-center">
                      <p className="text-gray-500 text-lg font-[Gilroy-Medium]">
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
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] text-[#121216]">
                        {safeString(row.id, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] text-center">
                        <button
                          onClick={() => {
                            const userId = row.id || row.originalItem?.id;
                            if (userId) {
                              // Save the clicked row so we can show basic details immediately
                              setSelectedProfileData(row);
                              // Fetch full profile details
                              dispatch(getCompanyAdmin(userId));
                              setShowProfileDetails(true);
                            }
                          }}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors cursor-pointer"
                        >
                          <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                        </button>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {safeString(row.userId, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {safeString(row.name, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {safeString(row.userRole, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {safeString(row.mobileNo, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {safeString(row.email, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {safeString(row.parentName, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {safeString(row.parentRole, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {safeString(row.company, "N/A")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {(() => {
                          const status = row.kycStatus?.toLowerCase();
                          let className =
                            "px-2 py-1 rounded text-xs font-[Gilroy-Medium] ";
                          if (status === "completed" || status === "full_kyc") {
                            className += "bg-emerald-50 text-[#039155] border border-emerald-100";
                          } else if (status === "pending") {
                            className += "bg-yellow-50 text-yellow-700 border border-yellow-100";
                          } else {
                            className += "bg-rose-50 text-rose-700 border border-rose-100";
                          }
                          return (
                            <span className={className}>
                              {safeString(row.kycStatus, "N/A")}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular] text-center">
                        {safeString(row.kycSteps, "0")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular] text-center">
                        {getWalletValue(row, "mainWallet")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular] text-center">
                        {getWalletValue(row, "apes1Wallet")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular] text-center">
                        {getWalletValue(row, "apes2Wallet")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        <span
                          className={`px-3 py-1 rounded-lg text-white text-xs font-[Gilroy-Medium] ${row.status?.toLowerCase() === "active"
                            ? "bg-[#039155]"
                            : "bg-rose-600"
                            }`}
                        >
                          {safeString(row.status, "Active")}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Medium]">
                        <button
                          onClick={() => setFundModal({
                            show: true,
                            userId: row.id || row.originalItem?.id,
                            userName: row.name || row.userName || "User",
                            amount: "",
                            action: "CREDIT",
                            walletType: "mainWallet",
                            remarks: "Manual balance credit transfer",
                            isSubmitting: false,
                          })}
                          className="flex items-center gap-1.5 bg-[#039155] hover:bg-green-700 text-white px-4 py-2 rounded-xl font-[Gilroy-Semibold] text-xs transition-all active:scale-95 shadow-sm"
                        >
                          <Wallet className="w-3.5 h-3.5" />
                          <span>Fund Adjust</span>
                        </button>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        <button
                          onClick={() => {
                            const userId = row.id || row.originalItem?.id;
                            if (userId) {
                              setSelectedUserId(userId);
                              dispatch(kycDataCompany(userId));
                              setShowKycModal(true);
                            }
                          }}
                          className="px-3 py-1 border border-[#039155] text-[#039155] rounded-lg hover:bg-emerald-50 text-xs font-[Gilroy-Medium] transition-colors"
                        >
                          KYC Details
                        </button>
                      </td>
                      {/* Action - Toggle Button */}
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
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
                                  if (!embedded) {
                                    setTimeout(() => {
                                      const bothDatesSelected = debouncedFromDate && debouncedToDate;
                                      const payload = {
                                        query: {
                                          userRole: 5, // Retailer role
                                          ...(bothDatesSelected ? { startDate: debouncedFromDate.replace(/-/g, "/"), endDate: debouncedToDate.replace(/-/g, "/") } : {}),
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
                                      dispatch(roleDataCompanyUser(payload));
                                    }, 500);
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
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {(() => {
                          const userId = row.id || row.originalItem?.id;
                          // Check multiple possible formats for lock status
                          // Priority: row.lock (direct property) > originalItem.lock > isLocked > lockStatus
                          const lockValue =
                            row?.lock !== undefined && row?.lock !== null
                              ? row.lock
                              : row?.originalItem?.lock !== undefined && row?.originalItem?.lock !== null
                                ? row.originalItem.lock
                                : row?.isLocked !== undefined && row?.isLocked !== null
                                  ? row.isLocked
                                  : row?.lockStatus;

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
                                  // The useEffect hook will automatically refresh the table
                                  // when kycLockStatusResponse status becomes "SUCCESS"
                                  dispatch(kycUnlock(userId));
                                }
                              }}
                              disabled={!isLocked}
                              className={`px-4 py-2 rounded-lg text-xs font-[Gilroy-Semibold] transition-all ${isLocked
                                ? "bg-rose-600 text-white hover:bg-rose-700 cursor-pointer"
                                : "bg-[#039155] text-white cursor-not-allowed opacity-90 shadow-sm shadow-emerald-100"
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
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {(() => {
                          const userId = row.id || row.originalItem?.id;
                          return (
                            <button
                              onClick={() => {
                                if (userId) {
                                  dispatch(rescendOnboarding(userId));
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
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {(() => {
                          const userId = row.id || row.originalItem?.id;
                          return (
                            <button
                              onClick={() => {
                                if (userId) {
                                  dispatch(deActiveOnboarding(userId));
                                }
                              }}
                              className="px-3 py-1 border border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 text-xs font-[Gilroy-Medium] transition-colors"
                            >
                              Send
                            </button>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                        {(() => {
                          return (
                            <button
                              onClick={() => {
                                if (row.id) {
                                  dispatch(checkCompanyAepsStatus(row.id));
                                }
                              }}
                              disabled={row.aepsOnboardingStatus === true}
                              className={`px-3 py-1 border border-indigo-500 text-indigo-600 rounded-lg text-xs font-[Gilroy-Medium] transition-colors ${row.aepsOnboardingStatus === true
                                ? "opacity-50 cursor-not-allowed bg-gray-100 border-gray-300 text-gray-400"
                                : "hover:bg-indigo-50"
                                }`}
                            >
                              Check Status
                            </button>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
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
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1 || totalPages === 0}
              className={`p-2 border border-gray-300 rounded-lg ${currentPage === 1 || totalPages === 0
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
                    onClick={() => handlePageChange(page)}
                    className={`w-8 h-8 rounded-lg text-sm font-[Gilroy-Medium] transition-all ${page === currentPage
                      ? "bg-[#039155] text-white shadow-md shadow-emerald-200"
                      : "bg-white text-gray-700 border border-gray-200 hover:bg-emerald-50"
                      }`}
                  >
                    {page}
                  </button>
                ),
              )
            ) : (
              <span className="w-8 h-8 rounded-lg text-sm font-[Gilroy-Medium] flex items-center justify-center text-gray-500">
                0
              </span>
            )}
            <button
              onClick={() =>
                handlePageChange(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages || totalPages === 0}
              className={`p-2 border border-gray-300 rounded-lg ${currentPage === totalPages || totalPages === 0
                ? "text-gray-400 cursor-not-allowed bg-gray-100"
                : "text-gray-500 hover:bg-gray-100"
                }`}
            >
              <IoIosArrowForward />
            </button>
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
        zoomedImage={zoomedImage}
        setZoomedImage={setZoomedImage}
        dispatch={dispatch}
        kycModalRef={kycModalRef}
        revertAction={kycRevertCompany}
      />
    
      {/* Fund Adjust Modal */}
      {fundModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-[#1B1717] p-5 flex items-center justify-between">
              <div className="flex flex-col">
                <h2 className="text-white font-[Gilroy-Semibold] text-lg">Fund Adjustment</h2>
                <span className="text-gray-400 text-xs mt-1">Adjust balance for {fundModal.userName || "User"}</span>
              </div>
              <button
                onClick={() => setFundModal({ show: false, userId: null, userName: "", amount: "", action: "CREDIT", walletType: "mainWallet", remarks: "", isSubmitting: false })}
                className="text-gray-400 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-5">
              {/* Action Tabs */}
              <div className="flex p-1 bg-gray-100 rounded-xl">
                <button
                  onClick={() => setFundModal((prev) => ({ ...prev, action: "CREDIT" }))}
                  className={`flex-1 py-2 text-sm font-[Gilroy-Semibold] rounded-lg transition-all ${
                    fundModal.action === "CREDIT"
                      ? "bg-white text-[#039155] shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Credit Fund
                </button>
                <button
                  onClick={() => setFundModal((prev) => ({ ...prev, action: "DEBIT" }))}
                  className={`flex-1 py-2 text-sm font-[Gilroy-Semibold] rounded-lg transition-all ${
                    fundModal.action === "DEBIT"
                      ? "bg-white text-red-500 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Debit Fund
                </button>
              </div>

              {/* Amount Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-[Gilroy-Medium] text-gray-500 ml-1">Amount</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-[Gilroy-Medium]">₹</span>
                  </div>
                  <input
                    type="number"
                    value={fundModal.amount}
                    onChange={(e) => setFundModal((prev) => ({ ...prev, amount: e.target.value }))}
                    className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#039155]/20 focus:border-[#039155] transition-colors font-[Gilroy-Medium] text-sm"
                    placeholder="Enter amount"
                  />
                </div>
              </div>

              {/* Wallet Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-[Gilroy-Medium] text-gray-500 ml-1">Wallet Type</label>
                <select
                  value={fundModal.walletType}
                  onChange={(e) => setFundModal((prev) => ({ ...prev, walletType: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#039155]/20 focus:border-[#039155] transition-colors font-[Gilroy-Medium] text-sm bg-white"
                >
                  <option value="mainWallet">Main Wallet</option>
                  <option value="aeps1Wallet">AEPS1 Wallet</option>
                  <option value="aeps2Wallet">AEPS2 Wallet</option>
                </select>
              </div>

              {/* Remarks */}
              <div className="space-y-1.5">
                <label className="text-xs font-[Gilroy-Medium] text-gray-500 ml-1">Remarks</label>
                <textarea
                  value={fundModal.remarks}
                  onChange={(e) => setFundModal((prev) => ({ ...prev, remarks: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#039155]/20 focus:border-[#039155] transition-colors font-[Gilroy-Medium] text-sm resize-none"
                  placeholder="Enter reason for adjustment..."
                  rows="3"
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

export default Retailers;
