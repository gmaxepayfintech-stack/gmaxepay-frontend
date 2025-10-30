import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

function OnboardingById() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const profileVideoRef = useRef(null);
  const profileCanvasRef = useRef(null);
  const profileMediaStreamRef = useRef(null);

  const initialData = useMemo(() => {
    try {
      const raw = localStorage.getItem('onboardingData');
      return raw ? JSON.parse(raw) : {};
    } catch (_) {
      return {};
    }
  }, []);

  const [formData, setFormData] = useState({
    // Step 1
    phone: initialData.phone || '',
    otp: initialData.otp || '',
    otpSent: initialData.otpSent || false,
    otpVerified: initialData.otpVerified || false,
    email: initialData.email || '',
    emailOtp: initialData.emailOtp || '',
    emailOtpSent: initialData.emailOtpSent || false,
    emailOtpVerified: initialData.emailOtpVerified || false,
    // Step 2
    panDocFetched: initialData.panDocFetched || false,
    aadhaarDocFetched: initialData.aadhaarDocFetched || false,
    digilockerLinked: initialData.digilockerLinked || false,
    // Step 3
    shopName: initialData.shopName || '',
    shopPhotoDataUrl: initialData.shopPhotoDataUrl || '',
    // Step 4
    profilePhotoDataUrl: initialData.profilePhotoDataUrl || '',
    // Completed
    completed: initialData.completed || false,
  });

  useEffect(() => {
    const tokenFromQuery = searchParams.get('token');
    const token = tokenFromQuery || id;
    if (token) {
      try {
        localStorage.setItem('onboardingToken', token);
      } catch (_) {}
    }
  }, [id, searchParams]);

  useEffect(() => {
    try {
      localStorage.setItem('onboardingData', JSON.stringify(formData));
      localStorage.setItem('onboardingStep', String(currentStep));
    } catch (_) {}
  }, [formData, currentStep]);

  useEffect(() => {
    try {
      const savedStep = Number(localStorage.getItem('onboardingStep'));
      if (savedStep && savedStep >= 1 && savedStep <= 5) {
        setCurrentStep(savedStep);
      }
    } catch (_) {}
  }, []);

  const next = () => setCurrentStep(s => Math.min(5, s + 1));
  const back = () => setCurrentStep(s => Math.max(1, s - 1));

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(d => ({ ...d, [name]: value }));
  };

  // Step 1: OTP flow (mock)
  const sendOtp = () => {
    setFormData(d => ({ ...d, otpSent: true }));
  };
  const verifyOtp = () => {
    setFormData(d => ({ ...d, otpVerified: true }));
  };
  const sendEmailOtp = () => {
    setFormData(d => ({ ...d, emailOtpSent: true }));
  };
  const verifyEmailOtp = () => {
    setFormData(d => ({ ...d, emailOtpVerified: true }));
  };

  // Step 2: DigiLocker link (mock)
  const fetchPanFromDigilocker = () => {
    setFormData(d => {
      const updated = { ...d, panDocFetched: true };
      if (updated.panDocFetched && updated.aadhaarDocFetched) {
        updated.digilockerLinked = true;
      }
      return updated;
    });
  };
  const fetchAadhaarFromDigilocker = () => {
    setFormData(d => {
      const updated = { ...d, aadhaarDocFetched: true };
      if (updated.panDocFetched && updated.aadhaarDocFetched) {
        updated.digilockerLinked = true;
      }
      return updated;
    });
  };

  // Step 3: Camera handling for shop photo
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

  // Step 4: Profile photo upload/capture
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

  const submitKyc = e => {
    e.preventDefault();
    // TODO: Integrate API call here
    next();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow p-6">
        {!formData.completed && (
          <>
            <h1 className="text-2xl font-semibold mb-2">Complete your KYC</h1>
            <p className="text-sm text-gray-600 mb-6">Onboarding token captured. Please complete the steps below.</p>
          </>
        )}
        {formData.completed && (
          <div className="text-center py-10">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4">
              ✓
            </div>
            <h2 className="text-xl font-semibold">KYC completed</h2>
            <p className="text-gray-600 mt-1">Thank you! Your onboarding is complete.</p>
            {formData.digilockerLinked && (
              <div className="mt-3 inline-flex items-center gap-1 text-green-600 text-sm"><DigiLockerIcon small /> DigiLocker linked</div>
            )}
          </div>
        )}

        {!formData.completed && (
          <div className="flex items-center gap-2 mb-6">
            <StepBadge label="Mobile OTP" active={currentStep === 1} done={currentStep > 1} />
            <Divider />
            <StepBadge label="Email OTP" active={currentStep === 2} done={currentStep > 2} />
            <Divider />
            <StepBadge label="DigiLocker" active={currentStep === 3} done={currentStep > 3} />
            <Divider />
            <StepBadge label="Shop details" active={currentStep === 4} done={currentStep > 4} />
            <Divider />
            <StepBadge label="Profile photo" active={currentStep === 5} done={false} />
          </div>
        )}

        {!formData.completed && currentStep === 1 && (
          <form className="space-y-6" onSubmit={e => e.preventDefault()}>
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-1">Mobile number</label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter 10-digit mobile"
                  className="w-full border rounded px-3 py-2 outline-none focus:ring"
                />
                <button type="button" onClick={sendOtp} className="bg-blue-600 text-white px-3 py-2 rounded">
                  {formData.otpSent ? 'Resend OTP' : 'Send OTP'}
                </button>
              </div>
              {formData.otpSent && (
                <p className="text-xs text-green-600">OTP sent to your mobile.</p>
              )}
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                placeholder="Enter mobile OTP"
                className="w-full border rounded px-3 py-2 outline-none focus:ring"
              />
              <div className="flex justify-end">
                <button type="button" onClick={verifyOtp} className={"px-3 py-2 rounded "+(formData.otpVerified?"bg-green-600 text-white":"border")}>{formData.otpVerified?"Verified ✓":"Verify"}</button>
              </div>
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={next} className="bg-blue-600 text-white px-4 py-2 rounded" disabled={!formData.otpVerified}>
                Next
              </button>
            </div>
          </form>
        )}

        {!formData.completed && currentStep === 2 && (
          <form className="space-y-6" onSubmit={e => e.preventDefault()}>
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-1">Email</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full border rounded px-3 py-2 outline-none focus:ring"
                />
                <button type="button" onClick={sendEmailOtp} className="bg-blue-600 text-white px-3 py-2 rounded">
                  {formData.emailOtpSent ? 'Resend OTP' : 'Send OTP'}
                </button>
              </div>
              {formData.emailOtpSent && (
                <p className="text-xs text-green-600">OTP sent to your email.</p>
              )}
              <input
                type="text"
                name="emailOtp"
                value={formData.emailOtp}
                onChange={handleChange}
                placeholder="Enter email OTP"
                className="w-full border rounded px-3 py-2 outline-none focus:ring"
              />
              <div className="flex justify-end">
                <button type="button" onClick={verifyEmailOtp} className={"px-3 py-2 rounded "+(formData.emailOtpVerified?"bg-green-600 text-white":"border")}>{formData.emailOtpVerified?"Verified ✓":"Verify"}</button>
              </div>
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={next} className="bg-blue-600 text-white px-4 py-2 rounded" disabled={!formData.emailOtpVerified}>
                Next
              </button>
            </div>
          </form>
        )}

        {!formData.completed && currentStep === 3 && (
          <form className="space-y-5" onSubmit={e => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg flex flex-col gap-3">
                <div className="flex items-center gap-2 text-purple-700">
                  <img src="/img/digilocker.png" alt="DigiLocker" className="h-6 w-auto" />
                  <div className="font-medium">PAN via DigiLocker</div>
                </div>
                <div className="text-xs text-gray-500">Fetch PAN document securely from your DigiLocker.</div>
                <button
                  type="button"
                  onClick={fetchPanFromDigilocker}
                  className={"px-3 py-2 rounded border "+(formData.panDocFetched?"border-green-600 text-green-700 bg-white":"border-purple-600 text-purple-700 bg-white")}
                >{formData.panDocFetched?"Added ✓":"Add to DigiLocker"}</button>
              </div>
              <div className="p-4 border rounded-lg flex flex-col gap-3">
                <div className="flex items-center gap-2 text-purple-700">
                  <img src="/img/digilocker.png" alt="DigiLocker" className="h-6 w-auto" />
                  <div className="font-medium">Aadhaar via DigiLocker</div>
                </div>
                <div className="text-xs text-gray-500">Fetch masked Aadhaar XML from your DigiLocker.</div>
                <button
                  type="button"
                  onClick={fetchAadhaarFromDigilocker}
                  className={"px-3 py-2 rounded border "+(formData.aadhaarDocFetched?"border-green-600 text-green-700 bg-white":"border-purple-600 text-purple-700 bg-white")}
                >{formData.aadhaarDocFetched?"Added ✓":"Add to DigiLocker"}</button>
              </div>
            </div>
            <div className="flex items-center justify-end">
              <button type="button" onClick={next} className="bg-blue-600 text-white px-4 py-2 rounded" disabled={!(formData.panDocFetched && formData.aadhaarDocFetched)}>Next</button>
            </div>
          </form>
        )}

        {!formData.completed && currentStep === 4 && (
          <form className="space-y-5" onSubmit={e => e.preventDefault()}>
            <div>
              <label className="block text-sm font-medium mb-1">Shop name</label>
              <input
                type="text"
                name="shopName"
                value={formData.shopName}
                onChange={handleChange}
                placeholder="Enter shop name"
                className="w-full border rounded px-3 py-2 outline-none focus:ring"
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
              <button type="button" onClick={next} className="bg-blue-600 text-white px-4 py-2 rounded">Next</button>
            </div>
          </form>
        )}

        {!formData.completed && currentStep === 5 && (
          <form className="space-y-5" onSubmit={e => e.preventDefault()}>
            <div className="space-y-3">
              <label className="block text-sm font-medium">Take profile photo</label>
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {formData.digilockerLinked && <div className="flex items-center gap-1 text-green-600 text-sm"><DigiLockerIcon small /> <span>DigiLocker linked</span></div>}
              </div>
              <button type="button" className="bg-green-600 text-white px-4 py-2 rounded" onClick={() => setFormData(d => ({ ...d, completed: true }))}>Finish</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function StepBadge({ label, active, done }) {
  return (
    <div className={"flex items-center gap-2 "+(active?"text-blue-600":"text-gray-500")}>
      <div className={"w-6 h-6 rounded-full flex items-center justify-center text-sm "+(done?"bg-green-500 text-white":active?"bg-blue-600 text-white":"bg-gray-200")}>{done?"✓":active?"" : ""}</div>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

function Divider() {
  return <div className="flex-1 h-px bg-gray-200" />;
}

function DigiLockerIcon({ small }) {
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
}

export default OnboardingById;


