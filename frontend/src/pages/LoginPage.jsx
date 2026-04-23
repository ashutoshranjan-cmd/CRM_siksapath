import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { hasToken, isAuthenticated, isBootstrapping, login } = useAuth();

    const redirectTo = location.state?.from?.pathname || "/dashboard";

    if (hasToken && isBootstrapping) {
        return (
            <div className="bg-surface-container-low min-h-screen flex items-center justify-center p-6 font-sans">
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl px-6 py-5 shadow-sm">
                    <p className="text-sm text-on-surface">Restoring your CRM session...</p>
                </div>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to={redirectTo} replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");
        setIsSubmitting(true);

        try {
            await login({
                identifier,
                password,
            });

            navigate(redirectTo, { replace: true });
        } catch (error) {
            setErrorMessage(error.message || "Unable to sign in right now.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-surface-container-low min-h-screen flex items-center justify-center p-6 font-sans">
            <main className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-[0px_8px_24px_rgba(0,0,0,0.12)] border border-outline-variant overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-outline-variant/30 text-center">
                    <h1 className="text-[32px] font-bold text-primary tracking-tight mb-1 leading-[40px]" style={{ letterSpacing: '-0.02em' }}>
                        MarketingCRM
                    </h1>
                    <p className="text-sm text-on-surface-variant">Sign in to your enterprise suite</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
                    {/* Email */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-on-surface-variant" htmlFor="email">
                            Email or User ID
                        </label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">person</span>
                            <input
                                id="email"
                                name="email"
                                type="text"
                                required
                                value={identifier}
                                onChange={(event) => setIdentifier(event.target.value)}
                                placeholder="Enter your email"
                                className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded focus:border-primary focus:ring-2 focus:ring-primary-fixed-dim transition-all text-sm text-on-surface outline-none placeholder:text-outline/60"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-on-surface-variant" htmlFor="password">
                                Password
                            </label>
                            <a href="#" className="text-xs font-semibold text-primary hover:text-primary-container transition-colors">
                                Forgot Password?
                            </a>
                        </div>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">lock</span>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-10 py-2 bg-surface-container-lowest border border-outline-variant rounded focus:border-primary focus:ring-2 focus:ring-primary-fixed-dim transition-all text-sm text-on-surface outline-none placeholder:text-outline/60"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors focus:outline-none"
                            >
                                <span className="material-symbols-outlined text-[20px]">
                                    {showPassword ? 'visibility' : 'visibility_off'}
                                </span>
                            </button>
                        </div>
                    </div>

                    {errorMessage ? (
                        <div className="rounded-lg border border-error/20 bg-error-container px-4 py-3 text-sm text-on-error-container">
                            {errorMessage}
                        </div>
                    ) : null}

                    {/* Remember */}
                    <div className="flex items-center gap-2 mt-1">
                        <input
                            id="remember"
                            name="remember"
                            type="checkbox"
                            className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary-fixed-dim bg-surface-container-lowest cursor-pointer accent-primary"
                        />
                        <label className="text-sm text-on-surface-variant cursor-pointer select-none" htmlFor="remember">
                            Remember me for 30 days
                        </label>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full mt-1 bg-primary text-on-primary py-3 px-6 rounded text-xs font-semibold hover:bg-primary-container transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-primary-fixed-dim focus:outline-none flex justify-center items-center gap-2"
                    >
                        <span>{isSubmitting ? 'Signing in...' : 'Login'}</span>
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                </form>

                {/* Footer */}
                <div className="px-6 pb-6 pt-4 text-center border-t border-outline-variant/30 bg-surface-bright">
                    <p className="text-sm text-on-surface-variant">
                        Need help accessing your account?{' '}
                        <a href="#" className="text-primary hover:underline text-xs font-semibold">
                            Contact Support
                        </a>
                    </p>
                </div>
            </main>
        </div>
    );
}
