import Logo from "../../assets/logo.png";
import { Sparkles } from "lucide-react";
import React, { useState } from "react";
import { useContent } from "../../contexts/ContentContext.jsx";
import { useNavigate } from "react-router-dom";

export const OnboardingView = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const navigator = useNavigate();
    const { userProfile, setUserProfile, setSessionTasks, setSessionStories, setReviewTasks, setCurrentLanguage } = useContent();


    // --- GROQ CLOUD API (GRATUITA) INTEGRATION ---
    const generateDynamicSession = async () => {
        setIsGenerating(true);

        // Se não tiver API key, use dados mockados
        if (!import.meta.env.VITE_GROQ_API_KEY) {
            console.warn("No Groq API key found. Using mock data.");
            setTimeout(() => {
                setIsGenerating(false);
            }, 1500);
            return;
        }

        const systemPrompt = `You are a Czech language educational AI engine. 
            Generate a study session for the student ${userProfile.name}, level ${userProfile.level}, time ${userProfile.dailyTime}min.
            Return ONLY a valid JSON with:
            - tasks: 4 varied exercises (types: "active-recall", "sentence-builder", "feynman").
            - stories: 
               - "languageText" MUST be AT LEAST 15 LINES (approx 300 words).
               - Use \\\\n for explicit line breaks.
               - "originalText": Accurate mirror translation of the whole text.
               - Use icon to represent the story
               - 2 stories
            - reviewTasks: ${userProfile.dailyTime} exercises for spaced repetition.
            
            IMPORTANT for sentence-builder:
            - "prompt" is the English sentence.
            - "options" is an array of Czech words.
            - "correctOrder" is an array of Czech words in correct order.
            
            IMPORTANT for active-recall:
            - "prompt" is question
            - "answer" is answer
            - "phonetic" is how to pronunciation that word
            - "explain" is explain
            
            
            Explanations must be in ENGLISH.
            Format: 
            { 
                "tasks": [...], 
                "stories": [
                    {
                        "title" : value,
                        "icon" : value,
                        "languageText" : value,
                        "originalText" : value, (en)
                    }
                ], 
                "reviewTasks": [
                     {
                       "prompt": "ENGLISH word or short phrase",
                       "answer": "CZECH translation",
                       "emoji": "Representative emoji",
                       "explanation": "Brief usage note or gender"
                     }
                ] 
            }
        `;

        try {

            try {

                const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
                    },
                    body: JSON.stringify({
                        model: "openai/gpt-oss-120b",
                        messages: [
                            {
                                role: 'system',
                                content: systemPrompt
                            },
                            {
                                role: 'user',
                                content: `Generate a study session for ${userProfile.name}, level ${userProfile.level}, daily goal ${userProfile.dailyTime} minutes.`
                            }
                        ],
                        temperature: 0.7,
                        max_tokens: 2000,
                        response_format: { type: "json_object" }
                    })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                }

                const result = await response.json();
                const contentJson = result.choices?.[0]?.message?.content;


                console.log("Groq Response:", contentJson);

                const content = JSON.parse(contentJson);

                // Validate and set the content
                if (content.tasks && Array.isArray(content.tasks)) {
                    setSessionTasks(content.tasks);
                } else {
                    console.warn("Tasks array missing or invalid in AI response");
                    setSessionTasks([]);
                }

                if (content.stories && Array.isArray(content.stories)) {
                    setSessionStories(content.stories);
                } else {
                    console.warn("Simulations array missing or invalid in AI response");
                    setSessionStories([]);
                }

                if (content.reviewTasks && Array.isArray(content.reviewTasks)) {
                    setReviewTasks(content.reviewTasks);
                } else {
                    console.warn("Review tasks array missing or invalid in AI response");
                    setReviewTasks([]);
                }
                setUserProfile(prev => ({
                    ...prev,
                    completedOnboarding: true
                }));
                setCurrentLanguage('czech');
                navigator('/dashboard');
            } catch (modelError) {
                console.log(`Model failed:`, modelError);
            }

        } catch (error) {
            console.error("Groq Generation Error:", error);

            if (error.message.includes("rate limit") || error.message.includes("429")) {
                alert("Rate limit exceeded. Please wait a moment and try again. Using mock data for now.");
            } else if (error.message.includes("quota") || error.message.includes("limit")) {
                alert("API quota exceeded. Using mock data for demonstration.");
            } else if (error.message.includes("model_decommissioned") || error.message.includes("deprecated")) {
                alert("Some models are deprecated. Please check the Groq documentation for available models. Using mock data for now.");
            } else {
                alert("Error generating your AI session. Using mock data instead.");
            }

        } finally {
            setIsGenerating(false);
        }
    };

    if (isGenerating) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
                <div className="bg-[#11457E] p-6 rounded-[2.5rem] mb-8 shadow-2xl animate-bounce">
                    <Sparkles className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-3xl font-black text-slate-800 mb-2">Building Your Journey...</h2>
                <p className="text-slate-500 font-bold">Creating exclusive content for {userProfile.level} level</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-10 border border-slate-100 animate-in zoom-in duration-500">
                <div className="flex justify-center mb-8">
                    <img src={Logo} width={250} alt="Czech" />
                </div>
                <h1 className="text-4xl font-black text-center text-slate-800 mb-2 tracking-tighter">ČeštinaToday</h1>
                <p className="text-center text-slate-500 mb-10 font-bold italic">Active Learning for Czech</p>

                <div className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black text-[#11457E] uppercase tracking-[0.2em] mb-2 block">
                            Your Name
                        </label>
                        <input
                            type="text"
                            value={userProfile.name}
                            onChange={e => setUserProfile({ ...userProfile, name: e.target.value })}
                            className="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-[#11457E] outline-none font-bold"
                            placeholder="Ex: Paul"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black text-[#11457E] uppercase tracking-[0.2em] mb-2 block">
                                Level
                            </label>
                            <select
                                value={userProfile.level}
                                onChange={e => setUserProfile({ ...userProfile, level: e.target.value })}
                                className="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-[#11457E] outline-none font-bold bg-white"
                            >
                                <option value="A1">A1 (Beginner)</option>
                                <option value="A2">A2 (Elementary)</option>
                                <option value="B1">B1 (Intermediate)</option>
                                <option value="B2">B2 (Upper-Intermediate)</option>
                                <option value="C1">C1 (Advanced)</option>
                                <option value="C2">C2 (Proficient)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-[#11457E] uppercase tracking-[0.2em] mb-2 block">
                                Daily Goal
                            </label>
                            <select
                                value={userProfile.dailyTime}
                                onChange={e => setUserProfile({ ...userProfile, dailyTime: e.target.value })}
                                className="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-[#11457E] outline-none font-bold bg-white"
                            >
                                <option value="5">5 min</option>
                                <option value="15">15 min</option>
                                <option value="30">30 min</option>
                            </select>
                        </div>
                    </div>
                    <button
                        onClick={() => userProfile.name && generateDynamicSession()}
                        disabled={!userProfile.name}
                        className={`w-full ${userProfile.name ? 'bg-[#D71920] hover:scale-105' : 'bg-gray-400 cursor-not-allowed'} text-white font-black py-5 rounded-[2rem] shadow-xl shadow-red-100 flex items-center justify-center gap-3 transition-transform`}
                    >
                        GENERATE SESSION <Sparkles className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};