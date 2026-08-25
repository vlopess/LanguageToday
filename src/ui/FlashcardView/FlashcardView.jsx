import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useContent } from "../../contexts/ContentContext.jsx";
import { ChevronRight, CheckCircle2, X } from "lucide-react";

export const FlasCardView = () => {
    const navigate = useNavigate();
    const [lessonComplete, setLessonComplete] = useState(false);
    const [isReviewMode] = useState(true);
    const [showAnswer, setShowAnswer] = useState(false);
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);

    const { reviewTasks, languageMeta, userProfile } = useContent();
    const task = reviewTasks[currentTaskIndex];
    const supportLabels = { portuguese: 'Português', english: 'English', spanish: 'Español' };
    const frontLabel = supportLabels[userProfile?.supportLanguage] || 'Translate';
    const langFlag = languageMeta?.flagEmoji || '';

    return (
        <div className="min-h-screen flex flex-col md:p-6">
            <div className="max-w-2xl mx-auto w-full bg-surface md:rounded-xl border-line
                            md:border p-6 sm:p-10 flex-1 flex flex-col">

                <header className="mb-8 flex items-center justify-between">
                    <span className="text-[13px] text-muted tabular-nums">
                        {lessonComplete || !task
                            ? ''
                            : `${currentTaskIndex + 1} / ${reviewTasks.length}`}
                    </span>
                    <button onClick={() => navigate('/dashboard')} aria-label="Close"
                            className="p-2 -mr-2 text-muted hover:text-ink transition-colors focus-ring">
                        <X size={18}/>
                    </button>
                </header>

                {lessonComplete || !task ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <CheckCircle2 size={36} strokeWidth={1.5} className="text-success mb-5"/>
                        <h2 className="font-display font-bold tracking-tight text-3xl mb-8">Review complete</h2>
                        <button onClick={() => navigate('/dashboard')}
                                className="px-8 py-3 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors focus-ring">
                            Back to home
                        </button>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col">

                        <div className="flex-1 flex flex-col items-center justify-center">
                            {isReviewMode ? (
                                <div className="w-full flex flex-col items-center">
                                    <div
                                        onClick={() => setShowAnswer(!showAnswer)}
                                        className="w-full min-h-[380px] relative transition-transform duration-500 cursor-pointer select-none"
                                        style={{
                                            transformStyle: 'preserve-3d',
                                            transform: showAnswer ? 'rotateY(180deg)' : 'rotateY(0deg)'
                                        }}
                                    >
                                        {/* Front: prompt in support language */}
                                        <div
                                            className="absolute inset-0 bg-surface border border-line rounded-xl flex flex-col items-center justify-center px-8"
                                            style={{ backfaceVisibility: 'hidden', zIndex: showAnswer ? 0 : 2 }}
                                        >
                                            <p className="text-[13px] text-muted mb-4">Translate from {frontLabel}</p>
                                            <h3 className="font-display font-bold text-3xl tracking-tight text-center leading-tight">{task.prompt}</h3>
                                            <p className="mt-10 text-[12px] text-muted/70">Tap to flip</p>
                                        </div>

                                        {/* Back: target language */}
                                        <div
                                            className="absolute inset-0 bg-ink text-paper rounded-xl flex flex-col items-center justify-center p-8 text-center"
                                            style={{
                                                backfaceVisibility: 'hidden',
                                                transform: 'rotateY(180deg)',
                                                zIndex: showAnswer ? 2 : 0
                                            }}
                                        >
                                            <h4 className="font-display font-bold text-4xl tracking-tight leading-tight break-words max-w-full">{task.answer}</h4>
                                            <div className="flex items-center gap-2 my-5">
                                                <span className="w-6 h-px bg-paper/30"/>
                                                <span className="text-lg leading-none">{langFlag}</span>
                                                <span className="w-6 h-px bg-paper/30"/>
                                            </div>
                                            <p className="text-paper/60 text-sm leading-relaxed max-w-sm">{task.explanation}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* Standard Active Learning (Recall/Sentence/Feynman) */
                                <div className="w-full">
                                    <h3 className="text-2xl font-semibold text-center mb-8">{task.prompt}</h3>
                                    {task.type === 'active-recall' && (
                                        <div className="flex flex-col items-center">
                                            {!showAnswer ? (
                                                <button onClick={() => setShowAnswer(true)}
                                                        className="w-full py-16 bg-sunken rounded-xl text-muted text-sm font-medium hover:bg-primary-soft hover:text-primary transition-colors focus-ring">
                                                    Think, then tap to reveal
                                                </button>
                                            ) : (
                                                <div className="text-center">
                                                    <div className="font-display font-bold text-4xl text-primary tracking-tight mb-2">{task.answer}</div>
                                                    <p className="text-muted italic text-sm mb-6">[{task.phonetic}]</p>
                                                    <div className="bg-sunken p-5 rounded-lg border-l-[3px] border-primary text-left">
                                                        <p className="text-sm leading-relaxed">{task.explanation}</p>
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
                                        if (currentTaskIndex < reviewTasks.length - 1) {
                                            setCurrentTaskIndex(currentTaskIndex + 1);
                                        } else {
                                            setLessonComplete(true);
                                        }
                                    }, 50);
                                }}
                                className="mt-10 w-full bg-primary text-white font-semibold py-4 rounded-lg
                                           hover:bg-primary-dark transition-colors inline-flex items-center justify-center gap-2 focus-ring"
                            >
                                Next <ChevronRight size={15}/>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
