import { useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { HiOutlineArrowNarrowLeft } from 'react-icons/hi';
import { useCompany } from "./../context/CompanyContext";
import secureLocalStorage from "react-secure-storage";
import { useNotification } from "../context/NotificationContext";
import { postProfile } from "../redux/action/retailerOnboardingAction";

function Step7({ formData, setFormData, onComplete, onBack, onShowSteps }) {
  const { referCode: urlReferralCode } = useParams();
  const dispatch = useDispatch();
  const { company } = useCompany();
  const { showNotification } = useNotification();
  const companyFromRedux = useSelector((state) => state?.company?.company);
  const companyData = companyFromRedux || company;
  const retailerOnboardingState = useSelector((state) => state?.retailerOnboarding);
  
  const {
    postProfileError,
    postProfileSuccess,
    postProfileMessage,
  } = retailerOnboardingState || {};

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const startCamera = async () => {
    try {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "user" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (frontCameraError) {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      mediaStreamRef.current = stream;
      setIsCameraActive(true);

      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;

        const handleCanPlay = () => {
          video.play().catch((err) => console.error("Error playing video:", err));
        };

        if (video.readyState >= 2) {
          video.play().catch((err) => console.error("Error playing video:", err));
        } else {
          video.addEventListener("canplay", handleCanPlay, { once: true });
        }
      }
    } catch (error) {
      alert("Unable to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach((t) => {
          t.stop();
          t.enabled = false;
        });
        mediaStreamRef.current = null;
      } catch (error) {}
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) return;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, width, height);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    stopCamera();
    setFormData((d) => ({ ...d, profilePhotoDataUrl: dataUrl }));
  };

  const handleSubmit = async () => {
    if (!formData.profilePhotoDataUrl) {
      showNotification({
        type: "error",
        message: "Please capture a profile photo first",
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

    setIsSubmitting(true);
    try {
      // eslint-disable-next-line @typescript-eslint/await-thenable
      await dispatch(postProfile(formData.profilePhotoDataUrl, companyData, token));
    } catch (error) {
      console.error("Error submitting profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Redux state changes for Profile upload
  useEffect(() => {
    const response = retailerOnboardingState?.postProfileResponse;
    const error = retailerOnboardingState?.postProfileError;
    
    if (response?.status === "SUCCESS") {
      // The steps data is in response.data (which comes from action.payload.data)
      // This contains: { steps: [...], pending: [], kycStatus, kycSteps, allCompleted }
      const stepsData = response?.data || response?.profileResponse?.data;
      
      // Store steps data in secureLocalStorage
      if (stepsData) {
        try {
          secureLocalStorage.setItem("onboardingSteps", JSON.stringify(stepsData));
          console.log("Stored onboarding steps in secureLocalStorage:", stepsData);
        } catch (e) {
          console.error("Error storing steps data in secureLocalStorage:", e);
        }
      }

      // Update formData
      if (setFormData) {
        setFormData((d) => ({ ...d, completed: true }));
      }

      // Clear temporary onboarding storage after successful completion
      try {
        localStorage.removeItem("step1Completed");
        localStorage.removeItem("referralCodeFromUrl");
        // Keep onboardingSteps and onboardingToken as they might be needed for authenticated session
        console.log("Cleared temporary onboarding storage");
      } catch (e) {
        console.error("Error clearing onboarding storage:", e);
      }

      // Show success notification first
      showNotification({
        type: "success",
        message: response?.message || "Profile uploaded successfully",
      });

      // Show steps page instead of redirecting
      if (onShowSteps) {
        setTimeout(() => {
          onShowSteps();
        }, 3000); // 3 seconds delay
      }

      if (onComplete) onComplete();
    } else if (error) {
      showNotification({
        type: "error",
        message: typeof error === "string" ? error : error?.message || "Failed to upload profile",
      });
    }
  }, [retailerOnboardingState?.postProfileResponse, retailerOnboardingState?.postProfileError, setFormData, onComplete, showNotification, onShowSteps]);

  useEffect(() => {
    if (isCameraActive && mediaStreamRef.current && videoRef.current) {
      const video = videoRef.current;
      const stream = mediaStreamRef.current;

      if (video.srcObject !== stream) video.srcObject = stream;

      const handleLoadedMetadata = () => {
        if (video.paused && isCameraActive) {
          video.play().catch((err) => console.error(err));
        }
      };

      video.addEventListener("loadedmetadata", handleLoadedMetadata);

      if (video.readyState >= 2) {
        video.play().catch((err) => console.error(err));
      }

      return () => {
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      };
    }
  }, [isCameraActive]);

  useEffect(() => stopCamera, []);

  return (
    <div className="w-full min-h-screen flex justify-center items-center bg-gray-50 px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 py-2 sm:py-3 md:py-3 lg:py-3 xl:py-4 overflow-y-auto">
      <div className="w-full max-w-[98%] sm:max-w-[400px] md:max-w-[440px] lg:max-w-[500px] xl:max-w-[540px] 2xl:max-w-[580px] my-auto">
        <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg p-2.5 sm:p-3 md:p-3 lg:p-3 xl:p-3 space-y-1.5 sm:space-y-2 md:space-y-2 lg:space-y-2 xl:space-y-2.5">

          {/* Header with Back Button */}
          <div className="text-center mx-auto relative">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 xl:w-10 xl:h-10 border border-gray-400 rounded-full cursor-pointer hover:bg-gray-50 transition-colors flex-shrink-0 bg-transparent p-0 absolute left-0"
                aria-label="Back to Steps"
              >
                <HiOutlineArrowNarrowLeft className="text-base sm:text-lg md:text-xl lg:text-xl xl:text-xl text-[#1B1717] opacity-80" />
              </button>
            )}
            <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-2xl font-semibold text-center text-gray-800 mb-0.5 sm:mb-1 md:mb-1 lg:mb-1 xl:mb-1.5">
              Profile
            </h3>
            <p className="text-xs sm:text-xs md:text-sm lg:text-sm xl:text-base text-center text-[#1B1717] mb-1.5 sm:mb-2 md:mb-2 lg:mb-2 xl:mb-2.5">
              Profile Picture To Complete Your KYC
            </p>
          </div>

          {/* Frame */}
          <div className="w-full h-[200px] sm:h-[220px] md:h-[250px] lg:h-[280px] xl:h-[250px] mx-auto">
            <div className="border-2 border-dashed border-gray-300 rounded-lg sm:rounded-xl h-full relative overflow-hidden bg-gray-50">
              <video
                ref={videoRef}
                className={`w-full h-full object-cover rounded-lg ${
                  isCameraActive ? "block" : "hidden"
                }`}
                playsInline
                muted
                autoPlay
              />

              {/* Placeholder */}
              {!formData.profilePhotoDataUrl && !isCameraActive && (
                <button
                  type="button"
                  className="h-full flex flex-col items-center justify-center p-4 cursor-pointer absolute inset-0 bg-transparent border-0"
                  onClick={startCamera}
                  aria-label="Start camera"
                >
                  <img src="/img/Camera.png" className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 xl:w-10 xl:h-10 mb-1 sm:mb-1.5" alt="Camera" />
                </button>
              )}

              {/* Captured */}
              {formData.profilePhotoDataUrl && !isCameraActive && (
                <img
                  src={formData.profilePhotoDataUrl}
                  className="w-full h-full object-cover rounded-lg absolute inset-0"
                  alt="Profile"
                />
              )}

              {(isCameraActive || formData.profilePhotoDataUrl) && (
                <div className="absolute bottom-1.5 sm:bottom-2 md:bottom-2 lg:bottom-2.5 xl:bottom-3 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-2 md:gap-2.5 lg:gap-2.5 xl:gap-3 z-10">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData((d) => ({ ...d, profilePhotoDataUrl: "" }));
                      startCamera();
                    }}
                    disabled={isCameraActive || !formData.profilePhotoDataUrl}
                    className={`px-2.5 sm:px-3 md:px-3 lg:px-3.5 xl:px-4 py-1 sm:py-1.5 md:py-1.5 lg:py-2 xl:py-2 rounded-lg text-xs sm:text-xs md:text-xs lg:text-sm xl:text-sm font-semibold transition shadow-lg active:scale-95 ${
                      isCameraActive || !formData.profilePhotoDataUrl
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-[#039155] text-white hover:bg-green-700"
                    }`}
                  >
                    Retake
                  </button>

                  <button
                    type="button"
                    onClick={capturePhoto}
                    disabled={!isCameraActive || formData.profilePhotoDataUrl}
                    className={`px-2.5 sm:px-3 md:px-3 lg:px-3.5 xl:px-4 py-1 sm:py-1.5 md:py-1.5 lg:py-2 xl:py-2 rounded-lg text-xs sm:text-xs md:text-xs lg:text-sm xl:text-sm font-semibold transition shadow-lg active:scale-95 ${
                      !isCameraActive || formData.profilePhotoDataUrl
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-[#039155] text-white hover:bg-green-700"
                    }`}
                  >
                    Capture
                  </button>
                </div>
              )}
            </div>

            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Guidelines */}
          <div className="w-full mx-auto">
            <div className="bg-green-50 border border-green-200 rounded-lg sm:rounded-xl p-2 sm:p-2.5 md:p-2.5 lg:p-3 xl:p-3">
              <ul className="space-y-1.5 sm:space-y-1.5 md:space-y-2 lg:space-y-2 xl:space-y-2.5">
                <li className="flex items-start gap-1.5 sm:gap-2 md:gap-2 lg:gap-2.5 xl:gap-2.5">
                  <div className="w-1.5 h-1.5 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 lg:w-2 lg:h-2 xl:w-2.5 xl:h-2.5 rounded-full bg-[#039155] mt-0.5 sm:mt-1 md:mt-1 lg:mt-1.5 xl:mt-1.5 flex-shrink-0" />
                  <span className="text-xs sm:text-xs md:text-xs lg:text-sm xl:text-sm text-[#1B1717]">
                    Capture A Clear Photo
                  </span>
                </li>

                <li className="flex items-start gap-1.5 sm:gap-2 md:gap-2 lg:gap-2.5 xl:gap-2.5">
                  <div className="w-1.5 h-1.5 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 lg:w-2 lg:h-2 xl:w-2.5 xl:h-2.5 rounded-full bg-[#039155] mt-0.5 sm:mt-1 md:mt-1 lg:mt-1.5 xl:mt-1.5 flex-shrink-0" />
                  <span className="text-xs sm:text-xs md:text-xs lg:text-sm xl:text-sm text-[#1B1717]">
                    Good Lighting Required – Avoid Dark Or Blurry Images.
                  </span>
                </li>

                <li className="flex items-start gap-1.5 sm:gap-2 md:gap-2 lg:gap-2.5 xl:gap-2.5">
                  <div className="w-1.5 h-1.5 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 lg:w-2 lg:h-2 xl:w-2.5 xl:h-2.5 rounded-full bg-[#039155] mt-0.5 sm:mt-1 md:mt-1 lg:mt-1.5 xl:mt-1.5 flex-shrink-0" />
                  <span className="text-xs sm:text-xs md:text-xs lg:text-sm xl:text-sm text-[#1B1717]">
                    Your Aadhaar Photo And Uploaded Profile Picture Must Match.
                  </span>
                </li>
              </ul>
            </div>

            {/* Submit */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.profilePhotoDataUrl}
              className={`w-full py-1.5 sm:py-2 md:py-2 lg:py-2 xl:py-2.5 rounded-lg sm:rounded-xl text-white text-xs sm:text-xs md:text-sm lg:text-sm xl:text-base font-semibold h-8 sm:h-9 md:h-9 lg:h-10 xl:h-11 transition mt-2 sm:mt-2.5 md:mt-3 lg:mt-3 xl:mt-3.5 shadow-lg ${
                isSubmitting || !formData.profilePhotoDataUrl
                  ? "bg-[#039155] opacity-60 cursor-not-allowed"
                  : "bg-[#039155] hover:bg-green-700 active:scale-95"
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Step7;
