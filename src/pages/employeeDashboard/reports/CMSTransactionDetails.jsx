import React, { useState } from "react";
import PropTypes from "prop-types";
import { FileText } from "lucide-react";
import MainWalletStatement from "./MainWalletStatement";
import { HiArrowLeft } from "react-icons/hi2";

const CMSTransactionDetails = ({ transactionData, onBack }) => {
    const [showMainWalletStatement, setShowMainWalletStatement] = useState(false);
    console.log("TransactioDetails received transactionData:", transactionData);

    // Helper function to get role name from role number
    const getRoleName = (roleNumber) => {
        const roleMap = {
            1: "Super Admin",
            2: "White Label Partner",
            3: "Master Distributor",
            4: "Distributor",
            5: "Retailer",
        };
        return roleMap[roleNumber] || `Role ${roleNumber}`;
    };

    // DUMMY DATA FOR CMS TRANSACTION DETAILS
    const dummyTransactionData = {
        data: {
            userDetails: {
                name: "Ramesh Sharma",
                userRole: 5,
                userId: "AG00123",
                mobileNo: "9876543210"
            },
            reportingUserDetails: {
                companyName: "GMax ePay",
                parentName: "Suresh Patel",
                parentRole: 4,
                parentUserId: "AG00100"
            },
            transactionDetails: {
                bankName: "Airtel Payments Bank",
                aadharNumber: "123456789012",
                amount: 500,
                commission: 2.50,
                depositNumber: "DEP00129",
                billerId: "BILL88210",
                depositType: "Cash",
                txnId: "TXN1029384756",
                refNo: "REF9876543210",
                remark: "Monthly subscription"
            },
            transaction: {
                retailerCom: 5.00,
                retailerComTDS: 0.25
            }
        }
    };

    const activeTransactionData = (!transactionData || Object.keys(transactionData).length === 0)
        ? dummyTransactionData
        : transactionData;

    const calculateCommissionData = () => {
        // Extract core payload if coming from Redux wrapper
        const payload = activeTransactionData?.data || activeTransactionData;

        // The data might be at the root of payload or nested in payload.transaction
        const transaction = payload.transaction || payload;

        // Helper to format currency
        const formatC = (val) => `₹${(parseFloat(val) || 0).toFixed(4)}`;

        const comms = [];

        // Super Admin Commission
        if (transaction.superadminComm !== undefined || transaction.superAdminComm !== undefined) {
            comms.push({
                name: "Super Admin",
                commissions: formatC(transaction.superadminComm || transaction.superAdminComm),
                tds: "₹0.0000",
                net: formatC(transaction.superadminComm || transaction.superAdminComm)
            });
        }

        // White Label Commission
        if (transaction.whitelabelComm !== undefined || transaction.whiteLabelComm !== undefined) {
            comms.push({
                name: "White Label",
                commissions: formatC(transaction.whitelabelComm || transaction.whiteLabelComm),
                tds: "₹0.0000",
                net: formatC(transaction.whitelabelComm || transaction.whiteLabelComm)
            });
        }

        // Master Distributor Commission
        if (transaction.masterDistributorCom !== undefined || transaction.mdCom !== undefined) {
            comms.push({
                name: "Master Distributor",
                commissions: formatC(transaction.masterDistributorCom || transaction.mdCom),
                tds: "₹0.0000",
                net: formatC(transaction.masterDistributorCom || transaction.mdCom)
            });
        }

        // Distributor Commission
        if (transaction.distributorCom !== undefined || transaction.distCom !== undefined) {
            comms.push({
                name: "Distributor",
                commissions: formatC(transaction.distributorCom || transaction.distCom),
                tds: "₹0.0000",
                net: formatC(transaction.distributorCom || transaction.distCom)
            });
        }

        // Retailer Commission (with TDS)
        const retailerCom =
            transaction.retailerCom ??
            transaction.retailerComm ??
            transaction.retailerCommission ??
            transaction.commission ??
            0;
        const retailerComTDS =
            transaction.retailerComTDS ??
            transaction.retailerCommTDS ??
            transaction.retailerTds ??
            transaction.tds ??
            0;

        const rComm = parseFloat(retailerCom) || 0;
        const rTds = parseFloat(retailerComTDS) || 0;
        const rNet = rComm - rTds;

        comms.push({
            name: "Retailer",
            commissions: formatC(rComm),
            tds: formatC(rTds),
            net: formatC(rNet),
        });

        return comms;
    };



    // Calculate total commission
    const calculateTotalCommission = () => {
        const commissionData = calculateCommissionData();
        const total = commissionData.reduce((sum, item) => {
            const net = parseFloat(item.net.replace("₹", "")) || 0;
            return sum + net;
        }, 0);
        return `₹${total.toFixed(2)}`;
    };

    const commissionData = calculateCommissionData();
    const totalCommission = calculateTotalCommission();

    /*
    // Show error or no data message
    if (!transactionData || Object.keys(transactionData).length === 0) {
      console.log("No transaction data found. Data is empty or null.", transactionData);
      return (
        <div className="min-h-screen bg-[#FAFAFA] p-3 sm:p-4 md:p-6 text-[#1B1717]">
          <div className="mb-4 sm:mb-6">
            <button
              onClick={onBack || (() => globalThis.history?.back())}
              className="flex items-center text-[#1B1717] hover:text-[#039155] transition mb-4"
            >
              <div className="rounded-full p-1.5 bg-[#FFFFFF] border border-[#1B1717] transition">
                <HiArrowLeft className="text-2xl text-[#1B1717] opacity-80" />
              </div>
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <p className="text-base sm:text-lg font-['Gilroy-Medium'] text-gray-500">
              No transaction details found
            </p>
          </div>
        </div>
      );
    }
    */

    // If MainWalletStatement should be shown, render it
    if (showMainWalletStatement) {
        return (
            <MainWalletStatement onBack={() => setShowMainWalletStatement(false)} />
        );
    }

    // Setup a common payload pointing to either activeTransactionData or activeTransactionData.data
    const payload = activeTransactionData?.data || activeTransactionData;

    return (
        <div className="min-h-screen bg-[#FAFAFA] px-3 py-2 text-[#1B1717]">
            {/* Header Section */}
            <div className="mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2 sm:mb-3">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <button
                            onClick={onBack || (() => globalThis.history?.back())}
                            className="flex items-center text-[#1B1717] hover:text-[#039155] transition"
                        >
                            <div className="rounded-full p-1.5 bg-[#FFFFFF] border border-[#1B1717]/80 transition">
                                <HiArrowLeft className="text-2xl text-[#1B1717] opacity-80" />
                            </div>
                        </button>
                        <div>
                            <h1 className="text-lg sm:text-xl md:text-2xl font-['Gilroy-Medium'] text-[#1B1717]">
                                Transaction Details
                            </h1>
                            <p className="text-[16px] font-['Gilroy-Regular'] sm:text-base md:text-lg text-[#1B1717] mt-1">
                                Complete Overview Of Transaction
                            </p>
                        </div>
                    </div>
                    {/* <button
            onClick={() => setShowMainWalletStatement(true)}
            className="flex items-center gap-2 bg-[#039155] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-green-700 transition shadow-md whitespace-nowrap"
          >
            <span className="font-[Gilroy-Medium] text-white text-sm">
              Main Wallet Statement
            </span>
            <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-white " />
          </button> */}
                </div>
            </div>

            {/* Three Information Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                {/* User Details Card */}
                <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
                    <div className="bg-[#039155] px-4 py-3 flex items-center gap-2">
                        <img
                            src="/img/taxUserProfile.svg"
                            alt="User Details"
                            className="w-[35px] h-[35px]"
                        />
                        <h3 className="text-white font-['Gilroy-Semibold'] text-sm sm:text-base">
                            User Details
                        </h3>
                    </div>
                    <div className="p-4 sm:p-6">
                        <div className="space-y-3 sm:space-y-4">
                            <div>
                                <p className="text-xs sm:text-sm text-[#1B1717]/80 font-[Gilroy-Medium] mb-1">
                                    Name
                                </p>
                                <p className="text-sm sm:text-base font-['Gilroy-Semibold'] text-[#1B1717]">
                                    {payload?.user?.name || payload?.userDetails?.name || "N/A"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm text-[#1B1717]/80 font-[Gilroy-Medium] mb-1">
                                    Role
                                </p>
                                <p className="text-sm sm:text-base font-['Gilroy-Semibold'] text-[#1B1717]">
                                    {payload?.user?.role || payload?.userDetails?.userRole
                                        ? getRoleName(payload?.user?.role || payload?.userDetails?.userRole)
                                        : "N/A"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm text-[#1B1717]/80 font-[Gilroy-Medium] mb-1">
                                    Agent Code
                                </p>
                                <p className="text-sm sm:text-base font-['Gilroy-Semibold'] text-[#1B1717]">
                                    {payload?.user?.userId || payload?.userDetails?.userId || "N/A"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm text-[#1B1717]/80 font-[Gilroy-Medium] mb-1">
                                    User Mobile
                                </p>
                                <p className="text-sm sm:text-base font-['Gilroy-Semibold'] text-[#1B1717]">
                                    {payload?.mobileNo || payload?.user?.mobileNo || payload?.userDetails?.mobileNo || "N/A"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Parent Details Card */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-[#039155] px-4 py-3 flex items-center gap-2">
                        <img
                            src="/img/taxParentProfile.svg"
                            alt="Parent Details"
                            className="w-[35px] h-[35px]"
                        />
                        <h3 className="text-white font-['Gilroy-Medium'] text-sm sm:text-base">
                            Parent Details
                        </h3>
                    </div>
                    <div className="p-4 sm:p-6">
                        <div className="space-y-3 sm:space-y-4">
                            <div>
                                <p className="text-xs sm:text-sm text-[#1B1717]/80 font-[Gilroy-Medium] mb-1">
                                    Company Name
                                </p>
                                <p className="text-sm sm:text-base font-['Gilroy-Semibold'] text-[#1B1717]">
                                    {payload?.reportingUserDetails?.companyName || "N/A"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm text-[#1B1717]/80 font-[Gilroy-Medium] mb-1">
                                    Parent Name
                                </p>
                                <p className="text-sm sm:text-base font-['Gilroy-Semibold'] text-[#1B1717]">
                                    {payload?.reportingUserDetails?.parentName || "N/A"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm text-[#1B1717]/80 font-[Gilroy-Medium] mb-1">
                                    Parent Role
                                </p>
                                <p className="text-sm sm:text-base font-['Gilroy-Semibold'] text-[#1B1717]">
                                    {payload?.reportingUserDetails?.parentRole
                                        ? getRoleName(
                                            payload.reportingUserDetails.parentRole,
                                        )
                                        : "N/A"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm text-[#1B1717]/80 font-[Gilroy-Medium] mb-1">
                                    Parent Code
                                </p>
                                <p className="text-sm sm:text-base font-['Gilroy-Semibold'] text-[#1B1717]">
                                    {payload?.reportingUserDetails?.parentUserId || "N/A"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transaction Details Card */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-[#039155] px-4 py-3 flex items-center gap-2">
                        <img
                            src="/img/taxTransactionDetails.svg"
                            alt="Transaction Details"
                            className="w-[35px] h-[35px]"
                        />
                        <h3 className="text-white font-['Gilroy-Medium'] text-sm sm:text-base">
                            Transaction Details
                        </h3>
                    </div>
                    <div className="p-4 sm:p-6">
                        <div className="space-y-3 sm:space-y-4">
                            <div>
                                <p className="text-xs sm:text-sm text-[#1B1717]/80 font-[Gilroy-Medium] mb-1">
                                    Bank Name / Biller
                                </p>
                                <p className="text-sm sm:text-base font-['Gilroy-Semibold'] text-[#1B1717]">
                                    {payload?.bankName || payload?.billerName || payload?.transactionDetails?.bankName || "N/A"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm text-[#1B1717]/80 font-[Gilroy-Medium] mb-1">
                                    Aadhar Number
                                </p>
                                <p className="text-sm sm:text-base font-['Gilroy-Semibold'] text-[#1B1717]">
                                    {payload?.aadharNo || payload?.aadharNumber || payload?.transactionDetails?.aadharNumber
                                        ? `${(payload?.aadharNo || payload?.aadharNumber || payload?.transactionDetails?.aadharNumber).slice(0, 4)} ${(payload?.aadharNo || payload?.aadharNumber || payload?.transactionDetails?.aadharNumber).slice(4, 8)} ${(payload?.aadharNo || payload?.aadharNumber || payload?.transactionDetails?.aadharNumber).slice(8, 12)} ****`
                                        : "N/A"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm text-[#1B1717]/80 font-[Gilroy-Medium] mb-1">
                                    Amount
                                </p>
                                <p className="text-sm sm:text-base font-['Gilroy-Semibold'] text-[#1B1717]">
                                    {payload?.amount || payload?.transactionDetails?.amount
                                        ? `₹${payload?.amount || payload?.transactionDetails?.amount}`
                                        : "N/A"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm text-[#1B1717]/80 font-[Gilroy-Medium] mb-1">
                                    Commission
                                </p>
                                <p className="text-sm sm:text-base font-['Gilroy-Semibold'] text-[#1B1717]">
                                    {payload?.commission || payload?.transactionDetails?.commission
                                        ? `₹${(payload?.commission || payload?.transactionDetails?.commission).toFixed(2)}`
                                        : "N/A"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm text-[#1B1717]/80 font-[Gilroy-Medium] mb-1">
                                    TXN ID
                                </p>
                                <p className="text-sm sm:text-base font-['Gilroy-Semibold'] text-[#1B1717]">
                                    {payload?.referenceId || payload?.txnId || payload?.transactionDetails?.txnId || "N/A"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm text-[#1B1717]/80 font-[Gilroy-Medium] mb-1">
                                    REF NO / UTR
                                </p>
                                <p className="text-sm sm:text-base font-['Gilroy-Semibold'] text-[#1B1717]">
                                    {payload?.utr || payload?.ackno || payload?.refNo || payload?.transactionDetails?.refNo || "N/A"}
                                </p>
                            </div>
                            {payload?.remark && (
                                <div>
                                    <p className="text-xs sm:text-sm text-[#1B1717]/80 font-[Gilroy-Medium] mb-1">
                                        Remark
                                    </p>
                                    <p className="text-sm sm:text-base font-['Gilroy-Semibold'] text-[#1B1717]">
                                        {payload?.remark}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Commission Details Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Header */}
                <div className="bg-[#039155] px-4 py-3 flex items-center gap-2">
                    <img
                        src="/img/taxCommissionDetails.svg"
                        alt="Commission Details"
                        className="w-[35px] h-[35px]"
                    />
                    <h3 className="text-white font-['Gilroy-Semibold'] text-sm sm:text-base">
                        Commission Details
                    </h3>
                </div>

                <div className="p-2">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            {/* Table Head */}
                            <thead>
                                <tr className="">
                                    <th className="px-4 py-2 text-left text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]/70">
                                        Name
                                    </th>
                                    <th className="px-4 py-2 text-right text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]/70">
                                        Commissions
                                    </th>
                                    <th className="px-4 py-2 text-right text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]/70">
                                        TDS
                                    </th>
                                    <th className="px-4 py-2 text-right text-xs sm:text-sm font-['Gilroy-Medium'] text-[#1B1717]/70">
                                        Net
                                    </th>
                                </tr>
                            </thead>

                            {/* Table Body */}
                            <tbody>
                                {commissionData.length > 0 ? (
                                    <>
                                        {commissionData.map((row, index) => (
                                            <tr key={index} className="">
                                                <td className="px-4 py-3 text-sm sm:text-base font-['Gilroy-Semibold'] text-[#1B1717]">
                                                    {row.name}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm sm:text-base font-['Gilroy-Semibold'] text-[#1B1717]">
                                                    {row.commissions}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm sm:text-base font-['Gilroy-Semibold'] text-[#1B1717]">
                                                    {row.tds}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm sm:text-base font-['Gilroy-Semibold'] text-[#039155]">
                                                    {row.net}
                                                </td>
                                            </tr>
                                        ))}

                                        {/* Total Row */}
                                        <tr className="border-t border-[#1B1717]/20">
                                            <td
                                                colSpan={3}
                                                className="px-4 py-3 text-sm font-['Gilroy-Medium'] text-[#1B1717]/80"
                                            >
                                                Total Commission
                                            </td>
                                            <td className="px-4 py-3 text-right text-base font-['Gilroy-Semibold'] text-[#1B1717]">
                                                {totalCommission}
                                            </td>
                                        </tr>
                                    </>
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-4 py-6 text-sm font-['Gilroy-Regular'] text-gray-500 text-center"
                                        >
                                            No commission data available
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

CMSTransactionDetails.propTypes = {
    transactionData: PropTypes.object.isRequired,
    onBack: PropTypes.func,
};

CMSTransactionDetails.defaultProps = {
    onBack: null,
};

export default CMSTransactionDetails;


