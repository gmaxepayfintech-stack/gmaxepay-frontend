import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getLocationAndIP } from "../../util/getLocationAndIP";
import { useNotification } from "../../context/NotificationContext";
import { useCompany } from "../../context/CompanyContext";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { loginStatus } from "../../redux/action/loginAction";
import ForgotPassword from "../ForgotPassword";

const NumpadIcon = "/img/Numpad1.png";
const NumpadIconFilled = "/img/Numpad2.png";
const PhoneIcon = "/img/PhoneCall1.png";
const PhoneIconFilled = "/img/PhoneCall2.png";

const LoginDesign1 = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { company } = useCompany();
  const [showForgot, setShowForgot] = React.useState(false); // ✅ NEW STATE

  const [submittedPhone, setSubmittedPhone] = React.useState("");

  useEffect(() => {
    if (company?.sliderImages && company.sliderImages.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % company.sliderImages.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [company?.sliderImages]);

  const validationSchema = Yup.object({
    phoneNumber: Yup.string()
      .matches(/^\d{10}$/, "Phone number must be 10 digits")
      .required("Phone number is required"),
    password: Yup.string().required("Password is required"),
  });
  const data = useSelector((state) => state?.login?.loginResponse);
  const OtpVerify = useSelector((state) => state?.login?.loginResponse?.data);

  useEffect(() => {
    if (!data) return;

    if (data.status === "SUCCESS") {
      const loginData =
        data?.loginResponse?.data || data?.data || OtpVerify || {};
      const requiresOtp = !!loginData?.requiresOtpVerify;
      const requires2FA = !!loginData?.requires2FA;
      // console.log("ssss", loginData, requiresOtp, requires2FA);

      if (requiresOtp) {
        navigate("/auth/otpverify", {
          state: { mobileNo: submittedPhone },
        });
        return;
      }

      if (requires2FA) {
        navigate("/require/2fa", {
          state: { mobileNo: loginData?.mobileNo || data?.data?.mobileNo },
        });
        return;
      }

      const rolePaths = {
        1: "/dashboard/home",
        2: "/adminDashBoard/home",
        3: "/masterDistributerDashboard/home",
        4: "/distributerDashboard/home",
        5: "/retailerDashboard/home",
        6: "/employeeDashboard/home",
      };
      const userRole = data?.data?.userRole || loginData?.userRole;
      navigate(rolePaths[userRole] || "/dashboard/home");
    }
  }, [data, OtpVerify, navigate]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const locationIPData = await getLocationAndIP();

      if (
        !locationIPData.location.latitude ||
        !locationIPData.location.longitude
      ) {
        showNotification({
          type: "warning",
          message: "Please allow location to proceed with login.",
          duration: 6000,
        });
      }

      const payload = {
        mobileNo: values.phoneNumber,
        password: values.password,
        latitude: locationIPData.location.latitude || "",
        longitude: locationIPData.location.longitude || "",
        userType: "1",
      };
      setSubmittedPhone(values.phoneNumber);

      dispatch(loginStatus(payload));
    } catch (error) {
      console.error("Login error:", error);
      alert(error.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (data) {
      console.log("login slice updated:", data);
    }
  }, [data]);
  if (showForgot) {
    return <ForgotPassword onBack={() => setShowForgot(false)} />;
  }
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white overflow-hidden">
      {company?.sliderImages && company.sliderImages.length > 0 ? (
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          {company.sliderImages.map((slider, index) => (
            <div
              key={slider.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
              style={{
                backgroundImage: `url(${slider.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-900/40 via-green-800/30 to-transparent"></div>
            </div>
          ))}

          {company.sliderImages.length > 1 && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 flex gap-3">
              {company.sliderImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentSlide
                      ? "w-8 h-2 bg-white shadow-lg"
                      : "w-2 h-2 bg-white/50 hover:bg-white/70"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url(/img/background.jpg)",
            }}
          >
            <div className="absolute inset-0 bg-green-900/20"></div>
          </div>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center bg-white px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-8 sm:py-10 md:py-8 lg:py-0 overflow-y-auto">
        <div
          className="w-full max-w-sm sm:max-w-md md:max-w-2xl mx-auto"
          style={{ maxWidth: "534px" }}
        >
          <div className="mb-6 sm:mb-8 md:mb-6 lg:mb-8 text-center">
            <div className="flex justify-center mb-4 sm:mb-6 md:mb-4">
              <img
                src={company?.logo || "/img/gmaxepay.png"}
                alt={company?.companyName || "GMAXEPAY Logo"}
                className="object-contain h-16 sm:h-20 md:h-24 lg:h-28"
                loading="eager"
                fetchpriority="high"
                decoding="async"
                onError={(e) => {
                  e.target.src = "/img/gmaxepay.png";
                }}
              />
            </div>
            <h1
              className="text-gray-900 mb-2 text-3xl sm:text-4xl md:text-5xl lg:text-[38px]"
              style={{
                fontFamily: "Gilroy-SemiBold",
                fontWeight: 400,
                lineHeight: "1.1",
              }}
            >
              Welcome Back!
            </h1>
            <p
              className="text-gray-600 text-lg sm:text-xl md:text-2xl lg:text-2xl"
              style={{
                fontFamily: "Gilroy-Medium",
                fontWeight: 400,
                lineHeight: "1.2",
                marginTop: "12px",
              }}
            >
              Let's Get Your Business Growing Together
            </p>
          </div>

          <Formik
            initialValues={{ phoneNumber: "", password: "" }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, values, setFieldValue }) => (
              <Form className="mt-6">
                <div className="mb-5 sm:mb-6 md:mb-5 lg:mb-7">
                  <label
                    htmlFor="phoneNumber"
                    className="block text-gray-700 mb-2 sm:mb-3 md:mb-2"
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
                      minLength={10}
                      maxLength={10}
                      pattern="[0-9]{10}"
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
                      required
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

                <div>
                  <label
                    htmlFor="password"
                    className="block text-gray-700 mb-2 sm:mb-3 md:mb-2"
                    style={{
                      fontFamily: "Gilroy-SemiBold",
                      fontWeight: 400,
                      fontSize: "16px",
                      lineHeight: "100%",
                    }}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-[14px] flex items-center pointer-events-none z-10">
                      <img
                        src={values.password ? NumpadIconFilled : NumpadIcon}
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
                    {values.password && (
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-[14px] flex items-center cursor-pointer z-20 bg-transparent border-0 outline-none"
                      >
                        <img
                          src={
                            showPassword ? "/img/EyeClosed.png" : "/img/Eye.png"
                          }
                          alt={showPassword ? "Hide password" : "Show password"}
                          className="object-contain w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7"
                        />
                      </button>
                    )}
                    <Field
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter Your Password"
                      autoComplete="off"
                      className="block w-full rounded-lg transition-all outline-none h-14 sm:h-16 md:h-20 lg:h-[60px] pl-[60px]"
                      style={{
                        fontFamily: "Gilroy-Medium",
                        fontWeight: 400,
                        fontSize: "15px",
                        lineHeight: "100%",
                        paddingRight: values.password ? "60px" : "16px",
                        border: `1.5px solid ${
                          values.password ? "#1B1717" : "rgba(27, 23, 23, 0.5)"
                        }`,
                      }}
                      required
                    />
                    <ErrorMessage name="password">
                      {(msg) => (
                        <div className="absolute left-0 -bottom-6 text-red-500 text-sm ml-2 w-full z-50">
                          {msg}
                        </div>
                      )}
                    </ErrorMessage>
                  </div>
                </div>

                {/* Forgot Password Link */}
                <div className="flex justify-end mt-6 mb-6 sm:mb-7 md:mb-6 lg:mb-10">
                  <button
                    type="button"
                    // onClick={() => setShowForgot(true)}
                    className="text-1B1717 hover:text-1B1717 transition-colors"
                    style={{
                      fontFamily: "Gilroy-SemiBold",
                      fontWeight: 400,
                      fontSize: "16px",
                      lineHeight: "100%",
                    }}
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Submit Button Container */}
                <div className="w-full">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full text-white transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center shadow-lg h-14 sm:h-16 md:h-20 lg:h-[60px] font-semibold rounded-xl relative overflow-hidden"
                    style={{
                      backgroundColor: company?.primaryColor || "#039155",
                      boxShadow: "0 4px 14px 0",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSubmitting && company?.secondaryColor) {
                        e.target.style.backgroundColor = company.secondaryColor;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSubmitting && company?.primaryColor) {
                        e.target.style.backgroundColor = company.primaryColor;
                      }
                    }}
                  >
                    {isSubmitting ? (
                      <div className="w-full h-full flex items-center justify-center relative">
                        <span className="absolute flex items-center justify-center w-10 h-10 bg-white rounded-full transition-all duration-1000 animate-slide-circle">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            style={{
                              color: company?.primaryColor || "#039155",
                            }}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M14 5l7 7m0 0l-7 7m7-7H3"
                            />
                          </svg>
                        </span>
                      </div>
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

          {/* Contact Information */}
          <div className="mt-7">
            {/* Email */}
            <div className="flex items-center justify-center gap-3">
              <img
                src="/img/Chat.png"
                alt="Email"
                className="object-contain w-6 h-6"
              />
              <span
                style={{
                  fontFamily: "Gilroy-Medium",
                  fontWeight: 400,
                  fontSize: "18px",
                  lineHeight: "100%",
                  color: "#1B1717",
                }}
              >
                {company?.customerSupportEmail || "support@gmaxepay.com"}
              </span>
            </div>

            {/* Phone */}
            <div className="flex items-center justify-center gap-3 mt-3">
              <img
                src="/img/PhoneOutgoing.png"
                alt="Phone"
                className="object-contain w-6 h-6"
              />
              <span
                style={{
                  fontFamily: "Gilroy-Medium",
                  fontWeight: 400,
                  fontSize: "18px",
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
        </div>
      </div>
    </div>
  );
};

export default LoginDesign1;
