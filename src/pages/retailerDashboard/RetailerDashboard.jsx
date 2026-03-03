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
import { useDispatch, useSelector } from "react-redux";
import {
  payoutBankList,
  payoutTransaction,
} from "../../redux/action/payoutAction";
import { getLocationAndIP } from "../../util/getLocationAndIP";
import { useNotification } from "../../context/NotificationContext";
import {
  getUserWalletBalance,
  getUserDashboardStatistics,
} from "../../redux/action/walletAction";
import { addBankDetails } from "../../redux/action/userProfileAction";
import { ButtonLoader } from "../../widgets/layout/loader";
import { FiChevronDown } from "react-icons/fi";

const RetailerDashboard = () => {
  const dispatch = useDispatch();
  const [payoutOpen, setPayout] = useState(false);
  const [walletType, setWalletType] = useState("bank");
  const [requestType, setRequestType] = useState("");
  const [amount, setAmount] = useState("1000");
  const [selectedBank, setSelectedBank] = useState(null);
  const [banks, setBanks] = useState([]);
  const scrollYRef = useRef(0);
  const [walletData, setWalletData] = useState({
    mainWallet: null,
    aeps1: null,
    aeps2: null,
  });
  const [isWalletLoading, setIsWalletLoading] = useState(true);
  const [addBankOpen, setAddBankOpen] = useState(false);
  const [isTransferLoading, setIsTransferLoading] = useState(false);
  const [selectedAepsWallet, setSelectedAepsWallet] = useState("aeps1");
  const [isBankLoading, setIsBankLoading] = useState(false);
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");
  const [isAddBankLoading, setIsAddBankLoading] = useState(false);
  const { showNotification } = useNotification();

  const AEPS_LABELS = {
    aeps1: "AEPS Wallet 1",
    aeps2: "AEPS Wallet 2",
  };
  // Get bank list from Redux
  const payoutBankListData = useSelector(
    (state) => state?.payout?.payoutBankList,
  );
  const walletBalanceResponse = useSelector(
    (state) => state?.wallet?.userWalletBalance,
  );
  const userDashboardStatisticsResponse = useSelector(
    (state) => state?.wallet?.userDashboardStatistics,
  );

  // Fetch wallet balance + user dashboard statistics on component mount
  useEffect(() => {
    const fetchBalance = async () => {
      setIsWalletLoading(true);
      try {
        await dispatch(getUserWalletBalance());
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        const todayStr = `${year}-${month}-${day}`;

        const statsPayload = {
          query: {
            fromDay: todayStr,
            toDay: todayStr,
          },
          options: {
            sort: { id: -1 },
            page: 1,
            paginate: 25,
          },
          customSearch: {},
        };

        await dispatch(getUserDashboardStatistics(statsPayload));
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
      const { mainWallet, apes1Wallet, apes2Wallet } =
        walletBalanceResponse.data;
      setWalletData({
        mainWallet: mainWallet || 0,
        aeps1: apes1Wallet || 0,
        aeps2: apes2Wallet || 0,
      });
    }
  }, [walletBalanceResponse]);

  // Format number with Indian locale
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return "₹0.00";
    const numValue = parseFloat(value) || 0;
    return `₹${numValue.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Build chart and table data from user dashboard statistics
  const services = userDashboardStatisticsResponse?.data?.services;

  const getService = (key) => services?.[key] || {};
  const getVolume = (key) => getService(key).totalVolume || 0;

  // Bar chart order: AEPS 1, AEPS 2, BBPS, Mobile, DTH, NSDL PAN, Payout
  const chartData = [
    {
      name: getService("aeps1").label || "AEPS 1",
      value: getVolume("aeps1"),
    },
    {
      name: getService("aeps2").label || "AEPS 2",
      value: getVolume("aeps2"),
    },
    {
      name: getService("bbps")?.label?.toUpperCase() || "BBPS",
      value: getVolume("bbps"),
    },
    {
      name: getService("mobile").label || "Mobile",
      value: getVolume("mobile"),
    },
    {
      name: getService("dth").label || "DTH",
      value: getVolume("dth"),
    },
    {
      name: getService("nsdlPan").label || "NSDL PAN",
      value: getVolume("nsdlPan"),
    },
    {
      name: getService("payout").label || "Payout",
      value: getVolume("payout"),
    },
  ];

  // Transaction table data from services
  const serviceKeys = ["aeps1", "aeps2", "bbps", "mobile", "dth", "nsdlPan", "payout"];
  const transactionData = serviceKeys.map((key) => {
    const svc = getService(key);

    // Special handling for BBPS to ensure it's always uppercase
    let serviceLabel = svc.label;
    if (key === "bbps") {
      serviceLabel = serviceLabel?.toUpperCase() || "BBPS";
    } else {
      serviceLabel = serviceLabel || key.charAt(0).toUpperCase() + key.slice(1);
    }

    return {
      service: serviceLabel,
      volume: svc.totalVolume || 0,
      count: svc.totalCount || 0,
      success: svc.successCount || 0,
      failed: svc.failedCount || 0,
      pending: svc.pendingCount || 0,
    };
  });

  // Total commission for header amount
  const totalCommission =
    userDashboardStatisticsResponse?.data?.commissions?.totalCommission ?? 0;

  // Quick Access Services data - 7 services with icons from Services.jsx
  const quickServices = [
    {
      name: getService("aeps1").label || "AEPS 1",
      icon: "/img/AEPS.svg",
      amount: formatCurrency(getVolume("aeps1")),
      key: "aeps1",
    },
    {
      name: getService("aeps2").label || "AEPS 2",
      icon: "/img/AEPS.svg",
      amount: formatCurrency(getVolume("aeps2")),
      key: "aeps2",
    },
    {
      name: getService("bbps")?.label?.toUpperCase() || "BBPS",
      icon: "/img/BBPS.svg",
      amount: formatCurrency(getVolume("bbps")),
      key: "bbps",
    },
    {
      name: getService("mobile").label || "Mobile",
      icon: "/img/MobileRecharge.svg",
      amount: formatCurrency(getVolume("mobile")),
      key: "mobile",
    },
    {
      name: getService("dth").label || "DTH",
      icon: "/img/DTH1.svg",
      amount: formatCurrency(getVolume("dth")),
      key: "dth",
    },
    {
      name: getService("nsdlPan").label || "NSDL PAN",
      icon: "/img/PanCorrection.svg",
      amount: formatCurrency(getVolume("nsdlPan")),
      key: "nsdlPan",
    },
    {
      name: getService("payout").label || "Payout",
      icon: "/img/DMT.svg", // Using DMT icon as placeholder for Payout
      amount: formatCurrency(getVolume("payout")),
      key: "payout",
    },
  ];

  const handlePayout = () => {
    setPayout(true);
  };

  // Fetch bank list when modal opens
  useEffect(() => {
    if (payoutOpen) {
      const fetchBanks = async () => {
        setIsBankLoading(true);
        try {
          const response = await dispatch(payoutBankList({}));
          if (response?.status === "SUCCESS" && response?.data?.banks) {
            // Transform API data to match component format
            const transformedBanks = response.data.banks.map((bank, index) => ({
              id: bank.id?.toString() || index.toString(),
              name: bank.bankName || "",
              logo: bank.bankLogo,
              accountNumber: bank.accountNumber || "",
              ifscCode: bank.ifscCode || "",
            }));
            setBanks(transformedBanks);
            // Set first bank as selected if available
            if (transformedBanks.length > 0 && !selectedBank) {
              setSelectedBank(transformedBanks[0].id);
            }
          }
        } catch (error) {
          console.error("Failed to fetch banks:", error);
        } finally {
          setIsBankLoading(false);
        }
      };
      fetchBanks();
    }
  }, [payoutOpen, dispatch]);

  // Also use Redux data if available
  useEffect(() => {
    if (
      payoutBankListData?.data?.banks &&
      payoutBankListData.data.banks.length > 0
    ) {
      const transformedBanks = payoutBankListData.data.banks.map(
        (bank, index) => ({
          id: bank.id?.toString() || index.toString(),
          name: bank.bankName || "",
          logo: "/img/kotak-logo.png",
          accountNumber: bank.accountNumber || "",
          ifscCode: bank.ifsc || "",
        }),
      );
      setBanks(transformedBanks);
      if (transformedBanks.length > 0 && !selectedBank) {
        setSelectedBank(transformedBanks[0].id);
      }
    }
  }, [payoutBankListData]);

  useEffect(() => {
    if (payoutOpen) {
      // Save current scroll position
      scrollYRef.current = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollYRef.current}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
    } else {
      // Restore scroll position
      const scrollY = scrollYRef.current;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "unset";
      window.scrollTo(0, scrollY);
    }
    return () => {
      // Cleanup: reset styles only
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "unset";
    };
  }, [payoutOpen]);

  // Skeleton loader component
  const SkeletonLoader = () => (
    <div className="min-h-screen text-[#1B1717] py-4 px-1 animate-pulse">
      {/* ================= Chart + Wallet Section ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {/* ===== Chart Skeleton (COMPACT) ===== */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-3 sm:p-4 lg:p-6 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="h-[20px] bg-gray-200 rounded w-44" />
            <div className="h-[24px] bg-gray-200 rounded w-16" />
          </div>

          {/* Amount */}
          <div className="mb-3">
            <div className="flex items-center gap-3">
              <div className="h-[24px] bg-gray-200 rounded w-52" />
              <div className="h-[12px] bg-gray-200 rounded w-20" />
            </div>
          </div>

          {/* Chart area */}
          <div className="flex-1 w-full bg-gray-200 rounded min-h-[280px] sm:min-h-[320px] lg:min-h-[380px]" />
        </div>

        <div className="flex flex-col gap-3 sm:gap-4 lg:gap-5 h-full">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-[#4FF2AD]/20 rounded-xl shadow-sm p-4 lg:p-5 flex-1 flex flex-col justify-between"
            >
              {/* Content */}
              <div className="space-y-3">
                {/* Title */}
                <div className="h-[24px] bg-gray-300 rounded w-40" />

                {/* Amount */}
                <div className="h-[32px] bg-gray-300 rounded w-44" />

                {/* Percentage */}
                <div className="h-[14px] bg-gray-300 rounded w-24" />

                {/* Sub text */}
                <div className="h-[16px] bg-gray-300 rounded w-48" />
              </div>

              {/* Button — matches py-2 / py-2.5 */}
              <div className="h-[40px] lg:h-[44px] bg-gray-300 rounded-xl mt-4" />
            </div>
          ))}
        </div>
      </div>

      {/* ================= Quick Access Services (COMPACT) ================= */}
      <div className="py-4 px-2">
        <div className="h-[20px] bg-gray-200 rounded w-52 mb-4" />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-3 sm:p-4 flex items-start gap-[28px]"
            >
              {/* Icon */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gray-200 rounded-full shrink-0" />

              {/* Text */}
              <div className="flex-1">
                <div className="h-[14px] bg-gray-200 rounded w-40 mb-2" />
                <div className="h-[18px] bg-gray-200 rounded w-24 mt-3" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= Recent Transactions Table ================= */}
      <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 lg:p-6 mb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="h-[20px] bg-gray-200 rounded w-44" />
          <div className="flex gap-2">
            <div className="h-[24px] bg-gray-200 rounded w-28" />
            <div className="h-[24px] bg-gray-200 rounded w-16" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b bg-gray-100">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <th key={i} className="py-2.5 px-3">
                    <div className="h-[12px] bg-gray-200 rounded w-20" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((row) => (
                <tr key={row} className="border-b">
                  {[1, 2, 3, 4, 5, 6].map((cell) => (
                    <td key={cell} className="py-2.5 px-3">
                      <div className="h-[12px] bg-gray-200 rounded w-16" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Show skeleton loader while loading
  if (isWalletLoading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="min-h-screen text-[#1B1717] py-4 px-1">
      {/* Header Section */}

      {/* Chart and Wallet Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {/* ===== Left: Recent Transaction Chart ===== */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-3 sm:p-4 lg:p-6 h-full flex flex-col">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
            <h3 className="text-lg sm:text-xl lg:text-[24px] font-[Gilroy-Medium] text-[#1B1717]">
              Recent Transaction
            </h3>
            <button className="px-3 py-1.5 text-[10px] sm:text-xs font-[Gilroy-Medium] rounded-2xl text-[#1B1717]/80 border-[0.5px] border-[#1B1717]/80 transition w-full sm:w-auto">
              Today
            </button>
          </div>

          {/* Amount */}
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
                    tick={{ fontSize: 12, fill: "#1B1717", fontWeight: 400 }}
                    domain={[
                      0,
                      Math.max(
                        1,
                        Math.max(...chartData.map((d) => d.value || 0)) * 1.5,
                      ),
                    ]}
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
                  ₹200
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
                  ₹200
                </strong>
              </p>
            </div>

            <button
              className="w-full bg-[#039155] hover:bg-[#027a47] text-white py-2 lg:py-2.5 rounded-xl font-[Gilroy-Semibold] text-sm lg:text-base transition shadow-sm"
              onClick={handlePayout}
            >
              Wallet Transfer
            </button>
          </div>
        </div>
      </div>

      {/* Quick Access Services */}
      <div className=" py-4 px-2">
        <h3 className="text-lg sm:text-xl lg:text-[24px] font-[Gilroy-Medium] text-[#1B1717] mb-4">
          Quick Access Services
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {quickServices.map((service, index) => (
            <div
              key={index}
              className="bg-[#FFFFFF] rounded-2xl p-3 sm:p-4 flex items-start gap-[28px] transition cursor-pointer"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full bg-[#DBEAFE] flex items-center justify-center shrink-0 relative">
                <img
                  src={service.icon}
                  alt={service.name}
                  className=" object-contain"
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
            <div className="relative inline-flex items-center">
              <select
                className="
                appearance-none
                h-[26px]
                sm:h-[30px]
                lg:h-[34px]
                pl-3
                pr-9
                text-xs
                font-['Gilroy-Medium']
                border border-[#1B1717]/80
                rounded-2xl
                text-[#1B1717]/80
                bg-white
                focus:outline-none
                cursor-pointer
                flex items-center
                "
              >
                <option value="">Select Services</option>
                <option value="recharge">Recharge</option>
                <option value="aeps">AEPS</option>
                <option value="bbps">BBPS</option>
              </select>

              {/* Chevron icon */}
              <FiChevronDown
                className="
                pointer-events-none
                absolute
                right-3
                top-1/2
                -translate-y-1/2
                text-[#1B1717]/80
                text-sm
                "
              />
            </div>

            <button
              className="h-[26px]
                sm:h-[30px]
                lg:h-[34px] pl-3
                pr-3 text-xs font-['Gilroy-Medium'] hover:bg-gray-200 rounded-2xl border border-[#1B1717]/80 text-[#1B1717]/80 transition whitespace-nowrap"
            >
              Today
            </button>
          </div>
        </div>

        <div className="overflow-x-auto -mx-3 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full">
              <thead>
                <tr className="border-b bg-[#FAFAFA] border-gray-200 ">
                  <th className="text-left py-2.5 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap rounded-tl-xl">
                    Service
                  </th>
                  <th className="text-center py-2.5 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    Volume
                  </th>
                  <th className="text-center py-2.5 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    Count
                  </th>
                  <th className="text-center py-2.5 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    Success
                  </th>
                  <th className="text-center py-2.5 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap">
                    Failed
                  </th>
                  <th className="text-center py-2.5 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-[Gilroy-Medium] text-[#1B1717] whitespace-nowrap rounded-tr-xl">
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
                    <td className="py-2.5 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs text-[#121216] font-[Gilroy-Semibold] whitespace-nowrap">
                      {row.service}
                    </td>
                    <td className="py-2.5 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs text-[#121216] whitespace-nowrap text-center font-[gilroy-regular]">
                      {formatCurrency(row.volume)}
                    </td>
                    <td className="py-2.5 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs text-[#121216] whitespace-nowrap text-center font-[gilroy-regular ">
                      {row.count}
                    </td>
                    <td className="py-2.5 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs text-[#039155] font-[Gilroy-Semibold] whitespace-nowrap text-center">
                      {row.success}
                    </td>
                    <td className="py-2.5 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs text-[#D66000] font-[Gilroy-Semibold] whitespace-nowrap text-center">
                      {row.failed}
                    </td>
                    <td className="py-2.5 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs text-[#E32424] font-[Gilroy-Semibold] whitespace-nowrap text-center">
                      {row.pending}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {payoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#D9D9D9CC]">
          <div className="bg-white rounded-3xl w-[90%] max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative m-4">
            {isBankLoading && (
              <div className="flex h-[300px] items-center justify-center">
                <ButtonLoader color="#039155" size={40} />
              </div>
            )}
            {!isBankLoading && !addBankOpen && (
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
               hover:bg-[#027a47] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    disabled={isTransferLoading}
                    onClick={async () => {
                      setIsTransferLoading(true);
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
                          // console.log("Wallet - Location Info:", locationInfo);
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
                          await dispatch(getUserWalletBalance());
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
            {!isBankLoading && addBankOpen && (
              <>
                <h2 className="text-2xl font-['Gilroy-Medium'] text-[#1B1717] mb-6">
                  Enter Your Bank Details
                </h2>

                <div className="space-y-4">
                  {/* Account Number */}
                  <div>
                    <label className="text-sm font-[Gilroy-Medium] text-[#121216] ">
                      Account Number *
                    </label>
                    <input
                      className="w-full h-[43px] mt-2 border-[0.5px] border-[#1B1717]/80 font-[Gilroy-Medium] text-[#1B1717]/80 rounded-lg px-4"
                      placeholder="Enter Account Number"
                      value={bankAccountNumber}
                      onChange={(e) =>
                        setBankAccountNumber(e.target.value.replace(/\D/g, ""))
                      }
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
                      value={bankIfsc}
                      onChange={(e) =>
                        setBankIfsc(e.target.value.toUpperCase())
                      }
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-6">
                  <button
                    className="w-1/2 py-3 border-[0.5px] border-[#1B1717]/80 rounded-lg font-[Gilroy-Medium] text-[#1B1717]/80"
                    onClick={() => {
                      setAddBankOpen(false);
                      setBankAccountNumber("");
                      setBankIfsc("");
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    className="w-1/2 py-3 bg-[#039155] text-white rounded-lg font-[Gilroy-Semibold] text-sm hover:bg-[#027a47] transition disabled:opacity-50"
                    disabled={isAddBankLoading}
                    onClick={async () => {
                      if (!bankAccountNumber || !bankIfsc) {
                        showNotification({
                          type: "error",
                          message: "Please enter account number and IFSC code",
                          isCritical: true,
                        });
                        return;
                      }

                      setIsAddBankLoading(true);

                      try {
                        const payload = {
                          account_number: bankAccountNumber,
                          ifsc: bankIfsc,
                        };

                        await dispatch(addBankDetails(payload));

                        showNotification({
                          type: "success",
                          message: "Bank added successfully",
                          isCritical: true,
                        });

                        // Refresh bank list for payout screen
                        await dispatch(payoutBankList({}));

                        // Reset & go back
                        setBankAccountNumber("");
                        setBankIfsc("");
                        setAddBankOpen(false);
                      } catch (error) {
                        showNotification({
                          type: "error",
                          message:
                            error?.message ||
                            "Failed to add bank details. Please try again.",
                          isCritical: true,
                        });
                      } finally {
                        setIsAddBankLoading(false);
                      }
                    }}
                  >
                    {isAddBankLoading ? "Saving..." : "Save"}
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

export default RetailerDashboard;
