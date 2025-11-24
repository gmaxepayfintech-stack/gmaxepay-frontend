import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

const AdminWhitelabelList = ({ embedded = false }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedKyc, setSelectedKyc] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Sample data - replace with actual API data
  const tableData = [
    {
      srNo: "01",
      date: "13-10-25",
      userAgentCode: "SECPY26007",
      userName: "Rudra",
      userRole: "WL",
      mobileNumber: "9350547710",
      emailId: "Rudraj@Gmail.Com",
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
      mobileNumber: "9350547710",
      emailId: "Rudraj@Gmail.Com",
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
      mobileNumber: "9350547710",
      emailId: "Rudraj@Gmail.Com",
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
      mobileNumber: "9350547710",
      emailId: "Rudraj@Gmail.Com",
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
      mobileNumber: "9350547710",
      emailId: "Rudraj@Gmail.Com",
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
      mobileNumber: "9350547710",
      emailId: "Rudraj@Gmail.Com",
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
      mobileNumber: "9350547710",
      emailId: "Rudraj@Gmail.Com",
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
      mobileNumber: "9350547710",
      emailId: "Rudraj@Gmail.Com",
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
      mobileNumber: "9350547710",
      emailId: "Rudraj@Gmail.Com",
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
      mobileNumber: "9350547710",
      emailId: "Rudraj@Gmail.Com",
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
      mobileNumber: "9350547710",
      emailId: "Rudraj@Gmail.Com",
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
      mobileNumber: "9350547710",
      emailId: "Rudraj@Gmail.Com",
      parentName: "GMAXEPAY",
      parentRole: "Enterprise Partner",
      companyName: "GMAXEPAY",
      mainWallet: "3000",
    },
  ];

  const totalPages = 3;

  return (
    <div className={`text-[#1B1717] ${embedded ? '' : 'min-h-screen p-2 sm:p-6'}`}>
      {/* Header with Filters */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${embedded ? 'py-4 mb-0' : 'mb-6'}`}>
          <h1 className="text-lg sm:text-2xl lg:text-2xl font-medium text-[#1B1717]">
            Whitelabel Onboarding List
          </h1>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Select KYC Dropdown */}
            <select
              value={selectedKyc}
              onChange={(e) => setSelectedKyc(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] bg-white"
            >
              <option value="">Select KYC</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* From Date */}
            <div className="relative">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] bg-white w-full sm:w-auto"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* To Date */}
            <div className="relative">
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] bg-white w-full sm:w-auto"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className={`overflow-x-auto ${embedded ? 'mb-4 rounded-xl bg-white' : '-mx-4 sm:mx-0'}`}>
          {embedded ? (
            <table className="min-w-[720px] sm:min-w-full divide-y">
              <thead>
                <tr className="border-b bg-gray-100 border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                    SR No
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                    User Agent Code
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                    User Name
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                    User Role
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                    Mobile Number
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                    Email Id
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                    Parent Name
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                    Parent Role
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                    Company Name
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                    Main Wallet
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => (
                  <tr
                    key={index}
                    className={`border-b border-gray-100 ${
                      index % 2 === 0 ? "bg-white" : "bg-green-50"
                    }`}
                  >
                    <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                      {row.srNo}
                    </td>
                    <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                      {row.date}
                    </td>
                    <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                      {row.userAgentCode}
                    </td>
                    <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                      {row.userName}
                    </td>
                    <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                      {row.userRole}
                    </td>
                    <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                      {row.mobileNumber}
                    </td>
                    <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                      {row.emailId}
                    </td>
                    <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                      {row.parentName}
                    </td>
                    <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                      {row.parentRole}
                    </td>
                    <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                      {row.companyName}
                    </td>
                    <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                      {row.mainWallet}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b bg-gray-100 border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                      SR No
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                      User Agent Code
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                      User Name
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                      User Role
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                      Mobile Number
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                      Email Id
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                      Parent Name
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                      Parent Role
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                      Company Name
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717] whitespace-nowrap">
                      Main Wallet
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, index) => (
                    <tr
                      key={index}
                      className={`border-b border-gray-100 ${
                        index % 2 === 0 ? "bg-white" : "bg-green-50"
                      }`}
                    >
                      <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                        {row.srNo}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                        {row.date}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                        {row.userAgentCode}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                        {row.userName}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                        {row.userRole}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                        {row.mobileNumber}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                        {row.emailId}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                        {row.parentName}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                        {row.parentRole}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                        {row.companyName}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                        {row.mainWallet}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg border transition ${
              currentPage === 1
                ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
                : "bg-white border-gray-300 text-[#1B1717] hover:bg-gray-50"
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {[1, 2, 3].map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-10 h-10 rounded-lg font-medium transition ${
                currentPage === page
                  ? "bg-[#039155] text-white"
                  : "bg-white border border-gray-300 text-[#1B1717] hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg border transition ${
              currentPage === totalPages
                ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
                : "bg-white border-gray-300 text-[#1B1717] hover:bg-gray-50"
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
    </div>
  );
};

export default AdminWhitelabelList;
