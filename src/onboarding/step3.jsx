import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  aadhaarConnection,
  aadhaarDownload,
  uploadAadhaarDocuments,
} from "../redux/action/onboardingAction";
import { UPLOAD_AADHAAR_SUCCESS } from "../redux/actionType/onboardingActionType";

function Step3({ setFormData, onNext, onRefreshSteps }) {
  const dispatch = useDispatch();

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
    (state) => state?.onboarding?.aadhaarVerify?.aadhaarVerify?.status
  );

  const url = useSelector(
    (state) => state?.onboarding?.aadhaarVerify?.aadhaarVerify?.url
  );

  const verification_id = useSelector(
    (state) => state?.onboarding?.aadhaarVerify?.aadhaarVerify?.verification_id
  );

  const reference_id = useSelector(
    (state) => state?.onboarding?.aadhaarVerify?.aadhaarVerify?.reference_id
  );

  const document_type = useSelector(
    (state) =>
      state?.onboarding?.aadhaarVerify?.aadhaarVerify?.document_requested?.[0]
  );
  
  const steps = useSelector(
    (state) => state?.onboarding?.steps
  );
  
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
      timer = setTimeout(() => {
        setShowTickMark(false);
        setIsVerified(false);
      }, 3 * 60 * 1000); // 3 minutes = 180000 milliseconds
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
    const token = localStorage.getItem("onboardingToken");

    try {
      await dispatch(aadhaarConnection(token));
      setIsVerified(true);
      setShowTickMark(true); // Show tick mark for 3 minutes
      setFormData((d) => ({
        ...d,
        aadhaarDocFetched: true,
        digilockerLinked: true,
      }));
    } catch (error) {
      console.error("Verification failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    // Only allow download if verification is done
    if (!isConnectDone) {
      console.error("Please verify Aadhaar first!");
      return;
    }

    const token = localStorage.getItem("onboardingToken");

    const payload = {
      document_type: "AADHAAR"
    };

    console.log("Dispatching Aadhaar Download:", payload);

    dispatch(aadhaarDownload(payload, token));
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
    (state) => state?.onboarding?.uploadAadhaarResponse
  );
  const uploadError = useSelector(
    (state) => state?.onboarding?.uploadAadhaarError
  );
  const isLoading = useSelector(
    (state) => state?.onboarding?.loading
  );

  const handleSubmitImages = async () => {
    if (!frontImage || !backImage) {
      return;
    }

    const token = localStorage.getItem("onboardingToken");
    if (!token) {
      return;
    }

    setUploading(true);
    try {
      await dispatch(uploadAadhaarDocuments(frontImage, backImage, token));
    } catch (error) {
      console.error("Failed to upload Aadhaar documents:", error);
      setUploading(false);
    }
  };

  // Watch for successful upload and proceed to next step
  useEffect(() => {
    if (uploadResponse) {
      const status = uploadResponse?.status || uploadResponse?.uploadResponse?.status;
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
        if (typeof uploadError === 'string') {
          errorMsg = uploadError;
        } else if (uploadError?.message) {
          errorMsg = uploadError.message;
        } else if (uploadError?.payload) {
          if (typeof uploadError.payload === 'string') {
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
    <div className="w-full flex justify-center py-6">
      <div className="w-[450px] space-y-8">
        {/* ================================================================= */}
        {/*                      DIGILOCKER VERIFICATION VIEW                 */}
        {/* ================================================================= */}
        {!showImageUpload && (
          <>
            {/* Header */}
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Aadhar Verification
              </h1>
              <p className="text-gray-600 mt-1">
                Connect Your DigiLocker For Instant Document Verification
              </p>
            </div>

            {/* DigiLocker Box */}
            <div
              className="bg-gradient-to-br from-green-50 to-emerald-50 
              border-2 border-dashed border-gray-400 rounded-2xl p-8"
            >
              <div className="flex items-start gap-4">
                <img
                  src="/img/Digilocker1.png"
                  className="h-24"
                  alt="Digilocker"
                />

                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Aadhar Via DigiLocker
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Fetch Aadhaar Document Securely From DigiLocker
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-6 mt-6">
                <button
                  onClick={handleDownload}
                  disabled={!isConnectDone || isDownloadDone}
                  className={`flex-1 h-[52px] text-lg rounded-xl border-2 border-black/60 
                    font-medium transition
                    ${
                      !isConnectDone || isDownloadDone
                        ? "text-gray-400 cursor-not-allowed border-gray-300"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  {isDownloadDone ? "Downloaded" : "Download"}
                </button>

                <button
                  onClick={handleVerify}
                  disabled={loading || (isConnectDone && showTickMark)}
                  className={`flex-1 h-[52px] text-lg rounded-xl text-white font-medium transition 
                    ${
                      isConnectDone && showTickMark
                        ? "bg-green-600 cursor-not-allowed"
                        : loading
                        ? "bg-[#039155] opacity-75 cursor-not-allowed"
                        : "bg-[#039155] hover:bg-green-700"
                    }`}
                >
                  {loading
                    ? "Verifying..."
                    : isConnectDone && showTickMark
                    ? "Verified ✓"
                    : "Verify"}
                </button>
              </div>
            </div>

            {/* Information Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
              <svg
                className="h-5 w-5 text-blue-600 mt-1"
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
                <h4 className="font-semibold text-blue-900 text-sm">
                  Secure Document Verification
                </h4>
                <p className="text-xs text-blue-800">
                  Documents are fetched directly from DigiLocker using secure
                  APIs.
                </p>
              </div>
            </div>

            {/* NEXT */}
            <button
              onClick={() => setShowImageUpload(true)}
              className="w-full py-3 rounded-xl bg-[#039155] text-white 
                font-semibold text-lg"
            >
              Next
            </button>
          </>
        )}

        {/* ================================================================= */}
        {/*                          IMAGE UPLOAD VIEW                       */}
        {/* ================================================================= */}
        {showImageUpload && (
          <>
            {/* Header */}
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Aadhar Verification
              </h1>
              <p className="text-gray-600 mt-1">
                Connect Your DigiLocker For Instant Document Verification
              </p>
            </div>

            {/* Aadhaar Front */}
            <div 
              className="border-2 border-dashed border-gray-300 rounded-2xl p-8 flex items-center justify-center w-[419px] h-[200px] relative overflow-hidden"
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
                <div className="flex flex-col items-center justify-center w-[160px] h-[146px] gap-4">
                  <img
                    src="/img/aadhaar-front.png"
                    alt="Aadhaar Front"
                    className="w-[120px] h-[75px] object-contain"
                  />

                  <h3 
                    className="capitalize font-['Gilroy-Medium'] font-normal text-[13px] w-[160px] h-[11px] text-center leading-[100%] tracking-[0%] align-middle"
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
                      className="bg-[#C5DBFF] text-gray-900 cursor-pointer hover:bg-[#B0CFFF] transition inline-flex items-center justify-center w-[137px] h-[22px] rounded-[4px] text-[12px]"
                    >
                      Select From Browser
                    </span>
                  </label>

                  <p 
                    className="capitalize font-['Gilroy-Regular'] font-normal text-[10px] leading-[100%] tracking-[0%] align-middle text-[#6B7280]"
                  >
                    File Size (Max 5 MB)
                  </p>
                </div>
              )}
            </div>

            {/* Aadhaar Back */}
            <div 
              className="border-2 border-dashed border-gray-300 rounded-2xl p-8 flex items-center justify-center w-[419px] h-[200px] relative overflow-hidden"
            >
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
                <div className="flex flex-col items-center justify-center w-[160px] h-[146px] gap-4">
                  <img
                    src="/img/aadhaar-back.png"
                    alt="Aadhaar Back"
                    className="w-[120px] h-[75px] object-contain"
                  />

                  <h3 
                    className="capitalize font-['Gilroy-Medium'] font-normal text-[13px] w-[160px] h-[11px] text-center leading-[100%] tracking-[0%] align-middle"
                  >
                    Add Aadhaar Image Back
                  </h3>

                  <label>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageChange("back", e)}
                    />
                    <span
                      className="bg-[#C5DBFF] text-gray-900 cursor-pointer hover:bg-[#B0CFFF] transition inline-flex items-center justify-center w-[137px] h-[22px] rounded-[4px] text-[12px]"
                    >
                      Select From Browser
                    </span>
                  </label>

                  <p 
                    className="capitalize font-['Gilroy-Regular'] font-normal text-[10px] leading-[100%] tracking-[0%] align-middle text-[#6B7280]"
                  >
                    File Size (Max 5 MB)
                  </p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitImages}
              disabled={!frontImage || !backImage || uploading}
              className={`w-[419px] py-3 rounded-xl font-semibold text-lg transition
                ${
                  frontImage && backImage && !uploading
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
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Auto Verifying
                    </h3>
                    <p className="text-gray-600 text-sm">
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
                  <p className="flex-1 text-sm font-medium">{errorMessage}</p>
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
          </>
        )}
      </div>
    </div>
  );
}

export default Step3;
