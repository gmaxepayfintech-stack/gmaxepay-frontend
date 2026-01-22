import React, { useState } from "react";
import MembersEarning from "../MembersEarning";

const EarningReport = ({ embedded = false }) => {
  const [activeTab, setActiveTab] = useState("myEarning");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Sample data structure - replace with actual API data
  const servicesData = [
    {
      srNo: 1328,
      service: "Recharge",
      txnVolume: 3208,
      txnCount: 13,
      success: 13,
      commissionGenerated: 63.52,
      commissionPaid: 58.94,
      commission: 4.412,
    },
    {
      srNo: 1328,
      service: "Recharge",
      txnVolume: 3208,
      txnCount: 13,
      success: 13,
      commissionGenerated: 63.52,
      commissionPaid: 58.94,
      commission: 4.412,
    },
    {
      srNo: 1528,
      service: "Recharge",
      txnVolume: 3208,
      txnCount: 13,
      success: 13,
      commissionGenerated: 63.52,
      commissionPaid: 58.94,
      commission: 4.412,
    },
    {
      srNo: 1326,
      service: "Recharge",
      txnVolume: 3208,
      txnCount: 13,
      success: 13,
      commissionGenerated: 63.52,
      commissionPaid: 58.94,
      commission: 4.412,
    },
    {
      srNo: 1328,
      service: "Recharge",
      txnVolume: 3208,
      txnCount: 13,
      success: 13,
      commissionGenerated: 63.52,
      commissionPaid: 58.94,
      commission: 4.412,
    },
    {
      srNo: 1328,
      service: "Recharge",
      txnVolume: 3208,
      txnCount: 13,
      success: 13,
      commissionGenerated: 63.52,
      commissionPaid: 58.94,
      commission: 4.412,
    },
    {
      srNo: 1328,
      service: "Recharge",
      txnVolume: 3208,
      txnCount: 13,
      success: 13,
      commissionGenerated: 63.52,
      commissionPaid: 58.94,
      commission: 4.412,
    },
  ];

  // Calculate totals
  const totals = servicesData.reduce(
    (acc, service) => ({
      txnVolume: acc.txnVolume + service.txnVolume,
      txnCount: acc.txnCount + service.txnCount,
      success: acc.success + service.success,
      commissionGenerated:
        acc.commissionGenerated + service.commissionGenerated,
      commissionPaid: acc.commissionPaid + service.commissionPaid,
      commission: acc.commission + service.commission,
    }),
    {
      txnVolume: 0,
      txnCount: 0,
      success: 0,
      commissionGenerated: 0,
      commissionPaid: 0,
      commission: 0,
    },
  );

  return (
    <div
      className={`text-[#1B1717] ${embedded ? "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" : "min-h-screen p-4 sm:p-6 md:p-8"}`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-[28px]">
          <h1 className="text-[24px] sm:text-3xl md:text-4xl font-['Gilroy-Medium'] text-[#1B1717] mb-[12px]">
            Earning Reports
          </h1>
          <p className="text-[16px] sm:text-base md:text-lg text-[#1B1717] font-['Gilroy-Regular']">
            This Earning Report Provides Showcasing Revenue Streams,
            Profitability Of Your Business.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 sm:mb-8">
          <div className="inline-flex bg-[#FFFFFF] w-[527px] h-[68px] rounded-xl px-[18px] py-[14px] gap-[146px]">
            <button
              onClick={() => setActiveTab("myEarning")}
              className={`w-[148px] h-[40px] py-[10px] px-[14px] rounded-2xl font-medium transition-all flex items-center justify-center gap-2.5 ${
                activeTab === "myEarning"
                  ? "text-white bg-[#039155] shadow-sm"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              My Earning
            </button>
            <button
              onClick={() => setActiveTab("membersEarning")}
              className={`w-[197px] h-[39px] py-[10px] px-[14px] rounded-2xl font-medium transition-all flex items-center justify-center gap-2.5 ${
                activeTab === "membersEarning"
                  ? "text-white bg-[#039155] shadow-sm"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              Members Earning
            </button>
          </div>
        </div>

        {activeTab === "membersEarning" ? (
          <MembersEarning embedded={embedded} />
        ) : (
          <>
            {/* Filter Section */}
            <div className="bg-white rounded-[24px] mb-6 sm:mb-8 shadow-sm border border-gray-200 w-[529px] h-[164px] relative">
              <div className="absolute top-[24px] left-[18px] w-[408px] h-[117px] flex flex-col">
                <h3 className="text-[20px] font-['Gilroy-SemiBold'] text-[#1B1717] mb-2 text-left w-full">
                  Add Filter
                </h3>
                <div className="flex flex-row gap-4 flex-1">
                  <div className="relative flex-1">
                    <label
                      htmlFor="fromDate"
                      className="block text-xs sm:text-sm md:text-base font-medium text-[#12126] mb-2"
                    >
                      From Date
                    </label>
                    <div className="relative">
                      <input
                        id="fromDate"
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        placeholder="Select Date"
                        className="w-[190px] h-[44px] pl-4 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white text-[#1B1717] placeholder:text-gray-400 focus:ring-2 focus:ring-[#039155] focus:border-[#039155] outline-none transition"
                      />
                    </div>
                  </div>
                  <div className="relative flex-1">
                    <label
                      htmlFor="toDate"
                      className="block text-xs sm:text-sm md:text-base font-medium text-[#12126] mb-2"
                    >
                      To Date
                    </label>
                    <div className="relative">
                      <input
                        id="toDate"
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        placeholder="To Date"
                        className="w-[190px] h-[44px] pl-4 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white text-[#1B1717] placeholder:text-gray-400 focus:ring-2 focus:ring-[#039155] focus:border-[#039155] outline-none transition"
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
                        SR.No
                      </th>
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
                        Commission Generated
                      </th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-right text-[14px] font-['Gilroy-Medium'] text-[#1B1717]">
                        Commission Paid
                      </th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-right text-[14px] font-['Gilroy-Medium'] text-[#1B1717]">
                        Commissic
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
                          <span className="text-[10px] font-['Gilroy-Regular'] text-gray-900">
                            {service.srNo}
                          </span>
                        </td>
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
                            {service.commissionGenerated.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                          <span className="text-[10px] font-['Gilroy-Regular'] text-red-600">
                            {service.commissionPaid.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                          <span className="text-[10px] font-['Gilroy-Regular'] text-gray-900">
                            {service.commission.toFixed(3)}
                          </span>
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
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <span className="text-[10px] font-['Gilroy-SemiBold'] text-gray-900">
                          -
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
                          {totals.commissionGenerated.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                        <span className="text-[10px] font-['Gilroy-Regular'] text-red-600">
                          {totals.commissionPaid.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                        <span className="text-[10px] font-['Gilroy-Regular'] text-gray-900">
                          {totals.commission.toFixed(3)}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EarningReport;
