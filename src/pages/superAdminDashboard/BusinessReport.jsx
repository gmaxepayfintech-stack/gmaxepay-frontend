import React, { useState } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import PropTypes from "prop-types";
import UserPerformance from "./UserPerformance";

const BusinessReport = ({ embedded = false }) => {
  const [activeTab, setActiveTab] = useState("myPerformance");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

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
      className={`text-[#1B1717] ${embedded ? "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" : "min-h-screen py-4 px-2"}`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-[28px]">
          <h1 className="text-lg sm:text-xl md:text-2xl font-['Gilroy-Medium'] text-[#1B1717] mb-[12px]">
            Business Reports
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-[#1B1717] font-['Gilroy-Regular']">
            Monitor Your Business Performance With Comprehensive Reporting
            Tools.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 sm:mb-8 ">
          <div className="flex bg-white w-[500px] h-[68px] rounded-3xl px-[18px] py-[14px]">
            <button
              onClick={() => setActiveTab("myPerformance")}
              className={`flex-1 h-[40px] rounded-2xl font-[Gilroy-Medium]
        transition-all flex items-center justify-center
        ${activeTab === "myPerformance"
                  ? "text-white bg-[#039155] shadow-sm font-[Gilroy-Semibold]"
                  : "text-gray-700 hover:text-gray-900"
                }`}
            >
              My Performance
            </button>

            <button
              onClick={() => setActiveTab("userBusinessStats")}
              className={`flex-1 h-[40px] rounded-2xl font-[Gilroy-Medium]
        transition-all flex items-center justify-center
        ${activeTab === "userBusinessStats"
                  ? "text-white bg-[#039155] shadow-sm font-[Gilroy-Semibold]"
                  : "text-gray-700 hover:text-gray-900"
                }`}
            >
              User Business Statistics
            </button>
          </div>
        </div>

        {activeTab === "userBusinessStats" ? (
          <UserPerformance embedded={embedded} />
        ) : (
          <>
            {/* Filter Section */}
            <div className="bg-white rounded-[24px] mb-6 sm:mb-8 shadow-sm  w-[529px] h-[164px] relative">
              <div className="absolute top-[24px] left-[18px] w-[408px] h-[117px] flex flex-col">
                <h3 className="text-[16px] font-[Gilroy-Semibold] text-[#1B1717] mb-4">
                  Add Filter
                </h3>
                <div className="flex flex-row gap-4 flex-1">
                  <div className="relative flex-1">
                    <label
                      htmlFor="fromDate"
                      className="block text-[10px] sm:text-xs md:text-sm font-[Gilroy-Medium] text-[#12126] mb-2"
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
                        className="w-[190px] h-[44px] pl-4 pr-4 py-2.5 border border-[#1B1717]/80 rounded-lg text-sm bg-white text-[#1B1717] placeholder:text-[#1B1717]/80  focus:outline-none transition"
                      />
                    </div>
                  </div>
                  <div className="relative flex-1">
                    <label
                      htmlFor="toDate"
                      className="block text-[10px] sm:text-xs md:text-sm font-[Gilroy-Medium] text-[#12126] mb-2"
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
                        className="w-[190px] h-[44px] pl-4 pr-4 py-2.5 border border-[#1B1717]/80 rounded-lg text-sm bg-white text-[#1B1717] placeholder:text-[#1B1717]/80  focus:outline-none transition"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-3xl shadow overflow-hidden ">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="border-b border-[#1B1717]/50">
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
                  <tbody className="bg-white divide-y divide-[#1B1717]/20">
                    {servicesData.map((service, index) => (
                      <tr
                        key={index}
                        className={`transition-colors ${index % 2 === 0 ? "bg-[#F0F9F4]" : "bg-white"
                          }`}
                      >
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span className="text-[10px] font-['Gilroy-SemiBold'] text-[#121216]">
                            {service.service}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                          <span className="text-[10px] font-['Gilroy-Regular'] text-[#121216]">
                            {service.txnVolume.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                          <span className="text-[10px] font-['Gilroy-Regular'] text-[#121216]">
                            {service.txnCount.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                          <span className="text-[10px] font-['Gilroy-semibold'] text-[#039155]">
                            {service.success.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                          <span className="text-[10px] font-['Gilroy-semibold'] text-[#D66000]">
                            {service.pending.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                          <span className="text-[10px] font-['Gilroy-semibold'] text-[#E32424]">
                            {service.failed === 0
                              ? "000"
                              : service.failed.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2 ">
                            <div className="w-[54px] h-[7px] bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="bg-[#039155] h-full rounded-full transition-all duration-500"
                                style={{ width: `${service.successRate}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-['Gilroy-SemiBold'] leading-[100%] tracking-[0%] align-middle capitalize text-[#121216] min-w-[35px] sm:min-w-[45px] ">
                              {service.successRate.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {/* Total Row */}
                    <tr className=" border-t-2 border-gray-300">
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <span className="text-[14px] font-['Gilroy-SemiBold'] text-[#121216]">
                          Total
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                        <span className="text-[14px] font-['Gilroy-SemiBold'] text-[#121216]">
                          {totals.txnVolume.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                        <span className="text-[14px] font-['Gilroy-semibold'] text-[#121216]">
                          {totals.txnCount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                        <span className="text-[14px] font-['Gilroy-semibold'] text-[#039155]">
                          {totals.success.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                        <span className="text-[14px] font-['Gilroy-semibold'] text-[#D66000]">
                          {totals.pending.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                        <span className="text-[14px] font-['Gilroy-semibold'] text-[#E32424]">
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
          </>
        )}
      </div>
    </div>
  );
};

export default BusinessReport;
