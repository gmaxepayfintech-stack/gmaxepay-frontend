import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileIcon from "../../../public/img/MobileIcon.svg";
import PropTypes from "prop-types";

const DEFAULT_DESCRIPTION =
    "You Can Now Pay Your Utility Bills, Insurance Premiums, Loan Repayments And Other Services Through BBPS, Making Bill Payments Convenient And Hassle-Free";

const bbpsServicesData = [
    { id: "electricity", title: "Electricity Bill Payment", status: "available" },
    { id: "gas", title: "Gas Bill Payment", status: "available" },
    { id: "water", title: "Water Bill Payment", status: "available" },
    { id: "landline", title: "Landline/Postpaid Bill", status: "available" },
    { id: "insurance", title: "Insurance Premium", status: "available" },
    { id: "loan-repayment", title: "Loan Repayment", status: "available" },
    { id: "credit-card", title: "Credit Card Bill", status: "available" },
    { id: "fastag", title: "FastTag Recharge", status: "available" },
    { id: "lic", title: "LIC Premium", status: "available" },
    { id: "broadband", title: "Broadband Bill", status: "subscribed" },
    { id: "cable-tv", title: "Cable TV Bill", status: "subscribed" },
    { id: "education-fee", title: "Education Fee Payment", status: "subscribed" },
    { id: "municipal-tax", title: "Municipal Tax", status: "subscribed" },
    { id: "housing-society", title: "Housing Society Maintenance", status: "subscribed" },
].map((s) => ({ ...s, description: DEFAULT_DESCRIPTION }));

const ServiceCard = ({ title, description, onClick }) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className="bg-[#FFFFFF] rounded-xl shadow-sm border border-gray-100 px-6 py-4 min-h-[182px] relative text-left hover:shadow-md transition"
        >
            <div className="flex gap-3">
                <div className="w-[60px] h-[60px] rounded-full bg-[#DBEAFE] flex items-center justify-center shrink-0">
                    <img src={MobileIcon} alt="MobileIcon" className="w-[32px] h-[32px]" />
                </div>
                <div className="min-w-0 flex flex-col justify-center">
                    <div className="text-[18px] font-['Gilroy-Medium'] text-[#1B1717] capitalize">
                        {title}
                    </div>
                    <div className="mt-[12px] text-[12.5px] text-[#000000] font-['Gilroy-Regular'] leading-relaxed line-clamp-4 capitalize">
                        {description}
                    </div>
                </div>
            </div>
        </button>
    );
};

ServiceCard.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    onClick: PropTypes.func,
};

const BBPSServices = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState("Available");
    const navigate = useNavigate();

    const filtered = useMemo(() => {
        const key = activeTab.toLowerCase();
        return bbpsServicesData.filter((s) => s.status === key);
    }, [activeTab]);

    const handleServiceClick = (serviceId) => {
        console.log(`🖱️ ${serviceId} service clicked`);
        // Add navigation logic here based on service ID
        // navigate(`/retailerDashboard/bbps/${serviceId}`);
    };

    return (
        <div className="w-full">
            {/* Back Button */}
            {onBack && (
                <div className="mb-6">
                    <button
                        type="button"
                        onClick={onBack}
                        className="flex items-center gap-2 text-[#1B1717] hover:text-[#039155] transition font-['Gilroy-Medium']"
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
                        Back to Services
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="mb-[44px]">
                <div className="text-[24px] font-['Gilroy-Medium'] text-[#1B1717]">
                    BBPS Services
                </div>
                <div className="mt-[12px] text-[16px] text-[#000000] font-['Gilroy-Regular'] leading-relaxed w-[1083px]">
                    Pay All Your Utility Bills, Insurance Premiums, Loan Repayments And Other Services
                    Through Bharat Bill Payment System (BBPS). Convenient, Secure, And Fast Bill Payments
                    At Your Fingertips.
                </div>

                {/* Tabs */}
                <div className="mt-[28px] inline-flex items-center gap-4 bg-[#FFFFFF] rounded-3xl border border-[#1B1717] border-opacity-50 p-2">
                    <button
                        type="button"
                        onClick={() => setActiveTab("Available")}
                        className={`px-6 py-3 rounded-xl text-[14px] font-['Gilroy-Medium'] transition ${activeTab === "Available"
                                ? "bg-[#039155] text-white shadow-sm"
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                    >
                        Available
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("Subscribed")}
                        className={`px-6 py-3 rounded-xl text-[14px] font-['Gilroy-Medium'] transition ${activeTab === "Subscribed"
                                ? "bg-[#039155] text-white shadow-sm"
                                : "text-[#1B1717] hover:bg-gray-50"
                            }`}
                    >
                        Subscribed
                    </button>
                </div>
            </div>

            {/* Title */}
            <div className="mb-[20px]">
                <div className="text-[24px] font-['Gilroy-Medium'] text-[#1B1717]">
                    BBPS Services
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-[32px] gap-6">
                {filtered.map((s) => (
                    <ServiceCard
                        key={s.id}
                        title={s.title}
                        description={s.description}
                        onClick={() => handleServiceClick(s.id)}
                    />
                ))}
            </div>
        </div>
    );
};

BBPSServices.propTypes = {
    onBack: PropTypes.func,
};

export default BBPSServices;