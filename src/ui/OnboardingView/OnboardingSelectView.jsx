import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useContent } from "../../contexts/ContentContext.jsx";
import { generateAndSaveSession } from '../../lib/generateSession.js';

export const OnboardingSelectView = () => {
    const { userId, isReady } = useAuth();
    const { userProfile, setUserProfile, setSessionTasks, setSessionStories, setReviewTasks, setCurrentLanguage } = useContent();
    const navigate = useNavigate();

    const [step, setStep] = useState(1); // 1: language select, 2: profile form
    const [selectedLanguage, setSelectedLanguage] = useState(null); // "czech" | "english"
    const [isGenerating, setIsGenerating] = useState(false);

    // Redirect unauthenticated users to auth
    if (isReady && !userId) return <Navigate to="/auth" replace />;

    const generateDynamicSession = async () => {
        if (!userProfile.name) return;
        setIsGenerating(true);

        if (!import.meta.env.VITE_GROQ_API_KEY) {
            console.warn("No Groq API key found. Using mock data.");
            setUserProfile(prev => ({ ...prev, completedOnboarding: true }));
            setCurrentLanguage(selectedLanguage);
            setTimeout(() => {
                setIsGenerating(false);
                navigate('/dashboard');
            }, 1500);
            return;
        }

        try {
            const { tasks, stories, reviewTasks } = await generateAndSaveSession(
                userId,
                selectedLanguage,
                userProfile
            );

            setSessionTasks(tasks);
            setSessionStories(stories);
            setReviewTasks(reviewTasks);
            setUserProfile(prev => ({ ...prev, completedOnboarding: true }));
            setCurrentLanguage(selectedLanguage);
            navigate('/dashboard');
        } catch (error) {
            console.error('Groq Generation Error:', error);
            if (error.message.includes('rate limit') || error.message.includes('429')) {
                alert('Rate limit exceeded. Please wait a moment and try again.');
            } else {
                alert('Error generating your AI session. Please try again.');
            }
        } finally {
            setIsGenerating(false);
        }
    };

    if (isGenerating) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
                <div className="bg-[#11457E] p-6 rounded-[2.5rem] mb-8 shadow-2xl animate-bounce">
                    <Sparkles className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-3xl font-black text-slate-800 mb-2">Building Your Journey...</h2>
                <p className="text-slate-500 font-bold">Creating exclusive content for {userProfile.level} level</p>
            </div>
        );
    }

    // Step 1: Language Selection
    if (step === 1) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white flex items-center justify-center p-4">
                <div className="w-full max-w-lg">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-black tracking-tighter text-slate-800 mb-2">Choose Your Language</h1>
                        <p className="text-slate-500 font-medium">Select the language you want to learn today</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        {/* Czech Card */}
                        <button
                            onClick={() => setSelectedLanguage('czech')}
                            className={`flex flex-col items-center justify-center p-8 rounded-[2rem] border-2 transition-all cursor-pointer ${
                                selectedLanguage === 'czech'
                                    ? 'border-[#D71920] bg-red-50 shadow-lg shadow-red-100'
                                    : 'border-slate-100 bg-white hover:border-[#D71920]/40 hover:shadow-md'
                            }`}
                        >
                            <span className="text-5xl mb-4">🇨🇿</span>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">ČeštinaToday</h2>
                            <p className="text-xs text-slate-500 font-medium mt-1 text-center">Czech language learning</p>
                            {selectedLanguage === 'czech' && (
                                <div className="mt-3 w-2 h-2 rounded-full bg-[#D71920]" />
                            )}
                        </button>

                        {/* English Card */}
                        <button
                            onClick={() => setSelectedLanguage('english')}
                            className={`flex flex-col items-center justify-center p-8 rounded-[2rem] border-2 transition-all cursor-pointer ${
                                selectedLanguage === 'english'
                                    ? 'border-[#11457E] bg-blue-50 shadow-lg shadow-blue-100'
                                    : 'border-slate-100 bg-white hover:border-[#11457E]/40 hover:shadow-md'
                            }`}
                        >
                            <span className="text-5xl mb-4">🇬🇧</span>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">EnglishToday</h2>
                            <p className="text-xs text-slate-500 font-medium mt-1 text-center">English language learning</p>
                            {selectedLanguage === 'english' && (
                                <div className="mt-3 w-2 h-2 rounded-full bg-[#11457E]" />
                            )}
                        </button>
                    </div>

                    <button
                        onClick={() => selectedLanguage && setStep(2)}
                        disabled={!selectedLanguage}
                        className={`w-full py-4 rounded-2xl font-black text-white transition-all flex items-center justify-center gap-2 ${
                            selectedLanguage
                                ? 'bg-[#11457E] shadow-lg shadow-blue-200 hover:scale-[1.02] active:scale-[0.98]'
                                : 'bg-slate-300 cursor-not-allowed'
                        }`}
                    >
                        Continue →
                    </button>
                </div>
            </div>
        );
    }

    // Step 2: Profile Form
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <button
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 text-slate-500 font-bold text-sm mb-6 hover:text-slate-700 transition-colors"
                >
                    ← Back
                </button>

                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/80 p-8 border border-slate-100">
                    <div className="text-center mb-8">
                        <span className="text-4xl">{selectedLanguage === 'czech' ? '🇨🇿' : '🇬🇧'}</span>
                        <h1 className="text-2xl font-black tracking-tighter text-slate-800 mt-3">
                            {selectedLanguage === 'czech' ? 'ČeštinaToday' : 'EnglishToday'}
                        </h1>
                        <p className="text-slate-500 font-medium text-sm mt-1">Set up your learning profile</p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="text-[10px] font-black text-[#11457E] uppercase tracking-[0.2em] mb-2 block">
                                Your Name
                            </label>
                            <input
                                type="text"
                                value={userProfile.name}
                                onChange={e => setUserProfile({ ...userProfile, name: e.target.value })}
                                className="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-[#11457E] outline-none font-bold transition-colors"
                                placeholder="Ex: Paul"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-[#11457E] uppercase tracking-[0.2em] mb-2 block">
                                    Level
                                </label>
                                <select
                                    value={userProfile.level}
                                    onChange={e => setUserProfile({ ...userProfile, level: e.target.value })}
                                    className="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-[#11457E] outline-none font-bold bg-white transition-colors"
                                >
                                    <option value="A1">A1 (Beginner)</option>
                                    <option value="A2">A2 (Elementary)</option>
                                    <option value="B1">B1 (Intermediate)</option>
                                    <option value="B2">B2 (Upper-Intermediate)</option>
                                    <option value="C1">C1 (Advanced)</option>
                                    <option value="C2">C2 (Proficient)</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-[#11457E] uppercase tracking-[0.2em] mb-2 block">
                                    Daily Goal
                                </label>
                                <select
                                    value={userProfile.dailyTime}
                                    onChange={e => setUserProfile({ ...userProfile, dailyTime: e.target.value })}
                                    className="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-[#11457E] outline-none font-bold bg-white transition-colors"
                                >
                                    <option value="5">5 min</option>
                                    <option value="15">15 min</option>
                                    <option value="30">30 min</option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={generateDynamicSession}
                            disabled={!userProfile.name}
                            className={`w-full font-black py-5 rounded-[2rem] shadow-xl flex items-center justify-center gap-3 transition-transform ${
                                userProfile.name
                                    ? selectedLanguage === 'czech'
                                        ? 'bg-[#D71920] hover:scale-105 shadow-red-100 text-white'
                                        : 'bg-[#11457E] hover:scale-105 shadow-blue-100 text-white'
                                    : 'bg-gray-400 cursor-not-allowed text-white'
                            }`}
                        >
                            GENERATE SESSION <Sparkles className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
