import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { postBankDetails } from "../redux/action/retailerOnboardingAction";
import { useCompany } from "../context/CompanyContext";
import { useNotification } from "../context/NotificationContext";
import secureLocalStorage from "react-secure-storage";

function Step6({ formData, setFormData, onNext }) {
  const { referCode: urlReferralCode } = useParams();
  const dispatch = useDispatch();
  const { company } = useCompany();
  const { showNotification } = useNotification();
  const companyFromRedux = useSelector((state) => state?.company?.company);
  const companyData = companyFromRedux || company;

  // Get bank details status from Redux (needed in onSubmit)
  const bankDetailsStatus = useSelector(
    (state) => state?.retailerOnboarding?.bankDetailsStatus
  );
  const bankDetailsResponse = useSelector(
    (state) => state?.retailerOnboarding?.bankDetailsResponse
  );
  const bankDetailsError = useSelector(
    (state) => state?.retailerOnboarding?.bankDetailsError
  );

  const validationSchema = Yup.object({
    bankAccountNumber: Yup.string()
      .matches(/^\d{9,18}$/, "Account number must be 9-18 digits")
      .required("Account number is required"),
    ifscCode: Yup.string()
      .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Enter valid IFSC code (e.g., ABCD0123456)")
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
      const errors = await formik.validateForm();
      if (Object.keys(errors).length > 0) {
        formik.setTouched({
          bankAccountNumber: true,
          ifscCode: true,
        });
        return;
      }

      // Check if bank details are verified - check multiple sources
      const isVerified = formData.ifscVerified || bankDetailsStatus === "SUCCESS";
      const hasBeneficiaryName = formik.values.beneficiaryName || formData.beneficiaryName;


      if (isVerified && hasBeneficiaryName) {
        // Show success notification
        showNotification({
          type: "success",
          message: "Bank details verified successfully",
        });

        // Redirect to KYC index page using window.location.href immediately
        const referCode = getReferCode();
        if (referCode) {
          window.location.href = `/unity/${referCode}`;
        } else {
          window.location.href = `/unity`;
        }
      } else {
        // If not verified, show error
        showNotification({
          type: "error",
          message: "Please verify bank details first by clicking the Verify button",
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
          token
        )
      );
    }
  };

  useEffect(() => {
    if (bankDetailsStatus === "SUCCESS" && bankDetailsResponse) {
      const bankData = bankDetailsResponse?.bankDetailsResponse || bankDetailsResponse;
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
        message: bankDetailsResponse?.message || "Bank details verified successfully",
      });
    }
  }, [bankDetailsStatus, bankDetailsResponse, showNotification, setFormData, formik]);

  // Handle error notifications
  useEffect(() => {
    if (bankDetailsStatus === "FAILURE" && bankDetailsError) {
      const errorMessage = typeof bankDetailsError === "string" 
        ? bankDetailsError 
        : bankDetailsError?.message || "Failed to verify bank details. Please try again.";
      
      showNotification({
        type: "error",
        message: errorMessage,
      });
    }
  }, [bankDetailsStatus, bankDetailsError, showNotification]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const processedValue = name === "ifscCode" ? value.toUpperCase() : value;

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
    <div className="w-full h-full flex justify-center items-center bg-gray-50 p-3 sm:p-4 md:p-6 lg:p-8 overflow-hidden">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-5 sm:p-6 md:p-8 lg:p-10 w-full max-w-[95%] sm:max-w-[550px] md:max-w-[600px] lg:max-w-[700px] xl:max-w-[800px] mx-auto">

        {/* Heading */}
        <h3 className="text-center text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold text-gray-800 mb-3 sm:mb-4 md:mb-5 lg:mb-6">
          Bank Details
        </h3>

        <p className="text-center text-sm sm:text-base md:text-lg lg:text-xl text-[#1B1717] mb-5 sm:mb-6 md:mb-7 lg:mb-8">
          Tell Us About Bank Details
        </p>

        {/* Account Number */}
        <div className="mb-5 sm:mb-6 md:mb-7 lg:mb-8">
          <label className="block 
              text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl
              font-medium text-[#1B1717] mb-2 sm:mb-3 md:mb-4">
            Account Number
          </label>

          <div className="relative">
            <img
              src="/img/User.png"
              alt="Account"
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 opacity-70"
            />

            <div className="absolute left-9 sm:left-11 md:left-12 top-1/2 -translate-y-1/2 h-5 sm:h-6 md:h-7 w-px bg-gray-300" />

            <input
              type="text"
              name="bankAccountNumber"
              value={formik.values.bankAccountNumber}
              onChange={handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter Account Number"
              className={`w-full border-2 border-[#1B1717] border-opacity-80 
                h-12 sm:h-14 md:h-16 lg:h-[72px]
                rounded-lg py-2 sm:py-3 md:py-4 pl-10 sm:pl-14 md:pl-16 lg:pl-18 pr-3 sm:pr-4 md:pr-5 
                text-sm sm:text-base md:text-lg lg:text-xl outline-none
                focus:border-[#039155] focus:border-opacity-100 transition
                ${formik.errors.bankAccountNumber &&
                  formik.touched.bankAccountNumber
                  ? "border-red-500"
                  : ""
                }`}
            />
          </div>

          {formik.errors.bankAccountNumber &&
            formik.touched.bankAccountNumber && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.bankAccountNumber}
              </p>
            )}
        </div>

        {/* IFSC */}
        <div className="mb-5 sm:mb-6 md:mb-7 lg:mb-8">
          <label className="block 
              text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl
              font-medium text-[#1B1717] mb-2 sm:mb-3 md:mb-4">
            IFSC Code
          </label>

          <div className="flex">
            <div className="relative flex-1">
              <img
                src="/img/ListMagnifyingGlass.png"
                alt="IFSC"
                className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 opacity-70"
              />

              <div className="absolute left-9 sm:left-11 md:left-12 top-1/2 -translate-y-1/2 h-5 sm:h-6 md:h-7 w-px bg-gray-300" />

              <input
                type="text"
                name="ifscCode"
                value={formik.values.ifscCode}
                onChange={handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter IFSC Code"
                className={`w-full border-2 border-[#1B1717] border-opacity-80 
                  h-12 sm:h-14 md:h-16 lg:h-[72px]
                  rounded-l-lg py-2 sm:py-3 md:py-4 pl-10 sm:pl-14 md:pl-16 lg:pl-18 pr-3 sm:pr-4 md:pr-5 
                  text-sm sm:text-base md:text-lg lg:text-xl
                  outline-none uppercase transition
                  focus:border-[#039155] focus:border-opacity-100
                  ${formik.errors.ifscCode && formik.touched.ifscCode
                    ? "border-red-500"
                    : ""
                  }`}
              />
            </div>

            {/* Verify Button */}
            <button
              type="button"
              onClick={handleVerify}
              disabled={!formik.values.ifscCode || !!formik.errors.ifscCode}
              className={`
                text-white font-semibold 
                w-[80px] sm:w-[110px] md:w-[130px] lg:w-[150px] xl:w-[170px]
                h-12 sm:h-14 md:h-16 lg:h-[72px]
                text-xs sm:text-sm md:text-base lg:text-lg
                rounded-r-lg transition flex-shrink-0 whitespace-nowrap shadow-md
                ${!formik.values.ifscCode || !!formik.errors.ifscCode
                  ? "bg-[#039155] cursor-not-allowed opacity-70"
                  : "bg-[#039155] hover:bg-green-700 active:scale-95"
                }`}
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

        {/* Beneficiary Name */}
        <div className="mb-6 sm:mb-7 md:mb-8 lg:mb-10">
          <label className="block 
              text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl
              font-medium text-[#1B1717] mb-2 sm:mb-3 md:mb-4">
            Beneficiary Name
          </label>

          <div className="relative">
            <img
              src="/img/UserSquare.png"
              alt="Beneficiary"
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 opacity-70"
            />

            <div className="absolute left-9 sm:left-11 md:left-12 top-1/2 -translate-y-1/2 h-5 sm:h-6 md:h-7 w-px bg-gray-300" />

            <input
              type="text"
              name="beneficiaryName"
              value={formik.values.beneficiaryName}
              readOnly={!formData.ifscVerified}
              placeholder="Auto Fetch"
              className={`w-full border-2 border-[#1B1717] border-opacity-80 
                h-12 sm:h-14 md:h-16 lg:h-[72px]
                rounded-lg py-2 sm:py-3 md:py-4 pl-10 sm:pl-14 md:pl-16 lg:pl-18 pr-3 sm:pr-4 md:pr-5 
                text-sm sm:text-base md:text-lg lg:text-xl
                outline-none transition
                ${!formData.ifscVerified
                  ? "bg-gray-50 cursor-not-allowed"
                  : "focus:border-[#039155] focus:border-opacity-100"
                }`}
            />
          </div>
        </div>

        {/* NEXT BUTTON */}
        <button
          type="button"
          onClick={formik.handleSubmit}
          disabled={!isNextEnabled}
          className={`
            w-full text-white font-semibold 
            h-14 sm:h-16 md:h-[72px] lg:h-[80px]
            text-base sm:text-lg md:text-xl lg:text-2xl
            rounded-lg transition shadow-md
            ${!isNextEnabled
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
