import React, { useEffect } from 'react';
import { useCompany } from '../../context/CompanyContext';
import { HiArrowLeft } from "react-icons/hi2";
import { Phone, Mail, Loader2 } from "lucide-react";

const ContactSupport = () => {
    const { company, loading } = useCompany();

    useEffect(() => {
        console.log("useCompany - company data:", company);
    }, [company]);

    const phoneNumbers = company?.supportPhoneNumbers || [];
    const supportEmail = company?.customerSupportEmail || "";

    return (
        <div className="px-1 py-4 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => globalThis.history?.back()}
                    className="rounded-full p-2 bg-white border border-gray-400"
                >
                    <HiArrowLeft className="text-xl text-gray-600" />
                </button>
                <h1 className="text-xl md:text-2xl font-[Gilroy-Medium] text-[#1B1717]">
                    Contact Support
                </h1>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="w-8 h-8 animate-spin text-[#039155]" />
                </div>
            ) : (
                <>
                    {/* ── Phone Numbers Section ────────────────────────── */}
                    <div className="bg-white rounded-3xl shadow-sm p-5 space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="p-2 bg-green-50 rounded-xl">
                                <Phone className="w-5 h-5 text-[#039155]" />
                            </span>
                            <h3 className="text-xl md:text-2xl font-[Gilroy-Medium] text-[#1B1717]">
                                Support Phone Numbers
                            </h3>
                        </div>

                        {phoneNumbers.length === 0 ? (
                            <p className="text-sm font-[Gilroy-Medium] text-[#1B1717]/50">
                                No phone numbers available.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {phoneNumbers.map((phone, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3"
                                    >
                                        <Phone className="w-4 h-4 text-[#039155]" />
                                        <span className="text-sm font-[Gilroy-Medium] text-[#1B1717]">
                                            +91 {phone}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Email Section ────────────────────────────────── */}
                    <div className="bg-white rounded-3xl shadow-sm p-5 space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="p-2 bg-blue-50 rounded-xl">
                                <Mail className="w-5 h-5 text-blue-500" />
                            </span>
                            <h3 className="text-xl md:text-2xl font-[Gilroy-Medium] text-[#1B1717]">
                                Support Email
                            </h3>
                        </div>

                        {supportEmail ? (
                            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
                                <Mail className="w-4 h-4 text-blue-500" />
                                <span className="text-sm font-[Gilroy-Medium] text-[#1B1717]">
                                    {supportEmail}
                                </span>
                                <span className="ml-auto text-xs font-[Gilroy-Medium] px-2 py-0.5 bg-green-100 text-[#039155] rounded-full">
                                    Active
                                </span>
                            </div>
                        ) : (
                            <p className="text-sm font-[Gilroy-Medium] text-[#1B1717]/50">
                                No support email configured.
                            </p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default ContactSupport;