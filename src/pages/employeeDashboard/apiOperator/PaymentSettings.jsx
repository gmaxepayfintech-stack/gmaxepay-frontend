import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, Plus, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCompany } from "../../../context/CompanyContext";
import {
  getAllBBPSPaymentInfo,
  searchBBPSPaymentInfo,
  createBBPSPaymentInfo,
  updateBBPSPaymentInfo,
} from "../../../redux/action/bbpsAction";

// ── Dummy data ──────────────────────────────────────────────────────────────
const DUMMY_PAYMENTS = [
  { id: "P001", initiatingChannel: "WEB", paymentMethod: { type: "prepaid", allowedTokens: ["UPI", "CARD"] }, paymentInfo: { gateway: "Razorpay", merchantId: "MID_001" } },
  { id: "P002", initiatingChannel: "MOBILE", paymentMethod: { type: "postpaid", allowedTokens: ["WALLET"] }, paymentInfo: { gateway: "Paytm", merchantId: "MID_002" } },
];

// Helper function to map API response to payment method format
const mapPaymentInfoToComponent = (paymentInfo) => {
  return {
    id: paymentInfo.id || paymentInfo._id,
    initChannel: paymentInfo.initiatingChannel || "",
    paymentMethod:
      typeof paymentInfo.paymentMethod === "object"
        ? JSON.stringify(paymentInfo.paymentMethod, null, 2)
        : paymentInfo.paymentMethod || "",
    paymentInformation:
      typeof paymentInfo.paymentInfo === "object"
        ? JSON.stringify(paymentInfo.paymentInfo, null, 2)
        : paymentInfo.paymentInfo || "",
  };
};

// Skeleton Loader Component
const PaymentMethodCardSkeleton = () => {
  return (
    <div className=" border-[#1B1717] border-opacity-30 border-[0.5px] rounded-xl p-4 bg-white animate-pulse">
      <div className="flex justify-between items-center mb-4">
        <div className="h-4 w-24 bg-gray-300 rounded"></div>
        <div className="h-4 w-16 bg-gray-300 rounded"></div>
      </div>
      <div className="mb-4">
        <div className="h-3 w-32 bg-gray-300 rounded mb-2"></div>
        <div className="h-16 bg-gray-300 rounded"></div>
      </div>
      <div className="mb-4">
        <div className="h-3 w-32 bg-gray-300 rounded mb-2"></div>
        <div className="h-16 bg-gray-300 rounded"></div>
      </div>
      <div className="h-10 w-full bg-gray-300 rounded-lg"></div>
    </div>
  );
};

