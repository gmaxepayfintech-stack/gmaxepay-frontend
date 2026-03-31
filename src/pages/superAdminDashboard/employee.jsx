import React, { useState, useEffect } from "react";
import { FaSearch, FaUpload, FaPlus } from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { X } from "lucide-react";
import { ButtonLoader } from "../../widgets/layout/loader";

const tableHeaders = [
  "SR No",
  "Date",
  "User Name",
  "User Role",
  "Mobile Number",
  "Email Id",
  "Active",
];

// ── Dummy data ──────────────────────────────────────────────────────────────
const DUMMY_DATA = [
  { id: 1,  date: "13-10-25", name: "Ruchi Sharma",    userRole: "Customer Support", mobileNo: "9355547710", emailId: "ruchi.sharma@company.in",    status: "active"   },
  { id: 2,  date: "13-10-25", name: "Arjun Mehta",     userRole: "Admin",            mobileNo: "9812345678", emailId: "arjun.mehta@company.in",     status: "active"   },
  { id: 3,  date: "12-10-25", name: "Priya Nair",      userRole: "Sales Executive",  mobileNo: "9701234567", emailId: "priya.nair@company.in",      status: "inactive" },
  { id: 4,  date: "12-10-25", name: "Karan Joshi",     userRole: "Customer Support", mobileNo: "9645678901", emailId: "karan.joshi@company.in",     status: "active"   },
  { id: 5,  date: "11-10-25", name: "Sneha Iyer",      userRole: "HR Manager",       mobileNo: "9534567890", emailId: "sneha.iyer@company.in",      status: "active"   },
  { id: 6,  date: "11-10-25", name: "Rohan Gupta",     userRole: "Finance Analyst",  mobileNo: "9423456789", emailId: "rohan.gupta@company.in",     status: "inactive" },
  { id: 7,  date: "10-10-25", name: "Ananya Singh",    userRole: "Customer Support", mobileNo: "9312345678", emailId: "ananya.singh@company.in",    status: "active"   },
  { id: 8,  date: "10-10-25", name: "Vikram Patel",    userRole: "Team Lead",        mobileNo: "9201234567", emailId: "vikram.patel@company.in",    status: "active"   },
  { id: 9,  date: "09-10-25", name: "Deepika Rao",     userRole: "Sales Executive",  mobileNo: "9098765432", emailId: "deepika.rao@company.in",     status: "inactive" },
  { id: 10, date: "09-10-25", name: "Amit Verma",      userRole: "Admin",            mobileNo: "8987654321", emailId: "amit.verma@company.in",      status: "active"   },
  { id: 11, date: "08-10-25", name: "Neha Kulkarni",   userRole: "HR Manager",       mobileNo: "8876543210", emailId: "neha.kulkarni@company.in",   status: "active"   },
  { id: 12, date: "08-10-25", name: "Siddharth Bose",  userRole: "Finance Analyst",  mobileNo: "8765432109", emailId: "siddharth.bose@company.in",  status: "active"   },
  { id: 13, date: "07-10-25", name: "Pooja Desai",     userRole: "Customer Support", mobileNo: "8654321098", emailId: "pooja.desai@company.in",     status: "inactive" },
  { id: 14, date: "07-10-25", name: "Rahul Tiwari",    userRole: "Team Lead",        mobileNo: "8543210987", emailId: "rahul.tiwari@company.in",    status: "active"   },
  { id: 15, date: "06-10-25", name: "Meera Pillai",    userRole: "Sales Executive",  mobileNo: "8432109876", emailId: "meera.pillai@company.in",    status: "active"   },
  { id: 16, date: "06-10-25", name: "Suresh Nanda",    userRole: "Admin",            mobileNo: "8321098765", emailId: "suresh.nanda@company.in",    status: "inactive" },
  { id: 17, date: "05-10-25", name: "Kavya Reddy",     userRole: "Customer Support", mobileNo: "8210987654", emailId: "kavya.reddy@company.in",     status: "active"   },
  { id: 18, date: "05-10-25", name: "Manish Chauhan",  userRole: "HR Manager",       mobileNo: "8109876543", emailId: "manish.chauhan@company.in",  status: "active"   },
  { id: 19, date: "04-10-25", name: "Divya Shetty",    userRole: "Finance Analyst",  mobileNo: "7998765432", emailId: "divya.shetty@company.in",    status: "active"   },
  { id: 20, date: "04-10-25", name: "Nikhil Aggarwal", userRole: "Team Lead",        mobileNo: "7887654321", emailId: "nikhil.aggarwal@company.in", status: "inactive" },
];

const PAGE_SIZE = 10;

