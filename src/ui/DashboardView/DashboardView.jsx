import {BookOpen, ChevronRight, LogOut, RefreshCw} from "lucide-react";
import React from "react";
import {Link, useNavigate} from "react-router-dom";
import LogoEnglish from "../../assets/logo_en.png";
import LogoCzech from "../../assets/logo.png";
import {useContent} from "../../contexts/ContentContext.jsx";
import {BottomNavBar} from "../BottomNavBar/BottomNavBar.jsx";

export const DashboardView = () => {
    const { sessionTasks, setSelectedStory, sessionStories, setSelectedStudyTopic, studyMaterial, savedStories, currentLanguage} = useContent();
    const navigate = useNavigate();
    const Logo = currentLanguage === 'english' ? LogoEnglish : LogoCzech;
    const navigatePath = currentLanguage === 'english' ? '/' : '/czech';

    return (
        <div className="pb-24">
            <header className="bg-white border-b p-6 sticky top-0 z-10 shadow-sm flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <img src={Logo} width={85} alt="Czech"/>
                    <span className="font-black text-2xl tracking-tighter">LanguageToday</span>
                </div>
                <button onClick={() => navigate(navigatePath)}>
                    <LogOut/>
                </button>
            </header>

            <main className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in duration-700">
                <section>
                    <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                        <div className="w-2 h-6 bg-[#D71920] rounded-full"></div>
                        Daily Plan
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <Link
                            to={'/lesson'}
                            className="bg-white p-8 rounded-[3rem] shadow-sm border-2 border-transparent hover:border-[#11457E] transition-all cursor-pointer group active:scale-95"
                        >
                            <div
                                className="bg-blue-50 text-[#11457E] w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform shadow-inner">
                                < BookOpen className="w-7 h-7"/>
                            </div>
                            <h3 className="font-black text-xl text-slate-800 mb-2">Active Learning</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">{sessionTasks.length} AI-generated
                                lessons
                                for you.</p>
                        </Link>

                        <Link
                            to={'/flashcard'}
                            className="bg-white p-8 rounded-[3rem] shadow-sm border-2 border-transparent hover:border-[#D71920] transition-all cursor-pointer group active:scale-95"
                        >
                            <div
                                className="bg-red-50 text-[#D71920] w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform shadow-inner">
                                <RefreshCw className="w-7 h-7"/>
                            </div>
                            <h3 className="font-black text-xl text-slate-800 mb-2">Spaced Repetition</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">Reinforce crucial level concepts.</p>
                        </Link>
                    </div>
                </section>
                <section>
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-3 h-10 bg-slate-900 rounded-full shadow-lg"></div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Academic Path</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {studyMaterial.length > 0 ? studyMaterial.map((mat, i) => (
                            <button key={i} onClick={() => {
                                setSelectedStudyTopic(mat);
                                navigate('/academic');
                            }}
                                    className="bg-white p-12 rounded-[5rem] border-2 border-slate-50 hover:border-[#11457E] hover:shadow-2xl transition-all flex flex-col items-center group shadow-sm text-center">
                                <div
                                    className="w-28 h-28 bg-slate-50 rounded-[3rem] flex items-center justify-center mb-10 text-6xl group-hover:scale-110 transition-transform shadow-inner">{mat.emoji}</div>
                                <h4 className="font-black text-slate-800 text-2xl uppercase tracking-tighter leading-tight mb-10">{mat.topic}</h4>

                            </button>
                        )) : <div
                            className="col-span-full py-20 text-center text-slate-400 font-bold italic text-2xl">Building
                            pedagogical data...</div>}
                    </div>
                </section>
                <section>
                    <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                        <div className="w-2 h-6 bg-[#11457E] rounded-full"></div>
                        Immersion Stories
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {sessionStories.map((story, i) => (
                            <Link to={'/story'}>
                                <div key={i} onClick={() => {
                                    setSelectedStory(story);
                                }}
                                     className="bg-white p-8 rounded-[3.5rem] border-2 border-slate-100 hover:border-[#11457E] hover:shadow-2xl transition-all cursor-pointer flex items-center gap-6 group">
                                    <div
                                        className="bg-slate-50 p-6 rounded-3xl text-4xl group-hover:bg-[#11457E] group-hover:scale-110 transition-all duration-500 shadow-sm">{story.icon}</div>
                                    <div className="flex-1">
                                        <h4 className="font-black text-slate-800 uppercase text-xs tracking-widest">{story.title}</h4>
                                    </div>
                                    <ChevronRight
                                        className="text-slate-200 group-hover:text-[#11457E] group-hover:translate-x-2 transition-all"/>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
                {savedStories.length > 0 && (
                    <section>
                        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                            <div className="w-2 h-6 bg-[#11457E] rounded-full"></div>
                            Saved Immersion Stories
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {savedStories.map((story, i) => (
                                <Link to={'/story'}>
                                    <div key={i} onClick={() => {
                                        setSelectedStory(story);
                                    }}
                                         className="bg-white p-8 rounded-[3.5rem] border-2 border-slate-100 hover:border-[#11457E] hover:shadow-2xl transition-all cursor-pointer flex items-center gap-6 group">
                                        <div
                                            className="bg-slate-50 p-6 rounded-3xl text-4xl group-hover:bg-[#11457E] group-hover:scale-110 transition-all duration-500 shadow-sm">{story.icon}</div>
                                        <div className="flex-1">
                                            <h4 className="font-black text-slate-800 uppercase text-xs tracking-widest">{story.title}</h4>
                                        </div>
                                        <ChevronRight
                                            className="text-slate-200 group-hover:text-[#11457E] group-hover:translate-x-2 transition-all"/>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </main>

            <BottomNavBar/>

        </div>
    );
}
