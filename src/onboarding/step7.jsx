import { useRef, useEffect } from 'react';

function Step7({ formData, setFormData, onComplete }) {
  const profileVideoRef = useRef(null);
  const profileCanvasRef = useRef(null);
  const profileMediaStreamRef = useRef(null);

  const startProfileCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      profileMediaStreamRef.current = stream;
      if (profileVideoRef.current) {
        profileVideoRef.current.srcObject = stream;
        await profileVideoRef.current.play();
      }
    } catch (_) {}
  };

  const stopProfileCamera = () => {
    if (profileMediaStreamRef.current) {
      profileMediaStreamRef.current.getTracks().forEach(t => t.stop());
      profileMediaStreamRef.current = null;
    }
  };

  const captureProfilePhoto = () => {
    const video = profileVideoRef.current;
    const canvas = profileCanvasRef.current;
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
    stopProfileCamera();
  };

  useEffect(() => {
    return () => {
      stopProfileCamera();
    };
  }, []);

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
        <div className="space-y-3">
          {!formData.profilePhotoDataUrl && (
            <div className="space-y-3">
              <div className="w-full flex items-center justify-center">
                <div className="w-48 h-48 rounded-full overflow-hidden border bg-gray-100">
                  <video ref={profileVideoRef} className="w-full h-full object-cover" playsInline muted />
                </div>
              </div>
              <div className="flex gap-2 justify-center">
                <button type="button" onClick={startProfileCamera} className="border px-3 py-2 rounded">Start camera</button>
                <button type="button" onClick={captureProfilePhoto} className="bg-blue-600 text-white px-3 py-2 rounded">Capture</button>
                <button type="button" onClick={stopProfileCamera} className="border px-3 py-2 rounded">Stop</button>
              </div>
              <p className="text-xs text-gray-500 text-center">Center your face within the circle and ensure good lighting.</p>
            </div>
          )}
          {formData.profilePhotoDataUrl && (
            <div className="space-y-3">
              <div className="w-full flex items-center justify-center">
                <img src={formData.profilePhotoDataUrl} alt="Profile" className="w-48 h-48 object-cover rounded-full border" />
              </div>
              <div className="flex gap-2 justify-center">
                <button type="button" className="border px-3 py-2 rounded" onClick={() => setFormData(d => ({ ...d, profilePhotoDataUrl: '' }))}>Retake</button>
              </div>
            </div>
          )}
          <canvas ref={profileCanvasRef} className="hidden" />
        </div>
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-2">
            {formData.digilockerLinked && <div className="flex items-center gap-1 text-green-600 text-sm"><DigiLockerIcon small /> <span>DigiLocker linked</span></div>}
          </div>
          <button type="button" className="bg-green-600 text-white px-4 py-2 rounded" onClick={() => setFormData(d => ({ ...d, completed: true }))}>Finish</button>
        </div>
      </div>
    </form>
  );
}

export default Step7;

