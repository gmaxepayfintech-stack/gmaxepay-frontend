import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Globe,
  Lock,
  Grid3x3,
  X,
  Check,
  Pencil,
  ChevronDown,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useCompany } from "../../../context/CompanyContext";
import { useNotification } from "../../../context/NotificationContext";
import {
  createUserSlab,
  getUserSlabList,
  updateUserSlab,
} from "../../../redux/action/slabAction";
import { getReportToDownline } from "../../../redux/action/whiteLabelAction";
import EditMembership from "./EditMembership";
import { ButtonLoader } from "../../../widgets/layout/loader";

const SchemeMaster = () => {
  const dispatch = useDispatch();
  const { company } = useCompany();
  const { success, error: showError } = useNotification();
  const companyFromRedux = useSelector((state) => state?.company?.company);
  const companyData = companyFromRedux || company;

  // Redux state
  const slabState = useSelector((state) => state?.slab);
  const {
    slabs,
    loading: slabsLoading,
    createSlabSuccess,
    createSlabMessage,
    createSlabError,
    updateSlabSuccess,
    updateSlabMessage,
    updateSlabError,
  } = slabState || {};
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const userModalRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Schemes");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [showEditMembership, setShowEditMembership] = useState(false);
  const [formData, setFormData] = useState({
    schemeName: "",
    schemeMode: "Global",
    schemeType: "Free",
    subscriptionAmount: "",
    views: [],
  });
  const modalRef = useRef(null);

  const [showUserSelectionModal, setShowUserSelectionModal] = useState(false);
  const [activeUserTab, setActiveUserTab] = useState("retailer");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [debouncedUserSearchQuery, setDebouncedUserSearchQuery] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [selectedUsersData, setSelectedUsersData] = useState([]);

  // Get company ID
  const getCompanyId = () => {
    return (
      companyData?.companyId || companyData?._id || companyData?.id || null
    );
  };

  // Fetch slabs on component mount and when page changes
  useEffect(() => {
    const companyId = getCompanyId();
    if (companyId) {
      const customSearch = searchQuery ? { slabName: searchQuery } : {};
      dispatch(getUserSlabList(companyId, currentPage, 6, customSearch));
    }
  }, [dispatch, currentPage]);

  // Handle create success
  useEffect(() => {
    if (createSlabSuccess && createSlabMessage) {
      success(createSlabMessage || "Slab created successfully");
      setIsModalOpen(false);
      setFormData({
        schemeName: "",
        schemeMode: "Global",
        schemeType: "Free",
        subscriptionAmount: "",
        views: [],
      });
      setSelectedUserIds([]);
      setSelectedUsersData([]);
      // Reset to first page after creating (this will trigger fetch via the other useEffect)
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        // If already on page 1, explicitly fetch to refresh
        const companyId = getCompanyId();
        if (companyId) {
          const customSearch = searchQuery ? { slabName: searchQuery } : {};
          dispatch(getUserSlabList(companyId, 1, 6, customSearch));
        }
      }
    }
  }, [
    createSlabSuccess,
    createSlabMessage,
    dispatch,
    currentPage,
    success,
    searchQuery,
  ]);

  // Handle create error
  useEffect(() => {
    if (createSlabError) {
      showError(createSlabError);
    }
  }, [createSlabError, showError]);

  // Handle update success
  useEffect(() => {
    if (updateSlabSuccess && updateSlabMessage) {
      success(updateSlabMessage || "Slab updated successfully");
      setIsEditModalOpen(false);
      setSelectedScheme(null);
      setFormData({
        schemeName: "",
        schemeMode: "Global",
        schemeType: "Free",
        subscriptionAmount: "",
        views: [],
      });
      setSelectedUserIds([]);
      setSelectedUsersData([]);

      // Refresh current page (and keep search)
      const companyId = getCompanyId();
      if (companyId) {
        const customSearch = searchQuery ? { slabName: searchQuery } : {};
        dispatch(getUserSlabList(companyId, currentPage, 6, customSearch));
      }
    }
  }, [
    updateSlabSuccess,
    updateSlabMessage,
    dispatch,
    success,
    searchQuery,
    currentPage,
  ]);

  // Handle update error
  useEffect(() => {
    if (updateSlabError) {
      showError(updateSlabError);
    }
  }, [updateSlabError, showError]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserSelectionModal) return;
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        if (
          userModalRef.current &&
          !userModalRef.current.contains(event.target)
        ) {
          setIsModalOpen(false);
          setIsEditModalOpen(false);
        }
      }
    };
    if (isModalOpen || isEditModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen, isEditModalOpen, showUserSelectionModal]);

  // Debounce user search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUserSearchQuery(userSearchQuery);
      setUserPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [userSearchQuery]);

  //Reset page when search or filter changes and refetch
  useEffect(() => {
    setCurrentPage(1);
    const companyId = getCompanyId();
    if (companyId) {
      const customSearch = searchQuery ? { slabName: searchQuery } : {};
      dispatch(getUserSlabList(companyId, 1, 6, customSearch));
    }
  }, [searchQuery, activeFilter, dispatch]);

  // Fetch users when user selection modal opens
  useEffect(() => {
    if (!showUserSelectionModal) return;
    const companyId = getCompanyId();
    if (!companyId) return;

    const roleMap = {
      retailer: 5,
    };
    const userRole = roleMap[activeUserTab] || 5; // default to retailer if missing

    const payload = {
      query: { userRole },
      customSearch: debouncedUserSearchQuery.trim()
        ? {
            mobileNo: debouncedUserSearchQuery.trim(),
            name: debouncedUserSearchQuery.trim(),
          }
        : {},
      options: {
        page: userPage,
        paginate: 10,
        order: [["name", "ASC"]],
      },
    };

    dispatch(getReportToDownline({ ...payload, companyId }));
  }, [
    showUserSelectionModal,
    activeUserTab,
    userPage,
    debouncedUserSearchQuery,
    dispatch,
  ]);

  // Reset user search when modal closes
  useEffect(() => {
    if (showUserSelectionModal) return;
    setUserSearchQuery("");
    setDebouncedUserSearchQuery("");
    setUserPage(1);
    setActiveUserTab("retailer");
  }, [showUserSelectionModal]);

  // Get users list from Redux
  const usersListRaw = useSelector(
    (state) =>
      state?.whitelabel?.reportToDownlineList?.reportToDownlineList || [],
  );
  const usersList = useMemo(
    () => (Array.isArray(usersListRaw) ? usersListRaw : []),
    [usersListRaw],
  );
  const usersLoading = useSelector(
    (state) => state?.loading?.isLoading || false,
  );
  const usersTotalCount = useSelector((state) => {
    const response = state?.whitelabel?.reportToDownlineList;
    return response?.totalCount || usersList.length || 0;
  });
  const usersTotalPages = Math.ceil(usersTotalCount / 10) || 1;

  const handleUserToggle = (user) => {
    const userId = user.id || user._id;
    if (!userId) return;

    setSelectedUserIds((prev) => {
      if (prev.includes(userId)) {
        setSelectedUsersData((prevData) =>
          prevData.filter((u) => (u.id || u._id) !== userId),
        );
        return prev.filter((id) => id !== userId);
      }

      setSelectedUsersData((prevData) => {
        const existingIds = prevData.map((u) => u.id || u._id);
        if (existingIds.includes(userId)) return prevData;
        return [...prevData, user];
      });
      return [...prev, userId];
    });
  };

  const handleSelectAllUsers = () => {
    const currentTabUserIds = usersList
      .map((u) => u.id || u._id)
      .filter(Boolean);
    const uniqueCurrentTabUserIds = [...new Set(currentTabUserIds)];
    const allCurrentTabSelected =
      uniqueCurrentTabUserIds.length > 0 &&
      uniqueCurrentTabUserIds.every((id) => selectedUserIds.includes(id));

    if (allCurrentTabSelected) {
      setSelectedUserIds((prev) =>
        prev.filter((id) => !uniqueCurrentTabUserIds.includes(id)),
      );
      setSelectedUsersData((prev) =>
        prev.filter((u) => !uniqueCurrentTabUserIds.includes(u.id || u._id)),
      );
      return;
    }

    const uniqueUsers = usersList.filter((user, index, self) => {
      const id = user.id || user._id;
      return index === self.findIndex((u) => (u.id || u._id) === id);
    });

    setSelectedUserIds((prev) => [
      ...new Set([...prev, ...uniqueCurrentTabUserIds]),
    ]);
    setSelectedUsersData((prev) => {
      const existingIds = prev.map((u) => u.id || u._id);
      const newUsers = uniqueUsers.filter(
        (u) => !existingIds.includes(u.id || u._id),
      );
      return [...prev, ...newUsers];
    });
  };

  const handleConfirmUserSelection = () => {
    setFormData((prev) => ({
      ...prev,
      views: selectedUserIds,
    }));
    setShowUserSelectionModal(false);
  };

  const getSelectedUsersDisplay = () => {
    if (selectedUsersData.length === 0) return "";
    if (selectedUsersData.length === 1) {
      const u = selectedUsersData[0];
      return `${u.name || "N/A"} - ${u.mobileNo || u.mobile || "N/A"}`;
    }
    return `${selectedUsersData.length} users selected`;
  };

  // Map API slabs to scheme format
  const mapSlabToScheme = (slab) => {
    const getIcon = (schemaType, schemaMode) => {
      if (schemaType === "free" && schemaMode === "global") {
        return {
          icon: Globe,
          iconColor: "text-green-600",
          iconBg: "bg-green-100",
          iconImage: "/img/WLGlobe.png",
          useImage: true,
        };
      } else if (schemaMode === "private") {
        return {
          icon: Lock,
          iconColor: "text-purple-600",
          iconBg: "bg-purple-100",
          iconImage: "/img/GramPay.png",
          useImage: true,
        };
      } else {
        return {
          icon: Grid3x3,
          iconColor: "text-orange-600",
          iconBg: "bg-orange-100",
          iconImage: "/img/Platanium.png",
          useImage: true,
        };
      }
    };

    const iconData = getIcon(slab.schemaType, slab.schemaMode);
    const createdAt = slab.createdAt
      ? new Date(slab.createdAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        })
      : "N/A";

    return {
      id: slab.id,
      name: slab.slabName,
      ...iconData,
      status: slab.isActive ? "Active" : "Inactive",
      isActive: slab.isActive ?? true,
      schemeId: `#${slab.id}`,
      created: createdAt,
      members: slab.totalUsers?.toString() || "0",
      tags: [
        {
          label: slab.schemaMode === "global" ? "Global" : "Private",
          color:
            slab.schemaMode === "global"
              ? "bg-[#08A000] text-white"
              : "bg-[#9B3FEF] text-white",
        },
        {
          label: slab.schemaType === "free" ? "Free" : "Premium",
          color:
            slab.schemaType === "free"
              ? "bg-[#366BCD] text-white"
              : "bg-[#D6C407] text-white",
        },
      ],
      ...slab, // Include original slab data
    };
  };

  const schemes = (slabs || []).map(mapSlabToScheme);

  const filters = ["All Schemes", "Global", "Private", "Premium", "Free"];

  // 1️⃣ Search + Filter (works on current page data)
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

  // 2️⃣ Use API paginator for total pages
  const paginator = slabState?.paginator || {};
  const totalPages = paginator.pageCount || 1;

  // Display filtered schemes (search/filter works on current page)
  const paginatedSchemes = filteredSchemes;

  // Handle create slab
  const handleCreateSlab = async (e) => {
    e?.preventDefault?.();
    const companyId = getCompanyId();
    if (!companyId) {
      showError("Company ID not found. Please refresh the page.");
      return;
    }

    if (!formData.schemeName || !formData.schemeName.trim()) {
      showError("Please enter a scheme name");
      return;
    }

    // Validate private mode requires views
    if (
      formData.schemeMode === "Private" &&
      (!formData.views || formData.views.length === 0)
    ) {
      showError("Please select at least one user for private schemes");
      return;
    }

    // Validate premium type requires subscription amount
    if (formData.schemeType === "Premium") {
      const amount = formData.subscriptionAmount;
      if (
        amount === null ||
        amount === undefined ||
        amount === "" ||
        isNaN(parseFloat(amount)) ||
        parseFloat(amount) < 0
      ) {
        showError(
          "Please enter a valid subscription amount for premium schemes",
        );
        return;
      }
    }

    const slabDataToSend = {
      ...formData,
      views: formData.views || [],
      subscriptionAmount: formData.subscriptionAmount
        ? parseFloat(formData.subscriptionAmount)
        : 0,
    };

    setIsCreating(true);
    try {
      const result = await dispatch(createUserSlab(slabDataToSend, companyId));
      if (!result?.success) {
        showError(
          result?.message || "Failed to create slab. Please try again.",
        );
      }
    } catch (error) {
      showError(
        error?.message ||
          "An error occurred while creating the slab. Please try again.",
      );
    } finally {
      setIsCreating(false);
    }
  };

  // Handle update slab
  const handleUpdateSlab = async (e) => {
    e?.preventDefault?.();
    const companyId = getCompanyId();
    if (!companyId) {
      showError("Company ID not found. Please refresh the page.");
      return;
    }

    if (!selectedScheme?.id) {
      showError("No scheme selected. Please try again.");
      return;
    }

    if (!formData.schemeName || !formData.schemeName.trim()) {
      showError("Please enter a scheme name");
      return;
    }

    // Validate private mode requires views
    if (
      formData.schemeMode === "Private" &&
      (!formData.views || formData.views.length === 0)
    ) {
      showError("Please select at least one user for private schemes");
      return;
    }

    // Validate premium type requires subscription amount
    if (formData.schemeType === "Premium") {
      const amount = formData.subscriptionAmount;
      if (
        amount === null ||
        amount === undefined ||
        amount === "" ||
        isNaN(parseFloat(amount)) ||
        parseFloat(amount) < 0
      ) {
        showError(
          "Please enter a valid subscription amount for premium schemes",
        );
        return;
      }
    }

    const slabDataToSend = {
      ...formData,
      views: formData.views || [],
      subscriptionAmount: formData.subscriptionAmount
        ? parseFloat(formData.subscriptionAmount)
        : 0,
    };

    setIsUpdating(true);
    try {
      const result = await dispatch(
        updateUserSlab(selectedScheme.id, slabDataToSend, companyId),
      );
      if (!result?.success) {
        showError(
          result?.message || "Failed to update slab. Please try again.",
        );
      }
    } catch (error) {
      showError(
        error?.message ||
          "An error occurred while updating the slab. Please try again.",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Skeleton loader component
  const SchemeSkeleton = () => (
    <div className="bg-white rounded-lg sm:rounded-3xl border-[0.5px] border-[#1B1717]/80 border-opacity-40 shadow-sm px-3 py-2 sm:px-4 sm:py-3 md:px-5 md:py-4 flex flex-col h-full animate-pulse">
      <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg bg-gray-200 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="flex gap-2">
              <div className="h-5 bg-gray-200 rounded-full w-16" />
              <div className="h-5 bg-gray-200 rounded-full w-16" />
            </div>
          </div>
        </div>
        <div className="h-6 bg-gray-200 rounded-3xl w-20 flex-shrink-0" />
      </div>
      <div className="space-y-2 sm:space-y-3 md:space-y-4 mb-4 sm:mb-6 flex-grow">
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-20" />
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-20" />
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-20" />
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>
      </div>
      <div className="h-10 bg-gray-200 rounded-xl w-full" />
    </div>
  );

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
          {slabsLoading ? (
            // Show skeleton loaders
            Array.from({ length: 6 }).map((_, index) => (
              <SchemeSkeleton key={index} />
            ))
          ) : paginatedSchemes.length === 0 ? (
            <div className="col-span-full text-center py-8 text-[#1B1717]/60">
              No schemes found
            </div>
          ) : (
            paginatedSchemes.map((scheme) => {
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

                    {/* Status Indicator and Edit Button */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedScheme(scheme);
                          setFormData({
                            schemeName: scheme.name || "",
                            schemeMode: scheme?.schemaMode
                              ? scheme.schemaMode === "global"
                                ? "Global"
                                : "Private"
                              : scheme?.visibilityType || "Global",
                            schemeType: scheme?.schemaType
                              ? scheme.schemaType === "free"
                                ? "Free"
                                : "Premium"
                              : "Free",
                            subscriptionAmount:
                              scheme?.subscriptionAmount !== undefined &&
                              scheme?.subscriptionAmount !== null
                                ? String(scheme.subscriptionAmount)
                                : "",
                            views: Array.isArray(scheme?.views)
                              ? scheme.views
                              : [],
                          });

                          // Sync selection state for modal
                          const viewIds = Array.isArray(scheme?.views)
                            ? scheme.views
                            : [];
                          setSelectedUserIds(viewIds);

                          // Try to preload user objects for display from current usersList
                          if (viewIds.length > 0) {
                            const existingUsers = usersList.filter((u) =>
                              viewIds.includes(u.id || u._id),
                            );
                            const uniqueUsers = existingUsers.filter(
                              (user, index, self) => {
                                const id = user.id || user._id;
                                return (
                                  index ===
                                  self.findIndex((u) => (u.id || u._id) === id)
                                );
                              },
                            );
                            setSelectedUsersData(uniqueUsers);
                          } else {
                            setSelectedUsersData([]);
                          }

                          // Ensure user selection modal defaults to Retailer when editing and reset paging/search
                          setActiveUserTab("retailer");
                          setUserPage(1);
                          setUserSearchQuery("");
                          setDebouncedUserSearchQuery("");

                          setIsEditModalOpen(true);
                        }}
                        className="p-1.5 sm:p-2 rounded-full bg-[#039155] hover:bg-green-700 transition text-white flex items-center justify-center"
                        title="Edit Scheme"
                        type="button"
                      >
                        <Pencil className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>

                      <div
                        className={`flex items-center rounded-3xl
              px-2 py-1 sm:px-3 sm:py-1.5 gap-1 sm:gap-1.5 flex-shrink-0
              ${scheme.isActive ? "bg-[#008D1E]" : "bg-gray-500"}`}
                      >
                        <div
                          className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${scheme.isActive ? "bg-white" : "bg-white"}`}
                        />
                        <span className="text-xs font-[gilroy-medium] text-white whitespace-nowrap">
                          {scheme.status}
                        </span>
                      </div>
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
            })
          )}
        </div>
      </div>

      {/* Pagination */}
      {!slabsLoading && totalPages > 0 && (
        <div className="flex items-center justify-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-2 sm:p-2.5 rounded-md border-[0.5px] border-[#121216]/54 bg-white text-[#121216] hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
            disabled={currentPage === totalPages}
            className="p-2 sm:p-2.5 rounded-md border-[0.5px] border-[#121216]/54 bg-white text-[#121216] hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      )}

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
                              // Clear views when switching to Global
                              views:
                                e.target.value === "Global"
                                  ? []
                                  : formData.views,
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
                              // Clear subscriptionAmount when switching to Free
                              subscriptionAmount:
                                e.target.value === "Free"
                                  ? ""
                                  : formData.subscriptionAmount,
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

                {/* Subscription Amount for Premium */}
                {formData.schemeType === "Premium" && (
                  <div className="mb-4 sm:mb-5">
                    <label className="block text-xs sm:text-sm font-[gilroy-medium] text-[#121216] mb-1.5">
                      Subscription Amount{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      placeholder="Enter subscription amount"
                      value={formData.subscriptionAmount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          subscriptionAmount: e.target.value,
                        })
                      }
                      min="0"
                      step="0.01"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3
                       border border-[#1B1717]/70 rounded-lg
                       font-[gilroy-medium] text-sm sm:text-base
                       focus:outline-none focus:ring-2 focus:ring-[#039155]"
                    />
                  </div>
                )}

                {/* User Selection for Private Mode */}
                {formData.schemeMode === "Private" && (
                  <div className="mb-4 sm:mb-5">
                    <label className="block text-xs sm:text-sm font-[gilroy-medium] text-[#121216] mb-1.5">
                      Select Users <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        // Open selection modal on Retailer tab and preload any existing views from the form
                        const existingViews = formData.views || [];
                        const uniqueViews = [...new Set(existingViews)];
                        if (uniqueViews.length > 0) {
                          const existingUsers = usersList.filter((user) =>
                            uniqueViews.includes(user.id || user._id),
                          );
                          const uniqueUsers = existingUsers.filter(
                            (user, index, self) => {
                              const userId = user.id || user._id;
                              return (
                                index ===
                                self.findIndex(
                                  (u) => (u.id || u._id) === userId,
                                )
                              );
                            },
                          );
                          setSelectedUserIds(uniqueViews);
                          setSelectedUsersData(uniqueUsers);
                        } else {
                          setSelectedUserIds([]);
                          setSelectedUsersData([]);
                        }

                        setActiveUserTab("retailer");
                        setUserPage(1);
                        setUserSearchQuery("");
                        setDebouncedUserSearchQuery("");
                        setShowUserSelectionModal(true);
                      }}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3
                       border border-[#1B1717]/70 rounded-lg
                       font-[gilroy-medium] text-sm sm:text-base
                       focus:outline-none focus:ring-2 focus:ring-[#039155]"
                    >
                      {selectedUsersData.length > 0 ? (
                        <span className="truncate">
                          {getSelectedUsersDisplay()}
                        </span>
                      ) : (
                        <span className="text-[#1B1717]/50">
                          Click to select users
                        </span>
                      )}
                    </button>
                    {selectedUsersData.length > 0 && (
                      <p className="text-xs text-[#1B1717]/70 mt-1">
                        {selectedUsersData.length} user(s) selected
                      </p>
                    )}
                  </div>
                )}
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
                type="button"
                onClick={handleCreateSlab}
                disabled={isCreating || slabsLoading}
                className="flex-1 h-12 bg-[#039155] hover:bg-[#027A47]
                     text-white rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <>
                    <ButtonLoader color="#FFFFFF" size={20} thickness={3} />
                    <span>Creating...</span>
                  </>
                ) : (
                  "Create"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Selection Modal */}
      {showUserSelectionModal && (
        <div
          className="fixed inset-0 bg-[#D9D9D9]/80 flex items-center justify-center z-[60] 
               p-2 xs:p-3 sm:p-4 md:p-6"
          onClick={() => setShowUserSelectionModal(false)}
        >
          <div
            ref={userModalRef}
            className="bg-white rounded-lg sm:rounded-xl shadow-2xl 
                 w-full max-w-md sm:max-w-lg xl:max-w-xl
                 max-h-[96vh] sm:max-h-[92vh] 
                 flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative bg-white flex items-center justify-center px-3 py-3 xs:px-4 sm:px-6 sm:py-4 border-b border-gray-100">
              <div className="flex-1 min-w-0 text-center px-8 sm:px-12">
                <h2 className="text-sm xs:text-base sm:text-xl md:text-2xl font-[gilroy-medium] text-[#1B1717] leading-snug">
                  Select Users
                </h2>
                <p className="mt-1 text-[11px] xs:text-xs sm:text-sm text-[#1B1717]/70 font-[gilroy-regular] leading-relaxed">
                  Choose users who can access this private scheme
                </p>
              </div>
              <button
                onClick={() => setShowUserSelectionModal(false)}
                className="absolute right-3 top-3 w-10 h-10 flex items-center justify-center rounded-xl bg-[#039155] hover:opacity-90 transition"
                type="button"
              >
                <X className="w-6 h-6 text-[#FFFFFF] rounded-full border-[2.5px] border-[#FFFFFF] p-0.5" />
              </button>
            </div>

            {/* Retailer-only Header */}
            <div className="bg-gray-50 border-b border-gray-200 px-4 sm:px-6 py-3">
              <div className="relative bg-white rounded-xl p-1.5 flex shadow-sm border border-gray-200">
                <div
                  className="absolute inset-1 bg-[#039155] rounded-lg transition-all duration-300 ease-in-out shadow-md"
                  style={{
                    width: `calc(100% - 0.75rem)`,
                    left: "0.375rem",
                  }}
                />
                <button
                  onClick={() => {
                    setActiveUserTab("retailer");
                    setUserPage(1);
                    setUserSearchQuery("");
                    setDebouncedUserSearchQuery("");
                  }}
                  className="relative z-10 w-full px-3 py-2.5 rounded-lg font-[gilroy-medium] text-xs sm:text-sm text-white"
                  type="button"
                >
                  Retailer
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto px-3 xs:px-4 sm:px-6 py-4 sm:py-5 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#1B1717]/50" />
                <input
                  type="text"
                  placeholder="Search by name or mobile number"
                  value={userSearchQuery}
                  onChange={(e) => {
                    setUserSearchQuery(e.target.value);
                    setUserPage(1);
                  }}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border-[0.5px] border-[#1B1717]/50 text-[#1B1717]/50 rounded-lg focus:outline-none text-sm sm:text-base"
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={handleSelectAllUsers}
                  className="text-xs sm:text-sm text-[#039155] font-[gilroy-medium] hover:underline"
                  type="button"
                >
                  {(() => {
                    const currentTabUserIds = usersList
                      .map((u) => u.id || u._id)
                      .filter(Boolean);
                    const uniqueIds = [...new Set(currentTabUserIds)];
                    const allSelected =
                      uniqueIds.length > 0 &&
                      uniqueIds.every((id) => selectedUserIds.includes(id));
                    return allSelected ? "Deselect All" : "Select All";
                  })()}
                </button>
                <span className="text-xs sm:text-sm text-[#1B1717]/70 font-[gilroy-regular]">
                  {selectedUserIds.length} selected
                </span>
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {usersLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <ButtonLoader size={28} thickness={3} />
                  </div>
                ) : usersList.length === 0 ? (
                  <div className="text-center py-8 text-[#1B1717]/60">
                    No users found
                  </div>
                ) : (
                  usersList.map((user) => {
                    const userId = user.id || user._id;
                    const isSelected = selectedUserIds.includes(userId);
                    return (
                      <label
                        key={userId}
                        className={`flex items-center gap-3 p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition ${
                          isSelected
                            ? "border-[#039155] bg-green-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleUserToggle(user)}
                          className="sr-only"
                        />
                        <div
                          className={`w-5 h-5 sm:w-6 sm:h-6 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                            isSelected
                              ? "border-[#039155] bg-[#039155]"
                              : "border-gray-300"
                          }`}
                        >
                          {isSelected && (
                            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm sm:text-base font-[gilroy-medium] text-[#1B1717]">
                            {user.name || "N/A"}
                          </div>
                          <div className="text-xs sm:text-sm text-[#1B1717]/70 font-[gilroy-regular]">
                            {user.mobileNo || user.mobile || "N/A"}
                          </div>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>

              {!usersLoading && usersTotalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 pt-4">
                  <button
                    onClick={() => setUserPage((prev) => Math.max(1, prev - 1))}
                    disabled={userPage === 1}
                    className="p-2 sm:p-2.5 rounded-md border-[0.5px] border-[#121216]/54 bg-white text-[#121216] hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    type="button"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>

                  {Array.from({ length: usersTotalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setUserPage(page)}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-md font-[gilroy-regular] transition text-sm sm:text-base ${
                          userPage === page
                            ? "bg-[#039155] text-white"
                            : "bg-white border-[0.5px] border-[#121216]/54 text-[#1B1717] hover:bg-gray-50"
                        }`}
                        type="button"
                      >
                        {page}
                      </button>
                    ),
                  )}

                  <button
                    onClick={() =>
                      setUserPage((prev) => Math.min(usersTotalPages, prev + 1))
                    }
                    disabled={userPage === usersTotalPages}
                    className="p-2 sm:p-2.5 rounded-md border-[0.5px] border-[#121216]/54 bg-white text-[#121216] hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    type="button"
                  >
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-white border-t px-4 sm:px-6 py-3 flex gap-3">
              <button
                onClick={() => setShowUserSelectionModal(false)}
                className="flex-1 h-12 border border-[#1B1717]/60 rounded-xl text-[#1B1717]/80 hover:bg-gray-50 transition"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUserSelection}
                className="flex-1 h-12 bg-[#039155] hover:bg-[#027A47] text-white rounded-xl transition flex items-center justify-center gap-2"
                type="button"
              >
                Confirm ({selectedUserIds.length} selected)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchemeMaster;
