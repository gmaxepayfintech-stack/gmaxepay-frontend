import { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import StartCapture from "../../../../public/img/StartCapture.svg";
import AEPSAccessConfirmThree from "./AEPSAccessConfirmThree";

import { aepsThreeStatusCheck, aepsThreeFAVerification } from "../../../redux/action/aepsThreeAction";

import { getLocationAndIP } from "../../../util/getLocationAndIP";
import { HiArrowLeft } from "react-icons/hi2";
import { useNotification } from "../../../context/NotificationContext";

const FingerPrintIcon = "/img/FingerPrint.svg";
const IrisIcon = "/img/Iris.svg";
const EyeIcon = "/img/Eye.svg";

const FAVerificationThree = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { showNotification } = useNotification();
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

    // Ref to track if API has been called for current pidData
    const pidDataProcessedRef = useRef(false);
    const lastPidDataRef = useRef("");

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
            //console.log("Device Info:", infoText);
            //console.log("Device Name:", deviceName);
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

        // Start smooth progress animation that fills during capture
        // Fill over ~8 seconds to match typical capture time
        const totalDuration = 8000; // 8 seconds
        const updateInterval = 50; // Update every 50ms
        const incrementPerUpdate = 100 / (totalDuration / updateInterval); // ~0.625% per update

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
                        // Fallback: extract DeviceInfo using regex or innerHTML
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

        // Build proper XML structure without backslashes
        const pidOptions =
            '<?xml version="1.0"?><PidOptions ver="1.0"><Opts env="P" fCount="1" fType="2" iCount="0" format="0" pidVer="2.0" timeout="15000" wadh="E0jzJ/P8UopUHAieZn8CKqS4WPMi5ZSYXgfnlfkWjrc=" posh="UNKNOWN" />' +
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

            // Clear progress interval and complete the fill
            clearInterval(progressInterval);
            setScanProgress(100);

            const xmlDoc = new DOMParser().parseFromString(captureText, "text/xml");
            const respNode = xmlDoc.getElementsByTagName("Resp")[0];
            const errCode = respNode?.getAttribute("errCode");

            if (errCode === "0") {
                setDeviceMessage("Fingerprint captured successfully");
                // Store pidData - this will trigger the API call via useEffect
                //console.log("✅ PID Data captured successfully, errCode:", errCode);
                //console.log("📦 Setting pidData, length:", captureText.length);
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
        console.log(
            "🔍 useEffect triggered - pidData:",
            pidData ? `exists (${pidData.length} chars)` : "empty",
        );
        console.log("🔍 pidDataProcessedRef.current:", pidDataProcessedRef.current);
        console.log(
            "🔍 lastPidDataRef.current length:",
            lastPidDataRef.current.length,
        );

        if (!pidData) {
            //console.log("⚠️ pidData is empty, resetting ref");
            pidDataProcessedRef.current = false;
            lastPidDataRef.current = "";
            return;
        }

        // Prevent duplicate API calls for the same pidData
        if (pidDataProcessedRef.current && lastPidDataRef.current === pidData) {
            //console.log("⚠️ Already processed this pidData, skipping");
            return;
        }

        // console.log(
        //   "✅ Processing new pidData, fetching location and dispatching API call...",
        // );
        pidDataProcessedRef.current = true;
        lastPidDataRef.current = pidData;

        // Fetch location and convert pidData to base64
        const processFAVerification = async () => {
            try {
                // Get location (latitude, longitude)
                const locationData = await getLocationAndIP();
                const latitude = locationData?.location?.latitude || "";
                const longitude = locationData?.location?.longitude || "";

                //console.log("📍 Location data:", { latitude, longitude });

                // Convert pidData (XML string) to base64
                let base64PidData = "";
                try {
                    // Convert the XML string to base64
                    base64PidData = btoa(unescape(encodeURIComponent(pidData)));
                    // console.log(
                    //   "✅ PidData converted to base64, length:",
                    //   base64PidData.length,
                    // );
                } catch (encodeError) {
                    console.error("❌ Error encoding pidData to base64:", encodeError);
                    pidDataProcessedRef.current = false;
                    return;
                }

                const requestData = {
                    txtPidData: base64PidData,
                    latitude: latitude.toString(),
                    longitude: longitude.toString(),
                };

                console.log("📤 Dispatching aepsThreeFAVerification with data:", {
                    txtPidDataLength: requestData.txtPidData.length,
                    latitude: requestData.latitude,
                    longitude: requestData.longitude,
                });

                dispatch(aepsThreeFAVerification(requestData))
                    .then((response) => {
                        console.log("✅ FA Verification response:", response);

                        // Only check status after successful submission
                        if (response?.status === "SUCCESS") {
                            showNotification({
                                type: "success",
                                message: response?.message || "2FA Verification successful",
                                isCritical: true,
                            });
                            // Check status ONCE after successful 2FA verification
                            dispatch(aepsThreeStatusCheck())
                                .then((statusResponse) => {
                                    //console.log("✅ AEPS Status check response:", statusResponse);

                                    // Check if 2FA is now completed
                                    const statusData = statusResponse?.aepsStatus;
                                    if (statusData) {
                                        const { is2faVerified } = statusData;
                                        if (is2faVerified) {
                                            //console.log("2FA completed, showing confirm page");
                                            setShowConfirm(true);
                                        }
                                    }
                                })
                                .catch((err) => {
                                    console.error(
                                        "aepsThreeStatusCheck error after FA verification:",
                                        err,
                                    );
                                    showNotification({
                                        type: "error",
                                        message: err?.message || "Status check failed after 2FA verification",
                                        isCritical: true,
                                    });
                                });
                        } else {
                            showNotification({
                                type: "error",
                                message: response?.message || "2FA Verification failed",
                                isCritical: true,
                            });
                            pidDataProcessedRef.current = false;
                        }
                    })
                    .catch((err) => {
                        console.error("aepsThreeFAVerification error:", err);
                        const errorMsg = err?.response?.data?.message || err?.message || "2FA Verification failed";
                        showNotification({
                            type: "error",
                            message: errorMsg,
                            isCritical: true,
                        });
                        pidDataProcessedRef.current = false;
                    });
            } catch (error) {
                console.error("❌ Error processing FA verification:", error);
                showNotification({
                    type: "error",
                    message: error?.message || "Error processing FA verification",
                    isCritical: true,
                });
                pidDataProcessedRef.current = false;
            }
        };

        processFAVerification();
    }, [pidData, dispatch]);

    // Call aepsStatusCheck on component mount
    useEffect(() => {
        dispatch(aepsThreeStatusCheck())
            .then((response) => {
                console.log(
                    "aepsThreeStatusCheck response in FAVerificationThree:",
                    response,
                );
            })
            .catch((error) => {
                console.error("aepsThreeStatusCheck error in FAVerificationThree:", error);
            });
        // Also check device on mount
        discoverAvdm();
    }, [dispatch]);

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

    const modeTabs = useMemo(
        () => [
            { key: "fingerprint", label: "Fingerprint" },
            { key: "iris", label: "Iris Scan" },
        ],
        [],
    );

    // Show confirm page if 2FA is completed
    if (showConfirm) {
        return <AEPSAccessConfirmThree />;
    }

    return (
        <div className="w-full py-4 px-1">
            {/* Header */}
            <div className="flex items-start gap-3 mb-6">
                <button
                    type="button"
                    aria-label="Back"
                    onClick={() => navigate(-1)}
                    className="flex items-center justify-center w-10 h-10 border border-gray-400 rounded-full mr-2 bg-white hover:bg-gray-50 transition"
                >
                    <HiArrowLeft className="text-2xl text-[#1B1717] opacity-80" />
                </button>

                <div className="flex-1">
                    <div className="text-[24px] font-['Gilroy-Medium'] text-[#1B1717]">
                        2FA Verification
                    </div>
                    <div className="mt-[10px] text-[16px] text-[#000000] font-['Gilroy-Regular']">
                        Mandatory Daily Authentication Requires A Registered Biometric
                        Device
                    </div>
                </div>
            </div>

            {/* Top row: tabs + device status */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <div className="text-[12px] text-[#000000] font-['Gilroy-Medium'] mb-2">
                            Authentication Mode
                        </div>

                        <div className="inline-flex gap-[80px] items-center bg-[#FFFFFF] border border-gray-200 rounded-3xl p-2">
                            {modeTabs.map((t) => {
                                const active = mode === t.key;
                                const isIris = t.key === "iris";
                                let tabClassName =
                                    "text-[#1B1717] text-opacity-80 hover:bg-gray-50";
                                if (active) tabClassName = "bg-[#039155] text-[#FFFFFF]";
                                return (
                                    <button
                                        key={t.key}
                                        type="button"
                                        onClick={() => {
                                            setMode(t.key);
                                            setComingSoon(isIris);
                                        }}
                                        className={`px-6 py-3 rounded-3xl text-[16px] font-['Gilroy-Medium'] transition ${tabClassName}`}
                                    >
                                        {t.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 justify-start lg:justify-end">
                        <div
                            className={`flex flex-col gap-2 rounded-lg px-4 py-2.5 min-w-[240px] ${deviceConnected ? "bg-[#098324]" : "bg-[#DC2626]"
                                } text-white`}
                        >
                            {deviceMessage ? (
                                <div className="flex items-center justify-between gap-[50px]">
                                    <div className="text-[12px] font-['Gilroy-Medium'] flex-1">
                                        {deviceMessage}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={discoverAvdm}
                                        disabled={isDeviceChecking}
                                        className="text-[10px] font-['Gilroy-Regular'] text-[#FFFFFF] hover:opacity-100 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isDeviceChecking ? "Checking..." : "Check Again"}
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between gap-[50px]">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`w-2 h-2 rounded-full ${deviceConnected ? "bg-white" : "bg-white"
                                                }`}
                                        />
                                        <span className="text-[12px] font-['Gilroy-Medium']">
                                            {deviceConnected
                                                ? "Device Connected"
                                                : "Device Not Connected"}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={discoverAvdm}
                                        disabled={isDeviceChecking}
                                        className="text-[10px] font-['Gilroy-Regular'] text-[#FFFFFF] hover:opacity-100 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isDeviceChecking ? "Checking..." : "Check Again"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Capture area */}
                <div className="mt-[20px] pt-4 border-t border-gray-200">
                    <div
                        className={`border border-dashed border-gray-300 rounded-xl p-6 sm:p-8 transition ${comingSoon ? "bg-gray-50" : "bg-white"
                            }`}
                    >
                        <div className="max-w-2xl mx-auto text-center relative">
                            {/* Keep same UI visible; dim/disable when comingSoon */}
                            <div
                                className={
                                    comingSoon
                                        ? "opacity-80 pointer-events-none select-none blur-sm"
                                        : ""
                                }
                            >
                                <div className="relative mx-auto w-[170px] h-[170px] flex items-center justify-center">
                                    {/* Outer circle background */}
                                    <div className="absolute inset-0 rounded-full bg-[#E5FFF4]" />
                                    {/* Fill animation circle - fills clockwise from top (12 o'clock) */}
                                    {isScanning && (
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
                                        src={mode === "iris" ? IrisIcon : FingerPrintIcon}
                                        alt={mode === "iris" ? "Iris" : "Fingerprint"}
                                        className="relative w-10 h-10 z-20"
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
                                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#039155] text-[#FFFFFF] text-[12px] font-['Gilroy-Medium'] px-3 py-1 rounded-md cursor-pointer hover:bg-[#027A47] transition disabled:opacity-50 disabled:cursor-not-allowed z-20"
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

                                <div className="mt-[32px] text-[18px] font-['Gilroy-SemiBold'] text-[#1B1717]">
                                    {mode === "iris"
                                        ? "Look Into The Scanner"
                                        : "Place Finger On Scanner"}
                                </div>
                                <div className="mt-[16px] text-[14px] text-[#1B1717] font-['Gilroy-Medium'] leading-relaxed">
                                    {mode === "iris"
                                        ? "Position Your Eyes Within The Scanner's View. Keep Them Wide Open And Hold Steady Until Capture"
                                        : "Please Place Your Finger Flat On The Device Sensor And Hold It Steady Until The Capture Is Complete."}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        if (mode === "iris" || comingSoon) return;
                                        if (!deviceConnected) {
                                            discoverAvdm();
                                            return;
                                        }
                                        captureAvdm();
                                    }}
                                    disabled={isScanning || comingSoon || mode === "iris"}
                                    className="mt-[24px] inline-flex items-center justify-center gap-3 bg-[#039155] hover:bg-[#027A47] text-white rounded-lg px-10 py-3 text-[14px] font-['Gilroy-Medium'] transition w-full max-w-[320px] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="inline-flex items-center justify-center w-6 h-6 ">
                                        <img
                                            src={mode === "iris" ? EyeIcon : StartCapture}
                                            alt=""
                                            className="w-full h-full"
                                            aria-hidden="true"
                                        />
                                    </span>{" "}
                                    {isScanning
                                        ? "Scanning..."
                                        : mode === "iris"
                                            ? "Start Iris Scan"
                                            : "Start Capture"}
                                </button>
                            </div>

                            {comingSoon && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    {/* Disabled background overlay */}
                                    <div className="absolute inset-0" />
                                    {/* Coming Soon container */}
                                    <div className="relative bg-white/95 border border-gray-200 rounded-xl px-6 py-5 shadow-sm max-w-[420px] w-full z-10">
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
                </div>
            </div>
        </div>
    );
};

export default FAVerificationThree;
