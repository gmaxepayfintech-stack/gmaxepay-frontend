import React, { useEffect } from 'react';
import { useCompany } from '../../context/CompanyContext';
import { HiArrowLeft } from "react-icons/hi2";
import { Phone, Mail, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ContactSupport = () => {
    const navigate = useNavigate();
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
                    onClick={() => navigate('/retailerDashboard/home')}
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
                <div className="space-y-4">
                    <h2 className="text-xl font-[Gilroy-Medium] text-[#1B1717]">
                        Contact Our Team
                    </h2>

                    <div className="flex flex-wrap gap-4">
                        {/* Call Support Cards */}
                        {phoneNumbers.map((phone, idx) => (
                            <div
                                key={idx}
                                className="bg-white rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.04)] p-6 flex items-center gap-4 min-w-[280px] flex-1 max-w-sm"
                            >
                                <div className="w-12 h-12 shrink-0 bg-[#E6F8EF] rounded-full flex items-center justify-center">
                                    <Phone className="w-5 h-5 text-[#039155]" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-[Gilroy-Medium] text-[#1B1717]">Call Support</p>
                                    <p className="text-xl mt-0.5 font-[Gilroy-SemiBold] text-[#1B1717] truncate">{phone}</p>
                                </div>
                            </div>
                        ))}

                        {/* Email Support Card */}
                        {supportEmail && (
                            <div className="bg-white rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.04)] p-6 flex items-center gap-4 min-w-[280px] flex-1 max-w-sm">
                                <div className="w-12 h-12 shrink-0 bg-[#E6F8EF] rounded-full flex items-center justify-center">
                                    <Mail className="w-5 h-5 text-[#039155]" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-[Gilroy-Medium] text-[#1B1717]">Email Support</p>
                                    <p className="text-xl mt-0.5 font-[Gilroy-SemiBold] text-[#1B1717] truncate">{supportEmail}</p>
                                </div>
                            </div>
                        )}

                        {phoneNumbers.length === 0 && !supportEmail && (
                            <p className="text-sm font-[Gilroy-Medium] text-[#1B1717]/50 py-4 px-2">
                                No contact support information available yet.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactSupport;