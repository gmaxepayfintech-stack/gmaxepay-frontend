import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useCompany } from "../../../context/CompanyContext";
import { useSelector } from "react-redux";
import { ButtonLoader } from "../../../widgets/layout/loader.jsx";

const NumpadIcon = "/img/Numpad1.png";
const NumpadIconFilled = "/img/Numpad2.png";

const resetPasswordValidationSchema = Yup.object({
  newPassword: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required(), // keep required to block submit; suppress message in UI
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
    .required(), // suppress required message in UI
});

const ResetPasswordView = ({ onSubmit }) => {
  const { company } = useCompany();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const isLoading = useSelector((state) => state?.loading?.isLoading);

  return (
    <div className="flex-1 flex items-center justify-center bg-white px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-8 sm:py-10 md:py-8 lg:py-0 overflow-y-auto">
      <div
        className="w-full max-w-sm sm:max-w-md md:max-w-2xl mx-auto"
        style={{ maxWidth: "534px" }}
      >
        <div className="mb-6 sm:mb-8 md:mb-6 lg:mb-8 text-center">
          <div className="flex justify-center mb-4 sm:mb-6 md:mb-4">
            <img
              src={company?.logo || "/img/gmaxepay.svg"}
              alt={company?.companyName || "GMAXEPAY Logo"}
              className="object-contain h-16 sm:h-20 md:h-24 lg:h-28"
              loading="eager"
              fetchpriority="high"
              decoding="async"
              onError={(e) => {
                e.target.src = "/img/gmaxepay.svg";
              }}
            />
          </div>
          <h1
            className="text-[#1B1717] mb-2 text-3xl sm:text-4xl "
            style={{
              fontFamily: "Gilroy-SemiBold",
              fontWeight: 400,
              lineHeight: "1.1",
            }}
          >
            Reset Password
          </h1>
          <p
            className="text-[#1B1717] text-lg sm:text-xl md:text-2xl "
            style={{
              fontFamily: "Gilroy-Medium",
              fontWeight: 400,
              lineHeight: "1.2",
              marginTop: "12px",
            }}
          >
            Create a new secure password for your account
          </p>
        </div>

        <Formik
          initialValues={{ newPassword: "", confirmPassword: "" }}
          validationSchema={resetPasswordValidationSchema}
          onSubmit={onSubmit}
        >
          {({ isSubmitting, values }) => (
            <Form className="mt-6">
              <div className="mb-5 sm:mb-6 md:mb-5 lg:mb-7">
                <label
                  htmlFor="newPassword"
                  className="block text-[#1B1717] mb-2 sm:mb-3 md:mb-2"
                  style={{
                    fontFamily: "Gilroy-SemiBold",
                    fontWeight: 400,
                    fontSize: "16px",
                    lineHeight: "100%",
                  }}
                >
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-[14px] flex items-center pointer-events-none z-40">
                    <img
                      src={values.newPassword ? NumpadIconFilled : NumpadIcon}
                      alt="Password"
                      className="object-contain w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7"
                    />
                  </div>
                  <div className="absolute inset-y-0 left-[50px] flex items-center pointer-events-none z-10">
                    <div
                      className="h-2/5 bg-gray-300"
                      style={{ width: "1px" }}
                    ></div>
                  </div>
                  {values.newPassword && (
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-[14px] flex items-center cursor-pointer z-20 bg-transparent border-0 outline-none"
                    >
                      <img
                        src={
                          showNewPassword
                            ? "/img/EyeClosed.png"
                            : "/img/Eye.png"
                        }
                        alt={
                          showNewPassword ? "Hide password" : "Show password"
                        }
                        className="object-contain w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7"
                      />
                    </button>
                  )}
                  <Field
                    id="newPassword"
                    name="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter New Password"
                    autoComplete="new-password"
                    className="block w-full rounded-lg transition-all outline-none h-14 sm:h-16 md:h-20 lg:h-[60px] pl-[60px]"
                    style={{
                      fontFamily: "Gilroy-Medium",
                      fontWeight: 400,
                      fontSize: "15px",
                      lineHeight: "100%",
                      paddingRight: values.newPassword ? "60px" : "16px",
                      border: `1.5px solid ${
                        values.newPassword ? "#1B1717" : "rgba(27, 23, 23, 0.5)"
                      }`,
                    }}
                    required
                  />
                  <ErrorMessage name="newPassword">
                    {(msg) => {
                      const text = typeof msg === "string" ? msg : "";
                      const hide = /required/i.test(text);
                      return hide ? null : (
                        <div className="absolute left-0 -bottom-6 text-red-500 text-sm ml-2 w-full z-50">
                          {text}
                        </div>
                      );
                    }}
                  </ErrorMessage>
                </div>
              </div>

              <div className="mb-5 sm:mb-6 md:mb-5 lg:mb-7">
                <label
                  htmlFor="confirmPassword"
                  className="block text-[#1B1717] mb-2 sm:mb-3 md:mb-2"
                  style={{
                    fontFamily: "Gilroy-SemiBold",
                    fontWeight: 400,
                    fontSize: "16px",
                    lineHeight: "100%",
                  }}
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-[14px] flex items-center pointer-events-none z-40">
                    <img
                      src={
                        values.confirmPassword ? NumpadIconFilled : NumpadIcon
                      }
                      alt="Password"
                      className="object-contain w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7"
                    />
                  </div>
                  <div className="absolute inset-y-0 left-[50px] flex items-center pointer-events-none z-10">
                    <div
                      className="h-2/5 bg-gray-300"
                      style={{ width: "1px" }}
                    ></div>
                  </div>
                  {values.confirmPassword && (
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-[14px] flex items-center cursor-pointer z-20 bg-transparent border-0 outline-none"
                    >
                      <img
                        src={
                          showConfirmPassword
                            ? "/img/EyeClosed.png"
                            : "/img/Eye.png"
                        }
                        alt={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        className="object-contain w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7"
                      />
                    </button>
                  )}
                  <Field
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm New Password"
                    autoComplete="new-password"
                    className="block w-full rounded-lg transition-all outline-none h-14 sm:h-16 md:h-20 lg:h-[60px] pl-[60px]"
                    style={{
                      fontFamily: "Gilroy-Medium",
                      fontWeight: 400,
                      fontSize: "15px",
                      lineHeight: "100%",
                      paddingRight: values.confirmPassword ? "60px" : "16px",
                      border: `1.5px solid ${
                        values.confirmPassword
                          ? "#1B1717"
                          : "rgba(27, 23, 23, 0.5)"
                      }`,
                    }}
                    required
                  />
                  <ErrorMessage name="confirmPassword">
                    {(msg) => {
                      const text = typeof msg === "string" ? msg : "";
                      const hide = /required/i.test(text);
                      return hide ? null : (
                        <div className="absolute left-0 -bottom-6 text-red-500 text-sm ml-2 w-full z-50">
                          {text}
                        </div>
                      );
                    }}
                  </ErrorMessage>
                </div>
              </div>

              <div className="w-full">
                <button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  className="w-full lg:w-[534px] mx-auto text-white transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center shadow-lg h-12 sm:h-12 md:h-14 lg:h-[60px] font-semibold rounded-xl relative overflow-hidden disabled:opacity-70"
                  style={{
                    backgroundColor: company?.primaryColor || "#039155",
                    boxShadow: "0 4px 14px 0",
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
                      <span className="text-white">Loading...</span>
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
                      Reset Password
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

export default ResetPasswordView;
