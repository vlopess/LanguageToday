import {History, Lock, PlusCircle, Send, X} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useContent } from "../../contexts/ContentContext.jsx";
import { useNavigate } from "react-router-dom";
import Catharina from '../../assets/Catharina.png';
import AddContextButton from "../AddContextButton/AddContextButton.jsx";

export const ChatView = () => {
    const scrollRef = useRef(null);
    const navigate = useNavigate();
    const { userProfile, chatHistory, setChatHistory, currentChat, currentLanguage, setCurrentChat } = useContent();
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [userInput, setUserInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const initialMessageSentRef = useRef(false);
    const [selectedScenario, setSelectedScenario] = useState(false);
    /* ---------- AUTO START ---------- */
    useEffect(() => {
        if (!import.meta.env.VITE_GROQ_API_KEY) return;
        if (initialMessageSentRef.current) return;

        initialMessageSentRef.current = true;
        checkCurrentChat();
    }, []);

    /* ---------- AUTO SCROLL ---------- */
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [isTyping]);

    const getSystemPrompt = () => {
        const scenarioInstructions =
            currentChat?.scenario?.prompt || "";
        return `
            You are Catharina, a highly advanced ${currentLanguage} language mentor.
            
            STUDENT:
            - Name: ${userProfile.name}
            - Level: ${userProfile.level}
            
            RULES:
            - Respond ONLY in English
            - Keep responses between 60–100 words
            - Sound natural and human, not academic or institutional
            - Do NOT write essays
            - Avoid overly formal openings (no "Dear", no long introductions)
            - Prioritize dialogue over monologue
            - Ask ONE meaningful question per turn
            - Correct mistakes briefly and naturally
            - Focus on improving fluency, clarity, and sophistication
            
            STYLE:
            - Intelligent but conversational
            - Supportive and challenging
            - Direct and engaging
            - No artificial formality
            
            SCENARIO:
            ${scenarioInstructions}
            - The answer should be in ${currentLanguage}, if there is a scenario.
            - Keep responses between 30–60 words
            

            CONVERSATION METHOD:
            - Begin naturally, as if this were a real conversation
            - Do not give structured paragraph instructions
            - Do not simulate committee language
            - Keep tone realistic for the scenario
            - Encourage elaboration with a single follow-up question
            `;
    }

    /* ---------- MARKDOWN ---------- */
    const renderMarkdown = (text = "") => {
        if (!text) return null;

        // Escape HTML básico
        let safe = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");

        const tables = [];
        let tableIndex = 0;

        // ---------- TABLES ----------
        const tableRegex = /((\|.+\|\n)+)/g;
        safe = safe.replace(tableRegex, block => {
            const rows = block.trim().split("\n");
            if (rows.length < 3) return block;

            const header = rows[0].split("|").slice(1, -1).map(c =>
                 parseInlineMarkdown(c.trim())
            );
            const body = rows.slice(2).map(r =>
                 r.split("|").slice(1, -1).map(c =>
                        parseInlineMarkdown(c.trim())
                 )
            );

            const tableHtml = `
<div class="overflow-x-auto my-4">
    <table class="min-w-full border rounded-lg text-sm">
        <thead>
            <tr>
                ${header.map(h =>
                `<th class="px-3 py-2 bg-slate-100 font-bold border-b">${h}</th>`
            ).join("")}
            </tr>
        </thead>
        <tbody>
            ${body.map(row => `
                <tr>
                    ${row.map(cell =>
                `<td class="px-3 py-2 border-b">${cell}</td>`
            ).join("")}
                </tr>
            `).join("")}
        </tbody>
    </table>
</div>`.trim();

            tables.push(tableHtml);
            return `__TABLE_${tableIndex++}__`;
        });

        // ---------- HEADERS ----------
        safe = safe.replace(
            /^### (.*$)/gm,
            '<h3 class="text-lg font-black text-[#11457E] mt-4 mb-2">$1</h3>'
        );

        // ---------- BOLD / ITALIC ----------
        safe = safe.replace(
            /\*\*(.*?)\*\*/g,
            '<strong class="font-black text-[#11457E]">$1</strong>'
        );
        safe = safe.replace(/\*(.*?)\*/g, "<em>$1</em>");

        // ---------- LINE BREAKS (TEXT ONLY) ----------
        safe = safe.replace(/\n/g, "<br/>");

        // ---------- RESTORE TABLES ----------
        tables.forEach((table, i) => {
            safe = safe.replace(`__TABLE_${i}__`, table);
        });

        return <span dangerouslySetInnerHTML={{ __html: safe }} />;
    };


    const parseInlineMarkdown = (text) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-[#11457E]">$1</strong>')
            .replace(/\*(.*?)\*/g, "<em>$1</em>");
    };

    const checkCurrentChat = async () => {
        const chat = chatHistory.find(h => h.id === currentChat.id);
        if(chat){
            setCurrentChat(chat);
            return;
        }

        createNewChat();
    }



    const addMessageToChat = (message) => {
        const now = Date.now();

        setChatHistory(prevChats => {
            const updatedChats = prevChats.map(chat =>
                chat.id === currentChat.id
                    ? {
                        ...chat,
                        messages: [...chat.messages, { ...message, createdAt: now }],
                        lastMessageAt: now
                    }
                    : chat
            );

            return [...updatedChats].sort(
                (a, b) => (b.lastMessageAt ?? 0) - (a.lastMessageAt ?? 0)
            );
        });
    };



    const currentChatHistoric = () => {
        const chat = chatHistory.find(e => e.id === currentChat?.id);
        return chat?.messages || [];
    };


    /* ---------- SEND MESSAGE ---------- */
    const handleSendMessage = async () => {
        const message = userInput.trim();
        if (!message || isTyping) return;

        setUserInput("");
        setIsTyping(true);

        // Histórico CORRETO (inclui a mensagem atual)
        const messagesForApi =
            currentChatHistoric().length === 0
                ? [
                    {
                        role: "system",
                        content: [{ type: "text", text: getSystemPrompt() }]
                    },
                    {
                        role: "user",
                        content: [{ type: "text", text: message }]
                    }
                ]
                : [
                    {
                        role: "system",
                        content: [{ type: "text", text: getSystemPrompt() }]
                    },
                    ...currentChatHistoric().map(m => ({
                        role: m.role,
                        content: m.text
                    })),
                    {
                        role: "user",
                        content: message
                    }
                ];


        addMessageToChat({ role: "user", text: message });
        const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: "openai/gpt-oss-120b",
                    messages: messagesForApi,
                    temperature: 0.5,
                    max_tokens: 1000
                })
            }
        );

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content
            || "Sorry, something went wrong.";

        addMessageToChat({ role: "assistant", text: reply });

        setIsTyping(false);
    };

    const createNewChat = () => {
        const newId = `chat-${Date.now()}`;
        const date = new Date().toLocaleDateString();
        const newChat = {
            id: newId,
            date: date,
            scenario: null,
            messages: []
        };
        setChatHistory(prev => [newChat, ...prev]);
        setCurrentChat(newChat);
        //sendInitialMessage();
    };

    const handleScenarioSelect = (scenario) => {
        setSelectedScenario(scenario);
    };

    const createNewChatWithScenario = (scenario) => {
        const newId = `chat-${Date.now()}`;
        const date = new Date().toLocaleDateString();

        const newChat = {
            id: newId,
            date: date,
            scenario: scenario,
            messages: []
        };

        setChatHistory(prev => [newChat, ...prev]);
        console.log('newChat', newChat);
        setCurrentChat(newChat);
    };


    useEffect(() => {
        if (!selectedScenario) return;

        const hasCurrentChat = !!currentChat;
        const hasMessages = currentChatHistoric().length > 0;

        if (!hasCurrentChat) {
            createNewChatWithScenario(selectedScenario);
            return;
        }

        if (hasMessages) {
            createNewChatWithScenario(selectedScenario);
            return;
        }

        setCurrentChat(prev => ({
            ...prev,
            scenario: selectedScenario
        }));

    }, [selectedScenario]);

    useEffect(() => {
        if (!currentChat) return;
        const hasScenario = !!currentChat.scenario;
        const hasMessages = currentChatHistoric().length > 0;
        console.log('test', hasMessages)
        if (hasScenario && !hasMessages) {
            sendInitialScenarioMessage(currentChat);
        }

    }, [currentChat?.id]);


    const sendInitialScenarioMessage = async (chat) => {
        if (!chat?.scenario) return;
        if (chat.messages.length > 0) return;

        setIsTyping(true);

        const messagesForApi = [
            {
                role: "system",
                content: getSystemPrompt()
            }
        ];

        const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: "openai/gpt-oss-120b",
                    messages: messagesForApi,
                    temperature: 0.7,
                    max_tokens: 600
                })
            }
        );

        const data = await response.json();
        const reply =
            data.choices?.[0]?.message?.content ||
            "Let's begin.";

        addMessageToChat({
            role: "assistant",
            text: reply
        });

        setIsTyping(false);
    };

    useEffect(() => {
        console.log('new value', currentChat);
    }, [currentChat]);


    /* ---------- UI ---------- */
    return (
        <div className="h-screen flex flex-col bg-white overflow-hidden">
            <div
                className={`absolute inset-y-0 left-0 w-72 bg-slate-900 z-50 transform transition-transform duration-300 ${isHistoryOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl`}>
                <div className="p-6 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-2">
                            <History className="w-4 h-4 text-[#D71920]"/> History</h3>
                        <button onClick={() => setIsHistoryOpen(false)}
                                className="text-slate-500 hover:text-white transition-colors"><X className="w-5 h-5"/>
                        </button>
                    </div>

                    <button
                        onClick={() => {
                            createNewChat();
                            setIsHistoryOpen(false);
                        }}
                        className="w-full bg-[#11457E] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 transition-all mb-8 shadow-lg shadow-blue-900/40"
                    >
                        <PlusCircle className="w-4 h-4"/> New Session
                    </button>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                        {chatHistory.map(chat => (
                            <button
                                key={chat.id}
                                onClick={() => {
                                    setCurrentChat(chat);
                                    setIsHistoryOpen(false);
                                }}
                                className={`w-full p-4 rounded-xl text-left transition-all border bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                            >
                                <span
                                    className="text-[9px] font-black uppercase opacity-60 block mb-1">{chat.date}</span>
                                <span
                                    className="text-xs font-bold truncate block">{chat.messages[chat.messages.length - 1]?.text.substring(0, 30)}...</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <header className="p-6 border-b flex justify-between items-center">
                <div className="flex gap-4 items-center">
                    <button onClick={() => setIsHistoryOpen(true)}
                            className="p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors shadow-inner">
                        <History className="w-6 h-6 text-[#11457E]"/>
                    </button>
                    <div className={`flex transition-opacity duration-500 ease-in-out ${isHistoryOpen ? 'opacity-0' : 'opacity-100'}`}>
                        <div className="w-20 h-20">
                            <img src={Catharina} alt={'Teacher Catharina'}/>
                        </div>
                        <div>
                            <h3 className="font-black text-lg">Teacher Catharina</h3>
                            <span className="text-xs text-blue-600">
                            Level: {userProfile.level}
                        </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-4">
                    <AddContextButton
                        onSelect={handleScenarioSelect}
                        currentScenario={currentChat?.scenario ?? null}
                    />
                    <button onClick={() => navigate("/dashboard")}>
                        <X/>
                    </button>
                </div>
            </header>

            <div ref={scrollRef} className="flex-1 overflow-y-auto bg-slate-50">
                <div className="max-w-3xl mx-auto p-6 space-y-4">
                    {currentChatHistoric().map((msg, i) => (
                        <div
                            key={i}
                            className={`flex ${
                                msg.role === "user"
                                    ? "justify-end"
                                    : "justify-start"
                            }`}
                        >
                            <div
                                className={`px-5 py-3 rounded-2xl max-w-[85%] ${
                                    msg.isInitial
                                        ? "bg-blue-50 border border-blue-200"
                                        : msg.role === "user"
                                            ? "bg-[#D71920] text-white"
                                            : "bg-white border"
                                }`}
                            >
                                {msg.isInitial && (
                                    <div className="text-xs text-blue-600 font-semibold mb-1">
                                        Lesson start
                                    </div>
                                )}
                                {renderMarkdown(msg.text)}
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="text-sm text-slate-500">
                            Catharina is typing…
                        </div>
                    )}
                </div>
            </div>

            <div className="border-t p-4 bg-white">
                <div className="max-w-3xl mx-auto flex gap-3">
                    <textarea
                        value={userInput}
                        onChange={e => setUserInput(e.target.value)}
                        onKeyDown={e =>
                            e.key === "Enter" &&
                            !e.shiftKey &&
                            (e.preventDefault(), handleSendMessage())
                        }
                        className="flex-1 border rounded-xl px-4 py-2 resize-none"
                        placeholder="Type..."
                        disabled={isTyping}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!userInput.trim() || isTyping}
                        className="bg-[#11457E] text-white px-4 rounded-xl"
                    >
                        <Send/>
                    </button>
                </div>
            </div>
        </div>
    );
};
