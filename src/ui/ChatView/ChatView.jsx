import { History, PlusCircle, Send, X, Trash2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useContent } from "../../contexts/ContentContext.jsx";
import Catharina from '../../assets/Catharina.png';
import AddContextButton from "../AddContextButton/AddContextButton.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { createChatSession, addChatMessage, updateChatSessionTimestamp, deleteChatSession } from "../../lib/db.js";
import { BottomNavBar } from "../BottomNavBar/BottomNavBar.jsx";

export const ChatView = () => {
    const scrollRef  = useRef(null);
    const textareaRef = useRef(null);
    const { userProfile, chatHistory, setChatHistory, currentChat, currentLanguage, setCurrentChat, languageMeta } = useContent();
    const { userId } = useAuth();

    const [isHistoryOpen,  setIsHistoryOpen]  = useState(false);
    const [userInput,      setUserInput]      = useState("");
    const [isTyping,       setIsTyping]       = useState(false);
    const [selectedScenario, setSelectedScenario] = useState(false);
    const initialMessageSentRef = useRef(false);
    // Tracks which "chatId::scenarioId" pairs already had their initial message sent,
    // preventing double-sends from StrictMode effect re-runs or currentChat.id changes on DB load.
    const sentInitialRef = useRef(new Set());
    // Always-current ref for currentChat so async callbacks don't use stale closures.
    const currentChatRef = useRef(currentChat);

    /* ── keep currentChatRef in sync ── */
    useEffect(() => {
        currentChatRef.current = currentChat;
    }, [currentChat]);

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

        // Fully generic: target language from the catalog,
        // responses in the profile's instruction language.
        const supportRespond = {
            portuguese: 'Brazilian Portuguese',
            english: 'English',
            spanish: 'Spanish',
        };
        const respondLang = supportRespond[userProfile?.supportLanguage] || 'Brazilian Portuguese';
        const targetName  = languageMeta?.name || languageMeta?.nativeName || 'the target language';

        return `You are Catharina, a highly advanced ${targetName} language mentor.
STUDENT: ${userProfile.name} | Level: ${userProfile.level}
RULES: Respond ONLY in ${respondLang}. Sound natural and human. Do NOT write essays. Ask ONE meaningful question per turn. Correct mistakes briefly. Prioritize dialogue.
STYLE: Intelligent but conversational. Supportive and direct. No artificial formality.
SCENARIO: ${scenario}${scenario ? `\n- Use ${targetName} in the scenario dialogue. Keep explanations in ${respondLang}.` : ""}
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
            tables.push(`<div class="overflow-x-auto my-2"><table class="min-w-full border border-line rounded-lg text-xs overflow-hidden">
<thead><tr>${header.map(h => `<th class="px-3 py-2 bg-sunken font-semibold border-b border-line text-left">${h}</th>`).join("")}</tr></thead>
<tbody>${body.map(r => `<tr>${r.map(c => `<td class="px-3 py-2 border-b border-line">${c}</td>`).join("")}</tr>`).join("")}</tbody>
</table></div>`);
            return `__T${idx++}__`;
        });
        safe = safe.replace(/^### (.*$)/gm, '<p class="font-semibold mt-3 mb-1 text-sm">$1</p>');
        safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
        safe = safe.replace(/\*(.*?)\*/g, "<em>$1</em>");
        safe = safe.replace(/\n/g, "<br/>");
        tables.forEach((t, i) => { safe = safe.replace(`__T${i}__`, t); });
        return <span dangerouslySetInnerHTML={{ __html: safe }} />;
    };

    const inlineMd = (t) => t
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
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
        // Use ref so this always targets the current chat even after awaits.
        const chat = chatHistory.find(c => c.id === currentChatRef.current?.id) || currentChatRef.current;
        if (!chat) return;

        const sid = await ensureSupabaseSession(chat);
        if (sid) {
            addChatMessage(sid, msg);
            updateChatSessionTimestamp(sid);
        }

        const targetId = currentChatRef.current?.id;
        setChatHistory(prev => {
            const updated = prev.map(c => {
                if (c.id !== targetId) return c;
                // Guard against double-add (e.g. StrictMode)
                if (c.messages.some(m => m.createdAt === msg.createdAt && m.role === msg.role)) return c;
                return { ...c, messages: [...c.messages, msg], lastMessageAt: now };
            });
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
        if (!currentChat?.scenario) return;
        if (currentMessages().length > 0) return;
        const key = `${currentChat.id}::${currentChat.scenario.id}`;
        if (sentInitialRef.current.has(key)) return;
        sentInitialRef.current.add(key);
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
        <div className="h-screen flex flex-col">

            {/* ── HISTORY DRAWER ── */}
            <div className={`absolute inset-y-0 left-0 w-72 z-50 flex flex-col
                             transform transition-transform duration-300 bg-ink
                             ${isHistoryOpen ? 'translate-x-0' : '-translate-x-full'}
                             lg:translate-x-0`}>
                <div className="flex items-center justify-between px-5 h-14 border-b border-white/10">
                    <span className="text-paper/80 text-[13px] font-medium flex items-center gap-2">
                        <History size={15}/>
                        Conversations
                    </span>
                    <button onClick={() => setIsHistoryOpen(false)} aria-label="Close"
                            className="text-paper/40 hover:text-paper transition-colors lg:hidden focus-ring">
                        <X size={17}/>
                    </button>
                </div>

                <div className="px-4 py-4">
                    <button onClick={() => { createNewChat(); setIsHistoryOpen(false); }}
                        className="w-full py-2.5 rounded-lg font-medium text-[13px] flex items-center justify-center gap-2 transition-colors focus-ring
                                   bg-paper text-ink hover:bg-white">
                        <PlusCircle size={15}/> New conversation
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-3 pb-6">
                    {chatHistory.map(chat => {
                        const lastMsg = chat.messages[chat.messages.length - 1];
                        const isActive = chat.id === currentChat?.id;
                        return (
                            <div key={chat.id} className="group relative">
                                <button
                                    onClick={() => { setCurrentChat(chat); setIsHistoryOpen(false); }}
                                    className={`w-full p-3 rounded-lg text-left transition-colors pr-9 focus-ring ${
                                        isActive ? 'bg-white/10' : 'hover:bg-white/5'
                                    }`}
                                    style={isActive ? { boxShadow: 'inset 2px 0 0 #7EA4D4' } : undefined}>
                                    <span className="text-paper/40 text-[11px] block mb-0.5 truncate">
                                        {chat.date}
                                        {chat.scenario && ` · ${chat.scenario.title}`}
                                    </span>
                                    <span className="text-paper/75 text-xs truncate block">
                                        {lastMsg ? lastMsg.text.substring(0, 40) + '…' : 'New conversation'}                                    </span>
                                </button>
                                <button
                                    onClick={(e) => handleDeleteChat(chat, e)}
                                    aria-label="Delete conversation"
                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md
                                               opacity-0 group-hover:opacity-100 transition-opacity
                                               text-paper/30 hover:text-danger hover:bg-white/10 focus-ring">
                                    <Trash2 size={14}/>
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* overlay */}
            {isHistoryOpen && (
                <div className="absolute inset-0 z-40 bg-ink/45 lg:hidden"
                    onClick={() => setIsHistoryOpen(false)} />
            )}

            {/* ── MAIN CONTENT (offset by sidebar on lg) ── */}
            <div className="flex flex-col flex-1 min-h-0 lg:ml-72">

            {/* ── HEADER ── */}
            <header className="flex items-center justify-between px-4 h-14 border-b border-line bg-surface flex-shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={() => setIsHistoryOpen(true)} aria-label="History"
                        className="w-8 h-8 -ml-1.5 rounded-lg flex items-center justify-center text-muted hover:text-ink hover:bg-sunken transition-colors lg:hidden focus-ring">
                        <History size={16}/>
                    </button>
                    <div className="flex items-center gap-2.5">
                        <img src={Catharina} alt="" aria-hidden className="w-8 h-8 object-contain object-bottom"/>
                        <div>
                            <p className="font-semibold text-sm leading-none">Catharina</p>
                            <p className="text-[12px] text-muted mt-0.5">
                                {currentChat?.scenario ? currentChat.scenario.title : `${userProfile.level} · conversation tutor`}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <AddContextButton onSelect={setSelectedScenario} currentScenario={currentChat?.scenario ?? null} />
                </div>
            </header>

            {/* ── MESSAGES ── */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto" style={{ paddingBottom: '148px' }}>
                <div className="max-w-2xl mx-auto px-4 pt-5 space-y-3">

                    {/* empty state */}
                    {msgs.length === 0 && !isTyping && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <img src={Catharina} alt="" aria-hidden className="w-24 h-24 object-contain mb-4 opacity-80 mix-blend-multiply"/>
                            <p className="font-medium text-base mb-1">
                                Start a conversation
                            </p>
                            <p className="text-muted text-sm">
                                Write a message or pick a scenario
                            </p>
                        </div>
                    )}

                    {msgs.map((msg, i) => (
                        <div key={i} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>

                            {/* assistant avatar */}
                            {msg.role === 'assistant' && (
                                <img src={Catharina} alt="" aria-hidden className="w-6 h-6 object-contain object-bottom flex-shrink-0"/>
                            )}

                            <div className={`px-4 py-2.5 rounded-lg text-sm leading-relaxed max-w-[78%] ${
                                msg.role === 'user'
                                    ? 'bg-primary text-white rounded-br-sm'
                                    : 'bg-surface border border-line text-ink rounded-bl-sm'
                            }`}>
                                {msg.isInitial && (
                                    <p className="text-[11px] font-medium opacity-60 mb-1">
                                        Scene start
                                    </p>
                                )}
                                {renderMarkdown(msg.text)}
                            </div>
                        </div>
                    ))}

                    {/* typing indicator */}
                    {isTyping && (
                        <div className="flex items-end gap-2 justify-start">
                            <img src={Catharina} alt="" aria-hidden className="w-6 h-6 object-contain object-bottom flex-shrink-0"/>
                            <div className="px-4 py-3 rounded-lg rounded-bl-sm bg-surface border border-line flex items-center gap-1.5">
                                {[0, 1, 2].map(i => (
                                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-muted/40 animate-pulse"
                                        style={{ animationDelay: `${i * 0.2}s` }} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── FLOATING INPUT ── */}
            <div className="fixed left-0 lg:left-72 right-0 z-20 flex justify-center px-4 pointer-events-none"
                style={{ bottom: '76px' }}>
                <div className="pointer-events-auto w-full max-w-2xl">
                    <div className="flex items-end gap-2 rounded-xl px-4 py-2.5 bg-surface border border-line shadow-overlay">
                        <textarea
                            ref={textareaRef}
                            rows={1}
                            value={userInput}
                            onChange={e => setUserInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                            placeholder="Write to Catharina…"
                            disabled={isTyping}
                            className="flex-1 bg-transparent resize-none outline-none text-sm leading-relaxed placeholder:text-muted/60"
                            style={{ maxHeight: '120px', minHeight: '20px' }}
                        />
                        <button onClick={handleSendMessage}
                            disabled={!userInput.trim() || isTyping}
                            aria-label="Send"
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors focus-ring
                                       bg-primary text-white hover:bg-primary-dark
                                       disabled:bg-sunken disabled:text-muted/50">
                            <Send size={15}/>
                        </button>
                    </div>
                </div>
            </div>

            <BottomNavBar />
            </div>{/* end lg:ml-72 wrapper */}
        </div>
    );
};
