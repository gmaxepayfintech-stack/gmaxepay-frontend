import React, { useState } from 'react';

const FundRequest = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Sample data - replace with actual API data
    const fundRequests = [
        {
            id: 1,
            srNo: "01",
            createdAt: "13-10-25",
            requestBy: "Kotak Mahindra Bank",
            depositBankName: "Canara Bank",
            depositBankAccount: "115422157214174",
            refNumber: "142564233",
            txnId: "530812192893",
            amount: "₹10000",
            approved: true
        },
        {
            id: 2,
            srNo: "02",
            createdAt: "13-10-25",
            requestBy: "Kotak Mahindra Bank",
            depositBankName: "Canara Bank",
            depositBankAccount: "115422157214174",
            refNumber: "142564233",
            txnId: "530812192893",
            amount: "₹10000",
            approved: true
        },
        {
            id: 3,
            srNo: "03",
            createdAt: "13-10-25",
            requestBy: "Kotak Mahindra Bank",
            depositBankName: "Canara Bank",
            depositBankAccount: "115422157214174",
            refNumber: "142564233",
            txnId: "530812192893",
            amount: "₹10000",
            approved: true
        },
        {
            id: 4,
            srNo: "04",
            createdAt: "13-10-25",
            requestBy: "Kotak Mahindra Bank",
            depositBankName: "Canara Bank",
            depositBankAccount: "115422157214174",
            refNumber: "142564233",
            txnId: "530812192893",
            amount: "₹10000",
            approved: true
        },
        {
            id: 5,
            srNo: "05",
            createdAt: "13-10-25",
            requestBy: "Kotak Mahindra Bank",
            depositBankName: "Canara Bank",
            depositBankAccount: "115422157214174",
            refNumber: "142564233",
            txnId: "530812192893",
            amount: "₹10000",
            approved: true
        },
        {
            id: 6,
            srNo: "06",
            createdAt: "13-10-25",
            requestBy: "Kotak Mahindra Bank",
            depositBankName: "Canara Bank",
            depositBankAccount: "115422157214174",
            refNumber: "142564233",
            txnId: "530812192893",
            amount: "₹10000",
            approved: true
        },
        {
            id: 7,
            srNo: "07",
            createdAt: "13-10-25",
            requestBy: "Kotak Mahindra Bank",
            depositBankName: "Canara Bank",
            depositBankAccount: "115422157214174",
            refNumber: "142564233",
            txnId: "530812192893",
            amount: "₹10000",
            approved: true
        },
        {
            id: 8,
            srNo: "08",
            createdAt: "13-10-25",
            requestBy: "Kotak Mahindra Bank",
            depositBankName: "Canara Bank",
            depositBankAccount: "115422157214174",
            refNumber: "142564233",
            txnId: "530812192893",
            amount: "₹10000",
            approved: true
        },
        {
            id: 9,
            srNo: "09",
            createdAt: "13-10-25",
            requestBy: "Kotak Mahindra Bank",
            depositBankName: "Canara Bank",
            depositBankAccount: "115422157214174",
            refNumber: "142564233",
            txnId: "530812192893",
            amount: "₹10000",
            approved: true
        },
        {
            id: 10,
            srNo: "10",
            createdAt: "13-10-25",
            requestBy: "Kotak Mahindra Bank",
            depositBankName: "Canara Bank",
            depositBankAccount: "115422157214174",
            refNumber: "142564233",
            txnId: "530812192893",
            amount: "₹10000",
            approved: true
        },
        {
            id: 11,
            srNo: "11",
            createdAt: "13-10-25",
            requestBy: "Kotak Mahindra Bank",
            depositBankName: "Canara Bank",
            depositBankAccount: "115422157214174",
            refNumber: "142564233",
            txnId: "530812192893",
            amount: "₹10000",
            approved: true
        },
        {
            id: 12,
            srNo: "12",
            createdAt: "13-10-25",
            requestBy: "Kotak Mahindra Bank",
            depositBankName: "Canara Bank",
            depositBankAccount: "115422157214174",
            refNumber: "142564233",
            txnId: "530812192893",
            amount: "₹10000",
            approved: true
        },
        {
            id: 13,
            srNo: "13",
            createdAt: "13-10-25",
            requestBy: "Kotak Mahindra Bank",
            depositBankName: "Canara Bank",
            depositBankAccount: "115422157214174",
            refNumber: "142564233",
            txnId: "530812192893",
            amount: "₹10000",
            approved: true
        }
    ];

    // Filter data based on search term
    const filteredData = fundRequests.filter((item) => {
        const matchesSearch = searchTerm === "" ||
            item.refNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.txnId.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    // Calculate pagination
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    const handleExport = () => {
        // Implement export functionality
        console.log("Exporting data...");
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-2 sm:p-2 lg:p-2">
            <h1 className="text-[24px] font-['Gilroy-Medium'] mb-[20px]  text-[#1B1717]">
                Fund Request
            </h1>
            <div className="w-full mx-auto">

                <div className=" h-[45px] mb-[28px] w-full">
                    <div className="flex flex-col lg:flex-row items-center gap-4 w-full flex-nowrap">

                        {/* Search – takes remaining width */}
                        <div className="relative w-full lg:flex-1">
                            <input
                                type="text"
                                placeholder="Search By Reference,ID"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-[44px] pl-10 pr-4 border border-[#1B1717]/50 rounded-lg text-[14px]"
                            />
                            <svg
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1B1717]/50"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </div>

                        {/* Date filters */}
                        <div className="flex gap-3">
                            <input
                                type="date"
                                className="h-[44px] px-3 border border-[#1B1717]/50 rounded-lg text-[14px] min-w-[140px]"
                            />
                            <input
                                type="date"
                                className="h-[44px] px-3 border border-[#1B1717]/50 rounded-lg text-[14px] min-w-[140px]"
                            />
                        </div>

                        {/* Export */}
                        <button className="h-[44px] px-6 bg-[#039155] text-white rounded-lg text-[14px] font-['Gilroy-Medium'] flex items-center justify-center gap-2 whitespace-nowrap">
                            Export
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                />
                            </svg>
                        </button>

                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-3xl  shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className=" rounded-3xl">
                            <thead>
                                <tr className="bg-[#FFFFFF] border-b border-gray-200">
                                    {[
                                        "SR No",
                                        "Created At",
                                        "Request By",
                                        "Deposit Bank Name",
                                        "Deposit Bank Account",
                                        "Ref Number",
                                        "Txn Id",
                                        "Amount",
                                        "Approved",
                                        "Status"
                                    ].map((title) => (
                                        <th
                                            key={title}
                                            className="px-4 py-3 text-left text-[14px] font-['Gilroy-SemiBold'] text-[#1B1717] whitespace-nowrap"
                                        >
                                            {title}
                                        </th>
                                    ))}
                                </tr>
                            </thead>


                            <tbody className='whitespace-nowrap overflow-hidden text-[12px] text-ellipsis max-w-[140px]'>
                                {paginatedData.map((item, index) => (
                                    <tr
                                        key={item.id}
                                        className={`border-b border-gray-100 ${index % 2 === 0 ? "bg-white" : "bg-green-50 font-['Gilroy-Regular']"
                                            }`}
                                    >
                                        <td className="px-4 py-3 text-[12px] text-[#1B1717]">
                                            {item.srNo}
                                        </td>
                                        <td className="px-4 py-3 text-[12px] text-[#1B1717]">
                                            {item.createdAt}
                                        </td>
                                        <td className="px-4 py-3 text-[12px] text-[#1B1717]">
                                            {item.requestBy}
                                        </td>
                                        <td className="px-4 py-3 text-[12px] text-[#1B1717]">
                                            {item.depositBankName}
                                        </td>
                                        <td className="px-4 py-3 text-[12px] text-[#1B1717]">
                                            {item.depositBankAccount}
                                        </td>
                                        <td className="px-4 py-3 text-[12px] text-[#1B1717]">
                                            {item.refNumber}
                                        </td>
                                        <td className="px-4 py-3 text-[12px] text-[#1B1717]">
                                            {item.txnId}
                                        </td>
                                        <td className="px-4 py-3 text-[12px] text-[#1B1717]">
                                            {item.amount}
                                        </td>

                                        {/* Approved */}
                                        <td className="px-4 py-3">
                                            <div className="w-6 h-6 border border-gray-400 rounded flex items-center justify-center">
                                                {item.approved && (
                                                    <svg
                                                        className="w-4 h-4 text-[#039155]"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={3}
                                                            d="M5 13l4 4L19 7"
                                                        />
                                                    </svg>
                                                )}
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="px-4 py-3">
                                            <span className="px-3 py-1 text-[12px] font-['Gilroy-Medium'] rounded-full bg-[#039155] text-white">
                                                Success
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>


                {/* Pagination */}
                <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`p-2 rounded-lg transition ${currentPage === 1
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-[#1B1717] hover:bg-gray-100"
                            }`}
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                    </button>

                    {[...Array(totalPages)].map((_, index) => {
                        const page = index + 1;
                        return (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`px-4 py-2 rounded-lg text-[12px] font-['Gilroy-Medium'] transition ${currentPage === page
                                    ? "bg-[#039155] text-white"
                                    : "text-[#1B1717] hover:bg-gray-100"
                                    }`}
                            >
                                {page}
                            </button>
                        );
                    })}

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`p-2 rounded-lg transition ${currentPage === totalPages
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-[#1B1717] hover:bg-gray-100"
                            }`}
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FundRequest;
