import { useEffect, useState } from "react";
import { authApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

function getInitials(name = "") {
    const parts = String(name)
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2);

    if (parts.length === 0) {
        return "NA";
    }

    return parts.map((part) => part[0].toUpperCase()).join("");
}

function formatDate(value, fallback = "Never") {
    if (!value) {
        return fallback;
    }

    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

function getRoleBadge(role) {
    if (role === "super_admin") {
        return "bg-primary-fixed-dim text-on-primary-fixed-variant";
    }

    return "bg-surface-container-highest text-on-surface-variant border border-outline-variant";
}

export default function UserManagementPage() {
    const { token } = useAuth();
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [form, setForm] = useState({
        name: "",
        email: "",
        phoneNumber: "",
        password: "",
        crmAccessId: "",
    });

    async function loadUsers() {
        setIsLoading(true);
        setErrorMessage("");

        try {
            const payload = await authApi.listUsers(token);
            setUsers(payload.data.users);
        } catch (error) {
            setErrorMessage(error.message || "Unable to load users.");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadUsers();
    }, [token]);

    const handleChange = (key) => (event) => {
        setForm((currentForm) => ({
            ...currentForm,
            [key]: event.target.value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const payload = await authApi.createAdmin(
                {
                    name: form.name.trim(),
                    email: form.email.trim(),
                    phoneNumber: form.phoneNumber.trim(),
                    password: form.password,
                    crmAccessId: form.crmAccessId.trim(),
                },
                token,
            );

            setUsers((currentUsers) => [payload.data.user, ...currentUsers]);
            setSuccessMessage(`Admin account created for ${payload.data.user.email}.`);
            setForm({
                name: "",
                email: "",
                phoneNumber: "",
                password: "",
                crmAccessId: "",
            });
        } catch (error) {
            setErrorMessage(error.message || "Unable to create the admin account.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="mb-8">
                <h2 className="text-[32px] font-bold text-on-surface leading-[40px]" style={{ letterSpacing: "-0.02em" }}>
                    User Management
                </h2>
                <p className="text-base text-on-surface-variant mt-2">
                    Live user data from the backend. Only supported accounts are shown here.
                </p>
            </div>

            {(errorMessage || successMessage) ? (
                <div className="mb-6 space-y-3">
                    {errorMessage ? (
                        <div className="rounded-xl border border-error/20 bg-error-container px-4 py-3 text-sm text-on-error-container">
                            {errorMessage}
                        </div>
                    ) : null}
                    {successMessage ? (
                        <div className="rounded-xl border border-secondary/20 bg-secondary/10 px-4 py-3 text-sm text-secondary">
                            {successMessage}
                        </div>
                    ) : null}
                </div>
            ) : null}

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-8 bg-surface-container-lowest rounded-xl border border-surface-variant shadow-[0px_4px_12px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-surface-variant flex items-center justify-between bg-surface">
                        <h3 className="text-[20px] font-semibold text-on-surface leading-7">Existing Users</h3>
                        <button
                            type="button"
                            onClick={loadUsers}
                            className="text-on-surface-variant hover:text-primary transition-colors"
                            title="Refresh users"
                        >
                            <span className="material-symbols-outlined">refresh</span>
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface-container-low border-b border-surface-variant">
                                    <th className="py-3 px-6 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">User</th>
                                    <th className="py-3 px-6 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Role</th>
                                    <th className="py-3 px-6 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">CRM Access ID</th>
                                    <th className="py-3 px-6 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Last Login</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-variant">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={4} className="py-10 px-6 text-center text-sm text-on-surface-variant">
                                            Loading users...
                                        </td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-10 px-6 text-center text-sm text-on-surface-variant">
                                            No users exist yet besides the current setup.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user._id} className="hover:bg-surface-bright transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold text-sm">
                                                        {getInitials(user.name)}
                                                    </div>
                                                    <div>
                                                        <p className="text-[15px] font-semibold text-on-surface">{user.name}</p>
                                                        <p className="text-xs text-on-surface-variant">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getRoleBadge(user.role)}`}>
                                                    {user.role.replace("_", " ")}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-on-surface">
                                                {user.crmAccessId || "--"}
                                            </td>
                                            <td className="py-4 px-6 text-sm text-on-surface-variant">
                                                {formatDate(user.lastLoginAt, "Never logged in")}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t border-surface-variant bg-surface-bright text-sm text-on-surface-variant mt-auto">
                        {isLoading ? "Loading user count..." : `${users.length} real user account${users.length === 1 ? "" : "s"} loaded`}
                    </div>
                </div>

                <div className="xl:col-span-4 bg-surface-container-lowest rounded-xl border border-surface-variant shadow-[0px_8px_24px_rgba(0,0,0,0.04)] h-fit relative overflow-hidden">
                    <div className="h-1 w-full bg-primary absolute top-0 left-0" />
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-10 w-10 rounded-lg bg-primary-fixed flex items-center justify-center text-on-primary-fixed">
                                <span className="material-symbols-outlined">person_add</span>
                            </div>
                            <div>
                                <h3 className="text-[20px] font-semibold text-on-surface leading-tight">Create Admin Account</h3>
                                <p className="text-xs text-on-surface-variant">The backend currently supports creating `admin` users from this screen.</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3 flex flex-col">
                            <div className="flex flex-col space-y-2">
                                <label className="text-xs font-semibold text-on-surface" htmlFor="name">Full Name</label>
                                <input
                                    id="name"
                                    type="text"
                                    value={form.name}
                                    onChange={handleChange("name")}
                                    className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                    required
                                />
                            </div>

                            <div className="flex flex-col space-y-2">
                                <label className="text-xs font-semibold text-on-surface" htmlFor="email">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange("email")}
                                    className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                    required
                                />
                            </div>

                            <div className="flex flex-col space-y-2">
                                <label className="text-xs font-semibold text-on-surface" htmlFor="phoneNumber">Phone Number</label>
                                <input
                                    id="phoneNumber"
                                    type="tel"
                                    value={form.phoneNumber}
                                    onChange={handleChange("phoneNumber")}
                                    className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                />
                            </div>

                            <div className="flex flex-col space-y-2">
                                <label className="text-xs font-semibold text-on-surface" htmlFor="crmAccessId">CRM Access ID (Optional)</label>
                                <input
                                    id="crmAccessId"
                                    type="text"
                                    value={form.crmAccessId}
                                    onChange={handleChange("crmAccessId")}
                                    className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                />
                            </div>

                            <div className="flex flex-col space-y-2">
                                <label className="text-xs font-semibold text-on-surface" htmlFor="tempPassword">Password</label>
                                <input
                                    id="tempPassword"
                                    type="password"
                                    value={form.password}
                                    onChange={handleChange("password")}
                                    className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                    minLength={8}
                                    required
                                />
                            </div>

                            <div className="pt-4 mt-2 border-t border-surface-variant">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-primary hover:bg-surface-tint text-on-primary text-sm py-3 rounded-lg shadow-sm transition-all flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>check_circle</span>
                                    {isSubmitting ? "Creating..." : "Provision Admin Account"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
