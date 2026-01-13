import { useMemo, useRef, useState, useEffect } from "react";
import { HiOutlineArrowNarrowLeft } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import { getUserProfile } from "../../../redux/action/userProfileAction";
import { aepsStatusCheck, aepsSubmitBankOtp } from "../../../redux/action/aepsAction";
import BankKyc from "./BankKyc";
import { ButtonLoader } from "../../../widgets/layout/loader";

const OTP_LENGTH = 6;

const BankOtp = ({ onBack }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { mobileNo, profile } = useSelector((state) => state.userProfile || {});
    const [otp, setOtp] = useState(Array.from({ length: OTP_LENGTH }, () => ""));
    const [touchedSubmit, setTouchedSubmit] = useState(false);
    const [showBankKyc, setShowBankKyc] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const inputsRef = useRef([]);

    // Call getUserProfile on component mount
    useEffect(() => {
        dispatch(getUserProfile()).then((response) => {
            console.log("getUserProfile response in BankOtp:", response);
        }).catch((error) => {
            console.error("getUserProfile error in BankOtp:", error);
        });
    }, [dispatch]);


    // Format mobile number for display
    const formatPhoneNumber = (mobile) => {
        if (!mobile) return "+91 00000 00000";
        // Remove any non-digit characters
        const digits = mobile.replace(/\D/g, "");
        // Format as +91 XXXXX XXXXX
        if (digits.length === 10) {
            return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
        }
        return `+91 ${mobile}`;
    };

    const phone = formatPhoneNumber(mobileNo || profile?.mobileNo);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setTouchedSubmit(true);

        const isComplete = otp.every((d) => String(d).trim().length > 0);
        if (!isComplete) {
            // focus first empty input
            const firstEmptyIndex = otp.findIndex((d) => !String(d).trim());
            if (firstEmptyIndex >= 0) focusIndex(firstEmptyIndex);
            return;
        }

        setIsLoading(true);
        try {
            // Submit Bank OTP in the required format
            const response = await dispatch(aepsSubmitBankOtp({ otp: otpValue }));
            console.log("aepsSubmitBankOtp response:", response);
            
            // Check status regardless of success or failure
            try {
                const statusResponse = await dispatch(aepsStatusCheck());
                console.log("aepsStatusCheck response after Bank OTP submit:", statusResponse);
            } catch (statusError) {
                console.error("aepsStatusCheck error after Bank OTP submit:", statusError);
            }
            
            // Only navigate to next step if OTP submission was successful
            if (response?.status === "SUCCESS") {
                setShowBankKyc(true);
            }
        } catch (error) {
            console.error("aepsSubmitBankOtp error:", error);
            // Check status even on error
            try {
                const statusResponse = await dispatch(aepsStatusCheck());
                console.log("aepsStatusCheck response after Bank OTP submit error:", statusResponse);
            } catch (statusError) {
                console.error("aepsStatusCheck error after Bank OTP submit error:", statusError);
            }
            // Handle error (you might want to show an error message to the user)
        } finally {
            setIsLoading(false);
        }
    };

    if (showBankKyc) {
        return <BankKyc />;
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
                    <div className="mt-[32px] flex items-center justify-center gap-6">
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


                    <button
                        type="submit"
                        disabled={isLoading}
                        className="mt-[32px] w-[510px] max-w-full bg-[#039155] hover:bg-[#027A47] disabled:bg-[#039155]/50 disabled:cursor-not-allowed text-white rounded-lg py-3 text-[24px] font-['Gilroy-SemiBold'] transition flex items-center justify-center gap-2"
                    >
                        {isLoading && <ButtonLoader color="#FFFFFF" size={20} thickness={3} />}
                        {isLoading ? "Processing..." : "Submit"}
                    </button>
                </div>
            </form>
        </div>
    );
};

BankOtp.propTypes = {
    onBack: PropTypes.func,
};

export default BankOtp;