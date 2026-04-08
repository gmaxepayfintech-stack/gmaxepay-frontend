import { useState, useEffect, useRef } from "react";
import {
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  Tooltip,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../context/NotificationContext";
import { FiChevronDown, FiRefreshCw } from "react-icons/fi";

const EmployeeDash = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [payoutOpen, setPayout] = useState(false);
  const [amount, setAmount] = useState("1000");
  const [selectedBank, setSelectedBank] = useState("1");
  const scrollYRef = useRef(0);
  const [refreshingWallet, setRefreshingWallet] = useState(null);

  // Overall wallets list matching image design
  const overallWallets = [
    { id: 1,  name: "Rupaisa Pay Wallet", balance: 42140238 },
    { id: 2,  name: "Rupaisa Pay Wallet", balance: 42140238 },
    { id: 3,  name: "Rupaisa Pay Wallet", balance: 42140238 },
    { id: 4,  name: "Rupaisa Pay Wallet", balance: 42140238 },
    { id: 5,  name: "Rupaisa Pay Wallet", balance: 42140238 },
    { id: 6,  name: "Rupaisa Pay Wallet", balance: 42140238 },
    { id: 7,  name: "Rupaisa Pay Wallet", balance: 42140238 },
    { id: 8,  name: "Rupaisa Pay Wallet", balance: 42140238 },
    { id: 9,  name: "Rupaisa Pay Wallet", balance: 42140238 },
    { id: 10, name: "Rupaisa Pay Wallet", balance: 42140238 },
    { id: 11, name: "Rupaisa Pay Wallet", balance: 42140238 },
    { id: 12, name: "Rupaisa Pay Wallet", balance: 42140238 },
  ];

  // Main wallet & AEPS data
  const [walletData] = useState({
    mainWallet: 42140238,
    aeps1: 4200.00,
    aeps2: 8900.50,
  });

  const [isWalletLoading, setIsWalletLoading] = useState(true);
  const [selectedAepsWallet, setSelectedAepsWallet] = useState("aeps2");

  const AEPS_LABELS = {
    aeps1: "AEPS Wallet 1",
    aeps2: "AEPS Wallet 2",
  };

  // Mock banks list
  const banks = [
    { id: "1", name: "State Bank of India", accountNumber: "XXXXXX1234" },
    { id: "2", name: "HDFC Bank",           accountNumber: "XXXXXX5678" },
    { id: "3", name: "ICICI Bank",          accountNumber: "XXXXXX9012" },
  ];

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => setIsWalletLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Format with decimals (for smaller amounts)
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return "₹0.00";
    const numValue = parseFloat(value) || 0;
    return `₹${numValue.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Format integer amounts (like in the image: ₹4,21,40,238)
  const formatAmount = (value) => {
    if (value === null || value === undefined) return "₹0";
    return `₹${parseFloat(value).toLocaleString("en-IN")}`;
  };

  const handleRefreshWallet = async (walletId) => {
    setRefreshingWallet(walletId);
    await new Promise((r) => setTimeout(r, 800));
    setRefreshingWallet(null);
  };

  const totalCommission = 1450.25;
  const weeklyRevenue = 200;

  const chartData = [
    { name: "AEPS 1",    value: 12500 },
    { name: "AEPS 2",    value: 18400 },
    { name: "BBPS",      value: 8500  },
    { name: "Mobile",    value: 4200  },
    { name: "DTH",       value: 2100  },
    { name: "NSDL PAN",  value: 1500  },
    { name: "Payout",    value: 35000 },
  ];

  const transactionData = [
    { service: "AEPS 1",   volume: 12500, success: 45,  failed: 2,  pending: 1 },
    { service: "AEPS 2",   volume: 18400, success: 62,  failed: 5,  pending: 0 },
    { service: "BBPS",     volume: 8500,  success: 120, failed: 8,  pending: 3 },
    { service: "Mobile",   volume: 4200,  success: 85,  failed: 12, pending: 0 },
    { service: "DTH",      volume: 2100,  success: 32,  failed: 1,  pending: 0 },
    { service: "NSDL PAN", volume: 1500,  success: 15,  failed: 0,  pending: 2 },
    { service: "Payout",   volume: 35000, success: 28,  failed: 1,  pending: 1 },
  ];

  const quickServices = [
    { name: "AEPS 1",   icon: "/img/AEPS.svg",           amount: formatCurrency(12500) },
    { name: "AEPS 2",   icon: "/img/AEPS.svg",           amount: formatCurrency(18400) },
    { name: "BBPS",     icon: "/img/BBPS.svg",           amount: formatCurrency(8500)  },
    { name: "Mobile",   icon: "/img/MobileRecharge.svg", amount: formatCurrency(4200)  },
    { name: "DTH",      icon: "/img/DTH1.svg",           amount: formatCurrency(2100)  },
    { name: "NSDL PAN", icon: "/img/PanCorrection.svg",  amount: formatCurrency(1500)  },
    { name: "Payout",   icon: "/img/DMT.svg",            amount: formatCurrency(35000) },
  ];

  const handleProcessTransfer = () => {
    showNotification({
      type: "success",
      message: "Transfer request successfully processed",
      isCritical: true,
    });
    setPayout(false);
  };

  // Body scroll lock for modal
  useEffect(() => {
    if (payoutOpen) {
      scrollYRef.current = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollYRef.current}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
    } else {
      const scrollY = scrollYRef.current;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "unset";
      window.scrollTo(0, scrollY);
    }
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "unset";
    };
  }, [payoutOpen]);

  // ─── Skeleton ───────────────────────────────────────────────────────────────
  if (isWalletLoading) {
    return (
      <div className="min-h-screen text-[#1B1717] space-y-4 sm:space-y-6 py-4">
        <div className="bg-white rounded-xl shadow-sm p-5 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-40 mb-5" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl p-4 space-y-3">
                <div className="h-3 bg-gray-200 rounded w-3/4" />
                <div className="h-5 bg-gray-200 rounded w-full" />
                <div className="h-8 bg-gray-200 rounded-full w-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gray-100 rounded-xl p-5 w-full max-w-xs animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-28 mb-3" />
          <div className="h-8 bg-gray-200 rounded w-40 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-24 mb-4" />
          <div className="h-10 bg-gray-200 rounded-full" />
        </div>
      </div>
    );
  }

  // ─── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen text-[#1B1717] space-y-4 sm:space-y-6 py-1">

      {/* ── Overall Wallets ── */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 lg:p-6">
        <h3 className="text-xl sm:text-2xl font-[Gilroy-Medium] text-[#1B1717] mb-5">
          Overall Wallets
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {overallWallets.map((wallet) => (
            <div
              key={wallet.id}
              className="bg-white border border-gray-100 rounded-xl p-3 sm:p-4 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow"
            >
              <p className="text-xs sm:text-sm font-[Gilroy-Medium] text-[#1B1717] leading-snug">
                {wallet.name}
              </p>
              <p className="text-sm sm:text-[15px] font-[Gilroy-Semibold] text-[#1B1717]">
                {formatAmount(wallet.balance)}
              </p>
              <button
                onClick={() => handleRefreshWallet(wallet.id)}
                className="flex items-center justify-center gap-1.5 bg-[#039155] hover:bg-[#027a47] text-white text-xs font-[Gilroy-Semibold] py-1.5 rounded-full transition-colors w-full"
              >
                <FiRefreshCw
                  className={`text-[11px] ${
                    refreshingWallet === wallet.id ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main Wallet Card (image style) ── */}
      <div>
        <div className="bg-[#E8FBF3] rounded-xl p-5 lg:p-6 w-full sm:max-w-xs flex flex-col gap-2">
          <h4 className="text-xl font-[Gilroy-Medium] text-[#1B1717]">Main Wallet</h4>
          <p className="text-2xl lg:text-[30px] font-[Gilroy-Semibold] text-[#1B1717]">
            {formatAmount(walletData.mainWallet)}
          </p>
          <p className="text-[#039155] text-xs font-[Gilroy-Semibold] flex items-center gap-1">
            ▲ 4.61%
          </p>
          <p className="text-xs sm:text-sm text-[#1B1717]/70 font-[Gilroy-Medium]">
            Your Revenue Is{" "}
            <strong className="text-[#1B1717] font-[Gilroy-Semibold]">
              ${weeklyRevenue}
            </strong>{" "}
            For This Week
          </p>
          <button className="mt-1 w-full bg-[#039155] hover:bg-[#027a47] text-white py-2.5 rounded-full font-[Gilroy-Semibold] text-sm transition-colors">
            Payment History
          </button>
        </div>
      </div>

      {/* ── Chart & AEPS Wallets ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {/* Bar chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-3 sm:p-4 lg:p-6 h-full flex flex-col">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
            <h3 className="text-lg sm:text-xl lg:text-[24px] font-[Gilroy-Medium] text-[#1B1717]">
              Recent Activity
            </h3>
            <button className="px-3 py-1.5 text-[10px] sm:text-xs font-[Gilroy-Medium] rounded-2xl text-[#1B1717]/80 border-[0.5px] border-[#1B1717]/80 transition w-full sm:w-auto">
              Today
            </button>
          </div>

          <div className="mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
              <p className="text-lg sm:text-xl lg:text-2xl font-[Gilroy-Semibold] text-[#1B1717]">
                {formatCurrency(totalCommission)}
              </p>
              <span className="text-[#039155] text-[10px] sm:text-xs font-[Gilroy-Medium]">
                ▲ +0.24% Today
              </span>
            </div>
          </div>

          <div className="flex-1 w-full overflow-x-auto">
            <div className="h-full min-h-[320px] min-w-[600px] sm:min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  barCategoryGap="15%"
                  margin={{ top: 5, right: 10, left: 5, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "#1B1717", fontFamily: "gilroy-medium" }}
                    height={60}
                    interval={0}
                    tickMargin={8}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#1B1717" }}
                    domain={[0, Math.max(1, Math.max(...chartData.map((d) => d.value || 0)) * 1.5)]}
                    width={40}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={false}
                    formatter={(value) => [formatCurrency(value), "Volume"]}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "14px",
                    }}
                    wrapperStyle={{ outline: "none" }}
                  />
                  <Bar dataKey="value" fill="#039155" radius={[8, 8, 0, 0]} barSize={43} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Wallet cards on right */}
        <div className="flex flex-col gap-3 sm:gap-4 lg:gap-5 h-full">
          {/* Main wallet */}
          <div className="bg-[#4FF2AD]/20 rounded-xl shadow-sm p-4 lg:p-5 flex-1 flex flex-col justify-between">
            <div>
              <h4 className="text-[24px] font-[Gilroy-Medium] text-[#1B1717] mb-3">Main Wallet</h4>
              <p className="text-2xl lg:text-[28px] font-[Gilroy-Semibold] text-[#1B1717] mb-2">
                {formatCurrency(walletData.mainWallet)}
              </p>
              <p className="text-[14px] text-[#1B1717]/80 font-[Gilroy-Medium]">
                Today Earning:{" "}
                <strong className="text-[#1B1717] font-[Gilroy-Semibold]">
                  {formatCurrency(totalCommission)}
                </strong>
              </p>
            </div>
            <button className="w-full bg-[#039155] hover:bg-[#027a47] text-white py-2 lg:py-2.5 rounded-xl font-[Gilroy-Semibold] text-sm lg:text-base transition">
              View History
            </button>
          </div>

          {/* AEPS wallet */}
          <div className="bg-[#4FF2AD]/20 rounded-xl shadow-sm p-4 lg:p-5 flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[24px] font-[Gilroy-Medium] text-[#1B1717]">
                {AEPS_LABELS[selectedAepsWallet]}
              </h4>
              <div className="relative">
                <select
                  value={selectedAepsWallet}
                  onChange={(e) => setSelectedAepsWallet(e.target.value)}
                  className="appearance-none border border-[#039155] rounded-2xl pl-3 pr-8 py-1 text-xs font-[Gilroy-Semibold] bg-[#4FF2AD]/10 text-[#1B1717] focus:outline-none cursor-pointer"
                >
                  <option value="aeps1">AEPS 1</option>
                  <option value="aeps2">AEPS 2</option>
                </select>
                <FiChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#1B1717] text-sm" />
              </div>
            </div>
            <p className="text-2xl lg:text-[28px] font-[Gilroy-Semibold] text-[#1B1717] mb-2">
              {formatCurrency(walletData[selectedAepsWallet])}
            </p>
            <button
              className="w-full bg-[#039155] hover:bg-[#027a47] text-white py-2 lg:py-2.5 rounded-xl font-[Gilroy-Semibold] text-sm lg:text-base transition"
              onClick={() => setPayout(true)}
            >
              Wallet Transfer
            </button>
          </div>
        </div>
      </div>

      {/* ── Quick Access Services ── */}
      <div className="py-3">
        <h3 className="text-lg sm:text-xl lg:text-[24px] font-[Gilroy-Medium] text-[#1B1717] mb-4">
          Quick Access Services
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {quickServices.map((service, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-3 sm:p-4 flex items-start gap-4 hover:shadow-md transition cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-[#E2FAF0] flex items-center justify-center shrink-0">
                <img src={service.icon} alt={service.name} className="w-6 h-6 object-contain" />
              </div>
              <div>
                <p className="text-sm font-[Gilroy-Medium] text-[#1B1717]">{service.name}</p>
                <p className="text-base font-[Gilroy-Semibold] text-[#1B1717] mt-1">{service.amount}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Recent Performance Table ── */}
      <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 lg:p-6">
        <h3 className="text-2xl font-[Gilroy-Medium] text-[#1B1717] mb-4">Recent Performance</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b bg-[#FAFAFA]">
                <th className="text-left py-3 px-4 text-xs font-[Gilroy-Medium] text-[#1B1717]">Service</th>
                <th className="text-center py-3 px-4 text-xs font-[Gilroy-Medium] text-[#1B1717]">Volume</th>
                <th className="text-center py-3 px-4 text-xs font-[Gilroy-Medium] text-[#1B1717]">Success</th>
                <th className="text-center py-3 px-4 text-xs font-[Gilroy-Medium] text-[#1B1717]">Failed</th>
                <th className="text-center py-3 px-4 text-xs font-[Gilroy-Medium] text-[#1B1717]">Pending</th>
              </tr>
            </thead>
            <tbody>
              {transactionData.map((row, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="py-3 px-4 text-xs font-[Gilroy-Semibold]">{row.service}</td>
                  <td className="py-3 px-4 text-xs text-center">{formatCurrency(row.volume)}</td>
                  <td className="py-3 px-4 text-xs text-center text-[#039155] font-[Gilroy-Semibold]">{row.success}</td>
                  <td className="py-3 px-4 text-xs text-center text-[#D66000] font-[Gilroy-Semibold]">{row.failed}</td>
                  <td className="py-3 px-4 text-xs text-center text-[#E32424] font-[Gilroy-Semibold]">{row.pending}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Wallet Transfer Modal ── */}
      {payoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 relative">
            <button
              onClick={() => setPayout(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <h2 className="text-2xl font-[Gilroy-Medium] mb-6">Wallet Transfer</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-[Gilroy-Medium] mb-2">Amount</label>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:border-[#039155]"
                />
              </div>
              <div>
                <label className="block text-sm font-[Gilroy-Medium] mb-2">Select Bank</label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:border-[#039155] appearance-none"
                >
                  {banks.map((bank) => (
                    <option key={bank.id} value={bank.id}>
                      {bank.name} - {bank.accountNumber}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              className="w-full bg-[#039155] text-white py-3 rounded-xl font-[Gilroy-Semibold] hover:opacity-90 transition"
              onClick={handleProcessTransfer}
            >
              Process Transfer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDash;