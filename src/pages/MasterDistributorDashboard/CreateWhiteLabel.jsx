import React, { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import {
  FaSearch,
  FaPlus,
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
import { X, ZoomIn, User } from "lucide-react";
import * as XLSX from "xlsx";
import WhiteLabel from "./WhiteLabel";
import AdminWhitelabelList from "./adminWhitelabelList";
import MasterDistribution from "./masterDistribution";
import MasterDistributionOnboarding from "./masterDistributionOnboarding";
import Distribution from "./distribution";
import DistributionOnboarding from "./DistrubtionOnboarding";
import Retailers from "./Retailers";
import RetailerOnboarding from "./RetailerOnboarding";
import ProfileDetails from "./ProfileDetails";
import {
  useList,
  kycDataUser,
  kycStatusCheck,
  kycUnlock,
  kycRevert,
  rescendOnboarding,
  deActiveOnboarding,
  getCompanyAdmin,
} from "../../redux/action/whiteLabelAction";
import { getSlabList } from "../../redux/action/slabAction";
import { ButtonLoader } from "../../widgets/layout/loader";
import { motion } from "framer-motion";

// Stable empty array reference to prevent unnecessary re-renders
const EMPTY_ARRAY = [];

const generateTableData = (type, count = 12) => {
  let userRole = "WL";
  if (type === "Distributor") {
    userRole = "D";
  } else if (type === "Retailers") {
    userRole = "R";
  }

  let parentRole = "Enterprise Partner";
  if (type === "Distributor") {
    parentRole = "Distributor";
  } else if (type === "Retailers") {
    parentRole = "Retailer";
  }

  const baseData = {
    srNo: "01",
    date: "13-10-25",
    userAgentCode: "SECPY26007",
    userName: "Rudra",
    userRole: userRole,
    mobile: "9350547710",
    email: "Rudra@Gmail.Com",
    parentName: "GMAXEPAY",
    parentRole: parentRole,
    companyName: "GMAXEPAY",
  };

  return Array.from({ length: count }, (_, index) => ({
    ...baseData,
    srNo: String(index + 1).padStart(2, "0"),
  }));
};

const CreateWhiteLabel = () => {
  const dispatch = useDispatch();

  const [showWhiteLabel, setShowWhiteLabel] = useState(false);
  const [showProfileDetails, setShowProfileDetails] = useState(false);
  const [showOnboardingList, setShowOnboardingList] = useState(false);
  const [activeNav, setActiveNav] = useState("Distributor");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [isTableLoading, setIsTableLoading] = useState(true); // Start with true to show loader on initial load

  // Track previous response to detect when data actually arrives
  const prevResponseRef = useRef(undefined);
  const [isKycModalLoading, setIsKycModalLoading] = useState(false);

  // Set toDate to today's date in YYYY-MM-DD format
  const [toDate, setToDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [selectedKycData, setSelectedKycData] = useState(null);
  const [showKycModal, setShowKycModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [zoomedImage, setZoomedImage] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [kycDataRefreshKey, setKycDataRefreshKey] = useState(0);
  const kycModalRef = useRef(null);
  const tableContainerRef = useRef(null);

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
      response?.totalCount ||
      response?.total ||
      response?.whitelabelList?.length ||
      0
    );
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

  // Calculate total pages based on total count (10 records per page)
  const totalPages = Math.ceil(totalCount / 10) || 1;

  // Get KYC details from Redux state - watch the entire kycDetails object to detect changes
  const kycDetailsState = useSelector((state) => state?.whitelabel?.kycDetailsUser);
  const kycRetrieved = kycDetailsState?.data || null;
  // Use status as a key to detect when data is refreshed
  const kycDetailsStatus = kycDetailsState?.status;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Map navigation to userRole numbers
  const getRoleNumber = (nav) => {
    switch (nav) {
      case "Distributor":
        return 4;
      case "Retailers":
        return 5;
      default:
        return 4;
    }
  };

  // Fetch data from API based on role and kycStatus
  useEffect(() => {
    const userRole = getRoleNumber(activeNav);

    // Build query object - only include kycStatus when onboarding process is active
    const query = {
      userRole: userRole,
      ...(showOnboardingList && { kycStatus: "pending" }),
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
        paginate: 10,
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
    fromDate,
    toDate,
    dispatch,
  ]);

  // Refresh table when kycStatusCheck succeeds
  useEffect(() => {
    if (kycStatusCheckResponse?.status === "SUCCESS") {
      // Refresh table data by dispatching useList again
      const userRole = getRoleNumber(activeNav);
      const query = {
        userRole: userRole,
        ...(showOnboardingList && { kycStatus: "pending" }),
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
          paginate: 10,
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
    dispatch,
  ]);

  // Refresh table when kycUnlock succeeds
  useEffect(() => {
    if (kycLockStatusResponse?.status === "SUCCESS") {
      const userRole = getRoleNumber(activeNav);
      const query = {
        userRole: userRole,
        ...(showOnboardingList && { kycStatus: "pending" }),
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
          paginate: 10,
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
    dispatch,
  ]);

  // Set loading state based on Redux loading and data availability
  useEffect(() => {
    // If Redux is loading, show loader
    if (reduxLoading) {
      setIsTableLoading(true);
      return;
    }

    // If Redux loading has ended, check if we have data (even if empty array)
    // This means the API call completed
    if (!reduxLoading && responseForTableRaw !== undefined) {
      // Data has arrived (could be empty array), hide loader
      setIsTableLoading(false);
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
      // Clear current data to force re-render
      setSelectedKycData(null);
      // Small delay to ensure backend has processed the revert
      const timer = setTimeout(() => {
        // Force update by incrementing refresh key
        setKycDataRefreshKey((prev) => prev + 1);
        // Refresh KYC data after revert
        dispatch(kycDataUser(selectedUserId));
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
    "AEPS Wallet",
    "Remaining Days",
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

      // Get AEPS Wallet (apesWallet) from wallet object
      const getAepsWallet = () => {
        if (item.wallet && typeof item.wallet === "object") {
          return String(
            item.wallet.apesWallet || item.wallet.aepsWallet || "0",
          );
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
        aepsWallet: getAepsWallet(),
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

      // Get AEPS Wallet (apesWallet) from wallet object
      const getAepsWallet = () => {
        if (item.wallet && typeof item.wallet === "object") {
          return String(
            item.wallet.apesWallet || item.wallet.aepsWallet || "0",
          );
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
        srNo: String((currentPage - 1) * 10 + index + 1).padStart(2, "0"),
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
        companyName: safeString(
          item.company || item.companyName || item.company?.name,
          "GMAXEPAY",
        ),
        kycStatus: safeString(item.kycStatus, "N/A"),
        kycSteps: safeString(item.kycSteps, "0"),
        status: safeString(item.status, "Active"),
        aepsWallet: getAepsWallet(),
        remainingDays: calculateRemainingDays(),
        kycDetails: item.kycDetails || null,
        approved: item.approved === undefined ? true : item.approved,
        originalItem: item,
      };

      // Some components use mobile/email, others use mobileNumber/emailId
      if (
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
    const startIndex = (currentPage - 1) * 10;
    const endIndex = startIndex + 10;
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
      "AEPS Wallet": row.aepsWallet || "0",
      "Remaining Days": row.remainingDays || "N/A",
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
        <div className="w-[28%] mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-sm py-2 overflow-x-auto">
            <nav className="relative flex">
              {["Distributor", "Retailers"].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setActiveNav(item);
                    setShowOnboardingList(false);
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
                font-[Gilroy-Medium] whitespace-nowrap
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

        {(() => {
          const apiData = getApiDataForComponents();

          // if (showOnboardingList && activeNav === "Master Distributor") {
          //   return (
          //     <MasterDistributionOnboarding
          //       embedded={true}
          //       tableData={apiData}
          //     />
          //   );
          // }
          if (showOnboardingList && activeNav === "Distributor") {
            return (
              <DistributionOnboarding embedded={true} tableData={apiData} />
            );
          }
          if (showOnboardingList && activeNav === "Retailers") {
            return <RetailerOnboarding embedded={true} tableData={apiData} />;
          }
          // if (showOnboardingList && activeNav === "Whitelabel") {
          //   return <AdminWhitelabelList embedded={true} tableData={apiData} />;
          // }

          // All List Views - Always pass API data, even if empty
          // if (activeNav === "Master Distributor") {
          //   return (
          //     <MasterDistribution
          //       embedded={true}
          //       tableData={apiData}
          //       isLoading={isTableLoading}
          //     />
          //   );
          // }
          if (activeNav === "Distributor") {
            return (
              <Distribution
                embedded={true}
                tableData={apiData}
                isLoading={isTableLoading}
              />
            );
          }
          if (activeNav === "Retailers") {
            return (
              <Retailers
                embedded={true}
                tableData={apiData}
                isLoading={isTableLoading}
              />
            );
          }
          return (
            <div className="flex flex-col min-h-[calc(100vh-300px)]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4">
                <h2 className="text-xl sm:text-2xl font-[Gilroy-Medium] text-gray-800">
                  {(() => {
                    // if (activeNav === "Whitelabel")
                    //   return "Whitelabel All Lists";
                    // if (activeNav === "Master Distributor")
                    //   return "Master Distribution";
                    if (activeNav === "Distributor") return "Distributor";
                    return "Retailers";
                  })()}
                </h2>

                <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-end gap-3">
                  <div className="flex flex-col xs:flex-row gap-3">
                    <div className="relative">
                      <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => {
                          setFromDate(e.target.value);
                          setCurrentPage(1); // Reset to first page when date changes
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
                          setCurrentPage(1); // Reset to first page when date changes
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
                      <TableBodyLoader colSpan={tableHeaders.length} />
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
                          <td className="px-4 py-4 whitespace-nowrap text-[14px] text-center">
                            {row.id || "N/A"}
                          </td>
                          {/* User */}
                          <td className="px-4 py-4 whitespace-nowrap text-[14px] text-center">
                            <button
                              onClick={() => {
                                const userId = row.id || row.originalItem?.id;
                                if (userId) {
                                  dispatch(getCompanyAdmin(userId));
                                  setShowProfileDetails(true);
                                }
                              }}
                              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors cursor-pointer"
                            >
                              <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                            </button>
                          </td>
                          {/* User ID */}
                          <td className="px-4 py-4 whitespace-nowrap text-[14px] text-center">
                            {row.userId || "N/A"}
                          </td>
                          {/* Name */}
                          <td className="px-4 py-4 whitespace-nowrap text-[14px] text-center">
                            {row.name || "N/A"}
                          </td>
                          {/* User Role */}
                          <td className="px-4 py-4 whitespace-nowrap text-[14px] text-center">
                            {row.userRole || "N/A"}
                          </td>
                          {/* Mobile No */}
                          <td className="px-4 py-4 whitespace-nowrap text-[14px] text-center">
                            {row.mobileNo || "N/A"}
                          </td>
                          {/* Email Id */}
                          <td className="px-4 py-4 whitespace-nowrap text-[14px] text-center">
                            {row.emailId || "N/A"}
                          </td>
                          {/* Slab Name */}
                          <td className="px-4 py-4 whitespace-nowrap text-[14px] text-center">
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
                          <td className="px-4 py-4 whitespace-nowrap text-[14px] text-center">
                            {row.parentName || "N/A"}
                          </td>
                          {/* Parent Role */}
                          <td className="px-4 py-4 whitespace-nowrap text-[14px] text-center">
                            {row.parentRole || "N/A"}
                          </td>
                          {/* Company Name */}
                          <td className="px-4 py-4 whitespace-nowrap text-[14px] text-center">
                            {row.companyName || "N/A"}
                          </td>
                          {/* KYC Status */}
                          <td className="px-4 py-4 whitespace-nowrap text-[14px] text-center">
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
                          <td className="px-4 py-4 whitespace-nowrap text-[14px] text-center">
                            {row.kycSteps || "0"}
                          </td>
                          {/* Main Wallet */}
                          <td className="px-4 py-4 whitespace-nowrap text-[14px] text-center">
                            {row.mainWallet || "0"}
                          </td>
                          {/* AEPS Wallet */}
                          <td className="px-4 py-4 whitespace-nowrap text-[14px] text-center">
                            {row.aepsWallet || "0"}
                          </td>
                          {/* Remaining Days */}
                          <td className="px-4 py-4 whitespace-nowrap text-[14px] text-center">
                            {row.remainingDays || "0"}
                          </td>
                          {/* Status */}
                          <td className="px-4 py-4 whitespace-nowrap text-[14px] text-center">
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
                          <td className="px-4 py-4 whitespace-nowrap text-[14px] text-center">
                            <button
                              onClick={() => {
                                const userId = row.id || row.originalItem?.id;
                                if (userId) {
                                  setSelectedUserId(userId);
                                  setIsKycModalLoading(true);
                                  dispatch(kycDataUser(userId));
                                  setShowKycModal(true);
                                }
                              }}
                              className="px-3 py-1 border border-green-500 text-green-600 rounded-lg hover:bg-green-50 text-xs font-[Gilroy-Medium] transition-colors"
                            >
                              KYC Details
                            </button>
                          </td>
                          {/* Action - Toggle Button */}
                          <td className="px-4 py-4 whitespace-nowrap text-[14px]">
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
                                            paginate: 10,
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
                          <td className="px-4 py-4 whitespace-nowrap text-[14px]">
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
                                  {isLocked ? "Enable Access" : "Access Enabled"}
                                </button>
                              );
                            })()}
                          </td>
                          {/* Onboarding - Re-send Button */}
                          <td className="px-4 py-4 whitespace-nowrap text-[14px]">
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
                          <td className="px-4 py-4 whitespace-nowrap text-[14px]">
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
                          <td className="px-4 py-4 whitespace-nowrap text-[14px]">
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
                  <h2 className="text-xl font-[Gilroy-Semibold] text-gray-800">
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
                  setActiveTab("overview");
                  setZoomedImage(null);
                  setSelectedUserId(null);
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
                  className={`px-4 py-3 text-sm font-[Gilroy-Medium] transition-colors relative ${activeTab === "overview"
                    ? "text-green-600 border-b-2 border-green-600"
                    : "text-gray-600 hover:text-gray-800"
                    }`}
                >
                  Overview
                </button>

                <button
                  onClick={() => setActiveTab("aadhar")}
                  className={`px-4 py-3 text-sm font-[Gilroy-Medium] transition-colors relative ${activeTab === "aadhar"
                    ? "text-green-600 border-b-2 border-green-600"
                    : "text-gray-600 hover:text-gray-800"
                    }`}
                >
                  Aadhar Document
                </button>
                <button
                  onClick={() => setActiveTab("pan")}
                  className={`px-4 py-3 text-sm font-[Gilroy-Medium] transition-colors relative ${activeTab === "pan"
                    ? "text-green-600 border-b-2 border-green-600"
                    : "text-gray-600 hover:text-gray-800"
                    }`}
                >
                  PAN Document
                </button>
                <button
                  onClick={() => setActiveTab("details")}
                  className={`px-4 py-3 text-sm font-[Gilroy-Medium] transition-colors relative ${activeTab === "details"
                    ? "text-green-600 border-b-2 border-green-600"
                    : "text-gray-600 hover:text-gray-800"
                    }`}
                >
                  Outlet Details
                </button>
                <button
                  onClick={() => setActiveTab("bankDetails")}
                  className={`px-4 py-3 text-sm font-[Gilroy-Medium] transition-colors relative ${activeTab === "bankDetails"
                    ? "text-green-600 border-b-2 border-green-600"
                    : "text-gray-600 hover:text-gray-800"
                    }`}
                >
                  Bank Details
                </button>
                <button
                  onClick={() => setActiveTab("verification")}
                  className={`px-4 py-3 text-sm font-[Gilroy-Medium] transition-colors relative ${activeTab === "verification"
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
                          <h3 className="text-lg font-[Gilroy-Semibold] text-gray-800 flex items-center gap-2">
                            <FaIdCard className="text-green-600" />
                            KYC Status
                          </h3>
                          <span
                            className={`px-4 py-2 rounded-full text-sm font-[Gilroy-Semibold] ${selectedKycData.kycStatus === "FULL_KYC"
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
                            <span className="text-sm font-[Gilroy-Medium] text-gray-700">
                              Progress
                            </span>
                            <span className="text-sm font-[Gilroy-Semibold] text-gray-800">
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
                          <h3 className="text-lg font-[Gilroy-Semibold] text-gray-800 mb-4 flex items-center gap-2">
                            <FaUser className="text-green-600" />
                            User Details
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">
                                User ID
                              </span>
                              <span className="text-sm font-[Gilroy-Medium] text-gray-800">
                                {selectedKycData.userDetails.userId || "N/A"}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">
                                Name
                              </span>
                              <span className="text-sm font-[Gilroy-Medium] text-gray-800">
                                {selectedKycData.userDetails.name || "N/A"}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">
                                Mobile No
                              </span>
                              <span className="text-sm font-[Gilroy-Medium] text-gray-800">
                                {selectedKycData.userDetails.mobileNo || "N/A"}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">
                                Email
                              </span>
                              <span className="text-sm font-[Gilroy-Medium] text-gray-800">
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
                            <h3 className="text-lg font-[Gilroy-Semibold] text-gray-800 flex items-center gap-2">
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
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-[Gilroy-Medium]"
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
                              <span className="text-sm font-[Gilroy-Medium] text-gray-800">
                                {selectedKycData.aadhaarDoc.name || "N/A"}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">
                                UID
                              </span>
                              <span className="text-sm font-[Gilroy-Medium] text-gray-800">
                                {selectedKycData.aadhaarDoc.uid || "N/A"}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">
                                DOB
                              </span>
                              <span className="text-sm font-[Gilroy-Medium] text-gray-800">
                                {selectedKycData.aadhaarDoc.dob || "N/A"}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">
                                Status
                              </span>
                              <span
                                className={`px-3 py-1 rounded-lg text-xs font-[Gilroy-Semibold] inline-block w-fit ${selectedKycData.aadhaarDoc.status ===
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
                            <h3 className="text-lg font-[Gilroy-Semibold] text-gray-800 flex items-center gap-2">
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
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-[Gilroy-Medium]"
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
                              <span className="text-sm font-[Gilroy-Medium] text-gray-800">
                                {selectedKycData.panDoc.panNumber || "N/A"}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">
                                PAN Name
                              </span>
                              <span className="text-sm font-[Gilroy-Medium] text-gray-800">
                                {selectedKycData.panDoc.panName || "N/A"}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">
                                DOB
                              </span>
                              <span className="text-sm font-[Gilroy-Medium] text-gray-800">
                                {selectedKycData.panDoc.panDob || "N/A"}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">
                                Status
                              </span>
                              <span
                                className={`px-3 py-1 rounded-lg text-xs font-[Gilroy-Semibold] inline-block w-fit ${selectedKycData.panDoc.status === "Success"
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
                            <h3 className="text-lg font-[Gilroy-Semibold] text-gray-800 flex items-center gap-2">
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
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-[Gilroy-Medium]"
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
                              <span className="text-sm font-[Gilroy-Medium] text-gray-800">
                                {selectedKycData.outletDetails.shopName ||
                                  "N/A"}
                              </span>
                            </div>
                            {selectedKycData.outletDetails.gstNo && (
                              <div className="flex flex-col">
                                <span className="text-xs text-gray-500 mb-1">
                                  GST No
                                </span>
                                <span className="text-sm font-[Gilroy-Medium] text-gray-800">
                                  {selectedKycData.outletDetails.gstNo}
                                </span>
                              </div>
                            )}
                            <div className="flex flex-col md:col-span-2">
                              <span className="text-xs text-gray-500 mb-1">
                                Shop Address
                              </span>
                              <span className="text-sm font-[Gilroy-Medium] text-gray-800">
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
                            <h3 className="text-lg font-[Gilroy-Semibold] text-gray-800 flex items-center gap-2">
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
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-[Gilroy-Medium]"
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
                              <span className="text-sm font-[Gilroy-Medium] text-gray-800">
                                {selectedKycData.customerBankDetails
                                  .accountNumber || "N/A"}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">
                                IFSC
                              </span>
                              <span className="text-sm font-[Gilroy-Medium] text-gray-800">
                                {selectedKycData.customerBankDetails.ifsc ||
                                  "N/A"}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">
                                Bank Name
                              </span>
                              <span className="text-sm font-[Gilroy-Medium] text-gray-800">
                                {selectedKycData.customerBankDetails.bankName ||
                                  "N/A"}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">
                                Beneficiary Name
                              </span>
                              <span className="text-sm font-[Gilroy-Medium] text-gray-800">
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
                        <h3 className="text-lg font-[Gilroy-Semibold] text-gray-800 mb-4 flex items-center gap-2">
                          <FaCheckCircle className="text-green-600" />
                          Verification Status
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Mobile Verify */}
                          <div
                            className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${selectedKycData.userDetails.mobileVerify
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
                              <span className="text-sm font-[Gilroy-Medium] text-gray-700">
                                Mobile
                              </span>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-[Gilroy-Semibold] ${selectedKycData.userDetails.mobileVerify
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
                            className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${selectedKycData.userDetails.emailVerify
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
                              <span className="text-sm font-[Gilroy-Medium] text-gray-700">
                                Email
                              </span>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-[Gilroy-Semibold] ${selectedKycData.userDetails.emailVerify
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
                            className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${selectedKycData.userDetails.aadharVerify
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
                              <span className="text-sm font-[Gilroy-Medium] text-gray-700">
                                Aadhar
                              </span>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-[Gilroy-Semibold] ${selectedKycData.userDetails.aadharVerify
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
                            className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${selectedKycData.userDetails.panVerify
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
                              <span className="text-sm font-[Gilroy-Medium] text-gray-700">
                                PAN
                              </span>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-[Gilroy-Semibold] ${selectedKycData.userDetails.panVerify
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
                            className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${selectedKycData.userDetails.shopDetailsVerify
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
                              <span className="text-sm font-[Gilroy-Medium] text-gray-700">
                                Shop Details
                              </span>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-[Gilroy-Semibold] ${selectedKycData.userDetails.shopDetailsVerify
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
                            className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${selectedKycData.userDetails.imageVerify
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
                              <span className="text-sm font-[Gilroy-Medium] text-gray-700">
                                Image
                              </span>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-[Gilroy-Semibold] ${selectedKycData.userDetails.imageVerify
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
                            className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${selectedKycData.userDetails
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
                              <span className="text-sm font-[Gilroy-Medium] text-gray-700">
                                Profile with Shop
                              </span>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-[Gilroy-Semibold] ${selectedKycData.userDetails
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
                            className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${selectedKycData.userDetails.bankDetailsVerify
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
                              <span className="text-sm font-[Gilroy-Medium] text-gray-700">
                                Bank Details
                              </span>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-[Gilroy-Semibold] ${selectedKycData.userDetails.bankDetailsVerify
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
                  setActiveTab("overview");
                  setZoomedImage(null);
                  setSelectedUserId(null);
                }}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-[Gilroy-Medium] shadow-md hover:shadow-lg"
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

export default CreateWhiteLabel;
