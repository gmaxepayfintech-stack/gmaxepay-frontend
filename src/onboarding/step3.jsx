import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  aadhaarConnection,
  aadhaarDownload,
} from "../redux/action/onboardingAction";

function Step3({ setFormData, onNext }) {
  const dispatch = useDispatch();

  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);

  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);

  // Redux selectors
  const digilockerSuccess = useSelector(
    (state) => state?.onboarding?.aadhaarVerify?.aadhaarVerify?.status
  );

  const url = useSelector(
    (state) => state?.onboarding?.aadhaarVerify?.aadhaarVerify?.url
  );

  const verification_id = useSelector(
    (state) => state?.onboarding?.aadhaarVerify?.aadhaarVerify?.verification_id
  );

  const reference_id = useSelector(
    (state) => state?.onboarding?.aadhaarVerify?.aadhaarVerify?.reference_id
  );

  const document_type = useSelector(
    (state) =>
      state?.onboarding?.aadhaarVerify?.aadhaarVerify?.document_requested?.[0]
  );

  // Auto-open DigiLocker URL
  useEffect(() => {
    if (digilockerSuccess === "Success" && url) {
      window.location.href = url;
    }
  }, [digilockerSuccess, url]);

  const handleVerify = async () => {
    setLoading(true);
    const token = localStorage.getItem("onboardingToken");

    await dispatch(aadhaarConnection(token));

    setIsVerified(true);
    setFormData((d) => ({
      ...d,
      aadhaarDocFetched: true,
      digilockerLinked: true,
    }));
    setLoading(false);
  };

  const handleDownload = () => {
    if (!verification_id || !reference_id || !document_type) return;

    const payload = { verification_id, reference_id, document_type };
    dispatch(aadhaarDownload(payload));
  };

  const handleImageChange = (type, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "front") setFrontImage(file);
    else setBackImage(file);
  };

  const handleSubmitImages = () => {
    if (frontImage && backImage) onNext();
  };

  return (
    <div className="w-full flex justify-center py-6">
      <div className="w-[450px] space-y-8">
        {/* ================================================================= */}
        {/*                      DIGILOCKER VERIFICATION VIEW                 */}
        {/* ================================================================= */}
        {!showImageUpload && (
          <>
            {/* Header */}
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Aadhar Verification
              </h1>
              <p className="text-gray-600 mt-1">
                Connect Your DigiLocker For Instant Document Verification
              </p>
            </div>

            {/* DigiLocker Box */}
            <div
              className="bg-gradient-to-br from-green-50 to-emerald-50 
              border-2 border-dashed border-gray-400 rounded-2xl p-8"
            >
              <div className="flex items-start gap-4">
                <img
                  src="/img/Digilocker1.png"
                  className="h-24"
                  alt="Digilocker"
                />

                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Aadhar Via DigiLocker
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Fetch Aadhaar Document Securely From DigiLocker
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-6 mt-6">
                <button
                  onClick={handleDownload}
                  className="flex-1 h-[52px] text-lg rounded-xl border-2 border-black/60 
                    text-gray-700 font-medium hover:bg-gray-100 transition"
                >
                  Download
                </button>

                <button
                  onClick={handleVerify}
                  disabled={loading || isVerified}
                  className={`flex-1 h-[52px] text-lg rounded-xl text-white font-medium transition 
                    ${
                      isVerified
                        ? "bg-green-600 cursor-not-allowed"
                        : "bg-[#039155] hover:bg-green-700"
                    }`}
                >
                  {loading
                    ? "Verifying..."
                    : isVerified
                    ? "Verified ✓"
                    : "Verify"}
                </button>
              </div>
            </div>

            {/* Information Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
              <svg
                className="h-5 w-5 text-blue-600 mt-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 
                  0116 0zm-7-4a1 1 0 11-2 0 
                  1 1 0 012 0zM9 9a1 1 0 
                  000 2v3a1 1 0 001 1h1a1 1 0 
                  100-2v-3a1 1 0 
                  00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>

              <div>
                <h4 className="font-semibold text-blue-900 text-sm">
                  Secure Document Verification
                </h4>
                <p className="text-xs text-blue-800">
                  Documents are fetched directly from DigiLocker using secure
                  APIs.
                </p>
              </div>
            </div>

            {/* NEXT */}
            <button
              onClick={() => setShowImageUpload(true)}
              className="w-full py-3 rounded-xl bg-[#039155] text-white 
                font-semibold text-lg"
            >
              Next
            </button>
          </>
        )}

        {/* ================================================================= */}
        {/*                          IMAGE UPLOAD VIEW                       */}
        {/* ================================================================= */}
        {showImageUpload && (
          <>
            {/* Header */}
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Aadhar Verification
              </h1>
              <p className="text-gray-600 mt-1">
                Connect Your DigiLocker For Instant Document Verification
              </p>
            </div>

            {/* Aadhaar Front */}
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8">
              <div className="flex flex-col items-center gap-4">
                <img
                  src="/img/aadhaar_sample.png"
                  className="h-20"
                  alt="Aadhaar Front"
                />

                <h3 className="text-lg font-semibold">
                  Add Aadhaar Image Front
                </h3>

                <label>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageChange("front", e)}
                  />
                  <span
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer 
                    hover:bg-blue-700"
                  >
                    Select From Browser
                  </span>
                </label>

                <p className="text-xs text-gray-500">File Size (Max 5 MB)</p>
              </div>
            </div>

            {/* Aadhaar Back */}
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8">
              <div className="flex flex-col items-center gap-4">
                <img
                  src="/img/aadhaar_sample.png"
                  className="h-20"
                  alt="Aadhaar Back"
                />

                <h3 className="text-lg font-semibold">
                  Add Aadhaar Image Back
                </h3>

                <label>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageChange("back", e)}
                  />
                  <span
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer 
                    hover:bg-blue-700"
                  >
                    Select From Browser
                  </span>
                </label>

                <p className="text-xs text-gray-500">File Size (Max 5 MB)</p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitImages}
              disabled={!frontImage || !backImage}
              className={`w-full py-3 rounded-xl text-white font-semibold text-lg
                ${
                  frontImage && backImage
                    ? "bg-[#039155] hover:bg-green-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
            >
              Submit
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Step3;
