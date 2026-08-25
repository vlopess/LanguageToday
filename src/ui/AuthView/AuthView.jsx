import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import Logo from "../../assets/logo_app.png";

export const AuthView = () => {
    const { signIn, signUp, userId } = useAuth();
    const navigate = useNavigate();

    const [mode, setMode] = useState("signin"); // "signin" | "signup"
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    if (userId) return <Navigate to="/dashboard" replace />;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            if (mode === "signin") {
                const { error } = await signIn(email, password);
                if (error) throw error;
                navigate("/dashboard");
            } else {
                const { error } = await signUp(email, password);
                if (error) throw error;
                setSuccess("Account created! Confirm it in your email and sign in.");
                setMode("signin");
            }
        } catch (err) {
            setError(err.message || "Something went wrong. Try again.");
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "w-full px-3.5 py-3 rounded-lg border border-line bg-surface text-sm text-ink placeholder:text-muted/60 focus-ring focus:border-primary transition-colors";

    return (
        <div className="min-h-screen bg-paper flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <div className="flex items-center justify-center gap-2.5 mb-10">
                    <img src={Logo} width={34} alt="LanguageToday"/>
                    <span className="font-display font-bold text-xl tracking-tight">LanguageToday</span>
                </div>

                <div className="bg-surface border border-line rounded-xl p-7">
                    {/* Mode toggle */}
                    <div className="flex bg-sunken rounded-lg p-1 mb-6">
                        {[
                            ["signin", "Sign in"],
                            ["signup", "Create account"],
                        ].map(([value, label]) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => { setMode(value); setError(""); setSuccess(""); }}
                                className={`flex-1 py-2 rounded-md text-[13px] font-medium transition-colors focus-ring ${
                                    mode === value
                                        ? "bg-surface text-ink shadow-none border border-line"
                                        : "text-muted hover:text-ink"
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3.5">
                        <div>
                            <label htmlFor="email" className="block text-[13px] font-medium mb-1.5">Email</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                autoComplete="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-[13px] font-medium mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="At least 6 characters"
                                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className={`${inputClass} pr-11`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors focus-ring"
                                >
                                    {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <p role="alert" className="flex items-start gap-2 text-danger bg-danger-soft border border-danger/20 rounded-lg px-3.5 py-2.5 text-[13px]">
                                <AlertCircle size={15} className="mt-0.5 flex-shrink-0"/>
                                {error}
                            </p>
                        )}
                        {success && (
                            <p className="flex items-start gap-2 text-success bg-success-soft border border-success/20 rounded-lg px-3.5 py-2.5 text-[13px]">
                                <CheckCircle2 size={15} className="mt-0.5 flex-shrink-0"/>
                                {success}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-1 py-3 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors disabled:bg-sunken disabled:text-muted/60 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-ring"
                        >
                            {loading ? (
                                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>
                            ) : (
                                mode === "signin" ? "Sign in" : "Create account"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
