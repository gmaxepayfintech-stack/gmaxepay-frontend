import { useState } from "react";

function RetailerAadhaar({ setFormData, onNext }) {
  const [isVerified, setIsVerified] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);

  const handleVerify = () => {
    setIsVerified(true);
    if (setFormData)
      setFormData((d) => ({
        ...d,
        aadhaarDocFetched: true,
        digilockerLinked: true,
      }));
  };

  const handleDownload = () => {
    console.log("Download Aadhaar (retailer)\n");
  };

  const handleImageChange = (type, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (type === "front") setFrontImage(file);
    else setBackImage(file);
  };

  const handleSubmitImages = () => {
    if (setFormData) {
      setFormData((d) => ({
        ...d,
        aadhaarFront: frontImage,
        aadhaarBack: backImage,
      }));
    }
    if (onNext) onNext();
  };

  return (
    <div className="w-full h-full flex justify-center items-center p-2 sm:p-3 md:p-4 overflow-hidden">
      <div className="w-full max-w-[95%] sm:max-w-[600px] md:max-w-[750px]">

        {/* =================== STEP 1 =================== */}
        {!showImageUpload ? (
          <div className="space-y-4 sm:space-y-6 md:space-y-8 p-3 sm:p-5 md:p-6 lg:p-8">

            {/* HEADER */}
            <div className="text-center mx-auto max-w-[450px]">
              <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                Aadhar Verification
              </h1>
              <p className="text-gray-600 text-xs sm:text-sm md:text-base">
                Connect Your DigiLocker For Instant Document Verification
              </p>
            </div>

            {/* DIGILOCKER BOX */}
            <div className="
              bg-gradient-to-br from-green-50 to-emerald-50 
              border-2 border-dashed border-gray-400 
              rounded-xl
              sm:rounded-2xl
              p-4 sm:p-6 md:p-8 
              mx-auto 
              w-full 
              max-w-[450px]
            ">
              <div className="flex items-start gap-3 sm:gap-4">
                <img
                  src="/img/Digilocker1.png"
                  alt="DigiLocker"
                  className="h-16 sm:h-20 md:h-24 w-auto flex-shrink-0"
                />
                <div>
                  <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-900 mb-1">
                    Aadhar Via DigiLocker
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Fetch Aadhaar Document Securely From DigiLocker
                  </p>
                </div>
              </div>

              {/* BUTTONS */}
              <div className="flex gap-2 sm:gap-4 md:gap-6 mt-4 sm:mt-6">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="
                    flex-1 px-3 sm:px-4 md:px-6 py-2 
                    h-10 sm:h-12 md:h-[52px]
                    text-xs sm:text-sm md:text-base lg:text-lg
                    rounded-xl
                    sm:rounded-2xl 
                    border-2 border-[#1B1717] border-opacity-80 
                    text-gray-700 
                    font-medium 
                    hover:bg-gray-100 
                    transition
                  "
                >
                  Download
                </button>

                <button
                  type="button"
                  onClick={handleVerify}
                  className={`
                    flex-1 px-3 sm:px-4 md:px-6 py-2 
                    h-10 sm:h-12 md:h-[52px]
                    text-xs sm:text-sm md:text-base lg:text-lg
                    rounded-xl
                    sm:rounded-2xl 
                    font-medium 
                    transition 
                    text-white 
                    ${
                      isVerified
                        ? "bg-green-600 cursor-not-allowed"
                        : "bg-[#039155] hover:bg-green-700"
                    }
                  `}
                >
                  {isVerified ? "Verified ✓" : "Verify"}
                </button>
              </div>
            </div>

            {/* INFO BOX */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 flex items-start gap-2 sm:gap-3 mx-auto max-w-[450px]">
              <svg
                className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h4 className="font-semibold text-blue-900 text-xs sm:text-sm mb-0.5 sm:mb-1">
                  Secure Document Verification
                </h4>
                <p className="text-xs text-blue-800">
                  Documents are fetched directly from DigiLocker using secure APIs.
                </p>
              </div>
            </div>

            {/* NEXT BUTTON */}
            <button
              type="button"
              onClick={() => setShowImageUpload(true)}
              disabled={!isVerified}
              className={`
                w-full 
                py-2.5 sm:py-3 md:py-3.5
                text-center 
                rounded-lg 
                font-semibold 
                text-white 
                text-sm sm:text-base md:text-lg
                max-w-[450px] 
                mx-auto 
                shadow-md
                transition
                lg:ml-[120px]
                bg-[#039155]
                ${
                  isVerified
                    ? "hover:bg-green-700 opacity-100"
                    : "opacity-50 cursor-not-allowed"
                }
              `}
            >
              Next
            </button>
          </div>
        ) : (
          /* =================== STEP 2 - IMAGE UPLOAD =================== */
          <div className="space-y-4 sm:space-y-6 p-3 sm:p-5 md:p-6 lg:p-8">
            {/* HEADER */}
            <div className="text-center mx-auto max-w-[450px]">
              <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                Aadhar Verification
              </h1>
              <p className="text-gray-600 text-xs sm:text-sm md:text-base">
                Connect Your DigiLocker For Instant Document Verification
              </p>
            </div>

            {/* FRONT IMAGE */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 mx-auto w-full max-w-[450px]">
              <div className="flex flex-col items-center gap-3 sm:gap-4">
                <img
                  src="/img/aadhaar-front.png"
                  alt="Front Aadhaar"
                  className="h-12 sm:h-16 md:h-20 w-auto"
                />
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 text-center">
                  Add Aadhaar Image Front
                </h3>

                <label className="w-full text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange("front", e)}
                    className="hidden"
                  />
                  <span className="
                    inline-block 
                    px-3 sm:px-4 py-2 
                    bg-blue-500 
                    text-white 
                    rounded-lg 
                    cursor-pointer 
                    hover:bg-blue-600 
                    font-medium
                    text-xs sm:text-sm md:text-base
                  ">
                    Select From The Browser
                  </span>
                </label>

                <p className="text-xs text-gray-500">File Size (Max 5 MB)</p>
              </div>
            </div>

            {/* BACK IMAGE */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 mx-auto w-full max-w-[450px]">
              <div className="flex flex-col items-center gap-3 sm:gap-4">
                <img
                  src="/img/aadhaar-back.png"
                  alt="Back Aadhaar"
                  className="h-12 sm:h-16 md:h-20 w-auto"
                />
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 text-center">
                  Add Aadhaar Image Back
                </h3>

                <label className="w-full text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange("back", e)}
                    className="hidden"
                  />
                  <span className="
                    inline-block 
                    px-3 sm:px-4 py-2 
                    bg-blue-500 
                    text-white 
                    rounded-lg 
                    cursor-pointer 
                    hover:bg-blue-600 
                    font-medium
                    text-xs sm:text-sm md:text-base
                  ">
                    Select From The Browser
                  </span>
                </label>

                <p className="text-xs text-gray-500">File Size (Max 5 MB)</p>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="button"
              onClick={handleSubmitImages}
              disabled={!frontImage || !backImage}
              className={`
                w-full 
                py-2.5 sm:py-3 md:py-3.5
                rounded-lg 
                font-semibold 
                text-white 
                text-sm sm:text-base md:text-lg
                max-w-[450px] 
                mx-auto 
                shadow-md
                transition
                ${
                  frontImage && backImage
                    ? "bg-[#039155] hover:bg-green-700"
                    : "bg-gray-400 cursor-not-allowed"
                }
              `}
            >
              Submit
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default RetailerAadhaar;
