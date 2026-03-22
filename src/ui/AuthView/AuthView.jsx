import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { Sparkles, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import LogoCzech from "../../assets/logo_app.png";

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
                setSuccess("Account created! Check your email to confirm, then sign in.");
                setMode("signin");
            }
        } catch (err) {
            setError(err.message || "Something went wrong. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex flex-col items-center mb-10">
                    <img src={LogoCzech} width={90} alt="LanguageToday" className="mb-4" />
                    <h1 className="text-3xl font-black tracking-tighter text-slate-800">LanguageToday</h1>
                    <p className="text-slate-500 font-medium mt-1 text-sm">Your personal language journey</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/80 p-8 border border-slate-100">
                    {/* Mode Toggle */}
                    <div className="flex bg-slate-100 rounded-2xl p-1 mb-8">
                        <button
                            onClick={() => { setMode("signin"); setError(""); setSuccess(""); }}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-black tracking-wide transition-all ${
                                mode === "signin"
                                    ? "bg-white text-[#11457E] shadow-sm"
                                    : "text-slate-500"
                            }`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => { setMode("signup"); setError(""); setSuccess(""); }}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-black tracking-wide transition-all ${
                                mode === "signup"
                                    ? "bg-white text-[#11457E] shadow-sm"
                                    : "text-slate-500"
                            }`}
                        >
                            Create Account
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                className="w-full pl-11 pr-4 py-4 border-2 border-slate-100 rounded-2xl font-medium text-sm focus:border-[#11457E] focus:outline-none transition-colors"
                            />
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full pl-11 pr-12 py-4 border-2 border-slate-100 rounded-2xl font-medium text-sm focus:border-[#11457E] focus:outline-none transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(v => !v)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        {/* Error / Success */}
                        {error && (
                            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm font-medium">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-sm font-medium">
                                <Sparkles className="w-4 h-4 flex-shrink-0" />
                                {success}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#11457E] text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-200 hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                mode === "signin" ? "Sign In" : "Create Account"
                            )}
                        </button>
                    </form>

                </div>

            </div>
        </div>
    );
};
