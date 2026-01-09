import { useState, useEffect, useRef } from "react";
import { HiOutlineArrowNarrowLeft } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import StartCapture from "../../../../public/img/StartCapture.svg";
import AEPSAccessConfirmTwo from "./AEPSAccessConfirmTwo";
import { aepsTwoStatusCheck, aepsTwoFAVerification } from "../../../redux/action/aepsTwoAction";
import { getLocationAndIP } from "../../../util/getLocationAndIP";

const FAVerificationTwo = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showConfirm, setShowConfirm] = useState(false);

  // RD Service states
  const [rdBaseUrl, setRdBaseUrl] = useState("");
  const [pidData, setPidData] = useState("");
  const [deviceInfoXml, setDeviceInfoXml] = useState("");
  const [isDeviceChecking, setIsDeviceChecking] = useState(false);
  const [isGettingDeviceInfo, setIsGettingDeviceInfo] = useState(false);

  // Ref to track if API has been called for current pidData
  const pidDataProcessedRef = useRef(false);
  const lastPidDataRef = useRef("");

  /* -------------------------------
      STEP 1 → Discover RD SERVICE
  ---------------------------------*/
  const discoverAvdm = async () => {
    setIsDeviceChecking(true);
    setRdBaseUrl("");

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
        setIsDeviceChecking(false);
        return;
      }

      setRdBaseUrl(baseURL);
    } catch (err) {
      console.error(err);
    }

    setIsDeviceChecking(false);
  };

  /* -------------------------------
      STEP 2 → GET DEVICE INFO
  ---------------------------------*/
  const getDeviceInfo = async () => {
    if (!rdBaseUrl) {
      return;
    }

    setIsGettingDeviceInfo(true);

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

      console.log("Device Info:", infoText);
      console.log("Device Name:", deviceName);
    } catch (err) {
      console.error("Device info error:", err);
    }

    setIsGettingDeviceInfo(false);
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

    console.log("✅ Processing new pidData, fetching location and dispatching API call...");
    pidDataProcessedRef.current = true;
    lastPidDataRef.current = pidData;

    // Fetch location and convert pidData to base64
    const processFAVerification = async () => {
      try {
        // Get location (latitude, longitude)
        const locationData = await getLocationAndIP();
        const latitude = locationData?.location?.latitude || "";
        const longitude = locationData?.location?.longitude || "";
        
        console.log("📍 Location data:", { latitude, longitude });

        // Convert pidData (XML string) to base64
        let base64PidData = "";
        try {
          // Convert the XML string to base64
          base64PidData = btoa(unescape(encodeURIComponent(pidData)));
          console.log("✅ PidData converted to base64, length:", base64PidData.length);
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

        console.log("📤 Dispatching aepsTwoFAVerification with data:", {
          txtPidDataLength: requestData.txtPidData.length,
          latitude: requestData.latitude,
          longitude: requestData.longitude,
        });

        dispatch(aepsTwoFAVerification(requestData))
          .then((response) => {
            console.log("✅ FA Verification response:", response);
            
            // Only check status after successful submission
            if (response?.status === "SUCCESS") {
              // Check status ONCE after successful 2FA verification
              dispatch(aepsTwoStatusCheck())
                .then((statusResponse) => {
                  console.log("✅ AEPS Status check response:", statusResponse);

                  // Check if 2FA is now completed
                  const statusData = statusResponse?.aepsStatus;
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
            } else {
              pidDataProcessedRef.current = false;
            }
          })
          .catch((err) => {
            console.error("aepsTwoFAVerification error:", err);
            pidDataProcessedRef.current = false;
          });
      } catch (error) {
        console.error("❌ Error processing FA verification:", error);
        pidDataProcessedRef.current = false;
      }
    };

    processFAVerification();
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