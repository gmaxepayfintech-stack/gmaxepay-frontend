import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { postProfile } from '../redux/action/onboardingAction';

function Step7({ formData, setFormData, onComplete }) {
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

  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [requiresNewUpload, setRequiresNewUpload] = useState(true);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (error) {
      console.error('Unable to access camera', error);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const captureAndUpload = async () => {
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

    setFormData(d => ({ ...d, profilePhotoDataUrl: dataUrl }));
    stopCamera();
    await uploadPhoto(dataUrl);
  };

  const uploadPhoto = async (dataUrl) => {
    const token = localStorage.getItem('onboardingToken');
    if (!token) {
      alert('Onboarding token not found. Please refresh the page.');
      return;
    }

    try {
      const response = await dispatch(postProfile({ token, photoDataUrl: dataUrl })).unwrap();
      setUploadSuccess(true);
      setSuccessMessage(response?.message || 'Photo captured & uploaded successfully.');
      setRequiresNewUpload(false);
    } catch (error) {
      setUploadSuccess(false);
      setRequiresNewUpload(true);
      console.error('Failed to upload profile photo', error);
    }
  };

  const handleReset = () => {
    setFormData(d => ({ ...d, profilePhotoDataUrl: '' }));
    setUploadSuccess(false);
    setSuccessMessage('');
    setRequiresNewUpload(true);
    stopCamera();
    startCamera();
  };

  const handleNext = () => {
    if (requiresNewUpload) {
      alert('Please capture and upload your profile photo first.');
      return;
    }
    setFormData(d => ({ ...d, completed: true }));
    if (onComplete) {
      onComplete();
    }
  };

  const DigiLockerIcon = ({ small }) => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={small?"w-4 h-4":"w-5 h-5"}
      >
        <path d="M6 8a6 6 0 1112 0v2h1a1 1 0 011 1v9a1 1 0 01-1 1H5a1 1 0 01-1-1v-9a1 1 0 011-1h1V8zm2 2h8V8a4 4 0 10-8 0v2z" />
      </svg>
    );
  };

  return (
    <form className="space-y-5" onSubmit={e => e.preventDefault()}>
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-2">Profile Photo</h3>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Capture a clear selfie with your shop background. Click capture to upload automatically or reset to try again.
        </p>

        <div className="w-full flex items-center justify-center">
          <div className="w-56 h-56 rounded-full overflow-hidden border-4 border-blue-100 bg-gray-50 flex items-center justify-center shadow-inner">
            {!formData.profilePhotoDataUrl ? (
              <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
            ) : (
              <img src={formData.profilePhotoDataUrl} alt="Profile" className="w-full h-full object-cover" />
            )}
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />

        <div className="flex justify-center mt-4">
          {!formData.profilePhotoDataUrl ? (
            <button
              type="button"
              onClick={captureAndUpload}
              className="px-6 py-2 rounded-full bg-blue-600 text-white font-medium shadow disabled:opacity-60"
              disabled={postProfileLoading}
            >
              {postProfileLoading ? 'Uploading...' : 'Capture & Upload'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2 rounded-full border border-gray-300 text-gray-700 font-medium shadow-sm"
              disabled={postProfileLoading}
            >
              Reset Capture
            </button>
          )}
        </div>

        {postProfileError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm text-center">
            {postProfileError}
          </div>
        )}

        {(!requiresNewUpload) && (uploadSuccess || postProfileSuccess) && !postProfileLoading && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm text-center">
            {successMessage || postProfileMessage || 'Photo captured & uploaded successfully.'}
          </div>
        )}

        <div className="flex items-center justify-between mt-8">
          <div className="flex items-center gap-2">
            {formData.digilockerLinked && (
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <DigiLockerIcon small />
                <span>DigiLocker linked</span>
              </div>
            )}
          </div>
          <button
            type="button"
            className="bg-green-600 text-white px-6 py-2 rounded-full font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
            onClick={handleNext}
            disabled={postProfileLoading || requiresNewUpload}
          >
            Next
          </button>
        </div>
      </div>
    </form>
  );
}

export default Step7;

