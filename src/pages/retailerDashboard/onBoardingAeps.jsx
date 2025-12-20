import AepsAcceptance from "./AepsAcceptance";
import { useState } from "react";

const OnBoardingAeps = () => {
    const [showAcceptance, setShowAcceptance] = useState(false);

    if (showAcceptance) {
        return <AepsAcceptance />;
    }
    return (
        <div className="w-full">
            {/* Page header */}
            <div className="mb-6">
                <div className="text-[24px] sm:text-[22px] font-['Gilroy-Medium'] text-[#1B1717]">
                    AEPS Onboarding
                </div>
                <div className="mt-2 text-[16px]  text-[#000000] font-['Gilroy-Regular']">
                    Please Review The Aadhaar Enabled Payment System Terms Carefully Before
                    Proceeding To KYC Verification
                </div>
            </div>

            {/* Center card */}
            <div className="bg-[#FFFFFF] rounded-2xl border border-gray-100 shadow-sm px-6 py-10 sm:px-10 sm:py-12">
                <div className="max-full mx-auto text-center">
                    {/* pill */}
                    <div className="inline-flex items-center gap-[30px] bg-[#E5FFF4] rounded-full px-5 py-2">
                        <span className="w-2 h-2 rounded-full bg-[#039155]" />
                        <span className="text-[15px] text-[#000000] font-['Gilroy-Medium']">
                            Onboarding Process
                        </span>
                    </div>

                    <div className="mt-6 text-[24px] sm:text-[24px] font-['Gilroy-Medium'] text-[#1B1717]">
                        Unlock Your AEPS Capabilities
                    </div>

                    <div className="mt-3 text-[16px] text-[#1B1717] font-['Gilroy-Regular'] leading-relaxed">
                        Join The Network Of Secure, Instant Transactions. You Are Just A Few
                        Steps Away From Enabling Aadhaar Payments For Your Customers
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowAcceptance(true)}
                        className="mt-8 flex items-center justify-between bg-[#039155] hover:bg-[#027A47] text-white rounded-lg px-6 py-3 text-[18px] font-['Gilroy-SemiBold'] transition w-full max-w-[420px] mx-auto"
                    >
                        <span>Start Your AEPS Onboarding Process</span>
                        <span className="inline-flex items-center justify-center w-8 h-8">
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                            >
                                <path
                                    d="M5 12h12"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                                <path
                                    d="M13 6l6 6-6 6"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OnBoardingAeps;