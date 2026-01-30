import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useCompany } from "../../../context/CompanyContext";
import { getSubscriptionList } from "../../../redux/action/subscriptionAction";
import { X } from "lucide-react";

const Subscription = () => {
  const dispatch = useDispatch();
  const { company } = useCompany();
  const companyFromRedux = useSelector((state) => state?.company?.company);
  const companyData = companyFromRedux || company;
  const { subscriptions, loading, error } = useSelector((state) => state?.subscription || {});
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      const companyId = companyData?.companyId || companyData?._id || companyData?.id;
      if (companyId) {
        await dispatch(
          getSubscriptionList(companyId, {}, {}, { page: 1, paginate: 10, sort: {} })
        );
      }
    };
    fetchSubscriptions();
  }, [dispatch, companyData]);

  const getCompanyId = () => {
    return companyData?.companyId || companyData?._id || companyData?.id || null;
  };

  // Map API data to display format
  const mapSubscriptionToDisplay = (subscription) => {
    // Extract unique operator types from commissions
    const operatorTypes = [
      ...new Set(subscription.commissions?.map((comm) => comm.operatorType) || []),
    ];
    
    // Map operator types to service names
    const serviceMap = {
      AEPS: "AEPS",
      RECHARGE: "Mobile Recharge",
      DTH: "Mobile Recharge",
      BBPS: "BBPS",
      DMT: "DMT",
      CMS: "CMS",
    };

    const services = operatorTypes
      .map((type) => serviceMap[type] || type)
      .filter(Boolean);

    // Add "Others" if there are services
    if (services.length > 0) {
      services.push("Others");
    }

    // Use slabName directly from API
    const displayTitle = subscription.slabName || "Customization";

    return {
      id: subscription.id,
      title: displayTitle,
      price: `₹ ${subscription.subscriptionAmount || 0}`,
      period: "Life Time",
      description:
        "GmaxePay Delivers An All-In-One Fintech Solution For Essential Digital Payment Services. From AEPS And DMT To BBPS, Recharges, And CMS, We Enable Smooth, Secure, And Instant Transactions. Our Platform Follows NPCI Standards And Ensures High Uptime With Robust Security. GmaxePay Helps Merchants Expand Their Service Offerings With Confidence And Ease.",
      services: services.length > 0 ? services : ["AEPS", "Mobile Recharge", "DMT", "CMS", "BBPS", "Others"],
      originalData: subscription,
      isCurrentSlab: subscription.isCurrentSlab || false,
    };
  };

  const handleViewDetails = (subscription) => {
    setSelectedSubscription(subscription);
    setIsDetailModalOpen(true);
  };

  const handleSubscribe = (planTitle) => {
    // Handle subscribe action
    console.log(`Subscribe to ${planTitle}`);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedSubscription(null);
  };

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

  // Loading Skeleton Component
  const SubscriptionCardSkeleton = () => (
    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
      <div className="space-y-2 mb-6">
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="space-y-3">
        <div className="h-10 bg-gray-200 rounded-lg"></div>
        <div className="h-10 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );

  const displaySubscriptions = subscriptions?.map(mapSubscriptionToDisplay) || [];

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-2 sm:p-4 md:p-6 text-[#1B1717]">
      {/* Header Section */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-xl md:text-2xl font-['Gilroy-Medium'] text-[#1B1717] mb-1 sm:mb-2">
          Subscription Plans
        </h1>
        <p className="text-sm sm:text-base md:text-lg font-['Gilroy-Regular'] text-[#1B1717]/80">
          Choose The Perfect Plan For Your Business
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 font-['Gilroy-Medium']">{error}</p>
        </div>
      )}

      {/* Subscription Cards Grid */}
      <div 
        className="grid grid-cols-1 md:grid-cols-2 justify-items-center md:justify-items-start"
        style={{ gap: "32px" }}
      >
        {loading ? (
          // Loading Skeleton
          Array.from({ length: 4 }).map((_, index) => (
            <SubscriptionCardSkeleton key={index} />
          ))
        ) : displaySubscriptions.length > 0 ? (
          displaySubscriptions.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col ${
                plan.isCurrentSlab ? "ring-2 ring-[#039155]" : ""
              }`}
              style={{
                width: "100%",
                maxWidth: "438px",
                minHeight: "632px",
                height: "auto",
                borderRadius: "16px",
                border: "1px solid rgba(27, 23, 23, 0.8)",
                background: "#FEFEFE",
                padding: "24px",
              }}
            >
              {/* Current Plan Badge */}
              {plan.isCurrentSlab && (
                <div className="absolute top-4 right-4 bg-[#039155] text-white text-xs font-['Gilroy-Medium'] px-2 py-1 rounded-full">
                  Current Plan
                </div>
              )}

              {/* Plan Title */}
              <h2 className="text-xl sm:text-2xl md:text-3xl font-['Gilroy-SemiBold'] text-[#1B1717] mb-3 sm:mb-4">
                {plan.title}
              </h2>

              {/* Price */}
              <div className="mb-4 sm:mb-5">
                <span className="text-lg sm:text-xl md:text-2xl font-['Gilroy-Medium'] text-[#1B1717]">
                  {plan.price}
                </span>
                <span className="text-sm sm:text-base md:text-lg font-['Gilroy-Regular'] text-[#1B1717]/80 ml-1">
                  / {plan.period}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm md:text-base font-['Gilroy-Regular'] text-[#1B1717]/80 mb-4 sm:mb-5 leading-relaxed">
                {plan.description}
              </p>

              {/* Services List */}
              <div
                className="mb-4 sm:mb-6"
                style={{
                  width: "100%",
                  maxWidth: "402px",
                  minHeight: "230px",
                }}
              >
                <ul className="flex flex-col" style={{ gap: "12px" }}>
                  {plan.services.map((service, serviceIndex) => (
                    <li
                      key={serviceIndex}
                      className="flex items-center text-xs sm:text-sm md:text-base font-['Gilroy-Regular']"
                    >
                      <span className="w-1.5 h-1.5 bg-[#1B1717] rounded-full mr-2 sm:mr-3 flex-shrink-0"></span>
                      <span className="text-[#1B1717]">
                        {service}
                        {service === "AEPS" && serviceIndex < plan.services.length - 1 && (
                          <span className="text-[#1B1717] ml-1">...</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 sm:gap-3 mt-auto">
                <button
                  onClick={() => handleViewDetails(plan)}
                  className="w-full px-4 py-2.5 sm:py-3 border border-[#DADADA] rounded-lg bg-white text-[#1B1717] font-['Gilroy-Medium'] text-sm sm:text-base hover:bg-gray-50 transition-colors"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleSubscribe(plan.title)}
                  className="w-full px-4 py-2.5 sm:py-3 bg-[#039155] rounded-lg text-white font-['Gilroy-Medium'] text-sm sm:text-base hover:bg-[#039155]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={plan.isCurrentSlab}
                >
                  {plan.isCurrentSlab ? "Current Plan" : "Subscribe"}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center py-12">
            <p className="text-[#1B1717]/60 font-['Gilroy-Regular']">
              No subscription plans available
            </p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {isDetailModalOpen && selectedSubscription && (
        <div
          className="fixed inset-0 bg-[#D9D9D9]/80 flex items-center justify-center z-50 p-2 xs:p-3 sm:p-4 md:p-6"
          onClick={closeDetailModal}
        >
          <div
            className="bg-white rounded-lg sm:rounded-xl shadow-2xl w-full max-w-4xl max-h-[96vh] sm:max-h-[92vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl sm:text-2xl font-['Gilroy-SemiBold'] text-[#1B1717]">
                  {selectedSubscription.title} - Details
                </h2>
                <p className="text-sm text-[#1B1717]/60 font-['Gilroy-Regular'] mt-1">
                  Complete subscription information
                </p>
              </div>
              <button
                onClick={closeDetailModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-[#1B1717]" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
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
                      {selectedSubscription.originalData?.id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-['Gilroy-Regular'] text-[#1B1717]/80">
                      Slab Name
                    </span>
                    <span className="text-sm font-['Gilroy-Medium'] text-[#1B1717]">
                      {selectedSubscription.originalData?.slabName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-['Gilroy-Regular'] text-[#1B1717]/80">
                      Subscription Amount
                    </span>
                    <span className="text-sm font-['Gilroy-Medium'] text-[#1B1717]">
                      ₹ {selectedSubscription.originalData?.subscriptionAmount || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-['Gilroy-Regular'] text-[#1B1717]/80">
                      Schema Mode
                    </span>
                    <span className="text-sm font-['Gilroy-Medium'] text-[#1B1717] capitalize">
                      {selectedSubscription.originalData?.schemaMode || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-['Gilroy-Regular'] text-[#1B1717]/80">
                      Schema Type
                    </span>
                    <span className="text-sm font-['Gilroy-Medium'] text-[#1B1717] capitalize">
                      {selectedSubscription.originalData?.schemaType || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-['Gilroy-Regular'] text-[#1B1717]/80">
                      Role Type
                    </span>
                    <span className="text-sm font-['Gilroy-Medium'] text-[#1B1717]">
                      {selectedSubscription.originalData?.roleName || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-['Gilroy-Regular'] text-[#1B1717]/80">
                      Current Plan
                    </span>
                    <span className="text-sm font-['Gilroy-Medium'] text-[#1B1717]">
                      {selectedSubscription.originalData?.isCurrentSlab ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Commissions */}
              <div>
                <h3 className="text-lg font-['Gilroy-SemiBold'] text-[#1B1717] mb-4">
                  Commissions
                </h3>
                {selectedSubscription.originalData?.commissions?.length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(
                      groupCommissionsByType(selectedSubscription.originalData.commissions)
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

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-4 sm:p-6 border-t border-gray-200">
              <button
                onClick={closeDetailModal}
                className="px-4 py-2 border border-[#DADADA] rounded-lg bg-white text-[#1B1717] font-['Gilroy-Medium'] text-sm hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscription;
