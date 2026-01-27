import React, { useState } from "react";
import PropTypes from "prop-types";
import { Search } from "lucide-react";
import { HiOutlineArrowNarrowLeft } from "react-icons/hi";
import { HiArrowLeft } from "react-icons/hi2";

const MainWalletStatement = ({ onBack }) => {
  const [dateRange, setDateRange] = useState("");
  const [transactionType, setTransactionType] = useState("");
  const [status, setStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Sample transaction data - matching image exactly
  const transactions = [
    {
      id: 1,
      orderId: "1514880",
      transactionId: "TXN001234567",
      timestamp: "2024-01-15 14:30:25",
      description: "Amount Credit Against AEPS",
      ref: "Ref: REF789456123",
      openingBalance: "₹3911.159",
      credit: "₹0.882",
      debit: "000",
      closingBalance: "₹3912.041",
      status: "Completed",
    },
    {
      id: 2,
      orderId: "1514880",
      transactionId: "TXN001234567",
      timestamp: "2024-01-15 14:30:25",
      description: "Commission Received From",
      ref: "Ref: REF789456123",
      openingBalance: "₹3911.159",
      credit: "₹0.882",
      debit: "000",
      closingBalance: "₹3912.041",
      status: "Completed",
    },
    {
      id: 3,
      orderId: "1514880",
      transactionId: "TXN001234567",
      timestamp: "2024-01-15 14:30:25",
      description: "Amount Credit Against AEPS",
      ref: "Ref: REF789456123",
      openingBalance: "₹3911.159",
      credit: "₹0.882",
      debit: "000",
      closingBalance: "₹3912.041",
      status: "Completed",
    },
    {
      id: 4,
      orderId: "1514880",
      transactionId: "TXN001234567",
      timestamp: "2024-01-15 14:30:25",
      description: "Commission Received From",
      ref: "Ref: REF789456123",
      openingBalance: "₹3911.159",
      credit: "₹0.882",
      debit: "000",
      closingBalance: "₹3912.041",
      status: "Completed",
    },
    {
      id: 5,
      orderId: "1514880",
      transactionId: "TXN001234567",
      timestamp: "2024-01-15 14:30:25",
      description: "Amount Credit Against AEPS",
      ref: "Ref: REF789456123",
      openingBalance: "₹3911.159",
      credit: "₹0.882",
      debit: "000",
      closingBalance: "₹3912.041",
      status: "Completed",
    },
    {
      id: 6,
      orderId: "1514880",
      transactionId: "TXN001234567",
      timestamp: "2024-01-15 14:30:25",
      description: "Commission Received From",
      ref: "Ref: REF789456123",
      openingBalance: "₹3911.159",
      credit: "₹0.882",
      debit: "000",
      closingBalance: "₹3912.041",
      status: "Completed",
    },
    {
      id: 7,
      orderId: "1514880",
      transactionId: "TXN001234567",
      timestamp: "2024-01-15 14:30:25",
      description: "Amount Credit Against AEPS",
      ref: "Ref: REF789456123",
      openingBalance: "₹3911.159",
      credit: "₹0.882",
      debit: "000",
      closingBalance: "₹3912.041",
      status: "Completed",
    },
    {
      id: 8,
      orderId: "1514880",
      transactionId: "TXN001234567",
      timestamp: "2024-01-15 14:30:25",
      description: "Commission Received From",
      ref: "Ref: REF789456123",
      openingBalance: "₹3911.159",
      credit: "₹0.882",
      debit: "000",
      closingBalance: "₹3912.041",
      status: "Completed",
    },
    {
      id: 9,
      orderId: "1514880",
      transactionId: "TXN001234567",
      timestamp: "2024-01-15 14:30:25",
      description: "Amount Credit Against AEPS",
      ref: "Ref: REF789456123",
      openingBalance: "₹3911.159",
      credit: "₹0.882",
      debit: "000",
      closingBalance: "₹3912.041",
      status: "Completed",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] px-3 py-2 text-[#1B1717]">
      {/* Header Section */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center  gap-3 sm:gap-4 mb-2 sm:mb-3">
          <button
            onClick={onBack || (() => globalThis.history?.back())}
            className="flex items-center text-[#1B1717] hover:text-[#039155] transition"
          >
            <div className="rounded-full p-1.5 bg-[#FFFFFF] border border-[#1B1717]/80 transition">
              <HiArrowLeft className="text-2xl text-[#1B1717] opacity-80" />
            </div>
          </button>
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-['Gilroy-Medium'] text-[#1B1717]">
              Main Wallet Statement
            </h1>
            <p className="text-[16px] font-['Gilroy-Regular'] sm:text-base md:text-lg text-[#1B1717] mt-1">
              Main Wallet Transaction History
            </p>
          </div>
        </div>
      </div>

      {/* Filter Transactions Section */}
      <div className="bg-white rounded-3xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-['Gilroy-semibold'] text-[#1B1717] mb-4">
          Filter Transactions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Date Range */}
          <div>
            <label
              htmlFor="dateRange"
              className="block text-xs sm:text-sm font-[gilroy-medium] text-[#1B1717] mb-2"
            >
              Date Range
            </label>
            <select
              id="dateRange"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-4 py-2.5 sm:py-3 border border-[#1B1717]/80 rounded-lg focus:outline-none  text-sm sm:text-base bg-white text-[#1B1717]/80 font-[gilroy-medium]"
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
            <label
              htmlFor="transactionType"
              className="block text-xs sm:text-sm font-[gilroy-medium] text-[#1B1717] mb-2"
            >
              Transaction Type
            </label>
            <select
              id="transactionType"
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
              className="w-full px-4 py-2.5 sm:py-3 border border-[#1B1717]/80 rounded-lg focus:outline-none  text-sm sm:text-base bg-white text-[#1B1717]/80 font-[gilroy-medium]"
            >
              <option value="">Select</option>
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label
              htmlFor="status"
              className="block text-xs sm:text-sm font-[gilroy-medium] text-[#1B1717] mb-2"
            >
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2.5 sm:py-3 border border-[#1B1717]/80 rounded-lg focus:outline-none  text-sm sm:text-base bg-white text-[#1B1717]/80 font-[gilroy-medium]"
            >
              <option value="">Select</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Search Bar */}
          <div>
            <label
              htmlFor="search"
              className="block text-xs sm:text-sm font-[gilroy-medium] text-[#1B1717] mb-2"
            >
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#1B1717]/80" />
              <input
                id="search"
                type="text"
                placeholder="Transaction Id, Amount"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-[#1B1717]/80 rounded-lg focus:outline-none  text-sm sm:text-base bg-white text-[#1B1717]/80 font-[gilroy-medium]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] border-collapse">
            <thead className="bg-[#FFFFFF] border-b border-[#1B1717]/80">
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
                      ? "bg-[#F0F9F4] hover:bg-[#E8F5ED]"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <span className="text-[10px] sm:text-xs font-['Gilroy-Regular'] text-[#121216]">
                      {transaction.orderId}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] sm:text-xs font-['Gilroy-Regular'] text-[#1B1717]">
                        {transaction.transactionId}
                      </span>
                      <span className="text-[8px] sm:text-[10px] text-[#1B1717]/80 mt-1 font-['Gilroy-Regular']">
                        {transaction.timestamp}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] sm:text-xs font-['Gilroy-Regular'] text-[#121216]">
                        {transaction.description}
                      </span>
                      <span className="text-[8px] sm:text-[10px] text-[#1B1717]/80 mt-1 font-['Gilroy-Regular']">
                        {transaction.ref}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#121216]">
                      {transaction.openingBalance}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <span className="text-[10px] sm:text-xs font-['Gilroy-semibold'] text-[#039155]">
                      {transaction.credit}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <span className="text-[10px] sm:text-xs font-['Gilroy-Regular'] text-[#E32424]">
                      {transaction.debit}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <span className="text-[10px] sm:text-xs font-['Gilroy-semibold'] text-[#121216]">
                      {transaction.closingBalance}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] sm:text-xs font-[gilroy-medium] bg-[#039155] text-white">
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
