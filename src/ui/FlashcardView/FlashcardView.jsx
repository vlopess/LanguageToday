import {useNavigate} from "react-router-dom";
import {useState} from "react";
import {useContent} from "../../contexts/ContentContext.jsx";
import {ChevronRight, Trophy, X} from "lucide-react";

export const FlasCardView = () => {
    const navigate = useNavigate();
    const [lessonComplete, setLessonComplete] = useState(false);
    const [isReviewMode, setIsReviewMode] = useState(true);
    const [showAnswer, setShowAnswer] = useState(false);
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);

    const {reviewTasks} = useContent();
    const task = reviewTasks[currentTaskIndex];
    return (
        <div className="min-h-screen flex flex-col md:p-6 bg-slate-50">
            <div className="max-w-2xl mx-auto w-full bg-white md:rounded-[3.5rem] p-10 shadow-2xl border border-slate-100 flex-1 flex flex-col animate-in slide-in-from-right">
                <header className="mb-10 flex items-center justify-between">
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border bg-red-50 text-[#D71920] border-red-100`}>
              Flashcard Review
            </span>
                    <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-50 rounded-xl"><X className="text-slate-300 w-6 h-6" /></button>
                </header>

                {lessonComplete || !task ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <Trophy className="w-20 h-20 text-green-500 animate-bounce mb-6"/>
                        <h2 className="text-4xl font-black text-slate-800">Done!</h2>
                        <button onClick={() => navigate('/dashboard')} className="bg-[#11457E] text-white px-12 py-5 rounded-3xl mt-8 font-black">BACK TO HOME</button>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col">

                        <div className="flex-1 flex flex-col items-center justify-center">
                            {/* FLASHCARD LOGIC */}
                            {isReviewMode ? (
                                <div className="w-full flex flex-col items-center">
                                    <div
                                        onClick={() => setShowAnswer(!showAnswer)}
                                        className="w-full min-h-[400px] relative transition-transform duration-700"
                                        style={{
                                            transformStyle: 'preserve-3d',
                                            transform: showAnswer ? 'rotateY(180deg)' : 'rotateY(0deg)'
                                        }}
                                    >
                                        {/* Front: English (Visible by Default) */}
                                        <div
                                            className="absolute inset-0 bg-white border-4 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center shadow-sm"
                                            style={{ backfaceVisibility: 'hidden', zIndex: showAnswer ? 0 : 2 }}
                                        >
                                            <span className="text-8xl mb-6">{task.emoji || '🇺🇸'}</span>
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Translate from English</span>
                                            <h3 className="text-5xl font-black text-slate-800 tracking-tighter text-center px-6">{task.prompt}</h3>
                                            <p className="mt-10 text-[10px] font-black text-blue-400 uppercase tracking-widest animate-pulse">Tap to Flip</p>
                                        </div>

                                        {/* Back: Czech (Hidden by Default) */}
                                        <div
                                            className="absolute inset-0 bg-slate-950 rounded-[3rem] flex flex-col items-center justify-center p-10 text-center shadow-2xl border-4 border-slate-800"
                                            style={{
                                                backfaceVisibility: 'hidden',
                                                transform: 'rotateY(180deg)',
                                                zIndex: showAnswer ? 2 : 0
                                            }}
                                        >
                                            <span className="text-4xl mb-6">{task.emoji || '🇨🇿'}</span>
                                            <h4 className="text-white text-5xl font-black tracking-tight mb-6">{task.answer}</h4>
                                            <div className="w-16 h-1 bg-[#D71920] mb-6 rounded-full"></div>
                                            <p className="text-slate-400 font-bold leading-relaxed">{task.explanation}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* Standard Active Learning (Recall/Sentence/Feynman) */
                                <div className="w-full">
                                    <h3 className="text-3xl font-black text-slate-800 mb-10 text-center">{task.prompt}</h3>
                                    {task.type === 'active-recall' && (
                                        <div className="flex flex-col items-center">
                                            {!showAnswer ? (
                                                <button onClick={() => setShowAnswer(true)} className="w-full py-20 border-4 border-dashed border-slate-100 rounded-[3rem] text-slate-300 font-black">Think and Reveal</button>
                                            ) : (
                                                <div className="text-center animate-in zoom-in">
                                                    <div className="text-6xl font-black text-[#11457E] mb-2">{task.answer}</div>
                                                    <p className="text-slate-400 italic mb-8 font-bold">[{task.phonetic}]</p>
                                                    <div className="bg-slate-50 p-8 rounded-3xl border-l-[10px] border-[#D71920] text-left">
                                                        <p className="text-slate-600 font-bold">{task.explanation}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {showAnswer && (
                            <button
                                onClick={() => {
                                    setShowAnswer(false);
                                    setTimeout(() => {
                                        if(currentTaskIndex < reviewTasks.length - 1) {
                                            setCurrentTaskIndex(currentTaskIndex + 1);
                                        } else {
                                            setLessonComplete(true);
                                        }
                                    }, 50);
                                }}
                                className="mt-12 w-full bg-[#11457E] text-white font-black py-6 rounded-3xl shadow-xl flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                NEXT WORD <ChevronRight className="w-7 h-7"/>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}