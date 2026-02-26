import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
    deleteSupportCompany,
    addSupportPhoneCompany,
    addSupportEmailCompany,
    helpinformationCompany,
} from "../../redux/action/helpAction";
import { HiArrowLeft } from "react-icons/hi2";
import { Phone, Mail, Trash2, Plus, Loader2 } from "lucide-react";
import { useNotification } from "../../context/NotificationContext";
import { useCompany } from "../../context/CompanyContext";
const ContactSupport = () => {
    const dispatch = useDispatch();
    const { showNotification } = useNotification();

    const [supportEmail, setSupportEmail] = useState("");
    const [phoneNumbers, setPhoneNumbers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Add phone
    const [newPhone, setNewPhone] = useState("");
    const [addingPhone, setAddingPhone] = useState(false);

    // Add email
    const [newEmail, setNewEmail] = useState("");
    const [addingEmail, setAddingEmail] = useState(false);

    // Deleting phone
    const [deletingPhone, setDeletingPhone] = useState(null);

    // ─── Fetch on mount ───────────────────────────────────────────────────────
    const fetchSupportInfo = async () => {
        setLoading(true);
        try {
            const res = await dispatch(helpinformationCompany());
            console.log("helpinformationCompany response:", res);
            if (res?.status === true || res?.status === "SUCCESS") {
                // Action returns { helpinfo, status, message }
                // helpinfo = response.data.data = { customerSupportEmail, supportPhoneNumbers }
                setSupportEmail(res?.helpinfo?.customerSupportEmail || "");
                setPhoneNumbers(res?.helpinfo?.supportPhoneNumbers || []);
            }
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSupportInfo();
    }, []);

    // ─── Add Phone ────────────────────────────────────────────────────────────
    const handleAddPhone = async () => {
        const trimmed = newPhone.trim();
        if (!trimmed) {
            showNotification({ type: "error", message: "Please enter a phone number.", isCritical: true });
            return;
        }
        if (!/^\d{10}$/.test(trimmed)) {
            showNotification({ type: "error", message: "Please enter a valid 10-digit phone number.", isCritical: true });
            return;
        }
        setAddingPhone(true);
        try {
            const res = await dispatch(addSupportPhoneCompany({ phone: trimmed }));
            if (res?.status === true || res?.status === "SUCCESS") {
                showNotification({ type: "success", message: res?.message || "Phone number added!", isCritical: false });
                setNewPhone("");
                await fetchSupportInfo();
            } else {
                showNotification({ type: "error", message: res?.message || "Failed to add phone.", isCritical: true });
            }
        } catch (err) {
            showNotification({ type: "error", message: err?.response?.data?.message || "Unexpected error.", isCritical: true });
        } finally {
            setAddingPhone(false);
        }
    };

    // ─── Delete Phone ─────────────────────────────────────────────────────────
    const handleDeletePhone = async (phone) => {
        setDeletingPhone(phone);
        try {
            const res = await dispatch(deleteSupportCompany({ phone }));
            if (res?.status === true || res?.status === "SUCCESS") {
                showNotification({ type: "success", message: res?.message || "Phone number removed!", isCritical: false });
                await fetchSupportInfo();
            } else {
                showNotification({ type: "error", message: res?.message || "Failed to remove phone.", isCritical: true });
            }
        } catch (err) {
            showNotification({ type: "error", message: err?.response?.data?.message || "Unexpected error.", isCritical: true });
        } finally {
            setDeletingPhone(null);
        }
    };

    // ─── Update Email ─────────────────────────────────────────────────────────
    const handleUpdateEmail = async () => {
        const trimmed = newEmail.trim();
        if (!trimmed) {
            showNotification({ type: "error", message: "Please enter an email address.", isCritical: true });
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
            showNotification({ type: "error", message: "Please enter a valid email address.", isCritical: true });
            return;
        }
        setAddingEmail(true);
        try {
            const res = await dispatch(addSupportEmailCompany({ email: trimmed }));
            if (res?.status === true || res?.status === "SUCCESS") {
                showNotification({ type: "success", message: res?.message || "Support email updated!", isCritical: false });
                setNewEmail("");
                await fetchSupportInfo();
            } else {
                showNotification({ type: "error", message: res?.message || "Failed to update email.", isCritical: true });
            }
        } catch (err) {
            showNotification({ type: "error", message: err?.response?.data?.message || "Unexpected error.", isCritical: true });
        } finally {
            setAddingEmail(false);
        }
    };

    return (
        <div className="px-1 py-4 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => globalThis.history?.back()}
                    className="rounded-full p-2 bg-white border border-gray-400"
                >
                    <HiArrowLeft className="text-xl text-gray-600" />
                </button>
                <h1 className="text-xl md:text-2xl font-[Gilroy-Medium] text-[#1B1717]">
                    Contact Support
                </h1>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="w-8 h-8 animate-spin text-[#039155]" />
                </div>
            ) : (
                <>
                    {/* ── Phone Numbers Section ────────────────────────── */}
                    <div className="bg-white rounded-3xl shadow-sm p-5 space-y-5">
                        <div className="flex items-center gap-2">
                            <span className="p-2 bg-green-50 rounded-xl">
                                <Phone className="w-5 h-5 text-[#039155]" />
                            </span>
                            <h3 className="text-xl md:text-2xl font-[Gilroy-Medium] text-[#1B1717]">
                                Support Phone Numbers
                            </h3>
                        </div>

                        {/* Existing numbers */}
                        {phoneNumbers.length === 0 ? (
                            <p className="text-sm font-[Gilroy-Medium] text-[#1B1717]/50">
                                No phone numbers added yet.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {phoneNumbers.map((phone, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Phone className="w-4 h-4 text-[#039155]" />
                                            <span className="text-sm font-[Gilroy-Medium] text-[#1B1717]">
                                                +91 {phone}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleDeletePhone(phone)}
                                            disabled={deletingPhone === phone}
                                            className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
                                        >
                                            {deletingPhone === phone ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add new phone — hidden when limit reached */}
                        {phoneNumbers.length >= 2 ? (
                            <p className="text-xs font-[Gilroy-Medium] text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
                                ⚠️ Maximum 2 support phone numbers are allowed. Delete one to add a new number.
                            </p>
                        ) : (
                            <div className="flex items-center gap-3">
                                <div className="flex-1 flex items-center gap-2 border border-gray-300 rounded-2xl px-4 py-2 bg-gray-50 focus-within:border-[#039155] focus-within:ring-1 focus-within:ring-[#039155] transition">
                                    <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                                    <input
                                        type="text"
                                        maxLength={10}
                                        placeholder="Enter 10-digit phone number"
                                        value={newPhone}
                                        onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, ""))}
                                        onKeyDown={(e) => e.key === "Enter" && handleAddPhone()}
                                        className="flex-1 bg-transparent outline-none text-sm font-[Gilroy-Medium] text-[#1B1717] placeholder:text-gray-400"
                                    />
                                </div>
                                <button
                                    onClick={handleAddPhone}
                                    disabled={addingPhone}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-[#039155] text-white text-sm font-[Gilroy-Medium] rounded-2xl hover:bg-[#027a47] transition-colors disabled:opacity-60 whitespace-nowrap"
                                >
                                    {addingPhone ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Plus className="w-4 h-4" />
                                    )}
                                    Add Phone
                                </button>
                            </div>
                        )}
                    </div>

                    {/* ── Email Section ────────────────────────────────── */}
                    <div className="bg-white rounded-3xl shadow-sm p-5 space-y-5">
                        <div className="flex items-center gap-2">
                            <span className="p-2 bg-blue-50 rounded-xl">
                                <Mail className="w-5 h-5 text-blue-500" />
                            </span>
                            <h3 className="text-xl md:text-2xl font-[Gilroy-Medium] text-[#1B1717]">
                                Support Email
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Current email */}
                            {supportEmail ? (
                                <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
                                    <Mail className="w-4 h-4 text-blue-500" />
                                    <span className="text-sm font-[Gilroy-Medium] text-[#1B1717]">
                                        {supportEmail}
                                    </span>
                                    <span className="ml-auto text-xs font-[Gilroy-Medium] px-2 py-0.5 bg-green-100 text-[#039155] rounded-full">
                                        Active
                                    </span>
                                </div>
                            ) : (
                                <div className="flex items-center h-full px-4 py-3 bg-gray-50 border border-dashed border-gray-300 rounded-2xl">
                                    <p className="text-sm font-[Gilroy-Medium] text-[#1B1717]/50">
                                        No support email configured yet.
                                    </p>
                                </div>
                            )}

                            {/* Update email */}
                            <div className="flex items-center gap-3">
                                <div className="flex-1 flex items-center gap-2 border border-gray-300 rounded-2xl px-4 py-2 bg-gray-50 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 transition">
                                    <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                                    <input
                                        type="email"
                                        placeholder="Enter support email address"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleUpdateEmail()}
                                        className="flex-1 bg-transparent outline-none text-sm font-[Gilroy-Medium] text-[#1B1717] placeholder:text-gray-400 min-w-0"
                                    />
                                </div>
                                <button
                                    onClick={handleUpdateEmail}
                                    disabled={addingEmail}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white text-sm font-[Gilroy-Medium] rounded-2xl hover:bg-blue-600 transition-colors disabled:opacity-60 whitespace-nowrap h-full"
                                >
                                    {addingEmail ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Mail className="w-4 h-4" />
                                    )}
                                    {supportEmail ? "Update" : "Add"}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ContactSupport;