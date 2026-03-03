import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { postBankDetails } from "../redux/action/onboardingAction";
import { useNotification } from "../context/NotificationContext";

function Step6({ formData, setFormData, onNext, onRefreshSteps }) {
  const dispatch = useDispatch();
  const { error: notifyError, success: notifySuccess } = useNotification();
  const validationSchema = Yup.object({
    bankAccountNumber: Yup.string()
      .matches(/^\d{9,18}$/, "Account number must be 9-18 digits")
      .required("Account number is required"),
    ifscCode: Yup.string()
      .matches(
        /^[A-Z]{4}0[A-Z0-9]{6}$/,
        "Enter valid IFSC code (e.g., ABCD0123456)",
      )
      .required("IFSC code is required"),
  });

  const formik = useFormik({
    initialValues: {
      bankAccountNumber: formData.bankAccountNumber || "",
      ifscCode: formData.ifscCode || "",
      beneficiaryName: formData.beneficiaryName || "",
    },
    validationSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async () => {
      // Validate all fields before submitting
      const errors = await formik.validateForm();
      if (Object.keys(errors).length > 0) {
        formik.setTouched({
          bankAccountNumber: true,
          ifscCode: true,
        });
        return;
      }

      // Check if IFSC is verified and beneficiary name is fetched
      if (formData.ifscVerified && formik.values.beneficiaryName) {
        // Refresh steps after successful completion
        if (onRefreshSteps) {
          onRefreshSteps();
        }
        onNext();
      }
    },
  });

  const handleVerify = async () => {
    // Validate both account number and IFSC code
    // validateField returns the error message or undefined
    const accountError = await formik.validateField("bankAccountNumber");
    const ifscError = await formik.validateField("ifscCode");

    // Mark fields as touched to show errors
    formik.setTouched({
      bankAccountNumber: true,
      ifscCode: true,
    });

    // Check if there are errors
    if (accountError || ifscError) {
      return;
    }

    // Call API to verify and fetch beneficiary name
    const token = localStorage.getItem("onboardingToken");
    if (token && formik.values.bankAccountNumber && formik.values.ifscCode) {
      const res = await dispatch(
        postBankDetails(
          {
            account_number: formik.values.bankAccountNumber,
            ifsc: formik.values.ifscCode,
          },
          token,
        ),
      );

      if (res?.status === "SUCCESS") {
        notifySuccess(res?.message || "Bank details verified successfully");
      } else {
        notifyError(res?.message || "Failed to verify bank details");
      }
    }
  };

  // Get bank details response from Redux
  const bankDetailsStatus = useSelector(
    (state) => state?.onboarding?.bankDetailsStatus,
  );
  const bankDetailsResponse = useSelector(
    (state) => state?.onboarding?.bankDetailsResponse,
  );
  const bankDetailsError = useSelector(
    (state) => state?.onboarding?.bankDetailsError,
  );

  // Handle successful bank details verification
  useEffect(() => {
    if (bankDetailsStatus === "SUCCESS" && bankDetailsResponse) {
      // Extract beneficiary name from response
      // Response structure: bankDetailsResponse.nameMatching.bankHolderName
      // bankDetailsResponse is already the 'data' object from API response
      const beneficiaryName =
        bankDetailsResponse?.nameMatching?.bankHolderName ||
        bankDetailsResponse?.beneficiary_name ||
        bankDetailsResponse?.name ||
        bankDetailsResponse?.account_holder_name ||
        "Auto Fetched";

      setFormData((d) => ({
        ...d,
        ifscVerified: true,
        beneficiaryName: beneficiaryName,
      }));
      formik.setFieldValue("beneficiaryName", beneficiaryName);
    }
  }, [bankDetailsStatus, bankDetailsResponse, setFormData, formik]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle account number - only allow digits, max 18 (min 9 validated by Yup)
    if (name === "bankAccountNumber") {
      const numericValue = value.replace(/\D/g, "");
      const processedValue = numericValue.slice(0, 18);
      formik.setFieldValue(name, processedValue);
      setFormData((d) => ({ ...d, [name]: processedValue }));

      // Reset verification status if account number changes after verification
      if (
        formData.ifscVerified &&
        processedValue !== formData.bankAccountNumber
      ) {
        setFormData((d) => ({
          ...d,
          ifscVerified: false,
          beneficiaryName: "",
        }));
        formik.setFieldValue("beneficiaryName", "");
      }
      return;
    }

    // Convert IFSC code to uppercase
    const processedValue = name === "ifscCode" ? value.toUpperCase() : value;
    formik.setFieldValue(name, processedValue);
    setFormData((d) => ({ ...d, [name]: processedValue }));

    // Reset verification status if IFSC code changes
    if (name === "ifscCode" && formData.ifscVerified) {
      setFormData((d) => ({
        ...d,
        ifscVerified: false,
        beneficiaryName: "",
      }));
      formik.setFieldValue("beneficiaryName", "");
    }
  };

  // Check if Next button should be enabled
  const isNextEnabled =
    formik.values.bankAccountNumber &&
    formik.values.bankAccountNumber.length >= 9 &&
    formik.values.bankAccountNumber.length <= 18 &&
    formik.values.ifscCode &&
    !formik.errors.bankAccountNumber &&
    !formik.errors.ifscCode &&
    formData.ifscVerified &&
    formik.values.beneficiaryName;

  return (
    <div className="w-full h-full flex justify-center items-center  p-2 sm:p-3 md:p-4 overflow-hidden">
      <div className="w-full max-w-[98%] sm:max-w-[480px] md:max-w-[520px] lg:max-w-[580px] xl:max-w-[600px] 2xl:max-w-[700px]  mx-auto">
        {/* ================================================================= */}
        <h3 className="text-base sm:text-lg   font-[Gilroy-Semibold] text-center text-[#1B1717]">
          Bank Details
        </h3>
        <p className="text-[#1B1717]/80 font-[Gilroy-Medium] text-xs sm:text-xs md:text-sm lg:text-base xl:text-base text-center mb-2.5 sm:mb-3 md:mb-3.5 lg:mb-4 xl:mb-5 mt-2">
          Tell Us About Bank Details
        </p>

        {/* Account Number Section */}
        <div className="mb-3 md:mb-4">
          <label className="block text-lg font-[Gilroy-Semibold] text-[#1B1717] mb-2">
            Account Number
          </label>

          <div className="relative">
            <img
              src="/img/User.png"
              alt="Account"
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition ${formik.values.bankAccountNumber ? "opacity-100" : "opacity-50"
                }`}
            />

            <div
              className={`absolute left-11 top-1/2 -translate-y-1/2 h-6 w-px transition ${formik.values.bankAccountNumber ? "bg-[#1B1717]" : "bg-gray-300"
                }`}
            />

            <input
              type="text"
              name="bankAccountNumber"
              value={formik.values.bankAccountNumber}
              onChange={handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter Account Number (9-18 digits)"
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
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.bankAccountNumber}
              </p>
            )}
          {formik.values.bankAccountNumber &&
            !formik.errors.bankAccountNumber && (
              <p
                className={`text-sm mt-1 ${formik.values.bankAccountNumber.length >= 9 &&
                    formik.values.bankAccountNumber.length <= 18
                    ? "text-green-600"
                    : "text-gray-500"
                  }`}
              >
                {formik.values.bankAccountNumber.length} / 18 digits entered
                {formik.values.bankAccountNumber.length < 9 &&
                  " (minimum 9 required)"}
              </p>
            )}
        </div>

        {/* IFSC Code Section */}
        <div className="mb-3 md:mb-4">
          <label
            htmlFor="ifscCode"
            className="block text-xs md:text-lg font-[Gilroy-Semibold] text-[#1B1717] mb-2"
          >
            IFSC Code
          </label>

          <div className="flex flex-row gap-0">
            <div className="relative flex-grow">
              <img
                src="/img/ListMagnifyingGlass.png"
                alt="IFSC"
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition ${formik.values.ifscCode ? "opacity-100" : "opacity-50"
                  }`}
              />

              <div
                className={`absolute left-11 top-1/2 -translate-y-1/2 h-6 w-px transition ${formik.values.ifscCode ? "bg-[#1B1717]" : "bg-gray-300"
                  }`}
              />

              <input
                type="text"
                name="ifscCode"
                value={formik.values.ifscCode}
                onChange={handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter IFSC Code"
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
                style={{ textTransform: "uppercase" }}
              />
            </div>

            {/* Verify Button */}
            <button
              type="button"
              onClick={handleVerify}
              disabled={
                !formik.values.bankAccountNumber ||
                !formik.values.ifscCode ||
                formik.values.bankAccountNumber.length < 9
              }
              className={`h-10 md:h-11 lg:h-14
              px-4 md:px-6
              border-[0.5px] border-l-0
              ${formik.errors.ifscCode ? "border-red-500" : "border-[#039155]"}
              rounded-r-lg text-white
              font-[Gilroy-Semibold]
              text-xs md:text-sm
              whitespace-nowrap
              shadow-md
              transition
              flex-shrink-0            
              ${!formik.values.bankAccountNumber ||
                  !formik.values.ifscCode ||
                  formik.values.bankAccountNumber.length < 9
                  ? "bg-[#039155] cursor-not-allowed opacity-70"
                  : "bg-[#039155] hover:bg-green-700"
                }
              `}
            >
              Verify
            </button>
          </div>
          {formik.errors.ifscCode && formik.touched.ifscCode && (
            <p className="text-red-500 text-sm mt-1">
              {formik.errors.ifscCode}
            </p>
          )}
        </div>

        {/* Beneficiary Name Section */}
        <div className="mb-3 md:mb-4">
          <label
            htmlFor="beneficiaryName"
            className="block text-xs md:text-lg font-[Gilroy-Semibold] text-[#1B1717] mb-2"
          >
            Beneficiary Name
          </label>

          <div className="relative">
            <img
              src="/img/UserSquare.png"
              alt="Beneficiary"
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition ${formik.values.beneficiaryName ? "opacity-100" : "opacity-50"
                }`}
            />

            <div
              className={`absolute left-11 top-1/2 -translate-y-1/2 h-6 w-px transition ${formik.values.beneficiaryName ? "bg-[#1B1717]" : "bg-gray-300"
                }`}
            />

            <input
              type="text"
              name="beneficiaryName"
              value={formik.values.beneficiaryName}
              onChange={handleChange}
              placeholder="Auto Fetch"
              readOnly={!formData.ifscVerified}
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

        <button
          type="button"
          onClick={formik.handleSubmit}
          disabled={!isNextEnabled}
          className={`w-full h-10 md:h-11 lg:h-14 bg-[#039155] text-white rounded-lg md:rounded-xl font-[Gilroy-Semibold] text-sm md:text-base transition shadow-lg flex items-center justify-center ${!isNextEnabled
              ? "bg-[#039155] cursor-not-allowed opacity-70"
              : "bg-[#039155] hover:bg-green-700"
            }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Step6;
