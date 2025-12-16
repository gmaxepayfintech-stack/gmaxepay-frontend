import React, { useState } from 'react';
import { Search } from 'lucide-react';

const RoleUpgradeWhiteLabel = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('Approved');

    const statusFilters = ['Approved', 'Pending', 'Rejected'];

    // Sample data - 12 rows with the same data as shown in the image
    const tableData = Array.from({ length: 12 }, (_, index) => ({
        srNo: String(index + 1).padStart(2, '0'),
        date: '13-10-25',
        parentName: 'MAMATHA CHANNAPPA',
        userName: 'VENKATESHA',
        mobileNumber: '9535844571',
        emailId: 'Salesgmaxepay@Gmail.Com',
        currentRole: 'Retailer',
        upgradeRole: 'Distributor'
    }));

    return (
        <div className="min-h-screen bg-[#FAFAFA] p-4 sm:p-6 text-[#1B1717]">
            {/* Header Section */}
            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-medium text-[#1B1717] mb-4">
                    Role Upgradation List
                </h1>

                {/* Search and Filter Section */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    {/* Search Bar */}
                    <div className="relative w-full sm:w-[540px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search By Name, Mobile Number,"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-4 sm:py-4 border border-gray-300 rounded-lg "
                        />
                    </div>

                    {/* Status Filter Buttons */}
                    <div className="flex flex-wrap justify-end items-center bg-[#FAFAFA] rounded-xl p-2 border border-[#1B1717] border-opacity-50 gap-4 ml-auto">
                        {statusFilters.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-4 py-2 sm:py-3 rounded-xl text-sm sm:text-base font-medium transition ${activeFilter === filter
                                    ? 'bg-[#039155] text-white shadow-md'
                                    : '  text-[#1B1717] hover:bg-gray-50'
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="mb-4 overflow-x-auto rounded-xl bg-white">
                <table className="min-w-[720px] sm:min-w-full divide-y">
                    <thead className="bg-white  divide-y-[#1B1717] border-opacity-50">
                        <tr>
                            <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                                SR No
                            </th>
                            <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                                Date
                            </th>
                            <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                                Parent Name
                            </th>
                            <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                                User Name
                            </th>
                            <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                                Mobile Number
                            </th>
                            <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                                Email Id
                            </th>
                            <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                                Current Role
                            </th>
                            <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                                Upgrade Role
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y font-normal ">
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
                                    {row.parentName}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                                    {row.userName}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                                    {row.mobileNumber}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                                    {row.emailId}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                                    {row.currentRole}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                                    {row.upgradeRole}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RoleUpgradeWhiteLabel;


