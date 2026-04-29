import React, { useState, useRef, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  ChevronLeft,
  ChevronRight,
  User,
  X,
  ZoomIn,
} from "lucide-react";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaUser,
  FaIdCard,
  FaBuilding,
  FaExpand,
  FaUpload,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import {
  kycStatusCheck,
  kycUnlock,
  rescendOnboarding,
  deActiveOnboarding,
  getCompanyAdmin,
  kycDataCompany,
  kycRevertCompany,
} from "../../redux/action/whiteLabelAction";
import ProfileDetails from "./ProfileDetails";
import { roleDataCompanyUser } from "../../redux/action/roleAction";
import { useNotification } from "../../context/NotificationContext";
import { ButtonLoader } from "../../widgets/layout/loader";

const MasterDistributionOnboarding = ({
  embedded = false,
  tableData: propTableData = [],
  activePage,
  onPageChange,
}) => {
  const dispatch = useDispatch();
  const { showNotification } = useNotification();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedKyc, setSelectedKyc] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedKycData, setSelectedKycData] = useState(null);
  const [showKycModal, setShowKycModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [zoomedImage, setZoomedImage] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showProfileDetails, setShowProfileDetails] = useState(false);
  const [selectedUserRole, setSelectedUserRole] = useState(null);
  const [isKycModalLoading, setIsKycModalLoading] = useState(false);

  const kycModalRef = useRef(null);

  // Revert confirmation state
  const [showRevertConfirm, setShowRevertConfirm] = useState(false);
  const [revertPayload, setRevertPayload] = useState(null);
  const [isReverting, setIsReverting] = useState(false);

  // Redux selectors
  const kycDetailsState = useSelector((state) => state?.whitelabel?.kycDetailsCompany);
  const kycRetrieved = kycDetailsState?.data || null;
  const kycRevertResponse = useSelector((state) => state?.whitelabel?.kycRevertUSer);
  const serverPageCount = useSelector((state) => state?.roles?.roleDataComp?.paginator?.pageCount || 0);
  const totalCountFromRedux = useSelector((state) => {
    const response = state?.roles?.roleDataComp;
    return response?.totalCount || response?.total || 0;
  });

  // Standalone data fetcher
  useEffect(() => {
    if (embedded) return;
    const payload = {
      query: {
        userRole: 3, // Master Distributor
        ...(selectedKyc && { kycStatus: selectedKyc }),
        ...(fromDate && toDate && { date: { $gte: fromDate, $lte: toDate } }),
      },
      options: { sort: { id: -1 }, page: currentPage, paginate: 6 },
      customSearch: {},
    };
    dispatch(roleDataCompanyUser(payload));
  }, [selectedKyc, fromDate, toDate, currentPage, dispatch, embedded]);

  const allTableData = useMemo(() => {
    if (!Array.isArray(propTableData) || propTableData.length === 0) return [];
    if (propTableData[0]?.users && Array.isArray(propTableData[0].users)) {
      return propTableData.flatMap((company) => company?.users || []);
    }
    return propTableData;
  }, [propTableData]);

  const totalCount = totalCountFromRedux > 0 ? totalCountFromRedux : allTableData.length;
  const totalPages = serverPageCount || (totalCount > 0 ? Math.ceil(totalCount / 6) : 1);
  const tableData = allTableData;

  useEffect(() => {
    if (embedded && activePage !== undefined && activePage !== currentPage) {
      setCurrentPage(activePage);
    }
  }, [embedded, activePage, currentPage]);

  const handlePageChange = (newPage) => {
    if (embedded && onPageChange) {
      onPageChange(newPage);
    } else {
      setCurrentPage(newPage);
    }
  };

  useEffect(() => {
    if (kycRetrieved && showKycModal) {
      try {
        setSelectedKycData(structuredClone(kycRetrieved));
        setIsKycModalLoading(false);
      } catch (error) {
        setSelectedKycData({ ...kycRetrieved });
        setIsKycModalLoading(false);
      }
    }
  }, [kycRetrieved, showKycModal]);

  useEffect(() => {
    if (kycRevertResponse?.status === "SUCCESS" && selectedUserId && showKycModal) {
      setIsReverting(false);
      setShowRevertConfirm(false);
      setRevertPayload(null);
      setSelectedKycData(null);
      setIsKycModalLoading(true);
      const timer = setTimeout(() => {
        dispatch(kycDataCompany(selectedUserId));
      }, 500);
      return () => clearTimeout(timer);
    } else if (kycRevertResponse?.status === "ERROR" || kycRevertResponse?.status === "FAILED") {
      setIsReverting(false);
      setShowRevertConfirm(false);
      setRevertPayload(null);
    }
  }, [kycRevertResponse, selectedUserId, showKycModal, dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (kycModalRef.current && !kycModalRef.current.contains(event.target)) {
        setShowKycModal(false);
        setSelectedKycData(null);
        setSelectedUserId(null);
        setActiveTab("overview");
        setZoomedImage(null);
      }
    };
    if (showKycModal) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showKycModal]);

  const handleExportToExcel = () => {
    if (!allTableData || allTableData.length === 0) {
      alert("No data available to export");
      return;
    }
    const excelData = allTableData.map((row) => ({
      ID: row.id || "N/A",
      Date: row.date || "N/A",
      "User ID": row.userId || row.userAgentCode || "N/A",
      Name: row.name || row.userName || "N/A",
      "User Role": row.userRole || "N/A",
      "Mobile No": row.mobileNo || row.mobile || "N/A",
      "Email Id": row.emailId || row.email || "N/A",
      "Parent Name": row.parentName || "N/A",
      "Parent Role": row.parentRole || "N/A",
      "KYC Status": row.kycStatus || "N/A",
      "KYC Steps": row.kycSteps || "0",
      "Main Wallet": row.wallet?.mainWallet || "0",
      "AEPS1 Wallet": row.wallet?.apes1Wallet || "0",
      "AEPS2 Wallet": row.wallet?.apes2Wallet || "0",
      Status: row.status || "Active",
    }));
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Master Distributor Data");
    XLSX.writeFile(workbook, `Master_Distributor_Export_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const TableHeaders = [
    "ID", "User", "User ID", "Name", "User Role", "Mobile No", "Email Id", 
    "Parent Name", "Parent Role", "KYC Status", "KYC Steps", "Main Wallet", 
    "AEPS1 Wallet", "AEPS2 Wallet", "Status", "KYC Details", 
    "Action", "Lock Status", "Onboarding", "Deactivation", "Date"
  ];

  if (showProfileDetails) {
    return <ProfileDetails onBack={() => { setShowProfileDetails(false); setSelectedUserRole(null); }} userRole={selectedUserRole} />;
  }

  return (
    <div className={`text-[#1B1717] ${embedded ? "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" : "min-h-screen p-4 sm:p-6"}`}>
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-lg sm:text-2xl lg:text-2xl font-[Gilroy-Medium] text-[#1B1717]">Master Distributor Onboarding List</h1>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <select value={selectedKyc} onChange={(e) => setSelectedKyc(e.target.value)} className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155] bg-white">
              <option value="">Select KYC</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white w-full sm:w-auto" />
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white w-full sm:w-auto" />
            <button onClick={handleExportToExcel} className="flex items-center justify-center gap-2 bg-[#039155] text-white px-4 py-2 rounded-lg font-[Gilroy-Medium] hover:bg-green-700 shadow-md text-sm">Export <FaUpload className="text-xs" /></button>
          </div>
        </div>

        <div className="flex-1 mb-4 overflow-x-auto rounded-3xl bg-white [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <table className="min-w-[1200px] sm:min-w-full divide-y">
            <thead className="bg-white">
              <tr>
                {TableHeaders.map(h => <th key={h} className="py-3 px-4 text-sm font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap text-center">{h}</th>)}
              </tr>
            </thead>
            <tbody className="text-center">
              {!tableData || tableData.length === 0 ? (
                <tr><td colSpan={21} className="py-12 text-center text-gray-500 font-[Gilroy-Medium]">No data available</td></tr>
              ) : (
                tableData.map((row, index) => {
                  const userId = row.id || row.originalItem?.id;
                  const isActive = row.status?.toLowerCase() === "active";
                  const isLocked = row?.originalItem?.lock === true || row?.originalItem?.lock === "true";
                  
                  return (
                    <tr key={index} className={`border-b border-gray-100 ${index % 2 === 0 ? "bg-green-50" : "bg-white"}`}>
                      <td className="py-3 px-4 text-xs font-[Gilroy-Regular]">{row.id || "N/A"}</td>
                      <td className="px-4 py-4 text-center">
                        <button onClick={() => { if (userId) { dispatch(getCompanyAdmin(userId)); setShowProfileDetails(true); } }} className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"><User className="w-4 h-4 text-gray-600" /></button>
                      </td>
                      <td className="py-3 px-4 text-xs">{row.userId || row.userAgentCode || "N/A"}</td>
                      <td className="py-3 px-4 text-xs">{row.name || row.userName || "N/A"}</td>
                      <td className="py-3 px-4 text-xs">{row.userRole || "N/A"}</td>
                      <td className="py-3 px-4 text-xs">{row.mobileNo || row.mobile || "N/A"}</td>
                      <td className="py-3 px-4 text-xs">{row.emailId || row.email || "N/A"}</td>
                      <td className="py-3 px-4 text-xs">{row.parentName || "N/A"}</td>
                      <td className="py-3 px-4 text-xs">{row.parentRole || "N/A"}</td>
                      <td className="py-3 px-4 text-xs">
                        <span className={`px-2 py-1 rounded text-[10px] font-[Gilroy-Semibold] ${row.kycStatus?.toLowerCase() === "completed" || row.kycStatus?.toLowerCase() === "full_kyc" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                          {row.kycStatus || "N/A"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs">{row.kycSteps || "0"}</td>
                      <td className="py-3 px-4 text-xs">{row.wallet?.mainWallet || "0"}</td>
                      <td className="py-3 px-4 text-xs">{row.wallet?.apes1Wallet || "0"}</td>
                      <td className="py-3 px-4 text-xs">{row.wallet?.apes2Wallet || "0"}</td>
                      <td className="py-3 px-4 text-xs">
                        <span className={`px-3 py-1 rounded-lg text-white text-[10px] ${isActive ? "bg-green-600" : "bg-red-600"}`}>{row.status || "Active"}</span>
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <button onClick={() => { if (userId) { setSelectedUserId(userId); setIsKycModalLoading(true); dispatch(kycDataCompany(userId)); setShowKycModal(true); } }} className="px-3 py-1 border border-green-500 text-green-600 rounded-lg text-[10px] font-[Gilroy-Medium] hover:bg-green-50">KYC Details</button>
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <button onClick={() => userId && dispatch(kycStatusCheck(userId, { isActive: String(!isActive) }))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? "bg-green-600" : "bg-gray-300"}`}>
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? "translate-x-6" : "translate-x-1"}`} />
                        </button>
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <button onClick={() => userId && isLocked && dispatch(kycUnlock(userId))} disabled={!isLocked} className={`px-4 py-2 rounded-lg text-[10px] font-[Gilroy-Semibold] ${isLocked ? "bg-red-500 text-white hover:bg-red-600" : "bg-green-500 text-white opacity-75 cursor-not-allowed"}`}>
                          {isLocked ? "Enable Access" : "Access Enabled"}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <button onClick={() => userId && dispatch(rescendOnboarding(userId))} className="px-3 py-1 border border-blue-500 text-blue-600 rounded-lg text-[10px] font-[Gilroy-Medium] hover:bg-blue-50">Re-send</button>
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <button onClick={() => userId && dispatch(deActiveOnboarding(userId))} className="px-3 py-1 border border-orange-500 text-orange-600 rounded-lg text-[10px] font-[Gilroy-Medium] hover:bg-orange-50">Send</button>
                      </td>
                      <td className="py-3 px-4 text-xs">{row.date || "N/A"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-center gap-2 mt-6">
          <button onClick={() => handlePageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="p-2 rounded-lg border border-gray-300 disabled:opacity-50"><ChevronLeft className="w-5 h-5" /></button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => handlePageChange(p)} className={`w-10 h-10 rounded-lg font-[Gilroy-Medium] ${p === currentPage ? "bg-[#039155] text-white" : "bg-white border border-gray-300"}`}>{p}</button>
          ))}
          <button onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-gray-300 disabled:opacity-50"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>

      {/* KYC Details Modal */}
      {showKycModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div ref={kycModalRef} className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden animate-slideUp">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center"><FaIdCard className="text-green-600" /></div>
                <h2 className="text-xl font-[Gilroy-Semibold] text-gray-800">KYC Details</h2>
              </div>
              <button onClick={() => { setShowKycModal(false); setSelectedKycData(null); }} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="flex border-b border-gray-200 bg-gray-50 px-6">
              {["overview", "aadhar", "pan", "details", "bankDetails", "verification"].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-3 text-sm font-[Gilroy-Medium] capitalize ${activeTab === tab ? "text-green-600 border-b-2 border-green-600" : "text-gray-600"}`}>{tab.replace(/([A-Z])/g, ' $1')}</button>
              ))}
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-250px)]">
              {isKycModalLoading ? (
                <div className="flex flex-col items-center justify-center py-20"><ButtonLoader color="#039155" size={40} /></div>
              ) : selectedKycData ? (
                <div className="space-y-6 animate-fadeIn">
                  {activeTab === "overview" && (
                    <div className="space-y-6">
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-100 flex justify-between items-center">
                        <h3 className="font-[Gilroy-Semibold]">Status: <span className="text-green-600">{selectedKycData.kycStatus}</span></h3>
                        <div className="text-sm font-[Gilroy-Medium]">{selectedKycData.kycSteps || 0} / 7 Steps</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(selectedKycData.userDetails || {}).map(([k, v]) => (
                          typeof v === 'string' && !v.includes('http') && <div key={k} className="flex flex-col"><span className="text-xs text-gray-500 capitalize">{k.replace(/([A-Z])/g, ' $1')}</span><span className="text-sm font-[Gilroy-Medium]">{v}</span></div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === "aadhar" && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-[Gilroy-Semibold]">Aadhar Info</h3>
                        <button onClick={() => { setRevertPayload({ aadharVerification: "true" }); setShowRevertConfirm(true); }} className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs">Revert</button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <img src={selectedKycData.userDetails?.aadharFrontImage} onClick={() => setZoomedImage(selectedKycData.userDetails?.aadharFrontImage)} className="w-full h-40 object-contain rounded-lg border cursor-pointer" alt="Front" />
                        <img src={selectedKycData.userDetails?.aadharBackImage} onClick={() => setZoomedImage(selectedKycData.userDetails?.aadharBackImage)} className="w-full h-40 object-contain rounded-lg border cursor-pointer" alt="Back" />
                      </div>
                    </div>
                  )}

                  {activeTab === "pan" && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-[Gilroy-Semibold]">PAN Info</h3>
                        <button onClick={() => { setRevertPayload({ panVerification: "true" }); setShowRevertConfirm(true); }} className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs">Revert</button>
                      </div>
                      <img src={selectedKycData.userDetails?.panCardFrontImage} onClick={() => setZoomedImage(selectedKycData.userDetails?.panCardFrontImage)} className="w-full h-40 object-contain rounded-lg border cursor-pointer" alt="PAN" />
                    </div>
                  )}

                  {activeTab === "details" && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-[Gilroy-Semibold]">Shop Info</h3>
                        <button onClick={() => { setRevertPayload({ shopImage: "true" }); setShowRevertConfirm(true); }} className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs">Revert</button>
                      </div>
                      <img src={selectedKycData.outletDetails?.shopImage} onClick={() => setZoomedImage(selectedKycData.outletDetails?.shopImage)} className="w-full h-40 object-contain rounded-lg border cursor-pointer" alt="Shop" />
                    </div>
                  )}

                  {activeTab === "bankDetails" && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-[Gilroy-Semibold]">Bank Info</h3>
                        <button onClick={() => { setRevertPayload({ bankVerification: "true" }); setShowRevertConfirm(true); }} className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs">Revert</button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(selectedKycData.customerBankDetails || {}).map(([k, v]) => (
                          <div key={k} className="flex flex-col"><span className="text-xs text-gray-500 capitalize">{k}</span><span className="text-sm font-[Gilroy-Medium]">{v}</span></div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === "verification" && (
                    <div className="grid grid-cols-2 gap-4">
                      {["mobileVerify", "emailVerify", "aadharVerify", "panVerify", "shopDetailsVerify", "imageVerify", "bankDetailsVerify"].map(key => (
                        <div key={key} className={`flex items-center justify-between p-4 rounded-lg border-2 ${selectedKycData.userDetails?.[key] ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                          <span className="text-sm font-[Gilroy-Medium] capitalize">{key.replace('Verify', '')}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-[Gilroy-Semibold] ${selectedKycData.userDetails?.[key] ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{selectedKycData.userDetails?.[key] ? "Verified" : "Pending"}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : <div className="text-center py-8 text-gray-500">No details available</div>}
            </div>
            <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
              <button onClick={() => setShowKycModal(false)} className="px-6 py-2 bg-green-600 text-white rounded-lg font-[Gilroy-Medium]">Close</button>
            </div>
          </div>
        </div>
      )}

      {showRevertConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 text-center animate-slideUp">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><FaTimesCircle className="text-3xl" /></div>
            <h2 className="text-2xl font-[Gilroy-Semibold] mb-2">Confirm Revert</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to revert this document? This cannot be undone.</p>
            <div className="flex gap-4">
              <button onClick={() => setShowRevertConfirm(false)} disabled={isReverting} className="flex-1 py-3 bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={() => { if (selectedUserId && revertPayload) { setIsReverting(true); dispatch(kycRevertCompany(selectedUserId, revertPayload)); } }} disabled={isReverting} className="flex-1 py-3 bg-red-600 text-white rounded-lg flex items-center justify-center">
                {isReverting ? <ButtonLoader color="#ffffff" size={20} /> : "Confirm Revert"}
              </button>
            </div>
          </div>
        </div>
      )}

      {zoomedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[80] animate-fadeIn" onClick={() => setZoomedImage(null)}>
          <button className="absolute top-4 right-4 text-white"><X className="w-8 h-8" /></button>
          <img src={zoomedImage} className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg" alt="Zoomed" />
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default MasterDistributionOnboarding;
