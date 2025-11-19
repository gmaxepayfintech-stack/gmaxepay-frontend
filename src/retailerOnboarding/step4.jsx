import {  useState } from "react";
import { useDispatch } from "react-redux";
import {
  panConnection,
  panDownload,
  uploadPanDocument,
} from "../redux/action/onboardingAction";

function Step4({ setFormData, onNext }) {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);

  const [panImage, setPanImage] = useState(null);
  const [panImagePreview, setPanImagePreview] = useState(null);

  const handleVerify = async () => {
    setLoading(true);
    const token = localStorage.getItem("onboardingToken");

    try {
      await dispatch(panConnection(token));

      setFormData((d) => ({
        ...d,
        panDocFetched: true,
        digilockerLinked: true,
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const token = localStorage.getItem("onboardingToken");
    const payload = { document_type: "PAN" };
    dispatch(panDownload(payload, token));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setPanImage(file);
    setPanImagePreview(preview);
  };

  const handleDeleteImage = () => {
    setPanImage(null);
    setPanImagePreview(null);
  };

  const handleSubmitImage = async () => {
    if (!panImage) return;

    const token = localStorage.getItem("onboardingToken");
    setUploading(true);

    try {
      await dispatch(uploadPanDocument(panImage, token));
      setTimeout(() => onNext(), 800);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full flex justify-center py-6 px-4">
      <div className="w-full max-w-[480px] space-y-8">
        {/* ---------------- DIGILOCKER SECTION ---------------- */}
        {!showImageUpload && (
          <>
            {/* Title */}
            <div className="text-center">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                PAN Card Verification
              </h1>
              <p className="text-gray-600 mt-1 text-sm md:text-base">
                Connect Your DigiLocker For Instant Document Verification
              </p>
            </div>

            {/* DigiLocker Card */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-emerald-200 rounded-2xl p-5 md:p-7 shadow-sm">
              <div className="flex gap-4 items-center">
                <img
                  src="/img/Digilocker1.png"
                  className="h-20 md:h-24"
                  alt="DigiLocker"
                />

                <div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-800">
                    PAN via DigiLocker
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Fetch PAN Document Securely From DigiLocker
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col md:flex-row gap-4 mt-6">
                <button
                  onClick={handleDownload}
                  className="flex-1 h-[48px] rounded-xl border border-gray-500 
                  text-gray-700 text-sm md:text-base hover:bg-gray-100 transition"
                >
                  Download
                </button>

                <button
                  onClick={handleVerify}
                  className="flex-1 h-[48px] rounded-xl bg-[#039155] text-white 
                  text-sm md:text-base hover:bg-green-700 transition"
                >
                  {loading ? "Verifying..." : "Verify"}
                </button>
              </div>
            </div>

            {/* Small Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-3">
              <svg
                className="h-5 w-5 text-blue-600 mt-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 
                  1 1 0 012 0zM9 9a1 1 0 
                  000 2v3a1 1 0 001 1h1a1 1 0 
                  100-2v-3a1 1 0 
                  00-1-1H9z"
                />
              </svg>
              <div>
                <h4 className="font-semibold text-blue-900 text-sm">
                  Secure Verification
                </h4>
                <p className="text-xs text-blue-800">
                  Documents are fetched directly from DigiLocker.
                </p>
              </div>
            </div>

            {/* NEXT */}
            <button
              onClick={() => setShowImageUpload(true)}
              className="w-full py-3 rounded-xl bg-[#039155] text-white font-semibold text-lg hover:bg-green-700 transition"
            >
              Next
            </button>
          </>
        )}

        {/* ---------------- IMAGE UPLOAD SECTION ---------------- */}
        {showImageUpload && (
          <>
            <div className="text-center">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                PAN Card Verification
              </h1>
              <p className="text-gray-600 mt-1 text-sm md:text-base">
                Upload your PAN card image for verification
              </p>
            </div>

            {/* Upload Box */}
            <div
              className="border-2 border-dashed border-gray-300 rounded-2xl 
              w-full h-[170px] md:h-[210px] relative flex items-center justify-center 
              bg-white p-4"
            >
              {panImagePreview ? (
                <>
                  <img
                    src={panImagePreview}
                    alt="Preview"
                    className="w-full h-full object-contain absolute inset-0 p-3"
                  />

                  <button
                    onClick={handleDeleteImage}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full 
                    bg-red-500 text-white text-lg hover:bg-red-600 
                    flex items-center justify-center shadow-md"
                  >
                    ✕
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <img
                    src="/img/pancard-front.png"
                    className="w-[120px]"
                    alt=""
                  />

                  <h3 className="text-sm font-medium">Add PAN Card Image</h3>

                  <label>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                    <span className="bg-[#C5DBFF] px-4 py-1 rounded cursor-pointer hover:bg-[#B0CFFF] text-sm">
                      Select From Browser
                    </span>
                  </label>

                  <p className="text-xs text-gray-500">Max Size: 5 MB</p>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmitImage}
              disabled={!panImage || uploading}
              className={`w-full py-3 rounded-xl text-lg font-semibold transition
              ${
                panImage
                  ? "bg-[#039155] text-white hover:bg-green-700"
                  : "bg-gray-400 text-white cursor-not-allowed"
              }`}
            >
              {uploading ? "Uploading..." : "Submit"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Step4;
