import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Plus, ChevronLeft, ChevronRight, ChevronDown, X } from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import {
  getAllBBPSBillers,
  searchBBPSBillers,
  getCategoriesForDropdown,
  getAllBBPSPaymentInfo,
  createBBPSBiller,
  updateBBPSBiller,
} from '../../redux/action/bbpsAction';

// Icon mapping for categories (same as BBPSSettings)
const categoryIconMap = {
  "Broadband Postpaid": "/img/Broadband.svg",
  "Cable TV": "/img/Cable.svg",
  "Clubs And Associations": "/img/Club.svg",
  "Donation": "/img/Donation.svg",
  "DTH": "/img/DTH.svg",
  "Electricity": "/img/Electricity.svg",
  "Credit Card": "/img/CreditCard.svg",
  "Education Fee": "/img/Education.svg",
  "Fast Tag": "/img/FastTag.svg",
  "Housing Society": "/img/Housing.svg",
  "Insurance": "/img/Insurance.svg",
  "Life Insurance": "/img/LifeInsurance.svg",
  "Gas": "/img/Gas.svg",
  "Hospital & Pathology": "/img/Hospitality.svg",
  "Hospital": "/img/Hospital.svg",
  "Health Insurance": "/img/HealthInsurance.svg",
  "Landline Post-Paid": "/img/Landline.svg",
  "Loan Repayment": "/img/Loan.svg",
  "LPG Gas": "/img/Gas.svg",
  "Mobile Post-Paid": "/img/Postpaid.svg",
  "Mobile Pre-Paid": "/img/Prepaid.svg",
  "Rental": "/img/Rental.svg",
  "Subscription": "/img/Subscription.svg",
  "Water": "/img/Water.svg",
  "Municipal Services": "/img/MunicipalService.svg",
  "Municipal Taxes": "/img/MunicipalTax.svg",
  "Recurring Deposit": "/img/RecurringDeposit.svg",
  "NCMC": "/img/NCMC.svg",
  "Prepaid Meter": "/img/PrepaidMeter.svg",
  "E-Challan": "/img/E-Challen.svg",
  "Agent Collection": "/img/AgentCollection.svg",
  "EV Recharge": "/img/EVRecharge.svg",
  "NPS": "/img/NPS.svg",
};

// Default icon
const DEFAULT_ICON = "/img/Broadband.svg";

// Helper function to map API response to biller format
const mapBillerToComponent = (biller, categoryName) => {
  return {
    id: biller.id || biller._id,
    name: biller.name || "",
    icon: categoryIconMap[categoryName] || DEFAULT_ICON,
    iconColor: "text-blue-500",
    billerName: biller.name || "",
    billerId: biller.billerId || "",
    category: categoryName || "",
    initChannel: biller.initChannel || "",
    active: biller.isActive !== undefined ? biller.isActive : true,
    deleted: biller.isDeleted || false,
  };
};

// Skeleton Loader Component
const BillerCardSkeleton = () => {
  return (
    <div className="border border-[#1B1717] border-opacity-30 border-[0.5px] rounded-xl p-4 bg-white animate-pulse">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="w-[35px] h-[35px] bg-gray-300 rounded"></div>
          <div className="h-4 w-32 bg-gray-300 rounded"></div>
        </div>
        <div className="h-6 w-16 bg-gray-300 rounded-full"></div>
      </div>
      <div className="space-y-2 mb-4 border-b border-[#1B1717] border-opacity-20 pb-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex justify-between">
            <div className="h-3 w-20 bg-gray-300 rounded"></div>
            <div className="h-3 w-12 bg-gray-300 rounded"></div>
          </div>
        ))}
      </div>
      <div className="space-y-[18px] mb-4">
        {[1, 2].map((i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="h-3 w-16 bg-gray-300 rounded"></div>
            <div className="w-[39px] h-[23px] bg-gray-300 rounded-full"></div>
          </div>
        ))}
      </div>
      <div className="h-10 w-full bg-gray-300 rounded-lg"></div>
    </div>
  );
};

