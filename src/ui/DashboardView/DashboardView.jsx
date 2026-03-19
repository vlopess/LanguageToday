import {
    ALargeSmall, BookOpen, Briefcase, ChevronRight, Hash,
    HelpCircle, LogOut, MessageCircle, Pin,
    RefreshCw, User, Globe, Home, Plane, Coffee, Zap,
    ShoppingCart, Heart, Star, Leaf, Music, Camera, Code,
    Sun, Moon, Utensils, Stethoscope, GraduationCap, Building,
    Mic, Timer, Flame, CalendarDays, Clock,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useContent } from "../../contexts/ContentContext.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useTimer } from "../../contexts/TimerContext.jsx";
import { BottomNavBar } from "../BottomNavBar/BottomNavBar.jsx";
import Catharina from "../../assets/Catharina.png";
import LogoCzech from "../../assets/logo.png";
import LogoEnglish from "../../assets/logo_en.png";
import LogoSp from "../../assets/logo_espanhol.png";
import { getStudySessions } from "../../lib/db.js";

const display = { fontFamily: "'Bricolage Grotesque', sans-serif" };
const body    = { fontFamily: "'DM Sans', sans-serif" };

/* Apple system colors */
const C = {
    bg:        '#F2F2F7',
    card:      '#FFFFFF',
    label:     '#1D1D1F',
    secondary: '#3C3C43',
    tertiary:  '#8E8E93',
    fill:      'rgba(120,120,128,0.12)',
    separator: 'rgba(60,60,67,0.12)',
    brand:     '#11457E',
    red:       '#D71920',
};

const shadow = { boxShadow: '0 2px 16px rgba(0,0,0,0.07), 0 0 0 0.5px rgba(0,0,0,0.04)' };

/* ── Icon map ── */
const EMOJI_ICON_MAP = {
    '👋': User,         '👔': Briefcase,      '💬': MessageCircle,
    '🆘': HelpCircle,   '🔤': ALargeSmall,    '🔢': Hash,
    '📚': BookOpen,     '🌍': Globe,           '🏠': Home,
    '✈️': Plane,        '☕': Coffee,          '⚡': Zap,
    '🛒': ShoppingCart, '❤️': Heart,           '⭐': Star,
    '🌿': Leaf,         '🎵': Music,           '📷': Camera,
    '💻': Code,         '☀️': Sun,             '🌙': Moon,
    '🍽️': Utensils,    '🩺': Stethoscope,     '🎓': GraduationCap,
    '🏢': Building,
};

const TOPIC_COLORS = [
    { bg: '#EBF2FB', color: '#11457E' },
    { bg: '#FDEAEA', color: '#D71920' },
    { bg: '#E8F8EF', color: '#248A52' },
    { bg: '#FFF3E0', color: '#C2680B' },
    { bg: '#F0EEFF', color: '#5E35B1' },
    { bg: '#FCE4F0', color: '#C2185B' },
];

/* ── Helpers ── */
function computeStreak(sessions) {
    if (!sessions.length) return 0;
    const days = [...new Set(
        sessions.map(s => new Date(s.completed_at).toDateString())
    )].sort((a, b) => new Date(b) - new Date(a));
    const today     = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (days[0] !== today && days[0] !== yesterday) return 0;
    let streak = 0;
    let cursor = new Date(days[0]);
    for (const day of days) {
        const d = new Date(day);
        if (Math.round((cursor - d) / 86400000) <= 1) { streak++; cursor = d; }
        else break;
    }
    return streak;
}

function computeWeekStats(sessions) {
    const cutoff = Date.now() - 7 * 86400000;
    const week   = sessions.filter(s => new Date(s.completed_at).getTime() >= cutoff);
    return { count: week.length, minutes: week.reduce((a, s) => a + s.duration_minutes, 0) };
}

