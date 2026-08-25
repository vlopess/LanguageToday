import {
    BookOpen, ChevronRight, LogOut,
    RefreshCw, Timer,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useContent } from "../../contexts/ContentContext.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useTimer } from "../../contexts/TimerContext.jsx";
import { BottomNavBar } from "../BottomNavBar/BottomNavBar.jsx";
import Catharina from "../../assets/Catharina.png";
import { getStudySessions } from "../../lib/db.js";
import { CURRICULUM } from "../../lib/generateTopics.js";

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

/* ── Section label ── */
function SectionLabel({ children }) {
    return (
        <h2 className="text-[13px] font-semibold mb-2 px-0.5">
            {children}
        </h2>
    );
}

/* ── Timer widget ── */
function TimerWidget() {
    const { secondsLeft, progress } = useTimer();
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    const pct  = progress * 100;

    return (
        <div className="bg-surface border border-line rounded-xl px-4 py-3.5">
            <div className="flex items-center justify-between mb-2.5">
                <span className="flex items-center gap-1.5 text-[13px] text-muted">
                    <Timer size={14}/>
                    Session time
                </span>
                <span className="text-[15px] font-semibold tabular-nums">
                    {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
                </span>
            </div>
            <div className="h-[3px] rounded-full overflow-hidden bg-sunken">
                <div className="h-full rounded-full transition-all duration-1000"
                     style={{ width: `${pct}%`, background: pct >= 100 ? '#1B7A43' : '#11457E' }}/>
            </div>
        </div>
    );
}

/* ── Stats row ── */
function StatsRow({ sessions }) {
    const streak    = computeStreak(sessions);
    const weekStats = computeWeekStats(sessions);

    const stats = [
        { value: streak,                          label: 'day streak' },
        { value: weekStats.count,                 label: 'this week' },
        { value: `${weekStats.minutes} min`,      label: 'in 7 days' },
    ];

    return (
        <div className="bg-surface border border-line rounded-xl grid grid-cols-3 divide-x divide-line">
            {stats.map(({ value, label }) => (
                <div key={label} className="px-3 py-3.5">
                    <p className="font-display font-bold text-xl leading-none tabular-nums">{value}</p>
                    <p className="text-[11px] text-muted mt-1.5">{label}</p>
                </div>
            ))}
        </div>
    );
}

/* ── Academic path list ── */
function AcademicList({ studyMaterial, studyMaterialLoading, onSelect }) {
    if (!studyMaterial.length && !studyMaterialLoading) return null;
    return (
        <div>
            <SectionLabel>Academic path</SectionLabel>
            {studyMaterialLoading && (
                <p className="text-[13px] text-muted flex items-center gap-2 py-3">
                    <span className="w-3.5 h-3.5 border-2 border-primary/20 border-t-primary rounded-full animate-spin"/>
                    Building your path…
                </p>
            )}
            {!studyMaterialLoading && (
                <ol className="bg-surface border border-line rounded-xl divide-y divide-line overflow-hidden">
                    {studyMaterial.map((mat, i) => (
                        <li key={i}>
                            <button onClick={() => onSelect(mat)}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-sunken transition-colors focus-ring">
                                <span className="text-[11px] font-medium text-muted/70 tabular-nums w-4 flex-shrink-0">
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                                <span className="flex-1 min-w-0">
                                    <span className="block text-sm font-medium truncate">
                                        {mat.topic}
                                    </span>
                                    {CURRICULUM[i]?.blurb && (
                                        <span className="block text-[12px] text-muted mt-0.5 truncate">
                                            {CURRICULUM[i].blurb}
                                        </span>
                                    )}
                                </span>
                                <ChevronRight size={15} className="flex-shrink-0 text-muted/50"/>
                            </button>
                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
}

/* ════════════════════════════════════════ */
export const DashboardView = () => {
    const {
        sessionTasks, reviewTasks,
        setSelectedStory, sessionStories, sessionStoriesLoading,
        setSelectedStudyTopic, studyMaterial, studyMaterialLoading,
        savedStories, currentLanguage, userProfile,
        languageMeta,
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
    const langLabel = languageMeta?.nativeName || languageMeta?.name || '';

    const handleAcademicSelect = (mat) => {
        setSelectedStudyTopic(mat);
        navigate('/academic');
    };

    return (
        <div className="min-h-screen pb-24">

            {/* ── HEADER ── */}
            <header className="sticky top-0 z-20 bg-paper border-b border-line">
                <div className="max-w-5xl mx-auto flex items-center justify-between px-5 h-14">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xl leading-none" title={langLabel}>
                            {languageMeta?.flagEmoji || ''}
                        </span>
                        <span className="text-sm font-semibold truncate">{langLabel}</span>
                        <span className="text-[13px] text-muted">· {userProfile?.level || 'A1'}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <div aria-hidden
                             className="w-7 h-7 rounded-full flex items-center justify-center bg-primary text-white text-xs font-semibold">
                            {initial}
                        </div>
                        <button onClick={handleSignOut} aria-label="Sign out"
                            className="p-2 -mr-2 text-muted hover:text-ink transition-colors focus-ring">
                            <LogOut size={16}/>
                        </button>
                    </div>
                </div>
            </header>

            {/* ── LAYOUT ── */}
            <div className="max-w-5xl mx-auto px-5 pt-8
                            flex flex-col lg:flex-row lg:gap-10 lg:items-start">

                {/* SIDEBAR */}
                <aside className="w-full lg:w-[280px] lg:flex-shrink-0
                                  lg:sticky lg:top-[72px] space-y-7">

                    {/* Welcome */}
                    <div className="px-0.5">
                        <p className="text-[13px] text-muted mb-1">Welcome back,</p>
                        <h1 className="font-display font-bold tracking-tight leading-tight mb-2
                                       text-4xl lg:text-[2.6rem]">
                            {userProfile?.name || 'Student'}.
                        </h1>
                        <p className="text-[13px] text-muted">
                            {userProfile?.dailyTime || 15} min a day · level {userProfile?.level || 'A1'}
                        </p>
                    </div>

                    <TimerWidget />

                    <div>
                        <SectionLabel>Activity</SectionLabel>
                        <StatsRow sessions={studySessions}/>
                    </div>

                    <AcademicList studyMaterial={studyMaterial} studyMaterialLoading={studyMaterialLoading} onSelect={handleAcademicSelect}/>

                </aside>

                {/* MAIN CONTENT */}
                <main className="flex-1 min-w-0 space-y-7 mt-9 lg:mt-0">

                    {/* Today's Session */}
                    <section>
                        <SectionLabel>Today's session</SectionLabel>
                        <div className="grid sm:grid-cols-2 gap-3">

                            <Link to="/lesson" className="group focus-ring rounded-xl">
                                <div className="h-full bg-surface border border-line rounded-xl p-5
                                                hover:border-primary transition-colors">
                                    <p className="font-display font-bold text-2xl tabular-nums mb-1">
                                        {String(sessionTasks.length).padStart(2, '0')} tasks
                                    </p>
                                    <p className="text-[13px] text-muted leading-relaxed mb-4">
                                        Exercises generated for today: recall, sentences and errors.
                                    </p>
                                    <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-primary group-hover:gap-1.5 transition-all">
                                        Start <ChevronRight size={14}/>
                                    </span>
                                </div>
                            </Link>

                            <Link to="/flashcard" className="group focus-ring rounded-xl">
                                <div className="h-full bg-surface border border-line rounded-xl p-5
                                                hover:border-primary transition-colors">
                                    <p className="font-display font-bold text-2xl tabular-nums mb-1">
                                        {String(reviewTasks.length).padStart(2, '0')} cards
                                    </p>
                                    <p className="text-[13px] text-muted leading-relaxed mb-4">
                                        Quick review of vocabulary from recent sessions.
                                    </p>
                                    <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-primary group-hover:gap-1.5 transition-all">
                                        Review <RefreshCw size={13}/>
                                    </span>
                                </div>
                            </Link>

                        </div>
                    </section>

                    {/* AI Language Tutor */}
                    <section>
                        <SectionLabel>Practice</SectionLabel>
                        <div className="bg-surface border border-line rounded-xl divide-y divide-line overflow-hidden">

                            <Link to="/chat" className="group flex items-center gap-3.5 px-4 py-3.5 hover:bg-sunken transition-colors">
                                <img src={Catharina} alt="" aria-hidden
                                     className="w-10 h-10 object-contain object-bottom mix-blend-multiply flex-shrink-0"/>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold">Chat with Catharina</p>
                                    <p className="text-[12px] text-muted mt-0.5 truncate">
                                        Conversation scenarios with explained corrections
                                    </p>
                                </div>
                                <ChevronRight size={15} className="flex-shrink-0 text-muted/50"/>
                            </Link>

                            <Link to="/teleprompter" className="group flex items-center gap-3.5 px-4 py-3.5 hover:bg-sunken transition-colors">
                                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                                    <BookOpen size={18} strokeWidth={1.8} className="text-muted"/>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold">Teleprompter</p>
                                    <p className="text-[12px] text-muted mt-0.5 truncate">
                                        Read aloud with auto-scrolling text
                                    </p>
                                </div>
                                <ChevronRight size={15} className="flex-shrink-0 text-muted/50"/>
                            </Link>

                        </div>
                    </section>

                    {/* Immersion Stories */}
                    {sessionStoriesLoading && (
                        <section>
                            <SectionLabel>Today's stories</SectionLabel>
                            <p className="text-[13px] text-muted flex items-center gap-2 py-3">
                                <span className="w-3.5 h-3.5 border-2 border-primary/20 border-t-primary rounded-full animate-spin"/>
                                Generating stories…
                            </p>
                        </section>
                    )}
                    {!sessionStoriesLoading && sessionStories.length > 0 && (
                        <section>
                            <SectionLabel>Today's stories</SectionLabel>
                            <StoryRows stories={sessionStories} onSelect={setSelectedStory} navigate={navigate}/>
                        </section>
                    )}

                    {/* Pinned Stories */}
                    {savedStories.length > 0 && (
                        <section>
                            <SectionLabel>Saved stories</SectionLabel>
                            <StoryRows stories={savedStories} onSelect={setSelectedStory} navigate={navigate} pinned/>
                        </section>
                    )}

                </main>
            </div>

            <BottomNavBar/>
        </div>
    );
};

/* ── StoryRows ── */
function StoryRows({ stories, pinned = false, onSelect, navigate }) {
    return (
        <ul className="bg-surface border border-line rounded-xl divide-y divide-line overflow-hidden">
            {stories.map((story, i) => (
                <li key={i}>
                    <button onClick={() => { onSelect(story); navigate('/story'); }}
                            className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left
                                       hover:bg-sunken transition-colors focus-ring">
                        <span aria-hidden className="text-lg leading-none w-6 text-center flex-shrink-0">
                            {story.icon || '📖'}
                        </span>
                        <span className="flex-1 min-w-0">
                            <span className="block text-sm font-medium truncate">{story.title}</span>
                            <span className={`block text-[12px] mt-0.5 ${pinned ? 'text-warning' : 'text-muted'}`}>
                                {pinned ? 'Saved' : 'Immersive reading'}
                            </span>
                        </span>
                        <ChevronRight size={15} className="flex-shrink-0 text-muted/50"/>
                    </button>
                </li>
            ))}
        </ul>
    );
}
