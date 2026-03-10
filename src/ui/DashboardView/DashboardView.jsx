import {
    ALargeSmall, BookOpen, Briefcase, ChevronRight, Hash,
    HelpCircle, LogOut, MessageCircle, MessageSquare, Pin,
    RefreshCw, User, Globe, Home, Plane, Coffee, Zap,
    ShoppingCart, Heart, Star, Leaf, Music, Camera, Code,
    Sun, Moon, Utensils, Stethoscope, GraduationCap, Building,
    Sparkles, Mic,
} from "lucide-react";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useContent } from "../../contexts/ContentContext.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { BottomNavBar } from "../BottomNavBar/BottomNavBar.jsx";
import Catharina from "../../assets/Catharina.png";
import LogoCzech from "../../assets/logo.png";
import LogoEnglish from "../../assets/logo_en.png";

const display = { fontFamily: "'Bricolage Grotesque', sans-serif" };
const body    = { fontFamily: "'DM Sans', sans-serif" };

/* Emoji → Lucide icon mapping */
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
    { bg: '#EFF4FB', color: '#11457E' },
    { bg: '#FFF0F0', color: '#D71920' },
    { bg: '#F0FDF4', color: '#16a34a' },
    { bg: '#FFFBEB', color: '#d97706' },
    { bg: '#F5F3FF', color: '#7c3aed' },
    { bg: '#FFF0F9', color: '#db2777' },
];

function TopicIcon({ emoji, index }) {
    const Icon  = EMOJI_ICON_MAP[emoji] ?? BookOpen;
    const theme = TOPIC_COLORS[index % TOPIC_COLORS.length];
    return (
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-2"
            style={{ background: theme.bg }}>
            <Icon className="w-5 h-5" style={{ color: theme.color }} strokeWidth={2} />
        </div>
    );
}

/* ─────────────────────────────────────────────────── */

