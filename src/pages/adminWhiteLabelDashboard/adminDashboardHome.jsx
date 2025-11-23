import {
    XAxis,
    YAxis,
    ResponsiveContainer,
    CartesianGrid,
    BarChart,
    Bar,
    Tooltip,
} from "recharts";

const MasterDt = "/img/MasterDt.png";
const Distributor = "/img/Distributor.png";
const Ratailer = "/img/Retailer.png";

const AdminDashboardHome = () => {
    // Chart data for Recent Transaction
    const chartData = [
        { name: "DMT", value: 2000 },
        { name: "AEPS", value: 4000 },
        { name: "BBPS", value: 7000 },
        { name: "FastTag", value: 5000 },
        { name: "CC", value: 1000 },
        { name: "LIC", value: 4000 },
        { name: "Recharge", value: 8000 },
        { name: "UTI Pan", value: 7000 },
        { name: "NSDL Pan", value: 2000 },
        { name: "BIMA", value: 1000 },
        { name: "GBL", value: 7000 },
    ];

    // Transaction table data
    const transactionData = [
        { service: "Recharge", volume: "3208", count: "13", success: "08", failed: "02", pending: "06" },
        { service: "Recharge", volume: "3208", count: "13", success: "08", failed: "02", pending: "06" },
        { service: "Recharge", volume: "3208", count: "13", success: "08", failed: "02", pending: "06" },
        { service: "Recharge", volume: "3208", count: "13", success: "08", failed: "02", pending: "06" },
        { service: "Recharge", volume: "3208", count: "13", success: "08", failed: "02", pending: "06" },
        { service: "Recharge", volume: "3208", count: "13", success: "08", failed: "02", pending: "06" },
        { service: "Recharge", volume: "3208", count: "13", success: "08", failed: "02", pending: "06" },
        { service: "Recharge", volume: "3208", count: "13", success: "08", failed: "02", pending: "06" },
    ];

    const kpiCards = [
        {
            title: "Master Distributor",
            value: "238",
            subtitle: "Today Member + 12",
            icon: MasterDt,
        },
        {
            title: "Distributor",
            value: "138",
            subtitle: "Today Member + 12",
            icon: Distributor,
        },
        {
            title: "Retailer",
            value: "38",
            subtitle: "Today Member + 12",
            icon: Ratailer,
        },
    ];

    return (
        <div className="min-h-screen text-[#1B1717] space-y-6">
            {/* Top KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
                {kpiCards.map((card, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-xl shadow-md p-4 lg:p-5 "
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className="text-sm lg:text-base text-[#1B1717] mb-1">{card.title}</p>
                                <p className="text-2xl lg:text-3xl font-bold text-[#1B1717] mb-1">
                                    {card.value}
                                </p>
                                <p className="text-xs lg:text-sm text-white text-[12px] rounded-2xl bg-[#039155] px-3 py-1.5 w-fit">{card.subtitle}</p>
                            </div>
                            <div className="flex rounded-full text-[#1B1717] bg-[#039155] p-5">
                                <img
                                    src={card.icon}
                                    alt={card.title}
                                    className="w-8 h-8 lg:w-8 lg:h-8 object-contain"
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                {/* Recent Transaction Chart - Left */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-4 lg:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className=" text-[24px] font-medium text-[#1B1717]">
                            Recent Transaction
                        </h3>
                        <button className="px-3 py-1.5 lg:px-4 lg:py-2 text-xs lg:text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition">
                            Today
                        </button>
                    </div>

                    <div className="mb-4">
                        <div className="flex items-center gap-3 mb-2">
                            <p className="text-xl lg:text-2xl font-bold text-[#1B1717]">
                                $4,21,40,238
                            </p>
                            <span className="text-green-600 text-xs lg:text-sm font-medium flex items-center gap-1">
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                                $40,238 (4.47%)
                            </span>
                        </div>
                    </div>

                    <div className="h-64 lg:h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} barCategoryGap="20%">
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 10 }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                />
                                <YAxis
                                    domain={[0, 8000]}
                                    tick={{ fontSize: 10 }}
                                    tickCount={9}
                                />
                                <Tooltip
                                    cursor={false}
                                    contentStyle={{
                                        backgroundColor: "#fff",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "8px",
                                    }}
                                    wrapperStyle={{
                                        outline: "none",
                                    }}
                                />
                                <Bar
                                    dataKey="value"
                                    fill="#039155"
                                    radius={[4, 4, 0, 0]}
                                    barSize={35}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Wallet Cards - Right */}
                <div className="space-y-4 lg:space-y-5">
                    {/* Main Wallet */}
                    <div className="bg-green-50 rounded-xl shadow-sm p-4 lg:p-5">
                        <h4 className="text-[24px] font-medium text-[#1B1717] mb-3">
                            Main Wallet
                        </h4>
                        <p className="text-xl lg:text-2xl font-bold text-[#1B1717] mb-2">
                            ₹4,21,40,238
                        </p>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-green-600 text-xs lg:text-sm font-medium flex items-center gap-1">
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                                4.6%
                            </span>
                        </div>
                        <p className="text-xs lg:text-sm text-gray-600 mb-3">
                            Todays Commission ₹200
                        </p>
                        <button className="w-full bg-[#039155] hover:bg-[#027a47] text-white py-2 lg:py-2.5 rounded-lg font-medium text-sm lg:text-base transition shadow-sm">
                            Account Transfer
                        </button>
                    </div>

                    {/* AEPS Wallet */}
                    <div className="bg-green-50 rounded-xl shadow-sm p-4 lg:p-5">
                        <h4 className="text-[24px] font-medium text-[#1B1717] mb-3">
                            AEPS Wallet
                        </h4>
                        <p className="text-xl lg:text-2xl font-bold text-[#1B1717] mb-2">
                            ₹4,21,40,238
                        </p>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-green-600 text-xs lg:text-sm font-medium flex items-center gap-1">
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                                4.4%
                            </span>
                        </div>
                        <p className="text-xs lg:text-sm text-gray-600 mb-3">
                            Todays Earning ₹200
                        </p>
                        <button className="w-full bg-[#039155] hover:bg-[#027a47] text-white py-2 lg:py-2.5 rounded-lg font-medium text-sm lg:text-base transition shadow-sm">
                            Wallet Transfer
                        </button>
                    </div>
                </div>
            </div>

            {/* Recent Transaction Table */}
            <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[24px] font-medium text-[#1B1717]">
                        Recent Transaction
                    </h3>
                    <div className="flex items-center gap-3">
                        <select className="px-3 py-1.5 lg:px-4 lg:py-2 text-xs lg:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155]">
                            <option>Select Services</option>
                        </select>
                        <button className="px-3 py-1.5 lg:px-4 lg:py-2 text-xs lg:text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition">
                            Today
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b bg-gray-100 border-gray-200">
                                <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717]">
                                    Service
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717]">
                                    Volume
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717]">
                                    Count
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717]">
                                    Success
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717]">
                                    Failed
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-[#1B1717]">
                                    Pending
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactionData.map((row, index) => (
                                <tr
                                    key={index}
                                    className="border-b border-gray-100 bg-white"
                                >
                                    <td className="py-3 px-4 text-sm text-[#1B1717]">
                                        {row.service}
                                    </td>
                                    <td className="py-3 px-4 text-sm text-[#1B1717]">
                                        {row.volume}
                                    </td>
                                    <td className="py-3 px-4 text-sm text-[#1B1717]">
                                        {row.count}
                                    </td>
                                    <td className="py-3 px-4 text-sm text-green-600 font-medium">
                                        {row.success}
                                    </td>
                                    <td className="py-3 px-4 text-sm text-orange-600 font-medium">
                                        {row.failed}
                                    </td>
                                    <td className="py-3 px-4 text-sm text-red-600 font-medium">
                                        {row.pending}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardHome;

