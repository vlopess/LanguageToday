import {CheckCircle2, ChevronRight, Trophy, Volume2, X} from "lucide-react";
import React, {useState} from "react";
import {useContent} from "../../contexts/ContentContext.jsx";
import {useNavigate} from "react-router-dom";

export const LessonModeView = () => {
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [builderSelection, setBuilderSelection] = useState([]);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [feynmanInput, setFeynmanInput] = useState("");
    const navigate = useNavigate();
    const { sessionTasks } = useContent();

    const task = sessionTasks[currentTaskIndex];
    if (lessonComplete) return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-10 text-center animate-in fade-in duration-500">
            <div className="bg-green-50 p-10 rounded-[3rem] mb-6"><Trophy className="w-24 h-24 text-green-500 animate-bounce" /></div>
            <h2 className="text-5xl font-black text-slate-800 mb-4 tracking-tighter">Vynikající!</h2>
            <p className="text-slate-500 font-bold mb-10">Você completou a jornada de hoje.</p>
            <button onClick={() => navigate('/dashboard')} className="bg-[#11457E] text-white px-16 py-6 rounded-3xl font-black text-xl shadow-xl shadow-blue-100 hover:scale-105 active:scale-95 transition-all">VOLTAR AO INÍCIO</button>
        </div>
    );

    const validateSentence = () => {
        const currentOrder = builderSelection.map(s => s.word);
        if (JSON.stringify(currentOrder) === JSON.stringify(task.correctOrder)) {
            setShowAnswer(true);
        } else {
            alert("Not quite right! Try a different order.");
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:p-6 bg-slate-50">
            <div
                className="max-w-2xl mx-auto w-full bg-white md:rounded-[3.5rem] p-10 shadow-2xl border border-slate-100 flex-1 flex flex-col animate-in slide-in-from-right duration-500">
                <header className="mb-10 flex items-center justify-between">
            <span
                className="bg-blue-50 text-[#11457E] px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
              {task?.type?.replace('-', ' ') || 'Exercise'}
            </span>
                    <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-50 rounded-xl"><X
                        className="text-slate-300 w-6 h-6"/></button>
                </header>

                {lessonComplete || !task ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <div className="bg-green-50 p-8 rounded-[3rem] mb-6 shadow-xl animate-bounce"><Trophy
                            className="w-20 h-20 text-green-500"/></div>
                        <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tighter">Vynikající!</h2>
                        <p className="text-slate-500 font-bold mb-8">Lesson successfully completed.</p>
                        <button onClick={() => navigate('/dashboard')}
                                className="bg-[#11457E] text-white px-12 py-5 rounded-3xl font-black shadow-xl">GO TO
                            DASHBOARD
                        </button>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col">
                        <h3 className="text-3xl font-black text-slate-800 mb-10 leading-tight tracking-tighter">{task.prompt}</h3>

                        <div className="flex-1 flex flex-col items-center justify-center">
                            {/* 1. ACTIVE RECALL */}
                            {task.type === 'active-recall' && (
                                <div className="w-full">
                                    {!showAnswer ? (
                                        <button onClick={() => setShowAnswer(true)}
                                                className="w-full py-20 border-4 border-dashed border-slate-100 rounded-[3rem] text-slate-300 font-black uppercase tracking-widest hover:border-[#11457E]/30 hover:bg-slate-50 transition-all">Recall
                                            and Reveal</button>
                                    ) : (
                                        <div className="text-center animate-in zoom-in">
                                            <div
                                            className="text-5xl font-black text-[#11457E] mb-2 tracking-tighter">{task.answer}</div>
                                            <p className="text-slate-400 italic mb-8 font-bold">[{task.phonetic || ''}]</p>
                                            <div
                                                className="bg-slate-50 p-8 rounded-3xl border-l-[10px] border-[#D71920] text-left">
                                                <p className="text-slate-600 font-bold leading-relaxed">{task.explain}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 2. SENTENCE BUILDER */}
                            {task.type === 'sentence-builder' && (
                                <div className="w-full space-y-6">
                                    <div
                                        className="min-h-[100px] bg-slate-50 rounded-[2rem] p-6 border-2 border-dashed border-slate-200 flex flex-wrap gap-3 items-center justify-center shadow-inner">
                                        {builderSelection.map((s) => (
                                            <button
                                                key={s.id}
                                                onClick={() => setBuilderSelection(builderSelection.filter(item => item.id !== s.id))}
                                                className="bg-white px-5 py-2 rounded-xl shadow-sm font-bold text-blue-600 border border-slate-100 animate-in fade-in"
                                            >
                                                {String(s.word)}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex flex-wrap gap-3 justify-center">
                                        {task.options?.map((opt, idx) => {
                                            const isUsed = builderSelection.some(s => s.id === `opt-${idx}`);
                                            return (
                                                <button
                                                    key={idx}
                                                    disabled={isUsed}
                                                    onClick={() => setBuilderSelection([...builderSelection, {
                                                        id: `opt-${idx}`,
                                                        word: opt
                                                    }])}
                                                    className={`px-5 py-3 rounded-xl font-black shadow-sm transition-all ${isUsed ? 'bg-slate-100 text-slate-200' : 'bg-white border-2 border-slate-100 text-slate-700 hover:border-blue-500'}`}
                                                >
                                                    {String(opt)}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {!showAnswer ? (
                                        <button onClick={validateSentence}
                                                className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black uppercase tracking-widest shadow-xl">Check
                                            Sentence</button>
                                    ) : (
                                        <div
                                            className="p-6 bg-blue-50 rounded-[2rem] text-blue-800 font-bold text-center border border-blue-100 animate-in zoom-in">
                                            <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-blue-600"/>
                                            {task.grammarNote || "Perfect grammar!"}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 3. FEYNMAN TECHNIQUE */}
                            {task.type === 'feynman' && (
                                <div className="w-full space-y-6">
                                    {!showAnswer ? (
                                        <>
                         <textarea
                             value={feynmanInput}
                             onChange={e => setFeynmanInput(e.target.value)}
                             className="w-full h-40 p-6 rounded-[2rem] border-2 border-slate-100 bg-slate-50 outline-none font-bold text-slate-700 resize-none focus:border-blue-500 transition-colors"
                             placeholder="Explain the logic in your own words..."
                         ></textarea>
                                            <button onClick={() => setShowAnswer(true)}
                                                    className="w-full bg-[#11457E] text-white py-5 rounded-2xl font-black shadow-lg uppercase tracking-widest">Submit
                                                Explanation
                                            </button>
                                        </>
                                    ) : (
                                        <div
                                            className="bg-slate-50 p-8 rounded-[2.5rem] border-l-[12px] border-[#11457E] shadow-sm animate-in fade-in">
                                            <h4 className="font-black text-slate-800 mb-2 uppercase text-[10px] tracking-widest">Professional
                                                View</h4>
                                            <p className="text-slate-600 font-bold leading-relaxed">{task.explain}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => {
                                if (currentTaskIndex < sessionTasks.length - 1) {
                                    setCurrentTaskIndex(currentTaskIndex + 1);
                                    setShowAnswer(false);
                                    setBuilderSelection([]);
                                    setFeynmanInput("");
                                } else {
                                    setLessonComplete(true);
                                }
                            }}
                            className="w-full bg-[#11457E] text-white font-black py-6 rounded-3xl flex items-center justify-center shadow-xl hover:bg-blue-800 transition-colors"
                        >
                            NEXT STEP <ChevronRight className="w-6 h-6"/>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
