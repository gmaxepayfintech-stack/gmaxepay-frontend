import { Plus, Search } from "lucide-react";
import React, { useState } from "react";
import { FiChevronDown } from "react-icons/fi";

const initialServices = [
  {
    id: 1,
    operatorname: "AEPS1_501_1000_CW",
    operatorcode: "AEPS1CW1",
    operatortype: "AEPS1",
    minvalue: 501,
    maxvalue: 1000,
    commission: 0.4,
    comissiontype: "Com",
    amounttype: "Per",
    HSNcode: "HSN001",
    remarks: "HSN001",
  },
  {
    slno: 2,
    id: 2,
    operatorname: "AEPS1_501_1000_CW",
    operatorcode: "AEPS1CW1",
    operatortype: "AEPS1",
    minvalue: 501,
    maxvalue: 1000,
    commission: 0.4,
    comissiontype: "Com",
    amounttype: "Per",
    HSNcode: "HSN001",
    remarks: "HSN001",
  },
  {
    slno: 3,
    id: 3,
    operatorname: "AEPS1_501_1000_CW",
    operatorcode: "AEPS1CW1",
    operatortype: "AEPS1",
    minvalue: 501,
    maxvalue: 1000,
    commission: 0.4,
    comissiontype: "Com",
    amounttype: "Per",
    HSNcode: "HSN001",
    remarks: "HSN001",
  },
  {
    slno: 4,
    id: 4,
    operatorname: "AEPS1_501_1000_CW",
    operatorcode: "AEPS1CW1",
    operatortype: "AEPS1",
    minvalue: 501,
    maxvalue: 1000,
    commission: 0.4,
    comissiontype: "Com",
    amounttype: "Per",
    HSNcode: "HSN001",
    remarks: "HSN001",
  },
  {
    slno: 5,
    id: 5,
    operatorname: "AEPS1_501_1000_CW",
    operatorcode: "AEPS1CW1",
    operatortype: "AEPS1",
    minvalue: 501,
    maxvalue: 1000,
    commission: 0.4,
    comissiontype: "Com",
    amounttype: "Per",
    HSNcode: "HSN001",
    remarks: "HSN001",
  },
  {
    slno: 6,
    id: 6,
    operatorname: "AEPS1_501_1000_CW",
    operatorcode: "AEPS1CW1",
    operatortype: "AEPS1",
    minvalue: 501,
    maxvalue: 1000,
    commission: 0.4,
    comissiontype: "Com",
    amounttype: "Per",
    HSNcode: "HSN001",
    remarks: "HSN001",
  },
  {
    slno: 7,
    id: 7,
    operatorname: "AEPS1_501_1000_CW",
    operatorcode: "AEPS1CW1",
    operatortype: "AEPS2",
    minvalue: 501,
    maxvalue: 1000,
    commission: 0.4,
    comissiontype: "Com",
    amounttype: "Per",
    HSNcode: "HSN001",
    remarks: "HSN001",
  },
  {
    slno: 8,
    id: 8,
    operatorname: "AEPS1_501_1000_CW",
    operatorcode: "AEPS1CW1",
    operatortype: "AEPS2",
    minvalue: 501,
    maxvalue: 1000,
    commission: 0.4,
    comissiontype: "Com",
    amounttype: "Per",
    HSNcode: "HSN001",
    remarks: "HSN001",
  },
  {
    slno: 9,
    id: 9,
    operatorname: "AEPS1_501_1000_CW",
    operatorcode: "AEPS1CW1",
    operatortype: "AEPS2",
    minvalue: 501,
    maxvalue: 1000,
    commission: 0.4,
    comissiontype: "Com",
    amounttype: "Per",
    HSNcode: "HSN001",
    remarks: "HSN001",
  },
  {
    slno: 10,
    id: 10,
    operatorname: "AEPS1_501_1000_CW",
    operatorcode: "AEPS1CW1",
    operatortype: "AEPS2",
    minvalue: 501,
    maxvalue: 1000,
    commission: 0.4,
    comissiontype: "Com",
    amounttype: "Per",
    HSNcode: "HSN001",
    remarks: "HSN001",
  },
  {
    slno: 11,
    id: 11,
    operatorname: "AEPS1_501_1000_CW",
    operatorcode: "AEPS1CW1",
    operatortype: "AEPS2",
    minvalue: 501,
    maxvalue: 1000,
    commission: 0.4,
    comissiontype: "Com",
    amounttype: "Per",
    HSNcode: "HSN001",
    remarks: "HSN001",
  },
  {
    slno: 12,
    id: 12,
    operatorname: "AEPS1_501_1000_CW",
    operatorcode: "AEPS1CW1",
    operatortype: "AEPS2",
    minvalue: 501,
    maxvalue: 1000,
    commission: 0.4,
    comissiontype: "Com",
    amounttype: "Per",
    HSNcode: "HSN001",
    remarks: "HSN001",
  },
];

