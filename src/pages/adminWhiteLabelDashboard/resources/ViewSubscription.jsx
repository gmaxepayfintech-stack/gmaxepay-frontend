import React from "react";
import PropTypes from "prop-types";
import { HiArrowLeft } from "react-icons/hi2";

const ViewSubscription = ({ subscription = null, onBack }) => {
  // Group commissions by operator type
  const groupCommissionsByType = (commissions) => {
    const grouped = {};
    commissions?.forEach((comm) => {
      const type = comm.operatorType;
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(comm);
    });
    return grouped;
  };

  if (!subscription) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] p-2 sm:p-4 md:p-6 text-[#1B1717]">
        <div className="text-center py-12">
          <p className="text-[#1B1717]/60 font-['Gilroy-Regular']">
            No subscription data found
          </p>
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-[#039155] text-white rounded-lg font-['Gilroy-Medium'] hover:bg-[#039155]/90 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-2 sm:p-4 md:p-6 text-[#1B1717]">
      {/* Header Section with Back Arrow */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <button
            onClick={onBack}
            className="flex items-center text-[#1B1717] hover:text-[#039155] transition"
          >
            <div className="rounded-full p-2.5 sm:p-3 bg-[#FFFFFF] border-[0.5px] border-[#1B1717]/80 transition">
              <HiArrowLeft className="text-2xl sm:text-3xl text-[#1B1717] opacity-80" />
            </div>
          </button>
          <div className="flex flex-col">
            <h1 className="text-[20px] sm:text-2xl md:text-2xl font-['Gilroy-Medium'] text-[#1B1717]">
              {subscription.title} - Details
            </h1>
            <span className="block mt-2 sm:mt-0 text-sm sm:text-base font-[gilroy-regular] text-[#1B1717]">
              Complete subscription information
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm">
        {/* Basic Information */}
        <div className="mb-6">
          <h3 className="text-lg font-['Gilroy-SemiBold'] text-[#1B1717] mb-4">
            Basic Information
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-['Gilroy-Regular'] text-[#1B1717]/80">
                Subscription ID
              </span>
              <span className="text-sm font-['Gilroy-Medium'] text-[#1B1717]">
                {subscription.originalData?.id}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-['Gilroy-Regular'] text-[#1B1717]/80">
                Slab Name
              </span>
              <span className="text-sm font-['Gilroy-Medium'] text-[#1B1717]">
                {subscription.originalData?.slabName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-['Gilroy-Regular'] text-[#1B1717]/80">
                Subscription Amount
              </span>
              <span className="text-sm font-['Gilroy-Medium'] text-[#1B1717]">
                ₹ {subscription.originalData?.subscriptionAmount || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-['Gilroy-Regular'] text-[#1B1717]/80">
                Schema Mode
              </span>
              <span className="text-sm font-['Gilroy-Medium'] text-[#1B1717] capitalize">
                {subscription.originalData?.schemaMode || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-['Gilroy-Regular'] text-[#1B1717]/80">
                Schema Type
              </span>
              <span className="text-sm font-['Gilroy-Medium'] text-[#1B1717] capitalize">
                {subscription.originalData?.schemaType || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-['Gilroy-Regular'] text-[#1B1717]/80">
                Role Type
              </span>
              <span className="text-sm font-['Gilroy-Medium'] text-[#1B1717]">
                {subscription.originalData?.roleName || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-['Gilroy-Regular'] text-[#1B1717]/80">
                Current Plan
              </span>
              <span className="text-sm font-['Gilroy-Medium'] text-[#1B1717]">
                {subscription.originalData?.isCurrentSlab ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </div>

        {/* Commissions */}
        <div>
          <h3 className="text-lg font-['Gilroy-SemiBold'] text-[#1B1717] mb-4">
            Commissions
          </h3>
          {subscription.originalData?.commissions?.length > 0 ? (
            <div className="space-y-4">
              {Object.entries(
                groupCommissionsByType(subscription.originalData.commissions)
              ).map(([operatorType, commissions]) => (
                <div key={operatorType} className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-base font-['Gilroy-SemiBold'] text-[#1B1717] mb-3">
                    {operatorType}
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-3 font-['Gilroy-Medium'] text-[#1B1717]">
                            Operator Name
                          </th>
                          <th className="text-left py-2 px-3 font-['Gilroy-Medium'] text-[#1B1717]">
                            Commission Amount
                          </th>
                          <th className="text-left py-2 px-3 font-['Gilroy-Medium'] text-[#1B1717]">
                            Commission Type
                          </th>
                          <th className="text-left py-2 px-3 font-['Gilroy-Medium'] text-[#1B1717]">
                            Amount Type
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {commissions.map((comm) => (
                          <tr key={comm.id} className="border-b border-gray-100">
                            <td className="py-2 px-3 font-['Gilroy-Regular'] text-[#1B1717]">
                              {comm.operatorName}
                            </td>
                            <td className="py-2 px-3 font-['Gilroy-Regular'] text-[#1B1717]">
                              {comm.commAmt}
                            </td>
                            <td className="py-2 px-3 font-['Gilroy-Regular'] text-[#1B1717] uppercase">
                              {comm.commType}
                            </td>
                            <td className="py-2 px-3 font-['Gilroy-Regular'] text-[#1B1717] uppercase">
                              {comm.amtType}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-sm text-[#1B1717]/60 font-['Gilroy-Regular']">
                No commissions available
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ViewSubscription.propTypes = {
  subscription: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    originalData: PropTypes.object,
  }),
  onBack: PropTypes.func.isRequired,
};

export default ViewSubscription;
