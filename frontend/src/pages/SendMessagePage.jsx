import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { messageApi } from "../services/api";
import { toast } from "react-hot-toast";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const countryOptions = [
    { label: "+1 (US)", value: "1" },
    { label: "+44 (UK)", value: "44" },
    { label: "+91 (IN)", value: "91" },
    { label: "+55 (BR)", value: "55" },
];

export default function SendMessagePage() {
    const { token } = useAuth();
    const [form, setForm] = useState({
        countryCode: "91",
        phoneNumber: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState(null);

    const handleChange = (key) => (event) => {
        setForm((currentForm) => ({
            ...currentForm,
            [key]: event.target.value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setResult(null);

        try {
            const payload = await messageApi.sendSingle(
                {
                    countryCode: form.countryCode,
                    phoneNumber: form.phoneNumber.trim(),
                },
                token,
            );

            setResult(payload.data);
            setForm((currentForm) => ({
                ...currentForm,
                phoneNumber: "",
            }));
            toast.success("Message processed successfully");
        } catch (error) {
            toast.error(error.message || "Message could not be sent.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="mb-8">
                <h2 className="text-[32px] font-bold text-on-surface mb-2 leading-[40px]" style={{ letterSpacing: "-0.02em" }}>
                    Send Message
                </h2>
                <p className="text-base text-on-surface-variant">
                    Compose and send a single WhatsApp message directly.
                </p>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
                <form
                    onSubmit={handleSubmit}
                    className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6 flex flex-col gap-6"
                >

                    <div className="flex flex-col gap-3">
                        <label className="text-xs font-semibold text-on-surface">Recipient Phone Number</label>
                        <div className="flex gap-2 w-full">
                            <div className="relative w-1/3 max-w-[120px]">
                                <select
                                    value={form.countryCode}
                                    onChange={handleChange("countryCode")}
                                    className="w-full h-12 appearance-none bg-surface border border-outline-variant rounded-lg pl-4 pr-8 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
                                >
                                    {countryOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none">
                                    expand_more
                                </span>
                            </div>
                            <input
                                type="tel"
                                value={form.phoneNumber}
                                onChange={handleChange("phoneNumber")}
                                placeholder="e.g. 9876543210"
                                className="flex-1 h-12 bg-surface border border-outline-variant rounded-lg px-4 py-2 text-sm text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
                                required
                            />
                        </div>
                    </div>


                    <div className="flex justify-end gap-4 mt-4 pt-6 border-t border-surface-container-highest">
                        <button
                            type="button"
                            onClick={() =>
                                setForm({
                                    countryCode: "91",
                                    phoneNumber: "",
                                })
                            }
                            className="px-6 py-2 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-low text-xs font-semibold transition-colors"
                        >
                            Clear
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 rounded-lg bg-secondary text-on-secondary hover:bg-on-secondary-container text-xs font-semibold transition-colors shadow-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <span className="material-symbols-outlined text-sm">send</span>
                            {isSubmitting ? "Sending..." : "Send via WhatsApp"}
                        </button>
                    </div>
                </form>

                <aside className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6 flex flex-col gap-4 h-fit">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
                            Delivery Status
                        </p>
                        <h3 className="text-[20px] font-semibold text-on-surface mt-2 leading-7">
                            Latest send result
                        </h3>
                    </div>

                    {result ? (
                        <div className="space-y-4">
                            <div className="rounded-xl bg-secondary/10 border border-secondary/20 px-4 py-3">
                                <p className="text-sm font-semibold text-secondary">Message accepted</p>
                                <p className="text-xs text-on-surface-variant mt-1">
                                    Provider: {result.delivery.provider} • Mode: {result.delivery.mode}
                                </p>
                            </div>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="text-xs font-semibold text-on-surface-variant">Recipient</p>
                                    <p className="text-on-surface">
                                        {result.history.recipientName || "Unnamed recipient"} ({result.history.phoneNumber})
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-on-surface-variant">Message ID</p>
                                    <p className="text-on-surface break-all">{result.delivery.messageId}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-on-surface-variant">Saved History Entry</p>
                                    <p className="text-on-surface break-all">{result.history._id}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed border-outline-variant bg-surface px-4 py-6 text-sm text-on-surface-variant">
                            Send a test message from this page and the delivery result will appear here.
                        </div>
                    )}
                </aside>
            </div>
        </motion.div>
    );
}
