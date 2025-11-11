import { Wallet, Users, CreditCard, Tag } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import MasterDt from "../../../public/img/MasterDt.png";
import Distributor from "../../../public/img/Distributor.png";
import Ratailer from "../../../public/img/Retailer.png";
import Comission from "../../../public/img/Comission.png";
import TotalCharges from "../../../public/img/TotalCharges.png";
import Revenue from "../../../public/img/Revenue.png";
import Transactions from "../../../public/img/Transactions.png";
import OpeningBalance from "../../../public/img/OpeningBalance.png";
import FundTransfer from "../../../public/img/FundTransfer.png";
import ExpectedAmount from "../../../public/img/ExpectedAmount.png";
import Refund from "../../../public/img/Refund.png";
import FundDetected from "../../../public/img/FundDetected.png";
import Subcharges from "../../../public/img/Subcharges.png";
import OtherCharges from "../../../public/img/OtherCharges.png";
import TotalRevenue from "../../../public/img/TotalRevenue.png";

const SuperAdmin = () => {
  const data = [
    { name: "Rajapur", earning: 500 },
    { name: "Jal", earning: 1000 },
    { name: "Heprey", earning: 1800 },
    { name: "Jill", earning: 1500 },
    { name: "Bommarek", earning: 900 },
  ];

  const summaryItems = [
    {
      label: "Total Revenue",
      value: "$4,21,40,238",
      change: "▲ 4.61%",
      icon: Revenue,
      bg: "bg-[#FFEFE7]", // Light peach
    },
    {
      label: "Commission",
      value: "$42,04,100",
      change: "▼ 4.61%",
      icon: Comission,
      bg: "bg-[#ECF2FF]", // Light blue
    },
    {
      label: "Successful Transactions",
      value: "9",
      change: "▲ 4.61%",
      icon: Transactions,
      bg: "bg-[#E6FAEE]", // Light green
    },
    {
      label: "Total Charges",
      value: "$4,21,40,238",
      change: "▲ 4.61%",
      icon: TotalCharges,
      bg: "bg-[#FFF7EB]", // Light orange
    },
  ];

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen text-[#1B1717] space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow p-4 sm:p-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-wrap sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
            <h2 className="text-2xl font-medium text-[#1B1717]">
              Today Earning
            </h2>

            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xl sm:text-2xl font-bold text-[#1B1717]">
                ₹4,21,40,238
              </p>
              <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                ▲ $40,238 (4.61%)
              </span>
            </div>

            {/* Weekday Buttons */}
            <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <button
                  key={day}
                  className={`px-3 py-1 border rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    day === "Sun"
                      ? "bg-green-600 text-white border-green-600"
                      : "border-gray-300 text-[#1B1717] hover:bg-green-100 hover:text-green-700"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Chart Section */}
          <div className="w-full h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="earning"
                  stroke="#16a34a"
                  strokeWidth={2}
                  dot={{ r: 5, fill: "#16a34a" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ===== Right: Wallets ===== */}
        <div className="space-y-4">
          {[
            {
              title: "Main Wallet",
              icon: Wallet,
              color: "text-green-600",
            },
            {
              title: "AEPS Wallet",
              icon: CreditCard,
              color: "text-green-600",
            },
          ].map(({ title, icon: Icon, color }, i) => (
            <div
              key={i}
              className="bg-green-100 p-5 rounded-2xl shadow hover:shadow-lg transition"
            >
              <h3 className="text-lg sm:text-xl font-medium flex items-center gap-2">
                <Icon className={`w-5 h-5 ${color}`} />
                {title}
              </h3>
              <p className="text-2xl font-bold mt-2">₹4,21,40,238</p>
              <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                ▲ (4.61%)
              </span>
              <p className="text-xs sm:text-sm text-[#1B1717] mb-3">
                Your revenue is <span className="font-bold ">$200</span> for
                this week
              </p>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg w-full text-sm">
                Payment History
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow p-4 sm:p-6">
          <h3 className="font-semiboldtext-[#1B1717] text-2xl mb-4">
            Overall Wallets
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-50 border border-gray-200 rounded-xl p-3 sm:p-4 flex flex-col justify-between hover:shadow-md transition"
              >
                <p className="font-md text-[#1B1717] text-xl  mb-1">
                  Rupaisa Pay Wallet {i + 1}
                </p>
                <p className="text-[#1B1717] font-semibold text-sm sm:text-lg">
                  $4,21,40,238
                </p>
                <button className="mt-3 text-xs sm:text-sm w-full bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg transition-colors">
                  Refresh
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ===== Right: Quick Action Buttons ===== */}
        <div className="bg-white rounded-2xl shadow p-4 sm:p-6">
          <h3 className="font-md text-[#1B1717] text-2xl mb-5">
            Quick Action Buttons
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-3 gap-6 text-center">
            {[
              { type: "icon", icon: Users, label: "Employee" },
              { type: "icon", icon: Tag, label: "Whitelabel" },
              { type: "img", src: MasterDt, label: "Master DT" },
              { type: "img", src: Distributor, label: "Distributor" },
              { type: "img", src: Ratailer, label: "Retailer" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center space-y-4">
                <div className="bg-[#00824B] w-16 h-16 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform duration-200">
                  {item.type === "icon" ? (
                    <item.icon className="text-white w-8 h-8" />
                  ) : (
                    <img
                      src={item.src}
                      alt={item.label}
                      className="w-9 h-9 object-contain"
                    />
                  )}
                </div>
                <span className="text-md font-medium text-[#1B1717]">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== Today's Summary & Details Matrix ===== */}
      <div className="bg-white p-4 gap-2 sm:p-6 rounded-2xl shadow">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div className="">
            <h3 className="font-medium text-xl text-[#1B1717]">
              Todays Summary
            </h3>
            <p className="text-md text-[#1B1717] opacity-80 mt-3">
              Track Your Financial Metrics and Performance
            </p>
          </div>
          <div className="flex items-center justify-between gap-4 mt-2 md:mt-0 bg-white border border-[#1B1717] border-opacity-80 rounded-s-xl rounded-e-xl px-2 py-2">
            {["Today", "Weekly", "Monthly", "Yearly"].map((label) => (
              <button
                key={label}
                className={`w-[90px] py-2 rounded-md text-sm font-medium transition-all ${
                  label === "Today"
                    ? "bg-[#00A651] text-white"
                    : "text-[#1B1717] hover:bg-gray-100"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {summaryItems.map((item, i) => (
            <div
              key={i}
              className={`p-4 rounded-xl border hover:shadow transition flex flex-col items-start ${item.bg}`}
            >
              <img
                src={item.icon}
                alt={item.label}
                className="w-12 h-12 mb-2 "
              />
              <div className="flex justify-between items-center w-full mb-2">
                <p className="text-[#1B1717] text-md font-medium">
                  {item.label}
                </p>
                <span
                  className={`text-xs font-semibold ${
                    item.change.startsWith("▲")
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {item.change}
                </span>
              </div>
              <p className="text-sm sm:text-xl font-bold text-gray-900">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Details Matrix */}
        <h3 className="font-medium text-xl text-[#1B1717]">Details Matrix</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 mt-5 gap-4 sm:gap-4">
          {[
            { label: "Opening Balance", value: "5", icon: OpeningBalance },
            {
              label: "Fund Transfer",
              value: "$4,21,40,238",
              icon: FundTransfer,
            },
            {
              label: "Expected Amount",
              value: "$4,21,40,238",
              icon: ExpectedAmount,
            },
            { label: "Refund", value: "4", icon: Refund },
            { label: "Fund Deducted", value: "$42,038", icon: FundDetected },
            { label: "Surcharges", value: "$30,238", icon: Subcharges },
            { label: "Other Charges", value: "$238", icon: OtherCharges },
            {
              label: "Total Revenue",
              value: "$4,21,40,238",
              icon: TotalRevenue,
            },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between border border-[#1B1717] border-opacity-30 rounded-xl p-3 sm:p-4 bg-white hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-lg  flex items-center justify-center">
                  <img
                    src={item.icon}
                    alt={item.label}
                    className="w-[40px] h-[40px]"
                  />
                </span>
                <div>
                  <p className="text-xs sm:text-sm text-[#1B1717]">
                    {item.label}
                  </p>
                  <p className="font-semibold text-[#1B1717] mt-1 text-sm sm:text-base">
                    {item.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SuperAdmin;
