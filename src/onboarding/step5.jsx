import { useRef, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { postShopDetails } from './../redux/action/onboardingAction';
import { getLocationAndIP } from './../util/getLocationAndIP';

function Step5({ formData, setFormData, onNext }) {
  const dispatch = useDispatch();
  const {
    postShopDetailsLoading,
    postShopDetailsError,
    postShopDetailsSuccess,
    postShopDetailsMessage,
  } = useSelector(state => state.onboarding);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(d => ({ ...d, [name]: value }));
  };

  const startCamera = async () => {
    try {
      // Stop any existing stream first
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }
      
      // Try to get back camera first (for shop photos), fallback to any available camera
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: { ideal: 'environment' }, // Back camera for shop photos
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }, 
          audio: false 
        });
      } catch (backCameraError) {
        // Fallback to any available camera
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: false 
        });
      }
      
      mediaStreamRef.current = stream;
      setIsCameraActive(true);
      
      // Ensure video element is ready and connected
      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;
        
        // Wait for video to be ready before playing
        const handleCanPlay = () => {
          video.play().catch(err => {
            console.error('Error playing video:', err);
          });
        };
        
        if (video.readyState >= 2) {
          // Video already has data, play immediately
          video.play().catch(err => {
            console.error('Error playing video:', err);
          });
        } else {
          // Wait for video to be ready
          video.addEventListener('canplay', handleCanPlay, { once: true });
        }
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setIsCameraActive(false);
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
      } catch (error) {
        console.error('Error stopping camera:', error);
      }
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

  const handleSubmit = async () => {
    if (!formData.shopName || !formData.shopPhotoDataUrl) {
      return;
    }

    const token = localStorage.getItem('onboardingToken');
    if (!token) {
      alert('Onboarding token not found. Please refresh the page.');
      return;
    }

    try {
      // Get IP address, longitude, and latitude
      const locationIPData = await getLocationAndIP();
      const ipAddress = locationIPData.ipAddress;
      const longitude = locationIPData.location?.longitude;
      const latitude = locationIPData.location?.latitude;

      // Dispatch the API call
      await dispatch(
        postShopDetails(
          formData.shopName,
          formData.shopPhotoDataUrl,
          token,
          ipAddress,
          longitude,
          latitude
        )
      );

      // If successful, proceed to next step
      onNext();
    } catch (error) {
      // Error is handled by Redux state and displayed above
      console.error('Failed to submit shop details:', error);
    }
  };

  // Effect to ensure video stream is properly connected when camera becomes active
  useEffect(() => {
    if (isCameraActive && mediaStreamRef.current && videoRef.current) {
      const video = videoRef.current;
      const stream = mediaStreamRef.current;
      
      // Only set if not already set or if different
      if (video.srcObject !== stream) {
        video.srcObject = stream;
      }
      
      // Handle video ready state - ensure it plays when metadata is loaded
      const handleLoadedMetadata = () => {
        if (video.paused && isCameraActive) {
          video.play().catch(err => {
            console.error('Error playing video after metadata loaded:', err);
            // Don't stop camera on play error, just log it
          });
        }
      };
      
      const handlePlay = () => {
        console.log('Video started playing');
      };
      
      const handleError = (e) => {
        console.error('Video error:', e);
        // Don't stop camera on video error unless it's critical
      };
      
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('play', handlePlay);
      video.addEventListener('error', handleError);
      
      // Try to play immediately if video is ready
      if (video.readyState >= 2) { // HAVE_CURRENT_DATA
        video.play().catch(err => {
          console.error('Error playing video:', err);
        });
      }
      
      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('error', handleError);
      };
    }
  }, [isCameraActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="flex justify-center items-center bg-gray-50">
      <div className="bg-white rounded-lg w-[734px] h-[679px]">
        <h3 className="text-center text-[24px] font-semibold text-gray-800">
          Shop Details
        </h3>
        <p className="text-center text-[16px] text-[#1B1717] mt-4 mb-6">
          Tell Us About Your Business
        </p>
        
        {/* Shop Name Section - Separate */}
        <div className="w-[534px] mx-auto mb-6">
          <label className="block text-[20px] font-medium text-[#1B1717] mb-2">
            Shop Name
          </label>
          
          <div className="relative">
            <img
              src="/img/Store.png"
              alt="Shop"
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition ${
                formData.shopName ? "opacity-100" : "opacity-50"
              }`}
            />
            
            <div
              className={`absolute left-11 top-1/2 -translate-y-1/2 h-6 w-px transition ${
                formData.shopName ? "bg-[#1B1717]" : "bg-gray-300"
              }`}
            />
            
            <input
              type="text"
              name="shopName"
              value={formData.shopName || ''}
              onChange={handleChange}
              placeholder="Enter Shop Name"
              className="w-full border border-[#1B1717] border-opacity-80 h-[60px] rounded-lg py-2 pl-14 pr-3 text-sm outline-none"
            />
          </div>
        </div>

        {/* Picture Upload Section Label - Separate */}
        <div className="w-[534px] mx-auto mb-3">
          <label className="block text-[20px] font-medium text-[#1B1717]">
            Click Your Picture With Shop
          </label>
        </div>

        {/* Dotted Border Card - Fixed dimensions */}
        <div className="w-[534px] h-[201px] mx-auto mb-4">
          <div className="border-2 border-dashed border-[#1B1717] border-opacity-30 rounded-lg h-full relative overflow-hidden bg-gray-50">
            {/* Always render video element but hide/show it based on state */}
            <video 
              ref={videoRef} 
              className={`w-full h-full object-cover rounded-lg ${isCameraActive ? 'block' : 'hidden'}`}
              playsInline 
              muted 
              autoPlay
              style={{ 
                minHeight: '100%',
                minWidth: '100%',
                backgroundColor: '#000'
              }}
            />
            
            {/* Show placeholder when no photo and camera not active */}
            {!formData.shopPhotoDataUrl && !isCameraActive && (
              <div 
                className="h-full flex flex-col items-center justify-center p-4 cursor-pointer absolute inset-0"
                onClick={startCamera}
              >
                <img
                  src="/img/Camera.png"
                  alt="Camera"
                  className="w-12 h-12 mb-2"
                />
                <p className="text-center text-[#1B1717] text-sm mb-2">Click Your Picture With Shop</p>
              </div>
            )}
            
            {/* Show captured image when photo exists and camera not active */}
            {formData.shopPhotoDataUrl && !isCameraActive && (
              <img
                src={formData.shopPhotoDataUrl} 
                alt="Shop" 
                className="w-full h-full object-cover rounded-lg absolute inset-0"
              />
            )}
            
            {/* Buttons - Show when camera is active or when photo exists */}
            {(isCameraActive || formData.shopPhotoDataUrl) && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 z-10">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (formData.shopPhotoDataUrl) {
                      setFormData(d => ({ ...d, shopPhotoDataUrl: '' }));
                    }
                    if (isCameraActive) {
                      stopCamera();
                    }
                    startCamera();
                  }}
                  className="border border-[#039155] text-[#039155] bg-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-green-50 transition shadow-md"
                >
                  Retake
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    capturePhoto();
                  }}
                  disabled={!isCameraActive}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition shadow-md ${
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

        {/* Image Upload Guidelines */}
        <div className="w-[534px] mx-auto">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-[#039155] mt-2 flex-shrink-0" />
                <span className="text-sm text-[#1B1717]">Capture A Clear View Of The Shop</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-[#039155] mt-2 flex-shrink-0" />
                <span className="text-sm text-[#1B1717]">Good Lighting Required – Avoid Dark Or Blurry Images.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-[#039155] mt-2 flex-shrink-0" />
                <span className="text-sm text-[#1B1717]">No Personal Or Unrelated Photos –The Shop Image Should Be Uploaded.</span>
              </li>
            </ul>
          </div>

          {/* Error Message */}
          {postShopDetailsError && (
            <div className="w-full p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
              {postShopDetailsError}
            </div>
          )}

          {/* Success Message */}
          {postShopDetailsSuccess && postShopDetailsMessage && (
            <div className="w-full p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm mb-4">
              {postShopDetailsMessage}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={postShopDetailsLoading || !formData.shopName || !formData.shopPhotoDataUrl}
            className={`w-full py-2 rounded-lg text-white text-[24px] font-medium h-[60px] transition mt-5 ${
              postShopDetailsLoading || !formData.shopName || !formData.shopPhotoDataUrl
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#039155] hover:bg-green-700'
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

