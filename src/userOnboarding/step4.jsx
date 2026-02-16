import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useCompany } from "./../context/CompanyContext";
import { useSelector, useDispatch } from "react-redux";
import secureLocalStorage from "react-secure-storage";
import { useNotification } from "../context/NotificationContext";
import {
  connectPanVerification,
  downloadPanDocument,
  uploadPanDocument,
} from "../redux/action/retailerOnboardingAction";
import { HiArrowLeft } from "react-icons/hi2";

function RetailerPan({ setFormData, onNext, onBack, onShowSteps }) {
  const { referCode: urlReferralCode } = useParams();
  const dispatch = useDispatch();
  const { company } = useCompany();
  const { showNotification } = useNotification();
  const companyFromRedux = useSelector((state) => state?.company?.company);
  const companyData = companyFromRedux || company;
  const retailerOnboardingState = useSelector(
    (state) => state?.retailerOnboarding,
  );

  const [isVerified, setIsVerified] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [panImage, setPanImage] = useState(null);
  const [panImagePreview, setPanImagePreview] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Check for pan connection status on mount and validate token
  useEffect(() => {
    try {
      const movePan = localStorage.getItem("movePan");
      const panConnected = localStorage.getItem("panConnected");
      const redirectToPan = sessionStorage.getItem("redirectToPan");

      if (
        movePan === "true" ||
        panConnected === "true" ||
        redirectToPan === "true"
      ) {
        setIsVerified(true);
        if (redirectToPan === "true") {
          sessionStorage.removeItem("redirectToPan");
        }
      }

      // Validate token exists on mount
      const token = getToken();
      if (!token) {
        console.warn(
          "Step4: Token not found on mount. User may need to complete mobile verification first.",
        );
        showNotification({
          type: "warning",
          message:
            "Please complete mobile verification first to continue with PAN verification.",
        });
      } else {
        console.log("Step4: Token validated successfully on mount");
      }
    } catch (e) {
      console.error("Error checking pan connection status:", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get token from secureLocalStorage or Redux state
  const getToken = () => {
    try {
      // First try secureLocalStorage
      const tokenFromStorage = secureLocalStorage.getItem("onboardingToken");
      if (tokenFromStorage) {
        console.log("Token found in secureLocalStorage");
        return tokenFromStorage;
      }

      // Fallback: Check Redux state for token from mobile verification
      const tokenFromRedux =
        retailerOnboardingState?.OTPResponse?.OTPResponse?.userToken ||
        retailerOnboardingState?.OTPSubmitResponse?.OTPResponse?.userToken;

      if (tokenFromRedux) {
        console.log(
          "Token found in Redux state, storing in secureLocalStorage",
        );
        try {
          secureLocalStorage.setItem("onboardingToken", tokenFromRedux);
          return tokenFromRedux;
        } catch (e) {
          console.error("Error storing token from Redux:", e);
          return tokenFromRedux; // Return it anyway
        }
      }

      console.warn("No token found in secureLocalStorage or Redux state");
      return null;
    } catch (e) {
      console.error("Error getting token:", e);
      return null;
    }
  };

  // Get referCode from URL or localStorage
  const getReferCode = () => {
    if (urlReferralCode) return urlReferralCode.toUpperCase();
    try {
      const stored = localStorage.getItem("referralCodeFromUrl");
      if (stored) return stored.toUpperCase();
    } catch (e) {
      console.error("Error reading referCode:", e);
    }
    return null;
  };

  // Build redirect URL
  const getRedirectUrl = () => {
    const protocol = window.location.protocol;
    const host = window.location.host;
    const referCode = getReferCode();
    if (referCode) {
      return `${protocol}//${host}/unity/${referCode}`;
    }
    return `${protocol}//${host}/unity`;
  };

  // Handle Verify/Connect
  const handleVerify = async () => {
    const token = getToken();
    console.log("handleVerify - Token check:", token ? "present" : "missing");

    if (!token) {
      console.error(
        "handleVerify - Token is missing. Checking all possible sources...",
      );

      // Try to get token from Redux one more time
      const tokenFromRedux =
        retailerOnboardingState?.OTPResponse?.OTPResponse?.userToken ||
        retailerOnboardingState?.OTPSubmitResponse?.OTPResponse?.userToken;

      if (tokenFromRedux) {
        console.log("handleVerify - Found token in Redux, storing it");
        try {
          secureLocalStorage.setItem("onboardingToken", tokenFromRedux);
          // Retry with the token from Redux
          const redirect_url = getRedirectUrl();
          setIsConnecting(true);
          // eslint-disable-next-line @typescript-eslint/await-thenable
          await dispatch(
            connectPanVerification(redirect_url, companyData, tokenFromRedux),
          );
          return;
        } catch (e) {
          console.error("Error storing token from Redux:", e);
        }
      }

      showNotification({
        type: "error",
        message:
          "Token is missing. Please complete mobile verification first and try again.",
      });
      return;
    }

    setIsConnecting(true);
    const redirect_url = getRedirectUrl();
    console.log(
      "handleVerify - Calling connectPanVerification with redirect_url:",
      redirect_url,
    );

    try {
      // eslint-disable-next-line @typescript-eslint/await-thenable
      await dispatch(connectPanVerification(redirect_url, companyData, token));
    } catch (error) {
      console.error("Error connecting PAN:", error);
      showNotification({
        type: "error",
        message: "Failed to connect PAN verification. Please try again.",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Handle Redux state changes for PAN connection
  useEffect(() => {
    const response = retailerOnboardingState?.panConnectionResponse;
    const error = retailerOnboardingState?.panConnectionError;

    if (response?.status === "SUCCESS" && response?.data?.url) {
      // Store pan connection status in localStorage BEFORE redirect
      // This ensures when user comes back from DigiLocker, they land on step4
      try {
        localStorage.setItem("movePan", "true");
        localStorage.setItem("panConnected", "true");
        sessionStorage.setItem("redirectToPan", "true");
        console.log("PAN flags set - will redirect back to step4");
      } catch (e) {
        console.error("Error storing pan connection status:", e);
      }

      // Mark as verified before redirect
      setIsVerified(true);

      // Navigate to DigiLocker - when user returns, they'll come back to /unity/:referCode
      // and index.jsx will detect the flags and show step4 directly
      console.log("Redirecting to DigiLocker:", response.data.url);
      window.location.href = response.data.url;
    } else if (
      response?.status === "SUCCESS" &&
      response?.data?.isDownload === true
    ) {
      try {
        localStorage.setItem("movePan", "true");
        localStorage.setItem("panConnected", "true");
      } catch (e) {
        console.error("Error storing pan connection status:", e);
      }

      setIsVerified(true);

      showNotification({
        type: "info",
        message:
          response?.message ||
          "PAN verification already processed. You can download now.",
      });
    } else if (error) {
      showNotification({
        type: "error",
        message:
          typeof error === "string"
            ? error
            : error?.message || "Failed to connect PAN verification",
      });
    }
  }, [
    retailerOnboardingState?.panConnectionResponse,
    retailerOnboardingState?.panConnectionError,
    showNotification,
  ]);

  // Handle Download
  const handleDownload = async () => {
    const token = getToken();
    if (!token) {
      showNotification({
        type: "error",
        message: "Token is missing. Please try again.",
      });
      return;
    }

    if (!isVerified) {
      showNotification({
        type: "error",
        message: "Please verify/connect first",
      });
      return;
    }

    setIsDownloading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/await-thenable
      await dispatch(downloadPanDocument(companyData, token));
    } catch (error) {
      console.error("Error downloading PAN:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle Redux state changes for PAN download
  useEffect(() => {
    const response = retailerOnboardingState?.downloadPanResponse;
    const error = retailerOnboardingState?.downloadPanError;

    if (response?.status === "SUCCESS") {
      setIsDownloaded(true);
      showNotification({
        type: "success",
        message: response?.message || "PAN document downloaded successfully",
      });
      if (isVerified && !showImageUpload) {
        setShowImageUpload(true);
      }
    } else if (error) {
      showNotification({
        type: "error",
        message:
          typeof error === "string"
            ? error
            : error?.message || "Failed to download PAN document",
      });
    }
  }, [
    retailerOnboardingState?.downloadPanResponse,
    retailerOnboardingState?.downloadPanError,
    isVerified,
    showImageUpload,
    showNotification,
  ]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5 MB)
    if (file.size > 5 * 1024 * 1024) {
      showNotification({
        type: "error",
        message: "File size should be less than 5 MB",
      });
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);

    // Clean up previous preview if exists
    if (panImagePreview) {
      URL.revokeObjectURL(panImagePreview);
    }
    setPanImage(file);
    setPanImagePreview(previewUrl);
  };

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      if (panImagePreview) {
        URL.revokeObjectURL(panImagePreview);
      }
    };
  }, [panImagePreview]);

  const handleDeleteImage = () => {
    if (panImagePreview) {
      URL.revokeObjectURL(panImagePreview);
    }
    setPanImage(null);
    setPanImagePreview(null);
  };

  const handleSubmitImage = async () => {
    if (!panImage) {
      showNotification({
        type: "error",
        message: "Please select a PAN card image",
      });
      return;
    }

    const token = getToken();
    if (!token) {
      showNotification({
        type: "error",
        message: "Token is missing. Please try again.",
      });
      return;
    }

    setIsUploading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/await-thenable
      await dispatch(uploadPanDocument(panImage, companyData, token));
    } catch (error) {
      console.error("Error uploading PAN:", error);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Redux state changes for PAN upload
  useEffect(() => {
    const response = retailerOnboardingState?.uploadPanResponse;
    const error = retailerOnboardingState?.uploadPanError;

    if (response?.status === "SUCCESS") {
      if (setFormData) {
        setFormData((d) => ({
          ...d,
          panDocFetched: true,
          digilockerLinked: true,
          panFront: panImage,
        }));
      }

      // Store redirect flag in sessionStorage
      try {
        sessionStorage.setItem("panUploadCompleted", "true");
      } catch (e) {
        console.error("Error storing pan upload status:", e);
      }

      showNotification({
        type: "success",
        message: response?.message || "PAN document uploaded successfully",
      });

      // Show steps page instead of redirecting
      if (onShowSteps) {
        setTimeout(() => {
          onShowSteps();
        }, 500);
      }
    } else if (error) {
      setIsUploading(false); // Hide loader on error
      showNotification({
        type: "error",
        message:
          typeof error === "string"
            ? error
            : error?.message || "Failed to upload PAN document",
      });
    }
  }, [
    retailerOnboardingState?.uploadPanResponse,
    retailerOnboardingState?.uploadPanError,
    panImage,
    setFormData,
    showNotification,
    onShowSteps,
  ]);

  return (
    <>
      {/* Loading Overlay for Upload Only */}
      {isUploading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 lg:p-10 max-w-md w-[90%] sm:w-auto mx-auto flex flex-col items-center gap-4 sm:gap-6 shadow-2xl">
            {/* Animated Spinner */}
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20">
              <div className="absolute inset-0 border-4 border-gray-200 rounded-full" />
              <div className="absolute inset-0 border-4 border-[#039155] border-t-transparent rounded-full animate-spin" />
            </div>

            {/* Loading Message */}
            <div className="text-center">
              <h3 className="text-base sm:text-lg md:text-xl font-[Gilroy-Semibold] text-gray-900 mb-1">
                Uploading
              </h3>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 px-2">
                Please wait while we upload your PAN document...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PAGE WRAPPER */}
      <div className="w-full min-h-screen flex justify-center items-center bg-gray-50 px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 py-4 sm:py-4 md:py-5 lg:py-6 xl:py-8 overflow-y-auto">
        <div className="w-full max-w-[98%] sm:max-w-[480px] md:max-w-[520px] lg:max-w-[600px] xl:max-w-[650px] 2xl:max-w-[700px] mx-auto">
          {/* =================== STEP 1 =================== */}
          {!showImageUpload ? (
            <div className="space-y-3 sm:space-y-3.5 md:space-y-4 bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg p-3 sm:p-4 md:p-5 lg:p-5 xl:p-6">
              {/* HEADER */}
              <div className="relative text-center px-8 sm:px-10">
                {/* Back Button */}
                {onBack && (
                  <button
                    type="button"
                    onClick={onBack}
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 border border-gray-400 rounded-full flex items-center justify-center hover:bg-gray-50 transition"
                    aria-label="Back to Steps"
                  >
                    <HiArrowLeft className="text-base sm:text-lg md:text-xl text-[#1B1717]" />
                  </button>
                )}

                <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-[Gilroy-Semibold] text-gray-800">
                  PAN Card Verification
                </h1>

                <p className="text-xs sm:text-xs md:text-sm lg:text-base text-gray-600 mt-1 max-w-[90%] mx-auto">
                  Connect Your DigiLocker For Instant Document Verification
                </p>
              </div>

              {/* DIGILOCKER BOX */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-dashed border-gray-400 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-4 lg:p-5 xl:p-6">
                <div className="flex items-start gap-3">
                  <img
                    src="/img/Digilocker1.png"
                    alt="DigiLocker"
                    className="h-12 sm:h-14 md:h-16 lg:h-16 xl:h-20 flex-shrink-0"
                  />

                  <div>
                    <h3 className="text-sm sm:text-base md:text-lg font-[Gilroy-Semibold] text-gray-900">
                      PAN Via DigiLocker
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Fetch PAN Document Securely From DigiLocker
                    </p>
                  </div>
                </div>

                {/* BUTTONS */}
                {/* BUTTONS */}
                <div className="flex gap-2 sm:gap-3 mt-3">
                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={!isVerified || isDownloading || isConnecting}
                    className={`flex-1 h-10 sm:h-11 md:h-12 lg:h-14 rounded-lg sm:rounded-xl font-[gilroy-medium] text-xs sm:text-sm md:text-base border transition shadow-md ${
                      isDownloaded
                        ? "bg-green-50 text-green-700 border-green-500"
                        : !isVerified || isDownloading || isConnecting
                          ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {isDownloading
                      ? "Downloading..."
                      : isDownloaded
                        ? "Downloaded ✓"
                        : "Download"}
                  </button>

                  <button
                    type="button"
                    onClick={handleVerify}
                    disabled={isVerified || isConnecting || isDownloading}
                    className={`flex-1 h-10 sm:h-11 md:h-12 lg:h-14 rounded-lg sm:rounded-xl font-[gilroy-semibold] text-xs sm:text-sm md:text-base transition shadow-md ${
                      isVerified
                        ? "bg-green-600 text-white cursor-not-allowed"
                        : isConnecting || isDownloading
                          ? "bg-gray-400 text-white cursor-not-allowed"
                          : "bg-[#039155] text-white hover:bg-green-700"
                    }`}
                  >
                    {isConnecting
                      ? "Connecting..."
                      : isVerified
                        ? "Verified"
                        : "Verify"}
                  </button>
                </div>
              </div>

              {/* INFO BOX */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 flex items-start gap-2">
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
                  <h4 className="font-[Gilroy-Semibold] text-blue-900 text-xs sm:text-sm">
                    Secure Document Verification
                  </h4>
                  <p className="text-xs sm:text-sm text-blue-800">
                    Documents are fetched directly from DigiLocker using secure
                    APIs.
                  </p>
                </div>
              </div>

              {/* NEXT BUTTON */}
              {isVerified && isDownloaded && (
                <button
                  type="button"
                  onClick={() => setShowImageUpload(true)}
                  className="w-full h-10 sm:h-11 md:h-12 lg:h-14 bg-[#039155] text-white rounded-lg sm:rounded-xl font-[Gilroy-Semibold] text-sm md:text-base hover:bg-green-700 transition shadow-lg"
                >
                  Next
                </button>
              )}
            </div>
          ) : (
            /* =================== STEP 2 - IMAGE UPLOAD =================== */
            <div className="space-y-2.5 sm:space-y-3 md:space-y-4 lg:space-y-4 xl:space-y-5 bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg p-3 sm:p-4 md:p-5 lg:p-5 xl:p-6">
              {/* HEADER */}
              <div className="relative text-center px-8 sm:px-10">
                {/* Back Button */}
                {onBack && (
                  <button
                    type="button"
                    onClick={onBack}
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 border border-gray-400 rounded-full flex items-center justify-center hover:bg-gray-50 transition"
                    aria-label="Back to Steps"
                  >
                    <HiArrowLeft className="text-base sm:text-lg md:text-xl text-[#1B1717]" />
                  </button>
                )}

                <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-[Gilroy-Semibold] text-gray-800">
                  PAN Card Verification
                </h1>

                <p className="text-xs sm:text-xs md:text-sm lg:text-base text-gray-600 mt-1 max-w-[90%] mx-auto">
                  Connect Your DigiLocker For Instant Document Verification
                </p>
              </div>

              {/* PAN IMAGE */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-3.5 md:p-4 lg:p-4 xl:p-5 mx-auto w-full h-[160px] sm:h-[180px] md:h-[200px] lg:h-[220px] xl:h-[240px] flex items-center justify-center relative overflow-hidden">
                {panImagePreview ? (
                  <>
                    <img
                      src={panImagePreview}
                      alt="PAN Card Preview"
                      className="w-full h-full object-contain absolute inset-0 p-2"
                    />
                    <button
                      onClick={handleDeleteImage}
                      className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 md:top-2.5 md:right-2.5 lg:top-3 lg:right-3 z-10 w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-9 lg:h-9 rounded-full bg-red-500 hover:bg-red-600 active:scale-90 flex items-center justify-center transition-all shadow-lg"
                      type="button"
                      aria-label="Delete image"
                    >
                      <svg
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 text-white"
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
                  <div className="flex flex-col items-center justify-center gap-2 sm:gap-2.5 md:gap-3">
                    <img
                      src="/img/pancard-front.png"
                      alt="PAN Card"
                      className="w-[100px] h-[60px] sm:w-[110px] sm:h-[70px] md:w-[120px] md:h-[75px] lg:w-[140px] lg:h-[85px] xl:w-[150px] xl:h-[90px] object-contain"
                    />
                    <h3 className="capitalize font-['Gilroy-Medium'] text-[#1B1717]/80 font-normal text-[11px] sm:text-xs md:text-sm lg:text-base xl:text-base text-center leading-[100%] tracking-[0%] align-middle">
                      Add PAN Card Image
                    </h3>
                    <label>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                      <span className="bg-[#C5DBFF] text-[#1B1717] cursor-pointer hover:bg-[#B0CFFF] active:scale-95 transition-all inline-flex items-center justify-center px-3 sm:px-3.5 md:px-4 lg:px-5 xl:px-6 py-1.5 sm:py-2 md:py-2 lg:py-2.5 xl:py-3 min-w-[120px] sm:min-w-[130px] md:min-w-[140px] lg:min-w-[160px] xl:min-w-[170px] h-auto min-h-[28px] sm:min-h-[30px] md:min-h-[32px] lg:min-h-[38px] xl:min-h-[40px] rounded-lg sm:rounded-xl text-[10px] sm:text-xs md:text-xs lg:text-sm xl:text-base font-[gilroy-regular]">
                        Select From Browser
                      </span>
                    </label>
                    <p className="capitalize font-['Gilroy-Regular'] text-[#1B1717]/80 text-[9px] sm:text-[10px] md:text-xs lg:text-sm xl:text-sm leading-[100%] tracking-[0%] align-middle text-[#6B7280]">
                      File Size (Max 5 MB)
                    </p>
                  </div>
                )}
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="button"
                onClick={handleSubmitImage}
                disabled={!panImage || isUploading}
                className={`w-full px-3 sm:px-4 md:px-4 lg:px-5 xl:px-6 py-2 sm:py-2 md:py-2.5 lg:py-3 xl:py-3.5 h-10 sm:h-11 md:h-12 lg:h-12 xl:h-14 rounded-lg sm:rounded-xl font-[gilroy-semibold] text-white text-sm sm:text-sm md:text-sm lg:text-sm xl:text-base mx-auto shadow-md transition-all flex items-center justify-center ${
                  panImage && !isUploading
                    ? "bg-[#039155] hover:bg-green-700 active:scale-95"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {isUploading ? "Uploading..." : "Submit"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default RetailerPan;
