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

  // 👉 Redux selectors
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

  // 🔥 OPEN DIGILOCKER URL WHEN SUCCESS
  useEffect(() => {
    if (digilockerSuccess === "Success" && url) {
      window.location.href = url;
    }
  }, [digilockerSuccess, url]);

  // 🔥 VERIFY Aadhaar (DigiLocker connect)
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
    if (!verification_id || !reference_id || !document_type) {
      console.error("Missing Aadhaar download parameters!");
      return;
    }

    const payload = {
      verification_id,
      reference_id,
      document_type,
    };

    console.log("Dispatching Aadhaar Download:", payload);

    dispatch(aadhaarDownload(payload));
  };

  return (
    <div className="w-[750px]">
      <div className="space-y-8 mr-32 p-6">
        {/* Header */}
        <div className="text-center max-w-[450px] mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Aadhar Verification
          </h1>
          <p className="text-gray-600">
            Connect Your DigiLocker For Instant Document Verification
          </p>
        </div>

        {/* Main Box */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-dashed border-gray-400 rounded-2xl p-8 max-w-[450px] mx-auto">
          <div className="flex items-start gap-4">
            <img
              src="/img/Digilocker1.png"
              alt="DigiLocker"
              className="h-24 w-auto"
            />

            <div>
              <h3 className="text-[24px] font-semibold text-gray-900 mb-2">
                Aadhar Via DigiLocker
              </h3>
              <p className="text-[14px] text-gray-600">
                Fetch Aadhaar Document Securely From DigiLocker
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-6 mt-6">
            {/* DOWNLOAD */}
            <button
              type="button"
              onClick={handleDownload}
              className="flex-1 px-8 py-2 h-[52px] text-lg rounded-2xl border-2 border-[#1B1717] border-opacity-80 text-gray-700 font-medium hover:bg-gray-100 transition"
            >
              Download
            </button>

            {/* VERIFY */}
            <button
              type="button"
              onClick={handleVerify}
              disabled={loading || isVerified}
              className={`flex-1 px-8 py-2 h-[52px] text-lg rounded-2xl font-medium transition text-white 
                ${
                  isVerified
                    ? "bg-green-600 cursor-not-allowed"
                    : "bg-[#039155] hover:bg-green-700"
                }`}
            >
              {loading ? "Verifying..." : isVerified ? "Verified ✓" : "Verify"}
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3 max-w-[450px] mx-auto">
          <svg
            className="h-5 w-5 text-blue-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>

          <div>
            <h4 className="font-semibold text-blue-900 text-[14px] mb-1">
              Secure Document Verification
            </h4>
            <p className="text-[12px] text-blue-800">
              Documents are fetched directly from DigiLocker using secure APIs.
            </p>
          </div>
        </div>

        {/* Next */}
        <button
          type="button"
          onClick={onNext}
          className="w-full py-3 ml-[60px] rounded-lg font-semibold text-white text-lg bg-[#039155] max-w-[450px] mx-auto"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Step3;
