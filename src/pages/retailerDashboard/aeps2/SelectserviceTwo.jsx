import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import StartCapture from "../../../../public/img/StartCapture.svg";
import { aepsBankList, aepsWithdrawl } from "../../../redux/action/aepsAction";
import { getUserProfile } from "../../../redux/action/userProfileAction";
import { getLocationAndIP } from "../../../util/getLocationAndIP";
import { useNotification } from "../../../context/NotificationContext";

const FingerPrintIcon = "/img/FingerPrint.svg";
const IrisIcon = "/img/Iris.svg";
const EyeIcon = "/img/Eye.svg";

const SelectserviceTwo = () => {
  const dispatch = useDispatch();
  const bankList = useSelector((state) => state.aeps?.bankList);
  
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
      const manufacturerCode = (deviceInfo.getAttribute("mc") || "").toLowerCase();
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

    // Extract DeviceInfo element from deviceInfoXml (DString should be the DeviceInfo element)
    let DString = "";
    if (deviceInfoXml) {
      try {
        const xmlDoc = new DOMParser().parseFromString(deviceInfoXml, "text/xml");
        const deviceInfo = xmlDoc.getElementsByTagName("DeviceInfo")[0];
        if (deviceInfo) {
          // Get the DeviceInfo element as string
          if (typeof XMLSerializer !== 'undefined') {
            DString = new XMLSerializer().serializeToString(deviceInfo);
          } else {
            // Fallback: extract DeviceInfo using regex
            const deviceInfoMatch = deviceInfoXml.match(/<DeviceInfo[^>]*>[\s\S]*?<\/DeviceInfo>/);
            if (deviceInfoMatch) {
              DString = deviceInfoMatch[0];
            }
          }
        }
      } catch (err) {
        console.error("Error extracting DeviceInfo:", err);
        // Fallback: try to extract DeviceInfo using regex
        try {
          const deviceInfoMatch = deviceInfoXml.match(/<DeviceInfo[^>]*>[\s\S]*?<\/DeviceInfo>/);
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
      custOpts = "<CustOpts><Param name=\"mantrakey\" value=\"\" /></CustOpts>";
    } else if (deviceType === "startek") {
      // Startek devices typically don't need CustOpts
      custOpts = ""; // Startek devices usually don't need CustOpts
    } else {
      // For unknown devices, default to Mantra format (backward compatibility)
      custOpts = "<CustOpts><Param name=\"mantrakey\" value=\"\" /></CustOpts>";
    }
    
    // Build proper XML structure without backslashes
    const pidOptions = '<?xml version="1.0"?><PidOptions ver="1.0"><Opts fCount="1" fType="2" iCount="0" pCount="0" format="0" pidVer="2.0" timeout="10000" posh="UNKNOWN" wadh="E0jzJ/P8UopUHAieZn8CKqS4WPMi5ZSYXgfnlfkWjrc=" env="P" />' + DString + custOpts + '</PidOptions>';

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

  /* -------------------------------------------
      AUTO DISPATCH WHEN PID DATA RECEIVED
  --------------------------------------------*/
  const handleWithdrawal = async (values) => {
    // placeholder: implement transaction using aepsWithdrawl
  };

  return (
    <div className="w-full"> 
      {/* Minimal stub - full form copied from original if needed */}
      <div className="text-[24px] font-['Gilroy-Medium'] text-[#1B1717]">Select Service (Two)</div>
    </div>
  );
};

export default SelectserviceTwo;