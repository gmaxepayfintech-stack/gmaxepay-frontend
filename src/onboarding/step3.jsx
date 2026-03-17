import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  aadhaarConnection,
  aadhaarDownload,
  uploadAadhaarDocuments,
} from "../redux/action/onboardingAction";
import { UPLOAD_AADHAAR_SUCCESS } from "../redux/actionType/onboardingActionType";
import { useNotification } from "../context/NotificationContext";

function Step3({ setFormData, onNext, onRefreshSteps }) {
  const dispatch = useDispatch();
  const { error: notifyError, success: notifySuccess } = useNotification();

  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showTickMark, setShowTickMark] = useState(false);

  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [frontImagePreview, setFrontImagePreview] = useState(null);
  const [backImagePreview, setBackImagePreview] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Redux selectors
  const digilockerSuccess = useSelector(
    (state) => state?.onboarding?.aadhaarVerify?.aadhaarVerify?.status,
  );

  const url = useSelector(
    (state) => state?.onboarding?.aadhaarVerify?.aadhaarVerify?.url,
  );

  const verification_id = useSelector(
    (state) => state?.onboarding?.aadhaarVerify?.aadhaarVerify?.verification_id,
  );

  const reference_id = useSelector(
    (state) => state?.onboarding?.aadhaarVerify?.aadhaarVerify?.reference_id,
  );

  const document_type = useSelector(
    (state) =>
      state?.onboarding?.aadhaarVerify?.aadhaarVerify?.document_requested?.[0],
  );

  const steps = useSelector((state) => state?.onboarding?.steps);

  // Get aadharVerification step and check if connect (verify) is done
  const aadharStep = steps?.find((step) => step.key === "aadharVerification");
  const isConnectDone = aadharStep?.subSteps?.[0]?.done === true;
  const isDownloadDone = aadharStep?.subSteps?.[1]?.done === true;

  // Sync local state with steps data and show tick mark when verified
  useEffect(() => {
    if (isConnectDone) {
      setIsVerified(true);
      setShowTickMark(true); // Show tick mark when verification is done
    }
  }, [isConnectDone]);

  // Timer to reset tick mark after 3 minutes
  useEffect(() => {
    let timer;
    if (showTickMark) {
      timer = setTimeout(
        () => {
          setShowTickMark(false);
          setIsVerified(false);
        },
        3 * 60 * 1000,
      ); // 3 minutes = 180000 milliseconds
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [showTickMark]);

  // 🔥 OPEN DIGILOCKER URL WHEN SUCCESS
  useEffect(() => {
    if (digilockerSuccess === "Success" && url) {
      window.location.href = url;
    }
  }, [digilockerSuccess, url]);

  const handleVerify = async () => {
    setLoading(true);

    try {
      const res = await dispatch(aadhaarConnection());
      if (res?.status === "SUCCESS") {
        setIsVerified(true);
        setShowTickMark(true); // Show tick mark for 3 minutes
        setFormData((d) => ({
          ...d,
          aadhaarDocFetched: true,
          digilockerLinked: true,
        }));
        notifySuccess(res?.message || "Connected to DigiLocker successfully");
      } else {
        notifyError(res?.message || "Verification failed");
      }
    } catch (error) {
      console.error("Verification failed:", error);
      notifyError("Verification failed due to an error");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    // Only allow download if verification is done
    if (!isConnectDone) {
      notifyError("Please verify Aadhaar first!");
      return;
    }
    const payload = {
      document_type: "AADHAAR",
    };

    const res = await dispatch(aadhaarDownload(payload));
    if (res?.status === "SUCCESS") {
      notifySuccess(res?.message || "Aadhaar verified successfully");
      setTimeout(() => {
        if (onRefreshSteps) {
          onRefreshSteps();
        }
      }, 1000);
    } else {
      notifyError(res?.message || "Aadhaar verification failed");
      if (res?.status === "FAILURE") {
        setTimeout(() => {
          if (onRefreshSteps) {
            onRefreshSteps();
          }
        }, 1000);
      }
    }
  };

  const handleImageChange = (type, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);

    if (type === "front") {
      // Clean up previous preview if exists
      if (frontImagePreview) {
        URL.revokeObjectURL(frontImagePreview);
      }
      setFrontImage(file);
      setFrontImagePreview(previewUrl);
    } else {
      // Clean up previous preview if exists
      if (backImagePreview) {
        URL.revokeObjectURL(backImagePreview);
      }
      setBackImage(file);
      setBackImagePreview(previewUrl);
    }
  };

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      if (frontImagePreview) {
        URL.revokeObjectURL(frontImagePreview);
      }
      if (backImagePreview) {
        URL.revokeObjectURL(backImagePreview);
      }
    };
  }, [frontImagePreview, backImagePreview]);

  const handleDeleteImage = (type) => {
    if (type === "front") {
      if (frontImagePreview) {
        URL.revokeObjectURL(frontImagePreview);
      }
      setFrontImage(null);
      setFrontImagePreview(null);
    } else {
      if (backImagePreview) {
        URL.revokeObjectURL(backImagePreview);
      }
      setBackImage(null);
      setBackImagePreview(null);
    }
  };

  // Get upload response and loading state from Redux
  const uploadResponse = useSelector(
    (state) => state?.onboarding?.uploadAadhaarResponse,
  );
  const uploadError = useSelector(
    (state) => state?.onboarding?.uploadAadhaarError,
  );
  const isLoading = useSelector((state) => state?.onboarding?.loading);

  const handleSubmitImages = async () => {
    if (!frontImage || !backImage) {
      notifyError("Please upload both front and back images");
      return;
    }

    setUploading(true);
    try {
      const res = await dispatch(uploadAadhaarDocuments(frontImage, backImage));
      if (res?.status === "SUCCESS") {
        notifySuccess(res?.message || "Documents uploaded successfully");
      } else {
        notifyError(res?.message || "Failed to upload Aadhaar documents");
        setUploading(false);
      }
    } catch (error) {
      console.error("Failed to upload Aadhaar documents:", error);
      notifyError("Failed to upload Aadhaar documents");
      setUploading(false);
    }
  };

  // Watch for successful upload and proceed to next step
  useEffect(() => {
    if (uploadResponse) {
      const status =
        uploadResponse?.status || uploadResponse?.uploadResponse?.status;
      if (status === "SUCCESS") {
        setUploading(false);
        // Refresh steps after successful completion
        if (onRefreshSteps) {
          onRefreshSteps();
        }
        // Small delay to show success state before moving to next step
        setTimeout(() => {
          onNext();
        }, 1000);
      }
    }
  }, [uploadResponse, onNext, onRefreshSteps]);

  // Reset uploading state when loading completes and handle errors
  useEffect(() => {
    if (!isLoading && uploading) {
      // If loading finished but no success response, keep uploading state
      // until we get a response
      if (uploadError) {
        setUploading(false);
        // Extract error message - handle different error structures
        let errorMsg = null;
        if (typeof uploadError === "string") {
          errorMsg = uploadError;
        } else if (uploadError?.message) {
          errorMsg = uploadError.message;
        } else if (uploadError?.payload) {
          if (typeof uploadError.payload === "string") {
            errorMsg = uploadError.payload;
          } else if (uploadError.payload?.message) {
            errorMsg = uploadError.payload.message;
          }
        }

        if (errorMsg) {
          setErrorMessage(errorMsg);
          // Auto-hide error after 5 seconds
          setTimeout(() => {
            setErrorMessage(null);
          }, 5000);
        }
      }
    }
  }, [isLoading, uploading, uploadError]);

  // Clear error when user starts new upload
  useEffect(() => {
    if (uploading) {
      setErrorMessage(null);
    }
  }, [uploading]);

  return (
    <div className="w-full h-full flex justify-center items-center p-2 sm:p-3 md:p-4 overflow-hidden">
      <div className="w-full max-w-[98%] sm:max-w-[480px] md:max-w-[520px] lg:max-w-[580px] xl:max-w-[600px] 2xl:max-w-[700px]  mx-auto">
        {/* ================================================================= */}
        {/*                      DIGILOCKER VERIFICATION VIEW                 */}
        {/* ================================================================= */}
        {!showImageUpload && (
          <>
            {/* Header */}
            <div className="text-center mb-7">
              <h1 className="text-base sm:text-lg  font-[Gilroy-Semibold] text-[#1B1717]">
                Aadhaar Verification
              </h1>
              <p className="text-xs sm:text-xs md:text-sm  font-[Gilroy-Medium] text-[#1B1717]/80 mt-2 max-w-[90%] mx-auto">
                Connect Your DigiLocker For Instant Document Verification
              </p>
            </div>

            {/* DigiLocker Box */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-dashed border-gray-400 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-4 lg:p-5 xl:p-6">
              <div className="flex items-start gap-3">
                <img
                  src="/img/Digilocker1.png"
                  alt="DigiLocker"
                  className="h-8 sm:h-10 md:h-11 lg:h-12 xl:h-14 flex-shrink-0"
                />
                <div>
                  <h3 className="text-sm sm:text-base  font-[Gilroy-Medium] text-[#1B1717]">
                    Aadhaar Via DigiLocker
                  </h3>
                  <p className="text-xs sm:text-sm font-[Gilroy-Regular] text-[#1B1717]/80 mt-2">
                    Fetch Aadhaar Document Securely From DigiLocker
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 sm:gap-3 mt-3">
                <button
                  onClick={handleVerify}
                  disabled={loading || (isConnectDone && showTickMark)}
                  className={`flex-1 h-10 sm:h-11 md:h-12 lg:h-14 rounded-lg sm:rounded-xl font-[Gilroy-Semibold] text-sm md:text-base transition shadow-md 
                    ${isConnectDone && showTickMark
                      ? "bg-green-600 text-white cursor-not-allowed"
                      : loading
                        ? "bg-[#039155] text-white opacity-75 cursor-not-allowed"
                        : "bg-[#039155] text-white hover:bg-green-700"
                    }`}
                >
                  {loading
                    ? "Connecting..."
                    : isConnectDone && showTickMark
                      ? "Connected ✓"
                      : "Connect"}
                </button>
                <button
                  onClick={handleDownload}
                  disabled={!isConnectDone || isDownloadDone}
                  className={`flex-1 h-10 sm:h-11 md:h-12 lg:h-14 rounded-lg sm:rounded-xl font-[Gilroy-Semibold] text-sm md:text-base border transition shadow-md 

                    ${!isConnectDone || isDownloadDone
                      ? "text-gray-400 cursor-not-allowed border-gray-300"
                      : "border-gray-300 text-[#1B1717] hover:bg-gray-50"
                    }`}
                >
                  {isDownloadDone ? "Verified" : "Verify"}
                </button>
              </div>
            </div>

            {/* Information Box */}
            <div className="bg-[#EAF5FF] border border-[#08378D] rounded-lg p-4 flex gap-3 mt-4 mb-7">
              <svg
                className="h-5 w-5 text-[#0059FF] mt-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 
                  0116 0zm-7-4a1 1 0 11-2 0 
                  1 1 0 012 0zM9 9a1 1 0 
                  000 2v3a1 1 0 001 1h1a1 1 0 
                  100-2v-3a1 1 0 
                  00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>

              <div>
                <h4 className="font-[Gilroy-Semibold] text-[#08378D] text-xs">
                  Secure Document Verification
                </h4>
                <p className="text-xs text-[#0059FF] font-[Gilroy-Regular]">
                  Documents are fetched directly from DigiLocker using secure
                  APIs.
                </p>
              </div>
            </div>

            {/* NEXT */}
            <button
              onClick={() => setShowImageUpload(true)}
              disabled={!isConnectDone || !isDownloadDone}
              className={`w-full h-10 sm:h-11 md:h-12 lg:h-14 rounded-lg sm:rounded-xl font-[Gilroy-Semibold] text-sm md:text-base transition shadow-lg 
                ${!isConnectDone || !isDownloadDone
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-[#039155] text-white hover:bg-green-700"
                }`}
            >
              Next
            </button>
          </>
        )}

        {/* ================================================================= */}
        {/*                          IMAGE UPLOAD VIEW                       */}
        {/* ================================================================= */}
        {showImageUpload && (
          <div className="space-y-3 md:space-y-4">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-base sm:text-sm md:text-lg font-[Gilroy-Semibold] text-[#1B1717]">
                Aadhar Verification
              </h1>
              <p className="text-xs sm:text-xs md:text-sm  font-[Gilroy-Medium] text-[#1B1717]/70 mt-2 mb-6 max-w-[90%] mx-auto">
                Connect Your DigiLocker For Instant Document Verification
              </p>
            </div>

            {/* Aadhaar Front */}
            <div
              className="border-2 border-dashed border-gray-300
      rounded-lg sm:rounded-xl md:rounded-2xl
      p-2.5 sm:p-3
      w-full h-[150px] sm:h-[170px] md:h-[180px] lg:h-[190px] xl:h-[195px]
      flex items-center justify-center relative overflow-hidden"
            >
              {frontImagePreview ? (
                <>
                  <img
                    src={frontImagePreview}
                    alt="Aadhaar Front Preview"
                    className="w-full h-full object-contain absolute inset-0 p-2"
                  />
                  <button
                    onClick={() => handleDeleteImage("front")}
                    className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition shadow-lg"
                    type="button"
                    aria-label="Delete image"
                  >
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center  gap-0.5 sm:gap-1">
                  <img
                    src="/img/aadhaar-front.png"
                    alt="Aadhaar Front"
                    className="w-[85px] h-[50px]
              sm:w-[95px] sm:h-[55px]
              md:w-[105px] md:h-[60px]
              lg:w-[115px] lg:h-[65px]
              xl:w-[120px] xl:h-[68px]
              object-contain"
                  />

                  <h3
                    className="capitalize font-['Gilroy-Medium']
            text-[9px] sm:text-[10px] md:text-[11px]
            lg:text-xs xl:text-sm text-center text-[#1B1717]/80"
                  >
                    Add Aadhaar Image Front
                  </h3>

                  <label>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageChange("front", e)}
                    />
                    <span
                      className="bg-[#C5DBFF] text-gray-900
              cursor-pointer hover:bg-[#B0CFFF]
              active:scale-95 transition-all
              inline-flex items-center justify-center
              px-2.5 sm:px-3 md:px-3.5
              py-0.5 sm:py-1
              min-w-[100px] sm:min-w-[110px] md:min-w-[120px]
              rounded-lg sm:rounded-xl
              text-[8px] sm:text-[9px] md:text-[10px]
              lg:text-xs  font-[Gilroy-Regular]"
                    >
                      Select From Browser
                    </span>
                  </label>

                  <p
                    className="text-[7px] sm:text-[8px] md:text-[9px]
            lg:text-[10px]  text-[#1B1717]/80 font-[Gilroy-Regular]"
                  >
                    File Size (Max 5 MB)
                  </p>
                </div>
              )}
            </div>

            {/* Aadhaar Back */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg sm:rounded-xl md:rounded-2xl p-2.5 sm:p-2.5 md:p-3 lg:p-3 xl:p-3 mx-auto w-full h-[150px] sm:h-[170px] md:h-[180px] lg:h-[190px] xl:h-[195px] flex items-center justify-center relative overflow-hidden">
              {backImagePreview ? (
                <>
                  <img
                    src={backImagePreview}
                    alt="Aadhaar Back Preview"
                    className="w-full h-full object-contain absolute inset-0 p-2"
                  />
                  <button
                    onClick={() => handleDeleteImage("back")}
                    className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition shadow-lg"
                    type="button"
                    aria-label="Delete image"
                  >
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 md:gap-1 lg:gap-1.5 xl:gap-1">
                  <img
                    src="/img/aadhaar-back.png"
                    alt="Aadhaar Back"
                    className="w-[85px] h-[50px] sm:w-[95px] sm:h-[55px] md:w-[105px] md:h-[60px] lg:w-[115px] lg:h-[65px] xl:w-[120px] xl:h-[68px] object-contain"
                  />

                  <h3 className="capitalize font-['Gilroy-Medium'] text-[#1B1717]/80 text-[9px] sm:text-[10px] md:text-[11px] lg:text-xs xl:text-sm text-center leading-[100%] tracking-[0%] align-middle">
                    Add Aadhaar Image Back
                  </h3>

                  <label>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageChange("back", e)}
                    />
                    <span className="bg-[#C5DBFF] text-[#1B1717] cursor-pointer hover:bg-[#B0CFFF] active:scale-95 transition-all inline-flex items-center justify-center px-2.5 sm:px-3 md:px-3 lg:px-3.5 xl:px-4 py-0.5 sm:py-1 md:py-1 lg:py-1.5 xl:py-1 min-w-[100px] sm:min-w-[110px] md:min-w-[120px] lg:min-w-[130px] xl:min-w-[140px] h-auto min-h-[24px] sm:min-h-[26px] md:min-h-[28px] lg:min-h-[30px] xl:min-h-[30px] rounded-lg sm:rounded-xl text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs  font-[Gilroy-Regular]">
                      Select From Browser
                    </span>
                  </label>

                  <p className="capitalize font-['Gilroy-Regular'] font-normal text-[7px] sm:text-[8px] md:text-[9px] lg:text-[10px]  leading-[100%] tracking-[0%] align-middle text-[#1B1717]/80">
                    File Size (Max 5 MB)
                  </p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitImages}
              disabled={!frontImage || !backImage || uploading}
              className={`w-full
        h-9 sm:h-10 md:h-10 lg:h-11 xl:h-12
        rounded-lg sm:rounded-xl 
        font-[Gilroy-Semibold]
        text-sm sm:text-sm md:text-sm lg:text-sm xl:text-base
        shadow-md transition-all
        flex items-center justify-center                ${frontImage && backImage && !uploading
                  ? "bg-[#039155] text-white hover:bg-green-700"
                  : "bg-gray-400 text-white cursor-not-allowed"
                }`}
            >
              {uploading ? "Uploading..." : "Submit"}
            </button>

            {/* Auto Verification Loader Overlay */}
            {uploading && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-8 max-w-md mx-4 flex flex-col items-center gap-6">
                  {/* Animated Spinner */}
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-[#039155] border-t-transparent rounded-full animate-spin"></div>
                  </div>

                  {/* Verification Message */}
                  <div className="text-center">
                    <h3 className="text-xl font-[Gilroy-Semibold] text-[#1B1717] mb-2">
                      Auto Verifying
                    </h3>
                    <p className="text-[#1B1717]/80 text-sm">
                      We are auto verifying your Aadhaar details based on eKYC
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Snackbar */}
            {errorMessage && (
              <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-slide-up">
                <div className="bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg max-w-md flex items-center gap-4">
                  <svg
                    className="w-6 h-6 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="flex-1 text-sm font-[Gilroy-Medium]">{errorMessage}</p>
                  <button
                    onClick={() => setErrorMessage(null)}
                    className="flex-shrink-0 hover:bg-red-600 rounded p-1 transition"
                    aria-label="Close error"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Step3;
