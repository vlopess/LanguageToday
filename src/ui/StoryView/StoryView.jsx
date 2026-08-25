import { Eye, EyeOff, Pin, PinOff, ArrowLeft } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContent } from "../../contexts/ContentContext.jsx";
import { saveStory, removeSavedStory } from "../../lib/db.js";
import { useAuth } from "../../contexts/AuthContext.jsx";

export const StoryView = () => {
    const navigate = useNavigate();
    const { userId } = useAuth();
    const { selectedStory, savedStories, setSavedStories, currentLanguage, languageMeta, userProfile } = useContent();
    const [showTranslation, setShowTranslation] = useState(false);
    const [savedPin, setSavedPin] = useState(null);

    useEffect(() => {
        if (!selectedStory) {
            navigate('/dashboard');
            return;
        }
        const hasStory = savedStories.find(e => e.title === selectedStory.title);
        if (hasStory) setSavedPin(selectedStory.title);
    }, []);

    if (!selectedStory) return null;

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

    // Labels come from the language catalog + profile support language
    const langName = languageMeta?.name || '';
    const supportLabels = {
        portuguese: 'Português',
        english: 'English',
        spanish: 'Español',
    };
    const originalLabel = langName || 'Original';
    const translationLabel = supportLabels[userProfile?.supportLanguage] || 'Translation';

    const tabClass = (active) =>
        `flex-1 py-3 text-[13px] font-medium transition-colors border-b-2 -mb-px focus-ring ${
            active
                ? 'text-primary border-primary'
                : 'text-muted border-transparent hover:text-ink'
        }`;

    return (
        <div className="min-h-screen flex flex-col">

            {/* Header */}
            <header className="sticky top-0 z-20 bg-surface border-b border-line px-4 sm:px-5 h-14 flex items-center justify-between">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-1.5 text-muted hover:text-ink transition-colors text-[13px] font-medium focus-ring"
                >
                    <ArrowLeft size={15}/>
                    Back
                </button>

                <h2 className="font-display font-bold tracking-tight text-sm truncate max-w-[50%] mx-auto">
                    {selectedStory.title}
                </h2>

                <button
                    onClick={() => savedPin ? updatePin(null) : updatePin(selectedStory.title)}
                    aria-pressed={!!savedPin}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors border focus-ring ${
                        savedPin
                            ? 'bg-primary text-white border-primary'
                            : 'bg-surface text-muted border-line hover:border-muted/50 hover:text-ink'
                    }`}
                >
                    {savedPin ? <PinOff size={14}/> : <Pin size={14}/>}
                    {savedPin ? 'Saved' : 'Save'}
                </button>
            </header>

            {/* Language toggle bar */}
            <div className="flex px-4 sm:px-5 bg-surface border-b border-line">
                <button
                    onClick={() => setShowTranslation(false)}
                    className={tabClass(!showTranslation)}
                >
                    {originalLabel}
                </button>
                <button
                    onClick={() => setShowTranslation(true)}
                    className={tabClass(showTranslation)}
                >
                    {translationLabel}
                </button>
            </div>

            {/* Content */}
            <main className="flex-1 overflow-y-auto px-5 py-8 max-w-2xl mx-auto w-full">
                <div className="relative">
                    <div
                        className="transition-all duration-300"
                        style={{
                            opacity: showTranslation ? 0 : 1,
                            transform: showTranslation ? 'translateY(8px)' : 'translateY(0)',
                            position: showTranslation ? 'absolute' : 'relative',
                            inset: showTranslation ? 0 : 'auto',
                            pointerEvents: showTranslation ? 'none' : 'auto',
                        }}
                    >
                        <p className="font-serif text-[17px] leading-[1.9] whitespace-pre-line">
                            {selectedStory.languageText.replace(/\\n/g, '\n')}
                        </p>
                    </div>

                    <div
                        className="transition-all duration-300"
                        style={{
                            opacity: showTranslation ? 1 : 0,
                            transform: showTranslation ? 'translateY(0)' : 'translateY(8px)',
                            position: showTranslation ? 'relative' : 'absolute',
                            inset: showTranslation ? 'auto' : 0,
                            pointerEvents: showTranslation ? 'auto' : 'none',
                        }}
                    >
                        <p className="text-[15px] leading-[1.9] text-muted italic whitespace-pre-line">
                            {selectedStory.originalText.replace(/\\n/g, '\n')}
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer toggle */}
            <footer className="sticky bottom-0 bg-surface border-t border-line p-4">
                <button
                    onClick={() => setShowTranslation(prev => !prev)}
                    className="w-full max-w-md mx-auto flex items-center justify-center gap-2 py-3 rounded-lg
                               text-sm font-medium bg-ink text-paper hover:bg-black transition-colors focus-ring"
                >
                    {showTranslation ? <EyeOff size={15}/> : <Eye size={15}/>}
                    {showTranslation ? 'Hide translation' : 'Show translation'}
                </button>
            </footer>
        </div>
    );
};
