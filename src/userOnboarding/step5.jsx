import { useRef, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { HiOutlineArrowNarrowLeft } from 'react-icons/hi';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { postShopDetails } from '../redux/action/retailerOnboardingAction';
import { getLocationAndIP } from '../util/getLocationAndIP';
import { useCompany } from '../context/CompanyContext';
import { useNotification } from '../context/NotificationContext';
import secureLocalStorage from 'react-secure-storage';

function Step5({ formData, setFormData, onComplete, onBack }) {
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
  } = useSelector(state => state.retailerOnboarding);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Validation schema
  const validationSchema = Yup.object({
    shopName: Yup.string()
      .min(2, 'Shop name must be at least 2 characters')
      .max(100, 'Shop name must be less than 100 characters')
      .required('Shop name is required'),
  });

  // Formik setup
  const formik = useFormik({
    initialValues: {
      shopName: formData.shopName || '',
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
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' }, // Back camera for shop photos
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
          video.play().catch(err => console.error('Error playing video:', err));
        };

        if (video.readyState >= 2) {
          video.play().catch(err => console.error('Error playing video:', err));
        } else {
          video.addEventListener('canplay', handleCanPlay, { once: true });
        }
      }
    } catch (error) {
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach(t => {
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

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, width, height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    stopCamera();
    setFormData(d => ({ ...d, shopPhotoDataUrl: dataUrl }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    formik.setFieldValue(name, value);
    setFormData(d => ({ ...d, [name]: value }));
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
    await formik.validateField('shopName');
    
    if (formik.errors.shopName) {
      formik.setTouched({ shopName: true });
      showNotification({
        type: 'error',
        message: formik.errors.shopName,
      });
      return;
    }

    // Use formik value for shop name
    const shopName = formik.values.shopName || formData.shopName;
    
    if (!shopName) {
      showNotification({
        type: 'error',
        message: 'Please enter shop name.',
      });
      return;
    }
    
    if (!formData.shopPhotoDataUrl) {
      showNotification({
        type: 'error',
        message: 'Please capture shop photo.',
      });
      return;
    }

    const token = getToken();
    if (!token) {
      showNotification({
        type: 'error',
        message: 'Onboarding token not found. Please try again.',
      });
      console.error('Token not found in secureLocalStorage');
      return;
    }

    // Log companyData and token for debugging
    console.log("postShopDetails - companyData:", companyData);
    console.log("postShopDetails - token:", token ? "present" : "missing");
    console.log("postShopDetails - Headers will include:", {
      "x-company-id": companyData?.companyId || companyData?._id || companyData?.id || "not set",
      "x-company-domain": companyData?.domain || companyData?.companyDomain || "not set",
      "token": token ? "present" : "missing"
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
      console.error('Error getting location and IP:', error);
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
        const shopDetailsData = postShopDetailsResponse?.shopDetailsResponse || {};
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
        message: postShopDetailsMessage || postShopDetailsResponse?.message || "Shop details saved successfully",
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
    }
  }, [postShopDetailsSuccess, postShopDetailsResponse, postShopDetailsMessage, showNotification]);

  // Handle error notifications
  useEffect(() => {
    if (postShopDetailsError) {
      const errorMessage = typeof postShopDetailsError === "string" 
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
          video.play().catch(err => console.error(err));
        }
      };

      video.addEventListener('loadedmetadata', handleLoadedMetadata);

      if (video.readyState >= 2) {
        video.play().catch(err => console.error(err));
      }

      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, [isCameraActive]);

  useEffect(() => stopCamera, []);

  return (
    <div className="w-full min-h-screen flex justify-center items-center bg-gray-50 px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 py-2 sm:py-3 md:py-3 lg:py-3 xl:py-4 overflow-y-auto">
      <div className="w-full max-w-[98%] sm:max-w-[480px] md:max-w-[520px] lg:max-w-[600px] xl:max-w-[650px] 2xl:max-w-[700px] my-auto">
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
              Shop Details
            </h3>
            <p className="text-xs sm:text-xs md:text-sm lg:text-sm xl:text-base text-center text-[#1B1717] mb-1.5 sm:mb-2 md:mb-2 lg:mb-2 xl:mb-2.5">
              Enter Shop Name And Capture Shop Photo To Complete Your KYC
            </p>
          </div>

          {/* Shop Name Input */}
          <div className="w-full mx-auto">
            <input
              type="text"
              id="shopName"
              name="shopName"
              value={formik.values.shopName}
              onChange={handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter Shop Name"
              className={`!w-full !px-3 sm:!px-4 md:!px-4 lg:!px-4 xl:!px-5 !py-2 sm:!py-2 md:!py-2.5 lg:!py-2.5 xl:!py-3 !border-2 !rounded-lg sm:!rounded-xl !text-xs sm:!text-sm md:!text-sm lg:!text-sm xl:!text-base !focus:outline-none !focus:ring-2 !focus:ring-[#039155] !focus:border-transparent !h-9 sm:!h-10 md:!h-11 lg:!h-11 xl:!h-12 ${
                formik.errors.shopName && formik.touched.shopName
                  ? '!border-red-500'
                  : '!border-gray-300'
              }`}
            />
            {formik.errors.shopName && formik.touched.shopName && (
              <p className="text-red-500 text-xs sm:text-xs md:text-xs lg:text-sm mt-0.5 sm:mt-1">
                {formik.errors.shopName}
              </p>
            )}
          </div>

          {/* Frame */}
          <div className="w-full h-[140px] sm:h-[160px] md:h-[170px] lg:h-[180px] xl:h-[190px] mx-auto">
            <div className="border-2 border-dashed border-gray-300 rounded-lg sm:rounded-xl h-full relative overflow-hidden bg-gray-50">

              <video
                ref={videoRef}
                className={`w-full h-full object-cover rounded-lg ${isCameraActive ? 'block' : 'hidden'}`}
                playsInline
                muted
                autoPlay
              />

              {/* Placeholder */}
              {!formData.shopPhotoDataUrl && !isCameraActive && (
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
              {formData.shopPhotoDataUrl && !isCameraActive && (
                <img
                  src={formData.shopPhotoDataUrl}
                  className="w-full h-full object-cover rounded-lg absolute inset-0"
                  alt="Shop"
                />
              )}

              {(isCameraActive || formData.shopPhotoDataUrl) && (
                <div className="absolute bottom-1.5 sm:bottom-2 md:bottom-2 lg:bottom-2.5 xl:bottom-3 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-2 md:gap-2.5 lg:gap-2.5 xl:gap-3 z-10">
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      setFormData(d => ({ ...d, shopPhotoDataUrl: '' }));
                      startCamera();
                    }}
                    className="bg-[#039155] text-white px-2.5 sm:px-3 md:px-3 lg:px-3.5 xl:px-4 py-1 sm:py-1.5 md:py-1.5 lg:py-2 xl:py-2 rounded-lg text-xs sm:text-xs md:text-xs lg:text-sm xl:text-sm font-semibold hover:bg-green-700 transition shadow-lg active:scale-95"
                  >
                    Retake
                  </button>

                  <button
                    type="button"
                    onClick={capturePhoto}
                    disabled={!isCameraActive}
                    className={`px-2.5 sm:px-3 md:px-3 lg:px-3.5 xl:px-4 py-1 sm:py-1.5 md:py-1.5 lg:py-2 xl:py-2 rounded-lg text-xs sm:text-xs md:text-xs lg:text-sm xl:text-sm font-semibold transition shadow-lg active:scale-95 ${
                      isCameraActive
                        ? 'bg-[#039155] text-white hover:bg-green-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
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
                    Ensure The Shop Photo Clearly Shows Your Shop Signage Or Storefront.
                  </span>
                </li>
              </ul>
            </div>

            {/* Submit */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={postShopDetailsLoading || !formData.shopName || !formData.shopPhotoDataUrl}
              className={`w-full py-1.5 sm:py-2 md:py-2 lg:py-2 xl:py-2.5 rounded-lg sm:rounded-xl text-white text-xs sm:text-xs md:text-sm lg:text-sm xl:text-base font-semibold h-8 sm:h-9 md:h-9 lg:h-10 xl:h-11 transition mt-2 sm:mt-2.5 md:mt-3 lg:mt-3 xl:mt-3.5 shadow-lg ${
                postShopDetailsLoading || !formData.shopName || !formData.shopPhotoDataUrl
                  ? 'bg-[#039155] opacity-60 cursor-not-allowed'
                  : 'bg-[#039155] hover:bg-green-700 active:scale-95'
              }`}
            >
              {postShopDetailsLoading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Step5;
