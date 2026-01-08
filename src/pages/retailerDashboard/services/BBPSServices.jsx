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
        icon: "/img/CreditCard.svg",
        date: "11/09/2025 01:28 PM",
        transactionId: "KKBK002254",
        amount: "₹ 500",
        status: "Success"
    },
    {
        id: 2,
        type: "Credit Card",
        icon: "/img/CreditCard.svg",
        date: "11/09/2025 01:28 PM",
        transactionId: "KKBK002255",
        amount: "₹ 500",
        status: "Success"
    },
    {
        id: 3,
        type: "Credit Card",
        icon: "/img/CreditCard.svg",
        date: "11/09/2025 01:28 PM",
        transactionId: "KKBK002256",
        amount: "₹ 500",
        status: "Failed"
    },
    {
        id: 4,
        type: "Credit Card",
        icon: "/img/CreditCard.svg",

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
                    <div className="text-[14px] font-['Gilroy-Medium'] text-[#1B1717]">
                        <img src={transaction.icon} alt="Credit Card" className="w-10 h-10" />
                    </div>
                    <div>
                        <div className="text-[14px] font-['Gilroy-Medium'] text-[#1B1717]">
                            {transaction.type}
                        </div>
                        <div className="text-[12px] font-['Gilroy-Medium'] text-gray-500">
                            {transaction.date}
                        </div>
                        <div className="text-[12px] font-['Gilroy-Regular'] text-[#1B1717] text-opacity-50 mt-1">
                            Transaction ID : <span className="text-[#1B1717] text-opacity-80">{transaction.transactionId}</span>
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
            <button className="w-full h-[39px] mt-4 bg-[#039155] hover:bg-[#027a46] text-white px-4 py-2 rounded-lg text-[12px] font-['Gilroy-SemiBold'] flex items-center justify-center gap-2 transition">
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
    const [amount, setAmount] = useState("");

    const [step, setStep] = useState("category");
    const [confirmedCategory, setConfirmedCategory] = useState("");
    const [confirmedBiller, setConfirmedBiller] = useState("");

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
        if (selectedCategory === "Select" || !billerName) return;
        setConfirmedCategory(selectedCategory);
        setConfirmedBiller(billerName);
        setStep("customer");
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
                        <div className="text-[16px] font-['Gilroy-Regular'] text-[#1B1717] text-opacity-80">
                            Making Connections Easier for Everyone                    </div>
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

            {/* Min Content - Two Column Layout */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Side - Information */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 lg:flex-[1.6]">                    {/* Dynamic Title */}
                    {step === "category" && (
                        <div className="text-[20px] font-['Gilroy-Medium'] text-[#1B1717] mb-6">
                            Information
                        </div>
                    )}


                    {/* STEP 1: Category */}
                    {step === "category" && (
                        <div className="space-y-4">
                            {/* Select Category */}
                            <div>
                                <label className="block text-[14px] font-['Gilroy-Medium'] mb-2">
                                    Select Category *
                                </label>

                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        type="button"
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg flex justify-between"
                                    >
                                        <span className={selectedCategory === "Select" ? "text-gray-400" : ""}>
                                            {selectedCategory}
                                        </span>
                                        <ChevronDown />
                                    </button>

                                    {isDropdownOpen && (
                                        <div className="absolute w-full bg-white border rounded-lg mt-1">
                                            {categories.map((category) => (
                                                <div
                                                    key={category}
                                                    onClick={() => {
                                                        setSelectedCategory(category);
                                                        setIsDropdownOpen(false);
                                                    }}
                                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                                >
                                                    {category}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Billers Name */}
                            {selectedCategory !== "Select" && (
                                <div>
                                    <label className="block text-[14px] font-['Gilroy-Medium'] mb-2">
                                        Billers Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={billerName}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            // keep only alphabets and spaces
                                            if (/^[A-Za-z ]*$/.test(val)) {
                                                setBillerName(val);
                                            }
                                        }}
                                        className="w-full px-4 py-3 border rounded-lg"
                                    />

                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handleCancel}
                                    className="flex-1 h-[48px] border rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleProceed}
                                    className="flex-1 h-[48px] bg-[#039155] text-white rounded-lg"
                                >
                                    Proceed
                                </button>
                            </div>
                        </div>
                    )}

                    {step === "customer" && (
                        <div className="space-y-6">

                            {/* Normal Header Content (NOT a card) */}
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="text-[18px] font-['Gilroy-Medium'] text-[#1B1717]">
                                        {selectedCategory}
                                    </div>
                                    <div className="text-[14px] text-gray-500">
                                        {billerName}
                                    </div>
                                </div>

                                <span className="text-[12px] bg-[#039155] text-white px-3 py-1 rounded-full">
                                    Service
                                </span>
                            </div>

                            {/* Customer Information */}
                            <div>
                                <p className="text-[16px] font-['Gilroy-Medium'] text-[#1B1717] mb-2">
                                    Customer Information
                                </p>

                                <label className="block text-[14px] font-['Gilroy-Medium'] mb-2">
                                    Mobile Number *
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter Mobile Number"
                                    maxLength={10}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none"
                                />
                            </div>

                            {/* Service Information */}
                            <div>
                                <p className="text-[16px] font-['Gilroy-Medium'] text-[#1B1717] mb-2">
                                    Service Information
                                </p>

                                <label className="block text-[14px] font-['Gilroy-Medium'] mb-2">
                                    Customer ID *
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter Customer ID"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none"
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => setStep("category")}
                                    className="flex-1 h-[48px] border border-gray-300 rounded-lg text-[#1B1717] font-['Gilroy-Medium'] hover:bg-gray-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={() => setStep("bill")}
                                    className="flex-1 h-[48px] bg-[#039155] hover:bg-[#027a46] text-white rounded-lg font-['Gilroy-Medium']"
                                >
                                    Fetch
                                </button>

                            </div>
                        </div>
                    )}
                    {step === "bill" && (
                        <div className="space-y-6">

                            {/* Bill Number */}
                            <div>
                                <label className="block text-[14px] font-['Gilroy-Medium'] mb-2">
                                    Bill Number
                                </label>
                                <input
                                    type="text"
                                    value="10213654"
                                    disabled
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-[#1B1717] text-opacity-80"
                                />
                                <p className="text-[12px] text-gray-500 mt-1">
                                    Bill Number Is Automatically Filled And Cannot Be Edited
                                </p>
                            </div>

                            {/* Amount To Pay */}
                            {/* Amount To Pay */}
                            <div>
                                <label className="block text-[14px] font-['Gilroy-Medium'] mb-2">
                                    Amount To Pay *
                                </label>

                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[20px] font-['Gilroy-Medium']">₹</span>

                                    <input
                                        type="number"
                                        placeholder="Enter Amount"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full pl-9 px-4 py-4 border border-dashed border-[#1B1717] border-opacity-30 rounded-lg 
           text-[20px] font-['Gilroy-Medium'] focus:outline-none"
                                    />
                                </div>


                            </div>


                            {/* Buttons */}
                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => setStep("customer")}
                                    className="flex-1 h-[48px] border border-gray-300 rounded-lg font-['Gilroy-Medium']"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={() => setStep("summary")}
                                    className="flex-1 h-[48px] bg-[#039155] text-white rounded-lg font-['Gilroy-Medium']"
                                >
                                    Proceed
                                </button>

                            </div>
                        </div>
                    )}

                    {step === "summary" && (
                        <div className="space-y-8">

                            {/* BILL DETAILS */}
                            <div>
                                <p className="text-[20px] font-['Gilroy-Medium'] text-[#1B1717] mb-3">
                                    Bill Details
                                </p>

                                <div className="bg-white border border-gray-200 rounded-[16px] p-6 space-y-4 shadow-sm">

                                    <div className="flex justify-between text-[14px] font-['Gilroy-Regular'] text-[#1B1717]">
                                        <span>Bill Number :1233210</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-y-4 text-[14px] font-['Gilroy-Medium'] text-[#1B1717]">
                                        <div>
                                            <p className="opacity-60 font-['Gilroy-Regular']">Customer Name</p>
                                            <p>Shrinivas</p>
                                        </div>

                                        <div>
                                            <p className="opacity-60 font-['Gilroy-Regular']">Service Provider</p>
                                            <p>{confirmedCategory}</p>
                                        </div>

                                        <div>
                                            <p className="opacity-60 font-['Gilroy-Regular']">Bill Period</p>
                                            <p>Monthly</p>
                                        </div>

                                        <div>
                                            <p className="opacity-60 font-['Gilroy-Regular']">Due Date</p>
                                            <p>2026-01-18</p>
                                        </div>

                                        <div>
                                            <p className="opacity-60 font-['Gilroy-Regular']">Amount Due</p>
                                            <p className="text-[#039155] font-['Gilroy-Medium']">{amount}</p>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            {/* PAYMENT PART */}
                            <div>
                                <p className="text-[20px] font-['Gilroy-Medium'] text-[#1B1717] mb-3">
                                    Payment
                                </p>

                                <div className="bg-white border border-gray-200 rounded-[16px] p-6 space-y-6 shadow-sm">

                                    <div className="flex items-center gap-2 text-[16px] font-['Gilroy-Regular'] text-[#1B1717]">
                                        <span className="w-3 h-3 bg-[#039155] rounded-full"></span>
                                        Main Wallet
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setStep("bill")}
                                            className="flex-1 h-[48px] border border-gray-300 rounded-lg font-['Gilroy-Medium'] hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            className="flex-1 h-[48px] bg-[#039155] hover:bg-[#027a46] text-white rounded-lg font-['Gilroy-Medium']"
                                        >
                                            Pay Now
                                        </button>
                                    </div>

                                </div>
                            </div>

                        </div>
                    )}



                </div>


                {/* Right Side - Last Transaction */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 lg:flex-[1]">
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
