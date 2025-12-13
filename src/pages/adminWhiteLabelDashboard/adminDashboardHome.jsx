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
        { name: "GIBL", value: 7000 },
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
        <div className="min-h-screen text-[#1B1717] space-y-4 sm:space-y-6">
            {/* Top KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                {kpiCards.map((card, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-xl shadow-md p-3 sm:p-4 lg:p-5"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className="text-xs sm:text-sm lg:text-base text-[#1B1717] mb-1">{card.title}</p>
                                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1B1717] mb-1">
                                    {card.value}
                                </p>
                                <p className="text-xs text-white text-[12px] rounded-2xl bg-[#039155] px-2 sm:px-3 py-1 sm:py-1.5 w-fit">{card.subtitle}</p>
                            </div>
                            <div className="flex rounded-full text-[#1B1717] bg-[#039155] p-3 sm:p-4 lg:p-5">
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
                {/* Recent Transaction Chart - Left */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-3 sm:p-4 lg:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
                        <h3 className="text-lg sm:text-xl lg:text-[24px] font-medium text-[#1B1717]">
                            Recent Transaction
                        </h3>
                        <button className="px-3 py-1.5 text-xs sm:text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition w-full sm:w-auto">
                            Today
                        </button>
                    </div>

                    <div className="mb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-[#1B1717]">
                                $4,21,40,238
                            </p>
                            <span className="text-green-600 text-xs sm:text-sm font-medium flex items-center gap-1">
                            ▼
                                $40,238 
                                (4.61%)
                            </span>
                        </div>
                    </div>

                    <div className="w-full overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                        <div className="h-80 sm:h-96 lg:h-[450px] min-w-[600px] sm:min-w-0">
                            <ResponsiveContainer width="100%" height="100%" minHeight={320}>
                                <BarChart
                                    data={chartData}
                                    barCategoryGap="15%"
                                    margin={{ top: 5, right: 10, left: 5, bottom: 50 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 12, fill: "#1B1717", fontWeight: 500 }}
                                        textAnchor="middle"
                                        height={60}
                                        interval={0}
                                        tickMargin={8}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        domain={[500, 8000]}
                                        tick={{ fontSize: 12, fill: "#1B1717", fontWeight: 500 }}
                                        ticks={[500, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000]}
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
                                        wrapperStyle={{
                                            outline: "none",
                                        }}
                                    />
                                    <Bar
                                        dataKey="value"
                                        fill="#039155"
                                        radius={[4, 4, 0, 0]}
                                        barSize={43}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Wallet Cards - Right */}
                <div className="flex flex-col gap-3 sm:gap-4 lg:gap-5 h-full">
                    {/* Main Wallet */}
                    <div className="bg-green-50 rounded-xl shadow-sm p-4 lg:p-5 flex-1 flex flex-col">
                        <div>
                            <h4 className="text-[24px] font-medium text-[#1B1717] mb-3">
                                Main Wallet
                            </h4>
                            <p className="text-xl lg:text-2xl font-bold text-[#1B1717] mb-2">
                                ₹4,21,40,238
                            </p>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-green-600 text-xs lg:text-sm font-medium flex items-center gap-1">
                                ▼
                                    4.6%
                                </span>
                            </div>
                            <p className="text-xs lg:text-sm text-gray-600 mb-3">
                                Todays Commission ₹200
                            </p>
                        </div>
                        <button className="w-full bg-[#039155] hover:bg-[#027a47] text-white py-2 lg:py-2.5 rounded-lg font-medium text-sm lg:text-base transition shadow-sm mt-4">
                            Account Transfer
                        </button>
                    </div>

                    {/* AEPS Wallet */}
                    <div className="bg-green-50 rounded-xl shadow-sm p-4 lg:p-5 flex-1 flex flex-col">
                        <div>
                            <h4 className="text-[24px] font-medium text-[#1B1717] mb-3">
                                AEPS Wallet
                            </h4>
                            <p className="text-xl lg:text-2xl font-bold text-[#1B1717] mb-2">
                                ₹4,21,40,238
                            </p>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-green-600 text-xs lg:text-sm font-medium flex items-center gap-1">
                                ▼
                                    4.4%
                                </span>
                            </div>
                            <p className="text-xs lg:text-sm text-gray-600 mb-3">
                                Todays Earning ₹200
                            </p>
                        </div>
                        <button className="w-full bg-[#039155] hover:bg-[#027a47] text-white py-2 lg:py-2.5 rounded-lg font-medium text-sm lg:text-base transition shadow-sm mt-4">
                            Wallet Transfer
                        </button>
                    </div>
                </div>
            </div>

            {/* Recent Transaction Table */}
            <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4">
                    <h3 className="text-lg sm:text-xl lg:text-[24px] font-medium text-[#1B1717]">
                        Recent Transaction
                    </h3>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <select className="px-2 py-1.5 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039155]">
                            <option>Select Services</option>
                        </select>
                        <button className="px-2 py-1.5 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition whitespace-nowrap">
                            Today
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto -mx-3 sm:mx-0">
                    <div className="inline-block min-w-full align-middle">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b bg-gray-100 border-gray-200">
                                    <th className="text-left py-2.5 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-[#1B1717] whitespace-nowrap">
                                        Service
                                    </th>
                                    <th className="text-left py-2.5 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-[#1B1717] whitespace-nowrap">
                                        Volume
                                    </th>
                                    <th className="text-left py-2.5 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-[#1B1717] whitespace-nowrap">
                                        Count
                                    </th>
                                    <th className="text-left py-2.5 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-[#1B1717] whitespace-nowrap">
                                        Success
                                    </th>
                                    <th className="text-left py-2.5 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-[#1B1717] whitespace-nowrap">
                                        Failed
                                    </th>
                                    <th className="text-left py-2.5 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-[#1B1717] whitespace-nowrap">
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
                                        <td className="py-2.5 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-[#1B1717] whitespace-nowrap">
                                            {row.service}
                                        </td>
                                        <td className="py-2.5 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-[#1B1717] whitespace-nowrap">
                                            {row.volume}
                                        </td>
                                        <td className="py-2.5 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-[#1B1717] whitespace-nowrap">
                                            {row.count}
                                        </td>
                                        <td className="py-2.5 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-green-600 font-medium whitespace-nowrap">
                                            {row.success}
                                        </td>
                                        <td className="py-2.5 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-orange-600 font-medium whitespace-nowrap">
                                            {row.failed}
                                        </td>
                                        <td className="py-2.5 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-red-600 font-medium whitespace-nowrap">
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

export default AdminDashboardHome;

