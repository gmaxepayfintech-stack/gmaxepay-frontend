import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Fingerprint } from 'lucide-react';
import AepsCWHistory from './AepsCWHistory';

const TaxHistory = () => {
    const [activeTab, setActiveTab] = useState('Banking');
    const [currentPage, setCurrentPage] = useState(1);
    const [showAepsCWHistory, setShowAepsCWHistory] = useState(false);

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

    // If AepsCWHistory should be shown, render it
    if (showAepsCWHistory) {
        return <AepsCWHistory onBack={() => setShowAepsCWHistory(false)} />;
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] p-3 sm:p-4 md:p-6 text-[#1B1717]">
            {/* Header Section */}
            <div className="mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-medium text-[#1B1717] mb-1 sm:mb-2">
                    Transaction History
                </h1>
                <p className="text-sm sm:text-base md:text-lg text-gray-600">
                    Manage And Track All Your Transactions
                </p>
            </div>

            {/* Navigation Tabs */}
            <div className="mb-4 sm:mb-6 bg-[#FFFFFF] p-1.5 sm:p-2 rounded-lg overflow-x-auto">
                <div className="flex gap-2 sm:gap-3 md:gap-4 lg:gap-6 min-w-max sm:min-w-0">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-3 py-2 sm:px-4 sm:py-3 md:px-5 md:py-4 rounded-full text-xs sm:text-sm md:text-base font-medium transition whitespace-nowrap flex-shrink-0 ${activeTab === tab
                                ? 'bg-[#039155] text-white shadow-md'
                                : 'text-[#1B1717] hover:bg-gray-50'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Transaction Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
                {transactionCards.map((card) => (
                    <div
                        key={card.id}
                        className="bg-white rounded-lg sm:rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col"
                    >
                        {/* Green Header Bar */}
                        <div className="bg-[#FFFFFF] px-3 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between rounded-t-lg sm:rounded-t-xl">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-[35px] md:h-[35px] rounded-full bg-[#039155] bg-opacity-80 flex items-center justify-center flex-shrink-0">
                                <Fingerprint className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-[18px] md:h-[18px] text-white" />
                            </div>
                            <div className="flex items-center gap-1 sm:gap-1.5 rounded-full bg-[#039155] border border-white border-opacity-20 px-1.5 py-0.5 sm:px-2 sm:py-1">
                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-[8px] md:h-[8px] rounded-full bg-[#FFFFFF] flex-shrink-0"></div>
                                <span className="text-[#FFFFFF] text-[9px] sm:text-[10px] font-medium whitespace-nowrap">
                                    Active
                                </span>
                            </div>
                        </div>
                        <hr className="border-gray-300 w-[90%] mx-auto" />

                        {/* White Body */}
                        <div className="p-3 sm:p-4 md:p-6 flex-grow flex flex-col">
                            <div className="mb-3 sm:mb-4 flex-grow">
                                <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#1B1717] mb-1.5 sm:mb-2">
                                    {card.title}
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                                    {card.subtitle}
                                </p>
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-sm sm:text-base font-bold text-[#1B1717] truncate">
                                        {card.subtitle}
                                    </p>
                                    {card.available && (
                                        <span className="text-xs sm:text-sm text-[#039155] font-medium whitespace-nowrap flex-shrink-0">
                                            Available
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* View History Button */}
                            <button 
                                onClick={() => {
                                    if (card.title === 'AEPS CW History') {
                                        setShowAepsCWHistory(true);
                                    }
                                }}
                                className="w-full bg-[#039155] text-white py-2 sm:py-2.5 md:py-3 rounded-lg font-medium hover:bg-green-700 transition text-xs sm:text-sm md:text-base mt-auto"
                            >
                                View History
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className="p-1.5 sm:p-2 rounded-lg border border-gray-300 bg-white text-[#1B1717] hover:bg-gray-50 transition"
                    aria-label="Previous page"
                >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                {[1, 2, 3].map((page) => (
                    <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-medium transition text-sm sm:text-base ${currentPage === page
                            ? 'bg-[#039155] text-white'
                            : 'bg-white border border-gray-300 text-[#1B1717] hover:bg-gray-50'
                            }`}
                    >
                        {page}
                    </button>
                ))}
                <button
                    onClick={() => setCurrentPage(Math.min(3, currentPage + 1))}
                    className="p-1.5 sm:p-2 rounded-lg border border-gray-300 bg-white text-[#1B1717] hover:bg-gray-50 transition"
                    aria-label="Next page"
                >
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
            </div>
        </div>
    );
};

export default TaxHistory;
