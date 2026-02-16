import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useCompany } from "./../context/CompanyContext";
import { useSelector, useDispatch } from "react-redux";
import secureLocalStorage from "react-secure-storage";
import { useNotification } from "../context/NotificationContext";
import {
  connectAadhaarVerification,
  downloadAadhaarDocument,
  uploadAadhaarDocuments,
} from "../redux/action/retailerOnboardingAction";
import { HiArrowLeft } from "react-icons/hi2";

function RetailerAadhaar({ setFormData, onNext, onBack, onShowSteps }) {
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
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [frontImagePreview, setFrontImagePreview] = useState(null);
  const [backImagePreview, setBackImagePreview] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Check for aadhaar connection status on mount and validate token
  useEffect(() => {
    try {
      // Check multiple storage locations for aadhaar connection status
      const moveAadhaar = localStorage.getItem("moveAadhaar");
      const aadhaarConnected = localStorage.getItem("aadhaarConnected");
      const redirectToaddhar = sessionStorage.getItem("redirectToaddhar");

      if (
        moveAadhaar === "true" ||
        aadhaarConnected === "true" ||
        redirectToaddhar === "true"
      ) {
        // Mark as verified
        setIsVerified(true);
        // Clear sessionStorage flag if it exists
        if (redirectToaddhar === "true") {
          sessionStorage.removeItem("redirectToaddhar");
        }
      }

      // Validate token exists on mount
      const token = getToken();
      if (!token) {
        console.warn(
          "Step3: Token not found on mount. User may need to complete mobile verification first.",
        );
        showNotification({
          type: "warning",
          message:
            "Please complete mobile verification first to continue with Aadhaar verification.",
        });
      } else {
        console.log("Step3: Token validated successfully on mount");
      }
    } catch (e) {
      console.error("Error checking aadhaar connection status:", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get token from secureLocalStorage or Redux state
  const getToken = () => {
    try {
      // First try secureLocalStorage
      const tokenFromStorage = secureLocalStorage.getItem("onboardingToken");
      if (tokenFromStorage) {
       // console.log("Token found in secureLocalStorage");
        return tokenFromStorage;
      }

      // Fallback: Check Redux state for token from mobile verification
      const tokenFromRedux =
        retailerOnboardingState?.OTPResponse?.OTPResponse?.userToken ||
        retailerOnboardingState?.OTPSubmitResponse?.OTPResponse?.userToken;

      if (tokenFromRedux) {
        // console.log(
        //   "Token found in Redux state, storing in secureLocalStorage",
        // );
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
    const protocol = window.location.protocol; // http: or https:
    const host = window.location.host; // includes port if present (e.g., localhost:5173)
    const referCode = getReferCode();
    if (referCode) {
      return `${protocol}//${host}/unity/${referCode}`;
    }
    return `${protocol}//${host}/unity`;
  };

  // Handle Verify/Connect
  const handleVerify = async () => {
    const token = getToken();
    //console.log("handleVerify - Token check:", token ? "present" : "missing");

    if (!token) {
      console.error(
        "handleVerify - Token is missing. Checking all possible sources...",
      );

      // Try to get token from Redux one more time
      const tokenFromRedux =
        retailerOnboardingState?.OTPResponse?.OTPResponse?.userToken ||
        retailerOnboardingState?.OTPSubmitResponse?.OTPResponse?.userToken;

      if (tokenFromRedux) {
        //console.log("handleVerify - Found token in Redux, storing it");
        try {
          secureLocalStorage.setItem("onboardingToken", tokenFromRedux);
          // Retry with the token from Redux
          const redirect_url = getRedirectUrl();
          setIsConnecting(true);
          await dispatch(
            connectAadhaarVerification(
              redirect_url,
              companyData,
              tokenFromRedux,
            ),
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
    // console.log(
    //   "handleVerify - Calling connectAadhaarVerification with redirect_url:",
    //   redirect_url,
    // );

    try {
      await dispatch(
        connectAadhaarVerification(redirect_url, companyData, token),
      );
    } catch (error) {
      console.error("Error connecting Aadhaar:", error);
      showNotification({
        type: "error",
        message: "Failed to connect Aadhaar verification. Please try again.",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Handle Redux state changes for Aadhaar connection
  useEffect(() => {
    const response = retailerOnboardingState?.aadhaarConnectionResponse;
    const error = retailerOnboardingState?.aadhaarConnectionError;

    if (response?.status === "SUCCESS" && response?.data?.url) {
      // Store aadhaar connection status in localStorage BEFORE redirect
      // This ensures when user comes back from DigiLocker, they land on step3
      try {
        localStorage.setItem("moveAadhaar", "true");
        localStorage.setItem("aadhaarConnected", "true");
        sessionStorage.setItem("redirectToaddhar", "true");
        //console.log("Aadhaar flags set - will redirect back to step3");
      } catch (e) {
        console.error("Error storing aadhaar connection status:", e);
      }

      // Mark as verified before redirect
      setIsVerified(true);

      // Navigate to DigiLocker - when user returns, they'll come back to /unity/:referCode
      // and index.jsx will detect the flags and show step3 directly
      //console.log("Redirecting to DigiLocker:", response.data.url);
      window.location.href = response.data.url;
    } else if (
      response?.status === "SUCCESS" &&
      response?.data?.isDownload === true
    ) {
      // Handle "already processed" case - disable verify, enable download
      try {
        localStorage.setItem("moveAadhaar", "true");
        localStorage.setItem("aadhaarConnected", "true");
      } catch (e) {
        console.error("Error storing aadhaar connection status:", e);
      }

      // Mark as verified to enable download button
      setIsVerified(true);

      showNotification({
        type: "info",
        message:
          response?.message ||
          "Aadhaar verification already processed. You can download now.",
      });
    } else if (error) {
      showNotification({
        type: "error",
        message:
          typeof error === "string"
            ? error
            : error?.message || "Failed to connect Aadhaar verification",
      });
    }
  }, [
    retailerOnboardingState?.aadhaarConnectionResponse,
    retailerOnboardingState?.aadhaarConnectionError,
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
      await dispatch(downloadAadhaarDocument(companyData, token));
    } catch (error) {
      console.error("Error downloading Aadhaar:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle Redux state changes for Aadhaar download
  useEffect(() => {
    const response = retailerOnboardingState?.downloadAadhaarResponse;
    const error = retailerOnboardingState?.downloadAadhaarError;

    if (response?.status === "SUCCESS") {
      setIsDownloaded(true);
      showNotification({
        type: "success",
        message:
          response?.message || "Aadhaar document downloaded successfully",
      });
      // After download success, show upload section if both verify and download are done
      if (isVerified && !showImageUpload) {
        setShowImageUpload(true);
      }
    } else if (error) {
      showNotification({
        type: "error",
        message:
          typeof error === "string"
            ? error
            : error?.message || "Failed to download Aadhaar document",
      });
    }
  }, [
    retailerOnboardingState?.downloadAadhaarResponse,
    retailerOnboardingState?.downloadAadhaarError,
    isVerified,
    showImageUpload,
    showNotification,
  ]);

  const handleImageChange = (type, e) => {
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

  const handleSubmitImages = async () => {
    if (!frontImage || !backImage) {
      showNotification({
        type: "error",
        message: "Please select both front and back images",
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
      await dispatch(
        uploadAadhaarDocuments(frontImage, backImage, companyData, token),
      );
    } catch (error) {
      console.error("Error uploading Aadhaar:", error);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Redux state changes for Aadhaar upload
  useEffect(() => {
    const response = retailerOnboardingState?.uploadAadhaarResponse;
    const error = retailerOnboardingState?.uploadAadhaarError;

    if (response?.status === "SUCCESS") {
      if (setFormData) {
        setFormData((d) => ({
          ...d,
          aadhaarDocFetched: true,
          digilockerLinked: true,
          aadhaarFront: frontImage,
          aadhaarBack: backImage,
        }));
      }
      showNotification({
        type: "success",
        message: response?.message || "Aadhaar documents uploaded successfully",
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
            : error?.message || "Failed to upload Aadhaar documents",
      });
    }
  }, [
    retailerOnboardingState?.uploadAadhaarResponse,
    retailerOnboardingState?.uploadAadhaarError,
    frontImage,
    backImage,
    setFormData,
    showNotification,
    onShowSteps,
  ]);

  return (
    <>
      {/* ================= Upload Loader ================= */}
      {isUploading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-2xl p-6 sm:p-8 md:p-10 max-w-md mx-4 flex flex-col items-center gap-4 shadow-2xl">
            <div className="relative w-12 h-12 sm:w-16 sm:h-16">
              <div className="absolute inset-0 border-4 border-gray-200 rounded-full" />
              <div className="absolute inset-0 border-4 border-[#039155] border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="text-center">
              <h3 className="text-lg sm:text-xl font-[gilroy-semibold] text-[#1B1717]">
                Uploading
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Please wait while we upload your Aadhaar documents...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= PAGE WRAPPER (SAME AS STEP 1) ================= */}
      <div className="w-full h-full flex justify-center items-center bg-gray-50 p-2 sm:p-3 md:p-4 overflow-hidden">
        <div className="w-full max-w-[98%] sm:max-w-[480px] md:max-w-[520px] lg:max-w-[580px] xl:max-w-[600px] 2xl:max-w-[700px] bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg p-3 sm:p-4 md:p-5 lg:p-5 xl:p-6 mx-auto">
          {/* =====================================================
            STEP 3 – SCREEN 1 : DIGILOCKER
        ===================================================== */}
          {!showImageUpload ? (
            <div className="space-y-3 md:space-y-4">
              {/* HEADER */}
              <div className="relative text-center px-8 sm:px-10">
                {/* Back Button */}
                {onBack && (
                  <button
                    type="button"
                    onClick={onBack}
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 border border-gray-400 rounded-full flex items-center justify-center hover:bg-gray-50 transition"
                    aria-label="Back"
                  >
                    <HiArrowLeft className="text-lg text-[#1B1717]" />
                  </button>
                )}

                {/* Title */}
                <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-[gilroy-semibold] text-[#1B1717]">
                  Aadhaar Verification
                </h1>

                {/* Subtitle */}
                <p className="text-xs sm:text-xs md:text-sm lg:text-base font-[gilroy-regular] text-[#1B1717] mt-1 max-w-[90%] mx-auto">
                  Connect Your DigiLocker For Instant Document Verification
                </p>
              </div>

              {/* DIGILOCKER CARD */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-dashed border-gray-400 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-4 lg:p-5 xl:p-6">
                <div className="flex items-start gap-3">
                  <img
                    src="/img/Digilocker1.png"
                    alt="DigiLocker"
                    className="h-14 sm:h-16 flex-shrink-0"
                  />
                  <div>
                    <h3 className="text-sm sm:text-base md:text-lg font-[gilroy-semibold] text-[#1B1717]">
                      Aadhaar Via DigiLocker
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Fetch Aadhaar Document Securely From DigiLocker
                    </p>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex gap-2 sm:gap-3 mt-3">
                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={!isVerified || isDownloading || isConnecting}
                    className={`flex-1 h-10 sm:h-11 md:h-12 lg:h-14 rounded-lg sm:rounded-xl font-[gilroy-semibold] text-sm md:text-base border transition shadow-md ${
                      isDownloaded
                        ? "bg-green-50 text-green-700 border-green-500"
                        : !isVerified || isDownloading || isConnecting
                          ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
                          : "border-gray-300 text-[#1B1717] hover:bg-gray-50"
                    }`}
                  >
                    {isDownloaded ? "Downloaded ✓" : "Download"}
                  </button>

                  <button
                    type="button"
                    onClick={handleVerify}
                    disabled={isVerified || isConnecting || isDownloading}
                    className={`flex-1 h-10 sm:h-11 md:h-12 lg:h-14 rounded-lg sm:rounded-xl font-[gilroy-semibold] text-sm md:text-base transition shadow-md ${
                      isVerified
                        ? "bg-green-600 text-white cursor-not-allowed"
                        : isConnecting || isDownloading
                          ? "bg-gray-400 text-white cursor-not-allowed"
                          : "bg-[#039155] text-white hover:bg-green-700"
                    }`}
                  >
                    {isVerified ? "Verified" : "Verify"}
                  </button>
                </div>
              </div>

              {/* ✅ INFO BOX — RESTORED (UNCHANGED CONTENT) */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-3.5 md:p-3.5 lg:p-4 xl:p-5 flex items-start gap-2 sm:gap-2.5 md:gap-2.5 lg:gap-3 xl:gap-3.5 w-full">
                <svg
                  className="h-4 w-4 sm:h-4 sm:w-4 md:w-5 md:h-5 lg:w-5 lg:h-5 xl:w-5 xl:h-5 text-blue-600 flex-shrink-0 mt-0.5"
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
                  <h4 className="font-semibold text-blue-900 text-xs sm:text-xs md:text-sm lg:text-sm xl:text-base mb-0.5 sm:mb-1">
                    Secure Document Verification
                  </h4>
                  <p className="text-xs sm:text-xs md:text-sm lg:text-sm xl:text-base text-blue-800">
                    Documents are fetched directly from DigiLocker using secure
                    APIs.
                  </p>
                </div>
              </div>

              {/* NEXT */}
              {isVerified && isDownloaded && (
                <button
                  type="button"
                  onClick={() => setShowImageUpload(true)}
                  className="w-full h-10 sm:h-11 md:h-12 lg:h-14 bg-[#039155] text-white rounded-lg sm:rounded-xl font-[gilroy-semibold] text-sm md:text-base hover:bg-green-700 transition shadow-lg"
                >
                  Next
                </button>
              )}
            </div>
          ) : (
            /* =================== STEP 2 - IMAGE UPLOAD =================== */
            <div
              className="space-y-2 sm:space-y-2.5 md:space-y-3
     p-3 sm:p-4 md:p-5 lg:p-5 xl:p-6"
            >
              {/* HEADER */}
              <div className="relative text-center px-8 sm:px-10">
                {/* Back Button */}
                {onBack && (
                  <button
                    type="button"
                    onClick={onBack}
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 border border-gray-400 rounded-full flex items-center justify-center hover:bg-gray-50 transition"
                    aria-label="Back"
                  >
                    <HiArrowLeft className="text-lg text-[#1B1717]" />
                  </button>
                )}

                {/* Title */}
                <h1 className="text-base sm:text-sm md:text-lg lg:text-xl font-[gilroy-semibold] text-[#1B1717]">
                  Aadhaar Verification
                </h1>

                {/* Subtitle */}
                <p className="text-xs sm:text-xs md:text-sm lg:text-base font-[gilroy-medium] text-[#1B1717]/70 mt-1 max-w-[90%] mx-auto">
                  Connect Your DigiLocker For Instant Document Verification
                </p>
              </div>

              {/* FRONT IMAGE */}
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
                      className="absolute top-2 right-2
              w-8 h-8 rounded-full
              bg-red-500 hover:bg-red-600
              active:scale-90
              flex items-center justify-center
              shadow-lg"
                      type="button"
                      aria-label="Delete image"
                    >
                      <svg
                        className="w-4 h-4 text-white"
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
                  <div
                    className="flex flex-col items-center justify-center
          gap-0.5 sm:gap-1"
                  >
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
              lg:text-xs xl:text-sm font-[gilroy-regular]"
                      >
                        Select From Browser
                      </span>
                    </label>

                    <p
                      className="text-[7px] sm:text-[8px] md:text-[9px]
            lg:text-[10px] xl:text-xs text-[#1B1717]/80 font-[gilroy-regular]"
                    >
                      File Size ( Max 5 MB )
                    </p>
                  </div>
                )}
              </div>

              {/* BACK IMAGE */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg sm:rounded-xl md:rounded-2xl p-2.5 sm:p-2.5 md:p-3 lg:p-3 xl:p-3 mx-auto w-full h-[150px] sm:h-[170px] md:h-[180px] lg:h-[190px] xl:h-[195px] flex items-center justify-center relative overflow-hidden">
                {backImagePreview ? (
                  <>
                    <img
                      src={backImagePreview}
                      alt="Aadhaar Back Preview"
                      className="w-full h-full object-contain absolute inset-0 p-2 lg:p-2 xl:p-2.5"
                    />
                    <button
                      onClick={() => handleDeleteImage("back")}
                      className="absolute top-2 right-2 sm:top-2 sm:right-2 md:top-2.5 md:right-2.5 lg:top-2.5 lg:right-2.5 xl:top-3 xl:right-3 z-10 w-8 h-8 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-9 lg:h-9 xl:w-9 xl:h-9 rounded-full bg-red-500 hover:bg-red-600 active:scale-90 flex items-center justify-center transition-all shadow-lg"
                      type="button"
                      aria-label="Delete image"
                    >
                      <svg
                        className="w-4 h-4 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 xl:w-5 xl:h-5 text-white"
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
                      <span className="bg-[#C5DBFF] text-[#1B1717] cursor-pointer hover:bg-[#B0CFFF] active:scale-95 transition-all inline-flex items-center justify-center px-2.5 sm:px-3 md:px-3 lg:px-3.5 xl:px-4 py-0.5 sm:py-1 md:py-1 lg:py-1.5 xl:py-1 min-w-[100px] sm:min-w-[110px] md:min-w-[120px] lg:min-w-[130px] xl:min-w-[140px] h-auto min-h-[24px] sm:min-h-[26px] md:min-h-[28px] lg:min-h-[30px] xl:min-h-[30px] rounded-lg sm:rounded-xl text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs xl:text-sm font-[gilroy-regular]">
                        Select From Browser
                      </span>
                    </label>
                    <p className="capitalize font-['Gilroy-Regular'] font-normal text-[7px] sm:text-[8px] md:text-[9px] lg:text-[10px] xl:text-xs leading-[100%] tracking-[0%] align-middle text-[#1B1717]/80">
                      File Size (Max 5 MB)
                    </p>
                  </div>
                )}
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="button"
                onClick={handleSubmitImages}
                disabled={!frontImage || !backImage || isUploading}
                className={`w-full
        h-9 sm:h-10 md:h-10 lg:h-11 xl:h-12
        rounded-lg sm:rounded-xl
        font-[gilroy-semibold]
        text-sm sm:text-sm md:text-sm lg:text-sm xl:text-base
        shadow-md transition-all
        flex items-center justify-center
        ${
          frontImage && backImage && !isUploading
            ? "bg-[#039155] hover:bg-green-700 active:scale-95 text-white"
            : "bg-gray-400 cursor-not-allowed text-white"
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

export default RetailerAadhaar;
