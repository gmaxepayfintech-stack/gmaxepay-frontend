import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import StartCapture from "../../../../public/img/StartCapture.svg";
import { aepsBankList, aepsWithdrawl } from "../../../redux/action/aepsAction";
import { getUserProfile } from "../../../redux/action/userProfileAction";

const FingerPrintIcon = "/img/FingerPrint.svg";
const IrisIcon = "/img/Iris.svg";
const EyeIcon = "/img/Eye.svg";

const Selectservice = () => {
  const dispatch = useDispatch();
  const bankList = useSelector((state) => state.aeps?.bankList);
  const userProfile = useSelector((state) => state.userProfile?.profile);
  
  const [activeTab, setActiveTab] = useState("cashWithdrawal");
  const [biometricMethod, setBiometricMethod] = useState("thumb");
  const [selectedBank, setSelectedBank] = useState(null); // Store full bank object
  const [selectedAmount, setSelectedAmount] = useState("1000");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  
  // Bank search states
  const [bankSearchQuery, setBankSearchQuery] = useState("");
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const bankDropdownRef = useRef(null);
  
  // Recent banks state - tracks recently selected banks
  const [recentBanksList, setRecentBanksList] = useState([]);
  
  // RD Service states
  const [rdBaseUrl, setRdBaseUrl] = useState("");
  const [pidData, setPidData] = useState("");
  const [deviceInfoXml, setDeviceInfoXml] = useState("");
  const [isDeviceChecking, setIsDeviceChecking] = useState(false);
  const [isGettingDeviceInfo, setIsGettingDeviceInfo] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [deviceConnected, setDeviceConnected] = useState(false);
  const [deviceMessage, setDeviceMessage] = useState("");
  const [scanProgress, setScanProgress] = useState(0); // For fill animation

  // Ref to track if API has been called for current pidData
  const pidDataProcessedRef = useRef(false);
  const lastPidDataRef = useRef("");
  
  const comingSoon = biometricMethod === "iris";

  const tabs = [
    { key: "cashWithdrawal", label: "Cash Withdrawal" },
    { key: "enquiry", label: "Enquiry" },
    { key: "statement", label: "Statement" },
  ];

  // Validation schema
  const validationSchema = Yup.object({
    selectedBank: Yup.object()
      .nullable()
      .required("Please select a bank"),
    selectedAmount: Yup.string()
      .required("Amount is required")
      .test("is-valid-amount", "Amount must be greater than 0", (value) => {
        if (!value) return false;
        const numericValue = value.replaceAll(",", "");
        return numericValue && parseFloat(numericValue) > 0;
      }),
    aadhaarNumber: Yup.string()
      .required("Aadhaar number is required")
      .matches(/^\d{12}$/, "Aadhaar number must be exactly 12 digits"),
    mobileNumber: Yup.string()
      .required("Mobile number is required")
      .matches(/^\d{10}$/, "Mobile number must be exactly 10 digits"),
    pidData: Yup.string()
      .required("Please capture fingerprint first"),
  });

  // Formik setup
  const formik = useFormik({
    initialValues: {
      selectedBank: null,
      selectedAmount: "1000",
      aadhaarNumber: "",
      mobileNumber: "",
      pidData: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      await handleWithdrawal(values);
    },
  });

  // Get banks from API response
  // bankList structure: { bankList: [...], status: "SUCCESS", message: "..." }
  const banks = bankList?.bankList || [];
  
  // Filter banks based on search query (show all if search is empty)
  const filteredBanks = bankSearchQuery
    ? banks.filter((bank) =>
        bank?.bankName?.toLowerCase().includes(bankSearchQuery.toLowerCase())
      )
    : banks;

  // Function to handle bank selection and update recent banks
  const handleBankSelection = (bank) => {
    setSelectedBank(bank);
    setBankSearchQuery(bank.bankName);
    setShowBankDropdown(false);
    formik.setFieldValue("selectedBank", bank);
    formik.setFieldTouched("selectedBank", true);
    
    // Update recent banks list - add selected bank to the front
    setRecentBanksList((prev) => {
      // Remove the bank if it already exists in the list
      const filtered = prev.filter((b) => b.id !== bank.id);
      // Add selected bank to the front, limit to 4 banks total
      return [bank, ...filtered].slice(0, 4);
    });
  };

  // Get recent banks - selected bank first, then other recent banks, then fallback to first 4 from API
  const recentBanks = (() => {
    if (selectedBank) {
      // If a bank is selected, show it first
      const otherRecent = recentBanksList.filter((b) => b.id !== selectedBank.id);
      const result = [selectedBank, ...otherRecent].slice(0, 4);
      return result;
    } else if (recentBanksList.length > 0) {
      // If no bank is selected but we have recent banks, show them
      return recentBanksList.slice(0, 4);
    } else {
      // Fallback to first 4 from API
      return banks.slice(0, 4);
    }
  })();

  /* -------------------------------
      STEP 1 → Discover RD SERVICE
  ---------------------------------*/
  const discoverAvdm = async () => {
    setIsDeviceChecking(true);
    setDeviceConnected(false);
    setRdBaseUrl("");
    setDeviceMessage("Checking device...");

    const baseURL = "https://127.0.0.1:11100";

    try {
      // ---- CALL 1: RDSERVICE ----
      const rdResp = await fetch(baseURL, {
        method: "RDSERVICE",
        headers: {
          "Content-Type": "text/xml; charset=utf-8",
        },
      });

      if (!rdResp.ok) {
        throw new Error("RD Service not responding");
      }

      const rdText = await rdResp.text();
      setDeviceInfoXml(rdText);

      const xmlDoc = new DOMParser().parseFromString(rdText, "text/xml");
      const rdService = xmlDoc.getElementsByTagName("RDService")[0];
      const status = rdService?.getAttribute("status");

      if (status !== "READY") {
        setDeviceConnected(false);
        setDeviceMessage("Device detected but not ready");
        setIsDeviceChecking(false);
        return;
      }

      setRdBaseUrl(baseURL);
      setDeviceConnected(true);
      setDeviceMessage("Device detected and READY");
    } catch (err) {
      console.error(err);
      setDeviceConnected(false);
      setDeviceMessage("RD Service not found! Install ACPL/FM220U RD Service.");
    }

    setIsDeviceChecking(false);
  };

  /* -------------------------------
      STEP 2 → GET DEVICE INFO
  ---------------------------------*/
  const getDeviceInfo = async () => {
    if (!rdBaseUrl) {
      setDeviceMessage("Please check device first.");
      return;
    }

    setIsGettingDeviceInfo(true);
    setDeviceMessage("Fetching device info...");

    try {
      const infoResp = await fetch(`${rdBaseUrl}/rd/info`, {
        method: "DEVICEINFO",
      });

      const infoText = await infoResp.text();
      setDeviceInfoXml(infoText);

      // Parse XML to extract device name
      const xmlDoc = new DOMParser().parseFromString(infoText, "text/xml");
      const deviceInfo = xmlDoc.getElementsByTagName("DeviceInfo")[0];
      const deviceName = deviceInfo?.getAttribute("mi") || "Unknown Device";

      setDeviceMessage(`Device Name: ${deviceName}`);
      console.log("Device Info:", infoText);
      console.log("Device Name:", deviceName);
    } catch (err) {
      setDeviceMessage("Failed to read device info");
      console.error("Device info error:", err);
    }

    setIsGettingDeviceInfo(false);
  };

  /* -------------------------------
      STEP 3 → CAPTURE FINGER
  ---------------------------------*/
  const captureAvdm = async () => {
    if (!rdBaseUrl) {
      setDeviceMessage("No device found. Check device first.");
      return;
    }

    // Reset refs for new capture
    pidDataProcessedRef.current = false;
    lastPidDataRef.current = "";
    setPidData(""); // Clear previous pidData to ensure useEffect triggers
    setScanProgress(0); // Reset progress

    setIsScanning(true);
    setDeviceMessage("Capturing fingerprint... Place your thumb on the scanner");

    // Start smooth progress animation that fills to 100% during capture
    const totalDuration = 10000; // 10 seconds (matches timeout)
    const updateInterval = 100; // Update every 100ms
    const incrementPerUpdate = (100 / (totalDuration / updateInterval)); // ~1% per update
    
    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += incrementPerUpdate;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(progressInterval);
      }
      setScanProgress(currentProgress);
    }, updateInterval);

    const pidOptions = `<?xml version="1.0"?>
      <PidOptions ver="1.0">
        <Opts 
          fCount="1"
          fType="0"
          format="0"
          pidVer="2.0"
          timeout="10000"
          env="P"
        />
      </PidOptions>
    `;

    try {
      const captureResp = await fetch(`${rdBaseUrl}/rd/capture`, {
        method: "CAPTURE",
        headers: { "Content-Type": "text/xml; charset=utf-8" },
        body: pidOptions,
      });

      const captureText = await captureResp.text();

      // Clear progress interval
      clearInterval(progressInterval);

      const xmlDoc = new DOMParser().parseFromString(captureText, "text/xml");
      const respNode = xmlDoc.getElementsByTagName("Resp")[0];
      const errCode = respNode?.getAttribute("errCode");

      if (errCode === "0") {
        // Only complete to 100% on successful capture (thumb was on device)
        setScanProgress(100);
        setDeviceMessage("Fingerprint captured successfully");
        // Store pidData
        console.log("✅ PID Data captured successfully, errCode:", errCode);
        console.log("📦 Setting pidData, length:", captureText.length);
        setPidData(captureText);
        formik.setFieldValue("pidData", captureText);
        setIsScanning(false);
      } else {
        // Reset progress on failure - thumb was not on device or capture failed
        setScanProgress(0);
        const errInfo = respNode?.getAttribute("errInfo") || "";
        setDeviceMessage(`Capture failed: ${errInfo}`);
        console.error(`Capture failed: ${errInfo}`);
        setIsScanning(false);
      }
    } catch (err) {
      clearInterval(progressInterval);
      setScanProgress(0);
      setDeviceMessage("Capture failed. Please try again.");
      console.error("Capture failed:", err);
      setIsScanning(false);
    }
  };

  // Fetch user profile on component mount
  useEffect(() => {
    dispatch(getUserProfile())
      .then((response) => {
        console.log("User profile response:", response);
      })
      .catch((error) => {
        console.error("User profile error:", error);
      });
  }, [dispatch]);

  // Fetch bank list on component mount
  useEffect(() => {
    const payload = {
      query: { isActive: true },
      customSearch: {},
      options: {
        page: 1,
        paginate: 100,
        sort: { id: 1 }
      }
    };
    
    dispatch(aepsBankList(payload))
      .then((response) => {
        console.log("Bank list response:", response);
      })
      .catch((error) => {
        console.error("Bank list error:", error);
      });
  }, [dispatch]);

  // Check device on component mount
  useEffect(() => {
    discoverAvdm();
  }, []);

  // Clear temporary device messages after 3 seconds, but keep important ones
  useEffect(() => {
    if (deviceMessage) {
      // Messages to keep (don't clear these)
      const persistentMessages = [
        "Device Name:",
        "Device detected and READY",
        "Device Connected",
        "Device Not Connected"
      ];
      
      // Check if this is a persistent message
      const isPersistent = persistentMessages.some(msg => deviceMessage.includes(msg));
      
      // Only clear non-persistent messages after 3 seconds
      if (!isPersistent) {
        const timer = setTimeout(() => {
          setDeviceMessage("");
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [deviceMessage]);

  // Close bank dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bankDropdownRef.current && !bankDropdownRef.current.contains(event.target)) {
        setShowBankDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Sync Formik values with component state
  useEffect(() => {
    formik.setFieldValue("selectedBank", selectedBank);
  }, [selectedBank, formik]);

  useEffect(() => {
    formik.setFieldValue("selectedAmount", selectedAmount);
  }, [selectedAmount, formik]);

  useEffect(() => {
    formik.setFieldValue("aadhaarNumber", aadhaarNumber);
  }, [aadhaarNumber, formik]);

  useEffect(() => {
    formik.setFieldValue("mobileNumber", mobileNumber);
  }, [mobileNumber, formik]);

  useEffect(() => {
    formik.setFieldValue("pidData", pidData);
  }, [pidData, formik]);

  // Handle withdrawal button click
  const handleWithdrawal = async (values) => {
    const { selectedBank: bank, selectedAmount: amount, aadhaarNumber: aadhar, mobileNumber: mobile, pidData: pid } = values;

    // Get location and IP from userProfile
    const latitude = userProfile?.latitude || "";
    const longitude = userProfile?.longitude || "";
    const ipAddress = userProfile?.ipAddress || "";

    // Prepare payload - pidData should already be the full XML response
    // If it doesn't have PidData wrapper, wrap it; otherwise use as is
    let biometricDataXml = pid;
    if (!pid.includes("<PidData>")) {
      biometricDataXml = `<?xml version="1.0"?><PidData>${pid}</PidData>`;
    } else if (!pid.includes("<?xml version")) {
      biometricDataXml = `<?xml version="1.0"?>${pid}`;
    }

    const payload = {
      biometricData: biometricDataXml,
      captureType: "FINGER",
      amount: amount.replaceAll(",", ""), // Remove commas from amount
      txnType: "CW",
      bankiin: bank.bankIIN,
      latitude: latitude,
      longitude: longitude,
      ipAddress: ipAddress,
      aadharNumber: aadhar,
      consumerNumber: mobile
    };

    try {
      const response = await dispatch(aepsWithdrawl(payload));
      if (response?.status === "SUCCESS") {
        alert("Withdrawal successful!");
        // Reset form
        formik.resetForm();
        setSelectedBank(null);
        setSelectedAmount("1000");
        setAadhaarNumber("");
        setMobileNumber("");
        setPidData("");
        setBankSearchQuery("");
      } else {
        alert(response?.message || "Withdrawal failed");
      }
    } catch (error) {
      console.error("Withdrawal error:", error);
      alert("An error occurred during withdrawal. Please try again.");
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="text-[24px] font-['Gilroy-Medium'] text-[#1B1717]">
          Select Your Service
        </div>
      </div>

      {/* Service Tabs */}
      <div className="mb-[28px]">
        <div className="inline-flex items-center gap-[66px] bg-[#FFFFFF] rounded-3xl p-3">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-[14px] py-[10px] gap-10 rounded-xl text-[14px] font-['Gilroy-Medium'] transition ${
                  isActive
                    ? "bg-[#039155] text-[#FFFFFF]"
                    : "text-[#1B1717] text-opacity-80 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left Column: Authentication */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col h-full">
          <div className="text-[24px] font-['Gilroy-Medium'] text-[#1B1717] mb-1">
            Authentication
          </div>
          <div className="text-[16px] text-[#000000] font-['Gilroy-Regular'] mb-[12px]">
            Select Biometric Method To Proceed
          </div>

          {/* Biometric Method Selection */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Thumb Verification */}
            <button
              type="button"
              onClick={() => setBiometricMethod("thumb")}
              className={`p-8 rounded-xl border-2 transition ${
                biometricMethod === "thumb"
                  ? "bg-[#E5FFF4] border-[#039155]"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <img
                  src={FingerPrintIcon}
                  alt="Thumb Verification"
                  className="w-[32px] h-[32px]"
                />
                <div className="text-[12px] font-['Gilroy-Medium'] text-[#1B1717]">
                  Thumb Verification
                </div>
              </div>
            </button>

            {/* Iris Scan */}
            <button
              type="button"
              onClick={() => setBiometricMethod("iris")}
              className={`p-4 rounded-xl border-2 transition ${
                biometricMethod === "iris"
                  ? "bg-[#E5FFF4] border-[#039155]"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <img src={IrisIcon} alt="Iris Scan" className="w-10 h-10" />
                <div className="text-[12px] font-['Gilroy-Medium'] text-[#1B1717]">
                  Iris Scan
                </div>
              </div>
            </button>
          </div>

          {/* Connected Device Indicator */}
          <div className="mb-6">
            <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 ${
              deviceConnected ? "bg-[#039155] text-white" : "bg-[#DC2626] text-white"
            }`}>
              {deviceMessage ? (
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-['Gilroy-Medium']">
                    {deviceMessage}
                  </span>
                  <button
                    type="button"
                    onClick={discoverAvdm}
                    disabled={isDeviceChecking}
                    className="text-[10px] font-['Gilroy-Regular'] text-white hover:opacity-100 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeviceChecking ? "Checking..." : "Check Again"}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full bg-white`} />
                  <span className="text-[12px] font-['Gilroy-Medium']">
                    {deviceConnected ? "Device Connected" : "Device Not Connected"}
                  </span>
                  <button
                    type="button"
                    onClick={discoverAvdm}
                    disabled={isDeviceChecking}
                    className="text-[10px] font-['Gilroy-Regular'] text-white hover:opacity-100 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeviceChecking ? "Checking..." : "Check Again"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Scanner Interface - Conditional based on biometric method */}
          <div className={`border border-gray-200 rounded-xl p-8 flex-1 flex flex-col justify-center transition relative ${
            comingSoon ? "bg-gray-50" : "bg-white"
          }`}>
            {/* Background content - blurred when comingSoon */}
            <div className={`flex flex-col items-center gap-4 ${
              comingSoon ? "opacity-80 pointer-events-none select-none blur-sm" : ""
            }`}>
              <div className="relative w-[170px] h-[170px] flex items-center justify-center">
                {/* Outer circle background */}
                <div className="absolute inset-0 rounded-full bg-[#E5FFF4]" />
                {/* Fill animation circle - fills clockwise from top (12 o'clock) */}
                {isScanning && biometricMethod === "thumb" && (
                  <div
                    className="absolute inset-0 rounded-full transition-all duration-75 ease-linear"
                    style={{
                      background: `conic-gradient(from -90deg, #039155 0deg, #039155 ${(scanProgress / 100) * 360}deg, transparent ${(scanProgress / 100) * 360}deg, transparent 360deg)`,
                    }}
                  />
                )}
                {/* Inner white circle */}
                <div className="absolute inset-[18px] rounded-full bg-white z-10" />
                <img
                  src={biometricMethod === "iris" ? IrisIcon : FingerPrintIcon}
                  alt={biometricMethod === "iris" ? "Iris" : "Fingerprint"}
                  className={`relative w-16 h-16 z-20 ${
                    biometricMethod === "iris" ? "" : "opacity-60"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (deviceConnected) {
                      getDeviceInfo();
                    } else {
                      discoverAvdm();
                    }
                  }}
                  disabled={isDeviceChecking || isGettingDeviceInfo}
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#039155] text-white text-[10px] font-['Gilroy-Medium'] px-3 py-1 rounded-md cursor-pointer hover:bg-[#027A47] transition disabled:opacity-50 disabled:cursor-not-allowed z-20"
                  aria-label={deviceConnected ? "Device Info" : "Ready"}
                >
                  {isDeviceChecking
                    ? "Checking..." 
                    : isGettingDeviceInfo
                    ? "Fetching..."
                    : deviceConnected
                    ? "Device Info"
                    : "Ready"}
                </button>
              </div>

              <div className="text-[16px] font-['Gilroy-SemiBold'] text-[#1B1717]">
                {biometricMethod === "iris"
                  ? "Look Into The Scanner"
                  : "Place Finger On Scanner"}
              </div>
              <div className="text-[12px] text-[#1B1717] font-['Gilroy-Regular'] text-center">
                {biometricMethod === "iris"
                  ? "Position Your Eyes Within The Scanner's View. Keep Them Wide Open And Hold Steady Until Capture"
                  : "Please Place Your Finger Flat On The Device Sensor And Hold It Steady Until The Capture Is Complete."}
              </div>

              {/* Start Capture Button - For Fingerprint method */}
              {biometricMethod === "thumb" && (
                <button
                  type="button"
                  onClick={() => {
                    if (!deviceConnected) {
                      discoverAvdm();
                      return;
                    }
                    captureAvdm();
                  }}
                  disabled={isScanning || comingSoon}
                  className="mt-4 inline-flex items-center justify-center gap-3 bg-[#039155] hover:bg-[#027A47] text-white rounded-lg px-10 py-3 text-[14px] font-['Gilroy-Medium'] transition w-full max-w-[320px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="inline-flex items-center justify-center w-6 h-6">
                    <img
                      src={StartCapture}
                      alt=""
                      className="w-full h-full"
                      aria-hidden="true"
                    />
                  </span>
                  {isScanning ? "Scanning..." : "Start Capture"}
                </button>
              )}

              {/* Start Iris Scan Button - Only for Iris method */}
              {biometricMethod === "iris" && (
                <button
                  type="button"
                  className="mt-4 inline-flex items-center justify-center gap-3 bg-[#039155] hover:bg-[#027A47] text-white rounded-lg px-10 py-3 text-[14px] font-['Gilroy-Medium'] transition w-full max-w-[320px]"
                >
                  <span className="inline-flex items-center justify-center w-6 h-6">
                    <img
                      src={EyeIcon}
                      alt=""
                      className="w-full h-full"
                      aria-hidden="true"
                    />
                  </span>
                  Start Iris Scan
                </button>
              )}
            </div>

            {/* Coming Soon overlay - clear and on top */}
            {comingSoon && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="bg-white/95 border border-gray-200 rounded-xl px-6 py-5 shadow-sm max-w-[420px] w-full">
                  <div className="text-[18px] font-['Gilroy-SemiBold'] text-[#1B1717]">
                    Iris Scan Coming Soon
                  </div>
                  <div className="mt-2 text-[14px] text-[#1B1717] font-['Gilroy-Regular']">
                    This authentication mode will be available in a future update.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Form (Cash Withdrawal / Enquiry / Statement) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-full">
          <div className="text-[20px] font-['Gilroy-Medium'] text-[#1B1717] mb-1">
            {activeTab === "cashWithdrawal"
              ? "Cash Withdrawal"
              : activeTab === "enquiry"
              ? "Enquiry"
              : "Enquiry"}
          </div>
          <div className="text-[14px] text-[#1B1717] font-['Gilroy-Regular'] mb-6">
            {activeTab === "cashWithdrawal"
              ? "Perform Cash Withdrawal Securely Using Aadhaar Authentication And Bank Selection"
              : activeTab === "enquiry"
              ? "Check Customer Bank Account Balance Securely Using Aadhaar Authentication"
              : "Check Customer Bank Account Balance Securely Using Aadhaar Authentication"}
          </div>

          {/* Recent Used Bank */}
          {recentBanks.length > 0 && (
            <div className="mb-6">
              <div className="text-[12px] font-['Gilroy-Medium'] text-[#1B1717] mb-3">
                Recent Used Bank
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {recentBanks.map((bank) => (
                  <button
                    key={bank.id}
                    type="button"
                    onClick={() => {
                      handleBankSelection(bank);
                    }}
                    className={`flex-shrink-0 w-[120px] p-3 rounded-xl border-2 transition ${
                      selectedBank?.id === bank.id
                        ? "bg-[#E5FFF4] border-[#039155]"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-full h-full bg-[#FFFFFF] flex items-center justify-center overflow-hidden">
                        {bank.bankLogo ? (
                          <img
                            src={bank.bankLogo}
                            alt={bank.bankName}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.target.style.display = "none";
                              const fallback = e.target.parentElement.querySelector(".bank-fallback");
                              if (fallback) fallback.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div 
                          className="bank-fallback w-full h-full bg-gray-100 rounded-lg flex items-center justify-center" 
                          style={{ display: bank.bankLogo ? "none" : "flex" }}
                        >
                          <span className="text-[8px] font-['Gilroy-Medium'] text-gray-600 text-center px-1">
                            {bank.bankName?.substring(0, 3).toUpperCase() || "BANK"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Select Bank Dropdown - Searchable */}
          <div className="mb-6" ref={bankDropdownRef}>
            <label className="block text-[12px] font-['Gilroy-Medium'] text-[#1B1717] mb-2">
              Select Bank *
            </label>
            <div className="relative">
              <input
                type="text"
                value={bankSearchQuery}
                onChange={(e) => {
                  setBankSearchQuery(e.target.value);
                  setShowBankDropdown(true);
                  // Clear selection if user starts typing
                  if (e.target.value !== selectedBank?.bankName) {
                    setSelectedBank(null);
                  }
                }}
                onFocus={() => setShowBankDropdown(true)}
                placeholder={selectedBank ? selectedBank.bankName : "Search bank..."}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-[14px] font-['Gilroy-Regular'] text-[#1B1717] bg-white focus:outline-none focus:ring-2 focus:ring-[#039155] focus:border-transparent"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M6 9l6 6 6-6"
                    stroke="#1B1717"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              
              {/* Bank Dropdown List */}
              {showBankDropdown && filteredBanks.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-[300px] overflow-y-auto">
                  {filteredBanks.map((bank) => (
                    <button
                      key={bank.id}
                      type="button"
                      onClick={() => {
                        handleBankSelection(bank);
                      }}
                      className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition ${
                        selectedBank?.id === bank.id ? "bg-[#E5FFF4]" : ""
                      }`}
                    >
                      <div className="w-10 h-10 bg-[#FFFFFF]  flex items-center justify-center overflow-hidden relative">
                        {bank.bankLogo ? (
                          <img
                            src={bank.bankLogo}
                            alt={bank.bankName}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.target.style.display = "none";
                              const fallback = e.target.parentElement.querySelector(".dropdown-bank-fallback");
                              if (fallback) fallback.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div 
                          className="dropdown-bank-fallback w-full h-full bg-gray-100 rounded flex items-center justify-center" 
                          style={{ display: bank.bankLogo ? "none" : "flex" }}
                        >
                          <span className="text-[10px] font-['Gilroy-Medium'] text-gray-600">
                            {bank.bankName?.substring(0, 2).toUpperCase() || "BK"}
                          </span>
                        </div>
                      </div>
                      <span className="text-[14px] font-['Gilroy-Regular'] text-[#1B1717] text-left">
                        {bank.bankName}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              
              {/* No results message */}
              {showBankDropdown && bankSearchQuery && filteredBanks.length === 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
                  <p className="text-[14px] font-['Gilroy-Regular'] text-gray-500 text-center">
                    No banks found
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Input Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-[12px] font-['Gilroy-Medium'] text-[#1B1717] mb-2">
                Aadhaar Number *
              </label>
              <input
                type="text"
                placeholder="Enter Aadhar Number"
                value={aadhaarNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 12);
                  setAadhaarNumber(value);
                  formik.setFieldValue("aadhaarNumber", value);
                }}
                onBlur={() => formik.setFieldTouched("aadhaarNumber", true)}
                className={`w-full px-4 py-3 border rounded-lg text-[14px] font-['Gilroy-Regular'] text-[#1B1717] focus:outline-none focus:ring-2 focus:ring-[#039155] focus:border-transparent ${
                  formik.touched.aadhaarNumber && formik.errors.aadhaarNumber
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              {formik.touched.aadhaarNumber && formik.errors.aadhaarNumber && (
                <p className="mt-1 text-[12px] text-red-500">{formik.errors.aadhaarNumber}</p>
              )}
            </div>
            <div>
              <label className="block text-[12px] font-['Gilroy-Medium'] text-[#1B1717] mb-2">
                Customer Mobile Number *
              </label>
              <input
                type="text"
                placeholder="Enter Your Number"
                value={mobileNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setMobileNumber(value);
                  formik.setFieldValue("mobileNumber", value);
                }}
                onBlur={() => formik.setFieldTouched("mobileNumber", true)}
                className={`w-full px-4 py-3 border rounded-lg text-[14px] font-['Gilroy-Regular'] text-[#1B1717] focus:outline-none focus:ring-2 focus:ring-[#039155] focus:border-transparent ${
                  formik.touched.mobileNumber && formik.errors.mobileNumber
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              {formik.touched.mobileNumber && formik.errors.mobileNumber && (
                <p className="mt-1 text-[12px] text-red-500">{formik.errors.mobileNumber}</p>
              )}
            </div>
          </div>

          {/* Amount To Withdrawal - Only for Cash Withdrawal */}
          {activeTab === "cashWithdrawal" && (
            <div className="mb-6">
              <label className="block text-[12px] font-['Gilroy-Medium'] text-[#1B1717] mb-2">
                Amount To Withdrawal
              </label>
              <div className="relative mb-3">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] font-['Gilroy-Medium'] text-[#1B1717] pointer-events-none">
                  ₹
                </span>
                <input
                  type="text"
                  value={selectedAmount ? selectedAmount.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                  onChange={(e) => {
                    // Extract only numbers from the input
                    const numericValue = e.target.value.replace(/[^\d]/g, '');
                    setSelectedAmount(numericValue);
                  }}
                  placeholder="Enter amount"
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg text-[14px] font-['Gilroy-Medium'] text-[#1B1717] bg-white focus:outline-none focus:ring-2 focus:ring-[#039155] focus:border-transparent"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedAmount("500")}
                  className={`px-6 py-2 rounded-lg border-2 text-[12px] font-['Gilroy-Medium'] transition ${
                    selectedAmount === "500"
                      ? "bg-[#039155] text-white border-[#039155]"
                      : "bg-white text-[#1B1717] border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  ₹ 500
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAmount("1000")}
                  className={`px-6 py-2 rounded-lg border-2 text-[12px] font-['Gilroy-Medium'] transition ${
                    selectedAmount === "1000"
                      ? "bg-[#039155] text-white border-[#039155]"
                      : "bg-white text-[#1B1717] border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  ₹ 1,000
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAmount("2000")}
                  className={`px-6 py-2 rounded-lg border-2 text-[12px] font-['Gilroy-Medium'] transition ${
                    selectedAmount === "2000"
                      ? "bg-[#039155] text-white border-[#039155]"
                      : "bg-white text-[#1B1717] border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  ₹ 2,000
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAmount("5000")}
                  className={`px-6 py-2 rounded-lg border-2 text-[12px] font-['Gilroy-Medium'] transition ${
                    selectedAmount === "5000"
                      ? "bg-[#039155] text-white border-[#039155]"
                      : "bg-white text-[#1B1717] border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  ₹ 5,000
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAmount("10000")}
                  className={`px-6 py-2 rounded-lg border-2 text-[12px] font-['Gilroy-Medium'] transition ${
                    selectedAmount === "10000"
                      ? "bg-[#039155] text-white border-[#039155]"
                      : "bg-white text-[#1B1717] border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  ₹ 10,000
                </button>
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            type="button"
            onClick={() => {
              if (activeTab === "cashWithdrawal") {
                // Validate all fields before submitting
                formik.setFieldTouched("selectedBank", true);
                formik.setFieldTouched("selectedAmount", true);
                formik.setFieldTouched("aadhaarNumber", true);
                formik.setFieldTouched("mobileNumber", true);
                formik.setFieldTouched("pidData", true);
                formik.handleSubmit();
              } else if (activeTab === "enquiry") {
                // Handle enquiry
                console.log("Check Balance clicked");
              } else {
                // Handle statement
                console.log("Check Statement clicked");
              }
            }}
            disabled={formik.isSubmitting}
            className="w-full bg-[#039155] hover:bg-[#027A47] text-white rounded-lg px-6 py-3 text-[14px] font-['Gilroy-Medium'] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {formik.isSubmitting
              ? "Processing..."
              : activeTab === "cashWithdrawal"
              ? "Withdrawal"
              : activeTab === "enquiry"
              ? "Check Balance"
              : "Check Statement"}
          </button>
          {/* Show fingerprint validation error if not captured */}
          {formik.touched.pidData && formik.errors.pidData && (
            <p className="mt-2 text-[12px] text-red-500 text-center">{formik.errors.pidData}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Selectservice;
