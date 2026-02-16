import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Search } from 'lucide-react';
import { HiOutlineArrowNarrowLeft } from 'react-icons/hi';

const MainWalletStatement = ({ onBack }) => {
    const [dateRange, setDateRange] = useState('');
    const [transactionType, setTransactionType] = useState('');
    const [status, setStatus] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Sample transaction data - matching image exactly
    const transactions = [
        {
            id: 1,
            orderId: '1514880',
            transactionId: 'TXN001234567',
            timestamp: '2024-01-15 14:30:25',
            description: 'Amount Credit Against AEPS',
            ref: 'Ref: REF789456123',
            openingBalance: '₹3911.159',
            credit: '₹0.882',
            debit: '000',
            closingBalance: '₹3912.041',
            status: 'Completed',
        },
        {
            id: 2,
            orderId: '1514880',
            transactionId: 'TXN001234567',
            timestamp: '2024-01-15 14:30:25',
            description: 'Commission Received From',
            ref: 'Ref: REF789456123',
            openingBalance: '₹3911.159',
            credit: '₹0.882',
            debit: '000',
            closingBalance: '₹3912.041',
            status: 'Completed',
        },
        {
            id: 3,
            orderId: '1514880',
            transactionId: 'TXN001234567',
            timestamp: '2024-01-15 14:30:25',
            description: 'Amount Credit Against AEPS',
            ref: 'Ref: REF789456123',
            openingBalance: '₹3911.159',
            credit: '₹0.882',
            debit: '000',
            closingBalance: '₹3912.041',
            status: 'Completed',
        },
        {
            id: 4,
            orderId: '1514880',
            transactionId: 'TXN001234567',
            timestamp: '2024-01-15 14:30:25',
            description: 'Commission Received From',
            ref: 'Ref: REF789456123',
            openingBalance: '₹3911.159',
            credit: '₹0.882',
            debit: '000',
            closingBalance: '₹3912.041',
            status: 'Completed',
        },
        {
            id: 5,
            orderId: '1514880',
            transactionId: 'TXN001234567',
            timestamp: '2024-01-15 14:30:25',
            description: 'Amount Credit Against AEPS',
            ref: 'Ref: REF789456123',
            openingBalance: '₹3911.159',
            credit: '₹0.882',
            debit: '000',
            closingBalance: '₹3912.041',
            status: 'Completed',
        },
        {
            id: 6,
            orderId: '1514880',
            transactionId: 'TXN001234567',
            timestamp: '2024-01-15 14:30:25',
            description: 'Commission Received From',
            ref: 'Ref: REF789456123',
            openingBalance: '₹3911.159',
            credit: '₹0.882',
            debit: '000',
            closingBalance: '₹3912.041',
            status: 'Completed',
        },
        {
            id: 7,
            orderId: '1514880',
            transactionId: 'TXN001234567',
            timestamp: '2024-01-15 14:30:25',
            description: 'Amount Credit Against AEPS',
            ref: 'Ref: REF789456123',
            openingBalance: '₹3911.159',
            credit: '₹0.882',
            debit: '000',
            closingBalance: '₹3912.041',
            status: 'Completed',
        },
        {
            id: 8,
            orderId: '1514880',
            transactionId: 'TXN001234567',
            timestamp: '2024-01-15 14:30:25',
            description: 'Commission Received From',
            ref: 'Ref: REF789456123',
            openingBalance: '₹3911.159',
            credit: '₹0.882',
            debit: '000',
            closingBalance: '₹3912.041',
            status: 'Completed',
        },
        {
            id: 9,
            orderId: '1514880',
            transactionId: 'TXN001234567',
            timestamp: '2024-01-15 14:30:25',
            description: 'Amount Credit Against AEPS',
            ref: 'Ref: REF789456123',
            openingBalance: '₹3911.159',
            credit: '₹0.882',
            debit: '000',
            closingBalance: '₹3912.041',
            status: 'Completed',
        },
    ];

  return (
        <div className="min-h-screen bg-[#FAFAFA] p-3 sm:p-4 md:p-6 text-[#1B1717]">
            {/* Header Section */}
            <div className="mb-4 sm:mb-6">
                <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3">
                    <button
                        onClick={onBack || (() => globalThis.history?.back())}
                        className="flex items-center text-[#1B1717] hover:text-[#039155] transition"
                    >
                        <div className="rounded-full p-1.5 bg-[#FFFFFF] border border-[#1B1717] transition">
                            <HiOutlineArrowNarrowLeft className="text-2xl text-[#1B1717] opacity-80" />
                        </div>
                    </button>
                    <div>
                        <h1 className="text-[24px] sm:text-2xl md:text-3xl font-['Gilroy-Medium'] text-[#1B1717]">
                            Main Wallet Statement
                        </h1>
                        <p className="text-[16px] font-['Gilroy-Regular'] sm:text-base md:text-lg text-[#000000] mt-[12px]">
                            Main Wallet Transaction History
                        </p>
                    </div>
                </div>
            </div>

            {/* Filter Transactions Section */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-['Gilroy-Medium'] text-[#1B1717] mb-4">
                    Filter Transactions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {/* Date Range */}
                    <div>
                        <label htmlFor="dateRange" className="block text-xs sm:text-sm font-[Gilroy-Medium] text-[#1B1717] mb-2">
                            Date Range
                        </label>
                        <select
                            id="dateRange"
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] focus:border-[#039155] text-sm sm:text-base bg-white text-[#1B1717]"
                        >
                            <option value="">Select</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="custom">Custom</option>
                        </select>
                    </div>

                    {/* Transaction Type */}
                    <div>
                        <label htmlFor="transactionType" className="block text-xs sm:text-sm font-[Gilroy-Medium] text-[#1B1717] mb-2">
                            Transaction Type
                        </label>
                        <select
                            id="transactionType"
                            value={transactionType}
                            onChange={(e) => setTransactionType(e.target.value)}
                            className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] focus:border-[#039155] text-sm sm:text-base bg-white text-[#1B1717]"
                        >
                            <option value="">Select</option>
                            <option value="credit">Credit</option>
                            <option value="debit">Debit</option>
                            <option value="transfer">Transfer</option>
                        </select>
                    </div>

                    {/* Status */}
                    <div>
                        <label htmlFor="status" className="block text-xs sm:text-sm font-[Gilroy-Medium] text-[#1B1717] mb-2">
                            Status
                        </label>
                        <select
                            id="status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] focus:border-[#039155] text-sm sm:text-base bg-white text-[#1B1717]"
                        >
                            <option value="">Select</option>
                            <option value="completed">Completed</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>

                    {/* Search Bar */}
                    <div>
                        <label htmlFor="search" className="block text-xs sm:text-sm font-[Gilroy-Medium] text-[#1B1717] mb-2">
                            Search
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                            <input
                                id="search"
                                type="text"
                                placeholder="Transaction Id, Amount"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] focus:border-[#039155] text-sm sm:text-base"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Transaction History Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1200px] border-collapse">
                        <thead className="bg-[#FFFFFF] border-b border-gray-200">
                            <tr>
                                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]">
                                    Order ID
                                </th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]">
                                    Transactions ID
                                </th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]">
                                    Description
                                </th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]">
                                    Opening Balance
                                </th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]">
                                    Credit
                                </th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]">
                                    Debit
                                </th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]">
                                    Closing Balance
                                </th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {transactions.map((transaction, index) => (
                                <tr
                                    key={transaction.id}
                                    className={`transition-colors ${
                                        index % 2 === 0 
                                            ? 'bg-[#F0F9F4] hover:bg-[#E8F5ED]' 
                                            : 'bg-white hover:bg-gray-50'
                                    }`}
                                >
                                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                        <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#1B1717]">
                                            {transaction.orderId}
                                        </span>
                                    </td>
                                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#1B1717]">
                                                {transaction.transactionId}
                                            </span>
                                            <span className="text-xs text-gray-500 mt-1">
                                                {transaction.timestamp}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#1B1717]">
                                                {transaction.description}
                                            </span>
                                            <span className="text-xs text-gray-500 mt-1">
                                                {transaction.ref}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                        <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#1B1717]">
                                            {transaction.openingBalance}
                                        </span>
                                    </td>
                                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                        <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-green-600">
                                            {transaction.credit}
                                        </span>
                                    </td>
                                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                        <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-red-600">
                                            {transaction.debit}
                                        </span>
                                    </td>
                                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                        <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#1B1717]">
                                            {transaction.closingBalance}
                                        </span>
                                    </td>
                                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-[Gilroy-Medium] bg-[#039155] text-white">
                                            {transaction.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

MainWalletStatement.propTypes = {
    onBack: PropTypes.func,
};

MainWalletStatement.defaultProps = {
    onBack: null,
};

export default MainWalletStatement;
