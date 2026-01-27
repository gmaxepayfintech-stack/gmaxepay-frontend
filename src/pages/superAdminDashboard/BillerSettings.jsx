import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
} from "lucide-react";

// Icon component similar to OperatorCard
const BillerIcon = ({ icon, className = "" }) => {
  if (typeof icon === "string") {
    return (
      <img src={icon} alt="icon" className={`object-contain ${className}`} />
    );
  }

  const IconComponent = icon;
  return <IconComponent className={className} />;
};

// Sample biller data
const billers = [
  {
    id: 1,
    name: "Yes Bank Credit Card",
    icon: "/img/CreditCard.svg",
    iconColor: "text-blue-500",
    billerName: 12,
    billerId: 225,
    category: 4,
    initChannel: 4,
    active: true,
    deleted: false,
  },
  {
    id: 2,
    name: "Yes Bank Credit Card",
    icon: "/img/CreditCard.svg",
    iconColor: "text-blue-500",
    billerName: 12,
    billerId: 225,
    category: 4,
    initChannel: 4,
    active: true,
    deleted: false,
  },
  {
    id: 3,
    name: "Yes Bank Credit Card",
    icon: "/img/CreditCard.svg",
    iconColor: "text-blue-500",
    billerName: 12,
    billerId: 225,
    category: 4,
    initChannel: 4,
    active: true,
    deleted: false,
  },
  {
    id: 4,
    name: "Yes Bank Credit Card",
    icon: "/img/CreditCard.svg",
    iconColor: "text-blue-500",
    billerName: 12,
    billerId: 225,
    category: 4,
    initChannel: 4,
    active: true,
    deleted: false,
  },
  {
    id: 5,
    name: "Yes Bank Credit Card",
    icon: "/img/CreditCard.svg",
    iconColor: "text-blue-500",
    billerName: 12,
    billerId: 225,
    category: 4,
    initChannel: 4,
    active: true,
    deleted: false,
  },
  {
    id: 6,
    name: "Yes Bank Credit Card",
    icon: "/img/CreditCard.svg",
    iconColor: "text-blue-500",
    billerName: 12,
    billerId: 225,
    category: 4,
    initChannel: 4,
    active: true,
    deleted: false,
  },
  {
    id: 7,
    name: "Yes Bank Credit Card",
    icon: "/img/CreditCard.svg",
    iconColor: "text-blue-500",
    billerName: 12,
    billerId: 225,
    category: 4,
    initChannel: 4,
    active: true,
    deleted: false,
  },
  {
    id: 8,
    name: "Yes Bank Credit Card",
    icon: "/img/CreditCard.svg",
    iconColor: "text-blue-500",
    billerName: 12,
    billerId: 225,
    category: 4,
    initChannel: 4,
    active: true,
    deleted: false,
  },
  {
    id: 9,
    name: "Yes Bank Credit Card",
    icon: "/img/CreditCard.svg",
    iconColor: "text-blue-500",
    billerName: 12,
    billerId: 225,
    category: 4,
    initChannel: 4,
    active: true,
    deleted: false,
  },
  {
    id: 10,
    name: "Yes Bank Credit Card",
    icon: "/img/CreditCard.svg",
    iconColor: "text-blue-500",
    billerName: 12,
    billerId: 225,
    category: 4,
    initChannel: 4,
    active: true,
    deleted: false,
  },
  {
    id: 11,
    name: "Yes Bank Credit Card",
    icon: "/img/CreditCard.svg",
    iconColor: "text-blue-500",
    billerName: 12,
    billerId: 225,
    category: 4,
    initChannel: 4,
    active: true,
    deleted: false,
  },
  {
    id: 12,
    name: "Yes Bank Credit Card",
    icon: "/img/CreditCard.svg",
    iconColor: "text-blue-500",
    billerName: 12,
    billerId: 225,
    category: 4,
    initChannel: 4,
    active: true,
    deleted: false,
  },
  {
    id: 13,
    name: "Yes Bank Credit Card",
    icon: "/img/CreditCard.svg",
    iconColor: "text-blue-500",
    billerName: 12,
    billerId: 225,
    category: 4,
    initChannel: 4,
    active: true,
    deleted: false,
  },
  {
    id: 14,
    name: "Yes Bank Credit Card",
    icon: "/img/CreditCard.svg",
    iconColor: "text-blue-500",
    billerName: 12,
    billerId: 225,
    category: 4,
    initChannel: 4,
    active: true,
    deleted: false,
  },
  {
    id: 15,
    name: "Yes Bank Credit Card",
    icon: "/img/CreditCard.svg",
    iconColor: "text-blue-500",
    billerName: 12,
    billerId: 225,
    category: 4,
    initChannel: 4,
    active: true,
    deleted: false,
  },
  {
    id: 16,
    name: "Yes Bank Credit Card",
    icon: "/img/CreditCard.svg",
    iconColor: "text-blue-500",
    billerName: 12,
    billerId: 225,
    category: 4,
    initChannel: 4,
    active: true,
    deleted: false,
  },
  {
    id: 17,
    name: "Yes Bank Credit Card",
    icon: "/img/CreditCard.svg",
    iconColor: "text-blue-500",
    billerName: 12,
    billerId: 225,
    category: 4,
    initChannel: 4,
    active: true,
    deleted: false,
  },
  {
    id: 18,
    name: "Yes Bank Credit Card",
    icon: "/img/CreditCard.svg",
    iconColor: "text-blue-500",
    billerName: 12,
    billerId: 225,
    category: 4,
    initChannel: 4,
    active: true,
    deleted: false,
  },
];

const AddBillerModal = ({
  isOpen,
  onClose,
  onAdd,
  onEdit,
  biller,
  mode = "add",
}) => {
  const [formData, setFormData] = useState({
    billerName: "",
    billerId: "",
    category: "",
    initChannel: "",
    active: true,
  });
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isInitChannelDropdownOpen, setIsInitChannelDropdownOpen] =
    useState(false);
  const categoryDropdownRef = useRef(null);
  const initChannelDropdownRef = useRef(null);

  const categoryOptions = [
    "Credit Card",
    "Electricity",
    "Gas",
    "Water",
    "Mobile",
    "DTH",
    "Broadband",
  ];
  const initChannelOptions = ["AGT", "USSD", "APP", "WEB", "IVR"];

  // Update form data when biller prop changes (for edit mode)
  useEffect(() => {
    if (biller && mode === "edit") {
      setFormData({
        billerName: biller.billerName?.toString() || "",
        billerId: biller.billerId?.toString() || "",
        category:
          typeof biller.category === "string"
            ? biller.category
            : biller.category?.toString() || "",
        initChannel:
          typeof biller.initChannel === "string"
            ? biller.initChannel
            : biller.initChannel?.toString() || "",
        active: biller.active !== undefined ? biller.active : true,
      });
    } else {
      setFormData({
        billerName: "",
        billerId: "",
        category: "",
        initChannel: "",
        active: true,
      });
    }
  }, [biller, mode]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target)
      ) {
        setIsCategoryDropdownOpen(false);
      }
      if (
        initChannelDropdownRef.current &&
        !initChannelDropdownRef.current.contains(event.target)
      ) {
        setIsInitChannelDropdownOpen(false);
      }
    };

    if (isCategoryDropdownOpen || isInitChannelDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCategoryDropdownOpen, isInitChannelDropdownOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.category || !formData.initChannel) {
      alert("Please select Category and Init Channel");
      return;
    }
    if (mode === "edit" && onEdit) {
      onEdit(formData);
    } else {
      onAdd(formData);
    }
    setFormData({
      billerName: "",
      billerId: "",
      category: "",
      initChannel: "",
      active: true,
    });
    onClose();
  };

  const handleClose = () => {
    setFormData({
      billerName: "",
      billerId: "",
      category: "",
      initChannel: "",
      active: true,
    });
    setIsCategoryDropdownOpen(false);
    setIsInitChannelDropdownOpen(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#D9D9D9]/80">
      <div className="bg-white rounded-xl w-[498px] max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative m-4">
        {/* Header */}
        <div className="relative flex items-start mb-6 w-full">
          {/* Centered Title */}
          <div className="mx-auto text-center">
            <h2 className="text-[24px] font-['Gilroy-Medium'] text-[#1B1717] mb-1">
              {mode === "edit" ? "Edit Biller" : "Add New Biller"}
            </h2>
            <p className="text-sm text-gray-600 font-['Gilroy-Regular']">
              {mode === "edit"
                ? "Update Biller Information"
                : "Create A New Biller Entry"}
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute right-0 top-0 w-10 h-10 flex items-center justify-center rounded-xl bg-[#039155] hover:opacity-90 transition"
          >
            <X className="w-6 h-6 text-[#FFFFFF] rounded-full border-[2.5px] border-[#FFFFFF] p-0.5" />
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
                  onChange={(e) =>
                    setFormData({ ...formData, billerName: e.target.value })
                  }
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
                  onChange={(e) =>
                    setFormData({ ...formData, billerId: e.target.value })
                  }
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
                  <span
                    className={
                      formData.category ? "text-[#1B1717]" : "text-gray-400"
                    }
                  >
                    {formData.category || "Select Category"}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${isCategoryDropdownOpen ? "rotate-180" : ""}`}
                  />
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
                  <span
                    className={
                      formData.initChannel ? "text-[#1B1717]" : "text-gray-400"
                    }
                  >
                    {formData.initChannel || "Select Init Channel"}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${isInitChannelDropdownOpen ? "rotate-180" : ""}`}
                  />
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
              {/* ===== Row 1 : Label ===== */}
              <span className="text-[14px] font-['Gilroy-Medium'] text-[#1B1717]">
                Active
              </span>
              <span className="text-[14px] font-['Gilroy-Medium'] text-[#1B1717]"></span>

              {/* ===== Row 1 : Card ===== */}
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
              className="flex-1 px-6 py-3 rounded-lg bg-[#039155] text-[18px] text-white font-['Gilroy-Medium'] hover:bg-[#027a47] transition"
            >
              {mode === "edit" ? "Update Biller" : "Add Biller"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BillerCard = ({ biller, onEditClick }) => {
  const [active, setActive] = useState(biller.active);
  const [deleted, setDeleted] = useState(biller.deleted);

  return (
    <div className=" border-[#1B1717] border-opacity-30 border-[0.5px] rounded-xl p-4 bg-white hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <BillerIcon icon={biller.icon} className="w-[35px] h-[35px]" />
          <span className="font-['Gilroy-SemiBold'] text-[16px] text-[#1B1717]">
            {biller.name}
          </span>
        </div>
        <span className="text-xs bg-[#008D1E] text-center text-[#FFFFFF] px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
          <span className="w-[8px] h-[8px] bg-white text-[#FFFFFF] rounded-full"></span>
          Active
        </span>
      </div>

      {/* Details */}
      <div className="text-sm text-gray-600 space-y-2 mb-4 border-b border-[#1B1717] -border-y-[0.5px] border-opacity-20  pb-4">
        <div className="flex justify-between">
          <span className="font-['Gilroy-Regular'] text[12px] text-opacity-80 text-[#1B1717]">
            Billers Name
          </span>
          <span className="font-['Gilroy-Medium'] text[12px] text-[#1B1717]">
            {biller.billerName}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-['Gilroy-Regular'] text[12px] text-opacity-80 text-[#1B1717]">
            Billers ID
          </span>
          <span className="font-['Gilroy-Medium'] text[12px] text-[#1B1717]">
            {biller.billerId}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-['Gilroy-Regular'] text[12px] text-opacity-80 text-[#1B1717]">
            Category
          </span>
          <span className="font-['Gilroy-Medium'] text[12px] text-[#1B1717]">
            {biller.category}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-['Gilroy-Regular'] text[12px] text-opacity-80 text-[#1B1717]">
            Init Channel
          </span>
          <span className="font-['Gilroy-Medium'] text[12px] text-[#1B1717]">
            {biller.initChannel}
          </span>
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-[18px] mb-4">
        {[
          { label: "Active", value: active, setter: setActive },
          { label: "Deleted", value: deleted, setter: setDeleted },
        ].map((item) => (
          <div key={item.label} className="flex justify-between items-center">
            <span className="text-[12px] text-[#1B1717] font-['Gilroy-Regular'] text-opacity-80">
              {item.label}
            </span>
            <button
              onClick={() => item.setter(!item.value)}
              className={`w-[39px] h-[23px] rounded-full relative transition-all duration-200 ${
                item.value ? "bg-[#039155]" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200 ${
                  item.value ? "right-0.5" : "left-0.5"
                }`}
              />
            </button>
          </div>
        ))}
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
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("Credit Card");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBiller, setEditingBiller] = useState(null);
  const [modalMode, setModalMode] = useState("add");
  const dropdownRef = useRef(null);

  const cardsPerPage = 6; // 6 cards per page (2x3 grid)

  const filteredBillers = billers.filter(
    (biller) =>
      biller.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      biller.billerId.toString().includes(searchQuery),
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredBillers.length / cardsPerPage);
  const startIndex = (currentPage - 1) * cardsPerPage;
  const endIndex = startIndex + cardsPerPage;
  const currentBillers = filteredBillers.slice(startIndex, endIndex);

  // Calculate which 3 page numbers to show
  const getVisiblePages = () => {
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

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleAddBiller = (formData) => {
    // Handle adding new biller here
    console.log("New biller data:", formData);
    // You can add the biller to the list or make an API call here
  };

  const handleEditBiller = (formData) => {
    // Handle editing biller here
    console.log("Updated biller data:", formData);
    // You can update the biller in the list or make an API call here
  };

  const handleEditClick = (biller) => {
    setEditingBiller(biller);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBiller(null);
    setModalMode("add");
  };

  const handleAddClick = () => {
    setEditingBiller(null);
    setModalMode("add");
    setIsModalOpen(true);
  };

  const categories = ["Credit Card", "Electricity", "Gas", "Water", "Mobile"];

  return (
    <div>
      {/* Search & Action Bar */}
      <div className="flex justify-between bg-white rounded-xl p-4 items-center mb-6 gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search By Billers Name Or ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className=" border-[#1B1717] border-opacity-50 border-[0.5px] px-10 py-2.5 rounded-lg w-full focus:outline-none text-sm"
          />
        </div>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2.5  border-[#1B1717] border-opacity-50 border-[0.5px] rounded-lg bg-white text-sm font-['Gilroy-Medium'] text-[#1B1717] min-w-[150px] justify-between"
          >
            <span>{selectedCategory}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>
          {isDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {categories.map((category) => (
                <div
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setIsDropdownOpen(false);
                  }}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm text-[#1B1717]"
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
        {currentBillers.map((biller) => (
          <BillerCard
            key={biller.id}
            biller={biller}
            onEditClick={handleEditClick}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className={`px-3 py-2.5  border-[#1B1717] rounded-[4px] border-opacity-20 border-[0.5px] hover:bg-gray-50 transition-colors ${
              currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {visiblePages.map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-1.5 rounded font-medium transition-colors ${
                currentPage === page
                  ? "bg-[#039155] text-white"
                  : "border border-gray-300 hover:bg-gray-50"
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
            className={`px-3 py-2.5   border-[#1B1717] rounded-[4px] border-opacity-20 border-[0.5px] hover:bg-gray-50 transition-colors ${
              currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
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
      />
    </div>
  );
};

export default BillerSettings;
