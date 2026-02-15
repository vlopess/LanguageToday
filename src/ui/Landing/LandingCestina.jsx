import {
    Brain,
    BookOpen,
    GraduationCap,
    Languages,
    MessageSquare,
    RotateCw,
    Sparkles,
    ArrowRight,
    Check,
    Volume2,
    Lock,
    Github,
    WifiOff,
    ShieldCheck,
    Zap,
    HardDrive, Smartphone
} from "lucide-react";
import Logo from "../../assets/logo.png";
import Catharine from "../../assets/catharine.png";
import React from "react";
import "./Landing.css";
import {Link} from "react-router-dom";

export const LandingCestina = () => {
    return (
        <>
            <body className="bg-pattern text-slate-900">
            <nav className="fixed w-full z-50 px-6 py-4">
                <div
                    className="max-w-7xl mx-auto flex justify-between items-center bg-white/80 backdrop-blur-md px-6 py-3 rounded-3xl border border-slate-100">
                    <div className="flex items-center gap-2">
                        <div className="flex justify-center">
                            <img src={Logo} width={70} alt="Czech language logo"/>
                        </div>
                        <span className="font-extrabold text-2xl tracking-tighter text-[#11457E]">
                ČeštinaToday
              </span>
                    </div>

                    <div className="hidden md:flex gap-8 text-xs font-bold text-slate-600 uppercase tracking-widest">
                        <a href="#metodo" className="hover:text-[#11457E]">Method</a>
                        <a href="#academic" className="hover:text-[#11457E]">Curriculum</a>
                        <a href="#tutor" className="hover:text-[#11457E]">Tutor</a>
                    </div>
                </div>
            </nav>

            {/* HERO */}
            <section className="pt-40 pb-24 px-6">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <div
                            className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest mb-6 border border-green-100">
                            <Sparkles className="w-3 h-3"/>
                            Free educational content
                        </div>

                        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter text-slate-900 mb-8">
                            Learn Czech through structured lessons and practical examples
                        </h1>

                        <p className="text-lg text-slate-500 max-w-xl mb-10">
                            A free educational platform to learn Czech with academic structure,
                            practical exercises, and AI-assisted guidance.
                        </p>

                        <div className="flex gap-4">
                            <Link to={'/login'}>
                                <button
                                    className="bg-[#11457E] text-white px-10 py-5 rounded-2xl font-bold flex items-center gap-3">
                                    Start learning <ArrowRight className="w-5 h-5"/>
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* METHOD */}
            <section id="metodo" className="py-24 px-6 bg-white">
                <div className="max-w-7xl mx-auto text-center mb-20">
                    <h2 className="text-4xl font-extrabold tracking-tighter mb-6">
                        Three learning pillars
                    </h2>
                    <p className="text-lg text-slate-500">
                        A simple, consistent structure focused on real retention.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-12 max-w-7xl mx-auto">
                    <div>
                        <BookOpen className="w-10 h-10 text-[#11457E] mb-6"/>
                        <h3 className="font-black text-xl mb-3">Structured curriculum</h3>
                        <p className="text-slate-500">
                            Organized content from beginner to intermediate level.
                        </p>
                    </div>

                    <div>
                        <Brain className="w-10 h-10 text-[#D71920] mb-6"/>
                        <h3 className="font-black text-xl mb-3">Active recall</h3>
                        <p className="text-slate-500">
                            Exercises designed to reinforce memory and real usage.
                        </p>
                    </div>

                    <div>
                        <Languages className="w-10 h-10 text-slate-900 mb-6"/>
                        <h3 className="font-black text-xl mb-3">Real context</h3>
                        <p className="text-slate-500">
                            Everyday phrases, stories, and dialogues.
                        </p>
                    </div>
                </div>
            </section>

            {/* CURRICULUM */}
            <section id="academic" className="py-24 px-6 bg-[#11457E] text-white">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16">
                    <div>
                        <h2 className="text-4xl font-extrabold mb-8">
                            Essential curriculum
                        </h2>
                        <p className="text-white/70 mb-10">
                            Core modules to build a strong foundation.
                        </p>

                        <ul className="space-y-4">
                            {[
                                "Personal introduction",
                                "Formal vs informal language",
                                "Alphabet and pronunciation",
                                "Numbers and basic logic"
                            ].map(item => (
                                <li key={item} className="flex items-center gap-3">
                                    <Check className="w-5 h-5"/>
                                    <span className="font-bold">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-white/10 rounded-3xl p-8">
                        <div className="bg-white p-6 rounded-2xl flex justify-between items-center">
                            <div>
                                <h4 className="font-black text-slate-800 text-sm">
                                    Alphabet and pronunciation
                                </h4>
                            </div>
                            <Volume2 className="text-[#11457E]"/>
                        </div>

                        <div className="mt-4 bg-white/70 p-6 rounded-2xl flex justify-between items-center opacity-50">
                            <span className="font-bold text-slate-700">Formal vs informal language</span>
                            <Lock className="text-slate-400"/>
                        </div>

                        <div className="mt-4 bg-white/50 p-6 rounded-2xl flex justify-between items-center opacity-50">
                            <span className="font-bold text-slate-700">Numbers</span>
                            <Lock className="text-slate-400"/>
                        </div>
                    </div>
                </div>
            </section>

            {/* TUTOR */}
            <section id="tutor" className="py-24 px-6">
                <div className="max-w-7xl mx-auto flex items-center justify-center gap-16
                  flex-col lg:flex-row">

                    {/* TEXT */}
                    <div className="w-full lg:w-1/2">
                        <h2 className="text-4xl font-extrabold mb-8 text-center lg:text-left">
                            AI tutor available 24/7
                        </h2>

                        <p className="text-lg text-slate-500 mb-10 text-center lg:text-left">
                            Continuous support for grammar correction, questions, and writing practice.
                        </p>

                        <ul className="space-y-6 max-w-xl mx-auto lg:mx-0">
                            <li className="flex gap-4">
                                <Check className="w-5 h-5 text-[#11457E] flex-shrink-0" />
                                <span className="font-medium text-slate-600">
            Grammar correction with explanations
          </span>
                            </li>

                            <li className="flex gap-4">
                                <Check className="w-5 h-5 text-[#11457E] flex-shrink-0" />
                                <span className="font-medium text-slate-600">
            Session-based learning history
          </span>
                            </li>
                        </ul>
                    </div>

                    {/* IMAGE */}
                    <div className="w-full lg:w-1/2 flex justify-center">
                        <img
                            src={Catharine}
                            alt="AI tutor illustration"
                            className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg w-full h-auto"
                        />
                    </div>

                </div>
            </section>


            <section className="w-full bg-slate-50 border-t border-slate-200">
                <div className="max-w-6xl mx-auto px-6 py-20">
                    <div className="max-w-2xl mb-14">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                            All activities run locally on your device
                        </h2>
                        <p className="text-slate-600 text-lg leading-relaxed">
                            Learning activities are executed directly in your browser. Your answers
                            and progress are processed and stored locally, without being sent to
                            external servers.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="bg-white rounded-2xl p-6 border border-slate-200">
                            <div
                                className="w-12 h-12 rounded-xl bg-[#11457E]/10 text-[#11457E] flex items-center justify-center mb-4">
                                <ShieldCheck className="w-6 h-6"/>
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-2">
                                Your data stays local
                            </h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Progress and answers remain stored on your own device.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-slate-200">
                            <div
                                className="w-12 h-12 rounded-xl bg-[#11457E]/10 text-[#11457E] flex items-center justify-center mb-4">
                                <Zap className="w-6 h-6"/>
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-2">
                                Fast interactions
                            </h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Local execution ensures instant feedback and smooth interaction.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-slate-200">
                            <div
                                className="w-12 h-12 rounded-xl bg-[#11457E]/10 text-[#11457E] flex items-center justify-center mb-4">
                                <HardDrive className="w-6 h-6"/>
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-2">
                                No account required
                            </h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                No login, no cloud sync, no tracking.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-slate-200">
                            <div
                                className="w-12 h-12 rounded-xl bg-[#11457E]/10 text-[#11457E] flex items-center justify-center mb-4">
                                <Smartphone className="w-6 h-6"/>
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-2">
                                Installable as a PWA
                            </h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Install the app on your device and use it like a native application.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="py-16 px-6 border-t border-slate-200">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center">
                        <img src={Logo} width={70} alt="Czech language logo"/>
                        <span className="font-extrabold text-xl text-[#11457E]">
                ČeštinaToday
              </span>
                    </div>

                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        © {new Date().getFullYear()} ČeštinaToday
                    </p>

                    <div className="flex gap-6 text-slate-400">
                        <Github className="w-5 h-5 hover:text-[#11457E]"/>
                    </div>
                </div>
            </footer>
            </body>
        </>
    );
};
