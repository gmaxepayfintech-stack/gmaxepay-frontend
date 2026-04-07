import { ChevronLeft, ChevronRight, Pencil, Plus, Search } from "lucide-react";
import { FiChevronDown } from "react-icons/fi";
import {
  listEmployeeOperators,
  createEmployeeOperator,
  updateEmployeeOperator,
} from "../../../redux/action/operatorActions";
import { listEmployeeServices } from "../../../redux/action/serviceActions";
import { useState, useEffect } from "react";
import { ButtonLoader } from "../../../widgets/layout/loader";
import { useDispatch, useSelector } from "react-redux";
const OperatorSetting = () => {
  const dispatch = useDispatch();
  const { operatorList, loading: operatorsLoading } = useSelector((state) => state.operators);
  const { serviceList, loading: servicesLoading } = useSelector((state) => state.services);
  
  const isLoading = operatorsLoading || servicesLoading;

  // Extract the arrays safely
  const services = Array.isArray(operatorList?.data) ? operatorList.data : [];
  const serviceData = Array.isArray(serviceList?.data) ? serviceList.data : [];

  const [currentPage, setCurrentPage] = useState(1);
  const [editId, setEditId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("all");
  const [formData, setFormData] = useState({
    operatorName: "",
    operatorCode: "",
    operatorType: "",
    minValue: "",
    maxValue: "",
    comm: "",
    commType: "",
    amtType: "",
    hsnCode: "HSN1234",
    remarks: "",
  });

  useEffect(() => {
    dispatch(
      listEmployeeOperators({
        query: selectedType !== "all" ? { operatorType: selectedType } : {},
        customSearch: searchQuery
          ? { operatorName: searchQuery, operatorCode: searchQuery }
          : {},
        options: {
          page: currentPage,
          paginate: 10,
          sort: { createdAt: 1 },
        },
      }),
    );
  }, [dispatch, searchQuery, selectedType, currentPage]);

  // Fetch services when modal is opened or when user interacts with the filter
  useEffect(() => {
    if ((isOpen || selectedType !== "all") && serviceData.length === 0) {
      dispatch(
        listEmployeeServices({
          query: {},
          options: {
            page: 1,
            paginate: 100,
            sort: { createdAt: 1 },
          },
        }),
      );
    }
  }, [dispatch, isOpen, selectedType, serviceData.length]);

  const handleFetchServices = () => {
    if (serviceData.length === 0) {
      dispatch(
        listEmployeeServices({
          query: {},
          options: {
            page: 1,
            paginate: 100,
            sort: { createdAt: 1 },
          },
        }),
      );
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedType]);

  // Map operator types from the service list for the filter dropdown
  const operatorTypes = Array.from(
    new Set(serviceData.map((s) => s.serviceName).filter(Boolean)),
  );

  const displayedServices = services;

  const paginator = operatorList?.paginator || {};
  const totalPages = paginator?.pageCount || 1;
  const apiCurrentPage = paginator?.currentPage || currentPage;

  const handleSubmitOperator = async () => {
    if (
      !formData.operatorName ||
      !formData.operatorCode ||
      !formData.operatorType ||
      !formData.minValue ||
      !formData.maxValue
    ) {
      return;
    }

    if (Number(formData.minValue) > Number(formData.maxValue)) {
      return;
    }

    try {
      if (editId) {
        const updatePayload = {
          operatorName: formData.operatorName,
          operatorCode: formData.operatorCode,
          operatorType: formData.operatorType,

          minValue: Number(formData.minValue),
          maxValue: Number(formData.maxValue),

          comm: Number(formData.comm),
          commType: formData.commType,
          amtType: formData.amtType,

          hsnCode: formData.hsnCode,
          accountRemark: formData.remarks,

          commSettingType: "percentage",
          allowedChannel: "WEB,MOBILE",
          businessModel: "B2B",
          isAccountNumeric: true,
          isBBPS: false,
          isBillingAllowed: true,
          exactness: "exact",
          inSlab: true,
          isTakeCustomerNum: true,
        };

        await dispatch(updateEmployeeOperator(editId, updatePayload));
      } else {
        // ✅ CREATE PAYLOAD
        const createPayload = {
          operatorName: formData.operatorName,
          operatorCode: formData.operatorCode,
          operatorType: formData.operatorType,
          minValue: Number(formData.minValue),
          maxValue: Number(formData.maxValue),
          comm: Number(formData.comm),
          commType: formData.commType,
          amtType: formData.amtType,
          hsnCode: formData.hsnCode,
          accountRemark: formData.remarks,

          // create-only fields
          commSettingType: "percentage",
          allowedChannel: "WEB,MOBILE",
          businessModel: "B2B",
          isAccountNumeric: true,
          isBBPS: false,
          isBillingAllowed: true,
          exactness: "exact",
          inSlab: true,
          isTakeCustomerNum: true,
        };

        await dispatch(createEmployeeOperator(createPayload));
      }

      // Refresh list
      dispatch(
        listEmployeeOperators({
          query: selectedType !== "all" ? { operatorType: selectedType } : {},
          customSearch: searchQuery
            ? { operatorName: searchQuery, operatorCode: searchQuery }
            : {},
          options: {
            page: currentPage,
            paginate: 10,
            sort: { createdAt: 1 },
          },
        })
      );

      resetForm();
    } catch (error) {
      console.error("Error submitting operator:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      operatorName: "",
      operatorCode: "",
      operatorType: "",
      minValue: "",
      maxValue: "",
      comm: "",
      commType: "",
      amtType: "",
      hsnCode: "HSN1234",
      remarks: "",
    });

    setEditId(null);
    setIsOpen(false);
  };

  // console.log("operatorList:", operatorList);
  // console.log("services:", services);
  // console.log("first item:", services[0]);

  const handleEdit = (service) => {
    setEditId(service.id); // API uses id

    setFormData({
      operatorName: service.operatorName || "",
      operatorCode: service.operatorCode || "",
      operatorType: service.operatorType || "",
      minValue: service.minValue || "",
      maxValue: service.maxValue || "",
      comm: service.comm || "",
      commType: service.commType || "",
      amtType: service.amtType || "",
      hsnCode: service.hsnCode || "HSN1234",
      remarks: service.accountRemark || "",
    });

    setIsOpen(true);
  };

  return (
    <div className="py-4 px-1">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center mb-6">
        {/* Search */}
        <div className="relative w-full lg:w-[622px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search Operator"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-black/50 px-10 py-2.5 rounded-lg focus:outline-none text-sm"
          />
        </div>

        {/* Filter + Add */}
        <div className="flex gap-3">
          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              onFocus={handleFetchServices}
              onClick={handleFetchServices}
              className="h-[44px] border border-[#1B1717]/80 rounded-lg px-5 pr-10 text-sm font-[Gilroy-Medium] focus:outline-none appearance-none cursor-pointer"
            >
              <option value="all">All</option>

              {serviceData.length > 0 ? (
                operatorTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))
              ) : (
                <option disabled>Loading types...</option>
              )}
            </select>

            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2" />
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="h-[44px] bg-[#039155] text-white px-5 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4 border border-white rounded-full" />
            Add New Operator
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow overflow-x-auto">
        <table className="min-w-[1400px]">
          <thead className="">
            <tr className="border-b border-[#1B1717]/70 text-center font-[Gilroy-Semibold] text-[#1B1717] text-sm ">
              <th className="p-3 ">ID</th>
              <th>Operator Name</th>
              <th>Operator Code</th>
              <th>Operator Type</th>
              <th>Min Value</th>
              <th>Max Value</th>
              <th>Commission</th>
              <th>Commission Type</th>
              <th>Amt Type</th>
              <th>HSN</th>
              <th>Remarks</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody className="text-center font-[Gilroy-Medium] text-[#1B1717] text-xs">
            {isLoading ? (
              <tr>
                <td
                  colSpan="10"
                  className="text-center py-6 text-sm text-gray-500"
                >
                  <ButtonLoader />
                </td>
              </tr>
            ) : displayedServices.length ? (
              displayedServices.map((service) => (
                <tr key={service.id} className="border-b border-[#1B1717]/30  ">
                  <td className="py-4 px-3">{service.id}</td>
                  <td>{service.operatorName}</td>
                  <td>{service.operatorCode}</td>
                  <td>{service.operatorType}</td>
                  <td>{service.minValue}</td>
                  <td>{service.maxValue}</td>
                  <td>{service.comm}</td>
                  <td>{service.commType}</td>
                  <td>{service.amtType}</td>
                  <td>{service.hsnCode}</td>
                  <td>{service.accountRemark}</td>
                  <td>
                    {/* <button
                      onClick={() => handleEdit(service)}
                      className="text-[#039155] text-sm font-[Gilroy-Semibold] hover:underline"
                    >
                      Edit
                    </button> */}
                    <button
                      onClick={() => handleEdit(service)}
                      className="p-2  transition"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4 text-[#039155]" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" className="py-6 text-gray-500">
                  No operators found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 py-4 ">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={apiCurrentPage === 1 || isLoading}
              className="p-2 sm:p-2.5 rounded-md border-[0.5px] border-[#121216]/54 bg-white text-[#121216] hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let page;
              if (totalPages <= 5) page = i + 1;
              else if (apiCurrentPage <= 3) page = i + 1;
              else if (apiCurrentPage >= totalPages - 2)
                page = totalPages - 4 + i;
              else page = apiCurrentPage - 2 + i;

              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-md font-[Gilroy-Regular] transition text-sm sm:text-base ${apiCurrentPage === page
                    ? "bg-[#039155] text-white"
                    : "bg-white border-[0.5px] border-[#121216]/54 text-[#1B1717] hover:bg-gray-50"
                    }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={apiCurrentPage === totalPages || isLoading}
              className="p-2 sm:p-2.5 rounded-md border-[0.5px] border-[#121216]/54 bg-white text-[#121216] hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#D9D9D9CC]">
          <div className="bg-white w-[498px] rounded-3xl p-6 relative">
            {/* Close button */}
            <button
              onClick={resetForm}
              className="absolute top-4 right-4 w-9 h-9
                         flex items-center justify-center
                         rounded-xl bg-[#039155]
                         hover:opacity-90 transition"
            >
              <span
                className="w-6 h-6 flex items-center justify-center
                           rounded-full border-2 border-white
                           text-white text-sm font-[Gilroy-Semibold]"
              >
                ✕
              </span>
            </button>

            {/* Title */}
            <h2 className="text-2xl font-[Gilroy-Medium] text-[#1B1717] text-center">
              {editId ? "Update Operator" : "Add New Operator"}
            </h2>
            <p className="text-base text-[#1B1717]/80 font-[Gilroy-Regular] text-center mb-6">
              Create A New Operator Entry
            </p>

            {/* Form */}
            <div className="space-y-3">
              <h3 className="font-[Gilroy-Semibold] text-[#1B1717] text-lg">
                New Operator
              </h3>

              {/* Row 1: Operator Name & Operator Type */}
              <div className="flex gap-4">
                <div className="flex flex-col gap-1 w-1/2">
                  <label className="font-[Gilroy-Medium] text-sm text-[#121216]">
                    Operator Name
                  </label>
                  <input
                    type="text"
                    value={formData.operatorName}
                    onChange={(e) =>
                      setFormData({ ...formData, operatorName: e.target.value })
                    }
                    placeholder="Enter Operator Name"
                    className="w-full border border-[#1B1717]/80 focus:outline-none rounded-lg px-3 py-2 text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1 w-1/2">
                  <label className="font-[Gilroy-Medium] text-sm text-[#121216]">
                    Operator Type
                  </label>

                  <select
                    value={formData.operatorType}
                    onChange={(e) =>
                      setFormData({ ...formData, operatorType: e.target.value })
                    }
                    className="w-full border border-[#1B1717]/80 focus:outline-none rounded-lg px-3 py-2 text-xs"
                  >
                    <option value="">Select Operator Type</option>

                    {serviceData.map((service) => (
                      <option key={service.id} value={service.serviceName}>
                        {service.serviceName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Operator Code & Amount Type */}
              <div className="flex gap-4">
                <div className="flex flex-col gap-1 w-1/2">
                  <label className="font-[Gilroy-Medium] text-sm text-[#121216]">
                    Operator Code
                  </label>
                  <input
                    type="text"
                    value={formData.operatorCode}
                    onChange={(e) =>
                      setFormData({ ...formData, operatorCode: e.target.value })
                    }
                    placeholder="Operator Code"
                    className="w-full border border-[#1B1717]/80 focus:outline-none rounded-lg px-3 py-2 text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1 w-1/2">
                  <label className="font-[Gilroy-Medium] text-sm text-[#121216]">
                    Amount Type
                  </label>
                  <select
                    value={formData.amtType}
                    onChange={(e) =>
                      setFormData({ ...formData, amtType: e.target.value })
                    }
                    className="w-full border border-[#1B1717]/80 focus:outline-none rounded-lg px-3 py-2 text-xs"
                  >
                    <option value="">Select</option>
                    <option value="per">Percentage</option>
                    <option value="fix">Fixed</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Min Value & Max Value */}
              <div className="flex gap-4">
                <div className="flex flex-col gap-1 w-1/2">
                  <label className="font-[Gilroy-Medium] text-sm text-[#121216]">
                    Min Value
                  </label>
                  <input
                    type="number"
                    placeholder="Min Value"
                    value={formData.minValue}
                    onChange={(e) =>
                      setFormData({ ...formData, minValue: e.target.value })
                    }
                    className="w-full border border-[#1B1717]/80 focus:outline-none rounded-lg px-3 py-2 text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1 w-1/2">
                  <label className="font-[Gilroy-Medium] text-sm text-[#121216]">
                    Max Value
                  </label>
                  <input
                    type="number"
                    placeholder="Max Value"
                    value={formData.maxValue}
                    onChange={(e) =>
                      setFormData({ ...formData, maxValue: e.target.value })
                    }
                    className="w-full border border-[#1B1717]/80 focus:outline-none rounded-lg px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col gap-1 w-1/2">
                  <label className="font-[Gilroy-Medium] text-sm text-[#121216]">
                    Commission
                  </label>
                  <input
                    type="number"
                    placeholder="Commission"
                    value={formData.comm}
                    onChange={(e) =>
                      setFormData({ ...formData, comm: e.target.value })
                    }
                    className="w-full border border-[#1B1717]/80 focus:outline-none rounded-lg px-3 py-2 text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1 w-1/2">
                  <label className="font-[Gilroy-Medium] text-sm text-[#121216]">
                    Commission Type
                  </label>
                  <select
                    value={formData.commType}
                    onChange={(e) =>
                      setFormData({ ...formData, commType: e.target.value })
                    }
                    className="w-full border border-[#1B1717]/80 focus:outline-none rounded-lg px-3 py-2 text-xs"
                  >
                    <option value="">Select</option>
                    <option value="com">Commission</option>
                    <option value="sur">Surcharge</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-[Gilroy-Medium] text-sm text-[#121216]">
                  Remarks
                </label>
                <textarea
                  placeholder="Remarks"
                  value={formData.remarks}
                  onChange={(e) =>
                    setFormData({ ...formData, remarks: e.target.value })
                  }
                  className="w-full border border-[#1B1717]/80 focus:outline-none rounded-lg px-3 py-2 text-xs"
                />
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex justify-between gap-3 mt-6">
              <button
                onClick={resetForm}
                className="w-1/2 border border-[#1B1717]/80 text-[#1B1717]/80 font-[Gilroy-Medium] rounded-xl py-3 text-sm"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmitOperator}
                className="w-1/2 bg-[#039155] text-white rounded-xl font-[Gilroy-Semibold] py-3 text-sm"
              >
                {editId ? "Update Operator" : "Add Operator"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperatorSetting;