// ── Standalone component (self-contained with local state) ──────────────────
const Employee = () => {
  const [fromDate, setFromDate]       = useState("");
  const [toDate, setToDate]           = useState("");
  const [searchTerm, setSearchTerm]   = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData]               = useState(DUMMY_DATA);
  const [isLoading, setIsLoading]     = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Simulate loading data
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Loader component for table body
  const TableBodyLoader = ({ colSpan }) => (
    <tr>
      <td colSpan={colSpan} className="relative h-[100px] ">
        <div className="flex flex-col items-center pt-8">
          <ButtonLoader size={28} thickness={3} />
        </div>
      </td>
    </tr>
  );

  // Filter logic
  const filtered = data.filter((row) => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      !term ||
      row.name.toLowerCase().includes(term) ||
      row.mobileNo.includes(term) ||
      row.emailId.toLowerCase().includes(term) ||
      row.userRole.toLowerCase().includes(term);

    return matchSearch;
  });

  const totalPages       = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage         = Math.min(currentPage, totalPages);
  const currentTableData = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleToggle = (id) => {
    setData((prev) =>
      prev.map((row) =>
        row.id === id
          ? { ...row, status: row.status === "active" ? "inactive" : "active" }
          : row
      )
    );
  };

  const handleExportToExcel = () => alert("Export triggered (wire up your handler).");

  return (
    <div className="text-[#1B1717] flex flex-col min-h-[calc(100vh-300px)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4">
        <h2 className="text-xl sm:text-2xl font-normal text-gray-800">
          Employee Lists
        </h2>

        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-end gap-3">
          {/* Date filters */}
          <div className="flex flex-col xs:flex-row gap-3">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => { setFromDate(e.target.value); setCurrentPage(1); }}
              className="pl-3 pr-3 py-3 border border-gray-300 rounded-lg w-full xs:w-32 text-sm focus:ring-green-500 focus:border-green-500 text-center cursor-pointer"
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => { setToDate(e.target.value); setCurrentPage(1); }}
              min={fromDate || undefined}
              className="pl-3 pr-3 py-3 border border-gray-300 rounded-lg w-full xs:w-32 text-sm focus:ring-green-500 focus:border-green-500 text-center cursor-pointer"
            />
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-48">
            <input
              type="text"
              placeholder="Search by Mobile No or Name"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-4 pr-10 py-3 border border-gray-300 rounded-xl w-full text-sm focus:ring-green-500 focus:border-green-500"
            />
            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
          </div>

          {/* Action buttons */}
          <div className="flex flex-row gap-3 w-full sm:w-auto">
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-[#039155] text-white px-4 py-3 rounded-lg font-[Gilroy-Medium] hover:bg-green-700 shadow-md text-sm sm:text-base"
            >
              <span>Create Employee</span>
              <div className="w-5 h-5 rounded-full border border-white flex items-center justify-center">
                <FaPlus className="text-[10px]" />
              </div>
            </button>
            <button
              onClick={handleExportToExcel}
              className="flex items-center justify-center gap-2 bg-[#039155] text-white px-4 py-3 rounded-lg font-[Gilroy-Medium] hover:bg-green-700 shadow-md text-sm sm:text-base"
            >
              Export
              <FaUpload className="text-xs" />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 mb-4 overflow-x-auto rounded-3xl bg-white [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <table className="min-w-[640px] sm:min-w-full divide-y">
          <thead className="bg-white text-center">
            <tr>
              {tableHeaders.map((header) => (
                <th
                  key={header}
                  className="px-3 py-4 font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white divide-y font-normal text-center divide-gray-100">
            {isLoading ? (
              <TableBodyLoader colSpan={tableHeaders.length} />
            ) : currentTableData.length === 0 ? (
              <tr>
                <td colSpan={tableHeaders.length} className="py-12 text-center">
                  <p className="text-gray-500 text-lg font-[Gilroy-Medium]">No data available</p>
                </td>
              </tr>
            ) : (
              currentTableData.map((row, index) => {
                const isActive = row.status === "active";
                return (
                  <tr
                    key={row.id}
                    className={`text-sm ${index % 2 === 0 ? "bg-green-50" : "bg-white"}`}
                  >
                    {/* SR No */}
                    <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                      {(safePage - 1) * PAGE_SIZE + index + 1}
                    </td>
                    {/* Date */}
                    <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                      {row.date}
                    </td>
                    {/* User Name */}
                    <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                      {row.name}
                    </td>
                    {/* User Role */}
                    <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                      {row.userRole}
                    </td>
                    {/* Mobile Number */}
                    <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                      {row.mobileNo}
                    </td>
                    {/* Email Id */}
                    <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                      {row.emailId}
                    </td>
                    {/* Active Toggle */}
                    <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                      <button
                        onClick={() => handleToggle(row.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-offset-1 ${
                          isActive ? "bg-green-600" : "bg-gray-300"
                        }`}
                        role="switch"
                        aria-checked={isActive}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            isActive ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center mt-auto pt-6 pb-4 space-x-2">
        <button
          onClick={() => setCurrentPage(Math.max(1, safePage - 1))}
          disabled={safePage === 1 || totalPages === 0}
          className={`p-2 border border-gray-300 rounded-lg ${
            safePage === 1 || totalPages === 0
              ? "text-gray-400 cursor-not-allowed bg-gray-100"
              : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          <IoIosArrowBack />
        </button>

        {totalPages > 0 ? (
          Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded-lg text-sm font-[Gilroy-Medium] ${
                page === safePage
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
              }`}
            >
              {page}
            </button>
          ))
        ) : (
          <span className="w-8 h-8 rounded-lg text-sm font-[Gilroy-Medium] flex items-center justify-center text-gray-500">
            0
          </span>
        )}

        <button
          onClick={() => setCurrentPage(Math.min(totalPages, safePage + 1))}
          disabled={safePage === totalPages || totalPages === 0}
          className={`p-2 border border-gray-300 rounded-lg ${
            safePage === totalPages || totalPages === 0
              ? "text-gray-400 cursor-not-allowed bg-gray-100"
              : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          <IoIosArrowForward />
        </button>
      </div>

      {/* Add New Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#D9D9D9CC]">
          <div className="bg-white w-[498px] rounded-3xl p-6 relative">
            {/* Close button */}
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-xl bg-[#039155] hover:opacity-90 transition"
            >
              <span className="w-6 h-6 flex items-center justify-center rounded-full border-2 border-white text-white text-sm font-[Gilroy-Semibold] leading-none pb-[1px]">
                ✕
              </span>
            </button>

            {/* Title */}
            <h2 className="text-2xl font-[Gilroy-Medium] text-[#1B1717] text-center mt-2">
              Add New Employee
            </h2>
            <p className="text-base text-[#1B1717]/80 font-[Gilroy-Regular] text-center mb-6">
              Create A New Employee
            </p>

            {/* Form */}
            <div className="space-y-4">
              <h3 className="font-[Gilroy-Semibold] text-[#1B1717] text-lg">
                Add Employee
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                <div className="flex flex-col gap-1 w-full">
                  <label className="font-[Gilroy-Medium] text-sm text-[#121216]">
                    User Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter User Name"
                    className="w-full border border-[#1B1717]/80 rounded-lg px-3 py-3 text-sm font-[Gilroy-Medium]"
                  />
                </div>

                <div className="flex flex-col gap-1 w-full">
                  <label className="font-[Gilroy-Medium] text-sm text-[#121216]">
                    User Role
                  </label>
                  <input
                    type="text"
                    placeholder="Enter User Role"
                    className="w-full border border-[#1B1717]/80 rounded-lg px-3 py-3 text-sm font-[Gilroy-Medium]"
                  />
                </div>

                <div className="flex flex-col gap-1 w-full">
                  <label className="font-[Gilroy-Medium] text-sm text-[#121216]">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Mobile Number"
                    className="w-full border border-[#1B1717]/80 rounded-lg px-3 py-3 text-sm font-[Gilroy-Medium]"
                  />
                </div>

                <div className="flex flex-col gap-1 w-full">
                  <label className="font-[Gilroy-Medium] text-sm text-[#121216]">
                    Email Id
                  </label>
                  <input
                    type="email"
                    placeholder="Enter Email Id"
                    className="w-full border border-[#1B1717]/80 rounded-lg px-3 py-3 text-sm font-[Gilroy-Medium]"
                  />
                </div>

                {/* Active Toggle */}
                <div className="flex flex-col gap-1 w-full">
                  <label className="font-[Gilroy-Medium] text-sm text-[#121216]">
                    Active
                  </label>
                  <div className="border border-[#1B1717]/80 py-[9px] px-3 rounded-lg flex justify-between items-center h-full min-h-[46px]">
                    <div className="flex flex-col justify-center">
                      <p className="text-xs font-[Gilroy-Medium] text-[#1B1717] leading-tight mt-0.5">
                        Active
                      </p>
                      <span className="text-[10px] text-[#1B1717]/80 font-[Gilroy-Medium] leading-tight">
                        Activate This Operator
                      </span>
                    </div>
                    <button className="w-10 h-5 rounded-full p-1 transition-colors bg-[#039155] flex-shrink-0">
                      <div className="w-3 h-3 bg-white rounded-full transition-transform translate-x-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex justify-between gap-3 mt-8">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-1/2 border border-[#1B1717]/80 text-[#1B1717]/80 font-[Gilroy-Medium] rounded-xl py-3 text-sm hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button className="w-1/2 bg-[#039155] text-white rounded-xl font-[Gilroy-Semibold] py-3 text-sm hover:bg-[#027a46] transition">
                Add Employee
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employee;