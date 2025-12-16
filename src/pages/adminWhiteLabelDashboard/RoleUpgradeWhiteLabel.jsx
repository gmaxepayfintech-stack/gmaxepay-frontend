import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search } from 'lucide-react';
import { roleDataCompanyUser } from '../../redux/action/roleAction';

const RoleUpgradeWhiteLabel = () => {
    const dispatch = useDispatch();
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('Approved');

    const statusFilters = ['Approved', 'Pending', 'Rejected'];

    // Map status filter to kycStatus
    const getKycStatusFromFilter = (filter) => {
        const statusMap = {
            'Approved': 'completed',
            'Pending': 'pending',
            'Rejected': 'rejected'
        };
        return statusMap[filter] || 'completed';
    };

    // Get data from Redux
    const roleDataResponse = useSelector((state) => state?.role?.roleDataComp);
    const roleDataComp = roleDataResponse?.roleDataComp || [];
    const isLoading = useSelector((state) => state?.role?.isLoading);

    // Extract and flatten users from all companies
    const roleDataList = useMemo(() => {
        console.log('=== Extracting users from roleDataComp ===');
        console.log('roleDataComp:', roleDataComp);
        console.log('roleDataComp is array:', Array.isArray(roleDataComp));
        console.log('roleDataComp length:', roleDataComp?.length);
        
        if (!Array.isArray(roleDataComp) || roleDataComp.length === 0) {
            console.log('No companies found in roleDataComp');
            return [];
        }
        
        // Flatten users from all companies
        const allUsers = [];
        roleDataComp.forEach((company, companyIndex) => {
            console.log(`Company ${companyIndex}:`, company);
            if (company?.users && Array.isArray(company.users)) {
                console.log(`  Found ${company.users.length} users in company ${companyIndex}`);
                allUsers.push(...company.users);
            } else {
                console.log(`  No users array found in company ${companyIndex}`);
            }
        });
        
        console.log('Total users extracted:', allUsers.length);
        return allUsers;
    }, [roleDataComp]);

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Log Redux response whenever it changes
    useEffect(() => {
        console.log('=== Role Data Response from Redux ===');
        console.log('Full roleDataResponse:', roleDataResponse);
        console.log('roleDataComp (raw):', roleDataComp);
        console.log('roleDataList (flattened users):', roleDataList);
        console.log('roleDataList length:', roleDataList?.length);
        console.log('isLoading:', isLoading);
        if (roleDataList && roleDataList.length > 0) {
            console.log('First user in roleDataList:', roleDataList[0]);
        }
    }, [roleDataResponse, roleDataComp, roleDataList, isLoading]);

    // Fetch data when filter or search changes
    useEffect(() => {
        const kycStatus = getKycStatusFromFilter(activeFilter);
        const payload = {
            query: {
                userRole: 4, // Default userRole
                kycStatus: kycStatus
            },
            options: {
                sort: { id: -1 }, // Default sort
                page: 1, // Default page
                paginate: 10 // Default paginate
            },
            customSearch: debouncedSearchQuery.trim() ? { 
                name: debouncedSearchQuery.trim(),
                mobileNo: debouncedSearchQuery.trim() 
            } : {}
        };
        
        console.log('=== Sending API Request ===');
        console.log('Payload being sent:', JSON.stringify(payload, null, 2));
        console.log('Active Filter:', activeFilter);
        console.log('KYC Status:', kycStatus);
        console.log('Search Query:', debouncedSearchQuery);
        
        dispatch(roleDataCompanyUser(payload));
    }, [activeFilter, debouncedSearchQuery, dispatch]);

    // Format table data from API response
    const formatTableData = () => {
        console.log('=== Formatting Table Data ===');
        console.log('roleDataList type:', Array.isArray(roleDataList) ? 'Array' : typeof roleDataList);
        console.log('roleDataList length:', roleDataList?.length);
        
        if (!Array.isArray(roleDataList) || roleDataList.length === 0) {
            console.log('No data to format - returning empty array');
            return [];
        }
        
        const formatted = roleDataList.map((user, index) => {
            // Format date from "2025-12-15T10:27:30.248Z" to "15-12-25" (DD-MM-YY)
            let formattedDate = '-';
            if (user.date) {
                try {
                    const dateObj = new Date(user.date);
                    const day = String(dateObj.getDate()).padStart(2, '0');
                    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                    const year = String(dateObj.getFullYear()).slice(-2);
                    formattedDate = `${day}-${month}-${year}`;
                } catch (e) {
                    console.error('Date parsing error:', e);
                    formattedDate = '-';
                }
            }
            
            // Map userRole codes to readable names
            const roleMap = {
                'DI': 'Distributor',
                'RE': 'Retailer',
                'MD': 'Master Distributor',
                'EN': 'Enterprise'
            };
            
            const formattedItem = {
                id: user.id || user._id || `row-${index}`,
                srNo: String(index + 1).padStart(2, '0'),
                date: formattedDate,
                parentName: user.parentName || user.company || '-',
                userName: user.name || '-',
                mobileNumber: user.mobileNo || '-',
                emailId: user.email || '-',
                currentRole: roleMap[user.userRole] || user.userRole || '-',
                upgradeRole: user.upgradeRole || user.requestedRole || '-' // May not be in response yet
            };
            
            if (index === 0) {
                console.log('Sample raw user item:', user);
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


    const renderTableContent = () => {
        if (isLoading) {
            return (
                <div className="p-8 text-center">
                    <p className="text-gray-500">Loading...</p>
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
                    {tableData.length === 0 ? (
                        <tr>
                            <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                                No data available
                            </td>
                        </tr>
                    ) : (
                        tableData.map((row, index) => (
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
                        ))
                    )}
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
                {renderTableContent()}
            </div>
        </div>
    );
};

export default RoleUpgradeWhiteLabel;


