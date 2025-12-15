import React, { useState, useEffect, useRef } from 'react';
import { User, Users, ChevronDown } from 'lucide-react';
import { getPermission } from '../../redux/action/userProfileAction';
import { useDispatch, useSelector } from 'react-redux';

// Role name to ID mapping
const roleMapping = {
    'Admin': 1,
    'Master Distributor': 3,
    'Distributor': 4,
    'Retailer': 5,
    'Employee': 6,
    'Others': 7
};

const roles = ['Admin', 'Master Distributor', 'Distributor', 'Retailer', 'Employee', 'Others'];

const Rolemanagement = () => {
    const [selectedRole, setSelectedRole] = useState('Admin');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [expandedModule, setExpandedModule] = useState(null);
    const dropdownRef = useRef(null);
    const dispatch = useDispatch();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    // Default initial modules (fallback)
    const defaultModules = [
        {
            name: 'Loading...',
            readCount: 0,
            writeCount: 0,
            permissions: []
        }
    ];

    useEffect(() => {
        // Get the role ID from the mapping
        const roleId = roleMapping[selectedRole];
        if (roleId) {
            dispatch(getPermission(roleId));
        }
    }, [selectedRole, dispatch])

    const roledata = useSelector((state) => state?.userProfile?.adminRolesPermission?.adminRolesPermission);
    console.log("roledata", roledata);

    // Extract all parent module names from all indexes
    const Modulenames = roledata ? Object.values(roledata).map(item => item?.moduleName).filter(Boolean) : [];
    console.log("Modulenames (Parent Names)", Modulenames);

    // Transform API data: Parent modules become modules, children become permissions
    const transformModulesFromAPI = (data) => {
        if (!data || typeof data !== 'object') {
            return defaultModules;
        }

        return Object.values(data).map((parentItem) => {
            const children = parentItem?.children || [];
            
            // Count read and write permissions from children
            const readCount = children.filter(child => child?.read === true).length;
            const writeCount = children.filter(child => child?.write === true).length;

            // Format helper function
            const formatName = (name) => {
                if (!name) return '';
                return name.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                ).join(' ');
            };

            // Transform children to permissions format
            // Children moduleName becomes permissions.category
            const permissions = children.map((child) => {
                const childModuleName = child?.moduleName || 'Permission';
                const formattedName = formatName(childModuleName);

                return {
                    category: formattedName || childModuleName, // Use formatted child moduleName as category
                    description: `${formattedName || childModuleName} Access`,
                    read: child?.read || false,
                    write: child?.write || false,
                    id: child?.id,
                    permissionId: child?.permissionId,
                    parentId: child?.parentId
                };
            });

            // Use parent moduleName for modules.name (formatted for display)
            const parentModuleName = parentItem?.moduleName || 'Module';
            const formattedParentName = formatName(parentModuleName);

            return {
                name: formattedParentName || parentModuleName, // Use formatted parent moduleName for modules.name
                readCount: readCount,
                writeCount: writeCount,
                permissions: permissions, // Children become permissions array
                id: parentItem?.id,
                roleId: parentItem?.roleId,
                read: parentItem?.read || false,
                write: parentItem?.write || false,
                isParent: parentItem?.isParent
            };
        });
    };

    const [modules, setModules] = useState(defaultModules);

    // Update modules when roledata changes
    useEffect(() => {
        if (roledata) {
            const transformedModules = transformModulesFromAPI(roledata);
            setModules(transformedModules);
        } else {
            setModules(defaultModules);
        }
    }, [roledata]);

    return (
        <div className="min-h-screen p-4 sm:p-6 text-[#1B1717]">
            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-medium text-[#1B1717] mb-2">
                    Roles Management
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                    Manage User Roles And Permissions Across Your System
                </p>
            </div>

            {/* Admin Role Section */}
            <div className="bg-[#FFFFFF] rounded-xl p-4 sm:p-6 mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Admin Icon */}
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full  flex items-center justify-center bg-green-100">
                            <User className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                        </div>

                        {/* Admin Info */}
                        <div>
                            <h2 className="text-xl sm:text-2xl font-semibold text-[#1B1717] mb-1">
                                Admin
                            </h2>
                            <p className="text-sm sm:text-base text-gray-600">
                                Administrative Access To Core Features
                            </p>
                        </div>
                    </div>

                    {/* Role Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-[#1B1717] font-medium hover:bg-gray-100 transition"
                        >
                            <span>{selectedRole}</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                                <div className="py-1">
                                    {roles.map((role) => (
                                        <button
                                            key={role}
                                            onClick={() => {
                                                setSelectedRole(role);
                                                setIsDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition ${selectedRole === role ? 'bg-gray-100 font-medium' : ''
                                                }`}
                                        >
                                            {role}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Permission Section Container */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                {/* Permission Header */}
                <div className="mb-6">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-[#1B1717] mb-2">
                        Permission
                    </h2>
                    <p className="text-base sm:text-lg lg:text-xl text-[#1B1717]">
                        Configure What This Role Can Access And Modify
                    </p>
                </div>

                {/* Module Legend Section */}
                <div className="bg-gray-50 p-4 sm:p-6 mb-4 -mx-4 sm:-mx-6 w-[calc(100%+2rem)] sm:w-[calc(100%+3rem)]">
                    <span className="text-2xl font-medium text-[#1B1717] block mb-4">Module</span>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span className="text-sm text-gray-600">Read</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span className="text-sm text-gray-600">Write</span>
                        </div>
                    </div>
                </div>

                {/* Modules List Container */}
                <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                    <div className="space-y-4">
                        {modules.map((module, index) => (
                            <div key={index}>
                                {/* Module Card - Always Visible */}
                                <div
                                    onClick={() => setExpandedModule(expandedModule === index ? null : index)}
                                    className="flex items-center gap-4 p-4 rounded-xl bg-white transition-colors shadow-sm cursor-pointer"
                                >
                                    {/* Module Icon */}
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-purple-600 flex items-center justify-center bg-purple-100 flex-shrink-0">
                                        <Users className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600" />
                                    </div>

                                    {/* Module Info */}
                                    <div className="flex-1">
                                        <h3 className="text-2xl sm:text-lg font-medium text-[#1B1717] mb-2">
                                            {module.name}
                                        </h3>
                                        <div className="flex items-center gap-6 text-sm">
                                            {/* Read Permission */}
                                            <div className="flex items-center gap-2">
                                                <span className="text-blue-500 font-medium">
                                                    {module.readCount}/8 Read
                                                </span>
                                            </div>
                                            {/* Write Permission */}
                                            <div className="flex items-center gap-2">
                                                <span className="text-green-500 font-medium">
                                                    {module.writeCount}/8 Write
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Down Arrow (when collapsed) or Toggle Buttons (when expanded) */}
                                    <div className="flex-shrink-0">
                                        {expandedModule === index ? (
                                            // Toggle Buttons for Read and Write (when expanded)
                                            <div className="flex items-center gap-4">
                                                {/* Read Toggle Button */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const updatedModules = [...modules];
                                                        const allReadEnabled = updatedModules[index].permissions.every(p => p.read);

                                                        // Toggle all read permissions
                                                        updatedModules[index].permissions.forEach(p => {
                                                            p.read = !allReadEnabled;
                                                        });

                                                        updatedModules[index].readCount = updatedModules[index].permissions.filter(p => p.read).length;
                                                        setModules(updatedModules);
                                                    }}
                                                    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                                    style={{
                                                        backgroundColor: module.permissions.every(p => p.read) ? '#3b82f6' : '#d1d5db'
                                                    }}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${module.permissions.every(p => p.read) ? 'translate-x-6' : 'translate-x-1'
                                                            }`}
                                                    />
                                                </button>
                                                <span className="text-sm font-medium text-blue-500">Read</span>

                                                {/* Write Toggle Button */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const updatedModules = [...modules];
                                                        const allWriteEnabled = updatedModules[index].permissions.every(p => p.write);

                                                        // Toggle all write permissions
                                                        updatedModules[index].permissions.forEach(p => {
                                                            p.write = !allWriteEnabled;
                                                        });

                                                        updatedModules[index].writeCount = updatedModules[index].permissions.filter(p => p.write).length;
                                                        setModules(updatedModules);
                                                    }}
                                                    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                                    style={{
                                                        backgroundColor: module.permissions.every(p => p.write) ? '#10b981' : '#d1d5db'
                                                    }}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${module.permissions.every(p => p.write) ? 'translate-x-6' : 'translate-x-1'
                                                            }`}
                                                    />
                                                </button>
                                                <span className="text-sm font-medium text-green-500">Write</span>
                                            </div>
                                        ) : (
                                            // Down Arrow (when collapsed)
                                            <ChevronDown className="w-5 h-5 text-gray-400" />
                                        )}
                                    </div>
                                </div>

                                {/* Expanded Permission Details - Shows Below Parent Card */}
                                {expandedModule === index && (
                                    <div className="mt-4 bg-white rounded-xl shadow-sm p-6">


                                        {/* Permission Categories */}
                                        <div className="mb-6">
                                            {module.permissions.map((permission, permIndex) => (
                                                <div key={permIndex}>
                                                    <div className="flex items-center justify-between p-4 bg-white">
                                                        <div className="flex-1">
                                                            <h4 className="text-xl font-medium text-[#1B1717] mb-1">
                                                                {permission.category}
                                                            </h4>
                                                            <p className="text-md text-[#1B1717] ">
                                                                {permission.description}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-6">
                                                            {/* Read Toggle */}
                                                            <div className="flex flex-col items-center gap-2">
                                                                <span className="text-xs text-gray-600 font-medium">Read</span>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        const updatedModules = [...modules];
                                                                        updatedModules[index].permissions[permIndex].read = !updatedModules[index].permissions[permIndex].read;
                                                                        updatedModules[index].readCount = updatedModules[index].permissions.filter(p => p.read).length;
                                                                        setModules(updatedModules);
                                                                    }}
                                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors  ${permission.read ? 'bg-blue-500 focus:ring-blue-500' : 'bg-gray-300 focus:ring-gray-400'
                                                                        }`}
                                                                >
                                                                    <span
                                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${permission.read ? 'translate-x-6' : 'translate-x-1'
                                                                            }`}
                                                                    />
                                                                </button>
                                                            </div>
                                                            {/* Write Toggle */}
                                                            <div className="flex flex-col items-center gap-2">
                                                                <span className="text-xs text-gray-600 font-medium">Write</span>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        const updatedModules = [...modules];
                                                                        updatedModules[index].permissions[permIndex].write = !updatedModules[index].permissions[permIndex].write;
                                                                        // Recalculate write count
                                                                        updatedModules[index].writeCount = updatedModules[index].permissions.filter(p => p.write).length;
                                                                        setModules(updatedModules);
                                                                    }}
                                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${permission.write ? 'bg-green-500 focus:ring-green-500' : 'bg-gray-300 focus:ring-gray-400'
                                                                        }`}
                                                                >
                                                                    <span
                                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${permission.write ? 'translate-x-6' : 'translate-x-1'
                                                                            }`}
                                                                    />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {permIndex < module.permissions.length - 1 && (
                                                        <div className="border-b border-gray-200"></div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Status Message */}
                                        <div className="text-sm text-gray-500 text-left pt-4 border-t border-gray-200">
                                            Changes Are Automatically Saved • Last Updated: Just Now
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Rolemanagement;
