import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaCalendarAlt, FaSearch, FaPlus, FaUpload } from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import WhiteLabel from "./WhiteLabel";
import AdminWhitelabelList from "./superAdminDashboard/adminWhitelabelList";
import MasterDistribution from "./superAdminDashboard/masterDistribution";
import MasterDistributionOnboarding from "./superAdminDashboard/masterDistributionOnboarding";
import Distribution from "./superAdminDashboard/distribution";
import DistributionOnboarding from "./superAdminDashboard/DistrubtionOnboarding";
import Retailers from "./superAdminDashboard/Retailers";
import RetailerOnboarding from "./superAdminDashboard/RetailerOnboarding";
import { useList } from "../redux/action/whiteLabelAction";

// Generate data for different navigation items
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
    mainWallet: "3000",
  };

  return Array.from({ length: count }, (_, index) => ({
    ...baseData,
    srNo: String(index + 1).padStart(2, "0"),
  }));
};

// Master Distributor data matching the image
const masterDistributionData = Array.from({ length: 12 }, (_, index) => ({
  srNo: String(index + 1).padStart(2, "0"),
  date: "13-10-25",
  userAgentCode: "SECPY26007",
  userName: "Rudra",
  userRole: "WL",
  mobile: "9350547710",
  email: "Rudraj@Gmail.Com",
  parentName: "GMAXEPAY",
  parentRole: "Enterprise Partner",
  companyName: "GMAXEPAY",
  mainWallet: "3000",
}));

const whiteLabelData = generateTableData("Whitelabel");
const DistributorData = generateTableData("Distributor");
const retailersData = generateTableData("Retailers");

