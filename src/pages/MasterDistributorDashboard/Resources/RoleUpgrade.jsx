import React, { useState } from "react";
import { Search } from "lucide-react";

const RoleUpgrade = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Approved");

  const statusFilters = ["Approved", "Pending", "Rejected"];

  // Sample data - 12 rows with the same data as shown in the image
  const tableData = Array.from({ length: 12 }, (_, index) => ({
    srNo: String(index + 1).padStart(2, "0"),
    date: "13-10-25",
    parentName: "MAMATHA CHANNAPPA",
    userName: "VENKATESHA",
    mobileNumber: "9535844571",
    emailId: "Salesgmaxepay@Gmail.Com",
    currentRole: "Retailer",
    upgradeRole: "Distributor",
  }));

  const filteredData = tableData.filter((row) => {
    const query = searchQuery.toLowerCase().trim();

    if (!query) return true;

    return (
      row.parentName.toLowerCase().includes(query) ||
      row.userName.toLowerCase().includes(query) ||
      row.mobileNumber.includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-3 sm:p-4 md:p-6 text-[#1B1717]">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-lg sm:text-2xl font-[Gilroy-Medium] text-[#1B1717] mb-3 sm:mb-4">
          Role Upgradation List
        </h1>

        {/* Search and Filter Section */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          {/* Search Bar */}
          <div className="relative w-full sm:w-[540px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#1B1717]/50" />
            <input
              type="text"
              placeholder="Search By Name, Mobile Number,"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-3 sm:py-4 border border-[#1B1717]/50 font-[Gilroy-Medium] text-[#1B1717]/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155]"
            />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="mb-4 overflow-x-auto rounded-xl bg-white">
        <table className="min-w-[900px] w-full divide-y">
          <thead className="bg-white border-b border-[#1B1717]/30">
            <tr>
              <th className="px-3 py-3 text-left font-[Gilroy-Medium] text-xs sm:text-sm text-[#1B1717] whitespace-nowrap">
                SR No
              </th>
              <th className="px-3 py-3 text-left font-[Gilroy-Medium] text-xs sm:text-sm text-[#1B1717] whitespace-nowrap">
                Date
              </th>
              <th className="px-3 py-3 text-left font-[Gilroy-Medium] text-xs sm:text-sm text-[#1B1717] whitespace-nowrap">
                Parent Name
              </th>
              <th className="px-3 py-3 text-left font-[Gilroy-Medium] text-xs sm:text-sm text-[#1B1717] whitespace-nowrap">
                User Name
              </th>
              <th className="px-3 py-3 text-left font-[Gilroy-Medium] text-xs sm:text-sm text-[#1B1717] whitespace-nowrap">
                Mobile Number
              </th>
              <th className="px-3 py-3 text-left font-[Gilroy-Medium] text-xs sm:text-sm text-[#1B1717] whitespace-nowrap">
                Email Id
              </th>
              <th className="px-3 py-3 text-left font-[Gilroy-Medium] text-xs sm:text-sm text-[#1B1717] whitespace-nowrap">
                Current Role
              </th>
              <th className="px-3 py-3 text-left font-[Gilroy-Medium] text-xs sm:text-sm text-[#1B1717] whitespace-nowrap">
                Upgrade Role
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y">
            {filteredData.length > 0 ? (
              filteredData.map((row, index) => (
                <tr
                  key={index}
                  className={`${index % 2 === 0 ? "bg-[#039155]/5" : "bg-white"
                    } border-y border-[#1B1717]/30`}
                >
                  <td className="px-3 py-3 whitespace-nowrap font-[Gilroy-Regular] text-[#121216] text-xs">
                    {row.srNo}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap font-[Gilroy-Regular] text-[#121216] text-xs">
                    {row.date}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap font-[Gilroy-Regular] text-[#121216] text-xs">
                    {row.parentName}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap font-[Gilroy-Regular] text-[#121216] text-xs">
                    {row.userName}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap font-[Gilroy-Regular] text-[#121216] text-xs">
                    {row.mobileNumber}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap font-[Gilroy-Regular] text-[#121216] text-xs">
                    {row.emailId}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap font-[Gilroy-Regular] text-[#121216] text-xs">
                    {row.currentRole}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap font-[Gilroy-Regular] text-[#121216] text-xs">
                    {row.upgradeRole}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center py-6 text-gray-500">
                  No results found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoleUpgrade;
