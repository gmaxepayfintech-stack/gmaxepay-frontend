import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useCompany } from "../../../context/CompanyContext";
import { getUserSubscriptionList } from "../../../redux/action/subscriptionAction";
import ViewSubscription from "./ViewSubscription";

const Subscription = () => {
  const dispatch = useDispatch();
  const { company } = useCompany();
  const companyFromRedux = useSelector((state) => state?.company?.company);
  const companyData = companyFromRedux || company;
  const userId = useSelector((state) => state?.userProfile?.userId);
  const { subscriptions, loading, error } = useSelector((state) => state?.subscription || {});
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [showViewSubscription, setShowViewSubscription] = useState(false);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (userId) {
        await dispatch(
          getUserSubscriptionList(userId, {}, {}, { page: 1, paginate: 10, sort: {} })
        );
      }
    };
    fetchSubscriptions();
  }, [dispatch, userId]);

  const getCompanyId = () => {
    return companyData?.companyId || companyData?._id || companyData?.id || null;
  };

  // Map API data to display format
  const mapSubscriptionToDisplay = (subscription) => {
    // Predefined list of available services (excluding "Other" which will be added last)
    const availableServices = [
      "AEPS 1",
      "AEPS 2",
      "DMT 1",
      "DMT 2",
      "BBPS",
      "Mobile Recharge",
      "CMS",
      "DTH Recharge",
    ];

    // Get unique operator types from commissions to determine which services to show
    const operatorTypes = [
      ...new Set(subscription.commissions?.map((comm) => comm.operatorType) || []),
    ];

    // Select 5 random services (no duplicates) + "Other" as the 6th
    let selectedServices = [];
    
    if (operatorTypes.length > 0) {
      // Shuffle and select 5 random services (no duplicates)
      const shuffled = [...availableServices].sort(() => Math.random() - 0.5);
      selectedServices = shuffled.slice(0, 5);
    } else {
      // Default: show first 5 services
      selectedServices = availableServices.slice(0, 5);
    }

    // Ensure we have exactly 5 unique services before adding "Other"
    if (selectedServices.length < 5) {
      // If we don't have enough, fill from the beginning
      const needed = 5 - selectedServices.length;
      const used = new Set(selectedServices);
      for (let i = 0; i < availableServices.length && selectedServices.length < 5; i++) {
        if (!used.has(availableServices[i])) {
          selectedServices.push(availableServices[i]);
          used.add(availableServices[i]);
        }
      }
    }

    // Remove duplicates if any (shouldn't happen, but safety check)
    selectedServices = [...new Set(selectedServices)];

    // Ensure exactly 5 services before adding "Other"
    if (selectedServices.length > 5) {
      selectedServices = selectedServices.slice(0, 5);
    }

    // Add "Other" as the 6th service (total 6 services: 5 random + 1 "Other")
    selectedServices.push("Other");

    // Use slabName directly from API
    const displayTitle = subscription.slabName || "Customization";

    return {
      id: subscription.id,
      title: displayTitle,
      price: `₹ ${subscription.subscriptionAmount || 0}`,
      period: "Life Time",
      description:
        "GmaxePay Delivers An All-In-One Fintech Solution For Essential Digital Payment Services. From AEPS And DMT To BBPS, Recharges, And CMS, We Enable Smooth, Secure, And Instant Transactions. Our Platform Follows NPCI Standards And Ensures High Uptime With Robust Security. GmaxePay Helps Merchants Expand Their Service Offerings With Confidence And Ease.",
      services: selectedServices,
      originalData: subscription,
      isCurrentSlab: subscription.isCurrentSlab || false,
    };
  };

  const handleViewDetails = (subscription) => {
    setSelectedSubscription(subscription);
    setShowViewSubscription(true);
  };

  const handleSubscribe = (planTitle) => {
    // Handle subscribe action
    console.log(`Subscribe to ${planTitle}`);
  };

  // Loading Skeleton Component
  const SubscriptionCardSkeleton = () => (
    <div className="relative flex flex-col w-[402px] h-[600px] rounded-2xl border border-[#1B1717]/80 bg-[#FEFEFE] p-6 animate-pulse">
      {/* Radio Button Skeleton */}
      <div className="absolute top-4 right-4">
        <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
      </div>

      {/* Title Skeleton */}
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>

      {/* Price Skeleton */}
      <div className="h-6 bg-gray-200 rounded w-1/2 mb-5"></div>

      {/* Description Skeleton */}
      <div className="space-y-2 mb-3">
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        <div className="h-3 bg-gray-200 rounded w-4/5"></div>
      </div>

      {/* Services List Skeleton */}
      <div className="mb-3 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-gray-200 rounded-full"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-gray-200 rounded-full"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-gray-200 rounded-full"></div>
          <div className="h-4 bg-gray-200 rounded w-28"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-gray-200 rounded-full"></div>
          <div className="h-4 bg-gray-200 rounded w-22"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-gray-200 rounded-full"></div>
          <div className="h-4 bg-gray-200 rounded w-18"></div>
        </div>
      </div>

      {/* Buttons Skeleton */}
      <div className="flex flex-col mt-auto gap-3">
        <div className="h-[60px] bg-gray-200 rounded-[14px]"></div>
        <div className="h-[60px] bg-gray-200 rounded-[14px]"></div>
      </div>
    </div>
  );

  const displaySubscriptions = subscriptions?.map(mapSubscriptionToDisplay) || [];

  // Show ViewSubscription component when selected
  if (showViewSubscription) {
    return (
      <ViewSubscription
        subscription={selectedSubscription}
        onBack={() => {
          setShowViewSubscription(false);
          setSelectedSubscription(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1B1717]">
      {/* Header Section */}
      <div className="mb-4 mt-2 sm:mb-6">
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
      <div className="flex flex-wrap justify-center gap-8">
        {loading ? (
          // Loading Skeleton
          Array.from({ length: 4 }).map((_, index) => (
            <SubscriptionCardSkeleton key={index} />
          ))
        ) : displaySubscriptions.length > 0 ? (
          displaySubscriptions.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col w-[402px] h-[600px] rounded-2xl border border-[#1B1717]/80 p-6 overflow-visible ${
                plan.isCurrentSlab ? "bg-[#F5F5F5]" : "bg-[#FEFEFE]"
              }`}
            >
              {/* Current Plan Radio Button - Only show for current slab */}
              {plan.isCurrentSlab && (
                <div className="absolute top-4 right-4">
                  <input
                    type="radio"
                    name="subscription-plan"
                    checked={true}
                    readOnly
                    className="w-5 h-5 cursor-pointer"
                    style={{ accentColor: "#039155" }}
                  />
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
              <p className="text-xs sm:text-sm font-['Gilroy-Regular'] text-[#1B1717]/80 mb-3 leading-relaxed line-clamp-4">
                {plan.description}
              </p>

              {/* Services List */}
              <div className="mb-3 flex-shrink-0 w-full">
                <ul className="flex flex-col gap-3">
                  {plan.services.map((service, serviceIndex) => (
                    <li
                      key={serviceIndex}
                      className="flex items-center font-['Gilroy-SemiBold'] font-normal text-lg leading-none tracking-normal align-middle capitalize"
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
              <div className="flex flex-col mt-auto flex-shrink-0 gap-[13px]">
                <button
                  onClick={() => handleViewDetails(plan)}
                  className="w-full h-[60px] rounded-[14px] border-[0.5px] border-[#1B1717] bg-white text-[#1B1717] font-['Gilroy-Medium'] text-sm sm:text-base hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  View Details
                </button>
                <button
                  onClick={() => !plan.isCurrentSlab && handleSubscribe(plan.title)}
                  disabled={plan.isCurrentSlab}
                  className={`w-full h-[60px] rounded-[14px] bg-[#039155] text-white font-['Gilroy-Medium'] text-sm sm:text-base transition-colors flex items-center justify-center ${
                    plan.isCurrentSlab
                      ? "opacity-60 cursor-not-allowed"
                      : "opacity-100 cursor-pointer"
                  }`}
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
    </div>
  );
};

export default Subscription;
