import React, { useState, useEffect } from "react";
import { Search, Plus, ChevronLeft, ChevronRight, X } from "lucide-react";
import OperatorCard from './OperatorCard';
import BillerSettings from './BillerSettings';
import PaymentSettings from './PaymentSettings';


const operators = [
    // Original 6 Cards
    {
        name: "Broadband Postpaid",
        icon: "/img/Broadband.svg",
        iconColor: "text-green-600",
        active: true,
        fees: { convFee: 12, flatFee: 225, percentFee: 4, gstRate: 4 },
        toggles: { ccfi: false, active: true, deleted: false }
    },
    {
        name: "Cable TV",
        icon: "/img/Cable.svg",
        iconColor: "text-blue-400",
        active: true,
        fees: { convFee: 12, flatFee: 225, percentFee: 4, gstRate: 0 },
        toggles: { ccfi: false, active: false, deleted: false }
    },
    {
        name: "Clubs And Associations",
        icon: "/img/Club.svg",
        iconColor: "text-purple-600",
        active: true,
        fees: { convFee: 12, flatFee: 225, percentFee: 4, gstRate: 4 },
        toggles: { ccfi: true, active: false, deleted: false }
    },
    {
        name: "Donation",
        icon: "/img/Donation.svg",
        iconColor: "text-orange-500",
        active: true,
        fees: { convFee: 12, flatFee: 225, percentFee: 4, gstRate: 4 },
        toggles: { ccfi: true, active: false, deleted: false }
    },
    {
        name: "DTH",
        icon: "/img/DTH.svg",
        iconColor: "text-blue-600",
        active: true,
        fees: { convFee: 12, flatFee: 225, percentFee: 4, gstRate: 0 },
        toggles: { ccfi: false, active: false, deleted: false }
    },
    {
        name: "Electricity",
        icon: "/img/Electricity.svg",
        iconColor: "text-blue-400",
        active: true,
        fees: { convFee: 12, flatFee: 225, percentFee: 4, gstRate: 4 },
        toggles: { ccfi: true, active: false, deleted: false }
    },
    // First Image Services (12 cards)
    {
        name: "Credit Card",
        icon: "/img/CreditCard.svg",
        iconColor: "text-blue-500",
        active: true,
        fees: { convFee: 12, flatFee: 225, percentFee: 4, gstRate: 4 },
        toggles: { ccfi: false, active: true, deleted: false }
    },
    {
        name: "Education Fee",
        icon: "/img/Education.svg",
        iconColor: "text-orange-500",
        active: true,
        fees: { convFee: 12, flatFee: 225, percentFee: 4, gstRate: 4 },
        toggles: { ccfi: false, active: true, deleted: false }
    },
    {
        name: "Fast Tag",
        icon: "/img/FastTag.svg",
        iconColor: "text-purple-500",
        active: true,
        fees: { convFee: 12, flatFee: 225, percentFee: 4, gstRate: 4 },
        toggles: { ccfi: true, active: true, deleted: false }
    },
    {
        name: "Housing Society",
        icon: "/img/Housing.svg",
        iconColor: "text-yellow-600",
        active: true,
        fees: { convFee: 12, flatFee: 225, percentFee: 4, gstRate: 4 },
        toggles: { ccfi: true, active: true, deleted: false }
    },
    {
        name: "Insurance",
        icon: "/img/Insurance.svg",
        iconColor: "text-blue-600",
        active: true,
        fees: { convFee: 12, flatFee: 225, percentFee: 4, gstRate: 4 },
        toggles: { ccfi: false, active: false, deleted: false }
    },
    {
        name: "Life Insurance",
        icon: "/img/LifeInsurance.svg",
        iconColor: "text-blue-400",
        active: true,
        fees: { convFee: 12, flatFee: 225, percentFee: 4, gstRate: 4 },
        toggles: { ccfi: true, active: true, deleted: false }
    },
    {
        name: "Gas",
        icon: "/img/Gas.svg",
        iconColor: "text-red-500",
        active: true,
        fees: { convFee: 12, flatFee: 225, percentFee: 4, gstRate: 4 },
        toggles: { ccfi: true, active: true, deleted: false }
    },
    {
        name: "Hospital & Pathology",
        icon: "/img/Hospitality.svg",
        iconColor: "text-blue-600",
        active: true,
        fees: { convFee: 12, flatFee: 225, percentFee: 4, gstRate: 4 },
        toggles: { ccfi: false, active: false, deleted: false }
    },
    {
        name: "Hospital",
        icon: "/img/Hospital.svg",
        iconColor: "text-blue-400",
        active: true,
        fees: { convFee: 12, flatFee: 225, percentFee: 4, gstRate: 4 },
        toggles: { ccfi: true, active: true, deleted: false }
    },
    {
        name: "Health Insurance",
        icon: "/img/HealthInsurance.svg",
        iconColor: "text-blue-400",
        active: true,
        fees: { convFee: 12, flatFee: 225, percentFee: 4, gstRate: 4 },
        toggles: { ccfi: false, active: true, deleted: false }
    },
    {
        name: "Landline Post-Paid",
        icon: "/img/Landline.svg",
        iconColor: "text-blue-500",
        active: true,
        fees: { convFee: 12, flatFee: 225, percentFee: 4, gstRate: 0 },
        toggles: { ccfi: false, active: false, deleted: false }
    },
    {
        name: "Loan Repayment",
        icon: "/img/Loan.svg",
        iconColor: "text-green-600",
        active: true,
        fees: { convFee: 12, flatFee: 225, percentFee: 4, gstRate: 4 },
        toggles: { ccfi: true, active: true, deleted: false }
    },
    // Second Image Services (12 cards)
    {
        name: "LPG Gas",
        icon: "/img/Gas.svg",
        iconColor: "text-red-500",
        active: true,
        fees: { convFee: 12, flatFee: 225, percentFee: 4, gstRate: 4 },
        toggles: { ccfi: true, active: true, deleted: false }
    },
    {
        name: "Mobile Post-Paid",
        icon: "/img/Postpaid.svg",
        iconColor: "text-blue-500",
        active: true,
        fees: { convFee: 12, flatFee: 225, percentFee: 4, gstRate: 0 },
        toggles: { ccfi: false, active: false, deleted: false }
    },
    {
        name: "Mobile Pre-Paid",
        icon: "/img/Prepaid.svg",
        iconColor: "text-green-500",
        active: true,
        fees: { convFee: 12, flatFee: 225, percentFee: 4, gstRate: 4 },
        toggles: { ccfi: true, active: true, deleted: false }
    },
    {
        name: "Rental",
        icon: "/img/Rental.svg",
        iconColor: "text-red-500",
        active: true,
        fees: { convFee: 12, flatFee: 225, percentFee: 4, gstRate: 4 },
        toggles: { ccfi: true, active: true, deleted: false }
    },
    {
        name: "Subscription",
        icon: "/img/Subscription.svg",
        iconColor: "text-purple-500",
        active: true,
        fees: { convFee: 12, flatFee: 225, percentFee: 4, gstRate: 0 },
        toggles: { ccfi: false, active: false, deleted: false }
    },
    {
        name: "Water",
        icon: "/img/Electricity.svg",
        iconColor: "text-blue-500",
        active: true,
        fees: { convFee: 12, flatFee: 225, percentFee: 4, gstRate: 4 },
        toggles: { ccfi: true, active: true, deleted: false }
    },
    {
        name: "Municipal Services",
        icon: "/img/MunicipalService.svg",
        iconColor: "text-orange-500",
        active: true,
        fees: { convFee: 12, flatFee: 225, percentFee: 4, gstRate: 4 },
        toggles: { ccfi: true, active: true, deleted: false }
    },
    {
        name: "Municipal Taxes",
        icon: "/img/MunicipalTax.svg",
        iconColor: "text-blue-500",
        active: true,
        fees: { convFee: 12, flatFee: 225, percentFee: 4, gstRate: 0 },
        toggles: { ccfi: false, active: false, deleted: false }
    },
    {
        name: "Recurring Deposit",
        icon: "/img/RecurringDeposit.svg",
        iconColor: "text-blue-500",
        active: true,
        fees: { convFee: 12, flatFee: 225, percentFee: 4, gstRate: 0 },
        toggles: { ccfi: true, active: true, deleted: false }
    },
    {
        name: "NCMC",
        icon: "/img/NCMC.svg",
        iconColor: "text-orange-500",
        active: true,
        fees: { convFee: 12, flatFee: 225, percentFee: 4, gstRate: 4 },
        toggles: { ccfi: true, active: true, deleted: false }
    },
    {
        name: "Prepaid Meter",
        icon: "/img/PrepaidMeter.svg",
        iconColor: "text-blue-500",
        active: true,
        fees: { convFee: 12, flatFee: 225, percentFee: 4, gstRate: 0 },
        toggles: { ccfi: true, active: true, deleted: false }
    },
    {
        name: "E-Challan",
        icon: "/img/EChallan.svg",
        iconColor: "text-red-500",
        active: true,
        fees: { convFee: 12, flatFee: 225, percentFee: 4, gstRate: 4 },
        toggles: { ccfi: true, active: true, deleted: false }
    },
    // Third Image Services (3 cards)
    {
        name: "Agent Collection",
        icon: "/img/AgentCollection.svg",
        iconColor: "text-pink-500",
        active: true,
        fees: { convFee: 12, flatFee: 225, percentFee: 4, gstRate: 4 },
        toggles: { ccfi: true, active: false, deleted: false }
    },
    {
        name: "EV Recharge",
        icon: "/img/EVRecharge.svg",
        iconColor: "text-green-500",
        active: true,
        fees: { convFee: 12, flatFee: 225, percentFee: 4, gstRate: 0 },
        toggles: { ccfi: false, active: false, deleted: false }
    },
    {
        name: "NPS",
        icon: "/img/NPS.svg",
        iconColor: "text-purple-500",
        active: true,
        fees: { convFee: 12, flatFee: 225, percentFee: 4, gstRate: 4 },
        toggles: { ccfi: true, active: false, deleted: false }
    },
];


