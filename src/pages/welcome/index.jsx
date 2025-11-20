import React from "react";
import { useNavigate } from "react-router-dom";
import { useCompany } from "../../context/CompanyContext";

const Welcome = () => {
  const navigate = useNavigate();
  const { company } = useCompany();

  const title = company?.companyName || "GMAXEPAY";
  const primaryColor = company?.primaryColor || "#039155";
  const secondaryColor = company?.secondaryColor || "#0c7a44";

  const handleSignUp = () => {
    const onboardingToken =
      company?.retailerOnboardingToken ||
      company?.onboardingToken ||
      company?.defaultOnboardingToken ||
      company?.onboardingLinkToken ||
      null;

    if (onboardingToken) {
      navigate(
        `/retailer-onboarding?token=${encodeURIComponent(onboardingToken)}`
      );
      return;
    }

    if (company?.signupPageUrl) {
      window.open(company.signupPageUrl, "_blank", "noopener,noreferrer");
      return;
    }
    if (company?.website) {
      window.open(company.website, "_blank", "noopener,noreferrer");
      return;
    }

    navigate("/retailer-onboarding");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 sm:p-12 text-center">
        <div className="flex flex-col items-center gap-4 mb-10">
          <img
            src={company?.logo || "/img/gmaxepay.png"}
            alt={title}
            className="h-20 object-contain"
            onError={(e) => {
              e.target.src = "/img/gmaxepay.png";
            }}
          />
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
            Welcome to {title}
          </p>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight mb-6">
          Powerful Fintech Infrastructure for Modern Businesses
        </h1>

        <p className="text-lg text-slate-600 leading-relaxed mb-10">
          Set up your account in minutes and start offering banking, payments,
          recharge, and utility services to your customers. Join India&apos;s
          fastest growing white-label fintech platform.
        </p>

        <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center">
          <button
            onClick={handleSignUp}
            className="px-8 py-4 rounded-xl text-white text-lg font-semibold shadow-lg transition-all duration-200"
            style={{ backgroundColor: secondaryColor }}
          >
            Sign Up
          </button>
          <button
            onClick={() => navigate("/auth/login")}
            className="px-8 py-4 rounded-xl text-white text-lg font-semibold shadow-lg transition-all duration-200"
            style={{ backgroundColor: primaryColor }}
          >
            Back to Login
          </button>
          <button
            onClick={() => navigate("/auth/login")}
            className="px-8 py-4 rounded-xl border border-slate-200 text-lg font-semibold text-slate-800 hover:bg-slate-50 transition-all duration-200"
          >
            Request Demo
          </button>
        </div>

        <p className="mt-10 text-sm text-slate-500">
          Need help? Reach us at{" "}
          <span className="font-semibold">
            {company?.customerSupportEmail || "support@gmaxepay.com"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Welcome;

