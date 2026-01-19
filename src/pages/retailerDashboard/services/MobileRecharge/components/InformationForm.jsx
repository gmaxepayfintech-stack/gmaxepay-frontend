import { useFormik } from "formik";
import * as Yup from "yup";
import PropTypes from "prop-types";
import { ButtonLoader } from "../../../../../widgets/layout/loader";

const validationSchema = Yup.object({
  mobileNumber: Yup.string()
    .required("Mobile number is required")
    .matches(/^\d{10}$/, "Mobile number must be exactly 10 digits")
    .min(10, "Mobile number must be 10 digits")
    .max(10, "Mobile number must be 10 digits"),
});

const InformationForm = ({ handleCancel, handleProceed, isLoadingProceed }) => {
  const formik = useFormik({
    initialValues: {
      mobileNumber: "",
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      handleProceed(values.mobileNumber);
    },
  });

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Only numbers
    if (value.length <= 10) {
      formik.setFieldValue("mobileNumber", value);
    }
  };

  return (
    <>
      <div className="text-[20px] font-['Gilroy-Medium'] text-[#1B1717] mb-6">
        Information
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-4">
        {/* Mobile Number Input */}
        <div>
          <label htmlFor="mobileNumber" className="block text-[14px] font-['Gilroy-Medium'] text-[#1B1717] mb-2">
            Mobile Number *
          </label>
          <input
            id="mobileNumber"
            name="mobileNumber"
            type="text"
            value={formik.values.mobileNumber}
            onChange={handleInputChange}
            onBlur={formik.handleBlur}
            placeholder="Mobile Number"
            maxLength={10}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none text-[#1B1717] ${
              formik.touched.mobileNumber && formik.errors.mobileNumber
                ? "border-red-500"
                : "border-gray-300"
            }`}
          />
          {formik.touched.mobileNumber && formik.errors.mobileNumber && (
            <div className="text-red-500 text-xs mt-1">{formik.errors.mobileNumber}</div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 h-[48px] border border-gray-300 rounded-lg bg-white text-[#1B1717] font-['Gilroy-Medium'] hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoadingProceed}
            className={`flex-1 h-[48px] bg-[#039155] hover:bg-[#027A47] text-white rounded-lg font-['Gilroy-Medium'] transition flex items-center justify-center ${
              isLoadingProceed ? "cursor-wait opacity-100" : ""
            }`}
          >
            {isLoadingProceed ? (
              <>
                <ButtonLoader color="#FFFFFF" size={24} />
                <span className="ml-2">Processing</span>
              </>
            ) : "Proceed"} 
          </button>
        </div>
      </form>
    </>
  );
};

InformationForm.propTypes = {
  handleCancel: PropTypes.func.isRequired,
  handleProceed: PropTypes.func.isRequired,
  isLoadingProceed: PropTypes.bool.isRequired,
};

export default InformationForm;

