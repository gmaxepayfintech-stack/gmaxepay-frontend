import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useCompany } from "../../../context/CompanyContext";
import { useNotification } from "../../../context/NotificationContext";
import { getUserSubscriptionList, userUpgradeSubscription } from "../../../redux/action/subscriptionAction";
import { getUserWalletBalance } from "../../../redux/action/walletAction";
import { X } from "lucide-react";
import ViewSubscription from "./ViewSubscription";

const Subscription = () => {
  const dispatch = useDispatch();
  const { company } = useCompany();
  const { showNotification } = useNotification();
  const companyFromRedux = useSelector((state) => state?.company?.company);
  const companyData = companyFromRedux || company;
  const userId = useSelector((state) => state?.userProfile?.userId);
  const { subscriptions, loading, error, upgradeLoading, userUpgradeSuccess, userUpgradeError } = useSelector((state) => state?.subscription || {});
  const userWalletBalance = useSelector((state) => state?.wallet?.userWalletBalance || null);
  const walletBalanceLoading = useSelector((state) => state?.loading?.isLoading || false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [showViewSubscription, setShowViewSubscription] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (userId) {
        dispatch(
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

  const handleSubscribe = (plan) => {
    // If already subscribed or is current slab, don't show modal or call API
    if (plan.originalData?.isSubscribed || plan.isCurrentSlab) {
      return;
    }
    
    console.log('Subscribe clicked - Plan data:', plan);
    console.log('Subscription ID:', plan.originalData?.id || plan.id);
    
    setSelectedPlan(plan);
    setShowConfirmModal(true);
  };

  // Fetch wallet balance when modal opens
  useEffect(() => {
    if (showConfirmModal && selectedPlan) {
      dispatch(getUserWalletBalance());
    }
  }, [showConfirmModal, selectedPlan, dispatch]);

  // Handle upgrade success
  useEffect(() => {
    if (userUpgradeSuccess) {
      setShowConfirmModal(false);
      setSelectedPlan(null);
      // Show success notification
      showNotification({
        type: 'success',
        message: 'Subscription upgraded successfully!',
        duration: 5000,
        isCritical: true,
      });
      // Refresh subscription list
      if (userId) {
        dispatch(
          getUserSubscriptionList(userId, {}, {}, { page: 1, paginate: 10, sort: {} })
        );
      }
    }
  }, [userUpgradeSuccess, dispatch, userId, showNotification]);

  // Handle upgrade error from API
  useEffect(() => {
    if (userUpgradeError) {
      // Show error notification
      showNotification({
        type: 'error',
        message: userUpgradeError,
        duration: 5000,
      });
    }
  }, [userUpgradeError, showNotification]);

  const handleConfirmUpgrade = async () => {
    if (!selectedPlan) return;
   
    // Don't call API if already subscribed
    if (selectedPlan.originalData?.isSubscribed) {
      return;
    }
   
    // Get the subscription id from originalData (from API response)
    const subscriptionId = selectedPlan.originalData?.id || selectedPlan.id;
    
    if (!subscriptionId) {
      showNotification({
        type: 'error',
        message: 'Subscription ID not found. Please try again.',
        duration: 5000,
        isCritical: true,
      });
      return;
    }
   
    const companyId = getCompanyId();
    if (companyId && subscriptionId) {
      console.log('Upgrading subscription with ID:', subscriptionId, 'Company ID:', companyId);
      await dispatch(userUpgradeSubscription(subscriptionId, companyId));
      // Error message from API will be shown via useEffect watching userUpgradeError
    } else {
      showNotification({
        type: 'error',
        message: 'Company ID or Subscription ID is missing. Please try again.',
        duration: 5000,
      });
    }
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
                  onClick={() => handleSubscribe(plan)}
                  disabled={plan.isCurrentSlab || plan.originalData?.isSubscribed}
                  className={`w-full h-[60px] rounded-[14px] font-['Gilroy-Medium'] text-sm sm:text-base transition-colors flex items-center justify-center ${
                    plan.isCurrentSlab
                      ? "opacity-60 cursor-not-allowed bg-[#039155] text-white"
                      : plan.originalData?.isSubscribed
                      ? "opacity-60 cursor-not-allowed bg-gray-400 text-white"
                      : "opacity-100 cursor-pointer bg-[#039155] text-white hover:bg-green-700"
                  }`}
                >
                  {plan.isCurrentSlab
                    ? "Current Plan"
                    : plan.originalData?.isSubscribed
                    ? "Already Subscribed"
                    : "Subscribe"}
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

      {/* Confirmation Modal */}
      {showConfirmModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 animate-slideUp relative">
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-xl font-[Gilroy-Semibold] text-gray-800">
                  {selectedPlan.originalData?.isSubscribed
                    ? "Confirm Slab Change"
                    : "Confirm Subscription Upgrade"}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedPlan(null);
                }}
                className="absolute right-3 top-3 w-10 h-10 flex items-center justify-center rounded-xl bg-[#039155] hover:opacity-90 transition"
              >
                <X className="w-6 h-6 text-[#FFFFFF] rounded-full border-[2.5px] border-[#FFFFFF] p-0.5" />
              </button>
              <div className="mb-6">
                {/* Wallet Balance Display */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Main Wallet Balance</p>
                  <p className="text-lg font-[Gilroy-Semibold] text-[#1B1717]">
                    {walletBalanceLoading ? (
                      <span className="text-gray-400">Loading...</span>
                    ) : userWalletBalance?.data?.mainWallet ? (
                      `₹${userWalletBalance.data.mainWallet}`
                    ) : userWalletBalance?.data?.data?.mainWallet ? (
                      `₹${userWalletBalance.data.data.mainWallet}`
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </p>
                </div>

                <p className="text-gray-700 mb-2">
                  {selectedPlan.originalData?.isSubscribed
                    ? "Are you sure you want to change the subscription plan?"
                    : `Are you sure you want to upgrade to ${selectedPlan.title} plan?`}
                </p>
                {selectedPlan && (
                  <p className="text-sm text-gray-600">
                    Plan:{" "}
                    <span className="font-[Gilroy-Semibold]">
                      {selectedPlan.title} - ₹{selectedPlan.originalData?.subscriptionAmount || 0}
                    </span>
                  </p>
                )}
                {userUpgradeError && (
                  <p className="text-sm text-red-600 mt-2 font-[Gilroy-Semibold] bg-red-50 p-2 rounded border border-red-200">
                    {userUpgradeError}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setSelectedPlan(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={upgradeLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmUpgrade}
                  className="px-4 py-2 bg-[#039155] text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  disabled={upgradeLoading || selectedPlan.originalData?.isSubscribed || !selectedPlan.originalData?.id}
                >
                  {upgradeLoading
                    ? (selectedPlan.originalData?.isSubscribed ? "Changing..." : "Upgrading...")
                    : (selectedPlan.originalData?.isSubscribed ? "Confirm Change" : "Confirm Upgrade")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscription;
