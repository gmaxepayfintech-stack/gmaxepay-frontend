import { useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { HiOutlineArrowNarrowLeft } from "react-icons/hi";
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
  const retailerOnboardingState = useSelector(
    (state) => state?.retailerOnboarding
  );

  const { postProfileError, postProfileSuccess, postProfileMessage } =
    retailerOnboardingState || {};

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
          video
            .play()
            .catch((err) => console.error("Error playing video:", err));
        };

        if (video.readyState >= 2) {
          video
            .play()
            .catch((err) => console.error("Error playing video:", err));
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
      await dispatch(
        postProfile(formData.profilePhotoDataUrl, companyData, token)
      );
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
          secureLocalStorage.setItem(
            "onboardingSteps",
            JSON.stringify(stepsData)
          );
          console.log(
            "Stored onboarding steps in secureLocalStorage:",
            stepsData
          );
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
        message:
          typeof error === "string"
            ? error
            : error?.message || "Failed to upload profile",
      });
    }
  }, [
    retailerOnboardingState?.postProfileResponse,
    retailerOnboardingState?.postProfileError,
    setFormData,
    onComplete,
    showNotification,
    onShowSteps,
  ]);

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
          {/* Header */}
          <div className="text-center mx-auto relative">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 xl:w-10 xl:h-10 border border-gray-400 rounded-full cursor-pointer hover:bg-gray-50 transition-colors bg-transparent p-0 absolute left-0"
                aria-label="Back to Steps"
              >
                <HiOutlineArrowNarrowLeft className="text-base sm:text-lg md:text-xl text-[#1B1717] opacity-80" />
              </button>
            )}

            <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-800 mb-1">
              Profile
            </h3>
            <p className="text-xs sm:text-sm md:text-sm lg:text-base text-[#1B1717] mb-2">
              Profile Picture To Complete Your KYC
            </p>
          </div>

          {/* CAMERA FRAME (unchanged) */}
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

              {!formData.profilePhotoDataUrl && !isCameraActive && (
                <button
                  type="button"
                  className="absolute inset-0 flex items-center justify-center"
                  onClick={startCamera}
                >
                  <img
                    src="/img/Camera.png"
                    className="w-8 h-8 sm:w-10 sm:h-10"
                    alt="Camera"
                  />
                </button>
              )}

              {formData.profilePhotoDataUrl && !isCameraActive && (
                <img
                  src={formData.profilePhotoDataUrl}
                  className="absolute inset-0 w-full h-full object-cover rounded-lg"
                  alt="Profile"
                />
              )}

              {(isCameraActive || formData.profilePhotoDataUrl) && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData((d) => ({ ...d, profilePhotoDataUrl: "" }));
                      startCamera();
                    }}
                    disabled={isCameraActive || !formData.profilePhotoDataUrl}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow ${
                      isCameraActive || !formData.profilePhotoDataUrl
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-[#039155] text-white hover:bg-green-700"
                    }`}
                  >
                    Retake
                  </button>

                  <button
                    type="button"
                    onClick={capturePhoto}
                    disabled={!isCameraActive || formData.profilePhotoDataUrl}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow ${
                      !isCameraActive || formData.profilePhotoDataUrl
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-[#039155] text-white hover:bg-green-700"
                    }`}
                  >
                    Capture
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* GUIDELINES (unchanged) */}
          <div className="bg-green-50 border border-green-200 rounded-lg sm:rounded-xl p-3">
            <ul className="space-y-2">
              <li className="flex gap-2 text-xs sm:text-sm text-[#1B1717]">
                <span className="w-2 h-2 mt-1 rounded-full bg-[#039155]" />
                Capture A Clear Photo
              </li>
              <li className="flex gap-2 text-xs sm:text-sm text-[#1B1717]">
                <span className="w-2 h-2 mt-1 rounded-full bg-[#039155]" />
                Good Lighting Required – Avoid Dark Or Blurry Images.
              </li>
              <li className="flex gap-2 text-xs sm:text-sm text-[#1B1717]">
                <span className="w-2 h-2 mt-1 rounded-full bg-[#039155]" />
                Your Aadhaar Photo And Uploaded Profile Picture Must Match.
              </li>
            </ul>
          </div>

          {/* SUBMIT — MATCHES MOBILE VERIFICATION */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.profilePhotoDataUrl}
            className={`w-full
            h-10 md:h-11 lg:h-14
            bg-[#039155]
            text-white
            rounded-lg md:rounded-xl
            font-[gilroy-semibold]
            text-sm md:text-base
            transition
            shadow-lg
            flex items-center justify-center
            ${
              isSubmitting || !formData.profilePhotoDataUrl
                ? "bg-gray-400 cursor-not-allowed"
                : "hover:bg-green-700"
            }
          `}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Step7;