const AddPaymentMethodModal = ({
  isOpen,
  onClose,
  onAdd,
  onEdit,
  paymentMethod,
  mode = "add",
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    initChannel: "",
    paymentMethod: "",
    paymentInfo: "",
  });

  // Update form data when paymentMethod prop changes (for edit mode)
  useEffect(() => {
    if (paymentMethod && mode === "edit") {
      setFormData({
        initChannel: paymentMethod.initChannel?.toString() || "",
        paymentMethod: paymentMethod.paymentMethod || "",
        paymentInfo: paymentMethod.paymentInformation || "",
      });
    } else {
      setFormData({
        initChannel: "",
        paymentMethod: "",
        paymentInfo: "",
      });
    }
  }, [paymentMethod, mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === "edit" && onEdit) {
      await onEdit(formData);
    } else if (onAdd) {
      await onAdd(formData);
    }
    // Don't close modal here - let the useEffect handle it after success
  };

  const handleClose = () => {
    setFormData({
      initChannel: "",
      paymentMethod: "",
      paymentInfo: "",
    });
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
              {mode === "edit"
                ? "Edit Payment Method"
                : "Add New Payment Method"}
            </h2>
            <p className="text-sm text-gray-600 font-['Gilroy-Regular']">
              {mode === "edit"
                ? "Update Payment Method Information"
                : "Manage Your Payment Configurations"}
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute right-0 top-0 w-10 h-10 flex items-center justify-center rounded-xl bg-[#039155] hover:opacity-90 transition"
          >
            <X className="w-6 h-6 text-[#FFFFFF] rounded-full  border-[2.5px] border-[#FFFFFF] p-0.5" />
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
                  Initiating Channel <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.initChannel}
                  onChange={(e) =>
                    setFormData({ ...formData, initChannel: e.target.value })
                  }
                  placeholder="Enter Initiating Channel"
                  className="w-full px-4 h-[43px] border border-[#1B1717] border-opacity-50 rounded-lg focus:outline-none text-[12px] font-['Gilroy-Medium']"
                  required
                />
              </div>
            </div>
          </div>

          {/* Payment Method Configuration (JSON) */}
          <div className="mb-6">
            <h3 className="text-[18px] font-['Gilroy-SemiBold'] text-[#1B1717] mb-2">
              Payment Method Configuration (JSON){" "}
              <span className="text-red-500">*</span>
            </h3>
            <div className="space-y-4">
              <div>
                <textarea
                  value={formData.paymentMethod}
                  onChange={(e) =>
                    setFormData({ ...formData, paymentMethod: e.target.value })
                  }
                  placeholder="Enter Payment Method Configuration"
                  className="w-full px-4 py-3 border border-[#1B1717] border-opacity-50 rounded-lg focus:outline-none text-[12px] font-['Gilroy-Medium'] min-h-[100px] resize-y"
                  required
                />
              </div>
            </div>
          </div>

          {/* Payment Information (JSON) */}
          <div className="mb-6">
            <h3 className="text-[18px] font-['Gilroy-SemiBold'] text-[#1B1717] mb-2">
              Payment Information (JSON) <span className="text-red-500">*</span>
            </h3>
            <div className="space-y-4">
              <div>
                <textarea
                  value={formData.paymentInfo}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      paymentInfo: e.target.value,
                    })
                  }
                  placeholder="Enter Payment Information"
                  className="w-full px-4 py-3 border border-[#1B1717] border-opacity-50 rounded-lg focus:outline-none text-[12px] font-['Gilroy-Medium'] min-h-[100px] resize-y"
                  required
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 h-[48px] rounded-lg border border-gray-300 bg-white text-[16px] text-[#1B1717] font-['Gilroy-Medium'] hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 h-[48px] rounded-lg bg-[#039155] text-[16px] text-white font-['Gilroy-Medium'] hover:bg-[#027a47] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                "Update Method"
              ) : (
                "Add Method"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PaymentMethodCard = ({ paymentMethod, onEditClick }) => {
  return (
    <div className=" border-[#1B1717] border-opacity-30 border-[0.5px] rounded-xl p-4 bg-white hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <span className="font-['Gilroy-Regular'] text-[14px] text-[#1B1717]">
          Init Channel
        </span>
        <span className="font-['Gilroy-Medium'] text-[14px] text-[#1B1717]">
          {paymentMethod.initChannel}
        </span>
      </div>

      {/* Payment Method */}
      <div className="mb-4">
        <label className="block text-[12px] font-['Gilroy-Medium'] text-[#1B1717] mb-2">
          Payment Method
        </label>
        <div className="px-3 py-2 border border-[#1B1717] border-opacity-20 rounded-lg min-h-[60px]">
          <pre className="text-[12px] font-['Gilroy-Regular'] text-[#1B1717] whitespace-pre-wrap break-words">
            {paymentMethod.paymentMethod}
          </pre>
        </div>
      </div>

      {/* Payment Information */}
      <div className="mb-4">
        <label className="block text-[12px] font-['Gilroy-Medium'] text-[#1B1717] mb-2">
          Payment Information
        </label>
        <div className="px-3 py-2 border border-[#1B1717] border-opacity-20 rounded-lg min-h-[60px]">
          <pre className="text-[12px] font-['Gilroy-Regular'] text-[#1B1717] whitespace-pre-wrap break-words">
            {paymentMethod.paymentInformation}
          </pre>
        </div>
      </div>

      {/* Action */}
      <button
        onClick={() => onEditClick && onEditClick(paymentMethod)}
        className="w-full bg-[#039155] hover:bg-[#027a41] text-[#FFFFFF] py-2.5 rounded-lg text-[18px] font-['Gilroy-SemiBold] transition-colors"
      >
        Edit
      </button>
    </div>
  );
};

const PaymentSettings = () => {
  const dispatch = useDispatch();
  const { company } = useCompany();
  const {
    paymentInfo: reduxPaymentInfo,
    loading: reduxLoading,
    paymentInfoTotalPages: apiTotalPages,
    paymentInfoCurrentPage,
    createPaymentInfoSuccess,
  } = useSelector((state) => state.bbps);

  const loading = false; // Force false for demo
  const paymentInfo = reduxPaymentInfo?.length > 0 ? reduxPaymentInfo : DUMMY_PAYMENTS;
  const paymentInfoTotalPages = reduxPaymentInfo?.length > 0 ? apiTotalPages : 1;

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState(null);
  const [modalMode, setModalMode] = useState("add");
  const [lastOperation, setLastOperation] = useState(null);

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

  // Fetch payment info - handles initial load, search, and pagination - DISABLED for demo
  useEffect(() => {
    /*
    const companyId = getCompanyId();
    if (!companyId) return;

    if (debouncedSearchQuery.trim()) {
      dispatch(
        searchBBPSPaymentInfo(
          companyId,
          debouncedSearchQuery,
          currentPage,
          cardsPerPage,
        ),
      );
    } else {
      dispatch(getAllBBPSPaymentInfo(companyId, currentPage, cardsPerPage));
    }
    */
  }, [debouncedSearchQuery, currentPage, dispatch, company]);

  // Map payment info to component format
  const mappedPaymentMethods = paymentInfo.map(mapPaymentInfoToComponent);

  // Calculate which 3 page numbers to show
  const getVisiblePages = () => {
    const totalPages = paymentInfoTotalPages || 1;
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

  // Close modal and refresh list when operation succeeds
  useEffect(() => {
    if (createPaymentInfoSuccess && !loading && isModalOpen && lastOperation) {
      const companyId = getCompanyId();
      if (companyId) {
        // Always call getAllBBPSPaymentInfo after update
        if (lastOperation === "update") {
          dispatch(getAllBBPSPaymentInfo(companyId, currentPage, cardsPerPage));
        } else {
          // For create operation, respect search state
          if (debouncedSearchQuery.trim()) {
            dispatch(
              searchBBPSPaymentInfo(
                companyId,
                debouncedSearchQuery,
                currentPage,
                cardsPerPage,
              ),
            );
          } else {
            dispatch(
              getAllBBPSPaymentInfo(companyId, currentPage, cardsPerPage),
            );
          }
        }
        setIsModalOpen(false);
        setEditingPaymentMethod(null);
        setModalMode("add");
        setLastOperation(null);
      }
    }
  }, [
    createPaymentInfoSuccess,
    loading,
    isModalOpen,
    lastOperation,
    debouncedSearchQuery,
    currentPage,
    dispatch,
    company,
  ]);

  const handleAddPaymentMethod = async (formData) => {
    /*
    if (companyId) {
      setLastOperation("create");
      await dispatch(
        createBBPSPaymentInfo(companyId, {
          initChannel: formData.initChannel,
          initiatingChannel: formData.initChannel,
          paymentMethod: formData.paymentMethod,
          paymentInfo: formData.paymentInfo,
        }),
      );
    }
    */
    console.log("Mock Add Payment Method:", formData);
    alert("Payment method added successfully! (Demo Mode)");
    setIsModalOpen(false);
  };

  const handleEditPaymentMethod = async (formData) => {
    /*
    if (companyId && paymentInfoId) {
      setLastOperation("update");
      await dispatch(
        updateBBPSPaymentInfo(companyId, paymentInfoId, {
          initChannel: formData.initChannel,
          initiatingChannel: formData.initChannel,
          paymentMethod: formData.paymentMethod,
          paymentInfo: formData.paymentInfo,
        }),
      );
    }
    */
    console.log("Mock Edit Payment Method:", formData);
    alert("Payment method updated successfully! (Demo Mode)");
    setIsModalOpen(false);
    setEditingPaymentMethod(null);
  };

  const handleEditClick = (paymentMethod) => {
    setEditingPaymentMethod(paymentMethod);
    setModalMode("edit");
    setIsModalOpen(true);
    setLastOperation(null); // Reset last operation when opening modal
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPaymentMethod(null);
    setModalMode("add");
    setLastOperation(null);
  };

  const handleAddClick = () => {
    setEditingPaymentMethod(null);
    setModalMode("add");
    setIsModalOpen(true);
    setLastOperation(null); // Reset last operation when opening modal
  };

  return (
    <div>
      {/* Search & Action Bar */}
      <div className="flex justify-between bg-white rounded-xl p-4 items-center mb-6 gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search Payments Methods"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="  border-[#1B1717] border-opacity-50 border-[0.5px] px-10 py-2.5 rounded-lg w-[700px] focus:outline-none text-sm"
          />
        </div>
        <button
          onClick={handleAddClick}
          className="bg-[#039155] hover:bg-[#027a46] text-white px-5 py-2.5 rounded-lg text-[14px] font-['Gilroy-Medium'] flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap"
        >
          <Plus className="w-3 h-3 rounded-3xl border border-[#FFFFFF]" />
          Add Payment Method
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 bg-[#FFFFFF] rounded-xl p-4 lg:grid-cols-3 gap-6">
        {loading && mappedPaymentMethods.length === 0 ? (
          // Show skeleton loaders on initial load
          Array.from({ length: cardsPerPage }).map((_, index) => (
            <PaymentMethodCardSkeleton key={`skeleton-${index}`} />
          ))
        ) : mappedPaymentMethods.length > 0 ? (
          mappedPaymentMethods.map((method) => (
            <PaymentMethodCard
              key={method.id}
              paymentMethod={method}
              onEditClick={handleEditClick}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500">
            No payment methods found
          </div>
        )}
      </div>

      {/* Pagination */}
      {(paymentInfoTotalPages || 0) > 0 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || loading}
            className={`px-3 py-2.5   border-[#1B1717] rounded-[4px] border-opacity-20 border-[0.5px] hover:bg-gray-50 transition-colors ${
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
              setCurrentPage((prev) =>
                Math.min(paymentInfoTotalPages || 1, prev + 1),
              )
            }
            disabled={currentPage === (paymentInfoTotalPages || 1) || loading}
            className={`px-3 py-2.5   border-[#1B1717] rounded-[4px] border-opacity-20 border-[0.5px] hover:bg-gray-50 transition-colors ${
              currentPage === (paymentInfoTotalPages || 1) || loading
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Add/Edit Payment Method Modal */}
      <AddPaymentMethodModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAdd={handleAddPaymentMethod}
        onEdit={handleEditPaymentMethod}
        paymentMethod={editingPaymentMethod}
        mode={modalMode}
        isLoading={loading}
      />
    </div>
  );
};

export default PaymentSettings;
