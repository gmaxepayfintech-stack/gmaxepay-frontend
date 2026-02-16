import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { MapPin, FileText, Camera, ChevronDown, X } from "lucide-react";
import { HiArrowLeft } from "react-icons/hi2";
import { getMDSlabList } from "../../redux/action/slabAction";
import { userUpgradeSubscription } from "../../redux/action/subscriptionAction";
import { getUserWalletBalance } from "../../redux/action/walletAction";
import { useNotification } from "../../context/NotificationContext";
import { useCompany } from "../../context/CompanyContext";
import PhoneIcon from "../../../public/img/PhoneIcon.png";
import EmailIcon from "../../../public/img/Emailicon.png";
import Gst from "../../../public/img/Gst.png";
import Pincode from "../../../public/img/Pincode.png";
import AgentCode from "../../../public/img/AgentCode.png";
import UserId from "../../../public/img/UserId.png";
import bgimage from "../../../public/img/banner.svg";
import { motion } from "framer-motion";
import { getMDDetails } from "../../redux/action/whiteLabelAction";
import {
  addBankDetails,
  deleteUserBank,
} from "../../redux/action/userProfileAction";
import { Trash2 } from "lucide-react";

const DistributerProfile = ({ onBack = null }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState("membership");
  const [selectedScheme, setSelectedScheme] = useState("");
  const [imageError, setImageError] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isAddingBank, setIsAddingBank] = useState(false);
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);

  // Get company fro context
  const { company } = useCompany();
  const companyId = company?.companyId || company?._id || company?.id;

  // Get MD details from Redux (using getMDDetails API)
  const mdDetailsState = useSelector((state) => state?.whitelabel?.mdDetails);
  // mdDetailsState contains { mdDetails, message, status }
  const mdDetailsData = mdDetailsState?.mdDetails || null;

  // Use mdDetailsData from getMDDetails API
  const profileData = mdDetailsData || null;

  // Get slab list from Redux (using getMDSlabList API - contains isSubscribed field)
  const slabList = useSelector((state) => state?.slab?.userList || []);
  const visibilityLoading = useSelector(
    (state) => state?.slab?.loading || false,
  );
  const upgradeLoading = useSelector(
    (state) => state?.subscription?.userUpgradeLoading || false,
  );
  const upgradeSuccess = useSelector(
    (state) => state?.subscription?.userUpgradeSuccess || false,
  );
  const upgradeError = useSelector(
    (state) => state?.subscription?.userUpgradeError || null,
  );

  // Get wallet balance from Redux (use user wallet for distributor)
  const userWalletBalance = useSelector(
    (state) => state?.wallet?.userWalletBalance || null,
  );
  const walletBalanceLoading = useSelector(
    (state) => state?.loading?.isLoading || false,
  );

  // Extract data from profileData (do this before early returns to maintain hook order)
  const data = profileData || {};
  const companyDetails = data?.companyDetails || {};
  const outletDetails = data?.outletDetails || {};
  const bankDetails = data?.bankDetails || [];

  // Helper function to get Google Maps embed URL
  const getMapEmbedUrl = () => {
    // Prefer coordinates if available (most reliable)
    if (data?.latitude && data?.longitude) {
      return `https://www.google.com/maps?q=${data.latitude},${data.longitude}&output=embed`;
    }
    // Extract place_id from googleMapsLink if available
    if (outletDetails?.googleMapsLink) {
      const placeIdMatch =
        outletDetails.googleMapsLink.match(/place_id:([^&]+)/);
      if (placeIdMatch) {
        return `https://www.google.com/maps?q=place_id:${placeIdMatch[1]}&output=embed`;
      }
    }
    return "";
  };

  // Fetch user details and slab visibility on component mount (always fetch when page is showing)
  useEffect(() => {
    dispatch(getMDDetails());
    if (companyId) {
      dispatch(getMDSlabList(companyId));
    }
  }, [dispatch, companyId]);

  // Reset image error when data changes
  useEffect(() => {
    setImageError(false);
  }, [profileData]);

  // Set default selected scheme to current slabId
  useEffect(() => {
    if (data?.slabId && !selectedScheme) {
      setSelectedScheme(String(data.slabId));
    }
  }, [data?.slabId, selectedScheme]);

  // Handle upgrade success
  useEffect(() => {
    if (upgradeSuccess) {
      setShowConfirmModal(false);
      // Refresh user details to get updated data
      dispatch(getMDDetails());
      // Refresh slab visibility
      if (companyId) {
        dispatch(getMDSlabList(companyId));
      }
    }
  }, [upgradeSuccess, dispatch, companyId]);

  // Fetch wallet balance when confirmation modal opens (only if not subscribed)
  useEffect(() => {
    if (showConfirmModal && selectedScheme) {
      const selectedSlab = slabList.find(
        (s) => String(s.id) === selectedScheme,
      );
      const isSubscribed = selectedSlab?.isSubscribed || false;
      // Only fetch wallet balance if NOT subscribed (for upgrade)
      if (!isSubscribed) {
        dispatch(getUserWalletBalance());
      }
    }
  }, [showConfirmModal, selectedScheme, slabList, dispatch]);

  // Handle upgrade error from API
  useEffect(() => {
    if (upgradeError) {
      // Show error notification
      showNotification({
        type: "error",
        message: upgradeError,
        duration: 5000,
        isCritical: true,
      });
    }
  }, [upgradeError, showNotification]);

  // Handle ESC key to close image modal
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape" && showImageModal) {
        setShowImageModal(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [showImageModal]);

  // Skeleton loader component
  const SkeletonLoader = ({ className }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
  );

  // Get loading state for user details
  const isUserDetailsLoading = useSelector(
    (state) => state?.whitelabel?.loading || false,
  );

  const handleDeleteBank = async () => {
    if (!selectedBank?.id) return;

    try {
      await dispatch(deleteUserBank(selectedBank.id));

      showNotification({
        type: "success",
        message: "Bank account deleted successfully",
        isCritical: true,
      });
    } catch (error) {
      showNotification({
        type: "error",
        message: "Failed to delete bank account",
        isCritical: true,
      });
    } finally {
      setShowDeleteModal(false);
      setSelectedBank(null);
    }
  };

  // Show skeleton while loading user details or slab visibility
  if (isUserDetailsLoading || visibilityLoading || !profileData) {
    return (
      <div className="min-h-screen py-4 px-3 bg-[#FAFAFA] text-[#1B1717]">
        {/* Cover Picture Section Skeleton */}
        <div className="w-full h-48 sm:h-64 relative bg-gray-200 rounded-t-3xl">
          <div className="absolute bottom-0 left-6 sm:left-8 transform translate-y-1/2">
            <div className="w-32 h-36 sm:w-40 sm:h-48 rounded-2xl bg-white flex items-center justify-center border-4 border-white shadow-lg">
              <SkeletonLoader className="w-16 h-16 sm:w-20 sm:h-20 rounded-full" />
            </div>
          </div>
        </div>

        {/* Profile Section Skeleton */}
        <div className="bg-white px-6 sm:px-6 md:px-8 pb-6 sm:pb-8 pt-4 sm:pt-6 rounded-b-3xl shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <div className="w-32 h-32 sm:w-40 sm:h-40 sm:hidden flex-shrink-0"></div>
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:ml-[11rem]">
              <div className="flex-1">
                <SkeletonLoader className="h-6 w-48 mb-4" />
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <SkeletonLoader className="h-4 w-24" />
                  <SkeletonLoader className="h-4 w-32" />
                  <SkeletonLoader className="h-4 w-20" />
                  <SkeletonLoader className="h-6 w-20 rounded-full" />
                </div>
              </div>
              <SkeletonLoader className="h-8 w-20 rounded-3xl" />
            </div>
          </div>

          {/* Info Cards Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 sm:mt-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-3xl p-3 sm:p-4 flex items-center gap-3"
              >
                <SkeletonLoader className="w-12 h-12 rounded" />
                <div className="flex-1">
                  <SkeletonLoader className="h-5 w-16 mb-2" />
                  <SkeletonLoader className="h-4 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="bg-white rounded-3xl shadow-sm px-4 sm:px-6 md:px-8 py-4 mt-4 sm:mt-6">
          <div className="flex justify-center gap-4">
            {[1, 2, 3].map((i) => (
              <SkeletonLoader key={i} className="h-10 w-40 rounded-lg" />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm mt-6">
          <SkeletonLoader className="h-6 w-32 mb-4" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between items-center">
                <SkeletonLoader className="h-4 w-32" />
                <SkeletonLoader className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 px-3 bg-[#FAFAFA] text-[#1B1717]">
      {/* Header Section */}
      <div className="mb-3 sm:mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-2 sm:mb-3">
          <div className="flex items-start gap-3 sm:gap-5">
            <button
              onClick={onBack || (() => navigate("/distributerDashboard/home"))}
              className="flex items-center text-[#1B1717] hover:text-[#039155] transition mt-1"
            >
              <div className="rounded-full p-2 bg-[#FFFFFF] border border-[#1B1717]/80 transition">
                <HiArrowLeft className="text-xl sm:text-2xl text-[#1B1717]/80 opacity-80" />
              </div>
            </button>

            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-['Gilroy-Medium'] text-[#1B1717]">
                Profile Details
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-[#1B1717] font-['Gilroy-Regular']">
                Manage And Track All Company Admin Details
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cover Picture Section */}
      <div
        className="w-full h-48 sm:h-64 relative bg-cover bg-center bg-no-repeat rounded-t-3xl"
        style={{
          backgroundImage: `url(${bgimage})`,
        }}
      >
        {/* Profile Picture - Overlapping bottom-left */}
        <div className="absolute bottom-0 left-6 sm:left-8 transform translate-y-1/2">
          <div className="w-32 h-36 sm:w-40 sm:h-48 rounded-2xl bg-white flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
            {(data?.profileImage ||
              outletDetails?.shopImage ||
              companyDetails?.compnyLogo) &&
            !imageError ? (
              <img
                src={
                  data?.profileImage ||
                  outletDetails?.shopImage ||
                  companyDetails?.compnyLogo
                }
                alt="Profile"
                className="w-full h-full object-cover rounded-2xl"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#039155] rounded-full flex items-center justify-center cursor-pointer">
                <Camera className="text-white w-8 h-8 sm:w-10 sm:h-10" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Section */}
      <div className="bg-white px-6 sm:px-6 md:px-8 pb-6 sm:pb-8 pt-4 sm:pt-6 rounded-b-3xl  shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          {/* Spacer for profile picture - only visible on mobile since it overlaps on desktop */}
          <div className="w-32 h-32 sm:w-40 sm:h-40 sm:hidden flex-shrink-0"></div>

          {/* Company Info - Right Side */}
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:ml-[11rem]">
            <div className="flex-1">
              <h2 className="text-[16px] sm:text-lg md:text-xl font-['Gilroy-SemiBold'] text-[#1B1717] mb-3 sm:mb-4">
                {companyDetails?.companyName || data?.name || "N/A"}
              </h2>
              <div className="flex flex-wrap items-center gap-[20px] sm:gap-4 mb-3 sm:mb-4">
                <div className="flex items-center gap-[8px] text-xs sm:text-sm text-[#1B1717]/80 font-['Gilroy-Medium']">
                  <img
                    src={PhoneIcon}
                    alt="Phone"
                    className="w-[12px] h-[12px] text-[#1B1717]/80"
                  />
                  <span>{data?.mobileNo || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-[#1B1717]/80 font-['Gilroy-Medium']">
                  <img
                    src={EmailIcon}
                    alt="Email"
                    className="w-[12px] h-[12px] text-[#1B1717]/80"
                  />
                  <span>{data?.email || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-[#1B1717]/80">
                  <MapPin className="w-4 h-4 text-[#1B1717]/80" />
                  <span className="font-[Gilroy-Medium]">
                    {data?.state || "N/A"}
                  </span>
                </div>
                <span className="px-3 py-1 bg-[#158ACD] text-[#FFFFFF] rounded-full text-sm sm:text-base font-[Gilroy-Medium]">
                  Distributor
                </span>
              </div>
            </div>

            {/* Active Status */}
            <div
              className={`flex items-center gap-2 px-2 py-1 rounded-3xl mb-16 ${
                (data?.status || "Active").toLowerCase() === "inactive"
                  ? "bg-red-500"
                  : "bg-[#008D1E]"
              }`}
            >
              <div className="w-2 h-2 bg-[#FFFFFF] rounded-full flex items-center justify-center"></div>
              <span className="text-[12px] sm:text-sm font-['Gilroy-SemiBold'] text-[#FFFFFF]">
                {data?.status || "Active"}
              </span>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 sm:mt-8">
          <div className="bg-white border border-[#1B1717]/80 rounded-3xl p-3 sm:p-4 flex items-center gap-3">
            <img
              src={UserId}
              alt="User Id"
              className="w-[35px] h-[35px] sm:w-12 sm:h-12"
            />
            <div>
              <p className="text-[16px] text-[#1B1717]/80 font-['Gilroy-SemiBold'] mb-1">
                {data?.id || "N/A"}
              </p>
              <p className="text-[14px] sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] text-opacity-80">
                User Id
              </p>
            </div>
          </div>
          <div className="bg-white border border-[#1B1717]/80 rounded-3xl p-3 sm:p-4 flex items-center gap-3">
            <img
              src={AgentCode}
              alt="Agent Code"
              className="w-[35px] h-[35px] sm:w-12 sm:h-12"
            />
            <div>
              <p className="text-[16px] text-[#1B1717] text-opacity-80 font-['Gilroy-SemiBold']  mb-1">
                {data?.agentCode || "N/A"}
              </p>
              <p className="text-[14px] sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] text-opacity-80">
                Agent Code
              </p>
            </div>
          </div>
          <div className="bg-white border border-[#1B1717]/80 rounded-3xl p-3 sm:p-4 flex items-center gap-3">
            <img
              src={Pincode}
              alt="Pincode"
              className="w-[35px] h-[35px] sm:w-12 sm:h-12"
            />
            <div>
              <p className="text-[16px] text-[#1B1717] text-opacity-80 font-['Gilroy-SemiBold']  mb-1">
                {data?.pinCode || "N/A"}
              </p>
              <p className="text-[14px] sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] text-opacity-80">
                Pincode
              </p>
            </div>
          </div>
          <div className="bg-white border border-[#1B1717]/80 rounded-3xl p-3 sm:p-4 flex items-center gap-3">
            <img
              src={Gst}
              alt="GST"
              className="w-[35px] h-[35px] sm:w-12 sm:h-12"
            />
            <div>
              <p className="text-[16px] text-[#1B1717] text-opacity-80 font-['Gilroy-SemiBold']  mb-1">
                {companyDetails?.compnyGst || "N/A"}
              </p>
              <p className="text-[14px] sm:text-sm font-['Gilroy-Medium'] text-[#1B1717] text-opacity-80">
                GST
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-3xl shadow-sm px-4 sm:px-6 md:px-8 py-4 mt-4 sm:mt-6">
        <div className="relative flex items-center justify-between gap-4">
          {[
            {
              key: "membership",
              label: "Membership Scheme Upgrade / Personal Details",
            },
            {
              key: "kycDetails",
              label: "KYC Details / Outlet Details",
            },
            {
              key: "bankDetails",
              label: "Bank Details",
            },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className="relative flex-auto flex justify-center"
            >
              {/* Size-defining wrapper (same as TaxHistory) */}
              <span className="relative px-4 py-3 rounded-lg">
                {/* Moving pill */}
                {activeTab === key && (
                  <motion.span
                    layoutId="active-profile-pill"
                    className="absolute inset-0 rounded-lg bg-[#039155]"
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 35,
                    }}
                  />
                )}

                {/* Text */}
                <span
                  className={`relative z-10 text-sm sm:text-base font-[Gilroy-Medium] whitespace-nowrap transition-colors ${
                    activeTab === key
                      ? "text-white"
                      : "text-[#1B1717]/80 hover:text-[#039155]"
                  }`}
                >
                  {label}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="py-6">
        {activeTab === "kycDetails" && (
          <div className="space-y-6 sm:space-y-8">
            {/* Aadhaar Details */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
              <h3 className="text-lg sm:text-xl font-['Gilroy-Medium'] text-[#1B1717] mb-4 sm:mb-6">
                Aadhaar Details
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 sm:mb-6">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Name</p>
                  <p className="text-sm sm:text-base font-[Gilroy-Medium] text-[#1B1717]">
                    {data?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Aadhar Number</p>
                  <p className="text-sm sm:text-base font-[Gilroy-Medium] text-[#1B1717]">
                    {data?.aadhaarNumber || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Upload Date</p>
                  <p className="text-sm sm:text-base font-[Gilroy-Medium] text-[#1B1717]">
                    14-05-2022
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-[Gilroy-Medium] bg-[#039155] text-white">
                    Active
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-2">Aadhar Front</p>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                    {data?.aadhaarFrontImage ? (
                      <img
                        src={data.aadhaarFrontImage}
                        alt="Aadhar Front"
                        className="w-full h-48 sm:h-64 object-contain"
                        onError={(e) => {
                          e.target.style.display = "none";
                          const fallback = e.target.nextElementSibling;
                          if (fallback) fallback.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className="w-full h-48 sm:h-64 flex items-center justify-center"
                      style={{
                        display: data?.aadhaarFrontImage ? "none" : "flex",
                      }}
                    >
                      <FileText className="w-12 h-12 text-gray-400" />
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2">Aadhar Back</p>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                    {data?.aadhaarBackImage ? (
                      <img
                        src={data.aadhaarBackImage}
                        alt="Aadhar Back"
                        className="w-full h-48 sm:h-64 object-contain"
                        onError={(e) => {
                          e.target.style.display = "none";
                          const fallback = e.target.nextElementSibling;
                          if (fallback) fallback.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className="w-full h-48 sm:h-64 flex items-center justify-center"
                      style={{
                        display: data?.aadhaarBackImage ? "none" : "flex",
                      }}
                    >
                      <FileText className="w-12 h-12 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pan Details */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
              <h3 className="text-lg sm:text-xl font-['Gilroy-Medium'] text-[#1B1717] mb-4 sm:mb-6">
                Pan Details
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 sm:mb-6">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Name</p>
                  <p className="text-sm sm:text-base font-[Gilroy-Medium] text-[#1B1717]">
                    {data?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Pan Number</p>
                  <p className="text-sm sm:text-base font-[Gilroy-Medium] text-[#1B1717]">
                    {companyDetails?.compnyPan || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Upload Date</p>
                  <p className="text-sm sm:text-base font-[Gilroy-Medium] text-[#1B1717]">
                    14-05-2022
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-[Gilroy-Medium] bg-[#039155] text-white">
                    Active
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-2">Pan Front</p>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                    {data?.pancardFrontImage ? (
                      <img
                        src={data.pancardFrontImage}
                        alt="Pan Front"
                        className="w-full h-48 sm:h-64 object-contain"
                        onError={(e) => {
                          e.target.style.display = "none";
                          const fallback = e.target.nextElementSibling;
                          if (fallback) fallback.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className="w-full h-48 sm:h-64 flex items-center justify-center"
                      style={{
                        display: data?.pancardFrontImage ? "none" : "flex",
                      }}
                    >
                      <FileText className="w-12 h-12 text-gray-400" />
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2">Pan Back</p>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                    {data?.pancardBackImage ? (
                      <img
                        src={data.pancardBackImage}
                        alt="Pan Back"
                        className="w-full h-48 sm:h-64 object-contain"
                        onError={(e) => {
                          e.target.style.display = "none";
                          const fallback = e.target.nextElementSibling;
                          if (fallback) fallback.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className="w-full h-48 sm:h-64 flex items-center justify-center"
                      style={{
                        display: data?.pancardBackImage ? "none" : "flex",
                      }}
                    >
                      <FileText className="w-12 h-12 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Outlet Details */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
              <h3 className="text-lg sm:text-xl font-['Gilroy-Medium'] text-[#1B1717] mb-4 sm:mb-6">
                Outlet Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 sm:mb-6">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Shop Name</p>
                  <p className="text-sm sm:text-base font-[Gilroy-Medium] text-[#1B1717]">
                    {outletDetails?.shopName || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Shop Address</p>
                  <p className="text-sm sm:text-base font-[Gilroy-Medium] text-[#1B1717]">
                    {outletDetails?.shopAddress || "N/A"}
                  </p>
                </div>
              </div>
              {/* Shop Image and Google Map in Two Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Shop Image - Square */}
                <div>
                  <p className="text-xs text-gray-500 mb-2">Shop Image</p>
                  <div
                    className={`border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden aspect-square ${outletDetails?.shopImage ? "cursor-pointer hover:opacity-90 transition-opacity" : ""}`}
                    onClick={() =>
                      outletDetails?.shopImage && setShowImageModal(true)
                    }
                  >
                    {outletDetails?.shopImage ? (
                      <img
                        src={outletDetails.shopImage}
                        alt="Shop"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-2" />
                        <p className="text-xs text-gray-500">Shop Image</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Google Map - Square */}
                {(outletDetails?.googleMapsLink ||
                  (data?.latitude && data?.longitude)) &&
                  getMapEmbedUrl() && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Location</p>
                      <div className="border-2 border-gray-300 rounded-lg overflow-hidden aspect-square relative">
                        <iframe
                          src={getMapEmbedUrl()}
                          width="100%"
                          height="100%"
                          style={{
                            border: 0,
                            position: "absolute",
                            top: 0,
                            left: 0,
                          }}
                          allowFullScreen=""
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          className="w-full h-full"
                        />
                      </div>
                      {outletDetails?.googleMapsLink && (
                        <a
                          href={outletDetails.googleMapsLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 mt-2 inline-block"
                        >
                          Open in Google Maps →
                        </a>
                      )}
                    </div>
                  )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "membership" && (
          <div className="space-y-6 sm:space-y-8">
            {/* Membership Scheme Section */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
              <h3 className="text-lg sm:text-xl font-['Gilroy-Medium'] text-[#1B1717] mb-4 sm:mb-6">
                Membership Scheme
              </h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="relative flex-1 sm:max-w-xs">
                  <select
                    value={selectedScheme}
                    onChange={(e) => setSelectedScheme(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none  text-sm sm:text-base bg-white text-[#1B1717] appearance-none pr-10"
                    disabled={upgradeLoading || visibilityLoading}
                  >
                    <option value="">Select Slab</option>
                    {slabList.map((slab) => {
                      const amountDisplay =
                        slab.slabAmount === "free" || slab.slabAmount === 0
                          ? "Free"
                          : `₹${slab.slabAmount}`;
                      const subscriptionStatus = slab.isSubscribed
                        ? "Subscribed"
                        : "Unsubscribed";
                      return (
                        <option key={slab.id} value={slab.id}>
                          {slab.slabName} ({amountDisplay}) -{" "}
                          {subscriptionStatus}
                        </option>
                      );
                    })}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
                <button
                  onClick={() => {
                    if (
                      selectedScheme &&
                      selectedScheme !== String(data?.slabId)
                    ) {
                      setShowConfirmModal(true);
                    }
                  }}
                  disabled={
                    !selectedScheme ||
                    selectedScheme === String(data?.slabId) ||
                    upgradeLoading ||
                    visibilityLoading
                  }
                  className="px-6 py-3 bg-[#039155] text-white rounded-lg font-[Gilroy-Medium] hover:bg-green-700 transition-colors text-sm sm:text-base whitespace-nowrap disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {(() => {
                    if (upgradeLoading) return "Processing...";
                    const selectedSlab = slabList.find(
                      (s) => String(s.id) === selectedScheme,
                    );
                    const isSubscribed = selectedSlab?.isSubscribed || false;
                    return isSubscribed ? "Change Slab" : "Upgrade";
                  })()}
                </button>
              </div>
            </div>

            {/* Personal Details Section */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
              <h3 className="text-lg sm:text-xl font-['Gilroy-Medium'] text-[#1B1717] mb-4 sm:mb-6">
                Personal Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Company Information */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Company Name</p>
                  <p className="text-sm sm:text-base font-[Gilroy-Medium] text-[#1B1717]">
                    {companyDetails?.companyName || data?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Mobile Number</p>
                  <p className="text-sm sm:text-base font-[Gilroy-Medium] text-[#1B1717]">
                    {data?.mobileNo || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Email Id</p>
                  <p className="text-sm sm:text-base font-[Gilroy-Medium] text-[#1B1717]">
                    {data?.email || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Agent Code</p>
                  <p className="text-sm sm:text-base font-[Gilroy-Medium] text-[#1B1717]">
                    {data?.agentCode || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">GST Number</p>
                  <p className="text-sm sm:text-base font-[Gilroy-Medium] text-[#1B1717]">
                    {companyDetails?.compnyGst || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">User ID</p>
                  <p className="text-sm sm:text-base font-[Gilroy-Medium] text-[#1B1717]">
                    {data?.id || "N/A"}
                  </p>
                </div>

                {/* Location and Profile Information */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">State</p>
                  <p className="text-sm sm:text-base font-[Gilroy-Medium] text-[#1B1717]">
                    {data?.state || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">City</p>
                  <p className="text-sm sm:text-base font-[Gilroy-Medium] text-[#1B1717]">
                    {data?.city || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Pin Code</p>
                  <p className="text-sm sm:text-base font-[Gilroy-Medium] text-[#1B1717]">
                    {data?.pinCode || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    Profile Expiry Date
                  </p>
                  <p className="text-sm sm:text-base font-[Gilroy-Medium] text-[#1B1717]">
                    {data?.createdAt
                      ? new Date(data.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Login URL</p>
                  <p className="text-sm sm:text-base font-[Gilroy-Medium] text-[#1B1717]">
                    {companyDetails?.companyDomain || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-[Gilroy-Medium] text-white ${
                      (data?.status || "Active").toLowerCase() === "inactive"
                        ? "bg-red-500"
                        : "bg-[#039155]"
                    }`}
                  >
                    {data?.status || "Active"}
                  </span>
                </div>

                {/* Address and Coordinates */}
                <div className="sm:col-span-2 lg:col-span-3">
                  <p className="text-xs text-gray-500 mb-1">Address</p>
                  <p className="text-sm sm:text-base font-[Gilroy-Medium] text-[#1B1717]">
                    {data?.address || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Latitude</p>
                  <p className="text-sm sm:text-base font-[Gilroy-Medium] text-[#1B1717]">
                    {data?.latitude || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Longitude</p>
                  <p className="text-sm sm:text-base font-[Gilroy-Medium] text-[#1B1717]">
                    {data?.longitude || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Reporting To : </p>
                  <p className="text-sm sm:text-base font-[Gilroy-Medium] text-[#1B1717]">
                    {data?.reportingToManager || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    Reporting Contact{" "}
                  </p>
                  <p className="text-sm sm:text-base font-[Gilroy-Medium] text-[#1B1717]">
                    {data?.reportingToManagerMobile || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "bankDetails" && (
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between gap-3">
              {isAddingBank ? (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddingBank(false)}
                    className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors"
                    aria-label="Back to Bank Details"
                  >
                    <span className="text-sm font-[Gilroy-Semibold] text-[#1B1717]">
                      ←
                    </span>
                  </button>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-['Gilroy-Medium'] text-[#1B1717]">
                    Enter Your Bank Details
                  </h3>
                </div>
              ) : (
                <>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-['Gilroy-Medium'] text-[#1B1717]">
                    Bank Details
                  </h3>

                  <button
                    type="button"
                    onClick={() => setIsAddingBank(true)}
                    className="inline-flex items-center gap-2 px-5 py-2 sm:px-6 sm:py-2.5 rounded-xl border border-[#4B4B4B] text-xs sm:text-sm font-[Gilroy-Medium] text-[#4B4B4B] bg-white hover:bg-gray-50 transition"
                  >
                    <span className="flex items-center justify-center w-6 h-6 rounded-full border border-[#4B4B4B] text-[#4B4B4B] text-md">
                      +
                    </span>
                    <span>Add New Account</span>
                  </button>
                </>
              )}
            </div>

            {/* Add / Edit Bank Form */}
            {isAddingBank ? (
              <div className="rounded-2xl border border-[#E5E7EB] px-4 py-5 sm:px-6 sm:py-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  {/* Account Number */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs sm:text-sm font-[Gilroy-Medium] text-[#1B1717]">
                      Account Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={bankAccountNumber}
                      onChange={(e) =>
                        setBankAccountNumber(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="Enter Account Number"
                      className="w-full h-[40px] sm:h-[44px] border border-[#D1D5DB] rounded-lg px-3 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#039155]"
                    />
                  </div>

                  {/* IFSC Code */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs sm:text-sm font-[Gilroy-Medium] text-[#1B1717]">
                      IFSC Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={bankIfsc}
                      onChange={(e) =>
                        setBankIfsc(e.target.value.toUpperCase())
                      }
                      placeholder="Enter IFSC Code"
                      className="w-full h-[40px] sm:h-[44px] border border-[#D1D5DB] rounded-lg px-3 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#039155]"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-center sm:justify-start gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingBank(false);
                      setBankAccountNumber("");
                      setBankIfsc("");
                    }}
                    className="w-full sm:w-40 h-[40px] sm:h-[44px] border border-[#D1D5DB] rounded-lg text-sm font-[Gilroy-Medium] text-[#111827] hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!bankAccountNumber || !bankIfsc) {
                        showNotification({
                          type: "error",
                          message: "Please enter account number and IFSC code.",
                          isCritical: true,
                        });
                        return;
                      }

                      const payload = {
                        account_number: bankAccountNumber,
                        ifsc: bankIfsc,
                      };

                      try {
                        await dispatch(addBankDetails(payload));
                        // Refresh profile/bank details
                        await dispatch(getMDDetails());

                        showNotification({
                          type: "success",
                          message: "Bank details added successfully.",
                          isCritical: true,
                        });

                        setIsAddingBank(false);
                        setBankAccountNumber("");
                        setBankIfsc("");
                      } catch (error) {
                        showNotification({
                          type: "error",
                          message:
                            error?.message ||
                            "Failed to add bank details. Please try again.",
                          isCritical: true,
                        });
                      }
                    }}
                    className="w-full sm:w-40 h-[40px] sm:h-[44px] rounded-lg bg-[#039155] text-white text-sm font-[Gilroy-Semibold] hover:bg-green-700 transition"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {bankDetails && bankDetails.length > 0 ? (
                  bankDetails.map((bank, index) => (
                    <div
                      key={bank.id}
                      className="flex items-start justify-between gap-6 w-full"
                    >
                      {/* Bank Name */}
                      <div className="flex flex-col w-1/5">
                        <p className="text-xs text-gray-500">Bank Name</p>
                        <p className="text-sm text-[#1B1717] font-[Gilroy-Medium]">
                          {bank.bankName || "N/A"}
                        </p>
                      </div>

                      {/* Created On */}
                      <div className="flex flex-col w-1/5">
                        <p className="text-xs text-gray-500">City</p>
                        <p className="text-sm text-[#1B1717] font-[Gilroy-Medium]">
                          {bank.city || "N/A"}
                        </p>
                      </div>

                      {/* Account Number */}
                      <div className="flex flex-col w-1/6">
                        <p className="text-xs text-gray-500">Account Number</p>
                        <p className="text-sm text-[#1B1717] font-[Gilroy-Medium]">
                          {bank.accountNumber || "N/A"}
                        </p>
                      </div>

                      {/* IFSC Code */}
                      <div className="flex flex-col w-1/6">
                        <p className="text-xs text-gray-500">IFSC Code</p>
                        <p className="text-sm text-[#1B1717] font-[Gilroy-Medium]">
                          {bank.ifsc || "N/A"}
                        </p>
                      </div>

                      {/* Branch */}
                      <div className="flex flex-col w-1/6">
                        <p className="text-xs text-gray-500">Branch</p>
                        <p className="text-sm text-[#1B1717] font-[Gilroy-Medium]">
                          {bank.branch || "N/A"}
                        </p>
                      </div>

                      {/* Status */}
                      <div className="flex flex-col w-20">
                        <p className="text-xs text-gray-500">Status</p>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-[Gilroy-Medium] bg-[#039155] text-white">
                          Active
                        </span>
                      </div>

                      <div className="flex flex-col w-20">
                        <p className="text-xs text-gray-500">Action</p>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBank(bank);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-500 hover:text-red-700 transition"
                          title="Delete bank account"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No bank details available</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Bank Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-[#D9D9D9CC] flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 relative">
            <h3 className="text-lg font-[Gilroy-Semibold] text-[#1B1717] mb-3">
              Delete Bank Account
            </h3>

            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this bank account?
              <br />
              <span className="font-[Gilroy-Medium] text-gray-800">
                Account No: {selectedBank?.accountNumber}
              </span>
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedBank(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteBank}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 animate-slideUp relative">
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-xl font-[Gilroy-Semibold] text-gray-800">
                  {(() => {
                    const selectedSlab = slabList.find(
                      (s) => String(s.id) === selectedScheme,
                    );
                    const isSubscribed = selectedSlab?.isSubscribed || false;
                    return isSubscribed
                      ? "Confirm Slab Change"
                      : "Confirm Slab Upgrade";
                  })()}
                </h3>
              </div>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="absolute right-3 top-3 w-10 h-10 flex items-center justify-center rounded-xl bg-[#039155] hover:opacity-90 transition"
              >
                <X className="w-6 h-6 text-[#FFFFFF] rounded-full border-[2.5px] border-[#FFFFFF] p-0.5" />
              </button>
              <div className="mb-6">
                {/* Wallet Balance Display - Only show if NOT subscribed */}
                {(() => {
                  const selectedSlab = slabList.find(
                    (s) => String(s.id) === selectedScheme,
                  );
                  const isSubscribed = selectedSlab?.isSubscribed || false;

                  // Only show wallet balance if NOT subscribed (for upgrade)
                  if (!isSubscribed) {
                    return (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">
                          Main Wallet Balance
                        </p>
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
                    );
                  }
                  return null;
                })()}

                <p className="text-gray-700 mb-2">
                  {(() => {
                    const selectedSlab = slabList.find(
                      (s) => String(s.id) === selectedScheme,
                    );
                    const isSubscribed = selectedSlab?.isSubscribed || false;
                    return isSubscribed
                      ? "Are you sure you want to change the membership scheme?"
                      : "Are you sure you want to upgrade the membership scheme?";
                  })()}
                </p>
                {selectedScheme && (
                  <p className="text-sm text-gray-600">
                    New Slab:{" "}
                    <span className="font-[Gilroy-Semibold]">
                      {(() => {
                        const selectedSlab = slabList.find(
                          (s) => String(s.id) === selectedScheme,
                        );
                        if (!selectedSlab) return "N/A";
                        const amountDisplay =
                          selectedSlab.slabAmount === "free" ||
                          selectedSlab.slabAmount === 0
                            ? "Free"
                            : `₹${selectedSlab.slabAmount}`;
                        const subscriptionStatus = selectedSlab.isSubscribed
                          ? "Subscribed"
                          : "Unsubscribed";
                        return `${selectedSlab.slabName} (${amountDisplay}) - ${subscriptionStatus}`;
                      })()}
                    </span>
                  </p>
                )}
                {upgradeError && (
                  <p className="text-sm text-red-600 mt-2 font-[Gilroy-Semibold] bg-red-50 p-2 rounded border border-red-200">
                    {upgradeError}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={upgradeLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const companyId = companyDetails?.companyId || data?.id;
                    if (selectedScheme && companyId) {
                      await dispatch(
                        userUpgradeSubscription(selectedScheme, companyId),
                      );
                      // Error message from API will be shown via useEffect watching upgradeError
                    }
                  }}
                  disabled={upgradeLoading}
                  className="px-4 py-2 bg-[#039155] text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {(() => {
                    const selectedSlab = slabList.find(
                      (s) => String(s.id) === selectedScheme,
                    );
                    const isSubscribed = selectedSlab?.isSubscribed || false;
                    if (upgradeLoading) {
                      return isSubscribed ? "Changing..." : "Upgrading...";
                    }
                    return isSubscribed ? "Confirm Change" : "Confirm Upgrade";
                  })()}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Popup Modal */}
      {showImageModal && outletDetails?.shopImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fadeIn"
          onClick={() => setShowImageModal(false)}
        >
          <div
            className="relative max-w-7xl max-h-[90vh] mx-4 animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6 text-gray-800" />
            </button>

            {/* Full Image */}
            <img
              src={outletDetails.shopImage}
              alt="Shop - Full View"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

DistributerProfile.propTypes = {
  onBack: PropTypes.func,
};

export default DistributerProfile;
