import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Search, Download, User } from 'lucide-react';
import { HiOutlineArrowNarrowLeft } from 'react-icons/hi';
import TransactioDetails from './TransactioDetails';

const AepsCWHistory = ({ onBack }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [showTransactionDetails, setShowTransactionDetails] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    // Sample transaction data - matching image exactly
    const transactions = Array.from({ length: 12 }, (_, index) => {
        // Cycle through statuses: Success, Pending, Failed
        const statuses = ['Success', 'Pending', 'Failed'];
        const status = statuses[index % 3];
        
        return {
            id: index + 1,
            srNo: '01',
            createdAt: '13-10-25',
            userRole: 'RT',
            bankName: 'Canara Bank Erstwhile Syndicat...',
            taxId: 'SHARY2157214174',
            via: 'APP',
            bankRefNumber: '530812192893',
            amount: '₹10000',
            status: status,
        };
    });

    const statusFilters = ['All', 'Success', 'Pending', 'Failed'];

    // Filter transactions based on selected status
    const filteredTransactions = statusFilter === 'All' 
        ? transactions 
        : transactions.filter(transaction => transaction.status === statusFilter);

    // If TransactionDetails should be shown, render it
    if (showTransactionDetails) {
        return <TransactioDetails onBack={() => setShowTransactionDetails(false)} />;
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] p-3 sm:p-4 md:p-6 text-[#1B1717]">
            {/* Header Section */}
            <div className="mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2 sm:mb-3">
                    <div className="flex items-center gap-3 sm:gap-4">
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
                                AEPS CW History
                            </h1>
                            <p className="text-[16px] font-['Gilroy-Regular']  sm:text-base md:text-lg text-[#000000] mt-[12px]">
                                Manage And Track All Your Transactions
                            </p>
                        </div>
                    </div>
                    {/* Status Filter Buttons */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        {statusFilters.map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-3 sm:px-4 sm:py-3 rounded-2xl text-[16px] sm:text-sm font-['Gilroy-Medium'] transition whitespace-nowrap ${
                                    statusFilter === status
                                        ? 'bg-[#039155] text-white shadow-md'
                                        : 'bg-white text-gray-700 border border-[#1B1717] border-opacity-50 hover:bg-gray-50'
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Search and Filter Section */}
            <div className=" p-1 sm:p-1 mb-2 sm:mb-2">
                {/* Search, Date Filters and Export Button - All in One Line */}
                <div className="flex flex-col lg:flex-row items-stretch lg:items-end gap-3 sm:gap-4">
                    {/* Search Bar */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search By Reference, ID"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] focus:border-[#039155] text-sm sm:text-base"
                        />
                    </div>

                    {/* From Date */}
                    <div className="relative flex-1 lg:flex-initial lg:w-auto">
                        <label htmlFor="fromDate" className="block text-xs sm:text-sm font-medium text-[#1B1717] mb-2">
                            From Date
                        </label>
                        <input
                            id="fromDate"
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            placeholder="From Date"
                            className="w-full pl-4 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] focus:border-[#039155] text-sm sm:text-base bg-white text-[#1B1717]"
                        />
                    </div>

                    {/* To Date */}
                    <div className="relative flex-1 lg:flex-initial lg:w-auto">
                        <label htmlFor="toDate" className="block text-xs sm:text-sm font-medium text-[#1B1717] mb-2">
                            To Date
                        </label>
                        <input
                            id="toDate"
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            placeholder="To Date"
                            className="w-full pl-4 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] focus:border-[#039155] text-sm sm:text-base bg-white text-[#1B1717]"
                        />
                    </div>

                    {/* Export Button */}
                    <div className="flex items-end">
                        <button className="flex items-center gap-2 bg-[#039155] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium hover:bg-green-700 transition shadow-md whitespace-nowrap w-full lg:w-auto">
                            <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span>Export</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Transaction History Table */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm mt-8 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px] border-collapse">
                        <thead className="bg-[#FFFFFF] border-b border-gray-200">
                            <tr>
                                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]">
                                    SR No
                                </th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]">
                                    Profile
                                </th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]">
                                    Created At
                                </th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]">
                                    User Role
                                </th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]">
                                    Bank Name
                                </th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]">
                                    Tax ID
                                </th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]">
                                    VIA
                                </th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]">
                                    Bank Ref Number
                                </th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]">
                                    Amount
                                </th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredTransactions.map((transaction, index) => (
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
                                            {transaction.srNo}
                                        </span>
                                    </td>
                                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => {
                                                setSelectedTransaction(transaction);
                                                setShowTransactionDetails(true);
                                            }}
                                            className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
                                        >
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                                            </div>
                                        </button>
                                    </td>
                                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                        <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#1B1717]">
                                            {transaction.createdAt}
                                        </span>
                                    </td>
                                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                        <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#1B1717]">
                                            {transaction.userRole}
                                        </span>
                                    </td>
                                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                                        <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#1B1717]">
                                            {transaction.bankName}
                                        </span>
                                    </td>
                                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                        <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#1B1717]">
                                            {transaction.taxId}
                                        </span>
                                    </td>
                                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                        <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#1B1717]">
                                            {transaction.via}
                                        </span>
                                    </td>
                                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                        <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#1B1717]">
                                            {transaction.bankRefNumber}
                                        </span>
                                    </td>
                                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                        <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#1B1717] font-medium">
                                            {transaction.amount}
                                        </span>
                                    </td>
                                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                        <span
                                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                                                transaction.status === 'Success'
                                                    ? 'bg-[#039155] text-white'
                                                    : transaction.status === 'Pending'
                                                    ? 'bg-orange-500 text-white'
                                                    : 'bg-red-500 text-white'
                                            }`}
                                        >
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

AepsCWHistory.propTypes = {
    onBack: PropTypes.func,
};

AepsCWHistory.defaultProps = {
    onBack: null,
};

export default AepsCWHistory;
