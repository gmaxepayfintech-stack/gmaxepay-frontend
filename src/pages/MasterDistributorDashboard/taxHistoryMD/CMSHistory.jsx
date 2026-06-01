import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { Search, Share, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { HiArrowLeft } from "react-icons/hi2";
import { ButtonLoader } from "../../../widgets/layout/loader";
import CMSTransactionDetails from "./CMSTransactionDetails";
import * as XLSX from "xlsx";
import { cmsUserHistory } from "../../../redux/action/rechargeAction";

const CMSHistory = ({ onBack }) => {
    const dispatch = useDispatch();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    const [isReloading, setIsReloading] = useState(false);
    const [selectedTransactionData, setSelectedTransactionData] = useState(null);
    const [showTransactionDetails, setShowTransactionDetails] = useState(false);

    const cmsReportsResponse = useSelector((state) => state?.recharge?.cmsReports);
    const apiData = cmsReportsResponse?.cmsReports || [];
    const paginator = cmsReportsResponse?.paginator || {};
    const totalPages = paginator.pageCount || 1;
    const totalCount = paginator.itemCount || 0;
    const isLoading = useSelector((state) => state?.loading?.isLoading || false);

    const fetchData = useCallback((page = 1) => {
        const payload = {
            query: {
                ...(fromDate && toDate ? { startDate: fromDate, endDate: toDate } : {}),
                ...(statusFilter !== "All" ? { status: statusFilter.toUpperCase() } : {}),
            },
            ...(debouncedSearchQuery.trim() ? { customSearch: { transactionId: debouncedSearchQuery.trim() } } : {}),
            options: { page, paginate: itemsPerPage, sort: { createdAt: -1 } },
        };
        dispatch(cmsUserHistory(payload));
    }, [dispatch, fromDate, toDate, statusFilter, debouncedSearchQuery, itemsPerPage]);

    useEffect(() => {
        const timer = setTimeout(() => { setDebouncedSearchQuery(searchQuery); setCurrentPage(1); }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        const bothDatesSelected = fromDate && toDate;
        const bothDatesNull = !fromDate && !toDate;
        if (!bothDatesSelected && !bothDatesNull) return;
        fetchData(currentPage);
    }, [fetchData, currentPage, fromDate, toDate, statusFilter, debouncedSearchQuery, itemsPerPage]);

    useEffect(() => { if (!isLoading && isReloading) setIsReloading(false); }, [isLoading, isReloading]);

    const transformApiData = (dataArray) => {
        if (!Array.isArray(dataArray) || dataArray.length === 0) return [];
        return dataArray.map((item, index) => {
            let formattedDate = "N/A", formattedTime = "N/A";
            if (item.createdAt) {
                const date = new Date(item.createdAt);
                const datePart = date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" }).replaceAll("/", "-");
                const timePart = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
                formattedDate = `${datePart} | ${timePart}`;
            }
            const rawStatus = item.status || "Pending";
            const status = rawStatus === "SUCCESS" ? "Success" : rawStatus === "FAILED" || rawStatus === "FAILURE" ? "Failed" : rawStatus === "PENDING" ? "Pending" : rawStatus;
            return {
                id: item.id || index, createdAt: formattedDate,
                txnUser: item.user?.name || "N/A", userId: item.user?.userId || "N/A",
                mobileNo: item.mobileNo || item.user?.mobileNo || "N/A", event: item.event || "N/A",
                billerName: item.billerName || "N/A", transactionId: item.referenceId || "N/A",
                refNo: item.utr || item.ackno || "N/A", amount: `₹${item.amount ?? 0}`,
                commission: item.commission ?? 0, openingWallet: item.openingWallet, closingWallet: item.closingWallet,
                debit: item.debit ?? 0, credit: item.credit ?? 0, errorMsg: item.errorMsg || null, status, originalItem: item,
            };
        });
    };

    const transactions = transformApiData(apiData);
    const statusFilters = ["All", "Success", "Pending", "Failed"];
    const startIndex = (currentPage - 1) * itemsPerPage;

    const handleExportToExcel = () => {
        if (!transactions || transactions.length === 0) { alert("No data available to export"); return; }
        const excelData = transactions.map((row, index) => ({
            "SR No": (currentPage - 1) * itemsPerPage + index + 1, "Date & Time": row.createdAt,
            "TXN User": row.txnUser, "User ID": row.userId, "Mobile No": row.mobileNo,
            "Event": row.event, "Biller Name": row.billerName,
            "TXN ID": row.transactionId, "UTR / Ackno": row.refNo,
            "Amount": row.amount, "Status": row.status, "Error": row.errorMsg || "",
        }));
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "CMS_History");
        XLSX.writeFile(workbook, `CMS_History_${new Date().toISOString().split("T")[0]}.xlsx`);
    };

    if (showTransactionDetails) {
        return <CMSTransactionDetails transactionData={selectedTransactionData} onBack={() => { setShowTransactionDetails(false); setSelectedTransactionData(null); }} />;
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] p-2 sm:p-3 md:p-4 text-[#1B1717] flex flex-col max-w-[1600px] mx-auto">
            <div className="mb-3 sm:mb-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-2 sm:mb-3">
                    <div className="flex items-start gap-3 sm:gap-5">
                        <button onClick={onBack || (() => globalThis.history?.back())} className="flex items-center text-[#1B1717] hover:text-[#039155] transition mt-1">
                            <div className="rounded-full p-2 bg-[#FFFFFF] border border-[#1B1717]/80 transition"><HiArrowLeft className="text-xl sm:text-2xl text-[#1B1717]/80 opacity-80" /></div>
                        </button>
                        <div>
                            <h1 className="text-lg sm:text-xl md:text-2xl font-['Gilroy-Medium'] text-[#1B1717]">CMS History</h1>
                            <p className="text-xs sm:text-sm md:text-base text-[#1B1717] font-['Gilroy-Regular']">Manage And Track All Your Transactions</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        {statusFilters.map((status) => (
                            <button key={status} onClick={() => { setStatusFilter(status); setCurrentPage(1); }}
                                className={`px-3 py-2 sm:px-4 sm:py-3 rounded-2xl text-sm sm:text-base transition whitespace-nowrap ${statusFilter === status ? "bg-[#039155] text-white shadow-md font-['gilroy-semibold']" : "bg-white text-[#1B1717]/80 font-['Gilroy-Medium'] border-[0.5px] border-[#1B1717]/80 hover:bg-gray-50"}`}>
                                {status}
                            </button>
                        ))}
                        <button onClick={() => { setFromDate(""); setToDate(""); setSearchQuery(""); setStatusFilter("All"); setCurrentPage(1); setIsReloading(true); dispatch(cmsUserHistory({ options: { page: 1, paginate: itemsPerPage, sort: { createdAt: -1 } } })); }}
                            className="p-2.5 sm:p-3 rounded-2xl bg-white text-gray-700 border-[0.5px] border-[#1B1717]/80 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed" disabled={isLoading}>
                            <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 text-[#1B1717]/80 transition-transform ${isLoading ? "animate-spin" : ""}`} />
                        </button>
                    </div>
                </div>
            </div>
            <div className="p-1 mb-2 flex-shrink-0">
                <div className="flex flex-col md:flex-col lg:flex-row items-stretch lg:items-end gap-3 sm:gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#1B1717]/80" />
                        <input type="text" placeholder="Search by TXN ID / Reference ID" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border-[0.5px] border-[#1B1717]/80 rounded-lg focus:outline-none text-sm sm:text-base" />
                    </div>
                    <div className="relative flex-1 md:flex-1 lg:flex-initial lg:w-auto">
                        <label className="block text-xs sm:text-sm text-[#1B1717]/80 mb-1 ml-1 font-[Gilroy-Medium]">From Date</label>
                        <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setCurrentPage(1); }} className="w-full px-4 py-2.5 sm:py-3 border-[0.5px] border-[#1B1717]/80 rounded-lg focus:outline-none text-sm sm:text-base" />
                    </div>
                    <div className="relative flex-1 md:flex-1 lg:flex-initial lg:w-auto">
                        <label className="block text-xs sm:text-sm text-[#1B1717]/80 mb-1 ml-1 font-[Gilroy-Medium]">To Date</label>
                        <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setCurrentPage(1); }} className="w-full px-4 py-2.5 sm:py-3 border-[0.5px] border-[#1B1717]/80 rounded-lg focus:outline-none text-sm sm:text-base" />
                    </div>
                    <div className="flex items-end gap-3 w-full lg:w-auto">
                        <div className="relative flex-1 md:flex-1 lg:flex-initial lg:w-auto">
                            <label className="block text-xs sm:text-sm text-[#1B1717]/80 mb-1 ml-1 font-[Gilroy-Medium]">Show Entries</label>
                            <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="w-full px-4 py-2.5 sm:py-3 border-[0.5px] border-[#1B1717]/80 rounded-lg focus:outline-none text-sm sm:text-base appearance-none bg-white font-[Gilroy-Medium] cursor-pointer">
                                {[10, 25, 50, 100, 200].map((size) => <option key={size} value={size}>{size}</option>)}
                            </select>
                        </div>
                        <button onClick={handleExportToExcel} className="flex-1 lg:flex-initial flex justify-center items-center gap-2 bg-[#039155] text-white px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-lg font-[Gilroy-Medium] hover:bg-green-700 transition shadow-md whitespace-nowrap">
                            <span>Export</span><Share className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-xl sm:rounded-3xl shadow-sm mt-6 overflow-hidden flex-1">
                <div className="w-full overflow-x-auto overscroll-x-contain">
                    <table className="w-full border-collapse min-w-full">
                        <thead className="bg-[#FFFFFF] border-b border-gray-200">
                            <tr>{["SR.No", "Date & Time", "TXN User", "Mobile No", "Event", "Biller Name", "TXN ID", "UTR / Ackno", "Amount", "Status", "Action"].map((h) => (
                                <th key={h} className="px-4 sm:px-5 py-3 sm:py-4 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">{h}</th>
                            ))}</tr>
                        </thead>
                        {!isLoading && (
                            <tbody className="bg-white divide-y divide-gray-200">
                                {transactions.length > 0 ? transactions.map((transaction, index) => (
                                    <tr key={transaction.id} className={`transition-colors ${index % 2 === 0 ? "bg-[#039155]/5 hover:bg-[#E8F5ED]" : "bg-white hover:bg-gray-50"}`}>
                                        <td className="px-4 sm:px-5 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-['Gilroy-Regular'] text-[#121216]">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                        <td className="px-4 sm:px-5 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-['Gilroy-Regular'] text-[#121216]">{transaction.createdAt}</td>
                                        <td className="px-4 sm:px-5 py-3 sm:py-4 whitespace-nowrap"><div className="flex flex-col"><span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#121216]">{transaction.txnUser}</span><span className="text-xs text-[#1B1717]/50">{transaction.userId}</span></div></td>
                                        <td className="px-4 sm:px-5 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-['Gilroy-Regular'] text-[#121216]">{transaction.mobileNo}</td>
                                        <td className="px-4 sm:px-5 py-3 sm:py-4 whitespace-nowrap"><span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-[Gilroy-Medium] ${transaction.event === "CMS_POSTING" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>{transaction.event}</span></td>
                                        <td className="px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Regular'] text-[#121216]" style={{maxWidth:"180px",whiteSpace:"normal",wordBreak:"break-word"}}>{transaction.billerName}</td>
                                        <td className="px-4 sm:px-5 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-['Gilroy-Regular'] text-[#121216]">{transaction.transactionId}</td>
                                        <td className="px-4 sm:px-5 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-['Gilroy-Regular'] text-[#121216]">{transaction.refNo}</td>
                                        <td className="px-4 sm:px-5 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-['Gilroy-Regular'] text-[#121216] font-semibold">{transaction.amount}</td>
                                        <td className="px-4 sm:px-5 py-3 sm:py-4 whitespace-nowrap"><span className={`inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-[Gilroy-Medium] ${transaction.status === "Success" ? "bg-[#039155] text-white" : transaction.status === "Pending" ? "bg-orange-500/80 text-white" : "bg-red-500/80 text-white"}`}>{transaction.status}</span></td>
                                        <td className="px-4 sm:px-5 py-3 sm:py-4 whitespace-nowrap"><button onClick={() => { setSelectedTransactionData(transaction.originalItem); setShowTransactionDetails(true); }} className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[#039155] text-white text-xs sm:text-sm font-['Gilroy-Medium'] rounded-lg hover:bg-green-700 transition shadow-sm whitespace-nowrap">View</button></td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={11} className="px-4 sm:px-6 py-8 text-center"><p className="text-sm sm:text-base font-['Gilroy-Medium'] text-gray-500">No transactions found</p></td></tr>
                                )}
                            </tbody>
                        )}
                    </table>
                </div>
                {isLoading ? (
                    <div className="flex items-center justify-center gap-3 pt-4 pb-4 border-t border-gray-200"><ButtonLoader color="#039155" size={24} thickness={3} /><p className="text-sm sm:text-base font-['Gilroy-Medium'] text-[#1B1717]">Loading...</p></div>
                ) : (
                    <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200">
                        <p className="text-xs sm:text-sm text-[#1B1717]/60 font-['Gilroy-Regular']">Showing {totalCount === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + itemsPerPage, totalCount)} of {totalCount} records</p>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="p-1.5 sm:p-2 rounded-lg border border-gray-300 bg-white text-[#1B1717] hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" /></button>
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) pageNum = i + 1;
                                else if (currentPage <= 3) pageNum = i + 1;
                                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                                else pageNum = currentPage - 2 + i;
                                return <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-[Gilroy-Medium] transition text-sm sm:text-base ${currentPage === pageNum ? "bg-[#039155] text-white" : "bg-white border border-gray-300 text-[#1B1717] hover:bg-gray-50"}`}>{pageNum}</button>;
                            })}
                            <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages || totalPages === 0} className="p-1.5 sm:p-2 rounded-lg border border-gray-300 bg-white text-[#1B1717] hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"><ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" /></button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

CMSHistory.propTypes = { onBack: PropTypes.func };
CMSHistory.defaultProps = { onBack: null };
export default CMSHistory;
