import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import StartCapture from "../../../../public/img/StartCapture.svg";
import {
  aepsBankList,
  aepsWithdrawl,
  aepsResentBankList,
} from "../../../redux/action/aepsAction";
import { getUserProfile } from "../../../redux/action/userProfileAction";
import { getLocationAndIP } from "../../../util/getLocationAndIP";

const FingerPrintIcon = "/img/FingerPrint.svg";
const IrisIcon = "/img/Iris.svg";
const EyeIcon = "/img/Eye.svg";

const Selectservice = () => {
  const dispatch = useDispatch();
  const bankList = useSelector((state) => state.aeps?.bankList);
  const resentBankListState = useSelector(
    (state) => state.aeps?.resentBankList,
  );

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

  // Modal state
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info", // success, error, warning, info
    transactionData: null, // For success modal with transaction details
  });

  // Ref to track if API has been called for current pidData
  const pidDataProcessedRef = useRef(false);
  const lastPidDataRef = useRef("");

  const comingSoon = biometricMethod === "iris";

  const tabs = [
    { key: "cashWithdrawal", label: "Cash Withdrawal" },
    { key: "enquiry", label: "Enquiry" },
    { key: "statement", label: "Statement" },
  ];

  // Validation schema (pidData validation removed as it will be captured on withdrawal)
  const validationSchema = Yup.object({
    selectedBank: Yup.object().nullable().required("Please select a bank"),
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
  });

  // Formik setup
  const formik = useFormik({
    initialValues: {
      selectedBank: null,
      selectedAmount: "1000",
      aadhaarNumber: "",
      mobileNumber: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      // Validation is handled in button onClick, this won't be called directly
      await handleWithdrawal(values);
    },
  });

  // Get banks from API response
  // bankList structure: { bankList: [...], status: "SUCCESS", message: "..." }
  const banks = bankList?.bankList || [];

  // Banks returned from recent banks API (aepsResentBankList)
  const resentBanksFromApi =
    resentBankListState?.resentBankList || resentBankListState?.data || [];

  // Filter banks based on search query (show all if search is empty)
  const filteredBanks = bankSearchQuery
    ? banks.filter((bank) =>
        bank?.bankName?.toLowerCase().includes(bankSearchQuery.toLowerCase()),
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
      // Remove the bank if it already exists in the list (use bankIIN as unique key)
      const filtered = prev.filter((b) => b.bankIIN !== bank.bankIIN);
      // Add selected bank to the front, limit to 4 banks total
      return [bank, ...filtered].slice(0, 4);
    });
  };

  // Get recent banks - selected bank first, then other recent banks
  const recentBanks = (() => {
    if (selectedBank) {
      // If a bank is selected, show it first
      const otherRecent = recentBanksList.filter(
        (b) => b.bankIIN !== selectedBank.bankIIN,
      );
      const result = [selectedBank, ...otherRecent].slice(0, 4);
      return result;
    } else if (recentBanksList.length > 0) {
      // If no bank is selected but we have recent banks, show them
      return recentBanksList.slice(0, 4);
    }
    // If no recent banks available, return empty array (don't show section)
    return [];
  })();

  // Seed recent banks list from API response when available
  useEffect(() => {
    if (Array.isArray(resentBanksFromApi) && resentBanksFromApi.length > 0) {
      setRecentBanksList(resentBanksFromApi);
    }
  }, [resentBanksFromApi]);

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
      DETECT DEVICE TYPE
  ---------------------------------*/
  const detectDeviceType = (deviceInfoXml) => {
    if (!deviceInfoXml) {
      return "unknown"; // Default to unknown if no device info
    }

    try {
      const xmlDoc = new DOMParser().parseFromString(deviceInfoXml, "text/xml");
      const deviceInfo = xmlDoc.getElementsByTagName("DeviceInfo")[0];

      if (!deviceInfo) {
        return "unknown";
      }

      // Check device name/model info (mi attribute)
      const deviceName = (deviceInfo.getAttribute("mi") || "").toLowerCase();
      // Check manufacturer code (mc attribute) if available
      const manufacturerCode = (
        deviceInfo.getAttribute("mc") || ""
      ).toLowerCase();
      // Check device provider ID (dpId attribute) if available
      const dpId = (deviceInfo.getAttribute("dpId") || "").toLowerCase();

      // Check for Mantra devices
      if (
        deviceName.includes("mantra") ||
        manufacturerCode.includes("mantra") ||
        dpId.includes("mantra")
      ) {
        return "mantra";
      }

      // Check for Startek devices
      if (
        deviceName.includes("startek") ||
        deviceName.includes("fm220") ||
        manufacturerCode.includes("startek") ||
        dpId.includes("startek")
      ) {
        return "startek";
      }

      return "unknown";
    } catch (err) {
      console.error("Error detecting device type:", err);
      return "unknown";
    }
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
    setDeviceMessage(
      "Capturing fingerprint... Place your thumb on the scanner",
    );

    // Start smooth progress animation that fills to 100% during capture
    const totalDuration = 10000; // 10 seconds (matches timeout)
    const updateInterval = 100; // Update every 100ms
    const incrementPerUpdate = 100 / (totalDuration / updateInterval); // ~1% per update

    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += incrementPerUpdate;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(progressInterval);
      }
      setScanProgress(currentProgress);
    }, updateInterval);

    // Extract DeviceInfo element from deviceInfoXml (DString should be the DeviceInfo element)
    let DString = "";
    if (deviceInfoXml) {
      try {
        const xmlDoc = new DOMParser().parseFromString(
          deviceInfoXml,
          "text/xml",
        );
        const deviceInfo = xmlDoc.getElementsByTagName("DeviceInfo")[0];
        if (deviceInfo) {
          // Get the DeviceInfo element as string
          if (typeof XMLSerializer !== "undefined") {
            DString = new XMLSerializer().serializeToString(deviceInfo);
          } else {
            // Fallback: extract DeviceInfo using regex
            const deviceInfoMatch = deviceInfoXml.match(
              /<DeviceInfo[^>]*>[\s\S]*?<\/DeviceInfo>/,
            );
            if (deviceInfoMatch) {
              DString = deviceInfoMatch[0];
            }
          }
        }
      } catch (err) {
        console.error("Error extracting DeviceInfo:", err);
        // Fallback: try to extract DeviceInfo using regex
        try {
          const deviceInfoMatch = deviceInfoXml.match(
            /<DeviceInfo[^>]*>[\s\S]*?<\/DeviceInfo>/,
          );
          if (deviceInfoMatch) {
            DString = deviceInfoMatch[0];
          }
        } catch (regexErr) {
          console.error("Error extracting DeviceInfo with regex:", regexErr);
        }
      }
    }

    // Detect device type
    const deviceType = detectDeviceType(deviceInfoXml);

    // Build CustOpts based on device type
    let custOpts = "";
    if (deviceType === "mantra") {
      // Mantra devices require mantrakey parameter
      custOpts = '<CustOpts><Param name="mantrakey" value="" /></CustOpts>';
    } else if (deviceType === "startek") {
      // Startek devices typically don't need CustOpts
      custOpts = ""; // Startek devices usually don't need CustOpts
    } else {
      // For unknown devices, default to Mantra format (backward compatibility)
      custOpts = '<CustOpts><Param name="mantrakey" value="" /></CustOpts>';
    }

    // Ensure DString is available
    if (!DString) {
      setDeviceMessage("Device info not available. Please check device first.");
      setIsScanning(false);
      clearInterval(progressInterval);
      return;
    }

    // Build proper XML structure without backslashes
    const pidOptions =
      '<?xml version="1.0"?><PidOptions ver="1.0"><Opts fCount="1" fType="2" iCount="0" pCount="0" format="0" pidVer="2.0" timeout="15000" posh="UNKNOWN" env="P" />' +
      DString +
      custOpts +
      "</PidOptions>";

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

        setPidData(captureText);
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
        sort: { id: 1 },
      },
    };

    dispatch(aepsBankList(payload))
      .then((response) => {
        console.log("Bank list response:", response);
      })
      .catch((error) => {
        console.error("Bank list error:", error);
      });
  }, [dispatch]);

  // Fetch recent banks on component mount
  useEffect(() => {
    dispatch(aepsResentBankList({}))
      .then((response) => {
        console.log("Recent bank list response:", response);
      })
      .catch((error) => {
        console.error("Recent bank list error:", error);
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
        "Device Not Connected",
      ];

      // Check if this is a persistent message
      const isPersistent = persistentMessages.some((msg) =>
        deviceMessage.includes(msg),
      );

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
      if (
        bankDropdownRef.current &&
        !bankDropdownRef.current.contains(event.target)
      ) {
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
  }, [selectedBank]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    formik.setFieldValue("selectedAmount", selectedAmount);
  }, [selectedAmount]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    formik.setFieldValue("aadhaarNumber", aadhaarNumber);
  }, [aadhaarNumber]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    formik.setFieldValue("mobileNumber", mobileNumber);
  }, [mobileNumber]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle withdrawal - validates, captures fingerprint, gets location/IP, then calls API
  const handleWithdrawal = async (values) => {
    console.log("🚀 handleWithdrawal called with values:", values);
    const {
      selectedBank: bank,
      selectedAmount: amount,
      aadhaarNumber: aadhar,
      mobileNumber: mobile,
    } = values;

    // Validate required fields
    if (!bank || !bank.bankIIN) {
      console.error("❌ Bank or bankIIN is missing");
      setModal({
        isOpen: true,
        title: "Validation Error",
        message: "Please select a bank",
        type: "error",
      });
      return;
    }

    if (!amount || parseFloat(amount.replaceAll(",", "")) <= 0) {
      console.error("❌ Invalid amount");
      setModal({
        isOpen: true,
        title: "Validation Error",
        message: "Please enter a valid amount",
        type: "error",
      });
      return;
    }

    if (!aadhar || aadhar.length !== 12) {
      console.error("❌ Invalid Aadhaar number");
      setModal({
        isOpen: true,
        title: "Validation Error",
        message: "Please enter a valid 12-digit Aadhaar number",
        type: "error",
      });
      return;
    }

    if (!mobile || mobile.length !== 10) {
      console.error("❌ Invalid mobile number");
      setModal({
        isOpen: true,
        title: "Validation Error",
        message: "Please enter a valid 10-digit mobile number",
        type: "error",
      });
      return;
    }

    // Check if device is connected
    if (!deviceConnected) {
      setModal({
        isOpen: true,
        title: "Device Not Connected",
        message: "Device not connected. Please check device first.",
        type: "error",
      });
      return;
    }

    if (!rdBaseUrl) {
      setModal({
        isOpen: true,
        title: "Device Not Ready",
        message: "Device not ready. Please check device first.",
        type: "error",
      });
      return;
    }

    // Start fingerprint capture
    try {
      setDeviceMessage("Capturing fingerprint for withdrawal...");
      setIsScanning(true);
      setScanProgress(0);

      // Start progress animation
      const totalDuration = 10000; // 10 seconds
      const updateInterval = 100; // Update every 100ms
      const incrementPerUpdate = 100 / (totalDuration / updateInterval);
      let currentProgress = 0;
      const progressInterval = setInterval(() => {
        currentProgress += incrementPerUpdate;
        if (currentProgress >= 100) {
          currentProgress = 100;
          clearInterval(progressInterval);
        }
        setScanProgress(currentProgress);
      }, updateInterval);

      // Extract DeviceInfo element from deviceInfoXml (DString should be the DeviceInfo element)
      let DString = "";
      if (deviceInfoXml) {
        try {
          const xmlDoc = new DOMParser().parseFromString(
            deviceInfoXml,
            "text/xml",
          );
          const deviceInfo = xmlDoc.getElementsByTagName("DeviceInfo")[0];
          if (deviceInfo) {
            // Get the DeviceInfo element as string
            if (typeof XMLSerializer !== "undefined") {
              DString = new XMLSerializer().serializeToString(deviceInfo);
            } else {
              // Fallback: extract DeviceInfo using regex
              const deviceInfoMatch = deviceInfoXml.match(
                /<DeviceInfo[^>]*>[\s\S]*?<\/DeviceInfo>/,
              );
              if (deviceInfoMatch) {
                DString = deviceInfoMatch[0];
              }
            }
          }
        } catch (err) {
          console.error("Error extracting DeviceInfo:", err);
          // Fallback: try to extract DeviceInfo using regex
          try {
            const deviceInfoMatch = deviceInfoXml.match(
              /<DeviceInfo[^>]*>[\s\S]*?<\/DeviceInfo>/,
            );
            if (deviceInfoMatch) {
              DString = deviceInfoMatch[0];
            }
          } catch (regexErr) {
            console.error("Error extracting DeviceInfo with regex:", regexErr);
          }
        }
      }

      // Detect device type
      const deviceType = detectDeviceType(deviceInfoXml);

      // Build CustOpts based on device type
      let custOpts = "";
      if (deviceType === "mantra") {
        // Mantra devices require mantrakey parameter
        custOpts = '<CustOpts><Param name="mantrakey" value="" /></CustOpts>';
      } else if (deviceType === "startek") {
        // Startek devices typically don't need CustOpts
        custOpts = ""; // Startek devices usually don't need CustOpts
      } else {
        // For unknown devices, default to Mantra format (backward compatibility)
        custOpts = '<CustOpts><Param name="mantrakey" value="" /></CustOpts>';
      }

      // Ensure DString is available
      if (!DString) {
        setDeviceMessage(
          "Device info not available. Please check device first.",
        );
        setIsScanning(false);
        clearInterval(progressInterval);
        setModal({
          isOpen: true,
          title: "Device Error",
          message: "Device info not available. Please check device first.",
          type: "error",
        });
        return;
      }

      // Build proper XML structure without backslashes
      const pidOptions =
        '<?xml version="1.0"?><PidOptions ver="1.0"><Opts fCount="1" fType="2" iCount="0" pCount="0" format="0" pidVer="2.0" timeout="15000" posh="UNKNOWN" env="P" />' +
        DString +
        custOpts +
        "</PidOptions>";

      const captureResp = await fetch(`${rdBaseUrl}/rd/capture`, {
        method: "CAPTURE",
        headers: { "Content-Type": "text/xml; charset=utf-8" },
        body: pidOptions,
      });

      const captureText = await captureResp.text();
      clearInterval(progressInterval);

      const xmlDoc = new DOMParser().parseFromString(captureText, "text/xml");
      const respNode = xmlDoc.getElementsByTagName("Resp")[0];
      const errCode = respNode?.getAttribute("errCode");

      if (errCode === "0") {
        // Successful capture
        setScanProgress(100);
        setDeviceMessage("Fingerprint captured successfully");
        const capturedPidData = captureText;
        setIsScanning(false);

        // Get location and IP using getLocationAndIP utility
        setDeviceMessage("Getting location and IP address...");
        let locationAndIP;
        try {
          locationAndIP = await getLocationAndIP();
          console.log("📍 Location and IP retrieved:", locationAndIP);
        } catch (locationError) {
          console.warn(
            "⚠️ Failed to get location/IP, using empty values:",
            locationError,
          );
          locationAndIP = {
            location: { latitude: "", longitude: "" },
            ipAddress: "",
          };
        }
        const latitude = locationAndIP?.location?.latitude || "";
        const longitude = locationAndIP?.location?.longitude || "";
        const ipAddress = locationAndIP?.ipAddress || "";

        // Prepare payload - pidData should already be the full XML response
        let biometricDataXml = capturedPidData;
        if (!capturedPidData.includes("<PidData>")) {
          biometricDataXml = `<?xml version="1.0"?><PidData>${capturedPidData}</PidData>`;
        } else if (!capturedPidData.includes("<?xml version")) {
          biometricDataXml = `<?xml version="1.0"?>${capturedPidData}`;
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
          consumerNumber: mobile,
        };

        console.log("📤 Sending withdrawal request with payload:", {
          ...payload,
          biometricData:
            payload.biometricData?.substring(0, 100) + "... (truncated)",
        });

        // Call withdrawal API
        setDeviceMessage("Processing withdrawal...");
        try {
          const response = await dispatch(aepsWithdrawl(payload));
          console.log("📥 Withdrawal API response:", response);

          if (response?.status === "SUCCESS") {
            console.log("✅ Withdrawal successful!");
            console.log(
              "📊 Transaction data:",
              response?.data || response?.withdrawal,
            );

            // Show success modal with transaction details
            // The action returns { withdrawal, status, message } where withdrawal is the data object
            setModal({
              isOpen: true,
              title: "Transaction Successful",
              message: response?.message || "Withdrawal successful!",
              type: "success",
              transactionData: response?.withdrawal || response?.data || null,
            });

            // Reset form
            formik.resetForm();
            setSelectedBank(null);
            setSelectedAmount("1000");
            setAadhaarNumber("");
            setMobileNumber("");
            setPidData("");
            setBankSearchQuery("");
            setScanProgress(0);
            setDeviceMessage("Withdrawal completed successfully");
          } else {
            console.log("❌ Withdrawal failed:", response?.message);
            console.log(
              "📊 Failure data:",
              response?.data || response?.withdrawal,
            );

            // Show failure modal with error details
            setModal({
              isOpen: true,
              title: "Transaction Failed",
              message: response?.message || "Withdrawal failed",
              type: "error",
              transactionData: response?.data || response?.withdrawal || null,
            });
            setDeviceMessage("Withdrawal failed");
          }
        } catch (apiError) {
          console.error(
            "❌ Withdrawal API error caught in component:",
            apiError,
          );
          console.error("❌ Error details:", {
            message: apiError?.message,
            response: apiError?.response,
            responseData: apiError?.response?.data,
            status: apiError?.response?.status,
            statusText: apiError?.response?.statusText,
          });

          // Check if error response was returned from action
          if (apiError?.status === "FAILURE" || apiError?.message) {
            // Show modal with error details
            setModal({
              isOpen: true,
              title: "Transaction Failed",
              message: apiError?.message || "Withdrawal failed",
              type: "error",
              transactionData: apiError?.withdrawal || apiError?.data || null,
            });
          } else {
            // Network or other errors
            const errorResponseData = apiError?.response?.data;
            setModal({
              isOpen: true,
              title: "API Error",
              message:
                errorResponseData?.message ||
                apiError?.message ||
                "Failed to process withdrawal. Please check the console for details.",
              type: "error",
              transactionData: errorResponseData?.data || null,
            });
          }
          setDeviceMessage("API call failed");
        }
      } else {
        // Capture failed
        setScanProgress(0);
        const errInfo = respNode?.getAttribute("errInfo") || "";
        setDeviceMessage(`Capture failed: ${errInfo}`);
        setIsScanning(false);
        setModal({
          isOpen: true,
          title: "Capture Failed",
          message: `Fingerprint capture failed: ${errInfo}`,
          type: "error",
        });
        return;
      }
    } catch (err) {
      console.error("❌ Error in handleWithdrawal:", err);
      setScanProgress(0);
      setDeviceMessage("Capture failed. Please try again.");
      setIsScanning(false);
      setModal({
        isOpen: true,
        title: "Capture Error",
        message: "Failed to capture fingerprint. Please try again.",
        type: "error",
      });
      return;
    }
  };

  // Handle Enquiry (Check Balance) - txnType: "CB"
  const handleEnquiry = async (values) => {
    const {
      selectedBank: bank,
      aadhaarNumber: aadhar,
      mobileNumber: mobile,
    } = values;

    // Validate required fields
    if (!bank || !bank.bankIIN) {
      setModal({
        isOpen: true,
        title: "Validation Error",
        message: "Please select a bank",
        type: "error",
      });
      return;
    }

    if (!aadhar || aadhar.length !== 12) {
      setModal({
        isOpen: true,
        title: "Validation Error",
        message: "Please enter a valid 12-digit Aadhaar number",
        type: "error",
      });
      return;
    }

    if (!mobile || mobile.length !== 10) {
      setModal({
        isOpen: true,
        title: "Validation Error",
        message: "Please enter a valid 10-digit mobile number",
        type: "error",
      });
      return;
    }

    // Check if device is connected
    if (!deviceConnected) {
      setModal({
        isOpen: true,
        title: "Device Not Connected",
        message: "Device not connected. Please check device first.",
        type: "error",
      });
      return;
    }

    if (!rdBaseUrl) {
      setModal({
        isOpen: true,
        title: "Device Not Ready",
        message: "Device not ready. Please check device first.",
        type: "error",
      });
      return;
    }

    // Start fingerprint capture
    try {
      setDeviceMessage("Capturing fingerprint for balance enquiry...");
      setIsScanning(true);
      setScanProgress(0);

      const totalDuration = 10000;
      const updateInterval = 100;
      const incrementPerUpdate = 100 / (totalDuration / updateInterval);
      let currentProgress = 0;
      const progressInterval = setInterval(() => {
        currentProgress += incrementPerUpdate;
        if (currentProgress >= 100) {
          currentProgress = 100;
          clearInterval(progressInterval);
        }
        setScanProgress(currentProgress);
      }, updateInterval);

      // Extract DeviceInfo element from deviceInfoXml (DString should be the DeviceInfo element)
      let DString = "";
      if (deviceInfoXml) {
        try {
          const xmlDoc = new DOMParser().parseFromString(
            deviceInfoXml,
            "text/xml",
          );
          const deviceInfo = xmlDoc.getElementsByTagName("DeviceInfo")[0];
          if (deviceInfo) {
            // Get the DeviceInfo element as string
            if (typeof XMLSerializer !== "undefined") {
              DString = new XMLSerializer().serializeToString(deviceInfo);
            } else {
              // Fallback: extract DeviceInfo using regex
              const deviceInfoMatch = deviceInfoXml.match(
                /<DeviceInfo[^>]*>[\s\S]*?<\/DeviceInfo>/,
              );
              if (deviceInfoMatch) {
                DString = deviceInfoMatch[0];
              }
            }
          }
        } catch (err) {
          console.error("Error extracting DeviceInfo:", err);
          // Fallback: try to extract DeviceInfo using regex
          try {
            const deviceInfoMatch = deviceInfoXml.match(
              /<DeviceInfo[^>]*>[\s\S]*?<\/DeviceInfo>/,
            );
            if (deviceInfoMatch) {
              DString = deviceInfoMatch[0];
            }
          } catch (regexErr) {
            console.error("Error extracting DeviceInfo with regex:", regexErr);
          }
        }
      }

      // Detect device type
      const deviceType = detectDeviceType(deviceInfoXml);

      // Build CustOpts based on device type
      let custOpts = "";
      if (deviceType === "mantra") {
        // Mantra devices require mantrakey parameter
        custOpts = '<CustOpts><Param name="mantrakey" value="" /></CustOpts>';
      } else if (deviceType === "startek") {
        // Startek devices typically don't need CustOpts
        custOpts = ""; // Startek devices usually don't need CustOpts
      } else {
        // For unknown devices, default to Mantra format (backward compatibility)
        custOpts = '<CustOpts><Param name="mantrakey" value="" /></CustOpts>';
      }

      // Ensure DString is available
      if (!DString) {
        setDeviceMessage(
          "Device info not available. Please check device first.",
        );
        setIsScanning(false);
        clearInterval(progressInterval);
        setModal({
          isOpen: true,
          title: "Device Error",
          message: "Device info not available. Please check device first.",
          type: "error",
        });
        return;
      }

      // Build proper XML structure without backslashes
      const pidOptions =
        '<?xml version="1.0"?><PidOptions ver="1.0"><Opts fCount="1" fType="2" iCount="0" pCount="0" format="0" pidVer="2.0" timeout="15000" posh="UNKNOWN" env="P" />' +
        DString +
        custOpts +
        "</PidOptions>";

      const captureResp = await fetch(`${rdBaseUrl}/rd/capture`, {
        method: "CAPTURE",
        headers: { "Content-Type": "text/xml; charset=utf-8" },
        body: pidOptions,
      });

      const captureText = await captureResp.text();
      clearInterval(progressInterval);

      const xmlDoc = new DOMParser().parseFromString(captureText, "text/xml");
      const respNode = xmlDoc.getElementsByTagName("Resp")[0];
      const errCode = respNode?.getAttribute("errCode");

      if (errCode === "0") {
        setScanProgress(100);
        setDeviceMessage("Fingerprint captured successfully");
        const capturedPidData = captureText;
        setIsScanning(false);

        // Get location and IP
        setDeviceMessage("Getting location and IP address...");
        let locationAndIP;
        try {
          locationAndIP = await getLocationAndIP();
        } catch (locationError) {
          locationAndIP = {
            location: { latitude: "", longitude: "" },
            ipAddress: "",
          };
        }
        const latitude = locationAndIP?.location?.latitude || "";
        const longitude = locationAndIP?.location?.longitude || "";
        const ipAddress = locationAndIP?.ipAddress || "";

        // Prepare payload
        let biometricDataXml = capturedPidData;
        if (!capturedPidData.includes("<PidData>")) {
          biometricDataXml = `<?xml version="1.0"?><PidData>${capturedPidData}</PidData>`;
        } else if (!capturedPidData.includes("<?xml version")) {
          biometricDataXml = `<?xml version="1.0"?>${capturedPidData}`;
        }

        const payload = {
          biometricData: biometricDataXml,
          captureType: "FINGER",
          txnType: "BE", // Check Balance
          bankiin: bank.bankIIN,
          latitude: latitude,
          longitude: longitude,
          ipAddress: ipAddress,
          aadharNumber: aadhar,
          consumerNumber: mobile,
        };

        // Call API
        setDeviceMessage("Processing balance enquiry...");
        try {
          const response = await dispatch(aepsWithdrawl(payload));

          if (response?.status === "SUCCESS") {
            console.log("✅ Balance enquiry successful!");
            console.log(
              "📊 Transaction data:",
              response?.data || response?.withdrawal,
            );
            setModal({
              isOpen: true,
              title: "Balance Enquiry Successful",
              message: response?.message || "Balance enquiry successful!",
              type: "success",
              transactionData: response?.withdrawal || response?.data || null,
            });
            setDeviceMessage("Balance enquiry completed successfully");
          } else {
            console.log("❌ Balance enquiry failed:", response?.message);
            console.log(
              "📊 Failure data:",
              response?.data || response?.withdrawal,
            );

            // Show failure modal with error details
            setModal({
              isOpen: true,
              title: "Balance Enquiry Failed",
              message: response?.message || "Balance enquiry failed",
              type: "error",
              transactionData: response?.data || response?.withdrawal || null,
            });
            setDeviceMessage("Balance enquiry failed");
          }
        } catch (apiError) {
          console.error(
            "❌ Balance enquiry API error caught in component:",
            apiError,
          );
          console.error("❌ Error details:", {
            message: apiError?.message,
            response: apiError?.response,
            responseData: apiError?.response?.data,
            status: apiError?.response?.status,
            statusText: apiError?.response?.statusText,
          });

          // Check if error response was returned from action
          if (apiError?.status === "FAILURE" || apiError?.message) {
            // Show modal with error details
            setModal({
              isOpen: true,
              title: "Balance Enquiry Failed",
              message: apiError?.message || "Balance enquiry failed",
              type: "error",
              transactionData: apiError?.withdrawal || apiError?.data || null,
            });
          } else {
            // Network or other errors
            const errorResponseData = apiError?.response?.data;
            setModal({
              isOpen: true,
              title: "API Error",
              message:
                errorResponseData?.message ||
                apiError?.message ||
                "Failed to process balance enquiry. Please check the console for details.",
              type: "error",
              transactionData: errorResponseData?.data || null,
            });
          }
          setDeviceMessage("API call failed");
        }
      } else {
        setScanProgress(0);
        const errInfo = respNode?.getAttribute("errInfo") || "";
        setDeviceMessage(`Capture failed: ${errInfo}`);
        setIsScanning(false);
        setModal({
          isOpen: true,
          title: "Capture Failed",
          message: `Fingerprint capture failed: ${errInfo}`,
          type: "error",
        });
        return;
      }
    } catch (err) {
      setScanProgress(0);
      setDeviceMessage("Capture failed. Please try again.");
      setIsScanning(false);
      setModal({
        isOpen: true,
        title: "Capture Error",
        message: "Failed to capture fingerprint. Please try again.",
        type: "error",
      });
      return;
    }
  };

  // Handle Statement (Check Statement) - txnType: "CS"
  const handleStatement = async (values) => {
    const {
      selectedBank: bank,
      aadhaarNumber: aadhar,
      mobileNumber: mobile,
    } = values;

    // Validate required fields
    if (!bank || !bank.bankIIN) {
      setModal({
        isOpen: true,
        title: "Validation Error",
        message: "Please select a bank",
        type: "error",
      });
      return;
    }

    if (!aadhar || aadhar.length !== 12) {
      setModal({
        isOpen: true,
        title: "Validation Error",
        message: "Please enter a valid 12-digit Aadhaar number",
        type: "error",
      });
      return;
    }

    if (!mobile || mobile.length !== 10) {
      setModal({
        isOpen: true,
        title: "Validation Error",
        message: "Please enter a valid 10-digit mobile number",
        type: "error",
      });
      return;
    }

    // Check if device is connected
    if (!deviceConnected) {
      setModal({
        isOpen: true,
        title: "Device Not Connected",
        message: "Device not connected. Please check device first.",
        type: "error",
      });
      return;
    }

    if (!rdBaseUrl) {
      setModal({
        isOpen: true,
        title: "Device Not Ready",
        message: "Device not ready. Please check device first.",
        type: "error",
      });
      return;
    }

    // Start fingerprint capture
    try {
      setDeviceMessage("Capturing fingerprint for statement enquiry...");
      setIsScanning(true);
      setScanProgress(0);

      const totalDuration = 10000;
      const updateInterval = 100;
      const incrementPerUpdate = 100 / (totalDuration / updateInterval);
      let currentProgress = 0;
      const progressInterval = setInterval(() => {
        currentProgress += incrementPerUpdate;
        if (currentProgress >= 100) {
          currentProgress = 100;
          clearInterval(progressInterval);
        }
        setScanProgress(currentProgress);
      }, updateInterval);

      // Extract DeviceInfo element from deviceInfoXml (DString should be the DeviceInfo element)
      let DString = "";
      if (deviceInfoXml) {
        try {
          const xmlDoc = new DOMParser().parseFromString(
            deviceInfoXml,
            "text/xml",
          );
          const deviceInfo = xmlDoc.getElementsByTagName("DeviceInfo")[0];
          if (deviceInfo) {
            // Get the DeviceInfo element as string
            if (typeof XMLSerializer !== "undefined") {
              DString = new XMLSerializer().serializeToString(deviceInfo);
            } else {
              // Fallback: extract DeviceInfo using regex
              const deviceInfoMatch = deviceInfoXml.match(
                /<DeviceInfo[^>]*>[\s\S]*?<\/DeviceInfo>/,
              );
              if (deviceInfoMatch) {
                DString = deviceInfoMatch[0];
              }
            }
          }
        } catch (err) {
          console.error("Error extracting DeviceInfo:", err);
          // Fallback: try to extract DeviceInfo using regex
          try {
            const deviceInfoMatch = deviceInfoXml.match(
              /<DeviceInfo[^>]*>[\s\S]*?<\/DeviceInfo>/,
            );
            if (deviceInfoMatch) {
              DString = deviceInfoMatch[0];
            }
          } catch (regexErr) {
            console.error("Error extracting DeviceInfo with regex:", regexErr);
          }
        }
      }

      // Detect device type
      const deviceType = detectDeviceType(deviceInfoXml);

      // Build CustOpts based on device type
      let custOpts = "";
      if (deviceType === "mantra") {
        // Mantra devices require mantrakey parameter
        custOpts = '<CustOpts><Param name="mantrakey" value="" /></CustOpts>';
      } else if (deviceType === "startek") {
        // Startek devices typically don't need CustOpts
        custOpts = ""; // Startek devices usually don't need CustOpts
      } else {
        // For unknown devices, default to Mantra format (backward compatibility)
        custOpts = '<CustOpts><Param name="mantrakey" value="" /></CustOpts>';
      }

      // Ensure DString is available
      if (!DString) {
        setDeviceMessage(
          "Device info not available. Please check device first.",
        );
        setIsScanning(false);
        clearInterval(progressInterval);
        setModal({
          isOpen: true,
          title: "Device Error",
          message: "Device info not available. Please check device first.",
          type: "error",
        });
        return;
      }

      // Build proper XML structure without backslashes
      const pidOptions =
        '<?xml version="1.0"?><PidOptions ver="1.0"><Opts fCount="1" fType="2" iCount="0" pCount="0" format="0" pidVer="2.0" timeout="15000" posh="UNKNOWN" env="P" />' +
        DString +
        custOpts +
        "</PidOptions>";

      const captureResp = await fetch(`${rdBaseUrl}/rd/capture`, {
        method: "CAPTURE",
        headers: { "Content-Type": "text/xml; charset=utf-8" },
        body: pidOptions,
      });

      const captureText = await captureResp.text();
      clearInterval(progressInterval);

      const xmlDoc = new DOMParser().parseFromString(captureText, "text/xml");
      const respNode = xmlDoc.getElementsByTagName("Resp")[0];
      const errCode = respNode?.getAttribute("errCode");

      if (errCode === "0") {
        setScanProgress(100);
        setDeviceMessage("Fingerprint captured successfully");
        const capturedPidData = captureText;
        setIsScanning(false);

        // Get location and IP
        setDeviceMessage("Getting location and IP address...");
        let locationAndIP;
        try {
          locationAndIP = await getLocationAndIP();
        } catch (locationError) {
          locationAndIP = {
            location: { latitude: "", longitude: "" },
            ipAddress: "",
          };
        }
        const latitude = locationAndIP?.location?.latitude || "";
        const longitude = locationAndIP?.location?.longitude || "";
        const ipAddress = locationAndIP?.ipAddress || "";

        // Prepare payload
        let biometricDataXml = capturedPidData;
        if (!capturedPidData.includes("<PidData>")) {
          biometricDataXml = `<?xml version="1.0"?><PidData>${capturedPidData}</PidData>`;
        } else if (!capturedPidData.includes("<?xml version")) {
          biometricDataXml = `<?xml version="1.0"?>${capturedPidData}`;
        }

        const payload = {
          biometricData: biometricDataXml,
          captureType: "FINGER",
          txnType: "MS", // Check Statement
          bankiin: bank.bankIIN,
          latitude: latitude,
          longitude: longitude,
          ipAddress: ipAddress,
          aadharNumber: aadhar,
          consumerNumber: mobile,
        };

        // Call API
        setDeviceMessage("Processing statement enquiry...");
        try {
          const response = await dispatch(aepsWithdrawl(payload));

          if (response?.status === "SUCCESS") {
            console.log("✅ Statement enquiry successful!");
            console.log("📊 Full response:", response);
            console.log(
              "📊 Transaction data:",
              response?.withdrawal || response?.data,
            );
            // Extract transaction data - handle nested data structure
            // API response structure: { status: "SUCCESS", message: "...", data: { transactionId, miniStatement, ... } }
            // Action returns: { withdrawal: data, status, message } where withdrawal = response.data.data
            // So response.withdrawal contains: { transactionId, referenceId, miniStatement, ... }
            let transactionData =
              response?.withdrawal || response?.data || null;

            // The action extracts response.data.data and assigns it to withdrawal
            // So response.withdrawal should directly contain miniStatement
            console.log("📊 Final transactionData:", transactionData);
            console.log(
              "📊 Mini Statement exists:",
              !!transactionData?.miniStatement,
            );
            console.log(
              "📊 Mini Statement is array:",
              Array.isArray(transactionData?.miniStatement),
            );
            console.log(
              "📊 Mini Statement length:",
              transactionData?.miniStatement?.length,
            );
            if (transactionData?.miniStatement) {
              console.log(
                "📊 First mini statement item:",
                transactionData.miniStatement[0],
              );
            }

            setModal({
              isOpen: true,
              title: "Statement Enquiry Successful",
              message:
                response?.message ||
                transactionData?.message ||
                "Statement enquiry successful!",
              type: "success",
              transactionData: transactionData,
            });
            setDeviceMessage("Statement enquiry completed successfully");
          } else {
            console.log("❌ Statement enquiry failed:", response?.message);
            console.log(
              "📊 Failure data:",
              response?.data || response?.withdrawal,
            );

            // Show failure modal with error details
            setModal({
              isOpen: true,
              title: "Statement Enquiry Failed",
              message: response?.message || "Statement enquiry failed",
              type: "error",
              transactionData: response?.data || response?.withdrawal || null,
            });
            setDeviceMessage("Statement enquiry failed");
          }
        } catch (apiError) {
          console.error(
            "❌ Statement enquiry API error caught in component:",
            apiError,
          );
          console.error("❌ Error details:", {
            message: apiError?.message,
            response: apiError?.response,
            responseData: apiError?.response?.data,
            status: apiError?.response?.status,
            statusText: apiError?.response?.statusText,
          });

          // Check if error response was returned from action
          if (apiError?.status === "FAILURE" || apiError?.message) {
            // Show modal with error details
            setModal({
              isOpen: true,
              title: "Statement Enquiry Failed",
              message: apiError?.message || "Statement enquiry failed",
              type: "error",
              transactionData: apiError?.withdrawal || apiError?.data || null,
            });
          } else {
            // Network or other errors
            const errorResponseData = apiError?.response?.data;
            setModal({
              isOpen: true,
              title: "API Error",
              message:
                errorResponseData?.message ||
                apiError?.message ||
                "Failed to process statement enquiry. Please check the console for details.",
              type: "error",
              transactionData: errorResponseData?.data || null,
            });
          }
          setDeviceMessage("API call failed");
        }
      } else {
        setScanProgress(0);
        const errInfo = respNode?.getAttribute("errInfo") || "";
        setDeviceMessage(`Capture failed: ${errInfo}`);
        setIsScanning(false);
        setModal({
          isOpen: true,
          title: "Capture Failed",
          message: `Fingerprint capture failed: ${errInfo}`,
          type: "error",
        });
        return;
      }
    } catch (err) {
      setScanProgress(0);
      setDeviceMessage("Capture failed. Please try again.");
      setIsScanning(false);
      setModal({
        isOpen: true,
        title: "Capture Error",
        message: "Failed to capture fingerprint. Please try again.",
        type: "error",
      });
      return;
    }
  };

  // Modal component
  const Modal = ({
    isOpen,
    onClose,
    title,
    message,
    type,
    transactionData,
  }) => {
    if (!isOpen) return null;

    const getColors = () => {
      switch (type) {
        case "success":
          return {
            bg: "bg-green-50",
            border: "border-green-200",
            text: "text-green-800",
            title: "text-green-900",
            button: "bg-green-600 hover:bg-green-700",
            icon: "text-green-600",
          };
        case "error":
          return {
            bg: "bg-red-50",
            border: "border-red-200",
            text: "text-red-800",
            title: "text-red-900",
            button: "bg-red-600 hover:bg-red-700",
            icon: "text-red-600",
          };
        case "warning":
          return {
            bg: "bg-yellow-50",
            border: "border-yellow-200",
            text: "text-yellow-800",
            title: "text-yellow-900",
            button: "bg-yellow-600 hover:bg-yellow-700",
            icon: "text-yellow-600",
          };
        default:
          return {
            bg: "bg-blue-50",
            border: "border-blue-200",
            text: "text-blue-800",
            title: "text-blue-900",
            button: "bg-blue-600 hover:bg-blue-700",
            icon: "text-blue-600",
          };
      }
    };

    const colors = getColors();
    const getIcon = () => {
      switch (type) {
        case "success":
          return (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          );
        case "error":
          return (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          );
        case "warning":
          return (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          );
        default:
          return (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          );
      }
    };

    // For success type, use PaymentSuccessScreen style
    if (type === "success") {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#D9D9D9CC]">
          <div className="bg-green-100 rounded-xl relative overflow-hidden max-w-md mx-auto">
            {/* Notches */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-10 bg-[#D9D9D9CC] rounded-b-full"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-10 bg-[#D9D9D9CC] rounded-t-full"></div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-16 w-10 bg-[#D9D9D9CC] rounded-r-full"></div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 h-16 w-10 bg-[#D9D9D9CC] rounded-l-full"></div>

            <div className="relative z-10 pt-12 pb-12 px-12">
              {/* Success Header */}
              <div className="text-center mb-6">
                <div className="flex justify-center mb-3">
                  <div className="w-14 h-14 rounded-full bg-[#039155] flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>

                <h2 className="text-[20px] font-['Gilroy-SemiBold'] text-[#1B1717]">
                  {title}
                </h2>
                <p className="text-[12px] text-[#1B1717]/80">{message}</p>
              </div>

              {/* Transaction/Response Details */}
              {transactionData && (
                <div className="mb-20">
                  {/* Amount Display - Highlighted Box */}
                  {transactionData.amount !== undefined && (
                    <div className="border-2 border-dashed border-[#1B1717] rounded-lg p-3 text-center mb-5">
                      <div className="text-[24px] font-['Gilroy-SemiBold'] text-[#1B1717]">
                        ₹{transactionData.amount}
                      </div>
                    </div>
                  )}

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {transactionData.transactionId && (
                      <div>
                        <div className="text-[#121216] font-['Gilroy-Medium'] text-xs">
                          Transaction ID
                        </div>
                        <div className="font-['Gilroy-Medium'] text-sm text-[#1B1717]">
                          {transactionData.transactionId}
                        </div>
                      </div>
                    )}
                    {transactionData.referenceId && (
                      <div>
                        <div className="text-[#121216] font-['Gilroy-Medium'] text-xs">
                          Reference ID
                        </div>
                        <div className="font-['Gilroy-Medium'] text-sm text-[#1B1717]">
                          {transactionData.referenceId}
                        </div>
                      </div>
                    )}
                    {transactionData.remainingBalance !== undefined && (
                      <div>
                        <div className="text-[#121216] font-['Gilroy-Medium'] text-xs">
                          Remaining Balance
                        </div>
                        <div className="font-['Gilroy-Medium'] text-sm text-[#039155]">
                          ₹{transactionData.remainingBalance}
                        </div>
                      </div>
                    )}
                    {transactionData.bankName && (
                      <div>
                        <div className="text-[#121216] font-['Gilroy-Medium'] text-xs">
                          Bank
                        </div>
                        <div className="font-['Gilroy-Medium'] text-sm text-[#1B1717]">
                          {transactionData.bankName}
                        </div>
                      </div>
                    )}
                    {transactionData.transactionDate && (
                      <div>
                        <div className="text-[#121216] font-['Gilroy-Medium'] text-xs">
                          Date
                        </div>
                        <div className="font-['Gilroy-Medium'] text-sm text-[#1B1717]">
                          {transactionData.transactionDate}
                        </div>
                      </div>
                    )}
                    {transactionData.transactionTime && (
                      <div>
                        <div className="text-[#121216] font-['Gilroy-Medium'] text-xs">
                          Time
                        </div>
                        <div className="font-['Gilroy-Medium'] text-sm text-[#1B1717]">
                          {transactionData.transactionTime}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Mini Statement - Only for Statement transactions */}
                  {transactionData.miniStatement &&
                    Array.isArray(transactionData.miniStatement) &&
                    transactionData.miniStatement.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="text-sm font-['Gilroy-SemiBold'] text-[#1B1717] mb-4">
                          Mini Statement
                        </div>
                        <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                          {/* Table Header */}
                          <div className="grid grid-cols-4 gap-2 bg-gray-100 px-3 py-2 border-b border-gray-200">
                            <div className="text-xs font-['Gilroy-SemiBold'] text-[#121216]">
                              Date
                            </div>
                            <div className="text-xs font-['Gilroy-SemiBold'] text-[#121216]">
                              Type
                            </div>
                            <div className="text-xs font-['Gilroy-SemiBold'] text-[#121216]">
                              Amount
                            </div>
                            <div className="text-xs font-['Gilroy-SemiBold'] text-[#121216]">
                              Narration
                            </div>
                          </div>
                          {/* Table Body */}
                          <div className="max-h-60 overflow-y-auto">
                            {transactionData.miniStatement.map(
                              (statement, index) => (
                                <div
                                  key={index}
                                  className="grid grid-cols-4 gap-2 px-3 py-2 border-b border-gray-200 last:border-b-0 hover:bg-gray-100 items-start"
                                >
                                  <div className="text-xs font-['Gilroy-Medium'] text-[#1B1717]">
                                    {statement.date}
                                  </div>
                                  <div
                                    className={`text-xs font-['Gilroy-SemiBold'] ${statement.txnType === "Cr" ? "text-green-600" : "text-red-600"}`}
                                  >
                                    {statement.txnType}
                                  </div>
                                  <div
                                    className={`text-xs font-['Gilroy-SemiBold'] ${statement.txnType === "Cr" ? "text-green-600" : "text-red-600"}`}
                                  >
                                    ₹{" "}
                                    {parseFloat(
                                      statement.amount || 0,
                                    ).toLocaleString("en-IN", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </div>
                                  <div className="text-xs font-['Gilroy-Medium'] text-[#1B1717] break-words whitespace-normal">
                                    {statement.narration?.trim() || "N/A"}
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              )}

              {/* Buttons */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-2 flex gap-20 justify-center items-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-28 border border-[#039155] rounded-lg py-2 text-sm text-[#039155] font-['Gilroy-Medium'] hover:bg-[#039155] hover:text-white transition"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-28 bg-[#039155] text-white rounded-lg py-2 text-sm font-['Gilroy-semibold'] hover:bg-[#027a44] transition"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // For error and other types, use the original modal style
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#D9D9D9CC]">
        <div
          className={`${colors.bg} ${colors.border} border-2 rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto`}
        >
          <div className="flex items-start gap-4">
            <div className={`${colors.icon} flex-shrink-0 mt-0.5`}>
              {getIcon()}
            </div>
            <div className="flex-1">
              <h3
                className={`${colors.title} text-lg font-['Gilroy-SemiBold'] mb-2`}
              >
                {title}
              </h3>
              <p
                className={`${colors.text} text-sm font-['Gilroy-Regular'] mb-4`}
              >
                {message}
              </p>

              {/* Transaction/Response Details */}
              {transactionData && (
                <div
                  className={`rounded-lg p-4 mb-4 border ${
                    type === "success"
                      ? "bg-white border-gray-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div>
                    {/* Error/Failure Details */}
                    {type === "error" && (
                      <>
                        {transactionData.paymentStatus && (
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-['Gilroy-Medium'] text-red-600">
                              Payment Status:
                            </span>
                            <span className="text-xs font-['Gilroy-SemiBold'] text-red-900">
                              {transactionData.paymentStatus}
                            </span>
                          </div>
                        )}
                        {transactionData.transactionStatus && (
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-['Gilroy-Medium'] text-red-600">
                              Transaction Status:
                            </span>
                            <span className="text-xs font-['Gilroy-SemiBold'] text-red-900">
                              {transactionData.transactionStatus}
                            </span>
                          </div>
                        )}
                        {transactionData.merchantTransactionId && (
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-['Gilroy-Medium'] text-red-600">
                              Merchant Transaction ID:
                            </span>
                            <span className="text-xs font-['Gilroy-SemiBold'] text-red-900">
                              {transactionData.merchantTransactionId}
                            </span>
                          </div>
                        )}
                        {transactionData.gatewayResponse && (
                          <div className="mt-3 pt-3 border-t border-red-200">
                            <div className="text-xs font-['Gilroy-Medium'] text-red-600 mb-2">
                              Gateway Response:
                            </div>
                            {transactionData.gatewayResponse.status && (
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-['Gilroy-Medium'] text-red-600">
                                  Status:
                                </span>
                                <span className="text-xs font-['Gilroy-SemiBold'] text-red-900">
                                  {transactionData.gatewayResponse.status}
                                </span>
                              </div>
                            )}
                            {transactionData.gatewayResponse.message && (
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-['Gilroy-Medium'] text-red-600">
                                  Message:
                                </span>
                                <span className="text-xs font-['Gilroy-SemiBold'] text-red-900">
                                  {transactionData.gatewayResponse.message}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={onClose}
                className={`${colors.button} text-white px-6 py-2 rounded-lg text-sm font-['Gilroy-Medium'] transition`}
              >
                OK
              </button>
            </div>
            <button
              onClick={onClose}
              className={`${colors.icon} hover:opacity-70 transition p-1`}
              aria-label="Close"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={() =>
          setModal({ ...modal, isOpen: false, transactionData: null })
        }
        title={modal.title}
        message={modal.message}
        type={modal.type}
        transactionData={modal.transactionData}
      />
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
            <div
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 ${
                deviceConnected
                  ? "bg-[#039155] text-white"
                  : "bg-[#DC2626] text-white"
              }`}
            >
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
                    {deviceConnected
                      ? "Device Connected"
                      : "Device Not Connected"}
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
          <div
            className={`border border-gray-200 rounded-xl p-8 flex-1 flex flex-col justify-center transition relative ${
              comingSoon ? "bg-gray-50" : "bg-white"
            }`}
          >
            {/* Background content - blurred when comingSoon */}
            <div
              className={`flex flex-col items-center gap-4 ${
                comingSoon
                  ? "opacity-80 pointer-events-none select-none blur-sm"
                  : ""
              }`}
            >
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
                    This authentication mode will be available in a future
                    update.
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
                    key={bank.bankIIN || bank.id}
                    type="button"
                    onClick={() => {
                      handleBankSelection(bank);
                    }}
                    className={`flex-shrink-0 w-[120px] p-3 rounded-xl border-2 transition ${
                      selectedBank?.bankIIN &&
                      bank.bankIIN &&
                      selectedBank.bankIIN === bank.bankIIN
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
                              const fallback =
                                e.target.parentElement.querySelector(
                                  ".bank-fallback",
                                );
                              if (fallback) fallback.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className="bank-fallback w-full h-full bg-gray-100 rounded-lg flex items-center justify-center"
                          style={{ display: bank.bankLogo ? "none" : "flex" }}
                        >
                          <span className="text-[8px] font-['Gilroy-Medium'] text-gray-600 text-center px-1">
                            {bank.bankName?.substring(0, 3).toUpperCase() ||
                              "BANK"}
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
                placeholder={
                  selectedBank ? selectedBank.bankName : "Search bank..."
                }
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
                      key={bank.bankIIN || bank.id}
                      type="button"
                      onClick={() => {
                        handleBankSelection(bank);
                      }}
                      className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition ${
                        selectedBank?.bankIIN &&
                        bank.bankIIN &&
                        selectedBank.bankIIN === bank.bankIIN
                          ? "bg-[#E5FFF4]"
                          : ""
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
                              const fallback =
                                e.target.parentElement.querySelector(
                                  ".dropdown-bank-fallback",
                                );
                              if (fallback) fallback.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className="dropdown-bank-fallback w-full h-full bg-gray-100 rounded flex items-center justify-center"
                          style={{ display: bank.bankLogo ? "none" : "flex" }}
                        >
                          <span className="text-[10px] font-['Gilroy-Medium'] text-gray-600">
                            {bank.bankName?.substring(0, 2).toUpperCase() ||
                              "BK"}
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
              {showBankDropdown &&
                bankSearchQuery &&
                filteredBanks.length === 0 && (
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
                <p className="mt-1 text-[12px] text-red-500">
                  {formik.errors.aadhaarNumber}
                </p>
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
                <p className="mt-1 text-[12px] text-red-500">
                  {formik.errors.mobileNumber}
                </p>
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
                  value={
                    selectedAmount
                      ? selectedAmount.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      : ""
                  }
                  onChange={(e) => {
                    // Extract only numbers from the input
                    const numericValue = e.target.value.replace(/[^\d]/g, "");
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
            onClick={async () => {
              if (activeTab === "cashWithdrawal") {
                // Validate all fields before submitting
                formik.setFieldTouched("selectedBank", true);
                formik.setFieldTouched("selectedAmount", true);
                formik.setFieldTouched("aadhaarNumber", true);
                formik.setFieldTouched("mobileNumber", true);

                // Check if form is valid (except pidData which will be captured if needed)
                const errors = await formik.validateForm();
                const hasErrors =
                  errors.selectedBank ||
                  errors.selectedAmount ||
                  errors.aadhaarNumber ||
                  errors.mobileNumber;

                if (hasErrors) {
                  // Show validation errors
                  formik.setFieldTouched("selectedBank", true);
                  formik.setFieldTouched("selectedAmount", true);
                  formik.setFieldTouched("aadhaarNumber", true);
                  formik.setFieldTouched("mobileNumber", true);
                  return;
                }

                // Check if device is connected
                if (!deviceConnected) {
                  setModal({
                    isOpen: true,
                    title: "Device Not Connected",
                    message: "Device not connected. Please check device first.",
                    type: "error",
                  });
                  return;
                }

                // All validations passed, proceed with withdrawal
                formik.setSubmitting(true);
                try {
                  await handleWithdrawal(formik.values);
                } finally {
                  formik.setSubmitting(false);
                }
              } else if (activeTab === "enquiry") {
                // Validate fields for enquiry
                formik.setFieldTouched("selectedBank", true);
                formik.setFieldTouched("aadhaarNumber", true);
                formik.setFieldTouched("mobileNumber", true);

                const errors = await formik.validateForm();
                const hasErrors =
                  errors.selectedBank ||
                  errors.aadhaarNumber ||
                  errors.mobileNumber;

                if (hasErrors) {
                  formik.setFieldTouched("selectedBank", true);
                  formik.setFieldTouched("aadhaarNumber", true);
                  formik.setFieldTouched("mobileNumber", true);
                  return;
                }

                if (!deviceConnected) {
                  setModal({
                    isOpen: true,
                    title: "Device Not Connected",
                    message: "Device not connected. Please check device first.",
                    type: "error",
                  });
                  return;
                }

                formik.setSubmitting(true);
                try {
                  await handleEnquiry(formik.values);
                } finally {
                  formik.setSubmitting(false);
                }
              } else if (activeTab === "statement") {
                // Validate fields for statement
                formik.setFieldTouched("selectedBank", true);
                formik.setFieldTouched("aadhaarNumber", true);
                formik.setFieldTouched("mobileNumber", true);

                const errors = await formik.validateForm();
                const hasErrors =
                  errors.selectedBank ||
                  errors.aadhaarNumber ||
                  errors.mobileNumber;

                if (hasErrors) {
                  formik.setFieldTouched("selectedBank", true);
                  formik.setFieldTouched("aadhaarNumber", true);
                  formik.setFieldTouched("mobileNumber", true);
                  return;
                }

                if (!deviceConnected) {
                  setModal({
                    isOpen: true,
                    title: "Device Not Connected",
                    message: "Device not connected. Please check device first.",
                    type: "error",
                  });
                  return;
                }

                formik.setSubmitting(true);
                try {
                  await handleStatement(formik.values);
                } finally {
                  formik.setSubmitting(false);
                }
              }
            }}
            disabled={formik.isSubmitting || isScanning}
            className="w-full bg-[#039155] hover:bg-[#027A47] text-white rounded-lg px-6 py-3 text-[14px] font-['Gilroy-Medium'] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {formik.isSubmitting || isScanning
              ? isScanning
                ? "Capturing..."
                : "Processing..."
              : activeTab === "cashWithdrawal"
                ? "Withdrawal"
                : activeTab === "enquiry"
                  ? "Check Balance"
                  : "Check Statement"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Selectservice;
