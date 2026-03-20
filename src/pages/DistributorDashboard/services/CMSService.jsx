import React from 'react';

const CMSService = () => {
    return (
        <div className="min-h-screen bg-[#FAFAFA] p-4 sm:p-6 md:p-8 font-['Gilroy-Regular'] text-[#1B1717]">
            <div className="max-w-7xl mx-auto mb-6">
                <h1 className="text-xl sm:text-2xl font-['Gilroy-Medium'] mb-2">
                    CMS Onboarding
                </h1>
                <p className="text-sm sm:text-base text-[#1B1717]/80">
                    Please Review The Cash Management System Terms Carefully Before Proceeding To Verification
                </p>
            </div>

            <div className="max-w-7xl mx-auto bg-white rounded-[24px] p-8 sm:p-12 md:p-16 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center text-center">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-['Gilroy-Medium'] flex items-center justify-center flex-wrap gap-2 mb-4">
                    Unlock Your
                    <span className="bg-[#FFF000] px-3 py-1 rounded-lg">
                        CMS
                    </span>
                    Capabilities
                </h2>

                <p className="text-sm sm:text-base text-[#1B1717]/80 mb-8">
                    Cash Management System Services For Your Customers
                </p>

                <button className="w-full max-w-md bg-[#039155] text-white font-['Gilroy-Medium'] text-sm sm:text-base py-3.5 rounded-xl hover:bg-[#027A48] transition-colors">
                    Continue
                </button>
            </div>
        </div>
    );
};

export default CMSService;