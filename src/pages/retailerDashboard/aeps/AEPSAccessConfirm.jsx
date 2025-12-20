import { useState } from "react";
import { HiOutlineArrowNarrowLeft } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import Selectservice from "./Selectservice";
import { aepsStatusCheck } from "../../../redux/action/aepsAction";

const AEPSAccessConfirm = () => {
  const navigate = useNavigate();
  const [showSelectService, setShowSelectService] = useState(false);

  if (showSelectService) {
    return <Selectservice />;
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <button
          type="button"
          aria-label="Back"
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-10 h-10 border border-gray-300 rounded-full bg-white hover:bg-gray-50 transition"
        >
          <HiOutlineArrowNarrowLeft className="text-2xl text-[#1B1717] opacity-80" />
        </button>

        <div className="flex-1">
          <div className="text-[24px] sm:text-[24px] font-['Gilroy-Medium'] text-[#1B1717]">
            AEPS Access Confirmed
          </div>
          <div className="mt-[10px] text-[16px]  text-[#000000] font-['Gilroy-Regular']">
            Connect Your RD Service Device To Proceed With Aadhaar Authentication.
            Ensure Your Fingers Are Clean And Dry
          </div>
        </div>
      </div>

      {/* Card */}
      <div className="bg-[#FFFFFF] rounded-2xl px-6 py-10 sm:px-10 sm:py-12">
        <div className="max-w-2xl mx-auto text-center">
          {/* Badge */}
          <div className="mx-auto w-[124px] h-[124px] relative flex items-center justify-center">
            {/* Background badge (scaled up) */}
            <svg
              className="absolute inset-0 w-full h-full z-0"
              viewBox="0 0 92 92"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M46 7.5
                  C55.2 7.5 58.8 15.1 64.2 17.8
                  C69.8 20.6 78 17.4 81.4 25.0
                  C84.7 32.5 78.2 38.0 78.2 46.0
                  C78.2 54.0 84.7 59.5 81.4 67.0
                  C78 74.6 69.8 71.4 64.2 74.2
                  C58.8 76.9 55.2 84.5 46 84.5
                  C36.8 84.5 33.2 76.9 27.8 74.2
                  C22.2 71.4 14 74.6 10.6 67.0
                  C7.3 59.5 13.8 54.0 13.8 46.0
                  C13.8 38.0 7.3 32.5 10.6 25.0
                  C14 17.4 22.2 20.6 27.8 17.8
                  C33.2 15.1 36.8 7.5 46 7.5Z"
                fill="#039155"
              />
            </svg>

            {/* Foreground (kept same size as before) */}
            <svg
              className="relative z-10"
              width="92"
              height="92"
              viewBox="0 0 92 92"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {/* Inner circle (do not change) */}
              <circle cx="46" cy="46" r="16.5" stroke="#FFFFFF" strokeWidth="3" />

              {/* Check mark */}
              <path
                d="M55 41L43.5 52.5L37 46"
                stroke="#FFFFFF"
                strokeWidth="3.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>


          {/* Status pill */}
          <div className="mt-6 inline-flex items-center gap-2 bg-[#E5FFF4] rounded-full px-4 py-2">
            <span className="w-2 h-2 rounded-full bg-[#039155]" />
            <span className="text-[12px] font-['Gilroy-Medium'] text-[#1B1717]">
              Status : Active
            </span>
          </div>

          <div className="mt-6 text-[20px] sm:text-[22px] font-['Gilroy-Medium'] text-[#1B1717]">
            Your Are All Set !
          </div>
          <div className="mt-2 text-[12px] sm:text-[13px] text-gray-500 font-['Gilroy-Regular'] leading-relaxed">
            Your AEPS Agent Account Has Been Successfully Verified. Access Is Now
            Enabled For Secure Aadhaar-Based Transactions
          </div>

          <button
            type="button"
            onClick={() => setShowSelectService(true)}
            className="mt-8 flex items-center justify-between bg-[#039155] hover:bg-[#027A47] text-white rounded-lg px-6 py-3 text-[14px] font-['Gilroy-Medium'] transition w-full max-w-[320px] mx-auto"
          >
            <span>Perform Your Transaction</span>
            <span className="inline-flex items-center justify-center w-8 h-8 ml-4">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M5 12h12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M13 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AEPSAccessConfirm;
