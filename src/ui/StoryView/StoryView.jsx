import { Eye, EyeOff, Pin, PinOff, ArrowLeft } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContent } from "../../contexts/ContentContext.jsx";
import { saveStory, removeSavedStory } from "../../lib/db.js";
import { useAuth } from "../../contexts/AuthContext.jsx";

export const StoryView = () => {
    const navigate = useNavigate();
    const { userId } = useAuth();
    const { selectedStory, savedStories, setSavedStories, currentLanguage } = useContent();
    const [showTranslation, setShowTranslation] = useState(false);
    const [savedPin, setSavedPin] = useState(null);

    useEffect(() => {
        const hasStory = savedStories.find(e => e.title === selectedStory.title);
        if (hasStory) setSavedPin(selectedStory.title);
    }, []);

    const updatePin = (title) => {
        if (title) {
            setSavedStories(prev => [...prev, selectedStory]);
            setSavedPin(title);
            saveStory(userId, selectedStory, currentLanguage);
            return;
        }
        setSavedStories(prev => prev.filter(e => e.title !== selectedStory.title));
        setSavedPin(null);
        removeSavedStory(userId, selectedStory.title);
    };

    const isCzech = currentLanguage === 'czech';
    // czech → translate to English | english → translate to Portuguese
    const originalLabel = isCzech ? 'Cestina' : 'English';
    const translationLabel = isCzech ? 'English' : 'Portugues';

    return (
        <div className="min-h-screen flex flex-col" style={{ background: '#F7F5F0', fontFamily: "'DM Sans', sans-serif" }}>

            {/* Header */}
            <header className="sticky top-0 z-20 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-semibold"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>

                <div className="flex-1 mx-4 min-w-0">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-0.5">
                        {isCzech ? 'Czech Story' : 'English Story'}
                    </p>

                    <h2 className="font-black text-sm text-slate-800 truncate" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                        {selectedStory.title}
                    </h2>
                </div>

                <button
                    onClick={() => savedPin ? updatePin(null) : updatePin(selectedStory.title)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border"
                    style={{
                        background: savedPin ? '#11457E' : 'white',
                        color: savedPin ? 'white' : '#64748b',
                        borderColor: savedPin ? '#11457E' : '#e2e8f0',
                    }}
                >
                    {savedPin ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                    {savedPin ? 'Saved' : 'Save'}
                </button>
            </header>

            {/* Language toggle bar */}
            <div className="flex bg-white border-b border-slate-100">
                <button
                    onClick={() => setShowTranslation(false)}
                    className="flex-1 py-2.5 text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                    style={{
                        color: !showTranslation ? (isCzech ? '#D71920' : '#11457E') : '#94a3b8',
                        borderBottom: !showTranslation ? `2px solid ${isCzech ? '#D71920' : '#11457E'}` : '2px solid transparent',
                    }}
                >
                    {originalLabel}
                </button>
                <button
                    onClick={() => setShowTranslation(true)}
                    className="flex-1 py-2.5 text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                    style={{
                        color: showTranslation ? '#11457E' : '#94a3b8',
                        borderBottom: showTranslation ? '2px solid #11457E' : '2px solid transparent',
                    }}
                >
                    {translationLabel}
                </button>
            </div>

            {/* Content */}
            <main className="flex-1 overflow-y-auto px-4 py-6 max-w-2xl mx-auto w-full">
                <div className="relative">
                    <div
                        className="transition-all duration-500"
                        style={{
                            opacity: showTranslation ? 0 : 1,
                            transform: showTranslation ? 'translateY(8px)' : 'translateY(0)',
                            position: showTranslation ? 'absolute' : 'relative',
                            inset: showTranslation ? 0 : 'auto',
                            pointerEvents: showTranslation ? 'none' : 'auto',
                        }}
                    >
                        <p className="text-base leading-8 text-slate-800 whitespace-pre-line font-medium">
                            {selectedStory.languageText.replace(/\\n/g, '\n')}
                        </p>
                    </div>

                    <div
                        className="transition-all duration-500"
                        style={{
                            opacity: showTranslation ? 1 : 0,
                            transform: showTranslation ? 'translateY(0)' : 'translateY(8px)',
                            position: showTranslation ? 'relative' : 'absolute',
                            inset: showTranslation ? 'auto' : 0,
                            pointerEvents: showTranslation ? 'auto' : 'none',
                        }}
                    >
                        <p className="text-base leading-8 text-slate-500 italic whitespace-pre-line font-medium">
                            {selectedStory.originalText.replace(/\\n/g, '\n')}
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer toggle */}
            <footer className="sticky bottom-0 bg-white border-t border-slate-100 p-4">
                <button
                    onClick={() => setShowTranslation(prev => !prev)}
                    className="w-full max-w-md mx-auto flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-black uppercase tracking-widest text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                    style={{ background: showTranslation ? '#475569' : (isCzech ? '#D71920' : '#11457E'), display: 'flex' }}
                >
                    {showTranslation ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showTranslation ? 'Hide translation' : 'Show translation'}
                </button>
            </footer>
        </div>
    );
};
