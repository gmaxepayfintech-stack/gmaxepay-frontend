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
    <div className="flex justify-center items-center bg-gray-50">
      <div className="bg-white rounded-lg w-[734px] lg:w-[900px] shadow-md p-4 lg:p-8">

        {/* Heading */}
        <h3 className="text-center text-[24px] lg:text-[30px] font-semibold text-gray-800">
          Profile
        </h3>

        <p className="text-center text-[16px] lg:text-[18px] text-[#1B1717] mt-4 mb-6">
          Profile Picture To Complete Your KYC
        </p>

        {/* Frame */}
        <div className="w-[534px] h-[276px] lg:w-[650px] lg:h-[350px] mx-auto mb-4">
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
                <img src="/img/Camera.png" className="w-12 h-12 mb-2" />
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
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 z-10">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setFormData(d => ({ ...d, profilePhotoDataUrl: '' }));
                    startCamera();
                  }}
                  className="bg-[#039155] text-white px-4 lg:px-6 py-1.5 lg:py-2 rounded-lg text-sm lg:text-[16px] font-medium hover:bg-green-700 transition shadow-md"
                >
                  Retake
                </button>

                <button
                  onClick={capturePhoto}
                  disabled={!isCameraActive}
                  className={`px-4 lg:px-6 py-1.5 lg:py-2 rounded-lg text-sm lg:text-[16px] font-medium transition shadow-md ${
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
        <div className="w-[534px] lg:w-[650px] mx-auto">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 lg:p-6">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-[#039155] mt-2" />
                <span className="text-sm lg:text-[16px] text-[#1B1717]">
                  Capture A Clear Photo
                </span>
              </li>

              <li className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-[#039155] mt-2" />
                <span className="text-sm lg:text-[16px] text-[#1B1717]">
                  Good Lighting Required – Avoid Dark Or Blurry Images.
                </span>
              </li>

              <li className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-[#039155] mt-2" />
                <span className="text-sm lg:text-[16px] text-[#1B1717]">
                  Your Aadhaar Photo And Uploaded Profile Picture Must Match.
                </span>
              </li>
            </ul>
          </div>

          {/* Error */}
          {postProfileError && (
            <div className="w-full p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm lg:text-[16px] mb-4 mt-4">
              {postProfileError}
            </div>
          )}

          {/* Success */}
          {postProfileSuccess && postProfileMessage && (
            <div className="w-full p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm lg:text-[16px] mb-4 mt-4">
              {postProfileMessage}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={postProfileLoading || !formData.profilePhotoDataUrl}
            className={`w-full py-2 rounded-lg text-white text-[24px] lg:text-[26px] font-medium h-[60px] lg:h-[70px] transition mt-5 ${
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
