import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, Play, Pause, RotateCcw, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { useContent } from '../../contexts/ContentContext.jsx';
import { getLanguageMeta, supportLanguageName } from '../../lib/languages.js';

const THEMES = ['Travel', 'Business', 'Everyday', 'Technology', 'Health', 'Cooking', 'Culture', 'Sports', 'Science', 'News'];
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const FONT_OPTIONS = [
    { label: 'Sans', value: "'DM Sans', sans-serif" },
    { label: 'Serif', value: 'Georgia, serif' },
    { label: 'Mono', value: "'Courier New', monospace" },
];

function getLangMeta(language) {
    return getLanguageMeta(language) || { name: 'English', nativeName: 'English', accentColor: '#11457E' };
}

function getLangName(language) {
    return getLangMeta(language).name;
}

function getAccent(language) {
    return getLangMeta(language).accentColor || '#11457E';
}

async function generateTeleprompterText({ language, supportLanguage = 'portuguese', level, theme, duration, apiKey }) {
    const wordCount = Math.round((duration / 60) * 130);
    const langName  = getLangName(language);
    const supportLang = supportLanguageName(supportLanguage);

    const prompt = `Generate a continuous, natural ${langName} text at CEFR level ${level} about the theme "${theme}".
Rules:
- Exactly around ${wordCount} words
- No titles, subtitles, headers, or bullet points — only flowing prose
- Suitable for reading aloud at a steady pace
- Grammar and vocabulary strictly at ${level} level
After the main text, write the marker TRANSLATION: on a new line, then the full ${supportLang} translation.
Return only the text and translation. Nothing else.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'openai/gpt-oss-120b',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 2048,
        }),
    });

    if (!response.ok) throw new Error(await response.text());
    const result = await response.json();
    const full   = result.choices?.[0]?.message?.content || '';
    // "TRANSLATION:" is the current marker; keep legacy "TRADUÇÃO:" working too
    const parts  = full.split(/TRANSLATION:|TRADUÇÃO:/i);
    return {
        mainText:    parts[0].trim(),
        translation: parts[1]?.trim() || '',
    };
}

/* ─── Config Screen ───────────────────────────────────────────────────────── */

function ConfigScreen({ onStartAI, onStartOwn, language, level, error }) {
    const [theme,      setTheme]      = useState('Everyday');
    const [duration,   setDuration]   = useState(60);
    const [speed,      setSpeed]      = useState(40);
    const [fontSize,   setFontSize]   = useState(40);
    const [fontFamily, setFontFamily] = useState(FONT_OPTIONS[0].value);
    const [guideLine,  setGuideLine]  = useState(true);
    const [mode,       setMode]       = useState('ai');
    const [ownText,    setOwnText]    = useState('');

    const wordCount = ownText.trim() ? ownText.trim().split(/\s+/).length : 0;

    const displaySettings = { speed, fontSize, fontFamily, guideLine };

    const inputClass =
        "w-full px-3.5 py-2.5 rounded-lg border border-line bg-surface text-sm text-ink placeholder:text-muted/60 outline-none focus-ring focus:border-primary transition-colors";

    return (
        <div className="min-h-screen pb-10">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-surface border-b border-line px-5 h-14 flex items-center gap-3">
                <a href="/dashboard" aria-label="Back"
                    className="p-2 -ml-2 text-muted hover:text-ink transition-colors focus-ring">
                    <ArrowLeft size={17}/>
                </a>
                <div>
                    <h1 className="font-display font-bold tracking-tight text-sm">Teleprompter</h1>
                    <p className="text-[12px] text-muted leading-tight">Leitura em voz alta</p>
                </div>
            </header>

            <div className="max-w-xl mx-auto px-5 pt-6 space-y-6">

                {error && (
                    <p role="alert" className="text-danger bg-danger-soft border border-danger/20 rounded-lg px-3.5 py-2.5 text-[13px]">
                        {error}
                    </p>
                )}

                {/* Context line */}
                <p className="text-[13px] text-muted">
                    {getLangName(language)} · {level}
                </p>

                {/* Theme + Duration (AI only) */}
                {mode === 'ai' && (
                    <fieldset>
                        <legend className="text-[13px] font-medium mb-2">Tema</legend>
                        <div className="flex flex-wrap gap-1.5">
                            {THEMES.map(t => {
                                const active = theme === t;
                                return (
                                    <button key={t} onClick={() => setTheme(t)}
                                        aria-pressed={active}
                                        className={`px-3 py-1.5 rounded-md text-[13px] border transition-colors focus-ring ${
                                            active
                                                ? 'border-primary bg-primary-soft text-primary font-medium'
                                                : 'border-line text-muted hover:border-muted/50'
                                        }`}>
                                        {t}
                                    </button>
                                );
                            })}
                        </div>

                        <label htmlFor="tp-duration" className="block text-[13px] font-medium mt-5 mb-1.5">
                            Length — {duration}s (~{Math.round((duration / 60) * 130)} words)
                        </label>
                        <input id="tp-duration" type="range" min={30} max={180} step={15} value={duration}
                            onChange={e => setDuration(Number(e.target.value))}
                            className="w-full accent-primary" />
                    </fieldset>
                )}

                {/* Mode selector */}
                <div>
                    <div className="flex bg-sunken rounded-lg p-1 mb-4">
                        {[{ value: 'ai', label: 'Generate with AI' }, { value: 'own', label: 'My text' }].map(({ value, label }) => (
                            <button key={value} onClick={() => setMode(value)}
                                aria-pressed={mode === value}
                                className={`flex-1 py-2 rounded-md text-[13px] font-medium transition-colors focus-ring ${
                                    mode === value
                                        ? 'bg-surface text-ink border border-line'
                                        : 'text-muted hover:text-ink'
                                }`}>
                                {label}
                            </button>
                        ))}
                    </div>

                    {mode === 'own' ? (
                        <div>
                            <textarea
                                value={ownText}
                                onChange={e => setOwnText(e.target.value)}
                                placeholder="Paste or type your text here…"
                                rows={6}
                                className={`${inputClass} resize-none leading-relaxed`}
                            />
                            <p className="text-[12px] text-muted mt-1 text-right tabular-nums">{wordCount} palavras</p>
                            <button
                                onClick={() => onStartOwn({ text: ownText, ...displaySettings })}
                                disabled={!ownText.trim()}
                                className="w-full mt-3 py-3 rounded-lg text-sm font-semibold transition-colors focus-ring
                                           bg-primary text-white hover:bg-primary-dark
                                           disabled:bg-sunken disabled:text-muted/60 disabled:cursor-not-allowed">
                                Start
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => onStartAI({ language, level, theme, duration, ...displaySettings })}
                            className="w-full py-3 rounded-lg text-sm font-semibold transition-colors focus-ring
                                       bg-primary text-white hover:bg-primary-dark">
                            Generate text with AI
                        </button>
                    )}
                </div>

                {/* Display settings */}
                <details className="group">
                    <summary className="text-[13px] font-medium cursor-pointer select-none list-none
                                        flex items-center justify-between py-3 border-t border-line">
                            Display settings
                        <span className="text-muted text-[12px] group-open:hidden">mostrar</span>
                        <span className="text-muted text-[12px] hidden group-open:inline">ocultar</span>
                    </summary>

                    <div className="space-y-5 pt-4 pb-2">
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <span className="text-[13px] text-muted">Speed</span>
                                <span className="text-[13px] tabular-nums">{speed}</span>
                            </div>
                            <input type="range" min={10} max={120} value={speed}
                                onChange={e => setSpeed(Number(e.target.value))}
                                className="w-full accent-primary" />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <span className="text-[13px] text-muted">Tamanho da fonte</span>
                                <span className="text-[13px] tabular-nums">{fontSize}px</span>
                            </div>
                            <input type="range" min={24} max={96} value={fontSize}
                                onChange={e => setFontSize(Number(e.target.value))}
                                className="w-full accent-primary" />
                        </div>

                        <div>
                            <span className="text-[13px] text-muted block mb-1.5">Font</span>
                            <div className="grid grid-cols-3 gap-1.5">
                                {FONT_OPTIONS.map(f => {
                                    const active = fontFamily === f.value;
                                    return (
                                        <button key={f.value} onClick={() => setFontFamily(f.value)}
                                            aria-pressed={active}
                                            style={{ fontFamily: f.value }}
                                            className={`py-2 rounded-md text-[13px] border transition-colors focus-ring ${
                                                active
                                                    ? 'border-primary bg-primary-soft text-primary font-medium'
                                                    : 'border-line text-muted hover:border-muted/50'
                                            }`}>
                                            {f.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <label className="flex items-center justify-between py-1 cursor-pointer">
                            <span className="text-[13px] text-muted">Linha guia</span>
                            <input type="checkbox" checked={guideLine} onChange={() => setGuideLine(g => !g)}
                                className="w-4 h-4 accent-primary"/>
                        </label>
                    </div>
                </details>
            </div>
        </div>
    );
}

/* ─── Generating Screen ───────────────────────────────────────────────────── */

function GeneratingScreen({ params }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-8 text-center bg-ink">
            <span className="w-7 h-7 border-2 border-white/25 border-t-white rounded-full animate-spin"/>
            <div>
                <h2 className="text-paper font-display font-bold tracking-tight text-lg mb-1">Generating text…</h2>
                <p className="text-paper/50 text-sm">
                    {[getLangName(params.language), params.level, params.theme].filter(Boolean).join(' · ')}
                </p>
            </div>
        </div>
    );
}

/* ─── Prompter Screen ─────────────────────────────────────────────────────── */

function PrompterScreen({ mainText, translation, settings, aiMode, onClose, onRegenerate }) {
    const [isPlaying,      setIsPlaying]      = useState(false);
    const [progress,       setProgress]       = useState(0);
    const [showTranslation, setShowTranslation] = useState(false);
    const [speed,          setSpeed]          = useState(settings.speed);
    const [fontSize,       setFontSize]       = useState(settings.fontSize);

    const containerRef  = useRef(null);
    const contentRef    = useRef(null);
    const rafRef        = useRef(null);
    const lastTimeRef   = useRef(null);
    const scrollYRef    = useRef(0);
    const speedRef      = useRef(speed);
    const fontSizeRef   = useRef(fontSize);

    useEffect(() => { speedRef.current = speed; }, [speed]);
    useEffect(() => { fontSizeRef.current = fontSize; }, [fontSize]);

    const getMaxScroll = useCallback(() => {
        if (!contentRef.current || !containerRef.current) return 0;
        return Math.max(0, contentRef.current.scrollHeight - containerRef.current.clientHeight);
    }, []);

    const applyScroll = useCallback(() => {
        if (contentRef.current) {
            contentRef.current.style.transform = `translateY(-${scrollYRef.current}px)`;
        }
    }, []);

    const animate = useCallback((timestamp) => {
        if (!lastTimeRef.current) lastTimeRef.current = timestamp;
        const delta = Math.min((timestamp - lastTimeRef.current) / 1000, 0.1); // cap at 100ms
        lastTimeRef.current = timestamp;

        const maxScroll = getMaxScroll();
        scrollYRef.current = Math.min(scrollYRef.current + speedRef.current * delta, maxScroll);
        applyScroll();
        setProgress(maxScroll > 0 ? scrollYRef.current / maxScroll : 0);

        if (scrollYRef.current >= maxScroll) {
            setIsPlaying(false);
            return;
        }
        rafRef.current = requestAnimationFrame(animate);
    }, [getMaxScroll, applyScroll]);

    const play = useCallback(() => {
        lastTimeRef.current = null;
        setIsPlaying(true);
        rafRef.current = requestAnimationFrame(animate);
    }, [animate]);

    const pause = useCallback(() => {
        setIsPlaying(false);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }, []);

    const restart = useCallback(() => {
        pause();
        scrollYRef.current = 0;
        applyScroll();
        setProgress(0);
    }, [pause, applyScroll]);

    useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

    const togglePlay = () => isPlaying ? pause() : play();

    const accent = getAccent(settings.language);
    const langBadge = getLangName(settings.language);

    return (
        <div className="fixed inset-0 flex flex-col bg-ink">

            {/* Progress bar */}
            <div className="absolute top-0 left-0 right-0 h-1 z-30" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div className="h-full transition-none" style={{ width: `${progress * 100}%`, background: accent }} />
            </div>

            {/* Top bar */}
            <div className="relative z-20 flex items-center justify-between px-4 pt-5 pb-3 gap-3">
                <p className="text-[12px] text-white/50 truncate">
                    {[langBadge, settings.level, aiMode ? settings.theme : 'My own text']
                        .filter(Boolean)
                        .join(' · ')}
                </p>
                <div className="flex items-center gap-2 flex-shrink-0">
                    {aiMode && (
                        <button onClick={() => setShowTranslation(t => !t)}
                            className="p-2 rounded-xl text-white/50 hover:text-white transition-colors">
                            {showTranslation ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    )}
                    <button onClick={onClose}
                        className="p-2 rounded-xl text-white/50 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Guide line */}
            {settings.guideLine && (
                <div className="absolute inset-x-0 z-10 pointer-events-none"
                    style={{
                        top: '50%',
                        height: `${fontSize * 1.6}px`,
                        transform: 'translateY(-50%)',
                        background: 'rgba(255,255,255,0.04)',
                        borderTop: `1px solid rgba(255,255,255,0.06)`,
                        borderBottom: `1px solid rgba(255,255,255,0.06)`,
                    }} />
            )}

            {/* Text area */}
            <div ref={containerRef} className="flex-1 overflow-hidden relative">
                <div ref={contentRef} style={{
                    paddingTop: '50vh',
                    paddingBottom: '50vh',
                    paddingLeft: '1.5rem',
                    paddingRight: '1.5rem',
                    transform: 'none',
                }}>
                    <p style={{
                        fontSize: `${fontSize}px`,
                        fontFamily: settings.fontFamily,
                        lineHeight: 1.55,
                        color: 'white',
                        fontWeight: 600,
                        maxWidth: '42rem',
                        margin: '0 auto',
                        whiteSpace: 'pre-wrap',
                    }}>
                        {mainText}
                    </p>
                </div>
            </div>

            {/* Translation panel */}
            {aiMode && showTranslation && (
                <div className="absolute bottom-28 left-0 right-0 z-20 px-4">
                    <div className="max-w-xl mx-auto rounded-lg p-4 overflow-y-auto max-h-44 border border-white/10"
                        style={{ background: 'rgba(0,0,0,0.6)' }}>
                        <p className="text-[11px] font-medium uppercase tracking-wide mb-2 text-paper/40">Translation</p>
                        <p className="text-white/70 text-sm leading-relaxed">{translation}</p>
                    </div>
                </div>
            )}

            {/* Controls */}
            <div className="relative z-20 px-4 pb-6 pt-3 border-t border-white/10 bg-ink">
                {/* Sliders */}
                <div className="max-w-xl mx-auto grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <div className="flex justify-between text-[11px] font-medium text-white/40 mb-1">
                            <span>Speed</span><span>{speed}</span>
                        </div>
                        <input type="range" min={10} max={120} value={speed}
                            onChange={e => setSpeed(Number(e.target.value))}
                            className="w-full" style={{ accentColor: accent }} />
                    </div>
                    <div>
                        <div className="flex justify-between text-[11px] font-medium text-white/40 mb-1">
                            <span>Fonte</span><span>{fontSize}px</span>
                        </div>
                        <input type="range" min={24} max={96} value={fontSize}
                            onChange={e => setFontSize(Number(e.target.value))}
                            className="w-full" style={{ accentColor: accent }} />
                    </div>
                </div>

                {/* Buttons */}
                <div className="max-w-xl mx-auto flex items-center justify-center gap-3">
                    <button onClick={restart}
                        aria-label="Restart"
                        className="p-3 rounded-lg text-white/50 hover:text-white transition-colors focus-ring"
                        style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <RotateCcw className="w-5 h-5" />
                    </button>

                    <button onClick={togglePlay}
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                        className="w-14 h-14 rounded-lg flex items-center justify-center text-white transition-[filter] hover:brightness-110 focus-ring"
                        style={{ background: accent }}>
                        {isPlaying
                            ? <Pause className="w-6 h-6" />
                            : <Play  className="w-6 h-6 translate-x-0.5" />}
                    </button>

                    <button onClick={onRegenerate}
                        aria-label="Regenerate"
                        className="p-3 rounded-lg text-white/50 hover:text-white transition-colors focus-ring"
                        style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Main Orchestrator ───────────────────────────────────────────────────── */

export const TeleprompterView = () => {
    const { currentLanguage, userProfile } = useContent();
    const [view,        setView]        = useState('config');
    const [aiParams,    setAiParams]    = useState(null);
    const [mainText,    setMainText]    = useState('');
    const [translation, setTranslation] = useState('');
    const [settings,    setSettings]    = useState(null);
    const [isAiMode,    setIsAiMode]    = useState(true);
    const [error,       setError]       = useState(null);

    const runGeneration = async (params) => {
        setAiParams(params);
        setSettings(params);
        setIsAiMode(true);
        setView('generating');
        setError(null);
        try {
            const apiKey = import.meta.env.VITE_GROQ_API_KEY;
            const { mainText: t, translation: tr } = await generateTeleprompterText({
                ...params,
                supportLanguage: userProfile?.supportLanguage || 'portuguese',
                apiKey,
            });
            setMainText(t);
            setTranslation(tr);
            setView('prompter');
        } catch (e) {
            console.error('[Teleprompter]', e);
            setError('Failed to generate. Please try again.');
            setView('config');
        }
    };

    const handleStartOwn = ({ text, ...display }) => {
        setMainText(text);
        setTranslation('');
        setSettings({ ...display, language: currentLanguage });
        setIsAiMode(false);
        setView('prompter');
    };

    const handleClose = () => {
        setView('config');
        setMainText('');
        setTranslation('');
    };

    const handleRegenerate = () => {
        if (isAiMode && aiParams) {
            runGeneration(aiParams);
        } else {
            setView('config');
        }
    };

    if (view === 'generating') return <GeneratingScreen params={aiParams} />;

    if (view === 'prompter') return (
        <PrompterScreen
            mainText={mainText}
            translation={translation}
            settings={settings}
            aiMode={isAiMode}
            onClose={handleClose}
            onRegenerate={handleRegenerate}
        />
    );

    return (
        <ConfigScreen
            language={currentLanguage}
            level={userProfile?.level || 'B1'}
            onStartAI={runGeneration}
            onStartOwn={handleStartOwn}
            error={error}
        />
    );
};
