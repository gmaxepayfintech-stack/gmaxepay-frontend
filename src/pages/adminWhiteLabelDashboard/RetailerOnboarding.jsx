import React, { useState, useRef, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  ChevronLeft,
  ChevronRight,
  User,
  X,
  Upload,
  Search,
} from "lucide-react";
import {
  FaIdCard,
  FaUpload,
  FaCheckCircle,
} from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import * as XLSX from "xlsx";
import {
  kycStatusCheck,
  kycUnlock,
  rescendOnboarding,
  deActiveOnboarding,
  getCompanyAdmin,
  kycDataCompany,
  kycRevertCompany,
  checkCompanyAepsStatus,
} from "../../redux/action/whiteLabelAction";
import ProfileDetails from "./ProfileDetails";
import { roleDataCompanyUser } from "../../redux/action/roleAction";
import { useNotification } from "../../context/NotificationContext";
import { ButtonLoader } from "../../widgets/layout/loader";
import KycModal from "./KycModal";

const RetailerOnboarding = ({
  embedded = false,
  tableData: propTableData = [],
  activePage,
  onPageChange,
}) => {
  const dispatch = useDispatch();
  const { showNotification } = useNotification();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
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
  const [confirmModal, setConfirmModal] = useState({ show: false });

  const kycModalRef = useRef(null);

  // Revert confirmation state
  const [showRevertConfirm, setShowRevertConfirm] = useState(false);
  const [revertPayload, setRevertPayload] = useState(null);
  const [isReverting, setIsReverting] = useState(false);

  // Redux selectors
  const kycDetailsState = useSelector((state) => state?.whitelabel?.kycDetailsCompany);
  const kycRetrieved = kycDetailsState?.data || null;
  const kycRevertResponse = useSelector((state) => state?.whitelabel?.kycRevertUSer);
  const companyAepsStatus = useSelector((state) => state?.whitelabel?.companyAepsStatus);
  const serverPageCount = useSelector((state) => state?.roles?.roleDataComp?.paginator?.pageCount || 0);
  const totalCountFromRedux = useSelector((state) => {
    const response = state?.roles?.roleDataComp;
    return response?.totalCount || response?.total || 0;
  });

  // Handle AEPS status check notification
  useEffect(() => {
    if (companyAepsStatus?.status === "SUCCESS") {
      showNotification({
        message: companyAepsStatus.message || "AEPS status updated successfully",
        type: "success",
        isCritical: true,
      });
      if (!embedded) {
        dispatch(roleDataCompanyUser({
          query: { userRole: 5 },
          options: { sort: { id: -1 }, page: currentPage, paginate: 6 },
          customSearch: {},
        }));
      }
    } else if (companyAepsStatus?.status === "FAILURE" || companyAepsStatus?.status === "Error") {
      showNotification({
        message: companyAepsStatus.message || "Failed to update AEPS status",
        type: "error",
        isCritical: true,
      });
    }
  }, [companyAepsStatus, currentPage, dispatch, showNotification, embedded]);

  // Standalone data fetcher
  useEffect(() => {
    if (embedded) return;
    const payload = {
      query: {
        userRole: 5, // Retailer
        kycStatus: "pending",
        ...(fromDate && toDate && { startDate: fromDate.replace(/-/g, "/"), endDate: toDate.replace(/-/g, "/") }),
      },
      options: { sort: { id: -1 }, page: currentPage, paginate: 6 },
      customSearch: searchTerm.trim() ? { mobileNo: searchTerm.trim(), name: searchTerm.trim() } : {},
    };
    dispatch(roleDataCompanyUser(payload));
  }, [searchTerm, fromDate, toDate, currentPage, dispatch, embedded]);

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
    XLSX.utils.book_append_sheet(workbook, worksheet, "Retailer Data");
    XLSX.writeFile(workbook, `Retailer_Onboarding_Export_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const TableHeaders = [
    "ID", "User", "User ID", "Name", "User Role", "Mobile No", "Email Id", 
    "Parent Name", "Parent Role", "KYC Status", "KYC Steps", "Main Wallet", 
    "AEPS 1 Status", "AEPS1 Wallet", "AEPS2 Wallet", "Status", "KYC Details", 
    "Action", "Lock Status", "Onboarding", "Deactivation", "Date"
  ];

  if (showProfileDetails) {
    return <ProfileDetails onBack={() => { setShowProfileDetails(false); setSelectedUserRole(null); }} userRole={selectedUserRole} />;
  }

  return (
    <div className={`text-[#1B1717] ${embedded ? "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" : "min-h-screen p-4 sm:p-6"}`}>
      <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h1 className="text-xl sm:text-2xl font-[Gilroy-Medium] text-[#1B1717]">Retailer Onboarding</h1>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search by name/mobile..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="pl-10 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#039155] focus:border-[#039155] bg-slate-50 font-[Gilroy-Medium] w-full" 
              />
            </div>
            <div className="flex items-center gap-2">
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-[#039155] focus:outline-none font-[Gilroy-Medium]" />
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-[#039155] focus:outline-none font-[Gilroy-Medium]" />
            </div>
            <button 
              onClick={handleExportToExcel} 
              className="flex items-center justify-center gap-2 bg-[#039155] text-white px-5 py-2.5 rounded-xl font-[Gilroy-Medium] hover:opacity-90 shadow-lg shadow-emerald-100 transition-all text-sm"
            >
              Export <Upload className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mb-4 overflow-x-auto rounded-2xl border border-slate-100 bg-white scrollbar-hide">
          <table className="min-w-[1200px] sm:min-w-full divide-y divide-slate-100">
            <thead className="bg-[#FFFFFF] border-b border-[#1B1717]/50">
              <tr>
                {TableHeaders.map(h => (
                  <th key={h} className="px-4 py-4 font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap text-center">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-center divide-y divide-slate-50">
              {!tableData || tableData.length === 0 ? (
                <tr><td colSpan={22} className="py-20 text-center text-slate-400 font-[Gilroy-Medium]">No onboarding records found</td></tr>
              ) : (
                tableData.map((row, index) => {
                  const userId = row.id || row.originalItem?.id;
                  const isActive = row.status?.toLowerCase() === "active";
                  const isLocked = row?.originalItem?.lock === true || row?.originalItem?.lock === "true";
                  
                  return (
                    <tr key={index} className={`hover:bg-slate-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}>
                      <td className="py-4 px-4 font-[Gilroy-Regular] text-[14px] text-[#121216]">{row.id || "N/A"}</td>
                      <td className="px-4 py-4 text-center">
                        <button 
                          onClick={() => { if (userId) { dispatch(getCompanyAdmin(userId)); setShowProfileDetails(true); } }} 
                          className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center hover:bg-emerald-100 transition-all border border-emerald-100 shadow-sm group"
                        >
                          <User className="w-5 h-5 text-[#039155] group-hover:scale-110 transition-transform" />
                        </button>
                      </td>
                      <td className="py-4 px-4 font-[Gilroy-Regular] text-[14px] text-[#039155] font-[Gilroy-Medium]">{row.userId || row.userAgentCode || "N/A"}</td>
                      <td className="py-4 px-4 font-[Gilroy-Regular] text-[14px] text-[#121216]">{row.name || row.userName || "N/A"}</td>
                      <td className="py-4 px-4 font-[Gilroy-Regular] text-[14px] text-[#121216]">{row.userRole || "N/A"}</td>
                      <td className="py-4 px-4 font-[Gilroy-Regular] text-[14px] text-[#121216]">{row.mobileNo || row.mobile || "N/A"}</td>
                      <td className="py-4 px-4 font-[Gilroy-Regular] text-[14px] text-[#121216]">{row.emailId || row.email || "N/A"}</td>
                      <td className="py-4 px-4 font-[Gilroy-Regular] text-[14px] text-[#121216]">{row.parentName || "N/A"}</td>
                      <td className="py-4 px-4 font-[Gilroy-Regular] text-[14px] text-[#121216]">{row.parentRole || "N/A"}</td>
                      <td className="py-4 px-4">
                        {(() => {
                          const status = row.kycStatus?.toLowerCase();
                          if (status === "completed" || status === "full_kyc" || row.kycSteps === 7) {
                            return <span className="px-3 py-1 rounded-full text-[10px] font-[Gilroy-Medium] bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wider">COMPLETED</span>;
                          } else if (status === "pending") {
                            return <span className="px-3 py-1 rounded-full text-[10px] font-[Gilroy-Medium] bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-wider">PENDING</span>;
                          } else {
                            return <span className="px-3 py-1 rounded-full text-[10px] font-[Gilroy-Medium] bg-rose-50 text-rose-600 border border-rose-100 uppercase tracking-wider">{row.kycStatus || "PENDING"}</span>;
                          }
                        })()}
                      </td>
                      <td className="py-4 px-4 font-[Gilroy-Regular] text-[14px] text-[#121216]">{row.kycSteps || "0"}/7</td>
                      <td className="py-4 px-4 font-[Gilroy-Regular] text-[14px] text-[#121216]">₹{row.wallet?.mainWallet || "0"}</td>
                      <td className="px-4 py-4 text-center">
                        <button 
                          onClick={() => userId && dispatch(checkCompanyAepsStatus(userId))} 
                          disabled={row.aepsOnboardingStatus === true} 
                          className={`px-3 py-1.5 border rounded-lg text-[10px] font-[Gilroy-Medium] transition-all uppercase tracking-wider ${
                            row.aepsOnboardingStatus === true 
                              ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed" 
                              : "border-emerald-100 text-[#039155] bg-emerald-50 hover:bg-[#039155] hover:text-white"
                          }`}
                        >
                          {row.aepsOnboardingStatus === true ? "Verified" : "Check Status"}
                        </button>
                      </td>
                      <td className="py-4 px-4 font-[Gilroy-Regular] text-[14px] text-[#121216]">₹{row.wallet?.apes1Wallet || "0"}</td>
                      <td className="py-4 px-4 font-[Gilroy-Regular] text-[14px] text-[#121216]">₹{row.wallet?.apes2Wallet || "0"}</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-white text-[10px] font-[Gilroy-Medium] uppercase tracking-wider shadow-sm ${isActive ? "bg-emerald-600" : "bg-rose-600"}`}>{row.status || "Active"}</span>
                      </td>
                      <td className="py-4 px-4">
                        <button 
                          onClick={() => { if (userId) { setSelectedUserId(userId); setIsKycModalLoading(true); dispatch(kycDataCompany(userId)); setShowKycModal(true); } }} 
                          className="px-3 py-1.5 bg-white border border-[#039155] text-[#039155] rounded-lg text-[10px] font-[Gilroy-Medium] uppercase tracking-wider hover:bg-emerald-50 transition-all shadow-sm"
                        >
                          KYC Details
                        </button>
                      </td>
                      <td className="py-4 px-4 text-xs">
                        <button 
                          onClick={() => userId && dispatch(kycStatusCheck(userId, { isActive: String(!isActive) }))} 
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${isActive ? "bg-emerald-600" : "bg-slate-200"}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-md ${isActive ? "translate-x-6" : "translate-x-1"}`} />
                        </button>
                      </td>
                      <td className="py-4 px-4">
                        <button 
                          onClick={() => userId && isLocked && dispatch(kycUnlock(userId))} 
                          disabled={!isLocked} 
                          className={`px-4 py-2 rounded-lg text-[10px] font-[Gilroy-Medium] transition-all uppercase tracking-wider ${
                            isLocked 
                              ? "bg-rose-600 text-white hover:opacity-90 shadow-lg shadow-rose-100" 
                              : "bg-emerald-600 text-white opacity-40 cursor-not-allowed"
                          }`}
                        >
                          {isLocked ? "Unlock" : "Unlocked"}
                        </button>
                      </td>
                      <td className="py-4 px-4">
                        <button 
                          onClick={() => userId && dispatch(rescendOnboarding(userId))} 
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-blue-100 text-blue-600 bg-blue-50 rounded-lg text-[10px] font-[Gilroy-Medium] uppercase tracking-wider hover:bg-blue-600 hover:text-white transition-all"
                        >
                          Resend
                        </button>
                      </td>
                      <td className="py-4 px-4">
                        <button 
                          onClick={() => userId && dispatch(deActiveOnboarding(userId))} 
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-amber-100 text-amber-600 bg-amber-50 rounded-lg text-[10px] font-[Gilroy-Medium] uppercase tracking-wider hover:bg-amber-600 hover:text-white transition-all"
                        >
                          Deactivate
                        </button>
                      </td>
                      <td className="py-4 px-4 font-[Gilroy-Regular] text-[14px] text-[#121216]">{row.date || "N/A"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-center gap-2 mt-8">
          <button 
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))} 
            disabled={currentPage === 1} 
            className="p-2 rounded-xl border border-slate-100 text-slate-400 hover:text-[#039155] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <IoIosArrowBack className="text-xl" />
          </button>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button 
                key={p} 
                onClick={() => handlePageChange(p)} 
                className={`w-10 h-10 rounded-xl font-[Gilroy-Medium] text-sm transition-all ${
                  p === currentPage 
                    ? "bg-[#039155] text-white shadow-lg shadow-emerald-100" 
                    : "bg-white text-[#1B1717] border border-slate-100 hover:bg-slate-50"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button 
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} 
            disabled={currentPage === totalPages} 
            className="p-2 rounded-xl border border-slate-100 text-slate-400 hover:text-[#039155] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <IoIosArrowForward className="text-xl" />
          </button>
        </div>
      </div>

      {/* Shared KYC Modal Component */}
      <KycModal
        isOpen={showKycModal}
        onClose={() => {
          setShowKycModal(false);
          setSelectedUserId(null);
          setActiveTab("overview");
        }}
        kycData={kycRetrieved}
        selectedUserId={selectedUserId}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isLoading={isKycModalLoading}
        kycStatus={kycDetailsState?.status}
        onRevert={(userId, step, payload) => {
          setRevertPayload({ step, ...payload });
          setShowRevertConfirm(true);
        }}
        showRevertConfirm={showRevertConfirm}
        setShowRevertConfirm={setShowRevertConfirm}
        revertPayload={revertPayload}
        setRevertPayload={setRevertPayload}
        isReverting={isReverting}
        setIsReverting={setIsReverting}
        confirmModal={confirmModal}
        setConfirmModal={setConfirmModal}
        dispatch={dispatch}
        kycModalRef={kycModalRef}
        revertAction={kycRevertCompany}
      />
    </div>
  );
};

export default RetailerOnboarding;
