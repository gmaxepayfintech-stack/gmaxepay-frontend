import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Fingerprint } from 'lucide-react';

const TaxHistory = () => {
    const [activeTab, setActiveTab] = useState('Banking');
    const [currentPage, setCurrentPage] = useState(1);

    const tabs = ['Banking', 'Utility Payment', 'E-Governance', 'Insurance', 'Travel', 'Verification History'];

    const transactionCards = [
        {
            id: 1,
            title: 'AEPS CW History',
            subtitle: 'Cash Withdrawal',
            available: true
        },
        {
            id: 2,
            title: 'AePS MS History',
            subtitle: 'Mini Statement',
            available: true
        },
        {
            id: 3,
            title: 'AePS BE History',
            subtitle: 'Balance Enquiry',
            available: true
        },
        {
            id: 4,
            title: 'DMT',
            subtitle: 'Direct Money Transfer',
            available: true
        },
        {
            id: 5,
            title: 'CMS',
            subtitle: 'Cash Withdrawal',
            available: true
        },
        {
            id: 6,
            title: 'F-CMS',
            subtitle: 'Cash Withdrawal',
            available: true
        }
    ];

    return (
        <div className="min-h-screen bg-[#FAFAFA] p-4 sm:p-6 text-[#1B1717]">
            {/* Header Section */}
            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-medium text-[#1B1717] mb-2">
                    Transaction History
                </h1>
                <p className="text-base sm:text-lg text-gray-600">
                    Manage And Track All Your Transactions
                </p>
            </div>

            {/* Navigation Tabs */}
            <div className="mb-6 flex bg-[#FFFFFF] p-2 w-full  rounded-lg gap-24">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-5 py-4 rounded-full text-md sm:text-md  font-medium transition ${activeTab === tab
                            ? 'bg-[#039155] text-white shadow-md'
                            : ' text-[#1B1717] '
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Transaction Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
                {transactionCards.map((card) => (
                    <div
                        key={card.id}
                        className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                    >
                        {/* Green Header Bar */}
                        <div className=" px-4 py-3 flex items-center justify-between rounded-t-xl">
                            <div className="w-[35px] h-[35px] rounded-full bg-[#039155] flex items-center justify-center">
                                <Fingerprint className="w-[18px] h-[18px] text-[#FFFFFF]" />
                            </div>
                            <div className="flex items-center gap-1.5 rounded-full bg-white border border-[#1B1717] border-opacity-10 px-2 py-1">
                                <div className="w-[8px] h-[8px] rounded-full bg-[#039155] flex-shrink-0"></div>
                                <span className="text-[#039155] text-[10px] font-medium whitespace-nowrap">
                                    Active
                                </span>
                            </div>
                        </div>
                        <hr className="border-gray-300 w-[90%] mx-auto" />

                        {/* White Body */}
                        <div className="p-4 sm:p-6">
                            <div className="mb-4">
                                <h3 className="text-lg sm:text-xl font-bold text-[#1B1717] mb-2">
                                    {card.title}
                                </h3>
                                <p className="text-sm text-gray-600 mb-3">
                                    {card.subtitle}
                                </p>
                                <div className="flex items-center justify-between">
                                    <p className="text-base font-bold text-[#1B1717]">
                                        {card.subtitle}
                                    </p>
                                    {card.available && (
                                        <span className="text-sm text-[#039155] font-medium">
                                            Available
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* View History Button */}
                            <button className="w-full bg-[#039155] text-white py-3 rounded-lg font-medium hover:bg-green-700 transition text-sm sm:text-base">
                                View History
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2">
                <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className="p-2 rounded-lg border border-gray-300 bg-white text-[#1B1717] hover:bg-gray-50 transition"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                {[1, 2, 3].map((page) => (
                    <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-lg font-medium transition ${currentPage === page
                            ? 'bg-[#039155] text-white'
                            : 'bg-white border border-gray-300 text-[#1B1717] hover:bg-gray-50'
                            }`}
                    >
                        {page}
                    </button>
                ))}
                <button
                    onClick={() => setCurrentPage(Math.min(3, currentPage + 1))}
                    className="p-2 rounded-lg border border-gray-300 bg-white text-[#1B1717] hover:bg-gray-50 transition"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default TaxHistory;
