import { useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { useCompany } from "./../context/CompanyContext";
import secureLocalStorage from "react-secure-storage";
import { useNotification } from "../context/NotificationContext";
import { postProfile } from "../redux/action/retailerOnboardingAction";

function Step7({ formData, setFormData, onComplete }) {
  const { referCode: urlReferralCode } = useParams();
  const navigate = useNavigate();
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

      showNotification({
        type: "success",
        message: response?.message || "Profile uploaded successfully",
      });

      // Navigate to /unity/{referCode} or /unity after a short delay
      setTimeout(() => {
        const referCode = getReferCode();
        if (referCode) {
          navigate(`/unity/${referCode}`);
        } else {
          navigate("/unity");
        }
      }, 500);

      if (onComplete) onComplete();
    } else if (error) {
      showNotification({
        type: "error",
        message: typeof error === "string" ? error : error?.message || "Failed to upload profile",
      });
    }
  }, [retailerOnboardingState?.postProfileResponse, retailerOnboardingState?.postProfileError, setFormData, onComplete, navigate, showNotification]);

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
    <div className="flex justify-center items-center bg-gray-50 p-2 xxs:p-0">
      <div
        className="
          bg-white rounded-lg 
          w-full 
          xxs:w-[95%] xs:w-[90%] sm:w-[85%] 
          md:w-[734px] lg:w-[900px] 
          shadow-md 
          p-3 xxs:p-2 sm:p-4 md:p-6 lg:p-8
        "
      >
        {/* Heading */}
        <h3
          className="
            text-center 
            text-[18px] xxs:text-[17px] xs:text-[18px] 
            sm:text-[22px] 
            md:text-[24px] lg:text-[30px]
            font-semibold text-gray-800
          "
        >
          Profile
        </h3>

        <p
          className="
            text-center text-[13px] xxs:text-[12px] xs:text-[13px]
            sm:text-[14px]
            md:text-[16px] lg:text-[18px]
            text-[#1B1717] mt-3 mb-4
          "
        >
          Profile Picture To Complete Your KYC
        </p>

        {/* Frame */}
        <div
          className="
            mx-auto mb-4 
            w-full 
            xxs:w-[260px] xs:w-[300px] sm:w-[380px]
            md:w-[534px] lg:w-[650px]
            h-[180px] xxs:h-[170px] xs:h-[190px] sm:h-[240px]
            md:h-[276px] lg:h-[350px]

            xxs:mr-4
            xl:mr-24          "
        >
          <div className="border-2 border-dashed border-black/30 rounded-lg h-full relative overflow-hidden bg-gray-50">
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
              <div
                className="h-full flex flex-col items-center justify-center p-4 cursor-pointer absolute inset-0"
                onClick={startCamera}
              >
                <img src="/img/Camera.png" className="w-10 h-10 xs:w-12 xs:h-12" />
              </div>
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
              <div
                className="
                  absolute bottom-3 left-1/2 -translate-x-1/2 
                  flex gap-2 xxs:gap-1 xs:gap-2
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
                    px-3 xxs:px-2 xs:px-3 sm:px-4 md:px-6 
                    py-1 xxs:py-0.5 xs:py-1 md:py-2
                    rounded-lg 
                    text-[12px] xxs:text-[11px] sm:text-[13px] md:text-[16px]
                    font-medium 
                    hover:bg-green-700 transition shadow-md
                  "
                >
                  Retake
                </button>

                <button
                  onClick={capturePhoto}
                  disabled={!isCameraActive}
                  className={`
                    px-3 xxs:px-2 xs:px-3 sm:px-4 md:px-6
                    py-1 xxs:py-0.5 xs:py-1 md:py-2
                    rounded-lg
                    text-[12px] xxs:text-[11px] sm:text-[13px] md:text-[16px]
                    font-medium transition shadow-md
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
        <div
          className="
            mx-auto 
            w-full 
            xxs:w-[260px] xs:w-[300px] sm:w-[380px]
            md:w-[534px] lg:w-[650px]
          "
        >
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 xxs:p-2 sm:p-4 md:p-6">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#039155] mt-2" />
                <span className="text-[12px] xxs:text-[11px] sm:text-[13px] md:text-[16px] text-[#1B1717]">
                  Capture A Clear Photo
                </span>
              </li>

              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#039155] mt-2" />
                <span className="text-[12px] xxs:text-[11px] sm:text-[13px] md:text-[16px] text-[#1B1717]">
                  Good Lighting Required – Avoid Dark Or Blurry Images.
                </span>
              </li>

              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#039155] mt-2" />
                <span className="text-[12px] xxs:text-[11px] sm:text-[13px] md:text-[16px] text-[#1B1717]">
                  Your Aadhaar Photo And Uploaded Profile Picture Must Match.
                </span>
              </li>
            </ul>
          </div>

          {/* Error */}
          {postProfileError && (
            <div className="w-full p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-[12px] sm:text-[14px] md:text-[16px] mb-4 mt-4">
              {typeof postProfileError === "string" ? postProfileError : postProfileError?.message || "Failed to upload profile"}
            </div>
          )}

          {/* Success */}
          {postProfileSuccess && postProfileMessage && (
            <div className="w-full p-2 sm:p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-[12px] sm:text-[14px] md:text-[16px] mb-4 mt-4">
              {postProfileMessage}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.profilePhotoDataUrl}
            className={`
              w-full 
              py-2 xxs:py-1.5 xs:py-2 md:py-3 
              rounded-lg text-white 
              text-[16px] xxs:text-[15px] xs:text-[16px] sm:text-[18px] md:text-[24px] lg:text-[26px]
              font-medium 
              h-[45px] xxs:h-[42px] xs:h-[45px] md:h-[60px] lg:h-[70px]
              transition mt-5
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
