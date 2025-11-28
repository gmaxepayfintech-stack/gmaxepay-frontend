import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, ChevronLeft, ChevronRight, Globe, Lock, Grid3x3, X, ChevronDown } from 'lucide-react';

const SchemeMaster = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All Schemes');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        schemeName: '',
        schemeMode: 'Global',
        schemeType: 'Premium',
        subscriptionType: '',
        premiumAmount: ''
    });
    const [isSubscriptionDropdownOpen, setIsSubscriptionDropdownOpen] = useState(false);
    const modalRef = useRef(null);
    const dropdownRef = useRef(null);

    // Close modal when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setIsModalOpen(false);
            }
        };
        if (isModalOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isModalOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsSubscriptionDropdownOpen(false);
            }
        };
        if (isSubscriptionDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSubscriptionDropdownOpen]);

    const schemes = [
        {
            id: 1,
            name: 'WL Globe',
            icon: Globe,
            iconColor: 'text-green-600',
            iconBg: 'bg-green-100',
            iconImage: '/img/WLGlobe.png',
            useImage: true,
            status: 'Active',
            schemeId: '#1234',
            created: '23-06-25',
            members: '34',
            tags: [
                { label: 'Global', color: 'bg-[#08A000] text-white' },
                { label: 'Free', color: 'bg-[#366BCD] text-white' }
            ]
        },
        {
            id: 2,
            name: 'Grampay',
            icon: Lock,
            iconColor: 'text-purple-600',
            iconBg: 'bg-purple-100',
            iconImage: '/img/GramPay.png',
            useImage: true,
            status: 'Active',
            schemeId: '#1234',
            created: '23-06-25',
            members: '34',
            tags: [
                { label: 'Private', color: 'bg-[#9B3FEF] text-white' },
                { label: 'N/A', color: 'bg-[#969696] text-white' }
            ]
        },
        {
            id: 3,
            name: 'Platinum Membership',
            icon: Grid3x3,
            iconColor: 'text-orange-600',
            iconBg: 'bg-orange-100',
            iconImage: '/img/Platanium.png',
            useImage: true,
            status: 'Active',
            schemeId: '#1234',
            created: '23-06-25',
            members: '34',
            tags: [
                { label: 'Global', color: 'bg-[#08A000] text-white' },
                { label: 'Premium', color: 'bg-[#D6C407] text-white' }
            ]
        },
        {
            id: 4,
            name: 'WL Globe',
            icon: Globe,
            iconColor: 'text-green-600',
            iconBg: 'bg-green-100',
            iconImage: '/img/WLGlobe.png',
            useImage: true,
            status: 'Active',
            schemeId: '#1234',
            created: '23-06-25',
            members: '34',
            tags: [
                { label: 'Global', color: 'bg-[#08A000] text-white' },
                { label: 'Free', color: 'bg-[#366BCD] text-white' }
            ]
        },
        {
            id: 5,
            name: 'Grampay',
            icon: Lock,
            iconColor: 'text-purple-600',
            iconBg: 'bg-purple-100',
            iconImage: '/img/GramPay.png',
            useImage: true,
            status: 'Active',
            schemeId: '#1234',
            created: '23-06-25',
            members: '34',
            tags: [
                { label: 'Private', color: 'bg-[#9B3FEF] text-white' },
                { label: 'N/A', color: 'bg-[#969696] text-white' }
            ]
        },
        {
            id: 6,
            name: 'Platinum Membership',
            icon: Grid3x3,
            iconColor: 'text-orange-600',
            iconBg: 'bg-orange-100',
            iconImage: '/img/Platanium.png',
            useImage: true,
            status: 'Active',
            schemeId: '#1234',
            created: '23-06-25',
            members: '34',
            tags: [
                { label: 'Global', color: 'bg-[#08A000] text-white' },
                { label: 'Premium', color: 'bg-[#D6C407] text-white' }
            ]
        },
    ];

    const filters = ['All Schemes', 'Global', 'Private', 'Premium', 'Free'];

    return (
        <div className="min-h-screen p-3 sm:p-4 md:p-6 text-[#1B1717]">
            {/* Header Section */}
            <div className="mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="flex-1">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-medium text-[#1B1717] mb-1 sm:mb-2">
                            Membership Schemes
                        </h1>
                        <p className="text-sm sm:text-base text-[#1B1717]">
                            Manage And Monitor All Your Membership Programs
                        </p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center gap-2 bg-[#039155] text-white px-3 py-2 sm:px-4 sm:py-2 md:px-6 md:py-3 rounded-lg font-medium hover:bg-green-700 transition shadow-md text-sm sm:text-base w-full sm:w-auto"
                    >
                        <span className="whitespace-nowrap">Create New Scheme</span>
                        <Plus className="w-4 h-4 rounded-full border border-white sm:w-5 sm:h-5 flex-shrink-0" />
                    </button>
                </div>
            </div>

            {/* Container for Search, Filter, and Scheme Cards */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-sm mb-4 sm:mb-6">
                {/* Search and Filter Section */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    {/* Search Bar */}
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search Scheme"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] focus:border-[#039155] text-sm sm:text-base"
                        />
                    </div>

                    {/* Filter Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                        {filters.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm md:text-base font-medium transition whitespace-nowrap ${activeFilter === filter
                                    ? 'bg-[#039155] text-white shadow-md'
                                    : 'bg-white text-[#1B1717] border border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Scheme Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 items-stretch">
                    {schemes.map((scheme) => {
                        const IconComponent = scheme.icon;
  return (
                            <div
                                key={scheme.id}
                                className="bg-white rounded-lg sm:rounded-xl border border-[#1B1717] border-opacity-40 shadow-sm p-3 sm:p-4 md:p-6 hover:shadow-md transition-shadow flex flex-col h-full"
                            >
                                {/* Card Header */}
                                <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
                                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                        <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg flex-shrink-0 ${scheme.useImage ? '' : scheme.iconBg} flex items-center justify-center`}>
                                            {scheme.useImage ? (
                                                <img
                                                    src={scheme.iconImage}
                                                    alt={scheme.name}
                                                    className="w-full h-full object-contain rounded-lg"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = '/img/gmaxepay.png';
                                                    }}
                                                />
                                            ) : (
                                                <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ${scheme.iconColor}`} />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm sm:text-base md:text-lg font-medium text-[#1B1717] mb-1 truncate">
                                                {scheme.name}
                                            </h3>
                                            {/* Tags */}
                                            <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1">
                                                {scheme.tags.map((tag, index) => (
                                                    <span
                                                        key={index}
                                                        className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium ${tag.color}`}
                                                    >
                                                        {tag.label}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Status Indicator */}
                                    <div className="flex items-center bg-[#008D1E] rounded-full p-1.5 sm:p-2 px-2 sm:px-3 gap-1 sm:gap-1.5 flex-shrink-0">
                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white"></div>
                                        <span className="text-xs font-medium text-white whitespace-nowrap">{scheme.status}</span>
                                    </div>
                                </div>

                                {/* Scheme Details */}
                                <div className="space-y-2 sm:space-y-3 md:space-y-4 mb-3 sm:mb-4 flex-grow">
                                    <div className="flex justify-between text-sm sm:text-base">
                                        <span className="text-gray-600">Scheme Id</span>
                                        <span className="font-medium text-[#1B1717]">{scheme.schemeId}</span>
                                    </div>
                                    <div className="flex justify-between text-sm sm:text-base">
                                        <span className="text-gray-600">Created</span>
                                        <span className="font-medium text-[#1B1717]">{scheme.created}</span>
                                    </div>
                                    <div className="flex justify-between text-sm sm:text-base">
                                        <span className="text-gray-600">Members</span>
                                        <span className="font-medium text-[#1B1717]">{scheme.members}</span>
                                    </div>
                                </div>

                                {/* View Details Button */}
                                <button className="w-full bg-[#039155] text-white py-2.5 sm:py-3 md:py-4 rounded-lg font-medium hover:bg-green-700 transition text-sm sm:text-base mt-auto">
                                    View Details
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className="p-1.5 sm:p-2 rounded-lg border border-gray-300 bg-white text-[#1B1717] hover:bg-gray-50 transition"
                    aria-label="Previous page"
                >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                {[1, 2, 3].map((page) => (
                    <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-medium transition text-sm sm:text-base ${currentPage === page
                            ? 'bg-[#039155] text-white'
                            : 'bg-white border border-gray-300 text-[#1B1717] hover:bg-gray-50'
                            }`}
                    >
                        {page}
                    </button>
                ))}
                <button
                    onClick={() => setCurrentPage(Math.min(3, currentPage + 1))}
                    className="p-1.5 sm:p-2 rounded-lg border border-gray-300 bg-white text-[#1B1717] hover:bg-gray-50 transition"
                    aria-label="Next page"
                >
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
            </div>

            {/* Create New Membership Scheme Modal */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div
                        ref={modalRef}
                        className="bg-white rounded-lg sm:rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 sm:px-6 sm:py-5 flex items-start justify-between rounded-t-lg sm:rounded-t-xl z-10">
                            <div className="flex-1 pr-3 sm:pr-4 min-w-0">
                                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-[#1B1717] mb-1 sm:mb-1.5">
                                    Create New Membership Scheme
                                </h2>
                                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                                    Configure Your New Membership Program With Custom Settings And Features
                                </p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#039155] text-white flex items-center justify-center hover:bg-green-700 transition"
                                aria-label="Close modal"
                            >
                                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="px-4 py-4 sm:px-6 sm:py-6 space-y-4 sm:space-y-6">
                            {/* Basic Information Section */}
                            <div>
                                <h3 className="text-sm sm:text-base font-semibold text-[#1B1717] mb-3 sm:mb-4">
                                    Basic Information
                                </h3>
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-[#1B1717] mb-1.5 sm:mb-2">
                                        Scheme Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter Scheme Name"
                                        value={formData.schemeName}
                                        onChange={(e) => setFormData({ ...formData, schemeName: e.target.value })}
                                        className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] focus:border-[#039155] text-sm sm:text-base"
                                    />
                                </div>
                            </div>

                            {/* Scheme Configuration Section */}
                            <div>
                                <h3 className="text-sm sm:text-base font-semibold text-[#1B1717] mb-3 sm:mb-4">
                                    Scheme Configuration
                                </h3>

                                {/* Scheme Mode */}
                                <div className="mb-4 sm:mb-5">
                                    <label className="block text-xs sm:text-sm font-medium text-[#1B1717] mb-2 sm:mb-3">
                                        Scheme Mode <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                        <label className={`flex items-start gap-2 sm:gap-3 p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.schemeMode === 'Global'
                                            ? 'border-[#039155] bg-green-50'
                                            : 'border-gray-300 bg-white hover:border-gray-400'
                                            }`}>
                                            <div className="relative mt-0.5 flex-shrink-0">
                                                <input
                                                    type="radio"
                                                    name="schemeMode"
                                                    value="Global"
                                                    checked={formData.schemeMode === 'Global'}
                                                    onChange={(e) => setFormData({ ...formData, schemeMode: e.target.value })}
                                                    className="sr-only"
                                                />
                                                <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.schemeMode === 'Global'
                                                    ? 'border-[#039155] bg-[#039155]'
                                                    : 'border-gray-300 bg-white'
                                                    }`}>
                                                    {formData.schemeMode === 'Global' && (
                                                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white"></div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className={`text-xs sm:text-sm font-medium block ${formData.schemeMode === 'Global' ? 'text-[#039155]' : 'text-[#1B1717]'
                                                    }`}>
                                                    Global
                                                </span>
                                                <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                                                    Available To All Users Worldwide
                                                </p>
                                            </div>
                                        </label>
                                        <label className={`flex items-start gap-2 sm:gap-3 p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.schemeMode === 'Private'
                                            ? 'border-[#039155] bg-green-50'
                                            : 'border-gray-300 bg-white hover:border-gray-400'
                                            }`}>
                                            <div className="relative mt-0.5 flex-shrink-0">
                                                <input
                                                    type="radio"
                                                    name="schemeMode"
                                                    value="Private"
                                                    checked={formData.schemeMode === 'Private'}
                                                    onChange={(e) => setFormData({ ...formData, schemeMode: e.target.value })}
                                                    className="sr-only"
                                                />
                                                <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.schemeMode === 'Private'
                                                    ? 'border-[#039155] bg-[#039155]'
                                                    : 'border-gray-300 bg-white'
                                                    }`}>
                                                    {formData.schemeMode === 'Private' && (
                                                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white"></div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className={`text-xs sm:text-sm font-medium block ${formData.schemeMode === 'Private' ? 'text-[#039155]' : 'text-[#1B1717]'
                                                    }`}>
                                                    Private
                                                </span>
                                                <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                                                    Restricted To Specific Users
                                                </p>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* Scheme Type */}
                                <div className="mb-4 sm:mb-5">
                                    <label className="block text-xs sm:text-sm font-medium text-[#1B1717] mb-2 sm:mb-3">
                                        Scheme Type
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                        <label className={`flex items-start gap-2 sm:gap-3 p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.schemeType === 'Free'
                                            ? 'border-[#039155] bg-green-50'
                                            : 'border-gray-300 bg-white hover:border-gray-400'
                                            }`}>
                                            <div className="relative mt-0.5 flex-shrink-0">
                                                <input
                                                    type="radio"
                                                    name="schemeType"
                                                    value="Free"
                                                    checked={formData.schemeType === 'Free'}
                                                    onChange={(e) => setFormData({ ...formData, schemeType: e.target.value })}
                                                    className="sr-only"
                                                />
                                                <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.schemeType === 'Free'
                                                    ? 'border-[#039155] bg-[#039155]'
                                                    : 'border-gray-300 bg-white'
                                                    }`}>
                                                    {formData.schemeType === 'Free' && (
                                                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white"></div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className={`text-xs sm:text-sm font-medium block ${formData.schemeType === 'Free' ? 'text-[#039155]' : 'text-[#1B1717]'
                                                    }`}>
                                                    Free
                                                </span>
                                                <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                                                    No Cost Membership
                                                </p>
                                            </div>
                                        </label>
                                        <label className={`flex items-start gap-2 sm:gap-3 p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.schemeType === 'Premium'
                                            ? 'border-[#039155] bg-green-50'
                                            : 'border-gray-300 bg-white hover:border-gray-400'
                                            }`}>
                                            <div className="relative mt-0.5 flex-shrink-0">
                                                <input
                                                    type="radio"
                                                    name="schemeType"
                                                    value="Premium"
                                                    checked={formData.schemeType === 'Premium'}
                                                    onChange={(e) => setFormData({ ...formData, schemeType: e.target.value })}
                                                    className="sr-only"
                                                />
                                                <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.schemeType === 'Premium'
                                                    ? 'border-[#039155] bg-[#039155]'
                                                    : 'border-gray-300 bg-white'
                                                    }`}>
                                                    {formData.schemeType === 'Premium' && (
                                                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white"></div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className={`text-xs sm:text-sm font-medium block ${formData.schemeType === 'Premium' ? 'text-[#039155]' : 'text-[#1B1717]'
                                                    }`}>
                                                    Premium
                                                </span>
                                                <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                                                    Restricted Access With Invitation Only
                                                </p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Subscription Type and Premium Amount - Side by Side */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                {/* Subscription Type */}
                                <div className="relative" ref={dropdownRef}>
                                    <label className="block text-xs sm:text-sm font-medium text-[#1B1717] mb-1.5 sm:mb-2">
                                        Subscription Type
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Select Subscription Type"
                                            value={formData.subscriptionType}
                                            readOnly
                                            onClick={() => setIsSubscriptionDropdownOpen(!isSubscriptionDropdownOpen)}
                                            className="w-full px-3 sm:px-4 py-3 sm:py-4 md:py-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] focus:border-[#039155] cursor-pointer text-sm sm:text-base bg-white"
                                        />
                                        <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transition-transform pointer-events-none ${isSubscriptionDropdownOpen ? 'rotate-180' : ''}`} />
                                    </div>
                                    {isSubscriptionDropdownOpen && (
                                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                            <div
                                                onClick={() => {
                                                    setFormData({ ...formData, subscriptionType: 'Monthly' });
                                                    setIsSubscriptionDropdownOpen(false);
                                                }}
                                                className="px-3 sm:px-4 py-2 sm:py-2.5 hover:bg-gray-50 cursor-pointer text-sm text-[#1B1717]"
                                            >
                                                Monthly
                                            </div>
                                            <div
                                                onClick={() => {
                                                    setFormData({ ...formData, subscriptionType: 'Yearly' });
                                                    setIsSubscriptionDropdownOpen(false);
                                                }}
                                                className="px-3 sm:px-4 py-2 sm:py-2.5 hover:bg-gray-50 cursor-pointer text-sm text-[#1B1717]"
                                            >
                                                Yearly
                                            </div>
                                            <div
                                                onClick={() => {
                                                    setFormData({ ...formData, subscriptionType: 'Lifetime' });
                                                    setIsSubscriptionDropdownOpen(false);
                                                }}
                                                className="px-3 sm:px-4 py-2 sm:py-2.5 hover:bg-gray-50 cursor-pointer text-sm text-[#1B1717]"
                                            >
                                                Lifetime
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Premium Amount */}
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-[#1B1717] mb-1.5 sm:mb-2">
                                        Premium Amount
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="Enter Premium Amount"
                                        value={formData.premiumAmount}
                                        onChange={(e) => setFormData({ ...formData, premiumAmount: e.target.value })}
                                        className="w-full px-3 sm:px-4 py-3 sm:py-4 md:py-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] focus:border-[#039155] text-sm sm:text-base"
                                    />
                                </div>
                            </div>
                        </div>


                        {/* Modal Footer */}
                        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3 sm:px-6 sm:py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 rounded-b-lg sm:rounded-b-xl">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 sm:px-6 sm:py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition text-sm sm:text-base w-full sm:w-auto"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    // Handle create logic here
                                    console.log('Creating scheme:', formData);
                                    setIsModalOpen(false);
                                }}
                                className="px-4 py-2 sm:px-6 sm:py-2 bg-[#039155] text-white rounded-lg font-medium hover:bg-green-700 transition text-sm sm:text-base w-full sm:w-auto"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SchemeMaster;
