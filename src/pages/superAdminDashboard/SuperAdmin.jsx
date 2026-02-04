import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Wallet, Users, CreditCard, Tag } from "lucide-react";
import {
  getAlsWallet,
  getWalletBalance,
  getEkycHubBalance,
  getInspayWalletBalance,
} from "../../redux/action/walletAction";
import {
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import { getLocationAndIP } from "../../util/getLocationAndIP";
import { getUserWalletBalance } from "../../redux/action/walletAction";
import { ButtonLoader } from "../../widgets/layout/loader";
import { FiChevronDown } from "react-icons/fi";
import { motion } from "framer-motion";
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
  const [ekycHubBalance, setEkycHubBalance] = useState(null);
  const [inspayWalletBalance, setInspayWalletBalance] = useState(null);
  const [walletData, setWalletData] = useState({
    mainWallet: null,
    aeps1: null,
    aeps2: null,
  });
  const [isWalletLoading, setIsWalletLoading] = useState(true);
  const [isAlsWalletLoading, setIsAlsWalletLoading] = useState(true);
  const [isEkycHubLoading, setIsEkycHubLoading] = useState(true);
  const [isInspayWalletLoading, setIsInspayWalletLoading] = useState(true);
  const [isAslWalletRefreshing, setIsAslWalletRefreshing] = useState(false);
  const [isEkycHubRefreshing, setIsEkycHubRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("Today");
  const [isInspayWalletRefreshing, setIsInspayWalletRefreshing] =
    useState(false);

  const [payoutOpen, setPayout] = useState(false);
  const [walletType, setWalletType] = useState("bank");
  const [requestType, setRequestType] = useState("");
  const [amount, setAmount] = useState("1000");
  const [selectedBank, setSelectedBank] = useState(null);
  const [banks, setBanks] = useState([]);
  const scrollYRef = useRef(0);

  const [addBankOpen, setAddBankOpen] = useState(false);
  const [isTransferLoading, setIsTransferLoading] = useState(false);
  const [selectedAepsWallet, setSelectedAepsWallet] = useState("aeps1");

  const AEPS_LABELS = {
    aeps1: "AEPS Wallet 1",
    aeps2: "AEPS Wallet 2",
  };

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const filters = ["Today", "Weekly", "Monthly", "Yearly"];

  // Get wallet data from Redux
  const alsWalletResponse = useSelector((state) => state?.wallet?.alsWallet);
  const ekycHubBalanceResponse = useSelector(
    (state) => state?.wallet?.ekycHubBalance,
  );
  const inspayWalletBalanceResponse = useSelector(
    (state) => state?.wallet?.inspayWalletBalance,
  );
  const walletBalanceResponse = useSelector(
    (state) => state?.wallet?.walletBalance,
  );
  const payoutBankListData = useSelector(
    (state) => state?.payout?.payoutBankList,
  );

  const aepswallet = useSelector((state) => state?.wallet?.walletBalance?.data);

  const isLoading = useSelector((state) => state?.loading?.isLoading || false);

  // Fetch wallet balance on component mount
  useEffect(() => {
    const fetchBalance = async () => {
      setIsWalletLoading(true);
      try {
        await dispatch(getWalletBalance());
      } catch (error) {
        console.error("Failed to fetch wallet balance:", error);
      } finally {
        setIsWalletLoading(false);
      }
    };
    fetchBalance();
  }, [dispatch]);

  // Fetch ASL wallet on component mount
  useEffect(() => {
    const fetchAlsWallet = async () => {
      setIsAlsWalletLoading(true);
      try {
        await dispatch(getAlsWallet());
      } catch (error) {
        console.error("Failed to fetch ASL wallet:", error);
      } finally {
        setIsAlsWalletLoading(false);
      }
    };
    fetchAlsWallet();
  }, [dispatch]);

  // Fetch Ekyc Hub wallet on component mount
  useEffect(() => {
    const fetchEkycHubBalance = async () => {
      setIsEkycHubLoading(true);
      try {
        await dispatch(getEkycHubBalance());
      } catch (error) {
        console.error("Failed to fetch Ekyc Hub balance:", error);
      } finally {
        setIsEkycHubLoading(false);
      }
    };
    fetchEkycHubBalance();
  }, [dispatch]);

  // Fetch Inspay wallet on component mount
  useEffect(() => {
    const fetchInspayWalletBalance = async () => {
      setIsInspayWalletLoading(true);
      try {
        await dispatch(getInspayWalletBalance());
      } catch (error) {
        console.error("Failed to fetch Inspay wallet balance:", error);
      } finally {
        setIsInspayWalletLoading(false);
      }
    };
    fetchInspayWalletBalance();
  }, [dispatch]);

  // Update wallet data when balance is fetched
  useEffect(() => {
    if (walletBalanceResponse?.data) {
      const { mainWallet, apes1Wallet, apes2Wallet } =
        walletBalanceResponse.data;
      setWalletData({
        mainWallet: mainWallet || 0,
        aeps1: apes1Wallet || 0,
        aeps2: apes2Wallet || 0,
      });
    }
  }, [walletBalanceResponse]);

  // Update opening balance when ASL wallet data is fetched
  useEffect(() => {
    if (alsWalletResponse?.data?.data?.openingBalance) {
      setAlsOpeningBalance(alsWalletResponse.data.data.openingBalance);
    } else {
      setAlsOpeningBalance("0.00");
    }
  }, [alsWalletResponse]);

  // Update Ekyc Hub balance when data is fetched
  useEffect(() => {
    if (ekycHubBalanceResponse?.data?.balance) {
      setEkycHubBalance(ekycHubBalanceResponse.data.balance);
    } else {
      setEkycHubBalance("0.00");
    }
  }, [ekycHubBalanceResponse]);

  // Update Inspay wallet balance when data is fetched
  useEffect(() => {
    if (inspayWalletBalanceResponse?.data?.balance) {
      setInspayWalletBalance(inspayWalletBalanceResponse.data.balance);
    } else {
      setInspayWalletBalance("0.00");
    }
  }, [inspayWalletBalanceResponse]);

  // Format number with Indian locale
  const formatCurrency = (value) => {
    if (!value) return "₹0.00";
    const numValue = parseFloat(value);
    return `₹${numValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handlePayout = () => {
    setPayout(true);
  };

  const data = [
    { name: "Rupaisa", value: 400 },
    { name: "", value: 900 },
    { name: "", value: 650 },
    { name: "Asl Wallet", value: 1300 },
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
      bg: "bg-[#FFF2EC]", // Light peach
    },
    {
      label: "Commission",
      value: "$42,04,100",
      change: "▼ 4.61%",
      icon: Comission,
      bg: "bg-[#EBF5FF]", // Light blue
    },
    {
      label: "Successful Transactions",
      value: "9",
      change: "▲ 4.61%",
      icon: Transactions,
      bg: "bg-[#E3FAE9]", // Light green
    },
    {
      label: "Total Charges",
      value: "$4,21,40,238",
      change: "▲ 4.61%",
      icon: TotalCharges,
      bg: "bg-[#FFF2DF]", // Light orange
    },
  ];

  // Skeleton loader component
  const SkeletonLoader = () => (
    <div className="py-4 px-1 min-h-screen text-[#1B1717] space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Chart Skeleton */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow p-4 sm:p-6">
          <div className="flex flex-col gap-3 mb-4">
            <div className="h-7 bg-gray-200 rounded w-40 animate-pulse"></div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>
              <div className="flex flex-wrap gap-2 justify-end">
                {days.map((day) => (
                  <div
                    key={day}
                    className="h-8 bg-gray-200 rounded-lg w-12 animate-pulse"
                  ></div>
                ))}
              </div>
            </div>
          </div>
          <div className="w-full h-48 sm:h-64 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Right: Wallet Cards Skeleton */}
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-green-100 p-5 rounded-2xl shadow animate-pulse"
            >
              <div className="h-6 bg-gray-300 rounded w-32 mb-4"></div>
              <div className="h-8 bg-gray-300 rounded w-40 mb-3"></div>
              <div className="h-4 bg-gray-300 rounded w-20 mb-3"></div>
              <div className="h-4 bg-gray-300 rounded w-48 mb-3"></div>
              <div className="h-10 bg-gray-300 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Wallets Skeleton */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow p-4 sm:p-6">
          <div className="h-7 bg-gray-200 rounded w-40 mb-4 animate-pulse"></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-50 border border-gray-200 rounded-xl p-3 sm:p-4 animate-pulse"
              >
                <div className="h-5 bg-gray-300 rounded w-24 mb-2"></div>
                <div className="h-6 bg-gray-300 rounded w-32 mb-3"></div>
                <div className="h-8 bg-gray-300 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Action Buttons Skeleton */}
        <div className="bg-white rounded-2xl shadow p-4 sm:p-6">
          <div className="h-7 bg-gray-200 rounded w-40 mb-5 animate-pulse"></div>
          <div className="grid grid-cols-3 sm:grid-cols-3 gap-6">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex flex-col items-center space-y-4 animate-pulse"
              >
                <div className="bg-gray-300 w-16 h-16 rounded-full"></div>
                <div className="h-4 bg-gray-300 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Show skeleton loader while loading wallet balance, ASL wallet, Ekyc Hub wallet, or Inspay wallet
  if (
    isWalletLoading ||
    isAlsWalletLoading ||
    isEkycHubLoading ||
    isInspayWalletLoading
  ) {
    return <SkeletonLoader />;
  }

  return (
    <div className="py-4 px-1  min-h-screen text-[#1B1717] space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow p-4 sm:p-6">
          {/* Header Section */}
          <div className="flex flex-col gap-3 mb-4">
            <h2 className="text-2xl font-[gilroy-medium] text-[#1B1717]">
              Today Earning
            </h2>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <p className="text-xl sm:text-2xl font-[gilroy-semibold] text-[#1B1717]">
                  ₹4,21,40,238
                </p>
                <span className="text-[#039155] text-xs font-[gilroy-semibold] flex items-center gap-1">
                  ▲ $40,238 (4.61%)
                </span>
              </div>

              {/* Weekday Buttons */}
              <div className="flex flex-wrap gap-2 justify-end">
                {days.map((day) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`px-3 py-1  rounded-md text-xs[10px] sm:text-xs font-[gilroy-medium] transition-all ${
                      selectedDay === day
                        ? "bg-[#039155] text-white "
                        : "border-[#1B1717]/50 text-[#1B1717] border hover:border-[#039155] hover:text-[#039155]"
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
              <AreaChart
                data={data.map((d) => ({ ...d, valueBg: d.value + 100 }))}
                margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="2">
                    <stop offset="0%" stopColor="#a7f3d0" stopOpacity={0.8} />
                    <stop offset="50%" stopColor="#6ee7b7" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#d1fae5" stopOpacity={0.4} />
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
                  tick={{ fill: "#1B1717", fontSize: 12 }}
                  dy={10}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#1B1717", fontSize: 12 }}
                  domain={[0, 2000]}
                  ticks={[100, 500, 1000, 1500, 2000]}
                />

                {/* BG area slightly higher */}
                <Area
                  type="linear"
                  dataKey="valueBg"
                  stroke="none"
                  fill="#03915533"
                  fillOpacity={1.5}
                />

                {/* Main stroke */}
                <Area
                  type="linear"
                  dataKey="value"
                  stroke="#10b981"
                  strokeWidth={1}
                  fill="url(#colorValue)"
                  dot={{
                    fill: "#fff",
                    stroke: "#10b981",
                    strokeWidth: 2,
                    r: 5,
                  }}
                  activeDot={{
                    fill: "#10b981",
                    stroke: "#fff",
                    strokeWidth: 2,
                    r: 5,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ===== Right: Wallets ===== */}
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
              {/* Header with Select */}
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[24px] font-[gilroy-medium] text-[#1B1717]">
                  {AEPS_LABELS[selectedAepsWallet]}
                </h4>

                {/* Custom Select with react-icons */}
                <div className="relative">
                  <select
                    value={selectedAepsWallet}
                    onChange={(e) => setSelectedAepsWallet(e.target.value)}
                    className="
                        appearance-none
                        border border-[#039155]
                        rounded-2xl
                        pl-3 pr-8
                        py-1
                        text-xs
                        font-[gilroy-semibold]
                        bg-[#4FF2AD]/10
                        text-[#1B1717]
                        focus:outline-none
                        cursor-pointer
                    "
                  >
                    <option value="aeps1">AEPS 1</option>
                    <option value="aeps2">AEPS 2</option>
                  </select>

                  {/* Chevron Icon */}
                  <FiChevronDown
                    className="
                    pointer-events-none
                    absolute
                    right-2
                    top-1/2
                    -translate-y-1/2
                    text-[#1B1717]
                    text-sm
                    "
                  />
                </div>
              </div>

              {/* Balance */}
              <p className="text-2xl lg:text-[28px] font-[gilroy-semibold] text-[#1B1717] mb-2">
                {formatCurrency(walletData[selectedAepsWallet])}
              </p>

              <span className="text-[#039155] text-[10px] lg:text-xs font-[gilroy-semibold] flex items-center gap-1 mb-3">
                ▲ 4.61%
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
              onClick={handlePayout}
            >
              Wallet Transfer
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl shadow p-4 sm:p-6">
          <h3 className="font-[gilroy-semibold] text-[#1B1717] text-2xl mb-4">
            Overall Wallets
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {[...Array(6)].map((_, i) => {
              const isAslWallet = i === 0;
              const isEkycHubWallet = i === 1;
              const isInspayWallet = i === 2;
              const walletName = isAslWallet
                ? "ASL Wallet"
                : isEkycHubWallet
                  ? "EKYC-HUB Wallet"
                  : isInspayWallet
                    ? "Inspay Wallet"
                    : `Rupaisa Pay Wallet ${i}`;
              const displayBalance = isAslWallet
                ? alsOpeningBalance
                  ? `₹${parseFloat(alsOpeningBalance).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : "₹0.00"
                : isEkycHubWallet
                  ? ekycHubBalance
                    ? `₹${parseFloat(ekycHubBalance).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : "₹0.00"
                  : isInspayWallet
                    ? inspayWalletBalance
                      ? `₹${parseFloat(inspayWalletBalance).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : "₹0.00"
                    : "$4,21,40,238";

              return (
                <div
                  key={i}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-3 sm:p-4 flex flex-col justify-between hover:shadow-md transition"
                >
                  <p className="font-[gilroy-medium] text-[#1B1717] text-base mb-1">
                    {walletName}
                  </p>
                  <p className="text-[#1B1717] font-semibold text-sm sm:text-lg">
                    {(isAslWalletRefreshing && isAslWallet) ||
                    (isEkycHubRefreshing && isEkycHubWallet) ||
                    (isInspayWalletRefreshing && isInspayWallet)
                      ? "Loading..."
                      : displayBalance}
                  </p>
                  <button
                    className="mt-3 text-xs sm:text-sm w-full bg-[#039155] hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isAslWallet) {
                        setIsAslWalletRefreshing(true);
                        dispatch(getAlsWallet())
                          .then(() => {
                            // The useEffect will update alsOpeningBalance when response comes
                          })
                          .catch((error) => {
                            console.error(
                              "Failed to refresh ASL wallet:",
                              error,
                            );
                          })
                          .finally(() => {
                            setIsAslWalletRefreshing(false);
                          });
                      } else if (isEkycHubWallet) {
                        setIsEkycHubRefreshing(true);
                        dispatch(getEkycHubBalance())
                          .then(() => {
                            // The useEffect will update ekycHubBalance when response comes
                          })
                          .catch((error) => {
                            console.error(
                              "Failed to refresh Ekyc Hub wallet:",
                              error,
                            );
                          })
                          .finally(() => {
                            setIsEkycHubRefreshing(false);
                          });
                      } else if (isInspayWallet) {
                        setIsInspayWalletRefreshing(true);
                        dispatch(getInspayWalletBalance())
                          .then(() => {
                            // The useEffect will update inspayWalletBalance when response comes
                          })
                          .catch((error) => {
                            console.error(
                              "Failed to refresh Inspay wallet:",
                              error,
                            );
                          })
                          .finally(() => {
                            setIsInspayWalletRefreshing(false);
                          });
                      }
                    }}
                    disabled={
                      (isAslWalletRefreshing && isAslWallet) ||
                      (isEkycHubRefreshing && isEkycHubWallet) ||
                      (isInspayWalletRefreshing && isInspayWallet)
                    }
                  >
                    {(isAslWalletRefreshing && isAslWallet) ||
                    (isEkycHubRefreshing && isEkycHubWallet) ||
                    (isInspayWalletRefreshing && isInspayWallet)
                      ? "Loading..."
                      : "Refresh"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ===== Right: Quick Action Buttons ===== */}
        <div className="bg-white rounded-3xl shadow p-4 sm:p-6">
          <h3 className="font-[gilroy-medium] text-[#1B1717] text-2xl mb-5">
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
                <div className="bg-[#039155] w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform duration-200">
                  {item.type === "icon" ? (
                    <item.icon className="text-white w-6 h-6" />
                  ) : (
                    <img
                      src={item.src}
                      alt={item.label}
                      className="w-96 h-6 object-contain"
                    />
                  )}
                </div>
                <span className="text-sm font-[gilroy-semibold] text-[#1B1717]">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== Today's Summary & Details Matrix ===== */}
      <div className="bg-white p-4 gap-2 sm:p-6 rounded-3xl shadow">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div className="">
            <h3 className="font-[gilroy-medium] text-2xl text-[#1B1717]">
              Todays Summary
            </h3>
            <p className="text-sm text-[#1B1717]/80 font-[gilroy-medium] mt-3">
              Track Your Financial Metrics and Performance
            </p>
          </div>

          <div className="bg-white border border-[#1B1717]/80 rounded-2xl p-2 inline-flex">
            <div className="relative flex gap-2">
              {filters.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setActiveFilter(label)}
                  className="relative flex justify-center"
                >
                  {/* Size-defining wrapper */}
                  <span className="relative w-[90px] py-2 rounded-md text-center">
                    {/* Moving pill */}
                    {activeFilter === label && (
                      <motion.span
                        layoutId="active-filter-pill"
                        className="absolute inset-0 rounded-md bg-[#039155]"
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 35,
                        }}
                      />
                    )}

                    {/* Text */}
                    <span
                      className={`relative z-10 text-xs font-[gilroy-medium] transition-colors ${
                        activeFilter === label
                          ? "text-white font-[gilroy-semibold]"
                          : "text-[#1B1717] hover:text-[#039155]"
                      }`}
                    >
                      {label}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {summaryItems.map((item, i) => (
            <div
              key={i}
              className={`p-4 rounded-2xl hover:shadow-md shadow transition flex flex-col items-start ${item.bg}`}
            >
              <div className="flex justify-between items-center w-full">
                <img
                  src={item.icon}
                  alt={item.label}
                  className="w-10 h-10 mb-2 "
                />
                <span
                  className={`text-xs font-[gilroy-semibold] mb-6 ${
                    item.change.startsWith("▲")
                      ? "text-[#039155]"
                      : "text-[#F60509]"
                  }`}
                >
                  {item.change}
                </span>
              </div>
              <div className="flex justify-between items-center w-full mb-2">
                <p className="text-[#1B1717] text-sm font-[gilroy-medium]">
                  {item.label}
                </p>
              </div>
              <p className="text-sm sm:text-lg font-[gilroy-semibold] text-[#1B1717]">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Details Matrix */}
        <h3 className="font-[gilroy-medium] text-2xl text-[#1B1717]">
          Details Matrix
        </h3>
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
              className="flex items-center justify-between border-[0.5px] border-[#039155]/80 rounded-2xl p-3 sm:p-4 bg-white hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-md  flex items-center justify-center">
                  <img
                    src={item.icon}
                    alt={item.label}
                    className="w-[40px] h-[40px]"
                  />
                </span>
                <div>
                  <p className="text-xs sm:text-sm font-[gilroy-medium] text-[#1B1717]">
                    {item.label}
                  </p>
                  <p className="font-[gilroy-semibold] text-[#1B1717] mt-1 text-sm sm:text-base">
                    {item.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {payoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#D9D9D9CC]">
          <div className="bg-white rounded-3xl w-[90%] max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative m-4">
            {!addBankOpen && (
              <>
                <h2 className="text-2xl font-['Gilroy-Medium'] mb-[20px] text-[#1B1717]">
                  Transferring Amount
                </h2>
                <button
                  onClick={() => setPayout(false)}
                  className="absolute top-4 right-4 w-10 h-10
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

                {/* Input Fields */}
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px]">
                    {/* Wallet Type */}
                    <div>
                      <label
                        htmlFor="walletType"
                        className="text-[14px] font-['Gilroy-Medium'] text-[#121216] mb-4 "
                      >
                        Wallet Type
                      </label>

                      <div className="relative w-full">
                        <select
                          id="walletType"
                          value={walletType}
                          onChange={(e) => {
                            const value = e.target.value;
                            setWalletType(value);

                            if (value === "wallet") {
                              setRequestType("");
                              setSelectedBank(null);
                            }
                          }}
                          className="
      w-full
      h-[43px]
      px-4 pr-10
      border-[0.5px]
      border-[#1B1717]/80
      border-opacity-50
      rounded-lg
      text-[#1B1717]
      focus:outline-none
      appearance-none
      bg-white
      cursor-pointer
    "
                        >
                          <option value="bank">Aeps Wallet To Bank</option>
                          <option value="wallet">
                            AEPS Wallet To Main Wallet
                          </option>
                        </select>

                        {/* Custom dropdown icon */}
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
                    </div>

                    {/* Request Type */}
                    <div>
                      <label
                        htmlFor="requestType"
                        className="text-[14px] font-['Gilroy-Medium'] text-[#121216] mb-2 "
                      >
                        Mode Type
                      </label>

                      <div className="relative w-full">
                        <select
                          id="requestType"
                          value={requestType}
                          onChange={(e) => setRequestType(e.target.value)}
                          disabled={walletType === "wallet"}
                          className={`
      w-full
      h-[43px]
      px-4 pr-10
      border-[0.5px]
      border-[#1B1717]/80
      rounded-lg
      text-[#1B1717]
      focus:outline-none
      appearance-none
      bg-white
      ${
        walletType === "wallet"
          ? "bg-gray-100 cursor-not-allowed opacity-60"
          : "cursor-pointer"
      }
    `}
                        >
                          <option value="">Select</option>
                          <option value="IMPS">IMPS</option>
                          <option value="NEFT">NEFT</option>
                        </select>

                        {/* Custom dropdown icon */}
                        <FiChevronDown
                          className={`
      pointer-events-none
      absolute
      right-3
      top-1/2
      -translate-y-1/2
      text-[#1B1717]
      text-sm
      ${walletType === "wallet" ? "opacity-50" : ""}
    `}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Amount To Withdrawal */}
                  <div className="">
                    <label
                      htmlFor="amount"
                      className="block text-[14px] font-['Gilroy-Medium'] text-[#121216] mb-2"
                    >
                      Amount To Withdrawal
                    </label>
                    <div className="relative text-[24px]">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1B1717] text-opacity-80">
                        ₹
                      </span>
                      <input
                        id="amount"
                        type="text"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount"
                        className="
                                w-full pl-10 pr-4 py-2.5 h-[78px] font-['Gilroy-SemiBold'] text-[#1B1717] text-opacity-80
                                border border-dashed border-[#1B1717] border-opacity-80
                                rounded-lg focus:outline-none 
                              "
                      />
                    </div>
                  </div>
                </div>

                {/* Settlements Banks Added */}
                {walletType === "bank" && (
                  <div className="mb-6">
                    <h3 className="text-[14px] text-[#121216] font-['Gilroy-Medium'] mb-2">
                      Settlements Banks Added
                    </h3>
                    <div className="space-y-3 max-h-56 overflow-y-auto">
                      {banks.length === 0 ? (
                        <p className="text-[14px] text-[#1B1717]/80 text-center py-4">
                          No banks available
                        </p>
                      ) : (
                        banks.map((bank) => (
                          <div
                            key={bank.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => setSelectedBank(bank.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setSelectedBank(bank.id);
                              }
                            }}
                            className={`p-4 border-[0.5px] rounded-[14px] cursor-pointer transition-all ${
                              selectedBank === bank.id
                                ? "border-[#039155] bg-green-50"
                                : "border-[#1B1717] border-opacity-80"
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              {/* Bank Logo */}
                              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 relative">
                                <img
                                  src={bank.logo}
                                  alt={bank.name}
                                  className="w-10 h-10 object-cover"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                    const fallback =
                                      e.target.nextElementSibling;
                                    if (fallback)
                                      fallback.style.display = "block";
                                  }}
                                />
                                <span className="text-[12px] font-['Gilroy-SemiBold'] text-[#1B1717] hidden">
                                  {bank.name
                                    ? bank.name.substring(0, 2).toUpperCase()
                                    : "BK"}
                                </span>
                              </div>

                              {/* Bank Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="text-sm font-[gilroy-medium] text-[#1B1717]">
                                    Bank Name: {bank.name}
                                  </p>
                                  {/* FIX: remove margin that increases card height and center the indicator */}
                                  {selectedBank === bank.id && (
                                    <div
                                      className="w-[24px] h-[24px] rounded-full bg-[#039155]
                              flex items-center justify-center self-center"
                                    >
                                      <div className="w-[8px] h-[8px] rounded-full bg-white" />
                                    </div>
                                  )}
                                </div>
                                <p className="text-[12px] font-['Gilroy-Medium'] text-[#1B1717]/80 mb-1">
                                  Account Number:{" "}
                                  <span className="text-[#1B1717]">
                                    {bank.accountNumber}
                                  </span>
                                </p>
                                <p className="text-[12px] font-['Gilroy-Medium'] text-[#1B1717]/80">
                                  IFSC Code:{" "}
                                  <span className="text-[#1B1717]">
                                    {bank.ifscCode}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {/* Add New Bank Button */}
                    <div
                      onClick={() => {
                        // open add bank modal / navigate
                        setAddBankOpen(true); // or navigate("/add-bank")
                      }}
                      className="w-full mt-5 cursor-pointer border-[0.5px] border-dashed border-[#1B1717]/80
                              rounded-xl py-4 flex items-center justify-center gap-2
                              hover:border-[#039155]  transition"
                    >
                      <div className="w-6 h-6 rounded-full border-[#180404] border-2 border-current flex items-center justify-center text-[24px] text-[#180404] font-medium leading-none">
                        +
                      </div>
                      <span className="font-['Gilroy-Medium'] text-lg text-[#1B1717]">
                        Add New Bank
                      </span>
                    </div>
                  </div>
                )}
                {/* Action Buttons */}
                <div className="flex w-full gap-3 pt-4 border-gray-200">
                  <button
                    className="w-1/2 px-6 py-4 text-[18px] rounded-lg border border-[#1B1717]/80 bg-[#FFFFFF]
                           text-[#1B1717] font-['Gilroy-Medium']
                           hover:bg-gray-50 transition"
                    onClick={() => setPayout(false)}
                  >
                    Cancel
                  </button>

                  <button
                    className="w-1/2 px-6 py-2.5 text-[18px] rounded-lg bg-[#039155] text-[#FFFFFF]
                           font-['Gilroy-SemiBold']
                           hover:bg-[#027a47] transition"
                    onClick={async () => {
                      try {
                        let payload = {};

                        if (walletType === "wallet") {
                          // Get location data
                          const locationInfo = await getLocationAndIP();
                          console.log("Wallet - Location Info:", locationInfo);
                          const latitude =
                            locationInfo?.location?.latitude != null
                              ? locationInfo.location.latitude.toString()
                              : "";
                          const longitude =
                            locationInfo?.location?.longitude != null
                              ? locationInfo.location.longitude.toString()
                              : "";
                          console.log(
                            "Wallet - Latitude:",
                            latitude,
                            "Longitude:",
                            longitude,
                          );

                          payload = {
                            amount: amount.toString(),
                            mode: "wallet",
                            latitude: latitude,
                            longitude: longitude,
                          };
                        } else if (walletType === "bank") {
                          const locationInfo = await getLocationAndIP();
                          console.log("Bank - Location Info:", locationInfo);
                          const latitude =
                            locationInfo?.location?.latitude != null
                              ? locationInfo.location.latitude.toString()
                              : "";
                          const longitude =
                            locationInfo?.location?.longitude != null
                              ? locationInfo.location.longitude.toString()
                              : "";
                          console.log(
                            "Bank - Latitude:",
                            latitude,
                            "Longitude:",
                            longitude,
                          );
                          payload = {
                            amount: amount.toString(),
                            mode: "bank",
                            bankId: selectedBank,
                            latitude: latitude,
                            longitude: longitude,
                          };
                          if (requestType) {
                            payload.paymentMode = requestType;
                          }
                        }

                        // Validate payload before sending
                        if (!payload || Object.keys(payload).length === 0) {
                          console.error(
                            "Payload is empty! WalletType:",
                            walletType,
                          );
                          alert(
                            "Please select a valid wallet type and fill in the required fields.",
                          );
                          return;
                        }

                        console.log(
                          "Processing transfer with payload:",
                          payload,
                        );

                        const response = await dispatch(
                          payoutTransaction(payload),
                        );

                        if (response?.status === "SUCCESS") {
                          console.log("Transfer successful:", response);
                          setPayout(false);
                          // Reset form
                          setWalletType("bank");
                          setRequestType("");
                          setAmount("1000");
                          setSelectedBank(null);
                        } else {
                          console.error("Transfer failed:", response?.message);
                          // You might want to show an error message to the user here
                        }
                      } catch (error) {
                        console.error("Error processing transfer:", error);
                        // You might want to show an error message to the user here
                      } finally {
                        setIsTransferLoading(false);
                      }
                    }}
                  >
                    {isTransferLoading ? (
                      <>
                        <ButtonLoader color="#FFFFFF" size={20} />
                        <span>Processing...</span>
                      </>
                    ) : (
                      "Processed Transfer"
                    )}
                  </button>
                </div>
              </>
            )}

            {/* ================= STEP 2: ADD BANK CARD ================= */}
            {addBankOpen && (
              <>
                <h2 className="text-2xl font-['Gilroy-Medium'] text-[#1B1717] mb-6">
                  Enter Your Bank Details
                </h2>

                <div className="space-y-4">
                  {/* Select Bank */}
                  <div>
                    <label className="text-sm font-[gilroy-medium] text-[#121216] ">
                      Select Your Bank *
                    </label>
                    <select className="w-full h-[43px] mt-2 border border-[#1B1717]/80 rounded-lg px-4 text-[#1B1717] text-opacity-80">
                      <option>Select</option>
                    </select>
                  </div>

                  {/* Account Number */}
                  <div>
                    <label className="text-sm font-[gilroy-medium] text-[#121216] ">
                      Account Number *
                    </label>
                    <input
                      className="w-full h-[43px] mt-2 border-[0.5px] border-[#1B1717]/80 font-[gilroy-medium] text-[#1B1717]/80 rounded-lg px-4"
                      placeholder="Enter Account Number"
                    />
                  </div>

                  {/* IFSC */}
                  <div>
                    <label className="text-sm font-[gilroy-medium] text-[#121216] ">
                      IFSC Code *
                    </label>
                    <input
                      className="w-full h-[43px] mt-2 border-[0.5px] border-[#1B1717]/80 font-[gilroy-medium] text-sm text-[#1B1717]/80 rounded-lg px-4"
                      placeholder="Enter IFSC Code"
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-6">
                  <button
                    className="w-1/2 py-3 border-[0.5px] border-[#1B1717]/80 rounded-lg font-[gilroy-medium] text-[#1B1717]/80"
                    onClick={() => setAddBankOpen(false)}
                  >
                    Cancel
                  </button>

                  <button
                    className="w-1/2 py-3 bg-[#039155] text-white rounded-lg font-[gilroy-semibold] text-sm hover:bg-[#027a47] transition"
                    onClick={() => {
                      // save bank API
                      // after success:
                      setAddBankOpen(false);
                      dispatch(payoutBankList({})); // refresh list
                    }}
                  >
                    Save
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdmin;
