import { History, PlusCircle, Send, X, Trash2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useContent } from "../../contexts/ContentContext.jsx";
import Catharina from '../../assets/Catharina.png';
import AddContextButton from "../AddContextButton/AddContextButton.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { createChatSession, addChatMessage, updateChatSessionTimestamp, deleteChatSession } from "../../lib/db.js";
import { BottomNavBar } from "../BottomNavBar/BottomNavBar.jsx";

const display = { fontFamily: "'Bricolage Grotesque', sans-serif" };
const body    = { fontFamily: "'DM Sans', sans-serif" };

export const ChatView = () => {
    const scrollRef  = useRef(null);
    const textareaRef = useRef(null);
    const { userProfile, chatHistory, setChatHistory, currentChat, currentLanguage, setCurrentChat } = useContent();
    const { userId } = useAuth();

    const [isHistoryOpen,  setIsHistoryOpen]  = useState(false);
    const [userInput,      setUserInput]      = useState("");
    const [isTyping,       setIsTyping]       = useState(false);
    const [selectedScenario, setSelectedScenario] = useState(false);
    const initialMessageSentRef = useRef(false);

    /* ── init ── */
    useEffect(() => {
        if (!import.meta.env.VITE_GROQ_API_KEY) return;
        if (initialMessageSentRef.current) return;
        initialMessageSentRef.current = true;
        checkCurrentChat();
    }, []);

    /* ── auto scroll ── */
    useEffect(() => {
        if (scrollRef.current)
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [isTyping, chatHistory]);

    /* ── auto-resize textarea ── */
    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    }, [userInput]);

    /* ── system prompt ── */
    const getSystemPrompt = () => {
        const scenario = currentChat?.scenario?.prompt || "";
        return `You are Catharina, a highly advanced ${currentLanguage} language mentor.
STUDENT: ${userProfile.name} | Level: ${userProfile.level}
RULES: Respond ONLY in English. Sound natural and human. Do NOT write essays. Ask ONE meaningful question per turn. Correct mistakes briefly. Prioritize dialogue.
STYLE: Intelligent but conversational. Supportive and direct. No artificial formality.
SCENARIO: ${scenario}${scenario ? `\n- Answer in ${currentLanguage} when there is a scenario.` : ""}
METHOD: Begin naturally. Keep tone realistic. Encourage elaboration with a single follow-up.`;
    };

    /* ── markdown ── */
    const renderMarkdown = (text = "") => {
        if (!text) return null;
        let safe = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const tables = [];
        let idx = 0;
        safe = safe.replace(/((\|.+\|\n)+)/g, block => {
            const rows = block.trim().split("\n");
            if (rows.length < 3) return block;
            const header = rows[0].split("|").slice(1, -1).map(c => inlineMd(c.trim()));
            const body   = rows.slice(2).map(r => r.split("|").slice(1, -1).map(c => inlineMd(c.trim())));
            tables.push(`<div class="overflow-x-auto my-2"><table class="min-w-full border rounded-xl text-xs">
<thead><tr>${header.map(h => `<th class="px-3 py-2 bg-slate-100 font-bold border-b text-left">${h}</th>`).join("")}</tr></thead>
<tbody>${body.map(r => `<tr>${r.map(c => `<td class="px-3 py-2 border-b">${c}</td>`).join("")}</tr>`).join("")}</tbody>
</table></div>`);
            return `__T${idx++}__`;
        });
        safe = safe.replace(/^### (.*$)/gm, '<p class="font-black text-[#11457E] mt-3 mb-1 text-sm">$1</p>');
        safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-[#11457E]">$1</strong>');
        safe = safe.replace(/\*(.*?)\*/g, "<em>$1</em>");
        safe = safe.replace(/\n/g, "<br/>");
        tables.forEach((t, i) => { safe = safe.replace(`__T${i}__`, t); });
        return <span dangerouslySetInnerHTML={{ __html: safe }} />;
    };

    const inlineMd = (t) => t
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
        .replace(/\*(.*?)\*/g, "<em>$1</em>");

    /* ── chat helpers ── */
    const currentMessages = () => chatHistory.find(e => e.id === currentChat?.id)?.messages || [];

    // Map of localId -> pending Promise<supabaseId> to avoid duplicate DB calls
    const pendingSessionRef = useRef({});
    // Map of localId -> resolved supabaseId for synchronous access
    const supabaseIdMap = useRef({});

    // Lazily create the DB session only when the first message is sent
    const ensureSupabaseSession = async (chat) => {
        const cached = supabaseIdMap.current[chat.id] || chat.supabase_id;
        if (cached) return cached;
        if (pendingSessionRef.current[chat.id]) return pendingSessionRef.current[chat.id];

        pendingSessionRef.current[chat.id] = createChatSession(userId, currentLanguage, chat.scenario ?? null)
            .then(sid => {
                supabaseIdMap.current[chat.id] = sid;
                delete pendingSessionRef.current[chat.id];
                setChatHistory(prev => prev.map(c => c.id === chat.id ? { ...c, supabase_id: sid } : c));
                return sid;
            });
        return pendingSessionRef.current[chat.id];
    };

    const addMessageToChat = async (message) => {
        const now = Date.now();
        const msg = { ...message, createdAt: now };
        const chat = chatHistory.find(c => c.id === currentChat.id) || currentChat;

        const sid = await ensureSupabaseSession(chat);
        if (sid) {
            addChatMessage(sid, msg);
            updateChatSessionTimestamp(sid);
        }

        setChatHistory(prev => {
            const updated = prev.map(c =>
                c.id === currentChat.id
                    ? { ...c, messages: [...c.messages, msg], lastMessageAt: now }
                    : c
            );
            return [...updated].sort((a, b) => (b.lastMessageAt ?? 0) - (a.lastMessageAt ?? 0));
        });
    };

    const checkCurrentChat = async () => {
        const found = chatHistory.find(h => h.id === currentChat?.id);
        if (found) { setCurrentChat(found); return; }
        createNewChat();
    };

    // Local-only until first message is sent
    const createNewChat = () => {
        const id   = `chat-${Date.now()}`;
        const chat = { id, supabase_id: null, date: new Date().toLocaleDateString(), scenario: null, messages: [], lastMessageAt: 0 };
        setChatHistory(prev => [chat, ...prev]);
        setCurrentChat(chat);
    };

    const createNewChatWithScenario = (scenario) => {
        const id   = `chat-${Date.now()}`;
        const chat = { id, supabase_id: null, date: new Date().toLocaleDateString(), scenario, messages: [], lastMessageAt: 0 };
        setChatHistory(prev => [chat, ...prev]);
        setCurrentChat(chat);
    };

    const handleDeleteChat = async (chat, e) => {
        e.stopPropagation();
        if (chat.supabase_id) await deleteChatSession(chat.supabase_id);
        delete supabaseIdMap.current[chat.id];
        setChatHistory(prev => {
            const next = prev.filter(c => c.id !== chat.id);
            if (currentChat?.id === chat.id) {
                setCurrentChat(next[0] ?? null);
                if (!next[0]) createNewChat();
            }
            return next;
        });
    };

    /* ── scenario select ── */
    useEffect(() => {
        if (!selectedScenario) return;
        if (!currentChat || currentMessages().length > 0) { createNewChatWithScenario(selectedScenario); return; }
        setCurrentChat(prev => ({ ...prev, scenario: selectedScenario }));
    }, [selectedScenario]);

    useEffect(() => {
        if (!currentChat) return;
        if (currentChat.scenario && currentMessages().length === 0)
            sendInitialScenarioMessage(currentChat);
    }, [currentChat?.id, currentChat?.scenario?.id]);

    /* ── send ── */
    const handleSendMessage = async () => {
        const message = userInput.trim();
        if (!message || isTyping) return;
        setUserInput("");
        setIsTyping(true);

        const history = currentMessages();
        const apiMessages = [
            { role: "system", content: [{ type: "text", text: getSystemPrompt() }] },
            ...history.map(m => ({ role: m.role, content: m.text })),
            { role: "user", content: message },
        ];

        await addMessageToChat({ role: "user", text: message });

        try {
            const res  = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}` },
                body: JSON.stringify({ model: "openai/gpt-oss-120b", messages: apiMessages, temperature: 0.5, max_tokens: 1000 }),
            });
            const data  = await res.json();
            await addMessageToChat({ role: "assistant", text: data.choices?.[0]?.message?.content || "Sorry, something went wrong." });
        } catch {
            addMessageToChat({ role: "assistant", text: "Connection error. Please try again." });
        } finally {
            setIsTyping(false);
        }
    };

    const sendInitialScenarioMessage = async (chat) => {
        if (!chat?.scenario || chat.messages.length > 0) return;
        setIsTyping(true);
        try {
            const res  = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}` },
                body: JSON.stringify({ model: "openai/gpt-oss-120b", messages: [{ role: "system", content: getSystemPrompt() }], temperature: 0.7, max_tokens: 600 }),
            });
            const data = await res.json();
            await addMessageToChat({ role: "assistant", text: data.choices?.[0]?.message?.content || "Let's begin." });
        } finally {
            setIsTyping(false);
        }
    };

    const msgs = currentMessages();

    /* ── UI ── */
    return (
        <div className="h-screen flex flex-col" style={{ background: '#F7F5F0', ...body }}>

            {/* ── HISTORY DRAWER ── */}
            <div className={`absolute inset-y-0 left-0 w-72 z-50 flex flex-col
                             transform transition-transform duration-300
                             ${isHistoryOpen ? 'translate-x-0' : '-translate-x-full'}`}
                style={{ background: '#0D1B2A', boxShadow: '8px 0 32px rgba(0,0,0,0.3)' }}>
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
                    <span className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-2" style={display}>
                        <History className="w-4 h-4" style={{ color: '#D71920' }} />
                        History
                    </span>
                    <button onClick={() => setIsHistoryOpen(false)} className="text-white/30 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="px-4 py-4">
                    <button onClick={() => { createNewChat(); setIsHistoryOpen(false); }}
                        className="w-full py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                        style={{ background: '#11457E', color: '#fff' }}>
                        <PlusCircle className="w-4 h-4" /> New Session
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-6">
                    {chatHistory.map(chat => {
                        const lastMsg = chat.messages[chat.messages.length - 1];
                        const isActive = chat.id === currentChat?.id;
                        return (
                            <div key={chat.id} className="group relative">
                                <button
                                    onClick={() => { setCurrentChat(chat); setIsHistoryOpen(false); }}
                                    className="w-full p-3.5 rounded-2xl text-left transition-all pr-10"
                                    style={{
                                        background: isActive ? 'rgba(17,69,126,0.4)' : 'rgba(255,255,255,0.05)',
                                        border: `1px solid ${isActive ? 'rgba(17,69,126,0.6)' : 'rgba(255,255,255,0.05)'}`,
                                    }}>
                                    <span className="text-white/40 text-[9px] font-bold uppercase tracking-widest block mb-1">
                                        {chat.date}
                                        {chat.scenario && ` · ${chat.scenario.title}`}
                                    </span>
                                    <span className="text-white/70 text-xs font-medium truncate block">
                                        {lastMsg ? lastMsg.text.substring(0, 40) + '…' : 'New conversation'}
                                    </span>
                                </button>
                                <button
                                    onClick={(e) => handleDeleteChat(chat, e)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-xl
                                               opacity-0 group-hover:opacity-100 transition-opacity
                                               text-white/30 hover:text-red-400 hover:bg-white/10">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* overlay */}
            {isHistoryOpen && (
                <div className="absolute inset-0 z-40 bg-black/40 backdrop-blur-sm"
                    onClick={() => setIsHistoryOpen(false)} />
            )}

            {/* ── HEADER ── */}
            <header className="flex items-center justify-between px-4 py-3 border-b border-[#E5E0D8] flex-shrink-0"
                style={{ background: 'rgba(247,245,240,0.95)', backdropFilter: 'blur(12px)' }}>
                <div className="flex items-center gap-3">
                    <button onClick={() => setIsHistoryOpen(true)}
                        className="w-9 h-9 rounded-2xl flex items-center justify-center transition-colors hover:bg-slate-100"
                        style={{ background: 'rgba(17,69,126,0.06)' }}>
                        <History className="w-4 h-4" style={{ color: '#11457E' }} />
                    </button>
                    <div className="flex items-center gap-2.5">
                        <img src={Catharina} alt="Catharina" className="w-9 h-9 object-contain object-bottom rounded-full"
                            style={{ background: 'linear-gradient(135deg, #11457E22, #071e3d22)' }} />
                        <div>
                            <p className="font-bold text-slate-800 text-sm leading-none" style={display}>Catharina</p>
                            <p className="text-[10px] font-medium mt-0.5" style={{ color: '#11457E' }}>
                                {currentChat?.scenario ? currentChat.scenario.title : `${userProfile.level} · AI Tutor`}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <AddContextButton onSelect={setSelectedScenario} currentScenario={currentChat?.scenario ?? null} />
                </div>
            </header>

            {/* ── MESSAGES ── */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto" style={{ paddingBottom: '152px' }}>
                <div className="max-w-2xl mx-auto px-4 pt-5 space-y-3">

                    {/* empty state */}
                    {msgs.length === 0 && !isTyping && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <img src={Catharina} alt="Catharina" className="w-28 h-28 object-contain mb-4 opacity-70" />
                            <p className="font-bold text-slate-600 text-base mb-1" style={display}>
                                Start a conversation
                            </p>
                            <p className="text-slate-400 text-sm font-medium">
                                Type a message or choose a scenario to begin
                            </p>
                        </div>
                    )}

                    {msgs.map((msg, i) => (
                        <div key={i} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>

                            {/* assistant avatar */}
                            {msg.role === 'assistant' && (
                                <img src={Catharina} alt="" className="w-7 h-7 rounded-full object-contain object-bottom flex-shrink-0 mb-0.5"
                                    style={{ background: 'linear-gradient(135deg, #EFF4FB, #dbeafe)' }} />
                            )}

                            <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed max-w-[78%] ${
                                msg.role === 'user'
                                    ? 'rounded-br-md text-white'
                                    : 'rounded-bl-md text-slate-800'
                            } ${msg.isInitial ? '' : ''}`}
                                style={{
                                    background: msg.role === 'user'
                                        ? '#11457E'
                                        : 'white',
                                    border: msg.role === 'assistant' ? '1px solid #E5E0D8' : 'none',
                                    boxShadow: msg.role === 'assistant' ? '0 2px 8px rgba(0,0,0,0.04)' : '0 2px 8px rgba(17,69,126,0.2)',
                                }}>
                                {msg.isInitial && (
                                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5 opacity-60">
                                        Lesson start
                                    </p>
                                )}
                                {renderMarkdown(msg.text)}
                            </div>
                        </div>
                    ))}

                    {/* typing indicator */}
                    {isTyping && (
                        <div className="flex items-end gap-2 justify-start">
                            <img src={Catharina} alt="" className="w-7 h-7 rounded-full object-contain object-bottom flex-shrink-0"
                                style={{ background: 'linear-gradient(135deg, #EFF4FB, #dbeafe)' }} />
                            <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-white border border-[#E5E0D8]
                                            flex items-center gap-1.5"
                                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                                {[0, 1, 2].map(i => (
                                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce"
                                        style={{ animationDelay: `${i * 0.15}s` }} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── FLOATING INPUT ── */}
            <div className="fixed left-0 right-0 z-20 flex justify-center px-4 pointer-events-none"
                style={{ bottom: '82px' }}>
                <div className="pointer-events-auto w-full max-w-2xl">
                    <div className="flex items-end gap-2 rounded-[1.5rem] px-4 py-3"
                        style={{
                            background: 'rgba(255,255,255,0.92)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            border: '1.5px solid #E5E0D8',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06)',
                        }}>
                        <textarea
                            ref={textareaRef}
                            rows={1}
                            value={userInput}
                            onChange={e => setUserInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                            placeholder="Message Catharina…"
                            disabled={isTyping}
                            className="flex-1 bg-transparent resize-none outline-none text-sm text-slate-800 placeholder:text-slate-400 leading-relaxed"
                            style={{ ...body, maxHeight: '120px', minHeight: '20px' }}
                        />
                        <button onClick={handleSendMessage}
                            disabled={!userInput.trim() || isTyping}
                            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                            style={{
                                background: userInput.trim() && !isTyping ? '#11457E' : '#E5E0D8',
                                transform: userInput.trim() && !isTyping ? 'scale(1)' : 'scale(0.95)',
                            }}>
                            <Send className="w-4 h-4" style={{ color: userInput.trim() && !isTyping ? 'white' : '#94a3b8' }} />
                        </button>
                    </div>
                </div>
            </div>

            <BottomNavBar />
        </div>
    );
};
