import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { cmsProcessStatus } from '../../../redux/action/rechargeAction';
import { useNotification } from '../../../context/NotificationContext';

const CMSService = () => {
    const dispatch = useDispatch();
    const { showNotification } = useNotification();
    const [isLoading, setIsLoading] = useState(false);

    const handleContinue = async () => {
        setIsLoading(true);
        try {
            const response = await dispatch(cmsProcessStatus());

            if (response && response.status === 'SUCCESS') {
                const redirectUrl = response?.cmsProcessStatus?.redirectionUrl;

                if (redirectUrl) {
                    window.open(redirectUrl, '_blank');
                } else {
                    showNotification('Could not find redirect link in response.', 'error');
                }
            } else {
                showNotification(response?.message || 'Failed to initialize CMS service.', 'error');
            }
        } catch (error) {
            console.error('CMS API error:', error);
            showNotification('An unexpected error occurred. Please try again later.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

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

                <button 
                    onClick={handleContinue}
                    disabled={isLoading}
                    className={`w-full max-w-md bg-[#039155] text-white font-['Gilroy-Medium'] text-sm sm:text-base py-3.5 rounded-xl transition-colors flex justify-center items-center ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#027A48]'}`}
                >
                    {isLoading ? (
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : null}
                    <span>{isLoading ? 'Processing...' : 'Continue'}</span>
                </button>
            </div>
        </div>
    );
};

export default CMSService;