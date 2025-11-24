import React from "react";
import { FaCalendarAlt, FaSearch, FaUpload } from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

const Distribution = ({ embedded = false }) => {
  // Sample data matching the image
  const tableData = [
    {
      srNo: "01",
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
    },
    {
      srNo: "02",
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
    },
    {
      srNo: "03",
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
    },
    {
      srNo: "04",
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
    },
    {
      srNo: "05",
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
    },
    {
      srNo: "06",
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
    },
    {
      srNo: "07",
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
    },
    {
      srNo: "08",
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
    },
    {
      srNo: "09",
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
    },
    {
      srNo: "10",
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
    },
    {
      srNo: "11",
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
    },
    {
      srNo: "12",
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
    },
  ];

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
    <div className={`text-[#1B1717] ${embedded ? '' : 'min-h-screen p-4 sm:p-6'}`}>
      {embedded ? (
        <>
          {/* Header Section */}
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${embedded ? 'py-4 mb-0' : 'mb-6'}`}>
            <h1 className="text-lg sm:text-2xl lg:text-2xl font-medium text-[#1B1717]">
              Distribution
            </h1>

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

            <button className="flex items-center justify-center gap-2 bg-[#039155] text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 shadow-md text-sm sm:text-base">
              Export <FaUpload className="text-xs" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className={embedded ? "mb-4 rounded-xl bg-white" : "mb-4 overflow-x-auto rounded-xl bg-white"}>
          <table className={embedded ? "min-w-[720px] sm:min-w-full divide-y" : "min-w-[720px] sm:min-w-full divide-y"}>
            <thead className="bg-white">
              <tr>
                <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                  SR NO
                </th>
                <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                  Date
                </th>   
                <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                  User Agent Code
                </th>
                <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                  User Name
                </th>
                <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                  User Role
                </th>
                <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                  Mobile Number
                </th>
                <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                  Email Id
                </th>
                <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                  Parent Name
                </th>
                <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                  Parent Role
                </th>
                <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                  Company Name
                </th>
                <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                  Main Wallet
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y font-normal divide-gray-100">
              {tableData.map((row, index) => (
                <tr
                  key={index}
                  className={`text-sm ${index % 2 === 0 ? "bg-green-50" : "bg-white"
                    }`}
                >
                  <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                    {row.srNo}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                    {row.date}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                    {row.userAgentCode}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                    {row.userName}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                    {row.userRole}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                    {row.mobile}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                    {row.email}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                    {row.parentName}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                    {row.parentRole}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                    {row.companyName}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                    {row.mainWallet}
                  </td>
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
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-normal text-gray-800">
              Master Distribution
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

              <button className="flex items-center justify-center gap-2 bg-[#039155] text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 shadow-md text-sm sm:text-base">
                Export <FaUpload className="text-xs" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="mb-4 overflow-x-auto rounded-xl bg-white">
            <table className="min-w-[720px] sm:min-w-full divide-y">
              <thead className="bg-white">
                <tr>
                  <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    SR NO
                  </th>
                  <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Date
                  </th>
                  <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    User Agent Code
                  </th>
                  <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    User Name
                  </th>
                  <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    User Role
                  </th>
                  <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Mobile Number
                  </th>
                  <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Email Id
                  </th>
                  <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Parent Name
                  </th>
                  <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Parent Role
                  </th>
                  <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Company Name
                  </th>
                  <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                    Main Wallet
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y font-normal divide-gray-100">
                {tableData.map((row, index) => (
                  <tr
                    key={index}
                    className={`text-sm ${index % 2 === 0 ? "bg-green-50" : "bg-white"
                      }`}
                  >
                    <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                      {row.srNo}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                      {row.date}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                      {row.userAgentCode}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                      {row.userName}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                      {row.userRole}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                      {row.mobile}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                      {row.email}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                      {row.parentName}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                      {row.parentRole}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                      {row.companyName}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                      {row.mainWallet}
                    </td>
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
  );
};

export default Distribution;

