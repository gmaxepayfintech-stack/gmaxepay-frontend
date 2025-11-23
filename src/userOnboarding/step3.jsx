import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_ROUTE } from "./../data/env";
import { useCompany } from "./../context/CompanyContext";
import { useSelector } from "react-redux";
import secureLocalStorage from "react-secure-storage";
import { useNotification } from "../context/NotificationContext"

function RetailerAadhaar({ setFormData, onNext }) {
  const { referCode: urlReferralCode } = useParams();
  const navigate = useNavigate();
  const { company } = useCompany();
  const { showNotification } = useNotification();
  const companyFromRedux = useSelector((state) => state?.company?.company);
  const companyData = companyFromRedux || company;

  const [isVerified, setIsVerified] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
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
    try {
      const headers = {
        "Content-Type": "application/json",
      };

      if (companyData?.companyId || companyData?._id || companyData?.id) {
        headers["x-company-id"] = companyData?.companyId || companyData?._id || companyData?.id;
      }

      if (companyData?.domain || companyData?.companyDomain) {
        headers["x-company-domain"] = companyData?.domain || companyData?.companyDomain;
      }

      if (token) {
        headers["token"] = token;
      }

      const redirect_url = getRedirectUrl();
      const response = await axios.post(
        `${API_ROUTE}/api/v1/user/onboarding/connectAadhaarVerification`,
        { redirect_url },
        { headers }
      );

      const { status, data } = response?.data ?? {};

      if (status === "SUCCESS" && data?.url) {
        // Store aadhaar connection status in localStorage
        try {
          localStorage.setItem("moveAadhaar", "true");
          localStorage.setItem("aadhaarConnected", "true");
          sessionStorage.setItem("redirectToaddhar", "true");
        } catch (e) {
          console.error("Error storing aadhaar connection status:", e);
        }

        // Mark as verified before redirect
        setIsVerified(true);

        // Navigate to the redirect URL
        window.location.href = data.url;
      } else {
        showNotification({
          type: "error",
          message: response?.data?.message || "Failed to connect Aadhaar verification",
        });
      }
    } catch (error) {
      console.error("Error connecting Aadhaar:", error);
      showNotification({
        type: "error",
        message: error?.response?.data?.message || "Failed to connect Aadhaar verification",
      });
    } finally {
      setIsConnecting(false);
    }
  };

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
      const headers = {
        "Content-Type": "application/json",
      };

      if (companyData?.companyId || companyData?._id || companyData?.id) {
        headers["x-company-id"] = companyData?.companyId || companyData?._id || companyData?.id;
      }

      if (companyData?.domain || companyData?.companyDomain) {
        headers["x-company-domain"] = companyData?.domain || companyData?.companyDomain;
      }

      if (token) {
        headers["token"] = token;
      }

      const response = await axios.post(
        `${API_ROUTE}/api/v1/user/onboarding/getDigilockerDocuments`,
        { document_type: "AADHAAR" },
        { headers }
      );

      const { status, message } = response?.data ?? {};

      if (status === "SUCCESS") {
        setIsDownloaded(true);
        showNotification({
          type: "success",
          message: "Aadhaar document downloaded successfully",
        });
        // After download success, show upload section if both verify and download are done
        if (isVerified && !showImageUpload) {
          setShowImageUpload(true);
        }
      } else {
        showNotification({
          type: "error",
          message: response?.data?.message || "Failed to download Aadhaar document",
        });
      }
    } catch (error) {
      console.error("Error downloading Aadhaar:", error);
      showNotification({
        type: "error",
        message: error?.response?.data?.message || "Failed to download Aadhaar document",
      });
    } finally {
      setIsDownloading(false);
    }
  };

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

    if (type === "front") setFrontImage(file);
    else setBackImage(file);
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
      const formData = new FormData();
      formData.append("front_photo", frontImage);
      formData.append("back_photo", backImage);

      const headers = {
        "Content-Type": "multipart/form-data",
      };

      if (companyData?.companyId || companyData?._id || companyData?.id) {
        headers["x-company-id"] = companyData?.companyId || companyData?._id || companyData?.id;
      }

      if (companyData?.domain || companyData?.companyDomain) {
        headers["x-company-domain"] = companyData?.domain || companyData?.companyDomain;
      }

      if (token) {
        headers["token"] = token;
      }

      const response = await axios.post(
        `${API_ROUTE}/api/v1/user/onboarding/uploadAadhaarDocuments`,
        formData,
        { headers }
      );

      const { status, message } = response?.data ?? {};

      if (status === "SUCCESS") {
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
          message: "Aadhaar documents uploaded successfully",
        });
        if (onNext) onNext();
      } else {
        showNotification({
          type: "error",
          message: response?.data?.message || "Failed to upload Aadhaar documents",
        });
      }
    } catch (error) {
      console.error("Error uploading Aadhaar:", error);
      showNotification({
        type: "error",
        message: error?.response?.data?.message || "Failed to upload Aadhaar documents",
      });
    } finally {
      setIsUploading(false);
    }
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
                  disabled={!isVerified || isDownloading || isConnecting}
                  className={`
                    flex-1 px-3 sm:px-4 md:px-6 py-2 
                    h-10 sm:h-12 md:h-[52px]
                    text-xs sm:text-sm md:text-base lg:text-lg
                    rounded-xl
                    sm:rounded-2xl 
                    border-2 border-[#1B1717] border-opacity-80 
                    font-medium 
                    transition
                    ${
                      isDownloaded
                        ? "bg-green-50 text-green-700 border-green-500 cursor-default"
                        : !isVerified || isDownloading || isConnecting
                        ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-100"
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
                    flex-1 px-3 sm:px-4 md:px-6 py-2 
                    h-10 sm:h-12 md:h-[52px]
                    text-xs sm:text-sm md:text-base lg:text-lg
                    rounded-xl
                    sm:rounded-2xl 
                    font-medium 
                    transition 
                    flex items-center justify-center gap-2
                    ${
                      isVerified
                        ? "bg-green-600 text-white cursor-not-allowed"
                        : isConnecting || isDownloading
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-[#039155] text-white hover:bg-green-700"
                    }
                  `}
                >
                  {isConnecting ? (
                    "Connecting..."
                  ) : isVerified ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  hover:bg-green-700
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
              disabled={!frontImage || !backImage || isUploading}
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
                  frontImage && backImage && !isUploading
                    ? "bg-[#039155] hover:bg-green-700"
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
  );
}

export default RetailerAadhaar;
