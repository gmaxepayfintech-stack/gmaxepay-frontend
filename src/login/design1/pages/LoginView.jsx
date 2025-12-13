import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useCompany } from "../../../context/CompanyContext";
import { useSelector } from "react-redux";
import { ButtonLoader } from "../../../widgets/layout/loader.jsx";

const NumpadIcon = "/img/Numpad1.png";
const NumpadIconFilled = "/img/Numpad2.png";
const PhoneIcon = "/img/PhoneCall1.png";
const PhoneIconFilled = "/img/PhoneCall2.png";

const loginValidationSchema = Yup.object({
  phoneNumber: Yup.string()
    .matches(/^\d{10}$/, "Phone number must be 10 digits")
    .required(), // keep required for submit blocking, suppress message in UI
  password: Yup.string().required(), // suppress required message in UI
});

const LoginView = ({ onSubmit, onForgotPassword, onSignUp = () => { } }) => {
  const { company } = useCompany();
  const [showPassword, setShowPassword] = useState(false);
  const isLoading = useSelector((state) => state?.loading?.isLoading);

  return (
    <div className="flex-1 flex items-center justify-center bg-white px-3 sm:px-6 md:px-12 lg:px-16 xl:px-20 py-3 sm:py-5 md:py-4 lg:py-0 overflow-y-auto min-h-screen">
      <div
        className="w-full max-w-[95%] sm:max-w-md md:max-w-2xl mx-auto"
        style={{ maxWidth: "534px" }}
      >
        <div className="mb-3 sm:mb-5 md:mb-4 lg:mb-6 text-center">
          <div className="flex justify-center mb-3 sm:mb-5 md:mb-4">
            <img
              src={company?.logo || "/img/gmaxepay.png"}
              alt={company?.companyName || "GMAXEPAY Logo"}
              className="object-contain h-12 sm:h-16 md:h-24 lg:h-28"
              loading="eager"
              fetchpriority="high"
              decoding="async"
              onError={(e) => {
                e.target.src = "/img/gmaxepay.png";
              }}
            />
          </div>
          <h1
            className="text-gray-900 mb-1.5 sm:mb-2 text-2xl sm:text-3xl md:text-4xl lg:text-[38px]"
            style={{
              fontFamily: "Gilroy-SemiBold",
              fontWeight: 400,
              lineHeight: "1.1",
            }}
          >
            Welcome Back!
          </h1>
          <p
            className="text-gray-600 text-sm sm:text-base md:text-xl lg:text-2xl px-2 sm:px-0"
            style={{
              fontFamily: "Gilroy-Medium",
              fontWeight: 400,
              lineHeight: "1.2",
              marginTop: "8px",
            }}
          >
            Let's Get Your Business Growing Together
          </p>
        </div>

        <Formik
          initialValues={{ phoneNumber: "", password: "" }}
          validationSchema={loginValidationSchema}
          onSubmit={onSubmit}
        >
          {({ isSubmitting, values, setFieldValue }) => (
            <Form className="mt-3 sm:mt-5 md:mt-6">
              <div className="mb-4 sm:mb-5 md:mb-5 lg:mb-7">
                <label
                  htmlFor="phoneNumber"
                  className="block text-gray-700 mb-1.5 sm:mb-2 md:mb-2"
                  style={{
                    fontFamily: "Gilroy-SemiBold",
                    fontWeight: 400,
                    fontSize: "14px",
                    lineHeight: "100%",
                  }}
                >
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 sm:left-[14px] flex items-center pointer-events-none z-40">
                    <img
                      src={values.phoneNumber ? PhoneIconFilled : PhoneIcon}
                      alt="Phone"
                      className="object-contain w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7"
                    />
                  </div>
                  <div className="absolute inset-y-0 left-11 sm:left-[50px] flex items-center pointer-events-none z-10">
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
                    minLength={10}
                    maxLength={10}
                    pattern="[0-9]{10}"
                    className="block w-full rounded-lg transition-all outline-none h-12 sm:h-14 md:h-16 lg:h-[60px] pl-12 sm:pl-[60px] pr-3 sm:pr-4"
                    style={{
                      fontFamily: "Gilroy-Medium",
                      fontWeight: 400,
                      fontSize: "14px",
                      lineHeight: "100%",
                      border: `1.5px solid ${values.phoneNumber
                        ? "#1B1717"
                        : "rgba(27, 23, 23, 0.5)"
                        }`,
                    }}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, "");
                      if (value.length > 10) value = value.slice(-10);
                      setFieldValue("phoneNumber", value);
                    }}
                    required
                  />
                  <ErrorMessage name="phoneNumber">
                    {(msg) => {
                      const text = typeof msg === "string" ? msg : "";
                      const hide = /required/i.test(text);
                      return hide ? null : (
                        <div className="absolute left-0 -bottom-5 sm:-bottom-6 text-red-500 text-xs sm:text-sm ml-2 w-full z-50">
                          {text}
                        </div>
                      );
                    }}
                  </ErrorMessage>
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-gray-700 mb-1.5 sm:mb-2 md:mb-2"
                  style={{
                    fontFamily: "Gilroy-SemiBold",
                    fontWeight: 400,
                    fontSize: "14px",
                    lineHeight: "100%",
                  }}
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 sm:left-[14px] flex items-center pointer-events-none z-10">
                    <img
                      src={values.password ? NumpadIconFilled : NumpadIcon}
                      alt="Password"
                      className="object-contain w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7"
                    />
                  </div>
                  <div className="absolute inset-y-0 left-11 sm:left-[50px] flex items-center pointer-events-none z-10">
                    <div
                      className="h-2/5 bg-gray-300"
                      style={{ width: "1px" }}
                    ></div>
                  </div>
                  {values.password && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 sm:right-[14px] flex items-center cursor-pointer z-20 bg-transparent border-0 outline-none"
                    >
                      <img
                        src={
                          showPassword ? "/img/EyeClosed.png" : "/img/Eye.png"
                        }
                        alt={showPassword ? "Hide password" : "Show password"}
                        className="object-contain w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7"
                      />
                    </button>
                  )}
                  <Field
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter Your Password"
                    autoComplete="off"
                    className={`block w-full rounded-lg transition-all outline-none h-12 sm:h-14 md:h-16 lg:h-[60px] pl-12 sm:pl-[60px] ${values.password ? "pr-12 sm:pr-[60px]" : "pr-3 sm:pr-4"}`}
                    style={{
                      fontFamily: "Gilroy-Medium",
                      fontWeight: 400,
                      fontSize: "14px",
                      lineHeight: "100%",
                      border: `1.5px solid ${values.password ? "#1B1717" : "rgba(27, 23, 23, 0.5)"
                        }`,
                    }}
                    required
                  />
                  <ErrorMessage name="password">
                    {(msg) => {
                      const text = typeof msg === "string" ? msg : "";
                      const hide = /required/i.test(text);
                      return hide ? null : (
                        <div className="absolute left-0 -bottom-5 sm:-bottom-6 text-red-500 text-xs sm:text-sm ml-2 w-full z-50">
                          {text}
                        </div>
                      );
                    }}
                  </ErrorMessage>
                </div>
              </div>

              <div className="flex justify-end mt-4 sm:mt-5 md:mt-6 mb-4 sm:mb-6 md:mb-6 lg:mb-10">
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-1B1717 hover:text-1B1717 transition-colors"
                  style={{
                    fontFamily: "Gilroy-SemiBold",
                    fontWeight: 400,
                    fontSize: "14px",
                    lineHeight: "100%",
                  }}
                >
                  Forgot Password?
                </button>
              </div>

              <div className="w-full flex justify-center">
                <button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  className="w-full lg:w-[534px] xl:w-[534px] text-white transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center shadow-lg h-11 sm:h-12 md:h-14 lg:h-[60px] xl:h-[60px] font-semibold rounded-xl relative overflow-hidden"
                  style={{
                    backgroundColor: company?.primaryColor || "#039155",
                    boxShadow: "0 4px 14px 0",
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading && !isSubmitting && company?.secondaryColor) {
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

        <div className="mt-3 sm:mt-4 md:mt-6">
          <div className="flex items-center justify-center gap-2 sm:gap-3 px-2">
            <img
              src="/img/Chat.png"
              alt="Email"
              className="object-contain w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0"
            />
            <span
              className="text-center break-all"
              style={{
                fontFamily: "Gilroy-Medium",
                fontWeight: 400,
                fontSize: "14px",
                lineHeight: "100%",
                color: "#1B1717",
              }}
            >
              {company?.customerSupportEmail || "support@gmaxepay.com"}
            </span>
          </div>

          <div className="flex items-center justify-center gap-2 sm:gap-3 mt-2 sm:mt-3 px-2">
            <img
              src="/img/PhoneOutgoing.png"
              alt="Phone"
              className="object-contain w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0"
            />
            <span
              className="text-center break-words"
              style={{
                fontFamily: "Gilroy-Medium",
                fontWeight: 400,
                fontSize: "14px",
                lineHeight: "100%",
                color: "#1B1717",
              }}
            >
              {company?.supportPhoneNumbers &&
                Array.isArray(company.supportPhoneNumbers) &&
                company.supportPhoneNumbers.length > 0
                ? `91- ${company.supportPhoneNumbers.join(", ")}`
                : "91- 08062179126, 8088651844"}
            </span>
          </div>
        </div>

        <div className="mt-3 sm:mt-4 md:mt-6 flex justify-center px-2">
          <p
            className="text-center"
            style={{
              fontFamily: "Gilroy-Medium",
              fontWeight: 400,
              fontSize: "16px",
              lineHeight: "120%",
              color: "#1B1717",
            }}
          >
            New To Our Platform ?{" "}
            <button
              type="button"
              onClick={onSignUp}
              className="cursor-pointer bg-transparent border-0 p-0"
              style={{
                fontFamily: "Gilroy-SemiBold",
                fontWeight: 400,
                color: company?.primaryColor || "#039155",
              }}
            >
              Create Your Account
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};

export default LoginView;
