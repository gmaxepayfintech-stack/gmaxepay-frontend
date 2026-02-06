import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useCompany } from "../../../context/CompanyContext";
import { useSelector } from "react-redux";
import { ButtonLoader } from "../../../widgets/layout/loader.jsx";
import { HiArrowLeft } from "react-icons/hi2";

const PhoneIcon = "/img/PhoneCall1.png";
const PhoneIconFilled = "/img/PhoneCall2.png";

const phoneValidationSchema = Yup.object({
  phoneNumber: Yup.string()
    .matches(/^\d{10}$/, "Phone number must be 10 digits")
    .required(), // keep required to block submit; suppress message in UI
});

const ForgotPasswordView = ({ onSubmit, onBack }) => {
  const { company } = useCompany();
  const isLoading = useSelector((state) => state?.loading?.isLoading);

  return (
    <div className="flex-1 flex items-center justify-center relative bg-white px-3 sm:px-6 md:px-10 lg:px-16 xl:px-20 py-4 sm:py-6 md:py-8 lg:py-10 overflow-y-auto min-h-screen">
      {/* Back Arrow */}
      <div className="mb-4 absolute top-4 left-4 sm:top-6 sm:left-6 md:top-8 md:left-8 lg:top-10 lg:left-10">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center w-10 h-10 rounded-full border border-[#1B1717]/40 hover:border-[#039155] transition"
          aria-label="Go back"
        >
          <HiArrowLeft className="text-xl" />
        </button>
      </div>
      <div className="w-full max-w-[95%] sm:max-w-md md:max-w-lg lg:max-w-[534px] xl:max-w-[534px] mx-auto">
        <div className="flex justify-center mb-4 sm:mb-5 md:mb-6 lg:mb-6">
          <img
            src={company?.logo || "/img/gmaxepay.svg"}
            className="h-12 sm:h-14 md:h-16 lg:h-20 xl:h-24 object-contain"
            alt="Logo"
          />
        </div>

        <h1 className=" text-2xl sm:text-3xl md:text-4xl font-[gilroy-semibold] text-[#1B1717] text-center mb-2 sm:mb-3 md:mb-4 lg:mb-4">
          Forgot Password
        </h1>
        <p className="text-[#1B1717] font-[gilroy-medium] text-center sm:text-lg md:text-xl lg:text-2xl mb-4 sm:mb-5 md:mb-6 lg:mb-6 px-2 sm:px-0">
          Reset Access in Just One Step
        </p>

        <Formik
          initialValues={{ phoneNumber: "" }}
          validationSchema={phoneValidationSchema}
          onSubmit={onSubmit}
        >
          {({ values, setFieldValue, isSubmitting }) => (
            <Form>
              <div className="mb-6 sm:mb-8 md:mb-10 lg:mb-10 w-full">
                <label
                  htmlFor="phoneNumber"
                  className="block text-[#1B1717] mb-1.5 sm:mb-2 md:mb-2 lg:mb-2"
                  style={{
                    fontFamily: "Gilroy-SemiBold",
                    fontWeight: 400,
                    fontSize: "16px",
                    lineHeight: "100%",
                  }}
                >
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 sm:left-[14px] md:left-[14px] lg:left-[14px] flex items-center pointer-events-none z-40">
                    <img
                      src={values.phoneNumber ? PhoneIconFilled : PhoneIcon}
                      alt="Phone"
                      className="object-contain w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-7 xl:h-7 "
                    />
                  </div>
                  <div className="absolute inset-y-0 left-11 sm:left-[50px] md:left-[50px] lg:left-[50px] flex items-center pointer-events-none z-10">
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
                    className="block w-full rounded-[14px] transition-all outline-none h-12 sm:h-14 md:h-16 lg:h-[60px] xl:h-[60px] pl-12 sm:pl-[60px] md:pl-[60px] lg:pl-[60px] pr-3 sm:pr-4 md:pr-4 lg:pr-4"
                    style={{
                      fontFamily: "Gilroy-Medium",
                      fontWeight: 400,
                      fontSize: "15px",
                      lineHeight: "100%",
                      border: `1.5px solid ${
                        values.phoneNumber ? "#1B1717" : "rgba(27, 23, 23, 0.5)"
                      }`,
                    }}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, "");
                      if (value.length > 10) value = value.slice(-10);
                      setFieldValue("phoneNumber", value);
                    }}
                  />
                  <ErrorMessage name="phoneNumber">
                    {(msg) => {
                      const text = typeof msg === "string" ? msg : "";
                      const hide = /required/i.test(text);
                      return hide ? null : (
                        <div className="absolute left-0 -bottom-5 sm:-bottom-6 md:-bottom-6 lg:-bottom-6 text-red-500 text-xs sm:text-sm md:text-sm lg:text-sm ml-2 w-full z-50">
                          {text}
                        </div>
                      );
                    }}
                  </ErrorMessage>
                </div>
              </div>

              {/* <div className="flex gap-3 sm:gap-4 mb-4 sm:mb-5 md:mb-6 lg:mb-6">
                <button
                  type="button"
                  onClick={onBack}
                  className="text-1B1717 hover:text-1B1717 transition-colors"
                  style={{
                    fontFamily: "Gilroy-SemiBold",
                    fontWeight: 400,
                    fontSize: "14px",
                    lineHeight: "100%",
                  }}
                >
                  Back
                </button>
              </div> */}

              <div className="w-full flex justify-center">
                <button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  className="w-full lg:w-[534px] xl:w-[534px] text-white transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center shadow-lg rounded-xl h-11 sm:h-12 md:h-14 lg:h-[60px] xl:h-[60px] font-semibold relative overflow-hidden disabled:opacity-70"
                  style={{
                    backgroundColor: company?.primaryColor || "#039155",
                    boxShadow: "0 4px 14px 0",
                    fontFamily: "Gilroy-SemiBold",
                    fontWeight: 400,
                    fontSize: "18px",
                    lineHeight: "100%",
                    color: "white",
                  }}
                  onMouseEnter={(e) => {
                    if (
                      !isLoading &&
                      !isSubmitting &&
                      company?.secondaryColor
                    ) {
                      e.target.style.backgroundColor = company.secondaryColor;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading && !isSubmitting && company?.primaryColor) {
                      e.target.style.backgroundColor = company.primaryColor;
                    }
                  }}
                >
                  {isSubmitting || isLoading ? (
                    <span className="flex items-center gap-2">
                      <ButtonLoader color="#ffffff" />
                      <span
                        style={{
                          fontFamily: "Gilroy-SemiBold",
                          fontWeight: 400,
                          fontSize: "18px",
                          lineHeight: "100%",
                          color: "white",
                        }}
                      >
                        Loading...
                      </span>
                    </span>
                  ) : (
                    <span
                      style={{
                        fontFamily: "Gilroy-SemiBold",
                        fontWeight: 400,
                        fontSize: "18px",
                        lineHeight: "100%",
                        color: "white",
                      }}
                    >
                      Next
                    </span>
                  )}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ForgotPasswordView;
