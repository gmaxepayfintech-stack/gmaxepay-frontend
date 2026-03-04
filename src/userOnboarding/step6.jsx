import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { postBankDetails } from "../redux/action/retailerOnboardingAction";
import { useCompany } from "../context/CompanyContext";
import { useNotification } from "../context/NotificationContext";
import secureLocalStorage from "react-secure-storage";
import { HiArrowLeft } from "react-icons/hi2";

function Step6({ formData, setFormData, onNext, onBack, onShowSteps }) {
  const { referCode: urlReferralCode } = useParams();
  const dispatch = useDispatch();
  const { company } = useCompany();
  const { showNotification } = useNotification();
  const companyFromRedux = useSelector((state) => state?.company?.company);
  const companyData = companyFromRedux || company;

  // Get bank details status from Redux (needed in onSubmit)
  const bankDetailsStatus = useSelector(
    (state) => state?.retailerOnboarding?.bankDetailsStatus,
  );
  const bankDetailsResponse = useSelector(
    (state) => state?.retailerOnboarding?.bankDetailsResponse,
  );
  const bankDetailsError = useSelector(
    (state) => state?.retailerOnboarding?.bankDetailsError,
  );

  const validationSchema = Yup.object({
    bankAccountNumber: Yup.string()
      .matches(/^\d{11,18}$/, "Account number must be between 11 and 18 digits")
      .required("Account number is required"),
    ifscCode: Yup.string()
      .required("IFSC code is required")
      .test("length", "IFSC code must be exactly 11 characters", (value) => {
        if (!value) return false;
        return value.length === 11;
      })
      .test("format", "Enter valid IFSC code (e.g., ABCD0123456)", (value) => {
        if (!value || value.length !== 11) return true; // Don't validate format if not 11 chars
        return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(value);
      }),
  });

  const formik = useFormik({
    initialValues: {
      bankAccountNumber: formData.bankAccountNumber || "",
      ifscCode: formData.ifscCode || "",
      beneficiaryName: formData.beneficiaryName || "",
    },
    validationSchema,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: async () => {
      const errors = await formik.validateForm();
      if (Object.keys(errors).length > 0) {
        formik.setTouched({
          bankAccountNumber: true,
          ifscCode: true,
        });
        return;
      }

      // Check if bank details are verified - check multiple sources
      const isVerified =
        formData.ifscVerified || bankDetailsStatus === "SUCCESS";
      const hasBeneficiaryName =
        formik.values.beneficiaryName || formData.beneficiaryName;

      if (isVerified && hasBeneficiaryName) {
        // Show success notification
        showNotification({
          type: "success",
          message: "Bank details verified successfully",
        });

        // Show steps page instead of redirecting
        if (onShowSteps) {
          onShowSteps();
        }
      } else {
        // If not verified, show error
        showNotification({
          type: "error",
          message:
            "Please verify bank details first by clicking the Verify button",
        });
      }
    },
  });

  // Get token from secureLocalStorage
  const getToken = () => {
    try {
      return secureLocalStorage.getItem("onboardingToken");
    } catch (e) {
      console.error("Error getting token:", e);
      return null;
    }
  };

  // Get referCode from URL or localStorage
  const getReferCode = () => {
    if (urlReferralCode) return urlReferralCode.toUpperCase();
    try {
      const stored = localStorage.getItem("referralCodeFromUrl");
      if (stored) return stored.toUpperCase();
    } catch (e) {
      console.error("Error reading referCode:", e);
    }
    return null;
  };

  const handleVerify = async () => {
    await formik.validateField("bankAccountNumber");
    await formik.validateField("ifscCode");

    if (formik.errors.bankAccountNumber || formik.errors.ifscCode) {
      formik.setTouched({
        bankAccountNumber: true,
        ifscCode: true,
      });
      return;
    }

    const token = getToken();
    if (!token) {
      showNotification({
        type: "error",
        message: "Token is missing. Please try again.",
      });
      return;
    }

    if (formik.values.bankAccountNumber && formik.values.ifscCode) {
      dispatch(
        postBankDetails(
          {
            account_number: formik.values.bankAccountNumber,
            ifsc: formik.values.ifscCode,
          },
          companyData,
          token,
        ),
      );
    }
  };

  useEffect(() => {
    if (bankDetailsStatus === "SUCCESS" && bankDetailsResponse) {
      const bankData =
        bankDetailsResponse?.bankDetailsResponse || bankDetailsResponse;
      const beneficiaryName =
        bankData?.nameMatching?.bankHolderName ||
        bankData?.beneficiary_name ||
        bankData?.name ||
        bankData?.account_holder_name ||
        "Auto Fetched";

      setFormData((d) => ({
        ...d,
        ifscVerified: true,
        beneficiaryName: beneficiaryName,
      }));

      formik.setFieldValue("beneficiaryName", beneficiaryName);

      showNotification({
        type: "success",
        message:
          bankDetailsResponse?.message || "Bank details verified successfully",
      });
    }
  }, [
    bankDetailsStatus,
    bankDetailsResponse,
    showNotification,
    setFormData,
    formik,
  ]);

  // Handle error notifications
  useEffect(() => {
    if (bankDetailsStatus === "FAILURE" && bankDetailsError) {
      const errorMessage =
        typeof bankDetailsError === "string"
          ? bankDetailsError
          : bankDetailsError?.message ||
          "Failed to verify bank details. Please try again.";

      showNotification({
        type: "error",
        message: errorMessage,
      });
    }
  }, [bankDetailsStatus, bankDetailsError, showNotification]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    if (name === "bankAccountNumber") {
      // Only allow digits and limit to 11
      processedValue = value.replace(/\D/g, "").slice(0, 18);
    } else if (name === "ifscCode") {
      // Convert to uppercase and limit to 11 characters
      processedValue = value.toUpperCase().slice(0, 11);
    }

    formik.setFieldValue(name, processedValue);
    setFormData((d) => ({ ...d, [name]: processedValue }));

    if (name === "ifscCode" && formData.ifscVerified) {
      setFormData((d) => ({
        ...d,
        ifscVerified: false,
        beneficiaryName: "",
      }));
      formik.setFieldValue("beneficiaryName", "");
    }
  };

  const isNextEnabled =
    formik.values.bankAccountNumber &&
    formik.values.ifscCode &&
    !formik.errors.bankAccountNumber &&
    !formik.errors.ifscCode &&
    formData.ifscVerified &&
    formik.values.beneficiaryName;

  return (
    <div className="w-full h-full flex justify-center items-center bg-gray-50 p-2 sm:p-3 md:p-4 lg:p-4 xl:p-5 overflow-hidden pt-2 sm:pt-0 md:pt-1 lg:pt-1 xl:pt-2">
      <div className="w-full max-w-[98%] sm:max-w-[480px] md:max-w-[520px] lg:max-w-[580px] xl:max-w-[600px] 2xl:max-w-[700px] bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg p-3 sm:p-4 md:p-5 lg:p-5 xl:p-6 mx-auto">
        {/* TITLE WITH BACK BUTTON (REFERENCE MATCH) */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-1 sm:mb-1.5 md:mb-2 lg:mb-2 xl:mb-3 relative">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 xl:w-10 xl:h-10 border border-gray-400 rounded-full cursor-pointer hover:bg-gray-50 transition-colors flex-shrink-0 bg-transparent p-0 absolute left-0"
              aria-label="Back to Steps"
            >
              <HiArrowLeft className="text-base sm:text-lg md:text-xl lg:text-xl xl:text-xl text-[#1B1717] opacity-80" />
            </button>
          )}

          <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-2xl font-[Gilroy-Semibold] text-center text-[#1B1717]">
            Bank Details
          </h3>
        </div>

        <p className="text-[#1B1717] font-[Gilroy-Regular] text-xs sm:text-xs md:text-sm lg:text-base xl:text-base text-center mb-2.5 sm:mb-3 md:mb-3.5 lg:mb-3 xl:mb-4">
          Tell Us About Bank Details
        </p>

        {/* ACCOUNT NUMBER */}
        <div className="mb-3 md:mb-4">
          <label
            htmlFor="bankAccountNumber"
            className="block text-xs md:text-sm font-[Gilroy-Semibold] text-[#1B1717] mb-2"
          >
            Account Number
          </label>

          <div className="relative">
            <img
              src="/img/User.png"
              alt="Account"
              className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 opacity-70 z-10"
            />

            <div className="absolute left-9 md:left-11 top-1/2 -translate-y-1/2 h-4 md:h-5 w-px bg-gray-300" />

            <input
              type="text"
              id="bankAccountNumber"
              name="bankAccountNumber"
              value={formik.values.bankAccountNumber}
              onChange={handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter Account Number"
              maxLength={18}
              inputMode="numeric"
              className={`w-full h-10 md:h-11 lg:h-14 border-[0.5px]
              font-[Gilroy-Medium]
              ${formik.errors.bankAccountNumber &&
                  formik.touched.bankAccountNumber
                  ? "border-red-500"
                  : "border-[#1B1717]/80"
                }
              rounded-lg
              pl-10 md:pl-12 lg:pl-14
              pr-3
              text-sm md:text-base
              outline-none
              focus:border-[#1B1717]/80
              transition
            `}
            />
          </div>

          {formik.errors.bankAccountNumber &&
            formik.touched.bankAccountNumber && (
              <p className="text-red-500 text-xs md:text-sm mt-1.5">
                {formik.errors.bankAccountNumber}
              </p>
            )}
        </div>

        {/* IFSC */}
        <div className="mb-3 md:mb-4">
          <label
            htmlFor="ifscCode"
            className="block text-xs md:text-sm font-[Gilroy-Semibold] text-[#1B1717] mb-2"
          >
            IFSC Code
          </label>

          <div className="flex flex-row gap-0">
            <div className="relative flex-grow">
              <img
                src="/img/ListMagnifyingGlass.png"
                alt="IFSC"
                className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 opacity-70 z-10"
              />

              <div className="absolute left-9 md:left-11 top-1/2 -translate-y-1/2 h-4 md:h-5 w-px bg-gray-300" />

              <input
                type="text"
                id="ifscCode"
                name="ifscCode"
                value={formik.values.ifscCode}
                onChange={handleChange}
                onBlur={(e) => {
                  formik.handleBlur(e);
                  if (formik.values.ifscCode) {
                    formik.validateField("ifscCode");
                  }
                }}
                placeholder="Enter IFSC Code"
                maxLength={11}
                className={`w-full h-10 md:h-11 lg:h-14 border-[0.5px] border-r-0
                font-[Gilroy-Medium]
                ${formik.errors.ifscCode && formik.touched.ifscCode
                    ? "border-red-500"
                    : "border-[#1B1717]/80"
                  }
                rounded-l-lg
                pl-10 md:pl-12 lg:pl-14
                pr-3
                text-sm md:text-base
                outline-none uppercase
                focus:border-[#1B1717]/80
                transition
              `}
              />
            </div>

            <button
              type="button"
              onClick={handleVerify}
              disabled={
                !formik.values.ifscCode || formik.values.ifscCode.length !== 11
              }
              className={`h-10 md:h-11 lg:h-14
              px-3 md:px-4
              border-[0.5px] border-l-0
              ${formik.errors.ifscCode ? "border-red-500" : "border-[#039155]"}
              rounded-r-lg text-white
              font-[Gilroy-Semibold]
              text-xs md:text-sm
              whitespace-nowrap
              shadow-md
              transition
              flex-shrink-0
              ${!formik.values.ifscCode || formik.values.ifscCode.length !== 11
                  ? "bg-[#039155] cursor-not-allowed"
                  : "bg-[#039155] hover:bg-green-700 active:scale-95"
                }
            `}
            >
              Verify
            </button>
          </div>

          {formik.errors.ifscCode && formik.touched.ifscCode && (
            <p className="text-red-500 text-xs md:text-sm mt-1.5">
              {formik.errors.ifscCode}
            </p>
          )}
        </div>

        {/* BENEFICIARY NAME */}
        <div className="mb-3 md:mb-4">
          <label
            htmlFor="beneficiaryName"
            className="block text-xs md:text-sm font-[Gilroy-Semibold] text-[#1B1717] mb-2"
          >
            Beneficiary Name
          </label>

          <div className="relative">
            <img
              src="/img/UserSquare.png"
              alt="Beneficiary"
              className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 opacity-70 z-10"
            />

            <div className="absolute left-9 md:left-11 top-1/2 -translate-y-1/2 h-4 md:h-5 w-px bg-gray-300" />

            <input
              type="text"
              id="beneficiaryName"
              name="beneficiaryName"
              value={formik.values.beneficiaryName}
              readOnly={!formData.ifscVerified}
              placeholder="Auto Fetch"
              className={`w-full h-10 md:h-11 lg:h-14 border-[0.5px]
              font-[Gilroy-Medium]
              border-[#1B1717]/80
              rounded-lg
              pl-10 md:pl-12 lg:pl-14
              pr-3
              text-sm md:text-base
              outline-none
              transition
              ${!formData.ifscVerified
                  ? "bg-gray-50 cursor-not-allowed"
                  : "focus:border-[#1B1717]/80"
                }
            `}
            />
          </div>
        </div>

        {/* NEXT BUTTON */}
        <button
          type="button"
          onClick={formik.handleSubmit}
          disabled={!isNextEnabled}
          className={`w-full h-10 md:h-11 lg:h-14 bg-[#039155] text-white rounded-lg md:rounded-xl font-[Gilroy-Semibold] text-sm md:text-base transition shadow-lg flex items-center justify-center ${!isNextEnabled
              ? "opacity-70 cursor-not-allowed"
              : "hover:bg-green-700 active:scale-95"
            }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Step6;
