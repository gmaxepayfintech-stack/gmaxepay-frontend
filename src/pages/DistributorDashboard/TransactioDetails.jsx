import React, { useState } from "react";
import PropTypes from "prop-types";
import { FileText } from "lucide-react";
import MainWalletStatement from "./MainWalletStatement";
import { HiArrowLeft } from "react-icons/hi2";

const TransactioDetails = ({ transactionData, onBack }) => {
  const [showMainWalletStatement, setShowMainWalletStatement] = useState(false);

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

  const calculateCommissionData = () => {
    if (!transactionData) return [];

    // The data might be at the root of transactionData or nested in transactionData.transaction
    const transaction = transactionData.transaction || transactionData;

    // Helper to format values safely with fallbacks
    const getVal = (val1, val2, val3) => {
      const val = val1 ?? val2 ?? val3 ?? 0;
      return parseFloat(val) || 0;
    };

    // Distributor
    const distributorCom = getVal(transaction.distributorCom, transaction.distributorCommission, transaction.distributorComm);
    const distributorTDS = getVal(transaction.distributorComTDS, transaction.distributorTds, transaction.distributorCommTDS);
    const distributorNet = distributorCom - distributorTDS;

    // Retailer
    const retailerCom = getVal(transaction.retailerCom, transaction.retailerCommission, transaction.retailerComm);
    const retailerComTDS = getVal(transaction.retailerComTDS, transaction.retailerTds, transaction.retailerCommTDS);
    const retailerNet = retailerCom - retailerComTDS;

    return [
      {
        name: "Distributor",
        commissions: `₹${distributorCom.toFixed(4)}`,
        tds: `₹${distributorTDS.toFixed(4)}`,
        net: `₹${distributorNet.toFixed(4)}`,
      },
      {
        name: "Retailer",
        commissions: `₹${retailerCom.toFixed(4)}`,
        tds: `₹${retailerComTDS.toFixed(4)}`,
        net: `₹${retailerNet.toFixed(4)}`,
      },
    ];
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

  // Show error or no data message
  if (!transactionData) {
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

  // If MainWalletStatement should be shown, render it
  if (showMainWalletStatement) {
    return (
      <MainWalletStatement onBack={() => setShowMainWalletStatement(false)} />
    );
  }

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
                  {transactionData?.userDetails?.name || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-[#1B1717]/80 font-[Gilroy-Medium] mb-1">
                  Role
                </p>
                <p className="text-sm sm:text-base font-['Gilroy-Semibold'] text-[#1B1717]">
                  {transactionData?.userDetails?.userRole
                    ? getRoleName(transactionData.userDetails.userRole)
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-[#1B1717]/80 font-[Gilroy-Medium] mb-1">
                  Agent Code
                </p>
                <p className="text-sm sm:text-base font-['Gilroy-Semibold'] text-[#1B1717]">
                  {transactionData?.userDetails?.userId || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-[#1B1717]/80 font-[Gilroy-Medium] mb-1">
                  User Mobile
                </p>
                <p className="text-sm sm:text-base font-['Gilroy-Semibold'] text-[#1B1717]">
                  {transactionData?.userDetails?.mobileNo || "N/A"}
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
                  {transactionData?.reportingUserDetails?.companyName || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-[#1B1717]/80 font-[Gilroy-Medium] mb-1">
                  Parent Name
                </p>
                <p className="text-sm sm:text-base font-['Gilroy-Semibold'] text-[#1B1717]">
                  {transactionData?.reportingUserDetails?.parentName || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-[#1B1717]/80 font-[Gilroy-Medium] mb-1">
                  Parent Role
                </p>
                <p className="text-sm sm:text-base font-['Gilroy-Semibold'] text-[#1B1717]">
                  {transactionData?.reportingUserDetails?.parentRole
                    ? getRoleName(
                      transactionData.reportingUserDetails.parentRole,
                    )
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-[#1B1717]/80 font-[Gilroy-Medium] mb-1">
                  Parent Code
                </p>
                <p className="text-sm sm:text-base font-['Gilroy-Semibold'] text-[#1B1717]">
                  {transactionData?.reportingUserDetails?.parentUserId || "N/A"}
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
                  Bank Name
                </p>
                <p className="text-sm sm:text-base font-['Gilroy-Semibold'] text-[#1B1717]">
                  {transactionData?.transactionDetails?.bankName || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-[#1B1717]/80 font-[Gilroy-Medium] mb-1">
                  Aadhar Number
                </p>
                <p className="text-sm sm:text-base font-['Gilroy-Semibold'] text-[#1B1717]">
                  {transactionData?.transactionDetails?.aadharNumber
                    ? `${transactionData.transactionDetails.aadharNumber.slice(0, 4)} ${transactionData.transactionDetails.aadharNumber.slice(4, 8)} ${transactionData.transactionDetails.aadharNumber.slice(8, 12)} ****`
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-[#1B1717]/80 font-[Gilroy-Medium] mb-1">
                  Amount
                </p>
                <p className="text-sm sm:text-base font-['Gilroy-Semibold'] text-[#1B1717]">
                  {transactionData?.transactionDetails?.amount
                    ? `₹${transactionData.transactionDetails.amount}`
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-[#1B1717]/80 font-[Gilroy-Medium] mb-1">
                  Commission
                </p>
                <p className="text-sm sm:text-base font-['Gilroy-Semibold'] text-[#1B1717]">
                  {transactionData?.transactionDetails?.commission
                    ? `₹${transactionData.transactionDetails.commission.toFixed(2)}`
                    : "N/A"}
                </p>
              </div>
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

TransactioDetails.propTypes = {
  transactionData: PropTypes.object.isRequired,
  onBack: PropTypes.func,
};

TransactioDetails.defaultProps = {
  onBack: null,
};

export default TransactioDetails;
