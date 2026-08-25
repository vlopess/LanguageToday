import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Search } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useContent } from "../../contexts/ContentContext.jsx";
import { generateAndSaveSession } from "../../lib/generateSession.js";
import { saveDailyStories } from "../../lib/db.js";
import { saveSession, setCurrentSessionId } from "../../lib/sessions.js";
import { SUPPORT_LANGUAGES, DEFAULT_SUPPORT_LANGUAGE } from "../../lib/languages.js";

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
        languages,
    } = useContent();

    const navigate = useNavigate();
    const catalog = languages.length ? languages : [];

    const [step, setStep]           = useState(1);
    const [language, setLanguage]   = useState(userProfile?.currentLanguage || '');
    const [supportLanguage, setSupportLanguage] = useState(userProfile?.supportLanguage || DEFAULT_SUPPORT_LANGUAGE);
    const [search, setSearch]       = useState('');
    const [name, setName]           = useState(userProfile?.name || '');
    const [level, setLevel]         = useState(userProfile?.level || 'A1');
    const [dailyTime, setDailyTime] = useState(userProfile?.dailyTime || '15');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError]         = useState(null);

    const selectedMeta = catalog.find(l => l.code === language);

    const filteredCatalog = search.trim()
        ? catalog.filter(l =>
            l.name.toLowerCase().includes(search.trim().toLowerCase()) ||
            l.nativeName.toLowerCase().includes(search.trim().toLowerCase()))
        : catalog;

    const handleGenerate = async () => {
        if (!name.trim() || !language) return;
        setIsGenerating(true);
        setError(null);

        const profile = { name: name.trim(), level, dailyTime, completedOnboarding: true, supportLanguage };

        try {
            setCurrentLanguage(language);
            setUserProfile(profile);

            const { tasks, stories, reviewTasks } = await generateAndSaveSession(
                userId,
                language,
                profile,
                supportLanguage,
            );

            setSessionTasks(tasks);
            setSessionStories(stories);
            setReviewTasks(reviewTasks);

            // Save as a session in the sessions array
            const session = {
                id: `sess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                language,
                level,
                createdAt: Date.now(),
                tasks,
                reviewTasks,
                stories,
            };
            saveSession(session);
            setCurrentSessionId(session.id);
            setNeedsSessionGeneration(false);

            if (stories.length) {
                saveDailyStories(language, stories);
            }

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
            <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
                <span className="w-8 h-8 border-2 border-primary/25 border-t-primary rounded-full animate-spin mb-6"/>
                <h2 className="font-display font-bold text-xl tracking-tight mb-1">
                    Preparing your session…
                </h2>
                <p className="text-muted text-sm">Generating today's activities for {selectedMeta?.name || language}.</p>
            </div>
        );
    }

    /* ── Step 1: Language ── */
    if (step === 1) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-md">
                    <div className="mb-8">
                        <p className="text-[13px] text-muted mb-2">
                            {userProfile?.name ? `Welcome back, ${userProfile.name}` : 'Welcome'}
                        </p>
                        <h1 className="font-display font-bold tracking-tight text-3xl leading-tight">
                            Which language do
                            <br/>
                            you want to study?
                        </h1>
                    </div>

                    {catalog.length > 4 && (
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search languages…"
                            className="w-full px-3.5 py-2.5 rounded-lg border border-line bg-surface outline-none text-sm focus-ring focus:border-primary transition-colors mb-4"
                        />
                    )}

                    <div className={`grid grid-cols-3 gap-2 mb-6 ${catalog.length > 6 ? 'max-h-[320px] overflow-y-auto pr-0.5' : ''}`}>
                        {filteredCatalog.map(({ code, nativeName, flagEmoji }) => {
                            const active = language === code;
                            return (
                                <button key={code} onClick={() => setLanguage(code)}
                                    aria-pressed={active}
                                    className={`flex flex-col items-center justify-center gap-1.5 p-4 rounded-xl border bg-surface transition-colors focus-ring ${
                                        active
                                            ? 'border-primary ring-1 ring-primary'
                                            : 'border-line hover:border-muted/50'
                                    }`}>
                                    <span className="text-2xl leading-none">{flagEmoji}</span>
                                    <span className="text-[13px] font-medium text-ink text-center leading-tight">{nativeName}</span>
                                </button>
                            );
                        })}
                    </div>

                    <button onClick={() => language && setStep(2)} disabled={!language}
                        className="w-full py-3 rounded-lg text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors focus-ring
                                   bg-primary text-white hover:bg-primary-dark disabled:bg-sunken disabled:text-muted/60 disabled:cursor-not-allowed">
                        Continue
                        <ChevronRight size={16}/>
                    </button>
                </div>
            </div>
        );
    }

    /* ── Step 2: Profile ── */
    const inputClass =
        "w-full px-3.5 py-3 rounded-lg border border-line bg-surface text-sm text-ink placeholder:text-muted/60 focus-ring focus:border-primary transition-colors";
    const labelClass = "block text-[13px] font-medium mb-1.5";

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md">

                <button onClick={() => setStep(1)}
                    className="text-[13px] text-muted hover:text-ink transition-colors mb-5 focus-ring">
                    ← Back
                </button>

                <div className="bg-surface border border-line rounded-xl p-7">
                    <div className="mb-7">
                        <p className="text-[13px] text-muted mb-1">
                            {selectedMeta?.nativeName} {selectedMeta ? `· ${level}` : ''}
                        </p>
                        <h2 className="font-display font-bold tracking-tight text-2xl leading-tight">
                            Your profile
                        </h2>
                    </div>

                    <div className="space-y-5">
                        {/* Name */}
                        <div>
                            <label htmlFor="ls-name" className={labelClass}>Seu nome</label>
                            <input
                                id="ls-name"
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className={inputClass}
                                placeholder="What should we call you"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {/* Level */}
                            <div>
                                <label htmlFor="ls-level" className={labelClass}>Level</label>
                                <select
                                    id="ls-level"
                                    value={level}
                                    onChange={e => setLevel(e.target.value)}
                                    className={`${inputClass} appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2368737D%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22/%3E%3C/svg%3E')] bg-no-repeat bg-[right_0.75rem_center] pr-9`}>
                                    {LEVELS.map(l => (
                                        <option key={l} value={l}>{l}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Daily time */}
                            <div>
                                <label htmlFor="ls-time" className={labelClass}>Tempo por dia</label>
                                <select
                                    id="ls-time"
                                    value={dailyTime}
                                    onChange={e => setDailyTime(e.target.value)}
                                    className={`${inputClass} appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2368737D%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22/%3E%3C/svg%3E')] bg-no-repeat bg-[right_0.75rem_center] pr-9`}>
                                    {TIMES.map(t => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Support language (instruction language) */}
                        <fieldset>
                            <legend className={labelClass}>Explanations in</legend>
                            <div className="grid grid-cols-3 gap-2">
                                {SUPPORT_LANGUAGES.map(({ code, name, flagEmoji }) => {
                                    const active = supportLanguage === code;
                                    return (
                                        <button key={code} type="button" onClick={() => setSupportLanguage(code)}
                                            aria-pressed={active}
                                            className={`flex items-center justify-center gap-2 py-2.5 px-2 rounded-lg border text-[13px] font-medium transition-colors focus-ring ${
                                                active
                                                    ? 'border-primary text-primary bg-primary-soft'
                                                    : 'border-line text-muted hover:border-muted/50'
                                            }`}>
                                            <span>{flagEmoji}</span>
                                            {name}
                                        </button>
                                    );
                                })}
                            </div>
                        </fieldset>
                    </div>

                    {error && (
                        <p role="alert" className="mt-4 text-danger bg-danger-soft border border-danger/20 rounded-lg px-3.5 py-2.5 text-[13px]">
                            {error}
                        </p>
                    )}

                    <button
                        onClick={handleGenerate}
                        disabled={!name.trim()}
                        className="w-full mt-7 py-3 rounded-lg text-sm font-semibold transition-colors focus-ring
                                   bg-primary text-white hover:bg-primary-dark disabled:bg-sunken disabled:text-muted/60 disabled:cursor-not-allowed">
                        Generate first session
                    </button>
                </div>
            </div>
        </div>
    );
};
