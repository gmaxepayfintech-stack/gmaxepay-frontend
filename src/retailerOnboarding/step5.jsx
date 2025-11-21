import { useRef, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { postProfile } from '../redux/action/onboardingAction';

function Step5({ formData, setFormData, onComplete }) {
  const dispatch = useDispatch();
  const {
    postProfileLoading,
    postProfileError,
    postProfileSuccess,
    postProfileMessage,
  } = useSelector(state => state.onboarding);

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
            facingMode: { ideal: 'user' },
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
    setFormData(d => ({ ...d, profilePhotoDataUrl: dataUrl }));
  };

  const handleSubmit = () => {
    if (!formData.profilePhotoDataUrl) return;

    const token = localStorage.getItem('onboardingToken');
    if (!token) {
      alert('Onboarding token not found.');
      return;
    }

    dispatch(postProfile(formData.profilePhotoDataUrl, token));
  };

  useEffect(() => {
    if (postProfileSuccess) {
      setFormData(d => ({ ...d, completed: true }));
      if (onComplete) onComplete();
    }
  }, [postProfileSuccess]);

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
    <div className="w-full h-full flex justify-center items-center bg-gray-50 p-2 sm:p-3 md:p-4 overflow-hidden">
      <div className="bg-white rounded-xl shadow-md p-3 sm:p-5 md:p-6 lg:p-8 w-full max-w-[95%] sm:max-w-[500px] md:max-w-[600px] lg:max-w-[700px] xl:max-w-[900px] mx-auto">

        {/* Heading */}
        <h3 className="text-center text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-semibold text-gray-800 mb-2 sm:mb-3">
          Profile
        </h3>

        <p className="text-center text-xs sm:text-sm md:text-base lg:text-lg text-[#1B1717] mb-4 sm:mb-5 md:mb-6">
          Profile Picture To Complete Your KYC
        </p>

        {/* Frame */}
        <div className="w-full max-w-full sm:max-w-[450px] md:max-w-[500px] lg:max-w-[600px] xl:max-w-[650px] h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px] mx-auto mb-3 sm:mb-4">
          <div className="border-2 border-dashed border-[#1B1717]/30 rounded-lg h-full relative overflow-hidden bg-gray-50">

            <video
              ref={videoRef}
              className={`w-full h-full object-cover rounded-lg ${isCameraActive ? 'block' : 'hidden'}`}
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
                <img src="/img/Camera.png" className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mb-2" alt="Camera" />
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
              <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3 z-10">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setFormData(d => ({ ...d, profilePhotoDataUrl: '' }));
                    startCamera();
                  }}
                  className="bg-[#039155] text-white px-3 sm:px-4 md:px-5 lg:px-6 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm md:text-base lg:text-lg font-medium hover:bg-green-700 transition shadow-md"
                >
                  Retake
                </button>

                <button
                  onClick={capturePhoto}
                  disabled={!isCameraActive}
                  className={`px-3 sm:px-4 md:px-5 lg:px-6 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm md:text-base lg:text-lg font-medium transition shadow-md ${
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
        <div className="w-full max-w-full sm:max-w-[450px] md:max-w-[500px] lg:max-w-[600px] xl:max-w-[650px] mx-auto">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 md:p-5 lg:p-6">
            <ul className="space-y-1.5 sm:space-y-2">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#039155] mt-1.5 sm:mt-2 flex-shrink-0" />
                <span className="text-xs sm:text-sm md:text-base lg:text-lg text-[#1B1717]">
                  Capture A Clear Photo
                </span>
              </li>

              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#039155] mt-1.5 sm:mt-2 flex-shrink-0" />
                <span className="text-xs sm:text-sm md:text-base lg:text-lg text-[#1B1717]">
                  Good Lighting Required – Avoid Dark Or Blurry Images.
                </span>
              </li>

              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#039155] mt-1.5 sm:mt-2 flex-shrink-0" />
                <span className="text-xs sm:text-sm md:text-base lg:text-lg text-[#1B1717]">
                  Your Aadhaar Photo And Uploaded Profile Picture Must Match.
                </span>
              </li>
            </ul>
          </div>

          {/* Error */}
          {postProfileError && (
            <div className="w-full p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs sm:text-sm md:text-base lg:text-lg mb-3 sm:mb-4 mt-3 sm:mt-4">
              {postProfileError}
            </div>
          )}

          {/* Success */}
          {postProfileSuccess && postProfileMessage && (
            <div className="w-full p-2 sm:p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-xs sm:text-sm md:text-base lg:text-lg mb-3 sm:mb-4 mt-3 sm:mt-4">
              {postProfileMessage}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={postProfileLoading || !formData.profilePhotoDataUrl}
            className={`w-full py-2.5 sm:py-3 md:py-3.5 rounded-lg text-white text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-semibold h-12 sm:h-14 md:h-16 lg:h-[70px] transition mt-4 sm:mt-5 shadow-md ${
              postProfileLoading || !formData.profilePhotoDataUrl
                ? 'bg-[#039155] opacity-60 cursor-not-allowed'
                : 'bg-[#039155] hover:bg-green-700'
            }`}
          >
            {postProfileLoading ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Step5;
