import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Users, Tag } from "lucide-react";
import {
  getAlsWallet,
  getWalletBalance,
  getEkycHubBalance,
  getInspayWalletBalance,
  getBbpsWalletBalance,
  getA1TopupWallet,
  getDashboardStatistics,
} from "../../redux/action/walletAction";
import {
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
} from "recharts";
import { getLocationAndIP } from "../../util/getLocationAndIP";
import { useNotification } from "../../context/NotificationContext";
import { ButtonLoader } from "../../widgets/layout/loader";
import { FiChevronDown } from "react-icons/fi";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const MasterDt = "/img/MasterDt.png";
const Distributor = "/img/Distributor.png";
const Ratailer = "/img/Retailer.png";
const Comission = "/img/Comission.png";
const FailedTransactions = "/img/FailedTransactions.svg";
const PendingTransactions = "/img/PendingTransactions.svg";
const Transactions = "/img/Transactions.png";


const SuperAdmin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const todayIndex = new Date().getDay();
  const [selectedDay, setSelectedDay] = useState(days[todayIndex] || "Sun");
  const [alsOpeningBalance, setAlsOpeningBalance] = useState(null);
  const [ekycHubBalance, setEkycHubBalance] = useState(null);
  const [inspayWalletBalance, setInspayWalletBalance] = useState(null);
  const [bbpsWalletBalance, setBbpsWalletBalance] = useState(null);
  const [a1TopupWalletBalance, setA1TopupWalletBalance] = useState(null);
  const [walletData, setWalletData] = useState({
    mainWallet: null,
    aeps1: null,
    aeps2: null,
  });
  const [isWalletLoading, setIsWalletLoading] = useState(true);
  const [isAlsWalletLoading, setIsAlsWalletLoading] = useState(true);
  const [isEkycHubLoading, setIsEkycHubLoading] = useState(true);
  const [isInspayWalletLoading, setIsInspayWalletLoading] = useState(true);
  const [isBbpsWalletLoading, setIsBbpsWalletLoading] = useState(true);
  const [isA1TopupWalletLoading, setIsA1TopupWalletLoading] = useState(true);
  const [isAslWalletRefreshing, setIsAslWalletRefreshing] = useState(false);
  const [isEkycHubRefreshing, setIsEkycHubRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("Today");
  const [isInspayWalletRefreshing, setIsInspayWalletRefreshing] =
    useState(false);
  const [isBbpsWalletRefreshing, setIsBbpsWalletRefreshing] = useState(false);
  const [isA1TopupWalletRefreshing, setIsA1TopupWalletRefreshing] = useState(false);

  const [payoutOpen, setPayout] = useState(false);
  const [walletType, setWalletType] = useState("bank");
  const [requestType, setRequestType] = useState("");
  const [amount, setAmount] = useState("1000");
  const [selectedBank, setSelectedBank] = useState(null);
  const [banks, setBanks] = useState([]);
  const scrollYRef = useRef(0);

  const [addBankOpen, setAddBankOpen] = useState(false);
  const [isTransferLoading, setIsTransferLoading] = useState(false);
  const [selectedAepsWallet, setSelectedAepsWallet] = useState("aeps2");
  const { showNotification } = useNotification();

  const AEPS_LABELS = {
    aeps1: "AEPS Wallet 1",
    aeps2: "AEPS Wallet 2",
  };
  const filters = ["Today", "Weekly", "Monthly", "Yearly"];

  // Get wallet data from Redux
  const alsWalletResponse = useSelector((state) => state?.wallet?.alsWallet);
  const ekycHubBalanceResponse = useSelector(
    (state) => state?.wallet?.ekycHubBalance,
  );
  const inspayWalletBalanceResponse = useSelector(
    (state) => state?.wallet?.inspayWalletBalance,
  );
  const bbpsWalletBalanceResponse = useSelector(
    (state) => state?.wallet?.bbpsWalletBalance,
  );
  const a1TopupWalletResponse = useSelector(
    (state) => state?.wallet?.a1TopupWallet,
  );
  const dashboardStatisticsResponse = useSelector(
    (state) => state?.wallet?.dashboardStatistics,
  );
  const walletBalanceResponse = useSelector(
    (state) => state?.wallet?.walletBalance,
  );
  const payoutBankListData = useSelector(
    (state) => state?.payout?.payoutBankList,
  );

  const aepswallet = useSelector((state) => state?.wallet?.walletBalance?.data);

  const isLoading = useSelector((state) => state?.loading?.isLoading || false);

  // Helper to format date as YYYY-MM-DD for dashboard statistics query
  const formatDateForApi = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Get date range for dashboard statistics based on active filter and selected day
  const getDateRangeForFilter = (filter, selectedDayLabel) => {
    const today = new Date();
    const todayIdx = today.getDay(); // 0 = Sun ... 6 = Sat

    // For "Today" filter, use the specific selected day within the current week
    if (filter === "Today") {
      const targetIdx = days.indexOf(selectedDayLabel);
      let targetDate = new Date(today);

      if (targetIdx !== -1 && targetIdx <= todayIdx) {
        const diff = todayIdx - targetIdx; // how many days back from today
        targetDate.setDate(today.getDate() - diff);
      }

      const dayStr = formatDateForApi(targetDate);
      return { fromDay: dayStr, toDay: dayStr };
    }

    const toDay = formatDateForApi(today);

    if (filter === "Weekly") {
      const from = new Date(today);
      from.setDate(from.getDate() - 6); // last 7 days including today
      return { fromDay: formatDateForApi(from), toDay };
    }

    if (filter === "Monthly") {
      const from = new Date(today.getFullYear(), today.getMonth(), 1); // first of month
      return { fromDay: formatDateForApi(from), toDay };
    }

    if (filter === "Yearly") {
      const from = new Date(today.getFullYear(), 0, 1); // Jan 1st
      return { fromDay: formatDateForApi(from), toDay };
    }

    // Fallback to today if filter is unknown
    return { fromDay: toDay, toDay };
  };

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

  // Fetch dashboard statistics whenever the filter or selected day changes
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const { fromDay, toDay } = getDateRangeForFilter(
          activeFilter,
          selectedDay,
        );
        const statsPayload = {
          query: {
            fromDay,
            toDay,
          },
          options: {
            sort: { id: -1 },
            page: 1,
            paginate: 25,
          },
          customSearch: {},
        };
        await dispatch(getDashboardStatistics(statsPayload));
      } catch (error) {
        console.error("Failed to fetch dashboard statistics:", error);
      }
    };

    fetchStatistics();
  }, [dispatch, activeFilter, selectedDay]);

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

  // Fetch BBPS wallet on component mount
  useEffect(() => {
    const fetchBbpsWalletBalance = async () => {
      setIsBbpsWalletLoading(true);
      try {
        await dispatch(getBbpsWalletBalance());
      } catch (error) {
        console.error("Failed to fetch BBPS wallet balance:", error);
      } finally {
        setIsBbpsWalletLoading(false);
      }
    };
    fetchBbpsWalletBalance();
  }, [dispatch]);

  // Fetch A1 Topup wallet on component mount
  useEffect(() => {
    const fetchA1TopupWallet = async () => {
      setIsA1TopupWalletLoading(true);
      try {
        await dispatch(getA1TopupWallet());
      } catch (error) {
        console.error("Failed to fetch A1 Topup wallet balance:", error);
      } finally {
        setIsA1TopupWalletLoading(false);
      }
    };
    fetchA1TopupWallet();
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

  // Update BBPS wallet balance when data is fetched
  useEffect(() => {
    if (bbpsWalletBalanceResponse?.data?.currentBalance || bbpsWalletBalanceResponse?.data?.balance) {
      setBbpsWalletBalance(bbpsWalletBalanceResponse.data.currentBalance || bbpsWalletBalanceResponse.data.balance);
    } else {
      setBbpsWalletBalance("0.00");
    }
  }, [bbpsWalletBalanceResponse]);

  // Update A1 Topup wallet balance when data is fetched
  // API response: { "status": "SUCCESS", "data": 139.03 }
  useEffect(() => {
    const responseData = a1TopupWalletResponse?.data;
    if (responseData !== undefined && responseData !== null) {
      if (typeof responseData === "number" || typeof responseData === "string") {
        // data is a plain number/string
        setA1TopupWalletBalance(responseData);
      } else if (responseData?.currentBalance ?? responseData?.balance ?? responseData?.walletBalance) {
        // data is an object with balance field
        setA1TopupWalletBalance(responseData.currentBalance ?? responseData.balance ?? responseData.walletBalance);
      } else {
        setA1TopupWalletBalance("0.00");
      }
    } else {
      setA1TopupWalletBalance("0.00");
    }
  }, [a1TopupWalletResponse]);

  // Format number with Indian locale
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return "₹0.00";
    const numValue = parseFloat(value) || 0;
    return `₹${numValue.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handlePayout = () => {
    setPayout(true);
  };

  const handleQuickAction = (tabName, roleNumber) => {
    navigate(`/superDashboard/members/user?tab=${tabName}`);
  };

  // Build chart data from dashboard statistics modules (fallback to static data if not available)
  const buildChartData = () => {
    const modules = dashboardStatisticsResponse?.data?.modules;

    const toNumber = (val) => {
      if (typeof val === "number") return val;
      const parsed = parseFloat(val);
      return Number.isNaN(parsed) ? 0 : parsed;
    };

    if (!modules) {
      // Fallback static data (old behavior)
      return [
        { name: "Practomind", value: 400 },
        { name: "ASL", value: 800 },
        { name: "BBPS", value: 1200 },
        { name: "Inspay", value: 1600 },
      ];
    }

    return [
      {
        name: modules.practomind?.label || "Practomind",
        value: toNumber(modules.practomind?.totalAmountSuccess),
      },
      {
        name: modules.asl?.label || "ASL",
        value: toNumber(modules.asl?.totalAmountSuccess),
      },
      {
        name: modules.bbps?.label || "BBPS",
        value: toNumber(modules.bbps?.totalAmountSuccess),
      },
      {
        // Single Inspay point (mobile + pan + dth combined via total)
        name: modules.inspay?.total?.label || "Inspay",
        value: toNumber(
          modules.inspay?.total?.totalAmountSuccess ??
          modules.inspay?.mobile?.totalAmountSuccess ??
          modules.inspay?.pan?.totalAmountSuccess ??
          modules.inspay?.dth?.totalAmountSuccess,
        ),
      },
    ];
  };

  const data = buildChartData();

  // Dynamic Y-axis max: highest value * 2 (gives more headroom at the peak)
  const maxChartValue =
    data && data.length
      ? Math.max(
        ...data.map((d) => (typeof d.value === "number" ? d.value : 0)),
      )
      : 0;
  const yAxisMax = maxChartValue > 0 ? maxChartValue * 2 : 100;
  const yAxisStep = yAxisMax / 5 || 1;
  const yAxisTicks = Array.from({ length: 6 }, (_, i) =>
    Math.round(i * yAxisStep),
  );

  const dashboardWallet = dashboardStatisticsResponse?.data?.wallet;
  const statusSummary = dashboardStatisticsResponse?.data?.statusSummary;

  const todayEarningAmount = dashboardWallet
    ? formatCurrency(dashboardWallet.totalSuccessAmount)
    : "₹4,21,40,238";

  const totalCommission = dashboardWallet?.totalSuperadminCommission ?? 0;

  const summaryItems = [
    {
      label: "Commission",
      value: dashboardWallet
        ? formatCurrency(dashboardWallet.totalSuperadminCommission)
        : "₹4",
      change: "",
      icon: Comission,
      bg: "bg-[#EBF5FF]", // Light blue
    },
    {
      label: "Successful Transactions",
      value: statusSummary?.totalSuccessCount ?? 0,
      change: "",
      icon: Transactions,
      bg: "bg-[#E3FAE9]", // Light green
    },
    {
      label: "Failed Transactions",
      value: statusSummary?.totalFailedCount ?? 0,
      change: "",
      icon: FailedTransactions,
      bg: "bg-[#FFF2EC]", // Light peach
    },
    {
      label: "Pending Transactions",
      value: statusSummary?.totalPendingCount ?? 0,
      change: "",
      icon: PendingTransactions,
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

  // Show skeleton loader while loading wallet balance, ASL wallet, Ekyc Hub wallet, Inspay wallet, or BBPS wallet
  if (
    isWalletLoading ||
    isAlsWalletLoading ||
    isEkycHubLoading ||
    isInspayWalletLoading ||
    isBbpsWalletLoading ||
    isA1TopupWalletLoading
  ) {
    return <SkeletonLoader />;
  }

  return (
    <div className="py-4 px-1  min-h-screen text-[#1B1717] space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow p-4 sm:p-6">
          {/* Header Section */}
          <div className="flex flex-col gap-3 mb-4">
            <h2 className="text-2xl font-[Gilroy-Medium] text-[#1B1717]">
              Today Earning
            </h2>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <p className="text-xl sm:text-2xl font-[Gilroy-Semibold] text-[#1B1717]">
                  {todayEarningAmount}
                </p>
                <span className="text-[#039155] text-xs font-[Gilroy-Semibold] flex items-center gap-1">
                  ▲ $40,238 (4.61%)
                </span>
              </div>

              {/* Weekday Buttons */}
              <div className="flex flex-wrap gap-2 justify-end">
                {days.map((day, index) => {
                  const isFutureDay = index > todayIndex;
                  const isActive = selectedDay === day;

                  const baseClasses =
                    "px-3 py-1 rounded-md text-xs[10px] sm:text-xs font-[Gilroy-Medium] transition-all";

                  const stateClasses = isActive
                    ? "bg-[#039155] text-white"
                    : isFutureDay
                      ? "border-[#1B1717]/20 text-[#1B1717]/40 border cursor-not-allowed"
                      : "border-[#1B1717]/50 text-[#1B1717] border hover:border-[#039155] hover:text-[#039155]";

                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={isFutureDay}
                      onClick={() => {
                        if (!isFutureDay) setSelectedDay(day);
                      }}
                      className={`${baseClasses} ${stateClasses}`}
                    >
                      {day}
                    </button>
                  );
                })}
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
                  domain={[0, yAxisMax]}
                  ticks={yAxisTicks}
                />

                {/* Tooltip to show amount on hover */}
                <Tooltip
                  cursor={{
                    stroke: "#10b981",
                    strokeWidth: 1,
                    strokeDasharray: "3 3",
                  }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const mainPoint =
                        payload.find((p) => p.dataKey === "value") ||
                        payload[0];
                      const amount =
                        mainPoint && typeof mainPoint.value === "number"
                          ? formatCurrency(mainPoint.value)
                          : mainPoint?.value;
                      return (
                        <div className="bg-white border border-[#E5E7EB] rounded-md px-3 py-2 shadow-sm text-xs text-[#1B1717]">
                          <div className="font-[Gilroy-Medium] mb-1">
                            {label}
                          </div>
                          <div className="font-[Gilroy-Semibold]">{amount}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
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
              <h4 className="text-[24px] font-[Gilroy-Medium] text-[#1B1717] mb-3">
                Main Wallet
              </h4>
              <p className="text-2xl lg:text-[28px] font-[Gilroy-Semibold] text-[#1B1717] mb-2">
                {formatCurrency(walletData.mainWallet)}
              </p>
              <span className="text-[#039155] text-[10px] lg:text-xs font-[Gilroy-Semibold] flex items-center gap-1 mb-3">
                ▲ 0.45%
              </span>
              <p className="text-[14px] lg:text-sm text-[#1B1717]/80 font-[Gilroy-Medium]">
                Today's Commission
                <strong className="text-[#1B1717] font-[Gilroy-Semibold]">
                  {" "}
                  {formatCurrency(totalCommission)}
                </strong>
              </p>
            </div>

            <button className="w-full bg-[#039155] hover:bg-[#027a47] text-white py-2 lg:py-2.5 rounded-xl font-[Gilroy-Semibold] text-sm lg:text-base transition shadow-sm">
              Account Transfer
            </button>
          </div>

          {/* AEPS Wallet */}
          <div className="bg-[#4FF2AD]/20 rounded-xl shadow-sm p-4 lg:p-5 flex-1 flex flex-col justify-between">
            <div>
              {/* Header with Select */}
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[24px] font-[Gilroy-Medium] text-[#1B1717]">
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
                        font-[Gilroy-Semibold]
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
              <p className="text-2xl lg:text-[28px] font-[Gilroy-Semibold] text-[#1B1717] mb-2">
                {formatCurrency(walletData[selectedAepsWallet])}
              </p>

              <span className="text-[#039155] text-[10px] lg:text-xs font-[Gilroy-Semibold] flex items-center gap-1 mb-3">
                ▲ 4.61%
              </span>

              <p className="text-xs lg:text-sm text-[#1B1717]/80 font-[Gilroy-Medium]">
                Today's Earning
                <strong className="text-[#1B1717] font-[Gilroy-Semibold]">
                  {" "}
                  {formatCurrency(totalCommission)}
                </strong>
              </p>
            </div>

            <button
              className="w-full bg-[#039155] hover:bg-[#027a47] text-white py-2 lg:py-2.5 rounded-xl disabled:opacity-90 disabled:cursor-not-allowed font-[Gilroy-Semibold] text-sm lg:text-base transition shadow-sm"
              // onClick={handlePayout}
              disabled
            >
              Wallet Transfer
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl shadow p-4 sm:p-6">
          <h3 className="font-[Gilroy-Semibold] text-[#1B1717] text-2xl mb-4">
            Overall Wallets
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {[...Array(6)].map((_, i) => {
              const isAslWallet = i === 0;
              const isEkycHubWallet = i === 1;
              const isInspayWallet = i === 2;
              const isBbpsWallet = i === 3;
              const isA1TopupWallet = i === 4;
              const walletName = isAslWallet
                ? "ASL Wallet"
                : isEkycHubWallet
                  ? "EKYC-HUB Wallet"
                  : isInspayWallet
                    ? "Inspay Wallet"
                    : isBbpsWallet
                      ? "BBPS Wallet"
                      : isA1TopupWallet
                        ? "A1 Topup Wallet"
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
                    : isBbpsWallet
                      ? bbpsWalletBalance
                        ? `₹${parseFloat(bbpsWalletBalance).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : "₹0.00"
                      : isA1TopupWallet
                        ? a1TopupWalletBalance
                          ? `₹${parseFloat(a1TopupWalletBalance).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : "₹0.00"
                        : "₹0.00";

              return (
                <div
                  key={i}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-3 sm:p-4 flex flex-col justify-between hover:shadow-md transition"
                >
                  <p className="font-[Gilroy-Medium] text-[#1B1717] text-base mb-1">
                    {walletName}
                  </p>
                  <p className="text-[#1B1717] font-[Gilroy-Semibold] text-sm sm:text-lg">
                    {(isAslWalletRefreshing && isAslWallet) ||
                      (isEkycHubRefreshing && isEkycHubWallet) ||
                      (isInspayWalletRefreshing && isInspayWallet) ||
                      (isBbpsWalletRefreshing && isBbpsWallet) ||
                      (isA1TopupWalletRefreshing && isA1TopupWallet)
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
                      } else if (isBbpsWallet) {
                        setIsBbpsWalletRefreshing(true);
                        dispatch(getBbpsWalletBalance())
                          .then(() => {
                            // The useEffect will update bbpsWalletBalance when response comes
                          })
                          .catch((error) => {
                            console.error(
                              "Failed to refresh BBPS wallet:",
                              error,
                            );
                          })
                          .finally(() => {
                            setIsBbpsWalletRefreshing(false);
                          });
                      } else if (isA1TopupWallet) {
                        setIsA1TopupWalletRefreshing(true);
                        dispatch(getA1TopupWallet())
                          .then(() => {
                            // The useEffect will update a1TopupWalletBalance when response comes
                          })
                          .catch((error) => {
                            console.error(
                              "Failed to refresh A1 Topup wallet:",
                              error,
                            );
                          })
                          .finally(() => {
                            setIsA1TopupWalletRefreshing(false);
                          });
                      }
                    }}
                    disabled={
                      (isAslWalletRefreshing && isAslWallet) ||
                      (isEkycHubRefreshing && isEkycHubWallet) ||
                      (isInspayWalletRefreshing && isInspayWallet) ||
                      (isBbpsWalletRefreshing && isBbpsWallet) ||
                      (isA1TopupWalletRefreshing && isA1TopupWallet)
                    }
                  >
                    {(isAslWalletRefreshing && isAslWallet) ||
                      (isEkycHubRefreshing && isEkycHubWallet) ||
                      (isInspayWalletRefreshing && isInspayWallet) ||
                      (isBbpsWalletRefreshing && isBbpsWallet) ||
                      (isA1TopupWalletRefreshing && isA1TopupWallet)
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
          <h3 className="font-[Gilroy-Medium] text-[#1B1717] text-2xl mb-5">
            Quick Action Buttons
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-3 gap-6 text-center">
            {[
              {
                type: "icon",
                icon: Users,
                label: "Employee",
                tabName: "Employee",
                roleNumber: 6,
                disabled: true,
              },
              {
                type: "icon",
                icon: Tag,
                label: "Whitelabel",
                tabName: "Whitelabel",
                roleNumber: 2,
              },
              {
                type: "img",
                src: MasterDt,
                label: "Master DT",
                tabName: "Master Distributor",
                roleNumber: 3,
              },
              {
                type: "img",
                src: Distributor,
                label: "Distributor",
                tabName: "Distributor",
                roleNumber: 4,
              },
              {
                type: "img",
                src: Ratailer,
                label: "Retailer",
                tabName: "Retailers",
                roleNumber: 5,
              },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center space-y-4">
                <button
                  onClick={() =>
                    !item.disabled &&
                    handleQuickAction(item.tabName, item.roleNumber)
                  }
                  className="bg-[#039155] w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-md hover:scale-105 hover:bg-[#027a47] transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#039155] focus:ring-offset-2"
                  aria-label={`Go to ${item.label}`}
                >
                  {item.type === "icon" ? (
                    <item.icon className="text-white w-6 h-6" />
                  ) : (
                    <img
                      src={item.src}
                      alt={item.label}
                      className="w-96 h-6 object-contain"
                    />
                  )}
                </button>
                <span className="text-sm font-[Gilroy-Semibold] text-[#1B1717]">
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
            <h3 className="font-[Gilroy-Medium] text-2xl text-[#1B1717]">
              Todays Summary
            </h3>
            <p className="text-sm text-[#1B1717]/80 font-[Gilroy-Medium] mt-3">
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
                      className={`relative z-10 text-xs font-[Gilroy-Medium] transition-colors ${activeFilter === label
                        ? "text-white font-[Gilroy-Semibold]"
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
                  className={`text-xs font-[Gilroy-Semibold] mb-6 ${item.change.startsWith("▲")
                    ? "text-[#039155]"
                    : "text-[#F60509]"
                    }`}
                >
                  {item.change}
                </span>
              </div>
              <div className="flex justify-between items-center w-full mb-2">
                <p className="text-[#1B1717] text-sm font-[Gilroy-Medium]">
                  {item.label}
                </p>
              </div>
              <p className="text-sm sm:text-lg font-[Gilroy-Semibold] text-[#1B1717]">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Details Matrix */}
        {/* <h3 className="font-[Gilroy-Medium] text-2xl text-[#1B1717]">
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
                  <p className="text-xs sm:text-sm font-[Gilroy-Medium] text-[#1B1717]">
                    {item.label}
                  </p>
                  <p className="font-[Gilroy-Semibold] text-[#1B1717] mt-1 text-sm sm:text-base">
                    {item.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div> */}
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
                           text-white text-sm font-[Gilroy-Semibold]"
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
      ${walletType === "wallet"
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
                            className={`p-4 border-[0.5px] rounded-[14px] cursor-pointer transition-all ${selectedBank === bank.id
                              ? "border-[#039155] bg-green-50"
                              : "border-[#1B1717] border-opacity-80"
                              }`}
                          >
                            <div className="flex items-start gap-4">
                              {/* Bank Logo */}
                              <div className="w-24 h-16 flex items-center justify-center shrink-0 relative">
                                <img
                                  src={bank.logo}
                                  alt={bank.name}
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
                                  <p className="text-sm font-[Gilroy-Medium] text-[#1B1717]">
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
                      <div className="w-6 h-6 rounded-full border-[#180404] border-2 border-current flex items-center justify-center text-[24px] text-[#180404] font-[Gilroy-Medium] leading-none">
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

                        // Map selected AEPS wallet to API aepsType (used for both wallet and bank transfers)
                        const aepsType =
                          selectedAepsWallet === "aeps1"
                            ? "AEPS1"
                            : selectedAepsWallet === "aeps2"
                              ? "AEPS2"
                              : undefined;

                        if (walletType === "wallet") {
                          // Get location data
                          const locationInfo = await getLocationAndIP();
                          //console.log("Wallet - Location Info:", locationInfo);
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
                            ...(aepsType ? { aepsType } : {}),
                          };
                        } else if (walletType === "bank") {
                          const locationInfo = await getLocationAndIP();
                          //console.log("Bank - Location Info:", locationInfo);
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
                            ...(aepsType ? { aepsType } : {}),
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
                          //console.log("Transfer successful:", response);
                          showNotification({
                            type: "success",
                            message:
                              response?.message ||
                              "Transfer completed successfully.",
                            isCritical: true,
                          });
                          setPayout(false);
                          // Reset form
                          setWalletType("bank");
                          setRequestType("");
                          setAmount("1000");
                          setSelectedBank(null);
                        } else {
                          console.error("Transfer failed:", response?.message);
                          showNotification({
                            type: "error",
                            message:
                              response?.message ||
                              "Failed to process transfer. Please try again.",
                            isCritical: true,
                          });
                        }
                      } catch (error) {
                        console.error("Error processing transfer:", error);
                        showNotification({
                          type: "error",
                          message:
                            error?.message ||
                            "An unexpected error occurred while processing the transfer.",
                          isCritical: true,
                        });
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
                    <label className="text-sm font-[Gilroy-Medium] text-[#121216] ">
                      Select Your Bank *
                    </label>
                    <select className="w-full h-[43px] mt-2 border border-[#1B1717]/80 rounded-lg px-4 text-[#1B1717] text-opacity-80">
                      <option>Select</option>
                    </select>
                  </div>

                  {/* Account Number */}
                  <div>
                    <label className="text-sm font-[Gilroy-Medium] text-[#121216] ">
                      Account Number *
                    </label>
                    <input
                      className="w-full h-[43px] mt-2 border-[0.5px] border-[#1B1717]/80 font-[Gilroy-Medium] text-[#1B1717]/80 rounded-lg px-4"
                      placeholder="Enter Account Number"
                    />
                  </div>

                  {/* IFSC */}
                  <div>
                    <label className="text-sm font-[Gilroy-Medium] text-[#121216] ">
                      IFSC Code *
                    </label>
                    <input
                      className="w-full h-[43px] mt-2 border-[0.5px] border-[#1B1717]/80 font-[Gilroy-Medium] text-sm text-[#1B1717]/80 rounded-lg px-4"
                      placeholder="Enter IFSC Code"
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-6">
                  <button
                    className="w-1/2 py-3 border-[0.5px] border-[#1B1717]/80 rounded-lg font-[Gilroy-Medium] text-[#1B1717]/80"
                    onClick={() => setAddBankOpen(false)}
                  >
                    Cancel
                  </button>

                  <button
                    className="w-1/2 py-3 bg-[#039155] text-white rounded-lg font-[Gilroy-Semibold] text-sm hover:bg-[#027a47] transition"
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
