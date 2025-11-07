import React from "react";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  CreditCard,
  BarChart3,
  Briefcase,
  TrendingUp,
  FileText,
  Send,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const data = [
  { name: "Jul", earning: 4000 },
  { name: "Aug", earning: 6500 },
  { name: "Sep", earning: 5200 },
  { name: "Oct", earning: 8200 },
  { name: "Nov", earning: 6100 },
];

const SuperAdmin = () => {
  return (
    <div className="p-6 bg-[#F5F7F8] min-h-screen font-[Gilroy-Medium]">
      {/* Top Section */}
      <div className="grid grid-cols-12 gap-6 mb-6">
        {/* Chart Section */}
        <div className="col-span-8 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-[#1B1717]">
              Today Earning
            </h2>
            <span className="text-sm text-green-600 font-medium">+3.25% ▲</span>
          </div>

          <h3 className="text-2xl font-bold text-[#039155] mb-4">
            ₹ 4,21,40,238
          </h3>

          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="earning"
                stroke="#039155"
                strokeWidth={3}
                dot={{ fill: "#039155", r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Wallet Summary */}
        <div className="col-span-4 space-y-4">
          <div className="bg-white p-5 rounded-2xl border shadow-sm">
            <h3 className="text-gray-600 font-medium">Main Wallet</h3>
            <p className="text-2xl font-bold text-[#039155] mt-1">
              ₹4,21,40,238
            </p>
            <p className="text-sm text-gray-500 mt-1">
              You earned ₹3,000 this week
            </p>
            <button className="mt-3 w-full bg-[#039155] text-white py-2 rounded-xl hover:bg-[#027d4a] transition">
              Payment History
            </button>
          </div>

          <div className="bg-white p-5 rounded-2xl border shadow-sm">
            <h3 className="text-gray-600 font-medium">AEPS Wallet</h3>
            <p className="text-2xl font-bold text-[#039155] mt-1">
              ₹4,21,40,238
            </p>
            <button className="mt-3 w-full bg-[#039155] text-white py-2 rounded-xl hover:bg-[#027d4a] transition">
              Payment History
            </button>
          </div>
        </div>
      </div>

      {/* Overall Wallets */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { name: "Retailer Pay Wallet", value: "₹1,72,42,238" },
          { name: "Distributor Pay Wallet", value: "₹3,21,40,238" },
          { name: "Reseller Pay Wallet", value: "₹2,41,40,238" },
          { name: "Master Pay Wallet", value: "₹5,21,40,238" },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-2xl border shadow-sm hover:shadow-md transition"
          >
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-gray-600 text-sm">{item.name}</h4>
                <p className="text-xl font-bold text-[#039155] mt-1">
                  {item.value}
                </p>
              </div>
              <Wallet className="w-6 h-6 text-[#039155]" />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-6 gap-4 mb-6">
        {[
          { label: "Employee", icon: Users },
          { label: "Withdrawal", icon: ArrowDownRight },
          { label: "Fund", icon: Briefcase },
          { label: "Report", icon: FileText },
          { label: "Delivery", icon: Send },
          { label: "Member DT", icon: BarChart3 },
        ].map(({ label, icon: Icon }, index) => (
          <button
            key={index}
            className="flex flex-col items-center justify-center bg-white p-4 rounded-2xl border shadow-sm hover:shadow-md transition"
          >
            <Icon className="w-7 h-7 text-[#039155] mb-2" />
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* Today’s Summary */}
      <div className="bg-white p-5 rounded-2xl border shadow-sm mb-6">
        <h3 className="text-lg font-semibold mb-4">Today's Summary</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              title: "Total Transactions",
              value: "₹4,21,40,238",
              color: "text-[#039155]",
            },
            {
              title: "Successful Transactions",
              value: "₹4,20,00,000",
              color: "text-green-600",
            },
            {
              title: "Failed Transactions",
              value: "₹1,40,238",
              color: "text-red-500",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition text-center"
            >
              <h4 className="text-gray-600 text-sm">{item.title}</h4>
              <p className={`text-xl font-semibold mt-1 ${item.color}`}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Details Matrix */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { title: "Pending Balance", value: "₹1,21,40,238" },
          { title: "Fund Transfer", value: "₹2,21,40,238" },
          { title: "Expected Amount", value: "₹3,21,40,238" },
          { title: "Cheque Charges", value: "₹25,000" },
          { title: "Fund Deducted", value: "₹4,21,40,238" },
          { title: "Success Amount", value: "₹5,21,40,238" },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-2xl border shadow-sm hover:shadow-md transition"
          >
            <h4 className="text-gray-600 text-sm">{item.title}</h4>
            <p className="text-xl font-bold text-[#039155] mt-1">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuperAdmin;
