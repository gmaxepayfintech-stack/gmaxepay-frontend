import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaSearch, FaPlus } from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ButtonLoader } from "../../widgets/layout/loader";
import { createEmployee, useList, ResendEmployeeLoginAccess, kycUnlock } from "../../redux/action/whiteLabelAction";
import { useNotification } from "../../context/NotificationContext";

const tableHeaders = [
  "SR No",
  "User Name",
  // "User Role",
  "Mobile Number",
  "Email Id",
  "Active",
  "Lock Status",
  "Date",
  "Login Access"
];

const PAGE_SIZE = 10;

// ── Standalone component (self-contained with local state) ──────────────────
const Employee = ({ embedded = false, tableData = null, isLoading = false }) => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingLocal, setIsLoadingLocal] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const dispatch = useDispatch();
  const { EmployeeAdd, Success, message, whitelabelList, resendAccess } = useSelector((state) => state.whitelabel);
  const { isLoading: loading } = useSelector((state) => state.loading);
  const { success: notifySuccess, error: notifyError } = useNotification();

  // Extract total pages and current data from whitelabelList (API response)
  const apiData = whitelabelList?.whitelabelList?.data || whitelabelList?.whitelabelList || [];
  const totalItems = whitelabelList?.whitelabelList?.totalCount || whitelabelList?.whitelabelList?.total || apiData.length;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE) || 1;

  // Function to fetch employee list
  const fetchEmployees = useCallback(() => {
    const payload = {
      query: { userRole: 6 },
      options: {
        sort: { id: -1 },
        page: currentPage,
        paginate: PAGE_SIZE
      },
      customSearch: searchTerm ? { name: searchTerm } : {}
    };
    dispatch(useList(payload));
  }, [dispatch, currentPage, searchTerm]);

  // Fetch on mount and when dependencies change (only if not embedded with external data)
  useEffect(() => {
    if (!embedded || !tableData) {
      fetchEmployees();
    }
  }, [fetchEmployees, embedded, tableData]);

  const validationSchema = Yup.object().shape({
    userName: Yup.string()
      .required("User Name is required")
      .min(3, "User Name must be at least 3 characters"),
    mobileNumber: Yup.string()
      .required("Mobile Number is required")
      .matches(/^[0-9]{10}$/, "Mobile Number must be 10 digits"),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email Id is required")
      .matches(
        /@gmaxepay\.in$/,
        "Email must end with company mail"
      ),
  });

  const formik = useFormik({
    initialValues: {
      userName: "",
      mobileNumber: "",
      email: "",
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      const payload = {
        name: values.userName,
        email: values.email,
        mobileNo: values.mobileNumber,
      };
      
      dispatch(createEmployee(payload));
    },
  });

  // Watch for success/failure to close modal and notify
  useEffect(() => {
    if (isAddModalOpen) {
      if (Success === "SUCCESS" && EmployeeAdd) {
        notifySuccess({ message: message || "Employee Created Successfully", isCritical: true });
        setIsAddModalOpen(false);
        formik.resetForm();
        fetchEmployees(); // Refresh list after adding
      } else if (Success === "FAILURE") {
        notifyError({ message: message || "Failed to Create Employee", isCritical: true });
      }
    }
  }, [Success, EmployeeAdd, isAddModalOpen, message, fetchEmployees]);

  // Watch for resend access feedback
  useEffect(() => {
    if (resendAccess) {
      if (Success === "SUCCESS") {
        notifySuccess({ message: message || "Login access resent successfully", isCritical: true });
        // Optional: refresh list if needed
      } else if (Success === "FAILURE") {
        notifyError({ message: message || "Failed to resend login access", isCritical: true });
      }
    }
  }, [Success, resendAccess, message]);

  // Handle local loading state for smoother UI
  useEffect(() => {
    if (embedded) {
      setIsLoadingLocal(isLoading);
    } else {
      setIsLoadingLocal(loading);
    }
  }, [loading, isLoading, embedded]);

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

  // Filter logic handled by API, using search locally for immediate feedback if needed
  const currentTableData = embedded && tableData ? tableData : apiData;

  const handleToggle = (id) => {
    // setData((prev) =>
    //   prev.map((row) =>
    //     row.id === id
    //       ? { ...row, status: row.status === "active" ? "inactive" : "active" }
    //       : row
    //   )
    // );
  };

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
            {isLoadingLocal ? (
              <TableBodyLoader colSpan={tableHeaders.length} />
            ) : currentTableData.length === 0 ? (
              <tr>
                <td colSpan={tableHeaders.length} className="py-12 text-center">
                  <p className="text-gray-500 text-lg font-[Gilroy-Medium]">No data available</p>
                </td>
              </tr>
            ) : (
              currentTableData.map((row, index) => {
                const isActive = row.status === "Active" || row.status === "active";
                return (
                  <tr
                    key={row.id}
                    className={`text-sm ${index % 2 === 0 ? "bg-green-50" : "bg-white"}`}
                  >
                    {/* SR No */}
                    <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                      {(currentPage - 1) * PAGE_SIZE + index + 1}
                    </td>

                    {/* User Name */}
                    <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                      {row.name}
                    </td>
                    {/* User Role */}
                    {/* <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                      {row.userRole}
                    </td> */}
                    {/* Mobile Number */}
                    <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                      {row.mobileNo}
                    </td>
                    {/* Email Id */}
                    <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                      {row.email}
                    </td>
                    {/* Active Toggle */}
                    <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                      <button
                        onClick={() => handleToggle(row.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-offset-1 ${isActive ? "bg-green-600" : "bg-gray-300"
                          }`}
                        role="switch"
                        aria-checked={isActive}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? "translate-x-6" : "translate-x-1"
                            }`}
                        />
                      </button>
                    </td>
                    {/* Date */}
                    <td className="px-4 py-4 whitespace-nowrap text-[14px] text-[#121216] font-[Gilroy-Regular]">
                      {row.date ? new Date(row.date).toLocaleDateString() : "N/A"}
                    </td>

                    {/* Lock Status */}
                    <td className="px-4 py-4 whitespace-nowrap font-[Gilroy-Medium] text-[14px]">
                      {(() => {
                        const userId = row.id || row.originalItem?.id;
                        const isLocked =
                          row?.originalItem?.lock === true ||
                          row?.originalItem?.lock === "true";
                        return (
                          <button
                            onClick={() => {
                              if (userId && isLocked) {
                                dispatch(kycUnlock(userId));
                              }
                            }}
                            disabled={!isLocked}
                            className={`px-4 py-2 rounded-lg text-xs font-[Gilroy-Semibold] transition-colors ${isLocked
                              ? "bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                              : "bg-green-500 text-white cursor-not-allowed opacity-75"
                              }`}
                            title={
                              isLocked
                                ? "Click to enable access for this account"
                                : "Account access is enabled"
                            }
                          >
                            {isLocked ? "Enable Access" : "Access Enabled"}
                          </button>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => dispatch(ResendEmployeeLoginAccess(row.id))}
                        className="group flex items-center justify-center gap-2 border border-green-500 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white px-5 py-2.5 rounded-xl font-[Gilroy-Semibold] transition-all duration-300 active:scale-95 text-sm"
                      >
                        <span>Resend</span>
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
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1 || totalPages === 0}
          className={`p-2 border border-gray-300 rounded-lg ${currentPage === 1 || totalPages === 0
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
              className={`w-8 h-8 rounded-lg text-sm font-[Gilroy-Medium] ${page === currentPage
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
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || totalPages === 0}
          className={`p-2 border border-gray-300 rounded-lg ${currentPage === totalPages || totalPages === 0
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
              onClick={() => {
                setIsAddModalOpen(false);
                formik.resetForm();
              }}
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
            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <h3 className="font-[Gilroy-Semibold] text-[#1B1717] text-lg">
                Add Employee
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                <div className="flex flex-col gap-1 w-full">
                  <label className="font-[Gilroy-Medium] text-sm text-[#121216]">
                    Name
                  </label>
                  <input
                    type="text"
                    name="userName"
                    placeholder="Enter User Name"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.userName}
                    className={`w-full border ${formik.touched.userName && formik.errors.userName
                      ? "border-red-500"
                      : "border-[#1B1717]/80"
                      } rounded-lg px-3 py-3 text-sm font-[Gilroy-Medium]`}
                  />
                  {formik.touched.userName && formik.errors.userName && (
                    <span className="text-red-500 text-xs font-[Gilroy-Regular]">
                      {formik.errors.userName}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1 w-full">
                  <label className="font-[Gilroy-Medium] text-sm text-[#121216]">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    name="mobileNumber"
                    placeholder="Enter Mobile Number"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.mobileNumber}
                    className={`w-full border ${formik.touched.mobileNumber && formik.errors.mobileNumber
                      ? "border-red-500"
                      : "border-[#1B1717]/80"
                      } rounded-lg px-3 py-3 text-sm font-[Gilroy-Medium]`}
                  />
                  {formik.touched.mobileNumber && formik.errors.mobileNumber && (
                    <span className="text-red-500 text-xs font-[Gilroy-Regular]">
                      {formik.errors.mobileNumber}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1 w-full">
                  <label className="font-[Gilroy-Medium] text-sm text-[#121216]">
                    Email Id
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter Email Id"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.email}
                    className={`w-full border ${formik.touched.email && formik.errors.email
                      ? "border-red-500"
                      : "border-[#1B1717]/80"
                      } rounded-lg px-3 py-3 text-sm font-[Gilroy-Medium]`}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <span className="text-red-500 text-xs font-[Gilroy-Regular]">
                      {formik.errors.email}
                    </span>
                  )}
                </div>
              </div>

              {/* Footer buttons */}
              <div className="flex justify-between gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    formik.resetForm();
                  }}
                  className="w-1/2 border border-[#1B1717]/80 text-[#1B1717]/80 font-[Gilroy-Medium] rounded-xl py-3 text-sm hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 bg-[#039155] text-white rounded-xl font-[Gilroy-Semibold] py-3 text-sm hover:bg-[#027a46] transition flex items-center justify-center"
                >
                  {loading ? <ButtonLoader size={20} color="white" /> : "Add Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employee;