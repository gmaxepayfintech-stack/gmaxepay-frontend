import { useMemo, useState, useEffect } from "react";
import { HiOutlineArrowNarrowLeft } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import StartCapture from "../../../public/img/StartCapture.svg";
import FAVerification from "./FAVerification";
import { aepsStatusCheck } from "../../redux/action/aepsAction";

const FingerPrintIcon = "/img/FingerPrint.svg";
const IrisIcon = "/img/Iris.svg";
const EyeIcon = "/img/Eye.svg";

const BiometricVerification = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [mode, setMode] = useState("fingerprint"); 
  const [deviceConnected] = useState(true);
  const [comingSoon, setComingSoon] = useState(false);
  const [show2FA, setShow2FA] = useState(false);

  // Call aepsStatusCheck on component mount
  useEffect(() => {
    dispatch(aepsStatusCheck()).then((response) => {
      console.log("aepsStatusCheck response in BiometricVerification:", response);
    }).catch((error) => {
      console.error("aepsStatusCheck error in BiometricVerification:", error);
    });
  }, [dispatch]);

  const modeTabs = useMemo(
    () => [
      { key: "fingerprint", label: "Fingerprint" },
      { key: "iris", label: "Iris Scan" },
    ],
    []
  );

  if (show2FA) {
    return <FAVerification />;
  }

  return (
    <div className="w-full">
      {/* Header */}
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
            Bio Metric Verification
          </div>
          <div className="mt-[10px] text-[16px]  text-[000000] font-['Gilroy-Regular']">
            Connect Your RD Service Device To Proceed With Aadhaar
            Authentication. Ensure Your Fingers Are Clean And Dry
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

            <div className="inline-flex gap-[80px]  items-center bg-[#FFFFFF] border border-gray-200 rounded-3xl p-2">
              {modeTabs.map((t) => {
                const active = mode === t.key;
                const isIris = t.key === "iris";
                let tabClassName = "text-[#1B1717] text-opacity-80 hover:bg-gray-50";
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
            <div className="flex items-center justify-between gap-[50px] bg-[#098324] text-white rounded-lg px-4 py-2.5 min-w-[240px]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white" />
                <span className="text-[12px] font-['Gilroy-Medium']">
                  {deviceConnected ? "Device Connected" : "Device Not Connected"}
                </span>
              </div>
              <button
                type="button"
                className="text-[10px] font-['Gilroy-Regular'] text-[#FFFFFF] hover:opacity-100 whitespace-nowrap"
              >
                Check Again
              </button>
            </div>
          </div>
        </div>

        {/* Capture area */}
        <div className="mt-[28px] pt-5 ">
          <div className={`border border-dashed border-gray-300 rounded-xl p-6 sm:p-8 transition ${
            comingSoon ? "bg-gray-50" : "bg-white"
          }`}>
          <div className="max-w-2xl mx-auto text-center relative">
            {/* Keep same UI visible; dim/disable when comingSoon */}
            <div className={comingSoon ? "opacity-80 pointer-events-none select-none blur-sm" : ""}>
              <div className="relative mx-auto w-[170px] h-[170px] flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-[#E5FFF4]" />
                <div className="absolute inset-[18px] rounded-full bg-white" />
                <img
                  src={mode === "iris" ? IrisIcon : FingerPrintIcon}
                  alt={mode === "iris" ? "Iris" : "Fingerprint"}
                  className="relative w-10 h-10"
                />
                <button
                  type="button"
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#039155] text-[#FFFFFF] text-[12px] font-['Gilroy-Medium'] px-3 py-1 rounded-md cursor-default"
                  aria-label="Ready"
                >
                  Ready
                </button>
              </div>

              <div className="mt-[32px] text-[18px] font-['Gilroy-SemiBold'] text-[#1B1717]">
                {mode === "iris" ? "Look Into The Scanner" : "Place Finger On Scanner"}
              </div>
              <div className="mt-[16px] text-[14px] text-[#1B1717] font-['Gilroy-Medium'] leading-relaxed">
                {mode === "iris"
                  ? "Position Your Eyes Within The Scanner's View. Keep Them Wide Open And Hold Steady Until Capture"
                  : "Please Place Your Finger Flat On The Device Sensor And Hold It Steady Until The Capture Is Complete."}
              </div>

              <button
                type="button"
                onClick={() => setShow2FA(true)}
                className="mt-[28px] inline-flex items-center justify-center gap-3 bg-[#039155] hover:bg-[#027A47] text-white rounded-lg px-10 py-3 text-[14px] font-['Gilroy-Medium'] transition w-full max-w-[260px]"
              >
                <span className="inline-flex items-center justify-center w-6 h-6 ">
                  <img
                    src={mode === "iris" ? EyeIcon : StartCapture}
                    alt=""
                    className="w-full h-full"
                    aria-hidden="true"
                  />
                </span>{" "}
                {mode === "iris" ? "Start Iris Scan" : "Start Capture"}
              </button>
            </div>

            {comingSoon && (
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Disabled background overlay */}
                <div className="absolute inset-0 " />
                {/* Coming Soon container */}
                <div className="relative bg-white/95 border border-gray-200 rounded-xl px-6 py-5 shadow-sm max-w-[420px] w-full z-10">
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
        </div>
      </div>
    </div>
  );
};

export default BiometricVerification;