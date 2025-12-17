import React, { useEffect, useMemo, useState } from "react";
import { FaSearch, FaUpload } from "react-icons/fa";
import * as XLSX from "xlsx";
import { useDispatch, useSelector } from "react-redux";
import { roleDataCompanyUser } from "../../redux/action/roleAction";

import DistributorList from "./DistributorList";
import MasterDistributerList from "./MasterDistributerList";
import RetailerList from "./RetailerList";

const CreateCompanyUser = () => {
  const dispatch = useDispatch();
  const [activeNav, setActiveNav] = useState("Master Distributor");
  const [statusFilter, setStatusFilter] = useState("Completed"); // Completed | Pending
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState(() => new Date().toISOString().split("T")[0]);

  const [exportRows, setExportRows] = useState([]);

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
      </div>
    </div>
  );
};

export default CreateCompanyUser;
