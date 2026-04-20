import React, { useState } from "react";
import PropTypes from "prop-types";
import { Check, Plus } from "lucide-react";
import { HiOutlineArrowNarrowLeft } from "react-icons/hi";

const EditMembership = ({ scheme, onBack }) => {
  const [schemeName, setSchemeName] = useState(scheme?.name || "");
  const [schemeMode, setSchemeMode] = useState("Global");
  const [schemeType, setSchemeType] = useState("Free");

  // Sample commission data - matching image exactly
  const [commissions, setCommissions] = useState([
    {
      id: 1,
      operator: "BSNL",
      operatorType: "Percent",
      myDeal: "3.74",
      entMargin: "0.74",
      whitelabel: "3",
    },
    {
      id: 2,
      operator: "BSNL",
      operatorType: "Percent",
      myDeal: "3.74",
      entMargin: "0.74",
      whitelabel: "3",
    },
    {
      id: 3,
      operator: "BSNL",
      operatorType: "Percent",
      myDeal: "3.74",
      entMargin: "0.74",
      whitelabel: "3",
    },
    {
      id: 4,
      operator: "BSNL",
      operatorType: "Percent",
      myDeal: "3.74",
      entMargin: "0.74",
      whitelabel: "3",
    },
    {
      id: 5,
      operator: "BSNL",
      operatorType: "Percent",
      myDeal: "3.74",
      entMargin: "0.74",
      whitelabel: "3",
    },
    {
      id: 6,
      operator: "BSNL",
      operatorType: "Percent",
      myDeal: "3.74",
      entMargin: "0.74",
      whitelabel: "3",
    },
    {
      id: 7,
      operator: "BSNL",
      operatorType: "Percent",
      myDeal: "3.74",
      entMargin: "0.74",
      whitelabel: "3",
    },
  ]);

  const handleCommissionChange = (id, field, value) => {
    setCommissions(
      commissions.map((comm) =>
        comm.id === id ? { ...comm, [field]: value } : comm,
      ),
    );
  };

  return (
    <div className="min-h-screen p-2 sm:p-3 md:p-4 text-[#1B1717]">
      {/* Header Section */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <button
            onClick={onBack}
            className="flex items-center text-[#1B1717] hover:text-[#039155] transition"
          >
            <div className="rounded-full p-2 bg-[#FFFFFF] border-[0.5px] border-[#1B1717]/80 transition">
              <HiOutlineArrowNarrowLeft className="text-xl sm:text-2xl text-[#1B1717] opacity-80" />
            </div>
          </button>

          <h1 className="text-[20px] sm:text-2xl md:text-2xl font-['Gilroy-Medium'] text-[#1B1717]">
            Edit Membership Scheme
          </h1>
        </div>

        <span className="block mt-2 sm:mt-0 sm:ml-14 text-sm sm:text-base font-[Gilroy-Regular] text-[#1B1717]">
          Configure Your Membership Settings And Commissions
        </span>
      </div>

      {/* Scheme Settings Section */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm mb-4 sm:mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
          {/* Scheme Name - Left */}
          <div>
            <label className="block text-sm sm:text-sm font-[Gilroy-Medium] text-[#121216] mb-2">
              Scheme Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter Scheme Name"
              value={schemeName}
              onChange={(e) => setSchemeName(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-[#1B1717]/80 rounded-lg focus:outline-none text-sm sm:text-sm text-[#1B1717]/80"
            />
          </div>

          {/* Empty column for spacing */}
          <div className="hidden md:block"></div>

          {/* Scheme Mode - Right */}
          <div>
            <label className="block text-sm sm:text-sm font-[Gilroy-Medium] text-[#121216] mb-2">
              Scheme Mode
            </label>
            <label className="flex items-start gap-3 px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg cursor-pointer transition-all bg-white hover:border-gray-400">
              <div className="relative mt-1 flex-shrink-0">
                <input
                  type="radio"
                  name="schemeMode"
                  value="Global"
                  checked={schemeMode === "Global"}
                  onChange={(e) => setSchemeMode(e.target.value)}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${schemeMode === "Global"
                      ? "border-[#039155] bg-[#039155]"
                      : "border-gray-300 bg-white"
                    }`}
                >
                  {schemeMode === "Global" && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <span className="text-sm font-[Gilroy-Medium] block text-[#1B1717]/80">
                  Global
                </span>
                <p className="text-sm text-[#1B1717]/80 font-[Gilroy-Regular] leading-relaxed">
                  Available To All Users Worldwide
                </p>
              </div>
            </label>
          </div>

          {/* Scheme Type - Right */}
          <div>
            <label className="block text-sm sm:text-sm font-[Gilroy-Medium] text-[#121216] mb-2">
              Scheme Type
            </label>
            <label className="flex items-start gap-3 px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg cursor-pointer transition-all bg-white hover:border-gray-400">
              <div className="relative mt-1 flex-shrink-0">
                <input
                  type="radio"
                  name="schemeType"
                  value="Free"
                  checked={schemeType === "Free"}
                  onChange={(e) => setSchemeType(e.target.value)}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${schemeType === "Free"
                      ? "border-[#039155] bg-[#039155]"
                      : "border-gray-300 bg-white"
                    }`}
                >
                  {schemeType === "Free" && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <span className="text-sm font-[Gilroy-Medium] block text-[#1B1717]/80">
                  Free
                </span>
                <p className="text-sm text-[#1B1717]/80 font-[Gilroy-Regular] leading-relaxed">
                  No Cost Membership
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Mobile And DTH Recharge Commissions Section */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm">
        <div className="rounded-2xl bg-[#FAFAFA] p-4">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 bg-[#FFFFFF] rounded-lg p-4 sm:p-6">
            <div>
              <h2 className="text-base sm:text-lg md:text-xl font-['Gilroy-SemiBold'] text-[#1B1717] mb-1">
                Mobile And DTH Recharge
              </h2>
              <p className="text-sm sm:text-base font-['Gilroy-Regular'] text-[#1B1717]">
                Commissions
              </p>
            </div>
          </div>

          {/* Commissions Table */}
          <div className="mb-4 sm:mb-6">
            <div className="bg-[#FFFFFF] rounded-lg mb-3">
              <div className="overflow-x-auto">
                <div className="min-w-[800px] grid grid-cols-6 gap-4 px-4 py-3">
                  {[
                    "Operator",
                    "Operator Type",
                    "My Deal",
                    "My Margin",
                    "Whitelabel",
                    "Actions",
                  ].map((h, i) => (
                    <div
                      key={i}
                      className={`text-[14px] font-[Gilroy-Medium] text-[#121216] ${h === "Actions" ? "text-center" : "text-left"
                        }`}
                    >
                      {h}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Table Body */}
            <div className="bg-white rounded-xl overflow-x-auto">
              <div className="min-w-[800px]">
                {commissions.map((commission, index) => (
                  <div key={commission.id || index}>
                    <div className="grid grid-cols-6 gap-4 px-4 py-3 hover:bg-gray-50">
                      <span className="text-sm text-[#121216]">
                        {commission.operator}
                      </span>

                      <span className="inline-flex px-2 py-1 rounded-md text-sm bg-[#4F7EF4] text-white w-fit">
                        {commission.operatorType}
                      </span>

                      <span className="text-sm">{commission.myDeal}</span>

                      <input
                        type="text"
                        value={commission.entMargin || ""}
                        onChange={(e) =>
                          handleCommissionChange(
                            commission.id,
                            "entMargin",
                            e.target.value,
                          )
                        }
                        className="w-20 px-2 py-1 border rounded-md text-sm"
                      />

                      <input
                        type="text"
                        value={commission.whitelabel || ""}
                        onChange={(e) =>
                          handleCommissionChange(
                            commission.id,
                            "whitelabel",
                            e.target.value,
                          )
                        }
                        className="w-20 px-2 py-1 border rounded-md text-sm"
                      />

                      <div className="flex justify-center">
                        <div className="w-7 h-5 rounded border flex items-center justify-center">
                          <Check className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                    <hr className="mx-4 border-[#1B1717]/20" />
                  </div>
                ))}
              </div>
            </div>

            {/* Add New Operator Button */}
            <div className="flex justify-center mt-6 mb-6">
              <button className="flex items-center gap-2 bg-[#039155] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-[Gilroy-Medium] hover:bg-green-700 transition shadow-md">
                <div className="w-4 h-4 rounded-full border border-white flex items-center justify-center">
                  <Plus className="w-3 h-3 text-white" />
                </div>
                <span>Add New Operator</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

EditMembership.propTypes = {
  scheme: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    schemeId: PropTypes.string,
    created: PropTypes.string,
    members: PropTypes.string,
    tags: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        color: PropTypes.string,
      }),
    ),
  }),
  onBack: PropTypes.func.isRequired,
};

EditMembership.defaultProps = {
  scheme: null,
};

export default EditMembership;
