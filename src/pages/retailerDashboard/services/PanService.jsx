import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { HiArrowLeft } from 'react-icons/hi2';
import { useNotification } from '../../../context/NotificationContext';
import { PanRequest } from '../../../redux/action/fundAction';
import { ButtonLoader } from '../../../widgets/layout/loader';

const PanService = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { showNotification } = useNotification();
    const [mobileNumber, setMobileNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validateMobileNumber = (number) => {
        if (!number) {
            return 'Mobile number is required';
        }
        if (number.length !== 10) {
            return 'Mobile number must be 10 digits';
        }
        if (!/^\d+$/.test(number)) {
            return 'Mobile number must contain only digits';
        }
        return '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate mobile number
        const mobileError = validateMobileNumber(mobileNumber);
        if (mobileError) {
            setErrors({ mobileNumber: mobileError });
            return;
        }

        setErrors({});
        setLoading(true);

        try {
            // Prepare payload
            const payload = {
                action: 'correction',
                mobile_number: mobileNumber,
            };

            // Make API call using PanRequest action
            const response = await dispatch(PanRequest(payload));

            // The API response structure from PanRequest action:
            // response = {
            //   panServiceRequest: {
            //     "status": "FAILURE", // outer status
            //     "message": "...",
            //     "data": {
            //       "status": "Success" or "Failure", // inner status
            //       "url": "...", // if Success
            //       "message": "...", // error message if Failure
            //       "opid": "...", // error message if Failure
            //     }
            //   },
            //   status: "SUCCESS",
            //   message: "..."
            // }

            // Get the panServiceRequest data (which is the API response)
            const apiResponse = response?.panServiceRequest || response;
            
            // Get the inner data object
            const innerData = apiResponse?.data;

            // Check if inner data.status is "Success" (even if outer status is "FAILURE")
            if (innerData?.status === 'Success' && innerData?.url) {
                // Redirect to the URL
                window.location.href = innerData.url;
            } else if (innerData?.status === 'Failure') {
                // Show failure message
                const errorMessage = innerData?.message || innerData?.opid || apiResponse?.message || 'Failed to submit PAN correction request';
                showNotification({
                    type: 'error',
                    message: errorMessage,
                });
            } else {
                // Fallback for other response structures
                const errorMessage = apiResponse?.message || 'Failed to submit PAN correction request';
                showNotification({
                    type: 'error',
                    message: errorMessage,
                });
            }
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to submit PAN correction request';
            showNotification({
                type: 'error',
                message: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/retailerDashboard/services');
    };

    return (
        <div className="w-full py-4 px-3">
            {/* Header with Back Button */}
            <div className="mb-6 flex items-center gap-4">
                <button
                    onClick={handleBack}
                    className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                    aria-label="Go back"
                >
                    <HiArrowLeft className="w-5 h-5 text-[#1B1717]" />
                </button>
                <div>
                    <h1 className="text-2xl font-['Gilroy-Medium'] text-[#1B1717]">
                        PAN Service
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Request PAN correction using mobile number
                    </p>
                </div>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Mobile Number Input */}
                    <div>
                        <label
                            htmlFor="mobileNumber"
                            className="block text-[14px] font-['Gilroy-Medium'] text-[#1B1717] mb-2"
                        >
                            Mobile Number <span className="text-red-400">*</span>
                        </label>
                        <input
                            id="mobileNumber"
                            type="tel"
                            value={mobileNumber}
                            onChange={(e) => {
                                // Remove all non-digit characters and limit to 10 digits
                                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                setMobileNumber(value);
                                if (errors.mobileNumber) {
                                    setErrors({ ...errors, mobileNumber: '' });
                                }
                            }}
                            placeholder="Enter 10-digit mobile number"
                            maxLength={10}
                            className={`w-full px-4 h-[48px] border rounded-lg focus:outline-none transition-colors ${errors.mobileNumber
                                    ? 'border-red-400 focus:border-red-500'
                                    : 'border-[#1B1717] border-opacity-50 focus:border-[#039155]'
                                }`}
                        />
                        {errors.mobileNumber && (
                            <p className="text-red-500 text-xs mt-1">{errors.mobileNumber}</p>
                        )}
                    </div>

                    {/* Action Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                            <span className="font-semibold">Action:</span> Correction
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                            This will submit a PAN correction request for the provided mobile number.
                        </p>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={handleBack}
                            className="flex-1 px-6 py-3 text-[16px] font-['Gilroy-Medium'] text-[#1B1717] border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !mobileNumber}
                            className="flex-1 px-6 py-3 text-[16px] font-['Gilroy-SemiBold'] text-white bg-[#039155] rounded-lg hover:bg-[#027a47] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <ButtonLoader />
                                    <span>Submitting...</span>
                                </>
                            ) : (
                                'Submit Request'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PanService;
