import {Book, Eye, EyeOff, LucideSave, Pin, PinOff, X} from "lucide-react";
import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useContent} from "../../contexts/ContentContext.jsx";

export const StoryView = () => {
    const navigate = useNavigate();
    const { selectedStory, savedStories, setSavedStories } = useContent();
    const [showTranslation, setShowTranslation] = useState(false);
    const [savedPin, setSavedPin] = useState(null);

    useEffect(() => {
        const startPin = () => {
            const hasStory = savedStories.find(e => e.title === selectedStory.title);
            if(hasStory) setSavedPin(selectedStory.title);
        }
        startPin();
    }, []);

    const updatePin = (title) => {
        console.log(title);
        if(title){
            setSavedStories(prev => [...prev, selectedStory]);
            setSavedPin(title);
            return;
        }
        const stories = savedStories.filter(e => e.title !== selectedStory.title);
        setSavedStories(stories);
        setSavedPin(null);
    }


    return (
        <div className="min-h-screen bg-slate-50 flex flex-col animate-in fade-in">
            <header className="p-6 border-b flex justify-between items-center bg-white sticky top-0 z-20 shadow-sm">
                <div className="flex items-center gap-4">
                    <span className="text-4xl bg-slate-50 p-2 rounded-2xl shadow-inner">{selectedStory.icon}</span>
                    <div>
                        <h2 className="font-black text-2xl text-slate-800 tracking-tight">{selectedStory.title}</h2>
                    </div>
                </div>
                <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X className="text-slate-400 w-6 h-6" /></button>
            </header>

            <main className="flex-1 overflow-y-auto md:p-12 max-w-4xl mx-auto w-full">
                <section className="bg-white p-2 md:p-16 rounded-none md:rounded-[4rem] shadow-2xl border border-slate-100 relative overflow-hidden md:h-[100vh]">
                    {/* Header CZ/EN indicators */}
                    <div className={`flex justify-between items-center mb-12`}>
                        <div className={`flex items-center gap-2 ${showTranslation ? 'opacity-40' : 'opacity-100'}`}>
                            <span className={`w-6 h-6 bg-[#D71920] rounded-full flex items-center justify-center text-[10px] text-white font-black`}>CZ</span>
                            <span className="text-xs font-black uppercase">Čeština</span>
                        </div>
                        <div className={`flex items-center gap-2 ${showTranslation ? 'opacity-1000' : 'opacity-40'}`}>
                            <span className="text-xs font-black uppercase">English</span>
                            <span className="w-6 h-6 bg-[#11457E] rounded-full flex items-center justify-center text-[10px] text-white font-black">EN</span>
                        </div>
                    </div>

                    {/* TEXT CONTAINER WITH OVERLAY TRANSITION */}
                    <div className="relative text-2xl font-bold leading-[2] tracking-tight whitespace-pre-line">
                        <div className={`transition-all duration-700 ${showTranslation ? 'opacity-0 scale-95 translate-y-4 pointer-events-none' : 'opacity-100 scale-100 translate-y-0'}`}>
                            {selectedStory.languageText.replace(/\\n/g, '\n')}
                        </div>

                        <div className={`absolute inset-0 transition-all duration-700 ${showTranslation ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-4 pointer-events-none'} text-slate-500 italic`}>
                            {selectedStory.originalText.replace(/\\n/g, '\n')}
                        </div>
                    </div>

                    {/* Background pattern */}
                    <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                        <Book className="w-64 h-64 rotate-12" />
                    </div>
                </section>
            </main>

            <footer className="p-4 border-t bg-white flex flex-col items-center gap-4 sticky bottom-0 shadow-[0_-20px_50px_rgba(0,0,0,0.05)]">
                <div className="gap-4 space-y-4">
                    <button
                        onClick={() => setShowTranslation(!showTranslation)}
                        className={`w-full p-4 max-w-md py-2 rounded-[2.5rem] font-black text-lg shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 ${showTranslation ? 'bg-slate-900 text-white' : 'bg-[#D71920] text-white shadow-red-200'}`}
                    >
                        {showTranslation ? <EyeOff className="w-6 h-6"/> : <Eye className="w-6 h-6"/>}
                        {showTranslation ? "BACK TO CZECH" : "OVERLAY ENGLISH MIRROR"}
                    </button>
                    <button
                        onClick={() => savedPin ? updatePin(null) : updatePin(selectedStory.title)}
                        className={`w-full p-4 max-w-md py-2 rounded-[2.5rem] font-black text-lg shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 ${!savedPin ? 'bg-slate-900 text-white' : 'bg-slate-400 text-white'}`}
                    >
                        {!savedPin ? <Pin className="w-6 h-6"/> : <PinOff className="w-6 h-6"/>}
                        {!savedPin ? "PIN" : "UNPIN"}
                    </button>
                </div>
            </footer>
        </div>
    );
};
