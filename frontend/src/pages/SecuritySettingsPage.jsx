import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../services/api";
import { toast } from "react-hot-toast";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

export default function SecuritySettingsPage() {
    const { token, user } = useAuth();
    const [form, setForm] = useState({
        newPassword: "",
        confirmNewPassword: "",
    });
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (key) => (event) => {
        setForm((currentForm) => ({
            ...currentForm,
            [key]: event.target.value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            await authApi.updateOwnPassword(form, token);
            toast.success("Your super admin password has been updated.");
            setForm({
                newPassword: "",
                confirmNewPassword: "",
            });
        } catch (error) {
            toast.error(error.message || "Unable to update the password right now.");
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
                <h2 className="text-[32px] font-bold text-on-surface leading-[40px]" style={{ letterSpacing: "-0.02em" }}>
                    Super Admin Security
                </h2>
                <p className="text-base text-on-surface-variant mt-2">
                    Update the super admin login password. This page is restricted to the super admin account only.
                </p>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                <form
                    onSubmit={handleSubmit}
                    className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6 flex flex-col gap-5"
                >
                    <div className="rounded-xl border border-outline-variant bg-surface px-4 py-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
                            Current Super Admin Login
                        </p>
                        <p className="text-sm text-on-surface mt-2">{user?.email || "superadmin@gmail.com"}</p>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="newPassword" className="text-xs font-semibold text-on-surface">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    id="newPassword"
                                    name="newPassword"
                                    type={showNewPassword ? "text" : "password"}
                                    value={form.newPassword}
                                    onChange={handleChange("newPassword")}
                                    autoComplete="new-password"
                                    className="w-full border border-outline-variant rounded-lg pl-4 pr-10 py-3 bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                    minLength={8}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword((prev) => !prev)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors focus:outline-none"
                                >
                                    <span className="material-symbols-outlined text-[20px]">
                                        {showNewPassword ? "visibility" : "visibility_off"}
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="confirmNewPassword" className="text-xs font-semibold text-on-surface">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <input
                                    id="confirmNewPassword"
                                    name="confirmNewPassword"
                                    type={showConfirmNewPassword ? "text" : "password"}
                                    value={form.confirmNewPassword}
                                    onChange={handleChange("confirmNewPassword")}
                                    autoComplete="new-password"
                                    className="w-full border border-outline-variant rounded-lg pl-4 pr-10 py-3 bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                    minLength={8}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmNewPassword((prev) => !prev)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors focus:outline-none"
                                >
                                    <span className="material-symbols-outlined text-[20px]">
                                        {showConfirmNewPassword ? "visibility" : "visibility_off"}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-outline-variant">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:bg-primary-container transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <span className="material-symbols-outlined text-[18px]">lock_reset</span>
                            {isSubmitting ? "Updating..." : "Update Password"}
                        </button>
                    </div>
                </form>

                <aside className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6 h-fit">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
                        Access Rules
                    </p>
                    <ul className="mt-4 space-y-3 text-sm text-on-surface-variant">
                        <li>Only users with the `super_admin` role can open this page.</li>
                        <li>Admins and any future roles are blocked in both the UI and backend API.</li>
                        <li>The default bootstrap login is `superadmin@gmail.com` / `superadmin` until you change it.</li>
                    </ul>
                </aside>
            </div>
        </motion.div>
    );
}
