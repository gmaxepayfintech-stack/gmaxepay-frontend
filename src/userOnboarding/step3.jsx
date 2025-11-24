import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useCompany } from "./../context/CompanyContext";
import { useSelector, useDispatch } from "react-redux";
import secureLocalStorage from "react-secure-storage";
import { useNotification } from "../context/NotificationContext";
import { connectAadhaarVerification, downloadAadhaarDocument, uploadAadhaarDocuments } from "../redux/action/retailerOnboardingAction";

function RetailerAadhaar({ setFormData, onNext }) {
  const { referCode: urlReferralCode } = useParams();
  const dispatch = useDispatch();
  const { company } = useCompany();
  const { showNotification } = useNotification();
  const companyFromRedux = useSelector((state) => state?.company?.company);
  const companyData = companyFromRedux || company;
  const retailerOnboardingState = useSelector((state) => state?.retailerOnboarding);

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

  // Check for aadhaar connection status on mount
  useEffect(() => {
    try {
      // Check multiple storage locations for aadhaar connection status
      const moveAadhaar = localStorage.getItem("moveAadhaar");
      const aadhaarConnected = localStorage.getItem("aadhaarConnected");
      const redirectToaddhar = sessionStorage.getItem("redirectToaddhar");
      
      if (moveAadhaar === "true" || aadhaarConnected === "true" || redirectToaddhar === "true") {
        // Mark as verified
        setIsVerified(true);
        // Clear sessionStorage flag if it exists
        if (redirectToaddhar === "true") {
          sessionStorage.removeItem("redirectToaddhar");
        }
      }
    } catch (e) {
      console.error("Error checking aadhaar connection status:", e);
    }
  }, []);

  // Get token from secureLocalStorage
  const getToken = () => {
    try {
      return secureLocalStorage.getItem("onboardingToken");
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
    if (!token) {
      showNotification({
        type: "error",
        message: "Token is missing. Please try again.",
      });
      return;
    }

    setIsConnecting(true);
    const redirect_url = getRedirectUrl();
    
    try {
      await dispatch(connectAadhaarVerification(redirect_url, companyData, token));
    } catch (error) {
      console.error("Error connecting Aadhaar:", error);
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
        console.log("Aadhaar flags set - will redirect back to step3");
      } catch (e) {
        console.error("Error storing aadhaar connection status:", e);
      }

      // Mark as verified before redirect
      setIsVerified(true);

      // Navigate to DigiLocker - when user returns, they'll come back to /unity/:referCode
      // and index.jsx will detect the flags and show step3 directly
      console.log("Redirecting to DigiLocker:", response.data.url);
      window.location.href = response.data.url;
    } else if (response?.status === "SUCCESS" && response?.data?.isDownload === true) {
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
        message: response?.message || "Aadhaar verification already processed. You can download now.",
      });
    } else if (error) {
      showNotification({
        type: "error",
        message: typeof error === "string" ? error : error?.message || "Failed to connect Aadhaar verification",
      });
    }
  }, [retailerOnboardingState?.aadhaarConnectionResponse, retailerOnboardingState?.aadhaarConnectionError, showNotification]);

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
        message: response?.message || "Aadhaar document downloaded successfully",
      });
      // After download success, show upload section if both verify and download are done
      if (isVerified && !showImageUpload) {
        setShowImageUpload(true);
      }
    } else if (error) {
      showNotification({
        type: "error",
        message: typeof error === "string" ? error : error?.message || "Failed to download Aadhaar document",
      });
    }
  }, [retailerOnboardingState?.downloadAadhaarResponse, retailerOnboardingState?.downloadAadhaarError, isVerified, showImageUpload, showNotification]);

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
      await dispatch(uploadAadhaarDocuments(frontImage, backImage, companyData, token));
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

      // Redirect to KYC index page using window.location.href
      setTimeout(() => {
        const referCode = getReferCode();
        if (referCode) {
          window.location.href = `/unity/${referCode}`;
        } else {
          window.location.href = `/unity`;
        }
      }, 500);
    } else if (error) {
      setIsUploading(false); // Hide loader on error
      showNotification({
        type: "error",
        message: typeof error === "string" ? error : error?.message || "Failed to upload Aadhaar documents",
      });
    }
  }, [retailerOnboardingState?.uploadAadhaarResponse, retailerOnboardingState?.uploadAadhaarError, frontImage, backImage, setFormData, showNotification]);

  return (
    <>
      {/* Loading Overlay for Upload Only */}
      {isUploading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-2xl p-6 sm:p-8 md:p-10 max-w-md mx-4 flex flex-col items-center gap-4 sm:gap-6 shadow-2xl">
            {/* Animated Spinner */}
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20">
              <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-[#039155] border-t-transparent rounded-full animate-spin"></div>
            </div>
            
            {/* Loading Message */}
            <div className="text-center">
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-1 sm:mb-2">
                Uploading
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm md:text-base px-2">
                Please wait while we upload your Aadhaar documents...
              </p>
            </div>
          </div>
        </div>
      )}

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
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 mt-4 sm:mt-6">
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={!isVerified || isDownloading || isConnecting}
                  className={`
                    flex-1 w-full sm:w-auto
                    px-4 sm:px-5 md:px-6 lg:px-8
                    py-2.5 sm:py-3 md:py-3.5 lg:py-4
                    min-h-[44px] sm:min-h-[48px] md:min-h-[52px] lg:min-h-[56px]
                    text-sm sm:text-base md:text-lg lg:text-xl
                    rounded-xl sm:rounded-2xl
                    border-2 border-[#1B1717] border-opacity-80 
                    font-medium 
                    transition-all
                    flex items-center justify-center
                    ${
                      isDownloaded
                        ? "bg-green-50 text-green-700 border-green-500 cursor-default"
                        : !isVerified || isDownloading || isConnecting
                        ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-100 active:scale-95"
                    }
                  `}
                >
                  {isDownloading ? "Downloading..." : isDownloaded ? "Downloaded ✓" : "Download"}
                </button>

                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={isVerified || isConnecting || isDownloading}
                  className={`
                    flex-1 w-full sm:w-auto
                    px-4 sm:px-5 md:px-6 lg:px-8
                    py-2.5 sm:py-3 md:py-3.5 lg:py-4
                    min-h-[44px] sm:min-h-[48px] md:min-h-[52px] lg:min-h-[56px]
                    text-sm sm:text-base md:text-lg lg:text-xl
                    rounded-xl sm:rounded-2xl
                    font-medium 
                    transition-all
                    flex items-center justify-center gap-2
                    ${
                      isVerified
                        ? "bg-green-600 text-white cursor-not-allowed"
                        : isConnecting || isDownloading
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-[#039155] text-white hover:bg-green-700 active:scale-95"
                    }
                  `}
                >
                  {isConnecting ? (
                    "Connecting..."
                  ) : isVerified ? (
                    <>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Verified
                    </>
                  ) : (
                    "Verify"
                  )}
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

            {/* NEXT BUTTON - Only show if both verify and download are successful */}
            {isVerified && isDownloaded && (
              <button
                type="button"
                onClick={() => setShowImageUpload(true)}
                className="
                  w-full 
                  max-w-[450px]
                  px-4 sm:px-6 md:px-8 lg:px-10
                  py-3 sm:py-3.5 md:py-4 lg:py-4.5
                  min-h-[44px] sm:min-h-[48px] md:min-h-[52px] lg:min-h-[56px]
                  text-center 
                  rounded-xl sm:rounded-2xl
                  font-semibold 
                  text-white 
                  text-sm sm:text-base md:text-lg lg:text-xl
                  mx-auto 
                  shadow-md
                  transition-all
                  flex items-center justify-center
                  bg-[#039155]
                  hover:bg-green-700
                  active:scale-95
                  opacity-100
                "
              >
                Next
              </button>
            )}
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
            <div className="border-2 border-dashed border-gray-300 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 mx-auto w-full max-w-[450px] h-[200px] sm:h-[220px] md:h-[240px] flex items-center justify-center relative overflow-hidden">
              {frontImagePreview ? (
                <>
                  <img
                    src={frontImagePreview}
                    alt="Aadhaar Front Preview"
                    className="w-full h-full object-contain absolute inset-0 p-2"
                  />
                  <button
                    onClick={() => handleDeleteImage("front")}
                    className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 z-10 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-red-500 hover:bg-red-600 active:scale-90 flex items-center justify-center transition-all shadow-lg"
                    type="button"
                    aria-label="Delete image"
                  >
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white"
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
                <div className="flex flex-col items-center justify-center gap-3 sm:gap-4">
                  <img
                    src="/img/aadhaar-front.png"
                    alt="Aadhaar Front"
                    className="w-[120px] h-[75px] sm:w-[140px] sm:h-[85px] object-contain"
                  />
                  <h3 className="capitalize font-['Gilroy-Medium'] font-normal text-[13px] sm:text-sm text-center leading-[100%] tracking-[0%] align-middle">
                    Add Aadhaar Image Front
                  </h3>
                  <label>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageChange("front", e)}
                    />
                    <span className="bg-[#C5DBFF] text-gray-900 cursor-pointer hover:bg-[#B0CFFF] active:scale-95 transition-all inline-flex items-center justify-center px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 min-w-[137px] sm:min-w-[150px] md:min-w-[170px] h-auto min-h-[32px] sm:min-h-[36px] md:min-h-[40px] rounded-lg sm:rounded-xl text-xs sm:text-sm md:text-base font-medium">
                      Select From Browser
                    </span>
                  </label>
                  <p className="capitalize font-['Gilroy-Regular'] font-normal text-[10px] sm:text-xs leading-[100%] tracking-[0%] align-middle text-[#6B7280]">
                    File Size (Max 5 MB)
                  </p>
                </div>
              )}
            </div>

            {/* BACK IMAGE */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 mx-auto w-full max-w-[450px] h-[200px] sm:h-[220px] md:h-[240px] flex items-center justify-center relative overflow-hidden">
              {backImagePreview ? (
                <>
                  <img
                    src={backImagePreview}
                    alt="Aadhaar Back Preview"
                    className="w-full h-full object-contain absolute inset-0 p-2"
                  />
                  <button
                    onClick={() => handleDeleteImage("back")}
                    className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 z-10 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-red-500 hover:bg-red-600 active:scale-90 flex items-center justify-center transition-all shadow-lg"
                    type="button"
                    aria-label="Delete image"
                  >
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white"
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
                <div className="flex flex-col items-center justify-center gap-3 sm:gap-4">
                  <img
                    src="/img/aadhaar-back.png"
                    alt="Aadhaar Back"
                    className="w-[120px] h-[75px] sm:w-[140px] sm:h-[85px] object-contain"
                  />
                  <h3 className="capitalize font-['Gilroy-Medium'] font-normal text-[13px] sm:text-sm text-center leading-[100%] tracking-[0%] align-middle">
                    Add Aadhaar Image Back
                  </h3>
                  <label>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageChange("back", e)}
                    />
                    <span className="bg-[#C5DBFF] text-gray-900 cursor-pointer hover:bg-[#B0CFFF] active:scale-95 transition-all inline-flex items-center justify-center px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 min-w-[137px] sm:min-w-[150px] md:min-w-[170px] h-auto min-h-[32px] sm:min-h-[36px] md:min-h-[40px] rounded-lg sm:rounded-xl text-xs sm:text-sm md:text-base font-medium">
                      Select From Browser
                    </span>
                  </label>
                  <p className="capitalize font-['Gilroy-Regular'] font-normal text-[10px] sm:text-xs leading-[100%] tracking-[0%] align-middle text-[#6B7280]">
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
              className={`
                w-full 
                max-w-[450px]
                px-4 sm:px-6 md:px-8 lg:px-10
                py-3 sm:py-3.5 md:py-4 lg:py-4.5
                min-h-[44px] sm:min-h-[48px] md:min-h-[52px] lg:min-h-[56px]
                rounded-xl sm:rounded-2xl
                font-semibold 
                text-white 
                text-sm sm:text-base md:text-lg lg:text-xl
                mx-auto 
                shadow-md
                transition-all
                flex items-center justify-center
                ${
                  frontImage && backImage && !isUploading
                    ? "bg-[#039155] hover:bg-green-700 active:scale-95"
                    : "bg-gray-400 cursor-not-allowed"
                }
              `}
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