// Icon component similar to OperatorCard
const BillerIcon = ({ icon, className = "" }) => {
    if (typeof icon === "string") {
        return (
            <img
                src={icon}
                alt="icon"
                className={`object-contain ${className}`}
            />
        );
    }

    const IconComponent = icon;
    return <IconComponent className={className} />;
};

// Helper function to get category name by ID
const getCategoryNameById = (categoryId, categories) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || "Broadband Postpaid";
};

const AddBillerModal = ({ isOpen, onClose, onAdd, onEdit, biller, mode = "add", categoriesForDropdown = [], initChannelOptions = [], isLoading = false }) => {
    const [formData, setFormData] = useState({
        billerName: "",
        billerId: "",
        category: "",
        initChannel: "",
        active: true,
        deleted: false,
    });
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const [isInitChannelDropdownOpen, setIsInitChannelDropdownOpen] = useState(false);
    const categoryDropdownRef = useRef(null);
    const initChannelDropdownRef = useRef(null);

    const categoryOptions = categoriesForDropdown.map(cat => cat.name);

    // Update form data when biller prop changes (for edit mode)
    useEffect(() => {
        if (biller && mode === "edit") {
            setFormData({
                billerName: biller.billerName?.toString() || "",
                billerId: biller.billerId?.toString() || "",
                category: typeof biller.category === "string" ? biller.category : (biller.category?.toString() || ""),
                initChannel: typeof biller.initChannel === "string" ? biller.initChannel : (biller.initChannel?.toString() || ""),
                active: biller.active !== undefined ? biller.active : true,
                deleted: biller.deleted !== undefined ? biller.deleted : false,
            });
        } else {
            setFormData({
                billerName: "",
                billerId: "",
                category: "",
                initChannel: "",
                active: true,
                deleted: false,
            });
        }
    }, [biller, mode]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
                setIsCategoryDropdownOpen(false);
            }
            if (initChannelDropdownRef.current && !initChannelDropdownRef.current.contains(event.target)) {
                setIsInitChannelDropdownOpen(false);
            }
        };

        if (isCategoryDropdownOpen || isInitChannelDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isCategoryDropdownOpen, isInitChannelDropdownOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.category || !formData.initChannel) {
            alert("Please select Category and Init Channel");
            return;
        }
        if (mode === "edit" && onEdit) {
            await onEdit(formData);
        } else if (onAdd) {
            await onAdd(formData);
        }
        // Don't close modal here - let the useEffect handle it after success
    };

    const handleClose = () => {
        setFormData({
            billerName: "",
            billerId: "",
            category: "",
            initChannel: "",
            active: true,
            deleted: false,
        });
        setIsCategoryDropdownOpen(false);
        setIsInitChannelDropdownOpen(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl w-[498px] max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative m-4">
                {/* Header */}
                <div className="relative flex items-start mb-6 w-full">
                    {/* Centered Title */}
                    <div className="mx-auto text-center">
                        <h2 className="text-[24px] font-['Gilroy-Medium'] text-[#1B1717] mb-1">
                            {mode === "edit" ? "Edit Biller" : "Add New Biller"}
                        </h2>
                        <p className="text-sm text-gray-600 font-['Gilroy-Regular']">
                            {mode === "edit" ? "Update Biller Information" : "Create A New Biller Entry"}
                        </p>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={handleClose}
                        className="absolute right-0 top-0 w-10 h-10 flex items-center justify-center rounded-xl bg-[#039155] hover:opacity-90 transition"
                    >
                        <X className="w-6 h-6 text-[#FFFFFF] rounded-full border border-[2.5px] border-[#FFFFFF] p-0.5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Basic Information */}
                    <div className="mb-[24px]">
                        <h3 className="text-[18px] font-['Gilroy-SemiBold'] text-[#1B1717] mb-[8px]">
                            Basic Information
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[14px] font-['Gilroy-Medium'] text-[#1B1717] mb-[8px]">
                                    Billers Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.billerName}
                                    onChange={(e) => setFormData({ ...formData, billerName: e.target.value })}
                                    placeholder="Enter Billers Name"
                                    className="w-full px-4 h-[43px] border border-[#1B1717] border-opacity-50 rounded-lg focus:outline-none text-[12px] font-['Gilroy-Medium']"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[14px] font-['Gilroy-Medium'] text-[#1B1717] mb-[8px]">
                                    Billers ID
                                </label>
                                <input
                                    type="text"
                                    value={formData.billerId}
                                    onChange={(e) => setFormData({ ...formData, billerId: e.target.value })}
                                    placeholder="Enter Billers ID"
                                    className="w-full px-4 h-[43px] border border-[#1B1717] border-opacity-50 rounded-lg focus:outline-none text-[12px] font-['Gilroy-Medium']"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Fee Configuration */}
                    <div className="mb-6">
                        <h3 className="text-[18px] font-['Gilroy-SemiBold'] text-[#1B1717] mb-2">
                            Fee Configuration
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative" ref={categoryDropdownRef}>
                                <label className="block text-[14px] font-['Gilroy-Medium'] text-[#1B1717] mb-2">
                                    Category
                                </label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
                                        setIsInitChannelDropdownOpen(false);
                                    }}
                                    className="w-full px-4 h-[43px] border border-[#1B1717] border-opacity-50 rounded-lg focus:outline-none text-sm bg-white flex items-center justify-between text-left"
                                >
                                    <span className={formData.category ? "text-[#1B1717]" : "text-gray-400"}>
                                        {formData.category || "Select Category"}
                                    </span>
                                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isCategoryDropdownOpen && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                        {categoryOptions.map((option) => (
                                            <div
                                                key={option}
                                                onClick={() => {
                                                    setFormData({ ...formData, category: option });
                                                    setIsCategoryDropdownOpen(false);
                                                }}
                                                className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm text-[#1B1717]"
                                            >
                                                {option}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="relative" ref={initChannelDropdownRef}>
                                <label className="block text-[14px] font-['Gilroy-Medium'] text-[#1B1717] mb-2">
                                    Init Channel
                                </label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsInitChannelDropdownOpen(!isInitChannelDropdownOpen);
                                        setIsCategoryDropdownOpen(false);
                                    }}
                                    className="w-full px-4 h-[43px] border border-[#1B1717] border-opacity-50 rounded-lg focus:outline-none text-sm bg-white flex items-center justify-between text-left"
                                >
                                    <span className={formData.initChannel ? "text-[#1B1717]" : "text-gray-400"}>
                                        {formData.initChannel || "Select Init Channel"}
                                    </span>
                                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isInitChannelDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isInitChannelDropdownOpen && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                        {initChannelOptions.map((option) => (
                                            <div
                                                key={option}
                                                onClick={() => {
                                                    setFormData({ ...formData, initChannel: option });
                                                    setIsInitChannelDropdownOpen(false);
                                                }}
                                                className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm text-[#1B1717]"
                                            >
                                                {option}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Status Settings */}
                    <div className="mb-6">
                        <h3 className="text-[18px] font-['Gilroy-SemiBold'] text-[#1B1717] mb-[18px]">
                            Status Settings
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                            {/* ===== Row 1 : Labels ===== */}
                            <span className="text-[14px] font-['Gilroy-Medium'] text-[#1B1717]">
                                Active
                            </span>
                            <span className="text-[14px] font-['Gilroy-Medium'] text-[#1B1717]">
                                Deleted
                            </span>

                            {/* ===== Row 1 : Cards ===== */}
                            {/* Active Card */}
                            <div className="flex justify-between items-start border border-gray-300 rounded-xl px-2 py-3">
                                <div>
                                    <h3 className="text-[12px] font-['Gilroy-Medium'] text-[#1B1717]">
                                        Active Status
                                    </h3>
                                    <p className="text-[11px] mt-1 text-gray-500 font-['Gilroy-Regular']">
                                        Activate This Biller
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setFormData({ ...formData, active: !formData.active })
                                    }
                                    className={`w-[42px] h-[24px] rounded-full relative transition-all
                ${formData.active ? "bg-[#039155]" : "bg-gray-300"}`}
                                >
                                    <span
                                        className={`absolute top-[2px] w-5 h-5 bg-white rounded-full shadow transition-all
                    ${formData.active ? "right-[2px]" : "left-[2px]"}`}
                                    />
                                </button>
                            </div>

                            {/* Deleted Card */}
                            <div className="flex justify-between items-start border border-gray-300 rounded-xl px-2 py-3">
                                <div>
                                    <h3 className="text-[12px] font-['Gilroy-Medium'] text-[#1B1717]">
                                        Deleted Status
                                    </h3>
                                    <p className="text-[11px] mt-1 text-gray-500 font-['Gilroy-Regular']">
                                        Delete This Biller
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setFormData({ ...formData, deleted: !formData.deleted })
                                    }
                                    className={`w-[42px] h-[24px] rounded-full relative transition-all
                ${formData.deleted ? "bg-[#039155]" : "bg-gray-300"}`}
                                >
                                    <span
                                        className={`absolute top-[2px] w-5 h-5 bg-white rounded-full shadow transition-all
                    ${formData.deleted ? "right-[2px]" : "left-[2px]"}`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-gray-200">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-6 py-3 rounded-lg border border-gray-300 bg-white text-[18px] text-[#1B1717] font-['Gilroy-Medium'] hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-6 py-3 rounded-lg bg-[#039155] text-[18px] text-white font-['Gilroy-Medium'] hover:bg-[#027a47] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {mode === "edit" ? "Updating..." : "Adding..."}
                                </>
                            ) : (
                                mode === "edit" ? "Update Biller" : "Add Biller"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const BillerCard = ({ biller, onEditClick, onToggleActive, company, categoriesForDropdown }) => {
    const [active, setActive] = useState(biller.active);
    const [deleted, setDeleted] = useState(biller.deleted);

    // Update local state when biller prop changes
    useEffect(() => {
        setActive(biller.active);
        setDeleted(biller.deleted);
    }, [biller]);

    // Handle active toggle click
    const handleActiveToggle = async () => {
        const newActiveValue = !active;
        setActive(newActiveValue); // Optimistically update UI
        
        // Call the update handler if provided
        if (onToggleActive) {
            await onToggleActive(biller, newActiveValue);
        }
    };

    return (
        <div className="border border-[#1B1717] border-opacity-30 border-[0.5px] rounded-xl p-4 bg-white hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <BillerIcon
                        icon={biller.icon}
                        className="w-[35px] h-[35px]"
                    />
                    <span className="font-['Gilroy-SemiBold] text-[16px] text-[#1B1717]">{biller.name}</span>
                </div>
                <span className="text-xs bg-[#008D1E] text-center text-[#FFFFFF] px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                    <span className="w-[8px] h-[8px] bg-white text-[#FFFFFF] rounded-full"></span>
                    Active
                </span>
            </div>

            {/* Details */}
            <div className="text-sm text-gray-600 space-y-2 mb-4 border-b border-[#1B1717] -border-y-[0.5px] border-opacity-20  pb-4">
                <div className="flex justify-between">
                    <span className="font-['Gilroy-Regular'] text[12px] text-opacity-80 text-[#1B1717]">Billers Name</span>
                    <span className="font-['Gilroy-Medium'] text[12px] text-[#1B1717]">{biller.billerName}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-['Gilroy-Regular'] text[12px] text-opacity-80 text-[#1B1717]">Billers ID</span>
                    <span className="font-['Gilroy-Medium'] text[12px] text-[#1B1717]">{biller.billerId}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-['Gilroy-Regular'] text[12px] text-opacity-80 text-[#1B1717]">Category</span>
                    <span className="font-['Gilroy-Medium'] text[12px] text-[#1B1717]">{biller.category}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-['Gilroy-Regular'] text[12px] text-opacity-80 text-[#1B1717]">Init Channel</span>
                    <span className="font-['Gilroy-Medium'] text[12px] text-[#1B1717]">{biller.initChannel}</span>
                </div>
            </div>

            {/* Toggles */}
            <div className="space-y-[18px] mb-4">
                <div className="flex justify-between items-center">
                    <span className="text-[12px] text-[#1B1717] font-['Gilroy-Regular'] text-opacity-80">Active</span>
                    <button
                        onClick={handleActiveToggle}
                        className={`w-[39px] h-[23px] rounded-full relative transition-all duration-200 ${active ? "bg-[#039155]" : "bg-gray-300"
                            }`}
                    >
                        <span
                            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200 ${active ? "right-0.5" : "left-0.5"
                                }`}
                        />
                    </button>
                </div>

            </div>

            {/* Action */}
            <button
                onClick={() => onEditClick && onEditClick(biller)}
                className="w-full bg-[#039155] hover:bg-[#027a41] text-[#FFFFFF] py-2.5 rounded-lg text-[18px] font-['Gilroy-SemiBold] transition-colors"
            >
                Edit
            </button>
        </div>
    );
};

const BillerSettings = () => {
    const dispatch = useDispatch();
    const { company } = useCompany();
    const { billers, loading, billersTotalPages, billersCurrentPage, categoriesForDropdown, paymentInfo, createBillerSuccess, updateBillerSuccess } = useSelector(
        (state) => state.bbps
    );

    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBiller, setEditingBiller] = useState(null);
    const [modalMode, setModalMode] = useState("add");
    const [initChannels, setInitChannels] = useState([]);
    const [loadingChannels, setLoadingChannels] = useState(false);
    const [lastOperation, setLastOperation] = useState(null); // Track if last operation was 'create' or 'update'
    const dropdownRef = useRef(null);

    const cardsPerPage = 6; // 6 cards per page

    // Get company ID
    const getCompanyId = () => {
        return company?.companyId || company?._id || company?.id || null;
    };

    // Debounced search query
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
            if (searchQuery.trim() !== "") {
                setCurrentPage(1);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch categories for dropdown on mount
    useEffect(() => {
        const companyId = getCompanyId();
        if (companyId && categoriesForDropdown.length === 0) {
            dispatch(getCategoriesForDropdown(companyId));
        }
    }, [company, dispatch]);

    // Fetch billers when category, search, or page changes
    useEffect(() => {
        const companyId = getCompanyId();
        if (!companyId) return;

        const categoryName = selectedCategory === "All" ? null : selectedCategory;

        if (debouncedSearchQuery.trim()) {
            dispatch(searchBBPSBillers(companyId, debouncedSearchQuery, categoryName, currentPage, cardsPerPage));
        } else {
            dispatch(getAllBBPSBillers(companyId, categoryName, currentPage, cardsPerPage));
        }
    }, [debouncedSearchQuery, currentPage, selectedCategory, dispatch, company]);

    // Map billers to component format
    const mappedBillers = billers.map((biller) => {
        const categoryName = getCategoryNameById(biller.categoryId, categoriesForDropdown);
        return mapBillerToComponent(biller, categoryName);
    });

    // Calculate which 3 page numbers to show
    const getVisiblePages = () => {
        const totalPages = billersTotalPages || 1;
        if (totalPages <= 3) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        if (currentPage <= 2) {
            return [1, 2, 3];
        } else if (currentPage >= totalPages - 1) {
            return [totalPages - 2, totalPages - 1, totalPages];
        } else {
            return [currentPage - 1, currentPage, currentPage + 1];
        }
    };

    const visiblePages = getVisiblePages();

    // Handle category change
    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        setCurrentPage(1);
    };

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

    // Extract unique initiating channels from payment info
    useEffect(() => {
        if (paymentInfo && paymentInfo.length > 0) {
            const uniqueChannels = [...new Set(paymentInfo.map(item => item.initiatingChannel).filter(Boolean))];
            setInitChannels(uniqueChannels);
        }
    }, [paymentInfo]);

    // Fetch payment info when "Add New Biller" is clicked
    const handleAddClick = async () => {
        const companyId = getCompanyId();
        if (!companyId) return;

        setLoadingChannels(true);
        try {
            // Fetch all payment info to get available channels
            await dispatch(getAllBBPSPaymentInfo(companyId, 1, 100)); // Fetch all channels
        } catch (error) {
            console.error("Error fetching payment info:", error);
        } finally {
            setLoadingChannels(false);
            // Open modal after channels are loaded (even if empty, allow user to proceed)
            setEditingBiller(null);
            setModalMode("add");
            setIsModalOpen(true);
            setLastOperation(null); // Reset last operation when opening modal
        }
    };

    const handleAddBiller = async (formData) => {
        const companyId = getCompanyId();
        if (!companyId) return;

        // Find category ID by name
        const selectedCategory = categoriesForDropdown.find(cat => cat.name === formData.category);
        const categoryId = selectedCategory?.id || selectedCategory?._id || null;

        if (!categoryId) {
            alert("Please select a valid category");
            return;
        }

        const billerData = {
            name: formData.billerName,
            billerId: formData.billerId,
            categoryId: categoryId,
            initiatingChannel: formData.initChannel,
        };

        setLastOperation('create');
        await dispatch(createBBPSBiller(companyId, billerData));
    };

    const handleEditBiller = async (formData) => {
        const companyId = getCompanyId();
        const billerId = editingBiller?.id;
        if (!companyId || !billerId) return;

        // Find category ID by name
        const selectedCategory = categoriesForDropdown.find(cat => cat.name === formData.category);
        const categoryId = selectedCategory?.id || selectedCategory?._id || null;

        if (!categoryId) {
            alert("Please select a valid category");
            return;
        }

        const billerData = {
            name: formData.billerName,
            billerId: formData.billerId,
            categoryId: categoryId,
            isActive: formData.active !== undefined ? formData.active : true,
            isDeleted: formData.deleted !== undefined ? formData.deleted : false,
            initiatingChannel: formData.initChannel,
        };

        setLastOperation('update');
        await dispatch(updateBBPSBiller(companyId, billerId, billerData));
    };

    const handleEditClick = (biller) => {
        setEditingBiller(biller);
        setModalMode("edit");
        setIsModalOpen(true);
        setLastOperation(null); // Reset last operation when opening modal
    };

    const handleToggleActive = async (biller, newActiveValue) => {
        const companyId = getCompanyId();
        const billerId = biller.id;
        if (!companyId || !billerId) return;

        // Find category ID by name
        const categoryName = biller.category;
        const categoryObj = categoriesForDropdown.find(cat => cat.name === categoryName);
        const categoryId = categoryObj?.id || categoryObj?._id || null;

        if (!categoryId) {
            console.error("Category not found for biller:", biller);
            return;
        }

        const billerData = {
            name: biller.billerName || biller.name,
            billerId: biller.billerId,
            categoryId: categoryId,
            isActive: newActiveValue,
            isDeleted: biller.deleted !== undefined ? biller.deleted : false,
            initiatingChannel: biller.initChannel || biller.initChannel,
        };

        await dispatch(updateBBPSBiller(companyId, billerId, billerData));
        
        // Refresh billers list after update (respect current search and filter state)
        const categoryNameForQuery = selectedCategory === "All" ? null : selectedCategory;
        if (debouncedSearchQuery.trim()) {
            dispatch(searchBBPSBillers(companyId, debouncedSearchQuery, categoryNameForQuery, currentPage, cardsPerPage));
        } else {
            dispatch(getAllBBPSBillers(companyId, categoryNameForQuery, currentPage, cardsPerPage));
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingBiller(null);
        setModalMode("add");
        setLastOperation(null); // Reset last operation when closing modal
    };

    // Refresh billers list after successful create or update
    useEffect(() => {
        if ((createBillerSuccess || updateBillerSuccess) && !loading && isModalOpen && lastOperation) {
            const companyId = getCompanyId();
            if (companyId) {
                const categoryName = selectedCategory === "All" ? null : selectedCategory;
                // Refresh the billers list after successful create or update
                dispatch(getAllBBPSBillers(companyId, categoryName, currentPage, cardsPerPage));
                // Close modal and reset state
                setIsModalOpen(false);
                setEditingBiller(null);
                setModalMode("add");
                setLastOperation(null); // Reset last operation after closing modal
            }
        }
    }, [createBillerSuccess, updateBillerSuccess, loading, isModalOpen, lastOperation, dispatch, company, selectedCategory, currentPage, cardsPerPage]);

    // Prepare categories for dropdown (add "All" at the beginning)
    const categories = ["All", ...categoriesForDropdown.map(cat => cat.name)];

    return (
        <div>
            {/* Search & Action Bar */}
            <div className="flex justify-between bg-white rounded-xl p-4 items-center mb-6 gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search By Billers Name"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border border-[#1B1717] border-opacity-50 border-[0.5px] px-10 py-2.5 rounded-lg w-full focus:outline-none text-sm"
                    />
                </div>
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 px-4 py-2.5 border border-[#1B1717] border-opacity-50 border-[0.5px] rounded-lg bg-white text-sm font-['Gilroy-Medium'] text-[#1B1717] min-w-[150px] justify-between"
                    >
                        <span>{selectedCategory}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isDropdownOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {categories.map((category) => (
                                <div
                                    key={category}
                                    onClick={() => {
                                        handleCategoryChange(category);
                                        setIsDropdownOpen(false);
                                    }}
                                    className={`px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm ${
                                        selectedCategory === category ? "bg-gray-100 font-medium" : "text-[#1B1717]"
                                    }`}
                                >
                                    {category}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <button
                    onClick={handleAddClick}
                    className="bg-[#039155] hover:bg-[#027a46] text-white px-5 py-2.5 rounded-lg text-[14px] font-['Gilroy-Medium'] flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap"
                >
                    <Plus className="w-3 h-3 rounded-3xl border border-[#FFFFFF]" />
                    Add New Biller
                </button>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 bg-[#FFFFFF] rounded-xl p-4 lg:grid-cols-3 gap-6">
                {loading && mappedBillers.length === 0 ? (
                    // Show skeleton loaders on initial load
                    Array.from({ length: cardsPerPage }).map((_, index) => (
                        <BillerCardSkeleton key={`skeleton-${index}`} />
                    ))
                ) : mappedBillers.length > 0 ? (
                    mappedBillers.map((biller) => (
                        <BillerCard 
                            key={biller.id} 
                            biller={biller} 
                            onEditClick={handleEditClick}
                            onToggleActive={handleToggleActive}
                            company={company}
                            categoriesForDropdown={categoriesForDropdown}
                        />
                    ))
                ) : (
                    <div className="col-span-full text-center py-8 text-gray-500">
                        No billers found
                    </div>
                )}
            </div>

            {/* Pagination */}
            {(billersTotalPages || 0) > 0 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1 || loading}
                        className={`px-3 py-2.5 border border-[#1B1717] rounded-[4px] border-opacity-20 border-[0.5px] hover:bg-gray-50 transition-colors ${
                            currentPage === 1 || loading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    {visiblePages.map((page) => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            disabled={loading}
                            className={`px-4 py-1.5 rounded font-medium transition-colors ${
                                currentPage === page
                                    ? "bg-[#039155] text-white"
                                    : "border border-gray-300 hover:bg-gray-50"
                            } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            {page}
                        </button>
                    ))}
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(billersTotalPages || 1, prev + 1))}
                        disabled={currentPage === (billersTotalPages || 1) || loading}
                        className={`px-3 py-2.5 border border-[#1B1717] rounded-[4px] border-opacity-20 border-[0.5px] hover:bg-gray-50 transition-colors ${
                            currentPage === (billersTotalPages || 1) || loading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Add/Edit Biller Modal */}
            <AddBillerModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onAdd={handleAddBiller}
                onEdit={handleEditBiller}
                biller={editingBiller}
                mode={modalMode}
                categoriesForDropdown={categoriesForDropdown}
                initChannelOptions={initChannels}
                isLoading={loading}
            />
        </div>
    );
};

export default BillerSettings;
