import React, { useEffect, useRef, useState } from "react";
import { HiArrowLeft } from "react-icons/hi2";
import { FaCloudUploadAlt } from "react-icons/fa";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  ipCheckStatus,
  getCityByPincode,
  getPincodeByCity,
  panDataFetch,
  createWhiteLabel,
} from "../../redux/action/whiteLabelAction";
import { useDispatch, useSelector } from "react-redux";
import Loader, { ButtonLoader } from "../../widgets/layout/loader";
import { useNotification } from "../../context/NotificationContext";

const WhiteLabel = ({ onBack }) => {
  const dispatch = useDispatch();
  const { showNotification, success, error } = useNotification();
  const [cityOptions, setCityOptions] = useState([]);
  const [pincodeOptions, setPincodeOptions] = useState([]);
  const [isCityFetched, setIsCityFetched] = useState(false);
  const [isPincodeFetched, setIsPincodeFetched] = useState(false);
  const [activeInput, setActiveInput] = useState("");
  const [isImageUploading, setIsImageUploading] = useState(false);
  const lastFetchedPincode = useRef("");

  // Loading state
  const isLoading = useSelector((state) => state?.loading?.isLoading);

  const cityDataRetrived = useSelector(
    (state) => state?.whitelabel?.citybyPincode?.citybyPincode?.postOffices,
  );
  const pincodeStatus = useSelector(
    (state) => state?.whitelabel?.citybyPincode?.status,
  );
  const presentState = useSelector(
    (state) => state?.whitelabel?.citybyPincode?.citybyPincode?.state,
  );
  const verificationToken = useSelector(
    (state) => state?.whitelabel?.ipResponse?.ipResponse?.verificationToken,
  );
  const createSuccess = useSelector(
    (state) => state?.whitelabel?.createResponse?.status,
  );
  const createMessage = useSelector(
    (state) => state?.whitelabel?.createResponse?.message,
  );

  // IP Check states
  const ipCheckStatusState = useSelector(
    (state) => state?.whitelabel?.ipResponse?.status,
  );
  const ipCheckMessage = useSelector(
    (state) => state?.whitelabel?.ipResponse?.message,
  );
  const ipCheckError = useSelector((state) => state?.error?.error);

  // PAN Fetch states
  const panDataStatus = useSelector(
    (state) => state?.whitelabel?.panData?.status,
  );
  const panDataMessage = useSelector(
    (state) => state?.whitelabel?.panData?.message,
  );
  const panDataError = useSelector((state) => state?.error?.message);

  // Create error state
  const createError = useSelector((state) => state?.error?.error);

  // Track last shown notifications to avoid duplicates
  const lastNotificationRef = useRef({
    ipCheck: null,
    panFetch: null,
    create: null,
  });

  // Show notifications for IP Check
  useEffect(() => {
    if (ipCheckStatusState === "SUCCESS" && ipCheckMessage) {
      const notificationKey = `ip-success-${ipCheckMessage}`;
      if (lastNotificationRef.current.ipCheck !== notificationKey) {
        success(ipCheckMessage || "IP check completed successfully");
        lastNotificationRef.current.ipCheck = notificationKey;
      }
    }
  }, [ipCheckStatusState, ipCheckMessage, success]);

  useEffect(() => {
    if (
      ipCheckError &&
      typeof ipCheckError === "string" &&
      ipCheckStatusState !== "SUCCESS"
    ) {
      const notificationKey = `ip-error-${ipCheckError}`;
      if (lastNotificationRef.current.ipCheck !== notificationKey) {
        error(ipCheckError);
        lastNotificationRef.current.ipCheck = notificationKey;
      }
    }
  }, [ipCheckError, ipCheckStatusState, error]);

  // Show notifications for PAN Fetch
  useEffect(() => {
    if (panDataStatus === "Success" && panDataMessage) {
      const notificationKey = `pan-success-${panDataMessage}`;
      if (lastNotificationRef.current.panFetch !== notificationKey) {
        success(panDataMessage || "PAN data fetched successfully");
        lastNotificationRef.current.panFetch = notificationKey;
      }
    }
  }, [panDataStatus, panDataMessage, success]);

  useEffect(() => {
    if (panDataStatus === "Failure" && panDataError) {
      const errorMsg =
        typeof panDataError === "string"
          ? panDataError
          : "Failed to fetch PAN data";
      const notificationKey = `pan-error-${errorMsg}`;
      if (lastNotificationRef.current.panFetch !== notificationKey) {
        error(errorMsg);
        lastNotificationRef.current.panFetch = notificationKey;
      }
    }
  }, [panDataStatus, panDataError, error]);

  // Show success message when form is submitted successfully
  useEffect(() => {
    if (createSuccess === "SUCCESS") {
      const notificationKey = `create-success-${createMessage}`;
      if (lastNotificationRef.current.create !== notificationKey) {
        success(createMessage || "Whitelabel created successfully!");
        lastNotificationRef.current.create = notificationKey;
        formik.resetForm();
      }
    }
  }, [createSuccess, createMessage, success]);

  // Show error message when form submission fails
  useEffect(() => {
    if (
      createError &&
      typeof createError === "string" &&
      createSuccess !== "SUCCESS"
    ) {
      const notificationKey = `create-error-${createError}`;
      if (lastNotificationRef.current.create !== notificationKey) {
        error(createError);
        lastNotificationRef.current.create = notificationKey;
      }
    }
  }, [createError, createSuccess, error]);

  const validationSchema = Yup.object({
    businessEntity: Yup.string().required("Business entity is required"),
    mobile: Yup.string()
      .matches(/^[6-9]\d{9}$/, "Enter a valid mobile number")
      .required("Mobile number is required"),
    pan: Yup.string()
      .matches(/[A-Z]{5}[0-9]{4}[A-Z]{1}/, "Enter valid PAN number")
      .required("PAN number is required"),
    email: Yup.string()
      .email("Enter a valid email")
      .required("Email is required"),
    address: Yup.string().required("Address is required"),
    city: Yup.string().required("City is required"),
    state: Yup.string().required("State is required"),
    postalCode: Yup.string()
      .matches(/^\d{6}$/, "Enter valid 6-digit postal code")
      .required("Postal code is required"),
    gstin: Yup.string()
      .matches(
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
        "Enter a valid 15-character GSTIN",
      )
      .nullable(),
    companyName: Yup.string().required("Company name is required"),
    companyDomain: Yup.string()
      .matches(
        /^(?!:\/\/)([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,11}?$/,
        "Enter a valid domain (e.g. example.com)",
      )
      .required("Company domain is required"),
    remarks: Yup.string(),
    profilePhoto: Yup.mixed()
      .required("Profile photo is required")
      .test("fileSize", "File too large", (value) => {
        return value && value.size <= 2 * 1024 * 1024; // max 2MB
      })
      .test("fileType", "Unsupported file format", (value) => {
        return (
          value &&
          ["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(
            value.type,
          )
        );
      }),

    defaultPermission: Yup.boolean(),
    clientConsent: Yup.boolean().oneOf(
      [true],
      "You must confirm client consent",
    ),
  });
  const formik = useFormik({
    initialValues: {
      businessEntity: "",
      mobile: "",
      pan: "",
      name: "",
      email: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      gstin: "",
      companyName: "",
      companyDomain: "",
      remarks: "",
      defaultPermission: false,
      clientConsent: true,
    },
    validationSchema,
    onSubmit: (values) => {
      const formData = new FormData();

      formData.append("BussinessEntity", values.businessEntity);
      formData.append("MobileNo", values.mobile);
      formData.append("PanNumber", values.pan);
      formData.append("PanName", values.name);
      formData.append("email", values.email);
      formData.append("address", values.address);
      formData.append("city", values.city);
      formData.append("postalCode", values.postalCode);
      formData.append("state", values.state);
      formData.append("companyName", values.companyName);
      formData.append("customDomain", values.companyDomain);
      formData.append("Remarks", values.remarks || "");
      formData.append("verificationToken", verificationToken || "");
      formData.append("companyGst", values.gstin);
      formData.append("profileImage", values.profilePhoto);
      dispatch(createWhiteLabel(formData));
    },
  });

  const inputStyle =
    "p-3 border border-gray-300 rounded-lg w-full text-sm placeholder-gray-500 focus:ring-green-500 focus:border-green-500";
  const labelStyle =
    "text-md font-[Gilroy-Medium] text-[#1B1717] mb-1 flex items-center";

  const ErrorMsg = ({ name }) => (
    <div className="min-h-[0px]">
      {formik.touched[name] && formik.errors[name] ? (
        <p className="text-red-500 text-xs">{formik.errors[name]}</p>
      ) : (
        <p className="text-xs opacity-0">placeholder</p>
      )}
    </div>
  );
  useEffect(() => {
    if (presentState && !formik.values.state) {
      formik.setFieldValue("state", presentState);
    }
  }, [presentState]);

  useEffect(() => {
    const { postalCode } = formik.values;
    if (
      activeInput === "pincode" &&
      /^\d{6}$/.test(postalCode) &&
      postalCode !== lastFetchedPincode.current
    ) {
      lastFetchedPincode.current = postalCode;
      dispatch(getCityByPincode({ pincode: postalCode }));
    }
  }, [formik.values.postalCode, activeInput, dispatch]);

  // When user types a city → fetch pincode
  useEffect(() => {
    const { city } = formik.values;
    if (activeInput === "city" && city && city.length >= 3) {
      dispatch(getPincodeByCity({ city }));
    }
  }, [formik.values.city, activeInput, dispatch]);

  useEffect(() => {
    if (pincodeStatus === "SUCCESS" && Array.isArray(cityDataRetrived)) {
      const uniqueCities = [
        ...new Set(cityDataRetrived.map((item) => item.name)),
      ];
      const stateName = cityDataRetrived[0]?.state || "";
      setCityOptions(uniqueCities);

      setIsPincodeFetched(false); // Disable pincode dropdown
      setIsCityFetched(false); // Enable city dropdown

      if (!formik.values.city || !uniqueCities.includes(formik.values.city)) {
        formik.setFieldValue("city", uniqueCities[0] || "");
      }

      if (!formik.values.state) {
        formik.setFieldValue("state", stateName);
      }
    }
  }, [pincodeStatus]);

  const cityStatus = useSelector(
    (state) => state?.whitelabel?.pincodeByCity?.status,
  );
  const fetchedPincodeList = useSelector(
    (state) =>
      state?.whitelabel?.pincodeByCity?.pincodeByCity?.map(
        (item) => item?.Pincode,
      ) || [],
  );

  useEffect(() => {
    const { city } = formik.values;
    if (city && city.length >= 3) {
      dispatch(getPincodeByCity({ city }));
    }
  }, [formik.values.city, dispatch]);

  useEffect(() => {
    if (cityStatus === "SUCCESS" && fetchedPincodeList.length > 0) {
      const uniquePincodes = [...new Set(fetchedPincodeList)];
      setPincodeOptions(uniquePincodes);

      setIsCityFetched(false); // Disable city dropdown
      setIsPincodeFetched(false); // Enable pincode dropdown

      if (!formik.values.postalCode) {
        formik.setFieldValue("postalCode", uniquePincodes[0]);
      }
    }
  }, [cityStatus]);
  useEffect(() => {
    if (
      activeInput === "pincode" &&
      pincodeStatus === "SUCCESS" &&
      Array.isArray(cityDataRetrived)
    ) {
      const uniqueCities = [
        ...new Set(cityDataRetrived.map((item) => item.name)),
      ];
      const stateName = cityDataRetrived[0]?.state || "";
      setCityOptions(uniqueCities);
      setIsCityFetched(false);
      setIsPincodeFetched(true); // disable reverse dropdown

      formik.setFieldValue("city", uniqueCities[0] || "");
      formik.setFieldValue("state", stateName);
    }
  }, [pincodeStatus, activeInput]);

  // When pincodes fetched by city
  useEffect(() => {
    if (
      activeInput === "city" &&
      cityStatus === "SUCCESS" &&
      fetchedPincodeList.length > 0
    ) {
      const uniquePincodes = [...new Set(fetchedPincodeList)];
      setPincodeOptions(uniquePincodes);
      setIsPincodeFetched(false);
      setIsCityFetched(true); // disable reverse dropdown

      formik.setFieldValue("postalCode", uniquePincodes[0]);
    }
  }, [cityStatus, activeInput]);

  const handleIPCheck = () => {
    const domain = formik.values.companyDomain;
    if (!domain) {
      error("Please enter a company domain first!");
      return;
    }
    dispatch(ipCheckStatus({ domain }));
  };

  const handleFetchPan = () => {
    const pan = formik.values.pan;
    if (!pan) {
      error("Please enter a PAN number first!");
      return;
    }
    dispatch(panDataFetch({ pan }));
  };

  const panname = useSelector(
    (state) => state?.whitelabel?.panData?.panData?.registered_name,
  );

  // 🔹 Auto-set PAN name into formik once fetched
  useEffect(() => {
    if (panname) {
      formik.setFieldValue("name", panname);
    }
  }, [panname]);

  return (
    <div className="py-4 px-2">
      {isLoading && <Loader />}
      <form onSubmit={formik.handleSubmit}>
        <div className="mb-6">
          <div className="flex items-center text-[#1B1717] mb-3">
            <div
              onClick={onBack}
              className="flex items-center justify-center w-10 h-10 border border-gray-400 rounded-full mr-4 cursor-pointer"
            >
              <HiArrowLeft className="text-2xl text-[#1B1717] opacity-80" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl sm:text-2xl font-[Gilroy-Medium] text-[#1B1717]">
                Create Whitelabel
              </h1>
              <p className="text-[#1B1717] font-[Gilroy-Regular] text-sm sm:text-base lg:text-lg">
                Set Up Your Whitelabel Configuration With Business Details And
                Profile Settings
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row justify-center gap-6">
          <div className="bg-white w-full lg:max-w-[750px] p-4 sm:p-6 lg:p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl sm:text-3xl font-[Gilroy-Medium] text-[#1B1717] mb-4 pb-2">
              Business Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelStyle}>
                  Business Entity<span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  name="businessEntity"
                  className={inputStyle}
                  value={formik.values.businessEntity}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <option value="">Select</option>
                  <option value="individual">Individual / Freelance</option>
                  <option value="Partnership">Partnership</option>
                  <option value="Soleproprietership">
                    Sole proprietership
                  </option>
                  <option value="Public/PrivateLimitedCompany">
                    Public / Private Limited Company
                  </option>
                  <option value="Trust/NGO/Societies">
                    Trust / NGO / Societies
                  </option>
                  <option value="LLP">LLP</option>
                  <option value="CompanyYetToRegister">
                    Company Yet To Register
                  </option>
                </select>
                <ErrorMsg name="businessEntity" />
              </div>

              <div>
                <label className={labelStyle}>
                  Mobile Number<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  name="mobile"
                  placeholder="Enter Mobile Number"
                  className={inputStyle}
                  value={formik.values.mobile}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <ErrorMsg name="mobile" />
              </div>
            </div>

            {/* PAN Number & Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className={labelStyle}>
                  Pan Number<span className="text-red-500 ml-1">*</span>
                </label>
                <div className="flex">
                  <input
                    type="text"
                    name="pan"
                    placeholder="Enter Pan Number"
                    className="p-3 border border-gray-300 rounded-l-lg w-full text-sm placeholder-gray-500 border-r-0"
                    value={formik.values.pan}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  <button
                    type="button"
                    onClick={handleFetchPan}
                    className="bg-[#039155] text-white p-3 rounded-r-lg font-normal text-sm shadow-md hover:bg-green-700 transition-all duration-300 whitespace-nowrap"
                  >
                    Fetch
                  </button>
                </div>
                <ErrorMsg name="pan" />
              </div>

              <div>
                <label className={labelStyle}>Name (Auto Fetched)</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Name Of Pan Holder"
                  className={inputStyle}
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  readOnly={!!panname}
                />
              </div>
            </div>

            {/* Email & Profile Photo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className={labelStyle}>
                  Email Id<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  name="email"
                  placeholder="Enter Email Id"
                  className={inputStyle}
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <ErrorMsg name="email" />
              </div>

              <div>
                <label className={labelStyle}>Profile Photo</label>
                <label
                  htmlFor="profilePhoto"
                  className={`flex items-center justify-center bg-gray-200 text-gray-700 p-3 rounded-lg font-[Gilroy-Medium] hover:bg-gray-300 w-full text-sm cursor-pointer ${isImageUploading ? "opacity-75 cursor-not-allowed" : ""
                    }`}
                >
                  {isImageUploading ? (
                    <>
                      <ButtonLoader size={16} color="#039155" thickness={2} />
                      <span className="ml-2">Processing...</span>
                    </>
                  ) : (
                    <>
                      Choose File{" "}
                      <FaCloudUploadAlt className="ml-2 text-base" />
                    </>
                  )}
                </label>
                <input
                  id="profilePhoto"
                  name="profilePhoto"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isImageUploading}
                  onChange={async (event) => {
                    const file = event.currentTarget.files[0];
                    if (file) {
                      setIsImageUploading(true);
                      // Simulate file processing/validation
                      await new Promise((resolve) => setTimeout(resolve, 500));
                      formik.setFieldValue("profilePhoto", file);
                      setIsImageUploading(false);
                    }
                  }}
                />
                {formik.values.profilePhoto && !isImageUploading && (
                  <p className="mt-2 text-sm text-[#039155] flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {formik.values.profilePhoto.name || "File selected"}
                  </p>
                )}
                <ErrorMsg name="profilePhoto" />
              </div>
            </div>

            <div className="mt-4">
              <label className={labelStyle}>
                Address<span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                name="address"
                rows="2"
                placeholder="Enter Address"
                className={inputStyle}
                value={formik.values.address}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <ErrorMsg name="address" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {/* City */}

              <div>
                <label className={labelStyle}>
                  Postal Code<span className="text-red-500 ml-1">*</span>
                </label>

                {cityStatus === "SUCCESS" &&
                  pincodeOptions.length > 0 &&
                  !isPincodeFetched ? (
                  // Case: Fetched by city → show pincode dropdown
                  <select
                    name="postalCode"
                    className={inputStyle}
                    value={formik.values.postalCode}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "Other") {
                        setIsPincodeFetched(true); // switch to input mode
                        formik.setFieldValue("postalCode", "");
                      } else {
                        formik.handleChange(e);
                      }
                    }}
                  >
                    <option value="">Select Pincode</option>
                    {pincodeOptions.map((p, idx) => (
                      <option key={idx} value={p}>
                        {p}
                      </option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  // Default input mode
                  <input
                    type="text"
                    name="postalCode"
                    placeholder="Enter Postal Code"
                    className={inputStyle}
                    maxLength={6}
                    value={formik.values.postalCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setActiveInput("pincode");
                      if (val.length <= 6) {
                        formik.setFieldValue("postalCode", val);
                      }
                    }}
                  />
                )}

                <ErrorMsg name="postalCode" />
              </div>

              <div>
                <label className={labelStyle}>
                  State<span className="text-red-500 ml-1">*</span>
                </label>

                {/* If auto-fetched or dropdown available */}
                {presentState && !isCityFetched ? (
                  <select
                    name="state"
                    className={inputStyle}
                    value={formik.values.state}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "Other") {
                        // Switch to manual input
                        formik.setFieldValue("state", "");
                        setIsCityFetched(true); // disable dropdown mode
                      } else {
                        formik.setFieldValue("state", val);
                      }
                    }}
                  >
                    <option value="">Select State</option>
                    <option value={presentState}>{presentState}</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  // Manual typing when "Other" is selected
                  <input
                    type="text"
                    name="state"
                    placeholder="Enter State"
                    className={inputStyle}
                    value={formik.values.state}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                )}

                <ErrorMsg name="state" />
              </div>

              <div>
                <label className={labelStyle}>
                  City<span className="text-red-500 ml-1">*</span>
                </label>

                {pincodeStatus === "SUCCESS" &&
                  cityOptions.length > 0 &&
                  !isCityFetched ? (
                  <select
                    name="city"
                    className={inputStyle}
                    value={formik.values.city}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "Other") {
                        // switch to input mode
                        setIsCityFetched(true);
                        setActiveInput("city");
                        formik.setFieldValue("city", "");
                      } else {
                        formik.setFieldValue("city", val);
                        setActiveInput("city");
                      }
                    }}
                    onBlur={formik.handleBlur}
                  >
                    <option value="">Select City</option>
                    {cityOptions.map((city, index) => (
                      <option key={index} value={city}>
                        {city}
                      </option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    name="city"
                    placeholder="Enter City"
                    className={inputStyle}
                    value={formik.values.city}
                    onChange={(e) => {
                      setActiveInput("city");
                      formik.handleChange(e);
                    }}
                    onBlur={formik.handleBlur}
                  />
                )}

                <ErrorMsg name="city" />
              </div>
            </div>
          </div>

          <div className="bg-white w-full lg:max-w-[550px] p-4 sm:p-6 lg:p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl sm:text-3xl font-[Gilroy-Medium] text-[#1B1717] mb-4 pb-2">
              Profile Configuration
            </h2>

            {/* 👇 this wrapper manages all input gaps */}
            <div className="space-y-5">
              <div>
                <label className={labelStyle}>GSTIN</label>
                <input
                  type="text"
                  name="gstin"
                  placeholder="Enter GST Number"
                  className={inputStyle}
                  value={formik.values.gstin}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>

              <div>
                <label className={labelStyle}>
                  Company Name<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  name="companyName"
                  placeholder="Enter Company Name"
                  className={inputStyle}
                  value={formik.values.companyName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <ErrorMsg name="companyName" />
              </div>

              <div>
                <label className={labelStyle}>
                  Company Domain<span className="text-red-500 ml-1">*</span>
                </label>
                <div className="flex flex-col sm:flex-row sm:items-stretch">
                  <input
                    type="text"
                    name="companyDomain"
                    placeholder="Enter Company Domain"
                    className="p-3 border border-gray-300 rounded-md sm:rounded-l-lg sm:rounded-r-none w-full sm:w-2/3 text-sm placeholder-gray-500 focus:ring-green-500 focus:border-green-500 sm:border-r-0"
                    value={formik.values.companyDomain}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  <button
                    type="button"
                    onClick={handleIPCheck}
                    className="bg-[#039155] text-white p-3 rounded-md sm:rounded-r-lg sm:rounded-l-none font-normal text-sm shadow-md hover:bg-green-700 transition-all duration-300 w-full sm:w-1/3 mt-2 sm:mt-0"
                  >
                    IP Check
                  </button>
                </div>
                <ErrorMsg name="companyDomain" />
              </div>

              {/* Default Permission */}
              <div className="flex items-start">
                <input
                  id="defaultPermission"
                  name="defaultPermission"
                  type="checkbox"
                  className="w-5 h-5 text-[#039155] bg-gray-100 border-gray-300 rounded mt-1 mr-2"
                  checked={formik.values.defaultPermission}
                  onChange={formik.handleChange}
                />
                <div className="text-sm text-gray-700">
                  <label
                    htmlFor="defaultPermission"
                    className="font-[Gilroy-Medium] flex items-center"
                  >
                    Default Permission
                  </label>
                  <p className="text-xs text-gray-500">
                    Permissions from the default whitelabel group will be
                    applied.
                  </p>
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className={labelStyle}>Remarks</label>
                <textarea
                  name="remarks"
                  rows="4"
                  placeholder="Write Remarks"
                  className={inputStyle}
                  value={formik.values.remarks}
                  onChange={formik.handleChange}
                />
              </div>

              {/* Client Consent */}
              <div className="flex items-start">
                <label className="relative inline-flex items-center cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    name="clientConsent"
                    className="sr-only peer"
                    checked={formik.values.clientConsent}
                    onChange={formik.handleChange}
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
                <div className="ml-3 text-sm">
                  <span className="font-[Gilroy-Medium] text-[#1B1717]">
                    Client Consent
                  </span>
                  <p className="text-[14px] text-[#1B1717] text-opacity-80">
                    I hereby confirm that the information submitted is provided
                    by the client & the client has shown interest in the
                    whitelabel solution.
                  </p>
                  <ErrorMsg name="clientConsent" />
                </div>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="mt-6 bg-[#039155] text-white px-6 py-3 rounded-lg font-[Gilroy-Semibold] text-lg w-full shadow-md hover:from-green-600 transition-all duration-300"
            >
              Create Profile
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default WhiteLabel;
