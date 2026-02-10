import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";
import { MapPin, FileText, Camera, X } from "lucide-react";
import { HiArrowLeft } from "react-icons/hi2";
import PhoneIcon from "../../../public/img/PhoneIcon.png";
import EmailIcon from "../../../public/img/Emailicon.png";
import Gst from "../../../public/img/Gst.png";
import Pincode from "../../../public/img/Pincode.png";
import AgentCode from "../../../public/img/AgentCode.png";
import UserId from "../../../public/img/UserId.png";
import bgimage from "../../../public/img/banner.svg";
import { motion } from "framer-motion";
import { getUserMDDetails } from "../../redux/action/whiteLabelAction";
import { getSlabVisibility } from "../../redux/action/slabAction";

const ProfileDetails = ({ onBack = null }) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("membership");
  const [imageError, setImageError] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  // Get profile data from Redux
  const companyAdminState = useSelector(
    (state) => state?.whitelabel?.companyAdmin,
  );
  const userAdminState = useSelector(
    (state) => state?.whitelabel?.userAdminDetails,
  );
  const isLoading = useSelector((state) => state?.loading?.isLoading || false);
  const companyAdminData = companyAdminState?.companyAdminData || null;
  const userAdminData = userAdminState?.userAdminDetails || null;

  // Get slab visibility list from Redux
  const slabList = useSelector((state) => state?.slab?.visibilityData || []);

  // Extract data from Redux (prefer MD userAdminData, fallback to companyAdminData)
  // Do this before early returns to maintain hook order
  const data = userAdminData || companyAdminData || {};
  const companyDetails = data?.companyDetails || {};
  const outletDetails = data?.outletDetails || {};
  const bankDetails = data?.bankDetails || [];

  // Debug logs to verify where data is coming from
  useEffect(() => {
    console.log("MD ProfileDetails - companyAdminData:", companyAdminData);
    console.log("MD ProfileDetails - userAdminData:", userAdminData);
    console.log("MD ProfileDetails - resolved data:", data);
  }, [companyAdminData, userAdminData, data]);

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

  // Reset image error when data changes
  useEffect(() => {
    setImageError(false);
  }, [data]);

  // Fetch slab visibility when profile data is loaded (MD user or company admin)
  useEffect(() => {
    if (!data || !data.id) return;
    const companyId = companyDetails?.companyId || data?.companyId;
    if (!companyId) return;
    dispatch(getSlabVisibility(data.id, companyId));
  }, [data, companyDetails?.companyId, dispatch]);

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

  // Show skeleton while loading or when no profile data yet
  const hasData = data && Object.keys(data).length > 0;
  if (isLoading || !hasData) {
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
              onClick={onBack || (() => globalThis.history?.back())}
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
                  <span className="font-[gilroy-medium]">
                    {data?.state || "N/A"}
                  </span>
                </div>
                <span className="px-3 py-1 bg-[#158ACD] text-[#FFFFFF] rounded-full text-sm sm:text-base font-[gilroy-medium]">
                  Whitelabel
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
                  className={`relative z-10 text-sm sm:text-base font-[gilroy-medium] whitespace-nowrap transition-colors ${
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
                  <p className="text-sm sm:text-base font-medium text-[#1B1717]">
                    {data?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Aadhar Number</p>
                  <p className="text-sm sm:text-base font-medium text-[#1B1717]">
                    {data?.aadhaarNumber || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Upload Date</p>
                  <p className="text-sm sm:text-base font-medium text-[#1B1717]">
                    14-05-2022
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-[#039155] text-white">
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
                  <p className="text-sm sm:text-base font-medium text-[#1B1717]">
                    {data?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Pan Number</p>
                  <p className="text-sm sm:text-base font-medium text-[#1B1717]">
                    {companyDetails?.compnyPan || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Upload Date</p>
                  <p className="text-sm sm:text-base font-medium text-[#1B1717]">
                    14-05-2022
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-[#039155] text-white">
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
                  <p className="text-sm sm:text-base font-medium text-[#1B1717]">
                    {outletDetails?.shopName || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Shop Address</p>
                  <p className="text-sm sm:text-base font-medium text-[#1B1717]">
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
            {/* Membership Scheme Section (read-only for MD) */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
              <h3 className="text-lg sm:text-xl font-['Gilroy-Medium'] text-[#1B1717] mb-4 sm:mb-2">
                Membership Scheme
              </h3>
              <p className="text-sm text-gray-500 mb-1">Current Scheme</p>
              <p className="text-base sm:text-lg font-semibold text-[#1B1717]">
                {(() => {
                  if (!Array.isArray(slabList) || slabList.length === 0) {
                    return "N/A";
                  }
                  // Prefer slab matching user's slabId
                  const byId = data?.slabId
                    ? slabList.find((s) => s.id === data.slabId)
                    : null;
                  const current = byId || slabList[0];
                  if (!current) return "N/A";
                  const isFree =
                    current.slabAmount === "free" || current.slabAmount === 0;
                  const amountLabel = isFree
                    ? "Free"
                    : `₹${current.slabAmount}`;
                  return `${current.slabName || "N/A"} (${amountLabel})`;
                })()}
              </p>
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
                  <p className="text-sm sm:text-base font-medium text-[#1B1717]">
                    {companyDetails?.companyName || data?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Mobile Number</p>
                  <p className="text-sm sm:text-base font-medium text-[#1B1717]">
                    {data?.mobileNo || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Email Id</p>
                  <p className="text-sm sm:text-base font-medium text-[#1B1717]">
                    {data?.email || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Agent Code</p>
                  <p className="text-sm sm:text-base font-medium text-[#1B1717]">
                    {data?.agentCode || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">GST Number</p>
                  <p className="text-sm sm:text-base font-medium text-[#1B1717]">
                    {companyDetails?.compnyGst || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">User ID</p>
                  <p className="text-sm sm:text-base font-medium text-[#1B1717]">
                    {data?.id || "N/A"}
                  </p>
                </div>

                {/* Location and Profile Information */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">State</p>
                  <p className="text-sm sm:text-base font-medium text-[#1B1717]">
                    {data?.state || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">City</p>
                  <p className="text-sm sm:text-base font-medium text-[#1B1717]">
                    {data?.city || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Pin Code</p>
                  <p className="text-sm sm:text-base font-medium text-[#1B1717]">
                    {data?.pinCode || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    Profile Expiry Date
                  </p>
                  <p className="text-sm sm:text-base font-medium text-[#1B1717]">
                    {data?.createdAt
                      ? new Date(data.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Login URL</p>
                  <p className="text-sm sm:text-base font-medium text-[#1B1717]">
                    {companyDetails?.companyDomain || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium text-white ${
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
                  <p className="text-sm sm:text-base font-medium text-[#1B1717]">
                    {data?.address || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Latitude</p>
                  <p className="text-sm sm:text-base font-medium text-[#1B1717]">
                    {data?.latitude || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Longitude</p>
                  <p className="text-sm sm:text-base font-medium text-[#1B1717]">
                    {data?.longitude || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "bankDetails" && (
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
            {/* Header */}
            <div className="mb-6">
              <h3 className="text-lg sm:text-xl md:text-2xl font-['Gilroy-Medium'] text-[#1B1717]">
                Bank Details
              </h3>
            </div>

            <div className="space-y-6">
              {bankDetails && bankDetails.length > 0 ? (
                bankDetails.map((bank, index) => (
                  <div
                    key={bank.id || index}
                    className="flex items-start justify-between gap-6 w-full"
                  >
                    {/* Bank Name */}
                    <div className="flex flex-col w-1/5">
                      <p className="text-xs text-gray-500">Bank Name</p>
                      <p className="text-sm text-[#1B1717] font-medium">
                        {bank.bankName || "N/A"}
                      </p>
                    </div>

                    {/* Created On */}
                    <div className="flex flex-col w-1/5">
                      <p className="text-xs text-gray-500">City</p>
                      <p className="text-sm text-[#1B1717] font-medium">
                        {bank.city || "N/A"}
                      </p>
                    </div>

                    {/* Account Number */}
                    <div className="flex flex-col w-1/6">
                      <p className="text-xs text-gray-500">Account Number</p>
                      <p className="text-sm text-[#1B1717] font-medium">
                        {bank.accountNumber || "N/A"}
                      </p>
                    </div>

                    {/* IFSC Code */}
                    <div className="flex flex-col w-1/6">
                      <p className="text-xs text-gray-500">IFSC Code</p>
                      <p className="text-sm text-[#1B1717] font-medium">
                        {bank.ifsc || "N/A"}
                      </p>
                    </div>

                    {/* Branch */}
                    <div className="flex flex-col w-1/6">
                      <p className="text-xs text-gray-500">Branch</p>
                      <p className="text-sm text-[#1B1717] font-medium">
                        {bank.branch || "N/A"}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="flex flex-col w-20">
                      <p className="text-xs text-gray-500">Status</p>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#039155] text-white">
                        Active
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No bank details available</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

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

ProfileDetails.propTypes = {
  onBack: PropTypes.func,
};

export default ProfileDetails;