/* ── Timer widget ── */
function TimerWidget() {
    const { secondsLeft, progress } = useTimer();
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    const pct  = progress * 100;

    return (
        <div className="bg-white rounded-2xl px-4 py-3.5" style={shadow}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                         style={{ background: '#EBF2FB' }}>
                        <Timer className="w-3.5 h-3.5" style={{ color: C.brand }} strokeWidth={2.5}/>
                    </div>
                    <span className="text-[13px] font-medium" style={{ color: C.tertiary }}>
                        Session Timer
                    </span>
                </div>
                <span className="text-[15px] font-bold tabular-nums" style={{ color: C.label, ...display }}>
                    {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
                </span>
            </div>
            <div className="h-[3px] rounded-full overflow-hidden" style={{ background: C.fill }}>
                <div className="h-full rounded-full transition-all duration-1000"
                     style={{ width: `${pct}%`, background: pct >= 100 ? '#34C759' : C.brand }}/>
            </div>
        </div>
    );
}

/* ── Stats row ── */
function StatsRow({ sessions }) {
    const streak    = computeStreak(sessions);
    const weekStats = computeWeekStats(sessions);

    const stats = [
        { icon: Flame,        value: streak,            label: 'Streak',   accent: '#FF9500', bg: '#FFF3E0' },
        { icon: CalendarDays, value: weekStats.count,   label: 'This week', accent: C.brand,  bg: '#EBF2FB' },
        { icon: Clock,        value: weekStats.minutes, label: 'Minutes',  accent: C.red,     bg: '#FDEAEA' },
    ];

    return (
        <div className="grid grid-cols-3 gap-2.5">
            {stats.map(({ icon: Icon, value, label, accent, bg }) => (
                <div key={label} className="bg-white rounded-2xl p-3.5 flex flex-col items-center text-center"
                     style={shadow}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2"
                         style={{ background: bg }}>
                        <Icon className="w-4 h-4" style={{ color: accent }} strokeWidth={2.5}/>
                    </div>
                    <span className="text-[22px] font-bold leading-none" style={{ color: C.label, ...display }}>
                        {value}
                    </span>
                    <span className="text-[10px] font-medium mt-1.5 uppercase tracking-wide"
                          style={{ color: C.tertiary }}>
                        {label}
                    </span>
                </div>
            ))}
        </div>
    );
}

/* ── Academic path list ── */
function AcademicList({ studyMaterial, onSelect }) {
    if (!studyMaterial.length) return null;
    return (
        <div>
            <SectionLabel>Academic Path</SectionLabel>
            <div className="bg-white rounded-2xl overflow-hidden" style={shadow}>
                {studyMaterial.map((mat, i) => {
                    const Icon  = EMOJI_ICON_MAP[mat.emoji] ?? BookOpen;
                    const theme = TOPIC_COLORS[i % TOPIC_COLORS.length];
                    return (
                        <button key={i} onClick={() => onSelect(mat)}
                                className="w-full flex items-center gap-3.5 px-4 py-3 text-left
                                           hover:bg-black/[0.025] active:bg-black/[0.04] transition-colors"
                                style={{ borderTop: i > 0 ? `1px solid ${C.separator}` : 'none' }}>
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                                 style={{ background: theme.bg }}>
                                <Icon className="w-4 h-4" style={{ color: theme.color }} strokeWidth={2}/>
                            </div>
                            <span className="flex-1 text-[14px] font-medium" style={{ color: C.label }}>
                                {mat.topic}
                            </span>
                            <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: '#C7C7CC' }}/>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

/* ════════════════════════════════════════ */
export const DashboardView = () => {
    const {
        sessionTasks, reviewTasks,
        setSelectedStory, sessionStories,
        setSelectedStudyTopic, studyMaterial,
        savedStories, currentLanguage, userProfile,
    } = useContent();
    const { signOut, userId } = useAuth();
    const { lastCompletedAt } = useTimer();
    const navigate = useNavigate();

    const [studySessions, setStudySessions] = useState([]);

    useEffect(() => {
        if (!userId) return;
        getStudySessions(userId, currentLanguage).then(setStudySessions);
    }, [userId, currentLanguage, lastCompletedAt]);

    const handleSignOut = async () => { await signOut(); navigate('/'); };

    const initial   = userProfile?.name?.[0]?.toUpperCase() || '?';
    const langLabel = currentLanguage === 'english' ? 'English'
                    : currentLanguage === 'spanish' ? 'Spanish' : 'Czech';

    const handleAcademicSelect = (mat) => {
        setSelectedStudyTopic(mat);
        navigate('/academic');
    };

    return (
        <div className="min-h-screen pb-24" style={{ background: C.bg, ...body }}>

            {/* ── HEADER ── */}
            <header className="sticky top-0 z-20"
                style={{
                    background: 'rgba(242,242,247,0.88)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderBottom: `1px solid ${C.separator}`,
                }}>
                <div className="max-w-5xl mx-auto flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-2.5">
                        <img src={currentLanguage === 'english' ? LogoEnglish : currentLanguage === 'czech' ? LogoCzech : LogoSp }
                             alt="Logo" width={68} className="opacity-90"/>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white"
                             style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                            <span className="text-[12px] font-medium" style={{ color: C.tertiary }}>
                                {langLabel}
                            </span>
                            <div className="w-px h-3" style={{ background: C.separator }}/>
                            <span className="text-[12px] font-semibold" style={{ color: C.brand }}>
                                {userProfile?.level || 'A1'}
                            </span>
                        </div>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center
                                        text-white text-xs font-semibold"
                             style={{ background: C.brand, ...display }}>
                            {initial}
                        </div>
                        <button onClick={handleSignOut}
                            className="p-1.5 rounded-xl transition-colors hover:bg-black/[0.06]"
                            style={{ color: C.tertiary }}>
                            <LogOut className="w-4 h-4"/>
                        </button>
                    </div>
                </div>
            </header>

            {/* ── LAYOUT ── */}
            <div className="max-w-5xl mx-auto px-5 pt-6
                            flex flex-col lg:flex-row lg:gap-7 lg:items-start">

                {/* ══════════════════════
                    SIDEBAR
                    ══════════════════════ */}
                <aside className="w-full lg:w-[300px] lg:flex-shrink-0
                                  lg:sticky lg:top-[57px] space-y-5">

                    {/* Welcome */}
                    <div className="px-1">
                        <p className="text-[12px] font-medium mb-0.5" style={{ color: C.tertiary }}>
                            Welcome back,
                        </p>
                        <h1 className="leading-tight mb-3"
                            style={{ ...display, fontWeight: 700, fontSize: 'clamp(2rem,7vw,2.4rem)', color: C.label }}>
                            {userProfile?.name || 'Learner'}.
                        </h1>
                        <div className="flex flex-wrap gap-1.5">
                            <span className="text-[12px] font-semibold px-2.5 py-1 rounded-full"
                                  style={{ background: 'rgba(17,69,126,0.1)', color: C.brand }}>
                                {langLabel}
                            </span>
                            <span className="text-[12px] font-semibold px-2.5 py-1 rounded-full"
                                  style={{ background: 'rgba(215,25,32,0.08)', color: C.red }}>
                                {userProfile?.level || 'A1'}
                            </span>
                            <span className="text-[12px] font-medium px-2.5 py-1 rounded-full"
                                  style={{ background: C.fill, color: C.tertiary }}>
                                {userProfile?.dailyTime || 15} min/day
                            </span>
                        </div>
                    </div>

                    {/* Timer */}
                    <TimerWidget />

                    {/* Stats */}
                    <div>
                        <SectionLabel>Study Frequency</SectionLabel>
                        <StatsRow sessions={studySessions}/>
                    </div>

                    {/* Academic path */}
                    <AcademicList studyMaterial={studyMaterial} onSelect={handleAcademicSelect}/>

                </aside>

                {/* ══════════════════════
                    MAIN CONTENT
                    ══════════════════════ */}
                <main className="flex-1 min-w-0 space-y-5 mt-5 lg:mt-0">

                    {/* Today's Session */}
                    <div>
                        <SectionLabel>Today's Session</SectionLabel>
                        <div className="grid grid-cols-2 gap-3">

                            <Link to="/lesson">
                                <div className="bg-white rounded-2xl overflow-hidden
                                                hover:scale-[1.02] active:scale-[0.98]
                                                transition-transform duration-200 cursor-pointer"
                                     style={shadow}>
                                    <div className="h-1 rounded-b-none" style={{ background: C.brand }}/>
                                    <div className="p-5 flex flex-col justify-between h-40">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                             style={{ background: '#EBF2FB' }}>
                                            <BookOpen className="w-5 h-5" style={{ color: C.brand }}/>
                                        </div>
                                        <div>
                                            <p className="text-[32px] font-bold leading-none"
                                               style={{ color: C.label, ...display }}>
                                                {String(sessionTasks.length).padStart(2, '0')}
                                            </p>
                                            <p className="text-[12px] font-medium mt-1"
                                               style={{ color: C.tertiary }}>
                                                Tasks today
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Link>

                            <Link to="/flashcard">
                                <div className="bg-white rounded-2xl overflow-hidden
                                                hover:scale-[1.02] active:scale-[0.98]
                                                transition-transform duration-200 cursor-pointer"
                                     style={shadow}>
                                    <div className="h-1 rounded-b-none" style={{ background: '#3C3C43' }}/>
                                    <div className="p-5 flex flex-col justify-between h-40">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                             style={{ background: 'rgba(60,60,67,0.08)' }}>
                                            <RefreshCw className="w-5 h-5" style={{ color: '#3C3C43' }}/>
                                        </div>
                                        <div>
                                            <p className="text-[32px] font-bold leading-none"
                                               style={{ color: C.label, ...display }}>
                                                {String(reviewTasks.length).padStart(2, '0')}
                                            </p>
                                            <p className="text-[12px] font-medium mt-1"
                                               style={{ color: C.tertiary }}>
                                                Flashcards
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Link>

                        </div>
                    </div>

                    {/* AI Language Tutor */}
                    <div>
                        <SectionLabel>AI Language Tutor</SectionLabel>
                        <div className="space-y-3">

                            {/* Catharina — featured card */}
                            <Link to="/chat">
                                <div className="group relative rounded-2xl overflow-hidden cursor-pointer
                                                hover:scale-[1.01] active:scale-[0.99]
                                                transition-transform duration-200"
                                     style={{
                                         background: 'linear-gradient(135deg, #0D1B2A 0%, #11457E 100%)',
                                         minHeight: 156,
                                         boxShadow: '0 4px 24px rgba(17,69,126,0.28)',
                                     }}>
                                    <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full pointer-events-none"
                                         style={{ border: '20px solid rgba(255,255,255,0.04)' }}/>
                                    <div className="relative z-10 p-6 max-w-[62%]">
                                        <p className="text-[11px] font-semibold uppercase tracking-widest mb-2"
                                           style={{ color: 'rgba(255,255,255,0.45)' }}>
                                            AI Tutor
                                        </p>
                                        <h3 className="text-white text-[20px] font-bold leading-tight mb-4"
                                            style={display}>
                                            Talk to Catharina
                                        </h3>
                                        <div className="inline-flex items-center gap-1.5 text-[12px] font-semibold
                                                        px-3 py-1.5 rounded-full text-white/90"
                                             style={{ background: 'rgba(255,255,255,0.12)',
                                                      backdropFilter: 'blur(8px)' }}>
                                            Start chatting
                                            <ChevronRight className="w-3.5 h-3.5
                                                                      group-hover:translate-x-0.5
                                                                      transition-transform"/>
                                        </div>
                                    </div>
                                    <img src={Catharina} alt="Catharina"
                                         className="absolute bottom-0 right-0 h-36 object-contain
                                                    object-bottom pointer-events-none"
                                         style={{ filter: 'drop-shadow(0 -4px 16px rgba(0,0,0,0.25))' }}/>
                                </div>
                            </Link>

                            {/* Teleprompter — list row */}
                            <div className="bg-white rounded-2xl overflow-hidden" style={shadow}>
                                <Link to="/teleprompter">
                                    <div className="group flex items-center gap-3.5 px-4 py-4
                                                    hover:bg-black/[0.02] active:bg-black/[0.04]
                                                    transition-colors">
                                        <div className="w-10 h-10 rounded-xl flex items-center
                                                        justify-center flex-shrink-0"
                                             style={{ background: '#1D1D1F' }}>
                                            <Mic className="w-5 h-5 text-white"/>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[15px] font-semibold" style={{ color: C.label }}>
                                                Teleprompter
                                            </p>
                                            <p className="text-[12px] mt-0.5" style={{ color: C.tertiary }}>
                                                Read aloud with AI-generated texts
                                            </p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 flex-shrink-0"
                                                      style={{ color: '#C7C7CC' }}/>
                                    </div>
                                </Link>
                            </div>

                        </div>
                    </div>

                    {/* Immersion Stories */}
                    {sessionStories.length > 0 && (
                        <div>
                            <SectionLabel>Immersion Stories</SectionLabel>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {sessionStories.map((story, i) => (
                                    <StoryCard key={i} story={story} index={i}
                                               onClick={() => setSelectedStory(story)}/>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Pinned Stories */}
                    {savedStories.length > 0 && (
                        <div>
                            <SectionLabel>Pinned Stories</SectionLabel>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {savedStories.map((story, i) => (
                                    <StoryCard key={i} story={story} index={i} pinned
                                               onClick={() => setSelectedStory(story)}/>
                                ))}
                            </div>
                        </div>
                    )}

                </main>
            </div>

            <BottomNavBar/>
        </div>
    );
};

/* ── SectionLabel ── */
function SectionLabel({ children }) {
    return (
        <p className="text-[11px] font-semibold uppercase tracking-wider mb-2.5 px-0.5"
           style={{ color: C.tertiary, fontFamily: "'DM Sans', sans-serif" }}>
            {children}
        </p>
    );
}

/* ── StoryCard ── */
function StoryCard({ story, index, pinned = false, onClick }) {
    const theme = TOPIC_COLORS[index % TOPIC_COLORS.length];
    return (
        <div onClick={onClick}
             className="bg-white rounded-2xl cursor-pointer
                        hover:scale-[1.01] active:scale-[0.99]
                        transition-transform duration-200"
             style={shadow}>
            <Link to="/story">
                <div className="flex items-center gap-3.5 px-4 py-3.5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                         style={{ background: pinned ? '#FFF3E0' : theme.bg }}>
                        <BookOpen className="w-4.5 h-4.5"
                                  style={{ color: pinned ? '#C2680B' : theme.color }}/>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold truncate"
                           style={{ color: C.label, fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                            {story.title}
                        </p>
                        {pinned
                            ? <p className="text-[12px] font-medium mt-0.5 flex items-center gap-1"
                                 style={{ color: '#C2680B' }}>
                                <Pin className="w-3 h-3"/> Pinned
                              </p>
                            : <p className="text-[12px] mt-0.5" style={{ color: C.tertiary }}>
                                Immersive reading
                              </p>
                        }
                    </div>
                    <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: '#C7C7CC' }}/>
                </div>
            </Link>
        </div>
    );
}
