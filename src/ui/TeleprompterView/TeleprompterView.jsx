import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, Play, Pause, RotateCcw, RefreshCw, Eye, EyeOff, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useContent } from '../../contexts/ContentContext.jsx';

const display = { fontFamily: "'Bricolage Grotesque', sans-serif" };
const body    = { fontFamily: "'DM Sans', sans-serif" };

const THEMES = ['Travel', 'Business', 'Everyday', 'Technology', 'Health', 'Cooking', 'Culture', 'Sports', 'Science', 'News'];
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const FONT_OPTIONS = [
    { label: 'Sans', value: "'DM Sans', sans-serif" },
    { label: 'Serif', value: 'Georgia, serif' },
    { label: 'Mono', value: "'Courier New', monospace" },
];

function getLangName(language) {
    if (language === 'czech')   return 'Czech';
    if (language === 'spanish') return 'Spanish';
    return 'English';
}

function getAccent(language) {
    if (language === 'czech')   return '#D71920';
    if (language === 'spanish') return '#F5A623';
    return '#11457E';
}

async function generateTeleprompterText({ language, level, theme, duration, apiKey }) {
    const wordCount = Math.round((duration / 60) * 130);
    const langName  = getLangName(language);

    const prompt = `Generate a continuous, natural ${langName} text at CEFR level ${level} about the theme "${theme}".
Rules:
- Exactly around ${wordCount} words
- No titles, subtitles, headers, or bullet points — only flowing prose
- Suitable for reading aloud at a steady pace
- Grammar and vocabulary strictly at ${level} level
After the main text, write the marker TRADUÇÃO: on a new line, then the full Brazilian Portuguese translation.
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
    const parts  = full.split(/TRADUÇÃO:/i);
    return {
        mainText:    parts[0].trim(),
        translation: parts[1]?.trim() || '',
    };
}

/* ─── Config Screen ───────────────────────────────────────────────────────── */

function ConfigScreen({ onStartAI, onStartOwn, language, level }) {
    const [theme,      setTheme]      = useState('Everyday');
    const [duration,   setDuration]   = useState(60);
    const [speed,      setSpeed]      = useState(40);
    const [fontSize,   setFontSize]   = useState(40);
    const [fontFamily, setFontFamily] = useState(FONT_OPTIONS[0].value);
    const [guideLine,  setGuideLine]  = useState(true);
    const [mode,       setMode]       = useState('ai');
    const [ownText,    setOwnText]    = useState('');

    const accent = getAccent(language);
    const wordCount = ownText.trim() ? ownText.trim().split(/\s+/).length : 0;

    const displaySettings = { speed, fontSize, fontFamily, guideLine };

    return (
        <div className="min-h-screen pb-10" style={{ background: '#F7F5F0', ...body }}>
            {/* Header */}
            <header className="sticky top-0 z-10 bg-white border-b border-[#E5E0D8] px-5 py-4 flex items-center gap-3">
                <a href="/dashboard" className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                </a>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Practice</p>
                    <h1 className="text-sm font-black text-slate-800" style={display}>Teleprompter</h1>
                </div>
            </header>

            <div className="max-w-xl mx-auto px-5 pt-6 space-y-5">

                {/* Profile badge */}
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black px-3 py-1.5 rounded-full text-white"
                        style={{ background: accent }}>
                        {getLangName(language)}
                    </span>
                    <span className="text-[10px] font-black px-3 py-1.5 rounded-full text-slate-600 border border-[#E5E0D8] bg-white">
                        {level}
                    </span>
                </div>

                {/* Theme + Duration (AI only) */}
                {mode === 'ai' && (
                    <div className="bg-white rounded-[1.5rem] p-5 border border-[#E5E0D8] space-y-4">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3">Theme</label>
                            <div className="flex flex-wrap gap-2">
                                {THEMES.map(t => (
                                    <button key={t} onClick={() => setTheme(t)}
                                        className="px-3 py-1.5 rounded-full text-xs font-bold transition-all border"
                                        style={{
                                            background: theme === t ? accent : 'white',
                                            color: theme === t ? 'white' : '#64748b',
                                            borderColor: theme === t ? accent : '#E5E0D8',
                                        }}>
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
                                Duration — {duration}s (~{Math.round((duration / 60) * 130)} words)
                            </label>
                            <input type="range" min={30} max={180} step={15} value={duration}
                                onChange={e => setDuration(Number(e.target.value))}
                                className="w-full accent-current" style={{ color: accent }} />
                            <div className="flex justify-between text-[9px] text-slate-400 font-bold mt-1">
                                <span>30s</span><span>3 min</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Display settings */}
                <div className="bg-white rounded-[1.5rem] p-5 border border-[#E5E0D8] space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Display</label>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-slate-600">Speed</span>
                            <span className="text-xs font-black text-slate-800">{speed}</span>
                        </div>
                        <input type="range" min={10} max={120} value={speed}
                            onChange={e => setSpeed(Number(e.target.value))}
                            className="w-full" style={{ accentColor: accent }} />
                        <div className="flex justify-between text-[9px] text-slate-400 font-bold mt-1">
                            <span>Slow</span><span>Fast</span>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-slate-600">Font size</span>
                            <span className="text-xs font-black text-slate-800">{fontSize}px</span>
                        </div>
                        <input type="range" min={24} max={96} value={fontSize}
                            onChange={e => setFontSize(Number(e.target.value))}
                            className="w-full" style={{ accentColor: accent }} />
                        <div className="flex justify-between text-[9px] text-slate-400 font-bold mt-1">
                            <span>24px</span><span>96px</span>
                        </div>
                    </div>

                    <div>
                        <span className="text-xs font-bold text-slate-600 block mb-2">Font family</span>
                        <div className="grid grid-cols-3 gap-2">
                            {FONT_OPTIONS.map(f => (
                                <button key={f.value} onClick={() => setFontFamily(f.value)}
                                    className="py-2 rounded-xl text-xs font-bold border-2 transition-all"
                                    style={{
                                        fontFamily: f.value,
                                        background: fontFamily === f.value ? accent : 'white',
                                        color: fontFamily === f.value ? 'white' : '#64748b',
                                        borderColor: fontFamily === f.value ? accent : '#E5E0D8',
                                    }}>
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <button onClick={() => setGuideLine(g => !g)}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-bold border-2 transition-all"
                            style={{
                                background: guideLine ? accent : 'white',
                                color: guideLine ? 'white' : '#64748b',
                                borderColor: guideLine ? accent : '#E5E0D8',
                            }}>
                            Guide line
                        </button>
                    </div>
                </div>

                {/* Mode selector */}
                <div className="bg-white rounded-[1.5rem] p-5 border border-[#E5E0D8]">
                    <div className="flex rounded-2xl border border-[#E5E0D8] overflow-hidden mb-4">
                        {[{ value: 'ai', label: 'Generate with AI' }, { value: 'own', label: 'My own text' }].map(({ value, label }) => (
                            <button key={value} onClick={() => setMode(value)}
                                className="flex-1 py-2.5 text-xs font-black transition-all"
                                style={{
                                    background: mode === value ? accent : 'white',
                                    color: mode === value ? 'white' : '#94a3b8',
                                }}>
                                {label}
                            </button>
                        ))}
                    </div>

                    {mode === 'own' ? (
                        <div>
                            <textarea
                                value={ownText}
                                onChange={e => setOwnText(e.target.value)}
                                placeholder="Paste or type your text here..."
                                rows={6}
                                className="w-full p-4 rounded-2xl border-2 border-[#E5E0D8] text-sm text-slate-700 resize-none outline-none focus:border-slate-400 transition-colors"
                                style={body}
                            />
                            <p className="text-[10px] text-slate-400 font-bold mt-1 text-right">{wordCount} words</p>
                            <button
                                onClick={() => onStartOwn({ text: ownText, ...displaySettings })}
                                disabled={!ownText.trim()}
                                className="w-full mt-3 py-4 rounded-2xl text-sm font-black text-white transition-all"
                                style={{ background: ownText.trim() ? accent : '#CBD5E1', cursor: ownText.trim() ? 'pointer' : 'not-allowed' }}>
                                Start
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => onStartAI({ language, level, theme, duration, ...displaySettings })}
                            className="w-full py-4 rounded-2xl text-sm font-black text-white transition-all hover:brightness-110 active:scale-[0.98]"
                            style={{ background: accent }}>
                            Generate text with AI
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ─── Generating Screen ───────────────────────────────────────────────────── */

function GeneratingScreen({ params }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-8 text-center"
            style={{ background: '#0D1B2A', ...body }}>
            <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center animate-pulse"
                style={{ background: getAccent(params.language) }}>
                <Mic className="w-8 h-8 text-white" />
            </div>
            <div>
                <h2 className="text-white font-black text-xl mb-2" style={display}>Generating text…</h2>
                <p className="text-white/50 text-sm font-medium">Preparing your reading session</p>
            </div>
            <div className="flex gap-2 mt-2">
                {[getLangName(params.language), params.level, params.theme].map(b => (
                    <span key={b} className="text-[10px] font-black px-3 py-1.5 rounded-full text-white/70"
                        style={{ background: 'rgba(255,255,255,0.08)' }}>
                        {b}
                    </span>
                ))}
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
        <div className="fixed inset-0 flex flex-col" style={{ background: '#0D1B2A' }}>

            {/* Progress bar */}
            <div className="absolute top-0 left-0 right-0 h-1 z-30" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div className="h-full transition-none" style={{ width: `${progress * 100}%`, background: accent }} />
            </div>

            {/* Top bar */}
            <div className="relative z-20 flex items-center justify-between px-4 pt-5 pb-3 gap-3">
                <div className="flex gap-2 flex-wrap">
                    {[langBadge, settings.level, aiMode ? settings.theme : 'Custom text']
                        .filter(Boolean)
                        .map(b => (
                            <span key={b} className="text-[10px] font-black px-2.5 py-1 rounded-full text-white/60"
                                style={{ background: 'rgba(255,255,255,0.08)' }}>
                                {b}
                            </span>
                        ))}
                </div>
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
                    <div className="max-w-xl mx-auto rounded-2xl p-4 overflow-y-auto max-h-44 border border-white/10"
                        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }}>
                        <p className="text-[10px] font-black uppercase tracking-widest mb-2"
                            style={{ color: accent }}>Translation</p>
                        <p className="text-white/70 text-sm leading-relaxed">{translation}</p>
                    </div>
                </div>
            )}

            {/* Controls */}
            <div className="relative z-20 px-4 pb-6 pt-3" style={{ background: 'rgba(13,27,42,0.95)', backdropFilter: 'blur(8px)' }}>
                {/* Sliders */}
                <div className="max-w-xl mx-auto grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <div className="flex justify-between text-[9px] font-black text-white/30 mb-1">
                            <span>Speed</span><span>{speed}</span>
                        </div>
                        <input type="range" min={10} max={120} value={speed}
                            onChange={e => setSpeed(Number(e.target.value))}
                            className="w-full" style={{ accentColor: accent }} />
                    </div>
                    <div>
                        <div className="flex justify-between text-[9px] font-black text-white/30 mb-1">
                            <span>Font size</span><span>{fontSize}px</span>
                        </div>
                        <input type="range" min={24} max={96} value={fontSize}
                            onChange={e => setFontSize(Number(e.target.value))}
                            className="w-full" style={{ accentColor: accent }} />
                    </div>
                </div>

                {/* Buttons */}
                <div className="max-w-xl mx-auto flex items-center justify-center gap-3">
                    <button onClick={restart}
                        className="p-3 rounded-2xl text-white/50 hover:text-white transition-colors"
                        style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <RotateCcw className="w-5 h-5" />
                    </button>

                    <button onClick={togglePlay}
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-white transition-all hover:brightness-110 active:scale-95"
                        style={{ background: accent }}>
                        {isPlaying
                            ? <Pause className="w-6 h-6" />
                            : <Play  className="w-6 h-6 translate-x-0.5" />}
                    </button>

                    <button onClick={onRegenerate}
                        className="p-3 rounded-2xl text-white/50 hover:text-white transition-colors"
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
            const { mainText: t, translation: tr } = await generateTeleprompterText({ ...params, apiKey });
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
