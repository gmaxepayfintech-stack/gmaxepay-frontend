import { useState, useEffect } from "react";
import {
    XAxis,
    YAxis,
    ResponsiveContainer,
    CartesianGrid,
    BarChart,
    Bar,
    Tooltip,
} from "recharts";

const Distributor = "/img/DistributorM.png";
const Ratailer = "/img/MRetailer.png";
const Earning = "/img/Earning.png";

const MasterDistDashboard = () => {

    const [payoutOpen, setPayout] = useState(false);
    const [walletType, setWalletType] = useState("Move To Bank");
    const [requestType, setRequestType] = useState("");
    const [amount, setAmount] = useState("1000");
    const [selectedBank, setSelectedBank] = useState("kotak");

    // Bank data
    const banks = [
        {
            id: "kotak",
            name: "Kotak Mahindra Bank",
            logo: "/img/kotak-logo.png",
            accountNumber: "XXXXXX2333",
            ifscCode: "KKBK0002333"
        },
        {
            id: "yes",
            name: "Yes Bank",
            logo: "/img/yes-bank-logo.png",
            accountNumber: "XXXXXX2333",
            ifscCode: "KKBK0002333"
        },
        {
            id: "axis",
            name: "Axis Bank",
            logo: "/img/axis-bank-logo.png",
            accountNumber: "XXXXXX2333",
            ifscCode: "KKBK0002333"
        },
        {
            id: "sbi",
            name: "State Bank of India",
            logo: "/img/sbi-logo.png",
            accountNumber: "XXXXXX2333",
            ifscCode: "KKBK0002333"
        }
    ];

    // Chart data for Recent Transaction - Monthly data (Jan-Dec)
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
        { service: "Recharge", volume: "3208", count: "13", success: "08", failed: "02", pending: "06" },
        { service: "Recharge", volume: "3208", count: "13", success: "08", failed: "02", pending: "06" },
        { service: "Recharge", volume: "3208", count: "13", success: "08", failed: "02", pending: "06" },
        { service: "Recharge", volume: "3208", count: "13", success: "08", failed: "02", pending: "06" },
        { service: "Recharge", volume: "3208", count: "13", success: "08", failed: "02", pending: "06" },
        { service: "Recharge", volume: "3208", count: "13", success: "08", failed: "02", pending: "06" },
        { service: "Recharge", volume: "3208", count: "13", success: "08", failed: "02", pending: "06" },
    ];

    // Quick Access Services data
    const quickServices = [
        { name: "Mobile & DTH Recharge", icon: "/img/MobileIcon.svg", amount: "₹ 20542" },
        { name: "DMT-1", icon: "/img/MobileIcon.svg", amount: "₹ 20542" },
        { name: "Micro ATM", icon: "/img/MobileIcon.svg", amount: "₹ 20542" },
        { name: "CMS-1", icon: "/img/MobileIcon.svg", amount: "₹ 20542" },
        { name: "BBPS", icon: "/img/MobileIcon.svg", amount: "₹ 20542" },
        { name: "DMT-2", icon: "/img/MobileIcon.svg", amount: "₹ 20542" },
        { name: "CMS-2", icon: "/img/MobileIcon.svg", amount: "₹ 20542" },
        { name: "Indo-Nepal DMT", icon: "/img/MobileIcon.svg", amount: "₹ 20542" },
        { name: "Mobile & DTH Recharge", icon: "/img/MobileIcon.svg", amount: "₹ 20542" },
    ];

    const kpiCards = [
        {
            title: "Distributor",
            value: "138",
            subtitle: "Today's Earning +12",
            icon: Distributor,
        },
        {
            title: "Retailer",
            value: "38",
            subtitle: "Today's Earning +12",
            icon: Ratailer,
        },
        {
            title: "Today's Earning",
            value: "382821",
            subtitle: "Today's Earning +12",
            icon: Earning,
        },
    ];

    const handlePayout = () => {
        setPayout(true);
    }

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (payoutOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [payoutOpen]);

    return (
        <div className="min-h-screen text-[#1B1717] space-y-4 sm:space-y-6">
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
                                <p className="text-[24px]  font-['Gilroy-Medium'] text-[#1B1717] mb-1">{card.title}</p>
                                <p className="text-[28px] font-['Gilroy-SemiBold'] text-[#1B1717] mb-2">
                                    {card.value}
                                </p>
                                {card.title !== "Today's Earning" && (
                                    <p className="text-xs text-white text-[12px] font-['Gilroy-Medium'] rounded-2xl bg-[#039155] px-2 sm:px-3 py-1 sm:py-1.5 w-fit">{card.subtitle}</p>
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
                                ▲
                                +0.24% Today
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
                                        domain={[0, 7000]}
                                        tick={{ fontSize: 12, fill: "#1B1717", fontWeight: 500 }}
                                        ticks={[0, 1000, 2000, 3000, 4000, 5000, 6000, 7000]}
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
                                        radius={[8, 8, 0, 0]}
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
                                    ▲  0.45%
                                </span>
                            </div>
                            <p className="text-[14px] lg:text-sm text-gray-600 mb-3">
                                Today's Commission:<strong className="text-[#1B1717]"> ₹200</strong>
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
                                    ▲  0.45%
                                </span>
                            </div>
                            <p className="text-xs lg:text-sm text-gray-600 mb-3">
                                Today's Earning: <strong className="text-[#1B1717]"> ₹200</strong>
                            </p>
                        </div>
                        <button className="w-full bg-[#039155] hover:bg-[#027a47] text-white py-2 lg:py-2.5 rounded-lg font-medium text-sm lg:text-base transition shadow-sm mt-4"
                            onClick={() => handlePayout()}
                        >
                            Wallet Transfer
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Access Services */}
            <div className=" p-3 sm:p-4 lg:p-6">
                <h3 className="text-lg sm:text-xl lg:text-[24px] font-medium text-[#1B1717] mb-4">
                    Quick Access Services
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                    {quickServices.map((service, index) => (
                        <div
                            key={index}
                            className="bg-[#FFFFFF] rounded-xl p-3 sm:p-4 flex items-start gap-[28px] transition cursor-pointer"
                        >
                            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full bg-blue-100 flex items-center justify-center shrink-0 relative">
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
                                <p className="text-[16px] font-['Gilroy-Medium'	] text-[#000000] mb-1 line-clamp-2">
                                    {service.name}
                                </p>
                                <p className="text-[18px] font-['Gilroy-SemiBold'] text-[#000000] mt-[19px]">
                                    {service.amount}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Transaction Table */}
            <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4">
                    <h3 className="text-[24px] font-['Gilroy-Medium'] text-[#1B1717]">
                        Recent Transaction
                    </h3>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <select className="px-2 py-1.5 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 text-xs border border-gray-300 rounded-3xl text-opacity-80">
                            <option className="text-[12px] font-['Gilroy-Medium'] text-[#1B1717] text-opacity-80">Select Services</option>
                        </select>
                        <button className="px-2 py-1.5 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 text-[12px] font-['Gilroy-Medium'] hover:bg-gray-200 rounded-3xl border border-gray-300 text-opacity-80 transition whitespace-nowrap">
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
                                    <th className="text-center py-2.5 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-[#1B1717] whitespace-nowrap">
                                        Volume
                                    </th>
                                    <th className="text-center py-2.5 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-[#1B1717] whitespace-nowrap">
                                        Count
                                    </th>
                                    <th className="text-center py-2.5 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-[#1B1717] whitespace-nowrap">
                                        Success
                                    </th>
                                    <th className="text-center py-2.5 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-[#1B1717] whitespace-nowrap">
                                        Failed
                                    </th>
                                    <th className="text-center py-2.5 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-[#1B1717] whitespace-nowrap">
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
                                        <td className="py-2.5 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-[#1B1717] whitespace-nowrap">
                                            {row.service}
                                        </td>
                                        <td className="py-2.5 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-[#1B1717] whitespace-nowrap text-center">
                                            {row.volume}
                                        </td>
                                        <td className="py-2.5 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-[#1B1717] whitespace-nowrap text-center">
                                            {row.count}
                                        </td>
                                        <td className="py-2.5 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-green-600 font-medium whitespace-nowrap text-center">
                                            {row.success}
                                        </td>
                                        <td className="py-2.5 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-orange-600 font-medium whitespace-nowrap text-center">
                                            {row.failed}
                                        </td>
                                        <td className="py-2.5 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-red-600 font-medium whitespace-nowrap text-center">
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
                <div className="fixed top-0 left-0 right-0 bottom-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm m-0 p-0">
                    <div className="bg-white rounded-xl w-[90%] max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
                        <h2 className="text-[24px] font-['Gilroy-Medium'] mb-[21px] text-[#1B1717]">
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
                                        className="text-[14px] font-['Gilroy-Medium'] text-[#1B1717] mb-4 "
                                    >
                                        Wallet Type
                                    </label>
                                    <select
                                        id="walletType"
                                        value={walletType}
                                        onChange={(e) => setWalletType(e.target.value)}
                                        className="w-full px-4  h-[43px] border border-[#1B1717] focus:outline-none border-opacity-50 rounded-lg "
                                    >
                                        <option value="Move To Bank" className="text-12px font['Gilroy-Medium'] text-[#1B1717] text-opacity-80">Move To Bank</option>
                                        <option value="Move To Wallet" className="text-12px font['Gilroy-Medium'] text-[#1B1717] text-opacity-80">Move To Wallet</option>
                                    </select>
                                </div>

                                {/* Request Type */}
                                <div>
                                    <label
                                        htmlFor="requestType"
                                        className="text-[14px] font-['Gilroy-Medium'] text-[#1B1717] mb-2 "
                                    >
                                        Request Type
                                    </label>
                                    <select
                                        id="requestType"
                                        value={requestType}
                                        onChange={(e) => setRequestType(e.target.value)}
                                        className="w-full px-4  h-[43px] border border-[#1B1717] focus:outline-none border-opacity-50 rounded-lg "
                                    >
                                        <option value="" className="text-12px font['Gilroy-Medium'] text-[#1B1717] text-opacity-80">Select</option>
                                        <option value="Immediate">Immediate</option>
                                        <option value="Scheduled" className="text-12px font['Gilroy-Medium'] text-[#1B1717] text-opacity-80">Scheduled</option>
                                    </select>
                                </div>

                            </div>


                            {/* Amount To Withdrawal */}
                            <div className="">
                                <label htmlFor="amount" className="block text-[14px] font-['Gilroy-Medium'] text-[#1B1717] mb-2">
                                    Amount To Withdrawal
                                </label>
                                <div className="relative text-[24px]">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1B1717] text-opacity-80">₹</span>
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
                        <div className="mb-6">
                            <h3 className="text-[14px] text-[#1B1717] font-['Gilroy-Medium'] mb-2">
                                Settlements Banks Added
                            </h3>
                            <div className="space-y-3 max-h-56 overflow-y-auto">
                                {banks.map((bank) => (
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
                                        className={`p-4 border-[0.5px] rounded-3xl cursor-pointer transition-all ${selectedBank === bank.id
                                            ? "border-[#039155] bg-green-50"
                                            : "border-[#1B1717] border-opacity-80"
                                            }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* Bank Logo */}
                                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center ">
                                                <img
                                                    src={bank.logo}
                                                    alt={bank.name}
                                                    className="w-10 h-10 object-cover"
                                                    onError={(e) => {
                                                        e.target.style.display = "none";
                                                        e.target.nextSibling.style.display = "block";
                                                    }}
                                                />
                                                <span className=" text-[12px] font-['Gilroy-SemiBold'] text-['#1B1717']">
                                                    {bank.name.substring(0, 2).toUpperCase()}
                                                </span>
                                            </div>

                                            {/* Bank Details */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        Bank Name: {bank.name}
                                                    </p>
                                                    {/* FIX: remove margin that increases card height and center the indicator */}
                                                    {selectedBank === bank.id && (
                                                        <div className="w-[24px] h-[24px] rounded-full bg-[#039155]
                  flex items-center justify-center self-center">
                                                            <div className="w-[8px] h-[8px] rounded-full bg-white" />
                                                        </div>
                                                    )}

                                                </div>
                                                <p className="text-[12px] font-['Gilroy-Medium'] text-gray-600 mb-1">
                                                    Account Number: <span className="text-[#1B1717]">{bank.accountNumber}</span>
                                                </p>
                                                <p className="text-[12px] font-['Gilroy-Medium'] text-gray-600">
                                                    IFSC Code: <span className="text-[#1B1717]">{bank.ifscCode}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex w-full gap-3 pt-4 border-gray-200">
                            <button
                                className="w-1/2 px-6 py-4 text-[18px] rounded-lg border border-gray-300 bg-[#FFFFFF]
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
                                onClick={() => {
                                    console.log("Processing transfer:", {
                                        walletType,
                                        requestType,
                                        amount,
                                        selectedBank,
                                    });
                                    setPayout(false);
                                }}
                            >
                                Processed Transfer
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>


    );
};

export default MasterDistDashboard;



