import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, ChevronLeft, ChevronRight, X } from 'lucide-react';

// Sample payment method data
const paymentMethods = [
    {
        id: 1,
        initChannel: 4,
        paymentMethod: '{"PaymentMode":"Cash","QuickPay":"N","SplitPay":"N"}',
        paymentInformation: '{"PaymentMode":"Cash","QuickPay":"N","SplitPay":"N"}'
    },
    {
        id: 2,
        initChannel: 4,
        paymentMethod: '{"PaymentMode":"Cash","QuickPay":"N","SplitPay":"N"}',
        paymentInformation: '{"PaymentMode":"Cash","QuickPay":"N","SplitPay":"N"}'
    },
    {
        id: 3,
        initChannel: 4,
        paymentMethod: '{"PaymentMode":"Cash","QuickPay":"N","SplitPay":"N"}',
        paymentInformation: '{"PaymentMode":"Cash","QuickPay":"N","SplitPay":"N"}'
    },
    {
        id: 4,
        initChannel: 4,
        paymentMethod: '{"PaymentMode":"Cash","QuickPay":"N","SplitPay":"N"}',
        paymentInformation: '{"PaymentMode":"Cash","QuickPay":"N","SplitPay":"N"}'
    },
    {
        id: 5,
        initChannel: 4,
        paymentMethod: '{"PaymentMode":"Cash","QuickPay":"N","SplitPay":"N"}',
        paymentInformation: '{"PaymentMode":"Cash","QuickPay":"N","SplitPay":"N"}'
    },
    {
        id: 6,
        initChannel: 4,
        paymentMethod: '{"PaymentMode":"Cash","QuickPay":"N","SplitPay":"N"}',
        paymentInformation: '{"PaymentMode":"Cash","QuickPay":"N","SplitPay":"N"}'
    },
    {
        id: 7,
        initChannel: 4,
        paymentMethod: '{"PaymentMode":"Cash","QuickPay":"N","SplitPay":"N"}',
        paymentInformation: '{"PaymentMode":"Cash","QuickPay":"N","SplitPay":"N"}'
    },
    {
        id: 8,
        initChannel: 4,
        paymentMethod: '{"PaymentMode":"Cash","QuickPay":"N","SplitPay":"N"}',
        paymentInformation: '{"PaymentMode":"Cash","QuickPay":"N","SplitPay":"N"}'
    },
    {
        id: 9,
        initChannel: 4,
        paymentMethod: '{"PaymentMode":"Cash","QuickPay":"N","SplitPay":"N"}',
        paymentInformation: '{"PaymentMode":"Cash","QuickPay":"N","SplitPay":"N"}'
    },
    {
        id: 10,
        initChannel: 4,
        paymentMethod: '{"PaymentMode":"Cash","QuickPay":"N","SplitPay":"N"}',
        paymentInformation: '{"PaymentMode":"Cash","QuickPay":"N","SplitPay":"N"}'
    },
    {
        id: 11,
        initChannel: 4,
        paymentMethod: '{"PaymentMode":"Cash","QuickPay":"N","SplitPay":"N"}',
        paymentInformation: '{"PaymentMode":"Cash","QuickPay":"N","SplitPay":"N"}'
    },
    {
        id: 12,
        initChannel: 4,
        paymentMethod: '{"PaymentMode":"Cash","QuickPay":"N","SplitPay":"N"}',
        paymentInformation: '{"PaymentMode":"Cash","QuickPay":"N","SplitPay":"N"}'
    },
    {
        id: 13,
        initChannel: 4,
        paymentMethod: '{"PaymentMode":"Cash","QuickPay":"N","SplitPay":"N"}',
        paymentInformation: '{"PaymentMode":"Cash","QuickPay":"N","SplitPay":"N"}'
    },
    {
        id: 14,
        initChannel: 4,
        paymentMethod: '{"PaymentMode":"Cash","QuickPay":"N","SplitPay":"N"}',
        paymentInformation: '{"PaymentMode":"Cash","QuickPay":"N","SplitPay":"N"}'
    },
    {
        id: 15,
        initChannel: 4,
        paymentMethod: '{"PaymentMode":"Cash","QuickPay":"N","SplitPay":"N"}',
        paymentInformation: '{"PaymentMode":"Cash","QuickPay":"N","SplitPay":"N"}'
    },
    {
        id: 16,
        initChannel: 4,
        paymentMethod: '{"PaymentMode":"Cash","QuickPay":"N","SplitPay":"N"}',
        paymentInformation: '{"PaymentMode":"Cash","QuickPay":"N","SplitPay":"N"}'
    },
    {
        id: 17,
        initChannel: 4,
        paymentMethod: '{"PaymentMode":"Cash","QuickPay":"N","SplitPay":"N"}',
        paymentInformation: '{"PaymentMode":"Cash","QuickPay":"N","SplitPay":"N"}'
    },
    {
        id: 18,
        initChannel: 4,
        paymentMethod: '{"PaymentMode":"Cash","QuickPay":"N","SplitPay":"N"}',
        paymentInformation: '{"PaymentMode":"Cash","QuickPay":"N","SplitPay":"N"}'
    }
];

