import Logo from "../../assets/logo.png";
import { Sparkles } from "lucide-react";
import React, { useState } from "react";
import { useContent } from "../../contexts/ContentContext.jsx";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";

const CZECH_LEVEL_GUIDE = {
    A1: "absolute basics: greetings, numbers, colors, family, basic nouns. Present tense only. No cases yet.",
    A2: "everyday vocabulary, accusative case, simple past (byl/byla), common adjectives, negation.",
    B1: "nominative/accusative/dative cases, verb aspects (perfective vs imperfective), common idioms, future tense.",
    B2: "all 7 cases, complex verb conjugations, conditional mood, passive voice, nuanced vocabulary.",
    C1: "advanced grammar nuances, idiomatic expressions, stylistic variation, formal vs colloquial registers.",
    C2: "native-level mastery: fixed phrases, regional expressions, literary vocabulary, subtle aspect differences.",
};

export const OnboardingView = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const navigator = useNavigate();
    const { userProfile, setUserProfile, setSessionTasks, setSessionStories, setReviewTasks, setCurrentLanguage } = useContent();
    const { userId } = useAuth();


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

        const systemPrompt = `You are an expert Czech language tutor generating a personalized study session.

STUDENT: ${userProfile.name} | LEVEL: ${userProfile.level} | DAILY GOAL: ${userProfile.dailyTime} min

LEVEL FOCUS for ${userProfile.level}: ${CZECH_LEVEL_GUIDE[userProfile.level] || CZECH_LEVEL_GUIDE.A1}

Output ONLY a valid JSON object with this exact structure:
{ "tasks": [...], "stories": [...], "reviewTasks": [...] }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASKS — generate exactly 5 tasks in this order:
  [active-recall, sentence-builder, feynman, error-correction, active-recall]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TYPE 1 — "active-recall"
Purpose: Test vocabulary/grammar recall from English prompt.
Fields:
  type        → "active-recall"
  prompt      → Question in English (e.g. "How do you say 'library' in Czech?")
  answer      → The Czech word or phrase (e.g. "knihovna")
  phonetic    → Phonetic guide (e.g. "[knih-OV-na]")
  explain     → 2–3 sentence explanation in English covering gender, usage, and a grammar tip
  hint        → A subtle clue (e.g. "Starts with K, feminine noun")
  example     → One Czech sentence using the answer, followed by English translation in parentheses

TYPE 2 — "sentence-builder"
Purpose: Reconstruct a Czech sentence from shuffled words.
Fields:
  type         → "sentence-builder"
  prompt       → The English sentence to translate (e.g. "The book is on the table.")
  correctOrder → Array of Czech words/tokens in the EXACT correct order (e.g. ["Kniha", "leží", "na", "stole."])
  options      → The SAME words from correctOrder, shuffled randomly, PLUS 2 distractor words (e.g. ["na", "leží", "stole.", "Kniha", "velká", "doma"])
  grammarNote  → Explanation of the key grammar rule demonstrated (in English)

CRITICAL for sentence-builder: options MUST contain every word in correctOrder (no word can be missing). Add exactly 2 extra distractor words.

TYPE 3 — "feynman"
Purpose: Student explains a concept; compare with expert view.
Fields:
  type       → "feynman"
  prompt     → "Explain [specific Czech grammar concept appropriate for ${userProfile.level}] as if teaching a friend."
  explain    → Clear, thorough expert explanation in English (4–6 sentences)
  keyPoints  → Array of exactly 3 concise key points in English

TYPE 4 — "error-correction"
Purpose: Identify and fix a single grammar error.
Fields:
  type              → "error-correction"
  prompt            → "Find and correct the grammatical error in this Czech sentence:"
  sentence          → A Czech sentence with exactly ONE clear grammar error appropriate for ${userProfile.level}
  correctedSentence → The same sentence with the error fixed (nothing else changed)
  errorExplanation  → Explanation of the specific error and why the correction is correct (in English)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STORIES — generate exactly 2 short Czech stories
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Each story:
  title        → Czech story title
  icon         → Single relevant emoji
  languageText → Czech text, MINIMUM 200 words, use literal \\n for line breaks (not actual newlines)
  originalText → Complete accurate English translation of the Czech text

Stories must use vocabulary and grammar appropriate for level ${userProfile.level}.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REVIEW TASKS — generate exactly 8 spaced-repetition cards
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Each card:
  prompt      → English word, phrase, or grammar concept
  answer      → Czech translation or example
  emoji       → Relevant single emoji
  explanation → One sentence usage note or grammar tip in English

All explanations and notes MUST be written in ENGLISH.
Vocabulary and grammar complexity MUST match level ${userProfile.level}.
Return ONLY the JSON. No markdown fences. No comments. No extra text.`;

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
                                content: `Generate the Czech study session now. Level: ${userProfile.level}. Return only JSON.`
                            }
                        ],
                        temperature: 0.7,
                        max_tokens: 4096,
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
                const tasks = Array.isArray(content.tasks) ? content.tasks : [];
                const stories = Array.isArray(content.stories) ? content.stories : [];
                const reviewTasksData = Array.isArray(content.reviewTasks) ? content.reviewTasks : [];

                if (!tasks.length) console.warn("Tasks array missing or invalid in AI response");
                if (!stories.length) console.warn("Stories array missing or invalid in AI response");
                if (!reviewTasksData.length) console.warn("Review tasks array missing or invalid in AI response");

                const storiesWithIds = await saveLearningSession(userId, 'czech', {
                    tasks,
                    reviewTasks: reviewTasksData,
                    stories,
                });

                setSessionTasks(tasks);
                setSessionStories(storiesWithIds);
                setReviewTasks(reviewTasksData);
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