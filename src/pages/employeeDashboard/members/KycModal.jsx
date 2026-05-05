import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    FaIdCard,
    FaBuilding,
    FaUniversity,
    FaCheckCircle,
} from "react-icons/fa";
import {
    X,
    ZoomIn,
    RotateCcw,
    Info,
    MapPin,
    CreditCard,
    User as UserIcon,
    ShoppingBag,
    Layers
} from "lucide-react";
import { ButtonLoader } from "../../../widgets/layout/loader";
import { kycRevert, employeeKycData } from "../../../redux/action/whiteLabelAction";

const KycModal = ({
    isOpen,
    onClose,
    userId,
    onRevertSuccess,
    refreshKey = 0
}) => {
    const dispatch = useDispatch();
    const kycModalRef = useRef(null);
    
    // Internal UI State
    const [activeTab, setActiveTab] = useState("overview");
    const [zoomedImage, setZoomedImage] = useState(null);
    const [showRevertConfirm, setShowRevertConfirm] = useState(false);
    const [revertPayload, setRevertPayload] = useState(null);
    const [isReverting, setIsReverting] = useState(false);

    // Get KYC details from Redux state
    const kycDetailsState = useSelector((state) => state?.whitelabel?.kycDetails);
    const kycRevertResponse = useSelector((state) => state?.whitelabel?.kycRevert);
    
    const rawKycData = kycDetailsState?.data || null;
    const loading = kycDetailsState?.loading || false;

    // Fetch data when modal opens or userId/refreshKey changes
    useEffect(() => {
        if (isOpen && userId) {
            dispatch(employeeKycData(userId));
        }
    }, [isOpen, userId, refreshKey, dispatch]);

    // Handle revert success
    useEffect(() => {
        if (kycRevertResponse?.status === "SUCCESS" && isReverting) {
            setIsReverting(false);
            setShowRevertConfirm(false);
            setRevertPayload(null);
            if (onRevertSuccess) onRevertSuccess();
            // Re-fetch data after revert
            dispatch(employeeKycData(userId));
        } else if (kycRevertResponse?.status === "FAILURE" || kycRevertResponse?.status === "Error") {
            setIsReverting(false);
        }
    }, [kycRevertResponse, isReverting, userId, onRevertSuccess, dispatch]);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setActiveTab("overview");
            setZoomedImage(null);
            setShowRevertConfirm(false);
            setRevertPayload(null);
            setIsReverting(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // Data normalization
    const data = rawKycData?.data?.userDetails ? rawKycData.data : 
                 (rawKycData?.userDetails ? rawKycData : 
                 (rawKycData?.data || rawKycData || {}));
    
    const user = data.userDetails || {};
    
    // Validate if retrieved data matches requested userId
    const possibleResponseIds = [
        user.userId, user.id, user._id, user.userCode,
        data.userId, data.id, data.userCode
    ].map(id => String(id || "").toLowerCase().trim()).filter(id => id !== "");

    const requestedIdLower = String(userId || "").toLowerCase().trim();
    const isMatch = requestedIdLower && possibleResponseIds.includes(requestedIdLower);
    const effectiveKycData = isMatch ? data : null;
    
    const outlet = data.outletDetails || {};
    const bank = data.customerBankDetails || {};
    const aadhaar = data.aadhaarDoc || {};
    const pan = data.panDoc || {};

    const primaryColor = "#039155";
    const primaryBg = "bg-[#039155]";
    const primaryText = "text-[#039155]";
    const primaryLight = "bg-emerald-50";
    const primaryBorder = "border-emerald-100";

    return (
        <>
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[110] animate-fadeIn p-4 font-[Gilroy]">
                <div
                    ref={kycModalRef}
                    className="bg-white rounded-[24px] shadow-[0_20px_50px_rgba(3,145,85,0.1)] w-full max-w-5xl max-h-[92vh] overflow-hidden animate-slideUp flex flex-col border border-slate-100 relative"
                >
                    {/* Professional Header */}
                    <div className="relative z-10 flex items-center justify-between p-6 border-b border-slate-100 bg-white">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl ${primaryBg} flex items-center justify-center text-white shadow-lg shadow-emerald-200/50`}>
                                <FaIdCard className="text-lg" />
                            </div>
                            <div>
                                <h2 className="text-xl font-[Gilroy-Bold] text-slate-900">
                                    KYC Verification Portal
                                </h2>
                                <div className="flex items-center gap-3 mt-0.5">
                                    <p className="text-xs font-[Gilroy-Medium] text-slate-500 uppercase tracking-wider">User ID: {user.userId || user.userCode || data.userId || selectedUserId || 'N/A'}</p>
                                    <div className="w-1 h-1 bg-slate-200 rounded-full" />
                                    <div className="flex items-center gap-1">
                                        <Layers className="w-3 h-3 text-slate-400" />
                                        <span className="text-[10px] font-[Gilroy-Bold] text-slate-500">{data.completedSteps || 0}/{data.totalSteps || 7} Steps</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 mr-12">
                                <UserIcon className={`w-4 h-4 ${primaryText}`} />
                                <span className="text-sm font-[Gilroy-Bold] text-slate-900">{user.name || 'User'}</span>
                            </div>
                            <button
                                onClick={handleClose}
                                className={`absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-xl ${primaryBg} hover:opacity-90 transition shadow-lg shadow-emerald-200/50`}
                            >
                                <X className="w-6 h-6 text-white rounded-full border-[2.5px] border-white p-0.5" />
                            </button>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="relative z-10 px-6 bg-white border-b border-slate-100">
                        <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
                            {[
                                { id: 'overview', label: 'Overview' },
                                { id: 'aadhar', label: 'Aadhaar' },
                                { id: 'pan', label: 'PAN Card' },
                                { id: 'outlet', label: 'Outlet/Shop' },
                                { id: 'bank', label: 'Bank Details' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-[Gilroy-Bold] transition-all whitespace-nowrap ${activeTab === tab.id
                                            ? `${primaryBg} text-white shadow-md shadow-emerald-200/50`
                                            : "text-slate-500 hover:bg-emerald-50 hover:text-[#039155]"
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 scrollbar-hide relative z-10">
                        {(() => {
                            const hasFailed = kycStatus === "FAILED" || kycStatus === "ERROR" || kycStatus === "FAILURE";
                            const showLoader = loading || (selectedUserId && !effectiveKycData && !hasFailed);

                            if (showLoader) {
                                return (
                                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                                        <ButtonLoader size={40} color={primaryColor} />
                                        <p className="text-slate-500 font-[Gilroy-Medium]">Syncing documents...</p>
                                    </div>
                                );
                            }

                            if (effectiveKycData) {
                                return (
                                    <div className="max-w-4xl mx-auto space-y-6">

                                        {/* Overview Tab */}
                                        {activeTab === "overview" && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                                    <h4 className="text-[10px] font-[Gilroy-Bold] text-slate-400 uppercase tracking-[2px] mb-6">Profile Overview</h4>
                                                    <div className="space-y-4">
                                                        {[
                                                            { label: 'Full Name', value: user.name },
                                                            { label: 'Mobile No', value: user.mobileNo },
                                                            { label: 'Email Address', value: user.email },
                                                            { label: 'KYC Status', value: data.kycStatus, isBadge: true }
                                                        ].map((item, i) => (
                                                            <div key={i} className="flex justify-between items-center py-1.5">
                                                                <span className="text-slate-500 text-sm font-[Gilroy-Medium]">{item.label}</span>
                                                                {item.isBadge ? (
                                                                    <div className={`px-4 py-1.5 rounded-full text-xs font-[Gilroy-Bold] border ${
                                                                        (user.kycStatus === 'verified' || user.kycStatus === 'FULL_KYC' || data.completedSteps === 7)
                                                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                                                            : user.kycStatus === 'rejected'
                                                                            ? 'bg-rose-50 text-rose-600 border-rose-100'
                                                                            : 'bg-amber-50 text-amber-600 border-amber-100'
                                                                    }`}>
                                                                        {data.completedSteps === 7 || user.kycStatus === 'FULL_KYC' || user.kycStatus === 'verified' ? 'COMPLETED' : (user.kycStatus?.toUpperCase() || 'PENDING')}
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-slate-900 text-sm font-[Gilroy-Bold]">{item.value || 'N/A'}</span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                                    <h4 className="text-[10px] font-[Gilroy-Bold] text-slate-400 uppercase tracking-[2px] mb-6">Document Check</h4>
                                                    <div className="space-y-3">
                                                        {[
                                                            { label: 'Aadhaar Verification', status: user.aadharVerify },
                                                            { label: 'PAN Verification', status: user.panVerify },
                                                            { label: 'Bank Verification', status: user.bankDetailsVerify },
                                                            { label: 'Shop Verification', status: user.shopDetailsVerify }
                                                        ].map((step, i) => (
                                                            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                                                                <span className="text-slate-900 text-sm font-[Gilroy-Bold]">{step.label}</span>
                                                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-[Gilroy-Bold] uppercase tracking-wider ${step.status ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                                                    }`}>
                                                                    {step.status ? 'Verified' : 'Pending'}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Aadhaar Tab */}
                                        {activeTab === "aadhar" && (
                                            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 ${primaryLight} rounded-xl flex items-center justify-center ${primaryText} border ${primaryBorder}`}>
                                                            <FaIdCard className="text-lg" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-[Gilroy-Bold] text-slate-900">Aadhaar Data</h3>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-[10px] text-slate-500 font-[Gilroy-Bold] uppercase tracking-wider">UID: {aadhaar.uid || 'Not Masked'}</span>
                                                                <div className="w-1 h-1 bg-slate-200 rounded-full" />
                                                                <span className="text-[10px] text-slate-500 font-[Gilroy-Bold] uppercase tracking-wider">DOB: {aadhaar.dob || 'N/A'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            setRevertPayload({ step: 'Aadhaar', aadhar: true });
                                                            setShowRevertConfirm(true);
                                                        }}
                                                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-[Gilroy-Bold] text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-all"
                                                    >
                                                        <RotateCcw className="w-3.5 h-3.5" />
                                                        Revert
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {[
                                                        { label: 'Front Document', image: user.aadharFrontImage },
                                                        { label: 'Back Document', image: user.aadharBackImage }
                                                    ].map((doc, i) => (
                                                        <div key={i} className="space-y-3">
                                                            <p className="text-[10px] font-[Gilroy-Bold] text-slate-400 uppercase tracking-[2px]">{doc.label}</p>
                                                            {doc.image ? (
                                                                <div className="relative group overflow-hidden rounded-2xl border border-slate-100 aspect-[1.6/1] bg-slate-50">
                                                                    <img src={doc.image} alt={doc.label} className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-all duration-500" onClick={() => setZoomedImage(doc.image)} />
                                                                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                                                                        <div className="bg-white p-3 rounded-full shadow-2xl scale-75 group-hover:scale-100 transition-transform">
                                                                            <ZoomIn className={`${primaryText} w-5 h-5`} />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="aspect-[1.6/1] rounded-2xl bg-slate-50 flex items-center justify-center border-2 border-dashed border-slate-200 text-slate-400 text-xs font-[Gilroy-Bold]">No Image Found</div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* PAN Tab */}
                                        {activeTab === "pan" && (
                                            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 ${primaryLight} rounded-xl flex items-center justify-center ${primaryText} border ${primaryBorder}`}>
                                                            <FaBuilding className="text-lg" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-[Gilroy-Bold] text-slate-900">PAN Data</h3>
                                                            <p className="text-[10px] text-slate-500 font-[Gilroy-Bold] uppercase tracking-wider mt-1">Verification Status: {pan.status || 'Unknown'}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            setRevertPayload({ step: 'PAN', pan: true });
                                                            setShowRevertConfirm(true);
                                                        }}
                                                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-[Gilroy-Bold] text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-all"
                                                    >
                                                        <RotateCcw className="w-3.5 h-3.5" />
                                                        Revert
                                                    </button>
                                                </div>

                                                <div className="space-y-6">
                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                                        {[
                                                            { label: 'PAN Number', value: pan.panNumber },
                                                            { label: 'Name on Card', value: pan.panName },
                                                            { label: 'Date of Birth', value: pan.panDob }
                                                        ].map((info, i) => (
                                                            <div key={i}>
                                                                <p className="text-[10px] text-slate-500 font-[Gilroy-Bold] uppercase mb-1 tracking-wider">{info.label}</p>
                                                                <p className="text-sm text-slate-900 font-[Gilroy-Bold]">{info.value || 'N/A'}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {[
                                                            { label: 'Front Card View', image: user.panCardFrontImage },
                                                            { label: 'Back Card View', image: user.panCardBackImage }
                                                        ].map((doc, i) => (
                                                            <div key={i} className="space-y-3">
                                                                <p className="text-[10px] font-[Gilroy-Bold] text-slate-400 uppercase tracking-[2px]">{doc.label}</p>
                                                                {doc.image ? (
                                                                    <div className="relative group overflow-hidden rounded-2xl border border-slate-100 aspect-[1.6/1] bg-slate-50">
                                                                        <img src={doc.image} alt="PAN" className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-all duration-500" onClick={() => setZoomedImage(doc.image)} />
                                                                        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                                                                            <div className="bg-white p-3 rounded-full shadow-2xl scale-75 group-hover:scale-100 transition-transform">
                                                                                <ZoomIn className={`${primaryText} w-5 h-5`} />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="aspect-[1.6/1] rounded-2xl bg-slate-50 flex items-center justify-center border-2 border-dashed border-slate-200 text-slate-400 text-xs font-[Gilroy-Bold]">No Image Found</div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Outlet Tab */}
                                        {activeTab === "outlet" && (
                                            <div className="space-y-6">
                                                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                                                    <div className="flex items-center justify-between mb-8">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-10 h-10 ${primaryLight} rounded-xl flex items-center justify-center ${primaryText} border ${primaryBorder}`}>
                                                                <ShoppingBag className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-lg font-[Gilroy-Bold] text-slate-900">Outlet Information</h3>
                                                                <p className="text-[10px] text-slate-500 font-[Gilroy-Bold] uppercase tracking-wider mt-1">Category: {outlet.shopCategory || 'General'}</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                setRevertPayload({ step: 'Shop', shop: true });
                                                                setShowRevertConfirm(true);
                                                            }}
                                                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-[Gilroy-Bold] text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-all"
                                                        >
                                                            <RotateCcw className="w-3.5 h-3.5" />
                                                            Revert
                                                        </button>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                                        {[
                                                            { label: 'Shop Business Name', value: outlet.shopName, icon: ShoppingBag },
                                                            { label: 'Full Physical Address', value: outlet.shopAddress, icon: MapPin },
                                                            { label: 'GST Identification', value: outlet.gstNo, icon: Info },
                                                            { label: 'Postal Code', value: outlet.zipCode, icon: MapPin },
                                                        ].map((info, i) => (
                                                            <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 border border-slate-100 shrink-0">
                                                                    {React.createElement(info.icon, { className: "w-5 h-5" })}
                                                                </div>
                                                                <div className="overflow-hidden">
                                                                    <p className="text-[10px] text-slate-500 font-[Gilroy-Bold] uppercase tracking-wider mb-0.5">{info.label}</p>
                                                                    <p className="text-sm text-slate-900 font-[Gilroy-Bold] leading-tight">{info.value || 'N/A'}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="space-y-4">
                                                        <p className="text-[10px] font-[Gilroy-Bold] text-slate-400 uppercase tracking-[2px]">Retailer & Outlet Documentation</p>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            {[
                                                                { label: 'Profile Photograph', image: user.profileImage },
                                                                { label: 'Outlet Front View', image: outlet.shopImage }
                                                            ].map((doc, i) => (
                                                                <div key={i} className="relative group overflow-hidden rounded-2xl border border-slate-100 aspect-[1.4/1] bg-slate-50 shadow-inner">
                                                                    {doc.image ? (
                                                                        <>
                                                                            <img src={doc.image} alt="Outlet" className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-all duration-500" onClick={() => setZoomedImage(doc.image)} />
                                                                            <div className="absolute top-3 left-3 bg-white/90 px-3 py-1 rounded-lg text-[10px] font-[Gilroy-Bold] text-slate-900 shadow-sm border border-slate-100">{doc.label}</div>
                                                                            <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                                                                                <div className="bg-white p-3 rounded-full shadow-2xl scale-75 group-hover:scale-100 transition-transform">
                                                                                    <ZoomIn className={`${primaryText} w-5 h-5`} />
                                                                                </div>
                                                                            </div>
                                                                        </>
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-[Gilroy-Bold]">{doc.label} Missing</div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Bank Tab */}
                                        {activeTab === "bank" && (
                                            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 ${primaryLight} rounded-xl flex items-center justify-center ${primaryText} border ${primaryBorder}`}>
                                                            <FaUniversity className="text-lg" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-[Gilroy-Bold] text-slate-900">Settlement Account</h3>
                                                            <p className="text-[10px] text-slate-500 font-[Gilroy-Bold] uppercase tracking-wider mt-1">Beneficiary: {bank.beneficiaryName || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            setRevertPayload({ step: 'Bank', bank: true });
                                                            setShowRevertConfirm(true);
                                                        }}
                                                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-[Gilroy-Bold] text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-all"
                                                    >
                                                        <RotateCcw className="w-3.5 h-3.5" />
                                                        Revert
                                                    </button>
                                                </div>

                                                {bank.accountNumber ? (
                                                    <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 relative overflow-hidden group">
                                                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                                                            <FaUniversity className={`w-32 h-32 rotate-12 ${primaryText}`} />
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                                                            {[
                                                                { label: 'Bank Name', value: bank.bankName, icon: FaUniversity },
                                                                { label: 'Account Holder', value: bank.beneficiaryName, icon: UserIcon },
                                                                { label: 'Account Number', value: bank.accountNumber, icon: CreditCard },
                                                                { label: 'IFSC Identifier', value: bank.ifsc, icon: Info },
                                                                { label: 'Branch Location', value: bank.branch, icon: MapPin },
                                                                { label: 'Settlement Status', value: 'Active', icon: FaCheckCircle, isStatus: true }
                                                            ].map((info, idx) => (
                                                                <div key={idx} className="space-y-1">
                                                                    <p className="text-[10px] text-slate-500 font-[Gilroy-Bold] uppercase tracking-wider">{info.label}</p>
                                                                    {info.isStatus ? (
                                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-[Gilroy-Bold] bg-[#039155] text-white uppercase tracking-widest shadow-sm">
                                                                            {info.value}
                                                                        </span>
                                                                    ) : (
                                                                        <p className="text-base text-slate-900 font-[Gilroy-Bold] tracking-tight">{info.value || 'N/A'}</p>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-sm font-[Gilroy-Bold]">Bank details not submitted</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            }

                            return (
                                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                                    <p className="text-slate-400 font-[Gilroy-Bold]">Retrieval failed or no data</p>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </div>

            {/* Integrated Revert Confirmation Modal - Professional & Simple */}
            {showRevertConfirm && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center z-[120] animate-fadeIn p-4 overflow-y-auto font-[Gilroy]">
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative overflow-hidden animate-slideUp border border-slate-100"
                    >
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center text-rose-600">
                                    <RotateCcw className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-[Gilroy-Bold] text-slate-900">
                                    Revert {revertPayload?.step}?
                                </h3>
                            </div>

                            <p className="text-sm text-slate-500 font-[Gilroy-Medium] mb-6 leading-relaxed">
                                The user will be required to re-upload their <span className="text-slate-900 font-bold">{revertPayload?.step}</span> documents. This will reset the current verification status.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowRevertConfirm(false);
                                        setRevertPayload(null);
                                    }}
                                    disabled={isReverting}
                                    className="flex-1 py-2.5 text-xs font-[Gilroy-Bold] text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (selectedUserId && revertPayload) {
                                            setIsReverting(true);
                                            const { step, ...apiPayload } = revertPayload;
                                            const actionToDispatch = revertAction || kycRevert;
                                            dispatch(actionToDispatch(selectedUserId, apiPayload));
                                        }
                                    }}
                                    disabled={isReverting}
                                    className={`flex-1 py-2.5 ${primaryBg} text-white rounded-lg hover:opacity-90 transition-all font-[Gilroy-Bold] text-xs flex items-center justify-center shadow-lg shadow-emerald-200/50`}
                                >
                                    {isReverting ? <ButtonLoader size={16} color="#ffffff" thickness={2} /> : "Confirm Revert"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Integrated Unified Confirmation Modal */}
            {confirmModal?.show && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center z-[130] animate-fadeIn p-4 overflow-y-auto font-[Gilroy]">
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-[400px] overflow-hidden animate-slideUp border border-slate-100"
                    >
                        <div className="p-6">
                            <div className="flex items-start gap-4 mb-6">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${confirmModal.type === 'danger' ? 'bg-rose-50 text-rose-600' :
                                        confirmModal.type === 'success' ? 'bg-emerald-50 text-[#039155]' :
                                            'bg-emerald-50 text-[#039155]'
                                    }`}>
                                    {confirmModal.type === 'danger' ? <RotateCcw className="w-6 h-6" /> :
                                        confirmModal.type === 'success' ? <FaCheckCircle className="w-6 h-6" /> :
                                            <Info className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-1">
                                        {confirmModal.title}
                                    </h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">
                                        {confirmModal.message}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    onClick={() => setConfirmModal({ ...confirmModal, show: false })}
                                    disabled={confirmModal.isProcessing}
                                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {confirmModal.cancelText || 'Cancel'}
                                </button>
                                <button
                                    onClick={confirmModal.onConfirm}
                                    disabled={confirmModal.isProcessing}
                                    className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 flex items-center gap-2 ${confirmModal.type === 'danger' ? 'bg-rose-600 hover:bg-rose-700' :
                                            confirmModal.type === 'success' ? 'bg-[#039155] hover:opacity-90 shadow-emerald-200/50' :
                                                'bg-[#039155] hover:opacity-90 shadow-emerald-200/50'
                                        }`}
                                >
                                    {confirmModal.isProcessing && <ButtonLoader size={14} color="#ffffff" thickness={2} />}
                                    {confirmModal.confirmText || 'Continue'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Integrated Image Zoom */}
            {zoomedImage && (
                <div
                    className="fixed inset-0 bg-slate-950/98 backdrop-blur-xl flex items-center justify-center z-[130] animate-fadeIn p-4 cursor-zoom-out"
                    onClick={() => setZoomedImage(null)}
                >
                    <div className="relative max-w-full max-h-full flex items-center justify-center">
                        <button
                            onClick={() => setZoomedImage(null)}
                            className="absolute -top-14 right-0 text-white hover:opacity-80 transition-colors p-3 bg-white/10 rounded-full border border-white/20"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <img
                            src={zoomedImage}
                            alt="Zoomed Document"
                            className="max-w-[95vw] max-h-[90vh] object-contain rounded-xl shadow-[0_0_100px_rgba(3,145,85,0.3)] border border-white/10 cursor-default"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default KycModal;