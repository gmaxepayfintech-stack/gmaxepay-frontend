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
    <div className="bg-white min-w-screen text-[#1B1717]">
      <div className="p-6">
        <div className="flex justify-between items-center w-full p-0 mb-8">
          {/* Whitelabel Button/Logo */}
          {/* Top Header/Navigation Bar */}
          <div className="bg-white rounded-xl shadow-sm p-4 flex justify-between items-center w-full mb-8">
            {/* Main Navigation Links */}
            <nav className="flex gap-52 text-gray-600 font-medium text-base">
              <a
                href="#"
                className="bg-green-600 text-white px-4 py-1.5 rounded-xl font-medium text-lg"
              >
                Whitelabel
              </a>
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
        </div>

        {/* --- */}

        {/* Secondary Navigation (List/Process Tabs) */}
        <div className="flex space-x-3 mb-6">
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium shadow-md">
            All List
          </button>
          <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300">
            Onboarding Process
          </button>
        </div>

        {/* --- */}

        {/* Main Content Card/Container */}
        <div className="bg-white rounded-xl">
          {/* Title, Filters and Actions Row - Combined */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4">
            {/* Title: Left Aligned */}
            <h2 className="text-2xl font-normal text-gray-800">
              Whitelabel All Lists
            </h2>

            {/* Filters and Actions: Right Aligned - Use flex-wrap-reverse to keep action buttons right-aligned on smaller screens */}
            <div className="flex flex-wrap items-center justify-end gap-3">
              {/* Date Filters - Use a common style for input/button containers */}
              <div className="flex gap-3">
                {/* From Date */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="From Date"
                    // Matched the border and background style from the image for the input container
                    className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg w-32 text-sm focus:ring-green-500 focus:border-green-500 text-center"
                    defaultValue="From Date"
                  />
                  {/* Calendar icon position adjusted to be on the right */}
                  <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                </div>

                {/* To Date */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="To Date"
                    // Matched the border and background style from the image for the input container
                    className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg w-32 text-sm focus:ring-green-500 focus:border-green-500 text-center"
                    defaultValue="To Date"
                  />
                  {/* Calendar icon position adjusted to be on the right */}
                  <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                </div>
              </div>

              {/* Search Input - Using a fixed width similar to the image */}
              <div className="relative w-48">
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg w-full text-sm focus:ring-green-500 focus:border-green-500"
                />
                {/* Search icon positioned on the right of the search input */}
                <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {/* Create New Button: Green background, rounded, with icon */}
                <button className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 shadow-md">
                  <FaPlus className="mr-2 text-xs" /> Create New
                </button>
                {/* Export Button: White background, border, icon on the right */}
                <button className="flex items-center bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-100">
                  Export <FaUpload className="ml-2 text-xs" />
                </button>
              </div>
            </div>
          </div>

          {/* --- */}

          {/* Data Table Container */}
          <div className="mt-4 overflow-x-auto rounded-xl">
            <table className="min-w-full divide-y divide-gray-200">
              {/* Table Header Styling */}
              <thead className="bg-white">
                <tr>
                  {tableHeaders.map((header) => (
                    <th
                      key={header}
                      // Reduced padding and font size for a more compact, table-like appearance
                      className="px-4 py-2 text-left  font-medium text-lg text-[#1B1717] uppercase tracking-wider whitespace-nowrap"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Table Body Styling */}
              <tbody className="bg-white divide-y divide-gray-100">
                {whiteLabelData.map((row, index) => (
                  // Conditional background for alternating rows (to mimic the green stripe look)
                  <tr
                    key={index}
                    className={`text-sm ${
                      index % 2 === 0 ? "bg-green-50" : "bg-white"
                    }`}
                  >
                    {Object.values(row).map((value, i) => (
                      <td
                        key={i}
                        // Reduced padding and font size for data cells
                        className="px-4 py-2 whitespace-nowrap text-[15px]"
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* --- */}

          {/* Pagination */}
          <div className="flex justify-center items-center mt-6 space-x-2">
            {/* Previous Button */}
            <button className="p-2 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-100">
              <IoIosArrowBack />
            </button>
            {/* Page Buttons */}
            {[1, 2, 3].map((page) => (
              <button
                key={page}
                className={`w-8 h-8 rounded-lg text-sm font-medium ${
                  page === 1
                    ? "bg-green-600 text-white" // Active page style
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100" // Inactive page style
                }`}
              >
                {page}
              </button>
            ))}
            {/* Next Button */}
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
