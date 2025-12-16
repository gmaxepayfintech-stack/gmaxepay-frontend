import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search } from 'lucide-react';
import { roleDataCompanyUser } from '../../redux/action/roleAction';

const RoleUpgradeWhiteLabel = () => {
    const dispatch = useDispatch();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('Approved');
    
    // Form state for API query
    const [userRole, setUserRole] = useState(4);
    const [kycStatus, setKycStatus] = useState('completed');
    const [name, setName] = useState('');
    const [page, setPage] = useState(1);
    const [paginate, setPaginate] = useState(10);
    const [sortOrder, setSortOrder] = useState(-1);

    const statusFilters = ['Approved', 'Pending', 'Rejected'];

    // Get data from Redux
    const roleDataResponse = useSelector((state) => state?.role?.roleDataComp);
    
    const roleDataList = roleDataResponse?.roleDataComp || [];
    const isLoading = useSelector((state) => state?.role?.isLoading);

    // Log Redux response whenever it changes
    useEffect(() => {
        console.log('=== Role Data Response from Redux ===');
        console.log('Full roleDataResponse:', roleDataResponse);
        console.log('roleDataList:', roleDataList);
        console.log('roleDataList length:', roleDataList?.length);
        console.log('isLoading:', isLoading);
        if (roleDataList && roleDataList.length > 0) {
            console.log('First item in roleDataList:', roleDataList[0]);
        }
    }, [roleDataResponse, roleDataList, isLoading]);

    // Fetch data when form values change
    useEffect(() => {
        const payload = {
            query: {
                userRole: Number(userRole),
                kycStatus: kycStatus
            },
            options: {
                sort: { id: Number(sortOrder) },
                page: Number(page),
                paginate: Number(paginate)
            },
            customSearch: name.trim() ? { name: name.trim() } : {}
        };
        
        console.log('=== Sending API Request ===');
        console.log('Payload being sent:', JSON.stringify(payload, null, 2));
        console.log('Form values:', { userRole, kycStatus, name, page, paginate, sortOrder });
        
        dispatch(roleDataCompanyUser(payload));
    }, [userRole, kycStatus, name, page, paginate, sortOrder, dispatch]);

    // Format table data from API response
    const formatTableData = () => {
        console.log('=== Formatting Table Data ===');
        console.log('roleDataList type:', Array.isArray(roleDataList) ? 'Array' : typeof roleDataList);
        console.log('roleDataList length:', roleDataList?.length);
        
        if (!Array.isArray(roleDataList) || roleDataList.length === 0) {
            console.log('No data to format - returning empty array');
            return [];
        }
        
        const formatted = roleDataList.map((item, index) => {
            const formattedItem = {
                id: item.id || item._id || `row-${index}`,
                srNo: String((page - 1) * paginate + index + 1).padStart(2, '0'),
                date: item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB') : '-',
                parentName: item.parentName || item.parent?.name || '-',
                userName: item.name || item.userName || '-',
                mobileNumber: item.mobileNo || item.mobileNumber || '-',
                emailId: item.email || item.emailId || '-',
                currentRole: item.currentRole || item.role || '-',
                upgradeRole: item.upgradeRole || item.requestedRole || '-'
            };
            
            if (index === 0) {
                console.log('Sample raw item:', item);
                console.log('Sample formatted item:', formattedItem);
            }
            
            return formattedItem;
        });
        
        console.log('Total formatted items:', formatted.length);
        return formatted;
    };

    const tableData = formatTableData();
    
    // Log table data whenever it changes
    useEffect(() => {
        console.log('=== Table Data ===');
        console.log('tableData length:', tableData.length);
        if (tableData.length > 0) {
            console.log('First table row:', tableData[0]);
        }
    }, [tableData]);

    const handleSearch = (e) => {
        e.preventDefault();
        setName(searchQuery);
        setPage(1); // Reset to first page on new search
    };

    const renderTableContent = () => {
        if (isLoading) {
            return (
                <div className="p-8 text-center">
                    <p className="text-gray-500">Loading...</p>
                </div>
            );
        }

        if (tableData.length === 0) {
            return (
                <div className="p-8 text-center">
                    <p className="text-gray-500">No data available</p>
                </div>
            );
        }

        return (
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
                            key={row.id}
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
        );
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] p-4 sm:p-6 text-[#1B1717]">
            {/* Header Section */}
            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-medium text-[#1B1717] mb-4">
                    Role Upgradation List
                </h1>

                {/* Filter Form Section */}
                <div className="mb-6 bg-white p-4 rounded-xl border border-gray-200">
                    <h2 className="text-lg font-medium mb-4">Filter Options</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                            <label htmlFor="userRole" className="block text-sm font-medium mb-2">User Role</label>
                            <input
                                id="userRole"
                                type="number"
                                value={userRole}
                                onChange={(e) => setUserRole(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                placeholder="User Role"
                            />
                        </div>
                        <div>
                            <label htmlFor="kycStatus" className="block text-sm font-medium mb-2">KYC Status</label>
                            <select
                                id="kycStatus"
                                value={kycStatus}
                                onChange={(e) => setKycStatus(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            >
                                <option value="completed">Completed</option>
                                <option value="pending">Pending</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="page" className="block text-sm font-medium mb-2">Page</label>
                            <input
                                id="page"
                                type="number"
                                value={page}
                                onChange={(e) => setPage(e.target.value)}
                                min="1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label htmlFor="paginate" className="block text-sm font-medium mb-2">Items Per Page</label>
                            <input
                                id="paginate"
                                type="number"
                                value={paginate}
                                onChange={(e) => setPaginate(e.target.value)}
                                min="1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label htmlFor="sortOrder" className="block text-sm font-medium mb-2">Sort Order (id)</label>
                            <select
                                id="sortOrder"
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            >
                                <option value="-1">Descending (-1)</option>
                                <option value="1">Ascending (1)</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="nameSearch" className="block text-sm font-medium mb-2">Search By Name</label>
                            <input
                                id="nameSearch"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                placeholder="Enter name to search"
                            />
                        </div>
                    </div>
                </div>

                {/* Search and Filter Section */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="relative w-full sm:w-[540px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search By Name, Mobile Number,"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-4 sm:py-4 border border-gray-300 rounded-lg "
                        />
                    </form>

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
                {renderTableContent()}
            </div>
        </div>
    );
};

export default RoleUpgradeWhiteLabel;


