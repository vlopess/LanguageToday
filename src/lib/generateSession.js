import { callGroq, getGroqApiKey } from './groq.js';
import { getLanguageMeta, supportLanguageName } from './languages.js';

// ─── Generic CEFR level guide (language-agnostic) ─────────────────────────────
// The AI maps this generic description onto the actual grammar of the
// target language (cases, aspects, subjunctive, articles… whatever applies).

export const CEFR_LEVEL_GUIDE = {
    A1: { label: 'Beginner',           focus: 'absolute basics: greetings, numbers, colors, family, the ~100 most common everyday words, simple affirmative sentences, present tense only where the language has one', avoid: 'complex tenses, subordinate clauses, idioms, rare inflections' },
    A2: { label: 'Elementary',         focus: 'everyday vocabulary, simple past and future where they exist, basic questions, common adjectives and adverbs, negation, polite requests', avoid: 'advanced tense contrasts, passive voice, idioms' },
    B1: { label: 'Intermediate',       focus: 'main past/present/future contrasts, modal-like structures, common connectors, high-frequency idioms, expressing opinions, everyday conversations', avoid: 'literary registers, rare mood/subjunctive forms' },
    B2: { label: 'Upper-Intermediate', focus: 'passive voice if it exists, reported speech, conditionals, discourse markers, register control, nuance in vocabulary choice', avoid: 'highly formal or literary registers' },
    C1: { label: 'Advanced',           focus: 'advanced grammar nuances, idiomatic expressions, stylistic variation, hedging language, formal vs colloquial registers, precise collocations', avoid: 'nothing — demand analytical precision' },
    C2: { label: 'Proficient',         focus: 'native-level nuance, idiomatic precision, stylistic register shifts, regional variants, discourse-level coherence, rare collocations', avoid: 'nothing — push the limits of linguistic mastery' },
};

function levelGuide(level) {
    return CEFR_LEVEL_GUIDE[level] || CEFR_LEVEL_GUIDE.B1;
}

// ─── Session generation (generic for ANY target language) ─────────────────────
//
// JSON contract — consumed by LessonModeView / StoryView / FlashcardView.
// DO NOT change field names or array sizes casually:
//   tasks: exactly 5, in order: active-recall, multiple-choice,
//          fill-in-the-blank, translation, active-recall
//   stories: exactly 2  |  reviewTasks: exactly 10

