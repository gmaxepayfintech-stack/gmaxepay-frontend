import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useCompany } from "../context/CompanyContext";
import { referalCodeCheck } from "../redux/action/retailerOnboardingAction";
import { useSelector, useDispatch } from "react-redux";
import OnboardingRetailerById from "./[id]";

const Welcome = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { company } = useCompany();
  const { referCode: urlReferralCode } = useParams();
  const [searchParams] = useSearchParams();
  const [referralCode, setReferralCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [referralCompleted, setReferralCompleted] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Check if skip parameter is in URL
  const shouldSkip = searchParams.get("skip") === "true";

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

  // Watch for success in Redux - when responseRefer is SUCCESS, navigate to onboarding
  useEffect(() => {
    if (responseRefer === "SUCCESS") {
      setReferralCompleted(true);
      // Get the referral code from the submission
      const submittedCode = referralCode?.trim().toUpperCase() || 
                           referralCodeResponse?.referCode ||
                           getReferCode();
      
      // Store referral code in localStorage
      if (submittedCode) {
        try {
          localStorage.setItem("referralCodeFromUrl", submittedCode);
        } catch (e) {
          console.error("Error storing referral code:", e);
        }
        navigate(`/unity/${submittedCode}`);
      } else {
        navigate("/unity");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [responseRefer]);

  const handleSignUp = () => {
    navigate("/unity");
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
    // Navigate directly to KYC page without referral code
    // Use a query parameter to indicate skip
    navigate("/unity?skip=true");
  };

  // Handle "New To Our Platform" button click
  const handleNewToPlatform = () => {
    // Navigate directly to KYC page without referral code
    navigate("/unity?skip=true");
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

  // Handle auto-start with URL referral code
  const handleAutoStartWithReferral = () => {
    if (urlReferralCode) {
      // Store referral code in localStorage
      try {
        localStorage.setItem("referralCodeFromUrl", urlReferralCode.toUpperCase());
      } catch (e) {
        console.error("Error storing referral code:", e);
      }
      navigate(`/unity/${urlReferralCode.toUpperCase()}`);
    }
  };

  // If URL has referral code and user clicked auto-start, show onboarding
  if (urlReferralCode && showOnboarding) {
    return <OnboardingRetailerById referralCode={urlReferralCode.toUpperCase()} />;
  }

  // If user clicked "Skip For Now" (skip=true in URL), show onboarding directly (referCode can be null)
  if (shouldSkip) {
    return <OnboardingRetailerById referralCode={null} />;
  }

  // If referCode is not there or null, show referral welcome component
  if (!referCode || referCode === null) {
    // If URL has referral code, show two options
    if (urlReferralCode) {
      return (
        <div className="w-full min-h-screen bg-white flex items-center justify-center px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 py-4 sm:py-5 md:py-6 lg:py-8">
          <div className="w-full max-w-[98%] sm:max-w-[480px] md:max-w-[520px] lg:max-w-[600px] xl:max-w-[650px] bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg p-3 sm:p-4 md:p-5 lg:p-6 xl:p-6 space-y-3 sm:space-y-3.5 md:space-y-4 lg:space-y-4 xl:space-y-5">
            {/* Title */}
            <h1 className="text-center text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl font-bold text-gray-800 mb-1 sm:mb-1.5 md:mb-2 lg:mb-2 xl:mb-2.5">
              Welcome
            </h1>

            {/* Subtitle */}
            <p className="text-center text-xs sm:text-sm md:text-sm lg:text-base xl:text-base text-gray-600 mb-3 sm:mb-3.5 md:mb-4 lg:mb-4 xl:mb-4.5">
              Choose an option to continue
            </p>

            {/* Option 1: Auto-start with referral code */}
            <button
              type="button"
              onClick={handleAutoStartWithReferral}
              className={`w-full text-white py-2 sm:py-2.5 md:py-3 lg:py-3 xl:py-3.5 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm md:text-sm lg:text-base xl:text-base transition shadow-md hover:bg-green-700 h-9 sm:h-10 md:h-11 lg:h-11 xl:h-12`}
              style={{
                backgroundColor: primaryColor,
              }}
            >
              Start KYC with Referral Code: {urlReferralCode.toUpperCase()}
            </button>

            {/* Option 2: Manual entry */}
            <div className="space-y-2.5 sm:space-y-3 md:space-y-3 lg:space-y-3.5 xl:space-y-4">
              <button
                type="button"
                onClick={handleNewToPlatform}
                className="w-full text-center text-xs sm:text-xs md:text-sm lg:text-sm xl:text-sm text-gray-600 hover:text-gray-800 transition underline cursor-pointer"
              >
                New To Our Platform ? Create Your Account
              </button>
              <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3 md:space-y-3 lg:space-y-3.5 xl:space-y-4">
                {/* Label */}
                <label
                  htmlFor="referral-code-welcome"
                  className="block text-xs sm:text-xs md:text-sm lg:text-sm xl:text-base font-medium text-gray-800 mb-1 sm:mb-1.5 md:mb-2 lg:mb-2 xl:mb-2"
                >
                  Enter Referral Code
                </label>

                {/* Input Field */}
                <div className="relative">
                  <img
                    src="/img/Export.png"
                    alt="Export"
                    className="absolute left-2.5 sm:left-3 md:left-3 lg:left-3.5 xl:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 lg:w-5 lg:h-5 xl:w-5.5 xl:h-5.5 opacity-70"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                  <div className="absolute left-8 sm:left-9 md:left-10 lg:left-11 xl:left-12 top-1/2 -translate-y-1/2 h-4 sm:h-4.5 md:h-5 lg:h-5 xl:h-5.5 w-px bg-gray-300" />
                  <input
                    id="referral-code-welcome"
                    type="text"
                    value={referralCode}
                    onChange={(e) => {
                      setReferralCode(e.target.value);
                      setError("");
                    }}
                    placeholder="Enter 9 Digit Code"
                    maxLength={9}
                    className={`w-full h-9 sm:h-10 md:h-11 lg:h-11 xl:h-12 border-2 rounded-lg sm:rounded-xl pl-8 sm:pl-10 md:pl-12 lg:pl-13 xl:pl-14 pr-2.5 sm:pr-3 md:pr-3 lg:pr-3.5 xl:pr-4 text-xs sm:text-sm md:text-sm lg:text-sm xl:text-base outline-none focus:border-[#039155] focus:border-opacity-100 transition ${error ? "border-red-500" : "border-gray-300"
                      }`}
                    disabled={loading}
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-2 sm:p-2.5 md:p-3 lg:p-3 xl:p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-xs sm:text-xs md:text-xs lg:text-sm">{error}</p>
                  </div>
                )}

                {/* Success Message */}
                {referralCodeMessage && referralCodeStatus === "SUCCESS" && (
                  <div className="p-2 sm:p-2.5 md:p-3 lg:p-3 xl:p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-700 text-xs sm:text-xs md:text-xs lg:text-sm">{referralCodeMessage}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !referralCode.trim()}
                  className={`w-full text-white py-2 sm:py-2.5 md:py-3 lg:py-3 xl:py-3.5 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm md:text-sm lg:text-base xl:text-base transition shadow-md h-9 sm:h-10 md:h-11 lg:h-11 xl:h-12 ${loading || !referralCode.trim()
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
              </form>
            </div>

            {/* Skip Button */}
            <button
              type="button"
              onClick={handleSkip}
              className="w-full bg-white border-2 border-gray-300 text-gray-800 py-2 sm:py-2.5 md:py-3 lg:py-3 xl:py-3.5 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm md:text-sm lg:text-base xl:text-base hover:bg-gray-50 transition h-9 sm:h-10 md:h-11 lg:h-11 xl:h-12"
            >
              Skip For Now
            </button>
          </div>
        </div>
      );
    }
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

      // Navigate to unity with referral code
      if (referCode) {
        navigate(`/unity/${referCode}`);
        return null;
      } else {
        navigate("/unity");
        return null;
      }
    }
    // If referCode exists but shouldn't show onboarding, fall through to show referral form
  }

  // Otherwise show referral code form
  return (
    <div className="w-full min-h-screen bg-white flex items-center justify-center px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 py-4 sm:py-5 md:py-6 lg:py-8">
      <div className="w-full max-w-[98%] sm:max-w-[480px] md:max-w-[520px] lg:max-w-[600px] xl:max-w-[650px] bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg p-3 sm:p-4 md:p-5 lg:p-6 xl:p-6 space-y-3 sm:space-y-3.5 md:space-y-4 lg:space-y-4 xl:space-y-5">
        {/* Title */}
        <h1 className="text-center text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl font-bold text-gray-800 mb-1 sm:mb-1.5 md:mb-2 lg:mb-2 xl:mb-2.5">
          Referral Code
        </h1>

        {/* Subtitle */}
        <p className="text-center text-xs sm:text-sm md:text-sm lg:text-base xl:text-base text-gray-600 mb-3 sm:mb-3.5 md:mb-4 lg:mb-4 xl:mb-4.5">
          Enter Your Referral Code To Unlock
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3 md:space-y-3 lg:space-y-3.5 xl:space-y-4">
          {/* Label */}
          <label
            htmlFor="referral-code"
            className="block text-xs sm:text-xs md:text-sm lg:text-sm xl:text-base font-medium text-gray-800 mb-1 sm:mb-1.5 md:mb-2 lg:mb-2 xl:mb-2"
          >
            Referral Code
          </label>

          {/* Input Field */}
          <div className="relative">
            <img
              src="/img/Export.png"
              alt="Export"
              className="absolute left-2.5 sm:left-3 md:left-3 lg:left-3.5 xl:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 lg:w-5 lg:h-5 xl:w-5.5 xl:h-5.5 opacity-70"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <div className="absolute left-8 sm:left-9 md:left-10 lg:left-11 xl:left-12 top-1/2 -translate-y-1/2 h-4 sm:h-4.5 md:h-5 lg:h-5 xl:h-5.5 w-px bg-gray-300" />
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
              className={`w-full h-9 sm:h-10 md:h-11 lg:h-11 xl:h-12 border-2 rounded-lg sm:rounded-xl pl-8 sm:pl-10 md:pl-12 lg:pl-13 xl:pl-14 pr-2.5 sm:pr-3 md:pr-3 lg:pr-3.5 xl:pr-4 text-xs sm:text-sm md:text-sm lg:text-sm xl:text-base outline-none focus:border-[#039155] focus:border-opacity-100 transition ${error ? "border-red-500" : "border-gray-300"
                }`}
              disabled={loading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-2 sm:p-2.5 md:p-3 lg:p-3 xl:p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-xs sm:text-xs md:text-xs lg:text-sm">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {referralCodeMessage && referralCodeStatus === "SUCCESS" && (
            <div className="p-2 sm:p-2.5 md:p-3 lg:p-3 xl:p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-xs sm:text-xs md:text-xs lg:text-sm">{referralCodeMessage}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !referralCode.trim()}
            className={`w-full text-white py-2 sm:py-2.5 md:py-3 lg:py-3 xl:py-3.5 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm md:text-sm lg:text-base xl:text-base transition shadow-md h-9 sm:h-10 md:h-11 lg:h-11 xl:h-12 ${loading || !referralCode.trim()
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
            className="w-full bg-white border-2 border-gray-300 text-gray-800 py-2 sm:py-2.5 md:py-3 lg:py-3 xl:py-3.5 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm md:text-sm lg:text-base xl:text-base hover:bg-gray-50 transition h-9 sm:h-10 md:h-11 lg:h-11 xl:h-12"
          >
            Skip For Now
          </button>
        </form>
      </div>
    </div>
  );
};

export default Welcome;