const AddOperatorModal = ({ isOpen, onClose, onAdd, onEdit, operator, mode = "add" }) => {
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
                convFee: operator.fees?.convFee || "",
                flatFee: operator.fees?.flatFee || "",
                percentFee: operator.fees?.percentFee || "",
                gstRate: operator.fees?.gstRate || "",
                ccfi: operator.toggles?.ccfi || false,
                active: operator.toggles?.active || true,
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

    const handleSubmit = (e) => {
        e.preventDefault();
        if (mode === "edit" && onEdit) {
            onEdit(formData);
        } else {
            onAdd(formData);
        }
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
        <div className="fixed inset-0 z-50 flex  items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl w-[498px]  max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative m-4">
                {/* Header */}
                <div className="relative flex items-start mb-6 w-full">
                    {/* Centered Title */}
                    <div className="mx-auto text-center">
                        <h2 className="text-[24px] font-['Gilroy-Medium'] text-[#1B1717] mb-1">
                            {mode === "edit" ? "Edit Operator" : "Add New Operator"}
                        </h2>
                        <p className="text-sm text-gray-600 font-['Gilroy-Regular']">
                            {mode === "edit" ? "Modify the operator information" : "Create A New Operator Entry"}
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
                        <label className="block text-[14px] font-['Gilroy-Medium'] text-[#1B1717] mb-[8px]">
                            Category
                        </label>
                        <input
                            type="text"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                                    onChange={(e) => setFormData({ ...formData, convFee: e.target.value })}
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
                                    onChange={(e) => setFormData({ ...formData, flatFee: e.target.value })}
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
                                    onChange={(e) => setFormData({ ...formData, percentFee: e.target.value })}
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
                                    onChange={(e) => setFormData({ ...formData, gstRate: e.target.value })}
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
                                OCF1
                            </span>
                            <span className="text-[14px] font-['Gilroy-Medium'] text-[#1B1717]">
                                Active
                            </span>

                            {/* ===== Row 1 : Cards ===== */}
                            {/* OCF1 Card */}
                            <div className="flex justify-between items-start border border-gray-300 rounded-xl px-2 py-3">
                                <div>
                                    <h3 className="text-[12px] font-['Gilroy-Medium'] text-[#1B1717]">
                                        OCF1
                                    </h3>
                                    <p className="text-[11px] mt-1 text-gray-500 font-['Gilroy-Regular']">
                                        Enable OCFI For This Operator
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
                                    <p className="text-[11px] mt-1 text-gray-500 font-['Gilroy-Regular']">
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

                            {/* ===== Row 2 : Label ===== */}
                            <span className="text-[14px] font-['Gilroy-Medium'] text-[#1B1717] md:col-span-2">
                                Deleted
                            </span>

                            {/* ===== Row 2 : Card ===== */}
                            {/* Deleted Card */}
                            <div className="flex justify-between items-start border border-gray-300 rounded-xl px-4 py-3">
                                <div>
                                    <h3 className="text-[12px] font-['Gilroy-Medium'] text-[#1B1717]">
                                        Deleted
                                    </h3>
                                    <p className="text-[11px] mt-1 text-gray-500 font-['Gilroy-Regular']">
                                        Mark As Deleted
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
                            className="flex-1 px-6 py-3 rounded-lg bg-[#039155] text-[18px] text-white font-['Gilroy-Medium'] hover:bg-[#027a47] transition"
                        >
                            {mode === "edit" ? "Update Operator" : "Add Operator"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const BBPSSettings = () => {
    const [activeTab, setActiveTab] = useState("operators"); // 'operators', 'biller', 'payment'
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOperator, setEditingOperator] = useState(null);
    const [modalMode, setModalMode] = useState("add");

    const cardsPerPage = 6; // 6 cards per page

    const filteredOperators = operators.filter((op) =>
        op.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Calculate pagination
    const totalPages = Math.ceil(filteredOperators.length / cardsPerPage);
    const startIndex = (currentPage - 1) * cardsPerPage;
    const endIndex = startIndex + cardsPerPage;
    const currentOperators = filteredOperators.slice(startIndex, endIndex);

    // Calculate which 3 page numbers to show
    const getVisiblePages = () => {
        if (totalPages <= 3) {
            // If total pages is 3 or less, show all
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        if (currentPage <= 2) {
            // Show first 3 pages: 1, 2, 3
            return [1, 2, 3];
        } else if (currentPage >= totalPages - 1) {
            // Show last 3 pages
            return [totalPages - 2, totalPages - 1, totalPages];
        } else {
            // Show current page with one before and one after
            return [currentPage - 1, currentPage, currentPage + 1];
        }
    };

    const visiblePages = getVisiblePages();

    // Reset to page 1 when search query changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const handleAddOperator = (formData) => {
        // Handle adding new operator here
        console.log("New operator data:", formData);
        // You can add the operator to the list or make an API call here
    };

    const handleEditOperator = (formData) => {
        // Handle editing operator here
        console.log("Updated operator data:", formData);
        // You can update the operator in the list or make an API call here
    };

    const handleEditClick = (operator) => {
        setEditingOperator(operator);
        setModalMode("edit");
        setIsModalOpen(true);
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
    };

    return (
        <div className="p-1 bg-gray-50 min-h-screen">
            {/* Tabs */}
            <div className="inline-flex gap-[143px] bg-[#FFFFFF] rounded-3xl p-4 mb-[24px]">
                <button 
                    onClick={() => setActiveTab("operators")}
                    className={`px-5 py-2.5 h-[40px] rounded-full text-sm font-['Gilroy-Medium'] transition-colors ${
                        activeTab === "operators" 
                            ? "bg-[#039155] text-white shadow-sm" 
                            : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                >
                    Operator Settings
                </button>
                <button 
                    onClick={() => setActiveTab("biller")}
                    className={`px-5 py-2.5 rounded-full text-sm font-['Gilroy-Medium'] transition-colors ${
                        activeTab === "biller" 
                            ? "bg-[#039155] text-white shadow-sm" 
                            : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                >
                    Biller Settings
                </button>
                <button 
                    onClick={() => setActiveTab("payment")}
                    className={`px-5 py-2.5 rounded-full text-sm font-['Gilroy-Medium'] transition-colors ${
                        activeTab === "payment" 
                            ? "bg-[#039155] text-white shadow-sm" 
                            : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                >
                    Payment Setting
                </button>
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
                                className="border border-[#1B1717] border-opacity-50 border-[0.5px] px-10 py-2.5 rounded-lg w-[622px] focus:outline-none text-sm"
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
                        {currentOperators.map((op) => (
                            <OperatorCard key={op.name} operator={op} onEditClick={handleEditClick} />
                        ))}
                    </div>
                </>
            )}

            {activeTab === "biller" && <BillerSettings />}

            {activeTab === "payment" && <PaymentSettings />}

            {/* Pagination */}
            {activeTab === "operators" && totalPages > 0 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className={`px-3 py-2.5 border border-[#1B1717] rounded-[4px] border-opacity-20 border-[0.5px] hover:bg-gray-50 transition-colors ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    {visiblePages.map((page) => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-4 py-1.5 rounded font-medium transition-colors ${currentPage === page
                                ? "bg-[#039155] text-white"
                                : "border border-gray-300 hover:bg-gray-50"
                                }`}
                        >
                            {page}
                        </button>
                    ))}
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-2.5 border border-[#1B1717] rounded-[4px] border-opacity-20 border-[0.5px] hover:bg-gray-50 transition-colors ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
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
            />
        </div>
    );
};

export default BBPSSettings;
