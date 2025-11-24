import React, { useState } from "react";
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

// Generate data for different navigation items
const generateTableData = (type, count = 12) => {
  const baseData = {
    srNo: "01",
    date: "13-10-25",
    userAgentCode: "SECPY26007",
    userName: "Rudra",
    userRole: type === "Distributor" ? "D" : type === "Retailers" ? "R" : "WL",
    mobile: "9350547710",
    email: "Rudra@Gmail.Com",
    parentName: "GMAXEPAY",
    parentRole: type === "Distributor" ? "Distributor" : type === "Retailers" ? "Retailer" : "Enterprise Partner",
    companyName: "GMAXEPAY",
    mainWallet: "3000",
  };

  return Array.from({ length: count }, (_, index) => ({
    ...baseData,
    srNo: String(index + 1).padStart(2, "0"),
  }));
};

// Master Distributions data matching the image
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
const distributionsData = generateTableData("Distributor");
const retailersData = generateTableData("Retailers");

const CreateWhiteLabel = () => {
  const [showWhiteLabel, setShowWhiteLabel] = useState(false);
  const [showOnboardingList, setShowOnboardingList] = useState(false);
  const [activeNav, setActiveNav] = useState("Whitelabel");

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

  // Get table data based on active navigation
  const getTableData = () => {
    switch (activeNav) {
      case "Master Distributions":
        return masterDistributionData;
      case "Distributor":
        return distributionsData;
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
                  setActiveNav("Master Distributions");
                  setShowOnboardingList(false);
                }}
                className={`px-3 sm:px-4 py-1.5 rounded-xl font-medium text-sm sm:text-base lg:text-lg ${activeNav === "Master Distributions"
                  ? "bg-[#039155] text-white"
                  : "text-gray-600 hover:text-green-600"
                  }`}
              >
                Master Distributions
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
        {showOnboardingList && activeNav === "Master Distributions" ? (
          <MasterDistributionOnboarding embedded={true} />
        ) : showOnboardingList && activeNav === "Distributor" ? (
          <DistributionOnboarding embedded={true} />
        ) : showOnboardingList && activeNav === "Retailers" ? (
          <RetailerOnboarding embedded={true} />
        ) : showOnboardingList ? (
          <AdminWhitelabelList embedded={true} />
        ) : activeNav === "Master Distributions" ? (
          <MasterDistribution embedded={true} />
        ) : activeNav === "Distributor" ? (
          <Distribution embedded={true} />
        ) : activeNav === "Retailers" ? (
          <Retailers embedded={true} />
        ) : (
          <div className="">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4">
              <h2 className="text-xl sm:text-2xl font-normal text-gray-800">
                 {activeNav === "Whitelabel"
                   ? "Whitelabel All Lists"
                   : activeNav === "Master Distributions"
                     ? "Master Distribution"
                     : activeNav === "Distributor"
                       ? "Distributor"
                       : "Retailers"}
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
              <button className="p-2 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-100">
                <IoIosArrowBack />
              </button>
              {[1, 2, 3].map((page) => (
                <button
                  key={page}
                  className={`w-8 h-8 rounded-lg text-sm font-medium ${page === 1
                    ? "bg-green-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                    }`}
                >
                  {page}
                </button>
              ))}
              <button className="p-2 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-100">
                <IoIosArrowForward />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateWhiteLabel;
