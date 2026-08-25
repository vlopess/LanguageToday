import {
    CheckCircle2,
    ChevronRight,
    Lightbulb,
    X,
} from "lucide-react";
import React, { useState } from "react";
import { useContent } from "../../contexts/ContentContext.jsx";
import { useNavigate } from "react-router-dom";

const TASK_TYPE_LABELS = {
    'active-recall':      'Active recall',
    'multiple-choice':    'Multiple choice',
    'fill-in-the-blank':  'Fill in the blank',
    translation:          'Translation',
};

const RATING_I18N = {
    portuguese: [
        { key: 'good',    label: 'Entendi' },
        { key: 'partial', label: 'Quase' },
        { key: 'missed',  label: 'Não saiu' },
    ],
    english: [
        { key: 'good',    label: 'Got it' },
        { key: 'partial', label: 'Almost' },
        { key: 'missed',  label: 'Missed' },
    ],
    spanish: [
        { key: 'good',    label: 'Lo entendí' },
        { key: 'partial', label: 'Casi' },
        { key: 'missed',  label: 'No salió' },
    ],
};

export const LessonModeView = () => {
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
    const [showAnswer, setShowAnswer]             = useState(false);
    const [selfRating, setSelfRating]             = useState(null);
    const [showHint, setShowHint]                 = useState(false);
    const [lessonComplete, setLessonComplete]     = useState(false);
    const [stats, setStats]                       = useState({ good: 0, partial: 0, missed: 0 });

    // Per-type state
    const [mcSelected, setMcSelected]             = useState(null);
    const [blankSelected, setBlankSelected]       = useState(null);
    const [translationSelected, setTranslationSelected] = useState(null);

    const navigate = useNavigate();
    const { sessionTasks, userProfile, languageMeta } = useContent();

    const i18n = {
        portuguese: { congrats: 'Excelente!',  subtitle: (n) => `Você completou todas as ${n} atividades de hoje.` },
        english:    { congrats: 'Outstanding!', subtitle: (n) => `You crushed all ${n} activities today.` },
        spanish:    { congrats: '¡Excelente!',  subtitle: (n) => `Completaste las ${n} actividades de hoy.` },
    };
    const t = i18n[userProfile?.supportLanguage] ?? i18n.english;
    const ratings = RATING_I18N[userProfile?.supportLanguage] ?? RATING_I18N.english;

    const task       = sessionTasks[currentTaskIndex];
    const totalTasks = sessionTasks.length;
    const progress   = totalTasks > 0 ? ((currentTaskIndex + 1) / totalTasks) * 100 : 0;
    const typeLabel  = TASK_TYPE_LABELS[task?.type] || '';

    const canProceed = showAnswer;

    const handleNext = () => {
        if (currentTaskIndex < sessionTasks.length - 1) {
            setCurrentTaskIndex(i => i + 1);
            setShowAnswer(false);
            setSelfRating(null);
            setShowHint(false);
            setMcSelected(null);
            setBlankSelected(null);
            setTranslationSelected(null);
        } else {
            setLessonComplete(true);
        }
    };

    const handleSelfRating = (key) => {
        if (selfRating) return;
        setSelfRating(key);
        setStats(prev => ({ ...prev, [key]: prev[key] + 1 }));
    };

    /* ── Shared styles ── */
    const ratingClass = (key) =>
        `py-3 rounded-lg border text-[13px] font-medium transition-colors focus-ring ${
            selfRating === null
                ? 'border-line text-muted hover:border-muted/50'
                : selfRating === key
                    ? key === 'good'
                        ? 'border-success bg-success-soft text-success'
                        : key === 'partial'
                            ? 'border-warning bg-warning-soft text-warning'
                            : 'border-danger bg-danger-soft text-danger'
                    : 'border-line text-muted/50'
        }`;
    const noteBlock = "rounded-lg p-4 border-l-[3px]";

    /* ── Multiple-choice / Translation: option button ── */
    const optionBtnClass = (isSelected, isCorrect, revealed) => {
        if (revealed) {
            if (isCorrect) return 'border-success bg-success-soft text-success';
            if (isSelected) return 'border-danger bg-danger-soft text-danger';
            return 'border-line text-muted/50';
        }
        if (isSelected) return 'border-primary bg-primary-soft text-primary';
        return 'border-line text-ink hover:border-primary/50';
    };

    /* ────────────── COMPLETION SCREEN ────────────── */
    if (lessonComplete) {
        const totalRated = stats.good + stats.partial + stats.missed;
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
                <div className="max-w-sm w-full">
                    <CheckCircle2 size={36} strokeWidth={1.5} className="text-success mx-auto mb-6"/>
                    <h2 className="font-display font-bold tracking-tight text-3xl mb-2">{t.congrats}</h2>
                    <p className="text-muted mb-8">
                        {t.subtitle(totalTasks)}
                    </p>

                    {totalRated > 0 && (
                        <div className="bg-surface border border-line rounded-xl grid grid-cols-3 divide-x divide-line mb-8">
                            {[
                                { label: ratings[0].label, count: stats.good },
                                { label: ratings[1].label, count: stats.partial },
                                { label: ratings[2].label, count: stats.missed },
                            ].map(s => (
                                <div key={s.label} className="px-3 py-3.5">
                                    <p className="font-display font-bold text-xl tabular-nums">{s.count}</p>
                                    <p className="text-[11px] text-muted mt-1">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full py-3.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors focus-ring"
                    >
                        Back to home
                    </button>
                </div>
            </div>
        );
    }

    if (!task) return null;

    /* ────────────── MAIN LAYOUT ────────────── */
    return (
        <div className="min-h-screen flex flex-col">
            <div className="max-w-2xl mx-auto w-full bg-surface flex-1 flex flex-col
                            lg:my-6 lg:border lg:border-line lg:rounded-xl">

                {/* ── HEADER ── */}
                <div className="px-6 pt-6 pb-0 sm:px-7 sm:pt-7">
                    <div className="flex items-center justify-between mb-5">
                        <button
                            onClick={() => navigate('/dashboard')}
                            aria-label="Close"
                            className="p-2 -ml-2 text-muted hover:text-ink transition-colors focus-ring"
                        >
                            <X size={18}/>
                        </button>

                        <span className="text-[13px] tabular-nums text-muted">
                            {currentTaskIndex + 1} / {totalTasks}
                        </span>

                        <span className="text-[12px] text-muted">
                            {typeLabel}
                        </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-[3px] bg-sunken rounded-full overflow-hidden mb-7">
                        <div
                            className="h-full rounded-full transition-all duration-500 bg-primary"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* ── CONTENT ── */}
                <div className="flex-1 flex flex-col px-6 pb-7 gap-6 sm:px-7">
                    <h3 className="text-lg font-semibold leading-snug">{task.prompt}</h3>

                    <div className="flex-1 flex flex-col gap-5">

                        {/* ══════════ 1. ACTIVE RECALL ══════════ */}
                        {task.type === 'active-recall' && (
                            <div className="flex-1 flex flex-col gap-4">
                                {task.hint && !showAnswer && (
                                    <button
                                        onClick={() => setShowHint(h => !h)}
                                        className={`self-start flex items-center gap-1.5 text-[13px] transition-colors focus-ring ${
                                            showHint
                                                ? 'text-warning'
                                                : 'text-muted hover:text-ink underline underline-offset-2 decoration-line'
                                        }`}
                                    >
                                        <Lightbulb size={14}/>
                                        {showHint ? task.hint : 'Show hint'}
                                    </button>
                                )}

                                {!showAnswer ? (
                                    <button
                                        onClick={() => setShowAnswer(true)}
                                        className="flex-1 min-h-[160px] bg-sunken rounded-xl flex items-center justify-center
                                                   hover:bg-primary-soft transition-colors group px-6"
                                    >
                                        <span className="text-[13px] text-muted group-hover:text-primary transition-colors font-medium">
                                            Think of the answer, then tap to reveal
                                        </span>
                                    </button>
                                ) : (
                                    <div className="flex-1 flex flex-col gap-4">
                                        <div className="bg-surface border border-line rounded-xl p-7 text-center">
                                            <p className="font-display font-bold text-primary text-2xl tracking-tight mb-2 break-words">
                                                {task.answer}
                                            </p>
                                            {task.phonetic && (
                                                <span className="inline-block text-muted italic text-sm">
                                                    [{task.phonetic}]
                                                </span>
                                            )}
                                        </div>

                                        {task.explain && (
                                            <div className={`${noteBlock} bg-sunken border-primary`}>
                                                <p className="text-[13px] font-medium text-muted mb-1">Explanation</p>
                                                <p className="text-sm leading-relaxed">{task.explain}</p>
                                            </div>
                                        )}

                                        {task.example && (
                                            <div className={`${noteBlock} bg-warning-soft border-warning`}>
                                                <p className="text-[13px] font-medium text-warning mb-1">Example</p>
                                                <p className="text-sm leading-relaxed italic">{task.example}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ══════════ 2. MULTIPLE CHOICE ══════════ */}
                        {task.type === 'multiple-choice' && (
                            <div className="flex-1 flex flex-col gap-4">
                                <div className="grid grid-cols-1 gap-2.5">
                                    {(task.options || []).map((opt, idx) => {
                                        const isSelected = mcSelected === idx;
                                        const isCorrect = idx === task.correctIndex;
                                        const revealed = showAnswer;
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => { if (!showAnswer) { setMcSelected(idx); setShowAnswer(true); } }}
                                                disabled={showAnswer}
                                                className={`w-full text-left px-4 py-3.5 rounded-xl border text-sm font-medium transition-all focus-ring ${optionBtnClass(isSelected, isCorrect, revealed)}`}
                                            >
                                                {opt}
                                            </button>
                                        );
                                    })}
                                </div>

                                {showAnswer && (
                                    <div className="flex flex-col gap-3">
                                        {mcSelected !== task.correctIndex && (
                                            <p className="text-danger text-[13px]">
                                                Not quite — the correct answer is highlighted above.
                                            </p>
                                        )}
                                        {task.explain && (
                                            <div className={`${noteBlock} bg-sunken border-primary`}>
                                                <p className="text-[13px] font-medium text-muted mb-1">Explanation</p>
                                                <p className="text-sm leading-relaxed">{task.explain}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ══════════ 3. FILL IN THE BLANK ══════════ */}
                        {task.type === 'fill-in-the-blank' && (
                            <div className="flex-1 flex flex-col gap-4">
                                <div className="bg-sunken rounded-xl p-5 text-center">
                                    <p className="text-lg leading-relaxed font-medium whitespace-pre-wrap">
                                        {task.sentence}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-2.5">
                                    {(task.options || []).map((opt, idx) => {
                                        const isSelected = blankSelected === idx;
                                        const isCorrect = opt === task.correctWord;
                                        const revealed = showAnswer;
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => { if (!showAnswer) { setBlankSelected(idx); setShowAnswer(true); } }}
                                                disabled={showAnswer}
                                                className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all focus-ring ${optionBtnClass(isSelected, isCorrect, revealed)}`}
                                            >
                                                {opt}
                                            </button>
                                        );
                                    })}
                                </div>

                                {showAnswer && (
                                    <div className="flex flex-col gap-3">
                                        {blankSelected !== null && task.options?.[blankSelected] !== task.correctWord && (
                                            <p className="text-danger text-[13px]">
                                                Not quite — the correct word is highlighted above.
                                            </p>
                                        )}
                                        {task.explain && (
                                            <div className={`${noteBlock} bg-sunken border-primary`}>
                                                <p className="text-[13px] font-medium text-muted mb-1">Explanation</p>
                                                <p className="text-sm leading-relaxed">{task.explain}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ══════════ 4. TRANSLATION ══════════ */}
                        {task.type === 'translation' && (
                            <div className="flex-1 flex flex-col gap-4">
                                <div className="grid grid-cols-1 gap-2.5">
                                    {(task.options || []).map((opt, idx) => {
                                        const isSelected = translationSelected === idx;
                                        const isCorrect = idx === task.correctIndex;
                                        const revealed = showAnswer;
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => { if (!showAnswer) { setTranslationSelected(idx); setShowAnswer(true); } }}
                                                disabled={showAnswer}
                                                className={`w-full text-left px-4 py-3.5 rounded-xl border text-sm font-medium transition-all focus-ring ${optionBtnClass(isSelected, isCorrect, revealed)}`}
                                            >
                                                {opt}
                                            </button>
                                        );
                                    })}
                                </div>

                                {showAnswer && (
                                    <div className="flex flex-col gap-3">
                                        {translationSelected !== task.correctIndex && (
                                            <p className="text-danger text-[13px]">
                                                Not quite — the correct translation is highlighted above.
                                            </p>
                                        )}
                                        {task.explain && (
                                            <div className={`${noteBlock} bg-sunken border-primary`}>
                                                <p className="text-[13px] font-medium text-muted mb-1">Explanation</p>
                                                <p className="text-sm leading-relaxed">{task.explain}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── SELF RATING ── */}
                    {showAnswer && (
                        <div>
                            <p className="text-[13px] text-muted mb-2.5 text-center">How did you do?</p>
                            <div className="grid grid-cols-3 gap-2">
                                {ratings.map(r => (
                                    <button
                                        key={r.key}
                                        onClick={() => handleSelfRating(r.key)}
                                        className={ratingClass(r.key)}
                                    >
                                        {r.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── NEXT BUTTON ── */}
                    {showAnswer && (
                        <button
                            onClick={handleNext}
                            disabled={!canProceed}
                            className={`w-full py-4 rounded-lg inline-flex items-center justify-center gap-1.5 text-sm font-semibold transition-colors focus-ring ${
                                canProceed
                                    ? 'bg-primary text-white hover:bg-primary-dark'
                                    : 'bg-sunken text-muted/60 cursor-not-allowed'
                            }`}
                        >
                            {currentTaskIndex < sessionTasks.length - 1 ? 'Continue' : 'Finish lesson'}
                            <ChevronRight size={15}/>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
