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
    <div className="w-full flex justify-center items-center px-4 py-6">
      <div className="w-full max-w-[750px]">

        {/* =================== STEP 1 =================== */}
        {!showImageUpload ? (
          <div className="space-y-8 p-4 sm:p-6 md:p-8">

            {/* HEADER */}
            <div className="text-center mx-auto max-w-[450px]">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Aadhar Verification
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Connect Your DigiLocker For Instant Document Verification
              </p>
            </div>

            {/* DIGILOCKER BOX */}
            <div className="
              bg-gradient-to-br from-green-50 to-emerald-50 
              border-2 border-dashed border-gray-400 
              rounded-2xl 
              p-6 sm:p-8 
              mx-auto 
              w-full 
              max-w-[450px]
            ">
              <div className="flex items-start gap-4">
                <img
                  src="/img/Digilocker1.png"
                  alt="DigiLocker"
                  className="h-20 sm:h-24 w-auto"
                />
                <div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1">
                    Aadhar Via DigiLocker
                  </h3>
                  <p className="text-sm text-gray-600">
                    Fetch Aadhaar Document Securely From DigiLocker
                  </p>
                </div>
              </div>

              {/* BUTTONS */}
              <div className="flex gap-4 sm:gap-6 mt-6">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="
                    flex-1 px-6 py-2 
                    h-[48px] sm:h-[52px]
                    text-base sm:text-lg
                    rounded-2xl 
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
                    flex-1 px-6 py-2 
                    h-[48px] sm:h-[52px]
                    text-base sm:text-lg 
                    rounded-2xl 
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3 mx-auto max-w-[450px]">
              <svg
                className="h-5 w-5 text-blue-600"
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
                <h4 className="font-semibold text-blue-900 text-sm mb-1">
                  Secure Document Verification
                </h4>
                <p className="text-xs sm:text-sm text-blue-800">
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
                py-3 
                text-center 
                rounded-lg 
                font-semibold 
                text-white 
                text-lg 
                max-w-[450px] 
                mx-auto 
                ${
                  isVerified
                    ? "bg-[#039155] hover:bg-green-700"
                    : "bg-gray-400 cursor-not-allowed"
                }
              `}
            >
              Next
            </button>
          </div>
        ) : (
          /* =================== STEP 2 - IMAGE UPLOAD =================== */
          <div className="space-y-6 p-4 sm:p-6 md:p-8">
            {/* HEADER */}
            <div className="text-center mx-auto max-w-[450px]">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Aadhar Verification
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Connect Your DigiLocker For Instant Document Verification
              </p>
            </div>

            {/* FRONT IMAGE */}
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 sm:p-8 mx-auto w-full max-w-[450px]">
              <div className="flex flex-col items-center gap-4">
                <img
                  src="/img/aadhaar-front.png"
                  alt="Front Aadhaar"
                  className="h-16 sm:h-20 w-auto"
                />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
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
                    px-4 py-2 
                    bg-blue-500 
                    text-white 
                    rounded-lg 
                    cursor-pointer 
                    hover:bg-blue-600 
                    font-medium
                  ">
                    Select From The Browser
                  </span>
                </label>

                <p className="text-xs text-gray-500">File Size (Max 5 MB)</p>
              </div>
            </div>

            {/* BACK IMAGE */}
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 sm:p-8 mx-auto w-full max-w-[450px]">
              <div className="flex flex-col items-center gap-4">
                <img
                  src="/img/aadhaar-back.png"
                  alt="Back Aadhaar"
                  className="h-16 sm:h-20 w-auto"
                />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
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
                    px-4 py-2 
                    bg-blue-500 
                    text-white 
                    rounded-lg 
                    cursor-pointer 
                    hover:bg-blue-600 
                    font-medium
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
                py-3 
                rounded-lg 
                font-semibold 
                text-white 
                text-lg 
                max-w-[450px] 
                mx-auto 
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
