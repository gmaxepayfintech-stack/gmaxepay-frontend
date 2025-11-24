import React, { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const DistrubtionOnboarding = ({ embedded = false }) => {
  const [selectedKyc, setSelectedKyc] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Sample data matching the image
  const tableData = Array.from({ length: 12 }, (_, index) => ({
    srNo: String(index + 1).padStart(2, "0"),
    date: "13-10-25",
    userAgentCode: "SECPY26007",
    userName: "Rudra",
    userRole: "WL",
    mobile: "9580547710",
    email: "RudrosGmail.Com",
    parentName: "GMAXERRY",
    parentRole: "Enterprise Partner",
    companyName: "GMAXPAY",
    mainWallet: "3000",
  }));


  return (
    <div className={`text-[#1B1717] ${embedded ? '' : 'min-h-screen p-4 sm:p-6'}`}>
      {embedded ? (
        <>
          {/* Header Section */}
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${embedded ? 'py-4 mb-0' : 'mb-6'}`}>
            <h1 className="text-lg sm:text-2xl lg:text-2xl font-medium text-[#1B1717]">
              Distribution
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
        <div className="overflow-x-auto -mx-4 sm:mx-0">
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
                      {row.mobile}
                    </td>
                    <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                      {row.email}
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
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <button className="p-2 rounded-lg border border-gray-300 bg-white text-[#1B1717] hover:bg-gray-50 transition">
            <ChevronLeft className="w-5 h-5" />
          </button>
          {[1, 2, 3].map((page) => (
            <button
              key={page}
              className={`w-10 h-10 rounded-lg font-medium transition ${
                page === 1
                  ? "bg-[#039155] text-white"
                  : "bg-white border border-gray-300 text-[#1B1717] hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}
          <button className="p-2 rounded-lg border border-gray-300 bg-white text-[#1B1717] hover:bg-gray-50 transition">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-lg sm:text-2xl lg:text-2xl font-medium text-[#1B1717]">
              Master Distribution
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
          <div className="overflow-x-auto -mx-4 sm:mx-0">
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
                        {row.mobile}
                      </td>
                      <td className="py-3 px-4 text-sm text-[#1B1717] whitespace-nowrap">
                        {row.email}
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
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <button className="p-2 rounded-lg border border-gray-300 bg-white text-[#1B1717] hover:bg-gray-50 transition">
              <ChevronLeft className="w-5 h-5" />
            </button>
            {[1, 2, 3].map((page) => (
              <button
                key={page}
                className={`w-10 h-10 rounded-lg font-medium transition ${
                  page === 1
                    ? "bg-[#039155] text-white"
                    : "bg-white border border-gray-300 text-[#1B1717] hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
            <button className="p-2 rounded-lg border border-gray-300 bg-white text-[#1B1717] hover:bg-gray-50 transition">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DistrubtionOnboarding;




