import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Check, Plus } from 'lucide-react';
import { HiOutlineArrowNarrowLeft } from 'react-icons/hi';

const EditMembership = ({ scheme, onBack }) => {
    const [schemeName, setSchemeName] = useState(scheme?.name || '');
    const [schemeMode, setSchemeMode] = useState('Global');
    const [schemeType, setSchemeType] = useState('Free');

    // Sample commission data - matching image exactly
    const [commissions, setCommissions] = useState([
        { id: 1, operator: 'BSNL', operatorType: 'Percent', myDeal: '3.74', entMargin: '0.74', whitelabel: '3' },
        { id: 2, operator: 'BSNL', operatorType: 'Percent', myDeal: '3.74', entMargin: '0.74', whitelabel: '3' },
        { id: 3, operator: 'BSNL', operatorType: 'Percent', myDeal: '3.74', entMargin: '0.74', whitelabel: '3' },
        { id: 4, operator: 'BSNL', operatorType: 'Percent', myDeal: '3.74', entMargin: '0.74', whitelabel: '3' },
        { id: 5, operator: 'BSNL', operatorType: 'Percent', myDeal: '3.74', entMargin: '0.74', whitelabel: '3' },
        { id: 6, operator: 'BSNL', operatorType: 'Percent', myDeal: '3.74', entMargin: '0.74', whitelabel: '3' },
        { id: 7, operator: 'BSNL', operatorType: 'Percent', myDeal: '3.74', entMargin: '0.74', whitelabel: '3' },
    ]);

    const handleCommissionChange = (id, field, value) => {
        setCommissions(commissions.map(comm =>
            comm.id === id ? { ...comm, [field]: value } : comm
        ));
    };

  return (
        <div className="min-h-screen p-3 sm:p-4 md:p-6 text-[#1B1717]">
            {/* Header Section */}
            <div className="mb-4 sm:mb-6">
                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <button
                        onClick={onBack}
                        className="flex items-center text-[#1B1717] hover:text-[#039155] transition"
                    >
                        <div className="rounded-full p-1.5 bg-[#FFFFFF] border border-[#1B1717] transition">
                            <HiOutlineArrowNarrowLeft className="text-2xl text-[#1B1717] opacity-80" />
                        </div>
                    </button>
                    <h1 className="text-[24px] sm:text-2xl md:text-3xl font-['Gilroy-Medium'] text-[#000000]">
                        Edit Membership Scheme
                    </h1>
                </div>
                <p className="text-[16px] ml-14 font-['Gilroy-Regular'] text-[#000000]">
                    Configure Your Membership Settings And Commissions
                </p>
            </div>

            {/* Scheme Settings Section */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm mb-4 sm:mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
                    {/* Scheme Name - Left */}
                    <div>
                        <label className="block text-xs sm:text-[10px] font-medium text-[#1B1717] mb-2">
                            Scheme Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Enter Scheme Name"
                            value={schemeName}
                            onChange={(e) => setSchemeName(e.target.value)}
                            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] focus:border-[#039155] text-[10px] sm:text-base"
                        />
                    </div>

                    {/* Empty column for spacing */}
                    <div></div>

                    {/* Scheme Mode - Right */}
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-[#1B1717] mb-2">
                            Scheme Mode
                        </label>
                        <label className="flex items-start gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg cursor-pointer transition-all bg-white hover:border-gray-400">
                            <div className="relative mt-0.5 flex-shrink-0">
                                <input
                                    type="radio"
                                    name="schemeMode"
                                    value="Global"
                                    checked={schemeMode === 'Global'}
                                    onChange={(e) => setSchemeMode(e.target.value)}
                                    className="sr-only"
                                />
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${schemeMode === 'Global'
                                        ? 'border-[#039155] bg-[#039155]'
                                        : 'border-gray-300 bg-white'
                                    }`}>
                                    {schemeMode === 'Global' && (
                                        <div className="w-2 h-2 rounded-full bg-white"></div>
                                    )}
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <span className="text-xs sm:text-sm font-medium block text-[#1B1717]">
                                    Global
                                </span>
                                <p className="text-xs h-[15px] w-[222px]] text-gray-600 mt-0.5 leading-relaxed">
                                    Available To All Users Worldwide
                                </p>
                            </div>
                        </label>
                    </div>

                    {/* Scheme Type - Right */}
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-[#1B1717] mb-2">
                            Scheme Type
                        </label>
                        <label className="flex items-start gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg cursor-pointer transition-all bg-white hover:border-gray-400">
                            <div className="relative mt-0.5   flex-shrink-0">
                                <input
                                    type="radio"
                                    name="schemeType"
                                    value="Free"
                                    checked={schemeType === 'Free'}
                                    onChange={(e) => setSchemeType(e.target.value)}
                                    className="sr-only"
                                />
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${schemeType === 'Free'
                                        ? 'border-[#039155] bg-[#039155]'
                                        : 'border-gray-300 bg-white'
                                    }`}>
                                    {schemeType === 'Free' && (
                                        <div className="w-2 h-2 rounded-full bg-white"></div>
                                    )}
                                </div>
                            </div>
                            <div className="flex-1 h-[34px] min-w-0">
                                <span className="text-xs sm:text-sm font-medium block text-[#1B1717]">
                                    Free
                                </span>
                                <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                                    No Cost Membership
                                </p>
                            </div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Mobile And DTH Recharge Commissions Section */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
                <div className='rounded-xl bg-[#FAFAFA] p-4'>
                {/* Section Header */}
                <div className="flex items-center justify-between mb-4 bg-[#FFFFFF] rounded-xl p-6 sm:mb-6">
                    <div className='gap-[12px]'>
                        <h2 className="text-[16px] sm:text-xl md:text-2xl font-['Gilroy-SemiBold'] text-[#1B1717] mb-1">
                            Mobile And DTH Recharge
                        </h2>
                        <p className="text-[16px] sm:text-base font-['Gilroy-Regular'] text-[#1B1717]">
                            Commissions
                        </p>
                    </div>
                </div>

                {/* Commissions Table */}
                <div className="mb-4 sm:mb-6">
                    {/* Table Header as Card */}
                    <div className="bg-[#FFFFFF] rounded-xl border border-gray-200 h-[41px] mb-3">
                        <div className="overflow-x-auto">
                            <div className="min-w-[800px] grid grid-cols-6 gap-4 px-4 py-3">
                                <div className="text-left text-[14px] font-medium text-[#1B1717]">
                                    Operator
                                </div>
                                <div className="text-left text-[14px] font-medium text-[#1B1717]">
                                    Operator Type
                                </div>
                                <div className="text-left text-[14px] font-medium text-[#1B1717]">
                                    My Deal
                                </div>
                                <div className="text-left text-[14px] font-medium text-[#1B1717]">
                                    ENT Margin
                                </div>
                                <div className="text-left text-[14px] font-medium text-[#1B1717]">
                                    Whitelabel
                                </div>
                                <div className="text-center text-[14px] font-medium text-[#1B1717]">
                                    Actions
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table Body */}
                    <div className="bg-white rounded-xl overflow-x-auto">
                        <div className="min-w-[800px]">
                            {commissions.map((commission, index) => (
                                <div
                                    key={commission.id || index}
                                    className="grid grid-cols-6 gap-4 px-4 py-3 border-b border-gray-200 bg-white hover:bg-gray-50"
                                >
                                    <div className="flex items-center">
                                        <span className="text-[10px] font-medium text-[#1B1717]">
                                            {commission.operator}
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="inline-flex items-center px-2 py-2 rounded-full text-xs font-medium bg-[#4F7EF4] text-[#FFFFFF]">
                                            {commission.operatorType}
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-[10px] text-[#1B1717]">
                                            {commission.myDeal}
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="text"
                                            value={commission.entMargin || ''}
                                            onChange={(e) => handleCommissionChange(commission.id, 'entMargin', e.target.value)}
                                            className="w-20 px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] focus:border-[#039155] text-[10px] bg-white"
                                        />
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="text"
                                            value={commission.whitelabel || ''}
                                            onChange={(e) => handleCommissionChange(commission.id, 'whitelabel', e.target.value)}
                                            className="w-20 px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] focus:border-[#039155] text-[10px] bg-white"
                                        />
                                    </div>
                                    <div className="flex items-center justify-center">
                                        <div className="w-6 h-6 bg-[#039155] rounded border border-gray-300 flex items-center justify-center">
                                            <Check className="w-4 h-4 text-white" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Add New Operator Button */}
                    <div className="flex justify-center mt-4">
                        <button className="flex items-center gap-2 bg-[#039155] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium hover:bg-green-700 transition shadow-md">
                            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                                <Plus className="w-3 h-3 text-[#039155]" />
                            </div>
                            <span>Add New Operator</span>
                        </button>
                    </div>
                </div>
                </div>
            </div>
        </div>
    );
};

EditMembership.propTypes = {
    scheme: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        name: PropTypes.string,
        schemeId: PropTypes.string,
        created: PropTypes.string,
        members: PropTypes.string,
        tags: PropTypes.arrayOf(PropTypes.shape({
            label: PropTypes.string,
            color: PropTypes.string,
        })),
    }),
    onBack: PropTypes.func.isRequired,
};

EditMembership.defaultProps = {
    scheme: null,
};

export default EditMembership;
