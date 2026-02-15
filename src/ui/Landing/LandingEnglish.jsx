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
import Logo from "../../assets/logo_en.png";
import Catharine from "../../assets/catharine_en.png";
import React from "react";
import "./Landing.css";
import {Link} from "react-router-dom";

export const Landing = () => {
    return (
        <>
            <body className="bg-pattern text-slate-900">
            <nav className="fixed w-full z-50 px-6 py-4">
                <div
                    className="max-w-7xl mx-auto flex justify-between items-center bg-white/80 backdrop-blur-md px-6 py-3 rounded-3xl border border-slate-100">
                    <div className="flex items-center gap-2">
                        <div className="flex justify-center">
                            <img src={Logo} width={70} alt="English B2 learning logo"/>
                        </div>
                        <span className="font-extrabold text-2xl tracking-tighter text-[#11457E]">
                EnglishToday
              </span>
                    </div>

                    <div className="hidden md:flex gap-8 text-xs font-bold text-slate-600 uppercase tracking-widest">
                        <a href="#metodo" className="hover:text-[#11457E]">Method</a>
                        <a href="#academic" className="hover:text-[#11457E]">Curriculum</a>
                        <a href="#tutor" className="hover:text-[#11457E]">AI Tutor</a>
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
                            Upper-Intermediate Level (B2)
                        </div>

                        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter text-slate-900 mb-8">
                            Master English at B2 level with structure and fluency practice
                        </h1>

                        <p className="text-lg text-slate-500 max-w-xl mb-10">
                            Develop confident communication skills, advanced grammar control,
                            academic vocabulary, and real-world fluency.
                        </p>

                        <div className="flex gap-4">
                            <Link to={'/login-en'}>
                                <button
                                    className="bg-[#11457E] text-white px-10 py-5 rounded-2xl font-bold flex items-center gap-3">
                                    Start B2 Training <ArrowRight className="w-5 h-5"/>
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
                        Structured progression designed for Upper-Intermediate mastery.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-12 max-w-7xl mx-auto">
                    <div>
                        <BookOpen className="w-10 h-10 text-[#11457E] mb-6"/>
                        <h3 className="font-black text-xl mb-3">Advanced grammar control</h3>
                        <p className="text-slate-500">
                            Master complex structures such as conditionals, passive voice,
                            reported speech, and modal nuances.
                        </p>
                    </div>

                    <div>
                        <Brain className="w-10 h-10 text-[#D71920] mb-6"/>
                        <h3 className="font-black text-xl mb-3">Active production</h3>
                        <p className="text-slate-500">
                            Writing tasks, speaking simulations, and argument development.
                        </p>
                    </div>

                    <div>
                        <Languages className="w-10 h-10 text-slate-900 mb-6"/>
                        <h3 className="font-black text-xl mb-3">Real-world fluency</h3>
                        <p className="text-slate-500">
                            Academic discussions, professional communication, and debates.
                        </p>
                    </div>
                </div>
            </section>

            {/* CURRICULUM */}
            <section id="academic" className="py-24 px-6 bg-[#11457E] text-white">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16">
                    <div>
                        <h2 className="text-4xl font-extrabold mb-8">
                            B2 Core Curriculum
                        </h2>
                        <p className="text-white/70 mb-10">
                            Essential modules for upper-intermediate proficiency.
                        </p>

                        <ul className="space-y-4">
                            {[
                                "Complex conditionals (0–3 & mixed)",
                                "Advanced modal verbs and nuances",
                                "Formal writing and essays",
                                "Reported speech & passive voice mastery"
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
                                    Complex Conditionals
                                </h4>
                            </div>
                            <Volume2 className="text-[#11457E]"/>
                        </div>

                        <div className="mt-4 bg-white/70 p-6 rounded-2xl flex justify-between items-center opacity-50">
                            <span className="font-bold text-slate-700">
                                Essay Writing Structure
                            </span>
                            <Lock className="text-slate-400"/>
                        </div>

                        <div className="mt-4 bg-white/50 p-6 rounded-2xl flex justify-between items-center opacity-50">
                            <span className="font-bold text-slate-700">
                                Passive & Reported Speech
                            </span>
                            <Lock className="text-slate-400"/>
                        </div>
                    </div>
                </div>
            </section>

            {/* TUTOR */}
            <section id="tutor" className="py-24 px-6">
                <div className="max-w-7xl mx-auto flex items-center justify-center gap-16 flex-col lg:flex-row">

                    <div className="w-full lg:w-1/2">
                        <h2 className="text-4xl font-extrabold mb-8 text-center lg:text-left">
                            AI Tutor for B2 Fluency
                        </h2>

                        <p className="text-lg text-slate-500 mb-10 text-center lg:text-left">
                            Practice advanced writing, receive grammar refinement,
                            and simulate real B2 speaking tasks.
                        </p>

                        <ul className="space-y-6 max-w-xl mx-auto lg:mx-0">
                            <li className="flex gap-4">
                                <Check className="w-5 h-5 text-[#11457E] flex-shrink-0" />
                                <span className="font-medium text-slate-600">
                                    Detailed grammar and style correction
                                </span>
                            </li>

                            <li className="flex gap-4">
                                <Check className="w-5 h-5 text-[#11457E] flex-shrink-0" />
                                <span className="font-medium text-slate-600">
                                    B2-level speaking simulations
                                </span>
                            </li>
                        </ul>
                    </div>

                    <div className="w-full lg:w-1/2 flex justify-center">
                        <img
                            src={Catharine}
                            alt="AI English tutor"
                            className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg w-full h-auto"
                        />
                    </div>

                </div>
            </section>

            <footer className="py-16 px-6 border-t border-slate-200">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center">
                        <img src={Logo} width={70} alt="English learning logo"/>
                        <span className="font-extrabold text-xl text-[#11457E]">
                            EnglishToday                        </span>
                    </div>

                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        © {new Date().getFullYear()} EnglishToday
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
