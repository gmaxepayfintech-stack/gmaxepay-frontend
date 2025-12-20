import { useMemo, useRef, useState } from "react";
import { HiOutlineArrowNarrowLeft } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import BiometricVerification from "./BiometricVerification";

const OTP_LENGTH = 6;

const IdentityVerification = ({ onBack }) => {
    const navigate = useNavigate();
    const [otp, setOtp] = useState(Array.from({ length: OTP_LENGTH }, () => ""));
    const [touchedSubmit, setTouchedSubmit] = useState(false);
    const [showBiometric, setShowBiometric] = useState(false);
    const inputsRef = useRef([]);

    const phone = "+91 98765 00001";

    const otpValue = useMemo(() => otp.join(""), [otp]);

    const focusIndex = (idx) => {
        const el = inputsRef.current?.[idx];
        if (el) el.focus();
    };

    const handleChange = (idx, value) => {
        const v = String(value ?? "").replace(/\D/g, "");
        if (!v) {
            setOtp((prev) => {
                const next = [...prev];
                next[idx] = "";
                return next;
            });
            return;
        }

        // support paste / fast typing
        const chars = v.split("");
        setOtp((prev) => {
            const next = [...prev];
            let cursor = idx;
            for (const ch of chars) {
                if (cursor >= OTP_LENGTH) break;
                next[cursor] = ch;
                cursor += 1;
            }
            return next;
        });

        const nextIndex = Math.min(idx + chars.length, OTP_LENGTH - 1);
        focusIndex(nextIndex);
    };

    const handleKeyDown = (idx, e) => {
        if (e.key === "Backspace" && !otp[idx] && idx > 0) {
            focusIndex(idx - 1);
        }
        if (e.key === "ArrowLeft" && idx > 0) focusIndex(idx - 1);
        if (e.key === "ArrowRight" && idx < OTP_LENGTH - 1) focusIndex(idx + 1);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setTouchedSubmit(true);

        const isComplete = otp.every((d) => String(d).trim().length > 0);
        if (!isComplete) {
            // focus first empty input
            const firstEmptyIndex = otp.findIndex((d) => !String(d).trim());
            if (firstEmptyIndex >= 0) focusIndex(firstEmptyIndex);
            return;
        }

        // TODO: hook up API verify
        // eslint-disable-next-line no-console
        console.log("OTP submit:", otpValue);
        setShowBiometric(true);
    };

    if (showBiometric) {
        return <BiometricVerification />;
    }

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex items-start gap-3 mb-6">
                <button
                    type="button"
                    aria-label="Back"
                    onClick={() => (typeof onBack === "function" ? onBack() : navigate(-1))}
                    className="flex items-center justify-center w-10 h-10 border border-gray-400 rounded-full mr-2 bg-white hover:bg-gray-50 transition"
                >
                    <HiOutlineArrowNarrowLeft className="text-2xl text-[#1B1717] opacity-80" />
                </button>

                <div className="flex-1">
                    <div className="text-[24px] font-['Gilroy-Medium'] text-[#1B1717]">
                        Identity Verification
                    </div>
                    <div className="mt-[18px] text-[16px] text-[#000000] font-['Gilroy-Regular']">
                        Please Review The Aadhaar Enabled Payment System Terms Carefully
                        Before Proceeding To KYC Verification
                    </div>
                </div>
            </div>

            {/* Card */}
            <form
                onSubmit={handleSubmit}
                className="bg-[#FFFFFF] rounded-2xl px-6 py-10 sm:px-10 sm:py-12"
            >
                <div className="max-w-2xl mx-auto text-center">
                    <div className="text-[24px] font-['Gilroy-SemiBold'] text-[#1B1717]">
                        Enter Verification Code
                    </div>
                    <div className="mt-[16px] text-[16px] text-[#000000] text font-['Gilroy-Medium']">
                        We've Sent A 6-Digit Code To
                    </div>
                    <div className="mt-[12px] text-[18px] font-['Gilroy-Medium'] text-[#1B1717]">
                        {phone}
                    </div>

                    {/* OTP Inputs */}
                    <div className="mt-[32px] flex items-center justify-center gap-[42px]">
                        {otp.map((digit, idx) => (
                            (() => {
                                const showError = touchedSubmit && !String(digit).trim();
                                return (
                            <input
                                key={idx}
                                ref={(el) => {
                                    inputsRef.current[idx] = el;
                                }}
                                value={digit}
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                maxLength={OTP_LENGTH}
                                onChange={(e) => handleChange(idx, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(idx, e)}
                                className={`w-12 h-12 rounded-xl bg-white text-center text-[16px] font-['Gilroy-Medium'] text-[#1B1717] outline-none border-[0.5px] focus:ring-2 ${showError ? "border-red-500 focus:ring-red-200 focus:border-red-500" : "border-[#000000] focus:ring-[#039155]/30 focus:border-[#039155]"}`}
                            />
                                );
                            })()
                        ))}
                    </div>

                    <div className="mt-[28px] text-[18px] text-[#000000] text-opacity-70 font-['Gilroy-Regular']">
                        Didn't Receive The Code?
                    </div>
                    <div className="mt-[12px] text-[16px] font-['Gilroy-Medium'] text-[#000000]">
                        Resend In 0s
                    </div>

                    <button
                        type="submit"
                        className="mt-[32px] w-[510px] max-w-full bg-[#039155] hover:bg-[#027A47] text-white rounded-lg py-3 text-[24px] font-['Gilroy-SemiBold'] transition"
                    >
                        Submit
                    </button>
                </div>
            </form>
        </div>
    );
};

IdentityVerification.propTypes = {
    onBack: PropTypes.func,
};

export default IdentityVerification;