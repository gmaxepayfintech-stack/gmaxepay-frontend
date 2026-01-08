import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Wallet, Users, CreditCard, Tag } from "lucide-react";
import { getAlsWallet } from "../../redux/action/walletAction";
import {
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
const MasterDt = "/img/MasterDt.png";
const Distributor = "/img/Distributor.png";
const Ratailer = "/img/Retailer.png";
const Comission = "/img/Comission.png";
const TotalCharges = "/img/TotalCharges.png";
const Revenue = "/img/Revenue.png";
const Transactions = "/img/Transactions.png";
const OpeningBalance = "/img/OpeningBalance.png";
const FundTransfer = "/img/FundTransfer.png";
const ExpectedAmount = "/img/ExpectedAmount.png";
const Refund = "/img/Refund.png";
const FundDetected = "/img/FundDetected.png";
const Subcharges = "/img/Subcharges.png";
const OtherCharges = "/img/OtherCharges.png";
const TotalRevenue = "/img/TotalRevenue.png";

const SuperAdmin = () => {
  const dispatch = useDispatch();
  const [selectedDay, setSelectedDay] = useState("Sun");
  const [alsOpeningBalance, setAlsOpeningBalance] = useState(null);

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Get wallet data from Redux
  const alsWalletResponse = useSelector((state) => state?.wallet?.alsWallet);
  const isLoading = useSelector((state) => state?.loading?.isLoading || false);

  // Update opening balance when wallet data is fetched
  useEffect(() => {
    if (alsWalletResponse?.data?.data?.openingBalance) {
      setAlsOpeningBalance(alsWalletResponse.data.data.openingBalance);
    }
  }, [alsWalletResponse]);

  const data = [
    { name: "Rupaisa", value: 400 },
    { name: "", value: 900 },
    { name: "", value: 650 },
    { name: "Asl", value: 1300 },
    { name: "", value: 1600 },
    { name: "Inspay", value: 1250 },
    { name: "", value: 1900 },
    { name: "JRI", value: 1000 },
    { name: "", value: 850 },
    { name: "Bconnect", value: 550 },
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
    <div className="p-4 sm:p-6  min-h-screen text-[#1B1717] space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow p-4 sm:p-6">
          {/* Header Section */}
          <div className="flex flex-col gap-3 mb-4">
            <h2 className="text-2xl font-medium text-[#1B1717]">
              Today Earning
            </h2>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <p className="text-xl sm:text-2xl font-bold text-[#1B1717]">
                  ₹4,21,40,238
                </p>
                <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                  ▲ $40,238 (4.61%)
                </span>
              </div>

              {/* Weekday Buttons */}
              <div className="flex flex-wrap gap-2 justify-end">
                {days.map((day) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`px-3 py-1 border rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      selectedDay === day
                        ? "bg-green-600 text-white border-green-600"
                        : "border-gray-300 text-[#1B1717] hover:border-green-400 hover:text-green-700"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="w-full h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a7f3d0" stopOpacity={0.8} />
                    <stop offset="50%" stopColor="#6ee7b7" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#d1fae5" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  horizontal
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  domain={[0, 2000]}
                  ticks={[100, 500, 1000, 1500, 2000]}
                />
                <Area
                  type="linear"
                  dataKey="value"
                  stroke="none"
                  fill="#03915533"
                  fillOpacity={1}
                />
                <Area
                  type="linear"
                  dataKey="value"
                  stroke="#10b981"
                  strokeWidth={3}
                  fill="url(#colorValue)"
                  dot={{
                    fill: "#fff",
                    stroke: "#10b981",
                    strokeWidth: 3,
                    r: 6,
                  }}
                  activeDot={{
                    fill: "#10b981",
                    stroke: "#fff",
                    strokeWidth: 3,
                    r: 7,
                  }}
                />
              </AreaChart>
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
            {[...Array(6)].map((_, i) => {
              const isAslWallet = i === 0;
              const walletName = isAslWallet ? "ASL" : `Rupaisa Pay Wallet ${i + 1}`;
              const displayBalance = isAslWallet && alsOpeningBalance 
                ? `₹${parseFloat(alsOpeningBalance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : "$4,21,40,238";

              return (
                <div
                  key={i}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-3 sm:p-4 flex flex-col justify-between hover:shadow-md transition cursor-pointer"
                  onClick={() => {
                    if (isAslWallet) {
                      dispatch(getAlsWallet());
                    }
                  }}
                >
                  <p className="font-md text-[#1B1717] text-xl mb-1">
                    {walletName}
                  </p>
                  <p className="text-[#1B1717] font-semibold text-sm sm:text-lg">
                    {isLoading && isAslWallet ? "Loading..." : displayBalance}
                  </p>
                  <button 
                    className="mt-3 text-xs sm:text-sm w-full bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isAslWallet) {
                        dispatch(getAlsWallet());
                      }
                    }}
                    disabled={isLoading && isAslWallet}
                  >
                    {isLoading && isAslWallet ? "Loading..." : "Refresh"}
                  </button>
                </div>
              );
            })}
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
