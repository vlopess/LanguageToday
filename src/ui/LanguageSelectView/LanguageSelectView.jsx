import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Sparkles } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useContent } from "../../contexts/ContentContext.jsx";
import { generateAndSaveSession } from "../../lib/generateSession.js";
import LogoCzech from "../../assets/logo.png";
import LogoEnglish from "../../assets/logo_en.png";
import LogoSpanish from "../../assets/logo_espanhol.png";


const display = { fontFamily: "'Bricolage Grotesque', sans-serif" };
const body    = { fontFamily: "'DM Sans', sans-serif" };

const LEVELS = ['A1','A2','B1','B2','C1','C2'];
const TIMES  = [
    { value: '5',  label: '5 min'  },
    { value: '15', label: '15 min' },
    { value: '30', label: '30 min' },
];

export const LanguageSelectView = () => {
    const { userId } = useAuth();
    const {
        userProfile,
        setUserProfile,
        setCurrentLanguage,
        setSessionTasks,
        setSessionStories,
        setReviewTasks,
        setNeedsSessionGeneration,
    } = useContent();

    const navigate = useNavigate();

    const [step, setStep]           = useState(1);
    const [language, setLanguage]   = useState(userProfile?.currentLanguage || 'english');
    const [name, setName]           = useState(userProfile?.name || '');
    const [level, setLevel]         = useState(userProfile?.level || 'A1');
    const [dailyTime, setDailyTime] = useState(userProfile?.dailyTime || '15');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError]         = useState(null);

    const accent = language === 'czech' ? '#D71920' : language === 'spanish' ? '#F5A623' : '#11457E';

    const handleGenerate = async () => {
        if (!name.trim()) return;
        setIsGenerating(true);
        setError(null);

        const profile = { name: name.trim(), level, dailyTime, completedOnboarding: true };

        try {
            setCurrentLanguage(language);
            setUserProfile(profile);

            const { tasks, stories, reviewTasks } = await generateAndSaveSession(
                userId,
                language,
                profile,
            );

            setSessionTasks(tasks);
            setSessionStories(stories);
            setReviewTasks(reviewTasks);
            setNeedsSessionGeneration(false);
            navigate('/dashboard');
        } catch (err) {
            console.error('[LanguageSelect] generation failed:', err);
            setError('Failed to generate session. Please try again.');
            setIsGenerating(false);
        }
    };

    /* ── Loading screen ── */
    if (isGenerating) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center"
                style={{ background: '#F7F5F0', ...body }}>
                <div className="p-6 rounded-[2.5rem] mb-8 shadow-2xl animate-bounce"
                    style={{ background: accent }}>
                    <Sparkles className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-black text-slate-800 mb-2" style={display}>
                    Building Your Session…
                </h2>
                <p className="text-slate-500 font-medium">Generating today's personalised content</p>
            </div>
        );
    }

    /* ── Step 1: Language ── */
    if (step === 1) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6"
                style={{ background: '#F7F5F0', ...body }}>
                <div className="w-full max-w-md">
                    <div className="text-center mb-10">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] mb-2">
                            {userProfile?.name ? `Welcome back, ${userProfile.name}` : 'Welcome'}
                        </p>
                        <h1 className="text-3xl font-black text-slate-800 leading-tight" style={display}>
                            What do you want<br />to study today?
                        </h1>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-8">
                        {[
                            { value: 'czech',   icon: LogoCzech,   label: 'Czech',   color: '#D71920' },
                            { value: 'english', icon: LogoEnglish, label: 'English', color: '#11457E' },
                            { value: 'spanish', icon: LogoSpanish, label: 'Spanish', color: '#F5A623' },
                        ].map(({ value, icon, label, color }) => {
                            const active = language === value;
                            return (
                                <button key={value} onClick={() => setLanguage(value)}
                                    className="flex flex-col items-center justify-center p-5 rounded-[2rem] border-2 bg-white transition-all duration-200"
                                    style={{
                                        borderColor: active ? color : '#E5E0D8',
                                        boxShadow: active ? `0 8px 24px ${color}25` : 'none',
                                    }}>
                                    <img src={icon} alt="icon"/>
                                    <span className="text-sm font-black text-slate-800" style={display}>{label}</span>
                                    {active && <div className="mt-2 w-2 h-2 rounded-full" style={{ background: color }} />}
                                </button>
                            );
                        })}
                    </div>

                    <button onClick={() => setStep(2)}
                        className="w-full py-4 rounded-2xl font-black text-white text-sm uppercase tracking-widest
                                   flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                        style={{ background: accent }}>
                        Continue
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    }

    /* ── Step 2: Profile card ── */
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6"
            style={{ background: '#F7F5F0', ...body }}>
            <div className="w-full max-w-md">

                <button onClick={() => setStep(1)}
                    className="flex items-center gap-1 text-slate-400 font-bold text-sm mb-6 hover:text-slate-600 transition-colors">
                    ← Back
                </button>

                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-[#E5E0D8]">
                    <div className="text-center mb-8 flex flex-col items-center">
                        <img src={language === 'czech' ? LogoCzech : language === 'spanish' ? LogoSpanish : LogoEnglish} alt="icon" width={10}/>
                        <h2 className="text-xl font-black text-slate-800 mt-3" style={display}>
                            Your Profile
                        </h2>
                        <p className="text-slate-400 text-sm font-medium mt-1">Confirm your details for today</p>
                    </div>

                    <div className="space-y-5">
                        {/* Name */}
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 block"
                                style={{ color: accent }}>
                                Your Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full p-4 rounded-2xl border-2 border-[#E5E0D8] outline-none font-bold text-slate-800 transition-colors"
                                style={{ fontFamily: body.fontFamily }}
                                onFocus={e => e.target.style.borderColor = accent}
                                onBlur={e => e.target.style.borderColor = '#E5E0D8'}
                                placeholder="Your name"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Level */}
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 block"
                                    style={{ color: accent }}>
                                    Level
                                </label>
                                <select
                                    value={level}
                                    onChange={e => setLevel(e.target.value)}
                                    className="w-full p-4 rounded-2xl border-2 border-[#E5E0D8] outline-none font-bold bg-white text-slate-800 transition-colors"
                                    style={{ fontFamily: body.fontFamily }}>
                                    {LEVELS.map(l => (
                                        <option key={l} value={l}>{l}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Daily time */}
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 block"
                                    style={{ color: accent }}>
                                    Daily Goal
                                </label>
                                <select
                                    value={dailyTime}
                                    onChange={e => setDailyTime(e.target.value)}
                                    className="w-full p-4 rounded-2xl border-2 border-[#E5E0D8] outline-none font-bold bg-white text-slate-800 transition-colors"
                                    style={{ fontFamily: body.fontFamily }}>
                                    {TIMES.map(t => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm font-medium text-center mt-4">{error}</p>
                    )}

                    <button
                        onClick={handleGenerate}
                        disabled={!name.trim()}
                        className="w-full mt-8 py-4 rounded-2xl font-black text-white text-sm uppercase tracking-widest
                                   flex items-center justify-center gap-2 transition-all shadow-lg"
                        style={{
                            background: name.trim() ? accent : '#CBD5E1',
                            cursor: name.trim() ? 'pointer' : 'not-allowed',
                        }}>
                        <Sparkles className="w-4 h-4" />
                        Generate Session
                    </button>
                </div>
            </div>
        </div>
    );
};
