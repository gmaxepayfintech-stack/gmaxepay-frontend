import React from "react";
import { FaCalendarAlt, FaSearch, FaPlus, FaUpload } from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

const whiteLabelData = [
  // ... (Your whiteLabelData array remains unchanged)
  {
    srNo: "01",
    date: "13-10-25",
    userAgentCode: "SECPY26007",
    userName: "Rudra",
    userRole: "WL",
    mobile: "9350547710",
    email: "Rudra@Gmail.Com",
    parentName: "GMAXEPAY",
    parentRole: "Enterprise Partner",
    companyName: "GMAXEPAY",
    mainWallet: "3000",
  },
  {
    srNo: "01",
    date: "13-10-25",
    userAgentCode: "SECPY26007",
    userName: "Rudra",
    userRole: "WL",
    mobile: "9350547710",
    email: "Rudra@Gmail.Com",
    parentName: "GMAXEPAY",
    parentRole: "Enterprise Partner",
    companyName: "GMAXEPAY",
    mainWallet: "3000",
  },
  {
    srNo: "01",
    date: "13-10-25",
    userAgentCode: "SECPY26007",
    userName: "Rudra",
    userRole: "WL",
    mobile: "9350547710",
    email: "Rudra@Gmail.Com",
    parentName: "GMAXEPAY",
    parentRole: "Enterprise Partner",
    companyName: "GMAXEPAY",
    mainWallet: "3000",
  },
  {
    srNo: "01",
    date: "13-10-25",
    userAgentCode: "SECPY26007",
    userName: "Rudra",
    userRole: "WL",
    mobile: "9350547710",
    email: "Rudra@Gmail.Com",
    parentName: "GMAXEPAY",
    parentRole: "Enterprise Partner",
    companyName: "GMAXEPAY",
    mainWallet: "3000",
  },
  {
    srNo: "01",
    date: "13-10-25",
    userAgentCode: "SECPY26007",
    userName: "Rudra",
    userRole: "WL",
    mobile: "9350547710",
    email: "Rudra@Gmail.Com",
    parentName: "GMAXEPAY",
    parentRole: "Enterprise Partner",
    companyName: "GMAXEPAY",
    mainWallet: "3000",
  },
  {
    srNo: "01",
    date: "13-10-25",
    userAgentCode: "SECPY26007",
    userName: "Rudra",
    userRole: "WL",
    mobile: "9350547710",
    email: "Rudra@Gmail.Com",
    parentName: "GMAXEPAY",
    parentRole: "Enterprise Partner",
    companyName: "GMAXEPAY",
    mainWallet: "3000",
  },
  {
    srNo: "01",
    date: "13-10-25",
    userAgentCode: "SECPY26007",
    userName: "Rudra",
    userRole: "WL",
    mobile: "9350547710",
    email: "Rudra@Gmail.Com",
    parentName: "GMAXEPAY",
    parentRole: "Enterprise Partner",
    companyName: "GMAXEPAY",
    mainWallet: "3000",
  },
  {
    srNo: "01",
    date: "13-10-25",
    userAgentCode: "SECPY26007",
    userName: "Rudra",
    userRole: "WL",
    mobile: "9350547710",
    email: "Rudra@Gmail.Com",
    parentName: "GMAXEPAY",
    parentRole: "Enterprise Partner",
    companyName: "GMAXEPAY",
    mainWallet: "3000",
  },
  {
    srNo: "01",
    date: "13-10-25",
    userAgentCode: "SECPY26007",
    userName: "Rudra",
    userRole: "WL",
    mobile: "9350547710",
    email: "Rudra@Gmail.Com",
    parentName: "GMAXEPAY",
    parentRole: "Enterprise Partner",
    companyName: "GMAXEPAY",
    mainWallet: "3000",
  },
  {
    srNo: "01",
    date: "13-10-25",
    userAgentCode: "SECPY26007",
    userName: "Rudra",
    userRole: "WL",
    mobile: "9350547710",
    email: "Rudra@Gmail.Com",
    parentName: "GMAXEPAY",
    parentRole: "Enterprise Partner",
    companyName: "GMAXEPAY",
    mainWallet: "3000",
  },
];

const CreateWhiteLabel = () => {
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

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Top Header Navigation */}
      <div className="flex justify-between items-center bg-white p-4 shadow-sm border-b border-gray-200">
        <div className="text-xl font-medium text-green-600">Whitelabel</div>
        <nav className="flex space-x-8 text-gray-600 font-medium">
          <a href="#" className="hover:text-green-600">
            Master Distributions
          </a>
          <a href="#" className="hover:text-green-600">
            Distributions
          </a>
          <a href="#" className="hover:text-green-600">
            Retailers
          </a>
        </nav>
      </div>

      <div className="p-6">
        {/* Secondary Navigation (List/Process Tabs) */}
        <div className="flex space-x-2 mb-6">
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium shadow-md">
            All List
          </button>
          <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300">
            Onboarding Process
          </button>
        </div>

        {/* Main Filters and Actions Row Container (Fixed structure here) */}
        <div className="bg-white rounded-xl shadow-lg p-4">
          {/* Title: Left Aligned */}
          <h2 className="text-2xl font-md ">Whitelabel All Lists</h2>

          {/* Filters and Actions: Right Aligned */}
          <div className="flex flex-wrap items-center justify-end gap-4">
            {/* Date Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="From Date"
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-36 focus:ring-green-500 focus:border-green-500"
                  defaultValue="From Date"
                />
                <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="To Date"
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-36 focus:ring-green-500 focus:border-green-500"
                  defaultValue="To Date"
                />
                <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Search Input */}
            <div className="relative w-full max-w-xs sm:max-w-sm">
              <input
                type="text"
                placeholder="Search"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-green-500 focus:border-green-500"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 shadow-md">
                <FaPlus className="mr-2" /> Create New
              </button>
              <button className="flex items-center bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-100">
                Export <FaUpload className="ml-2" />
              </button>
            </div>
          </div>

          {/* Data Table */}
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-green-50">
                <tr>
                  {tableHeaders.map((header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {whiteLabelData.map((row, index) => (
                  <tr key={index} className="hover:bg-green-50">
                    {Object.values(row).map((value, i) => (
                      <td
                        key={i}
                        className="px-6 py-3 whitespace-nowrap text-sm text-gray-900"
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
                className={`w-8 h-8 rounded-lg text-sm font-medium ${
                  page === 1
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
      </div>
    </div>
  );
};

export default CreateWhiteLabel;
