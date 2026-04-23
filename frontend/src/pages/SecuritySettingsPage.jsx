import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../services/api";

export default function SecuritySettingsPage() {
    const { token, user } = useAuth();
    const [form, setForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleChange = (key) => (event) => {
        setForm((currentForm) => ({
            ...currentForm,
            [key]: event.target.value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");
        setIsSubmitting(true);

        try {
            await authApi.updateOwnPassword(form, token);
            setSuccessMessage("Your super admin password has been updated.");
            setForm({
                currentPassword: "",
                newPassword: "",
                confirmNewPassword: "",
            });
        } catch (error) {
            setErrorMessage(error.message || "Unable to update the password right now.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
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

                    <div className="flex flex-col gap-2">
                        <label htmlFor="currentPassword" className="text-xs font-semibold text-on-surface">
                            Current Password
                        </label>
                        <input
                            id="currentPassword"
                            type="password"
                            value={form.currentPassword}
                            onChange={handleChange("currentPassword")}
                            className="w-full border border-outline-variant rounded-lg px-4 py-3 bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            required
                        />
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="newPassword" className="text-xs font-semibold text-on-surface">
                                New Password
                            </label>
                            <input
                                id="newPassword"
                                type="password"
                                value={form.newPassword}
                                onChange={handleChange("newPassword")}
                                className="w-full border border-outline-variant rounded-lg px-4 py-3 bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                minLength={8}
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="confirmNewPassword" className="text-xs font-semibold text-on-surface">
                                Confirm New Password
                            </label>
                            <input
                                id="confirmNewPassword"
                                type="password"
                                value={form.confirmNewPassword}
                                onChange={handleChange("confirmNewPassword")}
                                className="w-full border border-outline-variant rounded-lg px-4 py-3 bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                minLength={8}
                                required
                            />
                        </div>
                    </div>

                    {errorMessage ? (
                        <div className="rounded-lg border border-error/20 bg-error-container px-4 py-3 text-sm text-on-error-container">
                            {errorMessage}
                        </div>
                    ) : null}

                    {successMessage ? (
                        <div className="rounded-lg border border-secondary/20 bg-secondary/10 px-4 py-3 text-sm text-secondary">
                            {successMessage}
                        </div>
                    ) : null}

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
        </>
    );
}
