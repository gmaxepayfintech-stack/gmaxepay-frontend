import React, { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import {
  Search,
  Plus,
  Upload,
  ChevronLeft,
  ChevronRight,
  User,
  X,
  ZoomIn
} from "lucide-react";
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
  employeeUseList,
  employeeKycData,
  employeeKycStatusData,
  employeeKycStatusCheck,
  employeeKycUnlock,
  employeeKycRevert,
  employeeRescendOnboarding,
  employeeDeActiveOnboarding,
} from "../../../redux/action/whiteLabelAction";
import { getSlabList } from "../../../redux/action/slabAction";
import { ButtonLoader } from "../../../widgets/layout/loader";
import { motion } from "framer-motion";
import {
  employeeGetAdminProfileDetails,
  setSelectedUserRole,
} from "../../../redux/action/userProfileAction";
import KycModal from "./KycModal";

import { useLocation, useSearchParams } from "react-router-dom";

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
  const [isTableLoading, setIsTableLoading] = useState(true); // Start with true to show loader on initial load

  // Track previous response to detect when data actually arrives
  // Set toDate to today's date in YYYY-MM-DD format
  const [toDate, setToDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [kycDataRefreshKey, setKycDataRefreshKey] = useState(0);
  const prevResponseRef = useRef(undefined);
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
    dispatch(employeeUseList(payload));
  }, [
    activeNav,
    currentPage,
    showOnboardingList,
    debouncedSearchTerm,
    fromDate,
    toDate,
    dispatch,
  ]);

  // Refresh table when kycStatusCheck succeeds - MOCKED for demo
  useEffect(() => {
    if (kycStatusCheckResponse?.status === "SUCCESS") {
      // Refresh table data by dispatching employeeUseList again
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
      dispatch(employeeUseList(payload));
    }
  }, [
    kycStatusCheckResponse,
    activeNav,
    currentPage,
    showOnboardingList,
    debouncedSearchTerm,
    dispatch,
  ]);

  // Refresh table when kycUnlock succeeds - MOCKED for demo
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
      dispatch(employeeUseList(payload));
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

  // KYC status refresh key logic handled via kycDataRefreshKey

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
        aeps1Wallet: getAeps1Wallet(),
        aeps2Wallet: getAeps2Wallet(),
        remainingDays: calculateRemainingDays(),
        kycDetails: item.kycDetails || null,
        approved: item.approved === undefined ? true : item.approved,
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
    if (responseForTable && Array.isArray(responseForTable) && responseForTable.length > 0) {
      transformedData = transformApiData(responseForTable);
    } else if (
      responseForTable.data &&
      Array.isArray(responseForTable.data) &&
      responseForTable.data.length > 0
    ) {
      transformedData = transformApiData(responseForTable.data);
    }

    // No data fallback (empty list)
    if (transformedData.length === 0) {
      return EMPTY_ARRAY;
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
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setShowOnboardingList(false)}
            className={`px-4 py-2 rounded-2xl font-[Gilroy-Medium] shadow-md text-sm sm:text-base ${
              showOnboardingList
                ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                : "bg-[#039155] text-white"
            }`}
          >
            All List
          </button>
          <button
            onClick={() => setShowOnboardingList(true)}
            className={`px-4 py-2 rounded-2xl font-[Gilroy-Medium] text-sm sm:text-base ${
              showOnboardingList
                ? "bg-[#039155] text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Onboarding Process
          </button>
        </div>

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
            return <AdminWhitelabelList embedded={true} tableData={apiData} />;
          }

          // All List Views - Always pass API data, even if empty
          if (activeNav === "Master Distributor") {
            return (
              <MasterDistribution
                embedded={true}
                tableData={apiData}
                isLoading={isTableLoading}
              />
            );
          }
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
                <h2 className="text-xl sm:text-2xl font-[gilroy-[gilroy-medium]] text-gray-800">
                  {(() => {
                    if (activeNav === "Whitelabel")
                      return "Whitelabel All Lists";
                    if (activeNav === "Master Distributor")
                      return "Master Distribution";
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
                        className="pl-3 pr-3 py-3 border border-gray-300 rounded-lg w-full xs:w-32 text-sm focus:ring-[#039155] focus:border-[#039155] text-center cursor-pointer"
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
                        className="pl-3 pr-3 py-3 border border-gray-300 rounded-lg w-full xs:w-32 text-sm focus:ring-[#039155] focus:border-[#039155] text-center cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="relative w-full sm:w-48">
                    <input
                      type="text"
                      placeholder="Search"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                      }}
                      className="pl-4 pr-10 py-3 border border-gray-300 rounded-xl w-full text-sm focus:ring-[#039155] focus:border-[#039155]"
                    />
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => setShowWhiteLabel(true)}
                      className="flex items-center justify-center gap-3 bg-[#039155] text-white px-4 py-3 rounded-xl font-[Gilroy-Medium] hover:bg-green-700 shadow-md text-sm sm:text-base"
                    >
                      <span>Create New</span>
                      <div className="w-6 h-6 rounded-full border border-white flex items-center justify-center">
                        <Plus className="w-4 h-4" />
                      </div>
                    </button>

                    <button
                      onClick={handleExportToExcel}
                      className="flex items-center justify-center bg-white text-gray-700 border border-gray-300 px-4 py-3 rounded-lg font-[Gilroy-Medium] hover:bg-gray-100 text-sm sm:text-base"
                    >
                      Export <Upload className="ml-2 w-4 h-4" />
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
                                  dispatch(employeeKycData(userId));
                                }
                              }}
                              className="px-3 py-1 border border-[#039155] text-[#039155] rounded-lg hover:bg-green-50 text-xs font-[Gilroy-Medium] transition-colors"
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

                                      /*
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
                                      */
                                      alert(`Account status updated for ${row.name || "user"}`);
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
                                      dispatch(employeeKycUnlock(userId));
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
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-lg text-sm font-[Gilroy-Medium] transition ${page === currentPage
                          ? "bg-[#039155] text-white"
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
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })()}
      </div>      {/* KYC Details Modal */}
      <KycModal
        isOpen={!!selectedUserId}
        onClose={() => {
          setSelectedUserId(null);
          setKycDataRefreshKey((prev) => prev + 1);
        }}
        userId={selectedUserId}
        kycData={kycRetrieved}
        refreshKey={kycDataRefreshKey}
        onRevertSuccess={() => {
          setKycDataRefreshKey((prev) => prev + 1);
          dispatch(employeeKycData(selectedUserId));
          // Refresh table data
          const userRole = getRoleNumber(activeNav);
          const payload = {
            query: { userRole, ...(showOnboardingList && { kycStatus: "pending" }) },
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

export default CreateWhiteLabel;
