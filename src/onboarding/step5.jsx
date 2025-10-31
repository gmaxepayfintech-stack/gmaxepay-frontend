import { useRef, useEffect } from 'react';

function Step5({ formData, setFormData, onNext }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaStreamRef = useRef(null);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(d => ({ ...d, [name]: value }));
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (_) {}
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
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
    setFormData(d => ({ ...d, shopPhotoDataUrl: dataUrl }));
    stopCamera();
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <form className="space-y-5" onSubmit={e => e.preventDefault()}>
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-2">Shop Details</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Shop name</label>
            <input
              type="text"
              name="shopName"
              value={formData.shopName}
              onChange={handleChange}
              placeholder="Enter shop name"
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-medium">Take live photo with shop</label>
            {!formData.shopPhotoDataUrl && (
              <div className="space-y-3">
                <div className="border rounded-lg overflow-hidden bg-gray-100">
                  <video ref={videoRef} className="w-full aspect-video object-cover" playsInline muted />
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={startCamera} className="border px-3 py-2 rounded">Start camera</button>
                  <button type="button" onClick={capturePhoto} className="bg-blue-600 text-white px-3 py-2 rounded">Capture</button>
                  <button type="button" onClick={stopCamera} className="border px-3 py-2 rounded">Stop</button>
                </div>
                <p className="text-xs text-gray-500">Ensure your shop signboard is visible in the frame.</p>
              </div>
            )}
            {formData.shopPhotoDataUrl && (
              <div className="space-y-3">
                <img src={formData.shopPhotoDataUrl} alt="Shop" className="w-full rounded-lg border" />
                <button type="button" className="border px-3 py-2 rounded" onClick={() => setFormData(d => ({ ...d, shopPhotoDataUrl: '' }))}>Retake</button>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>
          <div className="flex items-center justify-end">
            <button type="button" onClick={onNext} className="bg-blue-600 text-white px-4 py-2 rounded">Next</button>
          </div>
        </div>
      </div>
    </form>
  );
}

export default Step5;

