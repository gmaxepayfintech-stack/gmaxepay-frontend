import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import { getUserWalletBalance } from "../../redux/action/walletAction";

const Distributor = "/img/DistributorM.png";
const Ratailer = "/img/MRetailer.png";
const Earning = "/img/Earning.png";

const DistDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [walletData, setWalletData] = useState({
    mainWallet: null,
    apesWallet: null,
  });
  const [isWalletLoading, setIsWalletLoading] = useState(true);

  const walletBalanceResponse = useSelector(
    (state) => state?.wallet?.userWalletBalance,
  );

  // Fetch wallet balance on component mount
  useEffect(() => {
    const fetchBalance = async () => {
      setIsWalletLoading(true);
      try {
        await dispatch(getUserWalletBalance());
      } catch (error) {
        console.error("Failed to fetch wallet balance:", error);
      } finally {
        setIsWalletLoading(false);
      }
    };
    fetchBalance();
  }, [dispatch]);

  // Update wallet data when balance is fetched
  useEffect(() => {
    if (walletBalanceResponse?.data) {
      const { mainWallet, apesWallet } = walletBalanceResponse.data;
      setWalletData({
        mainWallet: mainWallet || null,
        apesWallet: apesWallet || null,
      });
    }
  }, [walletBalanceResponse]);

  // Format number with Indian locale
  const formatCurrency = (value) => {
    if (!value) return "₹0.00";
    const numValue = parseFloat(value);
    return `₹${numValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Chart data for Rcent Transaction - Monthly data (Jan-Dec)
  const chartData = [
    { name: "Jan", value: 2000 },
    { name: "Feb", value: 4000 },
    { name: "Mar", value: 7000 },
    { name: "Apr", value: 5000 },
    { name: "May", value: 1000 },
    { name: "Jun", value: 4000 },
    { name: "Jul", value: 8000 },
    { name: "Aug", value: 7000 },
    { name: "Sep", value: 2000 },
    { name: "Oct", value: 1000 },
    { name: "Nov", value: 7000 },
    { name: "Dec", value: 6000 },
  ];

  // Transaction table data - Updated to match image
  const transactionData = [
    {
      service: "Recharge",
      volume: "3208",
      count: "13",
      success: "08",
      failed: "02",
      pending: "06",
    },
    {
      service: "Recharge",
      volume: "3208",
      count: "13",
      success: "08",
      failed: "02",
      pending: "06",
    },
    {
      service: "Recharge",
      volume: "3208",
      count: "13",
      success: "08",
      failed: "02",
      pending: "06",
    },
    {
      service: "Recharge",
      volume: "3208",
      count: "13",
      success: "08",
      failed: "02",
      pending: "06",
    },
    {
      service: "Recharge",
      volume: "3208",
      count: "13",
      success: "08",
      failed: "02",
      pending: "06",
    },
    {
      service: "Recharge",
      volume: "3208",
      count: "13",
      success: "08",
      failed: "02",
      pending: "06",
    },
    {
      service: "Recharge",
      volume: "3208",
      count: "13",
      success: "08",
      failed: "02",
      pending: "06",
    },
  ];

  // Quick Access Services data
  const quickServices = [
    {
      name: "Mobile & DTH Recharge",
      icon: "/img/MobileIcon.svg",
      amount: "₹ 20542",
    },
    { name: "DMT-1", icon: "/img/MobileIcon.svg", amount: "₹ 20542" },
    { name: "Micro ATM", icon: "/img/MobileIcon.svg", amount: "₹ 20542" },
    { name: "AEPS", icon: "/img/MobileIcon.svg", amount: "₹ 2054456" },
    { name: "CMS-1", icon: "/img/MobileIcon.svg", amount: "₹ 20542" },
    { name: "BBPS", icon: "/img/MobileIcon.svg", amount: "₹ 20542" },
    { name: "DMT-2", icon: "/img/MobileIcon.svg", amount: "₹ 20542" },
    { name: "CMS-2", icon: "/img/MobileIcon.svg", amount: "₹ 20542" },
    { name: "Indo-Nepal DMT", icon: "/img/MobileIcon.svg", amount: "₹ 20542" },
    {
      name: "Mobile & DTH Recharge",
      icon: "/img/MobileIcon.svg",
      amount: "₹ 20542",
    },
  ];

  const kpiCards = [
    {
      title: "Distributor",
      value: "38",
      subtitle: "Today's Earning +12",
      icon: Distributor,
    },
    {
      title: "Today's Earning",
      value: "382821",
      subtitle: "Today's Earning +12",
      icon: Earning,
    },
    {
      title: "Today's Earning",
      value: "382821",
      subtitle: "Today's Earning +12",
      icon: Earning,
    },
  ];

  // Skeleton loader component
  const SkeletonLoader = () => (
    <div className="min-h-screen text-[#1B1717] space-y-4 sm:space-y-6 py-4 px-1">
      {/* Top KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-md p-3 sm:p-4 lg:p-5 animate-pulse"
          >
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

      {/* Chart and Wallet Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {/* Chart Skeleton */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-3 sm:p-4 lg:p-6 animate-pulse">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
            <div className="h-6 bg-gray-200 rounded w-40"></div>
            <div className="h-8 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
              <div className="h-7 bg-gray-200 rounded w-32"></div>
              <div className="h-5 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
          <div className="w-full h-80 sm:h-96 lg:h-[450px] bg-gray-200 rounded"></div>
        </div>

        {/* Wallet Cards Skeleton */}
        <div className="flex flex-col gap-3 sm:gap-4 lg:gap-5 h-full">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-green-50 rounded-xl shadow-sm p-4 lg:p-5 flex-1 flex flex-col animate-pulse"
            >
              <div className="h-6 bg-gray-300 rounded w-32 mb-3"></div>
              <div className="h-8 bg-gray-300 rounded w-40 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-16 mb-3"></div>
              <div className="h-4 bg-gray-300 rounded w-40 mb-3"></div>
              <div className="h-10 bg-gray-300 rounded w-full mt-4"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Show skeleton loader while loading
  if (isWalletLoading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="min-h-screen text-[#1B1717] space-y-4 sm:space-y-6 py-4 px-1">
      {/* Header Section */}

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {kpiCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-md p-3 sm:p-4 lg:p-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-2xl  font-['Gilroy-Medium'] text-[#1B1717] mb-1">
                  {card.title}
                </p>
                <p className="text-[28px] font-['Gilroy-SemiBold'] text-[#1B1717] mb-2">
                  {card.value}
                </p>
                {card.title !== "Today's Earning" && (
                  <p className=" text-white text-xs font-['Gilroy-Medium'] rounded-xl bg-[#039155] px-2 sm:px-3 py-1 sm:py-1.5 w-fit">
                    {card.subtitle}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-center rounded-full text-[#1B1717] bg-[#E2FAF0] p-3 sm:p-4 lg:p-5 shrink-1">
                <img
                  src={card.icon}
                  alt={card.title}
                  className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/img/gmaxepay.png";
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart and Wallet Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {/* ===== Left: Recent Transaction Chart ===== */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-3 sm:p-4 lg:p-6 h-full flex flex-col">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
            <h3 className="text-lg sm:text-xl lg:text-[24px] font-[gilroy-medium] text-[#1B1717]">
              Recent Transaction
            </h3>
            <button className="px-3 py-1.5 text-[10px] sm:text-xs font-[gilroy-medium] rounded-2xl text-[#1B1717]/80 border-[0.5px] border-[#1B1717]/80 transition w-full sm:w-auto">
              Today
            </button>
          </div>

          {/* Amount */}
          <div className="mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
              <p className="text-lg sm:text-xl lg:text-2xl font-[gilroy-semibold] text-[#1B1717]">
                $4,21,40,238
              </p>
              <span className="text-[#039155] text-[10px] sm:text-xs font-[gilroy-medium] flex items-center gap-1">
                ▲ +0.24% Today
              </span>
            </div>
          </div>

          {/* ===== Chart (KEY FIX HERE) ===== */}
          <div className="flex-1 w-full overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <div className="h-full min-h-[320px] min-w-[600px] sm:min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  barCategoryGap="15%"
                  margin={{ top: 5, right: 10, left: 5, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{
                      fontSize: 12,
                      fill: "#1B1717",
                      fontWeight: 400,
                      fontFamily: "gilroy-medium",
                    }}
                    height={60}
                    interval={0}
                    tickMargin={8}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 8000]}
                    tick={{ fontSize: 12, fill: "#1B1717", fontWeight: 400 }}
                    ticks={[0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000]}
                    width={40}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={false}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: 500,
                    }}
                    wrapperStyle={{ outline: "none" }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#039155"
                    radius={[8, 8, 0, 0]}
                    barSize={43}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ===== Right: Wallet Cards ===== */}
        <div className="flex flex-col gap-3 sm:gap-4 lg:gap-5 h-full">
          {/* Main Wallet */}
          <div className="bg-[#4FF2AD]/20 rounded-xl shadow-sm p-4 lg:p-5 flex-1 flex flex-col justify-between">
            <div>
              <h4 className="text-[24px] font-[gilroy-medium] text-[#1B1717] mb-3">
                Main Wallet
              </h4>
              <p className="text-2xl lg:text-[28px] font-[gilroy-semibold] text-[#1B1717] mb-2">
                {formatCurrency(walletData.mainWallet)}
              </p>
              <span className="text-[#039155] text-[10px] lg:text-xs font-[gilroy-semibold] flex items-center gap-1 mb-3">
                ▲ 0.45%
              </span>
              <p className="text-[14px] lg:text-sm text-[#1B1717]/80 font-[gilroy-medium]">
                Today's Commission
                <strong className="text-[#1B1717] font-[gilroy-semibold]">
                  {" "}
                  ₹200
                </strong>
              </p>
            </div>

            <button className="w-full bg-[#039155] hover:bg-[#027a47] text-white py-2 lg:py-2.5 rounded-xl font-[gilroy-semibold] text-sm lg:text-base transition shadow-sm">
              Account Transfer
            </button>
          </div>

          {/* AEPS Wallet */}
          <div className="bg-[#4FF2AD]/20 rounded-xl shadow-sm p-4 lg:p-5 flex-1 flex flex-col justify-between">
            <div>
              <h4 className="text-[24px] font-[gilroy-medium] text-[#1B1717] mb-3">
                AEPS Wallet
              </h4>
              <p className="text-2xl lg:text-[28px] font-[gilroy-semibold] text-[#1B1717] mb-2">
                {formatCurrency(walletData.apesWallet)}
              </p>
              <span className="text-[#039155] text-[10px] lg:text-xs font-[gilroy-semibold] flex items-center gap-1 mb-3">
                ▲ 0.45%
              </span>
              <p className="text-xs lg:text-sm text-[#1B1717]/80 font-[gilroy-medium]">
                Today's Earning
                <strong className="text-[#1B1717] font-[gilroy-semibold]">
                  {" "}
                  ₹200
                </strong>
              </p>
            </div>

            <button
              className="w-full bg-[#039155] hover:bg-[#027a47] text-white py-2 lg:py-2.5 rounded-xl font-[gilroy-semibold] text-sm lg:text-base transition shadow-sm"
              onClick={() => handlePayout()}
            >
              Wallet Transfer
            </button>
          </div>
        </div>
      </div>

      {/* Quick Access Services */}
      <div className="py-3 px-1">
        <h3 className="text-lg sm:text-xl lg:text-[24px] font-[gilroy-medium] text-[#1B1717] mb-4">
          Quick Access Services
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {quickServices.map((service, index) => (
            <div
              key={index}
              onClick={() => {
                if (service.name === "AEPS") {
                  navigate("/distributerDashboard/aeps");
                }
              }}
              className="bg-[#FFFFFF] rounded-2xl p-3 sm:p-4 flex items-start gap-[28px] transition cursor-pointer hover:shadow-md"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full bg-[#DBEAFE] flex items-center justify-center shrink-0 relative">
                <img
                  src={service.icon}
                  alt={service.name}
                  className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 object-contain"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[16px] font-['Gilroy-Medium'	] text-[#1B1717] mb-1 line-clamp-2">
                  {service.name}
                </p>
                <p className="text-[18px] font-['Gilroy-SemiBold'] text-[#1B1717] mt-3">
                  {service.amount}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transaction Table */}
      <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 lg:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4">
          <h3 className="text-2xl font-['Gilroy-Medium'] text-[#1B1717]">
            Recent Transaction
          </h3>
          <div className="flex items-center gap-2 sm:gap-3">
            <select className="px-2 py-1.5 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 text-xs border border-[#1B1717]/80 rounded-2xl  text-opacity-80">
              <option className="text-xs font-['Gilroy-Medium'] text-[#1B1717] text-opacity-80">
                Select Services
              </option>
            </select>
            <button className="px-2 py-1.5 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 text-xs font-['Gilroy-Medium'] hover:bg-gray-200 rounded-2xl border border-[#1B1717]/80 text-[#1B1717]/80 transition whitespace-nowrap">
              Today
            </button>
          </div>
        </div>

        <div className="overflow-x-auto -mx-3 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full">
              <thead>
                <tr className="border-b bg-[#FAFAFA] border-gray-200 ">
                  <th className="text-left py-2.5 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-[gilroy-medium] text-[#1B1717] whitespace-nowrap rounded-tl-xl">
                    Service
                  </th>
                  <th className="text-center py-2.5 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-[gilroy-medium] text-[#1B1717] whitespace-nowrap">
                    Volume
                  </th>
                  <th className="text-center py-2.5 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-[gilroy-medium] text-[#1B1717] whitespace-nowrap">
                    Count
                  </th>
                  <th className="text-center py-2.5 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-[gilroy-medium] text-[#1B1717] whitespace-nowrap">
                    Success
                  </th>
                  <th className="text-center py-2.5 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-[gilroy-medium] text-[#1B1717] whitespace-nowrap">
                    Failed
                  </th>
                  <th className="text-center py-2.5 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-[gilroy-medium] text-[#1B1717] whitespace-nowrap rounded-tr-xl">
                    Pending
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactionData.map((row, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 bg-white hover:bg-gray-50"
                  >
                    <td className="py-2.5 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs text-[#121216] font-[gilroy-semibold] whitespace-nowrap">
                      {row.service}
                    </td>
                    <td className="py-2.5 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs text-[#121216] whitespace-nowrap text-center font-[gilroy-regular]">
                      {row.volume}
                    </td>
                    <td className="py-2.5 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs text-[#121216] whitespace-nowrap text-center font-[gilroy-regular ">
                      {row.count}
                    </td>
                    <td className="py-2.5 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs text-[#039155] font-[gilroy-semibold] whitespace-nowrap text-center">
                      {row.success}
                    </td>
                    <td className="py-2.5 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs text-[#D66000] font-[gilroy-semibold] whitespace-nowrap text-center">
                      {row.failed}
                    </td>
                    <td className="py-2.5 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs text-[#E32424] font-[gilroy-semibold] whitespace-nowrap text-center">
                      {row.pending}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistDashboard;
