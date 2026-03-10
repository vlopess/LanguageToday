import {
    AlertCircle,
    Brain,
    CheckCircle2,
    ChevronRight,
    Lightbulb,
    PenLine,
    RotateCcw,
    Trophy,
    X,
} from "lucide-react";
import React, { useState } from "react";
import { useContent } from "../../contexts/ContentContext.jsx";
import { useNavigate } from "react-router-dom";

const TASK_META = {
    'active-recall': {
        label: 'Active Recall',
        Icon: Brain,
        color: '#11457E',
        bgClass: 'bg-blue-50',
        borderClass: 'border-blue-100',
        textClass: 'text-[#11457E]',
        barColor: '#11457E',
    },
    'sentence-builder': {
        label: 'Sentence Builder',
        Icon: PenLine,
        color: '#D71920',
        bgClass: 'bg-red-50',
        borderClass: 'border-red-100',
        textClass: 'text-[#D71920]',
        barColor: '#D71920',
    },
    feynman: {
        label: 'Feynman Technique',
        Icon: Lightbulb,
        color: '#7C3AED',
        bgClass: 'bg-purple-50',
        borderClass: 'border-purple-100',
        textClass: 'text-purple-700',
        barColor: '#7C3AED',
    },
    'error-correction': {
        label: 'Error Correction',
        Icon: AlertCircle,
        color: '#059669',
        bgClass: 'bg-emerald-50',
        borderClass: 'border-emerald-100',
        textClass: 'text-emerald-700',
        barColor: '#059669',
    },
};

const RATING_BUTTONS = [
    { key: 'good',    emoji: '😊', label: 'Got it!', activeClass: 'bg-green-500 text-white border-green-500',  idleClass: 'bg-green-50 border-green-200 text-green-700' },
    { key: 'partial', emoji: '🤔', label: 'Almost',  activeClass: 'bg-amber-500 text-white border-amber-500',  idleClass: 'bg-amber-50 border-amber-200 text-amber-700' },
    { key: 'missed',  emoji: '😅', label: 'Missed',  activeClass: 'bg-red-500 text-white border-red-500',    idleClass: 'bg-red-50 border-red-200 text-red-700' },
];

export const LessonModeView = () => {
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
    const [showAnswer, setShowAnswer]             = useState(false);
    const [builderSelection, setBuilderSelection] = useState([]);
    const [builderError, setBuilderError]         = useState(false);
    const [builderWrongMsg, setBuilderWrongMsg]   = useState(false);
    const [builderAttempts, setBuilderAttempts]   = useState(0);
    const [feynmanInput, setFeynmanInput]         = useState("");
    const [errorInput, setErrorInput]             = useState("");
    const [selfRating, setSelfRating]             = useState(null);
    const [showHint, setShowHint]                 = useState(false);
    const [lessonComplete, setLessonComplete]     = useState(false);
    const [stats, setStats]                       = useState({ good: 0, partial: 0, missed: 0 });

    const navigate = useNavigate();
    const { sessionTasks } = useContent();

    const task       = sessionTasks[currentTaskIndex];
    const totalTasks = sessionTasks.length;
    const progress   = totalTasks > 0 ? ((currentTaskIndex + 1) / totalTasks) * 100 : 0;
    const meta       = TASK_META[task?.type] ?? TASK_META['active-recall'];
    const { Icon: MetaIcon } = meta;

    const canProceed = showAnswer;

    const handleNext = () => {
        if (currentTaskIndex < sessionTasks.length - 1) {
            setCurrentTaskIndex(i => i + 1);
            setShowAnswer(false);
            setBuilderSelection([]);
            setBuilderError(false);
            setBuilderWrongMsg(false);
            setBuilderAttempts(0);
            setFeynmanInput("");
            setErrorInput("");
            setSelfRating(null);
            setShowHint(false);
        } else {
            setLessonComplete(true);
        }
    };

    const handleSelfRating = (key) => {
        if (selfRating) return;
        setSelfRating(key);
        setStats(prev => ({ ...prev, [key]: prev[key] + 1 }));
    };

    const validateSentence = () => {
        const currentOrder = builderSelection.map(s => s.word);
        if (JSON.stringify(currentOrder) === JSON.stringify(task.correctOrder)) {
            setShowAnswer(true);
            setBuilderError(false);
            setBuilderWrongMsg(false);
        } else {
            setBuilderAttempts(a => a + 1);
            setBuilderError(true);
            setBuilderWrongMsg(true);
            setTimeout(() => {
                setBuilderError(false);
                setBuilderWrongMsg(false);
            }, 1200);
        }
    };

    /* ────────────── COMPLETION SCREEN ────────────── */
    if (lessonComplete) {
        const totalRated = stats.good + stats.partial + stats.missed;
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
                <div className="max-w-sm w-full">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-12 rounded-[3rem] mb-8 shadow-xl border border-green-100">
                        <Trophy className="w-20 h-20 text-green-500 mx-auto animate-bounce" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tighter">Vynikající!</h2>
                    <p className="text-slate-500 font-bold mb-8">
                        You crushed all {totalTasks} activities today.
                    </p>

                    {totalRated > 0 && (
                        <div className="grid grid-cols-3 gap-3 mb-8">
                            {[
                                { label: 'Got it',  count: stats.good,    bg: 'bg-green-50 border-green-100', text: 'text-green-600' },
                                { label: 'Almost',  count: stats.partial, bg: 'bg-amber-50 border-amber-100', text: 'text-amber-600' },
                                { label: 'Missed',  count: stats.missed,  bg: 'bg-red-50 border-red-100',     text: 'text-red-600'   },
                            ].map(s => (
                                <div key={s.label} className={`${s.bg} border rounded-2xl p-4`}>
                                    <div className={`text-2xl font-black ${s.text}`}>{s.count}</div>
                                    <div className={`text-[10px] font-black uppercase tracking-widest mt-1 ${s.text} opacity-80`}>{s.label}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full bg-[#11457E] text-white py-5 rounded-3xl font-black text-base shadow-xl shadow-blue-100 hover:scale-105 active:scale-95 transition-all"
                    >
                        BACK TO DASHBOARD
                    </button>
                </div>
            </div>
        );
    }

    if (!task) return null;

    /* ────────────── MAIN LAYOUT ────────────── */
    return (
        <div className="min-h-screen flex flex-col bg-[#F7F5F0]">
            <div className="max-w-2xl mx-auto w-full bg-white flex-1 flex flex-col">

                {/* ── HEADER ── */}
                <div className="px-7 pt-7 pb-0">
                    <div className="flex items-center justify-between mb-5">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="p-2 hover:bg-slate-100 rounded-2xl transition-colors"
                        >
                            <X className="text-slate-400 w-5 h-5" />
                        </button>

                        <span className="text-xs font-black text-slate-400 tracking-widest">
                            {currentTaskIndex + 1} / {totalTasks}
                        </span>

                        <div className={`flex items-center gap-1.5 ${meta.bgClass} ${meta.textClass} px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${meta.borderClass}`}>
                            <MetaIcon className="w-3.5 h-3.5" />
                            {meta.label}
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-7">
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${progress}%`, backgroundColor: meta.barColor }}
                        />
                    </div>
                </div>

                {/* ── CONTENT ── */}
                <div className="flex-1 flex flex-col px-7 pb-7 gap-6">
                    {task.type === 'sentence-builder' ? (
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Translate to {task.targetSentence ? (task.targetSentence.match(/[čšžřďťňáéíóúůýě]/i) ? 'Czech' : 'English') : 'target language'}</p>
                            <h3 className="text-base font-bold text-slate-800 leading-snug">{task.prompt}</h3>
                        </div>
                    ) : (
                        <h3 className="text-base font-bold text-slate-800 leading-snug tracking-tight">
                            {task.prompt}
                        </h3>
                    )}

                    <div className="flex-1 flex flex-col gap-5">

                        {/* ══════════ 1. ACTIVE RECALL ══════════ */}
                        {task.type === 'active-recall' && (
                            <div className="flex-1 flex flex-col gap-4">
                                {/* Hint button */}
                                {task.hint && !showAnswer && (
                                    <button
                                        onClick={() => setShowHint(h => !h)}
                                        className="self-start flex items-center gap-2 text-amber-600 text-sm font-bold hover:bg-amber-50 px-4 py-2 rounded-xl transition-colors border border-amber-100"
                                    >
                                        <Lightbulb className="w-4 h-4" />
                                        {showHint ? `Hint: ${task.hint}` : 'Show hint'}
                                    </button>
                                )}

                                {!showAnswer ? (
                                    /* Reveal tap area */
                                    <button
                                        onClick={() => setShowAnswer(true)}
                                        className="flex-1 min-h-[160px] border-[3px] border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center gap-4 hover:border-[#11457E]/40 hover:bg-blue-50/30 transition-all group"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-100 transition-all">
                                            <Brain className="w-8 h-8 text-[#11457E]" />
                                        </div>
                                        <span className="text-slate-300 font-black uppercase tracking-widest text-xs">
                                            Think, then tap to reveal
                                        </span>
                                    </button>
                                ) : (
                                    <div className="flex-1 flex flex-col gap-4 animate-pop-in">
                                        {/* Answer card */}
                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[2rem] p-8 text-center border border-blue-100">
                                            <div className="text-2xl font-bold text-[#11457E] mb-3 tracking-tighter">
                                                {task.answer}
                                            </div>
                                            {task.phonetic && (
                                                <span className="inline-block bg-white/80 text-slate-500 italic font-bold text-sm px-4 py-1.5 rounded-full border border-blue-100">
                                                    [{task.phonetic}]
                                                </span>
                                            )}
                                        </div>

                                        {/* Explanation */}
                                        <div className="bg-slate-50 rounded-[1.5rem] p-5 border-l-[6px] border-[#D71920]">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Explanation</p>
                                            <p className="text-slate-700 font-bold leading-relaxed text-sm">{task.explain}</p>
                                        </div>

                                        {/* Example */}
                                        {task.example && (
                                            <div className="bg-amber-50 rounded-[1.5rem] p-5 border border-amber-100">
                                                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1.5">Example</p>
                                                <p className="text-amber-900 font-bold italic text-sm">{task.example}</p>
                                            </div>
                                        )}

                                        {/* Self-rating */}
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 text-center">How did you do?</p>
                                            <div className="grid grid-cols-3 gap-3">
                                                {RATING_BUTTONS.map(r => (
                                                    <button
                                                        key={r.key}
                                                        onClick={() => handleSelfRating(r.key)}
                                                        className={`py-3.5 rounded-2xl border-2 font-black text-sm transition-all hover:scale-105 active:scale-95 ${selfRating === r.key ? r.activeClass : r.idleClass}`}
                                                    >
                                                        <div className="text-xl mb-1">{r.emoji}</div>
                                                        <div className="text-[11px]">{r.label}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ══════════ 2. SENTENCE BUILDER ══════════ */}
                        {task.type === 'sentence-builder' && (
                            <div className="flex-1 flex flex-col gap-5">
                                {/* Sentence drop area */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your sentence</p>
                                        {builderSelection.length > 0 && !showAnswer && (
                                            <button
                                                onClick={() => setBuilderSelection([])}
                                                className="flex items-center gap-1 text-[11px] font-black text-slate-400 hover:text-slate-600 hover:bg-slate-100 px-2.5 py-1 rounded-lg transition-colors"
                                            >
                                                <RotateCcw className="w-3 h-3" /> Clear
                                            </button>
                                        )}
                                    </div>
                                    <div className={`min-h-[90px] rounded-[1.5rem] p-4 border-2 flex flex-wrap gap-2 items-center transition-all duration-300 ${
                                        builderError   ? 'border-red-400 bg-red-50 animate-shake' :
                                        showAnswer     ? 'border-green-300 bg-green-50' :
                                        'border-dashed border-slate-200 bg-slate-50'
                                    }`}>
                                        {builderSelection.length === 0 && (
                                            <p className="text-slate-300 font-bold text-sm w-full text-center select-none">
                                                Select words from the word bank…
                                            </p>
                                        )}
                                        {builderSelection.map((s) => (
                                            <button
                                                key={s.id}
                                                onClick={() => !showAnswer && setBuilderSelection(prev => prev.filter(item => item.id !== s.id))}
                                                disabled={showAnswer}
                                                className={`px-4 py-2 rounded-xl font-bold text-sm border transition-all ${
                                                    showAnswer
                                                        ? 'bg-green-100 text-green-800 border-green-200 cursor-default'
                                                        : 'bg-white text-[#11457E] border-slate-200 hover:border-red-300 hover:bg-red-50 shadow-sm'
                                                }`}
                                            >
                                                {String(s.word)}
                                            </button>
                                        ))}
                                    </div>
                                    {builderWrongMsg && (
                                        <p className="text-red-500 font-bold text-xs mt-2 text-center animate-in fade-in">
                                            Not quite right — try a different order!
                                        </p>
                                    )}
                                </div>

                                {/* Word bank */}
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Word bank</p>
                                    <div className="flex flex-wrap gap-2">
                                        {task.options?.map((opt, idx) => {
                                            const isUsed = builderSelection.some(s => s.id === `opt-${idx}`);
                                            return (
                                                <button
                                                    key={idx}
                                                    disabled={isUsed || showAnswer}
                                                    onClick={() => !isUsed && !showAnswer && setBuilderSelection(prev => [...prev, { id: `opt-${idx}`, word: opt }])}
                                                    className={`px-4 py-2.5 rounded-xl font-black text-sm border-2 transition-all ${
                                                        isUsed || showAnswer
                                                            ? 'bg-slate-100 text-slate-300 border-slate-100 cursor-default'
                                                            : 'bg-white text-slate-700 border-slate-200 hover:border-[#D71920] hover:text-[#D71920] hover:scale-105 active:scale-95 shadow-sm'
                                                    }`}
                                                >
                                                    {String(opt)}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Action / feedback */}
                                {!showAnswer ? (
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={validateSentence}
                                            disabled={builderSelection.length === 0}
                                            className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all ${
                                                builderSelection.length > 0
                                                    ? 'bg-slate-900 text-white hover:bg-[#11457E] shadow-lg hover:scale-[1.02] active:scale-95'
                                                    : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                            }`}
                                        >
                                            Check Sentence
                                        </button>
                                        {builderAttempts >= 3 && (
                                            <button
                                                onClick={() => setShowAnswer(true)}
                                                className="w-full py-3 rounded-2xl font-bold text-sm text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-all"
                                            >
                                                Show Answer
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3 animate-pop-in">
                                        {builderAttempts >= 3 && (
                                            <div className="bg-amber-50 rounded-[1.5rem] p-4 border border-amber-200">
                                                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1.5">Correct Answer</p>
                                                <p className="text-amber-900 font-bold text-sm">{Array.isArray(task.correctOrder) ? task.correctOrder.join(' ') : task.correctOrder}</p>
                                            </div>
                                        )}
                                        <div className={`rounded-[1.5rem] p-5 border flex gap-3 items-start ${builderAttempts >= 3 ? 'bg-slate-50 border-slate-200' : 'bg-green-50 border-green-200'}`}>
                                            <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${builderAttempts >= 3 ? 'text-slate-400' : 'text-green-600'}`} />
                                            <div>
                                                <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${builderAttempts >= 3 ? 'text-slate-400' : 'text-green-600'}`}>
                                                    {builderAttempts >= 3 ? 'Grammar Note' : 'Perfect grammar!'}
                                                </p>
                                                <p className={`font-bold text-sm leading-relaxed ${builderAttempts >= 3 ? 'text-slate-600' : 'text-green-800'}`}>
                                                    {task.grammarNote || "Great job forming this sentence!"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ══════════ 3. FEYNMAN TECHNIQUE ══════════ */}
                        {task.type === 'feynman' && (
                            <div className="flex-1 flex flex-col gap-4">
                                {!showAnswer ? (
                                    <>
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your explanation</p>
                                                <span className="text-[11px] text-slate-400 font-bold">{feynmanInput.length} chars</span>
                                            </div>
                                            <textarea
                                                value={feynmanInput}
                                                onChange={e => setFeynmanInput(e.target.value)}
                                                className="w-full h-44 p-5 rounded-[1.5rem] border-2 border-slate-100 bg-slate-50 outline-none font-bold text-slate-700 resize-none focus:border-purple-400 transition-colors text-sm leading-relaxed"
                                                placeholder="Explain this concept in your own words — as if teaching someone else…"
                                            />
                                        </div>
                                        <button
                                            onClick={() => feynmanInput.trim().length > 10 && setShowAnswer(true)}
                                            disabled={feynmanInput.trim().length <= 10}
                                            className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all ${
                                                feynmanInput.trim().length > 10
                                                    ? 'bg-purple-700 text-white hover:bg-purple-800 shadow-lg hover:scale-[1.02] active:scale-95'
                                                    : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                            }`}
                                        >
                                            Submit Explanation
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex-1 flex flex-col gap-4 animate-in fade-in duration-300">
                                        {/* Side-by-side */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-slate-50 rounded-[1.5rem] p-4 border border-slate-200">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Your view</p>
                                                <p className="text-slate-600 font-bold text-sm leading-relaxed">{feynmanInput}</p>
                                            </div>
                                            <div className="bg-purple-50 rounded-[1.5rem] p-4 border border-purple-100">
                                                <p className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-2">Expert view</p>
                                                <p className="text-purple-900 font-bold text-sm leading-relaxed">{task.explain}</p>
                                            </div>
                                        </div>

                                        {/* Key points */}
                                        {Array.isArray(task.keyPoints) && task.keyPoints.length > 0 && (
                                            <div className="bg-indigo-50 rounded-[1.5rem] p-5 border border-indigo-100">
                                                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-3">Key points</p>
                                                <ul className="space-y-2">
                                                    {task.keyPoints.map((point, i) => (
                                                        <li key={i} className="flex items-start gap-2 text-sm font-bold text-indigo-800">
                                                            <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                                                            {point}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Self-rating */}
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 text-center">How was your understanding?</p>
                                            <div className="grid grid-cols-3 gap-3">
                                                {RATING_BUTTONS.map(r => (
                                                    <button
                                                        key={r.key}
                                                        onClick={() => handleSelfRating(r.key)}
                                                        className={`py-3.5 rounded-2xl border-2 font-black text-sm transition-all hover:scale-105 active:scale-95 ${selfRating === r.key ? r.activeClass : r.idleClass}`}
                                                    >
                                                        <div className="text-xl mb-1">{r.emoji}</div>
                                                        <div className="text-[11px]">{r.label}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ══════════ 4. ERROR CORRECTION ══════════ */}
                        {task.type === 'error-correction' && (
                            <div className="flex-1 flex flex-col gap-4">
                                {/* Erroneous sentence */}
                                <div className="bg-red-50 rounded-[1.5rem] p-5 border border-red-100">
                                    <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2">Sentence with error</p>
                                    <p className="text-red-900 font-black text-sm italic leading-snug">"{task.sentence}"</p>
                                </div>

                                {!showAnswer ? (
                                    <>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Your correction</p>
                                            <input
                                                value={errorInput}
                                                onChange={e => setErrorInput(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && setShowAnswer(true)}
                                                className="w-full p-4 rounded-[1.5rem] border-2 border-slate-100 bg-slate-50 outline-none font-bold text-slate-700 focus:border-emerald-400 transition-colors text-sm"
                                                placeholder="Type the corrected sentence…"
                                            />
                                        </div>
                                        <button
                                            onClick={() => setShowAnswer(true)}
                                            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-emerald-700 shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
                                        >
                                            Reveal Correction
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex-1 flex flex-col gap-4 animate-pop-in">
                                        {/* Comparison */}
                                        <div className="space-y-3">
                                            {errorInput.trim() && (
                                                <div className="bg-slate-50 rounded-[1.5rem] p-4 border border-slate-200">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Your answer</p>
                                                    <p className="text-slate-700 font-bold italic text-sm">"{errorInput}"</p>
                                                </div>
                                            )}
                                            <div className="bg-green-50 rounded-[1.5rem] p-5 border border-green-200">
                                                <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-1.5">Correct sentence</p>
                                                <p className="text-green-900 font-black text-sm italic">"{task.correctedSentence}"</p>
                                            </div>
                                        </div>

                                        {/* Error explanation */}
                                        <div className="bg-slate-50 rounded-[1.5rem] p-5 border-l-[6px] border-emerald-500">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Why?</p>
                                            <p className="text-slate-700 font-bold leading-relaxed text-sm">{task.errorExplanation}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── NEXT BUTTON ── */}
                    <button
                        onClick={handleNext}
                        disabled={!canProceed}
                        className={`w-full py-5 rounded-3xl font-black flex items-center justify-center gap-2 transition-all text-sm uppercase tracking-widest ${
                            canProceed
                                ? 'bg-[#11457E] text-white shadow-xl shadow-blue-100 hover:bg-blue-800 hover:scale-[1.02] active:scale-95'
                                : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                        }`}
                    >
                        {currentTaskIndex < sessionTasks.length - 1 ? 'Next Step' : 'Finish Lesson'}
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};
