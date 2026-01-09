import { useMemo, useState, useEffect, useRef } from "react";
import { HiOutlineArrowNarrowLeft } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import StartCapture from "../../../../public/img/StartCapture.svg";
import AEPSAccessConfirmTwo from "./AEPSAccessConfirmTwo";
import { aepsOnboardingFAVerification } from "../../../redux/action/aepsAction";
import { aepsTwoStatusCheck } from "../../../redux/action/aepsTwoAction";

const FingerPrintIcon = "/img/FingerPrint.svg";
const IrisIcon = "/img/Iris.svg";
const EyeIcon = "/img/Eye.svg";

const FAVerificationTwo = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [mode, setMode] = useState("fingerprint"); // fingerprint | iris
  const [deviceConnected, setDeviceConnected] = useState(false);
  const [comingSoon, setComingSoon] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // RD Service states
  const [rdBaseUrl, setRdBaseUrl] = useState("");
  const [pidData, setPidData] = useState("");
  const [deviceInfoXml, setDeviceInfoXml] = useState("");
  const [isDeviceChecking, setIsDeviceChecking] = useState(false);
  const [isGettingDeviceInfo, setIsGettingDeviceInfo] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [deviceMessage, setDeviceMessage] = useState("");
  const [scanProgress, setScanProgress] = useState(0); // For fill animation

  // Redux states
  const faStatus = useSelector(
    (state) => state.aeps?.aepsFaStatus
  );
  const aepsStatus = useSelector(
    (state) => state.aeps?.aepsStatus
  );

  // Ref to track if API has been called for current pidData
  const pidDataProcessedRef = useRef(false);
  const lastPidDataRef = useRef("");

  /* -------------------------------------------
      CALL aepsTwoStatusCheck ON COMPONENT MOUNT
  --------------------------------------------*/
  useEffect(() => {
    dispatch(aepsTwoStatusCheck())
      .then((response) => {
        console.log(
          "aepsTwoStatusCheck response in FAVerificationTwo:",
          response
        );
        
        // Check if we should be on this step
        const statusData = response?.aepsStatus || aepsStatus?.aepsStatus;
        if (statusData) {
          const { aepsOnboarding, ekycOtp, ekycBiometric, daily2FAAuthentication } = statusData;
          
          // If aepsOnboarding is still pending, redirect back
          if (
            aepsOnboarding?.status?.toLowerCase() === "pending" ||
            (typeof aepsOnboarding?.isCompleted === "boolean" && aepsOnboarding.isCompleted === false)
          ) {
            console.log("aepsOnboarding is pending, redirecting...");
            navigate(-1);
            return;
          }
          
          // If ekycOtp is still pending, redirect to identity verification
          if (
            ekycOtp?.status?.toLowerCase() === "pending" ||
            (typeof ekycOtp?.isCompleted === "boolean" && ekycOtp.isCompleted === false)
          ) {
            console.log("ekycOtp is pending, redirecting to identity verification...");
            navigate(-1);
            return;
          }
          
          // If ekycBiometric is still pending, redirect to biometric verification
          if (
            ekycBiometric?.status?.toLowerCase() === "pending" ||
            (typeof ekycBiometric?.isCompleted === "boolean" && ekycBiometric.isCompleted === false)
          ) {
            console.log("ekycBiometric is pending, redirecting to biometric verification...");
            navigate(-1);
            return;
          }
          
          // If daily2FAAuthentication is completed, show confirm
          if (
            daily2FAAuthentication?.status?.toLowerCase() === "completed" &&
            daily2FAAuthentication?.isCompleted === true
          ) {
            console.log("2FA completed, showing confirm page");
            setShowConfirm(true);
            return;
          }
        }
      })
      .catch((error) => {
        console.error("aepsTwoStatusCheck error in FAVerificationTwo:", error);
      });
  }, [dispatch, navigate, aepsStatus]);

  /* -------------------------------------------
      CHECK IF ALL STATUS IS COMPLETED
  --------------------------------------------*/
  const checkIfAllStatusCompleted = (statusData) => {
    if (!statusData) {
      console.log("⚠️ No status data available");
      return false;
    }

    // Check all required steps are completed based on response structure
    const aepsOnboarding = statusData?.aepsOnboarding;
    const validateAgentOtp = statusData?.validateAgentOtp;
    const bioMetricVerification = statusData?.bioMetricVerification;
    const daily2FAAuthentication = statusData?.daily2FAAuthentication;

    // Check if all four steps are completed
    const isAepsOnboardingCompleted = 
      aepsOnboarding?.status?.toLowerCase() === "completed" && 
      aepsOnboarding?.isCompleted === true;

    const isValidateAgentOtpCompleted = 
      validateAgentOtp?.status?.toLowerCase() === "completed" && 
      validateAgentOtp?.isCompleted === true;

    const isBioMetricVerificationCompleted = 
      bioMetricVerification?.status?.toLowerCase() === "completed" && 
      bioMetricVerification?.isCompleted === true;

    const isDaily2FAAuthenticationCompleted = 
      daily2FAAuthentication?.status?.toLowerCase() === "completed" && 
      daily2FAAuthentication?.isCompleted === true;

    const allCompleted = 
      isAepsOnboardingCompleted &&
      isValidateAgentOtpCompleted &&
      isBioMetricVerificationCompleted &&
      isDaily2FAAuthenticationCompleted;

    console.log("🔍 Status check:", {
      aepsOnboarding: isAepsOnboardingCompleted,
      validateAgentOtp: isValidateAgentOtpCompleted,
      bioMetricVerification: isBioMetricVerificationCompleted,
      daily2FAAuthentication: isDaily2FAAuthenticationCompleted,
      allCompleted
    });

    return allCompleted;
  };

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

    // Start smooth progress animation that fills over ~8 seconds
    const totalDuration = 8000; // 8 seconds
    const updateInterval = 50; // Update every 50ms
    const incrementPerUpdate = (100 / (totalDuration / updateInterval)); // ~0.625% per update
    
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

      // Clear progress interval and complete the fill
      clearInterval(progressInterval);
      setScanProgress(100);

      const xmlDoc = new DOMParser().parseFromString(captureText, "text/xml");
      const respNode = xmlDoc.getElementsByTagName("Resp")[0];
      const errCode = respNode?.getAttribute("errCode");

      if (errCode === "0") {
        setDeviceMessage("Fingerprint captured successfully");
        // Store pidData - this will trigger the API call via useEffect
        console.log("✅ PID Data captured successfully, errCode:", errCode);
        console.log("📦 Setting pidData, length:", captureText.length);
        setPidData(captureText);
        setIsScanning(false);
      } else {
        const errInfo = respNode?.getAttribute("errInfo") || "";
        setDeviceMessage(`Capture failed: ${errInfo}`);
        console.error(`Capture failed: ${errInfo}`);
        setIsScanning(false);
        // Reset progress on failure after a brief delay
        setTimeout(() => {
          setScanProgress(0);
        }, 500);
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
  useEffect(() => {
    console.log("🔍 useEffect triggered - pidData:", pidData ? `exists (${pidData.length} chars)` : "empty");
    console.log("🔍 pidDataProcessedRef.current:", pidDataProcessedRef.current);
    console.log("🔍 lastPidDataRef.current length:", lastPidDataRef.current.length);
    
    if (!pidData) {
      console.log("⚠️ pidData is empty, resetting ref");
      pidDataProcessedRef.current = false;
      lastPidDataRef.current = "";
      return;
    }

    // Prevent duplicate API calls for the same pidData
    if (pidDataProcessedRef.current && lastPidDataRef.current === pidData) {
      console.log("⚠️ Already processed this pidData, skipping");
      return;
    }

    console.log("✅ Processing new pidData, dispatching API call...");
    pidDataProcessedRef.current = true;
    lastPidDataRef.current = pidData;

    const requestData = {
      biometricData: pidData,
      captureType: "FINGER"
    };

    console.log("📤 Dispatching aepsOnboardingFAVerification with data:", {
      biometricDataLength: requestData.biometricData.length,
      captureType: requestData.captureType
    });

    dispatch(aepsOnboardingFAVerification(requestData))
      .then((response) => {
        console.log("✅ FA Verification response:", response);
        if (response?.status === "SUCCESS") {
          setDeviceMessage("2FA verification successful");
          // Call aepsTwoStatusCheck after successful verification
          dispatch(aepsTwoStatusCheck())
            .then((statusResponse) => {
              console.log("✅ AEPS Status check response:", statusResponse);
              
              // Check if 2FA is now completed
              const statusData = statusResponse?.aepsStatus || aepsStatus?.aepsStatus;
              if (statusData) {
                const { daily2FAAuthentication } = statusData;
                if (
                  daily2FAAuthentication?.status?.toLowerCase() === "completed" &&
                  daily2FAAuthentication?.isCompleted === true
                ) {
                  console.log("2FA completed, showing confirm page");
                  setShowConfirm(true);
                }
              }
            })
            .catch((err) => {
              console.error("aepsTwoStatusCheck error after FA verification:", err);
            });
        }
      })
      .catch((err) => {
        console.error("aepsOnboardingFAVerification error:", err);
        pidDataProcessedRef.current = false;
      });

  }, [pidData, dispatch]);

  // Show confirm page if 2FA is completed
  if (showConfirm) {
    return <AEPSAccessConfirmTwo />;
  }

  return (
    <div className="w-full">
      {/* header */}
      <div className="flex items-start gap-3 mb-6">
        <button
          type="button"
          aria-label="Back"
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-10 h-10 border border-gray-400 rounded-full mr-2 bg-white hover:bg-gray-50 transition"
        >
          <HiOutlineArrowNarrowLeft className="text-2xl text-[#1B1717] opacity-80" />
        </button>

        <div className="flex-1">
          <div className="text-[24px] font-['Gilroy-Medium'] text-[#1B1717]">
            2FA Verification
          </div>
          <div className="mt-[18px] text-[16px] text-[#000000] font-['Gilroy-Regular']">
            Please Place Your Right Thumb On The Scanner To Complete Verification
          </div>
        </div>
      </div>

      {/* Card */}
      <div className="bg-[#FFFFFF] rounded-2xl px-6 py-10 sm:px-10 sm:py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mx-auto w-[124px] h-[124px] relative flex items-center justify-center">
            <img src={StartCapture} alt="Start Capture" />
          </div>

          <div className="mt-6 text-[20px] sm:text-[22px] font-['Gilroy-Medium'] text-[#1B1717]">
            Place Your Finger
          </div>
          <div className="mt-2 text-[12px] sm:text-[13px] text-gray-500 font-['Gilroy-Regular'] leading-relaxed">
            Follow The On-Screen Instructions To Capture Your Fingerprint
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={discoverAvdm}
              className="bg-[#039155] text-white px-4 py-2 rounded-md mr-3"
            >
              Check Device
            </button>

            <button
              type="button"
              onClick={getDeviceInfo}
              className="bg-[#027A47] text-white px-4 py-2 rounded-md"
            >
              Get Device Info
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FAVerificationTwo;