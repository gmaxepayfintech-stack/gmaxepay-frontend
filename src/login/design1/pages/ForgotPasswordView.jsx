import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useCompany } from "../../../context/CompanyContext";

const PhoneIcon = "/img/PhoneCall1.png";
const PhoneIconFilled = "/img/PhoneCall2.png";

const phoneValidationSchema = Yup.object({
  phoneNumber: Yup.string()
    .matches(/^\d{10}$/, "Phone number must be 10 digits")
    .required("Phone number is required"),
});

const ForgotPasswordView = ({ onSubmit, onBack }) => {
  const { company } = useCompany();

  return (
    <div className="flex-1 flex items-center justify-center bg-white px-4 sm:px-8 md:px-10 lg:px-16 xl:px-20 py-6 sm:py-10 overflow-y-auto">
      <div className="w-full max-w-sm mx-auto">
        <div className="flex justify-center mb-6">
          <img
            src={company?.logo || "/img/gmaxepay.png"}
            className="h-14 sm:h-16 md:h-20 object-contain"
            alt="Logo"
          />
        </div>

        <h1 className="text-1B1717 text-[36px] font-semibold text-center mb-4">
          Forgot Password
        </h1>
        <p className="text-1B1717 opacity-70 text-center text-[24px] mb-6">
          Reset access in just one step
        </p>

        <Formik
          initialValues={{ phoneNumber: "" }}
          validationSchema={phoneValidationSchema}
          onSubmit={onSubmit}
        >
          {({ values, setFieldValue, isSubmitting }) => (
            <Form>
              <div className="mb-10 w-[530px] -ml-20">
                <label
                  htmlFor="phoneNumber"
                  className="block text-gray-700 mb-2 sm:mb-3 md:mb-2"
                  style={{
                    fontFamily: "Gilroy-SemiBold",
                    fontWeight: 400,
                    fontSize: "16px",
                  }}
                >
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-[14px] flex items-center pointer-events-none z-40">
                    <img
                      src={values.phoneNumber ? PhoneIconFilled : PhoneIcon}
                      alt="Phone"
                      className="object-contain w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7"
                    />
                  </div>
                  <div className="absolute inset-y-0 left-[50px] flex items-center pointer-events-none z-10">
                    <div
                      className="h-2/5 bg-gray-300"
                      style={{ width: "1px" }}
                    ></div>
                  </div>
                  <Field
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    placeholder="Enter Your Number"
                    autoComplete="off"
                    maxLength={10}
                    className="block w-full rounded-lg transition-all outline-none h-14 sm:h-16 md:h-20 lg:h-[60px] pl-[60px] pr-4"
                    style={{
                      fontFamily: "Gilroy-Medium",
                      fontWeight: 400,
                      fontSize: "15px",
                      lineHeight: "100%",
                      border: `1.5px solid ${
                        values.phoneNumber
                          ? "#1B1717"
                          : "rgba(27, 23, 23, 0.5)"
                      }`,
                    }}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, "");
                      if (value.length > 10) value = value.slice(-10);
                      setFieldValue("phoneNumber", value);
                    }}
                  />
                  <ErrorMessage name="phoneNumber">
                    {(msg) => (
                      <div className="absolute left-0 -bottom-6 text-red-500 text-sm ml-2 w-full z-50">
                        {msg}
                      </div>
                    )}
                  </ErrorMessage>
                </div>
              </div>

              <div className="flex gap-4 mb-6">
                <button
                  type="button"
                  onClick={onBack}
                  className="text-1B1717 hover:text-1B1717 transition-colors"
                  style={{
                    fontFamily: "Gilroy-SemiBold",
                    fontWeight: 400,
                    fontSize: "16px",
                  }}
                >
                  Back
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-[530px] -ml-20 text-white text-[20px] font-medium mt-6 rounded-xl h-12 flex items-center justify-center"
                style={{
                  backgroundColor: company?.primaryColor || "#039155",
                }}
              >
                Next
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ForgotPasswordView;

