import React, { useState, useEffect, useRef } from 'react';
import { User, Users, ChevronDown, X } from 'lucide-react';

const Rolemanagement = () => {
    const [selectedRole, setSelectedRole] = useState('Admin');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [expandedModule, setExpandedModule] = useState(null);
    const dropdownRef = useRef(null);

    const roles = ['Admin', 'Manager', 'Editor', 'Viewer', 'Moderator'];

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

    const initialModules = [
        {
            name: 'Member',
            readCount: 2,
            writeCount: 4,
            permissions: [
                { category: 'User Profiles', description: 'View And Edit User Information', read: true, write: true },
                { category: 'User Profiles', description: 'View And Edit User Information', read: true, write: true },
                { category: 'User Profiles', description: 'View And Edit User Information', read: true, write: true },
            ]
        },
        {
            name: 'Resources',
            readCount: 2,
            writeCount: 4,
            permissions: [
                { category: 'User Profiles', description: 'View And Edit User Information', read: true, write: true },
                { category: 'User Profiles', description: 'View And Edit User Information', read: true, write: true },
                { category: 'User Profiles', description: 'View And Edit User Information', read: true, write: true },
            ]
        },
        {
            name: 'Fund Manage',
            readCount: 2,
            writeCount: 4,
            permissions: [
                { category: 'User Profiles', description: 'View And Edit User Information', read: true, write: true },
                { category: 'User Profiles', description: 'View And Edit User Information', read: true, write: true },
                { category: 'User Profiles', description: 'View And Edit User Information', read: true, write: true },
            ]
        },
        {
            name: 'API And Operator',
            readCount: 2,
            writeCount: 4,
            permissions: [
                { category: 'User Profiles', description: 'View And Edit User Information', read: true, write: true },
                { category: 'User Profiles', description: 'View And Edit User Information', read: true, write: true },
                { category: 'User Profiles', description: 'View And Edit User Information', read: true, write: true },
            ]
        },
        {
            name: 'Customer Support',
            readCount: 2,
            writeCount: 4,
            permissions: [
                { category: 'User Profiles', description: 'View And Edit User Information', read: true, write: true },
                { category: 'User Profiles', description: 'View And Edit User Information', read: true, write: true },
                { category: 'User Profiles', description: 'View And Edit User Information', read: true, write: true },
            ]
        },
    ];

    const [modules, setModules] = useState(initialModules);

    return (
        <div className="min-h-screen bg-[#FAFAFA] p-4 sm:p-6 text-[#1B1717]">
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
            <div className="bg-gray-100 rounded-xl p-4 sm:p-6 mb-8">
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
                                    className="flex items-center gap-4 p-4 rounded-xl bg-white hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
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
