import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { postBankDetails } from "../redux/action/onboardingAction";

function Step6({ formData, setFormData, onNext }) {
  const dispatch = useDispatch();

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

      if (formData.ifscVerified && formik.values.beneficiaryName) {
        onNext();
      }
    },
  });

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

    const token = localStorage.getItem("onboardingToken");
    if (token && formik.values.bankAccountNumber && formik.values.ifscCode) {
      dispatch(
        postBankDetails(
          {
            account_number: formik.values.bankAccountNumber,
            ifsc: formik.values.ifscCode,
          },
          token
        )
      );
    }
  };

  const bankDetailsStatus = useSelector(
    (state) => state?.onboarding?.bankDetailsStatus
  );
  const bankDetailsResponse = useSelector(
    (state) => state?.onboarding?.bankDetailsResponse
  );
  const bankDetailsError = useSelector(
    (state) => state?.onboarding?.bankDetailsError
  );

  useEffect(() => {
    if (bankDetailsStatus === "SUCCESS" && bankDetailsResponse) {
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
  }, [bankDetailsStatus, bankDetailsResponse]);

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
    <div className="flex justify-center items-center bg-gray-50">
      <div className="bg-white p-2 gap-4 w-full">

        {/* Heading */}
        <h3 className="text-center 
            text-[26px] xl:text-[30px] 
            md:text-[26px] 
            xxs:text-[20px] 
            font-semibold text-gray-800">
          Bank Details
        </h3>

        <p className="text-center 
            text-[18px] xl:text-[20px] 
            md:text-[18px] 
            xxs:text-[14px] 
            text-[#1B1717] mt-4 mb-6">
          Tell Us About Bank Details
        </p>

        {/* Account Number */}
        <div className="mb-6">
          <label className="block 
              text-[22px] xl:text-[24px] 
              md:text-[20px] 
              xxs:text-[16px] 
              font-medium text-[#1B1717] mb-2">
            Account Number
          </label>

          <div className="relative">
            <img
              src="/img/User.png"
              alt="Account"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 opacity-70"
            />

            <div className="absolute left-12 top-1/2 -translate-y-1/2 h-7 w-px bg-gray-300" />

            <input
              type="text"
              name="bankAccountNumber"
              value={formik.values.bankAccountNumber}
              onChange={handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter Account Number"
              className={`w-full border border-[#1B1717] border-opacity-80 
                h-[70px] md:h-[60px] xxs:h-[44px] 
                rounded-lg py-2 pl-16 pr-3 
                text-[18px] md:text-[16px] xxs:text-[14px] outline-none
                ${
                  formik.errors.bankAccountNumber &&
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
        <div className="mb-6">
          <label className="block 
              text-[22px] xl:text-[24px] 
              md:text-[20px] 
              xxs:text-[16px] 
              font-medium text-[#1B1717] mb-2">
            IFSC Code
          </label>

          <div className="flex">
            <div className="relative flex-1">
              <img
                src="/img/ListMagnifyingGlass.png"
                alt="IFSC"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 opacity-70"
              />

              <div className="absolute left-12 top-1/2 -translate-y-1/2 h-7 w-px bg-gray-300" />

              <input
                type="text"
                name="ifscCode"
                value={formik.values.ifscCode}
                onChange={handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter IFSC Code"
                className={`w-full border border-[#1B1717] border-opacity-80 
                  h-[70px] md:h-[60px] xxs:h-[44px] 
                  rounded-l-lg py-2 pl-16 pr-3 
                  text-[18px] md:text-[16px] xxs:text-[14px]
                  outline-none uppercase 
                  ${
                    formik.errors.ifscCode && formik.touched.ifscCode
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
                text-white font-medium 
                w-[160px] md:w-[130px] xxs:w-[80px] 
                h-[70px] md:h-[60px] xxs:h-[44px] 
                text-[18px] md:text-[16px] xxs:text-[13px]
                rounded-r-lg transition
                ${
                  !formik.values.ifscCode || !!formik.errors.ifscCode
                    ? "bg-[#039155] cursor-not-allowed opacity-70"
                    : "bg-[#039155] hover:bg-green-700"
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

          {bankDetailsStatus === "FAILURE" && bankDetailsError && (
            <p className="text-red-500 text-sm mt-1">
              {bankDetailsError?.message ||
                "Failed to verify bank details. Please try again."}
            </p>
          )}
        </div>

        {/* Beneficiary Name */}
        <div className="mb-8">
          <label className="block 
              text-[22px] xl:text-[24px] 
              md:text-[20px] 
              xxs:text-[16px] 
              font-medium text-[#1B1717] mb-2">
            Beneficiary Name
          </label>

          <div className="relative">
            <img
              src="/img/UserSquare.png"
              alt="Beneficiary"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 opacity-70"
            />

            <div className="absolute left-12 top-1/2 -translate-y-1/2 h-7 w-px bg-gray-300" />

            <input
              type="text"
              name="beneficiaryName"
              value={formik.values.beneficiaryName}
              readOnly={!formData.ifscVerified}
              placeholder="Auto Fetch"
              className={`w-full border border-[#1B1717] border-opacity-80 
                h-[70px] md:h-[60px] xxs:h-[44px] 
                rounded-lg py-2 pl-16 pr-3 
                text-[18px] md:text-[16px] xxs:text-[14px]
                outline-none 
                ${
                  !formData.ifscVerified
                    ? "bg-gray-50 cursor-not-allowed"
                    : ""
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
            w-full text-white font-medium 
            h-[70px] md:h-[60px] xxs:h-[46px]
            text-[24px] md:text-[20px] xxs:text-[18px]
            rounded-lg transition
            ${
              !isNextEnabled
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
