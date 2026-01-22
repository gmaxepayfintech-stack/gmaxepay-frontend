import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import * as XLSX from "xlsx";
import { useNotification } from '../../../context/NotificationContext';
import { distributerApproveRequest, distributorGetRequest } from '../../../redux/action/fundAction';

const FundRequest = () => {
    const dispatch = useDispatch();
    const { showNotification } = useNotification();
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [fundRequests, setFundRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const debounceTimerRef = useRef(null);
    const itemsPerPage = 10;

    // Fetch fund requests from API
    const fetchFundRequests = useCallback(async () => {
        try {
            setLoading(true);
            
            // Build customSearch object for search term
            const customSearch = {};
            if (searchTerm.trim()) {
                customSearch.referenceNo = searchTerm.trim();
                customSearch.transactionId = searchTerm.trim();
            }

            // Build query object for date filters
            const query = {};
            if (fromDate) {
                query.fromDate = fromDate;
            }
            if (toDate) {
                query.toDate = toDate;
            }

            // Build payload
            const payload = {
                query: query,
                customSearch: Object.keys(customSearch).length > 0 ? customSearch : {},
                options: {
                    page: currentPage,
                    paginate: itemsPerPage,
                    sort: { createdAt: -1 }
                }
            };

            const result = await dispatch(distributorGetRequest(payload));
            
            if (result?.status === "SUCCESS" && result?.mdFundrequest) {
                // mdFundrequest is the data array directly from the API response
                const dataArray = Array.isArray(result.mdFundrequest) 
                    ? result.mdFundrequest 
                    : result.mdFundrequest?.data || [];
                setFundRequests(dataArray);
                // Calculate total pages based on data length if pagination info not provided
                const calculatedPages = Math.ceil(dataArray.length / itemsPerPage) || 1;
                setTotalPages(result.mdFundrequest?.totalPages || calculatedPages);
                setTotalRecords(result.mdFundrequest?.totalRecords || dataArray.length);
            } else {
                showNotification({
                    type: "error",
                    message: result?.message || "Failed to fetch fund requests",
                    isCritical: true,
                });
            }
        } catch (error) {
            showNotification({
                type: "error",
                message: error?.response?.data?.message || error?.message || "Failed to fetch fund requests",
                isCritical: true,
            });
        } finally {
            setLoading(false);
        }
    }, [dispatch, showNotification, searchTerm, fromDate, toDate, currentPage, itemsPerPage]);

    // Fetch data on component mount and when filters change (excluding searchTerm which is debounced)
    useEffect(() => {
        fetchFundRequests();
    }, [currentPage, fromDate, toDate, fetchFundRequests]);

    // Debounce search term
    useEffect(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
            if (currentPage === 1) {
                fetchFundRequests();
            } else {
                setCurrentPage(1); // Reset to first page when searching
            }
        }, 500);

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm]);

    // Handle approve fund request
    const handleApprove = async (fundRequestId, approvalRemarks = "") => {
        if (!fundRequestId) {
            showNotification({
                type: "error",
                message: "Invalid fund request ID",
                isCritical: true,
            });
            return;
        }
        
        try {
            setLoading(true);
            const payload = {
                fundRequestId: fundRequestId.toString(),
                action: "APPROVED",
                approvalRemarks: approvalRemarks || ""
            };

            const result = await dispatch(distributerApproveRequest(payload));
            
            if (result?.status === "SUCCESS") {
                showNotification({
                    type: "success",
                    message: result.message || "Fund request approved successfully",
                    isCritical: true,
                });
                // Refresh the list
                fetchFundRequests();
            } else {
                showNotification({
                    type: "error",
                    message: result?.message || "Failed to approve fund request",
                    isCritical: true,
                });
            }
        } catch (error) {
            showNotification({
                type: "error",
                message: error?.response?.data?.message || error?.message || "Failed to approve fund request",
                isCritical: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        if (fundRequests.length === 0) {
            showNotification({
                type: "error",
                message: "No data to export",
                isCritical: true,
            });
            return;
        }

        // Format date helper
        const formatDate = (dateString) => {
            if (!dateString) return "";
            try {
                const date = new Date(dateString);
                return date.toLocaleDateString('en-GB', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: '2-digit' 
                });
            } catch {
                return dateString;
            }
        };

        // Prepare data for export
        const exportData = fundRequests.map((item, index) => ({
            "SR No": index + 1,
            "Created At": formatDate(item.createdAt),
            "Request By": item.requester?.name || "",
            "Deposit Bank Name": item.bank?.bankName || "",
            "Deposit Bank Account": item.bank?.accountNumber || "",
            "Ref Number": item.referenceNo || "",
            "Txn Id": item.transactionId || "",
            "Amount": item.amount || "",
            "Approved": item.status === "APPROVED" ? "Yes" : "No",
            "Status": item.status || "PENDING",
        }));

        // Convert JSON to worksheet
        const worksheet = XLSX.utils.json_to_sheet(exportData);

        // Create workbook & append sheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Fund Requests");

        // Download Excel file
        XLSX.writeFile(workbook, "Fund_Request_List.xlsx");
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
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="h-[44px] px-3 border border-[#1B1717]/50 rounded-lg text-[14px] min-w-[140px]"
                            />
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="h-[44px] px-3 border border-[#1B1717]/50 rounded-lg text-[14px] min-w-[140px]"
                            />
                        </div>

                        {/* Export */}
                        <button
                            onClick={handleExport}
                            className="h-[44px] px-6 bg-[#039155] text-white rounded-lg text-[14px] font-['Gilroy-Medium'] flex items-center justify-center gap-2 whitespace-nowrap"
                        >
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
                                {loading && fundRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="px-4 py-8 text-center text-[14px] text-[#1B1717]">
                                            Loading...
                                        </td>
                                    </tr>
                                ) : fundRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="px-4 py-8 text-center text-[14px] text-[#1B1717]">
                                            No fund requests found
                                        </td>
                                    </tr>
                                ) : (
                                    fundRequests.map((item, index) => {
                                        const isApproved = item.status === "APPROVED";
                                        const fundRequestId = item.id;
                                        
                                        // Format date from ISO string
                                        const formatDate = (dateString) => {
                                            if (!dateString) return "";
                                            try {
                                                const date = new Date(dateString);
                                                return date.toLocaleDateString('en-GB', { 
                                                    day: '2-digit', 
                                                    month: '2-digit', 
                                                    year: '2-digit' 
                                                });
                                            } catch {
                                                return dateString;
                                            }
                                        };
                                        
                                        return (
                                            <tr
                                                key={fundRequestId || index}
                                                className={`border-b border-gray-100 ${index % 2 === 0 ? "bg-white" : "bg-green-50 font-['Gilroy-Regular']"
                                                    }`}
                                            >
                                                <td className="px-4 py-3 text-[12px] text-[#1B1717]">
                                                    {(currentPage - 1) * itemsPerPage + index + 1}
                                                </td>
                                                <td className="px-4 py-3 text-[12px] text-[#1B1717]">
                                                    {formatDate(item.createdAt)}
                                                </td>
                                                <td className="px-4 py-3 text-[12px] text-[#1B1717]">
                                                    {item.requester?.name || ""}
                                                </td>
                                                <td className="px-4 py-3 text-[12px] text-[#1B1717]">
                                                    {item.bank?.bankName || ""}
                                                </td>
                                                <td className="px-4 py-3 text-[12px] text-[#1B1717]">
                                                    {item.bank?.accountNumber || ""}
                                                </td>
                                                <td className="px-4 py-3 text-[12px] text-[#1B1717]">
                                                    {item.referenceNo || ""}
                                                </td>
                                                <td className="px-4 py-3 text-[12px] text-[#1B1717]">
                                                    {item.transactionId || ""}
                                                </td>
                                                <td className="px-4 py-3 text-[12px] text-[#1B1717]">
                                                    {item.amount ? `₹${item.amount}` : ""}
                                                </td>

                                                {/* Approved */}
                                                <td className="px-4 py-3">
                                                    {isApproved ? (
                                                        <div className="w-6 h-6 border border-gray-400 rounded flex items-center justify-center bg-green-50">
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
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleApprove(fundRequestId)}
                                                            disabled={loading}
                                                            className="w-6 h-6 border border-gray-400 rounded flex items-center justify-center hover:bg-green-50 hover:border-[#039155] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title="Click to approve"
                                                        >
                                                            <svg
                                                                className="w-4 h-4 text-gray-400"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M5 13l4 4L19 7"
                                                                />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </td>

                                                {/* Status */}
                                                <td className="px-4 py-3">
                                                    <span className={`px-3 py-1 text-[12px] font-['Gilroy-Medium'] rounded-full text-white ${
                                                        item.status === "APPROVED" || isApproved
                                                            ? "bg-[#039155]"
                                                            : item.status === "REJECTED"
                                                            ? "bg-red-500"
                                                            : "bg-yellow-500"
                                                    }`}>
                                                        {item.status || "PENDING"}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
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

                    {totalPages > 0 && [...Array(totalPages)].map((_, index) => {
                        const page = index + 1;
                        // Show first page, last page, current page, and pages around current
                        if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
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
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                            return <span key={page} className="px-2">...</span>;
                        }
                        return null;
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
