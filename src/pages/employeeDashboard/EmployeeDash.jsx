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
import { FiChevronDown } from "react-icons/fi";

const DistributorIcon = "/img/DistributorM.png";
const EarningIcon = "/img/Earning.png";

const EmployeeDash = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [payoutOpen, setPayout] = useState(false);
  const [amount, setAmount] = useState("1000");
  const [selectedBank, setSelectedBank] = useState("1");
  const scrollYRef = useRef(0);

  // Mock Data for Wallet
  const [walletData] = useState({
    mainWallet: 25450.75,
    aeps1: 4200.00,
    aeps2: 8900.50,
  });

  const [isWalletLoading, setIsWalletLoading] = useState(true);
  const [selectedAepsWallet, setSelectedAepsWallet] = useState("aeps2");

  const AEPS_LABELS = {
    aeps1: "AEPS Wallet 1",
    aeps2: "AEPS Wallet 2",
  };

  // Mock Banks List
  const banks = [
    { id: "1", name: "State Bank of India", logo: "", accountNumber: "XXXXXX1234", ifscCode: "SBIN0001234" },
    { id: "2", name: "HDFC Bank", logo: "", accountNumber: "XXXXXX5678", ifscCode: "HDFC0005678" },
    { id: "3", name: "ICICI Bank", logo: "", accountNumber: "XXXXXX9012", ifscCode: "ICIC0009012" },
  ];

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsWalletLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Format number with Indian locale
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return "₹0.00";
    const numValue = parseFloat(value) || 0;
    return `₹${numValue.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Static Mock Data for Dashboard Features
  const totalCommission = 1450.25;

  const chartData = [
    { name: "AEPS 1", value: 12500 },
    { name: "AEPS 2", value: 18400 },
    { name: "BBPS", value: 8500 },
    { name: "Mobile", value: 4200 },
    { name: "DTH", value: 2100 },
    { name: "NSDL PAN", value: 1500 },
    { name: "Payout", value: 35000 },
  ];

  const transactionData = [
    { service: "AEPS 1", volume: 12500, success: 45, failed: 2, pending: 1 },
    { service: "AEPS 2", volume: 18400, success: 62, failed: 5, pending: 0 },
    { service: "BBPS", volume: 8500, success: 120, failed: 8, pending: 3 },
    { service: "Mobile", volume: 4200, success: 85, failed: 12, pending: 0 },
    { service: "DTH", volume: 2100, success: 32, failed: 1, pending: 0 },
    { service: "NSDL PAN", volume: 1500, success: 15, failed: 0, pending: 2 },
    { service: "Payout", volume: 35000, success: 28, failed: 1, pending: 1 },
  ];

  const quickServices = [
    { name: "AEPS 1", icon: "/img/AEPS.svg", amount: formatCurrency(12500) },
    { name: "AEPS 2", icon: "/img/AEPS.svg", amount: formatCurrency(18400) },
    { name: "BBPS", icon: "/img/BBPS.svg", amount: formatCurrency(8500) },
    { name: "Mobile", icon: "/img/MobileRecharge.svg", amount: formatCurrency(4200) },
    { name: "DTH", icon: "/img/DTH1.svg", amount: formatCurrency(2100) },
    { name: "NSDL PAN", icon: "/img/PanCorrection.svg", amount: formatCurrency(1500) },
    { name: "Payout", icon: "/img/DMT.svg", amount: formatCurrency(35000) },
  ];

  const kpiCards = [
    { title: "Retailers", value: "124", subtitle: "Today Member + 5", icon: DistributorIcon },
    { title: "Today's Earning", value: formatCurrency(totalCommission), subtitle: "Today's Earning", icon: EarningIcon },
    { title: "Active Services", value: "7", subtitle: "Running smoothly", icon: EarningIcon },
  ];

  const handlePayout = () => {
    setPayout(true);
  };

  const handleProcessTransfer = () => {
    showNotification("Transfer request successfully processed (Mock)", "success");
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

  const SkeletonLoader = () => (
    <div className="min-h-screen text-[#1B1717] space-y-4 sm:space-y-6 py-4 px-1-dashboard">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-md p-3 sm:p-4 lg:p-5 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-36"></div>
              </div>
              <div className="w-14 h-14 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-3 sm:p-4 lg:p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
          <div className="w-full h-80 bg-gray-200 rounded"></div>
        </div>
        <div className="flex flex-col gap-3 sm:gap-4 lg:gap-5">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-4 animate-pulse h-48"></div>
          ))}
        </div>
      </div>
    </div>
  );

  if (isWalletLoading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="min-h-screen text-[#1B1717] space-y-4 sm:space-y-6 py-1">
      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {kpiCards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md p-3 sm:p-4 lg:p-5">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-2xl font-['Gilroy-Medium'] text-[#1B1717] mb-1">
                  {card.title}
                </p>
                <p className="text-[28px] font-['Gilroy-SemiBold'] text-[#1B1717] mb-2">
                  {card.value}
                </p>
                {card.title !== "Active Services" && (
                  <p className="text-white text-xs font-['Gilroy-Medium'] rounded-xl bg-[#039155] px-2 sm:px-3 py-1 sm:py-1.5 w-fit">
                    {card.subtitle}
                  </p>
                )}
                {card.title === "Active Services" && (
                  <p className="text-[#039155] text-xs font-['Gilroy-Medium'] px-1">{card.subtitle}</p>
                )}
              </div>
              <div className="flex items-center justify-center rounded-full text-[#1B1717] bg-[#E2FAF0] p-3 sm:p-4 shrink-0">
                <img
                  src={card.icon}
                  alt={card.title}
                  className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 object-contain"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart and Wallet Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
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
              <span className="text-[#039155] text-[10px] sm:text-xs font-[Gilroy-Medium] flex items-center gap-1">
                ▲ +0.24% Today
              </span>
            </div>
          </div>

          <div className="flex-1 w-full overflow-x-auto">
            <div className="h-full min-h-[320px] min-w-[600px] sm:min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barCategoryGap="15%" margin={{ top: 5, right: 10, left: 5, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#1B1717", fontFamily: "gilroy-medium" }} height={60} interval={0} tickMargin={8} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#1B1717" }} domain={[0, Math.max(1, Math.max(...chartData.map((d) => d.value || 0)) * 1.5)]} width={40} axisLine={false} tickLine={false} />
                  <Tooltip cursor={false} formatter={(value) => [formatCurrency(value), "Volume"]} contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px" }} wrapperStyle={{ outline: "none" }} />
                  <Bar dataKey="value" fill="#039155" radius={[8, 8, 0, 0]} barSize={43} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:gap-4 lg:gap-5 h-full">
          <div className="bg-[#4FF2AD]/20 rounded-xl shadow-sm p-4 lg:p-5 flex-1 flex flex-col justify-between">
            <div>
              <h4 className="text-[24px] font-[Gilroy-Medium] text-[#1B1717] mb-3">Main Wallet</h4>
              <p className="text-2xl lg:text-[28px] font-[Gilroy-Semibold] text-[#1B1717] mb-2">
                {formatCurrency(walletData.mainWallet)}
              </p>
              <p className="text-[14px] lg:text-sm text-[#1B1717]/80 font-[Gilroy-Medium]">
                Today's Earning: <strong className="text-[#1B1717] font-[Gilroy-Semibold]">{formatCurrency(totalCommission)}</strong>
              </p>
            </div>
            <button className="w-full bg-[#039155] hover:bg-[#027a47] text-white py-2 lg:py-2.5 rounded-xl font-[Gilroy-Semibold] text-sm lg:text-base transition">
              View History
            </button>
          </div>

          <div className="bg-[#4FF2AD]/20 rounded-xl shadow-sm p-4 lg:p-5 flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[24px] font-[Gilroy-Medium] text-[#1B1717]">{AEPS_LABELS[selectedAepsWallet]}</h4>
              <div className="relative">
                <select value={selectedAepsWallet} onChange={(e) => setSelectedAepsWallet(e.target.value)} className="appearance-none border border-[#039155] rounded-2xl pl-3 pr-8 py-1 text-xs font-[Gilroy-Semibold] bg-[#4FF2AD]/10 text-[#1B1717] focus:outline-none cursor-pointer">
                  <option value="aeps1">AEPS 1</option>
                  <option value="aeps2">AEPS 2</option>
                </select>
                <FiChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#1B1717] text-sm" />
              </div>
            </div>
            <p className="text-2xl lg:text-[28px] font-[Gilroy-Semibold] text-[#1B1717] mb-2">
              {formatCurrency(walletData[selectedAepsWallet])}
            </p>
            <button className="w-full bg-[#039155] hover:bg-[#027a47] text-white py-2 lg:py-2.5 rounded-xl font-[Gilroy-Semibold] text-sm lg:text-base transition" onClick={handlePayout}>
              Wallet Transfer
            </button>
          </div>
        </div>
      </div>

      {/* Quick Access Services */}
      <div className="py-3">
        <h3 className="text-lg sm:text-xl lg:text-[24px] font-[Gilroy-Medium] text-[#1B1717] mb-4">
          Quick Access Services
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {quickServices.map((service, index) => (
            <div key={index} className="bg-white rounded-2xl p-3 sm:p-4 flex items-start gap-4 transition hover:shadow-md cursor-pointer">
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

      {/* Recent Transaction Table */}
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

      {/* Payout Modal (Simplified) */}
      {payoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 relative">
            <button onClick={() => setPayout(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">✕</button>
            <h2 className="text-2xl font-[Gilroy-Medium] mb-6">Wallet Transfer</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-[Gilroy-Medium] mb-2">Amount</label>
                <input type="text" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:border-[#039155]" />
              </div>
              <div>
                <label className="block text-sm font-[Gilroy-Medium] mb-2">Select Bank</label>
                <select value={selectedBank} onChange={(e) => setSelectedBank(e.target.value)} className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:border-[#039155] appearance-none">
                  {banks.map(bank => (
                    <option key={bank.id} value={bank.id}>{bank.name} - {bank.accountNumber}</option>
                  ))}
                </select>
              </div>
            </div>
            <button className="w-full bg-[#039155] text-white py-3 rounded-xl font-[Gilroy-Semibold] hover:opacity-90 transition disabled:opacity-50" onClick={handleProcessTransfer}>
              Process Transfer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDash;