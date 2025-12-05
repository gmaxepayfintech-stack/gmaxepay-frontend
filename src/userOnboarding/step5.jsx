import { useRef, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { postShopDetails } from '../redux/action/retailerOnboardingAction';
import { getLocationAndIP } from '../util/getLocationAndIP';
import { useCompany } from '../context/CompanyContext';
import { useNotification } from '../context/NotificationContext';
import secureLocalStorage from 'react-secure-storage';

function Step5({ formData, setFormData, onComplete }) {
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
    if (!formData.shopName) {
      alert('Please enter shop name.');
      return;
    }
    
    if (!formData.shopPhotoDataUrl) {
      alert('Please capture shop photo.');
      return;
    }

    const token = getToken();
    if (!token) {
      alert('Onboarding token not found. Please try again.');
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
        shopName: formData.shopName,
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
        shopName: formData.shopName,
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
    <div className="w-full h-full flex justify-center items-center bg-gray-50 p-3 sm:p-4 md:p-6 lg:p-8 overflow-hidden">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-5 sm:p-6 md:p-8 lg:p-10 w-full max-w-[95%] sm:max-w-[550px] md:max-w-[600px] lg:max-w-[700px] xl:max-w-[800px] mx-auto">

        {/* Heading */}
        <h3 className="text-center text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold text-gray-800 mb-3 sm:mb-4 md:mb-5 lg:mb-6">
          Shop Details
        </h3>

        <p className="text-center text-sm sm:text-base md:text-lg lg:text-xl text-[#1B1717] mb-5 sm:mb-6 md:mb-7 lg:mb-8">
          Enter Shop Name And Capture Shop Photo To Complete Your KYC
        </p>

        {/* Shop Name Input */}
        <div className="w-full mx-auto mb-5 sm:mb-6 md:mb-7 lg:mb-8">
          <input
            type="text"
            name="shopName"
            value={formData.shopName || ''}
            onChange={handleChange}
            placeholder="Enter Shop Name"
            className="w-full px-5 sm:px-6 md:px-7 lg:px-8 py-3 sm:py-3.5 md:py-4 lg:py-5 border-2 border-gray-300 rounded-xl text-sm sm:text-base md:text-lg lg:text-xl focus:outline-none focus:ring-2 focus:ring-[#039155] focus:border-transparent h-12 sm:h-14 md:h-16 lg:h-[72px]"
          />
        </div>

        {/* Frame */}
        <div className="w-full h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px] xl:h-[400px] mx-auto mb-5 sm:mb-6 md:mb-7 lg:mb-8">
          <div className="border-2 border-dashed border-[#1B1717]/30 rounded-xl h-full relative overflow-hidden bg-gray-50">

            <video
              ref={videoRef}
              className={`w-full h-full object-cover rounded-lg ${isCameraActive ? 'block' : 'hidden'}`}
              playsInline
              muted
              autoPlay
            />

            {/* Placeholder */}
            {!formData.shopPhotoDataUrl && !isCameraActive && (
              <div
                className="h-full flex flex-col items-center justify-center p-4 cursor-pointer absolute inset-0"
                onClick={startCamera}
              >
                <img src="/img/Camera.png" className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mb-2" alt="Camera" />
              </div>
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
              <div className="absolute bottom-3 sm:bottom-4 md:bottom-5 lg:bottom-6 left-1/2 -translate-x-1/2 flex gap-3 sm:gap-4 md:gap-5 z-10">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setFormData(d => ({ ...d, shopPhotoDataUrl: '' }));
                    startCamera();
                  }}
                  className="bg-[#039155] text-white px-4 sm:px-5 md:px-6 lg:px-7 py-2 sm:py-2.5 md:py-3 lg:py-3.5 rounded-lg text-sm sm:text-base md:text-lg lg:text-xl font-semibold hover:bg-green-700 transition shadow-lg active:scale-95"
                >
                  Retake
                </button>

                <button
                  onClick={capturePhoto}
                  disabled={!isCameraActive}
                  className={`px-4 sm:px-5 md:px-6 lg:px-7 py-2 sm:py-2.5 md:py-3 lg:py-3.5 rounded-lg text-sm sm:text-base md:text-lg lg:text-xl font-semibold transition shadow-lg active:scale-95 ${
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
          <div className="bg-green-50 border border-green-200 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 lg:p-7">
            <ul className="space-y-2.5 sm:space-y-3 md:space-y-4">
              <li className="flex items-start gap-3 sm:gap-4">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#039155] mt-1.5 sm:mt-2 md:mt-2.5 flex-shrink-0" />
                <span className="text-sm sm:text-base md:text-lg lg:text-xl text-[#1B1717]">
                  Capture A Clear Photo
                </span>
              </li>

              <li className="flex items-start gap-3 sm:gap-4">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#039155] mt-1.5 sm:mt-2 md:mt-2.5 flex-shrink-0" />
                <span className="text-sm sm:text-base md:text-lg lg:text-xl text-[#1B1717]">
                  Good Lighting Required – Avoid Dark Or Blurry Images.
                </span>
              </li>

              <li className="flex items-start gap-3 sm:gap-4">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#039155] mt-1.5 sm:mt-2 md:mt-2.5 flex-shrink-0" />
                <span className="text-sm sm:text-base md:text-lg lg:text-xl text-[#1B1717]">
                  Ensure The Shop Photo Clearly Shows Your Shop Signage Or Storefront.
                </span>
              </li>
            </ul>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={postShopDetailsLoading || !formData.shopName || !formData.shopPhotoDataUrl}
            className={`w-full py-3.5 sm:py-4 md:py-5 lg:py-6 rounded-xl text-white text-base sm:text-lg md:text-xl lg:text-2xl font-semibold h-14 sm:h-16 md:h-[72px] lg:h-[80px] transition mt-5 sm:mt-6 md:mt-7 lg:mt-8 shadow-lg ${
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
  );
}

export default Step5;
