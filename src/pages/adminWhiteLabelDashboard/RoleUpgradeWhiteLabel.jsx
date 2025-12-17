import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, X, User, Sparkles } from 'lucide-react';
import { roleDataCompanyUser } from '../../redux/action/roleAction';

const RoleUpgradeWhiteLabel = () => {
    const dispatch = useDispatch();
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('Approved');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [activeTab, setActiveTab] = useState('User Details');

    // If user details are loaded from API/table row, don't allow editing.
    const isPrefilledUser = Boolean(selectedUser);

    // Requested Role dropdown mapping (label + id)
    const requestedRoleOptions = [
        { id: 3, label: 'Master Distributor' },
        { id: 4, label: 'Distributor' },
        { id: 5, label: 'Retailer' }
    ];

    const normalizeRequestedRoleId = (value) => {
        if (value === null || value === undefined) return '';

        // If backend already sends a number/id
        if (typeof value === 'number') return String(value);

        const raw = String(value).trim();
        if (!raw) return '';

        // If backend sends "3"/"4"/"5"
        if (/^\d+$/.test(raw)) return raw;

        const upper = raw.toUpperCase();
        // If backend sends codes like MD/DI/RE
        if (upper === 'MD') return '3';
        if (upper === 'DI') return '4';
        if (upper === 'RE') return '5';

        // If backend sends names
        const lower = raw.toLowerCase();
        if (lower.includes('master')) return '3';
        if (lower.includes('retailer')) return '5';
        if (lower.includes('distributor')) return '4';

        return '';
    };

    // Form state for modal
    const [formData, setFormData] = useState({
        parentName: '',
        userName: '',
        mobileNumber: '',
        emailId: '',
        currentRole: '',
        requestedRole: ''
    });

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
    // Try both 'role' and 'roles' in case the reducer is registered differently
    const roleDataResponse = useSelector((state) => {
        const roleState = state?.roles || state?.role;
        return roleState?.roleDataComp?.roleDataComp;
    });
    console.log('roleDataResponse', roleDataResponse);

    // roleDataResponse is already the array of companies
    const roleDataComp = Array.isArray(roleDataResponse) ? roleDataResponse : [];
    console.log('roleDataComp', roleDataComp);
    console.log('roleDataComp length:', roleDataComp.length);

    const isLoading = useSelector((state) => {
        const roleState = state?.roles || state?.role;
        return roleState?.isLoading || false;
    });

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
                // Table display fields
                id: user.id || user._id || `row-${index}`,
                srNo: String(index + 1).padStart(2, '0'),
                date: formattedDate,
                parentName: user.parentName || user.company || '-',
                userName: user.name || '-',
                mobileNumber: user.mobileNo || '-',
                emailId: user.email || '-',
                currentRole: roleMap[user.userRole] || user.userRole || '-',
                upgradeRole: user.upgradeRole || user.requestedRole || '-',
                userRole: user.userRole || '-', // Raw userRole for display

                // All user attributes from API response
                userId: user.userId || null,
                userRoleRaw: user.userRole || null,
                parentRole: user.parentRole || null,
                company: user.company || null,
                companyId: user.companyId || null,
                kycStatus: user.kycStatus || null,
                kycSteps: user.kycSteps || null,
                status: user.status || null,
                lock: user.lock || false,
                onboardingTokenExpiresAt: user.onboardingTokenExpiresAt || null,
                wallet: user.wallet || { mainWallet: 0, apesWallet: 0 },

                // Store full user object for modal (contains all attributes)
                fullUserData: user
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
            <div className="w-full overflow-x-auto">
                <table className="min-w-max w-full divide-y">
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
                        <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                            User ID
                        </th>
                        <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                            Parent Role
                        </th>
                        <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                            Company
                        </th>
                        <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                            Company ID
                        </th>
                        <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                            KYC Status
                        </th>
                        <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                            KYC Steps
                        </th>
                        <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                            Status
                        </th>
                        <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                            Lock
                        </th>
                        <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                            Main Wallet
                        </th>
                        <th className="px-3 py-4 text-left font-medium text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
                            Apes Wallet
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y font-normal ">
                    {tableData.length === 0 ? (
                        <tr>
                            <td colSpan="16" className="px-4 py-8 text-center text-gray-500">
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
                                    <button
                                        onClick={() => handleUpgradeClick(row)}
                                        className="px-4 py-2 bg-[#039155] text-white rounded-lg hover:bg-[#027a45] transition cursor-pointer font-medium"
                                    >
                                        {row.userRole}
                                    </button>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                                    {row.userId || '-'}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                                    {row.parentRole || '-'}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                                    {row.company || '-'}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                                    {row.companyId || '-'}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                                    {row.kycStatus || '-'}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                                    {row.kycSteps || '-'}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                                    {row.status || '-'}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                                    {row.lock ? 'Yes' : 'No'}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                                    {row.wallet?.mainWallet ?? 0}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                                    {row.wallet?.apesWallet ?? 0}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
            </div>
        );
    };

    const handleUpgradeClick = (row) => {
        const user = row.fullUserData || row;
        const userId = user.id || row.id;

        console.log('Upgrade clicked for user ID:', userId);
        console.log('Full user data:', user);

        // Map userRole codes to readable names
        const roleMap = {
            'DI': 'Distributor',
            'RE': 'Retailer',
            'MD': 'Master Distributor',
            'EN': 'Enterprise'
        };

        setSelectedUser(user);
        setFormData({
            parentName: user.parentName || '',
            userName: user.name || '',
            mobileNumber: user.mobileNo || '',
            emailId: user.email || '',
            currentRole: roleMap[user.userRole] || user.userRole || '',
            requestedRole: normalizeRequestedRoleId(user.upgradeRole || user.requestedRole)
        });
        setIsModalOpen(true);
        setActiveTab('User Details');
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
        setFormData({
            parentName: '',
            userName: '',
            mobileNumber: '',
            emailId: '',
            currentRole: '',
            requestedRole: ''
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveChanges = () => {
        console.log('Saving changes for user:', selectedUser?.id);
        console.log('Form data:', formData);
        // TODO: Add API call to save changes
        // Close modal after save
        handleCloseModal();
    };

    const tabs = ['User Details', 'Role Information', 'Status And Actions'];

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
            <div className="mb-4 rounded-xl bg-white">
                {renderTableContent()}
            </div>

            {/* Edit Role Request Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full h-[30vh] max-h-[30vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b">
                            <div className='flex-1 text-center'>
                                <h2 className="text-[24px] font-['Gilroy-Medium'] text-[#000000]">Edit Role Request</h2>
                                {selectedUser && (
                                    <p className="text-[16px] font-['Gilroy-Regular'] text-[#1B1717] text-opacity-80 mt-[12px]">Request ID: #{selectedUser.id}</p>
                                )}
                            </div>
                            <button
                                onClick={handleCloseModal}
                                className="w-10 h-10 rounded-xl bg-[#039155] text-white flex items-center justify-center hover:bg-[#027a45] transition"
                            >
                                <div className='border-[#FFFFFF] border-2 rounded-full p-0'>
                                    <X className="w-5 h-5" />
                                </div>

                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="px-6 py-4">
                            <div className="flex gap-4 rounded-lg border-2 border-[#1B1717] border-opacity-50 p-2">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-2 py-3 font-['Gilroy-SemiBold'] text-[16px] transition flex-1 rounded-xl
                ${activeTab === tab
                                                ? 'bg-[#039155] text-white'
                                                : 'bg-transparent text-[#1B1717] text-opacity-80'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                        </div>

                        {/* Tab Content */}
                        <div className="p-6 flex-1 overflow-y-auto">
                            {activeTab === 'User Details' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[14px] font-['Gilroy-Medium'] text-[#000000] mb-2">
                                            Parent Name
                                        </label>
                                        <div className="w-full text-[12px] font-['Gilroy-Medium'] text-[#1B1717] text-opacity-80">
                                            {formData.parentName || '-'}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#1B1717] mb-2">
                                            User Name
                                        </label>
                                        <div className="w-full text-[12px] font-['Gilroy-Medium'] text-[#1B1717] text-opacity-80">
                                            {formData.userName || '-'}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#1B1717] mb-2">
                                            Mobile Number
                                        </label>
                                        <div className="w-full text-[12px] font-['Gilroy-Medium'] text-[#1B1717] text-opacity-80">
                                            {formData.mobileNumber || '-'}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#1B1717] mb-2">
                                            Email Id
                                        </label>
                                        <div className="w-full text-[12px] font-['Gilroy-Medium'] text-[#1B1717] text-opacity-80">
                                            {formData.emailId || '-'}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'Role Information' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-[#1B1717] mb-2">
                                                Current Role
                                            </label>
                                            <input
                                                type="text"
                                                name="currentRole"
                                                value={formData.currentRole}
                                                onChange={handleInputChange}
                                                disabled={isPrefilledUser}
                                                placeholder="Enter Current Role"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[#1B1717] mb-2">
                                                Requested Role
                                            </label>
                                            <select
                                                name="requestedRole"
                                                value={formData.requestedRole}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-[#039155]"
                                            >
                                                <option value="">Select Requested Role</option>
                                                {requestedRoleOptions.map((opt) => (
                                                    <option key={opt.id} value={String(opt.id)}>
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Role Visualization */}
                                    <div className="flex items-center justify-between py-6 px-2 bg-[#FAFAFA] rounded-lg">
                                        <div className="flex items-center gap-3 w-[220px]">
                                            <User className="w-6 h-6 text-[#039155]" />
                                            <span className="font-medium text-[#1B1717] truncate">
                                                {formData.currentRole || '-'}
                                            </span>
                                        </div>

                                        {/* Center dots - keep centered and slightly right */}
                                        <div className="flex-1 flex items-center justify-center">
                                            <div className="flex items-center gap-[2px] -translate-x-[10px]">
                                            {[...Array(5)].map((_, i) => (
                                                    <React.Fragment key={i}>
                                                        <div className="w-3 h-3 bg-[#039155] rounded-full" />
                                                        {i < 4 && (
                                                            <div className="w-4 h-[3px] bg-[#039155] opacity-80 rounded-full" />
                                                        )}
                                                    </React.Fragment>
                                            ))}
                                        </div>  
                                        </div>

                                        <div className="flex items-center justify-end gap-3 w-[220px]">
                                            <Sparkles className="w-6 h-6 text-[#039155]" />
                                            <span className="font-medium text-[#1B1717] inline-block w-48 truncate">
                                                {requestedRoleOptions.find((opt) => String(opt.id) === String(formData.requestedRole))?.label || '-'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'Status And Actions' && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-medium text-[#1B1717] mb-4">Quick Actions</h3>
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => {
                                                    console.log('Reject Request for user:', selectedUser?.id);
                                                    // TODO: Add reject API call
                                                    handleCloseModal();
                                                }}
                                                className="px-6 py-3 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition"
                                            >
                                                Reject Request
                                            </button>
                                            <button
                                                onClick={() => {
                                                    console.log('Approve Request for user:', selectedUser?.id);
                                                    // TODO: Add approve API call
                                                    handleCloseModal();
                                                }}
                                                className="px-6 py-3 bg-[#039155] text-white rounded-lg font-medium hover:bg-[#027a45] transition"
                                            >
                                                Approve Request
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer (fixed height for all tabs) */}
                        <div className="flex justify-center gap-4 p-6 min-h-[88px]">
                            {activeTab !== 'Status And Actions' && (
                                <>
                            <button
                                onClick={handleCloseModal}
                                        className="px-6 py-2 border-2 border-[#1B1717] border-opacity-50 text-[18px] text-[#1B1717] text-opacity-80 rounded-xl font-['Gilroy-Medium'] hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveChanges}
                                        className="px-6 py-2 bg-[#039155] text-white rounded-xl font-['Gilroy-Medium'] text-[18px] hover:bg-[#027a45] transition"
                            >
                                Save Changes
                            </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoleUpgradeWhiteLabel;


