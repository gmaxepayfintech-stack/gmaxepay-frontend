import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, Plus, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCompany } from "../../../context/CompanyContext";
import OperatorCard from "./OperatorCard";
import BillerSettings from "./BillerSettings";
import PaymentSettings from "./PaymentSettings";
import {
  getAllBBPSCategories,
  searchBBPSCategories,
  createBBPSCategory,
  updateBBPSCategory,
} from "../../../redux/action/bbpsAction";
import { motion } from "framer-motion";

// Icon mapping for categories
const categoryIconMap = {
  "Broadband Postpaid": "/img/Broadband.svg",
  "Cable TV": "/img/Cable.svg",
  "Clubs and Associations": "/img/Club.svg",
  Donation: "/img/Donation.svg",
  DTH: "/img/DTH.svg",
  Electricity: "/img/Electricity.svg",
  "Credit Card": "/img/CreditCard.svg",
  "Education Fees": "/img/Education.svg",
  Fastag: "/img/FastTag.svg",
  "Housing Society": "/img/Housing.svg",
  Insurance: "/img/Insurance.svg",
  "Life Insurance": "/img/LifeInsurance.svg",
  Gas: "/img/Gas.svg",
  "Hospital and Pathology": "/img/Hospitality.svg",
  Hospital: "/img/Hospital.svg",
  "Health Insurance": "/img/HealthInsurance.svg",
  "Landline Postpaid": "/img/Landline.svg",
  "Loan Repayment": "/img/Loan.svg",
  "LPG Gas": "/img/Gas.svg",
  "Mobile Postpaid": "/img/Postpaid.svg",
  "Mobile Prepaid": "/img/Prepaid.svg",
  Rental: "/img/Rental.svg",
  Subscription: "/img/Subscription.svg",
  Water: "/img/Water.svg",
  "Municipal Services": "/img/MunicipalService.svg",
  "Municipal Taxes": "/img/MunicipalTax.svg",
  "Recurring Deposit": "/img/RecurringDeposit.svg",
  NCMC: "/img/NCMC.svg",
  "Prepaid Meter": "/img/PrepaidMeter.svg",
  "E-Challan": "/img/E-Challen.svg",
  "Agent Collection": "/img/AgentCollection.svg",
  "EV Recharge": "/img/EVRecharge.svg",
  NPS: "/img/NPS.svg",
};

// ── Dummy data ──────────────────────────────────────────────────────────────
const DUMMY_BBPS_CATEGORIES = [
  { id: "CAT001", name: "Electricity", custConvFee: 0, flatFee: 0, percentFee: 0, gstRate: 0, isCCF1Category: true, isActive: true, isDeleted: false },
  { id: "CAT002", name: "Mobile Prepaid", custConvFee: 0, flatFee: 0, percentFee: 0, gstRate: 0, isCCF1Category: false, isActive: true, isDeleted: false },
  { id: "CAT003", name: "DTH", custConvFee: 0, flatFee: 0, percentFee: 0, gstRate: 0, isCCF1Category: false, isActive: true, isDeleted: false },
  { id: "CAT004", name: "Water", custConvFee: 0, flatFee: 0, percentFee: 0, gstRate: 0, isCCF1Category: false, isActive: false, isDeleted: false },
  { id: "CAT005", name: "Gas", custConvFee: 0, flatFee: 0, percentFee: 0, gstRate: 0, isCCF1Category: true, isActive: true, isDeleted: false },
];

// Default icon if category not found
const DEFAULT_ICON = "/img/Electricity.svg";

// Helper function to map API response to operator format
const mapCategoryToOperator = (category) => {
  return {
    _id: category.id || category._id,
    name: category.name || "",
    icon: categoryIconMap[category.name] || DEFAULT_ICON,
    iconColor: "text-blue-400",
    active: true,
    fees: {
      convFee: category.custConvFee || 0,
      flatFee: category.flatFee || 0,
      percentFee: category.percentFee || 0,
      gstRate: category.gstRate || 0,
    },
    toggles: {
      ccfi: category.isCCF1Category || false,
      active: category.isActive !== undefined ? category.isActive : true,
      deleted: category.isDeleted || false,
    },
  };
};

// Skeleton Loader Component
const OperatorCardSkeleton = () => {
  return (
    <div className="border-[#1B1717] border-opacity-30 border-[0.5px] rounded-xl p-4 bg-white animate-pulse">
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
        {[1, 2, 3].map((i) => (
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

const AddOperatorModal = ({
  isOpen,
  onClose,
  onAdd,
  onEdit,
  operator,
  mode = "add",
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    category: "",
    convFee: "",
    flatFee: "",
    percentFee: "",
    gstRate: "",
    ccfi: false,
    active: true,
    deleted: false,
  });

  // Update form data when operator prop changes (for edit mode)
  useEffect(() => {
    if (operator && mode === "edit") {
      setFormData({
        category: operator.name || "",
        convFee:
          operator.fees?.convFee !== undefined &&
          operator.fees?.convFee !== null
            ? operator.fees.convFee
            : "",
        flatFee:
          operator.fees?.flatFee !== undefined &&
          operator.fees?.flatFee !== null
            ? operator.fees.flatFee
            : "",
        percentFee:
          operator.fees?.percentFee !== undefined &&
          operator.fees?.percentFee !== null
            ? operator.fees.percentFee
            : "",
        gstRate:
          operator.fees?.gstRate !== undefined &&
          operator.fees?.gstRate !== null
            ? operator.fees.gstRate
            : "",
        ccfi: operator.toggles?.ccfi || false,
        active:
          operator.toggles?.active !== undefined
            ? operator.toggles.active
            : true,
        deleted: operator.toggles?.deleted || false,
      });
    } else {
      setFormData({
        category: "",
        convFee: "",
        flatFee: "",
        percentFee: "",
        gstRate: "",
        ccfi: false,
        active: true,
        deleted: false,
      });
    }
  }, [operator, mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === "edit" && onEdit) {
      await onEdit(formData);
    } else if (onAdd) {
      await onAdd(formData);
    }
  };

  const handleClose = () => {
    setFormData({
      category: "",
      convFee: "",
      flatFee: "",
      percentFee: "",
      gstRate: "",
      ccfi: false,
      active: true,
      deleted: false,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex  items-center justify-center bg-[#D9D9D9]/80">
      <div className="bg-white rounded-xl w-[498px]  max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative m-4">
        {/* Header */}
        <div className="relative flex items-start mb-6 w-full">
          {/* Centered Title */}
          <div className="mx-auto text-center">
            <h2 className="text-[24px] font-['Gilroy-Medium'] text-[#1B1717] mb-1">
              {mode === "edit" ? "Edit Operator" : "Add New Operator"}
            </h2>
            <p className="text-sm text-gray-600 font-['Gilroy-Regular']">
              {mode === "edit"
                ? "Modify the operator information"
                : "Create A New Operator Entry"}
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute right-0 top-0 w-10 h-10 flex items-center justify-center rounded-xl bg-[#039155] hover:opacity-90 transition"
          >
            <X className="w-6 h-6 text-[#FFFFFF] rounded-full   border-[2.5px] border-[#FFFFFF] p-0.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="mb-[24px]">
            <h3 className="text-[18px] font-['Gilroy-SemiBold'] text-[#1B1717] mb-[8px]">
              Basic Information
            </h3>
            <label className="block text-[14px] font-['Gilroy-Medium'] text-[#1B1717] mb-[8px]">
              Category
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              placeholder="Enter Category Name"
              className="w-full px-4 h-[43px] border border-[#1B1717] border-opacity-50 rounded-lg focus:outline-none text-[12px] font-['Gilroy-Medium']"
              required
            />
          </div>

          {/* Fee Configuration */}
          <div className="mb-6">
            <h3 className="text-[18px] font-['Gilroy-SemiBold'] text-[#1B1717] mb-2">
              Fee Configuration
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[14px] font-['Gilroy-Medium'] text-[#1B1717] mb-2">
                  Conv Fee
                </label>
                <input
                  type="number"
                  value={formData.convFee}
                  onChange={(e) =>
                    setFormData({ ...formData, convFee: e.target.value })
                  }
                  placeholder="Enter Conv Fee"
                  className="w-full px-4 h-[43px] border border-[#1B1717] border-opacity-50 rounded-lg focus:outline-none text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-[14px] font-['Gilroy-Medium'] text-[#1B1717] mb-2">
                  Flat Fee
                </label>
                <input
                  type="number"
                  value={formData.flatFee}
                  onChange={(e) =>
                    setFormData({ ...formData, flatFee: e.target.value })
                  }
                  placeholder="Enter Flat Fee"
                  className="w-full px-4 h-[43px] border border-[#1B1717] border-opacity-50 rounded-lg focus:outline-none text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-[14px] font-['Gilroy-Medium'] text-[#1B1717] mb-2">
                  Percent Fee
                </label>
                <input
                  type="number"
                  value={formData.percentFee}
                  onChange={(e) =>
                    setFormData({ ...formData, percentFee: e.target.value })
                  }
                  placeholder="Enter Percent Fee"
                  className="w-full px-4 h-[43px] border border-[#1B1717] border-opacity-50 rounded-lg focus:outline-none  text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-[14px] font-['Gilroy-Medium'] text-[#1B1717] mb-2">
                  GST Rate
                </label>
                <input
                  type="number"
                  value={formData.gstRate}
                  onChange={(e) =>
                    setFormData({ ...formData, gstRate: e.target.value })
                  }
                  placeholder="Enter GST Rate"
                  className="w-full px-4 h-[43px] border border-[#1B1717] border-opacity-50 rounded-lg focus:outline-none text-sm"
                  required
                />
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
                CCF1
              </span>
              <span className="text-[14px] font-['Gilroy-Medium'] text-[#1B1717]">
                Active
              </span>

              {/* ===== Row 1 : Cards ===== */}
              {/* CCF1 Card */}
              <div className="flex justify-between items-start border border-gray-300 rounded-xl px-2 py-3">
                <div>
                  <h3 className="text-[12px] font-['Gilroy-Medium'] text-[#1B1717]">
                    CCF1
                  </h3>
                  <p className="text-[12px] mt-1 text-gray-500 font-['Gilroy-Regular']">
                    Enable CCF1 For This Operator
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, ccfi: !formData.ccfi })
                  }
                  className={`w-[42px] h-[24px] rounded-full relative transition-all
                ${formData.ccfi ? "bg-[#039155]" : "bg-gray-300"}`}
                >
                  <span
                    className={`absolute top-[2px] w-5 h-5 bg-white rounded-full shadow transition-all
                    ${formData.ccfi ? "right-[2px]" : "left-[2px]"}`}
                  />
                </button>
              </div>

              {/* Active Card */}
              <div className="flex justify-between items-start border border-gray-300 rounded-xl px-2 py-3">
                <div>
                  <h3 className="text-[12px] font-['Gilroy-Medium'] text-[#1B1717]">
                    Active
                  </h3>
                  <p className="text-[12px] mt-1 text-gray-500 font-['Gilroy-Regular']">
                    Activate This Operator
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
              disabled={isLoading}
              className="flex-1 px-6 py-3 rounded-lg bg-[#039155] text-[18px] text-white font-['Gilroy-Medium'] hover:bg-[#027a47] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {mode === "edit" ? "Updating..." : "Adding..."}
                </>
              ) : mode === "edit" ? (
                "Update Operator"
              ) : (
                "Add Operator"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BBPSSettings = () => {
  const dispatch = useDispatch();
  const { company } = useCompany();
  const {
    categories: reduxCategories,
    loading: reduxLoading,
    totalPages: apiTotalPages,
    currentPage: apiCurrentPage,
    createCategorySuccess,
  } = useSelector((state) => state.bbps);

  const loading = false; // Force false for demo
  const categories = reduxCategories?.length > 0 ? reduxCategories : DUMMY_BBPS_CATEGORIES;

  const [activeTab, setActiveTab] = useState("operators"); // 'operators', 'biller', 'payment'
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOperator, setEditingOperator] = useState(null);
  const [modalMode, setModalMode] = useState("add");
  const [lastOperation, setLastOperation] = useState(null); // Track if last operation was 'create' or 'update'

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
        setCurrentPage(1); // Reset to page 1 when search changes
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch categories - handles initial load, search, and pagination - DISABLED for demo
  useEffect(() => {
    /*
    const companyId = getCompanyId();
    if (!companyId || activeTab !== "operators") return;

    if (debouncedSearchQuery.trim()) {
      dispatch(
        searchBBPSCategories(
          companyId,
          debouncedSearchQuery,
          currentPage,
          cardsPerPage,
        ),
      );
    } else {
      dispatch(getAllBBPSCategories(companyId, currentPage, cardsPerPage));
    }
    */
  }, [debouncedSearchQuery, currentPage, dispatch, company, activeTab]);

  // Map categories to operator format
  const mappedOperators = categories.map(mapCategoryToOperator);

  // Calculate which 3 page numbers to show
  const getVisiblePages = () => {
    const totalPages = apiTotalPages || 1;
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

  const handleAddOperator = async (formData) => {
    // const companyId = getCompanyId();
    // if (companyId) {
    //   setLastOperation("create");
    //   await dispatch(createBBPSCategory(companyId, formData));
    // }
    console.log("Mock Add Operator:", formData);
    alert("Operator added successfully! (Demo Mode)");
    setIsModalOpen(false);
  };

  const handleEditOperator = async (formData) => {
    // const companyId = getCompanyId();
    // const categoryId = editingOperator?._id || editingOperator?.id;
    // if (companyId && categoryId) {
    //   setLastOperation("update");
    //   await dispatch(updateBBPSCategory(companyId, categoryId, formData));
    // }
    console.log("Mock Edit Operator:", formData);
    alert("Operator updated successfully! (Demo Mode)");
    setIsModalOpen(false);
    setEditingOperator(null);
  };

  // Close modal and refresh list when operation succeeds
  useEffect(() => {
    if (createCategorySuccess && !loading && isModalOpen && lastOperation) {
      const companyId = getCompanyId();
      if (companyId) {
        // If update operation, always call getAllBBPSCategories
        if (lastOperation === "update") {
          dispatch(getAllBBPSCategories(companyId, currentPage, cardsPerPage));
        } else {
          // For create operation, respect search state
          if (debouncedSearchQuery.trim()) {
            dispatch(
              searchBBPSCategories(
                companyId,
                debouncedSearchQuery,
                currentPage,
                cardsPerPage,
              ),
            );
          } else {
            dispatch(
              getAllBBPSCategories(companyId, currentPage, cardsPerPage),
            );
          }
        }
        setIsModalOpen(false);
        setEditingOperator(null);
        setModalMode("add");
        setLastOperation(null);
      }
    }
  }, [
    createCategorySuccess,
    loading,
    isModalOpen,
    lastOperation,
    debouncedSearchQuery,
    currentPage,
    dispatch,
    company,
  ]);

  const handleToggleChange = async (operator, field, newValue) => {
    const companyId = getCompanyId();
    const categoryId = operator._id || operator.id;

    if (!companyId || !categoryId) return;

    // Prepare update data with current operator values and the changed toggle
    const updateData = {
      category: operator.name,
      convFee: operator.fees?.convFee || 0,
      flatFee: operator.fees?.flatFee || 0,
      percentFee: operator.fees?.percentFee || 0,
      gstRate: operator.fees?.gstRate || 0,
      ccfi: field === "ccfi" ? newValue : operator.toggles?.ccfi || false,
      active:
        field === "active"
          ? newValue
          : operator.toggles?.active !== undefined
            ? operator.toggles.active
            : true,
      deleted:
        field === "deleted" ? newValue : operator.toggles?.deleted || false,
    };

    // await dispatch(updateBBPSCategory(companyId, categoryId, updateData));
    // Refresh the list after toggle update
    // dispatch(getAllBBPSCategories(companyId, currentPage, cardsPerPage));
    console.log("Mock Toggle Change:", { field, newValue });
    alert(`${field} updated to ${newValue} (Demo Mode)`);
  };

  const handleEditClick = (operator) => {
    setEditingOperator(operator);
    setModalMode("edit");
    setIsModalOpen(true);
    setLastOperation(null); // Reset last operation when opening modal
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingOperator(null);
    setModalMode("add");
  };

  const handleAddClick = () => {
    setEditingOperator(null);
    setModalMode("add");
    setIsModalOpen(true);
    setLastOperation(null); // Reset last operation when opening modal
  };

  return (
    <div className="py-4 bg-gray-50 min-h-screen">
      {/* Tabs */}

      <div className="bg-[#FFFFFF] rounded-3xl p-4 mb-[24px] w-2/3 ">
        <div className="relative inline-flex gap-[143px]">
          {[
            { key: "operators", label: "Operator Settings" },
            { key: "biller", label: "Biller Settings" },
            { key: "payment", label: "Payment Setting" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="relative flex justify-center"
            >
              {/* Size-defining wrapper (same pattern as before) */}
              <span className="relative px-5 py-2.5 h-[40px] rounded-full flex items-center">
                {/* Moving background */}
                {activeTab === key && (
                  <motion.span
                    layoutId="active-settings-pill"
                    className="absolute inset-0 rounded-full bg-[#039155] shadow-sm"
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 35,
                    }}
                  />
                )}

                {/* Text */}
                <span
                  className={`relative z-10 text-sm font-['Gilroy-Medium'] whitespace-nowrap transition-colors ${
                    activeTab === key
                      ? "text-white"
                      : "text-gray-700 hover:text-[#039155]"
                  }`}
                >
                  {label}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Conditional Content Rendering */}
      {activeTab === "operators" && (
        <>
          {/* Search & Add */}
          <div className="flex justify-between bg-white rounded-xl p-4 items-center mb-6">
            <div className="relative ">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search Operator"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="  border-[#1B1717] border-opacity-50 border-[0.5px] px-10 py-2.5 rounded-lg w-[622px] focus:outline-none text-sm"
              />
            </div>
            <button
              onClick={handleAddClick}
              className="bg-[#039155] hover:bg-[#027a46] text-white px-5 py-2.5 rounded-lg text-[14px] font-['Gilroy-Medium'] flex items-center gap-2 transition-colors shadow-sm"
            >
              <Plus className="w-3 h-3 rounded-3xl border border-[#FFFFFF]" />
              Add New Operator
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 bg-[#FFFFFF] rounded-xl p-4 lg:grid-cols-3 gap-6">
            {loading && mappedOperators.length === 0 ? (
              // Show skeleton loaders on initial load
              Array.from({ length: cardsPerPage }).map((_, index) => (
                <OperatorCardSkeleton key={`skeleton-${index}`} />
              ))
            ) : mappedOperators.length > 0 ? (
              mappedOperators.map((op) => (
                <OperatorCard
                  key={op._id || op.name}
                  operator={op}
                  onEditClick={handleEditClick}
                  onToggleChange={handleToggleChange}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                No operators found
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === "biller" && <BillerSettings />}

      {activeTab === "payment" && <PaymentSettings />}

      {/* Pagination */}
      {activeTab === "operators" && (apiTotalPages || 0) > 0 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || loading}
            className={`px-3 py-2.5  border-[#1B1717] rounded-[4px] border-opacity-20 border-[0.5px] hover:bg-gray-50 transition-colors ${
              currentPage === 1 || loading
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {visiblePages.map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              disabled={loading}
              className={`px-4 py-1.5 rounded font-[Gilroy-Medium] transition-colors ${
                currentPage === page
                  ? "bg-[#039155] text-white"
                  : "border border-gray-300 hover:bg-gray-50"
              } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(apiTotalPages || 1, prev + 1))
            }
            disabled={currentPage === (apiTotalPages || 1) || loading}
            className={`px-3 py-2.5   border-[#1B1717] rounded-[4px] border-opacity-20 border-[0.5px] hover:bg-gray-50 transition-colors ${
              currentPage === (apiTotalPages || 1) || loading
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Add/Edit Operator Modal */}
      <AddOperatorModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAdd={handleAddOperator}
        onEdit={handleEditOperator}
        operator={editingOperator}
        mode={modalMode}
        isLoading={loading}
      />
    </div>
  );
};

export default BBPSSettings;