const OperatorSetting = () => {
  const [services, setServices] = useState(initialServices);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("all");

  // 🔍 Search filter
  const searchFilteredServices = services.filter(
    (service) =>
      service.operatorname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.operatorcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.id.toString().includes(searchQuery),
  );

  const typeFilteredServices =
    selectedType === "all"
      ? searchFilteredServices
      : searchFilteredServices.filter(
          (service) => service.operatortype === selectedType,
        );

  const sortedServices = [...typeFilteredServices].sort((a, b) =>
    a.operatorname.localeCompare(b.operatorname),
  );

  return (
    <div className="py-4 px-1">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search Service"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-black/50 px-10 py-2.5 rounded-lg w-[622px] focus:outline-none text-sm"
          />
        </div>
        <div className="flex gap-4">
          {/* Custom Select with react-icons */}
          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="
                h-[44px]
                appearance-none
                border border-[#1B1717]/80
                rounded-lg
                px-5 pr-10
                text-sm
                font-[gilroy-semibold]
                text-[#1B1717]
                focus:outline-none
                cursor-pointer
                bg-white
            "
            >
              <option value="all">All</option>
              <option value="AEPS1">AEPS 1</option>
              <option value="AEPS2">AEPS 2</option>
            </select>

            <FiChevronDown
              className="
                pointer-events-none
                absolute
                right-3
                top-1/2
                -translate-y-1/2
                text-[#1B1717]
                text-sm
                "
            />
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="
                h-[44px]
                bg-[#039155]
                hover:bg-[#027a46]
                text-white
                px-5
                rounded-lg
                text-sm
                font-[gilroy-semibold]
                flex
                items-center
                gap-2
                shadow-sm
            "
          >
            <Plus className="w-4 h-4 border border-white rounded-full" />
            Add New Operator
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow overflow-x-auto">
        <table className="min-w-[1200px] border-collapse whitespace-nowrap">
          <thead className="sticky top-0 bg-white z-10">
            <tr className="border-b border-[#1B1717]/50 text-center">
              <th className="py-4 px-4 text-sm font-[gilroy-medium]">ID</th>
              <th className="py-4 px-4 text-sm font-[gilroy-medium]">
                Operator Name
              </th>
              <th className="py-4 px-4 text-sm font-[gilroy-medium]">
                Operator Code
              </th>
              <th className="py-4 px-4 text-sm font-[gilroy-medium]">
                Operator Type
              </th>
              <th className="py-4 px-4 text-sm font-[gilroy-medium]">
                Min Value
              </th>
              <th className="py-4 px-4 text-sm font-[gilroy-medium]">
                Max Value
              </th>
              <th className="py-4 px-4 text-sm font-[gilroy-medium]">
                Commission
              </th>
              <th className="py-4 px-4 text-sm font-[gilroy-medium]">
                Commission Type
              </th>
              <th className="py-4 px-4 text-sm font-[gilroy-medium]">
                Amount Type
              </th>
              <th className="py-4 px-4 text-sm font-[gilroy-medium]">
                HSN Code
              </th>
              <th className="py-4 px-4 text-sm font-[gilroy-medium]">
                Remarks
              </th>
            </tr>
          </thead>

          <tbody className="text-center">
            {sortedServices.length > 0 ? (
              sortedServices.map((service) => (
                <tr
                  key={service.id}
                  className="border-b border-[#1B1717]/20 last:border-none"
                >
                  <td className="py-3 px-4 text-xs text-[#1B1717] font-[gilroy-medium]">
                    {service.id}
                  </td>
                  <td className="py-3 px-4 text-xs text-[#1B1717] font-[gilroy-medium]">
                    {service.operatorname}
                  </td>
                  <td className="py-3 px-4 text-xs text-[#1B1717] font-[gilroy-medium]">
                    {service.operatorcode}
                  </td>
                  <td className="py-3 px-4 text-xs text-[#1B1717] font-[gilroy-medium]">
                    {service.operatortype}
                  </td>
                  <td className="py-3 px-4 text-xs text-[#1B1717] font-[gilroy-medium]">
                    {service.minvalue}
                  </td>
                  <td className="py-3 px-4 text-xs text-[#1B1717] font-[gilroy-medium]">
                    {service.maxvalue}
                  </td>
                  <td className="py-3 px-4 text-xs text-[#1B1717] font-[gilroy-medium]">
                    {service.commission}
                  </td>
                  <td className="py-3 px-4 text-xs text-[#1B1717] font-[gilroy-medium]">
                    {service.comissiontype}
                  </td>
                  <td className="py-3 px-4 text-xs text-[#1B1717] font-[gilroy-medium]">
                    {service.amounttype}
                  </td>
                  <td className="py-3 px-4 text-xs text-[#1B1717] font-[gilroy-medium]">
                    {service.HSNcode}
                  </td>
                  <td className="py-3 px-4 text-xs text-[#1B1717] font-[gilroy-medium]">
                    {service.remarks}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="11"
                  className="text-center py-6 text-sm text-gray-500"
                >
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
              onClick={() => setIsOpen(false)}
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
              Add New Operator
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
                    Service ID
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Service ID"
                    className="w-full border border-[#1B1717]/80 rounded-lg px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1 w-1/2">
                  <label className="font-[gilroy-medium] text-sm text-[#121216]">
                    Operator Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Operator Name"
                    className="w-full border border-[#1B1717]/80 rounded-lg px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col gap-1 w-1/2">
                  <label className="font-[gilroy-medium] text-sm text-[#121216]">
                    Operator Code
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Operator Code"
                    className="w-full border border-[#1B1717]/80 rounded-lg px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1 w-1/2">
                  <label className="font-[gilroy-medium] text-sm text-[#121216]">
                    Operator Type
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Operator Type"
                    className="w-full border border-[#1B1717]/80 rounded-lg px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col gap-1 w-1/2">
                  <label className="font-[gilroy-medium] text-sm text-[#121216]">
                    Min Value
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Min Value"
                    className="w-full border border-[#1B1717]/80 rounded-lg px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1 w-1/2">
                  <label className="font-[gilroy-medium] text-sm text-[#121216]">
                    Max Value
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Max Value"
                    className="w-full border border-[#1B1717]/80 rounded-lg px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col gap-1 w-1/2">
                  <label className="font-[gilroy-medium] text-sm text-[#121216]">
                    Commission
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Commission"
                    className="w-full border border-[#1B1717]/80 rounded-lg px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1 w-1/2">
                  <label className="font-[gilroy-medium] text-sm text-[#121216]">
                    Commission Type
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Commission Type"
                    className="w-full border border-[#1B1717]/80 rounded-lg px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col gap-1 w-1/2">
                  <label className="font-[gilroy-medium] text-sm text-[#121216]">
                    Amount Type
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Amount Type"
                    className="w-full border border-[#1B1717]/80 rounded-lg px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1 w-1/2">
                  <label className="font-[gilroy-medium] text-sm text-[#121216]">
                    HSN Code
                  </label>
                  <input
                    type="text"
                    placeholder="Enter HSN Code"
                    className="w-full border border-[#1B1717]/80 rounded-lg px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <h3 className="font-[gilroy-medium] text-sm text-[#121216] mb-1">
                  Remarks
                </h3>

                <input
                  placeholder="Enter Remarks"
                  className="w-full border border-[#1B1717]/80 py-4 px-1.5 rounded-lg flex justify-between items-center focus:outline-none"
                />
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex justify-between gap-3 mt-6">
              <button
                onClick={() => setIsOpen(false)}
                className="w-1/2 border border-[#1B1717]/80 text-[#1B1717]/80 font-[gilroy-medium] rounded-xl py-3 text-sm"
              >
                Cancel
              </button>

              <button className="w-1/2 bg-[#039155] text-white rounded-xl font-[gilroy-semibold] py-3 text-sm">
                Add Operator
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperatorSetting;
