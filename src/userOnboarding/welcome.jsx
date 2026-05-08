import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useCompany } from "../context/CompanyContext";
import { referalCodeCheck } from "../redux/action/retailerOnboardingAction";
import { useSelector, useDispatch } from "react-redux";
import secureLocalStorage from "react-secure-storage";
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

  const shouldSkip = searchParams.get("skip") === "true";

  const companyFromRedux = useSelector((state) => state?.company?.company);

  const companyData = companyFromRedux || company;

  const responseRefer = useSelector(
    (state) => state?.retailerOnboarding?.Success
  );
  const referralCodeResponse = useSelector(
    (state) => state?.retailerOnboarding?.referalResponse
  );

  useEffect(() => {
    try {
      const storedReferral = localStorage.getItem("referralCodeCompleted");
      const step1Completed = localStorage.getItem("step1Completed") === "true";

      const onboardingSteps = secureLocalStorage.getItem("onboardingSteps");
      if (onboardingSteps) {
        try {
          const stepsData = JSON.parse(onboardingSteps);
          if (stepsData?.allCompleted || stepsData?.kycStatus === "COMPLETED") {
            localStorage.removeItem("step1Completed");
            localStorage.removeItem("referralCodeFromUrl");
           
          }
        } catch (e) {
          console.error("Error parsing onboarding steps:", e);
        }
      }

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
  const referralCodeStatus = useSelector(
    (state) => state?.retailerOnboarding?.status
  );
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
      const submittedCode =
        referralCode?.trim().toUpperCase() ||
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
        if (
          parsed?.retailerOnboarding?.token ||
          parsed?.retailerOnboarding?.onboardingToken
        ) {
          return (
            parsed.retailerOnboarding.token ||
            parsed.retailerOnboarding.onboardingToken
          );
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
        localStorage.setItem(
          "referralCodeFromUrl",
          urlReferralCode.toUpperCase()
        );
      } catch (e) {
        console.error("Error storing referral code:", e);
      }
      navigate(`/unity/${urlReferralCode.toUpperCase()}`);
    }
  };

  // If URL has referral code and user clicked auto-start, show onboarding
  if (urlReferralCode && showOnboarding) {
    return (
      <OnboardingRetailerById referralCode={urlReferralCode.toUpperCase()} />
    );
  }

  // If user clicked "Skip For Now" (skip=true in URL), show onboarding directly (referCode can be null)
  if (shouldSkip) {
    return <OnboardingRetailerById referralCode={null} />;
  }
  // css for refferal card
  const pageWrapper =
    "min-h-screen w-full bg-white flex items-center justify-center px-3 sm:px-4 md:px-6 lg:px-8 py-4";

  const cardWrapper =
    "w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl bg-white rounded-xl md:rounded-2xl shadow-lg p-4 sm:p-5 md:p-6 space-y-4";

  // If referCode is not there or null, show referral welcome component
  if (!referCode || referCode === null) {
    // If URL has referral code, show two options
    if (urlReferralCode) {
      return (
        <div className={pageWrapper}>
          <div className={cardWrapper}>
            {/* Title */}
            <h1 className="text-center font-[Gilroy-Semibold] text-lg sm:text-xl md:text-2xl text-gray-800 mb-2">
              Welcome
            </h1>

            {/* Subtitle */}
            <p className="text-center text-xs sm:text-sm md:text-base text-gray-600 mb-4">
              Choose an option to continue
            </p>

            {/* Option 1: Auto-start with referral code */}
            <button
              type="button"
              onClick={handleAutoStartWithReferral}
              className="w-full h-10 md:h-11 rounded-lg md:rounded-xl font-[Gilroy-Semibold] text-sm md:text-base shadow-md transition hover:bg-green-700 truncate whitespace-nowrap overflow-hidden text-ellipsis"
              style={{
                backgroundColor: primaryColor,
              }}
            >
              Start KYC with Referral Code: {urlReferralCode.toUpperCase()}
            </button>

            {/* Option 2: Manual entry */}
            <div className="space-y-3 md:space-y-4">
              <button
                type="button"
                onClick={handleNewToPlatform}
                className="w-full text-center text-xs md:text-sm text-gray-600 hover:text-gray-800 transition underline cursor-pointer"
              >
                New To Our Platform ? Create Your Account
              </button>
              <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                {/* Label */}
                <label
                  htmlFor="referral-code-welcome"
                  className="block text-xs md:text-sm font-[Gilroy-Medium] text-gray-800 mb-2"
                >
                  Enter Referral Code
                </label>

                {/* Input Field */}
                <div className="relative">
                  <img
                    src="/img/Export.png"
                    alt="Export"
                    className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 opacity-70"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                  <div className="absolute left-9 md:left-11 top-1/2 -translate-y-1/2 h-4 md:h-5 w-px bg-gray-300" />
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
                    className={`w-full h-10 md:h-11 border-2 rounded-lg md:rounded-xl pl-10 md:pl-12 pr-3 text-sm md:text-base outline-none transition ${
                      error ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={loading}
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-2 sm:p-2.5 md:p-3 lg:p-3 xl:p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-xs sm:text-xs md:text-xs lg:text-sm">
                      {error}
                    </p>
                  </div>
                )}

                {/* Success Message */}
                {referralCodeMessage && referralCodeStatus === "SUCCESS" && (
                  <div className="p-2 sm:p-2.5 md:p-3 lg:p-3 xl:p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-700 text-xs sm:text-xs md:text-xs lg:text-sm">
                      {referralCodeMessage}
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !referralCode.trim()}
                  className={`w-full h-10 md:h-11 rounded-lg md:rounded-xl font-[Gilroy-Semibold] text-sm md:text-base shadow-md transition ${
                    loading || !referralCode.trim()
                      ? "bg-gray-400 cursor-not-allowed opacity-70"
                      : "hover:bg-green-700"
                  }`}
                  style={{
                    backgroundColor:
                      loading || !referralCode.trim()
                        ? undefined
                        : primaryColor,
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
              className="w-full h-10 md:h-11 bg-white border-2 border-gray-300 text-gray-800 rounded-lg md:rounded-xl font-[Gilroy-Semibold] text-sm md:text-base hover:bg-gray-50 transition"
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
    const shouldShowOnboarding =
      isFreshSuccess || (referralCompleted && step1Completed);

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
    <div className={pageWrapper}>
      <div className={cardWrapper}>
        {/* Title */}
        <h1 className="text-center text-[#1B1717] font-['Gilroy-SemiBold'] text-lg sm:text-xl md:text-2xl  mb-2">
          Referral Code
        </h1>

        {/* Subtitle */}
        <p className="text-center text-xs sm:text-sm md:text-base text-[#1B1717] font-['Gilroy-regular'] mb-4">
          Enter Your Referral Code To Unlock
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
          {/* Label */}
          <label
            htmlFor="referral-code"
            className="block text-base md:text-lg text-[#1B1717] font-['Gilroy-SemiBold'] mb-2"
          >
            Referral Code
          </label>

          {/* Input Field */}
          <div className="relative">
            <img
              src="/img/Export.png"
              alt="Export"
              className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 text-[#1B1717]/70"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <div className="absolute left-9 md:left-11 top-1/2 -translate-y-1/2 h-4 md:h-5 w-px bg-[#1B1717]/70" />
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
              className={` w-full h-10 md:h-12 border-[0.5px]  rounded-lg md:rounded-xl pl-10 md:pl-14   font-['Gilroy-medium'] text-[#1B1717]/70 text-sm md:text-base outline-none transition ${
                error ? "border-red-500" : "border-[#1B1717]/80"
              }`}
              disabled={loading}
            />
          </div>

          {/* Error Message */}

          {error && (
            <div className="p-2 sm:p-2.5 md:p-3 lg:p-3 xl:p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 font-[Gilroy-medium] text-xs md:text-sm">
                {error}
              </p>
            </div>
          )}

          {/* Success Message */}
          {referralCodeMessage && referralCodeStatus === "SUCCESS" && (
            <div className="p-2 sm:p-2.5 md:p-3 lg:p-3 xl:p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-xs md:text-sm">
                {referralCodeMessage}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !referralCode.trim()}
            className={`w-full h-10 md:h-11 rounded-lg md:rounded-xl font-[Gilroy-Semibold] text-sm md:text-base transition shadow-md ${
              loading || !referralCode.trim()
                ? "bg-gray-400 cursor-not-allowed opacity-70"
                : "hover:bg-[#039155] text-white "
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
            className="w-full h-10 md:h-11 bg-white border-[0.5px] border-[#1B1717]/80 rounded-lg md:rounded-xl font-[Gilroy-medium] text-[#1B1717]/80 text-sm md:text-base hover:bg-gray-50 transition"
          >
            Skip For Now
          </button>
        </form>
      </div>
    </div>
  );
};

export default Welcome;