const CreateWhiteLabel = () => {
  const dispatch = useDispatch();
  const { whitelabelList } = useSelector((state) => state.whiteLabel || {});
  
  const [showWhiteLabel, setShowWhiteLabel] = useState(false);
  const [showOnboardingList, setShowOnboardingList] = useState(false);
  const [activeNav, setActiveNav] = useState("Whitelabel");
  const [currentPage, setCurrentPage] = useState(1);

  // Map navigation to userRole numbers
  const getRoleNumber = (nav) => {
    switch (nav) {
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

  // Fetch data from API
  useEffect(() => {
    const query = {
      userRole: getRoleNumber(activeNav),
    };

    // Add kycStatus only when onboarding process is active
    if (showOnboardingList) {
      query.kycStatus = "pending";
    }

    const payload = {
      query: query,
      options: {
        sort: { id: -1 },
        page: currentPage,
        paginate: 10,
      },
      customSearch: {},
    };

    dispatch(useList(payload));
  }, [activeNav, currentPage, showOnboardingList, dispatch]);

  const tableHeaders = [
    "SR NO",
    "Date",
    "User Agent Code",
    "User Name",
    "User Role",
    "Mobile Number",
    "Email Id",
    "Parent Name",
    "Parent Role",
    "Company Name",
    "Main Wallet",
  ];

  // Transform API data to table format for main table
  const transformApiData = (apiData) => {
    // Check different possible response structures
    const data = apiData?.data?.docs || apiData?.docs || apiData?.data || [];
    
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    return data.map((item, index) => ({
      srNo: String((currentPage - 1) * 10 + index + 1).padStart(2, "0"),
      date: item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB').replaceAll('/', '-') : "N/A",
      userAgentCode: item.agentCode || item.userAgentCode || "N/A",
      userName: item.name || item.userName || "N/A",
      userRole: (() => {
        if (item.userRole === 5) return "R";
        if (item.userRole === 4) return "D";
        if (item.userRole === 3) return "MD";
        return "WL";
      })(),
      mobile: item.mobile || item.phone || "N/A",
      email: item.email || "N/A",
      parentName: item.parentName || item.parent?.name || "N/A",
      parentRole: item.parentRole || item.parent?.role || "N/A",
      companyName: item.companyName || item.company?.name || "N/A",
      mainWallet: item.mainWallet || item.wallet || "0",
    }));
  };

  // Transform API data to component table format
  const transformDataForComponents = (apiData) => {
    const data = apiData?.data?.docs || apiData?.docs || apiData?.data || [];
    
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    return data.map((item, index) => ({
      srNo: String((currentPage - 1) * 10 + index + 1).padStart(2, "0"),
      date: item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB').replaceAll('/', '-') : "13-10-25",
      userAgentCode: item.agentCode || item.userAgentCode || "SECPY26007",
      userName: item.name || item.userName || "Rudra",
      userRole: (() => {
        if (item.userRole === 5) return "R";
        if (item.userRole === 4) return "D";
        if (item.userRole === 3) return "MD";
        return "WL";
      })(),
      mobileNumber: item.mobile || item.phone || "9350547710",
      emailId: item.email || "Rudraj@Gmail.Com",
      parentName: item.parentName || item.parent?.name || "GMAXEPAY",
      parentRole: item.parentRole || item.parent?.role || "Enterprise Partner",
      companyName: item.companyName || item.company?.name || "GMAXEPAY",
      mainWallet: item.mainWallet || item.wallet || "3000",
    }));
  };

  // Get API data for components
  const getApiDataForComponents = () => {
    if (whitelabelList?.whitelabelList) {
      return transformDataForComponents(whitelabelList.whitelabelList);
    }
    return null;
  };

  // Get table data based on active navigation
  const getTableData = () => {
    // Use API data if available, otherwise fallback to mock data
    if (whitelabelList?.whitelabelList) {
      return transformApiData(whitelabelList.whitelabelList);
    }
    
    // Fallback to mock data
    switch (activeNav) {
      case "Master Distributor":
        return masterDistributionData;
      case "Distributor":
        return DistributorData;
      case "Retailers":
        return retailersData;
      default:
        return whiteLabelData;
    }
  };

  const currentTableData = getTableData();

  if (showWhiteLabel) {
    return <WhiteLabel onBack={() => setShowWhiteLabel(false)} />;
  }
  return (
    <div className="min-h-screen text-[#1B1717]">
      <div className="p-4 sm:p-6">
        {/* Header Navigation */}
        <div className="w-full p-0 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-sm px-4 py-3 sm:px-6 sm:py-4 flex justify-center w-full">
            <nav className="flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-11 lg:gap-x-[184px] gap-y-3 text-gray-600 font-medium text-xs sm:text-sm lg:text-base">
              <button
                onClick={() => {
                  setActiveNav("Whitelabel");
                  setShowOnboardingList(false);
                }}
                className={`px-3 sm:px-4 py-1.5 rounded-xl font-medium text-sm sm:text-base lg:text-lg ${activeNav === "Whitelabel"
                  ? "bg-[#039155] text-white"
                  : "text-gray-600 hover:text-green-600"
                  }`}
              >
                Whitelabel
              </button>
              <button
                onClick={() => {
                  setActiveNav("Master Distributor");
                  setShowOnboardingList(false);
                }}
                className={`px-3 sm:px-4 py-1.5 rounded-xl font-medium text-sm sm:text-base lg:text-lg ${activeNav === "Master Distributor"
                  ? "bg-[#039155] text-white"
                  : "text-gray-600 hover:text-green-600"
                  }`}
              >
                Master Distributor
              </button>
              <button
                onClick={() => {
                  setActiveNav("Distributor");
                  setShowOnboardingList(false);
                }}
                className={`px-3 sm:px-4 py-1.5 rounded-xl font-medium text-sm sm:text-base lg:text-lg ${activeNav === "Distributor"
                  ? "bg-[#039155] text-white"
                  : "text-gray-600 hover:text-green-600"
                  }`}
              >
                Distributor
              </button>
              <button
                onClick={() => {
                  setActiveNav("Retailers");
                  setShowOnboardingList(false);
                }}
                className={`px-3 sm:px-4 py-1.5 rounded-xl font-medium text-sm sm:text-base lg:text-lg ${activeNav === "Retailers"
                  ? "bg-[#039155] text-white"
                  : "text-gray-600 hover:text-green-600"
                  }`}
              >
                Retailers
              </button>
            </nav>
          </div>
        </div>

        {/* Top Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setShowOnboardingList(false)}
            className={`px-4 py-2 rounded-2xl font-medium shadow-md text-sm sm:text-base ${showOnboardingList
              ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
              : "bg-[#039155] text-white"
              }`}
          >
            All List
          </button>
          <button
            onClick={() => setShowOnboardingList(true)}
            className={`px-4 py-2 rounded-2xl font-medium text-sm sm:text-base ${showOnboardingList
              ? "bg-[#039155] text-white shadow-md"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            Onboarding Process
          </button>
        </div>

        {/* Show Onboarding List or Filters + Search + Create */}
        {(() => {
          const apiData = getApiDataForComponents();
          
          if (showOnboardingList && activeNav === "Master Distributor") {
            return <MasterDistributionOnboarding embedded={true} tableData={apiData} />;
          }
          if (showOnboardingList && activeNav === "Distributor") {
            return <DistributionOnboarding embedded={true} tableData={apiData} />;
          }
          if (showOnboardingList && activeNav === "Retailers") {
            return <RetailerOnboarding embedded={true} tableData={apiData} />;
          }
          if (showOnboardingList) {
            return <AdminWhitelabelList embedded={true} tableData={apiData} />;
          }
          if (activeNav === "Master Distributor") {
            return <MasterDistribution embedded={true} tableData={apiData} />;
          }
          if (activeNav === "Distributor") {
            return <Distribution embedded={true} tableData={apiData} />;
          }
          if (activeNav === "Retailers") {
            return <Retailers embedded={true} tableData={apiData} />;
          }
          return (
            <div className="">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4">
                <h2 className="text-xl sm:text-2xl font-normal text-gray-800">
                  {(() => {
                    if (activeNav === "Whitelabel") return "Whitelabel All Lists";
                    if (activeNav === "Master Distributor") return "Master Distribution";
                    if (activeNav === "Distributor") return "Distributor";
                    return "Retailers";
                  })()}
                </h2>

                <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-end gap-3">
                  <div className="flex flex-col xs:flex-row gap-3">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="From Date"
                        className="pl-3 pr-8 py-3 border border-gray-300 rounded-lg w-full xs:w-32 text-sm focus:ring-green-500 focus:border-green-500 text-center"
                      />
                      <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        placeholder="To Date"
                        className="pl-3 pr-8 py-3 border border-gray-300 rounded-lg w-full xs:w-32 text-sm focus:ring-green-500 focus:border-green-500 text-center"
                      />
                      <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                    </div>
                  </div>

                  <div className="relative w-full sm:w-48">
                    <input
                      type="text"
                      placeholder="Search"
                      className="pl-4 pr-10 py-3 border border-gray-300 rounded-xl w-full text-sm focus:ring-green-500 focus:border-green-500"
                    />
                    <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => setShowWhiteLabel(true)}
                      className="flex items-center justify-center gap-3 bg-[#039155] text-white px-4 py-3 rounded-xl font-medium hover:bg-green-700 shadow-md text-sm sm:text-base"
                    >
                      <span>Create New</span>
                      <div className="w-6 h-6 rounded-full border border-white flex items-center justify-center">
                        <FaPlus className="text-xs" />
                      </div>
                    </button>

                    <button className="flex items-center justify-center bg-white text-gray-700 border border-gray-300 px-4 py-3 rounded-lg font-medium hover:bg-gray-100 text-sm sm:text-base">
                      Export <FaUpload className="ml-2 text-xs" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="mb-4 overflow-x-auto rounded-xl bg-white">
                <table className="min-w-[720px] sm:min-w-full divide-y">
                  <thead className="bg-white">
                    <tr>
                      {tableHeaders.map((header) => (
                        <th
                          key={header}
                          className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y font-normal divide-gray-100">
                    {currentTableData.map((row, index) => (
                      <tr
                        key={index}
                        className={`text-sm ${index % 2 === 0 ? "bg-green-50" : "bg-white"
                          }`}
                      >
                        {Object.values(row).map((value, i) => (
                          <td
                            key={i}
                            className="px-4 py-4  whitespace-nowrap text-[11px]"
                          >
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex justify-center items-center mt-6 space-x-2">
                <button 
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className="p-2 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-100"
                >
                  <IoIosArrowBack />
                </button>
                {[1, 2, 3].map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium ${page === currentPage
                      ? "bg-green-600 text-white"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                      }`}
                  >
                    {page}
                  </button>
                ))}
                <button 
                  onClick={() => setCurrentPage(Math.min(3, currentPage + 1))}
                  className="p-2 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-100"
                >
                  <IoIosArrowForward />
                </button>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default CreateWhiteLabel;