export const DashboardView = () => {
    const {
        sessionTasks, reviewTasks,
        setSelectedStory, sessionStories,
        setSelectedStudyTopic, studyMaterial,
        savedStories, currentLanguage, userProfile,
    } = useContent();
    const { signOut } = useAuth();
    const navigate    = useNavigate();

    const handleSignOut = async () => { await signOut(); navigate('/'); };

    const initial   = userProfile?.name?.[0]?.toUpperCase() || '?';
    const langLabel = currentLanguage === 'english' ? 'English' : 'Czech';

    return (
        <div className="min-h-screen pb-20" style={{ background: '#F7F5F0', ...body }}>

            {/* ── NAV ── */}
            <header className="sticky top-0 z-20 flex justify-between items-center px-5 py-4 border-b border-[#E5E0D8]"
                style={{ background: 'rgba(247,245,240,0.92)', backdropFilter: 'blur(12px)' }}>
                <div className='flex items-center'>
                    <img src={currentLanguage === 'english' ? LogoEnglish : LogoCzech} alt="Logo" width={80}/>
                    <span className="text-[#11457E] font-bold text-base tracking-wide" style={display}>
                        LanguageToday
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#11457E] flex items-center justify-center text-white text-xs font-bold"
                        style={display}>
                        {initial}
                    </div>
                    <button onClick={handleSignOut}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-5 pt-6 space-y-5">

                {/* ── HERO ── */}
                <div className="relative rounded-[2rem] overflow-hidden" style={{background: '#0D1B2A'}}>
                    <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full pointer-events-none"
                         style={{border: '28px solid rgba(215,25,32,0.15)'}}/>
                    <div className="absolute -right-3 top-20 w-28 h-28 rounded-full pointer-events-none"
                         style={{border: '14px solid rgba(17,69,126,0.25)'}}/>
                    <div className="relative px-7 py-8">
                        <p className="text-white/40 text-[10px] font-semibold uppercase tracking-[0.25em] mb-1">
                            Welcome back
                        </p>
                        <h1 className="text-white leading-none mb-6"
                            style={{...display, fontWeight: 800, fontSize: 'clamp(2.5rem, 10vw, 3.5rem)'}}>
                            {userProfile?.name || 'Learner'}.
                        </h1>
                        <div className="flex flex-wrap gap-2">
                            <span className="text-white text-[11px] font-bold px-3 py-1.5 rounded-full"
                                  style={{background: '#D71920'}}>
                                {userProfile?.level || 'A1'}
                            </span>
                            <span className="text-white/70 text-[11px] font-semibold px-3 py-1.5 rounded-full"
                                  style={{background: 'rgba(255,255,255,0.1)'}}>
                                {langLabel}
                            </span>
                            <span className="text-white/70 text-[11px] font-semibold px-3 py-1.5 rounded-full"
                                  style={{background: 'rgba(255,255,255,0.1)'}}>
                                {userProfile?.dailyTime || 15} min / day
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── TODAY'S SESSION ── */}
                <div className='mb-5'>
                    <SectionLabel>Today's Session</SectionLabel>
                    <div className="grid grid-cols-2 gap-3">
                        <Link to="/lesson">
                            <div className="rounded-[1.75rem] p-6 h-44 flex flex-col justify-between
                                            hover:brightness-110 active:scale-95 transition-all duration-200 cursor-pointer"
                                 style={{background: '#11457E'}}>
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                     style={{background: 'rgba(255,255,255,0.15)'}}>
                                    <BookOpen className="w-5 h-5 text-white"/>
                                </div>
                                <div>
                                    <p className="text-white/50 text-[9px] font-bold uppercase tracking-widest mb-1">
                                        Active Learning
                                    </p>
                                    <div className="flex items-end gap-1.5">
                                        <span className="text-white font-black leading-none"
                                              style={{...display, fontSize: '2.6rem'}}>
                                            {String(sessionTasks.length).padStart(2, '0')}
                                        </span>
                                        <span className="text-white/40 text-xs font-semibold mb-1">tasks</span>
                                    </div>
                                </div>
                            </div>
                        </Link>

                        <Link to="/flashcard">
                            <div className="rounded-[1.75rem] p-6 h-44 flex flex-col justify-between
                                            hover:brightness-125 active:scale-95 transition-all duration-200 cursor-pointer"
                                 style={{background: '#1C2434'}}>
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                     style={{background: 'rgba(255,255,255,0.12)'}}>
                                    <RefreshCw className="w-5 h-5 text-white"/>
                                </div>
                                <div>
                                    <p className="text-white/50 text-[9px] font-bold uppercase tracking-widest mb-1">
                                        Flashcards
                                    </p>
                                    <div className="flex items-end gap-1.5">
                                        <span className="text-white font-black leading-none"
                                              style={{...display, fontSize: '2.6rem'}}>
                                            {String(reviewTasks.length).padStart(2, '0')}
                                        </span>
                                        <span className="text-white/40 text-xs font-semibold mb-1">cards</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* ── CATHARINA CARD ── */}
                <SectionLabel>AI Language Tutor</SectionLabel>

                <div className="group relative rounded-[1.75rem] pt-7 overflow-hidden cursor-pointer
                                    hover:brightness-105 active:scale-[0.98] transition-all duration-200"
                     style={{background: 'linear-gradient(135deg, #11457E 0%, #071e3d 100%)', minHeight: '148px'}}>

                    <Link to="/chat">
                        {/* decorative ring */}
                        <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full pointer-events-none"
                             style={{border: '24px solid rgba(255,255,255,0.05)'}}/>

                        {/* text content */}
                        <div className="relative z-10 px-6  pb-6 max-w-[58%]">
                            <h3 className="text-white text-xl leading-tight mb-3" style={{...display, fontWeight: 700}}>
                                Talk to Catharina
                            </h3>
                            <div className="inline-flex items-center gap-1.5 text-white text-[11px] font-bold
                                                px-3 py-1.5 rounded-full transition-colors"
                                 style={{background: 'rgba(255,255,255,0.15)'}}>
                                Start chatting
                                <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform"/>
                            </div>
                        </div>

                        {/* Catharina photo */}
                        <img
                            src={Catharina}
                            alt="Teacher Catharina"
                            className="absolute bottom-0 right-0 h-36 object-contain object-bottom pointer-events-none"
                            style={{filter: 'drop-shadow(0 -4px 12px rgba(0,0,0,0.3))'}}
                        />
                    </Link>
                </div>

                {/* ── TELEPROMPTER ── */}
                <div className="rounded-[1.75rem] p-6 hover:brightness-105 active:scale-[0.98] transition-all duration-200 cursor-pointer border border-[#E5E0D8]"
                     style={{background: 'white'}}>
                    <Link to="/teleprompter">
                        <div className="group relative flex items-center gap-5">
                            <div className="flex items-center gap-5 w-12 h-12 rounded-2xl justify-center "
                                 style={{background: '#0D1B2A'}}>
                                <Mic className="w-5 h-5 text-white"/>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Reading
                                    practice</p>
                                <h3 className="font-black text-slate-800 text-base leading-tight"
                                    style={display}>Teleprompter</h3>
                                <p className="text-slate-400 text-[11px] font-medium mt-0.5">Read aloud with AI-generated
                                    texts</p>
                            </div>
                            <ChevronRight
                                className="w-4 h-4 text-slate-300 group-hover:text-[#11457E] flex-shrink-0 transition-colors"/>
                        </div>
                    </Link>
                </div>

                {/* ── ACADEMIC PATH ── */}
                {studyMaterial.length > 0 && (
                    <div>
                        <SectionLabel>Academic Path</SectionLabel>
                        <div className="grid grid-cols-3 gap-3">
                            {studyMaterial.map((mat, i) => (
                                <button key={i}
                                        onClick={() => {
                                            setSelectedStudyTopic(mat);
                                            navigate('/academic');
                                        }}
                                        className="group bg-white border border-[#E5E0D8] rounded-[1.5rem] p-4
                                               flex flex-col items-center
                                               hover:border-[#11457E] hover:shadow-md
                                               active:scale-95 transition-all duration-200 text-center">
                                    <TopicIcon emoji={mat.emoji} index={i}/>
                                    <span
                                        className="text-slate-600 text-[9px] font-black uppercase tracking-tight leading-tight line-clamp-2"
                                        style={display}>
                                        {mat.topic}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── IMMERSION STORIES ── */}
                {sessionStories.length > 0 && (
                    <div>
                        <SectionLabel>Immersion Stories</SectionLabel>
                        <div className="space-y-3">
                            {sessionStories.map((story, i) => (
                                <StoryCard key={i} story={story} index={i}
                                           onClick={() => setSelectedStory(story)}/>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── PINNED STORIES ── */}
                {savedStories.length > 0 && (
                    <div>
                        <SectionLabel>Pinned Stories</SectionLabel>
                        <div className="space-y-3">
                            {savedStories.map((story, i) => (
                                <StoryCard key={i} story={story} index={i} pinned
                                           onClick={() => setSelectedStory(story)}/>
                            ))}
                        </div>
                    </div>
                )}

            </main>

            <BottomNavBar/>
        </div>
    );
};

/* ── helpers ── */

function SectionLabel({children}) {
    return (
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.22em] mb-3"
           style={{fontFamily: "'DM Sans', sans-serif"}}>
            {children}
        </p>
    );
}

function StoryCard({story, index, pinned = false, onClick}) {
    const theme = TOPIC_COLORS[index % TOPIC_COLORS.length];
    return (
        <div onClick={onClick}
             className="group bg-white border border-[#E5E0D8] rounded-[1.5rem] p-4

                           hover:border-[#11457E] hover:shadow-md
                           active:scale-[0.98] transition-all duration-200 cursor-pointer">
            <Link to="/story">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                         style={{background: pinned ? '#FFFBEB' : theme.bg}}>
                        <BookOpen className="w-5 h-5" style={{color: pinned ? '#d97706' : theme.color}}/>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 text-sm truncate"
                           style={{fontFamily: "'Bricolage Grotesque', sans-serif"}}>
                            {story.title}
                        </p>
                        {pinned
                            ? <p className="text-amber-500 text-[10px] font-bold mt-0.5 flex items-center gap-1">
                                <Pin className="w-3 h-3"/> Pinned
                            </p>
                            : <p className="text-slate-400 text-[10px] font-medium mt-0.5">Immersive reading</p>
                        }
                    </div>
                    <ChevronRight
                        className="w-4 h-4 text-slate-300 group-hover:text-[#11457E] flex-shrink-0 transition-colors"/>
                </div>
            </Link>
        </div>
    )
        ;
}
