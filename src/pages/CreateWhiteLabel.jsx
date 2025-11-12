import React, { useState } from "react";
import { FaCalendarAlt, FaSearch, FaPlus, FaUpload } from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import WhiteLabel from "./WhiteLabel";

const whiteLabelData = [
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
  const [showWhiteLabel, setShowWhiteLabel] = useState(false);

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

  if (showWhiteLabel) {
    return <WhiteLabel />;
  }

  return (
    <div className="min-h-screen text-[#1B1717]">
      <div className="p-6">
        {/* Header Navigation */}
        <div className="flex justify-between items-center w-full p-0 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-4 flex justify-between items-center w-full mb-8">
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

        {/* Top Buttons */}
        <div className="flex space-x-3 mb-6">
          <button className="bg-green-600 text-white px-4 py-2 rounded-2xl font-medium shadow-md">
            All List
          </button>
          <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-2xl font-medium hover:bg-gray-300">
            Onboarding Process
          </button>
        </div>

        {/* Filters + Search + Create */}
        <div className="">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4">
            <h2 className="text-2xl font-normal text-gray-800">
              Whitelabel All Lists
            </h2>

            <div className="flex flex-wrap items-center justify-end gap-3">
              <div className="flex gap-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="From Date"
                    className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg w-32 text-sm focus:ring-green-500 focus:border-green-500 text-center"
                  />
                  <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="To Date"
                    className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg w-32 text-sm focus:ring-green-500 focus:border-green-500 text-center"
                  />
                  <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                </div>
              </div>

              <div className="relative w-48">
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg w-full text-sm focus:ring-green-500 focus:border-green-500"
                />
                <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowWhiteLabel(true)}
                  className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 shadow-md"
                >
                  <FaPlus className="mr-2 text-xs" /> Create New
                </button>

                <button className="flex items-center bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-100">
                  Export <FaUpload className="ml-2 text-xs" />
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="mt-4 overflow-y-auto rounded-xl bg-white">
            <table className="min-w-full divide-y">
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
                {whiteLabelData.map((row, index) => (
                  <tr
                    key={index}
                    className={`text-sm ${
                      index % 2 === 0 ? "bg-green-50" : "bg-white"
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
