import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiRefreshCw, FiArrowLeft } from "react-icons/fi";
import {
  getEmployeeAlsWallet,
  getEmployeeWalletBalance,
  getEmployeeEkycHubBalance,
  getEmployeeInspayWalletBalance,
  getEmployeeBbpsWalletBalance,
  getEmployeeA1TopupWallet,
  getEmployeePaynidiWalletBalance,
  getEmployeeDashboardStatistics,
} from "../../redux/action/walletAction";

const EmployeeDash = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const viewHistory = searchParams.get("viewHistory");
  const showWalletHistory = viewHistory === "wallet-history";

  const [refreshingWallet, setRefreshingWallet] = useState(null);
  const [isWalletLoading, setIsWalletLoading] = useState(true);

  // Redux state selectors
  const alsWallet = useSelector((state) => state?.wallet?.employeeWalletAls);
  const mainWalletData = useSelector((state) => state?.wallet?.employeeWalletBalance);
  const ekycHubBalance = useSelector((state) => state?.wallet?.employeeEkycHubBalance);
  const inspayWalletBalance = useSelector((state) => state?.wallet?.employeeInspayWalletBalance);
  const bbpsWalletBalance = useSelector((state) => state?.wallet?.employeeBbpsWalletBalance);
  const a1TopupWallet = useSelector((state) => state?.wallet?.employeeA1TopupWallet);
  const paynidiWalletBalance = useSelector((state) => state?.wallet?.employeePaynidiWalletBalance);
  const statsResponse = useSelector((state) => state?.wallet?.employeeDashboardStatistics);

  // Extract balances helper
  const getBalance = (response, key = "balance") => {
    if (!response?.data) return 0;
    if (typeof response.data === "number" || typeof response.data === "string") return parseFloat(response.data) || 0;
    return parseFloat(response.data[key]) || 0;
  };

  const walletData = {
    mainWallet: mainWalletData?.data?.mainWallet || 0,
    aeps1: mainWalletData?.data?.apes1Wallet || 0,
    aeps2: mainWalletData?.data?.apes2Wallet || 0,
  };

  // Clean the paynidi balance specifically as it often comes in a 'message' string
  const rawPaynidi = paynidiWalletBalance?.data?.message || paynidiWalletBalance?.data || 0;
  const paynidiBalance = !isNaN(parseFloat(rawPaynidi)) ? rawPaynidi : 0;

  const overallWallets = [
    { id: "main", name: "Main Wallet", balance: walletData.mainWallet, action: getEmployeeWalletBalance },
    { id: "als", name: "Als Wallet", balance: alsWallet?.data?.data?.openingBalance || 0, action: getEmployeeAlsWallet },
    { id: "ekyc", name: "Ekyc Hub Wallet", balance: getBalance(ekycHubBalance), action: getEmployeeEkycHubBalance },
    { id: "inspay", name: "Inspay Wallet", balance: getBalance(inspayWalletBalance), action: getEmployeeInspayWalletBalance },
    { id: "bbps", name: "BBPS Wallet", balance: getBalance(bbpsWalletBalance, "currentBalance") || getBalance(bbpsWalletBalance), action: getEmployeeBbpsWalletBalance },
    { id: "a1", name: "A1 Topup Wallet", balance: getBalance(a1TopupWallet), action: getEmployeeA1TopupWallet },
    { id: "paynidi", name: "Paynidi Wallet", balance: paynidiBalance, action: getEmployeePaynidiWalletBalance },
  ];

  // Initial Data Fetching
  useEffect(() => {
    const fetchData = async () => {
      setIsWalletLoading(true);
      try {
        await Promise.all([
          dispatch(getEmployeeWalletBalance()),
          dispatch(getEmployeeAlsWallet()),
          dispatch(getEmployeeEkycHubBalance()),
          dispatch(getEmployeeInspayWalletBalance()),
          dispatch(getEmployeeBbpsWalletBalance()),
          dispatch(getEmployeeA1TopupWallet()),
          dispatch(getEmployeePaynidiWalletBalance()),
        ]);

        const today = new Date().toISOString().split("T")[0];
        const statsPayload = {
          query: { fromDay: today, toDay: today },
          options: { sort: { id: -1 }, page: 1, paginate: 25 },
          customSearch: {},
        };
        await dispatch(getEmployeeDashboardStatistics(statsPayload));
      } finally {
        setIsWalletLoading(false);
      }
    };
    fetchData();
  }, [dispatch]);

  const formatAmount = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return "₹0.00";
    return `₹${num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleRefreshWallet = async (walletId, action) => {
    setRefreshingWallet(walletId);
    if (action) await dispatch(action());
    setRefreshingWallet(null);
  };

  const weeklyRevenue = statsResponse?.data?.wallet?.totalSuccessAmount || 0;


  if (isWalletLoading) {
    return (
      <div className="min-h-screen text-[#1B1717] space-y-4 sm:space-y-6 py-4">
        <div className="bg-white rounded-xl shadow-sm p-5 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-40 mb-5" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[...Array(7)].map((_, i) => (
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

  if (showWalletHistory) {
    return (
      <div className="min-h-screen text-[#1B1717] space-y-6 py-1">
        <div className="flex items-center gap-4 mb-4">
          <button 
            onClick={() => setSearchParams({})}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiArrowLeft size={24} />
          </button>
          <h3 className="text-2xl font-[Gilroy-Medium]">Wallet History</h3>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-gray-500 text-center py-10">Wallet History component coming soon or integrated here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-[#1B1717] space-y-6 py-1">
      {/* ── Overall Wallets ── */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 lg:p-6">
        <h3 className="text-[24px] sm:text-2xl font-[Gilroy-Medium] text-[#1B1717] mb-5">
          Overall Wallets
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {overallWallets.map((wallet) => (
            <div
              key={wallet.id}
              className="bg-[#FAFAFA] border border-gray-100 rounded-xl p-3 sm:p-4 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow"
            >
              <p className="text-[14px] sm:text-sm font-[Gilroy-Medium] text-[#1B1717] leading-snug">
                {wallet.name}
              </p>
              <p className="text-[16px] sm:text-[15px] font-[Gilroy-Semibold] text-[#1B1717]">
                {formatAmount(wallet.balance)}
              </p>
              <button
                onClick={() => handleRefreshWallet(wallet.id, wallet.action)}
                className="flex items-center justify-center gap-1.5 bg-[#039155] hover:bg-[#027a47] text-white text-[12px] font-[Gilroy-Semibold] py-2 rounded-full transition-colors w-full"
              >
                Refresh
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main Wallet Card ── */}
      <div className="max-w-xs">
        <div className="bg-[#E8FBF3] rounded-xl p-5 lg:p-6 w-full flex flex-col gap-2">
          <h4 className="text-xl font-[Gilroy-Medium] text-[#1B1717]">Main Wallet</h4>
          <p className="text-2xl lg:text-[30px] font-[Gilroy-Semibold] text-[#1B1717]">
            {formatAmount(walletData.mainWallet)}
          </p>
          <p className="text-[#039155] text-xs font-[Gilroy-Semibold] flex items-center gap-1">
            ▲ Live
          </p>
          <p className="text-xs sm:text-sm text-[#1B1717]/70 font-[Gilroy-Medium]">
            Today's Revenue is{" "}
            <strong className="text-[#1B1717] font-[Gilroy-Semibold]">
              {formatAmount(weeklyRevenue)}
            </strong>
          </p>
          <button
            onClick={() => setSearchParams({ viewHistory: "wallet-history" })}
            className="mt-1 w-full bg-[#039155] hover:bg-[#027a47] text-white py-2.5 rounded-full font-[Gilroy-Semibold] text-sm transition-colors"
          >
            Payment History
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDash;