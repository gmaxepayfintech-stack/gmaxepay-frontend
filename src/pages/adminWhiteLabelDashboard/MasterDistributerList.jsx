import React from "react";
import PropTypes from "prop-types";

const MasterDistributerList = ({ tableData = [], isLoading = false, onUpgradeClick }) => {
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl bg-white">
      <table className="min-w-max w-full divide-y">
        <thead className="bg-white divide-y-[#1B1717] border-opacity-50">
          <tr>
            <th className="px-3 py-4 text-left font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
              SR No
            </th>
            
            <th className="px-3 py-4 text-left font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
              Date
            </th>
            <th className="px-3 py-4 text-left font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
              Parent Name
            </th>
            <th className="px-3 py-4 text-left font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
              User Name
            </th>
            <th className="px-3 py-4 text-left font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
              Mobile Number
            </th>
            <th className="px-3 py-4 text-left font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
              Email Id
            </th>
            <th className="px-3 py-4 text-left font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
              Current Role
            </th>
            <th className="px-3 py-4 text-left font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
              Upgrade Role
            </th>
            <th className="px-3 py-4 text-left font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
              User ID
            </th>
            <th className="px-3 py-4 text-left font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
              Parent Role
            </th>
            <th className="px-3 py-4 text-left font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
              Company
            </th>
            <th className="px-3 py-4 text-left font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
              Company ID
            </th>
            <th className="px-3 py-4 text-left font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
              KYC Status
            </th>
            <th className="px-3 py-4 text-left font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
              KYC Steps
            </th>
            <th className="px-3 py-4 text-left font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
              Status
            </th>
            <th className="px-3 py-4 text-left font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
              Lock
            </th>
            <th className="px-3 py-4 text-left font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
              Main Wallet
            </th>
            <th className="px-3 py-4 text-left font-[Gilroy-Medium] text-[14px] text-[#1B1717] tracking-wider whitespace-nowrap">
              Apes Wallet
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y font-normal">
          {tableData.length === 0 ? (
            <tr>
              <td colSpan={18} className="px-4 py-8 text-center text-gray-500">
                No data available
              </td>
            </tr>
          ) : (
            tableData.map((row, index) => (
              <tr
                key={row.id ?? index}
                className={`text-sm ${index % 2 === 0 ? "bg-green-50" : "bg-white"}`}
              >
                <td className="px-4 py-4 whitespace-nowrap text-[11px]">{row.srNo}</td>
                <td className="px-4 py-4 whitespace-nowrap text-[11px]">{row.date}</td>
                <td className="px-4 py-4 whitespace-nowrap text-[11px]">{row.parentName}</td>
                <td className="px-4 py-4 whitespace-nowrap text-[11px]">{row.userName}</td>
                <td className="px-4 py-4 whitespace-nowrap text-[11px]">{row.mobileNumber}</td>
                <td className="px-4 py-4 whitespace-nowrap text-[11px]">{row.emailId}</td>
                <td className="px-4 py-4 whitespace-nowrap text-[11px]">{row.currentRole}</td>
                <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                  <button
                    type="button"
                    onClick={() => onUpgradeClick?.(row)}
                    className="px-4 py-2 bg-[#039155] text-white rounded-lg hover:bg-[#027a45] transition cursor-pointer font-[Gilroy-Medium]"
                  >
                    {row.upgradeRole && row.upgradeRole !== "-" ? row.upgradeRole : "Upgrade"}
                  </button>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-[11px]">{row.userId}</td>
                <td className="px-4 py-4 whitespace-nowrap text-[11px]">{row.parentRole}</td>
                <td className="px-4 py-4 whitespace-nowrap text-[11px]">{row.company}</td>
                <td className="px-4 py-4 whitespace-nowrap text-[11px]">{row.companyId}</td>
                <td className="px-4 py-4 whitespace-nowrap text-[11px]">{row.kycStatus}</td>
                <td className="px-4 py-4 whitespace-nowrap text-[11px]">{row.kycSteps}</td>
                <td className="px-4 py-4 whitespace-nowrap text-[11px]">{row.status}</td>
                <td className="px-4 py-4 whitespace-nowrap text-[11px]">{row.lock ? "Yes" : "No"}</td>
                <td className="px-4 py-4 whitespace-nowrap text-[11px]">{row.wallet?.mainWallet ?? 0}</td>
                <td className="px-4 py-4 whitespace-nowrap text-[11px]">{row.wallet?.apesWallet ?? 0}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MasterDistributerList;

MasterDistributerList.propTypes = {
  tableData: PropTypes.array,
  isLoading: PropTypes.bool,
  onUpgradeClick: PropTypes.func,
};