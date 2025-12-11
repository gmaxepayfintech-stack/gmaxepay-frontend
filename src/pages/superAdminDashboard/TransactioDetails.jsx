import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { User, DollarSign, FileText } from 'lucide-react';
import { HiOutlineArrowNarrowLeft } from 'react-icons/hi';
import MainWalletStatement from './MainWalletStatement';

const TransactioDetails = ({ onBack }) => {
    const [showMainWalletStatement, setShowMainWalletStatement] = useState(false);
    // Commission data
    const commissionData = [
        { name: 'Enterprise', userId: 'ENT001', commissions: '₹2.50', tds: '₹0.25', net: '₹2.25' },
        { name: 'Whitelabel', userId: 'ENT001', commissions: '₹2.50', tds: '₹0.25', net: '₹2.25' },
        { name: 'Retailer', userId: 'ENT001', commissions: '₹2.50', tds: '₹0.25', net: '₹2.25' },
        { name: 'Master Distributor', userId: 'ENT001', commissions: '₹2.50', tds: '₹0.25', net: '₹2.25' },
        { name: 'Distributor', userId: 'ENT001', commissions: '₹2.50', tds: '₹0.25', net: '₹2.25' },
        { name: 'Enterprise', userId: 'ENT001', commissions: '₹2.50', tds: '₹0.25', net: '₹2.25' },
    ];

    const totalCommission = '₹14.95';

    // If MainWalletStatement should be shown, render it
    if (showMainWalletStatement) {
        return <MainWalletStatement onBack={() => setShowMainWalletStatement(false)} />;
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
                                Transaction Details
                            </h1>
                            <p className="text-[16px] font-['Gilroy-Regular'] sm:text-base md:text-lg text-[#000000] mt-[12px]">
                                Complete Overview Of Transaction
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setShowMainWalletStatement(true)}
                        className="flex items-center gap-2 bg-[#039155] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium hover:bg-green-700 transition shadow-md whitespace-nowrap"
                    >
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Main Wallet Statement</span>
                    </button>
                </div>
            </div>

            {/* Three Information Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                {/* User Details Card */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-[#039155] px-4 py-3 flex items-center gap-2">
                        <User className="w-5 h-5 text-white" />
                        <h3 className="text-white font-['Gilroy-Medium'] text-base sm:text-lg">User Details</h3>
                    </div>
                    <div className="p-4 sm:p-6">
                        <div className="space-y-3 sm:space-y-4">
                            <div>
                                <p className="text-xs sm:text-sm text-gray-600 mb-1">Name</p>
                                <p className="text-sm sm:text-base font-['Gilroy-Medium'] text-[#1B1717]">Rajesh Kumara Sharma</p>
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm text-gray-600 mb-1">Role</p>
                                <p className="text-sm sm:text-base font-['Gilroy-Medium'] text-[#1B1717]">Retailer</p>
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm text-gray-600 mb-1">Agent Code</p>
                                <p className="text-sm sm:text-base font-['Gilroy-Medium'] text-[#1B1717]">MCGXP18665</p>
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm text-gray-600 mb-1">User Mobile</p>
                                <p className="text-sm sm:text-base font-['Gilroy-Medium'] text-[#1B1717]">9945224696</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Parent Details Card */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-[#039155] px-4 py-3 flex items-center gap-2">
                        <User className="w-5 h-5 text-white" />
                        <h3 className="text-white font-['Gilroy-Medium'] text-base sm:text-lg">Parent Details</h3>
                    </div>
                    <div className="p-4 sm:p-6">
                        <div className="space-y-3 sm:space-y-4">
                            <div>
                                <p className="text-xs sm:text-sm text-gray-600 mb-1">Company Name</p>
                                <p className="text-sm sm:text-base font-['Gilroy-Medium'] text-[#1B1717]">Fintech Solutions Pvt LTD</p>
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm text-gray-600 mb-1">Parent Name</p>
                                <p className="text-sm sm:text-base font-['Gilroy-Medium'] text-[#1B1717]">Amit Patel</p>
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm text-gray-600 mb-1">Parent Role</p>
                                <p className="text-sm sm:text-base font-['Gilroy-Medium'] text-[#1B1717]">White Label Partner</p>
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm text-gray-600 mb-1">Parent Code</p>
                                <p className="text-sm sm:text-base font-['Gilroy-Medium'] text-[#1B1717]">WL001</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transaction Details Card */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-[#039155] px-4 py-3 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-white" />
                        <h3 className="text-white font-['Gilroy-Medium'] text-base sm:text-lg">Transaction Details</h3>
                    </div>
                    <div className="p-4 sm:p-6">
                        <div className="space-y-3 sm:space-y-4">
                            <div>
                                <p className="text-xs sm:text-sm text-gray-600 mb-1">Bank Name</p>
                                <p className="text-sm sm:text-base font-['Gilroy-Medium'] text-[#1B1717]">State Bank Of India</p>
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm text-gray-600 mb-1">Aadhar Number</p>
                                <p className="text-sm sm:text-base font-['Gilroy-Medium'] text-[#1B1717]">1234 4567 4568 ****</p>
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm text-gray-600 mb-1">Amount</p>
                                <p className="text-sm sm:text-base font-['Gilroy-Medium'] text-[#1B1717]">2000</p>
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm text-gray-600 mb-1">Commission</p>
                                <p className="text-sm sm:text-base font-['Gilroy-Medium'] text-[#1B1717]">0.02%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Commission Details Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="bg-[#039155] px-4 py-3 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-white" />
                    <h3 className="text-white font-['Gilroy-Medium'] text-base sm:text-lg">Commission Details</h3>
                </div>
                <div className="p-4 sm:p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]">
                                        Name
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]">
                                        User ID
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]">
                                        Commissions
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]">
                                        TDS
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]">
                                        Net
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {commissionData.map((row, index) => (
                                    <tr key={index} className="border-b border-gray-200">
                                        <td className="px-4 py-3 text-sm font-['Gilroy-Regular'] text-[#1B1717]">
                                            {row.name}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-['Gilroy-Regular'] text-[#1B1717]">
                                            {row.userId}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-['Gilroy-Regular'] text-[#1B1717]">
                                            {row.commissions}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-['Gilroy-Regular'] text-[#1B1717]">
                                            {row.tds}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-['Gilroy-Medium'] text-[#039155]">
                                            {row.net}
                                        </td>
                                    </tr>
                                ))}
                                <tr className="bg-gray-50">
                                    <td colSpan="4" className="px-4 py-3 text-sm font-['Gilroy-Medium'] text-[#1B1717] text-right">
                                        Total Commission
                                    </td>
                                    <td className="px-4 py-3 text-sm font-['Gilroy-Medium'] text-[#039155]">
                                        {totalCommission}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

TransactioDetails.propTypes = {
    onBack: PropTypes.func,
};

TransactioDetails.defaultProps = {
    onBack: null,
};

export default TransactioDetails;
