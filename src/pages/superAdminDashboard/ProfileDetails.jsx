import React, { useState } from "react";
import PropTypes from "prop-types";
import { MapPin, FileText, Camera, ChevronDown, Plus } from "lucide-react";
import PhoneIcon from "../../../public/img/PhoneIcon.png";
import EmailIcon from "../../../public/img/Emailicon.png";
import Gst from "../../../public/img/Gst.png";
import Pincode from "../../../public/img/Pincode.png";
import AgentCode from "../../../public/img/AgentCode.png";
import UserId from "../../../public/img/UserId.png";
import aadhaarfront from "../../../public/img/aadhaar-front.png";
import aadhaarback from "../../../public/img/aadhaar-back.png";
import pancardfront from "../../../public/img/pancard-front.png";
import pancardback from "../../../public/img/pancard-back.png";
import bgimage from "../../../public/img/image.png";
import { motion } from "framer-motion";

const ProfileDetails = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState("bankDetails");
  const [selectedScheme, setSelectedScheme] = useState("");

  return (
    <div className="min-h-screen py-4 px-3 bg-[#FAFAFA] text-[#1B1717]">
      {/* Cover Picture Section */}
      <div
        className="w-full h-48 sm:h-64 relative bg-cover bg-center bg-no-repeat rounded-t-3xl"
        style={{
          backgroundImage: `url(${bgimage})`,
        }}
      >
        {/* Profile Picture - Overlapping bottom-left */}
        <div className="absolute bottom-0 left-6 sm:left-8 transform translate-y-1/2">
          <div className="w-32 h-36 sm:w-40 sm:h-48 rounded-2xl bg-white flex items-center justify-center border-4 border-white shadow-lg">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#039155] rounded-full flex items-center justify-center cursor-pointer">
              <Camera className="text-white w-8 h-8 sm:w-10 sm:h-10" />
            </div>
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
                RUDRAA INITIATIVES
              </h2>
              <div className="flex flex-wrap items-center gap-[20px] sm:gap-4 mb-3 sm:mb-4">
                <div className="flex items-center gap-[8px] text-xs sm:text-sm text-[#1B1717]/80 font-['Gilroy-Medium']">
                  <img
                    src={PhoneIcon}
                    alt="Phone"
                    className="w-[12px] h-[12px] text-[#1B1717]/80"
                  />
                  <span>9740418525</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-[#1B1717]/80 font-['Gilroy-Medium']">
                  <img
                    src={EmailIcon}
                    alt="Email"
                    className="w-[12px] h-[12px] text-[#1B1717]/80"
                  />
                  <span>Rudra@GMAIL.COM</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-[#1B1717]/80">
                  <MapPin className="w-4 h-4 text-[#1B1717]/80" />
                  <span className="font-[gilroy-medium]">Karnataka</span>
                </div>
                <span className="px-3 py-1 bg-[#158ACD] text-[#FFFFFF] rounded-full text-sm sm:text-base font-[gilroy-medium]">
                  Whitelabel
                </span>
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-2 bg-[#008D1E] px-2 py-1 rounded-3xl mb-16">
              <div className="w-2 h-2 bg-[#FFFFFF] rounded-full flex items-center justify-center"></div>
              <span className="text-[12px] sm:text-sm font-['Gilroy-SemiBold'] text-[#FFFFFF]">
                Active
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
                16007
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
                SECPY26007
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
                6007
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
                N/A
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
                    Rohan G
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Aadhar Number</p>
                  <p className="text-sm sm:text-base font-medium text-[#1B1717]">
                    1234 4567 4568 ****
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
                    <img
                      src={aadhaarfront}
                      alt="Aadhar Front"
                      className="w-full h-48 sm:h-64 object-contain"
                    />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2">Aadhar Back</p>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                    <img
                      src={aadhaarback}
                      alt="Aadhar Back"
                      className="w-full h-48 sm:h-64 object-contain"
                    />
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
                    Rohan G
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Pan Number</p>
                  <p className="text-sm sm:text-base font-medium text-[#1B1717]">
                    DDG4568 ****
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
                    <img
                      src={pancardfront}
                      alt="Pan Front"
                      className="w-full h-48 sm:h-64 object-contain"
                    />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2">Pan Back</p>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                    <img
                      src={pancardback}
                      alt="Pan Back"
                      className="w-full h-48 sm:h-64 object-contain"
                    />
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
                    Rohan G
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Shop Address</p>
                  <p className="text-sm sm:text-base font-medium text-[#1B1717]">
                    Rajaji Nagar Near Metro Station
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2">Shop Image</p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg h-48 sm:h-64 bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">Shop Image</p>
                  </div>
                </div>
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
                  >
                    <option value="">Select</option>
                    <option value="basic">Basic</option>
                    <option value="premium">Premium</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
                <button className="px-6 py-3 bg-[#039155] text-white rounded-lg font-medium hover:bg-green-700 transition-colors text-sm sm:text-base whitespace-nowrap">
                  Upgrade
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
                  <p className="text-sm sm:text-base font-medium text-[#1B1717]">
                    RUDRAA INITIATIVES MEDIA PRIVATE LIMITED
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Mobile Number</p>
                  <p className="text-sm sm:text-base font-medium text-[#1B1717]">
                    9740418522
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Email Id</p>
                  <p className="text-sm sm:text-base font-medium text-[#1B1717]">
                    Rudra@Gmail.Com
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Agent Code</p>
                  <p className="text-sm sm:text-base font-medium text-[#1B1717]">
                    102212
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">GST Number</p>
                  <p className="text-sm sm:text-base font-medium text-[#1B1717]">
                    Ghb1234
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">User ID</p>
                  <p className="text-sm sm:text-base font-medium text-[#1B1717]">
                    16007
                  </p>
                </div>

                {/* Location and Profile Information */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">State</p>
                  <p className="text-sm sm:text-base font-medium text-[#1B1717]">
                    Karnataka
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">City</p>
                  <p className="text-sm sm:text-base font-medium text-[#1B1717]">
                    Bangalore
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Pin Code</p>
                  <p className="text-sm sm:text-base font-medium text-[#1B1717]">
                    577006
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    Profile Expiry Date
                  </p>
                  <p className="text-sm sm:text-base font-medium text-[#1B1717]">
                    Rudra@Gmail.Com
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Login URL</p>
                  <p className="text-sm sm:text-base font-medium text-[#1B1717]">
                    Rudra@Gmail.Com
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-[#039155] text-white">
                    Active
                  </span>
                </div>

                {/* Address and Coordinates */}
                <div className="sm:col-span-2 lg:col-span-3">
                  <p className="text-xs text-gray-500 mb-1">Address</p>
                  <p className="text-sm sm:text-base font-medium text-[#1B1717]">
                    501 Blue Mountain Building Malda East Mumbai
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Latitude</p>
                  <p className="text-sm sm:text-base font-medium text-[#1B1717]">
                    15.0123049
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Longitude</p>
                  <p className="text-sm sm:text-base font-medium text-[#1B1717]">
                    76.6158185
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "bankDetails" && (
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg sm:text-xl md:text-2xl font-['Gilroy-Medium'] text-[#1B1717]">
                Bank Details
              </h3>

              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-[#1B1717] hover:bg-gray-50">
                <Plus className="w-4 h-4" />
                Add New Account
              </button>
            </div>

            <div className="space-y-6">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="flex items-start justify-between gap-6 w-full"
                >
                  {/* Bank Name */}
                  <div className="flex flex-col w-1/5">
                    <p className="text-xs text-gray-500">Bank Name</p>
                    <p className="text-sm text-[#1B1717] font-medium">
                      Kotak Mahindra Bank
                    </p>
                  </div>

                  {/* Created On */}
                  <div className="flex flex-col w-1/5">
                    <p className="text-xs text-gray-500">Created On</p>
                    <p className="text-sm text-[#1B1717] font-medium">
                      2024-07-12 20:34:25
                    </p>
                  </div>

                  {/* Account Number */}
                  <div className="flex flex-col w-1/6">
                    <p className="text-xs text-gray-500">Account Number</p>
                    <p className="text-sm text-[#1B1717] font-medium">
                      049754551
                    </p>
                  </div>

                  {/* IFSC Code */}
                  <div className="flex flex-col w-1/6">
                    <p className="text-xs text-gray-500">IFSC Code</p>
                    <p className="text-sm text-[#1B1717] font-medium">
                      KKBK0805
                    </p>
                  </div>

                  {/* Branch */}
                  <div className="flex flex-col w-1/6">
                    <p className="text-xs text-gray-500">Branch</p>
                    <p className="text-sm text-[#1B1717] font-medium">
                      Bangalore Main
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
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

ProfileDetails.propTypes = {
  onBack: PropTypes.func,
};

ProfileDetails.defaultProps = {
  onBack: null,
};

export default ProfileDetails;
