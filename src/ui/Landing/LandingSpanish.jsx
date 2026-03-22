import {
    Brain,
    BookOpen,
    Languages,
    Sparkles,
    ArrowRight,
    Check,
    Volume2,
    Lock,
    Github,
    Mic, ShieldCheck, Zap, Smartphone
} from "lucide-react";
import Logo from "../../assets/logo_espanhol.png";
import LogoCzech from "../../assets/logo.png";
import LogoEnglish from "../../assets/logo_en.png";
import Catharine from "../../assets/catharine_sp.png";
import Teleprompter from "../../assets/teleprompt.png";
import React from "react";
import "./Landing.css";
import { Link } from "react-router-dom";
import { Globe } from "./Globe.jsx";

const ACCENT = '#F5A623';

export const LandingSpanish = () => {
    return (
        <>
            <body className="bg-pattern text-slate-900">
            <nav className="fixed w-full z-50 px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center bg-white/80 backdrop-blur-md px-6 py-3 rounded-3xl border border-slate-100">
                    <div className="flex items-center gap-2">
                        <div className="flex justify-center">
                            <img src={Logo} width={70} alt="EspañolToday logo"/>
                        </div>
                        <span className="font-extrabold text-2xl tracking-tighter" style={{ color: ACCENT }}>
                            EspañolToday
                        </span>
                    </div>

                    <div className="hidden md:flex gap-8 text-xs font-bold text-slate-600 uppercase tracking-widest">
                        <a href="#metodo" className="hover:text-[#F5A623]">Método</a>
                        <a href="#academic" className="hover:text-[#F5A623]">Currículo</a>
                        <a href="#tutor" className="hover:text-[#F5A623]">Tutor IA</a>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link to="/" className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border-2 border-[#E5E0D8] hover:border-[#11457E] transition-colors bg-white">
                            <img src={LogoEnglish} alt="English" width={22}/>
                            <span className="text-[11px] font-black text-slate-600">English</span>
                        </Link>
                        <Link to="/czech" className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border-2 border-[#E5E0D8] hover:border-[#D71920] transition-colors bg-white">
                            <img src={LogoCzech} alt="Czech" width={22}/>
                            <span className="text-[11px] font-black text-slate-600">Czech</span>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* HERO */}
            <section className="pt-40 pb-24 px-6" style={{ overflow: "clip" }}>
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest mb-6 border border-red-100">
                            <Sparkles className="w-3 h-3"/>
                            Todos os níveis — A1 ao C2
                        </div>

                        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter text-slate-900 mb-8">
                            Aprenda espanhol com estrutura e prática real de conversação
                        </h1>

                        <p className="text-lg text-slate-500 max-w-xl mb-10">
                            Desenvolva habilidades de comunicação, controle gramatical,
                            vocabulário cotidiano e fluência real com sessões geradas por IA.
                        </p>

                        <div className="flex gap-4">
                            <Link to="/auth">
                                <button className="text-white px-10 py-5 rounded-2xl font-bold flex items-center gap-3" style={{ background: ACCENT }}>
                                    Começar agora <ArrowRight className="w-5 h-5"/>
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* Globe */}
                    <div style={{ position: "relative", height: 400 }} className="hidden lg:block overflow-visible">
                        <Globe style={{
                            position: "absolute",
                            top: "10%",
                            right: "-40%",
                            width: "170%",
                            maxWidth: "none",
                        }}/>
                    </div>
                </div>
            </section>

            {/* METHOD */}
            <section id="metodo" className="py-24 px-6 bg-white">
                <div className="max-w-7xl mx-auto text-center mb-20">
                    <h2 className="text-4xl font-extrabold tracking-tighter mb-6">
                        Três pilares de aprendizado
                    </h2>
                    <p className="text-lg text-slate-500">
                        Progressão estruturada do espanhol do zero ao domínio avançado.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-12 max-w-7xl mx-auto">
                    <div>
                        <BookOpen className="w-10 h-10 mb-6" style={{ color: ACCENT }}/>
                        <h3 className="font-black text-xl mb-3">Gramática progressiva</h3>
                        <p className="text-slate-500">
                            Do presente simples ao subjuntivo — estruturas introduzidas no ritmo certo para cada nível.
                        </p>
                    </div>

                    <div>
                        <Brain className="w-10 h-10 text-slate-900 mb-6"/>
                        <h3 className="font-black text-xl mb-3">Produção ativa</h3>
                        <p className="text-slate-500">
                            Exercícios de recall, construção de frases e correção de erros para fixar o conteúdo.
                        </p>
                    </div>

                    <div>
                        <Languages className="w-10 h-10 text-slate-400 mb-6"/>
                        <h3 className="font-black text-xl mb-3">Fluência no mundo real</h3>
                        <p className="text-slate-500">
                            Simulações de conversação, cenários do cotidiano e histórias calibradas ao seu nível.
                        </p>
                    </div>
                </div>
            </section>

            {/* CURRICULUM */}
            <section id="academic" className="py-24 px-6 text-white" style={{ background: ACCENT }}>
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16">
                    <div>
                        <h2 className="text-4xl font-extrabold mb-8">
                            Currículo de Espanhol
                        </h2>
                        <p className="text-white/70 mb-10">
                            Módulos essenciais para cada nível, do iniciante ao avançado.
                        </p>

                        <ul className="space-y-4">
                            {[
                                "Ser vs Estar — uso correto em contexto",
                                "Pretérito Indefinido e Imperfecto",
                                "Subjuntivo presente e seus gatilhos",
                                "Verbos reflexivos e pronomes"
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
                                    Ser vs Estar
                                </h4>
                            </div>
                            <Volume2 style={{ color: ACCENT }}/>
                        </div>

                        <div className="mt-4 bg-white/70 p-6 rounded-2xl flex justify-between items-center opacity-50">
                            <span className="font-bold text-slate-700">
                                Pretérito Indefinido
                            </span>
                            <Lock className="text-slate-400"/>
                        </div>

                        <div className="mt-4 bg-white/50 p-6 rounded-2xl flex justify-between items-center opacity-50">
                            <span className="font-bold text-slate-700">
                                Subjuntivo Presente
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
                            Tutora IA para fluência em espanhol
                        </h2>

                        <p className="text-lg text-slate-500 mb-10 text-center lg:text-left">
                            Pratique conversação, receba correções gramaticais e simule
                            situações reais com a tutora Catharina.
                        </p>

                        <ul className="space-y-6 max-w-xl mx-auto lg:mx-0">
                            <li className="flex gap-4">
                                <Check className="w-5 h-5 flex-shrink-0" style={{ color: ACCENT }}/>
                                <span className="font-medium text-slate-600">
                                    Correção de gramática e vocabulário em tempo real
                                </span>
                            </li>

                            <li className="flex gap-4">
                                <Check className="w-5 h-5 flex-shrink-0" style={{ color: ACCENT }}/>
                                <span className="font-medium text-slate-600">
                                    Cenários de conversação calibrados ao seu nível
                                </span>
                            </li>
                        </ul>
                    </div>

                    <div className="w-full lg:w-1/2 flex justify-center">
                        <img
                            src={Catharine}
                            alt="Tutora IA de espanhol"
                            className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg w-full h-auto"
                        />
                    </div>

                </div>
            </section>

            {/* TELEPROMPTER */}
            <section className="py-24 px-6 bg-[#0D1B2A]">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <img src={Teleprompter} alt="Teleprompter" width={450}/>

                    <div>
                        <div
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest mb-6 border"
                            style={{
                                background: 'rgba(255,255,255,0.06)',
                                color: 'rgba(255,255,255,0.5)',
                                borderColor: 'rgba(255,255,255,0.1)'
                            }}>
                            <Mic className="w-3 h-3"/>
                            Prática de leitura
                        </div>
                        <h2 className="text-4xl font-extrabold tracking-tighter text-white mb-6">
                            Teleprompter para treino de fluência
                        </h2>
                        <p className="text-white/60 text-lg mb-8">
                            A IA gera textos em espanhol calibrados ao seu nível. Leia em voz alta
                            no seu próprio ritmo com rolagem automática suave.
                        </p>
                        <ul className="space-y-3 mb-10">
                            {[
                                'Treine sua pronúncia em espanhol',
                                'Textos gerados por IA adaptados ao seu nível CEFR',
                                'Velocidade de rolagem e tamanho de fonte ajustáveis'
                            ].map(item => (
                                <li key={item} className="flex items-center gap-3">
                                    <Check className="w-4 h-4 flex-shrink-0" style={{ color: ACCENT }}/>
                                    <span className="text-white/70 font-medium text-sm">{item}</span>
                                </li>
                            ))}
                        </ul>
                        <Link to="/auth">
                            <button className="text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3" style={{ background: ACCENT }}>
                                Experimentar o teleprompter <ArrowRight className="w-4 h-4"/>
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            <section className="w-full bg-slate-50 border-t border-slate-200">
                <div className="max-w-6xl mx-auto px-6 py-20">
                    <div className="max-w-2xl mb-14">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                            Todas as atividades rodam localmente no seu dispositivo
                        </h2>
                        <p className="text-slate-600 text-lg leading-relaxed">
                            As atividades de aprendizado são executadas diretamente no seu navegador.
                            Suas respostas e progresso são processados e armazenados localmente,
                            sem serem enviados a servidores externos.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="bg-white rounded-2xl p-6 border border-slate-200">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${ACCENT}18`, color: ACCENT }}>
                                <ShieldCheck className="w-6 h-6"/>
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-2">Seus dados ficam locais</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Progresso e respostas permanecem armazenados no seu próprio dispositivo.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-slate-200">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${ACCENT}18`, color: ACCENT }}>
                                <Zap className="w-6 h-6"/>
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-2">Interações rápidas</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Execução local garante feedback instantâneo e interação fluida.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-slate-200">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${ACCENT}18`, color: ACCENT }}>
                                <Smartphone className="w-6 h-6"/>
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-2">Instalável como PWA</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Instale o app no seu dispositivo e use como um aplicativo nativo.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="py-16 px-6 border-t border-slate-200">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center">
                        <img src={Logo} width={70} alt="EspañolToday logo"/>
                        <span className="font-extrabold text-xl" style={{ color: ACCENT }}>
                            EspañolToday
                        </span>
                    </div>

                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        © {new Date().getFullYear()} EspañolToday
                    </p>

                    <div className="flex gap-6 text-slate-400">
                        <a href="https://github.com/vlopess/LanguageToday" target="_blank" rel="noreferrer">
                            <Github className="w-5 h-5 hover:text-[#F5A623]"/>
                        </a>
                    </div>
                </div>
            </footer>
            </body>
        </>
    );
};
