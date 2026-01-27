import React, { useEffect, useMemo, useState } from "react";
import { FaSearch, FaUpload } from "react-icons/fa";
import { User, Sparkles } from "lucide-react";
import * as XLSX from "xlsx";
import { useDispatch, useSelector } from "react-redux";
import { roleDataCompanyUser, roleUpgradeCompanyUser } from "../../redux/action/roleAction";

import DistributorList from "./DistributorList";
import MasterDistributerList from "./MasterDistributerList";
import RetailerList from "./RetailerList";

const CreateCompanyUser = () => {
  const dispatch = useDispatch();
  const [activeNav, setActiveNav] = useState("Master Distributor");
  const [statusFilter, setStatusFilter] = useState("Completed"); 
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState(() => new Date().toISOString().split("T")[0]);

  const [exportRows, setExportRows] = useState([]);

  // Upgrade modal (same flow as RoleUpgradeWhiteLabel)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState("User Details");
  const [requestedRoleError, setRequestedRoleError] = useState("");

  const requestedRoleOptions = [
    { id: 3, label: "Master Distributor" },
    { id: 4, label: "Distributor" },
    { id: 5, label: "Retailer" },
  ];

  const tabs = ["User Details", "Role Information", "Status And Actions"];

  const normalizeRequestedRoleId = (value) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "number") return String(value);
    const raw = String(value).trim();
    if (!raw) return "";
    if (/^\\d+$/.test(raw)) return raw;
    const upper = raw.toUpperCase();
    if (upper === "MD") return "3";
    if (upper === "DI" || upper === "D") return "4";
    if (upper === "RE" || upper === "R") return "5";
    const lower = raw.toLowerCase();
    if (lower.includes("master")) return "3";
    if (lower.includes("retailer")) return "5";
    if (lower.includes("distributor")) return "4";
    return "";
  };

  const [formData, setFormData] = useState({
    parentName: "",
    userName: "",
    mobileNumber: "",
    emailId: "",
    currentRole: "",
    requestedRole: "",
  });

  const getUserRoleFromNav = (nav) => {
    if (nav === "Master Distributor") return 3;
    if (nav === "Distributor") return 4;
    return 5; // Retailers
  };

  const getKycStatusFromStatusFilter = (filter) => {
    // Backend expects these values (same mapping idea as RoleUpgradeWhiteLabel)
    if (filter === "Pending") return "pending";
    return "completed";
  };

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Get data from Redux (same shape as RoleUpgradeWhiteLabel)
  const roleDataResponse = useSelector((state) => {
    const roleState = state?.roles || state?.role;
    return roleState?.roleDataComp?.roleDataComp;
  });

  const isLoading = useSelector((state) => {
    const roleState = state?.roles || state?.role;
    return roleState?.isLoading || false;
  });

  // Fetch list when nav/filter/search changes
  useEffect(() => {
    const payload = {
      query: {
        userRole: getUserRoleFromNav(activeNav),
        kycStatus: getKycStatusFromStatusFilter(statusFilter),
      },
      options: {
        sort: { id: -1 },
        page: 1,
        paginate: 10,
      },
      customSearch: debouncedSearchTerm.trim()
        ? {
            name: debouncedSearchTerm.trim(),
            mobileNo: debouncedSearchTerm.trim(),
          }
        : {},
    };

    console.log("=== roleDataCompanyUser (CreateCompanyUser) ===");
    console.log("Active Nav:", activeNav);
    console.log("Status Filter:", statusFilter);
    console.log("Payload:", payload);

    dispatch(roleDataCompanyUser(payload));
  }, [activeNav, statusFilter, debouncedSearchTerm, dispatch]);

  const roleDataComp = Array.isArray(roleDataResponse) ? roleDataResponse : [];

  const roleDataList = useMemo(() => {
    if (!Array.isArray(roleDataComp) || roleDataComp.length === 0) return [];

    const allUsers = [];
    roleDataComp.forEach((company) => {
      if (company?.users && Array.isArray(company.users)) {
        allUsers.push(...company.users);
      }
    });
    return allUsers;
  }, [roleDataComp]);

  const tableData = useMemo(() => {
    if (!Array.isArray(roleDataList) || roleDataList.length === 0) return [];

    const roleMap = {
      DI: "Distributor",
      RE: "Retailer",
      MD: "Master Distributor",
      EN: "Enterprise",
      D: "Distributor",
      R: "Retailer",
    };

    return roleDataList.map((user, index) => {
      const rawDate = user.date || user.createdAt || null;
      let formattedDate = "-";
      if (rawDate) {
        try {
          const dateObj = new Date(rawDate);
          const day = String(dateObj.getDate()).padStart(2, "0");
          const month = String(dateObj.getMonth() + 1).padStart(2, "0");
          const year = String(dateObj.getFullYear()).slice(-2);
          formattedDate = `${day}-${month}-${year}`;
        } catch {
          formattedDate = "-";
        }
      }

      return {
        id: user.id || user._id || `row-${index}`,
        srNo: String(index + 1).padStart(2, "0"),
        rawDate,
        date: formattedDate,
        parentName: user.parentName || user.company || "-",
        userName: user.name || "-",
        mobileNumber: user.mobileNo || "-",
        emailId: user.email || "-",
        currentRole: roleMap[user.userRole] || user.userRole || "-",
        upgradeRole: user.upgradeRole || user.requestedRole || "-",
        userId: user.userId || "-",
        parentRole: user.parentRole || "-",
        company: user.company || "-",
        companyId: user.companyId || "-",
        kycStatus: user.kycStatus || "-",
        kycSteps: user.kycSteps || "-",
        status: user.status || "-",
        lock: user.lock || false,
        wallet: user.wallet || { mainWallet: 0, apesWallet: 0 },
        fullUserData: user,
      };
    });
  }, [roleDataList]);

  const filteredTableData = useMemo(() => {
    // Apply date filter only when user sets fromDate
    if (!fromDate) return tableData;

    const start = new Date(fromDate);
    const end = toDate ? new Date(toDate) : null;
    if (end) end.setHours(23, 59, 59, 999);

    return tableData.filter((row) => {
      if (!row.rawDate) return true;
      const d = new Date(row.rawDate);
      if (Number.isNaN(d.getTime())) return true;
      if (end) return d >= start && d <= end;
      return d >= start;
    });
  }, [tableData, fromDate, toDate]);

  useEffect(() => {
    // Default export uses what is currently visible in table
    setExportRows(
      filteredTableData.map((r) => ({
        "SR No": r.srNo,
        Date: r.date,
        "Parent Name": r.parentName,
        "User Name": r.userName,
        "Mobile Number": r.mobileNumber,
        "Email Id": r.emailId,
        "Current Role": r.currentRole,
        "Upgrade Role": r.upgradeRole,
        "User ID": r.userId,
        "Parent Role": r.parentRole,
        Company: r.company,
        "Company ID": r.companyId,
        "KYC Status": r.kycStatus,
        "KYC Steps": r.kycSteps,
        Status: r.status,
        Lock: r.lock ? "Yes" : "No",
        "Main Wallet": r.wallet?.mainWallet ?? 0,
        "Apes Wallet": r.wallet?.apesWallet ?? 0,
      }))
    );
  }, [filteredTableData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "requestedRole") setRequestedRoleError("");
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setActiveTab("User Details");
    setRequestedRoleError("");
    setFormData({
      parentName: "",
      userName: "",
      mobileNumber: "",
      emailId: "",
      currentRole: "",
      requestedRole: "",
    });
  };

  const handleUpgradeClick = (row) => {
    const user = row?.fullUserData || row;

    const roleMap = {
      DI: "Distributor",
      D: "Distributor",
      RE: "Retailer",
      R: "Retailer",
      MD: "Master Distributor",
      EN: "Enterprise",
    };

    setSelectedUser(user);
    setFormData({
      parentName: user?.parentName || row?.parentName || "",
      userName: user?.name || row?.userName || "",
      mobileNumber: user?.mobileNo || row?.mobileNumber || "",
      emailId: user?.email || row?.emailId || "",
      currentRole: roleMap[user?.userRole] || row?.currentRole || user?.userRole || "",
      requestedRole: normalizeRequestedRoleId(user?.upgradeRole || user?.requestedRole || row?.upgradeRole),
    });
    setIsModalOpen(true);
    setActiveTab("User Details");
  };

  const getActiveTabIndex = () => Math.max(0, tabs.indexOf(activeTab));

  const handleBackStep = () => {
    const idx = getActiveTabIndex();
    if (idx === 0) {
      handleCloseModal();
      return;
    }
    setActiveTab(tabs[idx - 1]);
  };

  const handleNextStep = () => {
    const idx = getActiveTabIndex();
    if (activeTab === "Role Information" && !formData.requestedRole) {
      setRequestedRoleError("Requested Role is required");
      return;
    }
    if (idx >= tabs.length - 1) return;
    setActiveTab(tabs[idx + 1]);
  };

  const handleApproveRequest = async () => {
    const userId = selectedUser?.id;
    const targetRole = Number(formData.requestedRole);

    if (!userId) {
      console.warn("Approve blocked: selectedUser.id not found", selectedUser);
      return;
    }

    if (!formData.requestedRole) {
      setActiveTab("Role Information");
      setRequestedRoleError("Requested Role is required");
      console.warn("Approve blocked: Requested Role not selected");
      return;
    }

    if (Number.isNaN(targetRole)) {
      console.warn("Approve blocked: targetRole is not a number", formData.requestedRole);
      return;
    }

    const payload = { userId, targetRole };
    console.log("=== Approve Request -> roleUpgradeCompanyUser (CreateCompanyUser) ===");
    console.log("Payload:", payload);

    try {
      const response = await dispatch(roleUpgradeCompanyUser(payload));
      console.log("=== roleUpgradeCompanyUser response (CreateCompanyUser) ===");
      console.log(response);
      handleCloseModal();
    } catch (error) {
      console.log("=== roleUpgradeCompanyUser error (CreateCompanyUser) ===");
      console.error(error);
    }
  };

  const handleExportToExcel = () => {
    if (!exportRows || exportRows.length === 0) {
      alert("No data available to export");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${activeNav} - ${statusFilter}`);
    XLSX.writeFile(
      workbook,
      `${activeNav}_${statusFilter}_Export_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  const commonListProps = useMemo(
    () => ({
      statusFilter,
      fromDate,
      toDate,
      searchTerm: debouncedSearchTerm,
      tableData: filteredTableData,
      isLoading,
      onUpgradeClick: handleUpgradeClick,
    }),
    [statusFilter, fromDate, toDate, debouncedSearchTerm, filteredTableData, isLoading]
  );

  const renderContent = () => {
    if (activeNav === "Master Distributor") return <MasterDistributerList {...commonListProps} />;
    if (activeNav === "Distributor") return <DistributorList {...commonListProps} />;
    return <RetailerList {...commonListProps} />;
  };

  return (
    <div className="text-[#1B1717] w-full h-full overflow-hidden">
      <div className="w-full h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Header Navigation */}
        <div className="w-full p-0 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-sm px-4 py-3 sm:px-6 sm:py-4 flex justify-center w-full">
            <nav className="flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-11 lg:gap-x-[184px] gap-y-3 text-gray-600 font-medium text-xs sm:text-sm lg:text-base">
              <button
                type="button"
                onClick={() => setActiveNav("Master Distributor")}
                className={`px-3 sm:px-4 py-1.5 rounded-xl font-medium text-sm sm:text-base lg:text-lg ${
                  activeNav === "Master Distributor"
                    ? "bg-[#039155] text-white"
                    : "text-gray-600 hover:text-green-600"
                }`}
              >
                Master Distributor
              </button>
              <button
                type="button"
                onClick={() => setActiveNav("Distributor")}
                className={`px-3 sm:px-4 py-1.5 rounded-xl font-medium text-sm sm:text-base lg:text-lg ${
                  activeNav === "Distributor"
                    ? "bg-[#039155] text-white"
                    : "text-gray-600 hover:text-green-600"
                }`}
              >
                Distributor
              </button>
              <button
                type="button"
                onClick={() => setActiveNav("Retailers")}
                className={`px-3 sm:px-4 py-1.5 rounded-xl font-medium text-sm sm:text-base lg:text-lg ${
                  activeNav === "Retailers"
                    ? "bg-[#039155] text-white"
                    : "text-gray-600 hover:text-green-600"
                }`}
              >
                Retailers
              </button>
            </nav>
          </div>
        </div>

        {/* Completed / Pending + Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-3">
            {["Completed", "Pending"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-2xl font-medium shadow-md text-sm sm:text-base ${
                  statusFilter === s
                    ? "bg-[#039155] text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-end gap-3">
            <div className="flex flex-col xs:flex-row gap-3">
              <div className="relative">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="pl-3 pr-3 py-3 border border-gray-300 rounded-lg w-full xs:w-32 text-sm focus:ring-green-500 focus:border-green-500 text-center cursor-pointer"
                />
              </div>

              <div className="relative">
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  min={fromDate || undefined}
                  className="pl-3 pr-3 py-3 border border-gray-300 rounded-lg w-full xs:w-32 text-sm focus:ring-green-500 focus:border-green-500 text-center cursor-pointer"
                />
              </div>
            </div>

            <div className="relative w-full sm:w-56">
              <input
                type="text"
                placeholder="Search by Mobile No or Name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-4 pr-10 py-3 border border-gray-300 rounded-xl w-full text-sm focus:ring-green-500 focus:border-green-500"
              />
              <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
            </div>

            <button
              type="button"
              onClick={handleExportToExcel}
              className="flex items-center justify-center bg-white text-gray-700 border border-gray-300 px-4 py-3 rounded-lg font-medium hover:bg-gray-100 text-sm sm:text-base"
            >
              Export <FaUpload className="ml-2 text-xs" />
            </button>
          </div>
        </div>

        {/* List Content */}
        {renderContent()}

        {/* Upgrade Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full h-[80vh] max-h-[80vh] flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex-1 text-center">
                  <h2 className="text-[24px] font-['Gilroy-Medium'] text-[#000000]">Edit Role Request</h2>
                  {selectedUser?.id && (
                    <p className="text-[16px] font-['Gilroy-Regular'] text-[#1B1717] text-opacity-80 mt-[12px]">
                      Request ID: #{selectedUser.id}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-10 h-10 rounded-xl bg-[#039155] text-white flex items-center justify-center hover:bg-[#027a45] transition"
                >
                  <span className="border-[#FFFFFF] border-2 rounded-3xl px-2 py-1 leading-none">×</span>
                </button>
              </div>

              {/* Tabs (display only) */}
              <div className="px-6 py-4">
                <div className="flex gap-4 rounded-lg border-2 border-[#1B1717] border-opacity-50 p-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      disabled
                      className={`px-2 py-3 font-['Gilroy-SemiBold'] text-[16px] transition flex-1 rounded-xl ${
                        activeTab === tab ? "bg-[#039155] text-white" : "bg-transparent text-[#1B1717] text-opacity-80"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6 flex-1 overflow-y-auto">
                {activeTab === "User Details" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[14px] font-['Gilroy-Medium'] text-[#000000] mb-2">Parent Name</label>
                      <div className="w-full text-[12px] font-['Gilroy-Medium'] text-[#1B1717] text-opacity-80">
                        {formData.parentName || "-"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1B1717] mb-2">User Name</label>
                      <div className="w-full text-[12px] font-['Gilroy-Medium'] text-[#1B1717] text-opacity-80">
                        {formData.userName || "-"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1B1717] mb-2">Mobile Number</label>
                      <div className="w-full text-[12px] font-['Gilroy-Medium'] text-[#1B1717] text-opacity-80">
                        {formData.mobileNumber || "-"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1B1717] mb-2">Email Id</label>
                      <div className="w-full text-[12px] font-['Gilroy-Medium'] text-[#1B1717] text-opacity-80">
                        {formData.emailId || "-"}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "Role Information" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#1B1717] mb-2">Current Role</label>
                        <input
                          type="text"
                          name="currentRole"
                          value={formData.currentRole}
                          onChange={handleInputChange}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#1B1717] mb-2">Requested Role</label>
                        <select
                          name="requestedRole"
                          value={formData.requestedRole}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-[#039155]"
                        >
                          <option value="">Select Requested Role</option>
                          {requestedRoleOptions.map((opt) => (
                            <option key={opt.id} value={String(opt.id)}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        {requestedRoleError && (
                          <p className="mt-1 text-sm text-red-500 font-medium">{requestedRoleError}</p>
                        )}
                      </div>
                    </div>

                    {/* Role Visualization */}
                    <div className="flex items-center justify-between py-6 px-2 bg-[#FAFAFA] rounded-lg">
                      <div className="flex items-center gap-3 w-[220px]">
                        <User className="w-6 h-6 text-[#039155]" />
                        <span className="font-medium text-[#1B1717] truncate">
                          {formData.currentRole || ''}
                        </span>
                      </div>

                      {/* Center dots - keep centered and slightly right */}
                      <div className="flex-1 flex items-center justify-center">
                        <div className="flex items-center gap-[2px] -translate-x-4">
                          {[...Array(5)].map((_, i) => (
                            <React.Fragment key={i}>
                              <div className="w-3 h-3 bg-[#039155] rounded-full" />
                              {i < 4 && (
                                <div className="w-4 h-[3px] bg-[#039155] opacity-80 rounded-full" />
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3 w-[220px]">
                        <Sparkles className="w-6 h-6 text-[#039155]" />
                        <span className="font-medium text-[#1B1717] inline-block w-48 truncate">
                          {requestedRoleOptions.find((opt) => String(opt.id) === String(formData.requestedRole))?.label || ''}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "Status And Actions" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-[#1B1717] mb-4">Quick Actions</h3>
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={handleCloseModal}
                          className="px-6 py-3 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition"
                        >
                          Reject Request
                        </button>
                        <button
                          type="button"
                          onClick={handleApproveRequest}
                          className="px-6 py-3 bg-[#039155] text-white rounded-lg font-medium hover:bg-[#027a45] transition"
                        >
                          Approve Request
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer (Back / Next) */}
              <div className="flex justify-center gap-4 p-6 min-h-[88px] border-t">
                <button
                  type="button"
                  onClick={handleBackStep}
                  className="px-6 py-2 border-2 border-[#1B1717] border-opacity-50 text-[18px] text-[#1B1717] text-opacity-80 rounded-xl font-['Gilroy-Medium'] hover:bg-gray-50 transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={getActiveTabIndex() === tabs.length - 1}
                  className="px-6 py-2 bg-[#039155] text-white rounded-xl font-['Gilroy-Medium'] text-[18px] hover:bg-[#027a45] transition disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:bg-gray-300"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateCompanyUser;