export async function generateStudySession({ targetLanguageName, supportLanguage = 'portuguese', profile }) {
    const supportLang = supportLanguageName(supportLanguage);
    const level = levelGuide(profile.level);
    const lang = targetLanguageName;

    const systemPrompt = `You are an expert ${lang} language tutor creating content for a student whose instruction language is ${supportLang}. Generate a JSON study session with this EXACT structure:
{ "tasks": [5 items], "stories": [2 items], "reviewTasks": [10 items] }

STUDENT: ${profile.name} | LEVEL: ${profile.level} (${level.label}) | DAILY GOAL: ${profile.dailyTime} min
TARGET LANGUAGE: ${lang}
INSTRUCTION LANGUAGE (use it for ALL explanations, prompts, translations and notes): ${supportLang}

CONTENT FOCUS: Adapt this generic description to what is actually relevant in ${lang} grammar at level ${profile.level}: ${level.focus}
STRICTLY AVOID: ${level.avoid}

══════════════════════════════════════
TASKS — exactly 5, in this exact order:
  1. active-recall
  2. multiple-choice
  3. fill-in-the-blank
  4. translation
  5. active-recall
══════════════════════════════════════

TASK TYPE "active-recall":
{
  "type": "active-recall",
  "prompt": "Short question in ${supportLang} asking the student to produce a specific ${lang} word, phrase, or grammar structure.",
  "answer": "THE ${lang.toUpperCase()} WORD OR SHORT PHRASE ONLY. No ${supportLang}. No explanations. Max 6 words.",
  "phonetic": "Pronunciation guide for the ${lang} answer if non-obvious, else empty string",
  "explain": "3-4 sentences in ${supportLang}: what it means, how it is used grammatically, one common mistake speakers of other languages make with it.",
  "hint": "One subtle clue about the answer's form or function, in ${supportLang}.",
  "example": "One complete ${lang} sentence using the answer naturally."
}

TASK TYPE "multiple-choice":
{
  "type": "multiple-choice",
  "prompt": "Question in ${supportLang} testing vocabulary or grammar knowledge. E.g. 'How do you say X in ${lang}?' or 'Which is the correct form of X?'",
  "options": ["correct answer in ${lang}", "wrong option 1", "wrong option 2", "wrong option 3"],
  "correctIndex": 0,
  "explain": "2-3 sentences in ${supportLang}: why the correct answer is right and why the others are wrong."
}
RULES for options:
- Always exactly 4 options
- correctIndex points to the right answer
- Wrong options must be plausible (real ${lang} words, not gibberish)
- Options should be similar in length and complexity

TASK TYPE "fill-in-the-blank":
{
  "type": "fill-in-the-blank",
  "sentence": "A ${lang} sentence with exactly ONE blank marked as ___. Example: 'Jmenuji ___ Jan.'",
  "correctWord": "the word that fills the blank (one word only)",
  "options": ["correctWord", "wrong1", "wrong2", "wrong3"],
  "explain": "2-3 sentences in ${supportLang}: the grammar rule that makes this the correct answer."
}
RULES:
- The sentence must be a real, natural ${lang} sentence
- The blank must be exactly one word
- Always exactly 4 options (including the correct one)
- Distractors must be real ${lang} words that could plausibly fit there

TASK TYPE "translation":
{
  "type": "translation",
  "prompt": "A phrase or short sentence in ${supportLang} to translate into ${lang}. Keep it 3-8 words.",
  "options": ["correct ${lang} translation", "wrong 1", "wrong 2", "wrong 3"],
  "correctIndex": 0,
  "explain": "2-3 sentences in ${supportLang}: grammar notes about the correct translation."
}
RULES:
- Always exactly 4 options
- correctIndex points to the right answer
- Wrong options should be common learner mistakes or plausible alternatives
- Keep it concise

══════════════════════════════════════
STORIES — exactly 2
══════════════════════════════════════
Choose engaging themes: technology, history, psychology, nature, culture, everyday life.
{
  "title": "Engaging title in ${lang}",
  "icon": "single emoji",
  "languageText": "${lang} story, minimum 250 words. Grammar and vocabulary calibrated to level ${profile.level}. Use \\n for paragraph breaks.",
  "originalText": "Complete, accurate ${supportLang} translation of the full ${lang} story above."
}

══════════════════════════════════════
REVIEW TASKS — exactly 10 flashcards (ALWAYS)
══════════════════════════════════════
Focus on vocabulary, collocations, or grammar patterns for level ${profile.level}.
{
  "prompt": "${supportLang} word or phrase to test ${lang} recall",
  "answer": "${lang} equivalent (concise, max 10 words)",
  "emoji": "single relevant emoji",
  "explanation": "One sentence in ${supportLang} explaining usage or a common confusion."
}

VALIDATION CHECKLIST before outputting:
✓ tasks array has exactly 5 items in order: active-recall, multiple-choice, fill-in-the-blank, translation, active-recall
✓ Every multiple-choice and translation has exactly 4 options with correctIndex pointing to the right one
✓ Every fill-in-the-blank has exactly 4 options including correctWord
✓ active-recall answer contains ONLY the ${lang} word/phrase, nothing else
✓ All explanatory text is written in ${supportLang}
✓ stories array has exactly 2 items
✓ reviewTasks array has exactly 10 items
✓ All content is calibrated to level ${profile.level}, using only: ${level.focus}

Return ONLY the JSON object. No markdown. No comments. No text outside JSON.`;

    return callGroq([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate the ${lang} study session now. Level: ${profile.level}. Return only JSON.` },
    ], getGroqApiKey());
}

// Post-process tasks: ensure multiple-choice and translation have valid correctIndex
export function normalizeTasks(tasks) {
    if (!Array.isArray(tasks)) return [];
    return tasks.map(task => {
        if ((task.type === 'multiple-choice' || task.type === 'translation') && Array.isArray(task.options)) {
            const idx = typeof task.correctIndex === 'number' ? task.correctIndex : 0;
            return { ...task, correctIndex: Math.max(0, Math.min(idx, task.options.length - 1)) };
        }
        if (task.type === 'fill-in-the-blank' && Array.isArray(task.options)) {
            if (!task.correctWord && task.options.length > 0) {
                return { ...task, correctWord: task.options[0] };
            }
        }
        return task;
    });
}

/**
 * Backwards-compatible entry point.
 * Returns { tasks, stories, reviewTasks } or throws.
 */
export async function generateAndSaveSession(_userId, language, profile, supportLanguage = 'portuguese') {
    if (!getGroqApiKey()) throw new Error('No GROQ API key');

    const content = await generateStudySession({
        targetLanguageName: getLanguageMeta(language)?.name || language,
        supportLanguage,
        profile,
    });

    const tasks = normalizeTasks(Array.isArray(content.tasks) ? content.tasks : []);
    const stories = (Array.isArray(content.stories) ? content.stories : [])
        .map(s => ({ ...s, id: `local-${Date.now()}-${Math.random().toString(36).slice(2)}` }));
    const reviewTasks =
        Array.isArray(content.reviewTasks)   ? content.reviewTasks   :
        Array.isArray(content.review_tasks)  ? content.review_tasks  :
        Array.isArray(content.flashcards)    ? content.flashcards    :
        Array.isArray(content.flashcardTasks)? content.flashcardTasks: [];

    return { tasks, stories, reviewTasks };
}
