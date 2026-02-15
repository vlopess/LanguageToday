import Logo from "../../assets/logo_en.png";
import { Sparkles } from "lucide-react";
import React, { useState } from "react";
import { useContent } from "../../contexts/ContentContext.jsx";
import { useNavigate } from "react-router-dom";

export const OnboardingEnglishView = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const navigator = useNavigate();
    const { userProfile, setUserProfile, setSessionTasks, setSessionStories, setReviewTasks, setCurrentLanguage } = useContent();

    // --- GROQ CLOUD API INTEGRATION ---
    const generateDynamicSession = async () => {
        setIsGenerating(true);

        if (!import.meta.env.VITE_GROQ_API_KEY) {
            console.warn("No Groq API key found. Using mock data.");
            setTimeout(() => setIsGenerating(false), 1500);
            return;
        }

        const systemPrompt = `
You are an Advanced English Language Cognitive Training Engine.

This is NOT a beginner session.
The student does NOT want basic vocabulary.
Everything must be intellectually demanding.

Student profile:
- Name: ${userProfile.name}
- Level: ${userProfile.level}
- Daily study time: ${userProfile.dailyTime} minutes

GOAL:
Generate a HIGH-LEVEL English training session (C1–C2).
Assume the student already masters basic grammar and common vocabulary.

ABSOLUTE RULES:

1) DO NOT use:
- Basic daily vocabulary (e.g., house, food, job, family, happy, sad, big, small, etc.)
- Simple present-only sentences
- A1/A2 grammar
- Generic travel or restaurant dialogues

2) MUST include:
- Advanced connectors (Notwithstanding, Albeit, Whereas, Henceforth, Insofar as...)
- Inversion structures (Rarely have I..., Not only did..., Under no circumstances...)
- Mixed conditionals
- Modal nuance (might have, should have been, would rather...)
- Nominalization (implementation, deterioration, acquisition...)
- Phrasal verbs with nuance (phase out, bring about, carry out, rule out...)
- Subjunctive (It is imperative that he be...)
- Reduced relative clauses
- Hedging language (arguably, ostensibly, to a certain extent...)
- Complex clause embedding

-----------------------------------
TASK STRUCTURE
-----------------------------------

Return ONLY valid JSON.

{
  "tasks": [...],
  "stories": [...],
  "reviewTasks": [...]
}

-----------------------------------
TASKS (4 total – all complex)
-----------------------------------

Use types:
• "active-recall"
• "sentence-builder"
• "feynman"

Each task MUST:
- Demand analytical thinking
- Focus on advanced grammar or discourse
- Avoid trivial vocabulary

For "sentence-builder":
- prompt = complex sentence in Portuguese
- options = shuffled sophisticated English words
- correctOrder = grammatically advanced final sentence

Sentence must include at least:
- 1 inversion OR
- 1 conditional OR
- 1 modal perfect OR
- 1 embedded clause

For "active-recall":
- prompt = conceptual grammar question in Portuguese
- answer = advanced English sentence
- phonetic = pronunciation guidance
- explain = deep grammar explanation in English

For "feynman":
- prompt = abstract concept (e.g., “Explain the difference between epistemology and ontology in English.”)
- answer = structured advanced explanation

-----------------------------------
STORIES (2 total)
-----------------------------------

Each story MUST:
- Be at least 20 lines (~400+ words)
- Use advanced vocabulary naturally
- Include discourse markers
- Include at least:
    • 2 inversions
    • 2 modal perfect forms
    • 1 mixed conditional
    • 1 reduced relative clause
    • 1 subjunctive structure
- Use \\n for line breaks
- Include emoji icon
- Include full accurate Portuguese translation in "originalText"

Themes must be intellectual:
- Ethics of artificial intelligence
- Economic collapse scenario
- Philosophical dilemma
- Political instability
- Psychological paradox
- Scientific breakthrough controversy

-----------------------------------
REVIEW TASKS
-----------------------------------

Generate ${userProfile.dailyTime} advanced spaced-repetition items.

Each review item MUST:
- Focus on collocations, phrasal verbs, discourse markers, or advanced structures
- Avoid single basic word translations
- Include usage explanation in English
- Include emoji

-----------------------------------
STRICT OUTPUT RULE
-----------------------------------
Return ONLY raw JSON.
No markdown.
No explanations.
No comments.
No extra text.
`;

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
                            content: `Generate a complete English study session for level ${userProfile.level}.`
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 2000,
                    response_format: { type: "json_object" }
                })
            });

            const result = await response.json();
            const contentJson = result.choices?.[0]?.message?.content;
            const content = JSON.parse(contentJson);

            setSessionTasks(Array.isArray(content.tasks) ? content.tasks : []);
            setSessionStories(Array.isArray(content.stories) ? content.stories : []);
            setReviewTasks(Array.isArray(content.reviewTasks) ? content.reviewTasks : []);

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
