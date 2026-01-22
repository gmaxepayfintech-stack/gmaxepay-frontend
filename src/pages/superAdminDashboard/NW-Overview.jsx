import React, { useState } from "react";
import PropTypes from "prop-types";

const NWoverview = ({ embedded = false }) => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [role, setRole] = useState("");
  const [client, setClient] = useState("");

  // Sample data structure - replace with actual API data
  const servicesData = [
    {
      service: "Recharge",
      txnVolume: 1328,
      txnCount: 8,
      success: 7,
      pending: 0,
      failed: 0,
      successRate: 87.5,
    },
    {
      service: "BBPS",
      txnVolume: 1328,
      txnCount: 8,
      success: 7,
      pending: 0,
      failed: 0,
      successRate: 87.5,
    },
    {
      service: "LIC",
      txnVolume: 1328,
      txnCount: 8,
      success: 7,
      pending: 0,
      failed: 0,
      successRate: 87.5,
    },
    {
      service: "Fast Tag",
      txnVolume: 1328,
      txnCount: 8,
      success: 7,
      pending: 0,
      failed: 0,
      successRate: 87.5,
    },
    {
      service: "Credit Card",
      txnVolume: 1328,
      txnCount: 8,
      success: 7,
      pending: 0,
      failed: 0,
      successRate: 87.5,
    },
    {
      service: "CMS",
      txnVolume: 1328,
      txnCount: 8,
      success: 7,
      pending: 0,
      failed: 0,
      successRate: 87.5,
    },
  ];

  // Calculate totals - using values from image
  const totals = {
    txnVolume: 334604,
    txnCount: 699,
    success: 528,
    pending: 0,
    failed: 171,
  };

  return (
    <div
      className={`text-[#1B1717] ${embedded ? "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" : ""}`}
    >
      {/* Filter Section */}
      <div className="bg-white rounded-[24px] mb-6 sm:mb-8 shadow-sm border border-gray-200 w-full h-[164px] relative">
        <div className="absolute inset-0 flex flex-col items-center justify-center px-[18px]">
          <h3 className="text-[16px] font-['Gilroy-SemiBold'] text-[#1B1717] mb-6 text-left w-full">
            Add Filter
          </h3>
          <div className="flex flex-row gap-4 w-full items-start">
            <div className="relative flex-1 min-w-0">
              <label
                htmlFor="fromDate"
                className="block text-xs sm:text-sm md:text-base font-medium text-[#1B1717] mb-2"
              >
                From Date
              </label>
              <div className="relative">
                <input
                  id="fromDate"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  placeholder="Select"
                  className="w-full h-[44px] pl-4 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white text-[#1B1717] placeholder:text-gray-400 focus:ring-2 focus:ring-[#039155] focus:border-[#039155] outline-none transition"
                />
              </div>
            </div>
            <div className="relative flex-1 min-w-0">
              <label
                htmlFor="toDate"
                className="block text-xs sm:text-sm md:text-base font-medium text-[#1B1717] mb-2"
              >
                To Date
              </label>
              <div className="relative">
                <input
                  id="toDate"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  placeholder="Select"
                  className="w-full h-[44px] pl-4 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white text-[#1B1717] placeholder:text-gray-400 focus:ring-2 focus:ring-[#039155] focus:border-[#039155] outline-none transition"
                />
              </div>
            </div>
            <div className="relative flex-1 min-w-0">
              <label
                htmlFor="role"
                className="block text-xs sm:text-sm md:text-base font-medium text-[#1B1717] mb-2"
              >
                Role
              </label>
              <div className="relative">
                <input
                  id="role"
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Select Role"
                  className="w-full h-[44px] pl-4 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white text-[#1B1717] placeholder:text-gray-400 focus:ring-2 focus:ring-[#039155] focus:border-[#039155] outline-none transition"
                />
              </div>
            </div>
            <div className="relative flex-1 min-w-0">
              <label
                htmlFor="client"
                className="block text-xs sm:text-sm md:text-base font-medium text-[#1B1717] mb-2"
              >
                Client
              </label>
              <div className="relative">
                <input
                  id="client"
                  type="text"
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  placeholder="Select Client"
                  className="w-full h-[44px] pl-4 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white text-[#1B1717] placeholder:text-gray-400 focus:ring-2 focus:ring-[#039155] focus:border-[#039155] outline-none transition"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-[14px] font-['Gilroy-Medium'] text-[#1B1717]">
                  Services
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-right text-[14px] font-['Gilroy-Medium'] text-[#1B1717]">
                  Txn Volume
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-right text-[14px] font-['Gilroy-Medium'] text-[#1B1717]">
                  Txn Count
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-right text-[14px] font-['Gilroy-Medium'] text-[#1B1717]">
                  Success
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-right text-[14px] font-['Gilroy-Medium'] text-[#1B1717]">
                  Pending
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-right text-[14px] font-['Gilroy-Medium'] text-[#1B1717]">
                  Failed
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-right text-[14px] font-['Gilroy-Medium'] text-[#1B1717]">
                  Success Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {servicesData.map((service, index) => (
                <tr
                  key={index}
                  className={`transition-colors ${
                    index % 2 === 0 ? "bg-[#F0F9F4]" : "bg-white"
                  }`}
                >
                  <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <span className="text-[10px] font-['Gilroy-SemiBold'] text-gray-900">
                      {service.service}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                    <span className="text-[10px] font-['Gilroy-Regular'] text-gray-900">
                      {service.txnVolume.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                    <span className="text-[10px] font-['Gilroy-Regular'] text-gray-900">
                      {service.txnCount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                    <span className="text-[10px] font-['Gilroy-Regular'] text-green-600">
                      {service.success.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                    <span className="text-[10px] font-['Gilroy-Regular'] text-orange-600">
                      {service.pending.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                    <span className="text-[10px] font-['Gilroy-Regular'] text-red-600">
                      {service.failed === 0
                        ? "000"
                        : service.failed.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2 sm:gap-3">
                      <div className="w-[54px] h-[7px] bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="bg-[#039155] h-full rounded-full transition-all duration-500"
                          style={{ width: `${service.successRate}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-['Gilroy-SemiBold'] font-normal leading-[100%] tracking-[0%] align-middle capitalize text-gray-900 min-w-[35px] sm:min-w-[45px] text-right">
                        {service.successRate.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}

              {/* Total Row */}
              <tr className="bg-gray-50 border-t-2 border-gray-300">
                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                  <span className="text-[10px] font-['Gilroy-SemiBold'] text-gray-900">
                    Total
                  </span>
                </td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                  <span className="text-[10px] font-['Gilroy-Regular'] text-gray-900">
                    {totals.txnVolume.toLocaleString()}
                  </span>
                </td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                  <span className="text-[10px] font-['Gilroy-Regular'] text-gray-900">
                    {totals.txnCount.toLocaleString()}
                  </span>
                </td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                  <span className="text-[10px] font-['Gilroy-Regular'] text-green-600">
                    {totals.success.toLocaleString()}
                  </span>
                </td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                  <span className="text-[10px] font-['Gilroy-Regular'] text-orange-600">
                    {totals.pending.toLocaleString()}
                  </span>
                </td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                  <span className="text-[10px] font-['Gilroy-Regular'] text-red-600">
                    {totals.failed.toLocaleString()}
                  </span>
                </td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                  {/* Empty - no success rate shown for Total row */}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

NWoverview.propTypes = {
  embedded: PropTypes.bool,
};

export default NWoverview;
