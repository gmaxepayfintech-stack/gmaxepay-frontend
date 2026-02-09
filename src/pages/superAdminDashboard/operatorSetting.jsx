import { Pencil, Plus, Search } from "lucide-react";
import { FiChevronDown } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import {
  listOperators,
  createOperator,
  updateOperator,
} from "../../redux/action/operatorActions";
import React, { useState, useEffect } from "react";
import { ButtonLoader } from "../../widgets/layout/loader";

const OperatorSetting = () => {
  // const [services, setServices] = useState(initialServices);
  const dispatch = useDispatch();
  const { operatorList } = useSelector((state) => state.operators);
  const isLoading = useSelector((state) => state.loading.isLoading);

  // always extract the ARRAY safely
  const services = Array.isArray(operatorList?.operators)
    ? operatorList.operators
    : [];

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
    hsnCode: "",
    remarks: "",
  });

  useEffect(() => {
    dispatch(listOperators(searchQuery, 1));
  }, [dispatch, searchQuery]);

  const operatorTypes = Array.from(
    new Set(services.map((op) => op.operatorType).filter(Boolean)),
  );

  // 🔍 Search filter
  const searchFilteredServices = services.filter(
    (service) =>
      service.operatorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.operatorCode?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const typeFilteredServices =
    selectedType === "all"
      ? searchFilteredServices
      : searchFilteredServices.filter(
          (service) => service.operatorType === selectedType,
        );

  const sortedServices = [...typeFilteredServices].sort((a, b) =>
    (a.operatorName || "").localeCompare(b.operatorName || ""),
  );

  const handleSubmitOperator = () => {
    if (
      !formData.operatorName ||
      !formData.operatorCode ||
      !formData.operatorType ||
      !formData.minValue ||
      !formData.maxValue
    ) {
      return;
    }

    // 🔒 extra safety
    if (Number(formData.minValue) > Number(formData.maxValue)) {
      alert("Min Value cannot be greater than Max Value");
      return;
    }

    if (editId) {
      // ✅ UPDATE PAYLOAD (ONLY editable fields)
      const updatePayload = {
        operatorName: formData.operatorName,

        minValue: Number(formData.minValue),
        maxValue: Number(formData.maxValue),

        comm: Number(formData.comm),
        commType: formData.commType,
        amtType: formData.amtType,

        hsnCode: formData.hsnCode,
        accountRemark: formData.remarks,

        // 🔴 REQUIRED STATIC FIELDS (ADD THESE)
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

      dispatch(updateOperator(editId, updatePayload));
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

      dispatch(createOperator(createPayload));
    }

    resetForm();
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
      hsnCode: "",
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
      hsnCode: service.hsnCode || "",
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
              className="h-[44px] border border-[#1B1717]/80 rounded-lg px-5 pr-10 text-sm font-[gilroy-medium] focus:outline-none appearance-none"
            >
              <option value="all">All</option>

              {operatorTypes.map((type) => (
                <option
                  className="font-[gilroy-medium]"
                  key={type}
                  value={type}
                >
                  {type}
                </option>
              ))}
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
            <tr className="border-b border-[#1B1717]/70 text-center font-[gilroy-semibold] text-[#1B1717] text-sm ">
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
          <tbody className="text-center font-[gilroy-medium] text-[#1B1717] text-xs">
            {isLoading ? (
              <tr>
                <td
                  colSpan="10"
                  className="text-center py-6 text-sm text-gray-500"
                >
                  <ButtonLoader />
                </td>
              </tr>
            ) : sortedServices.length ? (
              sortedServices.map((service) => (
                <tr
                  key={service.id}
                  className="border-b border-[#1B1717]/30 last:border-b-0 "
                >
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
                      className="text-[#039155] text-sm font-semibold hover:underline"
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
                           text-white text-sm font-bold"
              >
                ✕
              </span>
            </button>

            {/* Title */}
            <h2 className="text-2xl font-[gilroy-medium] text-[#1B1717] text-center">
              {editId ? "Update Operator" : "Add New Operator"}
            </h2>
            <p className="text-base text-[#1B1717]/80 font-[gilroy-regular] text-center mb-6">
              Create A New Operator Entry
            </p>

            {/* Form */}
            <div className="space-y-3">
              <h3 className="font-[gilroy-semibold] text-[#1B1717] text-lg">
                New Operator
              </h3>

              {/* Inputs */}
              <div className="flex gap-4">
                <div className="flex flex-col gap-1 w-1/2">
                  <label className="font-[gilroy-medium] text-sm text-[#121216]">
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

                    {operatorTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* <div className="flex flex-col gap-1 w-1/2">
                  <label className="font-[gilroy-medium] text-sm text-[#121216]">
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
                </div> */}
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col gap-1 w-1/2">
                  <label className="font-[gilroy-medium] text-sm text-[#121216]">
                    Operator Code
                  </label>
                  <input
                    type="text"
                    value={formData.operatorCode}
                    onChange={(e) =>
                      setFormData({ ...formData, operatorCode: e.target.value })
                    }
                    disabled={!!editId}
                    placeholder="Operator Code"
                    className={`w-full border border-[#1B1717]/80 focus:outline-none rounded-lg px-3 py-2 text-xs
                        ${editId ? "bg-gray-100 cursor-not-allowed" : ""}
                      `}
                  />
                </div>

                {/* <div className="flex flex-col gap-1 w-1/2">
                  <label className="font-[gilroy-medium] text-sm text-[#121216]">
                    Operator Type
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Operator Type"
                    className="w-full border border-[#1B1717]/80 rounded-lg px-3 py-2 text-xs focus:outline-none"
                  />
                </div> */}
                <div className="flex flex-col gap-1 w-1/2">
                  <label className="font-[gilroy-medium] text-sm text-[#121216]">
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
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col gap-1 w-1/2">
                  <label className="font-[gilroy-medium] text-sm text-[#121216]">
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
                  <label className="font-[gilroy-medium] text-sm text-[#121216]">
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
                  <label className="font-[gilroy-medium] text-sm text-[#121216]">
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
                  <label className="font-[gilroy-medium] text-sm text-[#121216]">
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
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col gap-1 w-1/2">
                  <label className="font-[gilroy-medium] text-sm text-[#121216]">
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

                <div className="flex flex-col gap-1 w-1/2">
                  <label className="font-[gilroy-medium] text-sm text-[#121216]">
                    HSN Code
                  </label>
                  <input
                    type="text"
                    placeholder="HSN Code"
                    value={formData.hsnCode}
                    onChange={(e) =>
                      setFormData({ ...formData, hsnCode: e.target.value })
                    }
                    className="w-full border border-[#1B1717]/80 focus:outline-none rounded-lg px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-[gilroy-medium] text-sm text-[#121216]">
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
                className="w-1/2 border border-[#1B1717]/80 text-[#1B1717]/80 font-[gilroy-medium] rounded-xl py-3 text-sm"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmitOperator}
                className="w-1/2 bg-[#039155] text-white rounded-xl font-[gilroy-semibold] py-3 text-sm"
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
