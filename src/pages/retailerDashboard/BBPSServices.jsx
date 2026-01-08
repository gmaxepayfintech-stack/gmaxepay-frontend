import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineArrowNarrowLeft } from "react-icons/hi";
import { CreditCard, ChevronDown, Download } from "lucide-react";
import PropTypes from "prop-types";

// Sample transaction data
const lastTransactions = [
    {
        id: 1,
        type: "Credit Card",
        date: "11/09/2025 01:28 PM",
        transactionId: "KKBK002254",
        amount: "₹ 500",
        status: "Success"
    },
    {
        id: 2,
        type: "Credit Card",
        date: "11/09/2025 01:28 PM",
        transactionId: "KKBK002255",
        amount: "₹ 500",
        status: "Success"
    },
    {
        id: 3,
        type: "Credit Card",
        date: "11/09/2025 01:28 PM",
        transactionId: "KKBK002256",
        amount: "₹ 500",
        status: "Failed"
    },
    {
        id: 4,
        type: "Credit Card",
        date: "11/09/2025 01:28 PM",
        transactionId: "KKBK002257",
        amount: "₹ 500",
        status: "Success"
    }
];

const categories = ["Select", "Electricity", "Gas", "Water", "Credit Card", "Insurance", "Loan Repayment"];

const TransactionCard = ({ transaction }) => {
    const isSuccess = transaction.status === "Success";

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 hover:shadow-sm transition">
            {/* Top Row */}
            <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                        <CreditCard className="w-5 h-5 text-white" />
                    </div>

                    <div>
                        <div className="text-[14px] font-['Gilroy-Medium'] text-[#1B1717]">
                            {transaction.type}
                        </div>
                        <div className="text-[12px] font-['Gilroy-Regular'] text-gray-500">
                            {transaction.date}
                        </div>
                        <div className="text-[12px] font-['Gilroy-Regular'] text-gray-500 mt-1">
                            Transaction ID : {transaction.transactionId}
                        </div>
                    </div>
                </div>

                {/* Amount + Status */}
                <div className="text-right">
                    <div className="text-[14px] font-['Gilroy-Medium'] text-[#039155]">
                        {transaction.amount}
                    </div>
                    <div
                        className={`text-[12px] font-['Gilroy-Medium'] ${isSuccess ? "text-green-600" : "text-red-600"
                            }`}
                    >
                        {transaction.status}
                    </div>
                </div>
            </div>

            {/* Button */}
            <button className="w-full mt-4 bg-[#039155] hover:bg-[#027a46] text-white px-4 py-2 rounded-lg text-[13px] font-['Gilroy-Medium'] flex items-center justify-center gap-2 transition">
                <Download className="w-4 h-4" />
                Download Receipt
            </button>
        </div>
    );
};


TransactionCard.propTypes = {
    transaction: PropTypes.object.isRequired,
};

const BBPSServices = ({ onBack }) => {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState("Select");
    const [billerName, setBillerName] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

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

    const handleProceed = () => {
        console.log("Proceed clicked", { selectedCategory, billerName });
        // Add navigation or form submission logic here
    };

    const handleCancel = () => {
        setSelectedCategory("Select");
        setBillerName("");
    };

    return (
        <div className="w-full">
            {/* Header */}
            {onBack && (
                <div className="flex items-start gap-3 mb-6">
                    <button
                        type="button"
                        aria-label="Back"
                        onClick={onBack}
                        className="flex items-center justify-center w-10 h-10 border border-gray-300 rounded-full bg-white hover:bg-gray-50 transition"
                    >
                        <HiOutlineArrowNarrowLeft className="text-2xl text-[#1B1717] opacity-80" />
                    </button>
                    <div className="flex-1">
                        <div className="text-[24px] font-['Gilroy-Medium'] text-[#1B1717]">
                            Bharat Connect Service
                        </div>
                    </div>
                </div>
            )}

            {!onBack && (
                <div className="mb-6">
                    <div className="text-[24px] font-['Gilroy-Medium'] text-[#1B1717]">
                        Bharat Connect Service
                    </div>
                </div>
            )}

            {/* Main Content - Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Side - Information */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="text-[20px] font-['Gilroy-Medium'] text-[#1B1717] mb-6">
                        Information
                    </div>

                    <div className="space-y-4">
                        {/* Select Category */}
                        <div>
                            <label className="block text-[14px] font-['Gilroy-Medium'] text-[#1B1717] mb-2">
                                Select Category
                            </label>
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between text-[14px] font-['Gilroy-Medium'] text-[#1B1717]"
                                >
                                    <span className={selectedCategory === "Select" ? "text-gray-400" : "text-[#1B1717]"}>
                                        {selectedCategory}
                                    </span>
                                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
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
                        </div>

                        {/* Billers Name */}
                        <div>
                            <label className="block text-[14px] font-['Gilroy-Medium'] text-[#1B1717] mb-2">
                                Billers Name
                            </label>
                            <input
                                type="text"
                                value={billerName}
                                onChange={(e) => setBillerName(e.target.value)}
                                placeholder="Enter Billers Name"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] focus:border-[#039155] text-[14px] font-['Gilroy-Medium']"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="flex-1 px-6 py-3 h-[48px] rounded-lg border border-gray-300 bg-white text-[16px] text-[#1B1717] font-['Gilroy-Medium'] hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleProceed}
                                className="flex-1 px-6 py-3 h-[48px] rounded-lg bg-[#039155] text-[16px] text-white font-['Gilroy-Medium'] hover:bg-[#027a46] transition"
                            >
                                Proceed
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Side - Last Transaction */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="text-[20px] font-['Gilroy-Medium'] text-[#1B1717] mb-6">
                        Last Transaction
                    </div>

                    <div className="max-h-[600px] overflow-y-auto">
                        {lastTransactions.map((transaction) => (
                            <TransactionCard key={transaction.id} transaction={transaction} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

BBPSServices.propTypes = {
    onBack: PropTypes.func,
};

export default BBPSServices;
