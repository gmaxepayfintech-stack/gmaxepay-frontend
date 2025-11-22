import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCompany } from "../../context/CompanyContext";
import { referalCodeCheck } from "../../redux/action/retailerOnboardingAction";
import { useSelector, useDispatch } from "react-redux";
import OnboardingRetailerById from "../../retailerOnboarding/[id]";

const Welcome = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { company } = useCompany();
  const [referralCode, setReferralCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [referralCompleted, setReferralCompleted] = useState(false);

  const companyFromRedux = useSelector((state) => state?.company?.company);

  const companyData = companyFromRedux || company;

  const responseRefer = useSelector(
    (state) => state?.retailerOnboarding?.Success
  );
  console.log("responseRefer", responseRefer);
  const referralCodeResponse = useSelector(
    (state) => state?.retailerOnboarding?.referalResponse
  );


  useEffect(() => {
    try {
      const storedReferral = localStorage.getItem("referralCodeCompleted");
      const step1Completed = localStorage.getItem("step1Completed") === "true";

      if (storedReferral) {
        const parsed = JSON.parse(storedReferral);
        if (parsed?.status === "SUCCESS") {

          if (step1Completed) {
            setReferralCompleted(true);
          } else {
            // Step 1 not completed, clear the referral completed flag
            // so user sees the referral UI again
            setReferralCompleted(false);
          }
        }
      }
    } catch (e) {
      console.error("Error reading referral code from localStorage:", e);
    }
  }, []);

  const primaryColor = companyData?.primaryColor || "#039155";

  // Get referral code status from Redux
  const referralCodeStatus = useSelector((state) => state?.retailerOnboarding?.status);
  const referralCodeError = useSelector(
    (state) => state?.retailerOnboarding?.retailerOnboarding?.error
  );

  const referralCodeMessage = useSelector(
    (state) => state?.retailerOnboarding?.retailerOnboarding
  );

  useEffect(() => {
    if (referralCodeError) {
      setError(referralCodeError);
    }
  }, [referralCodeError]);

  // Watch for success in Redux - when responseRefer is SUCCESS, immediately show onboarding
  useEffect(() => {
    if (responseRefer === "SUCCESS") {
      setReferralCompleted(true);
    }
  }, [responseRefer]);

  const handleSignUp = () => {
    const onboardingToken =
      companyData?.retailerOnboardingToken ||
      companyData?.onboardingToken ||
      companyData?.defaultOnboardingToken ||
      companyData?.onboardingLinkToken ||
      null;

    if (onboardingToken) {
      navigate(
        `/retailer-onboarding?token=${encodeURIComponent(onboardingToken)}`
      );
      return;
    }

    if (companyData?.signupPageUrl) {
      window.open(companyData.signupPageUrl, "_blank", "noopener,noreferrer");
      return;
    }
    if (companyData?.website) {
      window.open(companyData.website, "_blank", "noopener,noreferrer");
      return;
    }

    navigate("/retailer-onboarding");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Validate referral code
    const trimmedCode = referralCode?.trim() || "";
    if (trimmedCode.length !== 9) {
      setError("Please enter a valid 9-digit referral code");
      return;
    }

    setLoading(true);

    // Prepare request body
    const requestBody = {
      referCode: trimmedCode.toUpperCase(),
    };

    // Dispatch the action with referral code and company data
    dispatch(referalCodeCheck(requestBody, companyData))
      .then(() => {
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const handleSkip = () => {
    handleSignUp();
  };

  // Get onboarding token from company data, Redux state, or localStorage
  const getOnboardingToken = () => {
    // First check localStorage for stored referral response
    try {
      const storedReferral = localStorage.getItem("referralCodeCompleted");
      if (storedReferral) {
        const parsed = JSON.parse(storedReferral);
        if (parsed?.retailerOnboarding?.token || parsed?.retailerOnboarding?.onboardingToken) {
          return parsed.retailerOnboarding.token || parsed.retailerOnboarding.onboardingToken;
        }
      }
    } catch (e) {
      console.error("Error reading token from localStorage:", e);
    }

    // Check Redux state for token from referral response
    if (
      referralCodeResponse?.retailerOnboarding?.token ||
      referralCodeResponse?.retailerOnboarding?.onboardingToken
    ) {
      return (
        referralCodeResponse.retailerOnboarding.token ||
        referralCodeResponse.retailerOnboarding.onboardingToken
      );
    }

    // Fallback to company data
    return (
      companyData?.retailerOnboardingToken ||
      companyData?.onboardingToken ||
      companyData?.defaultOnboardingToken ||
      companyData?.onboardingLinkToken ||
      null
    );
  };

  // Check if referCode exists in localStorage
  const getReferCode = () => {
    try {
      const storedReferral = localStorage.getItem("referralCodeCompleted");
      if (storedReferral) {
        const parsed = JSON.parse(storedReferral);
        return parsed?.referCode || null;
      }
    } catch (e) {
      console.error("Error reading referCode from localStorage:", e);
    }
    return null;
  };

  const referCode = getReferCode();

  // If referCode is not there or null, show referral welcome component
  if (!referCode || referCode === null) {
    // Show referral form - will be returned at the end
  } else {
    // If referCode exists, check if we should show onboarding
    // If responseRefer is SUCCESS (fresh submission), immediately show onboarding
    // On refresh: if step1 is not completed, show referral UI again
    const step1Completed = localStorage.getItem("step1Completed") === "true";

    // Fresh success: show onboarding immediately
    // On refresh: only show onboarding if step1 is also completed
    const isFreshSuccess = responseRefer === "SUCCESS";
    const shouldShowOnboarding = isFreshSuccess || (referralCompleted && step1Completed);

    if (shouldShowOnboarding) {
      const onboardingToken = getOnboardingToken();

      // Set token in localStorage if available
      if (onboardingToken) {
        localStorage.setItem("onboardingToken", onboardingToken);
      }

      return <OnboardingRetailerById />;
    }
    // If referCode exists but shouldn't show onboarding, fall through to show referral form
  }

  // Otherwise show referral code form
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6 sm:p-8">
        {/* Title */}
        <h1 className="text-center text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          Referral Code
        </h1>

        {/* Subtitle */}
        <p className="text-center text-sm sm:text-base text-gray-600 mb-6">
          Enter Your Referral Code To Unlock
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Label */}
          <label
            htmlFor="referral-code"
            className="block text-sm sm:text-base font-medium text-gray-800 mb-2"
          >
            Referral Code
          </label>

          {/* Input Field */}
          <div className="relative mb-6">
            <img
              src="/img/Export.png"
              alt="Export"
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 opacity-70"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <div className="absolute left-9 sm:left-11 top-1/2 -translate-y-1/2 h-5 sm:h-6 w-px bg-gray-300" />
            <input
              id="referral-code"
              type="text"
              value={referralCode}
              onChange={(e) => {
                setReferralCode(e.target.value);
                setError(""); // Clear error when user types
              }}
              placeholder="Enter 9 Digit Code"
              maxLength={9}
              className={`w-full h-12 sm:h-14 md:h-16 border rounded-lg pl-11 sm:pl-14 pr-4 text-sm sm:text-base outline-none focus:border-[#1B1717] focus:border-2 ${error ? "border-red-500" : "border-gray-300"
                }`}
              style={{ focusBorderColor: primaryColor }}
              disabled={loading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {referralCodeMessage && referralCodeStatus === "SUCCESS" && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm">{referralCodeMessage}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !referralCode.trim()}
            className={`w-full text-white py-3 sm:py-3.5 md:py-4 rounded-lg font-semibold text-base sm:text-lg transition shadow-md mb-3 ${loading || !referralCode.trim()
              ? "bg-gray-400 cursor-not-allowed opacity-70"
              : "hover:bg-green-700"
              }`}
            style={{
              backgroundColor:
                loading || !referralCode.trim() ? undefined : primaryColor,
            }}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>

          {/* Skip Button */}
          <button
            type="button"
            onClick={handleSkip}
            className="w-full bg-white border border-gray-300 text-gray-800 py-3 sm:py-3.5 md:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-gray-50 transition"
          >
            Skip For Now
          </button>
        </form>
      </div>
    </div>
  );
};

export default Welcome;