const AddPaymentMethodModal = ({ isOpen, onClose, onAdd, onEdit, paymentMethod, mode = "add" }) => {
    const [formData, setFormData] = useState({
        initChannel: "",
        paymentMethod: "",
        paymentInformation: "",
    });

    // Update form data when paymentMethod prop changes (for edit mode)
    useEffect(() => {
        if (paymentMethod && mode === "edit") {
            setFormData({
                initChannel: paymentMethod.initChannel?.toString() || "",
                paymentMethod: paymentMethod.paymentMethod || "",
                paymentInformation: paymentMethod.paymentInformation || "",
            });
        } else {
            setFormData({
                initChannel: "",
                paymentMethod: "",
                paymentInformation: "",
            });
        }
    }, [paymentMethod, mode]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (mode === "edit" && onEdit) {
            onEdit(formData);
        } else {
            onAdd(formData);
        }
        setFormData({
            initChannel: "",
            paymentMethod: "",
            paymentInformation: "",
        });
        onClose();
    };

    const handleClose = () => {
        setFormData({
            initChannel: "",
            paymentMethod: "",
            paymentInformation: "",
        });
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
                            {mode === "edit" ? "Edit Payment Method" : "Add New Payment Method"}
                        </h2>
                        <p className="text-sm text-gray-600 font-['Gilroy-Regular']">
                            {mode === "edit" ? "Update Payment Method Information" : "Manage Your Payment Configurations"}
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
                                    Initiating Channel <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.initChannel}
                                    onChange={(e) => setFormData({ ...formData, initChannel: e.target.value })}
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
                            Payment Method Configuration (JSON) <span className="text-red-500">*</span>
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <textarea
                                    value={formData.paymentMethod}
                                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
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
                                    value={formData.paymentInformation}
                                    onChange={(e) => setFormData({ ...formData, paymentInformation: e.target.value })}
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
                            className="flex-1 px-6 py-3 h-[48px] rounded-lg bg-[#039155] text-[16px] text-white font-['Gilroy-Medium'] hover:bg-[#027a47] transition"
                        >
                            {mode === "edit" ? "Update Payment Method" : "Add Payment Method"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const PaymentMethodCard = ({ paymentMethod, onEditClick }) => {
    return (
        <div className="border border-[#1B1717] border-opacity-30 border-[0.5px] rounded-xl p-4 bg-white hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <span className="font-['Gilroy-Regular'] text-[14px] text-[#1B1717]">Init Channel</span>
                <span className="font-['Gilroy-Medium'] text-[14px] text-[#1B1717]">{paymentMethod.initChannel}</span>
            </div>

            {/* Payment Method */}
            <div className="mb-4">
                <label className="block text-[12px] font-['Gilroy-Medium'] text-[#1B1717] mb-2">
                    Payment Method
                </label>
                <div className="px-3 py-2 border border-[#1B1717] border-opacity-20 rounded-lg min-h-[60px]">
                    <pre className="text-[11px] font-['Gilroy-Regular'] text-[#1B1717] whitespace-pre-wrap break-words">
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
                    <pre className="text-[11px] font-['Gilroy-Regular'] text-[#1B1717] whitespace-pre-wrap break-words">
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
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPaymentMethod, setEditingPaymentMethod] = useState(null);
    const [modalMode, setModalMode] = useState("add");

    const cardsPerPage = 6; // 6 cards per page (2x3 grid)

    const filteredPaymentMethods = paymentMethods.filter((method) =>
        method.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase()) ||
        method.paymentInformation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        method.initChannel.toString().includes(searchQuery)
    );

    // Calculate pagination
    const totalPages = Math.ceil(filteredPaymentMethods.length / cardsPerPage);
    const startIndex = (currentPage - 1) * cardsPerPage;
    const endIndex = startIndex + cardsPerPage;
    const currentPaymentMethods = filteredPaymentMethods.slice(startIndex, endIndex);

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

    const handleAddPaymentMethod = (formData) => {
        // Handle adding new payment method here
        console.log("New payment method data:", formData);
        // You can add the payment method to the list or make an API call here
    };

    const handleEditPaymentMethod = (formData) => {
        // Handle editing payment method here
        console.log("Updated payment method data:", formData);
        // You can update the payment method in the list or make an API call here
    };

    const handleEditClick = (paymentMethod) => {
        setEditingPaymentMethod(paymentMethod);
        setModalMode("edit");
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPaymentMethod(null);
        setModalMode("add");
    };

    const handleAddClick = () => {
        setEditingPaymentMethod(null);
        setModalMode("add");
        setIsModalOpen(true);
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
                        className="border border-[#1B1717] border-opacity-50 border-[0.5px] px-10 py-2.5 rounded-lg w-[700px] focus:outline-none text-sm"
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
                {currentPaymentMethods.map((method) => (
                    <PaymentMethodCard key={method.id} paymentMethod={method} onEditClick={handleEditClick} />
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 0 && (
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

            {/* Add/Edit Payment Method Modal */}
            <AddPaymentMethodModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onAdd={handleAddPaymentMethod}
                onEdit={handleEditPaymentMethod}
                paymentMethod={editingPaymentMethod}
                mode={modalMode}
            />
        </div>
    );
};

export default PaymentSettings;
