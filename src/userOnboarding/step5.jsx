import { useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { HiOutlineArrowNarrowLeft } from "react-icons/hi";
import { useFormik } from "formik";
import * as Yup from "yup";
import { postShopDetails } from "../redux/action/retailerOnboardingAction";
import { getLocationAndIP } from "../util/getLocationAndIP";
import { useCompany } from "../context/CompanyContext";
import { useNotification } from "../context/NotificationContext";
import secureLocalStorage from "react-secure-storage";

function Step5({ formData, setFormData, onComplete, onBack, onShowSteps }) {
  const { referCode: urlReferralCode } = useParams();
  const dispatch = useDispatch();
  const { company } = useCompany();
  const { showNotification } = useNotification();
  const companyFromRedux = useSelector((state) => state?.company?.company);
  const companyData = companyFromRedux || company;

  const {
    postShopDetailsLoading,
    postShopDetailsError,
    postShopDetailsSuccess,
    postShopDetailsMessage,
    postShopDetailsResponse,
  } = useSelector((state) => state.retailerOnboarding);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Validation schema
  const validationSchema = Yup.object({
    shopName: Yup.string()
      .min(2, "Shop name must be at least 2 characters")
      .max(100, "Shop name must be less than 100 characters")
      .required("Shop name is required"),
  });

  // Formik setup
  const formik = useFormik({
    initialValues: {
      shopName: formData.shopName || "",
    },
    validationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    enableReinitialize: true,
    onSubmit: async () => {
      // Validation is handled in handleSubmit
    },
  });

  const startCamera = async () => {
    try {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" }, // Back camera for shop photos
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (backCameraError) {
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
    setFormData((d) => ({ ...d, shopPhotoDataUrl: dataUrl }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    formik.setFieldValue(name, value);
    setFormData((d) => ({ ...d, [name]: value }));
  };

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

  const handleSubmit = async () => {
    // Validate shop name using Formik
    await formik.validateField("shopName");

    if (formik.errors.shopName) {
      formik.setTouched({ shopName: true });
      showNotification({
        type: "error",
        message: formik.errors.shopName,
      });
      return;
    }

    // Use formik value for shop name
    const shopName = formik.values.shopName || formData.shopName;

    if (!shopName) {
      showNotification({
        type: "error",
        message: "Please enter shop name.",
      });
      return;
    }

    if (!formData.shopPhotoDataUrl) {
      showNotification({
        type: "error",
        message: "Please capture shop photo.",
      });
      return;
    }

    const token = getToken();
    if (!token) {
      showNotification({
        type: "error",
        message: "Onboarding token not found. Please try again.",
      });
      console.error("Token not found in secureLocalStorage");
      return;
    }

    // Log companyData and token for debugging
    console.log("postShopDetails - companyData:", companyData);
    console.log("postShopDetails - token:", token ? "present" : "missing");
    console.log("postShopDetails - Headers will include:", {
      "x-company-id":
        companyData?.companyId ||
        companyData?._id ||
        companyData?.id ||
        "not set",
      "x-company-domain":
        companyData?.domain || companyData?.companyDomain || "not set",
      token: token ? "present" : "missing",
    });

    try {
      // Get location and IP address
      const locationIPData = await getLocationAndIP();

      const requestBody = {
        shopName: shopName,
        shopImage: formData.shopPhotoDataUrl,
        ipAddress: locationIPData.ipAddress,
        longitude: locationIPData.location.longitude,
        latitude: locationIPData.location.latitude,
      };

      dispatch(postShopDetails(requestBody, companyData, token));
    } catch (error) {
      console.error("Error getting location and IP:", error);
      // Still submit without location/IP if there's an error
      const requestBody = {
        shopName: shopName,
        shopImage: formData.shopPhotoDataUrl,
        ipAddress: null,
        longitude: null,
        latitude: null,
      };
      dispatch(postShopDetails(requestBody, companyData, token));
    }
  };

  useEffect(() => {
    if (postShopDetailsSuccess && postShopDetailsResponse) {
      // Save steps to localStorage
      try {
        // The response structure: { shopDetailsResponse: { steps: [...], pending: [...] }, status, message }
        const shopDetailsData =
          postShopDetailsResponse?.shopDetailsResponse || {};
        const stepsData = {
          steps: shopDetailsData?.steps || [],
          pending: shopDetailsData?.pending || [],
          status: postShopDetailsResponse?.status || "SUCCESS",
          message: postShopDetailsResponse?.message || "Shop details saved",
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem("onboardingSteps", JSON.stringify(stepsData));
        console.log("Steps saved to localStorage:", stepsData);
      } catch (error) {
        console.error("Error saving steps to localStorage:", error);
      }

      // Show success notification
      showNotification({
        type: "success",
        message:
          postShopDetailsMessage ||
          postShopDetailsResponse?.message ||
          "Shop details saved successfully",
      });

      // Show steps page instead of redirecting
      if (onShowSteps) {
        setTimeout(() => {
          onShowSteps();
        }, 500);
      }
    }
  }, [
    postShopDetailsSuccess,
    postShopDetailsResponse,
    postShopDetailsMessage,
    showNotification,
    onShowSteps,
  ]);

  // Handle error notifications
  useEffect(() => {
    if (postShopDetailsError) {
      const errorMessage =
        typeof postShopDetailsError === "string"
          ? postShopDetailsError
          : postShopDetailsError?.message || "Failed to submit shop details";

      showNotification({
        type: "error",
        message: errorMessage,
      });
    }
  }, [postShopDetailsError, showNotification]);

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
    <div className="w-full min-h-screen flex justify-center items-center bg-gray-50 p-2 sm:p-3 md:p-4 overflow-y-auto">
      <div className="w-full max-w-[98%] sm:max-w-[480px] md:max-w-[520px] lg:max-w-[580px] xl:max-w-[600px] 2xl:max-w-[700px] mx-auto">
        <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg p-3 sm:p-4 md:p-5 lg:p-5 xl:p-6 space-y-3">
          {/* HEADER */}
          <div className="relative text-center px-8 sm:px-10">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 border border-gray-400 rounded-full flex items-center justify-center hover:bg-gray-50 transition"
                aria-label="Back to Steps"
              >
                <HiOutlineArrowNarrowLeft className="text-lg text-[#1B1717]" />
              </button>
            )}

            <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-[gilroy-semibold] text-[#1B1717]">
              Shop Details
            </h3>

            <p className="text-xs sm:text-sm md:text-sm lg:text-base text-[#1B1717]/70 font-[gilroy-medium] mt-1 max-w-[90%] mx-auto">
              Enter Shop Name And Capture Shop Photo To Complete Your KYC
            </p>
          </div>

          {/* SHOP NAME INPUT (REFERENCE MATCHED) */}
          <div className="relative">
            <img
              src="/img/ShopIcon.png"
              alt="Shop Name"
              className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-[#1B1717]/70 z-10"
            />

            <div
              className={`absolute left-9 md:left-11 top-1/2 -translate-y-1/2 h-4 md:h-5 w-px transition ${
                formik.values.shopName ? "bg-[#1B1717]" : "bg-gray-300"
              }`}
            />

            <input
              id="shopName"
              type="text"
              name="shopName"
              value={formik.values.shopName}
              onChange={handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter Shop Name"
              className={`w-full h-10 md:h-11 lg:h-14 border-[0.5px]
              font-[gilroy-medium]
              ${
                formik.errors.shopName && formik.touched.shopName
                  ? "border-red-500"
                  : "border-[#1B1717]/80"
              }
              rounded-lg
              pl-10 md:pl-12 lg:pl-14
              pr-3
              text-sm md:text-base
              outline-none
              focus:border-[#1B1717]/80
              transition
            `}
            />
          </div>

          {formik.errors.shopName && formik.touched.shopName && (
            <p className="text-red-500 text-xs md:text-sm mt-1.5">
              {formik.errors.shopName}
            </p>
          )}

          {/* CAMERA FRAME */}
          <div className="w-full h-[170px] sm:h-[180px] md:h-[190px] lg:h-[200px]">
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

              {!formData.shopPhotoDataUrl && !isCameraActive && (
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

              {formData.shopPhotoDataUrl && !isCameraActive && (
                <img
                  src={formData.shopPhotoDataUrl}
                  className="absolute inset-0 w-full h-full object-cover rounded-lg"
                  alt="Shop"
                />
              )}

              {(isCameraActive || formData.shopPhotoDataUrl) && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData((d) => ({ ...d, shopPhotoDataUrl: "" }));
                      startCamera();
                    }}
                    disabled={isCameraActive || !formData.shopPhotoDataUrl}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow ${
                      isCameraActive || !formData.shopPhotoDataUrl
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-[#039155] text-white hover:bg-green-700"
                    }`}
                  >
                    Retake
                  </button>

                  <button
                    type="button"
                    onClick={capturePhoto}
                    disabled={!isCameraActive || formData.shopPhotoDataUrl}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow ${
                      !isCameraActive || formData.shopPhotoDataUrl
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

          {/* GUIDELINES */}
          <div className="bg-green-50 border border-green-200 rounded-lg sm:rounded-xl p-3 space-y-2">
            {[
              "Capture A Clear Photo",
              "Good Lighting Required – Avoid Dark Or Blurry Images.",
              "Ensure The Shop Photo Clearly Shows Your Shop Signage Or Storefront.",
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-2 h-2 mt-1 rounded-full bg-[#039155]" />
                <span className="text-xs sm:text-sm text-[#1B1717]">
                  {text}
                </span>
              </div>
            ))}
          </div>

          {/* SUBMIT */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              postShopDetailsLoading ||
              !formData.shopName ||
              !formData.shopPhotoDataUrl
            }
            className={`w-full h-10 sm:h-11 md:h-12 rounded-lg sm:rounded-xl font-semibold text-sm text-white shadow-lg transition ${
              postShopDetailsLoading ||
              !formData.shopName ||
              !formData.shopPhotoDataUrl
                ? "bg-[#039155]/60 cursor-not-allowed"
                : "bg-[#039155] hover:bg-green-700"
            }`}
          >
            {postShopDetailsLoading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Step5;
