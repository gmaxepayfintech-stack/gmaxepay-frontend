import React, { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import {
  FaSearch,
  FaPlus,
  FaUpload,
} from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { User, Wallet } from "lucide-react";
import * as XLSX from "xlsx";
import WhiteLabel from "./WhiteLabel";
import AdminWhitelabelList from "./superAdminDashboard/adminWhitelabelList";
import MasterDistribution from "./superAdminDashboard/masterDistribution";
import MasterDistributionOnboarding from "./superAdminDashboard/masterDistributionOnboarding";
import Distribution from "./superAdminDashboard/distribution";
import DistributionOnboarding from "./superAdminDashboard/DistrubtionOnboarding";
import Retailers from "./superAdminDashboard/Retailers";
import RetailerOnboarding from "./superAdminDashboard/RetailerOnboarding";
import ProfileDetails from "./superAdminDashboard/ProfileDetails";
import {
  useList,
  kycData,
  kycStatusCheck,
  kycUnlock,
  kycRevert,
  rescendOnboarding,
  deActiveOnboarding,
} from "../redux/action/whiteLabelAction";
import { getSlabList } from "../redux/action/slabAction";
import { ButtonLoader } from "../widgets/layout/loader";
import { motion } from "framer-motion";
import {
  getAdminProfileDetails,
  setSelectedUserRole,
} from "../redux/action/userProfileAction";
import { useLocation, useSearchParams } from "react-router-dom";
import Employee from "./superAdminDashboard/employee";
import KycModal from "./superAdminDashboard/KycModal";
import { adminCreditDebit } from "../redux/action/fundAction";
import { useNotification } from "../context/NotificationContext";
// Stable empty array reference to prevent unnecessary re-renders
const EMPTY_ARRAY = [];

const CreateWhiteLabel = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const [showWhiteLabel, setShowWhiteLabel] = useState(false);
  const [showProfileDetails, setShowProfileDetails] = useState(false);
  const [showOnboardingList, setShowOnboardingList] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams(); // Add this line before state declarations

  const [activeNav, setActiveNav] = useState(() => {
    // Check URL parameter first
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl) {
      return tabFromUrl;
    }
    // Default to Whitelabel
    return "Whitelabel";
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [debouncedFromDate, setDebouncedFromDate] = useState("");
  const [isTableLoading, setIsTableLoading] = useState(true); // Start with true to show loader on initial load

  // Track previous response to detect when data actually arrives
  const prevResponseRef = useRef(undefined);
  const [isKycModalLoading, setIsKycModalLoading] = useState(false);

  // Initialize toDate to empty string so user explicitly chooses it
  const [toDate, setToDate] = useState("");
  const [debouncedToDate, setDebouncedToDate] = useState("");
  const [selectedKycData, setSelectedKycData] = useState(null);
  const [showKycModal, setShowKycModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [zoomedImage, setZoomedImage] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [kycDataRefreshKey, setKycDataRefreshKey] = useState(0);
  const tableContainerRef = useRef(null);

  // Revert confirmation state
  const [showRevertConfirm, setShowRevertConfirm] = useState(false);
  const [revertPayload, setRevertPayload] = useState(null);
  const [isReverting, setIsReverting] = useState(false);

  const { success: notifySuccess, error: notifyError } = useNotification();

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
      const result = await dispatch(adminCreditDebit({
        userId: Number(userId),
        amount: Number(amount),
        action,
        walletType,
        remarks: remarks.trim(),
      }));
      if (result?.status === "SUCCESS") {
        notifySuccess({ message: result.message || `Fund ${action === 'CREDIT' ? 'credited' : 'debited'} successfully!`, isCritical: true });
        setFundModal({ show: false, userId: null, userName: "", amount: "", action: "CREDIT", walletType: "mainWallet", remarks: "", isSubmitting: false });
        
        // Refresh API data
        const payload = {
          query: {
            userRole: getRoleNumber(activeNav),
            ...(showOnboardingList && { kycStatus: "pending" }),
            ...(debouncedFromDate && debouncedToDate ? { startDate: debouncedFromDate.replace(/-/g, "/"), endDate: debouncedToDate.replace(/-/g, "/") } : {}),
          },
          options: { sort: { id: -1 }, page: currentPage, paginate: 6 },
          customSearch: debouncedSearchTerm.trim() ? { mobileNo: debouncedSearchTerm.trim(), name: debouncedSearchTerm.trim() } : {},
        };
        dispatch(useList(payload));
      } else {
        notifyError({ message: result?.message || "Fund adjustment failed. Please try again.", isCritical: true });
        setFundModal((prev) => ({ ...prev, isSubmitting: false }));
      }
    } catch {
      notifyError({ message: "An unexpected error occurred.", isCritical: true });
      setFundModal((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

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

  // Get data from Redux - the action extracts data array and stores it as whitelabelList.whitelabelList
  // Use stable empty array reference to prevent unnecessary re-renders
  const responseForTableRaw = useSelector(
    (state) => state?.whitelabel?.whitelabelList?.whitelabelList,
  );
  const responseForTable = useMemo(
    () => responseForTableRaw || EMPTY_ARRAY,
    [responseForTableRaw],
  );

  // Get loading state from Redux
  const reduxLoading = useSelector(
    (state) => state?.loading?.isLoading || false,
  );

  const totalCount = useSelector((state) => {
    const response = state?.whitelabel?.whitelabelList;
    return (
      response?.total ||
      response?.totalCount ||
      response?.whitelabelList?.length ||
      0
    );
  });

  const totalPages = useSelector((state) => {
    const response = state?.whitelabel?.whitelabelList;
    const pageCount = response?.paginator?.pageCount;
    const total = response?.total || response?.totalCount || response?.whitelabelList?.length || 0;
    if (pageCount && pageCount > 0) return pageCount;
    return Math.ceil(total / 6) || 1;
  });

  // Get kycStatusCheck success state to refresh table after update
  const kycStatusCheckResponse = useSelector(
    (state) => state?.whitelabel?.kycStatusCheck,
  );

  // Get kycRevert success state to refresh KYC data after revert
  const kycRevertResponse = useSelector(
    (state) => state?.whitelabel?.kycRevert,
  );

  // Get kycLockStatus success state to refresh table after unlock
  const kycLockStatusResponse = useSelector(
    (state) => state?.whitelabel?.kycLockStatus,
  );


  // Get KYC details from Redux state - watch the entire kycDetails object to detect changes
  const kycDetailsState = useSelector((state) => state?.whitelabel?.kycDetails);
  const kycRetrieved = kycDetailsState?.data || null;
  // Use status as a key to detect when data is refreshed
  const kycDetailsStatus = kycDetailsState?.status;

  // Handle tab changes from URL parameter
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl) {
      setActiveNav(tabFromUrl);
      setShowOnboardingList(false);
      setCurrentPage(1);
    }
  }, [searchParams]);

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

  // Map navigation to userRole numbers
  const getRoleNumber = (nav) => {
    switch (nav) {
      case "Employee":
        return 6;
      case "Retailers":
        return 5;
      case "Distributor":
        return 4;
      case "Master Distributor":
        return 3;
      case "Whitelabel":
        return 2;
      default:
        return 2;
    }
  };

  // Fetch data from API based on role and kycStatus
  useEffect(() => {
    // Only fetch if both dates are provided, or if both dates are empty
    const bothDatesSelected = debouncedFromDate && debouncedToDate;
    const bothDatesNull = !debouncedFromDate && !debouncedToDate;

    if (!bothDatesSelected && !bothDatesNull) {
      return;
    }

    const userRole = getRoleNumber(activeNav);

    // Build query object - only include kycStatus when onboarding process is active
    const query = {
      userRole: userRole,
      ...(showOnboardingList && { kycStatus: "pending" }),
      ...(debouncedFromDate && debouncedToDate ? { startDate: debouncedFromDate.replace(/-/g, "/"), endDate: debouncedToDate.replace(/-/g, "/") } : {}),
    };

    // Build customSearch object - include mobileNo and name only
    const customSearch = {};

    // Add search term if exists
    if (debouncedSearchTerm.trim()) {
      customSearch.mobileNo = debouncedSearchTerm.trim();
      customSearch.name = debouncedSearchTerm.trim();
    }

    const payload = {
      query: query,
      options: {
        sort: { id: -1 },
        page: currentPage,
        paginate: 6,
      },
      customSearch: Object.keys(customSearch).length > 0 ? customSearch : {},
    };

    setIsTableLoading(true);
    dispatch(useList(payload));
  }, [
    activeNav,
    currentPage,
    showOnboardingList,
    debouncedSearchTerm,
    debouncedFromDate,
    debouncedToDate,
    dispatch,
  ]);

  // Refresh table when kycStatusCheck succeeds
  useEffect(() => {
    if (kycStatusCheckResponse?.status === "SUCCESS") {
      // Only fetch if both dates are provided, or if both dates are empty
      const bothDatesSelected = debouncedFromDate && debouncedToDate;
      const bothDatesNull = !debouncedFromDate && !debouncedToDate;

      if (!bothDatesSelected && !bothDatesNull) {
        return;
      }

      // Refresh table data by dispatching useList again
      const userRole = getRoleNumber(activeNav);
      const query = {
        userRole: userRole,
        ...(showOnboardingList && { kycStatus: "pending" }),
        ...(debouncedFromDate && debouncedToDate ? { startDate: debouncedFromDate.replace(/-/g, "/"), endDate: debouncedToDate.replace(/-/g, "/") } : {}),
      };
      const customSearch = {};
      if (debouncedSearchTerm.trim()) {
        customSearch.mobileNo = debouncedSearchTerm.trim();
        customSearch.name = debouncedSearchTerm.trim();
      }
      const payload = {
        query: query,
        options: {
          sort: { id: -1 },
          page: currentPage,
          paginate: 6,
        },
        customSearch: Object.keys(customSearch).length > 0 ? customSearch : {},
      };
      setIsTableLoading(true);
      dispatch(useList(payload));
    }
  }, [
    kycStatusCheckResponse,
    activeNav,
    currentPage,
    showOnboardingList,
    debouncedSearchTerm,
    debouncedFromDate,
    debouncedToDate,
    dispatch,
  ]);

  // Refresh table when kycUnlock succeeds
  useEffect(() => {
    if (kycLockStatusResponse?.status === "SUCCESS") {
      // Only fetch if both dates are provided, or if both dates are empty
      const bothDatesSelected = debouncedFromDate && debouncedToDate;
      const bothDatesNull = !debouncedFromDate && !debouncedToDate;

      if (!bothDatesSelected && !bothDatesNull) {
        return;
      }

      const userRole = getRoleNumber(activeNav);
      const query = {
        userRole: userRole,
        ...(showOnboardingList && { kycStatus: "pending" }),
        ...(debouncedFromDate && debouncedToDate ? { startDate: debouncedFromDate.replace(/-/g, "/"), endDate: debouncedToDate.replace(/-/g, "/") } : {}),
      };
      const customSearch = {};
      if (debouncedSearchTerm.trim()) {
        customSearch.mobileNo = debouncedSearchTerm.trim();
        customSearch.name = debouncedSearchTerm.trim();
      }
      const payload = {
        query: query,
        options: {
          sort: { id: -1 },
          page: currentPage,
          paginate: 6,
        },
        customSearch: Object.keys(customSearch).length > 0 ? customSearch : {},
      };
      setIsTableLoading(true);
      dispatch(useList(payload));
    }
  }, [
    kycLockStatusResponse,
    activeNav,
    currentPage,
    showOnboardingList,
    debouncedSearchTerm,
    debouncedFromDate,
    debouncedToDate,
    dispatch,
  ]);

  // Set loading state based on Redux loading and data availability
  useEffect(() => {
    if (reduxLoading) {
      setIsTableLoading(true);
      return;
    }

    // When Redux finishes loading (success OR failure), always hide the loader
    setIsTableLoading(false);
    if (responseForTableRaw !== undefined) {
      prevResponseRef.current = responseForTableRaw;
    }
  }, [reduxLoading, responseForTableRaw]);

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
        dispatch(kycData(selectedUserId));
      }, 500);

      return () => clearTimeout(timer);
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

  // Handle wheel event for horizontal scrolling (non-passive to allow preventDefault)
  useEffect(() => {
    const container = tableContainerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      // Enable horizontal scrolling with Shift + mouse wheel or horizontal wheel
      if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        container.scrollLeft += e.deltaX || e.deltaY;
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, []);

  const tableHeaders = [
    "ID",
    "User",
    "User Agent Code",
    "Name",
    "User Role",
    "Mobile No",
    "Email Id",
    "Slab Name",
    "Parent Name",
    "Parent Role",
    "Company Name",
    "KYC Status",
    "KYC Steps",
    "Main Wallet",
    "AEPS1 Wallet",
    "AEPS2 Wallet",
    "Fund Adjust",
    // "Remaining Days",
    "Status",
    "KYC Details",
    "Action",
    "Lock Status",
    "Onboarding",
    "Token Expire",
    "Date",
  ];

  const safeString = (value, fallback = "N/A") => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === "object") {
      // If it's an object, try to stringify or return fallback
      try {
        return JSON.stringify(value);
      } catch {
        return fallback;
      }
    }
    return String(value);
  };

  // Transform API data to table format for main table
  const transformApiData = (dataArray) => {
    // Handle if dataArray is already an array or if it's a response object
    const data = Array.isArray(dataArray)
      ? dataArray
      : dataArray?.data?.docs || dataArray?.docs || dataArray?.data || [];

    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    return data.map((item, index) => {
      // Format date from API
      let formattedDate = "N/A";
      if (item.date) {
        formattedDate = new Date(item.date)
          .toLocaleDateString("en-GB")
          .replaceAll("/", "-");
      } else if (item.createdAt) {
        formattedDate = new Date(item.createdAt)
          .toLocaleDateString("en-GB")
          .replaceAll("/", "-");
      }

      // Calculate remaining days (you may need to adjust this based on your business logic)
      const calculateRemainingDays = () => {
        // If there's a subscription end date, calculate from that
        if (item.subscriptionEndDate) {
          const endDate = new Date(item.subscriptionEndDate);
          const today = new Date();
          const diffTime = endDate - today;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays > 0 ? String(diffDays) : "0";
        }
        // Default value as shown in image
        return "1067";
      };

      // Get AEPS1 Wallet (apes1Wallet) from wallet object
      const getAeps1Wallet = () => {
        if (item.wallet && typeof item.wallet === "object") {
          return String(item.wallet.apes1Wallet || "0");
        }
        return "0";
      };

      // Get AEPS2 Wallet (apes2Wallet) from wallet object
      const getAeps2Wallet = () => {
        if (item.wallet && typeof item.wallet === "object") {
          return String(item.wallet.apes2Wallet || "0");
        }
        return "0";
      };

      // Return object with keys matching table header order
      const transformed = {
        id: safeString(item.id, "N/A"),
        date: formattedDate,
        userId: safeString(item.userId, "N/A"),
        name: safeString(item.name, "N/A"),
        userRole: safeString(item.userRole, "N/A"),
        mobileNo: safeString(item.mobileNo || item.mobile, "N/A"),
        emailId: safeString(item.email, "N/A"),
        slabName: safeString(item.slab, "N/A"),
        parentName: safeString(item.parentName || item.parent?.name, "N/A"),
        parentRole: safeString(item.parentRole || item.parent?.role, "N/A"),
        companyName: safeString(
          item.company || item.companyName || item.company?.name,
          "N/A",
        ),
        kycStatus: safeString(item.kycStatus, "N/A"),
        kycSteps: safeString(item.kycSteps, "N/A"),
        aeps1Wallet: getAeps1Wallet(),
        aeps2Wallet: getAeps2Wallet(),
        remainingDays: calculateRemainingDays(),
        status: safeString(item.status, "Active"),
        kycDetails: item.kycDetails || null, // Store full kycDetails object for modal
        approved: item.approved === undefined ? true : item.approved, // For checkbox
        originalItem: item,
      };

      return transformed;
    });
  };

  const transformDataForComponents = (dataArray, componentType = "default") => {
    // Handle if dataArray is already an array or if it's a response object
    const data = Array.isArray(dataArray)
      ? dataArray
      : dataArray?.data?.docs || dataArray?.docs || dataArray?.data || [];

    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    return data.map((item, index) => {
      // Format date from API response
      let formattedDate = "13-10-25";
      if (item.date) {
        formattedDate = new Date(item.date)
          .toLocaleDateString("en-GB")
          .replaceAll("/", "-");
      } else if (item.createdAt) {
        formattedDate = new Date(item.createdAt)
          .toLocaleDateString("en-GB")
          .replaceAll("/", "-");
      }

      // Get AEPS1 Wallet (apes1Wallet) from wallet object
      const getAeps1Wallet = () => {
        if (item.wallet && typeof item.wallet === "object") {
          return String(item.wallet.apes1Wallet || "0");
        }
        return "0";
      };

      // Get AEPS2 Wallet (apes2Wallet) from wallet object
      const getAeps2Wallet = () => {
        if (item.wallet && typeof item.wallet === "object") {
          return String(item.wallet.apes2Wallet || "0");
        }
        return "0";
      };

      // Calculate remaining days
      const calculateRemainingDays = () => {
        if (item.subscriptionEndDate) {
          const endDate = new Date(item.subscriptionEndDate);
          const today = new Date();
          const diffTime = endDate - today;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays > 0 ? String(diffDays) : "0";
        }
        return "1067";
      };

      const baseData = {
        id: safeString(item.id, "N/A"),
        srNo: String((currentPage - 1) * 6 + index + 1).padStart(2, "0"),
        date: formattedDate,
        userId: safeString(item.userId, "N/A"),
        userAgentCode: safeString(
          item.userId || item.agentCode || item.userAgentCode,
          "SECPY26007",
        ),
        userName: safeString(item.name || item.userName, "Rudra"),
        name: safeString(item.name, "N/A"),
        userRole: safeString(item.userRole, "WL"), // API returns string: "WL", "MD", "D", "R"
        mobileNo: safeString(item.mobileNo || item.mobile, "N/A"),
        mobileNumber: safeString(
          item.mobileNo || item.mobile || item.phone,
          "N/A",
        ),
        email: safeString(item.email, "N/A"),
        emailId: safeString(item.email, "N/A"),
        slabName: safeString(item.slab, "N/A"),
        parentName: safeString(
          item.parentName || item.parent?.name,
          "GMAXEPAY",
        ),
        parentRole: safeString(
          item.parentRole || item.parent?.role,
          "Enterprise Partner",
        ),
        company: safeString(
          item.company || item.companyName || item.company?.name,
          "N/A",
        ),
        companyName: safeString(
          item.company || item.companyName || item.company?.name,
          "GMAXEPAY",
        ),
        kycStatus: safeString(item.kycStatus, "N/A"),
        kycSteps: safeString(item.kycSteps, "0"),
        status: safeString(item.status, "Active"),
        aeps1Wallet: getAeps1Wallet(),
        aeps2Wallet: getAeps2Wallet(),
        remainingDays: calculateRemainingDays(),
        kycDetails: item.kycDetails || null,
        approved: item.approved === undefined ? true : item.approved,
        onboardingTokenExpiresAt: item.onboardingTokenExpiresAt,
        aepsOnboardingStatus: item.aepsOnboardingStatus,
        originalItem: item,
      };

      // Some components use mobile/email, others use mobileNumber/emailId
      if (
        componentType === "employee" ||
        componentType === "masterDistribution" ||
        componentType === "distribution" ||
        componentType === "retailers"
      ) {
        return {
          ...baseData,
          mobile: safeString(
            item.mobileNo || item.mobile || item.phone,
            "9350547710",
          ),
          email: safeString(item.email, "Rudraj@Gmail.Com"),
          // Retailers component reads row.company for Company Name column
          company: safeString(
            item.company || item.companyName || item.company?.name,
            "N/A",
          ),
        };
      }

      // Default format for onboarding components - includes all attributes
      return {
        ...baseData,
        mobileNumber: safeString(
          item.mobileNo || item.mobile || item.phone,
          "9350547710",
        ),
        emailId: safeString(item.email, "Rudraj@Gmail.Com"),
      };
    });
  };

  const getApiDataForComponents = () => {
    // Always use responseForTable - extract actual data array
    let actualData = null;

    if (Array.isArray(responseForTable)) {
      // If responseForTable is already an array, use it directly
      actualData = responseForTable.length > 0 ? responseForTable : null;
    } else if (responseForTable && typeof responseForTable === "object") {
      actualData =
        responseForTable.data ||
        responseForTable.data?.docs ||
        responseForTable.docs;
      if (!Array.isArray(actualData) || actualData.length === 0) {
        actualData = null;
      }
    }

    // If no actual data found, return empty array (don't use dummy data)
    if (!actualData) {
      return [];
    }

    // Determine component type for proper field mapping
    let componentType = "default";
    if (activeNav === "Master Distributor" && !showOnboardingList) {
      componentType = "masterDistribution";
    } else if (activeNav === "Distributor" && !showOnboardingList) {
      componentType = "distribution";
    } else if (activeNav === "Retailers" && !showOnboardingList) {
      componentType = "retailers";
    } else if (activeNav === "Employee" && !showOnboardingList) {
      componentType = "employee";
    }

    // Transform the actual API data
    const transformedData = transformDataForComponents(
      actualData,
      componentType,
    );
    return transformedData;
  };

  const getTableData = () => {
    let transformedData = [];
    if (responseForTable) {
      if (Array.isArray(responseForTable) && responseForTable.length > 0) {
        transformedData = transformApiData(responseForTable);
      } else if (
        responseForTable.data &&
        Array.isArray(responseForTable.data) &&
        responseForTable.data.length > 0
      ) {
        transformedData = transformApiData(responseForTable.data);
      }
    }
    const startIndex = (currentPage - 1) * 6;
    const endIndex = startIndex + 6;
    return transformedData.slice(startIndex, endIndex);
  };

  const currentTableData = getTableData();

  // Export to Excel function
  const handleExportToExcel = () => {
    // Get all transformed data (not just current page)
    let allData = [];

    if (responseForTable) {
      if (Array.isArray(responseForTable) && responseForTable.length > 0) {
        allData = transformApiData(responseForTable);
      } else if (
        responseForTable.data &&
        Array.isArray(responseForTable.data) &&
        responseForTable.data.length > 0
      ) {
        allData = transformApiData(responseForTable.data);
      }
    }

    if (!allData || allData.length === 0) {
      alert("No data available to export");
      return;
    }

    // Prepare data for Excel export
    const excelData = allData.map((row) => ({
      ID: row.id || "N/A",
      Date: row.date || "N/A",
      "User Agent Code": row.userId || "N/A",
      Name: row.name || "N/A",
      "User Role": row.userRole || "N/A",
      "Mobile No": row.mobileNo || "N/A",
      "Email Id": row.emailId || "N/A",
      "Parent Name": row.parentName || "N/A",
      "Parent Role": row.parentRole || "N/A",
      "Company Name": row.companyName || "N/A",
      "Slab Name": row.slabName || "N/A",
      "KYC Status": row.kycStatus || "N/A",
      "KYC Steps": row.kycSteps || "0",
      "Main Wallet": row.mainWallet || "0",
      "AEPS1 Wallet": row.aeps1Wallet || "0",
      "AEPS2 Wallet": row.aeps2Wallet || "0",
      // "Remaining Days": row.remainingDays || "N/A",
      Status: row.status || "Active",
    }));

    // Create a new workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${activeNav} Data`);

    // Generate Excel file and download
    const fileName = `${activeNav}_Export_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  if (showWhiteLabel) {
    return <WhiteLabel onBack={() => setShowWhiteLabel(false)} />;
  }

  if (showProfileDetails) {
    return <ProfileDetails onBack={() => setShowProfileDetails(false)} />;
  }
  return (
    <div className="text-[#1B1717] w-full h-full  py-3  px-2 ">
      <div className="w-full h-full ">
        {/* Header Navigation */}
        <div className="w-full mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-sm py-3 overflow-x-auto">
            <nav className="relative flex ">
              {[
                "Whitelabel",
                "Master Distributor",
                "Distributor",
                "Retailers",
                "Employee",
              ].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setActiveNav(item);
                    setShowOnboardingList(false);
                    setSearchParams({ tab: item });
                  }}
                  className="relative flex-auto flex justify-evenly"
                >
                  <span className="relative px-2 py-1.5 sm:px-3 sm:py-2 rounded-[16px]">
                    {/* Moving pill */}
                    {activeNav === item && (
                      <motion.span
                        layoutId="active-nav-pill"
                        className="absolute inset-0 rounded-[16px] bg-[#039155]"
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 35,
                        }}
                      />
                    )}

                    {/* Text */}
                    <span
                      className={`relative z-10 text-sm sm:text-base lg:text-lg
                font-[gilroy-[gilroy-medium]] whitespace-nowrap
                ${activeNav === item
                          ? "text-white"
                          : "text-[#1B1717] hover:text-[#039155]"
                        }`}
                    >
                      {item}
                    </span>
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Top Buttons */}
        {activeNav !== "Employee" && (
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => setShowOnboardingList(false)}
              className={`px-4 py-2 rounded-2xl font-[Gilroy-Medium] shadow-md text-sm sm:text-base ${showOnboardingList
                ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                : "bg-[#039155] text-white"
                }`}
            >
              All List
            </button>
            <button
              onClick={() => setShowOnboardingList(true)}
              className={`px-4 py-2 rounded-2xl font-[Gilroy-Medium] text-sm sm:text-base ${showOnboardingList
                ? "bg-[#039155] text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
            >
              Onboarding Process
            </button>
          </div>
        )}

        {(() => {
          const apiData = getApiDataForComponents();

          if (showOnboardingList && activeNav === "Master Distributor") {
            return (
              <MasterDistributionOnboarding
                embedded={true}
                tableData={apiData}
              />
            );
          }
          if (showOnboardingList && activeNav === "Distributor") {
            return (
              <DistributionOnboarding embedded={true} tableData={apiData} />
            );
          }
          if (showOnboardingList && activeNav === "Retailers") {
            return <RetailerOnboarding embedded={true} tableData={apiData} />;
          }
          if (showOnboardingList && activeNav === "Whitelabel") {
            return <AdminWhitelabelList embedded={true} tableData={apiData} serverTotalPages={totalPages} onPageChange={(page) => setCurrentPage(page)} />;
          }

          // All List Views - Always pass API data, even if empty
          if (activeNav === "Master Distributor") {
            return (
              <MasterDistribution
                embedded={true}
                tableData={apiData}
                isLoading={isTableLoading}
                serverTotalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            );
          }
          if (activeNav === "Distributor") {
            return (
              <Distribution
                embedded={true}
                tableData={apiData}
                isLoading={isTableLoading}
                serverTotalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            );
          }
          if (activeNav === "Retailers") {
            return (
              <Retailers
                embedded={true}
                tableData={apiData}
                isLoading={isTableLoading}
                serverTotalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            );
          }
          if (activeNav === "Employee") {
            return (
              <Employee
                embedded={true}
                tableData={apiData}
                isLoading={isTableLoading}
              />
            );
          }
          return (
            <div className="flex flex-col min-h-[calc(100vh-300px)]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4">
                <h2 className="text-xl sm:text-2xl font-[gilroy-[gilroy-medium]] text-gray-800">
                  {(() => {
                    if (activeNav === "Whitelabel")
                      return "Whitelabel All Lists";
                    if (activeNav === "Master Distributor")
                      return "Master Distribution";
                    if (activeNav === "Distributor") return "Distributor";
                    if (activeNav === "Employee") return "Employee";
                    return "Retailers";
                  })()}
                </h2>

                <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-end gap-3">
                  <div className="flex flex-row gap-3">
                    <div className="relative">
                      <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => {
                          setFromDate(e.target.value);
                        }}
                        className="pl-3 pr-3 py-3 border border-gray-300 rounded-lg w-full xs:w-32 text-sm focus:ring-green-500 focus:border-green-500 text-center cursor-pointer"
                      />
                    </div>

                    <div className="relative">
                      <input
                        type="date"
                        value={toDate}
                        onChange={(e) => {
                          setToDate(e.target.value);
                        }}
                        min={fromDate || undefined}
                        className="pl-3 pr-3 py-3 border border-gray-300 rounded-lg w-full xs:w-32 text-sm focus:ring-green-500 focus:border-green-500 text-center cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="relative w-full sm:w-48">
                    <input
                      type="text"
                      placeholder="Search by Mobile No or Name"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                      }}
                      className="pl-4 pr-10 py-3 border border-gray-300 rounded-xl w-full text-sm focus:ring-green-500 focus:border-green-500"
                    />
                    <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => setShowWhiteLabel(true)}
                      className="flex items-center justify-center gap-3 bg-[#039155] text-white px-4 py-3 rounded-xl font-[Gilroy-Medium] hover:bg-green-700 shadow-md text-sm sm:text-base"
                    >
                      <span>Create New</span>
                      <div className="w-6 h-6 rounded-full border border-white flex items-center justify-center">
                        <FaPlus className="text-xs" />
                      </div>
                    </button>

                    <button
                      onClick={handleExportToExcel}
                      className="flex items-center justify-center bg-white text-gray-700 border border-gray-300 px-4 py-3 rounded-lg font-[Gilroy-Medium] hover:bg-gray-100 text-sm sm:text-base"
                    >
                      Export <FaUpload className="ml-2 text-xs" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div
                ref={tableContainerRef}
                className="flex-1 overflow-x-auto rounded-xl bg-white mb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                style={{ cursor: "pointer" }}
                onMouseDown={(e) => {
                  if (e.button === 0) {
                    // Left mouse button
                    const container = e.currentTarget;
                    const startX = e.pageX - container.offsetLeft;
                    const scrollLeft = container.scrollLeft;
                    let isDown = true;

                    const handleMouseMove = (e) => {
                      if (!isDown) return;
                      e.preventDefault();
                      const x = e.pageX - container.offsetLeft;
                      const walk = (x - startX) * 2; // Scroll speed
                      container.scrollLeft = scrollLeft - walk;
                    };

                    const handleMouseUp = () => {
                      isDown = false;
                      document.removeEventListener(
                        "mousemove",
                        handleMouseMove,
                      );
                      document.removeEventListener("mouseup", handleMouseUp);
                      container.style.cursor = "pointer";
                    };

                    document.addEventListener("mousemove", handleMouseMove);
                    document.addEventListener("mouseup", handleMouseUp);
                    container.style.cursor = "pointer";
                  }
                }}
              >
                <table className="min-w-[720px] sm:min-w-full divide-y">
                  <thead className="bg-white">
                    <tr>
                      {tableHeaders.map((header) => (
                        <th
                          key={header}
                          className="px-3 py-4 font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap text-center"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y font-normal divide-gray-100">
                    {isTableLoading ? (
                      <TableBodyLoader colSpan={13} />
                    ) : !currentTableData || currentTableData.length === 0 ? (
                      <tr>
                        <td
                          colSpan={tableHeaders.length}
                          className="py-12 text-center"
                        >
                          <p className="text-gray-500 text-lg font-[Gilroy-Medium]">
                            No data available
                          </p>
                        </td>
                      </tr>
                    ) : (
                      currentTableData.map((row, index) => (
                        <tr
                          key={index}
                          className={`text-sm ${index % 2 === 0 ? "bg-green-50" : "bg-white"
                            }`}
                        >
                          {/* ID */}
                          <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] text-center">
                            {row.id || "N/A"}
                          </td>
                          {/* User */}
                          <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] text-center">
                            <button
                              onClick={() => {
                                const userId = row.id || row.originalItem?.id;
                                if (userId) {
                                  // Store selected user's role for ProfileDetails badge
                                  const roleFromRow =
                                    row.userRole ||
                                    row.originalItem?.userRole ||
                                    row.originalItem?.role ||
                                    row.originalItem?.userType ||
                                    null;
                                  dispatch(setSelectedUserRole(roleFromRow));

                                  // Call admin profile details API with just userId (no payload)
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
                          <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] text-center">
                            {row.userId || "N/A"}
                          </td>
                          {/* Name */}
                          <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] text-center">
                            {row.name || "N/A"}
                          </td>
                          {/* User Role */}
                          <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Medium] text-[14px] text-center">
                            {row.userRole || "N/A"}
                          </td>
                          {/* Mobile No */}
                          <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] text-center">
                            {row.mobileNo || "N/A"}
                          </td>
                          {/* Email Id */}
                          <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] text-center">
                            {row.emailId || "N/A"}
                          </td>
                          {/* Slab Name */}
                          <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Medium] text-[14px] text-center">
                            {row.slabName ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-[Gilroy-Medium] bg-[#FFF7E0] text-[#B7791F] border border-[#F6E0A3]">
                                {row.slabName}
                              </span>
                            ) : (
                              <span className="text-[14px] text-gray-500">
                                N/A
                              </span>
                            )}
                          </td>
                          {/* Parent Name */}
                          <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] text-center">
                            {row.parentName || "N/A"}
                          </td>
                          {/* Parent Role */}
                          <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Medium] text-[14px] text-center">
                            {row.parentRole || "N/A"}
                          </td>
                          {/* Company Name */}
                          <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] text-center">
                            {row.companyName || "N/A"}
                          </td>
                          {/* KYC Status */}
                          <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Medium] text-[14px] text-center">
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
                          <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] text-center">
                            {row.kycSteps || "0"}
                          </td>
                          {/* Main Wallet */}
                          <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] text-center">
                            {row.mainWallet || "0"}
                          </td>
                          {/* AEPS Wallet */}
                          <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] text-center">
                            {row.aeps1Wallet || "0"}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] text-center">
                            {row.aeps2Wallet || "0"}
                          </td>
                          {/* Fund Adjust */}
                          <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Medium] text-[14px] text-center">
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
                              className="flex items-center justify-center gap-1.5 bg-[#039155] hover:bg-green-700 text-white px-3 py-1.5 rounded-lg font-[Gilroy-Semibold] text-xs transition-all active:scale-95 shadow-sm mx-auto"
                            >
                              <Wallet className="w-3 h-3" />
                              <span>Fund Adjust</span>
                            </button>
                          </td>
                          {/* Remaining Days */}
                          {/* <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Regular] text-[14px] text-center">
                            {row.remainingDays || "0"}
                          </td> */}
                          {/* Status */}
                          <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Medium] text-[14px] text-center">
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
                          <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Medium] text-[14px] text-center">
                            <button
                              onClick={() => {
                                const userId = row.id || row.originalItem?.id;
                                if (userId) {
                                  setSelectedUserId(userId);
                                  setIsKycModalLoading(true);
                                  dispatch(kycData(userId));
                                  setShowKycModal(true);
                                }
                              }}
                              className="px-3 py-1 border border-green-500 text-green-600 rounded-lg hover:bg-green-50 text-xs font-[Gilroy-Medium] transition-colors"
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
                                        const userRole =
                                          getRoleNumber(activeNav);
                                        const query = {
                                          userRole: userRole,
                                          ...(showOnboardingList && {
                                            kycStatus: "pending",
                                          }),
                                          ...(debouncedFromDate && debouncedToDate ? { startDate: debouncedFromDate.replace(/-/g, "/"), endDate: debouncedToDate.replace(/-/g, "/") } : {}),
                                        };
                                        const customSearch = {};
                                        if (debouncedSearchTerm.trim()) {
                                          customSearch.mobileNo =
                                            debouncedSearchTerm.trim();
                                          customSearch.name =
                                            debouncedSearchTerm.trim();
                                        }
                                        const payload = {
                                          query: query,
                                          options: {
                                            sort: { id: -1 },
                                            page: currentPage,
                                            paginate: 6,
                                          },
                                          customSearch:
                                            Object.keys(customSearch).length > 0
                                              ? customSearch
                                              : {},
                                        };
                                        setIsTableLoading(true);
                                        dispatch(useList(payload));
                                      }, 500); // Small delay to ensure API call is initiated
                                    }
                                  }}
                                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none  focus:ring-offset-1 ${isActive ? "bg-green-600" : "bg-gray-300"
                                    }`}
                                  role="switch"
                                  aria-checked={isActive}
                                >
                                  <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive
                                      ? "translate-x-6"
                                      : "translate-x-1"
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
                              // Check multiple possible formats for lock status
                              // Priority: row.lock (direct property) > originalItem.lock > isLocked > lockStatus
                              const getLockValue = () => {
                                // First priority: row.lock (direct property)
                                if (row?.lock !== undefined && row?.lock !== null) {
                                  return row.lock;
                                }
                                // Second priority: row.originalItem.lock
                                if (row?.originalItem?.lock !== undefined && row?.originalItem?.lock !== null) {
                                  return row.originalItem.lock;
                                }
                                // Third priority: row.isLocked
                                if (row?.isLocked !== undefined && row?.isLocked !== null) {
                                  return row.isLocked;
                                }
                                // Fourth priority: row.lockStatus
                                if (row?.lockStatus !== undefined) {
                                  return row.lockStatus;
                                }
                                return undefined;
                              };

                              const lockValue = getLockValue();

                              // More robust check for lock status - handles true, "true", 1, and string "true"
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
                                  className={`px-4 py-2 rounded-lg text-xs font-[Gilroy-Semibold] transition-colors ${isLocked
                                    ? "bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                                    : "bg-green-500 text-white cursor-pointer opacity-75"
                                    }`}
                                  title={
                                    isLocked
                                      ? "Click to enable access for this account"
                                      : "Account access is enabled"
                                  }
                                >
                                  {isLocked
                                    ? "Enable Access"
                                    : "Access Enabled"}
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
                          <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Medium] text-[14px]">
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
                    className={`p-2 border border-gray-300 rounded-lg transition cursor-pointer ${currentPage === 1
                      ? "text-gray-300 bg-gray-100"
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
                        className={`w-8 h-8 rounded-lg text-sm font-[Gilroy-Medium] transition ${page === currentPage
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
                    disabled={currentPage === totalPages || totalPages === 0}
                    className={`p-2 border border-gray-300 rounded-lg transition cursor-pointer ${currentPage === totalPages || totalPages === 0
                      ? "text-gray-300 bg-gray-100"
                      : "text-gray-500 hover:bg-gray-100"
                      }`}
                  >
                    <IoIosArrowForward />
                  </button>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* KYC Details Modal Component */}
      <KycModal
        isOpen={showKycModal}
        onClose={() => {
          setShowKycModal(false);
          setSelectedKycData(null);
          setActiveTab("overview");
          setZoomedImage(null);
          setSelectedUserId(null);
        }}
        selectedUserId={selectedUserId}
        kycData={selectedKycData}
        isLoading={isKycModalLoading}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        zoomedImage={zoomedImage}
        setZoomedImage={setZoomedImage}
        showRevertConfirm={showRevertConfirm}
        setShowRevertConfirm={setShowRevertConfirm}
        revertPayload={revertPayload}
        setRevertPayload={setRevertPayload}
        isReverting={isReverting}
        setIsReverting={setIsReverting}
        dispatch={dispatch}
        kycStatus={selectedKycData?.kycStatus}
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

export default CreateWhiteLabel;
