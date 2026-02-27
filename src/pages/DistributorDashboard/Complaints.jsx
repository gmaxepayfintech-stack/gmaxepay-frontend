import React, { useState } from "react";
import { Calendar, ChevronDown, PlusCircle, ArrowLeft, UploadCloud } from "lucide-react";

const Complaints = () => {
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [status, setStatus] = useState("Pending");
    const [isRaisingComplaint, setIsRaisingComplaint] = useState(false);

    // Form state
    const [service, setService] = useState("");
    const [reason, setReason] = useState("");
    const [description, setDescription] = useState("");

    const complaintsData = [
        {
            id: "#CMP-2026-001",
            date: "27-02-2026",
            service: "AEPS",
            reason: "Transaction Failed",
            description: "Amount deducted but not credited to the respective wallet account",
            status: "Pending"
        }
    ];

    if (isRaisingComplaint) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] text-[#1B1717] w-full max-w-[1600px] mx-auto p-4 sm:p-6 md:p-8">
                <div className="flex items-center gap-4 mb-6 sm:mb-8">
                    <button
                        onClick={() => setIsRaisingComplaint(false)}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <h1 className="text-xl sm:text-2xl font-['Gilroy-Medium'] text-[#1B1717] font-semibold">
                        Raise A Complaints
                    </h1>
                </div>

                <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-sm border border-gray-100 max-w-3xl">
                    <div className="space-y-6">
                        {/* Select Service */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 font-['Gilroy-Medium']">
                                Select Service <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    value={service}
                                    onChange={(e) => setService(e.target.value)}
                                    className="w-full appearance-none bg-white border border-gray-300 hover:border-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#039155] focus:border-transparent text-sm text-gray-600 cursor-pointer"
                                >
                                    <option value="" disabled>Select</option>
                                    <option value="aeps">AEPS</option>
                                    <option value="bbps">BBPS</option>
                                    <option value="money-transfer">Money Transfer</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Reason For Compliant */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 font-['Gilroy-Medium']">
                                Reason For Compliant <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="w-full appearance-none bg-white border border-gray-300 hover:border-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#039155] focus:border-transparent text-sm text-gray-600 cursor-pointer"
                                >
                                    <option value="" disabled>Select</option>
                                    <option value="pending-transaction">Pending Transaction</option>
                                    <option value="failed-transaction">Failed Transaction</option>
                                    <option value="other">Other</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Describe User Compliant */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 font-['Gilroy-Medium']">
                                Describe User Compliant <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Write About Compliant"
                                className="w-full min-h-[120px] bg-white border border-gray-300 hover:border-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#039155] focus:border-transparent text-sm text-gray-600 resize-y"
                            ></textarea>
                        </div>

                        {/* Attach File */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 font-['Gilroy-Medium']">
                                Attach File
                            </label>
                            <div className="border border-dashed border-gray-300 rounded-xl p-8 hover:bg-gray-50 hover:border-gray-400 transition-colors cursor-pointer flex flex-col items-center justify-center text-center">
                                <UploadCloud className="w-8 h-8 text-gray-500 mb-3" />
                                <h3 className="text-sm font-semibold text-gray-800 mb-1 font-['Gilroy-Medium']">
                                    Click To Upload Or Drag And Drop
                                </h3>
                                <p className="text-[11px] text-gray-500 font-['Gilroy-Regular']">
                                    SVG, PNG, JPG Or PDF ( Max 5 MB)
                                </p>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button className="w-full bg-[#039155] hover:bg-[#027a48] text-white font-semibold py-3.5 px-6 rounded-xl transition-colors shadow-sm text-base font-['Gilroy-Medium']">
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] p-4 sm:p-6 text-[#1B1717] w-full max-w-[1600px] mx-auto">
            {/* Header / Actions section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
                <h1 className="text-xl sm:text-2xl font-['Gilroy-Medium'] text-[#1B1717] font-semibold">
                    Compliant List
                </h1>

                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    {/* From Date */}
                    <div className="relative flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 hover:border-gray-300 transition-colors shadow-sm">
                        <input
                            type="text"
                            placeholder="From Date"
                            onFocus={(e) => (e.target.type = "date")}
                            onBlur={(e) => {
                                if (!e.target.value) e.target.type = "text";
                            }}
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="bg-transparent outline-none text-sm text-gray-500 w-[100px] cursor-pointer"
                        />
                        <Calendar className="w-4 h-4 text-gray-400 absolute right-3 pointer-events-none" />
                    </div>

                    {/* To Date */}
                    <div className="relative flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 hover:border-gray-300 transition-colors shadow-sm">
                        <input
                            type="text"
                            placeholder="To Date"
                            onFocus={(e) => (e.target.type = "date")}
                            onBlur={(e) => {
                                if (!e.target.value) e.target.type = "text";
                            }}
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="bg-transparent outline-none text-sm text-gray-500 w-[100px] cursor-pointer"
                        />
                        <Calendar className="w-4 h-4 text-gray-400 absolute right-3 pointer-events-none" />
                    </div>

                    {/* Pending Dropdown */}
                    <div className="relative flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 hover:border-gray-300 transition-colors shadow-sm">
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="bg-transparent outline-none text-sm text-gray-500 w-[100px] appearance-none cursor-pointer pr-4"
                        >
                            <option value="Pending">Pending</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Rejected">Rejected</option>
                            <option value="All">All</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 pointer-events-none" />
                    </div>

                    {/* New Compliant Button */}
                    <button
                        onClick={() => setIsRaisingComplaint(true)}
                        className="flex items-center gap-2 bg-[#039155] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#027543] transition-colors shadow-sm"
                    >
                        New Compliant
                        <PlusCircle className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Main content area */}
            <div className="w-full bg-white rounded-xl sm:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse min-w-full">
                        <thead className="bg-[#FFFFFF] border-b border-gray-200 text-center">
                            <tr>
                                <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap text-left border-r border-gray-100 last:border-r-0">
                                    Compliant ID
                                </th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap text-left border-r border-gray-100 last:border-r-0">
                                    Date
                                </th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap text-left border-r border-gray-100 last:border-r-0">
                                    Service
                                </th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap text-left border-r border-gray-100 last:border-r-0">
                                    Reason
                                </th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap text-left border-r border-gray-100 last:border-r-0">
                                    Description
                                </th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] whitespace-nowrap">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 text-center">
                            {complaintsData.length > 0 ? (
                                complaintsData.map((item, index) => (
                                    <tr
                                        key={item.id}
                                        className={`transition-colors ${index % 2 === 0
                                            ? "bg-[#039155]/5 hover:bg-[#E8F5ED]"
                                            : "bg-white hover:bg-gray-50"
                                            }`}
                                    >
                                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-left">
                                            <span className="text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1A1A1A]">
                                                {item.id}
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-left">
                                            <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#1A1A1A]">
                                                {item.date}
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-left">
                                            <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#1A1A1A]">
                                                {item.service}
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-left">
                                            <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#1A1A1A]">
                                                {item.reason}
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-left max-w-[200px] truncate">
                                            <span className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#1A1A1A]" title={item.description}>
                                                {item.description}
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1.5 rounded-full text-[10px] sm:text-xs font-[Gilroy-Medium] ${item.status === "Resolved"
                                                ? "bg-green-100 text-green-700"
                                                : item.status === "Pending"
                                                    ? "bg-yellow-100 text-yellow-700"
                                                    : "bg-red-100 text-red-700"
                                                }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-4 sm:px-6 py-8 text-center text-sm font-['Gilroy-Medium'] text-gray-500">
                                        No complaints found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Complaints;
