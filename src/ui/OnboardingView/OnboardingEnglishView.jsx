import Logo from "../../assets/logo_en.png";
import { Sparkles } from "lucide-react";
import React, { useState } from "react";
import { useContent } from "../../contexts/ContentContext.jsx";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";

const ENGLISH_LEVEL_GUIDE = {
    A1: { label: "Beginner",           focus: "simple present, basic vocabulary (100 most common words), affirmative sentences, greetings.",                                                      avoid: "complex tenses, subordinate clauses, idioms" },
    A2: { label: "Elementary",         focus: "simple past, future with 'going to', basic questions, common adjectives and adverbs.",                                                             avoid: "conditionals, passive voice, advanced vocabulary" },
    B1: { label: "Intermediate",       focus: "present perfect, first conditional, modal verbs (can/could/should/must), common phrasal verbs.",                                                   avoid: "inversion, mixed conditionals, advanced collocations" },
    B2: { label: "Upper-Intermediate", focus: "passive voice, reported speech, second and third conditionals, phrasal verbs, discourse markers.",                                                 avoid: "complex inversion, nominalization, highly formal registers" },
    C1: { label: "Advanced",           focus: "inversion, mixed conditionals, modal perfects, nominalization, subjunctive, hedging language, advanced collocations.",                             avoid: "nothing — demand analytical precision" },
    C2: { label: "Proficient",         focus: "native-level nuance, idiomatic precision, stylistic register shifts, rare collocations, discourse-level coherence.",                               avoid: "nothing — push limits of language mastery" },
};

