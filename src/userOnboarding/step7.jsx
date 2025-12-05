import { useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useCompany } from "./../context/CompanyContext";
import secureLocalStorage from "react-secure-storage";
import { useNotification } from "../context/NotificationContext";
import { postProfile } from "../redux/action/retailerOnboardingAction";

function Step7({ formData, setFormData, onComplete }) {
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

      // Show success notification first
      showNotification({
        type: "success",
        message: response?.message || "Profile uploaded successfully",
      });

      // Redirect to KYC index page using window.location.href after 3 seconds
      setTimeout(() => {
        const referCode = getReferCode();
        if (referCode) {
          window.location.href = `/unity/${referCode}`;
        } else {
          window.location.href = `/unity`;
        }
      }, 3000); // 3 seconds delay

      if (onComplete) onComplete();
    } else if (error) {
      showNotification({
        type: "error",
        message: typeof error === "string" ? error : error?.message || "Failed to upload profile",
      });
    }
  }, [retailerOnboardingState?.postProfileResponse, retailerOnboardingState?.postProfileError, setFormData, onComplete, showNotification]);

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
    <div className="flex justify-center items-center bg-gray-50 p-3 sm:p-4 md:p-6 lg:p-8">
      <div
        className="
          bg-white rounded-xl sm:rounded-2xl
          w-full max-w-[95%]
          sm:max-w-[550px] md:max-w-[600px] 
          lg:max-w-[700px] xl:max-w-[800px]
          shadow-lg 
          p-5 sm:p-6 md:p-8 lg:p-10
        "
      >
        {/* Heading */}
        <h3
          className="
            text-center 
            text-lg sm:text-xl md:text-2xl 
            lg:text-3xl xl:text-4xl
            font-semibold text-gray-800
            mb-3 sm:mb-4 md:mb-5 lg:mb-6
          "
        >
          Profile
        </h3>

        <p
          className="
            text-center text-sm sm:text-base md:text-lg 
            lg:text-xl
            text-[#1B1717] mb-5 sm:mb-6 md:mb-7 lg:mb-8
          "
        >
          Profile Picture To Complete Your KYC
        </p>

        {/* Frame */}
        <div
          className="
            mx-auto mb-5 sm:mb-6 md:mb-7 lg:mb-8
            w-full 
            h-[200px] sm:h-[250px] md:h-[300px]
            lg:h-[350px] xl:h-[400px]
          "
        >
          <div className="border-2 border-dashed border-black/30 rounded-xl h-full relative overflow-hidden bg-gray-50">
            <video
              ref={videoRef}
              className={`w-full h-full object-cover rounded-xl ${
                isCameraActive ? "block" : "hidden"
              }`}
              playsInline
              muted
              autoPlay
            />

            {/* Placeholder */}
            {!formData.profilePhotoDataUrl && !isCameraActive && (
              <div
                className="h-full flex flex-col items-center justify-center p-4 cursor-pointer absolute inset-0"
                onClick={startCamera}
              >
                <img src="/img/Camera.png" className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16" alt="Camera" />
              </div>
            )}

            {/* Captured */}
            {formData.profilePhotoDataUrl && !isCameraActive && (
              <img
                src={formData.profilePhotoDataUrl}
                className="w-full h-full object-cover rounded-xl absolute inset-0"
                alt="Profile"
              />
            )}

            {(isCameraActive || formData.profilePhotoDataUrl) && (
              <div
                className="
                  absolute bottom-3 sm:bottom-4 md:bottom-5 left-1/2 -translate-x-1/2 
                  flex gap-3 sm:gap-4 md:gap-5
                  z-10
                "
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFormData((d) => ({ ...d, profilePhotoDataUrl: "" }));
                    startCamera();
                  }}
                  className="
                    bg-[#039155] text-white 
                    px-4 sm:px-5 md:px-6 lg:px-7 
                    py-2 sm:py-2.5 md:py-3 lg:py-3.5
                    rounded-lg 
                    text-sm sm:text-base md:text-lg lg:text-xl
                    font-semibold 
                    hover:bg-green-700 transition shadow-lg active:scale-95
                  "
                >
                  Retake
                </button>

                <button
                  onClick={capturePhoto}
                  disabled={!isCameraActive}
                  className={`
                    px-4 sm:px-5 md:px-6 lg:px-7
                    py-2 sm:py-2.5 md:py-3 lg:py-3.5
                    rounded-lg
                    text-sm sm:text-base md:text-lg lg:text-xl
                    font-semibold transition shadow-lg active:scale-95
                    ${
                      isCameraActive
                        ? "bg-[#039155] text-white hover:bg-green-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }
                  `}
                >
                  Capture
                </button>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Guidelines */}
        <div className="mx-auto w-full">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-5 md:p-6 lg:p-7">
            <ul className="space-y-2 sm:space-y-3 md:space-y-4">
              <li className="flex items-start gap-3 sm:gap-4">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#039155] mt-2 sm:mt-2.5" />
                <span className="text-sm sm:text-base md:text-lg lg:text-xl text-[#1B1717]">
                  Capture A Clear Photo
                </span>
              </li>

              <li className="flex items-start gap-3 sm:gap-4">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#039155] mt-2 sm:mt-2.5" />
                <span className="text-sm sm:text-base md:text-lg lg:text-xl text-[#1B1717]">
                  Good Lighting Required – Avoid Dark Or Blurry Images.
                </span>
              </li>

              <li className="flex items-start gap-3 sm:gap-4">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#039155] mt-2 sm:mt-2.5" />
                <span className="text-sm sm:text-base md:text-lg lg:text-xl text-[#1B1717]">
                  Your Aadhaar Photo And Uploaded Profile Picture Must Match.
                </span>
              </li>
            </ul>
          </div>

          {/* Error */}
          {postProfileError && (
            <div className="w-full p-3 sm:p-4 md:p-5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm sm:text-base md:text-lg mb-4 sm:mb-5 mt-4 sm:mt-5">
              {typeof postProfileError === "string" ? postProfileError : postProfileError?.message || "Failed to upload profile"}
            </div>
          )}

          {/* Success */}
          {postProfileSuccess && postProfileMessage && (
            <div className="w-full p-3 sm:p-4 md:p-5 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm sm:text-base md:text-lg mb-4 sm:mb-5 mt-4 sm:mt-5">
              {postProfileMessage}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.profilePhotoDataUrl}
            className={`
              w-full 
              py-3.5 sm:py-4 md:py-5 lg:py-6 
              rounded-xl text-white 
              text-base sm:text-lg md:text-xl lg:text-2xl
              font-semibold 
              h-14 sm:h-16 md:h-[72px] lg:h-[80px]
              transition mt-6 sm:mt-7 md:mt-8 lg:mt-10
              shadow-lg
              ${
                isSubmitting || !formData.profilePhotoDataUrl
                  ? "bg-[#039155] opacity-60 cursor-not-allowed"
                  : "bg-[#039155] hover:bg-green-700 active:scale-95"
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
