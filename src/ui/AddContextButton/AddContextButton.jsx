import React, {useEffect, useRef, useState} from "react";
import ReactDOM from "react-dom";
import {
    Plus,
    X,
    Check,
    Loader2
} from "lucide-react";
import {Button} from "../Components/Button.jsx";
import { useContent } from "../../contexts/ContentContext.jsx";
import { generateChatScenarios } from "../../lib/generateScenarios.js";
import { getLanguageMeta } from "../../lib/languages.js";

export default function AddContextButton({ onSelect, currentScenario }) {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState('');
    const [aiScenarios, setAiScenarios] = useState([]);
    const [isLoadingScenarios, setIsLoadingScenarios] = useState(false);

    const [isCreating, setIsCreating] = useState(false);
    const [customTitle, setCustomTitle] = useState("");
    const [customPrompt, setCustomPrompt] = useState("");

    const { currentLanguage, userProfile } = useContent();
    const level = userProfile?.level || 'A1';
    const supportLanguage = userProfile?.supportLanguage || 'portuguese';
    const cacheKey = `chatScenarios-${currentLanguage}-${level}`;
    const loadingRef = useRef(false);

    useEffect(() => {
        setSelected(currentScenario);
    }, [currentScenario]);

    // Scenarios are AI-generated per target language + level.
    // Cache flow mirrors the academic path: localStorage → AI → cache.
    useEffect(() => {
        if (!open || !currentLanguage) return;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            setAiScenarios(JSON.parse(cached));
            return;
        }
        if (loadingRef.current) return;
        loadingRef.current = true;
        setIsLoadingScenarios(true);
        setAiScenarios([]);

        generateChatScenarios({
            targetLanguageName: getLanguageMeta(currentLanguage)?.name || currentLanguage,
            supportLanguage,
            level,
        })
            .then(list => {
                if (list.length) localStorage.setItem(cacheKey, JSON.stringify(list));
                setAiScenarios(list);
            })
            .catch(err => console.error('[AddContext] scenario generation failed:', err))
            .finally(() => {
                setIsLoadingScenarios(false);
                loadingRef.current = false;
            });
    }, [open, currentLanguage, level, supportLanguage, cacheKey]);

    const inputClass =
        "w-full px-3.5 py-2.5 rounded-lg border border-line bg-surface text-sm text-ink placeholder:text-muted/60 outline-none focus-ring focus:border-primary transition-colors";

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                variant={selected ? "secondary" : "default"}
            >
                {selected?.emoji
                    ? <span aria-hidden className="leading-none">{selected.emoji}</span>
                    : <Plus size={15}/>}
                {selected ? selected.title : "Scenario"}
            </Button>

            {ReactDOM.createPortal(
                <>
                    {open && (
                        <div
                            role="dialog"
                            aria-modal="true"
                            aria-label="Choose scenario"
                            style={{
                                position: 'fixed',
                                inset: 0,
                                backgroundColor: 'rgba(27,39,51,0.45)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 9999,
                                padding: '16px',
                            }}
                            onClick={() => setOpen(false)}
                        >
                            <div
                                onClick={e => e.stopPropagation()}
                                className="bg-surface border border-line rounded-xl shadow-overlay w-full max-w-lg p-6"
                            >
                                <div className="flex items-center justify-between mb-5">
                                    <h2 className="font-display font-bold tracking-tight text-lg">Conversation scenario</h2>
                                    <button
                                        onClick={() => setOpen(false)}
                                        aria-label="Close"
                                        className="p-1.5 -mr-1.5 text-muted hover:text-ink transition-colors focus-ring"
                                    >
                                        <X size={17}/>
                                    </button>
                                </div>

                                {isCreating ? (
                                    <form className="space-y-4" onSubmit={e => e.preventDefault()}>
                                        <div>
                                            <label htmlFor="scn-title" className="block text-[13px] font-medium mb-1.5">Title</label>
                                            <input
                                                id="scn-title"
                                                value={customTitle}
                                                onChange={(e) => setCustomTitle(e.target.value)}
                                                className={inputClass}
                                                placeholder="E.g. job interview"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="scn-prompt" className="block text-[13px] font-medium mb-1.5">Instructions</label>
                                            <textarea
                                                id="scn-prompt"
                                                value={customPrompt}
                                                onChange={(e) => setCustomPrompt(e.target.value)}
                                                className={`${inputClass} h-28 resize-none leading-relaxed`}
                                                placeholder="Describe how Catharina should behave…"
                                            />
                                        </div>

                                        <div className="flex justify-end gap-2 pt-1">
                                            <Button
                                                variant="secondary"
                                                onClick={() => {
                                                    setIsCreating(false);
                                                    setCustomTitle("");
                                                    setCustomPrompt("");
                                                }}
                                            >
                                                Cancel
                                            </Button>

                                            <Button
                                                onClick={() => {
                                                    if (!customTitle.trim() || !customPrompt.trim()) return;

                                                    const newScenario = {
                                                        id: `custom-${Date.now()}`,
                                                        title: customTitle,
                                                        description: "Custom scenario",
                                                        prompt: customPrompt,
                                                        isCustom: true
                                                    };

                                                    setSelected(newScenario);
                                                    onSelect?.(newScenario);

                                                    setIsCreating(false);
                                                    setCustomTitle("");
                                                    setCustomPrompt("");
                                                    setOpen(false);
                                                }}
                                            >
                                                Create
                                            </Button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <ul className="divide-y divide-line border-y border-line max-h-[380px] overflow-y-auto">
                                            <li>
                                                <button
                                                    onClick={() => setIsCreating(true)}
                                                    className="w-full flex items-center gap-3 py-3.5 text-left hover:bg-sunken transition-colors focus-ring"
                                                >
                                                    <Plus size={16} className="text-muted flex-shrink-0"/>
                                                    <span>
                                                        <span className="block text-sm font-medium">Create your own scenario</span>
                                                        <span className="block text-[12px] text-muted mt-0.5">
                                                            Set the context and instructions
                                                        </span>
                                                    </span>
                                                </button>
                                            </li>

                                            {isLoadingScenarios && (
                                                <li className="flex items-center gap-2 py-4 text-[13px] text-muted">
                                                    <Loader2 size={14} className="animate-spin"/>
                                                    Generating scenarios for your level…
                                                </li>
                                            )}

                                            {!isLoadingScenarios && aiScenarios.map((scenario) => {
                                                const isActive = selected?.id === scenario.id;

                                                return (
                                                    <li key={scenario.id}>
                                                        <button
                                                            onClick={() => {
                                                                setSelected(scenario);
                                                                onSelect?.(scenario);
                                                                setOpen(false);
                                                            }}
                                                            className="w-full flex items-start gap-3 py-3.5 text-left hover:bg-sunken transition-colors focus-ring"
                                                        >
                                                            <span aria-hidden className="text-base leading-none mt-0.5 w-5 text-center flex-shrink-0">{scenario.emoji}</span>
                                                            <span className="flex-1 min-w-0">
                                                                <span className="block text-sm font-medium">{scenario.title}</span>
                                                                <span className="block text-[12px] text-muted mt-0.5">
                                                                    {scenario.description}
                                                                </span>
                                                            </span>
                                                            {isActive && <Check size={15} className="text-primary flex-shrink-0 mt-0.5"/>}
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                        </ul>

                                        {!isLoadingScenarios && !aiScenarios.length && (
                                            <p className="text-center text-[13px] text-muted py-6">
                                                Couldn't load scenarios. Please try again later.
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </>,
                document.body
            )}
        </>
    );
}