export const OnboardingEnglishView = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const navigator = useNavigate();
    const { userProfile, setUserProfile, setSessionTasks, setSessionStories, setReviewTasks, setCurrentLanguage } = useContent();
    const { userId } = useAuth();

    // --- GROQ CLOUD API INTEGRATION ---
    const generateDynamicSession = async () => {
        setIsGenerating(true);

        if (!import.meta.env.VITE_GROQ_API_KEY) {
            console.warn("No Groq API key found. Using mock data.");
            setTimeout(() => setIsGenerating(false), 1500);
            return;
        }

        const level = ENGLISH_LEVEL_GUIDE[userProfile.level] || ENGLISH_LEVEL_GUIDE.B1;

        const systemPrompt = `You are an expert English language tutor generating a structured study session.

STUDENT: ${userProfile.name} | LEVEL: ${userProfile.level} (${level.label}) | DAILY GOAL: ${userProfile.dailyTime} min

CONTENT FOCUS for ${userProfile.level}: ${level.focus}
AVOID: ${level.avoid}

Output ONLY a valid JSON object: { “tasks”: [...], “stories”: [...], “reviewTasks”: [...] }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASKS — generate exactly 5 tasks in this order:
  [active-recall, sentence-builder, feynman, error-correction, active-recall]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TYPE 1 — “active-recall”
Purpose: Test recall of a grammar structure or vocabulary item.
Fields:
  type     → “active-recall”
  prompt   → Question in Portuguese asking the student to produce an English structure/word
  answer   → The correct English answer (a word, phrase, or sentence fragment)
  phonetic → Phonetic transcription if pronunciation is tricky (IPA or simple guide), else “”
  explain  → 3–4 sentence explanation in English covering meaning, usage, and a common mistake to avoid
  hint     → A subtle clue about the answer's form or function (e.g. “An inversion starting with 'Rarely...'”)
  example  → A complete English sentence showcasing the answer in a realistic context

TYPE 2 — “sentence-builder”
Purpose: Reconstruct an English sentence from shuffled words.
Fields:
  type         → “sentence-builder”
  prompt       → The sentence in Portuguese that the student must translate into English
  correctOrder → Array of English tokens in the EXACT correct order (e.g. [“Not”, “only”, “did”, “she”, “refuse,”, “but”, “she”, “also”, “filed”, “a”, “complaint.”])
  options      → The SAME tokens from correctOrder shuffled randomly, PLUS 2 distractor words that don't belong (e.g. [“she”, “Not”, “refuse,”, “filed”, “only”, “also”, “but”, “a”, “did”, “complaint.”, “she”, “quickly”, “because”])
  grammarNote  → Explanation of the key grammar structure used (in English)

CRITICAL: options MUST include every single token from correctOrder (no omissions). Add exactly 2 distractor tokens.
For ${userProfile.level}: the sentence must use grammar from the CONTENT FOCUS above.

TYPE 3 — “feynman”
Purpose: Student explains a concept in their own words, then compares with expert view.
Fields:
  type      → “feynman”
  prompt    → “Explain [specific grammar/vocabulary concept for ${userProfile.level}] in your own words, as if teaching someone.”
  explain   → Thorough expert explanation in English (5–7 sentences, cover the concept deeply)
  keyPoints → Exactly 3 bullet points summarizing the most important aspects

TYPE 4 — “error-correction”
Purpose: Identify and fix a grammar error at level ${userProfile.level}.
Fields:
  type              → “error-correction”
  prompt            → “Find and correct the grammatical error in this sentence:”
  sentence          → An English sentence with exactly ONE grammar error appropriate for ${userProfile.level}
  correctedSentence → Identical sentence with only the error fixed
  errorExplanation  → Explanation of what the error is and the grammar rule that applies (in English)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STORIES — generate exactly 2 stories
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Choose intellectual themes: technology ethics, historical turning point, psychological insight, social dilemma, scientific discovery.
Each story:
  title        → Engaging English title
  icon         → Single relevant emoji
  languageText → English story, MINIMUM 250 words. Use grammar from level ${userProfile.level} throughout. Use literal \\n for line breaks.
  originalText → Complete accurate Portuguese translation of the full story

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REVIEW TASKS — generate exactly 10 spaced-repetition cards
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Focus on: vocabulary collocations, phrasal verbs, discourse markers, or grammar patterns appropriate for ${userProfile.level}.
Each card:
  prompt      → English word, collocation, or structure prompt
  answer      → Portuguese equivalent or correct English usage
  emoji       → Single relevant emoji
  explanation → One clear sentence in English explaining usage or common confusion

All content MUST be calibrated to level ${userProfile.level}.
Return ONLY the JSON. No markdown. No comments. No extra text outside the JSON.`;

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
                        { role: 'system', content: systemPrompt },
                        {
                            role: 'user',
                            content: `Generate the English study session now. Level: ${userProfile.level}. Return only JSON.`
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 4096,
                    response_format: { type: "json_object" }
                })
            });

            const result = await response.json();
            const contentJson = result.choices?.[0]?.message?.content;
            const content = JSON.parse(contentJson);

            const tasks = Array.isArray(content.tasks) ? content.tasks : [];
            const stories = Array.isArray(content.stories) ? content.stories : [];
            const reviewTasksData = Array.isArray(content.reviewTasks) ? content.reviewTasks : [];

            const storiesWithIds = await saveLearningSession(userId, 'english', {
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
            setCurrentLanguage('english');
            navigator('/dashboard');

        } catch (error) {
            console.error("Groq Generation Error:", error);
            alert("Error generating your English session. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    if (isGenerating) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
                <div className="bg-[#1E3A8A] p-6 rounded-[2.5rem] mb-8 shadow-2xl animate-bounce">
                    <Sparkles className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-3xl font-black text-slate-800 mb-2">
                    Building Your English Journey...
                </h2>
                <p className="text-slate-500 font-bold">
                    Creating exclusive content for {userProfile.level} level
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-white">
            <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-10 border border-slate-100">
                <div className="flex justify-center mb-8">
                    <img src={Logo} width={220} alt="English Learning Platform" />
                </div>

                <h1 className="text-4xl font-black text-center text-slate-800 mb-2 tracking-tighter">
                    English Fluency Lab
                </h1>

                <p className="text-center text-slate-500 mb-10 font-bold italic">
                    Structured English Learning with AI
                </p>

                <div className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black text-blue-700 uppercase tracking-[0.2em] mb-2 block">
                            Your Name
                        </label>
                        <input
                            type="text"
                            value={userProfile.name}
                            onChange={e => setUserProfile({ ...userProfile, name: e.target.value })}
                            className="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-blue-700 outline-none font-bold"
                            placeholder="Ex: Maria"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black text-blue-700 uppercase tracking-[0.2em] mb-2 block">
                                Level
                            </label>
                            <select
                                value={userProfile.level}
                                onChange={e => setUserProfile({ ...userProfile, level: e.target.value })}
                                className="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-blue-700 outline-none font-bold bg-white"
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
                            <label className="text-[10px] font-black text-blue-700 uppercase tracking-[0.2em] mb-2 block">
                                Daily Goal
                            </label>
                            <select
                                value={userProfile.dailyTime}
                                onChange={e => setUserProfile({ ...userProfile, dailyTime: e.target.value })}
                                className="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-blue-700 outline-none font-bold bg-white"
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
                        className={`w-full ${
                            userProfile.name
                                ? 'bg-blue-700 hover:scale-105'
                                : 'bg-gray-400 cursor-not-allowed'
                        } text-white font-black py-5 rounded-[2rem] shadow-xl flex items-center justify-center gap-3 transition-transform`}
                    >
                        GENERATE ENGLISH SESSION <Sparkles className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};
