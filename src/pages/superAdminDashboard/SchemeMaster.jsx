import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Globe,
  Lock,
  Grid3x3,
  X,
  ChevronDown,
} from "lucide-react";
import EditMembership from "./EditMembership";

const SchemeMaster = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Schemes");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [showEditMembership, setShowEditMembership] = useState(false);
  const [formData, setFormData] = useState({
    schemeName: "",
    schemeMode: "Global",
    schemeType: "Premium",
    subscriptionType: "",
    premiumAmount: "",
  });
  const [isSubscriptionDropdownOpen, setIsSubscriptionDropdownOpen] =
    useState(false);
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
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSubscriptionDropdownOpen]);

  //Reset page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFilter]);

  const schemes = [
    {
      id: 1,
      name: "WL Globe",
      icon: Globe,
      iconColor: "text-green-600",
      iconBg: "bg-green-100",
      iconImage: "/img/WLGlobe.png",
      useImage: true,
      status: "Active",
      schemeId: "#1234",
      created: "23-06-25",
      members: "34",
      tags: [
        { label: "Global", color: "bg-[#08A000] text-white" },
        { label: "Free", color: "bg-[#366BCD] text-white" },
      ],
    },
    {
      id: 2,
      name: "Grampay",
      icon: Lock,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-100",
      iconImage: "/img/GramPay.png",
      useImage: true,
      status: "Active",
      schemeId: "#1234",
      created: "23-06-25",
      members: "34",
      tags: [
        { label: "Private", color: "bg-[#9B3FEF] text-white" },
        { label: "N/A", color: "bg-[#969696] text-white" },
      ],
    },
    {
      id: 3,
      name: "Platinum Membership",
      icon: Grid3x3,
      iconColor: "text-orange-600",
      iconBg: "bg-orange-100",
      iconImage: "/img/Platanium.png",
      useImage: true,
      status: "Active",
      schemeId: "#1234",
      created: "23-06-25",
      members: "34",
      tags: [
        { label: "Global", color: "bg-[#08A000] text-white" },
        { label: "Premium", color: "bg-[#D6C407] text-white" },
      ],
    },
    {
      id: 4,
      name: "WL Globe",
      icon: Globe,
      iconColor: "text-green-600",
      iconBg: "bg-green-100",
      iconImage: "/img/WLGlobe.png",
      useImage: true,
      status: "Active",
      schemeId: "#1234",
      created: "23-06-25",
      members: "34",
      tags: [
        { label: "Global", color: "bg-[#08A000] text-white" },
        { label: "Free", color: "bg-[#366BCD] text-white" },
      ],
    },
    {
      id: 5,
      name: "Grampay",
      icon: Lock,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-100",
      iconImage: "/img/GramPay.png",
      useImage: true,
      status: "Active",
      schemeId: "#1234",
      created: "23-06-25",
      members: "34",
      tags: [
        { label: "Private", color: "bg-[#9B3FEF] text-white" },
        { label: "N/A", color: "bg-[#969696] text-white" },
      ],
    },
    {
      id: 6,
      name: "Platinum Membership",
      icon: Grid3x3,
      iconColor: "text-orange-600",
      iconBg: "bg-orange-100",
      iconImage: "/img/Platanium.png",
      useImage: true,
      status: "Active",
      schemeId: "#1234",
      created: "23-06-25",
      members: "34",
      tags: [
        { label: "Global", color: "bg-[#08A000] text-white" },
        { label: "Premium", color: "bg-[#D6C407] text-white" },
      ],
    },
    {
      id: 7,
      name: "WL Globe",
      icon: Globe,
      iconColor: "text-green-600",
      iconBg: "bg-green-100",
      iconImage: "/img/WLGlobe.png",
      useImage: true,
      status: "Active",
      schemeId: "#1234",
      created: "23-06-25",
      members: "34",
      tags: [
        { label: "Global", color: "bg-[#08A000] text-white" },
        { label: "Free", color: "bg-[#366BCD] text-white" },
      ],
    },
    {
      id: 8,
      name: "Grampay",
      icon: Lock,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-100",
      iconImage: "/img/GramPay.png",
      useImage: true,
      status: "Active",
      schemeId: "#1234",
      created: "23-06-25",
      members: "34",
      tags: [
        { label: "Private", color: "bg-[#9B3FEF] text-white" },
        { label: "N/A", color: "bg-[#969696] text-white" },
      ],
    },
    {
      id: 9,
      name: "Platinum Membership",
      icon: Grid3x3,
      iconColor: "text-orange-600",
      iconBg: "bg-orange-100",
      iconImage: "/img/Platanium.png",
      useImage: true,
      status: "Active",
      schemeId: "#1234",
      created: "23-06-25",
      members: "34",
      tags: [
        { label: "Global", color: "bg-[#08A000] text-white" },
        { label: "Premium", color: "bg-[#D6C407] text-white" },
      ],
    },
  ];

  const filters = ["All Schemes", "Global", "Private", "Premium", "Free"];

  const ITEMS_PER_PAGE = 6;

  // 1️⃣ Search + Filter
  const filteredSchemes = schemes.filter((scheme) => {
    const matchesSearch = scheme.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesFilter =
      activeFilter === "All Schemes" ||
      scheme.tags.some(
        (tag) => tag.label.toLowerCase() === activeFilter.toLowerCase(),
      );

    return matchesSearch && matchesFilter;
  });

  // 2️⃣ Pagination
  const totalPages = Math.ceil(filteredSchemes.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const paginatedSchemes = filteredSchemes.slice(startIndex, endIndex);

  // Show EditMembership component when selected
  if (showEditMembership) {
    return (
      <EditMembership
        scheme={selectedScheme}
        onBack={() => {
          setShowEditMembership(false);
          setSelectedScheme(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen py-4 px-2 text-[#1B1717]">
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl md:text-2xl font-[gilroy-medium] text-[#1B1717] mb-1 sm:mb-2">
              Membership Schemes
            </h1>
            <p className="text-sm sm:text-base font-[gilroy-regular] text-[#1B1717]">
              Manage And Monitor All Your Membership Programs
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-4 bg-[#039155] text-white
        px-3 py-2
        sm:px-4 sm:py-2.5
        md:px-4 md:py-3
        rounded-lg font-[gilroy-medium]
        hover:bg-green-700 transition shadow-md
        text-sm sm:text-base
        w-full sm:w-auto"
          >
            <span className="whitespace-nowrap">Create New Scheme</span>

            <div
              className="rounded-full border border-white flex items-center justify-center flex-shrink-0
          w-3 h-3 sm:w-4 sm:h-4"
            >
              <Plus className="w-2 h-2 sm:w-3 sm:h-3" />
            </div>
          </button>
        </div>
      </div>

      {/* Container for Search, Filter, and Scheme Cards */}
      <div className="bg-white rounded-xl sm:rounded-3xl p-3 sm:p-4 md:p-6 shadow-sm mb-4 sm:mb-6">
        {/* Search and Filter Section */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          {/* Search Bar */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#1B1717]/50" />
            <input
              type="text"
              placeholder="Search Scheme"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border-[0.5px] border-[#1B1717]/50 text-[#1B1717]/50 rounded-lg focus:outline-none  text-sm sm:text-base"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-2xl
            text-xs sm:text-sm transition whitespace-nowrap ${
              activeFilter === filter
                ? "bg-[#039155] text-white shadow-md font-[gilroy-semibold]"
                : "bg-white text-[#1B1717]/80 border border-[#1B1717]/80 hover:bg-gray-50 font-[gilroy-medium]"
            }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Scheme Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 items-stretch">
          {paginatedSchemes.map((scheme) => {
            const IconComponent = scheme.icon;
            return (
              <div
                key={scheme.id}
                className="bg-white rounded-lg sm:rounded-3xl border-[0.5px] border-[#1B1717]/80 border-opacity-40 shadow-sm
            px-3 py-2 sm:px-4 sm:py-3 md:px-5 md:py-4
            md:hover:shadow-md transition-shadow flex flex-col h-full"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg flex-shrink-0 ${
                        scheme.useImage ? "" : scheme.iconBg
                      } flex items-center justify-center`}
                    >
                      {scheme.useImage ? (
                        <img
                          src={scheme.iconImage}
                          alt={scheme.name}
                          className="w-full h-full object-contain rounded-lg"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/img/gmaxepay.png";
                          }}
                        />
                      ) : (
                        <IconComponent
                          className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ${scheme.iconColor}`}
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs sm:text-sm md:text-base font-[gilroy-semibold] text-[#1B1717] truncate">
                        {scheme.name}
                      </h3>

                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {scheme.tags.map((tag, index) => (
                          <span
                            key={index}
                            className={`px-2 py-0.5 rounded-2xl text-[10px] font-[gilroy-regular] ${tag.color}`}
                          >
                            {tag.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div
                    className="flex items-center bg-[#008D1E] rounded-3xl
              px-2 py-1 sm:px-3 sm:py-1.5 gap-1 sm:gap-1.5 flex-shrink-0 mt-2"
                  >
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white" />
                    <span className="text-xs font-[gilroy-medium] text-white whitespace-nowrap">
                      {scheme.status}
                    </span>
                  </div>
                </div>

                {/* Scheme Details */}
                <div className="space-y-2 sm:space-y-3 md:space-y-4 mb-4 sm:mb-6 flex-grow">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-[#1B1717]/80 font-[gilroy-regular]">
                      Scheme Id
                    </span>
                    <span className="font-[gilroy-medium] text-[#1B1717]">
                      {scheme.schemeId}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-[#1B1717]/80 font-[gilroy-regular]">
                      Created
                    </span>
                    <span className="font-[gilroy-medium] text-[#1B1717]">
                      {scheme.created}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-[#1B1717]/80 font-[gilroy-regular]">
                      Members
                    </span>
                    <span className="font-[gilroy-medium] text-[#1B1717]">
                      {scheme.members}
                    </span>
                  </div>
                </div>

                {/* View Details Button */}
                <button
                  onClick={() => {
                    setSelectedScheme(scheme);
                    setShowEditMembership(true);
                  }}
                  className="w-full bg-[#039155] text-white py-2.5 sm:py-3 md:py-4 rounded-xl font-[gilroy-semibold] hover:bg-green-700 transition text-sm sm:text-base mt-auto"
                >
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
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          className="p-2 sm:p-2.5 rounded-md border-[0.5px] border-[#121216]/54 bg-white text-[#121216] hover:bg-gray-50 transition"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-md font-[gilroy-regular] transition text-sm sm:text-base ${
              currentPage === page
                ? "bg-[#039155] text-white"
                : "bg-white border-[0.5px] border-[#121216]/54 text-[#1B1717] hover:bg-gray-50"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(totalPages, prev + 1))
          }
          className="p-2 sm:p-2.5 rounded-md border-[0.5px] border-[#121216]/54 bg-white text-[#121216] hover:bg-gray-50 transition"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Create New Membership Scheme Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-[#D9D9D9]/80 flex items-center justify-center z-50 
               p-2 xs:p-3 sm:p-4 md:p-6"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            ref={modalRef}
            className="bg-white rounded-lg sm:rounded-xl shadow-2xl 
                 w-full max-w-md sm:max-w-lg xl:max-w-xl
                 max-h-[96vh] sm:max-h-[92vh] 
                 flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              className="relative bg-white flex items-center justify-center
                   px-3 py-3 xs:px-4 sm:px-6 sm:py-4
                   border-b border-gray-100"
            >
              <div className="flex-1 min-w-0 text-center px-8 sm:px-12">
                <h2
                  className="text-sm xs:text-base sm:text-xl md:text-2xl 
                         font-[gilroy-medium] text-[#1B1717] leading-snug"
                >
                  Create New Membership Scheme
                </h2>

                <p
                  className="mt-1 text-[11px] xs:text-xs sm:text-sm 
                        text-[#1B1717]/70 font-[gilroy-regular] leading-relaxed"
                >
                  Configure Your New Membership Program <br />
                  With Custom Settings And Features
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4
                     bg-[#039155] text-white rounded-lg
                     w-7 h-7 sm:w-8 sm:h-8
                     flex items-center justify-center
                     hover:bg-green-700 transition"
              >
                <div
                  className="border border-white rounded-full
                       w-4 h-4 sm:w-5 sm:h-5
                       flex items-center justify-center"
                >
                  <span className="text-[10px] sm:text-xs leading-none">×</span>
                </div>
              </button>
            </div>

            {/* Modal Content */}
            <div
              className="flex-1 overflow-y-auto 
                   px-3 xs:px-4 sm:px-6
                   py-4 sm:py-5
                   space-y-4 sm:space-y-6"
            >
              {/* Basic Information */}
              <div>
                <h3 className="text-sm sm:text-base font-[gilroy-semibold] text-[#1B1717] mb-3">
                  Basic Information
                </h3>

                <label className="block text-xs sm:text-sm font-[gilroy-medium] text-[#121216] mb-1.5">
                  Scheme Name <span>*</span>
                </label>

                <input
                  type="text"
                  placeholder="Enter Scheme Name"
                  value={formData.schemeName}
                  onChange={(e) =>
                    setFormData({ ...formData, schemeName: e.target.value })
                  }
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3
                       border border-[#1B1717]/70 rounded-lg
                       font-[gilroy-medium] text-sm sm:text-base
                       focus:outline-none focus:ring-2 focus:ring-[#039155]"
                />
              </div>

              {/* Scheme Configuration */}
              <div>
                <h3 className="text-sm sm:text-base font-[gilroy-semibold] text-[#1B1717] mb-3 sm:mb-4">
                  Scheme Configuration
                </h3>

                {/* Scheme Mode */}
                <div className="mb-4 sm:mb-5">
                  <label className="block text-xs sm:text-sm font-[gilroy-medium] mb-2">
                    Scheme Mode *
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {["Global", "Private"].map((mode) => (
                      <label
                        key={mode}
                        className={`flex gap-3 p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition
                    ${
                      formData.schemeMode === mode
                        ? "border-[#039155] bg-green-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                      >
                        <input
                          type="radio"
                          name="schemeMode"
                          value={mode}
                          checked={formData.schemeMode === mode}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              schemeMode: e.target.value,
                            })
                          }
                          className="sr-only"
                        />

                        <div
                          className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center
                      ${
                        formData.schemeMode === mode
                          ? "border-[#039155] bg-[#039155]"
                          : "border-gray-300"
                      }`}
                        >
                          {formData.schemeMode === mode && (
                            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white rounded-full" />
                          )}
                        </div>

                        <div>
                          <span className="block text-xs sm:text-sm font-[gilroy-medium]">
                            {mode}
                          </span>
                          <p className="text-[11px] text-[#1B1717]/70">
                            {mode === "Global"
                              ? "Available To All Users Worldwide"
                              : "Restricted To Specific Users"}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Scheme Type */}
                <div className="mb-4 sm:mb-5">
                  <label className="block text-xs sm:text-sm font-[gilroy-medium] mb-2">
                    Scheme Type
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {["Free", "Premium"].map((type) => (
                      <label
                        key={type}
                        className={`flex gap-3 p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition
                    ${
                      formData.schemeType === type
                        ? "border-[#039155] bg-green-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                      >
                        <input
                          type="radio"
                          name="schemeType"
                          value={type}
                          checked={formData.schemeType === type}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              schemeType: e.target.value,
                            })
                          }
                          className="sr-only"
                        />

                        <div
                          className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center
                      ${
                        formData.schemeType === type
                          ? "border-[#039155] bg-[#039155]"
                          : "border-gray-300"
                      }`}
                        >
                          {formData.schemeType === type && (
                            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white rounded-full" />
                          )}
                        </div>

                        <div>
                          <span className="block text-xs sm:text-sm font-[gilroy-medium]">
                            {type}
                          </span>
                          <p className="text-[11px] text-[#1B1717]/70">
                            {type === "Free"
                              ? "No Cost Membership"
                              : "Restricted Access With Invitation Only"}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Subscription & Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Subscription Type */}
                <div ref={dropdownRef} className="relative">
                  <label className="block text-xs sm:text-sm font-[gilroy-medium] mb-1.5">
                    Subscription Type
                  </label>

                  <input
                    readOnly
                    value={formData.subscriptionType}
                    placeholder="Select Subscription Type"
                    onClick={() =>
                      setIsSubscriptionDropdownOpen(!isSubscriptionDropdownOpen)
                    }
                    className="w-full px-3 sm:px-4 py-3 sm:py-4
                         border border-[#1B1717]/70 rounded-lg
                         text-sm sm:text-base cursor-pointer"
                  />

                  {isSubscriptionDropdownOpen && (
                    <div className="absolute z-20 w-full mt-1 bg-white border rounded-lg shadow max-h-44 overflow-y-auto">
                      {["Monthly", "Yearly", "Lifetime"].map((item) => (
                        <div
                          key={item}
                          onClick={() => {
                            setFormData({
                              ...formData,
                              subscriptionType: item,
                            });
                            setIsSubscriptionDropdownOpen(false);
                          }}
                          className="px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Premium Amount */}
                <div>
                  <label className="block text-xs sm:text-sm font-[gilroy-medium] mb-1.5">
                    Premium Amount
                  </label>

                  <input
                    type="number"
                    value={formData.premiumAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        premiumAmount: e.target.value,
                      })
                    }
                    placeholder="Enter Premium Amount"
                    className="w-full px-3 sm:px-4 py-3 sm:py-4
                         border border-[#1B1717]/70 rounded-lg
                         text-sm sm:text-base"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-white border-t px-4 sm:px-6 py-3 flex gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 h-12 border border-[#1B1717]/60 rounded-xl
                     text-[#1B1717]/80 hover:bg-gray-50 transition"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  console.log("Creating scheme:", formData);
                  setIsModalOpen(false);
                }}
                className="flex-1 h-12 bg-[#039155] hover:bg-[#027A47]
                     text-white rounded-xl transition"
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
